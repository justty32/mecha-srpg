# 任務：實作營運層勢力作戰核心與勢力間外交（切線 1＋2：ops-war-core、ops-diplomacy）並補最小起始內容

> 領導 `lead-impl-war` 寫給 codex 工人 `cx-war-core`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。spec（`wf/workflows/planning/specs/ops/`）：`data-model-operations-war.md`、`data-model-diplomacy.md`、`operations-kinds.json`、`diplomacy-drivers.json`、`time-and-tick.md`、`war-testing.md`、`data-model-faction-rnd.md`（只看型別與內容佈局，研發推進不是你做）、`mercenary-contracts.md`（只看 `merc` 欄與 hook 需求，參戰不是你做）、`world-grid/README.md`（`Loc` 定義）。程式：`src/ops/state/types.ts`、`src/ops/time/tick.ts`、`src/ops/world/{index,actions,rifts,nodes,travel}.ts`、`src/ops/content/{load,check,start,opseffect,cond,worlddb}.ts`、`src/ops/sim/{campaign,cli,invariants,policies}.ts`。機體目錄：`wf/workflows/dispatch/handoffs/lead-content-mech/catalog.json`（`類別` 為「血統」「機體」的列＝血統與機型的來源資料，用 `python3 wf/tools/tabledb.py` 或 python 讀，不整份貼進 context）。

## 背景與唯一目標

營運層現在只有裂縫、契約、船務；勢力不會自己打仗、彼此沒有外交。**唯一目標：照 spec 讓勢力有常備軍、會自己發起並抽象結算十種作戰、彼此有關係值／離散態／條約／驅動，世界在玩家 idle 時自己演化；並替後續兩條線（參戰 merc、研發 rnd）留好型別與 hook。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **新模組 `src/ops/war/`**：`types.ts`（本線與後續線要用的全部新型別：`Loc`、`ForceUnit`、`ForceState`、`OperationDef`、`OperationState`、`Phase`、`ShellState`、`RelState`、`Relation`、`TreatyDef`、`TreatyState`、`LineageDef`、`ModelDef`、`ModelState`、`JoinTerms`、`SupplyTier`、`FactionRnd`——照 spec 欄位）、`loc.ts`、`forces.ts`、`operations.ts`、`resolve.ts`、`relations.ts`、`treaties.ts`、`drivers.ts`、`state.ts`（開局建 war 狀態）、`index.ts`（對外匯出與 tick 入口）、`merc-hook.ts`、`rnd.ts`（後兩個見第 7 點）。
2. **`Loc` 集中**：**只有 `war/loc.ts` 知道「`Loc.region`＝節點 id」**。至少提供 `nodeLoc(ctx, node)`（`map` 由 `NodeDef.body` 映到 world-grid 的圖 id：earth→`map/longland`、moon→`continents.json` 裡月面那張的 id）、`locNode(loc)`、`sameRegion(a, b)`、`marchStep(s, ctx, force)`（沿 `shortestPath` 路線按天數推進，`pos` 永遠在同一張 `map`）。其他 war 檔一律經它，不直接拿 `region` 當節點用。方格大地圖實作線之後只改這個檔。
3. **狀態只加可選欄**（不改既有欄位語意，別線 lead-ui-ops／lead-mcp 會讀 `CampaignState`）：`CampaignState` 加 `relations?`、`operations?`（id→OperationState）、`shells?`（id→ShellState）、`models?`（id→ModelState）、`warRng?: RngState`；`FactionState` 加 `forces?`、`shells?`、`ops?`、`prestige?`、`rnd?`。沒有 war 內容的 pack（測試 fixture）→ war 全部略過、行為與現在相同。開局在 `newCampaign` 末尾呼叫一次 `initWar`（`content/start.ts` 只加這一行呼叫）。
4. **RNG**：作戰結算、驅動、war 行動牌全部用 `s.warRng`（由開局 seed 決定性導出，例如 `createRng(seed ^ 0x5741)`），**不消耗 `s.rng`**——讓既有契約／遭遇的隨機流與平衡不被打亂。
5. **行動牌分線**：作戰、宣戰、簽約、停火牌是 `WorldActionDef`（`actor:"faction"`）加可選欄 `lane: "war"`。`actionsDaily2` 跳過 `lane:"war"` 的牌（既有牌照舊，契約發包頻率不變）；war 線每勢力每天另抽一張 war 牌（用 `warRng`）。新 OpsEffect：`startOperation`、`opProgress`、`transferNode`、`transferShell`、`relation`、`treaty`、`declareWar`、`leakModel`、`forceLoss`（照 spec「後果詞彙」，`declareWar` 是領導補的，用來給 casus belli）。
6. **tick 第 2 段**：既有 `riftsDaily2 → pressureDaily2 → nodesDaily2 → actionsDaily2` 的相對順序不動，插入：`riftsDaily2` 之後 2b 外交日結、2c 作戰推進；`actionsDaily2` 之後 2d war 牌；段末 2f 研發（呼叫 `rnd.ts` 的 `rndMonthly2f`，每潮月第 1 天）。每段內按 id 字典序。`RelationChanged` 只在第 2 段發。
7. **給後續線的 hook（你建檔、放 stub、寫好呼叫點，別人填）**：`war/merc-hook.ts` 匯出 `onMuster(s, ctx, op)`（作戰進 muster 時呼叫；stub 什麼都不做）、`playerEngages(s, ctx, op): boolean`（engage 日先問它，true 就跳過抽象結算；stub 回 false）、`onOperationEnd(s, ctx, op)`（aftermath 結束、failed、aborted 時呼叫；stub 空）。`war/rnd.ts` 匯出 `rndMonthly2f(s, ctx)`（stub 空）、`onOperationSuccess(s, ctx, op)`（stub 空；之後放隊長機與流出檢定）、`leakModel(s, ctx, model, by?)`（stub：只發 `TechLeaked` 事件）、`factionModelPool(s, ctx, faction): Id[]`（**你實作簡版**：`s.factions[f].rnd?.released` 有值就用，否則取 `models/` 中 `maker` 為該勢力或 `generic:true`、且 `availableFrom.month ≤ 當前潮月` 的機型；補員與開局 roster 都經它）。
8. **作戰**：`OperationDef` 照 spec 與 `operations-kinds.json`；階段機 muster→march→engage→resolve→aftermath；抽象結算是純函式 `resolveEngage(op, rng) → op'`（spec 公式照抄，可表格測試）；終止條件三種；成功／失敗後果走 OpsEffect；同時進行上限 state 2、其他 1；`requiresRelation`；圍堵只在大潮前 5 天發起、大潮日 engage；裂獸目標 `enemyStr` 由裂縫寬度／深度／錨齡算、大潮回補；攻堅成功要真的改 `RiftState.phase`（`setRift`→unanchored），奪點成功要寫 `NodeTransferred`（`NodeState.ownerOverride`、雙方 `territoryNow`）。
9. **外交**：每對活人類勢力一筆 `Relation`（鍵 `a|b`、a<b），**玩家不在表內**（玩家只用 `rep`；開局所屬的 `faction/migrant-crew` 若是玩家自家船團，排除在外——你查 `content/` 與 spec 判斷，判斷寫 REPORT）；裂獸類勢力（tags 含 `kaiju`）不進表。滯後六態、`war` 需 casus belli、`allied` 需 `alliance` 條約；七種條約；驅動表 17 列中**不涉及玩家的 13 列**你實作（`player-*` 四列留給 merc 線，但 `Relation`／`rep` 的 API 要讓它能呼叫）；防退化三道閘。
10. **內容（全是新檔）**：`content/base/world/operations/`（10 種，各一檔）、`treaties/`（7 種）、`forces/replenish.json`、`affinity.json`、`lineages/`（catalog 的 9 條血統）、`models/`（catalog 每台**機械系**機體一筆 ModelDef，`frame` 指 `content/base/frames/` 已 commit 的檔；`availableFrom` 依 catalog「登場時期」換算——開場前已有＝`{month:0}`、「第 N 潮月左右」＝`{month:N}`、「某事件後」＝`{event: …}`；隊長機 `role:"captain"`）、`factions-ops/` 新增人類勢力（`faction/` 下已有 10 個；至少讓 6 個人類勢力有 ops 定義、territory、`roster:[{model,count}]`）、`actions/war-*.json`（war 線牌）、必要時 `nodes/`＋`routes/` 新檔（讓勢力有地盤可奪；最多新增 6 節點）。殼：非通用血統各一個 `ShellState`（`holder` 為該血統開局持有勢力）＋至少一個在遺跡節點的殼（`holder:{ruin}`，給尋殼作戰）；`ShellState.frame` 只能指已 commit 的 `ancient-*` frame（目前只有 `frame/ancient-rearguard`；其他先用它佔位並在 REPORT 列出）。既有檔一律不改，只有 `factions-ops/` 既有三檔可加 `roster` 欄。
11. **載入與檢查**：`content/load.ts` 的 `WORLD_FOLDERS` 加 `operations`、`treaties`、`lineages`、`models`、`forces`，單檔 `affinity`；`types.ts` 的 `WorldDefByKind` 加對應 kind；`content/check.ts` 加：引用存在、`ModelDef.frame` 存在且 `cls:"mechanical"`、`requires` 無環、血統 holder 是活勢力、每個 war 勢力至少抽得到一型。
12. **CLI**：`src/ops/sim/cli.ts` 每潮月那行後面加：`作戰=3 war=1 allied=2 釋出=14 join=0` 這種格式（作戰＝進行中作戰數、war／allied＝對數、釋出＝全世界已釋出機型數、join＝玩家 join 契約累計數）（後兩個目前可為 0）。

## 範圍（排除法寫死）

- 只做：`src/ops/war/`（新）、`src/ops/state/types.ts`（只加型別與可選欄）、`src/ops/time/tick.ts`、`src/ops/world/{index,actions}.ts`（插 hook、lane 過濾）、`src/ops/content/{load,check,start,opseffect,cond}.ts`（只加）、`src/ops/sim/{cli,invariants}.ts`（只加）、`src/ops/sim/fixtures/campaign-hash.json`（hash 因本線變動時以 `GOLDEN_UPDATE=1` 重產，REPORT 記舊→新）、上述內容新檔、單元測試 `src/ops/war/*.test.ts`。
- 不做：參戰契約（`join`、補給、借機、情境生成第 7 步、`merc` 政策）、研發推進（點數、釋出、市場篩選、流出、隊長機）、黃金戰役 `test/campaigns/`——都是後續線。`src/ops/sortie/`、`src/ops/contracts/`、`src/ops/crew/`、`src/ops/text/` 不改；`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/` 不改；spec 不改；`content/` 除第 10 點外不改。
- 件數 gate：程式檔（新增＋修改）超過 30 個或內容新檔超過 120 個就停下回報；容量 gate：程式 diff 超過 150 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-war-core --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 內容加完後 0 錯 |
| `node src/ops/sim/cli.ts --months 24 --policy idle --seed N` | 世界演化與效能（`time` 量秒數） |
| `npm test`、`npm run typecheck`、`npm run check` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-war-core/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（`content/base/` 其他新檔、`src/ui-adapter/`、`src/mcp/`、`src/rules/`、`src/ops/sortie/run.ts` 的 `sortieBattleSetup` 段等）——**不要碰、不要還原**。開工前基準：`npm test` 509 項中 4 項已紅（`黃金戰役固定指令的事件日誌 hash 相符`、ui-ops 的兩條 seed 3 出戰測試等，是別線半成品）；你只負責不新增紅燈，黃金 hash 依上面規則重產。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`（會毀掉別線未 commit 的改動）；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 2 個（只准為推進正事開，例如分頭寫內容檔）；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 型別、`loc.ts`、狀態初始化、載入與 hook 骨架；`inbox_poll --once`。
2. 作戰：forces、operations、resolve、OpsEffect、tick 2c／2d；單元測試（war-testing「單元・作戰」全部條目）；`inbox_poll --once`。
3. 外交：relations、treaties、drivers、tick 2b；單元測試（war-testing「單元・外交」全部條目，驅動表 13 列各一個最小案例）；`inbox_poll --once`。
4. 內容與檢查；跑 24 潮月 idle（seed 1、2、3），調內容數值直到驗收第 4 條成立；`inbox_poll --once`。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-core/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/war/` 與「範圍」列的改檔 |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/`（第 10 點的新檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-core/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：對外型別變更表、新事件清單、`SPEC-GAP` 清單、三個 seed 的 24 潮月 idle 摘要（每潮月一行）、末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯；`npm run check` 0 錯。
2. `npm test`：除開工前已紅的 4 項（其中黃金 hash 那項若因本線重產而轉綠更好）外無新紅燈；`src/ops/war/*.test.ts` 至少 40 項、全綠。
3. 沒有 war 內容時行為不變：既有 `src/ops/**` 測試（除黃金 hash）不需改斷言就過。
4. `node src/ops/sim/cli.ts --months 24 --policy idle --seed 1`（另跑 seed 2、3）不拋錯，且每個 seed 的 24 潮月內：至少 1 次進 `war`、1 次停火條約、1 次 `NodeTransferred`、1 次 `OperationResolved`；任一天進行中作戰 ∈ [0, 15]、單場 ≤ 45 天；任一天 `war` 對數 ≤ 活勢力對數 × 30%、`allied` ≤ 40%（REPORT 附統計）。
5. 效能：seed 1 的 24 潮月 idle 總時間 ≤ 改前（約 4.2 秒）＋ 3 秒。
6. `Loc` 集中：`grep -rn "\.region" src/ops --include=*.ts` 除 `src/ops/war/loc.ts` 與測試外零命中（REPORT 附指令輸出）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-war-core`。本線團隊：`teams/impl-war`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-war-core --up PROGRESS 'cx-war-core 上線，開始作戰核心與外交' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-war-core --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-core/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

# 任務：讓人類對手遭遇真的生效（EncounterDef 編成欄＋ScenarioGen 生人類敵機），並補護送／獵殺單位 id 與貢獻值源頭求值

> 領導 `lead-gaps-ops` 寫給 codex 工人 `cx-ops-enc`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。背景：`wf/workflows/dispatch/handoffs/lead-content-world/REPORT.md`（「需要決定」第 2 條：人類遭遇 6 份休眠）、`wf/workflows/dispatch/handoffs/lead-rules-fuzz/REPORT.md`（「剩餘工作」第 4 條、ISS-001 裝配欄）。spec：`wf/workflows/planning/specs/ops/battle-interface.md`（generateScenario 步驟）、`world-grid/actors-and-encounters.md`（「band 由 roster 預算」）、`data-model-factions-contracts.md`（競爭獵團、白手套）、`content-format-ops/world.md`。程式：`src/ops/sortie/scenario.ts`、`src/ops/content/{opseffect,check,instantiate}.ts`、`src/ops/state/types.ts`（`EncounterDef`、`ContractTemplate`）、`src/sim/run.ts`（`scenarioToSetup`：情境 `components` 整組取代、沒給就套 `FrameDef.defaultLoadout`；`personStates`；objective `target`→unit id 的翻譯）、`src/core/types-def.ts`（`UnitSpawn`）。

## 背景與唯一目標

`content/base/world/encounters/` 有 6 份人類對手遭遇（`league-blight-checkpoint`、`rival-anvil-carcass`、`rival-saltgull-ambush`、`selene-whiteglove-audit`、`smuggler-farside-ship`、`tide-unshacklers`），但 `EncounterDef` 沒有編成欄，`generateStandardScenario` 只會照 `budgetByGrade` 抽**怪獸**、敵方 slot 固定是 kaiju 勢力——人類遭遇永遠不會出現。另兩個缺口：護送／獵殺目標在戰鬥內沒有單位 id；營運端把未求值的貢獻值（`{product:[…]}`）塞進人物（rules 端目前在匯入時代為求值）。**唯一目標：照 spec 填進 encounters 的人類編成會真的生成人類敵機出戰，契約模板可指定遭遇，且三個缺口各有測試釘住。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **型別（`src/ops/state/types.ts`，只用 patch 追加可選欄，別條線也在同檔追加，不重排、不整檔改寫）**：`EncounterDef` 加 `faction?: Id`（敵方 slot 的 core 勢力 id）與 `units?: EncounterUnit[]`；`EncounterUnit = { frame: Id; pilots?: Id[]; components?: { [slot: string]: Id }; w?: number }`。`ContractTemplate` 加 `encounter?: Id[]`。
2. **語意**：遭遇有 `units` 時，敵方改由編成抽——對 `budgetByGrade` 每一級，從 `units` 中 frame 等級＝該級的條目按 `w`（預設 1）加權抽 `count` 台；`components` 給了就寫進 `UnitSpawn.components`（整組取代），沒給就**不寫**（沿用 `defaultLoadout`）；駕駛從 `pilots`（person def id 池，當**能力模板**）實例化成戰鬥內的新 `PersonState`（id 用 `enemy-{出戰 id}-{序號}`，不得與名冊 id 撞；同一場不重複用同一 def，池不夠才重複），放進 `personStates`。`faction` 給了就當敵方 slot 勢力，否則維持 kaiju。沒有 `units` 的遭遇行為完全不變。不加潮錨。
3. **選遭遇**：契約模板有 `encounter` → 從中挑一份（用契約 id 的穩定雜湊取索引，同一契約重打遇到同一份），**跳過裂縫族路徑**；沒有 `encounter` 也沒有裂縫的非裂縫契約（只指 `target.node`）→ 退回該節點蝕域所屬裂縫族、再退回第一個裂縫族的 shallow，標 `SPEC-GAP`。`contracts/*.json` 的 `encounter` 欄**由同時在跑的 `cx-ops-board` 填**（rival→兩份獵團、smuggle→走私船與聯盟檢查站、escort→解拘者與白手套）；你的測試用測試內自建的模板，不依賴它。
4. **填內容**：在上面 6 份遭遇檔加 `faction` 與 `units`。用既有 core 內容（不新增 frame／person／faction）：frame 照勢力挑（`selene-*`→白手套、`anvil-*`→鐵砧、`longspear-v4-saltgull`→鹽鷗、`tidefaith-redeemer-3`→潮信會、`union-*`→殘聯、`backside-white-night` 等→走私），等級要能湊滿各檔 `budgetByGrade`（湊不滿就調該檔 `budgetByGrade`，記 REPORT）；`pilots` 挑同勢力 tag 的人物 def，**不要用開局名冊與招募池的人物**（`campaign-start/default.json`、`recruit-pools/`）；找不到合適 core 勢力（例：走私者）就選最近的並標 `SPEC-GAP`。至少 2 份示範 `components` 寫法，其餘沿用 `defaultLoadout`。
5. **護送／獵殺單位 id**：契約目標有 `escort` → 在玩家 slot 生成一台被護送單位（從既有 core 內容挑非戰鬥 frame 或 monster；挑不到就該目標退回只 `survive` 並記 REPORT），把它的戰鬥內 id 填進 objective params（讀 `scenarioToSetup` 決定欄位名：`unit`／`units`／`target`）；`killTarget` → 確保敵方有符合 `params.tags` 的單位（獵殺二名怪：A 級帶 `epithet` 的 monster，沒有就加一隻），把 id 填進 params。
6. **貢獻值源頭求值**：`scenario.ts` 天賦樹 mastery 那段（`c.value = { product: [c.value, mastery] }`）改成當場求值成 number；`opseffect.ts` 把效果 def 的 `contribs` 推進目標時（`target.contribs.push({ ...structuredClone(def.contribs[i]!) … })` 那段）改成用 `evalNum` 求值成 number。**只改這兩處**；`opseffect.ts` 的 `mood` 分支與新效果詞彙是 `cx-ops-debt` 的領地，同檔並行，只用 patch、不整檔改寫。
7. **content check**（`src/ops/content/check.ts`）：驗 `EncounterDef.units` 的 frame／pilots／components 存在、component 的 slot 存在於該 frame 的 bodyplan 且型別相符（能重用 `src/content/` 現成的驗證函式就 import，不改它）、`faction` 存在、`ContractTemplate.encounter` 的 id 存在。每條驗證先餵壞輸入證明會紅（testing「綠燈不等於有檢查」）。

## 範圍（排除法寫死）

- 只做：`src/ops/sortie/scenario.ts`、`src/ops/content/opseffect.ts`（只第 6 點那段）、`src/ops/content/check.ts`、`src/ops/state/types.ts`（只第 1 點的可選欄）、`content/base/world/encounters/` 那 6 份、對應測試檔（`src/ops/sortie/*.test.ts`、`src/ops/content/*.test.ts`，新增或只加測試）。
- 不做：`src/ops/sortie/apply.ts`（`cx-ops-fix`）、`src/ops/sortie/operation-scenario.ts`、`src/ops/contracts/`、`src/ops/text/`、`src/ops/content/start.ts`（`cx-ops-board`）、`src/ops/crew/`、`src/ops/world/`、`src/ops/time/`（`cx-ops-debt`、`cx-ops-fix`）、`src/ops/sim/`、`src/ops/war/`、`content/base/world/contracts/`（`cx-ops-board`）、其他 `content/`、`src/core/`、`src/rules/`、`src/sim/`、`src/content/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec。
- 黃金 hash：**不要重產** `src/ops/sim/fixtures/campaign-hash.json`（領導收線時統一重產）；ops 黃金紅燈不算你的紅燈，REPORT 一句話說明本線為何改變它。
- 件數 gate：程式檔（新增＋修改）超過 10 個、或內容檔改動超過 8 個就停下回報；容量 gate：程式 diff 超過 50 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-enc --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 內容改完後 0 錯 |
| `node src/ops/sim/cli.ts --months 12 --policy greedy --seed N` | 回歸 |
| `npm test`、`npm run typecheck`、`npm run check` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-ops-enc/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（同團隊 `cx-ops-fix`、`cx-ops-board`、`cx-ops-debt`、`cx-war-sim`，以及 `lead-ai-objective` 的 `src/ai/`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 型別、選遭遇、編成語意（第 1–3 點）＋單元測試；`inbox_poll --once`。
2. 6 份遭遇填內容、content check（第 4、7 點）；`inbox_poll --once`。
3. 護送／獵殺 id、貢獻值求值（第 5、6 點）；`inbox_poll --once`。
4. 跑驗收、寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-enc/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與內容 | 「範圍」列的路徑 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-enc/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：6 份遭遇 × 勢力 × frame × pilots 表、`EncounterUnit` 欄位說明（給內容作者看的三行）、每份遭遇一場測試戰的勝負與輪數、對外型別變更、末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯；`npm run check` 0 錯。
2. 新測試全綠：6 份人類遭遇各自生成的情境敵方全是該遭遇 `units` 的 frame、slot 勢力＝`faction`、`components` 有給的照給、沒給的不寫；6 份各跑一場 `runBattle`（固定 seed）不拋錯；契約模板 `encounter` 能選中指定遭遇且同一契約兩次生成選同一份；沒有 `units` 的怪獸遭遇生成結果與改前逐位元相同。
3. 新測試全綠：護送與獵殺 objective params 帶得到戰鬥內單位 id；出戰人物所有 `contribs[].value` 都是 number；content check 對壞 frame、壞 component slot、壞 `encounter` id 各回錯（雙向）。
4. `npm test`：`src/ops/**` 無新紅燈（別線造成的、ops 黃金 hash 不算）。
5. `node src/ops/sim/cli.ts --months 12 --policy greedy --seed 1`（另 seed 2、3）與 `--policy idle --seed 1` 印 `OK`。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-enc`。本線團隊：`teams/gaps-ops`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-ops-enc --up PROGRESS 'cx-ops-enc 上線，開始人類遭遇編成' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-enc --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-enc/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

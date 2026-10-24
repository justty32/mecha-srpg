# 任務：實作勢力研發推進（切線 4：ops-rnd）——血統開啟與停研、研發點與釋出、補員權重、市場機型篩選、技術流出、隊長機

> 領導 `lead-impl-war` 寫給 codex 工人 `cx-war-rnd`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。spec（`wf/workflows/planning/specs/ops/`）：`data-model-faction-rnd.md`（全篇，主契約）、`data-model-operations-war.md`（`ShellState`、`leakModel`、tick 2f）、`diplomacy-drivers.json` 的 `tech-leak`／`shell-envy` 兩列、`data-model-economy-research.md`（市場段）、`war-testing.md`（「單元・研發」與黃金 (4)(5)）。前一條線的成果：`wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-core/REPORT.md`。程式：`src/ops/war/`（全部）、`src/ops/world/market.ts`、`src/ops/content/check.ts`、`src/ops/state/types.ts`。內容：`content/base/world/{lineages,models}/`（`cx-war-core` 已依 `wf/workflows/dispatch/handoffs/lead-content-mech/catalog.json` 建好）。

## 背景與唯一目標

作戰核心已有 `ModelDef`／`LineageDef` 內容與 `factionModelPool` 簡版（按 `availableFrom.month` 篩），但世界不會研發。**唯一目標：照 `data-model-faction-rnd.md` 讓每個勢力每潮月第 1 天累積研發點、從可選池挑機型推進並釋出，取殼 2 潮月後開新血統、失殼停研，勝仗擲隊長機，機型池經補員／市場／敵方情境被用，技術流出讓專屬機型進通用池。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **hook 填實**：`src/ops/war/rnd.ts` 的 `rndMonthly2f`、`onOperationSuccess`、`leakModel`、`factionModelPool` 是給你填的（呼叫點已在 tick 2f 與 `war/operations.ts`）；邏輯可拆到新檔 `src/ops/war/{lineages,models}.ts`。除非 REPORT 說明理由，不改 `operations.ts`。
2. **狀態**：`FactionState.rnd`（`FactionRnd`，可選欄已由前線加好）在開局初始化（`released` ＝開局已登場的機型、`lineages` ＝持有的殼對應血統＋通用）；`CampaignState.models`（id→`ModelState`）記 `releasedDay`／`genericSince`／`by`。開局 `released` 由 `availableFrom.month ≤ 0` 與持有血統決定；`month:N` 的機型（通用系列與開局已存在的勢力機）照 spec「首次登場」處理——到月才可被選入佇列，不是到月自動出現。
3. **推進**：照 spec 公式（`income`、`cost`、可選池三條件、加權挑選、`ModelReleased`）；全用 `s.warRng`。研發只在每潮月第 1 天跑（測試斷言）。
4. **血統**：`ShellSeized`（殼 `holder` 變成某勢力）→ 2 潮月後 `LineageOpened`；失殼→該血統對原持有者 `stalled`（已釋出保留、不再出新型）；`shell-envy` 驅動（用前線的 relation API）。
5. **隊長機**：`onOperationSuccess` 擲（量級自定、寫進內容或 `forces/replenish.json` 參數）：同系列最近型號 `mark+1`、`role:"captain"` 的 ModelDef 若內容裡有就用、沒有就不擲；數量恆 1、進該分遣隊。
6. **補員權重**：`factionModelPool` 改成讀 `rnd.released`；補員抽型權重 ∝ `(今 − releasedDay + 28)⁻¹ × tierMult`（舊型多、新型少，隊長機不進補員池）——補員本身在 `war/forces.ts`，**只在它呼叫抽型的那一處接上你的權重函式**（最小改動）。
7. **市場篩選器**：`MarketDef.lists[].items` 允許另一種項目形狀 `{ filter: { lineage?, maker?, tierMax }, weight, stockMax, basePrice? }`（型別加可選聯集成員），`world/market.ts` 刷新時從**可見機型**抽（通用全開、`open` 全開、`licensed` 看節點 owner 與 maker 關係 ≥ friendly、`restricted` 只在 maker 區域；新型上市價 ×1.5、一潮月後回基準）。既有死清單照舊運作、hash 不變。可新增最多 2 個市場內容檔 `content/base/world/markets/war-*.json`（先 `ls`，不得改既有市場檔）。
8. **技術流出 `leakModel`**：照 spec 四來源中你負責的三種（作戰——奪點／襲擾踩到 maker 工坊區域成功時擲 `0.3 × tier 係數`，由 `onOperationSuccess` 判；事件——提供 OpsEffect `leakModel` 已由前線接到 `rnd.ts`，你實作效果本體；條約——`trade` 連續 6 潮月或 `shell-pact` 到期 `licensed→open`）；第四種「玩家轉賣」：`world/market.ts` 的 `cmdTrade` 賣出 `restricted`／`licensed` 機型的機甲時呼叫 `leakModel`＋`maker rep −15`（借來的機甲怎麼標記由 `cx-war-merc` 決定——你只認 `ModelDef`，用機甲 `frame` 反查 `exportPolicy` 非 `open` 的 ModelDef）。
9. **core 可選欄（頂層已裁示採用）**：`src/core/types-def.ts` 的 `FrameDef` 加可選 `series?: string`、`mark?: number`；若 `schemas/` 的 frame schema 拒絕未知欄，就同步加這兩個可選屬性。只新增、不改既有欄、不填任何 frame 內容檔。
10. **檢查**：`content/check.ts` 確認 `requires` 無環、每勢力開局至少一型可抽、市場 filter 引用存在（前線已做的不重做）。
11. **CLI**：`cli.ts` 每潮月那行的 `釋出=` 改成真的全世界已釋出機型數。
12. **前線留給你的市場／條約後果**（`cx-war-core` REPORT G6）：護航成功→目的節點市場補貨＋解除 `priceMods`（前線只留 `war-supplied` 節點旗）；護航失敗→`scarcity` 旗 1 潮月市場少貨；封港→`blockaded` 旗期間該節點 services 停（市場不刷新、不可交易）；`trade` 條約＝兩方市場互列對方可售機型與折價＋研發 `income` +1；`shell-pact`＝兩方都 `LineageOpened`。只動 `world/market.ts`、`war/rnd.ts`、`war/treaties.ts`（只填 trade／shell-pact 條款的效果呼叫）；圍城人口、勢力現金／stock、進貢帳本流**不做**（REPORT 列 SPEC-GAP）。
13. **黃金 hash**：`src/ops/sim/fixtures/campaign-hash.json` 已由領導依 HEAD 內容重產；工作樹裡別線未提交的內容會讓該黃金測試在工作樹變紅——**不要重產它**。

## 範圍（排除法寫死）

- 只做：`src/ops/war/rnd.ts`、`src/ops/war/{lineages,models}.ts`（新）、`src/ops/war/forces.ts`（只接抽型權重那一處）、`src/ops/war/state.ts`（只加 rnd 初始化）、`src/ops/war/treaties.ts`（只第 12 點）、`src/ops/world/market.ts`、`src/ops/state/types.ts`（只加可選欄與 union 成員）、`src/ops/content/check.ts`（只加）、`src/ops/sim/cli.ts`（只改 `釋出=`）、`src/core/types-def.ts`（只加第 9 點兩欄）、`schemas/`（只在第 9 點需要時加兩個可選屬性）、`content/base/world/{lineages,models}/`（可改這兩個資料夾的檔）、`content/base/world/markets/war-*.json`（新，最多 2 個）、單元測試 `src/ops/war/rnd*.test.ts`、`src/ops/world/market.test.ts`（只加測試）。
- 不做：參戰契約、補給、借機、情境生成、`merc` 政策——那是同時在跑的 `cx-war-merc` 的領地，**不要碰 `src/ops/war/merc*.ts`、`src/ops/sortie/`、`src/ops/contracts/`、`src/ops/sim/policies.ts`**；黃金戰役 `test/campaigns/`（下一條線）；`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec、`content/base/frames/`、其他 `content/`。
- 與 `cx-war-merc` 共用的檔（`src/ops/state/types.ts`、`src/ops/content/check.ts`、`src/ops/sim/cli.ts`）：**只做小塊追加、不重排、不重寫既有行**；看到對方的改動不要動它。
- 件數 gate：程式檔（新增＋修改）超過 15 個就停下回報；容量 gate：程式 diff 超過 80 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-war-rnd --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/sim/cli.ts --months 24 --policy idle --seed N` | 研發演化（`釋出=` 隨潮月增加） |
| `node src/ops/content/check.ts content/base` | 內容改完後 0 錯 |
| `npm test`、`npm run typecheck`、`npm run check` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-war-rnd/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（含同時在跑的 `cx-war-merc`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試、照跑你自己的測試檔與 `src/ops/**`，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個（只准為推進正事開）；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 狀態初始化、推進、血統開啟／停研；`inbox_poll --once`。
2. 補員權重、隊長機、技術流出；`inbox_poll --once`。
3. 市場篩選器與玩家轉賣流出；core 兩欄；檢查；`inbox_poll --once`。
4. 跑 24 潮月 idle（seed 1、2、3）；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-rnd/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/war/rnd.ts` 等「範圍」列的檔 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-rnd/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：對外型別變更表、新事件清單、`SPEC-GAP` 清單、seed 1 的 24 潮月每勢力釋出時間線、末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯；`npm run check` 0 錯。
2. `src/ops/war/rnd*.test.ts` 至少 15 項、全綠，涵蓋 war-testing「單元・研發」每一條（`income` 公式、可選池三條件、`leakModel` 後市場可見性、補員舊多新少）＋研發只在每潮月第 1 天＋取殼 2 潮月後 `LineageOpened`＋失殼 `stalled`＋玩家轉賣 restricted 機→`TechLeaked`＋`maker rep −15`。
3. `npm test`：`src/ops/**` 無新紅燈（別線造成的紅燈列名不算）。
4. `node src/ops/sim/cli.ts --months 24 --policy idle --seed 1`（另跑 seed 2、3）不拋錯，每個 seed 至少 4 次 `ModelReleased`，且第 24 潮月的釋出數 ≥ 開局的 1.5 倍（REPORT 附數字）。
5. 既有死清單市場不受影響：`src/ops/world/market.test.ts` 既有測試不改斷言就過。
6. `FrameDef` 只加兩個可選欄：`git diff src/core/types-def.ts` 只有新增行。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-war-rnd`。本線團隊：`teams/impl-war`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-war-rnd --up PROGRESS 'cx-war-rnd 上線，開始勢力研發' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-war-rnd --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-rnd/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

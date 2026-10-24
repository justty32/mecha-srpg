# 任務：營運層地基——`src/ops/state`＋`src/ops/content`＋`content/base/world/` 起始內容

> 領導 `lead-impl-ops` 寫給 codex 工人 `cx-ops-foundation`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（佈局、慣例 §3、繞法 §4），照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md`、spec `wf/workflows/planning/specs/ops/` 全部 10 檔（`constraints-ops.json` 用 `python3 wf/tools/tabledb.py` 查，不整份讀）、core 的 `src/core/{ids,types-def,types-state,rng,numexpr,eventlog}.ts`、`src/content/{loader,contentdb}.ts`、`src/rules/state.ts` 的 `makeUnit`／`makePerson`（只讀，照形狀寫 ops 工廠）——親自讀。

## 背景與唯一目標

營運層 spec 剛定稿，`src/ops/` 是空的。後面三條工人線（world＋contracts、crew、text）要並行寫在你的型別與載入器上，所以**型別要齊、介面要穩**。唯一目標：交出 contract §1 階段 1 的檔案，讓「載入 `content/base` 的 core 內容＋`world/` 營運內容 → 由 `start/default` 建出一個合法 `CampaignState`」在 node 裡跑得通，帳本三條不變量可斷言。

## 範圍（排除法寫死）

- 只做：
  - `src/ops/state/types.ts`：spec 各子檔的**全部**營運型別（CampaignState、Clock、NodeDef／NodeState、RouteDef、RiftState、RiftDef、EncounterDef、ShipDef／ShipState、FerryDef、FactionOpsDef／FactionState、ContractTemplate／ContractState、WorldActionDef、MarketDef、ServiceDef、RecruitPoolDef、BackgroundDef、ResearchDef／ResearchState、JobDef、Job、NamesDef、EventDef、DialogueDef、RoomDef、TemplatesDef、StartDef、Ledger／LedgerEntry／Account、Inventory、RosterState、HangarState、StableState、PenState、Sortie、Screen、OpsCommand 27 動詞、CampaignEvent、OpsEffect、OpsCtx）。core 型別（MechState、PersonState、PoolState、NumExpr、Cond、Grade、Id）**import 不複製**。spec 缺的欄位自己補最小解並標 `SPEC-GAP`。CampaignState 可多加 `idCounter` 之類簿記欄。
  - `src/ops/state/{ledger,events,clock,ids}.ts`：`post`、`foldBalances`、`checkLedger(s): string[]`（三條不變量：折疊相等、外源筆的 `ref` 有對應 CampaignEvent、`stock:*` 非負）；`EVENT_TYPES` 常數表＋`emit`；`clock(day, cal)`；`nextId`。
  - `src/ops/content/{load,worlddb,check,cond,opseffect,instantiate,start}.ts`：讀每個 pack 的 `world/` 子資料夾（多 pack 依 `pack.json` 順序、後到覆寫同 id）；`WorldDB` 唯讀查詢（`get(kind,id)`、`all(kind)`、`require`）；`check.ts` 交叉驗證（路線兩端存在、`terrainPool` 在 core 存在、契約 `issuerKinds` 有勢力匹配、事件 `next` 無斷點、OpsEffect account 合法、`templates/` 覆蓋 `EVENT_TYPES`（缺的算 **warning**）、FactionOpsDef 指的 core faction 不存在算 **warning**、其餘引用 core 內容不存在算 error），並有 CLI：`node src/ops/content/check.ts content/base` 印統計、`OK 0 errors, N warnings` 或 `FAIL`，有錯 exit 1；`cond.ts` 用 core `evalNum`／`evalCond`＋ops 的 ref 根（`campaign.*`、`rift.*`、`faction.*`、`person.*`、`calendar.*`、`debt.*`…自行列表）；`opseffect.ts` 實作 `ledger`／`rep`／`flag`／`mood`／`techHours`／`setNode`／`setRift`／`nameMech`／`applyEffect`，`spawnContract`／`spawnEvent` 只寫進 `s` 的待處理佇列（欄名自訂）由後續模組消化；`instantiate.ts`（contract §4）；`start.ts`：`newCampaign(db, world, startId, seed): CampaignState`。
  - `content/base/world/`：照 content-format-ops 佈局，**每個資料夾至少一檔**、三個單檔、`campaign-start/default.json`。量：節點 8–10（地球、含 1 城邦有市場、1 遺跡、1 渡輪港）、路線 10–14、裂縫族 1（`insect`，用 core 既有 `species/mite`、`nestmother`、`reaper`、`monster/*`）、encounters 2（淺／深）、factions-ops 2–3、contracts 2（clear、seal）、actions 2、ship 房間 6 個 rooms 檔、templates 1 檔。**只能引用 core 已存在的 id**（`ls content/base/` 各子資料夾查；人物例 `person/ren-kasai`、機甲例 `frame/hound-mk2`）。
  - 測試：`src/ops/state/*.test.ts`、`src/ops/content/*.test.ts`。
- 不做：`src/ops/` 下 `world/ contracts/ crew/ text/ time/ sortie/ sim/`（後續工人）；`src/core/`、`src/content/`、`src/rules/`、`src/ai/`、`src/sim/`、`schemas/`、`test/`、`package.json`、`content/base/` 的 `world/` 以外；`legacy/`；`wf/`（你的 REPORT 與 inbox 回報除外）。
- 件數 gate：新增檔合計超過 90 個就停下回報；容量 gate：本線新增內容超過 250 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **16** 個 `test()`：ledger 4（折疊相等；`stock:*` 變負被拒且不記帳；買賣兩筆互填 counter；`checkLedger` 對竄改的 balances 回報錯）、clock 2（dom／phase 對照、改 calendar 週期生效）、ids 1、load＋check 4（base 的 world 0 errors；壞路線端點被抓；事件 `next` 斷點被抓；OpsEffect 非法 account 被抓——後三者用測試內臨時物件或 `/tmp` 內暫存 pack，不改 base）、cond＋opseffect 3、instantiate＋start 2（`newCampaign` 結果可 `JSON.parse(JSON.stringify())` 來回相等且 `checkLedger` 空；開局機甲有 parts 與 pools）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；`npm run check`（core 載入器必須仍 0 錯——它已略過 `world/`）；`npm run typecheck`；`node src/ops/content/check.ts content/base`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-foundation --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `python3 wf/tools/tabledb.py` | 查 `constraints-ops.json` |
| `npm run typecheck`、`npm run check` | 每步完成後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ops-foundation/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內計數不準不算阻塞；`src/ops/` 以外的測試紅（sim 線正在改 `src/sim/`、`test/sim/`）→ 不是你的事、不改。

## 工作

1. 型別 `types.ts`＋`ids.ts`＋`clock.ts`＋`events.ts`＋`ledger.ts` 與其測試；`inbox_poll --once`。
2. `content/base/world/` 起始內容＋`load.ts`＋`worlddb.ts`＋`check.ts`（含 CLI）與測試；`inbox_poll --once`。
3. `cond.ts`、`opseffect.ts`、`instantiate.ts`、`start.ts` 與測試。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/state/`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/content/` |
| 起始內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「對後續工人的介面摘要」（每個匯出函式一行簽名）與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `src/ops/` 0 fail 且恰好 16 個 ops `test()`；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `node src/ops/content/check.ts content/base` exit 0 且印 `OK 0 errors`。
3. `content/base/world/` 每個 content-format-ops 列出的資料夾都至少一檔，且有 `calendar.json`、`ferry.json`、`ship.json`、`campaign-start/default.json`。
4. `grep -rn "src/rules\|src/ai" src/ops/` 0 命中。
5. REPORT 存在且有四段＋介面摘要＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-foundation`。本線團隊：`teams/ops`。上線先發 `wf/tools/inbox_mail.sh cx-ops-foundation --up PROGRESS 'cx-ops-foundation 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-foundation --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

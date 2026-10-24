# 任務：把 ops 的獸欄／馴化／餵養改寫成拘束艙、磨損、族別維持與屍體改裝

> 領導 `lead-ops-bio-balance` 寫給 codex 工人 `cx-bio`。**交接書是唯一契約**：沒寫的授權等於沒有。ops 共用慣例沿用 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md` 的 §2、§3、§5（§6「舊程式不刪、標 TODO」**本線作廢**：本線就是來刪它、換掉它的）。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。spec（唯一真相，親自讀）：`wf/workflows/planning/specs/ops/data-model-beasts.md`（全文）、`data-model-roster-repair.md`、`text-ui-contract.md`、`architecture-ops.md`（事件名、測試 (5)(6)）、`battle-interface.md`、`content-format-ops.md`、`data-model-economy-research.md`；世界觀 `wf/workflows/planning/specs/world/bio-mechs.md`；改動清單 `wf/workflows/dispatch/handoffs/plan-spec-sync/REPORT.md` 第五節「ops 線」。

## 背景與唯一目標

使用者裁示（2026-10-24）：生物系**沒有馴化、餵養、飼料、飢餓、獸欄**；活捕上拘束器硬壓（磨損、掙脫）、族別維持（蟲獸吞屍、異形潮浸、菌絲修剪）、屍體改裝吃核。spec 已改好，`src/ops/` 還是舊的（`src/ops/crew/stable.ts` 與一堆 `TODO(2026-10-24 裁示)`）。唯一目標：讓 ops 實作與 `data-model-beasts.md` 一致，舊的獸欄程式刪掉。

## 範圍（排除法寫死）

- 只做（照 plan-spec-sync REPORT 第五節「ops 線」逐條，下列是對它的補充與定案）：
  - **型別** `src/ops/state/types.ts`、`events.ts`：`PenState`／`StableState` → `BeastState`／`CarcassState`／`RestraintBay`（照 spec 欄位）；`CampaignState.stable` → `restraint`；`capacity.stablePens` → `restraintSlots`；`OpsCommand` `feed` → `{ v:"devour"; beast; amount }`；`Job.kind` 加 `restrain`／`mount`／`embalm`／`prune`；`MarketDef` 的 list kind 刪 `feed` 加 `carcass`；`RosterState.names[]` 加 `kind`（既有古代名字一律 `"title"`）；`Screen.actions[]` 改為 `{ id; label; cmd; group; key?; tooltip?; disabled? }`。事件 `Tamed` 刪，加 `WearWarning`／`BrokeLoose`／`Sustained`／`Stiffened`／`Mounted`（＋你需要的最少幾個，寫 REPORT）。
  - **生物系邏輯**：新檔 `src/ops/crew/restraint.ts` 取代 `stable.ts`（**刪 `stable.ts`**）：匯出 `restraintDaily5`、`cmdDevour`，接進 `src/ops/time/tick.ts` 第 5 段與 `src/ops/time/commands.ts`。磨損每日累加（係數照 spec，受傷 ×1.5）、`wear ≥ 50` 發 `WearWarning`、`wear ≥ 100` 掙脫：推一個 `Prompt` 三選（硬壓／放走／殺，效果照 spec；`choose` 處理走既有 `pendingChoices`／`OpsEffect`，需要新 `OpsEffect` 變體就加在 `types.ts`＋`src/ops/content/opseffect.ts`）。族別維持**只在每潮月第一個大潮日結算一次**：`devour`（`stock:flesh`，量級照 spec；未投 `vitality −25`）、`tide-soak`（船在淺蝕以上節點或與 `anchored` 裂縫同節點則回滿，否則 −20）、`prune`（每潮月自動排一個 `prune` job；未完成則 `myceliumRoom.layers` 增長並發事件）。`vitality ≤ 0` → `Stiffened`，同一位轉 `CarcassState`。族行為 `molt`／`brood`／`mutate` 保留但改用新條件（spec「族行為」）。同調 `bond[person]`：同場出戰每場 +5（數值進內容檔）；注入 `burdenLimit` 若無座位可注入就標 `SPEC-GAP` 只存資料。
  - **工時佇列** `src/ops/crew/workqueue.ts`：`restrain`（完成 `wear → 0`，工時與 `stock:scrap` 隨等級）、`mount`（工時 `base × gradeMult²`、`stock:scrap × k`＋一顆 `stock:core-{grade}`，開工時一次扣、不夠不開；完成 → 新 mech 用 `frames/corpse-{species}.json`、`BeastState{kind:"corpse"}` 占原位、發 `Mounted`）、`embalm`（每潮月；未做則肉／內臟層上限 −10%）、`prune`。
  - **捕獲與屍體**（`src/ops/sortie/apply.ts`）：`captured` → 進拘束艙空位（`BeastState{kind:"live", wear:0, vitality:100}`＋依 `registryPattern` 自動登記號 `names[mech]` `kind:"registry"`；A 級以上且 `MonsterDef.epithet` 有值 → 再寫一筆 `kind:"epithet", by:"wild"`）；無空位照舊留節點殘骸。可拘束族的 `dead` 敵方單位：戰後推 `Prompt` 二選，**選項 1＝拆（現行 LootBundle 行為，必須是第一個）**、選項 2＝留整屍（需空位）。
  - **出戰**（`src/ops/sortie/{validate,scenario}.ts`）：拘束艙內的生物機甲可出戰（不只 `hangar.bays`）；活捕＝無座位、`controlMode:"instinct"`，至少一個拘束裝置已 `install`（族方案照 spec，內容缺就用 `component/shell-pin-restraint` 並寫 SPEC-GAP）；`wear ≥ 50` 時 `instinct` 起始值 `+(wear−50)/2` 注入（需要 `src/sim/`（`session.ts` 除外）或 `src/core/`（**只新增可選欄位**）配合就做最小改動、寫 REPORT）；屍體改裝機出戰同摹機（有駕駛座、無 instinct 池、burden 0）。
  - **命名** `src/ops/crew/names.ts`：小名 `prompt`（`bond ≥ 40` 或出戰滿 10 場，候選從 `names/nick-{family}.json` 抽 3＋自填；自填若無指令入口沿用既有做法並寫 REPORT）；凶名走 `OpsEffect nameMech` 加 `kind`；顯示順序照 spec。
  - **core 內容欄位**：`src/core/types-def.ts` 的 `MonsterDef` 加可選 `epithet?: string`；`schemas/`、`src/content/` 對應最小改動；`content/base/monsters/nestmother-landlord.json` 填二名（spec 例「千囊房東」）。新 `content/base/frames/corpse-{species}.json`：`content/base/species/` 的 4 個物種各一（`cls:"bio"`、無 instinct 池、有駕駛座；bodyplan 不夠就新增 `content/base/bodyplans/` 檔）。
  - **文字層** `src/ops/text/{verbs,parse,format,rooms,render,templates,fixtures}.ts`：`餵`→`投`／`devour`；房間 `stable` → `restraint`；片語鍵 `penCount`／`penHunger` → `beastCount`／`beastWear`（`src/ops/content/cond.ts` 的 ref root `stable` → `restraint`）；render 每個 action 填 `id`／`group`／`key`／`tooltip`，不合法但該讓玩家知道的填 `disabled`；`key` 由新資料檔 `content/base/world/keymap-ops.json`（文法照 text-ui-contract「快捷鍵 Keymap」；載入與「同 context 同鍵」檢查進 `src/ops/content/{load,worlddb,check}.ts`）填。
  - **內容** `content/base/world/`：`rooms/stable.json` → `rooms/restraint.json`（文案去飼料袋、獸欄）、其他房間 exits、`ship.json`（rooms／`restraintSlots`）、`campaign-start/default.json` 刪 `stock:feed`、`markets/*.json` 刪 `feed` 列、`services/crew.json` 刪 feed／hunger／tameDays／stable 鍵（生物係數搬到新 `beasts/{family}.json`：`insect`、`beast`，另加一份 `alien`、`mycelium` 供測試與將來用；欄位：`wearPerDay`、`sustain`、`devour` 量、`registryPattern`、`restrain`／`mount`／`embalm` 工時材料）、`templates/*.json`（新事件）、`dialogues/chen-xiaohai.json` 的「獸欄」topic、新 `names/nick-{family}.json`。
  - 其他被這些改名牽動、只為編譯通過的 `src/ops/**` 檔（`world/market.ts`、`sim/invariants.ts`、`sim/campaign.ts`、`sim/cli.ts`、`content/start.ts` 等）與它們的測試。
  - 測試：見「測試」段；刪掉 `src/ops/crew/crew.test.ts` 裡 3 個 stable 測試；其他既有測試只為改名而改。
- 不做：`src/ui-adapter/`、`e2e/`、`src/sim/session.ts`、`test/sim/session.test.ts`（別線領地）；`src/rules/`、`src/ai/`（除非 instinct 注入非改不可，先發 PROGRESS 問領導）；spec 與 `wf/`（REPORT 與 inbox 除外）；**補彈、營運平衡、`content/base/world/contracts/`、`encounters/`、`components/`、武器數值**（另一條線在做）；地物受損。
- 件數 gate：新增＋修改＋刪除檔合計超過 70 個就停下回報；容量 gate：本線 diff 超過 300 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **10** 個 `test()`，放 `src/ops/crew/restraint.test.ts`（8）與 `src/ops/sortie/` 既有測試檔（2）：
restraint 8：捕獲入艙（live、wear 0、vitality 100、登記號）／A 級捕獲帶二名；每日磨損依等級且 ≥100 推三選、硬壓 wear→60；`restrain` job 完成 wear→0；`cmdDevour` 扣 `stock:flesh` 且 `checkLedger` 空、錯過大潮 vitality −25；vitality 歸零→`Stiffened`、同位轉屍體；`mount` 扣核＋scrap、完成後 corpse 機甲（frame `corpse-*`）；`tide-soak` 回滿／錯過 −20（用測試內合成的 alien 族即可）；`prune` 未完成時菌房 layers 增長。
sortie 2：wear 70 的活捕獸出戰時 instinct 起始值比 wear 0 高 10；屍體改裝機帶駕駛員 `validateSortie` 通過、活捕獸帶座位被拒。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-bio --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 改內容後 |
| `npm run sim:campaign -- --months 12 --policy greedy` | 收尾前確認戰役跑得完 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你在 REPORT 列出檔案清單（含刪除）。
- **黃金**：`src/ops/sim/fixtures/campaign-hash.json` 若因本線改變，用 `GOLDEN_UPDATE=1 node --test src/ops/sim/golden.test.ts` 更新，REPORT 寫為什麼變；規則黃金 `test/golden/` 不得變（變了就是你動到戰鬥，停下回報）。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（刪檔用 `git rm` 或單檔 `rm`，只限本交接書授權刪的舊獸欄檔：`src/ops/crew/stable.ts`、`content/base/world/rooms/stable.json`，其他刪除先問）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞；`src/ui-adapter/` 的紅燈不是你的事、不改。

## 工作

1. 型別、事件、內容檔（beasts、rooms、ship、start、markets、services、keymap-ops）與載入檢查；`inbox_poll --once`。
2. `restraint.ts`、workqueue 四種 job、tick／commands 接線、刪 `stable.ts`；`inbox_poll --once`。
3. sortie（入艙、整屍 prompt、出戰、instinct 注入）、names、corpse frames、`MonsterDef.epithet`；`inbox_poll --once`。
4. 文字層（投、拘束艙、Screen.actions 新欄、keymap）；測試；`grep -rniE 'stable|feed|hunger|taming|tame|餵|飼料|獸欄|馴' src/ops content/base` 清到只剩有正當理由的（列 REPORT）。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bio/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/`（及必要的 `src/core/`、`src/content/`、`src/sim/`、`schemas/`）|
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bio/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單，含刪除）／沒做到或證據不足的／需要決定的事），加三個附表：「ops 對外型別變更」（`Screen`、`OpsCommand`、`CampaignState`、事件名，舊→新）、「SPEC-GAP 清單」、「殘留字樣與理由」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. 沙箱外 `npm test` 0 fail，且新增恰好 10 個 `test()`（由領導重跑）；`npm run typecheck` exit 0；`npm run check` 0 errors。
2. `node src/ops/content/check.ts content/base` exit 0。
3. `npm run sim:campaign -- --months 12 --policy idle` 與 `--policy greedy` 都印 `OK`。
4. `src/ops/crew/stable.ts`、`content/base/world/rooms/stable.json` 不存在；`grep -rn "TODO(2026-10-24" src/` 0 命中。
5. `test/golden/` 無改動；`src/ui-adapter/`、`e2e/`、`src/sim/session.ts` 無本線改動。
6. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bio`。本線團隊：`teams/bio-balance`。上線先發 `wf/tools/inbox_mail.sh cx-bio --up PROGRESS 'cx-bio 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-bio --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bio/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

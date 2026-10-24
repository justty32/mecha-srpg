# 任務：營運層時間與模擬——`src/ops/time`（tick 八段＋指令分派）＋`src/ops/sim`（runCampaign、policy、重播、存檔、CLI）

> 領導 `lead-impl-ops` 寫給 codex 工人 `cx-ops-time`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（§3 慣例、§5 交付形狀），照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md`、四份 REPORT `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-{foundation,world,crew,text}/REPORT.md`（段函式與指令處理清單）、`src/ops/state/types.ts`、`src/ops/{world,contracts,crew,text}/index.ts`；同時在跑的 `cx-ops-sortie` 交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-sortie.md`（只看它的 `runSortie` 簽名）；spec `wf/workflows/planning/specs/ops/time-and-tick.md`、`architecture-ops.md`、`text-ui-contract.md`——親自讀。

## 背景與唯一目標

營運層各模組的段函式與 `cmd*` 已在 main，但還沒有人把它們按日編排。唯一目標：`tick` 八段編排、`applyCommand` 指令分派、`runCampaign` 帶 policy 跑 N 個潮月不拋錯、六條不變量與重播一致可斷言、一份黃金戰役、一支 CLI。

## 使用者新裁示（2026-10-24，優先於 spec）

活捕怪獸**沒有馴化、餵養、飼料、飢餓、獸欄**：tick 段 5 不呼叫任何獸欄／餵食段函式（crew 模組裡標 TODO 的不要接上）；潮月摘要的「獸數」改為「機庫中的生物機甲數」。

## 範圍（排除法寫死）

- 只做：
  - `src/ops/time/tick.ts`：`tick(s, ctx): void` 依 time-and-tick 八段順序呼叫各模組的 段函式（`worldDaily2`、`shipDaily5` 這類，名單見各 REPORT）；段 4 有待選時暫停（剩餘天數進 `s.pendingTicks`）；`advanceDays(s, ctx, n)` 逐日跑全部八段。
  - `src/ops/time/commands.ts`：`applyCommand(s, db, world, cmd, opts?: { battle?: BattleRunner }): { state: CampaignState; events: CampaignEvent[]; result: CmdResult }`——最外層 `structuredClone`、分派到各模組 `cmd*`；本線自己處理 `wait`（呼叫 `advanceDays`）、`choose`（套 Prompt 選項的 OpsEffect、`next` 鏈、命名 prompt、選完續跑 `pendingTicks`）、`sortie`（呼叫注入的 `opts.battle`，沒注入回 `{ok:false,error:"no-battle-runner"}`）、`save`／`load`（記成事件即可，實際檔案在 sim/save）、`help`。`BattleRunner = (s, ctx, sortie) => CmdResult`。
  - `src/ops/time/index.ts`。
  - `src/ops/sim/`：`campaign.ts`（`runCampaign({ db, world, start, seed, months, policy, battle? }) → { state, commands, summary: 每潮月一行 }`；`summary` 欄 cash、debt、人數、獸數、蝕化節點數、裂縫數）、`policies.ts`（`idle`：只 `wait 1`、有 prompt 選 1；`greedy`：接最近一份可接契約、`sail` 到目標、到了 `sortie` 全員、其餘 `wait 1`；`random`：seeded 隨機合法指令，給屬性測試用）、`invariants.ts`（`checkInvariants(s): string[]`——帳本三條（呼叫 `checkLedger`）、引用存在（seat／`boundTo`／`PenState.mech`）、mastery ∈ [0,1]）、`replay.ts`（`replayCampaign(db, world, start, seed, commands, battle?) → CampaignState`；**v1 重播會重跑戰鬥**——戰鬥 seed 由營運 RNG 抽出所以決定性；標 `SPEC-GAP`（spec 寫「重播不重跑戰鬥」））、`save.ts`（`campaignBlob = { start, seed, commands, snapshotHash }` 的序列化／解析／載入時重播校驗）、`battle.ts`（`defaultBattleRunner`：包 `../sortie/index.ts` 的 `runSortie`；**這一檔最後寫**，若當時 `src/ops/sortie/index.ts` 還不存在就前景每 5 分鐘檢查一次、最多 30 分鐘，逾時就讓它回 `{ok:false,error:"sortie-missing"}` 並寫進 REPORT）、`cli.ts`（`node src/ops/sim/cli.ts --start default --months 12 --seed 7 --policy greedy|idle|random [--no-battle]`，印每潮月一行，結尾印 `OK` 或拋錯 exit 1；檔尾 `if (import.meta.main) process.exit(main(process.argv.slice(2)))`）、`fixtures/`（一份黃金戰役：固定開局、seed、30–60 條指令＋事件日誌 hash 檔；`GOLDEN_UPDATE=1` 重產）、`index.ts`。
  - 測試：`src/ops/time/*.test.ts`、`src/ops/sim/*.test.ts`。
- 不做：`src/ops/` 的 `state/ content/ world/ contracts/ crew/ text/ sortie/`（別模組缺函式或有 bug → 在本線寫最小繞法並標 `SPEC-GAP`、寫進 REPORT，不改他人檔）；`src/` 其他目錄、`schemas/`、`test/`、`package.json`（`npm run sim:campaign` 由領導之後加）、`content/`；`legacy/`、`wf/`（REPORT 與 inbox 除外）。
- 件數 gate：新增檔合計超過 25 個就停下回報；容量 gate：本線 diff 超過 150 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **13** 個 `test()`：tick 4（八段順序：同一天事件的段別單調不減；`wait 7` 與七次 `wait 1` 的事件型別序列與 state hash 相同；`pendingChoices` 非空時 day 不前進且 `pendingTicks` 保留、`choose` 後續跑；裂縫 phase 轉移只發生在大潮日或 `BattleResolved` 同日）、commands 2（被拒指令回傳的 state 與輸入深相等；未注入 battle 時 `sortie` 回 `no-battle-runner`）、campaign 3（`idle` 12 潮月不拋錯且每天 `checkInvariants` 空；`greedy`＋假 BattleRunner（直接回 ok、不打）6 潮月不拋錯；`random` × 3 個 seed × 6 潮月不變量全空）、replay＋save 2（同輸入重播 state hash 相等；存檔序列化來回後重播校驗通過）、golden 1（黃金戰役 hash 相符）、cli 1（`main(["--months","2","--policy","idle","--seed","1"])` 回 0）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`；`npm run typecheck`；`npm run check`；`node src/ops/sim/cli.ts --months 12 --seed 7 --policy greedy`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-time --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/sim/cli.ts` | 第 3 步起每次改完 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ops-time/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內計數不準不算阻塞；`src/ops/sortie`（同時在寫）或 `src/sim`、`src/rules`、`test/` 的紅燈 → 不是你的事、不改。模擬跑出別模組的拋錯 → 在 REPORT 附重現（seed、天數、指令），本線用最小繞法讓模擬能繼續，並標 `SPEC-GAP`。

## 工作

1. `tick.ts`、`commands.ts` 與測試；`inbox_poll --once`。
2. `campaign.ts`、`policies.ts`、`invariants.ts` 與測試；`inbox_poll --once`。
3. `replay.ts`、`save.ts`、`cli.ts`、黃金戰役與測試。
4. `battle.ts`（等 sortie）；用 `--policy greedy` 跑 12 潮月記下輸出。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-time/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/time/`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-time/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「greedy 12 潮月的 CLI 輸出」（原樣貼）、「別模組的 bug 與繞法」與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `src/ops/time`＋`src/ops/sim` 0 fail 且恰好 13 個 `test()`；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `node src/ops/sim/cli.ts --months 12 --seed 7 --policy idle` 與 `--policy greedy --no-battle` 都 exit 0 並印 12 行潮月摘要。
3. `grep -rn "src/rules\|src/ai" src/ops/time src/ops/sim` 0 命中；`src/ops/time/`、`src/ops/sim/` 以外無本線改動。
4. `tick`、`applyCommand`、`runCampaign`、`replayCampaign`、`checkInvariants` 從各自 `index.ts` 匯出。
5. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-time`。本線團隊：`teams/ops`。上線先發 `wf/tools/inbox_mail.sh cx-ops-time --up PROGRESS 'cx-ops-time 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-time --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-time/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

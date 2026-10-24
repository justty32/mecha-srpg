# 任務：給 ops 出戰正式的 core／sim 入口（狀態帶入、事件明細、動態情境），並讓營運重播直接套用存下的戰果而不重跑戰鬥

> 領導 `lead-integ-battle` 寫給 codex 工人 `cx-ib-entry`。**交接書是唯一契約**；同目錄 [contract.md](contract.md) 屬本交接書的一部分。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/contract.md`、`wf/workflows/dispatch/handoffs/lead-impl-ops/REPORT.md`（缺口 2–4、6）、`src/ops/sortie/{scenario,run,apply}.ts`、`src/ops/sim/{replay,save,campaign}.ts`、`src/sim/run.ts`、`src/rules/state.ts`（`UnitInit`、`makeUnit`）、`src/rules/flow.ts`（`BattleSetup`、`BattleResult`、`battleResult`）；spec `wf/workflows/planning/specs/ops/battle-interface.md`、`specs/ops/time-and-tick.md`（重播）、`specs/core/rules-battle-flow.md`（BattleResult）——親自讀。

## 背景與唯一目標

ops 出戰現在靠繞法：暫換 `ctx.db` 疊加臨時地圖／人物 Def、部位損傷改差分回寫、控制模式帶不進、計功只看成功指令、重播重跑整場戰鬥（spec 寫「不重跑」）。唯一目標：rules／sim 提供正式入口、ops 改用它並刪掉繞法，營運重播改為套用存下的戰果。

## 範圍（排除法寫死）

- 只做：
  1. **狀態帶入**：`src/rules/state.ts` 的 `UnitInit` 只新增可選欄——部位現況（各部位層 hp／broken、部位 broken）、`controlMode`、單位效果；`persons[]` 項新增可選的人物現況（池、效果、貢獻、士氣、will、屬性基值）。`makeUnit` 依之初始化（沒給就照舊）。
  2. **事件明細**：`BattleResult`（`src/rules/flow.ts`）新增可選 `events?: GameEvent[]`，由 `src/sim/run.ts` 的 `runBattle` 在結果裡填入（或 `RunOptions` 加旗標控制；預設行為由你定，寫進 REPORT）。ops `src/ops/sortie/{run,apply}.ts` 的計功與耗材改讀它，刪掉「從成功指令拼 AbilityUsed」的繞法。
  3. **動態情境入口**：`src/sim/run.ts` 的 `scenarioToSetup` 接受內嵌地圖（例：第二參數可傳 `ScenarioDef & { mapDef?: MapDef }` 或 `opts.map`）與不在 ContentDB 的人物（走第 1 項的人物現況），ops `scenario.ts` 刪掉 `scenarioDB` 疊加與「暫時 PersonDef」繞法，`run.ts` 不再暫換 `ctx.db`。
  4. **重播不重跑**：營運存檔／指令紀錄存每場戰果（`BattleResult` 本體或足以重建的最小資料，寫進 `CampaignState` 或 sortie 指令的紀錄，自行設計，標 `SPEC-GAP` 若 spec 未定）；`src/ops/sim/replay.ts` 的 `replayCampaign` 直接套用存下的戰果、不呼叫 `runBattle`；`save.ts` 跟著改。
  5. 測試：新增恰好 **7** 個 `test()`——UnitInit 部位現況帶入後 `battleResult` 回傳的部位 hp 與帶入值一致（未受攻擊時）；人物現況（池、效果）帶入；controlMode 帶入；`BattleResult.events` 與 `state.log.events` 相同；ops 出戰不再改動 `ctx.db`（出戰前後同一物件且 `ids("map")` 不含 `ops:` 前綴）；重播時以會拋錯的 runner 注入（或 spy 計數）證明 `runBattle` 呼叫 0 次且 state hash 與原跑相同；存檔來回後重播仍相同。
- 不做：效能、AI、目標判定（已由其他工人完成，不改 `src/ai/`、`src/rules/{movement,command,objectives,attack}.ts`）；`src/sim/session.ts`；ops 的獸欄／餵養／飢餓／馴化 `TODO(2026-10-24 裁示)`；`content/`（除非測試必需的最小 fixture，放 `test/`）；spec、`src/ui-adapter/`、`e2e/`、`package.json`、`wf/`（REPORT 除外）。
- 件數 gate：改動檔超過 20 個就停下回報；容量 gate：diff 超過 80 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy` | 每次改完 ops 後 |
| `node src/ops/content/check.ts content/base` | 收尾前 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ib-entry --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；工作目錄是你的 worktree（`-C`）。**不要 commit**，在 REPORT 列檔案清單。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ib-entry/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- **分清錯誤來源**：沙箱拒寫、node 跑不了 → `BLOCKED`；沙箱內測試計數不準不算阻塞。

## 工作

1. 讀完定設計（欄位名、事件明細開關、戰果存放位置），寫進 REPORT。`inbox_poll --once`。
2. 第 1–3 項＋ops 遷移；`npm test` 綠。`inbox_poll --once`。
3. 第 4 項重播；測試。
4. 黃金 hash：行為不變者不准變；ops 黃金戰役若因存檔格式改變而變，寫原因。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-entry/REPORT.md`（主 repo 的路徑），不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | 你的 worktree 內（`-C` 目錄）|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-entry/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「新增欄位表」（型別、欄、可選、語意）、「刪掉的繞法清單」、「黃金 hash 變動表」，末尾加「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. 新增恰好 7 個 `test()` 且 0 fail；worktree 內 `npm test` 0 fail、`npm run typecheck` exit 0、`npm run check` 0 errors、`node src/ops/content/check.ts content/base` exit 0。
2. `grep -n "scenarioDB\|ctx.db = " src/ops/sortie/*.ts` 0 命中（測試檔除外）。
3. `node src/ops/sim/cli.ts --months 12 --seed 7 --policy greedy` 與 `--policy idle` exit 0。
4. `git diff` 中 `src/core/`、`src/rules/` 的型別改動只有新增可選欄（無刪改既有欄、無新增必填欄）。
5. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出與重現。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ib-entry`。本線團隊：`teams/integ-battle`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ib-entry --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。

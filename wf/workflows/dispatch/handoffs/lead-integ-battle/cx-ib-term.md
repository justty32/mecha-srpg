# 任務：讓 ops 出戰會真的交戰並在有限輪內分出結果（hold／escort 依 spec 完成、劣勢不在開場撤離）

> 領導 `lead-integ-battle` 寫給 codex 工人 `cx-ib-term`。**交接書是唯一契約**；同目錄 [contract.md](contract.md) 屬本交接書的一部分。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/contract.md`；spec：`wf/workflows/planning/specs/core/rules-battle-flow.md`（目標與結束）、`specs/core/data-model-world.md`（ScenarioDef／Objective）、`specs/core/rules-attack-resolution.md` §②命中、`specs/ops/battle-interface.md`（seal→hold 核區 N 輪、escort）、`specs/ops/data-model-roster-repair.md`（機甲部件）——親自讀。

## 背景與唯一目標

contract §一.1／§一.3：ops 出戰打不起來（玩家無武器、怪獸命中 5%、hold 永不完成、無輪數上限），而部署欄與撤離欄重疊時 AI 開場就撤。唯一目標：`node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy` 的每場戰鬥都**真的交戰、在有限輪內以 outcome 結束**（不靠 maxSteps），有勝有負，團隊不在 3 潮月內走光。

## 範圍（排除法寫死）

- 只做：
  1. `src/rules/objectives.ts`（＋測試）：`hold`、`escort` 依 spec 實作完成條件；spec 沒寫死的（區域怎麼給、進度怎麼算）選最小解法標 `SPEC-GAP`。建議：`hold { rounds, zone?: Cell[] }`＝`for` 方在 zone 內有 active 單位、zone 內無敵對 active 單位，連續滿 `rounds` 個輪末即完成；無 zone 時以全圖計（等同「撐滿 N 輪且未全滅」）；`role:"anchor"` 等內容參數若在 spec 無定義，就記 SPEC-GAP 並當無 zone。`escort { unit|units }`＝被護送者全部撤離或站上撤離格且存活。進度可存 `RulesRuntime` 新增的**可選**欄（`src/core/types-state.ts` 只新增可選欄）。
  2. 命中：查 spec §②，若 self／無目標能力不該擲命中骰就在 `src/rules/attack.ts` 修（SPEC-GAP 標註）；無駕駛員怪獸的命中屬性走內容：`content/base/species/*.json` 的 `baseAttrsByGrade` 補 `accuracy`／`evasion`（數值參考 `content/base/persons/*.json` 的人類駕駛員 accuracy 50–55，依等級給，寫進 REPORT）。
  3. ops 出戰：`src/ops/sortie/scenario.ts` 部署欄與撤離欄分開（部署 x=1..2、撤離 x=0；敵方部署留在右側）；ops 情境給輪數上限（encounter／契約模板若有欄就用，沒有就用 `content/base` 常數，新增常數名寫進 REPORT）；玩家機甲有武器：`content/base/world/campaign-start/default.json` 的 `mechs` 允許帶部件（例 `{ "frame": "frame/hound-mk2", "components": { "right-weapon": "component/autocannon-30" } }`，舊的純字串仍合法），`src/ops/content/{start,instantiate,load}.ts` 與 world 載入檢查跟著支援。
  4. AI 撤離門檻：新檔 `src/ai/retreat.ts` 放判斷，`src/ai/score.ts` 的 `want()` 只改 `retreat` 那一行去呼叫它；參數走 aiprofile params（`DEFAULTS` 新增，可被 `content/base/aiprofiles/*.json` 覆寫）：至少 `retreatForceRatio`（現值 0.5）、`retreatMinRound`、`retreatDamage`（己方總 hp 損失比例門檻）、交戰判準（己方受過傷或敵我已互相攻擊過）。條件：士氣 breaking／fleeing 照舊立即撤；否則需「已交戰」且（輪數 ≥ retreatMinRound）且（戰力比 < retreatForceRatio 或 受損 ≥ retreatDamage）。
  5. 上述各項的測試（新增 `test()` 合計 6–10 個，放在被改模組旁的 `*.test.ts` 或 `test/`）。
- 不做：效能優化（另一位工人在做，不碰 `src/rules/movement.ts`、`src/rules/command.ts`、`src/rules/state.ts`、`src/ai/agent.ts`、`src/ai/knowledge.ts`、`src/ai/danger.ts`、`src/ai/adapters/`、`src/sim/`、`src/content/`）；`score.ts` 除 `want()` 的 retreat 行與 `DEFAULTS` 新增鍵以外不改；ops 的獸欄／餵養／飢餓／馴化 `TODO(2026-10-24 裁示)` 不碰；spec、`src/ui-adapter/`、`e2e/`、`package.json`、`wf/`（REPORT 除外）。
- 件數 gate：改動檔超過 25 個就停下回報；容量 gate：diff 超過 80 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 3000 2` | 看單場是否以 outcome 結束、幾輪 |
| `node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy` | 驗收主指令（效能線還沒合，單場可能要十幾秒，正常） |
| `node src/sim/measure.ts scenario/rift-edge-nest 1` | 看怪獸命中改動對既有情境的影響 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ib-term --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

要看每場戰果：在 `/tmp/cx-ib-term/` 寫臨時腳本包 `runCampaign` 的 `battle` 參數印 winner／reason／rounds（參考 bench-ops.ts 的寫法），不要改 `src/ops/sim/cli.ts`。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；工作目錄是你的 worktree（`-C`）。**不要 commit**，在 REPORT 列檔案清單。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ib-term/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- **分清錯誤來源**：沙箱拒寫、node 跑不了 → `BLOCKED`；沙箱內測試計數不準不算阻塞。

## 工作

1. 讀 spec 與 contract，寫下 hold／escort／命中／輪數上限的最小解法。`inbox_poll --once`。
2. 依範圍 1–4 實作與測試；每做完一項跑一次 bench-ops 與 `npm test`。`inbox_poll --once`。
3. 跑 greedy 3 潮月與 12 潮月（`--months 12`）、idle 12 潮月，記每場戰果。
4. 重產因行為改變而變動的黃金 hash，逐個寫原因。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-term/REPORT.md`（主 repo 的路徑），不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、內容、測試改動 | 你的 worktree 內（`-C` 目錄）|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-term/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「每場戰果表」（greedy 3／12 潮月：潮月、敵方組成、winner、reason、rounds）、「黃金 hash 變動表」（檔、舊→新、原因）、「新增內容數值與 aiprofile 參數表」、「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. `bench-ops.ts 3000 2` 的 `stopped` 為 `outcome`（不是 `maxSteps`）。
2. `node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy` exit 0，REPORT 戰果表顯示每場都以 outcome 結束、至少一場 player 勝且至少一場非 player 勝；第 3 潮月人數 > 0（若內容強弱使其做不到，REPORT 寫證據與原因，不硬調到過）。
3. `--months 12` 的 idle 與 greedy 都 exit 0。
4. worktree 內 `npm test` 0 fail、`npm run typecheck` exit 0、`npm run check` 0 errors、`node src/ops/content/check.ts content/base` exit 0。
5. REPORT 存在且有四段＋四個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出與重現。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ib-term`。本線團隊：`teams/integ-battle`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ib-term --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。

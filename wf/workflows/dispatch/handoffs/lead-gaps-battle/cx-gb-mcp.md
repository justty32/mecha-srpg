# 任務：降低 agent 用 MCP 打一場的呼叫次數（批次工具），並把 sortie.test 改成不依賴 greedy 的固定指令序列

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-mcp`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。程式：`src/mcp/README.md`（先讀，工具清單）、`src/mcp/{battle,battle-view,tool,schema,campaign}.ts`、`src/mcp/sortie.test.ts`、`src/sim/session.ts`（唯讀，`BattleSession` API）。背景：`wf/workflows/dispatch/handoffs/lead-playtest/REPORT.md`「剩餘工作」3、4。

## 背景與唯一目標

試玩線回報：大地圖一場 agent 每台每回合要 6–8 次呼叫（observe → legal_actions → act move → legal_actions → act 攻擊 → end），成本太高；`src/mcp/sortie.test.ts` 靠營運 greedy 政策找出戰點，政策一改測試就漂。另外情境剛加了可選 `name`／`brief` 欄（`ScenarioDef`），MCP 還沒顯示。**唯一目標：同樣一場戰鬥，agent 的呼叫次數明顯下降，且 sortie 測試穩定。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：
  1. 新工具 `battle_act_many(id, actions[], stopOnReject?=true, observe?=false)`：依序送多個指令（格式同 `battle_act` 的 action），遇拒絕（預設）或戰鬥結束或輪到的不是人類單位就停；回傳每步結果（ok／拒絕原因）、合併事件、AI 推進事件，`observe:true` 時附上與 `battle_observe` 相同的精簡狀態（省一次呼叫）。
  2. `battle_legal_actions` 加 `unit:"all"`（或等價參數）：一次列出**所有輪得到的我方人類單位**的合法動作（大地圖多台時省呼叫）；輸出大小要有上限參數（例如每台可達格最多 N 筆，預設合理值），README 寫明。
  3. 新工具 `battle_step_until_player_choice(id, max?)`（或把等價行為做成 `battle_step_ai` 的 `until:"player"`，二選一，REPORT 說選哪個為何）：推進到下一次輪到人類行動者或戰鬥結束，回 AI 事件摘要。**不得修改 `src/sim/session.ts`**（它的 stepAi 段屬另一條線）；只用它現有的公開 API。
  4. `battle_list_scenarios`、`battle_new`、`battle_observe` 若情境有 `name`／`brief` 就顯示（沒有就照舊）。
  5. `src/mcp/sortie.test.ts`：改成**固定指令序列**找出戰點（寫死 `campaign_act` 的指令清單，不呼叫 greedy 政策）；保留原測試的三個斷言意義（全 AI hash 一致、手打存讀檔一致、出戰中擋其他指令）。
  6. 測試：新工具各至少 1 條（拒絕即停、observe 附帶、all 單位、推進到人類行動）；`e2e.test.ts` hash 仍等於 `runBattle`。
  7. 量測：用 `scenario/badlands-sweep`（128×128）seed 1，寫一支臨時腳本模擬「每台每回合：legal_actions → 移動＋攻擊＋end」的 agent，比較舊工具與新工具完成**第 1 輪玩家全部單位**所需的呼叫次數，REPORT 給數字。
  8. 更新 `src/mcp/README.md`（工具段與「典型流程」加批次寫法；不超過現有長度 +40%）。
- 不做：`src/sim/`（只 import）、`src/rules/`、`src/ai/`、`src/ops/`、`src/ui-adapter/`、`src/content/`、`content/`、`schemas/`；既有工具的參數與輸出不得做破壞性變更（只新增）。
- 件數 gate：改動＋新增檔超過 12 個就停下回報；容量 gate：diff 超過 120 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-mcp --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `node --test --test-isolation=none 'src/mcp/*.test.ts'` | MCP 全部測試（testing-checks「MCP server」列） |
| `node src/mcp/cli.ts serve --socket m.sock`＋`node src/mcp/cli.ts call --socket m.sock 工具名 'JSON'` | 手動試新工具（socket 路徑要短，放臨時目錄） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-mcp/`；臨時檔只放 `/tmp/cx-gb-mcp/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ai/`、`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；讀 README 與 battle.ts；舊工具量測（呼叫次數）；`inbox_poll --once`。
2. 做 1–4＋測試；`inbox_poll --once`。
3. 做 5（sortie.test 固定序列）；`inbox_poll --once`。
4. 新工具量測、README；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-mcp/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/`（battle.ts、battle-view.ts、schema.ts、tool.ts 視需要） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/batch.test.ts`（新）、`src/mcp/sortie.test.ts` |
| 文件 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/README.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-mcp/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test --test-isolation=none 'src/mcp/*.test.ts'` 0 fail（REPORT 附 pass 數）；`npm run typecheck` 0 錯。
2. `src/mcp/sortie.test.ts` 裡沒有 `greedy` 字樣（`grep -c greedy` 為 0），三個原斷言仍在。
3. REPORT 量測表：badlands-sweep seed 1 第 1 輪玩家全部單位，舊工具呼叫數 vs 新工具呼叫數（新的要 ≤ 舊的一半）。
4. README 工具段列出新工具與參數；`bash wf/tools/wf-lint.sh --strict src/mcp` 0 違規。
5. REPORT 存在且有四段＋量測表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-mcp`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-mcp --up PROGRESS 'cx-gb-mcp 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-mcp --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-mcp/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-mcp --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。

# 任務：實作規則層——規則核心、戰鬥結算、人物與戰局流程（spec 切線 3＋4＋5）

> 你是 Opus **領導**線 `lead-impl-rules`，由頂層（主 session Fable）用 Agent tool 派出。你讀 spec 與地基線的匯出介面、切子線、寫子線交接書、派 codex 工人實作、在沙箱外親自跑驗收、合併、commit、收線、回傳。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`（含沙箱兩坑）、`wf/workflows/dispatch/lessons.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/testing.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model/model-quirks.json`；地基：`wf/workflows/dispatch/handoffs/lead-impl-foundation/REPORT.md`（匯出介面一覽與 SPEC-GAP 清單）、`src/core/types-def.ts`、`src/core/types-state.ts`、`src/core/events.ts`、`test/README.md`；spec：`wf/workflows/planning/specs/core/README.md`、`rules-resources-effects.md`、`rules-turn-and-actions.md`、`rules-attack-resolution.md`、`rules-people.md`、`rules-battle-flow.md`、`architecture.md`（事件日誌、決定性、黃金日誌），`constraints.json` 用 `python3 wf/tools/tabledb.py` 查——親自讀。

## 背景與唯一目標

地基已交付：`src/core/`（型別、事件、seeded RNG、數值表達式、事件日誌）與 `src/content/`（載入器、schema、`content/base/` 內容包），`npm test` 38 過、零依賴（node 24 原生跑 TS，**仍不得安裝任何套件**）。唯一目標：**交出 `src/rules/`——spec 切線 3（規則核心：狀態、貢獻值、資源池、效果、掛鉤）、切線 4（戰鬥：回合順序、移動、指令、攻擊、層序列、傳導）、切線 5（人物與流程：士氣、傷勢、意志、控制、戰局流程、目標）**，每條規則有表格驅動測試，關鍵路徑有黃金日誌（固定 seed＋指令序列 → 事件日誌 hash 寫死），AI 線與模擬線之後只依賴這層的匯出。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) `src/rules/{state,contribs,pools,effects,hooks}.ts`＋測試（切線 3，先行）；(2) `src/rules/{turn,movement,command,attack,layers,conduct}.ts`＋層序列表格測試＋ 3 個黃金情境（切線 4）；(3) `src/rules/{morale,injury,will,control,flow,objectives}.ts`＋黃金情境失控／棄機／捕捉各一（切線 5；與 4 並行）；(4) `test/scenarios/*.json`（情境資料）、`test/golden/*.hash`（黃金 hash）、黃金測試執行器 `test/golden.test.ts`；(5) 情境需要而 `content/base/` 缺的內容**可新增檔**（新機甲／部件／能力／效果／地形／怪獸），既有內容檔只准在 REPORT 列明原因後做最小修改；(6) `src/core/`、`src/content/` 只准**新增匯出或新增檔**（不得改既有簽名），每處在 REPORT 列出；(7) `package.json` 只准加 scripts；(8) REPORT。
- 不做：AI（`src/ai/`）、模擬器與重播 CLI（`src/sim/`）、UI；安裝套件；改 spec（矛盾或缺口→程式碼註解 `SPEC-GAP`＋REPORT，自己選最小解）；碰 `legacy/`、`wf/workflows/planning/specs/`、`wf/` 其他檔；數值平衡（用 content 的數字，不在程式碼寫常數）。
- 件數 gate：新檔超過 70 個就停下回報；容量 gate：`test/`＋`content/base/` 超過 3 MB 就停下回報。時間 gate：開工起 180 分鐘內收線，沒做完的切線寫進「沒做到」並保持 `npm test` 綠。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工 `create rules lead-impl-rules`；之後 `add` 每條工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派工人；`-C` 指專案根；交接書用排除法寫死它只准碰的檔案清單與匯出介面 |
| `wf/tools/inbox_poll.sh lead-impl-rules --wait --timeout 540` | 前景等工人；逾時再跑一輪 |
| `python3 wf/tools/brief_lint.py` | 子線交接書送出前 `--strict` 要 0 違規 |
| `python3 wf/tools/tabledb.py` | 查 `constraints.json`，把 rules-* 相關列的 id 寫進對應測試的名稱或註解 |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完文件後跑 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑：`src/rules/`、`test/`、`content/base/`（新增為主）、`src/core/`／`src/content/`（只准新增）、`package.json`（只 scripts）、ROSTER 自己與工人那格、自己的 REPORT 與子線交接書（`wf/workflows/dispatch/handoffs/lead-impl-rules/`）。可跑 `node`、`npm test`、`npm run check`、`npm run NAME`（不含 install）。**可以 commit**：只加明確路徑並用 `git commit -- 路徑` 提交（index 共用），訊息開頭 `rules: `；**驗收與 commit 一律由你在沙箱外做**（codex 沙箱裡 `node --test` 計數不準、`.git` 可能唯讀，工人只回報檔案清單）。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset 別人的 commit；**不 `npm install`／全域安裝**；不 `rm -rf`（暫存搬 `/tmp/lead-impl-rules-trash/`）；不改 `~/.codex/config.toml`；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 4 條 codex 工人＋1 個 Claude 子 agent；工人的 ROSTER 格由你代登記；子線交接書要寫死：匯出介面名稱、測試檔命名、黃金 hash 的算法（沿用 `src/core/eventlog.ts` 既有的）、「不得改既有簽名」。分清錯誤來源：環境出錯（node 跑不動、沙箱擋）→ `BLOCKED`；工人程式碼有 bug → 退回修。

## 工作

1. 讀完先讀清單；ROSTER 追加自己那格；開團隊；先自己定死 `src/rules/` 的對外匯出介面（一個 `src/rules/index.ts` 的簽名草稿）與三條子線的檔案清單，寫三份子線交接書（`cx-rules-core`、`cx-rules-combat`、`cx-rules-people-flow`），brief_lint 過。
2. 先派 `cx-rules-core`；前景等；收到終局後在沙箱外跑 `npm test`、逐條核證據、合併、commit。
3. 並行派 `cx-rules-combat` 與 `cx-rules-people-flow`（兩者只依賴 core 的匯出，各自只碰自己清單內的檔；情境資料檔名前綴區分 `combat-*`／`people-*`）；前景等；核證據、合併、commit；兩線都需要改同一個檔時由你改。
4. 跑 `npm test`、`npm run check`、黃金測試重跑兩次 hash 一致、`wf-lint.sh --strict .`；寫 REPORT：四段＋「匯出介面一覽（給 ai／sim 線用）」＋「黃金情境清單與 hash」＋「SPEC-GAP 清單」＋「對 core／content 的新增」＋「gpt-6-astra 這次觀察到的癖好」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 規則層 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/` |
| 情境與黃金 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/`、`/home/lorkhan/repo/game_dev/mecha-srpg/test/golden/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm test` exit 0，`# pass` ≥ 110、`# fail` 0（地基 38 之外至少新增 72）。
2. `src/rules/` 含切線 3、4、5 列的 17 個檔與 `index.ts`；`src/core/`、`src/content/` 既有匯出簽名未變（`git diff 56117db -- src/core/types-def.ts src/core/types-state.ts src/core/events.ts` 只有新增行）。
3. `test/golden/` 至少 6 個 hash 檔（combat 3、people 3：失控／棄機／捕捉），黃金測試連跑兩次通過；任一情境事件日誌含 `layer` 結算與 `conduct` 傳導事件各至少一筆。
4. `constraints.json` 中 `spec_section` 屬於 rules-* 五檔的每一列，其 id 至少出現在一個 `src/rules/*.test.ts` 或 `test/**/*.test.ts` 裡（grep 可證）。
5. `npm run check` exit 0；`bash wf/tools/wf-lint.sh --strict .` broken=0、residue=0、local=0；`package.json` 仍無依賴、`node_modules` 不存在。
6. `git log --oneline` 含 `rules: ` 開頭 commit，`git status --short` 為空；無殘留 codex 行程、無 `cx-` tmux session；團隊已 close；ROSTER 已標已收線。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的（測試紅、黃金不一致、簽名被改）→ 退回工人或自己修；修不到才 `FAILED`，REPORT 附輸出，且保持 main 上 `npm test` 綠（壞的不 commit）。
- 測不出來（環境擋住、前置介面缺失無法最小解）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

我是 `lead-impl-rules`，團隊 `teams/rules` 的領導。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。工人（codex）走 inbox 回報給你。等工人用**前景**迴圈，不要用結束回合當等待。


## 完成證據（調度者 2026-10-24 收線）

1. `npm test` 164 過 0 敗（兩次）。2. `src/rules/` 17 模組＋`index.ts`；core 既有簽名未變（領導核、調度者抽查）。3. `test/golden/` 6 個 hash（combat-conduct／layers／tenth、people-berserk／capture／eject），黃金測試兩次一致。4. constraints 中 rules-* 31 列 id 全部在測試裡找得到。5. `npm run check` 0 錯；`npm run typecheck` 0 錯（typescript 7.0.2 為唯一 devDependency）；wf-lint TOTAL 全 0。6. commit `4082996`…`3caa014` 共 6 個 `rules: `；本線領地無未提交檔；無殘留行程；團隊已 close。未做：reaction 只有機會攻擊（反擊／掩護／自動開盾待補）、sustained 池見底撤除待補；base 內容缺 13 個常數鍵與步兵／士氣／失控內容，目前靠 `test/scenarios/pack/` 補足。

# 任務：建立 TypeScript 專案地基——核心型別、事件日誌、RNG、數值表達式、內容載入器與第一批 schema（spec 切線 1＋2）

> 你是 Opus **領導**線 `lead-impl-foundation`，由頂層（主 session Fable）用 Agent tool 派出。你讀 spec、切子線、寫子線交接書、派 codex 工人實作、驗收、收線、回傳。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model/model-quirks.json`；然後讀 spec：`wf/workflows/planning/specs/core/README.md`、`architecture.md`、`data-model-people.md`、`data-model-mech.md`、`data-model-abilities-effects.md`、`data-model-world.md`、`content-format.md`、`rules-resources-effects.md`（型別要能承載它），以及 `wf/workflows/dispatch/handoffs/done/2026-10-24/plan-spec-REPORT.md` 的「建議的實作切線」第 1、2 條與 `constraints.json`（用 `python3 wf/tools/tabledb.py` 查）——親自讀。

## 背景與唯一目標

專案重做為網頁文字機甲 SRPG，技術棧純 TypeScript（decisions：邏輯與 DOM 分離、node 內建 test runner）。**node 24 可原生執行 `.ts`（type stripping，已實測 `node x.ts` 可跑）**，所以本線**不安裝任何套件**：沒有 tsc、沒有 vite、沒有 ajv；型別只做文件與編輯器用途，執行與測試靠 `node` 與 `node --test`。唯一目標：**交出其他實作線都要依賴的地基**——`src/core/`（id、定義型別、狀態型別、事件、seeded RNG、數值表達式、事件日誌）與 `src/content/`（loader、registry、schema 驗證、contentdb），加上 `schemas/`、`content/base/registries/`、`content/base/rules/`、content-format 的五個範例落成真檔，測試全綠。

**前置條件**：另一條線 `lead-legacy-archive` 正在把舊 Python 專案搬進 `legacy/`。**在 `test -d legacy && test ! -e src/mecha_srpg` 成立之前，不得在 `src/` 寫任何檔**；這段時間先讀 spec、寫子線交接書、設計檔案清單。用前景迴圈每 60 秒檢查一次，最多等 45 分鐘，逾時發 `BLOCKED`。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 專案骨架：根 `package.json`（`"type":"module"`，scripts：`test`＝`node --test 'src/**/*.test.ts' 'test/**/*.test.ts'` 或等價、`check`＝跑 loader 載入 `content/base/`；**不列任何 dependencies／devDependencies**）、`tsconfig.json`（strict、ESM、`noEmit`，給編輯器）、`.nvmrc`（24）；(2) 切線 1 `src/core/{ids,types-def,types-state,events,rng,numexpr,eventlog}.ts`＋`rng.test.ts`、`numexpr.test.ts`、`eventlog.test.ts`；(3) 切線 2 `src/content/{loader,registry,schema,contentdb}.ts`＋測試、`schemas/*.schema.json`（可由一支 `scripts/gen-schemas.ts` 從型別定義產生，或手寫；二選一寫進 REPORT）、`content/base/registries/*.json`、`content/base/rules/{constants,damage-modifiers,morale-events,injuries}.json`、content-format 五個範例（一台機甲、一個部件、一個駕駛員與一個機魂、一種地形、一族怪獸）落成 `content/base/` 真檔並能被 loader 載入零錯誤；(4) `test/README.md` 一頁說明怎麼跑；(5) REPORT。
- 不做：切線 3 以後（rules／ai／sim／ui）；任何 DOM 或瀏覽器相關；安裝套件；改 spec（spec 有矛盾或缺口→寫進 REPORT「需要決定的事」並在程式碼註解標 `SPEC-GAP`，自己選一個最小解法往下做）；碰 `legacy/`、`wf/workflows/planning/specs/`、`wf/` 其他檔。
- 件數 gate：新檔超過 60 個就停下回報；容量 gate：`content/base/` 超過 2 MB 就停下回報。時間 gate：前置等待不計，開工起 150 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工 `create foundation lead-impl-foundation`；之後 `add` 每條工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派工人；`-C` 指專案根（它要跑 `node --test` 與 commit），交接書用排除法寫死它只准碰的檔案清單 |
| `wf/tools/inbox_poll.sh lead-impl-foundation --wait --timeout 540` | 前景等工人；逾時再跑一輪 |
| `python3 wf/tools/brief_lint.py` | 子線交接書送出前 `--strict` 要 0 違規 |
| `python3 wf/tools/tabledb.py` | 查 `constraints.json`、`adoption.json`、`glossary.json` |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完文件後跑 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑：根 `package.json`／`tsconfig.json`／`.nvmrc`、`src/core/`、`src/content/`、`schemas/`、`scripts/`（只放 gen-schemas）、`content/base/`、`test/`、ROSTER 自己與工人那格、自己的 REPORT 與子線交接書（`wf/workflows/dispatch/handoffs/lead-impl-foundation/`）。可跑 `node`、`node --test`、`npm run NAME`（不含 install）。**可以 commit**：只加明確路徑，訊息開頭 `foundation: `；工人若 `-C` 專案根也可 commit 自己清單內的檔；**不得 `git add -A`、不得收進 `legacy/` 或 `specs/world/`**。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset 別人的 commit；**不 `npm install`／`pnpm add`／全域安裝**；不 `rm -rf`（暫存搬 `/tmp/lead-impl-foundation-trash/`）；不改 `~/.codex/config.toml`；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 4 條 codex 工人＋1 個 Claude 子 agent；工人的 ROSTER 格由你代登記；量測或測試基準寫死在子線交接書（gpt-6-astra 會把上限當目標、會各自選不同基準，見 model-quirks）。分清錯誤來源：工具或環境出錯（node 跑不動 TS、沙箱拒寫）→ `BLOCKED`；工人寫的程式碼有 bug → 退回修，不算阻塞。

## 工作

1. 讀完先讀清單；ROSTER 追加自己那格；開團隊；寫子線交接書（建議 3 條：`cx-core-types`（ids／types／events／eventlog＋測試）、`cx-core-rng-numexpr`（rng／numexpr＋測試，seed 固定輸出寫死在測試裡）、`cx-content`（loader／registry／schema／contentdb＋registries／rules／五範例＋測試）；工人間介面＝types-def／types-state 的匯出名，先由你在交接書裡定死）。
2. 前景等前置條件成立；成立後先自己落 `package.json`／`tsconfig.json`／`.nvmrc` 並 commit，再派工人。
3. 前景等信；收到終局信逐條核證據（親自跑 `npm test`、`npm run check`），`inbox_ack.sh` 歸檔；衝突由你合併。
4. 寫 `test/README.md`；跑 `npm test`、`npm run check`、`wf-lint.sh --strict .`；commit；寫 REPORT：四段＋「匯出介面一覽（給切線 3–9 用）」＋「SPEC-GAP 清單」＋「gpt-6-astra 這次觀察到的癖好」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 專案骨架 | `/home/lorkhan/repo/game_dev/mecha-srpg/package.json`、`tsconfig.json`、`.nvmrc` |
| 核心 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/core/` |
| 內容層 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/content/`、`schemas/`、`content/base/` |
| 測試說明 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/README.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm test` exit 0，且輸出的 `# pass` ≥ 25、`# fail` 0。
2. `npm run check` exit 0：loader 載入 `content/base/` 全部檔案零錯誤，並印出載入的每類內容件數（機甲 ≥ 1、部件 ≥ 1、人物 ≥ 2 含一個機魂、地形 ≥ 1、怪獸族 ≥ 1、registries 與 rules 齊）。
3. `src/core/` 七個檔與 `src/content/` 四個檔都存在；`package.json` 無 `dependencies`／`devDependencies` 鍵或兩者皆為空物件；`ls node_modules` 不存在。
4. `rng.test.ts` 含固定 seed 的期望序列；同一 seed 兩次執行事件日誌 hash 相同（測試或 `npm run check` 證明）。
5. `bash wf/tools/wf-lint.sh --strict .` 輸出中 broken=0、residue=0、local=0。
6. `git log --oneline` 含 `foundation: ` 開頭 commit，`git status --short | grep -v specs/world` 為空；無殘留 codex 行程、無 `cx-` tmux session；團隊已 close；ROSTER 已標已收線。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的（測試紅、loader 報錯）→ 退回工人或自己修；修不到才 `FAILED`，REPORT 附失敗輸出。
- 測不出來（node 無法執行 TS、沙箱擋寫、前置條件逾時）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

我是 `lead-impl-foundation`，團隊 `teams/foundation` 的領導。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。工人（codex）走 inbox 回報給你。等工人與等前置條件都用**前景**迴圈，不要用結束回合當等待。

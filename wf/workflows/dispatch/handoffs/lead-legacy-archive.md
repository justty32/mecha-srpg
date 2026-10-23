# 任務：把舊 Python＋tcod＋C++ 起手專案封存進 `legacy/`，讓專案根與 wf 文件改指向新的網頁版 spec

> 你是 Opus **領導**線 `lead-legacy-archive`，由頂層（主 session Fable）用 Agent tool 派出。這是一條搬移與文件一致性線：量不大但牽一髮動全身，**自己做為主**，最多開 1 條 codex 工人做機械式 grep／改寫。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/refactor/moving-things.md`（搬檔六類會斷的東西）、`wf/workflows/refactor/README.md`、`wf/STRUCTURE.md`（archive 規則）、`wf/workflows/common/user.md`、`wf/workflows/decisions.md`（重做決定）、`wf/workflows/planning/specs/core/README.md` 與 `architecture.md`（新專案的目錄佈局：`src/{core,content,rules,ai,sim,ui-adapter}/`、`content/base/`、`test/scenarios/`、`schemas/`）——親自讀。

## 背景與唯一目標

專案已決定重做為網頁文字 SRPG（純 TypeScript，見 decisions），核心 spec v1 已落在 `wf/workflows/planning/specs/core/`。舊的 Python＋tcod＋C++ 起手專案（`src/mecha_srpg/`、`cpp/`、`docs/` 11 章教學、`pyproject.toml`、`CMakeLists.txt`、`requirements.txt`、舊 `SPEC.md`、`INTEGRATION_NOTES.md`）要原樣封存，騰出 `src/` 給新程式碼。唯一目標：**封存完成且 AGENTS.md 與 wf/ 文件不再把舊棧當現況**——下一條實作線開工時 `src/` 是空的、文件說的是 TS 專案。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 用 `git mv` 把上列舊檔搬進 `legacy/`（保留相對結構：`legacy/src/mecha_srpg/`、`legacy/cpp/`、`legacy/docs/`、`legacy/pyproject.toml`、`legacy/CMakeLists.txt`、`legacy/requirements.txt`、`legacy/SPEC.md`、`legacy/INTEGRATION_NOTES.md`、`legacy/README.md`＝舊 README 原文），並在 `legacy/README.md` 檔頭加一行 `> 封存 2026-10-24，由 wf/workflows/planning/specs/core/README.md 取代（專案重做為網頁版，見 wf/workflows/decisions.md）`；(2) 專案根新寫三個薄檔：`SPEC.md`（一頁：唯一真實來源改為 `wf/workflows/planning/specs/core/`＋`specs/world/`，列出兩個入口與 constraints.json，說明 legacy 在哪）、`PROJECT.md`（新定位：2108 地月機甲戰爭網頁文字 SRPG，技術棧純 TS＋Vite、headless 可測，團隊配置一句指向 team-model，狀態一句）、`README.md`（給人看的 30 秒版：是什麼、怎麼讀 spec、程式碼在哪、legacy 在哪、工作流入口）；(3) 更新 wf 文件把舊棧改成新棧：`AGENTS.md`（一句話定位、鐵律 1 的驗證指令改為 `bash wf/tools/wf-lint.sh --strict .`，程式碼驗證由 testing 定）、`wf/INDEX.md`（Repo 佈局表）、`wf/workflows/common/code-map.md`（改為 spec architecture 的模組邊界，程式碼落地前標「規劃中」）、`wf/workflows/common/conventions.md`（TypeScript：strict、ESM、檔名 kebab-case、識別字英文、註解繁中、不加執行期依賴、純邏輯不碰 DOM；數值與平衡不寫死在程式碼、走 content）、`wf/workflows/dev-env.md`（node 24 原生跑 TS、`node --test`；舊 Python 段移除）、`wf/workflows/testing.md`（驗證表改 `node --test`，程式碼落地前標「待實作線補」）、`wf/workflows/planning.md`、`wf/workflows/common/user.md`（「一定先問」列的 `pip install tcod` 改成一般說法）、`wf/workflows/dispatch/README.md`、`wf/workflows/TEMPLATE.handoff.md`、`wf/workflows/dispatch/tool-index.md`、`wf/workflows/resources.md` 裡提到 `compileall`／`mecha_srpg`／`tcod`／`mtcore`／`pyproject` 的句子；(4) `.claude/commands/` 若有引用舊路徑一併改；(5) REPORT。
- 不做：寫任何新程式碼；碰 `wf/workflows/planning/specs/world/`（另一線現役）；改 design-notes／decisions 的歷史內容；刪任何檔（只搬）；改 `.gitignore`（需要的寫進 REPORT）。
- 件數 gate：改動的 md 超過 25 個就停下回報；容量 gate：無（只搬不產生新大檔）。時間 gate：開工起 45 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 若要開 codex 工人才需要：`create legacy lead-legacy-archive` |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 可選：機械式改寫 wf 文件中的舊棧句子 |
| `wf/tools/inbox_poll.sh lead-legacy-archive --wait --timeout 540` | 有開工人才需要 |
| `python3 wf/tools/fix_moved_links.py` | 搬完後修 md 相對連結（先 `--help`） |
| `bash wf/tools/wf-lint.sh --strict .` | 每批改完跑；最終要 broken=0（specs/world 的在途連結除外） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑：`legacy/`（新建）、專案根 `SPEC.md`／`PROJECT.md`／`README.md`／`INTEGRATION_NOTES.md`／`pyproject.toml`／`CMakeLists.txt`／`requirements.txt`／`src/`／`cpp/`／`docs/`（搬走）、`AGENTS.md`、`.claude/commands/`、上列 wf 文件、ROSTER 自己那格、自己的 REPORT。**可以 commit**：只加明確路徑（`git mv` 已暫存的搬移與你改的檔），一個或數個 commit，訊息開頭 `legacy: `；**不得 `git add -A`、不得把 `wf/workflows/planning/specs/world/` 收進 commit**。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm`（只 `git mv`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 1 條 codex 工人；每個批次邊界跑 `git status --short | grep -E '^(D |.D)'` 要零命中（搬移應顯示為 R 不是 D）。分清錯誤來源：工具出錯→`BLOCKED`；自己改壞連結→自己修。

## 工作

1. 讀完先讀清單；ROSTER 追加自己那格；`git status --short` 確認除了 `specs/world/` 之外工作樹乾淨。
2. `git mv` 搬移；寫 `legacy/README.md` 檔頭；跑 `fix_moved_links.py` 與 `wf-lint.sh` 看斷了什麼。
3. 新寫根三檔；逐檔改 wf 文件（先 grep 列清單再改）；每批跑 lint。
4. commit（明確路徑）；寫 REPORT：四段＋「改了哪些 wf 檔各一句」＋「下一條實作線要知道的事」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-legacy-archive/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 封存區 | `/home/lorkhan/repo/game_dev/mecha-srpg/legacy/` |
| 新根檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/SPEC.md`、`PROJECT.md`、`README.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-legacy-archive/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `test ! -e src/mecha_srpg && test ! -e cpp && test ! -e docs && test -d legacy/src/mecha_srpg && test -d legacy/cpp && test -d legacy/docs` 成立，且 `legacy/README.md` 第一行是封存註記。
2. 專案根 `SPEC.md`、`PROJECT.md`、`README.md` 各 ≤ 4 KB，且都含指向 `wf/workflows/planning/specs/core/README.md` 的連結。
3. `grep -rn 'tcod\|mtcore\|compileall\|mecha_srpg\|pyproject' AGENTS.md wf/INDEX.md wf/workflows/common/code-map.md wf/workflows/common/conventions.md wf/workflows/dev-env.md wf/workflows/testing.md` 0 筆（提到 legacy 的句子用「舊版 Python 專案」字樣，不用這些識別字）。
4. `bash wf/tools/wf-lint.sh --strict .` 輸出中，`BROKEN` 行除了 `wf/workflows/planning/specs/world/` 之外為 0，residue=0、local=0。
5. `git log --oneline -5` 含至少一筆 `legacy: ` 開頭的 commit；`git show --stat HEAD~0..HEAD` 不含 `specs/world/`；`git status --short | grep -v specs/world` 為空。
6. 無殘留 codex 行程、無 `cx-` tmux session；ROSTER 已標已收線。

## 失敗怎麼處置（兩種要分開）

- 改出來 lint 有壞連結 → 自己修到 0，不算失敗。
- 工具或環境出錯（`git mv` 被擋、腳本跑不動）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

我是 `lead-legacy-archive`，團隊 `teams/legacy`（若開工人）或無。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。等工人時用前景 `inbox_poll.sh --wait`，不要用結束回合當等待。

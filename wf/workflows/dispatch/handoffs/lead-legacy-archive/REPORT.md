# REPORT — lead-legacy-archive

STATUS: DONE（驗收 1–4、6 成立；第 5 條的「工作樹乾淨」受並行線影響，見下）

## 做了什麼

- `git mv` 把 `src/mecha_srpg/`、`cpp/`、`docs/`、`pyproject.toml`、`CMakeLists.txt`、`requirements.txt`、`SPEC.md`、`INTEGRATION_NOTES.md`、`README.md` 原樣搬進 `legacy/`（相對結構不變；被 gitignore 的 `__pycache__/` 隨目錄一起搬，沒有 rm）。`src/` 現在不存在／為空。
- `legacy/README.md` 第一行加封存註記（日期照交接書寫 2026-10-24）。
- `fix_moved_links.py --apply`：修了 `legacy/docs/` 三檔指向專案外 `pas/` 與根 `PROJECT.md` 的相對連結；live 檔的舊連結後續手改。
- 新寫根 `SPEC.md`、`PROJECT.md`（覆寫舊版，舊內容在 git 歷史 `d0fa2c7:PROJECT.md`）、`README.md`。
- 改 12 份 wf／根文件的舊棧說法（見下）；`.claude/commands/wf-lint.md` 無舊路徑，未改。
- 沒開 codex 工人，全部自己做。

## 改了哪些 wf 檔（各一句）

- `AGENTS.md`：定位句改 TS 網頁版；設計契約改指 `SPEC.md`→specs/core；鐵律 1 驗證改 `bash wf/tools/wf-lint.sh --strict .`、程式碼驗證交給 testing。
- `wf/INDEX.md`：定位句；Repo 佈局表改 `src/{core,…,ui-adapter}/`、`content/base/`／`schemas/`／`test/scenarios/`、`legacy/`、根三檔、`package.json` 等。
- `wf/workflows/common/code-map.md`：領域表改 spec architecture 的六模組，測試欄標「規劃中」；真相層改 `spec（specs/core）`。
- `wf/workflows/common/conventions.md`：TS strict／ESM、kebab-case、識別字英文註解繁中、不加執行期依賴、純邏輯不碰 DOM、數值走 content、SPEC-GAP（表壓在 1 KB 內）。
- `wf/workflows/dev-env.md`：流程與指令表改 node 24 原生跑 TS、`node --test`；移除 Python／C++／tcod 三列；node 列改為主要執行環境。
- `wf/workflows/testing.md`：驗證表改 `node --test`，完整驗證與實際遊玩標「待實作線補」。
- `wf/workflows/planning.md`：封存 legacy 那列改「已做（2026-10-24）」。
- `wf/workflows/common/user.md`：「一定先問」的 `pip install tcod` 改成一般說法（任何套件管理器的 install）。
- `wf/workflows/dispatch/README.md`：切線範例路徑改 `src/rules/attack/`＋`test/scenarios/`。
- `wf/workflows/TEMPLATE.handoff.md`：可寫程式碼線的驗證改「testing 工作流列的驗證指令」。
- `wf/workflows/dispatch/tool-index.md`：「Python 語法檢查」列改「程式碼測試 `node --test`」。
- `wf/workflows/resources.md`：CPU 列的「編譯 mtcore」改「`node --test` 大批情境」。
- `wf/workflows/inbox/ROSTER.md`：追加自己那格，收線改已收線。

## 產出（絕對路徑）

- `/home/lorkhan/repo/game_dev/mecha-srpg/legacy/`
- `/home/lorkhan/repo/game_dev/mecha-srpg/SPEC.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/PROJECT.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/README.md`
- commit：`2ad701b legacy: 封存註記、根三檔改寫、wf 文件改指向 TS 網頁版`，以及本 REPORT 的收線 commit。

## 沒做到、或證據不足的

- **搬移被別人的 commit 收走**：我 `git mv` 暫存的 40 個 rename 被頂層同時段的 `291587e CLAIMS 精簡` 一起 commit 了（共用 index，那筆不是 `legacy: ` 開頭）。沒回滾（禁 reset／rebase）；內容正確、不含 `specs/world/`，我自己的 `legacy: ` commit 只含其餘 19 檔。
- **驗收 5 的「`git status --short | grep -v specs/world` 為空」**：我的檔全數 commit；但收線時仍有並行線 `lead-impl-foundation` 未 commit 的 `wf/workflows/inbox/ROSTER.md` 修改與 `wf/inbox/teams/`。不是我的領地，沒收。ROSTER 我只 commit 自己那格的狀態行（用 index 只放我的 hunk），不夾帶別人的修改。
- 驗收 6：無 `codex exec` 行程、無 tmux server；`pgrep codex` 只看到使用者自己的 codex-desktop 與 app-server daemon，不是本線開的。
- lint 剩 `OVERSIZE specs/world/mech-lifecycles.md`（另一線在寫）與 `BIGLIST-LINKS legacy/docs/README.md`（warning、封存檔不改）；broken=0、residue=0、local=0。

## 需要決定的事

- `.gitignore` 仍是 Python／C++ 段（`__pycache__`、`build/`、`*.so`…）；建議改成註明「legacy 用」或移除，TS 版可能要加 `coverage/`、`*.tsbuildinfo`。依交接書未碰。
- `legacy/` 是否比照 STRUCTURE 的 archive 規則讓 wf-lint 不下鑽（目前會掃 legacy/docs，產生 BIGLIST-LINKS warning）。
- 交接書要求的封存日期 2026-10-24 與實際搬移日（本機 2026-10-23 22:3x）差一天，照交接書寫。
- `wf/SESSION-LOG.md` 第 16–17 行「spec 定案後封存…」「SPEC.md 改指向」兩項已完成，歸頂層刪。
- 舊 `PROJECT.md` 沒進 legacy（不在搬移清單），內容只留在 git 歷史；`legacy/docs/README.md` 裡的 `../../PROJECT.md` 連結現在指到新版 PROJECT。
- 共用 index 撞車：多線同 repo 時，建議 commit 一律用 `git commit -- <paths>`（只收明列路徑），寫進 dispatch lessons。

## 下一條實作線要知道的事

- `src/` 不存在，可直接建 `src/core/`、`src/content/`；`git mv` 已完成，`test ! -e src/mecha_srpg` 成立。
- conventions 已寫 TS 規矩；code-map 的六模組列標「規劃中」，落地後把檔名與測試位置填回。
- testing.md 的快速／完整驗證指令標「待實作線補」：定下 `package.json` 的 test script 後改那兩格；AGENTS 鐵律 1 只寫 wf-lint，程式碼驗證以 testing 為準。
- dev-env 的流程寫「`.nvmrc` 由實作線建立」、INDEX 寫 `package.json`／`tsconfig.json`／`.nvmrc` 由實作線建立。

## 驗收逐條證據

1. `test ! -e src/mecha_srpg && … && test -d legacy/docs` 成立；`head -1 legacy/README.md` 為封存註記。
2. 三檔 991／1148／1018 bytes，各含 1 個 `wf/workflows/planning/specs/core/README.md` 連結。
3. 交接書的 grep 指令 0 筆（exit 1）。
4. `wf-lint --strict`：broken=0、residue=0、local=0。
5. `git log --oneline -5` 含 `2ad701b legacy: …`；HEAD 的 stat 無 `specs/world/`；工作樹殘留見上「沒做到」。
6. 無 codex exec／cx- tmux；ROSTER 已標已收線。

## 以後交接書該點名的工具

- `git commit -- <paths>`（明列路徑 commit，避免共用 index 被別線順手收走）。

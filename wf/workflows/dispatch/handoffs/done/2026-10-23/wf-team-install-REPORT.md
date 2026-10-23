# wf-team-install：multi-agent 團隊工作流已裝進 wf/，6 條驗收過 5 條；第 1 條只卡在調度者自己的 planning/design-notes.md

線：`wf-team-install`（Opus 領導，行程內）。日期：2026-10-23。沒開子代理。

## 做了什麼

1. **kernel tools**：`/home/lorkhan/repo/workflows/tools/` 的 kernel-owned 檔（`wf-lint.sh`、`wf-lint-checks.sh`、非 `test_` 的 `*.py`、`fmt-vars.json`）整包覆蓋到 `wf/tools/`；逐檔 `cmp` 後發現**原本就和上游一致**（已含「未發布」段的 local hook、gitignore、`.venv`、`inbox/` 不下鑽），覆蓋後 lint 基線仍 0。
2. **合入 multi-agent flavor**（照 `wf-init.sh` 第 2 節手動做）：`workflows/*` → `wf/workflows/`；inbox 腳本與 `hook-settings-snippet.json` → `wf/tools/`；放信處 `wf/inbox/`＋`done/`。三個片段貼到 `AGENTS.md`／`wf/WORKFLOWS.md`／`wf/INDEX.md` 的插入標記前，路徑改成非侵入式（AGENTS 開場 bullet 改成 `wf/tools/inbox_read.sh wf/inbox/new`）。`WORKFLOWS.md`「活狀態」表的「等別資料夾的 agent」列改指向 inbox。
3. **路徑推導驗證**：把 `wf/tools/inbox_*.sh` 複製到 scratchpad 的 `…/derive/wf/tools/`，不設任何環境變數跑 `inbox_mail.sh cx-probe --up PROGRESS`，信落在 `…/derive/wf/inbox/new/`，`inbox_poll.sh dispatcher --once` 讀得到 → 腳本由自身位置推導 `../inbox` 成立；本專案 `wf/tools/../inbox` 解析成 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox`。
4. **team-model**：角色四格（頂層 Fable 5.1／領導 Opus／工人 codex gpt／規劃 Fable）、派誰的預設、隊伍無上限但領導少開、讀規矩、硬禁區、信箱三句話版；分級與消耗速度表採 2026-09-25 預填版並刪〔模板說明〕。`speed.md` 的逐模型心得表因 >1 KB 抽成 `team-model/model-quirks.json`（wf-table/1，7 列，5 列有 skyrim 實證並標日期）；`plans.md`、`context.md` 填本專案版。
5. **dispatch/**：README 改成本專案語境（按明列路徑清單切線、整合點保留給調度者、兩層派線固定配置、git 規則）；新增 `codex-exec.md`（0.163.0 旗標重核＋兩模型 smoke test 表）、`tool-index.md`、`lessons-leading.md`／`lessons-evidence.md`（lessons.md 留模板四條＋索引，追加 9 條 skyrim 通用教訓）、`handoffs/README.md`＋`handoffs/done/`；`driving-cli-agents.md` 保留模板版，只加一段本專案 tmux／cx 工具說明。
6. **交接書範本** `TEMPLATE.handoff.md`：先讀行、範圍排除法＋雙 gate、必用工具表、資源與禁區三選一（唯讀調查線／可寫程式碼線／可跑 godot headless 線）＋共通禁區、REPORT 寫檔、驗收條數寫死、失敗兩種處置、前景等待、完成回報。
7. **腳本移植**（`wf/tools/`）：`cx_launch.sh`（預設帶 `-s workspace-write --add-dir wf/inbox`，可 `--sandbox`／`--add-dir` 覆寫）、`cx_watch.sh`（改成唯讀掃 `from:` 判該線新信，因為模板的 `inbox_poll.sh` 沒有 `--from`）、`brief_lint.py`（段名對齊本範本：`RESOURCE-SECTION` 取代鎖段、新增 `READ-FIRST`、圍欄碼與 `< /dev/null >` 不算佔位、去掉 agentctl fallback）、`inbox_ack.sh`（放信處與 STATE 路徑改本專案）；測試 `test_cx_tools.py`、`test_brief_lint.py` 移植並改到通過，`test_inbox_ack.py` 新寫。
8. **inbox 文件**：README 加「本專案的放信處與腳本」段、全文路徑改 `wf/`；wake-policy 三層改名 Fable／Opus／codex，領導醒鐘改前景；ROSTER 只留 `dispatcher`＝主 session Fable 5.1。`resources.md` 填本專案（鍵鼠螢幕全禁、無鎖可拿、CPU 用 `nice`）。
9. **user.md**：分支慣例改為 `main` 直接 commit、不 push（依調度者補充指示）；「一定先問」加 push；團隊配置／分工／讀規矩／硬禁區寫成表下一段（放進表會讓表超過 1 KB）。**dev-env.md** 外部工具表加 codex／godot-mono／node／pnpm／tmux 實查版本。
10. **調度者補充指示（git init）**：dispatch README、TEMPLATE.handoff、codex-exec 都寫成「可 commit 到 main、只加明確路徑、禁 `git add -A`、不 push、不建分支、不 rebase／reset 別人的 commit；收線用 `git log --oneline` 核」；`.gitignore` 沒動。

## 產出（絕對路徑）

- 工作流：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/team-model.md`、`…/wf/workflows/team-model/{context.md,plans.md,speed.md,model-quirks.json}`、`…/wf/workflows/dispatch/{README.md,codex-exec.md,driving-cli-agents.md,lessons.md,lessons-leading.md,lessons-evidence.md,tool-index.md,handoffs/README.md}`、`…/wf/workflows/inbox/{README.md,PROTOCOL.md,ROSTER.md,TEMPLATE.letter.md,wake-policy.md}`、`…/wf/workflows/resources.md`、`…/wf/workflows/TEMPLATE.handoff.md`
- 腳本：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/{inbox_send.sh,inbox_read.sh,inbox_mail.sh,inbox_poll.sh,inbox_team.sh,inbox_ack.sh,notify_watch.sh,test_inbox.sh,hook-settings-snippet.json,cx_launch.sh,cx_watch.sh,brief_lint.py,test_brief_lint.py,test_cx_tools.py,test_inbox_ack.py}`
- 放信處：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/`（`.gitkeep`、`done/.gitkeep`）
- 改動的既有檔：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`…/wf/WORKFLOWS.md`、`…/wf/INDEX.md`、`…/wf/workflows/common/user.md`、`…/wf/workflows/dev-env.md`
- 本 REPORT。新增或改寫的 md 共 28 個（< 40）。

## 沒做到、或證據不足的

- **驗收 1 未過**：`wf-lint --strict` exit 1，唯一 finding 是 `BIGLIST wf/workflows/planning/design-notes.md:9-19 (1576 bytes, table)`——這個檔是本線執行中（21:12）由別人新建的，在 planning 範圍內，不在本線領地，我沒動它。本線的檔全數 0 finding。
- 移植自 skyrim 的教訓與模型癖好**本專案尚未實跑重現**，已在檔內標明來源與日期。
- `cx_launch.sh`／`cx_watch.sh` 只用假 tmux 測試與 `--dry-run` 驗過，沒開過真 tmux session（交接書限制）。互動式 codex 加 `-s workspace-write` 後 approval 仍是 config 的 `on-request`，實際會不會多停批准提示未實測。
- `team-model.md` 角色表與 `dispatch/tool-index.md` 都 >1 KB，用 `<!-- wf-nav -->` 留在 md（給人讀的核心表）；若要嚴守「給 AI 讀的進資料檔」，可再抽。
- 背景行程：機器上有使用者自己的 `codex-desktop` 與 `codex app-server`（08:35～14:20 啟動，早於本線），不是本線留下的。

## 需要決定的事

1. 修 `wf/workflows/planning/design-notes.md` 的 1.5 KB 表（抽 json 或拆小），驗收 1 才會綠。
2. `.gitignore`：本線腳本只需要 `wf/inbox/.state/`（已加）。若不想讓 codex 線的 `-o`／log 進版控，建議另加 `wf/workflows/dispatch/handoffs/*/trash/`；codex log 建議放 `/tmp/<線名>/`。
3. 要不要把 `brief_lint.py` 接進 `wf/tools/wf-lint-local.sh`（kernel 的 project-local hook）掃現役交接書？接了之後交接書沒過會讓 `--strict` 紅。
4. `hook-settings-snippet.json`（每次提示前印未讀信）要不要合進 `.claude/settings.json`——依模板規矩由使用者決定。
5. **建議頂層下一步要開的線**：① Fable 規劃線：把 `SPEC.md`／planning 的第一個里程碑寫成 plan，切出明列路徑清單；② 一條 codex `gpt-6-astra` 試跑線（唯讀調查線，例如盤點 `src/` 與 `SPEC.md` 的落差），用 `brief_lint.py` 自查的交接書走完整個 `codex exec`→inbox→收線流程，順便實測 gpt-6-astra 的癖好補進 `model-quirks.json`。

## 驗收逐條證據

1. `bash wf/tools/wf-lint.sh --strict .` → **exit 1**；`TOTAL broken=0 residue=0 oversize=0 biglist=1 querycmd=0 local=0`，唯一一筆是上述 `planning/design-notes.md`（非本線檔）。
2. `grep -rn -e '{{' -e '〔導入判斷〕' -e '〔模板說明〕' AGENTS.md wf --include='*.md' | grep -v '/archive/'` → **0 筆**。
3. `bash wf/tools/test_inbox.sh` → `ok 14 fail 0`，**exit 0**。
4. `wf/workflows/dispatch/codex-exec.md`「2026-10-23 實測」表：`gpt-6-astra` 8.2 秒、tokens used 3,719；`gpt-6-sol` 5.6 秒、tokens used 3,656；兩者 exit 0，回覆 `Hello! I’m Codex, based on GPT-6.`。
5. `python3 -m unittest discover -s wf/tools -p 'test_*.py'` → `Ran 49 tests … OK`（test_brief_lint 28、test_cx_tools 18、test_inbox_ack 3）。
6. `wf/workflows/team-model.md` 第 20–23 行角色表四格：頂層 Fable 5.1／領導（隊長）Opus／工人（隊員）codex gpt／規劃 Fable。`tmux ls` → `error connecting to /tmp/tmux-1000/default`（沒有任何 session）；`pgrep -f 'codex exec'` 無結果。

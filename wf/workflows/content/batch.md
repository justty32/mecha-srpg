# batch — 一批內容從開單到入庫（codex 填內容的護欄流程）

[content README](README.md)｜潤飾專章 [polish](polish.md)｜試玩規程 [playtest](playtest.md)｜派線配方 [dispatch/content-batch](../dispatch/content-batch.md)｜帳本 [content/batches](../../../content/batches/README.md)｜索引 [content/index](../../../content/index/README.md)

讓 agent（主要是 codex）**在既有框架上大量新增內容或潤飾文字，而改不到別的東西**，並讓產出可被追蹤。三道護欄：① 隔離 worktree（codex 不碰主工作樹）；② 路徑與欄位閘門 `content_gate`（只認 manifest 宣告的路徑與欄位）；③ 驗收鏈 `content_accept`（check／lore／typecheck／test／probe／試玩紀錄／已讀清單）。通過的檔才由領導帶回 main。

**何時用**：「開一批內容」「派 codex 填內容」「潤飾文案」（潤飾細則見 [polish](polish.md)）；任何要讓 codex／子 agent 寫 `content/base/`、`content/lore/` 的時候。
**何時不用**：要改引擎、加欄位、改 spec → feature-dev／planning；自己手改一兩檔的小修 → 直接照 [README](README.md) 流程。

## Done when

- `content/batches/<YYYY-MM>/<batch>.json` 存在，`status` 為 `accepted`（或 `rejected` 並寫明原因），`files`／`ids`／`acceptance`／`rounds`／`gateRejections` 已填。
- `bash wf/tools/content_accept.sh <worktree> <manifest>` 末行 `ACCEPT`；帶回後主 repo `npm test`（含索引一致性）與 `npm run check` 綠。
- 該批的 commit 只含 manifest `files`、該 manifest、重產的 `content/index/` 分片。

## manifest（`content-batch/1`）

一批一檔，按月份子資料夾。欄位：`id`；`mode`（`add`＝只新增、`polish`＝只改文字欄）；`status`（`draft`→`accepted`／`rejected`）；`goal`；`author`（agent、model、reasoning、line、subagents）；`lead`；`date`；`base`（worktree 起點 commit）；`reportDir`（codex 報告目錄，相對 repo 根）；`report`（`file`、`mustRead` 已讀清單必列的路徑）；`maxFiles`；`allow`——add 模式 `kinds`（相對 `content/`，如 `base/frames`、`lore/characters`）、`namePrefix`（glob→前綴，如 `{"base/*":"cx3-"}`）、`modify`（例外檔＋`superset` 規則：只准插入）；polish 模式 `polishFiles`（glob）、`textFields`（白名單子集）；`checks`（要跑的驗收步驟）；`probe`（`n`、`reference` 同級既有單位、`waivers` 豁免＋理由）；`playtest`（`required` 場數、`file`、`logDir`）。收尾填：`files`、`ids`、`acceptance`、`rounds`、`gateRejections`（被閘門擋下的越界嘗試原文）、`deprecated`（之後要淘汰的檔）。

## 流程

<!-- wf-nav -->
1. **開 manifest**：照上節寫 `content/batches/<YYYY-MM>/<batch>.json`（`status:"draft"`），`base` 填當下 HEAD。一批 ≤ 20 檔、一個類別。
2. **開隔離 worktree**：`git worktree add --detach <scratchpad>/codex-pilot/wt-<batch> <base>`，再 `ln -s <repo>/node_modules <wt>/node_modules`（閘門認得這個 symlink）。
3. **寫交接書**：照 [dispatch/content-batch](../dispatch/content-batch.md)——「先讀」列完整路徑（AGENTS.md、`wf/workflows/content/` 全部、`content/lore/style.md`）並要求 REPORT 開頭「已讀清單」；可寫範圍只有 worktree 的允許目錄＋報告目錄；socket／scratch 一律放 `/tmp/<線名>/`；子代理可派、模型隨意、上限寫死，同受閘門約束。`brief_lint --strict` 0 違規。
4. **派 codex**：`gpt-6.1-sol`＋`-c model_reasoning_effort='"high"'`，`-C <wt>`，`--add-dir` 只給 `wf/inbox` 與報告目錄（配方在 dispatch 頁）。
5. **等**：前景 `inbox_poll.sh <領導> --wait --timeout 540` 或 `kill -0 <pid>` 輪詢；三訊號（行程結束、log 尾 `tokens used`、inbox 終局）都看。
6. **閘門＋驗收**：`bash wf/tools/content_accept.sh <wt> <manifest> --record`。它先跑 `content_gate.py`（不過就停），再依 `checks` 跑 check（列新警告）、lore check、typecheck、`npm test`、黃金不變、`content:probe`（失衡門檻見 [playtest](playtest.md)）、試玩紀錄、已讀清單；產物在 `<reportDir>/accept/verdict-<輪>.json`。
   **可選：命名審查**——把新名字交給 `agy`（gemini-4-argon-high）純文字審查翻譯腔，用法見 [polish](polish.md)「首要標準」第 5 條；結果摘要記 manifest `namingReview`，明顯翻譯腔退回。
7. **退回重做**（最多 2 輪）：開新的 `codex exec`（不用 `resume`——它不吃沙箱旗標），prompt 帶 `VIOLATION` 行、失敗步驟原文與上一輪 REPORT 路徑；越界的檔原文抄進 manifest `gateRejections`（這是「codex 有沒有亂改」的證據）。第 2 輪仍不過 → `status:"rejected"`，REPORT 記錄，不帶回。
8. **帶回 main**：`python3 -I wf/tools/content_gate.py <wt> <manifest> --carry <repo>`——只複製通過的檔；add 模式目的地已有同名檔、polish 模式目的地已被別線改過（≠ base）都拒絕。
9. **更新帳本與索引**：manifest 填 `files`（相對 repo 根）、`ids`、`status:"accepted"`；`git add <files> <manifest>` 之後 `npm run content:index`（只重寫有變動的分片；索引讀 git 索引版本），再 `git add content/index`。
10. **commit 與收線**：主 repo 跑 `npm test`、`npm run check`；`git diff --cached --stat`；`git commit -- <files> <manifest> content/index`；移除自己建的 worktree（`git worktree remove`），kill 殘留 socket 行程。

## 查帳本與索引

先看 `content/index/_summary.json` 找分片，再對分片 `find`／`grep`（例：C 級獸族怪獸＝`base-monster.json` 上 `find grade=C family=beast`；某批加了什麼＝各分片 `find batch=<id>`，或直接讀該批 manifest 的 `files`）。**不整份讀分片**（鐵律 3）；查法見 [data-files](../common/data-files.md)。誰引用某 id：`content_index.py refs <id>`。

## 交接

- 潤飾模式細則 → [polish](polish.md)；試玩與 probe → [playtest](playtest.md)；派 codex 的旗標 → [dispatch/content-batch](../dispatch/content-batch.md)。
- 閘門要放寬（新模式、新欄位）→ 改 `wf/tools/content_gate.py` 並補 `wf/tools/test_content_gate.py` 的陽性／陰性案例。

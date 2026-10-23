# codex exec — 非互動式派一條 codex 工人線（實測配方）

[dispatch](README.md)｜互動式備選 [driving-cli-agents](driving-cli-agents.md)

一條線＝一個背景 `codex exec` 行程：讀交接書、做完、寫 REPORT 檔、走 [inbox](../inbox/README.md) 回報、行程結束。本專案的工人層預設就是這個（見 [team-model](../team-model.md)）。沒有畫面、沒有批准提示、沒有動態提醒通道——所以**交接書要寫得比互動式更死**（見 [team-model/speed](../team-model/speed.md)）。

## 2026-10-23 實測（`codex-cli 0.163.0`，ChatGPT 帳號登入）

指令：`codex exec -m <模型> --ephemeral -s read-only -C /tmp --skip-git-repo-check 'print hello and the model you are' < /dev/null`

| 模型 | 可用 | 秒數 | tokens used | 回覆／錯誤原文 |
|------|------|------|-------------|---------------|
| `gpt-6-astra` | 可用，exit 0 | 8.2 | 3,719 | `Hello! I’m Codex, based on GPT-6.` |
| `gpt-6-sol` | 可用，exit 0 | 5.6 | 3,656 | `Hello! I’m Codex, based on GPT-6.` |

- log 開頭照舊印 `Reading additional input from stdin...`：0.163 起「有 prompt 參數又有 stdin 時，stdin 會附成 `<stdin>` 區塊」，`< /dev/null` 讓它讀到空內容立刻往下走，**仍要保留**。
- log 裡兩行 `ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(…)` 是 `~/.codex/config.toml` 掛的 MCP 沒登入，**無害雜訊**，不影響任務；看 log 時 `grep -v rmcp::transport`。
- 不要用 `-m gpt-sol` 這個別名：ChatGPT 帳號會被拒（`The 'gpt-sol' model is not supported when using Codex with a ChatGPT account`，skyrim／gd_libs 兩處實測）。不帶 `-m` 時用 config 預設 `gpt-6-astra`。

## 完整指令

```sh
codex exec -m gpt-6-astra -s workspace-write \
  -c model_reasoning_effort='"high"' \
  -C "<唯一可寫工作目錄，絕對路徑>" \
  --add-dir /home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox \
  --skip-git-repo-check \
  -o "<log 目錄>/<線名>.last.txt" \
  '你是線 <線名>。讀 <交接書絕對路徑> 並完整執行（先讀它點名的 AGENTS.md 與 wf 規矩）；驗收條數已寫死，不要自行加碼。做完用交接書「完成／阻塞回報」段的指令回報。' \
  < /dev/null > "<log 目錄>/<線名>.log" 2>&1 &
echo $! > "<log 目錄>/<線名>.pid"
```

逐旗標（`codex exec --help` 於 0.163.0 核過），分三組。

**沙箱與批准**。`-s workspace-write` **必給**：`~/.codex/config.toml` 預設 `sandbox_mode = "danger-full-access"`，不覆蓋就沒有沙箱（唯讀調查線用 `-s read-only`）。exec 模式的 approval 固定 `never`——沙箱外的寫入**直接失敗、不會停下來問**，所以可寫集合要一次給齊。`-c model_reasoning_effort='"high"'` 的值要是 TOML 字串（雙引號包在單引號裡；本機 config 已是 high，寫出來是為了不依賴 config）。**一律用 `-c` 單次覆蓋，`~/.codex/config.toml` 不得修改。**

**可寫範圍**。`-C` 是主可寫根；`--add-dir` 追加可寫目錄（可重複）：回報要 `wf/inbox`。**兩者聯集不得超出領地表**（[dispatch](CLAIMS.md)）；沙箱另外自動放行 `/tmp`。`--skip-git-repo-check` 在工作目錄不是 git repo 時必加（如 `/tmp`），在 repo 內加了也無害。

**輸出與其他**。`-o FILE`（`--output-last-message`）把最後一則訊息單獨寫到檔案，收線不用從 log 撈。**`< /dev/null` 必須保留**。`--ephemeral` 不落 session 檔，探路用，正式線不加（留 session 可 `codex exec resume`）。`--json` 改印 JSONL，要程式化解析才用。子代理上限寫進交接書（config 沒鎖數量）。

## git 與禁區

線**可以 commit 到 `main`**，只加明確路徑（`git add <檔>`，禁 `git add -A`）；**不 push、不建分支、不 rebase／reset 別人的 commit**。注意 `-s workspace-write` 下 `.git/` 要在可寫範圍內才 commit 得了——`-C` 指專案根以外的子目錄時，commit 交給調度者做，線只回報改了哪些檔。共通禁區（不碰鍵鼠螢幕、不開 GUI、Godot 只 `godot-mono --headless`、不 `rm -rf`、不裝依賴）照 [TEMPLATE.handoff](../TEMPLATE.handoff.md) 寫進交接書。

## 背景跑與等它結束

```sh
# ① 同一個 shell：& 之後 wait
wait "$pid"; echo "exit=$?"
# ② 另一個 shell / 之後的回合：pid 還在就還在跑
kill -0 "$(cat <線名>.pid)" 2>/dev/null && echo RUNNING || echo EXITED
# ③ 等信（領導的醒鐘，前景跑，逾時再跑一輪）
wf/tools/inbox_poll.sh <領導名> --wait --timeout 540
```

Claude Code 裡的 Opus 領導也可用 Bash 的 `run_in_background` 起線（結束會回呼），但**等待本身要前景**——不可以結束回合當等待（見 [lessons](lessons.md)）。

## 怎麼判斷完成

三個訊號**都要看**，缺一不可：

| 訊號 | 看哪裡 | 意義 |
|------|--------|------|
| 行程結束 | `wait`／`kill -0` | 跑完了——**exit 0 不代表成功**，滿螢幕 ERROR 也可能交出合法產出，**都要讀輸出再判** |
| log 尾端 `tokens used` | `tail -5 <線名>.log` | agent 正常收尾；沒有這段＝中途死掉 |
| inbox 終局訊息 | `wf/tools/inbox_read.sh wf/inbox/new` 或 `inbox_poll.sh <領導> --once` | `DONE`／`FAILED`／`BLOCKED`／`NEEDS-USER` 之一；沒有＝它沒照交接書回報，算 FAILED 處理 |

之後照 [dispatch 收線 checklist](README.md#流程) 逐條對證據，`git log --oneline` 核 commit。

## 調度者 → 線

非互動式沒有輸入端。唯一通道是 `wf/inbox/orders/<線名>.md`（append-only，見 [inbox/PROTOCOL](../inbox/PROTOCOL.md)）——交接書要求線**每完成一步跑一次 `wf/tools/inbox_poll.sh <線名> --once`**，新 order 優先於交接書。緊急中止只能 `kill <pid>` 後重派。

## 交接

- 交接書骨架 → [TEMPLATE.handoff](../TEMPLATE.handoff.md)；工具對照 → [tool-index](tool-index.md)；codex 癖好與對策 → [team-model/speed](../team-model/speed.md)。
- 回報格式與 STATUS → [inbox/PROTOCOL](../inbox/PROTOCOL.md)。

# content-batch — 派 codex 做一批內容（隔離 worktree＋閘門）的配方

[dispatch](README.md)｜一般配方 [codex-exec](codex-exec.md)｜整批流程 [content/batch](../content/batch.md)

[codex-exec](codex-exec.md) 的特化版：codex 不在主工作樹跑，`-C` 指向領導建的 detached worktree，產出經 `content_gate` 才帶回。2026-10-24 lead-codex-pilot 實測（3 批：新增摹機、新增 lore、潤飾事件）。

## 開 worktree

```sh
S=<scratchpad>/codex-pilot; R=/home/lorkhan/repo/game_dev/mecha-srpg
git -C $R worktree add -q --detach $S/wt-<batch> <manifest.base>
ln -s $R/node_modules $S/wt-<batch>/node_modules     # 閘門認得、不算越界
mkdir -p /tmp/cx-<線名>                                # codex 的 socket／scratch 放這
```

worktree 的 `.git` 是指回主 repo 的檔，git 目錄在 `-C` 之外，所以 codex 在沙箱裡**寫不了 git**（commit 會失敗）——這是刻意的：它只產檔，commit 由領導做。

## 派線

```sh
H=$R/wf/workflows/dispatch/handoffs/<領導>
codex exec -m gpt-6-astra -s workspace-write -c model_reasoning_effort='"high"' \
  -C $S/wt-<batch> --add-dir $R/wf/inbox --add-dir $H/<batch> --skip-git-repo-check \
  -o $S/logs/<線名>.last.txt \
  '你是線 <線名>。讀 <交接書絕對路徑> 並完整執行（先親自讀它「先讀」行點名的 AGENTS.md 與 wf 規矩）；你的工作目錄是隔離 worktree，只能照交接書寫允許的路徑；驗收條數已寫死，不要自行加碼。' \
  < /dev/null > $S/logs/<線名>.log 2>&1 &
echo $! > $S/logs/<線名>.pid
```

可寫集合只有三處：worktree、`wf/inbox`、該批報告目錄（`<reportDir>`）；沙箱另放行 `/tmp`。主工作樹的其他路徑 codex 寫不到。

## 交接書必寫（在 TEMPLATE.handoff 之上）

- 「先讀」行列**完整路徑**：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/` 全部、`content/lore/style.md`、該類原則檔與範本；並要求 REPORT 第一段「已讀清單」逐行列出——驗收腳本拿 manifest `report.mustRead` 逐條比對。
- 範圍寫死允許目錄與檔名前綴（與 manifest `allow` 一致）；明寫「worktree 內不要留任何其他檔」。
- 子代理：「可以再派子 agent，模型隨意（量大呆板用 gpt-6-luna），上限 N；子 agent 做實質工作也要親讀 AGENTS.md 與 `wf/workflows/content/`，受同一閘門約束；REPORT 記成本與品質」。
- 戰鬥內容另寫 MCP 試玩要求與 `playtest.json` 格式（見 [content/playtest](../content/playtest.md)）。

## 收件

等待照 [codex-exec](codex-exec.md)「怎麼判斷完成」；之後**不讀 codex 的自報判通過**，一律跑 `bash wf/tools/content_accept.sh <wt> <manifest> --record`。不過就把 `VIOLATION` 與失敗步驟寫進 orders 或 `codex exec resume` 續跑，最多 2 輪；越界檔原文記進 manifest `gateRejections`。

## 交接

- 整批從開單到入庫 → [content/batch](../content/batch.md)；潤飾模式 → [content/polish](../content/polish.md)。

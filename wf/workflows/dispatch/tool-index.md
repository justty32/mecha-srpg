# tool-index — 任務類型 → 必用工具

[dispatch](README.md)｜交接書骨架 [TEMPLATE.handoff](../TEMPLATE.handoff.md)

**派線時從這張表抄交接書的「必用工具」段**，自己做事前也先查這裡。理由（skyrim 2026-10-03 retro）：被交接書點名的工具用了 134 次，沒被點名的用了 0 次——有工具沒人用，多半是因為沒人點名。路徑都相對專案根 `/home/lorkhan/repo/game_dev/mecha-srpg/`；各支的完整用法跑 `--help`。

狀態：**現役**＝本專案已實跑過；**新**＝已有測試或 dry-run，還沒在真的派線裡用過。

<!-- wf-nav -->
| 任務類型 | 必用工具 | 用途 | 狀態 |
|---|---|---|---|
| 派 codex 線（非互動） | `codex exec -m gpt-6-astra -s workspace-write …`（配方見 [codex-exec](codex-exec.md)） | 背景一條線一個行程；`-s` 必給 | 現役（smoke test） |
| 派 codex 線（tmux 互動） | `wf/tools/cx_launch.sh <線> <交接書> [--model M]` | 開 tmux＋codex、文字與 Enter 分送、4 秒驗 Working；`--dry-run` 只印 | 新 |
| 監看 tmux 線 | `wf/tools/cx_watch.sh <線>… [--recipient R] --timeout N` | 行程樹判活、批准提示、畫面停滯、該線的新信（唯讀）；前景跑 | 新 |
| 等信（領導醒鐘） | `wf/tools/inbox_poll.sh <自己> --wait --timeout 540` | 阻塞到個人格／團隊格／orders 有信；逾時 exit 3 再跑一輪 | 新 |
| 讀頂層信 | `wf/tools/inbox_read.sh wf/inbox/new` | 唯讀列未辦信，沒信就靜默 | 新 |
| 寄信／終局回報 | `wf/tools/inbox_mail.sh <我> --up <STATUS> '<一句話>' <正文檔>` | 依團隊名冊自動送上游；沒正文要加 `< /dev/null` | 新 |
| 收信歸檔 | `wf/tools/inbox_ack.sh <信>… --state '一行' --apply` | 摘要＋REPORT 路徑→併進 `wf/inbox/done/<日期>/messages.json`→STATE 記一行；不加 `--apply` 是 dry-run | 新 |
| 開／加／收團隊 | `wf/tools/inbox_team.sh create\|add\|close <團隊> …` | 不要手動 mkdir `teams/` | 新 |
| 交接書自查 | `python3 wf/tools/brief_lint.py <交接書> --strict` | 必填段、驗收條數、資源三選一、交付絕對路徑、件數／容量 gate、佔位 | 新 |
| 文檔檢查 | `bash wf/tools/wf-lint.sh --strict .` | 壞連結、超標檔、>1 KB 條列、佔位殘留 | 現役 |
| inbox 腳本自測 | `bash wf/tools/test_inbox.sh` | 改過 inbox 腳本後跑 | 現役 |
| Godot 驗證 | `godot-mono --headless --path <專案目錄> …`（版本 4.7.2.stable.mono） | 只准 headless；不開編輯器、不開視窗 | 新 |
| Python 語法檢查 | `python3 -m compileall -q src` | 見 [testing](../testing.md) | 現役 |
| 收線核 commit | `git log --oneline`、`git status --short` | 核線的 commit 只含明確路徑、工作樹沒殘留 | 新 |

本表膨脹到難讀就照 [STRUCTURE](../../STRUCTURE.md) 分層；加一支工具時同一天加一列並標狀態。

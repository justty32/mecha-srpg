# 任務：把長線敘述與歷史資料檔裡的「暫值」標記改成 2026-10-24 已定

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-settle/guide.md`（**本線的唯一依據**：D1–D14 定案與「沒有暫定答案的題」）、`wf/workflows/dispatch/handoffs/talk-world/handover/open.md`（第 1、8、9 條是暫值原文）。路徑都相對你的工作目錄（隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-lines/`，內容與主 repo 相同）。

## 背景與唯一目標

lead-history-lines 與 lead-reconcile 寫的長線敘述把「使用者授權先定」的讀法標成「暫值」，數字標成「提案 v2，待確認」。使用者 2026-10-24 說：數字 v2「OK」、世界觀未定題「就用暫定答案」。本線唯一目標：把這些標記改成已定，內容照 guide.md 的定案對齊；**既有說法保留**，不改劇情。

## 範圍（排除法寫死）

- 只改 worktree 內這 12 個檔（都在 `wf/workflows/planning/design-notes/world/`）：`history-lines.md`；`history-lines/a-gate.md`、`b-ancient.md`、`c-essence.md`、`d-moon.md`、`e-soul.md`、`f-rift-line.md`、`g-umbrella.md`、`h-faith.md`；`history-lines.json`、`history-nodes.json`、`history-timeline.json`；外加 `history-reconcile.json` 的 `採用讀法（2026-10-24）` 一欄（其他欄是歷史紀錄，不改）。共 13 檔。
- 每處要做的事：
  1. 「（暫值）」「暫定」「按授權暫定」這類標記，凡對應 guide.md D1–D14 的，改成「（已定）」或「已定（2026-10-24）」，句子讀起來要順；同句若有與定案不一致的細節照定案改（例：連珠潮「之後每 52 蝕月」→ 第 40 蝕月一次、之後只靠湧現；讖語「故意說錯」→ 被蝕扭曲）。
  2. 寫「提案 v2」「待使用者確認」的數字，改成已定（D1）。
  3. 「尚未定的事」段與資料檔的 `尚未定的事` 類欄位：刪掉已由 D1–D14 定下的項目；guide.md「沒有暫定答案的題」照舊留著（R08 雙籤城權責、R24 S 級能否墟出、劇情留白等）。
  4. 標「提案」的讀法（第二代與本線的接法、提案事件）**維持提案**，不要升格成已定。
  5. `history-lines.md` 的標記說明（「使用者授權先定的標『暫值』」那句）改成說明 2026-10-24 起暫值已轉已定、原話「就用暫定答案」。
- 不做：上列以外的任何檔（含 `history-orphans.json`、`essence.md`、`scale.md`、`scale-v2.json`、`tide-range.*`、lore、spec、design-notes 其他檔）；不新增人名、事件、專名；不改年表引用 `〔date｜title〕` 的原字；不改資料檔欄位、列數、`序`／`id`；worktree 內不要留任何其他檔（筆記放 `/tmp/cx-st-lines/`）；不 commit。
- 件數 gate：改動檔超過 13 個就停下回報；容量 gate：任何一篇 md 改後超過 8,000 bytes 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/world/history-reconcile.json grep 'R08'`（在 worktree 根跑；tabledb 實際路徑 `wf/tools/tabledb.py`；關鍵詞換成你要查的） | 查列，不整份 cat |
| `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/world/history-nodes.json update 0 欄=值`（Python 也可 import 同目錄的 tabledb 模組） | 改資料檔 |
| `grep -rnE '暫值|暫定|提案 v2|待使用者確認|每 ?52' wf/workflows/planning/design-notes/world/history-lines.md wf/workflows/planning/design-notes/world/history-lines wf/workflows/planning/design-notes/world/history-lines.json wf/workflows/planning/design-notes/world/history-nodes.json wf/workflows/planning/design-notes/world/history-timeline.json` | 改前找點、改後核殘留 |
| `python3 wf/tools/tabledb.py check wf/workflows/planning/design-notes/world/history-nodes.json`（四個資料檔各跑一次） | 改完驗連結 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-st-lines --once` | 每改完一檔讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**：無；只寫 worktree 內上列 13 檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-settle/st-lines/`（只放 REPORT.md，不寫全文傾印、整份 diff 或 grep 輸出）；不 commit（沙箱下 `.git` 唯讀，領導收件）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親自讀「先讀」全部。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. grep 找點，逐檔改；改完一檔 grep 一次殘留、讀一次 orders。
3. 四個資料檔跑 tabledb check。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-settle/st-lines/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的 13 檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-lines/wf/workflows/planning/design-notes/world/`（上列） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-settle/st-lines/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**；「做了什麼」；「逐檔摘要」（每檔幾處、對應哪幾個 D 代碼、舊→新各取一兩個半句樣本）；「仍留在尚未定的事」（每項附依據）；「殘留」（grep 命中仍留的每處＋理由）；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 上列 md 與三個 history 資料檔裡「暫值」「暫定」「提案 v2」「待使用者確認」殘留每處在 REPORT「殘留」段有理由（多半應為 0）。
2. 每篇 md ≤ 8,000 bytes，`〔date｜title〕` 引用序列與改前相同。
3. 四個資料檔 `tabledb.py check` 0 壞連結、列數不變。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-st-lines`。本線團隊：`teams/st`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-lines --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-lines --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-settle/st-lines/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「暫值標記改已定、內容對齊 guide.md」；提案層維持提案；任何需要改其他檔的需求一律寫進 REPORT，不動手。

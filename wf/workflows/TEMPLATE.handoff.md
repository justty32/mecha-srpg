# 任務：<動詞開頭的一句話>

> 複製本檔改寫成 `dispatch/handoffs/<線名>.md`（現役在頂層、做完移 `done/<日期>/` 附證據）。派線規則見 [dispatch](dispatch/README.md)，工具對照見 [dispatch/tool-index](dispatch/tool-index.md)。把所有 `<…>` 換掉；用不到的段整段刪掉，**但「先讀」行、範圍的件數／容量 gate、必用工具表、資源與禁區、交付的絕對路徑、驗收條數不可刪**——送出前跑 `python3 wf/tools/brief_lint.py <本檔> --strict` 要 0 違規（本範本自己滿是佔位，不拿來 lint）。
> **交接書是唯一契約**：沒寫在裡面的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀到本線用的工作流入口（`<例：wf/workflows/feature-dev/README.md>`）與 `wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**（雜活線可寫「先讀：AGENTS.md（雜活，只讀這份）」）。

## 背景與唯一目標

<兩三句：為什麼做、做完世界有什麼不同。只有**一個**目標；兩個以上＝該切成兩條線。>

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：<件 1>、<件 2>（明列路徑清單）。
- 不做：<常被遞移展開的那類東西，例：「與 X 相關的」其他模組>、領地以外的任何路徑。
- 件數 gate：處理超過 <N> 件就停下回報；容量 gate：產物超過 <M> MB 就停下回報。任一觸發都停。

## 必用工具

從 [tool-index](dispatch/tool-index.md) 抄對應的列；不要自己重寫這些工具已經做好的事。

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh <線名> --once` | 每完成一步讀 orders／mail |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |
| `<例：bash wf/tools/wf-lint.sh --strict .>` | <例：改完文件後驗 0 違規> |

## 資源與禁區

<三選一，刪掉另外兩個>

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT 與 `dispatch/handoffs/<線名>/` 底下的附件；codex 用 `-s read-only`。
- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；commit 規則見下。
- **可跑 godot headless 線**：同「可寫程式碼線」，另可跑 `godot-mono --headless …`（只准 headless，不開編輯器、不開任何視窗）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；commit 到 `main` 只加明確路徑（`git add <檔>`，禁 `git add -A`／目錄級 add）；不 `rm -rf`（暫存搬 `/tmp/<線名>-trash/`，KB 級文字搬 `dispatch/handoffs/<線名>/trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 [dispatch/lessons](dispatch/lessons.md)）；子代理上限 <N> 個，只准為推進正事開。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。

## 工作

1. <步驟>
2. <步驟>
3. 寫 REPORT（見交付）並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/<線名>/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。路徑一律寫絕對路徑——寫相對路徑線會寫到別的地方。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| <是什麼> | `<絕對路徑>` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 <N> 條，一條不多，做完就停）

1. <可觀察條件：檔案存在／指令回傳／表格填滿，附預期數字>
2. <…>

不要為了「更保險」加驗其他東西；某個子代理的產出若不在這張清單上，就不要開它。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 回滾本線改動（`git restore <明確路徑>` 或撤回自己的 commit），發 `FAILED`，REPORT 寫證據。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`<線名>`。本線團隊：`teams/<TEAM>`（沒有就寫「無」）。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh <線名> --up <STATUS> '<一句自足結論>' <正文檔>`（沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到你的領導，你不需要知道上游叫什麼。Claude 子 agent 不走 inbox，直接在回覆給 5 行摘要＋REPORT 路徑。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**（需使用者決定用 `NEEDS-USER`），不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh <線名> --wait --timeout 540`（逾時再跑一輪），**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由**領導代登記**：沙箱只放 `-C` 與 `wf/inbox`，工人寫不到 `wf/workflows/inbox/ROSTER.md`（2026-10-23 實證）。

> 送出前對照一次「背景與唯一目標」和「工作」有沒有互相矛盾——衝突處要寫死哪個為準。

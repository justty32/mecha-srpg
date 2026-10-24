# 任務：在隔離 worktree 潤飾 10 個營運事件的文案（batch pilot-polish-01，潤飾模式）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`wf/workflows/content/ops-content.md`（相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同）。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

使用者要試「codex 只做文字潤飾、不動任何其他東西」。本批是潤飾模式試點：把下列 10 個營運事件的玩家可見文字改得更自然、更像人寫的中文（照 lore-text.md「文字潤飾準則」與 style.md），**只改文字欄**。產出會被欄位級閘門逐節點比對：id、數字、tags、引用、`when`／`effects` 結構、陣列長度、鍵集合有任何變動都會被拒。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：修改 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-polish-01/` 裡這 10 個檔：`content/base/world/events/ship-helium-leak.json`、`content/base/world/events/ship-letter-receipt.json`、`content/base/world/events/ship-locker-debt.json`、`content/base/world/events/ship-locker-letter.json`、`content/base/world/events/ship-tide-stew.json`、`content/base/world/events/soul-log-address.json`、`content/base/world/events/soul-log-echo.json`、`content/base/world/events/soul-night-hum.json`、`content/base/world/events/soul-stray-log.json`、`content/base/world/events/route-tide-storm.json`。
- 可改的欄位只有：`text`、`choices[].text`，以及檔中若有的 `name`／`title`／`label`／`summary`／`body`／`lines`／`phrase`／`phrases`／`badge`／`note`。值必須仍是字串；不得新增或刪除任何鍵、不得改陣列長度、不得把文字改成像 id 的字串。
- 每檔保留原意與事件走向（選項做的事不變，只改說法）；不新增具名人物、不寫 `{佔位}`；禁用詞照 style.md。
- 不做：其他任何檔（含同目錄其他事件、`src/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`）；新增檔；不 commit。
- worktree 內**不要留任何其他檔**（筆記、對照表放 `/tmp/cx-pilot-polish/`）。
- 件數 gate：修改超過 10 件就停下回報；容量 gate：任一檔改後比原檔大 50% 以上就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 改完跑，末行 `OK 0 errors` |
| `node src/ops/content/check.ts content/base` | 營運內容檢查，末行 OK |
| `git -C . diff --stat` | 自查只動了 10 個檔 |
| `grep -rn '電磁\|口徑\|毫米\|電池\|雷達\|衛星\|飛彈\|坦克\|戰鬥機' {10 檔路徑}` | 禁用詞自查 |
| `wf/tools/inbox_poll.sh cx-pilot-polish --once` | 每完成一步讀 orders／mail（在主 repo 路徑跑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh`） |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`、`columns`） | 讀規矩裡的 wf-table/1 資料檔（AGENTS 寫的 tabledb 在本專案的實際路徑是 `wf/tools/tabledb.py`） |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與「交付」列的報告目錄；可跑上表的檢查；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 dispatch/lessons）。
**子代理上限 2 個**：可以再派子 agent，模型隨意（例如用 gpt-6-luna 先改一半、你審稿），只准為推進正事開；子 agent 做實質工作也要親自讀 `AGENTS.md`、`wf/workflows/content/` 全部與 `content/lore/style.md`，它一樣只能寫本 worktree 的允許路徑（同一個閘門會檢查）。REPORT 記下開了幾個、什麼模型、做了什麼、你改了它多少、品質與 token 成本觀察。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑（例如找不到檔就換正確路徑）、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。（2026-10-24 第一輪兩條線因把 `tools/tabledb.py` 打成相對 worktree 根的錯路徑就停下，這不該停。）

## 工作

1. 讀「先讀」全部與 10 個事件原文；每檔先列「哪裡生硬」（翻譯腔、id 外露、句子太長、說教結尾）。
2. 逐檔只改文字欄；整檔改寫用單一 Update 操作。
3. 跑必用工具的檢查；REPORT 附逐檔「舊→新」對照（每檔至少列 `text` 欄全文對照）。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-polish-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 潤飾後的 10 檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-polish-01/content/base/world/events/*.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-polish-01/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼——逐檔一句改了什麼；產出——逐檔舊→新對照、禁用詞 grep 結果；沒做到或證據不足的；需要決定的事——例如發現的非文字問題）；再一段「子代理」（開了幾個、模型、做什麼、品質）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `git -C . status --short` 除 `node_modules` 外只見範圍列的 10 個檔為 ` M`。
2. `npm run check` 末行 `OK 0 errors`；`node src/ops/content/check.ts content/base` 末行 OK。
3. 禁用詞 grep 對 10 檔 0 命中；REPORT 有逐檔舊→新對照。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西；某個子代理的產出若不在這張清單上，就不要開它。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來**（沒跑成、拿不到證據）→ **保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pilot-polish`。本線團隊：`teams/codex-pilot`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pilot-polish --up DONE '一句自足結論' /tmp/cx-pilot-polish/final.md（STATUS 換成實際狀態）`（沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-pilot-polish --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「只改 10 檔的文字欄」；任何需要改非文字欄或其他檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

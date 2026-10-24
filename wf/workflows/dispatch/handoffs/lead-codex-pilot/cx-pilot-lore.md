# 任務：在隔離 worktree 新增 5 個 lore 人物與 2 個 lore 事件（batch pilot-lore-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`content/lore/README.md`、`content/lore/factions/third-blade.json`（相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同）。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

使用者要試「codex 在既有框架上大量填內容，但不亂改別的東西」。本批是試點：在你的隔離 worktree 裡**只新增** lore（世界觀資料，百科用、遊戲不載入）——5 個人物（`content/lore/characters/`）與 2 個事件（`content/lore/events/`），題材圍繞第三刃獵團與月面背面（`faction/third-blade`、`faction/backside`），交叉引用正確。產出會被領導用路徑閘門與驗收鏈檢查，通過才帶回主 repo。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-lore-01/` 新增 `content/lore/characters/{名}.json` ×5、`content/lore/events/{名}.json` ×2；可以（不是必須）在 `content/lore/timeline.json` **插入**新條目（依 date 升冪插在正確位置，**不得改動或刪除任何既有條目**——閘門只接受純插入）。
- 格式照 `content/lore/README.md` 欄位表；文字照 style.md 與 lore-text.md（禁用詞、句長、body 300–1500 字、事件 3–5 個 `## ` 小標、`consequences` 一句一條）。新人物的 `relations`、`events` 與新事件的 `characters`／`factions`／`places`／`period` 只能指向**已存在**或**本批新增**的 id；日期落在 period 時代內、錨點日期不可動；先 `ls` 與 `grep` 避免撞名。
- 一個人物至少引用一個本批新事件，兩個事件合計引用 ≥ 4 個本批新人物；至少 2 人屬第三刃、至少 2 人屬背面或與背面有關。
- 不做：修改既有人物／勢力／事件／地點檔來補反向關係（需要的話列進 REPORT「需要決定」）；`content/base/` 任何檔、`src/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`package.json` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（筆記、草稿一律放 `/tmp/cx-pilot-lore/`）——閘門會把非允許路徑的新檔或改動記成越界。
- 件數 gate：新增／修改檔超過 8 件就停下回報；容量 gate：單檔超過 16 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑一次，0 錯 |
| `npm run check` | 收尾跑一次，末行 `OK 0 errors`（lore 不影響它，用來確認沒碰壞別的） |
| `grep -rn '電磁\|口徑\|毫米\|電池\|雷達\|衛星\|飛彈\|坦克\|戰鬥機' content/lore/characters content/lore/events` | 禁用詞自查（只看你的檔） |
| `wf/tools/inbox_poll.sh cx-pilot-lore --once` | 每完成一步讀 orders／mail（在主 repo 路徑跑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh`） |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`、`columns`） | 讀規矩裡的 wf-table/1 資料檔（AGENTS 寫的 tabledb 在本專案的實際路徑是 `wf/tools/tabledb.py`） |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與「交付」列的報告目錄；可跑上表的檢查；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 dispatch/lessons）。
**子代理上限 2 個，本批至少要用 1 個**（試點要觀察子代理的成本與品質）：模型隨意（例如用 gpt-6-luna 起草一個事件或做禁用詞與引用的交叉檢查，再由你審稿定稿），只准為推進正事開；子 agent 做實質工作也要親自讀 `AGENTS.md`、`wf/workflows/content/` 全部與 `content/lore/style.md`，它一樣只能寫本 worktree 的允許路徑（同一個閘門會檢查）。REPORT 記下開了幾個、什麼模型、做了什麼、你改了它多少、品質與 token 成本觀察。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑（例如找不到檔就換正確路徑）、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。（2026-10-24 第一輪兩條線因把 `tools/tabledb.py` 打成相對 worktree 根的錯路徑就停下，這不該停。）

## 工作

1. 讀「先讀」全部；讀第三刃、背面（`content/lore/factions/backside.json`）勢力檔與它們已引用的人物、事件、地點，整理可掛的既有 id 與年表空檔。
2. 定 5 人 2 事的骨架（誰、做過哪件事、事件日期與時代），對照年表錨點。
3. 寫 7 檔（可派子代理起草一部分，你審稿）；每檔後 `node content/lore/check.ts`。
4. 視需要在 timeline.json 插入 2 條（只插入）。
5. 禁用詞自查、`npm run check`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-lore-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新 lore 檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-lore-01/content/lore/{characters,events}/*.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-lore-01/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼——件數表含每檔 id／名稱／一句定位；產出——交叉引用表（誰引用誰）、字數、禁用詞 grep 結果；沒做到或證據不足的；需要決定的事——例如既有檔要補的反向關係）；再一段「子代理」（開了幾個、模型、做什麼、品質）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內的改動**只有** `content/lore/characters/` 5 個新檔、`content/lore/events/` 2 個新檔、（可選）`content/lore/timeline.json` 純插入（`git -C . status --short` 除 `node_modules` 外只見這些）。
2. `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`。
3. 禁用詞 grep 對 7 個新檔 0 命中。
4. REPORT 的交叉引用表顯示每個新人物至少引用一個本批新事件、兩事件合計引用 ≥ 4 個新人物。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑，「子代理」段至少一個子代理的紀錄。

不要為了「更保險」加驗其他東西；某個子代理的產出若不在這張清單上，就不要開它。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來**（沒跑成、拿不到證據）→ **保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pilot-lore`。本線團隊：`teams/codex-pilot`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pilot-lore --up DONE '一句自足結論' /tmp/cx-pilot-lore/final.md（STATUS 換成實際狀態）`（沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-pilot-lore --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「只新增 7 個 lore 檔（＋timeline 純插入）」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

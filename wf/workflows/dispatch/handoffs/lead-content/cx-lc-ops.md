# 任務：在隔離 worktree 新增中後期營運事件與對話（batch lc-ops-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/content/world-pillars/bio-battle.md`、`wf/workflows/content/ops-content.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/engine-rules.md`（相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同）。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

營運層的隨機事件只有 47 件，跑幾個蝕月就開始重複，世界不像在動。本批**只新增**一組中後期隨機事件（分系列、每系列 ≥3 件，可含由選項 `next` 進入的鏈後續）與幾則既有人物的新話題對白；產出會被路徑閘門與驗收鏈檢查，通過才帶回主 repo。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/lc/wt-lc-ops-01/` 新增：
  - `content/base/world/events/*.json` **8–11 件**：照 `wf/workflows/content/ops-content.md`「事件」與 `engine-rules.md`。分 3 個系列、每系列 ≥3 件；系列從這些挑（避開既有 47 件已寫過的梗，先 `ls`／`grep` 既有事件）：蝕潮相關（蝕盛之夜、蝕壓下的船）、各勢力在你船邊的動靜（勢力互打、外交、徵調——**只能是文字與白名單效果**，不能真的改勢力狀態）、同業獵團、船上生活、遺跡傳聞。
  - **營運黃金必須不變（硬規定）**：黃金戰役最長跑到第 168 天（`calendar.month` 最大 6；`month = floor(day/28)`）。所以**每個新的隨機事件 `when` 都必含 `{"ref":"calendar.month","op":">=","b":7}`**（照既有事件的 cmp 寫法）＋`calendar.dom == 5|12|19|26` 之一；鏈後續用 `when:{}` 只由新事件的選項 `next` 進入。這讓本批是「中後期事件」；收尾 `npm test` 黃金若仍變，回頭查哪個事件早於第 7 月成立。
  - 選項 2–4 個，**第一個無 `requires`、溫和不賺不賠**；效果只用白名單（`ops-content.md` 列的那幾種與上限）；`text` 60–160 字、第二人稱現在式、不插值 `{…}`、不寫具名人物；每事件一個氣味、一個聲音、一個不解釋的名詞。
  - 新事件若用了 `templates/` 裡沒有文案的新事件型別，才在 `content/base/world/templates/` 新增一檔模板（多半不需要）。
  - `content/base/world/dialogues/{既有人物}-{話題}.json` **2–4 則**：人物必須已在 `content/base/persons/`；id 要排在該人物既有對白之後（talk 取 id 排序第一個成立者，不要搶第一話題）；`lines` 2–4 句、每句 ≤40 字、選項 2 個、效果 flag＋mood。
  - `content/base/world/rooms/` 只有在對白或事件真的需要新船艙時才新增（多半不需要）。
- **用語（新詞，必守）**：古代機本體就叫「古代機」、外層叫「裝甲」（**不用「殼」，也不用已作廢的「原鞘」系列詞**）；衍型機（舊稱摹機）、衍一／衍二、衍式兵器；鎧甲（舊殼甲）、靈目（舊殼目）、矢（舊殼矢：凡鐵矢、光矢、追矢、拘束矢）；世界觀的「潮」改「蝕」——蝕潮（口語「蝕」）、第一次蝕潮、蝕月、蝕盛／蝕歇（舊大潮／小潮）、蝕錨、蝕壓；蝕域不變。原文 `wf/workflows/planning/design-notes/terms.md`（以末段為準）。既有檔裡的舊詞**不要改**（另有改名線全庫處理）；你引用既有專名時（例如既有勢力名「殼學會」、既有地名）照原名寫，不自創替代名。與海洋本義相關的「潮」（潮間帶、潮汐）不在此列。
- **命名兩步**（`wf/workflows/content/polish.md`「首要標準」）：每個新名字先取英文原名（可帶拉丁／古典語根），想清楚意涵，再意譯（概念詞）或音譯（專有名詞）；不逐字直譯，寫完自問「這是不是英文詞換成漢字」。**英文原名不放 `aka`**（`aka` 只放中文別名）；英文原名與意涵寫進命名表 `naming.json`（見交付）。
- 不做：修改或刪除任何既有檔；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`package.json`、`content/base/world/lineages/`、`content/base/world/models/`、registries 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（driver、FIFO、筆記、log 一律放 `/tmp/cx-lc-ops/`）——閘門會把非允許路徑的新檔或改動記成越界。
- 件數 gate：新增／修改檔超過 15 件就停下回報；容量 gate：單檔超過 16 KB 或全部產物超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一檔跑一次，末行要 `OK 0 errors` |
| `node src/ops/content/check.ts content/base` | 動到 `content/base/world/` 每檔後跑，末行 `OK 0 errors` |
| `python3 wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/lint_world.py`（若存在；用法看檔頭） | 掃 world/ 禁用詞與常見錯 |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空（黃金不變） |
| `npm run sim:campaign -- --months 10` | 收尾跑一次，確認新事件在第 7 月後會跳、模擬不卡死（看事件數與存活） |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`、`columns`） | 讀規矩裡的 wf-table/1 資料檔（AGENTS 寫的 tabledb 在本專案的實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `wf/tools/inbox_poll.sh cx-lc-ops --once` | 每完成一步讀 orders／mail（在主 repo 路徑跑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh`） |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與「交付」列的報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-ops-01/`；可跑 testing 工作流列的驗證指令與測試；**不 commit**。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。MCP 的 `ui_screenshot` 不要用。
**子代理上限 2 個**：可以再派子 agent，模型隨意（量大呆板的活可用 gpt-6-luna 省成本），只准為推進正事開；子 agent 若做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，它們一樣只能寫本 worktree 的允許路徑（同一個閘門會檢查）。REPORT 記下開了幾個、什麼模型、做了什麼、品質如何。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑（例如找不到檔就換正確路徑）、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。（2026-10-24 試點兩條線因把 `tools/tabledb.py` 打成相對 worktree 根的錯路徑就停下，這不該停。）沙箱內 `node --test` 計數不準（每檔只算 1 項）是已知現象，不算阻塞，照實寫進 REPORT 即可。

## 工作

1. 讀「先讀」全部；讀既有 `content/base/world/events/` 全部檔名與 3–5 個範本（`restraint-night-knocks.json`、`ship-stowaway.json` 鏈）、`templates/default.json` 的事件型別、`dialogues/` 範本與 `content/base/persons/` 名單。
2. 定系列表（系列、每件一句梗、氣味／聲音／名詞）與命名表（事件標題、對白話題）。
3. 寫事件與對白；每檔後 `npm run check` 與 `node src/ops/content/check.ts content/base`。
4. `npm run sim:campaign -- --months 10` 看新事件有跳出、模擬不卡死；`npm test` 確認黃金不變。
5. 寫 `naming.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-ops-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/lc/wt-lc-ops-01/content/（範圍列的路徑）` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-ops-01/naming.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-ops-01/REPORT.md` |

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-24","columns":["id","nameEn","meaning","nameZh","method"],"rows":[…]}`，`method` 填意譯／音譯／混用；涵蓋每個新檔的顯示名（含新人物、新地點、新招式、新事件標題）。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——系列表與每件事件一行（id、系列、when 摘要、選項取捨）、對白每則一行、sim:campaign 數字（新事件跳出次數）；沒做到或證據不足的；需要決定的事）；再一段「子代理」（開了幾個、模型、做什麼、品質）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有**範圍列的新檔（`git -C . status --short` 除 `node_modules` 外只見這些），件數 ≤ 15。
2. worktree 內 `npm run check` 末行 `OK 0 errors`；`node src/ops/content/check.ts content/base` 末行 OK。
3. `npm test` 0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空。
4. 新隨機事件 8–11 件分 ≥3 系列、每件 `when` 含 `calendar.month >= 7` 與 dom 閘門、第一選項無 `requires`；對白 2–4 則。
5. `naming.json` 涵蓋每個新檔；新內容 0 個舊詞（殼／摹／殼甲／殼目／殼矢／原鞘；引用既有專名例外）、0 個禁用詞。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西；某個子代理的產出若不在這張清單上，就不要開它。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來**（沒跑成、拿不到證據）→ **保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-lc-ops`。本線團隊：`teams/lead-content`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-lc-ops --up DONE '一句自足結論' /tmp/cx-lc-ops/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-lc-ops --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「只新增範圍內的新檔＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

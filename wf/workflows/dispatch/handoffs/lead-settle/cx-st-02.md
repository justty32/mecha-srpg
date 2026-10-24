# 任務：在隔離 worktree 新增 lore 地點「聖馬洛」一檔（batch st-02，add 模式）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/world.md`、`content/lore/style.md`、`content/lore/README.md`、`content/lore/events/nine-gates.json`、`content/lore/places/istanbul.json`、`wf/workflows/dispatch/handoffs/lead-settle/guide.md`（相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同）。

## 背景與唯一目標

2107-04-15「九門同喪」（九闕喪鐘）事件已依裁示從伊斯坦堡搬到聖馬洛，但 lore 沒有聖馬洛這個地點，事件的 `places` 只好還指著伊斯坦堡。本批唯一目標：新增 `content/lore/places/saint-malo.json`，讓領導之後把事件引用改指它。

## 範圍（排除法寫死）

- 只新增這 1 個檔：`content/lore/places/saint-malo.json`（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-02/`）。
- 欄位照 `content/lore/README.md`「places」：`id` 為 `place/saint-malo`；`name`「聖馬洛城邦」；`aka` 可空；`region` 寫布列塔尼大西洋岸；`continent`「歐洲」；`world`「earth」；`kind`「城邦」；`status2108` 一句（內城守住、城外舊門道 2107 全毀）；`factions` 只能用已存在的 `faction/…` id（先 `ls content/lore/factions/` 確認；建議 `faction/rift-beasts`，可再加一兩個在歐洲大西洋岸說得通的既有勢力）；`gameRefs` 空陣列；`summary` 一句；`body` 300–1500 字，小節仿伊斯坦堡（地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼）；`tags` 中文。
- 內容口徑：聖馬洛是大西洋岸的城牆港，直面外洋，所以是**用機**的城（歐洲那把傘內，地中海岸的城離大洋遠而造機、大西洋岸的城直面外洋而用機——伊斯坦堡是堅盾產線城）；九門同喪的經過與 `nine-gates.json` 一致（舊貨場、九道拱門、守門兵、截城留門、叩闕甲得二名「九闕喪鐘」），不加新細節去改它。不寫潮差、潮高；不新增具名人物（可以寫「守門兵」「城邦護衛」這類無名角色）；不寫電磁、口徑等禁用詞（照 style.md）。
- 不做：任何既有檔（含 `nine-gates.json`、`timeline.json`、`istanbul.json`、`style.md`、`content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；worktree 內不要留任何其他檔（筆記放 `/tmp/cx-st-02/`）；不 commit。
- 件數 gate：新增或改動超過 1 個檔就停下回報；容量 gate：`body` 超過 1500 字就停下修短。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（0 錯）、`npm run check`（末行 `OK 0 errors`） | 寫完跑；**不用跑 `npm test`**（領導驗收會跑） |
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-02 status --short` | 確認只多一個檔 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-st-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上述 1 個新檔（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-02/`（只放 REPORT.md）；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 0 個**。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. 寫 `saint-malo.json`。
3. 跑檢查、確認 status。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-02/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新地點 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-02/content/lore/places/saint-malo.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-02/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**；「做了什麼」（含 summary 全文與 body 小節標題）；「沒做到或證據不足的」；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內只多 `content/lore/places/saint-malo.json` 一檔。
2. `node content/lore/check.ts` 0 錯、`npm run check` 末行 `OK 0 errors`。
3. 檔內沒有「潮差」，引用的 `faction/…` 都存在。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-st-02`。本線團隊：`teams/st`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-02 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-02 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-02/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「新增聖馬洛地點」；事件引用由領導改，你不動既有檔。

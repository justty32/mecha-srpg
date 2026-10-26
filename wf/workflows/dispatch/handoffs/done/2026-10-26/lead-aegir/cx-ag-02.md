# 任務：在隔離 worktree 依 ag-01 新設定替 4 個既有 lore 檔的 body 各補一兩句（batch ag-02，潤飾模式）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/world/aegir.md`、`content/lore/events/aegir-wakes.json`、`content/lore/events/aegir-lien.json`、`content/lore/events/first-bid-sheet.json`、`content/lore/factions/euro-umbrella.json`、`content/lore/factions/inner-sea-houses.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/cx-ag-02.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

上一批 ag-01 新增了歐洲那把傘（歐傘）、內海諸家、第一張標單（2102）、埃吉爾的帳單（2106）與埃吉爾認主事件（hidden，開局未發生）。既有的鹽鷗、茉莉、聖馬洛、鹿特丹條目還不知道這些。本批唯一目標：在下列 4 檔的 `body` 裡**各補一兩句**，讓它們與新設定咬合；其餘一字不動。

## 方法與禁忌（每條都適用）

- 節點優先、不暴力產 lore：只補規格寫的那一兩句，不新增段落、具名人物、地名、事件、機體名、招式名。
- 不拿其他作品類比；中文命名避免直譯（古代機本體叫古代機、外層叫裝甲；潮→蝕）；禁用詞照 style.md。
- 國家、塞勒涅、巨頭、家族只削弱不萬能；已裁示不推翻（埃吉爾**至今無人能認**——**絕不**寫它已認主或寫到認主事件、歸矢、「拆件的」）。
- 富豪與家族群像不點名。

## 範圍（排除法寫死）

- 只改這 4 檔的 `body` 欄（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-02/`）：`content/lore/factions/salt-gull.json`、`content/lore/characters/molly-van-den-berg.json`、`content/lore/places/saint-malo.json`、`content/lore/places/rotterdam-roost.json`。
- 不做：其他欄、其他檔（含 `content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；不新增、不刪除檔；不 commit；worktree 內不要留任何其他檔（筆記放 `/tmp/cx-ag-02/`）。
- 件數 gate：改動檔超過 4 個就停下回報；容量 gate：任一檔 body 增加超過 200 字就停下回報。任一觸發都停。

## 逐檔規格

1. `factions/salt-gull.json`：`## 軍事與作戰風格` 段尾補一句鹽鷗的規矩「離船作業一小時必撤」（茉莉從港務局排引水班帶來的：潮不等人）；`## 藍本與研發` 段尾補一句 2106 起埃吉爾在殘聯評等上登記成「鹽鷗的裝備」、押在一個內海家族手裡、按季寄帳單（照 aegir-lien，不點名家族）。
2. `characters/molly-van-den-berg.json`：`## 港務` 段補一句她從港務局帶走一隻懷錶、每一戰到一小時整就下令撤；`## 仇與停火` 或 `## 2108` 段補一句她為了修機簽了內海家族的契、帳單從不遲付（照 aegir-lien）。
3. `places/saint-malo.json`：`## 誰在這裡` 或 `## 2108 的狀態` 補一句：大潮援軍靠歐傘的標單分配，內海家族用現金標走好的獵團，聖馬洛付港費與賒帳；九門同喪那一夜，內海的船塢在賒帳賣機給大西洋岸——同一夜兩種歐洲。
4. `places/rotterdam-roost.json`：`## 2108 的狀態` 補一句：鹽鷗在歐傘的標單上議價、價格有公會上限；巢裡的人都知道斯卡蓋拉克那台古代機押在內海，帳單每季寄到港務大樓。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯） | 改完跑 |
| `npm run check`（末行 `OK 0 errors`） | 改完跑一次；不用跑 `npm test` |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ag-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（只寫內容檔）：只寫上列 4 檔（worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-02/`；不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 0 個**。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-ag-02 --up PROGRESS '已讀完先讀清單，開始潤飾 ag-02' < /dev/null`）。
2. 照逐檔規格改 body。
3. 跑檢查；寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-02/REPORT.md`**（被擋改寫同目錄 `report.md`），回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的 4 檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-02/content/lore/…` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-02/REPORT.md` |

REPORT：開頭「已讀清單」；逐檔附「新增句」全文；需要決定的事；末尾「以後交接書該點名的工具」。

## 驗收（固定 3 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. REPORT 存在且開頭有「已讀清單」、逐檔附新增句。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好發 `FAILED`，REPORT 寫證據。
- **測不出來** → 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ag-02`。本線團隊：`teams/aegir`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ag-02 --up DONE 'ag-02 四檔 body 補句完成，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-02/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

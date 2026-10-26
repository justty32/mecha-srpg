# 任務：在隔離 worktree 依已審計畫新增歐洲 4 人物與 3 事件，並做 3 處純插入（batch ag-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/dispatch/handoffs/lead-aegir/ag-03/plan.md`、`wf/workflows/dispatch/handoffs/lead-aegir/cx-ag-03.md`（本檔）；另讀計畫引用的既有檔（`content/lore/places/{rotterdam-roost,saint-malo,hamburg,genoa-yards}.json`、`content/lore/events/{first-bid-sheet,nine-gates,credit-accord,first-hunting-bands}.json`、`content/lore/characters/{molly-van-den-berg,greg-olsen}.json`），這些不必列進已讀清單。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

計畫線已寫好 `ag-03/plan.md`（領導審過，**照它做**）：歐洲那一盤補 4 個具名普通人（莉娜・菲瑟、克萊兒・雷諾、奧斯卡・林德、瑪塔・貝里尼）與 3 件歷史事件（鹿特丹沉堤 2089-04、遷簿令 2093-08、空城押契 2099-10）。本批唯一目標：把計畫第 4 節七件寫成 lore 檔、照第 5 節插年表、照下面「插入」做兩處既有檔插入，文筆與口吻打磨到像人寫的。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件照計畫的掛點、前因、經過、後果、2108-01 狀態寫；不加計畫以外的具名人物、地名、事件、機體名、怪獸。
- **不拿其他作品類比**；**中文命名避免直譯**（名字照計畫，不另取）；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`（古代機本體叫古代機、外層叫裝甲；潮→蝕）；禁用詞照 style.md。
- **國家、塞勒涅、巨頭、家族只削弱不萬能**；國家縮而不死（法理、登記簿、徵召、地契還在）；塞勒涅只是窗口、不買死人的債。
- **已裁示不推翻**；既有 lore 除下列插入外一字不改。
- **富豪與內海家族群像不點名**；**埃吉爾的認主者不點名、不出現**。
- 人物英文原名放 `aka`（計畫已說明）；人物檔 `kind: "human"`、`gameRefs: []`。
- 不寫數值、不造機甲型號或怪獸資料。

## 範圍（排除法寫死）

- 新增只限這 7 檔（worktree 的 `content/lore/` 下）：`characters/lena-visser.json`、`characters/claire-renaud.json`、`characters/oskar-lind.json`、`characters/marta-bellini.json`、`events/rotterdam-breach.json`、`events/inland-registers.json`、`events/coastal-mortgage.json`。
- 修改只限這 3 檔且**只准插入**（加鍵、陣列尾端加元素；既有內容一字不動）：`timeline.json`（計畫第 5 節三條，插在指定排序位置）、`characters/molly-van-den-berg.json`（`relations` 尾端加一列 `character/lena-visser`，relation「港務舊同事」，note 一句）、`events/first-bid-sheet.json`（`characters` 陣列加 `character/oskar-lind`）。
- 計畫第 6 節其他「建議插入」（body 補句、credit-accord）**本批不做**。
- 不做：上列以外的任何檔；不刪檔；不 commit；worktree 內不要留其他檔（筆記放 `/tmp/cx-ag-03/`）。
- 件數 gate：新增加修改超過 10 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（worktree 根，0 錯；警告不得比改前多） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；不用跑 `npm test` |
| `python3 wf/tools/tabledb.py 檔名 add 欄=值 …` | 寫 review 檔（見交付） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ag-03 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（只寫內容檔）：只寫上列檔（worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-03/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-03/`；不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意（例：一個寫人物、一個寫事件，或一個審語感）；做實質工作的也要親讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-ag-03 --up PROGRESS '已讀完先讀清單，開始寫 ag-03' < /dev/null`）。
2. 寫 3 事件、4 人物；做插入。
3. 通讀一遍改文筆口吻（短句、具體畫面、少概念詞堆疊，照 lore-text 潤飾準則）；跑檢查。
4. 把 `ag-03/review-draft.json` 改成定稿（每件一列，白話一到兩句、不超過 60 字、說它是什麼與為什麼存在；掛到寫節點／主線／年表／底色條），另存為 `ag-03/review.json`。
5. 寫 REPORT 並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增與插入的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-03/content/lore/…`（上列 10 檔） |
| review 定稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-03/review.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-03/REPORT.md`（被擋改寫同目錄 `report.md`） |

REPORT：開頭「已讀清單」；做了什麼（逐檔一句＋掛點）；沒做到的；需要決定的事（與計畫或既有 lore 的出入）；末尾「以後交接書該點名的工具」。回覆只要 5 行摘要＋REPORT 路徑。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 不多於改前。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 7 個新檔存在、檔名＝id name 段；`ag-03/review.json` 合法、7 列。
4. REPORT 存在且開頭有「已讀清單」。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好發 `FAILED`，REPORT 寫證據。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ag-03`。本線團隊：`teams/aegir`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ag-03 --up DONE 'ag-03 新增 4 人物 3 事件、插入 3 檔，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-03/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

# 任務：替 lore 批次 af-02 寫計畫書 PLAN.md（只寫計畫，不寫 lore 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**），再讀 `wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`，以及產出交接書 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/cx-af-02.md` 全文與它「先讀」行點名的每個設定與 lore 檔。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

使用者定的內容流程是「計畫 → 產出 → 數值」。af-02 的產出交接書（cx-af-02.md）已寫好逐檔規格；你的唯一目標是在動筆前寫一份計畫書，讓領導審：每件的設計理念、要掛到哪些節點／主線／底色、要達成什麼、與既有 lore 的關係（會不會撞、要引用誰）、白話介紹草稿。**你不寫任何 lore 檔。**

## 方法與禁忌

- 節點優先、不暴力產 lore：每件說清楚前因與後果；發現規格裡有與既有 lore、設定筆記矛盾或重複的地方，在計畫書「風險與矛盾」段逐條列出並給建議，不自己改規格。
- 不拿其他作品類比；中文命名避免直譯（古代機、裝甲、蝕潮）；國家、塞勒涅、巨頭只削弱不萬能；已裁示不推翻；新名詞標提案；真相用 visibility；群像為主、不新增規格外具名人物。
- 用 `grep -rl` 在 `content/lore/` 查既有條目有沒有寫過同一地點、人物或事件（例：科托努已由別線寫成黑幫城市）。

## 範圍（排除法寫死）

- 只寫一個檔：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/PLAN.md`。
- 不做：任何 `content/` 下的檔、交接書、manifest、`wf/` 其他檔；不 commit；不上網。
- 件數 gate：計畫書只涵蓋交接書列的 11 件，不加件；容量 gate：PLAN.md 超過 12 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `grep -rl 科托努 /home/lorkhan/repo/game_dev/mecha-srpg/content/lore/` | 查重與查引用（把「科托努」換成要查的詞） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-af-02p --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**（只產一份計畫書）：可寫只有 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/PLAN.md`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意，同受本交接書約束。
- 分清錯誤來源：工具本身壞掉或沙箱拒寫 → `BLOCKED`；自己打錯路徑 → 自己修。

## 工作

1. 讀完先讀清單。
2. 逐件查重、查引用。
3. 寫 PLAN.md 並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫書 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/PLAN.md` |

PLAN.md 結構：開頭「已讀清單」；`## 設計理念`（這一批整體要讓本區多出什麼，一段）；`## 相關概念`（會用到的既有設定詞，一行一個附出處）；`## 逐件`（11 件，每件：檔、掛到、要達成什麼、與既有 lore 的關係與要引用的 id、白話草稿 ≤ 60 字）；`## 風險與矛盾`；`## 建議（可選）`。

## 驗收（固定 3 條，一條不多，做完就停）

1. PLAN.md 存在、≤ 12 KB、開頭有「已讀清單」。
2. `## 逐件` 恰 11 件，每件都有白話草稿且 ≤ 60 字。
3. 終局 STATUS 已發。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修到過；修不好發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-af-02p`。本線團隊：`teams/fill-af`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-02p --up DONE 'af-02 計畫書 11 件、風險 N 條' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/PLAN.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

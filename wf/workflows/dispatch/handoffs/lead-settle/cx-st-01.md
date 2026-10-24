# 任務：在隔離 worktree 修掉 11 個內容檔裡的既有 lore 矛盾（batch st-01，只改文字欄）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/dispatch/handoffs/lead-settle/guide.md`（相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同）。

## 背景與唯一目標

前一輪 polish 工人回報了幾處 lore 互相矛盾（年份、地點、天數、白手套早期口徑、堅盾血統）。本批唯一目標：照下表的**統一口徑**把這 11 個檔的文字欄改到彼此一致，句子讀起來仍是自然的中文。**既有說法保留**：表上沒點名的句子不動，不新增人物、事件、專名。

## 範圍（排除法寫死）

只改這 11 個檔（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-01/`）。命中只是候選，讀過判斷不必改就在 REPORT 寫「無需改」與理由：

| 檔 | 統一口徑與要改的地方 |
|---|---|
| `content/lore/characters/jonas-halvorsen.json` | 他 2071 年死；十八年後 2089 第一次蝕潮；月面背面裂開是 2097，所以「再二十六年背面裂開」改成「再八年」一類說法（「背面」是月面地理義，保留）。 |
| `content/base/world/events/port-farside-sealed-crate.json` | 機魂不能獨駕。販子說的「替駕整場」改成座艙裡仍有人（例：駕駛員昏在座艙裡，魂替他撐完整場），保留販子誇口的語氣與「稀罕到一輩子遇不上幾回」的原意。 |
| `content/lore/events/whiteglove-incident.json` | **白手套口徑**：女武神是白手套的機體名。2098 年第一次罷工時的原型是**人駕的女武神保全機**（沒有精粹核，只打得了人），鎮壓得很難看；2105 第二次罷工，女武神第一次改成無人鐵偶上陣；2106 無人版女武神以 A 級型錄鐵偶正式入型錄。本檔「2098 年白手套的鐵偶原型還要人員監看、下令」改成人駕原型的說法；手套早年坐在人駕女武神副座上照舊。 |
| `content/lore/characters/zheng-weizhou.json` | 同白手套口徑：「一隊由人駕駛的白色衍型機」改成人駕的女武神原型（白手套沒有精粹核，不是衍型機）。 |
| `content/lore/factions/selene.json` | 同白手套口徑：`mechSeries` 裡女武神那條的「2106」寫明是無人版入型錄的年份；body 若與口徑衝突才改。 |
| `content/lore/factions/whitegloves.json` | 同白手套口徑：「人駕的保全機」可改成人駕的女武神原型；其餘與口徑一致就不動。 |
| `content/lore/factions/quito.json` | **堅盾口徑**：堅盾來自 2092 年衍二・堅盾、2093 年秦望舒公刻；安地斯壁（2094）是基多以維拉科查為藍本造的第一台重裝衍型機，是高原衛重裝與光幕一路的源頭，**不是堅盾系列之祖**。`ancientMech.doctrine` 照此改；「堅盾牆」當打法描述可留。 |
| `content/lore/events/titicaca-dig.json` | 同堅盾口徑：consequences「成為堅盾系列之祖」照此改。 |
| `content/lore/events/rift-valley-dig.json` | **恩凱位置**以 `content/lore/places/rift-valley-seat.json` 為準：在大裂谷「谷西的崖壁上」、風蝕成王座形的凹室。本檔「大裂谷底那處遺跡」「坐在大裂谷底」改成谷西崖壁的說法。 |
| `content/lore/characters/samir-khan.json` | **2096 回孟買蝕域停留**以 `content/lore/events/kali-found.json` 的「十九天」為準：2096 那段「三個月後他從孟買門出來」改成十九天。2089 第一次走出蝕域的「三個月」不動。 |
| `content/lore/factions/league.json` | `scale` 的「牆內住著地球三分之一的人」與已定數字衝突（guide.md D1：全球牆內 10 億＝四分之一；南亞傘約 10 億人）。改成與 D1 一致的說法（例：南亞傘轄下約十億人、多半住在野地），不加 D1 以外的新數字。 |

- 只改文字欄：`name`、`title`、`summary`、`body`、`desc`、`description`、`text`、`label`、`brief`、`lines`、`phrase`、`phrases`、`badge`、`note`、`aka`、`epithet`、`flavor`；**所有檔（含 base）**另可改敘述欄：`consequences`、`role`、`scale`、`doctrine`、`ideology`、`silhouette`、`status2108`、`region`、`hq`、`mechSeries`、`relation`、`tags`（`tags` 只改中文標籤）。id、檔名、日期、數字、引用（`kind/name` 形式）、鍵、陣列長度一律不動——閘門逐節點比對，動了就退件。
- 不做：上列以外的任何檔（含 `nine-gates.json`、`timeline.json`、`style.md`、`content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；不新增、不刪除檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-st-01/`）。
- 件數 gate：改動檔超過 11 個就停下回報；容量 gate：任何單檔改後比原檔長 10% 以上就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-01 grep -nE '二十六年|替駕|人員監看|白色衍型機|堅盾系列之祖|大裂谷底|三個月|三分之一' -- content` | 改前找點、改後核殘留 |
| `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯）、`node src/ops/content/check.ts content/base`（改到 base 檔） | 改完跑；**不用跑 `npm test`**（領導驗收會跑；沙箱裡 `src/mcp` 有兩個測試失敗是已知現象，不算阻塞） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-st-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-01/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **報告目錄只放 REPORT.md**：不寫全文傾印（整檔內容、整份 diff、整份 grep 輸出）；逐檔對照只取含改動的半句。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. 逐檔改：找表上點名的句子，照口徑改文字欄。
3. 全部改完 grep 殘留、跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-01/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-01/content/…`（上列路徑） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-01/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列親自讀過的路徑）；「做了什麼」；「逐檔對照」（每檔一小節，列每處「舊片段 → 新片段」，片段取半句；沒改的檔寫「無需改」與理由）；「殘留」（grep 命中仍留的每處＋理由）；「沒做到或證據不足的」；「需要決定的事」（與別檔事實衝突、要改數值或結構的地方）；「子代理」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動只落在上列檔案（`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/st/wt-st-01 status --short` 除 `node_modules` 外只見這些）。
2. `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯）全過。
3. 表上 11 處口徑都已落地，或在 REPORT 寫明「無需改」的理由；grep 殘留每處有理由。
4. REPORT 有逐檔對照。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-st-01`。本線團隊：`teams/st`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-01 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-st-01 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-settle/st-01/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「照統一口徑消除矛盾」；任何需要改其他檔或改結構的需求一律寫進 REPORT，不動手。

# 任務：在隔離 worktree 依已審計畫產出南亞＋東南亞＋群島的 13 件 lore 並純插入年表（batch fill-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`（含「可見度」一節）、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill/fill-03-plan/PLAN.md`（**本批的設計依據**；worktree 裡沒有這份，讀主 repo 絕對路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill/fill-03-plan/PLAN.md`，同目錄 `review-draft.json` 也讀）、`wf/workflows/dispatch/handoffs/lead-fill/cx-fill-03.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

lore 填充層第二批。計畫已由計畫工人寫好、領導審過（PLAN.md）：13 件新檔——6 事件、4 地點、3 人物，分布在達卡、吉大港、第七哨、菲律賓、印尼、馬六甲海峽、蘇拉特、孟買門。你的**唯一目標**：照 PLAN.md 把這 13 件寫成 lore JSON、年表純插入 6 條，文筆與口吻打磨到位。

**領導對計畫的裁定**（優先於 PLAN.md 的「需要領導決定」段）：
- 望加錫（自由城市）、三寶顏（空城）落點採用；第 13 件施粥者照計畫寫（教派的殘酷留著，不寫純惡臉譜）；本批新名與「補天院」「還鄉院」照計畫用，一律標提案。
- PLAN.md「既有檔只插入的修改建議」兩件**本批不做**（不改 dhaka.json、surat.json）。
- 年表：6 件新事件各插入一條帶 `event` 欄的條目；不改既有條目（包括「2107 第七哨砲台修復」——第 3 件另立新條目，標題與既有不同）。

## 方法（必守）

- **節點優先**：每件事件都要掛到某個節點（N01–N10，見 `history-nodes.json`）、主線（A–H，見 `history-lines/lines.md`）、年表條目、或「崩年的底色」某一句（1.1–1.13）；REPORT 每件寫明掛哪裡、前因是什麼、後果是什麼。沒有因果的不寫——**不暴力產 lore**。
- 不拿其他作品（遊戲、電影、小說）類比；量級用世界內的詞。
- 中文命名避免直譯（兩步命名，見 polish.md「首要標準」）：古代機本體叫古代機、外層叫裝甲；潮→蝕（蝕潮、蝕月…；海洋本義的潮汐照用）。
- 國家、塞勒涅、巨頭**只削弱不萬能**；已裁示的不推翻（設定優先序見 lore README）。新名詞（地名以外的專名、制度名、儀式名）標「提案」：在 REPORT 與 `naming.json` 列出。
- 世界觀真相用 lore 的可見度欄（`secrets` 的 `hidden`／`rumor`、`fieldVisibility`）；`summary`／`body` 照外界口吻寫，真相不寫進敘述。
- 具名人物只限 PLAN.md 的三位（rokeya-karim、lira-santos、meera-naik）；其餘用群像或只在本文出現一次的小人物（不建檔）。
- **基調**：第一批文筆紮實但偏冷偏寫實；style.md 要「敢誇張、敢浪漫、敢中二，冷硬底色上蓋一層神話的光」。PLAN.md 每件都有「這件的光」，**每篇必須保住並寫亮那個意象**，不要寫成設定解說。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill/wt-fill-03/` 新增 PLAN.md 清單 01–13 的 13 個檔，**檔名與 id 照 PLAN.md 的「預定檔名」**（`content/lore/events/` 6 件、`places/` 4 件、`characters/` 3 件）；每件的掛點、前因後果、2108-01 狀態、與既有 lore 的關係照 PLAN.md，不得與它列的既有事實矛盾。
- `content/lore/timeline.json` **只插入** 6 件新事件各一條（帶 `event` 欄；依 date 升冪插入；不改、不刪、不重排既有條目）。
- 欄位照 `content/lore/README.md`（events／places／characters 節）與 `lore-text.md`：body 300–1500 字、`## ` 小標 3–5 個；事件 `consequences` 一句一條、`period` 與 `date` 落在 era 內；人物 `relations`／`events` 只引既有或本批新增 id，人物檔的 `events` 列本批相關新事件；地點 `status2108` 一句。開場（2108-01）後的條目 tag `rumor`。
- 不寫阿鏽、伊爾瑟上船、埃吉爾、鹽鷗；不設計機甲型號或怪獸（只引既有）；地理只限南亞、東南亞、群島。
- 不做：修改或刪除任何既有檔（`content/lore/timeline.json` 純插入除外）；`factions/`、`eras/` 不新增不修改；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`content/base/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-fill-03/`）。
- 件數 gate：新增／修改檔超過 14 件就停下回報；容量 gate：你新增的單檔超過 16 KB，或新增／插入內容合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑，0 錯 |
| `npm run check` | 收尾跑，末行 `OK 0 errors` |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（`history-nodes.json`、`history-timeline.json`、`history-lines.json` 等；實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fill-03 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill/fill-03/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 2 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準、子程序 EPERM 是已知現象，照實寫進 REPORT，不算阻塞。

## 工作

1. 讀「先讀」全部；照 PLAN.md 每件「與既有 lore 的關係」讀它點名的既有檔。
2. 逐件寫檔；每檔後 `node content/lore/check.ts`。
3. 插入年表 6 條。
4. `npm run check`、`npm test` 收尾（沙箱內子程序 EPERM 造成 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts` 失敗是已知現象：照實寫進 REPORT、**不算阻塞、不必停下**，領導會在沙箱外重跑）；寫 `naming.json`、`review.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill/fill-03/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新 lore 檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill/wt-fill-03/content/lore/{events,places,characters}/` |
| review 表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill/fill-03/review.json`（wf-table/1，欄 `檔`／`類別`／`名稱`／`白話`／`掛到`；每個新檔一列，白話一到兩句 ≤ 60 字、給人看；可從 PLAN 的 review-draft.json 改寫，以成品為準） |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill/fill-03/naming.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill/fill-03/REPORT.md` |

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，`method` 填意譯／音譯／混用，`status` 填「既有」或「提案」；涵蓋每個新檔的顯示名與文中新出現的專名。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——每件一行：id、date、era、掛到哪個節點／線／年表條目／底色句、前因→後果一句；沒做到或證據不足的；需要決定的事，含你發現的既有 lore 矛盾）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 7 條，一條不多，做完就停）

1. worktree 內的改動**只有** PLAN.md 的 13 個新檔與 `content/lore/timeline.json` 純插入（`git status --short` 除 `node_modules` 外只見這些）。
2. worktree 內 `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`；`npm test` 除上述三個已知 EPERM 檔外 0 fail。
3. 13 件檔名、id、類別逐一對上 PLAN.md；6 件事件都在 timeline 有一條帶 `event` 的條目。
4. REPORT「產出」每件寫明掛點、前因→後果、「這件的光」落在哪一句。
5. `naming.json` 涵蓋每個新檔；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞；引用既有專名例外）、0 個 style.md 禁用詞。
6. `review.json` 每個新檔恰好一列，白話 ≤ 60 字。
7. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fill-03`。本線團隊：`teams/fill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fill-03 --up DONE '一句自足結論' /tmp/cx-fill-03/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-fill-03 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增 PLAN.md 的 13 個檔＋timeline 純插入＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

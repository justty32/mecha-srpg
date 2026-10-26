# 任務：在隔離 worktree 新增 5 處崩年後續代表地的 lore 地點（batch fill-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`（含「可見度」一節）、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/cx-fill-02.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

世界框架（崩年前、國家縮而不死、城邦類型、崩年的底色）2026-10-26 剛定，lore 進入**填充層**。本批只做 **5 個地點檔**，各當一種崩年後城市類型的代表：每處寫「**崩年前是什麼 → 崩年怎麼變 → 2108-01 是什麼**」，讓空城、自由城市、黑幫城市、公司城在 lore 裡有實地可指。

## 方法（必守）

- **節點優先**：每件事件都要掛到某個節點（N01–N10，見 `history-nodes.json`）、主線（A–H，見 `history-lines/lines.md`）、年表條目、或「崩年的底色」某一句（1.1–1.13）；REPORT 每件寫明掛哪裡、前因是什麼、後果是什麼。沒有因果的不寫——**不暴力產 lore**。
- 不拿其他作品（遊戲、電影、小說）類比；量級用世界內的詞。
- 中文命名避免直譯（兩步命名，見 polish.md「首要標準」）：古代機本體叫古代機、外層叫裝甲；潮→蝕（蝕潮、蝕月…；海洋本義的潮汐照用）。
- 國家、塞勒涅、巨頭**只削弱不萬能**；已裁示的不推翻（設定優先序見 lore README）。新名詞（地名以外的專名、制度名、儀式名）標「提案」：在 REPORT 與 `naming.json` 列出。
- 世界觀真相用 lore 的可見度欄（`secrets` 的 `hidden`／`rumor`、`fieldVisibility`）；`summary`／`body` 照外界口吻寫，真相不寫進敘述。
- 群像為主，**不新增具名人物檔**；地點裡可提無名群像，或只在本文出現一次的小人物（不建檔）。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill/wt-fill-02/` 新增 `content/lore/places/*.json` **恰好 5 件**（先 `ls content/lore/places` 避免撞名）：
  1. `places/khulna.json` **庫爾納**（亞洲・恆河三角洲西南，`kind` `遺跡` 或 `其他`）——**空城**（polity「空城」、底色 1.5）：崩前是三角洲的港城與工業城；崩年供應鏈斷被棄，不是蝕域，只是沒人了；2108 在淺蝕邊緣，拆船幫的散工、撈屍船、歸還黨招募或養裂傳聞可能長在那裡（挑一兩樣，不全塞）。產權照 polity「國家默許、債主不許」寫，但孟加拉國是國家最接近失能的地方，國家的「默許」本身就很薄。可與既有 `places/delta.json`、`places/reed-marsh.json` 呼應，不重複它們。
  2. `places/phoenix.json` **鳳凰城**（北美・美國西南內陸沙漠，`kind` `遺跡` 或 `其他`）——**內陸空城**：示範「空城不是蝕域」與底色 1.4（「遠而便宜」翻成「近而能吃到」）：靠遠方的水與糧活的沙漠巨城，崩年鏈一斷就餵不飽。美國是國家型、沒縮多少、拒用「傘」字（before-collapse-powers）：國家的法理與登記簿都在、徵召有效，只是沒有理由回來；是否把地契抵押給月亮**不要斷言**，可寫成傳聞（`rumor`）。
  3. `places/cartagena.json` **卡塔赫納**（南美・加勒比海岸，`kind` `城邦` 或 `港`）——**自由城市**（city-types 已定：約二十座、聯盟型傘地帶最多，拉美是其一；國家型傘境內沒有）：三條成因挑兩條為主（國家沒來的港／跨線的市場／獵團的母港）；城約（提案名，city-types）怎麼運作、誰坐席；只削弱不萬能——守得住靠的是沒人值得為它打一仗。可與既有 `factions/ring-caravan.json`（環線商隊，已定為自由城市的一種）、拉美傘既有設定咬合，不改它們。
  4. `places/cotonou.json` **科托努**（非洲・西非貝寧灣，拉哥斯蝕域外圍以西，`kind` `城邦` 或 `港`）——**黑幫城市**（city-types 已定：約十座；不認獵牌評等、白手套催收權管不到）：是拉哥斯蝕匪邦的出海口與帳房（city-types）；與既有 `places/lagos-blight.json`、`places/green-line.json`、`events/green-line-purge.json`（2107 清剿）、`places/accra.json` 咬合但不改它們。賣什麼、幫規是什麼、2107 清剿之後它怎麼活下來。
  5. `places/batangas.json` **八打雁**（亞洲・呂宋島南岸，`kind` `城邦` 或 `港`）——**公司城**（polity、magnates：握地熱井的舊能源巨頭當城主；法理仍屬國家，日常由公司管）：崩前的能源公司怎麼在崩年變成城主；國家（菲律賓，群島傘的聯盟型成員）的法理還在、公司與國家誰讓誰；製藥或其他巨頭可順帶一筆。公司名是新專名，照兩步命名、標提案。
- 每檔欄位照 `content/lore/README.md` places 節：`region`、`continent`（九選一）、`factions`（只引既有 `faction/…`，可空陣列）、`kind`、`world` `earth`、`status2108` 一句；body 300–1500 字，建議小標：`## 崩年前`、`## 崩年`、`## 誰在這裡`、`## 2108 的狀態`、`## 獵團能在這裡幹什麼`（可微調，但「崩年前→2108」的結構要清楚）。適合處用 `secrets`（hidden／rumor）。
- 不寫埃吉爾、鹽鷗、歐傘相關（另一條線負責）；不寫歐洲地點。
- 不做：修改或刪除任何既有檔（含 `timeline.json`——地點不進年表）；`events/`、`characters/`、`factions/` 一律不新增不修改；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`content/base/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-fill-02/`）。
- 件數 gate：新增／修改檔超過 5 件就停下回報；容量 gate：你新增的單檔超過 16 KB，或新增內容合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑，0 錯 |
| `npm run check` | 收尾跑，末行 `OK 0 errors` |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（`history-nodes.json`、`history-timeline.json`、`history-lines.json` 等；實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fill-02 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-02/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準是已知現象，照實寫進 REPORT。

## 工作

1. 讀「先讀」全部；讀 `content/lore/places/` 下幾個既有地點當範本（`dhaka.json`、`chittagong.json`、`delta.json`、`reed-marsh.json`、`lagos-blight.json`、`accra.json`、`green-line.json`、`mexico-city.json`、`quito.json`），以及 `factions/{ring-caravan,league,selene,whitegloves,green-line}.json`、`events/green-line-purge.json`、`eras/`。
2. 定 5 處清單（id、一句梗、掛哪條底色／city-types 段／polity 段）與命名表。
3. 寫檔；每檔後 `node content/lore/check.ts`。
4. `npm run check`、`npm test` 收尾；寫 `naming.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-02/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新地點檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill/wt-fill-02/content/lore/places/` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-02/naming.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-02/REPORT.md` |

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，`method` 填意譯／音譯／混用，`status` 填「既有」或「提案」；涵蓋每個新檔的顯示名與文中新出現的專名。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——每件一行：id、城市類型、掛到哪條底色句／city-types 或 polity 段、崩年前→2108 一句；沒做到或證據不足的；需要決定的事，含你發現的既有 lore 矛盾）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有** 5 個新地點檔（`git status --short` 除 `node_modules` 外只見這些）。
2. worktree 內 `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`；`npm test` 0 fail。
3. 5 處逐一對上範圍第 1–5 項的 id 與城市類型；每處 body 都有崩年前與 2108 狀態兩段。
4. REPORT「產出」每處寫明掛點。
5. `naming.json` 涵蓋每個新檔；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞；引用既有專名例外）、0 個 style.md 禁用詞。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fill-02`。本線團隊：`teams/fill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fill-02 --up DONE '一句自足結論' /tmp/cx-fill-02/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-fill-02 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增 5 個地點檔＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

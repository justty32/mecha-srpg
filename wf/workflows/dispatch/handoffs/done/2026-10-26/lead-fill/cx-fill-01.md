# 任務：在隔離 worktree 新增開局舞台周邊的 7 件 lore 事件並純插入年表（batch fill-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`（含「可見度」一節）、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/cx-fill-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

世界框架（崩年前、國家縮而不死、城邦類型、崩年的底色）2026-10-26 剛定，lore 進入**填充層**：把地方與人物在特定時間的狀態填進去。本批只做開局舞台（孟加拉灣：達卡、吉大港、第七哨、候鳥號）周邊的 **7 件事件**。孟加拉灣戰役（`events/bay-of-bengal-campaign.json`）與候鳥號誕生（`events/migrant-split.json`）**已存在、不重寫**，你寫的是它們的前因、旁支與後續。

## 方法（必守）

- **節點優先**：每件事件都要掛到某個節點（N01–N10，見 `history-nodes.json`）、主線（A–H，見 `history-lines/lines.md`）、年表條目、或「崩年的底色」某一句（1.1–1.13）；REPORT 每件寫明掛哪裡、前因是什麼、後果是什麼。沒有因果的不寫——**不暴力產 lore**。
- 不拿其他作品（遊戲、電影、小說）類比；量級用世界內的詞。
- 中文命名避免直譯（兩步命名，見 polish.md「首要標準」）：古代機本體叫古代機、外層叫裝甲；潮→蝕（蝕潮、蝕月…；海洋本義的潮汐照用）。
- 國家、塞勒涅、巨頭**只削弱不萬能**；已裁示的不推翻（設定優先序見 lore README）。新名詞（地名以外的專名、制度名、儀式名）標「提案」：在 REPORT 與 `naming.json` 列出。
- 世界觀真相用 lore 的可見度欄（`secrets` 的 `hidden`／`rumor`、`fieldVisibility`）；`summary`／`body` 照外界口吻寫，真相不寫進敘述。
- 群像為主，**不新增具名人物檔**；事件裡可提無名群像，或只在本文出現一次的小人物（不建檔、不進 `characters` 欄）。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill/wt-fill-01/` 新增 `content/lore/events/*.json` **恰好 7 件**（檔名自取 kebab，先 `ls content/lore/events` 避免撞名），題目如下：
  1. **吉大港成為黑幫城市**（建議 date `2106`，era/league；正文從崩前講起）：崩前是世界最大的拆船場（magnates「航運物流」倒→拆船幫）；崩年到碎國國家沒來、拉希德的幫規成了城的法；2106 殘聯成立、獵牌法頒布時，吉大港**沒有成為殘聯成員城邦**，也不讓獵牌評等與白手套催收在城裡生效（city-types「黑幫城市」已定 2026-10-26：不認獵牌評等、白手套催收權管不到）。必須和既有事實共存：殘聯軍械庫授權拆船幫造獵犬-II型、默許長槍-V4、殘聯是大客戶、2106 鹽鷗鐵砧停火在吉大港由殘聯斡旋——讀法：殘聯買的是貨、借的是桌子，城本身不簽約（這是提案讀法，寫進 REPORT）。掛：city-types 成因、底色 1.4／1.6、N08。
  2. **達卡縮城、紡織公會上牆**（建議 date `2090` 或 `2091`，era/first-tide 或 era/mimic-dawn）：崩前達卡是千萬人的首都巨城；崩年供應鏈斷、城縮到「一夜守得住、一月餵得飽」的大小，全城只剩紡織公會還能讓幾萬人準時上工，於是它開始管牆（`factions/dhaka-weavers.json` 已有這句，展開它）。南亞是國家最接近真的失能的地方（polity、before-collapse-powers）：寫國家「縮到只剩紙」而不是「滅亡」，哈米德的「國家沒了」是外界口吻。掛：底色 1.4、1.5、1.6，N03。
  3. **第七哨唱名夜**（建議 date `2102` 起，era/tide-line；可寫成第一次唱名與之後每年的慣例）：「唱名夜」是底色 1.8 的提案名（哀悼變成點名）；第七哨收容的孩子名單（`factions/bay-seventh-post.json`）與唱名如何長在一起；2089–2092 出生斷層（底色 1.1）讓名單上幾乎沒有十六到十九歲的人。不要讓努爾成為主角（她只能在場）。
  4. **阿九上船**（2103，接 `events/dhaka-unbinding.json` 之後、era/tide-line）：老桂在北郊撿到陳小海；陳小海生於 2090，是斷層年的孩子（底色 1.1）。掛：底色 1.8（孤兒、獵團成了家）、E 線。
  5. **葛西蓮上船**（2105 解拘之夜之後到 2106，era/tide-line 或 era/league）：接 `events/chittagong-unbinding.json`；老桂那句「先學會不把船上的人也當成仇人」已有，展開上船的過程，不改既有台詞。
  6. **老班上船**（日期自定，落在 2103–2107；老班是前殘翼軍醫，見 `characters/old-ben.json`、`factions/remnant-wings.json`）：為什麼一個軍醫會來當窮獵團的廚子，要掛到殘翼或空援的某條既有事實。
  7. **賽義德上船**（2107 年底，era/league；`characters/sayeed.json`：織工衛出身、怕高、上船不到兩個蝕月老桂就死了）：公會把織工的兒女交給候鳥號——接「公會欠老桂一條命」。
- 不寫伊爾瑟上船（年表已有 2107「伊爾瑟上候鳥號」條目，不能改既有條目）；不寫阿鏽（方向待使用者定）；不寫埃吉爾、鹽鷗、歐傘相關（另一條線負責）。
- `content/lore/timeline.json` **只插入**本批 7 件事件對應的年表條目（每件一條，帶 `event` 欄；依 date 升冪插入正確位置；不改、不刪、不重排既有條目）。
- 欄位照 `content/lore/README.md` events 節與 `lore-text.md`：body 300–1500 字、`## ` 小標 3–5 個、`consequences` 一句一條、`period` 與 `date` 落在該 era 內、錨點日期不可動。
- 不做：修改或刪除任何既有檔（`content/lore/timeline.json` 純插入除外）；`characters/`、`places/`、`factions/` 一律不新增不修改；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`content/base/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-fill-01/`）。
- 件數 gate：新增／修改檔超過 8 件就停下回報；容量 gate：你新增的單檔超過 16 KB，或新增／插入內容合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑，0 錯 |
| `npm run check` | 收尾跑，末行 `OK 0 errors` |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（`history-nodes.json`、`history-timeline.json`、`history-lines.json` 等；實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fill-01 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-01/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準是已知現象，照實寫進 REPORT。

## 工作

1. 讀「先讀」全部；讀 `content/lore/` 下 `places/{dhaka,chittagong,delta,bay-tide-line,migrant-bird}.json`、`factions/{dhaka-weavers,chittagong-breakers,bay-seventh-post,migrant-crew,league,league-armory,remnant-wings}.json`、`characters/{gui-hongfei,chen-xiaohai,ren-kasai,old-ben,sayeed,captain-hamid,fatima-begum,rashid-ironmouth,mara-okoye}.json`、`events/{bay-of-bengal-campaign,migrant-split,dhaka-unbinding,chittagong-unbinding,hunter-license-act,league-founded,credit-accord,gull-anvil-truce,lance-v4,gui-funeral}.json`、`eras/`、`timeline.json` 中 2089–2108 的孟加拉灣條目。
2. 定 7 件清單（id、date、era、掛哪個節點／線／底色、一句梗）與命名表。
3. 寫檔、插入年表；每檔後 `node content/lore/check.ts`。
4. `npm run check`、`npm test` 收尾；寫 `naming.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新事件檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill/wt-fill-01/content/lore/events/` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-01/naming.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill/fill-01/REPORT.md` |

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，`method` 填意譯／音譯／混用，`status` 填「既有」或「提案」；涵蓋每個新檔的顯示名與文中新出現的專名。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——每件一行：id、date、era、掛到哪個節點／線／年表條目／底色句、前因→後果一句；沒做到或證據不足的；需要決定的事，含你發現的既有 lore 矛盾）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有** 7 個新事件檔與 `content/lore/timeline.json` 純插入（`git status --short` 除 `node_modules` 外只見這些）。
2. worktree 內 `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`；`npm test` 0 fail。
3. 7 件題目逐一對上範圍第 1–7 項；每件都在 timeline 有一條帶 `event` 的條目。
4. REPORT「產出」每件寫明掛點與前因後果。
5. `naming.json` 涵蓋每個新檔；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞；引用既有專名例外）、0 個 style.md 禁用詞。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fill-01`。本線團隊：`teams/fill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fill-01 --up DONE '一句自足結論' /tmp/cx-fill-01/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-fill-01 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增 7 個事件檔＋timeline 純插入＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

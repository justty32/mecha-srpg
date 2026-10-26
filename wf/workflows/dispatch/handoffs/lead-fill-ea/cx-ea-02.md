# 任務：在隔離 worktree 新增東亞與中亞的人物、地點與事件 15 件，並在既有三檔純插入勢力引用（batch ea-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`（含「可見度」一節）、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/drive.md`、`wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02-plan/PLAN.md`（**領導已審核批准的計畫書，本批的權威清單**）、`wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02-plan/review-draft.json`、`wf/workflows/dispatch/handoffs/lead-fill-ea/cx-ea-02.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

世界框架（崩年前、國家縮而不死、三層、城邦類型、崩年的底色）2026-10-26 已定，lore 在**填充層**。上一批 ea-01 已入庫中日韓俄四把傘（`factions/{imperial-court,japan-umbrella,korea-umbrella,russia-umbrella}`）、7 件事件（`events/{jiangkou-night,chaebol-ascent,eastern-abandonment,mandate-of-kuafu,setouchi-lock,karafuto-understanding,court-parade}`）與 3 地（`places/{yangtze-mouth,setouchi,kamchatka-wells}`）——**先整檔讀過這 14 檔**，本批是它們的周邊：中亞那把傘、5 個具名人物、5 個地點、4 件事件。年表條目**不寫進** `timeline.json`，改寫成待插入清單交給領導。

已存在、**不重寫**的條目（只能引用）：上述 ea-01 的 14 檔，以及 `characters/{kuafu,tenzin-dolma,lobsang,qin-wangshu,howard-ling,kim-haneul,yoon-seoyoung,old-man,unit-07}`、`events/{first-tide,kuafu-awakens,golmud-split,kuafu-mountain-vigil,gyeongju-contest,hundred-lanterns,first-registered-soul,hunter-license-act,league-founded,credit-accord,lunar-blockade,hekate-secret}`、`factions/{shell-wardens,shell-society,mimic-works,league,league-armory,busan,third-blade,selene,remnant-wings,backside}`、`places/{golmud-nest,gyeongju-tombs,busan,yakutsk-bed}`。

## 方法（必守）

- **節點優先**：每件都要掛到節點（N01–N10，`history-nodes.json`）、主線（A–H，`history-lines/lines.md`）、年表條目、或「崩年的底色」某句（1.1–1.13）；REPORT 每件寫明掛哪裡、前因、後果。沒有因果的不寫——**不暴力產 lore**。
- 不拿其他作品（遊戲、電影、小說、真實戰爭的代稱）類比；量級用世界內的詞。
- 中文命名避免直譯（兩步命名，見 polish.md「首要標準」）：古代機本體叫古代機、外層叫裝甲；潮→蝕（蝕潮、蝕月…；海洋本義的潮汐、大潮、漲潮照用）。
- 國家、塞勒涅、巨頭**只削弱不萬能**；已裁示的不推翻（設定優先序見 lore README）。新名詞（地名以外的專名、制度名、詔令名、儀式名）標「提案」，列進 `naming.json`。
- 世界觀真相用可見度欄（`secrets` 的 `hidden`／`rumor`、`fieldVisibility`、`ancientMech.visibility`）；`summary`／`body` 照外界口吻寫，真相不寫進敘述。
- 群像為主：本批**恰好 5 個**具名人物檔（範圍第 7–11 項），每人寫一件他做過的事、掛到節點／主線／年表／底色、寫明 2108-01 的狀態（在哪、做什麼、幾歲）；其餘只用無名群像或只出現一次的小人物（不建檔）。**不寫任何真實歷史人物姓名**（含真實國家元首、政治人物、企業家）。
- **朝名、年號、君主名一律不取**，也不放佔位名；寫「朝廷」「內閣」「詔令」「君主」即可。
- 傳統 AI 在敘述裡不寫英文「AI」：寫「遙控機」「算核自走的守牆機」之類；機魂是人（style/people.md）。
- 機甲型號與怪獸**不新造**：要提就引用既有 lore／base 名稱，或寫「B 級衍型機」這類通稱；需要新型號或新怪獸，寫進 REPORT「需要決定的事」。
- 數字只在 date 欄與必要的量級（傘的人口與城數照 `scale-v2.json`：中 6.5 億 60 城、日 4500 萬 10 城、韓 3500 萬 8 城、俄 1 億 14 城）；敘述裡少放數字。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的寫進 REPORT 的「需要決定的事」，不要動手。工作目錄是 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-ea/wt-ea-02/`。

**清單以 `ea-02-plan/PLAN.md` 第④節 15 件為準**（檔名、顯示名、日期、人名、掛點、前因後果、2108-01 狀態、「這件的光」都照 PLAN；PLAN 第⑦節列的限制照守）。下列是領導的初稿，與 PLAN 衝突時**以 PLAN 為準**；唯一已定的替換：第 14 項 `places/murmansk.json` 改為 `places/tiksi.json`（季克西），人物檔名照 PLAN（`wen-zhaoheng`、`mase-tomonori`、`wall-tomori`、`seo-haegyeom`、`nina-belova`）。

**基調（領導審 ea-01 後加）**：ea-01 文筆紮實但偏冷、偏公文；本批照 style.md 總綱「敢誇張、敢浪漫、敢中二；冷硬潮濕的底色上蓋一層神話的光」，每件把 PLAN 寫的「這件的光」實際寫進 body（一個意象、一聲吼、一個名字），不要寫成報告。

**新增恰好 15 檔**（檔名＝下列，不得改名；顯示名是領導給的工作名，人名由你取，可依兩步命名提更好的中文名，在 naming.json 寫理由）：

勢力（1）：
1. `content/lore/factions/central-asia-umbrella.json`——**中亞那把傘**（aka「中亞傘」），`type` `大勢力`、body 四小節。聯盟型；遠離大洋、**墟多獸少**、後方交易城占主體（約 6500 萬人、12 城，`scale-v2.json`）；精粹靠買、墟是本錢；夾在朝廷、俄羅斯那把傘與西亞之間；境內可以有自由城市（city-types：聯盟型可有，但本批不新增自由城市地點，只在 body 提一句「有沒有、在哪」留白或寫成傳聞）。

事件（4，body 300–1500 字、`## ` 小標 3–5 個、`consequences` 一句一條、date 落在 period 的 era 內）：
2. `content/lore/events/kazakh-ruin-sale.json`——**哈薩克賣墟案**，date `2104`，period `era/tide-line`。中亞的一座墟被賣給塞勒涅（D 線：塞勒涅沒有任何祕法，所以買墟；已定）；誰有權賣（國家的登記簿？城邦？發現的獵團？）是案子的核心——「國家縮而不死」：法理在國家、一夜到在城邦。後續維持提案（history-lines.json「哈薩克賣墟的後續」未定），用 `secrets` 標 rumor。
3. `content/lore/events/wall-soul-waking.json`——工作名**守牆機醒魂**，date 落在 `2106`–`2107`、period `era/league`。日本一座守牆城的大潮夜：一台有機甲核心、算核自走的守牆機醒成機魂（drive.md：機緣不是技術；大潮時刻或古代機半徑內；日本發生得最多）。**不是第一個機魂**（老爹 2101 是第一個登錄的、七號 2104 是第一個被認為有意志的，錨點不可動），也不必是第一個醒的守牆機——寫成「這一次被記下來」。獵牌法 2106 規定登錄機魂算裝備不是人：這台醒了之後在日傘的簿子上怎麼記，是事件的張力。接第 9 項人物。
4. `content/lore/events/court-conscription-writ.json`——工作名**徵召詔**，date `2105`，period `era/tide-line`。朝廷以詔令徵召境內的受雇獵團守一次大潮（polity：玩家在中、俄、北美境內可能被徵；國家型境內沒有自由城市可躲）；寫清楚徵召的法理、付錢（付得慢）、獵團的反應與代價。底色 1.6、G 線、N08 前因。接第 7 項人物。
5. `content/lore/events/incheon-roll-call.json`——工作名**仁川守城者**（事件名你定），date 落在 `2102`–`2105`，period `era/tide-line`。韓傘「壓抑反轉成對守城者的崇拜」的一個具體樣本：仁川的一次大潮守城與之後的崇拜（不用「唱名夜」這個詞，它歸別線）。**處容、金河娜、第三刃不出場或只一句**。接第 10 項人物。

地點（5，`continent` 皆 `亞洲`，帶 `kind`、`status2108`、`world: "earth"`）：
6. `content/lore/places/court-seat.json`——工作名**行在**：朝廷與內閣退回內陸後的所在地。領導提案定在**成都**（盆地、糧倉、遠海；名稱寫「成都行在」或你提更好的），`kind` `城邦`；寫朝廷、內閣、議會在這裡的樣子與 2108-01 狀態；朝名年號、君主名不取。
（人物檔第 7–11 項見下）
12. `content/lore/places/sendai-wall.json`——工作名**仙台**：日傘十城之一，太平洋岸、遙控機與算核自走機守牆的城；第 3 項事件發生地。`kind` `城邦`。
13. `content/lore/places/incheon.json`——**仁川**：韓傘八城之一（不是釜山），黃海岸。`kind` `城邦`。
14. `content/lore/places/tiksi.json`——**季克西**：俄羅斯那把傘的北極岸港（取代初稿的摩爾曼斯克，因其地理屬歐洲）；冰封使損失小（已定）。`kind` `港`。
15. `content/lore/places/almaty.json`——**阿拉木圖**：中亞那把傘的後方交易城、天山墟的出入口；第 2 項事件的舞台之一。`kind` `城邦`。

人物（5，`kind` 依實際；每人 `events` 至少一件本批或既有事件；`relations` 至少一列；`faction` 指向既有或本批勢力）：
7. `content/lore/characters/` 下一檔（檔名＝你取的人名拼音 kebab，例 `qin-wangshu`，下同）——朝廷內閣的一名官員：2094 年帶天命詔上格爾木被守寢人請喝茶回來的人，2105 年由他起草或執行徵召詔，2108-01 在行在。不寫成反派：他相信詔令還有用。
8. `content/lore/characters/` 下一檔——日傘一名年老駕駛員：在仙台守牆，年紀七十上下、外貌年齡遠比實際年輕（drive.md「驅動時數與外貌年齡」：開機甲會不老，社會知道、不張揚）；他是「駕駛員最缺的傘」的樣本，也是 2089–2092 出生斷層（底色 1.1）沒人接班的見證。
9. `content/lore/characters/` 下一檔——第 3 項事件裡醒過來的守牆機機魂，`kind` `soul`，`born` 填醒來的年月；個性要淡（style/people.md：機魂個性限 S 級、一般機魂只是數石頭回港——若你寫它有「我」，就要寫明它是 S 級魂核、且罕見）；與第 8 項人物有關係。
10. `content/lore/characters/` 下一檔——仁川的守城者：第 5 項事件的主角，被韓傘崇拜的那種人；寫崇拜在他身上的重量（他不想要），2108-01 的狀態。
11. `content/lore/characters/` 下一檔——雅庫茨克的守將：2091 棄東令後被留下的那座城的人，掛 `events/eastern-abandonment`；2108-01 的狀態。不寫強人體制的真實領導人。

**既有檔純插入（3 檔，只能新增陣列元素，不得改動或刪除任何既有字元的值）**：
- `content/lore/places/golmud-nest.json`：`factions` 追加 `faction/imperial-court`。
- `content/lore/places/yakutsk-bed.json`：`factions` 追加 `faction/russia-umbrella`。
- `content/lore/places/busan.json`：`factions` 追加 `faction/korea-umbrella`。

**年表清單（不碰 timeline.json）**：把 4 件事件各一條年表條目寫進報告目錄的 `timeline-add.json`（格式見「交付」），領導帶回時插入。

不做：
- 修改或刪除任何既有檔（上面 3 檔純插入除外，ea-01 的 14 檔也不改）；**不碰 `content/lore/timeline.json`**；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`content/base/` 一律不碰；不 commit。
- 不寫：兩河斷橋夜（他線）、埃吉爾、歐傘、孟加拉灣、美洲、非洲、西亞（他線）；不新增其他人物、自由城市或黑幫城市地點。
- worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-ea-02/`）。
- 件數 gate：新增／修改檔超過 18 件就停下回報；容量 gate：你新增的單檔超過 16 KB，或新增內容合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑，0 錯（「事件未進年表」的警告是預期的，照實記進 REPORT） |
| `npm run check` | 收尾跑，末行 `OK 0 errors` |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（`wf/workflows/planning/design-notes/world/history-nodes.json`、`history-timeline.json`、`history-lines.json`、`scale-v2.json`；實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ea-02 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準是已知現象，照實寫進 REPORT。

## 工作

1. 讀「先讀」全部（PLAN.md 整份）；整檔讀 ea-01 入庫的 14 檔；讀「背景」列出的既有條目，以及 `content/lore/eras/` 全部、`content/lore/factions/{selene,league,salt-gull}.json`（大勢力範本與關係寫法）、`timeline.json` 中 2089–2108 的東亞條目（grep 夸父、格爾木、釜山、慶州、雅庫茨克、老爹）。
2. 定 15 件清單（id、顯示名、date／region、掛哪個節點／線／底色、一句梗）與命名表；人名先 `grep -r` 全庫避免撞名。
3. 寫檔、做 3 處純插入；每檔後 `node content/lore/check.ts`。
4. 寫 `timeline-add.json`、`naming.json`、`review.json`；`npm run check`、`npm test` 收尾；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新 lore 檔與 3 處插入 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-ea/wt-ea-02/content/lore/` |
| 年表待插清單 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02/timeline-add.json` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02/review.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-02/REPORT.md` |

`timeline-add.json`：`{"entries":[…]}`，每筆照 `content/lore/README.md` 的 timeline 條目格式（`date`、`title`、`summary`、`event`、`era`、`factions`、`tags`），4 筆、各帶 `event` 指向本批事件檔；`factions` 只引用存在的或本批新增的 id。

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，`method` 填意譯／音譯／混用／描述句，`status` 填「既有」或「提案」；涵蓋每個新檔的顯示名與文中新出現的專名。

`review.json` 從 `ea-02-plan/review-draft.json` 起改（白話隨成品修正），用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[…]}`，15 個新檔各一列：`檔`＝相對 repo 根的路徑、`類別`＝勢力／事件／地點／人物、`名稱`＝顯示名、`白話`＝一到兩句、**不超過 60 字**、給沒讀過設定的人看的白話（說它是什麼、為什麼存在，不堆術語）、`掛到`＝節點／主線／年表／底色條（例「N01；G 線；底色 1.6」）。使用者與規劃者會拿這張表審敘事基調。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——每件一行：id、date 或 region、掛到哪個節點／線／年表條目／底色、前因→後果一句；沒做到或證據不足的；需要決定的事，含你發現的既有 lore 或設定筆記矛盾、需要的新機型或怪獸）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有** 15 個新檔與 3 個既有檔的純插入（`git status --short` 除 `node_modules` 外只見這些；`timeline.json` 不在其中）。
2. worktree 內 `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`；`npm test` 0 fail。
3. 15 件逐一對上範圍第 1–15 項；`timeline-add.json` 4 筆各對一件事件；5 個人物各寫明 2108-01 狀態。
4. REPORT「產出」每件寫明掛點與前因後果。
5. `naming.json` 與 `review.json` 各涵蓋每個新檔（review 白話每列 ≤ 60 字）；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞；引用既有專名例外）、0 個 style.md 禁用詞、0 個真實歷史人名、0 個朝名年號。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ea-02`。本線團隊：`teams/fill-ea`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ea-02 --up DONE '一句自足結論' /tmp/cx-ea-02/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-ea-02 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增 15 檔＋3 處純插入＋年表清單＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

# 任務：照月面接口計畫新增第08批——人在地球，月光到岸（恰好18檔，batch bf-play-08）

## 已讀清單（計畫線）

本稿由 cx-bf-play-moonplan 編寫；以下逐項親讀，查表走 tabledb。引擎邊界採 plan.md 第2節，接口採第7節；盤點時 HEAD `8a48e7ef3e982b278e382d8a166cfc05a8564428`，manifest base 仍為 `TBD`，等待領導預置。

`AGENTS.md`；`wf/workflows/content/ops-content.md`；`content/lore/style.md`。

`content/lore/style/people.md`；`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`；`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`。

`wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`；`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`；`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-01.md`。

`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/bf-play-01.manifest.json`；`wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/ops-hooks.json`；`wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/review-draft.json`。

另已讀專案工作流、data-files 與 inbox 入口；定向讀既有營運範本與月面worktree原文。月面原稿根目錄為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/`：moon-01 的望地長廊、兩次罷工；moon-02 的望鄉號、修船塢、家書候領處、回程與白甲下船；moon-03 的暗埠夜棧、借月弓的光、暗埠收燈。皆只讀 public summary/body，不取秘密作玩家事實。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要），並親讀本批 manifest `report.mustRead` 所列全部現存路徑；REPORT 開頭原樣列「已讀清單」。每件另親讀 review 的範本與 lore 掛點原文。相對路徑相對 repo／worktree 根；計畫稿從主 repo 唯讀。月面新 lore 若尚未合併，依上段根目錄的 `wt-bf-moon-01/`、`wt-bf-moon-02/`、`wt-bf-moon-03/` 讀；找不到就回報，不能自行編出原文。

## 背景與唯一目標

在既有**地球新加坡渡輪港**遇見月面的人、貨與消息。恰好18個新營運檔：契約＋遭遇＋世界發包牌3組（9檔）、事件6件、候鳥號對話3則。四接口都有實際內容：渡月港契約、暗面走私、白手套催收、罷工新聞。只把已產出的月面 lore 接到地球；月面新地點不是遊戲落點。

逐檔規格抽到 [moon-hooks-review.json](moon-hooks-review.json)（18列）；完整白名單與id在 [bf-play-08.manifest.json](bf-play-08.manifest.json)。review 欄位「檔／類別／名稱／白話／掛到」固定；「掛到」物件保存接口、lore、節點主線年表、遊戲地點、範本、欄位定案、光、邊界、插入需求。**只有「欄位定案」是遊戲欄位；事件再按 text規格寫text**，不得把設計欄位抄進content。

是否改黃金：**接線後會**。port tag解鎖每日事件與發包競抽，contractKinds使委託可生成；未接線為休眠。對話不耗話題RNG，但實際talk會改旗標／士氣。工人不跑全套、不改期望、不重錄；領導收件接線後統一驗證與重錄，不以維持hash為由把內容藏起來。

## 方法與禁忌（必守）

1. **節點優先、不暴力產 lore**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（`wf/workflows/planning/design-notes/world/history-lines.md`），有因有果。不掛得上就不寫。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`）：**少寫帳務與法理、多一點人、畫面、獸、神話的光**。「地契押給月亮」「商團出糧傭兵守港」「井＋糧倉＋公司排班」這類模板句已經寫過很多遍，不再重複。每件要有一個人、一個畫面或一句能吼出來的話。
3. **不拿其他作品類比**：不寫任何外部作品名、角色、電影或遊戲比喻；量級用世界內的詞。
4. **中文命名避免直譯**：兩步命名（先想原意，再取中文，不逐字翻）；古代機本體就叫古代機、外層叫裝甲；潮→蝕（蝕潮、漲潮、大潮、連珠潮）；用語與禁用詞照 `content/lore/style.md`。新中文名不要回譯成英文 aka。
5. **國家、塞勒涅、巨頭只削弱不萬能**：有錢有法理，但到不了每一座城、買不到古代機；塞勒涅不當主謀。富豪、家族、公司群像不點名（職稱可寫）。
6. **古代機與 S 級高高在上**：不寫它們被打倒、被操縱、被交易；古代機周邊寫人（守寢人、學會、村子、看守的崗），古代機本身不動（除既有 lore 已寫的）、不預決誰認主。S 領主不出場（萬潮葬王是唯一例外，本輪不碰）。
7. **對面無臉**：怪獸沒有人格化指揮者、不談、不怕；怪獸不是畜牲（不寫餵、馴、乖、寵物）。A 級以上才有二名。
8. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md` 全部、既有 lore、年表。矛盾記 REPORT「需要決定」，不自己改舊檔。
9. **真相用可見度**：外界不知道的放 `secrets`（`visibility: hidden`）或 `rumor`；`summary`／`body` 照外界口吻。
10. **開局（2108-01）後可能發生、日期不定的事件**用 `occurs: possible`（見 `content/lore/README.md`）。
11. **新名詞標提案**：規格外新造的專名或概念詞，在 REPORT「需要決定」與 review 列「名稱」後加「（提案）」。能不造就不造。
12. **文筆不強求**：只查禁忌與掛點，不為了文采加長。


裁決另必守：`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`。本批6事件皆有奇觀或吼句（6/6），每件第二選項有現金、耗材、士氣或聲望代價。契約3組各有獸、此刻接戰理由與人的吼句；遭遇／行動牌沿同組掛點，不硬塞不可見文字欄。對話三人各有嘴硬或笑罵。

本批不用拓本／拓照、鞋、碗湯飯、繩纜、空擔架、空座作核心畫面；家書僅1件，重用已存在的家書候領處，不造第二個家書lore。望地長廊只經返港搬工的工作影像呈現。新標題都是既有詞組的描述，不新增專名；月面名詞仍沿原批提案狀態，不能把本稿當成另一次定案。

**白甲與歷史**：2098為有人駕駛、無機甲核心的女武神保全機原型；2105才是無人、無魂鐵偶。兩次罷工沿既有結局，無歷史重打任務。鐵偶只照術式動作，不能使招式、不能對獸附魔；轉播手套聲音不等於魂複製，也不在這批新增手套對話或機體。白手套只是受僱的手；地球催收只寫協定承認的新加坡，不擴到黑幫城。

**暗面與公開可見度**：普通備件依附正式渡月船、弦月發船、單程三天；不是獨立天路。暗埠查貨只到外側入口、普通箱件受損，暗埠仍開，不揭2105止步謎底。回程人潮只見去程貴、回程便宜的後果，不碰人口真相與經濟數值。月面事件用明示年份的舊影／轉述，當下只寫玩家在地球觀看。

## 範圍（排除法寫死）

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-08/` 新增 manifest.files 明列的恰好18檔。報告只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-08/`。主 repo content 不可寫，任何既有檔不可改；scratch/log 放 `/tmp/cx-bf-play-08/`。本稿與manifest是派工草稿，領導先填base、預置worktree／正式manifest；工人不自行建worktree、不改manifest。

不做：`src/`、`test/`、`schemas/`、`specs/`、其他 `wf/`（報告目錄除外）、`content/lore/`、`content/batches/`、`content/index/`、任何既有營運檔；不做月面地圖／月面營運、萬潮葬王與AI件，不改池、年表、票價、艙位、造機或數值平衡；不commit。不同批新base id不可引用；本任務明准月面lore id只作掛點，由合併線同時入庫。

件數 gate：content 新檔不是18件或修改任一既有檔，停止擴寫並回報。容量 gate：任一新content超過12 KB或合計超過180 KB即停；REPORT ≤20 KB，同質清單走資料檔。本計畫稿自身控制40 KB內，超60 KB停止回報。禁止靠新增檔補功能缺口。

### 契約三組的落稿方式

修船件組以靜海修船塢與望鄉號為掛點，塞勒涅白手套為既有地球雇主；鹽針正在卸料坡，主目標survive 8回合，指定獸擊殺可選。暗面備件組由鹽鷗獵團臨時代接這一趟地球清路，主目標擊破砂扇；不宣告兩勢力結盟。白甲候卸組由塞勒涅白手套發包，抱樁逼近搬工，主目標hold 6回合、無zone讓既有引擎展開守區，指定獸擊殺可選。

每組各取 review 中三列的欄位定案：id與name已定、encounter為同組id陣列，pay／advanceMax／deadlineDays／onComplete／onFail／onCancel沿範本，僅issuerKinds明設現有雇主scale、gradeRange D/C與目標按本稿覆定。名稱必含獸名及當班急迫原因；ContractDef沒有承諾可見的brief長文，不能加假description。貨物、工人、白甲只作敘事動機，真正完成條件就是survive／killTarget／hold。

遭遇只換id，family／depth／size／terrainMix／budgetByGrade／anchorHere照同族shallow。前綴 `rift-z-bf-moon-` 排在原預設後，僅contract.encounter明指；指定獸由killTarget.params.target引擎展開，optional亦有效。實際width=D，先2隻同族D，指定D缺席才補（2–3隻）；指定C必補（3隻）。不把C:1預算說成固定C伴隨，不新增monster/species假欄、不把鐵偶編成玩家援軍。

發包牌actor=world、weight100／cooldownDays8沿 board-rival-carcass-claim；month>=1、指定dom、bf-receive-singapore、posted==0、雇主rep>=門檻才入池。暗面組另需既有 `flags.farside-prices-known >= 1`，來自現有 port-farside-sealed-crate 第一選項；這是可選熟面孔入口，不改舊事件、不保證必定抽到。effects只spawn同組contract且near明指place/singapore，再設posted；雇主死亡／規模改變／發包失敗不補發。本批不新增暗面faction-ops；company與band都是已存雇主scale，不能抄舊workflow例舉清單改成不存在的scale。

### 六事件與三對話的落稿方式

回程白光、白甲下船、罷工舊影、暗埠後話、長廊巨幕、候領家書各一件。六事件where=node、weight2，month>=1且dom只5／12／19／26，精確新加坡tag與一次性seen共同限制；暗埠後話另需既有farside-prices-known。text寫60–160字、第二人稱、無插值、無具名人物，每件氣味／聲音／不解釋名詞已定在review。第一選項無requires、只設seen；第二選項也設seen，扣現金／耗材必有餘額門檻，文字明寫代價。效果結構沿各自範本，耗材技術工時參照ruin-before-tide-glow、加班取捨參照restraint-empty-rack；不spawn事件／契約，不改票價或航道。

三對話只引用HEAD已存person/ren-kasai、person/ilse-brandt、person/mara-okoye。lines已給三句示意，每句≤40字，可由寫手在同方向微調；兩選項只flag＋mood，不扣款。不新增月面人物PersonDef。只有同船在名冊且同房間的實例才可talk；month>=1、精確新加坡tag、seen==0。檔名前置bf是為避開舊永真對話的明示例外；01–07若先成立可先談，有限次談完可到本題；本題一個topic、每選項seen、無永真後話，結束後恢復其他題。

### 既有檔插入交接

review 每列「插入需求」去重輸出報告 `inserts.json`，wf-table/1，columns `["file","jsonPath","op","value","why"]`，本批只append：新加坡place.tags加bf-receive-singapore一次；塞勒涅白手套contractKinds加修船件與白甲候卸；鹽鷗contractKinds加暗面備件，共4筆。同值已由01–07加入就跳過，不覆寫陣列。不改領土、presence、actionLanes，不新增年表。本批自足接線，不依賴別批新base id；月面lore只在掛點及自然語言，沒有loreRefs假欄。

工人不套inserts。領導合併後，港口tag使事件／發包進候選池，contractKinds使指定雇主可接生成請求；這才是遊戲可遇到的接口。定義載入、候選可抽、玩家實際遇到分開報告；本稿不承諾月面可航往或每張牌必抽。

## engine-backlog 候選

月面外圍困車接人、封鎖通行、船班／艙位與真貨物護航留給後續引擎線。現有月面map／place與selene lane已存在，不可誤稱完全沒月面支援；新月面lore地點的營運落點、當地服務與封鎖條件仍需逐項查接線。恩底彌翁與墟帶遠光不替玩家救人。本批不產這些檔、不更改總backlog。

月面具名NPC在場對話、不中斷日結的新聞欄、延遲家書回信與實際貨物投遞也屬候選。眼前只做舊影轉述、既有船員talk與普通prompt；旗標不是一套新郵務／新聞系統。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 定向查review與ops-hooks；輸出報告資料表 |
| `git status --short` | 記自己恰好18個新增content，預置檔分開說明 |
| `pgrep -fa 'node --test\|vitest\|playwright\|npm run (test\|sim\|fuzz)'` | 每次node檢查前看重負載；有別人跑就等 |
| `npm run check` | worktree收尾，末行OK 0 errors，新警告記REPORT |
| `node src/ops/content/check.ts content/base` | worktree營運格式與引用0 errors |
| `npm run typecheck` | worktree收尾exit 0 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-play-08 --once` | 開場及每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

**可寫程式碼線**：實際只新增本批content白名單及報告，不改程式。工作樹 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-08/`；報告 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-08/`；scratch `/tmp/cx-bf-play-08/`。

**重負載限制原樣優先**：工人不准跑全套npm test、npm run test:e2e、sim、fuzz、content_accept；只准本稿點名的check／ops check／typecheck。跑任何node檢查前先pgrep，有別人在跑就等；不自取鎖。全套只由領導收件後跑一次。子代理同受此限。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、不建分支、不rebase／reset、不commit；不rm -rf、不刪檔；不改 ~/.codex/config.toml 或 .gitignore；不裝依賴；不用MCP、不上網。子代理上限1，僅本批同範圍同規則，親讀先讀；不為管理表另改wf檔，ROSTER由領導代登記。

**分清錯誤來源**：工具壞、預置worktree／manifest未備妥、沙箱拒寫→BLOCKED；自己指令錯→自己修。不要把測出壞掉當作測不出來。

## 工作

1. 親讀先讀與18列規格、範本、月面原文；確認領導預置worktree及正式manifest的base不是TBD，發PROGRESS。
2. 只新增18檔；設計記錄與遊戲欄位分開，插入需求寫報告不套入舊檔。
3. 完成固定檢查與報告，讀orders後回報終局。不追加長測、試玩或新內容。

## 交付

REPORT寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-08/REPORT.md`；新content在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-08/content/base/world/`。另交同報告目錄 `review-rows.json`、`naming.json`、`inserts.json`；不需timeline-add與playtest檔。回覆只要5行摘要＋REPORT路徑。

review-rows：wf-table/1、columns `["檔","類別","名稱","白話","掛到"]`，18列、白話≤60字；掛到縮成lore id＋節點／主線。naming：wf-table/1、columns `["id","nameEn","meaning","nameZh","method","status"]`，描述性標題寫既有詞組合；不用新英文aka，若額外新專名必標提案並列待決。inserts按上段4筆去重。

REPORT開頭「已讀清單」列manifest.report.mustRead全部路徑與逐檔原文；接「做了什麼」「產出」（18檔、git status原文、三檢查exit及新警告、是否改黃金）「沒做到或證據不足的」（inserts未套、全套交領導、尚未實際可遇到）「需要決定的事」（新專名／缺口／衝突）；附「子代理」與「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree自己的變更恰好manifest列出的18個新content檔，沒有修改既有檔；git status --short記錄，領導預置node_modules不算產物。
2. worktree內npm run check為OK 0 errors、node src/ops/content/check.ts content/base為0 errors、npm run typecheck exit 0。
3. 依重負載限制不跑全套npm test／e2e／sim／fuzz／content_accept；REPORT明記交領導統一驗證，工人不改黃金、不重錄。
4. review-rows恰好18列、白話≤60字，naming與inserts合法；逐檔掛點、觸發與文字要點完成，0個月面營運／月面地圖、萬潮葬王與AI件。
5. REPORT存在且已讀清單完整，記未套插入需求與接線後黃金影響；未接線不得稱主線已可遇到。

只回這5條證據；全批接線驗證與黃金重錄歸領導。

## 失敗怎麼處置

測出來是壞的→自己修到符合；修不好保留改動並發FAILED。測不出來→保持現狀、REPORT寫解除條件、發BLOCKED，不能以舊輸出充新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-play-08`；團隊 `teams/bigfill`。上線：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-08 --up PROGRESS '已讀完，開始寫 bf-play-08 地球月面接口' < /dev/null`。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-08 --up DONE 'bf-play-08 18檔完成，地球月面接口插入需求交合併線' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-08/REPORT.md`；STATUS與標題照實換。結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一，卡住超過10分鐘先發BLOCKED。

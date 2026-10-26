# 任務：依審定計畫新增駕駛員與船員第 01 批（恰好38檔，batch fp-euram-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/people.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/pools.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/batch-files.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/review-draft.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/cx-fp-euram-01.md`。親自讀，不靠交接書摘要；REPORT開頭列「已讀清單」，上列每個路徑原樣列出。相對路徑相對worktree；計畫資料用上列主repo絕對路徑，避免未提交草稿在worktree不存在。資料檔用tabledb依batch查，不整份讀。全目錄範本須讀，人物實作另按本批template定位。這是待領導審定後啟動的交接稿；領導需先填manifest base並準備指定worktree。

## 背景與唯一目標

使用者要填可雇用的駕駛與船員。你負責歐洲與俄國共12組背景＋person＋lore人物，以及2個新池，恰好38檔。只依people中 `batch=fp-euram-01` 的12列與pools的本批2列產出，數值照同級暫填，不調平衡。計畫與本交接書衝突時本書優先；另有領導euram-rulings時以裁示為準，不猜未存在的裁示。

## 方法與禁忌（必守）

引用 `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md` 與 `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第3–4點。以下規則同時適用：

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**：少寫帳務與法理，多寫人、畫面、獸、神話的光。每人一個站起來的瞬間與一句能吼出來的話（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件；扶手、熱水同樣不重複作核心畫面。全部24人有吼句，16人為駕駛或船砲手；核心意象逐人在 people.image 指定。
3. **不拿其他作品類比**；中文命名避免直譯（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。不用真實歷史人名；姓名照該文化常見構詞自創，逐名核對全庫與跨線 claims。新專名標「（提案）」，標記放審查／命名表，實際顯示名不把「提案」當姓名一部分。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。本批不創候選者、不送國家專屬機給受雇者；mech 是既有使用經歷，不是招募贈機。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表；矛盾記 REPORT「需要決定」，不改舊檔。九門同喪只按年表2107-04-15掛連，不硬塞N09借貸因果；白夜首燒與失守取2100；古巴歸拉美、墨西哥歸北美調度；基多軍援不出洲。
6. **真相用可見度**；本批只寫可目見的小場面，公開body不預知古代機與墟的答案；若真有傳聞才入secrets並標rumor，新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 範圍（排除法寫死）

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-euram-01/` 新增 `batch-files.json` 中 `batch=fp-euram-01` 的38個明確檔名；那38列是本書完整逐檔白名單，不允許依賴擴張。該清單與本批manifest的files一致，沒有glob。報告與scratch按下文；不建立其他內容檔。

本批人物名單：艾里安・沃克萊、泰莎・里納爾迪、馬雷克・沃爾斯基、珊娜・德弗里斯、布魯諾・阿扎里、瑟莉亞・凱拉維爾、薇拉・佐琳娜、帕維爾・拉基廷、阿莉娜・韋特琳娜、傑尼斯・切爾納文、娜佳・克魯托娃、季穆爾・謝列金。這是給人識別的索引，完整身分、年齡、出身、瞬間、招牌話、池與掛點全部在people本批列，禁止換名、重設出身或挪批。

### 逐檔規格（與資料列共同構成工單）

**background檔**＝每列files[0]：id=background、name=backgroundName、person=`person/`加id、culture、attrRanges、hireFee、wageMult照列，traits=backgroundTraits（空陣列）。不要把句子放到不存在的description欄，不從termsTemplate複製舊person或舊traits。

**person檔**＝files[1]：先複製template的完整結構，id=`person/`加id、name=name、kind=human；attrs、traits、perks、will、tags及age照列；growth保留範本xpCurve與perkPointsAt，levelDice照列；pools完整沿用範本。activeYears有數字才填，null則省略；不繼承範本veteran／faction tags，不帶舊resonanceAffinity，abilities空則省略。gender／born／出身不是person擴充欄，留lore。不得改數值或新增effects。

**character檔**＝files[2]：id=`character/`加id、name=name、born=born、kind=human、faction=faction、role=backgroundName、summary=summary、aka=[]、relations=[]、events=events、places=[place]、gameRefs=[`base:person/`加id]、tags=loreExtras.tags、visibility=public。有mech才填既有機型名，無則省略。body按loreDraft三段寫250–450字（≥200），寫入性別、性格、當年年齡相符的崩前／崩後與現在，招牌話quote原句保留，moment照寫因果；place用對應既有id連結，不能把故鄉搬成招募港口。不增新secret；若發現設定衝突記REPORT需要決定，不自行暗改。places是共同規格要求的額外人物欄，若checker只警告未登記則記錄，不修改schema或README。

**recruit-pool檔**＝pools.file：只寫id/place/size/refreshOn/sources五欄，逐值照本批列，不把theme/name/batch/seasonPlay等計畫欄複製進遊戲資料。同池來源全在本批12組中；每個place必為現有base place，不能改成lore故鄉。新池改變營運亂數軌跡。

不做：修改或刪除任何既有檔；`src/`、`test/`、`schemas/`、`specs/`、`content/index/`、`content/batches/`、design-notes及其他wf一律不碰；不寫effects／aiprofiles，不做萬潮葬王，不commit。需要既有檔插入只寫報告inserts.json，由合併線套。worktree不得留scratch、log或driver。

件數gate：恰好38個內容新檔，且每批上限42檔／12組；超出停下回報，不擴張。容量gate：沿指定交接範本，單檔超過16KB或內容合計超過1MB停下回報。body長度按上文，不為湊容量加文。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | 查people／pools／batch-files／review資料的本批列並讀寫wf-table/1，不整份載入context |
| `grep` | 核新名在content庫未佔用；命名衝突停回報，不改名繼續 |
| `npm run check` | 產出完成後驗資料，0 errors；新警告列REPORT |
| `node content/lore/check.ts` | lore必填、引用與body，0 errors |
| `npm run typecheck` | 型別檢查，退出0 |
| `npm test` | 跑一次並照實列失敗檔；新增池造成黃金差異交領導 |
| `git status --short` | 對38檔白名單核可寫範圍 |

不准上網或MCP，不要求probe／playtest；不跑GOLDEN_UPDATE／rerecord，不擴展驗收。

## 資源與禁區

**可寫程式碼線**：只新增 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-euram-01/` 下白名單38檔，以及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-euram-01/`；scratch放 `/tmp/cx-fp-euram-01/`。這裡是內容產出，不授權改引擎。

共通禁區：不碰鍵盤、滑鼠、螢幕，不開GUI，不push／建分支／rebase／reset，不commit、不rm -rf、不改~/.codex/config.toml、不裝依賴、不改.gitignore。不寫主repo content。

子代理上限2個，模型隨意，只推進本批正事；每個實質工作者親讀AGENTS.md、fp-common及先讀規範，只能在本批白名單與scratch內工作，不重複持有同檔寫入權。REPORT記實際使用與品質；未用寫0。

自己打錯指令、路徑或臨時腳本，自己修後繼續；點名工具本身壞掉或沙箱拒寫才記BLOCKED。不要用改其他檔來掩蓋問題。

## 工作

1. 讀先讀清單，以tabledb查本批12人物、2池與38檔，核對names-claimed及同名檔；照對應template複製結構。
2. 每組成套新增，照指定body三段要點潤文，不重設人物；新增兩池，既有檔插入只寫inserts。
3. 完成固定驗收，直接寫review-rows.json、inserts.json、REPORT。保留原始結果，不更新黃金，不commit。

## 交付

REPORT是交付物，直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-euram-01/REPORT.md`，不要只貼回覆。新增內容在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-euram-01/content/`；白話表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-euram-01/review-rows.json`；插入草稿 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-euram-01/inserts.json`。回覆5行摘要＋REPORT路徑。

review-rows使用wf-table/1，columns=[檔,類別,名稱,白話,掛到]，從review-draft按batch-files本批路徑篩38列，每檔一列，白話≤60字、新名標（提案）。inserts使用columns=[file,jsonPath,op,value,why]，op只append/setKey；第01批照計畫三個俄國places提案，第02批空rows，無新理由不添加插入。所有條列超1KB走資料檔。

REPORT第一段「已讀清單」，接著做了什麼、產出與掛點摘要、檢查結果與新增警告、沒做到或證據不足、需要決定／引擎候選、子代理、以後交接書該點名的工具（無則寫無）。四條驗收證據附結果，test黃金失敗要列檔名與原因，其餘失敗不可當作已通過。

## 驗收（固定4條，一條不多，做完就停）

1. worktree改動只有本批白名單38個新內容檔（node_modules既有連結除外），12組三件齊、2池來源均存在；未改既有檔。
2. npm run check為0 errors、node content/lore/check.ts為0 errors、npm run typecheck退出0；npm test照實記錄，僅新池改亂數的黃金差異可列明交領導統一重錄，其他失敗修正或回報。
3. review-rows.json合法且38列、白話≤60字，inserts.json合法；24人計畫本批那12人的年齡／born／既有place與faction／quote／body規格符合people，無新effect、AI、萬潮葬王內容。
4. REPORT已寫入指定絕對路徑，第一段已讀清單含先讀所有路徑，列這4條證據、未解事項與子代理實際數。

不要加驗其他東西。

## 失敗怎麼處置

測出壞掉就修至符合本批規格；修不好保留檔與證據，REPORT標FAILED，不刪既有檔，不擴大工作。點名工具壞掉或無法驗證則保持現狀，REPORT標BLOCKED與解除條件；不得拿舊輸出代替。

## 完成／阻塞回報（必做）

我是 `cx-fp-euram-01`；不用inbox（fp-common明定領導看行程結束＋最後訊息＋檔案驗收）。結束用DONE／BLOCKED／NEEDS-USER／FAILED的實際狀態，5行摘要＋REPORT路徑。沒有對外寄信、沒有主repo修改，也不代領導帶回內容。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。

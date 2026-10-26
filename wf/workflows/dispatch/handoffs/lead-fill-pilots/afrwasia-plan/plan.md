# afrwasia 可雇駕駛員與船員填充計畫（提案）

## 1. 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`

以上均親讀。三個範本目錄於本次盤點分別為招募池4檔、背景13檔、person38檔，全部讀過；背景 attrRanges 與人模板數值分開看待。另讀開場 SESSION-LOG／WAIT_USER、WORKFLOWS、data-files、dispatch README、world-pillars、指定 cx-kj2-01 交接書骨架與 kaiju2-01 manifest 格式；查 history-timeline、既有 catalog 使用 tabledb 的條件查詢。開場 inbox_read 無信。不寫 session-log 或 inbox，遵本線只准寫兩個目錄的限制。

## 2. 盤點

快照：現有 person **38**、background **13**、recruit-pool **4**、lore character **89**。本區地理核心 lore 地點16個，另把跨歐亞的伊斯坦堡列為掛連，共17；本區營運 base place **0**、本地招募池 **0**。因此新池掛新加坡與吉大港，人物仍按出身掛本區地方／勢力，正文交代短約與轉船，不造假地點。

本區可確證地球出身的現有 person 是瑪拉1人，已有 lore、是開局船員，無招募背景；依舊 catalog 的族裔與背景 culture 擴大盤點另有8人，共9人。這8人只證實文化／族裔，不能據此指定出生港：阿德瓦萊、科喬、達莉雅、艾辛、蕾拉、娜迪雅・馬斯里、薩利姆、優素福。中亞出身 person **0個可確證**；蒙古裔不按名字硬算中亞。9人中背景配對4組、來源可達2池：科喬與優素福在 wharf-chittagong，娜迪雅與薩利姆在 reed-marsh；不是4個本區本地池。其餘5人沒有招募背景。完整數據與證據見 [inventory-persons.json](inventory-persons.json)。

既有 lore 本區人物核心14人：撒南10、北非活動2、西亞2；加哈坎（伊斯坦堡跨區）1人，以及可掛連的老班、已故奧康納2人，共17列。中亞未有明確本區人物。名單、身分、死亡與既有功績邊界見 [inventory-characters.json](inventory-characters.json)，不把拉哥斯空襲的所有參與者都算成撒南出身，也不把姓名似阿拉伯的孟買／孟加拉人物算入。17人中有 person 的只有瑪拉，經現有池可雇者0。

每個地方與在當地出現的勢力之可雇數逐列在 [inventory-sites.json](inventory-sites.json)：17地點皆0，指本地可雇，不把他港候選偷算入本地。勢力可雇按「現有背景→來源池」且已知歸屬計：稽古學會2人（娜迪雅、優素福）在區外可雇，其餘所列勢力0；鐵砧科喬列人物表，但鐵砧不是這17地點 factions 欄的常駐者，不偽增在地勢力。這一缺口是為何要加成套人物，而非再寫只有頭銜的領袖。

盤點證據使用 tabledb 查 catalog 的八個 id 與 history-timeline 的地區條目，再 grep 角色／地方／勢力內容交叉核對；只取符合項，沒有把大型索引全載入。新名全庫 grep 證據與跨區避撞結果在 [acceptance.json](acceptance.json)。

## 3. 設計理念

撒南的船裝著駕駛員出洋，留下的工棚仍得有人修好下一副軛，十二人從這個來回開始。每個人有一句自己也知道誇張的吼話，吼完仍要等交班、吃飯、找下一段工作。獸只在海岸與外洋遭遇中呈現壓迫，內陸的畫面交給糧車、風雪與骸片反光。崩前已做工的人記得貨會準時來，當年的幼童只記得氣味與顛簸，崩後出生者靠家人口述認識舊世界。二十歲以上的厚層夾著一名十八歲助手，出生斷層靠名冊裡的空白與存活條件顯現。兩位不老的機械系駕駛只在各自一池低權重出現，外貌與年資同時標明，神話的光不因此變成人人都有的權力。北非的水、海峽的火後、兩河的斷橋與中亞的糧路都落在能受雇的小人物身上，沒有人取代現有領袖或替國家解決所有困局。

方法與禁忌原文照用（共同規格優先）：

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。


## 4. 人物表

人物表已抽到 [people.json](people.json)，**24列**，12撒南、4北非、4西亞、4中亞；person與character同名，background也採同一不撞名的id尾段。13名駕駛加1名砲手，戰鬥職14/24；其餘10名技師、醫護、廚務、領航與測繪船員。每人的 gender、age/born/activeYears、before/after、personality、moment、quote、role、attrs、levelDice、traits/perks/abilities/tags、culture、background/中文名、hireFee/wageMult、place/faction/hook、pool均已定。null年資在產出時省略；born是2108減age的年份字串。

數值用表中 template 的同級 attrs、pools、growth 與 feeTemplate 的背景範圍／費率；普通射手700/1.4取既有同費率的領航背景標準，兩名老手850/1.6取退役測試駕駛。這些是模板暫值，不宣稱平衡過。P／B等生成代號不進成品；產出看每列具體值。perks=[]、abilities不寫，trait只選既有effect，backgroundTraits=[]避免重複賦予。will已逐列提供，不能把原範本的候選古代機／舊陣營故事複製過來。

culture只有既有11套神話名表，並不是完整族裔系統；撒南沿既有科喬背景暫用bengal、北非egypt、西亞mesopotamia、中亞暫借經西亞採購路的mesopotamia。人物姓名與地理出身不由這個暫代欄改寫；專用名表需求列第7段。醫護／領航／砲手／廚務等tag只表達履歷，沒有相應新能力承諾；既有trait照原機制工作。14歲學徒不配機、不寫出擊，當前引擎無職類硬鎖，風險已列待決，不聲稱tag會禁止玩家指派。

五歲組距年齡直方圖（人數）：

```text
10–14｜█ 1
15–19｜█ 1
20–24｜███████ 7
25–29｜███ 3
30–34｜██ 2
35–39｜██ 2
40–44｜██ 2
45–49｜██ 2
50–54｜█ 1
55–59｜██ 2
60–64｜█ 1
```

16–19歲**1/24＝4.17%≤5%**，分母是本區完整24人計畫；兩個製作子批不另抽樣人口。15–19箱僅18歲1人，14歲另在10–14箱。阿米娜2090年生，靠內陸糧磨與接生助手母親的照顧存活，不寫成普遍現象；她是醫護助手，沒有古代機眷顧。祖莉2094年生、14歲，只是有同港家長照護的技師學徒。二十歲艾格琳2088年生，沒有可信的崩前親歷記憶，不強塞一份嬰兒時代工作。46歲卡茂activeYears16、43歲薩米拉activeYears14，外貌約34與32.5；其餘較年長的普通駕駛是近年換職，不寫十多年資卻漏年資欄。

## 5. 招募池表

已抽到 [pools.json](pools.json)，4列，逐列給id、實際place、size、主題、每個background與weight。每池6來源、size3；新加坡的「撒南輸出的駕駛員」池明確滿足出洋主題，另三池為吉大港高地船員、吉大港護糧換班、新加坡採購船隊。同地多池是引擎支援的獨立池，不擴建世界地圖。

同池不同季的可玩感來自六選三的職能與人物組合：純駕駛池可能抽到新軛騎、城防射手或低權重老手；高地船員池可能有騎手與修工，也可能偏醫護與廚務；護糧池交替呈現守閘老手、年輕清渠駕駛與老領航；採購池則在兩位中亞新駕駛與四名支援職間取捨。角色不是無限生成，已在名冊或別池候選者會先排除；6來源並不保證每季湊滿3，雇完就逐步見底。

引擎實況：recruit.ts 在phase=neap且當日尚未刷新時重抽，pool資料仍標refreshOn=quarter；本計畫沿用共同規格的「每季」稱呼，實際刷新依現有時鐘，不在內容線改時間邏輯。四池互不共用person，避免跨池遍歷先後搶同一模板。

## 6. lore 人物草稿要點

每人的三段要點是 [people.json](people.json) 的 bodyOutline，固定「崩前／崩後／現在與招牌瞬間」，24人各三段已具體寫好；性格放第二段，現況、待雇城市與招牌話放第三段。工人只需擴成250–450字，不重新設計；至少200字，gender與年齡用正文承載。

共同寫法：character使用kind=human，born照表、faction照表、places=[place]、gameRefs=[base:person/id]，events只引用表中既有事件，relations=[]。表中hook是創作因果註記，不新增hook引擎欄；敘述只讓讀者看見當地後果。古代機不認任何新主，中亞骸片的光只是目擊反光。所有人物的招牌瞬間皆有吼話，核心意象不用鞋、繩、乾衣、杯、梯、燈重複搭模板；國家與巨頭不替任何人買回失城。

## 7. 需要既有檔插入與 engine-backlog 候選

本輪**不需要修改既有檔**，可套用 [inserts.json](inserts.json) 為合法空表，columns [file,jsonPath,op,value,why]。角色單向引用既有勢力、地方、事件即可成立，不為每人反向塞進事件characters或勢力leaders。地圖未有的奈洛比、阿克拉、吉布地、亞斯文、荷姆茲、阿拉木圖本地池另列 [pending-pools.json](pending-pools.json)，僅為「待補池」登記，不可將其中pending物件套進遊戲。地圖線完成後合併線另開任務處理，不是本輪交付前置條件。

引擎候選已抽到 [engine-backlog.json](engine-backlog.json)，5列，均含項目、影響、建議做法、規模：區域地圖、culture名表、職類與指派、招募小傳、一背景多人物。沒有新增effect需求；船員的招牌話不當技能按鈕。

## 8. 分批

**24組×3＝72個三類人物檔，另加4池＝76內容新檔。** [batches.json](batches.json) 每批逐檔列清單：fp-afrwasia-01 是12組撒南人物＋2池＝38檔；fp-afrwasia-02 是12組北非／西亞／中亞人物＋2池＝38檔。兩批各12組、各38≤42，不另拆不完整三件套。背景與池互相引用只在本批，批次順序不構成跨批引用依賴。

**兩批都會改營運亂數軌跡**：新增池加入每次候選刷新遍歷。工人照共同規格跑npm test並列黃金紅檔名，不跑GOLDEN_UPDATE／rerecord；領導收齊再統一重錄。計畫線不產content、不跑產出驗收鏈。

## 9. 產出交接書稿

[第01批](cx-fp-afrwasia-01.md)與[第02批](cx-fp-afrwasia-02.md)沿指定cx-kj2-01的骨架與段落，帶先讀、背景、方法、排除範圍、工具、資源、工作、交付、固定驗收、失敗處置、終局回報。逐檔規格引用people／pools本批列與manifest精確清單；上述表已包含全部人物設計，工人只做敘述展開與資料組裝。兩份各自使用指定worktree／報告目錄，子代理上限2，共同規格與禁區完整保留。不用inbox的本輪規定覆蓋舊範本寄信段。

## 10. manifest 稿

[第01批manifest](fp-afrwasia-01.manifest.json)與[第02批manifest](fp-afrwasia-02.manifest.json)均是content-batch/1、mode:add、status:draft、base:TBD、maxFiles:42；allow.kinds正好四類、namePrefix={}、modify=[]，checks只列check/lore/typecheck/test/readlist，無probe／playtest。files與ids已各填38件，author指定產出gpt-6.1-sol；驗收紀錄保持空，沒有預填成功。領導核定後補base與準備worktree，工人不自行建分支或工作樹。

## 11. 需要決定

目前無阻塞計畫的事項。供領導審定三項：採用既有culture暫代並另排撒南／中亞名表；同意新加坡／吉大港作外洋轉船待雇點，待本地地圖完成再開本地池；接受14歲學徒只有敘事與tag界線、引擎尚無禁止指派的硬限制（要硬鎖則另派引擎，不在本批補）。本計畫不宣稱任何提案已由使用者定案。

本線按交接書固定四條驗收，結果寫 [acceptance.json](acceptance.json)：11段與年齡說明；合法人物／白話表及全庫不撞名證據；兩份brief_lint --strict為0與合法manifest；24人地方勢力存在、零禁區內容。不加第5條。子代理0；未commit、未寫content或其他wf檔。

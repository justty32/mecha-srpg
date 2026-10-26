# euram 駕駛員與船員填充計畫（草稿）

## 1. 已讀清單

以下交接書點名路徑均親讀；相對路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根。兩個指定檔 `AGENTS.md` 與 `fp-common.md` 由本線親自閱讀，未委派。目錄項全部範本已讀：persons 38 檔、backgrounds 13 檔、recruit-pools 4 檔（2026-10-26 本線快照）。

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

另讀派發器、content world-pillars、data-files、dispatch 入口、指定交接範本與 manifest 格式；history-nodes／history-timeline 與索引按條件用資料工具查，地方／勢力／人物按 id 查小檔。開場 session-log／wait-user 計數為6／1，已讀；inbox/new 無信。本線專用禁區優先，故不寫 SESSION-LOG、ROSTER 或 inbox。

## 2. 盤點：本區與可雇用的缺口

現在全庫有 **38 person（30 human、8 soul）、13 背景、4 招募池、89 lore 人物**；四池共引用13個不同背景，能到達13個不同human。達卡只有1來源卻size4，蘆葦沼4來源抽3，新加坡4抽4，吉大港4抽4；未先被雇走時，除蘆葦沼外幾乎沒有每季組合差異。

person 沒有出身欄，不能按姓名推國籍。嚴格「檔案明示本區出生」為0；按本區地面勢力履歷可確證3個關聯範本：`ilse-brandt`（lore 前鐵砧）、`zofia-kowalska`（iron-anvil）、`ronan-o-dalaigh`（salt-gull），這3個都未被現有池引用。另5個常被誤算作本區出身的姓名範本 `irina-sokolova`、`nuala-byrne`、`sigrun-hallvard`、`ximena-itzel`、`xochitl-reyes` 僅能列待核，不能替它們補國籍。其中 irina 的月面退役背景能在新加坡抽到，但不屬俄國傘背景。**本區明示出身背景0、本區主題池0**；既有歐洲人物偏總匠、專員、議價或團長，缺真正可雇的普通駕駛與船員。

[本區地方與勢力盤點](inventory.json) 共53列：35個地方、18個地方關聯勢力。每列列出id、名稱、可雇人數、人員id、計數依據、缺口與來源。地方35列全為0：13名可抽者沒有直接標出這些地方為出身或現職，不能用勢力總部反推。勢力採較寬的明示tags關聯：鐵砧1（科喬）、稽古學會2（優素福、娜迪雅）、塞勒涅圈2（花、伊琳娜）、殘聯圈2（林照生、橘伊吹），其他14個關聯勢力為0；這些是可雇的勢力關聯人，並不都出身歐美。裂獸列0僅為完整列出地方factions，絕不把獸當雇員。

[既有人物掛連清單](existing-characters.json) 共26列：20個本區據點／履歷條目與6個跨區旁證，保留姓名、角色、faction與born。涵蓋克萊兒、佩特羅娃、奧爾森、莉娜、瑪塔、茉莉、林德、妮娜、達里奧、費雷羅、基羅加、伊內絲、若昂、莉維亞、瑪艾爾、賽拉斯、伊文，以及哈坎、鹽婆、刑天；跨區列伊爾瑟、伊沃、哈爾沃森、奧康納、灰、羅莎。機魂、古代機、死者仍列作避免重複的旁證，**26列不是26位可招募人類**。新角色不接管既有主角身分，也不把只有口音的羅莎、姓名像俄語的沃羅寧娜推定成俄國新人物。

地域界線：歐洲含內海／大西洋岸與歐洲勢力；俄國含提克西、堪察加、雅庫茨克失守後營地；墨西哥歸北美，古巴與巴拿馬歸拉美。跨區機械系範本不改歸屬。基多軍援只在洲內，奈拉是民船家屬與學徒，沒有高原衛軍籍、軍援或古代機隨行。

## 3. 設計理念

把本區寫成在港口換班的人：他們身上的國家與家族，先從說話、手藝和撤退時留下的位置被看見。歐洲六人讓內海家族的院牆與外洋港口的破牆相遇，真正上機的普通人補進現有文書人物之間。俄國六人沿井港與撤運路來到南方，白夜只留下淡水菌光與未回家的記憶，不替國家補一場收復。北美六人從內陸糧道走到沿岸，碰到獸才知道國家庫存不能替身邊的人接下一擊。拉美六人從高地民船、外環車隊和兩洋港口來，古代機仍留在山上，凡人自己把傷機送過街角。二十出頭的人只有崩年前碎片或轉述，三十到五十多歲的人記得職業被斷鏈改寫，十八歲與十四歲則從未見過完整的舊世界。每人都有可吼的話與不同的站起來瞬間，光照在補片、鐘架、末矢與傷機上，不用新增神話答案。

### 方法與禁忌（原則照 fp-common，產出段同樣必守）

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**：少寫帳務與法理，多寫人、畫面、獸、神話的光。每人一個站起來的瞬間與一句能吼出來的話（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件；扶手、熱水同樣不重複作核心畫面。全部24人有吼句，16人為駕駛或船砲手；核心意象逐人在 people.image 指定。
3. **不拿其他作品類比**；中文命名避免直譯（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。不用真實歷史人名；姓名照該文化常見構詞自創，逐名核對全庫與跨線 claims。新專名標「（提案）」，標記放審查／命名表，實際顯示名不把「提案」當姓名一部分。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。本批不創候選者、不送國家專屬機給受雇者；mech 是既有使用經歷，不是招募贈機。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表；矛盾記 REPORT「需要決定」，不改舊檔。九門同喪只按年表2107-04-15掛連，不硬塞N09借貸因果；白夜首燒與失守取2100；古巴歸拉美、墨西哥歸北美調度；基多軍援不出洲。
6. **真相用可見度**；本批只寫可目見的小場面，公開body不預知古代機與墟的答案；若真有傳聞才入secrets並標rumor，新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 4. 人物表與年齡分布

人物表在 [people.json](people.json)，**24列、每列一人**；歐洲6、俄國6、北美6、拉美6。`id` 為person與character共用kebab名；`name/gender/age/born/activeYears` 管身分；`before/after/personality/moment/quote` 管出身與畫面；`role/mech/attrs/levelDice/traits/tags/will` 管能力；`culture/background/backgroundName/attrRanges/hireFee/wageMult/pool/weight` 管招募；`place/faction/hook/events` 管既有掛點；`now/loreDraft/loreExtras/summary` 是逐人寫作材料；`files/batch/template/termsTemplate/profile` 是逐檔工單。所有新人物、背景名與池主題都是提案，保留在審查表。

按五歲的 age（2108）直方圖，█=1人：

```text
10–14 █ 1
15–19 █ 1
20–24 ███████ 7
25–29 ███ 3
30–34 ███ 3
35–39 ███ 3
40–44 █ 1
45–49 ██ 2
50–54 █ 1
55–59 █ 1
60–64 █ 1
```

**16–19歲只有歐文一人，1/24=4.17% ≤5%**。他2090年出生，溫尼伯內陸井站的家存糧、井水與留下的助產者才護住母子；同齡幼兒多未長成，不能寫成普遍世代或神選者。歐文18歲只做報訊，奈拉14歲只做機務學徒，二人均無pilot tag／機甲履歷。其餘22人中有1位62歲廚工，不用核心也不年輕化；55歲西拉操作船砲，同樣沒有不老年資。

僅2位新「不老的」：艾里安38歲、activeYears18，2090年18歲開始駕駛，外貌約24.5歲；薇拉52歲、activeYears16，2092年36歲上機，外貌約40歲。皆機械系、無三系混搭代價，雇價850／wageMult1.6照既有退役測試駕駛，且只分別在歐洲池、俄國池、weight1。其他駕駛都寫明近年才上機，省略activeYears；不把年長等同駕駛資歷。

數值同級暫填，明細 [profiles.json](profiles.json)；person按指定範本複製完整pools、growth基礎結構，再用人物列明示值覆蓋。背景accuracy／resolve／control區間是該範本attrs±10，沿用現有背景跨度；其他屬性維持範本，不另創加成。perks=[]，abilities欄省略，職業差異靠attrs、levelDice與既有trait。person.traits只放指定既有effect，background.traits=[]，避免同一特質重複掛兩邊；零新effect，不加醫療／導航隱形能力。

culture只從已存在的神話表取值，**是遊戲命名偏好，不是國籍分類**；俄語姓名暫用norse，內海greek／celt，商路船員quechua／nahua，逐人cultureNote交代故事來源，不把巴西人硬寫成蓋丘亞族。`culture:...` 是一般tag，專職tag可作標記但不是引擎職類效果。

## 5. 招募池表與每季組合

[pools.json](pools.json) 四列列出完整新池id、base地點、size、theme與六個背景＋權重。新增檔均為 `recruit/地點-主題`，不修改現有四池：

| 池 | 營運地點 | size／來源 | 這一季可能遇到 |
|---|---|---|---|
| singapore-inner-sea-contracts | 新加坡 | 2／6 | 新駕駛與技師常見，偶爾出現不老老手或廚工 |
| dhaka-northern-exiles | 達卡 | 2／6 | 井港守備、領航與醫護換班；老手權重最低 |
| chittagong-western-hunters | 吉大港 | 2／6 | 護糧轉獵手、維修或報訊；非國家派兵 |
| singapore-latin-crew | 新加坡 | 3／6 | 護車駕駛、兩洋導航、老砲手或民船學徒 |

同一地點可有多池且分別刷新；每池只用本區新背景，不與既有池或其他區共享person。首次未雇人時，前三池各有15種無序二人組，拉美池20種三人組；權重影響機率，並非保證每季駕駛／支援各一。每季從符合條件且未在名冊或其他池候選的人中不重複抽樣，雇走會縮小候選集合，剩人少於size就缺額，雇滿便空，不會重生同名人。四池滿額共9名候選，與24人總量不同。

營運掛載只用現有base place：新加坡、達卡、吉大港；人物place欄是歐美俄lore故鄉／經歷，**絕不直接拿它當pool.place**。每人的now說明抵達南亞／新加坡的船程與可雇原因，不靠新開的歐美營運地圖。`refreshOn:quarter` 與現有資料一致，實作在neap刷新，不能另承諾每90天。

## 6. lore 人物草稿要點

逐人的三段要點已存同一人物列 `loreDraft`：**崩前；崩後；現在與招牌瞬間**，避免另抄24份同質表。每段都有指定材料，產出工人只需擴成總計250–450字的body（至少200字），不重設人物。

born完全取2108−age；2086–2088生只寫幼兒碎片／家人轉述，2090與2094生明言崩前未出生。lore的role用backgroundName，faction為既有出身或工作圈，加入玩家後的隊籍不回寫百科。places=[place]按共同規格保留；目前README人物欄未列places，checker可能報未登記欄警告，記錄即可，不自行改格式規格。正文再以既有place連結補清楚，gameRefs只指同名base:person。性別在body自然提及，不往person添未定欄位。

所有body先按公開目擊寫；新加的側面經歷都是本計畫提案，未替原事件增加勝利、擊殺或認主。艾里安是九門次晨的接傷者，瑪倫是歸船夜的旁巷守護者，羅西奧是斷纜夜內街後衛；他們不取代原事件的斬牆駕駛、頂砲者或露西亞。薇拉／娜佳只在雅庫茨克失守後的南側活動，不住在白夜核心。奈拉只會辨接件，不修古代機。

## 7. 需要既有檔插入與 engine-backlog 候選

[inserts-draft.json](inserts-draft.json) 3列，固定columns file/jsonPath/op/value/why。只提議在俄國勢力的places追加已存在的提克西、堪察加井城、白夜菌床；白夜只是舊防區／護運經歷，不是收復宣示。合併線依目前值去重後套，本線與產出工人都不改既有檔。角色的places、faction與events單向引用已足夠，不強塞舊事件characters，不改既有招募池，不添年表。

[engine-backlog-draft.json](engine-backlog-draft.json) 4列，含項目、影響、建議做法、規模：招募小傳入口（S）、船員職類與學徒配置（M）、來源缺額提示／多人背景（S／M）、命名文化擴充（S）。都是候選，沒有一項作本批完成的前置。特別是學徒：目前只保證人設和tag不是駕駛，**引擎尚不能禁止玩家把任何human上機**；本批不宣稱已硬鎖。

## 8. 分批與明確檔案清單

確定 **24組×3=72檔**：24 backgrounds、24 persons、24 lore characters；另加4 recruit-pools，**合計76個新內容檔**。計畫與報告本身不算內容件數。兩批各12組＋2池＝38檔，均≤42檔且≤12組；兩批都有新池，**都會改營運亂數軌跡**，黃金由領導整批後統一重錄。

[batch-files.json](batch-files.json) 為完整76列逐檔白名單（batch、file、kind、id、owner），manifest的files/ids與它完全相同。人物列files也逐一列出三件，沒有未展開的glob；除了這些新檔，產出只准寫指定報告目錄。fp-euram-01是歐洲＋俄國12人與兩池，fp-euram-02是北美＋拉美12人與兩池；沒有跨批sources依賴，可各自驗收。

## 9. 產出交接書稿

[第01批交接書](cx-fp-euram-01.md) 與 [第02批交接書](cx-fp-euram-02.md) 照指定kaiju2範本的段落骨架：先讀、背景與唯一目標、方法與禁忌、範圍、必用工具、資源與禁區、工作、交付、固定驗收、失敗處置、完成／阻塞回報。引用fp-common與deep-rulings，逐人所有值由people對應batch列固定；逐檔序列由batch-files固定，兩者都是交接書不可分割的規格。

指定worktree前綴為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/`，尾名各為 `wt-fp-euram-01/`、`wt-fp-euram-02/`；報告各在主repo `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-euram-NN/`。**只交稿，未建立worktree或啟動產出工人**；子代理上限2，產出模型gpt-6.1-sol。

## 10. manifest 稿

[第01批manifest](fp-euram-01.manifest.json) 與 [第02批manifest](fp-euram-02.manifest.json)：content-batch/1、mode:add、status:draft、base:TBD、maxFiles42、namePrefix空物件、modify=[]。allow.kinds僅base/persons、base/world/backgrounds、base/world/recruit-pools、lore/characters；checks只有check、lore、typecheck、test、readlist，無probe／playtest。

files/ids是預定38檔清單，並非已產出或已驗收；rounds=[]、acceptance={}。領導審過後填實際base，複製為正式批次帳本並準備worktree；工人不寫manifest、不改index、不跑GOLDEN_UPDATE／rerecord。

## 11. 需要決定與本線驗收證據

現階段無必須等使用者回答才能交稿的題。建議按現有culture偏好落地；若領導要擴充民族／語言名表，另線做，不讓工人自造culture。學徒保留為船員人設；若要求引擎嚴格禁止上機，另做職類規則，不假裝tag能鎖。既有基多／伊內絲body對環線首航前後位置有歧義，本批不重述首航位置或天數，以既有event為準，不改舊檔。

本線只核交接書寫死的4條；結果與命名grep、引用存在性證據見 [acceptance.json](acceptance.json) 及 [命名證據](name-checks.json)。未修改content/src/test/specs或其他wf，未commit、未上網、未用MCP、未跑內容產出階段測試。計畫審完後的實作與整合不算本調查線未完成工作。

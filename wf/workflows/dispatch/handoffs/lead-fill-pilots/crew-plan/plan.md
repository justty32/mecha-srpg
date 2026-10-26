# crew 駕駛員與船員填充計畫（cx-fp-crew-plan）

## 1. 已讀清單

以下18個先讀路徑均親自讀過。目錄項涵蓋全部38份person、13份background與4份recruit-pool範本，逐檔見 [read-files.json](read-files.json)（55列）。已讀是本次規劃線的事實，不是給產出線的豁免。

- [/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md](/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md)
- [wf/workflows/common/user.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user.md)
- [wf/workflows/content/README.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/README.md)
- [wf/workflows/content/batch.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md)
- [content/lore/README.md](/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/README.md)
- [content/lore/style.md](/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md)
- [content/lore/style/people.md](/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style/people.md)
- [wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md)
- [wf/workflows/dispatch/handoffs/fill-rulings.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-rulings.md)
- [wf/workflows/dispatch/handoffs/plan-tone-review/review.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-tone-review/review.md)
- [wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md)
- [wf/workflows/planning/design-notes/world/pilots.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/pilots.md)
- [wf/workflows/planning/design-notes/world/history-lines.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-lines.md)
- [wf/workflows/planning/specs/ops/content-format-ops/crew-text.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/ops/content-format-ops/crew-text.md)
- [src/ops/crew/recruit.ts](/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/crew/recruit.ts)
- [content/base/world/recruit-pools/](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/recruit-pools)
- [content/base/world/backgrounds/](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/backgrounds)
- [content/base/persons/](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/persons)

另已讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、原始碼慣例與code-map、dev-env、dispatch入口、world-pillars、指定怪獸交接範本及manifest的欄位骨架；表格透過tabledb查詢，既有人物／地方／勢力依本線範圍讀小檔。開場inbox_read無信。使用者限寫優先，因此沒有寫SESSION-LOG、ROSTER或任何其他wf檔。

本輪只產計畫與草稿；**30組＝90個三類檔，另10個新池，共100個內容檔**。本目錄不是已落地content包，manifest仍draft／base=TBD。固定四條驗收的證據見 [acceptance.md](acceptance.md)。

## 2. 盤點

盤點快照：2026-10-26。現有全庫38個persons（30人類、8機魂）、13個背景、4個池、89個lore人物；可抽到的不同人類範本只有13個。38個persons只有7個能經lore.gameRefs找到對應人物，因此不能把base的人數當成lore已寫齊；這31個既有配套缺口只登記，不在本輪偷補。

本區採明確集合：專業船員／技師，以及鐵砧、鹽鷗、第三刃、遠牧、候鳥號、白手套、沐蝕會、解拘者、殘聯與軍械庫、殘翼、拆船幫、公司／工會／學會的出身。此定義有26個既有人類person、10個背景、10個可抽範本；原有4池都是跨身分綜合池，均與本區有交集，沒有一個純船員主題池。餘下3個可抽範本屬第七哨或月背出身，列為相鄰區，不能漏算全庫13人。

完整本區既有人物49列（包含可掛連但不招募的機魂與歷史人物）、20個勢力、10個營運地點及全部背景／池，在 [inventory.json](inventory.json)。每列保留id、中文名、可雇用數、可抽person名單與判定依據；同名人物不新造第二份。勢力歸屬優先lore的gameRefs，無配套lore者由既有person的tags推定，這是盤點分類，不是引擎陣營欄。

十地目前可雇用範本：吉大港4、達卡1、蘆葦澤4、新加坡4；三角洲、孟買、舊陣列、北方山脊、鹽灘、靜海市各0。十地都補一個新船員池，不改既有4池。base `place/mumbai` 掛lore `place/mumbai-gate` 的外緣流動船工；base `place/selene-city` 掛lore `place/tranquility-city`。這是敘事對應，不能把lore id填入招募池。

勢力目前可雇用數：鐵砧1、殘聯2、候鳥號1、塞勒涅2、稽古學會2、沐蝕會1；拆船幫、達卡公會、遠牧、地勤會、內陸財團、殘聯軍械庫、衍一聯合、舊廠諸家、殘翼、鹽鷗、第三刃、解拘者、白手套、軛鞍行均0。這些是背景連到person且被現有池引用的範本數，不是角色劇情上的在職人數；衍一已解散，保留作歷史出身盤點。

避重與掛連優先看：瑪拉是固定技師兼駕駛、老班是固定廚子兼軍醫、伊爾瑟是既有不老老手；本批不改他們。鐵砧已有格雷格與伊沃，拆船幫已有鐵嘴，白手套已有鄭維舟與手套，沐蝕會已有薩米爾與米拉，達卡已有法蒂瑪與羅凱婭，靜海地勤已有朴仁哲。本批寫他們周邊的勞動與撤離，不另造領袖，不把既有人物變成可雇NPC，也不把新廚務寫成老班第二份。49列的其餘人名在inventory逐項可查。

## 3. 設計理念

船員先是一個站在某塊甲板上的人，再是職能標籤。修理寫出讓機甲重新站起來的那一下，醫護寫出尚有人呼吸時不肯後退的那一下，砲手則知道凡鐵只刮甲、破核仍要同伴的光。獸只留下掀架、刮舷與壓過河面的影，不變成有台詞的敵手。每人都能喊一句自己的話，讓寒酸的工事與船灶也有歌劇的聲音。六位不老老手的外貌與實齡不合，原因全部是崩後長期實駕核心，老炊事和遙控／修理員仍正常衰老。二十歲上下的人只有零星幼年記憶，崩前職業屬於父母那代，2090出生者更要交代自己為什麼活下來。此處的雇用是某人願意再跟一條船走，不能把整個勢力的忠誠和奇蹟一起買下。

方法與禁忌原樣帶入所有產出交接書：

- **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
- **基調**：照 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md` 與 `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點，少寫帳務與法理，多寫人、畫面、獸、神話的光。每人一個站起來的瞬間與一句能吼出來的話（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
- **不拿其他作品類比**；中文命名避免直譯（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。不用真實歷史人名；姓名照該文化的常見構詞自創，不撞現有人名（先 ls 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
- **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
- **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
- **真相用可見度**；新專名標「（提案）」；文筆不強求。人物本身與見過的救援為 public；傳聞只能寫成傳聞，不替山脊或迦梨下答案。
- 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 4. 人物表

[people.json](people.json) 為30列唯一人物表；kebab id同時作person與character檔名。欄位含性別、2108年age、born、activeYears、崩前／崩後、性格、瞬間、招牌話、職能、完整attrs／attrRanges／levelDice、既有trait、tags、culture、背景名、費用、池、地方、勢力與hook；每列附三段bodyOutline及精確範本。未設定activeYears在計畫表為null，落地person須省略欄位，不能填null。

年齡直方圖，五歲一組，█為一人：

```text
10–14  █ 1
15–19  █ 1
20–24  █████ 5
25–29  ████ 4
30–34  ███ 3
35–39  ███ 3
40–44  ████ 4
45–49  ███ 3
50–54  ██ 2
55–59  █ 1
60–64  █ 1
65–69  ██ 2
```

**16–19歲只有裴振羽18歲，1/30＝3.33%，≤5%。** 2090年在仍有接生者與當地糧的內陸救濟站出生；母子被留下來是稀少的存活例，不把出生斷層補滿。14歲譚雲禾2094年生、只當技師學徒，不當駕駛；18歲裴振羽是人類魂核照護學徒，也不當駕駛。另有29歲徐岳衡，學徒指職涯資歷；本批不是新增機魂。20–24歲五人都只留幼年片段或明寫沒有親身記憶，不能寫崩前年輕工程師。

六位不老老手：比仁40／16年、娜西瑪36／14年、魯娜39／16年、薩米拉42／16年、托本45／17年、蘿辛41／16年；最早2091開始駕駛，沒有崩前機甲。appearanceAge依age−activeYears×3/4估外貌（非新增person欄）。六人都還接實駕班，不把白手套離職等同停止一切駕駛；費用沿現有退役測試駕駛850、wageMult1.6，為本批最高同級暫值。三位老船員62、65、68歲均無activeYears，正常衰老。六樣本依本線專屬任務集中編排，領導需與另五線合計守住全輪6–10人，不能讓每線都再填六人。

既有職能tag只有technician能直接找到；medic／navigator／communications／gunner／cook／apprentice等是本輪的描述標籤，沒有額外效果。每人只在person的traits掛一次既有effect，background.traits留空。perks留空、沒有新ability；person其餘pools、will、growth結構完整照template，背景數值照numericReference。culture均取現有名表：bengal、han、mesopotamia、norse、celt、greek、yamato；是招募文化鍵，不宣稱涵蓋現實所有民族。

## 5. 招募池表

[pools.json](pools.json) 有10列，逐列列出新id、營運place、對應lorePlace、size、主題、sources背景及權重、批次。每池3個全新且獨佔的person來源抽2個，老手或未滿20歲學徒權重1、其他3。六池有老手，四池無老手；老手不是每季保證出現。

例如吉大港可能同季見巡修老手與急救手，也可能見急救手與鉚工學徒，玩家在立即可用、長期帶教與高價實駕經驗之間取捨；醫護、工種加成現階段只由已存在attrs／trait反映，不承諾專業技能。三角洲可以輪到導航老手＋砲手或兩位平價船員；靜海三人無老手，換季主要在修工、護理與魂核助手間輪換。

實際 `recruitsDaily7` 只在phase=neap刷新，按background排序後加權不放回抽樣；一個person已在名冊或其他候選中就排除。每季不是新造同名人：把三人全部雇走後該池可空，剩一人只出一人。新池名排序與抽取都會改共享亂數軌跡，三批都標記。荒野地點的候選是短泊補給船上的人，不把北方山脊改成村落、不證實蘆葦澤養裂，也不在孟買核心設安全招募城。

## 6. lore人物草稿要點

每人的三段要點已放people.json的bodyOutline：第一段崩前／出生斷層，第二段崩後職涯與性格，第三段現在、招牌瞬間與原句。產出線逐列擴成250–450字且≥200字，不必自行補身世，不創作新大事件。每份都用 `gameRefs:["base:person/同名"]`、`places:[既有lore地點]`、既有faction；born固定為2108−age的年字串。性別進body，不假設person支援gender欄。

本批30人全部有能喊出的話；獸、殘光或刻痕是可見畫面，不替獸安排心理。核心意象避用鞋、繩、乾衣、杯、梯、燈；產出擴寫也不得拿它們當通用救援模板。托本的刻痕光是2103合挖時的回憶，刑天2106後已移往蒙特婁，不能寫如今仍在舊陣列。薩米拉的拒令是個人信仰裂縫，米拉的排斥機魂立場仍照舊；新人物不替先知證明迦梨。

所有新姓名與背景名於review標「（提案）」；content顯示名維持乾淨，身世本身也是待審草稿。30個name/id已登記 [names-claimed.json](names-claimed.json)；最終grep全庫與跨線證據保存在本目錄驗收資料。

## 7. 需要既有檔插入與 engine-backlog 候選

[inserts-draft.json](inserts-draft.json) 是規定五欄的空表：本批不需要改既有池，也不為流動船員擴張勢力地盤；new character本身的places／faction／gameRefs已能形成連結。既有31個person缺lore、新人物的專業玩法、尚不存在的跨區地點都不能偷偷塞進本批。若另區之後新增營運地點，領導再登記待補池；目前沒有一個已存在且未覆蓋的地點。

[engine-backlog.json](engine-backlog.json) 列5個候選，均含項目、影響、建議做法、規模與本輪處置：招募卡出身／年齡、職類顯示與能力、未成年派任限制、前職勢力、多範本來源。沒有一項在本輪實作。尤其非pilot tag不會自動禁止上機；十四歲的非駕駛定位目前是敘事約束，若需機制保證必須交引擎線，不能以新effect假裝解決。

## 8. 分批

完整逐檔清單在 [batch-files.json](batch-files.json)（100列；batch、file、id、kind），且每份manifest的files／ids已逐檔展開，不用工人猜路徑。每池全部sources都與自身同批，三批沒有新內容相互依賴。

| 批次 | 人物組 | 池 | 檔案數 | 亂數軌跡 |
|---|---:|---:|---:|---|
| fp-crew-01：吉大港、達卡、三角洲 | 9 | 3 | 30 | 會改 |
| fp-crew-02：孟買、舊陣列、蘆葦澤 | 9 | 3 | 30 | 會改 |
| fp-crew-03：山脊、鹽灘、靜海、新加坡 | 12 | 4 | 40 | 會改 |

每批≤12組且≤42檔。person與character同名；背景為人名加-crew；池為地點加-crew。三類檔各30份、池10份。計畫容量上限45KB，產出工人另守單檔16KB／整批1MB；本線不多跑content測試或重錄黃金。

## 9. 產出交接書稿

三稿均按指定cx-kj2-01骨架：先讀、背景與唯一目標、方法與禁忌、範圍、必用工具、資源與禁區、工作、交付、固定驗收、失敗處置、完成／阻塞回報。每稿把三類檔的逐欄抄寫規則寫死，人物差異只取people本批列、池只取pools本批列；不要再設計人名、年齡、出身、瞬間、話語或掛點。子代理上限2；只准新增檔，inserts由合併線套。

- [cx-fp-crew-01.md](cx-fp-crew-01.md)
- [cx-fp-crew-02.md](cx-fp-crew-02.md)
- [cx-fp-crew-03.md](cx-fp-crew-03.md)

worktree固定在指定scratchpad的wt-fp-crew-NN，報告在lead-fill-pilots/fp-crew-NN；這些只是未啟動草稿，規劃線沒有寫到那裡。

## 10. manifest稿

- [fp-crew-01.manifest.json](fp-crew-01.manifest.json)
- [fp-crew-02.manifest.json](fp-crew-02.manifest.json)
- [fp-crew-03.manifest.json](fp-crew-03.manifest.json)

格式content-batch/1；mode:add、status:draft、base:TBD、maxFiles:42；allow.kinds僅persons／backgrounds／recruit-pools／characters，namePrefix空物件、modify空陣列。checks恰為check、lore、typecheck、test、readlist；沒有probe／playtest。領導啟動前填base，不讓工人建分支或自行改manifest。

## 11. 需要決定

沒有缺資料而阻塞本計畫的問題。領導審定時處理三項：全輪不老樣本總數由本線6人加另五線合計控制在6–10；十四歲學徒是否需先有引擎硬性派任限制（目前計畫保持非駕駛定位，不假稱已鎖）；孟買營運id是城市、lore卻是蝕域外緣，維持本稿孟買門短泊人員的讀法，未獲裁示不改地點檔。

新姓名、船員分工與同級價格均為待審提案；本線已作可直接產出的選擇，毋須使用者逐項取名。`places`並未列在lore README人物欄位表，但共同規格明令每人必填，產出線照填、若check產生未登記欄警告照實報，不改格式文件。既有內容的歷史矛盾與31個person缺lore配套一併留領導後續排程，不擴本批範圍。

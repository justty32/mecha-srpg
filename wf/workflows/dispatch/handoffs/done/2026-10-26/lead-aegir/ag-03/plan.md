# ag-03 批次計畫：歐洲的人與舊帳（提案）

## 1. 已讀清單

以下皆親讀，路徑相對 repo 根。history-nodes 用 tabledb 查節點；timeline 查歐洲條目；v3 讀第 1、2、3.5 節及巨頭補段。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/aegir.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`
- `wf/workflows/planning/design-notes/world/history-lines/d-moon.md`
- `wf/workflows/planning/design-notes/world/history-nodes.json`
- `wf/workflows/dispatch/handoffs/plan-epic/v3.md`
- `content/lore/timeline.json`
- `content/lore/factions/euro-umbrella.json`
- `content/lore/factions/inner-sea-houses.json`
- `content/lore/factions/salt-gull.json`
- `content/lore/factions/anvil.json`
- `content/lore/factions/remnant-wings.json`
- `content/lore/factions/shell-society.json`
- `content/lore/places/hamburg.json`
- `content/lore/places/rotterdam-roost.json`
- `content/lore/places/saint-malo.json`
- `content/lore/places/istanbul.json`
- `content/lore/places/rhine-trench.json`
- `content/lore/places/skagerrak-shell.json`
- `content/lore/places/genoa-yards.json`
- `content/lore/places/alpine-shell.json`
- `content/lore/events/first-bid-sheet.json`
- `content/lore/events/aegir-lien.json`
- `content/lore/events/aegir-wakes.json`
- `content/lore/events/nine-gates.json`
- `content/lore/events/first-hunting-bands.json`
- `content/lore/events/skagerrak-shell-found.json`
- `content/lore/events/skagerrak-incident.json`
- `content/lore/events/gull-anvil-truce.json`
- `content/lore/characters/molly-van-den-berg.json`
- `content/lore/characters/greg-olsen.json`
- `content/lore/characters/salt-crone.json`
- `content/lore/characters/hakan-demir.json`
- `content/lore/characters/patrick-oconnor.json`
- `content/lore/characters/ilse-brandt.json`

另讀開場 SESSION-LOG、WAIT_USER、WORKFLOWS、inbox README／PROTOCOL、common/data-files、world-pillars/world 及三子檔；以 tabledb 查 terms-rename、history-lines（D／F／G）、history-timeline（歐洲掛線）。依本交接書只交兩檔，不登記其他 wf 檔；信箱輪詢與回報照令執行。

## 2. 設計理念

讓玩家在港口看見兩種歐洲：一岸在濕石上清點沒回來的人，另一岸把機與帳單一起裝船。國家縮而不死，援軍未到，登記簿與徵召令仍能到。家族買獵團、公會議價，桌邊的人能爭條款，不能保證每座港都守住。埃吉爾是大西洋岸自己的英雄，但在 2108-01 尚未認主，本批寫出等它的地方怎樣活下來。

### 方法與禁忌（交接書原樣轉錄，產出工人沿用）

- **節點優先、不暴力產 lore**：先列要掛的節點與主線（N01–N10、八條線 A–H、崩年底色 1.1–1.13、年表條目），再決定人與事；每件說清前因與後果。
- **不拿其他作品類比**：不寫任何外部作品名或角色名。
- **中文命名避免直譯**（polish「首要標準」兩步命名：先英文原名＋意涵，再意譯或音譯）；用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`（古代機本體叫古代機、外層叫裝甲；潮→蝕）。新名詞標「提案」。
- **國家、塞勒涅、巨頭、家族只削弱不萬能**；國家縮而不死（法理、登記簿、徵召、地契還在）。
- **已裁示不推翻**；既有 lore 一字不改（需要咬合的地方列成「建議插入」，由領導另批處理）。
- **真相用可見度標**：外界不知道的放 `secrets`。
- **富豪與內海家族群像不點名**：不寫家族姓氏、家主名字。**埃吉爾的認主者不點名**（「拆件的」不能成為具名人物）。
- **不造機甲型號與怪獸資料**：需要的機型或怪獸只能引用既有名字（grep `content/lore` 與 `content/base`）；真的缺就列在計畫「需求」段，交機甲線／怪獸線。

共七個新檔，四人三事，待領導審過才產出。人物皆為普通人，無富豪血緣、無古代機認主；姓名不指代內海家族。英文姓名放人物 `aka`，事件英文與意涵留本計畫供領導帶入批次命名表。人物 2108 狀態寫 `body`，`gameRefs: []`，不增 schema 或 base 人物。清單依交接書明文留在本檔，白話另存 review-draft.json。

## 3. 掛點表

先定斷鏈、外包、守線融資與評等的因果，再落人物與事件；N09 是抵押的後續，不能用同期災難倒推借貸原因。

| 掛點 | 用途與理由 |
|---|---|
| N01／G、F／1.4 糧、1.5 空城、1.8 哀悼 | 沉堤與港務人物承接斷鏈、撤離及留下的人。 |
| N03／G／1.6 國家、1.13 開局 | 遷簿與議價人具體化「國家保法理、獵團握一夜到」。 |
| N06 前史→N09／D、G，副 F／1.5、1.6、1.7 債 | 空城先歸國庫再抵押借款，連接築牆與信貸。 |
| N08／G／1.6、1.12 價值 | 公會承認獵牌評等，沒有跨傘發牌權。 |
| 2089-03-14 第一次蝕潮 | 沉堤是地方後果，不新造初始裂縫。 |
| 2093-06 防線私有化；2093-07 殘翼開業 | 遷簿令接外包之後，國家留下的權力與承包者分開。 |
| 2096 鹽鷗獵團成軍 | 莉娜留下管糧，茉莉帶機甲隊成團，兩條生路並存。 |
| 2101 新加坡會議；2102 第一張標單 | 抵押先於正式歐傘，議價人承接既有席位。 |
| 2106 獵牌法、鹽鷗鐵砧停火、埃吉爾的帳單 | 採用評等；國家抵押土地與獵團抵押裝備並列，不混同。 |
| 2107 信貸協定 | 築牆借款早已存在，催收權擴張仍留既有年份。 |
| 2107-04-15 九門同喪 | 專員與總匠各見一端的損失，只作 G 線群像，不硬掛 N09。 |

## 4. 清單（七件：人物四、事件三）

新日期、生年、姓名與地方細節均為提案。下列檔名相對 `content/lore/`；全批 `visibility: public`，無秘密者 `secrets` 可空或省略。正文只寫外界可見的事。

### 4.1 莉娜・菲瑟（提案）

**id／檔**：`character/lena-visser`／`characters/lena-visser.json`。**命名**：Lena Visser，意涵為港務工的普通姓名，不是家族招牌；中文音譯。**類別／生年**：人物、human／2067；`faction: null`，鹿特丹民用糧倉與泊位協調人，非鹽鷗團員。

**掛到**：N01→N03／G、副 F／1.4、1.5、1.8；第一次蝕潮→2096 鹽鷗成軍。**前因**：外海停船，糧車與修堤料斷了。**經過**：沉堤時先解開糧駁纜繩，將糧送上高處；救出的人吃得到糧，自己的住處卻沉在回不去的碼頭。**後果**：她留下管糧與泊位，茉莉日後帶機甲隊成團；獵團回來仍有人接船。

**2108-01**：在鹽鷗巢外排民用卸糧班，雇得起護貨，付不起整岸守夜。**既有關係**：引用 `place/rotterdam-roost`；`relations` 連 `character/molly-van-den-berg`（港務舊同事）、`character/salt-crone`（返港報平安的往來對象）；`events` 放本批 `event/rotterdam-breach`。不替茉莉創團、不兼拆件技工、不預知認主，無既有事實衝突。**secrets**：無。

### 4.2 克萊兒・雷諾（提案）

**id／檔**：`character/claire-renaud`／`characters/claire-renaud.json`。**命名**：Claire Renaud，意涵為持國家印章辦事的公職人員；中文音譯。**類別／生年**：人物、human／2063；`faction: null`，法國派駐聖馬洛、管登記與徵召的專員；國家名稱放 `role/body`，不偽造 faction id。

**掛到**：N03→N06→N09／G、D／1.6、1.7；防線私有化→新加坡會議→信貸協定。**前因**：沿海分所斷薪，簿冊卻決定誰可徵召、哪塊地歸國庫。**經過**：2093 隨正冊退往內陸，留下港口副本；2099 核抵押地，將仍有活人申訴的頁列待查，替確認無人繼承的土地蓋章。**後果**：部分申訴暫緩抵押，國家仍拿其餘空城借款；她是申訴窗口，也是收走地契的人。

**2108-01**：在聖馬洛核對九門同喪後的名冊、送徵召令，無法保證援軍。**既有關係**：引用 `place/saint-malo`、`event/nine-gates`、`event/credit-accord`；`events` 放本批 `event/inland-registers`、`event/coastal-mortgage`；`relations` 連本批瑪塔（核款交貨）。不把九門原有匿名守門兵或記錄員改成她，無事件角色衝突。**secrets**：無，不暗設偽造地契。

### 4.3 奧斯卡・林德（提案）

**id／檔**：`character/oskar-lind`／`characters/oskar-lind.json`。**命名**：Oskar Lind，意涵為靠談契約維生的公會議價人；中文音譯。**類別／生年**：人物、human／2059；`faction: null`，歐傘獵團公會議價人；公會是既有職能，不增勢力檔。

**掛到**：N03→N08／G／1.6、1.12、1.13；防線私有化→第一張標單→獵牌法。**前因**：退伍者改獵團，家族買守夜時數，港城拿欠帳求援。**經過**：2102 在公會席上逐項念守多久與價格上限，看現金先帶走好手；2106 後將獵牌評等照錄標單，未另發一套牌。**後果**：小獵團有人替它爭價，但上限只管價格、不保證援軍，賒帳的城仍排後面。

**2108-01**：往來漢堡議價席，替港城談付款期限，也公開收家族議價費。**既有關係**：引用 `place/hamburg`；`events: [event/first-bid-sheet]`；`relations` 連 `character/greg-olsen`、`character/molly-van-den-berg`（議價對手）。停火只引 `event/gull-anvil-truce` 的結果，不奪殘聯斡旋功、不寫成公會創辦人，無既有制度衝突。**secrets**：無，不憑空增貪污陰謀。

### 4.4 瑪塔・貝里尼（提案）

**id／檔**：`character/marta-bellini`／`characters/marta-bellini.json`。**命名**：Marta Bellini，意涵為替雇主蓋印交貨的工人姓名；中文音譯。**類別／生年**：人物、human／2061；`faction: faction/inner-sea-houses`（受雇、非血親、非家主），熱那亞一座家族工坊的總匠。

**掛到**：N06 前史→N09／D、G／1.6、1.7；新加坡會議→第一張標單；九門同喪只作 G 線對照。**前因**：公刻能讀，精粹、型錄件與工錢仍須付。**經過**：2099 接沿海地契抵押款支付的修造單，按雇主批准裝船，缺章就停；2107 九門同喪消息到時，已出貨的機又有了修理訂單。**後果**：船塢工人領得到薪，港城用未來收入付今夜的牆，她不能越過貨主免帳。

**2108-01**：在熱那亞排修造班，認得貨單上的港，沒去過倒下的門。**既有關係**：引用 `place/genoa-yards`、`event/first-bid-sheet`、`event/nine-gates`；`events` 放本批 `event/coastal-mortgage`；`relations` 連雷諾（核單往來）。不造型號血統、不宣稱經手九門戰場特定機體，無已知衝突。**secrets**：無。

### 4.5 鹿特丹沉堤（提案）

**id／檔**：`event/rotterdam-breach`／`events/rotterdam-breach.json`。**命名**：The Broken Dikes of Rotterdam，意涵為堤防與補給失去後，活人仍留在水邊；意譯「鹿特丹沉堤」。**類別／日期**：事件、災難／2089-04；`period: era/first-tide`。

**掛到**：N01 後果→N03 地方前因／G、副 F／1.4、1.5、1.8；第一次蝕潮→鹽鷗成軍。**前因**：首次蝕潮後舊堤受損，停航與斷鏈使修繕無以為繼。**經過**：幾段堤防先後垮下，莉娜將糧駁送到高處，碼頭工與拖船手撤出低倉；不加裂縫、不安排尚未下線的衍型機、不指定新怪獸。**後果**：留下半沉貨櫃港，日後成水上機庫；留港的人尋找守港武力，2096 才有鹽鷗成團。

**2108-01**：堤防缺口與半沉碼頭仍在，城守住，未淹沒全鹿特丹。**既有關係**：`places: [place/rotterdam-roost]`、`characters: [character/lena-visser]`、`factions: []`（鹽鷗與歐傘未成立）；正文引 `event/first-tide`。承接地方檔已有「第一次蝕潮後垮了幾段」，月份與轉運過程為提案，無地貌矛盾。**secrets**：無，不把斷糧改寫為家族密謀。

### 4.6 遷簿令（提案）

**id／檔**：`event/inland-registers`／`events/inland-registers.json`。**命名**：The Registers Go Inland，意涵為國家帶著法理退守，命令仍送回海岸；意譯「遷簿令」。**類別／日期**：事件、政治／2093-08；`period: era/mimic-dawn`。

**掛到**：N03→N06／G／1.5、1.6；防線私有化→新加坡會議。**前因**：沿海稅收與軍費崩潰，簿冊散落，內陸行政仍在。**經過**：法國將布列塔尼沿海的產權、國籍、徵召正冊集中內陸，雷諾隨行；海岸留副本與派駐窗口，國家審定無人繼承的土地才列國庫。**後果**：實際退守不等於放棄法理，聖馬洛仍收到徵召；可查的國庫產權成為築牆借款前因。

**2108-01**：正冊內陸保管、港口持副本，失聯者的繼承申訴仍待核。**既有關係**：`places: [place/saint-malo]`、`characters: [character/claire-renaud]`、`factions: []`（國家無 id，不借尚未成立的歐傘）；正文引 `event/first-hunting-bands`。只寫一國沿海分所遷簿，不寫全歐同令、法國首都遷移或國家消亡，不另造城市，符合 polity 裁示。**secrets**：無。

### 4.7 空城押契（提案）

**id／檔**：`event/coastal-mortgage`／`events/coastal-mortgage.json`。**命名**：The Coast in Pledge，意涵為拿無人住的沿海土地換活人城牆的錢；意譯「空城押契」。**類別／日期**：事件、政治／2099-10；`period: era/yoke-years`（歷史分期是築牆，與 era 名稱分開）。

**掛到**：N06 融資前史→N09／D、G，副 F／1.5、1.6、1.7；新加坡會議→信貸協定。**前因**：遷簿留下可查產權，聖馬洛急需修造，國庫缺現金。**經過**：法國將確認歸國庫的布列塔尼沿海空城地契押給穹頂下的錢，塞勒涅作窗口；雷諾核地籍，部分款付熱那亞工坊，瑪塔依批准出貨。**後果**：物資到了，抵押留在地契上；2101 守線與 2107 信貸面對已有舊債的城。

**2108-01**：地契未解除抵押，返鄉者須向國家證明繼承，再面對債權負擔，不預定訴訟勝負。**既有關係**：`places: [place/saint-malo, place/genoa-yards]`、`characters: [character/claire-renaud, character/marta-bellini]`、`factions: [faction/selene, faction/inner-sea-houses]`；引本批遷簿令、既有 `event/credit-accord`。與 `event/aegir-lien` 只是土地／裝備抵押對照，非同契約或同債主揭密。空城在聖馬洛周邊沿海，不將守住的全城或九門貨場改成空城；不寫塞勒涅買死人的債、抵押即取得主權。**secrets**：無，金主維持群像。

## 5. 年表插入（只列、不做）

三條 `visibility: public`，各有對應 `event`；日期升冪，同月新列放既有同月列後，不宣稱月內先後。

**2089-04｜鹿特丹沉堤**：`event/rotterdam-breach`；`era: era/first-tide`；`factions: []`；`tags: [tide]`。summary：首次蝕潮後堤防失修，港務工轉運糧食、撤出低處，半沉碼頭日後成為鹽鷗巢。排同月〈鐵翼之月〉後、2089-05〈抗性之證〉前；不另定漲潮日。

**2093-08｜遷簿令**：`event/inland-registers`；`era: era/mimic-dawn`；`factions: []`；`tags: [diplomacy]`。summary：法國集中布列塔尼沿海登記正冊到內陸，港口留副本，國籍、徵召與地契仍由國家認定。排 2093-07〈殘翼航空開業〉後、2093-09〈堅盾-I型 普及〉前。

**2099-10｜空城押契**：`event/coastal-mortgage`；`era: era/yoke-years`；`factions: [faction/selene, faction/inner-sea-houses]`；`tags: [diplomacy]`。summary：法國以沿海空城地契向穹頂下的錢抵押，經塞勒涅借款，換熱那亞的守城修造物資。排所有 2099 年-only 條目（目前末條〈堅盾-I「哨火」改〉）後、2100〈慶州古陵之爭〉前。

## 6. 建議插入既有檔（只列、不做，由領導另批）

路徑相對 `content/lore/`；新檔先單向引用，即使下列未批仍可成立。

- `places/rotterdam-roost.json` 的 `body`「發生過什麼」：補沉堤連結與莉娜接糧，保留原地貌與守住狀態。
- `characters/molly-van-den-berg.json` 的 `relations`：加莉娜為港務舊同事，她留下管糧與泊位。
- `places/saint-malo.json` 的 `body`「誰在這裡」：加雷諾保管副本、核名冊與送徵召令，不改匿名守門兵。
- `events/first-bid-sheet.json` 的 `characters`：加 `character/oskar-lind`；`body`「援軍競標」補他代公會念守時與上限。
- `places/genoa-yards.json` 的 `body`「誰在這裡」：加受雇總匠瑪塔依貨主批准蓋印出貨。
- `events/credit-accord.json` 的 `body`：領導確認合適段落後，補空城押契為歐洲舊債樣本；不把新人物列入協定簽署人。
- `timeline.json` 的 `entries`：照第 5 節加三條；人物不加出生年條目。

不把總匠加進家族 `leaders`，不向 aegir-wakes 添具名人物或公開連結。

## 7. 需求

機甲線：無。怪獸線：無。本批不指定機型、怪獸或新能力；2089 只撤離運糧，2099 只談既有衍型機修造與備件，不增戰果與數值。

## 8. 矛盾與待決

**既有年代，留領導另批。** timeline 火併記 2105，gull-anvil-truce 與人物／勢力寫 2106 火併半年後停火；本批只引停火結果。first-hunting-bands 的 date 是 2093，timeline 是 2093-06，屬精度差。ilse-brandt 的 2073 生、十九歲入剛改組鐵砧推得 2092，早於 2093 成軍；本批不寫她入團年。

**機型過早用語，避免承襲。** first-bid-sheet 的 2102 兩棲長槍與 timeline 2104 鹽鷗型下線／V4 定版有時序疑點，molly、salt-crone 又寫 2098 舊長槍；N03 裁示長槍 2102 才成通用系列。本批只寫獵團與修造，不為舊檔另補歷史。

**裁示優先。** v3「十年零件庫／十五年懷錶／2100 不具名買家」已由 aegir.md 的六年、無年數與 2106 抵押承接。掛線表九門同喪列 N09，同列 R30 又說不硬掛；本計畫採 R30，只作 G 線群像。first-hunting-bands「沒有國家付錢」讀為國家付不起這支部隊，不擴成國家全滅。

**待領導審定的填充提案。** 七件姓名日期、雷諾的法國派駐身分、遷簿限布列塔尼沿海分所、2099 地契款供聖馬洛修造，均未宣稱使用者已拍板。國家與公會無既有 faction id，以 null／空陣列加正文承載，不增第八檔。無必須請使用者另選世界觀方向的阻塞；領導不採時先改計畫再產出。

本線驗收固定三條：① 計畫存在、含 1–8 段、清單 6–9 件；② review-draft.json 合法且列數等於清單；③ 清單無內海家族姓氏、家主或埃吉爾認主者名字。計畫容量上限 20 KB、件數上限九；做完三條即停，不追加開發驗收。

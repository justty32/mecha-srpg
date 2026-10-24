# cx-anc-c 完成回報：70 件人物與機魂內容通過檢查

## 做了什麼

完成 persons 30 件（古代機候選 12、其他駕駛員 6、技師 5、科研員 3、機魂 4）、人物 effects 24 件（特質 14、背景 4、傷勢 6）、perk effects 12 件、soultrees 4 棵。70 件內容共 **72,922 bytes**；加本 REPORT 共 71 件交付檔，未達原始 72 件／300 KB gate，也未使用 orders 放寬的額度。只新建本線內容與 REPORT；名稱修訂也只涉及本次自己新建的檔案。

依 10:55 與 10:57 orders 採太空歌劇名稱：如「星燼落處」「獵星織網」「無人王座」「圍城補天匠」。機魂採 C 級九號燈、B 級灰燼算盤，以及 S 級空茶杯、S 級鏽鳶；前兩者偏工具性、只有一項小習慣特質，後兩者以怕水／空座眷戀、拒絕所有權／記仇的 trait 與成長方向呈現個性，僅後兩者附代表台詞。沒有增加額外特質件數。

固定四條驗收證據：

1. **內容檢查通過。** effects／perks／樹一批及 persons 每 10 件各跑一次 `npm run check`，四次 exit code 均為 0，末行均為 `OK 0 errors, 0 warnings`。最後一次全包 person 為 37（human 30、soul 7），其中本線新增 30；沒有需要排除的其他線錯誤。
2. **數量與共鳴通過。** 唯讀腳本 `node /tmp/cx-anc-c/acceptance.mjs` 由本線明確檔案清單計出 persons 30、人物 effects 24、perk 12、soultree 4；從已存在的十二台 frame 讀取信念，12 人均命中兩項，無 deed 時仍達 0.700–0.833，對照如下。每位人物有 traits；人類有 ap／fatigue／hp，機魂有 ap／fatigue／calc。四棵樹各四節點，第四節點沿用既有 perk；solo-4 與 feral-4 含 research.autonomy。
3. **能力與引用通過。** 本線新增能力數為 0，故 `ai.tactics`／`mode` 沒有新增適用項，也未新增 reaction。內容載入器與本線唯讀核對均確認引用的 effect／curve／soultree id 存在，樹內 requires 節點存在；person 不直接引用其他工人的 frame id。
4. **REPORT 交付。** 本檔依四段格式記錄產出、完整清單、限制與待決事項，並附工具交接段。70 件內容與本檔的連結均列於下文。

### 古代機候選共鳴對照

共鳴以未取得 deed 計算：分母為每台兩個 beliefs 加一個 deed，分子為兩個信念命中加殼緣。純信念已達 2/3；數值達門檻只代表候選相容，不宣稱敘事上已完成認主。

| 人物檔 | 對應古代機 | will.beliefs | 無 deed 的共鳴 |
|---|---|---|---|
| [西格倫・哈爾瓦德](../../../../../../../../content/base/persons/sigrun-hallvard.json) | 芬里爾（chainbreaker） | break-chains、revenge | (2 + 0.2) / 3 = 0.733 |
| [娜迪雅・馬斯里](../../../../../../../../content/base/persons/nadia-el-masri.json) | 阿努比斯（psychopomp） | judge-the-dead、bring-them-home | (2 + 0.4) / 3 = 0.800 |
| [林照生](../../../../../../../../content/base/persons/lin-zhaosheng.json) | 哪吒（lotus） | reborn、defy-the-father | (2 + 0.2) / 3 = 0.733 |
| [橘 伊吹](../../../../../../../../content/base/persons/tachibana-ibuki.json) | 須佐之男（stormblade） | wild-storm、protect-kin | (2 + 0.1) / 3 = 0.700 |
| [法麗達・拉赫曼](../../../../../../../../content/base/persons/farida-rahman.json) | 提亞瑪特（brinemother） | protect-kin、revenge | (2 + 0.3) / 3 = 0.767 |
| [瑪雅・特朗吉](../../../../../../../../content/base/persons/maia-te-rangi.json) | 毛伊（sunsnarer） | outwit-fate、survive | (2 + 0.1) / 3 = 0.700 |
| [希梅娜・伊策爾](../../../../../../../../content/base/persons/ximena-itzel.json) | 魁札爾科亞特爾（plumed） | seek-truth、atonement | (2 + 0.4) / 3 = 0.800 |
| [阿倫・維蘭](../../../../../../../../content/base/persons/arun-velan.json) | 迦樓羅（serpenteater） | devotion、break-chains | (2 + 0.2) / 3 = 0.733 |
| [佐菲亞・科瓦爾斯卡](../../../../../../../../content/base/persons/zofia-kowalska.json) | 佩倫（thunderoak） | never-retreat、keep-oaths | (2 + 0.2) / 3 = 0.733 |
| [羅南・歐達利](../../../../../../../../content/base/persons/ronan-o-dalaigh.json) | 庫丘林（riastrad） | hunger-for-glory、keep-oaths | (2 + 0.1) / 3 = 0.700 |
| [達莉雅・法爾贊](../../../../../../../../content/base/persons/darya-farzan.json) | 阿特拉斯（skybearer） | bear-the-weight、atonement | (2 + 0.5) / 3 = 0.833 |
| [巴特巴雅爾・額爾德尼](../../../../../../../../content/base/persons/batbayar-erdene.json) | 海姆達爾（watchhorn） | keep-watch、bring-them-home | (2 + 0.2) / 3 = 0.733 |

## 產出（完整檔案清單，每件一句定位）

### 人物 30 件

- [content/base/persons/sigrun-hallvard.json](../../../../../../../../content/base/persons/sigrun-hallvard.json)：潮信會出身的北歐逃囚，把教團牽獸的鎖鏈磨成牙套，誓要回去救人並討債；芬里爾候選。
- [content/base/persons/nadia-el-masri.json](../../../../../../../../content/base/persons/nadia-el-masri.json)：殼學會阿拉伯裔收殮員，為無名屍編造暫名以便日後歸還；阿努比斯候選，夢見的死者還沒有臉。
- [content/base/persons/lin-zhaosheng.json](../../../../../../../../content/base/persons/lin-zhaosheng.json)：殘聯重慶城邦軍官之子，燒掉父親替他簽的終身服役書，把出逃日當生日；哪吒候選。
- [content/base/persons/tachibana-ibuki.json](../../../../../../../../content/base/persons/tachibana-ibuki.json)：殘聯大阪城邦的颱風救難艇長，敢撞破封港閘把鄰里接走；須佐之男候選。
- [content/base/persons/farida-rahman.json](../../../../../../../../content/base/persons/farida-rahman.json)：孟加拉灣第七哨的失子潛水員，在救生衣上縫滿沒能救回的名字，仍每天往海裡下去；提亞瑪特候選。
- [content/base/persons/maia-te-rangi.json](../../../../../../../../content/base/persons/maia-te-rangi.json)：「背面」毛利裔走私領航員，靠偽造自己的死訊逃過三張債單，如今要偷走拍賣場上叫不醒的殼；毛伊候選。
- [content/base/persons/ximena-itzel.json](../../../../../../../../content/base/persons/ximena-itzel.json)：塞勒涅墨西哥裔月面測繪員，曾改圖掩蓋礦難，如今偷存每一條真座標準備作證；魁札爾科亞特爾候選。
- [content/base/persons/arun-velan.json](../../../../../../../../content/base/persons/arun-velan.json)：殘聯孟買城邦的泰米爾護送員，把贖母親的債約釘在座艙裡，答應讓整批債役者一起回家；迦樓羅候選。
- [content/base/persons/zofia-kowalska.json](../../../../../../../../content/base/persons/zofia-kowalska.json)：鐵砧獵團波蘭裔砲手，曾在撤退令後守住墳場一整夜，只因答應了遺屬不能再失去那片土；佩倫候選。
- [content/base/persons/ronan-o-dalaigh.json](../../../../../../../../content/base/persons/ronan-o-dalaigh.json)：鹽鷗獵團愛爾蘭裔替補槍手，替死去的認主者抬棺後立誓超越其戰績，尚未獲沉睡殼回應；庫丘林候選。
- [content/base/persons/darya-farzan.json](../../../../../../../../content/base/persons/darya-farzan.json)：塞勒涅波斯裔承重核監工，曾簽下害死工班的減料單，此後親自留守靜海市最深的支柱；阿特拉斯候選。
- [content/base/persons/batbayar-erdene.json](../../../../../../../../content/base/persons/batbayar-erdene.json)：殘聯總部蒙古裔通訊騎手，保留失聯小隊的呼號，直到每個人活著或裝在袋裡回來；海姆達爾候選。
- [content/base/persons/adewale-balogun.json](../../../../../../../../content/base/persons/adewale-balogun.json)：殘聯約魯巴裔契約駕駛，按街坊輪值表出勤，總替不識字的鄰居讀懂獵牌細則；無指定古代機。
- [content/base/persons/irina-sokolova.json](../../../../../../../../content/base/persons/irina-sokolova.json)：塞勒涅退役的低重力測試駕駛，退休金仍被渡輪債扣走，接獵團工作只為贖回自己的工具箱；無指定古代機。
- [content/base/persons/salim-haddad.json](../../../../../../../../content/base/persons/salim-haddad.json)：潮信會阿拉伯裔叛教者，因放走會求饒的機魂而被追殺，仍不肯裝回獸的嘴籠；無指定古代機。
- [content/base/persons/mitali-das.json](../../../../../../../../content/base/persons/mitali-das.json)：第七哨孟加拉難民孩子，能在裂獸躁動前叫醒整艘避難船，駕駛訓練仍靠壞掉的模擬器；無指定古代機。
- [content/base/persons/nuala-byrne.json](../../../../../../../../content/base/persons/nuala-byrne.json)：競爭獵團第三刃的愛爾蘭裔決鬥手，每次比武前都賣自己會輸的消息，讓勝利付得起修理費；無指定古代機。
- [content/base/persons/yusuf-demir.json](../../../../../../../../content/base/persons/yusuf-demir.json)：殼學會土耳其裔學生，把課堂考古隊的撤離路線畫得比論文還仔細，第一次上機仍帶著野外筆記；無指定古代機。
- [content/base/persons/esin-kaya.json](../../../../../../../../content/base/persons/esin-kaya.json)：殘聯土耳其裔圍城吊裝技師，用吊車拆過自家街區來堵獸潮，堅持每個焊點刻下施工者名字；無指定古代機。
- [content/base/persons/kojo-mensah.json](../../../../../../../../content/base/persons/kojo-mensah.json)：鐵砧獵團迦納裔回收技師，先找座艙再找值錢部件，會把死者的螺絲刀交還家屬；無指定古代機。
- [content/base/persons/anjali-nair.json](../../../../../../../../content/base/persons/anjali-nair.json)：達卡紡織公會馬拉雅拉姆裔技師，把織機梭道改成拘束器零件，從不讓徒弟獨自進獸艙；無指定古代機。
- [content/base/persons/hana-sato.json](../../../../../../../../content/base/persons/hana-sato.json)：塞勒涅日裔魂核維修員，在報廢清單上偷偷替每顆魂核加上自取名，拒絕再寫純序號；無指定古代機。
- [content/base/persons/tupaia-moana.json](../../../../../../../../content/base/persons/tupaia-moana.json)：「背面」玻里尼西亞裔艙外焊工，習慣用海潛手勢教人真空作業，修過的艙門都會多一個逃生把手；無指定古代機。
- [content/base/persons/leila-nasser.json](../../../../../../../../content/base/persons/leila-nasser.json)：殼學會阿拉伯裔殼訊研究員，用受試者夢話編匿名合唱譜，認為前任記憶應當先被哀悼再被利用；無指定古代機。
- [content/base/persons/xochitl-reyes.json](../../../../../../../../content/base/persons/xochitl-reyes.json)：塞勒涅流亡的墨西哥裔育魂研究員，帶著自己曾出售的複本名冊逃走，逐個教它們說出拒絕；無指定古代機。
- [content/base/persons/altantsetseg-bolormaa.json](../../../../../../../../content/base/persons/altantsetseg-bolormaa.json)：第七哨蒙古裔獸行研究員，拿孩子畫的噩夢圖與獸潮路線對照，只准自願參加、隨時離席；無指定古代機。
- [content/base/persons/lantern-nine.json](../../../../../../../../content/base/persons/lantern-nine.json)：殘聯港務用 C 級機魂「九號燈」，負責點名與守望，只保留出發前重數乘員一次的小習慣；守護樹、個性淡薄，無指定古代機。
- [content/base/persons/abacus-of-ashes.json](../../../../../../../../content/base/persons/abacus-of-ashes.json)：鐵砧獵團 B 級輔射機魂「灰燼算盤」，按表修正射擊，只有逐項核對紀錄的習慣；逐星獵手樹、偏工具性，無指定古代機。
- [content/base/persons/empty-teacup.json](../../../../../../../../content/base/persons/empty-teacup.json)：塞勒涅退役 S 級機魂「空茶杯」，愛搭檔替它形容茶香、討厭空座被叫廢位，平日撒嬌討故事，搭檔失去回應時強裝鎮定接過返航誓言；獨駕樹、無古代機認主；代表台詞：「再陪我說一杯茶的時間嘛……你睡著了？那這次換我帶你回家。」
- [content/base/persons/rust-kite.json](../../../../../../../../content/base/persons/rust-kite.json)：「背面」S 級野魂「鏽鳶」，愛自己選名字、恨拍賣鈴與所有權，用挑釁鬥嘴試探搭檔，遇棄友命令便暴怒抓緊操縱權；野魂樹、無古代機認主；代表台詞：「叫我搭檔，別叫我資產。敢把他留在潮裡，我先跟你翻臉。」

### 人物效果 24 件

- [content/base/effects/ax-trait-borrowed-ages.json](../../../../../../../../content/base/effects/ax-trait-borrowed-ages.json)：殼訊借來的前任記憶：決心 +8、先攻 −1，仍非已認主。
- [content/base/effects/ax-trait-broken-leash.json](../../../../../../../../content/base/effects/ax-trait-broken-leash.json)：不接受馴服的人：操控 +6、命中 −3。
- [content/base/effects/ax-trait-last-rites.json](../../../../../../../../content/base/effects/ax-trait-last-rites.json)：不肯把死者當貨物：決心 +5、感知 +1、先攻 −1。
- [content/base/effects/ax-trait-second-birth.json](../../../../../../../../content/base/effects/ax-trait-second-birth.json)：把逃離父命當作重生：閃避 +3、決心 −4。
- [content/base/effects/ax-trait-storm-temper.json](../../../../../../../../content/base/effects/ax-trait-storm-temper.json)：暴烈護短：先攻 +1、命中 +3、操控 −4。
- [content/base/effects/ax-trait-salt-mourning.json](../../../../../../../../content/base/effects/ax-trait-salt-mourning.json)：以悼亡支撐護親執念：決心 +7、閃避 −2。
- [content/base/effects/ax-trait-fate-cheater.json](../../../../../../../../content/base/effects/ax-trait-fate-cheater.json)：靠出其不意活下來：閃避 +3、先攻 +1、決心 −5。
- [content/base/effects/ax-trait-oathbound.json](../../../../../../../../content/base/effects/ax-trait-oathbound.json)：守誓而不知退讓：決心 +6、操控 +2、閃避 −2。
- [content/base/effects/ax-trait-watchful.json](../../../../../../../../content/base/effects/ax-trait-watchful.json)：清點每個回港者：感知 +2、命中 −2。
- [content/base/effects/ax-trait-water-shy.json](../../../../../../../../content/base/effects/ax-trait-water-shy.json)：機魂怕水而習慣預留退路；以閃避 +2、決心 −4 表達，不假造地形觸發。
- [content/base/effects/ax-trait-grudge-ledger.json](../../../../../../../../content/base/effects/ax-trait-grudge-ledger.json)：機魂記仇性格：命中 +4、操控 −3。
- [content/base/effects/ax-trait-names-before-orders.json](../../../../../../../../content/base/effects/ax-trait-names-before-orders.json)：守護型機魂先記住乘員：決心 +5、先攻 −1。
- [content/base/effects/ax-trait-empty-cockpit.json](../../../../../../../../content/base/effects/ax-trait-empty-cockpit.json)：獨駕機魂保留失去的搭檔習慣：操控 +4、決心 −3。
- [content/base/effects/ax-trait-unowned.json](../../../../../../../../content/base/effects/ax-trait-unowned.json)：野魂拒絕被登錄為資產：操控 +6、命中 −4。
- [content/base/effects/ax-bg-ruin-cartographer.json](../../../../../../../../content/base/effects/ax-bg-ruin-cartographer.json)：殼學會或遺跡工地的抄圖背景：感知 +1、命中 −2。
- [content/base/effects/ax-bg-ferry-debtor.json](../../../../../../../../content/base/effects/ax-bg-ferry-debtor.json)：塞勒涅地月渡輪的債務出身：決心 +3、閃避 −1。
- [content/base/effects/ax-bg-siege-rigger.json](../../../../../../../../content/base/effects/ax-bg-siege-rigger.json)：圍城補天匠：城邦修補巨殼的工匠背景，操控 +3、先攻 −1。
- [content/base/effects/ax-bg-tide-refugee.json](../../../../../../../../content/base/effects/ax-bg-tide-refugee.json)：蝕線難民的逃生經驗：閃避 +2、命中 −2。
- [content/base/effects/ax-injury-shell-migraine.json](../../../../../../../../content/base/effects/ax-injury-shell-migraine.json)：暫時殼訊後遺症，休養 3 日；感知 −2、決心 −4。
- [content/base/effects/ax-injury-tendon-strain.json](../../../../../../../../content/base/effects/ax-injury-tendon-strain.json)：牽魂筋裂：暫時操縱腱傷，休養 4 日；操控 −6、命中 −3。
- [content/base/effects/ax-injury-brine-cough.json](../../../../../../../../content/base/effects/ax-injury-brine-cough.json)：暫時鹹水吸入傷，休養 5 日；疲勞容量 −10、決心 −3。
- [content/base/effects/ax-injury-phantom-limb.json](../../../../../../../../content/base/effects/ax-injury-phantom-limb.json)：永久缺肢痛：操控 −5、閃避 −2。
- [content/base/effects/ax-injury-tinnitus.json](../../../../../../../../content/base/effects/ax-injury-tinnitus.json)：永久耳鳴：感知 −2。
- [content/base/effects/ax-injury-scarred-lung.json](../../../../../../../../content/base/effects/ax-injury-scarred-lung.json)：永久肺部瘢痕：疲勞容量 −15。

### 機魂 perk 12 件

- [content/base/effects/ax-perk-sentinel-1.json](../../../../../../../../content/base/effects/ax-perk-sentinel-1.json)：心・逐名點燈：守護前先確認乘員仍在。
- [content/base/effects/ax-perk-sentinel-2.json](../../../../../../../../content/base/effects/ax-perk-sentinel-2.json)：心・共握操縱桿：協作訓練提高操控。
- [content/base/effects/ax-perk-sentinel-3.json](../../../../../../../../content/base/effects/ax-perk-sentinel-3.json)：心・最後一個回港：守住撤離隊伍末端。
- [content/base/effects/ax-perk-hunter-1.json](../../../../../../../../content/base/effects/ax-perk-hunter-1.json)：算・星燼落處：從星燼的落處預見下一次命中，命中 +4。
- [content/base/effects/ax-perk-hunter-2.json](../../../../../../../../content/base/effects/ax-perk-hunter-2.json)：算・半拍之前：提前讀出目標動線。
- [content/base/effects/ax-perk-hunter-3.json](../../../../../../../../content/base/effects/ax-perk-hunter-3.json)：算・獵星織網：以記仇的星圖收攏獵物，命中 +4、算力容量 +10。
- [content/base/effects/ax-perk-solo-1.json](../../../../../../../../content/base/effects/ax-perk-solo-1.json)：手・無人王座：空座上的機魂學會自掌命途，操控 +4。
- [content/base/effects/ax-perk-solo-2.json](../../../../../../../../content/base/effects/ax-perk-solo-2.json)：手・自問自答：自主核對感測與運算。
- [content/base/effects/ax-perk-solo-3.json](../../../../../../../../content/base/effects/ax-perk-solo-3.json)：手・自己簽返航單：獨自承擔返航決策。
- [content/base/effects/ax-perk-feral-1.json](../../../../../../../../content/base/effects/ax-perk-feral-1.json)：野・拆掉名牌：抗拒所有權，強化控制爭奪而犧牲瞄準。
- [content/base/effects/ax-perk-feral-2.json](../../../../../../../../content/base/effects/ax-perk-feral-2.json)：野・把不寫進指令：保留拒命與自主判斷餘裕。
- [content/base/effects/ax-perk-feral-3.json](../../../../../../../../content/base/effects/ax-perk-feral-3.json)：野・我的手不鬆開：爭奪指令權的執念；不使用 setControl。

### 機魂樹 4 棵

- [content/base/soultrees/ax-sentinel.json](../../../../../../../../content/base/soultrees/ax-sentinel.json)：守燈人：四節點，主向 heart，末節點沿用 heart-1。
- [content/base/soultrees/ax-hunter.json](../../../../../../../../content/base/soultrees/ax-hunter.json)：逐星獵手：四節點，以 calc 開啟預見、記仇與獵星，末節點沿用 perk-soul-calc-2。
- [content/base/soultrees/ax-solo.json](../../../../../../../../content/base/soultrees/ax-solo.json)：空座船長：四節點，末節點含 autonomy 科研以解鎖獨駕，末節點沿用 hand-1。
- [content/base/soultrees/ax-feral.json](../../../../../../../../content/base/soultrees/ax-feral.json)：無主之手：四節點，末節點含 autonomy 科研以解鎖獨駕，末節點沿用 heart-1。

### 交接文件

- [wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-c/REPORT.md](REPORT.md)：本線 70 件內容的定位、12 人共鳴對照及固定四條驗收證據。

## 沒做到或證據不足的

無未完成的指定交付。背景、代表台詞與好惡寫在本 REPORT；PersonDef 沒有對話／背景欄，本線沒有越界擴充 schema 或實作對話系統。S 級以指定的 `soul-grade:S` tag 表示，並非新增人物 grade 欄位。

六件傷勢是可載入的內容定義，沒有接入禁止修改的 `rules/injuries.json` 抽取表；三件暫時傷用 days（3／4／5 日）、三件永久傷用 permanent。solo／feral 的 autonomy 是可研究解鎖節點，未宣稱新機魂已預先解鎖獨駕；成長照既有引擎處理。

依交接書未執行 `npm test`，也沒有加跑其他驗收。未 commit，交由領導整合。

## 需要決定的事

無。本線交付可依上述四條收件；其他線仍在共用目錄工作，整體整合狀態由領導掌握。

以後交接書該點名的工具：無。

# 怪獸擴充計畫（提案）

cx-kj2-plan｜2026-10-26｜24 種、6 批；只規劃，不改 content。識別碼與檔名在本計畫凍結；所有新中文名、英文名、部位名、能力名、效果名、二名、地點名與觀察紀錄均屬「提案」。每種單一 gradeRange，不用等級替身體增血。

## 1. 已讀清單

下列先讀由本線親自讀取，沒有委託摘要。路徑相對 repo 根。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/polish.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/planning/specs/world/monsters.md`
- `wf/workflows/planning/specs/world/rifts-and-territory.md`
- `wf/workflows/planning/specs/world/resistance.md`
- `wf/workflows/planning/design-notes/world/great-tide.md`
- `wf/workflows/planning/design-notes/world/scale.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/REPORT.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md`
- `content/lore/factions/rift-beasts.json`

另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`；以指定工具查 `templates.json`、`numeric-bands.json`、`ability-forms.json`、`engine-facts.json`、world `monsters.json`、`history-timeline.json`。已列出既有 species／monsters／bodyplans／abilities／effects／aiprofiles／frames，讀完全部 16 個 AI profile，逐種核對部位與能力。

引擎查證另先讀 `common/conventions.md`、`common/code-map.md`、`dev-env.md`，再查 `src/rules/{movement,flow,layers,effects,turn}.ts` 與 sentinel policy；用來辨識舊摘要，不更動程式。抵抗性依 lead-resist 與現行 world resistance：低一級減半，凡鐵只刮 outer，不能照 EF-16 舊說整體乘一成。

## 2. 盤點

實查 20 species、32 monsters。下列一行一種；HP 為總層 HP。生態若未有明確地域，寫一般蝕域，不替舊種補新設定。能力寫形態，空中／地下字樣不宣稱特殊移動權。


- 菌床 `species/bed`｜mycelium A｜bodyplan/mycel-bed，HP1800｜aiprofile/kx-mycel-creep｜五結各360、全滅才死、無organ；ball＋self孢囊；淡水菌海／蝕錨。

- 礁背 `species/breaksurf`｜beast D｜bodyplan/quadruped-breaksurf，HP180｜aiprofile/pack-hunter｜四部位、薄甲、腹心exposure0.5；unit＋近ball；海岸礁灘。

- 抱樁 `species/breakwater-clinger`｜alien C｜bodyplan/alien-breakwater-clinger，HP420｜aiprofile/kx-alien-stalker｜五部位、左甲裸右、偏核0.5；unit撕＋減益；港口防波堤。

- 盾甲 `species/bulwark`｜beast B｜bodyplan/quadruped-bulwark，HP950｜aiprofile/kx-beast-alpha｜四部位、前牆雙甲360、藏核0.5；self防護＋unit衝咬；深蝕推進。

- 群喉 `species/choir`｜alien A｜bodyplan/alien-choir，HP1800｜aiprofile/nest-anchor｜七部位五核、核暴露0.5–2；ball減益＋self增益＋unit；異形群喉例外錨。

- 崖牙 `species/cliffjaw`｜beast A｜bodyplan/quadruped-cliffjaw，HP1900｜aiprofile/kx-beast-alpha｜六部位、舊蛻500、顎後核0.5；unit咬／友增＋ball；獸群與核區。

- 掘犬 `species/hound`｜beast C｜bodyplan/quadruped-hound，HP420｜aiprofile/pack-hunter｜六部位、鏟足兼武器、胸核1；unit近遠＋self增益；遊獵／刨地形態。

- 弔燈蜂 `species/lancewing`｜insect C/B｜bodyplan/insect-lancewing，HP420｜aiprofile/reaper-vanguard｜六部位、翼各50、腹核2；unit刺／俯衝／友增；空中形態。

- 鏡肢 `species/mirror`｜alien B/A｜bodyplan/alien-mirror，HP950｜aiprofile/kx-alien-stalker｜五部位、單側鏡甲300、裸側200、核0.5；self護＋unit撕；深蝕獨行。

- 蝕蟲 `species/mite`｜insect D｜bodyplan/insect-mite，HP60｜aiprofile/swarm-mite｜三部位、薄甲、腹核1；unit咬；淺蝕子群。

- 巢母 `species/nestmother`｜insect C/B/A｜bodyplan/insect-nestmother，HP1580｜aiprofile/nest-anchor｜八部位、三囊口、腹核1；self生D蝕蟲＋unit減益；裂縫巢核。

- 孢囊 `species/pod`｜mycelium D｜bodyplan/mycel-pod，HP70｜aiprofile/kx-mycel-creep｜單結無organ；近ball掛減益；淡水菌毯。

- 鐮肢 `species/reaper`｜insect C｜bodyplan/insect-reaper，HP425｜aiprofile/reaper-vanguard｜六部位、雙鐮、胸核1；兩種unit射程；淺蝕先鋒。

- 腐衛 `species/rotwarden`｜mycelium B/A｜bodyplan/mycel-rotwarden，HP1000｜aiprofile/kx-mycel-creep｜四部位、殘甲＋再生肉、無organ；unit孢負荷＋self護；菌海殘骸。

- 浮囊 `species/sac`｜alien D｜bodyplan/alien-sac，HP110｜aiprofile/kx-alien-stalker｜四部位、無甲、囊核2；unit鞭／標記；淺蝕漂浮形態。

- 叩闕甲 `species/siegebeetle`｜insect B/A｜bodyplan/insect-siegebeetle，HP1400｜aiprofile/reaper-vanguard｜六部位、背500、腹核0.5；unit角撞＋self護＋ball；深蝕攻堅。

- 吐棘者 `species/spitter`｜alien C｜bodyplan/alien-spitter，HP380｜aiprofile/kx-alien-stalker｜五部位、可破棘冠、囊底核0.5；ball＋unit遠射；高處深蝕邊緣。

- 菌柱 `species/stalk`｜mycelium C/B｜bodyplan/mycel-stalk，HP450｜aiprofile/kx-mycel-creep｜三部位、再生表皮、無organ；unit減益＋ball；淡水深蝕菌毯。

- 潮脊 `species/tidespine`｜beast S｜bodyplan/quadruped-tidespine，HP4000｜aiprofile/kx-beast-alpha｜六部位、脊三甲1200、藏核0.5；ball＋unit掃／友增；吉大港海灣S例外，本線不動。

- 潮狼 `species/tidewolf`｜beast D/C/B｜bodyplan/quadruped-beast，HP180｜aiprofile/pack-hunter｜五部位、裸核80、四肢各25；unit咬／撲；一般蝕域遊獵。


### 族×等級（既有）

| 族 | D | C | B | A |
|---|---|---|---|---|
|insect|蝕蟲|弔燈蜂、巢母、鐮肢|弔燈蜂、巢母、叩闕甲|巢母、叩闕甲|
|beast|礁背、潮狼|掘犬、潮狼|盾甲、潮狼|崖牙|
|alien|浮囊|抱樁、吐棘者|鏡肢|群喉、鏡肢|
|mycelium|孢囊|菌柱|腐衛、菌柱|菌床、腐衛|

潮脊 S 列於盤點，不進本次 D–A 覆蓋統計。

### 生態位（既有）

「一般」只表示族來源，不當作已具玩法專種；空格為缺。

| 生態位 | insect | beast | alien | mycelium |
|---|---|---|---|---|
|海岸|一般來處|礁背|一般來處|不適用|
|港口|一般來處|潮脊（S）|抱樁|不適用|
|河口|巢母（萊茵捕獲）|一般上溯|抱樁近岸|只限淡水段|
|深海|缺|潮脊僅海灣S，非深海專種|缺|不適用|
|空中形態|弔燈蜂|缺|浮囊|不適用|
|淡水／內陸|罕見上溯，不作常態|腐衛記錄不代表獸族常態|缺|孢囊、菌柱、菌床、腐衛|
|地下形態|巢母根系／巢道，無專種|掘犬刨地，無穿牆|缺|菌床地下毯|
|高處射擊|缺|缺|吐棘者|菌柱有遠射但非高處專種|

玩法現況：潮狼 D/C/B、弔燈蜂 C/B、菌柱 C/B、鏡肢 B/A、腐衛 B/A、叩闕甲 B/A、巢母 C/B/A 都共用 species 身體與招式；等級差主要落在屬性與抵抗性，沒有逐級的新戰術題。鐮肢、掘犬、潮狼不少招式都是不同射程的 unit 攻擊；弔燈蜂也沒有完整空戰。異形多共用 stalker profile，菌絲幾乎共用 sentinel。新設計不能只再加一隻短射程近戰獸。舊菌柱／腐衛留有可捕 frame，屬既有不一致，本線新菌絲一律 harvest-only，不複製此例。

## 3. 設計理念

玩家先看到部位與站位，才看到名字：新的獸必須改變先打哪裡、站在哪裡、何時出手。射程死角、窄線與扇面分別考驗貼近、橫移與散開。單核藏深、雙核不對稱、三核高低與五結遞弱，讓擊殺順序有不同理由。破武器部位用已支援的 onBroken 改命中或 AP，不憑描述許諾自動停招。母體鏈從 B 產 D 到 A 產 C，增加場上選擇而不把等級說成年齡。海邊出精粹、內陸出糧的路線讓每種獸都有常遇到牠的人。數值留在同級暫值，差異主要來自結構、招式形態與節奏。

## 4. 缺口矩陣

### 族×等級：既有數→填入→完成數

|族|D|C|B|A|
|---|---|---|---|---|
|insect|缺一：1＋鹽針、砂扇＝3|已足：3＋燈腹、扣甲＝5|已足：3＋泥母、矢櫛＝5|已足：2＋閘母、鐘蠹＝4|
|beast|已足：2＋濺蹄、伏耳＝4|已足：2＋沫顎、岔鰭＝4|已足：2＋棧背、淵顎＝4|缺一：1＋礁角、青鬣＝3|
|alien|缺一：1＋曲針＝2|已足：2＋空帆＝3|缺一：1＋雙影＝2|已足：2＋垂幕＝3|
|mycelium|缺一：1＋燈苔＝2|缺一：1＋蘆網＝2|已足：2＋拱根＝3|已足：2＋沉林＝3|


四族 D/C/B/A 每格均達至少兩種，不用菌絲例外。新添為蟲8、獸8、異形4、菌絲4；全體兼有群體與單體／單片的戰術題。

### 生態位：缺口→填入

|生態位|insect|beast|alien|mycelium|
|---|---|---|---|---|
|海岸|缺低階射線／扇面→鹽針、砂扇、矢櫛|濺蹄、伏耳、礁角|曲針、雙影|不開鹽水菌種|
|港口|燈腹、扣甲、閘母|沫顎、棧背、青鬣|空帆、垂幕|不適用|
|河口|泥母、閘母、鹽針|沫顎、岔鰭|雙影|蘆網僅淡水河岸|
|深海來源|留白|缺專種→淵顎（只岸戰）|缺專種→垂幕（只岸戰）|不適用|
|空中形態|缺護群→燈腹|留白|缺游移遠射→空帆|不適用|
|淡水／內陸|不添常態內陸種|不添常態內陸種|不添常態內陸種|燈苔、蘆網、拱根、沉林|
|地下形態|泥母、鐘蠹（近海涵洞／崖洞）|留白|留白|拱根（淡水橋底）|
|高處射擊|矢櫛|伏耳（岸石）|曲針|拱根只遠射|

巢母系升級鏈＝遭遇難度鏈：B 泥母→D 鹽針；A 閘母→C 燈腹。四者皆在 kj2-01，母體和子體沒有成長轉換。B／A 母體只有在足夠寬度裂縫與深度出現；新種不自動奪走既有 rift.anchor。spawner 的 max/cadence 同時寫明，但戰鬥生子實際由能力 cooldown／usesPerBattle 限次；不能只填行為欄期待自行出生。

## 5. 新物種表

完整 24 列已抽到 [roster.json](roster.json)，是本節唯一的物種明細，依 batch 查讀；不在 Markdown 複製同一張長表。每列固定 id、英文原名與意涵、兩個中文候選、四族、單一等級、棲位、群／單體、定位、設定掛點、身體與數值、AI 參數、1–3 招、效果、monster 與批次。`bodyplan` 巢狀欄包含部位／層、總 HP、各級屬性、pools、onBroken、capture、behaviors，並非遊戲原始 JSON。

### 給產出工人的共通展開規則

層簡記 c/f/o 分別是 chitin/flesh/organ，數字就是該層 HP，斜線按外→內。每部位只有最後一層 structural=true；所有層 ablative=true、passThrough={}，未指明 regen 一律無再生；未列 resist 的型別明填 0。層抗性不等於跨級精粹抵抗性。部位 exposure 只是被選中的權重；藏核不是必須先打破其他部位，也沒有左右朝向規則。可捕族每個 core 都有 cockpit function、restraint(size2)與cockpit(size1)槽，以及 accepts:[pilot] 的 pilot 座；多核可以只裝一個座位，但預留槽不省。

species 的 ap 為 hard、非 inverted、min0；instinct 為 inverted、min0，獸族 soft，其餘 hard，bands=[]。池初值／回復／上限全列在每筆身體欄；本能漲幅是既有資源差異，不新增本能門檻規則。生物 frame 等級與該種唯一 monster 相同、同bodyplan、pools只保留該種instinct、innateAbilities相同、burden D2/C5/B8/A12；corpse無instinct、burden0、同bodyplan且無肉層regen。新可捕族共20種，各一對活體／屍體frame。species與bio frame的tags含kaiju及family；corpse沿範本不帶kaiju。AP部位後果作用於野生本體池，捕獲後不宣稱會同步扣駕駛的人物AP。

四種菌絲沒有organ，core只是毀盡才死的結；不寫locomotion，固定在地面。tags 含 mycelium、kaiju、harvest-only；capture requireIntact=[core] 與 requireBroken=[core] 互斥，ability/restrain、frame/bio-bed 為既有 harvest-only 引用，捕捉永不成立；不產出菌絲frame或駕駛座，不把採菌寫成可駕駛。

所有能力 mode=activated、produces=[]、require=[]；costs AP owner=person，沿現有怪獸無駕駛的AP回退規則。self 的 friendly=only、los=false；其他預設los=true、friendly=no，友方ball例外friendly=only。範圍的傷害數是每目標，line／cone沿現有形態，ball半徑列在表中；沒有位移、擊退、跨水等隱藏副作用。未列accuracy加值為0，armorPen=0，不擅加穿甲。基本 attack／attackArea權重1；buff/protect/debuff/disable/escape按列中鍵1。onBroken 的短名展開成同物種effect/kx-<物種>-<短名>；有名字的武器部位損毀只造成所列效果，不假稱內建招式被移除。新effect scope一律mech，badge已列，未列hook空、未列stack=refresh。

本能、攻擊與展示配置照同級暫填，不在這條線做對戰平衡；A展示用A級隊伍，不能拿C級打A級的抵抗性減傷當新獸數值錯誤。

### 方法與禁忌（交接書原樣轉錄）

- 每種掛到設定：節點／主線（F 線蝕線＝海岸線等）／年表／崩年底色句（1.1–1.13）／既有生態設定（四族、裂縫寬度、大潮）；寫明牠在世界裡為什麼存在、平常在哪裡被看見、誰最常遇到牠。
- 怪獸多從海洋來、環太平洋為主、內陸少；菌絲沿淡水、不靠海；潮汐只是關聯，**不用潮差、潮高推凶度**。
- **對面無臉**：怪獸沒有人格化的指揮者、不談、不怕；怪獸不是畜牲（不寫餵、馴、乖、飼料、獸欄、寵物）。
- 等級不是成長階段（B 不是 C 長成的）；不同級要不同血量就不同 species＋bodyplan。
- **A 級以上才有 `name`＋`epithet`（二名）**，tags 加 `named`；B 以下不寫。S 級不新增（萬潮葬王與既有 S 不動）；SS／SSS 不做。四族框架照舊；第五族不開（可以有「異形」裡的新形態）。
- 數值**照同級暫填，不做平衡**（使用者：後期再調）：HP、屬性、傷害、AP 照 `bio-monsters.md` 與 numeric-bands 帶，同級對照既有檔。
- 不新增 registries 值；不寫 `territorial`、`molt`、`partsOverride`、`attrMods`、`extraAbilities`。
- 不拿其他作品類比（含設計理念段）；**中文命名避免直譯**（兩步命名：先想英文原名與意涵，再取中文；避「～者」字尾、避撞既有詞義，例：纏足）；潮→蝕（世界觀詞）；物種名二到三字為主（潮狼、掘犬、鏡肢、群喉、抱樁、礁背）；招式名寫動作與畫面，不寫生物學名詞。所有新名詞標「提案」。
- 不碰萬潮葬王（`monster/tidespine-chittagong`、`species/tidespine`）；桑托斯灣區核心留白。

## 6. 二名個體

共6隻，全掛新A種。第5節每種的唯一 `monster/<物種>-a` 本身就是此二名個體，不另建無名A或同種第二隻，總monster檔仍是24。下面的俗名寫入name、二名寫入epithet，tags含named、kaiju與族。其他18隻monster完全省略name／epithet（species／能力本身的顯示name不在此禁令）。


**`monster/sluice-mother-a`**：俗名「八打雁閘下那隻」、二名「閉港千扉」（皆提案），八打雁外閘。曾堵住舊閘三次卸貨；腹上囊閘像千扇門，現仍留在外渠。 掛點：八打雁通海閘渠；海洋來獸與蟲繫；F／底色1.4、1.6；承2101蝕線協定的守港分工（非新增節點原因）。常由井工護送隊與港防民兵遇見。 二名得名觀察暫列2104，不抬成主線節點。


**`monster/bell-borer-a`**：俗名「仙台崖下那隻」、二名「碎燈鳴塚」（皆提案），仙台外港崖洞。胸鐘響過後崖燈全碎；民兵守住內港，外崖留下一座會鳴的甲丘。 掛點：仙台外側舊港與濱岸崖；F、C／底色1.1、1.2、1.5；承2101堅盾普及與蝕線協定，舊廠已退在牆外。常由輪守駕駛與拖機工遇見。 二名得名觀察暫列2105，不抬成主線節點。


**`monster/reef-antler-a`**：俗名「西雅圖白角」、二名「折桅白冠」（皆提案），西雅圖外側舊泊位。掃斷舊泊位的空桅，白角掛滿斷索；守軍拆開陣線保住接糧碼頭。 掛點：西雅圖接糧港外岸；F、G／底色1.4、1.6、1.8；承2101蝕線協定的沿海縮守，丹佛供糧與回運精粹並行。常由貨場守軍與糧車護送隊遇見。 二名得名觀察暫列2106，不抬成主線節點。


**`monster/storm-mane-a`**：俗名「外港青鬣」、二名「斷纜青鬣」（皆提案），瓦爾帕萊索外港。長鬣掃斷拖機纜；工班接續內側纜路完成拖救，外階此後留白。 掛點：瓦爾帕萊索外港石階與通海礁溝；F／底色1.4、1.5、1.11；承2102商路約後的備件護送，不改智利國屬港守住。常由智利民兵與基多備件貨隊遇見。 二名得名觀察暫列2107，不抬成主線節點。


**`monster/dusk-fold-a`**：俗名「奧克蘭那張幕」、二名「掩舟暮帷」（皆提案），奧克蘭外港空泊位。罩住撤空的舊船，三處亮核像幕上漏光；巡守退到仍有人卸貨的內泊。 掛點：奧克蘭外港空泊位；異形經寒潮裂縫隨冰北漂的既有生態；F／底色1.5、1.8；承2106無人應答記錄的地方警示，不替該二名增寫戰果。常由海岸巡守與回收工遇見。 二名得名觀察暫列2107，不抬成主線節點。


**`monster/drowned-grove-a`**：俗名「白林」、二名「斷橋骸林」（皆提案），五湖菌海南緣支流舊橋。白結撐斷空橋，採菌隊另繫回程索；新路繞過五簇沒有精粹核的白枝。 掛點：五湖菌海淡水支流與舊橋；菌絲淡水例外；F／底色1.4、1.5、1.8；承2101-08-15借火催曉之後的採菌回程警示，不更改白夜2100首燒。常由採菌隊與冬季河岸學者遇見。 二名得名觀察暫列2107，不抬成主線節點。


西雅圖「折桅白冠」與瓦爾帕萊索「斷纜青鬣」可供基調修正線採用；只提供來獸及守住／拖救的地方畫面，不改現有兩座港口檔。

## 7. lore 計畫

共6個新place檔，每檔4種；各隨同批產出。每檔沿既有地點的格式，region／continent／world=earth、kind=其他、aka可空；用gameRefs逐一指向該批4個species與4個monster。既有父地點只在本文引用，不修改父檔，也不新增未登記的lore欄位。body寫300–1500字，先述海岸或淡水現場、接著誰遭遇，再寫守路／避讓的具體做法。下列年表全部是提案，由領導另案只插入timeline，不含在工人檔案數；place沒有event欄，不捏造event id。


**`place/batangas-outer-sluices`（八打雁外閘（提案））**｜類型place／亞洲／八打雁通海閘渠，新檔 `content/lore/places/batangas-outer-sluices.json`。涵蓋鹽針、燈腹、泥母、閘母。掛點 `place/batangas`，八打雁通海閘渠；海洋來獸與蟲繫；F／底色1.4、1.6；承2101蝕線協定的守港分工（非新增節點原因）。常由井工護送隊與港防民兵遇見。 年表建議 2103，標題「八打雁外閘辨形記」（提案）：外閘巡路辨出四種蟲形；井工護送改走兩班錯開的路。 era/tide-line，tags=[monster]，不填event。


**`place/sendai-bell-cliff`（仙台鳴崖（提案））**｜類型place／亞洲／仙台外港崖洞，新檔 `content/lore/places/sendai-bell-cliff.json`。涵蓋砂扇、扣甲、矢櫛、鐘蠹。掛點 `place/sendai-wall`，仙台外側舊港與濱岸崖；F、C／底色1.1、1.2、1.5；承2101堅盾普及與蝕線協定，舊廠已退在牆外。常由輪守駕駛與拖機工遇見。 年表建議 2105，標題「仙台鳴崖辨形記」（提案）：外崖燈碎後，守備把點射棘架與甲片護群分開記入輪守圖。 era/tide-line，tags=[monster]，不填event。


**`place/seattle-outer-grain-quay`（西雅圖外糧埠（提案））**｜類型place／北美／西雅圖接糧港外側，新檔 `content/lore/places/seattle-outer-grain-quay.json`。涵蓋濺蹄、沫顎、棧背、礁角。掛點 `place/seattle`，西雅圖接糧港外岸；F、G／底色1.4、1.6、1.8；承2101蝕線協定的沿海縮守，丹佛供糧與回運精粹並行。常由貨場守軍與糧車護送隊遇見。 年表建議 2106，標題「西雅圖外糧埠辨形記」（提案）：白角折桅之後，守軍拆開陣線，接糧碼頭仍完成那一夜卸貨。 era/league，tags=[monster]，不填event。


**`place/valparaiso-outer-steps`（瓦港外階（提案））**｜類型place／南美／瓦爾帕萊索外港石階，新檔 `content/lore/places/valparaiso-outer-steps.json`。涵蓋伏耳、岔鰭、淵顎、青鬣。掛點 `place/valparaiso`，瓦爾帕萊索外港石階與通海礁溝；F／底色1.4、1.5、1.11；承2102商路約後的備件護送，不改智利國屬港守住。常由智利民兵與基多備件貨隊遇見。 年表建議 2107，標題「瓦港外階辨形記」（提案）：拖機纜斷，修造工沿內側續纜；外岸四種獸形留在下一班警示圖。 era/league，tags=[monster]，不填event。


**`place/auckland-empty-berths`（奧克蘭空泊（提案））**｜類型place／大洋洲／奧克蘭外港空泊位，新檔 `content/lore/places/auckland-empty-berths.json`。涵蓋曲針、空帆、雙影、垂幕。掛點 `place/auckland`，奧克蘭外港空泊位；異形經寒潮裂縫隨冰北漂的既有生態；F／底色1.5、1.8；承2106無人應答記錄的地方警示，不替該二名增寫戰果。常由海岸巡守與回收工遇見。 年表建議 2107，標題「奧克蘭空泊辨形記」（提案）：巡守記下三核垂幕與露核空帆的差別，仍有人使用的內泊繼續開門。 era/league，tags=[monster]，不填event。


**`place/five-lakes-white-ford`（五湖白汊（提案））**｜類型place／北美／五湖菌海南緣淡水支流，新檔 `content/lore/places/five-lakes-white-ford.json`。涵蓋燈苔、蘆網、拱根、沉林。掛點 `place/great-lakes-mycelium`，五湖菌海淡水支流與舊橋；菌絲淡水例外；F／底色1.4、1.5、1.8；承2101-08-15借火催曉之後的採菌回程警示，不更改白夜2100首燒。常由採菌隊與冬季河岸學者遇見。 年表建議 2107，標題「五湖白汊辨形記」（提案）：舊橋斷後採菌隊另繫回程索，燒季圖開始區分單結與多結。 era/league，tags=[monster]，不填event。


上述日期只定這份新觀察筆記，不宣稱物種首次誕生、裂縫首開或必然大潮；二名敘事的日期以第6節為準，同一place容納較早的見聞。既有年表條目、rift-beasts.json、萬潮葬王資料、桑托斯灣區核心全部保持原狀。

## 8. 營運接入（領導執行，本線只建議）

各新monster進同族現有 `content/base/world/rifts/<family>.json` 的monsters；具體如下。A不替換anchor，不把異形新種當錨。D/C是否進vanguard分列；加入monsters不等於已獲地域約束，目前名單只能按族／級取獸，未具備逐物種生態位篩選。若尚未有棲位過濾，先用展示情境，領導可暫緩全域名單，尤其深海來源與港口二名。


**`content/base/world/rifts/insect.json`**：monsters建議追加 `monster/brinepin-d`; `monster/lantern-keel-c`; `monster/silt-mother-b`; `monster/sluice-mother-a`; `monster/grit-fan-d`; `monster/hinge-crab-c`; `monster/needle-rack-b`; `monster/bell-borer-a`。


vanguard建議加 `species/brinepin`、`species/grit-fan`、`species/hinge-crab`。暫不加燈腹：燈腹留給新A母體的子體亮相。其餘B/A全部不進vanguard。


**`content/base/world/rifts/beast.json`**：monsters建議追加 `monster/surf-runner-d`; `monster/foam-jaw-c`; `monster/shelf-back-b`; `monster/reef-antler-a`; `monster/shell-ear-d`; `monster/split-fin-c`; `monster/trench-maw-b`; `monster/storm-mane-a`。


vanguard建議加 `species/surf-runner`、`species/foam-jaw`、`species/split-fin`。暫不加伏耳：伏耳偏定點岸石，先靠情境展示。其餘B/A全部不進vanguard。


**`content/base/world/rifts/alien.json`**：monsters建議追加 `monster/bent-needle-d`; `monster/hollow-sail-c`; `monster/paired-wake-b`; `monster/dusk-fold-a`。


vanguard建議加 `species/bent-needle`、`species/hollow-sail`。其餘B/A全部不進vanguard。


**`content/base/world/rifts/mycelium.json`**：monsters建議追加 `monster/wick-mat-d`; `monster/reed-lace-c`; `monster/vault-root-b`; `monster/drowned-grove-a`。


vanguard建議加 `species/wick-mat`、`species/reed-lace`。其餘B/A全部不進vanguard。


本次不新增world/encounters/rift-*：既有族×深度檔會從同族名單按grade預算抽取，換一個檔名不會得到水域或地域限制。蟲族現有檔實為insect-shallow.json／insect-deep.json，不誤稱都帶rift-前綴。核心遭遇目前主要使用固定anchor，新A母體與其他二名先由各批demo保證可載入；要讓它們成為一般營運可選錨，留第10節，不冒充只改monsters就完成。菌絲採收沿既有harvest-only流程，沒有新的可駕駛菌體市場。

## 9. 分批與完整檔案清單

6批各4種，均單族；每批完整清單包含base、lore與一個可選展示情境（本計畫選擇納入），全部低於45檔。下列左邊是完整repo相對產出路徑；右邊代號解析成後附唯一範本完整路徑，沒有glob或「其餘照做」的省略。範本只供結構，id／數值／層序以roster為準；不複製舊框架中的不一致。


### kj2-01：鹽針、燈腹、泥母、閘母（39檔）


```text
content/base/species/brinepin.json ← SI
content/base/bodyplans/insect-brinepin.json ← PI
content/base/frames/bio-brinepin.json ← FB
content/base/frames/corpse-brinepin.json ← FC
content/base/monsters/brinepin-d.json ← MD
content/base/abilities/kx-brinepin-prick.json ← AU
content/base/effects/kx-brinepin-blunted.json ← FX
content/base/species/lantern-keel.json ← SI
content/base/bodyplans/insect-lantern-keel.json ← PI
content/base/frames/bio-lantern-keel.json ← FB
content/base/frames/corpse-lantern-keel.json ← FC
content/base/monsters/lantern-keel-c.json ← MC
content/base/abilities/kx-lantern-keel-drip.json ← AU
content/base/abilities/kx-lantern-keel-gather.json ← AB
content/base/effects/kx-lantern-keel-screen.json ← FX
content/base/effects/kx-lantern-keel-dimmed.json ← FX
content/base/species/silt-mother.json ← SI
content/base/bodyplans/insect-silt-mother.json ← PI
content/base/frames/bio-silt-mother.json ← FB
content/base/frames/corpse-silt-mother.json ← FC
content/base/monsters/silt-mother-b.json ← MB
content/base/abilities/kx-silt-mother-spit.json ← AU
content/base/abilities/kx-silt-mother-brood.json ← AS
content/base/abilities/kx-silt-mother-sweep.json ← AA
content/base/effects/kx-silt-mother-brood.json ← FS
content/base/effects/kx-silt-mother-ruptured.json ← FX
content/base/species/sluice-mother.json ← SI
content/base/bodyplans/insect-sluice-mother.json ← PI
content/base/frames/bio-sluice-mother.json ← FB
content/base/frames/corpse-sluice-mother.json ← FC
content/base/monsters/sluice-mother-a.json ← MA
content/base/abilities/kx-sluice-mother-spit.json ← AU
content/base/abilities/kx-sluice-mother-brood.json ← AS
content/base/abilities/kx-sluice-mother-sweep.json ← AA
content/base/effects/kx-sluice-mother-brood.json ← FS
content/base/effects/kx-sluice-mother-shut.json ← FX
content/base/aiprofiles/kx-sluice-brood.json ← IN
content/lore/places/batangas-outer-sluices.json ← LP
content/base/scenarios/kj2-01-demo.json ← SC
```


展示 `scenario/kj2-01-demo`（名稱「八打雁外閘・辨形」提案）呈現本批四種各一隻。巢母B/A各留相鄰空格，初始兩種子體與後生子體分開；不將場上初始子體冒認成引擎已繫父母。


### kj2-02：砂扇、扣甲、矢櫛、鐘蠹（35檔）


```text
content/base/species/grit-fan.json ← SI
content/base/bodyplans/insect-grit-fan.json ← PI
content/base/frames/bio-grit-fan.json ← FB
content/base/frames/corpse-grit-fan.json ← FC
content/base/monsters/grit-fan-d.json ← MD
content/base/abilities/kx-grit-fan-scatter.json ← AA
content/base/species/hinge-crab.json ← SI
content/base/bodyplans/insect-hinge-crab.json ← PI
content/base/frames/bio-hinge-crab.json ← FB
content/base/frames/corpse-hinge-crab.json ← FC
content/base/monsters/hinge-crab-c.json ← MC
content/base/abilities/kx-hinge-crab-snap.json ← AU
content/base/abilities/kx-hinge-crab-shelter.json ← AB
content/base/effects/kx-hinge-crab-sheltered.json ← FX
content/base/species/needle-rack.json ← SI
content/base/bodyplans/insect-needle-rack.json ← PI
content/base/frames/bio-needle-rack.json ← FB
content/base/frames/corpse-needle-rack.json ← FC
content/base/monsters/needle-rack-b.json ← MB
content/base/abilities/kx-needle-rack-shot.json ← AU
content/base/abilities/kx-needle-rack-rake.json ← AA
content/base/effects/kx-needle-rack-shattered.json ← FX
content/base/species/bell-borer.json ← SI
content/base/bodyplans/insect-bell-borer.json ← PI
content/base/frames/bio-bell-borer.json ← FB
content/base/frames/corpse-bell-borer.json ← FC
content/base/monsters/bell-borer-a.json ← MA
content/base/abilities/kx-bell-borer-toll.json ← AU
content/base/abilities/kx-bell-borer-dust.json ← AA
content/base/abilities/kx-bell-borer-close.json ← AE
content/base/effects/kx-bell-borer-closed.json ← FX
content/base/effects/kx-bell-borer-cracked.json ← FX
content/base/aiprofiles/kx-bell-watch.json ← IP
content/lore/places/sendai-bell-cliff.json ← LP
content/base/scenarios/kj2-02-demo.json ← SC
```


展示 `scenario/kj2-02-demo`（名稱「仙台鳴崖・辨形」提案）呈現本批四種各一隻。


### kj2-03：濺蹄、沫顎、棧背、礁角（36檔）


```text
content/base/species/surf-runner.json ← SB
content/base/bodyplans/beast-surf-runner.json ← PB
content/base/frames/bio-surf-runner.json ← FB
content/base/frames/corpse-surf-runner.json ← FC
content/base/monsters/surf-runner-d.json ← MD
content/base/abilities/kx-surf-runner-kick.json ← AU
content/base/abilities/kx-surf-runner-skip.json ← AE
content/base/effects/kx-surf-runner-skipping.json ← FX
content/base/species/foam-jaw.json ← SB
content/base/bodyplans/beast-foam-jaw.json ← PB
content/base/frames/bio-foam-jaw.json ← FB
content/base/frames/corpse-foam-jaw.json ← FC
content/base/monsters/foam-jaw-c.json ← MC
content/base/abilities/kx-foam-jaw-bite.json ← AU
content/base/abilities/kx-foam-jaw-foam.json ← AA
content/base/effects/kx-foam-jaw-split.json ← FX
content/base/species/shelf-back.json ← SB
content/base/bodyplans/beast-shelf-back.json ← PB
content/base/frames/bio-shelf-back.json ← FB
content/base/frames/corpse-shelf-back.json ← FC
content/base/monsters/shelf-back-b.json ← MB
content/base/abilities/kx-shelf-back-shove.json ← AU
content/base/abilities/kx-shelf-back-shelter.json ← AB
content/base/effects/kx-shelf-back-sheltered.json ← FX
content/base/species/reef-antler.json ← SB
content/base/bodyplans/beast-reef-antler.json ← PB
content/base/frames/bio-reef-antler.json ← FB
content/base/frames/corpse-reef-antler.json ← FC
content/base/monsters/reef-antler-a.json ← MA
content/base/abilities/kx-reef-antler-rake.json ← AA
content/base/abilities/kx-reef-antler-gore.json ← AU
content/base/abilities/kx-reef-antler-brace.json ← AE
content/base/effects/kx-reef-antler-broken.json ← FX
content/base/aiprofiles/kx-reef-line.json ← IT
content/lore/places/seattle-outer-grain-quay.json ← LP
content/base/scenarios/kj2-03-demo.json ← SC
```


展示 `scenario/kj2-03-demo`（名稱「西雅圖外糧埠・辨形」提案）呈現本批四種各一隻。


### kj2-04：伏耳、岔鰭、淵顎、青鬣（37檔）


```text
content/base/species/shell-ear.json ← SB
content/base/bodyplans/beast-shell-ear.json ← PB
content/base/frames/bio-shell-ear.json ← FB
content/base/frames/corpse-shell-ear.json ← FC
content/base/monsters/shell-ear-d.json ← MD
content/base/abilities/kx-shell-ear-spit.json ← AU
content/base/abilities/kx-shell-ear-hush.json ← AU
content/base/effects/kx-shell-ear-dulled.json ← FX
content/base/effects/kx-shell-ear-deafened.json ← FX
content/base/species/split-fin.json ← SB
content/base/bodyplans/beast-split-fin.json ← PB
content/base/frames/bio-split-fin.json ← FB
content/base/frames/corpse-split-fin.json ← FC
content/base/monsters/split-fin-c.json ← MC
content/base/abilities/kx-split-fin-rush.json ← AU
content/base/abilities/kx-split-fin-swerve.json ← AE
content/base/effects/kx-split-fin-swerving.json ← FX
content/base/effects/kx-split-fin-torn.json ← FX
content/base/species/trench-maw.json ← SB
content/base/bodyplans/beast-trench-maw.json ← PB
content/base/frames/bio-trench-maw.json ← FB
content/base/frames/corpse-trench-maw.json ← FC
content/base/monsters/trench-maw-b.json ← MB
content/base/abilities/kx-trench-maw-bite.json ← AU
content/base/abilities/kx-trench-maw-breath.json ← AA
content/base/species/storm-mane.json ← SB
content/base/bodyplans/beast-storm-mane.json ← PB
content/base/frames/bio-storm-mane.json ← FB
content/base/frames/corpse-storm-mane.json ← FC
content/base/monsters/storm-mane-a.json ← MA
content/base/abilities/kx-storm-mane-bite.json ← AU
content/base/abilities/kx-storm-mane-lash.json ← AA
content/base/abilities/kx-storm-mane-rise.json ← AE
content/base/effects/kx-storm-mane-risen.json ← FX
content/base/effects/kx-storm-mane-sheared.json ← FX
content/lore/places/valparaiso-outer-steps.json ← LP
content/base/scenarios/kj2-04-demo.json ← SC
```


展示 `scenario/kj2-04-demo`（名稱「瓦港外階・辨形」提案）呈現本批四種各一隻。


### kj2-05：曲針、空帆、雙影、垂幕（34檔）


```text
content/base/species/bent-needle.json ← SA
content/base/bodyplans/alien-bent-needle.json ← PA
content/base/frames/bio-bent-needle.json ← FB
content/base/frames/corpse-bent-needle.json ← FC
content/base/monsters/bent-needle-d.json ← MD
content/base/abilities/kx-bent-needle-pick.json ← AU
content/base/species/hollow-sail.json ← SA
content/base/bodyplans/alien-hollow-sail.json ← PA
content/base/frames/bio-hollow-sail.json ← FB
content/base/frames/corpse-hollow-sail.json ← FC
content/base/monsters/hollow-sail-c.json ← MC
content/base/abilities/kx-hollow-sail-cast.json ← AU
content/base/abilities/kx-hollow-sail-fold.json ← AE
content/base/effects/kx-hollow-sail-folded.json ← FX
content/base/species/paired-wake.json ← SA
content/base/bodyplans/alien-paired-wake.json ← PA
content/base/frames/bio-paired-wake.json ← FB
content/base/frames/corpse-paired-wake.json ← FC
content/base/monsters/paired-wake-b.json ← MB
content/base/abilities/kx-paired-wake-rend.json ← AU
content/base/abilities/kx-paired-wake-cross.json ← AA
content/base/species/dusk-fold.json ← SA
content/base/bodyplans/alien-dusk-fold.json ← PA
content/base/frames/bio-dusk-fold.json ← FB
content/base/frames/corpse-dusk-fold.json ← FC
content/base/monsters/dusk-fold-a.json ← MA
content/base/abilities/kx-dusk-fold-rain.json ← AU
content/base/abilities/kx-dusk-fold-dim.json ← AA
content/base/abilities/kx-dusk-fold-withdraw.json ← AE
content/base/effects/kx-dusk-fold-dimmed.json ← FX
content/base/effects/kx-dusk-fold-veiled.json ← FX
content/base/aiprofiles/kx-dusk-drift.json ← IG
content/lore/places/auckland-empty-berths.json ← LP
content/base/scenarios/kj2-05-demo.json ← SC
```


展示 `scenario/kj2-05-demo`（名稱「奧克蘭空泊・辨形」提案）呈現本批四種各一隻。


### kj2-06：燈苔、蘆網、拱根、沉林（25檔）


```text
content/base/species/wick-mat.json ← SM
content/base/bodyplans/mycel-wick-mat.json ← PM
content/base/monsters/wick-mat-d.json ← MD
content/base/abilities/kx-wick-mat-seep.json ← AA
content/base/species/reed-lace.json ← SM
content/base/bodyplans/mycel-reed-lace.json ← PM
content/base/monsters/reed-lace-c.json ← MC
content/base/abilities/kx-reed-lace-bind.json ← AU
content/base/abilities/kx-reed-lace-spit.json ← AU
content/base/effects/kx-reed-lace-caught.json ← FX
content/base/species/vault-root.json ← SM
content/base/bodyplans/mycel-vault-root.json ← PM
content/base/monsters/vault-root-b.json ← MB
content/base/abilities/kx-vault-root-stream.json ← AU
content/base/abilities/kx-vault-root-burst.json ← AA
content/base/species/drowned-grove.json ← SM
content/base/bodyplans/mycel-drowned-grove.json ← PM
content/base/monsters/drowned-grove-a.json ← MA
content/base/abilities/kx-drowned-grove-spit.json ← AU
content/base/abilities/kx-drowned-grove-sweep.json ← AA
content/base/abilities/kx-drowned-grove-veil.json ← AE
content/base/effects/kx-drowned-grove-veiled.json ← FX
content/base/effects/kx-drowned-grove-thinned.json ← FX
content/lore/places/five-lakes-white-ford.json ← LP
content/base/scenarios/kj2-06-demo.json ← SC
```


展示 `scenario/kj2-06-demo`（名稱「五湖白汊・辨形」提案）呈現本批四種各一隻。


### 範本代號


```text
SI = content/base/species/nestmother.json
SB = content/base/species/cliffjaw.json
SA = content/base/species/breakwater-clinger.json
SM = content/base/species/bed.json
PI = content/base/bodyplans/insect-reaper.json
PB = content/base/bodyplans/quadruped-cliffjaw.json
PA = content/base/bodyplans/alien-breakwater-clinger.json
PM = content/base/bodyplans/mycel-bed.json
FB = content/base/frames/bio-cliffjaw.json
FC = content/base/frames/corpse-cliffjaw.json
MD = content/base/monsters/mite-d.json
MC = content/base/monsters/breakwater-clinger-c.json
MB = content/base/monsters/bulwark-b.json
MA = content/base/monsters/cliffjaw-red-eye.json
AU = content/base/abilities/kx-thorn-snipe.json
AA = content/base/abilities/kx-ground-stomp.json
AS = content/base/abilities/nest-birth.json
AB = content/base/abilities/kx-star-howl.json
AE = content/base/abilities/kx-carapace-brace.json
FX = content/base/effects/kx-staggered.json
FS = content/base/effects/nest-birth.json
LP = content/lore/places/seattle.json
SC = content/base/scenarios/rift-edge-nest.json
IN = content/base/aiprofiles/nest-anchor.json
IP = content/base/aiprofiles/sniper-perch.json
IT = content/base/aiprofiles/reaper-vanguard.json
IG = content/base/aiprofiles/guerrilla.json
```


展示共通配置：沿scenario/rift-edge-nest的slots結構與map/rift-edge-60，保留地圖和既有terrain；player用frame/bio-cliffjaw＋frame/corpse-cliffjaw各一台，分別person/chen-xiaohai、person/ren-kasai，沿用內建招，人物不重複。敵方四種monster各一隻，不在slot上覆寫AI，採各species自己的profile；敵方統一沿現有四族情境使用faction/rift-insects，不杜撰新faction；player用faction/migrant-crew。部署雙方最近距離至少10格，A／定點射手放在中央守區附近，地圖可通行空格由產出工人按既有cells選取，無新map檔。玩家目標hold中央4個可行走格8輪；第一條為eliminate player→lose，第二條hold→win，敵方survive20→win兜底，rounds20、seed210801至210806。展示用既有A機體，這是可玩入口不是已驗過的平衡承諾。

批間依賴：只有既有範本；新生子體在kj2-01同批，其他新效果／AI均各批自足。lore各覆蓋本批4種，無跨批新引用。領導可平行派六批，本計畫不建立worktree、manifest、index或commit。

## 10. 需要引擎支援（engine-backlog 候選，不在本線落地）

**空戰與水域／深水**：影響空帆、燈腹、淵顎、垂幕的真正高度與深度。現查movement.ts會讀已有locomotion tag與地形moveCost，與交接摘要「完全不讀」有出入，但這不等於完整飛行／潛水系統；本計畫一律按leg地面行走，用增閃、遠射、少地面肢與厚甲近似。建議另案定高度／水深狀態、可達性與攻擊關係；大，牽動尋路、AI與呈現。

**地下穿越與現身**：影響泥母、鐘蠹與拱根。建議先定進出地下的可攻擊性與成本，再接路徑／意圖；中至大。本計畫只能在可通行格行動，地下僅寫既有近海涵洞或淡水橋根。

**武器部位與內建招式綁定**：影響破背架應停止點射、破囊口應停止生子。建議能力來源綁partId，broken後列不可用並讓AI重估；中。本計畫不用未授權require條件，採onBroken降accuracy／AP回復或上限，正文只宣告這些後果。

**spawner數量／週期與繫的完整語義**：flow.ts的spawn依效果生子、記父子，母死立即清dieWithParent子體；cadence/max不是這段出生動詞的硬閘。建議整合週期、活子體上限、捕母及世界七日離巢，保留既有世界繫；中。本計畫用usesPerBattle=3／2與cooldown=3／4作戰鬥上限，已出生者死亡不回補使用次數，避免無限孵生；世界七日與戰鬥即死不可互換敘述。

**生態位選獸與多候選錨**：影響地域準確度、新母體與美洲二名的營運出場。建議encounter增加可選species／monster白名單、棲位條件，rift.anchor改成按寬度及地域選池；中，與既有「窄裂縫錨按寬度取」候選合併，別重開同義項。本計畫demo明確指monster，不更換現有世界錨。

**純採收species的捕捉欄位**：菌絲現行capture.frame必填，導致只能指一個永遠到不了的frame。建議可選capture或明確採收能力；小至中。本計畫用雙core互斥條件與既有harvest-only frame引用，沒有新增可駕駛菌絲。

查證紀錄：現行code-map與測試已有monster覆寫及BattleResult monster id，與EF-13／舊二名限制摘要不同；交接明禁仍優先，所以本計畫不用這些覆寫，也不把已落地的能力重列缺口。不改任何規則文件。

## 11. 需求與待決

領導先審六隻二名與六個地方觀察日期，尤其交給基調線的美洲兩隻；它們不預定新失城、不推翻港口守住。是否立即將全部新獸插入全域rifts，或待棲位與錨池支援後逐區開放，屬領導營運接入選擇；24種的產出可先行。平衡仍留後期，任何調HP／傷害／AP都應另開調整記錄，不在產出時擅自重設本計畫的戰術題。桑托斯核心、萬潮葬王、新族與SS／SSS沒有本線待補設定。

### 本線驗收（固定四條，完成即停）

1. plan.md存在且含1–11段。
2. roster.json與review-draft.json合法JSON；roster24列，所有新增定義id互不重複且不撞既有檔（引用同一id不算重複定義）。
3. 新物種明細不給B以下monster name／epithet，不加registry值，不帶禁用行為欄，不做S級。
4. review-draft每列白話≤60字。

## 12. 領導審定（lead-kaiju2，2026-10-26；與上文衝突時以本節為準）

1. **命名審查已做**（agy gemini-4-argon-high，原文 `naming-review.txt`）：已直接改進本檔與 roster——沙扇→砂扇、沉顎→淵顎、披雷→青鬣（首選改用原備選；比照「房東／千囊房東」，俗名與二名可含物種名）、垂暮→垂幕；二名：青鬣A 俗名「外港青鬣」二名「斷纜青鬣」（基調修正線已採用，維持）、垂幕A 俗名「奧克蘭那張幕」二名「掩舟暮帷」、沉林A 俗名「白林」二名「斷橋骸林」；招式與徽章改掉「動詞＋顏色」與撞日常詞（折身掠浪、翻顎噴沫、伏石吐丸、張口瀉泥、甩鬣掠電、鼓帆射芒、垂幕落影、摺幕遮眼、覆幕、沿穗滲漿、倒拱激流、枯枝落沫、白林疊影、斷扉）。產出時照本檔現行文字，不要改回。新寫的部位名、地點文字也避開「動詞＋顏色當受詞」。
2. **bodyplan id 照族前綴**：`bodyplan/insect-*`、`beast-*`、`alien-*`、`mycel-*`（本檔與 roster 已改）。
3. **lore 地點 id 不帶批號**：`place/batangas-outer-sluices`、`sendai-bell-cliff`、`seattle-outer-grain-quay`、`valparaiso-outer-steps`、`auckland-empty-berths`、`five-lakes-white-ford`（已改）。`kind` 依實況選 `港`／`野地`／`蝕域`，不用 `其他`；`gameRefs` 指該批 species 與 monster（`base:species/…`、`base:monster/…`）。
4. **年表**：產出工人不碰 `timeline.json`，改在報告目錄寫 `timeline-add.json`（`{"entries":[{date,title,summary,era,tags}]}`，1 條）；標題各批不同，**不用「辨形記」這種套式**，寫那一夜發生的具體事。領導合併時只插入。
5. **營運接入**：全部 24 個新 monster 由領導在收件後插入各族 `world/rifts/*.json` 的 `monsters`，vanguard 照第 8 段建議；戰役黃金由領導最後統一重錄。工人一律不碰 `world/`。
6. **既有 lore 檔一律不改**（基調修正線持有）；新地點檔只新增。

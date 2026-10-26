# 機甲種類擴充計畫（cx-m2-plan）

已讀清單：以下指定檔案均由本線親自讀取；JSON 表以 tabledb 分段讀，年表以 grep 按條目讀。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/polish.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/mechs.md`
- `wf/workflows/planning/design-notes/mechs/mechanical.md`
- `wf/workflows/planning/design-notes/mechs/bonds.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/world.md`
- `wf/workflows/planning/design-notes/world/drive.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/c-essence.md`
- `wf/workflows/planning/specs/core/data-model-mech.md`
- `wf/workflows/planning/specs/world/mech-lifecycles.md`
- `wf/workflows/dispatch/handoffs/lead-fill-mech/REPORT.md`
- `wf/workflows/dispatch/handoffs/lead-rep/REPORT.md`
- `wf/workflows/dispatch/handoffs/lead-mech2/plan/inventory-start.json`
- `content/lore/timeline.json`
- `wf/workflows/dispatch/handoffs/lead-mech2/cx-m2-plan.md`

另讀：`wf/WORKFLOWS.md`、`wf/workflows/planning.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`。調查亦讀既有骨架、配裝能力、效果、血統與相關勢力 lore。

本線只交付本檔與 `review-draft.json`，不產出內容、不改設定、不調平衡。依交接書的明確格式，本檔保留逐機表與矩陣，不另開資料檔；這是本次兩檔範圍對一般大表外移規則的特例。費用／工作量：主代理一條、子代理 0；沒有外部服務費，token／金額未取得計量，不虛報。

## 一、盤點

口徑：以 `inventory-start.json` 的 54 台機甲為固定母體；現況 `cls=mechanical` 另有 `frame/infantry`，其 tags 是 infantry，非機甲，不混入。每台一個主定位，副用途留在說明，因此兩張矩陣各合計 54。角色是本計畫分析欄，不新增 `model.role` 列舉。

判準按實際行動而非名字：友方 buff／protect 的內建招優先判指揮；自身 protect＋厚軀幹判守牆；近戰 attack、escape 與短距武器判突擊；遠程單體射擊判射手；scout 標記／靈目判偵察；友方排燼與護撤為支援；工程需工程掛點及工具配裝；炮架＋遠距範圍為重裝砲台；拘束矢為拘束；近距範圍持續灼燒為範圍壓制。空中／兩棲是骨架及配裝主題，沒有越地形特權。再看 heat／charge 供給與射程，不能把同為 captain 的連星雙斬誤列指揮，也不能把極光自身光幕說成全隊護盾。無人相關沿 SI-04 的明確用途另列，非通用機種可自動無人化。

### 角色定位 × 等級台數

|主定位|D|C|B|A|S|合計|
|---|---:|---:|---:|---:|---:|---:|
|守牆|2|3|4|0|0|9|
|突擊|0|4|2|3|0|9|
|射手|3|7|3|2|0|15|
|偵察|2|0|1|1|0|4|
|支援|0|0|0|0|0|0|
|工程|1|0|0|0|0|1|
|兩棲／水上|0|1|0|0|0|1|
|空中|0|0|0|1|0|1|
|重裝砲台|1|0|1|0|0|2|
|指揮|0|0|4|2|1|7|
|拘束|1|2|0|0|0|3|
|範圍壓制|0|0|1|0|0|1|
|無人相關|1|0|0|0|0|1|
|合計|11|17|16|9|1|54|

### 勢力 × 等級台數

依 model.maker 的實際營運歸屬；同一 frame 多 model 時，以同名 model 作主歸屬。通用系列不是勢力，但單獨列，避免硬塞進某家。第三刃與暗面在營運上借用鹽鷗 maker，這個矩陣不等同敘事政治陣營。

|maker（去 faction/）|D|C|B|A|S|合計|
|---|---:|---:|---:|---:|---:|---:|
|anvil-hunters|0|1|2|0|0|3|
|generic|5|6|3|3|0|17|
|imperial-court|0|0|1|0|0|1|
|inner-sea-houses|0|1|0|0|0|1|
|japan-umbrella|1|0|0|0|0|1|
|nairobi|0|1|1|0|0|2|
|north-american-umbrella|0|0|1|0|0|1|
|quito|0|1|1|1|0|3|
|residual-league|3|2|0|1|0|6|
|russia-umbrella|0|0|1|0|0|1|
|salt-gull-hunters|1|2|3|2|0|8|
|selene-whitegloves|0|2|1|2|1|6|
|shell-society|1|0|1|0|0|2|
|tide-faith|0|0|1|0|0|1|
|未登記|0|1|0|0|0|1|
|合計|11|17|16|9|1|54|

### 每台主定位與可追溯判據

下表 id 皆為 `content/base/frames/<id>.json`；骨架、池、內建與配裝原欄仍見盤點起點。判據列的 tactics 取內建招；射程為配裝中攻擊／標記的範圍聯集，不代表所有攻擊都能打到最遠格。

|id|級|主定位|骨架／池；內建 tactics；配裝距離|
|---|---|---|---|
|anvil-crimson-rivet|B|指揮|mx-biped-heavy／heat100；attack,buff；1–6|
|anvil-ii|C|突擊|mx-biped-c／heat110；attack；1–5|
|anvil-iv-ram|B|突擊|mx-biped-heavy／heat120；attack；1–9|
|backside-white-night|A|突擊|mx-ace-a／heat90/charge100；buff,escape；1–12|
|bulwark-i-beacon|D|守牆|mx-biped-d／heat90；attack,buff,protect；1–5|
|bulwark-i|D|守牆|mx-biped-d／heat100；attack,buff,protect；1–6|
|bulwark-ii-rivet|C|守牆|mx-biped-c／heat110；attack,buff,protect；1–3|
|bulwark-ii|C|守牆|mx-biped-c／heat100/charge50；buff,protect；1–6|
|bulwark-iv-rampart|B|守牆|mx-biped-heavy／heat110/charge60；buff,protect；1–12|
|bulwark-old-city|A|指揮|mx-fortress-a／heat120/charge70；buff,protect；1–12|
|cn-jade-tablet-i|B|守牆|mx-biped-b／heat110/charge60；buff,protect；1–6|
|cx3-flyingfish-d|D|偵察|mx-biped-scout／heat100；attack,scout；1–4|
|cx3-flyingfish-ii|C|突擊|mx-hover-c／heat100；buff,escape；1–1|
|cx3-flyingfish-iv|B|指揮|mx-biped-b／heat100/charge80；buff；1–6|
|hound-mk2|C|拘束|biped-light／heat100；attack；1–5|
|innersea-counterseal-ii|C|守牆|mx-biped-c／heat100/charge50；buff,protect；1–3|
|ix-01|D|射手|mx-biped-d／heat100/charge40；attack；1–6|
|ix-homeward|A|指揮|mx-ace-a／heat120/charge90；attack,buff,protect；1–6|
|ix-ii-loom|C|射手|mx-biped-c／heat100/charge60；attack；1–6|
|ix-ii|C|射手|mx-biped-c／heat100/charge60；attack；1–6|
|ix-iii|B|守牆|mx-biped-b／heat110/charge80；attack,buff,protect；1–5|
|jp-si04|D|無人相關|mx-biped-d／heat100/charge30；無；1–6|
|league-plough|D|工程|mx-biped-d／heat100/charge30；attack,buff,protect；1–6|
|longspear-piercing-cloud|A|射手|mx-ace-a／heat100/charge110；attack；1–12|
|longspear-v1-guild|D|拘束|mx-biped-d／heat110/charge40；attack；1–5|
|longspear-v1|D|射手|mx-biped-d／heat100/charge40；attack；1–7|
|longspear-v4-saltgull|C|兩棲／水上|mx-hover-c／heat100/charge50；attack；1–10|
|longspear-v4|C|射手|mx-biped-c／heat100/charge60；attack；1–7|
|longspear-v7|B|射手|mx-biped-b／heat100/charge90；attack；1–12|
|moji-tern-guard|C|突擊|biped-guard／heat100/charge60；attack；1–1|
|moji-tern|C|射手|biped-standard／heat100/charge60；attack；1–7|
|na-kestrel-i|B|射手|mx-biped-b／heat100/charge90；attack；1–7|
|nairobi-crook-iii|C|拘束|mx-biped-c／heat100/charge60；attack；1–6|
|nairobi-shepherd|B|指揮|mx-biped-b／heat110/charge80；buff,protect；1–6|
|quito-andes-wall|B|守牆|mx-biped-heavy／heat110/charge80；buff,protect；1–6|
|quito-thunderbird|A|射手|mx-ace-a／heat110/charge110；buff,protect；1–9|
|quito-vulture-ii|C|射手|mx-biped-c／heat100/charge70；attack；1–6|
|ru-hearth-i|B|重裝砲台|mx-biped-heavy／heat150/charge60；buff,protect；1–9|
|saltgull-tidegull-longspear|B|指揮|mx-biped-b／heat100/charge80；attack,buff,protect；1–6|
|selene-aurora|A|偵察|mx-ace-a／heat100/charge150；buff,protect；1–10|
|selene-crescent-g5|B|射手|mx-biped-b／heat90/charge100；attack；1–12|
|selene-eclipse-moonless|S|指揮|mx-selene-s／heat120/charge200；attack,buff；1–12|
|selene-silverring-g1|C|射手|mx-biped-c／heat100/charge60；attack；1–7|
|selene-silverring-g2|C|射手|mx-biped-c／heat90/charge80；attack；1–7|
|selene-valkyrie|A|空中|mx-winged-a／heat100/charge120；attack；1–7|
|shellsoc-ls3|D|偵察|mx-biped-scout／heat90；attack；1–9|
|shellsoc-surveyor-b|B|偵察|mx-biped-b／heat100/charge60；attack；1–9|
|thirdblade-binary-swordfish|A|突擊|mx-ace-a／heat100；attack；1–1|
|thirdblade-swordfish-iii|C|突擊|mx-hover-c／heat100；attack；1–1|
|thirdblade-swordfish-v5|B|突擊|mx-biped-b／heat100；attack；1–1|
|tidefaith-redeemer-3|B|範圍壓制|mx-biped-b／heat150；attack,disable；1–3|
|union-at12|D|重裝砲台|mx-tracked-d／heat120/charge40；attack；2–12|
|union-fr7|D|射手|mx-biped-d／heat100/charge30；attack；1–6|
|union-futu|A|突擊|mx-fortress-a／heat130/charge80；attack；1–12|

真正已有的差異：AT-12 把砲與靈目集中於同一砲塔；女武神把移動功能放在翼；老城把更厚層放在核心，友方護衛另吃流光；飛魚從短距攻擊轉向友方增益；測墟的價值是標記與干擾。犁的「工程」目前僅是工具近戰，並沒有拖機、修橋或修復能力。

同質處：五種主骨架 `mx-biped-d/c/b`、`mx-biped-heavy`、`mx-ace-a` 實為 **41／54**（8＋11＋11＋5＋6），交接背景的 47 不是這五種的和。若連偵察、要塞、舊雙足與 S 級雙足納入，非翼雙足共 49；其餘為翼裝 1、潮行 3、履帶 1。大多數武器仍掛左右臂，集中打腿與胸的答案近似；heat 100 上下與頭吼／盾陣反覆出現。現有 frame 都已有 defaultLoadout，文件的「81 台都空手」已過期。

## 二、設計理念

「種類多」要讓玩家換一台就重新判斷三件事：打掉哪個部位會少掉哪個掛件與行動；先花流光、先積燼還是先讓隊友退開；它在編隊裡負責守、斷、探、救還是遠射。因此新增四足、多足、輪座、吊架、舟形、分翼六種骨架，同時把支援工具放在可打斷的外露部位。每個新型號都從某家當時缺的工作長出來，核心與駕駛員仍昂貴，工程機不會憑敘述變成萬能救援車。

## 三、缺口矩陣與骨架

沿第一節口徑，0 才叫缺格；已有數量少但打法單一也列改善。P1＝本輪優先落地，P2＝本輪補角色但保留引擎限制，P3＝暫不補。空中／水上本輪只做近似，無人相關全部留使用者另案。

|定位|D|C|B|A|S|
|---|---|---|---|---|---|
|守牆|2／P1|3／P1|4／P1|缺0／P1|缺0／P3|
|突擊|缺0／P1|4／P1|2／P1|3／P1|缺0／P3|
|射手|3／P1|7／P1|3／P1|2／P1|缺0／P3|
|偵察|2／P1|缺0／P1|1／P1|1／P1|缺0／P3|
|支援|缺0／P1|缺0／P1|缺0／P1|缺0／P1|缺0／P3|
|工程|1／P1|缺0／P1|缺0／P1|缺0／P1|缺0／P3|
|兩棲／水上|缺0／P2|1／P2|缺0／P2|缺0／P2|缺0／P3|
|空中|缺0／P2|缺0／P2|缺0／P2|1／P2|缺0／P3|
|重裝砲台|1／P1|缺0／P1|1／P1|缺0／P1|缺0／P3|
|指揮|缺0／P1|缺0／P1|4／P1|2／P1|1／P3|
|拘束|1／P1|2／P1|缺0／P1|缺0／P1|缺0／P3|
|範圍壓制|缺0／P1|缺0／P1|1／P1|缺0／P1|缺0／P3|
|無人相關|1／P3|缺0／P3|缺0／P3|缺0／P3|缺0／P3|

P1 是投資順序，不是把全部空格灌滿；D 不做空中王牌、各家不都複製一條 D→A 系列。固定 24 台的覆蓋結果見第四節。

### 六種新骨架（全部歸 mech2-01）

以下皆為提案名；id 前綴 `m2-` 代表此共用結構族，不代表任何勢力取得別家的藍本。共用的是機械接口與部位排列，帷幕、排燼、靈目語彙仍由血統決定。骨架固定等級，不拿 D 的 HP 當 A；層 HP 暫從同級參照骨架重新分配原總量，不因多腳就免費多血。每部位最內層為 structural，至少 torso 一個 core；座艙 seats／conduct 複用參照的 pilot、soul，沒有新機魂人物。

|新 bodyplan id／提案名與英文意涵|部位、functions 與槽（槽名:type/size）|由外到內的層；參照路徑|
|---|---|---|
|m2-wheel-d／輪座-D；Wain，載重輪車|torso=core,cockpit：cockpit:cockpit/1、soul-core:soulCore/1、armor-mount:armorMount/1；turret=weaponMount,sensor：main-gun:weaponMount/2、sensor-mount:sensorMount/1；front-axle、rear-axle=locomotion；side-tool:weaponMount/1 在前軸，system-1:systemMount/1 在後軸|torso 為 armor→cockpit-shell；其餘 armor→structure；拆成前後兩軸，砲塔不再兼全部移動。參照 `content/base/bodyplans/mx-tracked-d.json`。移動標記沿用 track，輪式只是外形。|
|m2-quadruped-c／四足-C；Trestle，支架|torso=core,cockpit，座艙、魂槽及 armor-mount 同上；head=sensor，sensor-mount/1；front-left、front-right=locomotion,weaponMount，各 left-weapon、right-weapon:weaponMount/2；rear-left、rear-right=locomotion，system-1:systemMount/1 在後左；back 的 back-1:backMount/2|torso armor→cockpit-shell，其餘 armor→structure；把既有雙臂與雙腿的層總量分攤四足，前足受損先失去該足武器。參照 `content/base/bodyplans/mx-biped-c.json`，標記 leg。|
|m2-hexapod-b／六足-B；Hexapod，六支撐|torso=core,cockpit，座艙、魂槽、armor-mount/1；head=sensor，sensor-mount/1；front-left、front-right=locomotion,weaponMount，各 left-weapon、right-weapon:weaponMount/3；mid-left、mid-right、rear-left、rear-right=locomotion；system-1、system-2:systemMount/1 分在兩後足；back 有 back-1、back-2:backMount/2|torso armor→cockpit-shell，其他 armor→structure；中足分走暴露權重、後足承載系統，核心仍只有一個。參照 `content/base/bodyplans/mx-biped-heavy.json`；標記 leg。多腳不附送地形免疫。|
|m2-gantry-c／吊架-C；Gantry，跨架起重|torso=core,cockpit，座艙、魂槽、armor-mount/1；head=sensor，sensor-mount/1；boom=manipulator,weaponMount：left-weapon:weaponMount/2；counterweight=weaponMount：right-weapon:weaponMount/2、system-1:systemMount/1；left-track、right-track=locomotion；back 的 back-1:backMount/2|torso armor→cockpit-shell，其餘 armor→structure；砍斷吊臂失去工具，打配重失去副武器與支援系統。參照 `content/base/bodyplans/mx-biped-c.json` 的 C 級層總量，部位拓撲另比 `content/base/bodyplans/mx-tracked-d.json`；標記 track。|
|m2-keel-b／舟架-B；Keel，船的脊骨|torso=core,cockpit，座艙、魂槽、armor-mount/1；mast=sensor，sensor-mount/1；bow、stern=weaponMount，各 left-weapon、right-weapon:weaponMount/2；port-float、starboard-float=locomotion，各 system-1、system-2:systemMount/1；back-1:backMount/2 在 stern|torso armor→cockpit-shell，其餘 armor→structure；首尾火力分開，兩側浮架打掉一邊便少一件系統。參照 `content/base/bodyplans/mx-biped-b.json` 層量，輪廓借 `content/base/bodyplans/mx-hover-c.json`；標記 hover，不保證能渡水。|
|m2-splitwing-a／分翼-A；Pinion，獨立翼段|torso=core,cockpit，座艙、魂槽、armor-mount/1；nose=sensor，sensor-mount/1；left-wing、right-wing=locomotion,weaponMount，各 left-weapon、right-weapon:weaponMount/2 與 back-1、back-2:backMount/2；tail-left、tail-right 各 system-1、system-2:systemMount/1|torso armor→cockpit-shell，其餘 armor→structure；拆翼會連帶斷一側武器，打尾翼會拔掉流光或排燼件。參照 `content/base/bodyplans/mx-winged-a.json`；標記 flight，仍遵守現行地面移動。|

新骨架都有 torso，避免既有 `layersAdd.part=torso` 的鎧甲插空；不配依賴 `right-arm` 或 `legs` 的既有部件。槽型全是既有值，省略 type 的同名槽沿表首對應。普通斷足是否失速不憑 functions 想像：本輪可保證的差異是掛件來源被打斷、層序列與暴露權重改變；真正步態與失翼墜落列第五節。

## 四、24 台新機與四批產出計畫

### 產出線共同要求

所有新名稱含系列衍名、工具名與事件名均為「提案名」。先英文原名及意涵，再取中文；frame 必寫 `nameEn`、`etymology`（含下表意涵、掛點與「為何此時需要」）。D 用代號；C／B 用系列迭代；A 可冠名，但只有真有友方指揮招才設 captain。古代機本體、裝甲與蝕系用詞依 terms；不引他作、不用真實公司、武器型號或人名。新型號不新增具名駕駛員，不賦低級機魂鮮明人格。

下表每列一個 frame 及同名 model，路徑固定為 `content/base/frames/<id>.json`、`content/base/world/models/<id>.json`。骨架欄補 `bodyplan/`；lineage 欄補 `lineage/`；配裝欄是 `defaultLoadout` 草稿，冒號左是完整 slot id、右補 `component/`。內建欄補 `ability/`。數值參照欄均是既有同級 frame 的實路徑；直接取其 attrs、heat／charge 池量與成本帶，數值不平衡、不因敘事提高 grade。C 未帶系統也可，B 至少一系統、A 至少兩系統；D 至少一把、C 以上至少兩件武器掛件，每台至少一件不帶 conventional-arms 的有效傷害武器。每一回合實際可花 AP 的產燼不得逾同級既有池的 0.6；超了先刪多餘掛件，不改既有數值。

model 沿現有 `line/captain/variant`：以下除明標指揮為 captain，其餘 variant；tier 等於 grade，cost D5／C15／B40／A100。通用三系 maker=`generic`、generic=true、exportPolicy=open；其他 maker 必填表內完整勢力 id、generic=false、exportPolicy=restricted，聲望直接沿 D10／C20／B35／A55，不另做門檻。各批 availableFrom.month 為 01=1、02=2、03=3、04=4，都是開局後提案，不能偽稱年表已發生。requires 只用同列數值參照的既有 model；角色不同的側向型號不是前代，未來如不適合列科研前置可留空，不能偷偷掛後三批彼此的 model。國家仍需有限的核心與人；A 是少數試作，不宣稱國家、公司、學會突然擁有無限王牌。

本輪無無人題材新機（0 台）。鐵偶＝無核心凡鐵只打人；遙控機＝有核心不驅動、只能普通開；只有人或機魂在座艙才有此表招式。母艦生無人機只列第五節「待使用者定」，不把 species 偽裝成機甲。

六種骨架與全部新共用件都由 01 供應。02／03／04 的能力、效果與部件只引用既有 id 或 01，三批互不依賴。實體內容由領導依 batch 開隔離產出線；本計畫驗收仍只有交接書三條，沒有在本線跑內容測試。faction.mechSeries 的既有檔更新不在四批名單，改以每批一個新 lore 事件交代各家試作與機種；不得省略檔數後另塞既有勢力改檔。

### mech2-01 共用工具（6 檔，均為提案）

|kind/id|提案名／英文與意涵|資料寫法與用途|
|---|---|---|
|component/m2-relief-cradle|排燼扶架／Relief Cradle，替同伴承托重負|systemMount、size1、mass1，origin mechanical；授予 ability/m2-relieve-ally。掛在可被打掉的支撐或配重部位，不是人員醫療。|
|ability/m2-relieve-ally|借我一息／A Breathing Space，讓同伴喘息|activated、unit、range1–3、friendly only、AP3、cooldown2、無傷包；always 掛 effect/m2-relieved；ai.tactics protect1、buff0.8。自身不能被選，保留支援機編隊價值。|
|effect/m2-relieved|緩燼／Relief，卸掉一口燼|scope mech、ownerTurns1、refresh；evasion+6（source 自己）；onApply pool heat delta=-15、owner mech，沿既有 HookAction 格式；tags buff,guard；badge 緩燼。目標沒 heat 只留護撤，無 HP 回復。|
|component/m2-mooring-jaw|繫泊鉗／Mooring Jaw，暫時咬住來敵|weaponMount、size1、mass2；origin mechanical，授予 ability/m2-catch-line。有限用途由招式限制，不新增矢池。|
|ability/m2-catch-line|攔潮橫索／Crossline，截住一排來路|activated、line、range1–3、不加 length 欄（TargetSpec 無此欄）、friendly no、AP4、produces heat10、cooldown2；無傷包，hit 掛 effect/m2-dragged；ai.tactics debuff1、disable1。只減益，不寫拖拽或位移。|
|effect/m2-dragged|牽滯／Held Fast，動作被拖慢|scope mech、ownerTurns1、refresh；evasion-8、initiative-4，contribs source 自己；tags debuff,stagger；badge 牽滯。沒有 immobilized 或永久停機。|

工具寫法參照 `content/base/components/mx-ash-mist.json`、`content/base/abilities/mx-ash-screen.json`、`content/base/effects/mx-old-city.json` 與 `wf/workflows/content/ability-forms.json`。兩個新效果皆有限回合、可被機甲與怪獸接受；不使用 passive 或 setControl。白話表亦收這六檔各一列。

### mech2-01：新機 4 台

|提案 id|中文提案名／nameEn／意涵|級／骨架／定位|一句玩法差異（比同級既有機）|造機勢力／lineage|掛點與造機原因|新 component／ability／effect|defaultLoadout 草稿；內建|比照數值的既有機路徑|
|---|---|---|---|---|---|---|---|---|
|ix-wain-01|IX-08（提案名）；Ironsword Wain 08；沿修造冊造的載重支援車，代號不用冠名|D／m2-wheel-d／支援|比 ix-01 少一手輸出，先替鄰機排燼；擊破後軸便斷支援|generic／universal-ironsword|2106-06 鐵劍公刻（content/lore/events/ironsword-open-pattern.json）；小工坊缺可輪班救急的拖機手|m2-relief-cradle 組：友方排燼護撤|main-gun:mx-rune-rifle,system-1:m2-relief-cradle；內建 無|content/base/frames/ix-01.json|
|bulwark-caisson-01|BW-06（提案名）；Bulwark Caisson 06；守住堤腳的低矮輪座|D／m2-wheel-d／守牆|比 bulwark-i 把胸甲與砲塔分成兩個要打的點，以盾陣掩護短距扇面|generic／universal-bulwark|2093-02 公刻（content/lore/events/shield-open-carving.json）；城門民兵要能換輪修的守備機|無；新骨架承擔差異|main-gun:mx-scatter-rune,armor-mount:mx-porcelain-plate；內建 mx-guard-stance|content/base/frames/bulwark-i.json|
|anvil-trestle-ii|鐵砧-II型・架鐵（提案名）；Anvil Trestle II；把斷臂的重拳架在四個支點上|C／m2-quadruped-c／突擊|比 anvil-ii 將樁與刃各掛一隻前足；斷足先斷一種近戰，不靠單個腿部吃傷|faction/anvil-hunters／broken-arm|2104 鐵砧-II 下線（content/lore/timeline.json）；守線工坊要替受雇破口部隊分散武器故障|無；新骨架＋既有近戰|left-weapon:mx-brokenarm-stake,right-weapon:mx-singing-blade,system-1:mx-frost-fins；內建 mx-frame-strike|content/base/frames/anvil-ii.json|
|cn-yoke-i|衡梁-I型（提案名）；Court Yoke I；衡量與分擔重荷，取朝廷器物語感|B／m2-hexapod-b／指揮|比 cn-jade-tablet-i 從自身守備改為一次友方護衛及反覆排燼，後足就是支援弱點|faction/imperial-court／universal-bulwark|2107 閱兵（content/lore/events/court-parade.json）；量產線有了，地方補給仍須一機機接力|m2-relief-cradle 組：排燼支援|left-weapon:mx-rune-rifle,right-weapon:mx-scatter-rune,system-1:m2-relief-cradle,system-2:mx-frost-fins；內建 mx-old-city-wall|content/base/frames/cn-jade-tablet-i.json|

### mech2-02：新機 7 台

|提案 id|中文提案名／nameEn／意涵|級／骨架／定位|一句玩法差異（比同級既有機）|造機勢力／lineage|掛點與造機原因|新 component／ability／effect|defaultLoadout 草稿；內建|比照數值的既有機路徑|
|---|---|---|---|---|---|---|---|---|
|league-gantry-02|GL-02（提案名）；League Gantry 02；舊軍械庫的牽引工位代號|D／mx-tracked-d／工程|比 league-plough 放棄盾陣換友方排燼，切割鋸集中在砲塔，受損就失去工程近戰|faction/residual-league／universal-ironsword|content/lore/factions/league-armory.json 系列與授權；崩年斷鏈後舊機回收比再買一顆核心便宜|m2-relief-cradle 組：護送退場|main-gun:mx-molten-saw,system-1:m2-relief-cradle；內建 無|content/base/frames/league-plough.json|
|shellsoc-pin-04|LS-4（提案名）；Survey Pin 4；先插定位針再動鏟的測繪習慣|D／mx-biped-scout／偵察|比 shellsoc-ls3 將標記留在內建，捨棄凡鐵射擊，用曲射與煙幕救自己撤回|faction/shell-society／many-eyes|content/lore/factions/shell-society.json 多目與 LS-3；學會委託工坊做給受雇護衛，免探勘再失散|無；重配既有能力|right-weapon:mx-shard-grenade,back-1:mx-ash-mist；內建 mx-rift-trace|content/base/frames/shellsoc-ls3.json|
|ix-porter-ii|鐵劍-II型・扶梁（提案名）；Ironsword Porter II；工地替人托住梁的一雙手|C／m2-gantry-c／支援|比 ix-ii 輸出改為近身自衛與範圍牽滯，配重被打斷同時失去鉗與排燼|generic／universal-ironsword|2106-06 共用修造冊（content/lore/events/ironsword-open-pattern.json）；公開接口讓港邊吊工能修也能護人|兩套 m2 工具：牽滯與排燼|left-weapon:mx-singing-blade,right-weapon:m2-mooring-jaw,system-1:m2-relief-cradle；內建 無|content/base/frames/ix-ii.json|
|longspear-kneeler-v2|長槍-V2・伏架（提案名）；Longspear Kneeler V2；伏下支架保住瞄準線|C／m2-quadruped-c／射手|比 longspear-v4 將兩種射擊分到前足，省去背部齊射；流光用盡可轉矢池續戰|generic／universal-longspear|2104 V4 定版（content/lore/events/longspear-v4-standard.json）；工坊依公開圖另做低伏支系，V2 是此支迭代|無；四足分掛武器|left-weapon:mx-radiant-rifle,right-weapon:mx-rune-rifle,sensor-mount:mx-hawk-eye；內建 無|content/base/frames/longspear-v4.json|
|thirdblade-skate-iv|鰩魚-IV型（提案名）；Third Blade Skate IV；貼水滑行的寬鰭，取海魚意象|B／m2-keel-b／兩棲／水上|比 thirdblade-swordfish-v5 分開首尾刃與近距牽制，側浮架可斷排燼；躍潮只給短增益|faction/salt-gull-hunters／tide-fin|2106-09-15 百燈破圍（content/lore/events/hundred-lanterns.json）；釜山研發線替第三刃補撤船側衛|無；舟架＋既有躍潮|left-weapon:mx-tidefin-twins,right-weapon:mx-binding-harpoon,system-1:mx-frost-fins,back-1:mx-tide-leap；內建 mx-frame-strike|content/base/frames/thirdblade-swordfish-v5.json|
|ru-brazier-ii|長爐-II型・爐座（提案名）；Long Hearth Brazier II；把長燃的火分放到支架上|B／m2-hexapod-b／重裝砲台|比 ru-hearth-i 有遠距曲射卻失去近戰刃，兩前足與背架分三個火力弱點，貼身會啞火|faction/russia-umbrella／universal-bulwark|wf/workflows/planning/design-notes/world/before-collapse-powers.md 俄；北岸據點要長守，國家產能也補不滿沿岸|無；六足砲架|left-weapon:mx-rune-cannon,right-weapon:mx-radiant-rifle,back-1:mx-falling-star-mortar,system-1:mx-frost-fins；內建 mx-guard-stance|content/base/frames/ru-hearth-i.json|
|selene-iris-g6|虹使-G6（提案名）；Selene Iris G6；傳話的虹使，型錄神話語感|A／m2-splitwing-a／空中|比 selene-valkyrie 捨棄俯衝傷害，靠標記與範圍干擾支援；任一翼斷就少一把主武器|faction/selene-whitegloves／jinghai|content/lore/factions/selene.json 藍本研發；公司接到護航標單但缺可靠人手，少量人駕試翼不替代地面軍隊|無；分翼與既有能力|left-weapon:mx-hush-pulse,right-weapon:mx-radiant-rifle,sensor-mount:mx-thousand-eye,system-1:mx-essence-cell,system-2:mx-frost-fins,back-1:mx-tide-leap；內建 mx-aurora-veil|content/base/frames/selene-valkyrie.json|

### mech2-03：新機 7 台

|提案 id|中文提案名／nameEn／意涵|級／骨架／定位|一句玩法差異（比同級既有機）|造機勢力／lineage|掛點與造機原因|新 component／ability／effect|defaultLoadout 草稿；內建|比照數值的既有機路徑|
|---|---|---|---|---|---|---|---|---|
|na-sled-03|NR-03（提案名）；Northern Relay 03；地面調度仍要有人跑最後一段|D／m2-wheel-d／射手|比 longspear-v1 把單槍與標記靈目集中砲塔，命中塔便斷兩職；沒有副槍可硬撐|faction/north-american-umbrella／universal-longspear|wf/workflows/planning/design-notes/world/before-collapse-powers.md 美國；內陸工業在，兩岸的哨線仍需小機巡查|無；輪座標記射手|main-gun:mx-radiant-rifle,sensor-mount:mx-rift-needle；內建 無|content/base/frames/longspear-v1.json|
|innersea-brace-02|IS-02（提案名）；Inner Sea Brace 02；替守港工人支住短暫缺口|D／m2-wheel-d／拘束|比 longspear-v1-guild 的單目標拘束改為一排短牽滯，曲射自衛；不能捕獸，也不能拖走單位|faction/inner-sea-houses／universal-bulwark|content/lore/factions/inner-sea-houses.json 工坊與標單；家族出的是便宜港門件，保不了整片海岸|m2-mooring-jaw 組：一線短減益|main-gun:mx-shard-grenade,side-tool:m2-mooring-jaw；內建 無|content/base/frames/longspear-v1-guild.json|
|shellsoc-tripod-c|定盤-C（提案名）；Survey Compass C；不是三條腿，是學者安定方向的盤|C／m2-quadruped-c／偵察|比 moji-tern 的直射哨戒改成四足標記與束矢，前足被斷可只留下探路角色|faction/shell-society／many-eyes|content/lore/factions/shell-society.json 先探後挖；多目觀測接口由護衛工坊仿做，不宣稱學會新建軍隊|無；四足偵察|left-weapon:mx-rune-rifle,right-weapon:mx-binding-harpoon,sensor-mount:mx-rift-needle,back-1:mx-tide-leap；內建 無|content/base/frames/moji-tern.json|
|anvil-hoist-ii|鐵砧-II型・吊鉚（提案名）；Anvil Hoist II；把重臂改成吊鉤，先穩住再切開|C／m2-gantry-c／工程|比 anvil-ii 的正面重樁改成鋸與橫索：分別打吊臂、配重能拆開傷害與牽制|faction/anvil-hunters／broken-arm|2096 斷臂（content/lore/timeline.json）及 content/lore/factions/anvil.json；長年受雇推牆，壞機要自己拖回|m2-mooring-jaw 組：牽制切割口|left-weapon:mx-molten-saw,right-weapon:m2-mooring-jaw,system-1:mx-frost-fins,back-1:mx-ash-mist；內建 mx-guard-stance|content/base/frames/anvil-ii.json|
|tidefaith-censer-iv|贖垢者-IV型・行香（提案名）；Redeemer Censer IV；行進的香爐，教徒私造的儀式器物|B／m2-hexapod-b／範圍壓制|比 tidefaith-redeemer-3 放棄拆拘束器內建招，雙範圍火器分掛前足，後足冷泉壞了就難再連燒|faction/tide-faith／tide-robe|content/lore/factions/tide-creed.json 潮衣與私造；失去養裂帶後解拘者要遮住撤離口，仍是教內私造|無；多足與兩種燼節奏|left-weapon:mx-purge-censer,right-weapon:mx-cinder-breath,system-1:mx-frost-fins,system-2:mx-cold-spring；內建 無|content/base/frames/tidefaith-redeemer-3.json|
|na-meridian|長晝-隼翼（提案名）；Kestrel Meridian；守到日午仍不交班的高處射手|A／m2-splitwing-a／射手|比 longspear-piercing-cloud 不帶超遠內建擲擊，最遠火力可隨左翼被斷；尾翼流光槽也是可選目標|faction/north-american-umbrella／universal-longspear|wf/workflows/planning/design-notes/world/before-collapse-powers.md 北美 B 級跟進；高階資本仍在地面，只做少數人駕試作|無；分翼狙擊|left-weapon:mx-starscar-lance,right-weapon:mx-radiant-rifle,back-2:mx-hunter-darts,sensor-mount:mx-hawk-eye,system-1:mx-essence-cell,system-2:mx-frost-fins；內建 無|content/base/frames/longspear-piercing-cloud.json|
|innersea-lantern|留燈-合印（提案名）；Counterseal Vigil；掌燈等最後一個守港者回來|A／mx-fortress-a／支援|比 bulwark-old-city 的正面厚砲改成近衛小武器，反覆排燼配一次遠護，讓隊友續戰而非自己扛全部|faction/inner-sea-houses／universal-bulwark|content/lore/factions/inner-sea-houses.json 大西洋港城賒帳；一座工坊試做守撤口的昂貴機，不等於家族肯普發|m2-relief-cradle 組：排燼接力|left-weapon:mx-radiant-rifle,right-weapon:mx-thunder-serpent,system-1:m2-relief-cradle,system-2:mx-cold-spring,back-1:mx-ash-mist；內建 mx-old-city-wall|content/base/frames/bulwark-old-city.json|

### mech2-04：新機 6 台

|提案 id|中文提案名／nameEn／意涵|級／骨架／定位|一句玩法差異（比同級既有機）|造機勢力／lineage|掛點與造機原因|新 component／ability／effect|defaultLoadout 草稿；內建|比照數值的既有機路徑|
|---|---|---|---|---|---|---|---|---|
|thirdblade-needlefish-ii|針魚-II型（提案名）；Third Blade Needlefish II；長嘴探進縫裡的小魚|C／mx-hover-c／兩棲／水上|比 cx3-flyingfish-ii 的貼身雙刃改為標記與曲射，躍潮後仍要正常走格，退潮時也能護船側|faction/salt-gull-hunters／tide-fin|2106-09-19 同旗之約（content/lore/events/one-banner-compact.json）；釜山要補齊隨突擊隊走的引路火力|無；既有骨架重配節奏|left-weapon:mx-shard-grenade,right-weapon:cx3-skimming-fin,sensor-mount:mx-thousand-eye,back-1:mx-tide-leap；內建 無|content/base/frames/cx3-flyingfish-ii.json|
|shellsoc-archive-b|拓影-B（提案名）；Survey Palimpsest B；抄下舊刻痕，也留下隊友撤離的影子|B／m2-hexapod-b／偵察|比 shellsoc-surveyor-b 將武器與系統分到四隻足；兩中足只分擔受擊，標記後靠排燼救護衛|faction/shell-society／many-eyes|2105 南極探勘失散（content/lore/factions/shell-society.json）；學會委製，買的仍是護衛時間|m2-relief-cradle 組：探勘護衛排燼|left-weapon:mx-hush-pulse,right-weapon:mx-rune-rifle,sensor-mount:mx-rift-needle,system-1:m2-relief-cradle,system-2:mx-frost-fins；內建 無|content/base/frames/shellsoc-surveyor-b.json|
|quito-quay-iv|棧橋-IV型（提案名）；Quito Quay IV；把船塢最後一段岸延伸出去|B／m2-keel-b／工程|比 quito-andes-wall 不靠光幕硬守，改為首鋸尾槍與側架排燼；打側架可切斷救援能力|faction/quito／universal-ironsword|2096 船廠出售（wf/workflows/planning/design-notes/world/history-lines/c-essence.md）；港工依通用修造冊改，失去船廠也要留住回收手藝|m2-relief-cradle 組：救援工位|left-weapon:mx-molten-saw,right-weapon:mx-rune-rifle,system-1:m2-relief-cradle,system-2:mx-frost-fins；內建 無|content/base/frames/quito-andes-wall.json|
|anvil-gatewarden|封門-鐵砧（提案名）；Anvil Gatewarden；門關以前最後一副不肯退的鐵架|A／mx-fortress-a／重裝砲台|比 union-futu 的近距衝陣改為三層射界，至少兩格外才開主砲；被貼近得等隊友解圍|faction/anvil-hunters／broken-arm|content/lore/factions/anvil.json 浦那撤退後果；失去老駕駛員，工坊試做少數斷後砲座，不能替代人|無；要塞射界重配|left-weapon:mx-rune-cannon,right-weapon:mx-starscar-lance,back-1:mx-ember-pod,system-1:mx-frost-fins,system-2:mx-cold-spring；內建 mx-guard-stance|content/base/frames/union-futu.json|
|tidefaith-pilgrim|渡厄-贖垢者（提案名）；Redeemer Pilgrim；把危難當作必須走完的一段路|A／mx-ace-a／突擊|比 thirdblade-binary-swordfish 的單次爆發改用拆件禱焰與灼燒鋸，燼池先滿前要選拆件還是收刀|faction/tide-faith／tide-robe|content/lore/factions/tide-creed.json 解拘者私造；教義反機甲的矛盾留著，少數人為突入拘束場私拼 A 核|無；沿既有拆件內建|left-weapon:mx-molten-saw,right-weapon:mx-purge-censer,system-1:mx-cold-spring,system-2:mx-frost-fins；內建 mx-unbind-rite|content/base/frames/thirdblade-binary-swordfish.json|
|league-last-ferry|歸燈-燕鷗（提案名）；Tern Last Ferry；最後一班仍替同行者亮著的燈|A／m2-splitwing-a／指揮|比 ix-homeward 的厚胸指揮改把兩把掩護槍分在翼上，護衛只一次、排燼可續；不是載機母艦|faction/residual-league／universal-ironsword|wf/workflows/planning/design-notes/world/history-lines.md 崩年底色 1.8 哀悼；軍械庫試做有人駕的撤退聯絡機，不建立殘聯常備軍|m2-relief-cradle 組：撤隊排燼|left-weapon:mx-rune-rifle,right-weapon:mx-scatter-rune,system-1:m2-relief-cradle,system-2:mx-frost-fins,back-1:mx-ash-mist；內建 mx-old-city-wall|content/base/frames/ix-homeward.json|

### 依賴、檔數與覆蓋

各列標「排燼組」即引用 `component/m2-relief-cradle` → `ability/m2-relieve-ally` → `effect/m2-relieved`；「橫索／牽滯組」即 `component/m2-mooring-jaw` → `ability/m2-catch-line` → `effect/m2-dragged`，不是暗藏未計數的新檔。所有六種新 bodyplan 的目標檔為 `content/base/bodyplans/<id>.json`，兩件 component、兩條 ability、兩個 effect 分別到 base 同名複數目錄。

新 frame 都帶 mech、human 與一個 lineage 標記及 series 標記。直屬血統使用 `lineage-broken-arm/many-eyes/tide-fin/tide-robe/jinghai`；公版三系用 `series-bulwark/longspear/ironsword`，夸父來源無爭議的堅盾／鐵劍另標 lineage-kuafu。長槍來源尚有舊文矛盾，用 `lineage-universal-longspear` 表示圖紙系、不擅自宣稱新增古代來源。這些為自由 tags，不是 registries 新值。第三刃的造機敘事是釜山研發線、營運 maker 暫沿既有 `faction/salt-gull-hunters`；現成代理有設定債，第六節列明，不將兩家合併為敘事上的同盟。

四份新 lore 事件都是提案、`occurs:"possible"`、tags 含 rumor；各自說明該批試作動機而不改歷史既有事件，也不預定勝負。日期分別用 2108-02／03／04／05，對應模型 month 1／2／3／4。事件檔不虛填不存在的 gameRefs 欄，用正文提到型號與已存在 faction／place；機甲的 etymology 再帶回本表歷史掛點。

|批次|frames|models|bodyplans|components|abilities|effects|lore 新檔|總檔數|依賴|
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
|mech2-01|4|4|6|2|2|2|1|21|僅既有 id|
|mech2-02|7|7|0|0|0|0|1|15|既有＋01|
|mech2-03|7|7|0|0|0|0|1|15|既有＋01|
|mech2-04|6|6|0|0|0|0|1|13|既有＋01|

lore 路徑依序：`content/lore/events/mech2-workshop-appendix.json`（共用修造冊的外形補編）、`content/lore/events/mech2-harbor-implements.json`（守港與護航試作）、`content/lore/events/mech2-licensed-tools.json`（各家授權工坊的分歧）、`content/lore/events/mech2-retreat-trials.json`（撤退與斷後試作）。括號內名稱皆提案名。不新增 lineage、faction、人物、場景、地圖或 registry 檔；本輪新內容合計 64 檔。manifest、產出線 REPORT 與必要生成索引按 batch 管理，不混作本交接書列明的七類內容檔。

|覆蓋要求|結果|
|---|---|
|新機 24–30、四批|達成：24 台，4＋7＋7＋6；每批 21／15／15／13 檔 ≤22。|
|D／C／B／A 各至少 4 台|達成：四級各 6 台；S 0 台。|
|至少六種新骨架實用|達成：wheel-d 4、quadruped-c 3、hexapod-b 4、gantry-c 2、keel-b 2、splitwing-a 3，共 18 台用新骨架；其餘 6 台用既有骨架。|
|至少八種定位|達成：守牆、突擊、射手、偵察、支援、工程、兩棲／水上、空中、重裝砲台、指揮、拘束、範圍壓制，共 12 種；空中與水上明列近似。|
|至少八家、含五種組織|達成：通用系列、朝廷、俄、北美、殘聯、鐵砧、第三刃（營運代理鹽鷗）、塞勒涅、內海諸家、稽古學會、沐蝕會、基多，12 個 maker 分組（含 generic）。包含國家、獵團、公司、學會與教團。|
|S 不量產、古代機不在範圍|達成：新 S 0、古代機 0；A 都標試作或少數採購，不替任何勢力擴寫無限產能。|
|無人題材最多一台且待定|達成：新無人題材 0；不新增日傘無人分支，母艦留第五節待使用者定。|
|無營運勢力的機只入百科|達成：本輪不選韓傘或其他缺營運勢力；既有國家七家已由 lead-rep 接入，不能照 lead-fill-mech 的舊報告判未接入。|

取捨：先補可戰鬥的部位與節奏差異，不新增國家、血統與複雜場景來湊題材。各家高級工藝仍不同，公用骨架只節省同一個槽位規格的重複檔案。韓傘、真正多格載機母艦、拆橋與打撈收益留後續；本輪不冒用其他題材的額度。

## 五、引擎缺口草稿

以下是交領導的 engine-backlog 草稿，不改既有 backlog，也不阻擋本輪有限近似版本。名稱、預期行為與工程範圍均非新裁示。

|想要的玩法|現在怎麼近似|需要引擎做什麼|影響型號|
|---|---|---|---|
|飛行越地形、落地與失翼|flight 只是標籤；m2-splitwing-a 的獨立翼掛武器＋mx-tide-leap-up 的短增益，照常走格|讓移動讀 locomotion、規定可越格與可落格、失去飛行部位的後果及 AI 路徑；不能用 escape 名字代替位移|selene-iris-g6、na-meridian、league-last-ferry|
|水上、兩棲、上岸成本|hover／舟架只改部位；用短增益、束矢、首尾掛件表達岸邊分工，水格仍視同陸地|接 engine-backlog 51：水域可進性與成本、上下岸、涉水失效條件、AI 選路|thirdblade-skate-iv、thirdblade-needlefish-ii、quito-quay-iv|
|四足／多足失足後仍能走|把武器與系統分到各足，打壞來源部件有實際後果；不宣稱六足能跨牆|可用 locomotion 部位數、步態損失與移動代價的資料契約，避免多足變免費多血|anvil-trestle-ii、longspear-kneeler-v2、shellsoc-tripod-c；四台 hexapod|
|起重、拖機、戰場修復|扶架只排燼＋短護撤；繫泊鉗只 line 減益；鋸是近戰武器。沒有修復 HP、拖拽友方、開橋或戰後回收獎勵|移動另一個單位、機械層修復、施作範圍與可修條件、工程 AI、營運回收結算；不可負傷害假裝修復|league-gantry-02、ix-porter-ii、anvil-hoist-ii、quito-quay-iv|
|艦載編隊、母艦生出無人機|只讓既存有人單位以標記、護衛、排燼合作；不設定母艦型號，待使用者定|spawn 目前只收 species；若要機甲需 frame＋配裝＋核心／座艙＋駕駛來源、進出場容量與 AI，不把怪獸生成當機甲生產|本輪 0 台；不得把 league-last-ferry 改成母艦|
|多格船身與首尾位置|舟架仍佔一格；首尾只是可瞄準部位，沒有面向護甲或側舷射界|多格 footprint、碰撞與射界、面向／部位受擊關係；需要正式引擎計畫|thirdblade-skate-iv、quito-quay-iv|

## 六、既有矛盾（只記，不改）

**盤點數字與歸屬。** `plan/inventory-start.json` 所列五骨架加總是 41，交接背景寫 47；本計畫使用逐檔計數。`content/base/world/models/bulwark-ii.json` 與 `old-array-ii.json` 共同指向 bulwark-ii，起點只留下後者、因而顯得堅盾-II 是學會機；建議分清 frame 與 model，一機型體可有不同取得渠道，主矩陣按同名 model，舊陣列型不是額外一台。燕鷗攻堅型尚無 model，保留「未登記」，不猜 maker。

**長槍、燕鷗與軍械庫血統。** `wf/workflows/content/mechs.md` 寫長槍源於刑天；`content/base/world/lineages/universal-longspear.json`、`content/lore/events/longspear-leak.json` 寫 2102 銀環逆向，而刑天 2103 出土。`content/lore/events/tern-rollout.json` 說長槍改、`content/lore/factions/league-armory.json` 又說夸父改；`world/models/moji-tern.json`、`hound-mk2.json`、`league-plough.json` 的 lineage 是 xingtian，frame tags 卻是 kuafu。建議沿 lead-fill-mech：銀環是長槍圖紙來源，刑天刻痕是後加授權；燕鷗以軍械庫夸父底盤接公開射擊件來理解，但仍待上游統一。本輪用既有公版 lineage 類別，不增造古代來源。

**血統 source 佔位。** `content/base/world/lineages/{broken-arm,jinghai,many-eyes,tide-fin,tide-robe,xingtian}.json` 都以 ancient-rearguard 作 source，traits 多為同樣的 arm／torso；同時 xingtian 文稱成都保有，lore 的刑天卻在蒙特婁。這些是資料佔位與舊文，不等於六個古代機其實同一台；建議以各自 lore 藍本與最新裁示理解，不在本輪修引用。

**第三刃、暗面與鹽鷗的 maker。** `content/base/world/models/thirdblade-swordfish-iii.json`、`cx3-flyingfish-*.json`、`backside-white-night.json` 把 maker 放在 salt-gull-hunters；`content/lore/factions/third-blade.json` 卻寫釜山研發、與鹽鷗敵對。因此聲望門檻會刷錯敘事勢力。本輪不新建營運勢力、不改舊 model，暫沿既有代理，但領導應在發布說明揭露；若要正名，另案建真正 maker 後再遷移，不能把這筆債當新 lore。

**學會與教團的「不造機」。** `content/lore/factions/shell-society.json` 前文說沒部隊、不造機，末節卻有 LS-3／測墟；`tide-creed.json` 前文不要衍型機，末節又有潮衣私造贖垢者。建議讀成學會委製給雇用護衛，教團少數解拘者私造，均不代表組織改教義或全面軍工化。本輪學會三台是不同護衛工位的委製方案，教團兩台是私造方案，不能寫成一口氣量產。

**守牆機與射擊突擊的舊敘述。** lead-fill-mech 報告點出 `content/lore/factions/mimic-works.json`、`content/lore/events/shield-open-carving.json` 與年表對衍二・堅盾定位不一。建議以 design-notes/mechs/mechanical 的三系分工為準：堅盾防守，向前推牆不等於變成突擊系列；本輪 BW-06 不延續歧義。

**移動、指揮與效果名字超出實效。** `content/base/abilities/mx-valkyrie-dive.json` 是中距傷害，沒有移動；`mx-tide-leap-up.json` 只掛 evasion／accuracy；`mx-binary-cut.json` 只有雙傷包，captain tag 不代表指揮；`effect/mx-netted` 的 immobilized 字樣也不應被延伸為拖拽。建議描述實際效果，本計畫不拿敘事名字承諾位移、全隊護盾或載機。

**文件版本落後。** `wf/workflows/content/mechs.md`、`engine-facts.json` EF-14 還說 defaultLoadout 空白，但盤點 54 台皆有；lead-fill-mech 曾寫七家無營運，lead-rep 已接入。建議後者及現況資料優先；韓傘仍缺營運。EF-16 等抵抗性狀態也可能落後，本輪不依它去改數值或翻修引擎。

**無人與機魂的歷史原話。** `world/essence.md` 保留不能獨駕的舊話，`world/drive.md` 已覆蓋；`mech-lifecycles.md` 的部分舊提案亦非最新限制。建議明確區分有核心的普通開與有人／機魂驅動核心，女武神無人型錄不代表每次出戰都能用 frame 的內建俯衝。新 24 台全部按有人版規劃，無人案保持空白。

## 七、review 草稿與交接驗收

[review-draft.json](review-draft.json) 採 `wf-table/1`，固定五欄「檔、類別、名稱、白話、掛到」。新機每台一列（檔指 frame），六種 bodyplan、六個共用件／能力／效果各一列，另附四個新 lore 事件，共 40 列；model 不再重複一列。每列白話一到兩句、≤60 字，說玩家可感到的差異，近似玩法不冒稱完整功能。「檔」為 repo 相對的未來目標路徑，不是假稱本線已建內容檔；因此不列 link_columns 令工具去驗不存在的內容。

步驟：領導審本計畫 → 01 產共用依賴 → 02／03／04 可並行 → 領導收內容與白話表；數值仍等全批後統一調。本線只按下面固定三條驗收，過了即寄終局、不跑額外測試或 lint。

1. PLAN 存在、開頭有已讀清單、七節齊，第一節兩張矩陣。
2. 24–30 台分四批、每批 ≤22；逐機 id、提案名、nameEn、骨架、定位、玩法差異、掛點齊，覆蓋逐條標示。
3. review 是 wf-table/1，每台新機一列、每列白話 ≤60 字。

驗收結果（2026-10-26）：固定三條全部 PASS。第 1 條七節與兩矩陣齊；第 2 條 24 台、四級各 6 台、四批 21／15／15／13 檔，6 新骨架／12 定位／12 maker；第 3 條 review 40 列、新機 24 列、白話最長 30 字。PLAN 約 49 KB，容量 gate 未觸發。未加跑其他驗收。

完成／阻塞回報依交接書：本線 `cx-m2-plan`、團隊 `teams/mech2`，終局必經 inbox_mail 的 `--up` 路由；未取得證據才 BLOCKED，測出缺漏先修，不把指令拼錯當環境阻塞。新機 >30、任批 >22、PLAN >60 KB 均停下回報。

### 以後交接書該點名的工具

`wf/tools/tabledb.py` 不直接把 `lore-timeline/1` 的 entries 當 wf-table rows：本次 grep 查年表取得資料；以後仍應明列 grep 為 timeline 的可用讀法，避免空查詢被誤當「沒有事件」。其餘無。

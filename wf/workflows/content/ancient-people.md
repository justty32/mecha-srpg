# ancient-people — 古代機、人物與機魂的設計原則

[content README](README.md)｜裁示 [design-notes/mechs](../planning/design-notes/mechs.md)｜世界觀 [ruins-and-ancient](../planning/specs/world/ruins-and-ancient.md)、[machine-souls](../planning/specs/world/machine-souls.md)｜規則 [rules-people](../planning/specs/core/rules-people.md)｜設計契約 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/design.md`

## 古代機：每台是一個人

古代機是先民「一個人、一隻獸、一層殼」的終點，死了一萬年還會動。所以**每台一個 FrameDef、獨一無二、不可量產、不可拆部件**：`cls:"ancient"`、`grade:"S"`、`repairPolicy:"repair-only"`、tags 含 `ancient`（會飛加 `flight`）、`innateAbilities` 2–3 條、`resonance:{beliefs:[兩個], threshold:0.5, deeds:[一個]}`。總層 HP 550–750（刑天 610 對照）、4–6 部位、層序 `resonant-shell→flesh→organ`、baseAttrs 各 4–10。檔名 `frames/ancient-<代號>.json`、能力 `abilities/ax-<代號>-<招>.json`、效果 `effects/ax-<代號>-<名>.json`、池 id `ax-<名>`。

**神異能力**：每台一到兩個「只有牠會」的招，用效果系統逐台定義——不經部件、不可移植、不可學。好的異能改變**戰場規則的一小塊**（叫起屍體當肉盾、傷害借給一萬年前的自己、讓一格十分律失效、假繫子體），不是「更大的砲」。寫法：`require` 放 `{"cmp":{"a":{"ref":"self.resonance"},"op":">=","b":0.5}}`；**每台留一個無共鳴要求的基本攻擊**（24–34 傷、4 AP），讓未認主者也能動。招牌單體 ≤48、範圍 ≤26／目標、buff 2–3 回合 +5～+20，強招配 `usesPerBattle 1–3` 或 `cooldown 3–4`。

**多不產燼**：古代機通常**無 heat 池**（pools 為空或只有自己的池：怒、卡、鹹水、天穹之重…各自定義 min/max/regen 與帶）。所以：古代能力不 produces heat；古代機裝不了 produces heat 的摹式部件（EF-04）；有限資源用「initial 高、regen 0」的池（卡、鹹水、甘露）表達「用一點少一點」；唯一積燼的是佩倫（雷橡血統的來源），不要再加第二台。資源也可以吃駕駛員：costs `{"pool":"hp","owner":"person"}`（庫丘林）或 `fatigue`。

**神話命名**：古代機原始無名，`name` 是人取的神話稱號（夸父、刑天、芬里爾、阿努比斯、提亞瑪特、迦梨、恩凱…），各文化輪著用、不重複既有 13 台與 lore 九台；不同勢力叫法不同寫進 lore `aka`（frame 別名欄待引擎缺口線）。招式名四到六字、像誓言或咒：「不退之誓」「借傷萬年」「生十一怪・母海裂腹」。

**獨一無二的檢查**：新古代機至少答三題——牠的異能改了哪條規則？牠的池叫什麼、為什麼用完不回？牠認的是哪種人（兩個信念）？答不出就是一台貴的摹機。保有勢力與摹機藍本對齊 [mechs](mechs.md) 血統表。

## 人物：駕駛員、技師、科研員

`persons/<name>.json`：`kind:"human"`、六屬性落 accuracy 45–62／evasion 5–13／resolve 42–71／initiative 5–8／perception 5–8／control 40–56（王牌單一屬性到 70）、三池 `ap`（9，hard，regen 9）、`fatigue`（100，inverted，regen -15）、`hp`（48–65，`onDepleted:["effect/dead"]`）、`traits` 1–2、`will.beliefs` 1–2、`growth` 抄 ren-kasai。技師 tags `technician`、科研 `researcher`（仍是人、有 hp）。名字多元文化（北歐、孟加拉、約魯巴、蒙古、日本、墨西哥、愛爾蘭、波蘭、波斯、毛利、泰米爾、阿拉伯、中國…），**不與既有 37 人、lore 58 人同名**（先 `ls content/base/persons content/lore/characters`）。

**特質**是 `effects/*-trait-*.json`，`scope:"person"`、`clock:permanent`、contribs ±5 內、**有利有弊**（記仇：accuracy +3 對仇敵／resolve −3；怕水：進水格 evasion −5），純敘事的可空 contribs 但要有 ui.badge。傷勢 `injury:temporary`（`clock days 3–7`）或 `injury:permanent`，登進 `rules/injuries.json` 才會被抽到（那是 rules 檔，要任務授權）。

**意志軸三用法**（人物資料上的欄位，不是機甲類別分支）：共鳴＝`will.beliefs` 與古代機 `resonance.beliefs` 比對，信念字典：`never-retreat bring-them-home revenge protect-kin survive break-chains judge-the-dead reborn defy-the-father wild-storm outwit-fate seek-truth atonement devotion keep-oaths hunger-for-glory bear-the-weight keep-watch`（新信念可加，但要至少一台古代機或一個事件用它）；承擔＝`will.burdenLimit`，預設 `{"ref":"self.attrs.resolve"}`，獸緣高者 `add +10～+25`、tag `beast-kin`；殼緣＝`will.resonanceAffinity` 0.1–0.5、tag `shell-touched`（獸緣／殼緣升格正式屬性待規劃）。古代機候選駕駛 tags `ancient-candidate`，信念含該台兩個之一以上。

## 機魂：另一個駕駛員，個性限 S 級以上

`kind:"soul"`、池 `ap`／`fatigue`／`calc`（算力，5–10）、`growth:{tree:"soultree/…", researchPerDirection, companionshipRate}`、無 hp 池（魂核毀才死）。**一般機魂照本宣科、沒有鮮明人格**：traits 0–1、名字是登錄號或物件名（七號、手套、算盤）。**S 級以上才有個性**（節點開滿、陪伴夠久、出過事）：口頭禪、怪癖、對某人的執念、會替招式取名；目前以 tags `soul-grade-s` 與 soultree 節點數表達，機魂等級欄待引擎缺口線。寫有個性的機魂時在 lore 點明「這很罕見」。天賦樹 `soultrees/<dir>.json` 4 節點、方向 `calc`／`hand`／`heart`（算／手／心），要獨駕必含 `research` 鍵 `autonomy` 的節點；perk 是 `effects/perk-soul-*.json`。白手套＝同一個機魂「手套」的複本：全節點、零陪伴、有禮貌得可怕。古代機**不認機魂**（殼不看沒有肉的東西）。

## 常見錯誤

古代機 produces heat／裝摹式武器；寫 `setControl`；名字不是神話或撞名；沒有無共鳴基本攻擊；低級機魂寫個性；人物屬性全 70；特質只有好處；信念自創卻無人用；傷勢沒登 injuries.json 就宣稱會抽到；古代能力加 `conventional-arms`。

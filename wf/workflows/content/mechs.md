# mechs — 機械系（摹機）與部件的設計原則

[content README](README.md)｜裁示 [design-notes/mechs](../planning/design-notes/mechs.md)｜世界觀 [mech-lifecycles](../planning/specs/world/mech-lifecycles.md)｜既有一覽 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/catalog.json`（157 列）

機械系是基線：沒有驚喜、沒有感情、靠錢與科研。它的「個性」來自**血統**（源自哪台古代殼）、**系列**（迭代到第幾代）與**配裝**；數值照 [numeric-bands](numeric-bands.md)。

## 三段命名（design-notes 裁示）

| 階段 | 等級 | 名字長相 | 例 |
|---|---|---|---|
| 代號 | D | 字母數字或單字，像工程機或軍械編號 | FR-7、AT-12、犁、K-9 |
| 系列＋型號 | C–B（A 也可） | `<系列>-<羅馬／V 數字>型` 或 `<系列>-<代號>` | 堅盾-II型、長槍-V4、劍魚-III |
| 冠名／中二 | A–S | 系列名本身就華麗，或「冠名-系列」表隊長機 | 幽冥鐵騎-浮屠、極光、偷天、連星-劍魚、老城-堅盾 |

規矩：系列名偏器物、鳥獸、神話（`world/names/mech-series.json` 有 16 個系列詞可抽）；**勢力各有一套語感**——塞勒涅型錄體＋希臘神話（銀環-G1、弦月、極光）、殘聯軍械庫字母數字（FR-7）、鐵砧金工（鐵砧-II型、赤鉚）、第三刃魚名（劍魚）、潮信會佛語（贖垢者-三型）、殼學會測繪體（LS-3、測殼-B）、背面江湖味（偷天）。顯示名統一「-II型」「-V4」寫法（「Mk2」不用）。型號數字只表迭代，不表口徑；名字裡不出現 mm、kW。

## 藍本血統與通用系列

每台摹機 tags 必含一個 `lineage-*` 與（若屬系列）`series-*`；血統對照：殘聯／堅盾／燕鷗／獵犬＝`lineage-kuafu`（夸父，經摹一）、塞勒涅＝`lineage-jinghai`（靜海殼）、鐵砧＝`lineage-broken-arm`（斷臂殼）、第三刃＝`lineage-tide-fin`（潮鰭殼）、潮信會＝`lineage-tide-robe`、殼學會＝`lineage-many-eyes`、背面＝`lineage-jinghai-stolen`、長槍＝`lineage-xingtian`（刑天刻痕）。血統決定**設計語彙**：partsBias（厚哪個部位）、慣用池（鐵砧發熱、塞勒涅流光多）、能力 tags（guard／pierce／veil）、輪廓一句（`world/lineages/*.json` 的 `traits.silhouette`）。同血統的機彼此像、不同血統差很多——新機先讀它血統的 lineage 檔再動筆。

**通用系列**（tags `universal`）至少堅盾、長槍兩條：各勢力都能造、市場都買得到、`world/models` 的 `generic:true`、`exportPolicy:"open"`。新通用系列要有「為什麼大家都會」的一句（開源、逆向、流出、年代早）寫進 lore 事件；專屬系列 `exportPolicy` 不開放。

## 世代演進（登場時期與前代）

同系列一代比一代：HP ×1.3、多一個槽或一條內建能力、名字從型號走向冠名。`world/models/<name>.json` 填 `requires:[前代 model]`、`availableFrom.month`、`tier`＝frame.grade、`cost` 照 5／15／40／100／300。隊長機（tags `captain`）＝同系列特製迭代：等級高一級、`innateAbilities` 多一條「指揮／護衛」招（protect／buff），獨一無二但**不是**古代機——它仍可量產維修（repair-or-replace）。登場時期與前代寫進 lead-content-mech catalog 同欄位（`登場時期`、`前代機型`），lore 的 faction `mechSeries` 同步一句。

## 建議配裝與 defaultLoadout

**現況**：`FrameDef.defaultLoadout` 已進引擎，但 81 台 frame 一台都沒填，所以情境單位多半空手只剩內建拳頭／頭吼（ISS-001）。新摹機**必填** `defaultLoadout`：`{"<slot id>":"component/…"}`，slot id 要是該 bodyplan 部位 `slots[].id`（如 mx-biped-c 的 `right-arm` 部位 slot id 查 bodyplan 檔），型別相符，只限 `cls:"mechanical"`。補既有機的 defaultLoadout 是獨立任務（照 catalog `建議配裝` 欄；一批 ≤20 台、跑黃金確認不變——黃金情境單位若因此有了武器，hash 會變，那批要頂層授權）。

配裝原則：每台至少**一把不帶 conventional-arms 的武器**（對獸）；D 級 1 武器、C 級 2、B 級 2＋1 系統、A 級 2＋2。總 size 不超過槽數、mass 不超過 bodyplan 載重感（目前無載重規則，自律：D ≤6、C ≤9、B ≤12、A ≤15）。產熱總量：全開一回合 ≤ heat max×0.6。

## 角色定位矩陣

| 定位 | 骨架 | 池偏好 | 武器 | 內建能力 | 代表 |
|---|---|---|---|---|---|
| 線列／盾 | mx-biped-heavy、履帶 | heat 大 regen 快 | 近戰＋短砲 | guard-stance（protect） | 堅盾、鐵砧 |
| 射手 | mx-biped-c／b | charge 大 | 長射程 min≥3 | 無或精準 buff | 長槍、銀環 |
| 突擊／近戰 | mx-hover-c、潮行 | heat 中 | 刃、樁 | 位移招（escape／attack） | 劍魚、燕鷗攻堅 |
| 偵察 | mx-biped-scout、翼裝 | charge 小 | 短槍 | scout 標記、veil | 測殼-B、極光 |
| 指揮 | 同系列重型 | 兩池皆有 | 中距 | buff／protect 友方 only | 老城-堅盾、連星-劍魚 |
| 要塞 | mx-fortress-a | heat 很大 | 砲 ×2 | 不動守 | 城垣、浮屠 |

每個定位在同一等級至少一台，缺的補；同定位同級不要重複出兩台只差名字。

## 部件

- **武器**＝component＋一條 ability（`abilities:[…]`，能力 costs 寫 ap＋矢池或 heat／charge）。矢池 `initial=max`、`regen 0`、hard；池名用「殼矢／光矢／追矢／拘束矢」。
- **裝甲／光幕**＝`layersAdd` 往 torso 插層（armor 25–55 HP，resist ≤0.25；shield 用 `ablative:false`＋`reduce`＋`regen`）。
- **系統**（排燼 produces heat 負值、殼目 attrMods perception、流光槽 poolMods charge max）。
- **異系部件**：生物件填 `burden`、古代件填 `resonance`（共鳴條件目前寫不進能力門檻，只擋 attrMods／abilities 啟用——標待引擎缺口線）。
- 部件 `hp` 12–24，打壞即該能力不可用；凡兵名帶「凡」且 tags `conventional-arms`。

## 常見錯誤

空手（沒 defaultLoadout）；pool `name` 寫熱量／電能；部件能力 produces heat 裝到無 heat 的機體；D 級取中二名；同名不同 id（獵犬 Mk2 vs 獵犬-II型）；tags 漏 `mech`／`human`／`lineage-*`；models tier 與 frame grade 不一致。

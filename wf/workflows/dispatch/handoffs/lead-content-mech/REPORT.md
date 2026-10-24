# REPORT — lead-content-mech：機械系內容 147 檔（頂層代存，2026-10-24）

STATUS：**DONE**。commit `ff63528`（147 檔）、`bb2601c`（`slot-types` 追加 `backMount`、`systemMount`）。工人 `cx-mx-body`、`cx-mx-arms`、`cx-mx-sys`（交接書與 REPORT 在本目錄）。清單 `catalog.json`、`manifest.json`。中途四則裁示（藍本血統、登場時期／前代、通用系列堅盾／長槍、太空歌劇用語照 `content/lore/style.md`：熱量＝燼、電能＝流光）都已併入。

## 新增件數
| 類別 | 件數 | 內容 |
|---|---|---|
| frames | 30 | D8、C8、B7、A6、S1（塞勒涅客製）；隊長機 4 |
| bodyplans `mx-` | 11 | 輕、中、重、履帶、潮行、翼裝、要塞 |
| components `mx-` | 41 | 武器 22（凡兵 6、摹式 15、拘束矢 1）、裝甲光幕 4、推進 2、殼目 3、排燼 2、流光 2、灰霧 1、異系部件 5 |
| abilities `mx-` | 45 | 武器 23、系統 9、機體內建 13 |
| effects `mx-` | 18 | |
| aiprofiles `mx-` | 2 | |

血統：通用「堅盾」（2093 開源；I → II → IV「城垣」；改型「哨火」、鉚甲型；隊長機「老城-堅盾」）、「長槍」（2101 塞勒涅銀環-G1 墜機殘骸被「背面」逆向；V1 → V4 → V7；公會型、「鹽鷗」型；隊長機「穿雲-長槍」）。專屬：殘聯＝刑天、塞勒涅＝靜海殼、鐵砧＝斷臂殼、第三刃＝潮鰭殼、潮信會＝潮衣殼、殼學會＝多目殼、背面＝靜海殼盜系。frame 無對應欄，只以 tags（`lineage-*`、`series-*`、`universal`、`captain`）標。十分律：凡兵 6 件帶 `conventional-arms`、名帶「凡」。

## 最得意的 5 件
1. 老城-堅盾（A 隊長機）：被改了十九次、只剩駕駛艙原裝。
2. 墜星吼砲：最響的凡兵砲，打怪獸照樣一成。
3. 斷臂樁：鐵砧摹了十二年只摹出斷臂殼手肘那一擊。
4. 蝕光-無月（S）：塞勒涅不上型錄的客製機、Glove 本體座機。
5. 贖垢香爐：潮信會燒掉獵團拘束器放出怪獸。

## 平衡
同級對打 20 輪約 60% 平手，無同級全勝；長槍系射手偏強、劍魚系近戰偏弱（AI 不先走位）。C 級以上兩台打不贏同級預算怪獸——燕鷗對照組亦 3 戰 2 敗，屬怪獸量級問題。只量 2 seed。

## 測試
check 0、`npm test` 490／0 fail、黃金不變、typecheck 過；煙霧對戰 30 台×120 場 0 例外 0 卡死、45 能力用到 44（鐮肢背刺為反應技）。

## 引擎事實（以後交接書要寫）
1. `armorPen` 是 0–1 比例（古代線三個 `ax-` 能力也踩到）。
2. AI 不用 cone／line、不對友軍放範圍增益、不用 sustained。
3. 熱量池付成本＝加值（排燼寫負產出）。
4. 古代部件共鳴條件寫不進能力門檻。
測配裝：`scenarioToSetup` 後改 `setup.units[].components` 再 `runBattle`。

## 需要決定（頂層 2026-10-24）
1. 情境摹機空手（`UnitSpawn` 無裝配欄）→ 採用：加 `UnitSpawn.components?` 與 `FrameDef.defaultLoadout?`，接 catalog 建議配裝 → 排入引擎缺口線。
2. 既有檔改名建議（`arc-emitter`→「裂晶弧光吼砲」、`autocannon-30`→凡鐵連吼系、`hound-mk2` 歸長槍民間前代、`moji-tern*` 池名→燼／流光）→ 交風格改寫線。
3. 古代線 armorPen → 已通知。AI 缺口 → 已轉 lead-ai-objective。

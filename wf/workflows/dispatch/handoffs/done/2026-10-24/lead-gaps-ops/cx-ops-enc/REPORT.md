# cx-ops-enc：人類遭遇已出戰，護送／獵殺 id 與貢獻值已接通

STATUS：DONE（本線驗收完成；全套既有／跨線紅燈列於第三段）。未 commit、未重產黃金 hash。原交接書固定五條驗收；另執行上游 2026-10-24 13:07 orders 明確追加的第八點與一條驗收，沒有自行擴充。

## 做了什麼

人類遭遇按各級預算加權抽 frame；人物池按座位建立獨立 PersonState，耗盡前不重複模板、不碰名冊。契約以 id 的 FNV-1a 固定選遭遇；只有節點的契約借用蝕域裂縫，再退回第一族 shallow。

護送新增徒步單位，以 ops.forceIds 將 player-N 對照成 sortie/escort-N，避免 prepareSetup 誤讀機庫。獵殺依 tags 尋找目標；epithet 要求 A 級且 MonsterDef.epithet 有值，缺少時補一隻。兩處貢獻值源頭立即求值 number。

內容檢查增加指定 kind 引用與槽相容性驗證。core loader 的 loadout 檢查是私有函式，故在 ops checker 實作所需兩項驗證。

追加 orders：未明列 zone 的 hold 取可達中線半徑 2 格群，排除敵方部署區；clear 有錨在場時改 killTarget，opening 保持 eliminate。舊 hold 測試預期依追加指示同步更新。

原五條驗收結果：

1. `npm run typecheck` exit 0；ops content check 0 errors／34 warnings；`npm run check` 0 errors／38 warnings（warning 是同時落地的 core 檢查器輸出）。
2. `encounter.test.ts` 14/14：六份遭遇的 frame、勢力、配裝、六場 runBattle、契約穩定選取、人物池與名冊隔離、節點回退皆綠。未涉及新目標規則的舊怪獸情境＋RNG 序列化指紋保持 `ad61107c8bdab823`。
3. 上述測試包括護送 id 經 sortieBattleSetup 重映射、獵殺 id、全部出戰人物貢獻數值化；`encounter-check.test.ts` 11/11，每個壞輸入回錯、正確輸入無錯。補檢查前已取得失敗證據。
4. `npm test` 最新 128 個測試檔，121 過、7 失敗；本線檔案全綠。ops 紅燈為招募、JSON replay 的 undefined 欄、裂縫舊預期及黃金 hash，詳下段。
5. greedy seed 1、2、3 與 idle seed 1：各 12 潮月，最新四次均 exit 0 並印 `OK`。

追加驗收：`scenario.test.ts` 先 6 綠／2 紅，再 8/8。凍結 297 場中的 anchored 7 場，前後同為 0/7 勝、平均 2 輪、nmHits=0；六場第一輪撤退，另一場第八輪敗北。舊版重播啟動後才接入新行為，使用同一凍結集。

## 產出（含完整檔案清單）

程式 7 檔、內容 6 檔，未超過 10／8 件 gate。獨占檔 diff 加新測試共 38,381 bytes；再包含共享 types／opseffect 整份 diff 的保守上界為 45,087 bytes，低於 50 KB（其中包含別線改動，不歸本線）。

以下連結皆為完整路徑；共享檔只認領 EncounterUnit／EncounterDef／ContractTemplate.encounter 與 applyCoreEffect 的 value 求值，其他共享改動屬別線。

<!-- wf-nav -->
- [scenario.ts](../../../../../../../../src/ops/sortie/scenario.ts)
- [scenario.test.ts](../../../../../../../../src/ops/sortie/scenario.test.ts)
- [encounter.test.ts（新增）](../../../../../../../../src/ops/sortie/encounter.test.ts)
- [check.ts](../../../../../../../../src/ops/content/check.ts)
- [encounter-check.test.ts（新增）](../../../../../../../../src/ops/content/encounter-check.test.ts)
- [opseffect.ts](../../../../../../../../src/ops/content/opseffect.ts)
- [types.ts](../../../../../../../../src/ops/state/types.ts)
- [殘聯檢查站](../../../../../../../../content/base/world/encounters/league-blight-checkpoint.json)
- [鐵砧搶屍](../../../../../../../../content/base/world/encounters/rival-anvil-carcass.json)
- [鹽鷗伏擊](../../../../../../../../content/base/world/encounters/rival-saltgull-ambush.json)
- [白手套查帳](../../../../../../../../content/base/world/encounters/selene-whiteglove-audit.json)
- [走私船](../../../../../../../../content/base/world/encounters/smuggler-farside-ship.json)
- [解拘者](../../../../../../../../content/base/world/encounters/tide-unshacklers.json)

六份配置如下，id 省略 `base:` 與各欄 kind 前綴；斜線分隔同池條目。戰鬥 seed=1701，勝負由玩家觀點記錄，最新證據為 encounter.log。

| 遭遇 | faction | frame | pilots | 結果／輪 |
|---|---|---|---|---|
| 殘聯 | residual-league | union-fr7 / union-at12 | adewale-balogun / arun-velan | 敗／5 |
| 鐵砧 | anvil-hunters | anvil-ii | zofia-kowalska / abacus-of-ashes | 敗／5 |
| 鹽鷗 | salt-gull-hunters | longspear-v4-saltgull | ronan-o-dalaigh | 敗／6 |
| 白手套 | selene-whitegloves | selene-silverring-g2 / selene-crescent-g5 | darya-farzan / ximena-itzel / empty-teacup | 敗／5 |
| 走私 | salt-gull-hunters | backside-white-night | rust-kite | 敗／10 |
| 解拘者 | tide-faith | tidefaith-redeemer-3 | sigrun-hallvard | 敗／9 |

EncounterUnit 作者說明（三行）：

`frame` 必填；依 frame.grade 對應 budgetByGrade，`w` 預設 1，表示同級條目的抽樣權重。  
`pilots` 可選，填 person def id 池，支援 human／soul 對應座位，建立戰鬥新實例而非借用名冊。  
`components` 可選；未填沿用 defaultLoadout，填 `{}` 表示空配裝，填 slot→component 則整組取代。

對外型別變更：新增 EncounterUnit；EncounterDef 加可選 faction、units；ContractTemplate 加可選 encounter。既有必要欄與函式簽名不變。既有 SortieScenario.ops.forceIds 另供臨時護送單位對位。

證據皆在 `/tmp/cx-ops-enc/`：typecheck.log、check.log、world-check.log、npm-test.log、encounter.log、check-red.log／check-green.log、zone-anchor-red.log／zone-anchor-green.log、campaign-greedy-{1,2,3}.log、campaign-idle-1.log；追加量測為 frozen.json、bench-capture.log、bench-before.log、bench-after.log。改前原始怪獸情境在 baseline.json。

## 沒做到或證據不足的

最新 npm test exit 1，不能稱全套綠燈。ops 三項已定位的跨線失敗：crew/crew.test.ts 的招募 fixture 仍預期舊可重複抽池會聘入成功；sortie/entry.test.ts 的 JSON roundtrip 比對少了原記錄中 `rift: undefined`；world/rifts.test.ts 的舊退潮預期仍要求 `rift-test`。診斷證據為 failure-crew-crew.log、failure-sortie-entry.log、failure-world-rifts.log，已寄上游，未越界修改。另 src/ops/sim/golden.test.ts 為契約豁免；src/mcp/{campaign,cli,e2e}.test.ts 亦失敗，本線未改 MCP。第一輪更多紅燈隨其他線完工已消失，以最新 npm-test.log 為準。

人類遭遇、護送 NPC、目標展開及新的抽樣會改變營運戰果與 RNG 後續路徑，ops 黃金 hash 因而改變；按交接書保留原黃金檔。未修改 code map／spec／其他線檔案，也未追加任何未授權量測。未宣稱 anchored 勝率改善。

## 需要決定的事

六份預算為保留總台數而移到既有勢力 frame 的等級：殘聯 D2+C1→D3；鐵砧 D2+C1→C3；鹽鷗 D2+C2→C4；白手套 D1+C2+B1→C3+B1；走私 D2+C2→A4；解拘者 D2+C2+B1→B5。這會提高部分遭遇難度，未自行加做平衡量測。

SPEC-GAP：走私沒有 core 勢力，以鹽鷗獵團代表沿岸獵團／走私敵手；far-side 的人類模板都在招募池，因此用同勢力 tag 的 rust-kite 機魂模板。潮信會只有可用的 cult-exile 模板 sigrun-hallvard，作能力模板並不代表原人物叛回教團。兩者需未來內容線決定是否新增更貼合的 def。

SPEC-GAP：沒有運輸 frame，以現有無武裝 infantry 代表護送人員；缺這類 frame 的內容包則退回 survive。護送 NPC 死亡不可算敵人頭數的 apply.ts 分類問題已通知上游轉 cx-ops-fix，屬其領地。守區使用中線可達格群，並非地圖作者指定戰略地標。clear 只在錨確實在場時改 killTarget，不替沒有錨的族憑空新增錨。

以後交接書該點名的工具：`scenarioToSetup` 之外也要點名 `sortieBattleSetup`／prepareSetup 的 id 重映射；`battle-bench.ts` 要說明凍結預設含五 seed，並保留同一 frozen 檔；沙箱 test runner 按檔計數時，用 `node <test>.ts` 取得逐案例證據；本專案資料表工具實際位於 `wf/tools/`。

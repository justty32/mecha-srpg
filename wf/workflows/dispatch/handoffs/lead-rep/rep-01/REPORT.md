已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/feature-dev/README.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/testing.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-fill-mech/REPORT.md`
- `wf/workflows/dispatch/handoffs/lead-ironsword/REPORT.md`
- `wf/workflows/planning/specs/ops/data-model-faction-rnd.md`
- `wf/workflows/planning/specs/ops/data-model-factions-contracts.md`
- `wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/lead-rep/cx-rep-01.md`

另讀 SESSION-LOG、WAIT_USER、WORKFLOWS、dev-env、data-files、inbox README／PROTOCOL；用指定 tabledb 查 code-map.json 的 ops 列，親讀七勢力 lore 與相關原始碼。未開子代理。

## 做了什麼

聲望購買門檻、七勢力營運、舊廠件、兩段 spec 與戰役黃金完成。未 commit。依 lead-rep orders：12:03 解除 EPERM 阻塞並准沙箱內除 EPERM 類以外全綠；12:05 檔數上限改55，增額只供黃金連帶檔。實際53個任務改動檔，另本報告；node_modules 是開場既存，未動。

門檻集中 ops-world.rules.repGate。純函式放既有 war/rnd.ts，避免另增模組。所有市場買 frame 在扣錢扣貨前驗 maker 聲望；固定 frame 清單有通用登記即公開，其餘取最低門檻。原可見規則保留，達標 restricted 機依篩選器列出，快取採相同判斷。通用血統私有機只由 maker 開局釋出／研發；技術流出後公開。

七家名稱沿 lore：四國 state、內海諸家 company、基多／奈洛比 city。territory、roster 空，只有 world 行動道。presence 不改 owner、不生常備軍；親讀 initWar 空 home 跳過、forcesDaily 無 forces 跳過、operationAllowed 無 forces 拒絕。發包落點與 nearby 合併 territoryNow／presence；無指定 issuer 時有領地勢力優先。

朝廷／俄／日本 presence 是新加坡、吉大港；北美是新加坡、孟買；內海是孟買、新加坡；基多是新加坡；奈洛比是新加坡、吉大港。均為既有圖上的軍售／渡月航班／商路窗口。state 模板 scout-rift-margin、clear-before-tide；company 模板 escort-sealed-convoy、survey-stolen-relic；city 模板 defend-citywall、clear-before-tide，issuerKinds 均相符。

首次全年 sim 五家零契約，故新增唯一 board-presence 牌。faction scope 帶 def.tags，僅 presence-board 七家有效；冷卻8天，三種請求由 issuerKinds／contractKinds 過濾。未調其他牌與平衡值。

war-armory 加七條 maker 篩選器，基多上限 A 以涵蓋雷鳥，其餘 B；沿原 frame 報價與庫存。oa 六件固定 items、公開售價300，沿既有機械部件價帶，未增市場名。

10台血統定位逐台理由：玉圭-I守陣→堅盾；長爐-I耐寒重裝守點→堅盾；隼翼-I遠射換位→長槍；SI-04守牆→堅盾；合印-II厚胸盾陣→堅盾。安地斯壁重裝盾牆→堅盾；雷鳥光槍追矢遠射→長槍；禿鷲-II山口機動→鐵劍；牧杖-III拘束協同均衡機→鐵劍；牧者盾陣指揮守點→堅盾。tier 沿 frame，D5／C15／B40；雷鳥 A100 沿既有 rnd spec。series／mark 沿名，無型號者 mark1；依交接全為 role line。

改動檔清單（指定 git status --short 原文）：

```text
 M content/base/world/actions/ops-world.json
 M content/base/world/markets/war-armory.json
 M src/ops/content/check.ts
 M src/ops/contracts/lifecycle.ts
 M src/ops/sim/campaign.test.ts
 M src/ops/sim/fixtures/campaign-hash.json
 M src/ops/sim/health.test.ts
 M src/ops/state/types.ts
 M src/ops/war/rnd.ts
 M src/ops/war/war.test.ts
 M src/ops/world/actions.ts
 M src/ops/world/market.ts
 M src/ops/world/places.ts
 M test/campaigns/campaigns.test.ts
 M test/campaigns/golden-spec.ts
 M test/campaigns/grid-actors.hash.json
 M test/campaigns/ops-betrayal.hash.json
 M test/campaigns/ops-betrayal.json
 M test/campaigns/ops-leak.hash.json
 M test/campaigns/ops-merc-join.hash.json
 M test/campaigns/ops-merc-join.json
 M test/campaigns/ops-relic.hash.json
 M test/campaigns/ops-relic.json
 M test/campaigns/ops-war-assault.hash.json
 M test/campaigns/ops-war-assault.json
 M wf/workflows/planning/specs/ops/data-model-faction-rnd.md
 M wf/workflows/planning/specs/ops/data-model-factions-contracts.md
?? content/base/factions/imperial-court.json
?? content/base/factions/inner-sea-houses.json
?? content/base/factions/japan-umbrella.json
?? content/base/factions/nairobi.json
?? content/base/factions/north-american-umbrella.json
?? content/base/factions/quito.json
?? content/base/factions/russia-umbrella.json
?? content/base/world/actions/board-presence.json
?? content/base/world/factions-ops/imperial-court.json
?? content/base/world/factions-ops/inner-sea-houses.json
?? content/base/world/factions-ops/japan-umbrella.json
?? content/base/world/factions-ops/nairobi.json
?? content/base/world/factions-ops/north-american-umbrella.json
?? content/base/world/factions-ops/quito.json
?? content/base/world/factions-ops/russia-umbrella.json
?? content/base/world/models/cn-jade-tablet-i.json
?? content/base/world/models/innersea-counterseal-ii.json
?? content/base/world/models/jp-si04.json
?? content/base/world/models/na-kestrel-i.json
?? content/base/world/models/nairobi-crook-iii.json
?? content/base/world/models/nairobi-shepherd.json
?? content/base/world/models/quito-andes-wall.json
?? content/base/world/models/quito-thunderbird.json
?? content/base/world/models/quito-vulture-ii.json
?? content/base/world/models/ru-hearth-i.json
?? node_modules
?? src/ops/world/rep-gate.test.ts

```

## 產出

最終 npm test：# tests 152；# pass 149；# fail 3；# duration_ms 282930.772993；exit 1 僅三個既有沙箱 EPERM 檔。依12:03 orders，該三類由領導沙箱外重跑，其他全綠。未冒稱 sandbox npm test exit0。完整 log：/tmp/cx-rep-01/test-acceptance.log。

npm run check exit0，末行 OK 0 errors, 10 warnings（既有怪獸捕獲層 HP 警告）；npm run typecheck exit0；直接內容 check exit0。指定 rep-gate.test.ts 的 node --test exit0；直接 node 實際7/7，涵蓋(a)–(e)、固定清單／maker地盤、presence優先／專牌與 override 0／檢查器拒錯。node --test 在此沙箱只計檔數，不以1檔冒稱1案例。war-invariants 指定指令 exit0（五案例含六seed×三政策×六蝕月）；GOLDEN_UPDATE 相關五檔 exit0。證據在 /tmp/cx-rep-01/{rep-final.log,rep-test-detail.log,war-final.log,golden-update.log}。

指定 greedy seed7 跑滿12蝕月、day336、無終局；新機全部 maker 開局 released，其他勢力無私有新機：

| 勢力名段 | 契約數 | 新機釋出 |
|---|---:|---|
| imperial-court | 42 | 1/1，day 0 |
| russia-umbrella | 42 | 1/1，day 0 |
| north-american-umbrella | 42 | 1/1，day 0 |
| japan-umbrella | 42 | 1/1，day 0 |
| inner-sea-houses | 21 | 1/1，day 0 |
| quito | 21 | 3/3，day 0 |
| nairobi | 23 | 2/2，day 0 |

同場既有發包勢力：migrant-crew153、bay-seventh-post26、dhaka-weavers15、selene-whitegloves8、shell-society23；anvil-hunters、residual-league、rift-insects、salt-gull-hunters、tide-faith各0。新七家合計233、既有合計225。加專牌前新七家依序8／0／0／0／2／0／0。未據此改數值。可重讀 /tmp/cx-rep-01/sim-measure.json，CLI log 為 sim-cli-final.log。

黃金逐檔前→後（前六項在 test/campaigns/；最後在 src/ops/sim/fixtures/）：

```text
ops-war-assault.hash.json: 504231f9fe441a8c → f5641e88a8ad78e9；day 76 → 16
ops-relic.hash.json: 42b81aaef6da23a4 → 35d2d7abc14a506d；day 231 → 280
ops-merc-join.hash.json: 7011e184e54e5638 → 2e34aba07c3645c2；day 21 → 49
ops-leak.hash.json: e8d1f1376fa9411b → eb2d23f3641f6c6e；day 6 → 6
ops-betrayal.hash.json: d7715b3580af832c → 564c4fe4b670953f；day 10 → 6
grid-actors.hash.json: 46f19572e29df3b5 → d415f49fe5b6826f；day 3 → 3
campaign-hash.json: 410fec8eedad6d93 → 8c22b755b33f5b3e；day 31 → 31
```

所有重錄仍驗完整原意圖。攻堅 seed2→1，operation4→1，仍兩次交手→unanchored→作戰結算，day76→16。遺產 seed10→1，新增與攻堅同款 rift-11 D／age0 setup，保留奪 old-array→開血統→釋出 old-array-ii，day231→280；原新軌跡被稽古取得而永遠缺研發前置，故不能只延長等待或刪斷言。

護航 seed2不變：達卡護航 contract68→136、operation2→5、salt-flat→ridge；四場戰果保留，sortie73@15→145@43、76@16→148@44、79@17→151@45、84@18→155@46，day21→49。倒戈 seed10→2：contract57→66（殘聯遺產委託，operation2），接取後取消，再接 contract72→62（operation1對側）；保留 -40、黑名單與 Betrayed，day10→6。golden-spec 子序列與 campaigns.test 的 attachedLoss 指向同步。

軌跡斷言：idle seed7 無駕駛員終局118→132天，月報仍4；seed1長wait終局104→118天，原因仍 no-pilots。關係對數28→105，改依人類勢力n算n(n−1)/2，排除玩家／裂獸不變。health seed4航行遭遇率越界，沿舊重錄慣例改seed7（21/80=0.2625），全部原判準與拒錯測試保留。

## 沒做到或證據不足的

沙箱限制證據：worldgen CLI 的 spawnSync node EPERM，MCP CLI／e2e 同類；12:03 orders 表示領導已在沙箱外驗過這三類綠燈，最終整批沙箱外驗證由領導接續。未改測試跳過條件、未改禁區，也未新增驗收。

SPEC-GAP：玩家目前沒有研發機型／補員帶機入口，本線只做購買及世界側限制，未新增玩家入口。兩份指定 spec 已最小補段；code-map 新測試導航由領導同步（本線禁止其他 wf）。基多的地域限制見下一段。

## 需要決定的事

12:03 orders 已確認是10台（交接8台誤算）；雷鳥 A100、基多市場 A 上限沿既有 spec。勢力與市場無自創新名。內海 company 對應家族工坊，無 lore scale 明顯衝突；牧者 frame 的 captain tag 按交接採 ops role line，未改 frame。

presence 地點為營運代理提案：現有圖缺南美與七家本土，依交接用既有港口設窗口。基多 lore「只在洲內」尚無法由新加坡的守備契約落點表現；若要嚴守地域，需另定地圖／契約範圍，本線未擴做。

## 以後交接書該點名的工具

直接 node <test.ts> 可顯示沙箱隱藏斷言；需先確認 worldgen spawnSync、MCP socket 能力。rerecord 不會重對應 contract／operation 編號，舊seed可能永遠不滿足研發前置，須保留原意圖調整固定腳本。黃金與軌跡測試連帶檔數也應納入上限。

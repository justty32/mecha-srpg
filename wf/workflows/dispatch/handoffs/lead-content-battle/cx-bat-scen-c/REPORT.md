# cx-bat-scen-c 完成報告

## 做了什麼

完成指定六個新情境。每個情境寫完都在專案根執行 `npm run check`；菌床局首次誤用了不存在的 `aiprofile/swarm`，當次檢查與量測失敗，已改成既有 `aiprofile/focus-fire` 並重跑通過。其餘五檔首次檢查及菌床修正後檢查均為 `OK 0 errors, 0 warnings`。最終六組 `node src/sim/measure.ts scenario/<id> 1 2 3` 均正常完成，原始輸出欄位完整保留並加 scenario 欄，共 18 行。

固定三條驗收均通過：六檔存在且內容檢查零錯誤；最終 18 筆量測沒有拋錯；每個情境均有勝方或死亡數大於零的 timeout。沒有擴張驗收範圍。每個最終 seed 都有命中，waitRatio 全為 0，沒有第一輪全滅。

只新增六個情境與本目錄 REPORT.md、measure.jsonl，交付共八檔，均低於 50 KB；未改既有內容、src 或地圖，未 commit。frames、monsters、persons 均先以 `git ls-tree --name-only HEAD content/base/{frames,monsters,persons}/` 核對為已提交檔。所有機體均有 innateAbilities，座位按 bodyplan 的 parts[].seats 配置；白手套全為 glove 機魂坐 soul 座。六局新摹機與新怪獸比例均超過一半。

四個參戰局明列 allies 與友軍 AI：獸潮為玩家 2／殘聯 6，菌床為玩家 2／達卡 4，劫艙為玩家 2／第七哨 4，護送為玩家 2／車隊 2＋鹽鷗 3；護送三個友方 slot 彼此均明列同盟。固定格配置均避開牆、塔與河道；月面暗光、菌林與碎鏡光照、三角洲潮汐直接繼承各地圖 globals。

## 產出

情境：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/`。量測：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-c/measure.jsonl`。下列結果順序為 winner／reason／rounds；null 表示平手。ScenarioDef 無 name 欄，作戰代號與劇情鉤子列於此。

- `scenario/lunar-blockade-run`｜`map/lunar-crater-36`｜player=faction/migrant-crew×2；enemy=faction/selene-whitegloves×2｜目標：reachExit({"target":"player-0"})/player/win；eliminate({})/player/win；eliminate({})/enemy/win｜**白月閉眼之時**：白手套封住月壤上的歸路，候鳥獵團要帶著未償的誓言穿過銀環。｜seed 1=player/reachExit/3（死亡 0）；seed 2=player/reachExit/2（死亡 0）；seed 3=player/reachExit/2（死亡 0）
- `scenario/beast-stampede`｜`map/mineral-waste-64x40`｜player=faction/migrant-crew×2；ally=faction/residual-league×6；enemy=faction/rift-insects×5｜目標：killTarget({"target":"monster/cliffjaw-red-eye"})/player/win；eliminate({})/enemy/win｜**赤眼踏碎群星**：殘聯大軍列旗於裂晶荒原，傭兵在狼潮中追獵赤眼兇星。｜seed 1=null/timeout/20（死亡 7）；seed 2=null/timeout/20（死亡 6）；seed 3=null/timeout/20（死亡 8）
- `scenario/dream-bed-burn`｜`map/mycelium-glade-32`｜player=faction/migrant-crew×2；ally=faction/dhaka-weavers×4；enemy=faction/rift-insects×4｜目標：killTarget({"target":"monster/bed-bellless-dream"})/player/win；eliminate({})/enemy/win｜**焚盡無鐘長夢**：達卡織旗踏進吞夢的菌林，獵團受託斬斷不肯醒來的菌床。｜seed 1=null/timeout/20（死亡 5）；seed 2=null/timeout/20（死亡 5）；seed 3=null/timeout/20（死亡 5）
- `scenario/mirror-choir-vigil`｜`map/shard-mirror-28`｜player=faction/migrant-crew×3；enemy=faction/rift-insects×2｜目標：survive({"rounds":10})/player/win；eliminate({})/enemy/win｜**碎鏡盡頭的晚鐘**：鏡肢與群喉在殼光裡唱出獵團的名字，候鳥必須守到第十聲鐘響。｜seed 1=enemy/eliminate/8（死亡 2）；seed 2=enemy/eliminate/8（死亡 3）；seed 3=enemy/eliminate/9（死亡 2）
- `scenario/unbound-raid`｜`map/delta-ruins-56`｜player=faction/migrant-crew×2；ally=faction/bay-seventh-post×4；enemy=faction/tide-faith×3；third=faction/rift-insects×3｜目標：eliminate({})/player/win；eliminate({})/enemy/win；eliminate({})/third/win｜**三旗爭奪囚月**：第七哨守著拘束艙迎擊解拘者，蟲群循著裂晶之光闖入三方戰火。｜seed 1=null/timeout/20（死亡 6）；seed 2=null/timeout/20（死亡 4）；seed 3=null/timeout/20（死亡 5）
- `scenario/siege-beetle-convoy`｜`map/convoy-road-80x20`｜player=faction/migrant-crew×2；convoy=faction/anvil-hunters×2；ally=faction/salt-gull-hunters×3；enemy=faction/rift-insects×4｜目標：escort({"target":"frame/anvil-ii"})/player/win；killTarget({"target":"frame/anvil-ii"})/enemy/win｜**雙契約下的鐵砧**：鐵砧車隊背著鹽鷗的救命債奔向晨光，候鳥收了護航錢，也接下同業的人情。｜seed 1=player/escort/2（死亡 0）；seed 2=null/timeout/20（死亡 5）；seed 3=null/timeout/20（死亡 4）

## 沒做到或證據不足的

固定驗收無缺項。這是三個 seed 的自動戰鬥證據，不能代表所有玩家打法或完整平衡。獸潮與菌床三個 seed 都是交戰後 timeout，尚無完成斬首目標的證據；碎鏡守夜三局均先觸發敵方 eliminate，尚無撐到第十輪的成功證據；劫艙三局均為有死亡的 timeout。護送 seed 1 已觸發 escort 成功，seed 2、3 則是有死亡的 timeout。沒有額外加 survive 勝利來替代指定目標。

## 需要決定的事

無阻塞本次驗收的事項。月面三局成功觸發 reachExit，使用 `params.target:"player-0"` 讓組裝器轉成規則讀取的 unit；玩家敗北與護送失敗均寫成敵方 win，避開 lose 將同盟誤列勝方的既有限制。

AI 對斬首目標的追擊與友軍配合仍需由後續 AI 線判讀：獸潮、菌床均有大量攻擊與死亡，卻未在 20 輪內完成指定 killTarget；這些結果不足以直接斷言 AI 完全不懂目標。護送沿用 def 目標：所有同 def 車隊單位存活到出口或撤離才算 escort；所有同 def 單位都死才算敵方 killTarget。一死一撤仍可能平手，屬既有目標語意，本線未更動。

## 以後交接書該點名的工具

`git ls-tree --name-only HEAD`（已提交單位白名單）、`src/rules/objectives.ts` 與 `src/sim/run.ts` 的 scenarioToSetup（目標與同盟真相）、bodyplan 的 parts[].seats（座位）、地圖 cells／features／globals（固定部署與環境）、`npm run check`（AI profile 等引用核對）、`node src/sim/measure.ts`、`wf/tools/inbox_poll.sh`、`wf/tools/inbox_mail.sh`。

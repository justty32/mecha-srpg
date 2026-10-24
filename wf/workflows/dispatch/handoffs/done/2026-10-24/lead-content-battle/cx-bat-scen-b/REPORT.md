# cx-bat-scen-b 完成報告

## 做了什麼

完成交接書指定的八個新情境，逐檔在專案根跑 `npm run check`，八次首次檢查及搶屍局調整後的第九次檢查均回傳 0，且為 `OK 0 errors, 0 warnings`；每檔再跑 `node src/sim/measure.ts scenario/<id> 1 2 3`，共 24 筆無拋錯。固定三條驗收均通過，沒有加驗收條件。

玩家為自營獵團，七個參戰情境明列 allies 與友方 AI，友方人數均大於玩家；巢核攻堅為玩家 2／盟軍 6。荒原總部署 22，低於 40。只引用已 commit 的允許機體、指定三種怪獸及原七人；機魂坐 soul、人類坐 pilot。固定格部署讓戰鬥從已接近前線的時點開始，避免大圖走滿 20 輪仍無交戰；車隊自道路東半段續行，只引用地圖既有東側出口。守城地圖既有補給碑保留可用，潮汐與光照繼承地圖 globals。

搶屍局首次部署三個 seed 都是 20 輪零交戰；移至西側開闊地並縮短接敵距離後，三個 seed 均有死亡，兩場 third 勝、一場 timeout。measure.jsonl 僅收最終部署的 24 筆。

本線新增 8 個情境＋REPORT.md＋measure.jsonl，共 10 個交付檔；所有檔小於 50 KB。未改既有檔、src、地圖或其他內容，未 commit。上線已寄 PROGRESS，每完成情境均輪詢 inbox。

## 產出

情境目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/`。原始 measure 欄位完整保留，只加 `scenario` 欄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-b/measure.jsonl`。下列結果順序是 winner／reason／rounds；null 代表平手。

- `scenario/breach-defense`｜`map/citywall-breach-40`｜player=faction/migrant-crew×2；ally=faction/residual-league×6；enemy=faction/rift-insects×12｜目標：hold(破口 zone，連續 6 輪)/player/win；eliminate({"slots":["player","ally"]})/player/lose｜**破曉之門**：殘聯戰旗守著碎裂的城門，獵團借盟約補給碑之火迎向蟲潮。｜seed 1=null/timeout/20（deaths 6）；seed 2=null/timeout/20（deaths 6）；seed 3=null/timeout/20（deaths 6）
- `scenario/delta-four-way`｜`map/delta-ruins-56`｜player=faction/migrant-crew×2；ally=faction/dhaka-weavers×4；enemy=faction/rift-insects×6；third=faction/tide-faith×3｜目標：eliminate({})/player/win；eliminate({})/enemy/win；eliminate({})/third/win｜**四冠映潮**：達卡織旗越過潮河，解拘者與蟲群爭奪水下醒來的王座。｜seed 1=null/timeout/20（deaths 6）；seed 2=null/timeout/20（deaths 5）；seed 3=null/timeout/20（deaths 5）
- `scenario/shell-excavation-escort`｜`map/ancient-shell-30`｜player=faction/migrant-crew×2；convoy=faction/shell-society×3；enemy=faction/selene-whitegloves×2；third=faction/rift-insects×3｜目標：escort({"target":"frame/infantry"})/player/win；killTarget({"target":"frame/infantry"})/player/lose｜**無名神的最後經卷**：白手套封鎖古殼，獵團護送帶著失落經卷的學者穿過獸影。｜seed 1=null/timeout/20（deaths 4）；seed 2=null/timeout/20（deaths 4）；seed 3=null/timeout/20（deaths 5）
- `scenario/nest-core-assault`｜`map/nest-core-72`｜player=faction/migrant-crew×2；ally=faction/residual-league×6；enemy=faction/rift-insects×7｜目標：killTarget({"target":"monster/nestmother-landlord"})/player/win；eliminate({})/enemy/win｜**剜去深淵之心**：殘聯大軍深入層疊巢殿，傭兵直指盤踞其間的房東。｜seed 1=enemy/eliminate/20（deaths 14）；seed 2=null/timeout/20（deaths 9）；seed 3=null/timeout/20（deaths 8）
- `scenario/convoy-run`｜`map/convoy-road-80x20`｜player=faction/migrant-crew×2；ally=faction/bay-seventh-post×4；convoy=faction/bay-seventh-post×2；enemy=faction/rift-insects×6｜目標：escort({"target":"frame/hound-mk2"})/player/win；killTarget({"target":"frame/hound-mk2"})/player/lose｜**候鳥歸向晨星**：第七哨護送最後一支車隊奔向東方，伏蟲在荒路兩側敲響獵鐘。｜seed 1=enemy/killTarget/19（deaths 8）；seed 2=ally/killTarget/18（deaths 6）；seed 3=ally/killTarget/18（deaths 7）
- `scenario/beachhead-landing`｜`map/beachhead-44x36`｜player=faction/migrant-crew×2；ally=faction/bay-seventh-post×5；enemy=faction/rift-insects×6｜目標：killTarget({"target":"monster/reaper-c"})/player/win；eliminate({})/enemy/win｜**潮冠登岸**：第七哨趕在潮冠升起前攻上巢岸，獵團要斬斷守門鐮肢。｜seed 1=null/timeout/20（deaths 6）；seed 2=enemy/eliminate/17（deaths 7）；seed 3=null/timeout/20（deaths 6）
- `scenario/badlands-sweep`｜`map/badlands-128`｜player=faction/migrant-crew×2；ally=faction/residual-league×8；enemy=faction/rift-insects×9；third=faction/anvil-hunters×3｜目標：eliminate({"slots":["enemy"]})/player/win；eliminate({})/enemy/win；eliminate({})/third/win｜**荒原群王的獵宴**：殘聯圍剿裂縫之口，鐵砧獵團趁戰火搶奪巨獸遺骸。｜seed 1=null/timeout/20（deaths 12）；seed 2=enemy/eliminate/19（deaths 13）；seed 3=enemy/eliminate/17（deaths 13）
- `scenario/rival-claim-jump`｜`map/rift-edge-60`｜player=faction/migrant-crew×3；enemy=faction/salt-gull-hunters×3；third=faction/rift-insects×3｜目標：eliminate({})/player/win；eliminate({})/enemy/win；eliminate({})/third/win｜**鹽翼分屍之約**：鹽鷗與候鳥在裂縫邊爭索獵物，殘存蟲群仍守著未冷的屍山。｜seed 1=third/eliminate/15（deaths 6）；seed 2=third/eliminate/19（deaths 4）；seed 3=null/timeout/20（deaths 4）

## 沒做到或證據不足的

驗收無缺項。這批是三個 seed 的自動戰鬥證據，未宣稱所有劇情目標都能被現行 AI 完成，也未做超出交接書的遊戲平衡或 UI 驗收。守城、學者護送等情境可能以有死亡的 timeout 通過；這是交接書允許的平手，不是達成守點或護送的證據。

## 需要決定的事

無阻塞本批驗收的事項。車隊局三個 seed 均因車隊全滅觸發 killTarget／lose，其中 seed 2、3 的 winner 顯示 ally，屬下述既有規則限制，不能解讀為護送成功。後續 AI 目標意識線可參考：守城三個 seed 未累積滿六輪守點；學者護送出現撤離指令，仍未觸發所有學者存活撤出的 escort。AI 是否會主動協同守點、護送尚不能由目前結果證實，不用情境偷偷添加 survive 勝利補救。

`src/rules/objectives.ts` 的 lose 會選仍有 active 單位的其他 slot 字典序第一名，未排除同盟；因此把護送失敗寫成 `for:player/onComplete:lose`，仍可能顯示 convoy 或 ally 勝利。守城敵軍殲滅守軍的敗北條件以 `eliminate.params.slots=[player,ally]` 配 `for:player/lose` 表達，避免把 enemy 自己判成敗方。後續需規則線決定 lose 的勝方語意，本線不改 src。

同 def 多個目標必須全部死亡才觸發 killTarget；學者一死而其他撤離，可能既不能護送成功，也不會達成全滅敗北，最後 timeout。此批遵守交接書指定 def 目標，若期望「死一人立即失敗」需另由規則／設計線決定。八個情境的作戰代號與劇情鉤子只放本報告，ScenarioDef 沒有 name 欄。

## 以後交接書該點名的工具

`git ls-tree --name-only HEAD content/base/frames/`（允許機體）、地圖 cells／features 解讀（固定格可通行性）、`src/rules/objectives.ts` 與 `scenarioToSetup`（同盟、def 目標及 lose 真相）、`npm run check`、`node src/sim/measure.ts`、`wf/tools/inbox_poll.sh`、`wf/tools/inbox_mail.sh`。

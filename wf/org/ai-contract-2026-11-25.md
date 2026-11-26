# AI 三項整合邊界

依據：ai-audit-1125兩輪唯讀回信與search-design-1125回信；原文在incoming-2026-11-25.jsonl。這是切片記錄，不取代使用者裁決或已發布spec。兩個審查工均已回收，未跑測試。

## 出口

舊圖契約不重問：共用exits非空時，抵達可完成reachExit/escort，即使noRetreat；exits空時，四邊僅可下Retreat，單純站邊界不完成任務。目標已retreated短路保留；擊退判勝不動。

擬採兩查詢：exitsFor(s,slot)只回明列/物化派生的目標出口，未列slot則回rt.exits，忽略noRetreat、不補四邊；retreatCellsFor(s,slot)在noRetreat回空，其餘沿出口與舊圖四邊fallback。09:06使用者授權main自行設計，採新slot明列[]刻意無出口，兩查詢均空且不fallback；見design-delegation-2026-11-25.md。

兩查詢回副本、不初始化runtime、不改state/RNG。目標取o.for；逃逸取己方slot；UI經BattleSession.rulesQuery、AI經RulesQuery/adapter。RulesQuery採必填方法，adapter及stub原子補齊；主線rg在src/test找到的直接實作只有這兩處。stub查詢與exec歷史行為不可混為同一變更。

部署區最近邊派生已獲舊裁決：放scenarioToSetup（sim），rules只讀。對缺手標且非空部署區slot，四邊距離總和比較，同距以固定順序（left/right/top/bottom）處理；slot排序、格y/x排序，不用RNG，不改ContentDB來源。共用出口一格不等於同側整邊，故不作『同邊即省略』最佳化。缺部署資料不捏造。

基礎線先接欄位/schema/save/queries，不啟用派生；待AI/UI/MCP消費者都改用slot再整合啟用，否則規則新出口與AI舊出口不一致。直接BattleSetup不重派生，舊save缺欄位不自動補。schema維持additionalProperties=false，新增欄位仍須合法形狀。snapshot/setup新增字典要驗形狀，不是放寬未知欄位。

## 撤退

第一切片只改整隊intent條件與測試：impossible && (ratio低於giveUpRatio || loss達giveUpLoss)，刪intentImpossibleRatio；leaderLost、個體本能、已撤退黏著記憶、minRound/noRetreat不變。出口escape估算後續整合，不把此切片報為三項完成。

## 搜索（09:06已授權自行設計）

兩矛盾：無部署資料設計說原地、測試說中央；已搜過換站與無狀態純函式無法僅憑目前距離保證不折返。已依使用者新授權採原地＋進度記憶；具體派工契約見dispatch/handoffs/ai-search-1125.md。

現有Agent.memory可承載可序列化航點身份/已搜集合；index.ts保留既有Agent，strategy記憶則是closure。propose/score不可改狀態；若採記憶，須用外層reducer在首次決策/成功執行後提交，不能只靠onExecuted（前置move成功、主命令失敗會漏更新）。tactical/berserk/score三讀者共用只讀進度；動態單位排名不可讓歷史陣列index變義。

runBattle建立新AI；rules replay只重跑指令，不還原Agent/RNG/strategy。BattleSession會預算整台回合再逐指令顯示，記憶會先於畫面推進，不能在drain再更新一次。當前SaveFile沒有AI續局真相；任意中途snapshot可完全續局不是本次隱含承諾，若要求則需另立架構裁決。最低回歸須含runBattle/session commands+hash一致、rules replay、rerunAiAndCompare、拒絕/部分成功/重複觀測冪等及純讀無偷讀。

## 驗證證據

基線34場全數完成，來源02f246f3，產品在量測期間未改。改後必須獨立目錄；未commit時HEAD相同，不能用HEAD分組取代隔離。首Hit/Miss全在第1輪，不能代表每台鐮肢都接敵或未停滯。原腳本撤離位置來自終局unit並明標terminal-unit，不是事件原生座標。保留失敗log與17項載入warning，未調查不稱無警告。

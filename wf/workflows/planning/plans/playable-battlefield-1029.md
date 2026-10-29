# 可互動戰場執行計畫

[規格](../specs/playable-battlefield-1029.md)｜[測試規矩](../../testing.md)

## 步驟

設計線終局釋放席次，隊長派引擎與UI兩線，全樹最多3工人。預估實作超20檔，需在派工時擴件數gate；設計線僅新增spec／plan／REPORT三檔。

引擎線獨占 `src/core/types-def.ts`、`types-state.ts`，`src/content/schema.ts`及必要的lint.ts；`src/rules/attack.ts`、`command.ts`、`flow.ts`、`index.ts`、新`battlefield.ts`與測試；`src/sim/run.ts`及必要的session.ts。用hooks接死亡避免循環依賴。內容精確落點為 `content/base/rules/constants.json`、`maps/playable-battlefield.json`、`scenarios/playable-battlefield.json`、`effects/battlefield-resupply.json`、`frames/battlefield-support.json`、`abilities/battlefield-support.json`。新能力提供正式拆牆路徑，定義見spec最後一節。

UI線獨占 `src/ui-adapter/vm/types.ts`、`viewmodel.ts`、`controller.ts`、`text.ts`及必要的session.ts，`dom/board.ts`、`panels.ts`、`style.css`和相關測試。DOM不import規則；core契約已在spec凍結。地物可直接點格，不強制選單位／部位；多物件同格逐項列出。main.ts等營運存取線交還後才改正式情境入口。

營運 `src/ops/sortie/scenario.ts` 及其測試由隊長協調唯一寫入者；generateScenario把內容配置的補給與可破壞features注入mapDef，避部署／出口／既有目標。scenarioToSetup必須保留objects。不要將無來源支援隊任意塞進所有營運任務；正式情境先保證可玩。

## 命中驗證

常數改前後由隊長各排一次 `nice -n 19 node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5`，固定內容版本、情境、seed、AI、round limit，記git HEAD／工作樹差異與內容hash。保存hits/misses/hash/rounds/winner，不改黃金。現有measure含友方必中，因此只做粗基準；細分另由單檔probe排除roll=null，分玩家／敵方、普通／指定部位報告。全局AI戰況會因命中改變，只作描述統計。

固定狀態單元比較DB bonus0/15：actor、target、能力、距離、cover、aim完全相同；未封頂理論機率差精確15點，UI顯示等於事件chance。近中距離普通射擊參考60–85%，若仍普遍不足60先報分項原因；15不是已驗最佳值。需要抽樣時每案例至少200個相同seed獨立單發，禁止拿不同戰況的實際命中差當純因果。量測前先核對人物指令權／能力來源，不能以bonus掩蓋接線錯誤。

## 功能驗證

規則測cell／ball每格一次、單體選unit不傷地物、一般武器明選cell可傷地物、40hp壁壘兩發變瓦礫、cover35變15後同條件機率增加20點（上下限例外）、LOS與移動成本即時改變；preview不能改狀態，同seed重播hash一致。

拾取測實際charge+20與上限、AP1、遠距／重複／滿池拒絕無副作用、clone預覽不領走物件。遺體測怪獸corpse／機甲wreck／徒步排除、同格共存、生成一次、舊存檔缺objects相容。測試必須在移除實際扣hp或pool變更後變紅，不只檢查事件文字。

UI測正式情境點格拆牆、hp與新瓦礫顯示、拾取走submit與資源變化、支援單位有可用爆破能力、迷霧內遺體不洩漏。營運測生成→組裝→出戰→返回，確認保留objects與features。

本線未跑任何測試。以下全部待隊長排程，且同時只有一個程序：先 `nice -n 19 node --test --test-concurrency=1 src/rules/battlefield.test.ts`，其後實際受影響單檔；UI必跑test:dom、build、test:e2e。全套與 `bash wf/tools/wf-lint.sh --strict .` 由隊長收件後整合。歷史9敗先比對基準，不混報本輪回歸。

最終提供正式情境網址、可操作項目及實際回收入庫證據；使用者僅剩手感／辨識與入口評閱。這不是整款遊戲已完整驗收的宣告。

## 新裁決驗收追加

引擎擁有throwDebris與salvage；營運線接 `src/ops/sortie/apply.ts` 並驗owner過濾、撤離所得、容量溢出、怪獸拆解去重。UI新增拾碎石／投擲／回收殘骸／回收屍體按鈕及真實收益預覽。測試需從正式情境完成拾石→投擲實傷、殺敵→回收→戰果材料→營運stock增加，且同結果重複結算不重領；一般槍擊明選牆需獨立測。只看物件名稱或事件不算驗收。

戰果欄位已固定：BattleResult.loot項可選owner與collected，已拾材料帶collected:true與拾取owner，fromUnit保持真來源；ops apply.ts跳過該屍體延後二次回收，非玩家排除，舊loot缺欄保持舊語意。

# playable-design-1029 設計交付

> **子線階段報告。** 最終整合驗證及交付見[主REPORT](../lead-playable-1029/REPORT.md)；下文保留當時交接狀態，並非最新整體待驗清單。

## 做了什麼

親讀AGENTS、WORKFLOWS及適用開發／測試／規劃／使用者偏好／資料契約。唯讀檢查core、rules、sim、UI、營運情境與content。證實地物hp只有初始化無傷害消費者，固定命中公式扣項可累積成低命中；後者尚未量測實際玩家分布。先透過原生工具交付契約與分工，再完成文件。沒有改產品碼、沒有測試、沒有子代理。

## 產出

[spec](../../../../../planning/specs/playable-battlefield-1029.md) 與 [plan](../../../../../planning/plans/playable-battlefield-1029.md) 已落地。凍結MapDef／MapState.objects、interact Command、地物結算與死亡遺體契約；精確區分引擎／UI／營運檔案所有權。規劃正式情境、營運出戰注入、真實補給效果與友方地面支援。共新增3份文件，容量遠低2 MB。

## 沒做到或證據不足

沒有執行任何測試、平衡探針或wf-lint；不宣稱通過。attackAccuracyBonus=15是可重現驗證候選，並非實測最佳值。地面支援不能原樣使用無能力的infantry；舊bf-field-resupply只emit事件，不能拿來當已完成補給。已在spec標記必須補齊的真實效果與內容。沒有裁定Fable三題、已依新裁決設計明確回收材料入戰果，未執行實作。

## 需要決定

隊長接受契約並排程實作／測試；實作預估超20檔，須在交接明確擴件數gate與唯一寫入者。後續工具為node單檔、既有measure.ts、npm UI驗證及wf-lint，具體指令與判準在plan。使用者僅需最後評閱手感，無前置產品決策阻塞本輪。支援可指揮爆破彈攻擊單位或牆，拾取實際回charge20；新裁決要求碎石可投擲、殘骸回scrap、屍體回flesh且入營運庫存；已覆寫spec並通知engine。完整遊玩仍須本輪補齊battleResult回收材料、Fable三題、歷史9敗及營運全流程待驗，已於spec明列。

## 本輪後續發想與代表編組補充

新增 [物件與生態發想](../../../../../planning/specs/battlefield-object-ideas-1029.md)、[本輪編組](../../../../../planning/specs/battlefield-roster-1029.md)，7列物件與20列生態另存本目錄wf-table資料檔並經tabledb寫讀。已區分實作底座、此次追加代表編組與新機制候選。實查AT-12／GL-02／追矢匣與三怪獸可重用；墜星與獵甲追矢已有los=false，不再誤稱完全沒有越障火力。後續核真AT-12／GL-02帶mech/lineage，撤回純重用frame方案；最終新增共用常規車體、3frame、map/scenario共6內容，core:false且走component能力避免innate被isDriven過濾。普通sol負責產品碼。未跑測試，所有動態完成條件仍待隊長排程。

## 預設二十回合平衡設計追加

新增 [平衡契約](../../../../../planning/specs/demo-balance-1029.md) 與 [量測計畫](../../../../../planning/plans/demo-balance-1029.md)。採正式demo-hardclash profile接兩slot，局部Scenario rules補無人scripted缺省accuracy，不抬全部舊情境或玩家機體。要求A原bonus0、B此前+15、C修缺省＋節奏三組固定20seed與保留組，真default頁同seed可重現，timeout不算勝負。已提示混合B盾甲高抗性及爆破步兵誤當精粹的語意風險；只查碼，未跑probe或測試。

硬剛策略追加核讀：intentMinRound預設8會繞過舊retreatMinRound999整隊撤退；已凍結六參數封住意圖／HP／首領死／輪替通道，逐筆撤退分類與breaking/fleeing差異已提報。未跑測試；舊9回合smoke不算硬剛通過。

最終使用者覆寫：default demo以既有noRetreat規則禁止撤離，新增Scenario rules選填bool橋接，A/B/C同用，任何retreat/eject失格。撤回breaking例外提案，士氣效果保留；已同步engine與spec/plan。

全殲裁示已升為最高斷言：原default四對四至少一方原始四id全部dead、各有UnitDied、alive0且≤20回合；winner本身不足，撤離／棄機均失格。已通知engine輸出逐陣營終局狀態，並提示輝光步槍毀損後凡鐵頭吼無法傷生物機內層的尾局風險。候選仍依實際能力／資源／真傷逐步調整，設計線未跑測試。

已唯讀抽取engine四組regen15煙測精簡摘要，否決繼續盲抬武器。新增core-lethality-evidence.md，凍結A核心曝光×2、B再最後致命結構層75%，共同基線local45/regen15/radiant22/cleave20，先固定三seed再擴樣本。已查共享引用13定義並同步engine；不跑測試，未宣稱新候選有效。

已將合併新契約正式落planning/specs/combat-aim-injuries-1029.md（幾何／功能／傷勢／UI query）與combat-defense-1029.md（真盾承傷／有限招架），各小於8KB；舊demo平衡文已標明命中／曝光候選被新規格取代，原4v4全殲驗收保留。所有逐欄數值已同步engine/UI，古代無charge不加無效power部位。此時兩線實作中，設計不宣稱通過，未跑測試。

新增正式combat-part-hits-1029.md並同步engine/UI：spread有限份額與penetrate真remaining遞減、body鄰接圖、單次命中、部分盾攔截、visited／一次準備消耗、三個真代表與UI預覽。七圖已精確交UI；目前unique112估新增2主要檔後仍在140內。尚未跑多部位測試或新20批次，契約不代表已驗收。

新增combat-movement-1029.md，獨立moveSpent、普通4/重3/快5、地形/已校負載/支撐結構傷修正、Wait與存讀契約及UI query皆已同步engine/UI。唯讀確認species frameView需傳新欄、真正pos寫入只moveAlong，reaper-charge不位移。舊25/25必重驗；本線不跑測試。

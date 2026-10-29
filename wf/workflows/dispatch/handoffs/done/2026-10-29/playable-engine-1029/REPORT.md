# 可互動戰場引擎交付（最後移動增量驗證中）

> **子線階段報告。** 最終整合驗證及交付見[主REPORT](../lead-playable-1029/REPORT.md)；下文保留當時交接狀態，並非最新整體待驗清單。

## 做了什麼

真地物傷害與崩塌、獨立補給／碎石／殘骸／屍體、回收與投石、正常死亡／戰果loot、營運地圖配方接線已落。成本與引用先完整驗證，拒絕不改AP／RNG／狀態；預覽與保存重播共用實判。凡鐵投石沿既有外甲倍率／內層不可及限制。

使用者後續凍結的新命中／傷勢／防禦／多部位契約亦已實作：等效圓幾何替代舊+15與5/95、實際橫移與預付側閃；真器官禁用、移動肢體最低數、失血vital耗盡死亡；真盾承傷／有限招架／過載；spread有限總量、penetrate真remaining沿圖推進、單命中單crit與單防禦消耗。公共partTargetInfo由有效body與clone推導防護、後果、死亡、有限波及與盾入口，UI不自行捏造。

## 產出

精確產品檔案見[修改清單](changes.json)；UI/data共同修改的鐮劈JSON，本線只調packet20→28。正式規格見[命中傷勢](../../../../../planning/specs/combat-aim-injuries-1029.md)、[盾與招架](../../../../../planning/specs/combat-defense-1029.md)、[有限多部位](../../../../../planning/specs/combat-part-hits-1029.md)。未更動legacy／art、未commit/push。

隊長已驗相關命中／部位／血死／器官／盾／存讀單檔；多部位核心4檔20/20、此前實判5檔28/28、盾準備與motion真存讀重播皆綠，資料schema/typecheck也綠。曾失敗的corpse假fixture已改真敵／真開戰／保留第二敵並再驗通過，不放寬產品支付或戰局規則。

移動增量前的歷史固定樣本曾達：[正式20＋保留5結果](DEMO-BALANCE.md)。原白手套4對4、同正式profile與資料，25場均二十回合內殺死敵方原4個id、0 timeout／拒絕／撤退／棄機。來源／配置hash與原始記錄在[彙整資料](formal-summary.json)，不是20回合截止冒充勝負。舊HP／曝光／regen／主槍候選未採。使用者最後追加整個自身回合的五級2–6移動額度，已落moveSpent、terrain/load/腿結構折減、Wait/AP/save不洗額度與純query；舊25場明標歷史，最新需重驗。

## 沒做到或證據不足

25場均player勝，未證雙方均勢或所有任意seed／玩家手動策略都二十回合內。[混合場](demo-formal-mixed3.jsonl)3場皆敵勝（9／6／9回合），玩家3死2退／3死2退／2死3退，0timeout／拒絕／棄機；已如實列偏敵風險，未額外改數值。實際預設頁同seed觀戰與最終完整suite由隊長接續，不把舊206案部分結果當全套通過。機制與資料有行為變更，未重錄歷史黃金。

## 需要決定

目前僅最後移動必要增量解凍，其餘產品／數值維持凍結；等相關反例與新3→25樣本重驗後再終局。無新增架構裁決。保留正式頁手感、部位可辨識性、拾取／盾／招架操作給使用者實機評閱；本線只報已量證據。

## 最新十回合驗收（取代前述二十回合目標）

最新採固定原4對4、五級整回合移動、原HP／曝光／初始資源；僅鐮肢劈斬AP4→3、傷害36→40。AP成本調整針對真實AP6每回合只能出一次AP4攻擊的尾段瓶頸，不改勝負或傷勢門檻。severity audit定義核心結構／vital生命≤30%，或至少兩個重要部位永久破壞且真喪失移動／傷害能力；外甲、資源、暫時狀態不算。啟動自檢15/15綠，故意把健康判重傷的反例exit1。

[固定20種子](demo-severity10-calibration20.jsonl)20/20在7–10回合達到敵方原4個id全滅或剩員全重傷，全部0撤退／棄機；真正全殲7–11回合（seed12重傷第10、全殲第11）。每列包含首次門檻前後真實Layer／Part／生命事件與各unit核心／vital比例、永久失能原因，並單次重播核state hash。配置791b31e4c57a0d99，來源3bb7b93d684c745db987e910e7d924be26d04c4ab2a8f81098828d55856dcef7。保留5種子仍驗證中，尚不宣稱25/25或最終完整suite。

保留5種子已完成：[原始證據](demo-severity10-holdout5.jsonl)。101／137／211／307／509首次與真全殲均為11／6／10／8／8回合，因此保留4/5、合計24/25達新十回合目標，不能稱全部通過。失敗101敵方最後enemy-3於第11回合首擊前核心結構82%，主片28點後降至26%才成立A路重傷，之後同回合殲滅。沒有藉保留種子改門檻或再fit；所有場次0撤退／棄機。唯一runner已釋放給隊長／ops；AP3／amount40數值暫凍，完整suite與真頁仍待整合線。

後續經隊長授權唯一候選AP2／damage40已四小樣1／7／13／101全通：首次與真全殲6／7／6／8回合。完整commands及101第8–11回合追擊trace保存在[小樣](demo-severity10-ap2-smoke4.jsonl)。trace顯示101第8回合player-2實際AP7→5→3連兩擊後終局，校正先前把舊末段AP推定為6的因果說法；不能用該推定冒充逐步證據。default四個bodyplan各僅一core，故audit合計與規格any-core等價；未宣稱多core場景覆蓋。原25已轉回歸，真正新保留預先固定607／701／809／907／1009，尚不依其結果調值。

## 最新完成：AP2／傷害40

經授權僅再降低鐮肢劈斬AP3→2，保持傷害40、門檻、五級移動與原編組／部署／資源不變。[原25全回歸](demo-severity10-ap2-regression25.jsonl)25/25首次達標5–9回合，真全殲同為5–9回合，0拒絕／撤退／棄機。原101／137／211／307／509如今屬回歸，不能再當未見保留。

事前固定且此前未看的[新保留5](demo-severity10-ap2-newholdout5.jsonl)：607／701／809／907／1009首次為6／6／8／6／9，真全殲6／6／9／6／9。809首次唯一活enemy-1核心結構22.8%，1009為enemy-1核心18%，均真A路；其餘首次即原4死。五場均enemy先受壓，0拒絕／撤退／棄機。因此新配置30/30在九回合內達固定十回合目標，且九回合內真全殲；此為有界樣本證據，不保證任意種子或對稱均勢。

配置hash d77becb3755551b8，來源hash維持3bb7b93d684c745db987e910e7d924be26d04c4ab2a8f81098828d55856dcef7。產品同步僅reaper-cleave的cost.amount=2與packet.amount=40；其餘資料不動。runner已釋放，不再啟新測試／混合批次；最終完整suite與真頁由隊長排程。多core audit未宣稱覆蓋，default每台只有一core。

## 黃金戰役兩fixture有界診斷

本輪未更新黃金hash，也未改產品／語義斷言。merc原day37 accept363時contract不存在，後續sortie因pending-choice未消費record；betrayal原66其實變成scout，62是residual-league actor join。實試62→drop62→63不能修：63為同operation敵方offer，accept62時已被正式side-chosen規則標expired，day6–13也沒有另一offered join，故候選被拒。已恢復中間稿，兩fixture與golden-spec無淨修改。

merc合法候選一day23接260但抵達前operation已結束、battles0；候選二先航至ridge鄰格，接261／operation2後7場真runSortie並day38結算join-pay1500，真result每場3台attached全部alive，因此attachedLoss0，沒有採用。最後assault／clear-only自然等待至day101無可接目標，停止有界搜索。不能把alive改dead或用新hash掩蓋損失語義不足。臨時診斷工具保留於編譯樹外/tmp/playable-fixture-tools，未加入產品test，也未改tsconfig。

## 黃金契約fixture最終修復（取代上段未解狀態）

root澄清並授權原merc就是預錄外部runner結果的mock契約邊界，不能將其混同自然AI死亡驗證。依已證合法flow重錄：原69命令改54；原day37接受363／operation5改day23接受261／operation2；新增開場航至ridge鄰格，保留接受→Arrived(ridge)→BattleResolved→OperationResolved→JoinSettled順序；四場sortie依序266／270／273／277（29–32日）。每場先真validateSortie／generateScenario／prepared setup，使用當場真參戰ID、frame/species、owner、body及crew；原受控死亡結果只重映射到存在的enemy與longspear attached，隨真軍隊扣員後不憑空補參戰者。這是受控結果的ops回寫測試，不是四場自然AI戰死實證。最終attachedLoss800、join-pay700且有ref，day35結算，原兩斷言全部保留。

betrayal原11命令（等待6天、普通scout66/drop66、join62）改為3命令：accept53→drop53→accept55。fixture-only setup用真onMuster API建立兩個明確敵對seize operation於ridge，factions40；53為residual-league原operation actor、55為tide-faith另一operation actor。未直接emit Betrayed、聲望或黑名單；所有接受／退約資格與背叛均走原產品規則。保留原事件順序、player-betray聲望-40及residual-league黑名單有效期限斷言。這是受控初始條件契約測試，不能稱自然campaign/page事件證據。

/tmp隔離兩案原完整語義2/2綠（6.5s），之後不設GOLDEN_UPDATE原樣重播再2/2綠（7.7s）。merc新hash8b012bc9ecba8673／897events／day35，舊5f4014ad02b75c28／1299／day50；betrayal新6d984024979a7031／159／day0，舊db09bf4e32f144ad／259／day6。舊hash備份於/tmp/playable-fixture-tools；新hash僅/tmp，由隊長持有同步，主樹hash本線未改。臨時helper全部在編譯樹外，runner已釋放。本線47產品＋43附件＝90/90，無新增附件。

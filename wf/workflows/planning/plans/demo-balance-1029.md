最新執行入口：[十回合全殲或全員重傷固定判準](../specs/demo-severity-1029.md)。先同cleave36 seed1/7/13分別量首次重傷與真全殲，再做新20+5；下列舊二十回合流程只作歷史。

# 預設交戰平衡執行與量測

[契約](../specs/demo-balance-1029.md)｜[測試排程規則](../../testing.md)

## 分工與順序

astra只設計；sol建立探針、調產品資料與最小準度接線。隊長目前full suite仍佔唯一程序，任何probe、單檔、npm均不得同跑；先可做讀碼、寫檔及靜態檢視。測試皆nice -n19、低concurrency，不另開worker。

探針建議 `src/sim/demo-balance.ts`（若隊長選test/sim下亦可，但固定一入口），讀正式content loader、scenarioToSetup及runBattle，不複製傷害公式。輸出每seed JSON到本輪報告目錄，不把大表貼md。產品接線為core/types-def.ts、types-state.ts、sim/run.ts、rules/flow.ts及contribs.ts／測試，內容為demo情境局部rules與新aiprofiles/demo-hardclash.json；constants維持fallback0，其後只有實測必要的spec列出content路徑。記錄基線HEAD、工作樹diff、內容hash與probe參數；同隊伍其他線內容在變動時，先凍結比較版本。

## 樣本與通過門檻

開發固定seed1至20；獨立保留seed101、137、211、307、509，先宣布且不看結果挑seed。原情境、同樣隊伍、同樣地圖與初始資源，僅量測round limit覆為60。前後20seed每場都要保留round、winner、reason、stopped、hash、commands數與rejected；輸出min／median／p90／max、player/enemy勝場、≤20真勝場、>20真勝場、timeout／stalled／maxSteps。timeout算未完，不能算平手已完成。真正規則平手另列。

通過為20/20開發seed及5/5保留seed都在≤20至少一方原始四unit全部dead且alive=0，並有非timeout勝方，且無執行錯誤或非預期拒絕。保留組失敗就不能標完成；若基於保留結果再調整，該組已成開發證據，另先宣布5個新保留seed再驗。固定20不是只看平均20。

先跑A=bonus0/fallback0、B=bonus15/fallback0各20seed；候選試調可用1、7、13三seed快速排除明顯失敗，不能以三場取代完整前後。找到最小候選後完整20，再保留5。省掉無理由重跑，禁止20seed並行。主目標通過後才少量驗mixed `scenario/combined-arms-battlefield` seeds1、7、13，以及原default原tactical／berserk各3場作風險對照；混合場不要求此輪同達20，但報全滅一面倒、長期無傷／不能行動等嚴重失衡。

## 為何慢的證據

每場同時計首個傷害回合、各round Hit/Miss（排除roll=null友方必中）、LayerDamaged總量與擊殺、遠控／玩家分組命中、普通身體／精準部位／遠距掩體分類、move／end／wait／support／attack指令數。事件型別以現有events實查，不猜名稱。以TurnStart快照或每次指令前後記可用AP、charge、heat、可見敵人與合法攻擊數，區分接近期間、射程已到但缺池、武器毀損、純策略不打。

至少抽出一場超20的命令trace與3個無攻擊回合的合法性理由；有可合法傷害行動卻只end不能歸咎命中。彙整遠控accuracy基礎前後與玩家不變的固定狀態；精準部位與掩體差值仍存在。不要把AI頻繁低傷射擊的回合數誤當已積極有效輸出。

## 必要驗證與結案

準度單檔須覆蓋無人scripted且缺accuracy得到fallback、顯式accuracy0不覆蓋、person存在不加、怪獸instinct不加、負面contrib仍扣、舊包無常數回原值。數值候選驗正式JSON解析與既有相關規則；不重錄黃金，歷史失敗與新回歸分開。

結案交付精確產品diff、前後20seed及保留組資料、真勝負分布、慢局根因、混合場風險與玩家仍需實機評閱項。若20內真終局未達，就明說未達，不能用產品rounds20、改勝負判定或僅展示勝場掩飾。設計線此刻未執行測試，文件不代表結果。

實際default頁驗收：以原預設URL加spectate=1/anim=off，核載入skirmish-whitegloves與demo-hardclash兩方profile，seed取保留組至少一場，頁面結果與headless同seed一致、真勝方≤20。測試不得以更換scenario或window私改AI過關。正式rounds20檢查winner而不僅battleDone。

## 意圖漏洞後的重跑規則

先前9回合、3retreat／1death的smoke與由此衍生候選不作通過證據。更新六個正式profile意圖參數後，由隊長只排一場smoke，逐筆Retreated記當下人物morale、intentMode、round與剩餘單位；所有任何撤退須先解釋／修正才排批次。原三組資料若用舊策略，全部標舊契約不可與新profile混比。不要動既有戰果規則來美化結果；士氣效果保留，但任何退場或棄機都使該場失格，不以fleeing例外通過。

最後裁示：ScenarioDef.rules.noRetreat選填bool經sim/run到既有BattleSetup.noRetreat；僅default demo true、brief公開正面交戰不撤離。A/B/C同規則。schema與傳遞必驗true/省略兩路；既有其他情境可撤退保持原樣。不得新增retreatOnBreaking。

## 全殲最高斷言

每seed各slot輸出原始四台的alive/dead/retreated/derelict/captured/ejected與reason；四個唯一UnitDied對應四個原始id才算全殲，不能只驗winner。任何撤離／棄機失格；失能仍活不是死亡。default頁也核相同終局state／死亡事件。先前seed1無撤退53回合殲滅只能算慢局證據，未達≤20。空轉修正後先同seed比指令與實傷，再逐一試content資源／傷害候選，不在probe加傷害。

## 核心致命比例候選的下一步

以 [精簡證據](../../dispatch/handoffs/done/2026-10-29/playable-design-1029/core-lethality-evidence.md) 的A/B替代先前逐個抬主武器方案。先固定1/7/13各三seed，所有非候選數值相同；記武器失能、斷腿、核心剩HP及死亡時點，驗長尾是否真正縮短。A/B未見改善前不排75局；選中後再正式20＋保留，主要分布期望10–16、最大20。13個共享frame/species影響需在報告揭露並做最小交叉驗證。

最新移動裁示依 [combat-movement](../specs/combat-movement-1029.md)：普通每自身回合4、重3、快5，累計moveSpent不受Wait／AP恢復重置。舊25/25屬舊移動歷史，正式新量測須於budget接線與單檔反例過關後重跑，不沿用舊結論。

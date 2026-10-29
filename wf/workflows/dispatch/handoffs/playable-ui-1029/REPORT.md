# 真實戰場互動 UI 交付

> **子線階段報告。** 最終整合驗證及交付見[主REPORT](../lead-playable-1029/REPORT.md)；下文保留當時交接狀態，並非最新整體待驗清單。

## 做了什麼

接入地物 HP、一般武器選格破壞與明確「攻擊地物」指令（同格有單位亦可明選地物）；格內標記及資訊卡說明回收物種類、來源與收益。回收與投石均經原 session.submit，按鈕可用性走 session.preview；補給滿池與距離不符有禁用原因。攻擊目標預覽從同一 preview 的 Hit/Miss chance 顯示。死亡物件只在玩家觀測範圍內公開，再保留已知物件。

延伸代表編組：新增無機甲核心、無機魂席、無流光池的常規履帶戰車、飛彈車與排熱工程車，使用既有凡鐵配件實彈與排熱能力。與燕鷗、爆破班及三類怪獸同場；不聲稱拖救、修甲或實體多格尺寸。正式頁首情境選單可選預設／回收／混合兵種，保留營運頁 lazyPage 修復。

不可撤離收尾：controllerForScenario 對 rules.noRetreat 的標題附加「正面交戰・不可撤離」，保留內容原名；新增一條有／無旗標的純回歸。

幾何命中／傷勢延伸：部位選單改為命中率（1位小數、100%必中）、剩餘各層防護、功能、破壞後果及幾何因素卡片；普通射擊同列比較。機率沿原preview，後果沿sim partTargetInfo純query；敵方離視野只顯最後所見防護，不讀現時HP／裝配。新增7bodyplan半徑、mobility與abilityParts，保留既有部位HP及exposure；機械新增真散熱／供能部位、生體加blood與可止血傷勢，8能力填aim／partAim。鐮肢兩型（frame/species）補既有bite並綁head，雙鐮斷後仍可頭顎近咬，斷頭則禁用；沒有改bite既有數值。上述新數字為astra凍結候選，不宣稱已平衡。

多部位最小契約：7bodyplan宣告單邊部位鄰接圖，光矢連吼採相鄰穿透2部位/剩傷50%，鐮劈採相鄰70%/30%分散，爆破彈採露出60%/25%/15%分散。UI只呈現query的主命中／可能波及／條件與份額，普通隨機入口不猜未來RNG；分散才明示盾僅保護主片，穿透改依共享query顯盾臂→原瞄準路徑、計入maxParts且無剩能即止；其他單點能力保持單點。相關controller/DOM案例增可能範圍與條件文字。

最後日誌可讀性：新增防禦準備、盾擋、招架、破勢及投石繁中紀錄；回收引用物件名稱，死亡區分失血、生體死亡／步兵陣亡與機械擊毀。PartHit保持不顯示，避免與實際LayerDamaged重複。text.test新增兩條文字回歸；未跑。

正式default收斂證據入口：window.__battle.audit只回傳新純資料（round/outcome/單位status/死亡IDs，另含撤離與棄機事件計數），不推進或改動戰鬥。e2e新增seed1正式default觀戰settle後逐一確認敵方四個原始ID皆dead、各一死亡事件、20輪內且零撤離棄機；不只驗winner。未執行此新e2e。

移動新裁示：我方單位面板與移動指令tooltip新增本回合剩餘／有效上限／已花額度、基礎值、實際配件負載／容量／扣減、移動部位完整度及AP限制；全取session.movementBudget純query，不在UI重算reachable。敵方spent沿knowledge不公開。新增VM/DOM各一案，未跑；舊移動模型的戰鬥通過證據不適用新裁示。

五級移動資料：依新scope的10frame／6species明寫moveBudget2至6，5frame明寫moveLoadCapacity，未按grade推導。UI依query.base標超重／重／普通／輕／超輕機動定位，再列負載與傷勢；不新增噸位假設。燕鷗原charge.regen10及其他既有數值保留。未跑新模型驗收。

## 產出

程式：src/ui-adapter/vm/types.ts、session.ts、controller.ts、viewmodel.ts、text.ts；src/ui-adapter/dom/board.ts、panels.ts、style.css。

內容：content/base/effects/battlefield-resupply.json、frames/battlefield-support.json、abilities/battlefield-support.json、maps/playable-battlefield.json、scenarios/playable-battlefield.json。新情境廢墟回收交火：燕鷗與真實可攻擊的地面爆破班迎擊怪獸，近處有流光補給、碎石與兩類殘留回收物。

延伸內容：content/base/bodyplans/battlefield-ground-vehicle.json；frames/battlefield-tank.json、battlefield-missile-truck.json、battlefield-engineer.json；maps/combined-arms-battlefield.json、scenarios/combined-arms-battlefield.json。入口：src/ui-adapter/dom/main.ts（並支援 scenario 短 ID）；controller 情境標題優先使用內容 name。

回歸：src/ui-adapter/vm/controller.test.ts 增一般攻擊送 target.cell、地物扣 HP、遠距回收禁用、滿池/不存在/重複回收狀態不變、成功補給及物件消失；src/ui-adapter/dom/render.test.ts 增地物與殘骸 tooltip/標記驗證；e2e/battle.spec.ts 增新情境地物/回收物可見與支援攻擊扣地物HP。

最終一致性修正：爆破班標記 conventional-arms，兩新情境均 core:false；僅在 content/base/rules/cockpit.json basicAbilities 登記其爆破能力，維持無核心可用。混合重甲對手由 B 級盾甲換現有 C 級扣甲護衛，沒有改預設敵人或抗性。

test/sim/combined-arms.test.ts 新增六案，驗 core:false 三車真實能力、一般機砲拆牆、飛彈耗彈、工程排熱、三怪命令與迫砲越牆／直射受阻；再加兩情境無核心步兵可拆牆、真正命中裸露怪獸內層仍零傷害反例；e2e 新增正式選單切換回歸。

新增近戰資料：components/battlefield-shield.json、abilities/battlefield-parry.json、effects/battlefield-off-balance.json；mx-guard-stance 改真盾準備、mx-guarding移除假迴避，mx-singing-blade追加招架；僅回收示範燕鷗明配左盾，保留其右槍/瓷甲且不改default配裝。命中後盾擋／招架承傷與剩餘次數走engine query，不稱未命中；單位詳情及查看卡也顯準備防禦的承傷部位、剩餘次數與清除時機。

新幾何UI涉及vm/types.ts、session.ts、controller.ts、viewmodel.ts、dom/menus.ts、panels.ts、style.css，及controller/render/uifix回歸。內容新增／修改精確路徑依[本線scope](scope.json)授權；6傷勢effects、stabilize能力、blood4件、7bodyplan及8能力aim均已落源。

## 沒做到或證據不足

早期交付依隊長排程未跑程序；最後授權slot的實際build／e2e結果見文末。本線 git diff --check（限定本線檔案）exit 0；本線未另執行完整node suite、typecheck或DOM單元。新增VM／DOM單元未由本線執行，不能當成通過證據；e2e按文末本次實際輸出。實際畫面及手感尚未人工驗證。近戰fatalOnBreak/defense欄位已按engine凍結型別接入，最後型別與規則由engine落地後交隊長統一驗；本線未自行驗收新重大系統。

建議隊長排程：`nice -n19 node --experimental-strip-types --test --test-concurrency=1 src/ui-adapter/vm/controller.test.ts src/ui-adapter/dom/render.test.ts`，另排 `nice -n19 node --test --test-concurrency=1 test/sim/combined-arms.test.ts`。接續既定 typecheck、test:dom、build、test:e2e 與 wf-lint。以實際 package scripts 的 TS 啟動參數為準。

## 需要決定

無新增產品裁決；碎石射程與傷害從引擎 constants 讀取，仍待隊長量測平衡。本輪三常規車初始initiative 5／4／6、perception8經astra同意，尚未量測平衡。

## 本輪整頁布局補交

依 battle-layout-1029.md，battle DOM 改桌面208／戰場／336三欄、獨立下方log；760–1099兩欄、360窄窗採戰場→指揮→部位→log的文件流。部位選擇移入常駐右panel，維持data-part-n及既有攻擊入口；操作者摘要與查看／瞄準單位分開。切入瞄準才移焦，後續快照保留部位選項焦點／右欄捲動，取消回能力按鈕。讀舊log不再每次強制拉底。

結構完整度僅取已遮罩UnitView的structural層；缺層／未知為null，甲盾不混入，敵stale沿最後所見。血量僅原可見pool另顯，沒有向敵方拓權。新增／調整render、viewmodel、controller及360窄窗e2e反例；最後e2e實際結果見文末，單元由隊長統一持證。

精確新增授權fixtures.ts已用tabledb補scope；其餘產品仍原授battle檔，未碰ops。整輪gate160（非新功能授權），容量25MB。最新限定git diff --check exit0；已通知隊長現在可統一typecheck與相關單檔，未以此宣稱瀏覽器布局或全部測試通過。

## 最後授權取證與實際驗證

隊長交還唯一slot後，本線在 `/tmp/playable-verify-1029` 同步本輪main/render/style/e2e並build，以4178既有preview、Chromium1243 headless及指定LD_LIBRARY_PATH執行。沒有開桌面GUI或第二runner。

被動trace單案先重現失敗：能力click確實抵shell並進target；牆pointerdown與pointerup分別落4,4及4,3，最終原生click是board父節點。node始終connected，格尺寸卻46→48→40，證明是hover資訊及預覽提示改變高度觸發auto-fit跳格，並非要第二次確認或core拒絕。證據 `/tmp/battle-event-trace/battle-interaction-events.json`、`/tmp/playable-interaction-trace.log`。先前純span修正不足以解此失敗，不冒稱已修。

真正最小修正為格資訊列固定80px、預覽提示保留40px並容許內部捲動；合法resize/zoom保持原樣。正常未trace互動單案1/1綠，驗hover前後board與wall rect相同，down/up/click皆4,3，原生click後AP按真cost減少、canonical ability命令新增及牆60→40。接續新版map單案1/1綠，再完整19/19 e2e綠、exit0、1.7m。日誌 `/tmp/playable-interaction-normal.log`、`/tmp/playable-map-normal.log`、`/tmp/playable-all19-normal.log`；tmp build日誌 `/tmp/playable-stable-board-build.log`。未另跑全node suite，該證據由隊長持有。

同次完整browser負載更新 `/tmp/playable-layout-shots/battle-desktop-1280.png` 與 `battle-mobile-360.png`，交astra有界復看；本線不以e2e綠取代人工視覺結論。唯一slot已明確歸還隊長，產品不再變更。

## 桌面浮出選單裁切補修（待頁驗）

僅menus.ts/style.css與既有battle.spec.ts補桌面quick-menu：用可見board-viewport與視窗交集限制最大尺寸，再將實際量得的選單位置夾住；長清單內部可捲，子按鈕不受flex壓縮。手機既定隱藏規則、固定格資訊／提示高度、zoom/resize與玩法皆不改。

新第20個e2e案例在1280×560正常回到操作者、走到下方一格，驗選單四邊不越戰場、尾項可捲達，回1280×800可選輸出battle-desktop-quickmenu-1280.png，再以原生待機驗換台。此補修僅交code，未跑程序；前述19/19證據屬此補修之前版本，不冒充新案例通過。限定diff --check exit0，交隊長於完整node驗證後排受影響頁測。

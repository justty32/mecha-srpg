# 手勢線交付

## 做了什麼

共用 Pointer Events helper 實作起點 8px 閾值、穩定容器 capture、整格拖曳、邊界回讀校正、hover 暫停、點擊／雙擊 capture 抑制與下次輕點恢復。取消、多指、離開、失焦、隱藏、銷毀均有清理；戰鬥縮放／尺寸與世界切圖亦取消舊手勢。世界沿既有 mapScroll，沒有拿 mapViewport 當左上 setter；縮圖維持既有行為。render.ts 已移交快捷線。

## 產出

產品與測試為 `src/ui-adapter/dom/map-drag.ts`、`map-drag.test.ts`、`render.ts`、`src/ui-adapter/ops/dom/world-map.ts`、`e2e/battle.spec.ts`、`e2e/ops-map.spec.ts`。新增閾值微抖、keyboard click、拖後雙擊、多指、cancel、控制排除與同手勢邊界立即反向單元；兩地圖各新增 Chromium mouse 與 CDP touch 案，檢查視野、audit／route、縮放座標、輕點及邊界反向。共 7 檔（含本報告），未超 14 檔／2 MB gate。自有路徑 git diff --check 通過。

## 證據不足

依交接禁止啟動測試，沒有執行 node／npm／typecheck／瀏覽器，未宣稱測試通過。建議領導唯一 runner 先跑 map-drag.test.ts 與 input.test.ts，再跑 battle.spec.ts／ops-map.spec.ts 新增「安全拖曳」案，最後既有 DOM 與 e2e。已新增 command-panel 區域真 CDP touch swipe 並斷言 scrollY 增加、audit 不變，尚待領導執行；實體手機手感未驗。全 repo diff check 發現他線 WAIT_USER 尾空白，不修改領地外檔案。

## 需要決定

無新增玩法或套件決定。請領導同步 code-map 新 helper 導航，並完成統一驗證。

追加有界驗收：battle／ops-map 各新增一案，遍歷 360／390／430×844 與 844×390，檢整頁水平溢出容差 1px、地圖實際高度、主控制捲入畫面與 trial click 可達、手機控制高度 44px（含戰場四方向鍵）。`MOBILE_SHOTS` 可選存 390直向、844橫向與1280桌面的戰場／世界截圖。沒有啟動任何測試，等待領導唯一 runner。

領導首輪 Chromium1248 指出戰場點 move 後首次拖曳未改視野；世界 mouse／touch 已通過。戰場 E2E 原先直接讀 boundingBox，手機 commands 點擊可能已把地圖捲出視窗。現每次拖曳先 scrollIntoViewIfNeeded，再驗地圖 inViewport 與真起點 elementFromPoint 命中圖面，保留視野必須改變斷言；未改產品、未啟動測試，待領導重跑。

第二輪唯讀定位 battle 邊界反向失敗出現在 Escape 後 idle 快捷選單恢復，原起點僅驗 viewport 祖先，未排除其內 button/menu。按領導決策保留既有手機固定 commands／隱藏 quick-menu 政策，360 舊案未改；手勢 E2E mouse 改用 1280×800 桌面，touch 維持390×844。每次拖曳使用多個圖面候選，明確排除 button／menu／輸入／連結，並確保拖曳路徑在視窗內；無合法起點即失敗，沒有 force 或 synthetic pointer。原視野、邊界、audit、取消、輕點斷言全部保留。待領導唯一 runner 重驗，工人未啟動測試。

修後7案領導實跑6過，戰場desktop mouse與360政策回歸通過；touch最後輕點的舊 nth(2) locator 在 tap 自動捲頁前先讀座標，可能與自然捲動後實際圖格不同。已改先自然捲回地圖，再由 elementFromPoint 選真正可見未遮擋、不在可達範圍的格中心，當場讀 data-x/y，以真 touchscreen.tap／mouse.click 輸入並輪詢精確cursor相等，保留 audit 不變。加入唯讀原生pointerdown/up/click事件trace，輸出有界事件序列，含tap前自然捲頁後viewport／cursor／真hit／client中心，以及各原生事件前後viewport／cursor／scrollY與trusted，供區分根因；無產品修改，未啟動測試。

最後幾何反例：既有四尺寸案追加 844×390 快捷收合／展開的 command-panel 內 unit→shortcut root→commands→view-controls 依序、不互蓋與完整包含斷言；橫向截圖保留快捷展開。世界案固定再驗1280桌面 facts b 的完整文字、scroll/client 尺寸與所有會裁切祖先的真文字 Range 邊界，輸出少量幾何證據；不新增案例、不改產品、不跑測試。

領導 touch-final trace 證實自然捲頁後原生 pointerdown/up 的 point／hit 都正確，viewport／scroll不動，但 document capture 沒有 click，故不能判作 locator stale 或 surface click suppression。未猜改產品；單次診斷擴充到 pointermove/cancel/capture、touchstart/move/end/cancel 與 compat mouseover/move/down/up，記 defaultPrevented、pointer id/type/primary、touch數、target/cell/downTarget節點identity與isConnected、elementFromPoint，並記事件後microtask狀態。保持真輸入、精確點格與audit所有斷言，沒有fallback tap/action。

最終測試收斂：預設只掛 document capture click 最小記錄（trusted／target x,y／陣列件數），明確輪詢必須恰一個 trusted click 精確命中當下真格，再驗cursor與audit，不能由hover更新假過。重事件trace只在 MOBILE_TRACE=1 註冊；成功只輸出一行短摘要。先前重診斷單次通過不宣稱產品bug已修，產品完全未改；等待領導以最終最小形態三連重驗，不再擴測，工人未啟動測試、未加sleep或fallback。

最小click記錄形態三連未過（click陣列皆空），重trace單次通過不足以結案，未宣稱產品已修。下一最小版僅測試加輕量touch生命週期counter：每段CDP touchEnd／touchCancel後等實際pointerup／cancel、touchend／cancel、touches=0、active pointers空與capture空，再開始下一輸入，沒有時間sleep。touch流程中的zoom／move／scroll-left控制改用原生tap（mouse流程仍click），排除混用mouse來源；流程與唯一trusted click、精確cursor／audit斷言保持。產品未改，待領導單次runner驗證。

生命週期barrier皆過但最後click仍缺，未把它當成完成證據。依領導指定做最小產品實驗：battle hover 僅排除 sourceCapabilities.firesTouchEvents 的觸控相容 mouseover，避免原生click前無必要的hoverCell重畫；真mouse hover與既有原生click入口保持。新增input單元反例驗觸控相容hover不派action、click與mouse仍可用。E2E僅加輕量mouseover source旗標與capture→bubble間cell.firstChild identity是否改變紀錄，沒有geometry／microtask重trace；等待領導真瀏覽器確認，不宣稱根因已證實或bug已修。未改world／core、未啟動測試。

hover guard 單變數實驗陰性（clicks與mouseovers皆空），已精確撤回render guard與其input新增單元，未動其他產品。下一對照僅把最終tap改到與drag相同CDP session，維持Playwright原實作 Promise.all 同時touchStart／touchEnd、modifiers=0且不帶id；原touch生命週期barrier、唯一trusted click、cursor與audit皆保留。不是fallback，也未改逐一await；待領導單次驗證，工人未跑測試。

同CDP session＋Promise.all仍陰性，下一單變數僅將最終touchStart與touchEnd改逐一await；modifiers／無id／座標、生命週期與trusted click／cursor／audit全部不變，不加sleep、不動產品，待領導runner。

最終tap同session逐一await亦陰性；下一單變數產品實驗僅移除map-drag move.preventDefault，依既有surface touch-action:none／user-select:none處理pan與select，閾值／capture／click與dblclick抑制／取消全不變。新增單元驗move不defaultPrevented、viewport仍移動、拖後click被擋且下次輕點恢復；所有真input斷言與最終CDP順序保持。不跑測試，若領導驗證仍陰性即撤本實驗。

move.preventDefault 實驗陰性，已精確恢復該行並撤回該次單元，產品恢復原狀，停止實驗。最小失敗版預設只有passive document-capture click與輕量touch生命週期counter；完整trace曾成功版在生命週期counter加入前，以同樣passive capture額外訂閱pointer／touch／compat mouse與capture事件，每個事件讀snapshot、節點WeakMap identity／isConnected、defaultPrevented、pointer id/type/primary、touch數，並呼叫elementFromPoint，另排queueMicrotask再讀事件後狀態。完整trace不改action、不preventDefault，卻多了同步hit-test與microtask工作；後續最小版另新增counter與touch控制tap，因此歷史成功版與現況並非只差單一開關；當次成功序列有同cell連接保持、up→touchend→mouseover/move→mousedown/up→trusted click。最小版缺click且mouseover空；sourceCapabilities guard、session、start/end並行與preventDefault各單變數皆不足。現有證據只能定位診斷本身改變時序／瀏覽器處理機會，不能宣稱已辨明產品根因；唯一真click驗收保留，無fallback，暫停新實驗。

review下一單變數：最小E2E僅加mouseover／mousemove／mousedown／mouseup四個passive document-capture listener，僅記type與defaultPrevented，移除先前mouseover的node／source旗標紀錄；無geometry／snapshot／microtask。既有click與touch生命週期驗收保持，未同時加入down barrier，未改產品、不跑測試，待領導單次驗證。

四compat listener亦陰性（clicks／compat皆空）。下一單變數只在最終CDP touchStart後等頁內本次pointerdown與touchstart計數前進、touches=1且該pointer id仍在active陣列，再發touchEnd；末端End barrier與全部真click／cursor／audit驗收保持。不是時間sleep，其餘輸入序列與產品皆不變，工人未跑測試。

按root改採基本序列定位，新增四個各自fresh context的「觸控最小序列」：直接tap、單drag後tap、drag cancel後tap、一次縮放後tap。各案390×844／debug-big，同CDP逐一start/end；縮放也以可見button真中心CDP tap。只有最小doccapture click記錄，精確驗唯一trusted click、非reach空格cursor與audit；沒有完整trace、lifecycle、sleep或產品改動。四案待領導串行統一跑，尚未加可選世界第五案。

基本四案領導統一實跑全過，接續新增最多六個fresh context前綴2／5／6／9／11／12，按原長操作語義逐加zoom、move、drag、cancel、Escape、到左界、邊界反向、再zoom與精確2格drag。沿基本案同CDP逐一原生輸入，所有手機控制同CDP tap；每步audit不變及原視野斷言保持，各結尾唯一trusted click精確命中非reach空格與cursor。新前綴沒有lifecycle／compat／fulltrace觀察器、sleep或產品更改；待領導統一驗證，工人未跑測試。

前綴實跑2／5／6／9過，11／12皆在step11第二次zoom原生tap未增cellSize（維持30），尚未執行最後mapclick。下一只加prefix10，定位再多一次drag−60之後輕點是否失效；末tap若失敗輸出最小click陣列、真格at與audit，不改其餘操作或產品。所有這些context明確只設hasTouch:true與390×844，isMobile未設、Playwright預設false；此為現有證據邊界，不改emulation掩蓋。工人未跑測試，由領導只跑prefix10。

prefix10單案陰性，定位prefix9後再加drag−60就缺末click；第二zoom失效為後果。新增兩最小組合各isMobile=false／true四格fresh對照：同向drag−72→−60→tap，以及左界+60 clamp→+60反向1.2格→−60→tap。各拖保留viewport／audit，末tap保留唯一trusted nativeclick與精確cursor；除isMobile旗標外兩組輸入完全相同。使用基本案同CDP helper，無額外observer、lifecycle、sleep或產品改動，不以true若通過宣稱產品已修；工人未跑測試。

最小兩組合的isMobile false／true四格皆陰性，旗標不能解釋。按root授權新增兩個「觸控手勢合成對照 isMobile=false／true」：完全保留同向雙拖fresh context、低階CDP拖與viewport／audit，只將最後tap改同CDP Input.synthesizeTapGesture（touch、tapCount=1、duration省略由browser預設）。仍驗恰一trusted native click、精確cursor與audit，未改產品、未取消舊負例，沒有DOM action或sleep；工人未跑測試。

高階synthesizeTapGesture false／true亦陰性。最後capture單變數實驗：helper cancel 增release參數，僅正常pointerup／pointercancel呼叫cancel(false)，讓browser依原生流程自動釋放capture；外部取消／blur／zoom／destroy仍主動release。新增單元以release spy驗正常up不主動release仍擋拖click，外部cancel仍release。其他產品／E2E不動，待領導最小雙同向拖false／true兩格驗證，陰性即撤回；工人未跑測試。

root收斂capture實驗為僅normal pointerup自動釋放；pointercancel／blur／zoom等仍手動release，已依event.type修正。再新增單一mobile=true fresh雙同向低階CDP拖後zoom按鈕CDP tap對照，驗doccapture恰一trusted click命中board-zoom-in、cellWidth增加與audit不變；既有map false／true兩格保留。工人未跑測試，待領導一批三案；若陰性撤本capture試改。

最後capture對照三案全陰性：雙拖後map false／true與zoom true均缺nativeclick（領導touch-auto-release.log）。已精確撤回cancel參數／up分支與該次release spy單元，產品恢復原狀；保留失敗E2E證據，不再猜改或啟動測試，等待astra涵蓋map及受影響控制的事件修復計畫。

root指定下一單變數：僅移除helper顯式setPointerCapture區塊，保留document全局move/up、release／cancel／旗標／閾值／touchAction等其他產品。新增桌面真mouse拖出viewport仍在window後up與外部blur取消的有界案，驗視野真移動、audit不變與下一原生mouse點格恢復。既有兩拖→map／zoom對照保持，工人未跑測試，待領導一批驗；陰性即精確撤回。

無顯式capture對照四案：兩拖後map false／true及zoom true三touch仍陰性，mouse拖出後up／取消恢復案通過。已依約精確恢復try setPointerCapture，產品回原狀；保留對照測試與結果，不再試改、不啟動runner，等root裁決。

root最後有限批次：①helper僅同時移除顯式capture與move.preventDefault，其餘不變，待現成battle三案；陰性即全部恢復。②新增fresh世界雙同向低階CDP拖後map／zoom-out兩案，沿battle hasTouch true、isMobile false，驗viewport真變、最小唯一trusted click、cursor／route與zoom1→.5。③新增無app/helper的300px touch-action:none空HTML，完全相同CDP雙拖後真button tap，驗doccapture唯一trusted click與handler count=1。無sleep/fallback，②③由領導在①若陰性恢復產品後驗；工人未啟runner。

空HTML控制另固定html／body height100%、margin0、overflow:hidden，300px觸控面板不變；記錄雙拖與tap前後scrollX/Y、visualViewport scale／offset／size並精確斷言不變，排除頁面可捲動與縮放因素，唯一native button click及handler1驗收保持。產品交互格由領導先驗單一isMobile true代表，工人未跑測試。

最後capture OFF＋move.preventDefault OFF交互格mobile代表亦陰性（touch-combined-off.log，clicks空）。已精確恢復setPointerCapture與move.preventDefault，產品完全回基準；world與固定HTML對照保留，待領導在基準產品跑，工人無新試改／runner。

關鍵對照：世界精確雙拖後map／zoom皆過；固定空HTML無app/helper亦click空、handler0且scroll／visualViewport不變，不能將缺click歸因戰場helper。新增兩個browser平滑觸拖受控案：空HTML與fresh battle皆只將兩次drag改為Input.synthesizeScrollGesture（touch、preventFling true、xDistance −72／−60、yDistance0、default speed），最後仍同CDP低階start/end tap。保留空HTMLhandler1與唯一trustedclick；戰場每拖viewport增加／audit不變與末精確cursor／唯一click。未改產品、不加sleep，工人未跑測試，待領導先A後B串行驗證。

兩個browser平滑觸拖案補最低成本passive document-capture pointerdown／move／up／cancel記錄（僅type、pointerType、isTrusted、timeStamp）；雙拖後與末tap後輸出down/up/move/cancel件數及每段timestamp時長，斷言至少兩次trusted touch down/up且有touch move，排除只有wheel的假觸拖。既有VM／nativeclick／audit斷言不變，沒有geometry／snapshot／microtask額外診斷，工人未跑測試。

browser timed pan受控對照已由領導實跑陽性：固定HTML真touch move13、每拖約209／194ms後原生button click1／handler1且幾何不變；battle真touch move15、viewport0→3→6、原生click精確6,0且audit空。採正式E2E使用browser timed touch pan，不修改產品，也不將裸CDP瞬時雙拖負例稱為產品bug。已移除所有臨時最小／前綴／交互／合成／HTML診斷cases、大trace／lifecycle，回原29案；正式兩圖touch context isMobile true，正常pan採synthesizeScrollGesture touch／preventFling／default speed，cancel及同手勢reverse保留單次低階真事件，後續用timed pan。以真pointerdown至lastmove位移計格驗zoom後精確viewport，保留唯一trusted click精確格／audit或route、手機844收展幾何與desktop facts／可選截圖。產品保持基準，工人未跑runner。

正式29案領導實跑28過，兩圖touch的邊界／反向／取消／縮放與唯一nativeclick精確座標皆過。唯一圖外swipe失敗是測試先scrollIntoView到頁底，scrollY530已無向下餘量；現只修前提，先往上200px，再依當下rect選command／header真hit、排除圖面並驗至少180px可捲餘量與手勢端點在窗內，保留同真timed swipe必增加scrollY與audit不變驗收。未改產品、不加sleep、不啟runner，待領導三連及full29。

三連仍僅圖外scroll陰性（map／取消／縮放／nativeclick皆過），未猜改產品。依領導只補末段診斷：改取command-panel中段非互動真hit，頭尾離窗邊40px；記手勢前後hit與到html祖先touchAction／overflow／scroll幾何、document最大scroll與visualViewport，以及trusted pointer move實際dy。scrollY必增加硬斷言保持；move啟用後加fresh mode.kind=move斷言。工人未啟runner，等待single診斷。

長鏈圖外診斷命中NAV commands、祖先touchAction auto／overflow visible、scroll330/max2045、真pointer dy−195且up正常卻不捲；暫不猜產品。新增兩fresh最小body對照：無前序touch的battle圖外段落、touch-action:auto高2000px空HTML，皆mobile true、同座標195/480與native gesture向量0/−180，段落真hit與180px餘量先驗。兩案皆必doc scrollY增加，battle map viewport與audit不變，輸出簡短computed/visual前後值。原長case最後tap未改、產品未動、工人未跑；診斷後收回29案。

root獨立bare環境證實官方EmitTouchEventsForMouse＋emulateTouchFromMouseEvent可產生原生body scroll400→693與trusted touch指標；正式只將圖外swipe改此官方touch emulation（press、8段move上180、release，finally關閉），不以DOM scroll代結果。驗該段trusted touch down／move、scroll真增、map viewport／audit不變，只留短before/after摘要。常態touch控制與末tap統一synthesizeTapGesture touch／tapCount1／default duration，drag保持timed，取消與reverse特例保留。已移除fresh2診斷與大祖先trace，回29案；產品未動，工人未跑，待領導最終三連／full29。

root最終收斂：fresh synthesizeTapGesture控制三連未啟move，統一tap不是產品需求；已將兩圖常態控制與末地圖tap恢復先前28/29與offmap診斷驗證過的同CDP sequential touchStart→touchEnd。timed drag及新官方mouse→touch圖外scroll保持，mode=move／唯一trustedclick／圖外scroll／mapVM／audit全部硬斷言原封，無新診斷case、未改產品、工人未跑，等待領導截止前收驗。

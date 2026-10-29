# 快捷操作交付

## 做了什麼

戰鬥與營運分 scope，最近去重保留 6 筆，最愛保持加入順序最多 8 筆，滿額有可讀提示。戰鬥 end 依領導產品裁決加入，仍派 endTurn 並沿既有確認。能力需當前 beginAbility，排除含目標／危險命令。面板按下重解最新 catalog，阻擋 busy／確認／prompt／編成／報告／說明；缺席最愛保留且可取消。

## 產出

偏好由 command-preferences 模組的 commandPreferences(scope) 單例共享，三個 main／host send 在 dispatch 前比對 fresh snapshot、dispatch 後記一次；view 僅訂閱，不記錄。儲存只含版本與 id 陣列，讀寫／getter 失敗仍保留本次記憶體。DOM 字串使用 textContent，釘選是獨立按鈕，Enter／空白不冒泡成全域地圖確認，重畫保留 focused 操作。

修改產品 11 檔（4 新 helper/test、battle main/render、ops main/host/render/render.test、campaign e2e），未寫 CSS、未修改控制器。沿用 gestures render 拖曳接線，CSS class 契約已交 inventory。

領導首輪單元 26 案中 25 過、1 案指出空／損毀儲存無法首次寫入。已將跨 scope 合併讀取與 setItem 的容錯分開，新增空字串及損毀來源 record 後刷新仍保留 recent／favorites 的反例；修正尚未由工人執行測試。

領導 UI typecheck 指出測試把全域 HTMLButtonElement 用在 happy-dom 泛型及不完整 prompt fixture。已使用 happy-dom 匯出的明確按鈕型別與既有完整 promptFixture，未加入 any 或降低斷言。

領導全套 e2e 中新增快捷兩案通過；campaign 的快捷檢查把焦點留在面板 summary，Enter 因正確的鍵盤安全邊界未返回。已改為可見「返回營運」按鈕 back.press("Enter")，保留所有安全斷言及戰果流程；未改產品邊界，待領導重驗。

## 證據不足

依 brief 未跑任何測試、npm、typecheck、build 或瀏覽器；本線明確路徑 git diff --check 通過。建議領導串行執行新增 command-preferences.test.ts、command-shortcuts.test.ts、ops/dom/render.test.ts，再既定 UI typecheck/build 與 ops-campaign e2e。新增案例含去重容量、壞格式、儲存例外、stale catalog、busy、釘選不dispatch、額滿提示、end確認／audit、刷新與鍵盤最近、儲存 getter 故障及營運出戰禁用最愛。實體手機手感無證據。

## 唯讀交叉審查（touch click）

已親讀追加 brief、map-drag.ts、battle render／board／grid-view 與 battle e2e 的 CDP 序列，並讀 touch-repeat.log／touch-trace.log，未改產品或測試，未啟 runner。

三連最小紀錄皆是 document capture click 陣列為空（0/3）。helper 抑制 click 的 listener 在 viewport capture，document capture 先執行，因此若只是 suppress／blocked 吞掉 click，document 仍應記到事件；現有證據支持「瀏覽器未產生／未送達此 click」多於「helper 吞 click」。但最小紀錄沒有失敗次的 pointer／touch 全序列，不能確定更早哪一步丟失。

成功完整 trace 顯示同一 connected cell（id 1）經 pointerdown → implicit gotpointercapture → pointerup → lostpointercapture → touchend → mouseover/move/down/up → trusted touch click，defaultPrevented 全為 false。該次 capture 是 cell 的原生 implicit capture，helper 只在跨8px後才對穩定 viewport 顯式 capture；lost handler 僅匹配 viewport 且 gesture id 相同，cancel 先清 gesture 再release，未見必然誤清新指標的路徑。成功紀錄不能排除失敗時序的問題。

compat mouseover 確實在 touchend 後觸發 hoverCell 與同步重畫，但該次 cell id／連接狀態／viewport 均不變；grid-view 同格數重用 cell，board 只替換子元素。因此現有成功 trace 不支持整個 cell 被替換導致 click 消失。其他落在 badge 子節點或 resize 變格數的失敗需另證，不能由一次成功泛化。

前版測試 await CDP send 後沒有逐段斷言終結。最新 touch-lifecycle.log 已顯示手機控制改tap、每段 pointer/touch/capture barrier 均通過後仍 click[]，所以前序未完已大幅降權，不能再把 barrier 視為修復。

優先待驗的是 touch-generated compatibility mouseover 的同步 DOM／可見內容突變：touchend 後 gesture 已清，drag.active=false，board hover 會 send hoverCell → view.render；board.paintCell 替換子元素、inspect panel重建，新增 shortcuts.render 每次無條件 content.replaceChildren（即使 catalog 沒變），tooltip.refresh 寫文字／定位；tooltip 自身 mouseover 另會讓 hidden tooltip 顯示並讀寫 layout。cell 本體 connected 並不足以排除瀏覽器因周邊內容變動而中止後續 compat mousedown/up/click。完整 trace 每事件另讀DOM/layout且排microtask，確實改變此區時序；該次成功不能證實最小路徑安全。

建議領導授權 gestures 隔離 touch-generated compatibility hover（包含tooltip；Chromium可判 sourceCapabilities.firesTouchEvents，或明確touch compatibility狀態），不派 hoverCell／不顯示mouse tooltip，保留真 mouse hover及原生 click，不補合成 click／遊戲命令，再以無重trace重複驗證。這是從呼叫鏈與時序差異推論的優先假說，尚無失敗完整事件序列證實根因。

本機 Playwright 原始打包程式 coreBundle.js:37256 的 RawTouchscreenImpl.tap 另有時序差異：使用內部 client，Promise.all 送 touchStart（不傳id）和touchEnd，而drag使用自建CDP session逐步await。因此同session且順序await一次改兩個變數。最小session對照應固定產品與其餘測試，僅最後tap改成同drag CDP上的相同Promise.all start/end（座標相同、modifiers:0、不傳id），保留lifecycle／trustedclick／audit斷言且不開trace；若陰性再單獨改順序await。兩者均仍是瀏覽器原生touch輸入。未讀Chromium端InputHandler實作，不能斷言nativegesture狀態按session獨立，現為待驗假說。未改產品／測試或啟runner。

再次比對的確定差異：成功trace共25筆＝before＋12原生事件＋12 after microtask；每次inspect含 elementFromPoint、scrollY／node屬性及 battle.peek（main實作structuredClone完整snapshot）。所以成功組並非只多事件訂閱。失敗組只有click[]，無法定位compat鏈停止點；lifecycle已訂閱passive touch四事件仍失敗，單純touch訂閱已非充分條件。下一最小隔離建議只為compat mouseover/move/down/up增加document capture passive listener，各推入type/defaultPrevented兩個純值，不geometry／peek／nodeidentity／microtask；保留trustedclick斷言。失敗可定位事件停止點，成功則先將差異縮到compat事件訂閱及極小callback介入，尚不能歸因geometry。preventDefault單變數陰性由領導回報，亦不支持以其作根因。已直接回root及領導，未改產品／測試／啟runner。

prefix新增線索唯讀核對：map-drag.down 的 suppress=false 確位於 surface.contains／排除button等early-return之後，外部button down不清舊flag；然而render的viewport只含stage，corner由frame.append(corner)追加且與viewport是sibling，board-zoom button正常事件路徑不經viewport。helper click/dblclick只在viewport capture，故不能僅憑舊suppress解釋第二次zoom失效；scroll按鈕也直接屬frame。shell收到board-zoom-in click後同步apply→zoomStep→cellSize。需證明實際click未生成、target被retarget到viewport或shell路徑異常。建議第二次zoom tap前doccapture純值記pointerdown/up/cancel/got/lostcapture/click（type、target data-ui/tag、defaultPrevented、pointerId），不加geometry／peek／microtask；保留cellSize斷言。已直接回root及領導，未改碼／啟runner。

## 需要決定

無。code-map／spec 命名同步由領導持有。

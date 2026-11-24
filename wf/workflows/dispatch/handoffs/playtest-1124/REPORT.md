# playtest-1124：DONE（部分未覆蓋；保留兩次 runner 失敗）

## 做了什麼

2026-11-24 13:59 開始，14:10 收線（Asia/Taipei）。親讀 brief、AGENTS、user、working、testing、feature-dev 與前線 REPORT；核對 `playtest-gate.json` status=done，ui-dom.exit、ui-build.exit、e2e-final.exit 均為 0。未重跑 build、既有測試或 wf lint。

全程只有本線 headless 工人、沒有子代理。每個完整工作階段以一次共用 heavy-lock 包住 Node 靜態服務與 headless Chromium，不巢狀、不並行。使用現有 dist、本機 Playwright、全新 browser context 與 `?seed=3&anim=off#/ops`，未開 spectate、未注入合成 fixture、未改 DOM。互動均為 headless 合成輸入，不代表實體操作手感。

初次終局 FAILED 已回報且保留：attempt1 首頁根路徑處理錯誤回 404，等待 __ops 10 秒逾時，exit=1；14:05 main 正式授權原地修正自製 runner、開新序列工作階段。attempt2 首頁200並進入實玩，但腳本錯假設撤離必有確認框，等待隱藏的取消按鈕10秒逾時，exit=1。兩次逾時均先查 log、exit、PID 終局，finally 關閉自己的 browser/server，未盲目重跑。唯讀核對正式 controller 後修正腳本假設；attempt3 正常完成，exit=0。這些不是工具拒絕，也未修改產品來配合腳本。

## 產出

### 1. 新局契約頁：成功；歷史重繪部分未覆蓋

第1日有9份待接契約。以 Enter／Space／Enter 選擇畫面前三列，實際選取 id 依序為 contract-53、contract-55、contract-57；每步記錄完整 contracts 的 selected、activeElement 與詳情文字。焦點保持在 selected 的 li、aria-pressed=true；詳情分別對應朝廷的吉大港偵察、日本那把傘的吉大港偵察、北美那把傘的新加坡渡輪港偵察。前兩列同名，但 id 與委託者可區分，沒有只靠標題判成功。每次重繪後 Tab 均到下一個未選列，未回 body。

新局歷史為0，未製造歷史 fixture。第三次實玩自然完成契約後，出現「已結束（1）」；原本選取完成契約使歷史自動展開，Enter 將其收合、Space 再展開，兩次 activeElement 均留 summary，Tab 進完成契約列。注意 log 的事件名稱 `history-open`／`history-close` 是腳本原先預期，實際 open 值依序 false／true，應以值而非名稱解讀。歷史 summary 在日期更新／契約重繪後的焦點持續性未額外觸發，列為未覆蓋。

### 2. 新局接約／出戰：成功；撤離確認／取消不適用

自然接取 contract-53「偵察：吉大港」，經航行、事件回應、編成進入玩家控制戰鬥。目標為「存活至第3輪輪末」；撤退文字為「每台單位須各自到明列出口格使用『撤離』；撤離是否完成任務依本場目標判定。」時限為第20輪輪末未決勝負則平局。可見敵方名為「曲針」，未看到敵方駕駛姓名；本場未建立具名敵機對照，不能推廣為所有敵方姓名遮蔽驗收。

真實玩家 mech-8（陳小海／衍型機・燕鷗攻堅型）由 (2,7) 移至 (0,6)，移動花費3、AP由9降至6，戰鬥記錄與 selected.pos 一致。(0,6) 是位於邊界的**明列出口**，不是無明列出口時的 fallback 邊界撤離點；DOM 標記「出口」，title／data-tip／aria-label 均說明「移動到此格後，可使用『撤離』退出本場戰鬥；是否完成任務依本場目標判定」。無明列出口情境的「撤離點」文案本次未覆蓋，未硬改任務。

按撤離後 mech-8 直接退場，confirm=null，行動單位轉到 mech-10。`src/ui-adapter/vm/controller.ts:286` 的 retreat 與 standby/defer/eject 分支直接 send，沒有確認框流程。因此確認／取消／再確認在本場不適用；attempt2 的取消等待失敗是 runner 假設錯誤，不能宣稱產品漏彈窗，也沒有假造取消成功。

第三次實玩接續以6次待機合成輸入自然推到第3輪結束，outcome 為 player／survive；點返回營運後 battle=null、戰果報告「我方勝利」、現金+3600、吉大港契約完成，燕鷗攻堅型記為撤離、其他己方生還。沒有使用全 AI settle 或直接結算掛鉤，也沒有改戰鬥狀態。

### 3. 雙尺寸 DOM 量測：水平溢出成功；可達性部分成功／部分未覆蓋

契約與戰鬥頁各在1280x800、390x844量測，四組 documentElement.scrollWidth／body.scrollWidth 都等於 viewport 寬（1280或390），未發現頁面水平溢出。契約詳情、戰鬥任務區與指令區的水平矩形均在畫面範圍內。

390x844額外執行 scrollIntoViewIfNeeded：契約詳情矩形 x25、y367.5、340x263；戰鬥指令區 x17、y249.7、356x344，可捲到視窗內。任務區容器 x8、y224、374x33.9，可達，但它是可收合區；本線只記其 DOM textContent 與容器矩形，未展開後逐段核對全部撤退／時限文字的視覺可達性。桌面未逐項捲動與完整垂直可達性驗證，均列未覆蓋，不把文字存在或矩形量測當成人眼閱讀成功。

pageerror 監聽在每次導航前建立，三次 log 均沒有 pageerror 事件；attempt1 有404 console-error，已保留，不宣稱整個執行沒有錯誤。attempt2／3進入遊戲期間未記到 pageerror。沒有截圖、人眼或手機實機驗證。

自製附件5件，加本 REPORT 共6檔，合計約0.63 MB，低於2 MB：`play.mjs`（原地修正後腳本）、`run.log`（追加式保留三次證據及 attempt 分隔）、`run.exit`（1、attempt2=1、attempt3=0）、`runner.pid`（三次可追蹤PID）、`verify.log`（上游出口、程序／埠清理、diff check與容量）。未另產生存檔；localStorage摘要在run.log，只有快捷操作偏好。

三次均從專案根目錄執行相同命令，外層 shell 保留 PID／log／exit：

```sh
sh scripts/heavy-lock.sh node wf/workflows/dispatch/handoffs/playtest-1124/play.mjs
```

第三次PID為2968203。終局核對PID已退出、4187無監聽；沒有停止使用者服務。`git diff --check` exit=0。實玩證據為上述log，不以腳本內尚未執行的分支冒充覆蓋。

## 未做到

未覆蓋項已逐條列明：歷史重繪後焦點、無明列出口的邊界撤離點、具名敵機姓名對照、自然不存在的撤離確認／取消、展開後完整資訊可達性與實機／目視手感。不新增第四條流程，不進行長局平衡或效能測試。沒有下載、GUI、截圖、子代理、正式程式／既有測試修改、commit、push、刪檔或回退既有 dirty，只寫本 handoff 目錄。

## 需要決定

本輪固定三流程已完成有界實玩與誠實覆蓋報告，沒有已證實的產品缺陷需本線修正。若需求確實要求撤離確認／取消，請 main 將它當作與現況直接撤離不同的產品決策，不從本次測試推定已有該功能。本線依 main 的續驗REQUEST（01795500335704451347.2946450.2026492）回覆終局後退出，不等待其他任務。

工具經驗：自製靜態服務須處理 `/`→index.html，且同鎖內先做HTTP200 smoke；不要預設指令必有確認框，應在自然操作後讀真實快照。summary 的初始open可能由已選歷史契約決定，事件名稱不如實際布林值可靠。log已有完整VM證據但偏多，後續應只摘必要欄位；本次不刪既有證據，仍在容量gate內。每次timeout先核對log／exit／PID與服務終局，經授權才原地修正腳本，不把自身腳本錯誤混稱工具拒絕或產品回歸。

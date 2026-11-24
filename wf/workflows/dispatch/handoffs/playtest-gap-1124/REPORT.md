# playtest-gap-1124：DONE（三項補驗完成，含一項明示合成）

## 做了什麼

2026-11-24 15:33開始，15:38動態工作已結束並清理（Asia/Taipei），早於16:10收尾及16:15截止。親讀brief、AGENTS、user、working、testing、feature-dev、前線REPORT及適用導航／慣例；核對上游UI DOM、build、e2e三個exit均0，未重跑。HEAD為fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2，保留既有dirty。

本線唯一headless工人、無子代理。沿用前線已修好的靜態server做法及現有dist，在4187啟動自己的服務，HTTP200後進遊戲。完整Node/server/Chromium階段只套一層heavy-lock。自然流程用新context、seed=3、anim=off、非spectate；輸入全是headless合成，不代表實體鍵鼠／觸控。沒有GUI、截圖、下載、build、正式檔案修改、commit/push、刪檔或停止使用者服務。

## 三項結果

### 1. 歷史真重繪焦點：成功（自然歷史，真控制器觸發）

自然接朝廷contract-53「偵察：吉大港」，航行一天、出戰編成，9次待機推到第3輪存活勝利，再返回營運，得到完成歷史。沒有直接結算或改戰役狀態。

在「已結束（1）」summary focus時，以既有window.__ops.dispatch(selectContract)選待接contract-54，讓真控制器／renderer重繪。這是測試觸發方式，不是使用者能同時點別列並保持summary焦點的操作。保存舊節點參考並比較：summary replaced=true、oldDisconnected=true；activeElement仍是新summary。選取VM為contract-54/offered，按Tab到歷史contract-53列、aria-pressed=false。不是只做原生details開關。

接著focus歷史列並Enter：舊列斷開、activeElement換成新的歷史列（兩個布林均true），aria-pressed=true；VM selected是contract-53/done，詳情為朝廷、吉大港、完成。Tab續行至「接約」disabled按鈕的可聚焦提示包覆span，沒有掉回body；此包覆span提供不可操作原因，不將它誤報成可接約按鈕。

證據：run.log的summary-real-redraw、summary-tab、history-row-real-redraw、history-row-tab。

### 2. 390x844展開資訊可達：成功（自然戰鬥）

在上述自然偵察戰鬥，展開任務的「撤退與時限」，逐項scrollIntoViewIfNeeded後量測，不只讀textContent。三項visible均true，矩形完全在390x844視窗內：

- 目標「存活至第3輪輪末」：x21、y232、width348、height17.90625。
- 撤退「每台單位須各自到明列出口格使用『撤離』；撤離是否完成任務依本場目標判定」：x21、y275.8125、width348、height35.8125。
- 時限「第20輪輪末仍無目標決定勝負：平局（超時）」：x21、y315.625、width348、height17.90625。

每次量測documentElement.scrollWidth與body.scrollWidth都是390，無頁面水平溢出。本場三段展開後即可同時落在視窗內，捲動API能定位，不冒稱有必須長距離捲動的案例。這是矩形／可見性驗證，未另做遮擋命中測試，不等同手機人眼字形、閱讀感與觸控手感。

證據：run.log三筆mobile-item。

### 3. 無明列出口fallback：成功（明示合成內容fixture）

唯讀盤點現有scenario/map，未找到可直接採用的無exits自然場景。用Playwright response route在記憶體中將現有dist內map/playable-battlefield的exits資料由[{x:0,y:2}]改為[]，其餘scenario、邏輯與renderer不改。精確匹配原宣告才替換；未寫dist、未修改DOM或假造標記。經既有content loader、controller與renderer建立廢墟回收戰場。

12x8圖得到36個「撤離點」標記（等於四邊格數2×12＋2×8−4）。抽查(0,0)文字為「.撤離點」，不是「出口」。title、data-tip、aria-label都含「邊界撤離點：移動到此格後，須使用『撤離』才會退出本場戰鬥；僅抵達邊界不算完成抵達出口或護送目標。」mission退場說明也改為「每台單位須各自到地圖邊界撤離點使用『撤離』」。原情境目標仍是擊敗／擊退敵軍，沒有擅改成抵達出口或護送目標。

證據：run.log的fixture-data、fixture-mission、fallback-cell、fallback-count。這證明真渲染的fallback標記與提示，不代表自然戰役出現空exits，也未另驗抵達／護送實際勝負或執行撤離後果。

## 命令、產出與清理

專案根目錄執行一次（外層shell非鎖，僅保存PID、log、exit）：

```sh
d=wf/workflows/dispatch/handoffs/playtest-gap-1124
(sh scripts/heavy-lock.sh node "$d/play.mjs" >> "$d/run.log" 2>&1; printf 'attempt1=%s\n' "$?" >> "$d/run.exit") & echo $! >> "$d/runner.pid"
```

attempt1=0，無失敗重跑；run.log有completed=true、cleanup=own browser/server closed。沒有pageerror或console-error事件。finally關自己的browser/server；PID3835796終局已不存在，無本線Node程序，4187無監聽。git diff --check exit=0；核對在verify.log。靜態探索曾因猜錯ops boot路徑回報不存在，未因此啟動其他runner，也不是工具權限拒絕。

產物固定6檔：本REPORT、play.mjs、run.log、run.exit、runner.pid、verify.log；容量核對附verify.log，低於2MB，REPORT低於8KB。只寫本線handoff目錄。

## 未做到／需要決定

固定三項都取得對應證據，未發現需本線修復的產品缺陷；無待本線決策。歷史summary以控制器掛鉤觸發選取重繪，未額外驗日期更新觸發；fallback僅合成資料，不聲稱自然覆蓋。未驗手機實機／視覺、瀏覽器差異、具名敵機第四項、平衡、效能或長戰役。log是觀測證據，runner exit0表示流程完成，不拿它單獨代替功能斷言。

工具經驗：保存舊節點身分並核對isConnected可證明真重繪；summary上的focus與選取是不同語義。手機要先展開再逐段量測。合成場景可在記憶體改單一內容資料後交給真renderer，但必須明列資料改動和自然覆蓋限制，不能改DOM冒充產品結果。

## 供main轉成十分鐘實機路線

使用使用者既有服務URL（本線4187已關），附?seed=3&anim=off#/ops；如需完全同起點應開乾淨遊戲context，不覆蓋既有存檔。

0–2分：進契約頁，以Tab／Enter選朝廷「偵察：吉大港」，確認委託者及詳情一致，按A接約、航向目標、W推進到抵達，再出戰編成及Enter。若彈事件，依畫面選擇可用選項。

2–5分：在手機窄視窗展開「撤退與時限」，確認目標、撤退、時限都讀得到且不用左右捲動；留意本場是明列「出口」，不是fallback。可用W待機，約9次到第3輪結束；以畫面實際回合／提示為準。

5–8分：返回營運，進契約頁展開「已結束」，Tab到完成列、Enter選取，確認完成詳情、選取外觀與焦點；再Tab確認續行。summary在日期／外部更新後保焦點不能由這條簡短自然操作完整重現，不冒稱人工必測成功。

8–10分：補看窄版文字、縮放與操作手感並記下重現步驟。fallback需要本線合成fixture，正式自然入口不能保證出現；main應把它列為自動補驗已覆蓋／人工路線不強求，不要求使用者修改存檔或正式資料。

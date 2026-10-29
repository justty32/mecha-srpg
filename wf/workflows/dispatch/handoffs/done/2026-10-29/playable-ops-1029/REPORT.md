# 營運存取與完整循環

> **子線階段報告。** 最終整合驗證及交付見[主REPORT](../lead-playable-1029/REPORT.md)；下文保留當時交接狀態，並非最新整體待驗清單。

## 做了什麼

根因是 `src/ops/sortie/run.ts` 值引用 `src/sim/index.ts`，其 barrel 再 export Node CLI；CLI 使用 `node:fs` named imports，營運瀏覽器懶載入因此夾帶 Node 專用入口。經隊長擴檔核准，改直接引用 `sim/run.ts`。另一問題是殼在載入成功前就設 `opsStarted=true`，失敗後永久不能重試；已改成功才鎖定，錯誤有 alert 與重新載入按鈕，也能再導航重試。

延伸尾段已依最新spec及engine共同確認採既有 BattleResult.loot 的 owner?/collected? 契約，沒有新增 collectedSalvage。apply.ts 只入玩家明確回收；同來源舊loot與重複回收去重，已回收來源不再發整屍選擇或自機部件；材料沿用post、容量溢出stash及sortie結算去重。

效能延伸：經隊長授權只修改controller.ts／controller.test.ts，內部快照懶建並由snapshot/key共用；公開snapshot保持深拷貝，key使用既有action拷貝。dispatch入口無條件失效，fromSave清空。新增內容require讀取計數反例，驗重複讀取不再建模、UI更新重建、快照與按鍵action隔離、help context／拒絕訊息／讀檔。尚未跑此新增回歸。

歷史失敗測試修復（隊長另授兩測試檔）：MCP真實出戰／存讀測試保留28日世界推進，透過campaign_actions市場目錄及campaign_act合法批量補燃料，依實際庫存／現金／船容量限制；契約按燃料與天數選擇，要求保守往返與迴避餘裕，航行續行前明確診斷燃料。campaign.test的idle12月與長wait移除104/132固定日期，改要求唯一no-pilots終局、終局當日停止、所有日誌／onDay不超過終局日、pendingTicks0及最後當日DaySummary。未改產品數值與黃金；兩檔尚待隊長排程驗證。

## 產出

修改 sortie/run、dom/main、dom/shell、dom/shell.test、ops/dom/main 與 e2e/ops-campaign.spec ，另延伸修改 apply.ts／apply.test.ts，，加controller兩檔共十個程式檔。保留直達完整新戰役到戰果循環，新增頁內營運導航與切回戰役保留測試。依賴圖回歸同時注入舊 barrel 邊，要求舊圖變紅、新圖變綠。唯讀診斷確認全部內容 errors 為空、seed=3 的 OpsController 能建立第一日快照；git diff --check 通過。

apply.test.ts 新增四個回歸，涵蓋玩家材料、撤退保留、重複來源／重結算、容量stash、非玩家排除、怪獸不再選屍體、自機殘骸不再出部件；此延伸尚待隊長授予單檔測試時段，未執行。

## 沒做到或證據不足

隊長授予唯一單檔測試時段後，已執行 nice -n 19 node --test --test-concurrency=1 src/ui-adapter/dom/shell.test.ts，exit 0、5/5 pass、0 fail、23.826秒，測試時段已釋放。含原故障圖反例被擋及修復圖通過。目前尚未執行全DOM、build、e2e；不能宣稱瀏覽器實測通過。其後隊長統一安排 npm run test:dom、npm run build、npm run test:e2e（包含原直達完整循環及新增頁內導航）。另有既有 e2e 燃料風險：開局40/120，直接選第一契約且遇敵一律選第一可用選項；迴避會額外耗燃料，後續續航可能因 insufficient-fuel 被禁用，測試未補給。尚未實跑證實 seed=3 會觸發，需隊長取得快照後決定測試使用原生補給或可負擔契約。靜態圖檢查只檢查靜態值 import/export；實際 Vite dev 的瀏覽器驗證仍有價值，build 可能 tree-shake 而掩蓋舊問題。

後續實測更新：隊長headless營運導航／返回保留案通過，完整循環於航行keyboard.press(w)碰總30秒timeout；實際error-context顯示第2日、40/120燃料、吉大港剩1天，故本次失敗不能歸因燃料耗盡。已在e2e加入低額外成本階段elapsedMs與既有snapshot day/fuel/route/lastLog記錄，待隊長排程重現分辨總時限與單次推進成本；未增timeout或改平衡。隊長90秒診斷後確認完整循環通過51.3秒，階段載入1秒、出約9.8秒、世界圖17秒、起航24.8秒、航行後29.4秒，證明是累計成本而非死鎖或缺油；快取修復後待隊長原30秒再驗。

## 需要決定

無產品裁決需求。測試時段與實際瀏覽器證據由隊長安排；需同步 code-map 說明 lazyPage 成功鎖定／重試接線（該檔不在本線寫入範圍）。後續工具：node 單檔測試、既有 Playwright headless 與 Vite，皆不需新增套件。

## 營運區域文字修復（後續授權）

使用者實際需求為一區一名稱，普通格不常駐文字。原DOM證據：1280×800時原比例648格全部有字；半比例2592格全部有字且重複160個區名，「琥珀誓海」36×14px文字溢出12×12px格。修改七檔：ops/vm/types.ts、world.ts、world.test.ts、ops/dom/world-map.ts、ops.css、render.test.ts、e2e/ops-map.spec.ts。VM依全圖各region最大四連通片，取片內最接近平均位置的實際格，穩定ID與anchor不隨pan/zoom重選；未知anchor不公開，純版圖結果弱快取。DOM只保留船／地點／行動者標記，普通格地形以色塊呈現，區域名獨立overlay每ID一次；詳情與aria保留，移除nth-child抽樣定位。

/tmp建置通過（0.895／1.17秒）；世界VM與營運DOM單檔串行20/20通過、0失敗、24.97秒。無GUI、無截圖的headless矩形回歸初紅抓出1px重複邊框偏差，已修正overlay inset0。其後18組（1280/1024/480視窗×1/½/¼縮放×平移前後）通過，最大位置誤差0.011875px，普通格可見文字0，每ID唯一，格圖可視標籤1、全圖26；測試7.3秒、程序9.3秒，runner已釋放。

這輪同時揭露480px既有三欄把地圖擠成1格寬，當時綠燈只證標籤座標，不能稱手機可玩。經另授權加ops專屬≤760px最小responsive規則：導航四欄兩列、兩側資訊改地圖上下排列，360px地圖列與下方180px記錄保留全部導航／資訊。回歸加每組labels>0及窄窗地圖寬>視窗60%。此後CSS與回歸已code freeze，待隊長整輪typecheck/check/build及返還唯一時段，再驗最終18組；不得引用前一版綠燈當作窄窗修復已驗。未碰戰鬥shared grid-view或使用者Vite程序。

## 完整suite後受影響舊測試

依隊長逐檔授權更新舊契約測試：encounter完整新結構hash與剝除objects/features後原結構＋RNG hash雙驗；scenario改驗createBattle最終terrain大小與feature地形/HP，保原單位及目標；perf排序oracle納入min(AP,整回合剩餘移動額度)且成本／順序逐格相同；monster-def驗moveSpent=0與其他新欄省略後，只再剝moveSpent，原hash與HP+1負對照維持。隊長post-full受影響九檔93案92過時，只剩part-aim一紅。

part-aim真診斷（/tmp/playable-part-aim-diag.log）證body與core命中皆100、preview傷害皆5.25且無擊殺；進度權重1時score0.42/1.4、權重0時0.42/0.42，是巢母spawner目標最低傷害分令兩者同分，不是AI違反選擇也不是無傷。測試僅關閉objSpawner以隔離核心進度權重，補不瞄preview正傷害及關權重後bodyScore嚴格勝coreScore兩前提。唯一單案回歸exit0，1/1 pass、0fail、757ms，證據/tmp/playable-part-aim-single.tap；原核心快破選瞄、權重覆寫選不瞄與tinycore幾何低命中選不瞄皆保留。runner隨即釋放，未重跑全檔或93案。

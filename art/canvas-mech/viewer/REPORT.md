# cx-canvas-ui-1028 交付報告

已完成本輪獨立離線展示整合。正式接口 1.1.0，184 節點、94 葉、深度 5；52 接合與 104 requiredCoverage 原樣交畫件。領導與本線親看第二張完整機，通過基本連續可辨的整機門檻；本版既定 11 項 CDP 互動驗證 exit 0。子代理 0，未改 core／drawing、未代畫、未讀舊美術、未改根 package／lock、未安裝 browser 或額外依賴。

做了什麼：Konva custom Shape 依獨立畫序，單次套用 core 世界矩陣，再呼叫 drawLeaf；真實層樹展開／搜尋／選取／顯隱／Solo、父動子隨、三姿態、近側抬臂屈肘屈膝、播放暫停還原、逐層分解組裝、骨架接點、縮放與 DPI。父層顯隱依語義樹，姿態依 rig。分解層深只限制位移累加到哪層，0 層原位組裝，葉始終保留；除顯式分解外不加幾何偏移。READY 頁使用操作說明，未放施工或下載資訊。

產出：可直接 file 開啟的 [單頁](../index.html)、[使用說明](../README.md)、build.mjs、headless.mjs、viewer 與 vendor。HTML 以 import map 與 data URL 內嵌每個 ESM／JSON 一次，無 CDN、fetch 或外部檔案；不依賴 bundler。新核心雜湊為 `f1b97b47699338a391a1f739c92cdf51e68169df5203f3e6c9f9d4735669bcfa`，jobsHash 為 `aedd37267a21e6edeb197fd0c4339a16d4919bdd3252d622180ec56743362d7b`。

實際命令：`node art/canvas-mech/build.mjs` 核對 vendor、核心 manifest 全檔 SHA256、planHash、LeafJob 全等、畫件雙 hash／94 葉覆蓋／每葉 signature、合法姿態與未知／超限關節反例。Node 亦實際 import 內嵌核心驗同 hash。`node --test art/canvas-mech/viewer/embed-modules.test.mjs` 專項 4/4，涵蓋 JSON import 正例、缺 attribute／越界反例及 import map 去重。建置另有 vendor 雜湊篡改與 fetch 注入的 exit 1 反例，還原正例後通過，證據見 [build-checks](evidence/build-checks.json)；最新數量與容量見 [build-evidence](build-evidence.json)。

本版 `node art/canvas-mech/headless.mjs` 11 項通過：深層樹實際展開選取、父層顯隱與 Solo、184 節點逐一 DOM 選取／顯隱／Solo、抬臂父動子隨與屈肘屈膝、三姿態、播放暫停精確還原、分解層深 0／1／2 與骨架、非法操作反例、縮放／實際 DPI canvas 像素／窄視窗、無 JS 錯與無外部請求。初始 READY／idle／explode 0／94 可見葉；loadFailures、errors 皆空，僅 file 主文件與 data 內嵌模組。完成後 browser 已關，pgrep 無 profile 殘留。[結果](evidence/headless-result.json)。核心 46／畫件 9 項由領導親跑，本線未重跑遊戲或額外套件。

必要 PNG：[待機](evidence/complete-1.1.0-idle.png)、[舉盾瞄準](evidence/complete-1.1.0-shield-aim.png)、[低姿支撐](evidence/complete-1.1.0-low-brace.png)、[分解與骨架](evidence/complete-1.1.0-exploded-skeleton.png)。領導已親看所有姿態與分解圖，主線也確認基本整機通過；本線親看待機及兩姿態。[基本視覺判定](evidence/visual-review-1.1.0.json)。所有舊 PNG 保留。每次取圖先算整包，再用實際 PNG bytes 計算寫入後容量，超 15,000,000 bytes 即拒寫；最終整包約 9.75 MB，未超 160 葉／260 節點／15 MB gates。最終建置連跑同 HTML SHA256 `0fc3d2d0762ef29238df8d8ca23ae576a7374a2f81146dff888fcf2ded678a56`，可重現。

授權環境：`node art/canvas-mech/viewer/setup-env.mjs` 從官方 npm registry 下載固定 Konva 10.9.0，驗 npm integrity，vendor 保存 [MIT license](../vendor/LICENSE.konva) 與 [來源／SHA256](../vendor/SOURCE.json)。四個官方 Ubuntu noble deb 依 apt-cache show SHA256 驗證，用 dpkg-deb -x 解到 ignored node_modules/.canvas-headless/root，不 sudo、不系統安裝。只為 headless 設 LD_LIBRARY_PATH，既有 Chromium 1243 的 [ldd](evidence/ldd.txt) 無 missing。[四套件來源與 SHA256](evidence/environment-packages.json) 為 4 列，欄位 name、version、url、sha256。

修訂證據：首版功能通過但 [首圖](evidence/complete-first-v1.png) 呈散件間隙，領導／astra／本線判定視覺不過，轉由原線重配 v1.1，沒有用 viewer 偏移掩蓋。[首版視覺判定](evidence/visual-review-v1.json)。新版 JSON module 最初被 connect-src 'none' 擋下，CDP Log／Network 明示 blocked:csp；修為 connect-src data:，只允許內嵌資料、禁止外部網路，實際 Chromium 載入與互動已通過。巢狀 data URL 曾逼近容量 gate，改 import map 去重後完整 HTML 約 586 KB，沒有刪舊檔。

沒做到或證據不足：固定前側 3/4、2D 關節展示，不是 3D 或接地 IK；尚未接遊戲／Spine。美感尚非定稿，本輪以基本連續可辨與互動為完成門檻。未承諾所有瀏覽器版本均可使用，實測為既有 Chromium 1243。

需要決定的事：本線無待裁決項；後續畫風或比例調整由使用者回饋再開工作。本線曾觀察 2 條 legacy 既存 broken，不越界修；最終全庫 wf-lint 由領導負責，本線不再重跑。

以後交接書應點名：Node 24 WebSocket／直接 CDP、Log.entryAdded／Network.loadingFailed、Page.captureScreenshot、import map／JSON MIME／import attribute／CSP connect-src data:、apt-cache show、dpkg-deb -x、ldd、npm integrity／SHA256。功能 PASS 與人工基本視覺門檻分別記錄。

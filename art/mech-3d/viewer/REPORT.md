# cx-mech3d-ui-1028 交付報告

做了什麼：完成全新衡岳真 3D 的離線 Three.js 展示、Orbit 360°、hero／正側背相機、物件 Raycaster 點選與真層樹同步、搜尋、父子顯隱／Solo、正式肩肘膝控制、三姿態／播放停／精確還原、逐層爆炸、DPR／響應式、PBR 攝影棚陰影與背側冷 fill。viewer 只套正式 column-major 世界矩陣與顯式爆炸，原樣交 jobs 的 details／faceBands／requiredCoverage，未修改模型幾何或材質配方。子代理 0；Canvas 全唯讀，未借舊美術，未改遊戲／根 package／lock、未 commit／push。

產出：[單頁](../index.html)、[操作說明](../README.md)、build.mjs、headless.mjs、viewer／vendor。接口 1.1.1，planHash `29db6c1fc23f101bc3b6678bf28ba93dbab116c42c366161bc0e9d06df6e4991`，jobsHash `7c974ab8d01f4bf05fbfd1c6540713dc56e65dfebe82b416723efc3a0c1bb654`。180 節點、96 葉、56 接合、112 覆蓋、深度 4。本線源模組均低於 300 行。

`node art/mech-3d/build.mjs` 通過：固定 vendor SHA256／版本；model manifest 全來源 SHA、validateModel、工作單快照全等、canonical 總 hash／每葉 hash；三姿態 finite 世界矩陣、未知／超限角反例；模型提供的靜態分配、承力球、接合與厚度證據。實際呼叫官方 createLeafMesh 建立 96 葉、102 solid、10688 triangles，最小 geometry 厚度約 0.04m，finite／local bounds 通過。這是核正式工作單與幾何，不由 viewer 重造承力配方。[建置證據](build-evidence.json)。

`node art/mech-3d/headless.mjs` 最新 exit 0，共 13 項：真 WebGL2／SwiftShader 與 render calls／triangles、49 點 framebuffer 像素、正面光窗射線、凍結數量映射、Orbit 真拖曳與正側背不同像素、真實物件點選與層樹同步、180 節點逐一顯隱／Solo／選取與父層傳遞、正式 rig 父動子隨、三姿態／播放停精確回初始、爆炸層深 0／1／全部、非法操作反例、DPR 真畫布與響應式、無頁面錯與外網。隱藏 root 後實際 render triangles 降低，不以數場景冒充渲染。[結果](evidence/headless-result.json)。browser 已關，pgrep 無該 profile。

實際 renderer 為 ANGLE／Vulkan 1.3.0／SwiftShader Device (Subzero)，初始主場景讀到 render calls／23298 triangles，像素資料以 base64 保存。僅請求 file 主文件，errors／failures 皆空。正面 camera [-.155,3.1984,10.4841]，visor firstHit 自身可見；brow 中心 firstHit jaw，誠實保留，不宣稱 4/4。hero 造型已由主線通過；本線親看側／背／guard／分解，背部雙柱／百葉與側向厚度、朝前短杖可辨。六圖同檔更新，不增版本圖：[hero](evidence/hero.png)、[front](evidence/front.png)、[side](evidence/side.png)、[back](evidence/back.png)、[guard](evidence/guard.png)、[exploded](evidence/exploded.png)。當前 PNG 共約 1.28 MB、整包約 3.80 MB，低於 6 張／8 MB 與 25 MB gates。

授權工具：以 `npm --prefix node_modules/.mech3d-tools --cache node_modules/.mech3d-tools/cache --registry https://registry.npmjs.org --no-audit --no-fund --update-notifier=false install --ignore-scripts --omit=optional --save-exact three@0.186.1 esbuild@0.28.2 @esbuild/linux-x64@0.28.2` 僅局部安裝 3 個固定包。官方 metadata 的 integrity／tarball 與 npm lock 相符；esbuild binary SHA256 與官方 binaryHashes 相符。vendor 僅必要 runtime、[Three MIT](../vendor/LICENSE.three)、[三套件來源](../vendor/SOURCE.json)（name/version/url/integrity/license）及 [runtime integrity](../vendor/integrity.json)，工具留 ignored，不寫 HOME／系統。不下載 browser／Playwright。

環境準備為 `node art/mech-3d/viewer/prepare-vendor.mjs`。既有 Chromium 1243 沿用 Canvas 的局部函式庫，只對本命令設 LD_LIBRARY_PATH；[ldd](evidence/ldd.txt) 無 missing。browser profile／XDG／cache 全在 ignored 工具目錄。HTML 是 esbuild 全內嵌 IIFE，無外部 import／fetch 執行／CDN／紋理請求，CSP 禁止外網。`--framework` 僅環境 smoke，最初 49 pixel／26 色、1922 triangles 與相機點擊通過，不能當整機驗收。

修正紀錄：先前頭光窗被胸甲擋，模型主責以正式 spec／hash 1.1 再重建；眉板再最小回縮為 1.1.1。viewer 沒有補位。相機 preset 清除 Orbit 阻尼並即時更新 matrixWorld，修正 render 前 project／raycast 時序；播放測試改等實際角度前進，避免固定 350ms 假設軟體渲染速度，並防負 rAF 時差。完整既定驗證已重跑通過，不再擴美術或功能。

沒做到或證據不足：未接遊戲／步行／物理／IK；軟體渲染不代表 GPU 效能或所有設備速度；眉板中心仍由面罩遮住，感測光窗本體已通過。未以 headless 自動分數取代人眼美感，主線已通過本輪 hero，細節依後續回饋再開工作。

需要決定的事：本線無剩餘實作阻塞；最終全庫 wf 檢查由領導統一執行，不跑額外遊戲套件。以後交接應點名 npm --prefix／repo cache、官方 integrity／binaryHashes、esbuild、THREE 注入／OrbitControls、Node 24 WebSocket／CDP、ANGLE SwiftShader flags、UNMASKED_RENDERER_WEBGL／gl.readPixels、Raycaster 與精確 camera／target、Page.captureScreenshot、ldd，以及同檔六圖容量 gate。

# 衡岳 · 三維整備展示間

直接用支援 WebGL2 的瀏覽器開啟 [index.html](index.html)，網址為 `file:` 即可；不需伺服器或網路。預設為斜角 hero，模型是有實際厚度的三維實體，可繞到側面與背面觀察。

目前接口 **1.1.1**，180 個組裝節點、96 葉、56 接合與 112 覆蓋約定。hero 造型已通過主線評閱，13 項真實 WebGL2／互動驗證通過；正面感測光窗的 raycast 可見性已核對。

- 在模型上拖曳可 360° 環繞旋轉，滾輪縮放、右鍵平移。下方按鈕切換正面、側面、背面、斜角；「貼合」回到正面框景。
- 點實體零件會選取並展開左側層樹；也可點樹上的名稱選取。搜尋支援名稱、用途與 ID。
- 每列 ●／○ 控制顯隱，父層隱藏會連同子層隱藏。S 只顯示該層及其子層；「解除 Solo」與「全部顯示」恢復檢視。
- 右欄選待機、戒備、低姿支撐；肩／肘／膝滑桿控制左側正式關節。播放會在預設姿態間過渡，再按可暫停；「還原」恢復初始姿態、顯隱、分解及斜角相機。
- 「爆炸分解」調整拆解量，「分解層深」指定拆到哪層。0 層回到組裝，不會讓所有葉消失。像素密度可選自動、1× 或 2×。

本頁使用 Three.js 0.186.1，採 PBR 材質、攝影棚陰影與冷色背側 fill。是單台展示，尚未接遊戲、步行或接地 IK。厚重塊面與內收頭艙是目前風格；眉板中心會被面罩遮住，感測光窗本體可見。軟體 SwiftShader 只用於自動驗證，不代表實體 GPU 效能。

在專案根目錄執行 `node art/mech-3d/build.mjs` 重建全內嵌 HTML；`node art/mech-3d/headless.mjs` 執行既定互動驗證並更新同 6 張圖，`--first-frame` 僅更新 hero 並驗光窗。工具需要既有 Chromium 1243 與局部依賴，環境及來源詳見 [REPORT](viewer/REPORT.md)。headless 依專案排程單一執行，完成關閉瀏覽器。

圖像：[hero](viewer/evidence/hero.png) · [正面](viewer/evidence/front.png) · [側面](viewer/evidence/side.png) · [背面](viewer/evidence/back.png) · [戒備](viewer/evidence/guard.png) · [分解](viewer/evidence/exploded.png)。

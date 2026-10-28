# 礁鷹機甲整備台

直接以瀏覽器開啟 [index.html](index.html)，網址為 `file:` 即可。頁面已包含所有程式與畫件，不需伺服器、網路或 CDN。

目前為接口 **1.1.0**：184 節點、94 葉、最大深度 5，具有 52 接合與 104 處必要覆蓋。第二張完整機已由領導與整合工親看，通過「基本連續可辨整機」門檻；本版 11 項 CDP 互動驗證通過。

- 左欄點箭頭展開真正父子層級，點零件名稱選取；搜尋可依名稱、用途或 ID 找零件。
- 每列的 ●／○ 切換顯隱，父層隱藏會連同子層隱藏；S 只顯示該零件及子層。「解除 Solo」或「全部顯示」恢復檢視。
- 右欄可選待機、舉盾瞄準、低姿支撐；抬臂、屈肘、屈膝滑桿調整近側關節。播放後可暫停，「還原」恢復待機、顯隱、Solo、分解與骨架設定。
- 「分解組裝」調整分解量；「分解層深」指定逐層分解到哪層，0 層回到組裝，1 層拆大部位、2 層拆子總成。層深不會隱藏葉零件。「骨架與接點」可疊加檢查。
- 縮放與像素密度可獨立調整；「貼合視窗」恢復 100% 縮放。像素密度可自動或指定 1×／2×。

固定前側 3/4 的 2D 投影，使用 Canvas 與 Konva 10.9.0。這是獨立展示，尚未接遊戲或 Spine；低姿支撐是關節姿態展示，沒有腳接地 IK。美術以基本連續與可辨識為本輪完成門檻，尚未做完整美感定稿。

在專案根目錄執行 `node art/canvas-mech/build.mjs` 可重建單頁；`node art/canvas-mech/headless.mjs` 執行既定 11 項 CDP 驗證並保存待機與必要姿態圖；`node art/canvas-mech/headless.mjs --first-frame` 只驗載入與待機圖。測試使用既有 Chromium 1243、Node 24 WebSocket 與局部函式庫，環境準備細節見 [驗證報告](viewer/REPORT.md)。重負載需依專案排程單一執行，工具會關閉瀏覽器。

繪圖接口為 `drawing/index.js` 的 `drawLeaf(ctx, job, visualState)`：ctx 已套一次 core 世界矩陣，畫件使用葉局部座標；requiredCoverage 原樣交給畫件。顯隱／Solo 依語義樹，動作依 rig；分解以明示位移呈現，不改核心幾何。

可查看 [待機](viewer/evidence/complete-1.1.0-idle.png)、[舉盾瞄準](viewer/evidence/complete-1.1.0-shield-aim.png)、[低姿支撐](viewer/evidence/complete-1.1.0-low-brace.png)、[分解與骨架](viewer/evidence/complete-1.1.0-exploded-skeleton.png)。來源、雜湊、驗證結果與修訂紀錄集中於 [REPORT](viewer/REPORT.md)。

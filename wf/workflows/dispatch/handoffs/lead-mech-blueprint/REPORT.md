# 機甲配置重做：整合驗收

## 結果與入口

離線入口：[機甲配置工坊](../../../../../art/mech-blueprint/index.html)；製作、重建及邊界見[原型README](../../../../../art/mech-blueprint/README.md)。依使用者貼圖製作一台固定視角 2D 剛性機甲：先由程式配置8大部位、25機構總成、18骨與64份工作單，再按單件各畫一份獨立SVG；語意樹、骨架、插槽、局部幾何與畫序分離。64件可獨立隱藏／單看，入口初始顯示完整成品，並可檢配置、分件、骨架與左右抬臂／屈肘／屈膝。舊展示頁已加新入口連結。

原型最後為`blueprint-4`。初版肩頸腕腰多處斷鏈；回配置增加窄頸座、胸肩叉、腹腰軸與真髖座、腕踝榫、背包橫架，再重畫受影響的實體件。真SVG承力鏈按24介面×bind及六路徑21點共3048次均有界接觸；左右手對骨盆252次無交集。左腕投影紅區追到凸包浮點端點遺失，修共同算法並加入多角度回歸，沒有加無界遮擋。最後親看全機發現腰軸可視性不足，於既有窄域加厚至21.6單位，再重算附件與重出正式圖。藝術方向符合這次可動零件原型目標，最終畫風偏好留使用者評閱。

## 驗證證據

- 配置：`nice -n 19 node art/mech-blueprint/build.ts`，64工作單、0錯。`nice -n 19 node art/mech-blueprint/build-viewer.ts`，64/64來源實際解析、12方向段共253次姿態檢查、0診斷、0 sampleFailures。
- 核心：`nice -n 19 node --test art/mech-blueprint/blueprint.test.ts`，12/12；保留真SVG移錯胸甲/肩甲紅燈，新增凸包漏角、多角度局部一致、錯frame紅燈、867有限zone確定性回歸。核心與展示線strict TypeScript均exit0。
- file入口：`nice -n 19 node art/mech-blueprint/headless.mjs`，20/20操作檢查；64件初始完整、無施工標記、SVG視覺深度4、0 pageerror，只有本地文件1次request；[interaction.json](../../../../../art/mech-blueprint/evidence/interaction.json)記`completeAcceptance:true`。
- 最終影像由agent及主線親看：[bind](../../../../../art/mech-blueprint/evidence/bind.png)、[骨架](../../../../../art/mech-blueprint/evidence/skeleton.png)、[分件](../../../../../art/mech-blueprint/evidence/exploded.png)、[抬臂](../../../../../art/mech-blueprint/evidence/raise-arm.png)、[屈肘](../../../../../art/mech-blueprint/evidence/bend-elbow.png)、[屈膝](../../../../../art/mech-blueprint/evidence/bend-knee.png)。舊partial.png只保留試接歷史，不當正式證據。
- README兩個重建命令由領導再次實跑，86個來源檔與10個生成檔在命令前後SHA-256逐檔完全相同；重建只讀原型內data／parts／程式，不依賴wf規劃資料、交接腳本或/tmp圖片。`bash wf/tools/wf-lint.sh --strict .`通過（0 broken／oversize／biglist／local）。
- 原型104檔約6.83MB，加本線交接資料及導流／code-map／偏好仍低於150檔、15MB雙gate；本線無未收工工人或背景程序，沒有下載、依賴安裝、GUI、刪檔或遊戲程式碼改動。

## 限制與後續

本次只驗固定視角的2D剛性部件、規定六條動作路徑及其往返採樣；沒有任意轉身、IK、3D物理碰撞、步行、遊戲接線或Spine格式匯出／相容實測。使用者對畫風及手感的主觀評閱另留主線行政記錄；不把自動驗證稱為該項認可。

依本次經驗，未來交接書應點名`view_image`親看參考與全機圖、headless Chromium／Playwright file入口操作、`rsvg-convert`離線全尺寸組裝檢視、真SVG接合介面有限量化、node單檔反例、strict TypeScript、`wf-lint`及精確git範圍核對。socket對齊不足以證明視覺承力；每次配置升版要重新核真來源和動作介面。

## 提交與推送

原型、三個舊入口導流、code-map／偏好、母brief與本線工作紀錄共120個明列檔案提交為 `6cc5a1b2 feat: build modular articulated mech blueprint prototype`；逐檔`git add -- <path>`，未用目錄級add。`git push origin main`成功，回傳`8d037db6..6cc5a1b2 main -> main`。本REPORT另以單檔提交及一般push；`wf/SESSION-LOG.md`、`wf/workflows/dispatch/CLAIMS.md`與規劃交接由主線行政收線，不在本線提交。

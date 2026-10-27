# 機甲配置工坊

離線入口：[index.html](index.html)。此處是固定視角的 2D 剛性附件原型，尚未接入遊戲。配置、骨架、slot、畫序與獨立 SVG 分開保存；生成 HTML 內嵌資料、素材與程式，直接用 `file:` 開啟，無需伺服器或下載。

參考來自使用者提供的 [Pixiv 作品連結](https://www.pixiv.net/artworks/147708168) 與貼圖；網頁本身無法讀取，實際視覺判讀依貼圖，未查得或聲稱作者與作品名稱。參考重點是白色包覆分片裝甲、藍色尖長甲、暗色內骨架、關節間隙與遮擋；本原型仍是獨立製作流程試驗，畫風與品質待使用者評閱。

配置真相在 `data/design.json`，核心先生成工作單。美術按每張工作單建立一份具局部原點的 SVG，登錄 `data/attachments.json`。`render.ts` 沿核心 `rig.ts` 計算世界矩陣，再將每件附件放到同一舞台；語意樹與骨架鏈都保存在資料，沒有以 DOM 巢狀代替骨架。視覺鏈最多 `svg → stage → attachment → surface → shape` 五層。

重建配置：`node art/mech-blueprint/build.ts`。素材齊備後重建展示與診斷：`node art/mech-blueprint/build-viewer.ts`。後者同時更新組裝、分件 SVG、validation 與內嵌頁面；不能手改生成檔。缺資料、缺件、語法不支援或幾何失敗會回傳非零，頁面明列失敗與實際附件 ID。

展示有組裝、配置、分件三種模式。左側可關閉大部位、總成或單件，選件後可單看、還原；骨架、包絡與接點可疊圖。選件顯示原點、來源、附骨與接點。動作提供左右抬臂、屈肘、屈膝，可播放、暫停、拖進度與回 bind；減少動態偏好會直接到目標姿態。

`verify.ts` 使用核心嚴格 SVG parser 讀實際形狀與描邊，檢查工作單版本、包絡、keepOut、occupancy、接點；實際輪廓每件核對一次，姿態沿已核對的 occupancy 先做 bounds 篩選再做區域交集。每個配置動作段採樣 21 點，檢查 limits、世界接點、畫布與兩件的 2D 投影交集。遮擋例外只讀核心持有的逐對、有界且明列姿態的 `overlaps.json`。每對、每姿態保留首個失敗採樣點和紅色問題區，summary 記錄實際採樣及失敗數。這不代表任意關節角、3D 碰撞、步行或 Spine 格式已驗證。

目前正式來源為 `blueprint-4`，64／64份獨立SVG與附件版本一致。兩個重建命令已實測：配置線執行 `node art/mech-blueprint/build.ts` 得64工作單、0診斷；本線執行 `nice -n 19 node art/mech-blueprint/build-viewer.ts` 得64 parsed、0診斷、0 sampleFailures。六條bind→目標路徑各21點，連同反向回程共12段，再加bind共253次姿態檢查。兩命令只依賴本原型內程式、data與parts，不讀wf交接暫存、規劃表或/tmp參考圖。

最後一次重跑完成於2026-10-27 20:25（Asia/Taipei），已包含pelvis-frame腰軸可視承力帶由20加厚至21.6 units並重新parse的64件metadata；rev4維持不變。build-viewer再次exit0、64 parsed／253次檢查／零診斷；正式 `nice -n 19 node art/mech-blueprint/headless.mjs` 再次exit0、20項檢查通過。file入口初始即完整組裝，沒有PARTIAL／施工標記；實際操作三模式、分件格內置中、三級顯隱、配置祖先顯隱與solo、選件、還原、疊圖、左右六動作、scrub、播放暫停、bind與減少動態。SVG實測視覺深度4，僅file文件本身1次請求、0 pageerror。來源hash與revision記在 [interaction.json](evidence/interaction.json)，`completeAcceptance:true` 指本原型的固定驗收通過。

正式影像均已親看：[bind](evidence/bind.png)、[骨架](evidence/skeleton.png)、[分件](evidence/exploded.png)、[抬臂](evidence/raise-arm.png)、[屈肘](evidence/bend-elbow.png)、[屈膝](evidence/bend-knee.png)。`evidence/partial.png` 保留為較早局部快照，正式證據以上述六張及目前interaction為準；合計七張PNG，維持本線5MB上限。造型品質仍交使用者評閱；固定視角剛性2D與前述驗證範圍不因此擴大。

局部UI模式 `node art/mech-blueprint/headless.mjs --partial` 僅供缺件試接，會明示未完成且不算正式驗收。正式模式必須64掛件及零幾何錯誤才通過；禁止拿局部log或舊圖替代新證據。

手寫程式按責任拆分：`layout.ts` 保留配置與工作單公開入口，搭配 `layout-allocation.ts`（空間配置）、`layout-validation.ts`（識別與畫序）、`layout-motion.ts`（配置動作檢查）、`layout-drawing.ts`（配置及工作單SVG）與 `layout-overlap.ts`（有界遮擋規劃）；附件局部檢查在 `attachment-validation.ts`。`geometry.ts` 保留幾何運算與既有 exports，嚴格素材 parser 在 `svg-geometry.ts`。展示腳本細分見 [viewer](viewer/README.md)，`style.css` 與 `style-responsive.css` 依原順序在建置時合併內嵌。`verify.ts` 保留資產與姿態總驗證，`headless.mjs` 保留互動驗收入口，容量核算在 `headless-budget.mjs`；新增展示來源亦納入該核算。上述拆分不增加瀏覽器資源請求。

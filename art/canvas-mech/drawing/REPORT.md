# 礁鷹 Canvas 葉繪圖交付

已依先配置驗證、再逐葉繪製的流程完成 94 葉、58 種功能輪廓，並以 184 步由下而上組裝記錄交付 viewer。入口為 [index.js](index.js) 的 `drawLeaf(ctx, job, visualState)`；ctx 已由 viewer 套一次 worldMatrix，drawing 僅畫局部 bounds，不改配置或 rig。`createLeafPainter(job)` 可選，亦會在繪製時檢查凍結契約。

採核心 1.1.0，planHash `f1b97b47699338a391a1f739c92cdf51e68169df5203f3e6c9f9d4735669bcfa`，jobsHash `aedd37267a21e6edeb197fd0c4339a16d4919bdd3252d622180ec56743362d7b`。requiredCoverage 納入逐葉 signature；104 接點圓盤以實際主輪廓完整覆蓋，沒有額外孤立圓點或 viewer 偏移。材質工具共用，功能輪廓各自設計。

首版整機 PNG 視覺不合格，已提出 73 筆有限配置修訂並由核心實作、重驗與重新凍結；drawing 隨後僅修改必要的 20 種輪廓。已親看 [第二張待機圖](../viewer/evidence/complete-1.1.0-idle.png)，本輪「基本連續可辨整機」合格：頭頸胸、肩臂、腹髖、股膝脛踝足、短砲與盾可辨為連續組裝機體。

## 驗證與限制

`node --test art/canvas-mech/drawing/*.test.js`：9/9 通過。涵蓋 94 葉 ID/hash、三姿態局部繪製包絡與 ctx 平衡、不重套世界變換、job 異動拒絕、104 圓盤覆蓋、覆蓋失敗反例及逐層組裝順序。圓盤檢查以細分輪廓的邊界距離驗證；Canvas 實際畫面由整合 PNG 親看，兩者不可混稱。核心 `generate.js --check` 已親跑 verified。

親看視覺範圍僅待機 PNG；舉盾、低姿與互動最終驗收由整合線收件。固定前側視角的深度靠尺度與遮擋，不支援 3D 轉身或接地 IK；足底與展示台仍有視覺懸距。頸套外露及盾瓣溝較深列為細節限制，本輪不追加造型工作。

## 來源與接續

全部從本輪凍結葉工作單及新寫 Canvas 路徑建立，未讀取或使用舊藝術產物；只寫 drawing，未改 core/viewer，未下載安裝、開 GUI、派子代理、commit 或 push。

[profiles.js](profiles.js) 為原始功能輪廓，[paint.js](paint.js) 為局部材質畫法，[registry.js](registry.js) 為凍結 ID 對映。[assembly-log.json](assembly-log.json) 保存逐葉到整機的實際組裝序與 job ID；[layout-revision.md](layout-revision.md) 說明交給核心的配置修訂，數值在其資料檔。後續交接應點名核心工作單生成器、tabledb、drawing 單檔測試及由領導安排的無視窗 PNG 工具。外層 code map、全案 lint 與整合驗收由領導收件，drawing 不越界代改。

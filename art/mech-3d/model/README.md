# 衡岳程序化 3D 模型 1.1.1

全新固定零件設計、可從任意方向觀看的真 3D 機甲。96 個有功能的葉件、180 個語義節點；含同葉厚百葉共 102 個封閉實體，暖灰陶瓷甲、深藍灰骨架、暗紅識別面及暖白感測窗。採先 top-down 配置、驗證、工作單凍結，再逐葉建立 mesh 並 bottom-up 組裝；未參考舊 SVG 或 Canvas 造型。

整合接口見 [API](API.md)。純配置入口 [index.js](index.js)，Three 注入建模入口 [mesh.js](mesh.js)。攝影棚、Orbit、樹與互動由 viewer 線負責；model 不讀 DOM、不下載素材、不改 viewer。

凍結版本見 [manifest](manifest.json)，核可建模來源見 [mesh-authorization](mesh-authorization.json)。[assembly-log](assembly-log.json) 記錄實際 Three 物件建立及逐層組裝，包含全部葉 ID、父子順序與版本；[REPORT](REPORT.md) 記錄驗證與視覺限制。

唯讀核驗：`node art/mech-3d/model/generate.js --check`。相關測試：`node --test art/mech-3d/model/*.test.js`。重核實際組裝證據：`node art/mech-3d/model/record-assembly.js`，只寫本目錄的紀錄。幾何變更需先重新配置與核可凍結，不能直接更改 viewer 位置掩飾。

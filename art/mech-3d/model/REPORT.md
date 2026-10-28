# 衡岳 1.1.1 模型交付

## 做了什麼與產出

全新程序化真 3D 衡岳：96 個有功能的葉件、180 節點，含同葉附屬百葉後為 102 個封閉實體／10,688 三角面。頭部暗面罩與暖白感測窗、菱楔雙胸甲、拱肩、收束股甲、稜楔脛甲、背柱與厚排氣百葉、左盾與朝前短杖皆有三維體積。每層包絡／pivot／方向接點由 top-down 配置明列，沒有 runtime auto-fit。

先驗證配置、凍結工作單與來源 hash，領導親核後才逐葉建立 mesh。初版與有限視覺返工均保留凍結／核可紀錄；最新版見 [manifest](manifest.json) 與 [mesh-authorization](mesh-authorization.json)。[assembly-log](assembly-log.json) 保存實際 Three 物件逐葉至整機的 180 步、ID 與子先父後順序。整合介面見 [API](API.md)，正式入口為 `createLeafMesh(THREE,job)`。

planHash：`29db6c1fc23f101bc3b6678bf28ba93dbab116c42c366161bc0e9d06df6e4991`。jobsHash：`7c974ab8d01f4bf05fbfd1c6540713dc56e65dfebe82b416723efc3a0c1bb654`。

## 驗證與親看範圍

最終模型測試 15/15 通過，生成器 `--check` verified。涵蓋固定父包絡、方向接點、唯一根、非法配置、未驗工作單拒絕、三姿態 56 接合同位、112 承力球在解析實體與實際三角面內完整覆蓋、封閉雙流形／正體積／破面反例、厚百葉 bounds、真 Three 法線與陰影 ID、正式世界矩陣和 bottom-up 紀錄。足底 y≈0.01，高約 4.31m。

已親看初版正／側／背與返工 hero；新版 hero 的整機、厚度、關節及分區輪廓已獲主線接受。1.1.1 僅將眉甲局部 z=.62 收至 .54，解決正式正面 fit 相機的感測窗遮擋。模型工人使用 UI 提供的精確 front／hero 相機對實際 mesh 射線，光窗兩角 firstHit 均為自身；原始相機、hash、firstHit 與可見性在 [visibility-evidence](visibility-evidence.json)。整合線回報最新版 13 項互動全過、browser 已關。模型工人已追加親看最新版側面、背面與 guard：側面短杖清楚露出且不再藏入前臂；背柱、中央維修脊與厚百葉可辨；guard 抬臂屈肘後雙手、盾與杖仍連續，未見需返工的主要斷裂。互動通過屬整合線證據，不冒稱由模型工人親跑。

## 沒做到或證據不足

感測窗可見不等於所有頭部零件中心可見：眉甲中心在 front／hero 射線 firstHit 均為暗面罩，visible=false，已列明限制。最初射線腳本要求 visor／brow 四筆都可見，因此 exit1；曾在未檢視工具輸出前錯報「4/4」，已立即向領導及 UI 撤回，原始資料如實保存。收尾門檻為使用者要求的光窗兩角可讀，不再為眉甲中心新增造型修訂。

這是程序化低多邊形試作；沒有全身碰撞求解、物理、IK、步行、動態接地或外部貼圖。三姿態保證有界活動與關鍵承力連續，不保證所有裝甲互不穿插。只寫 model，未讀取或重用舊 SVG／Canvas 造型，未改 viewer、安裝下載、開 GUI、派子代理、commit 或 push。

## 決定與接續工具

主線已接受本輪造型，領導裁示只解除已知遮光窗，不再追加美感或功能。模型源碼停止變更；後續如需調整幾何，仍須先改配置、驗證及核可新 hash，viewer 不代改比例或補位。

接續應點名模型生成器、tabledb、模型針對測試、實際 Three 組裝紀錄器，以及整合線安排的無視窗 WebGL PNG 工具。Three.js 0.186.1 由整合線提供；模型只採注入，Node 契約測試讀本輪 vendor。完整場景／圖片容量、全案 lint 及提交由領導統整。

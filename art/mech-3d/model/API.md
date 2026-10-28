# 衡岳 model API 1.1.1

ESM；純配置入口 [index.js](index.js) 無 Three、DOM、Node 依賴。公尺、右手系、Y 上、Z 前、X 機體右。模型足底 y=0.01，整機約高 4.4。viewer 不補位或改比例。

`configureModel()` 回傳不可變 plan。`validateModel(plan)` 回傳 `{ok,errors,hash,summary}`；ok 才授權此 plan 物件。`createLeafJobs(plan)` 僅接受驗過且未變動的 plan，回傳葉工作單陣列。從 JSON 載回的 plan 必須先重新驗證。

plan 包含 `interfaceVersion,hash,rootId,nodes,rig,poses,connections,materials,summary`。每 node 具有 `id,parentId,name,kind,localTransform:{position:[x,y,z],quaternion:[x,y,z,w],scale:[1,1,1]},bounds:{min:[x,y,z],max:[x,y,z]},pivot:[x,y,z],attachments`。attachments 值為 `{position:[x,y,z],quaternion:[x,y,z,w]}`，均為葉局部。群組包絡已在設計碼明列，不會 runtime auto-fit。

`rig` 是陣列，各筆 `{nodeId,parentId,position,pivot,axis,limits}`。axis 是 `'x'|'y'|'z'|null`，limits 是 `{min,max}` 或 null，單位為度。語義 parentId 與 rig parentId 不一定相同；viewer 不自行推導。左肩 `root.arm-left`：z、[-85,85]；左肘 `root.arm-left.forearm`：x、[-125,10]；左膝 `root.leg-left.shin`：x、[0,100]。右側對稱 ID 同限制。兩髖 `root.leg-left/right`：x、[-45,20]。

`evaluatePose(plan, pose='idle')` 接受名稱或 `{id,angles}`。angles 是 nodeId→相對 rest 增量角度，未指定為 0；未知或超限值拒絕。plan.poses 是 `{idle:{},guard:{...},low:{...}}`，值直接就是 angles，例 guard 含 `root.arm-left:-25` 與 `root.arm-left.forearm:-60`。slider 要保留預設其他關節，可複製指定 pose angles 再改單一鍵。

回傳 `{interfaceVersion,planHash,poseId,byNode}`；`byNode[id]` 是 `{matrix,worldPivot}`。matrix 是含 root 的 **column-major 16 數世界矩陣**，viewer flat leaf Object3D 用 `matrix.fromArray()`、`matrixAutoUpdate=false`，不得再套祖先變換。分解是 viewer 明示的顯示偏移；還原時重新套正式矩陣。

jobs 包含 `interfaceVersion,planHash,nodeId,name,purpose,ancestorPath,localBounds,pivot,solid,style,details,material,attachments,requiredCoverage`。ancestorPath 為根至直接父，不含自身。solid 是工作單中的封閉實體解析配方，已在配置階段檢查接合球完整落入真實體積。requiredCoverage 是 `{connectionId,center:[x,y,z],radius,mateNodeId}`，全部局部公尺。52 之類的數量不得寫死，讀 manifest 實際摘要。

mesh 階段由領導核准凍結後才建立 `mesh.js`，匯出 `createLeafMesh(THREE,job)`。THREE 由 viewer 注入 0.186.1。回傳葉局部原點的 Object3D，`userData.nodeId` 在葉根，子 Mesh 有 castShadow/receiveShadow。viewer 自建 scene root 與 `Map<nodeId,Object3D>`，對 jobs 逐葉呼叫；model 不操作 UI 或 camera。材質為 MeshStandardMaterial，無外部紋理或資產。mesh 的 dispose 可由 viewer 遍歷幾何與材質處理。

凍結產物為 `assembly-plan.json`、`leaf-jobs.json`（wf-table/1 的 rows）、`manifest.json`（含來源 SHA-256、planHash、jobsHash、接合及厚度摘要）。`node art/mech-3d/model/generate.js --check` 唯讀核驗。主責工人先完成這一步並交領導核，再開始 mesh；首個完整模型可渲染時立即通知 viewer。

1.1 新增的 `details` 為同葉附屬厚實幾何配方，含 position/solid/material；不增加語義葉。`solid.faceBands` 指定前後分面材質區。胸／肩／股／脛的截面各別明列，頭暗面罩與光窗前移；短杖改朝前持握以避免杖首藏進前臂，掌接點不變。這些改動經新配置驗證、凍結後才重建 mesh。

1.1.1 僅將眉甲局部 z=.62 收至 .54，使眉甲前緣退到感測窗中心之後；正式正面 fit 相機與 hero 皆需重新射線核驗，不能以舊相機結果代替。

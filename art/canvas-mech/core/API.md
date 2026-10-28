# 礁鷹 core 接口 1.1.0

此接口供獨立 drawing/ 與整合線使用。核心只配置、驗證及求姿態，無 Canvas、DOM 或 Konva 實作。凍結是否完成以 REPORT.md 與 manifest.json 的驗證結果及 SHA-256 為準。

`index.js` 匯出 `configureMech(design = createReefHawkDesign()): AssemblyPlan`、`validateAssembly(plan): ValidationResult`、`createLeafJobs(plan): LeafJob[]`、`evaluatePose(plan, pose = 'idle'): FrameState` 及 `createReefHawkDesign()`。完整欄位型別以 [index.d.ts](index.d.ts) 為準。`drawLeaf` 不由 core 實作或匯出。

`configureMech` 由巢狀 Design.root 從上而下分配節點，產生唯讀 plan。`validateAssembly` 回傳 `{ok, errors, summary, hash}`；成功後才在目前模組實例認證該 plan 物件。從 JSON 載回的 plan 必須重新驗證。`createLeafJobs` 與 `evaluatePose` 拒絕未認證或驗證後被修改的 plan。errors 為 `{code,nodeId,message}` 陣列。

AssemblyPlan 具有 `interfaceVersion, schemaVersion, id, view, palette, rootId, nodes, rig, connections, drawOrder, poses, summary, hash`。nodes 是語義樹的前序展開，每節點有 `id,parentId,name,purpose,kind,localTransform,size,envelope,usableBounds,pivot,attachments,material`；群組亦有自己的尺寸、局部包絡、樞紐與接點。`rig.joints` 的 `{nodeId,parentId,localTransform,pivot,limits}` 是獨立骨架，`parentId` 可與語義樹不同。`rig.links` 指定連桿葉與兩個 `{nodeId,attachmentId}` 端點。`drawOrder` 是葉的獨立 `{nodeId,layerKey}` 映射，絕不依語義遍歷順序排序。

所有位置、尺寸及包絡單位為設計 px；固定 1120 × 1120 前側 3/4 投影，x 右正、y 下正。角度為度，正值順時針；不做 3D 投影或接地 IK。每個局部包絡為 `{x,y,width,height}`，相對自身原點；size 為 `{width,height}`。所有節點都明列接點，接點為具名局部 `{x,y}`。兄弟包絡可以重疊；子包絡在靜止配置轉換後，四角必須落在父包絡。姿態移動可離開靜止分配區，不能將它誤當固定 clip 區。

`localTransform = {x,y,rotationDeg,scaleX,scaleY}`，縮放必須正值。矩陣為 Canvas 的 `[a,b,c,d,e,f]`，欄向量，局部矩陣 `T(x,y) · T(pivot) · R(rotationDeg + poseDeltaDeg) · S · T(-pivot)`；世界矩陣 `parentWorld · local`。pose 是名稱或 `{id,angles}`，angles 以 rig nodeId 為鍵，值是相對靜止角的增量；省略節點為 0，未知節點、無活動關節或超限值皆拒絕。

LeafJob 的 `ancestorPath` 包含 root 至直接父節點，不含自身；`rigChain` 包含骨架 root 至自身。每件有 `interfaceVersion,planHash,nodeId,name,purpose,ancestorPath,rigChain,rigParentId,localTransform,localGeometry,material,occlusion,attachments,pivot,layerKey,restWorldMatrix,requiredCoverage`。`localGeometry` 包含 `bounds,usableBounds,size,linkRestLength`（一般葉為 null）；材質為 palette 的 `{id,base,role}`；遮擋為 `{occludedBy,clipToEnvelope:false}`，occludedBy 是依畫序可能覆蓋且靜止包絡相交的葉 ID，僅供繪圖判讀，不是精確輪廓遮罩。layerKey 是數字二元組 `[pass,order]`，依序升冪繪製。

FrameState 為 `{interfaceVersion,planHash,poseId,byNode,drawOrder}`；`byNode[nodeId]` 有 `worldMatrix,worldBounds,worldPivot,attachments,rotationDeltaDeg,linkage`。attachments 是具名世界接點。一般節點 linkage 為 null；連桿另有 `{start,end,length,angleDeg}`，其 worldMatrix 已以局部 x 軸對齊端點，並依 `length / linkRestLength` 縮放。linkRestLength 是局部長度，世界寬度與厚度均保留遠側縮放。drawing 不得再自行追父節點或旋轉、拉長連桿。

繪製邊界由整合線負責：依 frame.drawOrder 取工作單，在 `ctx.save()` 後套用 viewport（可選）與一次 `ctx.transform(...visualState.worldMatrix)`，再呼叫 `drawLeaf(ctx,job,visualState)`，最後 restore。drawLeaf 的 ctx 已位於該葉局部空間；只畫在 localGeometry.bounds 內，不再套世界矩陣，也不改別件葉。不得以世界包絡當局部座標。

drawing 可以提供 `createLeafPainter(job): CanvasPainter`，其中 `CanvasPainter = (ctx, visualState) => void`；drawLeaf 只做 nodeId 對 painter 的分派。建立 painter 不應修改 job 或 plan。局部內縮 usableBounds 供細節，envelope 是外輪廓上限。形狀由 astra 繪製決定；本核心不提供造型路徑。近側獨立肩甲與膝甲的畫序已另列，供遮擋調整但不得無版本變更改凍結工作單。

1.1 新增 52 條 `connections`：每條 `{id,a,b,radius,tolerance,poses}`，a/b 為 `{nodeId,attachmentId,coverageRadius}`。接點在葉 attachments 明列；radius 是世界設計 px，coverageRadius 是該端局部 px，已補償遠側縮放。三指定姿態兩端須同位（容差至多 0.5 px），完整覆蓋圓盤須在葉包絡內。jobs.requiredCoverage 為 `{connectionId,attachmentId,center,radius,mateNodeId}[]`，center/radius 都是局部值；drawing 主承力輪廓必須連續且不透明地覆蓋整個圓盤，不能只畫孤立補點。此欄只約定必要覆蓋，實際像素仍需 drawing 檢查及 PNG 驗收。

藝術修訂固化於 [layout-revision.json](layout-revision.json)（73 筆）；90 群組的明確逐層局部配置在 [layout-allocation.json](layout-allocation.json)，52 接合的局部點及覆蓋半徑在 [connection-allocation.json](connection-allocation.json)。執行期直接讀取分配後由 configureMech top-down 展開，絕不以葉反向 auto-fit 父包絡。author-layout.js 只供一次性離線設計計算，不在 runtime import 路徑；改明列分配後必須重驗。近遠臂比例 1/.90、腿 1/.94。

生成入口為 `node art/canvas-mech/core/generate.js`；只寫 core/ 內 JSON，`--check` 是唯讀的完整來源與產物漂移檢查。繪圖線應從 assembly-plan.json 載入後呼叫 validateAssembly，或直接 configureMech 後驗證。assembly-plan.json 是原樣 AssemblyPlan；leaf-jobs.json 使用 `wf-table/1` 外框，工作單陣列位於 `rows`，頂層含 `interfaceVersion,planHash,jobsHash`。pose-evidence.json 同樣以 rows 保存三姿態，另有 parentMotion 數值證據。manifest.json 的 rows 為 `{file,bytes,sha256}`，鎖定所有 core 來源與生成產物（不含 manifest 自身），頂層含 frozen、summary、gates、checks、capacity 與摘要 hash。容量含 manifest 自身，不含 node_modules。生成器儲存資料表使用專案既有 Python tabledb，核心執行期不依賴 Python。任何接口或配置更動須重生 manifest，重新跑核心測試後通知整合與 drawing 線。

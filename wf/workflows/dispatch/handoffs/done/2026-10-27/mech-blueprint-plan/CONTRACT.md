# 機甲配置／骨架／獨立部件契約 v1

這是 `art/mech-blueprint/` 的單機、固定視角、2D 剛性附件原型契約；不屬遊戲機制。先依配置產生工作單，再逐件畫，最後組裝。[執行計畫](PLAN.md)｜[實體零件](parts.json)｜[檔案與種子資料](execution.json)。程式線先照本檔建立 `schema.ts`，缺欄不能由美術默默補猜。

## 座標與分離

畫布 `viewBox="0 0 1000 1200"`，右為 +X、下為 +Y；角度單位 degree、正向順時針。機體左為畫面右，`left/right` 永遠指機體。初版固定略帶側面厚度的正面視角，不在動畫時改視角。骨的局部原點就是 pivot，局部 +Y 沿肢段；SVG `viewBox` 可為負值，不代表移動 pivot。

配置樹處理「整機→大部位→機構總成→可畫零件」的空間。語意樹供選取與顯隱。骨架只處理關節與父子運動。slot 把附件掛到骨，attachment 指向局部 SVG。draw order 是獨立的 slot ID 全序。不得用 SVG DOM 父子當唯一骨架，也不能依檔案順序決定畫序。

## 最小型別

以下為需落實的 schema 輪廓；所有資料須有唯一 ID、有效引用與版本。複合資料可直接用物件，不必建立通用 schema 引擎。

```ts
type Vec2 = [number, number];
type Polygon = Vec2[]; // >=3點，簡單凸形、非零面積；不重複末點
type Region = Polygon[]; // 多個凸多邊形的聯集，可表達凹形；不是bbox
type Transform = { x: number; y: number; rotation: number };
type Frame = { bone: string; transform: Transform };
type Joint = {
  id: string; parent: string | null; bind: Transform;
  length: number; limits: [number, number]; // 相對bind的角度delta上下界
};
type LayoutNode = {
  id: string; parent: string | null;
  level: 'machine' | 'major' | 'assembly' | 'part';
  frame: Frame; envelope: Region; // 全在此frame局部座標
  sockets: { id: string; at: Vec2; axis: number }[];
};
type Slot = {
  id: string; bone: string; local: Transform;
  semantic: string; attachment: string;
};
type Attachment = {
  id: string; source: string; element: string; layout: string;
  workOrderRevision: string;
  viewBox: [number, number, number, number];
  occupancy: Region; // 已畫可見輪廓的保守近似，含描邊、不含光暈
  contacts: { socket: string; at: Vec2 }[];
};
type WorkOrder = {
  id: string; revision: string; layout: string; slot: string;
  localEnvelope: Region; keepOut: Region; contacts: Vec2[];
  viewBox: [number, number, number, number];
  role: string; material: string; silhouette: string;
};
type Pose = { id: string; angles: Record<string, number> };
type Order = { base: string[]; before: [string, string][] };
type OverlapRule = {
  id: string; a: string; b: string;
  kind: 'joint-cover' | 'panel-stack' | 'projection';
  zone: { frame: Frame; region: Region }; reason: string;
  poses: string[]; // 明列允許姿態，不准萬用星號
};
```

`design.json` 保存版本、畫布、比例、配置樹種子、部件角色與 material；`rig.json` 保存 bones；`slots.json` 保存 slots；`draw-order.json` 保存 Order；`poses.json` 保存 poses 及順序時長。`layout.ts` 讀種子，自上而下算 envelope、尺寸、frame、socket，輸出 `generated/layout.json`、`generated/work-orders.json`。`attachments.json` 與 `overlaps.json` 是美術完成後的對應與明列例外，由程式線整合；不能由已畫整機倒推成唯一配置來源。

`parts.json` 是規劃清單，不是 runtime 真相；實作依它建立 design 種子。單一來源值不要在生成檔手改。每張工作單含該件局部配置圖與裝配位置，每個 attachment 對應一份獨立 SVG 源檔及唯一根 `g id`；assembly 只作配置／語意分組。裝甲一片／關節軸套一組是附件；螺絲、刻線與同片甲的陰影留在附件內，不灌件數。

## 變換、接點與附件

使用 SVG 六參數矩陣 `[a,b,c,d,e,f]`，點映射為 `(ax+cy+e,bx+dy+f)`。`B=T(bind.x,bind.y)R(bind.rotation+pose.delta)`；`Wbone=Wparent·B`；`Wslot=Wbone·T(slot.x,slot.y)R(slot.rotation)`。根骨 parent 為 null，以 identity 為 parent。bind pose 的 delta 全為零。不得混用絕對角度與 delta。

世界關節點為 `Wbone·[0,0]`；子骨 bind 平移可沿父骨末端，必要偏置必須資料化。槽 pivot 與美術原點固定，禁止匯入時以 bbox 中心自動置中。接點經矩陣轉到同一 frame 後的距離誤差應 ≤1 unit。初版不做縮放動畫、負縮放鏡射、IK、mesh weighting；左右分別工作單，幾何可重用但須正規化為該側局部座標並處理光向。

跨兩骨的液壓桿／線纜不能當一塊硬片綁錯骨。第一版拆成各自附一骨的套筒／活塞或省去跨軸裝飾；只保留接頭罩蓋可承受的滑動範圍。肩甲使用獨立 shoulder-cap 骨或軀幹骨上的槽，必須與上臂分離；若加跟隨規則，只有資料式 `capDelta=0.35*upperArmDelta`，在 limits 內且經全姿態檢查，不寫在美術 path 中。

## 自上而下的空間契約

配置程式先算機體比例與大部位多邊形，再算中層機構的非矩形輪廓、骨支點與活動空間，最後分配 leaf 的局部包絡和接點。輪廓參數是肩楔、胸斜板、收腰、膝盾、長脛片等形狀特徵，不是把正方形反覆切格。bbox 只能當索引與 SVG viewBox。

bind pose 下，子包絡換到父 frame 後須包含在父包絡聯集內；由凸片聯集表達凹形、開口與突出長甲。父包絡不能事後擴成包住任何錯位件的大矩形。移動姿態不對 bind 的父包絡做靜態包含要求；其可動占用以選定姿態及插值採樣的 swept region 顯示，並做相鄰機構診斷。

實際輪廓必須落在工作單 envelope 內，描邊留2 units容差。裝甲實心區不能侵入 keepOut；關節罩等越界只能明列 OverlapRule，指定雙方、局部 zone、姿態及理由。keepOut 為配置階段預留的活動空間，不能以放大容差消掉紅線。美術需回填 occupancy，程式要從實際 SVG path/primitive 採樣核對其覆蓋關係，不能只相信自報的多邊形。第一版只允許絕對 M/L/Z path、polygon、circle、ellipse、rect；circle／ellipse以最大誤差0.75 unit展平，rect不帶圓角。描邊固定round join／cap，需計入半描邊寬。圖形內不加transform、clip或mask；陰影與高光用內部多邊形／漸層。拒絕相對path、曲線命令、use與不支援語法，不建通用SVG parser。

幾何 gate 同時檢查邊穿越和區域差集，不能只查頂點。對 Region 的凸片逐片裁切／差集即可，不引入第三方幾何庫。比對與 collision 報告是 2D 投影診斷，不能宣稱 3D 物理碰撞。正常前後遮擋也需要有界 projection 規則；不可用一條「整個手臂都能重疊」消掉檢查。

## 畫序、五層與獨立 SVG

每個實際 attachment 各自一份獨立 `.svg` 源檔，檔名即 attachment ID，內含唯一根 `g id`。每件按自己的工作單獨立繪製、顯示、附骨；assembly 只作資料分組，不允許先畫總成／整機再切出各件。素材採局部座標，defs只能放該檔所用漸層，不能引用另一附件或整機。首台64件，陰影、刻線、鉚釘等仍在其實體件檔內。

runtime 採 `svg(1)→stage g(2)→attachment g(3)→可選surface g(4)→path(5)`。每個 attachment 根以世界矩陣扁平呈現；骨與語意鏈留在資料中。素材中的 `g` 深度最多根附件加一層 surface；第一版不使用`use`。defs 不當視覺件計數；光效先用額外內部形狀，光暈不充作機械外形。

draw order 初版固定全序，依 `before` 約束驗算無環、每個啟用slot恰出現一次。遠側肢體與背包在後，胸／骨架居中，近側裝甲在前，關節罩跨接縫。若一個附件必須同時在另一物件前後，先拆合理前／後實體件；不靠整台遮罩蓋錯誤。第一版不做動作中的臨時重排，以所有規定姿態可成立的畫序為設計約束。

## 姿態與顯示驗收

至少 bind、抬左臂、屈左肘、屈左膝、左右鏡對應六個動作目標，角度種子見 execution。每段用 smoothstep 0→1，至少採樣21個等時點，檢查 limits、接點、活動區與畫布；檢查的是這些動作路徑，不聲稱覆蓋任意關節角笛卡兒積。屈膝可作懸空展示，不加地面鎖定或步行。

展示提供配置圖、分件檢視、組裝／骨架疊圖三種模式；樹可關大／中／細層、單看與還原；選件顯示局部原點／包絡／接點。動作可播放、暫停、拖曳進度、回 bind，減少動態偏好直接顯示目標姿態。錯誤用紅色越界片／交集及實際件 ID 標示。證據需包含 bind 全機、爆炸分件、三動作影格及診斷摘要。

此資料結構保留未來 Spine 類 attachment／bone／slot 的轉接邊界；沒有驗證任何 Spine JSON 版本，不交付匯出器、不聲稱可直接匯入。

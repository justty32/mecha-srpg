# 衡岳真3D試作交付

Canvas已69403bc2交付後，由本輪立即接新作。Three0.186.1＋esbuild0.28.2／linux-x64固定官方npm包，僅ignored局部工具與cache；Canvas來源成果全唯讀、舊SVG不參考不搬用，根package/lock與系統未改。

astra同持比例、top-down配置及bottom-up葉mesh，sol僅viewer/bundle/CDP。先180節點/96葉/depth4明列3D包絡/樞紐/方向dock，56接合/112實體內接觸球三姿態同位，配置反例與工作單hash凍結後才造mesh。96葉→84總成→root共180步實際Three組裝證據保留。無runtime葉auto-fit父包絡、無完整collision/physics/IK/步行框架。

首front連續實體成立但主線判同種倒角塊面/頭光窗被胸擋，做一輪有界形狀修訂：暗面罩前移光窗、胸菱楔/肩拱頂/股收束/脛高稜、同葉暗色帶與紅識別、厚排氣百葉與朝前短杖。主線hero已認程序化低多邊形prototype足夠，不追大片品質。最後1.1.1僅眉甲z .62→.54，其他造型接合不動。

## 四類驗證

layout/rig/jobs：領導親跑最終純配置9項及generate --check verified；唯一root、各層directional dock/pivot有限/包絡、非法配置/斷連/未驗jobs/角度及循環反例。planHash `29db6c1fc23f101bc3b6678bf28ba93dbab116c42c366161bc0e9d06df6e4991`，jobsHash `7c974ab8d01f4bf05fbfd1c6540713dc56e65dfebe82b416723efc3a0c1bb654`。

mesh/build：領導親跑模型15/15，封閉雙流形/正體積/有限局部bounds/normals/陰影與Three映射、實際三角面完整覆蓋112球，缺面與改單反例會紅。96葉102封閉solid/10688三角，最薄.04m；不是把Canvas片拉厚或貼圖。離線esbuild單HTML、官方包integrity/license/來源、manifest與總/單葉hash及前後一致性由build核對。

WebGL2/CDP：既有Chromium1243＋Node24 WebSocket，重用Canvas已解壓的ignored庫，無新browser或Playwright。真ANGLE/Vulkan SwiftShader，49點像素變化與實際draw calls/triangles、相機與Raycaster/樹/顯隱Solo/關節/播放/爆炸/DPR等實際互動，非只數場景；最新完整13項PASS，browser已關。軟體渲染不宣稱GPU效能。

光窗：原首front visor/brow被胸甲擋有raycast證據；1.1英雄圖後visor被眉甲擋exit1，未假過。1.1.1必要visor正面/hero兩視角命中自身；眉甲中心被jaw遮，原始probe與工人4/4誤報更正完整保存，不宣稱眉甲中心可見。

wf/diff：最終自寫來源/文檔的staged diff --check通過，Canvas來源差異為零；整包3,796,103bytes、六PNG1,275,813bytes，最大自寫源模組153行，均在上限。strict新增code-map超8KB已精簡本輪3D導航；完整重驗broken=2、oversize=0、biglist=0、querycmd=0、local=0、residue=0，只剩兩條既有legacy跨repo壞連結。SESSION本輪條目移除後EOF空白已修，diff --check再核。舊legacy2跨repo壞連結如實報，不越界修；不跑遊戲整合測試。

## 入口與限制

直接開art/mech-3d/index.html。操作/重建見該目錄README；圖只hero/front/side/back/guard/exploded最多6張共8MB內，整包25MB上限，無額外歷史版本圖。正側背結構、材質陰影、Orbit360與可選取真層樹為獨立展示，未接遊戲。

程序化低多邊形造型，不是最終美術定稿。眉甲中心遮擋/局部自遮擋及軟體渲染速度列限制，沒有碰撞/物理/接地IK或步行。細部美感/手感留WAIT_USER。舊四線及三份未追蹤log未動。

領導已親看最終hero/front/side/back/guard/exploded六圖，正側背真體積/背柱維修脊百葉、短杖、guard連接與分層爆炸成立；主線已通過hero基本造型。美感細節不再擴改。

提交前staged whitespace檢查另發現官方Three GLSL字串原有行尾空白/混合縮排，位於vendor/three.module.min.js與內嵌index.html。保留官方來源及其雜湊，不改寫著色器字串；只在whitespace檢查排除這兩個第三方/產生檔，其餘staged來源及文檔全過。此項不屬執行或wf strict失敗。

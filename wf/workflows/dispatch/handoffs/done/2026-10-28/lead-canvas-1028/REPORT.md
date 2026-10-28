# 礁鷹 Canvas 本輪交付

全新離線 Canvas＋Konva 10.9.0 試作，未讀取或搬用舊 art，舊原型保留。整機→大部位→子總成→機構/裝甲組→葉零件，184節點、94葉、最大深度5。語義樹、rig、畫序分離，每層局部配置/包絡/pivot/接點明列。先top-down驗證凍結工作單，才由astra逐葉bottom-up繪製與組裝。

首版idle像散件，主線/領導/astra/UI親看判不過，沒有用renderer偏移掩飾。v1.1以73筆藝術局部修訂、90群組靜態分配及52承力接合同位/104主輪廓覆蓋修正；runtime無反向auto-fit。新版idle已由主線/領導/astra/UI親看通過基本連續可辨整機，不追細部完美。

## 四類驗證

配置/rig：領導親跑核心46/46正反例與generate --check verified，包含錯parent/循環/旋轉包絡/pivot接點/規模/未驗工作單、父動子隨、三姿態、連桿，以及AABB不變但接點偏離/覆蓋縮水的反例。

葉契約/離線建置：領導親跑drawing9/9，94葉三姿態局部bounds/context平衡、不重套矩陣、stale/mutated job與超大圓盤會被擋；104圓盤完整位於連續不透明主輪廓。建置核vendor integrity、manifest全檔SHA、plan/jobs雙hash、全葉映射與signature；單HTML import map/data URL，不fetch/CDN，CSP只許data資料連線。無修改根package/lock。

本機CDP：既有Chromium1243＋Node24 WebSocket，11項完整互動PASS，含184節點逐一DOM選取/顯隱/solo、父動子隨、三姿態、播放停還原、逐層分解/骨架、非法操作、縮放/DPI/窄視窗、無JS錯/外部請求。領導親看待機/舉盾/低姿/分解骨架PNG，browser已關。官方Ubuntu noble局部deb僅解壓至ignored node_modules，不動系統；來源與sha見viewer報告。

wf strict：最終完整重驗exit1，broken=2、oversize=0、biglist=0、querycmd=0、local=0、residue=0；只剩legacy/docs兩條既有跨repoBROKEN，未越界改舊檔。導航警告不算strict失敗；本輪新增問題已修。git diff --check通過。最終產物9,744,150 bytes（不含node_modules），低於15MB。

## 入口與限制

直接開 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/index.html`，操作及重建見art/canvas-mech/README.md。新版PNG在viewer/evidence/complete-1.1.0-idle.png、complete-1.1.0-shield-aim.png、complete-1.1.0-low-brace.png、complete-1.1.0-exploded-skeleton.png。

固定2D前側3/4，深度靠尺度/遮擋，非真正3D。無接地IK，足底與台面懸距、頸套外露/盾瓣深溝仍是細節限制。尚未接遊戲；畫風與手感主觀評閱保留WAIT_USER。未跑遊戲整合套件，舊四線與3份未追蹤log未動。

## 接續

使用者10/28已授權Canvas交付後接真正3D分層機甲；主線另輪接續。仍先top-down幾何/關節/接點，再bottom-up逐件建模，不能2D板貼圖。此項保留SESSION，不在本輪展開。

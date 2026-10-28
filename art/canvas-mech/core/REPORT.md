# 礁鷹配置核心交付

狀態：v1.1.0 核心已重驗凍結，交 drawing 依新版工作單修輪廓；視覺驗收仍待新 PNG。全新 top-down 配置保留 184 節點、94 功能葉、最大深度 5；上限 260 節點／160 葉。所有層都有局部尺寸、包絡、pivot 與接點。語義樹、rig 與畫序各自保存；工作單與姿態只接受同一模組成功驗證且未再修改的 plan。

交付入口為 [API.md](API.md)、[index.js](index.js) 及 [index.d.ts](index.d.ts)。配置是 [assembly-plan.json](assembly-plan.json)，94 件逐葉工作單在 [leaf-jobs.json](leaf-jobs.json)，三姿態數值證據在 [pose-evidence.json](pose-evidence.json)。資料表 rows 與欄位的讀法見 API；來源及產物雜湊與總容量以 [manifest.json](manifest.json) 為準。

配置 SHA-256：`f1b97b47699338a391a1f739c92cdf51e68169df5203f3e6c9f9d4735669bcfa`；jobsHash：`aedd37267a21e6edeb197fd0c4339a16d4919bdd3252d622180ec56743362d7b`。manifest 另鎖住所有 core 檔案（不含自身）的 SHA-256，修改來源或文件後須重生再凍結。

v1.0 首圖有頭頸胸、四肢與裝備散件空洞，containment 通過不足以驗收。依 astra 的 73 筆藝術修訂完成 v1.1：頭下移100、頸縮接；胸弧加厚、兩肩回收並延伸胸肋／肩座；腰上收45並加寬腹髖架；上臂／肘前臂／手及股膝脛足重新緊湊接合；踝跨足跟與趾根；盾靠前臂、盾瓣接合；砲口／機匣／握把相接；遠臂縮為0.90、遠腿0.94。最後胸下緣高度34→44，中心不動，解決接觸區放不下的真實反例。逐筆差異保存在 [layout-revision.json](layout-revision.json)，未另造美術造型。

90 群組的尺寸、局部變換、包絡、pivot 與接點均已明列 [layout-allocation.json](layout-allocation.json)；configure 從整機 top-down 展開並驗證。author-layout.js 僅是本次離線作者計算工具，runtime 完全沒有從葉反向 auto-fit 父包絡。52 條接合的實際葉、局部接點與必要覆蓋已明列 [connection-allocation.json](connection-allocation.json)，逐葉 jobs 有 104 個 requiredCoverage 圓盤。drawing 必須以主輪廓連續覆蓋，不能用孤立點補假接合。

驗證指令為 `node --test art/canvas-mech/core/*.test.js`、`node art/canvas-mech/core/generate.js --check` 與 `python3 wf/tools/brief_lint.py wf/workflows/dispatch/handoffs/lead-canvas-1028-core.md --strict`。單元與反例涵蓋錯 parent、語義／rig 循環、旋轉包絡越界、不合法 pivot／接點、節點／葉 gate、未驗或驗後修改的 plan、rig bind 偏移、連桿端點與畫序。另驗 SHA-256 與 Node crypto 一致。

實際結果：核心完整測試 46/46 通過（exit 0），生成產物 --check 通過（exit 0），交接 brief lint 0 違規（exit 0），`bash wf/tools/wf-lint.sh --strict art/canvas-mech/core` 全項 0（exit 0）。本次只加兩個接合針對測試，含 AABB 不變但接點偏移、覆蓋超界／縮水與刪契約會紅的反例。容量低於 15 MB，精確 bytes 見 manifest.capacity.bytes。

全專案 `bash wf/tools/wf-lint.sh --strict .` 為 exit 1，僅有兩個既有失效連結：legacy/docs/part1_window_and_loop.md 的 cpp_libtcod_cookbook.md，以及 legacy/docs/part2_battlefield.md 的 world_gen_cookbook.md，兩者都指向外部 pas/analysis/python-tcod/tutorial/。core 沒有錯誤；本線未越界修改 legacy 或其他線，不能宣稱全專案 lint 綠燈。

父動子隨新版證據：近肩 +90°，上臂中心由 `(715,415)` 至 `(636,354)`，手中心至 `(441,362)`，遠臂不動。待機、舉盾瞄準與低姿支撐皆產生 184 個有限矩陣；每姿態四連桿的局部 x 軸兩端都對齊具名世界接點，52 條承力接合在三姿態皆同位。舉盾近肩 −65°／肘 +95°，低姿近膝 +60°／遠膝 +25°；連桿局部長度與遠側世界縮放已分開處理。

未做到或證據不足：未畫圖；承力圓盤是不透明輪廓必須覆蓋的契約，核心不驗 Canvas 像素，實際連續外形仍待 drawing 與新 PNG 目視。連桿依端點縮放，屬視覺 rig，不解剛體物理或腳接地 IK。occludedBy 只用靜止 AABB 提示。此獨立實驗採手單指定 JS ESM，不接遊戲模組；召回後僅讀本輪首圖與 astra 新修訂資料，沒有讀舊原型或其他舊 art。沒有下載、安裝、commit、push 或子代理。

需要決定的事：核心無待裁決事項。主線可依 1.1.0 凍結工作單交 astra 修輪廓，再驗新圖是否形成連續可辨整機；外部 code map／wf 狀態由主線統整，本線只寫 core/。後續交接書應點名 Node 內建 test runner、generate.js（含 --check）、brief_lint.py；同質資料表透過既有 tabledb 保存，無新增依賴。

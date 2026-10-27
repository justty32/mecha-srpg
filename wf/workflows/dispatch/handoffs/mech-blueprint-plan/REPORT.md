# 機甲重做規劃報告

已完成可執行規劃與資料契約，未實作、未派子agent、未commit／push。入口為 [PLAN](PLAN.md)、[CONTRACT](CONTRACT.md)，資料為 [parts](parts.json) 與 [execution](execution.json)。五檔是本線全部寫集。

## 親看參考圖與現況證據

已用view_image親看使用者 `/tmp/codex-clipboard-8Uo05b.png`：小頭、寬肩與細腰，白色分片甲包住深色機構，肩與脛外側有獨立尖長藍甲；頭、胸、腰、肘、膝、踝之間留有可辨識內骨架與遮擋縫。參考的是裝甲厚度、片間縫及輪廓密度，不是照摹整張輪廓或匯入圖片。

舊 `art/svg-study-1027/mech-parts.svg` 第3行自行記載所有symbol使用800×960完整畫布；其葉雖有實際path、ellipse及用途，仍置於整機座標，例如第17行附近右肩軸承以cx242、cy347定位。`assembly.js` 第20–28行僅按layers選symbol，回傳manifest共用anchors，沒有骨與局部姿態。`rebuild.py` 第75–103行選symbol並複製展開幾何。`mech-motion.js` 管演出phase，並非關節鏈。

因此不能把舊成果說成「全是空方框」；真正要換的是製作方向與座標契約：舊作沿既有完整比例拆語意葉，新作必須先配置每層空間與骨節，再逐件局部SVG，最後由矩陣組起來。既有原型與人物城市都保留。

## 已交付的關鍵判斷

64個實體件各自一份SVG，25總成只是資料分組；18骨、slot、attachment、draw-order與語意樹分離。肩甲用獨立骨並可0.35跟隨上臂，肘膝有活動keepOut；初版固定2D視角、剛性件、無IK。外形驗證採凸多邊形聯集，限制SVG語法以確保實際幾何能被驗到，不打造通用SVG引擎。

程式／藝術／展示寫域分開，原型預計102檔、最多104檔，低於父線150檔與15MB門檻；PNG證據預計5張、最多7張。core持有合法遮擋資料，不能由viewer為清除紅線任意放行。每件先工作單再源SVG，包含revision，修改配置會使舊件待重驗。

## 檢查結果

規劃資料用既有tabledb API建立與更新；64件ID／檔名唯一、全部bone引用存在、18骨無環、7姿態delta皆在種子limits內，兩資料表連結檢查均為空。規劃五檔約55KB，低於5檔／200KB gate。

`python3 wf/tools/brief_lint.py wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md --strict` 回傳0，0違規。`git diff --check -- wf/workflows/dispatch/handoffs/mech-blueprint-plan` 回傳0（本線為新未追蹤檔，此指令不替代內容驗證）。

`bash wf/tools/wf-lint.sh --strict .` 回傳1：broken=2、oversize=0、biglist=0、querycmd=0、local=0；另有4個非阻擋導航清單提示。兩個壞鏈是同時施工中的 `art/mech-blueprint/README.md → index.html` 與 `art/svg-study-1027/README.md → ../mech-blueprint/index.html`，均在本線寫域外，已通知領導等展示生成後重驗；不能稱全repo已綠，也不是規劃五檔的壞鏈。

沒有執行遊戲測試、沒有對未實作模型宣稱視覺或關節已通過。

## 未解與範圍限制

比例／骨節為可開工種子，實際零件包絡、局部偏置與有界遮擋zone由配置線在G1算出後凍結，不能把此規劃當成已驗過的數值配置。初版動作只驗明列六條路徑，不保證任意關節組合或3D物理不穿插。Spine只是保留可轉接邊界，未驗任何匯入格式。

工期估計55–110分鐘；短窗口先交配置和試接。最終美術喜好由使用者評閱；靜態SVG／PNG不等於真瀏覽器動畫與操作驗收，未驗必須明記。

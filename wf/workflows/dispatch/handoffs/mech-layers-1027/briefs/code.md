# 任務：接上機甲大中細可見性樹與離線展示

> 已執行契約；下方派工、原路徑及狀態保留歷史快照。[同批交接書](README.md)｜[本批交付與報告](../README.md)｜[目前 API 契約](../contract.md)。

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md；本輪母brief與同目錄contract.md。親讀必要規矩，沿用現有資產，不重讀前輪logs。

## 必用工具

| 工具 | 用途 |
|---|---|
| Python XML/JSON | 本機資料與幾何核對 |
| Node內建 | 有界純邏輯檢查 |
| git diff --check | 本線空白檢查 |

## 資源與禁區

可寫程式碼線，只寫明列路徑。子代理上限0；整體平行最多3工、最多一重負載，本線不得跑npm或遊戲測試。禁止GUI/鍵鼠桌面、上網/下載/安裝、伺服器、刪除、commit/push、改config、遊戲/content/src/legacy、其他美術或舊歷史報告。不要自行找渲染工具或重探瀏覽器，PNG由領導做。

本輪依母brief寫域，不寫共享ROSTER/CLAIMS/inbox；領導在本輪STATUS記領地與工況。以本輪REPORT和exec終局作回報；要傳消息可寫自己的REPORT，領導輪詢。完成後直接終局退出，不留背景工。

## 範圍

只寫art/svg-study-1027/的mech-tree.js、mech-tree-ui.js、mech-tree.css、assembly.js（必要才改）、demo.js、rebuild.py、index.template.html、生成index.html及bulwark.svg/bulwark-ritual.svg/bulwark-feral.svg；本輪check-tree.cjs、code-REPORT.md。不做美術SVG來源、mech-layers.json、manifest或README；人物城市戰場不得改。件數 gate：14檔；容量 gate：新增1MB，超過停下回報。

## 工作

依contract.md先做DOM-free純樹邏輯，再做UI；美術astra會提供mech-layers.json與data-mech-node。程式可先進行，不等待美術寫完才開始。pure API具明確可測state、有效葉集合、父子偏好、solo暫時覆蓋並退出還原、reset、換件保留語意偏好及fallback停用。有效葉數只計當前selected symbols幾何。

UI原生details/summary/checkbox/button鍵盤語義，大層初始開、中層關；能關左臂、單看肩、關單片外甲/管線。每instance複製所選symbol幾何、保留transform/style/畫序、prefix ID及引用，樹只控制該instance，不隱藏defs。配色後同樣支援。demo對外ArtDemo.assemble維持相容；新樹DOM與純邏輯拆檔。rebuild嵌JSON，file離線無fetch，生成完整SVG仍選擇性defs；避免重寫既有非機甲SVG。CSS易讀不minify。

check-tree.cjs使用真實JSON/manifest，測固定驗收內容；若資料尚未完成，完成框架後等待或記待領導跑，不生成假資料冒稱通過。程式完成由領導執行舊check-demo.cjs及PNG；不自行重跑全套。協調信息寫code-REPORT.md。

## 交付

直接共享工作區。寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/mech-layers-1027/code-REPORT.md`，記API/實際檢查/未驗UI限制，終局DONE或具體阻塞。

## 驗收（固定3條）

1. Node真實資料測父子有效可見、子偏好、單看退出、reset、換件/配色後仍生效、fallback停用。
2. 靜態HTML離線引用與鍵盤原生控件齊全；機甲instance獨立，不影響共享defs，原人物城市戰場API不破；三預設重建成功。
3. 本線JS語法及git diff --check通過；REPORT落地。無真瀏覽器驗證不得冒稱UI/布局已驗。

## 最新追加（必讀contract v1.1）

使用者追加五層硬上限與奢華效果。新增可寫mech-motion.js，件數gate15檔、容量1MB。美術astra寫mech-effects.css與來源效果；由你接data-mech-phase/play/reduced與data-mech-selected、播放/暫停/還原，時序見contract v1.1。instance不要part wrapper使深度超5，完整輸出展開可視幾何也要<=5。新檢查允許合法local filter/mask/gradient，不為舊白名單退掉效果。固定驗收第1條增加實際動畫時序/暫停/還原及隱藏葉同步、第2條增加展開深度≤5。先讀更新母brief與contract，開工前/完成每步重讀本段避免錯過更新。

## 主線最後程式審查（固定驗收補正，不擴張）

motion.bind在換件/配色重建instance時，必須明確reset演出為idle/elapsed0並取消timer，避免新CSS從頭播放但JS沿用舊elapsed。本輪採reset而非CSS offset同步。check-tree真實組裝測試要覆蓋播放途中換件及配色重建，斷言idle、elapsed0、timer0、再播放有完整3600ms。還原可見性與還原演出按鈕明確分工。舊check-demo.cjs不改。現有art/check-tree.cjs位置由領導接受為母brief允許的輕量檢查程式，不需搬檔或改名。

## 主線目視後成對臂控（最後有界修正）

保留9大層，UI手臂標籤明確顯示左臂（不含武器）/右臂（不含武器），不得改astra的JSON。增加簡單左右對稱「隱藏左臂連同武器」/「顯示左臂連同武器」及右側按鈕，直接連續setPreference對arm-left/weapon-left或right兩id一起設；不引入依賴架構，子偏好照保留，操作退出solo以免單看覆蓋批次效果。新增小測試兩節點偏好與有效葉、可恢復、左右對稱。加上上一段motion.bind重置與『還原可見性』標籤後，重建一次，測本輪check-tree一次即可。其他已驗收不重畫、不全套重測。

# 機甲百層階層與局部演出 — 完成

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `04bf2dd` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

接續已接受的三套堅盾美術，未新增機型、未改人物／城市／場景／戰場、未接遊戲。領導sol鎖資料契約、整合與收件；gpt-6-astra負責語意拆層及SVG/CSS效果，gpt-6.1-sol負責純樹、DOM與時序。原機甲舊session無rollout，開新astra沿現有資產；本輪後續修正續同astra／sol，最多兩子工。

[離線展示](../../../../../art/svg-study-1027/index.html)｜[用法](../../../../../art/svg-study-1027/README.md)｜[契約](contract.md)｜[美術報告](art-REPORT.md)｜[程式報告](code-REPORT.md)。

## 真實階層與來源

| 預設 | 大層 | 中層 | 有效葉 | 結構 | 外甲 | 裝飾 |
|---|---:|---:|---:|---:|---:|---:|
| 冷鋼 cold | 9 | 28 | 142 | 71 | 53 | 18 |
| 祕儀 ritual | 9 | 28 | 140 | 70 | 53 | 17 |
| 狂潮 feral | 9 | 28 | 140 | 75 | 49 | 16 |

葉數依原manifest的當前已選symbol去重，不計其他風格。庫內153個真實語意葉，含隱含root的語意深度4；完整機甲及展示instance含實際包裝最深5。data-mech-node把真實幾何映射至mech-layers.json，與畫序分離；跨symbol的左臂／握持機構仍由同語意父控，骨架、外甲與附屬光效全部受控。固定栓按組，不切線或空g灌數。

例：左肩總成下的外軸承屬structure、頂部覆甲屬armor、護緣刻紋屬decoration；用途與深度分開。保留原11個symbol、姿態、接點、左右武器、三套配色及輪廓。跨胸／腿／肩的3筆既有磨痕分為9筆並分回對應葉，避免關臂殘留。拆層名稱、機械細節與光效均視覺提案，不新增設定或世界事實；原設定引用沿SOURCES.md。

## 操作與實作

原生details/summary、勾選與按鈕提供大中細展開，初始開大層、收中層。父關閉不清子偏好；單看暫時顯示子樹，退出恢復。只顯示當前裝配葉，並列有效／可見數；換件與配色保留穩定語意偏好，fallback停用控制。

手臂與武器保留獨立大層，UI明示「左／右臂（不含武器）」。另提供左右各成對顯示／隱藏按鈕，直接設定arm與weapon兩個節點並退出solo，保留子偏好，沒有通用依賴架構。「還原可見性」只清隱藏／單看／選取；「還原演出」只清時序。

mech-tree.js提供createModel/createState、bindAssembly、setPreference、setSolo、reset、effectiveLeaves/summary，DOM在mech-tree-ui.js；既有Assembly公開API不變。demo.js只克隆已選symbol幾何到當前instance、加ID前綴並改本機引用，保留transform與畫序；不改共享defs或其他預覽。完整機甲由rebuild.py --mech-only產生，選擇性保留遞迴資源，展開幾何以守五層；原人物生成分支保持。

mech-motion.js純state加可注入時鐘的DOM適配，分sensors/sweep/energy各1200ms、單次3600ms；初始靜止、暫停可續播、還原歸零。換件／配色重建instance強制idle/elapsed0並取消timer，再播放走完整時序，避免CSS新動畫與舊時鐘不同步。reduced-motion為靜態高亮，fallback停用演出。mech-effects.css與局部SVG資源由astra設計，效果全在既有葉內；隱藏葉會連附屬效果一起隱藏。

## 驗證與目視範圍

最終強化來源重建後，check-assets.py通過：真實選定葉142/140/140、9大28中、用途計數、幾何覆蓋、唯一id／無循環／本機引用與三完整圖最深5。check-tree.cjs配Python XML索引及來源hash通過：父子可見、子偏好、solo退出、重置、左右臂連武器批次、真實換件／配色、fallback、instance隔離、初始原生控件、暫停續播、重建歸零後完整3600ms、reduced-motion與隱藏效果同步。無新增全套檢查。

最終重跑方式（repo根執行；不需npm或新套件）：

```sh
python3 -B art/svg-study-1027/rebuild.py --mech-only
python3 -B wf/workflows/dispatch/handoffs/mech-layers-1027/check-assets.py
node art/svg-study-1027/check-tree.cjs --python | python3 -B - "$PWD/art/svg-study-1027" > wf/workflows/dispatch/handoffs/mech-layers-1027/tree-check.json
node art/svg-study-1027/check-tree.cjs --xml-json wf/workflows/dispatch/handoffs/mech-layers-1027/tree-check.json
```

HTML相對引用都存在且無外網，兩份證據SVG本機引用及深度5亦通過；git diff --check通過。未跑npm、遊戲整合或全套測試。舊check-demo.cjs的假DOM未涵蓋新instance渲染，舊final-check白名單／symbol-use輸出假設也不適用新合法filter及展開幾何；沒有修改舊測試迎合結果，本輪用真實來源檢查補上。wf全域lint留主線處理。

主線已實看第一版層控與效果對照，分層可收；要求增加成對臂控並強化效果，已在限定範圍完成。領導已實看最新[layers-contact.png](layers-contact.png)：三風格各列完整、左臂連武器全關、單看左肩、關單片左肩頂甲，整側移除與細片差異可見，原造型保留。獨立左右武器仍可各自控制。

最新[effects-contact.png](effects-contact.png)由同astra新增75個附屬圖形後產生（來源共128個效果圖形、不算新葉）。領導目視頭部雙校準環／寬掃描帶、甲面亮帶、砲口向外電暈和粒子尾跡、雙肩外擴熱羽流，比初版明顯；三色系沿冷青／紫金／黃綠。每格畫布寬440px，接近要求的400px尺度；這是效果可見性的試作判斷，非使用者最終美術定稿。

make-evidence.py只在輸出副本凍結astra給的峰值：校準／掃描65%、掠光55%、電暈／羽流55%、粒子軌跡58%；不是同一時間點合成或瀏覽器採樣。來源造型與效果唯一定義仍在mech-parts.svg，證據可重建。靜態PNG由既有librsvg/cairo離線渲染，事前seccomp禁網並驗證socket拒絕，不開GUI、不下載安裝。效果影格由來源圖形及CSS關鍵狀態凍結，非瀏覽器時間採樣；**實際瀏覽器布局／鍵盤實機／CSS動畫時間序列未驗**，不以Node與PNG冒充。

## 容量與收線

本輪變更／交付35檔，現有檔大小合計3,438,949 bytes，相對HEAD新增3,084,639 bytes，低於50檔／新增6MB。包含生成圖、兩張PNG及可重建證據SVG、真實XML測試資料；排除本機log/last/bytecode。逐檔清單與原始／新增bytes見inventory.json，inventory.py可重新量測；未把整段執行log列進交付。

改動限機甲來源／層資料／效果與框架、生成三機甲和展示、README/SOURCES及本輪證據夾。人物／城市／戰場資產與manifest未改，主線保存的baseline檔未動；未改src/content/legacy/spec或前輪歷史報告。因本線寫域限制，頂層code-map若需新增導航由主線收尾時更新，README已列實際新檔職責。

所有子工正常DONE並回收，行程核對未見殘留。兩次sol中途暫停續接是同步運行中新增契約／最後審查，同一session保留成果；astra首輪完成後只續一輪有界效果強化，沒有重畫既有資產。未commit/push、未開GUI／伺服器、未安裝下載；主線接手獨立核驗、整理本機logs及提交。實際瀏覽器驗證仍受既存headless缺lib限制，本輪未重探或安裝。

## 主線獨立收件

主線已實看最終兩份PNG：連武器整側隱藏、單看肩部、單片甲隱藏清楚；強化校準環／甲面亮帶／電暈與羽流可辨。獨立執行check-assets.py與check-tree真實XML及Node驗證通過，各預設142/140/140葉、SVG深度5。15份非機甲美術hash與動工前一致。wf strict仍為既有legacy兩斷鏈，其他檢查0，不能稱全綠。所有agent已關閉、無殘留工人；執行log/last與bytecode移入.git/mech-layers-1027-local本機保留、不提交不刪除。

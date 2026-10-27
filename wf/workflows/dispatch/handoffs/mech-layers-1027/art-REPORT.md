# 機甲百層美術交付 — DONE

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `04bf2dd` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

角色／指定模型：gpt-6-astra 機甲美術工。依 art.md、contract.md v1.1 與更新母 brief 執行；沿用已接受來源，未讀前輪 logs，未開子代理。

先落 `mech-layers.json`，再補 SVG 與 CSS。交付只寫 `art/svg-study-1027/mech-layers.json`、`mech-parts.svg`、`mech-effects.css` 和本報告。來源中的全部零件定義共 153 個有真實幾何的穩定語意葉；各配方只計其選定 symbol 的去重集合，缺裝葉不計。

| 預設 | 大層 | 中層 | 有效葉 | 結構 | 外甲 | 裝飾 |
|---|---:|---:|---:|---:|---:|---:|
| cold | 9 | 28 | 142 | 71 | 53 | 18 |
| ritual | 9 | 28 | 140 | 70 | 53 | 17 |
| feral | 9 | 28 | 140 | 75 | 49 | 16 |

語意例：`arm-left-shoulder-bearing` 為左肩外軸承（structure），`arm-left-shoulder-crown` 為左肩頂甲（armor），`head-sensor-lens` 為感測晶窗（decoration），`torso-back-radiator` 為背部散熱柵組（structure）。同一零件的描邊、亮面、陰影與附屬光效共用語意葉；固定栓成組，沒有逐顆螺絲、空組或切碎線段灌數。

左臂＝畫面右側，骨架、肩甲、腕手與狂潮回折管束全部歸 `arm-left`。位於武器 symbol 的握持機構仍歸臂。`weapon-left` 獨立控制左側散紋吼砲；因此關左臂會留下獨立的左武器，欲連武器一起關掉須再關 `weapon-left`。原 cold 跨胸、腿與左肩的 3 筆磨痕依原 moveto 拆為 9 筆、分回各部位既有葉，避免關臂殘留肩部筆畫。

三風格原 11 個 symbol、共用 transform、接點所用幾何與畫序、基礎填色／描邊均保留；manifest 未改。主要改動為原群組扁平化與語意歸屬，沒有重畫機甲。來源視覺結構為 symbol → 單一外 transform group → 葉 group → 直接圖形；組裝按契約將外 transform group 直接放在 assembly 下即可維持 svg(1) → assembly(2) → 幾何(3) → 葉(4) → 圖形(5)，不可另加 part wrapper。語意樹含隱含 root 最深 4 層。

效果以同一來源中的 53 個附屬圖形實作，全部屬既有葉、預設 `opacity="0"`，不增加葉數：感測晶窗亮心與校準弧線、貼合原甲形的漸層移動光帶、熱口透光與熱羽流、沿接縫流動的能量描線及砲口電暈、上升熱粒子。三風格使用各自光色與本機 gradient/filter；共用背部散熱核心採冷青光。只用約定的 phase/play/reduced/effect 屬性啟動 CSS；idle 靜止、paused 凍結動畫，reduced-motion 改靜態高亮。選取葉以 `data-mech-selected="true"` 顯示輪廓光。效果仍隨葉的 display 一起隱藏，不影響人物／城市。

固定三條核對結果：

1. **PASS** — Python 內建 XML/JSON 解析；SVG id 與樹 id 唯一；中文標籤、用途、父子層級與無循環有效；153 葉皆有非空實體幾何，沒有巢狀葉標記或未歸葉圖形；全部本機引用可解析。含契約 assembly 的來源展開深度最大 5。
2. **PASS** — Node 內建 `fs`／`vm`／`assert`，用原 manifest 的 `Assembly.assemble` 所選 symbol 與實際 SVG 葉索引，驗得上表；三配方均含 sensor/sheen/vent/energy/particle。使用真實 MechTree 資料確認關左臂會排除所有左臂葉且保留左武器。CSS 靜態核對 idle、pause、reduced-motion、裁切光帶、描線流動與粒子位移契約。此項不是瀏覽器動畫目視測試。
3. **PASS** — 與本線動工前來源快照逐筆比對原圖形、畫序、座標、transform、填色與描邊；除了上述跨部位磨痕拆分，原圖形全部保留。三套左右武器仍在；僅上述 4 個交付檔，總量低於 170 KB，新增量低於 1 MB；本線路徑 `git diff --check` 通過。報告已落地。

未自行探查或使用渲染工具，未啟動伺服器、GUI、npm 或遊戲測試；PNG 與組裝後成品／瀏覽器動作目視驗收由領導完成。來源五層核對不代替 sol 對實際 instance 與生成完整 SVG 的深度核對。新增光效、面板語意與機械細節分類均屬美術提案，不新增設定、數值或世界事實。無背景工，終局 DONE。

## 主線目視後唯一有界強化 — DONE

本次先親看主線 `effects-contact.png`：原校準線幾乎融入頭殼，能量主要只有砲口小亮點；依 art.md 末段接續強化，沒有重讀規矩、重畫本體或整批重驗。只改來源效果、`mech-effects.css` 並追加本報告；JSON／語意葉數與程式檔未改。

新增 75 個附屬效果圖形（來源效果總數由 53 變為 128），全部附在既有語意葉的同層前景片段，沒有新語意葉。校準環約 194×124 來源尺寸，包含雙重斷環、外圍刻度與 265px 寬掃描光帶；400px 畫布比例下，環寬約 92px、主環線寬約 1.7px。肩部新增有明確外擴方向的漸層熱羽流和流線；左砲口約 130×96 電暈主弧，帶朝左下方延伸的分叉弧、粒子軌跡與亮點，右砲口用較小配套尺度。甲面掠光的亮帶由窄條加寬，仍使用原甲形。冷鋼冷青、祕儀紫金、狂潮黃綠各用本機 scan gradient／corona filter；光只作用在局部，不做全機 opacity 脈衝或反覆強閃。

只核本次新增內容：XML 可解析；新增 id 無衝突、本機引用皆可解析；75 個新效果皆只受一個既有葉控制；來源按契約含 assembly 最深仍為 5；各自指定的 CSS keyframes 存在。既有驗收不重跑。未自行渲染；400px 的最終視覺是否達標由領導的新 PNG 判斷。

給領導的靜態 keyframe 凍結值（在輸出副本中操作，不改共享來源）：保留來源的 fill、stroke、stroke-opacity、filter、pathLength 和 stroke-dasharray；停用 animation，以各圖形 style 的 `--mech-animation` 名稱辨識新效果。先讓所有 `[data-mech-effect]` opacity=0，再只亮對應 phase。新圖形 id 為 `mech-{cold|ritual|feral}-fx-*`，組裝命名空間化後仍可依 id 後綴或 custom property 辨識。

- **sensors 最明顯影格**：`mech-calibration-ring` 65%：opacity=1、stroke-dashoffset=0、transform=none、clip-path=none；`mech-sensor-scan` 65%：opacity=.9、transform=none、clip-path=`polygon(0 0,100% 0,100% 100%,0 100%)`。原晶窗效果 opacity=.9。保留原 stroke-opacity，避免把寬光暈也提升成實線。
- **sweep 最明顯影格**：`mech-armor-sweep` 55%：opacity=1、transform=none、clip-path=`polygon(35% 0,85% 0,55% 100%,5% 100%)`。使用每片原效果幾何自己的填色包圍盒解讀百分比；原甲形本身仍是光帶外界。不要以全片統一 opacity 取代此裁切。
- **energy 最明顯影格**：`mech-corona-flow` 55%：opacity=1、stroke-dashoffset=0、transform=none、clip-path=none；`mech-plume-unfurl` 55%：opacity=.9、stroke-dashoffset=0、transform=none、clip-path=`inset(0 0 0 0)`（此影格等效 none）；`mech-particle-track` 58%：opacity=1、stroke-dashoffset=0、transform=none、clip-path=none。原局部 energy／vent／particle 可分別用 .9／.8／.9，同樣不改來源 stroke-opacity。

以上是各效果峰值的靜態合成建議，不假稱同一時刻的瀏覽器截圖。若使用瀏覽器凍結，對指定圖形設定 animation-name 為上述名稱、animation-duration=1s、animation-timing-function=linear、animation-delay 分別為 -.65s／-.55s／-.58s、animation-play-state=paused、animation-fill-mode=both，即精確停在所列百分比；單一 phase 的不同圖形可各自凍結。idle、paused 與 reduced-motion 原契約仍保留；減少動態時只給靜態局部亮色，不播放軌跡或羽流展開。新增演出仍為美術提案。終局 DONE，無背景工。

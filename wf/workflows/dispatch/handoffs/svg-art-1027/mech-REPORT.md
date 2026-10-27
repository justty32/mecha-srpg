# 堅盾-I型原生 SVG — DONE

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `2863782` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

完成 `art/svg-study-1027/bulwark.svg`。沿用已指定選角，單人繪製，僅寫本 SVG 與本 REPORT；未另建 brief、未委派、未改設定或展示頁。

## 來源與設定對應

[機體](../../../../../content/base/frames/bulwark-i.json)指定堅盾-I型、公版 D 級雙足與預設裝備；[骨架](../../../../../content/base/bodyplans/mx-biped-d.json)指定頭部感測、軀幹、左右臂與雙腿，圖中各有具名群組與連接結構。[型號](../../../../../content/base/world/models/bulwark-i.json)定位為公版初代戰線機，未規定外觀。

[散紋吼砲](../../../../../content/base/components/mx-scatter-rune.json)放機體自身左臂，即畫面右側，群組 `left-weapon-scatter-rune`；[凡鐵連吼](../../../../../content/base/components/mx-iron-repeater.json)放機體自身右臂，即畫面左側，群組 `right-weapon-iron-repeater`。兩組皆有 `data-side` 與 `data-component`，未將畫面左右誤當機體左右。[外掛複合裝甲](../../../../../content/base/components/composite-plate.json)只增加軀幹裝甲，對應 `torso-composite-plate`；未增加手持盾。

## 美術提案

全身四分之三視角、寬站姿、低矮感測頭與寬肩，重心落在雙足間。苔灰主甲、骨白胸板、少量赭黃識別塊與青綠感測窗，採硬邊明暗。胸部以掛架、底板、面板的錯位邊緣表達外掛厚度；肩、肘、髖、膝、踝以深色關節與局部連桿串接。近側左腿較寬且足部較低，配合機體轉角與遮擋。

左臂採大徑單口短砲、右臂採窄長砲與側置彈匣，使武器輪廓可區分。甲片尺寸、外殼分件、砲口與供彈外形、背架散熱片、短天線、感測窗、配色皆為美術推定，並非 JSON 已定外觀。沒有把裝備數值當成精確尺寸或砲管數。圖內無可見文字、標誌、背景板或地面陰影；title／desc 註明視覺草案。

## 自查證據與限制

使用 `rg` 定向定位來源，親讀交接要求的規則與六份設定，未重讀既有執行 log。以 Python 標準庫 `xml.etree.ElementTree` 解析通過：viewBox 為 `0 0 800 960`，title／desc 與 ARIA 引用齊全，14 個具名 group、185 個手寫 path，ID 不重複。左右武器與複合裝甲的來源識別、頭部及雙肢群組逐一檢查通過。

元素白名單僅 svg、title、desc、g、path、circle、ellipse；無 script、foreignObject、image、text、事件處理器、href、URL 引用或內嵌點陣。沒有背景元素，畫布保持透明。路徑命令逐段解析，185 條均為合法 M/L/H/V/Z 絕對或相對命令；納入最大描邊及橢圓旋轉的保守畫界為 `(79.38, 82.52)–(698.77, 900.47)`，完整位於 viewBox 內。

`git diff --check` 檢查指定路徑；因兩份產物皆未追蹤，另以 `git diff --no-index --check /dev/null <檔案>` 實際檢查新檔內容，均通過。兩份交付合計小於 25 KB，低於最多 3 檔／300 KB 閘門。

未執行離線渲染或目視驗證，亦未驗證 64px 實際顯示效果；縮圖辨識度僅透過寬肩、分立雙腿、短寬砲與長窄砲的輪廓設計處理，不能據此宣稱目視通過。未開 GUI、未操作桌面、未上網下載、未使用 imagegen、未安裝、未跑 npm 或重負載、未啟動伺服器、未 commit/push。

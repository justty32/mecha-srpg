# 堅盾共享部件原型 — DONE

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `2863782` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

完成 [mech-parts.svg](../../../../../art/svg-study-1027/mech-parts.svg) 與 [mech-manifest.json](../../../../../art/svg-study-1027/mech-manifest.json)。直接從已通過主線目視的 [bulwark.svg](../../../../../art/svg-study-1027/bulwark.svg) 拆件，再在共享來源內繪製換件；沒有先畫完整變體，沒有生成程式或完整機甲副本。本線只寫這兩檔與本報告，未改原稿、設定或展示頁。

## 來源與提案

親讀 [variants.md](briefs/variants.md)、[母 brief](briefs/svg-art-1027.md)、[mech.md](briefs/mech.md) 與 [art-direction.md](../../../../../art/svg-study-1027/art-direction.md)。設定來源為 [frame](../../../../../content/base/frames/bulwark-i.json)、[bodyplan](../../../../../content/base/bodyplans/mx-biped-d.json)、[型號](../../../../../content/base/world/models/bulwark-i.json)、[散紋吼砲](../../../../../content/base/components/mx-scatter-rune.json)、[凡鐵連吼](../../../../../content/base/components/mx-iron-repeater.json)、[複合裝甲](../../../../../content/base/components/composite-plate.json)。保持機械雙足、頭部感測、自身左臂散紋吼砲／右臂凡鐵連吼與軀幹外掛甲，不加手持盾。

冷鋼延續原稿方切肩塊、寬胸板及楔足，沿用苔灰／骨白／赭黃，未宣稱已換成方向稿的冷灰色票。祕儀用骨白長弧肩殼、分瓣胸殼、等距金屬固定件、弧形膝足與分段砲箍。狂潮用單側完整厚弧肩罩、對側錯位疊板、偏斜胸板、局部缺角及有端座／卡箍的回折管束；煤黑、暗紅與少量病綠，沒有牙角、獸爪或血肉。

三套的頭、肩、胸、膝足覆甲與武器都換幾何。近側肩最外緣在原稿局部座標分別到 x=672、684、704，並有方切、連續弧殼、破邊不對稱三種輪廓；不是只改色值。造型、塗裝、板件裂損與管束均屬視覺提案，不代表新型號、戰損事件、魔法功能或遊戲性能。肢體覆甲是美術分層，沒有把 composite-plate 的遊戲效果延伸到四肢。

## 組裝契約

family 為 `bulwark-800`；root 與全部 symbol 的 viewBox 都是 `0 0 800 960`。實際選項：limbs 1、torso 1、head 3、armor 3、weapons 3，共 11 個 symbol。三個 preset 為 `cold`、`ritual`、`feral`，各完整指定五層。共享骨架及座艙只定義一次，三套預設同時替換頭、甲、武器三類。

部件 SVG 本身只有 defs，直接開啟不顯示完整機體。領導重建時將唯一來源的 defs 置入輸出 SVG，依 manifest 的 `limbs → torso → head → armor → weapons` 順序，逐層用 `<use href="#所選symbol-id" x="0" y="0" width="800" height="960"/>` 插入；無須移動錨點。可用每個 preset 的 title／desc 供輸出標示。來源沒有 CSS 變數、filter、圖檔或外連；避免在 file 模式另行 fetch 外部 SVG。

manifest 有 18 個具名錨點，均為 root 畫布座標，左右採機體自身方向。肩／肘／膝以基準關節中心為準；頸座、胸甲掛點、骨盆、髖與踝／足底是由原稿推定的美術接點，並非設定給定的工程尺寸。原稿局部座標轉換為 `x = 20 + 0.95 × x0`、`y = -12 + 0.95 × y0`；每個 symbol 內保留同一固定 transform，外部不要再套一次。武器接點與同側肘中心一致：右 `(221.4, 404.1)`，左 `(568.15, 435.45)`。

limbs 包含承重骨架、關節與底層足底；torso 包含背架、座艙、頸座。armor 包含肩、胸外掛板、髖裙、肢體覆板與足背，近側肩覆蓋胸甲側緣；頭先畫、胸甲後畫，使領口遮住頸座下緣。weapons 最前，罩住肘部接座，保留上臂與後座連接。每個武器 symbol 內都有兩個具名組，分別標 `data-side="machine-left"`／`machine-right` 與正確 `data-component`；畫面右是機體左，不用鏡像組裝。

相容限於這個固定四分之三姿勢與比例。換頭／甲／成對武器可做 27 種選項組合，但不支援任意位移、骨骼動畫、單側武器交換、翻面或其他 family；換姿勢須重新處理遮擋。混搭會保留部件本身色盤及共用內架原色，並非自動調色。冷鋼的全部原始圖形都保留，但拆件後依新五層契約重排，不能宣稱與舊稿逐像素相同。

## 自查與限制

使用 rg 查來源及 Python 標準庫 ElementTree／JSON 解析。通過：63 個 ID 唯一、11 個 symbol viewBox 一致、全部 options 與 presets 引用存在、五層完整、18 個錨點合法、三套左右配裝一致。27 種組合的部件引用均可解析；這是靜態相容檢查，尚非全部混搭目視驗收。

原稿與冷鋼重建所用圖形以元素種類及完整屬性作 multiset 比對，210 個 path／circle／ellipse 全部一致，沒有遺漏或新增；其中 path 為 185 條。全來源共 420 條 path，M/L/H/V/Q/Z 命令與參數逐條解析通過；包含控制點、旋轉橢圓及描邊的保守畫界均在 viewBox 內。三套合成畫界約為：冷鋼 `(83.17, 86.80)–(694.98, 896.67)`，祕儀 `(82.22, 86.80)–(692.12, 896.67)`，狂潮 `(75.57, 86.80)–(704.48, 896.67)`。

元素白名單及屬性檢查通過：無 script、foreignObject、image、text、事件處理器、外連、CSS 變數或 filter。透明背景，圖形只在 symbol 中定義。部件來源 51,919 bytes，manifest 4,118 bytes；連同本報告遠低於 450 KB，正好 3 檔。`git diff --check` 及針對新增檔的 `git diff --no-index --check /dev/null <檔>` 均通過。

沒有執行離線渲染或目視驗證；本機 Python 無 CairoSVG，未下載或安裝替代工具。原稿的主線目視通過不等於這份重建版及新變體也通過；實際外觀、縮圖與混搭遮擋仍由領導重建後目視確認。未開 GUI、操作桌面、上網、imagegen、npm、伺服器或重負載，未開子工、commit／push。

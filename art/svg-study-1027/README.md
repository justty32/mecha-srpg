# 原生 SVG 美術試作

自行開啟 [index.html](index.html)，不用伺服器、npm、下載或網路。Agent 不會替你開 GUI。全部為視覺草案；未載設定的外觀、材質、配色與格局均為美術提案，沒有遊戲整合或部署。

五張基準主題比較深淺底色，另有同一堅盾／釜山的三套造型、城市六層開關及可鍵盤聚焦的熱點。人物另顯示48／64／96px頭像。人物／機甲可換件、還原預設、一次換兩件或切完整立繪 fallback；自由組合不是正史配裝。

戰場示意包含四地格、單位圓標、HP、選取框及範圍色塊。按鈕各播一次射擊、命中、爆炸，結束即清除，尊重減少動態偏好。城市是分層示意／微縮景初版，供選畫風；特效靜態圖不代表動畫時間序列已目視驗收。

[設定來源](SOURCES.md)｜[三套畫風](art-direction.md)｜[交付報告](../../wf/workflows/dispatch/handoffs/svg-art-1027/REPORT.md)

## 程式框架最小用法

展示頁載入後，可在自己的瀏覽器 console 執行；程式本身不 fetch：

```js
const library = JSON.parse(
  document.querySelector('.doll[data-family="portrait"] [data-manifest]').textContent
);
let recipe = Assembly.recipeFromPreset(library, 'kamau');
recipe = Assembly.swapParts(library, recipe, {
  hair: library.options.hair[1].id
});
recipe.colors = { '#26343d': '#334b59' }; // 原HEX → 目標HEX；沒有該色則不變
const plan = Assembly.assemble(library, recipe);
```

`recipe` 包含 `family`、`parts`、`colors`。`assemble` 只產生可測的組裝計畫；頁面由 `demo.js` 將計畫呈現為 SVG。需要手動顯示上述配方時，沿用既有接線：

```js
ArtDemo.assemble(document,
  document.querySelector('[data-doll-out="portrait"]'),
  library, recipe.parts, recipe.colors);
```

框架檢查相容族、部件選項與遮擋順序，接點採來源的共用座標；不承諾跨比例任意拼接。完整立繪 fallback 是獨立模式，不假裝仍可逐件修改；換件或還原預設會回部件模式。

## 檔案與重建

- 展示：[index.template.html](index.template.html) 為頁源，[index.html](index.html) 為生成頁；[style.css](style.css)、[workshop.css](workshop.css) 分管頁面與紙娃娃／城市。
- 程式：[assembly.js](assembly.js) 是純配方規則；[demo.js](demo.js) 負責 DOM 事件與 SVG 呈現；[rebuild.py](rebuild.py) 離線重建完整圖與頁面。
- 美術來源：[portrait-parts.svg](portrait-parts.svg)＋[portrait-manifest.json](portrait-manifest.json)、[mech-parts.svg](mech-parts.svg)＋[mech-manifest.json](mech-manifest.json) 各為唯一部件定義。
- 動態樣式：[city-motion.css](city-motion.css)、[effects.css](effects.css)；城市、修塢、地格及特效的獨立 SVG 直接由 astra 製作。

執行 `python3 art/svg-study-1027/rebuild.py` 重建兩人物、三機甲與展示頁；僅重建人物／機甲加 `--components-only`。完整圖是可重建輸出，不手改；獨立 SVG 只含該預設用到的 symbol 與遞迴引用 defs。

生成頁為每相容族嵌入一份全共享 defs，城市也嵌入頁內，直接 file 開啟，不 fetch 外部 SVG；生成頁內的幾何是來源自動複製，不是另一份手維護來源。來源與輸出體積分列於報告，不預設宣稱省多少。

美術設計／部件／動畫樣式由 astra 製作；領導負責設定、組裝與展示接線。PNG 證據使用既有 librsvg/cairo 離線渲染，事前以 seccomp 禁網。實際瀏覽器 UI 與動畫時間序列未驗，限制見報告。

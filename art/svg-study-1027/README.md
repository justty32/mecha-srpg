# 原生 SVG 美術試作

自行開啟 [index.html](index.html)，不用伺服器、npm、下載或網路。Agent 不會替你開 GUI。全部為視覺草案；未載設定的外觀、材質、配色與格局均為美術提案，沒有遊戲整合或部署。

機甲的新製作流程另見[先配置、逐件獨立SVG、可動骨架重做版](../mech-blueprint/index.html)；[重建與驗證說明](../mech-blueprint/README.md)。

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

- 展示：[index.template.html](index.template.html) 為頁源，[index.html](index.html) 為生成頁；[style.css](style.css) 由 [styles](styles/README.md) 三段原序合併，與 [workshop.css](workshop.css) 分管頁面與紙娃娃／城市。
- 程式：[assembly.js](assembly.js) 是純配方規則；[demo.js](demo.js) 負責 DOM 事件與 SVG 呈現；[rebuild.py](rebuild.py) 離線重建完整圖與頁面。
- 美術來源：[portrait-parts.svg](portrait-parts.svg)＋[portrait-manifest.json](portrait-manifest.json)、[mech-parts.svg](mech-parts.svg)＋[mech-manifest.json](mech-manifest.json) 各為唯一部件定義。
- 動態樣式：[city-motion.css](city-motion.css)、[effects.css](effects.css)；城市、修塢、地格及特效的獨立 SVG 直接由 astra 製作。

執行 `python3 art/svg-study-1027/rebuild.py` 重建兩人物、三機甲與展示頁；僅重建人物／機甲加 `--components-only`。完整圖是可重建輸出，不手改；獨立 SVG 只含該預設所選部件及遞迴引用資源；機甲展開成實際幾何以維持五層限制，人物保留所選symbol。

生成頁為每相容族嵌入一份全共享 defs，城市也嵌入頁內，直接 file 開啟，不 fetch 外部 SVG；生成頁內的幾何是來源自動複製，不是另一份手維護來源。來源與輸出體積分列於報告，不預設宣稱省多少。

美術設計／部件／動畫樣式由 astra 製作；領導負責設定、組裝與展示接線。PNG 證據使用既有 librsvg/cairo 離線渲染，事前以 seccomp 禁網。實際瀏覽器 UI 與動畫時間序列未驗，限制見報告。

## 機甲大／中／細階層（本輪擴充）

機甲保留三風格換件，以獨立語意樹管理頭、軀幹、左右臂腿及武器；大部位下有總成，再下為真實面板、套環、管線等細層。機體左側位於畫面右側。邏輯父子與SVG畫序分離，關父層保留子層偏好，單看退出會恢復原先開關；只統計當前裝配的葉層。

最新範圍與資料契約見[本輪契約](../../wf/workflows/dispatch/handoffs/mech-layers-1027/contract.md)，進度見[本輪狀態](../../wf/workflows/dispatch/handoffs/mech-layers-1027/STATUS.md)。原美術歷史報告保留，不以本輪結果回寫歷史。

`mech-layers.json` 定義大／中／細父子樹與用途；`mech-parts.svg` 的 `data-mech-node` 對應真實圖形。`mech-tree.js` 只計算可見性，`mech-tree-ui.js` 接原生摺疊／勾選／單看控件，`mech-tree.css` 排版。來源11個symbol依配方選用後，展示僅複製該instance幾何；共用defs與其他預覽不會被關掉。語意樹含root深4，實際SVG連組裝包裝最深5。

機甲左／右臂標示「不含武器」，可個別控制武器，也可用成對按鈕顯隱整側手臂與武器。子層偏好保留；「還原可見性」清除隱藏與單看，不改配方或演出。「還原演出」回到靜止，不改可見性或配方。

`mech-motion.js` 協調感測啟動→甲面掠光→能量與散熱的單次3.6秒演出；`mech-effects.css` 與SVG中的局部圖形提供效果。初始靜止，按啟動播放；暫停後同鈕續播，播放中再按則從頭開始。換件／配色重建instance時演出歸零，避免CSS新動畫與舊時鐘不同步；可見性偏好仍保留。完整立繪停用樹與演出，減少動態改成靜態亮色。

重建僅機甲及展示可用 `python3 -B art/svg-study-1027/rebuild.py --mech-only`。本輪固定檢查入口為 `check-tree.cjs`，細分責任見 [checks](checks/README.md)（Node與內建Python XML）及新報告夾 `check-assets.py`；新效果允許本機gradient/filter等資源，沿用舊檢查時須注意其禁止filter與shadow-use的舊假設。實際瀏覽器布局、鍵盤操作、CSS動畫時間序列仍未驗證。

[今日收工評閱與回家驗收入口](../../wf/notes/art-review-2026-10-27/README.md)：成果已提交並 push，無活躍工人；畫風與真瀏覽器布局／鍵盤／動畫仍待評閱。

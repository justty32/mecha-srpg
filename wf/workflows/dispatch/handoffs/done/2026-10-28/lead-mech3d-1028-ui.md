# 任務：整合衡岳離線Three.js展示及真實WebGL2互動驗證

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`、`wf/workflows/dev-env.md`、`wf/workflows/common/data-files.md`。已親讀者免重讀，但新接口必親讀。

## 背景與唯一目標

你是sol cx-mech3d-ui-1028，重用原生task，子代理上限0。將astra全新衡岳真3D模型接成單一file可開HTML。Canvas已交付69403bc2；本輪不能改Canvas或借其造型。可復用通用CDP經驗，不復用舊美術。原生工具回傳不寄頂層inbox。

## 範圍（排除法寫死）

只寫 `/mnt/c/code/mine/mecha-srpg/art/mech-3d/viewer/`、同層 `vendor/`、`build.mjs`、`headless.mjs`、`index.html`、`README.md`，以及 ignored `/mnt/c/code/mine/mecha-srpg/node_modules/.mech3d-tools/` 局部工具/cache。model/唯讀，等astra明確接口與凍結，不補模型或改幾何。
不做：遊戲src/content/spec/根package/lock、其他wf或art，Canvas來源成果唯讀，舊SVG一律禁止參考重用；不把Canvas片拉厚或貼圖板，不下載browser/Playwright、不系統安裝、不多台/物理/IK/步行/大型框架。每源模組最多300行。
件數 gate：目標96葉/總220，硬上限120葉/240節點；容量 gate：產物25MB不含ignored工具/依賴，PNG最多5張盡量8MB內。超出先回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm --prefix node_modules/.mech3d-tools` | 僅局部安裝已授權固定包 |
| `node art/mech-3d/build.mjs` | esbuild單頁離線bundle與契約核對 |
| `node art/mech-3d/headless.mjs` | Node24 WebSocket直接CDP，既有Chromium |
| `ldd` | 重用Canvas局部函式庫，不重下載browser |

## 資源與禁區

可寫程式碼線，只寫明列路徑。子代理0、總實質工人2、同機最多1重負載；首次headless須先報領導安排。不得刪檔、commit/push、分支/rebase/reset、GUI/鍵鼠桌面、改系統/config/.gitignore/根package。工具環境出錯如實BLOCKED，自己程式錯自行修。

已明確向使用者告知且授權下載three@0.186.1、esbuild@0.28.2及@esbuild/linux-x64@0.28.2，僅官方https://registry.npmjs.org。npm --prefix局部安裝，npm cache也設repo ignored工具目錄內，避免HOME寫；無audit/fund/update notifier，無root/系統改動。核官方integrity/來源，其他新依賴必先回報主線告知，不默默下載。可用--omit=optional並明列linux-x64二進位，避免多平台下載。不用新browser，沿用既有Chromium1243與Canvas已解壓node_modules/.canvas-headless/root函式庫，僅本命令LD_LIBRARY_PATH。Canvas所有來源成果唯讀，通用CDP可按經驗新寫或複用工具但不改其檔案。

## 工作

astra同時寫model配置與幾何，id01a18085-17a7-7272-9aa5-a11413f86440。先直接協調ESM凍結API、Three注入/匯入與姿態矩陣/接合覆蓋責任。先top-down配置檢查與jobs hash凍結，才讓其bottom-up建mesh。你可並行準備工具/UI/空場景，不能代補造型或先整機再拆。

最終一台高完成度真3D：Orbit360、預設正/側/背、物件點選同步真層樹、父子顯隱/solo、分層爆炸、肩肘膝控/播放停回初始、材質陰影及攝影棚地台、好看輪廓光、responsive/DPR。Y上Z前X右。正側背皆有真體積內容，不能只正面好看。viewer只套正式rig/局部變換及明示爆炸，不偷偷偏移修幾何。

下載包/license與來源證據保留vendor（只必要runtime資產），esbuild工具不帶進產物；HTML全內嵌，不fetch/CDN/外部網路。headless先驗WebGL2與SwiftShader實際render，讀renderer/像素/互動，不只數場景；軟體渲染不宣稱GPU效能。

首張完整模型一可渲染就立刻PNG回絕對路徑，供主線親看，不等文檔排版。最終PNG最多5張：正/側/背/一動作/分解，8MB內為目標。實際CDP互動含Orbit/相機預設、物件選取樹同步、父子顯隱/solo、分層爆炸、關節/播放停還原、DPR/responsive，無JS錯/外部網路。單負載，完關browser。基本連續可辨+旋轉互動過即收尾，不追細部完美。

## 交付

REPORT `/mnt/c/code/mine/mecha-srpg/art/mech-3d/viewer/REPORT.md`，短列做了什麼／產出／沒做到或證據不足／需要決定的事／以後交接該點名工具。README面向使用者直接開file與操作/限制，不放工人施工資訊。原生回傳階段及DONE，不寄頂層inbox。

## 驗收（固定 2 條）

1. 葉mesh/凍結job映射、finite bounds/厚度/關鍵接合與離線build契約通過（核model證據不重造幾何），固定官方包/license/來源核對，不超25MB。
2. 單一headless真WebGL2/SwiftShader render與實際互動通過，正側背/一動作/分解PNG供親看，無JS錯與外部網路，browser無殘留。環境擋如實報，不以數量冒充渲染，不跑遊戲整合測試。

## 失敗怎麼處置

本線錯自行修viewer，模型問題回astra由它升版重驗，不能viewer補位。未拿到凍結或mesh時有用準備可繼續但不冒充完整；不擴依賴或驗證範圍。

## 主線首圖後有界返工

連續真體積已過，視覺需一輪：可讀暗面罩/感測光；胸肩股脛各別功能輪廓，不統一倒角方塊；少量暗分縫/內構/排氣與紅識別，不螺絲湊數。astra改top-down形狀/可見性規格、validate/hash升版後mesh，保留承力接合，不擴框架。UI只改初始hero斜角，正側背仍切換，不挪模型。文件最後，先hero圖給主線判。PNG改最多6張總8MB，整包25MB不變。

## 完成證據

2026-10-28 DONE。最終真WebGL2/SwiftShader完整13項互動PASS、6PNG已領導親看，主線已看hero/側背接受；browser已關。正面visor真可見，brow中心被jaw遮如實列限制。 原生工具終局回傳，不額外寄DONE信。git log依本輪統一main提交核對，commit/push歸領導。

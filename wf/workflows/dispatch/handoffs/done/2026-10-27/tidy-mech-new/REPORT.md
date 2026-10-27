# tidy-mech-new REPORT

## 做了什麼

按職責拆分並展開密集手寫程式，未調整數值、測試或演算法。`layout.ts` 保留原公開 exports；`geometry.ts` 保留原幾何與 parser exports。沒有搬走公開 CLI 或改參數。使用本機現有 TypeScript printer 與 Prettier，未下載安裝。

before → after 行數／職責：`layout.ts` 173→265（配置與工作單協調）、`geometry.ts` 180→197（區域運算）、`viewer.js` 59→152（資料、DOM樹及啟動）、`headless.mjs` 65→258（驗收生命週期與互動）、`verify.ts` 57→271（資產及姿態驗證）、`style.css` 3→257（原順序主樣式）。手寫單檔均≤300行；SVG序列化字串仍有長行，刻意保留原輸出字元。

新增配置職責：`layout-allocation.ts` 64行、`layout-validation.ts` 61行、`layout-motion.ts` 79行、`layout-drawing.ts` 53行、`layout-overlap.ts` 91行、`attachment-validation.ts` 88行。嚴格SVG parser為 `svg-geometry.ts` 226行。展示片段為 `viewer/drawing.js` 117行、`viewer/controls.js` 68行、`viewer/diagnostics.js` 18行，導航在 `viewer/README.md`。響應式樣式為 `style-responsive.css` 44行；證據容量核算為 `headless-budget.mjs` 44行。

## 產出

兩個原公開build命令不變，`build-viewer.ts` 現117行。展示片段在建置期按標記順序放回同一閉包；主樣式與響應式樣式按原順序合併。瀏覽器不讀取新增來源檔；HTML仍內嵌CSS、資料、SVG及JS。新增展示來源與容量工具已納入原 `owned/sourceBytes` 核算。

驗證全部exit0：

- `node --test art/mech-blueprint/blueprint.test.ts`：12/12（含原有失敗反例）。
- `node art/mech-blueprint/build.ts`：64 orders、0 errors。
- `nice -n 19 node art/mech-blueprint/build-viewer.ts`：64 attachments、64 parsed、12 transitions、253 samples、0 sampleFailures、0 errors。
- `./node_modules/.bin/tsc --noEmit -p art/mech-blueprint/tsconfig.json`；新增core模組由import連入原檢查。
- `node --check`：`headless.mjs`、`headless-budget.mjs`。
- 生成HTML兩個內嵌script以 `new Function` 解析成功，無未展開標記及外部資源標籤；CSS經既有Prettier正規化後，合併內容與before完全相同（忽略空白行），選擇器、宣告及順序未變。
- `git diff --check`；`git diff --name-status -M` 已逐檔核對，其他工人／領導變更未碰。

與 `/tmp/mech-tidy-new-before/` 快照逐bytes比較，`generated/layout.json`、`work-orders.json`、`validation.json`、`assembled.svg`、`exploded.svg`、`viewer-data.json` 六份完全相同。`index.html` 因內嵌程式及CSS排版改變。重建未造成其他生成檔變更。README已補新模組導航。寫集低於35檔，新增來源及HTML增量低於4MB。

## 沒做到或證據不足

本線沒有執行正式headless或改寫 `evidence/`，正式一個document請求、零pageerror與六圖對比由領導統一排程。已看到的 `evidence/interaction.json` 差異屬領導基準作業，不是本線所寫。未改data、parts、其他art、src、content、spec、legacy；wf僅寫本REPORT。

原有tsconfig未涵蓋verify/build-viewer/headless，未擴張其include（不在寫集）。code-map同步由領導負責（本線禁止寫其他wf檔）。

## 需要決定的事

無。領導收件後補正式headless、圖像比對及code-map同步即可。

以後交接書該點名的工具：既有本機formatter、`node --test art/mech-blueprint/blueprint.test.ts`、兩個build、原型 `tsc --noEmit`、`git diff --check`、生成檔bytes比較；正式headless與wf-lint由領導集中執行。

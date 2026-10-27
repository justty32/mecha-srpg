# tidy-mech-old — DONE

## 做了什麼

`check-tree.cjs` 從363行降為86行，保留命令列、資料載入、來源雜湊與語意模型狀態檢查；XML真實幾何、DOM接線、演出時鐘、離線頁檢查分別歸入 `checks/`，未刪除任何既有斷言或反例。`style.css` 原357行依展示、戰場、特效與控制／窄螢幕覆寫拆為三份手寫源，由 `rebuild.py` 原序合併成相同的357行輸出；生成檔是300行原則的例外，保留單一CSS請求、順序、特異性與底圖解析。`rebuild.py` 225→229行，只新增樣式合併；`demo.js` 238行未改，沒有足夠職責收益再拆。

## 產出

實質13檔，均在寫集：`art/svg-study-1027/` 下既有 `check-tree.cjs`（86行）、`rebuild.py`（229行）、`README.md`（66行）；新 `checks/tree-xml.py`（42行）、`checks/tree-dom.cjs`（151行）、`checks/motion.cjs`（78行）、`checks/offline.cjs`（21行）、`checks/README.md`（10行）、`styles/showcase.css`（170行）、`styles/battle.css`（102行）、`styles/controls.css`（85行）、`styles/README.md`（9行）；以及本 REPORT。新增內容不足30 KB，未觸20檔／2 MB gate。

定向驗證：`node art/svg-study-1027/check-tree.cjs --python > /tmp/tidy-old-tree.py`、`python3 -B /tmp/tidy-old-tree.py "$PWD/art/svg-study-1027" > /tmp/tidy-old-xml.json`、`node art/svg-study-1027/check-tree.cjs --xml-json /tmp/tidy-old-xml.json` 均exit 0；cold142、ritual140、feral140，runtime／全部output depth5，與領導before基準一致。`--reject-fixture` exit1，原因「重複ID或缺中文標籤」，證明保留可變紅入口。`python3 -B art/svg-study-1027/rebuild.py --mech-only` exit0；重建前後三張bulwark SVG與index.html SHA-256相同，style.css與HEAD逐位元相同；串接樣式源並正規化底圖相對路徑後等於原CSS全文。`git diff --check` exit0；`git diff --name-status -M -- art/svg-study-1027` 僅上述三個既有檔改動，新檔另以檔案存在／行數核對。`bash wf/tools/wf-lint.sh --strict .` exit0，broken／oversize／biglist／querycmd／local皆0。

## 沒做到或證據不足

沒有跑完整suite、headless或瀏覽器，也未宣稱布局、file瀏覽器載入與動畫時間序列目視驗收；既有待回家驗收仍適用。生成SVG／JSON、美術來源、其他CSS、index.template.html與index.html無變更。code-map在本線禁寫的wf範圍，已通知領導於整合時更新獨立美術段導航。沒有commit、push、安裝或GUI操作；其他工作線改動保留未碰。

## 需要決定的事

無新增裁決；請領導接受生成的style.css保留357行例外，手寫源皆小於300行。styles/來源需經現有rebuild命令合併，檔案入口已說明。

以後交接書該點名的工具：Node雙階段XML核對、Python ElementTree／runpy、SHA-256與逐位元CSS串接比對、`--reject-fixture`、`git diff --check`／`git diff --name-status -M`、`wf-lint --strict`。

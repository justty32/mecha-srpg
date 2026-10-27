# 任務：整理舊SVG試作的驗證程式與樣式

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/STRUCTURE.md`、`wf/workflows/refactor/README.md`、`wf/workflows/refactor/moving-things.md`、`wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`art/svg-study-1027/README.md`；親讀。

## 背景與唯一目標

只整理舊美術試作 `check-tree.cjs` 的檢查責任與 `style.css` 區塊，保留原檢查、離線展示與造型。`rebuild.py`／`demo.js` 有具體職責收益才動，不能為數字硬切。

## 範圍（排除法寫死）

- 可寫：`art/svg-study-1027/check-tree.cjs`、`style.css`、`rebuild.py`、`demo.js`、`index.template.html`、`index.html`、`README.md`、必要新子模組與子目錄 README；本線 REPORT。
- 不做：寫該目錄其他SVG/JSON/CSS、美術來源、既有生成圖、其他 art／src／content／spec／legacy／wf。保留 `node check-tree.cjs --python` 與 `--xml-json` 入口、file單頁嵌入樣式與腳本。CSS順序與特異性不得變。
- 件數 gate：本線實質變更最多 20 檔；容量 gate：新增內容最多 2 MB；任一觸發即回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `node art/svg-study-1027/check-tree.cjs --python`、`python3`、`node art/svg-study-1027/check-tree.cjs --xml-json` | 原有雙階段樹檢查 |
| `python3 -B art/svg-study-1027/rebuild.py --mech-only` | 重建入口；先確認預期輸出路徑 |
| `git diff --check`、`git diff --name-status -M` | 核範圍 |

## 資源與禁區

- 可寫程式碼線；不 commit/push、不開分支、不 rebase/reset、不 `git add -A`、不刪來源或生成圖。不碰鍵鼠螢幕、不開GUI、不下載安裝、不改全域設定。子代理上限0、平行工人最多3；全機重負載最多1，先查 `pgrep -fa 'node --test|playwright|npm (test|run)'`。僅輕量定向檢查，不跑headless/完整suite。

## 工作

1. 對照舊命令與生成輸出，按檢查責任拆檔，樣式按區塊展開；保留腳本內現有反例與檢查能力。
2. 跑雙階段樹檢查與重建，對比輸出與基線；生成圖不可留下意外改動。
3. 寫 REPORT，列 before/after 職責、行數、驗證及未做項。

## 交付

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/tidy-mech-old/REPORT.md` 與範圍內程式。REPORT 四段：做了什麼／產出／沒做到或證據不足／需要決定的事；末尾「以後交接書該點名的工具」。

## 驗收（固定 3 條）

1. `check-tree.cjs` 與 `style.css` 依職責可讀，手寫源原則≤300行；例外說明原因，不以壓行數或移除檢查達成。
2. 原雙階段樹檢查與 mech-only重建 exit 0；既有生成SVG/JSON、file入口行為與CSS順序/特異性不變。
3. REPORT 存在並附精確受影響檔、行數、命令回傳和限制；`git diff --check` 為0。

## 失敗與回報

測出差異修回原意；環境阻塞保留改動報 BLOCKED。原生 agent 用工具回傳五行摘要與 REPORT 絕對路徑，不用 inbox；終局必為 DONE／BLOCKED／FAILED。

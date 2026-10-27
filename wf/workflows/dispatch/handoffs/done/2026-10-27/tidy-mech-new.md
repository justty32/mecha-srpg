# 任務：按職責拆分新機甲原型手寫程式

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/STRUCTURE.md`、`wf/workflows/refactor/README.md`、`wf/workflows/refactor/moving-things.md`、`wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`art/mech-blueprint/README.md`；親讀，不靠領導摘要。

## 背景與唯一目標

今日先收工，只把新機甲原型的密集長行按空間配置、幾何、DOM與控制、驗證責任拆成可讀模組；維持資料、演算法、視覺、file離線單頁與公開命令不變。領導已固定基線，正式 headless 與整合驗收由領導排程。

## 範圍（排除法寫死）

- 可寫：`art/mech-blueprint/` 根層手寫 `.ts`、`.js`、`.mjs`、`style.css`、`index.template.html`、`README.md` 與必要新職責子模組／子目錄 README；可更新由 build 生成的 `index.html`、`generated/`，但別改 data／parts／evidence。
- 不做：寫 `art/mech-blueprint/data/`、`parts/`、`evidence/`、任何其他 art／src／content／spec／legacy／wf 路徑，除了本線 REPORT。64件仍各一份SVG。不可增加網路／file讀取；viewer、CSS、data及SVG仍由 build 嵌入單頁。CSS 選擇器順序與特異性維持。
- 件數 gate：本線實質變更最多 35 檔；容量 gate：新增內容最多 4 MB；觸發即回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `node --test art/mech-blueprint/blueprint.test.ts` | 定向測試 |
| `node art/mech-blueprint/build.ts`、`nice -n 19 node art/mech-blueprint/build-viewer.ts` | 重建入口與語意輸出；只在無別的重負載時執行 |
| `git diff --check`、`git diff --name-status -M` | 逐檔核對 |

## 資源與禁區

- 可寫程式碼線，僅範圍內路徑；工人不 commit、不 push、不開分支、不 rebase/reset、不 `git add -A`。不碰鍵鼠螢幕、不開GUI、不下載安裝、不改全域設定、不刪資料／資產檔。子代理上限 0，平行工人最多3，全機重負載最多1；先 `pgrep -fa 'node --test|playwright|npm (test|run)'`，僅跑自己的輕量定向測試。正式 headless、整包 suite 由領導統一排程。不要寫其他 worker 路徑。

## 工作

1. 記 before/after 職責與行數，先格式展開再按責任拆；保留公開入口與 exports。
2. 重建並跑定向測試，核對輸出；若生成 bytes 因整理不同，說明語意等效證據。不可為過關改數值、測試或演算法。
3. 寫 REPORT，包含新增模組路徑、受影響命令、驗證結果與例外；原生工具回傳 DONE/BLOCKED。

## 交付

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/tidy-mech-new/REPORT.md` 與範圍內原型；REPORT 四段：做了什麼／產出／沒做到或證據不足／需要決定的事，末尾「以後交接書該點名的工具」。

## 驗收（固定 3 條）

1. `layout.ts`、`geometry.ts`、`viewer.js`、`headless.mjs`、`verify.ts`、`style.css` 的密集長行已按責任整理，手寫單檔原則 ≤300行，必要例外列原因。
2. 兩個 build 命令與核心12項測試 exit 0，64件／診斷語意不變，file頁資源仍全內嵌；不修改 data／parts／evidence。
3. REPORT 存在並列 before/after 職責、行數、精確驗證與未動範圍；`git diff --check` 為0。

## 失敗與回報

測出行為差異先修回原意；環境阻塞保留改動報 BLOCKED。原生 agent 用工具回傳五行摘要與 REPORT 絕對路徑，不用 inbox；終局必為 DONE／BLOCKED／FAILED。

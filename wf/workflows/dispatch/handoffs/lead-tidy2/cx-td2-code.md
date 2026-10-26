# 任務：把四個超過 300 行的程式檔按職責拆開，行為不變

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/common.md`（共通規則，必讀），再讀 `wf/workflows/refactor/README.md`、`wf/workflows/refactor/moving-things.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（＋`code-map.json`）、`wf/workflows/testing.md`。

## 範圍（排除法寫死）

件數 gate：超過 4 個原檔就停；容量 gate：新增程式碼超過 0.1 MB 就停。

只拆這 4 檔（STRUCTURE：程式碼單檔 > 300 行要拆）：
1. `src/ui-adapter/vm/wiki/cards.ts`（345 行）
2. `src/ui-adapter/dom/wiki/mount.test.ts`（311 行）
3. `src/mcp/campaign.ts`（356 行）
4. `src/mcp/battle.ts`（344 行）

做法：按職責（不是等分）拆出同資料夾的新檔；**原檔保留且所有現有匯出名不變**（原檔可 `export … from './新檔.ts'` 轉出），所以其他模組的 import 一行都不用改；新檔名照該資料夾既有命名慣例。測試檔拆成兩個以上 `*.test.ts`，測試案例一個不少（拆前拆後 `grep -c "test(\|it(" ` 總數相同）。每個結果檔 ≤ 300 行。不改任何邏輯、字串、型別、順序相依的副作用。`code-map.md`／`code-map.json` 只更新這四檔所在的列（加上新檔）。

不做：其他任何 src 檔（`lead-engine-next` 正在改 src，碰到別的檔會撞車）；不改 import 端；不跑 `GOLDEN_UPDATE`／重錄；不改格式化設定。若發現某檔被別人同時改了（`git diff` 出現不是你寫的變動），停下寫 REPORT。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run typecheck`、`npm run check` | 每拆一檔就跑 |
| `node --test src/mcp src/ui-adapter` | 驗測試 |

## 資源與禁區

**可寫程式碼線**：只寫「範圍」列的路徑。共通禁區見 common.md（不 commit、不刪、不碰現役線、不碰鍵鼠 GUI、不 push）。

## 交付

REPORT 寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/code/REPORT.md`（附每檔拆前行數→各新檔行數）。

## 驗收（固定 4 條）

1. `wc -l` 這 4 個原檔與所有新檔都 ≤ 300。
2. `npm run typecheck` 0 錯；`npm run check` 錯誤數 0。
3. `node --test src/ui-adapter src/mcp` 全綠（沙箱計數不準可註明，領導沙箱外重跑 `npm test`）。
4. `git diff --stat` 只含上列 4 檔、新檔與 code-map 兩檔。


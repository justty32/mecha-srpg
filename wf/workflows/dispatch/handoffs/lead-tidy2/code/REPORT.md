# cx-td2-code REPORT（第 2 輪；工人在寫 REPORT 前因模型容量錯誤中斷，由領導驗收後代寫）

[lead-tidy2](../common.md)

## 做了什麼

照 refactor 流程按職責拆四檔，原檔保留且所有匯出名不變（以 re-export 轉出），import 端零改動：

| 原檔 | 拆前 | 拆後 |
|---|---|---|
| `src/mcp/battle.ts` | 344 | 290＋`battle-hub.ts` 64（戰鬥 session 表、建構、觀察、AI 推進） |
| `src/mcp/campaign.ts` | 356 | 284＋`campaign-support.ts` 82（出戰候選、參數驗證、戰果記錄） |
| `src/ui-adapter/vm/wiki/cards.ts` | 345 | 146＋`card-builder.ts` 203 |
| `src/ui-adapter/dom/wiki/mount.test.ts` | 311 | 175＋`pages.test.ts` 156（測試案例 14→14） |

code-map.md／code-map.json 補對應列。

## 驗收（領導沙箱外跑）

`npm test` 966／966（與基準相同）、`npm run check` 0 錯 10 警告（同基準）、`npm run typecheck` 0、`npm run test:e2e` 13／13；執行期匯出名對照（動態 import）無缺漏，`BattleHub` 為型別、已 `export type` 轉出。

## 沒做到／需要決定的事

無。以後交接書該點名的工具：測試指令要寫 glob（`node --test 'src/x/**/*.test.ts'`），目錄參數在 Node 24 會被當模組載入。

# test — 怎麼跑測試與內容檢查

本專案**不裝任何套件**：node 24 原生執行 `.ts`（type stripping），測試用 node 內建 test runner。版本見根目錄 `.nvmrc`（24）。

## 兩條指令（都從專案根跑）

| 指令 | 做什麼 | 綠燈長相 |
|---|---|---|
| `npm test` | `node --test --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'` | `# fail 0`，exit 0 |
| `npm run check` | `node src/content/loader.ts content/base`：載入 base 內容包、驗 schema／參照／登記值／池宣告 | 每類件數一行，末行 `OK 0 errors, …`，exit 0 |

只跑一支：`node --test src/core/rng.test.ts`。

## 測試放哪

- 單元測試與被測檔同目錄：`src/<模組>/*.test.ts`（core：rng／numexpr／eventlog；content：content.test.ts）。
- 跨模組的情境黃金測試、不變量測試放 `test/`（`test/scenarios/*.json` 等，由 sim 線補上）；`npm test` 已涵蓋 `test/**/*.test.ts`。

## 決定性

同一 seed 必得同一事件日誌 hash：`src/core/eventlog.test.ts` 的決定性案例以 `createRng(seed)` 驅動 `appendEvent` 後比對 `hashLog`。RNG 是 PCG32，期望序列寫死在 `src/core/rng.test.ts`（與 pcg-c-basic 參考輸出一致）。

## 寫測試的限制

只用可被擦除的 TS 語法（不用 `enum`、`namespace`、建構子參數屬性）；相對 import 帶 `.ts`；型別匯入用 `import type`。測試以專案根為 cwd。

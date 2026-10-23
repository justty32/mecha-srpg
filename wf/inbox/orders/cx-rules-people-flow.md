
## 2026-10-24T07:33:12+08:00 — from: lead-impl-rules — 黃金情境只引用測試包內容，不引用 base 的內容定義

`content/base/` 正被 `lead-impl-content-base` 線並行增改，base 的機體／部件／能力／效果數值一變，黃金 hash 就會跟著變。所以：**黃金情境（`test/scenarios/*.json`）的 setup 只准引用 `test/scenarios/pack/` 裡的內容 id**（frame、component、ability、effect、person、species、bodyplan、terrain 都是）；需要 base 裡已有的東西就**複製**成你自己前綴的檔（combat `cb-`、people `pp-`）放進測試包，包內互相引用不加前綴。base 的登記檔（registries：attrs、layer-types、damage-types…）與 rules 表照常可依賴。單元測試可以照舊用 base 內容。另：`src/content/content.test.ts` 的件數斷言現在會因 base 新增內容紅一筆，是預期，由領導修，不算你的失敗。

## 2026-10-24T07:34:23+08:00 — from: lead-impl-rules — 准：件數 gate 從 26 提到 32

為了黃金情境只引用測試包內容而複製 base 檔，件數 gate 提到 32 個新檔（容量 gate 不變）。不要引用 cb- 檔（combat 線的檔可能還在改）。其他照交接書。

## 2026-10-24T07:39:49+08:00 — from: lead-impl-rules — combat 已合併

combat 六檔已 commit（72d5043）。可照交接書第 4 步跑 `GOLDEN_UPDATE=1 node --test test/golden.test.ts` 產 people hash（`test/golden.test.ts` 與 `src/rules/index.ts` 是領導的檔，已在工作樹）。combat 線回報 people-capture 情境在 seed 42 第二擊擲 97 未命中——請換 seed 或補指令讓捕捉條件成立，不要改 combat 檔。

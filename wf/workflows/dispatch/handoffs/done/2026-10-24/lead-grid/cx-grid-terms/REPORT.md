# cx-grid-terms 完成回報

## 做了什麼

依交接書六組對照替換顯示字串、同步測試與兩個資料檔。23 個既有檔共 48 處；另有本 REPORT（交接書指定交付物），合計 24 檔，未超過 30 檔。無新程式檔、不 commit，未更動識別字、內容 id、content 或註解。

以下以目錄為前綴，括號為替換處數，合併前綴即為改動檔完整路徑：

`src/mcp/`：`campaign.ts`（2）、`campaign-view.ts`（1）、`campaign.test.ts`（1）。

`src/ui-adapter/ops/dom/`：`render.ts`（2）、`render.test.ts`（2）、`fixtures.ts`（1）、`tabs.ts`（1）。

`src/ui-adapter/ops/vm/`：`snapshot.ts`（2）、`labels.ts`（1）、`keymap-ui.json`（1）。

`src/ui-adapter/vm/`：`labels.ts`（1）、`wiki/cards.ts`（1）、`wiki/lore.test.ts`（1）。

`src/ops/sim/`：`cli.ts`（2）、`cli.test.ts`（1）、`health.test.ts`（1）、`campaign.test.ts`（3）、`war-invariants.test.ts`（2）。`health.ts` 無舊詞、不需修改。

其他程式與測試：`src/sim/probe.ts`（2）、`test/sim/probe.test.ts`（7）、`e2e/ops-campaign.spec.ts`（1）。

`wf/workflows/content/`：`numeric-bands.json`（5 個「類別」值）、`playtest-baselines.json`（7：columns 名稱 1＋各列鍵名 6）。資料先以 `wf/tools/tabledb.py` 查詢，再用它提供的 Python API 更新；保留原排版，除指定鍵值外無資料變動。probe 的類別比對與測試資料查找同步改為「衍型機」，避免改表後數值帶檢查失效。

開工 grep 共 51 行：33 行授權的顯示字串／測試與 fixture、12 行範圍外測試名稱、6 行註解。後兩類逐行完整列於下方收工輸出；其餘開工命中均為字串字面值或測試斷言，已替換。開工原始記錄在 `/tmp/cx-grid-terms/before-grep.txt`。

## 產出

收工執行交接書指定 grep（exit 0 表示仍有以下保留命中）：

```text
src/ui-adapter/ops/dom/render.ts:2:// 佈局：頂列（日期、潮相、錢、位置、航程、燃料、船體＋推進鈕）常駐；左欄分頁＋裂縫／佇列小表；主區依 tab；右欄記錄。
src/ui-adapter/ops/vm/types.ts:51:  dateText: string;                 // 例「第 1 潮月 第 15 日（大潮）」
src/ui-adapter/ops/vm/types.ts:56:  pressure: number;                 // 潮壓
src/ui-adapter/ops/vm/types.ts:156:  days: { dom: number; phase: "spring" | "neap" | "ordinary"; today: boolean; deadline: boolean }[];   // 本潮月逐日
src/ops/crew/restraint.test.ts:105:test("菌房每潮月排 prune，未完成 layers 增長；keymap 重鍵載入拒絕", () => {
src/ops/world/pressure.ts:12:  // 指數等待時間法，不計 exp(-mean)，避免高潮壓下下溢。
src/ops/world/rifts.test.ts:30:test("rifts：兩次大潮防守封印、潮月退區到 closed", () => {
src/ops/world/market.test.ts:47:test("market：新型上市一潮月內乘 1.5，之後回到基價", () => {
src/ops/world/market.test.ts:75:test("market：護航補貨並解除加價、scarcity 一潮月、封港停止交易刷新", () => {
src/ops/world/blight.test.ts:33:test("蝕塊：深度與 sinceDay 的潮月門檻一致", () => {
src/ops/world/blight.test.ts:48:test("蝕塊：城邦 footprint 任一格被蝕 iff 裂獸 ownerOverride，乾淨後恢復一潮月", () => {
src/ops/war/merc.test.ts:36:test("黑名單三潮月到期", () => { const { s, ctx, actor } = mercFixture(); s.flags[`blacklist:${actor}`] = 84; s.clock.day = 84; mercDaily(s, ctx); assert.equal(s.flags[`blacklist:${actor}`], undefined); });
src/ops/war/rnd.ts:60:  // 最近一潮月各型現存整備缺額，作為沒有獨立折損帳時的戰損訊號。
src/ops/war/rnd.test.ts:88:test("研發只在潮月第1天加點，不消耗主 rng", () => {
src/ops/war/rnd.test.ts:104:test("取殼後恰滿兩潮月才開血統（非月初取得）", () => {
src/ops/war/rnd.test.ts:120:test("重新取得殼仍需兩潮月，不能立即解除停研", () => {
src/ops/war/rnd.test.ts:169:test("trade 連續六潮月到期才 licensed 流出，非月初也生效", () => {
src/ops/state/clock.test.ts:6:test("clock：dom 與潮相對照", () => {
```

產品顯示字串命中為 0。上列逐行分類：含 `test("` 的 12 行是測試名稱；其餘 6 行均為 `//` 註解（包含 `types.ts` 的行尾註解）。無產品輸出殘留。

固定四條驗收（未追加驗收）：

1. 舊詞產品顯示字串零命中：通過；依領導 2026-10-24 21:08 orders，產品輸出＝玩家／MCP／CLI，範圍外測試名稱保留。
2. `npm run typecheck` exit 0；`npm run build` exit 0，1413 modules transformed，897ms。
3. `npm test` exit 1：146 個檔案層級結果，143 pass、3 fail，耗時 257607ms；三個失敗全列於下節。依交接書環境限制例外交領導沙箱外完整重跑，未宣稱全過。
4. REPORT 為本檔；23 個改動檔均在交接書授權路徑或其測試／fixture，REPORT 在指定目錄。git diff 為 23 檔、48 insertions、48 deletions。

日誌：`/tmp/cx-grid-terms/typecheck.log`、`build.log`、`test.log`、`after-grep.txt`。

## 沒做到或證據不足的

沙箱內完整測試未全過；僅有 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts` 失敗，僅針對這三個失敗檔直接執行以取得 npm TAP 未列的錯誤證據，沒有新增測試或驗收項。

worldgen：`spawnSync node EPERM`，位於 `worldgen.test.ts:61–62`。MCP cli：`cli.test.ts:19` 的 serve 就緒斷言失敗；MCP e2e：兩例均為 `server 提前退出 0`。後兩者的沙箱外原因尚未證實，不能宣稱全過；依交接書的 MCP／子行程已知限制條款交領導重跑，不因此停工。證據檔為 `/tmp/cx-grid-terms/{cli,e2e,worldgen}-failure.log`。

## 需要決定的事

原先範圍與驗收口徑衝突已由領導裁示解除：`wf/inbox/orders/cx-grid-terms.md` 的 2026-10-24 21:08 回覆確認只要求產品輸出零命中，以下測試名稱留存（共 7 檔、12 行）：`src/ops/crew/restraint.test.ts:105`；`src/ops/world/rifts.test.ts:30`、`market.test.ts:47,75`、`blight.test.ts:33,48`；`src/ops/war/merc.test.ts:36`、`rnd.test.ts:88,104,120,169`；`src/ops/state/clock.test.ts:6`。不需另擴本線範圍。

保留的 6 行註解：`src/ui-adapter/ops/dom/render.ts:2`；`src/ui-adapter/ops/vm/types.ts:51,56,156`；`src/ops/world/pressure.ts:12`；`src/ops/war/rnd.ts:60`。完整原文在上方 grep，依交接書不改。

其餘無。終局依交接書已知環境限制例外回報 DONE；第三條的沙箱外全綠證據由領導補齊。

## 以後交接書該點名的工具

無。

# REPORT — lead-ui-ops：營運畫面上線、接約出戰回營運打通（頂層代存，2026-10-24）

STATUS：**DONE**，commit `c04614f`。工人：codex `cx-uops-vm`（vm）、Opus `op-uops-dom`（DOM＋戰鬥銜接，REPORT 與截圖在 [op-uops-dom](op-uops-dom/REPORT.md)）。

## 入口
`npm run dev` → `http://localhost:5173/#/ops`（或導航「營運」）；`?seed=<n>`、`&spectate=1`、`&anim=off`，例 `/?seed=3&spectate=1#/ops`。

## 畫面
頂列（日期潮相、現金、債、所在地、航程、潮壓、燃料、船體、推進一天、到下個事件、讀檔、說明）；左欄八分頁＋常駐裂縫小表與工時佇列；右欄五色記錄。分頁：船艙、世界圖（節點與航線、點節點航向）、契約（接約、三種談判、放棄、航向、出戰）、名冊、機體（稱號、部位、存量、座位、生物系磨損活性）、帳本、市場、潮曆。疊層：事件與對話、命名（含自填）、出戰編成、戰果報告。不可按鈕變灰並說明原因。

## 快捷鍵
H／G／C／R／K／N／T／Y 分頁；W 推進一天、E 到下個事件；F1–F6 房間；L 看、M 圖、Q 工時、D 投屍、S 存檔；A 接約；B 出戰編成（Enter 親自指揮、A AI 結算、Esc 取消）；1–9 選項；Esc 說明／關閉；戰後 Enter 返回營運。分頁鍵避開 Alt+數字（Linux Chrome 佔用）。

## 出戰銜接
`src/ops/sortie/` 新增唯讀 `sortieBattleSetup`（測試證明與 AI 自動出戰同結果）→ 掛戰鬥畫面 → 返回時同一筆出戰指令正式回寫 → 戰果報告；另有 AI 自動結算；出戰後存讀檔狀態一致。

## 測試（乾淨副本）
`npm test` 471、check 0、typecheck 0、`test:dom` 143、build 過、e2e 11（含 `e2e/ops-campaign.spec.ts` 全流程）。主工作樹 1 紅為別線未提交內容改動造成的 ops 黃金 hash。

## 判斷
- 世界圖只在 `vm/layout.ts` 與 `dom/world-map.ts`，對齊 `specs/ops/world-grid/ui-contract.md`，換方格只換這兩檔。
- 營運層缺口：記錄文字粗糙（`world/templates/default.json` 多為佔位：「未登錄事件：WorldAction／DockFee」、薪水訊息人名空白、裂縫與服務顯示原始 id）；自填命名無對應指令、自填後無法存檔；接約／出戰鍵暫放 UI 鍵表，建議寫進 `keymap-ops.json`。
- codex 日誌已移到本目錄 `trash/`（不追蹤）。

## 需要使用者試玩
手感與按鈕密度、記錄是否太吵、編成換座位；世界圖可讀性；親自指揮後戰果報告是否足夠；其他視窗尺寸；存讀檔。

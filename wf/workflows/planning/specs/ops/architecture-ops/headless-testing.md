[architecture-ops 入口](../architecture-ops.md)

# headless 測試策略

## headless 測試策略

**(1) 單元**（`src/ops/**/*.test.ts`）：曆函式、裂縫狀態機每條轉移（表格驅動：phase × 事件 → 期望 phase）、蝕壓更新、帳本 `post` 的拒絕政策、欠薪等比例分配、工時佇列灌注順序、價格公式、談判檢定、`parse` 的每個動詞與模糊比對、房間片語選取；**尋路**（固定小圖 12 案例、A\* ＝ Dijkstra、決定性）。

**(2) 蝕月模擬**（`npm run sim:campaign -- --start default --months 12 --seed 7 --policy greedy`）：內建 policy（`idle`：只等；`greedy`：接最近契約（格距離）、全員出戰、戰鬥用 `ai-vs-ai` 跑；`merc`：見 war-testing）跑 N 個蝕月**不拋錯**，印每蝕月一行（cash、debt、人數、獸數、蝕格數、行動者數、遭遇數、裂縫數）。dispatch 驗收用這條。

**(3) 不變量／屬性測試**（隨機 policy × 隨機 seed × 6 蝕月）：**帳本守恆**（重算 `balances` 等於折疊；每筆外源 `Posted` 有對應來源事件；`stock:*` 永不為負）；每個 `seat`／`boundTo`／`BeastState.mech` 指到存在的實體；裂縫 `phase` 轉移只發生在漲潮日或 `BattleResolved` 同日；`等 7` 與七次 `等 1` 的事件序列相同；`pendingChoices`／`pendingEncounter` 非空時 `day` 與 `pos` 不前進；mastery ∈ [0,1]；重播一致。world-grid 另加三組（移動時間守恆、N 蝕月不退化、蝕域屬性），數字在 [world-grid/migration-and-testing](../world-grid/migration-and-testing.md)。

**(4) 黃金戰役**：`test/campaigns/*.json`（固定開局、固定指令 30–60 條、固定 seed）→ 事件日誌 hash 與關鍵事件序列（例：`ContractAccepted → Arrived → BattleResolved → RiftPhase(unanchored) → RiftPhase(anchored, fedCount=1)` 證明養裂）存黃金檔。

**(5) 按鈕／快捷鍵／文字形式恆等**：對每個 `Screen.actions` 的按鈕，`parse(formatCommand(cmd))` 必等於 `cmd`；按鈕點擊與其 `key` 觸發兩路執行比對 state hash；keymap 無同 context 同鍵衝突。

**(6) DOM**（happy-dom）：`Screen` → DOM 的房間面板、記錄列表、按鈕組（標鍵、tooltip、disabled 原因）、大地圖面板；Playwright 兩條端對端（接約→航行→戰場→回營運；大地圖游標→Enter→到達→泊）。


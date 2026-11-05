# LINK-01 設計：生效階段、去重、相容與驗證

[證據](fable-link01.md)｜[報告入口](fable-report.md)

## 生效階段選項

- **A 戰鬥 makeUnit**（`src/rules/state.ts` initializePools 之後）：唯一真相；每場重建、營運 contribs 不進戰鬥（run.ts）、戰後 contribs 丟回 before（apply.ts:45）→ 天然不重複。
- **B 營運 instantiateMech**（`src/ops/content/instantiate.ts`）：只為機庫顯示 max；戰前數字和戰鬥一致。單獨做 B 沒有戰鬥效果。
- **C 兩邊**：顯示與結算一致，但兩處維護。

**推薦 A 必做、B 延後**（B 可只把 poolMods 併進 instantiatePools 的宣告加總，不建 contribs）。理由：A 是唯一有結算效果的位置；現有 persistPools（apply.ts:27-36）戰後就把含修正的 max 寫回營運，第一場後機庫顯示自動對齊。

## 套法（A）

**位置**：initializePools（state.ts:245）之後、`init.pools` 夾限（264）之前，否則帶進來的 cur 會被未含修正的 max 夾掉。坑：`init.parts`（269）匯入 broken 在夾限之後，而「已毀部件不掛」要讀 broken，建議把 parts 匯入提前到掛修正前，或掛完再對 init.pools 重夾一次。

**掛法**：逐槽（沿 poolDecls 的毀損判斷）把 poolMods 轉成 `addContrib(unit, {path:"self.pools.<pool>.max|regen", op:"add", value, source})`，attrMods 原樣 addContrib 但 source 覆寫。source 用 `component:<slot>` 而非 def.id：同件可裝兩槽（mx-fortress-a 兩個 armorMount），用 def.id 撤除會誤殺另一件。池不存在時跳過並交 lint 警告，不在 rules 擲錯。

**撤除**：`src/rules/layers.ts:78-83` 部件層毀處已算出 slot，先 `removeContribsBySource(unit, "component:<slot>")` 再走現有 recomputePool；layers.ts:97 部位毀對該部位所有槽同理。戰鬥內不修復，不需重掛。

**共鳴**（rules-people.md:21）留第二階段：掛時檢查 `will.resonance[def.id] >= threshold`，但共鳴每回合 turnStartPre 重算（will.ts:90），需動態加撤；第一階段無受影響件。

## 存讀檔相容

- 戰鬥：BattleState 整份序列化；state.ts:289-293 已對匯入 contrib id 抬 nextContrib，新 id 不撞。舊存檔少修正，可接受。
- 營運：MechState.contribs 仍 `[]`，格式不變；persistPools 只覆寫 before 既有池。
- 黃金：68 frame＋5 scenario 含 mx-* 修正件 → `test/golden.test.ts`、`test/campaigns/*` 必重錄（`GOLDEN_UPDATE=1`），應與 backlog 55 的重錄排同一輪，避免撞車。

## 需使用者裁決

1. 第一階段只做 A（戰鬥），機庫顯示延後？
2. 黃金重錄時機（與 55 合併，或獨立一輪）。
3. 共鳴門檻是否納入本次（建議否）。

## 修改路徑

`src/rules/state.ts`（makeUnit 掛修正＋順序）、`src/rules/layers.ts`（毀損撤除）、新測試、`wf/workflows/content/engine-facts.json` EF-02／EF-13 與 `mechs.md:50` 更新、engine-backlog 74 收線。可選 `src/ops/content/instantiate.ts`。

## 最小驗證計畫（本輪未跑 node，全部待執行）

1. 新 `test/rules/component-mods.test.ts`：frame/bulwark-ii＋mx-essence-cell → charge.max＝基值＋40；mx-hawk-eye → unitAttr accuracy＋6；同件兩槽 → 兩倍；部件層打毀 → 修正撤、max 回落、cur 夾限；`init.pools` cur 帶 120 進場不被夾成 100。
2. 回歸 `fg-ga-02/smoke.json` 16 項與 ga-01／03 的 20 項預期值。
3. `test/sim/save.test.ts` 加：存→讀→contribs 數不變，再跑一回合不重複。
4. golden 先看差異只落在池上限／屬性，再重錄。

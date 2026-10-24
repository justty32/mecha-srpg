# war-testing — 作戰／外交／參戰／研發的 headless 測試策略

[ops README](README.md)｜總策略 [architecture-ops](architecture-ops.md)（六類測試沿用）｜作戰 [data-model-operations-war](data-model-operations-war.md)｜外交 [data-model-diplomacy](data-model-diplomacy.md)｜參戰 [mercenary-contracts](mercenary-contracts.md)｜研發 [data-model-faction-rnd](data-model-faction-rnd.md)

目標：模擬 N 蝕月，勢力作戰與外交會演化、不拋錯、不爆炸（關係不退化成全員戰爭或全員同盟）、帳本守恆延續。全部在 node、無 DOM；驗收指令沿用 `npm run sim:campaign`，加 `--months 24 --policy idle|greedy|merc`。

## 單元（純函式、表格驅動）

**作戰**：抽象結算 `(r, m) → progress／折損` 對照表（r＝0.3／1／3，m＝0.7／1／1.3）；階段機每條轉移（含 `supply ≤ 0 → aborted`、`str < 0.3 → failed`）；`valid` 門檻（戰力、補給、同時數、`requiresRelation`）；分遣隊 `march` 逐日移位、`pos` 永在同一張 `map`。**外交**：`value → state` 滯後表（同一 value 從兩側進來結果不同）；`war` 需 casus belli；條約簽／到期／`breakIf` 各一例；驅動表每列一個最小案例。**參戰**：`accept` 的四個拒絕條件；`exclusive` 下對方契約 `expired`；三種背叛形狀各一例；補給四檔對帳本與 `techHours` 的影響；結算 `pay` 公式與貢獻比。**研發**：`income` 公式；可選池篩選（前置、血統、首次登場）；`leakModel` 後市場可見性變化；補員權重舊多新少。

## 蝕月模擬（每個 seed 24 蝕月不拋錯）

`idle` 政策看世界自己：每天作戰數 ∈ [0, 15]、單場 ≤ 45 天；24 蝕月內**至少**發生 1 次 `war`、1 次 `ceasefire`、1 次 `ModelReleased`、1 次 `PlaceTransferred`（原 `NodeTransferred`；世界在動）。新政策 `merc`：接最近的 `join`、跟到目標區域、全員出戰（`ai-vs-ai`）、違令隨機——證明參戰迴圈能跑完 `aftermath` 並結算。每蝕月印一行：作戰數、`war` 對數、`allied` 對數、釋出機型數、玩家 join 次數。

## 不變量（隨機 policy × 隨機 seed × 6 蝕月）

**不退化**：任一天 `war` 對數 ≤ 活勢力對數 × 30%、`allied` ≤ 40%、大勢力（5–8 個）之間至少出現 3 種 `RelState`；連續 `war` 單對 ≤ 6 蝕月（厭戰有效）。**有界**：`value ∈ [−100, 100]`；`progress ∈ [0, 1]`；`forces` 戰力 ≥ 0 且全世界總戰力在 24 蝕月內不低於開局的 30%（補員 ≥ 損耗）；`rnd.points ≥ 0`。**引用完整**：`OperationState.target.loc`、`mercSlots[].contract`、`ShellState.holder`、`ModelState.def` 皆指向存在實體；`relations` 鍵對稱且無自對。**帳本**：三條守恆照跑；`faction-supply`、`join-pay`、`loan-loss` 每筆外源都有 `OperationResolved`／`AllySupplied` 來源事件；借機歸還後 `inventory.mechs` 不含 `owner:"faction"` 的機。**時序**：`等 7`＝7×`等 1`（含作戰與外交事件序列）；`RelationChanged` 只在第 2 段；研發只在每蝕月第 1 天。**重播**：含作戰的 campaign 重播逐位元相同、戰鬥不重跑。

## 黃金戰役（固定 seed、固定指令）

(1) `ops-war-assault`：勢力攻堅 → `OperationEngaged ×3 → RiftPhase(unanchored) → OperationResolved → sealing`，玩家不在場。(2) `ops-merc-join`：`ContractAccepted(join) → Arrived → BattleResolved → OperationResolved → Posted(join-pay)`，`ally` 單位死亡寫回分遣隊。(3) `ops-betrayal`：接 A 的 join → `drop` → 3 天內接 B → `Betrayed`、`rep A −40`、`blacklist`。(4) `ops-relic`：兩勢力同古代機 → `same-target → tense → relic-hunt → ShellSeized → LineageOpened(+2 蝕月) → ModelReleased`。(5) `ops-leak`：玩家把借來的 `restricted` 機賣進市場 → `TechLeaked → maker rep −15`，下一次弦月他家市場列出該型。各存事件序列與 hash。

## 效能與量級

24 蝕月 `idle` 含 40 勢力、每日 ≤ 15 作戰，目標 < 5 秒（抽象結算是幾十次乘法；外交每日最多 40×39/2 對、只對有事件的對子寫）。`relations` 表以 `a<b` 字串鍵存，`structuredClone` 可序列化。

## 替使用者做掉的決定

1. **不退化寫成比例門檻**（30%／40%／3 種態）而非「看起來合理」：數字可調，測試可斷言。
2. **新政策 `merc` 只為驗證參戰迴圈**，不追求贏：greedy 已證明會輸，這裡測的是流程通不通。
3. **黃金五條各對一個功能面**：失敗時一眼知道是哪一塊壞。

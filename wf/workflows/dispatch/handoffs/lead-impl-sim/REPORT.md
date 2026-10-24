# REPORT — lead-impl-sim（頂層代存領導匯報，2026-10-24）

STATUS：**DONE**。commit：`03eeb4d` 開線、`07d90f5` 缺口、`3a01407` sim、`5a657cf` 收線。工人 REPORT：[cx-sim-gaps](cx-sim-gaps/REPORT.md)、[cx-sim-engine](cx-sim-engine/REPORT.md)。

## 做了什麼

- `src/sim/{run,replay,save,cli}.ts`＋22 測試（5 不變量、重播一致性）；`npm run sim -- --scenario <id> --seed <n> [--rounds] [--out] [--save] [--load]`。skirmish seed 1 兩次 hash `f754e05183afd077`。
- (a) 無駕駛員怪獸新增 controlMode `instinct` 交 AI（人物成本改扣機體同名池；四族＋`pp-tidewolf` 加行動點池）；棄機空機體維持 `none`。改了 `src/core/types-def.ts` 與 schema（只新增）。
- (b) 13 常數回 `content/base`（共 19）；步兵、3 士氣效果、失控效果回 base；測試包刪 8 重複檔；黃金 hash 3 個變（效果 id 前綴 `rtest:`→`base:`，事件數不變）。
- (c) `aiprofile/pack-hunter` → `swarm`；新測試：base 每個 aiprofile 的 policy 必須已登記。

## 判斷

- AI 很被動：skirmish 20 輪 Wait 160 次、出手 19 中 3、時限平手——tactical 係數仍是佔位值＋十分律壓低預估傷害；平衡問題，已排 roadmap。
- integration 測試為了讓 hound 開火放寬了地圖、狼移遠（調佈置，不是修 AI）。

## 需要決定的事（頂層 2026-10-24 處理）

1. `instinct` 補進 spec data-model-people → 交 spec 同步規劃線。
2. pack-hunter 用 swarm 先夠；試玩要「集火」再寫專屬 policy。
3. 情境接縫：rift-edge-nest ally 不算同盟；`killTarget` 參數鍵 `target` vs 規則讀 `unit`；地圖 globals 與 feature hp 不生效 → 派修正線。
4. 平衡：調 tactical `waitScore`／`dangerK`，判準 skirmish 20 輪 Wait 比例 <50% 或分出勝負 → 併入修正線。

# lead-impl-rules REPORT：規則層（spec 切線 3＋4＋5）

**STATUS：DONE**。`src/rules/` 的 17 個模組＋`index.ts` 已交付。`npm test` 164 過、0 敗（連跑兩次結果相同），`npm run typecheck` 與 `npm run check` 都 exit 0，6 個黃金情境的 hash 已寫死。

## 做了什麼

- 接手前一任中止的線：讀完交棒檔後刪掉（第一個 commit 收走）。核過 `src/core/types-state.ts` 的未提交改動，只有新增（一行 import 加上 `RulesRuntime` 型別與 `BattleState.rt?`）。前任寫好的契約和三份子線交接書沿用，只補了 typecheck 與半成品說明。半成品 `state／contribs／pools` 交給 `cx-rules-core` 決定要沿用還是重寫。
- 依調度者授權裝了 `typescript@7.0.2`（`--save-exact`，唯一的 devDependency），並加上 `npm run typecheck`（`tsc --noEmit`）。不裝 `@types/node`，所以另寫 `test/types/node-shim.d.ts`，只宣告專案實際用到的 node 內建模組與全域。這是第一次真的跑型別檢查，抓到 `src/core/numexpr.ts` 有兩處 `reduce` 型別推錯，已補上型別參數，行為不變。
- 調度者中途改令：`content/base/` 改由 `lead-impl-content-base` 持有。我撤回本線對 base 的改動（`constants.json` 還原、`terrain/plain` 移除），新開獨立測試包 `test/scenarios/pack/`（pack id `rtest`，依賴 `base`）。新常數鍵、步兵機體、士氣與失控效果，以及所有情境內容都放在這個包。另外下 order 給兩條工人線：黃金情境只能引用測試包的內容，base 數值變動才不會改到 hash。
- 派三條 codex 工人（gpt-6-astra，`codex exec -s workspace-write`）。先派 core（約 6 分鐘），通過後再並行派 combat 與 people-flow（約 11 與 13 分鐘）。每條都在沙箱外重跑驗收，由我 commit。
- 收線前發現 `combat-layers` 與 `combat-conduct` 的指令完全一樣、hash 也一樣，實際只有 5 個不同的情境。我把 `combat-layers` 改成「移動 → 結束 → 被敵方擊穿外層與座艙殼」，然後重產全部 hash。

驗收逐條證據：

1. `npm test`：`# tests 164`、`# pass 164`、`# fail 0`、`# skipped 0`，exit 0，連跑兩次。地基 38 條加上 rules 76 條單元測試（26＋26＋24），其餘是 ai／content 線並行加的測試與黃金測試 8 條。
2. `src/rules/` 有 17 個模組、`index.ts` 與 17 支測試（`git ls-files src/rules` 共 35 個）。`git diff 56117db -- src/core/types-def.ts src/core/types-state.ts src/core/events.ts` 沒有任何 `-` 行，只有新增。
3. `test/golden/` 有 6 個 hash 檔（combat 3、people 3）。黃金執行器每個情境都在同一程序內跑兩次並比對 hash，`npm test` 也整體重跑過一次。合計測試斷言 `LayerDamaged`、`LayerBroken`、`Conducted` 都至少有一筆。
4. `constraints.json` 中 `spec_section` 以 `rules-` 開頭的列共 18 個 id，逐一 grep `src/rules/*.test.ts` 都找得到，缺漏為 0。
5. `npm run check` 輸出 `OK 0 errors, 0 warnings`。`npm run typecheck` exit 0。`wf-lint.sh --strict .` 結果 broken=0、residue=0、local=0；oversize 與 biglist 都在 `specs/ops/`、`legacy/`、`content/README.md`，不屬本線。`package.json` 的 devDependencies 只有 typescript，沒有 dependencies。
6. 本線 5 個 commit 都以 `rules: ` 開頭，見 `git log --oneline`。沒有殘留的 codex 行程，也沒有 `cx-` tmux session。團隊 `rules` 已 close，四格 ROSTER 標為已收線，信件已 ack。**例外**：`git status --short` 不是空的，剩下的都是其他並行線（ai、ops-spec、inbox 的別人信件）的檔，本線路徑已全部提交。

## 匯出介面一覽（給 ai／sim 線用；一律從 `src/rules/index.ts` import）

完整簽名見同目錄的 [contract.md](contract.md) §2、§3、§5、§6，給 ai 的查詢與預覽清單見 §8。

```
state     Ctx Rejection RejectCode Result Subject UnitInit newRuntime rt emit constant unit person unitTags personTags
          frameView partDefs layerDefs seatsOf isActive unitAt terrainAt inBounds distance hostile commanderOf evalCtxFor makePerson makeUnit
contribs  Owner statValue addContrib removeContrib removeContribsBySource personAttr unitAttr roleAttr
pools     Cost poolDecls recomputePool changePool updateBand canPay pay regenTick
effects   EffectTarget applyEffect removeEffect removeBySource removeByTags tickEffects consumeUse effectsOf hasEffectTag flushPending
hooks     HookCtx VerbHandler SignalName SignalHandler CommandHandler registerVerb runActions dispatchHook onSignal signal registerCommand commandHandler
turn      initiativeOf computeOrder startBattle startRound beginTurn endTurn advance currentActor
movement  locomotionOf stepCost moveAlong reachable
command   abilitiesOf resolveCosts checkAbility tryCommand previewCommand
attack    hitChance pickPart modifiedAmount resolveAbility
layers    LayerSlot PacketIn LayerStep runLayers applyPacket isDead
conduct   conductRules conduct
morale    MORALE_STAGES setMorale moraleCheck moraleEvent
injury    injuryCandidates resolveConductInjury killPerson
will      resonanceScore refreshResonance burdenOf burdenTick goBerserk recoverBerserk
control   autonomyNodes controlCheck setControl handOver
flow      BattleSetup BattleResult createBattle eject retreat canCapture capture battleResult
objectives objectiveDone evaluateObjectives
```

跑一場的最短路徑是 `createBattle(db, setup, seed)` → `startBattle({db, s})` → 反覆呼叫 `tryCommand(ctx, cmd)`，直到 `s.rt.outcome` 不是 null。

## 黃金情境清單與 hash

| 情境 | 驗什麼 | hash |
|---|---|---|
| `combat-layers` | 移動 → 結束回合 → 被擊穿外層與結構層 → `PartBroken` → 死亡 | `4ca2fe0e57489b49` |
| `combat-conduct` | 座艙殼層受擊 → `Conducted` → 對駕駛員掛效果 | `8f15739ad520c9fb` |
| `combat-tenth` | `conventional-arms` 打 `kaiju` 只造成十分之一傷害 | `969fa5e9e4e214fa` |
| `people-berserk` | 高承擔指令權者失控 → `ControlChanged(berserk)` | `9920324a3e8c36dc` |
| `people-capture` | 打斷全部 locomotion 部位 → 拘束 → `Captured` | `f7a55f7012a0b0a0` |
| `people-eject` | 棄機 → `Ejected`、步兵單位出場 | `c86ec6aa436d1dfa` |

情境檔在 `test/scenarios/*.json`，內容包在 `test/scenarios/pack/`。執行器 `test/golden.test.ts` 載入 base 與測試包，重產 hash 用 `GOLDEN_UPDATE=1 node --test test/golden.test.ts`。

## SPEC-GAP 清單

各工人 REPORT 有逐條細節：[cx-rules-core](cx-rules-core/REPORT.md)、[cx-rules-combat](cx-rules-combat/REPORT.md)、[cx-rules-people-flow](cx-rules-people-flow/REPORT.md)。要點如下：

1. 部件 HP 層附在部位層序列的最內側，不算結構層。同名池只把 max 與 regen 相加，其餘欄位取第一個宣告。
2. 鉤子分派深度沒有地方存（RulesRuntime 已凍結），改在 `pending` 放負 uid 的暫存標記。
3. sustained 能力的 `removeOnZero` 只發 `poolDepleted` 信號，沒有任何模組撤除那個能力，屬於未接的線。
4. 攻擊方向與姿態沒有資料欄位，exposure 的這兩項倍率固定為 1。`line`／`cone` 用最小幾何解，沒有專門情境驗過。
5. reaction 只實作 `enemyLeavesAdjacent`（機會攻擊），`attackedAndMissed`、`allyTargeted`、`layerBroken` 尚未實作。
6. 共鳴的 `deeds`／`rejects` 不在凍結的 WillState 裡，不計入。autonomy 節點數以 SoulTreeDef 節點 `research.autonomy` 鍵計算。
7. 失控回穩時，原本的 controlMode 從最近一筆 `ControlChanged(to=berserk)` 事件取回。
8. `hold`／`escort` 兩種目標永遠不會完成。`BattleResult.loot` 一律是空陣列。spawn 的 id 規則自訂。
9. 契約層的決定：距離用 Chebyshev，單位不擋 LOS（遮擋換目標沒做），沒有 locomotion tag 時採 `leg`。

## 對 core／content 的改動

- `src/core/types-state.ts`：只新增 `RulesRuntime`、`UnitStatus`、`BattleOutcome` 與 `BattleState.rt?`。
- `src/core/numexpr.ts`：兩處 `reduce` 補 `<number>` 型別參數。這是改動、不是新增，但沒動簽名也沒動行為，typecheck 必須靠它才能過。
- `src/content/content.test.ts`：件數斷言從等號改成下限。這是調度者的改動（content-base 線來信建議），它出現在工作樹時剛好被我的 `e4fb1a9` 一起提交；前任留下的 terrain 1→2 已撤回。
- `content/base/`：最終對 base **零改動**（`terrains/plain.json` 由 content-base 線補回，屬於該線）。本線新增的內容全部在 `test/scenarios/pack/`。
- `package.json`：新增 `typecheck` script 與 devDependency `typescript` 7.0.2，另有 `package-lock.json`。新增 `test/types/node-shim.d.ts`。

## 沒做到或證據不足的

- 驗收 6 要求的「`git status` 為空」做不到：工作樹裡有並行線還沒提交的檔，本線的路徑則是乾淨的。
- 正式 base 內容包還缺 §0 的 13 個常數鍵、`frame/infantry`、`bodyplan/infantry`、`effect/morale-{shaken,breaking,fleeing}`、`effect/berserk`。在 base 補上之前，rules 只載入 base 跑不起來，必須連測試包一起載入（`constant()` 遇到缺的鍵會丟錯）。
- `wf/workflows/common/code-map.md` 與 `testing.md` 的 rules 列沒有更新：`wf/` 不在本線領地。
- 不變量／屬性測試（architecture §headless (3)）沒有做，不在本線範圍。

## 需要決定的事

1. 由 content-base 線（或下一條線）把上一段列的常數鍵與步兵、士氣、失控內容補進 `content/base/`。之後測試包裡的同名項可以刪掉，但黃金 hash 要重產。
2. 由頂層更新 code-map 與 testing：加上 `npm run typecheck`，並註明 rules 測試要載入測試包。
3. 是否實作其餘 reaction 觸發與 sustained 的 `removeOnZero` 撤除（SPEC-GAP 3、5）。判準：sim 線若出現需要反擊、掩護或自動開盾的情境，就開一條小線補上。
4. 黃金情境依賴 base 的登記檔與規則表（damage-modifiers、morale-events、injuries）。base 的這些表一改，hash 就會變，要重產並審事件日誌的 diff。

## gpt-6-astra 這次觀察到的癖好

- 三條線各花 6、11、13 分鐘交件，寫死的測試條數（26／26／24）都完全照數，匯出名與契約一字不差，自報數字與我在沙箱外重算的一致。
- **會照字面滿足「3 個情境」，但不保證情境彼此不同**：combat 線的兩個情境指令完全相同，只是 `expect` 不一樣，hash 也一樣。對策：交接書寫明「各情境的指令序列必須不同」，驗收加「hash 兩兩不同」。
- 遇到外線造成的紅燈（內容件數斷言、people 情境還沒修好）時，combat 線如實發 `BLOCKED` 並列出解除條件，沒有越界去改別人的檔。
- 收到 order 後會主動請求調高件數 gate（people-flow 發了 REQUEST），而不是自己越過 gate。
- 以後交接書該點名的工具：`node --test --test-isolation=none --test-name-pattern='黃金情境 <前綴>' test/golden.test.ts`（在沙箱內只跑本線的黃金情境）；`npm run typecheck`。

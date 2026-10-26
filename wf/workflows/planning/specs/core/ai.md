# ai — 陣營知識、候選生成、戰術權重×需求×目標估值、意圖宣告、可插拔策略

[core README](README.md)｜能力的 AiHints [data-model-abilities-effects](data-model-abilities-effects.md)｜行動入口 [rules-turn-and-actions](rules-turn-and-actions.md)

裁示：AI 資料驅動；AI 與玩家都用陣營共享感測，未偵察的內層以 body plan 公開情報估計（decisions 第 9 題、ToME 第 8 題）；AI 選招依能力宣告的戰術權重。

## 三層：Strategy（陣營）→ Agent（單位）→ Policy（可插拔）

```ts
interface Strategy { id: Id; deploy(ctx): Deploy[]; roundPlan(ctx): Assignment[]; onEvent(ev): void }    // AI-01 採用
interface Agent    { unit: Id; policy: Id; memory: Record<string, unknown>; takeTurn(ctx): Command[] }
interface Policy   { id: Id; propose(ctx, agent): Candidate[]; score(ctx, agent, c: Candidate): number }
```

`Strategy` 持有陣營知識與分工（例：接敵登記，AI-15；守／攻模式，AI-06 改造成單一 `stance` 值），每輪輪始產生 `Assignment`（目標優先、要守的格、要護的單位）給各 Agent 當 `want` 的輸入。`Policy` 是純函式插件，用 id 登記在 `ai/policies/`；內容包的 `aiProfile` 指向一個 Policy＋參數。預設提供：`tactical`（下述通用流程）、`berserk`（只攻最近者、不退）、`swarm`（子體跟母體）、`sentinel`（守格不追）、`flee`（士氣逃跑用）、`scripted`（情境腳本序列）。

SPEC-GAP 補（2026-10-26 lead-engine-next）：berserk 保持追敵與不退的狂攻評分，容許目標僅自身且有正邊際收益的自護／自增益。攻擊增益沿用既有公式，須預覽確認新增屬性且施放後仍有合法、可付成本的攻擊；不做攻擊 lookahead。自護依當前威脅與實際增閃收益，按 berserkDefenseThreshold／berserkDefenseCap 比較既有攻擊；不插入友方支援。

## 知識模型（AI-05 不採用「全知名單」）

`FactionKnowledge = { visible: Set<unitId>; lastSeen: Record<unitId, { cell, round }>; revealed: Record<unitId, Record<PartId, LayerKnowledge>> }`。感測＝該 slot 所有單位 `perception` 半徑（含感測部件 contribs）的聯集，每輪重算；離開視野的單位保留 `lastSeen`、過期 `k` 輪後移除。對手內層 HP 預設只知道 body plan 的**公開欄**（層的種類與順序、最大 HP），`revealed` 由偵察能力（`tags:["scan"]`）寫入實際值。估值讀 `FactionKnowledge`，**不讀真實狀態**；玩家 UI 讀同一份（所以玩家也看不到未偵察的內層實值）。

## 回合流程（通用 tactical Policy）

**第 1 步・需求 `want`**（TM-25 改造）：由單位狀態求值一組需求分：`survive`（hp 池比例低、承擔逼近上限）、`kill`、`disable`、`protect`（Assignment 指定）、`scout`、`reposition`、`retreat`（AI-17 改造：兵力比與士氣）；各需求是 `aiProfile` 參數裡的 NumExpr。

**第 2 步・候選生成**（AI-09 改造：不是「先抽技能再找目標」）：對每個可負擔的能力 × 合法目標（含 `part` 選項若 `partAim.allowed`）× 必要時的站位（移動後能打到的格，AI-13/14：先粗篩距離與危險，再對前 N 個做尋路）生成 `Candidate = { move?: Cell; cmd: Command }`；加上 `Wait`、`End`、`Retreat`、`Eject`（hp 池極低且 Assignment 允許）。

**第 3 步・評分**：`score = Σ_tactic ability.ai.tactics[t] × want[t] × targetValue(t, target) × hitChance − cost(c) − danger(move)`。`targetValue`（AI-08 改造）：預估傷害用 `previewCommand` 在知識狀態上跑（不是真實狀態）、乘上目標價值（grade、威脅＝其能力權重總和、剩餘層數、是否 Assignment 目標、是否可收尾）；`disable` 看目標部位 `functions` 的價值表；`capture` 看捕捉條件接近度；`escape` 看危險圖（AI-18：由已知敵人射程與 ZoC 疊成的 heat map，接敵與撤退共用）。

SPEC-GAP 補（2026-10-26 lead-engine-next）：`support.ts` 共用現有預覽的 before／after，按實際增閃×可見威脅、層 HP 恢復及 inverted 池需求計算支援收益，扣施放成本；buff／protect／heal／escape 取最大分類係數，不重乘命中率。護衛指派只加目標優先係數；原地側閃可計防護收益。卸載主用途在低池量、沒有該池或沒有實際卸載時，不為附帶增閃計分。純攻擊增益保留舊公式，混合招取新收益與實際新增攻擊屬性的舊公式較大者；召喚等未識別作用保留舊分支。零收益純支援不得由 objectiveMove 救回；支援招成功後以 actor＋round 記憶防同招重放，refresh／ignore 無新增量不計分。tactical 最多額外保留 maxSupportMoves 個低成本合法支援格；sentinel／regroup／swarm 回防或回巢只插不移位支援，flee／scripted 維持原策略。

**第 4 步・選擇**（AI-03 改造＋TM-26）：候選依分數排序，取 `score >= topScore × band`（參數，預設 0.8）的前段，按分數加權抽一個；`berserk`／`scripted` 用 band=1（取最高）。無正分候選→`End`。

**第 5 步・執行**：走 `tryCommand`；被拒則把該候選剔除重選（最多 k 次）。

## 意圖宣告 telegraph（Into the Breach 式）

`SpeciesDef.behaviors.telegraph=true` 的單位在**上一回合結束**就選定下回合的 `Candidate` 並寫 `IntentDeclared` 事件（UI 顯示箭頭／目標格）；輪到它時若目標仍合法就照做，否則重選（並寫 `IntentChanged`）。玩家因此能「推開／擋住／誘導」。這是 Policy 的 `precommit` 可選鉤子，不是全局規則。

## 意圖兩層：陣營意圖、個體本能、指揮者（已實作，2026-10-24 lead-gaps-battle／lead-tune-battle）

裁示（design-notes mechanics 末三段）：每一方帶意圖、達不到就撤，取代平手；勝利不必全殲；意圖分陣營層（指揮者）與個體層（本能），怪獸指揮者稀少且低智。實作在 `src/ai/intent.ts`、`src/ai/retreat.ts`，門檻全在 `DEFAULTS`、可由 aiprofile `params` 覆寫（只收數字）。

**陣營意圖**取自：情境目標 → aiprofile `intent`（`params` 只收數字，代碼 0–8＝eliminate／hunt／guardNest／hold／escort／reachExit／killTarget／capture／survive）→ 族行為（spawner＝守巢、territorial＝奪點、其他＝獵食）→ 殲滅。每輪評估全部非 lose 目標：戰力比、損失、目標進度（killTarget／capture 只算目標 HP）、需要輪數（可見單位 HP 差 EMA）對剩餘輪數；`intentMinRound` 之後全部達不到才整隊撤（`intentGiveUpRatio`、`intentGiveUpLoss`、`intentImpossibleRatio`）。巢穴、蝕錨等不可移動者不撤。

**個體本能**：怪獸 HP < `individualFleeHp` 逃（已失控 `controlMode:"berserk"` 者不逃；「發狂」走承擔／失控規則）；駕駛重傷 `pilotFleeHp` 或士氣 breaking／fleeing 自退。

**指揮者**：人類 slot 取 resolve → 等級 → id 最高者；把重傷、缺資源、shaken 或帶負面效果的單位後撤 `rotateRounds` 輪（冷卻 `rotateCooldown`）。怪獸 slot 只有母體、蝕錨或 S 級以上才有，只下護巢集結與圍攻。指揮者陣亡 → 依 id 穩定分位潰散（怪獸 `commanderScatter` 0.6、人類 0.3），不耗 RNG。

**結算**（rules-battle-flow「勝負」）：對手 active 撤光且有人撤離＝擊退勝，`BattleEnd{reason:"repelled", detail:"repelled"}`；營運層照此回寫擊退／撤退。

**SPEC-GAP（實作暫定，規劃線日後定）**：地圖未宣告 `exits` 時四邊可撤；多方局擊退勝方取字典序第一個仍有 active 的敵對 slot；意圖用數字代碼。**未做**：tag 指定指揮者、補給／治療輪替、字串意圖欄。

## 範圍攻擊與友傷（AI-11 改造）

`attackArea` 的 targetValue＝Σ 敵方價值 − Σ 友方價值 × friendlyFirePenalty（profile 參數）；`berserk` profile 把 friendlyFirePenalty 設 0 且所有單位算敵方——「敵我不分」自然成立。

## 可插拔的落點

- 新 Policy＝一個 TS 模組實作 `Policy`＋在登記表加一列；內容包只引用 id。
- 權重全在資料：能力的 `ai.tactics`、profile 的 `want` 公式、`band`、`friendlyFirePenalty`、危險圖係數。
- 決定性：AI 只用 `ctx.rng`（seeded）；同狀態同 seed 同決策，重播可驗。

## 替使用者做掉的決定

1. **玩家與 AI 讀同一份 FactionKnowledge**：讓偵察部件對雙方都有價值，也省一套 UI 專用的迷霧邏輯。
2. **評分公式固定、權重與需求在資料**：不開腳本；想要「古怪 AI」就寫新 Policy。
3. **意圖宣告為族的可選行為**：裂獸可讀、人類機甲不透明，兩種手感並存。
4. **選招用「前段加權抽」而非最高分**：保留 BB 的不可完全預測，避免玩家背板；band 可調成 1。
5. **預估走 previewCommand 在知識狀態上跑**：AI 不作弊、估值與規則永遠一致，代價是 CPU；大地圖以候選上限 N 控制。

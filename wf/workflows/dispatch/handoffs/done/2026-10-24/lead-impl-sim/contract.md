# lead-impl-sim 契約：sim 模組介面＋三個整合缺口的裁定

[CLAIMS](../../../../CLAIMS.md)｜spec [architecture](../../../../../planning/specs/core/architecture.md)｜前線 [rules REPORT](../lead-impl-rules/REPORT.md)、[ai REPORT](../lead-impl-ai/REPORT.md)

領導 `lead-impl-sim` 凍結。工人照抄名稱與簽名；契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停。

## §0 已由領導先做（工人不可再改）

- `src/core/types-def.ts`：`ControlMode` 追加 `"instinct"`。`schemas/content.schema.json` 的 `ControlMode` enum 同步追加。

## §1 缺口裁定（給 `cx-sim-gaps`）

**(a) 本能控制**：
1. `makeUnit`：怪獸單位（`init.monster`）沒有座位人物時 `controlMode = "instinct"`；`handOver` 對 `rt.monsters[id]` 存在且無 pilot／soul 的單位給 `"instinct"`，其餘照舊（derelict 仍是 `"none"`，被捕獲後的單位不在 `rt.monsters`，照舊）。
2. `"instinct"` 視為**可下指令**：凡是把 `"none"`／`"disabled"` 當不可行動的地方（`turn.ts` beginTurn 自動 end、advance 的空轉防呆、`command.ts` 兩處 `no-commander`），`"instinct"` 都不算在內。指令權者 `commanderOf` 為 `null`。
3. 成本：`owner:"mech"` 照舊；`owner:"person"` 的成本在 instinct 單位改由**機體同名池**支付（沒有該池 → `cannot-pay`）。移動本來就在無指令權者時扣機體 `ap`。
4. 怪獸的 AP 是資料：`content/base/species/*.json` 每族加一個 `ap` 池（`min 0`、`capKind hard`、`inverted false`、`max = initial = regen`，值與人類駕駛員同量級，例 9；巢母可較低）。測試包 `pp-tidewolf` 同樣加。
5. 回合開始的 `regenTick` 要對機體 `ap` 生效（確認既有流程有跑機體池 regen；沒有就補）。

**(b) 常數與內容回 base**：把 `test/scenarios/pack/` 的這些搬進 `content/base/`、再**刪掉測試包裡的那份**：`rules/constants.json` 的 13 鍵（合併進 base 的 `rules/constants.json`）、`frames/infantry.json`、`bodyplans/infantry.json`、`effects/morale-{shaken,breaking,fleeing}.json`、`effects/berserk.json`、`terrains/plain.json`（base 已有一份，刪測試包的即可；兩份不同時以 base 為準）。`cb-*`、`pp-*` 留在測試包。之後 `test/ai/integration.test.ts` 只載入 `content/base`。黃金 hash 用 `GOLDEN_UPDATE=1` 重產，**重產前後各存一份事件日誌比對**，REPORT 寫明 diff 只來自哪些原因（id 前綴 `rtest:`→`base:`、怪獸開始行動、地形值差異……）。

**(c) `aiprofile/pack-hunter`**：改指向既有的 `"swarm"`（無母體時以最近同伴為錨、超出 leash 就靠攏，否則走 tactical——即「群聚狩獵」）。另加一個測試：base 所有 `aiprofile` 的 `policy` 都在 `policyIds()` 裡（防 `getPolicy` 靜默退回 tactical）。

## §2 sim 介面（給 `cx-sim-engine`；`src/sim/`）

依賴只准 core、content、rules（經 `src/rules/index.ts`）、ai（經 `src/ai/index.ts` 與 `src/ai/adapters/rules-adapter.ts`）。不碰 DOM。

```ts
// run.ts
export type PlayerSpec = { kind: "ai"; policy?: Id; params?: AiParams } | { kind: "script"; commands: Command[] };
export type SimSetup = { scenario: Id | null; setup: BattleSetup;
  slotProfiles: Record<FactionSlot, { policy: Id; params: AiParams }>;   // 情境 slot.ai → aiprofile；沒有就 tactical
  unitPolicies: Record<FactionSlot, Record<Id, Id>> };                     // 怪獸 species.aiProfile → policy
export function scenarioToSetup(db: ContentDB, scenario: Id | ScenarioDef, seed: number, opts?: { rounds?: number }): SimSetup;
export type RunOptions = { db: ContentDB; sim: SimSetup; seed: number;
  players?: Partial<Record<FactionSlot, PlayerSpec>>;                    // 預設每個 slot 都是 { kind: "ai" }
  maxSteps?: number };                                                    // 防呆，預設 10000 個指令
export type RunResult = { state: BattleState; commands: Command[]; rejected: number;
  stopped: "outcome" | "stalled" | "maxSteps"; result: BattleResult | null; hash: string };
export function runBattle(opts: RunOptions): RunResult;
// replay.ts
export class ReplayError extends Error { index: number; command: Command; code: string }
export function replay(db: ContentDB, setup: BattleSetup, seed: number, commands: Command[]): BattleState;   // 任一指令被拒 → ReplayError
export function verifyReplay(db: ContentDB, run: { setup: BattleSetup; seed: number; commands: Command[]; hash: string }): { ok: boolean; hash: string };
export function rerunAiAndCompare(opts: RunOptions, expected: Command[]): { ok: boolean; firstDiff: number | null };
// save.ts
export type SaveFile = { version: 1; contentPacks: { id: string; version: string; hash: string }[]; scenario: Id | null; seed: number;
  commands: Command[]; setup?: BattleSetup; snapshot?: BattleState; campaignBlob?: unknown };
export function packHash(db: ContentDB, packId: string): string;          // fnv1a64(canonicalJson(該 pack 的全部 def＋規則表)) 的 16 hex
export function createSave(db: ContentDB, a: { scenario: Id | null; seed: number; commands: Command[]; setup?: BattleSetup; snapshot?: BattleState; campaignBlob?: unknown }): SaveFile;
export function serializeSave(save: SaveFile): string;
export function parseSave(text: string): SaveFile;                         // 形狀或 version 不合 → 丟 Error
export function loadSave(db: ContentDB, save: SaveFile, opts?: { verifySnapshot?: boolean }): { state: BattleState; warnings: string[] };
// cli.ts
export function main(argv: string[], out?: (line: string) => void): number;  // 回傳 exit code；檔尾 `if (import.meta.main) process.exit(main(process.argv.slice(2)))` 或等價
```

- `scenarioToSetup`：`MapDef.cells`（字串或 `{rle}`）＋`legend` → `BattleSetup.map.cells`；`features` 照放；`deployZones[slot]` 依 seed 決定性地分配 `at:"zone"`（zone 格不夠 → 丟 Error）；單位 id 決定性生成（例 `player-0`、`enemy-3`）；同一 PersonDef 被多台引用時人物實例 id 用 `<unitId>-<seat>`（SPEC-GAP，content-base REPORT 第 3 條）；`monster` 欄 → `MonsterDef` → `{species, grade}`；`rounds` 選項覆蓋 `ScenarioDef.rounds`。
- `runBattle`：照 [ai REPORT](../lead-impl-ai/REPORT.md)「sim 的接法」與 `test/ai/integration.test.ts` 的迴圈；每輪開始呼叫各 AI 的 `startRound`；其他陣營 `observeEvents`；`commands` 只收成功的指令（含 script 的）；某單位回合 AI 沒推進 → `stopped:"stalled"`。`result` 用 rules 的 `battleResult`（outcome 為 null 時 `null`）。`hash` = `hashLog(state.log)`。
- 重播一致性：`replay(setup, seed, runBattle 的 commands)` 的 `hashLog` 必等於 `RunResult.hash`。
- 存檔：`snapshot` 的 `Infinity`（池 max）等 JSON 不可表示值要能來回（SPEC-GAP，自選編碼並寫明）。內容包 hash 不符 → 有 snapshot 就以 snapshot 載入並在 `warnings` 記一行；沒有就丟 Error。
- CLI：`npm run sim -- --scenario <id> --seed <n> [--ai-vs-ai] [--rounds 50] [--out log.json] [--save save.json] [--load save.json] [--packs content/base,…]`；印勝負、輪數、各陣營存活數、事件型別計數、日誌 hash。`--out` 寫事件日誌 JSON。預設 packs 為 `content/base`。

# 任務：實作內容層（loader／registry／schema／contentdb）、手寫 JSON Schema，並把 base 內容包落成可零錯誤載入的真檔

> 領導 `lead-impl-foundation` 寫給 codex 工人 `cx-content`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀凍結契約 `src/core/ids.ts`、`src/core/types-def.ts`（**不可修改**；所有 Def 的欄位、必填／選填以它為準），以及 spec `wf/workflows/planning/specs/core/content-format.md`（整份）、`data-model-mech.md`、`data-model-people.md`、`data-model-world.md`、`data-model-abilities-effects.md`——親自讀。

## 背景與唯一目標

專案是純 TypeScript 網頁 SRPG，**node 24 原生執行 `.ts`（type stripping）**，沒有 tsc、沒有 ajv、沒有任何套件。只用可被擦除的 TS 語法：不用 `enum`、`namespace`、建構子參數屬性；相對 import 帶 `.ts`；型別匯入用 `import type`；JSON 用 `import x from "…json" with { type: "json" }`。唯一目標：`npm run check`（＝`node src/content/loader.ts content/base`）把 `content/base/` 全部檔案載入且**零錯誤**，並印出每類件數。

**不准 import** `src/core/rng.ts`、`numexpr.ts`、`eventlog.ts`（另一個工人正在並行寫）；只准 import `src/core/ids.ts` 與 `src/core/types-def.ts`。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建下列 **41** 個檔，一個不多）：
  - `src/content/registry.ts`、`src/content/schema.ts`、`src/content/contentdb.ts`、`src/content/loader.ts`、`src/content/content.test.ts`（5）
  - `schemas/content.schema.json`（1；**手寫**一份，`$defs` 內每種 kind 一個定義，不寫產生腳本）
  - `content/base/pack.json`（1）
  - `content/base/registries/` 下 7 檔：`attrs.json`、`layer-types.json`、`damage-types.json`、`part-functions.json`、`slot-types.json`、`locomotion.json`、`tactics.json`
  - `content/base/rules/` 下 4 檔：`constants.json`、`damage-modifiers.json`、`morale-events.json`、`injuries.json`
  - `content/base/frames/`：`hound-mk2.json`、`bio-tidewolf.json`
  - `content/base/bodyplans/`：`biped-light.json`、`quadruped-beast.json`
  - `content/base/components/`：`autocannon-30.json`
  - `content/base/abilities/`：`burst-30.json`、`bite.json`、`pounce.json`、`restrain.json`
  - `content/base/effects/`：`overheat-1.json`、`overheat-2.json`、`weapon-jammed.json`、`trait-vengeful.json`、`dead.json`、`acid-corrode.json`、`injury-concussion.json`
  - `content/base/persons/`：`ren-kasai.json`、`unit-07.json`（`kind:"soul"` 的機魂）
  - `content/base/soultrees/standard.json`、`content/base/curves/bb-default.json`、`content/base/aiprofiles/pack-hunter.json`
  - `content/base/terrains/acid-marsh.json`、`content/base/species/tidewolf.json`
  - 外加你的 REPORT（見交付）。
- 不做：改 `src/core/`、`package.json`、`tsconfig.json`；寫 maps／factions／monsters／scenarios／loot 資料；寫 rules／ai／sim／ui 任何程式；`scripts/` 不建檔；碰 `legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；安裝套件；碰 DOM。
- 件數 gate：新檔超過 42 個（41＋REPORT）就停下回報；容量 gate：`content/base/` 超過 200 KB 或 `src/content/` 超過 120 KB 就停下回報。任一觸發都停。

## 內容規格（寫死）

- **五個範例**（`frames/hound-mk2`、`components/autocannon-30`、`persons/ren-kasai`、`terrains/acid-marsh`、`species/tidewolf`）的內容**逐字照** `content-format.md` 的「五個最小範例」，只准有排版差異；schema 必須原樣接受它們（`types-def.ts` 已把範例省略的欄位設為選填）。
- 其他檔是讓這五個範例的每個 id 參照都存在、且符合 `types-def.ts` 的最小資料：`bio-tidewolf` 是 `cls:"bio"`、`bodyPlan:"bodyplan/quadruped-beast"`、必填 `burden`；`quadruped-beast` 的 `core` 功能部位要有 `structural:true` 的 `organ` 層，並有 `restraint` 與 `cockpit` 槽；`biped-light` 至少 4 部位（含 `cockpit` 功能且有 `seats` 的部位）；每個能力的 `ai.tactics` 至少一個鍵；`unit-07` 的 `growth` 是 `SoulGrowth`、`tree:"soultree/standard"`（`nodes` 可為空陣列）。效果只准用上列 7 個 id；bodyplan 的 `onBroken`／`onLayerBroken`／`conduct` 若要掛效果，只能引用這 7 個。
- **registries**：每檔形狀 `RegistryFile`（`{ "kind": "{檔名不含 .json}", "entries": [...] }`）。`attrs` 至少含 `accuracy, evasion, resolve, initiative, perception, control` 六項且各帶同名 `role`；其餘登記檔必須涵蓋所有內容檔實際用到的值（例：`locomotion` 含 `leg, track, hover, flight, burrow`；`slot-types` 含 `weaponMount, restraint, cockpit`；`tactics` 至少含 `attack, attackArea, disable, heal, buff, debuff, escape, protect, capture, scout`）。
- **rules**：`constants.json` 形狀 `RulesConstants`，至少 `hitChanceMin:5, hitChanceMax:95, critFactor, permanentThreshold, permanentChance, conventionalFactor:0.1`；`damage-modifiers.json` 至少一列 `{ "sourceTag":"conventional-arms","targetTag":"kaiju","factor":0.1 }`；`morale-events.json` 至少 3 列（含友軍陣亡、部位毀損）；`injuries.json` 至少 1 列引用 `effect/injury-concussion`。
- **pack.json**：`{ "id":"base", "version":"0.1.0", "depends":[] }`。

## 匯出介面（寫死，名稱與簽名照抄）

```ts
// src/content/registry.ts
import type { RegistryKind, RegistryEntry, RegistryFile, AttrRole } from "../core/types-def.ts";
export type Registries = { [K in RegistryKind]: Record<string, RegistryEntry> };
export function emptyRegistries(): Registries;
export function mergeRegistry(regs: Registries, file: RegistryFile): void;   // 後到覆寫同 id
export function hasEntry(regs: Registries, kind: RegistryKind, id: string): boolean;
export function attrByRole(regs: Registries, role: AttrRole): string | undefined;

// src/content/schema.ts —— JSON Schema 子集驗證器，讀 schemas/content.schema.json
export type SchemaError = { path: string; message: string };
export type SchemaName = ContentKind | "pack" | "registry" | "rules-constants" | "rules-damage-modifiers" | "rules-morale-events" | "rules-injuries";
export const CONTENT_SCHEMA: Record<string, unknown>;
export function validateAgainst(name: SchemaName, value: unknown): SchemaError[];
// 支援關鍵字（只這些）：type（字串或陣列）、required、properties、additionalProperties（布林或 schema）、
// items、enum、const、minimum、maximum、minItems、oneOf、anyOf、$ref（只 "#/$defs/…"）。
// 物件型 $defs 一律 additionalProperties:false。NumExpr、Cond、EffectRef、PoolDecl 等共用片段放 $defs。

// src/content/contentdb.ts
import type { ContentKind, Id } from "../core/ids.ts";
import type { DefByKind, PackDef, DamageModifierRow, MoraleEventRow, InjuryRow } from "../core/types-def.ts";
export type RulesTables = { constants: Record<string, number>; damageModifiers: DamageModifierRow[]; moraleEvents: MoraleEventRow[]; injuries: InjuryRow[] };
export type ContentDB = {
  readonly packs: readonly PackDef[]; readonly registries: Registries; readonly rules: RulesTables;
  get<K extends ContentKind>(kind: K, id: Id): DefByKind[K] | undefined;   // id 可省 pack 前綴：未帶前綴時依 packs 載入順序由後往前，找第一個存在的完整 id
  require<K extends ContentKind>(kind: K, id: Id): DefByKind[K];          // 找不到丟 Error
  all<K extends ContentKind>(kind: K): DefByKind[K][];                    // 依完整 id 排序
  ids(kind: ContentKind): Id[];                                           // 排序
  counts(): Record<ContentKind, number>;
};
export function createContentDB(packs: PackDef[], registries: Registries, rules: RulesTables,
  defs: { [K in ContentKind]?: Record<Id, DefByKind[K]> }): ContentDB;   // 回傳物件與其下資料深凍結

// src/content/loader.ts
export type LoadIssue = { file: string; path: string; message: string };
export type PackFiles = { root: string; files: Record<string, unknown> };  // 鍵＝相對 pack 根的 posix 路徑；值＝已 parse 的 JSON
export type LoadResult = { db: ContentDB; errors: LoadIssue[]; warnings: LoadIssue[] };
export function readPackDir(dir: string): PackFiles & { errors: LoadIssue[] };   // 只此函式用 node:fs／node:path；JSON parse 失敗記 error
export function loadPacks(packs: PackFiles[]): LoadResult;                        // 純函式，不碰 fs
export function loadContentDirs(dirs: string[]): LoadResult;
// CLI：if (import.meta.main) —— 參數為 pack 目錄（預設 content/base）
```

loader 行為（寫死）：
1. 每個 pack 必須有 `pack.json`（schema `pack`）；依 `depends` 拓撲排序，平手依 pack id 字典序；缺依賴或循環＝error。
2. `registries/{kind}.json` 驗 schema `registry` 且 `kind` 欄＝檔名；`rules/{name}.json` 驗對應 `rules-*` schema。
3. 內容檔：路徑必須是 `{KIND_FOLDERS 的資料夾}/{name}.json`；檔內 `id` 解析後 kind 要對上資料夾、name 要等於檔名，否則 error；驗對應 kind 的 schema。
4. **id 正規化**：內容檔裡每個字串值（含陣列元素、物件值，以及物件鍵）若 `parseId` 成功、kind ∈ `CONTENT_KINDS` 且沒有 pack 前綴，補上本 pack 前綴（`qualifyId`）。DB 一律以完整 id 為鍵、Def 內的 id 參照也是完整 id。
5. 後載入 pack 的同 id 覆寫前者，並記一筆 warning。
6. 合併後的檢查（每個違規一筆 error，`path` 用 `$.a.b[0]` 寫法）：
   - **參照存在**：每個正規化後的完整 content id 字串都必須在 DB 對應 kind 存在。
   - **登記值**：`attrs` 的鍵（PersonDef.attrs、FrameDef.baseAttrs、SpeciesDef.baseAttrsByGrade 各等級）∈ attrs；`LayerDef.type`、`ConductRule.layer`、`DamagePacket.layerFilter`、`InjuryRow.layerTypes` ∈ layer-types（`component` 型別層要登記）；`DamagePacket.type`、`resist`／`passThrough` 的鍵、`InjuryRow.damageTypes` ∈ damage-types；`PartDef.functions`、`capture.requireIntact/requireBroken` ∈ part-functions；`SlotDecl.type`、`ComponentDef.slot` ∈ slot-types；`TerrainDef.moveCost` 的鍵 ∈ locomotion（缺鍵允許，視為 null）；`AiHints.tactics` 的鍵 ∈ tactics。
   - **NumExpr 根**：任何物件若有字串 `ref` 鍵，其第一段必須 ∈ `self, target, part, layer, battle`（內容檔**不准** `rng`）。
   - **池已宣告**：能力的 `costs`／`produces`／`sustain` 的 `pool`、`ammoPool`、HookAction `pool` 動作的 `pool`、`LayerDef.regenPool`、`poolMods[].pool` 都必須出現在某個 FrameDef／ComponentDef／PersonDef／SpeciesDef 的 `pools[].id`。
7. CLI 輸出（寫死格式，一行一項，依 `CONTENT_KINDS` 順序只印件數 > 0 的 kind）：`pack base 0.1.0`、`frame: 2`、`component: 1`…、`person: 2 (human 1, soul 1)`、`registries: 7/7`、`rules: 4/4`、最後一行 `OK 0 errors, {n} warnings`；有 error 時逐筆印 `ERROR {file} {path} {message}`、最後一行 `FAIL {n} errors` 並 `process.exitCode = 1`。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

`src/content/content.test.ts` 恰好 **10** 個 `test()`：(1) `loadContentDirs(["content/base"])` 零 error；(2) counts：frame 2、component 1、person 2、terrain 1、species 1；(3) DB 內 Def 的參照是完整 id（例：`require("frame","base:frame/hound-mk2").bodyPlan === "base:bodyplan/biped-light"`）；以下用 `loadPacks` 餵記憶體內合成 pack：(4) 懸空參照報 error；(5) 未登記的層種類報 error；(6) 檔名與 id 不符報 error；(7) `ref` 用 `rng` 根報 error；(8) 能力成本引用未宣告的池報 error；(9) 第二個 pack 覆寫同 id 產生 warning 且取後者；(10) `validateAgainst` 抓到缺必填欄與多餘欄。測試裡的路徑以專案根為 cwd（`npm test` 從專案根跑）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一步跑一次 `wf/tools/inbox_poll.sh cx-content --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 終局回報（正文給你的 REPORT 檔） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 41 個檔與你的 REPORT；可跑 `node`、`node --test`、`npm run check`；可 commit（見下）。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；**不 push、不建分支、不 rebase／reset 別人的 commit**；commit 只加明確路徑（逐檔列出），禁 `git add -A`／目錄級 add，訊息開頭 `foundation: `；不 `rm -rf`（暫存搬 `/tmp/cx-content-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 無法執行 `.ts` 或 JSON import、沙箱拒寫 → 停下發 `BLOCKED`；你自己的程式、資料或測試錯 → 自己修，不算阻塞。凍結契約檔若讓你寫不下去，不要改它，在程式碼註解標 `SPEC-GAP` 選最小解法並寫進 REPORT。

## 工作

1. 寫 `registry.ts`、`schema.ts`、`schemas/content.schema.json`、`contentdb.ts`、`loader.ts`；`inbox_poll --once`。
2. 落 `content/base/` 34 個資料檔；`npm run check` 到零錯誤；`inbox_poll --once`。
3. 寫 `content.test.ts`，`node --test --test-reporter=tap src/content/content.test.ts` 綠。
4. 41 個檔 commit（訊息 `foundation: content 載入器、schema 與 base 內容包`）。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-content/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容層程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/content/` |
| schema | `/home/lorkhan/repo/game_dev/mecha-srpg/schemas/content.schema.json` |
| base 內容包 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-content/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事；SPEC-GAP 逐條列在「需要決定的事」），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `npm run check` exit 0，輸出含 `frame: 2`、`component: 1`、`person: 2 (human 1, soul 1)`、`terrain: 1`、`species: 1`、`registries: 7/7`、`rules: 4/4`、`OK 0 errors`。
2. `node --test --test-reporter=tap src/content/content.test.ts` exit 0，輸出 `# pass 10`、`# fail 0`。
3. `git log --oneline` 有一筆 `foundation: ` 開頭、只含這 41 個檔的 commit；`git status --short src/content schemas content` 為空。
4. REPORT 存在且有四段。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 不 commit 壞的檔，發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-content`。本線團隊：`teams/foundation`。上線先發 `wf/tools/inbox_mail.sh cx-content --up PROGRESS 'cx-content 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-content --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-content/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

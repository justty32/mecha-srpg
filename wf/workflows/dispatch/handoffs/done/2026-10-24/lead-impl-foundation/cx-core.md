# 任務：實作 core 的 PCG32 RNG、NumExpr 求值器與事件日誌，並寫三支測試

> 領導 `lead-impl-foundation` 寫給 codex 工人 `cx-core`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀已凍結的契約檔 `src/core/ids.ts`、`src/core/types-def.ts`、`src/core/types-state.ts`、`src/core/events.ts`（**不可修改**），以及 spec `wf/workflows/planning/specs/core/architecture.md`（§決定性與重播）與 `data-model-abilities-effects.md`（§NumExpr）——親自讀。

## 背景與唯一目標

專案是純 TypeScript 網頁 SRPG，**node 24 原生執行 `.ts`（type stripping）**，沒有 tsc、沒有任何套件。只用可被擦除的 TS 語法：不用 `enum`、`namespace`、建構子參數屬性；相對 import 一律帶 `.ts` 副檔名；只匯入型別時用 `import type`。唯一目標：交出 `src/core/rng.ts`、`src/core/numexpr.ts`、`src/core/eventlog.ts` 三個檔與三支測試，介面**完全照下方「匯出介面」**（其他線已依此寫程式）。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該改」的寫進 REPORT 的「需要決定的事」。

- 只做（新建這 6 個檔，一個不多）：`src/core/rng.ts`、`src/core/rng.test.ts`、`src/core/numexpr.ts`、`src/core/numexpr.test.ts`、`src/core/eventlog.ts`、`src/core/eventlog.test.ts`；外加你的 REPORT（見交付）。
- 不做：改 `src/core/` 其他檔（ids／types-def／types-state／events 是凍結契約）；碰 `src/content/`、`schemas/`、`content/`、`package.json`、`tsconfig.json`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；安裝任何套件；新增匯出介面表以外的公開函式（內部 helper 不匯出即可）。
- 件數 gate：新檔超過 7 個（6 個程式檔＋REPORT）就停下回報；容量 gate：6 個程式檔合計超過 60 KB 就停下回報。任一觸發都停。

## 匯出介面（寫死，名稱與簽名照抄）

```ts
// src/core/rng.ts —— PCG32（pcg32_srandom_r／pcg32_random_r，XSH-RR，multiplier 6364136223846793005）
import type { RngState } from "./types-state.ts";   // { state: string; inc: string }，各為 16 位小寫 hex（不足補 0）
export function createRng(seed: number, stream?: number): RngState;  // stream 預設 54；seed、stream 為 0..2^53 的非負整數，否則丟 RangeError
export function nextU32(rng: RngState): number;     // 就地推進 rng，回傳 uint32
export function nextFloat(rng: RngState): number;   // [0,1) = nextU32 / 2^32
export function nextInt(rng: RngState, n: number): number;          // [0,n) 無偏（pcg32_boundedrand_r 的拒絕法）；n 為 1..2^32 整數否則 RangeError
export function rollInt(rng: RngState, lo: number, hi: number): number;  // [lo,hi] 含兩端
export function d100(rng: RngState): number;        // 0..99（= nextInt(rng,100)）；命中判定為 d100 < hitChance
export function chance(rng: RngState, p: number): boolean;          // nextFloat < p
export function pickWeighted<T>(rng: RngState, items: readonly T[], weight: (t: T) => number): T; // 總權重 <= 0 丟 RangeError
export function cloneRng(rng: RngState): RngState;

// src/core/numexpr.ts
import type { NumExpr, Cond } from "./types-def.ts";
export const REF_ROOTS: readonly string[];          // ["self","target","part","layer","battle","rng"]
export type EvalCtx = { ref(path: string): number; hasTag?(tag: string): boolean };
export class NumExprError extends Error {}
export function evalNum(expr: NumExpr, ctx: EvalCtx): number;
export function evalCond(cond: Cond, ctx: EvalCtx): boolean;
export function objectRefs(roots: Record<string, unknown>): (path: string) => number;
export function collectRefs(x: NumExpr | Cond): string[];           // 排序去重的 ref 路徑
export function checkNumExpr(x: unknown, at?: string): string[];    // 結構錯誤清單，每筆 "<at>: <訊息>"；空陣列＝合法
export function checkCond(x: unknown, at?: string): string[];

// src/core/eventlog.ts
import type { EventLog, GameEvent, EventType, EventPayload } from "./events.ts";
export function createLog(): EventLog;              // { events: [] }
export function appendEvent(log: EventLog, e: { round: number; type: EventType; payload?: EventPayload; turn?: string }): GameEvent;
export function canonicalJson(v: unknown): string;
export function fnv1a64(s: string): string;
export function hashLog(log: EventLog): string;     // fnv1a64(canonicalJson(log.events))
export function eventsOfType(log: EventLog, type: EventType): GameEvent[];
export function typeSequence(log: EventLog): string[];
```

語意細則（寫死）：
- **PCG32**：初始化照 pcg-c-basic 的 `pcg32_srandom_r(initstate=seed, initseq=stream)`：`state=0; inc=(stream<<1)|1; step; state+=seed; step`；運算用 BigInt、mod 2^64。
- **evalNum**：數字原樣回傳；`ref` → `v=ctx.ref(path)`，`v=v*(mul??1)+(add??0)`，再依 `min`／`max` 夾；`sum` 空＝0、`product` 空＝1；`pick` 依 `evalCond(if)` 取 then／else。結果非有限數丟 `NumExprError`。
- **evalCond**：物件內出現的鍵（tag／not／all／any／cmp）全部要成立（AND）；空物件＝true；`all` 空＝true、`any` 空＝false；有 `tag` 但 ctx 沒 `hasTag` 丟 `NumExprError`。
- **objectRefs**：以 `.` 切路徑走巢狀物件；第一段必須是 `roots` 的鍵；最終值必須是有限數字，否則丟 `NumExprError`（訊息含路徑）。
- **checkNumExpr／checkCond**：物件必須恰好有一個形狀鍵（`ref`／`sum`／`product`／`pick`）；`ref` 要是字串且第一段 ∈ `REF_ROOTS`；`mul/add/min/max` 要是有限數字；有未知鍵也算錯；遞迴檢查子式；`at` 預設 `"$"`，子路徑用 `$.sum[0]` 這種寫法。
- **appendEvent**：`seq = log.events.length`；payload 預設 `{}`；值只准字串、有限數字、布林、null、或由字串／有限數字組成的扁平陣列，否則丟 `TypeError`；存入的是複本（陣列也複製）；`turn` 未給就不放這個鍵。
- **canonicalJson**：物件鍵依 UTF-16 字典序排序、遞迴；值為 `undefined` 的鍵略過；無空白；非有限數字丟 `TypeError`。
- **fnv1a64**：對 UTF-8 位元組（`TextEncoder`）做 FNV-1a 64（offset `cbf29ce484222325`、prime `100000001b3`），回傳 16 位小寫 hex。**不得用 `node:crypto`**（core 要能在瀏覽器跑）。

## 測試（寫死條數與期望值；用 `node:test` 與 `node:assert/strict`）

- `rng.test.ts` 恰好 **8** 個 `test()`，其中必含：`createRng(42, 54)` 前 6 個 `nextU32` 依序為 `0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e`；`createRng(12345)` 前 5 個為 `4127262169, 3468701408, 2272573525, 4086873097, 895617009`；`RngState` 經 `JSON.parse(JSON.stringify())` 後接續輸出不變；`d100` 1000 次全落在 0..99。
- `numexpr.test.ts` 恰好 **12** 個 `test()`：涵蓋數字、ref＋mul/add/min/max、sum／product（含空陣列）、pick、cmp 五種運算子、tag、not／all／any、objectRefs 缺路徑丟錯、collectRefs、checkNumExpr 抓壞根與未知鍵。
- `eventlog.test.ts` 恰好 **8** 個 `test()`，其中必含：fnv1a64(`""`)＝`cbf29ce484222325`、fnv1a64(`"a"`)＝`af63dc4c8601ec8c`；canonicalJson 鍵序無關；appendEvent seq 連續且拒絕巢狀物件 payload；**決定性**：一個以 seed 驅動的小函式（`createRng(seed)` 後連續 20 次 `appendEvent(log,{round:1+⌊i/5⌋,type:"Hit",payload:{roll:d100(rng)}})`）對 seed 7 跑兩次 `hashLog` 相同、對 seed 7 與 8 不同。

跑法：專案根 `node --test --test-reporter=tap 'src/core/*.test.ts'`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一個檔跑一次 `wf/tools/inbox_poll.sh cx-core --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 終局回報（正文給你的 REPORT 檔） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 6 個檔與你的 REPORT；可跑 `node`、`node --test`；可 commit（見下）。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；**不 push、不建分支、不 rebase／reset 別人的 commit**；commit 只加明確路徑（`git add src/core/rng.ts …` 逐檔列），禁 `git add -A`／目錄級 add，commit 訊息開頭 `foundation: `；不 `rm -rf`（暫存搬 `/tmp/cx-core-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**（`npm install` 等一律禁）；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 無法執行 `.ts`、沙箱拒寫 → 停下發 `BLOCKED`；你自己的程式或測試錯 → 自己修，不算阻塞。若凍結契約檔有讓你寫不下去的問題，不要改它，發 `BLOCKED` 說明。

## 工作

1. 寫 `rng.ts`＋`rng.test.ts`，跑綠；`inbox_poll --once`。
2. 寫 `numexpr.ts`＋`numexpr.test.ts`，跑綠；`inbox_poll --once`。
3. 寫 `eventlog.ts`＋`eventlog.test.ts`，跑綠。
4. 6 個檔一次 commit（訊息 `foundation: core rng／numexpr／eventlog＋測試`）。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-core/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/core/{rng,numexpr,eventlog}.ts` 與同名 `.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-core/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `node --test --test-reporter=tap 'src/core/*.test.ts'` exit 0，輸出 `# pass 28`、`# fail 0`。
2. 六個檔存在，且三個實作檔的匯出名與「匯出介面」完全一致（不多不少）。
3. `git log --oneline` 有一筆 `foundation: ` 開頭、只含這 6 個檔的 commit；`git status --short src/core` 為空。
4. REPORT 存在且有四段。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 不 commit 壞的檔，發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-core`。本線團隊：`teams/foundation`。上線先發 `wf/tools/inbox_mail.sh cx-core --up PROGRESS 'cx-core 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-core --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-core/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

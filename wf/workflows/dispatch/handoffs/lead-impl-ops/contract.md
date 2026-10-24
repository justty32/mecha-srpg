# lead-impl-ops 契約：`src/ops/` 的佈局、慣例與跨工人介面

[CLAIMS](../../CLAIMS.md)｜spec [ops README](../../../planning/specs/ops/README.md)、[architecture-ops](../../../planning/specs/ops/architecture-ops.md)｜切線來源 [plan-ops-spec REPORT](../plan-ops-spec/REPORT.md) 第六節

領導 `lead-impl-ops` 凍結。工人照抄名稱與簽名；契約或 spec 有洞 → 註解 `SPEC-GAP`＋最小解＋寫進自己的 REPORT，不要停。

## §0 已由領導先做（工人不可再改）

- `src/content/loader.ts`：`loadPacks` 略過 `world/` 開頭的檔（core 載入器不認 ops 內容；`readPackDir` 仍會讀，壞 JSON 照樣報錯）。

## §1 佈局（全部在 `src/ops/`；測試同目錄 `*.test.ts`，`npm test` 的 glob 已涵蓋）

| 子資料夾 | 檔 | 階段／工人 |
|---|---|---|
| `state/` | `types.ts`（CampaignState、CampaignEvent、OpsCommand、所有 Def／State 型別）、`ledger.ts`、`events.ts`、`clock.ts`、`ids.ts` | 1 `cx-ops-foundation` |
| `content/` | `load.ts`（讀 `<pack>/world/`）、`worlddb.ts`、`check.ts`（交叉驗證＋CLI）、`cond.ts`（ops Cond／NumExpr 求值脈絡）、`opseffect.ts`、`instantiate.ts`（MechState／PersonState 工廠）、`start.ts`（開局→CampaignState） | 1 |
| `world/`、`contracts/` | 節點、裂縫、潮壓、行動牌、市場、航行；契約、談判、計功 | 2 |
| `crew/` | 名冊、薪水、招募、醫務、佇列、機庫、獸欄、科研、練熟、命名 | 2 |
| `text/` | parse、render(Screen)、模板 | 2 |
| `time/`、`sortie/`、`sim/` | tick 八段、出戰三步、runCampaign／policy／重播／存檔／CLI | 3 |
| `index.ts` | 對外門面（階段 3 補齊） | 3 |

內容：`content/base/world/` 照 [content-format-ops](../../../planning/specs/ops/content-format-ops.md) 佈局。黃金戰役放 `src/ops/sim/fixtures/`（`test/` 是 sim 線領地，ops 不寫）。

## §2 依賴

`ops/*` 可 import `src/core/**`、`src/content/**`（ContentDB、loader）。`ops/sortie` 與 `ops/sim` 另可 import `src/sim/index.ts`。**不得 import `src/rules/`、`src/ai/`**（spec 鐵律）。ops 模組間依賴照 architecture-ops 表，只能往下。不碰 DOM、不加依賴。

## §3 慣例（所有 ops 工人共用）

1. **狀態**：`CampaignState` 純資料（可 `structuredClone`、可 JSON 化；不放 Map／Set／函式；`Infinity` 不准出現）。
2. **步驟函式形狀**：`(s: CampaignState, ctx: OpsCtx, ...input) => void`，**就地改 `s`**、事件經 `ctx.emit`。只有最外層（`applyCommand`、`tick`、`runCampaign`）負責 `structuredClone` 入參。`OpsCtx = { db: ContentDB; world: WorldDB; emit(type: string, payload?: Record<string, unknown>): CampaignEvent }`（foundation 定案，可加欄不可改名）。
3. **錢與存量只經 `post(s, ctx, entry)`**（`ledger.ts`）；任何地方直接寫 `s.ledger.balances` 都算 bug。`stock:*` 會變負 → `post` 回傳 `false` 且不記帳。
4. **隨機只用 `s.rng`**（core `src/core/rng.ts` 的 PCG32）；迭代記錄時一律按 id 字典序（`Object.keys(...).sort()`）。
5. **執行期實體 id**（雇來的人、機甲實例、契約實例、job）由 `ids.ts` 的 `nextId(s, prefix)` 決定性產生（例 `mech-3`、`contract-12`）。
6. **事件** payload 只放 id 與數字（文字由 `ops/text` 組）；事件型別名照 architecture-ops「事件類型」。
7. **內容 id**：ops 內容沿用 `pack:kind/name`，載入時補 pack 前綴；kind＝資料夾名的單數（`nodes`→`node`、`routes`→`route`、`recruit-pools`→`recruit`、`campaign-start`→`start`……foundation 在 `load.ts` 定一張表）。引用 core 內容（frame、person、species、monster、terrain、faction、effect）時必須存在於 core `ContentDB`。
8. 數值不寫死在程式：走 `content/base/world/` 的 JSON；程式內只准有 spec 寫死的結構常數（八段順序、狀態機轉移）。
9. 註解繁中、識別字英文、檔名 kebab-case；改不了 core 的地方標 `SPEC-GAP`。

## §4 已知繞法（不改 core，照做）

- `UnitSpawn.effects?` 不存在 → 注入改以 `PersonState.effects` 預掛（battle-interface 差異 1）。
- role `craft` 不存在 → `attrs.json` 的 tag／id `craft` 自查；找不到就用工人 `employment.role === "technician"` 每人固定工時（數值進 `world/jobs/`）。
- 修理係數放 ops 自己的 `world/jobs/repair.json`（不動 `registries/layer-types.json`）。
- `controlMode:"none"` 本能控制：sim 線已在 rules 補 `instinct`；ops 的無座位獸出戰測試在它進 main 前標 `todo`。
- core 的 `makeUnit`／`makePerson` 在 rules 裡、ops 不能 import → `content/instantiate.ts` 照其形狀寫一份最小工廠（`SPEC-GAP`）。
- 戰前部位損傷帶不進 `BattleSetup`（`UnitInit` 無 parts 覆寫）→ 階段 3 決定；先記 `SPEC-GAP`。

## §5 階段 2 對階段 3 的交付形狀（world／contracts／crew／text 工人共用）

- **tick 段函式**：每個模組匯出它負責的 tick 段，形狀 `(s, ctx) => void`，**只做該段裡屬於自己的那部分**；`ops/time/tick.ts`（階段 3）按 time-and-tick 八段順序呼叫它們。命名：`<模組>Daily<段號>`，例 `worldDaily2`、`travelDaily3`、`shipDaily5`、`ledgerDaily6`、`contractsDaily7`、`marketsDaily7`。
- **指令處理**：每個動詞一個 `cmd<Verb>(s, ctx, cmd): CmdResult`，`CmdResult = { ok: true } | { ok: false; error: string }`（error 為機器可讀代碼，例 `no-route`、`not-docked`）；被拒時 `s` 不得有任何改動（先驗後改）。動詞歸屬：world＝`map sail dock drift trade explore board accept drop`；crew＝`assign queue reorder feed accompany hire fire wake pay`；text＝`look talk go help choose`（`choose` 只解析，處理在階段 3）；`wait save load sortie` 歸階段 3。
- **大潮之夜、待選事件**：需要玩家選擇時把 `Prompt` 推進 `s.pendingChoices`（形狀見 foundation 的 types），不要自己等。

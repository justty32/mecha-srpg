# 任務：讓 MonsterDef 的 partsOverride／attrMods／extraAbilities 在戰場生效，補機魂等級欄、獸緣殼緣屬性，並修 ISS-023

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-engine`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。spec：`wf/workflows/planning/specs/core/data-model-world.md`（SpeciesDef／MonsterDef）、`data-model-people.md`（機魂）、`rules-resources-effects.md`（池、soft／hard、bands）。REPORT：`wf/workflows/dispatch/handoffs/lead-content-monster/REPORT.md`（partsOverride、BattleResult 缺 monster id）、`lead-content-ancient/REPORT.md`（機魂等級、獸緣／殼緣）、`plan-spec-integrate/REPORT.md` 的提案 (a)（`registries/attrs.json` 加 `beastKin`／`shellKin`，0–100，core 只在 NumExpr 引用）、`lead-rules-fuzz/REPORT.md`（ISS-023）。程式：`src/rules/state.ts`（`frameView`／`partDefs`／`layerDefs`／`makeUnit`）、`src/rules/flow.ts`（`capture`、`battleResult`）、`src/core/types-def.ts`、`src/core/types-state.ts`、`schemas/content.schema.json`、`src/content/loader.ts`、`src/sim/run.ts`（`scenarioToSetup` 怪獸分支）。

## 背景與唯一目標

現在怪獸戰場實例只記 `{species, grade}`：血量只來自 species.bodyPlan，`MonsterDef.partsOverride`／`attrMods`／`extraAbilities`／`tags` 全是死資料（engine-facts EF-13），同族不同等級怪獸血量一樣。機魂等級寫在 tag `soul-grade:S`；獸緣／殼緣規劃線已採用升格為屬性；instinct 是 soft 池無閾值帶，顯示 120/100（ISS-023）。**唯一目標：照 spec 填進 monsters／persons／species 的這些欄位都要真的生效或被檢查，並以測試釘住。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：
  1. **MonsterDef 生效**：`UnitInit.monster` 加可選 `def?: Id`（MonsterDef id），`RulesRuntime.monsters[id]` 記下它（只新增可選欄）；`scenarioToSetup` 怪獸分支傳 `def`。`frameView`：`innateAbilities` 加上 `extraAbilities`（去重、排序穩定）、`tags` 併入 MonsterDef tags；`partDefs`：依 `partsOverride` 逐筆以 `id` 對上 bodyplan 部位、**有給的欄位整欄取代**（`layers` 整組取代），沒對上的部位維持原樣；`attrMods` 在 `makeUnit` 時掛成單位 contribs（照既有 contribs 機制，source 填 MonsterDef id）。`partDefs` 是熱路徑：合成結果要快取（例如 以 ContentDB 為鍵的 WeakMap，內層以 MonsterDef id 為鍵），`node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` 的 ms／步不得超過開工 1.2 倍。沒有 `def` 的舊 UnitInit（營運層出戰目前只給 species／grade）行為完全不變。
  2. **捕捉與戰果**：`BattleResult.units[]` 加可選 `monster?: Id`（怪獸單位的 MonsterDef id，**被捕捉的也要有**——capture 刪 `runtime.monsters` 前先另存）。捕捉時若 partsOverride 讓層數與 `capture.frame` 的 bodyplan 不一致，載入器報錯（見 3）；HP 上限不同只警告。
  3. **載入檢查**（`src/content/loader.ts` 的 `checkMerged` 末尾**追加一個獨立函式**，不改既有段落；另一位工人同時在此檔加別的檢查，改前重讀、只做局部 patch）：partsOverride 的 `id` 必須是 species bodyplan 的部位；覆寫後每個部位最後一層 `structural:true`；至少一個部位 functions 含 `core`；層數與 capture.frame bodyplan 對應部位不符 → error；`soulGrade` 出現在 `kind:"human"` → error。每條要有能變紅的測試。
  4. **內容**：`content/base/monsters/` 裡同一 species 有多個等級的個體，依 numeric-bands.json「怪獸／總層 HP」該等級區間，用 `partsOverride` 把總層 HP 調進區間（只改 layers 的 hp，不改層數、resist 等其他欄）；至少要處理鏡肢 A（mirror-a）、腐衛 A（rotwarden-a）、叩闕甲 A（siegebeetle-a）。逐隻列前後總 HP 表。
  5. **機魂等級**：`PersonDef.soulGrade?: Grade`（型別＋schema；只限 kind soul），把 `content/base/persons/` 4 個 `soul-grade:X` tag 遷移成欄位並刪掉該 tag；先 `grep -rn "soul-grade" src content` 確認沒有程式讀這個 tag（有就一起改成讀欄位，若在 `src/ops/` 或 `src/ui-adapter/` 則只寫 REPORT 不改）。
  6. **獸緣／殼緣**：`content/base/registries/attrs.json` 追加 `beastKin`、`shellKin`（無 role、min 0、max 100、中文 name 獸緣／殼緣）；測試 `self.attrs.beastKin` 在 NumExpr 能對人物求值（人物沒有該屬性時取 0 或報錯，照現有 attrs 行為，寫進 REPORT）。確認 `node src/ops/content/check.ts content/base` 仍 0 錯。
  7. **ISS-023**：讀 spec 裡 instinct 的設計，決定「soft 池補超載閾值帶」或「改 hard」，改 `content/base/species/` 的 instinct 池（以及 `content/base/frames/bio-*.json`、`corpse-*.json` 若也有同問題）；REPORT 一段說明選擇與理由、改了幾檔。
- 不做：`src/ai/`、`src/sim/session.ts`、`src/ops/`、`src/ui-adapter/`、`src/mcp/`；`content/base/frames/` 裡 `cls:"mechanical"` 與 `ancient-*` 的檔、`scenarios/`、`abilities/`、`components/`、`effects/`（除非 ISS-023 選了補帶而需要新增一個 effect 檔，那就只新增一檔）、`world/`；spec；`behaviors.molt`、spawner 等其他死欄位；黃金檔（`test/golden/*.hash`）不重產，失敗就記錄。
- 件數 gate：改動＋新增檔超過 60 個就停下回報；容量 gate：diff 超過 200 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-engine --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 開工與完成各跑一次，比 ms／步與 hash |
| `node src/ops/content/check.ts content/base` | 改 attrs 後確認營運內容仍 0 錯 |
| `npm run fuzz -- --runs 100 --mode mix --jobs 4` | 完成時跑一次，硬違規 0 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-engine/`；臨時檔只放 `/tmp/cx-gb-engine/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ai/`、`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；bench 開工值；讀 spec 與程式；`inbox_poll --once`。
2. 做「只做」1–3（程式＋測試，新測試放 `test/rules/monster-def.test.ts` 與 `src/content/content.test.ts` 追加）；`inbox_poll --once`。
3. 做 4–7（內容＋型別）；`npm run check` 0 錯；`inbox_poll --once`。
4. 完成量測（bench、fuzz 100、`npm test` 失敗清單）；寫 REPORT 並回報。黃金測試若變動，逐個寫「哪個檔、為什麼變」（例如 tags 併入改了 unitTags）。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-engine/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/state.ts`、`src/rules/flow.ts`、`src/core/types-def.ts`、`src/core/types-state.ts`、`src/rules/index.ts`（若要匯出型別）、`schemas/content.schema.json`、`src/content/loader.ts`、`src/sim/run.ts`（只改怪獸分支） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/rules/monster-def.test.ts`、`src/content/content.test.ts`（追加） |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/{monsters,species,persons}/`、`content/base/registries/attrs.json`、`content/base/frames/{bio,corpse}-*.json`（只 ISS-023） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-engine/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `test/rules/monster-def.test.ts` 至少 5 條：partsOverride 改變層 HP、extraAbilities 出現在可用能力、attrMods 改變單位屬性、BattleResult 帶 monster id（含被捕捉者）、無 def 的 UnitInit 行為不變（與改前同 hash）；每條能變紅（REPORT 一句說怎麼證的）。
2. 載入檢查 5 種錯誤各有測試能變紅；`npm run check` 回 `OK 0 errors`；`node src/ops/content/check.ts content/base` 0 錯。
3. REPORT 附怪獸前後總層 HP 表，mirror-a、rotwarden-a、siegebeetle-a 都落進 numeric-bands 的 A 級區間。
4. `grep -rn "soul-grade" content/base src` 0 命中；4 個機魂有 `soulGrade`；`attrs.json` 有 beastKin／shellKin 且 NumExpr 測試過。
5. bench ms／步 ≤ 開工 1.2 倍；fuzz 100 場硬違規 0；`npm run typecheck` 0 錯。
6. REPORT 存在且有四段＋ISS-023 選擇說明＋黃金／固定 hash 測試變動清單（沒有就寫「無」）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-engine`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-engine --up PROGRESS 'cx-gb-engine 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-engine --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-engine/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-engine --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。

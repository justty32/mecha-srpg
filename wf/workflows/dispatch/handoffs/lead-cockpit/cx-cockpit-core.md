# 任務：讓引擎判定機甲核心與座艙狀態，AI／遙控機只能普通開，並改寫白手套六情境

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md` 與 `wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。設定來源：`wf/workflows/planning/design-notes/world/drive.md`、`wf/workflows/planning/specs/world/pilots.md`、`wf/workflows/dispatch/handoffs/engine-backlog.json` 第 30 列（`python3 wf/tools/tabledb.py wf/workflows/dispatch/handoffs/engine-backlog.json find 序=30`）。

**工作目錄**：一切改動都在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/cockpit/wt-core`（下稱 `$WT`）裡做；上面「先讀」的檔在 `$WT` 裡也有同一份。不要改主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的任何檔（REPORT 與 inbox 例外，見交付）。

## 背景與唯一目標

使用者 2026-10-25 裁示：只有人（或機魂）在座艙裡，機甲核心才被驅動，才有招式與能力；遙控與傳統 AI 只能「普通開」。無人機兩種：**鐵偶**＝無機甲核心，只打得了人；**遙控機／AI 機**＝有核心但沒被驅動，能打獸但弱。機魂能獨駕（引擎現行的接手／替駕／autonomy 獨駕照舊保留，不要移除）。目前白手套情境讓一個機魂 `person/glove` 同時坐進好幾台機甲，違反「機魂不可複製」。唯一目標：**引擎有核心標記與座艙狀態、AI／遙控能普通開出戰，白手套六情境改用無人機表示，黃金重產**。

## 範圍（排除法寫死）

只做下面這些；沒列的一律不做，「順手也該改」的寫進 REPORT「需要決定的事」。

1. **型別與資料**（`src/core/types-def.ts`、`src/core/types-state.ts`、`schemas/content.schema.json`、`src/content/` 載入與 lint）：
   - `FrameDef.core?: boolean`（缺省＝true；false＝無機甲核心，凡鐵）。
   - `UnitSpawn` 與 `UnitInit` 加 `core?: boolean`（覆蓋 frame 值）與 `crew?: "ai" | "remote"`（座艙內建的傳統 AI 或遙控；可以和人同坐＝AI 輔駕）。`MechState` 存解析後的 `core` 與 `crew`（存檔、複製、重播要帶得過去）。
   - `ControlMode` 加 `"scripted"`（沒有座位人物、由 crew 操縱；仿 `instinct`）。
2. **規則**（`src/rules/`）：
   - 新增純函式 `cockpitOf(ctx, unitId)` → `"human" | "soul" | "ai" | "remote" | "empty"`（有活著的 human 座位人物＝human；否則有 soul＝soul；否則看 crew；都沒有＝empty）與 `isDriven(ctx, unitId)`＝`core && cockpit ∈ {human, soul}`。放在合適的既有模組（建議 `control.ts`），從 `src/rules/index.ts` 匯出。怪獸單位不適用（`isDriven` 對怪獸回 true，行為不變）。
   - `makeUnit`：沒有座位人物且有 crew → `controlMode:"scripted"`；`handOver`（駕駛死亡／棄機）在沒有可接手機魂時，有 crew 就轉 `scripted`，否則照舊。
   - **普通開的能力過濾**（`abilitiesOf` 或 `checkAbility`，二擇一，AI 與 UI 查到的清單要一致）：機甲 `isDriven` 為 false 時，(a) 帶 `actorRole` 的能力不可用；(b) frame `innateAbilities`（機體招式）不可用，**除了**資料表 `basicAbilities` 裡列的基本動作；(c) 部件能力（武器）可用，但帶資料表 `drivenOnlyTags` 任一 tag 的不可用。資料表放新檔 `content/base/rules/cockpit.json`（載入器 `RULE_FILES` 加一項，check 的「rules: n/4」計數跟著改），初值：`basicAbilities`＝`ability/mx-frame-strike`、`ability/mx-head-vulcan`、`ability/mx-guard-stance`；`drivenOnlyTags`＝`ancient`、`soul`、`captain`、`command`。
   - **無人機的資源池**：scripted 單位沒有人物，人物成本改由機體同名池支付（`pools.ts` `costOwner` 把 `instinct` 的分支擴到 `scripted`）；機體沒有 `ap` 等池時，`makeUnit` 依 `cockpit.json` 的 `crewPools`（按 crew 種類給池宣告，格式同 PoolDef）補宣告。初值（暫值）：`ai` 與 `remote` 都給 `ap` max 7／regen 7、`fatigue` max 100／regen −100（人駕手套是 ap 9，無人機比人弱）。
   - **無核心＝凡鐵**：`core:false` 的單位在傷害結算的來源 tag 裡多一個 `conventional-arms`（`unitTags` 或 attack 結算處加，擇一），所以對 kaiju 照現行十分律 ×0.1。有核心但沒驅動的不加（精粹武器照武器本身結算）。
   - person 能力、perk 在沒有座位人物時本來就不生效，不要動。
3. **AI**（`src/ai/`）：scripted 單位要能被 AI 正常行動（移動、用可用能力、撤退判斷不因沒有 commander 而卡死）；只做讓它能動的最小修正。
4. **營運**（`src/ops/`）：
   - `EncounterUnit` 加 `crew?`／`core?`，`sortie/scenario.ts` 生成敵方時帶進 `UnitSpawn`；沒填 pilots 又沒有 crew 的照舊。
   - **終局「駕駛員為零」**（目前未實作）：每天結束時（`time/tick.ts` 的日終段，或 crew 模組的日終掛點），名冊上沒有任何「活著、kind 為 human 且 employment.role 為 `pilot`」的人，**也沒有任何 kind 為 soul 的人**（機魂在就不算零）→ 發一次 `CampaignEnd {reason:"no-pilots"}`（已發過任何 CampaignEnd 就不再發）。加單元測試：只剩機魂不結束、全無才結束。
5. **介面**：`src/ui-adapter/vm/labels.ts` 的 `controlLabel` 給 `scripted` 中文（例「無人（普通開）」）；MCP `battle-view.ts` 同一個 label 函式即可。不做新面板。
6. **內容**（`content/base/`）：
   - 六個情境 `scenarios/{skirmish-whitegloves,rift-edge-nest,quarry-duel,crater-three-way,lunar-blockade-run,shell-excavation-escort}.json`：拿掉所有坐 `seat:"soul"` 的 `person/glove`，改成 `crew:"remote"`；**打人場**（對手只有人類、沒有 kaiju）加 `core:false`（鐵偶），**有 kaiju 或要守牆打獸的場**保留核心（遙控機）。逐場在 REPORT 列判定與理由。其他情境的 soul 座位（如 `glade-spore-hold`、`hive-burrow-clearing`）不動。
   - `factions/selene-whitegloves.json` 的 tag `soul-driven` 改 `unmanned`（grep 確認沒有程式依賴舊 tag；有的話一併改）。frame 上的 `soul-driven` tag 不動。
   - `person/glove` 本身與 `world/` 裡引用它的檔不動（它是唯一的催收機魂）。
7. **黃金與測試**：照 `test/golden.test.ts` 頂端註解 `GOLDEN_UPDATE=1` 重產 `test/golden/`、`test/campaigns/*.hash.json`、`src/ops/sim/golden.test.ts` 的黃金；`src/sim/probe-baselines.json` 若因情境改動失準也重產（看 `src/sim/probe.ts` 的更新方式）。引用這六情境的測試（`src/mcp/*.test.ts`、`src/ui-adapter/**/*.test.ts`、`test/sim/*.test.ts` 等）有寫死的期望值就照新行為改，改的每一處在 REPORT 說明為什麼。新增單元測試：cockpitOf 五種狀態、普通開過濾（基本動作可用、機體招式不可用、drivenOnlyTags 擋住）、無核心對 kaiju ×0.1、駕駛死亡後 crew 接手轉 scripted、scripted 單位能付 AP 行動。
8. **code map**：`wf/workflows/common/code-map.json` 對應列補新函式／新檔（用 `python3 wf/tools/tabledb.py` 改）。

**不做**：機甲核心等級、精粹等級差抵抗性（第 28 列）、人帶能力（47）、驅動時數（48）、AI 醒成機魂（49）、營運玩家編隊裡讓玩家選 AI 駕駛（下一條線做）、任何 spec／design-notes／lore 文字、經濟與士氣數值、`content/lore/`、`content/index/`（領導重產）、`e2e/`。
- 件數 gate：改動的檔案超過 60 個就停下回報；容量 gate：單一新增檔超過 200 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-cockpit-core --once` | 每完成一步讀 orders／mail |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |
| `python3 wf/tools/tabledb.py` | 讀 engine-backlog、改 code-map.json |
| `node --test`、`npm test`、`npm run typecheck`、`npm run check` | 改完驗證（在 `$WT` 跑） |
| `GOLDEN_UPDATE=1 node --test test/golden.test.ts`（另兩支黃金測試同法） | 重產黃金 |

## 資源與禁區

- **可寫程式碼線**：只寫 `$WT` 裡「範圍」列的路徑，加上交付列的兩個主 repo 位置；可跑 testing 工作流列的驗證指令與測試。**不要 commit**（沙箱裡 `.git/` 寫不了）：commit 由領導做，你在 REPORT 列出改了哪些檔。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗、不跑 `npm run test:e2e`、不開 dev server；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 `git add`、不 commit；不 `rm -rf`（暫存搬 `/tmp/cx-cockpit-core-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不刪檔（要刪寫進 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個。不上網。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數可能不準（已知坑），以 `# fail 0` 與 exit code 判。

**已知沙箱失敗（不算阻塞，2026-10-25 第一次派線實證）**：沙箱擋 unix socket 與 `spawnSync`，所以 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts`（CLI 那幾條）在沙箱裡一定紅。基準與驗收第 1 條改用：`node --test --test-reporter=tap $(ls src/**/*.test.ts test/**/*.test.ts | grep -v -e src/mcp/cli.test.ts -e src/mcp/e2e.test.ts -e src/ops/content/worldgen.test.ts)`（zsh 下 `**` 可用；或自己寫等效的排除清單）。這三支由領導在沙箱外重跑；你只要確保它們讀的內容／情境改了之後，期望值也跟著改（讀測試碼判斷）。

## 工作

1. 讀先讀清單與 `src/rules/{control,command,pools,state,attack}.ts`、`src/ai/intent.ts`、`src/ops/sortie/scenario.ts`、`src/ops/time/tick.ts`；先跑一次 `npm test` 記基準通過數。
2. 型別、資料表、規則與 AI（範圍 1–3），補單元測試，`npm test` 綠。
3. 營運（範圍 4）與介面 label（範圍 5），補測試。
4. 六情境與 faction tag（範圍 6），`npm run check` 0 錯；跑一場確認白手套有動：`npm run sim` 跑 `scenario/skirmish-whitegloves`（參數格式讀 `src/sim/cli.ts` 開頭）。
5. 重產黃金（範圍 7），對 diff：只有和本線改動有關的黃金應該變；**不該變的變了就是 bug，先修再重產**。REPORT 列每個變動的黃金檔與原因。
6. code map（範圍 8），寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-cockpit/cx-cockpit-core/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式碼、內容、測試、黃金改動 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/cockpit/wt-core/` 底下（不 commit） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-cockpit/cx-cockpit-core/REPORT.md` |

REPORT 四段（做了什麼／產出（含改動檔清單、六情境判定表、黃金變動表）／沒做到或證據不足的／需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 在 `$WT` 跑上面「已知沙箱失敗」段的排除版測試指令回傳 0（`# fail 0`），通過數 ≥ 基準＋新增測試數。
2. 在 `$WT` 跑 `npm run typecheck` 回傳 0，`npm run check` 末行 0 errors。
3. `grep -rn 'person/glove' $WT/content/base/scenarios/` 無輸出；`grep -n 'soul-driven' $WT/content/base/factions/selene-whitegloves.json` 無輸出。
4. 新增的單元測試涵蓋範圍 7 列的五件事與範圍 4 的兩個終局情形，REPORT 列出測試名稱。
5. REPORT 存在於交付路徑，含六情境判定表與黃金變動表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）且你修不好 → 保留 worktree 現狀，發 `FAILED`，REPORT 寫證據與卡住的點。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-cockpit-core`。本線團隊：`teams/cockpit`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-cockpit-core --up PROGRESS 'cx-cockpit-core 上線' < /dev/null`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑這些 inbox 指令）。
- 終局：`wf/tools/inbox_mail.sh cx-cockpit-core --up DONE 'cx-cockpit-core：座艙狀態與普通開落地、白手套六情境改無人機、黃金重產' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-cockpit/cx-cockpit-core/REPORT.md`（DONE 換成實際 STATUS、標題換成實際結論）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 「背景與唯一目標」與「工作」衝突時，以「範圍」列的寫法為準。

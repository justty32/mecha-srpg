# 任務：讓駕駛員在驅動機甲核心時累積時數、長出跟人走的能力、老得慢，並讓 AI 在極小機率下醒成機魂

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md` 與 `wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。設定來源：`wf/workflows/planning/design-notes/world/drive.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/specs/world/pilots.md`、engine-backlog 第 47、48、49 列（`python3 wf/tools/tabledb.py wf/workflows/dispatch/handoffs/engine-backlog.json find 序=47`，48、49 同法）。上一條線（第 30 列，已合入）的成果：`src/rules/control.ts` 的 `cockpitOf`／`isDriven`、`content/base/rules/cockpit.json`、`MechState.core`／`crew`、`controlMode:"scripted"`；它的 REPORT 在 `wf/workflows/dispatch/handoffs/done/2026-10-25/lead-cockpit/cx-cockpit-core/REPORT.md`。

**工作目錄**：一切改動都在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/cockpit/wt-growth`（下稱 `$WT`）裡做；上面「先讀」的檔在 `$WT` 裡也有同一份。不要改主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的任何檔（REPORT 與 inbox 例外，見交付）。

## 背景與唯一目標

使用者 2026-10-25 裁示：只有人或機魂驅動機甲核心；駕駛員因此長出**屬於人、換機照用**的能力，現役老得慢（常人 1/4）；機魂也長能力但速度是人的 1/10；傳統 AI 開有核心的機甲（自駕或輔助人駕），在大潮時刻或古代機旁有極小機率醒成機魂。**數值一律是暫值、集中放資料檔，使用者之後微調；不做平衡調校。** SS／SSS 目前不做設定：能力等級上限暫定 S。唯一目標：**引擎與營運能表示並推進「驅動時數→能力／外貌年齡」與「AI 醒魂」，且玩家能在營運編隊裡讓 AI 開機甲**。

## 範圍（排除法寫死）

只做下面這些；沒列的一律不做，「順手也該改」的寫進 REPORT「需要決定的事」。

**暫值集中處**：本線所有可調數值放 `content/base/rules/cockpit.json` 新增的 `growth` 段（載入型別 `CockpitRules` 跟著擴；check 驗型別與參照）。初值：
`driveHoursPerRound` 0.25；`soulGrowthFactor` 0.1；`abilityCap` 3；`abilityHours`（第 1、2、3 個能力的時數門檻）[20, 60, 150]；`abilityGradeCap` "S"；`abilityPool`（可長出的能力 id 清單，見 47-4）；`agingRate` 0.25；`driveHoursPerYear` 1000；`daysPerYear` 364；`awakenMinAiBattles` 10；`awakenChanceTide` 0.0001；`awakenChanceAncient` 0.0001；`awakenSoulTemplate`（見 49-3）。

**47 人帶能力**
1. `PersonDef.abilities?: Id[]`（人物天生帶的能力）；`PersonState.abilities?: Id[]`（後天長出的，營運寫入）。schema、載入參照檢查、`UnitInit.persons[].state` 可帶 `abilities` 進戰鬥。
2. `abilitiesOf`：單位 `isDriven` 為 true 時，併入座位上活著的人物（human 與 soul）的 `def.abilities` 與 `state.abilities`；普通開（not driven）時不併。能力由誰出手、誰付成本照既有 `actorRole`／commander 規則。
3. 營運端「長出能力」：每場戰鬥結算後（`src/ops/sortie/apply.ts` 的 `applyBattleResult` 或其回寫處），對 47-2 條件下的每位人物，若 `abilities` 個數 < `abilityCap` 且 `driveHours`（機魂乘 `soulGrowthFactor` 後比較）≥ 下一個門檻，就從 `abilityPool` 中挑一個「尚未擁有、且能力等級 ≤ min(此人驅動過的最高機甲等級, abilityGradeCap)」的能力（用營運 rng，決定性），寫入 `PersonState.abilities`，發 `AbilityGained {person, ability}` 事件。人物要記 `maxDrivenGrade`（驅動過的最高 frame grade）。
4. 能力等級：`AbilityDef.grade?: Grade`（缺省視為 D）。新建 4 個人物能力資料（`content/base/abilities/`，id 前綴 `ability/pa-`）對應裁示的起頭四類：思維加速、強化打擊（暫時激發近戰武器上的能量）、強化遠程（加強遠程武器上的能量）、壓制獸性。效果**只用既有的 effect／contrib 機制**仿 `ability/mx-guard-stance` 這類自我增益，數值取小、標 `ai` 提示；grade 先全給 D。中文名要自然，不要直譯（例：別叫「思維加速」以外的翻譯腔名字；直接用裁示四個詞也可以）。它們放進 `abilityPool`。

**48 驅動時數與外貌年齡**
1. `PersonState.driveHours?: number`（缺省 0）。每場戰鬥結算時，對每位**在有核心機甲上、座艙被他（human 或 soul）驅動**的己方人物加 `rounds × driveHoursPerRound`；遙控、AI、沒上機的人不加。
2. `PersonDef.age?: number`（2108 開局時的實齡）與 `PersonDef.activeYears?: number`（開局前已現役年數）。純函式 `apparentAge(def, state, day, growth)`：`realAge = age + floor(day / daysPerYear)`；`active = (activeYears ?? 0) + driveHours / driveHoursPerYear`；`apparent = realAge − active × (1 − agingRate)`，四捨五入到整數；沒有 `age` 回 null。機魂不適用（回 null）。
3. 顯示：營運人物面板（`src/ui-adapter/ops/`）顯示「驅動時數」與「外貌 N 歲（實齡 M）」；百科人物卡（`src/ui-adapter/vm/wiki/cards.ts`）有 `age` 時顯示外貌與實齡（用 day 0、driveHours 0）。MCP 營運人物資訊（`src/mcp/campaign-view.ts`）同樣加兩欄。
4. 資料：`content/base/persons/` 裡若有對應 lore 點名的五人（丹增・卓瑪、伊內絲・瓦曼、尹瑞英、格雷格・奧爾森、伊爾瑟・布蘭特）的檔，照 `content/lore/` 與 `design-notes/world/pilots.md` 裡寫到的年齡／年資填 `age`／`activeYears`；lore 沒寫具體數字的不填。**`content/lore/` 只讀不改。**
5. 三系代價（神性、獸性等）不做。

**49 AI 醒成機魂**
1. 營運編隊可讓 AI 開機甲：`Sortie.units[]` 加 `crew?: "ai"`，傳進 `UnitSpawn.crew`。座位全空＋`crew:"ai"`＝AI 自駕（`controlMode:"scripted"`，`formation.ts` 的檢查不再把它當「尚未配置」）；有人＋`crew:"ai"`＝AI 輔駕（座艙仍算 human）。營運編隊介面給每台機甲一個「AI 駕駛」切換（vm action＋dom 一個 checkbox 或按鈕，鍵盤可操作；照既有 formation 面板的寫法）；MCP 出戰參數 `sortie.units[].crew` 同步。
2. 營運 `MechState` 加 `aiBattles?: number`：每場戰鬥結算，帶 `crew:"ai"` 出戰、機甲有核心且存活者 +1。
3. 醒魂判定：同一結算點，對 `aiBattles ≥ awakenMinAiBattles` 的那些機甲，分別擲「大潮時刻」與「古代機半徑內」兩個獨立骰（任一中就醒）：大潮時刻＝當天 `clock.phase === "spring"`（SPEC-GAP：engine-backlog 第 38 列的大潮曆落地前先用漲潮日代替，程式註解寫明）；古代機半徑內＝這場戰鬥有任何 frame `cls:"ancient"` 的單位（SPEC-GAP：先不算距離）。都不成立就不擲（機率 0）。醒了：用 `awakenSoulTemplate` 指向的 soul 人物範本（新建 `content/base/persons/awakened-soul.json`，仿 `persons/glove.json` 但不帶 trait-copied、perks 空、名字用登錄號式的佔位，例「無名機魂」）在名冊生成一個新人物（id 由既有 id 產生器給、`registerPersonName` 起名），employment role `pilot`，坐進那台機甲的 soul 座位（沒有 soul 座位就只進名冊）；發 `SoulAwakened {mech, person}` 事件；該機甲 `aiBattles` 歸零。原 AI 保留（機甲仍可再帶 `crew:"ai"`）。
4. 測試要能注入機率：測試裡改 db 規則表把機率設 1，驗會醒、事件與名冊正確；機率 0 時不醒。

**通用**
- 黃金：`GOLDEN_UPDATE=1` 重產 `test/golden/`、`test/campaigns/*.hash.json`、`src/ops/sim/golden.test.ts` 的黃金。預期：戰鬥黃金不變（指令驅動、無營運）；營運黃金可能因新事件與時數欄而變，逐檔在 REPORT 說明原因。
- code map：`wf/workflows/common/code-map.json` 對應列補新函式與新檔（用 `python3 wf/tools/tabledb.py`）。

**不做**：精粹等級差抵抗性（第 28 列）、大潮曆（第 38 列）、三系代價、機魂天賦樹的成長速度、任何 spec／design-notes／lore 文字、經濟與士氣數值、`content/lore/`、`content/index/`（領導重產）、`e2e/` 測試檔（領導跑）。
- 件數 gate：改動的檔案超過 60 個就停下回報；容量 gate：單一新增檔超過 200 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-cockpit-growth --once` | 每完成一步讀 orders／mail |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |
| `python3 wf/tools/tabledb.py` | 讀 engine-backlog、改 code-map.json |
| `npm run typecheck`、`npm run check`、排除版 `node --test`（見下） | 改完驗證（在 `$WT` 跑） |
| `GOLDEN_UPDATE=1 node --test test/golden.test.ts`（另兩支黃金測試同法） | 重產黃金 |

## 資源與禁區

- **可寫程式碼線**：只寫 `$WT` 裡「範圍」列的路徑，加上交付列的主 repo REPORT 目錄與 `wf/inbox`；可跑 testing 工作流列的驗證指令與測試。**不要 commit**（沙箱裡 `.git/` 寫不了）：commit 由領導做，你在 REPORT 列出改了哪些檔。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗、不跑 `npm run test:e2e`、不開 dev server；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 `git add`、不 commit；不 `rm -rf`（暫存搬 `/tmp/cx-cockpit-growth-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不刪檔（要刪寫進 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個。不上網。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。

**已知沙箱失敗（不算阻塞）**：沙箱擋 unix socket 與 `spawnSync`，`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts` 在沙箱裡一定紅。基準與驗收第 1 條用排除版：`node --test --test-reporter=tap $(ls src/**/*.test.ts test/**/*.test.ts | grep -v -e src/mcp/cli.test.ts -e src/mcp/e2e.test.ts -e src/ops/content/worldgen.test.ts)`。沙箱 TAP 每檔只算 1 項，以 `# fail 0` 與 exit code 判；逐案可用 `--test-isolation=none --test-name-pattern=…`。這三支由領導在沙箱外重跑。

## 工作

1. 讀先讀清單與 `src/rules/{control,command,state}.ts`、`src/ops/sortie/{apply,scenario,validate}.ts`、`src/ops/crew/{roster,names}.ts`、`src/ops/content/instantiate.ts`、`src/ui-adapter/ops/vm/formation.ts`、`src/ui-adapter/vm/wiki/cards.ts`、`src/mcp/campaign*.ts`；先跑一次排除版測試記基準。
2. 47（型別、合併、四個能力資料、長出事件），補單元測試，排除版測試綠。
3. 48（時數、外貌年齡、顯示、人物資料），補測試。
4. 49（編隊 AI 駕駛、aiBattles、醒魂、範本人物），補測試。
5. 重產黃金、對 diff；不該變的變了就是 bug，先修再重產。
6. code map，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-cockpit/cx-cockpit-growth/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式碼、內容、測試、黃金改動 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/cockpit/wt-growth/` 底下（不 commit） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-cockpit/cx-cockpit-growth/REPORT.md` |

REPORT 四段（做了什麼／產出（含改動檔清單、暫值表、黃金變動表、四個能力的名稱與效果）／沒做到或證據不足的／需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 在 `$WT` 跑排除版測試回傳 0（`# fail 0`）。
2. 在 `$WT` 跑 `npm run typecheck` 回傳 0，`npm run check` 末行 0 errors。
3. 新增單元測試涵蓋：driven 時併入人物能力、普通開時不併；時數只給驅動者累積；第一個門檻長出能力且等級受限；機魂乘 1/10；`apparentAge` 公式與 null 情形；編隊 AI 自駕成 scripted；醒魂機率 1 時醒（事件、名冊、座位、aiBattles 歸零）、機率 0 或條件不成立時不醒。REPORT 列出測試名稱。
4. `content/base/rules/cockpit.json` 有 `growth` 段且含範圍列的全部鍵；`grep -rn "0.0001\|1/4\|0.25" $WT/src/ops $WT/src/rules` 不出現本線新寫的寫死暫值（暫值都從規則表讀）。
5. REPORT 存在於交付路徑，含暫值表與黃金變動表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）且你修不好 → 保留 worktree 現狀，發 `FAILED`，REPORT 寫證據與卡住的點。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-cockpit-growth`。本線團隊：`teams/cockpit`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-cockpit-growth --up PROGRESS 'cx-cockpit-growth 上線' < /dev/null`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑這些 inbox 指令）。
- 終局：`wf/tools/inbox_mail.sh cx-cockpit-growth --up DONE 'cx-cockpit-growth：驅動時數、人帶能力、外貌年齡與 AI 醒魂落地' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-cockpit/cx-cockpit-growth/REPORT.md`（DONE 換成實際 STATUS、標題換成實際結論）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 「背景與唯一目標」與「工作」衝突時，以「範圍」列的寫法為準。

# lead-integ-battle — 工人共用契約

[領導 REPORT](REPORT.md)｜基準腳本 [bench-ops.ts](bench-ops.ts)

領導 `lead-integ-battle`（Opus）寫給本線 codex 工人 `cx-ib-*`。各工人的交接書是唯一契約；本檔只放共用的背景、慣例與已查清的事實。

## 一、領導已查清的事實（2026-10-24，HEAD `1941174`）

1. **一場 ops 出戰跑到步數上限的原因**（`bench-ops.ts` 重現：部署欄移到 x=2，seed 7 第一場，3 台獵犬 vs 4 蝕蟲＋巢母）：
   - 玩家機甲**沒有武器**：`content/base/world/campaign-start/default.json` 的 `mechs` 只列 frame id，`src/ops/content/instantiate.ts` 把所有部件槽填 `null`；`frame/hound-mk2` 沒有 innate 能力 → `abilitiesOf` 回空陣列，玩家整場只會 move／end。
   - 無駕駛員怪獸（controlMode `instinct`）**命中 5%**：species `baseAttrsByGrade` 沒有 `accuracy`，能力也沒有 `accuracy` → `hitChance` 夾到下限 5；AI 預覽三次全 miss，估值 0 < `endScore`，於是不攻擊。巢母的 `nest-birth`（self 目標）也走命中骰 5%，400 步裡生了 15 隻蝕蟲。
   - 目標 `hold`／`escort` 在 `src/rules/objectives.ts` **永遠回 false**；ops 情境沒設 `rounds` → `maxRounds` null，沒有 timeout。
   - 綜合：沒有一方能消滅另一方、目標不可達成、沒有輪數上限 → 打到 `maxSteps`（預設 10000）。
2. **效能熱點**（`node --cpu-prof`，200 步，24 ms／步）：`structuredClone` 自身 34%（`previewCommand`、`maskedState` 每次深拷整個 `BattleState`，含持續增長的 `log.events`）；`reachable` 總 43%（每個 pop 都 `queue.sort`、每步 `stepCost` 重算 `locomotionOf`／`frameView`／`unitAt` 線性掃）；`pathTo` 31%（每次重跑 `reachable`）；`parseId` 正規式 9%（ContentDB 查表，ops 的 `scenarioDB` 覆蓋層每次 `find`）；`dangerMap` 9%。skirmish 20 輪一場約 19 秒。
3. 劣勢撤離：`src/ai/score.ts` `want().retreat` 只看 `forceRatio < 0.5`，沒有輪數、交戰、受損門檻；ops 部署欄與撤離欄同在 x=0，開場就在撤離格上。

## 二、慣例（全部工人）

- 慣例：`wf/workflows/common/conventions.md`（TS strict、ESM、識別字英文、註解繁中、數值走 `content/`、spec 缺口標 `SPEC-GAP`）。
- **core 型別只新增可選欄位**，不改既有欄位、不新增必填欄（`src/ui-adapter/` 有別線在用，不准讓它 typecheck 壞掉）。
- **決定性**：同 seed 同輸入結果相同；不可用 `Math.random`、`Date`、物件插入順序以外的不穩定順序。
- 每位工人在**自己的 git worktree**（`-C` 指定的目錄）工作，階段 A（perf／term／step）基底 `1941174`，階段 B（entry）基底 `4226950`（含階段 A 全部改動）；`node_modules` 是指向主 repo 的 symlink，不要動它。不 commit（沙箱擋 `.git`），由領導合併與 commit。
- 跑法（worktree 根）：`npm test`、`npm run check`、`npm run typecheck`、`node src/ops/content/check.ts content/base`、`node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy`。沙箱內 `node --test` 計數可能不準（每檔算 1 項），不算阻塞，以 fail 數為準。

## 三、黃金 hash

- `test/golden/*.hash`（規則黃金 6 個）、`src/ops/sim/fixtures/campaign-hash.json`（ops 黃金戰役）、`test/ai/balance.test.ts`、`test/sim/*` 內的 hash 斷言。
- 行為不變的改動：一律不准變。改變行為的改動：可重產（各測試檔說明的 `GOLDEN_UPDATE=1` 或手改），但 REPORT 要逐個列「哪個 hash、舊→新、為什麼」。

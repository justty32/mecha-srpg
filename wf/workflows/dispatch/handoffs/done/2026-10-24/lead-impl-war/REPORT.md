# REPORT — lead-impl-war：勢力作戰、外交、傭兵參戰、勢力研發（頂層代存，2026-10-24）

STATUS：**PARTIAL（切線 1–4 完成，5 未派）**。commit `1916468`（1＋2）、`a4755a0`（3＋4）、`a23807b`（收線）。工人 REPORT `cx-war-{core,merc,rnd}/REPORT.md`；模擬輸出 `sim/`。待派交接書（已過 `brief_lint --strict`）：`cx-war-sim.md`、`cx-ops-board.md`、`cx-ops-fix.md`。

## 完成度
| 切線 | 狀態 | 內容 |
|---|---|---|
| 1 ops-war-core | 完成 | 常備軍、十種作戰（集結→行軍→交戰→結算→善後）、戰力比抽象結算；作戰獨立亂數流 |
| 2 ops-diplomacy | 完成 | 關係值＋六態（滯後）、七種條約、14 條驅動、三道防退化 |
| 3 ops-merc | 完成 | `kind:"join"`、選邊與三種背叛、三種指揮權、四檔補給＋借機、按貢獻比結算、政策 `merc` |
| 4 ops-rnd | 完成 | 研發點與釋出、取殼兩潮月開新血統、失殼停研、隊長機、技術流出、市場篩選器 |
| 5 ops-war-sim | 未做 | `cx-war-sim.md` |
`Loc.region` 只在 `src/ops/war/loc.ts` 讀。機型已連「堅盾」「長槍」。

## 24 潮月（seed 1，玩家不動）
第 10 天殘聯蝕線守備隊對潮信會奪點、拿下鹽灘（唯一一次領土易手），一月後停火；勢力自打攻堅 9、清剿 8、護航 12。第 96 天殼學會扛回古代殼、兩潮月後開新血統；殘聯攻堅勝後造出隊長機「幽冥鐵騎-浮屠」。十幾份貿易約；第 289 天第七哨與殘聯結盟、續約兩次；鐵砧與達卡紡織公會、鹽鷗輪流開戰停火。第二年兩款專屬機型流出成通用，機型 16→25。同時交戰最多 2 對（7%）、同盟最多 1 對，無退化。

## merc（24 潮月）
| seed | 參戰 | 期末現金 | 人數 |
|---|---|---|---|
| 1 | 3 | 3000 | 0 |
| 2 | 2 | 1486 | 7 |
| 3 | 11 | 25650 | 7 |
迴圈通；勝負不穩（大量 20 輪平手，同 ISS-030）；merc 是唯一撐過兩年的政策（idle／greedy 24 潮月現金 −1222、人數 0）；seed 2 耗時 3.5 分鐘。

## 對外型別（全為可選欄或新選項）
`CampaignState` 加 `relations?`／`operations?`／`shells?`／`models?`／`warRng?`；`FactionState` 加 `forces?`／`shells?`／`ops?`／`prestige?`／`rnd?`／`rndProgress?`；`FactionOpsDef.roster` 可 `{model,count}`、`actionLanes?`；`WorldActionDef.lane?:"war"`；契約 `kind:"join"`、`join?`、`operation?`、`side?`、`loans?`、`violations?`；`Sortie.trigger:"operation"`；`MarketDef.lists[].filters?`＋`marketListings()`（UI 與 `text/parse.ts` 未接）；`OpsEffect` 九種新詞彙；`DaySummary` 加 operations／war／allied／released／joins；core `FrameDef` 加 `series?`／`mark?`；新事件約 28 種。

## 驗證（乾淨 worktree，HEAD `2ccd694`＋本線）
作戰 129 項、`src/ops/**`＋`test/**` 370 項綠；typecheck、check、ops content check 0；`sim:campaign` idle／greedy／merc 12、24 潮月 OK；ops 黃金 → `ff0f5a61ffac4a93`。war-testing 不變量與五條黃金未做（切線 5）。

## 判斷
世界會動但偏安靜（8 個勢力、8 個節點）；第三刃與背面無正式勢力（血統掛鹽鷗）；7 條非通用血統的古代殼以 `ancient-rearguard` 佔位；平手是最大體驗問題；勢力無現金與人口帳。

## 需要決定（頂層 2026-10-24）
1. 第三刃、背面補成正式勢力 → 列入 codex 內容任務。
2. 世界更好戰：`operations/seize.json` 權重 ×2、`affinity.json` 宿敵基準 −20→−30 → 採用，交營運缺口線。
3. 平手 → 選項一：契約保持進行中、可重打（greedy 連續平手 2 次放棄）。

## 剩餘工作
`cx-war-sim.md`（不變量與五條黃金）、`cx-ops-board.md`（11 份休眠契約接線＋ISS-032／034／038／039）、`cx-ops-fix.md`（ISS-030／031／033）；小項：`text/parse.ts:45`、`ui-adapter/ops/vm/snapshot.ts:75` 改用 `marketListings()`；封港只停市場與補彈；節點無 `workshop` 標籤；部件市場篩選器缺機型→部件對應；「違令隨機」spec 缺口；ISS-032 後半待二分。

## 工具備註
zsh 下批次提交用 `git add --pathspec-from-file`／`git commit --pathspec-from-file`；黃金 hash 在乾淨 worktree 重產；`inbox_poll.sh --wait` 配 Bash `timeout: 600000`。

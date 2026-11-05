# 第 1 項：整隊撤退改成「目標達不到」且「比例差」

[總計畫](../ai-retreat-search-1105.md)

## 現行程式

- `src/ai/intent.ts:163-164`：`round >= intentMinRound && !noRetreat && (ratio < intentGiveUpRatio || loss >= intentGiveUpLoss || impossible && ratio <= intentImpossibleRatio)` → `memory.retreat = true`，之後每輪所有可動單位 `intentMode="retreat"`（`intent.ts:178`），`agent.ts:68-75` 轉 `flee` 策略。
- `impossible` 由 `intent.ts:141-162` 算：所有非 lose 目標 `unreachable`；`survive`／`hold`／`guardNest` 是防守型，`needed > remaining`（不扣 escape）。four-corners 的敵方只有 `survive 20`，`needed = 20 − round = remaining`，永遠達得到——所以它撤純粹是比例觸發。
- `DEFAULTS`：`intent.ts:12-14`（giveUpRatio 0.45、giveUpLoss 0.7、minRound 8、impossibleRatio 1）。
- 撤退一旦寫入 `memory.retreat` 不會回復（設計上保留）。

## 設計

規則改為一行：

```ts
const outmatched = ratio < p.intentGiveUpRatio || loss >= p.intentGiveUpLoss;
if (!memory.leaderLost && s.round >= p.intentMinRound && !s.rt?.noRetreat && impossible && outmatched) memory.retreat = true;
```

- 「比例差」＝戰力比＜`intentGiveUpRatio` **或** 損失≥`intentGiveUpLoss`，門檻值不變。
- `intentImpossibleRatio` 預設方案刪除（待拍板 1）；若保留，改義為「達不到時的戰力門檻」並預設 0.7，取代上式的 giveUpRatio。
- 指揮者陣亡潰散（`leaderLost`）與個體本能（`individualRetreat`）不動。
- escape 估算 `travel(exits)` 改用第 2 項的 `exitsFor(s, slot)`，撤退距離才是自己那邊的出口。

## spec 草稿（`specs/core/ai.md`「意圖兩層」第二段末）

> 每輪評估全部非 lose 目標……`intentMinRound` 之後，**全部目標都達不到、且戰力比＜`intentGiveUpRatio` 或損失≥`intentGiveUpLoss`** 才整隊撤；只有比例差但目標仍達得到（例如守區撐輪數）不撤，只有達不到但勢均力敵也不撤（打到 timeout）。巢穴、蝕錨等不可移動者不撤。（2026-11-05 試玩裁決；原本比例單獨可撤。）

同段刪 `intentImpossibleRatio` 字樣。

## 測試（`test/ai/intent.test.ts`）

現有六處要改，都是「只看比例」或「只看達不到」就期待撤：

| 行 | 測試 | 改法 |
|---|---|---|
| 43-54 | 達得到繼續；無進展且時間不足才整隊撤離 | 第二段加 `hurt(ctx,"a",0.2)`（loss≥0.7）才期待 retreat；再加一段「不受傷、勢均力敵 → undefined」 |
| 66-77 | giveUpRatio、giveUpLoss、minRound 門檻由 params 生效 | 先讓目標達不到（`memory.stalled=6`、`maxRounds=round+1`），再驗三個門檻；加一句「達得到時 giveUpRatio=2 也不撤」 |
| 154-166 | 多目標仍可守住或生存時 | 第二段 params 加 `intentGiveUpRatio: 100` 讓比例條件恆真 |
| 168-184 | killTarget 只用目標剩餘 HP | `intentGiveUpRatio: 0, intentImpossibleRatio: 100` → `intentGiveUpRatio: 100` |
| 186-209 | profile params 覆寫不可達戰力門檻 | 前半改驗 giveUpRatio（0.9 不撤、1.1 撤）；`decision()` 的 params 同上換法 |
| 257-300 | 致死 HP 兩則 | `intentGiveUpRatio: 0, intentImpossibleRatio: 100` → `intentGiveUpRatio: 100` |

新增一則：「守區方比例差但 hold 仍達得到不撤；hold 達不到且比例差才撤」（用 `hold` objective＋`holdProgress`）。

其他可能翻紅：`test/ai/demo-duration.test.ts`、`test/ai/balance.test.ts`（全 AI 對局時長／勝負斷言）、`src/ops/sim/health.test.ts`（greedy seed 2 已壓在 0.400 邊界）、`src/ops/sortie/intent.test.ts`。

## 黃金影響

- 戰鬥黃金 `test/golden`（6 情境、固定指令）：**不變**。
- 營運黃金 `campaign-hash.json`、`ops-merc-join`：戰役內戰鬥走 AI，撤退時機變 → **必變**，與第 2、3 項合併重錄一次。

## 驗證

battle_auto：exk-four-corners seed 1–5（敵方 Retreated 應為 0、我方守區勝輪數）；exm-crossline／exp-four-choices／exp-unfinished-ties seed 1–5（勝場不低於 report 基線 4/5、3/5、5/5，rounds 可能拉長；timeout 增加是可接受代價但要記下）。

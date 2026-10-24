# REPORT — lead-tune-battle：AI 撤退時機調校、瞄核心、check 降噪（頂層代存，2026-10-24）

STATUS：**DONE（使用者指示做到段落就停）**。commit `0baa1c4`（巢母核心 HP）、`955500a`（check 降噪）、`8f16e8b`（意圖調校＋瞄核心）、`b75aaeb`（收線）。工人 codex `cx-tb-intent`、`cx-tb-aim`（REPORT 開頭有已讀清單）。

## 驗收（乾淨 worktree，HEAD `347f760`＋本線）
`npm test` 811 項 810 過（失敗為 `content/index` 一致性，HEAD 亦失敗，屬索引線）；check 0 錯 12 警告；typecheck 0；fuzz 300 mix 0；`sim:campaign` OK；黃金 6 個不變。

## 數字
| 量測 | 前 | 後 | 判準 |
|---|---|---|---|
| 24 情境×5 seed timeout 平手 | 2.5% | 8.3% | <10% ✔ |
| 平均輪數 | 7.95 | 12.72 | 10–16 ✔ |
| 勝方 player／enemy／ally／third | 46／55／8／8 | 61／20／27／2 | 任一 <70% ✔ |
| rift-edge-nest 玩家陣營 | 0/5 | 4/5 | ≥3/5 ✔ |
| anchored 期望命中（原算法） | 141 | 40 | ≤40 ✔ |
| anchored 期望命中（實際選招加權） | — | 42.0 | ≤40 ✘ |
| 凍結 26 場 anchored 勝／對巢母命中 | 7／48 | 8／117 | — |
| greedy seed 1–5 anchored 勝 | 7/26（舊 HEAD） | 0/4 | ≥1 ✘（新營運路徑同樣 0/4，非本線造成） |

## 改了什麼
- `src/ai/intent.ts`：評估全部非 lose 目標、全部達不到才放棄；killTarget／capture 只算目標 HP；需要輪數以可見單位 HP 差 EMA 估；`intentMinRound` 4→8、`intentGiveUpRatio` 0.55→0.45、`intentGiveUpLoss` 0.6→0.7、新增 `intentImpossibleRatio` 1、`intentDamageAlpha` 0.4（皆可由 aiprofile `params` 覆寫）。
- 瞄核心：`partAim` 能力產生未毀 core 候選，`partAimProgress` 1；`ability/burst-30` 加 `partAim`（懲罰 10）。
- `monster/nestmother-landlord` 核心 30／35／40＝105（原 370），總層 1580 不變。
- check：捕捉後層 HP 警告改每隻怪一條（41→12）。
- 工具：`anchored-tally.ts`、`sweep-before.jsonl`、`sweep-after.jsonl`、`sweep-sum.py`。

## 剩餘工作（後期精修）
1. anchored 實際命中 42：開局能傷巢母的只有不能瞄部位的 `arc-pulse` → 核心降 99，或給電弧系加可瞄部位的單體能力。
2. greedy anchored 0 勝：新營運路徑只出 4 場 anchored，先查派遣。
3. 營運出戰數減半（非裂縫出戰 169→83、勝 87→35）：疑撤得晚損失大；調門檻時一併跑 `anchored-tally.ts`。
4. 剩 10 場 timeout：多方局 7、badlands／dream-bed-burn／nest-core-assault 各 1；rift seed 1 盟軍第 8 輪撤。
只試過一組參數（首版即達標）。

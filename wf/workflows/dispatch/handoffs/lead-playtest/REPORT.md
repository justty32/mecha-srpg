# REPORT — lead-playtest：MCP 試玩第 1 輪、互動出戰、情境平衡（頂層代存，2026-10-24）

STATUS：**DONE（1 輪，依收尾令）**。commit `edc24dd`（互動出戰）、`ddc1836`（MCP 輸出修正、6 份試玩回報、問題表）、`963e103`（情境平衡）、`09e85e6`（收線）。問題表 [issues.json](issues.json)（45 列，狀態已標）；量測 `node wf/workflows/dispatch/handoffs/lead-playtest/sweep.ts --seeds 1,2,3,4,5`（約 20 分鐘）。

## 第 1 輪
| 試玩者 | 打法 | 場數 | 結果 |
|---|---|---|---|
| p1 | 認真打、小地圖 | 7 | 3 勝 4 平 |
| p2 | 守點／護送 | 6 | 6 平 |
| p3 | 激進突擊 | 6 | 1 勝 5 平 |
| p4 | 大地圖 | 6 | 2 勝 4 平 |
| p5 | 亂打找 bug | 約 4 | 全平；存讀檔與交錯推進 hash 一致 |
| p6 | 營運 seed 1／5 各約 2 潮月 | 13 出戰 | 8 勝 5 平 |
手打 25 場 6 勝 19 平（平手率 76%）。修正後 22 情境 seed 1–5 全 AI 平手率 76%→44%。根因：情境機體無武器、MCP 看不到目標。

## 修掉
- 互動出戰：`campaign_sortie_begin`（`sortieBattleSetup`）→ `battle_*` 親手打 → `campaign_sortie_finish`（同 UI `battleDone`、補完整事件）；另有 `campaign_sortie_cancel`、`campaign_sortie_preview`；出戰中擋其他營運指令。`sortie.test.ts` 證明全 AI hash 一致、手打 55 步存讀檔一致、擋下有效。
- MCP 戰鬥輸出：目標與進度、敵對判定、符號不撞字、出口不被迷霧蓋、地形效果、`damageIfHit`、盟軍與最後所見、小數與 id 外露、`cli.ts call` 不載整個 server。
- MCP 營運輸出：機庫狀態、look／board／help／talk 詳情、出戰預覽、戰果報告、市場／招募／研究清單、事件擋下時附選項。
- 情境 22 個（`skirmish-whitegloves`、`rift-edge-nest` 未動）：護送／斬首目標改單位 id（quarry-duel 曾把玩家燕鷗算目標）、補玩家落敗條件、大地圖部署相距 ≥10、人物不重複、75 台空手機換同家族有非傳統近戰型號（換機表 `cx-pt-scen/frame-swaps.json`）、調 convoy-runner、sniper-perch。
驗證：`npm test` 673/673、check／typecheck 0、黃金未變。

## 剩餘工作
1. 情境平衡第 2 輪：ISS-043 護送四情境太易；ISS-044 8 情境仍 5/5 平；ISS-045 120 場敵方只勝 2。`defaultLoadout` 填好後把 75 台換回原型號並給武器，再量。
2. 6 個新 AI 設定只調 2 個；護衛不開火待 AI 線。
3. 大地圖打一場 agent 成本高（每台每回合 6–8 次呼叫）。
4. `sortie.test.ts` 靠 greedy 找出戰點，應改固定指令序列。

## 下一輪建議
重打「已修／已調（待重測）」的重現步驟；4 名試玩者（認真 ×2、亂打 ×1、營運 ×1，營運者用 `campaign_sortie_begin` 親手打 ≥3 場）。

## 判斷：最大三個體驗問題
1. 戰鬥打不死人（缺武器內容、命中 14–40%）。
2. 營運開局兩極（有 opening 裂縫可刷；anchored 必平、船會被困）。
3. AI 不配合目標（護衛不開火、第三方只打盟軍、狙擊站原點）。

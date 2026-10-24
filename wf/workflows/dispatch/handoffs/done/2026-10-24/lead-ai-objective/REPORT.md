# REPORT — lead-ai-objective：AI 目標意識、盟軍配合、技能形態缺口（頂層代存，2026-10-24）

STATUS：**DONE（anchored 對巢母勝率目標 ≥30% 未達，判定為內容／規則／營運問題）**。commit `96d0848`（stepAi）、`25b69c0`（目標意識）、`8f3d70e`（候選與評分缺口）、`08dd9ed`（試玩修正、eject 防護、文件）。工人 REPORT `cx-aio-{core,tactics,play}/REPORT.md`；量測工具 `battle-bench.ts`（凍結營運出戰重打）、`scenario-measure.ts`（用情境原輪數量測）。

## 完成度
| 項目 | 狀態 | 測試 |
|---|---|---|
| killTarget／殲滅優先指定目標與孵化源 | 完成 | `test/ai/objectives.test.ts`（16） |
| hold 進區佔區不離區、搶對方 hold | 完成 | 同上 |
| escort 往出口撤離、護衛不離太遠、攔截對方護送 | 完成 | 同上 |
| reachExit | 完成 | 同上 |
| 盟軍共享目標、不打死捕獲目標、不佔友軍出口 | 完成 | 同上 |
| `stepAi` 回合末多回 null | 完成（hash 不變） | `test/sim/step-ai.test.ts`（5） |
| line／cone、友軍範圍增益、sustained、捕獲價值、純減益估值、大血量加權、追擊可見目標（預設關） | 完成 | `test/ai/tactics-coverage.test.ts`（8） |
| ISS-005 車隊不動、ISS-013 踱步與護衛不開火、移動後保留出手 AP | 完成 | `test/ai/playtest-fixes.test.ts`（6） |
| 對無指令權單位 eject | 防護＋測試；重現在 HEAD 已不觸發 | `test/ai/eject-commander.test.ts`（1） |
| passive | AI 不提出；規則無執行入口 | — |
孵化源判斷：部位功能 `spawner`、單位 tag `spawner`、能力 tag `spawn`／`summon`。只讀公開地圖、目標與視野內單位。新權重在 DEFAULTS，可由 aiprofile `params` 覆寫。

## 數字（乾淨 worktree、同內容）
| 量測 | 改前 | 改後 |
|---|---|---|
| greedy 營運 seed 1–5 anchored 勝場 | 0/20 | 0/20 |
| greedy 全年勝-敗 | 21-31 | 32-23 |
| 凍結 15 場 anchored 對巢母命中 | 18 | 50 |
| 24 情境×5 seed 全平手情境數 | 17 | 8 |
| rift-edge-nest seed 1–5 | 4 勝 1 敗 | 5 勝 |
| 效能 ms／步 | 約 3.1 | 3.1–3.8 |
`npm test` 674/674；本線新增 36；黃金不變。

## 判斷
- anchored 打不贏：巢母核心 370 HP、全身約 1580、8 部位等機率；開局兩台電弧每發 21 打不死；seal 守區＝敵方部署區整欄被巢母佔著；核心命中 ×6 對照仍 0 勝。
- 原 15 敗中 10 場是營運派遣：greedy 連敗後仍派單台殘機、士氣崩潰乘員。
- 規則缺 `tether: dieWithParent`（母死子蟲同死）。
- 收尾時在主工作樹誤下全樹 `git stash` 並立即 pop；檔案完整，但 pop 不還原 index。

## 需要決定（頂層 2026-10-24）
1. anchored → 採 (b) 實作 `tether: dieWithParent`（交 lead-gaps-battle）＋(c) seal 守區不用整欄部署區（交 lead-gaps-ops）；判準：開局兩台 20 輪內打完錨的期望命中數 ≤ 40。
2. greedy 不派士氣崩潰乘員或單台殘機 → lead-gaps-ops。
3. `objHunt` 預設維持關閉。
4. sustained 主動關閉 → 引擎待辦。

## 剩餘工作
- swarm 整場不動：`src/ai/policies/swarm.ts` 在 `proposeTactical` 截斷後才篩母體距離 → 改在 `tactical.ts` 截斷前套距離（測 `scenario/convoy-run` enemy-2 (62,8)、enemy-4 (70,7)）。
- 未交戰時退回中央停住：`score.ts`／`tactical.ts` 比較可見目標、`knowledge.lastSeen`、回退中央三者（重現 tidal-flat-evac、quarry-duel seed 1；補「不讀隱藏位置」測試）。
- 範圍能力的保留 AP 站位未做（`tactical.ts` 補格段）。
- eject 再現時先查是否步兵（`frame/infantry` 亦回 no-commander）。
- unbound-raid 第三方只打 ally：站位造成，需改情境佈局。

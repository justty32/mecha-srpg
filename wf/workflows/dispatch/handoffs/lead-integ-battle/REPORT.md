# REPORT — lead-integ-battle（2026-10-24，頂層代存領導匯報）

STATUS：DONE。`npm test` 372／372、約 6 秒（開工 318、21 秒）。commit：`4226950`（效能、有限輪、逐步 API）、`61cecf1`（`sim:campaign`）、`863cf4c`（正式出戰入口、重播不重跑）、`a9a33fc`（hold 佔敵方部署區、greedy 不派殘機、巢母孵生冷卻 3）、`457a813`（收線文件）。子線 REPORT：`cx-ib-{perf,term,step,entry,tune}/REPORT.md`。基準工具：`node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500`。

## 為何打到步數上限
開局機甲沒武器；無駕駛員怪獸 accuracy 0 → AI 估 0 傷害不攻擊；hold／escort 永不完成；ops 情境無輪數上限。慢：AI 預覽深拷整個狀態（含事件日誌）、尋路每步重排佇列。

## 效能
| 項目 | 前 | 後 |
|---|---|---|
| bench-ops 500 步 | 38.7 ms／步 | 2.5 ms／步（hash 不變） |
| skirmish seed 1（20 輪） | 20.4 s | 1.3 s |
| ops 出戰一場 | 數分鐘 | 0.6–1.2 s |
| rift-edge-nest（20 輪） | 157 s | 14 s |
| ops greedy 12 潮月 | — | 2.5 s |

## 撤離修正後 ops greedy
撤離：士氣崩潰／逃跑立即撤；否則需「已交戰」「第 3 輪後」「戰力比 < 0.5 或受損 ≥ 35%」（aiprofile 可調）。部署 x=1..2、撤離 x=0。seed 1–5、7 首戰全敗（6–11 輪），第 3 潮月剩 0–1 人。原因：獵犬機砲為傳統兵器、打怪獸一成傷害、整場 4 槍；薪水每日 35、首約 400。

## 入口
(a) `UnitInit` 可選欄：部位損傷、人物現況、控制模式、效果；(b) `BattleResult.events`；(c) `scenarioToSetup` 吃內嵌地圖與人物，刪 `ctx.db` 疊加；(d) `src/sim/session.ts` 逐步 API（`stepAi`，全 AI 與 runBattle 同 hash）；(e) hold＝區內有己無敵連續 N 輪末（缺區域用敵方部署區）、escort＝被護送者全撤或站出口且存活。重播不重跑：出戰紀錄存戰果與營運亂數狀態，測試證明 runner 呼叫 0 次。

## 黃金
規則黃金 6、ops 黃金戰役不變。skirmish seed 1 `0613183bba2e5c5f`→`8f41a98a49c552af`（自施必中＋撤離門檻）；rift-edge-nest seed 1 `557222e7086ecfc5`→`45ff3b39ab6696cf`（怪獸命中、孵生冷卻）。

## 判斷
- 損傷正確帶入後出現退化迴圈（殘機＋無區域 hold 假勝），已修；現在的全敗比之前的「勝」誠實。
- 巢母孵生冷卻 3 為領導判斷（spec「囊口鼓起」是有預兆的意圖）。
- AI 預測狀態副本只保留兩種歷史事件（人物死亡、控制權變更）；規則若改讀別種歷史事件要同步改。
- 蟲族未見敵走到中央就停；存檔含完整戰果會變大。

## 需要決定（頂層 2026-10-24 處理）
1. 營運平衡 → 派線，判準 greedy seed 1–5 首戰 ≥ 2 勝、第 3 潮月人數 > 0。
2. 補彈 → 頂層定：入港自動補、按市價扣帳。
3. hold 核區暫用敵方部署區、輪數用完回「無勝方」→ 交規劃線確認。
4. scratchpad 7 個 git worktree → 問使用者。

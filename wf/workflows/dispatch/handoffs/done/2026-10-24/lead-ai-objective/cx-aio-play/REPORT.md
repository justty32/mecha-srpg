# cx-aio-play：AI 修正完成，固定六條驗收已取得沙箱內證據

## 做了什麼

親讀 AGENTS.md、交接書點名的 wf 規矩、core／tactics REPORT；依固定六條驗收工作，沒有 commit、沒有改內容或規則。上線及階段回報均走 inbox_mail --up。

flee 改以目的地相對現在位置的敵人距離、危險與出口距離差評分；保留 fleeRetreat 撤離。takeTurn 新增 params.maxPureMoves（預設 1、向下取整且不小於 0），成功純移動才扣額度，移動後出手候選不扣。依 orders「scripted 衝突」裁定，只限 tactical／sentinel／swarm，scripted／flee／berserk 不受限；其他測試檔未改。End 在沒有其他有限正分行動時才參與選擇，避免固定 0.01 壓過微小但合法的攻擊。

依 orders「補充（情報＋收尾）」加一條 AP 測試：tactical 除原候選外，最多再補 maxMoves 個移動成本最低、在單體攻擊射程／視線內的格子，仍經真規則預覽與 checkAbility。已有合法攻擊位置時，剔除無法出手的純追敵移動；有正向護送／守區等任務進展的移動仍保留。此例外避免護衛為了原地開火放棄車隊。尚未能進射程時維持前進。

根因表：

| 問題 | 根因與證據 | 歸屬 | 處置 |
|---|---|---|---|
| flee 不動 | 距出口 33 格，絕對負分遭選擇器剔除 | AI | 改進展分 |
| 同回合踱步 | ally-0 首輪由 (50,8)→(44,9)→(47,8)，重新評分可抵銷前一步 | AI | tactical 家族純移動額度 |
| 護衛射程內不開火 | 第 2 輪 ally-0 合法射擊 0.0017483，低於 End 0.01 | AI | End 改為退路 |
| 移動耗光 AP | 舊候選偏向貼敵格；測試剩餘 AP 不足，舊 AI 失敗 | AI | 補省 AP 射擊格並篩純移動 |
| 第三方偏向 | 首輪全指定 enemy-2；ally 走到 third 身旁；交換 owner 標籤分數相同 | 站位／內容 | 不加陣營偏置 |
| 部分敵軍不動 | 原配置 swarm 截斷後只剩 wait/end/eject；新配置已有移動 | AI 策略限制 | 見剩餘工作 |

根因原始證據為 /tmp/cx-aio-play/diagnose-before.log、swarm-before.log；診斷時沒有改動內容或規則。

新增測試 6 條：遠出口前進及危險差、出口撤離、純移動額度及組合攻擊例外、護衛微小正收益射擊、第三方 owner 對稱、接敵保留 AP。反證：同一工作樹載入開工 AI 快照有 4 fail；記憶體 mutation 將 fleeRetreat 歸零、對 ally 乘 100 得另外 2 fail；聯集涵蓋全部 6 條，各反證程序 exit 1。

目前工作樹直接執行 AI／sim：124 pass／0 fail；npm run typecheck exit 0。同時刻 anchored 對照為 15 場、0 勝、ownLost 1→1；bench 同時刻對照 10.97→9.56 ms／步；正式開工 3.48，完成複測 3.81（≤5.22）。第一次完成量測 9.56 高於開工門檻，因此降低同時量測負載後重測；保留兩次結果與相同 hash，沒有拿舊輸出冒充完成值。skirmish seed 1–5 Wait 全 0，rift seed 1–5 均 player／survive；sweep 開工／完成皆 24 情境 × 5 seed，程序 exit 0。原始證據均位於 /tmp/cx-aio-play/；同時刻新舊 AI 對照使用 comparison/ 的內容與非 AI 原始碼快照，before-loader.mjs 只替換開工 AI，不碰工作樹其他線。

<!-- measurements:start -->
量測表（P＝player、E＝enemy、T＝third、D＝平手；sweep 每情境 5 seed）：

| 量測 | 開工 | 完成 |
|---|---|---|
| badlands-sweep | D5 | D5 |
| beachhead-landing | D5 | P5 |
| beast-stampede | D5 | D1、E1、P3 |
| breach-defense | D5 | D5 |
| convoy-run | D5 | P5 |
| crater-three-way | D5 | D5 |
| delta-four-way | D5 | D5 |
| dream-bed-burn | D5 | D5 |
| glade-spore-hold | D5 | D5 |
| hive-burrow-clearing | D5 | P5 |
| lunar-blockade-run | P5 | P5 |
| mirror-choir-vigil | P5 | P5 |
| mirror-survive | P5 | P5 |
| nest-core-assault | D5 | D1、P4 |
| overpass-wager | D5 | D4、P1 |
| quarry-duel | D5 | D3、P2 |
| rift-edge-nest | P5 | P5 |
| rival-claim-jump | D5 | D5 |
| shell-excavation-escort | D2、P3 | P5 |
| siege-beetle-convoy | D2、P3 | P5 |
| skirmish-whitegloves | D5 | D5 |
| tidal-flat-evac | D5 | P5 |
| unbound-raid | D5 | D4、E1 |
| waste-encirclement | P5 | P5 |
| skirmish Wait／勝方 | 1:0/D；2:0/D；3:0/D；4:0/D；5:0/D | 1:0/D；2:0/D；3:0/D；4:0/D；5:0/D |
| rift 勝方 | 1:player；2:player；3:player；4:player；5:player | 1:player；2:player；3:player；4:player；5:player |
| anchored 勝場／ownLost | 0/15；1 | 0/15；1 |
| bench ms／步 | 3.48 | 3.81 |

撤離驗收（seed 1；前→後為距最近出口距離）：
convoy-run：convoy-0 移動 36 步，33→0，retreated；convoy-1 移動 36 步，33→0，retreated。
tidal-flat-evac：convoy-0 移動 16 步，15→0，retreated；convoy-1 移動 16 步，16→0，retreated。

正式證據：sweep-before.log、sweep-final.log；skirmish-opening.log／skirmish-final.log；rift-opening.log／rift-final.log；anchored-opening.log／anchored-final.log；bench-opening.log／bench-final-recheck.log；convoy-final.log；ai-sim-final.log；typecheck.log；tests-red-before-final.log／tests-red-mutation-final.log。anchored-control.log、bench-control.log 與 frozen-loader.mjs 為同時刻控制組。先前暫存版本及探索輸出不作最終驗收值。
<!-- measurements:end -->


固定六條驗收結果：

1. 新增 6 條測試全過，開工 AI 4 fail 與記憶體 mutation 2 fail 覆蓋全部反證。
2. AI／sim 124 pass／0 fail，typecheck exit 0；沙箱外由領導按約重跑。
3. convoy-run 兩台各 36 步、33→0；tidal-flat-evac 兩台各 16 步、15／16→0。
4. skirmish 五 seed Wait 全 0；rift 五 seed winner 均 player；anchored ownLost 開工 1、完成 1，同時刻控制組亦為 1。
5. bench 完成複測 3.81 ≤ 開工 3.48×1.5＝5.22 ms／步；兩份完整 sweep 輸出已存在並摘入上表。
6. 本 REPORT 有四段、根因表與量測表。

## 產出（檔清單）

共 5 檔，未超過 8 檔 gate，diff 加新增檔約 22 KB，低於 50 KB gate：

- src/ai/agent.ts
- src/ai/policies/flee.ts
- src/ai/policies/tactical.ts
- test/ai/playtest-fixes.test.ts
- wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-play/REPORT.md

## 沒做到或證據不足的

沙箱外 AI／sim 與 typecheck 依交接書由領導重跑。本線未宣稱沙箱外已驗收。

剩餘工作：原配置 swarm 在 proposeTactical 截斷 maxMoves 後才篩 leash，可能失去半徑內可行候選；若後續處理，應在 src/ai/policies/swarm.ts 呼叫前傳入移動約束、由 tactical.ts 在截斷前套用，並以原 convoy-run enemy-2=(62,8)、enemy-4=(70,7) 做候選測試。本線沒有 swarm.ts 寫入授權，已寄領導具體證據。

「未交戰時不往回退縮」尚未做一般性規則改動：原情境 enemy-0 有往出口攔截的目標加分；新內容中敵人失去可見目標後會靠近地圖中心再停，並非一律是撤退。後續若改，應先在 score.ts／tactical.ts 對比可見目標、lastSeen 與中心回退的重現，再加不追讀隱藏位置的測試。不能只用走路方向斷言退縮。

開工與完成之間內容線改過敵軍站位、內建武器與 AP，sweep 差異不全歸因本線（例如 badlands 上限從 20 輪改為 30 輪）。補射擊格目前以 unit target 為主；範圍能力仍使用既有合法候選。

## 需要決定的事

領導負責沙箱外複驗、commit，以及上述剩餘工作的後續範圍；本線不擴張固定六條驗收。

以後交接書該點名的工具：Node registerHooks（同時刻工作樹對照與記憶體反證）；node --test --test-isolation=none（取得實際測試計數）。

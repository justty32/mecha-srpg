# acceptance-playtest — 每批內容的驗收清單與 MCP 試玩規程

[content README](README.md)｜MCP 工具 [src/mcp/README.md](../../../src/mcp/README.md)｜試玩說明範本 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/playtest-brief.md`｜基準表 [playtest-baselines.json](playtest-baselines.json)（6 列：D／C／B／A／S／營運）

## 一、每批驗收清單（REPORT 逐條附證據）

1. `npm run check | tail -1` → `OK 0 errors`；碰 world 另 `node src/ops/content/check.ts content/base | tail -1`；碰 lore `node content/lore/check.ts` 0 錯。
2. `npm test 2>&1 | tail -3` 無新 fail；`git status --short test/golden src/ops/sim/fixtures` 空（黃金不變）。
3. `npm run typecheck` 過（schema 由型別產生，內容不該讓它變；變了＝改到 src）。
4. 數值帶：每個新單位／能力列一行「指標＝值（帶內／帶外＋理由）」。
5. 風格：禁用詞 grep 0 命中（`grep -rn '電磁\|口徑\|毫米\|電池\|雷達\|衛星\|飛彈\|坦克\|戰鬥機' <你的檔>`）；每個效果有 `ui.badge`。
6. 自動對戰煙霧（下節）0 THROW、能力覆蓋 ≥ 2/3、無永不結束局。
7. MCP 試玩（第三節）量測落門檻內，或寫明例外。
8. 件數與容量：一批 ≤ 20 檔、每檔 ≤ 16 KB（bodyplan 可到 24 KB）。
9. commit 只含你的路徑；`git show --stat HEAD` 貼進 REPORT。

## 二、自動對戰煙霧（不改 repo 的 scratch pack 作法）

**建包**：在 scratchpad 建 `pack/pack.json`＝`{"id":"smoke","version":"0.0.1","depends":["base"]}` 與 `pack/scenarios/*.json`；跨包引用寫全 `base:` 前綴（`"map":"base:map/rift-edge-60"`、`"monster":"base:monster/reaper-c"`）。

**兩種情境**：野怪場——敵方放你每個新 monster 至少一隻，玩家抄 `scenario/rift-edge-nest` 四台＋駕駛員並用 `components` 配好武器；我方場——玩家放每台新 frame／bio frame 各一、`person/chen-xiaohai` 座 pilot，敵方 `base:monster/reaper-c` ×3。古代機用 skirmish-whitegloves 把玩家一台換掉。

**跑法**：`node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/sweep.ts --content content/base,<pack> --seeds 1,2,3,4,5 <scenario id…>`，每情境一行 JSON（勝方分布、輪數、死亡、hash）。看能力有沒被用：`node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ai-objective/scenario-measure.ts <scenario> 1 2 3`，或自寫 runner 統計 `AbilityUsed` 事件的 ability id；單步查評分用 `getPolicy("tactical").propose/score`。

**判準**：5 seed 0 例外（任一 `error` 即不過）；每個新能力至少 1 次 AbilityUsed（反應技例外）；不得出現 5/5 timeout 且雙方 0 死亡（＝打不到，查配裝／部署／射程）。

## 三、MCP 試玩規程

**連線**：`D=<scratchpad>/<線名>; mkdir -p $D && cd $D; node <repo>/src/mcp/cli.ts serve --socket s.sock`（背景、路徑要短），之後 `node <repo>/src/mcp/cli.ts call --socket s.sock <tool> '<json>'`；只用自己的 socket，收工 kill 自己的 pid。輸出長用 `| head -c 4000`。

**工具**：`battle_new {scenario, seed, rounds?}` → `battle_observe {id, map:true}`（看 objectives／單位／地形圖例）→ `battle_legal_actions {id}`（每項附 `action`、命中率、`damageIfHit`）→ `battle_act {id, action}`；全 AI 對照 `battle_auto {scenario, seed}`；`battle_events` 查能力使用。營運：`campaign_new {seed}` → `campaign_actions` → `campaign_sortie_preview`／`campaign_sortie_begin` → 戰鬥 → `campaign_sortie_finish`；長程 `campaign_auto {seed, months:6, policy:"greedy"}`。

**打誰**：照 playtest-baselines 該級的基準摹機／怪獸／情境；新內容替換進基準情境的對應位置（新 C 摹機替掉 rift-edge-nest 的一台 moji-tern-guard；新 C 怪替掉 reaper-c），其他不動——一次只變一個變數。

**量什麼**（每場記一行：scenario、seed、rounds、winner、reason、我方損失、敵方損失、新能力使用次數、是否被 AI 使用、手打或 auto）：
- 勝率＝有勝方的場次中玩家勝／總場；平手率＝timeout／總場；輪數中位。
- 能力使用：`battle_events` 過濾 `AbilityUsed`＋能力 id；0 次＝AI 不用（查 tactics 鍵、costs、range）。
- 預估傷害：`legal_actions` 的 `damageIfHit` 對該級怪獸 HP 的比例（單發 ≥ 總 HP 8% 才有存在感；凡兵對獸 ×0.1 後 <2 是正常）。
- 營運：greedy 6 潮月 30 seed 存活數、第 3 潮月現金、事件每月跳出數、首潮月出戰次數。

**什麼算失衡**（細表在 baselines）：同級對打 5 seed 單方全勝；對基準怪獸勝率 <30% 或 >90%；平手率 >40%；新能力 0 使用；某單位 5 場 0 次被打（AI 不看它）；一招佔該單位 >80% 出手（其他招死資料）；營運存活 <24/30、單事件 ±>600 現金。

**怎麼調**（一次一個旋鈕、每次 5 seed）：① 先排除非數值原因——空手、部署太遠、射程不到、tactics 鍵錯、目標寫錯；② 命中／AP 成本（最敏感、影響最小）；③ 單發傷害 ±15%；④ cooldown／usesPerBattle；⑤ HP ±10%（最後動，動了要重看同族其他級）；⑥ 情境層：單位數、部署距離、輪數。調完回填數值帶對照，超帶寫理由。**不要**為了過門檻去改基準單位或 AI 參數。

**時間預算**：一批內容 60–90 分鐘、工具呼叫 300–450 次內；打不完的場記停在第幾輪＋同 seed `battle_auto` 對照。

## 四、回報格式

REPORT 固定四段：做了什麼（件數表）、驗收九條逐條證據、平衡表（每場一行＋失衡判定＋調了什麼）、需要決定（引擎缺口、數值帶要改、與 lore／spec 衝突）。問題照 lead-playtest 的類別碼（rule-bug／ai／balance／info／content／text／tool-bug）＋嚴重度 S1–S3，附重現步驟（情境、seed、第幾輪做什麼）。

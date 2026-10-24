# cx-ops-fix — 三項營運死局與追加 orders 完成

STATUS：DONE。原交接書五條驗收與領導 orders 的追加測試已執行；整體 npm test 尚有交接書允許列外的其他線紅燈，詳第三段。未 commit、未重產黃金 hash。

## 做了什麼

ISS-033：原回寫用「錨死亡」判斷 opening 先鋒是否殲滅，但 opening 戰場不出錨。改為實際裂縫仍 opening、玩家取得 eliminate 勝利時呼叫既有 vanguard-killed→closed；eliminate 採戰鬥層判定，涵蓋死亡、撤離與活捕。關閉時也將同裂縫尚未接取的 offered 契約轉 expired，避免不同模板的舊快照再接一次；新 offer 原本就拒絕 closed。依據 battle-interface.md「三、戰果回寫」、data-model-world-map.md 的 opening→closed。保留實際 phase 檢查，舊 opening 快照不能關閉已 anchored 的裂縫。

ISS-031：採交接書第二方案。適用航路全部因蝕化封鎖時，僅船目前節點的向外邊可走，仍按既有航程付燃料；遠端深蝕邊不開放。途中被蝕化仍可完成離開該節點的一段。依據交接書明授的出口及 time-and-tick.md 的自由改道／燃料約束；標記節點版 SPEC-GAP，未遷移方格地圖或改燃料數值。

ISS-030：winner=null 且 reason=timeout 時，期限內契約保持 active（多段維持 stage），耗損照常回寫，不跑失敗效果、不判裂縫失守。可重打、drop，逾期沿用失敗結算。只 patch 追加 ContractState.consecutiveDraws?，非平手歸零、同 sortie 重放不重計；greedy 同契約連續兩平手就 drop。依據交接書頂層裁定與 data-model-factions-contracts.md 的取消／時限規則。未改戰鬥規則、AI 或敵軍強度。

領導 orders 13:07:32：greedy 排除 employment.mood < 0 的乘員，對齊 scenario.ts 的 morale-shaken 注入門檻。僅一台可派機時，任一部位毀損／缺失或任一結構層 HP ≤ 50% 最大 HP，就等待修理；修理排程仍先執行。50% 為領導授權自行定義的政策門檻，merc 直接出戰不受此篩選影響。

領導 orders 13:08:10：所有 trigger 的敵人頭數只認 owner=enemy。非 sortie.units 的玩家護送單位不回寫、不回收屍體／loot，也不能冒充死錨。敵人活捕後轉 owner=player 的拘束艙與拔錨流程保留。

領導 orders 13:15:20：非裂縫契約的 greedy sortie 省略 rift 欄位，避免 rift:undefined 經 JSON 往返消失。effects.owner 的 undefined 來源是 src/rules/effects.ts 的 location 組裝（約第 67–72 行），不在 policies.ts，依指示只記錄、不越界修改。

## 產出（含完整檔案清單）

程式共 8 檔，約 21.3 KB diff，未達 10 檔／40 KB gate。共享 types.ts 的其他變更屬別線；本線只追加 consecutiveDraws 可選欄。

- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/apply.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/apply.test.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/rifts.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/travel.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/travel.test.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/state/types.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/policies.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/policies.test.ts
- /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-fix/REPORT.md

所有臨時工具、原始測試與量測輸出均在 /tmp/cx-ops-fix/。平手契約狀態／計數、裂縫關閉／撤單、航路與政策選擇都會改變 campaign hash，領導須收線後統一重產。

### 先紅後綠證據

直接執行測試檔取得斷言，未把沙箱檔級摘要當子測試數。ISS-033 原為 opening、預期 closed；ISS-031 原 no-route、預期 ok；ISS-030 原 failed、預期 active，三次皆 exit 1，修後皆綠。證據 iss{033,031,030}-{red,green}.log。

最後 seed 5 量測又抓到「首勝已 closed，但另一張舊 offered 仍可接」；補同裂縫第二張契約至既有測試，原 offered／預期 expired，exit 1，修後綠（iss033-stale-offer-{red,green}.log）。同測試涵蓋先鋒 dead／retreated／captured；撤離案例也曾先紅後綠（iss033-eliminate-{red,green}.log）。

orders 的士氣與單機測試原都錯派 sortie，護送測試原多計 escort-0 一頭，各先紅後綠（policy-orders-{red,green}.log、escort-{red,green}.log）。最終 apply 6/6、travel 3/3、policies 5/5，共七條新增測試；其中另有同契約兩平手 drop 測試。

### 12 潮月改前／改後

均跑至 day 336。最初改前 CLI 與摘要在 before-seed{1,5}.log／before-seed{1,5}-stats.json；最終 CLI 在 settled-{greedy,idle}-seed*.log。探針 probe.ts 使用真實 runCampaign／runner、onDay 逐日統計與命令戰果；最終 seed 5 詳 settled-seed5-stats.json。

seed 1：原 2 場（0 勝、0 敗、2 平）→政策修後 4 場（3 勝、0 敗、1 平）；第 3 潮月現金／人數 −20／5→5505.32／7，第 12 潮月 −20／0→−422／0。最長同節點停留 264→332 天，蝕化無出口 253→0 天。

seed 5：原 16 場（9 勝、6 敗、1 平）→最終 12 場（11 勝、1 敗、0 平）；第 3 潮月現金／人數 24900／7→30154.84／7，第 12 潮月 20490／7→14440.84／7。同 opening 裂縫勝場上限 6→1：最終 rift-58 在 day 34 唯一勝場，opening→closed，此後無第二張同裂縫勝場。蝕化無出口最長 295→0 天；一般停留 320→284 天（吉大港 day 53–336）。

「蝕化無出口」定義為當日不存在任何其他節點的 shortestPath，與一般停留分開；不把有路但缺油、無人或政策等待混稱蝕化封路。core／全鄰路蝕化狀態下的合法 cmdSail、實際抵達與燃料帳本另由測試驗證。多線同時修改共享工作樹，月摘要含 board／encounter／debt／war／AI 變動，不是本線隔離 A/B，不能把勝負與經濟差異全歸因本線。

領導追加的 greedy seed 1–5 政策前後量測如下；勝／敗／平只算有 BattleResult 的場次。原始檔 policy-{before,after}-seedN-stats.json；seed 5 最後撤舊單後另重測為相同勝敗平總數，詳 settled-seed5-stats.json。

| seed | 政策改前 勝／敗／平 | 政策改後 勝／敗／平 |
|---|---|---|
| 1 | 3／17／1 | 3／0／1 |
| 2 | 3／1／0 | 3／0／1 |
| 3 | 5／1／0 | 5／1／0 |
| 4 | 7／11／1 | 6／0／1 |
| 5 | 4／20／1 | 11／1／0 |

已用指定 battle-bench.ts --capture 對 seeds 1–5 擷取政策改前戰場；exit 0，共 297 次出戰嘗試快照，存 policy-before-frozen.json，輸出 policy-before-bench.log。快照含未取得 BattleResult 的嘗試，不能把 297 當完成戰鬥數；勝敗統計以上述真戰果探針為準。

## 沒做到、或證據不足的

原交接書固定五條驗收；只另執行領導 orders 明授的追加測試／量測：

1. npm run typecheck：最後 exit 0，typecheck-settled.log。
2. 三項各有新測試與改前紅燈，修後全綠；追加三項亦先紅後綠。
3. npm test：已執行，exit 1。最後沙箱摘要 128 檔、122 pass／6 fail（不是子測試數），npm-test-settled.log。ops 剩 crew/crew.test.ts（他線招募候選去重後，舊測試挑到異地候選而 not-docked）、sortie/entry.test.ts（effects.owner.part/layer:undefined 經 JSON 往返被省略，來源 src/rules/effects.ts）、sim/golden.test.ts（本線與其他線共同改變 hash，交接書明示免重產）。非 ops 另 mcp/{campaign,cli,e2e}.test.ts 三檔紅。本線新增測試無紅燈；其他線失敗已報領導。先前 rifts、scenario、debt、war-invariants 紅燈已不在最後名單。
4. node src/ops/sim/cli.ts --months 12 --policy greedy --seed 5，另 seed 1：最後均 exit 0／OK。同 opening 裂縫勝場上限 1，蝕化困船連續天數 0；一般停留仍可能 ≥28 天，未宣稱政策會定期移動。
5. node src/ops/sim/cli.ts --months 12 --policy idle --seed 1：最後 exit 0／OK。

未執行交接書與 orders 之外的 check／wf-lint／額外模擬矩陣。失敗檔單跑只為定位該次 npm test；後續重跑均因實作修正或別線已修先前錯誤。沒有拿舊輸出冒充最後結果。

## 需要決定的事

本線無待裁定設計。請領導收線時處理其他線整合紅燈並統一重產 ops 黃金 hash。本線未還原任何別線改動。政策長期等待與團隊存活率仍需另案處理；「蝕化無出口」已解除，不能等同任何原因的同節點停留都消失。

以後交接書該點名的工具：node <測試檔>.test.ts（沙箱只回檔級摘要時看斷言）、runCampaign({onDay})＋命令 battle 記錄（CLI 月摘要不足以判重複勝場／困船）、battle-bench.ts --capture（注意包含失敗出戰嘗試）；既有 inbox_poll／inbox_mail 與指定 CLI、npm 指令。

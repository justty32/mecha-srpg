# cx-ops-retreat：撤退結局營運回寫完成（DONE）

## 做了什麼

新增純分類函式 `classifyOutcome`，回傳 `{ outcome, killRatio }`。戰果事件記錄分類及死亡比例，契約、裂縫與參戰回寫共用分類。清剿擊退仍結案，總報酬按 `0.6 + 0.4 × killRatio` 計算，再扣已付預付款；其他契約全額。撤退與 timeout 共用原有 `consecutiveDraws`，greedy 連續兩次仍會放棄，無須改 policies.ts。

| 分類 | 普通契約 | 裂縫／作戰 |
|---|---|---|
| win | done，原報酬 | 原勝利路徑 |
| repelled | done；clear 按死亡比例，其餘全額 | opening 關閉；anchored 延後擴張；seal／defend 守住 |
| withdrew | 保留可重打，連續計數 +1；逾期失敗 | 守裂失利；所屬勢力撤退按作戰受挫處理 |
| lost | 原 failed／明示 partial 路徑 | 原敗北路徑 |
| timeout | 保留可重打，連續計數 +1；逾期失敗 | 裂縫不變，作戰維持既有敗北分支 |

anchored 的合理規則：保留錨與 phase，跳過最近一次待處理大潮，將 nextCheck 設至其後的大潮；同個潮段重打不疊加。錨死亡／捕獲優先走原 unanchored 路徑。測試實際推到被跳過與再下一個大潮，確認只停一次。

作戰以玩家選邊換算：發起方撤退（玩家在 actor 側 withdrew，或在 target 側 repelled）回退進度 0.2、該分遣隊 morale −1，再用現行 terminalPhase（含 morale ≤ −2）結算。防守方撤退則扣防守軍士氣，發起方依原勝利路徑推進。雙方關係經 changeRelation −1。join 仍在作戰終局依玩家所站的邊結算，不因單場戰鬥提前付整場作戰的款。

讀的是規則線哪個欄位：實查 `git log --oneline -- src/rules src/sim src/core`（最新規則提交 6d6d450），並讀工作樹 flow.ts；目前沒有正式撤離欄。優先讀可選 `withdrawn: string[]` 的 player／enemy，及 reason `withdrew`／`repelled`；否則依 enemy 的 dead／retreated、出戰編隊（含 player-N 對位）推斷，最後看 winner／timeout。作戰另讀 ally 撤離及 force/friend 的單位狀態。可選欄與舊格式均有測試；未更改 rules 型別。

第 5 點：已讀領導 13:21:04 放行 order。指定 contracts、templates、src/ops/text 無「全殲／殲滅」文字，因此沒有內容文字可改；10 處 eliminate 均為目標 kind，依契約保留。

## 產出（含完整檔案清單）

本線程式 7 檔、內容 1 檔，程式差異 21,527 bytes（相對開工快照，含新增測試），未超件數／容量 gate。所有路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

- `src/ops/sortie/outcome.ts`
- `src/ops/sortie/outcome.test.ts`
- `src/ops/sortie/retreat.test.ts`
- `src/ops/sortie/apply.ts`
- `src/ops/contracts/tally.ts`
- `src/ops/world/rifts.ts`
- `src/ops/war/merc.ts`
- `content/base/world/services/retreat.json`
- `wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-retreat/REPORT.md`

固定五條驗收（不增加 gate）：

1. 型別／內容：`npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` exit 0、0 errors／34 warnings。
2. 新測試：outcome 1 條＋retreat 10 條全綠；改前整合 2 pass／8 fail，詳見下段。
3. `npm test`：125 pass／6 fail（沙箱檔級）；營運層只有黃金檔與可在開工快照重現的 entry 舊錯，無本線新紅燈。
4. 五組 CLI：greedy seeds 1–3、merc seed 1、idle seed 1 全部印 OK。
5. 指定三個文字路徑 `grep -rn "全殲"` 零命中（grep exit 1 代表未找到）。

新測試直接以 node 執行取得逐條結果。改前分類模組未建立，測試因 ERR_MODULE_NOT_FOUND 失敗；整合測試原本 win／timeout 已綠，其餘擊退報酬、撤退保留、裂縫與兩側作戰受挫共 8 條紅，改後 10 條全綠。日誌 `/tmp/cx-ops-retreat/{classifier-red,classifier-green,integration-red,integration-green}.log`。

CLI 日誌 `/tmp/cx-ops-retreat/{greedy-1,greedy-2,greedy-3,merc-1,idle-1}.log`。greedy 三個 seed 與 merc 都到第 12 潮月；merc 統計 joins 10、wins 17、losses 8、pay 15224.318181818182。idle 由既有 CampaignEnd 機制提前收場（最後月報為第 6 潮月），照 CLI 契約印 OK。

| greedy 12 潮月 | win | repelled | withdrew | lost | timeout |
|---|---:|---:|---:|---:|---:|
| seed 1 | 11 | 5 | 61 | 0 | 0 |
| seed 2 | 15 | 7 | 15 | 1 | 0 |
| seed 3 | 10 | 6 | 46 | 0 | 0 |

統計來自上述同次 CLI 執行的 BattleResolved.outcome。僅使用 `/tmp/cx-ops-retreat/count-outcomes.mjs` 的記憶體載入 hook，在 CLI 既有最終 events 後印計數，沒有改 CLI 檔案或另加模擬驗收。首輪收集器誤用 zsh 唯讀變數 status，導致收集器尾端失敗；上述 CLI 的 OK 與 npm test 的 TAP 完整摘要均已寫入日誌，沒有把收集器 exit 當成被測程式 exit。typecheck 與 content check 已使用修正的收集器取得實際 exit 0。

## 沒做到或證據不足的

npm test 六個紅燈：`src/mcp/{campaign,cli,e2e}.test.ts`、`src/ops/sim/golden.test.ts`、`src/ops/sortie/entry.test.ts`、`test/campaigns/campaigns.test.ts`；完整 TAP 在 `/tmp/cx-ops-retreat/npm-test.log`，依交接書不處理別線與黃金 hash。

entry.test.ts 直接重跑 6 pass／1 fail：第 108 行 JSON 回讀 blob deepEqual 不同，來自 acid-marsh 地形 effect.owner 的 part:undefined／layer:undefined 在 JSON 中消失；同檔營運重播 hash 測試綠。以本線修改前 apply／tally／rifts／merc 四個模組快照在記憶體載入重跑，仍是同一 assertion、同兩個 undefined 欄位、6 pass／1 fail。此為既存錯誤，未還原工作樹。對照日誌 `/tmp/cx-ops-retreat/entry-failure.log` 與 `entry-baseline.log`，已通知領導。

型別檢查過程曾遇 AI intent.ts 與 MCP campaign.test.ts 的別線錯誤，回報後均由別線修正；最後兩段 tsc 都 exit 0。

沒有 commit，沒有重產任何黃金 hash，沒有修改別線檔案。code map 與 spec 更新不在本線授權路徑，交領導收線時同步。

## 需要決定的事

無使用者決策。規則線若另定正式撤退欄位／reason，領導收線需告知確切名稱；目前可選 withdrawn 是相容接點，實際戰鬥使用 units 推斷。

以後交接書該點名的工具：`node <test-file.ts>` 可取得沙箱中的逐條 assertion 證據；`node:module.registerHooks` 可在不還原共用工作樹的情況下做開工快照歸因與同次 CLI 統計；zsh 收集 exit 請用專用變數（例如 retreat_exit），不要用唯讀的 status。

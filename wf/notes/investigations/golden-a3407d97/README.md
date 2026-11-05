# a3407d97 黃金改寫鑑定 2026-11-05

[investigations](../README.md)｜逐條表 [verdicts.json](verdicts.json)｜驗收基準 [verify-head-1105](../../../workflows/dispatch/handoffs/verify-head-1105/REPORT.md)

**問題**：10/29 `a3407d97` 未經使用者同意把 10/28 九條失敗的黃金／斷言改成實值；每條的行為改變是 (a) 預期內容／規則變更、(b) bug、(c) 測試脆弱？

**方法**：只讀 git，沒跑 node。讀 `git show a3407d97`、`00d74dfd:wf/…/expansion-1028/{STATE.md,test-comparison.json,test-failures.json}`、`a3407d97:wf/…/lead-playable-1029/{REPORT.md,golden-changes.json}`、`git log de651549..c09b0269 -- src content test`。每條的原值、新值、肇因、證據、處置、最小測試都在 [verdicts.json](verdicts.json)（`wf-table/1`）。

## 關鍵事實

10/28 的 `test-comparison.json` 證明九條在**乾淨基底 `c09b0269`（10/28 13:33，三隊內容入庫前）就已全部失敗**；10/28 內容只再推動 wait（118→90）與 ops-relic 兩條軌跡。

黃金上一次重錄是 `de651549`（10/26 19:42）。`de651549..c09b0269` 之間碰到 src／content 的只有兩個 commit。`69924b05`（10/26 19:56）加第三刃營運勢力：`content/base/world/factions-ops/third-blade.json` 帶 `presence-board` tag，`src/ops/world/rep-gate.test.ts:124` 代表勢力 7→8，每日多發契約改變 RNG 消耗與 contract id；**commit message 自己寫「全套與戰役黃金待明天重錄」**，隔天沒人做。`8ba72b43`（10/27）內容擴充 32 frames、12 world models、10 monsters、10 species，影響市場／裂縫抽樣。

`a3407d97` 寫入的 campaign-hash、war-assault、leak、grid-actors、relic 五個新值，**與 10/28 實測值逐位元相同**（`test-comparison.json` 的 actual 欄）。所以 a3407d97 自己的引擎改動（aim／defense／part-hits／movement）沒有再動這五條營運軌跡；新值就是 c09b0269（relic 則是 10/28 內容後）的狀態。

今天 `902775f7`（配合 `13b4e37e` 開局事件移到第 0 日）又重錄 campaign-hash 與 merc-join，HEAD 的這兩個值已不是 a3407d97 的值。

## 判定摘要

| # | 測試 | 判定 | 處置 |
|---|---|---|---|
| 1 | campaign-hash | (a) | 追認 |
| 2 | ops-relic | (a) | 追認 |
| 3 | ops-war-assault | (a) | 追認 |
| 4 | ops-leak | (a) | 追認 |
| 5 | ops-merc-join（363→261、重錄 1087 行） | (a)＋(c) | 追認重錄 |
| 6 | ops-betrayal（改成受控 fixture） | (c) 語義改寫 | **使用者裁決** |
| 7 | grid-actors | (a) | 追認 |
| 8 | wait（==132 → <336） | (c) | **改測試** |
| 9 | socket CLI（EPERM） | 環境 | 不處置 |
| 附 | mcp campaign_act sortie（72 行） | (c) | 追認 |

**有沒有真 bug**：九條都沒找到產品 bug 的證據。hash 改變都是「天數不變、事件序列不變、只有事件數與 hash 變」，符合 RNG 抽取順序改變的特徵；wait 與 sortie 是斷言綁死軌跡（sortie 10/28 的真正錯誤是第 169 行 sail 回 `insufficient-fuel`，舊測試挑契約只看期限不看燃料）。

**wait 的 132**：是 `9e23317a`（10/26）記下的 seed 1 idle 政策下「駕駛員歸零」終局日；c09b0269 實測 118、10/28 內容後 90；a3407d97 之後的現值沒有印出來，**未查**。新斷言 `endDay < 336` 失去漂移偵測，但新增的 `completedDays`／`log.every(day<=endDay)`／`pendingTicks===0` 比原本更貼「長 wait 在終局當天截斷」的本意。

## 保留意見（沒跑 node，無法證明）

無法切分 69924b05 與 8ba72b43 各自推動了哪幾條；兩者都是內容／規則變更，判定不受影響。betrayal 新 fixture（`test/campaigns/golden-spec.ts:66-85`）能驗背叛結算（-40 聲望、黑名單，`campaigns.test.ts:35-38`），但**不再證明世界能自然產生背叛情境**；這是覆蓋面縮小，不是 bug。

## 建議

1. 追認 1～5、7、附；5 以 HEAD（902775f7）為準。
2. 6 由使用者決定接受受控 fixture，或要求回自然軌跡（`node test/campaigns/rerecord.ts ops-betrayal --dry` 找新的雙 muster 日）。
3. 8 改測試：保留新不變量，另把實際終局日記回斷言或註解，恢復漂移偵測。
4. 規則：改 faction-ops／world content 的 commit 必須同 commit 重錄黃金（69924b05 的欠帳就是這次九條的根源）。

## 最小確認測試（機器空檔時）

1～8：`node --test test/campaigns/campaigns.test.ts src/ops/sim/campaign.test.ts`（8 先臨時 `console.log(waitEnd)` 取現值）。9 與附：`node --test src/mcp/cli.test.ts src/mcp/campaign.test.ts`。切分肇因：在 `69924b05~1`、`69924b05`、`8ba72b43` 三個 worktree 各跑 `node --test test/campaigns/campaigns.test.ts`，看哪一步變紅。

# cx-ops-debt REPORT

STATUS：**FAILED**。債務機制與定點測試完成；固定 greedy 判準在 24／36 期均只達 2／5，未達 4／5。

## 做了什麼

新增每潮月最低償還、現金足額自動扣繳、欠繳聲望與四級催收、手動補繳／提前還本、還清開信貸與 `borrow`。二級扣押以市場最高可用機甲市值六成抵債，排除待出戰、契約借用與拘束艙引用，並清理座位、機庫、工作佇列；三級拒售與港費加倍會在欠繳回落後解除。`CampaignEnd` 出現後，長時間 `wait` 和 `runCampaign` 停在當日。

招募候選排除名冊及各池已用的 person def；同源 `mood` 只作用於 id 最小實例。舊招募測試改用合法 fixture，保留原「聘入成功」斷言。依上游新 orders，增加停機測試與只付息不罰對照。`runCampaign({continueAfterEnd:true})` 可在終局後繼續世界日結到目標日，改由 idle 選事件／等待，不再呼叫原政策；預設仍停在終局當日，兩模式均有測試。

## 產出（完整檔案清單）

程式 15 檔（原 12 檔 gate 由 13:18 上游 orders 放行 `sim/campaign` 與相應測試、停機所需 `time/tick`）：

`src/ops/crew/debt.ts`、`debt.test.ts`、`wages.ts`、`shared.ts`、`recruit.ts`、`crew.test.ts`；`src/ops/content/opseffect.ts`、`cond.test.ts`；`src/ops/state/types.ts`、`events.ts`；`src/ops/time/commands.ts`、`tick.ts`；`src/ops/world/market.ts`；`src/ops/sim/campaign.ts`、`campaign.test.ts`。程式 diff 約 35.7 KB，低於 50 KB gate。未 commit。

內容 5 檔：`content/base/world/services/crew.json`、`content/base/world/events/debt-demand.json`、`debt-collection.json`、`debt-ultimatum.json`、`content/base/world/templates/debt.json`。

### 固定判準：greedy 12 潮月，真實戰鬥

存活＝沒有 `CampaignEnd` 且名冊仍有 pilot；終局提前發生者以終局當日現金／債列為期末值。兩組在同版程式以 service 覆寫 `amortMonths` 依序實跑。

| 攤還期 | seed | 最大 arrears | 存活 | 終止日 | 現金 | 債 |
|---:|---:|---:|:---:|---:|---:|---:|
| 24 | 1 | 5 | 否 | 336 | -422.00 | 31432.99 |
| 24 | 2 | 5 | 否 | 308 | -364.34 | 31432.99 |
| 24 | 3 | 2 | 是 | 336 | -168.00 | 27783.00 |
| 24 | 4 | 1 | 是 | 336 | 385.86 | 26460.00 |
| 24 | 5 | 0 | 是 | 336 | 14440.84 | 24000.00 |
| 36 | 1 | 5 | 否 | 336 | -422.00 | 31432.99 |
| 36 | 2 | 5 | 否 | 308 | -364.34 | 31432.99 |
| 36 | 3 | 2 | 是 | 336 | -168.00 | 27783.00 |
| 36 | 4 | 1 | 是 | 336 | 385.86 | 26460.00 |
| 36 | 5 | 0 | 是 | 336 | 14440.84 | 24000.00 |

合格數：24 期 2／5、36 期 2／5；按規定保留 36。月息 5%＝開局 1200 幣，高於本金／24＝1000 與本金／36≈667，所以兩種攤還期實際最低額相同。

對照：同 seed 1–5 greedy 12 潮月，`onDay` 清掉欠繳紀錄／應繳簿記，保留每期付息、自動付款與戰鬥；**只付息不罰存活 3／5**（seed 3–5；seed 1、2 仍無 pilot），債務階梯沒有增加死亡局，但使 seed 3 最大欠繳達 2，失去資格。

### idle seed 1 階梯時間線（最終 36 期）

| 日 | 級 | 事件／結果 |
|---:|---:|---|
| 56 | 1 | `DebtDemand` 確認償還意願 |
| 84 | 2 | `DebtCollection`、扣押 `mech-10`，市值 1000、抵債 600 |
| 112 | 3 | `SeleneEmbargo`，拒售與港費 ×2 |
| 140 | 4 | `DebtUltimatum` 最後通牒 |
| 168 | 5 | `CampaignEnd{reason:"ship-seized"}`，模擬在 day 168 停止 |

### 驗證與介面

`npm run typecheck` exit 0；`npm run check` 與 `node src/ops/content/check.ts content/base` exit 0／0 錯（別線內容另有 warning）。`debt.test.ts` 6／6、`crew.test.ts` 12／12、`cond.test.ts` 新士氣測試及 `campaign.test.ts` 預設停機／終局後續跑測試通過。`node src/ops/sim/cli.ts --months 12 --policy greedy --seed 1` 與 `--policy merc --seed 1` 均印 `OK`；seed 7 greedy 亦印 `OK`。`npm test` 最近一次 127／132：ops 黃金 hash 預期改變（勿重產）、`src/ops/sortie/entry.test.ts` 既有 JSON 來回 `undefined` 差異、`src/mcp/{cli,e2e}.test.ts`、別線新增的 `test/campaigns/campaigns.test.ts` 紅；本線新增測試無紅燈。

新增事件型別：`DebtArrears`、`DebtCured`、`MechSeized`、`DebtCleared`、`SeleneEmbargo`、`DebtDemand`、`DebtCollection`、`DebtUltimatum`、`DebtBorrowed`；沿用 `CampaignEnd`，新增原因 `ship-seized`。新增錯誤碼：`credit-locked`、`credit-limit`、`selene-embargo`。對外型別：`CampaignState.debtState?`、`OpsCommand {v:"borrow";amount:number}`、`CampaignOptions.continueAfterEnd?`、`CrewRules.crew` 六個債務常數。`borrow` 文字動詞未加，留給 `cx-ops-board` 收線。

## 沒做到、或證據不足的部分

固定 greedy 合格門檻 4／5 未過，故不能宣稱整體目標完成。黃金 hash 因債務日結、事件與招募抽樣改變；交接書指定由領導統一重產。`npm test` 的四個其他紅燈不在本線可寫範圍，未改動其檔案。

## 需要決定的事

建議優先補 greedy 的前 12 潮月收入來源，例如讓可接合約每潮月多提供約 600 幣：估計全年現金餘裕增加最多 7200 幣，可覆蓋 6 個開局最低應繳額。只付息不罰仍僅 3／5 存活，故單調債務期限不足以跨過 4／5；實際改善幅度需由領導改收入規則後重測。開局債與利率未自行變更。

## 以後交接書該點名的工具

`src/ops/sim/campaign.ts`／`time/tick.ts` 的終局停機測試，以及在 `/tmp/cx-ops-debt/` 以真實 `runCampaign` 跑逐 seed 欠繳、終止日與只付息不罰對照的小腳本；此類跨線模擬需在出戰／政策線收斂後跑，避免工作樹同步變動讓判準表不可比。

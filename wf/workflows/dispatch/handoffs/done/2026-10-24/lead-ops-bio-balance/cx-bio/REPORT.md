# cx-bio 完成：拘束艙、族別維持與屍體改裝取代舊系統

## 做了什麼

已依交接書完成生物系改寫：每日磨損、受傷倍率、掙脫三選；第一大潮每月結算吞屍／潮浸／修剪；活性歸零同位轉整屍；拘束維護、改裝、防腐、修剪共用工時。材料開工一次扣，缺核不開工。捕獲登記與 A 級二名、同場同調、小名候選、凶名 kind、屍體機體與出戰校驗已接線。文字動詞為「投」，Screen 按鈕有識別、分組、快捷鍵、提示與禁用原因。

固定六條驗收：

1. 沙箱內 `npm test`：82 個檔案、82 pass、0 fail；此環境按檔彙總，由領導沙箱外確認實際 test 計數。新增恰好 10 個 `test()`（restraint 8、scenario 2），刪除指定 3 個舊測試。`npm run typecheck` exit 0，`npm run check` 0 errors。
2. `node src/ops/content/check.ts content/base` exit 0、0 errors、0 warnings。
3. `npm run sim:campaign -- --months 12 --policy idle` 與 `--policy greedy` 均到 day 336 並印 `OK`。
4. 兩個授權刪除的舊檔不存在；指定 TODO 搜尋 0 命中。
5. `test/golden/`、`src/ui-adapter/`、`e2e/`、`src/sim/session.ts` 無本線修改。開場存在別線變更，未覆寫。
6. 本 REPORT 含四段與三個附表。

營運黃金依授權以 `GOLDEN_UPDATE=1 node --test src/ops/sim/golden.test.ts` 更新。移除舊補給帳與市場列改變營運事件／序號：day 31 不變，events 282→276，logHash `545be0239746ade5`→`aacb6d08f04a2915`。戰鬥黃金未變。

## 產出（檔案導航，含刪除）

程式／內容共 69 檔，含本 REPORT 共 70 檔；差異約 148 KB 加本報告，低於 300 KB。沒有 commit。下列導航供逐檔檢閱；同檔若有別線改動，本線僅改交接書授權內容（例如開局只移除舊補給帳）。

`content/base/frames/`：新增 [corpse-mite.json](../../../../../../../../content/base/frames/corpse-mite.json)、新增 [corpse-nestmother.json](../../../../../../../../content/base/frames/corpse-nestmother.json)、新增 [corpse-reaper.json](../../../../../../../../content/base/frames/corpse-reaper.json)、新增 [corpse-tidewolf.json](../../../../../../../../content/base/frames/corpse-tidewolf.json)。

`content/base/monsters/`：[nestmother-landlord.json](../../../../../../../../content/base/monsters/nestmother-landlord.json)。

`content/base/world/beasts/`：新增 [alien.json](../../../../../../../../content/base/world/beasts/alien.json)、新增 [beast.json](../../../../../../../../content/base/world/beasts/beast.json)、新增 [insect.json](../../../../../../../../content/base/world/beasts/insect.json)、新增 [mycelium.json](../../../../../../../../content/base/world/beasts/mycelium.json)。

`content/base/world/campaign-start/`：[default.json](../../../../../../../../content/base/world/campaign-start/default.json)。

`content/base/world/dialogues/`：[chen-xiaohai.json](../../../../../../../../content/base/world/dialogues/chen-xiaohai.json)。

`content/base/world/`：新增 [keymap-ops.json](../../../../../../../../content/base/world/keymap-ops.json)、[ship.json](../../../../../../../../content/base/world/ship.json)。

`content/base/world/markets/`：[dhaka.json](../../../../../../../../content/base/world/markets/dhaka.json)。

`content/base/world/names/`：新增 [nick-alien.json](../../../../../../../../content/base/world/names/nick-alien.json)、新增 [nick-beast.json](../../../../../../../../content/base/world/names/nick-beast.json)、新增 [nick-insect.json](../../../../../../../../content/base/world/names/nick-insect.json)、新增 [nick-mycelium.json](../../../../../../../../content/base/world/names/nick-mycelium.json)。

`content/base/world/rooms/`：[hangar.json](../../../../../../../../content/base/world/rooms/hangar.json)、[medbay.json](../../../../../../../../content/base/world/rooms/medbay.json)、[mycelium.json](../../../../../../../../content/base/world/rooms/mycelium.json)、新增 [restraint.json](../../../../../../../../content/base/world/rooms/restraint.json)。

`content/base/world/services/`：[crew.json](../../../../../../../../content/base/world/services/crew.json)。

`content/base/world/templates/`：[default.json](../../../../../../../../content/base/world/templates/default.json)、[narrative.json](../../../../../../../../content/base/world/templates/narrative.json)。

`schemas/`：[content.schema.json](../../../../../../../../schemas/content.schema.json)。

`src/core/`：[types-def.ts](../../../../../../../../src/core/types-def.ts)、[types-state.ts](../../../../../../../../src/core/types-state.ts)。

`src/ops/content/`：[check.ts](../../../../../../../../src/ops/content/check.ts)、[cond.test.ts](../../../../../../../../src/ops/content/cond.test.ts)、[cond.ts](../../../../../../../../src/ops/content/cond.ts)、[load.ts](../../../../../../../../src/ops/content/load.ts)、[opseffect.ts](../../../../../../../../src/ops/content/opseffect.ts)、[start.ts](../../../../../../../../src/ops/content/start.ts)、[worlddb.ts](../../../../../../../../src/ops/content/worlddb.ts)。

`src/ops/crew/`：[crew.test.ts](../../../../../../../../src/ops/crew/crew.test.ts)、[hangar.ts](../../../../../../../../src/ops/crew/hangar.ts)、[index.ts](../../../../../../../../src/ops/crew/index.ts)、[names.ts](../../../../../../../../src/ops/crew/names.ts)、新增 [restraint.test.ts](../../../../../../../../src/ops/crew/restraint.test.ts)、新增 [restraint.ts](../../../../../../../../src/ops/crew/restraint.ts)、[shared.ts](../../../../../../../../src/ops/crew/shared.ts)、[wages.ts](../../../../../../../../src/ops/crew/wages.ts)、[workqueue.ts](../../../../../../../../src/ops/crew/workqueue.ts)。

`src/ops/sim/`：[campaign.test.ts](../../../../../../../../src/ops/sim/campaign.test.ts)、[invariants.ts](../../../../../../../../src/ops/sim/invariants.ts)。

`src/ops/sim/fixtures/`：[campaign-hash.json](../../../../../../../../src/ops/sim/fixtures/campaign-hash.json)。

`src/ops/sortie/`：[apply.ts](../../../../../../../../src/ops/sortie/apply.ts)、[run.ts](../../../../../../../../src/ops/sortie/run.ts)、[scenario.test.ts](../../../../../../../../src/ops/sortie/scenario.test.ts)、[scenario.ts](../../../../../../../../src/ops/sortie/scenario.ts)、[validate.ts](../../../../../../../../src/ops/sortie/validate.ts)。

`src/ops/state/`：[events.ts](../../../../../../../../src/ops/state/events.ts)、[ledger.test.ts](../../../../../../../../src/ops/state/ledger.test.ts)、[types.ts](../../../../../../../../src/ops/state/types.ts)。

`src/ops/text/`：[fixtures.ts](../../../../../../../../src/ops/text/fixtures.ts)、[format.ts](../../../../../../../../src/ops/text/format.ts)、[parse.ts](../../../../../../../../src/ops/text/parse.ts)、[render.test.ts](../../../../../../../../src/ops/text/render.test.ts)、[render.ts](../../../../../../../../src/ops/text/render.ts)、[rooms.test.ts](../../../../../../../../src/ops/text/rooms.test.ts)、[rooms.ts](../../../../../../../../src/ops/text/rooms.ts)、[verbs.ts](../../../../../../../../src/ops/text/verbs.ts)。

`src/ops/time/`：[commands.ts](../../../../../../../../src/ops/time/commands.ts)、[tick.ts](../../../../../../../../src/ops/time/tick.ts)。

`src/ops/world/`：[market.ts](../../../../../../../../src/ops/world/market.ts)。

`src/sim/`：[run.ts](../../../../../../../../src/sim/run.ts)。

刪除：`src/ops/crew/stable.ts`、`content/base/world/rooms/stable.json`。

新增報告：[REPORT.md](REPORT.md)。

## 沒做到或證據不足的

沙箱外 `npm test` 與提交／最終計數留給領導，未宣稱代跑。第二次 npm test 的外層 shell 因誤用 zsh 唯讀變數 `status` 未能轉存退出碼；測試本體已跑完，輸出明確為 82 pass、0 fail。證據保存在 `/tmp/cx-bio-npm-test-final.log`；兩種模擬紀錄為 `/tmp/cx-bio-idle.log`、`/tmp/cx-bio-greedy.log`。

自填名稱沿用 `NamingPrompt.naming` 與 `applyName`；數字 `choose` 選自填仍回 `name-required`，沒有另加動詞。corpse 的腐化上限寫入可選 `LayerState.maxHp` 並由營運修理遵守；不擴寫戰鬥規則的回復計算。族行為保留宣告式入口，目前既有內容只宣告巢母 brood，未虛構獸族／異形的變體內容。

## 需要決定的事

無阻塞決策。由領導依原契約完成沙箱外驗收與 commit；本線停在 70 檔，不擴充驗收。code map 屬本線禁止修改的 wf 範圍，請領導收線時同步舊模組指標。

## 附表：ops 對外型別變更

| 項目 | 舊 → 新 |
|---|---|
| Screen.actions | label/cmd → 加 id/group/key?/tooltip?/disabled? |
| OpsCommand | feed/pen → devour/beast |
| CampaignState | stable/pens → restraint：slots/beasts/carcasses；容量 restraintSlots |
| names | 加 kind：title/registry/nickname/dread/epithet |
| Job／Market | 加 restrain/mount/embalm/prune；feed → carcass |
| 事件 | Tamed 刪；加 WearWarning/BrokeLoose/Sustained/Stiffened/Mounted |

另加事件 `MyceliumOvergrown`（蔓延）、`Suppressed`（硬壓）、`Devoured`（投屍帳源）；`MoltStarted` 為原有事件補登記與模板。OpsEffect 新增 `restraintChoice`、`salvage`，nameMech 加可選 kind（省略為 title）。core 加可選 MonsterDef.epithet、UnitSpawn.pools、LayerState.maxHp；sim 將池起點傳入既有 UnitInit，沒有修改 rules／ai。

## 附表：SPEC-GAP 清單

| 缺口 | 本線最小處理 |
|---|---|
| 活捕無人物座位 | bond 存資料，無 burdenLimit 注入目標 |
| 獸／異形型錄不足 | shell-pin-restraint 代用，異形維護工時三倍 |
| 硬壓工傷細節未定 | 內容定義機率／HP 傷害，優先扣次日技師工時 |
| 永久腐化上限 | 可選 maxHp，營運修理遵守 |
| 戰果缺 monster 身分 | 同族同級唯一個體才補二名，避免猜錯 |
| mutate 無 partsOverride 狀態 | 沿用內容 frame 變體抽選 |
| 自填無命令入口 | 沿用 applyName／prompt metadata |

## 附表：殘留字樣與理由

| 搜尋範圍 | 結果 |
|---|---|
| src/ops、content/base：stable/feed/hunger/taming/tame/餵/飼料/獸欄/馴 | 0 命中，無需例外 |
| src：TODO(2026-10-24 | 0 命中 |

## 以後交接書該點名的工具

無。

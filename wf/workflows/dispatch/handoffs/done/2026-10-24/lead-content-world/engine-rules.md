# engine-rules — lead-content-world 各工人共用的引擎護欄（領導實測，2026-10-24）

[lead-content-world 交接書們](.)｜檢查腳本 `lint_world.py`（同資料夾）

這份是**契約**：領導讀過 `src/ops/` 實作後寫死的規則，違反任何一條都會讓營運模擬卡死、拋錯，或改掉平衡線調好的戰役。工人照做，不必自己再推一次引擎。

## 一、事件怎麼被抽到（`src/ops/time/tick.ts` eventsDaily4）

- 每天第 4 段：凡是**沒被任何 `next` 指到**的事件，只要 `where` 符合（`ship` 隨時；停泊時 `node`；航行中 `route`）且 `when` 為真、`weight>0`，就進牌堆，**當天必抽一張**。所以 `when` 恆真的事件會讓每天都跳選擇框，greedy 模擬就再也不打仗——這是實測過的。
- **閘門（寫死）**：隨機事件的 `when` 必須是 `{"all":[…]}`，其中**一定要有** `{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}}`（第一個潮月是開場，留給葬禮與催收），以及**限定 1–2 個日子**：`calendar.dom == 5／12／19／26`（多個用 `{"any":[…]}`）。其餘條件自由加。
- 一次性劇情：`when` 加 `{"cmp":{"a":{"ref":"flags.seen-<名>"},"op":"==","b":0}}`，每個選項都 `{"flag":"seen-<名>"}`。
- 事件鏈：在**選項**上寫 `"next":"event/<後續>"`；後續事件的 `when` 一律寫 `{}`（被 `next` 指到的事件不會被隨機抽到，只從鏈進入）。事件層級不要寫 `next`。
- `where` 只用 `ship`／`node`／`route`（`ruin` 只由遺跡探索進入，本線不做）。`weight` 為 1–5 的數字。
- 選擇框文字不做插值：`text` 裡**不要寫 `{…}` 佔位**，也不要寫特定人物姓名（人會死、名冊會變）；用身分稱呼：技師、廚子兼醫官、新來的駕駛員、機魂、團長（＝玩家，第二人稱「你」）。

## 二、選項與效果白名單

模擬政策永遠選**第一個 `requires` 成立的選項**；效果套用失敗（存量變負）會讓指令被拒、模擬卡死。所以：

1. **第一個選項不可有 `requires`**，且它的效果一定能套用；它應該是「溫和、不賺不賠」的那個（小士氣、小工時、記旗標），讓自動模擬的經濟不被事件灌水或抽乾。
2. 每個事件 2–4 個選項，至少一個有真正的取捨。
3. 效果只准下表（一個效果物件只放一個鍵）：

| 效果 | 寫法 | 限制 |
|---|---|---|
| 現金 | `{"ledger":{"account":"cash","delta":N,"reason":"event-<檔名>"}}` | \|N\|≤600；**N<0 時該選項 `requires` 必須含 `ledger.balances.cash >= -N`** |
| 廢料 | 同上，`account":"stock:scrap"` | \|N\|≤8；N<0 時 `requires` 含 `ledger.balances.stock:scrap >= -N` |
| 屍肉／甲殼 | `stock:flesh`、`stock:chitin` | 只准 +1～+6（**不准扣、不准拿來當條件**：開局沒有這兩個帳，讀它會拋錯） |
| 債 | `account":"debt"` | 只准 +1～+600（滯納金之類） |
| 聲望 | `{"rep":{"faction-ops/selene-whitegloves":±N}}` | 事件只准這一家，±5 內；契約的 `onComplete` 等可用 `"issuer"` |
| 旗標 | `{"flag":"<小寫英數-連字>"}` 或加 `"value":N` | 自由；拿來串跨時間的劇情 |
| 士氣 | `{"mood":{"all":±1}}` | ±2 內；對白可用 `{"mood":{"person/<該人物>":±1}}` |
| 工時 | `{"techHours":N}` | 只准 +1～+24 |

不准：`spawnEvent`、`spawnContract`、`setNode`、`setRift`、`applyEffect`、`nameMech`、`restraintChoice`、`salvage`、燃料帳（不會同步油箱）。

## 三、條件裡能讀的 ref（其他會拋錯或沒意義）

`ledger.balances.cash`、`ledger.balances.stock:scrap`、`debt.ratio`（現債／開局本金，開局 1）、`debt.balance`、`restraint.beastCount`、`restraint.beastWear`（拘束艙裡最高磨損 0–100，≥50 是警告、100 掙脫）、`restraint.freeSlots`、`ship.hull.cur`（0–100）、`ship.fuel.cur`、`campaign.pressure`（潮壓）、`campaign.techHours`、`calendar.month`、`calendar.dom`、`inventory.tickets.restraint`、`inventory.tickets.airstrike`、`flags.<任意>`（沒設過讀到 0）；對白另可讀 `person.mood`（−3～3）。`{"tag":"coastal"}` 可判斷停泊節點是否沿海（節點 tag 只有 coastal）；設過的旗標也可當 tag 用。

## 四、其他資料夾

- **encounters**：選圖用「同族裡第一個 depth 相符的檔」，無裂縫時用「全部遭遇排序第一個」的族。所以**不新增 `insect` 族遭遇**，且新檔 id 一律排在 `encounter/insect-deep` 之後（前綴用 `rift-`、`rival-`、`league-`、`selene-`、`tide-`、`smuggler-`…，字母 > i）。人類對手族（family 自訂字串如 `rival-hunters`）目前沒有裂縫會用到，屬「休眠交付」：可放 `map` 欄指向已 commit 的 `content/base/maps/*`。`terrainMix` 的地形必須是已 commit 的 terrain。
- **contracts**：契約只會被行動牌 `spawnContract` 生成，且發包勢力的 `contractKinds` 要列它；本線**不改 factions-ops／actions**，所以新契約全部是休眠模板（等頂層決定接線）。`issuerKinds` 至少含一個現有規模（`guild`、`company`），可再加 `city`、`league`、`cult`、`scholars`、`militia`、`hunters` 等。主目標只用 `eliminate`／`survive`（`params.rounds`）／`hold`（`params.rounds`）；`escort`／`killTarget`／`capture`／`reachExit` 需要執行期單位 id，模板寫不出來——要用就加 `"optional":true` 並用象徵參數（如 `{"role":"convoy"}`），REPORT 記 SPEC-GAP。`pay.base` 用 `rift.widthIndex` 只限 `clear`／`seal`／`reclaim`／`defend`（這四種一定有裂縫）；其他種類用常數或 `calendar.*`。量級對照既有 `contract/clear`（2800×寬度指數）。
- **names**：古代機命名用 `names/mythic-<culture>`，喚醒時依人物 culture 取第一張 culture 相符的表、抽 3 個（至少 3 個不重複，本線要求 ≥12）。`nick-<family>` 四張是程式直接讀的既有檔，不改；新詞庫用新檔名與**不同的 culture 值**（例 `dread-insect`），不要和任何 mythic 的 culture 撞。
- **markets**：每個市場在弦月日抽庫存（耗 RNG）；`node` 必須是既有節點。可賣的只有已 commit 的 `component/*`、`frame/*` 與 `stock:*` 帳（`ammo` 列的 `ammo-30` 是補彈專用）。不改 `markets/{chittagong,dhaka}.json`。
- **backgrounds**：`person` 必須是**已 commit**（`git ls-files content/base/persons`）的 human；候選人從該人物複製再擲屬性；`culture` 必須有對應的 `names/mythic-<culture>` 表；屬性鍵只有 accuracy／evasion／resolve／initiative／perception／control；`hireFee`、`wageMult` 用數字。
- **research**：開局會替每項科研建狀態。`unlocks` 的 `soul-node` 用節點 id 字串（`calc-1`、`calc-2`、`hand-1`、`heart-1`，古代樹 `hunter-1..3`、`solo-1..3`、`sentinel-1..3`、`feral-1..3`），`component` 必須是已 commit 的部件；`requires` 寫其他 research id 串成樹。
- **dialogues**：同一人物可有多檔，`talk` 不指定話題時取「依 id 排序第一個條件成立的話題」——新檔命名 `<人物名>-<話題>`，排在既有 `dialogue/<人物名>` 之後，不搶既有第一話題。人物必須已 commit。

## 五、文字

- 照 `content/lore/style.md`：太空歌劇、不太現實、敢中二；冷硬潮濕的捕鯨船底色＋神話的光；黑色幽默。用語用它的表（源潮、裂晶、流光、燼、光幕、殼甲、殼目、矢、吼砲／連吼、弧光、機魂／魂核／野魂、術式、星哨／天網、浮芯、月弓、渡潮船、鐵翼、十分律、殼訊、潮／殼／裏側、蝕域／蝕線）。**禁用詞**照 style.md（`lint_world.py` 會掃）。
- 第二人稱現在式、對白短、不解釋世界觀；數字不進敘述。
- 機魂的鮮明個性是**稀有、S 級以上**的現象：一般機魂照本宣科；寫「機魂異常」時是怪現象（低鳴、錯置的紀錄、不屬於它的習慣），不是性格；要寫有個性的機魂就點明它很罕見。
- 生物系：沒有餵養、沒有獸欄、不把怪獸當寵物；拘束艙是壓制與對抗（磨損、掙脫、吞屍維持只限蟲族獸族）。
- 獵團＝自營傭兵；勢力自己打仗、彼此有外交與衝突（同盟、緊張、敵對），傭兵會被雙方拉攏。

## 六、檢查（每批寫完就跑）

```sh
cd /home/lorkhan/repo/game_dev/mecha-srpg
python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py <你的檔或資料夾>   # 末行 OK
node src/ops/content/check.ts content/base | tail -3                                   # 末行 OK 0 errors
npm run check | tail -1                                                                # 末行 OK 0 errors
```

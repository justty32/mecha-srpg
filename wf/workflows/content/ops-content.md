# ops-content — 營運層內容：事件、契約、名表、科研、市場、遭遇、對白

[content README](README.md)｜格式 [content-format-ops](../planning/specs/ops/content-format-ops.md)（三個範例子檔）｜護欄 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/engine-rules.md`（領導實測，照做）｜檢查 `lint_world.py` 同目錄｜既有一覽 `lead-content-world/catalog.json`（139 列）

營運內容在 `content/base/world/<kind>/`，驗證多一道 `node src/ops/content/check.ts content/base`，平衡用 `npm run sim:campaign`（greedy 12 蝕月）與 MCP `campaign_auto`。這層最容易「寫對了但把模擬器卡死」——engine-rules 五節每條都是踩過的坑。

## 事件 event（prompt／choose）

**抽法**：每天第 4 段，所有 `when` 為真且沒被 `next` 指到的事件進牌堆、必抽一張。所以隨機事件 `when` 必是 `{"all":[…]}` 且含 `calendar.month >= 1` 與 `calendar.dom == 5|12|19|26` 之一（多日用 any）；一次性劇情加 `flags.seen-<名> == 0` 且每選項 `{"flag":"seen-<名>"}`；鏈中後續 `when:{}` 只由選項 `next` 進入。`where` 只用 `ship`／`node`／`route`；`weight` 1–5。

**選項**：2–4 個；**第一個無 `requires`、溫和不賺不賠**（模擬政策永遠選第一個成立的）；至少一個真取捨。效果白名單：`ledger cash`（|N|≤600，扣錢必 `requires ledger.balances.cash >= N`）、`stock:scrap`（≤8，同理）、`stock:flesh/chitin` 只准 +1～+6、`debt` 只准加、`rep` 只准 `faction-ops/selene-whitegloves` ±5、`flag`、`mood ±2`、`techHours +1～+24`。不准 spawnEvent／spawnContract／setNode／setRift／applyEffect／nameMech／salvage／燃料帳。可讀 ref：`ledger.balances.*`、`debt.ratio|balance`、`restraint.beastCount|beastWear|freeSlots`、`ship.hull.cur|fuel.cur`、`campaign.pressure|techHours`、`calendar.month|dom`、`inventory.tickets.*`、`flags.*`；`{"tag":"coastal"}` 判沿海。

**文字**：`text` 60–160 字、第二人稱現在式、不插值 `{…}`、不寫具名人物（人會死）——用身分（技師、廚子兼醫官、新來的駕駛員、機魂、團長）。選項文字是動作不是解釋（「記錄警訊交班提醒維護」）。每事件一個氣味、一個聲音、一個不解釋的名詞。系列：拘束艙（磨損、夜撞、掙脫演習）、機魂異常（低鳴、錯置紀錄——不是個性）、港口（手套催收、暗面密箱）、航路（難民筏、蝕暴）、遺跡（刻痕、座標買賣）、同業（鐵砧吹噓、鹽鷗撿屍）、船（漏氦、偷渡客）；每系列 ≥3 件才像世界在動。

## 契約 contract

契約只會被行動牌 `spawnContract` 生成，且發包勢力 `factions-ops/*.contractKinds` 要列它——否則是**休眠模板**（目前 11 份休眠，接線是 lead-impl-war 範圍，內容線不改 factions-ops／actions 除非任務授權）。`issuerKinds` 至少含一個現有規模（guild／company／city／league／cult／scholars／militia／hunters）；主目標只用 `eliminate`／`survive(rounds)`／`hold(rounds)`；escort／killTarget／capture／reachExit 需執行期單位 id——要用就 `optional:true`＋象徵參數，REPORT 記 SPEC-GAP（待引擎缺口線）。

`pay.base` 用 `rift.widthIndex` 只限 clear／seal／reclaim／defend，其他用常數或 `calendar.*`；量級 500–4000（clear 2800×寬度指數）。`advanceMax` 0.3–0.5、`deadlineDays` 綁大潮、`onComplete/onFail/onCancel` rep ±5／−40（毀約重罰）。參戰型 `join:{command, supply, share, fee, orders, exclusive, loan}`。文案是雇主口吻（殘聯公文體、公會記帳體、第七哨孩子的字條）。

## 名表 names

`names/<culture>.json`：`culture` 值全庫唯一、`names` ≥12 不重複、`epithets` 可空。神話名 `mythic-<culture>`（古代機喚醒抽 3，依人物 culture）；凶名 `dread-<family>`、二名 `epithet-<family>`（四字為主，寫牠做過的事）；衍型機 `mech-codes`／`mech-series`／`mech-highgrade`／`mech-selene`。**不改既有 `nick-*` 四檔**（程式直讀）。

## 科研 research、市場、招募、背景、對白

- 科研：`direction`（soul-calc／soul-hand／soul-heart／restraint／forge／shell…）、`cost {coin 600–1500, techHours 40–120}`、`requires` 串成樹、`unlocks` 的 `component` 必須已 commit、`soul-node` 用節點 id 字串（calc-1、hunter-1…）。不要解鎖開局已有的東西。
- 市場：`node` 既有；只賣已 commit 的 component／frame／`stock:*`；`ammo` 列是矢池 id 與每矢單價；弦月抽庫存會動 RNG（新市場會換 ops 黃金 hash——要頂層授權）。
- 招募池與背景：`background.person` 已 commit 的 human（候選從它複製再擲屬性）、`culture` 有 mythic 表、屬性鍵六個、`hireFee`／`wageMult` 數字；獸緣／古緣目前是背景屬性範圍。
- 對白：`dialogue/<人物>-<話題>`，排在既有 `dialogue/<人物>` 之後（talk 取 id 排序第一個成立者）；`lines` 2–4 句、每句 ≤40 字、選項 2 個、效果 flag＋mood。人物必須已 commit。

## 遭遇 encounter 與裂縫 rift

- 選圖「同族第一個 depth 相符」：新遭遇 id 排在 `encounter/insect-deep` 之後（前綴 rift-／rival-／league-／selene-／tide-／smuggler-），`terrainMix` 用已 commit 地形，`$node` 代該地地形，`budgetByGrade` 每級名額（核層要有 D:1 免 empty budget）。
- `rift/<family>`：`anchor` 用 A 級 monster、`vanguard` species、`monsters` 清單、`gradeByWidth`、`spreadPerTide`、`selfClose`（異形 true）、`tether`（蟲 true）。四族已有；人類對手遭遇（rival-hunters 等）是休眠交付，待引擎缺口線的編成欄。

## 常見錯誤

when 恆真；扣錢無 requires；第一選項有條件；text 用佔位或人名；效果用白名單外的鍵；契約主目標 escort；culture 撞表；市場賣未 commit 物；對白搶第一話題；新遭遇 id 排在 insect 前；改 nick-*／markets/{chittagong,dhaka}。

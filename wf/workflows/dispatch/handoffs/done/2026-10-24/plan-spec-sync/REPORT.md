# REPORT — plan-spec-sync：把 2026-10-24 裁示同步進 spec

STATUS：**DONE**。改／新增 30 檔（原 gate 25；頂層中途加 PROJECT.md 與修正線三項並放寬到 30）。`wf-lint --strict` 在我領地內 0 錯；殘留錯誤全是別線的（第七節）。

## 一、改了哪些檔

**ops（11）**：新 `data-model-beasts.md`（拘束艙、活捕磨損／失控、族別維持、屍體改裝、生物系命名）；`data-model-roster-repair.md` 瘦身（獸欄節拆出、Job 加 `restrain`／`mount`／`embalm`／`prune`、`names` 加 `kind`、三類營運主軸）；`text-ui-contract.md` 改題為「OpsCommand 語意層與呈現契約」（檔名不改——`cx-ops-text` 交接書連著它；`feed`→`devour`；新增 Keymap 節；`Screen.actions` 帶 `group`／`key`／`tooltip`／`disabled`；parse 降為測試工具）；`README`、`architecture-ops`（`restraint: RestraintBay`、事件名、測試 (5)(6)）、`battle-interface`（`instinct`、`wear` 注入、整屍）、`time-and-tick`、`economy-research`（刪 `stock:feed`／`feed` 市場列、加 `carcass`）、`world-map`、`content-format-ops`（`room/restraint`、`beasts/` 範例）、`constraints-ops.json`（55→61 列：USR-04～09；WV-06／18 等改寫）。

**core（6）**：`data-model-people.md`（`instinct` 控制模式、怪獸意識不是人物、屍體改裝機體無 instinct 池）；`architecture.md`（ui-adapter 呈現方針：按鈕／面板／tooltip／keymap；`BattleSession` 應搬進 sim）；`data-model-world.md`（`allies`、`hostileSlots`、neutral 敵對、killTarget、globals、featureHp、**地物受損提案**）；`rules-battle-flow.md` 一句；`constraints.json`（57→62：USR-C01／C02、FIX-01～03）；`glossary.json`（controlMode 加 instinct、新詞「屍體改裝」）。

**world（9）**：新 `bio-mechs.md`（自 mech-lifecycles 拆出：兩條路＋命名）；`mech-lifecycles.md`（新節「三類機甲的營運主軸」、生物節改指標）；`monsters.md`（二名、吞屍）；`monsters.json`（A 級三列 name 附二名、兩處措辭）；`operations.md`（互動形式節整段重寫）；`opening.md`（樣例改營運面板與戰場記錄）；`README`、`factions`、`setting`。

**其他（4）**：`decisions.md`（已滿，只加一行導航）＋新 `decisions/2026-10-24-bio-ui.md`（整筆）；`PROJECT.md` 一句；本 REPORT。

## 二、異形／菌絲維持機制的提案（替使用者做掉）

- **異形＝潮浸**：不吞屍。大潮日船停在蝕化節點（淺蝕以上）或與 `anchored` 裂縫相鄰，活性回滿、當潮月才會變異；錯過一個大潮活性 −20。帶異形就得定期開進危險處，與沙盒航行掛鉤。
- **菌絲＝修剪**：共生層與菌房不需任何補給、自己長；維持是壓制——每潮月一個 `prune` job（工時小、無材料），不剪則共生層往駕駛艙部位長（傳導傷到人）、菌房兩潮月不剪蔓延到機庫。

## 三、飢餓的替代：拘束器磨損

活捕獸每天 `wear += wearPerDay[grade]`（D 3／C 5／B 8／A 15）；`wear ≥ 50` 出戰注入 `instinct` 起始值 `+(wear−50)/2`（原「飢餓推高本能」的位置）；`wear ≥ 100` 掙脫事件（BB 式三選：硬壓／放走／殺）；`restrain` job 歸零，與修理搶同一群技師。另有 `vitality`（活性）：只由族別維持影響，歸零＝僵死成屍體（可 `mount`）。

## 四、其他「替使用者做掉的決定」前 5

1. **族別維持一潮月一次、綁大潮節拍**，不是每天——換個名字的每日餵食仍是畜牧。
2. **屍體改裝吃一顆同級核當動力**：「開銷大」落在最稀缺資源上，與賣核、修古代機甲三方競爭；D／C 可改裝但費用高過同級摹機，「只用於高級怪獸」是價格造成不是硬規則。
3. **活性歸零＝僵死成屍體**而非死亡：給「活捕失敗→屍體改裝」一條回收路。
4. **27 動詞保留為指令語意層**（按鈕分組與快捷鍵掛在動詞上），`parse`／`formatCommand` 只給測試、重播可讀化、除錯；`feed` 換 `devour`（投屍）。
5. **地物受損**：只有 `cell`／範圍攻擊打得到可破壞格，單體攻擊不順帶；傷害乘 `destructible.resist[damageType]`，歸零換 `becomes`、格上單位吃 `onCollapse`；AI 只把 `tags:objective` 的地物當目標。另：世界 neutral 在戰場算敵對（頂層定，已記）。

## 五、對實作線的影響

**ops 線（`src/ops/`、`content/base/world/`）**：
- `src/ops/state/types.ts`：`PenState`／`StableState` → `BeastState`／`RestraintBay`（欄位 `kind`／`wear`／`vitality`／`sustainDue`，刪 `taming`／`tameDays`／`hunger`）；`CampaignState.stable` → `restraint`；`ShipState.capacity.stablePens` → `restraintSlots`；`OpsCommand` 的 `feed` → `devour`（`beast`／`amount`）；`Job.kind` 加 `restrain`／`mount`／`embalm`／`prune`；`MarketDef.kind` 刪 `feed` 加 `carcass`；`Screen.actions` 加 `id`／`group`／`key`／`tooltip`／`disabled`；`RosterState.names[].kind`。
- `src/ops/crew/stable.ts`：馴化／hunger／`stock:feed` 邏輯整段換成磨損累加、`sustainDue`、活性、掙脫事件、`Stiffened`；事件 `Tamed` → `WearWarning`／`BrokeLoose`／`Sustained`／`Stiffened`／`Mounted`。
- `src/ops/text/verbs.ts`／`parse.ts`／`rooms.ts`／`render.ts`：動詞 `餵` → `投`；房間 `stable` → `restraint`；片語鍵 `penCount`／`penHunger` → `beastCount`／`beastWear`；render 要輸出按鈕分組與 key。
- `content/base/world/`：`rooms/stable.json` → `rooms/restraint.json`（文案去「飼料袋」）；`ship.json` rooms／capacity 鍵名；`campaign-start/default.json` 刪 `stock:feed`；`markets/*.json` 刪 `feed` 列；新 `beasts/<family>.json`；`services/crew.json` 若有馴化服務要刪。
- 出戰：`validateSortie` 不再看 `tamed`，無拘束獸用 `controlMode:"instinct"`；注入 `wear`／`vitality` 取代 `hunger`。

**UI 線（`src/ui-adapter/`）**：已與裁示一致（keymap.json、四組按鈕、tooltip 顯示鍵）；spec 新寫入 `CommandOption.key`／`tooltip`／`disabled` 與「`BattleSession` 應由 sim 提供」，實作 `vm/session.ts` 直呼 rules／ai 已記為待搬。營運畫面（ui-ops）日後要與戰場共用 keymap 載入器。

**修正線／sim 線（`src/rules`、`src/core`）**：spec 現在與實作一致（`instinct`、`allies`、`hostileSlots`、killTarget、globals、featureHp）；**待實作**：地物受損（`destructible.resist`／`onCollapse`、`FeatureDestroyed` 事件、cell／範圍攻擊打地物）、`MonsterDef.epithet` 欄（二名）、屍體改裝 frame（`frames/corpse-<species>.json`，無 instinct 池、burden 0）。

## 六、殘留字樣的正當理由（grep 飼料／餵／獸欄／馴／MUD／文字區／指令列）

- 「無馴化」「沒有餵養」「不走 MUD 風」「不做文字指令列」「不另造飼料帳」等：引述裁示的否定句（beasts、bio-mechs、mech-lifecycles、roster-repair、text-ui-contract、operations、architecture、content-format-ops、兩份 constraints）。
- `rules-battle-flow.md:13`「餵 AI 指令」、`architecture.md:35`「直接餵入」：程式語意的「餵」。
- `ruins-and-ancient.md:41`「膽小的馴獸人」：一萬年前先民的職業風味詞，不是系統；未改以省件數。
- `monsters.md` 蟲族「子體離巢七天餓死」：野生生態描述（繫），不是餵養系統。

## 七、lint（別線造成，未改）

`BROKEN wf/SESSION-LOG.md -> handoffs/lead-integ-battle/REPORT.md`（該線尚未產出）；`OVERSIZE wf/workflows/inbox/ROSTER.md`；`BIGLIST wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`wf/workflows/dispatch/CLAIMS.md`。design-notes/mechs.md 超標頂層已另派人。我領地內：broken 0、oversize 0、biglist 0。

## 八、需要使用者裁示的事

1. 異形潮浸、菌絲修剪、屍體改裝吃核、活性僵死——四條代決可逐條推翻（只改 `data-model-beasts.md` 對應節與 constraints-ops USR-04～09）。
2. 二名的例子（崖牙「赤眼兇星」、巢母「千囊房東」、菌床「白夜」）是佔位文案，內容線可換。
3. 世界 neutral 在戰場算敵對——頂層代決，使用者未表態。
4. `text-ui-contract.md` 檔名要不要改成 `ui-contract.md`：我沒改（交接書連著），要改時連 `cx-ops-text.md`、`cx-ops-time.md`、constraints-ops 三處一起。
5. 地物受損提案待使用者看過再派實作。

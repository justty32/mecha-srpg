# 任務：新增 8 個戰鬥情境（scenario），每個都用 measure 跑過

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、`content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-world.md`（ScenarioDef、Objective、`allies`、killTarget、globals）、`wf/workflows/planning/specs/core/ai.md`、`wf/workflows/planning/specs/world/factions.md`、`wf/workflows/planning/design-notes/world.md` 末兩段（2026-10-24 參戰型裁示）——**親自讀，不靠本交接書的摘要**。範本：`content/base/scenarios/rift-edge-nest.json`（盟軍 slot 寫法）、`content/base/scenarios/skirmish-whitegloves.json`。目標判定真相：`src/rules/objectives.ts`；組裝：`src/sim/run.ts` 的 `scenarioToSetup`。

## 背景與唯一目標

戰場內容線 `lead-content-battle` 已新增地形、地圖（`content/base/maps/` 下非 `skirmish-20`／`rift-edge-60` 的檔，讀各檔的 deployZones／exits／globals，或讀 `wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/REPORT.md`）、勢力（`content/base/factions/` 共 10 個）、AI 設定（`content/base/aiprofiles/` 的 focus-fire、guerrilla、bodyguard、sniper-perch、tide-cultist、convoy-runner）。唯一目標：用它們寫出下表 8 個情境，每個都能被自動對戰跑完。

使用者裁示（重要）：玩家獵團是自營傭兵，**各勢力自己組織部隊作戰，傭兵參戰**——所以多數情境是「參戰型」：玩家 slot 與勢力友軍 slot 用 `allies` 同盟、友軍由 AI 指揮（slot 的 `ai` 欄給 aiprofile）、**友軍規模比玩家大**；也有勢力間交火、傭兵選邊。

風格裁示（重要）：使用者要**太空歌劇、不要硬科幻**（`wf/workflows/planning/design-notes/world.md` 末段，「想想 Warframe」）。情境沒有 name 欄就在 REPORT 每個情境給一個有奇觀／神話感的作戰代號與一句劇情鉤子（例：「灰燼渦下的三王會戰」），不寫工程術語。若 `content/lore/README.md` 或 `content/lore/style.md` 存在，用語以它為準。

## 範圍（排除法寫死）

- 只做：新增 `content/base/scenarios/{下表 id 名段}.json` 8 個檔。
- 不做：改任何既有檔；新增 frames／monsters／persons／species／components／abilities／effects／terrains／maps／factions／aiprofiles（缺什麼寫 REPORT「需要決定的事」）；`src/`；`content/base/world/`。
- **只能用已 commit 的單位**：frames 用 `git ls-tree --name-only HEAD content/base/frames/` 列出的（不含 `moji-tern-guard`）；monsters 只有 `mite-d`、`reaper-c`、`nestmother-landlord`；persons 只有 `content/base/persons/` 那 7 個（`glove`、`ash`、`unit-07` 是機魂，坐 soul 座；人類坐 pilot 座；同一 person 可重複出場）。各 frame 的座位看它的 bodyplan `seats`。
- 件數 gate：新檔超過 10 個就停下回報；容量 gate：單檔超過 50 KB 就停下回報。

## 8 個情境（id 寫死；地圖、類型照表，單位配置、輪數、seed 由你設計）

| id | 地圖 | 類型 | 陣營組合 | 目標要點 |
|---|---|---|---|---|
| scenario/breach-defense | map/citywall-breach-40 | 參戰：守城牆破口（有補給點） | player＋ally(`faction/residual-league`，`aiprofile/bodyguard`，大軍) vs 蟲群大潮 | hold 破口 zone（rounds ≤ 12）；敵方 eliminate 為 lose |
| scenario/delta-four-way | map/delta-ruins-56 | 四方混戰（潮汐） | player＋ally(`faction/dhaka-weavers`) vs enemy 蟲群 vs third `tide-faith`（`aiprofile/tide-cultist`，騎 bio-*／corpse-*） | eliminate |
| scenario/shell-excavation-escort | map/ancient-shell-30 | 參戰：護送學者撤出遺跡 | player＋`convoy` slot(`faction/shell-society`，infantry，`aiprofile/convoy-runner`) vs `selene-whitegloves` 封鎖隊 vs third 蟲群 | escort 學者 def；敵方 killTarget 學者為 lose |
| scenario/nest-core-assault | map/nest-core-72 | 參戰：攻堅巢核 | player＋ally(`residual-league`，`aiprofile/focus-fire`，單位數 ≥ 玩家 2 倍) vs 蟲群＋`monster/nestmother-landlord` | killTarget 房東；survive 20 為平手退路不要寫 |
| scenario/convoy-run | map/convoy-road-80x20 | 參戰：護航撤離（只東邊能撤） | player＋ally(`bay-seventh-post`)＋`convoy` slot（hound-mk2 或 infantry，`aiprofile/convoy-runner`） vs 沿路伏擊蟲群 | escort；敵方 killTarget 車隊 def 為 lose |
| scenario/beachhead-landing | map/beachhead-44x36 | 參戰：灘頭攻堅（漲潮倒數） | player＋ally(`bay-seventh-post`，`aiprofile/guerrilla`) vs 巢壁陣地蟲群 | killTarget `monster/reaper-c` 或 eliminate |
| scenario/badlands-sweep | map/badlands-128 | 參戰：大圖清剿裂縫＋競爭獵團 | player＋ally(`residual-league`，大軍) vs 蟲群 vs third `anvil-hunters`（搶屍） | eliminate（敵方）；單位總數 ≤ 40 |
| scenario/rival-claim-jump | map/rift-edge-60 | 人對人＋怪：搶屍 | player vs `salt-gull-hunters` vs third 蟲群殘部 | eliminate；`rift-edge-60` 只引用，不改 |

注意：`node src/sim/measure.ts` 強制 20 輪上限，所以 survive／hold 的輪數要 ≤ 20；ally／third slot 的 `deployZones` 鍵名要和地圖一致（地圖沒有的 zone 就用 `at:{x,y}` 固定格）。`neutral` 在戰場算敵對，同盟要用 `allies` 寫明。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-bat-scen-b --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-bat-scen-b --up …` | 上線 PROGRESS 與終局回報 |
| `npm run check`（專案根） | 每寫完一個情境 |
| `node src/sim/measure.ts {情境 id} 1 2 3`（專案根） | 每個情境都要跑；不拋錯，三個 seed 都結束（winner 非 null）或 timeout 平手但有交戰（deaths > 0 或 hits > 0） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-b/`；可跑 `npm run check`、`node src/sim/measure.ts`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；**不 commit**（領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。別的內容線可能同時在新增檔、`npm run check` 可能因別人的半成品報錯——只要錯誤不在你的檔就照常進行並在 REPORT 註明。

**分清錯誤來源**：工具或環境出錯 → 發 `BLOCKED`；你自己寫的情境出錯 → 自己修。

## 工作

1. 上線發 PROGRESS。
2. 逐個寫情境 → `npm run check` → `measure 1 2 3`；結果不合理（一方 1 輪內全滅、20 輪零交戰、waitRatio ≥ 0.5 且無勝負）就調部署與兵力再跑。
3. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-b/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 情境 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/`（8 個新檔） |
| measure 原始輸出 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-b/measure.jsonl`（每行一筆，加 `scenario` 欄） |

REPORT 四段（做了什麼／產出（每個情境一行：id、地圖、陣營與單位數、目標、一句劇情鉤子、seed 1/2/3 的 winner／reason／rounds）／沒做到或證據不足的／需要決定的事，含「AI 不懂得追目標」這類觀察），末尾「以後交接書該點名的工具」。

## 驗收（固定 3 條，做完就停）

1. 8 個檔存在且 `npm run check` 對它們 0 errors。
2. `measure.jsonl` 有 24 行（8 情境 × seed 1 2 3），都沒有拋錯。
3. 每個情境三個 seed 中至少一個 winner 非 null，或 timeout 但 deaths > 0。

## 失敗怎麼處置

- 測出來是壞的 → 調到合格；調不好的那個情境保留並在 REPORT 寫明原因，不要刪。
- 測不出來 → 不回滾，發 `BLOCKED`。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bat-scen-b`。本線團隊：`teams/content-battle`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-bat-scen-b --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-b/REPORT.md`。
- 必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

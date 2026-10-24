# 任務：新增 6 個用到新單位的戰鬥情境（scenario），每個都用 measure 跑過

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、`content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-world.md`（ScenarioDef、Objective、`allies`、killTarget、globals）、`wf/workflows/planning/specs/core/ai.md`、`wf/workflows/planning/specs/world/factions.md`、`wf/workflows/planning/design-notes/world.md` 末兩段（2026-10-24 參戰型裁示）——**親自讀，不靠本交接書的摘要**。範本：`content/base/scenarios/rift-edge-nest.json`（盟軍 slot 寫法）、`content/base/scenarios/skirmish-whitegloves.json`。目標判定真相：`src/rules/objectives.ts`；組裝：`src/sim/run.ts` 的 `scenarioToSetup`。

## 背景與唯一目標

戰場內容線 `lead-content-battle` 已新增地形、地圖（`content/base/maps/` 下非 `skirmish-20`／`rift-edge-60` 的檔，讀各檔的 deployZones／exits／globals，或讀 `wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/REPORT.md`）、勢力（`content/base/factions/` 共 10 個）、AI 設定（`content/base/aiprofiles/` 的 focus-fire、guerrilla、bodyguard、sniper-perch、tide-cultist、convoy-runner）。唯一目標：用它們寫出下表 6 個情境，每個都能被自動對戰跑完。

使用者裁示（重要）：玩家獵團是自營傭兵，**各勢力自己組織部隊作戰，傭兵參戰**——所以多數情境是「參戰型」：玩家 slot 與勢力友軍 slot 用 `allies` 同盟、友軍由 AI 指揮（slot 的 `ai` 欄給 aiprofile）、**友軍規模比玩家大**；也有勢力間交火、傭兵選邊。

風格裁示（重要）：使用者要**太空歌劇、不要硬科幻**（`wf/workflows/planning/design-notes/world.md` 末段，「想想 Warframe」）。情境沒有 name 欄就在 REPORT 每個情境給一個有奇觀／神話感的作戰代號與一句劇情鉤子（例：「灰燼渦下的三王會戰」），不寫工程術語。若 `content/lore/README.md` 或 `content/lore/style.md` 存在，用語以它為準。

## 範圍（排除法寫死）

- 只做：新增 `content/base/scenarios/{下表 id 名段}.json` 6 個檔。
- 不做：改任何既有檔；新增 frames／monsters／persons／species／components／abilities／effects／terrains／maps／factions／aiprofiles（缺什麼寫 REPORT「需要決定的事」）；`src/`；`content/base/world/`。
- **只能用已 commit 的單位**：frames／monsters／persons 一律以 `git ls-tree --name-only HEAD content/base/{frames,monsters,persons}/` 列出的為準（工作樹裡未 commit 的檔不可引用）。**每個情境至少一半單位是本輪新 commit 的單位**（新機械系 frame——如 longspear-*、bulwark-*、selene-*、anvil-*、thirdblade-*、tidefaith-*、union-*、shellsoc-*——與新怪獸 monsters）；選有 `innateAbilities` 的 frame（UnitSpawn 不能裝部件，沒內建能力的機體是空手）。各 frame 座位看 bodyplan `seats`；機魂（person `kind:"soul"`）坐 soul 座。可參考 `wf/workflows/dispatch/handoffs/lead-content-mech/catalog.json` 與 `wf/workflows/dispatch/handoffs/lead-content-monster/` 的 catalog／REPORT 選角。
- 件數 gate：新檔超過 8 個就停下回報；容量 gate：單檔超過 50 KB 就停下回報。

## 6 個情境（id 寫死；地圖、類型照表，單位配置、輪數、seed 由你設計）

| id | 地圖 | 類型 | 陣營組合 | 目標要點 |
|---|---|---|---|---|
| scenario/lunar-blockade-run | map/lunar-crater-36 | 人對人（月面暗）：突破塞勒涅封鎖 | player（新摹機）vs `selene-whitegloves`（新 selene-* 機＋機魂） | reachExit（`params.target` 寫玩家某單位的執行期 id，如 `player-0`；reachExit 只認 `unit`）或 eliminate |
| scenario/beast-stampede | map/mineral-waste-64x40 | 參戰：獸潮衝鋒 | player＋ally(`residual-league`，新殘聯機，`aiprofile/focus-fire`，大軍) vs 獸族（潮狼群＋一隻 A 級二名獸） | killTarget 二名獸 |
| scenario/dream-bed-burn | map/mycelium-glade-32 | 參戰：燒菌床 | player＋ally(`dhaka-weavers`) vs 菌絲族（菌床／腐守等） | killTarget 菌床類；或 hold 林心 |
| scenario/mirror-choir-vigil | map/shard-mirror-28 | 人對怪：碎鏡守夜 | player 單幹 vs 異形族（鏡類、聖詠類） | survive ≤ 12 輪；敵方 eliminate 為 lose 路徑 |
| scenario/unbound-raid | map/delta-ruins-56 | 勢力間交火＋怪：潮信會劫拘束艙 | player＋ally(`bay-seventh-post`) vs `tide-faith`（tidefaith-* 機＋bio frame）vs third 蟲群新怪 | eliminate；ally 規模 > 玩家 |
| scenario/siege-beetle-convoy | map/convoy-road-80x20 | 參戰：護送競爭獵團車隊（兩邊下注味） | player＋convoy(`anvil-hunters`，anvil-* 機，`aiprofile/convoy-runner`)＋ally(`salt-gull-hunters`) vs 攻城甲蟲等新蟲族 | escort convoy 的 frame def；敵方 killTarget 同 def 為 enemy win |

前兩組的教訓（`cx-bat-scen-a/REPORT.md`、`cx-bat-scen-b/REPORT.md` 可讀）：玩家敗北路徑用 `for:enemy, onComplete:win` 表達，不要用 `for:player, onComplete:lose`（lose 的勝方會挑到同盟 slot）；部署用固定格讓雙方開場就接近前線；用語照 `content/lore/style.md`。

注意：`node src/sim/measure.ts` 強制 20 輪上限，所以 survive／hold 的輪數要 ≤ 20；ally／third slot 的 `deployZones` 鍵名要和地圖一致（地圖沒有的 zone 就用 `at:{x,y}` 固定格）。`neutral` 在戰場算敵對，同盟要用 `allies` 寫明。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-bat-scen-c --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-bat-scen-c --up …` | 上線 PROGRESS 與終局回報 |
| `npm run check`（專案根） | 每寫完一個情境 |
| `node src/sim/measure.ts {情境 id} 1 2 3`（專案根） | 每個情境都要跑；不拋錯，三個 seed 都結束（winner 非 null）或 timeout 平手但有交戰（deaths > 0 或 hits > 0） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-c/`；可跑 `npm run check`、`node src/sim/measure.ts`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；**不 commit**（領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。別的內容線可能同時在新增檔、`npm run check` 可能因別人的半成品報錯——只要錯誤不在你的檔就照常進行並在 REPORT 註明。

**分清錯誤來源**：工具或環境出錯 → 發 `BLOCKED`；你自己寫的情境出錯 → 自己修。

## 工作

1. 上線發 PROGRESS。
2. 逐個寫情境 → `npm run check` → `measure 1 2 3`；結果不合理（一方 1 輪內全滅、20 輪零交戰、waitRatio ≥ 0.5 且無勝負）就調部署與兵力再跑。
3. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-c/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 情境 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/`（6 個新檔） |
| measure 原始輸出 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-c/measure.jsonl`（每行一筆，加 `scenario` 欄） |

REPORT 四段（做了什麼／產出（每個情境一行：id、地圖、陣營與單位數、目標、一句劇情鉤子、seed 1/2/3 的 winner／reason／rounds）／沒做到或證據不足的／需要決定的事，含「AI 不懂得追目標」這類觀察），末尾「以後交接書該點名的工具」。

## 驗收（固定 3 條，做完就停）

1. 6 個檔存在且 `npm run check` 對它們 0 errors。
2. `measure.jsonl` 有 18 行（6 情境 × seed 1 2 3），都沒有拋錯。
3. 每個情境三個 seed 中至少一個 winner 非 null，或 timeout 但 deaths > 0。

## 失敗怎麼處置

- 測出來是壞的 → 調到合格；調不好的那個情境保留並在 REPORT 寫明原因，不要刪。
- 測不出來 → 不回滾，發 `BLOCKED`。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bat-scen-c`。本線團隊：`teams/content-battle`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-bat-scen-c --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-c/REPORT.md`。
- 必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

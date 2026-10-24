# 任務：調整 22 個戰鬥情境的部署、目標與參數，讓 AI 對 AI 不再幾乎全是 timeout 平局

> 領導 `lead-playtest` 寫給 codex 工人 `cx-pt-scen`。**交接書是唯一契約**。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/user.md`——親自讀。內容背景：`content/base/scenarios/*.json`、`content/base/maps/*.json`（`deployZones`、`exits`）、`content/base/aiprofiles/{focus-fire,guerrilla,bodyguard,sniper-perch,tide-cultist,convoy-runner}.json`、`content/base/frames/*.json`（`innateAbilities`）、`content/base/abilities/*.json`（`tags` 含 `conventional-arms` 者打 kaiju ×0.1，見 `content/base/rules/damage-modifiers.json`）、`src/sim/run.ts` 的 `scenarioToSetup`（`objective.params.target` 比對 `mech`／`monster` id 時會匹配**所有**同型單位；給單位 id 如 `convoy-0` 時只匹配那一台）、`src/rules/objectives.ts`（各目標判定）、`src/ai/policies/flee.ts`（convoy-runner 用的 flee 參數意義）、情境量測紀錄 `wf/workflows/dispatch/handoffs/lead-content-battle/catalog.json`；試玩回報 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/r1/p1.json`～`p5.json`；問題表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/issues.json`（本線負責 ISS-001 過渡、002、005 參數、006、007、008、009、010）。

## 背景與唯一目標

全情境 AI 對 AI（seed 1–5、情境原輪數）幾乎全部 20 輪 timeout 平局；手打 18 場只贏 3 場。主因之一是情境機體沒有武器組件（引擎缺口，另一條線在補 `UnitSpawn` 裝配欄，**本線不碰引擎**），只剩內建凡鐵頭吼（conventional-arms，打 kaiju 只剩 1/10）。本線唯一目標：**只改情境／地圖／6 個 aiprofile 的資料，讓每個情境有明確的勝負出口**。

## 規格（寫死）

1. **過渡換機**（ISS-001，頂層已同意）：在對手含 kaiju（蟲／獸／菌／異形）的情境，把 player／ally／convoy 方「只有 conventional-arms 內建能力」的人類機，換成**同家族**、帶非 conventional-arms 內建攻擊的型號（例：`frame/moji-tern`→`frame/moji-tern-guard`（有 mx-frame-strike 近戰）；`frame/hound-mk2` 沒有同家族替代時可換同級 `frame/thirdblade-swordfish-iii`／`frame/anvil-ii` 等近戰型，或加 1 台帶 `arc-emitter` 系的機——先查 frames 實際 innateAbilities）。每個換掉的單位在 REPORT 的換機表列一行（情境、slot、舊→新、理由）。不換 enemy 方。
2. **護送**（ISS-006、010）：`convoy-run`、`siege-beetle-convoy`、`tidal-flat-evac`、`shell-excavation-escort`：escort 目標與失敗條件改用**單位 id**（`convoy-0`…，依該 slot 的 units 順序），失敗條件寫成逐台 `killTarget`（任一護送對象陣亡即判負），不再用 frame id 比對；siege-beetle-convoy 車隊開場離出口拉到至少 25 格；每個護送情境確認車隊到出口的路徑可達。
3. **斬首目標**（p1 回報）：所有 `killTarget`／`escort` 的 `target` 若是 frame／monster id，檢查它是否也匹配到非預期陣營（例 quarry-duel 的 `frame/moji-tern` 連玩家自己的燕鷗也算進去，永遠達不成）；一律改成單位 id（`enemy-0` 這類）。
4. **落敗條件**（ISS-009）：每個情境的玩家方都要有落敗出口（玩家方＋盟軍全滅即敗，用 `eliminate` + `slots` 或 `onComplete:"lose"`）；overpass-wager 必修。
5. **部署**（ISS-007）：大地圖與混戰情境（badlands-sweep、delta-four-way、overpass-wager、rival-claim-jump、unbound-raid、crater-three-way、nest-core-assault、beast-stampede、waste-encirclement 除外——它的包圍是設計）各陣營開場彼此至少 8 格、第三方不得貼玩家出生（≥ 10 格）；接敵應在第 2–4 輪。可改 `at` 座標或改用地圖 `deployZones`（`at:"zone"`，需要時在 maps 檔調 deployZones）。
6. **人物不重複**（ISS-008）：同一情境內同一人物 id 不得出現在兩台以上單位；不夠用的改填其他現成人物（`content/base/persons/`）或省略 persons（若該 frame 不需駕駛也能出場——先確認 `scenarioToSetup` 與規則允許，不確定就保留一名但換不同人）。
7. **車隊與狙擊 AI**（ISS-005；p1：sniper-perch 守點只送 end、被貼身也不開火）：調 `aiprofiles/convoy-runner.json` 參數（看 `flee.ts` 評分），讓車隊在 seed 1–5 都會往出口移動（量測：車隊單位 20 輪內位移 > 0，最好抵達或撤離）；`sniper-perch` 調到會對射程內敵方開火；其他 4 個 aiprofile 只在明確改善時調。
8. **平衡目標**（p1：lunar-blockade-run 第 2 輪直衝出口就贏、mirror-choir-vigil 全隊只按 end 也能零傷獲勝，這兩個要變難）：用量測工具在 seed 1–5、情境原輪數下：全部 22 情境合計平局（timeout）率 ≤ 60%（基準 ≈ 100%）；沒有情境 5/5 在 ≤ 3 輪就分出勝負；每個情境至少 1 個 seed 不是平局，做不到的在 REPORT 說明原因（例如需要武器裝配）。可調手段：雙方數量、等級（`grade`）、部署、目標參數（hold 的 rounds／zone 大小、survive 輪數、killTarget 對象）、情境 `rounds`（20–30）。

## 範圍（排除法寫死）

- 只做：`content/base/scenarios/*.json`（**`skirmish-whitegloves.json` 與 `rift-edge-nest.json` 不改**：測試與黃金 hash 依賴它們）、`content/base/maps/*.json`（只改 `deployZones`、`exits`，不改地形格）、`content/base/aiprofiles/{focus-fire,guerrilla,bodyguard,sniper-perch,tide-cultist,convoy-runner}.json` 的 `params` 數值。
- 不做：其他任何 `content/` 檔（frames、abilities、components、persons、monsters、effects、terrains、world、lore 都不改）、`src/`、`test/`、`package.json`、`wf/`（REPORT 除外）。不新增情境或地圖檔。
- 件數 gate：改動檔超過 30 個就停下回報；容量 gate：單一情境檔改動後超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-pt-scen --once` | 每完成一個工作步驟跑一次，讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/sweep.ts [--seeds 1,2,3,4,5] [scenario…]` | 量測（每情境一行 JSON：winners、rounds、deaths）；大地圖 badlands 約 100 秒／5 seed |
| `npm run check` | 內容載入 0 錯誤 |
| `npm test` | 確認沒打壞測試（黃金不得變） |


## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；臨時檔放 `/tmp/cx-pt-scen/`。可跑 `node`、`node --test`、`npm run typecheck`、`npm run check`、`npm test`、量測腳本。**不要 commit**（commit 由領導做），REPORT 列檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導在沙箱外重跑）。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/REPORT.md`，不要只貼在回覆裡。**（在 worktree 時寫到 worktree 內同一相對路徑，領導會搬。）

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 情境／地圖／aiprofile | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/maps/`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/aiprofiles/` |
| 量測結果 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/sweep-before.jsonl`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/sweep-after.jsonl` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（沙箱擋）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pt-scen`。本線團隊：`teams/playtest`。上線先發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pt-scen --up PROGRESS 'cx-pt-scen 上線開工' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pt-scen --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/REPORT.md（在 worktree 時用 worktree 內那份的絕對路徑）`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記。

## 工作

1. 跑一次全量測存 `sweep-before.jsonl`（可先跑你要改的那批）；`inbox_poll --once`。
2. 規格 2、3、4、6（結構修正）；`npm run check`；`inbox_poll --once`。
3. 規格 1、5、7；量測；`inbox_poll --once`。
4. 規格 8 迭代調參（每輪只量有改的情境），最後全量存 `sweep-after.jsonl`；`npm test`、`npm run check`。
5. 寫 REPORT（含換機表、每情境前後勝負分布表）並回報。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run check` 0 錯誤；`npm test` 0 fail（黃金 hash 未變）。
2. `sweep-after.jsonl` 存在且涵蓋 24 情境 × seed 1–5；22 個可改情境合計 timeout 率 ≤ 60%，或 REPORT 逐情境說明做不到的原因。
3. 4 個護送情境的 escort／失敗條件都用單位 id；每個情境玩家方都有落敗條件（REPORT 附檢查指令與輸出）。
4. 同一情境內無重複人物 id（REPORT 附檢查指令與輸出）。
5. REPORT 四段齊，含換機表與前後勝負分布表。

不要為了「更保險」加驗其他東西。

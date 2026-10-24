# 任務：在隔離 worktree 新增第三刃獵團的 cx3- 摹機小系列（batch pilot-mech-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/ability-forms.json`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/playtest-baselines.json`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`src/mcp/README.md`、`content/lore/factions/third-blade.json`、`content/base/world/lineages/tide-fin.json`（相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同）。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

使用者要試「codex 在既有框架上大量填內容，但不亂改別的東西」。本批是試點：在你的隔離 worktree 裡**只新增**第三刃獵團（潮鰭殼血統 `lineage-tide-fin`）的一個新摹機小系列——3 台 frame（D、C、B 三級、同一系列、同血統）＋它們需要的 components／abilities／effects，並用 MCP 親手試玩與 `content:probe` 自測。你的產出會被領導用路徑閘門與驗收鏈檢查，通過才帶回主 repo。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-mech-01/` 新增檔，**只能**放在 `content/base/frames/`、`content/base/components/`、`content/base/abilities/`、`content/base/effects/`、`content/base/scenarios/` 五個目錄（scenarios 只准 1–2 個 `cx3-` 展示情境，給 MCP 試玩用：MCP server 只載 `content/base`，scratch pack 進不了 MCP），檔名一律 `cx3-` 開頭（例 `cx3-reef-needle-d.json`），一檔一筆、檔名＝id 的 name 段。
- 系列：取一個第三刃語感（魚名，見 mechs.md「勢力各有一套語感」）、**不與既有劍魚系列撞名**的新系列；三段命名照 mechs.md（D 代號、C／B 系列＋型號）。tags 含 `mech`、`human`、`lineage-tide-fin`、`faction-third-blade`、`series-{系列}`。bodyplan 用既有的 `bodyplan/mx-*`（不新增 bodyplan）。每台必填 `defaultLoadout`（slot id 查該 bodyplan 檔），配裝原則照 mechs.md，至少一把不帶 `conventional-arms` 的武器。
- 部件／能力可重用既有 `mx-*`；新的才寫 `cx3-*`。數值照 numeric-bands，超帶寫理由。
- 不做：**修改或刪除任何既有檔**（含 registries、`content/base/world/models/`、lore 的 faction `mechSeries`——需要的話寫進 REPORT「需要決定」）；新增 bodyplans／monsters／scenarios／world 任何東西；`src/`、`schemas/`、`test/`、`wf/`（除下面交付的報告目錄）、`content/index/`、`package.json` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（socket、scratch pack、筆記、log 一律放 `/tmp/cx-pilot-mech/`）——閘門會把 worktree 裡任何非允許路徑的新檔或改動記成越界。
- 件數 gate：新增檔超過 20 件就停下回報；容量 gate：單檔超過 16 KB 或全部產物超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一檔跑一次，末行要 `OK 0 errors` |
| `npm run content:probe -- {新 frame／ability id…} --n 5 --json -` | 自測勝率、平手率、能力使用、超帶欄位 |
| `node src/mcp/server.ts`（**stdio**，JSON-RPC 一行一則） | MCP 試玩（規程見 acceptance-playtest.md 第三節）。**沙箱禁止 Unix socket listen（EPERM），不要用 `cli.ts serve --socket`**；改用 stdio：照 `src/mcp/e2e.test.ts` 的 `withServer` 寫一支 driver 放 `/tmp/cx-pilot-mech/`（initialize → notifications/initialized → tools/call），或用 `mkfifo /tmp/cx-pilot-mech/in` 讓一個背景 `node src/mcp/server.ts < /tmp/cx-pilot-mech/in > /tmp/cx-pilot-mech/out.jsonl` 常駐、逐行寫入請求以便一步一步手打。工具名與參數同 `src/mcp/README.md`。收工結束自己的行程 |
| `wf/tools/inbox_poll.sh cx-pilot-mech --once` | 每完成一步讀 orders／mail（在主 repo 路徑跑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh`） |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`、`columns`） | 讀規矩裡的 wf-table/1 資料檔（AGENTS 寫的 tabledb 在本專案的實際路徑是 `wf/tools/tabledb.py`） |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與「交付」列的報告目錄；可跑 testing 工作流列的驗證指令與測試；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 dispatch/lessons）。MCP 的 `ui_screenshot` 不要用。
**子代理上限 2 個**：可以再派子 agent，模型隨意（量大呆板的活可用 gpt-6-luna 省成本），只准為推進正事開；子 agent 若做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，它們一樣只能寫本 worktree 的允許路徑（同一個閘門會檢查）。REPORT 記下開了幾個、什麼模型、做了什麼、品質如何。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑（例如找不到檔就換正確路徑）、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。（2026-10-24 第一輪兩條線因把 `tools/tabledb.py` 打成相對 worktree 根的錯路徑就停下，這不該停。）沙箱內 `node --test` 計數不準（每檔只算 1 項）是已知現象，不算阻塞，照實寫進 REPORT 即可。

## 工作

1. 讀「先讀」全部；讀第三刃 lore、tide-fin lineage、既有劍魚三台（`content/base/frames/thirdblade-*.json`）與它們用的 `mx-*` 部件，抓血統語彙（鰭刃、潮流、燼爆、一刀開一刀收）。
2. 定系列名與三台定位（三台不同定位，見 mechs.md 角色定位矩陣），寫 frames＋新部件／能力／效果；每檔後 `npm run check`。
3. 自動對戰煙霧**改用 `content:probe`**（`sweep.ts` 只吃單一內容目錄，acceptance-playtest 第二節的逗號雙包寫法跑不動——已知文件錯誤，不是你的錯）：probe 每台 5 seed 0 例外、新能力有被 AI 用，即算煙霧通過。
4. `content:probe` 自測三台與新能力；失衡照 acceptance-playtest「怎麼調」改，一次一個旋鈕。注意：既有同級單位（例 `frame/thirdblade-swordfish-iii`）在 1 對 1 也常因 AI 撤退判負，先跑它當參照再判斷你的數字。
5. 寫 1–2 個 `content/base/scenarios/cx3-*.json` 展示情境（照 templates.json 情境範本與 battle-field.md：既有地圖、玩家放你的新機＋既有駕駛員、敵方放既有怪獸，玩家要有落敗條件、rounds 20–30）。MCP 試玩至少 3 場（每台新機至少進一場；至少 1 場手打、其餘可 `battle_auto` 或 `spectate`）：每場原始輸出存 `mcp-log/{場次}.txt`（完整 call 輸出，含 `outcome`），量測寫進 `playtest.json`。
6. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-mech-01/content/base/{frames,components,abilities,effects}/cx3-*.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/REPORT.md` |
| 試玩紀錄 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/playtest.json` |
| MCP 原始 log | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/mcp-log/*.txt` |

`playtest.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-24","columns":["scenario","seed","rounds","winner","reason","mode","ourLosses","enemyLosses","newAbilityUses","aiUsed","log"],"link_columns":["log"],"rows":[…]}`；`mode` 填 `mcp-manual`／`mcp-auto`／`mcp-spectate`；`log` 是相對 playtest.json 的路徑（例 `mcp-log/m1.txt`）。情境是 scratch pack 裡的就寫全 id（`smoke:scenario/…`），並把 scratch 情境 JSON 一起貼進該場 log 開頭。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼——件數表含每檔 id／等級／定位；產出——數值帶逐項「指標＝值（帶內／帶外＋理由）」、probe 數字、MCP 每場一行；沒做到或證據不足的；需要決定的事——例如 world/models 與 lore mechSeries 待補）；再一段「子代理」（開了幾個、模型、做什麼、品質）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有**「範圍」允許目錄下的 `cx3-*.json` 新檔（`git -C . status --short` 除 `node_modules` 外只見這些 `??`），件數 ≤ 20。
2. worktree 內 `npm run check` 末行 `OK 0 errors`；`node content/lore/check.ts` 0 錯。
3. 三台 frame 都有 `defaultLoadout`、tags 含 `lineage-tide-fin` 與同一個 `series-*`，等級為 D、C、B 各一。
4. `content:probe` 對三台各跑 `--n 5`，數字貼進 REPORT（含參照 `frame/thirdblade-swordfish-iii` 的同條件數字）。
5. `playtest.json` ≥ 3 列 MCP 場次，每列 `log` 檔存在且含 `outcome`。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西；某個子代理的產出若不在這張清單上，就不要開它。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來**（沒跑成、拿不到證據）→ **保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pilot-mech`。本線團隊：`teams/codex-pilot`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pilot-mech --up DONE '一句自足結論' /tmp/cx-pilot-mech/final.md（STATUS 換成實際狀態）`（沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-pilot-mech --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「只新增 cx3- 內容＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

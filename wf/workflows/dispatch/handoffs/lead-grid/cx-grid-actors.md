# 任務：在大地圖上加行動者（五種簡化 AI）、接觸與遭遇四選、迷霧資訊年齡、部隊影子

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/lead-grid/PLAN.md`、`wf/workflows/dispatch/handoffs/lead-grid/cx-grid-migrate/REPORT.md`、`wf/workflows/dispatch/handoffs/lead-grid/cx-grid-blight/REPORT.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/actors-and-encounters.md`、`movement.md`、`map-and-terrain.md`「可視區與迷霧」、`migration-and-testing.md`（只讀，不改）。

## 背景與唯一目標

營運層已是方格（地點、逐格移動、蝕塊）。本線讓大地圖**有東西在動**：勢力部隊、巡邏、商隊、裂獸群、別的獵團五種行動者每天照小表選目標、尋路、走；碰到船就是遭遇，玩家選迴避／追擊／交涉／開打；玩家只看得到視野與天網範圍內的行動者與蝕域（資訊年齡）。做完後 `s.actors` 有 40–200 個活的行動者，`sim:campaign` 照常跑且遭遇頻率合理。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：新檔 `src/ops/world/actors.ts`、`src/ops/world/fog.ts`、`src/ops/world/encounter.ts`（可選）與其測試；改 `src/ops/world/move.ts`（接觸、追擊 `sail {actor}`、淺蝕野群改成臨時群行動者）、`src/ops/time/tick.ts`（段 2c 行動者 AI、段 3 行動者移動＋接觸、段 3 末重算視野）、`src/ops/time/commands.ts`（遭遇選擇的指令路由）、`src/ops/war/{loc,forces,operations}.ts`（`force` 行動者是作戰部隊在圖上的影子：`march` 建立、`aftermath` 刪除、`ForceState.pos` 由它驅動）、`src/ops/sortie/scenario.ts`（`trigger:"intercept"` 情境：swarm 由 `grades`／`str` 換預算、force 由 `ForceUnit[]` 展開、band 由預算；接觸範圍內第三方敵對入 `third` slot、友軍入 `ally`）、`src/ops/content/{load,check,opseffect}.ts`（`world/actors/` 資料夾 kind `actor`、驗證、`spawnActor`／`setGoal`／`reveal` 效果）、`src/ops/state/types.ts`（`ActorState`、`KnownCell`、`CampaignState.pendingEncounter` 與相關型別）、`src/ops/text/`（遭遇 prompt、`Sighted` 等事件文字、`航 @名` 解析到行動者）、`src/ops/sim/{policies,invariants,campaign,cli}.ts` 與測試（政策處理遭遇、行動者不變量、每潮月一行加行動者數與遭遇數）、`src/mcp/campaign-view.ts`（行動者欄）；內容：新資料夾 `content/base/world/actors/`（`force`、`patrol`、`caravan`、`swarm`、`band` 五張表）、新檔 `content/base/world/services/uplink.json`、新檔 `content/base/world/templates/grid-actors.json`（事件文字模板）、`content/base/world/places/{dhaka,singapore,selene-city}.json` 的 `services` 加 `service/uplink`、`content/base/world/actions/ops-world.json` 的 `rules`（行動者與迷霧係數）；`test/campaigns/`（黃金重產）；REPORT 目錄 `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-actors/`。
- 不做：蝕塊規則（`world/{blight,rifts,pressure,places}.ts` 只讀；需要改寫進 REPORT）；`src/ui-adapter/`（大地圖面板已由 `cx-grid-ui` 做，讀 `s.actors`／`known` 的介面不得改名）；護送契約綁商隊、`join` 契約綁 force 的契約端改動（寫進 REPORT）；交涉的完整對白檔 `dialogues/encounter-*.json`（本線用行動者表內建的交涉選項，標 `SPEC-GAP`）；另外四張地球圖；`content/` 既有檔文字欄與 `content/lore/`；`src/ai/`、`src/rules/`、`src/core/`；`wf/`（除 REPORT 目錄）。
- 件數 gate：改＋新增檔超過 60 件就停下回報；容量 gate：單一新檔超過 40 KB 就停下回報。任一觸發都停。

## 規格（照 spec actors-and-encounters；與 spec 衝突處以本段為準並標 `SPEC-GAP`）

行動者是純函式 `(actor, world, rng) → actor'`，依 `id` 序迭代，一天最多重算一次路徑，AI 讀真值（無迷霧）。表欄位至少：`mp`、`layer`（air／ground）、`contact`（格）、`str` 範圍、生成規則、`aiChoice`（被玩家攔時的四選權重）、`parley`（交涉選項，`OpsEffect` 列表）、行為參數（巡邏追擊天數 3、商隊停留 2 天、蟲群第 7 天回巢、群離開蝕域每天 `str −5%` 等）。生成：巡邏＝勢力地盤每座城 0–1 支；商隊＝有 `service/market` 的城與城之間定期出發；裂獸群＝`anchored` 裂縫在大潮日放出（族決定節拍）；別的獵團＝帶獵團標籤的勢力（`anvil-hunters`、`salt-gull-hunters` 等）各 1–2 支；`force`＝作戰影子。全世界目標 60–120 個，最少 40、最多 200（超過不再生成）。**接觸**：每個行動者走完一格、以及船走完一格時檢查切比雪夫距離 ≤ 雙方較大的 `contact`；敵對或 `wary` 進範圍 → 船停、`pendingEncounter` 寫入、`pendingTicks` 保留；同一對一天只觸發一次；非敵對擦身只發 `Sighted`。**遭遇四選**（`Screen.prompt` 1–4，不合法的灰掉並寫原因）：迴避＝速度檢定（船 mp ≥ 對方 ×1.2 自動成功、花 1 天燃料 ×2；否則 `d100 < 50 + (船mp − 對方mp)`，深蝕格 −20，失敗轉戰鬥且情境 `ambush`）；追擊（對方想逃時）反過來；交涉只對人類行動者（選項來自表的 `parley`）；開打寫 `pendingBattle`（`trigger:"intercept"`、`loc`、`actors[]`）。敵對判定用既有 `RelState` 與 `FactionState.rep`，裂獸永遠敵對；AI 主動攔船用同一張表的 `aiChoice`。淺蝕／深蝕／核的每日遭遇機率（`rules.grid.blightEncounter`）中了就生成一支臨時 `swarm` 行動者在船旁，再走同一套遭遇流程。`sail {actor}`：每天段 3 開頭以目標目前位置重算；追不上（對方 mp ≥ 船）在下令時回 `cannot-catch`。**迷霧**：每天段 3 末，船半徑 `rules.grid.sight`（地形 `sight` 修正、月面 +2）∪ 每個 `rep ≥ 0` 且有 `service/uplink` 的地點半徑 `uplinkSight` ∪ 本日 `reveal`；可見格寫 `s.maps[map].known[cellKey] = { day, actors[], blight }` 快照；`known` 必須是當日真值的子集（不洩漏未來）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run typecheck`、`npm test`、`npm run check` | 每完成一步跑 |
| `npm run sim:campaign -- --months 12 --seed 1`（另跑 seed 2、3） | 量行動者數與遭遇率 |
| `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts` | 行為變更後重產黃金 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-actors --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（要丟的檔搬 `/tmp/cx-grid-actors-trash/` 並在 REPORT 列出）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 2 個，只准為推進正事開，它若做實質工作也要親自讀 AGENTS.md 與上列規矩，且只能寫本線範圍。工作樹裡有其他領導線在寫 `src/ai/`、`content/` 文字欄與新內容檔；看到別人的未提交改動不要還原。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準是已知現象。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 的 cli／e2e 測試與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**；REPORT 註明，完整 `npm test` 由領導在沙箱外重跑。

## 工作

1. 讀「先讀」與 `src/ops/world/move.ts`、`src/ops/time/tick.ts`、`src/ops/war/{loc,forces,operations}.ts`、`src/ops/sortie/scenario.ts` 現況。
2. 型別、載入器 `actors/`、五張表、`spawnActor`／`setGoal`／`reveal` 效果與 check 驗證（雙向測試）。
3. `actors.ts`：生成、五種 AI、移動（共用 `findPath`）、despawn；`force` 影子接上作戰。
4. 接觸與遭遇四選、臨時野群、追擊；`intercept` 情境生成（含 `third`／`ally` slot）；政策（greedy：對方 `str` 低於己方估計就開打、否則迴避；random 隨機合法選項）。
5. `fog.ts` 與 `uplink`；文字層與 MCP。
6. 測試（spec migration-and-testing (2)(e)(f) 與 (3) 的行動者部分）：行動者永不在不可進格、地面行動者永不在深蝕；`pendingEncounter` 非空時船 `pos` 不變；同一對一天只觸發一次；迴避自動成功門檻（mp ×1.2）正確；`sail {actor}` 每天重算且追不上時下令即拒；`known` ⊆ 真值；無行動者連續 10 天 `goal` 不變且未移動（卡死偵測）；同 seed 兩次結果相同；黃金戰役一條：`sail 格 → 遭遇 → choose 迴避 → Evaded → sail 地點 → Arrived`。
7. 量測：`sim:campaign --months 12` 三個 seed，記每潮月行動者數、遭遇數；目標行動者 ∈ [40, 200]、12 潮月平均遭遇 0.1–0.4／天、單日遭遇 ≤ 2、每 tick < 50 ms；超標就調 `rules`（一次一個旋鈕）並記錄。
8. 跑「必用工具」全部、黃金重產，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-actors/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/actors.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/world/fog.ts`（及範圍列的其他檔） |
| 行動者表 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/actors/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-grid/cx-grid-actors/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單；產出——新測試名、三個 seed 的行動者數／遭遇率／tick 耗時表與調過的係數；沒做到或證據不足的——含 `SPEC-GAP`；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` 0 錯；`npm run check` 0 錯。
2. `npm test` 全過（沙箱外由領導重跑）。
3. 「工作」第 6 步 9 類測試都存在且通過（REPORT 列測試名）。
4. `npm run sim:campaign -- --months 12` 三個 seed 不拋錯；行動者數全程 ∈ [40, 200]、平均遭遇 0.1–0.4／天（REPORT 附表）。
5. `content/base/world/actors/` 有五張表，`npm run check` 對壞表（未知 kind、`mp` 非正數）各有一個報錯測試。
6. REPORT 存在，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-actors`。本線團隊：`teams/grid`。上線先發 `PROGRESS`；每完成「工作」一步發一封 `PROGRESS`（一句話）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-actors --up DONE '一句自足結論' /tmp/cx-grid-actors/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-actors --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「行動者＋遭遇＋迷霧且驗證全綠」；蝕塊規則、UI、契約綁定一律不做——此條優先於工作步驟與 spec 原文。

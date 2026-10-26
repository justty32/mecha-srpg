# src/mcp — 給 agent 玩與測的 MCP server

stdio MCP server（JSON-RPC 2.0，一行一則；協定版本 `2025-06-18`，也接受 `2025-03-26`／`2024-11-05`）。**零執行期依賴**：協定層自己寫，只用 node 24 內建。戰鬥工具走 `src/sim/session.ts`（不 import rules／ai），營運工具走 `src/ops/` 對外 API，截圖用已安裝的 Playwright headless Chromium。

## 啟用

- **Claude Code**：專案根 `.mcp.json` 已登記 `mecha-srpg`（`node src/mcp/server.ts`，cwd＝專案根）。重開 Claude Code，第一次會問要不要啟用這個專案 MCP server，選同意；之後 `/mcp` 看得到 `mecha-srpg`，工具名是 `mcp__mecha-srpg__battle_new` 這類。
- **手動**：`npm run mcp`（stdin／stdout 走協定；log 只寫 stderr）。
- **沒有 MCP 用戶端**（別的 agent、shell）：`node src/mcp/cli.ts serve --socket m.sock` 背景常駐，再 `node src/mcp/cli.ts call --socket m.sock battle_new '{"scenario":"scenario/skirmish-whitegloves"}'`、`node src/mcp/cli.ts list --socket m.sock`。unix socket 路徑有長度上限（約 100 字元），用短的相對路徑。

## 工具

回傳都是「一段中文摘要＋一段精簡 JSON」（JSON 也放在 `structuredContent`）。參數錯誤或遊戲拒絕時回 `isError`，訊息說原因與下一步。

**戰鬥**（session id `b1`…，可多場並存）：`battle_list_scenarios` 列情境；`battle_new(scenario, seed?, playerSlot?, spectate?, rounds?, autoAdvance?)` 開一場，預設玩家 `player`、AI 自動推進到輪到玩家；`battle_observe(id, detail?, map?, window?)` 看回合、輪到誰、我方與已知敵方（部件層血量、資源、效果、位置）與 ASCII 地圖；`battle_legal_actions(id, unit?, maxMoves?, maxTargets?)` 列可達格（`"x,y:cost"`＋移動範本）、能力與合法目標（命中率、不可用原因）、待機／結束／撤離／棄機，每項附可直接送出的 `action`；`battle_act(id, action)` 送指令（`move` 可用 `to:{x,y}`），回本步與 AI 推進的事件；`battle_step_ai(id, until?, max?)` 推進 AI（command／unit／human／player／end）；`battle_auto(scenario, seed?, rounds?)` 全 AI 跑完，hash 與 `npm run sim` 相同；`battle_save`／`battle_load`（重播並驗 hash）、`battle_events(id, since?, limit?)`、`battle_close`。

**批次戰鬥**：`battle_act_many(id, actions[], stopOnReject?=true, observe?=false)` 依序送與 `battle_act` 相同的 action，回 `results`（每步 index／ok／command 或 reason／事件游標）、`stopped`、`remaining`，合併事件沿用文字摘要與 `eventLines/omitted/since/next`。拒絕預設即停；設 false 可繼續，但戰鬥結束或非人類回合必停。停止後依 session 的 `autoAdvance` 推 AI，回 `aiCommands/aiEvents/aiEventsOmitted`，不再執行剩餘 actions。批次中的拒絕由 `results[].ok=false` 表示，保留已成功的步驟；格式錯誤仍回 `isError`。`observe:true` 的 `observation` 等同預設 `battle_observe`，文字也附單位摘要。

`battle_legal_actions unit:"all"` 回 `units[]`：本輪尚可輪到的玩家單位，排除已結束、失控轉敵方與觀戰單位。引擎一次僅一台行動，尚未輪到者 `playerTurn:false`、合法動作為空並標原因；不推進或預測未來狀態。all 預設每台最多 64 個可達格、每能力 32 個目標；`maxMoves` 可設 0–4096、`maxTargets` 可設 1–256，另回 `movesTotal/movesOmitted/targetsOmitted`。單台查詢省略上限時保持原輸出。`battle_step_ai(id, until:"player", max?=2000)` 是 human 的別名，遇下一位人類或戰鬥結束就停；max 為成功 AI 指令上限，達上限仍可再呼叫。

**營運**（session id `c1`…）：`campaign_new(seed, start?)`；`campaign_view(id, log?, map?)` 看日期、房間、人員姓名、機庫（部位各層血量百分比、損毀、駕駛、裝備、彈藥／資源、待修工單）、待選項與新 log。`campaign_act(id, command? | text?)` 送營運指令；look／board／help／talk 回專屬詳情、Screen 與事件；待選事件拒絕訊息附題目、選項及 choose cmd，文字解析失敗附最多 10 個相關 id。`campaign_actions(id, verbs?)` 列可直接送出的 `cmd`／`tool＋args`，包含目前節點市場買賣、招募、船內研究的名稱、id、價格／薪資／需求；停用項標原因。AI 與互動出戰項皆附 `preview`（不可出戰時附錯誤原因）；`campaign_sortie_preview(id, sortie?)` 唯讀查同一份地圖名與大小、敵方名稱／等級／數量、目標、輪數上限、裂縫相位與錨等級，編成參數與 begin 相同。AI sortie 與 `campaign_sortie_finish` 均回 `report`：現金、契約、裂縫變化，我方機甲／人員結局、擊毀與捕獲敵方及戰利品筆數。`campaign_advance(id, days)` 等 N 天（遇待選事件提早停）；`campaign_auto(seed, months, policy, start?, battles?)` 回每月摘要與 hash；`campaign_save`／`campaign_load`／`campaign_close`。金額文字顯示至小數兩位，狀態與存檔保持原精度；save 未給 path 且 blob 超過 200 KB 會附警告，仍回完整 blob，建議 save／load 使用 path。

**畫面**：`ui_screenshot(query?, width?, height?, steps?, settleMs?, rebuild?)` 用 headless Chromium 截網頁版戰場（PNG）；`query` 例 `scenario=scenario/skirmish-whitegloves&seed=1&spectate=1`（`spectate=1` 為全 AI 觀戰，`steps` 讓演出往下跑）。

**戰役互動出戰**：`campaign_sortie_begin(id, sortie?, spectate?, autoAdvance?)` 回傳共用的戰鬥 id `bN`；省略 sortie 時採待出戰事件或唯一可出戰契約與已派駕駛的機甲，多個契約需明給。`campaign_sortie_finish(id)` 在戰鬥結束後回寫戰果並記錄可重播存檔；`campaign_sortie_cancel(id)` 關閉戰鬥、解除出戰，戰役維持 begin 前狀態。出戰期間 act／advance／再次 begin 會拒絕，view 可看狀態，actions 只列 finish／cancel。這類戰鬥請在 finish 後用 `campaign_save` 保存戰役；`battle_save` 會拒絕，尚未回寫的戰鬥進度不包含在戰役存檔中。

## 典型流程

1. `battle_new {scenario:"scenario/skirmish-whitegloves", seed:1}` → `b1`。
2. `battle_observe {id:"b1", map:true}` 看地圖與單位。
3. `battle_legal_actions {id:"b1"}` → 挑一個 `action` → `battle_act {id:"b1", action}`；重複到 `outcome` 非 null。
4. 批次：`battle_legal_actions {id:"b1", unit:"all"}` → 取目前 `playerTurn:true` 的動作，組成 `battle_act_many {id:"b1", actions:[移動action,攻擊action,{kind:"end",actor:單位id}], observe:true}`；依 `results` 與 `remaining` 接續。移動後目標可能改變，無法確定時先批次移動並觀察，再查合法攻擊；沒有合法目標就省略攻擊。`autoAdvance:false` 時遇 AI 用 `battle_step_ai {id:"b1", until:"player"}`。
5. 回歸測試直接 `battle_auto`／`campaign_auto` 比 hash。

`battle_list_scenarios`／`battle_new`／`battle_observe` 在情境有 `name`／`brief` 時附上，缺少時省略。`battle_new`／`battle_observe` 另回 `objectives`（`kind/for/onComplete/text/progress`）：守區範圍與連續輪數、斬首剩餘數、護送單位與出口、存活倒數都取執行期資料，摘要先列目標再列單位。`globals` 是目前潮汐／光照；盟軍永遠可見，敵方失聯後保留 `stale`、`seenRound` 與最後所見位置，未知目標不洩漏座標。地圖大寫符號專供單位，地形用小寫／標點／數字；超過 26 台用 AA 等多字元並回 `map.cellWidth`。出口在迷霧下仍畫 `>`（優先於單位符號，單位仍列圖例與座標），大圖可用 `window` 查看遠端出口；`map.terrainLegend` 含掩蔽、各移動類別成本與效果說明。`battle_legal_actions` 的單位目標附 `damageIfHit`：傷害包乘增傷、內容修正表與抵抗性（精粹等級差減半；凡鐵打獸只算外甲倍率）的命中傷害估算，未計部位減傷、層抗性、暴擊，也不扣凡鐵進不了內層的部分，並非乘命中率後的期望傷害；`nearestEnemy` 只含敵對單位，`playerTurn` 只對當前人類行動者為 true。`eject/retreat` 的 options 標 `irreversible` 且摘要寫「不可逆」。顯示小數四捨五入到 1 位，不影響模擬或存檔。事件序號因視野篩選可能有缺口，`next` 不倒退；觀戰要逐步請用 `spectate:true, autoAdvance:false`。CLI 的 `call/list` 只載入 node 內建模組，`serve` 才動態載入遊戲。

戰役流程：`campaign_actions {id:"c1"}` 找互動出戰項，將其 `args` 傳給 `tool` 指定的 `campaign_sortie_begin`；取得 `battle:"bN"` 後，用 `battle_observe`／`battle_legal_actions`／`battle_act` 指揮直到 outcome 出現，再送 `campaign_sortie_finish {id:"c1"}`。全 AI 可用 `spectate:true, autoAdvance:false` 開始，再 `battle_step_ai {id:"bN", until:"end"}` 到結束。finish 後仍可查 `battle_events`，不能重複回寫；若先 `battle_close`，請用 `campaign_sortie_cancel` 解除戰役鎖。

## 量平衡（不經 MCP）

填完內容想先知道數值有沒有失衡，跑 `npm run content:probe -- <id…>`（frame／monster／ability／scenario，自動配同級基準對手，印勝率、平手率、結算原因、能力使用次數、超出數值帶的欄位；`--json -` 給機器讀）；用法列在 testing 資料檔「內容平衡探針」列。數字可疑再用上面的 `battle_*` 親手打一場。

## 檔案

`server.ts` 入口；`protocol.ts` JSON-RPC 與 MCP 方法；`schema.ts` 參數檢查；`tool.ts` 工具契約與內容載入；`battle.ts`＋`battle-view.ts`；`campaign.ts`＋`campaign-view.ts`；`ui.ts`；`cli.ts` socket 客戶端；`node-shim.d.ts` 補 node 型別（專案沒有 `@types/node`）。測試：`node --test 'src/mcp/*.test.ts'`（`e2e.test.ts` 以子行程走 stdio 打一整場，hash 等於 `runBattle`）。

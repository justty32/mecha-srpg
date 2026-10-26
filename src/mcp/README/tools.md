[README 入口](../README.md)

## 工具

回傳都是「一段中文摘要＋一段精簡 JSON」（JSON 也放在 `structuredContent`）。參數錯誤或遊戲拒絕時回 `isError`，訊息說原因與下一步。

**戰鬥**（session id `b1`…，可多場並存）：`battle_list_scenarios` 列情境；`battle_new(scenario, seed?, playerSlot?, spectate?, rounds?, autoAdvance?)` 開一場，預設玩家 `player`、AI 自動推進到輪到玩家；`battle_observe(id, detail?, map?, window?)` 看回合、輪到誰、我方與已知敵方（部件層血量、資源、效果、位置）與 ASCII 地圖；`battle_legal_actions(id, unit?, maxMoves?, maxTargets?)` 列可達格（`"x,y:cost"`＋移動範本）、能力與合法目標（命中率、不可用原因）、待機／結束／撤離／棄機，每項附可直接送出的 `action`；`battle_act(id, action)` 送指令（`move` 可用 `to:{x,y}`），回本步與 AI 推進的事件；`battle_step_ai(id, until?, max?)` 推進 AI（command／unit／human／player／end）；`battle_auto(scenario, seed?, rounds?)` 全 AI 跑完，hash 與 `npm run sim` 相同；`battle_save`／`battle_load`（重播並驗 hash）、`battle_events(id, since?, limit?)`、`battle_close`。

**批次戰鬥**：`battle_act_many(id, actions[], stopOnReject?=true, observe?=false)` 依序送與 `battle_act` 相同的 action，回 `results`（每步 index／ok／command 或 reason／事件游標）、`stopped`、`remaining`，合併事件沿用文字摘要與 `eventLines/omitted/since/next`。拒絕預設即停；設 false 可繼續，但戰鬥結束或非人類回合必停。停止後依 session 的 `autoAdvance` 推 AI，回 `aiCommands/aiEvents/aiEventsOmitted`，不再執行剩餘 actions。批次中的拒絕由 `results[].ok=false` 表示，保留已成功的步驟；格式錯誤仍回 `isError`。`observe:true` 的 `observation` 等同預設 `battle_observe`，文字也附單位摘要。

`battle_legal_actions unit:"all"` 回 `units[]`：本輪尚可輪到的玩家單位，排除已結束、失控轉敵方與觀戰單位。引擎一次僅一台行動，尚未輪到者 `playerTurn:false`、合法動作為空並標原因；不推進或預測未來狀態。all 預設每台最多 64 個可達格、每能力 32 個目標；`maxMoves` 可設 0–4096、`maxTargets` 可設 1–256，另回 `movesTotal/movesOmitted/targetsOmitted`。單台查詢省略上限時保持原輸出。`battle_step_ai(id, until:"player", max?=2000)` 是 human 的別名，遇下一位人類或戰鬥結束就停；max 為成功 AI 指令上限，達上限仍可再呼叫。

**營運**（session id `c1`…）：`campaign_new(seed, start?)`；`campaign_view(id, log?, map?)` 看日期、房間、人員姓名、機庫（部位各層血量百分比、損毀、駕駛、裝備、彈藥／資源、待修工單）、待選項與新 log。`campaign_act(id, command? | text?)` 送營運指令；look／board／help／talk 回專屬詳情、Screen 與事件；待選事件拒絕訊息附題目、選項及 choose cmd，文字解析失敗附最多 10 個相關 id。`campaign_actions(id, verbs?)` 列可直接送出的 `cmd`／`tool＋args`，包含目前節點市場買賣、招募、船內研究的名稱、id、價格／薪資／需求；停用項標原因。AI 與互動出戰項皆附 `preview`（不可出戰時附錯誤原因）；`campaign_sortie_preview(id, sortie?)` 唯讀查同一份地圖名與大小、敵方名稱／等級／數量、目標、輪數上限、裂縫相位與錨等級，編成參數與 begin 相同。AI sortie 與 `campaign_sortie_finish` 均回 `report`：現金、契約、裂縫變化，我方機甲／人員結局、擊毀與捕獲敵方及戰利品筆數。`campaign_advance(id, days)` 等 N 天（遇待選事件提早停）；`campaign_auto(seed, months, policy, start?, battles?)` 回每月摘要與 hash；`campaign_save`／`campaign_load`／`campaign_close`。金額文字顯示至小數兩位，狀態與存檔保持原精度；save 未給 path 且 blob 超過 200 KB 會附警告，仍回完整 blob，建議 save／load 使用 path。

**畫面**：`ui_screenshot(query?, width?, height?, steps?, settleMs?, rebuild?)` 用 headless Chromium 截網頁版戰場（PNG）；`query` 例 `scenario=scenario/skirmish-whitegloves&seed=1&spectate=1`（`spectate=1` 為全 AI 觀戰，`steps` 讓演出往下跑）。

**戰役互動出戰**：`campaign_sortie_begin(id, sortie?, spectate?, autoAdvance?)` 回傳共用的戰鬥 id `bN`；省略 sortie 時採待出戰事件或唯一可出戰契約與已派駕駛的機甲，多個契約需明給。`campaign_sortie_finish(id)` 在戰鬥結束後回寫戰果並記錄可重播存檔；`campaign_sortie_cancel(id)` 關閉戰鬥、解除出戰，戰役維持 begin 前狀態。出戰期間 act／advance／再次 begin 會拒絕，view 可看狀態，actions 只列 finish／cancel。這類戰鬥請在 finish 後用 `campaign_save` 保存戰役；`battle_save` 會拒絕，尚未回寫的戰鬥進度不包含在戰役存檔中。

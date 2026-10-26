[README 入口](../README.md)

## 典型流程

1. `battle_new {scenario:"scenario/skirmish-whitegloves", seed:1}` → `b1`。
2. `battle_observe {id:"b1", map:true}` 看地圖與單位。
3. `battle_legal_actions {id:"b1"}` → 挑一個 `action` → `battle_act {id:"b1", action}`；重複到 `outcome` 非 null。
4. 批次：`battle_legal_actions {id:"b1", unit:"all"}` → 取目前 `playerTurn:true` 的動作，組成 `battle_act_many {id:"b1", actions:[移動action,攻擊action,{kind:"end",actor:單位id}], observe:true}`；依 `results` 與 `remaining` 接續。移動後目標可能改變，無法確定時先批次移動並觀察，再查合法攻擊；沒有合法目標就省略攻擊。`autoAdvance:false` 時遇 AI 用 `battle_step_ai {id:"b1", until:"player"}`。
5. 回歸測試直接 `battle_auto`／`campaign_auto` 比 hash。

`battle_list_scenarios`／`battle_new`／`battle_observe` 在情境有 `name`／`brief` 時附上，缺少時省略。`battle_new`／`battle_observe` 另回 `objectives`（`kind/for/onComplete/text/progress`）：守區範圍與連續輪數、斬首剩餘數、護送單位與出口、存活倒數都取執行期資料，摘要先列目標再列單位。`globals` 是目前潮汐／光照；盟軍永遠可見，敵方失聯後保留 `stale`、`seenRound` 與最後所見位置，未知目標不洩漏座標。地圖大寫符號專供單位，地形用小寫／標點／數字；超過 26 台用 AA 等多字元並回 `map.cellWidth`。出口在迷霧下仍畫 `>`（優先於單位符號，單位仍列圖例與座標），大圖可用 `window` 查看遠端出口；`map.terrainLegend` 含掩蔽、各移動類別成本與效果說明。`battle_legal_actions` 的單位目標附 `damageIfHit`：傷害包乘增傷、內容修正表與抵抗性（精粹等級差減半；凡鐵打獸只算外甲倍率）的命中傷害估算，未計部位減傷、層抗性、暴擊，也不扣凡鐵進不了內層的部分，並非乘命中率後的期望傷害；`nearestEnemy` 只含敵對單位，`playerTurn` 只對當前人類行動者為 true。`eject/retreat` 的 options 標 `irreversible` 且摘要寫「不可逆」。顯示小數四捨五入到 1 位，不影響模擬或存檔。事件序號因視野篩選可能有缺口，`next` 不倒退；觀戰要逐步請用 `spectate:true, autoAdvance:false`。CLI 的 `call/list` 只載入 node 內建模組，`serve` 才動態載入遊戲。

戰役流程：`campaign_actions {id:"c1"}` 找互動出戰項，將其 `args` 傳給 `tool` 指定的 `campaign_sortie_begin`；取得 `battle:"bN"` 後，用 `battle_observe`／`battle_legal_actions`／`battle_act` 指揮直到 outcome 出現，再送 `campaign_sortie_finish {id:"c1"}`。全 AI 可用 `spectate:true, autoAdvance:false` 開始，再 `battle_step_ai {id:"bN", until:"end"}` 到結束。finish 後仍可查 `battle_events`，不能重複回寫；若先 `battle_close`，請用 `campaign_sortie_cancel` 解除戰役鎖。

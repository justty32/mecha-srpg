# aos — 按需 agent 執行設定

[組織](../org/README.md)

使用者已同意「規劃好之後就可以開始用了」。採最小按需啟用，不建立閒置常駐部門。角色和交接在 org，定義在本目錄；使用者11/24改採直接 FSM GPT 工人，不需 codex；aos pack 名稱由 aos-llm ls 確認，不把 endpoint 名稱當 CLI 型號。

## 已建立定義

[review](defs/review/)：agent-fsm，llm kernel 的 `sol` pack、high；只給 look、mailbox、index、self_state，沒有 shell、檔案修改、self_tools 或再派工能力。供獨立唯讀審查，非遊戲實作 worker。`aos-llm ls` 已列出 sol 對應 gpt-6.1 sol。

## 使用

先 `agent_def check` 檢查 `wf/aos/defs/review`，problems 空才用 `subagent add` 啟動；ws 為本 repo，名稱每批明定。透過 say／listen 交付明確唯讀範圍及固定驗收項。收完最終答覆即 `subagent rm`，保留定義供下一批使用，不留空閒程序。

mailbox REQUEST 用原信 reply_to／letter 回覆；say／ask 用原對話回傳，不雙投。審查者不得是被審差異作者。check 不驗證模型可用，首次部署另做唯讀 smoke test，證據見 [啟用記錄](../org/activation.md)。

## 有界工人

[e2e-worker](defs/e2e-worker/)：sol/high，review另加edit，限brief授權單檔，沒有Node執行工具；main集中持鎖驗證。[playtest](defs/playtest/)：astra/high，review另加shell/write/peek_now_time，僅正式brief指定目錄可寫、唯一headless實玩，不啟子代理。

每次啟用仍check、讀規矩、登記領地並驗brief。工具裁減不是安全沙箱；shell工人須遵守brief。全機共用Node鎖已獲使用者裁示，依scripts/heavy-lock.sh序列執行；原npm test:e2e自帶鎖，不巢狀。驗證與實玩結果見 [本輪](../org/round-2026-11-24.md)。

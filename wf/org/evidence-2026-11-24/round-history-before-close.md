# 11/24 第一輪：收尾前靜態審查

使用者已設 goal，依今日計畫持續推進。

13:25 使用者明確說「繼續」，goal已resume。改用FSM sol唯讀startup-review-1124，當輪agent_def check無問題；無寫入claim、子代理0。先分辨webServer啟動timeout與個案settle timeout，不將前者直接視為沙箱拒絕，不調時限、不重跑整套。main查當下load約8.11/9.98/11.86，僅為負載線索。

使用者最新指定工人直接用 FSM GPT agent，不需 codex，已同步 working.md，後續派工採新偏好。中心來信補充先前全機8核 load14～19、CPU近滿載；nice19測試可能遭資源競爭，僅列逾時候選原因，未證實。已讀信箱目前為空，尚未收到啟動阻塞的後續裁定。

整合結果：main完整 UI 208案全過、exit0（1743.77秒），含焦點兩案、姓名兩案與觀戰hash；build exit0（有chunk大小警告）。e2e 18過1失敗、exit1，唯一為battle.spec.ts:202在settle(page)遇整案30秒timeout，尚未到hash比較，不稱hash不符。runner已退出；未重跑也未放寬時限。暫緩實玩，先派investigate-e2e-1124唯讀靜態診斷，禁止Node，只要最小後續驗證建議。

完整 UI 閘門已由 main 以可追蹤 runner（PID 見 evidence-2026-11-24/ui-gate.pid）啟動，31檔序列執行；每階段獨立 log/exit，首失敗即停止。先前 arena e2e 持鎖，本輪成功等鎖後開始，未重疊或中止其他服務。astra 新局實玩 brief 已備妥且 brief_lint=0，等閘門全綠才派，不讓實玩與測試爭鎖。\n\nfix-regression-1124 已 DONE 並確認 PID 退出、tokens used 終局；已撤本線 CLAIMS/ROSTER。授權5檔範圍核對無越界。相關測試預設隔離4個檔案子測試全過、exit 0（207.10秒），不是4個個案；焦點有明確兩案紅燈診斷，但紅綠隔離模式不同。戰鬥僅新版綠燈。main 已閱 tabs 焦點恢復與 REPORT，接續完整 UI 閘門（低併發、共用鎖）。

10:20 接續：信箱已讀空；焦點診斷 log 已取得兩項精確 assertion 紅燈（同列及 summary 重繪失焦），不是沙箱拒絕。預設隔離 runner 先前只回檔案級 exit 1；工人曾使用 --test-isolation=none 取診斷，不能把不同模式直接當同條件紅綠。目前 tabs 修正已寫入，四檔相關測試以預設隔離、共用鎖、concurrency=1 執行，main 等結果，不另起 Node。

最新補充：使用者經 eca_main 確認 test-prune-1105 無人執行，已撤舊 claim，僅接手本輪回歸，不開測試刪減第二階段。裁示原信已保存。

fix-mission-1124 已 DONE，工人程序退出、log 有 tokens used，main 已檢閱三檔差異並移除 CLAIMS/ROSTER；仍待動態驗證，保留未提交程式及報告，不刪交接證據。接續 fix-regression-1124 已派 codex sol/high，5檔明列領地、允許經共用鎖跑相關測試；brief lint 首次少線別而失敗，補可寫程式碼線後為0。pid/log 在 handoff 目錄，main 必須前景監看與收線。

最新狀態：已讀根中心四封裁示（原信保存 incoming-2026-11-24.jsonl），共用鎖生效、codex 啟動器豁免，goal 已恢復；舊測試 claim 仍待確認。已核對根中心對 heavy-lock.sh、working.md 的授權改動，未自行修改。下文的暫停限制是前輪歷史。

基準六檔測試經共用鎖、concurrency=1 執行，300秒工具上限中斷；log 有47項 ok、無完整總結，不能宣稱通過。已確認沒有該測試殘留程序，未原樣重試。證據在 evidence-2026-11-24/baseline-tests.log。後續長測試需採有可追蹤 exit 的背景工作並前景監看，不再讓工具時限充當測試時限。

fix-mission-1124 已依正式 brief 派 codex gpt-6.1-sol/high，僅3個原始碼檔與 REPORT、不寫測試、不跑 Node、不commit；brief lint 0。CLAIMS/ROSTER 已登記，worker pid/log 在該 handoff 目錄，main 必須收終局並回收領地。基準 HEAD fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2；既有 dirty 檔清單與接續摘要一致，未改遊戲程式。

main 已讀 testing、user、SESSION-LOG、WAIT_USER、playtest-1118 REPORT 並檢視差異；兩位按需 sol 唯讀輔助 battle-review / contract-review 分別核對戰鬥規則文案與契約快取／鍵盤。無寫入領地、不派下級、不跑 Node、不實玩，結果以原對話收回。收線須回收兩位。

已向根 eca_main 詢問共用 Node 鎖裁示狀態；目前仍禁止 Node/npm。UI 依 testing 必須 test:dom、build、test:e2e；靜態審查不替代這些。原報告型別通過屬前輪證據，不當成本輪驗證。

基準命令取得 HEAD，暫存目錄的頂層檔案查詢未輸出，尚不能證明舊戰役存檔可復用。git diff --check 未輸出錯誤；同一 shell 後續 wf-lint 只輸出入口後超過 30 秒，被工具終止整組程序；本輪文件 lint 未完成，不宣稱通過，也未重試。

第一輪審查完成，三項發現與驗收已抽到 [review-2026-11-24.json](review-2026-11-24.json)（3 列）。main 對照正式 objectives、flow、unitName 與契約重繪路徑，接受為靜態確認待執行重現；兩位 reviewer 均已 rm。根中心回覆共用鎖尚未裁示，繼續僅靜態工作。

本機 codex 入口首行是 Node shebang，故目前也不啟動 codex 工人，不找原生 binary 繞過；已將此範圍告知根中心。測試檔在 CLAIMS 仍列 test-prune-1105 領地；程序查詢未發現 codex exec 或具名舊線，但不足以證明其他 session 不持有領地，不自行撤銷舊 claim。

修正範圍、取捨與固定驗收已寫成 [修正切片草案](fix-2026-11-24-draft.md)，尚未派工。獨立重跑 git diff --check 通過；資料表連結檢查為空且 exit 0。明確確認 /tmp/mecha-play-1118 目錄不存在，不能沿用原第28天存檔，後續需新局或使用者提供存檔。文件整體 lint 仍屬逾時未完成。

組織經驗：把不能跑動態驗證時的工作切成兩個有明確檔案邊界的唯讀審查，比開常駐部門更容易回收。規範要求每次啟動先 check；本輪沿用已驗過定義但漏做當輪 check，已記錄此流程缺口，下輪啟動補回，不把首次驗證當永久保證。資源限制應明定是否涵蓋 CLI launcher，不能只看任務是否為遊戲測試。是否值得工具化，待實際重複步驟後再判斷，不先造工具。

靜態診斷線終局BLOCKED：REPORT 8810 bytes超8KB gate，依約停止；內容已收，不將其稱DONE，保留原報告作證據並撤登記。發現30秒包含內容載入及node整局模擬，settle錯誤不等於它自己跑30秒；208案中的hash只驗3輪，不能替代正式20輪。未證實本輪新增效能回歸。下一步只加測試側分段時間，原失敗案單次診斷，不改30秒／seed／斷言。

單次診斷線 diagnose-e2e-1124 已BLOCKED退出，tokens used與終局信齊，撤CLAIMS/ROSTER。只在e2e/battle.spec.ts原失敗案加計時、未改30秒或斷言；唯一一次命令exit1，config.webServer等待60000ms逾時，尚未進個案。無分段數據，不能歸因原settle問題。未重試／換runner／改沙箱。已向eca_main送BLOCKED請裁定先做唯讀啟動環境調查或停在此；如要main環境跑也需明確授權。不建立重複WAIT_USER，跨repo由中心轉達。

13:38診斷：FSM review已回收；main沿原成功npm入口加DEBUG，build20秒、preview HTTP200，證實此環境能啟動，未證實codex環境原因。原精確grep加^$匹配不到Playwright帶前綴全名；--list改子字串確認唯一1案，再執行取計時。e2e-timed.log：load17.326秒+runBattle13.378秒，settle-request已32.658秒，沒有browser evaluate-enter標記即整案30秒逾時。本次證實前置耗盡預算，不是settle耗30秒。正在FSM e2e-budget-1124評估原案專屬標準前置拆分，僅1檔可寫，禁止改timeout/seed/斷言；definition當輪check過，不跑Node。

13:53更新：[觀戰預算修正與驗證](evidence-2026-11-24/e2e-budget-report.md)。單案原斷言全過，FSM已回收撤領地；修改後完整e2e待驗，舊failed閘門保留。

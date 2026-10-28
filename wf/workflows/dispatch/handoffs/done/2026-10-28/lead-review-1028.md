# 任務：完成跨批增量去重與內容審閱

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`；親自讀 dispatch、investigation、content README、world-pillars 與全部子檔、common/user.md 與 user/working.md、data-files、team-model、dev-env、testing、inbox/README。

## 背景與唯一目標

lead-review-1028 統整可操作的增量審閱清單；以10/27已核32組與fill-rulings為基線，著重新七輪跨批，不重跑舊結論湊數。歷史3d79f69/9364f46在此clone無該物件，以現行b0a5ebef/8a577dcf與原檔核對已修事項。

## 範圍（排除法寫死）

只做使用者授權的本輪行政與審閱文件。入口為bigfill215、pilots148組、gear200、scen63、七輪82概念，預期708個語義入口；人物配套及怪獸四檔另記檔案覆蓋，不重複算概念。不得把review.json的484列誤報148個獨立人物以外的新增入口。

不做content/src/spec/golden/index/batches修改、舊線收線、實作、Fable等待、安裝下載、GUI、刪檔或worktree清理。件數 gate：最多900個批次入口項、全文候選最多150組；容量 gate：正式審閱產物最多2MB；原始執行log另限10MB（使用者補裁示），原始log不提交git；超出先回報頂層，不擴張。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 wf/tools/brief_lint.py` | 派工前strict |
| `wf/tools/tabledb.py` | wf-table讀寫及切片；舊list列由load後zip columns轉dict，不改原檔 |
| `codex exec` | 三條gpt-6.1-sol外部工人，workspace-write限分區 |
| `bash wf/tools/wf-lint.sh --strict .` | 收件後全庫一次 |
| `git diff --check` | 驗收空白 |

## 資源與禁區

可寫程式碼線：此處僅代表可寫授權文件，禁止寫程式與內容。子代理上限3，工人不得再開；總平行工人3，無重負載。領導不包辦全文審閱，抽核全部高信心問題及每線至少1條排除。

不碰鍵鼠螢幕、不開GUI、不裝依賴、不上網、不刪檔、不改~/.codex/config.toml、不建分支、不rebase/reset；工人不commit/push。領導只加明確檔案並main commit及push，今天使用者已授權。使用者已補授權本輪ROSTER列與wf/inbox訊息，外部線照正常mail/poll/ack回報；領導代登記名冊。

## 工作

三線讀取分區：people＝pilots148組＋bigfill34人物＋七輪18人物；gear-scen＝gear200＋scen63，參照新機甲怪獸配套；world＝bigfill181非人物＋七輪64非人物概念。各自核實實數；入口主責互斥，參照可交叉。每線全文候選最多50組，產物最多0.5MB。

候選必須全文讀兩端，記字段/行號、相似與差異、建議、信心；確認問題、待裁決、排除分開，區分真重複、正常配套、刻意變體、設定衝突。未全文覆蓋處明記。表超1KB用wf-table/1，表不可整份進context。

## 交付

短README與分區報告、覆蓋及證據資料存 `/mnt/c/code/mine/mecha-srpg/wf/notes/investigations/content-review-2026-10-28/`；lead REPORT存 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-review-1028/REPORT.md`。完成後本輪交接及附件移授權done/2026-10-28/並追加索引。

## 驗收（固定4條）

1. 覆蓋與候選證據實際存在，所有問題有來源，入口及容量不超gate。
2. 領導抽核每條高信心問題及各工人至少1條排除對照，留原檔核對證據。
3. git diff --check回傳0，提交前所有工人終局且無他線改動混入。
4. 全庫wf-lint --strict一次，如有既有legacy斷鏈如實記錄，修掉新增問題，不宣稱歷史驗收等於目前遊戲綠燈。

## 完成／阻塞回報

每約60秒向頂層工具回報進度。工人終局DONE/BLOCKED/FAILED寫分區REPORT及last.txt並以inbox_mail.sh --up寄終局；領導核process退出、log與產物後才收線。需要裁決寫清單繼續其他審閱。工具阻塞報實況，不拿歷史輸出冒充。

## 完成證據（2026-10-28）

三份子線DONE與codex exit0俱全，親讀三組排除原文及直接配套；48筆／46對無新增問題。最終入口708／1046主責檔，全文126檔，未讀限制已交付。固定四項結果見[REPORT](lead-review-1028/REPORT.md)，提交只含本輪明確路徑；具體提交由本次git log及最終回報核對。交付絕對路徑為執行當時位置，現址已移本done目錄，原始log未追蹤保留。

使用者後續明示：新增斷鏈修正後授權並要求全庫strict重跑一次。第二次僅既有legacy2，其餘0，兩次原始輸出保留；不宣稱strict通過。主成果提交5fdd59ff已普通push；補證記錄不擴張審閱。

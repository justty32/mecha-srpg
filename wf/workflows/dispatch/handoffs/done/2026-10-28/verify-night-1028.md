# 任務：夜間新增內容的固定快照整合驗證
先讀：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/common/data-files.md`、`wf/workflows/dispatch/handoffs/verify-import-1028/REPORT.md`；本session親讀可沿用。
## 背景與唯一目標
夜間新base內容收件後，由sol對主線指定的固定commit執行一次非截圖suite，對照本機1031案1022過9敗基準。不以局部內容驗收冒稱整合全綠。
## 範圍
只寫 `wf/workflows/dispatch/handoffs/verify-night-1028/` 報告與證據，以及 `/tmp/mecha-night-verify-1028` 隔離worktree與暫存log。主線另給精確snapshot commit；未收到GO不得建立快照或執行測試。
不做：內容、引擎、黃金、依賴、索引修改，主線stage/commit/push，修bug、重錄fixture、重跑基底。
件數 gate：最多170測試來源、30證據附件；容量 gate：15MB。子代理0。
## 必用工具
| 工具 | 用途 |
|---|---|
| `git worktree add --detach` | 指定commit隔離快照，不建分支 |
| `node --test` | 單次非截圖suite，concurrency=2 |
| `python3 wf/tools/tabledb.py` | 基準失敗與分類資料 |
## 資源與禁區
**唯讀調查線**，只寫自己的報告與隔離暫存。重負載需主線明確GO，先確認CM/CK/pilot已釋放；全機同時一個runner，nice19、taskset限可用CPU前兩個。可沿用既有node_modules連結，不安裝下載。不GUI/鍵鼠/螢幕/截圖/刪檔/清worktree/reset/rebase，不碰他人程序，不設定黃金更新變數。
## 工作
1. 記錄主線指定commit/tree、node版本、來源清單，沿用verify-import的158來源清單並確認不存在新增測試；排除src/mcp/ui.test.ts的兩截圖測試，記未執行，不記skip。
2. 一次node --test --test-concurrency=2 --test-reporter=tap，來源一次傳入，不分批。保存完整TAP、exit、耗時、CPU、快照；超12分鐘即報進度，不自行再跑。
3. 對照verify-import本機九敗，逐項區分相同、失敗軌跡改變、新增失敗或消失；無法判定明列未知。不改黃金、不將已知敗視為通過。若只有docs/lore變更而未新收base內容，主線可取消本輪，不能假報已跑。
4. 記before/after tree與受保護路徑diff、殘留本線程序、統計與已讀清單。測試結束即釋放重負載。只回報證據，不自行接受整批內容。
## 交付
`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/verify-night-1028/REPORT.md`、status.json、suite.tap、來源清單、wf-table/1失敗分類；原生工具回傳進度與終局。
## 驗收（固定 3 條）
1. 精確commit/tree與來源清單可查，單次suite執行證據完整。
2. tests/pass/fail/未執行與基準差異可核，原始exit與TAP保留。
3. 內容與受保護路徑未變，本線無殘留測試程序，REPORT誠實列出限制。

## 主線追加：suite後的合併lore窄測

2026-10-28，固定suite已終局1031案／1022過／9同基準敗後，另授一次 `src/ui-adapter/vm/wiki/index-new.test.ts` 單檔六案。只在主樹內容commit `4a139221`（含R2八lore，base仍3a20a436）執行，nice19兩CPU、單一runner；不得重跑suite或改原隔離快照。原始TAP、exit、耗時、head/tree與content/base/lore/index前後diff存本線wiki-*，REPORT分開標兩個快照。完成即終局與釋放；此追加不改前述suite結果。


## 行政收線證據（2026-10-28，最終驗證終局）

主線確認驗證線Socrates全部DONE並close，明確授權本brief搬移。上方完整保留主線最新wiki追加授權及原文；原始全文SHA256：`1d027cb26abcebd6ea4c82508ed8a25987090db159012211b27cf8cab06568bb`。附件與reportDir原位不動，見[REPORT](../../verify-night-1028/REPORT.md)、[suite status](../../verify-night-1028/status.json)、[wiki status](../../verify-night-1028/wiki-status.json)。

suite：3a20a436／tree9a5ab936，1031案1022過9敗、exit1、515.01秒，九敗診斷與前輪相同；兩截圖未執行，整合仍pending。wiki：4a139221／treed8f73178（含R2），6案全過、exit0、0.111秒；HEAD/tree及3156個content檔位元組前後一致，runner已釋放。兩次快照分開記錄，不宣稱整合全綠。創作、驗證執行與行政產稿完成；最後主線strict/diff/commit/push由主線處理。

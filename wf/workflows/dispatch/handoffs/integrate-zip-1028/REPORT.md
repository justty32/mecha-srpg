# 整合線 REPORT（DONE）

## 做了什麼與產出

已親讀規矩；安全解壓至 `/tmp/mecha-integrate-1028/mecha-srpg-pending-integration`，拒絕路徑穿越及 symlink。259 項、4,302,884 bytes，符合 300 檔／20 MB gate；SHA256SUMS 全部通過（exit 0）。指定基底與 main HEAD 均為 `c09b026919eeee03cde68c0f1eb0d289ad4cbe7c`。

隔離 worktree `/tmp/mecha-integrate-1028/replay` 順序 git am 五包成功（exit 0），最終 tree `b71d580579d70eddba7d9974d0809e8799e40878` 與包宣告相同；229 條 patch 路徑見 [完整路徑](patch-paths.txt)，與既有未追蹤檔零碰撞。六機／八怪獸形態／八人物共22件、52個內容 JSON。五個隔離重播 commit 見 [commit 證據](replay-commits.txt)，已依使用者後續明確授權套入 main。未改引擎、schemas、specs、黃金、依賴，未 push、未另建 commit、未 stash/reset。

## 驗證與證據不足

指定四項輕量檢查 `npm run check`、lore check、typecheck、content index check 均 exit 0；索引72分片一致。兩項怪獸窄測均 exit 0：十項直接機制通過，雙針五 seed 成列測試 uses=4、errors=[]。實際命令及退出碼見 [檢查紀錄](checks.json)，逐項原始輸出在同目錄各 log；雙針完整結果見 [結果](forkneedle.json)。`git diff --check` exit 0；受保護路徑 diff 空白。

**本機 main wf strict exit 0、broken=0**，見 [本機基底](wf-main-baseline.log)。隔離 /tmp worktree wf strict exit 1、broken=2，僅兩條 legacy 外部相對路徑，見 [隔離輸出](wf-replay.log)；這是重播位置限制，不能套成本機失敗聲明。未執行完整 suite、GUI、截圖、重錄黃金；完整整合測試由主線統一分配一次。

包原平台整合歷史仍保留 pending-integration：1031案／1021過／10敗，另兩截圖未跑；九項基底亦失敗，其中 wait 118→90天、ops-relic 軌跡改變。這些不是本機重測結論。包內 tests/test-comparison.json、test-failures.json 與原 TAP 仍完整存於解壓目錄。模型文件未改現行偏好；歷史 astra 規劃／sol 產出記錄符合本任務裁示。

## 授權保留合併與後續決定

使用者後續明確授權暫卸並精確回加主線新增。套入前已核對：只有 `wf/SESSION-LOG.md` 尾端指定 content 行，以及 `wf/workflows/dispatch/CLAIMS.md` 尾端「本輪 10/28 接續」區塊；無其他 tracked 差異，索引為空。兩檔完整內容保存為 [SESSION 備份](SESSION-LOG-before.md)、[CLAIMS 備份](CLAIMS-before.md)，原差異見 [授權差異](authorized-before.diff)。僅以 git show HEAD 的內容回寫兩檔，未 reset/stash。

main 五份 git am 全部 exit 0，確切 commit 順序見 [main commits](main-commits.txt)：`5faf2e0e5d861a0f9da943e05a86b472c315aa57`、`4f9a6a6cd3cd8ae258a06d83a1b9470eea3fd8c7`、`2fa90db219f29d2bf133c3cbdb2488a9a568588d`、`f45eca1d355af3f1b88911e9ff66f329400219c7`、`00d74dfdb66d1302afa9cdeb4d91c950c1ef5360`。回加前 tracked 工作樹乾淨，tree 精確等於交付 tree，見 [tree 證據](main-delivery-tree.txt)。

回加後逐位元斷言：兩檔各等於新 HEAD 內容加原始授權新增，無重複；tracked 差異只有這兩份本輪紀錄，均留未提交。見 [回加差異](main-final.diff) 與 [最終狀態](main-final-status.txt)。其餘原有未追蹤檔 SHA256 全部未變。最終 main wf strict exit 0（[輸出](wf-main-final.log)），git diff --check exit 0。完整整合驗證仍由主線統一安排，包的 pending-integration 與歷史失敗比較保留，不宣稱全 suite 通過。未 push。

除上述兩檔主線既有修改、本線報告目錄外，未寫其他 main 路徑；初始狀態見 [快照](initial-status.txt)。保留既有未追蹤交接與信件，不處理舊線。23:00 台北續填目標不擴張本線整合範圍。

## 已讀清單

已讀 `AGENTS.md`、`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、common/user.md、common/user/working.md、common/data-files.md、common/conventions.md、common/code-map.md、dev-env.md、content/README.md、content/batch.md、dispatch/README.md、testing.md、inbox/README.md、本線 handoff；已開讀 inbox/new 全部現有信件，僅作背景情報。資料查詢使用 tabledb testing-checks 文件 lint 列。包內已讀 APPLY.md、README.md、TESTS.md、PATCH.md、tests/COMMANDS.md、窄測腳本與五包路徑／狀態差異。

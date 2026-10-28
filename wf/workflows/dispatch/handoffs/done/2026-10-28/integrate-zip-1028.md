# 任務：整合跨平台內容包
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/testing.md`，親自閱讀適用規矩。
## 背景與唯一目標
整合跨平台內容包；最新裁示普通 sol、雜活 terra、美術創意 astra，push 已授權但本線由主線統一 push。
## 範圍
不做：未列路徑、舊線收尾、引擎修正、黃金重錄。
只可修改壓縮包 patches 明列的路徑（先列差異並檢查不碰使用者既有未追蹤檔）、本線報告目錄；不得修改 src 引擎、schemas、specs、黃金、依賴或其他現役文件。
件數 gate：最多 300 檔；容量 gate：產物最多 20 MB，任一超過先回報。
## 必用工具
| 工具 | 用途 |
|---|---|
| `rg`、`git status` | 有界查詢與確認差異 |
| `python3 wf/tools/tabledb.py` | wf-table 資料查詢 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件驗證，基底問題分開回報 |
## 資源與禁區
**可寫程式碼線**：僅寫範圍明列路徑。子代理上限 0 個；原生工具回傳，不寄信。不得刪檔、開 GUI、碰鍵鼠螢幕、安裝或下載、改全域設定、reset/rebase、push；不可加碼全套測試。全機重負載最多一個，平行工人最多3。不碰未授權目錄或其他人改動。
## 工作
先安全解壓 /home/lorkhan/Downloads/mecha-srpg-pending-integration-2026-10-28.zip 到 repo ignored 暫存位置或 /tmp 本線目錄（此暫存為本任務授權），拒絕路徑穿越與 symlink；讀 APPLY/README/TESTS/PATCH，驗 SHA256SUMS。核 HEAD 是 c09b026919eeee03cde68c0f1eb0d289ad4cbe7c。使用者已明確授權納入，不需再次詢問包內舊確認要求。當前僅未追蹤既有交接與信件，若與 patch 無碰撞可保留並套用，不以全工作樹乾淨為由丟棄資料。先隔離乾淨 worktree 重播五個 patch 驗最終 tree；確認後 main 順序套用。允許這五個 git am commit，禁止其他 commit/push。包內 workflow 模型或偏好若與使用者最新裁示衝突，報告給主線。跑包內四項輕量檢查及兩項窄怪獸檢查；不跑完整 suite、不重錄黃金。保留整合 pending 與失敗比較。向主線回報確切 commit、路徑、驗證與限制。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/integrate-zip-1028/REPORT.md`，含做了什麼、產出、證據不足、需要決定與已讀清單。原生工具回傳 DONE/BLOCKED/FAILED 及摘要。
## 驗收（固定 3 條）
1. REPORT.md 存在且四段、已讀清單完整。
2. 工作段指定產物存在，檢查逐項附真實退出碼或未執行原因，不冒稱全綠。
3. git diff/狀態核對沒有範圍外變更，報告附明確路徑。


## 行政收線證據（2026-10-28）

主線以原生工具確認本 brief 已終局，明確授權此次搬移；此為派線行政收尾，非本輪內容整合全過。原文保留如上，附件與 reportDir 留在原處：[原位置 REPORT](../../integrate-zip-1028/REPORT.md)。相關 commit：`00d74dfd／40976305`；指定 commit 已以唯讀 git log 核存在，原始驗證結論以 REPORT 為準。

原始 brief SHA256：`c901f62a36e4e14fbf1087d26bdc8d0f73b724b65eedaaa24c275649b1a79225`。原生終局來源為主線本次指示；Sagan 設計 agent 已 close，Socrates 前輪 verify 已 DONE、復用待 GO。其他四份 brief 尚未獲搬移授權，Pasteur 仍處理 pilot／R2；最後 suite 與收尾 commit 待主線補。

# 任務：規劃下一輪有差異的世界觀內容
先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/testing.md`，親自閱讀適用規矩。
## 背景與唯一目標
規劃下一輪有差異的世界觀內容；最新裁示普通 sol、雜活 terra、美術創意 astra，push 已授權但本線由主線統一 push。
## 範圍
不做：未列路徑、舊線收尾、引擎修正、黃金重錄。
只可寫 wf/workflows/dispatch/handoffs/fill-plan-1028-next/；其餘唯讀，壓縮包只准讀目錄及 README/REVIEW，不套用。
件數 gate：最多 30 檔；容量 gate：產物最多 2 MB，任一超過先回報。
## 必用工具
| 工具 | 用途 |
|---|---|
| `rg`、`git status` | 有界查詢與確認差異 |
| `python3 wf/tools/tabledb.py` | wf-table 資料查詢 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件驗證，基底問題分開回報 |
## 資源與禁區
**可寫程式碼線**：僅寫範圍明列路徑。子代理上限 0 個；原生工具回傳，不寄信。不得刪檔、開 GUI、碰鍵鼠螢幕、安裝或下載、改全域設定、reset/rebase、push；不可加碼全套測試。全機重負載最多一個，平行工人最多3。不碰未授權目錄或其他人改動。
## 工作
親讀 content 工作流全部適用規矩、world-pillars、lore/style、最新審閱與目前內容索引，使用 tabledb 有界查詢。規劃三批可由 sol 各自實作的 lore 擴充：地點與日常生活、勢力內部人物關係、事件及其後續影響；每批4個概念最多8個新 JSON，不動既有內容或時間線，不改引擎或數值。創意須比對既有內容與壓縮包22件，避免重複鏡頭/人物功能/場所用途；不用泛泛換名湊數。選真實缺口與既有引用。產出 PLAN.md、wf-table/1 review.json 和每批具體檔名/id/引用/簡介/去重證據/風險；遵守每批一類別，如跨類別則縮為單一類別。先完成設計，不派實作，不跑 npm。提供下一步三份子線明確寫集及驗收，待主線審後派。
## 交付
直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-plan-1028-next/REPORT.md`，含做了什麼、產出、證據不足、需要決定與已讀清單。原生工具回傳 DONE/BLOCKED/FAILED 及摘要。
## 驗收（固定 3 條）
1. REPORT.md 存在且四段、已讀清單完整。
2. 工作段指定產物存在，檢查逐項附真實退出碼或未執行原因，不冒稱全綠。
3. git diff/狀態核對沒有範圍外變更，報告附明確路徑。


## 行政收線證據（2026-10-28）

主線以原生工具確認本 brief 已終局，明確授權此次搬移；此為派線行政收尾，非本輪內容整合全過。原文保留如上，附件與 reportDir 留在原處：[原位置 REPORT](../../fill-plan-1028-next/REPORT.md)。相關 commit：`40976305（設計）；013701c0（後續12 lore）`；指定 commit 已以唯讀 git log 核存在，原始驗證結論以 REPORT 為準。

原始 brief SHA256：`cbc3470e8380b0f8ff907bbe79c880ba42ecae18dc759809c699d1e05b79aafc`。原生終局來源為主線本次指示；Sagan 設計 agent 已 close，Socrates 前輪 verify 已 DONE、復用待 GO。其他四份 brief 尚未獲搬移授權，Pasteur 仍處理 pilot／R2；最後 suite 與收尾 commit 待主線補。

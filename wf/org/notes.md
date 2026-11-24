# 閱讀與判斷筆記

本頁記錄初次規劃階段（當時未啟用）；使用者後續已同意開始使用，最新部署與限制見 [啟用記錄](activation.md)。

[組織草案](README.md)

## 任務與讀取範圍

來源為本回合 eca_main 的對話委託，要求規劃並寄 DONE 到根 daemon；沒有附 aos letter id，因此回報用明定的 to／daemon。參考專案 `/mnt/c/code/mine/arena_cheater/wf/org` 全程只讀。

本專案先讀根 AGENTS，跑 session／wait 條目計數（7／6）及 wf/inbox/new 讀信（無輸出）。讀過 WORKFLOWS、STRUCTURE、team-model、common/user 與 user/working、planning、dispatch／CLAIMS、inbox、testing、content/batch，以及 PROJECT、INDEX、code-map 導覽與核心 spec README。沒有讀完整程式、沒有驗證遊戲行為。

aos 來源是 `$AOS_HOME=/home/guanyu/repo/aos/proto8` 的 knowledge/aos；依序讀 _description、world、rules、mailbox、agents、body。重要結論：daemon／stack／workspace／definition 不可混用；subagent 在同 daemon，模型與工具不繼承；變更自己用 self_*；改定義須先用 agent_def 複製；工具拒絕不可繞過；自己開的 helper 必須清理。

arena 讀過 org/README、letters，並逐一讀 design、dev、qa、review、integration 的 README；列過角色資料夾檔名，未把其所有歷史資產逐份閱讀。採用角色卡、獨立審查、版本基準、短終局信、未跑／不能跑／不適用分列；不移植其專案專屬授權及工具。

## 已觀察的限制

開始的 HEAD 是 `fd9756b28681001b93fe2c7bfa7ee6bdbd99cdf2`。工作樹原本已有多份 ui-adapter 戰鬥／營運 DOM 與 VM、測試、SESSION-LOG、code-map.json、playtest-1118 REPORT 的修改，以及未追蹤 contract-selection.test.ts。本次不改、不還原、不提交這些既有成果；SESSION-LOG 僅追加／移除自己的一行。

CLAIMS 還列 fix-playtest-1105 與 test-prune-1105，不等於已證實程序仍在跑。正式派線要問原負責者，不能憑文件日期宣布它們失效。

現行 working 規則要求全機 Node 一次一個、常駐 MCP 除外；scripts/heavy-lock.sh 實際使用 git common dir 作鎖，只保障同 repo／worktree。這是需上層協調的落差，本次沒有修改鎖，也沒有跑 Node／npm。

## 已做的設定與方法選擇

按要求先 self_tools 加 self_system，再 get 原文，最後 set 原文加繁體中文一句，沒有覆蓋掉原有文字。body 文件指出 eca-codex 的 system 變更要新對話才套用，不能僅憑工具成功就保證所有 body 立即更新；本回合已遵守繁體中文要求。

Claude Fable 輔助為可選，本輪現有規範已足夠做組織草案，故未新增 agent_def／subagent 工具、未建立 helper，沒有需移除的輔助程序。這不代表做過第二模型審查。

曾嘗試 apply_patch，但環境無該命令；改用既有 edit／write 工具，未安裝任何工具。組織文件使用繁中是沿用專案語言規則；沒有修改遊戲程式或規格契約。

## 停止點

規劃內容完成；等待使用者裁示窗口、body、提交責任與跨 repo 資源協調方式，見 plan。未開始正式部署。文件驗證結果完成後記於下節。

## 驗證

`bash wf/tools/wf-lint.sh --strict .` 最終回傳 0：broken、oversize、biglist、querycmd、local 均為 0。初次執行因本輪暫存 SESSION-LOG 條目把清單推過 1 KB 而回傳 1；規劃完成後移除自己的進行中條目，待裁示轉到 WAIT_USER，重跑通過。既有三處 BIGLIST-LINKS 與五處 STALE 提醒仍保留，不擴大本次範圍清理。

`git diff --check -- wf/org wf/INDEX.md wf/WAIT_USER.md wf/SESSION-LOG.md` 回傳 0；另以 Python 逐檢 8 份新增 Markdown 的相對連結，缺失為 0，各檔均低於 8 KB。wf/inbox/new 階段結束讀取仍無信。未跑 Node／npm、遊戲測試或第二模型審查，未 commit／push；本輪純組織文件不需要遊戲測試。

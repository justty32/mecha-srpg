# 任務：逐輪填充並核對相似內容

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/dispatch/content-batch.md、wf/workflows/content/README.md、wf/workflows/content/batch.md、適用世界支柱及 content/lore/style.md。所有實質工作者必須親讀，不只接收摘要。

## 背景與唯一目標

使用者要求持續逐輪填充並排除既有相似或重複內容。第4輪人物六、第5輪地點六、第6輪勢力六、第7輪機甲／怪獸各三；每輪先比對、再規劃與產出、交稿後再查重。重複候選改選，不為件數接受改名複製。公司不安裝，整合驗收留回家。

## 範圍

領導可寫本線 lead-world-more-1027/ 報告與計畫、handoffs/wm-* 交接書、content/batches/2026-10/wm-* manifests、.git/wf-worktrees/wm-* 隔離區的核准新內容、主樹對應 wm-* 新檔及 content/index。不做：其他工作樹、舊內容、src/schema/spec、年表、SESSION/CLAIMS 都不得改；不覆蓋既有 staged wl-*。主線管理頂層進度。

件數 gate：24 個概念、各批最多20內容檔、五類共最多36新內容檔。容量 gate：每批新內容及報告合計最多1MB。上限不足先報主線，不擴成其他任務。

## 必用工具

| 工具 | 用途 |
|---|---|
| wf/tools/tabledb.py | 定向讀寫計畫／審閱／相似度資料，不整份印大表 |
| wf/tools/brief_lint.py | 子線交接書 strict 檢查 |
| wf/tools/content_gate.py | 限制新檔範圍及帶回 |
| wf/tools/content_accept.sh | 僅 manifest 指定的有限靜態檢查 |
| wf/tools/content_index.py | 精確 add 後重產索引 |

## 資源與禁區

可寫程式碼線（本線只寫內容與文件，不寫引擎程式）。領導 sol，規劃 astra，創作 sol，簡查 terra；原生工具回傳。子代理最多同時2，連領導總共3；無額外平行主線。每輪計畫先審再實作，領導不做工人的量。禁止安裝、網路、GUI、npm、測試、typecheck/build、sim/probe/MCP、commit/push、刪檔、重錄黃金、設定／掛載修改。只允許Python資料檢查、既有零依賴Node內容／lore／ops檢查及diff/索引/wf lint；Node檢查一次一個。前輪年表MODE例外不延伸到本輪。

## 交付與驗收（固定3條）

報告： /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-more-1027/REPORT.md。

1. 四輪實際產出及逐件 review（白話≤60字）；計畫與審查每列有最相似既有項路徑、相似處、差異與採用／退回理由，全文讀過候選而非僅比名字。
2. 每批 JSON／引用／路徑閘門與已讀清單通過，適用 lore／ops／loader 無新錯誤；git diff --check 為0。僅有限檢查，全部 draft、integrationStatus deferred-by-user，不宣稱平衡或完整驗收通過。
3. 帶回、精確暫存與索引完成；本線 README/REPORT 有各輪件數、去重證據、剩餘風險；所有子agent結束、worktree保留、未commit。若退回造成少件，交付明確原因，不用重複件補數。

## 本輪補充

前兩輪經驗：機甲／怪獸不只比較數值，敘事也要比較。不要又全部遇獸撤船、全部犯錯後認錯、全部借錢欠薪分帳或公文作證。規劃先寫具體事件與角色欲望，再寫能力／配裝；不同意象不代表不同事件。主線查重範圍含目前未提交wl-*和wn-*。每輪六概念，規劃最多兩個近似來源全文對照即可，不擴成全庫普查。角色可有熱情、好奇、親密、野心、幽默、冒險與失敗，不必每篇用道德教訓或利益算帳結束。

四輪依序各完成規劃→創作→查重→帶回再往下。規劃astra、創作sol、簡查terra，可重用同一agent避免重讀同份規矩；最早使用時親讀適用規矩，任務切換補讀新類即可。子代理最多同時2；不要為等待中的同題再開補位規劃。README只記最新狀態與完成導航，勿不斷堆疊舊進度。每輪結束明記件數、差異與退修，最後總表24列、五批36檔上限。不得整份dump大表。

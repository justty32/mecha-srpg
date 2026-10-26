# cx-td2-move REPORT — 第 2 輪

## 做了什麼

依第 2 輪交接書從第 3 步接手；已親讀 AGENTS.md、common.md、STRUCTURE、user、WORKFLOWS、tidy 入口與 gotchas、moving-things、done 索引，以及碰工具前的 conventions、code-map、dev-env。開場查 SESSION-LOG／WAIT_USER，新信箱無信；沿用既有 lead-tidy2 open 條目。

領導已搬好的 32 個附件夾與 moves.tsv 均存在，舊目錄全部不存在。本輪沒有搬檔、刪檔、呼叫真實 git、commit 或操作 GUI。

`fix_moved_links.py` 先 dry-run，再 apply，兩次均列 27 檔。原工具會查 git 並掃到禁區，因此以暫存 Python adapter 呼叫原工具 main，明給 root，只替換 scan.files 為限縮的檔案系統掃描；改寫邏輯與原工具檔案均未修改。跳過 archive、現役 lead-engine-next／lead-bigfill 與其信箱、inbox .state，以及搬後歷史 REPORT。

另以腳本修正 251 檔的路徑前綴（1,266 處，其中 content/batches 88 檔）；包含 reportDir、report.file、計畫檔、工作樹備份與裸路徑字串。wf-table 資料透過 tabledb API 讀寫；批次 manifest 保留原格式，只換路徑字串。未修改信件原文與歷史 REPORT。

搬後工具共修 5 檔：lead-tune/tools 的 day-tally.ts、ops-tally.ts、r1-probe.ts，相對 src import 補兩層；cx-tune-human/human-bench.ts 的 5 個失效 scratch 工作樹 import 改指本 repo 同名模組；psweep.sh 註解中的彙總工具路徑修正。ops-sum.py 無需修改。前兩支 TS 工具以 `--months 1 1` 實跑，均退出 0，沒有模組找不到錯誤：day-tally 跑到第 28 天，ops-tally 統計兩場出戰。

`done/README.md` 追加 lead-grid、lead-pilot-essence、lead-rename、lead-tidy、lead-wrapup 五列（日期皆 2026-10-24，摘要取各自 REPORT，附附件夾連結），已有的附件連結已由工具改址。handoffs/README.md 沒有逐線清單，無需變更。

## 產出

搬移表沿用領導的 [moves.tsv](../moves.tsv)，32 列；本輪沒有重寫。

既有檔案實際共修改 278 檔（自動與手修重疊去重；不含本線新證據與 REPORT）。完整清單在 [changed-files.json](changed-files.json)，含每檔修正種類；自動工具 27 檔、手修路徑 251 檔、工具 import／路徑 5 檔，索引補列與前述自動工具同檔。

證據：[dry-run](fix-dry-run.log)、[apply](fix-apply.log)、[day-tally](day-tally.log)、[ops-tally](ops-tally.log)、[wf-lint](lint.log)、[錨點](anchors.log)、[頂層 ls](acceptance1.log)、[第 3 條原始輸出](acceptance3.log)。

固定五條驗收如下，沒有增加條件：

1. `ls wf/workflows/dispatch/handoffs/`：搬移表的 32 個舊資料夾全部不存在，亦無殘留空目錄。
2. 領導核。
3. 交接書原定 grep 管線結果 **387 行，未歸零**：inbox .state 238 行、信件原文／歷史紀錄 141 行、lead-engine-next 禁區 5 行、lead-bigfill 禁區 3 行。全部已列入殘留清單；範圍內可修的裸路徑已修完。不能把本條宣稱為 0。
4. `bash wf/tools/wf-lint.sh --strict .`：退出 0；`TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`。兩條 BIGLIST-LINKS 僅 warning，未計入違規。
5. `python3 wf/tools/check_anchors.py`：退出 0，無輸出。

第 4、5 條執行時，PATH 最前放暫存 git adapter（只回傳 1，不呼叫 git），使檢查器使用既有的檔案系統 fallback；工具本體未改，也未跳過任何驗證類別。此模式不套 gitignore 過濾。

## 沒做到或證據不足的

第 2 條依指示交領導核；本線不核 git 索引或 rename 計數。第 3 條因禁區與歷史原文限制未達數字 0，不越界修改以消除計數。

完整殘留舊路徑清單在 [residual-paths.json](residual-paths.json)，241 檔，每檔列行號、命中的線名與保留原因。掃描範圍為 wf／src／test／content 的 md、json、ts、py、sh，含 code fence 與歷史正文；不是額外驗收。

此清單比第 3 條寬：另列歷史 REPORT 正文 197 行、archive 49 行；信件原文共 142 行，其中 1 行同時含新路徑，被原定 `grep -v` 管線整行排除，故第 3 條為 141。src／test／content/lore／content/base／content/index 沒有命中這批舊前綴。本輪歷史 REPORT、archive、現役線與 .state 均未改動。

只按交接書挑兩支工具實跑；其餘工具僅修相關路徑，沒有宣稱全數執行成功。

## 需要決定的事

無使用者裁示需求。領導需核第 2 條，並判定第 3 條所列禁區／歷史原文是否符合收線例外；若現役線要更新參考，應交該線持有人處理。

以後交接書該點名的工具：原列 fix_moved_links.py、wf-lint.sh、check_anchors.py 皆已使用；另宜點名 tabledb.py（wf-table 路徑欄）、node（指定兩支工具實跑）。若限制不碰 git，需明寫這些工具預設含 git 查詢，並允許限縮掃描 adapter／檔案系統 fallback。

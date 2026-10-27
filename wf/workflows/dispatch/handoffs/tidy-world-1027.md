# 任務：整理七輪世界觀工作的交接文件與活狀態

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/STRUCTURE.md、wf/workflows/common/user.md、wf/workflows/common/data-files.md、wf/workflows/tidy/README.md、wf/workflows/tidy/gotchas.md、wf/workflows/dispatch/README.md。

## 背景與唯一目標

使用者要求按照wf規矩整理。七輪82概念/124新內容JSON與6年表已在8ba72b4提交，c9ce4e8補記錄，均已push。創作與限定查重已完成，但整合驗收明確留回家；不能把draft改accepted或把四條舊暫停線擅自收線。唯一目標是今天工作可清楚接續、文件按用途歸位。

## 範圍

病灶：1 SESSION七列混完成成果與真正待辦；2 CLAIMS列已結束工人像現役；3 STATE/next-session仍稱僅盤點不改內容及舊HEAD；4 handoffs根層29份wl/wn/wm/lead-world交接書與三批報告分離；5 新報告子目錄缺導航；6 活規矩尚有「沒有remote」及push規則與使用者授權矛盾。

可寫：wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/INDEX.md、wf/workflows/dispatch/CLAIMS.md、wf/workflows/dispatch/README.md、wf/workflows/common/user.md、wf/workflows/dispatch/handoffs/{README,STATE,next-session}.md；29份根層wl/wn/wm/lead-world交接書；lead-world-{life,next,more}-1027三報告目錄的導航及必要連結；本線tidy-world-1027.md與tidy-world-1027/報告。其他wf檔僅允許修正這批搬檔造成的連結，由主線最後核對。不做：不得改content任何檔、src、schema、legacy、既有done/archive內容、tools或AGENTS正文。

分類方案：六類按既有語意位置：第一輪、第二三輪、第四至七輪，各自briefs/存該批交接書；活狀態集中STATE/next-session與待驗收摘要；跨輪查重盤點仍在notes原位置；本次整理證據在tidy-world-1027/。報告根目錄及檔名保持，避免改manifest report路徑。三批整合尚待驗收，不強行搬done/archive；已執行brief歸類到對應報告的briefs/，明示它們是創作契約與歷史證據，不是待派工。三批report原文狀態為當時快照，只修失效導航，不改寫原結論。新的待驗收摘要應承接件數、36警告、兩處legacy斷鏈、年表MODE一次例外、整合尚未做、Fable與P01待裁決。

件數 gate：最多300個文件（包含29搬檔與必要導航／連結）、容量 gate：新增內容最多1MB。不為檔數機械重排同類資料，不合併刪除檔案。用git mv、檔名不改、新子目錄加README；moves.tsv一列一搬，原內容除必要路徑保持。不改JSON歷史閱讀證據的路徑/hash，報告解釋這是原位置、可由moves對照。

## 必用工具

| 工具 | 用途 |
|---|---|
| wf/tools/tabledb.py | 定向讀JSON資料表，不整份dump |
| wf/tools/brief_lint.py | 本交接與子交接strict檢查 |
| wf/tools/fix_moved_links.py | 先dry-run再apply搬檔連結（先看help，限制範圍） |
| wf/tools/wf-lint.sh | 最後strict文件檢查 |

## 資源與禁區

可寫程式碼線（僅文件，不改原始碼）。sol普通整理工，可派1個terra做定向簡查（連自己最多2工人）；實質工先親讀規矩，簡查例外。原生工具回報。不commit/push、不刪檔／worktree、不裝東西、不跑npm或整合測試、不改遊戲內容、不動設定/GUI/網路。只用Python、git、文件檢查，wf-lint只在結束跑一次，已有legacy兩處斷鏈如實列基線；不要修legacy。主線做最後獨立核驗與commit/push。

## 交付

REPORT寫 /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/tidy-world-1027/REPORT.md，附moves.tsv與檢查證據；回報簡短結果、檔案數、例外。主線寫的SESSION整理open行由你收件時移除（創作與驗收待辦另保留）。CLAIMS加本線暫時記錄亦由你最後移除。

## 驗收（固定3條）

1. 29根層交接書用git mv歸入對應briefs，moves逐件存在且可追溯；各新目錄README，既有reportDir不變，無content/src/legacy改動、無刪除；圖書／怪獸退修與數據證據不改。
2. SESSION只列open且≤4096bytes、入口README≤100行、子README≤300行；CLAIMS清楚區分無活躍工人與待驗收；STATE/next-session與提交／回家邊界一致；P01/Fable/四舊線待辦保留，無新增裁決。
3. git diff --check及cached均0；wf strict相對原baseline無新錯誤（原legacy broken2不算通過，明記）；連結修補包含搬入brief內相對路徑、外部入鏈與純文字執行路徑區分歷史證據；REPORT附結果且子agent已結束。

# 今日美術收工文件整理報告

2026-10-27；普通文件整理工，直接修改共享工作區，子代理 0。已親讀 AGENTS、WORKFLOWS、STRUCTURE、common/user、data-files、tidy README/gotchas、dispatch README；按主 brief 的限定範圍執行。

## 交付

13 份已執行 brief 以 git mv 歸入兩批 briefs/，檔名保留；[moves.tsv](moves.tsv) 逐筆對應，首批 10 份、機甲批 3 份。母／子契約原文保留，只加歷史快照與有效相對導航；不移 done，不冒稱使用者定稿或遊戲整合完成。

[集中看圖與回家驗收](../../../../notes/art-review-2026-10-27/README.md) 串起人物日漫／紙娃娃、三風格機甲與城市、城市六層、修塢／地格／特效、機甲 9 大 28 中／142、140、140 有效葉／語意深 4、實際 SVG 深 5 及 JS/CSS 啟動／暫停／還原。展示仍是原 art/svg-study-1027/index.html，可自行 file 開啟。

STATE／next-session 以 `04bf2dd` 為本日美術功能交付基準（已push）；其後文件提交看 git log。首批 `2863782`、今日推送授權 `f78e708` 同步記錄。兩批 README／STATUS／STATE 明記已提交與無活躍工人；歷史 REPORT 加快照說明，原驗證指令、JSON hash、結論與圖像證據原位置保留。

偏好文件保留早期公司限制的脈絡，以同日後續裁示統一為必要套件已允許、任何下載前先告知項目／來源／用途；本整理未下載安裝。美術 astra、一般 sol、雜活 terra 與最多五層、紙娃娃偏好保留。

SESSION／CLAIMS 本線臨時登記已移除；七輪世界觀 draft 待家驗、P01／Fable、四條舊暫停線與原領地契約均保留。今天收工，待辦已集中，不請使用者當場驗收。

## 驗證摘要

- 主 brief strict：0 違規／1 檔。
- 連結工具全 repo dry-run 遇既知非 dict 資料列 TypeError，沒有全域 apply；使用 fix_moved_links 原模組限定可寫 Markdown，先 dry-run 再 apply，共修 2 份（handoffs README、variants-REPORT）。範圍外 Markdown 掃描未見需改寫入鏈，主線亦獨立核對。
- 原第一次 wf strict 在偏好表新增文字尚未精簡時報 biglist=1；已精簡並以 find_big_lists 確認該檔 0 block。最終 `bash wf/tools/wf-lint.sh --strict .` 回傳 1，僅既有 legacy broken=2；residue=0、oversize=0、biglist=0、querycmd=0、local=0，另有 3 個 BIGLIST-LINKS warning。
- git diff --check 與 git diff --cached --check 均回傳 0；13 筆 rename 與 moves.tsv 完全對應，檔名不改、舊路徑消失且新路徑存在。限定 Markdown 實體連結檢查 0 缺檔。
- 44 個邏輯變更檔（含 13 rename；舊新路徑合計 57），低於 80；所有現存變更文字檔總容量小於 180 KB，已包含原文，新增文字保守上界仍低於 500 KB。SESSION 為 1622 bytes，只保留真正 open。新入口為 5／9／16／29 行，改檔導航 49 行，均小於 100；子 README 均小於 300。
- 暫存只有 Markdown 與本報告 moves.tsv；沒有程式／素材變更，所有本線改動均以明確檔案路徑暫存，未用目錄級 add。

## 保留例外與驗收界線

legacy 兩處既有 broken 不修、不稱全綠。歷史 Node／XML／PNG 通過不是真瀏覽器動畫、布局或鍵盤驗收；headless 缺 libnspr4／nss／asound，公司未裝、未下載、無 GUI。靜態檢查及渲染、整合／遊戲測試本輪均未重跑。

所有非 Markdown 程式、素材、PNG／SVG／JSON／manifest、目前機甲 contract.md 留原路徑；除本線必要 moves.tsv 外沒有新增非 Markdown。沒有改 src/content/legacy/spec/tools/AGENTS，沒有清 worktrees、舊檔或 .git 本機 logs。主線保存的 36 份 art hash 基線留給主線獨立核驗，本工人未改寫該基線。

本工人未 commit／push。最後核驗與 commit／push 由主線負責。

## 改檔清單

[改檔導航](files.md) 列此次明確暫存檔案；13 舊路徑與新路徑另見 moves.tsv。

主線獨立核驗：36／36 份美術與程式 SHA256 與整理前相同，暫存範圍只有 Markdown 與 moves.tsv，暫存空白檢查通過。

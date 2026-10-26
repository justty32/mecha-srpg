# cx-td2-inbox REPORT

## 做了什麼

依交接書歸檔已收線信箱；固定四條驗收皆符合。處理 30 封信（new/ 的 cx-tf-* 13 封、mail/ 17 封）、5 份 orders、9 個團隊；來源檔合計 189,115 bytes，未超過 400 封／50 MB gate。

信件全數經 inbox_ack.sh --apply 歸檔；15 個空 mail 資料夾搬入指定 trash，orders 搬入 done/2026-10-26/orders/；9 個團隊全數經 inbox_team.sh close 歸檔。指定工具內部使用 mv／os.replace，未另行手動操作 .state/；未 commit、push 或刪檔。

ROSTER 封存 7 格（grid、dedup、rep、tone-fix、kaiju2、mech2、wanchao），入口保留規則與 dispatcher、lead-engine-next、lead-bigfill 三個現役格及一行封存索引。grid 格標記已收線。ROSTER-2026-10-26.md 原已存在，因此追加第二批，保留既有封存內容；archive/README.md 追加一列。

固定驗收結果：

1. `ls wf/inbox/new` 空；mail/ 只剩 lead-engine-next（其他現役兩格原不存在）。
2. orders/ 已無指定 5 檔；teams/ 只剩 engnext、bigfill。
3. `wc -c wf/workflows/inbox/ROSTER.md` 為 4419，≤ 6144。
4. `bash wf/tools/wf-lint.sh --strict .` 顯示 inbox_pending=0、broken=0。

## 產出

搬移對照：[moves.tsv](moves.tsv)，60 列；信件列的新位置指持久化的 messages.json，原件由 ack 工具自行管理。ROSTER 列為部分段落移入既有封存檔。

供領導 commit 的 done/ 新增或變動檔完整清單：[done-files.csv](done-files.csv)，16 檔（2 修改、14 新增）。其中 messages.json／messages.md 各一，orders/ 5 檔、teams/ 的 members 9 檔。

空信箱資料夾存於 `wf/workflows/dispatch/handoffs/lead-tidy2/trash/cx-td2-inbox/`，15 格均保留空目錄；Git 不追蹤空目錄。完整 lint 輸出：[wf-lint.log](wf-lint.log)。

## 沒做到或證據不足的

在 handoffs/done/README.md 查不到 lead-grid 的明確已收線列；依交接書明文授權照樣歸檔 grid。kaiju 名冊含 lead-fill-kaiju、mech 名冊領導為 lead-fill-mech，兩者在該已收線索引都有對應紀錄。

wf-lint 整體 exit=1：範圍外 `wf/workflows/dispatch/CLAIMS.md:9-13` 的 BIGLIST 使 biglist=1；指定驗收所需 inbox_pending=0、broken=0 均符合，依固定驗收要求不加碼、不修改該檔。工具亦列兩個 BIGLIST-LINKS warning。沒有未完成的範圍內工作。

## 需要決定的事

無。領導可依 done-files.csv 納入歸檔產物；本線未提交。

以後交接書該點名的工具：inbox_ack.sh（會自行寫入 .state/acked/）、inbox_team.sh close（內部使用 mv；本專案需手動更新 workflows/inbox/ROSTER.md）、wf-lint.sh --strict；另應註明同日 ROSTER 封存檔已存在時採追加，避免覆寫歷史。

# tidy-mech-wf REPORT

## 做了什麼

按語意拆分 STATE 與 user，原路徑保留導覽；更新接續與美術入口為已在家，保留世界觀整合、四舊線、主觀美術及瀏覽器驗收待處理。small 的 `lead-small/report.md` 實體存在，為暫停時快照；`69924b0` 已入庫並不等於整合驗收或收線。未改歷史報告。

## 產出

- `STATE.md` 8210 → 363 bytes，詳細內容分入 `state/README.md`、`overview.md`、`art.md`、`pending.md`、`history.md`、`next.md`。
- `common/user.md` 7391 → 1725 bytes，詳細裁示分入 `user/README.md`、`working.md`、`art.md`。
- 更新 `next-session.md`、`wf/notes/art-review-2026-10-27/README.md`；本報告共 14 檔，低於 20 檔及 1 MB gate。
- 語意拆段，未搬移任何實體檔案；無 moves.tsv、無 rename，故不需搬檔連結修復工具。兩舊入口的錨點引用 `rg` 未命中；13 個寫集 Markdown 路徑連結檢查 broken 0；`git diff --check` exit 0。
- 六類斷裂：舊路徑仍存在，故硬編碼絕對路徑、`__file__`、package import、CI／外部設定及執行期資料目錄均無實體位置改變；相對 Markdown 連結以新位置解析，寫集內實體檢查 0 壞。未搬工具，冒煙測試不適用。

## 沒做到或證據不足

世界觀整合與黃金、四線收線、主觀美術及真瀏覽器驗收皆 pending；small 報告只證明當時狀態。全庫 strict wf-lint 依交接由領導整合後執行；本線不執行重負載。其他活入口可能仍有舊說法，尤其 SESSION-LOG／WAIT_USER 由領導處理。

## 需要決定的事

無新增裁示；既有 P01、Fable 與其他待決事項保留在接續內容。

## 以後交接書該點名的工具

語意拆段後的連結與錨點檢查、`rg`、`git diff --check`；實體搬移時點名 `fix_moved_links.py` dry-run，整合時執行 `wf-lint.sh --strict`。

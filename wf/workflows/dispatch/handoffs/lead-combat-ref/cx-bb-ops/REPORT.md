# cx-bb-ops：營運、契約與世界經濟候選片段

## 做了什麼

已親讀專案 AGENTS.md、工作流派發與 investigation、user、data-files、design-notes、inbox 規矩及 dispatch lessons，並讀完交接指定的六份 BB 拆解文件。按 2026-10-23 裁示整理可獨立取捨的營運規則，原作事實與移植提案分欄，不寫 spec 或平衡數值。

選出 22 條：人員與補給 7 條、交易與城鎮 4 條、契約 8 條、世界模擬 3 條。保留駕駛員為持久人物、機甲與部件為裝備的分界；需要時明列部位分層、資料效果與不限戰鬥單位數的適配。

## 產出

機制片段為 [fragment.json](fragment.json)，22 列、九欄，ID 為 OPS-01 至 OPS-22；建議採用 4／改造 18／不採用 0。建議只是候選，不代表使用者已選定營運功能；沒有為湊三種建議而否定有價值的規則。

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-ops/REPORT.md`。
片段：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-ops/fragment.json`。

驗收只執行交接書固定三條：REPORT 存在且四段齊全；tabledb 驗讀 count=22，每列九欄皆為非空字串，recommendation 僅用允許值；逐列來源以同一迴圈確認檔案存在並執行 grep -F。

source 核對 22/22 命中

件數未超過 22 列；兩產物合計低於 300 KB，未觸發 gate。

## 沒做到或證據不足的

無阻塞。來源是 BB Build 23856902 靜態拆解，不是本線遊戲實測；未讀 vendor、反編譯原碼或範圍外拆解，未上網，未修改程式或 BB repo。來源記載的原生 RNG、實際排程頻率與導航等未還原部分不當作確定規則。

原作商店不是逐件物流供需模擬，據點 Resources 也不是通用收支帳本；本片段未補造繁榮度、稅收或有限軍備庫。來源中的取整、跨時段漏補算及清理邊界，只在相關候選保留其差異，未要求位元級復刻。契約挑代表性的護送、巡邏、防守與會戰規則，未展開全部合約家族。

## 需要決定的事

每列 open_question 留一個可拍板問題。優先確定營運層是否納入人員薪資、遠征補給及修理，再選單約或多約、固定敵軍或戰力縮放，以及離線是否推進世界；這些選擇不阻塞候選表交付。

人機分離還需要決定離隊裝備歸屬、部位歸零後可修或必換、按戰果報酬的計功對象。詳細問題保留於資料表，不在 REPORT 複製整份清單。世界觀、具體成本與時長、未選的契約家族優先序留待上游與使用者決定。

## 以後交接書該點名的工具

無；本次點名的 inbox_mail、inbox_poll 與 tabledb 足以完成。

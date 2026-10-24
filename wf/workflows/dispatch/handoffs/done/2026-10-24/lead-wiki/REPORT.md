# REPORT — lead-wiki：百科併進現有網頁（頂層代存，2026-10-24）

STATUS：**DONE**。commit `d5ec4be`（百科）＋`560ccf8`（還原 d5ec4be 誤刪的別線 122 檔；HEAD 已核對無缺檔）。工人 7 條 codex（索引、markdown、資料卡、百科畫面、殼與 e2e；對齊 lore 格式、截圖修排版），交接書與工人 REPORT 在本目錄。

## 入口
`npm run dev` → `http://localhost:5173/#/wiki`（`#/wiki/c/<分類>`、`#/wiki/e/<條目>`、`#/wiki/s?q=`、`#/wiki/timeline`、`#/wiki/relations`；`#/ops` 預留）。戰鬥 F1／Shift+W 開百科；百科 F1／Shift+B 回戰鬥、`/` 搜尋、`g` 首頁、`t` 年表、`r` 關係、`s` 側欄、`?` 說明。戰鬥 URL 參數不受影響；戰況切頁保留；百科獨立 chunk 懶載入。

## 功能
首頁（總件數、分類卡、未建立引用）；分類清單排序與篩選（只列實際出現的選項）；全文搜尋；詳情頁（遊戲資料自動資料卡、lore 概要欄＋markdown＋關係表＋gameRefs、原始資料展開、反向引用、未建立引用灰色虛線）；年表（依時代、可篩勢力）；勢力關係矩陣；最小 markdown 只用 textContent；760px 以下側欄抽屜。

## 件數（當下）
664 條、42 分類（遊戲資料 589、營運 75）；lore 0（plan-lore 尚未交內容）；未建立引用 10（`strategy/default`）。

## 測試與尺寸
新增 60（vm 38、dom 14、殼 8）；`test:dom` 144、`npm test` 490（1 跳過）、check／typecheck 0；e2e 11 全過（戰鬥 e2e「浮出選單」改挑未被選單蓋住的格）。build：主包 737 KB（gzip 176），百科 79 KB＋CSS 6 KB。headless 截圖驗過排版與假 lore 資料。

## 未驗證
真 lore 資料與使用者觀感；反向引用顯示原始欄位路徑未中文化。

## 需要決定（頂層 2026-10-24）
1. 營運頁接入 → lead-ui-ops 負責。
2. 回合開始選單蓋格 → 使用者試玩判斷。
3. `strategy/default` → 百科視為非內容引用略過（交下一條 UI 線）。

## 教訓
混合檔提交用臨時 `GIT_INDEX_FILE` 時，提交前一刻核對 HEAD 未變，並用比對式 `git update-ref`（HEAD 一動就失敗）；headless 截圖用 `node_modules/playwright-core` 小腳本對 `vite preview`。

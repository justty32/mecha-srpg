# cx-wiki-lore 第二輪完成回報

## 做了什麼

百科 VM 已對齊 `content/lore/README.md`：關係陣列辨識正式目標鍵與關係詞，保留 note；事件 period 進時代面向與年表。負數年、自由字串年份與未知日期依契約排序，時代段落按 from 排序。分類採指定權重，補登記表、規則常數與內容包中文名；勢力關係產中文 label、tone 與 note。

五種 lore 概要使用正式欄位與中文標籤，傭兵評分顯示 n／5，古代機為 kv，事件後果為清單，關係表為對象／關係／備註。物件值改為遞迴 kv，深度超過 3 才退回 JSON 文字；部位表為一層一列、固定九欄，後續層部位留空，層種類沿用既有中文函式，抗性從索引登記表取顯示名。

新增測試恰好六個，既有 cards 測試僅配合 kv 與中文顯示更新斷言。結構性舊清單檢查另在同一測試內餵入錯誤形狀，確認會拒絕，再驗實際 EntryPage。

指定驗證結果：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/*.test.ts'` 回傳 0，38 pass、0 fail；`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 均回傳 0。每個完成修改的檔案後均跑 UI 型別檢查及 inbox_poll。早期 frozen types 的缺欄錯誤已由本線 relations 修改與另一線 DOM 修改消除，最終兩份型別檢查沒有錯誤。

## 產出（檔清單）

程式目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/`。本線修改 `kinds.ts`、`index.ts`、`timeline.ts`、`relations.ts`、`cards.ts`、`cards.test.ts`；新增 `lore.test.ts`。其餘程式檔未修改。

本報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-lore/REPORT.md`。連同測試共新增兩檔；非測試 wiki 檔案合計 64,650 bytes，未觸發 120 KB gate。另按交接書寄送上線與終局 inbox 回報。

## 沒做到或證據不足的

沙箱外不帶 `--test-isolation=none` 的重算與型別複驗由領導執行，本線僅提供上述沙箱內新輸出。沒有執行固定驗收以外的 build、瀏覽器或其他測試。

工作樹開場已有整個 wiki 目錄及其他線的未提交改動；`git status --short --untracked-files=all` 因此把第一輪檔案也列為 `??`，不能僅靠該狀態分辨本輪作者。本線實際寫入限於上段六個既有程式／測試檔、兩個新檔及授權的 inbox；沒有改 frozen types、markdown、DOM、content 或其他線檔案，也沒有 commit。

## 需要決定的事

無阻塞。下列契約缺口均採最小解並留註解，交由領導收線時確認。

## SPEC-GAP 清單

`index.ts`：為讓只有事件檔的正式 lore 也能進年表，補入未被 timeline.json 的 event 引用涵蓋的事件；已有明確引用者不重複。顯式年表項缺 era／period 時，從對應事件取 period。

`timeline.ts`：保留 total 為篩選後筆數、面向選項統計整份年表的既有語意；同 from 的時代維持原順序，缺時代條目排最後。

`cards.ts`：kv 的 label 只能放文字，故物件鍵若是引用，以目標名稱作標籤，另在 kv 中放「對象」ref 與「值」，保留連結。既有 layerTypeLabel 簽名要求完整 ContentDB，但實際只讀 layer-types；提供由索引建立的該欄適配並局部型別斷言，不引入內容載入器、不修改既有函式。

原有且未變更的 SPEC-GAP（無 id 根檔分類、頂層 id／body 掃描規則）沿用第一輪。

## 以後交接書該點名的工具

無。

# cx-wiki-polish 第二輪百科 DOM 排版

## 做了什麼

已親自讀交接書、指定 AGENTS.md、wf 規矩、共用契約、凍結型別、markdown 與 architecture 的 ui-adapter 段，並完成第二輪指定 DOM 修改。

CardValue 的 kv 使用兩欄 dl.wiki-kv，巢狀物件縮排，表格內不轉成圓點清單；八項以內的行內值以「、」分隔，九項以上或含 kv 的清單使用 ul。勢力矩陣加水平捲動容器、橫書欄頭（超長截斷＋title）、sticky 左欄；關係顯示中文 label、中文來源、六種 rel-{tone} 配色與 note title，下方另按出向勢力列完整關係清單，包含對象連結、label、來源與可見 note。

側欄名稱與靠右件數徽章分開、只在 hover 顯示底線、群組間距加強；首頁分類卡片改為名稱與徽章並收緊內距；分類清單列以名稱、等級徽章、單行 summary 與行內 tags 緊湊呈現。保留分類高亮與手機側欄抽屜。

新增恰好 4 個 test()，既有 10 個保留，僅調整關係測試以符合新型別的 tone 與中文來源；fixture 補齊 label／tone／note，既有能力清單使用 kv 新變體。

驗證紀錄：指定 node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/wiki/*.test.ts' 回傳 0，14 tests／14 pass／0 fail；原始檔計數為 14 個 test()（新增 4）。每個修改檔完成後均跑 npx tsc --noEmit -p tsconfig.ui.json，最終回傳 0。最終 npx tsc --noEmit 回傳 1，唯一錯誤位於別線 src/ui-adapter/ops/vm/labels.ts:49:44（TS2322，string | undefined 不能指派給 string）；本線範圍零型別錯誤，依交接書不處理別線檔案。

每個工作步驟已跑 inbox_poll.sh cx-wiki-polish --once，未收到 orders。git status --short 顯示本線檔案位於既有未追蹤目錄中；本次只改下列六個既有程式／測試檔及新增本 REPORT。非測試檔合計 43,632 bytes，低於 90 KB；新增檔只有 REPORT 一個，未觸發 gate。未 commit。

## 產出（檔清單）

- src/ui-adapter/dom/wiki/card-dom.ts
- src/ui-adapter/dom/wiki/fixtures.ts
- src/ui-adapter/dom/wiki/mount.ts
- src/ui-adapter/dom/wiki/pages.ts
- src/ui-adapter/dom/wiki/wiki.css
- src/ui-adapter/dom/wiki/mount.test.ts
- wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-polish/REPORT.md

## 沒做到或證據不足的

沙箱外測試計數與兩組型別檢查依交接書由領導重跑。本次未進行瀏覽器或截圖目視驗證（交接書禁止），因此不宣稱已確認實際畫面。核心型別檢查的別線錯誤如上，未改動。

## 需要決定的事

無。

## SPEC-GAP 清單

「短文字」沒有字數門檻：card-dom.ts 已加 SPEC-GAP 註解，採契約明定的八項門檻；較長文字自然換行。內含 kv 或長子清單時保留區塊清單，避免把 dl 放進行內 span。無需改凍結型別。

## 以後交接書該點名的工具

無。

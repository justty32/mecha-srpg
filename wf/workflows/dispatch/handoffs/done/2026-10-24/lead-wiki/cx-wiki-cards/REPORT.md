# cx-wiki-cards 資料卡交付報告

## 做了什麼

已完成 `entryPage(index, key)`，身份 cx-wiki-cards，團隊 teams/lead-wiki。先讀指定 AGENTS.md、wf 規則、共用契約、凍結型別、markdown 與架構，再核對 content/base 各目錄實際 JSON 及 core／ops 內容格式。

資料卡涵蓋 frame、bodyplan、component、ability、effect、person、soultree、species、monster、terrain、map、scenario、faction；營運資料以通用鍵值與 raw 呈現。構型展開部位與層、座位，怪獸展開物種族別、等級範圍、屬性、資源池與構型。名稱類欄位進概要，二名進 badges。lore 使用 parseMarkdown、兩種關係格式與 gameRefs；反向引用依來源分類分組並取中文分類名，附麵包屑。

每頁保留 raw，排除已呈現的頂層欄位及 id/name；未知資料遞迴保留，數字用 num，引用鍵與引用值轉 ref，壞引用 target 為 null。專屬表格採欄位聯集、巢狀資料完整保留，避免新增欄位被吞掉。不改索引及來源 JSON、不寫死內容 id、不引入 DOM。

固定驗證證據：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/cards.test.ts'` exit 0，TAP tests 10／pass 10／fail 0，原始檔恰好 10 個 test()。`npx tsc --noEmit -p tsconfig.ui.json` exit 0；`npx tsc --noEmit` exit 1，唯一診斷為其他線 `src/ui-adapter/vm/route.ts(9,22): TS2304 Cannot find name 'URLSearchParams'`，本線零錯誤。初輪本線型別問題已修正並重跑；早先其他線 mount.ts 尚未存在的錯誤也已消失。

## 產出（檔清單）

新增三個檔案，git status --short --untracked-files=all 顯示三者為 ??；本線未寫入其他程式或文件，另依交接書使用 inbox 工具收信及回報。未 commit。

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/cards.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/cards.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-cards/REPORT.md`

程式只用一個非測試檔，未拆 cards-game/cards-lore；連 REPORT 計入仍低於 60 KB 容量 gate，新檔數未超過 4。

## 沒做到或證據不足的

沙箱外正式測試計數、兩種 tsc 與最終整合驗收依交接書交領導重跑。無 DOM 的全專案 tsc 尚受上述其他線 route.ts 錯誤影響。本線未執行交接書以外的測試、GUI、瀏覽器或建置。

## 需要決定的事

無。

## SPEC-GAP 清單

CardValue 凍結契約沒有 object 型別，專屬表格及清單中的物件以巢狀 list 表達「鍵、值」，引用形狀的鍵也產 ref；raw／kv 的一般物件使用完整欄位路徑遞迴展開。已在 cards.ts 的 value() 註解標示 SPEC-GAP，採此最小呈現方式，未改 types.ts。

## 以後交接書該點名的工具

無。

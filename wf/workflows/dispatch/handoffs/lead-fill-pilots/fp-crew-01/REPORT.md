# 已讀清單

以下路徑均親自讀過；相對路徑以隔離 worktree 為先，該樹未收錄的交接／計畫由主 repo 同路徑唯讀查閱。目錄項讀過現有檔名與本批用到的完整範本；AGENTS.md、fp-common.md、fp-rulings.md 均讀原文。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/cx-fp-crew-01.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/lore-text.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、三個既有 lore 地方、四個既有勢力、本批六份 person 範本及六份背景數值參照、兩份 model 與 frame 顯示名。people、pools、batch-files 以 tabledb 查 batch=fp-crew-01；review-draft 逐檔查詢；未讀入其他批人物表。開場 inbox_read 無信。按使用者限寫要求，沒有更新 SESSION-LOG 或其他既有檔。

## 做了什麼

線 cx-fp-crew-01，領導 lead-fill-pilots。依核定 people／pools 原值新增九組 background＋person＋character 與三個招募池，恰好 30 檔。manifest base 與 worktree HEAD 均為 `27e6ea2f3481a4df855b19bfbf2760a65433fbf1`。不改既有檔、不 commit、不寄 inbox。

person 從指定 template 完整複製後只替換核准欄位；traits 僅掛一次、background.traits 為空；未填 null 年資、性別或不支援的 abilities。三名老手保留 activeYears，機型只寫敘事 mech，不附送機甲。三池各三個同批獨有來源抽二人，權重照表。未調平衡。新池會改營運共享亂數軌跡。

## 產出與掛點

逐檔 30 列見 [review-rows.json](review-rows.json)，新姓名、背景與池名稱均標「（提案）」。遊戲顯示名維持核定原值。吉大港接解拘之夜的巡修與急救缺口、知識傳承；達卡接孟加拉灣戰役、糧運與北郊撤離；三角洲接淺蝕後的導航、屍船砲手與轉運護理。全部掛到既有底色與 C／E／F／G 線，沒有另造大事件。

九份正文各三段、去空白 289–305 字，含崩前、崩後、性別、招牌瞬間及核定招牌話原句；born＝2108−age，places／faction 都指既有 lore。譚雲禾為十四歲人類技師學徒，由成人帶教、不駕駛；普拉比爾與阿齊茲沒有 activeYears，正常衰老。阿齊茲招牌話的「殼」指獸的甲殼，非機甲裝甲。

寫前列過 persons／characters，grep 掃全 content 的九個姓名、id 與背景名，0 命中；另掃 east、afrwasia、south、euram、moon 五份 names-claimed，0 命中。證據在 `/tmp/cx-fp-crew-01/name-content-grep.txt`、`name-other-grep.txt`（空檔即 0 命中），查詢與名單也存於該暫存目錄。

## 驗證與新警告

固定四條驗收，不另加 gate：

1. manifest 的 30 路徑／id 與 batch-files 本批完全一致，30 檔 JSON 合法；既有追蹤檔修改 0。新增內容總計 31,027 bytes，單檔均小於 16 KB。開場已有未追蹤 `node_modules` symlink，目標為主 repo 的 node_modules；它非本線新增且保持原樣。
2. `npm run check` 僅跑一次，退出碼 0：base `OK 0 errors, 32 warnings`，ops `OK 0 errors, 10 warnings`；所有警告皆指既有檔，本批 base／ops 新警告 0。`node content/lore/check.ts` 退出碼 0，`errors=0 warnings=9`。`npm run typecheck` 退出碼 0。依 fp-rulings 與使用者資源禁令，全套 `npm test` 改為「領導跑」；本線未跑，沒有可報告的實測黃金紅檔名，不能宣稱測試或黃金已通過；未重錄黃金。
3. 九人三檔齊備，年齡與出生年一致、地方／勢力存在、正文段數與長度合格；新增路徑只含核定四類，未新增 effect、AI 或禁寫主線內容。
4. REPORT 已讀清單列齊交接書 23 項及追加 fp-rulings；review-rows 恰好 30 列、白話均≤60字；[inserts.json](inserts.json) 為合法 wf-table/1 空表（0 列）。

lore 新增九個警告均為人物必填的 `places` 未登記欄位，照任務要求保留，未改檢查器或格式文件：biren-dutta、salma-mazumdar、tan-yunhe、nasima-biswas、prabir-sen、ishita-paul、runa-sarkar、aziz-mondal、moyna-dey，各一筆。

原始輸出在 `/tmp/cx-fp-crew-01/check.log`、`lore-check.log`、`typecheck.log`；固定驗收核對輸出在 `acceptance.log`。base 的 32 個既有警告分別為怪獸 capture layer HP 10、evasion 超帶 1、soft-overflow-band 19、damage 超帶 1、機械機無預設武裝 1；ops 重複列上述 10 個 capture layer HP 警告。

## 沒做到或證據不足

全套 npm test／e2e／sim／fuzz、probe／playtest 均未執行，符合本輪禁令；黃金結果與實際紅檔名待領導測試提供。沒有以舊輸出代替本線驗證。

## 需要決定與引擎缺口

沒有阻塞本批產出的新矛盾或待決設定。既有引擎沒有依 tags 強制禁止未成年上機，譚雲禾的非駕駛定位目前是敘事限制。醫護、廚務、領航與船砲等專業 tag 不代表已有對應專業技能或派任機制；招募卡顯示出身與年齡、職類篩選／專業玩法、未成年派任限制均只留候選，不實作。領導收件後處理新池造成的亂數與黃金差異。

## 子代理

未使用（0）。全部必讀、內容產出及指定檢查由本線親自完成。

## 以後交接書該點名的工具

保留 tabledb 本批查詢與 review 逐檔查詢、ls／grep 撞名證據、npm run check、lore check、typecheck；全套測試持續標示「領導跑」。現有工具均可用，沒有點名工具故障或沙箱拒寫。

狀態：DONE（工人固定四條完成；全套測試依裁示交領導）。

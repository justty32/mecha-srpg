已讀清單

下列路徑由 cx-fp-euram-01 親自閱讀；資料表經 tabledb 按本批／白名單篩選，目錄範本全讀（招募池4檔、背景13檔、persons38檔），再逐人核對指定template。路徑照交接書原樣列出：

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
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/plan.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/people.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/pools.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/batch-files.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/review-draft.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/cx-fp-euram-01.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

worktree 未收錄 fp-common.md、deep-rulings.md，已分別讀取主 repo 相同相對路徑的檔案；主 repo 僅讀取。另讀開場 SESSION-LOG／WAIT_USER、WORKFLOWS、world-pillars、data-files，以及本批引用的既有地方、勢力摘要、事件、妮娜與兩種機型資料。已核對正式 manifest base 與 worktree HEAD 同為 27e6ea2f3481a4df855b19bfbf2760a65433fbf1。

做了什麼

狀態：DONE。本批只新增核定38個內容檔：12個背景、12個human person、12個lore人物與2個招募池。數值逐值照people／pools，person保留指定範本完整pools與growth基礎欄，空abilities與null年資省略。新專名提案標記保留在白話表，顯示名不帶標記。

產出與掛點摘要

歐洲六人接聖馬洛九門同喪次晨、熱那亞工坊與公刻、漢堡護貨、鹿特丹救援與阿爾卑斯之墟；俄國六人接2100白夜失守後南撤、棄東令後的堪察加井港與提克西護運。四條主線掛連A／C／F／G與底色、年表均沿計畫，逐檔掛點見 [review-rows.json](review-rows.json)。本批8名駕駛、4名支援船員；兩位老手保留18／16年駕駛年資，其餘不繼承範本年資或勢力tag。

兩池在新加坡／達卡，各由本批六個獨立背景抽2人；地方欄保留歐俄故鄉與經歷，港口僅承載招募。38列白話從review-draft按本批路徑原樣篩出，白話最長29字。三列 [inserts.json](inserts.json) 只提議將既有提克西、堪察加井城、白夜菌床追加到俄國勢力places，由合併線去重後套用，白夜仍是舊防區／護運經歷。

檢查結果與新增警告

npm run check退出0：base loader 0 errors／32 warnings，ops checker 0 errors／10 warnings。32條包含10條怪獸capture layer HP差異、19條instinct軟上限band、1條evasion數值帶、1條damage數值帶與1條mechanical-unarmed；ops再列相同10條怪獸警告，合計42條輸出，全指向未修改既有檔，沒有本批base新警告。node content/lore/check.ts退出0：0 errors／12 warnings，全部是本批人物的places未登記警告，依交接書保留。npm run typecheck退出0。原始結果見 [check.log](check.log)、[lore.log](lore.log)、[lore-final.log](lore-final.log)、[typecheck.log](typecheck.log) 與 [checks.json](checks.json)；lore-final是加上三段標題後的複核。

沒做到或證據不足

全套 npm test 依使用者與 fp-rulings 資源禁令交「領導跑」。本線沒有test失敗檔可列，也沒有宣稱黃金通過；新池會改營運亂數軌跡，領導整合後判斷失敗與是否統一重錄。本批沒有probe／playtest、e2e、sim、fuzz或黃金重錄的驗收要求，未執行。

需要決定／引擎候選

people與plan的艾里安數字有內部矛盾：born=2070、age=38、activeYears=18且2090上機，相應上機年齡應為20，草稿卻寫「2090年十八歲」。本線保留所有核定數值及2090年份，body省略相衝突的上機歲數，沒有把18改成20或重設出生年；請領導裁示草稿那句。其餘設定未發現需裁示矛盾。人物places未登記警告已按工單列明，未改schema／README；沒有新增引擎候選。

子代理

實際使用0個。12組皆由本線親讀規範、核數值與撰寫小傳；無子代理品質項。

以後交接書該點名的工具

無新增。names-claimed.json實為字串陣列，並非wf-table記錄表；初次tabledb查詢因格式不合失敗，已以工單指定grep完成12名中文名／id的全content與跨線claims核對，無占用或跨線衝突。其餘people／pools／batch-files／review／inserts均經tabledb讀寫，工具可用。兩個機型與妮娜的初猜路徑已用rg定位修正，未改任何工具或既有檔。

固定四條驗收證據

1. 通過：git status逐路徑核對只有白名單38個??新內容檔，既有node_modules連結除外；git diff HEAD為空，12組三件齊、兩池來源均在本批且base place存在。內容合計43951 bytes，最大單檔1740 bytes，未觸容量gate。證據：[git-status.log](git-status.log)、[acceptance.json](acceptance.json)第1列。
2. 通過工人核定範圍：check與lore均0 errors，typecheck退出0；全套test交領導，原始輸出與警告如上。證據：[checks.json](checks.json)、[acceptance.json](acceptance.json)第2列。
3. 通過：review-rows合法38列、白話≤60字，inserts合法3列；逐人age／born、既有place／faction、quote與三段body均核對people。body原字串340–365字，純漢字268–292字，兩種口徑均250–450；性別、崩前／崩後、現在與指定瞬間齊全。無新effect、AI或禁寫題材。艾里安草稿歲數矛盾已透明列明。證據：[acceptance.json](acceptance.json)第3列與逐人明細。
4. 通過：REPORT已寫在指定絕對路徑，開頭列出全部25個先讀路徑；列明這四條證據、未解歲數措辭與子代理0。證據：本檔與 [acceptance.json](acceptance.json)第4列。

交付留在指定隔離worktree與本報告目錄，未commit、未對外寄信；領導自行帶回內容。

已讀清單
親自讀過主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md` 與 worktree 的 `AGENTS.md`；交接書讀取自指定主 repo 絕對路徑，其餘下列相對路徑皆在隔離 worktree 逐檔閱讀。
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/aegir.md`
- `content/lore/events/aegir-wakes.json`
- `content/lore/events/aegir-lien.json`
- `content/lore/events/first-bid-sheet.json`
- `content/lore/factions/euro-umbrella.json`
- `content/lore/factions/inner-sea-houses.json`
- `wf/workflows/dispatch/handoffs/lead-aegir/cx-ag-02.md`

## 完成內容

線：cx-ag-02；團隊：teams/aegir；批次：ag-02。只在允許的四檔 body 插入文字，既有文字、其他欄位及檔案格式皆保持原樣，未新增段落。沒有 commit。

### `content/lore/factions/salt-gull.json`

body 增加 86 字。新增句全文：

> 「離船作業一小時必撤」是茉莉從港務局排引水班帶來的規矩，潮不等人。

> 2106 年起，殘聯評等把至今無人能認的埃吉爾登記成「鹽鷗的裝備」，押在一個內海家族手裡，家族按季寄帳單。


### `content/lore/characters/molly-van-den-berg.json`

body 增加 59 字。新增句全文：

> 她從港務局帶走一隻懷錶，每一戰到一小時整就下令撤。

> 停火後，她為了修機簽了內海家族的契，押上埃吉爾，寄來的帳單從不遲付。


### `content/lore/places/saint-malo.json`

body 增加 80 字。新增句全文：

> 大潮援軍靠歐傘的標單分配，內海家族用現金標走好的獵團，聖馬洛付港費，修機靠賒帳。九門同喪那一夜，內海的船塢還在賒帳賣機給大西洋岸，這裡的九道拱門卻一座也沒留下。


### `content/lore/places/rotterdam-roost.json`

body 增加 53 字。新增句全文：

> 鹽鷗在歐傘的標單上議價，價格有公會上限；巢裡的人都知道斯卡蓋拉克那台古代機押在內海，帳單每季寄到港務大樓。

## 需要決定的事

無。埃吉爾維持至今無人能認，四檔未寫認主事件或其後發展，內海家族未點名。

## 驗收（固定三條）

1. `node content/lore/check.ts`：exit 0；末行 `errors=0 warnings=2`。
2. `npm run check`：僅跑一次，exit 0；末行 `OK 0 errors, 8 warnings`。
3. 本 REPORT 存在，開頭為「已讀清單」，逐檔附新增句全文。

兩項檢查在指定 worktree 根目錄執行；完整輸出留於 `/tmp/cx-ag-02/lore-check.log`、`/tmp/cx-ag-02/npm-check.log`。lore 兩則警告指向未修改的 `events/busan-returned-seal.json` 與 `events/dark-quay-surety.json` 未列入 timeline；其餘警告指向未修改的 base 內容，未擴大處理範圍。未跑 npm test 或其他驗收。

範圍記錄：四檔增量皆未超過 200 字；逐一還原新增句後與 HEAD 原檔完全相同。開場即有未追蹤的 `node_modules`，本線未改動。

## 以後交接書該點名的工具

本批四項必用工具足夠；若要明列範圍核對方式，可補 `git diff --name-only` 與 `python3`，用於比對只有 body 插入及統計增字，不增加驗收條數。

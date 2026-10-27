# 任務：依核准計畫產出第3輪三個mechs概念

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/WORKFLOWS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/team-model.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/content-batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`及content工作流規矩、world-pillars適用子檔、mechs.md或bio-monsters.md、polish.md、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`與計畫明列同級範本／骨架／配件／能力全文。親讀主樹新版，REPORT開頭列mustRead五份；長閱讀清單放資料表，不大表dump。

## 背景與唯一目標

領導審過astra `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-plan.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-plan-review.json` 後才依category=mech（或mechs） decision=adopt列完整產出機甲frame+world/model各3，共6新內容檔；公司只有限靜態檢查，不改引擎。若本類未審不得先寫正文。

## 範圍

只寫 `/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wn-r3-mechs-1027/content/` 下本批manifest allow及核准計畫targetFiles精確明列的wn-r3-新JSON；另可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3/mechs/REPORT.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3/mechs/review.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3/mechs/naming.json`。不做：改既有內容、其他批隔離區、main content、manifest、index、src/schema/spec、bodyplans/abilities/components/effects新增、年表、SESSION/CLAIMS、其他未列任何檔。
件數 gate：3概念、本類6內容檔，manifest最多20；容量 gate：新內容與報告合計1MB。超出回報，不擴範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 定向讀核准計畫／範本表及寫review/naming wf-table/1 |
| `wf/tools/content_gate.py` | 主樹工具配本隔離區與manifest檢查新增範圍 |
| `git diff --check` | 本worktree空白檢查 |

## 資源與禁區

可寫程式碼線（只JSON與報告）。子代理上限0；原生工具回傳，最多同時2子線。禁止網路、安裝、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定或掛載修改。不跑node，領導串行做loader／ops有限檢查；不改.gitignore、不建分支或rebase/reset、不動他人staged。

## 工作

1. 親讀3列計畫、領導審核requiredConstraints及完整範本。查重讀主樹最新版含wl-*，但引用只能HEAD已有ID或本批配套，不引用wl-*、其他批wn-*。同級模板只借合法欄位，不複製定位／配裝湊數。
2. 機甲用同級合法骨架與defaultLoadout，至少一把非conventional-arms對獸武器，slots/type/size及pool產燼相容；座艙、機甲核心與需要的魂核配套按HEAD合法模板。不要靠小改數值當差異。model.frame/tier/cost/requires/availableFrom與模板、grade一致；不宣稱自動市場上架，不新增研發規則、血統或古代機。name沿現有系列三段命名，英文原名放既有frame.nameEn（aka僅供勢力別名，不放英文字串），model命名意涵放naming表。
3. review每概念一列：id/files/category/name/plain（白話≤60字）/hooks/nearestExisting具體ID與主樹檔/similarity/substantiveDifference/decision/reason/fullTextRead（最近既有全文路徑/hash/關鍵事實）。比較定位與配裝或能力組合與骨架，不能只比名。另naming wf-table保存英文原名、意涵與中文。機制矛盾只記證據、換可行內容，勿修引擎。

## 交付

內容：`/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wn-r3-mechs-1027/content/`。報告：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3/mechs/REPORT.md`；逐件表：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3/mechs/review.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3/mechs/naming.json`。manifest唯讀：`/mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wn-r3-mechs-1027.json`。
REPORT四段已做／產出／未做與不足／需決定，首段五份mustRead逐行列出；明記draft、整合平衡試玩留回家，數值僅同級暫填。

## 驗收（固定3條）

1. 3概念及6個新JSON精確符合計畫配套，Python驗格式、id檔名與引用；只引用HEAD或本批；配裝／能力骨架合法且無改舊檔。
2. 主樹content_gate.py對本worktree與manifest回傳0，自己的git diff --check為0。不要追加node或測試。
3. REPORT與review/naming存在，各表恰3概念列，白話≤60字，最近既有全文比較及實質差異可追查；含mustRead與未完整驗收說明。

## 完成／阻塞回報

原生工具回傳DONE/BLOCKED、件數與REPORT路徑。指令路徑打錯自行修；真機制缺口記證據，選可行替代，不自行加新規則。不得稱完整accepted。

# 任務：實作核可CK兩物種十三檔資料稿

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-plan-1028/CK-monsters.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/bio-monsters.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/abilities-effects.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/acceptance-playtest.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/playtest.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/conventions.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/code-map.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md`。你是原C工人Epicurus，共通wf已親讀沿用，不重讀舊信；只補新類別、核可CM-mechs及review CK01/CK02、表列原碼與近鄰，REPORT列完整已讀清單及沿用來源。

## 背景與唯一目標

主線已核可CK01偏弓、CK02沉顎與species/bodyplans/bio/corpse額外範圍。依核可資料產出十三檔，只展示未營運。先產資料，不做重負載，領導另排驗證。

## 範圍

隔離worktree `/tmp/night-combat-lead-1028/wt-ck` 僅以下十三檔：

- `/tmp/night-combat-lead-1028/wt-ck/content/base/species/night-ck-crookbow.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/bodyplans/night-ck-crookbow.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/monsters/night-ck-crookbow.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/abilities/night-ck-crookbow.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/frames/night-ck-bio-crookbow.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/frames/night-ck-corpse-crookbow.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/species/night-ck-keeljaw.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/bodyplans/night-ck-keeljaw.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/monsters/night-ck-keeljaw.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/abilities/night-ck-keeljaw.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/frames/night-ck-bio-keeljaw.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/frames/night-ck-corpse-keeljaw.json`
- `/tmp/night-combat-lead-1028/wt-ck/content/base/scenarios/night-ck-broken-keel.json`

報告附件只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028/ck` 的REPORT.md、review.json、naming.json、readlist.json、dedup.json、check.log、typecheck.log。不做既有內容、model、市場、lore、timeline、引擎、schemas/specs、依賴、黃金、索引、manifest、SESSION/CLAIMS。件數 gate：13個內容JSON；容量 gate：一般每檔16KB，bodyplan24KB，全批192KB，報告2MB；超過回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `rg` | 有界查引用、格式、原碼事實與近鄰 |
| `python3 wf/tools/tabledb.py` | review CM01/02與engine-facts/numeric-bands條件查詢 |
| `npm run check` | 只允許資料輕量驗證 |
| `npm run typecheck` | 型別輕量驗證 |
| `git status --short` | 只讀寫集核對 |

## 資源與禁區

**可寫程式碼線**：僅上述隔離十三檔與報告附件，sol high，子代理0。全機三工位限制；禁止probe/sim/MCP auto/node --test/wiki/full suite/test:dom/e2e/fuzz，未取得主線重負載時段不可偷跑。不得GUI鍵鼠螢幕/截圖、下載安裝、刪檔或worktree、改全域、不git stage/commit/push/reset/rebase/stash、不寄信。自己指令錯自行修，環境阻塞保留稿回報。

## 工作

1. 按review CK01/02完整配方、CK-monsters與主線核可寫十三檔。species必有schema既有俗名name；B/C monster不加個體name/epithet，不因設計措辭漏species必填欄。各新species/怪獸/活捕/屍體frame同骨架、同兩招，bio instinct與burden，corpse pools空且burden0；不得保留原型額外招。查重及引用先讀近鄰全文。
2. 偏弓min3 unit射、1–2格無傷害招，唯一strut破不可移動但遠射仍存在。沉顎原生7AP、regen5，part限定重咬5AP/penalty10與群吼3AP互斥；雙足皆破才停，顎破不封innate。自然AI新攻擊及鏡衣/群吼各需證據，禁止預置資源/buff或代AI手動施放充自然。此階段只資料稿，重負載/機制/MCP由領導另排，最多退修2輪，不任意waiver。基準CK01/spitter-c、CK02/shelf-back-b，正式展示依設計混族兩怪。
3. 僅check/typecheck輕量一次，留stdout與真實exit；查新警告與引用。交REPORT首段已讀清單（完整repo相對code路徑），四段含產出、證據不足、需要決定。近鄰與設計差異、十三檔數據及naming/review用wf-table/1。未追蹤或/tmp路徑純code，不做失效可點連結。

## 交付

REPORT絕對路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028/ck/REPORT.md`，原生回DONE/BLOCKED/FAILED；資料稿完成後等待領導，不自行跑重負載。22:35後不開新重驗、22:45收稿。

## 驗收（固定3條）

1. 六個核可JSON存在、id與檔名正確、一般16KB/bodyplan24KB與總192KB內；既有內容不變。
2. check/typecheck有真實輸出與exit；review/naming/readlist/dedup/REPORT存在，未跑驗證明列。
3. 僅十三檔與報告寫集，未做git寫入與重負載；只展示未營運。

主線最新核對：展示與B參照用 `frame/bulwark-iv-rampart`，不是不存在的bulwark-iv。species必填俗名name；B/C monster不新增個體name/epithet。核可最新快照在ck/approved-PLAN.md、approved-CK-monsters.md與approved-review.json（只查CK01/02），與來源最新內容一致。

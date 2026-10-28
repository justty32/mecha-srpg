# 任務：實作核可CM兩機六檔資料稿

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-plan-1028/CM-mechs.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/mechs.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/abilities-effects.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/acceptance-playtest.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/playtest.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/conventions.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/code-map.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md`。你是原B工人Zeno，共通wf已親讀沿用，不重讀舊信；只補新類別、核可CM-mechs及review CM01/CM02、表列原碼與近鄰，REPORT列完整已讀清單及沿用來源。

## 背景與唯一目標

主線已核可CM01並燭、CM02燼鐘與唯一bodyplan/component額外範圍。依核可資料產出六檔，只展示未營運。先產資料，不做重負載，領導另排驗證。

## 範圍

隔離worktree `/tmp/night-combat-lead-1028/wt-cm` 僅以下六檔：

- `/tmp/night-combat-lead-1028/wt-cm/content/base/frames/night-cm-twinwick.json`
- `/tmp/night-combat-lead-1028/wt-cm/content/base/bodyplans/night-cm-twinwick.json`
- `/tmp/night-combat-lead-1028/wt-cm/content/base/frames/night-cm-cinderbell.json`
- `/tmp/night-combat-lead-1028/wt-cm/content/base/components/night-cm-cinderbell.json`
- `/tmp/night-combat-lead-1028/wt-cm/content/base/abilities/night-cm-cinderbell.json`
- `/tmp/night-combat-lead-1028/wt-cm/content/base/scenarios/night-cm-yard-bells.json`

報告附件只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028/cm` 的REPORT.md、review.json、naming.json、readlist.json、dedup.json、check.log、typecheck.log。不做既有內容、model、市場、lore、timeline、引擎、schemas/specs、依賴、黃金、索引、manifest、SESSION/CLAIMS。件數 gate：6個內容JSON；容量 gate：一般每檔16KB，bodyplan24KB，全批128KB，報告2MB；超過回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `rg` | 有界查引用、格式、原碼事實與近鄰 |
| `python3 wf/tools/tabledb.py` | review CM01/02與engine-facts/numeric-bands條件查詢 |
| `npm run check` | 只允許資料輕量驗證 |
| `npm run typecheck` | 型別輕量驗證 |
| `git status --short` | 只讀寫集核對 |

## 資源與禁區

**可寫程式碼線**：僅上述隔離六檔與報告附件，sol high，子代理0。全機三工位限制；禁止probe/sim/MCP auto/node --test/wiki/full suite/test:dom/e2e/fuzz，未取得主線重負載時段不可偷跑。不得GUI鍵鼠螢幕/截圖、下載安裝、刪檔或worktree、改全域、不git stage/commit/push/reset/rebase/stash、不寄信。自己指令錯自行修，環境阻塞保留稿回報。

## 工作

1. 按review兩列完整配方及CM-mechs展示設計，先語義查重、引用與範本全文讀。bodyplan槍架同部位兩槍、左右履獨立；燼鐘require heat>=30、施放散30、initial heat0，寒泉既有配裝保留，不能用預填heat假裝自然循環。共通六檔不可改基準或AI。
2. 寫資料與玩家可見語感，nameEn/etymology不新增schema外欄位，命名證據放naming。數值帶、基準對手記清楚：C對longspear-kneeler-v2，B對anvil-iv-ram。未跑五seed/AI覆蓋/機制/MCP時不得冒稱已驗。B弱於基準最多退修2輪，不強加waiver。
3. 僅check/typecheck輕量一次，留stdout與真實exit；查新警告與引用。交REPORT首段已讀清單（完整repo相對code路徑），四段含產出、證據不足、需要決定。近鄰與設計差異、六檔數據及naming/review用wf-table/1。未追蹤或/tmp路徑純code，不做失效可點連結。

## 交付

REPORT絕對路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/night-combat-lead-1028/cm/REPORT.md`，原生回DONE/BLOCKED/FAILED；資料稿完成後等待領導，不自行跑重負載。22:35後不開新重驗、22:45收稿。

## 驗收（固定3條）

1. 六個核可JSON存在、id與檔名正確、一般16KB/bodyplan24KB與總128KB內；既有內容不變。
2. check/typecheck有真實輸出與exit；review/naming/readlist/dedup/REPORT存在，未跑驗證明列。
3. 僅六檔與報告寫集，未做git寫入與重負載；只展示未營運。

## 主線最後第二輪核可修訂

僅CM02 frame.baseAttrs.accuracy由2改6，固定6不掃值；其餘全部不動。CM01 exposure1.5保留，未核可調高。CM01原側既有五seed沿用，只補交換slot與座標側五seed；CM02改後原側與換側各五seed。保存第一輪全敗原證據，不覆寫。逐側記先手、首次合法攻擊、命中、撤退原因、自然新招。這是第二暨最後一輪，不合驗收留隔離draft/flags，不第三輪、不第二旋鈕、不waiver。fixture/MCP既有不受改動斷言可沿用；總窗口22:25，餘額不足先釋放CK，不擴runner。

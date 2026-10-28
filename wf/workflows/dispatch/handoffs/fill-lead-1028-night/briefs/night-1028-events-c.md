# 任務：實作核可 C01–C04 四個純 lore 可能事件

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/ancient-people.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/WORKFLOWS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user/working.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/README.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/lore-text.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/world-pillars.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/README.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style/people.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/world-pillars/world/tone-and-rules.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/world-pillars/world/factions-and-sandbox.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-lead-1028-night/approved-c.json`；親自讀。再讀核可資料列出的近鄰原檔與掛到引用；REPORT第一段逐行列已讀清單。

## 背景與唯一目標

普通 sol 依主線核可設計實作鹽灘借纜、公刻棚下的學費、石肩讓出街口、長桌拆成行李，各一檔。主線另要求每件有具體機甲／傭兵城市背景但不新增機制。四件依核可設計各自獨立行動：共同扶船及耗材爭議、開棚教習與趕工衝突、居民搬像尋名牌、食堂拆桌隨返鄉者分散。

## 範圍

隔離 worktree：`/tmp/fill-lead-1028-night/wt-events-c`，僅新增以下四檔：

- `/tmp/fill-lead-1028-night/wt-events-c/content/lore/events/night-salt-flat-borrowed-hawsers.json`
- `/tmp/fill-lead-1028-night/wt-events-c/content/lore/events/night-hamburg-open-pattern-lessons.json`
- `/tmp/fill-lead-1028-night/wt-events-c/content/lore/events/night-incheon-statue-crossing.json`

- `/tmp/fill-lead-1028-night/wt-events-c/content/lore/events/night-tranquility-table-crates.json`

僅上述四檔可寫於隔離樹；報告附件只可寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-lead-1028-night/reports/night-1028-events-c` 的 REPORT.md、review.json、naming.json、readlist.json、dedup.json。不做既有內容、timeline、base、src、schema、spec、art、依賴、索引、manifest、SESSION／CLAIMS修改。領導已將fn28轉night；以 approved-c.json 為凍結設計，不跟隨規劃線未核可修稿。
件數 gate：內容最多4檔；容量 gate：每檔16KB，內容合計64KB，報告附件2MB；任一超過回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `rg` | 有界查詢近鄰內容與引用 |
| `python3 wf/tools/tabledb.py` | 讀大型wf-table資料；工具從主repo絕對路徑執行 |
| `node content/lore/check.ts` | 唯一允許局部驗證，從隔離樹執行 |
| `git status --short` | 確認隔離寫集 |

## 資源與禁區

**可寫程式碼線**：僅上述隔離四檔與報告附件。子代理上限0；不得再派。全機astra＋驗證正在工作，本線只占一名sol，不搶重負載。不得跑node --test、wiki單檔、npm test、test:dom/e2e、build、sim/fuzz/probe；lore check可跑。不開GUI、不碰鍵鼠螢幕、不下載安裝、不刪任何檔或worktree、不改全域設定、不stash/reset/rebase、不建分支、不stage/commit/push、不寄信。主repo其餘路徑不可寫。自己指令錯誤自行修，只有真實環境阻塞才回報。

## 工作

1. 親讀規矩、核可四列、引用與近鄰，留語義去重證據，不只比名稱。引用需真實存在，事件不新增gameRefs欄；四件都是可能事件，不新增人物／場所／可玩事件／base配套。
2. 四個body各600–1000字，繁中語感，具體行動與後果依核可設計。date=2108-02僅代表可能時段、period=era/league、occurs=possible、visibility=rumor、tags含rumor；summary/body明示若發生／可能，consequences至少兩條條件式；不改timeline、不把後果寫成已生效歷史；不照抄近鄰鏡頭、不硬塞新機制。機甲／傭兵背景從現有母城生活自然入文，不把普通工人寫成可驅核心的不老者。
3. 交付命名表、白話≤60字review與逐檔近鄰／主動作／差異dedup，使用wf-table/1。跑一次lore check，記真實命令及exit；領導統一gate/content_accept，不宣稱整合accepted。
4. REPORT四段：首段已讀清單、做了什麼／產出、沒做到或證據不足、需要決定；工具原生回傳DONE/BLOCKED/FAILED及完整路徑。22:50前停止產出收件，未完成保留並列明。

## 交付

REPORT絕對路徑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-lead-1028-night/reports/night-1028-events-c/REPORT.md`。其他附件僅以上五個指定檔名。

## 驗收（固定3條）

1. 四份JSON存在、id與檔名night一致、body600–1000字，欄位引用與核可四列一致；每件3–5個小標，possible/rumor與條件式後果符合核可設計。
2. 已讀清單、review、naming及寫前／交稿語義去重證據齊全，lore check有真實退出碼；未驗項不冒稱通過。
3. git狀態僅四個新檔，報告僅指定目錄；無既有修改、無git寫入或重負載。

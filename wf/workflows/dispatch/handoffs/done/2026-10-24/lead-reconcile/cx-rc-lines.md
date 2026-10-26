# 任務：把八篇長線敘述與三個歷史資料檔同步到 2026-10-24 待和解裁示

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（尤其文末「裁示（2026-10-24）與兩張表」）、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/guide.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-history-lines/guide.md`（敘述的寫作規則與引用格式）。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

lead-history-lines 寫的八篇長線敘述和三個資料檔裡，很多地方寫「待 R0x 和解」「仍待裁示」，也寫了「潮差愈大愈凶」「平均潮差小於 1 m 幾乎不開裂…」「安全海／凶海」。使用者 2026-10-24 裁示：待和解表**一律照該列「建議（提案）」**（原話「都按照建議」）；**不用「潮差＝威脅」這個概念**（原話「潮差就是威脅...不要用這個概念」「潮汐只是有關聯而已。」），R32 作廢。待和解表 `history-reconcile.json` 已改好狀態。本線唯一目標：讓敘述與資料檔跟裁示一致。

## 範圍（排除法寫死）

- 只改這 11 個檔（都在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/`）：`history-lines/a-gate.md`、`b-ancient.md`、`c-essence.md`、`d-moon.md`、`e-soul.md`、`f-rift-line.md`、`g-umbrella.md`、`h-faith.md`；`history-nodes.json`、`history-lines.json`、`history-timeline.json`。
- 每處要做的事：
  1. **潮汐**：刪掉或改寫所有潮差門檻、「潮差愈大愈凶」「潮差地圖＝威脅地圖」與用潮差解釋某地凶不凶的句子。保留「怪獸多從海洋來、環太平洋為主、內陸盡量少」「蝕線＝海岸線」「墟在內陸高處、同夜不同處」與時間上的關聯（漲潮獸上岸、大潮夜抬級）。「安全海的城造機、凶海的城用機」改成「內海（地中海）的城離大洋遠而造機、大西洋岸的城直面外洋而用機」；一地凶度讀成「海洋來源＋歷年大潮夜抬級的累積」。
  2. **已裁示的列**：寫「待 R0x 和解」「仍待」「留 R0x」的地方，用 tabledb 查該列「建議（提案）」，改寫成採用後的說法，標「（裁示：2026-10-24 照建議）」。建議本身就說「某點交使用者定」或「留白」的（例：R24 的 S 級能否墟出），那一點照舊留在「尚未定的事」。
  3. **「尚未定的事」段與 `尚未定的事`、`待和解`、`狀態`、`與新裁示的出入` 欄**：刪掉已裁示解決的項目，只留建議本身仍延後的；R32 一律寫作廢。
- 不做：上列以外的任何檔（含 `history-lines.md`、`history-reconcile.json`、`history-orphans.json`、`essence.md`、`scale.md`、`tide-range.*`、lore、spec）；不新增人名、事件、專名；不改年表引用 `〔date｜title〕` 的原字；不改資料檔欄位、列數、`序`；不 commit。
- 件數 gate：改動檔超過 11 個就停下回報；容量 gate：任何一篇敘述改後超過 7,600 bytes 就停下回報（資料檔不算容量 gate）。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-reconcile.json get 11`（序號換成要查的；也可 `grep 'R12'`） | 查每列裁示後的建議，不整份 cat |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py history-nodes.json update 0 狀態=…`（檔名、序號、欄位換成要改的），或 Python `from tabledb import load`（`sys.path` 加 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools`） | 改資料檔 |
| `grep -rnE '潮差|安全海|凶海|待 ?R[0-9]|仍待' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-lines /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-nodes.json /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-lines.json /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-timeline.json` | 改前找點、改後核殘留 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py check history-nodes.json`（三個資料檔各跑一次） | 改完驗連結 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-rc-lines --once` | 每改完一檔讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**：無；只寫上列 11 個檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-lines/`（只放 REPORT.md，不寫全文傾印、整份 diff 或 grep 輸出）；不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親自讀「先讀」全部。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；用 tabledb 逐列讀 history-reconcile.json 的 `id`、`狀態`、`建議（提案）`。
2. 逐檔改，改完一檔 grep 一次殘留。
3. 跑 tabledb check。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-lines/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的 11 檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/`（上列） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-lines/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**；「做了什麼」；「逐檔摘要」（每檔幾處、哪幾列 R 被落地、舊→新各取一兩個半句樣本）；「仍留在尚未定的事」（每項附依據列）；「殘留」（grep 命中仍留的每處＋理由）；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 上列 11 檔裡沒有「潮差」「安全海」「凶海」；`待 R`／`仍待` 殘留每處在 REPORT「殘留」段有理由。
2. 八篇敘述每篇 ≤ 7,600 bytes，`〔date｜title〕` 引用沒有改字。
3. 三個資料檔 `tabledb.py check` 0 壞連結、列數不變。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rc-lines`。本線團隊：`teams/rc`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rc-lines --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rc-lines --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-lines/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「敘述與資料檔跟裁示一致」；任何需要改其他檔的需求一律寫進 REPORT，不動手。

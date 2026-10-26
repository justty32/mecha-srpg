# 任務：用十五把傘與海洋來源重算世界尺度數字（提案 v2，不是定案）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes/world/scale.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/dispatch/handoffs/talk-world/HANDOVER.md` 第 2、3 節與第 4 節 1.5、7.6、第 10 條、第 5 節 17–19。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

talk-world 第一代按「六洲、六把傘」提了一組世界尺度數字（scale.md 末段、HANDOVER 第 3 節）。之後使用者改成照現今地緣分**十五把傘**，又裁示怪獸**多從海洋來、環太平洋為主、內陸盡量少**；2026-10-24 再裁示**不用「潮差＝威脅」這個概念**（原話：「潮汐只是有關聯而已。」）。本線唯一目標：照這些條件把數字重算一版，標「提案 v2，待使用者確認」，交領導併進 scale.md。

## 範圍（排除法寫死）

- 只產兩個檔，都寫在報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/`：
  1. `scale-v2.json`（`wf-table/1`，`source` 填 `scale.md`，`extracted` 填 `2026-10-24`）。欄位：`類別`（人口／居住／城邦／傘／勢力／獵團／機甲／古代機與機魂／裂縫與墟／地圖／精粹價）、`項目`、`v1`（第一代數字原樣）、`v2`（新數字）、`依據`（一句：用了哪條裁示或哪個推法）、`開關`（這個數改大改小會怎樣）。每把傘一列（城邦數、人口、傘型），共 15 列放在「傘」類別；各傘合計要等於總數。
  2. `section.md`：給 scale.md 用的一段散文草稿，≤ 2,500 bytes，標題行固定為 `## 數字級：提案 v2，待使用者確認（不是定案）`，寫重算的推法（十五把傘怎麼分、海洋來源怎麼影響裂縫與城邦分佈、內陸為何少、大潮夜抬級累積怎麼讀成凶度）、最敏感的三個開關、與 v1 差最多的三項。不貼長清單（清單在 json）。
- 重算的條件（全部要滿足）：十五把傘名單與三型照 HANDOVER 第 2 節與第 4 節 1.5；總人口 2108 年 40 億、四期 90→65→55→45→40 億照暫值不改；怪獸多從海洋來、環太平洋沿岸裂縫最密、內陸裂縫少（內陸只有河口連通與菌絲族兩種例外）；**不用潮差、潮高或任何潮汐物理量去分配威脅、裂縫或人口**——一地凶度讀成「離大洋遠近＋該地歷年大潮夜抬級的累積」；B 級以上機甲數由「殺了幾隻 B 級以上的獸、開了幾座深墟」反推（精粹量不換質）；機魂不能獨駕，駕駛員永遠是瓶頸。
- 不做：任何檔的修改（含 scale.md、HANDOVER、lore、spec）；不新增人名、事件、專名；不 commit；報告目錄以外不寫任何檔（筆記放 `/tmp/cx-rc-scale/`）。
- 件數 gate：json 超過 80 列就停下回報；容量 gate：json 超過 30 KB 或 section.md 超過 2,500 bytes 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py scale-v2.json`（在報告目錄跑） | 驗格式 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-reconcile.json grep 'R31|R08'` | 查重算要求原文 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-rc-scale --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**：無（只寫報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/` 的三個檔：`scale-v2.json`、`section.md`、`REPORT.md`）；不 commit。
- **報告目錄只放這三個檔**：不要寫全文傾印或計算草稿。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網（現實人口等基礎量用你已知的量級即可，REPORT 註明是概估）。
- **子代理上限 0 個**。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部，抄下 v1 數字。
2. 先分十五把傘的人口與城邦，再分裂縫與墟，再推機甲、獵團、古代機與機魂。
3. 寫兩個產物，跑 tabledb 驗格式、核各傘合計。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 數字表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/scale-v2.json` |
| 散文草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/section.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**；「做了什麼」；「推法」（每步一兩句）；「合計核對」（各傘人口與城邦加總＝總數的算式）；「沒做到或證據不足的」；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `tabledb.py scale-v2.json` 能開、`contract` 是 `wf-table/1`，「傘」類別正好 15 列，各傘人口與城邦合計等於總數。
2. 兩個產物裡沒有「潮差」「潮高」，也沒有用潮汐物理量分配威脅的句子。
3. section.md 第一行是指定標題、≤ 2,500 bytes。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rc-scale`。本線團隊：`teams/rc`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rc-scale --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rc-scale --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-reconcile/rc-scale/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「重算數字成提案 v2」；任何需要改其他檔的需求一律寫進 REPORT，不動手。

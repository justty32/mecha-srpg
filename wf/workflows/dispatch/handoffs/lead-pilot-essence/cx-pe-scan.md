# 任務：盤點全庫與「無人化」「精粹改人」兩條新裁示衝突或可點出的文字，產出兩份清單

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出下列每個路徑）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/content/README.md`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/specs/world/machine-souls.md`、`wf/workflows/planning/specs/world/resistance.md`。路徑都相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`（你只讀它，不寫它）。

## 背景與唯一目標

使用者 2026-10-24 下了兩條裁示（原話）：

- **A 無人化**：「關於無人化這件事，我只接受遠端遙控，還有按照規則行事的，那種傳統AI，跟機魂不同，並且戰鬥力一定比人類差，因爲無法使用精粹相關的能力。」讀法：無人機只有兩種——遠端遙控、照規則行事的傳統 AI；兩者都不是機魂、不會自己學成機魂；戰力一定比人駕差，因為用不了精粹相關的能力。
- **B 精粹改人**：「使用精粹，也就是駕駛機甲，會讓人受到精粹影響，壽命延長，甚至出現在戰場上20年，仍然是少女模樣的情況。並且也會讓人有一些能力，這些能力可以帶到其他機甲使用。」讀法：駕駛機甲＝長期接觸精粹 → 壽命延長、外貌老化變慢；精粹讓人長出能力，能力屬於人、換機也帶得走。

既有定案（不是衝突，**既有說法保留**）：白手套是「沒有精粹核的無人鐵偶，只打得了人、對獸無效」、照術式行動；機魂不能獨駕、不可複製；「塞勒涅試把七號的魂搬進鐵偶，失敗且死了人」。夢召之夜是 2089 年 5 月，最早的駕駛員從 2089 年開始開機甲，所以 2108 年現役最久約十九年。

本線唯一目標：產出兩份盤點清單，讓領導決定哪些檔要進改寫批次。**你只盤點、不改任何內容檔。**

## 範圍（排除法寫死）

- 只掃這些路徑的玩家可見文字與設計文字：`content/lore/`（全部，含 `timeline.json`、`style.md`、`glossary.json`）、`content/base/`（只看文字欄：name、title、summary、body、desc、description、text、label、brief、lines、flavor、epithet、note、badge）、`wf/workflows/planning/design-notes/`、`wf/workflows/planning/specs/world/`、`wf/workflows/content/world-pillars.md` 與 `wf/workflows/content/world-pillars/`。
- 不掃：`content/index/`、`content/batches/`、`wf/workflows/dispatch/`（含所有 handoffs 與 done 紀錄）、`wf/inbox/`、`legacy/`、`src/`、`test/`。
- 不做：改任何內容檔或設計檔；新增人名、事件；替使用者決定沒裁示的細節（例如能力上限、代價）；寫兩份清單與 REPORT 以外的任何檔。
- 件數 gate：清單一合計超過 150 列就停下回報；容量 gate：任一產物超過 200 KB 就停下回報。任一觸發都停。

## 怎麼判（寫死）

**清單一 `scan.json`**（契約 `wf-table/1`，欄位：`序`、`裁示`（A 或 B）、`檔`（相對 repo 根）、`欄位`（JSON 路徑如 `body`、`rows[3].v2`，md 寫段落標題）、`原文`（命中句全文，≤ 200 字）、`判定`、`理由`、`建議最小改法`）。`判定` 只用三個值：

- `矛盾`：A——寫成無人機（或鐵偶、無人化骨架、自動機）比人駕強、能對獸、能用精粹能力、會自主學習、會長成機魂或像機魂一樣有人格；「搬魂」寫成成功或讓鐵偶變強；把機魂寫成能獨駕。B——明寫長年駕駛員在駕駛期間明顯老去（例「開了二十年機甲，頭髮全白」）、或寫駕駛員的能力綁在某台機上、換機就沒了。
- `宜點明`：沒有直接矛盾，但讀者會讀成與裁示相反，補一句就清楚。例：只寫「全面無人化」而沒有任何地方說明無人機只能遙控或照規則、戰力比人駕差；「挖掘隊／看守是無人的」這類句子本身不矛盾，只在**同一檔沒有任何限定**時列為宜點明，且同一檔只列一次。
- `不改`：命中關鍵字但與裁示無關（例「無人能認主」「無人應答」「無人證實」、規則 spec 的 `derelict` 無人單位、勢力「自主作戰」）。**這類不要列進清單**，只在 REPORT 給總數。

B 的老化判準：開始開機甲時已經是中老年、現在被寫成老人，**不算矛盾**（老化是變慢，不是倒退）；沒開過機甲的老人不算。只有「駕駛年資長、而且文中把老去寫在駕駛那些年」才算矛盾。

**清單二 `candidates.json`**（契約 `wf-table/1`，欄位：`人物`（id）、`名字`、`出生`、`首次駕駛年`、`2108 年資`、`2108 是否仍在座艙`、`現有外貌或年齡描寫`（原文摘錄，沒有寫「無」）、`出處`）：列 `content/lore/characters/`、`content/base/persons/`（只 `kind:"human"`）裡**開過機甲、而且到 2108 年仍活著**的人，年資從他們的 body、events、timeline 推；推不出的寫「不明」並說明依據。依 `2108 年資` 由高到低排。這份是交使用者決定要不要點出「不老」的候選，**不做判斷、不加建議台詞**。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `grep -rn` 或 `rg`（在 repo 根跑）：關鍵字至少含 無人、無人化、鐵偶、遙控、遠端、自主、自動、自律、AI、搬魂、複製、獨駕、程式、老、白髮、皺紋、年邁、退役、少女、年輕、壽命、歲 | 找候選句 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/scan.json get 0`（candidates.json 同法） | 寫完自查兩份 json 能被讀 |
| `python3 -c 'import json,sys;json.load(open(sys.argv[1]))' pe-scan/scan.json`（在報告目錄的上一層跑；兩檔都驗） | 確認 json 合法 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-pe-scan --once` | 每掃完一個目錄讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**：無；只寫報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/`（只放 `scan.json`、`candidates.json`、`REPORT.md`）；暫存放 `/tmp/cx-pe-scan/`；不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親自讀「先讀」全部，REPORT 記成本。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. 照範圍逐目錄 grep，逐句判定；`不改` 的只計數。
3. 寫 `scan.json`，再寫 `candidates.json`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 清單一 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/scan.json` |
| 清單二 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/candidates.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**；「做了什麼」；「統計」（A／B 各自 `矛盾`、`宜點明` 列數，`不改` 命中數）；「最要緊的五處」（各一行）；「沒做到或證據不足的」；「需要決定的事」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `scan.json`、`candidates.json` 都是合法 json、`contract` 為 `wf-table/1`、欄位與本交接書一致。
2. `scan.json` 每列 `判定` 只有 `矛盾` 或 `宜點明`，`檔` 都在範圍內。
3. `candidates.json` 至少列出所有 lore 人物檔裡 body 寫到開機甲或認主、且沒有 `died` 的人。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-pe-scan`。本線團隊：`teams/pe`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pe-scan --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-pe-scan --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-pilot-essence/pe-scan/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「兩份盤點清單」；判定拿不準時列成 `宜點明` 並在理由寫清楚，由領導裁。

# 任務：照凍結契約寫出 content/base 的兩張地圖、兩個情境與 content/README.md

> 領導 `lead-impl-content-base` 寫給 codex 工人 `cx-content-scenarios`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄 `contract.md` 的 §0、§3——id、檔名、件數、欄位要點照抄。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/contract.md`、`schemas/content.schema.json`（欄位形狀的唯一真相，**不可修改**）、`content/base/` 既有檔（範本，**不可修改**）、spec `wf/workflows/planning/specs/core/content-format.md`、data-model-world.md、rules-battle-flow.md、world/factions.md（spec 在 `wf/workflows/planning/specs/` 下）——親自讀。

## 背景與唯一目標

地基已交付載入器與 schema，`content/base/` 各類只有一個範例；登記檔已由領導補齊。唯一目標：交出契約列給你的 **4 個新 JSON 檔＋`content/README.md`**，讓 `npm run check` 在合併後零錯誤載入。地圖要有可讀的地勢（廢墟、淺灘、60 圖的蝕地與酸沼帶），不做平衡。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建這 5 個檔，一個不多）：`content/base/maps/skirmish-20.json`、`content/base/maps/rift-edge-60.json`、`content/base/scenarios/skirmish-whitegloves.json`、`content/base/scenarios/rift-edge-nest.json`、`content/README.md`；外加你的 REPORT。地圖 `cells` 字串用一支一次性 node／python 腳本產生（腳本放 `/tmp/cx-content-scenarios/`，不進 repo），長度必須恰好 width×height。
- `content/README.md` 一頁（≤ 4 KB）：`content/base/` 目錄一覽（每個子資料夾一句、件數）、id 命名規則（`pack:kind/name`、檔名＝name 段）、「新增 X 要改哪些檔」**只寫一行並指回** spec `wf/workflows/planning/specs/core/content-format.md`（用相對連結 `../wf/workflows/planning/specs/core/content-format.md`，不複製 spec 內容）、驗證指令 `npm run check`；另加一小節「古代機甲的名字」照抄這句：「古代機甲本身沒有名字，`name` 是人取的稱號，通常引用神話傳說；`frame/ancient-rearguard` 叫「刑天」（中國神話中斷首仍戰的戰神），原始無名。frame schema 目前沒有描述或別名欄，不同勢力的叫法暫不入資料。」
- 不做：改任何既有檔（含 `registries/`、`pack.json`、既有內容檔）；建立 contract §0 的禁區檔名；`src/`、`schemas/`、`test/`、`package.json`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；安裝任何套件；數值平衡。schema 擋住契約要的欄位 → 不改 schema，該欄改用 schema 允許的最小形狀，REPORT 列 `SPEC-GAP`。
- 件數 gate：新檔超過 5 個（不含 REPORT）就停下回報；容量 gate：新檔合計超過 200 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一類跑一次（專案根）；開工時應已零錯誤；寫完必須仍零錯誤 |
| `python3 wf/tools/tabledb.py` | 查 `wf/workflows/planning/specs/world/monsters.json`、`wf/workflows/planning/specs/core/glossary.json`，不整份讀 |
| `wf/tools/inbox_poll.sh` | 每寫完一類跑一次 `wf/tools/inbox_poll.sh cx-content-scenarios --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 5 個檔與你的 REPORT；可跑 `npm run check`、`node`。**不要 commit**：驗收與 commit 由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-content-scenarios-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：node 跑不了、沙箱拒寫 → 發 `BLOCKED`；自己的 JSON 不過 schema／參照 → 自己修。

## 工作

1. 依契約寫兩張地圖、兩個情境、README，每類寫完跑 `npm run check` 並 `inbox_poll --once`。
2. 全部寫完，確認 `npm run check` 輸出只剩上面允許的那種錯誤（或零錯誤）。
3. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-scenarios/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` 下範圍列的 4 個 JSON 與 `/home/lorkhan/repo/game_dev/mecha-srpg/content/README.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-scenarios/REPORT.md` |

REPORT 四段（做了什麼／產出（5 個檔的清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」（沒有寫「無」），末尾附最後一次 `npm run check` 的輸出。

## 驗收（固定 3 條，一條不多，做完就停）

1. 範圍列的 5 個檔都存在、檔名與 id 和契約一致，沒有其他新檔。
2. 最後一次 `npm run check` 零錯誤且件數行含 `map: 2`、`scenario: 2`（由領導重跑）。
3. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附 `npm run check` 輸出。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-content-scenarios`。本線團隊：`teams/contentbase`。上線先發 `wf/tools/inbox_mail.sh cx-content-scenarios --up PROGRESS 'cx-content-scenarios 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-content-scenarios --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-scenarios/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

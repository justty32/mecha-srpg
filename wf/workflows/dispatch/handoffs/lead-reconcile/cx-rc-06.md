# 任務：在隔離 worktree 依待和解裁示改寫 17 個既有內容檔的文字欄（batch rc-06）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`（相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同）。**最重要的是 `wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`**：它把使用者的裁示翻成逐主題的改寫規則。

## 背景與唯一目標

使用者 2026-10-24 對世界觀待和解表說「都按照建議」，並作廢「潮差＝威脅」這個概念（原話：「潮汐只是有關聯而已。」）。本批唯一目標：「背面」改名月之暗面（一）——把下列檔案文字欄裡與裁示衝突、或裁示要求補上的說法照 guide.md 改好，讓句子讀起來仍是自然的中文。

## 範圍（排除法寫死）

- 只改這 17 個檔（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rc/wt-rc-06/`），括號裡是該檔命中的主題代碼，對應 guide.md 的同名小節；命中只是候選，讀過後判斷不必改就寫「無需改」：
  - `content/base/world/backgrounds/farside-hull-welder.json`（主題：dark）
  - `content/base/world/backgrounds/farside-navigator.json`（主題：dark）
  - `content/base/world/dialogues/yusuf-demir-exit-map.json`（主題：dark）
  - `content/base/world/events/port-farside-sealed-crate.json`（主題：dark）
  - `content/base/world/events/port-raft-lantern.json`（主題：dark）
  - `content/base/world/events/ship-locker-debt.json`（主題：dark）
  - `content/base/world/lineages/jinghai-stolen.json`（主題：dark）
  - `content/base/world/lineages/universal-longspear.json`（主題：dark）
  - `content/lore/characters/eugenia-ferrero.json`（主題：dark）
  - `content/lore/characters/han-seorin.json`（主題：dark）
  - `content/lore/characters/jonas-halvorsen.json`（主題：dark）
  - `content/lore/characters/lu-zhaoyin.json`（主題：dark）
  - `content/lore/characters/m3.json`（主題：dark）
  - `content/lore/characters/mina-darzi.json`（主題：dark）
  - `content/lore/characters/neris-venn.json`（主題：dark）
  - `content/lore/characters/old-ben.json`（主題：dark）
  - `content/lore/characters/old-pigeon.json`（主題：dark）
- 只改文字欄：`name`、`title`、`summary`、`body`、`desc`、`description`、`text`、`label`、`brief`、`lines`、`phrase`、`phrases`、`badge`、`note`、`aka`、`epithet`、`flavor`；lore 檔另可改敘述欄：`consequences`、`role`、`scale`、`doctrine`、`ideology`、`silhouette`、`status2108`、`region`、`hq`、`mechSeries`、`relation`、`tags`（`tags` 只改中文標籤）。id、檔名、數字、引用（`kind/name` 形式）、鍵、陣列長度一律不動——閘門逐節點比對，動了就退件。
- 不做：上列以外的任何檔（含 `style.md`、`content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；不新增、不刪除檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-rc-06/`）。
- 件數 gate：改動檔超過 17 個就停下回報；容量 gate：任何單檔改後比原檔長 30% 以上就停下回報（本批沒有例外檔）。任一觸發都停。命中主題的句子之外不要動。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/world/history-reconcile.json grep '歸還黨|迦梨|九闕'（關鍵詞換成你要查的）`（tabledb 實際路徑 `wf/tools/tabledb.py`，在 worktree 根跑） | 查某條裁示的原文與建議；不要整份 cat |
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rc/wt-rc-06 grep -nE '潮差|背面|複本|迦梨|歸還黨|九闕|聖保羅|浦那' -- content` | 改完逐檔確認殘留，每處都要能對到 guide.md 的規則 |
| `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯）；改到 `content/base/world/` 另跑 `node src/ops/content/check.ts content/base` | 改完跑；**不用跑 `npm test`**（領導驗收會跑；沙箱裡 `src/mcp` 有兩個測試失敗是已知現象，不算阻塞） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-rc-06 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-reconcile/rc-06/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **報告目錄只放 REPORT.md**：不要在報告目錄寫全文傾印（整檔內容、整份 diff、整份 grep 輸出）；逐檔對照只取含改動的半句。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部，guide.md 逐節讀。
2. 逐檔改：先找該檔命中主題的句子，依規則判斷，改文字欄。
3. 全部改完 grep 殘留、跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-reconcile/rc-06/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rc/wt-rc-06/content/…`（上列路徑） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-reconcile/rc-06/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列親自讀過的路徑）；「做了什麼」；「逐檔對照」（每檔一小節，列每處「舊片段 → 新片段」，片段取半句即可；沒改的檔寫「無需改」與理由）；「殘留」（每處殘留的命中詞＋理由）；「沒做到或證據不足的」；「需要決定的事」（與別檔事實衝突、要改數值或結構的地方）；「子代理」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動只落在上列檔案（`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rc/wt-rc-06 status --short` 除 `node_modules` 外只見這些）。
2. `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯）全過。
3. 上列檔案裡沒有「潮差」；勢力義的「背面」已改成月之暗面／暗面，留下的「背面」每處在 REPORT「殘留」段有理由（地理義或本義）。
4. REPORT 有逐檔對照。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rc-06`。本線團隊：`teams/rc`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rc-06 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rc-06 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-reconcile/rc-06/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「依 guide.md 把衝突說法改掉」；任何需要改其他檔或改結構的需求一律寫進 REPORT，不動手。

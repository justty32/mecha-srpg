# 任務：在隔離 worktree 把 56 個 lore 檔的敘述欄改掉翻譯腔，並對齊 2026-10-25 裁示（batch dl-04，只改文字欄）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/mechs/bonds.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/dispatch/handoffs/done/2026-10-25/lead-decide-land/b5/guide.md`（相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同）。

## 背景與唯一目標

使用者 2026-10-25 裁示全庫 lore 敘述欄做一輪翻譯腔重審，第一輪三批（dl-01～03）已合入，本批是第二輪的 dl-04（事件 56）。唯一目標：把下列檔案敘述欄裡讀起來像英文換漢字的句子改成自然的中文，並在命中時照 `wf/workflows/dispatch/handoffs/done/2026-10-25/lead-decide-land/b5/guide.md`「裁示對齊」表改寫。**原意不變**：事件走向、數字、日期、專名照舊，不新增具名人物與事件。

## 範圍（排除法寫死）

只改這 56 個檔（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/codex-pilot/wt-dl-04`）。讀過判斷不必改的檔在 REPORT 寫「無需改」：

- `content/lore/events/equator-ports-accord.json`
- `content/lore/events/first-hunting-bands.json`
- `content/lore/events/first-return-offensive.json`
- `content/lore/events/first-tide.json`
- `content/lore/events/forerunners-seal.json`
- `content/lore/events/golmud-split.json`
- `content/lore/events/green-line-purge.json`
- `content/lore/events/gui-funeral.json`
- `content/lore/events/gull-anvil-truce.json`
- `content/lore/events/gyeongju-contest.json`
- `content/lore/events/hekate-secret.json`
- `content/lore/events/hidden-lantern-pact.json`
- `content/lore/events/hundred-lanterns.json`
- `content/lore/events/hunter-license-act.json`
- `content/lore/events/iron-wings-month.json`
- `content/lore/events/ironsword-open-pattern.json`
- `content/lore/events/kali-found.json`
- `content/lore/events/kuafu-awakens.json`
- `content/lore/events/kuafu-mountain-vigil.json`
- `content/lore/events/lagos-night.json`
- `content/lore/events/lance-v4.json`
- `content/lore/events/league-founded.json`
- `content/lore/events/lunar-blockade.json`
- `content/lore/events/lunar-tide-and-shell.json`
- `content/lore/events/migrant-split.json`
- `content/lore/events/mimic-one.json`
- `content/lore/events/mirror-vigil.json`
- `content/lore/events/moon-drowned.json`
- `content/lore/events/moonbow-first-shot.json`
- `content/lore/events/moonless-evacuation.json`
- `content/lore/events/nairobi-port-incident.json`
- `content/lore/events/nameless-founded.json`
- `content/lore/events/nine-gates.json`
- `content/lore/events/old-array-dig.json`
- `content/lore/events/one-banner-compact.json`
- `content/lore/events/post-neutrality.json`
- `content/lore/events/pune-falls.json`
- `content/lore/events/quito-shipyard-sale.json`
- `content/lore/events/rift-valley-dig.json`
- `content/lore/events/ring-road-escort.json`
- `content/lore/events/ring-road-lanterns.json`
- `content/lore/events/rust-banner.json`
- `content/lore/events/shell-signal.json`
- `content/lore/events/shell-society-founded.json`
- `content/lore/events/shield-open-carving.json`
- `content/lore/events/singapore-conference.json`
- `content/lore/events/singapore-gate-oath.json`
- `content/lore/events/skagerrak-incident.json`
- `content/lore/events/skagerrak-shell-found.json`
- `content/lore/events/southern-sky-vigil.json`
- `content/lore/events/ten-rides.json`
- `content/lore/events/tenth-law.json`
- `content/lore/events/titicaca-dig.json`
- `content/lore/events/tranquility-founded.json`
- `content/lore/events/uluru-standoff.json`
- `content/lore/events/wreck-crown.json`

- 只改文字欄 `summary`、`body`、`note`，與敘述欄 `consequences`、`role`、`scale`、`doctrine`、`ideology`、`mechSeries`、`status2108`。`name`、`aka`、`title`、`tags`、`region`、`hq`、id、檔名、日期、數字、引用（`kind/name` 形式）、鍵、陣列長度一律不動——閘門逐節點比對，動了就退件。
- 不做：上列以外的任何檔（含 `style.md`、`glossary.json`、`content/base/`、`content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；不新增、不刪除檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-dl-04/`）。
- 不寫：塞勒涅三層知情（2086／2095／2097）、拿其他作品類比任何事件。**SS／SSS 不新增任何設定**：那是背景版、很後期才有，目前展現過最強的都是 S；既有提到 SS 的句子照原意保留，不加強、不展開。
- 件數 gate：改動檔超過 56 個就停下回報；容量 gate：任何單檔改後比原檔長 15% 以上就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/codex-pilot/wt-dl-04 grep -nE '精粹核|獨駕|座艙裡一定|無人|鐵偶' -- content/lore` | 改前找對齊點、改後核殘留（本批多半不命中；不命中就不改） |
| `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯） | 改完跑；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-dl-04 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-decide-land/b5/dl-04/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **報告目錄只放 REPORT.md**：不寫全文傾印；逐檔對照只取含改動的半句。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. 逐檔讀敘述欄，改翻譯腔；命中 guide 對齊表的點照表改。
3. 全部改完 grep 殘留、跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-decide-land/b5/dl-04/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/codex-pilot/wt-dl-04/content/lore/…`（上列路徑） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-decide-land/b5/dl-04/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列親自讀過的路徑）；「做了什麼」；「逐檔對照」（每檔一小節，列每處「舊片段 → 新片段」，片段取半句；沒改的檔寫「無需改」）；「裁示對齊」（guide 表每列落在哪檔、怎麼改，或為何不改）；「殘留」（grep 命中仍留的每處＋理由）；「需要決定的事」；「子代理」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動只落在上列檔案（`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/codex-pilot/wt-dl-04 status --short` 除 `node_modules` 外只見這些）。
2. `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯）全過。
3. guide 對齊表中落在本批的每列都已落地，或 REPORT 寫明不改的理由；`精粹核` 殘留只剩原料義、每處有理由。
4. REPORT 有逐檔對照。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-dl-04`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-dl-04 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-dl-04 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-25/lead-decide-land/b5/dl-04/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格由開跑的領導代登記。

> 背景與工作一致性：唯一目標是「改掉翻譯腔＋對齊 2026-10-25 裁示」；任何需要改其他檔或改結構的需求一律寫進 REPORT，不動手。

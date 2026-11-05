# 任務：寫戰鬥情境與戰場地圖大填充計畫——盤點現有、找缺口、設計 40–60 個新情境（含必要新地圖／地形）、分批並起草產出交接書（只寫計畫，不寫 content 檔）

先讀（親自讀，計畫開頭列「已讀清單」）：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/dispatch/handoffs/lead-fill-scen/fs-common.md`、`wf/workflows/content/README.md`、`batch.md`、`battle-field.md`、`playtest.md`、`polish.md`、`content/lore/README.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md` 與 `plan/`、`.../lead-kaiju2/report.md` 與 `kj2-plan/`（24 台新機：新骨架、移動類別；24 種新獸：生態位、巢母鏈）、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/cx-kj2-01.md`（產出交接書範本）、`content/lore/` places／factions／events 分片（用 `python3 wf/tools/tabledb.py` 與 `content/index/` 查，不整讀）、`wf/workflows/planning/specs/core/` 的 scenario／map／terrain／目標 kind 段、`wf/workflows/common/code-map.md`（找 sim／probe 入口，只讀）。路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與目標

使用者要更多填充。現有 base：情境約 40、地圖 21、地形 23。上一輪新增 24 台機與 24 種獸、許多地點，卻只有 kj2-01..06 六個展示情境。目標：讓新機、新獸、各區地點在**可玩戰鬥情境**出場——港口、河口、淺灘、高地墟、空城、黑幫城市巷戰、閘城、酸沼；展示飛行／履帶／潮行／掘進的移動差異；巢母鏈、群體獸；各勢力代表戰。每個情境掛到 lore 事件或地點（`?scenario=「情境id」` 可直接玩）。本線是計畫段。

## 計畫必含（照順序）

1. 已讀清單。
2. 引擎事實：scenario／map／terrain 欄位、目標 kind 全集與 params、移動類別 cost 表現（flight／track／hover／leg／burrow 與 tide 類）、能否做 deployZones／exits／globals；哪些寫法做不到（列 engine-backlog 候選：項目、影響、建議）。情境檔新增是否影響黃金（`test/golden/`、campaign 黃金、grid-health）——查清楚：被遭遇池／契約引用的才會改。
3. 盤點：現有情境／地圖／地形清單（id、地形、尺寸、類型配方、出場機與獸）；新 24 機與 24 獸、現有主要機型與獸、各區（東亞、南亞、歐洲／內海、非洲／西亞、美洲、海上／殘聯、月面）地點的**出場覆蓋表**，找出零出場者。寫 `coverage.json`（wf-table/1，columns `["實體","類型","區","出場情境數","建議"]`）。
4. 設計理念：五到八句，情境如何展示移動差異、獸的生態位、機的骨架角色，而不是換皮清單。
5. 新地形清單（若現有 23 種不夠：如閘門、浮橋、堤岸、巷口、街壘等）——每種：id、五鍵 moveCost、cover、height、glyph（小寫）、用在哪；寧缺勿濫（0–8 種）。
6. 新地圖清單（10–20 張）：id、尺寸、地形組成、地勢一句、部署、掛到的地點。
7. 新情境表（40–60 個）：id（前綴 `fs-`）、中文名、brief 一句、地圖、玩家／敵／盟軍 slot 與機／獸、目標、輪數、seed、類型配方、展示的移動差異或生態位、掛到（lore id）、是否被遭遇池／契約引用（原則：不引用，只 `?scenario=` 可玩，避免動黃金）。每種新機與新獸至少出場 2 次；24 台新機＋24 種獸全覆蓋。
8. 分批：5–8 批（`fs-01`…），每批 ≤ 12 情境＋其專用地圖／地形；每批獨立可驗。
9. 產出交接書稿：每批 `cx-fs-NN.md`，照範本骨架與 `fs-common.md`；worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-NN/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-NN/`；逐檔規格寫到工人不必再設計（路徑、名、掛到、地圖、單位、目標），不替它寫全文；驗收含 npm run check 0 errors、typecheck 0、每情境 AI 對 AI 探針（命令寫死並先自己試過一次確認可用）、review.json。子代理上限 1。每份跑 `python3 wf/tools/brief_lint.py 「檔」 --strict` 到 0。
10. manifest 稿：每批 `fs-NN.manifest.json`，格式照 `content/batches/2026-10/kaiju2-01.json`（`mode: add`、`status: draft`、`allow.kinds` 列 `base/scenarios`／`base/maps`／`base/terrains`、`base: "TBD"`）。
11. 需求與待決（含需要 lore 補的地點、引擎候選）。

## 產出

全寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/`：`plan.md`（≤ 50 KB）、`coverage.json`、`review-draft.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，每件新情境／地圖／地形一列，白話 ≤ 60 字）、`cx-fs-NN.md`、`fs-NN.manifest.json`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 「資料檔」 grep 「詞」` | 查 lore／index 分片，不整讀 |
| `npm run sim`／`npm run content:probe` | 唯讀探針，先試一次確認指令可用 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py 「稿」 --strict` | 每份交接書稿 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fs-plan --once` | 每完成一步讀 orders |

## 範圍

只寫 `plan/` 產出目錄與 `/tmp/cx-fs-plan/`，其餘唯讀。

## 資源與禁區

件數 gate：新情境超過 60 刪到 60、少於 40 補到 40；容量 gate：plan.md 超過 50 KB 精簡、超過 70 KB 停下回報。不做：萬潮葬王相關、AI 檔、數值平衡、改任何既有 content。

唯讀調查線：只寫產出目錄與 `/tmp/cx-fs-plan/`；不寫 content／src／test／specs／wf 其他檔；不 commit。可跑唯讀 node 指令（探針）。共通禁區：不碰鍵鼠螢幕、不開 GUI、不 push／建分支／rebase／reset、不 `rm -rf`、不改 `~/.codex/config.toml`、不裝依賴、不上網。子代理上限 2。工具壞掉、沙箱拒寫 → `BLOCKED`；自己打錯自己修。

## 驗收（固定 4 條）

1. plan.md 含 1–11 段。
2. coverage.json、review-draft.json 合法，review-draft 50–80 列（情境 40–60＋地圖／地形）、白話 ≤ 60 字、路徑不撞既有檔、不重複。
3. 每批一份交接書稿（brief_lint 0）與 manifest 稿；24 機＋24 獸皆出場 ≥2 次。
4. 0 個萬潮葬王相關件。

## 交付

計畫與全部產物的絕對路徑目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/`（plan.md 為交付物，直接寫檔）。

## 回報

我是 `cx-fs-plan`，團隊 `teams/fillscen`。上線 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fs-plan --up PROGRESS '已讀完，開始盤點' < /dev/null`）；終局 `inbox_mail.sh cx-fs-plan --up DONE '情境計畫完成：N 件、M 批' 計畫路徑`。回覆只要 5 行摘要＋計畫路徑。ROSTER 由領導代登記。

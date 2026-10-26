# 任務：照已審計畫新增 3 件蝕域群像事件，並在 rift-beasts 本文追加三節（batch kj-03＋kj-04）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03-plan/plan.md`（**已由領導審過的計畫，本批的設計依據**）、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/cx-kj-03.md`（本檔）。相對路徑都相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`；兩個 worktree 內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過，計畫「先讀」列的設定檔依需要查。

## 背景與唯一目標

計畫（gpt-6-astra 寫、領導審過）定了怪獸側二十年「群像＋升級」的 3 件事件與 rift-beasts 的 3 個追加小節。你負責**實際產出與文筆**：照計畫第 5、6 段寫，口吻照 style.md 與既有二名之夜事件（`events/{moon-drowned,mirror-vigil,red-eye-first-seen,star-grave-named}.json`）。計畫與本交接書衝突時以本交接書為準。

## 方法（必守，與計畫第 2 段「方法與禁忌」同）

- 節點優先、不暴力產 lore；孤兒留填充層，**不新增對 N01–N10 的因果**；每件寫明掛點、前因、後果。
- **對面無臉**：怪獸側沒有指揮者、意志、心思、對白；「升級」只寫人看見的變化。S 領主（孟買的那隻、萬潮葬王）不出場、不描寫；蝕壓源頭、SS／SSS 不寫；**桑托斯灣區核心不定論**（只寫外界看不到、說不出）。
- 怪獸多從海洋來、環太平洋為主、內陸少；**不用潮差、潮高推凶度**；等級不是成長階段，蛻皮只是掘犬→盾甲的例外。
- 不拿其他作品類比；中文命名避免直譯（兩步命名）；古代機本體叫古代機、外層叫裝甲；潮→蝕。新名詞標提案，列 `naming.json`。已裁示不推翻；真相用可見度欄。不新增具名人物檔。

## 範圍（排除法寫死）

只做下面兩件；**沒列的一律不做**，「順手也該改」的寫進 REPORT「需要決定的事」。

- 只做：
  1. 在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-03/` 新增 `content/lore/events/` 下**恰好 3 件**：`broken-yoke-molt.json`（斷軛留蛻，2099-02）、`street-beneath-the-nest.json`（橋下舊街，2102-06）、`epithet-register.json`（眾名成冊，2107-12），欄位、日期、地點、factions、secrets 照計畫第 5 段；body 300–1500 字、`## ` 小標 3–5 個、`consequences` 一句一條；`kind` 照計畫；`tags` 含 `tide`；不加 `gameRefs`。
  2. 在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-04/` 修改 `content/lore/factions/rift-beasts.json` 的 **`body` 欄**：在既有 `## 蝕壓` 小節之後追加計畫第 6 段的三個小節（每節 150–400 字）。**既有 body 的每個字元原樣保留**（新文字只接在字串尾端）；其他欄位一律不動（閘門是潤飾模式：增刪鍵、改非 body 欄都會被拒）。
- 年表**不由你改**：在報告目錄寫 `timeline-entries.json`（`{"entries":[…]}`，3 條，格式照 `content/lore/timeline.json`，照計畫第 7 段）。
- 不做：其餘任何既有檔的修改或刪除（計畫第 8 段「建議插入」一律不做）；`characters/`、`places/`、`timeline.json` 不動；`src/`、`schemas/`、`test/`、`wf/`（除報告目錄）、`content/index/`、`content/batches/`、`content/base/` 不碰；不 commit。
- 兩個 worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-kj-03/`）。
- 件數 gate：wt-kj-03 新增超過 3 件、或 wt-kj-04 改動超過 1 檔，就停下回報；容量 gate：單檔超過 16 KB、或 rift-beasts body 追加超過 2,000 字，就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 在各 worktree 每改完一檔跑，0 錯（新事件「未出現在 timeline」警告是預期） |
| `npm run check` | 收尾在兩個 worktree 各跑一次，末行 `OK 0 errors` |
| `npm test` | 收尾只在 wt-kj-03 跑一次；沙箱內 mcp、worldgen、content/index 三類檔級失敗是已知環境現象（上批實證），照實記錄，其他失敗才算問題 |
| `python3 wf/tools/tabledb.py {檔.json} grep RE` | 讀 wf-table/1 資料檔（實際路徑 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj-03 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的兩個 worktree 路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。

## 工作

1. 讀「先讀」全部與計畫；讀計畫第 3、5 段點名的既有 lore 檔（`places/{nairobi,lagos-blight,mumbai-blight,mumbai-gate,sao-paulo-blight,ring-road}.json`、`factions/{rift-beasts,nairobi,league,green-line}.json`、kj-01 六件事件）。
2. 寫 3 件事件；每檔後 lore check。
3. 改 rift-beasts body；lore check。
4. 收尾檢查；寫 `timeline-entries.json`、`naming.json`、`review.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新事件檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-03/content/lore/events/` |
| rift-beasts | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-04/content/lore/factions/rift-beasts.json` |
| 年表條目 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03/timeline-entries.json` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03/review.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03/REPORT.md` |

`naming.json` 用 wf-table/1：columns `["id","nameEn","meaning","nameZh","method","status"]`。`review.json` 用 wf-table/1：columns `["檔","類別","名稱","白話","掛到"]`，3 件事件各一列＋rift-beasts 追加一列；從計畫的 `review-draft.json` 出發，照最終文字修；`白話` 一到兩句、**不超過 60 字**。

REPORT 結構：**第一段「已讀清單」**；接著四段（做了什麼；產出——每件一行：id、date、掛到哪、前因→後果一句，rift-beasts 三節各一行；沒做到或證據不足的；需要決定的事）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. wt-kj-03 改動只有 3 個新事件檔；wt-kj-04 改動只有 rift-beasts.json，且新 body 以舊 body 原字串開頭、其他欄位不變。
2. 兩個 worktree `node content/lore/check.ts` 0 錯、`npm run check` 末行 `OK 0 errors`；wt-kj-03 `npm test` 結果照實記錄。
3. 3 件事件的檔名、日期、地點與計畫第 5 段一致；三節小標與計畫第 6 段一致。
4. 新文字 0 句怪獸心思／動機／對白、0 處 S 領主描寫、0 處桑托斯灣區核心定論。
5. `naming.json`、`review.json`（4 列、白話 ≤ 60 字）、`timeline-entries.json`（3 條）齊；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞）、0 個 style.md 禁用詞。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj-03`。本線團隊：`teams/kaiju`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj-03 --up DONE '一句自足結論' /tmp/cx-kj-03/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-kj-03 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「3 個新事件檔＋rift-beasts body 尾端追加＋報告目錄的交付檔＋自測」；計畫裡任何「建議插入既有檔」一律不做——此條優先於工作步驟中任何看似需要改檔的情況。

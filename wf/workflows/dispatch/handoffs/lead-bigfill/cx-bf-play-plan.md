# 任務：寫可玩內容大填充計畫——盤點 lore 在營運裡被遇到的缺口、設計 80–120 個 base 營運檔、分批並起草產出交接書（只寫計畫，不寫 content 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ops-content.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（節點與「崩年的底色」）、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/dispatch/handoffs/engine-backlog.md`、`wf/workflows/dispatch/handoffs/lead-rep/REPORT.md`（勢力營運資料與黃金重錄教訓）、`wf/workflows/dispatch/handoffs/lead-rep/cx-rep-01.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/cx-kj2-01.md`（base 產出交接書範本）、`content/batches/2026-10/kaiju2-01.json`（base manifest 範本）、`wf/workflows/planning/specs/core/README.md`（找營運相關 spec：契約、事件、對話、遭遇、新聞的欄位與觸發，**讀 spec 的相關段，不整套讀**）、`wf/workflows/common/code-map.md`（找營運載入器與抽選程式在哪，**只讀不改**）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。`wf/workflows/content/` 的 `templates.json`、`engine-facts.json` 用 tabledb 查。

## 背景與唯一目標

上一輪寫了大量 lore（`content/lore/` 地點 95、勢力 48、人物 89、事件 140），但營運裡（`content/base/world/`：契約 17、事件 56、對話 19、遭遇 17、地點 10、勢力營運 17…）玩家遇得到的很少。本線目標：**讓 lore 的地方、勢力、人物在營運裡被遇到**——契約、營運事件、對話、遭遇、新聞（找出新聞在引擎裡是哪種檔）、地點、市場／服務等。本線是計畫段：**盤點、找缺口、設計、分批、起草產出交接書與 manifest**。

## 計畫必含（照順序）

1. **已讀清單**。
2. **引擎事實**：每種營運檔（contracts、events、dialogues、encounters、places、factions-ops、markets、services、jobs、operations、omens、news 或同等物…）一段：欄位、必填、怎麼被抽到／觸發（條件鍵：地點、勢力、聲望、日期、旗標…）、引用規則、有沒有範例檔；**哪些新增會改變亂數軌跡而動到黃金**（`test/golden/`、`test/campaigns/`、`src/ops/sim/fixtures/`、寫死軌跡的單元測試），哪些不會（例：只被特定旗標觸發的檔）。引擎做不到的寫法列 engine-backlog 候選（項目、影響、建議做法、規模）。**不改程式。**
3. **盤點**：lore 實體 × 營運出現次數的缺口表——各勢力（48）、主要地點（依區）、具名人物（只列有營運潛力的）在 base 被引用幾次；列出「零出現」的重點清單，按區（東亞、南亞、歐洲／內海、非洲／西亞、美洲、海上／殘聯）分組。
4. **設計理念**：五到八句——營運內容怎麼帶出「人、畫面、獸、光」，而不是帳單與條約。
5. **新件表**：80–120 個 base 檔，每件：路徑（`content/base/world/「類別」/「名」.json`，先 `ls` 確認不撞；檔名前綴照該目錄慣例，若需要新前綴就用 `bf-`）、類別、中文名、一句定位（玩家在營運裡遇到什麼）、掛到哪個 lore 實體（id）與節點／底色、觸發或抽取條件、是否改黃金、範本檔（同目錄既有檔）。**不做**：萬潮葬王相關（`tidespine`、`wc` 系列、王跡、北行）、AI 檔、數值平衡（獎勵、難度照同級暫填）、月面營運（月面計畫線另做；你只在第 7 段列可留給月面的空位）。
6. **分批**：切 5–7 批（`bf-play-01`…），每批 ≤ 20 檔、一批盡量一個類別或一個區；每批列完整檔案清單，並標該批是否會改黃金。會改黃金的批次**產出工人不重錄**（領導最後整批重錄一次），交接書寫明「黃金紅時列檔名，不改期望、不跑 GOLDEN_UPDATE／rerecord」。
7. **月面空位**：月面 lore 若要在地球營運出現（渡月港契約、暗面走私、白手套催收、罷工新聞），列出接口與建議類別（不設計內容）。
8. **產出交接書稿**：每批一份 `cx-bf-play-NN.md`，**照範本 `lead-kaiju2/cx-kj2-01.md` 的骨架與段落**，差異：① worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-NN/`；② 報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-NN/`；③ **只新增、不改既有檔**——若新檔必須登記進既有檔（池清單、勢力營運的列表）才會被抽到，寫進 `inserts.json`（格式照 bf-common.md），由合併線套；④ 驗收含 worktree 內 `npm run check` 0 errors、`npm run typecheck` 0、`npm test`（黃金紅可豁免但列檔名）；⑤ 我是誰 `cx-bf-play-NN`、團隊 `teams/bigfill`；⑥ 子代理上限 1。逐檔規格寫到產出工人不必再設計（路徑、類別、名、掛到、觸發條件、文字要點），不替它寫全文。每份跑 `python3 wf/tools/brief_lint.py 「檔」 --strict` 到 0。
9. **manifest 稿**：每批一份 `bf-play-NN.manifest.json`，照 `content/batches/2026-10/kaiju2-01.json` 格式，`mode: add`、`status: draft`、`allow.kinds` 只列該批目錄（如 `base/world/contracts`）、`allow.modify` 空、`base` 寫 `"TBD"`、`reportDir` 指報告目錄、`checks` 照範本（黃金不變那步若該批會改黃金就註明豁免理由）。
10. **需求與待決**：需要領導或使用者決定的事。

## 產出

全部寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/`：`plan.md`（≤ 50 KB）、`gaps.json`（wf-table/1，第 3 段缺口表：columns `["實體","類型","區","base 引用數","建議"]`）、`review-draft.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，每件一列，白話 ≤ 60 字）、`cx-bf-play-NN.md`、`bf-play-NN.manifest.json`。

## 範圍（排除法寫死）

- 只寫上列目錄內的檔。
- 不做：不寫任何 `content/` 檔、`src/`、`test/`、`specs/`、`wf/` 其他檔；不 commit。
- 件數 gate：新件超過 120 刪到 120、少於 80 補到 80。容量 gate：plan.md 超過 50 KB 精簡；超過 70 KB 停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 「資料檔」 grep 「詞」`／`find k=v` | 查 templates.json、engine-facts.json、`content/index/` 分片、history-timeline.json，不整份讀 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_index.py refs 「æ id」` | 某 lore／base id 被誰引用 |
| `grep -rn 「詞」 /home/lorkhan/repo/game_dev/mecha-srpg/content /home/lorkhan/repo/game_dev/mecha-srpg/src` | 欄位怎麼被讀、名字撞不撞 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py 「交接書稿」 --strict` | 每份產出交接書稿 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-play-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫產出目錄；其餘唯讀。草稿與量測腳本放 `/tmp/cx-bf-play-plan/`（可在那裡跑唯讀的 node 腳本量測抽選，但不改 repo）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意（盤點可交一個）；它也要親讀 AGENTS.md 與 bf-common.md；只准寫 `/tmp/cx-bf-play-plan/`。
- **分清錯誤來源**：點名工具壞掉、沙箱拒寫 → `BLOCKED`；自己打錯 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-plan --up PROGRESS '已讀完先讀清單，開始盤點營運' < /dev/null`）。
2. 引擎事實與盤點（第 2–3 段）、寫 gaps.json。
3. 設計、分批（第 4–7、10 段）、寫 review-draft.json。
4. 起草產出交接書與 manifest（第 8–9 段），brief_lint 0。
5. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md` |
| 缺口表、review 草稿 | 同目錄 `gaps.json`、`review-draft.json` |
| 交接書稿與 manifest 稿 | 同目錄 `cx-bf-play-NN.md`、`bf-play-NN.manifest.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 4 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–10 段。
2. gaps.json、review-draft.json 合法；review-draft 80–120 列、每列白話 ≤ 60 字；新路徑全計畫內不重複、不撞既有檔。
3. 每批一份交接書稿（brief_lint --strict 0）與 manifest 稿（合法 JSON），且每批標了是否改黃金。
4. 新件表 0 個萬潮葬王／AI／月面營運件。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-play-plan`。本線團隊：`teams/bigfill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-plan --up DONE '可玩內容計畫完成：N 件、M 批' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-bf-*` 屬 `teams/bigfill`）。

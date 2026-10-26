# lead-fill-gear 共通規矩（四條計畫線與其後的產出線都適用）

領導 lead-fill-gear；使用者要「更多的填充」：機甲部件、武器、戰利品、市場商品要明顯變多，各廠商有個性。數值照同級暫填（後期統一調）。

## 禁忌（必守）

- 每件要有掛點：廠商（舊廠諸家、獵團、公司、教團…）、勢力、年表節點、或崩年（2090s）的底色句。沒掛點的不產。
- 不暴力產：每件要有「不同的用法或不同的味道」，同質換皮刪掉。
- 不拿其他作品類比（遊戲、小說、動畫、電影一律不提）；量級用世界內的詞。
- 命名不直譯：中文名自然、像這個世界的人叫的；英文放 `nameEn`／etymology。新名詞標「提案」。
- 國家、塞勒涅、巨頭不萬能：他們的件有代價或門檻。
- 勢力招牌件照聲望門檻規則（`content/base/world/actions/ops-world.json` 的 `rules.repGate`；D10／C20／B35／A55／S80）；通用三系（堅盾、長槍、鐵劍）公開。
- 古代機本體不可交易；機魂個性限 S；怪獸不是畜牲（掉落是「拆下的東西」、活捕是「拘束的材料」，不寫成養殖）。
- 抵抗性：凡鐵武器打獸依機體等級差減半、對內層與核為 0；精粹武器等級由能力標；寫武器時要讓「凡鐵、各級精粹」有清楚分工（讀 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md`）。
- 不改既有 id 檔的結構與數值；只新增。不改 `src/`、`specs/`、`design-notes/`、`content/lore/`。需要引擎支援或 lore 的，列進計畫「需求」。
- 新增 registries 值（layer-types／damage-types／part-functions／slot-types…）不行；用現有的。先查 `wf/workflows/content/engine-facts.json` 哪些欄位是死資料，只寫會生效的欄位。

## 軌道與檔名前綴（避免互撞）

| 軌 | 內容 | 前綴 |
|----|------|------|
| gw | 武器：近戰、射擊、拘束、範圍、凡鐵與各精粹等級；附帶的 abilities／effects | `fw-` |
| ga | 裝甲、系統件、感測、背掛、動力／機動件；附帶的 abilities／effects | `fa-` |
| gm | 廠商與勢力特色件（舊廠諸家、獵團、公司、教團、各傘）＋市場上架＋服務 | `fm-`（件）；市場沿用地點 id |
| gl | 戰利品：怪獸掉落、活捕材料、屍體拆解、遺跡遺物、材料／素材；掉落表 | `fl-` |

ability／effect 檔名同軌前綴（例 `fw-ability-…` 不要，直接 `fw-xxx`），id 先 `ls`／`grep` 確認不撞。

## 計畫段產出（codex gpt-6-astra，唯讀調查線，只寫自己的 plan 目錄）

寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-<軌>/`：

1. `plan.md`（≤ 40 KB）：① 已讀清單；② 盤點（現有件按類別／廠商／等級／定位列數量與缺口，用 `content/index/` 分片與 grep，不整份讀）；③ 設計理念五到八句；④ 新件表 40–60 件（一軌）：id、類型、中文名、`nameEn`、一句定位、掛點、等級、關鍵數值帶（照 `wf/workflows/content/numeric-bands.json` 同級）、AI 戰術鍵（若是能力）、聲望門檻（若勢力件）、新名詞（標提案）；⑤ 分批 3–4 批，每批 ≤ 15 檔；⑥ 市場／掉落／研發的掛接建議（哪個市場上架哪件、哪隻怪掉哪件）；⑦ 需求與待決（引擎、lore、使用者）。
2. `review-draft.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，每件一列，白話 ≤ 60 字）。
3. 每批一份產出交接書稿 `cx-fg-<軌>-NN.md`：照 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/cx-bf-deep-plan.md` 與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md` 的骨架（先讀、背景、逐檔規格寫到工人不必再設計、範圍用排除法、必用工具、資源與禁區、子代理上限 1、驗收固定幾條）；worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-<軌>-NN/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-<軌>-NN/`；只新增；`python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py 「檔」 --strict` 到 0。
4. 每批 manifest 稿 `fg-<軌>-NN.manifest.json`：照 `/home/lorkhan/repo/game_dev/mecha-srpg/content/batches/2026-10/` 內任一既有 manifest，`mode: add`、`status: draft`、`base: "TBD"`。

## 先讀（親自讀，計畫開頭列已讀清單）

`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`batch.md`、`mechs.md`、`abilities-effects.md`、`numeric-bands.md`、`engine-facts.json`、`world-pillars.md`、`polish.md`（首要標準：命名）、`content/lore/README.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`done/2026-10-26/{lead-mech2,lead-fill-mech,lead-rep,lead-resist,lead-kaiju2}/REPORT.md`（或 report.md）、`wf/workflows/planning/design-notes/world/magnates.md`；`wf/workflows/planning/specs/core/data-model-mech.md`、`data-model-abilities-effects.md`、ops 的 `data-model-economy-research.md`。既有內容用 `ls`、`grep`、`content/index/` 分片（`python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py`）盤點。

## 資源與禁區

唯讀調查線，只寫自己的 plan 目錄；草稿放 `/tmp/cx-fg-plan-<軌>/`。不 commit、不改 content、不碰鍵鼠螢幕、不開 GUI、不 push、不建分支、不 rm -rf、不改 ~/.codex/config.toml、不裝依賴、不上網、不用 MCP。子代理上限 2 個（模型隨意，同受規矩約束）。自己打錯自己修；工具壞掉才回 BLOCKED。回覆只要 5 行摘要＋計畫路徑。

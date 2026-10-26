# 任務：寫「south」區的駕駛員與船員填充計畫（只寫計畫與草稿，不寫 content 檔）

先讀（**親自讀，不靠本交接書摘要**；計畫開頭列「已讀清單」）：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`（**共同規格，必須照辦**）、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（崩年的底色 1.1／1.2）、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`（全部範本）。以上路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 範圍：南亞三角洲與印度西岸（孟加拉、達卡、吉大港、蘆葦沼、孟買、舊陣列、北方山脊、鹽原）

- 主題（出身）：南亞、東南亞：難民、船民、蘆葦沼獵手、拆船工、碼頭幫、獵團學徒、沐蝕外圍、孟買歸來者、織工會。
- 招募池掛載：dhaka、delta、chittagong、reed-marsh、mumbai、old-array、ridge、salt-flat（遊戲裡玩家最常停泊的地點，本區池要最厚：每個地點至少 1 個、重點地點 2–3 個不同主題的池，如難民營／碼頭／獵團酒吧／教團外圍）。
- 目標件數：24–30 個「背景＋person＋lore 人物」成套，另加新招募池若干（新檔）；總件數（三類檔合計）給出明確數字。

## 計畫必含（照順序）

1. 已讀清單。
2. **盤點**（本區）：現有 persons／backgrounds／recruit-pools 中屬本區的數量與缺口；現有 lore 人物（`content/lore/characters/` 89 個）中本區已有誰（避免重複、可掛連）；本區 lore 的地方（`content/lore/places/`）與勢力（`content/lore/factions/`）清單與每個目前有多少「可雇用的人」。用 `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py`、`grep` 查，不整份讀大檔。
3. **設計理念**：5–8 句，這區的人怎麼帶出「人、畫面、獸、光」，崩前／崩後與出生斷層怎麼體現。
4. **人物表**：每人一列——kebab 名（person 與 character 同名）、中文名、性別、`age`（2108）與 `born`、`activeYears`（老手才有）、出身（崩前做什麼／崩後做什麼，各一句）、性格一句、站起來的瞬間一句、招牌話一句、職能（駕駛／技師／醫護／導航…）與能力傾向（attrs 偏向、levelDice、trait 選哪個既有 effect、tags）、`culture`、背景 id 與背景中文名、`hireFee`／`wageMult`（同級暫填）、掛到（lore 地點 id、勢力 id、節點／主線／年表／底色）、所屬池。年齡分布統計（直方圖，按五歲）與 16–19 歲者的理由。
5. **招募池表**：新池 id、地點、size、主題、sources（背景＋權重）；說明每季抽樣的可玩感（同池不同季的組合會怎麼變）。
6. **lore 人物草稿要點**：每人 body 的三段要點（崩前、崩後、現在與招牌瞬間）；不必寫全文。
7. **需要既有檔插入**（inserts 草稿）與 **engine-backlog 候選**（項目、影響、建議做法、規模）。
8. **分批**：切成若干批（`fp-south-01`…），**每批 ≤ 42 檔**（背景＋person＋character 三檔一組＋池檔；一組 3 檔，故每批 ≤ 12 組），標明每批檔案清單；會改營運亂數軌跡（新池）的批要標。
9. **產出交接書稿**：每批一份 `cx-fp-south-NN.md`，**照範本 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/cx-kj2-01.md` 的骨架與段落**，差異：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-NN/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-NN/`；引用 fp-common.md；逐檔規格寫到產出工人不必再設計（名、年齡、出身、瞬間、招牌話、所屬池、掛點）；子代理上限 2。
10. **manifest 稿**：每批一份 `fp-south-NN.manifest.json`，照 `content/batches/2026-10/kaiju2-01.json` 格式，`mode:add`、`status:draft`、`base:"TBD"`、`maxFiles` 42、`allow.kinds` 列 `base/persons`、`base/world/backgrounds`、`base/world/recruit-pools`、`lore/characters`，`namePrefix` 空，`checks`: check、lore、typecheck、test、readlist（無 probe／playtest）。
11. **需要決定**。

## 產出（全部寫在）

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/`：`plan.md`（≤ 45 KB）、`people.json`（wf-table/1，第 4 段人物表，columns 自訂但要含 id、name、age、born、culture、background、pool、place、faction、hook）、`review-draft.json`（columns `["檔","類別","名稱","白話","掛到"]`，每件含三類檔每檔一列，白話 ≤ 60 字）、`cx-fp-south-NN.md`、`fp-south-NN.manifest.json`。

## 範圍與禁區

- 唯讀調查線：只寫上述產出目錄；草稿放 `/tmp/cx-fp-south-plan/`。不寫任何 `content/`、`src/`、`test/`、`specs/`、`wf/` 其他檔；不 commit。
- 共通禁區：不碰鍵盤滑鼠螢幕、不開 GUI、不 push／建分支／rebase／reset、不 `rm -rf`、不改 `~/.codex/config.toml`、不裝依賴、不上網、不用 MCP。
- 子代理上限 2，模型隨意；親讀 AGENTS.md 與 fp-common.md；只准寫 `/tmp/cx-fp-south-plan/`。
- 自己打錯指令或路徑＝自己修；只有點名工具本身壞掉才停。
- 件數 gate：24–30 組為目標，超過上限的一律刪到上限；容量 gate：plan.md 超過 45 KB 精簡。
- **跨區避撞**：其他五區同時在規劃。你的檔名（kebab 人名）請加入 `south-plan/names-claimed.json`（字串陣列），並先看 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/*-plan/names-claimed.json`（有就避開）。人物按出身區分，跨區混合者掛在 south 區的現有地點上即可。

## 驗收（固定 4 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–11 段，年齡直方圖含 16–19 歲 ≤ 5% 的說明。
2. people.json、review-draft.json 合法；review-draft 每列白話 ≤ 60 字；所有新名不撞全庫（grep 證據）。
3. 每批一份交接書稿（`python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py <稿> --strict` 為 0）與 manifest 稿（合法 JSON）。
4. 每人都有 lore 掛點（地方與勢力 id 存在）；0 個萬潮葬王／AI／新 effect。

最後訊息只要 5 行摘要＋plan.md 路徑。

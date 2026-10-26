# 任務：fg-gl-03 回收件與拆存研究（產出交接書稿，尚未派工）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要）。再親讀本批 manifest.report.mustRead 的全部檔，路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根；REPORT 開頭逐一列「已讀清單」。另以 tabledb 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json` 的本批十列與材料、掛接表對應列；讀 component 範本 mx-burst-scale.json、mx-relic-halo.json 及 world/research/restraint.json。不得只讀這份摘要。

## 背景與唯一目標

本批只新增 5 個回收部件、5 個針對供體材料的拆存研究；40 檔是 20 裝備＋20 研究，不把帳戶或同一件的附件重算成獨立裝備。掉落、中文材料標籤、研究後取得與共鳴門檻的引擎缺口見計畫 G1–G6。領導須先審計畫、填 manifest.base 並建立隔離 worktree，才可開始；此草稿不是接線授權。

## 工作位置與逐檔規格

worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-gl-03/`。只在該隔離樹新增 manifest.files 十檔。單一真實規格為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json`，以「批=fg-gl-03」取十列，每列「逐檔規格」就是完整 JSON 骨架；無留白、無自由增項。先產 component，經 check 後明確路徑提交，再產同批 research（讓引用先存在）；數值依指定暫值，不自改舊檔。

### component/fl-hollow-sail

新增 `content/base/components/fl-hollow-sail.json`（新件表第 20 列，0-based）。中文「空帆片」、英文 `Hollow Sail`。一片帆張成薄幕，幕破後能慢慢續回。 掛點：空帆的空中棲位；不賦予飛行或水域移動。 等級 C；hp 16／size 1／mass 3；burden 2/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-hollow-sail-study

新增 `content/base/world/research/fl-hollow-sail-study.json`（新件表第 21 列，0-based）。中文「空帆片拆存法」、英文 `Hollow Sail Conservation`。耗用一份懸絮與拆料，學會保存及固定空帆片。 掛點：空帆的空中棲位；不賦予飛行或水域移動。 等級 C；750 幣／60 工時；stock:fl-hollow-sail 1；scrap 2。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-mirror-splinter

新增 `content/base/components/fl-mirror-splinter.json`（新件表第 22 列，0-based）。中文「偏鏡甲」、英文 `Oblique Mirror`。偏斜鏡面擋流光，凡鐵正面打來仍吃得住傷。 掛點：鏡肢的有甲側與裸側；不是另一件骸片透鏡。 等級 B；hp 18／size 2／mass 4；burden 4/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-mirror-splinter-study

新增 `content/base/world/research/fl-mirror-splinter-study.json`（新件表第 23 列，0-based）。中文「偏鏡甲拆存法」、英文 `Oblique Mirror Conservation`。耗用一份鏡屑與拆料，學會保存及固定偏鏡甲。 掛點：鏡肢的有甲側與裸側；不是另一件骸片透鏡。 等級 B；1000 幣／80 工時；stock:fl-mirror-splinter 1；scrap 3。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-dusk-curtain

新增 `content/base/components/fl-dusk-curtain.json`（新件表第 24 列，0-based）。中文「暮帷掛」、英文 `Dusk Curtain`。垂幕拆下的帷沿慢慢聚光，代價是持續承擔。 掛點：奧克蘭空泊與掩舟暮帷；不重寫該獸之夜。 等級 A；hp 22／size 2／mass 5；burden 6/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-dusk-curtain-study

新增 `content/base/world/research/fl-dusk-curtain-study.json`（新件表第 25 列，0-based）。中文「暮帷掛拆存法」、英文 `Dusk Curtain Conservation`。耗用一份帷髓與拆料，學會保存及固定暮帷掛。 掛點：奧克蘭空泊與掩舟暮帷；不重寫該獸之夜。 等級 A；1250 幣／100 工時；stock:fl-dusk-curtain 1；scrap 4。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-wick-felt

新增 `content/base/components/fl-wick-felt.json`（新件表第 26 列，0-based）。中文「燈苔氈」、英文 `Wick Felt`。胸前薄氈會補回細傷，燒穿後便救不回。 掛點：菌絲沿淡水的例外；採收燈苔，不拘束菌絲。 等級 D；hp 12／size 1／mass 2；burden 1/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-wick-felt-study

新增 `content/base/world/research/fl-wick-felt-study.json`（新件表第 27 列，0-based）。中文「燈苔氈拆存法」、英文 `Wick Felt Conservation`。耗用一份燈絨與拆料，學會保存及固定燈苔氈。 掛點：菌絲沿淡水的例外；採收燈苔，不拘束菌絲。 等級 D；600 幣／40 工時；stock:fl-wick-felt 1；scrap 1。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-reed-screen

新增 `content/base/components/fl-reed-screen.json`（新件表第 28 列，0-based）。中文「蘆網襯」、英文 `Reed Screen`。編網狀的菌片讓一半蝕液穿走，換來較厚的緩衝。 掛點：蘆網採收提案；拆船幫用舊纜的手法固定它。 等級 C；hp 16／size 1／mass 3；burden 2/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-reed-screen-study

新增 `content/base/world/research/fl-reed-screen-study.json`（新件表第 29 列，0-based）。中文「蘆網襯拆存法」、英文 `Reed Screen Conservation`。耗用一份網絲與拆料，學會保存及固定蘆網襯。 掛點：蘆網採收提案；拆船幫用舊纜的手法固定它。 等級 C；750 幣／60 工時；stock:fl-reed-screen 1；scrap 2。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

## 掛接與落地限制

所有裝備只用 pools／layersAdd／burden；不用尚未接上的 component.attrMods／poolMods。本批 abilities 為空，AI 戰術鍵不適用。層只附 torso；無 torso 的骨架不可裝，不改骨架。古代件雖填 resonance，現行門檻未阻擋效果，須列「暫緩投放」，不得寫成已落地。20 個 stock:fl-* 是自由帳戶，不新增 materials 或 lootTables 目錄。研究 consumes 會扣料、unlocks 只設旗標，不能宣稱會發貨。新字詞全是提案，原名與掛點存 naming／review，不往不支援的 component 欄位塞文案。

## 範圍（排除法）

只寫隔離 worktree 的十個 manifest.files、該批正式 manifest，以及報告目錄；scratch 限 `/tmp/cx-fg-gl-03/`。件數 gate：恰 10 個 content 新檔、上限 10；超過退回，不拆檔灌數。容量 gate：REPORT ≤ 8 KB；超過精簡，超過 12 KB 停下回報。不做：不改任何既有 content、src、test、specs、design-notes、content/lore、registries、rules、其他三軌；市場、怪獸、掉落表只寫報告請求；不重錄黃金、不改主樹索引。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 條件讀本批規格、材料與掉落表；寫 review.json |
| `rg` | 在 content 確認十個 id 沒撞名、引用存在 |
| `bash /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_accept.sh` | 僅依 manifest.checks 跑固定內容驗收鏈 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_gate.py` | 確認只新增十檔，零既有檔修改 |

## 資源與禁區

可寫程式碼線（限資料 JSON，原始碼仍禁止）。子代理上限 1，同受規矩；不要求必開。不上網、不用 MCP、不碰鍵鼠螢幕、不開 GUI、不 push、不建分支、不 rebase/reset、不 rm -rf、不裝依賴、不改 ~/.codex/config.toml。只能在領導已備妥的 worktree 操作；不自建 worktree。自己打錯自己修；指定工具故障或沙箱拒寫才記 BLOCKED。

## 驗收（固定 4 條，做完就停）

1. manifest.files 恰 10 個只新增，id／名稱／數值／引用對應新件表，content_gate 為 0。
2. content_accept 依 manifest 的 check、lore、typecheck、test、readlist 全過（含 world 自動 ops-check、黃金不變）；不另加測試清單。
3. 五件用相容既有機體做一次 headless 裝配煙霧（每件 seeds 1–5）：層／池與規格一致、無例外；bio burden 相加。古代共鳴只記 G5 限制，不修改引擎求綠；無新能力，不要求 AbilityUsed。紀錄存 playtest.json。
4. REPORT 含已讀清單、十檔成果、前述證據與未接線狀態；review.json 十列、每列白話 ≤ 60 字；manifest.naming 保留英文原名與提案標記。

## 交付

報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gl-03/REPORT.md`；白話表：同目錄 review.json；煙霧紀錄：同目錄 playtest.json。正式 manifest 由領導把本稿落於隔離樹 `content/batches/2026-10/fg-gl-03.json`，base 換真實 commit；稿件位置 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/fg-gl-03.manifest.json`。本線 `cx-fg-gl-03`，領導 lead-fill-gear；完成回報 DONE，驗收不符報 FAILED，工具阻塞報 BLOCKED，附可驗證報告，不自行發佈或帶回 main。

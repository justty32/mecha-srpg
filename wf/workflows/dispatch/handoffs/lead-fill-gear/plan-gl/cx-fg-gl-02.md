# 任務：fg-gl-02 回收件與拆存研究（產出交接書稿，尚未派工）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要）。再親讀本批 manifest.report.mustRead 的全部檔，路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根；REPORT 開頭逐一列「已讀清單」。另以 tabledb 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json` 的本批十列與材料、掛接表對應列；讀 component 範本 mx-burst-scale.json、mx-relic-halo.json 及 world/research/restraint.json。不得只讀這份摘要。

## 背景與唯一目標

本批只新增 5 個回收部件、5 個針對供體材料的拆存研究；40 檔是 20 裝備＋20 研究，不把帳戶或同一件的附件重算成獨立裝備。掉落、中文材料標籤、研究後取得與共鳴門檻的引擎缺口見計畫 G1–G6。領導須先審計畫、填 manifest.base 並建立隔離 worktree，才可開始；此草稿不是接線授權。

## 工作位置與逐檔規格

worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-gl-02/`。只在該隔離樹新增 manifest.files 十檔。單一真實規格為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json`，以「批=fg-gl-02」取十列，每列「逐檔規格」就是完整 JSON 骨架；無留白、無自由增項。先產 component，經 check 後明確路徑提交，再產同批 research（讓引用先存在）；數值依指定暫值，不自改舊檔。

### component/fl-foam-bladder

新增 `content/base/components/fl-foam-bladder.json`（新件表第 10 列，0-based）。中文「沫顎隔囊」、英文 `Foam Bladder`。剖開沫顎胸囊，留一層擋蝕液的軟襯。 掛點：軛鞍行的外洋拆解工作；不把獸囊說成廠製標準件。 等級 C；hp 16／size 1／mass 3；burden 2/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-foam-bladder-study

新增 `content/base/world/research/fl-foam-bladder-study.json`（新件表第 11 列，0-based）。中文「沫顎隔囊拆存法」、英文 `Foam Bladder Conservation`。耗用一份筋脂與拆料，學會保存及固定沫顎隔囊。 掛點：軛鞍行的外洋拆解工作；不把獸囊說成廠製標準件。 等級 C；750 幣／60 工時；stock:fl-foam-bladder 1；scrap 2。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-shelf-ridge

新增 `content/base/components/fl-shelf-ridge.json`（新件表第 12 列，0-based）。中文「棧背梁」、英文 `Shelf Ridge`。厚背梁護住胸腹，背得重也擋得久。 掛點：棧背的港口棲位；拆船幫把斷梁當船肋般架上機。 等級 B；hp 18／size 2／mass 4；burden 4/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-shelf-ridge-study

新增 `content/base/world/research/fl-shelf-ridge-study.json`（新件表第 13 列，0-based）。中文「棧背梁拆存法」、英文 `Shelf Ridge Conservation`。耗用一份梁髓與拆料，學會保存及固定棧背梁。 掛點：棧背的港口棲位；拆船幫把斷梁當船肋般架上機。 等級 B；1000 幣／80 工時；stock:fl-shelf-ridge 1；scrap 3。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-antler-cup

新增 `content/base/components/fl-antler-cup.json`（新件表第 14 列，0-based）。中文「白冠角盞」、英文 `White Crown Cup`。角盞能存一大口流光，自己不會再添滿。 掛點：西雅圖外糧埠礁角；折桅白冠的斷角取得仍待戰果。 等級 A；hp 22／size 2／mass 5；burden 6/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-antler-cup-study

新增 `content/base/world/research/fl-antler-cup-study.json`（新件表第 15 列，0-based）。中文「白冠角盞拆存法」、英文 `White Crown Cup Conservation`。耗用一份頸髓與拆料，學會保存及固定白冠角盞。 掛點：西雅圖外糧埠礁角；折桅白冠的斷角取得仍待戰果。 等級 A；1250 幣／100 工時；stock:fl-antler-cup 1；scrap 4。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-tidespine-keel

新增 `content/base/components/fl-tidespine-keel.json`（新件表第 16 列，0-based）。中文「潮脊斷梁」、英文 `Tidespine Keel`。巨獸脊梁抵住胸甲，護得厚也壓得人難以承擔。 掛點：吉大港的那隻；萬潮葬王唯一例外，不新增出場與討伐。 等級 S；hp 24／size 2／mass 5；burden 12/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-tidespine-keel-study

新增 `content/base/world/research/fl-tidespine-keel-study.json`（新件表第 17 列，0-based）。中文「潮脊斷梁拆存法」、英文 `Tidespine Keel Conservation`。耗用一份脊璞與拆料，學會保存及固定潮脊斷梁。 掛點：吉大港的那隻；萬潮葬王唯一例外，不新增出場與討伐。 等級 S；1500 幣／120 工時；stock:fl-tidespine-keel 1；scrap 6。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-sac-fold

新增 `content/base/components/fl-sac-fold.json`（新件表第 18 列，0-based）。中文「囊褶襯」、英文 `Saccular Fold`。薄囊隔開灼燒，硬物仍容易穿進去。 掛點：浮囊的異形拆件提案；軛鞍行只接懸囊，不聲稱懂牠。 等級 D；hp 12／size 1／mass 2；burden 1/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-sac-fold-study

新增 `content/base/world/research/fl-sac-fold-study.json`（新件表第 19 列，0-based）。中文「囊褶襯拆存法」、英文 `Saccular Fold Conservation`。耗用一份囊褶與拆料，學會保存及固定囊褶襯。 掛點：浮囊的異形拆件提案；軛鞍行只接懸囊，不聲稱懂牠。 等級 D；600 幣／40 工時；stock:fl-sac-fold 1；scrap 1。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

## 掛接與落地限制

所有裝備只用 pools／layersAdd／burden；不用尚未接上的 component.attrMods／poolMods。本批 abilities 為空，AI 戰術鍵不適用。層只附 torso；無 torso 的骨架不可裝，不改骨架。古代件雖填 resonance，現行門檻未阻擋效果，須列「暫緩投放」，不得寫成已落地。20 個 stock:fl-* 是自由帳戶，不新增 materials 或 lootTables 目錄。研究 consumes 會扣料、unlocks 只設旗標，不能宣稱會發貨。新字詞全是提案，原名與掛點存 naming／review，不往不支援的 component 欄位塞文案。

## 範圍（排除法）

只寫隔離 worktree 的十個 manifest.files、該批正式 manifest，以及報告目錄；scratch 限 `/tmp/cx-fg-gl-02/`。件數 gate：恰 10 個 content 新檔、上限 10；超過退回，不拆檔灌數。容量 gate：REPORT ≤ 8 KB；超過精簡，超過 12 KB 停下回報。不做：不改任何既有 content、src、test、specs、design-notes、content/lore、registries、rules、其他三軌；市場、怪獸、掉落表只寫報告請求；不重錄黃金、不改主樹索引。

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

報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gl-02/REPORT.md`；白話表：同目錄 review.json；煙霧紀錄：同目錄 playtest.json。正式 manifest 由領導把本稿落於隔離樹 `content/batches/2026-10/fg-gl-02.json`，base 換真實 commit；稿件位置 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/fg-gl-02.manifest.json`。本線 `cx-fg-gl-02`，領導 lead-fill-gear；完成回報 DONE，驗收不符報 FAILED，工具阻塞報 BLOCKED，附可驗證報告，不自行發佈或帶回 main。

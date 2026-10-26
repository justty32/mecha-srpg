# 任務：fg-gl-04 回收件與拆存研究（產出交接書稿，尚未派工）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要）。再親讀本批 manifest.report.mustRead 的全部檔，路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根；REPORT 開頭逐一列「已讀清單」。另以 tabledb 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json` 的本批十列與材料、掛接表對應列；讀 component 範本 mx-burst-scale.json、mx-relic-halo.json 及 world/research/restraint.json。不得只讀這份摘要。

## 背景與唯一目標

本批只新增 5 個回收部件、5 個針對供體材料的拆存研究；40 檔是 20 裝備＋20 研究，不把帳戶或同一件的附件重算成獨立裝備。掉落、中文材料標籤、研究後取得與共鳴門檻的引擎缺口見計畫 G1–G6。領導須先審計畫、填 manifest.base 並建立隔離 worktree，才可開始；此草稿不是接線授權。

## 工作位置與逐檔規格

worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-gl-04/`。只在該隔離樹新增 manifest.files 十檔。單一真實規格為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json`，以「批=fg-gl-04」取十列，每列「逐檔規格」就是完整 JSON 骨架；無留白、無自由增項。先產 component，經 check 後明確路徑提交，再產同批 research（讓引用先存在）；數值依指定暫值，不自改舊檔。

### component/fl-vault-ply

新增 `content/base/components/fl-vault-ply.json`（新件表第 30 列，0-based）。中文「拱根疊甲」、英文 `Vault Laminate`。外片擋尖矢、內片擋鈍擊，兩片分別耗損。 掛點：拱根的高處棲位；拆解時保留疊根的先後。 等級 B；hp 18／size 2／mass 4；burden 4/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-vault-ply-study

新增 `content/base/world/research/fl-vault-ply-study.json`（新件表第 31 列，0-based）。中文「拱根疊甲拆存法」、英文 `Vault Laminate Conservation`。耗用一份根箔與拆料，學會保存及固定拱根疊甲。 掛點：拱根的高處棲位；拆解時保留疊根的先後。 等級 B；1000 幣／80 工時；stock:fl-vault-ply 1；scrap 3。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-grove-shroud

新增 `content/base/components/fl-grove-shroud.json`（新件表第 32 列，0-based）。中文「白林菌帷」、英文 `White Grove Shroud`。厚菌帷緩慢補回胸前損傷，持有者仍要扛住它。 掛點：五湖白汊與斷橋骸林；不是活捕、更不是種植。 等級 A；hp 22／size 2／mass 5；burden 6/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-grove-shroud-study

新增 `content/base/world/research/fl-grove-shroud-study.json`（新件表第 33 列，0-based）。中文「白林菌帷拆存法」、英文 `White Grove Shroud Conservation`。耗用一份林絡與拆料，學會保存及固定白林菌帷。 掛點：五湖白汊與斷橋骸林；不是活捕、更不是種植。 等級 A；1250 幣／100 工時；stock:fl-grove-shroud 1；scrap 4。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-fallen-step

新增 `content/base/components/fl-fallen-step.json`（新件表第 34 列，0-based）。中文「墟階殘片」、英文 `Fallen Step`。離開古代機的殘片能撐一層薄幕，須先過共鳴門檻。 掛點：浦那外舊陣列；只撿散落遺物，不拆刑天。 等級 C；hp 16／size 1／mass 3；resonance {'beliefs': ['seek-truth'], 'threshold': 0.5}；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環／G5 共鳴（暫緩投放）；不添加未生效欄位。

### research/fl-fallen-step-study

新增 `content/base/world/research/fl-fallen-step-study.json`（新件表第 35 列，0-based）。中文「墟階殘片拆存法」、英文 `Fallen Step Conservation`。耗用一份階砂與拆料，學會保存及固定墟階殘片。 掛點：浦那外舊陣列；只撿散落遺物，不拆刑天。 等級 C；750 幣／60 工時；stock:fl-fallen-step 1；scrap 2。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環／G5 共鳴（暫緩投放）；不添加未生效欄位。

### component/fl-tomb-chime

新增 `content/base/components/fl-tomb-chime.json`（新件表第 36 列，0-based）。中文「古陵空鈴」、英文 `Sepulchral Chime`。空鈴承住流光，沒有共鳴的人只能聽見空響。 掛點：慶州古陵；不聲稱取自處容身上。 等級 B；hp 18／size 2／mass 4；resonance {'beliefs': ['protect-kin', 'bring-them-home'], 'threshold': 0.5}；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環／G5 共鳴（暫緩投放）；不添加未生效欄位。

### research/fl-tomb-chime-study

新增 `content/base/world/research/fl-tomb-chime-study.json`（新件表第 37 列，0-based）。中文「古陵空鈴拆存法」、英文 `Sepulchral Chime Conservation`。耗用一份鈴灰與拆料，學會保存及固定古陵空鈴。 掛點：慶州古陵；不聲稱取自處容身上。 等級 B；1000 幣／80 工時；stock:fl-tomb-chime 1；scrap 3。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環／G5 共鳴（暫緩投放）；不添加未生效欄位。

### component/fl-lake-votive

新增 `content/base/components/fl-lake-votive.json`（新件表第 38 列，0-based）。中文「湖殿殘燈」、英文 `Lake Votive`。殘燈撐起能復原的光幕，認不出來者不能借光。 掛點：的的喀喀遺跡；不交易維拉科查、不另寫認主。 等級 A；hp 22／size 2／mass 5；resonance {'beliefs': ['protect-kin', 'bring-them-home'], 'threshold': 0.75}；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環／G5 共鳴（暫緩投放）；不添加未生效欄位。

### research/fl-lake-votive-study

新增 `content/base/world/research/fl-lake-votive-study.json`（新件表第 39 列，0-based）。中文「湖殿殘燈拆存法」、英文 `Lake Votive Conservation`。耗用一份燈石與拆料，學會保存及固定湖殿殘燈。 掛點：的的喀喀遺跡；不交易維拉科查、不另寫認主。 等級 A；1250 幣／100 工時；stock:fl-lake-votive 1；scrap 4。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環／G5 共鳴（暫緩投放）；不添加未生效欄位。

## 掛接與落地限制

所有裝備只用 pools／layersAdd／burden；不用尚未接上的 component.attrMods／poolMods。本批 abilities 為空，AI 戰術鍵不適用。層只附 torso；無 torso 的骨架不可裝，不改骨架。古代件雖填 resonance，現行門檻未阻擋效果，須列「暫緩投放」，不得寫成已落地。20 個 stock:fl-* 是自由帳戶，不新增 materials 或 lootTables 目錄。研究 consumes 會扣料、unlocks 只設旗標，不能宣稱會發貨。新字詞全是提案，原名與掛點存 naming／review，不往不支援的 component 欄位塞文案。

## 範圍（排除法）

只寫隔離 worktree 的十個 manifest.files、該批正式 manifest，以及報告目錄；scratch 限 `/tmp/cx-fg-gl-04/`。件數 gate：恰 10 個 content 新檔、上限 10；超過退回，不拆檔灌數。容量 gate：REPORT ≤ 8 KB；超過精簡，超過 12 KB 停下回報。不做：不改任何既有 content、src、test、specs、design-notes、content/lore、registries、rules、其他三軌；市場、怪獸、掉落表只寫報告請求；不重錄黃金、不改主樹索引。

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

報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gl-04/REPORT.md`；白話表：同目錄 review.json；煙霧紀錄：同目錄 playtest.json。正式 manifest 由領導把本稿落於隔離樹 `content/batches/2026-10/fg-gl-04.json`，base 換真實 commit；稿件位置 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/fg-gl-04.manifest.json`。本線 `cx-fg-gl-04`，領導 lead-fill-gear；完成回報 DONE，驗收不符報 FAILED，工具阻塞報 BLOCKED，附可驗證報告，不自行發佈或帶回 main。

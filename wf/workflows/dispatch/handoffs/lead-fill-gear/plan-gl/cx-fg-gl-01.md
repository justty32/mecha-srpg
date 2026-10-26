# 任務：fg-gl-01 回收件與拆存研究（產出交接書稿，尚未派工）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要）。再親讀本批 manifest.report.mustRead 的全部檔，路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根；REPORT 開頭逐一列「已讀清單」。另以 tabledb 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json` 的本批十列與材料、掛接表對應列；讀 component 範本 mx-burst-scale.json、mx-relic-halo.json 及 world/research/restraint.json。不得只讀這份摘要。

## 背景與唯一目標

本批只新增 5 個回收部件、5 個針對供體材料的拆存研究；40 檔是 20 裝備＋20 研究，不把帳戶或同一件的附件重算成獨立裝備。掉落、中文材料標籤、研究後取得與共鳴門檻的引擎缺口見計畫 G1–G6。領導須先審計畫、填 manifest.base 並建立隔離 worktree，才可開始；此草稿不是接線授權。

## 工作位置與逐檔規格

worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-gl-01/`。只在該隔離樹新增 manifest.files 十檔。單一真實規格為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/new-items.json`，以「批=fg-gl-01」取十列，每列「逐檔規格」就是完整 JSON 骨架；無留白、無自由增項。先產 component，經 check 後明確路徑提交，再產同批 research（讓引用先存在）；數值依指定暫值，不自改舊檔。

### component/fl-scale-leaf

新增 `content/base/components/fl-scale-leaf.json`（新件表第 0 列，0-based）。中文「節甲襯」、英文 `Segment Lining`。薄甲墊在胸前，先替座艙吃下一擊。 掛點：吉大港拆船幫：崩年拆船手改做拆屍工。 等級 D；hp 12／size 1／mass 2；burden 1/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-scale-leaf-study

新增 `content/base/world/research/fl-scale-leaf-study.json`（新件表第 1 列，0-based）。中文「節甲襯拆存法」、英文 `Segment Lining Conservation`。耗用一份甲葉與拆料，學會保存及固定節甲襯。 掛點：吉大港拆船幫：崩年拆船手改做拆屍工。 等級 D；600 幣／40 工時；stock:fl-scale-leaf 1；scrap 1。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-lantern-pith

新增 `content/base/components/fl-lantern-pith.json`（新件表第 2 列，0-based）。中文「燈髓囊」、英文 `Lantern Marrow`。把燈腹拆下的囊掛在背後，少量續入流光。 掛點：燈腹與弔燈蜂的採收提案；拆船幫只保囊口不漏。 等級 C；hp 16／size 1／mass 3；burden 2/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-lantern-pith-study

新增 `content/base/world/research/fl-lantern-pith-study.json`（新件表第 3 列，0-based）。中文「燈髓囊拆存法」、英文 `Lantern Marrow Conservation`。耗用一份節髓與拆料，學會保存及固定燈髓囊。 掛點：燈腹與弔燈蜂的採收提案；拆船幫只保囊口不漏。 等級 C；750 幣／60 工時；stock:fl-lantern-pith 1；scrap 2。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-rack-rib

新增 `content/base/components/fl-rack-rib.json`（新件表第 4 列，0-based）。中文「櫛骨襯」、英文 `Comb Rib`。擋直刺的窄骨排，遇蝕液仍會漏進胸甲。 掛點：矢櫛的高處射擊棲位；拆船幫回收矢架。 等級 B；hp 18／size 2／mass 4；burden 4/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-rack-rib-study

新增 `content/base/world/research/fl-rack-rib-study.json`（新件表第 5 列，0-based）。中文「櫛骨襯拆存法」、英文 `Comb Rib Conservation`。耗用一份稜骨與拆料，學會保存及固定櫛骨襯。 掛點：矢櫛的高處射擊棲位；拆船幫回收矢架。 等級 B；1000 幣／80 工時；stock:fl-rack-rib 1；scrap 3。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-gate-flap

新增 `content/base/components/fl-gate-flap.json`（新件表第 6 列，0-based）。中文「闕甲裙」、英文 `Gate Mantle`。厚甲向胸前合攏，擋硬矢卻怕燒。 掛點：八打雁外閘與閘母；未宣稱已擊殺閉港千扉。 等級 A；hp 22／size 2／mass 5；burden 6/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-gate-flap-study

新增 `content/base/world/research/fl-gate-flap-study.json`（新件表第 7 列，0-based）。中文「闕甲裙拆存法」、英文 `Gate Mantle Conservation`。耗用一份闕膜與拆料，學會保存及固定闕甲裙。 掛點：八打雁外閘與閘母；未宣稱已擊殺閉港千扉。 等級 A；1250 幣／100 工時；stock:fl-gate-flap 1；scrap 4。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### component/fl-heel-cushion

新增 `content/base/components/fl-heel-cushion.json`（新件表第 8 列，0-based）。中文「蹄墊甲」、英文 `Heel Cushion`。柔墊把鈍擊攤開，尖矢仍會穿過。 掛點：軛鞍行：先拆濺蹄的足墊，再談能否接上鐵架。 等級 D；hp 12／size 1／mass 2；burden 1/回合；層或池見逐檔規格。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

### research/fl-heel-cushion-study

新增 `content/base/world/research/fl-heel-cushion-study.json`（新件表第 9 列，0-based）。中文「蹄墊甲拆存法」、英文 `Heel Cushion Conservation`。耗用一份足筋與拆料，學會保存及固定蹄墊甲。 掛點：軛鞍行：先拆濺蹄的足墊，再談能否接上鐵架。 等級 D；600 幣／40 工時；stock:fl-heel-cushion 1；scrap 1。完整欄位取 new-items.json 的「逐檔規格」，逐值照抄後只潤中文 name；英文與敘事意涵保留 manifest naming。限制：G1 掉落／G3 取得閉環；不添加未生效欄位。

## 掛接與落地限制

所有裝備只用 pools／layersAdd／burden；不用尚未接上的 component.attrMods／poolMods。本批 abilities 為空，AI 戰術鍵不適用。層只附 torso；無 torso 的骨架不可裝，不改骨架。古代件雖填 resonance，現行門檻未阻擋效果，須列「暫緩投放」，不得寫成已落地。20 個 stock:fl-* 是自由帳戶，不新增 materials 或 lootTables 目錄。研究 consumes 會扣料、unlocks 只設旗標，不能宣稱會發貨。新字詞全是提案，原名與掛點存 naming／review，不往不支援的 component 欄位塞文案。

## 範圍（排除法）

只寫隔離 worktree 的十個 manifest.files、該批正式 manifest，以及報告目錄；scratch 限 `/tmp/cx-fg-gl-01/`。件數 gate：恰 10 個 content 新檔、上限 10；超過退回，不拆檔灌數。容量 gate：REPORT ≤ 8 KB；超過精簡，超過 12 KB 停下回報。不做：不改任何既有 content、src、test、specs、design-notes、content/lore、registries、rules、其他三軌；市場、怪獸、掉落表只寫報告請求；不重錄黃金、不改主樹索引。

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

報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gl-01/REPORT.md`；白話表：同目錄 review.json；煙霧紀錄：同目錄 playtest.json。正式 manifest 由領導把本稿落於隔離樹 `content/batches/2026-10/fg-gl-01.json`，base 換真實 commit；稿件位置 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/fg-gl-01.manifest.json`。本線 `cx-fg-gl-01`，領導 lead-fill-gear；完成回報 DONE，驗收不符報 FAILED，工具阻塞報 BLOCKED，附可驗證報告，不自行發佈或帶回 main。

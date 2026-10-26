# cx-fg-gl-02 — FAILED

## 已讀清單

以下路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根，逐檔親讀。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/ops-content.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gl/plan.md`

另讀工作樹 WORKFLOWS.md、SESSION-LOG.md、WAIT_USER.md、common/data-files.md、common/conventions.md、common/code-map.md、dev-env.md、testing.md；以 tabledb 讀 new-items.json 本批十列（10–19）、materials.json 與 hook-proposals.json 各五列（5–9）、engine-facts.json 全部21列。親讀範本 content/base/components/mx-burst-scale.json、mx-relic-halo.json 與 content/base/world/research/restraint.json。開場 inbox/new 無信。

## 固定四條驗收

### 1. 未通過閘門

十個 content 新檔已完成，5 component＋5 research；逐檔 JSON 與新件表骨架完全相同，id／名稱／數值／引用逐值核對，無額外 content 檔、既有追蹤檔零修改。content_gate 通過這十個內容檔，但對領導預置的 content/batches/2026-10/fg-gl-02.json 報 PATH，exit 1；工具未排除批次 manifest。未放寬 allow 或件數上限，未移走 manifest 隱藏違規。詳 [gate](accept/gate.json)。
### 2. 指定輕量檢查完成，單檔未全綠

依使用者本輪覆蓋規則，只跑 npm run check、npm run typecheck 與相關 node --test 單檔；沒有執行 npm test／test:e2e／sim／fuzz 全套。check 為 OK 0 errors、10個既有怪獸警告，typecheck exit 0。單檔25例，10 pass／15 fail，原因見第3條。content_accept 使用縮限 checks（typecheck/readlist），gate 階段即拒絕；未讓它自建被禁的 base worktree，check 另行執行。readlist 另行核對，14項全過。黃金與營運 fixtures 無差異。
### 3. 未通過五件相容裝配

[playtest.json](playtest.json) 逐件記 seeds 1–5 共25次嘗試。沫顎隔囊、囊褶襯在既有 frame/anvil-gatewarden 各5次合法裝配成功，層完整內容、層HP、部件HP、既有池不變與 burden 2／1 全符；同機雙裝 burden=3。棧背梁與潮脊斷梁需要 armorMount size 2，白冠角盞需要 systemMount size 2；掃全部既有 mechanical frame 後均無相容槽，15次在相容性檢查失敗，未強塞入 size 1 槽冒充通過。因此三件的執行期層／池尚未驗證。未改骨架、規格、引擎求綠。
### 4. 交付齊備

[review.json](review.json) 十列、每列白話≤60字，掛點標提案。正式 manifest.naming 保留十個英文原名、意涵、中文名與提案總註。REPORT 小於8KB，煙霧原始紀錄與程式存 logs；本批 status=rejected，未宣告接受。

## 十檔成果與未接線狀態

沫顎隔囊、棧背梁、白冠角盞、潮脊斷梁、囊褶襯及各自拆存法，共十檔；完整路徑見 review 與正式 manifest.files。先產五件 component 並 check 為零錯，再產研究。未 commit：content_gate 明確要求 HEAD 等於 manifest.base，先提交 component 會另觸發 BASE 違規；本線保留原 base、不繞過閘門，交領導處理。

G1 掉落、G2 採樣／屍拆、G3 研究到實物、G4 材料中文標籤與投放仍未接線。research.consumes 只描述扣料，unlocks 只設旗標，不會發部件、量產獸體或複製遺物。未新增材料定義、掉落表、市場或能力，AI戰術與 AbilityUsed 不適用。A/S 不補貨，潮脊維持吉大港唯一來源。本批沒有古代件；G5仍是其他批古代件暫緩投放的限制。

領導收件須處理 manifest 的 gate 排除方式，以及三件 size 2 對應的既有槽位不相容；不得據此當成已可投放。全套測試由領導統一執行。本線未 push、未發佈、未帶回 main，未新增驗收條目。

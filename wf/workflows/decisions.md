# decisions — 決策記錄（為什麼選 A 不選 B）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

留下「為什麼」：git log 找得回改了什麼，找不回**為什麼放棄方案 C**。

**何時用**：在兩個以上可行方案裡選一個，且日後可能被問「當初為什麼」。
**何時不用**：只有一條路，或隨時可回頭的小事。決策過程要結構化評估 → knowledge 包的 decide 工作流，結論再落到這裡。

## Done when

- 新增一筆（子檔或本檔一段），且「未選方案與原因」「前提」非空；`decisions.md`＋`decisions/` 合計 ≤ 16 KB（上限在 [tidy](tidy/README.md)）。

## 記錄（新的在上）

每筆：**決定**／**未選方案與原因**／**前提（變了就重看）**。新決定開 `decisions/<日期>-<題>.md` 子檔、本檔加一行導航；決定落實進 spec 後子檔刪掉，本檔只留「→ 見 spec」＋未選理由（標題不改，constraints 的 `source` 錨點連著）。

- [golden-a3407d97](decisions/2026-11-05-golden-a3407d97.md)：2026-11-05 追認黃金 a3407d97 改寫（根源是 RNG 順序、無產品 bug），並定「改營運／世界內容的 commit 同 commit 重錄黃金」。
- [fable-three](decisions/2026-11-05-fable-three.md)：2026-11-05 Fable 三題全照推薦——size 2 保留並升 5 個重型骨架槽、74 只修戰鬥結算、E1 後 E3′（E2 擱置、D2 不做）。
- [bio-ui](decisions/2026-10-24-bio-ui.md)：生物系兩類、沒有餵養（磨損取代飢餓）、四種稱號、UI 按鈕＋快捷鍵——已落實 specs/ops，子檔只留未選理由。

### 2026-10-24 world-grid 整合進既有 ops spec、太空歌劇只換名不換機制（Fable 代決）

已落實：[specs/ops/world-grid](planning/specs/ops/world-grid/README.md)（`node`→`place`／`loc` 全改名、方格裁示另取 USR-12／13、`data-model-world-map.md` 留裂縫狀態機與浮船）、[content-format-ops](planning/specs/ops/content-format-ops.md) 拆資料夾、[core README 對照表](planning/specs/core/README.md#機制名--風格名對照)＋[style.md](../../content/lore/style.md)（只換名與解釋；pool id／tag／事件名／`stock:*` 不改，尺度改寫成遊戲量）。
**未選方案與原因**：world-map 整檔封存——裂縫狀態機與浮船沒別的家；保留 `node` 只加註——廢詞會在程式裡活下去；方格重用 USR-10／11 號——已被 plan-ops-war 佔用；連 id 一起改（`heat`→`ash`）——牽動 content／src／黃金與五條實作線，收益只是可讀性；兩套 name 切換——使用者裁示是基調不是選項。
**前提**：design-notes/world.md 2026-10-24「太空歌劇，不要硬科幻」。原文見 git `a8d6323d` 的 `decisions/2026-10-24-spec-integrate.md`。

### 2026-10-23 ToME4 卷八題的預設（Fable 代決，使用者可逐條推翻）

已落實 [constraints.json](planning/specs/core/constraints.json) DC-T01～T09 與 [rules-resources-effects](planning/specs/core/rules-resources-effects.md)。**未選方案與原因**：AP 獨立於資源池——多一種機制沒好處；熱量硬上限——砍掉「超載賭一把」的熱血橋段；效果一律全場輪時鐘——速度排序下快單位的效果相對變長；護甲只能二選一——層資料化後兩種都能有。

### 2026-10-23 技術棧：純 TypeScript＋Vite，邏輯與 DOM 分離

已落實 [architecture](planning/specs/core/architecture.md)、constraints DC-02。**未選方案與原因**：Lit 3——首次渲染慢約 30 ms、多一層依賴，營運層選單真的痛再引入；Svelte——首次渲染是其他棧的 3–5 倍；Godot headless——「網頁不好用才改」沒觸發，且 headless 驗不了畫面。**前提**：lead-techstack spike（120×120、200 單位：純 TS 65.8／30.9 ms）；本機 node 24、Playwright 可用快取瀏覽器。

### 2026-10-23 戰鬥系統十題的預設（Fable 代決，使用者可逐條推翻）

已落實 constraints DC-C01～C11（ops 側 DEC-01～03）與 core `rules-*`。**未選方案與原因**：單一資源（只疲勞或只熱量）——浪費「機甲即裝備」天然的兩層結構；SRW 氣力與精神指令——與 BB 式人物養成重疊，且使用者已定 BB 為主；敵軍隨戰力縮放——抵消營運層「地盤蔓延」的壓力感。

### 2026-10-23 現役交接書不套文件大小規則

**決定**：`dispatch/handoffs/`（含領導派的第二層子線）不套 wf-lint 的 8 KB／1 KB 規則；在地補丁 `wf/tools/wf-lint-checks.sh` 不下鑽，閘門改由 `wf-lint-local.sh` 呼叫 `brief_lint.py`。**未選方案與原因**：壓到 8 KB——契約要完整，拆了反而漏授權；搬出 `wf/`——破壞分層與既有連結。**前提**：補丁在 kernel-owned 檔，`tools/` 整包升級要重套，或向上游提議 `*/handoffs` 比照 `done/` 不下鑽。

### 2026-10-23 整個專案重做為網頁文字遊戲

已落實 constraints DC-01 與 [PROJECT](../../PROJECT.md)（舊 Python 版 2026-11-05 已刪，git `706da1e6`）。**未選方案與原因**：續做 Python＋tcod 桌面版——使用者要純網頁、純文字、agent 可 headless 跑測；直接選 Godot——使用者優先網頁，Godot 留備案（條件未觸發）。

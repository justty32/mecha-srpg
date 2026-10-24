# decisions／2026-10-24 — 方格大地圖整合進既有 ops spec、太空歌劇風格只換名不換機制、content-format-ops 拆資料夾

[decisions 入口](../decisions.md)｜裁示原文 [design-notes/world](../planning/design-notes/world.md)（2026-10-24 末兩段）｜落點 [specs/ops/world-grid](../planning/specs/ops/world-grid/README.md)、[specs/core README 對照表](../planning/specs/core/README.md#機制名--風格名對照)、[content/lore/style.md](../../../content/lore/style.md)

## 2026-10-24 world-grid 整合（Fable 代決，使用者可逐條推翻）

**決定**：(1) `data-model-world-map.md` 不刪、不改名：節點／路線／蝕域三節標「已取代」各留一段指路，裂縫狀態機、潮壓、浮船、遺跡入口留下並把位置欄改成 `Loc`，渡輪併入航道；constraints 指向它的錨點改指 world-grid 子檔。(2) 事件與效果詞彙改名：`transferNode`→`transferPlace`、`NodeTransferred`→`PlaceTransferred`、`setNode`→`setPlace`、`NodeBlighted`／`NodeReclaimed`→`PatchBlighted`／`PlaceReclaimed`；`OperationDef.targetSel` 的 `shallow-node`／`route`／`enemy-node` 改 `blight-edge`／`lane`／`enemy-place`；`ContractState.target.node`→`place`、`Sortie.node`→`loc`、`MarketDef.node`／`recruit.node`→`place`、`CampaignState.nodes`→`places`（版本 2，不做 v1 轉檔）。(3) 方格裁示在 `constraints-ops.json` 另取 USR-12（六張圖、迷霧、航道）、USR-13（格上自由移動、行動者、遭遇四選、不加動詞），USR-10／11 保留為風格與方格的總條，只改 note；WV-02、WV-03、WV-09、WV-13 的 constraint 文字跟著改寫（比照 WV-06 的前例，不刪列）。(4) `content-format-ops.md` 拆成資料夾型：原路徑留作入口（佈局、驗證、新增 X、導航），範例分 `world`／`factions-war`／`crew-text` 三子檔。(5) 四個 spec 缺口落點：清剿目標與 `EnemySnapshot.phase` 在 factions-contracts、`opening` 期殲滅先鋒即 `closed` 在 battle-interface 與 world-map 狀態機、`ammo` 市場列與每日補滿在 economy。(6) 開場樣稿對齊實作與 lore：三台 C 級（兩台犁改燕鷗攻堅型＋一台拼裝獵犬-II型）、裂縫第四天＝下個大潮在十一天後。

**未選方案與原因**：把 world-map 整檔搬 `archive/`——裂縫狀態機與浮船沒有別的家，搬了要在 world-grid 重寫一遍；保留 `node` 字樣只加註解——「節點」已廢，留著會在程式裡活下去（world-grid 決定 2）；為方格重用 USR-10／11 編號——已被 plan-ops-war 佔用，改號會讓兩份 REPORT 對不上；content-format-ops 改成 `content-format-ops/README.md` 入口——外部連結全指 `.md`，STRUCTURE 規則 5 要原路徑保留。

**前提**：plan-world-grid REPORT 整合清單 12 條；plan-ops-war 建議拆檔與改名；lead-impl-war 正在 `src/ops/war/` 實作（內容檔 `operations/clear.json` 仍用 `shallow-node`／`setNode`，改名列入 world-grid 切線 (5)）；lead-ops-bio-balance REPORT 第七節 4。

## 2026-10-24 太空歌劇風格改寫（spec 層）

**決定**：只換名與解釋、不換機制：pool id（`heat`、`charge`、`fuel`、`ammo-*`）、tag、事件名、`stock:*` 帳名一律不改；內容包 `name`、UI 文字、spec 敘述改用 `content/lore/style.md` 的風格名；core README 加「機制名 ↔ 風格名」對照表，glossary 加一列。spec 內的尺度數字改寫成遊戲量（「一格＝船一天航程的十分之一」「一天十格」），`cell_km` 欄留給產生器、不進文本。design-notes 是使用者原話不改；constraints 的裁示引文不改、只加 note。

**未選方案與原因**：連 id 一起改（`heat`→`ash`）——牽動 content/base、src、測試黃金檔與五條實作線，收益只是程式可讀性；寫兩套 name（硬科幻／歌劇）切換——使用者裁示是基調不是選項。

**前提**：design-notes/world.md 2026-10-24「太空歌劇，不要硬科幻」「不要太過現實」；plan-lore 的 `style.md`／`glossary.json`。

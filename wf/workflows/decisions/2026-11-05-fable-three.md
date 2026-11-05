# decisions／2026-11-05 — Fable 三題裁決（SIZE／LINK-01／LINK-02）

[decisions 入口](../decisions.md)｜報告 [fable-report](../../notes/investigations/content-review-2026-10-27/fable-report.md)｜子檔 [size](../../notes/investigations/content-review-2026-10-27/fable-size.md)、[link01](../../notes/investigations/content-review-2026-10-27/fable-link01.md)、[link01 設計](../../notes/investigations/content-review-2026-10-27/fable-link01-design.md)、[link02](../../notes/investigations/content-review-2026-10-27/fable-link02.md)

## 2026-11-05 使用者裁決：三題全部照 Fable 建議

**決定**：
- **SIZE-01～09**（[fable-size](../../notes/investigations/content-review-2026-10-27/fable-size.md)）：保留 size 2。把 5 個重型 bodyplan（mx-biped-heavy、mx-fortress-a、m2-hexapod-b、mx-ace-a、mx-selene-s，共 24 台）的軀幹甲槽與一個系統槽由 1 升到 2；只改資料、不改引擎，size 1 件照裝、既有配裝不動。
- **LINK-01／backlog 74**（[fable-link01](../../notes/investigations/content-review-2026-10-27/fable-link01.md)、[設計](../../notes/investigations/content-review-2026-10-27/fable-link01-design.md)）：被動修正先只修戰鬥結算（makeUnit 掛 contribs，照設計；source 用 `component:<slot>`）。機庫顯示延後；共鳴門檻暫不做；黃金重錄與 backlog 55 國家機甲那輪合併。
- **LINK-02／backlog 75–77**（[fable-link02](../../notes/investigations/content-review-2026-10-27/fable-link02.md)）：照推薦路線。先做 E1（MarketDef item 加 `requires`，門檻逐列填、不預設所有勢力件都鎖），再做 E3′（拆獸屍按 species 表給 `stock:fl-*`）。E2（ComponentDef 加 maker）先擱置；D2（遭遇塞件等掉落）不做。4 件無門檻 fm-*（cradle-slit、bellows-bridge、breakwater-greave、rivet-handguard）照 E1 逐列判定。具體門檻數字報告只給兩組候選（同機型表 C20／B35／A55，或低一階 C10／B20／A35）、未選定：實作時依報告逐列填，報頂層。

**未選方案與原因**：size 退路 C（A／S 四件留 2、B 五件縮 1）與保守升 2 種 10 台——Fable 推薦 A 且使用者照之；9 件全縮 size 1——失去重型機專用拆件定位。74 連機庫顯示一併做——範圍大、先修結算，顯示延後。E2——只有使用者說「勢力件比照機甲」才值得補 80 件 maker，目前不要。D1（勢力件當固定 item）——只是臨時解、放棄 75。D2——loot.components 永遠空，無效。E3（掉部件實物）——大改 rules flow／apply／workqueue，先做 E3′ 最小切片。

**前提（變了就重看）**：報告查的是 HEAD `4d47f485`，且未跑 node，驗證皆待實作時執行；實作排在 fix-playtest-1105 合併之後（避免同時改戰鬥碼與黃金）；若使用者之後要勢力件比照機甲聲望，重開 E2；74 完成時同步 engine-facts EF-02／EF-13 與 content/mechs.md 的 attrMods 說法。

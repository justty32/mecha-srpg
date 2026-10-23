# decisions — 決策記錄（為什麼選 A 不選 B）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

留下「為什麼」：git log 找得回改了什麼，找不回**為什麼放棄方案 C**。

**何時用**：在兩個以上可行方案裡選一個，且日後可能被問「當初為什麼」。
**何時不用**：只有一條路，或隨時可回頭的小事。決策過程要結構化評估 → knowledge 包的 decide 工作流，結論再落到這裡。

## Done when

- 下表新增一列，且「未選方案與原因」「前提」兩欄非空。

## 記錄（新的在上）

| 日期 | 決定 | 未選方案與原因 | 前提（變了就重看）|
|------|------|---------------|-----------------|
| 2026-10-23 | `wf/workflows/dispatch/handoffs/`（現役交接書）**不套** wf-lint 的 8 KB／1 KB 文件規則：在地補丁 `wf/tools/wf-lint-checks.sh` 把它加進不下鑽清單，品質閘門改由 `wf-lint-local.sh`→`brief_lint.py` 把關（含領導派的第二層子線交接書） | 把每份交接書壓到 8 KB 內：契約要完整、拆了反而漏授權，領導線每份都會撞；把 handoffs 搬出 `wf/`：破壞分層與既有連結 | 補丁在 kernel-owned 檔，`tools/` 整包升級時要重套（或向上游 `~/repo/workflows` 提議把 `*/handoffs` 比照 `done/` 不下鑽）|
| 2026-10-23 | 整個專案**重做為網頁文字遊戲**（偏 MUD、無美術資源），SRPG 機甲戰場同樣用網頁呈現；舊 Python＋tcod＋C++ 程式碼與 11 章教學轉為 legacy，待新 spec 定案後封存。技術棧先調查再定；網頁不好用則改 Godot-mono（只 headless） | 續做 Python＋tcod 桌面版：使用者要純網頁、純文字、agent 可 headless 跑測；直接選 Godot：使用者優先網頁，Godot 保留為備案 | 網頁技術棧能呈現格狀戰場且可 headless 測試；戰鬥系統參考超級機器人大戰／Battle Brothers；架構須解耦、資料驅動（機甲／部件／駕駛員／地形可擴充）、含 AI |


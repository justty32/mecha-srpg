# planning — 想法成熟管線（idea → roadmap → 詳規 → 執行）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

從萌芽到動工的四階段收在**同一條管線**，不拆成四個工作流——免得卡在「這算 idea 還是 roadmap」。

**何時用**：使用者說「記個想法」「以後要做」「排進 roadmap」「幫我規劃」。
**何時不用**：三兩步的小事直接做；已有 spec / plan 且在動工 → 執行工作流；只是要調查清楚 → investigation（dev 包）。

## Done when

- idea / roadmap：對應表多一列，或既有列狀態欄更新。
- 詳規：spec 有「方案 / 取捨」段、plan 有「步驟 / 驗證」段；動工完成後移 `archive/`。

## 階段

| 階段 | 回答的問題 | 落點 |
|------|-----------|------|
| **idea** | 要不要做？ | 下方「想法」表 |
| **roadmap** | 會做，何時？ | 下方「roadmap」表 |
| **詳規** | 怎麼做？ | 開發：**spec**（方案）→ **plan**（動工前詳規），各一檔放 `planning/specs/`、`planning/plans/`，第一份出現時升級成資料夾型。非開發：接 plan-a-thing（knowledge 包）|
| **執行** | — | 開發：feature-dev；非開發：plan-a-thing 的執行段 |

使用者的原始設計裁示（spec 前）→ [planning/design-notes.md](planning/design-notes.md)；世界觀與營運層第一版提案 → [planning/specs/world/](planning/specs/world/README.md)。

## 想法（要不要做）

目前無 open 的想法（2026-10-24 清空：技術棧選型與戰鬥系統參考已進 roadmap 並完成、legacy 封存已做；紀錄在 git log）。新想法照下列欄位開表：`想法`／`一句話`／`狀態（想想 / 會做→搬 roadmap / 不做＋原因）`。

## roadmap（會做，何時）

已抽到 [planning-roadmap.json](planning-roadmap.json)（10 列；已完成列直接移除，2026-10-24 移除 3 列）。

欄位：`事項`、`何時 / 順序`、`前提`（含 REPORT 連結）。查法見 [data-files](common/data-files.md)。

## 交接

- 決定「為什麼選 A 不選 B」 → [decisions](decisions.md)。卡在使用者 → [WAIT_USER](../WAIT_USER.md) 一行；跨 session → [SESSION-LOG](../SESSION-LOG.md) 一行。

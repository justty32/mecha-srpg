# SPEC — 設計契約入口

唯一真實來源已移到 wf 規劃區，本檔只做指路。

| 入口 | 內容 |
|------|------|
| [specs/core/README.md](wf/workflows/planning/specs/core/README.md) | 核心引擎 spec v1：模組邊界、資料模型、規則結算、AI、內容格式、架構與 headless 測試 |
| [specs/world/README.md](wf/workflows/planning/specs/world/README.md) | 世界觀與營運層構想（提案，逐點可推翻） |
| `wf/workflows/planning/specs/core/constraints.json` | 不可違反的裁示清單（wf-table/1 資料檔） |

- 兩份入口衝突時以 `constraints.json` 與使用者裁示原文（[design-notes](wf/workflows/planning/design-notes.md)）為準；為什麼這樣選見 [decisions](wf/workflows/decisions.md)。
- 程式碼與 spec 不一致時，先在實作線 REPORT 標 `SPEC-GAP`，由頂層改 spec，不在程式裡另立規則。
- 舊版 Python 專案的 SPEC 原文封存在 `legacy/SPEC.md`，不再維護、不是契約。

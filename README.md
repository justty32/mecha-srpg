# mecha-srpg

2108 地月機甲戰爭題材的**網頁文字回合制機甲 SRPG**（工作名《蝕潮獵團》）。純 TypeScript，遊戲邏輯與 DOM 分離，可在 node 裡 headless 測試。背景與定位見 [PROJECT.md](PROJECT.md)。

## 30 秒導覽

- **讀 spec**：從 [specs/core/README.md](wf/workflows/planning/specs/core/README.md) 開始（模組圖與子檔導航），世界觀在 [specs/world/README.md](wf/workflows/planning/specs/world/README.md)；契約入口 [SPEC.md](SPEC.md)。
- **程式碼**：`src/{core,content,rules,ai,sim,ui-adapter}/`、內容資料 `content/base/`、情境測試 `test/scenarios/`、schema `schemas/`——依 spec 的 architecture 逐條實作線落地，尚未落地的目錄就是還沒做。
- **舊版**：舊版 Python 專案（含 11 章教學）原樣封存在 `legacy/`，只讀、不維護。
- **工作流**：給 AI agent 的入口是 [AGENTS.md](AGENTS.md)；結構地圖 [wf/INDEX.md](wf/INDEX.md)、依意圖派發 [wf/WORKFLOWS.md](wf/WORKFLOWS.md)。

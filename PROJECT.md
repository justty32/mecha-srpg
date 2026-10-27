# PROJECT — 蝕潮獵團（工作名）：2108 地月機甲戰爭網頁文字 SRPG

## 定位

2108 年地月背景的回合制機甲戰術 SRPG，網頁呈現、無美術資源：一般網頁遊戲元件（按鈕、列表、面板、tooltip）配快捷鍵，戰場是 DOM／CSS 真方格。戰鬥走 Battle Brothers 式「機甲即裝備」：部位×層序列、多資源池、資料驅動的效果與能力；駕駛員與機魂共用人物骨架。設計契約見 [SPEC.md](SPEC.md) → [specs/core/README.md](wf/workflows/planning/specs/core/README.md)。

## 技術棧

純 TypeScript＋Vite、無框架；遊戲邏輯是純 TS、與 DOM 完全分離，可在 node 裡 headless 跑局與重播（seed＋指令序列 → 逐位元相同的事件日誌）。測試用 node 內建 test runner；DOM 與端對端見 spec 的 architecture。選型理由見 [decisions](wf/workflows/decisions.md)。

## 團隊

頂層 gpt-6-astra 規劃與決策、領導 gpt-6.1-sol 帶線、普通工 gpt-6.1-sol 實作、簡單工作 gpt-6.1-terra，配置見 [team-model](wf/workflows/team-model.md)。

## 狀態

2026-10-24：核心 spec v1 定案、世界觀提案第二版進行中；舊版 Python 專案已封存到 `legacy/`，實作從 `src/core`＋`src/content` 地基開始。

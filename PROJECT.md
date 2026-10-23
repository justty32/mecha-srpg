# PROJECT — 潮獵（工作名）：2108 地月機甲戰爭網頁文字 SRPG

## 定位

2108 年地月背景的回合制機甲戰術 SRPG，偏 MUD 的網頁文字呈現（無美術資源），戰場是真方格。戰鬥走 Battle Brothers 式「機甲即裝備」：部位×層序列、多資源池、資料驅動的效果與能力；駕駛員與機魂共用人物骨架。設計契約見 [SPEC.md](SPEC.md) → [specs/core/README.md](wf/workflows/planning/specs/core/README.md)。

## 技術棧

純 TypeScript＋Vite、無框架；遊戲邏輯是純 TS、與 DOM 完全分離，可在 node 裡 headless 跑局與重播（seed＋指令序列 → 逐位元相同的事件日誌）。測試用 node 內建 test runner；DOM 與端對端見 spec 的 architecture。選型理由見 [decisions](wf/workflows/decisions.md)。

## 團隊

頂層 Fable 規劃與決策、領導 Opus 帶線、工人 codex 實作，配置見 [team-model](wf/workflows/team-model.md)。

## 狀態

2026-10-24：核心 spec v1 定案、世界觀提案第二版進行中；舊版 Python 專案已封存到 `legacy/`，實作從 `src/core`＋`src/content` 地基開始。

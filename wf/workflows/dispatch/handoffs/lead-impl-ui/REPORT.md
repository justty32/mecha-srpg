# REPORT — lead-impl-ui（頂層代存領導匯報，2026-10-24）

STATUS：**DONE**，commit `90953e2`。網頁戰鬥畫面可玩：按鈕＋快捷鍵（鍵位 `src/ui-adapter/vm/keymap.json`），DOM／CSS 方格、可視區渲染（160×160 中位 1.8 ms），vm（純邏輯）／dom 分層。驗收（乾淨 worktree）：`npm test` 285 過、`test:dom` 39 過、`test:e2e` 3 過、`build` 248 KB、typecheck（雙 tsconfig）exit 0。

本機開：`npm run dev` → http://localhost:5173/（大地圖 `?scenario=debug-big&size=160`；換情境 `?scenario=scenario/rift-edge-nest&seed=3`）。

SPEC-GAP（最小解法）：敵方回合瞬間跑完；不能選打哪個部位；敵方面板只見層血量；層種類顯示英文 id。`vm/session.ts` 直接呼叫 rules／ai（sim 缺逐步互動 API）。

頂層決定（2026-10-24）：session 之後搬進 sim；敵方回合改逐步播放；`.gitignore` 加 `test-results/`、`playwright-report/`；請使用者試玩（記 WAIT_USER）。spec 的 MUD 殘留交 plan-spec-sync。

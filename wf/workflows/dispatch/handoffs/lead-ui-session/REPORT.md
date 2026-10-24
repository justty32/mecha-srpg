# REPORT — lead-ui-session：ui-adapter 改走 sim session，只依賴 core＋sim，全 AI 觀戰 hash 等於 runBattle

工人 [op-uis-migrate](op-uis-migrate.md)（頂層代存，2026-10-24）

STATUS：**DONE**。commit `da3820f`。一個 Claude Opus 子 agent 工人（範圍小、要跑 e2e，codex 沙箱有 `node --test` 計數與 `.git` 唯讀兩坑）。

## 做了什麼
- `src/ui-adapter/vm/session.ts` 改成 sim `BattleSession` 薄包裝，公開介面不變；推進只經 `submit`／`stepAi`；玩家知識改由 sim `trackKnowledge` 維護。
- vm `stepAi()` 仍一次跑完一台 AI 的單位回合；新增 `spectate`（全 AI 觀戰）選項。
- controller／viewmodel／presentation／dom／e2e 零改動；lead-ui-fix 九項保留。
- sim `src/sim/session.ts` 只新增 21 行：`SessionQuery`、`contentDb`／`rulesQuery` getter、`trackKnowledge(slot)`。
- 新測試 6：`vm/boundary.test.ts`（禁 ui-adapter import rules／ai，含自測樣本）、`vm/session.test.ts`（spectate 全 AI hash＝`runBattle`）、`test/sim/session.test.ts` 3 條。

## 驗證（乾淨 worktree：`63dcd6e`＋本線 6 檔）
`npm test` 378／378；check／typecheck／build exit 0（277 KB）；`test:dom` 68／68；e2e 7／7；邊界測試放回舊檔抓到 5 處違規；wf-lint exit 0。

## 行為差異（刻意對齊 sim）
AI 觀測時機改為整個單位回合結束才觀測（同 seed 敵方決策可能與舊版不同）；`advanceAi(maxSteps)` 改計成功指令數；`submit()` 回傳 `SessionSubmitResult`。

## 需要決定的事（頂層 2026-10-24 處理）
1. getter 名 `contentDb`／`rulesQuery` → 保持。
2. sim `stepAi` 回合末多回一次 null → 交下一條 sim 相關線修。
3. spec `architecture.md` 第 75 行過時 → 交下一條規劃線。
4. `spectate` 接 URL 參數 → 併入 ui-ops 線。

## 以後交接書該點名的工具
乾淨 worktree：`git worktree add --detach <scratchpad>/wt-<線> HEAD` 只複製本線檔、symlink `node_modules`；證明檢查會變紅：`git show HEAD:<舊檔>`；子 agent 寫不了 REPORT 檔時回覆附全文。

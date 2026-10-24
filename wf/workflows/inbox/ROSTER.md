# ROSTER — 誰在線上、各自是誰（身份聲明簿）

[inbox README](README.md)｜格式與 STATUS [PROTOCOL](PROTOCOL.md)

**動工前先在這裡追加自己那一格，並讀完別人的。** 不知道對方是誰，就不要假設它會做什麼、更不要替它做——猜錯的代價是兩條線寫同一份檔案。本檔同時是**通訊錄**（怎麼找到誰）和**邊界聲明**（誰可以寫哪裡）。

## 規則

1. 上線第一件事：在「現役成員」下**追加自己那格**（不要改別人的），再寄一封 `PROGRESS` 給上游（升級後佈局用 `inbox_mail.sh <我> --up PROGRESS '…'`）、正文貼上那格內容——這樣別人不必輪詢本檔也知道你上線了。
2. 收線**不要刪自己那格**，把「狀態」改成 `已收線（YYYY-MM-DD）`。歷史留著，別人才知道誰做過什麼。
3. 本檔是**快取，可能不全**。沒列到的對象問使用者，或直接去對方資料夾確認它有 `inbox/`、收什麼信——**權威永遠是對方資料夾自己**。
4. 已收線的格子堆多了就整段封存（照 [STRUCTURE](../../STRUCTURE.md) 的 archive 規則）；已收線的線不要再回填本檔，封存與整理歸調度者。

**地址規則**：inbox 路徑是**機器本地的**，換一台機器就不一樣，**每台機器各自維護這份簿子**。若所有對象都掛在同一個共同 root 底下，改成寫**相對那個 root 的路徑**，並在本檔頂端寫明 root 怎麼定（例：`$REPOS/`），換機只改 root 一處。

## 格式

```markdown
### `<名字>`
- **狀態**：現役 / 已收線（YYYY-MM-DD）
- **我是誰**：一句話。調度者、主線、子線，還是一次性的子 agent。
- **團隊**：`teams/<團隊名>`，或「無」。決定我的終局回報會被路由到哪一格。
- **上游**：我對誰回報（**有團隊就是該團隊 `members` 的第一行；沒團隊就是頂層**）。
- **領地**：我可寫哪些路徑（其他人別碰）。
- **答得出什麼**：別人可以拿什麼問題來問我。
- **答不出什麼**：明講邊界，省得別人白等。
- **怎麼找我**：我的 inbox 路徑。
- **訂閱主題**：列出你用 --topics 在追的 topics/<主題名>；沒訂閱就寫「無」。自己的團隊信箱會被自動發現，不必列在這裡。
```

## 現役成員

### `dispatcher`
- **狀態**：現役
- **我是誰**：頂層，主 session（**Fable 5.1**）。只跟使用者溝通、做最終決策、分配資源與授權；不實作、不逐則讀信。
- **團隊**：無
- **上游**：使用者本人
- **領地**：repo 根的整合點（`AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore`、頂層 `SPEC.md`／`PROJECT.md`／`README.md`）與 `wf/`
- **答得出什麼**：優先序、資源與授權（含要不要 push、刪檔）、範圍裁定
- **答不出什麼**：實作細節（問該線的領導或 REPORT）
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/new/`（`inbox_mail.sh <我> --up …` 或 `--to dispatcher`）
- **訂閱主題**：無

（現役：dispatcher 與下列 `lead-codex-pilot` 代登記的工人格；已收線成員原格見 `archive/`。）

### `cx-pilot-iron`
- **狀態**：已收線（領導 `lead-codex-pilot` 代登記，2026-10-24；交接書與 REPORT 在 `wf/workflows/dispatch/handoffs/lead-codex-pilot/`）
- **我是誰**：codex 工人，`lead-codex-pilot` 底下：通用系列鐵劍（batch pilot-mech-02，新增模式）。
- **團隊**：`teams/codex-pilot`
- **上游**：`lead-codex-pilot`
- **領地**：只在隔離 worktree `scratchpad/codex-pilot/wt-pilot-mech-02` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-codex-pilot/cx-pilot-iron.md`）
- **答得出什麼**：本批內容細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-pilot-iron.md`
- **訂閱主題**：無

### `lead-tune`
- **狀態**：現役（2026-10-24）
- **我是誰**：Opus 領導，engine-backlog P1 戰鬥／營運後期調校（玩家首輪撤退、anchored、出戰數減半、`part:undefined`）。
- **團隊**：`teams/tune`（第一行）
- **上游**：dispatcher（行程內 Agent tool 回傳）
- **領地**：見 `wf/workflows/dispatch/CLAIMS.md` 的 lead-tune 列（`src/ai/`、`src/rules/effects.ts`、平衡數值）
- **答得出什麼**：AI 意圖／撤退、平衡量測工具（`handoffs/lead-tune/tools/`）
- **答不出什麼**：`src/ops/` 方格地圖（lead-grid）
- **怎麼找我**：`wf/inbox/teams/tune/`、`wf/inbox/mail/lead-tune/`
- **訂閱主題**：無

### `cx-tune-part`
- **狀態**：現役（領導 `lead-tune` 代登記，2026-10-24）
- **我是誰**：codex 工人：`src/rules/effects.ts` 去除 `part: undefined`。
- **團隊**：`teams/tune`
- **上游**：`lead-tune`
- **領地**：只在 worktree `scratchpad/wt-part` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-tune/cx-tune-part.md`）
- **答得出什麼**：本件細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-tune-part.md`
- **訂閱主題**：無

### `lead-content`
- **狀態**：現役（2026-10-24）
- **我是誰**：Opus 領導，codex 新增內容批次（人類對手機體、營運事件與對話、各勢力 lore、第三刃／背面 lore）。
- **團隊**：`teams/lead-content`（第一行）
- **上游**：dispatcher（行程內 Agent tool 回傳）
- **領地**：見 `wf/workflows/dispatch/CLAIMS.md` 的 lead-content 列（只新增 content 檔）
- **答得出什麼**：各批 manifest、進度、驗收結果
- **答不出什麼**：既有檔改名（lead-rename）、引擎
- **怎麼找我**：`wf/inbox/teams/lead-content/`、`wf/inbox/mail/lead-content/`
- **訂閱主題**：無

### `cx-lc-mech`
- **狀態**：現役（領導 `lead-content` 代登記，2026-10-24）
- **我是誰**：codex 工人：人類對手機體與配裝（batch lc-mech-01，新增模式）。
- **團隊**：`teams/lead-content`
- **上游**：`lead-content`
- **領地**：只在隔離 worktree `scratchpad/lc/wt-lc-mech-01` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-content/cx-lc-mech.md`）
- **答得出什麼**：本批內容細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-lc-mech.md`
- **訂閱主題**：無

### `cx-lc-ops`
- **狀態**：現役（領導 `lead-content` 代登記，2026-10-24）
- **我是誰**：codex 工人：營運事件與對話（batch lc-ops-01，新增模式）。
- **團隊**：`teams/lead-content`
- **上游**：`lead-content`
- **領地**：只在隔離 worktree `scratchpad/lc/wt-lc-ops-01` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-content/cx-lc-ops.md`）
- **答得出什麼**：本批內容細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-lc-ops.md`
- **訂閱主題**：無

### `cx-lc-lore`
- **狀態**：現役（領導 `lead-content` 代登記，2026-10-24）
- **我是誰**：codex 工人：各勢力 lore（batch lc-lore-01，新增模式）。
- **團隊**：`teams/lead-content`
- **上游**：`lead-content`
- **領地**：只在隔離 worktree `scratchpad/lc/wt-lc-lore-01` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-content/cx-lc-lore.md`）
- **答得出什麼**：本批內容細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-lc-lore.md`
- **訂閱主題**：無

### `cx-lc-lore2`
- **狀態**：現役（領導 `lead-content` 代登記，2026-10-24）
- **我是誰**：codex 工人：第三刃／背面 lore（batch lc-lore-02，新增模式）。
- **團隊**：`teams/lead-content`
- **上游**：`lead-content`
- **領地**：只在隔離 worktree `scratchpad/lc/wt-lc-lore-02` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-content/cx-lc-lore2.md`）
- **答得出什麼**：本批內容細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-lc-lore2.md`
- **訂閱主題**：無

### `cx-tune-intent`
- **狀態**：現役（領導 `lead-tune` 代登記，2026-10-24）
- **我是誰**：codex 工人：營運玩家首輪撤退根因與 `src/ai/` 修正。
- **團隊**：`teams/tune`
- **上游**：`lead-tune`
- **領地**：只在 worktree `scratchpad/wt-intent` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-tune/cx-tune-intent.md`）
- **答得出什麼**：本件細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-tune-intent.md`
- **訂閱主題**：無

### `cx-grid-core`
- **狀態**：現役（領導 `lead-grid` 代登記，2026-10-24；交接書 `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-core.md`）
- **我是誰**：codex 工人，`lead-grid` 底下：方格大地圖 grid 核心、載入器新資料夾、check 驗證、40×40 測試圖。
- **團隊**：`teams/grid`
- **上游**：`lead-grid`
- **領地**：見交接書「範圍」
- **答得出什麼**：grid.ts 介面與測試
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-grid-core.md`
- **訂閱主題**：無

### `cx-grid-maps`
- **狀態**：現役（領導 `lead-grid` 代登記，2026-10-24；交接書 `wf/workflows/dispatch/handoffs/lead-grid/cx-grid-maps.md`）
- **我是誰**：codex 工人，`lead-grid` 底下：大地圖產生器與長陸／靜海面樣本內容（暫存區）。
- **團隊**：`teams/grid`
- **上游**：`lead-grid`
- **領地**：見交接書「範圍」
- **答得出什麼**：產生器用法、樣本圖內容
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-grid-maps.md`
- **訂閱主題**：無

### `cx-tune-human`
- **狀態**：現役（領導 `lead-tune` 代登記，2026-10-24）
- **我是誰**：codex 工人：六份人類遭遇編成下修（平衡）。
- **團隊**：`teams/tune`
- **上游**：`lead-tune`
- **領地**：只在 worktree `scratchpad/wt-human` 內寫（細節見 `wf/workflows/dispatch/handoffs/lead-tune/cx-tune-human.md`）
- **答得出什麼**：本件細節
- **答不出什麼**：別線領地
- **怎麼找我**：`wf/inbox/orders/cx-tune-human.md`
- **訂閱主題**：無

### `lead-rename`
- **狀態**：現役（2026-10-24）
- **我是誰**：Opus 領導：全庫用語改名＋翻譯腔重審（codex-batches 第 1 批）。
- **團隊**：`teams/lead-rename`（成員 `cx-rn-01`…`cx-rn-17`，各一批 polish，交接書 `wf/workflows/dispatch/handoffs/lead-rename/cx-rn-NN.md`，只在隔離 worktree `scratchpad/rename/wt-rename-NN` 內寫；領導代登記，不逐格列）
- **領地**：見 CLAIMS 的 lead-rename 列
- **怎麼找我**：`wf/inbox/teams/lead-rename/`、`wf/inbox/mail/lead-rename/`

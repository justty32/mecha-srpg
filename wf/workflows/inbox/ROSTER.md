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

（目前除 dispatcher 外無現役成員；已收線成員原格見 archive/。）

### `cx-mcp-core`
- **狀態**：已收線（2026-10-24）（領導 `lead-mcp` 代登記）
- **我是誰**：codex 工人，`lead-mcp` 底下。
- **團隊**：`teams/mcp`
- **上游**：`lead-mcp`
- **領地**：`src/mcp/` 新檔（`tool.ts`、`campaign*.ts`、`ui.ts` 除外）
- **答得出什麼**：MCP 協定層、戰鬥工具、cli
- **答不出什麼**：營運層內部、別的 MCP 工具模組
- **怎麼找我**：`wf/inbox/orders/cx-mcp-core.md`
- **訂閱主題**：無

### `cx-mcp-ops`
- **狀態**：已收線（2026-10-24）（領導 `lead-mcp` 代登記）
- **我是誰**：codex 工人，`lead-mcp` 底下。
- **團隊**：`teams/mcp`
- **上游**：`lead-mcp`
- **領地**：`src/mcp/campaign.ts`、`campaign-view.ts`、`campaign.test.ts`
- **答得出什麼**：營運 MCP 工具
- **答不出什麼**：營運層內部、別的 MCP 工具模組
- **怎麼找我**：`wf/inbox/orders/cx-mcp-ops.md`
- **訂閱主題**：無

### `cx-bio`
- **狀態**：已收線（2026-10-24，領導 `lead-ops-bio-balance` 代登記）
- **我是誰**：codex 工人，生物系改寫（拘束艙／BeastState／devour／四種 job／命名）
- **團隊**：`teams/bio-balance`
- **上游**：`lead-ops-bio-balance`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bio.md`「範圍」
- **答得出什麼**：ops 生物系實作細節
- **答不出什麼**：平衡數字、UI
- **怎麼找我**：`wf/inbox/orders/cx-bio.md`
- **訂閱主題**：無

### `cx-bal`
- **狀態**：已收線（2026-10-24，領導 `lead-ops-bio-balance` 代登記）
- **我是誰**：codex 工人，補彈＋營運平衡（在 git worktree 裡做）
- **團隊**：`teams/bio-balance`
- **上游**：`lead-ops-bio-balance`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal.md`「範圍」
- **答得出什麼**：補彈、平衡量測數字
- **答不出什麼**：生物系、UI
- **怎麼找我**：`wf/inbox/orders/cx-bal.md`
- **訂閱主題**：無

### `cx-bal2`
- **狀態**：已收線（2026-10-24，領導 `lead-ops-bio-balance` 代登記）
- **我是誰**：codex 工人，營運平衡第二輪（敗因診斷＋合理數值）
- **團隊**：`teams/bio-balance`
- **上游**：`lead-ops-bio-balance`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal2.md`「範圍」
- **答得出什麼**：greedy 戰役敗因、平衡數字
- **答不出什麼**：生物系、UI
- **怎麼找我**：`wf/inbox/orders/cx-bal2.md`
- **訂閱主題**：無

### `cx-bat-field`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人，戰場地形＋地形效果＋地圖
- **團隊**：`teams/content-battle`
- **上游**：`lead-content-battle`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field.md`「範圍」
- **答得出什麼**：新地形與地圖的內容、地圖產生腳本
- **答不出什麼**：情境、單位
- **怎麼找我**：`wf/inbox/orders/cx-bat-field.md`
- **訂閱主題**：無

### `cx-bat-scen-a`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人，戰鬥情境 8 個（a 組）
- **團隊**：`teams/content-battle`
- **上游**：`lead-content-battle`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-a.md`「範圍」
- **答得出什麼**：本組情境的配置與 measure 結果
- **答不出什麼**：地形、地圖、單位
- **怎麼找我**：`wf/inbox/orders/cx-bat-scen-a.md`
- **訂閱主題**：無

### `cx-bat-scen-b`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人，戰鬥情境 8 個（b 組）
- **團隊**：`teams/content-battle`
- **上游**：`lead-content-battle`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-b.md`「範圍」
- **答得出什麼**：本組情境的配置與 measure 結果
- **答不出什麼**：地形、地圖、單位
- **怎麼找我**：`wf/inbox/orders/cx-bat-scen-b.md`
- **訂閱主題**：無

### `cx-wiki-*`（7 條：index、md、cards、dom、shell、lore、polish）
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人，網頁百科各模組；領導 `lead-wiki` 代登記
- **團隊**：`teams/lead-wiki`（已收）
- **上游**：`lead-wiki`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-*.md`「範圍」
- **答得出什麼**：見各自 REPORT
- **答不出什麼**：戰鬥邏輯、營運
- **怎麼找我**：已收線，看 REPORT
- **訂閱主題**：無

### `cx-uops-vm`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人，營運畫面 vm（OpsController → OpsSnapshot）
- **團隊**：`teams/ui-ops`
- **上游**：`lead-ui-ops`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-ui-ops/cx-uops-vm.md`「範圍」
- **答得出什麼**：營運 vm 的快照、按鈕、快捷鍵、出戰銜接
- **答不出什麼**：DOM、ops 規則
- **怎麼找我**：`wf/inbox/orders/cx-uops-vm.md`
- **訂閱主題**：無

### `cx-bat-scen-c`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人，用新單位的戰鬥情境 6 個（c 組）
- **團隊**：`teams/content-battle`
- **上游**：`lead-content-battle`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-c.md`「範圍」
- **答得出什麼**：本組情境的配置與 measure 結果
- **答不出什麼**：地形、地圖、單位
- **怎麼找我**：`wf/inbox/orders/cx-bat-scen-c.md`
- **訂閱主題**：無

### `cx-world-ev-a`
- **狀態**：已收線（2026-10-24）（領導 `lead-content-world` 代登記）
- **我是誰**：codex 工人，營運事件 A 組（船上日常、人員衝突、機魂異常、拘束艙／掙脫變體）
- **團隊**：`teams/content-world`
- **上游**：`lead-content-world`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-world/cx-world-ev-a.md`「範圍」
- **答得出什麼**：本組內容檔細節
- **答不出什麼**：引擎、平衡量測
- **怎麼找我**：`wf/inbox/orders/cx-world-ev-a.md`
- **訂閱主題**：無

### `cx-world-ev-b`
- **狀態**：已收線（2026-10-24）（領導 `lead-content-world` 代登記）
- **我是誰**：codex 工人，營運事件 B 組（勢力消息、傭兵圈八卦、遺跡傳聞、航路與港口）
- **團隊**：`teams/content-world`
- **上游**：`lead-content-world`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-world/cx-world-ev-b.md`「範圍」
- **答得出什麼**：本組內容檔細節
- **答不出什麼**：引擎、平衡量測
- **怎麼找我**：`wf/inbox/orders/cx-world-ev-b.md`
- **訂閱主題**：無

### `cx-world-data`
- **狀態**：已收線（2026-10-24）（領導 `lead-content-world` 代登記）
- **我是誰**：codex 工人，營運資料（encounters、contracts、names、research、markets、recruit-pools）
- **團隊**：`teams/content-world`
- **上游**：`lead-content-world`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-world/cx-world-data.md`「範圍」
- **答得出什麼**：本組內容檔細節
- **答不出什麼**：引擎、平衡量測
- **怎麼找我**：`wf/inbox/orders/cx-world-data.md`
- **訂閱主題**：無

### `cx-world-dlg`
- **狀態**：已收線（2026-10-24）（領導 `lead-content-world` 代登記）
- **我是誰**：codex 工人，營運人物資料（dialogues、backgrounds）
- **團隊**：`teams/content-world`
- **上游**：`lead-content-world`
- **領地**：見 `wf/workflows/dispatch/handoffs/lead-content-world/cx-world-dlg.md`「範圍」
- **答得出什麼**：本組內容檔細節
- **答不出什麼**：引擎、平衡量測
- **怎麼找我**：`wf/inbox/orders/cx-world-dlg.md`
- **訂閱主題**：無

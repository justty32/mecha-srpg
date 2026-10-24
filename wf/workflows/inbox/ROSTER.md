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

### `lead-impl-ai`
- **狀態**：已收線（2026-10-24）
- **我是誰**：Opus 領導線（Claude 子 agent，頂層用 Agent tool 派出）；AI 層（spec 切線 6）：`src/ai/`、`test/ai/`。
- **團隊**：`teams/ai`（領導；codex 工人格由我代登記於此）
- **上游**：dispatcher（行程內回傳，不走 inbox）
- **領地**：`src/ai/`、`test/ai/`、`package.json`（只 scripts）、`wf/workflows/dispatch/handoffs/lead-impl-ai/`
- **答得出什麼**：`RulesQuery` 介面、Policy 登記、FactionKnowledge 更新規則
- **答不出什麼**：rules／sim／ui 實作
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/lead-impl-ai/`
- **訂閱主題**：無

### `cx-ai-knowledge-score`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ai/{knowledge,danger,score}.ts`＋`test/ai/stub-rules.ts`＋測試。
- **團隊**：`teams/ai`
- **上游**：lead-impl-ai
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-knowledge-score.md` 列的檔
- **答得出什麼**：本線檔案的實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ai-knowledge-score/`
- **訂閱主題**：無

### `cx-ai-policies`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ai/{strategy,agent,index}.ts`＋`src/ai/policies/` 六檔＋測試。
- **團隊**：`teams/ai`
- **上游**：lead-impl-ai
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-policies.md` 列的檔
- **答得出什麼**：本線檔案的實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ai-policies/`
- **訂閱主題**：無

### `lead-impl-sim`
- **狀態**：已收線（2026-10-24）
- **我是誰**：Opus 領導線（Claude 子 agent）；整合＋模擬器（spec 切線 7）。
- **團隊**：`teams/sim`（領導；工人格由我代登記）
- **上游**：頂層主 session
- **領地**：見 CLAIMS `lead-impl-sim` 列
- **答得出什麼**：sim 介面、三個整合缺口的裁定（`handoffs/lead-impl-sim/contract.md`）
- **答不出什麼**：營運層、UI
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/lead-impl-sim/`
- **訂閱主題**：無

### `cx-sim-engine`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/sim/` 與 `test/sim/`。
- **團隊**：`teams/sim`
- **上游**：lead-impl-sim
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-engine.md` 列的檔
- **答得出什麼**：sim 實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-sim-engine/`
- **訂閱主題**：無

### `cx-sim-gaps`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），補本能控制、常數回 base、pack-hunter。
- **團隊**：`teams/sim`
- **上游**：lead-impl-sim
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-gaps.md` 列的檔
- **答得出什麼**：三個缺口的實作與黃金 diff
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-sim-gaps/`
- **訂閱主題**：無

### `lead-impl-ops`
- **狀態**：已收線（2026-10-24）
- **我是誰**：Opus 領導線（Claude 子 agent）；營運層 `src/ops/` 實作。
- **團隊**：`teams/ops`（領導；工人格由我代登記）
- **上游**：dispatcher
- **領地**：見 CLAIMS `lead-impl-ops` 列
- **答得出什麼**：ops 佈局與慣例（`handoffs/lead-impl-ops/contract.md`）
- **答不出什麼**：戰鬥規則、sim、UI
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/lead-impl-ops/`
- **訂閱主題**：無

### `cx-ops-foundation`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ops/state`、`src/ops/content`、`content/base/world/`。
- **團隊**：`teams/ops`
- **上游**：lead-impl-ops
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation.md` 列的檔
- **答得出什麼**：ops 型別、帳本、載入器
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ops-foundation/`
- **訂閱主題**：無

### `cx-ops-world`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ops/world`、`src/ops/contracts`。
- **團隊**：`teams/ops`
- **上游**：lead-impl-ops
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-world.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ops-world/`
- **訂閱主題**：無

### `cx-ops-crew`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ops/crew`。
- **團隊**：`teams/ops`
- **上游**：lead-impl-ops
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-crew.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ops-crew/`
- **訂閱主題**：無

### `cx-ops-text`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ops/text`（無 DOM）。
- **團隊**：`teams/ops`
- **上游**：lead-impl-ops
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-text.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ops-text/`
- **訂閱主題**：無

### `cx-ops-sortie`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ops/sortie`。
- **團隊**：`teams/ops`
- **上游**：lead-impl-ops
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-sortie.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ops-sortie/`
- **訂閱主題**：無

### `cx-ops-time`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ops/time`、`src/ops/sim`。
- **團隊**：`teams/ops`
- **上游**：lead-impl-ops
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-time.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ops-time/`
- **訂閱主題**：無

已收線成員封存於 [archive/ROSTER-2026-10-23.md](archive/ROSTER-2026-10-23.md)、[archive/ROSTER-2026-10-24.md](archive/ROSTER-2026-10-24.md)。

### `lead-impl-ui`
- **狀態**：現役
- **我是誰**：Opus 領導線（Claude 子 agent）；ui-adapter 與網頁殼（戰鬥畫面先）。
- **團隊**：`teams/ui`（領導；工人格由我代登記）
- **上游**：dispatcher
- **領地**：見 CLAIMS `lead-impl-ui` 列
- **答得出什麼**：ViewModel／DOM 契約（`src/ui-adapter/vm/types.ts`、`handoffs/lead-impl-ui/contract.md`）
- **答不出什麼**：規則、sim、ops 邏輯
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/lead-impl-ui/`
- **訂閱主題**：無

### `cx-ui-vm`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ui-adapter/vm/`（ViewModel、controller、keymap、事件文字）。
- **團隊**：`teams/ui`
- **上游**：lead-impl-ui
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-vm.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ui-vm/`
- **訂閱主題**：無

### `cx-ui-dom`
- **狀態**：已收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/ui-adapter/dom/`（DOM 渲染、CSS、happy-dom 測試）。
- **團隊**：`teams/ui`
- **上游**：lead-impl-ui
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-dom.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-ui-dom/`
- **訂閱主題**：無

### `lead-fix-scenario-ai`
- **狀態**：收線（2026-10-24）
- **我是誰**：Opus 領導線（Claude 子 agent）；情境接縫修正＋AI 平衡第一輪。
- **團隊**：`teams/fix`（領導；工人格由我代登記）
- **上游**：dispatcher
- **領地**：見 CLAIMS `lead-fix-scenario-ai` 列
- **答得出什麼**：slot 同盟、killTarget 目標翻譯、globals／feature hp、tactical 係數
- **答不出什麼**：ops、ui
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/lead-fix-scenario-ai/`
- **訂閱主題**：無

### `cx-fix-seams`
- **狀態**：收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），修 rules／sim 的情境接縫。
- **團隊**：`teams/fix`
- **上游**：lead-fix-scenario-ai
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-seams.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-fix-seams/`
- **訂閱主題**：無

### `cx-fix-ai`
- **狀態**：收線（2026-10-24）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），調 tactical AI 係數與 AI 敵我判斷。
- **團隊**：`teams/fix`
- **上游**：lead-fix-scenario-ai
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-ai.md` 列的檔
- **答得出什麼**：本線實作細節
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-fix-ai/`
- **訂閱主題**：無

### `cx-uifix-vm`／`cx-uifix-dom`
- **狀態**：現役（2026-10-24）；codex 工人（gpt-6-astra），`teams/uifix`，上游 lead-ui-fix；領地見各自交接書 `handoffs/lead-ui-fix/<線名>.md`；信箱 `wf/inbox/mail/<線名>/`

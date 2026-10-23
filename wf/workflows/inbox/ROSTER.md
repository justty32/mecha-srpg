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

### `lead-legacy-archive`
- **狀態**：已收線（2026-10-23）
- **我是誰**：Opus 領導線（Claude 子 agent，頂層用 Agent tool 派出）；把舊版 Python 專案封存進 `legacy/`，專案根與 wf 文件改指向網頁版 spec。
- **團隊**：無（不開工人）
- **上游**：dispatcher（行程內回傳，不走 inbox）
- **領地**：`legacy/`、根 `SPEC.md`／`PROJECT.md`／`README.md`、`AGENTS.md`、`.claude/commands/`、交接書列的 wf 文件、`wf/workflows/dispatch/handoffs/lead-legacy-archive/`
- **答得出什麼**：舊檔搬到哪、哪些 wf 文件改了舊棧說法
- **答不出什麼**：新程式碼、spec 內容
- **怎麼找我**：無 inbox（行程內）
- **訂閱主題**：無

### `lead-impl-foundation`
- **狀態**：已收線（2026-10-23）
- **我是誰**：Opus 領導線（Claude 子 agent，頂層用 Agent tool 派出）；TS 地基（spec 切線 1＋2）：core 型別／RNG／NumExpr／事件日誌＋content 載入器與第一批資料。
- **團隊**：`teams/foundation`（領導；工人 `cx-core`、`cx-content`，codex 沙箱寫不到本檔，由我代登記於此）
- **上游**：dispatcher（行程內回傳，不走 inbox）
- **領地**：根 `package.json`／`tsconfig.json`／`.nvmrc`、`src/core/`、`src/content/`、`schemas/`、`scripts/`、`content/base/`、`test/`、`wf/workflows/dispatch/handoffs/lead-impl-foundation/`
- **答得出什麼**：core／content 的匯出介面、型別、loader 行為
- **答不出什麼**：rules／ai／sim／ui（後續切線）
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/lead-impl-foundation/`
- **訂閱主題**：無

### `cx-core`
- **狀態**：已收線（2026-10-23）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/core/{rng,numexpr,eventlog}.ts`＋三支測試。
- **團隊**：`teams/foundation`
- **上游**：lead-impl-foundation
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-core.md` 列的檔
- **答得出什麼**：PCG32、NumExpr 求值、事件日誌與 hash
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-core/`
- **訂閱主題**：無

### `cx-content`
- **狀態**：已收線（2026-10-23）
- **我是誰**：codex 工人（gpt-6-astra，`codex exec`），寫 `src/content/`、`schemas/`、`content/base/`。
- **團隊**：`teams/foundation`
- **上游**：lead-impl-foundation
- **領地**：交接書 `wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-content.md` 列的檔
- **答得出什麼**：內容載入、schema 驗證、base 內容包
- **答不出什麼**：其他
- **怎麼找我**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/mail/cx-content/`
- **訂閱主題**：無

已收線成員封存於 [archive/ROSTER-2026-10-23.md](archive/ROSTER-2026-10-23.md)。

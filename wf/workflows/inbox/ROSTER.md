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

### `lead-grid` 與工人 `cx-grid-*`
- 領導 `lead-grid`（Opus）代登記，團隊 `teams/grid`，交接書在 `wf/workflows/dispatch/handoffs/lead-grid/`。已收線：core、maps、migrate、blight、ui、actors、verify、verify2（原格見 `archive/ROSTER-2026-10-24-grid.md`）；現役：`cx-grid-terms`（舊詞顯示字串，orders `wf/inbox/orders/cx-grid-terms.md`）。

### `lead-reconcile` 與工人 `cx-rc-*`
- **狀態**：已收線（2026-10-24）；團隊 `teams/rc` 已關（`wf/inbox/done/2026-10-24/teams/rc/`）；交接書與各批 REPORT 在 `wf/workflows/dispatch/handoffs/lead-reconcile/`。

### `lead-tune` 與工人 `cx-tune-{part,intent,human,anchor,scen,multi}`
- **狀態**：已收線（2026-10-24）；Opus 領導＋六條 codex 工人，團隊 `teams/tune` 已關（紀錄在 `wf/inbox/done/2026-10-24/teams/tune/`）；交接書與 REPORT 在 `wf/workflows/dispatch/handoffs/lead-tune/`。

### `lead-world-land` 與工人 `cx-wl-01`…`cx-wl-09`
- **狀態**：已收線（2026-10-24）；團隊 `teams/wl` 已關（紀錄在 `wf/inbox/done/2026-10-24/teams/wl/`）；交接書與 REPORT 在 `wf/workflows/dispatch/handoffs/lead-world-land/`。
- **我是誰**：talk-world 裁示落地；工人是 codex polish 批次（lore／base 文字欄）。
- **團隊**：`teams/wl`；**上游**：`lead-world-land`（頂層之下）
- **怎麼找我**：`wf/inbox/orders/<線名>.md`

### `lead-history-lines` 與工人 `cx-hl-map`、`cx-hl-ad`、`cx-hl-eh`、`cx-hl-tide`
- **狀態**：已收線（2026-10-24）；團隊 `teams/hl` 已關（`wf/inbox/done/2026-10-24/teams/hl/`）；交接書與工人 REPORT 在 `wf/workflows/dispatch/handoffs/lead-history-lines/`。
- **我是誰**：八條長線、十節點、年表掛線、潮差表（design-notes/world/history-lines、tide-range）。
- **團隊**：`teams/hl`；**上游**：`lead-history-lines`（頂層之下）

### `lead-settle`（含代登記工人 `cx-st-01`／`cx-st-02`／`cx-st-spec`／`cx-st-lines`）
- **狀態**：已收線（2026-10-24）；團隊 `teams/st` 已關（`wf/inbox/done/2026-10-24/teams/st/`）；交接書與工人 REPORT 在 `wf/workflows/dispatch/handoffs/lead-settle/`
- **我是誰**：Opus 領導：數字 v2 定案、暫定題改已定、九項 lore 矛盾；工人是 codex。
- **團隊**：`teams/st`；**上游**：`dispatcher`（工人的上游是 `lead-settle`）
- **領地**：CLAIMS「lead-settle」列；工人照各自交接書（`handoffs/lead-settle/`）
- **怎麼找我**：行程內；工人 `wf/inbox/orders/<線名>.md`；**訂閱主題**：無

### `lead-pilot-essence` 與工人 `cx-pe-scan`
- **狀態**：已收線（2026-10-24）；A 無人化／B 精粹改人改為待 Fable 討論；團隊 `teams/pe` 已關，交接書與盤點在 `wf/workflows/dispatch/handoffs/lead-pilot-essence/`。

### `lead-polish`（含代登記工人 `cx-dl-01`～`cx-dl-05`）
- **狀態**：已收線（2026-10-25）；REPORT 在 `wf/workflows/dispatch/handoffs/lead-polish/REPORT.md`
- **我是誰**：Opus 領導：B5 翻譯腔重審三批 polish（lore 敘述欄）；工人是 codex。
- **上游**：`dispatcher`（工人的上游是 `lead-polish`）
- **領地**：CLAIMS「lead-polish」列；工人照各自交接書（`handoffs/lead-decide-land/b5/cx-dl-0N.md`）
- **怎麼找我**：行程內；工人 `wf/inbox/orders/<線名>.md`；**訂閱主題**：無

### `lead-cockpit`（含代登記工人 `cx-cockpit-core`／`cx-cockpit-growth`）
- **狀態**：已收線（2026-10-25）；engine-backlog 30／35／46／47／48／49 落地；團隊 `teams/cockpit` 已關
- **我是誰**：Opus 領導：engine-backlog 30（機甲核心與座艙）與 47／48／49；工人是 codex。
- **團隊**：`teams/cockpit`
- **上游**：`dispatcher`（工人的上游是 `lead-cockpit`）
- **領地**：CLAIMS「lead-cockpit」列；工人照各自交接書（`handoffs/lead-cockpit/cx-cockpit-*.md`）
- **怎麼找我**：行程內；工人 `wf/inbox/orders/<線名>.md`；**訂閱主題**：無

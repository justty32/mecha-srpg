# 任務：評估網頁技術棧能否承載「純文字＋方格戰場」的機甲 SRPG，交出有實證的選型建議

> 你是 Opus **領導**線 `lead-techstack`，由頂層（主 session Fable）用 Agent tool 派出。你自己拆工、派 codex 工人、監看、驗收、收線，最後向頂層回傳。派線規則見 `wf/workflows/dispatch/README.md`，工具見 `wf/workflows/dispatch/tool-index.md`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/planning/design-notes.md`——**親自讀，不靠本交接書的摘要**。

## 背景與唯一目標

專案要從 Python＋tcod 桌面版**重做成網頁遊戲**：無美術資源、純文字（偏 MUD），但要有 SRPG 機甲戰場，地圖用**真正的方格**（DOM／CSS 畫，不是字元格）。使用者說技術棧隨意，網頁不好用就改 Godot-mono（只准 headless）。唯一目標：**交出一份有實測證據的技術棧選型報告**，讓頂層與使用者能在「網頁方案 A／B／…」與「Godot headless」之間拍板。你不做架構設計、不定資料模型——那是頂層（Fable）寫 spec 的事；你只回答「哪個棧做得到、代價多少、怎麼 headless 測」。

硬條件（來自 design-notes，評估每個方案時逐條對）：一場戰鬥不限機甲數量、地圖有大有小（渲染與狀態更新不能假設小隊上限，請以 200 單位、120×120 格做壓力基準）；全程 agent 開發、**agent 必須能 headless 跑並驗證 UI 與邏輯**，沒有人會看螢幕；要方便新增機甲／部件／駕駛員／地形資料；要有 AI；戰鬥之外有營運層（頁面式／選單式文字介面）；不碰鍵鼠螢幕、不開 GUI 視窗。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 候選方案比較矩陣（至少含：純 TypeScript＋Vite 無框架、一個輕量元件框架如 Svelte 或 Lit、Godot-mono headless 三類；可再加一個你認為值得的）；(2) 每個網頁候選一個**最小 spike**：渲染 120×120 方格、放 200 個單位、點選一格顯示資訊、一次「回合」更新全部單位位置，量測首次渲染與一次更新的毫秒數；(3) 每個候選的 **headless 驗證路徑**實測（例：node 內建 test runner＋jsdom／happy-dom、Playwright headless Chromium 能不能在這台機器裝起來跑起來、Godot `--headless` 跑場景與斷言），要有真的跑過的輸出；(4) 盤點本機現況（node 24、pnpm、godot-mono 4.7.2、有無瀏覽器可 headless）；(5) 參考 `/home/lorkhan/repo/game_dev/gd_libs` 的 Godot headless 經驗（唯讀）。
- 不做：遊戲邏輯、資料模型、AI、營運層的實作；美術；多人／後端／存檔同步；專案內任何既有檔案的修改；套件的全域安裝。
- 件數 gate：候選方案超過 5 個就停下回報；容量 gate：spike 目錄（含 node_modules）總量超過 1.5 GB 就停下回報。任一觸發都停。
- 時間 gate：從開工起 **120 分鐘**內收線；到時沒做完的寫進「沒做到」，不要硬撐。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工先 `create techstack lead-techstack`；之後 `add` 每條 codex 工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派 codex 工人做 spike；`-C` 指該工人在 /tmp/lead-techstack-spike/ 下的子目錄，`--add-dir` 加它的 REPORT 目錄與 `wf/inbox` |
| `wf/tools/inbox_poll.sh lead-techstack --wait --timeout 540` | 前景等工人回報；逾時再跑一輪 |
| `python3 wf/tools/brief_lint.py` | 每份子線交接書送出前 `--strict` 要 0 違規 |
| `wf/tools/inbox_ack.sh` | 收到終局信後歸檔並記一行 STATE |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完 REPORT 與附件後跑，要 exit 0 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT 與 `wf/workflows/dispatch/handoffs/lead-techstack/` 底下的附件（含子線交接書 `wf/workflows/dispatch/handoffs/lead-techstack/cx-*.md` 與其 REPORT）；spike 程式碼與 `node_modules` 一律放 `/tmp/lead-techstack-spike/`，**不進專案**。另外授權：**可以在 `/tmp/lead-techstack-spike/` 內 `npm install`／`pnpm add`、可下載 Playwright 瀏覽器到該目錄或其預設快取**（這是本線唯一的安裝授權，不得全域安裝、不得動專案的 `package.json`）；codex 工人用 `-s workspace-write`、`-C` 指它的 spike 子目錄。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖到使用者螢幕、不搶焦點）；不開 GUI 視窗（瀏覽器只准 headless，Godot 只准 `--headless`）；**不 push、不建分支、不 rebase／reset 別人的 commit**；本線**不 commit**（頂層收線時統一 commit）；不 `rm -rf`（暫存搬 `/tmp/lead-techstack-trash/`）；不改 `~/.codex/config.toml`；不碰 `.gitignore`；不改專案內任何既有檔（ROSTER 自己那格與領地表自己那格除外）；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 **4 條 codex 工人**＋**2 個 Claude 子 agent**（查資料用），只准為推進正事開。

**分清錯誤來源**：工具或環境出錯（指令不存在、沙箱拒寫、瀏覽器裝不起來）→ 這本身就是評估結果，記進矩陣，不算阻塞；超過 10 分鐘無法推進任何候選 → 發 `BLOCKED`。

## 工作

1. 讀完「先讀」清單；在 `wf/workflows/inbox/ROSTER.md` 追加自己那格；`inbox_team.sh create techstack lead-techstack`。
2. 盤點本機（node／pnpm／godot-mono 版本、有無 chromium／chrome／firefox 可 headless、磁碟空間），寫進 REPORT 第一段。
3. 定候選清單（3–5 個），為每個網頁候選寫一份子線交接書 `wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-NAME.md`（照 `wf/workflows/TEMPLATE.handoff.md`，brief_lint 過），派 codex 工人做 spike＋headless 驗證＋量測；Godot 候選可自己做或派一條工人。工人的 REPORT 寫到 `wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-NAME/REPORT.md`。
4. 前景 `inbox_poll.sh --wait` 等；收到終局信逐條核證據（量測數字要在 log 裡找得到），`inbox_ack.sh` 歸檔。
5. 彙整比較矩陣（檔案 `wf/workflows/dispatch/handoffs/lead-techstack/matrix.json`，契約 `wf-table/1`，見 `wf/workflows/common/data-files.md`；欄位至少：候選、首次渲染 ms、一回合更新 ms、headless 驗證方式、能否在本機跑起來、學習／維護成本一句、對「資料驅動、解耦」的友善度一句、風險）；REPORT 給**一個**建議與一個備案，並明寫「頂層要拍板的事」。
6. `inbox_team.sh close techstack`；寫 REPORT；回傳。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 領導 REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/REPORT.md` |
| 比較矩陣 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/matrix.json` |
| 子線交接書與其 REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-*.md`、`cx-spike-*/REPORT.md` |
| spike 程式碼（不進專案） | `/tmp/lead-techstack-spike/` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」與「gpt-6-astra 這次觀察到的癖好」（給 `wf/workflows/team-model/model-quirks.json` 用，沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/REPORT.md` 存在且四段齊全。
2. `matrix.json` 存在、`python3 wf/tools/tabledb.py` 讀得出、至少 3 列，每列的首次渲染 ms 與一回合更新 ms 非空（跑不起來的候選填 `n/a` 並在風險欄寫原因）。
3. 至少 2 個網頁候選有 spike 工人的 REPORT，且 REPORT 內的量測數字能在 `/tmp/lead-techstack-spike/` 的 log 檔中找到。
4. 至少 1 個候選有**真的跑過**的 headless 驗證輸出（測試指令與輸出貼進該候選 REPORT）。
5. `bash wf/tools/wf-lint.sh --strict .` exit 0。
6. `tmux ls` 無 `cx-` session、`pgrep -af 'codex exec'` 無本線行程、`wf/inbox/teams/techstack` 已 close。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（某候選 spike 跑成但效能或 headless 驗證不達標）→ 這是結果不是失敗，記進矩陣；整條線只有「所有候選都沒跑起來」才發 `FAILED`。
- **測不出來**（環境裝不起來、沙箱擋住）→ 不回滾、保持現狀，記進矩陣的風險欄；全部候選都測不出來才發 `BLOCKED`。不准拿估計值冒充量測。

## 完成／阻塞回報（必做）

- 我是誰：`lead-techstack`。本線團隊：`teams/techstack`（領導）。上線先在 `wf/workflows/inbox/ROSTER.md` 追加自己一格。
- 你是 Claude 子 agent，**不走 inbox 向上回報**：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）。工人（codex）走 inbox 回報給你。
- **等工人時用前景** `wf/tools/inbox_poll.sh lead-techstack --wait --timeout 540`（逾時再跑一輪），**不要用結束回合當等待**；卡住超過 10 分鐘先在 REPORT 記一筆。
- 回傳的第一行要是自足的一句結論（例：「建議 X，備案 Y，X 的 200 單位回合更新 N ms」）。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

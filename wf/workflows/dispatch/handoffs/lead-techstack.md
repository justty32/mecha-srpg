# 任務：評估網頁技術棧能否承載「純文字＋方格戰場」的機甲 SRPG，交出有實證的選型建議

> 你是 Opus **領導**線 `lead-techstack`，由頂層（主 session Fable）用 Agent tool 派出：自己拆工、派 codex 工人、監看、驗收、收線、回傳。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/planning/design-notes.md`——親自讀，不靠本交接書的摘要。

## 背景與唯一目標

專案要從 Python＋tcod 桌面版重做成網頁遊戲：無美術資源、純文字（偏 MUD），但要有 SRPG 機甲戰場，地圖用真正的方格（DOM／CSS 畫，不是字元格）。技術棧隨意，網頁不好用就改 Godot-mono（只准 headless）。唯一目標：**交出一份有實測證據的技術棧選型報告**，讓頂層與使用者能在網頁方案與 Godot headless 之間拍板。你不做架構設計、不定資料模型（那是頂層寫 spec 的事），只回答「哪個棧做得到、代價多少、怎麼 headless 測」。

硬條件（逐候選對）：一場戰鬥不限機甲數、地圖有大有小，壓力基準定為 **200 單位、120×120 格**；全程 agent 開發，**必須能 headless 跑並驗證 UI 與邏輯**；要方便新增機甲／部件／駕駛員／地形資料；要有 AI；戰鬥外有選單式營運層；不碰鍵鼠螢幕、不開 GUI。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：候選比較矩陣（至少含純 TypeScript＋Vite 無框架、一個輕量元件框架如 Svelte 或 Lit、Godot-mono headless；可再加一個）；每個網頁候選一個最小 spike（渲染 120×120 格、放 200 單位、點格顯示資訊、一次回合更新全部單位，量首次渲染與一次更新的 ms）；每候選的 headless 驗證路徑實測（node 內建 test runner＋jsdom／happy-dom、Playwright headless 能否在本機裝起來跑、Godot `--headless` 跑場景與斷言），要有真的跑過的輸出；本機盤點；參考 `/home/lorkhan/repo/game_dev/gd_libs` 的 Godot headless 經驗（唯讀）。
- 不做：遊戲邏輯、資料模型、AI、營運層實作；美術；後端／存檔；修改專案既有檔；全域安裝。
- 件數 gate：候選超過 5 個就停下回報；容量 gate：spike 目錄總量超過 1.5 GB 就停下回報；時間 gate：開工起 120 分鐘內收線，沒做完的寫進「沒做到」。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工 `create techstack lead-techstack`；之後 `add` 每條工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派工人做 spike；`-C` 指它在 /tmp/lead-techstack-spike/ 下的子目錄，`--add-dir` 加它的 REPORT 目錄與 `wf/inbox` |
| `wf/tools/inbox_poll.sh lead-techstack --wait --timeout 540` | 前景等工人；逾時再跑一輪 |
| `python3 wf/tools/brief_lint.py` | 子線交接書送出前 `--strict` 要 0 違規 |
| `wf/tools/inbox_ack.sh` | 終局信歸檔並記一行 STATE |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完 REPORT 後跑，要 exit 0 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT 與 `wf/workflows/dispatch/handoffs/lead-techstack/` 底下的附件（子線交接書 `cx-spike-NAME.md` 與其 REPORT）；spike 程式碼與 node_modules 一律放 `/tmp/lead-techstack-spike/`，不進專案。**本線唯一的安裝授權**：可在該目錄內 `npm install`／`pnpm add`、可把 Playwright 瀏覽器下載到該目錄或其預設快取；不得全域安裝。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗（瀏覽器只准 headless，Godot 只准 `--headless`）；不 push、不建分支、不 rebase／reset 別人的 commit；本線不 commit（頂層收線時統一 commit）；不 `rm -rf`（暫存搬 `/tmp/lead-techstack-trash/`）；不改 `~/.codex/config.toml`；不碰 `.gitignore`；不改專案內任何既有檔（ROSTER 自己那格除外）；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 4 條 codex 工人＋2 個 Claude 子 agent，只准為推進正事開。分清錯誤來源：某候選裝不起來、跑不起來本身就是評估結果，記進矩陣，不算阻塞；超過 10 分鐘無法推進任何候選才發 `BLOCKED`。

## 工作

1. 讀完先讀清單；在 `wf/workflows/inbox/ROSTER.md` 追加自己那格；開團隊。
2. 盤點本機（node／pnpm／godot-mono 版本、可 headless 的瀏覽器、磁碟空間）寫進 REPORT 第一段。
3. 定候選（3–5 個），每個網頁候選一份子線交接書 `wf/workflows/dispatch/handoffs/lead-techstack/cx-spike-NAME.md`（照 `wf/workflows/TEMPLATE.handoff.md`、brief_lint 過）派 codex 工人；工人 REPORT 寫到 `cx-spike-NAME/REPORT.md`。Godot 候選可自己做。
4. 前景等信；收到終局信逐條核證據（量測數字要能在 spike 目錄的 log 找到），`inbox_ack.sh` 歸檔。
5. 彙整 `matrix.json`（契約 wf-table/1，見 `wf/workflows/common/data-files.md`；欄位：候選、首次渲染 ms、一回合更新 ms、headless 驗證方式、本機能否跑、維護成本一句、對資料驅動與解耦的友善度一句、風險）；REPORT 給一個建議＋一個備案，明寫「頂層要拍板的事」。
6. 關團隊、寫 REPORT、回傳。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 領導 REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/REPORT.md` |
| 比較矩陣 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-techstack/matrix.json` |
| 子線交接書與 REPORT | 同目錄 `cx-spike-NAME.md`、`cx-spike-NAME/REPORT.md` |
| spike 程式碼（不進專案） | `/tmp/lead-techstack-spike/` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」與「gpt-6-astra 這次觀察到的癖好」。

## 驗收（固定 6 條，一條不多，做完就停）

1. 上述 REPORT.md 存在且四段齊全。
2. `matrix.json` 存在、`python3 wf/tools/tabledb.py` 讀得出、至少 3 列，每列的兩個 ms 欄非空（跑不起來填 `n/a` 並在風險欄寫原因）。
3. 至少 2 個網頁候選有工人 REPORT，且其量測數字能在 `/tmp/lead-techstack-spike/` 的 log 檔中找到。
4. 至少 1 個候選有真的跑過的 headless 驗證輸出（指令與輸出貼進該候選 REPORT）。
5. `bash wf/tools/wf-lint.sh --strict .` exit 0。
6. `tmux ls` 無 `cx-` session、`pgrep -af 'codex exec'` 無本線行程、`wf/inbox/teams/techstack` 已 close。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的（spike 跑成但不達標）→ 是結果不是失敗，記進矩陣；所有候選都沒跑起來才發 `FAILED`。
- 測不出來（環境裝不起來、沙箱擋住）→ 不回滾，記進風險欄；全部候選都測不出來才發 `BLOCKED`。不准拿估計值冒充量測。

## 完成／阻塞回報（必做）

我是 `lead-techstack`，團隊 `teams/techstack` 的領導。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。工人（codex）走 inbox 回報給你。等工人時用前景 `wf/tools/inbox_poll.sh lead-techstack --wait --timeout 540`，不要用結束回合當等待。

# 任務：把 Battle Brothers 的戰鬥／人物／營運機制拆解成「機甲 SRPG 可選機制表」，供使用者挑選

> 你是 Opus **領導**線 `lead-combat-ref`，由頂層（主 session Fable）用 Agent tool 派出。你自己拆工、派 codex 工人、監看、驗收、收線，最後向頂層回傳。派線規則見 `wf/workflows/dispatch/README.md`，工具見 `wf/workflows/dispatch/tool-index.md`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/investigation.md`、`wf/workflows/common/user.md`、`wf/workflows/common/data-files.md`、`wf/workflows/planning/design-notes.md`——**親自讀，不靠本交接書的摘要**。

## 背景與唯一目標

使用者決定戰鬥系統**走 Battle Brothers（BB）式，機甲就是裝備**：駕駛員是持久角色（特質、傷勢、士氣、成長），機甲與部件是裝備；機甲結構多種多樣、每個部位有 HP、部位打壞的後果與傳到駕駛員的方式都「多種多樣」（資料驅動的效果清單）；一場戰鬥不限單位數；戰場之間有營運層。超級機器人大戰（SRW）降為次要參考。`/home/lorkhan/repo/moddings/battle-brothers/` 已有一整套 BB 反編譯拆解（`wf/workflows/investigations/*.md`、`analysis/`）。唯一目標：**產出一份「可選機制表」**——每條機制：BB 原版怎麼做（附拆解出處）、搬到「駕駛員＝人、機甲＝裝備、部位有 HP」的機甲設定要怎麼改寫、與 design-notes 哪條裁示有關、建議採用／改造／不採用與一句理由——讓使用者逐條挑，頂層據此寫 spec。你不寫 spec、不定數值。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 消化 BB 拆解的這些主題：`combat-rules`、`skill-effects`、`character-rules`、`character-backgrounds`、`tactical-ai`、`ai-*`、`battle-results*`、`economy`、`contracts*`、`settlements`、`world-simulation`、`simulation-loop`、`data-model`、`replication-design`（都在 `/home/lorkhan/repo/moddings/battle-brothers/wf/workflows/investigations/`，證據表在同 repo `analysis/`）；(2) 針對 design-notes 的七條裁示各寫「BB 對應機制＋機甲改寫」；(3) SRW 只補三件：精神指令、氣力、部位／武器對應關係在 SRW 系列裡怎麼做（用 Claude 子 agent 的 WebSearch 查公開資料，附 URL；codex 工人不查網）；(4) 機制表 json；(5) REPORT。
- 不做：世界觀；數值平衡；程式碼；重跑 BB 的反編譯或任何 BB 工具；讀 BB 的 `vendor/` 原始反編譯碼（只讀拆解文件與 analysis 證據表；需要原碼佐證時最多引用拆解文件已標的出處，不自己下鑽）；修改 BB repo 任何檔。
- 件數 gate：機制表超過 **120 列**就停下來精簡；容量 gate：本線產物總量超過 2 MB 就停下回報。任一觸發都停。
- 時間 gate：從開工起 **120 分鐘**內收線；到時沒做完的寫進「沒做到」。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工先 `create combatref lead-combat-ref`；之後 `add` 每條 codex 工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派 codex 工人各消化一組 BB 主題；`-C` 指該工人的 REPORT 目錄，`--add-dir` 加 `wf/inbox`；BB repo 唯讀（沙箱本來就擋寫） |
| `wf/tools/inbox_poll.sh lead-combat-ref --wait --timeout 540` | 前景等工人回報；逾時再跑一輪 |
| `python3 wf/tools/brief_lint.py` | 每份子線交接書送出前 `--strict` 要 0 違規 |
| `python3 wf/tools/tabledb.py` | 寫與驗機制表 mechanics.json（契約 wf-table/1） |
| `wf/tools/inbox_ack.sh` | 收到終局信後歸檔並記一行 STATE |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完 REPORT 與附件後跑，要 exit 0 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT 與 `wf/workflows/dispatch/handoffs/lead-combat-ref/` 底下的附件（子線交接書 `cx-*.md`、工人 REPORT、`mechanics.json`）；codex 工人用 `-s workspace-write`、`-C` 指它在 `wf/workflows/dispatch/handoffs/lead-combat-ref/cx-*/` 的目錄。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；本線**不 commit**（頂層收線時統一 commit）；不 `rm -rf`（暫存搬 `/tmp/lead-combat-ref-trash/`）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不改專案內任何既有檔（ROSTER 自己那格與領地表自己那格除外）；不改 `/home/lorkhan/repo/moddings/` 任何檔；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）；子代理上限 **5 條 codex 工人**＋**2 個 Claude 子 agent**（SRW 查網用），只准為推進正事開。

**分清錯誤來源**：工具或環境出錯（指令不存在、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。

## 工作

1. 讀完「先讀」清單；在 `wf/workflows/inbox/ROSTER.md` 追加自己那格；`inbox_team.sh create combatref lead-combat-ref`。
2. 先讀 BB 拆解的 `wf/workflows/investigations/README.md` 與 `replication-design.md` 建立全貌，把主題分成 3–5 組（例：戰鬥結算與技能效果／人物與傷勢士氣／戰術 AI／營運與契約經濟／資料模型），每組一份子線交接書 `wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-GROUP.md`（照 `wf/workflows/TEMPLATE.handoff.md`，brief_lint 過），要工人輸出固定欄位的 json 片段（欄位見第 5 步）＋REPORT；派出。
3. 同時開 1 個 Claude 子 agent 查 SRW 三件事（WebSearch，附 URL），輸出同欄位。
4. 前景 `inbox_poll.sh --wait` 等；收到終局信逐條核證據（每條機制的「出處」要能在 BB 拆解檔裡 grep 到），`inbox_ack.sh` 歸檔。
5. 合併成 `mechanics.json`（`wf-table/1`；欄位固定：`id`、`domain`（戰鬥／人物／AI／營運／資料）、`bb_mechanic`（BB 原版一句）、`source`（拆解檔路徑＋錨點或段名）、`mecha_adaptation`（機甲設定改寫一句）、`design_note_ref`（對應 design-notes 哪條裁示）、`recommendation`（採用／改造／不採用）、`why`（一句）、`open_question`（要使用者拍板的，可空））。用 `tabledb.py` 驗格式。
6. REPORT：全貌一段、七條裁示各一段對應、你認為最該先拍板的 10 個 `open_question` 清單；`inbox_team.sh close combatref`；回傳。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 領導 REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/REPORT.md` |
| 可選機制表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/mechanics.json` |
| 子線交接書與其 REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-*.md`、`cx-bb-*/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」與「gpt-6-astra 這次觀察到的癖好」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/REPORT.md` 存在且四段齊全。
2. `mechanics.json` 存在、`python3 wf/tools/tabledb.py` 讀得出、列數在 40–120 之間、每列 `source` 與 `recommendation` 非空。
3. 隨機抽 10 列，`source` 指的檔案存在於 `/home/lorkhan/repo/moddings/battle-brothers/` 且錨點或段名能 grep 到（SRW 列改為 URL 有效）；10 列全中。
4. design-notes 的七條裁示（形態除外）在 REPORT 各有一段對應，且 `mechanics.json` 的 `design_note_ref` 覆蓋全部七條。
5. `bash wf/tools/wf-lint.sh --strict .` exit 0。
6. `tmux ls` 無 `cx-` session、`pgrep -af 'codex exec'` 無本線行程、`wf/inbox/teams/combatref` 已 close。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（工人交的機制表出處對不上）→ 退回該工人重做或自己補查，不算整線失敗；整線只有 `mechanics.json` 無法達到 40 列才發 `FAILED`。
- **測不出來**（BB 拆解檔讀不到、沙箱擋住）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`lead-combat-ref`。本線團隊：`teams/combatref`（領導）。上線先在 `wf/workflows/inbox/ROSTER.md` 追加自己一格。
- 你是 Claude 子 agent，**不走 inbox 向上回報**：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）。工人（codex）走 inbox 回報給你。
- **等工人時用前景** `wf/tools/inbox_poll.sh lead-combat-ref --wait --timeout 540`（逾時再跑一輪），**不要用結束回合當等待**；卡住超過 10 分鐘先在 REPORT 記一筆。
- 回傳的第一行要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

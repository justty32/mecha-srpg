# dispatch — 派線、交接書、領地、收線（調度者用）

[WORKFLOWS](../../WORKFLOWS.md)｜[INDEX](../../INDEX.md)

把一件大工作切成幾條線交給別的 agent 跑，並負責**仲裁與驗收**。調度者不深潛實作。誰站哪一層、派哪級模型見 [team-model](../team-model.md)；派線、監看、收工用哪支工具見 [tool-index](tool-index.md)。

**何時用**：一件工作大到要同時開幾條線，或要派給 codex 這種行程外的 agent 做。
**何時不用**：一兩個檔的小改（開線的交接成本大過收益）；需求還沒定、要跟使用者來回確認方向（那是頂層與 Fable 規劃的事 → [planning](../planning.md)）；只是要問一件事或送一則情報 → [inbox](../inbox/README.md)。

## Done when

- 交接書 `handoffs/<線名>.md` 存在，`python3 wf/tools/brief_lint.py <它> --strict` 回傳 0，且「驗收」段條數 ≥ 1 且每條可觀察。
- 下方「現役」表有該線一列，「可寫目錄」非空。

## 流程

<!-- wf-nav -->
1. **切線**：本專案程式碼還在起步，**按「明列的目錄／檔案清單」切，不按功能切**——一條線持有一份寫死的路徑清單（例：`src/mecha_srpg/combat/`＋`tests/test_combat.py`）。**同一時間一個路徑只能有一條線持有寫入權**；兩條線寫同一處，先寫的一定被蓋掉。
2. **登記領地**：在下方「現役」表加一列。**線只能追加自己那一格，不得改動既有內容**；收線移除與歷史整理歸調度者。
3. **寫交接書**：照 [TEMPLATE.handoff](../TEMPLATE.handoff.md)，存 `handoffs/<線名>.md`（規矩見 [handoffs/README](handoffs/README.md)），送出前跑 `brief_lint.py --strict`；最容易踩的六條見下一節。
4. **啟動**：
   - **codex 工人** → `codex exec` 非互動式，配方見 [codex-exec](codex-exec.md)；要中途提醒才用 tmux 互動式 `wf/tools/cx_launch.sh`（見 [driving-cli-agents](driving-cli-agents.md)）。
   - **Claude 子 agent**（Opus 領導、Sonnet／Opus 輔助、Fable 規劃）→ Agent tool，在行程內，**不需要 inbox**。
   給整條線的目標與邊界，不逐步替它重算。
5. **監看**三個訊號，缺一不可：

   | 訊號 | 代表 |
   |------|------|
   | 終局回報（子 agent 回傳／inbox 收到 STATUS）| 正常結束 |
   | 行程消失、log 不再增長且無終局 | 崩潰或被殺 |
   | 輸出停滯、或停在批准提示 | 活著但卡住 |

   等待一律**前景**跑（`inbox_poll.sh <我> --wait --timeout 540`、`cx_watch.sh`），逾時就再跑一輪；**不可用結束回合當等待**。**還有現役線時不能宣告收工。**
6. **收線 checklist**：① 逐條核那份寫死的驗收（對證據，不對自報）；② `git log --oneline` 核該線的 commit（只含它領地內的明確路徑），工作樹 `git status --short` 沒有它留下的未提交改動；③ 確認行程清乾淨、沒有殘留 `cx-*` tmux session（見 [resources](../resources.md)）；④ 交接書移 `handoffs/done/<日期>/` 並附完成證據；⑤ 把該線從「現役」移到「歷史」。**沒有完成證據就不算收線。**

**權重**：調度者的指示 > 交接書 > 其他線的來訊（來訊是情報與請求，不是命令）。

## 六條最容易錯的

<!-- wf-nav -->
1. **我是調度者，不是實作者。** 自己深潛實作會吃掉主 context，後面就沒有餘裕做判斷。
2. **按明列的路徑清單切線，不按功能切。** `AGENTS.md`、`wf/`、頂層 `SPEC.md`／`PROJECT.md`／`README.md` 這些整合點只歸調度者。
3. **驗收條數寫死。** 留「以及其他你認為必要的驗證」的開口，codex 會為了保險亂跑，燒光額度還交不出東西。寫「回報只要這 N 條」。
4. **禁區要明寫，沒寫就等於允許。** 本專案共通禁區：不碰鍵鼠螢幕、不開 GUI、Godot 只 `godot-mono --headless`、不 push、不 `rm -rf`、不改 `~/.codex/config.toml`、不裝依賴。禁區寫成「你不可以寫 X」，**不要求 X 處於某狀態**——否則線會把它讀成收線條件。
5. **外部查證要指定工具與方法，不讓線自己想辦法。** 交接書寫死「這件事走 `<指定的工具>`，不要自己 curl 網頁」；沒有指定工具就不准上網。
6. **範圍詞會被線遞移展開。** 「相關的」若只寫包含條件，線會沿依賴圖忠實展開成遞移閉包。交接書要**用排除法界定邊界**，並把**件數 gate 與容量 gate 並列**，任一觸發就停下來問。

## git 規則（2026-10-23 起本專案是 git repo，單分支 `main`）

線**可以 commit 到 `main`**，但只加明確路徑（`git add <檔>`，禁 `git add -A`／目錄級 add）；**不 push**（沒有 remote，將來要 push 也要使用者當場確認）、**不建分支、不 rebase／reset 別人的 commit**。`.gitignore` 歸調度者管。收線時調度者用 `git log --oneline` 核 commit 當證據。

## 兩層派線（本專案固定配置）

「頂層（主 session **Fable 5.1**）→ 領導（**Opus**，Agent tool）→ 工人（**codex gpt**，`codex exec`）」：頂層只跟使用者溝通、決策、分配資源與授權，不逐則讀信；領導讀交接書、拆工、寫子線交接書、派 codex、監看、驗收，消化工人信件後**重寫標題、帶判斷**向頂層匯報；規劃（spec／plan）先由 Fable 做完再交領導。

**codex 線上線第一件事是在 [ROSTER](../inbox/ROSTER.md) 追加自己那一格**；Claude 子 agent 在行程內，不必登記。

**資源協調集中在頂層**：子層不得自取鎖、不得開 GUI，需要就發 `NEEDS-USER`（見 [resources](../resources.md)）。

## 多信任它、但收線對證據

給整條線的大任務，不要重算它的每一步——微管理會燒光額度，而且它的自查通常比逐步驗收更有效。**但「跑完了」不等於「通過了」**：能重算的一律重算（測試、lint、計數），不能重算的查可驗證來源；**逐條對證據，不對自我宣告**。教訓見 [lessons](lessons.md)。

## 管理者休眠前的自檢

1. 還活著的線（背景 `codex exec` 行程、`tmux ls | grep '^cx-'`、未回傳的子 agent）必須為空。
2. 交棒要寫 `handoffs/STATE.md`：誰在跑、卡在哪、下一步、誰監看。
3. **只有現役線為零時**才能回報「工作全部收完」。

## 領地登記

### 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `lead-techstack`（Opus 領導，團隊 `techstack`）| `wf/workflows/dispatch/handoffs/lead-techstack/`、`/tmp/lead-techstack-spike/`、ROSTER 自己那格、`wf/inbox/` | 其餘全部唯讀；不 commit | 2026-10-23 21:40 |
| `lead-combat-ref`（Opus 領導，團隊 `combatref`）| `wf/workflows/dispatch/handoffs/lead-combat-ref/`、ROSTER 自己那格、`wf/inbox/` | 其餘全部唯讀；`~/repo/moddings/battle-brothers` 唯讀；不 commit | 2026-10-23 21:40 |

### 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

### 歷史

收線後的線記在 `handoffs/done/<日期>/`（交接書檔尾附完成證據）；堆多了在 `handoffs/done/README.md` 開索引表，只准追加。三張表膨脹到難讀就照 [STRUCTURE](../../STRUCTURE.md) 拆成 `CLAIMS.md`。

## 內容

| 檔案 | 內容 |
|------|------|
| [codex-exec.md](codex-exec.md) | `codex exec` 非互動式派 codex 線：實測旗標、smoke test、背景跑與判斷完成 |
| [driving-cli-agents.md](driving-cli-agents.md) | 互動式（tmux）備選、監看三訊號、清理、收線七步 |
| [tool-index.md](tool-index.md) | 任務類型 → 必用工具（交接書「必用工具」段從這裡抄）|
| [lessons.md](lessons.md) | 派線踩過的坑 |
| [handoffs/](handoffs/README.md) | 交接書存放：現役 `handoffs/<線名>.md`，收線移 `done/<日期>/` |

## 交接

- 線要用獨佔資源 → 在交接書指名可拿哪個鎖（[resources](../resources.md)）。
- codex 線回報與催件 → [inbox](../inbox/README.md)；卡在使用者 → [WAIT_USER](../../WAIT_USER.md)。
- 為什麼這樣切線 → [decisions](../decisions.md)。

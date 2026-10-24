# 任務：做人物 30 件（12 古代機駕駛候選、6 駕駛員、5 技師、3 科研員、4 機魂）、人物效果 24 件、機魂天賦樹 4 棵與 perk 12 件

> 領導 `lead-content-ancient` 寫給 codex 工人 `cx-anc-c`。**交接書是唯一契約**：沒寫的授權等於沒有。共用設計表：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/design.md`（必讀全文，與本書衝突時以本書為準）。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-abilities-effects.md`、`wf/workflows/planning/specs/core/data-model-people.md`、`wf/workflows/planning/specs/core/data-model-mech.md`、`wf/workflows/planning/specs/world/ruins-and-ancient.md`、`wf/workflows/planning/specs/world/machine-souls.md`、`wf/workflows/planning/specs/world/factions.md`、`wf/workflows/planning/design-notes/mechs.md`——親自讀。型別真相在 `src/core/types-def.ts`。

## 背景與唯一目標

使用者要「開始堆料」，想看 AI 的創造力；古代機甲線（古代機＋人物＋機魂）拆成三個工人。唯一目標：**設計表第四節的 persons 30、人物 effects 24、soultrees 4、perk effects 12**，全部通過 `npm run check`，風格大膽、有世界觀一致性、數值守設計表的量級。

## 範圍（排除法寫死）

- 只做：新建 `content/base/persons/（自然命名）.json`（30 件，檔名先 ls 確認不存在）、`content/base/effects/ax-trait-*.json`／`ax-bg-*.json`／`ax-injury-*.json`（合計 24）、`content/base/soultrees/ax-{sentinel,hunter,solo,feral}.json`、`content/base/effects/ax-perk-*.json`（12）。古代機駕駛候選的信念照設計表第三節每台的兩個信念（frames 由別的工人同時在寫，你只需對齊信念標籤，不必引用 frame id）。
- 不做：修改或刪除任何既有檔（含別的工人與別條線的檔）；`content/base/registries/`、`content/base/rules/`、`content/base/world/`、`content/base/scenarios/`、`content/README.md`、`pack.json`、`src/`、`schemas/`、`test/`、spec 與 `wf/`（自己的 REPORT 除外）；設計表指派給其他工人的檔名。
- 件數 gate：新建檔超過 72 個就停下回報；容量 gate：新檔合計超過 300 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-anc-c --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `npm run check` | 每寫完一批後；**只看與你的檔名有關的錯誤**——別的工人同時在寫同一目錄，他們的半成品錯誤不歸你，不要去修 |
| `ls` | 新建任何檔之前確認檔名不存在 |

## 資源與禁區

- **可寫程式碼線**（本線只寫內容 JSON）：只寫「範圍」列的新檔與你的 REPORT。可跑 `npm run check`、`node` 唯讀小腳本（放 `/tmp/cx-anc-c/`）。**不要 commit**（沙箱下 .git 可能唯讀）：commit 由領導做，你在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`、不 `git checkout`／`git restore`；不 `rm -rf`、不刪任何檔；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 → 發 `BLOCKED`；你自己寫的 JSON 錯了 → 自己修，不算阻塞。

## 工作

1. 先寫 24 件人物 effects 與 12 件 perk、4 棵 soultree，跑 check；`inbox_poll --once`。
2. 寫 30 件 persons（照設計表第四節分配；屬性量級對照既有 `persons/*.json`：accuracy 45–65、evasion 5–15、resolve 35–75、initiative 5–9、perception 4–8、control 35–60；技師、科研員戰鬥屬性偏低；人類必有 ap／fatigue／hp 池，機魂 ap／fatigue／calc）；每 10 件跑一次 check；`inbox_poll --once`。
3. 每人的 traits 至少 1 件；名字多元文化、各勢力出身；在 REPORT 的檔案清單每人一句背景（勢力、身分、對應哪台古代機）。
最後寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-c/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` 底下設計表指派給你的檔名 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-c/REPORT.md` |

REPORT 四段（做了什麼／產出（完整檔案清單，每件一句定位）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `npm run check` 末行 `OK 0 errors`（若有別人檔的錯誤，REPORT 寫明哪些錯誤不是你的；由領導在沙箱外重跑）。
2. persons 30、人物 effects 24、perk 12、soultree 4 件存在；12 名古代機駕駛候選各自的 will.beliefs 讓對應那台的共鳴 ≥ 0.5（REPORT 列對照表）。
3. 每個能力有 `ai.tactics`、`mode` 只用 activated／sustained（reaction 僅限設計表允許處），引用的 id 全部存在。
4. REPORT 存在且有四段＋檔案清單。

不要為了「更保險」加驗其他東西；不要跑 `npm test`（沙箱計數不準，由領導跑）。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-anc-c`。本線團隊：`teams/ancient`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-anc-c --up PROGRESS 'cx-anc-c 上線' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-anc-c --up DONE（或 BLOCKED／FAILED） '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-c/REPORT.md`。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。標題要是自足的一句結論。

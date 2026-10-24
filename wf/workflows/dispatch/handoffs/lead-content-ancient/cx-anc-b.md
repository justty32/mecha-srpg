# 任務：做古代機甲 B 組 6 台（魁札爾科亞特爾、迦樓羅、佩倫、庫丘林、阿特拉斯、海姆達爾）與其能力、效果、2 個新 bodyplan

> 領導 `lead-content-ancient` 寫給 codex 工人 `cx-anc-b`。**交接書是唯一契約**：沒寫的授權等於沒有。共用設計表：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/design.md`（必讀全文，與本書衝突時以本書為準）。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-abilities-effects.md`、`wf/workflows/planning/specs/core/data-model-people.md`、`wf/workflows/planning/specs/core/data-model-mech.md`、`wf/workflows/planning/specs/world/ruins-and-ancient.md`、`wf/workflows/planning/specs/world/machine-souls.md`、`wf/workflows/planning/specs/world/factions.md`、`wf/workflows/planning/design-notes/mechs.md`——親自讀。型別真相在 `src/core/types-def.ts`。

## 背景與唯一目標

使用者要「開始堆料」，想看 AI 的創造力；古代機甲線（古代機＋人物＋機魂）拆成三個工人。唯一目標：**設計表第三節標「B」的 6 台古代機甲 frames、新 bodyplan ancient-winged／ancient-colossus，以及這 6 台的專屬 abilities（合計 ≤ 16）與 effects（合計 ≤ 10）**，全部通過 `npm run check`，風格大膽、有世界觀一致性、數值守設計表的量級。

## 範圍（排除法寫死）

- 只做：新建 `content/base/frames/ancient-{plumed,serpenteater,thunderoak,riastrad,skybearer,watchhorn}.json`、`content/base/bodyplans/ancient-{winged,colossus}.json`、`content/base/abilities/ax-（上述代號）-*.json`（≤ 16 件）、`content/base/effects/ax-（上述代號）-*.json`（≤ 10 件）。佩倫的過熱帶沿用既有 `effect/overheat-1`／`effect/overheat-2`，不新建。
- 不做：修改或刪除任何既有檔（含別的工人與別條線的檔）；`content/base/registries/`、`content/base/rules/`、`content/base/world/`、`content/base/scenarios/`、`content/README.md`、`pack.json`、`src/`、`schemas/`、`test/`、spec 與 `wf/`（自己的 REPORT 除外）；設計表指派給其他工人的檔名。
- 件數 gate：新建檔超過 34 個就停下回報；容量 gate：新檔合計超過 300 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-anc-b --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `npm run check` | 每寫完一批後；**只看與你的檔名有關的錯誤**——別的工人同時在寫同一目錄，他們的半成品錯誤不歸你，不要去修 |
| `ls` | 新建任何檔之前確認檔名不存在 |

## 資源與禁區

- **可寫程式碼線**（本線只寫內容 JSON）：只寫「範圍」列的新檔與你的 REPORT。可跑 `npm run check`、`node` 唯讀小腳本（放 `/tmp/cx-anc-b/`）。**不要 commit**（沙箱下 .git 可能唯讀）：commit 由領導做，你在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`、不 `git checkout`／`git restore`；不 `rm -rf`、不刪任何檔；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 → 發 `BLOCKED`；你自己寫的 JSON 錯了 → 自己修，不算阻塞。

## 工作

1. 先寫 2 個 bodyplan（照 ancient-warden 的層序列；winged 的翼部位帶 locomotion、frame tags 加 `flight`；colossus 六部位、HP 高），跑 check；`inbox_poll --once`。
2. 逐台寫 frame＋abilities＋effects（照設計表第三節：稱號、池、信念／deed、能力構想；神異能力 require 共鳴、每台一個無要求的基本攻擊；庫丘林的 reaction 照 `src/rules/movement.ts` 的 enemyLeavesAdjacent 寫法）；每兩台跑一次 check；`inbox_poll --once`。
3. 能力名、效果 badge 用繁中，有神話梗。
最後寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-b/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` 底下設計表指派給你的檔名 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-b/REPORT.md` |

REPORT 四段（做了什麼／產出（完整檔案清單，每件一句定位）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `npm run check` 末行 `OK 0 errors`（若有別人檔的錯誤，REPORT 寫明哪些錯誤不是你的；由領導在沙箱外重跑）。
2. 6 個 frame、2 個 bodyplan 存在；abilities ≤ 16、effects ≤ 10，檔名都在 ax-B 組代號- 底下。
3. 每個能力有 `ai.tactics`、`mode` 只用 activated／sustained（reaction 僅限設計表允許處），引用的 id 全部存在。
4. REPORT 存在且有四段＋檔案清單。

不要為了「更保險」加驗其他東西；不要跑 `npm test`（沙箱計數不準，由領導跑）。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 寫證據。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-anc-b`。本線團隊：`teams/ancient`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-anc-b --up PROGRESS 'cx-anc-b 上線' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-anc-b --up DONE（或 BLOCKED／FAILED） '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-b/REPORT.md`。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。標題要是自足的一句結論。

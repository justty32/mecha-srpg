# 任務：照凍結契約寫出 content/base 的 bodyplan、frame、component、ability、effect 共 31 個 JSON（含古代獨有能力、生物 burden、部件 resonance）

> 領導 `lead-impl-content-base` 寫給 codex 工人 `cx-content-mechs`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄 `contract.md` 的 §0、§1——id、檔名、件數、欄位要點照抄。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/contract.md`、`schemas/content.schema.json`（欄位形狀的唯一真相，**不可修改**）、`content/base/` 既有檔（範本，**不可修改**）、spec `wf/workflows/planning/specs/core/content-format.md`、data-model-mech.md、data-model-abilities-effects.md、world/monsters.md、world/mech-lifecycles.md、world/ruins-and-ancient.md（spec 在 `wf/workflows/planning/specs/` 下）——親自讀。

## 背景與唯一目標

地基已交付載入器與 schema，`content/base/` 各類只有一個範例；登記檔已由領導補齊。唯一目標：交出契約列給你的 **31 個新 JSON 檔**，讓 `npm run check` 在合併後零錯誤載入。命名與基調照世界觀（摹機、魂核、殼、裂獸），數值只求量級合理。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建這 31 個檔，一個不多，路徑相對 `content/base/`）：bodyplans/{biped-standard,ancient-warden,insect-mite,insect-reaper,insect-nestmother}.json、frames/{moji-tern,bio-reaper,bio-mite,bio-nestmother,ancient-rearguard}.json、components/{soul-core-std,heat-lance,composite-plate,shell-pin-restraint,reaper-scythe-graft,shell-shard-lens}.json、abilities/{heat-lance-thrust,scythe-graft-cleave,shard-gaze,rearguard-oath,shell-lance,mite-swarm-bite,reaper-cleave,reaper-charge,nest-birth,root-drag}.json、effects/{rearguard-oath,shard-marked,restraint-broken,nest-birth,rooted}.json；外加你的 REPORT。
- 不做：改任何既有檔（含 `registries/`、`pack.json`、既有內容檔）；建立 contract §0 的禁區檔名；另一條線的檔；`src/`、`schemas/`、`test/`、`package.json`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；安裝任何套件；數值平衡。schema 擋住契約要的欄位 → 不改 schema，該欄改用 schema 允許的最小形狀，REPORT 列 `SPEC-GAP`。
- 件數 gate：新檔超過 31 個（不含 REPORT）就停下回報；容量 gate：新檔合計超過 200 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一類跑一次（專案根）；**唯一允許殘留的錯誤**是 `missing reference` 指向 species/mite（effect/nest-birth 的 spawn 目標），其餘錯誤自己修 |
| `python3 wf/tools/tabledb.py` | 查 `wf/workflows/planning/specs/world/monsters.json`、`wf/workflows/planning/specs/core/glossary.json`，不整份讀 |
| `wf/tools/inbox_poll.sh` | 每寫完一類跑一次 `wf/tools/inbox_poll.sh cx-content-mechs --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 31 個檔與你的 REPORT；可跑 `npm run check`、`node`。**不要 commit**：驗收與 commit 由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-content-mechs-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：node 跑不了、沙箱拒寫 → 發 `BLOCKED`；自己的 JSON 不過 schema／參照 → 自己修。

## 工作

1. 依契約逐類寫檔，每類寫完跑 `npm run check` 並 `inbox_poll --once`。
2. 全部寫完，確認 `npm run check` 輸出只剩上面允許的那種錯誤（或零錯誤）。
3. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-mechs/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` 下範圍列的 31 個檔 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-mechs/REPORT.md` |

REPORT 四段（做了什麼／產出（31 個檔的清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」（沒有寫「無」），末尾附最後一次 `npm run check` 的輸出。

## 驗收（固定 3 條，一條不多，做完就停）

1. 範圍列的 31 個檔都存在、檔名與 id 和契約一致，沒有其他新檔。
2. 最後一次 `npm run check` 除了「必用工具」表允許的 `missing reference` 外零錯誤（由領導在合併後重跑）。
3. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附 `npm run check` 輸出。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-content-mechs`。本線團隊：`teams/contentbase`。上線先發 `wf/tools/inbox_mail.sh cx-content-mechs --up PROGRESS 'cx-content-mechs 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-content-mechs --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-mechs/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

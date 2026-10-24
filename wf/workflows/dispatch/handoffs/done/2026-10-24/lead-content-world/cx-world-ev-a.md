# 任務：新增 20 個營運事件檔（船上日常、人員衝突、機魂異常、拘束艙與掙脫變體）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、**本線護欄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/engine-rules.md`（契約，逐條照做）**、`content/lore/style.md`（風格與禁用詞）、`wf/workflows/planning/specs/ops/content-format-ops.md`、`wf/workflows/planning/specs/world/` 的 `README.md`、`setting.md`、`factions.md`、`opening.md`、`operations.md`、`machine-souls.md`、`bio-mechs.md`，以及 `wf/workflows/planning/design-notes/world.md`、`design-notes/bio-mechs.md`——**親自讀，不靠本交接書的摘要**。範本：`content/base/world/events/funeral.json`（鏈的寫法）、`content/base/world/rooms/restraint.json`（拘束艙語感）。

## 背景與唯一目標

《潮獵》的營運層（浮船「候鳥號」、拘束艙、機魂、債）已經能跑，但事件只有開場四個。唯一目標：寫 20 個**會在戰役中真的被抽到**的營運事件檔，讓船上的日子有人味、有黑色幽默、有中二，而且不弄壞自動模擬。

## 範圍（排除法寫死）

- 只做：新增 `content/base/world/events/` 底下 20 個新 JSON 檔，檔名前綴只用 `ship-`、`crew-`、`soul-`、`restraint-`（另一個工人用別的前綴，不要越界）。
- 不做：改任何既有檔；`content/base/world/` 其他資料夾；`src/`；`content/` 其他地方；spec；`content/lore/`。
- 件數 gate：新檔超過 24 個就停下回報；容量 gate：單檔超過 4 KB 就停下回報。任一觸發都停。

## 內容配方（20 檔，其中 14–16 個隨機事件＋4–6 個鏈中後續）

主題覆蓋（每列至少 1 個，題材可自由發揮，下面只是種子）：

| 類 | 種子 |
|---|---|
| 船上日常 | 氣囊漏氣要補（扣 scrap，或請大家憋著）；船尾那門老艦砲該不該取名字；廚子兼醫官的「潮汐燉菜」；貨艙裡發現偷渡的孩子（鏈：留下／送上岸）；老桂的置物櫃（鏈：裡面有一張沒兌現的欠條或一封給某人的信） |
| 人員衝突 | 酒艙牌局吵到動手；欠薪時的抱怨（條件：現金低）；兩個駕駛員為了誰開那台好機甲吵架；新人被老鳥欺負；有人想退團 |
| 機魂異常 | 魂核夜裡低鳴；機魂日誌出現不屬於它的紀錄（野魂殘跡、「想回家的人」）；租來的機魂在終端上照本宣科念合約第十四條（塞勒涅的手套複本味道）；機魂對空座艙行禮——記得：一般機魂沒有個性，這些是**怪現象** |
| 拘束艙／掙脫變體 | 夜裡拘束架的撞擊聲（`restraint.beastWear >= 50`）；一根鏈斷了；獸盯著新人看到他睡不著；空拘束艙（`restraint.beastCount == 0`）；技師提議做掙脫演習；吞屍後的安靜（僅限有獸時，文字別寫成餵養） |

- 隨機事件照 engine-rules 第一節的閘門；把 4 個日子（5／12／19／26）大致平均分給你的事件；`where` 以 `ship` 為主，可有幾個 `node`。
- 至少 3 條鏈（隨機事件 → 選項 `next` → 後續），至少 2 個一次性劇情（`seen-` 旗標），至少 4 個事件設下旗標並被你另一個事件的 `when` 讀到（跨時間的小連續劇）。
- 每個事件 `text` 40–160 字；選項文字 4–20 字；`reason` 寫 `event-` 加檔名（例 `event-ship-helium-leak`）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-world-ev-a --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-world-ev-a --up …` | 上線 PROGRESS 與終局回報 |
| `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world/events` | 每批寫完；末行 `OK` |
| `node src/ops/content/check.ts content/base` | 每批寫完；末行 `OK 0 errors` |

## 資源與禁區

- **可寫程式碼線**（本線只寫內容資料檔）：只寫「範圍」列的路徑、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-ev-a/` 與 `/tmp/cx-world-ev-a/`；可跑上表指令與 `npm run check`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；**不 commit**（commit 由領導做，你只回報改了哪些檔）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不跑 `npm test`（沙箱內計數不準，領導在外面跑）。

**分清錯誤來源**：工具或環境出錯（權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的腳本出錯 → 自己修。

## 工作

1. 上線發 PROGRESS。
2. 寫 20 檔；每寫完 5 檔跑一次 lint 與 check。
3. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-ev-a/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 事件 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/events/{ship,crew,soul,restraint}-*.json`（20 個新檔） |

REPORT 四段（做了什麼／產出（每檔一行：id、where、日子、條件摘要、一句梗概、鏈去向）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」。另附「最得意的 3 件」各一句。

## 驗收（固定 3 條，做完就停）

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world/events` 末行 `OK`。
2. `node src/ops/content/check.ts content/base` 末行 `OK 0 errors`（別線未提交檔造成的錯誤要在 REPORT 逐條指出不是你的檔）。
3. `git status --short content/base/world` 只多出你前綴的 20 個 `??` 檔，沒有 ` M`。

## 失敗怎麼處置

- 測出來是壞的 → 修到綠；修不好就移除該檔並在 REPORT 記；全部做不出才發 `FAILED`。
- 測不出來（沒跑成）→ 不回滾，發 `BLOCKED`，寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-world-ev-a`。本線團隊：`teams/content-world`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-world-ev-a --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-ev-a/REPORT.md`。
- 結束時必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

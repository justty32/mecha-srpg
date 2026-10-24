# 任務：新增營運人物資料 30 檔（對白 15、背景 12、招募池 3）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、**本線護欄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/engine-rules.md`（契約，逐條照做）**、`content/lore/style.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`data-model-roster-repair.md`（同資料夾）、`src/ops/state/types.ts`（`DialogueDef`、`BackgroundDef`、`RecruitPoolDef`）、`src/ops/crew/recruit.ts`（候選人怎麼從背景生成）、`wf/workflows/planning/specs/world/` 的 `opening.md`、`factions.md`、`machine-souls.md`，人物檔 `content/base/persons/*.json`（只看已 commit 的）與 `wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-c/REPORT.md`（新人物的一句定位）——**親自讀，不靠本交接書的摘要**。範本：`content/base/world/dialogues/chen-xiaohai.json`、`dialogues/ren-kasai.json`、`backgrounds/refugee.json`、`recruit-pools/dhaka.json`、`campaign-start/default.json`（開局船員是誰）。

## 背景與唯一目標

開局船員能「談」的話題只有兩句，招募池只有一種難民背景。唯一目標：讓開局船員各有幾段能談的話，並讓新人物能從各港口的招募池被雇到、雇到後也有話可談。

## 範圍（排除法寫死）

- 只做：新增 `content/base/world/dialogues/`、`backgrounds/`、`recruit-pools/` 底下的新檔。
- 不做：改任何既有檔（尤其 `dialogues/{chen-xiaohai,ren-kasai}.json`、`backgrounds/refugee.json`、`recruit-pools/dhaka.json`）；`content/base/world/` 其他資料夾；`content/base/persons/` 與其他 `content/`；`src/`；spec；`content/lore/`。
- 件數 gate：新檔超過 34 個就停下回報；容量 gate：單檔超過 6 KB 就停下回報。任一觸發都停。

## 內容配方

- **引用規則**：所有 `person/*` 必須出現在 `git ls-files content/base/persons` 的輸出裡（未 commit 的別線檔不准引用）；所有 `effect/*` 特質必須出現在 `git ls-files content/base/effects`；背景 `culture` 必須有對應的 `content/base/world/names/mythic-{文化}.json`（已存在：`bengal`、`norse`、`greek`、`egypt`、`han`、`yamato`、`mesopotamia`、`celt`、`nahua`、`quechua`、`polynesia`——動手前 `ls content/base/world/names/` 確認）。
- **對白 15 檔**：檔名「人物名-話題」（例 `glove-debt.json`、id `dialogue/glove-debt`），`person` 指該人物，`name` 填人物中文名。先寫開局船員：葛西 蓮、陳小海、伊爾瑟・布蘭特、瑪拉・奧可耶、手套（各 2 檔），其餘給已 commit、且你在背景裡指定為招募對象的新人物（各 1 檔）。每檔 1–3 個 topic；topic 的 `when` 用安全 ref（engine-rules 第三節，含 `person.mood`、`flags.*`、`restraint.*`、`debt.ratio`），至少 5 檔有 `choices`（第一個選項無 `requires`），效果照白名單（mood 可用 `{"person/{該人物}":±1}`）。可讀事件線設下的旗標（`ls content/base/world/events/` 看別的工人寫了什麼旗標；讀不到也沒關係，沒設過的旗標讀 0）。手套是塞勒涅登錄機魂「手套」的複本，照本宣科、偶爾露出被複製過的痕跡；一般機魂沒有鮮明個性（S 級以上才有，很罕見）。
- **背景 12 檔**：每個背景 `person` 指一個已 commit 的 human（新人物優先，一個人物最多被兩個背景用）；`name` 寫出身（例「第七哨難民孩子」「塞勒涅退役測試駕駛」「潮信會叛教者」「殼學會學生」「鐵砧獵團回收技師」）；`attrRanges` 只用 accuracy／evasion／resolve／initiative／perception／control，範圍寬 10–25、量級對照人物檔原值；`hireFee` 80–900、`wageMult` 0.6–1.6（貴的有經驗、便宜的獸緣高或有傷）；`traits` 可列已 commit 的特質效果。
- **招募池 3 檔**：`recruit-pools/chittagong.json`（`node/chittagong`，碼頭與漁民）、`recruit-pools/singapore.json`（`node/singapore`，渡輪港的退役名冊與背面熟面孔）、`recruit-pools/reed-marsh.json`（`node/reed-marsh`，蘆葦澤船屋難民）；id 為 `recruit/{檔名}`；`size` 3–4、`refreshOn:"quarter"`；`sources` 引用你的背景（每池 3–6 個，weight 數字 1–5）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-world-dlg --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-world-dlg --up …` | 上線 PROGRESS 與終局回報 |
| `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world` | 每類寫完；末行 `OK` |
| `node src/ops/content/check.ts content/base` | 每類寫完；末行 `OK 0 errors` |
| `git ls-files content/base/persons content/base/effects` | 查可引用的人物與特質 |

## 資源與禁區

- **可寫程式碼線**（本線只寫內容資料檔）：只寫「範圍」列的路徑、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-dlg/` 與 `/tmp/cx-world-dlg/`；可跑上表指令與 `npm run check`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；**不 commit**（commit 由領導做，你只回報改了哪些檔）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不跑 `npm test`（領導在外面跑）。

**分清錯誤來源**：工具或環境出錯（權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的腳本出錯 → 自己修。

## 工作

1. 上線發 PROGRESS。
2. 背景 → 招募池 → 對白；每類寫完跑 lint 與 check。
3. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-dlg/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 資料 30 檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/{dialogues,backgrounds,recruit-pools}/`（新檔） |

REPORT 四段（做了什麼／產出（每檔一行：id、人物或節點、一句定位）／沒做到或證據不足的（例：候選人沿用人物模板姓名的 SPEC-GAP）／需要決定的事），末尾「以後交接書該點名的工具」。另附「最得意的 3 件」各一句。

## 驗收（固定 3 條，做完就停）

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world` 末行 `OK`。
2. `node src/ops/content/check.ts content/base` 末行 `OK 0 errors`（別線未提交檔造成的錯誤要在 REPORT 逐條指出不是你的檔）。
3. `git status --short content/base/world` 中本線只有上述三個資料夾的 `??` 新檔，沒有 ` M`；件數 dialogues 15、backgrounds 12、recruit-pools 3。

## 失敗怎麼處置

- 測出來是壞的 → 修到綠；修不好就移除該檔並在 REPORT 記；全部做不出才發 `FAILED`。
- 測不出來（沒跑成）→ 不回滾，發 `BLOCKED`，寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-world-dlg`。本線團隊：`teams/content-world`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-world-dlg --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-dlg/REPORT.md`。
- 結束時必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

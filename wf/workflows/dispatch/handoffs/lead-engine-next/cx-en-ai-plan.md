# 任務：寫「AI 會在合理時機用自護招與友方支援招」的診斷與修正計畫，量出修正前基準，不改任何既有檔（cx-en-ai-plan）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀下列每份（**親自讀，不靠本交接書的摘要**；PLAN 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ai 列在 `wf/workflows/common/code-map.json`，用 tabledb 查）、`wf/workflows/testing.md`（驗證表在 `wf/workflows/testing-checks.json`，用 tabledb 查第 5、6、10 列）、`wf/workflows/planning/specs/core/README.md` 與它指到的 AI 相關 spec 檔、`wf/workflows/dispatch/handoffs/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md`（只讀第 10 段與講 AI 鍵的段落）、本檔。程式碼從 `src/ai/` 全部、`src/sim/probe.ts`、`src/sim/measure.ts` 讀起，需要再往 `src/rules/` 查。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

engine-backlog 第 68 列：自護招不被使用——`protect` 只在有護衛指派（`ctx.assignment?.protect`）時計分、原地 `escape` 評分為 0、berserk 政策不評增益；lead-kaiju2 因此把 8 招自護／原地側閃招的 `ai.tactics` 權宜改成 `buff`，舊的盾甲舉盾、叩闕甲豎甲同病；青鬣豎鬣（berserk）與伏耳（sniper-perch D）在 probe 中從未出手。第 73 列：AI 不用友方排燼招 `ability/m2-relieve-ally`（排燼扶架），六台支援機（IX-08、衡梁-I型、GL-02、扶梁、留燈-合印、歸燈-燕鷗）在 AI 手上不會用。唯一目標：**寫一份計畫，讓產出線照做後，AI 會在合理時機（自己受威脅、隊友燼高或受傷）選用自護／側閃與友方支援招，而且不在不合理時機亂用。** 你不改任何既有檔。

## PLAN.md 要寫的內容（七節）

1. **盤點**：所有「自護（對自己的 protect／shield 類）」「原地側閃（escape 但不位移或位移極小）」「友方支援（對隊友的 buff／protect／heal／卸燼）」的能力 id，逐列：檔路徑、現在的 `ai.tactics`、lead-kaiju2 改鍵前的原分類（從 `git log -p` 或 kj2-plan 查）、持有者（frame／monster／component，至少給 2 個）、效果一句。8 招權宜改鍵的要全部點名，加舊盾甲舉盾、叩闕甲豎甲。
2. **病因**：在 `src/ai/` 逐條指出哪個函式、哪個條件讓這些招拿 0 分或輸給攻擊（用函式名與條件原文引用，不用行號）；涵蓋 protect 無指派、原地 escape、berserk 不評 buff、友方 buff 不看目標燼量／需求，和你另外發現的原因。
3. **設計**：每個病因一個修法，寫出評分公式（輸入是什麼：自身危險度 `danger.ts`、燼量／池比例、隊友受威脅、剩餘 AP…）、新參數名與預設暫值、參數放哪（照 conventions「數值不寫死在程式碼」：既有權重表在哪就放哪，若在程式碼常數就沿用並註明）。要防亂用：例如無威脅時自護應輸給攻擊、隊友燼低時卸燼招不選、同一回合不連疊同一 buff。
4. **基準量測**：寫一支可重跑的量測腳本 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/measure-support.ts`（只讀 repo，用既有 `src/sim/probe.ts` 或 sim API，固定 seed，輸出 JSON：每個盤點能力的 AI 使用次數、出手機會數（持有者存活且行動的回合數）、各情境勝率），涵蓋上面的持有者；**現在就跑**，把修正前數字寫進 PLAN，並寫明重跑指令。另外跑 `node src/sim/measure.ts` skirmish seed 1–5，記 `waitRatio`／`pass` 基準。
5. **影響面**：哪些測試與黃金會因 AI 改動變（`test/golden/`、`test/ai/balance.test.ts`、`test/campaigns/`、`src/ops/sim/fixtures/`、fuzz）；預估範圍並說明怎麼驗（產出線改完要重產哪些、要不要跑 `node test/campaigns/rerecord.ts`）。
6. **改回原分類的建議**：逐招建議修好後維持 `buff` 或改回原分類（`protect`／`escape`），理由一句；判準：改回後語意較正確且量測使用次數不低於 buff 版。
7. **產出線工作清單**：要改的檔（明列路徑）、新增／修改的單元測試（至少：無威脅時不自護、受威脅時自護、隊友燼高時用卸燼招、隊友燼低時不用、berserk 會用 self buff）、預估改動檔數。

## 範圍（排除法寫死）

- 只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/` 下的 `PLAN.md`、`measure-support.ts`、量測輸出 `baseline.json`。
- 不做：任何 `src/`、`content/`、`test/`、`wf/`（上述目錄除外）的寫入；不 commit；不刪檔；不改萬潮葬王相關（另一條線）。
- 件數 gate：盤點能力超過 40 招就停下回報；容量 gate：`PLAN.md` 超過 40 KB 或量測單次超過 15 分鐘就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查 code-map.json、testing-checks.json |
| `npm run content:probe -- frame/ID… --json -`（repo 根） | 量測持有者能力使用次數 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | skirmish 基準 |
| `grep`／`git log -p -- 路徑` | 查原分類與持有者 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-en-ai-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上面三個檔；其他一律唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。
- **子代理上限 1 個**，模型隨意；做實質工作也要親自讀「先讀」全部。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、量測腳本出錯 → 自己修、繼續做。沙箱內 `node --test` 計數可能不準，以 exit code 為準。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-en-ai-plan --up PROGRESS '已讀完先讀清單，開始盤點自護與支援招' < /dev/null`）。
2. 盤點與病因（第 1、2 節）。
3. 寫量測腳本、跑基準（第 4 節）。
4. 寫第 3、5、6、7 節。
5. 回報。

## 交付

**PLAN 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/PLAN.md`**，回覆只要 5 行摘要＋PLAN 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/PLAN.md` |
| 量測腳本 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/measure-support.ts` |
| 基準輸出 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/baseline.json` |

PLAN 末尾加「沒做到或證據不足的」「需要決定的事」「以後交接書該點名的工具」三小段。

## 驗收（固定 4 條，一條不多，做完就停）

1. `PLAN.md` 存在，開頭有「已讀清單」，七節齊全。
2. 第 1 節點名 lead-kaiju2 改鍵的 8 招＋盾甲舉盾＋叩闕甲豎甲＋`ability/m2-relieve-ally`，每招有原分類與持有者。
3. `node /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/measure-support.ts`（在 repo 根跑）exit 0，輸出與 `baseline.json` 一致（同 seed 可重現）。
4. 第 2 節每個病因引用了函式名與條件原文。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（量測跑成了但無法重現）→ 寫進 PLAN「證據不足」，發 `FAILED`。
- **測不出來**（指令沒跑成）→ 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-en-ai-plan`。本線團隊：`teams/engnext`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-en-ai-plan --up DONE '自護與支援招診斷計畫完成，基準已量' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/PLAN.md`（STATUS 與標題依實況換成 DONE／BLOCKED／NEEDS-USER／FAILED 與一句自足結論）。
- 結束時必發終局 STATUS 之一；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

codex 工人的 ROSTER 格已由領導代登記。

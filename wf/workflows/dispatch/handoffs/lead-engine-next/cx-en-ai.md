# 任務：在隔離 worktree 照已審計畫修 AI 評分，讓自護、原地側閃與友方卸燼／支援招在合理時機被選用（cx-en-ai）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀下列每份（**親自讀，不靠本交接書的摘要**；REPORT 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`（驗證表 `wf/workflows/testing-checks.json` 第 0、3、5、6、9 列用 tabledb 查）、`wf/workflows/planning/specs/core/ai.md`、**計畫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/PLAN.md`（全文）**、本檔。worktree 內容＝主 repo HEAD；相對路徑都相對 worktree。

## 背景與唯一目標

計畫（PLAN.md）已找出八個病因 A–H 與修法。領導審過，**照計畫做，但以本檔「領導裁示」為準**（衝突時本檔優先）。唯一目標：AI 在自己受威脅時會用自護／原地側閃招、在隊友燼高（或真的受傷且招能治療）時會用友方支援招，無威脅、隊友燼低時不亂用、不同回合重複空放。

## 領導裁示（覆蓋 PLAN 的對應段）

1. **做**：病因 A、B、D、E（PLAN 第 3 節 `support.ts`、`Vdef`／`Vheal`／`Vpool`、移除 protect 指派硬閘、escape 原地防護收益、同回合防重複、無效招不准靠 objectiveMove 救回）；C（berserk 允許有正收益的 self buff／自護，照 PLAN 公式）；F 只做 `tactical` 的支援站位（`maxSupportMoves`），以及 `sentinel`／`regroup`／`swarm` 的「**不移位**的 self／ally 支援候選」；`flee`、`scripted` 不改。
2. **不做 G**（species profile params 併進一般評分）：影響全部怪獸、超出本題。PLAN 的 G 段只寫進 REPORT「需要決定的事」，程式不動。
3. **`Voff`（攻擊增益）簡化**：不做 lookahead 模擬攻擊。純攻擊增益招（沒有防護／治療／卸燼收益的 buff）**沿用現行分數公式**，行為不變；只有帶防護（閃避等）、治療、inverted 池卸載收益的招走新公式。混合招取「新收益」與「舊公式」較大者，不相加。
4. **八招改回原分類**：照 PLAN 第 6 節 A/B 判準（同一修好引擎下，原分類版使用次數不低於 buff 版、且無威脅空放不增加）逐招決定；達標就改 `content/base/abilities/` 該檔的 `ai.tactics`，不達標維持 buff。REPORT 逐招列 A/B 數字與決定。
5. **效能**：`node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/bench-ops.ts 500` 的 ms／步，改後不得比改前慢超過 30%；超過就把預覽重算收斂（例如只對有支援 tactic 的候選做 before／after 差值）。
6. **黃金不由你重錄**：`test/golden/`、`test/campaigns/`、`src/ops/sim/fixtures/` 若因 AI 軌跡改變而紅，**不要改期望、不要跑 `GOLDEN_UPDATE` 或 `rerecord.ts`**；REPORT 列出哪幾檔紅、紅的訊息一行。領導合併另一條線後統一重錄。除這些黃金外 `npm test` 要全綠。

## 範圍（排除法寫死）

- 只寫（都在 worktree 內）：`src/ai/**`（含 `adapters/`）、`test/ai/**`、`content/base/abilities/` 下 PLAN 第 6 節八個檔、`content/base/aiprofiles/*.json`（只在必要時加 params）、`wf/workflows/planning/specs/core/ai.md`（berserk 自增益與支援評分各一小段，段首標 `SPEC-GAP 補（2026-10-26 lead-engine-next）`）；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-01/`。
- 不做：`src/rules/`、`src/ops/`、`src/sim/`、`src/ui-adapter/`、`src/mcp/`、`src/core/`、其他內容檔、`content/lore/`、`content/index/`、`wf/`（上列 spec 與報告目錄除外，含 code-map.json——領導更新）；不改既有能力數值、不新增能力；不刪檔；不 commit。
- 件數 gate：新增＋修改的檔超過 30 個就停下回報；容量 gate：任一新檔超過 25 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一步 |
| `node wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/measure-support.ts`（在 worktree 根跑；worktree 內有同一份腳本，相對 import 讀 worktree 的程式與內容） | 改後量測；與同目錄 baseline.json 對照 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | skirmish 五 seed 須全 `pass:true` |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/bench-ops.ts 500` | 改前、改後各一次 |
| `npm run fuzz -- --runs 60 --mode mix --seed 1` | 收尾一次 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-en-ai --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**：worktree 是 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-ai/`；只寫「範圍」列的路徑；**不 commit**（commit 由領導做）。`node_modules` 是領導放的符號連結，`git status` 顯示它未追蹤是預期，不要動它。臨時腳本與筆記放 `/tmp/cx-en-ai/`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。整檔改寫用單一操作。
- **子代理上限 1 個**，模型隨意，只准為推進正事開；做實質工作也要親自讀「先讀」全部，受同一範圍與閘門約束。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯、測試因你的改動變紅 → 自己修、繼續做。沙箱內 `node --test` 計數可能不準（每檔只算 1 項），以 exit code 為準並在 REPORT 註明。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-en-ai --up PROGRESS '已讀完先讀清單，開始改 AI 支援評分' < /dev/null`）；跑一次 bench-ops 記改前 ms／步。
2. `support.ts` 與 `RulesQuery` 擴充、`score.ts` 改 A／B／D／E；寫 `test/ai/support.test.ts`，至少涵蓋 PLAN 第 7 節前五條（無威脅不自護、受威脅會自護、隊友高燼用／低燼不用、berserk 會用 self buff、不連疊）。
3. berserk（C）、tactical 支援站位與 sentinel／regroup／swarm 不移位支援（F）；補對應測試。
4. 跑量測腳本存 `ai-01/after-buff.json`（八招仍 buff 版）；再做八招 A/B，決定改鍵，最終版量測存 `ai-01/after.json`。
5. skirmish、bench、fuzz、spec 補段。
6. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-01/REPORT.md`**（檔名被擋改寫同目錄 `report.md`），回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、測試、內容、spec | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-ai/…` |
| 量測 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-01/after-buff.json`、`…/ai-01/after.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-01/REPORT.md` |

REPORT：開頭「已讀清單」；再四段——做了什麼（含 `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-ai status --short` 原文）、產出（測試數；**38 招修正前後使用次數／出手機會對照表**，以 baseline.json 與 after.json 為準，另列六台卸燼支援機高燼／低燼第一輪使用；八招 A/B 數字與決定；skirmish 五 seed；bench 前後 ms／步；紅掉的黃金清單）、沒做到或證據不足的、需要決定的事（含 G 段）；末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內 `npm run check` 末行 0 errors、`npm run typecheck` exit 0；`npm test` 除第 6 條裁示的黃金檔外全綠（REPORT 列紅檔）。
2. `node --test test/ai/support.test.ts` exit 0，涵蓋工作第 2 步五項。
3. `ai-01/after.json` 存在；REPORT 對照表顯示六台卸燼機在高燼第一輪使用次數 ≥ 低燼第一輪，且 `kx-shield-raise`、`kx-carapace-brace` 使用次數 > 0。
4. skirmish seed 1–5 全 `pass:true`；bench 改後 ms／步 ≤ 改前 ×1.3。
5. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西；e2e 與 wf-lint 由領導跑。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（做成了但驗收不過、修不好）→ 保留改動，發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-en-ai`。本線團隊：`teams/engnext`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-en-ai --up DONE 'AI 自護與支援招評分修正完成' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-01/REPORT.md`（STATUS 與標題依實況換成 DONE／BLOCKED／NEEDS-USER／FAILED 與一句自足結論）。
- 結束時必發終局 STATUS 之一；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

codex 工人的 ROSTER 格已由領導代登記。

# 任務：在隔離 worktree 照已審計畫實作萬潮葬王副線引擎（王跡、腳本式北行、不可交戰在場單位、事件改區、守牆情境＋捕捉一次）並落 14 列文案（cx-en-wc）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀下列每份（**親自讀，不靠本交接書的摘要**；REPORT 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`（驗證表 `wf/workflows/testing-checks.json` 第 0、1、2、9 列用 tabledb 查）、`wf/workflows/dispatch/handoffs/plan-wanchao/plan.md`（第三節守則是硬約束）、`wf/workflows/dispatch/handoffs/lead-wanchao/base-drafts.json`（全文含「執行說明」）、**計畫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-plan/PLAN.md`（全文）**、本檔。worktree 內容＝主 repo HEAD；相對路徑都相對 worktree。

## 背景與唯一目標

計畫（PLAN.md）已把 E1–E5 與 14 列文案的落點、函式接點、測試清單寫好。領導審過，**照計畫做，但以本檔「領導裁示」為準**（衝突時本檔優先）。唯一目標：營運層有王跡欄、萬潮葬王在 8–24 蝕月某次大潮夜照腳本北上、跟蹤偵察戰場上牠在場但打不到、北行後孟加拉灣北岸一區變淺蝕、第 40 蝕月連珠潮夜在灣內可接可拒守牆且只有主動迎戰才可打、捕捉全遊戲一次；14 列文案原文進 `content/base`。

## 領導裁示（覆蓋 PLAN 的對應段）

1. **不預置北郊裂縫**（砍 PLAN 第 3 節「北郊裂縫缺口的補法」與 8.1 的北郊初始化 ID 決策）：北行終站當夜，查以 (132,92) 為中心、曼哈頓距離 ≤ 4 內、phase 不是 sealed／receding／closed 的既有 rift；有就取最近一個（同距取 id 字典序最小）寬度上移一級、cap A，記 `northBranch:"raised"`；沒有就記 `"passed"`（文案照「已封口報黑脊經過」那支）。不新增開局 rift、不改開局 state 的其他部分。
2. **E4 改讀為「這一區變成淺蝕」**（覆蓋 PLAN 第 5 節的「轉淺」語意與開局預置 event patch）：**不在開局建任何 patch**。北行完成時呼叫 `blightShift`：在 x=129..131、y=97..99 九格中取「目前不屬任何 patch、不在城市 footprint」的格，建一個 event patch（`origin:"event"`、`rift:""`、非核心、永久淺蝕 `depthOverride:"shallow"`）；可用格不連通時取最大連通塊；可用格 0 則不建、記事件旗。effect 形狀 `{blightShift:{area:"wanchao-north-coast", cells:[...], to:"shallow"}}`，`to` 只准 shallow；同一 area 第二次套用回 true 且不重發事件。其餘 PLAN 第 5 節的排除（pressure 不計、無野群、不變量例外、只能由 blightShift 寫）照做。
3. 其餘照 PLAN：clock.month 零起算（E5 用 month=40／day 1120）、北行日在複本 RNG 抽且不吃主 RNG／warRng／actorRng、presence 走 `status:"presence"` 讓 rules 的 `isActive` 自然排除、光環用既有 `effect/kx-tidal-dread` 原數值、`engagePresence` 戰鬥指令、拍二 `engageable:false`、capture-once 旗、`wallOutcome` 只記不改城市歸屬、灣內遠端援防船不傳送。
4. **不碰 `src/ai/`**（另一條線正在改）。若發現 AI 有繞過 `isActive` 直接打 presence 的路徑，寫出最小 diff 片段進 REPORT，標「交領導合併」，不要自己改。
5. **黃金與索引不由你做**：`test/golden/` 必須維持不變（沒有 presence 的舊情境零差異）；`test/campaigns/`、`src/ops/sim/fixtures/` 若變紅，**不要改期望、不要跑 `rerecord.ts` 或 `GOLDEN_UPDATE`**，REPORT 列紅檔與一行原因（領導合併 AI 線後統一重錄）。`content/index/` 與 `wf/workflows/common/code-map.json` 不寫（領導做）。除上述黃金外 `npm test` 要全綠。
6. 守則：文案只照抄 base-drafts 原文（只准為格式切段）；不寫牠的意圖；拍二戰場牠不可交戰；不新增人物、地點檔、lore；不動 `monster/tidespine-chittagong` 與 `species/tidespine` 既有數值。

## 範圍（排除法寫死）

- 只寫（都在 worktree 內）：PLAN 第 8.1 表 #1–#41 列的路徑（`src/ops/**`、`src/core/types-def.ts`、`src/core/types-state.ts`、`schemas/content.schema.json`、`src/rules/{state,flow,turn}.ts`（必要時同目錄其他檔，REPORT 說明）、`src/sim/{run,save}.ts`、`src/ui-adapter/vm/{types,viewmodel,controller,text}.ts`、`src/ui-adapter/ops/vm/{snapshot,types}.ts`、`src/ui-adapter/ops/dom/tabs.ts`、`test/fuzz/invariants.ts`、`content/base/world/{actions,contracts,templates,factions-ops}/` 下計畫點名的檔、三份 spec 檔）以及各自同目錄的 `*.test.ts`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-01/`。
- 不做：`src/ai/`、`src/mcp/`（MCP 迎戰工具列 SPEC-GAP）、`content/lore/`、`content/index/`、`content/base/` 其他資料夾、`test/golden/`、`test/campaigns/`、`src/ops/sim/fixtures/`、`wf/`（三份 spec 與報告目錄除外）；不做四情報來源、城市存亡演算、S 世界 AI；不刪檔；不 commit。
- 件數 gate：新增＋修改的檔超過 48 個就停下回報；容量 gate：任一新檔超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一步 |
| `node src/ops/content/check.ts content/base` | 改內容後 |
| `node --test src/ops/world/lords.test.ts` | 每步 |
| `node --test test/golden.test.ts` | E3 後與收尾，必須綠 |
| `npm run sim:campaign -- --months 41 --policy idle --continue-after-end --seed 1` | 收尾：看北行日、北岸改區、第 40 蝕月觸發 |
| `npm run fuzz -- --runs 60 --mode mix --seed 1` | 收尾一次 |
| `npm run test:dom`、`npm run build` | 改 ui-adapter 後 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-en-wc --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**：worktree 是 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-wc/`；只寫「範圍」列的路徑；**不 commit**（commit 由領導做）。`node_modules` 是領導放的符號連結，`git status` 顯示未追蹤是預期，不要動它。臨時腳本與筆記放 `/tmp/cx-en-wc/`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。整檔改寫用單一操作。
- **子代理上限 2 個**，模型隨意，只准為推進正事開；做實質工作也要親自讀「先讀」全部，受同一範圍與閘門約束；兩個子代理不得同時寫同一檔。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯、測試因你的改動變紅 → 自己修、繼續做。**沙箱內 spawn 子行程的 CLI 測試 EPERM、`node --test` 計數不準是已知環境限制，不算阻塞**：REPORT 列出受影響測試檔即可，領導在沙箱外重跑。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-en-wc --up PROGRESS '已讀完先讀清單，開始實作萬潮葬王引擎' < /dev/null`）。
2. E4（裁示 2）→ E1 → E2（裁示 1）→ E3 → E5，照 PLAN 8.1 順序；每步補 `src/ops/world/lords.test.ts` 對應測試（PLAN 8.2，北郊與 E4 依裁示改寫）。
3. 文案落地（PLAN 第 7 節）、spec 三檔補段（段首標 `SPEC-GAP 補（2026-10-26 lead-engine-next）`）。
4. 收尾跑必用工具表的 sim、fuzz、test:dom、build；寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-01/REPORT.md`**（檔名被擋改寫同目錄 `report.md`），回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、內容、測試、spec | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-wc/…` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-01/REPORT.md` |

REPORT：開頭「已讀清單」；再四段——做了什麼（含 `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-wc status --short` 原文；E1–E5 各一段白話「怎麼運作」）、產出（測試數；41 蝕月 sim 的北行日、王跡三態變化日、北岸 event patch 格數、northBranch、第 40 蝕月邀請是否出現；紅掉的黃金清單）、沒做到或證據不足的（含 SPEC-GAP 清單）、需要決定的事；末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內 `npm run check` 末行 0 errors、`npm run typecheck` exit 0；`npm test` 除裁示 5 的戰役黃金檔外全綠（REPORT 列紅檔）；`node --test test/golden.test.ts` exit 0。
2. `node --test src/ops/world/lords.test.ts` exit 0，涵蓋 PLAN 8.2 七條（北郊與 E4 依裁示）。
3. 14 列文案原文逐字出現在 `content/base/world/` 下（REPORT 附每列落點路徑）。
4. REPORT 有 41 蝕月 sim 的北行日、北岸 patch 格數與第 40 蝕月邀請結果。
5. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西；e2e 與 wf-lint 由領導跑。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（做成了但驗收不過、修不好）→ 保留改動，發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-en-wc`。本線團隊：`teams/engnext`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-en-wc --up DONE '萬潮葬王副線引擎與文案落地完成' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-01/REPORT.md`（STATUS 與標題依實況換成 DONE／BLOCKED／NEEDS-USER／FAILED 與一句自足結論）。
- 結束時必發終局 STATUS 之一；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

codex 工人的 ROSTER 格已由領導代登記。

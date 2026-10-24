# 任務：為 npm run check 加內容數值與可用性檢查（錯誤／警告分級），擋住 codex 填錯的內容

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-check`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。背景：`wf/workflows/dispatch/handoffs/lead-content-mech/REPORT.md`、`lead-content-ancient/REPORT.md`「引擎事實」、`lead-playtest/issues.json` 的 ISS-023（python 查）。程式：`src/content/loader.ts`（`checkMerged`、`loadPacks`、CLI 輸出 `WARNING`／`ERROR` 行）、`src/rules/{pools,command,attack,movement,effects}.ts`（引擎實際怎麼用欄位）、**`src/ai/`（以當下工作樹為準：`src/ai/policies/tactical.ts` 候選生成、`src/ai/score.ts`；另一條線 lead-ai-objective 正在改它，開工與收尾各讀一次）**。

## 背景與唯一目標

使用者要交給 codex「只填內容」。過去內容線踩過的坑（armorPen 寫成 10、主動招 costs 空、熱量池付成本方向寫反、對怪獸掛 person-scope 效果、寫了 AI 不會用的能力形態、soft 池無閾值帶）現在 `npm run check` 都不會報。**唯一目標：`npm run check` 對這些情況報錯或警告（分級），每條規則有能變紅的測試，現有內容 0 錯。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：新增 `src/content/lint.ts`（規則全部在這裡，每條有穩定 id，如 `num-armorpen`），在 `src/content/loader.ts` 的 `loadPacks` 尾端**加一行呼叫**把結果分進 `errors`／`warnings`（另一位工人同時在 `checkMerged` 末尾加怪獸檢查——改前重讀檔、只做局部 patch，不碰它的段落）；CLI 輸出的每行帶規則 id；新增測試 `src/content/lint.test.ts`。
- 規則（領導定分級；細節你定，偏離寫 REPORT）：
  - **錯誤**：DamagePacket `armorPen`／`resistPen`／`crit` 為常數時不在 [0,1]；`accuracy` 常數超出 [-100,100]；`target.range.min`／`max` 常數 < 0 或 min > max；`costs[].amount`、`cooldown`、`usesPerBattle` 常數 < 0；`mode:"activated"` 且有 `packets`（主動攻擊）而 `costs` 為空（`mode:"reaction"` 除外）。
  - **警告**：(a) 熱量類池（`inverted:true`）方向——`costs` 對 inverted 池寫負值、或 `produces` 對 inverted 池寫正值且 ability 名稱／tags 看起來是散熱（你定判準，寫進 REPORT）；(b) 只出現在 species／monster 能力清單（不在任何 frame innate 或 component 上）的能力，其 effects 會套 `scope:"person"` 的效果；(c) AI 不會使用的能力形態——**以 `src/ai/` 當下候選生成為準**列出（例如 `mode:"passive"`、`reaction` 的 trigger 不是規則支援的事件、`target.kind` AI 不提的種類、`ai.tactics` 全為 0 或缺鍵）；把判準寫成 lint.ts 裡一張註明「來源：src/ai/... 函式名」的表；(d) `capKind:"soft"` 的池沒有任何 `bands` 涵蓋 max 以上（ISS-023）；(e) `cls:"mechanical"` 的 frame 沒有 `defaultLoadout` 且 innateAbilities 沒有任何帶 packets 的能力（上場空手）。
  - NumExpr 不是常數時跳過數值規則（不求值）。
  - 現有 `content/base` 跑出來的**錯誤必須為 0**：若是內容真錯（例如 armorPen > 1），直接修 `content/base/abilities/`、`components/`、`effects/` 裡那一檔並列表；若是規則判準太嚴，調判準。警告不必清零，REPORT 按規則 id 統計件數並列前 10 筆。
- 不做：`src/ai/`、`src/rules/`、`src/sim/`、`src/ops/`（含 `src/ops/content/check.ts`）、`src/mcp/`、`src/ui-adapter/`；`content/base/` 除上述三個資料夾以外的檔（frames、scenarios、species、monsters、persons、registries、world 歸別人）；`schemas/`。
- 件數 gate：改動＋新增檔超過 25 個就停下回報；容量 gate：diff 超過 120 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-check --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `node src/content/loader.ts content/base` | 等於 `npm run check`；看 WARNING／ERROR 行 |
| `loadPacks`（`src/content/loader.ts`）吃記憶體內容包 | 測試裡證明每條規則能變紅 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-check/`；臨時檔只放 `/tmp/cx-gb-check/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ai/`、`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；讀 `src/ai/` 候選生成，整理「AI 會用的能力形態」表；`inbox_poll --once`。
2. 寫 `lint.ts`＋接進 loader＋測試（每條規則一個應紅、一個應綠的案例）；`inbox_poll --once`。
3. 跑 `npm run check`：錯誤歸零（修內容或調判準），統計警告；收尾前再讀一次 `src/ai/` 確認表沒過時（有變就更新）。
4. 寫 REPORT（附「規則清單」表：id／分級／判準／來源／現有內容命中數）並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-check/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/content/lint.ts`、`src/content/loader.ts`（只加呼叫） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/content/lint.test.ts` |
| 內容修正（若有） | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/{abilities,components,effects}/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-check/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `src/content/lint.test.ts` 對 5 條錯誤規則與 5 條警告規則各有應紅與應綠案例，`node --test --test-isolation=none src/content/lint.test.ts` 全過；REPORT 一句說怎麼證明會變紅。
2. `npm run check` 回 `OK 0 errors, N warnings`；每行 WARNING 帶規則 id。
3. REPORT「規則清單」表列全部規則（含現有內容命中數），AI 形態表標明來源函式。
4. `npm run typecheck` 0 錯；`node --test --test-isolation=none src/content/*.test.ts` 0 fail。
5. REPORT 存在且有四段＋規則清單表＋內容修正清單（沒有就寫「無」）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-check`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-check --up PROGRESS 'cx-gb-check 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-check --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-check/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-check --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。

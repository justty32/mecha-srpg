# 任務：營運回寫接「意圖受挫撤退」——擊退＝契約達成、玩家撤退＝可重打、勢力部隊撤退＝作戰受挫

> 領導 `lead-gaps-ops` 寫給 codex 工人 `cx-ops-retreat`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。背景：`wf/workflows/planning/design-notes/mechanics.md` 末段（使用者 2026-10-24 裁示：怪獸與勢力都有意圖，達不到就撤退；戰鬥以撤退收場取代 timeout 平手；**「不是必須全殲滅」——擊退（敵方撤光）＝勝利**）；若該檔路徑不同就 `grep -rln 意圖 wf/workflows/planning/design-notes/`。spec：`wf/workflows/planning/specs/ops/battle-interface.md`（三、戰果回寫）、`data-model-factions-contracts.md`（部分成功→半額）、`data-model-world-map.md`（裂縫七態）、`data-model-operations-war.md`、`mercenary-contracts.md`。程式：`src/ops/sortie/apply.ts`（`draw`、`settleContract`、`onBattleRift` 那段）、`src/ops/contracts/tally.ts`、`src/ops/world/rifts.ts`、`src/ops/war/{merc,operations,resolve}.ts`、`src/rules/flow.ts`（`BattleResult`：`winner`、`reason`、`units[].status` 已有 `"retreated"`）。

## 背景與唯一目標

戰鬥規則線 `lead-gaps-battle` 正在實作「意圖受挫撤離」：撤離方在戰果裡標成未達成意圖（介面還在落地，用 `git log --oneline -- src/rules src/sim src/core` 看它有沒有加 `BattleResult` 新欄或新 `reason`）。營運回寫目前只認「全殲」與 `timeout`。**唯一目標：營運回寫把戰鬥的撤退結局分類成明確的營運後果，且不依賴全殲；各情況有測試釘住。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **分類函式**（新檔 `src/ops/sortie/outcome.ts`，純函式）：`classifyOutcome(result, sortie) → "win" | "repelled" | "withdrew" | "lost" | "timeout"`。判定：敵方單位（owner 為 enemy）全部 `dead`／`retreated` 且至少一台 `retreated`、或 `reason` 是規則線定的擊退值 → `repelled`；玩家方出戰單位全部 `retreated`（或規則線的玩家撤離值）→ `withdrew`；`winner===null && reason==="timeout"` → `timeout`；其餘照 `winner`。規則線若已加欄位（例：`withdrawn?: slot[]`、`intent?`）就**優先讀它**，否則用上面的 units 推斷；介面不確定時讀可選欄並在測試裡兩種都餵。另回傳 `killRatio`（敵方 dead 數 / 敵方總數）。
2. **玩家方契約**：`win`、`repelled` → 契約**達成**（`done`）；清剿類（`clear`）`repelled` 的報酬乘係數 `0.6 + 0.4 × killRatio`（係數放 `content/base/world/services/` 既有常數檔或新常數，不寫死），其餘類別全額。`withdrew` 與 `timeout` → 契約**保持 `active`、可重打**（沿用 `cx-ops-fix` 已做的平手路徑，含 greedy 連續 2 次放棄——把 withdrew 也算進那個計數）；`lost` 照舊。
3. **裂縫**：opening 期 `repelled`（先鋒被擊退）＝與殲滅先鋒同效（關閉）；anchored `repelled`（錨沒死）→ 裂縫不變態，但本潮的擴張延後一次（`nextCheck` 推遲到下個大潮，或照 spec 狀態機給一版合理規則，寫進 REPORT）；錨被殺照舊（現有路徑）。seal／defend 的 `repelled` ＝守住。
4. **勢力部隊撤退（作戰戰鬥，`trigger:"operation"`）**：勢力方 `withdrew`／被 `repelled` ＝作戰受挫：作戰進度回退或 `failed`（依 `war/resolve.ts` 現行門檻擇一）、該部隊 `morale −1`、對手關係按 `changeRelation` 小幅變動（數值放內容常數）；參戰契約依玩家所站那邊的勝負結算（`merc.ts` 的 `won` 判定改用分類結果）。
5. **契約主目標語意**：`content/base/world/contracts/*.json` 與 `content/base/world/templates/*.json` 中描述主目標為「全殲／殲滅」的文字改為「擊退／清剿」語意（只改文字欄，不改 `objectives` 結構；`grep -rn "全殲\|殲滅\|eliminate"` 找出處，`eliminate` 的戰鬥目標本身不改）；`src/ops/text/` 裡把 `eliminate` 譯成「全殲」的地方改「擊退／清剿」。
**第 5 點要等領導 order 才動**：`cx-ops-board` 還在改 `contracts/`、`templates/default.json`、`src/ops/text/`；它收線後領導會在 `orders/cx-ops-retreat.md` 放行，在那之前先做第 1–4、6 點。
6. 每類（win／repelled／withdrew／timeout × 契約；opening／anchored repelled × 裂縫；作戰撤退）各至少一條測試，先證明改前會紅。

## 範圍（排除法寫死）

- 只做：`src/ops/sortie/{apply,outcome}.ts`、`src/ops/contracts/tally.ts`、`src/ops/world/rifts.ts`、`src/ops/war/{merc,operations,resolve}.ts`（只回寫處）、`src/ops/sim/policies.ts`（只把 withdrew 算進連續平手計數）、`src/ops/text/`（只第 5 點的譯名）、`content/base/world/contracts/`、`content/base/world/templates/`（只第 5 點文字）、`content/base/world/services/`（只加常數）、對應測試檔（同目錄 `*.test.ts`，新增或只加測試）。
- 不做：`src/ops/sortie/scenario.ts`（`cx-ops-enc`）、`src/ops/crew/`、`src/ops/world/market.ts`（`cx-ops-debt`）、`src/ops/sim/` 其他檔（`cx-war-sim`）、`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/content/`、`src/ui-adapter/`、`src/mcp/`、spec、其他 `content/`。**規則線的結果型別不要自己去改 `src/rules/`**；它沒落地就照第 1 點用 units 推斷＋可選欄。
- 黃金 hash：**不要重產** `src/ops/sim/fixtures/campaign-hash.json` 與 `test/campaigns/*.hash.json`（領導收線時統一重產）。
- 件數 gate：程式檔（新增＋修改）超過 12 個、或內容檔改動超過 25 個就停下回報；容量 gate：程式 diff 超過 40 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-retreat --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `git log --oneline -- src/rules src/sim src/core` | 看規則線結果型別落地沒 |
| `node src/ops/sim/cli.ts --months 12 --policy greedy --seed N` | 回歸 |
| `npm test`、`npm run typecheck` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-ops-retreat/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`、`git log`／`git show`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（同團隊其他工人、`lead-gaps-battle`、`lead-ai-objective`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. `outcome.ts` 分類＋測試；`inbox_poll --once`。
2. 契約與裂縫回寫（第 2、3 點）；`inbox_poll --once`。
3. 作戰撤退（第 4 點）、文字（第 5 點）；`inbox_poll --once`。
4. 跑驗收、寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-retreat/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與內容 | 「範圍」列的路徑 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-retreat/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：分類 × 營運後果對照表、讀的是規則線哪個欄位（或推斷）、greedy 12 潮月 seed 1–3 各分類次數、末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯。
2. 新測試全綠（第 6 點列的每類各一條），且 REPORT 記改前會紅的證據。
3. `npm test`：`src/ops/**` 無新紅燈（別線造成的、黃金 hash 不算）。
4. `node src/ops/sim/cli.ts --months 12 --policy greedy --seed 1`（另 seed 2、3）、`--policy merc --seed 1`、`--policy idle --seed 1` 印 `OK`。
5. `grep -rn "全殲" content/base/world/contracts content/base/world/templates src/ops/text` 零命中（或 REPORT 逐條說明保留理由）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-retreat`。本線團隊：`teams/gaps-ops`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-ops-retreat --up PROGRESS 'cx-ops-retreat 上線，開始撤退結局回寫' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-retreat --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-retreat/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

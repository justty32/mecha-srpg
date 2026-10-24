# 任務：補齊戰鬥 AI 的候選與評分缺口（直線／扇形、友軍範圍增益、持續型、捕獲、純減益、大目標加權與追擊）

> 領導 `lead-ai-objective` 寫給 codex 工人 `cx-aio-tactics`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。本線接在 `cx-aio-core`（目標意識，已落地在工作樹）之後，**同一批檔案**，先讀它的 REPORT。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。前一條線 REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-core/REPORT.md`。spec：`wf/workflows/planning/specs/core/ai.md`（第 2、3 步）、`wf/workflows/planning/specs/core/data-model-abilities-effects.md` 的 `TargetSpec`／`sustained` 段。程式：`src/ai/policies/tactical.ts`（候選生成）、`src/ai/score.ts`（評分）、`src/ai/objectives.ts`、`src/rules/attack.ts` 的 `resolveAbility`（ball／line／cone 怎麼取格）、`src/rules/command.ts`（sustained 開關：已在 `u.sustained` 再下一次＝關掉）。

## 背景與唯一目標

內容線回報四個 AI 缺口，全在候選生成與評分：(1) `proposeTactical` 只對 `cell`／`ball` 產生格目標，`line`／`cone` 能力永遠不會被提出；(2) 範圍能力只瞄敵人所在格，友軍範圍增益（`friendly` 為 `"yes"`／`"only"` 的 ball／line／cone 支援技）不會被提出，`attackArea` 以外的戰術在範圍技上也不計友方受益；(3) `def.mode !== "activated"` 一律跳過，`sustained` 能力從不開；(4) 捕獲型能力（`ability/restrain`、`ability/mx-bind-shot`：`ai.tactics.capture`）評分只看傷害、`want.capture` 預設 0，幾乎不用；(5) 純減益／控制技（無傷害包，例 `ability/mx-thousand-gaze`、`ability/kx-glare-pulse`）`debuff`／`disable` 戰術的 value 只看預估傷害＝0，永遠不用；(6) 領導量到 `cx-aio-core` 的目標加權在大血量目標（巢母約 1580 HP）上幾乎無效——`damageValue` 用「傷害／剩餘 HP」，21 傷害只佔 1%，乘 4 倍仍輸給打小蟲；而且 killTarget 目標若在視野內，移動不會朝它靠。**唯一目標：補齊這六項候選與評分，每項有測試。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **line／cone 候選**：與 ball 同法——對每個在 view 裡的敵對單位所在格產生 `{ cell }` 目標（去重），合法性一律交 `checkAbility`。評分走既有 `previewOutcome`（範圍內誰受傷由規則決定），`attackArea` 已處理友傷扣分。
2. **友軍範圍增益**：`friendly` 為 `"yes"`／`"only"` 的 ball／line／cone 能力，另對友方（`!q.hostile`）單位所在格產生目標。評分：`heal`／`buff`／`protect` 戰術對範圍技改為「範圍內每個友方單位」累加（範圍內有誰：用 previewCommand 結果的事件裡出現的友方單位，或依 `resolveAbility` 的取格規則在 AI 端重算——擇一，寫進 REPORT），敵方受益要扣分（同 `friendlyFirePenalty` 的對稱：`enemyBuffPenalty`）。
3. **sustained**：`mode === "sustained"` 也提出；評分：尚未維持時照戰術權重評分，**已在 `u.sustained` 裡時不提出**（避免 AI 反覆開關；關閉時機留 REPORT 的「需要決定的事」）。
4. **捕獲價值**：`want.capture` 改為 `p.capture`（profile 預設仍 0）**加上**目標加成——目標是友方 capture 目標（`objectiveInfo(...).spare`）時 `+objCapture`；評分 `capture` 戰術的 value 不再只用傷害：`capture` value＝`damageValue` ＋ `captureValue × (目標價值)`，其中 `captureValue` 依「捕捉條件接近度」：目標部位中 `locomotion` 已損比例（公開層資訊）越高越大（spec ai.md 第 3 步「capture 看捕捉條件接近度」）。新參數 `objCapture`、`captureValue` 進 DEFAULTS、profile 可覆蓋。目標不在任何 capture 目標、profile 也沒設 `capture` 時，分數與現在相同。
5. **減益／控制估值**：`debuff`／`disable` 戰術的 value＝`damageValue`（照舊）＋**效果價值**：能力 `effects` 中會落在目標上的效果（`on` 為 `hit`／`target` 一類，看 `resolveAbility` 怎麼套），每個效果依其 `EffectDef`（`contribs` 對目標屬性的負向修正量、`tags` 含控制類如 `stagger`／`suppressed`／`jammed`／`numb`／`marked`／`restraint`）估一個係數，乘 `valueWithFocus(目標)`（已含目標威脅度與目標加權）×`hit`；目標身上已有同 id 效果且 `stack.policy` 不疊加時價值折半或歸零（擇一寫進 REPORT）。新參數 `debuffControl`、`debuffAttr`、`debuffMark` 進 DEFAULTS。
6. **大目標的目標加權與追擊**：`damageValue` 對有目標加成（`objectiveTargetFactor > 1`）的單位，傷害比例改用 `max(傷害／剩餘HP, 傷害／objHpScale)`（新參數 `objHpScale`，預設你定、建議 200 左右，寫依據）；`objectiveMoveValue` 加一項：友方 killTarget 與孵化源中**在 view 裡**的敵對單位，`objHunt × (d(from,t) − d(to,t))` 朝最近的一個靠近（新參數 `objHunt`）。看不見就不追（不讀隱藏資訊）。量測必跑 anchored 凍結 15 場與 rift-edge-nest，記 nmHits／targetHits 與勝負；**若追擊讓 anchored 或 rift 的我方死亡明顯變多（REPORT 給數字），就把 `objHunt` 預設調到不惡化為止**。
7. **passive**：`mode:"passive"` 的能力不提出（不是主動行動）；只在 REPORT 記「passive 目前是否被規則讀取」的查證結果（grep `src/rules/`），不改規則。
8. **回歸**：沒有 line／cone／友軍範圍／sustained／capture／純減益能力、也沒有目標加成單位的情境，行為與 `cx-aio-core` 完成時逐位元相同。

## 範圍（排除法寫死）

- 只做：改 `src/ai/policies/tactical.ts`、`src/ai/score.ts`、`src/ai/objectives.ts`（只為第 4 點讀 `spare`）；新增 `test/ai/tactics-coverage.test.ts`；必要時擴充 `test/ai/stub-rules.ts`、`test/ai/fixtures/abilities.json`（只加、不改既有）。
- 不做：`src/rules/`、`src/core/`、`src/sim/`、`src/ops/`、`src/ui-adapter/`、`src/mcp/`、`content/`（任何內容檔都不改）、spec、`wf/`（你的 REPORT 除外）、`test/golden/`、其他 `test/` 檔。不改十分律與傷害公式。不改 `src/ai/rules-query.ts` 介面。
- 件數 gate：新增＋修改檔合計超過 8 個就停下回報；容量 gate：diff 超過 60 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-aio-tactics --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | 回歸：五行 hash 與你開工時量的相同 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/scenario-measure.ts scenario/rift-edge-nest 1 2 3 4 5` | 回歸：每 seed 分出勝負 |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 效能：ms／步 ≤ 開工時 1.5 倍 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored` | 第 6 點：anchored 15 場勝場、`nmHits`、我方損失 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-aio-tactics/`。可跑 `node`、`node --test`、`npm test`、`npm run typecheck`。**不要 commit**（領導做）。工作樹有別線未 commit 的改動——不碰、不還原。
- 開工先量一次 skirmish 五個 hash、rift-edge-nest、bench 當你的基準（工作樹內容檔別線正在新增，基準以你開工當下為準）。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞。

## 工作

1. 量基準；實作設計第 1–3 點＋測試；`inbox_poll --once`。
2. 實作第 4、5 點＋測試；`inbox_poll --once`。
3. 實作第 6 點、查第 7 點；量 anchored／rift；`inbox_poll --once`。
4. 回歸量測；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-tactics/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/`（tactical.ts、score.ts、objectives.ts） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/tactics-coverage.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-tactics/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），附表「新參數（名稱、預設、意義）」「回歸量測（開工／完成；含 anchored 15 場勝場·nmHits·我方損失、rift 每 seed 勝負·targetHits·死亡）」，以及第 7 點 passive 的查證一段；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `test/ai/tactics-coverage.test.ts` 至少 8 條、各對應一項：line 攻擊會被提出並選中、cone 攻擊會被提出並選中、友軍範圍增益會被提出且範圍內友方越多分越高、sustained 未維持時會開且已維持時不再提出、capture 目標使捕獲能力分數高於同傷害的普通攻擊、純減益技分數 > 0 且對高威脅目標高於低威脅目標、大血量的目標加成單位在同等條件下勝過小目標、看得見的 killTarget 會被追近（看不見時不追）；每條能變紅（REPORT 一句說怎麼證的）。
2. 沙箱外 `test/ai/`、`test/sim/` 0 fail；`npm run typecheck` exit 0（領導重跑）。
3. skirmish seed 1–5 hash 與你開工時相同、全 `pass:true`。
4. rift-edge-nest seed 1–5 每 seed winner 非 null；bench ms／步 ≤ 開工 1.5 倍。
5. REPORT 存在且有四段＋兩附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留程式、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-aio-tactics`。本線團隊：`teams/ai-objective`。上線先發 `wf/tools/inbox_mail.sh cx-aio-tactics --up PROGRESS 'cx-aio-tactics 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-aio-tactics --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-tactics/REPORT.md`（`DONE` 換成實際 STATUS 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記。

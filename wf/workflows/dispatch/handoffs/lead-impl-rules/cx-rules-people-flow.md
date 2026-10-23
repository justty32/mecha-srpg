# 任務：實作 rules 人物與戰局六檔（士氣、傷勢、意志、控制、戰局流程、目標）、24 個測試與 3 個 people 黃金情境

> 領導 `lead-impl-rules` 寫給 codex 工人 `cx-rules-people-flow`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含 `contract.md`（同目錄）——§0、§4、§6、§7 是你的匯出介面與資料格式，名稱與簽名照抄；§2、§3 是你唯一可依賴的 core 介面；§5 只供你知道 combat 線會發哪些信號與事件。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/contract.md`、core 線已交付的 `src/rules/{state,contribs,pools,effects,hooks}.ts`、凍結檔 `src/core/*.ts`、spec `wf/workflows/planning/specs/core/rules-people.md`、`rules-battle-flow.md`、`data-model-people.md`、`data-model-world.md`——親自讀。

## 背景與唯一目標

rules 核心已交付。另一條線 `cx-rules-combat` **同時**在寫 `turn／movement／command／attack／layers／conduct`——你們之間不互相 import，只經 core 的信號／動詞／指令登記表溝通（contract §0）。你的模組在**載入時**用 `onSignal`／`registerVerb`／`registerCommand` 把自己掛上（`eject`、`retreat` 指令；`setControl`、`moraleCheck`、`spawn` 動詞；`turnStartPre`、`turnStartPost`、`partBroken`、`conducted`、`unitDied`、`unitRemoved`、`abilityResolved`、`poolDepleted`、`personDied`、`roundEnd` 信號，各自用得到的才掛）。唯一目標：交出人物與戰局六檔。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(a) 新建 `src/rules/{morale,injury,will,control,flow,objectives}.ts` 與同名 `.test.ts` 六支；(b) 新建 `test/scenarios/people-*.json` 恰好 3 個與對應 `test/golden/people-*.hash`；(c) 內容**只准新增**：`content/base/frames/infantry.json`、`content/base/bodyplans/infantry.json`（id `frame/infantry`、`bodyplan/infantry`：一層 flesh、座位接受 pilot 與 soul）、`content/base/effects/morale-{shaken,breaking,fleeing}.json`、`content/base/effects/berserk.json`，以及檔名以 `pp-` 開頭的檔，放在 `content/base/{frames,bodyplans,components,abilities,effects,persons,species,soultrees}/`；(d) 你的 REPORT。
- 不做：core 五檔、combat 六檔、`index.ts`、`test/golden.test.ts`（領導寫）；改任何既有檔（含 `content/base/` 既有檔、`src/core/`、`src/content/`、`schemas/`、`package.json`）；`src/ai/`、`src/sim/`；營運層（修理、招募、天賦樹解鎖流程）；安裝套件；新增 contract 以外的匯出。
- 件數 gate：新檔超過 26 個就停下回報；容量 gate：新檔合計超過 200 KB 就停下回報。

## 規則細節（寫死，與 spec 衝突處以此為準）

- 承擔：只對**有 `burden` 池**的指令權者生效（沒有就略過）；`will.burden` 與該池 `cur` 同步。失控檢定：`L`＝承擔池 max；`cur ≥ 1.5L` 直接失控；`L ≤ cur < 1.5L` 擲 `d100 < roleAttr(resolve) − (cur−L)/L × berserkCheckK`，失敗＝失控。失控＝`setControl(unit,"berserk")`、`rt.berserkFrom[unit]=原 owner`、`owner="berserk"`；已失控者每 turnStartPost 若 `cur < L` 或 `d100 < roleAttr(resolve)` 則回穩（owner 與 controlMode 還原）。
- 傷勢：`conducted` 信號 → `resolveConductInjury`：對人物 `hp` 池扣 `amount × conductDamageFactor`（有池才扣）；從候選表加權抽暫時傷；扣量 ≥ `permanentThreshold × hp.max` 時再擲 `permanentChance`，成功改抽 permanent 列（沒有就維持暫時傷），並對該人物 `moraleEvent("heavyInjury")`。`hp` 池見底（`poolDepleted`）→ `killPerson`：清座位、寫 `PersonDied`、signal `personDied` → `handOver`。
- 士氣：`partBroken` → 該單位座位人物 `moraleEvent("partBroken")`；`unitDied` → 同 owner 其他 active 單位座位人物 `moraleEvent("allyDeath")`。
- 控制：機魂「可單獨駕駛」＝`autonomyNodes ≥ 1`；`autonomyNodes`＝`will.soulTree.nodes` 中，其 SoulTreeDef 節點 `research` 有 `autonomy` 鍵者的個數（SPEC-GAP：spec 的 direction 欄未進型別）。
- 棄機：新步兵單位 id＝原單位 id 加後綴 `-inf`、frame `frame/infantry`、放在原單位相鄰第一個空格（方向序 n,ne,e,se,s,sw,w,nw）、owner 同原單位、加到 `s.order` 尾；原機甲 `unitStatus="derelict"`、座位清空、`controlMode="none"`；扣 `ejectApCost`。
- 捕捉：`abilityResolved` 且該能力 tags 含 `capture` 且 `hit` 且 `canCapture` → `capture`：`unitStatus="captured"`、owner 改為出手方 owner、`frame` 改 `species.capture.frame`、刪 `rt.monsters[target]`、寫 `Captured`、signal `unitRemoved`。
- 目標：`eliminate`（params.slots 省略＝其他所有 slot；`berserk` slot 與非 active 單位不算存活）、`survive`（params.rounds，輪末判）、`reachExit`／`capture`／`killTarget`（params.unit）；`hold`、`escort` 標 SPEC-GAP 永不完成。無目標＝每個 slot 都套 eliminate。`maxRounds` 到而無人勝＝`{winner:null, reason:"timeout"}`。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

共 **24** 個 `test()`：`morale.test.ts` 5、`injury.test.ts` 4、`will.test.ts` 4、`control.test.ts` 4、`flow.test.ts` 4、`objectives.test.ts` 3。單元測試**不得依賴 combat 六檔**：用你的 `createBattle` 建狀態後直接呼叫你的函式或 `signal()`。

**constraints id**：下列 16 個 id 每個至少出現在一個你的測試名稱或註解裡：`DN-M-02`、`DN-M-04`、`DN-W-02`、`DN-W-03`、`DN-W-04`、`DN-W-05`、`DN-W-06`、`DN-W-09`、`DC-C02`、`DC-C05`、`DC-C06`、`DC-C08`、`DC-C10`、`DC-T07`、`PW-07`、`PW-15`。

## 黃金情境（3 個，格式見 contract §7）

`people-berserk`：高承擔指令權者坐生物機甲，事件有 `ControlChanged`（to `berserk`）；`people-eject`：駕駛員棄機，事件有 `Ejected`；`people-capture`：打斷 `species/tidewolf` 全部 locomotion 部位後用 `capture` 能力，事件有 `Captured`。每個 2–4 單位、地圖 ≤ 8×8、地形 `terrain/plain`、指令 ≤ 40 條。這三個情境要靠 combat 線的回合迴圈才跑得動：**工作第 4 步前先跑 `wf/tools/inbox_poll.sh cx-rules-people-flow --once`**，收到領導的 order「combat 已合併」才跑 `GOLDEN_UPDATE=1 node --test test/golden.test.ts` 產 hash；沒收到就前景等 `wf/tools/inbox_poll.sh cx-rules-people-flow --wait --timeout 540`，最多兩輪，仍沒有則 hash 檔寫 `0000000000000000`、REPORT 註明「情境未實跑」，照常收尾（不算阻塞）。

跑法（沙箱內計數會不準，見下）：專案根 `node --test --test-isolation=none --test-reporter=tap 'src/rules/*.test.ts'`；型別檢查用 `npm run typecheck`（`tsc --noEmit`；typescript 已由領導裝為唯一 devDependency，node 內建模組型別由 `test/types/node-shim.d.ts` 提供，只用其中宣告的 API，缺的寫進 REPORT 不要自己補）。`src/content/content.test.ts` 的內容件數斷言會因新增內容檔變紅，這是預期，由領導合併時改，你不要改、不算你的失敗。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一個檔對跑一次 `wf/tools/inbox_poll.sh cx-rules-people-flow --once` 讀 orders；第 4 步照上段等 order |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run check` | 新增內容檔後驗載入 0 錯誤 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-rules-people-flow-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。combat 線的檔案在同一個工作樹裡可能寫到一半，第 4 步之前**不要依賴它們**。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內 `node --test` 子測試計數不準**不算阻塞**；core 或 combat 線的檔有 bug → 不要改它，寫進 REPORT（情境跑不動時附錯誤訊息）；你自己的錯 → 自己修。

## 工作

1. `morale.ts`、`injury.ts`、`will.ts`＋測試，跑綠；`inbox_poll --once`。
2. `control.ts`、`flow.ts`、`objectives.ts`＋測試，跑綠（`npm test` 中你的與 core 的測試全綠）；`inbox_poll --once`。
3. 新增內容檔、寫 3 個情境檔；`npm run check` 0 錯誤。
4. 照「黃金情境」段等 order、產 hash。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-people-flow/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/{morale,injury,will,control,flow,objectives}.ts` 與同名 `.test.ts` |
| 情境與黃金 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/people-*.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/test/golden/people-*.hash` |
| 新內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` 下「範圍」(c) 列的檔 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-people-flow/REPORT.md` |

REPORT 四段（做了什麼／產出（全部新檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` exit 0、`# fail 0`，且本線 6 支測試檔恰好 24 個 `test()`，`npm run typecheck` 輸出中本線檔案 0 錯誤（由領導重跑）。
2. 六個實作檔的匯出名與 contract §6 完全一致（不多不少），且不 import combat 六檔。
3. 3 個 `people-*.json` 存在，`expect.sequence` 分別含 `ControlChanged`、`Ejected`、`Captured`。
4. 16 個 constraints id 都 grep 得到於 `src/rules/*.test.ts`；`npm run check` 0 錯誤。
5. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rules-people-flow`。本線團隊：`teams/rules`。上線先發 `wf/tools/inbox_mail.sh cx-rules-people-flow --up PROGRESS 'cx-rules-people-flow 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-rules-people-flow --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-people-flow/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

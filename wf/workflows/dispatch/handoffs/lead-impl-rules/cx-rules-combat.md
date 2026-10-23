# 任務：實作 rules 戰鬥六檔（回合、移動、指令入口、攻擊、層序列、傳導）、26 個測試與 3 個 combat 黃金情境

> 領導 `lead-impl-rules` 寫給 codex 工人 `cx-rules-combat`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含 `contract.md`（同目錄）——§0、§4、§5、§7 是你的匯出介面與資料格式，名稱與簽名照抄；§2、§3 是你唯一可依賴的 core 介面。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/contract.md`、core 線已交付的 `src/rules/{state,contribs,pools,effects,hooks}.ts`、凍結檔 `src/core/*.ts`、spec `wf/workflows/planning/specs/core/rules-turn-and-actions.md`、`rules-attack-resolution.md`、`data-model-mech.md`、`data-model-abilities-effects.md`——親自讀。

## 背景與唯一目標

rules 核心（狀態、貢獻值、池、效果、登記表）已交付。另一條線 `cx-rules-people-flow` **同時**在寫 `morale／injury／will／control／flow／objectives`——你們之間不互相 import，只經 core 的信號／動詞／指令登記表溝通（contract §0）。唯一目標：交出戰鬥六檔，讓「排序 → 回合 → 指令 → 命中 → 層序列 → 傳導」整條在 node 裡可重播。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(a) 新建 `src/rules/{turn,movement,command,attack,layers,conduct}.ts` 與同名 `.test.ts` 六支；(b) 新建 `test/scenarios/combat-*.json` 恰好 3 個與對應 `test/golden/combat-*.hash`；(c) 情境需要而缺的內容，**只准新增**檔名以 `cb-` 開頭的檔（id 形如 `frame/cb-lancer`），放在 `content/base/{frames,bodyplans,components,abilities,effects,terrains,species}/`；(d) 你的 REPORT。
- 不做：core 五檔、people-flow 六檔、`index.ts`、`test/golden.test.ts`（領導寫）；改任何既有檔（含 `content/base/` 既有檔、`src/core/`、`src/content/`、`schemas/`、`package.json`）；`src/ai/`、`src/sim/`；安裝套件；新增 contract 以外的匯出。
- 件數 gate：新檔超過 24 個就停下回報；容量 gate：新檔合計超過 200 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

共 **26** 個 `test()`：`turn.test.ts` 4、`movement.test.ts` 4、`command.test.ts` 5、`attack.test.ts` 4、`layers.test.ts` 6、`conduct.test.ts` 3。`layers.test.ts` 用**表格驅動**（層配置 × packet → 各層期望 hp 與 remaining），涵蓋：ablative 磨損、`ablative:false` 的 flat／pct 減傷、passThrough、resist 與 resistPen、armorPen、layerFilter、溢出丟棄、擊穿後同擊後續 packet 跳過。其餘必涵蓋：排序同分 id 字典序與 fatigue 修正、Wait 一輪一次與隊尾、ownerTurns 效果在資源更新前撤除；逐格付 AP、付不起停在上一格、`onEnter`；tryCommand ①②③ 失敗不扣任何東西、④ 後未命中不退費、previewCommand 不改原狀態、未登記的 eject 回 `unsupported`；命中夾在 5..95、指定部位懲罰、未指定依 exposure 抽、十分之一規則（`conventional-arms`→`kaiju` ×0.1）；傳導依 when／layer 匹配並寫 `Conducted`、signal `conducted` 帶 amount。

**constraints id**：下列 8 個 id 每個至少出現在一個你的測試名稱或註解裡：`DC-C03`、`DC-C04`、`DC-T06`、`DN-M-07`、`DN-M-09`、`DN-M-10`、`DN-W-14`、`PW-11`。

## 黃金情境（3 個，格式見 contract §7）

`combat-layers`：一擊打穿外層、事件有 `LayerDamaged`→`LayerBroken`→`PartBroken`；`combat-conduct`：座艙殼層受擊觸發 `Conducted`（用你新增的 `cb-` 機體，其部位 `conduct` 規則對 pilot 掛 `cb-` 效果）；`combat-tenth`：`conventional-arms` 能力打 `kaiju` 單位、傷害為十分之一。每個 2–4 單位、地圖 ≤ 8×8、地形用 `terrain/plain`、指令 ≤ 30 條。產生 hash：領導的執行器 `test/golden.test.ts` 若已存在，跑 `GOLDEN_UPDATE=1 node --test test/golden.test.ts`；若還不存在，hash 檔先寫 `0000000000000000` 並在 REPORT 註明，由領導產生。people 線的模組不在時，事件裡不會有士氣／傷勢——這是預期，hash 由領導合併後重產。

跑法（沙箱內計數會不準，見下）：專案根 `node --test --test-isolation=none --test-reporter=tap 'src/rules/*.test.ts'`；型別檢查用 `npm run typecheck`（`tsc --noEmit`；typescript 已由領導裝為唯一 devDependency，node 內建模組型別由 `test/types/node-shim.d.ts` 提供，只用其中宣告的 API，缺的寫進 REPORT 不要自己補）。`src/content/content.test.ts` 的內容件數斷言會因新增內容檔變紅，這是預期，由領導合併時改，你不要改、不算你的失敗。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一個檔對跑一次 `wf/tools/inbox_poll.sh cx-rules-combat --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run check` | 新增內容檔後驗載入 0 錯誤 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-rules-combat-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。people-flow 線的檔案在同一個工作樹裡可能寫到一半，**不要讀它們、不要依賴它們**。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內 `node --test` 子測試計數不準**不算阻塞**；core 線檔案有 bug → 不要改它，寫進 REPORT 並在你的程式繞過（`SPEC-GAP` 註解）；你自己的錯 → 自己修。

## 工作

1. `layers.ts`、`conduct.ts`＋測試，跑綠；`inbox_poll --once`。
2. `attack.ts`、`movement.ts`＋測試，跑綠；`inbox_poll --once`。
3. `turn.ts`、`command.ts`＋測試，跑綠（`npm test` 全綠）；`inbox_poll --once`。
4. 新增 `cb-` 內容、3 個情境與 hash；`npm run check` 0 錯誤。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-combat/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/{turn,movement,command,attack,layers,conduct}.ts` 與同名 `.test.ts` |
| 情境與黃金 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/combat-*.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/test/golden/combat-*.hash` |
| 新內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/*/cb-*.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-combat/REPORT.md` |

REPORT 四段（做了什麼／產出（全部新檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` exit 0、`# fail 0`，且本線 6 支測試檔恰好 26 個 `test()`，`npm run typecheck` 輸出中本線檔案 0 錯誤（由領導重跑）。
2. 六個實作檔的匯出名與 contract §5 完全一致（不多不少），且不 import people-flow 六檔。
3. 3 個 `combat-*.json` 存在；合計事件有 `LayerBroken`、`PartBroken`、`Conducted` 各至少一筆。
4. 8 個 constraints id 都 grep 得到於 `src/rules/*.test.ts`；`npm run check` 0 錯誤。
5. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rules-combat`。本線團隊：`teams/rules`。上線先發 `wf/tools/inbox_mail.sh cx-rules-combat --up PROGRESS 'cx-rules-combat 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-rules-combat --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-combat/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。

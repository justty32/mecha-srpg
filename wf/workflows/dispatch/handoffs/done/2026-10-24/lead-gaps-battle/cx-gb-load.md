# 任務：為所有摹機填預設配裝、把試玩線換掉的 75 台換回原型號，並補情境名稱與簡介

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-load`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。背景資料：`wf/workflows/dispatch/handoffs/lead-content-mech/catalog.json`（欄「建議配裝」，30 台 mx 機）、`wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/frame-swaps.json`（75 台換機表：scenario／slot（`slot-序號`）／old／new）、`wf/workflows/dispatch/handoffs/lead-content-battle/catalog.json`（情境名稱與定位）、`wf/workflows/dispatch/handoffs/lead-playtest/REPORT.md`。程式（唯讀）：`src/sim/run.ts` 的 `scenarioToSetup`（UnitSpawn.components 整組取代 defaultLoadout）、`src/content/loader.ts` 的配裝檢查。

## 背景與唯一目標

引擎已支援 `FrameDef.defaultLoadout`（slot id→component id）與情境 `UnitSpawn.components`（commit `3049172`），但內容裡沒有任何 frame 填 defaultLoadout，所以情境摹機空手。試玩線為了過渡把 75 台空手機換成同家族有近戰的型號。另外 `ScenarioDef.name`／`brief` 兩個可選欄剛進 schema（commit `6d6d450`），內容還沒填。**唯一目標：讓情境裡每台摹機都帶著合理武器上場（原型號），並給每個情境顯示名與簡介；量出前後平手率。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：
  1. `content/base/frames/` 裡 **`cls:"mechanical"` 的 frame**（共 34 檔，`infantry` 若其 bodyplan 沒有任何 slot 就跳過並寫 REPORT）填 `defaultLoadout`：30 台 mx 機照 mech catalog「建議配裝」（格式 `slot:component,…`；元件 id 補 `component/` 前綴）；`moji-tern`、`moji-tern-guard`、`hound-mk2` 沒有建議，你依其 bodyplan 的 slot 與等級（C）從既有 `content/base/components/` 挑：**每台至少一件非 `conventional-arms` 的武器**（對 kaiju 才打得動）＋一件同級合理的其他件。建議配裝裡 slot 不存在或型別不符（載入器會報錯）→ 換成同 slot 型別最接近的件，逐件寫進 REPORT 的「改了建議」表。
  2. 照 `frame-swaps.json` 把 75 台換回 `old` 型號（只改那個 spawn 的 `mech` 欄）；若換回後該 spawn 原本有 `components`，保留。**不新增**情境 `components`，除非換回後某情境的人類方對 kaiju 完全沒有非凡兵武器——那種情況加 `components` 並寫 REPORT。
  3. 24 個情境（`content/base/scenarios/*.json`）全部補 `name`（中文顯示名，取 content-battle catalog 的名稱；`skirmish-whitegloves`、`rift-edge-nest` 自己寫）與 `brief`（1–3 句中文，說誰對誰、目標是什麼；風格照 `content/lore/style.md` 的太空歌劇用語，禁用詞不得出現）。
- 不做：`content/base/frames/` 裡 `cls` 不是 mechanical 的檔（bio-*、corpse-*、ancient-* 歸別的工人）；frame 的其他欄位（數值、能力、tags）；情境的部署、目標、輪數、AI；`content/base/components/`、`abilities/`、`effects/`、`species/`、`monsters/`、`persons/`、`registries/`、`world/`；任何 `src/`、`test/`、`schemas/`。
- 件數 gate：改動檔超過 62 個（34 frames＋24 scenarios＋4 餘量）就停下回報；容量 gate：diff 超過 300 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-load --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/psweep.sh REPO目錄 輸出檔` | 全 24 情境 × seed 1–5 AI 對 AI（平行版 sweep，約 5–10 分鐘）；完成時跑一次：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/psweep.sh /home/lorkhan/repo/game_dev/mecha-srpg /tmp/cx-gb-load/sweep-after.jsonl` |
| `node src/sim/cli.ts --scenario 情境id --seed 1` | 單場抽查 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-load/`；臨時檔只放 `/tmp/cx-gb-load/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ai/`、`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；讀資料、確認 34 台的 slot（frame→bodyPlan→parts[].slots）；`inbox_poll --once`。
2. 填 34 台 defaultLoadout，`npm run check` 0 錯；`inbox_poll --once`。
3. 75 台換回原型號、24 情境補 name／brief，`npm run check` 0 錯；`inbox_poll --once`。
4. `npm test`（沙箱外不準就用 `--test-isolation=none` 跑 `test/sim/`、`test/ai/`、`src/mcp/`），記下失敗的測試名與原因（固定 hash 的測試因配裝改變而變 → 只記錄，不改測試，領導處理）。
5. 跑 sweep-after；開工前的基準由領導提供在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/sweep-before.jsonl`（若檔案還不存在就先做別的步驟，最後再讀）。寫 REPORT（附「平手率表」：每情境 before／after 的勝方分布與 draw 數、總平手率）並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-load/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| frames（34 檔內） | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/` |
| scenarios（24 檔） | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/` |
| sweep 輸出 | `/tmp/cx-gb-load/sweep-after.jsonl`（同時拷一份到 REPORT 目錄 `sweep-after.jsonl`） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-load/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run check` 回 `OK 0 errors`；`python3` 統計 34 台 mechanical frame 中有 defaultLoadout 的台數（REPORT 給數字，跳過的寫理由）。
2. 75 台全部換回：對 frame-swaps.json 每列，該情境該 spawn 的 `mech` 等於 `old`（REPORT 附檢查腳本一行與輸出 `75/75`）。
3. 24 個情境都有非空 `name` 與 `brief`；`content/lore/style.md` 禁用詞在這 24 檔 0 命中（REPORT 附檢查指令）。
4. sweep-after.jsonl 存在且 24 行；REPORT 平手率表含 before／after 總平手率。
5. REPORT 存在且有四段＋「改了建議」表＋平手率表＋失敗測試清單（沒有就寫「無」）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-load`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-load --up PROGRESS 'cx-gb-load 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-load --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-load/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-load --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。

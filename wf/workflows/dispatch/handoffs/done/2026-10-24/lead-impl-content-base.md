# 任務：做出第一批內容包 `content/base/`——兩個 body plan、三台機甲、六個部件、一族怪獸、四種地形、兩個情境（spec 切線 9）

> 你是 Opus **領導**線 `lead-impl-content-base`，由頂層（主 session Fable）用 Agent tool 派出。你讀 spec 與世界觀、切子線、派 codex 工人寫資料、在沙箱外親自跑載入驗證、commit、收線、回傳。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/common/conventions.md`、`wf/workflows/testing.md`、`wf/workflows/common/user.md`；地基：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-foundation-REPORT.md`、`test/README.md`、`schemas/content.schema.json`、既有 `content/base/` 全部檔案（範本）；spec：`wf/workflows/planning/specs/core/content-format.md`、`data-model-mech.md`、`data-model-people.md`、`data-model-abilities-effects.md`、`data-model-world.md`、`glossary.json`；世界觀命名來源：`wf/workflows/planning/specs/world/README.md`、`monsters.md`、`monsters.json`、`mech-lifecycles.md`、`machine-souls.md`、`factions.md`——親自讀。

## 背景與唯一目標

地基已交付：載入器、schema、`content/base/` 各類各一個範例。規則線 `lead-impl-rules` 正在並行寫 `src/rules/`，它需要的情境專用內容會放在 `test/scenarios/pack/`，**不會碰 `content/base/`**。唯一目標：**讓 `content/base/` 成為第一批可玩素材**——2 個 body plan（人形輕型「biped-light」、四足獸型「quadruped-beast」，部位各有多層：裝甲／結構／座艙殼或內臟等，照 spec）、3 台機甲（機械 C 級、生物 C 級、古代 S 級各一；古代那台要有一個獨有能力且不宣告熱量池；生物那台有 `burden`）、6 個部件（含一個生物部件與一個古代部件各帶 burden／resonance）、1 族怪獸（蟲族，取 `monsters.json` 的 D–B 三列，含 `spawner` 行為）、4 種地形、2 個情境（小圖 20×20 四對四、中圖 60×60 十對十含怪獸 spawner），加上人物：至少 4 個駕駛員與 2 個機魂（一個帶部分天賦樹）。命名與基調照世界觀（摹機、潮錨、魂核……），數值只求「載入零錯誤、量級合理」，平衡不在本線。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 上列內容的 JSON 檔，放進 `content/base/` 對應子目錄，`pack.json` 清單同步；(2) 缺的 registries 條目（新槽型、新層種類、新資源池 id、新傷害型）加進 `content/base/registries/`；(3) `content/README.md` 一頁：目錄說明與「新增 X 要改哪些檔」指回 spec；(4) 若 schema 擋住 spec 允許的欄位→在 REPORT 列 `SPEC-GAP`，**不改 schema**（通知調度者）；(5) REPORT。
- 不做：程式碼（`src/` 一律不碰）；改 schema；改 `test/`；SS／SSS 怪獸；數值平衡；改世界觀文件；碰 `legacy/`、`wf/`（除自己的 handoffs 目錄與 ROSTER 格）。
- 件數 gate：內容檔超過 80 個就停下回報；容量 gate：`content/base/` 超過 1 MB 就停下回報。時間 gate：開工起 120 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工 `create contentbase lead-impl-content-base`；之後 `add` 每條工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派工人各寫一類內容；`-C` 指專案根；交接書寫死檔案清單與 id 命名 |
| `wf/tools/inbox_poll.sh lead-impl-content-base --wait --timeout 540` | 前景等工人 |
| `python3 wf/tools/brief_lint.py` | 子線交接書送出前 `--strict` 要 0 違規 |
| `python3 wf/tools/tabledb.py` | 查 `glossary.json`、世界觀 `monsters.json` |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完文件後跑 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑：`content/base/`、`content/README.md`、ROSTER 自己與工人那格、自己的 REPORT 與子線交接書（`wf/workflows/dispatch/handoffs/lead-impl-content-base/`）。可跑 `npm run check`、`npm test`（唯讀驗證）。**可以 commit**：只加明確路徑並用 `git commit -- 路徑`，訊息開頭 `content: `；驗收與 commit 由你在沙箱外做。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不安裝套件；不 `rm -rf`（暫存搬 `/tmp/lead-impl-content-base-trash/`）；不改 `~/.codex/config.toml`；不碰 `.gitignore`；不碰 `src/`、`schemas/`、`test/`；整檔改寫用單一 Update 操作；子代理上限 4 條 codex 工人＋1 個 Claude 子 agent；工人 ROSTER 格由你代登記；子線交接書寫死 id 命名規則與每類件數（給目標數不給區間）。分清錯誤來源：環境出錯→`BLOCKED`；工人資料不過 schema→退回修。

## 工作

1. 讀完先讀清單；ROSTER 追加自己那格；開團隊；先自己定 id 命名表與跨檔引用（body plan id、資源池 id、槽型、效果 id）寫進 `handoffs/lead-impl-content-base/contract.md`，再寫子線交接書（建議：`cx-content-mechs`（body plan＋機甲＋部件＋能力效果）、`cx-content-world`（怪獸族＋地形＋人物＋機魂）、`cx-content-scenarios`（兩個情境＋pack.json＋README）），brief_lint 過。
2. 派前兩條並行；收到終局後沙箱外 `npm run check`、核件數、commit；再派情境線（依賴前兩條的 id）。
3. 全部收齊後 `npm run check`、`npm test`、`wf-lint.sh --strict .`；commit；寫 REPORT：四段＋「內容清單（id／檔名／一句）」＋「SPEC-GAP」＋「gpt-6-astra 這次觀察到的癖好」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容包 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` |
| 說明 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/README.md` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run check` exit 0、0 errors，件數輸出：bodyplan ≥ 2、frame ≥ 3、component ≥ 6、species ≥ 1、terrain ≥ 4、scenario ≥ 2、person ≥ 6（含 soul ≥ 2）。
2. 古代那台 frame 不含熱量池且有 ≥ 1 個獨有能力；生物那台 frame 有 `burden`；至少一個部件有 `resonance`、一個有 `burden`（grep 可證）。
3. 怪獸族取自 `specs/world/monsters.json` 的蟲族 D–B 三列（名稱一致），其中一列 `behaviors` 含 `spawner`。
4. `npm test` 仍 exit 0、`# fail` 0（本線不碰測試，只確認沒弄壞）。
5. `bash wf/tools/wf-lint.sh --strict .` broken=0、residue=0、local=0。
6. `git log --oneline` 含 `content: ` 開頭 commit，`git status --short` 中無本線領地的未提交檔；無殘留 codex 行程；團隊已 close；ROSTER 已標已收線。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的（schema 不過、件數不足）→ 退回工人或自己補；修不到才 `FAILED`，壞的不 commit。
- 測不出來（載入器本身壞、環境擋）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

我是 `lead-impl-content-base`，團隊 `teams/contentbase` 的領導。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。工人走 inbox 回報給你。等工人用**前景**迴圈。


## 完成證據（調度者 2026-10-24 收線）

1. `npm run check` 0 errors：frame 7／bodyplan 7／component 7／person 7（human 4、soul 3）／terrain 6／species 4／scenario 2。2. 古代機甲「刑天」無資源池、兩個獨有能力；`burden` 出現在 5 檔、`resonance` 2 檔。3. 蟲族取自 monsters.json 的 D／C／A 三列（世界觀表無 B 級蟲族），巢母帶 `spawner`。4. 調度者把 `src/content/content.test.ts` 的件數等號改成下限後 `npm test` 162 過 0 敗（該線原卡於此，判 DONE）。5. wf-lint 本線無違規（ops spec 在途連結除外）。6. commit `31b83cc`、`a12bd83`、`78a2e11`，無殘留行程，團隊已 close。偏離：`biped-light`／`quadruped-beast` 保持單層（規則線測試依賴），另加 5 個多層 body plan；`terrain/plain` 補回 `content/base/`。

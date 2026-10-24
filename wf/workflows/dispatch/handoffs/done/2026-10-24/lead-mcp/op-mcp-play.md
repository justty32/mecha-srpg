# 任務：以 MCP 客戶端身分實際玩一整場 skirmish 與一段戰役，記下難用處並修掉明顯的

> 領導 `lead-mcp` 寫給 Claude 子 agent 工人 `op-mcp-play`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。背景：兩份工人 REPORT `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-core/REPORT.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-ops/REPORT.md`；程式 `src/mcp/`（`tool.ts` 是凍結契約）。

## 背景與唯一目標

`src/mcp/` 已有 stdio MCP server（戰鬥 11、營運 9、截圖 1 個工具）與測試，全綠。但還沒有人**以 agent 的角色真的用它玩**。本線唯一目標：**用這些工具打完一整場 skirmish、玩一段戰役，把「哪裡難用、缺什麼資訊、哪裡浪費 token」寫下來，並修掉明顯的**。

怎麼當客戶端（本 session 沒掛這個 MCP server，用 socket CLI 代替，行為與 stdio 相同）：在 scratchpad 目錄（`cd` 進去）跑 `node /home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/cli.ts serve --socket m.sock`（Bash `run_in_background`；**socket 路徑要短**，絕對路徑超過約 100 字元會 `EINVAL`，所以用相對路徑），之後 `node /home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/cli.ts call --socket m.sock TOOL 'JSON'`。改了程式要重啟 serve。收工殺掉 serve（`pkill -f "cli.ts serve --socket m[.]sock"`；pattern 用 `[.]`，否則會殺到自己的 shell）。

領導已看到的明顯問題（先修這些，再玩）：
1. `battle_observe`／`battle_new` 的摘要文字與 JSON 重複（每台的 `summary` 字串在 text 和 JSON 各一次），token 翻倍。text 留給人讀的摘要，JSON 不要再重複整段字串（或反之），兩段合計要明顯變短。
2. `battle_legal_actions` 把 125 個可達格各包成完整 action 物件，太長。改成可達格壓成 `"x,y:cost"` 字串陣列＋一個 action 範本（`{ kind:"move", to:{x,y} }`）；能力目標維持每項帶 action。
3. 能力「0 目標（沒有合法目標）」時沒說為什麼：補射程、最近敵方（已知）距離、或不可用原因。
4. `cli.ts` 連不上 socket 時噴 Node 堆疊；改成一行中文錯誤（含「socket 路徑過長？」提示）＋exit 1。

## 範圍（排除法寫死）

- 只做：改 `src/mcp/battle.ts`、`battle-view.ts`、`campaign.ts`、`campaign-view.ts`、`cli.ts`、`protocol.ts`（只限工具說明文字／`instructions`）與對應 `*.test.ts`（測試跟著改，不刪既有斷言的意圖，e2e 兩條 hash 斷言必須保留）。玩法：skirmish（`scenario/skirmish-whitegloves`，seed 自選，**玩家自己下每一步**直到分出勝負或回合上限），以及 `campaign_new` 後玩 30 天以上（含至少一次接契約＋出戰）。
- 不做：`src/mcp/tool.ts`、`ui.ts`、`ui.test.ts`、`node-shim.d.ts`；`src/` 其他目錄（`src/sim/`、`src/ops/`、`src/ui-adapter/`…）、`content/`、`test/`、`package.json`、文件。發現要改 `src/mcp/` 以外才能修的問題，只寫進 REPORT。不新增工具（缺的工具寫進 REPORT「需要決定的事」）。
- 件數 gate：改動檔超過 10 個就停下回報；容量 gate：`src/mcp/` 淨增超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node /home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/cli.ts serve／call／list` | 當客戶端玩 |
| `node --test 'src/mcp/*.test.ts'` | 改完必跑（Node 24 要用 glob，不能只給目錄） |
| `npm run typecheck` | 型別（別線 `src/ui-adapter/` 的錯不算你的，只看 `src/mcp/`） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；暫存放 scratchpad。**不要 commit**（index 有別線的東西；commit 由領導做）。工作樹有很多別線未提交改動（`src/ops/`、`src/ui-adapter/`、`content/`），不要碰、不要 restore。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗（`ui_screenshot` 可用，它是 headless）；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`；不 `rm -rf`；不安裝任何套件；不碰 `.gitignore`；子代理上限 0 個；不上網。

**分清錯誤來源**：遊戲規則／AI 本身的怪行為（例如 AI 不出手）不是 MCP 的錯，記進 REPORT；工具輸出不好讀、缺資訊、格式錯是本線要修的。

## 工作

1. 修上面 4 條；跑測試。
2. 玩 skirmish 到結束，邊玩邊記筆記；修玩的過程中發現的明顯問題（每修一處跑一次測試）。
3. 玩戰役 30 天以上；同上。
4. 寫 REPORT。收掉 serve 行程。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/op-mcp-play/REPORT.md`，不要只貼在回覆裡**（寫檔被擋時才把全文放在回覆）。回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 修正 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/` 內範圍列的檔 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/op-mcp-play/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加兩個附表：「試玩心得」（每條：哪個工具、什麼情境、問題、已修／未修）與「戰果」（skirmish 的 seed、輪數、勝負、我方下令數、最終 hash；戰役的天數、cash、契約與出戰結果）；附「修正前後」一段：`battle_observe`、`battle_legal_actions` 同一狀態下輸出字元數修正前→後；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node --test 'src/mcp/*.test.ts'` 0 fail，且 e2e 兩條 hash 斷言仍在。
2. `npm run typecheck` 沒有 `src/mcp/` 的錯誤。
3. skirmish 一整場打到 outcome 非 null（勝負或回合上限），REPORT 附最終 hash。
4. 戰役玩到 30 天以上，至少一次 `accept` 契約與一次 `sortie`。
5. REPORT 存在且有四段＋兩附表＋修正前後字元數。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（你的修正讓測試紅了）且修不好 → 回滾那個修正，REPORT 寫證據。
- **測不出來**（serve 起不來、socket 被擋）→ 不回滾、保持現狀，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`op-mcp-play`。本線團隊：無（Claude 子 agent，在行程內）。
- Claude 子 agent 不走 inbox，直接在回覆給 5 行摘要＋REPORT 路徑；第一行寫終局 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一。

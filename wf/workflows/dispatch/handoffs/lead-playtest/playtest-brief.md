# 試玩者共用說明（lead-playtest）

問題表 [issues.json](issues.json)（REPORT 由頂層代存）

你是 `lead-playtest` 派出的試玩子 agent：**以玩家身分透過 MCP 逐步下令玩遊戲、找問題、回報**。你**不改任何 repo 檔**（唯一例外：寫自己的回報檔）。

## 先讀

`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（只讀這份即可，雜活線）、`src/mcp/README.md`（21 個工具與用法）。規則背景需要時查 `wf/workflows/planning/specs/core/README.md` 的索引，不要整份讀。

## 怎麼連 MCP（本 session 沒有 MCP 用戶端，走 unix socket）

```sh
D=/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-playtest/pt
mkdir -p $D && cd $D
# 用 Bash 的 run_in_background 起自己的 server（socket 名用你的代號，例 p1.sock；路徑要短，所以先 cd）
node /home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/cli.ts serve --socket p1.sock
# 呼叫（每次都先 cd $D）
node /home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/cli.ts call --socket p1.sock battle_new '{"scenario":"scenario/quarry-duel","seed":1}'
```

- 只用**自己的** socket；不要碰別人的 server、不要 `pkill node`。收工時只停自己那個 server（用 Bash 的 KillShell／`kill <自己的 pid>`），刪自己的 `.sock` 檔可以。
- 輸出長時用 `| head -c 4000` 或 `jq` 截；每個工具回「中文摘要＋JSON」。
- 典型一步：`battle_observe {id, map:true}`（偶爾）→ `battle_legal_actions {id}` → 從回傳挑 `action` → `battle_act {id, action}`。`move` 用 `{"kind":"move","to":{"x":X,"y":Y}}`。輪到別台時 `battle_act` 會自動推進 AI 到下一次輪到你。
- 長情境可以用 `battle_new` 的 `rounds` 參數縮短（例如 8），**回報時註明**；大地圖可用 `battle_observe` 的 `window`。
- 自己寫小 shell 函式包 `call` 可以，放在 `$D/<你的代號>/` 底下；不要寫 repo 內任何檔。

## 預算

每人約 60–90 分鐘、工具呼叫約 300–450 次內收工。打不完的場，記下停在第幾輪、局勢如何，然後用同 seed 的 `battle_auto` 補一筆全 AI 結果做對照。

## 要找的東西（類別代碼）

| 類別 | 例 |
|---|---|
| `rule-bug` | 規則結果不合理：傷害、命中、視線、移動成本、資源消耗、目標判定、勝負判定錯 |
| `ai` | AI 怪行為：原地發呆、自殺衝鋒、不打目標、繞圈、友軍互卡、撤離不撤 |
| `balance` | 數值失衡（**附勝負與輪數**）：必勝／必敗／一定平手、某機體太強太弱、某能力無用 |
| `info` | 資訊不足：MCP 輸出缺什麼才能做決定（命中率、射程、敵方狀態、目標進度、地形效果…）；輸出太長太吵 |
| `content` | 內容錯誤：缺能力、空手單位、名稱 id 外露、地圖不可達、部署重疊 |
| `text` | 文案問題：中文錯字、翻譯腔、事件句不通、id 外露 |
| `tool-bug` | MCP 工具本身錯：拒絕合法指令、回傳與實際不符、存讀檔壞、例外 |

嚴重度：`S1` 阻塞／崩潰／明顯錯誤結果；`S2` 明顯影響體驗或平衡；`S3` 小問題。

## 回報（必寫檔）

寫 JSON 到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/r<輪>/<你的代號>.json`：

```json
{ "tester": "p1", "round": 1, "style": "認真打",
  "games": [ { "scenario": "scenario/quarry-duel", "seed": 1, "rounds": 7, "maxRounds": 20, "winner": "player", "reason": "eliminate",
               "byHand": true, "playerLost": 0, "enemyLost": 2, "aiAutoSameSeed": "enemy/9輪", "notes": "一句局勢" } ],
  "issues": [ { "category": "balance", "severity": "S2", "title": "一句話", "scenario": "scenario/quarry-duel",
                "repro": "seed 1：battle_new … → 第 3 輪 battle_act {…}", "expected": "…", "actual": "…",
                "suspect": "content/base/scenarios/quarry-duel.json 或 src/ai/… 或 src/mcp/…", "evidence": "工具輸出節錄 ≤ 300 字" } ],
  "fun": "一兩句：好玩在哪、最煩的是什麼" }
```

重現步驟要能讓別人照做（情境、seed、到第幾輪做什麼）。同一問題多場看到就合成一條、列出全部場次。回覆給領導只要 5 行摘要＋檔案路徑。

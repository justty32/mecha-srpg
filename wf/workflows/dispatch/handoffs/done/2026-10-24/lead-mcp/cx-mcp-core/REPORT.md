# cx-mcp-core：stdio 協定、戰鬥工具與 socket CLI 交付

## 做了什麼

完成零執行期依賴的換行 JSON-RPC MCP server、schema 子集驗證、11 個戰鬥工具、多場 session、玩家視角／最後所見快照、ASCII 地圖、中文事件、AI 推進、存檔重播驗證，以及 Unix socket CLI。server 串接另線 campaign／ui 工具，stdin 關閉時呼叫 closeUi 收尾。

依領導 2026-10-24 10:57 orders，固定驗收仍為六條；第 1 條改用同範圍 glob，第 2 條只判定本線型別。沒有新增驗收條件，沒有 commit、安裝套件或修改凍結契約。

1. `node --test 'src/mcp/*.test.ts'`：領導 10:57 在沙箱外回報 **15 tests、0 fail**，包含 socket CLI。沙箱內 child_process 管線受限，不能以檔案級 runner 計數代替實際測試證據。直接執行 protocol.test.ts、battle.test.ts 共 4 tests、0 fail。
2. `npm run typecheck`：本線 src/mcp/ 無錯。整體 exit 1，錯誤位於另線 route.ts、wiki/cards.ts、wiki/index.test.ts；依 orders 不計本線失敗，未修改另線。
3. 本線無 rules／ai／ops import，整個 src/mcp/ 的 rules／ai 搜尋零命中。package.json 只有領導新增 mcp script，無新依賴。另線 campaign-view.ts／campaign.test.ts 的 ops imports 詳見限制段。
4. e2e.test.ts 保留兩條真實 stdio hash 斷言，領導外部 15/15 證據包含兩條通過：三輪玩家至少 3 個成功指令，重播與 runBattle 相同；battle_auto 與直接 runBattle 相同。另手動對照 `npm run sim -- --scenario scenario/skirmish-whitegloves --seed 1` 與 stdio battle_auto，均為 **8f41a98a49c552af**：第 19 輪 player eliminate 獲勝、player 存活 4、enemy 0、382 指令。
5. 交接書指定的 initialize／notification／tools/list 三則輸入，stdout **恰好兩行合法 JSON**，id 為 1、2，無雜訊。證據在 `/tmp/cx-mcp-core/stdio-manual.jsonl`。
6. 本 REPORT 具四段、工具一覽與 CLI 輸出節錄；本線程式碼 **11 檔、52,368 bytes**，低於件數與容量 gate。

### 工具一覽

| 名稱 | 參數 | 回傳重點 |
|---|---|---|
| battle_list_scenarios | 無 | 情境 |
| battle_new | scenario,seed?,playerSlot?,spectate?,rounds?,autoAdvance? | id、觀察 |
| battle_observe | id,detail?,map?,window? | 戰況 |
| battle_legal_actions | id,unit? | action |
| battle_act | id,action | 事件 |
| battle_step_ai | id,until?,max? | 指令數 |
| battle_auto | scenario,seed?,rounds? | 勝負、hash |
| battle_save | id,path? | save／path |
| battle_load | save或path | 新id |
| battle_events | id,since?,limit? | 事件、next |
| battle_close | id | closed |

### 自己用 cli 打一場的輸出節錄（≤40 行）

依領導 10:59 orders，因沙箱 socket EPERM，改以 `/tmp/cx-mcp-core/play.ts` 在行程內 import createMcpServer，逐則 handle tools/call 完成 skirmish seed 1、3 輪。以下是 **行程內呼叫** 的實際 text 節錄（29 行），不是 socket CLI 輸出；原始全文在 `/tmp/cx-mcp-core/play-output.txt`。玩家成功下令 27 次，到輪數上限平局，輸出可讀。

```text
> battle_new
b1 第 1/3 輪；輪到 player-2 陳小海／生物機甲・鐮肢（玩家）
player-0 葛西 蓮／摹機・燕鷗 (2,10) 作戰中 駕駛控制 HP 100% charge 60/60 heat 0/100 葛西 蓮 穩定 ap 9/9 fatigue 0/100 hp 60/60；七號機魂 穩定 ap 9/9 fatigue 0/100
player-1 瑪拉・奧可耶／獵犬 Mk2 (2,8) 作戰中 駕駛控制 HP 100% heat 0/100 瑪拉・奧可耶 穩定 ap 9/9 fatigue 0/100 hp 60/60
player-2 陳小海／生物機甲・鐮肢 (2,6) 作戰中 駕駛控制 HP 100% instinct 25/100 陳小海 穩定 ap 9/9 fatigue 0/100 hp 60/60
player-3 伊爾瑟・布蘭特／刑天 (2,12) 作戰中 駕駛控制 HP 100%  伊爾瑟・布蘭特 穩定 ap 9/9 fatigue 0/100 hp 60/60
> battle_act
[8] 第1輪 陳小海／生物機甲・鐮肢移動至（1，5）
（中段省略）
[396] 第3輪 摹機・燕鷗移動至（2，11）
[398] 第3輪 摹機・燕鷗移動至（1，12）
[400] 第3輪 摹機・燕鷗移動至（0，12）
[402] 第3輪 輪到瑪拉・奧可耶／獵犬 Mk2行動
輪到 player-1 瑪拉・奧可耶／獵犬 Mk2（玩家）
> battle_act
[408] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，9）
[410] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，8）
[412] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，7）
[414] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，6）
[416] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，5）
[418] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，4）
[420] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（1，3）
[422] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（1，2）
[424] 第3輪 瑪拉・奧可耶／獵犬 Mk2移動至（0，1）
輪到 player-1 瑪拉・奧可耶／獵犬 Mk2（玩家）
> battle_act
[427] 第3輪 戰鬥結束，平局
戰鬥結束：平局（timeout）
玩家成功指令 27；最終 hash c9065fcddf4bc4b5
```

## 產出（檔清單）

以下 11 檔均位於 `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/`：

`protocol.ts`、`schema.ts`、`server.ts`、`battle.ts`、`battle-view.ts`、`cli.ts`、`node-shim.d.ts`、`protocol.test.ts`、`battle.test.ts`、`cli.test.ts`、`e2e.test.ts`。

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-core/REPORT.md`。

`node-shim.d.ts` 為領導 10:55 orders 明確追加授權，僅宣告本線使用的 node 內建型別；沒有改 test/types/node-shim.d.ts。其餘程式碼寫入完全限於原交接書白名單。tool.ts、campaign.ts、ui.ts、sim／rules／ai／ops／content／ui-adapter 與 package.json 均未由本線修改。

## 沒做到或證據不足的

沙箱禁止 Unix socket（EPERM），Node spawn 的 stdio pipe 也出現無 stdout/stderr、子行程 exit 0；相同最小程式改 inherit 即可印出。重現檔在 `/tmp/cx-mcp-core/meta.ts`、`spawn-probe.mjs`。已於 10:57 發 BLOCKED，領導同時以沙箱外 15/15 pass 解除阻塞；依最新 orders，CLI 測試保留實測，沒有 skip。

整體 typecheck 的別線錯誤為 route.ts 的 URLSearchParams、wiki/index.test.ts 的 URL、wiki/cards.ts 的 Object.entries unknown 型別。這些檔案在其他工作線持續修改，本線未處理。

gate #3 原文限定 ops imports 僅 tool.ts／campaign.ts；當前另線 campaign-view.ts 與 campaign.test.ts 也匯入 ops。本線零命中；整合時須依另線授權判定，不能宣稱整個目錄僅那兩檔匯入 ops。

事件文字沿用 UI 的 eventText，輸出其可讀事件類別；不可見敵人的詳細資料採最後所見快照。`until:end` 遇玩家回合會停止，需要全 AI 跑到底時使用 spectate 或 battle_auto。save／load 驗證內容包 hash、逐條 AI 指令與最終事件 hash，不接受靜默不同內容重播。

## 需要決定的事

CLI 實玩替代方案已由領導 10:59 orders 裁示且執行完成。另線 campaign-view.ts／campaign.test.ts 的 ops import 由領導整合確認；已透過 PROGRESS 告知，沒有擅改另線。其餘無需使用者決定。

### 以後交接書該點名的工具

`node --test 'src/mcp/*.test.ts'`（Node 24 明確目錄參數不會掃描測試）；`src/mcp/node-shim.d.ts`（沒有 @types/node 時集中補型別）。

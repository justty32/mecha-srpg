# cx-pt-mcpb：戰鬥資訊改動與型別檢查完成；socket／stdio 驗收受阻，狀態 BLOCKED

## 做了什麼

依交接書處理 ISS-003、004、014–021 的本線範圍：目標取執行期 unit id、守區進度、出口與輪數；盟軍永遠列出，失聯敵方保留最後所見快照，未知目標不洩漏位置。nearestEnemy 採 sim 敵對判定；非當前敵方不提供能力／nearestEnemy，playerTurn 僅對當前人類行動者成立。

地圖保留大寫給單位，地形採獨立的小寫／標點／數字集合；超過 26 台用 AA 等符號及 cellWidth，避免循環撞字。出口優先於迷霧及單位符號，佔出口的單位仍在圖例附座標。terrainLegend 含掩蔽、移動成本與取自 effect 定義的作用說明；observe 列潮汐／光照現值。傷害以 packets × rules/damage-modifiers 估算，明示未計部位減傷、抗性、暴擊。

顯示數值四捨五入至 1 位，內容名稱優先於去前綴 id；eject／retreat 標不可逆。修正 since 游標倒退、move to 的不可達／被佔／AP 不足分類、壞 JSON 中文錯誤、錯誤 playerSlot 可選清單。CLI 的 call／list 僅靜態載入 node 模組，serve 動態載入 server 與 UI。README 補欄位與觀戰用法。

已讀領導 orders 並一併處理：欄號不截斷；勝負摘要／事件使用陣營中文名稱；單位 dead 顯示「機體損毀」；Hit／Miss 使用事件 payload.chance 顯示當時命中率，不以事後 state 推算。

固定五條驗收結果（未增加驗收條件）：

1. `node --test 'src/mcp/*.test.ts'` 未達 0 fail：沙箱回報 8 個檔、6 pass／2 fail。battle-info、battle、campaign、protocol、sortie、ui 通過；cli 與 e2e 在子行程邊界失敗。既有 battle_auto／e2e hash 斷言完全未改；不能宣稱 e2e hash 已驗證。
2. 新檔有三情境目標、守區範圍與進度、斬首剩餘數、護送對象／出口、符號不相交、迷霧出口斷言。直接 `node src/mcp/battle-info.test.ts` 可見 6 項測試全過（避免沙箱 test runner 只列檔名的計數問題）。
3. 同檔驗證 nearestEnemy 排除盟軍，以及 conventional-arms 對蟲的 8 → 0.8 估算，並驗證查詢不改 hash。
4. 同檔靜態檢查 CLI 執行期 import 全為 node 模組，server 是動態 import，通過。
5. `npm run typecheck` exit 0；本 REPORT 四段齊。

測試有效性：在 `/tmp/cx-pt-mcpb/before/` 用 git HEAD 的舊 battle／battle-view／cli 副本執行新測試，6 項皆紅（包含舊版 nearestEnemy 回 ally-0、無 hold 文字、浮點未取整等）；工作樹版本 6 項皆綠。未回滾、覆蓋或修改工作樹中的舊檔做此驗證。

三情境實看摘要如下，每段少於 12 行。來源為 seed 1、預設推進至人類回合的同一工具 handler；**不冒充成功的 socket CLI 實測**。完整 observe 與 legal_actions 文字在 `/tmp/cx-pt-mcpb/<scenario>-observe.txt`、`<scenario>-legal.txt`。glade 的最近敵方為 enemy-2、waste 為 enemy-3、convoy 為 enemy-0；未把 ally／convoy 當成敵方。

glade-spore-hold：

```text
b1 第 1/20 輪；輪到 player-0 葛西 蓮／摹機・燕鷗（玩家，ap 9/9）
我方勝：守住區域 x14–17,y15–18（16 格）連續 8 輪（目前 0／8；區內有敵方或無本方單位則歸零）
敵方〔enemy〕勝：殲滅達卡紡織公會〔ally〕與我方
全域效果：光照 0.6
ally-0 瑪拉・奧可耶／獵犬 Mk2 (17,15) 作戰中 駕駛控制 HP 100% heat 0/100｜瑪拉・奧可耶 穩定 ap 9/9 fatigue 0/100 hp 60/60
```

waste-encirclement：

```text
b2 第 1/20 輪；輪到 player-0 陳小海／生物機甲・鐮肢（玩家，ap 9/9）
我方勝：擊殺 鐮肢〔enemy-0〕 (32,18)、鐮肢〔enemy-1〕 (32,20)、鐮肢〔enemy-2〕 (34,19)（剩 3／3）
敵方〔enemy〕勝：殲滅殘聯蝕線守備隊〔ally〕與我方
我方勝：撐過第 12 輪（剩 11 輪）
全域效果：無
```

convoy-run：

```text
b3 第 1/20 輪；輪到 player-0 葛西 蓮／摹機・燕鷗（玩家，ap 9/9）
我方勝：護送 瑪拉・奧可耶／獵犬 Mk2〔convoy-0〕 (46,9)、瑪拉・奧可耶／獵犬 Mk2〔convoy-1〕 (46,11) 到出口（已到 0／2；出口 18 格：(79,1)、(79,2)、(79,3)、(79,4)、(79,5)、(79,6)、(79,7)、(79,8)、(79,9)、(79,10)、(79,11)、(79,12)、(79,13)、(79,14)、(79,15)、(79,16)、(79,17)、(79,18)）
我方敗：擊殺 瑪拉・奧可耶／獵犬 Mk2〔convoy-0〕 (46,9)、瑪拉・奧可耶／獵犬 Mk2〔convoy-1〕 (46,11)（剩 2／2）
全域效果：無
```

## 產出（檔清單）

下列皆位於指定 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-playtest/wt-cx-pt-mcpb/`：

- `src/mcp/battle.ts`
- `src/mcp/battle-view.ts`
- `src/mcp/cli.ts`
- `src/mcp/README.md`
- `src/mcp/battle-info.test.ts`（唯一新增程式檔）
- `wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpb/REPORT.md`

淨增程式碼 23,920 bytes，未超過 40 KB；新增檔僅測試 1 個（REPORT 除外）。既有 battle.test.ts、cli.test.ts、e2e.test.ts 全未修改，所以沒有需要逐條解釋的既有斷言改動。未 commit，未改 rules／sim／campaign／content 或其他禁區。

## 沒做到或證據不足的

`node src/mcp/cli.ts serve --socket /tmp/cx-pt-mcpb/m.sock` exit 1：`listen EPERM: operation not permitted`，路徑僅 22 字元。隨後實際執行 call，亦為 `connect EPERM`。因此三個指定情境的 socket observe／legal_actions 驗收未完成；直接 handler 觀察只能證明內容可讀，不能替代傳輸邊界證據。

stdio e2e 兩項皆報 `server 提前退出 0`、stderr 空；另外以最小 node 子行程執行 console.log／stdin echo，也無 stdout 而直接 exit 0，顯示子行程執行環境異常；仍須由領導在沙箱外重跑，不能把未跑到的 hash 斷言算通過。沒有修改 e2e／server 來繞過失敗。

證據檔：`/tmp/cx-pt-mcpb/mcp-tests.log`、`info-detail.log`、`typecheck.log`、`before-tests.log`、`cli-detail.log`、`cli-call.log`、`e2e-detail.log`。本次為測試環境阻塞，保留全部改動，終局回報 BLOCKED。

## 需要決定的事

無產品／規格選項待決。解除條件：在允許 Unix socket 與 node 子行程正常收發的環境，重跑既定 MCP suite 與三情境 CLI 實看；0 fail 且原 hash 斷言通過後才能改列 DONE。code map 因交接書禁止修改 wf 而未更新；本線僅增同目錄測試，現有導航仍指向該目錄。

以後交接書該點名的工具：`node src/mcp/battle-info.test.ts`（沙箱 `node --test` 只列檔級計數時，可顯示實際斷言結果）；不新增驗收條件。

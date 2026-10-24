# cx-pt-sortie：互動出戰已實作，三條新增測試與型別通過；子行程驗收受阻

## 做了什麼

完成共用 battle hub、戰役兩段式出戰、pending 鎖、actions 入口及 battle_save 拒絕。begin 以 deferred runner 捕捉 setup，不改戰役；finish 重跑原指令、比對 sortie、驗證並消耗相同情境 RNG，再回寫戰果與重播紀錄；cancel 關閉戰鬥且不改戰役。成功回寫後保留戰鬥供 events 查閱，禁止再次 finish。

三個工具一覽：

| 工具 | 參數 | 結果 |
|---|---|---|
| campaign_sortie_begin | id, sortie?, spectate?, autoAdvance? | campaign、battle bN、sortie 與戰場摘要 |
| campaign_sortie_finish | id | 回寫戰果，回勝負、輪數、損失與戰役畫面 |
| campaign_sortie_cancel | id | 關閉戰鬥、解除 pending，戰役不變 |

沿用 recordingBattle 的 Infinity 正規化、rng 與 effectCounter。對照測試曾發現 session.result() 沒有 runBattle 額外附加的 events，造成戰後處理的 hash 不同；已在 finish 複製 session.state.log.events，修正後 AI 路徑等價測試通過。

固定五條驗收結果：

1. `node --test 'src/mcp/*.test.ts'` 已執行；exit 1，檔案層級 pass 5／fail 2（cli、e2e 子行程），待領導沙箱外重跑。既有測試未改。
2. AI 自動出戰與 spectate begin → step_ai(end) → finish：campaignHash、勝負、輪數相等，通過。
3. 玩家送出 55 次 battle_act，finish 後 save → load 的 campaignHash 相等，通過。
4. pending 的 act／advance 與未完戰鬥 finish 回 isError；cancel 後 campaignHash 不變，通過。
5. `npm run typecheck` exit 0；本 REPORT 四段齊備。

用 battle_act 親手打一場戰役出戰的實際輸出節錄（11 行）：

```text
戰役 c1 互動出戰：b1
b1 第 1/20 輪；輪到 mech-8 陳小海／摹機・燕鷗攻堅型（玩家，ap 9/9）
battle_act {"kind":"end","actor":"mech-8"}
[10] 第1輪 輪到葛西 蓮／獵犬 Mk2行動〔mech-10〕
[11] 第1輪 葛西 蓮／獵犬 Mk2受到「蝕地侵蝕」影響〔mech-10〕
輪到 mech-10 葛西 蓮／獵犬 Mk2（玩家，ap 9/9、9/9）
成功 battle_act：55 次
finish：{"winner":"none","outcome":"未分勝負","rounds":20,"losses":{"mechs":["mech-10","mech-9"],"persons":[]}}
campaign_save hash=8f8d601b1480c5d1
campaign_load hash=8f8d601b1480c5d1
新增測試：tests 3／pass 3／fail 0
```

## 產出（檔清單）

所有變更位於指定 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-playtest/wt-sortie`。

- [src/mcp/battle.ts](../../../../../../../../src/mcp/battle.ts)：共用 hub 與戰役戰鬥存檔限制。
- [src/mcp/campaign.ts](../../../../../../../../src/mcp/campaign.ts)：三工具、pending、actions、view 提示與回寫紀錄。
- [src/mcp/server.ts](../../../../../../../../src/mcp/server.ts)：將同一 hub 傳入兩工具組。
- [src/mcp/sortie.test.ts](../../../../../../../../src/mcp/sortie.test.ts)：新增三條固定範圍測試。
- [src/mcp/README.md](../../../../../../../../src/mcp/README.md)：工具及典型流程。
- [REPORT.md](REPORT.md)：本報告。

新增原始碼檔 1 個，連 REPORT 共新增 2 個檔案；新增內容保守計量含 README 為 17,702 bytes，未達 40 KB gate。未 commit，未改既有 MCP 測試或其他程式目錄。開場已有未追蹤 node_modules 與 handoffs 內容，未動它們。

## 沒做到或證據不足的

狀態 **BLOCKED**：完整 MCP suite 的 0 fail 尚無法取得；不是僅測試計數不準。`cli.test.ts:19` 等不到「MCP socket 就緒」；`e2e.test.ts:18` 回報「server 提前退出 0」，stderr 空白。

最小重現 `/tmp/cx-pt-sortie/main-check.ts` 只輸出 import.meta.main、URL 與 argv；直接執行有正常 JSON，經 `spawnSync(process.execPath, [檔案], {encoding:"utf8"})` 卻回 `{status:0,stdout:"",stderr:""}`。這顯示當前執行環境的 Node 子行程輸出／執行存在問題；未改 CLI、協定或測試來繞過它。

診斷重跑同一批失敗項，沒有新增驗收條件。`node src/mcp/sortie.test.ts` 三條全過；最終完整 suite 的 sortie 檔也通過。證據：`/tmp/cx-pt-sortie/sortie-tests.log`、`mcp-tests-final.log`、`typecheck-final.log`、`cli-diagnostic.log`、`e2e-diagnostic.log`（後四者同目錄）。

## 需要決定的事

請領導在沙箱外、同一 worktree 重跑交接書指定的 `node --test 'src/mcp/*.test.ts'`。解除條件為子行程能正常收發，且完整 suite 0 fail；若仍失敗，依實際 stderr 再定位。其餘無需使用者決定，未增加驗收項目。

### 以後交接書該點名的工具

無。

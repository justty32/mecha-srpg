# cx-mcp-ops：營運工具與試玩完成，型別驗收待別線解除

## 做了什麼

實作九個營運 MCP 工具，以 closure 維護 c1、c2… session。指令經既有 applyCommand；AI 出戰使用 defaultBattleRunner，按 runCampaign 記錄戰果、RNG 與 effectCounter，無上限 pool 與既有紀錄採同一序列化方式。存檔可重播並驗證 snapshotHash。

畫面保留日期、房間、非空 panels、待選事件、pendingBattle 與最多 20 行新 log；超出的較早紀錄另列行數。補入契約目標與機庫座位，供 agent 組裝出戰指令；座位直接回 JSON 物件。明確的 campaign_view 消耗 log 游標，act 的步驟畫面不消耗它。待選事件的「要先 choose」放在中文摘要開頭；失敗回 isError，遊戲拒絕含 error code，文字歧義含 candidates。

### 工具一覽

| 工具 | 用途 |
|---|---|
| campaign_new | 建立戰役 |
| campaign_view | 畫面與新 log |
| campaign_actions | cmd、鍵位、動詞表 |
| campaign_act | JSON／文字指令 |
| campaign_advance | 推進與待選暫停 |
| campaign_auto | 自動模擬與 hash |
| campaign_save | blob／檔案存檔 |
| campaign_load | 重播為新 session |
| campaign_close | 關閉 session |

### 固定五條驗收

1. `node --test src/mcp/campaign.test.ts`：exit 0、0 fail。六個 handler 測試涵蓋所有工具；沙箱輸出聚合成一個測試檔。先前測試中不成立的截斷假設曾確實使測試紅燈，修正後為綠燈。
2. `npm run typecheck`：中途曾 exit 0；最終重跑 exit 1，錯誤全部在別線 ui-adapter（完整位置見第三段）。本線無型別錯誤；此非交接書列的 ops 豁免，故目前仍列阻塞。
3. seed 7／months 1／greedy 的 campaign_auto hash 已在測試斷言等於直接 runCampaign＋campaignHash，值為 `cd9f96c9d4019c9c`。
4. 測試完整執行 new → actions 取未 disabled 的 wait.cmd → act → save → load；兩次 view 的日期與 cash 相同。另涵蓋真實 AI 戰果存讀檔 hash 一致。
5. 本 REPORT 已包含四段、工具一覽與以下試玩節錄。

指定 CLI 對照 `npm run sim:campaign -- --months 1 --seed 7 --policy greedy` exit 0：潮月 1、day=28、cash=654、debt=25200、人數=7，與 campaign_auto 摘要一致；後者指令數 30。依固定範圍未加跑全套測試或 lint。

### 試玩 30 天的輸出節錄（seed 1，航行使結束日為 32）

以下節錄直接呼叫 handler 的輸出，出戰編成為三台現有機甲，各配置一名駕駛、controlMode=pilot。原始逐步紀錄在 `/tmp/cx-mcp-ops/play-transcript.txt`。

```text
campaign_new → c1 day=0，艦橋，cash=1200，debt=24000
campaign_act assign → mech-8/pilot=person-1
campaign_act assign → mech-9/pilot=person-2
campaign_act assign → mech-10/pilot=person-3
campaign_advance {"days":1} → day=1，要先 choose：終端亮了。
campaign_act {"v":"choose","choice":1} → 要先 choose：女聲念出欠款。
campaign_act {"v":"choose","choice":1} → day=1
campaign_advance（逐日）→ day=28
campaign_actions → 承接契約 contract-20
campaign_act {"v":"accept","contract":"contract-20"} → day=28
campaign_act {"v":"sail","to":"base:node/salt-flat"} → day=32
campaign_act sortie → winner=player，勝利，rounds=6
losses={"mechs":[],"persons":[]}
campaign_save → /tmp/cx-mcp-ops/play-save.json
campaign_load → c2 day=32，重播 hash 驗證成功
campaign_act choose → 處理戰後蝕蟲屍體選項
campaign_view → day=32，cash=3384，debt=25200，stock:fuel=36
```

## 產出（檔清單）

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign.ts`：替換 stub，九個工具。
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign-view.ts`：精簡畫面格式化。
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/campaign.test.ts`：handler 測試。
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mcp/cx-mcp-ops/REPORT.md`：本報告。

本線新增三檔（含 REPORT），改寫既有 stub 一檔；程式碼遠低於 60 KB。未 commit，未改 tool.ts、其他 MCP 線、ops、內容或文件導航。orders 指出的兩處 Node shim 相容錯誤已使用既有 mkdirSync 與兩參數 writeFileSync 修正，未新增型別宣告。

## 沒做到或證據不足的

目前阻塞是別線 ui-adapter 型別錯誤。先前已透過 PROGRESS 通知 lead-mcp；交付前再確認時，wiki 線又新增型別錯誤。最終輸出如下：

```text
src/ui-adapter/vm/route.ts(9,22): TS2304 Cannot find name 'URLSearchParams'.
src/ui-adapter/vm/wiki/cards.ts(156,40): TS2769 No overload matches this call.
  Argument of type 'unknown' is not assignable to parameter of type '{}'.
src/ui-adapter/vm/wiki/index.test.ts(116,20): TS2304 Cannot find name 'URL'.
src/ui-adapter/vm/wiki/index.test.ts(119,41): TS2304 Cannot find name 'URL'.
src/ui-adapter/vm/wiki/index.test.ts(122,90): TS2304 Cannot find name 'URL'.
```

解除條件為所屬線修正後 `npm run typecheck` exit 0。依交接書以 BLOCKED 終局回報，保留全部工作，不回滾。

本線測試直接呼叫 handler，協定整合由 cx-mcp-core／領導負責。預設 seed 7 前 30 天沒有契約，因此另用 seed 1 補齊接契約與真實出戰的試玩證據。既有 eventLog 對未登錄事件仍回「未登錄事件」，未越界修改 ops 模板。

## 需要決定的事

互動式出戰（將營運出戰交給戰鬥工具逐步打）依交接書未做，是否另開任務由領導決定。現有 sortie.units 為空時，agent 需使用畫面的機庫資料提供編成；工具不代替玩家選編成。文件導航與最終 commit 交由領導整合。

### 以後交接書該點名的工具

無。

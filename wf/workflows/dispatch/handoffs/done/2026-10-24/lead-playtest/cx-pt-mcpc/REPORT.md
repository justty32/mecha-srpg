# cx-pt-mcpc：營運資訊已實作；完整 MCP 驗收待沙箱外重跑

## 做了什麼

僅修改 MCP 呈現層。campaign_view 顯示機甲名稱／frame、駕駛名、部位各層血量百分比與損毀、裝備、資源池與修理工單，人員重名附 id。campaign_act 保留查看指令的 Screen、事件、prompt，摘要改為可讀文字。pending-choice 錯誤附題目、所有選項、停用原因及 choose cmd。金額文字格式化至兩位；state、structuredContent 數值與可重播 blob 保留原精度。未給 path 且存檔大於 200×1024 bytes 時附警告，仍回 blob。

MCP 補出的內容：look 機甲／人物詳情、look 指定房間／節點／契約資訊、board 契約板、help 動詞說明、talk 無選項時原本未回傳的台詞；map 的世界圖補充沿用既有實作。talk 台詞從指令前狀態選取相同 topic，沒有再次執行效果。動態 MapDef 無 name，以「節點名＋戰場」命名。

新增 campaign_sortie_preview，與 begin 共用編成參數解析；預覽在 applyCommand 副本中呼叫唯讀 sortieBattleSetup，沒有保存指令或消耗 RNG。actions 的 AI／互動出戰項共用 preview。兩種出戰結算均有現金、契約與裂縫變化，我方出戰機甲／人員結局、損毀部位、擊毀／捕獲敵方名稱與戰利品筆數。無效編成的 preview 明示不可預覽原因。

actions 加入所在地市場、候選人及船內研究清單；使用現有 trade／hire／queue 動詞，皆有可送 cmd。售價透過副本交易取得，沒有改動真實庫存；ops 不支援的彈藥交易標為停用。研究沒有節點服務限制，列出前置與材料需求。parse 失敗附相關 id，最多 10 筆。

固定五條驗收結果：

1. 部分阻塞：完整 MCP suite exit 1；6 個檔通過、CLI／stdio 2 個檔受沙箱限制。既有 campaign_auto、sortie hash 斷言未改且通過。
2. 通過：新測試斷言每台部位百分比、駕駛名及 look 機甲名稱。
3. 通過：新測試斷言兩種出戰項 preview、敵軍與目標，前後 campaignHash 相同。
4. 通過：新測試斷言 AI 戰果現金與每台出戰機甲結局、pending-choice 選項文字。
5. 通過：npm run typecheck exit 0；本 REPORT 四段齊。

必用模擬 npm run sim:campaign -- --months 1 --seed 5 --policy greedy exit 0（day 28、cash 654、debt 25200）。直接 handler 試玩 seed 5 到 day 40，共 233 次呼叫、處理 7 個待選事件、63 次玩家 battle_act，成功 finish；此場為明給 units 的無契約出戰。當地市場 4 筆、招募 4 人、研究 17 項。preview 前後存檔 hash 相同；finish 後 hash 為 9d5e75a523fd47f7，存檔 86642 bytes。試玩後改善同型機甲辨識與查看摘要的 JSON 可讀性。

試玩輸出節錄（22 行）：

```text
look 機甲：
摹機・燕鷗攻堅型（mech-8）（摹機・燕鷗攻堅型）｜駕駛 葛西 蓮（person-1）
部位：頭部 100%/100%；左臂 100%/100%/100%；雙腿 100%/100%；右臂 100%/100%/100%；軀幹 100%/100%
裝備：裂晶弧光吼砲、凡鐵連吼；彈藥／資源：ammo-30 12/12、charge 60/60、heat 0/100；待修：無
出戰 preview：
達卡戰場 10×20｜敵方：蝕蟲 D級×2
目標：殲滅敵軍（達成獲勝）。 輪數上限 20。
此出戰沒有關聯裂縫。
互動出戰 finish：
戰果報告
現金變化：+0.00
契約狀態：無變化
裂縫相位：無變化
摹機・燕鷗攻堅型（mech-8）：存活；損毀部位 無
摹機・燕鷗攻堅型（mech-9）：存活；損毀部位 無
獵犬 Mk2：存活；損毀部位 無
葛西 蓮：存活
陳小海：存活
伊爾瑟・布蘭特：存活
擊毀敵方：蝕蟲
捕獲敵方：無
戰利品：0 筆
```

## 產出（檔清單）

工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-playtest/wt-cx-pt-mcpc`。

- `src/mcp/campaign.ts`
- `src/mcp/campaign-view.ts`
- `src/mcp/campaign-info.test.ts`（唯一新增程式檔）
- `src/mcp/README.md`（只改營運段）
- `wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-mcpc/REPORT.md`

既有 campaign.test.ts、sortie.test.ts 完全未改，沒有需要列出的斷言格式調整。淨增程式碼 28,701 bytes，未超過 40 KB；未 commit。暫存試玩程式與輸出在 `/tmp/cx-pt-mcpc/`，不是交付程式碼。

## 沒做到或證據不足的

唯一未完成的固定驗收是完整 MCP suite 的 0 fail。最終命令 node --test 'src/mcp/*.test.ts' exit 1；直接跑 CLI 測試顯示 server 未就緒，stdio 測試顯示「server 提前退出 0」。獨立 spawnSync(process.execPath, ['src/mcp/server.ts']) 得到 `EPERM`，確認存在沙箱子行程限制。沒有修改禁區 server.ts／cli.ts，也沒有回滾已通過的改動。

證據：`/tmp/cx-pt-mcpc/final-tests.log`、`typecheck.log`、`cli.log`、`e2e.log`、`play.log`、`play.json`。新測試直接執行曾回 2 tests、2 pass；完整 runner 在沙箱只以檔計數，因此沒有把 6 個通過檔宣稱成全部測試條數。此次試玩 blob 未超過 200 KB，警告分支未在該試玩觸發；此線未擴增交接書的五項驗收。

## 需要決定的事

不需使用者作功能決策。請領導在沙箱外於本 worktree 重跑既定 node --test 'src/mcp/*.test.ts'，確認 CLI／stdio 及完整 suite 為 0 fail 後收線；本線終局狀態 BLOCKED，解除條件為完成該外部驗證。其餘已授權工作均已交付，不另加驗收。

以後交接書該點名的工具：`node src/mcp/campaign-info.test.ts`（沙箱 test runner 只顯示檔級錯誤時，用同一測試檔取得實際斷言堆疊）。

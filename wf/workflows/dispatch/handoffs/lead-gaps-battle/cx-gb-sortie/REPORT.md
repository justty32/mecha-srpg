# cx-gb-sortie 完成回報

狀態：DONE。固定三條驗收全數通過；未 commit。

## 做了什麼

只改 sortie.test.ts 的 fixture。由 campaign_view 的結構化機庫、人員資料，依 ID 排序選第一台非休眠、空駕駛座機甲及第一位未入座駕駛；待選事件取第一個未停用選項。逐日 wait 後查 campaign_actions，依契約 ID 排序承接第一個未停用 accept，抵達後直接取可出戰 action 的 sortie 參數。三個原測試及其斷言保留。

依 `wf/inbox/orders/cx-gb-sortie.md` 兩次裁示：actions 未提供 sail 時，使用 view 中所承接契約的 target 組 sail；固定程序允許依序嘗試 seed 1–7，每個最多 120 條前置命令，取第一個找到的出戰點。超限關閉該 seed 的 campaign；全部超限則 throw 並附最後 seed 與畫面摘要。出戰候選同時排除 disabled 與 preview.error，避免 actions 未停用但實際回 operation-required。無政策相依、無寫死契約／機甲／節點 ID。

固定驗收 1：以下兩次均執行 `node --test --test-isolation=none src/mcp/sortie.test.ts`，exit 0。

主工作樹輸出尾：

```text
✔ 互動觀戰與 campaign_act 自動出戰的 campaignHash、勝負及輪數相同 (6036.899588ms)
✔ 玩家 battle_act 親手出戰後 campaign_save → campaign_load 重播 hash 相同 (2206.19293ms)
✔ pending 鎖住 act／advance、拒絕未完戰鬥 finish，cancel 後 campaignHash 不變 (172.222823ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9218.781434
```

wt-v1 輸出尾（已先將同一份 sortie.test.ts 拷入指定工作樹）：

```text
✔ 互動觀戰與 campaign_act 自動出戰的 campaignHash、勝負及輪數相同 (6367.920288ms)
✔ 玩家 battle_act 親手出戰後 campaign_save → campaign_load 重播 hash 相同 (1814.747067ms)
✔ pending 鎖住 act／advance、拒絕未完戰鬥 finish，cancel 後 campaignHash 不變 (1299.870062ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10045.844421
```

固定驗收 2：`grep -cE 'greedy|contract-[0-9]|mech-[0-9]|node/' src/mcp/sortie.test.ts` 輸出 `0`（無匹配的 exit 1 屬預期）。

固定驗收 3：本 REPORT 存在，具備要求的四段與末尾工具段。

## 產出（改動檔清單）

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/sortie.test.ts`，並依交接書拷至 wt-v1 的同一路徑。
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-sortie/REPORT.md`。

程式改動僅 1 檔；主工作樹該檔 git diff 5,684 bytes，小於 20 KB。未修改其他線程式碼。臨時證據均在 `/tmp/cx-gb-sortie/`。

## 沒做到或證據不足的

固定三條驗收無缺項。交接書另要求的 npm run check 已執行，exit 0，0 errors、38 warnings。npm run typecheck 最新 exit 1：`src/mcp/campaign.test.ts(147,36): TS18048: 'sailed.structuredContent' is possibly 'undefined'`；這是其他線檔案，本線未修改。較早一次型別檢查曾報 src/ai/intent.ts 的 wavering 型別錯，最新執行已未見該項。不宣稱全專案型別檢查通過。

## 需要決定的事

領導整合時處理上述跨線 typecheck 錯誤。campaign_actions 沒有航行項、preview.error 未反映為 disabled，均未越界修改；fixture 已依裁示與結構化 preview 處理。其餘無。

## 以後交接書該點名的工具

無。

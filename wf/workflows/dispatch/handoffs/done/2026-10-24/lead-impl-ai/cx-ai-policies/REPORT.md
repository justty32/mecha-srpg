# cx-ai-policies：13 檔完成，固定 18 測試全過、型別檢查零錯誤

## 做了什麼

依凍結契約完成陣營 strategy、單位 agent、六個 policy 與陣營入口；估值與候選預覽用 masked view，規則由 RulesQuery／ExecCommand 注入，AI 使用獨立 RNG stream 101。

完成固定 18 個 test()：policies 8、agent 4、strategy 3、smoke 3。測試包含十輪雙方各三單位、同 seed 決定性、混用六種 policy。DN-M-02、DN-M-12、PW-07 已放入測試名稱。

靜態核對：匯出介面照 contract §6–§9；六個 policy 都在載入時 registerPolicy，smoke 內也驗證 policyIds() 包含六個 id；本線無 rules／content 模組 import。13 檔小於 40 KB，連 REPORT 共 14 個產物。

驗證證據（2026-10-24，沙箱內；別線三項依賴齊全後執行）：

- `node --test --test-isolation=none --test-reporter=tap 'test/ai/*.test.ts'`：exit 0，40 tests／40 pass／0 fail。本線四檔恰好 18 個 test() 全過，其餘 22 個屬 knowledge-score 線。
- `npm run typecheck`：exit 0，整體零錯誤，本線 13 檔零錯誤。未補 shim、未安裝套件。
- `npm test`：exit 1，沙箱隔離模式計為 30 檔／28 pass／2 fail；本線四檔均 pass，失敗來源詳見下一段。

## 產出（13 個檔的清單）

- `src/ai/strategy.ts`
- `src/ai/agent.ts`
- `src/ai/index.ts`
- `src/ai/policies/tactical.ts`
- `src/ai/policies/berserk.ts`
- `src/ai/policies/swarm.ts`
- `src/ai/policies/sentinel.ts`
- `src/ai/policies/flee.ts`
- `src/ai/policies/scripted.ts`
- `test/ai/policies.test.ts`
- `test/ai/agent.test.ts`
- `test/ai/strategy.test.ts`
- `test/ai/smoke.test.ts`

以上相對路徑根目錄為 `/home/lorkhan/repo/game_dev/mecha-srpg/`。另交付本 REPORT。未 commit。

## 沒做到或證據不足的

沙箱外固定 18 個測試與型別檢查的最終重算由領導執行；本線不宣稱取得沙箱外證據。

整體 npm test 的失敗檔為 `src/content/content.test.ts`、`test/golden.test.ts`。為分清錯誤來源，重現指令：

```sh
node --test --test-isolation=none --test-reporter=tap src/content/content.test.ts test/golden.test.ts
```

輸出 exit 1，18 tests／13 pass／5 fail：

```text
src/content/content.test.ts:28：指定內容種類件數正確，expected 2，actual 7
test/golden.test.ts:84：ENOENT test/golden/people-berserk.hash
test/golden.test.ts:84：ENOENT test/golden/people-capture.hash
test/golden.test.ts:84：ENOENT test/golden/people-eject.hash
test/golden.test.ts:91：黃金情境至少 6 個，實際 3
```

兩支既有測試單獨重跑仍失敗，且與 knowledge-score 線既有 REPORT 的失敗證據一致。本線未改動內容包、內容件數斷言、golden 情境或 hash；依交接範圍不修別線檔案。

## 需要決定的事

契約指定 sentinel 回守點的候選仍用 scoreCandidate 評分；若回守點同時遠離敵人，移動可能沒有正分而由 agent 結束行動。此處保留指定公式，是否另加回守點獎勵交領導決定。

berserk 仍尊重 RulesQuery 的目標合法性。只剩友方時，friendly:no 的單體技能會被規則拒絕；固定測試用契約 fixture 的 mortar（friendly:yes）驗證攻擊友方，不修改規則或 fixture。

既有內容件數與 golden 缺檔交領導協調所屬線；code map 與 commit 也依本線禁止修改 wf／禁止 commit 的範圍交領導整合。

## SPEC-GAP 清單

- 部署缺少部署區查詢：依契約 deploy 回傳本方當前位置，實際部署交 sim／情境。
- 回傳「含最後 end」與終止指令條件有歧義：依明文流程，wait／retreat／eject 成功即停止，或單位失去 active 時停止；只有無候選、重試達上限、行動數耗盡才補 end。回傳只包含實際成功指令。
- flee 沒有已知敵人時，最近敵人距離取 0；沒有 exit 時出口距離也取 0，避免 Infinity 讓抽選器丟棄候選。
- sentinel 回防候選保留契約指定 scoreCandidate，沒有另加回防獎勵；無正分時 agent 會結束。待決事項如上。
- berserk 擴大候選對象但不繞過規則合法性，友傷由允許友方目標的能力實現；沒有修改陣營或凍結介面。

## 以後交接書該點名的工具

無。

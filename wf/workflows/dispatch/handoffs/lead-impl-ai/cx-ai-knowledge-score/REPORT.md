# cx-ai-knowledge-score：9 檔完成、22 個測試通過、型別檢查零錯誤

## 做了什麼

完成 contract §2–§5 的知識、危險圖、估值與記憶體規則替身。三個實作檔的匯出名稱與簽名符合契約，未新增其他公開 API。替身包含 claw／rifle／scan／mortar／repair 五個能力，支援 AP、八方向尋路、牆與單位阻擋、LOS、逐層傷害、死亡、撤退與複本預覽。

驗證證據（2026-10-24，本線沙箱內）：

- `node --test --test-isolation=none --test-reporter=tap 'test/ai/*.test.ts'`：exit 0，30 tests／30 pass／0 fail。其中本線四檔恰好 22 個 `test()`（stub 4、knowledge 6、danger 4、score 8），其餘 8 個是當時已存在的 policies 線測試。
- `npm run typecheck`：exit 0，整體零錯誤，本線 9 檔零錯誤。未補 node shim、未安裝套件。
- 匯出宣告逐項比對：knowledge 8 個函式、danger 3 個函式、score 的 TACTICS／PreviewOutcome 與 7 個函式；stub 的 3 個型別與 3 個函式符合契約。
- 三個實作檔沒有 `../rules`／`../content` import。`DC-C09`、`DC-T08` 均出現在 `test/ai/knowledge.test.ts` 的測試名稱。
- 9 檔合計 51,488 bytes；加上本 REPORT 共 10 個交付檔。未 commit。

## 產出（9 個檔的清單）

以下路徑均相對於 `/home/lorkhan/repo/game_dev/mecha-srpg/`：

1. `src/ai/knowledge.ts`
2. `src/ai/danger.ts`
3. `src/ai/score.ts`
4. `test/ai/stub-rules.ts`
5. `test/ai/fixtures/abilities.json`
6. `test/ai/stub-rules.test.ts`
7. `test/ai/knowledge.test.ts`
8. `test/ai/danger.test.ts`
9. `test/ai/score.test.ts`

另附本檔：`wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-knowledge-score/REPORT.md`。

## 沒做到或證據不足的

沙箱外恰好 22 個測試及型別驗收，依交接書留給領導重跑；本線不能聲稱已取得沙箱外證據。

已執行 `npm test`：exit 1；隔離模式輸出為 27 個檔案、25 pass／2 fail，失敗檔為 `src/content/content.test.ts` 與 `test/golden.test.ts`。為分清錯誤來源，僅針對這兩檔改用 `--test-isolation=none` 重跑，得到：

```text
src/content/content.test.ts:28
指定內容種類件數正確：expected 2，actual 7

test/golden.test.ts:84
ENOENT test/golden/people-berserk.hash
ENOENT test/golden/people-capture.hash
ENOENT test/golden/people-eject.hash

test/golden.test.ts:91
黃金情境至少 6 個，實際 3
```

錯誤發生於既有內容件數斷言與其他並行線尚未交齊的 golden 產物；本線未修改 content、rules、core、golden 或其測試。這些失敗不是本線 22 個測試失敗，亦非 node 無法執行 TS／沙箱拒寫。未越界修正。

## 需要決定的事

無本線待決定事項。整體 `npm test` 的內容件數與 golden 缺檔請領導協調各所屬線收斂；本線不增加驗收條件，也不修改其他線檔案。

## SPEC-GAP 清單

- 替身沒有 ContentDB 儲存公開定義：以 BattleState 的純資料擴充欄 `stub` 保存初始 StubUnit 定義與牆；讓 `structuredClone` 後仍可查詢部位、能力、感測與 grade。實際位置、AP、HP、存活狀態仍讀 BattleState 對應欄位。
- 不可見 lastSeen 單位的能力未知：依 contract §3，半徑 2 內給固定危險 1，不讀真實敵方能力。
- `targetValue` 凍結簽名沒有 params：獨立呼叫使用 DEFAULTS.focusBonus；`scoreCandidate` 透過未匯出的 helper 使用 ctx.params.focusBonus。危險圖的凍結簽名同樣無 params，ZoC／lastSeen 數值依 §3 固定。
- profile params 僅數值：依 contract §4，以固定 want 公式套用 profile 係數，不另增 NumExpr API。

## 以後交接書該點名的工具

無。

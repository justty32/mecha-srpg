# cx-core：六檔已提交，28 項測試通過；指定指令的計數差異阻塞驗收

## 做了什麼

完成 PCG32 RNG、NumExpr／Cond 求值與結構檢查、可決定性序列化的事件日誌及 FNV-1a 64。三支測試固定為 8／12／8 個 `test()`，每完成一個檔均執行 `inbox_poll.sh cx-core --once`。

依使用者指定只執行交接書四條驗收，未擴充驗收條數。凍結契約、其他線程式與 wf 文件均未修改；本 REPORT 與 inbox 回報除外。

## 產出

六個程式檔位於 `/home/lorkhan/repo/game_dev/mecha-srpg/src/core/`：`rng.ts`、`rng.test.ts`、`numexpr.ts`、`numexpr.test.ts`、`eventlog.ts`、`eventlog.test.ts`。合計 27,443 bytes，未達 60 KB gate；加上本 REPORT 共七個交付檔。

commit：`03369be` — `foundation: core rng／numexpr／eventlog＋測試`，只含上述六檔。

固定四條驗收結果：

1. **阻塞**：原指令 exit 0，但輸出是 `# pass 3`、`# fail 0`，未達指定的 `# pass 28`。詳細證據見下一段。
2. **完成**：六個檔存在；逐一核對三個實作檔的全部匯出，名稱、型別及簽名與交接書一致，沒有新增公開 helper。
3. **完成**：`git log -1 --oneline 03369be` 與 `git show --format= --name-only 03369be` 確認 commit 前綴及六檔範圍；`git status --short src/core` 無輸出。
4. **完成**：本 REPORT 已建立，含指定四段。

## 沒做到或證據不足的

終局狀態為 **BLOCKED**：無法宣稱指定測試指令符合既定計數。node 是 v24.14.1，可以原生執行 TypeScript；並非程式斷言失敗。預設測試隔離下僅顯示每個測試檔一項，原因未定位，不能逕稱全部測試已由原指令執行。

原指令與關鍵輸出（exit 0）：

```text
node --test --test-reporter=tap 'src/core/*.test.ts'
ok 1 - src/core/eventlog.test.ts
ok 2 - src/core/numexpr.test.ts
ok 3 - src/core/rng.test.ts
1..3
# tests 3
# pass 3
# fail 0
```

為判別程式錯誤與測試執行環境差異，另以相同測試、停用程序隔離執行（exit 0）：

```text
node --test --test-isolation=none --test-reporter=tap 'src/core/*.test.ts'
1..28
# tests 28
# pass 28
# fail 0
```

三組個別執行同樣通過 8／12／8 項；RNG 另直接執行 `node src/core/rng.test.ts`，亦為 8 項全數通過。這些只作問題定位證據，未擅自替換原驗收指令。保留已提交程式與現狀，未回滾。

解除條件：在能正確回報子測試的環境重跑原指令，得到 `# pass 28`、`# fail 0`；或由上游明確修訂契約，接受停用測試隔離的指令。

## 需要決定的事

上游需處理上述測試執行環境／驗收指令差異。除此之外，以下未定義邊界已採最小解並在程式標註 `SPEC-GAP`：`rollInt` 端點限安全整數，區間寬度沿用 `nextInt` 的 1..2^32；加權抽樣拒絕負值、非有限權重及非有限總權重；canonical JSON 拒絕非 JSON 型別與循環引用，陣列 undefined／空洞序列化為 null。

交接書禁止本線修改 code map；其 core 列仍標測試「規劃中」，請上游整合時同步。

以後交接書該點名的工具：無。

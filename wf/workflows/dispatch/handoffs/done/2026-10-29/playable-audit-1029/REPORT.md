# 盤點 REPORT

> **子線階段報告。** 最終整合驗證及交付見[主REPORT](../lead-playable-1029/REPORT.md)；下文保留當時交接狀態，並非最新整體待驗清單。

## 做了什麼
唯讀既有整合報告與失敗表、套件設定、瀏覽器快取和依賴；以 `tabledb.py` 讀取九敗，並用 `git status --short` 記錄環境。未跑測試、啟動瀏覽器或下載。初始工作樹已有其他工作修改和未追蹤交接檔。

## 產出
10/28 快照的九敗均屬包內相同已知敗；是否阻斷實際遊玩均**未經實機證實**，下列標示為風險判讀，不能當作已證實阻斷。來源：[失敗表](../../../verify-import-1028/failures.json)、[整合報告](../../../verify-import-1028/REPORT.md)。

| 失敗 | 測試來源 | 類別／遊玩影響 |
|---|---|---|
| campaign_act sortie 存檔重播 | src/mcp/campaign.test.ts | 燃料不足；可能阻斷該出擊流程 |
| 長時間 wait 終局停止 | src/ops/sim/campaign.test.ts | 終局日 90 而非 132；可能影響長期遊玩 |
| 固定指令事件日誌 | src/ops/sim/golden.test.ts | hash／事件數差異；實際阻斷未知 |
| ops-war-assault | test/campaigns/campaigns.test.ts | hash／事件數差異；實際阻斷未知 |
| ops-relic | 同上 | hash／事件數差異，軌跡改變；實際阻斷未知 |
| ops-merc-join | 同上 | unused-battle-record 重播錯誤；可能阻斷該重播 |
| ops-betrayal | 同上 | 預期事件子序列缺失；可能影響該事件 |
| ops-leak | 同上 | hash／事件數差異；實際阻斷未知 |
| sail／遭遇／迴避／抵達 | test/campaigns/grid-actors.test.ts | hash 差異，列出的事件與日期相符；實際阻斷未知 |

headless shell 現有路徑 `/home/guanyu/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`。`ldd` 原缺 nspr、nss、nssutil、asound；設 `LD_LIBRARY_PATH=$PWD/node_modules/.canvas-headless/root/usr/lib/x86_64-linux-gnu` 後靜態依賴查無缺失。這不證明能啟動。

## 沒做到或證據不足
主樹 `node_modules` 無 `.bin`、Vite、Playwright；快取僅瀏覽器 1243，設定註解期待 1248。既有整合隔離樹 `/tmp/mecha-integrate-1028/replay` 亦不存在。未找到可直接使用的專案依賴，故不能聲稱現有環境可執行 e2e；未確認其他未搜尋位置或 npm 離線快取內容。沒有執行測試與 GUI，不能判定九敗是否在目前 HEAD 重現。

## 需要決定
若可取得相容的既有依賴，可在隔離樹或暫時連結以避免改主樹，並確認 Playwright 與瀏覽器 revision 相容，再由隊長排程 `LD_LIBRARY_PATH=... npm run test:e2e`；設定會 build 並起 preview，heavy-lock 序列化重負載。缺依賴或 revision 不相容時目前為 BLOCKED；不要用可能自動下載的 npx 補套件。後續工具：`ldd`、`python3 wf/tools/tabledb.py`、`git status --short`。

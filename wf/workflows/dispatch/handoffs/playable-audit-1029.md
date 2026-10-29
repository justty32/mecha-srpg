# 任務：盤點既有失敗與無視窗工具

先讀：AGENTS.md（雜活，只讀這份）。

## 背景與唯一目標
協助隊長掌握測試環境與九敗，不跑測試。

## 範圍
- 只做：唯讀package.json、playwright.config.ts、scripts/heavy-lock.sh、現有node_modules與瀏覽器快取、wf/workflows/dispatch/handoffs/verify-import-1028，及自己報告。
- 不做：任何產品修改、測試程序、下載、其他檔寫入。
- 件數 gate：報告超過3件先回報；容量 gate：超過1 MB先回報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | 按欄讀既有失敗 |
| `git status --short` | 記錄環境 |

## 資源與禁區
**唯讀調查線**：僅寫報告。子代理上限0，不commit/push，不刪檔，不安裝下載，不碰GUI鍵鼠螢幕，不跑任何測試。同時僅一測試由隊長排程。

## 工作
1. 精簡列九敗名稱、來源檔、分類與是否阻斷遊玩，避免搬整套log。核現有headless瀏覽器可執行路徑與需用的既有局部lib，提出不下載的e2e執行方法。不要執行測試。
2. 寫REPORT後回傳。

## 交付
REPORT直接寫到 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-audit-1029/REPORT.md`，四段做了什麼／產出／沒做到或證據不足／需要決定，附後續工具。

## 驗收（固定2條）
1. 九敗精簡表與headless可用路徑有來源證據。
2. 無產品改動與測試程序，REPORT存在。

## 失敗怎麼處置
取不到工具證據報BLOCKED，不下載。原生工具回報終局。

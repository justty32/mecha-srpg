# 任務：審查本輪玩家可觸發缺陷

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親自讀feature-dev、testing、common/user與子頁、conventions、code-map、本輪playable-battlefield spec。

## 背景與唯一目標
本輪跨約49產品檔，獨立找實際玩家互動／回收／存讀／cache缺陷，不查命名風格。

## 範圍
- 只做：唯讀git diff列出的本輪src/content/schemas/test/e2e與直接依賴、本輪spec；只寫自己的報告。
- 不做：產品修改、測試、擴功能、其他歷史工作、legacy/art。
- 件數 gate：最多5個具體findings，超過先報；容量 gate：產物超過1 MB先報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `git diff` | 查本輪實際改動（含cached及untracked產品） |
| `rg` | 核對直接引用與驗證邊界 |

## 資源與禁區
**唯讀調查線**：只寫報告，子代理上限0。不跑任何測試/探針，不commit/push、不刪檔、不安裝下載、不碰GUI鍵鼠螢幕，不碰三原review log。全樹重負載僅隊長full suite。

## 工作
1. 最新重大系統重新集中審查：幾何命中100%與motion時效/phase/讀存重播，生體vital血死與機械不誤出血，器官真禁能力/移動/抓握，盾實承傷破盾與有限招架條件、不同base分流。engine尚收尾共享query欄，未完成項先與其核對不把正在寫當缺陷。以主brief驗收2/3/4核對實際玩家可觸發缺陷與資料所有權，檢查互動拒絕原子性、所有權、物件迷霧、破壞到拾取、真存讀回放、新cache失效/clone。
2. 最多5具體問題，附精確檔行/觸發步驟/影響/最小修法；沒有證據不要湊。先即時報嚴重問題，完成寫REPORT。

## 交付
REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-review-1029/REPORT.md`，四段做了什麼／產出／沒做到或證據不足／需要決定，附以後工具。

## 驗收（固定2條）
1. REPORT最多5個有證據玩家可觸發findings或明確無發現，不混風格建議。
2. 無產品改動與測試程序，回報可供隊長直接分派修復。

## 失敗怎麼處置
不確定標證據不足，無法讀取則BLOCKED；原生工具回報。

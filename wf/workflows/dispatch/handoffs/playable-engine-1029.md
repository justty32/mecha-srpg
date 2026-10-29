# 任務：實作可互動戰場與命中修正引擎

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親自讀 feature-dev、testing、common/user與子頁、conventions、code-map、dev-env、data-files與本輪spec/plans playable-battlefield-1029；spec未落檔先依隊長訊息等候。

## 背景與唯一目標
使使用者要求的豐富戰場在真實遊戲能操作；使用既有系統最小擴充。

## 範圍
- 只做：原精確授權路徑與各項限制已抽至 [scope.json](playable-engine-1029/scope.json)；另含自己的報告目錄。未列路徑先回報擴檔。
- 不做：src/ui-adapter、其他內容、legacy、art、黃金重錄、Fable待裁決題。
- 件數 gate：本線總交付超過90件先報（僅附件擴容）；整輪產品仍限140件、容量25 MB。容量 gate：本線超過5 MB先報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `node --test` | 隊長排程後僅相關單檔 |
| `git status --short` | 保護別線改動 |
| `python3 wf/tools/tabledb.py` | 查wf資料 |

## 資源與禁區
**可寫程式碼線**：只寫範圍精確檔。子代理上限0。不commit/push，不建分支、不rebase/reset，不刪檔、不rm -rf，不改.gitignore/外部設定，不安裝下載、不開GUI、不碰鍵鼠螢幕。三個review log不可動。全樹工人最多3；所有npm/單檔/DOM/e2e由隊長排程同時僅一個，未獲排程不可跑，nice -n 19低concurrency。無外網需求。

## 工作
1. 依凍結契約完成可互動戰場、新幾何命中、傷勢、防禦及多部位；成本和驗證具原子性，預覽與結算一致。
2. 依 [五級移動](../../planning/specs/combat-movement-1029.md) 實作整回合移動額度與反例；保留原預設編組、地圖、部署與初始資源。
3. 依 [十回合重創驗收](../../planning/specs/demo-severity-1029.md) 固定判準，先量 seed 1/7/13，再以20校準和5保留seed重驗：原default 4v4十回合內一方原四台全死亡，或死者已解決且存活者全重傷；任何撤退或棄機失格。分別記錄首次重創與真全殲，不把重傷改成遊戲勝負。觀察因果後才小幅調整內容數值；舊20回合結果屬歷史。
4. 補相關反例與可重現probe，提出精確測試指令供隊長排程；不假稱全套通過。

## 交付
REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-engine-1029/REPORT.md`，四段做了什麼／產出／沒做到或證據不足／需要決定，附以後工具。

## 驗收（固定3條）
1. 凍結契約落地，真實預設與ops戰場具指定物件與地面支援，破壞/拾取/死亡有邏輯回歸。
2. 五級移動與預覽結算一致回歸存在；固定重創判準及原4v4十回合目標的量測可重現，並分別報首次重創與真全殲。
3. REPORT與精確修改檔清單存在，測試由隊長排程後明列結果。

## 失敗怎麼處置
本線regression修好再交，拿不到驗證證據報BLOCKED，不改別線；原生工具回報終局。

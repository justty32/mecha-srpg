# 任務：設計手機布局、地圖拖曳與快捷操作的可實作契約

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親讀 feature-dev、dispatch、team-model、testing、common/conventions、common/code-map、common/user 與 user/working；再讀 `wf/workflows/dispatch/handoffs/lead-mobile-1029.md`。

## 背景與唯一目標

設計手機布局、地圖拖曳與快捷操作的可實作契約。使用者接受既有玩法，不改數值。角色模型 gpt-6-astra，原生 collaboration 啟動與回報。

## 範圍（排除法寫死）

只寫 `wf/workflows/planning/specs/mobile-ui-1029.md` 與自己的 `wf/workflows/dispatch/handoffs/mobile-1029-design/REPORT.md`；其餘產品及文件唯讀。不做實作、不擴玩法、不上網。件數 gate 2 檔，容量 gate 1 MB；任一超過停下回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `rg` | 查實際入口與現有測試 |
| 原生 collaboration | 進度與終局回報 |

## 資源與禁區

唯讀調查線，僅可寫上述交付。禁止跑任何測試、npm、重 runner；不開服務、不 GUI、不碰鍵鼠螢幕，不安裝、不上網、不刪檔、不 commit/push、不 branch/rebase/reset、不改全域配置。子代理上限 0。全隊同時最多三工人、唯一測試 runner 歸領導。

## 工作

讀實際 UI 與 e2e，寫可交 sol 的路徑分工建議與風險。設計線先給交互與布局決策，後續可由領導重新啟動審 headless 圖；盤點線只列精確路徑與本機 Playwright 可用證據，不跑測試。

## 交付

REPORT 直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/mobile-1029-design/REPORT.md`，四段：做了什麼／產出／證據不足／需要決定。設計另寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/planning/specs/mobile-ui-1029.md`（盤點只有 REPORT）。

## 驗收（固定 2 條）

1. 交付檔存在，建議引用實際檔案與符號，符合母交接五條驗收。
2. 未修改產品、未跑測試與重工作，原生工具回報 DONE 與路徑。

## 完成／阻塞回報

原生 collaboration 向領導回報 DONE/BLOCKED，實際阻礙立即說明證據，不結束回合假等待。

## 完成證據

產品7478bd35已push；本線原生工具已終局。UI DOM231/231、正式批次28/29；最後touch三連1/3，圖外模擬pointerdown觀測限制未宣稱全綠，依主線16:48裁示帶限制交付。精確證據及主線後續見lead-mobile-1029/REPORT.md。

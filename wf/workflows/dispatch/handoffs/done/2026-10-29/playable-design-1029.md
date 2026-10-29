# 任務：設計最小完整可互動戰場

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親自讀 WORKFLOWS、feature-dev、testing、planning、common/user 與子頁、conventions、code-map、dev-env、data-files；設計線另讀核心規格。

## 背景與唯一目標
使用者要完整可玩遊戲，營運存取為最高優先。本線只完成標題工作。

## 範圍
- 只做：wf/workflows/planning/specs/combat-movement-1029.md，wf/workflows/planning/specs/combat-part-hits-1029.md，wf/workflows/planning/specs/combat-aim-injuries-1029.md、wf/workflows/planning/specs/combat-defense-1029.md，wf/workflows/planning/specs/demo-balance-1029.md、wf/workflows/planning/plans/demo-balance-1029.md，wf/workflows/planning/specs/playable-battlefield-1029.md、wf/workflows/planning/plans/playable-battlefield-1029.md、wf/workflows/planning/specs/battlefield-object-ideas-1029.md、wf/workflows/planning/specs/battlefield-roster-1029.md，及自己的報告目錄。
- 不做：其他產品檔、legacy、art、無關內容、wf整合檔、黃金重錄。
- 件數 gate：超過20件先報；容量 gate：超過2 MB先報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `git status --short` | 保護既有改動 |
| `node --test` | 只在隊長排程後跑指定單檔 |
| `python3 wf/tools/tabledb.py` | 查資料清單 |

## 資源與禁區
**可寫程式碼線**：只寫範圍路徑。子代理上限0。不commit/push、不建分支、不rebase/reset、不刪檔、不rm -rf、不改.gitignore或外部設定、不安裝下載、不開GUI、不碰鍵鼠螢幕。保護三個原有未追蹤review log。全樹工人最多3。所有npm測試/單檔/DOM/e2e由隊長排程同時只一個；不可自行開跑，允許唯讀調查。nice -n 19，低concurrency。外部查詢只能web工具，本線不需外網。

## 工作
1. 唯讀查既有src與content、核心spec、舊Fable三題。量測設計命中率前後的可重現方法；設計降低miss、可破壞掩體、地面支援、廢墟碎石、拾取物、殘骸、怪獸屍體在真實戰場的最小完整交付。先提交可分工精確檔案及契約，接著寫spec/plan。不要替使用者裁定Fable題，不寫產品碼，不跑測試。
2. 使用者新steering發想補充：以可破壞／可互動／掩體／可拾取四個可重疊屬性，擴人類常規兵種／巨獸與非巨獸群體／設施／遺留物的完整戰場生態與可實作分期，做機甲尺度物件與破壞後狀態轉換、有取捨互動/連鎖例子，區分本輪已有／應優先／以後候選。不得擅加實作範圍。
3. 本輪另落最小代表編組設計：重用現有內容凍結人類坦克/飛彈車/工兵救援及小型群獸/噴吐獸/重甲獸同場實戰、精確數值路徑與回歸條件，不新造雷達/攔截/鑽地/宿主。
4. 最高優先新裁示：凍結真正default scenario/skirmish-whitegloves在積極硬剛策略下20固定seed及保留seed、20回合內真分勝負的內容平衡契約；不得換對手或強制平手，先分析資源與空轉。
5. 定期工具回報隊長發現與需要的擴檔；完成寫報告。

## 交付
REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-design-1029/REPORT.md`，四段做了什麼／產出／沒做到或證據不足／需要決定，附以後工具。

## 驗收（固定2條）
1. 標題工作落地且有具體檔案與根因或設計取捨證據。
2. REPORT存在，測試結果或待排程指令明列，不虛報通過。

## 失敗怎麼處置
本線regression修好；拿不到證據回報BLOCKED保留現狀。原生工具回報終局，不能只口述不寫檔。

## 完成證據（2026-10-29）

1. 標題工作落地且有具體檔案與根因或設計取捨證據。 → [本線REPORT](playable-design-1029/REPORT.md)、[整合驗證](lead-playable-1029/verification.json)。
2. REPORT存在，測試結果或待排程指令明列，不虛報通過。 → [本線REPORT](playable-design-1029/REPORT.md)、[整合驗證](lead-playable-1029/verification.json)。

源碼及驗證提交 `a3407d9711f991472cac6a9dc03dacd2e827edf2` 已push並核對origin/main。原生agent已FINAL_ANSWER，無外部inbox終局檔；本線服務／runner已停止。

# 任務：實作常規三車角色策略

先讀 AGENTS.md、[總brief](lead-roles-1029.md)指定入口、[角色契約](../../../../planning/specs/unit-roles-1029.md)。

## 範圍（排除法）

只寫總brief已授產品路徑：src/ai/agent.ts、src/ai/score.ts、test/ai/unit-roles.test.ts、test/sim/combined-arms.test.ts、content/base/aiprofiles/battlefield-{frontline,standoff,heat-support}.json、content/base/frames/battlefield-{tank,missile-truck,engineer}.json。root已核准五個最小接線路徑：src/core/types-def.ts、schemas/content.schema.json、src/ai/rules-query.ts、src/ai/adapters/rules-adapter.ts、src/ai/policies/tactical.ts。產品件數 gate 18 檔、容量 gate 2 MB（含生成index，由隊長統一產生），文件只本brief與roles-1029-implementation/REPORT.md，最多2檔/32KB。不做：不得改其他來源、手機UI/e2e、全局規則、demo、套件、legacy、原3logs。不得開子agent。

## 必用工具

| 工具 | 用途 |
|---|---|
| rg、git diff | 唯讀盤點與差異 |
| 原生collaboration | 回報與領runner |
| node --test | 領時段後有界測試 |

原生collaboration回報，普通工gpt-6.1-sol；先唯讀/寫碼，不跑任何node/npm測試、typecheck、check、build、sim或browser，唯一runner由mobile_lead排程，隊長明確交棒才准跑。可用rg與git diff唯讀。不得commit/push/stage、下載、GUI、停服務、刪檔。17:10硬截止，16:30功能凍結，目標16:10交可驗程式與精確命令。

## 資源與禁區

可寫程式碼線。禁GUI、鍵鼠螢幕；不push、不刪檔、不下載。與總brief同一份授權，子代理上限0。

## 工作

依已凍結角色契約實作選填frame profile、只啟用者的距離策略/退距候選、三profile，既有未標註frame/profile行為原路不變。所有數值走content profile；工程只真排熱不宣稱修甲。測試固定局面正負對照、預設行為直接回歸，並準備三seed完整交戰有界命令與記錄（seed先固定3/17/41）。測試腳本留test/ai允許範圍，不另造框架。

## 驗收（固定 3 條）

1. 坦克前線、飛彈退距/遠射、工程有需求排熱與無需求不浪費，各有固定可觀察斷言及負對照。
2. 未設frame profile與既有特殊policy不受覆蓋，原demo/data/global不改；列出精確待跑測試與三完整交戰命令。
3. 回報改動路徑、scope計數、風險/未完與REPORT；不自行啟runner，不動他線。

## 交付

輸出 /mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-29/roles-1029-implementation/REPORT.md，四段做了什麼／產出／證據不足／需決定，向隊長回終局。測試未跑明記未跑，不能自稱通過。

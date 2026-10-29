# 任務：交付有實際戰術差異的常規兵種 AI

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親讀 feature-dev、team-model、dispatch、testing、conventions、code-map 與 common/user；實質子 agent 同樣先讀。

## 背景與唯一目標

使用者已同意手機之外繼續改進，root建議優先兵種分工與AI，使用者說「好，去吧，今天五點十分下班前弄好push」。台北2026-10-29 17:10為硬截止；16:30前功能凍結，最遲16:55完成必要提交推送。目標是現有常規編組能呈現坦克前線、遠程保持距離、工程支援的可觀察行為差異，不擴寫整個遊戲。

## 範圍（排除法寫死）

只可寫 `src/ai/agent.ts`、`src/ai/score.ts`、`test/ai/` 內本輪明列測試、`content/base/aiprofiles/` 本輪新增 profiles、`content/base/frames/battlefield-tank.json`、`content/base/frames/battlefield-missile-truck.json`、`content/base/frames/battlefield-engineer.json`、`test/sim/combined-arms.test.ts`，及內容索引的實際受影響生成分片。先盤點既有profile參數能否完成，優先資料驅動；修改AI時新增選填策略的預設必須保持既有行為。

產品件數 gate 18 檔、容量 gate 2 MB；本線文件最多12檔／3 MB。只可另寫本brief、`lead-roles-1029/`、`roles-1029-*`交接與附件、`wf/workflows/planning/specs/unit-roles-1029.md`。其他 wf 整合點（SESSION、CLAIMS、code-map、core導航、done索引）與mobile_lead約定單一寫入者，不並寫。

本輪補充授權：為讓三車真的採用各自profile，可另寫`src/core/types-def.ts`、`schemas/content.schema.json`、`src/ai/rules-query.ts`、`src/ai/adapters/rules-adapter.ts`、`src/ai/policies/tactical.ts`。只加FrameDef.aiProfile選填引用、選填查詢與正權重才啟用的退距候選；無設定走原路，不覆蓋scripted／berserk／flee／任務withdraw。generic src/content/schema.ts不因本補充獲寫權；必要引用負例放已准test/ai。本輪總件數gate仍18，生成分片實數超過再回報。

不做：戰鬥數值／移動／命中／傷勢規則、UI/e2e、舊預設demo編組或profile、營運生成／黃金重錄、世界觀或新兵種、套件、art、legacy、.github、Vite、儲存與戰後UI。原3個untracked review logs不動。超gate先回root，不自擴。

## 必用工具

| 工具 | 用途 |
|---|---|
| 原生collaboration | 派工／監看／回報 |
| `python3 wf/tools/brief_lint.py` | 子線strict |
| `node --test` | 有界行為測試，先領runner時段 |
| `bash wf/tools/wf-lint.sh --strict .` | 本線無新增硬違規，原2條legacy壞鏈記基線 |
| `git log --oneline`、`git status --short` | 明確路徑提交與收線 |

## 資源與禁區

可寫程式碼線。領導sol，規劃astra（可重用舊design），普通工sol，雜活terra。本線最多2個子agent，與全隊協調最多3工人同時寫碼；先讓一名sol主工，規劃短且有界。原生回報，不寄外部訊息。

全隊只有一個測試／重runner，現由 `/root/mobile_lead` 管時段；未取得時段不啟npm/node測試、build或模擬。新線可唯讀／寫碼。不開GUI、不碰OS鍵鼠、不安裝依賴、不停使用者服務、不上網查無關資料。可明列路徑commit到main並push；不git add -A／目錄add，不branch/rebase/reset/delete，不碰他人修改。提交與mobile_lead、pages_lead協調，避免共享index競態。

## 工作

先確認現有三台車輛、能力與AI profile能做什麼，交精簡角色契約給實作。各角色只取可在既有命令中完成的戰術；工程車以實際存在的支援／冷卻能力為準，不宣稱尚無的修復。遠程兼顧射程、距離和避免自殺接近，坦克進前線承壓，支援依友軍真需求行動。

規劃戰術測試使用固定可重現局面與負對照，不靠改武器傷害或選有利seed。保存三個代表完整交戰樣本，記拒絕／卡住／終局，明示不能由少量樣本宣稱全面平衡。預設profile不變的回歸須有直接證據，不重跑33分鐘core suite或所有營運CLI。

## 交付

REPORT寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-29/lead-roles-1029/REPORT.md`，四段做了什麼／產出／證據不足／需決定，記行為差異、指令、實數及hash。設計寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/planning/specs/unit-roles-1029.md`。根據時間收斂，不以大量文件拖延推送。

## 驗收（固定 4 條）

1. 三台現有車輛有可觀察的角色策略，代表局面分別證明前線／遠距／有需求支援的選擇，而非改名。
2. 舊profile預設行為保持，原demo數值與移動不變；角色測試、必要型別／內容檢查及三樣本交戰通過，無拒絕循環。
3. 無新wf-lint硬違規、明列路徑commit/push，原logs及其他線改動保留。
4. 17:10前回報實際交付hash／report／限制；自己的工人與runner收線，未完成項誠實列明，不假稱完成。

## 完成／阻塞回報

每一實際阻礙帶證據及最小決策回root；原生工人用工具回傳。領導先回範圍與時程，隨後自主推進，必要但有界驗證後直接推送，不反覆求批准。

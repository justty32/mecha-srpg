# 任務：產出八個有部位取捨與新招的怪獸形態

先讀：`/workspace/scratch/4c78897e16f4/mecha-srpg/AGENTS.md` 與工作區根 AGENTS.md；親自讀 WORKFLOWS、common/user及working/art、team-model、dispatch/content-batch、content全適用md與world-pillars子檔、bio-monsters/abilities-effects、lore/style、templates/numeric-bands/engine-facts相關列、core怪獸/能力及world/design-notes契約。此前親讀可核readlist，不靠摘要；以當前code/tests窄核過期現況。

## 背景與唯一目標

gpt-6.1-sol（xhigh）按astra核定 `monsters-ready.json` 八列製作實質形態變體，非新species。計畫絕對路徑 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-plan/monsters-ready.json`，manifest `/workspace/scratch/4c78897e16f4/mecha-srpg/content/batches/2026-10/expansion-1028-monsters.json`。首四可立即開始，八列已齊，不等總計畫。形態俗稱不作D–B個體二名；新招與部位取捨必真實。

## 範圍（排除法寫死）

只在 `/tmp/expansion-1028/wt/monsters` 新增manifest.plannedFiles精確二十檔：八monster、八ability、兩effect、兩scenario。worktree不留其他檔、HEAD固定base，不commit。另只寫 `/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-monsters/` 與 `/tmp/expansion-1028-monsters/`。件數 gate：二十內容檔；容量 gate：每檔≤16KB、內容共≤256KB，readlist≤64KB、報告metadata≤256KB、logs各≤64KB、Markdown≤8KB；任一超限先報。不做主樹content直接寫、既有species/bodyplan/bio/corpse修改、新registry、引擎/schema/spec、新物種專屬捕獲機或舊lore裁決。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 核定表與索引條件查詢 |
| `wf/tools/content_gate.py` | 最後focused範圍自查 |
| `src/content/loader.ts` | 最後內容檢查 |
| `content/lore/check.ts` | 最後lore檢查 |
| `wf/tools/brief_lint.py` | 交接品質 |

## 資源與禁區

可寫程式碼線：僅上述精確路徑。禁push/commit/建分支/rebase/reset/刪檔/GUI/螢幕/鍵鼠/下載安裝/secret或config變更/外部CLI agent。依賴已按本輪使用者授權裝好。子代理0；全機3工人/1重負載。本線只最後focused check/lore/typecheck/gate各一次，不跑npm test/probe/MCP/sim，領導統一重驗。自己打錯路徑指令可安全修正；真正拒絕先查結果，同拒絕只有新相關證據且確知未執行可一次重試，否則回報。

## 工作

立即按八列產出；數值同級暫填，schema窄細節由你依實際範本正確翻成當前欄位，不照抄規劃偽碼（K01 trigger應是event/oncePer）。K02正確part是wing-left/wing-right，feet無locomotion；K03後腿hindlegs；K08ball範本fw-cinder-rain-use。保留既有species繼承招，extraAbilities僅加招；只override既有part id，layers/functions為整欄。保留至少一個可毀core、菌絲無organ、至少一傷害型零抗。D–B不寫name/epithet，俗稱寫etymology與部位名，nameEn只說形態。兩effect有中文badge且對無charge/heat者不造池。

捕後沿既有species.capture.frame，不宣稱專屬形態保留；注意層數/類型override與capture保留層狀態可能有相容風險，先靜態核報告，不自己改engine；若必要，可在新monster內保持原層數的最小相容調整並說明。不得宣稱打斷攻具自動封extraAbility、鑽地技能真的位移或帶翼就會飛。兩展示分別覆蓋K01–K04、K05–K08，新怪每隻出場，既有我方有對獸武器／人物不重複／玩家敗條件。最後focused四道與報告，將重驗交領導。

## 交付

`/workspace/scratch/4c78897e16f4/mecha-srpg/wf/workflows/dispatch/handoffs/expansion-1028-monsters/REPORT.md` 開頭逐列manifest.mustRead，完整readlist.json。review.json八列EX-K前綴（≤60字繁中）、naming.json、focused-results.json與四原始log。報告列每件HP/部位犧牲/新招情境、反應或條件招未用的合理待測、capture相容疑點，未跑不標pass。回覆五行自足摘要與REPORT路徑。

## 驗收（固定 3 條，做完就停）

1. 二十精確檔存在，八件有實際部位取捨與各一新招，不是純增血或換名；無領地外修改。
2. review/naming八列、完整readlist與REPORT的mustRead齊，清楚標非八新species／捕後回既有frame。
3. focused check/lore/typecheck/gate各一次具原始證據無新錯誤；未跑重驗與疑點如實交領導，不自行commit或帶回。

## 完成證據

本線已回報終局；本輪產出與獨立後查由原生工具收件。報告／帳本保持原reportDir，整輪技術結論及未驗項目見本輪領導REPORT；後續lead整合檢查不代表工人仍在執行。

# 任務：cx-fg-ga-01 產出稿——裝甲防禦分工：10部件＋2能力＋2效果

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀）；以下路徑全部親讀，REPORT 開頭列「已讀清單」，JSON 用 tabledb 分片查。

完整先讀路徑已抽到 [fg-ga-01.read-list.json](fg-ga-01.read-list.json)（20列、皆絕對路徑）；與manifest.report.mustRead一一對應，不可只讀本稿摘要。

## 背景與唯一目標

依 lead-fill-gear 的 ga 計畫新增非武器部件及附帶能力／效果。這是待領導啟動的產出稿；領導先把 manifest.base 的 TBD 換成實際 commit 並建好隔離 worktree，工人不自己建分支或 worktree。數值照同級暫填，後期統一調。只完成本批 14 檔與固定四條驗收。

## 逐檔規格

逐檔完整規格已抽到 [fg-ga-01.specs.json](fg-ga-01.specs.json)（14 列）。以 `檔`、`id` 定目的地，`規格` 是完整機制底稿；`定位`、`掛點`、`差異與代價` 指導 etymology 的兩至三句潤飾；`安裝條件`、`示範載體`、`驗證情境` 定驗證裝法。英名、中文名均已定為提案，不另取名，不留占位。不得把計畫的等級、聲望、市場、廠商欄塞進 ComponentDef。

表內 10 件部件、2 能力、2 效果逐一產出，不能把能力或效果藏成未計數新檔。效果 contribs.source＝自己的 effect id；部件 attrMods.source＝自己的 component id。純輔助 ability.packets=[]，AP=3、cooldown=3、usesPerBattle=2；不新增 registry，也不借 gw 的傷害招。

所有內容保持 origin=mechanical；本批不產生古代或生物成品。`nameEn` 與 `etymology` 為現有合法欄；etymology 保留掛點、代價與「提案名」，不可宣稱新件早已進年表。掛甲只作用於 layersAdd 指定部位，不寫全機抗性；機動只改明列屬性，不宣稱飛行、位移、拖曳或移動成本下降。

## 範圍（排除法）

工作目錄 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-ga-01/`。只可新增本稿對應 manifest.files 的 14 個檔（content/base/components、abilities、effects 三類，檔名前綴 fa-），以及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-01/` 的 REPORT.md、review.json、naming.json、smoke.json 與原始紀錄。scratch 全放 `/tmp/cx-fg-ga-01/`。

不做：不改任何既有 id、數值或結構；不寫主 repo content，不改 src、test、schemas、registries、specs、design-notes、content/lore、world、市場、掉落、研究或其他軌；不重產索引、不 commit。worktree 不留名單之外的雜檔；manifest 最終記錄與索引／commit 由領導處理。

件數 gate：恰為 14 個內容檔，任何附帶檔也算；不增到第15檔。容量 gate：每個內容檔≤16 KB，REPORT≤12 KB；超出先精簡，仍超出即回報，不擴範圍。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查逐檔規格與索引、寫 review 與 naming，禁止整片倒入 context |
| `rg` | 查 id 撞名、registry、既有相近機制與風格禁詞 |
| `npm run check`、`npm run typecheck`、`npm test` | 在隔離 worktree 做固定驗收第2條；各跑一次，失敗只重跑受修正影響者 |
| `node` | scratch runner 載本 worktree 的 content；runBattle seeds 1–5、tryCommand 明列能力，輸出 smoke.json |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_gate.py` | 以領導填好的本批 manifest 查14檔範圍；不 carry |
| `bash /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_accept.sh` | 領導收件用，按 manifest.checks；工人不替領導建立基底 worktree |

## 實作與驗證安排

先查列明 id 不撞；逐檔讀同槽現有範本，照 specs 的完整規格產出，只潤飾 etymology。新名不另創勢力或事件。14 檔完成後一次跑第2條驗證；遇自己格式、指令或路徑錯誤自行修。

scratch runner 以既有 frame/bulwark-ii（bodyplan/mx-biped-c）為通常載體，指定特殊 part 的件使用表內示範載體及實際 bodyPlan；每件裝在相符槽，保留既有有核心駕駛與武器。以 monster/reaper-c 為通常敵方，輔助招另放友軍、敵人於射程內；反拘束在 scratch 用 applyEffect 預掛對應狀態，禁止改正式 frame/scenario。每個部件至少實裝一次，每個新能力各用一次；五 seed 可把不同配裝置於同場分組，無需每件各開五場。

先檢查 AI 使用本批兩個新能力的 AbilityUsed；若 AI 不使用，以人工 tryCommand 證實可用並記 AI 缺口，不可把人工結果冒充 AI。結果寫 smoke.json：scenario、seed、installed、abilityUses、aiUsed、exceptions、observed、log。同時依每列「驗證情境」核插層或屬性變化。不得用零傷害／零效果的出手充數；純支援不以單挑勝率作退件理由。

## 資源與禁區

可寫程式碼線（僅 JSON 內容；不准改引擎）。不碰鍵盤、滑鼠、螢幕，不開 GUI；不 push、不建分支、不 rebase／reset、不刪檔、不 rm -rf；不改 ~/.codex/config.toml、不裝依賴、不上網、不用 MCP。此處沿用 gear-common 的 MCP 禁令；headless runner 的原始紀錄替代 MCP，不偽造 mcp-auto。子代理上限 1，模型隨意；也須親讀 AGENTS.md、gear-common 與內容規則，受同一份檔案名單限制。

## 交付

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-01/REPORT.md`：已讀清單、四條驗收證據、數值帶外理由（若有）、需求與待決。白話審核表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-ga-01/review.json`，wf-table/1 的欄位為 檔／類別／名稱／白話／掛到，14列、每列白話≤60字；命名表 naming.json 保留英名與意涵。原始 smoke 證據一併放報告目錄；寫出實際值，不把計畫當結果。

## 驗收（固定 4 條，做完就停）

1. manifest 列的14個新內容檔齊、id不撞、mechanical且只用現有欄位與registry；content_gate 0違規，舊檔未改。
2. npm run check 末行 OK 0 errors、typecheck通過、npm test無新增失敗；黃金與營運fixture沒有本線修改，逐檔數值與命名照規格。
3. scratch runBattle seeds 1–5 零例外；10個部件實裝、2個能力各有效使用≥1次，屬性／池／插層／效果符合逐檔情境；AI未使用者如實列缺口，不擴修引擎。
4. REPORT已讀清單與上述證據、review.json 14列且白話≤60字、naming.json及smoke原始紀錄齊；回覆摘要與REPORT絕對路徑。

## 失敗與完成回報

自己寫錯自行修；只有點名工具本身故障且無可行替代才回 BLOCKED。機制不可表達或固定條件不符則回 FAILED 並列該條；不以新增內容／改引擎繞過。完成回覆 DONE、14檔、驗收結果與REPORT路徑即可；本稿不授權對外訊息或另派跨軌任務。

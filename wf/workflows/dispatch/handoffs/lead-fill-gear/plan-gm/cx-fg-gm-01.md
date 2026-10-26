# 任務：cx-fg-gm-01 — 公開舊廠非核心件14件

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/README.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/mechs.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/abilities-effects.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/numeric-bands.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/numeric-bands.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/engine-facts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/world-pillars.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/polish.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-rulings.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/data-model-abilities-effects.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/new-items.json`。親自讀；不要只靠本書摘要。REPORT 開頭列「已讀清單」，相對 repo 路徑逐項對應 manifest.report.mustRead。內容 workflow 的細則與所選範本也須親讀；以 gear-common 的只新增、禁 MCP 與本批固定四條驗收為此次邊界。

## 背景與唯一目標

依 gm 計畫寫本批 14 個新檔並微調中文。英文原名、掛點、交易代價均已定稿為提案，不新增世界史、血統或引擎欄位。領導先將 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/fg-gm-01.manifest.json` 複製至隔離 worktree 的 `content/batches/2026-10/fg-gm-01.json` 並把 base=TBD 換成實際起點；未完成不啟動。本批不依賴其他gm批的新檔。

## 逐檔規格

唯一逐檔規格是 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/new-items.json` 中 `批次=fg-gm-01` 的 14 列。欄位 payload 是各檔完整目標資料；id、檔、類型、中文名、nameEn、掛點、等級、關鍵數值帶、AI戰術鍵、聲望門檻、相容範例、代價均逐列給定。用 tabledb 的 find 取本批，不憑摘要補設計。manifest.files/ids 是這 14 列的完整檔名與識別字清單。

複製 payload 作起稿；只准潤飾 name/etymology 的中文語序、保留名稱意涵與提案標記，不改定位、數值、引用或欄位。新增件全部 mechanical；不是機甲核心、機魂或古代機本體。部件的等級／廠商／rep 是計畫與接線資料，ComponentDef 不認的欄位不要塞進檔內。ResearchDef 的 nameEn 留 naming.json，不加未知欄。

每件 etymology 留三件事：哪個廠或勢力做的、它讓人怎樣打、為何不能什麼都包。六家新廠名與新裝備名保持提案；正文不引用其他作品。所有 attrMods/contribs 的 source 必須等於本檔id。凡鐵部件與能力都須含 conventional-arms；精粹武器能力明填 essence。R4 的凡鐵級差差異只回報，不修規則。

layersAdd 只對相容範例指定的既有部位生效，不宣稱全骨架可用；runBattle scratch 配裝時替換一槽，維持其他槽，避免無池。poolMods 不創造缺失池。三件有限次武器的專用矢池不新增 stock 或補給ammo列；本批不改補給程式。

## 範圍（排除法）

只寫隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-gear/wt-fg-gm-01/` 中 manifest.files 的14個新內容檔、該manifest，以及 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gm-01/` 的報告資料。工作樹內不要留其他檔；scratch 用 `/tmp/cx-fg-gm-01/`。索引由領導統一更新。

不做：不改既有 content、六市場、world/services、actions、registries、frames/defaultLoadout、lore、src、test、specs、design-notes；不接別軌需求、不補新勢力、不改全局研究或聲望規則。市場與服務掛接只引用計畫提案，allow.modify=[]；禁止新建同地點市場替身以繞過既有檔禁令。

件數 gate：恰14內容新檔，少於14補齊、超過14退回本書14件；任何需要第15檔的機制改動改記需求。容量 gate：REPORT 超過12 KB精簡；超過20 KB停下回報，逐件表移wf-table/1資料檔。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查 new-items.json 的本批與既有索引，不整份讀 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_gate.py` | 依領導填好 base 的 manifest 限路徑與只新增 |
| `bash /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_accept.sh` | 按 manifest 的 check、typecheck、test、readlist 固定驗證鏈 |
| `node /home/lorkhan/repo/game_dev/mecha-srpg/src/ops/content/check.ts` | 第04批的 world/research 內容檢查 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py` | 僅在交接書有誤時由領導修稿，不增加工作範圍 |

## 資源與禁區

可寫程式碼線（僅內容資料）；主 repo 唯讀，僅上述worktree與報告目錄可寫。可派子代理上限1，同受所有規矩，做實質工作也要親讀AGENTS.md與內容wf。不得碰鍵鼠螢幕、不得開GUI、不上網、不用MCP、不裝依賴、不commit、不push、不建分支、不rebase/reset、不刪檔、不rm -rf、不改 ~/.codex/config.toml。領導管理worktree與提交。

自己打錯路徑或資料自行修正；點名工具壞掉才報BLOCKED。遇到原有測試失敗附基底證據，不擴改test、src或黃金；不得以改基準湊綠。

## 工作

親讀與確認起點後，依逐檔payload產出，再按固定驗收鏈跑一次並修本批錯誤。命名表、白話審核表用wf-table/1，白話每件≤60字。新件不需要全跑營運戰役、不加測試檔、不操作其他線。聲望與研究接線未好仍可交內容檔，正式上架由領導依requirements判斷。

## 交付

REPORT 絕對路徑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-gear/fg-gm-01/REPORT.md`。同目錄交 review.json（14列）、naming.json（14列）、smoke.json（實測相容配裝、5 seeds、能力使用計數／效果可見差異）、inserts.json（空表，明示未改既有檔）。manifest 完整列14檔、14id、gateRejections與驗證結果。回覆只要本批件數、四條結果與REPORT路徑。

## 驗收（固定 4 條，做完就停）

1. manifest恰14新檔、id/檔名與規格一致，content_gate 0越界；既有檔未改，無未知registry值。
2. manifest的content_accept驗證鏈通過；第04批另含ops內容檢查；不自行更換黃金或修基底失敗。
3. 每個新部件以本表相容機體在scratch替換配裝、5 seeds的runBattle零例外；新能力每條至少AI實用1次、效果有數值變化證據；研究只核既有／先入庫引用與解鎖旗標，不聲稱現有購買端已設門檻。不上網／不用MCP，留smoke.json。
4. REPORT含已讀清單、數量、接線未決與四條結果；review.json每件一列且白話≤60字，naming.json齊，沒有修改市場／服務／其他軌。

# 任務：依核准規劃產出第2輪六個places概念

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/WORKFLOWS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/team-model.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/content-batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`，content/工作流全部規矩與適用支柱子檔、`/mnt/c/code/mine/mecha-srpg/content/lore/README.md`、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`、style/people.md與本類範本。親讀主樹最新版。REPORT開頭逐行列已讀清單。

## 背景與唯一目標

領導審核astra計畫後，gpt-6.1-sol完整產出本類六件，不停在計畫。讀 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan.json` 的category=places、decision=adopt列，與 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan-review.json`。若領導尚未寫審核表，不自行開工。維持太空歌劇、群像與日常，不全用欠薪爭租或救人撤退。領導審核表requiredConstraints優先於計畫中的場景動作；不得六篇都犯錯→揭露→認錯改正，保留利益、不同反應與未解矛盾。

## 範圍

只寫 `/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wn-r2-places-1027/content/lore/places/wn-r2-*.json`，精確檔名須等於核准計畫targetFiles；另可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/places/REPORT.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/places/review.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/places/naming.json`。不做：主樹content、其他隔離區、manifest、index、年表、SESSION/CLAIMS、src/schema/spec、其他任何未列檔。不改舊內容、不刪檔。
件數 gate：6概念、最多20新內容檔；容量 gate：本批內容與報告最多1MB。超出即回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 讀主樹核准計畫與寫wf-table/1的review/naming，禁止全表dump |
| `wf/tools/content_gate.py` | 主樹工具配本worktree與manifest執行路徑閘門 |
| `git diff --check` | 本worktree空白檢查 |

## 資源與禁區

可寫程式碼線（只寫JSON內容與報告）。子代理上限0；原生工具回傳；領導+最多2個工作者。禁止網路、安裝、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定或掛載修改。不自行執行node，領導依序跑有限檢查。不得改.gitignore，不建分支、不rebase/reset、不改別人staged。自打錯指令或路徑自行修正。

## 工作

1. 用tabledb定向讀六列計畫、領導審核與每列範本；候選最相似既有全文再讀後創作。查重主樹最新版含wl-*；引用只用HEAD已有ID或本批配套，勿引用main未提交wl-*或其他類wn-*。
2. 寫六篇完整JSON，body每篇300–1500中文字，原生中文、具體行動與衝突，避免換名重複。人物不只職稱；地點要有獨有場景功能；勢力要有行動能力、與其他勢力不同的目標及外交。小勢力300–600字、有可引用信條及對傭兵補給，不強造專屬古代機／血統。不新增事件或年表。命名先英文原名與意涵再中文，aka保存英文並在naming表記意涵。
3. review每概念一列含id、files、category、name、plain（白話≤60字）、hooks、nearestExisting（具體ID及檔）、similarity、substantiveDifference、decision、reason、fullTextRead。對照行動、衝突、場景功能，不能只比名字。若概念仍重複先回報換概念，不偷改審核計畫。

## 交付

內容：`/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wn-r2-places-1027/content/lore/places/`。報告：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/places/REPORT.md`；表：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/places/review.json`及`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/places/naming.json`。manifest唯讀：`/mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wn-r2-places-1027.json`。REPORT四段已做／產出／未做與不足／需決定，明寫未完整驗收、整合平衡留家中。

## 驗收（固定3條）

1. 六個概念及計畫配套存在，Python檢查JSON可解析、id檔名相符、引用在HEAD或本批；檔數不超20且無改舊檔。
2. 主樹工具content_gate.py對本worktree與manifest回傳0；自己worktree git diff --check為0。不跑額外node或測試。
3. REPORT含manifest五份mustRead路徑，review恰6列且白話≤60字、逐列有全文閱讀來源與實質差異，naming表保留英文原名意涵。有限檢查不稱完整accepted。

## 完成／阻塞回報

原生工具回傳DONE/BLOCKED、產出件數及REPORT路徑。只真機制矛盾需留暫選可行內容；不要越界修引擎。不發inbox、不開子agent。

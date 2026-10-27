# 任務：產出六個人物內容概念

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/batch.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/` 的規矩文件（包括支柱子檔與本類原則）、`/mnt/c/code/mine/mecha-srpg/content/lore/README.md`、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`；規則讀主工作樹最新版，不讀隔離區的舊角色配置。REPORT 開頭列已讀清單。

## 背景與唯一目標

使用者要多 agent 填充世界，不是機制報告。照主工作樹 lead-world-life-1027/lore-plan.json 中 category=characters 的六列創作完整人物，不是只寫計畫。公司不安裝，整合驗收與平衡試玩明確延到家裡。

## 範圍

只寫 `/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-characters-1027` 內 manifest allow 指定類別、wl- 前綴的新檔；精確檔名以 lore-plan.json 為準。不修改任何既有內容檔。另可寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-life-1027/characters/REPORT.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-life-1027/characters/review.json`；review 為 wf-table/1，每概念一列，含目標檔、類別、名稱、60字內白話與既有掛接。

不做：主工作樹的 content、src、schema、spec、索引、manifest、其他線報告、任何未列路徑；不改引擎、不新造 registry／能力詞彙。不得只改名字複製一模一樣的內容。

件數 gate：六個概念、內容檔最多20件；容量 gate：新內容與報告合計最多1MB。任一超出就回報，不擴範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 透過 Python load 查主工作樹 lore-plan.json 的本類六列、查其他資料表與寫 review；禁止整份大表印入context |
| `wf/tools/content_gate.py` | 從主工作樹跑本批路徑閘門，worktree與manifest用下列絕對路徑 |
| `git diff --check` | 在自己的隔離worktree檢查空白錯誤 |

## 資源與禁區

可寫程式碼線（本線只寫 JSON 內容與報告，不寫程式碼）。不碰鍵鼠螢幕、不開GUI、不安裝、不上網、不npm、不測試、不sim、不MCP、不重錄golden、不commit/push、不建分支、不rebase/reset、不刪檔、不改codex設定。不改 .gitignore。全機最多一個重負載；本線不啟動重負載。這輪子代理上限0，主線用三個工人輪替；如需子代理回報調度者，不自行增加並行數。

## 工作

1. 讀規矩、六列計畫與每列範本，核對既有id與同名；若計畫與原文矛盾採現有契約並在REPORT說明。
2. 完成六個概念的JSON。數值沿用同級範本、用途與配裝具差異；lore每篇300–1500中文字、具體行動、避免說教與翻譯腔。新件只引用已存在資料或本批配套，不新增跨批引用。
3. 做下列三項檢查並寫REPORT與白話review。不要自開更多驗證。

## 交付

REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-life-1027/characters/REPORT.md`，開頭逐行列已讀清單，四段做了什麼／產出／未做與證據不足／需要決定；明寫整合與平衡未驗。
白話審閱：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-life-1027/characters/review.json`。
內容：`/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-characters-1027/content/` 下本批允許檔。
批次契約唯讀：`/mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wl-characters-1027.json`。

## 驗收（固定3條）

1. 本類六個概念與所有計畫明列配套檔存在、JSON可解析、id檔名相符，新增檔數不超20；以Python標準庫檢查。
2. 主工作樹工具 `python3 -I /mnt/c/code/mine/mecha-srpg/wf/tools/content_gate.py /mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-characters-1027 /mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wl-characters-1027.json` 回傳0，自己的worktree `git diff --check`回傳0。
3. REPORT及review存在；review恰六列、每列白話非空且不超60字，REPORT包含mustRead五份路徑與未做整合驗收的說明。

## 完成／阻塞回報

原生子agent直接工具回傳完成/阻塞、檔案與簡短摘要，不寄inbox。不能寫錯目錄後把它當環境問題；自行修正指令路徑。真有機制缺口只記錄，不越界修引擎。不得稱整批已accepted或驗收全部完成。

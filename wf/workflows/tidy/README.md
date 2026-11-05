# tidy — 文件結構整理（刪掉過時、分類雜亂、抽資料檔）

[WORKFLOWS](../../WORKFLOWS.md)｜[INDEX](../../INDEX.md)

把文件層收乾淨：活文件只留現役與 open 的東西，過時的直接刪（git 歷史即封存）、雜亂的分類、指向被刪檔的連結改純文字、過大的條列抽成資料檔。方法本身在 [STRUCTURE](../../STRUCTURE.md)（膨脹即拆／雜亂即分類／過時就刪／資料檔慣例）；本檔記的是**整理這件事怎麼跑一輪**：盤點 → 交接書 → 派工 → 核驗。

**何時用**：「幫我整理 X」；一個資料夾幾十個檔扁平混放；某份表格被歷史項塞到幾十 KB；log／inbox／證據堆了一堆沒消化；文件自述「歷史」「已被取代」卻還被活文件連著。
**何時不用**：改程式碼結構（行為不變的搬檔／拆模組）→ refactor 工作流；只搬一兩個檔且不涉及刪檔或拆表 → 直接 `git mv`，不必走本流程；只是骨架版本升級（沒有刪檔或拆表）→ 不走本流程，照上游變動記錄手動套。

## 四條原則

條文在 [STRUCTURE](../../STRUCTURE.md)（過時就刪、觸發 B、觸發 A-5、觸發 A-4），本檔不重述，只記整理時實際要用的判準與掃描法：

<!-- wf-nav -->
1. **過時的就刪（git 歷史即封存），連結改純文字**——「過時」的判準：文件自述歷史／被取代／前提作廢；文件描述的目標（計畫、批次、環境配置）已不存在；結論已整份被某現役文件吸收。
2. **一個資料夾別擠太多檔**，同類檔案放鬆。
3. **小檔（<1 KB）太多就合併**。找法：`find <dir> -type f -size -1024c | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn`。
4. **給人點的留 md、給 AI 讀的進資料檔**；整檔 > 8 KB 另按語意拆資料夾，兩個門檻各自獨立觸發。格式契約與 A／B 兩種拆法在 [common/data-files.md](../common/data-files.md)。掃描：`tools/find_big_lists.py`、`find … -size +8192c`。

## Done when

- 目標資料夾根層只剩入口 README ＋ 語意子資料夾（或同類檔案集合），每個子資料夾有 `README.md`。
- 每個被刪檔：`grep -rn --include='*.md' '](.*<檔名>' <repo>` → 0 行（活文件不再連它）；刪檔 commit 訊息寫明取代者或原因。
- `tools/wf-lint.sh --strict .` → `TOTAL broken=0 residue=0 oversize=0 biglist=0`（`biglist` 只算同質記錄表；連結表超標印 `BIGLIST-LINKS`，只 warning 不計入；在地 hook 的 `STALE`（handoffs 頂層 14 天沒 commit）與 `HEAVY`（wf/ 單檔 > 512 KB 或線附件夾 > 1 MB）同樣只是 warning）。
- `find <repo> -path ./node_modules -prune -o -name '*.md' -size +8192c -print | wc -l` → 0。
- 報告附 `moves.tsv`（`舊路徑<TAB>新路徑`）。
- 子資料夾 `README.md` ≤ 300 行、入口 `README.md` ≤ 100 行；名冊／登記表 ≤ 8192 bytes，只列現役。

**長度上限**：`SESSION-LOG.md`、`WAIT_USER.md` 各 ≤ 4096 bytes 且只列 open；`decisions.md`＋`decisions/` 合計 ≤ 16 KB（被推翻或已落實進 spec 的決定刪掉）；`common/gotchas.md`、`tidy/gotchas.md`、`dispatch/lessons*.md` 每檔 ≤ 4096 bytes（滿了淘汰最舊、已被工具或規則吸收的條目，不拆新檔）；`engine-backlog.json`、`codex-batches.json` 只放未完成列；`notes/` 不寫收工流水。

## 流程

角色分工：**調度者**只盤點、寫交接書、核驗、修跨資料夾／跨 repo 的連結；**實作線**（一個或多個工人）分類、切批、逐批驗收。線**不得**進交接書範圍以外的資料夾或 repo。線可以再分一層：一個範圍一條**管理線**，管理線再派**工人**（簡報範本 [manager-brief.md](manager-brief.md)）。

1. **盤點（調度者）**：
   ```bash
   find . -path ./.git -prune -o -type f -print | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head   # 哪個資料夾擠
   find <dir> -maxdepth 1 -type f -printf '%s %f\n' | sort -rn | head                                    # 哪個檔肥
   find <dir> -type f -size -1024c | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn                       # 哪個資料夾小檔太多
   python3 tools/find_big_lists.py --min 1024 <dir>                                                       # 哪個表／清單超標（含 links=N / linked= 判斷是不是連結表）
   git log --since=<兩週前日期> --oneline -- <檔>                                                          # 哪個檔沒人動（刪除候選）
   grep -rlE --include='*.md' '<dir>/' <其他資料夾…> | wc -l                                                # 入站連結量：誰在依賴這個資料夾
   python3 tools/find_big_lists.py --links-only <dir>                                                      # 哪個連結表 > 10 條，要人判斷該留 md 還是抽資料檔
   ```
   把病灶寫成編號清單，直接放進交接書；不要讓線自己找範圍。
<!-- wf-nav -->
2. **交接書**固定寫：分類方案（類別數 5–7，一張表列每類收什麼）、**檔名一律不改**（外部連結靠檔名對映修）、一律 `git mv`、每個子資料夾要 README、過時就刪與四條原則、禁區（不 commit／不進交接書以外的範圍／不刪／不碰 kernel 檔與 `AGENTS.md` 實質內容）、**固定條數**的驗收命令、報告要附 `moves.tsv`。
3. **線跑**：按檔案性質選 A／B 拆法（見 [common/data-files.md](../common/data-files.md)：A 法把同質大表抽成資料檔並在 md 端留摘要、對帳列數；B 法把過長散文按語意拆進同名資料夾，原路徑保留當入口）；共通：一律 `git mv`／新檔 `git add`，不留副本，不改內容實質，不重新判定任何狀態。多批可平行，因為各批只動自己範圍內的檔案。
4. **核驗（調度者）**：不信報告，自己跑一次 Done when 的命令；看 `git diff --cached --name-status -M` 確認搬檔是 R（rename）不是 D+A；`AGENTS.md` 若被動到，只准是連結路徑那種修改。
5. **搬檔後修連結**：用各批的 `moves.tsv` 跑 `tools/fix_moved_links.py`（先 dry-run 再 `--apply`；它跳過 code fence、解析相對路徑後重算）。**指向被刪檔的連結不重寫**——照第 1 條原則改純文字＋commit hash。跨資料夾／跨 repo 的壞連結留給調度者收尾。
6. **收尾**：確認 Done when 全過，commit 由使用者或調度者決定。

## slim-1105（2026-11-05 全 repo 瘦身）結論

tracked 檔 7429 → 約 4320、83.1 → 約 20 MB（`.git` 不縮）。刪：封存（handoffs `done/`、inbox archive／done、`wf/archive/`）、只增紀錄（舊線證據、收工流水、backlog 已完成列）、10/26–10/29 舊線文件、`legacy/`、美術證據圖、10/28 審閱大 json。plan／talk 七份先核對已被 design-notes 吸收，未吸收的萬潮葬王副線併成 `design-notes/world/wanchao.md`、基調教訓併進 content polish。保留：`specs/*-1029.md` 與 `plans/*-1029.md`（core README 仍以它們為 10/29 戰鬥增補契約，待併進 core 規則子檔）。規矩改成「git 歷史即封存」（STRUCTURE「過時就刪」、dispatch 收線、handoffs 報告保留期、本檔長度上限、wf-lint STALE／HEAVY）。未做：F 類程式碼拆檔（18 檔 > 300 行，排在試玩修正線合併後、照 refactor 先跑測試基準）；`decisions.md`＋`decisions/` 約 20 KB 仍超 16 KB 上限，要逐筆判斷哪些已落實進 spec。計畫原文見刪除它的 commit 的父 commit。

## 踩過的坑

整理與拆檔實際踩過的坑集中在 [gotchas.md](gotchas.md)；動手前先讀一遍。

## 交接

- 完成後 → 若整理揭露了要裁示的事，[WAIT_USER](../../WAIT_USER.md) 一行；為什麼這樣分類 → [decisions](../decisions.md)。

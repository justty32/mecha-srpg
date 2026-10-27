# 任務：整理今日SVG美術交接與收工接續入口

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/STRUCTURE.md、wf/workflows/common/user.md、wf/workflows/common/data-files.md、wf/workflows/tidy/README.md、wf/workflows/tidy/gotchas.md、wf/workflows/dispatch/README.md。親讀規矩，不靠摘要。

## 背景與唯一目標

使用者今天收工，要求按照wf整理並push。原世界觀七輪已整理，本次收尾聚焦兩批SVG美術與機甲百層，不再創作或改程式。HEAD 04bf2dd已push；2863782是首批美術，f78e708記今日push授權，04bf2dd機甲百層/奢華特效。全工已關、工作樹原本乾淨。主線最後核驗commit/push。

## 病灶與分類

病灶：STATE/next-session仍停c9ce4e8與純lore，缺今日美術/框架；兩報告資料夾混9+2子brief與證據，兩母brief散在handoffs根；入口仍寫未commit/push及活狀態，容易誤當未完成；公司網路/安裝偏好新舊語句分散；下次看圖與回家UI驗證沒有集中入口。

六類按用途：1活接續(STATE/next-session/SESSION/WAIT_USER)，2可用美術與框架(art，留原路徑)，3已執行交接書(各報告下briefs/)，4報告與目前契約(報告根原路徑)，5可執行驗證程式/資料(留原路徑)，6圖像證據(留原路徑，不破外部聊天連結)。不是為檔數硬拆；此次只搬13份brief，其他執行程式/素材/PNG/JSON全部不搬不改。

## 範圍

可寫：wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/workflows/common/user.md、wf/workflows/dispatch/CLAIMS.md、wf/workflows/dispatch/handoffs/{README,STATE,next-session}.md；wf/workflows/dispatch/handoffs/svg-art-1027.md與mech-layers-1027.md及兩同名資料夾內Markdown（僅導航/必要連結/標歷史快照，不改實質證據）；art/README.md、art/svg-study-1027/README.md（僅導航/必要連結）；新wf/notes/art-review-2026-10-27/README.md接續入口；本線tidy-art-close-1027.md及tidy-art-close-1027/報告。

搬檔：svg-art-1027.md與該報告內battle-env.md/city.md/direction.md/effects.md/mech.md/portraits.md/scene.md/tiles.md/variants.md共10份進svg-art-1027/briefs/；mech-layers-1027.md與該報告內art.md/code.md共3份進mech-layers-1027/briefs/。一律git mv，檔名不改；新briefs/README導航。這些是執行契約且整體美術仍待用戶評閱，不冒稱遊戲整合完成、不強移done。contract.md仍是目前機甲API契約不移。歷史REPORT原狀態標快照，當前README/STATUS/STATE要明確無活躍工人與已提交；reports歷史指令/JSON hash快照保留。

修連結：fix_moved_links.py先dry-run後限定Markdown apply；已知完整全repo dry-run可能遇非dict wf-table TypeError，若再遇可用工具模組限定本次可寫Markdown，不改工具、不全局apply。主線負責必要範圍外入鏈，你先回報，不自行擴張。

接續入口需清楚：展示art/svg-study-1027/index.html不變，可自行開file；兩人物日漫/紙娃娃、三風格機甲與城市、城市六層、修塢/地格/特效；機甲9大28中、142/140/140有效葉，語意4/實際SVG5、JS/CSS啟動暫停還原。靜態PNG/Node通過不等於真瀏覽器動畫/布局鍵盤驗收；headless缺lib，公司未裝未下載無GUI，之後有需要套件使用者允許但下載前先告知。美術astra、一般sol、雜活terra；今日可直接push。不要請使用者當場驗收，他說今天先這樣，記待辦即可。

不做：不得改美術、程式或遊戲內容。保留七輪世界觀draft待家驗、P01/Fable裁決與四舊暫停線；不刪worktrees、舊檔或.git內本機logs。不要改src/content/legacy/spec/tools/AGENTS或任何非Markdown美術與程式；不重跑遊戲測試/渲染、不新增美術、不改manifest或層數。
件數 gate：最多80個文件；容量 gate：新增文字最多500KB。任一超過停下回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| wf/tools/tabledb.py | 定向讀資料表（有需要才用） |
| wf/tools/brief_lint.py | 本brief strict |
| wf/tools/fix_moved_links.py | 搬檔Markdown連結dry-run/apply |
| wf/tools/wf-lint.sh | 最後一次strict，如實報legacy基線 |
| git diff --check | 暫存與工作樹空白 |

## 資源與禁區

可寫程式碼線（僅文件）：普通整理sol工，子代理上限0，直接寫共享工作區。不commit/push（主線做）、不刪檔、不裝下載、不上網、不GUI/鍵鼠桌面、不npm/整合測試、不改設定、不改遊戲。只加明列路徑，禁git add -A/目錄級add。不能以關閉今日工人為由收掉四舊暫停線。只讀原報告相關段，不重讀大logs。

## 交付

REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/tidy-art-close-1027/REPORT.md`，附moves.tsv、驗證摘要、保留例外與改檔清單。新子目錄要README。完工移除SESSION與CLAIMS本線臨時記錄；不宣稱已commit/push。回覆短摘要與REPORT路徑。

## 驗收（固定3條）

1. 13brief歸位且moves逐一對應，檔名不改，git可辨識rename；新README與必要入鏈正確；PNG/SVG/JS/Python/JSON及其他遊戲檔均無修改/搬移，展示路徑不變。
2. STATE/next-session與今日04bf2dd成果及未驗限制一致，SESSION只列真正open且≤4096bytes，待用戶入口完整保留P01/Fable/七輪及四舊線；公司網路/模型/5層/紙娃娃偏好無新矛盾。
3. git diff --check及cached無錯；wf strict無新增錯（既有legacy broken2，不修legacy，不說全綠）；REPORT/moves完整，所有新導航入口≤100行、子README≤300行。

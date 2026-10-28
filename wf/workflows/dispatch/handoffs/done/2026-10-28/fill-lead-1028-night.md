# 任務：持續整合今晚的新內容批次

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/common/user/working.md`、`wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/content-batch.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/testing.md`，及各批適用 content 規矩；必須親自讀。

## 背景與唯一目標

使用者授權持續填充到 2026-10-28 23:00 Asia/Taipei，整理收尾並 push。隊伍數不限，實質工作先讀 wf，可再派 agent，普通 sol、雜活 terra、美術創意 astra。你是 sol 領導，將主線核可的 astra 計畫交工人實作、查重與驗收，依本輪時間收件。以品質與可查證交付優先，不為湊數接受重複。

## 範圍

只做：主線交付的 `fill-plan-1028-next/` 計畫與後續明確核可批次；每批白名單必須在 manifest/brief 凍結。
可寫：本線 `wf/workflows/dispatch/handoffs/fill-lead-1028-night/`；本線生成的 `content/batches/2026-10/night-*.json`；依 manifest 新增 `content/lore/{places,characters,events}/night-*.json`；接受後重產 `content/index/`。如計畫ID非night前綴，請在派工前轉成night並同步引用與review；不得悄悄擴大白名單。
不做：既有內容修改、timeline插入、舊批次接受判定、舊線收尾、src/schemas/specs/art/依賴修改、黃金重錄、全套驗證、主線SESSION/CLAIMS/使用者偏好。不能把舊draft改accepted。
件數 gate：單批最多8個內容JSON，本線最多12批／96個新JSON；容量 gate：每內容檔16KB，本線交付總共20MB；超過任一先回報。驗收失敗最多退修2輪。

## 必用工具

| 工具 | 用途 |
|---|---|
| `git worktree add --detach` | 每批隔離，暫存放 本線暫存目錄，此處為本任務允許 |
| `python3 wf/tools/tabledb.py` | 大型資料有界查詢 |
| `python3 wf/tools/brief_lint.py --strict` | 派工前逐份檢查（實際參數依help） |
| `python3 -I wf/tools/content_gate.py` | 路徑／欄位護欄與通過後carry |
| `bash wf/tools/content_accept.sh` | 使用manifest指定檢查並保留真實結果 |
| `npm run content:index` | 接受後依staged來源重建索引 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件驗收 |

## 資源與禁區

**可寫程式碼線**：只寫明列路徑；工人只寫隔離worktree白名單與各自報告。
子代理上限3個並行（跨本次主線所有工人最多3，若astra正規劃則你最多同時2工人，收到主線釋放後可3）；可再派子agent模型不限，但後代亦計入此並行預算。你不親自寫全部內容，交sol工人；純檢查terra，創意設計交astra。
不開GUI、不碰鍵鼠螢幕、不下載、不改全域設定、不刪任何檔或worktree；保留隔離目錄供收尾。不得stash/reset/rebase，不建分支。main只由你在主線授予git寫入權後commit明列路徑，禁git add -A。push由主線統一進行。其他線尚在git am時不得commit。
不跑完整npm test、test:dom/e2e、sim/fuzz/probe；本線限純lore，無戰鬥內容不需要probe/playtest。完整suite由主線另行統一安排。任何重負載先向主線請求時段。

## 工作

1. 讀主線核可PLAN/review，建立單類別manifest與每批brief、隔離worktree；check base / 同名碰撞、gameRefs及lore引用確實存在。派工前brief_lint必須0。
2. 工人讀content適用規矩及風格後，從現有內容查重再寫，REPORT首段完整已讀清單，交naming/review與可追溯去重證據；每概念有具體行動/後果，避免重複模板。
3. 收到先全文審內容與近似候選，語義查重不只名字。對照規矩退回矛盾與低品質稿；用content_gate驗路徑、mode與容量。只有真實可驗證合格檔才carry。
4. 純lore manifest checks明列 lore/readlist（必要check/typecheck主線整合時統一補），playtest.required=0並寫理由：不涉及戰鬥規則與單位。技術局部驗證與全遊戲整合狀態分開；不能只有局部通過就宣稱整合accepted。先維持draft，acceptance記局部結果與待整合。每輪全體驗一次lore check與相關wiki單檔測試；不重跑無關項。
5. 每完成一輪工具回報新件數、退修、路徑、未驗項與下一輪需求；主線供應新astra計畫前不自行發明擴張。稿完成後依main寫入權明列add→index→commit；不夾帶其他人的未追蹤文件。
6. 22:40後不開新批，22:50前停止產出收件，只做局部驗證與報告；23:00前主線要完成整理push。到點未驗收稿保留隔離樹、記draft/blocked，不硬帶回。不得用終局回覆代替監看尚活agent。

## 交付

直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-lead-1028-night/REPORT.md`；自己的 briefs/、reports/、review.json、state.md 全在此目錄。用wf-table/1記錄大於1KB同質清單；主線要接續時可從state找到每條線、worktree、目前階段及下一步。原生工具回傳，無須inbox。

## 驗收（固定4條）

1. 每批manifest/brief/REPORT存在，含白名單、容量與已讀清單，brief_lint exit0。
2. 每批內容gate與lore/readlist結果有原始證據；全文去重結果與退修記錄存在；未跑全套不能寫全綠。
3. 每個commit只含本線明列路徑與重建索引，既有內容與黃金不變；REPORT記件數/commit/來源/未驗項。
4. 終局所有本線子agent已回傳或停止，state與REPORT可接續；未完成稿保留、未偽裝accepted。


## 行政收線證據（2026-10-28，領導終局）

主線確認領導 Pasteur 已 DONE 並 close，三內容工人已 DONE／close，並明確授權本 brief 搬移。原位[REPORT](../../fill-lead-1028-night/REPORT.md)與[工人終局證據](../../fill-lead-1028-night/worker-terminal-evidence.json)保留；附件／reportDir、readlist及hash均不搬不改。相關提交：`013701c0；R2 ff949a2f698351ec762d0b92fc02b34784ea372a；收尾4a139221`。R2及收尾commit已唯讀核存在，主線正push，未據此宣稱push完成。

創作與收件完成，驗證及最後行政仍進行：固定suite在3a20a436執行中，R2 wiki尚未跑、待suite後另GO；manifest仍draft／integration pending。verify-night brief不搬。原始brief SHA256：`a0a7c0630c11eebc9560ae072450de73001672d75be7949dbe013202138ed4de`；上方原文逐位元保留。

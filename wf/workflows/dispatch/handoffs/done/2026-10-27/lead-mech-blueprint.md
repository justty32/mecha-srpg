# 任務：交付先配置骨架與空間再逐件繪製的完整機甲原型

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，親自讀 `wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/dev-env.md`、`wf/workflows/testing.md`、`wf/workflows/resources.md`、`wf/workflows/common/data-files.md`。

## 背景與唯一目標

使用者要求重做機甲：程式先自上到下決定頭身手腳、中層、下層的尺寸、位置與占用形狀，再逐件獨立產生 SVG、組裝。禁止先生成整台再任意拆分或填方框。參考圖 `/tmp/codex-clipboard-8Uo05b.png` 必須親看；白色包覆分片裝甲、藍色尖長裝甲、暗色內骨架、關節間隙與遮擋是參考重點。使用者補充：未來要操控動作，可能接 Spine 類工具，因此骨架／插槽／局部幾何／支點／接點／畫序從現在分開。

規劃 agent 正在寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md` 與 `CONTRACT.md`。在頂層通知契約就緒前只讀規矩、查可用環境、備好本線工作紀錄；不畫零件、不定另一套 schema。就緒後照規劃開工並完成交付，若不可執行提出具體衝突，不自行降格為方框示意。

## 範圍（排除法寫死）

- 新原型僅 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/`，先一台完整、單一風格；包含配置程式、配置產物、獨立 SVG 零件、組裝程式、檢視與關節演示、針對性驗證及證據。
- 導流只可改既有 `art/svg-study-1027/README.md`、`index.template.html`、`index.html`，新增清楚的重做版連結，不改其人物、城市或舊機甲內容。
- 可更新 `wf/workflows/common/user.md` 記錄使用者此次機甲製作／骨架要求與家中情境；`wf/workflows/common/code-map.md` 補新原型導航。
- 本線管理文件僅 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mech-blueprint/`。領導可在此寫子 brief、REPORT、狀態及契約副指標；子工不得改整合文件。主線管理 SESSION-LOG、CLAIMS、規劃交接書。
- 不刪舊檔、不改 `src/`／遊戲 spec／內容／依賴／lockfile、不安裝 Spine、不做 Spine 匯出器、不處理其他 inbox／世界觀暫停線、不動既有未追蹤檔。
- 件數 gate：新改檔合計最多 150 檔；容量 gate：新增產物最多 15 MB。任一超過先回報頂層，不偷偷縮水也不擴張範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| 原生 agent 工具 | 派工、收回傳、等待與監看 |
| `view_image` | 參考圖及新原型渲染驗視 |
| `python3 wf/tools/brief_lint.py` | 子 brief --strict 自查 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件驗收 |
| `node --test` | 只跑新原型定向測試 |
| 本機既有 headless 渲染工具 | 生成靜態與動作證據，不開 GUI |
| `git log --oneline`、`git status --short` | 收件與提交範圍核對 |

## 資源與禁區

- **可寫程式碼線**：只寫上列範圍，實作由工人執行，領導負責整合、驗收、報告。
- 領導 gpt-6.1-sol；美術與空間造型設計派 gpt-6-astra，程式工可 sol，簡單檢查可 terra。子代理上限 3 個同時執行；可以再派子 agent，整個團隊平行工人合計最多 3。先讓配置程式輸出真正零件約束後，美術才逐件畫；不能同時編兩份不一致的配置。
- 每個實質 agent 先親讀 AGENTS.md 及適用 wf 規矩，不只靠摘要；簡單雜活例外。
- 全機最多一個重負載，開跑前依 user.md 查現況，用 nice -n 19；不要跑全專案 npm test／sim／fuzz，這次是獨立美術原型。定向測試與 headless 驗證由領導排程。
- 不碰桌面鍵鼠螢幕、不開 GUI／headful、不刪檔、不動 repo 外檔（工具正常暫存除外）、不改全域設定、不建分支、不 reset/rebase。任何下載前先向頂層報項目／來源／用途，由頂層先告知使用者；本輪優先本機工具。
- 使用者已允許 commit 與 push；工人先不要 commit，領導只提交明列的本線檔案、禁止 git add -A／目錄級 add，不夾帶他線或主線改動。收尾可一般 push，不 force push。

## 工作

1. 讀規矩與參考圖、確認本機工具；收到規劃就緒後讀 PLAN／CONTRACT，寫子 brief、驗 brief lint、按互斥寫集派工。
2. 先程式算完整機體的各級局部位置、形狀包絡、骨架與插槽，輸出可視化配置及逐件工作單；再派 astra 逐件畫獨立 SVG。頭身手腳和中細層需真實機構意義，不以螺絲灌層數。
3. 組裝完整原型：配置圖／單件零件／組裝成品檢視，關節支點與接點可視化，抬臂／屈肘／屈膝可操作或播放。局部變換傳遞、畫序與骨架樹分離、使用相同來源重建；最多五層視覺 SVG 不破壞骨架鏈。
4. 驗證具體失敗案例能擋下（壞 parent、循環、接點錯位、越界或重疊例外、缺件等，按契約選最有用案例）、固定配置重建一致；headless 實際操作並檢視關鍵姿態 PNG，視覺有接縫／漂浮／離體就修到交付。
5. 更新 README 使用方法、參考與製作流程、已驗與未驗項目，導流舊入口、同步 user/code map；提交本線結果後一般 push，寫 REPORT，回傳可打開入口及驗證證據。

## 交付

- `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/index.html`：本機展示入口，優先 file 可開；若需伺服器須明寫指令並實驗。
- `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/README.md`：製作與重建方法、幾何／骨架邊界、驗證與限制。
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mech-blueprint/REPORT.md`：做了什麼／產出／不足／待決、精確測試結果、commit 與 push 證據、以後交接書該點名工具。
- 其他原型檔依規劃限定於上述寫集。

## 驗收（固定 6 條）

1. 配置可由程式重建，完整頭身手腳及中／細部件皆有可追溯配置；有配置圖與逐件工作單，SVG 來源為獨立零件而非從完整圖拆分。
2. 每個零件有局部座標、接點／插槽、骨架歸屬與畫序；骨架、顯示樹與畫序分離，定向測試有實際反例；Spine 相容性不冒稱已驗。
3. 完整成品與單件檢視可用，能看到參考圖所要求的包覆分片裝甲、內骨架、關節間隙與不同輪廓，不能只是區塊拼圖。
4. 抬臂、屈肘、屈膝演示與還原可用；headless 或離線渲染有綁定姿態與動作姿態證據，agent 親看修正；真實使用者畫風認可另待使用者。
5. 新原型定向驗證及 wf-lint --strict 通過；只跑與此次變更相稱檢查，有既存失敗則區分並報告，不亂改他線。
6. README、code map、偏好一致，精確範圍提交並 push、REPORT 記證據，沒有本線未收工子 agent 或背景行程。

## 完成回報

原生工具回傳 DONE／BLOCKED，附 5 行判斷摘要、入口／REPORT 絕對路徑。等子工用工具等待，不能以結束回合代替；每個實質里程碑向頂層報告。若工具環境卡住先回報可用替代方案，不以舊證據充新驗收。

## 完成證據

六條驗收及詳細證據見同目錄 REPORT：64 獨立 SVG、18 骨、7 姿態；核心 12/12、headless 操作 20/20、3048 次承力接合取樣、strict TypeScript 與 wf-lint 通過；來源與生成檔重建 hash 一致。畫風與手感待使用者評閱，未接 Spine 或遊戲。實作 `6cc5a1b2`、報告補證 `8c791d4f` 均已推送；四工人完成、無背景行程。原生 agent 回傳完成，無 inbox 終局信。

# 已讀清單

以下路徑均親自讀過；相對路徑以主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 為準。既有檔讀隔離 worktree 同版，規劃表讀主 repo 並以本批條件查詢。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`
- `AGENTS.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/people.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/pools.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/batch-files.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/review-draft.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/cx-fp-south-02.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

三個範本目錄內全部既有檔均親讀：4 池、13 背景、38 person（共 55 檔）。people／pools／batch-files 用指定工具依 batch=fp-south-02 查得 9／4／31 列；review-draft 依本批核定路徑取 31 列。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、world-pillars、data-files、package.json、引用的地方與事件，以及 employment 的預設職類實作。

# 結果與產出

**DONE — cx-fp-south-02。** 隔離 worktree 的起點與 manifest.base 均為 `27e6ea2f3481a4df855b19bfbf2760a65433fbf1`。完成 9 人各 background＋person＋character，以及 4 個新池，恰好 31 個核定 content 新檔；既有檔變更 0。

完整逐檔審查見 [review-rows.json](review-rows.json)，九人逐一的地方、勢力、事件、主線／崩年底色、年齡及暫值範本見 [people-evidence.json](people-evidence.json)。敘事依核定三段要點展寫，保留原招牌話；每篇 344–362 字、三段，均為 public 見證。新池只引用同批背景，野地人物在短停船上求工。蘇莉雅是本批唯一指定老手（39 歲／16 年），其餘人不補年資。

數值逐字採 people.json 的 personSpec／backgroundSpec，沒有自行平衡。技師與醫護 attrs、pools、growth 沿 hana-sato，普通駕駛與砲手沿 adewale-balogun，年輕人沿 mitali-das，老手沿 irina-sokolova；背景費率與範圍來源逐人列在人物證據表。招募時 attrRanges 會覆寫列出的 attrs，紙面 attrs 不是固定抽樣結果。背景 traits 空，指定既有 effect 只放 person。

# 固定驗收（恰好四條）

1. **PASS：範圍與引用。** git 可見本批 content 新增恰好 31 檔（9＋9＋9＋4），與 batch-files 及 manifest.files 完全相同；`git diff HEAD --name-only` 為空。開場已有的 node_modules symlink 保留。新增合計 33,191 bytes，最大單檔 1,700 bytes，低於既定容量 gate。人物 places／faction／events、背景 person、池 sources 與 base place 均存在；沒有跨批新檔依賴。逐檔清單與 git 狀態存於 [acceptance.json](acceptance.json) 第 1 條。
2. **PASS：指定檢查。** `npm run check` exit 0：core **0 errors／32 warnings**，ops **0 errors／10 warnings**；全部警告指向未變更的既有內容，本批 base 新警告 0。`node content/lore/check.ts` exit 0：**0 errors／9 warnings**，九篇人物各一條 `未登記欄位 places`，按共同規格保留。`npm run typecheck` exit 0。**npm test＝領導跑**：依使用者及 fp-rulings 的資源禁令，本線未跑全套、e2e、sim、fuzz，亦未跑 probe／MCP 試玩或重錄黃金。本線沒有全套測試結果或黃金差異結論，不預先宣稱豁免。各命令原始 log 位於 `/tmp/cx-fp-south-02/`，完整警告與數字存於 acceptance 第 2 條。
3. **PASS：審查表與人物契約。** review-rows 採 wf-table/1，恰好 **31 列**，白話最長 **39 字**（≤60），新名稱均標「（提案）」；[inserts.json](inserts.json) 為合法空表，欄位依規定。9 人 personSpec／backgroundSpec 全欄相等，born＝2108−age，僅蘇莉雅含 activeYears=16。寫入前以 grep 核主 repo content、worktree content 及其他五區 names-claimed，本批姓名與背景名 0 撞名；新池 id 亦 0 撞名，產出 id 唯一。敘事無禁題、AI 或新 effect；所有 traits 指向既有 effects。證據存於 acceptance 第 3 條、人物證據表及 `/tmp/cx-fp-south-02/name-grep-evidence.txt`。
4. **PASS：交付與限制。** 本報告開頭列完指定已讀路徑，前三條證據齊全；船員與 places 限制列於下段。最後訊息用 5 行交代 DONE、件數、檢查、表格與 REPORT 路徑。未追加驗收項目。

# 未做到、需要決定與引擎缺口

本批內容沒有待決敘事衝突。全套測試及新池引起的營運亂數／黃金差異由領導收件後處理，這是追加裁示指定的責任邊界，本線沒有提供全套通過證據。

**船員職類／禁駕尚無機制保證。** technician、medic、gunner 等 tags 表達主題，沒有新增職業加成、職類篩選或禁駕效果。`src/ops/crew/recruit.ts` 的 cmdHire 呼叫 employment，`shared.ts` 的預設 role 是 pilot；不能把人物的非駕駛設定說成玩家無法安排入座。本批不改引擎。招募 bio 顯示也未由本批實作。

**character.places 尚未登記。** 共同規格要求寫 places，現行 lore check 僅警告未知欄位，故保留 9 個 places 欄並如實列警告，留待格式線處理。refreshOn=quarter 沿核定資料；實際 recruit.ts 以 neap 階段及當日去重刷新，不能解讀為固定每三個月。錫蘭與印度西岸人物使用既有 bengal 文化桶，未擴名表或宣稱族裔相同。

# 執行與下次交接

子代理 **0**，子代理成本 **0**；本線的 token／金額環境未提供計量，不估算。品質以原規格全欄相等、九篇敘事及固定四條證據核對。沒有 commit、push、改舊池、改 src／specs／index／batches，也未寄 inbox。

scratch 與檢查 log 全放 `/tmp/cx-fp-south-02/`；指定資料工具自動產生的 Python bytecode 已搬至該 scratch，worktree 不留工具快取，沒有刪檔。下次交接仍應點名資料查寫、grep、三項輕量檢查及由領導跑全套的界線；Python 使用資料工具時傳字串路徑並停用 bytecode，避免工具快取落入 worktree。

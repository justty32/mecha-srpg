已讀清單

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
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/plan.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/people.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/pools.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/batch-files.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/review-draft.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/euram-plan/cx-fp-euram-02.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

以上均由本線親讀；三個目錄的原有範本已全讀（persons 38、backgrounds 13、recruit-pools 4），人物實作另按 people.template。people、pools、batch-files、review-draft 以 tabledb 篩本批，不整份輸入上下文。worktree 沒有 fp-common.md 與 deep-rulings.md，已讀主 repo 相同相對位置的原檔。另讀開場 SESSION-LOG／WAIT_USER、WORKFLOWS、world-pillars、data-files、manifest、本批引用地方／勢力／事件；未寫這些檔案。

做了什麼：DONE。依已填 base 的 manifest（27e6ea2f3481a4df855b19bfbf2760a65433fbf1）新增 12 組 background＋person＋character，另新增 2 個招募池，恰好 38 檔。全部只在指定隔離 worktree 新增；數值照 people、pools，person 的 pools、xpCurve、perkPointsAt 保留指定範本。沒有修改既有檔、commit 或對外送出。

產出與掛點：北美六人連到跨線護糧、知識斷層、出生斷層與歸船斷座夜；拉美六人連到民船學徒、環線燈火之戰、空城岸、商路約與斷纜夜。故鄉與勢力沿用既有 lore ID，招募港另用既有 base 的吉大港／新加坡。瑪倫不接管頂砲者，羅西奧不接管露西亞，奈拉沒有高原衛軍籍或軍援。逐檔白話與掛點見 [review-rows.json](review-rows.json)（38 列）；[inserts.json](inserts.json) 為空 rows。

固定驗收（恰好四條）：

1. PASS：38 個白名單新內容檔，12 組三件齊、2 池共 12 個來源均屬本批且存在。git status 除既有 node_modules 連結外完全等於白名單；既有檔與暫存區皆無修改。總容量 43,912 bytes，最大單檔 1,715 bytes。原始證據：[git-status.log](git-status.log)。
2. PASS（本線範圍）：npm run check 退出 0，base 段 0 errors／32 warnings、ops 段 0 errors／10 warnings；node content/lore/check.ts 退出 0、0 errors、12 warnings；npm run typecheck 退出 0。三者各執行一次，原始輸出保留於 [check.log](check.log)、[lore-check.log](lore-check.log)、[typecheck.log](typecheck.log)。npm test 依使用者與 fp-rulings 資源禁令交領導跑，本線未跑，故沒有可報的 test 失敗檔或黃金結果；未重錄黃金。
3. PASS：review-rows 合法 wf-table/1，columns 正確、38 列，逐列沿用本批 draft、白話最多 60 字且新名標（提案）；inserts 合法、0 列。12 人 age／born、數值、既有 place／faction、quote、三段 body 均符合 people。小傳扣除 Markdown 連結與空白後為 318–333 字，原始 body 為 340–357 字；性別、崩前記憶或未出生、崩後經歷、招牌瞬間均已逐人讀核。沒有新 effect、AI、萬潮葬王或秘密內容。
4. PASS：本 REPORT 已寫指定絕對路徑，開頭已讀清單完整列出交接書 24 個原始路徑與追加裁示；四條驗收證據、未解事項及子代理數均已記錄。結構化四條證據見 [evidence.json](evidence.json)。

檢查結果與新增警告：check 的 base 段 32 條警告均來自既有檔（capture layer HP、數值帶、soft overflow、未武裝），ops 段再報其中 10 個 monsters 的 capture layer HP 警告，共輸出 42 行，沒有新檔警告。lore 新增 12 條警告均是本批 character 的「未登記欄位 places」，依交接規格保留，不修改 schema 或 README；逐條原文在 lore-check.log，每人一條。

沒做到或證據不足：全套 npm test 及黃金差異尚無本線證據，由領導收件後執行。新增池會改變營運亂數軌跡，不能在這裡宣稱黃金通過。本線沒有加跑 probe、playtest、e2e、sim、fuzz 或其他驗收。

需要決定／引擎候選：無需本批停工等待的設定衝突或插入事項。沿既有計畫候選：報訊／船員學徒 tags 只表達職業，不能硬性禁止玩家把 human 上機；招募小傳入口、職類篩選另由領導評估。culture 是現有命名偏好，未當成國籍分類；本批沒有不老年資。全庫姓名／ID grep 無占用，另五線 names-claimed 無碰撞；本區 claims 的 12 個命中均為本批已核定名字。claims 原檔是字串陣列，非 wf-table/1，故只讀解析比對，未改原檔。

子代理：實際使用 0；由本線親讀規範、寫作與驗收，無委派品質項目。

以後交接書該點名的工具：無新增。共通 fp-common.md、deep-rulings.md 應註明主 repo 絕對路徑，避免尚未提交時在 worktree 缺檔；npm test 統一寫「領導跑」。

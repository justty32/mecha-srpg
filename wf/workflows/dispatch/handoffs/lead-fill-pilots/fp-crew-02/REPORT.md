# 已讀清單

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
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/cx-fp-crew-02.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/lore-text.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

以上由本線親自讀取；AGENTS.md、fp-common.md、fp-rulings.md 均讀原文。worktree 未附的交接、裁示與計畫檔，依任務書從主 repo 同一路徑唯讀查閱。目錄項已列檔：recruit-pools 的四池、backgrounds 的十三檔已讀；persons 整檔讀本批指定的 irina-sokolova、esin-kaya、anjali-nair、leila-nasser、maia-te-rangi、hana-sato 六份範本。另讀 SESSION-LOG、WAIT_USER、WORKFLOWS，以及本批引用的地方、勢力、機型。開場 inbox_read 無信；限寫優先，未寫工作流狀態檔。

# 做了什麼

線名 cx-fp-crew-02，領導 lead-fill-pilots。依核定 people／pools／batch-files 的 fp-crew-02 列新增 9 組背景、person、lore 人物與 3 池，恰好 30 檔。數值與職能全依計畫；person 保留原範本 pools、will、growth.xpCurve、perkPointsAt，只在 person 掛一次列定 trait，背景 traits 為空。兩位老手分別為薩米拉 42 歲／16 年、托本 45 歲／17 年；其他人省略 activeYears，沒有新增能力或附送機甲。

# 產出與掛點

內容位於隔離 worktree 的 manifest 清單路徑，逐檔白話與掛點見 [review-rows.json](review-rows.json)。全批 31,174 bytes，最大單檔 1,728 bytes。

孟買門三人接底色 1.9、1.12 的信仰與機魂分歧，以及 1.4 的難民炊事；薩米拉明記離營，納比勒已離營找短約，塔希拉救援限外緣。池用營運 place/mumbai，人物用 lore place/mumbai-gate。舊陣列三人接底色 1.3、1.8 與 A／B／C／E 線的探勘、通訊，以及浦那陷落的 F 線撤離；托本的刻痕光留在 2103 年回憶，現在刑天已移往蒙特婁。蘆葦澤三人接底色 1.1–1.4、1.8 的難民船工與救護，莉米承接綠線清剿後的爭議，正文不確認養裂者、不建立哨站。

寫前先 ls 兩個人物目錄，逐一對 9 個 id 與 9 個中文全名執行 grep -RFn，範圍是全 content 加 east、moon、euram、south、afrwasia 五區 names-claimed.json：18 次均無命中（exit 1）。證據在 `/tmp/cx-fp-crew-02/name-check.json`。people／pools／batch-files 用 tabledb 只查本批，review-draft 用 tabledb 逐檔名查。

# 驗證與新警告

依專屬任務書與 fp-rulings，驗收恰好以下四條；未新增測試門檻。

1. manifest 的 30 個新檔與 batch-files 的本批列逐一相符，JSON 合法；tracked diff 為空。原有未追蹤 node_modules 保留，它是啟動前基線，不是本批產物。沒有修改既有檔。
2. `npm run check` 一次：exit 0；base `OK 0 errors, 32 warnings`，ops `OK 0 errors, 10 warnings`。兩段警告均指向既有檔，本批新檔 0 警告。`node content/lore/check.ts` 一次：exit 0，errors=0 warnings=9。`npm run typecheck` 一次：exit 0，無輸出錯誤。全套 `npm test` 依領導追加改為「領導跑」。
3. 每人三檔齊，age 與 born 相符，地方與勢力都指向既有 lore；正文各三段、303–321 字，含崩前、崩後、招牌瞬間與原句。性別在正文，九人均 human。無新增 effect、AI 或禁題內容。
4. REPORT 已讀清單完整；review-rows.json 為 wf-table/1，恰好 30 列，白話全部 ≤60 字、新名標（提案）；inserts.json 為規定五欄的合法 wf-table/1 空表，0 列，無既有檔插入需求。

lore 的 9 個新警告全是任務明令保留的 `places` 未登記欄位：farhana-haque、kamal-sutradhar、nabil-hamdan、nermin-arslan、rimi-basu、samira-qureshi、tahira-sen、torben-nygaard、zhou-suyan，均在 `content/lore/characters/<id>.json`。沒有修改檢查器或格式文件。

原始檢查輸出在 `/tmp/cx-fp-crew-02/check.log`、`/tmp/cx-fp-crew-02/lore.log`、`/tmp/cx-fp-crew-02/typecheck.log`；四條交付核對紀錄在 `/tmp/cx-fp-crew-02/acceptance.json`。

# 沒做到或證據不足

全套 npm test、e2e、sim、fuzz、probe、playtest 均未執行，遵守本線資源禁令與固定驗收。三個新池會改營運共享亂數軌跡；黃金紅檔名尚無本線實測證據，待領導跑全套後逐檔記錄，不能解讀為 0 fail。本線未重錄黃金、未用舊輸出替代。

# 需要決定與引擎缺口

本批沒有阻塞或需改既有檔的事項，inserts 為空。候選沿用計畫：招募卡顯示人物生平／年齡、職類顯示與專業玩法、未成年派任硬性限制、原出身勢力與現職分欄、背景支援多人物範本。本批沒有未成年人；職能 tags 仍是描述，不能保證派任限制或新增專業技能。這些只記候選，不實作。孟買池與門外緣船工的敘事對應照計畫，不擅改地點。

# 子代理

實際使用 0 個；本批由本線完成。

# 以後交接書該點名的工具

維持 tabledb、ls／grep、git status／diff、npm run check、lore check、typecheck，以及 JSON／字數／清單核對。tabledb 的 Python API 用於只取本批、逐檔查 review 並寫兩份報告表。全套 npm test 保持由領導執行；不加入 probe 或重錄黃金要求。

狀態：DONE。本線交付完成，全套測試由領導依裁示收件後執行。

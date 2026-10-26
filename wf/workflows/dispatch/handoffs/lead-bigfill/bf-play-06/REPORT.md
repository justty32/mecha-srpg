# 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`
- `wf/workflows/planning/specs/ops/content-format-ops.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-06.md`

上述 bf-common、play-rulings、plan 與本線交接書由主 repo 的同一路徑唯讀取得；其餘以本 worktree 為準。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、inbox/README、common/data-files、適用支柱子頁；templates.json 的營運事件列、engine-facts.json EF-19～21 與 review-draft.json 本批 12 列皆經 tabledb 定向查詢。

逐檔親讀 review 掛到的 12 個 lore places（seattle、valparaiso、havana、winnipeg、ring-road、brasilia、belem、denver、montreal、cartagena、zamboanga、makassar）及七個 lore factions（north-american-umbrella、latam-umbrella、quito、ring-caravan、heartland-capital、shell-society、singapore-exchange）。補讀歸船斷座夜、借山空返、雪底留名、空碗迎船四個 lore events。

親讀範本 news-tide-street-sermon.json、port-raft-lantern.json，以及數值範本 restraint-empty-rack.json、rival-practice-banner.json、ruin-before-tide-glow.json。正式 manifest 唯讀自 `/home/lorkhan/repo/game_dev/mecha-srpg/content/batches/2026-10/bf-play-06.json`；base 與 worktree HEAD 同為 `8a48e7ef3e982b278e382d8a166cfc05a8564428`，非 TBD。

# 做了什麼

完成 bf-play-06 恰好 12 個新事件，只新增白名單檔案，沒有改既有檔、manifest、索引或黃金，也沒有 commit。將審定欄位轉為合法 EventDef；when、where、weight、requires、effects 逐列對上 review-draft，沒有把寫手方向字串放進遊戲欄位。

每件以第二人稱觀看當下港口的舊影、抵港者或故鄉示範，均有指定吼句、氣味與聲音；遠方地點使用完整顯示名。西雅圖只呈現既有礁角舊影，沒有新增獸二名；蒙特婁城邦只停在未譯拓本，不預決刑天認主。限額核心畫面只有拓本 1 件，其餘五類 0 件。12/12 皆有吼句與真代價；無月面營運、AI、萬潮葬王件。

八件採現金−100／全員士氣＋1；環線與丹佛採全員士氣−1／科研工時＋3；貝倫採現金−160／科研工時＋8；望加錫採廢料−2／科研工時＋5。兩選項均設 seen，第一選項無 requires、無資源收益；扣帳選項有足額門檻並明示代價。

# 產出

逐檔定位、名稱、白話及 lore id／崩年底色掛點見 [review-rows.json](review-rows.json)，恰好 12 列；命名記錄見 [naming.json](naming.json)，12 列皆為現有詞組合、nameEn 留空；去重插入需求見 [inserts.json](inserts.json)，2 列，均為 append。三表以 tabledb 寫入及讀回核對，契約 wf-table/1、欄位一致。

正文長度 99–112 字；白話最長 31 字。新 content 合計 20751 bytes、最大單檔 1803 bytes，未觸容量 gate。

git status --short 原文：

```text
?? content/base/world/events/news-bf-brasilia-clock-oath.json
?? content/base/world/events/news-bf-denver-grainline.json
?? content/base/world/events/news-bf-seattle-gun-name.json
?? content/base/world/events/news-bf-valparaiso-coast-oath.json
?? content/base/world/events/news-bf-winnipeg-last-name.json
?? content/base/world/events/port-bf-belem-cargo-roar.json
?? content/base/world/events/port-bf-caravan-wheel-oath.json
?? content/base/world/events/port-bf-cartagena-old-mast.json
?? content/base/world/events/port-bf-havana-night-chorus.json
?? content/base/world/events/port-bf-makassar-top-sail.json
?? content/base/world/events/port-bf-montreal-unread-line.json
?? content/base/world/events/port-bf-zamboanga-answer.json
?? node_modules
```

node_modules 是領導預置例外；其餘全為 manifest 白名單的 12 個新 content，既有追蹤檔 diff 為空。

檢查均在指定 worktree 內執行，各次 node 檢查前以指定 pgrep 模式確認無其他 node/npm 重負載。固定五條驗收對照如下，沒有加碼驗收：

1. 自己改動恰好 12 個新 content、無既有檔修改，git status 原文如上。
2. `npm run check` exit 0，末行 `OK 0 errors, 10 warnings`；`node src/ops/content/check.ts content/base` exit 0，同為 `OK 0 errors, 10 warnings`；`npm run typecheck` exit 0。原始輸出在 `/tmp/cx-bf-play-06/check.log`、`ops-check.log`、`typecheck.log`。
3. `npm test` **未跑，領導收件後跑**。依 bf-common.md「重負載限制（優先於任何交接書與計畫）」覆蓋本線原驗收第 3 條，不聲稱測試綠燈；未跑黃金測試，無本次黃金紅錯誤或 fixture 差異可列，未改期望、未重錄。
4. review-rows 12 列且白話≤60 字；naming、inserts 均合法；逐檔觸發與效果對上定案，文字與掛點已完成。
5. 本 REPORT 開頭完整列出先讀清單，並記錄黃金影響及未套 inserts。

兩個內容檢查都出現同樣 10 則指向既有怪獸檔的警告，沒有警告指向本批新檔；本批沒有修改這些來源。完整原文：

```text
WARNING [content-load] content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING [content-load] content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING [content-load] content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING [content-load] content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING [content-load] content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING [content-load] content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING [content-load] content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING [content-load] content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING [content-load] content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [content-load] content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [band-evasion] content/base/effects/mx-faded.json $.contribs[0].value value 25 exceeds upper limit 22; source numeric-bands.json rows[18]
WARNING [soft-overflow-band] content/base/frames/bio-breaksurf.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-foam-jaw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-reef-antler.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-shelf-back.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-shell-ear.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-split-fin.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-storm-mane.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-surf-runner.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-trench-maw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/breaksurf.json $.pools[1].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/foam-jaw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/reef-antler.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/shelf-back.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/shell-ear.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/split-fin.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/storm-mane.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/surf-runner.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/tidewolf.json $.pools[1].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/trench-maw.json $.pools[0].bands instinct: no band covers values above max
WARNING [band-damage] content/base/abilities/kx-tide-crush.json $.packets value 28 exceeds upper limit 26; source numeric-bands.json rows[7]
WARNING [mechanical-unarmed] content/base/frames/infantry.json $.defaultLoadout mechanical frame has no defaultLoadout or innate attack
WARNING content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
```

查既有引用已使用 `content_index.py refs`：place/seattle 為 0，place/singapore 為 11；這是索引既有引用數，不當作新件可達證據，未重產索引。

# 沒做到或證據不足的

inserts 尚未套入既有檔：需由合併線向 `content/base/world/places/singapore.json` 的 `$.tags` append `bf-receive-singapore`，向 `content/base/world/places/chittagong.json` 的 `$.tags` append `bf-receive-chittagong`，同值去重。接線後才會進月份≥1、每月 5／12／19／26 日、seen 為 0 的抽選；多件共用日槽，不保證短戰役全遇見。目前僅能稱休眠交付，不稱已上主線可達，亦不代表玩家可航往美洲或其他遠方城市。

本批是否改黃金：**接線後會影響世界事件抽選、選擇停頓與後續狀態；孤立新檔未接 tag 時預期不變，未以全套測試實證。** 全批合併後的 npm test 與黃金重錄由領導統一處理。本線依交接書未跑 probe、戰役長測、content_accept、MCP 或 GUI。

# 需要決定的事

無新專名提案、無新增引擎缺口、無需改舊 lore 的衝突。沿用審定標題與普通吼句，不將它們當新招式或神器。全套測試由領導跑是共通緊急令的明文要求，無需另加使用者確認。

# 子代理

未開子代理。成本為本線單工人完成；自行親讀 lore、範本與定案並核對，沒有委外品質或成本待追蹤項。

# 以後交接書該點名的工具

既有工具已足夠。建議交接書直接將 npm test 寫為「領導收件後跑」，與 bf-common 緊急令一致；正式 manifest 位置也點明在主 repo，避免將 worktree 未含 manifest 誤判為未備妥。無新增工具需求。

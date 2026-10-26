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
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-02.md`

以上逐份親讀；本 worktree 的 base 早於 lead-bigfill 交接區，該區各檔、正式 manifest 與 review-draft 由 `/home/lorkhan/repo/game_dev/mecha-srpg/` 唯讀取得。正式 manifest `base`＝`8a48e7ef3e982b278e382d8a166cfc05a8564428`，與 worktree HEAD 相同，不是 TBD；未新增或修改 manifest。

另讀開場 SESSION-LOG、WAIT_USER、WORKFLOWS、common/data-files、inbox/README；用 tabledb 定向查 templates（營運事件／契約）、engine-facts（EF-19～21）及 review-draft 本批18列。EF-19、EF-21 部分舊敘述由已審計畫的現行接法補正：指定 monster 透過 killTarget 展開，契約 name 合法，不新增假欄位。八個主／結構範本均親讀，逐檔範本見 delivery-details.json。

親讀 lore：`content/lore/factions/{nairobi,yoke-saddle-works,dhaka-weavers,anvil,salt-gull,league,chittagong-breakers}.json`、`content/lore/places/{mombasa,dhaka-sail-court,hamburg,rotterdam-roost,chittagong}.json`。另核對六種 species／monster 實檔、五個雇主 factions-ops 及兩個落點 places，補讀 world-pillars 的相關世界與生物戰鬥子頁。用 `python3 wf/tools/content_index.py refs monster/reed-lace-c` 查既有引用，回報3檔（kj2-06-demo、world/rifts/mycelium、lore/places/five-lakes-white-ford）；未重產索引。

# 做了什麼

完成 bf-play-02「守住交班的岸」六組配套：6 encounters、6 contracts、6 actions，恰好18個新 content 檔。定案結構與數值逐欄照填；契約名稱補齊既有完整勢力／地點顯示名，保留獸名與當班接戰理由。沒有新專名或概念詞，沒有額外遊戲欄位。遭遇不塞 monster/species 白名單，指定獸由契約 killTarget.params.target 提供。

奈洛比組在吉大港清伏耳，破軛待裝返程船；達卡補天院組在淡水岸守區六回合、蘆網擊殺可選；鐵砧獵團組在吉大港換盾時撐八回合、沫顎擊殺可選；鹽鷗獵團組守卸甲坡六回合、岔鰭擊殺可選；殘聯夜班組擊落燈腹；吉大港拆船幫組清內側拆船坡鹽針，由殘聯借桌窗口代接且聲望只歸殘聯。遠方地點只作 lore 掛點，沒有聲稱玩家到非洲或歐洲。未改停火、港口歸屬或外灘劇情。

# 產出

新 content 根目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-02/content/base/world/`。18個逐檔路徑、名稱與 lore／節點掛點在 [review-rows.json](review-rows.json)，詳細觸發、主／可選目標、指定獸、同級範本、文字要點及逐檔 bytes 在 [delivery-details.json](delivery-details.json)。本批總量13,486 bytes，最大單檔1,045 bytes，均未觸及容量 gate。

[naming.json](naming.json) 有18列，全部「現有詞組合」，nameEn 留空。review-rows 恰好18列，白話最長31字。無事件／對話，不增加六類限額物件的核心畫面。

[inserts.json](inserts.json) 去重後8列：六份契約各 append 至唯一雇主 contractKinds，另 append 達卡、吉大港的 bf-receive 港口 tag。只交需求，未套進既有檔；合併線僅在舊陣列不含同值時 append。無 timeline-add，無跨批新 id。

`git status --short` 原文（node_modules 為領導預置例外）：

```text
?? content/base/world/actions/board-bf-anvil-shield-turn.json
?? content/base/world/actions/board-bf-breakers-salt-needle.json
?? content/base/world/actions/board-bf-dhaka-first-stitch.json
?? content/base/world/actions/board-bf-league-lantern-keel.json
?? content/base/world/actions/board-bf-nairobi-yoke-return.json
?? content/base/world/actions/board-bf-saltgull-tide-ramp.json
?? content/base/world/contracts/bf-anvil-shield-turn.json
?? content/base/world/contracts/bf-breakers-salt-needle.json
?? content/base/world/contracts/bf-dhaka-first-stitch.json
?? content/base/world/contracts/bf-league-lantern-keel.json
?? content/base/world/contracts/bf-nairobi-yoke-return.json
?? content/base/world/contracts/bf-saltgull-tide-ramp.json
?? content/base/world/encounters/rift-z-bf-anvil-shield-turn.json
?? content/base/world/encounters/rift-z-bf-breakers-salt-needle.json
?? content/base/world/encounters/rift-z-bf-dhaka-first-stitch.json
?? content/base/world/encounters/rift-z-bf-league-lantern-keel.json
?? content/base/world/encounters/rift-z-bf-nairobi-yoke-return.json
?? content/base/world/encounters/rift-z-bf-saltgull-tide-ramp.json
?? node_modules
```

固定五條驗收，未追加驗收項目：

1. **通過**：自己的改動恰好18個新 content 檔，與 manifest.files 完全一致；沒有任何 tracked 既有檔修改，未 commit。
2. **通過**：`npm run check` exit 0，末行 `OK 0 errors, 10 warnings`（core 段 `OK 0 errors, 32 warnings`）；`node src/ops/content/check.ts content/base` exit 0，末行 `OK 0 errors, 10 warnings`；`npm run typecheck` exit 0。每次 node 檢查前均先確認沒有其他 heavy test 行程。
3. **依優先緊急令交領導**：未跑 `npm test`；不是測試 exit 0，也沒有宣稱黃金通過。bf-common「重負載限制」明文優先於任何交接書，要求工人不跑全套、由領導收件後跑。未跑 GOLDEN_UPDATE／rerecord，未改黃金或期望。因本線未跑全套，沒有可列的黃金紅測試、fixture 或原始錯誤。
4. **通過**：三份 wf-table/1 交付資料合法；review-rows18列且白話≤60字，逐檔掛點／觸發／文字要點已記。0個月面營運、AI、萬潮葬王相關產出。
5. **通過**：本 REPORT 存在，開頭逐項列已讀路徑；黃金影響與未套插入需求如下段。

檢查原始輸出：`/tmp/cx-bf-play-02/check.log`、`/tmp/cx-bf-play-02/ops-check.log`、`/tmp/cx-bf-play-02/typecheck.log`。32條 core 警告與10條 ops 警告皆指未修改的既有 core 檔（捕獲層HP、既有數值帶／本能軟上限／infantry 無武裝）；本批18個新檔沒有警告，故無新警告原文。沒有為消警告修改既有檔。

# 沒做到或證據不足的

本批是否改黃金：**接入港口 tags／contractKinds 後會改世界抽選與新契約軌跡；目前孤立新檔未啟用，預期不變，但未跑全套驗證。** inserts 尚未套用，不能宣稱主線已可遇到或六組已在世界發包。合併、全套測試與整批黃金重錄由領導安排。

明選 encounter 的快照 width=D，目前沿範本先抽兩隻同族D；指定獸未抽到才補一隻，共2–3隻，C指定獸固定補一隻。沒有宣稱C:1預算已抽C，也沒有承諾伴隨物種固定。hold 未填 zone、交既有引擎展開可達區；可選擊殺不代替守區／生存主目標。契約僅使用定案的 name 與欄位，不加未定案長文；騎手、工班與吼句的敘事方向保存在白話與逐檔交接資料，未假裝另有戰場旁白機制。

# 需要決定的事

無新專名提案，無需使用者另定範圍。全套測試待領導，屬已裁定分工；既有引擎的族級隨機伴隨與 width=D 限制已依計畫照用，未另提引擎改動。正式 manifest 在主 repo 且 base 正確；未擅自複製到本 worktree，避免超出18檔白名單。

# 子代理

未使用子代理；本線自行讀規範、寫18檔並查驗。無子代理成本；定案結構逐欄核對，避免轉述遺漏。

# 以後交接書該點名的工具

沿用本稿工具即可；應將 `npm test` 驗收文字直接改成「由領導收件後執行」，與 bf-common 緊急令一致。tabledb 的 Python load/Table API 可按巢狀「掛到.批次」篩選18列並建立合法報告資料；content_index 只查 refs。未執行 content_accept、probe、sim、fuzz、GUI、MCP、安裝依賴或額外長測。

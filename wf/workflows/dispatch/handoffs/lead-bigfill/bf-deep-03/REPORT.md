# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`
- `wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/great-tide.md`
- `content/base/bodyplans/alien-breakwater-clinger.json`
- `content/base/frames/anvil-hoist-ii.json`
- `content/base/frames/bulwark-i.json`
- `content/base/frames/innersea-counterseal-ii.json`
- `content/base/species/breakwater-clinger.json`
- `content/base/world/models/anvil-hoist-ii.json`
- `content/base/world/models/bulwark-i.json`
- `content/base/world/models/innersea-counterseal-ii.json`
- `content/lore/characters/claire-renaud.json`
- `content/lore/characters/lena-visser.json`
- `content/lore/characters/marta-bellini.json`
- `content/lore/characters/oskar-lind.json`
- `content/lore/eras/league.json`
- `content/lore/factions/anvil.json`
- `content/lore/factions/euro-umbrella.json`
- `content/lore/factions/inner-sea-houses.json`
- `content/lore/factions/salt-gull.json`
- `content/lore/places/genoa-yards.json`
- `content/lore/places/hamburg.json`
- `content/lore/places/rotterdam-roost.json`
- `content/lore/places/saint-malo.json`
- `content/lore/places/skagerrak-shell.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-03.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`

## 做了什麼

cx-bf-deep-03／teams/bigfill；上游 lead-bigfill。依交接書與 deep-rulings 在隔離 worktree 新增四位 human 駕駛、五件事件、一處地點。逐檔白話與掛點完整列於 [review-rows.json](review-rows.json)，名稱均保留提案狀態。

尼克在鹿特丹乾岸頂正偏航糧駁，喊「岸還在！」（G／F、底色 1.4、沉堤後果）；鷗巢纏樁夜讓 C 級抱樁的偏披甲、裸垂臂與鉤足壓上殘樁，撤出人並留下退船路（G／F、底色 1.4）。人物篇的撞偏糧駁另寫，不重演纏樁夜。

索蓮帶舊傷回到堅盾座艙，喊「門缺一人，我補！」（F、底色 1.11／1.12、九門同喪後果）；缺門有人只寫有限巡牆與「人回來了，門就有！」，換班仍需拐杖（F、底色 1.12、二一〇七年九門同喪後果）。

安珂在吊架下以機肩承重，喊「先卸人，再卸鐵！」（C／G、底色 1.3／1.12）；燼肩托架讓工人吼「鐵可以再造！」救出同伴，肩架報廢、傷勢與停工照留（C、底色 1.3／1.12）。埃利亞替別人的合印試步，先收住偏斜、等工人撤開，喊「把名字留在這一步！」（C／G、底色 1.3／1.12）；出塢一踏保留為修復後可能的首試，全篇以若／可能敘述「我們造的，站起來！」（C、底色 1.3／1.12）。

黑脊映面寫退潮、月光與裝甲刻痕讓接哨者停下爭搶，輪流上礁（B、N04 後果、二一〇二出土及二一〇五爭奪後守望）；北海冷照屋以刻痕冷光映面、手影顯小寫警戒外側短停處，保留風浪時不能使用的限制（B、N04 後果、二一〇五斯卡蓋拉克事件）。埃吉爾保持靜止。

所有固定欄位照逐件規格；本文使用既有地點／人物的 lore 連結。反向關聯與年表只寫報告資料，既有檔未套用插入。未使用子代理。

## 產出

內容位於 worktree `content/lore/`，精確清單同正式 manifest `files`（10 檔）。起點與目前 HEAD 均為 `57928949b0ee4f41ed91e82c850ff93f17adbb42`；正式 manifest 由領導準備，本線唯讀。正文長度 459–549 字元（含 Markdown 與連結），事件各三節，地點五節。

報告四檔：[REPORT.md](REPORT.md)、[review-rows.json](review-rows.json)（10 列）、[inserts.json](inserts.json)（9 列）、[timeline-add.json](timeline-add.json)（4 列）。三表均以指定 tabledb 工具載入、追加並儲存，契約 wf-table/1，欄位順序照交接書。review 白話最長 33 字。

固定驗收證據：

1. lore 基線 `errors=0 warnings=0`；逐檔檢查與收尾均 errors=0，收尾 `errors=0 warnings=4`。同批未建引用與短正文的過程警告已清零，只餘下節四個准許的未列年表事件。
2. `npm run check` exit 0，末行 `OK 0 errors, 10 warnings`。base 載入段另有 `OK 0 errors, 32 warnings`；本線未寫 base，沒有宣稱全庫無警告。
3. 新 content 精確 10 檔、檔名與 id name 段相同；已追蹤既有檔差異 0。基線已有未追蹤 `node_modules`，本線未修改。
4. REPORT 已讀清單與三份資料表均完成；固定欄位、10 列 review、白話長度、插入資料及年表對應通過。

原始檢查輸出留在 `/tmp/cx-bf-deep-03/`：`baseline-lore.log`、`lore-01.log` 至 `lore-10.log`、`final-lore.log`、`final-check.log`；差異範圍與資料表檢核記於 `acceptance.json`。每完成一步均已輪詢 orders；上線 PROGRESS 已投遞 lead-bigfill。

## 沒做到或證據不足的

無執行阻塞。依固定四條驗收停止，不跑 npm test、content_accept、其他擴充檢查；既有檔、索引、manifest、年表未改，沒有 commit。content_gate 由領導收件執行。

四個新增警告原文皆為「未出現在 timeline」，來源與合併資料逐項如下（資料列序號從一開始）：

- `event/hamburg-ember-shoulder`：`2107-03`「燼肩托架」，來源 `events/hamburg-ember-shoulder.json`；`timeline-add.json` 第 1 列。
- `event/roost-pier-grip`：`2107-05`「鷗巢纏樁夜」，來源 `events/roost-pier-grip.json`；`timeline-add.json` 第 2 列。
- `event/skagerrak-black-ridge`：`2107-09`「黑脊映面」，來源 `events/skagerrak-black-ridge.json`；`timeline-add.json` 第 3 列。
- `event/malo-return-to-the-breach`：`2107-11`「缺門有人」，來源 `events/malo-return-to-the-breach.json`；`timeline-add.json` 第 4 列。

對應反向 events 插入：鷗巢纏樁夜為 inserts 第 2 列（莉娜）、缺門有人第 4 列（克萊兒）、燼肩托架第 6 列（奧斯卡）。黑脊映面依規格只用本文連結，無既有欄位插入。出塢一踏為 `occurs: possible`，不列確定年表；僅 inserts 第 8 列提出瑪塔 events 導航。北海冷照屋的鹽鷗 places 導航為第 9 列。

## 需要決定的事

以下十個指定新名待領導與使用者審核，content name／body 未帶設計層標記，review 名稱均加（提案）；沒有另外新造專名：

- 尼克・沃斯（提案）
- 鷗巢纏樁夜（提案）
- 索蓮・勒戈夫（提案）
- 缺門有人（提案）
- 安珂・雷姆（提案）
- 燼肩托架（提案）
- 埃利亞・孔蒂（提案）
- 出塢一踏（提案）
- 黑脊映面（提案）
- 北海冷照屋（提案）

上節四個年表新增條目與九個反向插入需求待合併；四個年表警告不能在本線先改舊檔消除。既有設定間未發現需要本批另作裁定的矛盾。交接書受限小物段含其他批「鳴崖碎燈夜」的配額說明；本批未使用燈或其他受限小物作核心，依各件空配額執行。

## 以後交接書該點名的工具

本次點名工具已足夠：lore check、npm run check、tabledb、inbox_poll、inbox_mail。tabledb 的 load 後讀 meta.entries 可用於年表唯讀查詢；重負載前先查 pgrep 並辨別實際 node 行程，避免把包含命令字串的 sandbox 包裝行程誤判為測試。沒有新增工具需求。

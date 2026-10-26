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
- `content/base/bodyplans/alien-dusk-fold.json`
- `content/base/bodyplans/alien-hollow-sail.json`
- `content/base/bodyplans/beast-trench-maw.json`
- `content/base/bodyplans/insect-brinepin.json`
- `content/base/bodyplans/insect-lantern-keel.json`
- `content/base/bodyplans/insect-needle-rack.json`
- `content/base/bodyplans/insect-silt-mother.json`
- `content/base/bodyplans/insect-sluice-mother.json`
- `content/base/bodyplans/quadruped-beast.json`
- `content/base/frames/bulwark-i.json`
- `content/base/species/brinepin.json`
- `content/base/species/dusk-fold.json`
- `content/base/species/hollow-sail.json`
- `content/base/species/lantern-keel.json`
- `content/base/species/needle-rack.json`
- `content/base/species/silt-mother.json`
- `content/base/species/sluice-mother.json`
- `content/base/species/tidewolf.json`
- `content/base/species/trench-maw.json`
- `content/base/world/models/bulwark-i.json`
- `content/lore/eras/league.json`
- `content/lore/eras/tide-line.json`
- `content/lore/factions/league.json`
- `content/lore/factions/sydney.json`
- `content/lore/places/auckland-empty-berths.json`
- `content/lore/places/auckland.json`
- `content/lore/places/batangas-outer-sluices.json`
- `content/lore/places/makassar.json`
- `content/lore/places/uluru-heart.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-06.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`

## 做了什麼

cx-bf-deep-06 在指定隔離 worktree 新增 2 個人物、6 個事件、2 個地點，共 10 件；固定欄位照交接書保留。逐件白話、A／B／C 類別與主線／底色掛點見 [review-rows.json](review-rows.json)。雅妮守船首並保留「破船也有船頭！」；瑪拉擋住越界來客並保留「看見，不等於拿走！」。獸的部位與動作依各 species、bodyplan；紅心只寫既有露脊變色，本體解釋保留 rumor。

先建齊同批 JSON 再逐篇補正文，每完成一檔跑 lore check；骨架階段的短文警告於收尾清零。沒有使用子代理，沒有新增遊戲技能或數值。鞋、繩／索、乾衣、杯、梯、扶手、熱水與照明物件均未用作核心畫面；燈腹為既有物種。

## 產出

內容完整清單與正式 manifest `content/batches/2026-10/bf-deep-06.json` 的 files 相同。報告四檔為本 REPORT、[review-rows.json](review-rows.json)（10 列）、[inserts.json](inserts.json)（3 列）、[timeline-add.json](timeline-add.json)（5 列）。資料表透過主 repo 的 tabledb Table.add／save 寫入，再用 load 驗證；索引與年表查詢也用 load，年表只讀 meta.entries。

固定驗收結果：

1. 開始前 lore 基線 `errors=0 warnings=0`；收尾 `errors=0 warnings=6`。新增警告全部為下列事件未入年表，與白名單完全相同，沒有其他新增警告。
2. `npm run check` 末行 `OK 0 errors, 10 warnings`，10 條均來自未修改的 content/base/monsters 既有 capture layer HP differs。本線沒有跑 npm test 或其他加碼驗收。
3. 10 個指定新 content 檔存在，檔名等於 id 的 name 段；既有追蹤檔修改 0。開場即有 `?? node_modules`，為領導準備的依賴連結，未操作。正文長度 402–451 字，事件均為三小節、地點均為指定五小節。
4. REPORT 已讀清單逐行列出；review 10 列，名稱均帶（提案）、白話最長 33 字；三份 wf-table/1 欄位、列數與內容均已核對。inserts／timeline-add 未套用至既有檔。

六條年表警告來源及合併對應（列索引為 0-based）：

`events/batangas-third-closure.json` → `timeline-add.json` 第 0 列（2104）。

`events/makassar-mud-brood.json` → `timeline-add.json` 第 1 列（2107-04）。

`events/makassar-spark-keel.json` → `timeline-add.json` 第 2 列（2107-08）。

`events/batangas-wing-rain.json` → `timeline-add.json` 第 3 列（2107-11）。

`events/auckland-hollow-overhead.json` → `timeline-add.json` 第 4 列（2107-12）。

`events/auckland-dusk-canopy.json` → `inserts.json` 第 0 列（2107「舊船覆幕，內泊留燈」補 event）。

這些警告的共同原因是本線只准新增，年表由領導最後套用。覆幕夜沿用既有 2107 年同夜，只補 event；2104 第三回閉港另列一條，不覆蓋 2103 井工錯班過外閘。另兩筆 append 只增加雪梨、殘聯的地點導航。

檢查原始輸出留在 `/tmp/cx-bf-deep-06/baseline.log`、`lore-01.log` 至 `lore-10.log`、`final-lore.log`、`npm-check.log`。最終件數與資料表核對證據見同目錄 `delivery-check.json`。上線已寄 PROGRESS，每完成工作步驟均輪詢 orders。

## 沒做到或證據不足的

無阻塞。年表與勢力反向導航沒有寫入既有檔，留給合併線；未宣稱全庫無警告。未執行 content_gate、content_accept、全套測試或額外型別檢查；領導依固定驗收接收。沒有 commit、刪檔、改索引、改 manifest、改 base 或 src。

## 需要決定的事

下列名字皆沿用交接書，尚待人審：雅妮・薩利赫（提案）、望加錫泥口（提案）、船底再鳴（提案）、八打雁翼雨（提案）、第三回閉港（提案）、八打雁懸矢檐（提案）、奧克蘭缺帆（提案）、舊船覆幕夜（提案）、奧克蘭顎影岸（提案）、瑪拉・基恩（提案）。沒有另造規格外專名。

規格的 `auckland-maw-shelf` 固定 region 是「大洋洲・奧克蘭內泊卸貨處」，核心則在外泊岸下；本線原樣保留欄位，正文寫為從內泊走到外泊陸岸觀察。若需統一 region 的地理表述，由領導裁定後另線處理，本線未改固定值。其餘未發現需推翻既有 lore 或設定筆記的矛盾。

年表六條警告待領導套用上述 5 筆新增與 1 筆補 event；覆幕的 entries[160] 是快照，合併時依 date=2107、title=舊船覆幕，內泊留燈 重定位，僅缺鍵時補入。已有異值交領導裁定。

## 以後交接書該點名的工具

現有點名已足夠：lore check、npm run check、主 repo tabledb.py（含 timeline 的 meta.entries 唯讀視圖）、inbox_poll.sh 與 inbox_mail.sh。沒有新增工具需求。

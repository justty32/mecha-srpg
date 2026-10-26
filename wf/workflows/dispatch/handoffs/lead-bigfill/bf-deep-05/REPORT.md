# 已讀清單

`AGENTS.md` 親讀主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；交接書、共同規格與 deep 裁定親讀主 repo，其他點名檔親讀本 worktree。逐項原路徑如下。

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
- `content/base/bodyplans/mycel-drowned-grove.json`
- `content/base/bodyplans/mycel-reed-lace.json`
- `content/base/bodyplans/quadruped-beast.json`
- `content/base/bodyplans/quadruped-hound.json`
- `content/base/frames/bulwark-i.json`
- `content/base/frames/na-sled-03.json`
- `content/base/species/drowned-grove.json`
- `content/base/species/hound.json`
- `content/base/species/reed-lace.json`
- `content/base/species/tidewolf.json`
- `content/base/world/models/bulwark-i.json`
- `content/base/world/models/na-sled-03.json`
- `content/lore/characters/eugenia-ferrero.json`
- `content/lore/eras/league.json`
- `content/lore/factions/latam-umbrella.json`
- `content/lore/factions/north-american-umbrella.json`
- `content/lore/factions/quito.json`
- `content/lore/factions/rift-beasts.json`
- `content/lore/factions/shell-society.json`
- `content/lore/places/belem.json`
- `content/lore/places/brasilia.json`
- `content/lore/places/five-lakes-white-ford.json`
- `content/lore/places/havana.json`
- `content/lore/places/montreal.json`
- `content/lore/places/seattle-outer-grain-quay.json`
- `content/lore/places/seattle.json`
- `content/lore/places/titicaca-ruin.json`
- `content/lore/places/valparaiso.json`
- `content/lore/places/winnipeg.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-05.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`

另讀工作流派發器、SESSION-LOG、WAIT_USER、data-files、inbox 入口與適用 world-pillars 子檔；用 tabledb 查人物索引與年表（load 後只取 meta.entries 的篩選唯讀視圖）。

## 做了什麼

依 bf-deep-05 新增七位人物、兩個事件、兩處地方，共十一件。逐件摘要與掛點見 [review-rows.json](review-rows.json)，沿用計畫稿的白話與掛點。正文保留每人的站起來瞬間、招牌話；守港駕駛在座艙驅動機甲核心；伊內絲從傷機背引導拘束矢，不新增機型。白汊沿既有同夜，蘆網沿淡水擴張。刑天維持沉睡，的的喀喀空寢刻痕可見光，不預決認主。

只新增 manifest files 的十一個 content 檔，既有檔修改零。未改年表、反向關聯、索引或 manifest；未 commit。每寫完一篇完整正文跑 lore check 並讀 orders，同批引用在開始補正文前已建齊。未使用子代理。

## 產出

內容在隔離 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05`。正文長度 439–488 字；檔名與 id name 段一致。

四份報告：本 REPORT、[review-rows.json](review-rows.json)（十一列，白話均不超過六十字）、[inserts.json](inserts.json)（四列）、[timeline-add.json](timeline-add.json)（一列）。三張表均以 tabledb 寫入、契約 wf-table/1，欄位依交接書。

固定四條驗收證據：

1. `node content/lore/check.ts` 基線 `errors=0 warnings=0`，收尾 `errors=0 warnings=2`。兩條新警告恰為白名單，對應如下；其餘新警告零。基線及逐篇記錄在 `/tmp/cx-bf-deep-05/lore-baseline.log`、`lore-01.log` 至 `lore-11.log`；收尾輸出在 `lore-final.log`。
2. `npm run check` 已跑一次，末行 `OK 0 errors, 10 warnings`；完整輸出 `/tmp/cx-bf-deep-05/check.log`。十條均在未改的既有 content/base/monsters：lancewing-b、mirror-a、nestmother-b、nestmother-c、nestmother-landlord、rotwarden-a、siegebeetle-a、stalk-b、tidewolf-b、tidewolf-c 的 capture layer HP differs，未宣稱全庫無警告。檢查前確認無別的重負載測試。
3. 正式 manifest 基底與 worktree HEAD 同為 `8a48e7ef3e982b278e382d8a166cfc05a8564428`；指定十一新檔齊全，tracked diff 零。開場已有未追蹤 `node_modules` 連結，屬領導預備環境，未改動，不算本批內容產物。
4. 已讀清單逐路徑列齊；review 十一列、欄位與長度合格，inserts 四列、timeline-add 一列且欄位一致；所有舊檔插入僅列報告。驗收結構輸出在 `/tmp/cx-bf-deep-05/acceptance.log`。

## 沒做到或證據不足的

兩條待合併年表警告按交接書延後處理：

- `WARN events/brasilia-salt-chorus.json: 未出現在 timeline`，對應 `event/brasilia-salt-chorus`。來源：交接書第六件，2107-05、G／F、底色 1.5／1.6；合併資料在 timeline-add 第零列，新增高原回海聲。inserts 不重複加列。
- `WARN events/white-ford-fallen-bridge.json: 未出現在 timeline`，對應 `event/white-ford-fallen-bridge`。來源：交接書第八件、現存年表 `date=2107`、`title=白汊空橋斷後另繫回程索`，實讀定位仍為 entries[161] 且尚無 event。inserts 第零列以 setKey 補 event；timeline-add 不另造同夜。領導合併時依日期與標題重新定位，只補缺鍵。

其餘三筆 inserts 是北美傘 places 加蘆冠岸、費雷羅 relations 加呂克、基多 places 加向曙岸，原值照交接書，尚未套用。

未跑 npm test、content_accept、typecheck、wf-lint 或額外探針，依本交接書固定四條與重負載限制，由領導收批處理後續。

## 需要決定的事

本批十一個新名依計畫全部保留提案，content 本文不帶設計層標記；除此未另造具名人物、事件、招式或公司。

1. 喬・馬洛（提案）：`character/jo-marlow`。
2. 安・貝勒羅斯（提案）：`character/anne-bellerose`。
3. 露絲・阿蘭達（提案）：`character/luz-aranda`。
4. 伊內絲・維達爾（提案）：`character/ines-vidal`。
5. 達維・莫拉（提案）：`character/davi-moura`。
6. 高原回海聲（提案）：`event/brasilia-salt-chorus`。
7. 米拉・里德（提案）：`character/mila-reed`。
8. 白汊斷橋夜（提案）：`event/white-ford-fallen-bridge`。
9. 白汊蘆冠岸（提案）：`place/white-ford-reed-crown`。
10. 呂克・莫蘭（提案）：`character/luc-morin`。
11. 空寢向曙岸（提案）：`place/titicaca-empty-dawn`。

另有一處計畫與遊戲供應時點的差異：安的交接規格要求已駕 NR-03、接雪底留名後續；現存 `content/base/world/models/na-sled-03.json` 卻是 `availableFrom.month=3`，晚於 2108-01 開場。正文依指定既有機型寫、未另造機型或捏造該次護送日期；是否將營運開放理解為玩家供應日期、或調整人物時點，交領導裁定，不改 base。依世界支柱 M11 保留時間推進的疑點。

## 以後交接書該點名的工具

本次點名已足夠：lore check、npm run check、tabledb（年表 meta.entries 唯讀視圖）、inbox_poll、inbox_mail。固定四條到此為止；content_gate 留領導執行。

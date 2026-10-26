# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/before-collapse.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`
- `content/lore/factions/nairobi.json`
- `content/lore/factions/accra.json`
- `content/lore/factions/green-line.json`
- `content/lore/places/lagos-blight.json`
- `content/lore/places/rift-valley-seat.json`
- `content/lore/events/green-line-purge.json`
- `content/lore/events/lagos-night.json`
- `content/lore/factions/league.json`
- `content/lore/factions/remnant-wings.json`
- `wf/workflows/dispatch/handoffs/lead-fill-af/cx-af-01.md`

頂層 AGENTS 親自讀自 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；交接書親自讀自 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-af/cx-af-01.md`。其餘指定檔均讀 worktree 版本；history-lines 已讀「框架」與「崩年的底色」。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、inbox README／PROTOCOL、data-files 與相關 world-pillars 子檔，terms-rename 以 tabledb 查用語。

## 做了什麼

cx-af-01／teams/fill-af 依序寫四勢力、五地點、五事件；既有 lore 與 timeline.json 未寫入。每次寫完內容檔都跑 lore check、讀 orders。逐檔白話與掛點另見 [review-add.json](review-add.json)，以下為交付導航。

- [factions/sub-saharan-umbrella.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/factions/sub-saharan-umbrella.json)：港口、獸與深井接成傘（N05、N09；G；底色 1.1、1.2）。
- [factions/north-africa-umbrella.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/factions/north-africa-umbrella.json)：水務救援長成聯盟（N03、N06；G；底色 1.4、1.6）。
- [factions/west-asia-umbrella.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/factions/west-asia-umbrella.json)：通行費養守備，破約留下裂痕（N10；G；底色 1.6）。
- [factions/yoke-saddle-works.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/factions/yoke-saddle-works.json)：拘束件與騎手一起出海（N05；B、C、G；2094、2095、2103）。
- [places/aswan.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/places/aswan.json)：守閘的人握住糧路（N03；G；底色 1.4）。
- [places/hormuz.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/places/hormuz.json)：收費港保留燃夜免過路的船單（G；2096 燃夜）。
- [places/gold-reef.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/places/gold-reef.json)：地熱與墟出精粹共用井口（N05；A、G；2100 成傘）。
- [places/suez.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/places/suez.json)：兩傘借獵牌評等排護航（N09；G；2106 獵牌法）。
- [places/twin-rivers.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/places/twin-rivers.json)：斷橋成線，渡船兩邊過哨（N10；G；底色 1.6）。
- [events/aswan-sluice-night.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/events/aswan-sluice-night.json)：淹田困獸，退潮才活下來（N01、N03；G；2091 年表增列）。
- [events/hormuz-burning-night.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/events/hormuz-burning-night.json)：燒舊油，以通行權換援軍（G；2096 年表增列）。
- [events/gold-reef-night.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/events/gold-reef-night.json)：塌井得墟，當班者未歸（N05；A、G；與拉哥斯同年，不入年表）。
- [events/twin-rivers-night.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/events/twin-rivers-night.json)：趁打獸炸橋，兩邊都失去通路（N10；G；2100 年表增列）。
- [events/suez-canal-night.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/events/suez-canal-night.json)：爭護航沉船後改共用信用評等（N09；G；2106 年表增列）。


## 產出

新增 lore 恰為 14 檔（4 勢力、5 地點、5 事件），body 為 497–822 字，未觸發 1500 字容量或 14 檔件數停止閘門。沒有新增具名人物，也沒有另取規格外專名；本批新詞就是交接書指定的三傘、軛鞍行、五地點、五事件與燃夜名冊等用語。未派子代理，子代理成本為零；文字與檢查均由本線親自完成，未取得平台 token／金額帳單。

年表交 [timeline-add.json](timeline-add.json)：5 筆，2091 放閘夜、2096 燃夜、2100 斷橋夜、2100 撒南傘成立、2106 運河夜。撒南傘成立無 event，金山夜沒有年表條目。白話交 [review-add.json](review-add.json)：14 列，每列不超過 60 字。

固定驗收證據：

1. 第 14 檔寫完的 `node content/lore/check.ts` 末行 `errors=0 warnings=7`。既有警告為 busan-returned-seal、dark-quay-surety；新增 5 則為 aswan-sluice-night、hormuz-burning-night、gold-reef-night、twin-rivers-night、suez-canal-night 未出現在 timeline，沒有其餘新增警告。
2. 全部內容與兩份增列檔寫完後，`npm run check` 執行一次，exit 0，末行 `OK 0 errors, 8 warnings`；8 則是 content/base 的 capture layer HP differs 警告。本線未改 content/base。
3. 固定第 3 條：PASS；lore 新檔恰為 14 檔、各檔名皆等於 id name 段；timeline-add.json 合法且 5 筆；review-add.json 合法且 14 列，白話最長 35 字。
4. 本 REPORT 開頭為「已讀清單」。

逐檔 lore check 原始輸出在 `/tmp/cx-af-01/`，最後一次為 `/tmp/cx-af-01/14-suez-canal-night-lore-check.log`；通用 check 證據為 `/tmp/cx-af-01/npm-run-check.log`。前期引用本批尚未建立的同伴檔，曾報不存在，已隨指定建檔次序消失。

## 沒做到、或證據不足的部分

無未完成的授權工作。依交接書固定四條驗收，沒有跑 npm test、content_accept、wf-lint 或其他驗收；沒有更新索引、manifest、既有年表，也沒有 commit。領導仍須自行帶回內容與插入年表；本線未代作。

## 需要決定的事

敘事沒有發現必須推翻既有 lore 或裁示的矛盾，以下兩個格式差異已按既有檔與固定 warning 上限處理，無需阻塞交付。

- `content/lore/README.md` 通用表稱 place 有 aka，但 `content/lore/check.ts` 的 place 欄位表不接受；本批最初的空 aka 造成 5 則未登記欄位警告，已只從本批地點移除，各次修正後重跑 lore check。既有地點也未使用此欄，未改契約或檢查器。
- 交接書寫 gameRefs 一律空陣列，README 又明列 event 無 gameRefs，檢查器也不接受 event.gameRefs。本批 4 勢力與 5 地點均為 []，5 事件依 event 格式省略此欄，以滿足 warnings 不增加。未自加欄位。

運河輪值且兩傘分費採交接書的提案讀法，已同時寫入兩傘、地點、事件與年表增列供領導／使用者審敘事；雙籤城只寫已裁示的日常行政歸撒南傘，沒有補定未決的跨傘權責。金山深門、軛鞍行收養裂子體均只在 secrets 標 rumor。

## 以後交接書該點名的工具

本次所需工具已足：lore check、npm run check、inbox_mail.sh、inbox_poll.sh；另建議明列 tabledb.py，讓白話資料列照專案資料契約讀寫。事件是否有 gameRefs、地點是否有 aka，應在未來交接書對齊檢查器，避免產生可預見的未登記欄位警告。

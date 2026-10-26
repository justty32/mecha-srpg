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
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/dispatch/handoffs/lead-aegir/ag-03/plan.md`
- `wf/workflows/dispatch/handoffs/lead-aegir/cx-ag-03.md`

cx-ag-03 親讀主 repo 的 AGENTS.md、交接書與計畫；其餘上述文件及交接書點名的四地、四事件、兩人物均親讀工作樹版本。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、inbox README／PROTOCOL、world-pillars/world 及其三子檔，以 tabledb 查定案用語與 review 草稿。交接書的允許路徑與固定四條驗收優先，未改共享進度檔或其他管理檔。

## 做了什麼

已在隔離工作樹完成四人物、三事件與三檔純插入，內容異動共十檔。七件均為 public；人物皆為 human、英文原名置於 aka、gameRefs 為空，並在 body 明列 2108-01 狀態。

`content/lore/characters/lena-visser.json`：從解糧駁纜繩寫到留下管糧、接船，連茉莉與鹽婆；掛 N01→N03／G、副 F／1.4、1.5、1.8。

`content/lore/characters/claire-renaud.json`：寫搬正冊、暫緩爭議土地抵押、核名冊與送徵召令，連瑪塔；掛 N03→N06→N09／G、D／1.6、1.7。

`content/lore/characters/oskar-lind.json`：寫第一張標單的逐項議價、照錄獵牌評等與兩邊收費，連奧爾森及茉莉；掛 N03→N08／G／1.6、1.12、1.13。

`content/lore/characters/marta-bellini.json`：寫受雇總匠核款、缺章停貨及九門消息到港後的修理單，連雷諾；掛 N06 前史→N09／D、G／1.6、1.7，九門僅作群像。

`content/lore/events/rotterdam-breach.json`：寫 2089-04 堤防失修、撤低倉及轉糧，留下半沉碼頭；掛 N01→N03／G、F／第一次蝕潮→鹽鷗成軍／1.4、1.5、1.8。

`content/lore/events/inland-registers.json`：寫 2093-08 法國布列塔尼沿海正冊內移、副本留港及國庫產權核定；掛 N03→N06／G／防線私有化→新加坡會議／1.5、1.6。

`content/lore/events/coastal-mortgage.json`：寫 2099-10 國庫空城地契抵押、塞勒涅窗口與熱那亞交貨，返鄉繼承未定勝負；掛 N06 前史→N09／D、G、副 F／1.5、1.6、1.7。

`content/lore/timeline.json`：三條照計畫原定摘要、日期、era、factions、tags 與 public 插入，分別在鐵翼之月後、殘翼航空開業後、全部 2099 年條目後；掛三事件及其年表。

`content/lore/characters/molly-van-den-berg.json`：relations 尾端只加莉娜的「港務舊同事」一列及一句 note；掛鹿特丹港務→鹽鷗返港。

`content/lore/events/first-bid-sheet.json`：characters 只加奧斯卡一項；掛 N03→N08／G／公會議價席。

三個既有檔已與 HEAD 比較：移除新增元素後，所有原欄位與原元素均一致；文字 diff 也只涉及允許的插入。開場已有的未追蹤 node_modules 維持原狀，工作樹未留下筆記或額外產物。

通讀七件後，將遊戲說明式的「開場」移出敘述，收短抽象句，補明轉糧動作與冬月狀態。七件 body 分別為 516、570、533、560、529、559、589 字元，均低於 1500。

未派子代理，子代理成本為零；本線實際 token／費用未由執行環境提供，未推估。品質控制採親讀計畫、七件通讀潤飾與交接指定檢查，未另開審查線。

## 產出（檔案路徑 / commit / 分支）

內容根目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-03/content/lore/`，只含上列十檔內容異動，未 commit。

Review：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-03/review.json`。從草稿七件定稿，以指定 tabledb add 逐列寫入；每列白話一至兩句、均不超過六十字，並列節點、主線、年表或底色掛點。

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-03/REPORT.md`。

固定四條驗收：

1. `node content/lore/check.ts`：改前與定稿皆 `errors=0 warnings=8`，每次完成檔案／配套年表及潤飾後均檢查；七新檔未增加警告。既有八警告為五個地點 aka 與三件既有事件未列年表。
2. `npm run check`：全部完成後跑一次，退出碼 0，末行 `OK 0 errors, 8 warnings`；前段 loader 為 `OK 0 errors, 12 warnings`。
3. 七個新檔均存在且檔名對應 id 的 name 段；review.json 為合法 wf-table/1，共七列。
4. 本 REPORT 存在，第一行為「已讀清單」。

## 沒做到、或證據不足的部分

授權範圍內無未完成事項。交接書排除的 body 補句、credit-accord 等建議插入未施作；未跑 npm test 或其他開發驗收。

## 需要對方或使用者決定的事

本批無新增矛盾或待裁示事項。沿用已審計畫：國家無 faction id 以 null／空陣列承載，塞勒涅僅為月面資金窗口；家族與富豪維持群像，未新增其姓氏、家主、認主者或機型怪獸。

計畫第八節既有疑點留上游：火併的 2105／2106 年代差、舊長槍與通用系列的先後、first-hunting-bands 日期精度與伊爾瑟入團年。本批只引停火結果，不新增相關年份或改既有資料。九門僅作 G 線群像，未硬掛 N09。

## 以後交接書該點名的工具

沿用本次點名的 lore check、npm run check、tabledb add、inbox_poll 與 inbox_mail 即可。人物與事件互引、事件與年表配套宜按相依順序落檔；本次先寫人物，再同一步補事件及年表，最後補人物事件連結，所有逐檔檢查維持零錯與原警告數。筆記與逐次檢查紀錄置於 `/tmp/cx-ag-03/`。

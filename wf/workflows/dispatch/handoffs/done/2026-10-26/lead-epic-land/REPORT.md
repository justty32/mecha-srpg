# lead-epic-land 收線報告（2026-10-26）

[handoffs](../README.md)｜依據 [plan-epic REPORT](../plan-epic/REPORT.md)、[v2](../plan-epic/REPORT-v2.md)、[v3](../plan-epic/v3.md)

> 由頂層代存（harness 擋子 agent 寫報告檔）。

## 結論

裁示七項全部落地到設定筆記與 lore，裁示內容標「已定」；自由城市、黑幫城市的成因、數量、對玩家規則是本線提案，待使用者看過。

**commit 註記**：`8f5f6e5` 標題是頂層的 lead-tide-cal REPORT 更正，但頂層 `git commit` 時未限定路徑，誤把本線已 stage 的 12 個 lore 檔與 manifest 一起帶入（錯在頂層，不是 Sonnet 線）。內容經本線核對無誤，未改寫歷史。

## 驗收

- `node content/lore/check.ts` 0 錯 2 警告（舊有兩則事件未進 timeline）；`npm test` 958/958；`npm run check` 0 錯 8 警告；`npm run typecheck` 0；`wf-lint --strict` 全 0；lore 批次 el-01 閘門第 1 輪 ACCEPT。
- commit：`30845e9`（開線）、`8f5f6e5`（誤帶 lore 12 檔與 manifest）、`cd7f160`（索引、交接書、驗收紀錄）、`97d6862`（設定筆記 25 檔）、`dad600a`（收線）。

## 逐項落點（design-notes/world 下）

1. 崩年前的世界：拆三檔 `before-collapse.md`（基線）、`before-collapse-powers.md`（各國崩年前後）、`magnates.md`（巨頭七類、穹頂下的錢、塞勒涅量級），已登記於 `world.md`。
2. 國家縮而不死／塞勒涅管家／死人的債：新檔 `polity.md`（三層、債歸國庫、地契抵押、空城）；`history-lines.md` 2 處（碎國釋義、北美傘）、`lines.md` D 線 1 處；子 agent 改 37 處（八篇 a、b、d、f、g 共 18、三張 json 共 16、specs/world 三檔各 1）；另補 `setting.md` 聯盟型、`b-ancient` 各 1，lore 3 檔（first-tide、timeline 巴西、selene）。
3. 崩年的底色：`history-lines.md` 框架加一節十三句掛線（依 v3 換兩句＋D 線一句）；為守 8 KB 把「八條線」「2026-10-24 裁示」兩段搬到 `history-lines/lines.md`、`rulings.md`。
4. 空城、2089–2092 出生斷層寫進 `polity.md` 與底色；前史五處收回：lore 6 檔＋timeline 1 條、a／f 兩篇、nodes、lines json、timeline json、`great-tide` N10 影像句、`ruins-and-ancient` 2 處。
5. 中國君主立憲（`powers`；lore 4 檔補朝廷；b、g 兩篇；朝名年號未取）、日傘 AI 守牆／撒南輸出駕駛員（`powers`）、地契抵押（`polity`、d-moon、f-rift、N09）、巨頭七類＋塞勒涅巨頭之一＋公司城（`magnates`、`polity`）、美國沒縮拒用傘字（`powers`、`history-lines.md`、specs/world README、g-umbrella）、`old-world.json` 六十億→九十億 2 處。
6. 自由城市、黑幫城市：新檔 `city-types.md`，`polity` 加總覽；含成因、與三層／公司城／蝕匪邦／殘聯例外咬合、數量級（約 20／約 10）、分布、契約、補給、法律、獵牌效力；無新增具名城市。
7. 埃吉爾：新檔 `aegir.md` 記定案方向；lore 2 處與 b-ancient 補「至今無人能認」；認主事件與歐傘填充未做。

另：`specs/world/omens.md` 第 17 行迫月改 7.5（210 日）。

## 需要使用者定方向

- 自由城市約 20、黑幫城市約 10；國家型傘（中、俄、北美）與日、韓境內無自由城市；黑幫城市不認獵牌評等、白手套催收權管不到——提案，是否轉已定？
- 既有地點歸類：吉大港拆船城卡在自由／黑幫之間；環線商隊是自由城市原型，要否升正式類型？目前皆未改歸屬。
- N06「到場的是各區代表」與子 agent 補的「各國集體承認到不了海岸」並列，是否統一為「各區代表畫線＝國家集體承認」？
- 夸父與刑天關係註記「一個追到天上」改為「一個一路在追」（本線自加潤飾，配合前史收回）。

## 下一步可開

埃吉爾認主事件與歐傘填充、崩年後續的填充層、城邦類型欄（engine-backlog）。

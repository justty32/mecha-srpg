# engine-backlog — 非 codex 的工作（引擎、AI、平衡、規則、效能）

[handoffs](README.md)｜交棒 [STATE](STATE.md)｜下次整理 [next-tidy](next-tidy.md)

2026-10-24 段落收尾時從各線 REPORT「剩餘工作／需要決定」彙整去重。**codex 只做新增內容與文字潤飾**；本表是那兩件事以外、要開 Opus 領導線（feature-dev／planning）做的事。已抽到 [engine-backlog.json](engine-backlog.json)（49 列）。

欄位：`序`（建議順序）、`優先`（P1 先做／P2 接著做／P3 有空再做）、`項目`、`來源`（REPORT 連結）、`影響`（不做會怎樣）、`建議做法`、`規模`（小＝一條 codex 工人、中＝一位領導帶 1–3 工人、大＝多段切線）。查法見資料檔說明。

統計：P1 6 列、P2 21 列、P3 21 列（第 25 列鐵劍 models 為 2026-10-24 pilot 收線後追加；第 26–27 列 lead-content 追加；後續列陸續追加，第 36 列為認主機率依潮勢加權、第 37 列為新裂縫海岸優先；第 38–45 列為 lead-settle 追加：tide-sky 五題定案後的天象引擎 38–43、intrigue 五件事 44、lore 隱藏真相標記 45；第 46–48 列為 lead-pilot-essence 追加；2026-10-25 talk-decide 定案後：第 30 列改為「機甲核心與座艙狀態」並併入 35、46，47 人帶能力、48 驅動時數與老化改為已定案可評估，新增 49 AI 醒成機魂；45 與勢力草稿 `ancientMech` 合一，38 補大潮全球同一時刻）。

## 怎麼排

- **P1 先做兩條並行**：方格大地圖實作（大，獨佔 `src/ops/` 大半，自成一線）；戰鬥／營運後期調校（玩家首輪撤退、anchored、出戰數減半，三項都動 `src/ai/intent.ts`，合成一線，量測工具在 lead-tune-battle 目錄）。第二年經濟要等大地圖蝕塊落地後在格上重調；`part:undefined` 是小修，可掛在任一線。
- **P2 引擎缺欄**多數會擋 codex 內容批次的「填了會不會生效」：`nameEn`／`etymology` 擋英文原名命名表批次，passive／molt／territorial／barks／獸緣殼緣擋對應內容；排批次時先查本表與 [codex-handover](codex-handover.md) 的生效表，缺欄未落地的內容先不派；補欄前英文原名放批次 manifest，不放 `aka`。
- **古代機等級無上限**是本段落新裁示（design-notes mechs 末段），spec 已改寫，表示法要規劃線先定。
- 人類遭遇偏難與 timeout 情境要改**既有數值**，不屬 codex 的兩件事，歸平衡線。
- **talk-decide 定案的引擎線（2026-10-25）**：第 30 列（核心與座艙，合併 35／46，小–中、改後黃金重產）可先派；47（人帶能力欄位與合併，小）、48（驅動時數與外貌年齡，小）、49（AI 醒成機魂，小）接在 30 之後同一條線或各一條 codex 小線。數值都是暫值，放 `rules` 參數。

## 交接

- 開線照 [dispatch](../README.md)：切線按明列路徑、交接書過 `brief_lint --strict`；完成一列就從 json 刪掉或在 `項目` 前標「已完成」並附 commit。
- 新冒出的非 codex 工作追加到 json，不寫回各 REPORT。

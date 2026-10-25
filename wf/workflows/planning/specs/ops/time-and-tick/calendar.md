# time-and-tick／calendar — 潮候、潮級、蝕曆年與天象（2026-10-26 引擎落地）

[time-and-tick](../time-and-tick.md)｜設計來源 [design-notes/tide-sky](../../../design-notes/tide-sky.md)｜世界觀 [world/omens](../../world/omens.md)

程式：`clock(day)` 在 `src/ops/state/clock.ts`，`stage`／`tide`／`omens` 純函式在 `state/omens.ts`。

**calendar.json**：`monthsPerYear`（13）、`epochMonth`（開局 month 0 是蝕曆元年起第幾蝕月，base 247＝開局在蝕曆二十年）、選填 `stageWindow`（潮前／退潮各幾日，預設 3）。舊的 `special` 特殊日欄已取消，由天象 kind `omens/` 取代（check 遇到 `special` 報錯）。

**天象**：每條 `world/omens/<名>.json` 是一個時間窗——`cycle:{periodMonths, offsetDays, durationDays}` 相位自蝕曆元年第一日起算、`at:[{month, dom}]` 是排定型（month 為開局後第幾蝕月）、`emerge:{requires, layer, min}` 是只在漲潮日判定的湧現型；`tideDelta`／`setTide` 只在漲潮日改潮級（delta 相加上限 3，`setTide` 優先、多個取最大，所以連珠 4 壓過枯潮 1、枯潮壓過迫月）；`effects` 是 OmenEffect 八類（tide、spawn、blight、unitEffect、ops、event、rule、faction，形狀見 design-notes/tide-sky 的 omen-effects），**目前引擎只載入與驗證、不執行**（engine-backlog 39–42）。

**base 內容**：排定連珠潮在開局後第 40 蝕月初一一次，之後只靠湧現（迫月＋≥3 個星候）；check 驗週期是整日數、窗長、排定日、湧現引用，以及帶潮級修正的窗至少涵蓋一個漲潮日。

**對內容暴露**：ref `calendar.tide`／`calendar.year`（`calendar.stage` 是字串，用 tag）、tag `tide:<stage>`、每個進行中天象掛旗 `omen:<名>`（同時是 tag），事件／契約／行動牌的 `when` 直接寫 `{"tag":"omen:mars-at-heart"}` 或 `{"cmp":{"a":{"ref":"calendar.tide"},"op":">=","b":3}}`。

**大潮全球同一時刻**（2026-10-25）：潮級是全球一張蝕曆，本地晝潮／夜潮只是文案。

# time-and-tick — 蝕月 28 天、每日結算順序、漲潮與弦月、時間推進政策

[ops README](README.md)｜世界觀來源 [world/rifts-and-territory](../world/rifts-and-territory.md)、[world/operations](../world/operations.md)｜裂縫狀態機在 [data-model-world-map](data-model-world-map.md)｜移動與遭遇在 [world-grid](world-grid/README.md)

裁示：一局時長不限；營運層一天一 tick、二十八天一蝕月、第 1 與 15 天漲潮、第 7 與 21 天弦月、一場戰鬥不占營運時間、認主只在漲潮之夜（world 暫定裁示）。**2026-10-24 晚改名**：每月兩次的朔望叫「漲潮」（原稱大潮，識別字 `spring` 不改；UI 顯示字串改字見 engine-backlog 第 31 列）；「大潮」改指撞上迫月的少數漲潮（末日級、每年兩三次），潮勢分級見 design-notes/tide-sky。BB 的日結順序問題（OPS-02／DAT-12／DAT-13）在此用「先算全團、再按政策分配、跳轉逐日補算」回答。

## 曆 Calendar

```ts
type Clock = { day: number /*自開局起 0..*/; month: number /*floor(day/28)*/; dom: number /*1..28*/;
  phase: "spring" | "neap" | "ordinary";                 // 舊三分：漲潮（dom 1、15）、弦月（7、21）
  stage: "rising" | "spring" | "ebb" | "neap" | "slack"; // 潮候五段
  tide: number; year: number };                          // 潮級 0–4、蝕曆年（元年＝1）
```

曆是純函式 `clock(day)`（`src/ops/state/clock.ts`）；內容包 `calendar.json` 定週期（`monthsPerYear`、`epochMonth`），程式不寫死 28；舊 `special` 特殊日已由天象 kind `omens/` 取代。潮候、潮級、天象窗、旗與 tag 的規則見子檔 [time-and-tick/calendar](time-and-tick/calendar.md)。**時間只由玩家推進**：`等 N`、航行、探勘、渡輪都換算成 N 個 `tick()`；離線時世界靜止（單機回合制，OPS-20 的答案）。戰鬥發生在某一天之內，結束後當天繼續，不耗 tick。

## 一個 tick 的結算順序（固定、可測）

見 [每日結算與航行](time-and-tick/daily-sequence.md#一個-tick-的結算順序固定可測)：八段結算順序、逐日補算與航行時間。

## 航行與蝕月

見 [每日結算與航行](time-and-tick/daily-sequence.md#航行與蝕月)。

## 漲潮日的特別事項

漲潮日段 2 會：(a) 每個 `anchored` 裂縫從蝕域邊緣長出 `1 + floor(anchorAge/2)` 個蝕塊、`anchorAge++`；(b) `unanchored` 無守軍 → 回 `anchored`、`fedCount++`（養裂）；有守軍（玩家接了 `seal` 契約並在當天勝）→ `sealing`；(c) `sealing` 守第二次 → `sealed`；(d) 以蝕壓抽新裂縫；(e) 漲潮之夜：`dormant` 古代機可被 `喚`；蟲族 `brood`；異形蝕浸判定（船停在蝕化格或與 `anchored` 核相鄰才回活性）；族別維持 `sustainDue` 重設；蟲族裂縫放出 `swarm` 行動者出巢（野地事件表切換成「漲潮版」兩天）。所以漲潮當天出門是收成也是災難，前一天是備戰。弦月：渡輪開船、市場與招募刷新、世界最安靜（事件表凶險檔 −1）。

## 長程時鐘的量級（寫在內容包，這裡只給尺）

見 [長程時鐘與時間政策](time-and-tick/long-term-policy.md#長程時鐘的量級寫在內容包這裡只給尺)：長程時鐘量級與時間推進的設計決定。

## 終局

沒有勝利終點（SS／SSS 是後期背景版、目前不做設定，2026-10-25 裁示）。結束條件兩個：名冊上駕駛員為零（**機魂算駕駛員**：名冊上還有機魂就不算零，2026-10-25 裁示；`CampaignEnd {reason:"no-pilots"}`，日終檢查）、或 `cash` 低於 `−(debt×k)` 且塞勒涅催收事件鏈走到底（船被扣押）。兩者都寫 `CampaignEnd` 事件，存檔保留可讀。

## 替使用者做掉的決定

見 [長程時鐘與時間政策](time-and-tick/long-term-policy.md#替使用者做掉的決定)。

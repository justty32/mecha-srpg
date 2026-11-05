# 第 3 項：無情報時往敵方部署區分散搜索

[總計畫](../ai-retreat-search-1105.md)

## 現行程式

- `src/ai/knowledge.ts:16-28 pursuitCells`：可見敵人 → `lastSeen`（TTL 3 輪）→ **地圖中央一格**。消費者：`src/ai/policies/tactical.ts:23`（候選站位排序）、`src/ai/score.ts:189-195`（move 評分 `reposition × 距離縮短`）、`src/ai/policies/berserk.ts:56`。`sentinel`（`maxMoves:0`）、`swarm`（跟母體）、`regroup`、`flee` 不受影響。
- 到中央後 `nearest(actor.pos) − nearest(destination)` 為 0，move 沒正分 → 原地停住；鐮肢感知 6、蝕蟲 4，被射也不會知道射手在哪（感知只算距離，`knowledge.ts:39-40`）。
- AI 拿不到部署區：`BattleSetup.map` 沒 `deployZones`（第 2 項補）。
- 意圖：`src/ai/intent.ts:56-69 inferIntent`；守區型＝`guardNest`／`hold`／`survive`／`escort`／`reachExit`。

## 設計

`knowledge.ts` 的 `pursuitCells` 改名 `searchCells`（舊名保留 re-export 一輪），第三層換成：

1. **不搜的情況**：陣營意圖屬守區型（待拍板 4：`survive` 算）、單位 `intentMode` 為 gather／regroup／retreat、`view.rt.deployZones` 缺敵對 slot 的區、或 `params.search === 0` → 回 `[actor.pos]`（進度 0，等同原地待命，不再被中央吸過去）。
2. **搜索航點**：敵對 slot（`isHostileSlot`）的 `deployZones` 格合併排序為候選；本方可動單位依 id 排序取序號 `i`，分到候選第 `floor(i × n / k)` 格（n 候選、k 單位），相鄰序號至少隔 `searchSpread`（預設 2）格，否則往後挪——整隊沿部署區橫向展開而非擠一格。
航點更替與適用範圍：

3. **已到過就換下一站**：若 `distance(actor, 航點) <= perception(actor)` 視為搜過，航點列表依序：分配的敵方部署格 → 地圖中央 → 己方部署區最遠格；全部搜過回 `[actor.pos]`。無狀態、純函式、決定性（不用 rng）。
4. 怪獸與機甲同一套（待拍板 5）：族 `aiProfile` 可用 `search: 0` 關掉；`nest`／`anchored`／`immobile` 本來 `mobile()` 為 false。

參數（進 `src/ai/score.ts` 或 `knowledge.ts` 的 DEFAULTS，aiprofile `params` 可覆寫）：`search: 1`、`searchSpread: 2`。

`danger` 圖仍然扣分，搜索不會無視已知火線。

## spec 草稿（`specs/core/ai.md`「知識模型」段末）

> **無情報搜索**（2026-11-05）：候選站位與移動評分的追擊目標依序取可見敵人 → `lastSeen` → **搜索航點**：敵對陣營的 `deployZones`（經 setup 帶進 `rt.deployZones`）按本方單位序號分散分配（`searchSpread` 最小間距），單位進入感知半徑即視為搜過，依序換中央、己方部署區遠端；守區型意圖（guardNest／hold／survive／escort／reachExit）、gather／regroup／retreat 模式、無部署區資料或 `search=0` 時不搜索、原地待命。被擊中不揭露射手（維持感知聯集語意）。

## 測試

- `test/ai/knowledge.test.ts` 新增：(1) 無情報且有敵方 deployZones → 回敵方部署格，不讀 `s.units` 真實位置；(2) 三台同陣營分到不同格且間距≥2；(3) 已在感知內 → 換中央；(4) 守區型意圖回自身位置；(5) 無 deployZones 回中央（相容舊 stub）。
- 現有要改：`test/ai/gaps-fixes.test.ts:28`「無情報才回中央」→ 改成「無部署區才回中央、有部署區走搜索」；`test/ai/balance.test.ts:41`「未接敵會朝中央偵察」→ 用有 deployZones 的 stub 驗朝部署區；`test/ai/policies.test.ts:72` berserk 探索仍成立（stub 無 deployZones 不變）。
- `test/ai/stub-rules.ts` `StubBattle` 加 `deployZones?`。
- 整合：`test/ai/integration.test.ts` 或新 smoke——skirmish-20 兩隊各 3 台、感知 4、全 AI 10 輪內必有接敵（`Hit`／`Miss` 事件≥1）。

## 黃金影響

戰鬥黃金不變；營運黃金必變（與第 1、2 項合併重錄）。`test/ai/demo-duration`、`src/ops/sim/health.test.ts` 可能因接敵變早而變動。

## 驗證

battle_auto cx3-flyingfish-shoal seed 1–5（基線 0/5、6–10 輪敗：看敵方是否提前接敵、我方勝負與 rounds）；exm-crossline／exp-four-choices／exp-unfinished-ties seed 1–5（接敵輪次＝首個 Hit／Miss 的 round，應不晚於基線）；exk-four-corners seed 1–5（敵方 survive 意圖不搜索，應守在部署區附近，不再走到地圖中央）。

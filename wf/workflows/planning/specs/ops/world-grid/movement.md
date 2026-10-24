# movement — 船的移動：移動點、尋路、速度、與 tick 的銜接、中途停下與改道、燃料、徒步與月面

[world-grid README](README.md)｜地形成本在 [map-and-terrain](map-and-terrain.md)（`terrain-layers.json`）｜tick 八段在 [time-and-tick](../time-and-tick.md)

## 移動點 MP 與速度

每個行動者每天拿一份移動點 `mp`，進一格扣該格地形的成本（船查 `air_cost`、地面部隊查 `ground_cost`），**八方向**，斜走成本 ×1.4 取整。船基準 `mp = 100`／天、平野與潮海成本 10 → 一天 10 格、山脊 14、雲嶂 25、淺蝕 12、深蝕 20、核 25。修正全是乘數、由資料宣告：船體 `hull < 50%` ×0.75、超載不能起航、載重接近上限 ×0.9、大潮日 ×0.9（潮光擾動）、弦月 ×1.1、月面 ×1.5（低重力，但只能租月面車）、升級部件（「浮芯二環」+20%）。所以長陸 250 格橫跨約 25–30 天：**橫跨一洲一潮月**的量級保住。地面部隊 `mp = 60`：平野 10 → 6 格／天、道上成本折半 → 12 格／天；裂獸群依族 40–80。

## 尋路

`findPath(map, from, to, mover) → { cells: Cell[]; cost: number; days: number }`，A\*、八方向、啟發式用八方向距離（admissible，min cost×距離），不可進格（`-`）跳過；同成本以 `(y, x)` 字典序 tie-break 保決定性。`days = ceil(cost / mp)`，另加每格遭遇風險的加總供 UI 預告。深蝕對船**可進但貴**（成本 20、每天強制擲遭遇），對地面行動者不可進；核只有船可以飛過（成本 25）。**跨圖**：目標在別張圖時先找「本圖可到的航道口 → 航道 → 目標圖 A\*」最短總天數的組合（航道口通常 ≤ 5 個，窮舉即可），航道那段用 `LaneDef.days`（`departDays` 非空要加等船天數）；回傳的路徑含 `{ lane: Id }` 段。玩家可給 `via` 途經點（格或地點）強制繞路。長陸 37,500 格的 A\* 單次 < 10 ms 量級；AI 行動者只在目標改變時重算。

## 與 tick 的銜接

`sail` 不耗 tick；它只把路徑寫進 `ship.path` 並把 `pendingTicks` 設成估計天數。每個 `tick()` 第 3 段「移動」：(a) 船拿到今天的 `mp`（含修正）；(b) 沿 `path` 逐格扣成本，扣不起下一格就停在當前格、剩餘 `mpCarry` 帶到明天（只在**連續移動**時保留，停船即歸零）；(c) 每進一格更新 `ship.pos`、`knownMap` 視野、檢查接觸（見 actors）；(d) 進到地點 footprint 或路徑終點就 `Arrived`，刪 `path`；(e) 走到航道口若今天不開船就 `Waiting`（停在港，`pendingTicks` 繼續）；航道段每天 `laneDaysLeft−−`，到站把 `pos.map` 換掉。**每一天其餘七段照常跑**：薪水、利息、佇列、拘束器磨損、事件——移動就是用時間買距離。段 4 事件待選、段 3 遭遇待選時 `pendingTicks` 保留、船停在當前格。

```ts
type ShipState = { frame: Id; pos: Loc; path?: { cells: Cell[]; lane?: { id: Id; daysLeft: number }; to: Loc | { actor: Id }; via: Loc[] };
  mpCarry: number; drifting: boolean; rooms: Record<RoomId, RoomState>; capacity: ShipCapacity; fuel: PoolState; hull: PoolState; upgrades: Id[] };
```

## 中途停下、改道、追擊

船隨時（不在航道上時）可下 `dock`（在地點 footprint 內：進城）或 `drift`（在野外：懸停、`path` 刪掉、`pendingTicks = 0`）；下一次 `sail` 從當前格重算。`sail.to` 三種：地點 id、格 `{x,y}`、**行動者 id**（追擊）——目標會動，所以每天第 3 段開頭以目標**目前**位置重算路徑；追上（進入接觸範圍）觸發遭遇；目標速度 ≥ 船的就永遠追不上，UI 要在下令時預告「追得上／追不上／N 天」。`wait N` 在原地等 N 天；航道口等船也是 `wait`。

## 燃料、船體、徒步

燃料按**移動日**扣（`fuelPerDay`，深蝕與核的日子 ×2），不按格——簡單、玩家算得出來；航道按 `LaneDef.fuelPerDay`。燃料不足：路徑預告變紅，起航時拒絕（`insufficient-fuel`），途中耗盡就 `drift` 在當格、事件表切「漂流」（可求救、可被白手套找到）。`hull` 歸零＝船毀：全團變地面行動者（`mp = 40`、只能走 `ground_cost`、深蝕不可進），拖著機甲走到最近城邦；原第一版「只能走 ground 路線」改成這條。月面沒有船：到靜海市後租月面車（地面行動者、`mp = 90`、月壤成本 10），船留在赤道港繼續付泊費。

## 行動者共用

上述 MP／尋路／接觸全部是 `mover` 參數化的純函式，勢力部隊、商隊、裂獸群、別的獵團與船共用；差別只在 `mp`、成本欄、能不能進深蝕、要不要吃燃料（只有船要）。`ForceState.speed`（operations-war）就是 `mp`。

## 替使用者做掉的決定

1. **八方向＋斜走 ×1.4、整數成本**：四方向會讓海岸線航行很醜；浮點會讓重播難對位。
2. **深蝕船可飛過但貴且必擲遭遇**：第一版「深蝕不可通行」留給地面；會飛的船飛過蝕淵是太空歌劇該有的畫面，也讓「硬闖」是選項。
3. **燃料按日不按格**：玩家只需要記「一天幾氦」，省一張表。
4. **剩餘 MP 只在連續移動時帶到明天**：避免「停一下再走」憑空多一段路，也讓「直達 ≤ 分段」可斷言。
5. **追擊＝航向行動者、每天重算**：不加「追」動詞，追不上的事前就告訴玩家。

# Part 5 — 移動範圍與尋路（Dijkstra 距離場）

> 對應原始碼：`movement.py`（玩家操作於 `game_states.py::PlayerTurnState`）。
> 前一章：[part4 回合與 AP](part4_turns_ap.md)　·　下一章：[part6 視野與掩體](part6_fov_cover.md)

## 本章目標
算出「這台機甲這回合走得到哪些格」（移動範圍），並走出一條到目標格的路徑——全用 tcod 的距離場演算法，不自己寫 BFS。

## 1. 為什麼用 Dijkstra 距離場

SRPG 的移動是「成本受限的可達集合」：不同地形移動成本不同（平地 1、樹林/瓦礫/高地 2），單位有移動點上限。`tcod.path.dijkstra2d` 一次就把「從起點到每一格的累積成本」算進整張陣列——一次計算，可同時拿來：
- 篩出 `成本 ≤ move` 的可達格（移動範圍高亮）。
- 之後 AI 趨近也重用同一張距離場（[part8](part8_ai.md)）。

## 2. 成本陣列（SPEC §2 鐵則）

> **`0` = 不可進入（阻擋）；正整數 = 進入該格的移動成本。**

`compute_move_cost_array(battlefield, units, mover)`：
1. 取地形成本（`battlefield.move_cost_array`，`[y, x]`）。
2. 把「除 mover 外的所有存活單位」所在格設為 `0`（不可穿越友軍/敵軍）。
3. mover 自身格保留（起點從距離 0 出發，不需進入成本）。

```python
cost = terrain_cost.copy()
for u in units:
    if u.alive and u is not mover:
        cost[u.y, u.x] = 0     # numpy 索引 [y, x]
```

## 3. 距離場與可達格

```python
import tcod.path, numpy as np

dist = tcod.path.maxarray(cost.shape, dtype=np.int_)  # 全填極大值＝未抵達
dist[sy, sx] = 0                                       # 起點 (注意 [y, x])
tcod.path.dijkstra2d(dist, cost, cardinal=1, diagonal=0, out=dist)
```

- `cardinal=1, diagonal=0`：**四方移動**（上下左右），停用對角，符合多數戰旗手感。
- 可達格：`0 < dist ≤ mover.stats.move`（排除起點、濾掉不可達的極大值）。

```python
ys, xs = np.where((dist > 0) & (dist <= mover.stats.move))
reachable = {(int(x), int(y)): int(dist[y, x]) for y, x in zip(ys, xs)}
```

## 4. 路徑：hillclimb 下坡

`path_to(...)` 以**目標格**為距離場原點，再從 mover 位置 `hillclimb2d` 沿下坡走到目標：

```python
dist = _distance_field(cost, tx, ty)          # 以目標為原點
climbed = tcod.path.hillclimb2d(dist, (sy, sx), cardinal=True, diagonal=False)
path = [(int(x), int(y)) for y, x in climbed.tolist()]  # 轉回 (x, y)，含起點與終點
```

> 為什麼以目標為原點？這樣每格的值＝「到目標的距離」，從起點沿值遞減方向爬，終點必然落在距離 0 的目標格。

## 5. 接上玩家操作

`PlayerTurnState` 的移動模式（按 `M`）：
1. `movement.reachable_tiles(bf, units, mover)` → `engine.move_highlight`（藍底，`ui.highlight_cells`）。
2. 游標移到某高亮格按 `Enter` → `movement.path_to(...)` → `MoveAction(path).perform(engine, unit)`。
3. `MoveAction` 把單位移到路徑終點、扣 1 AP、設 `has_moved`；之後重算我方視野。

```python
path = movement.path_to(eng.battlefield, eng.units, u, tx, ty)
MoveAction(path).perform(eng, u)
```

> 動畫：本起手把單位「瞬移」到終點；要逐格動畫，讓 UI 層讀 `path` 一格一格播放、每格 `present()` 即可。

## 6. 延伸鉤子
- **ZoC（控制區）**：把敵方單位的鄰格成本提高或設阻擋，逼出繞路。
- **不同地形對不同機甲**：飛行單位忽略地形成本——換一張 cost 陣列即可。

## 本章完成後你應該能…
- 用 `dijkstra2d` 算出受地形與友軍阻擋影響的移動範圍並高亮。
- 用 `hillclimb2d` 取出到任一可達格的路徑並執行移動。
- 理解「一次距離場、多處重用」為何適合 SRPG。

下一章 → [part6 視野與掩體](part6_fov_cover.md)

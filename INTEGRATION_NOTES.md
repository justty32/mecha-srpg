# INTEGRATION_NOTES — 待整合的跨模組介面分歧

> 本專案由 10 個並行代理產出。`SPEC.md` 鎖定了模組名／類別名／座標慣例／數值，但**未鎖死每個函式的精確簽名**，導致不同代理對同一介面的呼叫方式分歧。下列為實際發現的不一致（附 `檔案:行號`），**繼續開發前應先統一**。已知後仍可玩：玩家回合走 `game_states.py` 內自洽的呼叫；敵方 AI 因下列分歧目前以 try/except 保護（失敗則該敵跳過），需修。

## 分歧清單

### 1. Action 建構子：資料式 vs 單位式
- `actions.py:85,120,153` 採**資料式**：`MoveAction(path)`、`AttackAction(target, weapon)`、`WaitAction()`，並由 `perform(engine, unit)` 帶入行動者。
- `ai.py:285,293,289` 採**單位式**：`MoveAction(unit, x, y)`、`AttackAction(unit, target, weapon)`、`WaitAction(unit)`。
- **建議**：以 `actions.py` 的資料式為準（與 `perform(engine, unit)` 契約一致）。修 `ai.py`：
  - `MoveAction(unit, x, y)` → 先 `path = movement.path_to(bf, engine.units, unit, x, y)` 再 `MoveAction(path)`。
  - `AttackAction(unit, target, weapon)` → `AttackAction(target, weapon)`。
  - `WaitAction(unit)` → `WaitAction()`。

### 2. `movement.reachable_tiles` 參數數量
- 定義 `movement.py:120`：`reachable_tiles(battlefield, units, mover)`（3 參數）。
- 呼叫 `ai.py:178,320`：`reachable_tiles(bf, unit)`（2 參數，缺 units）。
- **建議**：統一為 3 參數；修 `ai.py` 傳入 `engine.units`。`path_to` 同理為 `path_to(bf, units, mover, tx, ty)`（`movement.py:155`）。

### 3. 訊息日誌 API
- `engine.py:96` 提供 `engine.add_message(text)`；`message_log` 是 `list[str]`。
- `actions.py:109,158,178` 呼叫 `engine.message_log.add(text)`（list 無 `.add`，會 AttributeError）。
- **建議**：把 `actions.py` 內 `engine.message_log.add(` 全改為 `engine.add_message(`。

### 4. FOV 函式名與簽名
- `actions.py:203` 用 `fov.has_line_of_fire(bf, ox,oy,tx,ty)`；`ai.py:200` 用 `fov.line_of_fire(bf, ...)`（名稱不同）。
- `fov.cover_against`：SPEC §的描述為 entity 版 `cover_against(bf, attacker, target)`；`ai.py:195,197` 以**座標**呼叫 `cover_against(bf, x,y, tx,ty)`。
- **建議**：確認 `fov.py` 實際定義，統一為座標版 `has_line_of_fire(bf, ox,oy,tx,ty)` 與 `cover_against(bf, ox,oy, tx,ty)`，並修正各呼叫端。

### 5. combat 輔助函式
- `ai.py:192,215,224,317` 假設 `combat.chebyshev_distance(...)`、`combat.hit_chance(acc, skill, max_range, distance, evasion, cover, heat_penalty)`、`combat.expected_damage(...)`。
- `SPEC.md §4/§7` 的 `hit_chance` 含 `min_range` 與 `max_range` 兩者。
- **建議**：對齊 `combat.py` 實際簽名（讀 `combat.py` 確認），讓 `ai.py` 與 `mtcore.cpp` 三者一致。

### 6. C++ `mtcore` 簽名以實作為準
- `cpp/mtcore.cpp` 的 `hit_chance`/`resolve_damage` 最終簽名以該檔頂部註解為準，需與 `combat.py` 的 `_py_*` 完全一致（part9 教學強調）。

## 一致的部分（可放心沿用）
- `config.Faction` 為單一定義，`entity.py` 轉匯入，全專案共用同一 enum。
- `entity.MechUnit`（structure/heat/ap/alive/reset_turn/end_turn_upkeep/take_damage）介面清楚。
- `turn_manager.TurnManager`（end_turn/units_of/check_victory/has_actionable_units）。
- `procgen.generate_battlefield(...) -> (Battlefield, 玩家部署點, 敵方部署點)`。
- `ui` 的 `Cursor`、`draw_hud`、`draw_cursor`、`highlight_cells`。
- `engine.Engine`（render/handle_event/recompute_fov/add_message/unit_at/player_units/enemy_units）。
- console 採 `order="F"`，像素索引 `[x, y]`；numpy 地圖索引 `[y, x]`。

## 修復後驗收
依 `SPEC.md §12`：`pip install tcod numpy` →（修上述分歧後）`python -m mecha_srpg` 應可部署、移動、攻擊、敵方行動、分出勝負，且未編 C++ 也能跑。

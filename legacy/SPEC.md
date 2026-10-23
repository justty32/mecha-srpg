# SPEC — 回合制機甲戰旗（Mecha Tactics）設計契約

> **這是所有教學與程式碼的唯一真實來源。** 所有檔案的模組名、類別名、函式簽名、座標慣例、數值常數都以本檔為準。任何 agent 產出前必先讀本檔並嚴格對齊，禁止自創不一致的命名。

## 0. 一句話定位
一個**回合制機甲戰術 SRPG**（風格近 Front Mission／Into the Breach／BattleTech）的可運行起手專案 + 分段教學。**Python 為主體**（遊戲流程、UI、資料），**C++ 為核心熱點**（命中/傷害數學、AI 評分、批次視線），透過 **pybind11** 綁回 Python。底層渲染與演算法用 **python-tcod（libtcod）**。

## 1. 技術棧
- Python 3.10+
- `tcod`（python-tcod ≥ 16）：context/console 渲染、event 輸入、`tcod.map.compute_fov`、`tcod.path`（Dijkstra/A*）、`tcod.noise`/heightmap（戰場生成）、`tcod.random`
- `numpy`：所有網格資料（`dtype` 明確）
- C++17 核心模組 `mtcore`：以 **pybind11** + **scikit-build-core**（`pyproject.toml`）建置，CMake 驅動
- 平台：Windows 11 為主（亦應跨平台）

## 2. 座標與網格慣例（鐵則）
- 邏輯座標一律 **`(x, y)`**，x=橫、y=縱，原點左上。
- numpy 陣列一律 **`[y, x]`（row-major）**，與 tcod 一致。建立時 `np.zeros((MAP_H, MAP_W), ...)`。
- 對 `tcod.map.compute_fov`/`tcod.path.dijkstra2d` 傳入的陣列也是 `[y, x]`；座標參數傳 `(x, y)` 時注意 tcod 多以 `(x, y)` 或 ij 索引，**統一在 `battlefield.py` 內封裝吸收差異**，其他模組只用 `(x, y)`。
- 成本陣列語意（鐵則，與 tcod 一致）：**`0` = 不可進入（阻擋）**，**正整數 = 進入該格的移動成本**。

## 3. 套件結構（src/mecha_srpg/）
```
mecha_srpg/
  __init__.py          # 版本與公開匯出
  config.py            # 所有常數：螢幕/地圖尺寸、顏色、地形定義、平衡數值
  rng.py               # 以 tcod.random.Random 包裝的可重現亂數（單例 + 派生）
  components.py        # 純資料：Stats / Weapon / Armor / Pilot
  entity.py            # Entity 基底；MechUnit（機甲單位）
  battlefield.py       # Battlefield：地形網格 + 衍生的透明/成本陣列 + tcod 介接
  procgen.py           # 用 tcod noise/heightmap 生成戰場地形與部署點
  turn_manager.py      # TurnManager：玩家階段/敵方階段、每單位 AP
  movement.py          # 移動範圍（Dijkstra 距離場）、可達集合、路徑
  fov.py               # 視野與射線/掩體（line of fire, cover）
  combat.py            # 命中/傷害結算（呼叫 C++ mtcore，含純 Python fallback）
  actions.py           # Action 階層：MoveAction / AttackAction / WaitAction / OverwatchAction
  ai.py                # HostileAI：敵方戰術 AI（呼叫 mtcore 評分）
  game_states.py       # 狀態機：DeployState / PlayerTurnState / EnemyTurnState / GameOverState
  input_handlers.py    # tcod.event → Action 映射
  ui.py                # HUD、游標 Cursor、單位資訊面板、移動/射程高亮、選單
  engine.py            # Engine：持有全域狀態，驅動 render 與 handle_events
  main.py              # 進入點：建 tcod context/tileset + 主迴圈
```

## 4. C++ 核心（cpp/）
```
cpp/
  CMakeLists.txt       # pybind11_add_module(mtcore mtcore.cpp)
  mtcore.cpp           # pybind11 模組，匯出下列函式
```
`mtcore` 必備 API（Python 端 `combat.py`/`ai.py` 會呼叫；簽名以本契約為準）：
- `mtcore.hit_chance(attacker_acc: int, pilot_skill: int, weapon_range: int, distance: int, target_evasion: int, cover: int, heat_penalty: int) -> float`
  回傳 0.0–1.0 命中率。公式（§7）。
- `mtcore.resolve_damage(weapon_damage: int, target_armor: int, is_rear: bool, roll: float) -> int`
  回傳實際結構傷害（≥0）。
- `mtcore.score_action(my_hp:int, target_hp:int, expected_dmg:float, hit:float, dist_after:int, cover_after:int, in_range:bool) -> float`
  AI 對「移動到某格並攻擊某目標」的候選評分（越高越好）。
- `mtcore.batch_line_of_fire(transparent: numpy.ndarray[bool, (H,W)], ox:int, oy:int, targets: list[tuple[int,int]]) -> list[bool]`
  批次視線查詢（Bresenham），給 AI 一次評估多目標。**Python 端須有 fallback**（用 `tcod.los`/逐線）以便沒編譯 C++ 時仍可跑。

> **漸進原則**：所有呼叫 `mtcore` 之處都要 `try: import mtcore except ImportError:` 後改用 `combat._py_*` 純 Python 版，確保「沒編 C++ 也能玩」，教學再示範把熱點換成 C++ 加速。

## 5. 核心資料模型（components.py / entity.py）
```python
# components.py（用 dataclass）
@dataclass
class Stats:        # 機甲底盤
    max_structure: int   # 結構值（HP）
    armor: int           # 減傷
    move: int            # 每次移動最大步數（移動點）
    evasion: int         # 迴避
    max_heat: int = 100  # 熱量上限

@dataclass
class Weapon:
    name: str
    damage: int
    accuracy: int        # 武器基礎命中
    min_range: int
    max_range: int
    heat: int            # 開火產生熱量
    ap_cost: int = 1

@dataclass
class Pilot:
    name: str
    skill: int           # 加成命中/評估
```
```python
# entity.py
class Entity:            # 戰場上一切佔格物件
    x:int; y:int; char:str; color; name:str; blocks:bool=True
class MechUnit(Entity):  # 機甲單位
    faction: Faction     # Faction.PLAYER / Faction.ENEMY（IntEnum）
    stats: Stats; pilot: Pilot; weapons: list[Weapon]
    structure: int       # 目前結構
    heat: int = 0
    ap: int              # 本回合剩餘行動點（AP）
    has_moved: bool; alive 屬性 = structure > 0
```
- **AP 制**：每單位每回合 `AP_PER_TURN = 2`（§7）。移動消耗 1 AP、攻擊消耗武器 `ap_cost`（預設 1）、Wait 結束該單位。
- `Faction`（IntEnum）：`PLAYER=0`, `ENEMY=1`。

## 6. 地形（config.py）
`TILE` 定義（用 numpy struct 或 dict→id 皆可，但欄位固定）：每種地形有 `walkable:bool`、`transparent:bool`、`move_cost:int`（≥1）、`cover:int`（0/1/2）、`char`、`color`。
| id | 名稱 | walkable | transparent | move_cost | cover |
|----|------|----------|-------------|-----------|-------|
| 0 | PLAIN 平地 | T | T | 1 | 0 |
| 1 | FOREST 樹林 | T | F | 2 | 1 |
| 2 | RUBBLE 瓦礫 | T | T | 2 | 1 |
| 3 | BUILDING 建物 | F | F | 0 | 2 |
| 4 | WATER 水域 | F | T | 0 | 0 |
| 5 | HILL 高地 | T | T | 2 | 1 |
`move_cost=0` 表示不可走（與 §2 成本陣列鐵則一致）。

## 7. 戰鬥與平衡公式（鐵則，C++ 與 Python fallback 必須一致）
- `AP_PER_TURN = 2`
- 命中率（`hit_chance`，回傳 clamp 到 [0.05, 0.95]）：
  ```
  base = weapon.accuracy + pilot.skill
  range_pen = 0 if min_range <= distance <= max_range else 100   # 超出射程幾乎不可能命中
  cover_pen = cover * 20            # 每級掩體 -20%
  evasion_pen = target_evasion
  heat_pen = heat_penalty           # 過熱命中懲罰（見下）
  chance = (base - range_pen - cover_pen - evasion_pen - heat_pen) / 100.0
  clamp(chance, 0.05, 0.95)
  ```
- 過熱：`heat >= max_heat` 時 `OVERHEAT_ACC_PENALTY = 25`（命中 -25），且回合結束受 `OVERHEAT_DAMAGE = 5` 結構傷害；每回合自然散熱 `HEAT_DISSIPATION = 20`。
- 傷害（`resolve_damage`）：`dmg = max(0, weapon.damage - target.armor)`；背後攻擊 `is_rear` 時 `dmg = int(dmg * REAR_MULT)`，`REAR_MULT = 1.5`；`roll < hit_chance` 才命中，否則 0。
- 命中判定流程：先 `hit_chance` → 取 `rng.random()` 比較 → 命中則 `resolve_damage`。

## 8. 顯示與輸入（config.py / ui.py / input_handlers.py）
- `SCREEN_W=80, SCREEN_H=50`；戰場視窗左上，右側/底部留 HUD。
- `MAP_W=40, MAP_H=30`。
- 操作（tcod.event.KeyDown）：方向鍵/WASD 移動游標；`Enter`=選取/確認；`Esc`=取消/選單；`M`=移動模式；`F`=攻擊模式；`Space`=Wait/結束單位；`Tab`=切換我方單位；`E`=結束我方回合。
- 高亮：移動範圍藍色、射程/可攻擊目標紅色、游標黃框。用 console 背景色疊加，不用 ASCII 框線。

## 9. 主迴圈與狀態機（engine.py / game_states.py）
- `Engine` 持有 `battlefield`、`units:list[MechUnit]`、`turn_manager`、`state`、`cursor`、`message_log`。
- 狀態：`DeployState`（部署/開場）→ `PlayerTurnState` ↔ `EnemyTurnState` → `GameOverState`。
- `tcod` 主迴圈：`while True: engine.render(console); context.present(console); for event in tcod.event.wait(): engine.handle_event(event)`。
- 勝負：敵全滅→勝；我方全滅→敗；於 `turn_manager.check_victory()` 判定。

## 10. 命名與風格鐵則
- 全程**繁體中文註解與字串**（程式碼識別字用英文）。
- 每個 .py 檔頂部一段 docstring：用途 + 對應教學 part。
- 程式碼註解標註關鍵 tcod API（如 `# tcod.path.dijkstra2d`）。
- 不畫 ASCII 框線圖（教學 .md 用 Mermaid 或表格）。
- 教學每 part 結尾附「本章完成後你應該能…」與「下一章」。

## 11. 教學分章（docs/）
| 檔案 | 主題 |
|------|------|
| `part0_overview_and_setup.md` | 專案總覽、混合架構、環境與建置（含 C++ 可選） |
| `part1_window_and_loop.md` | 開窗、tileset、console、主迴圈、事件 |
| `part2_battlefield.md` | 戰場網格、地形、procgen 生成、tcod 介接 |
| `part3_units.md` | 機甲資料模型、部署、繪製、游標選取 |
| `part4_turns_ap.md` | 回合制（玩家/敵方階段）、AP、TurnManager |
| `part5_movement.md` | 移動範圍（Dijkstra 距離場）、路徑、移動動畫 |
| `part6_fov_cover.md` | 視野 FOV、射線 line of fire、掩體 cover |
| `part7_combat.md` | 命中/傷害/熱量結算、攻擊行動、訊息日誌 |
| `part8_ai.md` | 敵方戰術 AI（候選評分、趨近/掩體/開火） |
| `part9_cpp_core.md` | 把熱點下沉到 C++：pybind11 + scikit-build + 綁定與加速對比 |
| `part10_ui_winloss.md` | HUD、選單、勝負、存檔、後續延伸 |

## 12. 完成定義（Definition of Done）
- `pip install -e .` 後 `python -m mecha_srpg` 可開窗、部署雙方機甲、玩家可移動+攻擊、敵方 AI 會行動、能分出勝負——**即使未編譯 C++**（走 fallback）。
- 編譯 C++ 後 `mtcore` 自動生效，行為一致、戰鬥/AI 數學由 C++ 計算。
- 教學 11 章可獨立閱讀，程式碼片段與 src/ 一致。

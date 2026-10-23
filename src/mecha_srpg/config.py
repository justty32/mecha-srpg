"""config.py — 全域常數定義（SPEC §6 / §7 / §8）。

用途：集中所有「設計契約」中的常數，包含螢幕／地圖尺寸、顏色（RGB tuple）、
地形 TILE 定義（含 walkable / transparent / move_cost / cover / char / color）、
以及全部戰鬥平衡常數與 Faction(IntEnum)。

對應教學 part：part2_battlefield（地形）、part4_turns_ap、part7_combat（平衡常數）。

座標慣例（SPEC §2）：
- 邏輯座標一律 (x, y)，原點左上。
- numpy 陣列一律 [y, x]（row-major），於 battlefield.py 內封裝吸收差異。
- 成本語意鐵則：0 = 不可進入（阻擋）；正整數 = 進入該格的移動成本。
"""

from __future__ import annotations

from enum import IntEnum
from typing import Dict, NamedTuple, Tuple

# ---------------------------------------------------------------------------
# §8 顯示尺寸
# ---------------------------------------------------------------------------
SCREEN_W: int = 80
SCREEN_H: int = 50

MAP_W: int = 40
MAP_H: int = 30

# ---------------------------------------------------------------------------
# 顏色（RGB tuple，供 tcod console 前景／背景色使用）
# ---------------------------------------------------------------------------
RGB = Tuple[int, int, int]

WHITE: RGB = (255, 255, 255)
BLACK: RGB = (0, 0, 0)
GREY: RGB = (128, 128, 128)
DARK_GREY: RGB = (64, 64, 64)
RED: RGB = (220, 50, 50)
GREEN: RGB = (50, 200, 80)
BLUE: RGB = (60, 120, 220)
YELLOW: RGB = (230, 220, 60)
CYAN: RGB = (80, 200, 220)
ORANGE: RGB = (230, 150, 40)

# UI / 高亮顏色（§8：移動範圍藍、射程紅、游標黃框）
COLOR_MOVE_RANGE: RGB = (40, 60, 120)   # 移動範圍背景（藍）
COLOR_ATTACK_RANGE: RGB = (120, 40, 40)  # 射程背景（紅）
COLOR_CURSOR: RGB = YELLOW               # 游標框（黃）
COLOR_HUD_BG: RGB = (20, 20, 28)
COLOR_PLAYER: RGB = CYAN
COLOR_ENEMY: RGB = RED


# ---------------------------------------------------------------------------
# §1/§5 陣營
# ---------------------------------------------------------------------------
class Faction(IntEnum):
    """陣營：玩家=0、敵方=1（SPEC §5）。"""

    PLAYER = 0
    ENEMY = 1


# ---------------------------------------------------------------------------
# §6 地形定義
# ---------------------------------------------------------------------------
class Tile(NamedTuple):
    """單一地形類型的固定屬性（SPEC §6）。

    欄位：
    - id: 地形數值 id（對應 Battlefield.tiles 中存的值）
    - name: 名稱（識別字英文）
    - walkable: 是否可走（單位能否進入）
    - transparent: 是否透光（影響 FOV / 視線）
    - move_cost: 進入成本（≥1）；0 表示不可走（與 §2 成本鐵則一致）
    - cover: 掩體等級（0/1/2），命中懲罰 cover*20
    - char: 顯示字元
    - color: 前景色 RGB
    """

    id: int
    name: str
    walkable: bool
    transparent: bool
    move_cost: int
    cover: int
    char: str
    color: RGB


# 地形 id 常數（供其他模組以語意名引用）
TILE_PLAIN: int = 0
TILE_FOREST: int = 1
TILE_RUBBLE: int = 2
TILE_BUILDING: int = 3
TILE_WATER: int = 4
TILE_HILL: int = 5

# 地形表（SPEC §6 表格逐列對齊）
TILES: Dict[int, Tile] = {
    TILE_PLAIN: Tile(TILE_PLAIN, "PLAIN", True, True, 1, 0, ".", (90, 110, 70)),
    TILE_FOREST: Tile(TILE_FOREST, "FOREST", True, False, 2, 1, "♣", (40, 130, 50)),
    TILE_RUBBLE: Tile(TILE_RUBBLE, "RUBBLE", True, True, 2, 1, "%", (140, 120, 90)),
    TILE_BUILDING: Tile(TILE_BUILDING, "BUILDING", False, False, 0, 2, "#", (160, 160, 170)),
    TILE_WATER: Tile(TILE_WATER, "WATER", False, True, 0, 0, "~", (40, 80, 160)),
    TILE_HILL: Tile(TILE_HILL, "HILL", True, True, 2, 1, "^", (150, 120, 80)),
}

# 地形 id 數值上限（建立 numpy 地形陣列時可用 dtype 參考）
NUM_TILE_TYPES: int = len(TILES)


def get_tile(tile_id: int) -> Tile:
    """以地形 id 查詢屬性（id→屬性查詢；SPEC §6）。"""
    return TILES[int(tile_id)]


def is_walkable(tile_id: int) -> bool:
    """該地形是否可走。"""
    return TILES[int(tile_id)].walkable


def is_transparent(tile_id: int) -> bool:
    """該地形是否透光（FOV 用）。"""
    return TILES[int(tile_id)].transparent


def tile_move_cost(tile_id: int) -> int:
    """該地形移動成本；0=阻擋（SPEC §2/§6）。"""
    return TILES[int(tile_id)].move_cost


def tile_cover(tile_id: int) -> int:
    """該地形掩體等級（0/1/2）。"""
    return TILES[int(tile_id)].cover


# ---------------------------------------------------------------------------
# §7 戰鬥與平衡常數（鐵則：C++ mtcore 與 Python fallback 必須一致）
# ---------------------------------------------------------------------------
AP_PER_TURN: int = 2          # 每單位每回合行動點

# 命中率 clamp 範圍
HIT_CHANCE_MIN: float = 0.05
HIT_CHANCE_MAX: float = 0.95

# 命中懲罰係數
COVER_PENALTY_PER_LEVEL: int = 20   # 每級掩體 -20（百分點）
RANGE_PENALTY: int = 100            # 超出射程懲罰（幾乎不可能命中）

# 熱量
HEAT_DISSIPATION: int = 20          # 每回合自然散熱
OVERHEAT_ACC_PENALTY: int = 25      # 過熱時命中 -25
OVERHEAT_DAMAGE: int = 5            # 過熱時回合結束受到的結構傷害

# 傷害
REAR_MULT: float = 1.5              # 背後攻擊傷害倍率

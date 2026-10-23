"""battlefield.py — 戰場網格與 tcod 介接（SPEC §2 / §6）。

用途：持有地形 id 的 numpy 陣列 tiles[y, x]，並衍生出 transparent / walkable /
move_cost 陣列供 tcod.map.compute_fov 與 tcod.path.dijkstra2d 使用。
所有 (x, y) 邏輯座標↔numpy [y, x] 索引的差異都吸收在本模組，其他模組只用 (x, y)。

對應教學 part：part2_battlefield（地形與 tcod 介接）、part5_movement、part6_fov_cover。

座標慣例（SPEC §2 鐵則）：
- 邏輯座標 (x, y)，原點左上；numpy 陣列 [y, x]（row-major），與 tcod 一致。
- 成本陣列：0 = 不可進入（阻擋）；正整數 = 進入該格成本。

關鍵 tcod API：
- tcod.map.compute_fov(transparency[y,x], (pov_x? 視版本而定), ...)：本檔提供 transparent 陣列。
- tcod.path.dijkstra2d(cost[y,x], ...)：本檔提供 move_cost 陣列（0=阻擋）。
"""

from __future__ import annotations

from typing import Iterable, Optional, Tuple

import numpy as np

from . import config
from .config import TILE_PLAIN, Tile


class Battlefield:
    """戰場：地形 id 網格 + 衍生屬性陣列 + 座標封裝。"""

    def __init__(self, width: int, height: int, fill: int = TILE_PLAIN) -> None:
        self.width: int = width
        self.height: int = height
        # 地形 id 陣列，索引為 [y, x]（SPEC §2）。dtype 用小整數即可容納地形 id。
        self.tiles: np.ndarray = np.full((height, width), fill, dtype=np.int8)

    # ------------------------------------------------------------------
    # 座標 / 邊界
    # ------------------------------------------------------------------
    def in_bounds(self, x: int, y: int) -> bool:
        """(x, y) 是否在戰場範圍內。"""
        return 0 <= x < self.width and 0 <= y < self.height

    def get_tile_id(self, x: int, y: int) -> int:
        """取得 (x, y) 的地形 id（吸收 [y, x] 索引差異）。"""
        return int(self.tiles[y, x])

    def set_tile_id(self, x: int, y: int, tile_id: int) -> None:
        """設定 (x, y) 的地形 id。"""
        self.tiles[y, x] = tile_id

    def get_tile(self, x: int, y: int) -> Tile:
        """取得 (x, y) 的地形屬性物件。"""
        return config.get_tile(int(self.tiles[y, x]))

    # ------------------------------------------------------------------
    # 單格屬性查詢（皆以 (x, y) 為介面）
    # ------------------------------------------------------------------
    def is_walkable(self, x: int, y: int) -> bool:
        """該格地形是否可走（不含單位佔格判斷）。"""
        if not self.in_bounds(x, y):
            return False
        return config.is_walkable(int(self.tiles[y, x]))

    def is_transparent(self, x: int, y: int) -> bool:
        """該格是否透光（FOV 用）。"""
        if not self.in_bounds(x, y):
            return False
        return config.is_transparent(int(self.tiles[y, x]))

    def get_cover(self, x: int, y: int) -> int:
        """取得 (x, y) 的掩體等級（0/1/2）；界外回傳 0。"""
        if not self.in_bounds(x, y):
            return 0
        return config.tile_cover(int(self.tiles[y, x]))

    def get_move_cost(self, x: int, y: int) -> int:
        """取得進入 (x, y) 的移動成本；0=阻擋（SPEC §2/§6）；界外回傳 0。"""
        if not self.in_bounds(x, y):
            return 0
        return config.tile_move_cost(int(self.tiles[y, x]))

    def blocked(self, x: int, y: int, units: Optional[Iterable] = None) -> bool:
        """(x, y) 是否被阻擋：界外、地形不可走、或被存活且 blocks 的單位佔據。

        units 為可選的單位序列（具 x/y/blocks/alive 屬性，如 MechUnit）。
        """
        if not self.in_bounds(x, y):
            return True
        if not config.is_walkable(int(self.tiles[y, x])):
            return True
        if units is not None:
            for u in units:
                if getattr(u, "alive", True) and getattr(u, "blocks", True):
                    if u.x == x and u.y == y:
                        return True
        return False

    # ------------------------------------------------------------------
    # 衍生陣列（numpy [y, x]，供 tcod 演算法直接使用）
    # ------------------------------------------------------------------
    def transparent_array(self) -> np.ndarray:
        """產生 transparent 布林陣列 [y, x]，供 tcod.map.compute_fov 使用。"""
        # 以地形表逐 id 對照，向量化建表（避免 Python 迴圈）
        lut = np.zeros(config.NUM_TILE_TYPES, dtype=bool)
        for tid, tile in config.TILES.items():
            lut[tid] = tile.transparent
        return lut[self.tiles]

    def walkable_array(self) -> np.ndarray:
        """產生 walkable 布林陣列 [y, x]（不含單位佔格）。"""
        lut = np.zeros(config.NUM_TILE_TYPES, dtype=bool)
        for tid, tile in config.TILES.items():
            lut[tid] = tile.walkable
        return lut[self.tiles]

    def cover_array(self) -> np.ndarray:
        """產生 cover 等級陣列 [y, x]（int8）。"""
        lut = np.zeros(config.NUM_TILE_TYPES, dtype=np.int8)
        for tid, tile in config.TILES.items():
            lut[tid] = tile.cover
        return lut[self.tiles]

    def cost_array(self, units: Optional[Iterable] = None, blocking_value: int = 0) -> np.ndarray:
        """產生移動成本陣列 [y, x]，供 tcod.path.dijkstra2d 使用（SPEC §2）。

        - 地形成本直接取自地形表（不可走地形其 move_cost 本即 0 = 阻擋）。
        - units 不為 None 時，把存活且 blocks 的單位佔格也設為 blocking_value（預設 0 阻擋），
          這就是「把單位佔格也納入阻擋的選項」。
        - dtype 用 int 以符合 tcod.path.dijkstra2d 對整數成本的需求。
        """
        lut = np.zeros(config.NUM_TILE_TYPES, dtype=np.int32)
        for tid, tile in config.TILES.items():
            # 不可走地形的 move_cost 為 0，正好對應阻擋語意
            lut[tid] = tile.move_cost if tile.walkable else 0
        cost = lut[self.tiles].astype(np.int32)

        if units is not None:
            for u in units:
                if getattr(u, "alive", True) and getattr(u, "blocks", True):
                    if self.in_bounds(u.x, u.y):
                        cost[u.y, u.x] = blocking_value
        return cost

    # ------------------------------------------------------------------
    # 工具
    # ------------------------------------------------------------------
    def iter_walkable(self) -> Iterable[Tuple[int, int]]:
        """逐一產生所有可走格的 (x, y)。"""
        ys, xs = np.where(self.walkable_array())
        for y, x in zip(ys.tolist(), xs.tolist()):
            yield (int(x), int(y))

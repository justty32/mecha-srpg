"""fov.py — 視野（FOV）、射線（line of fire）與掩體（cover）。

用途：
    - compute_visible：以對稱陰影投射計算某點為中心、給定半徑的可見遮罩。
    - has_line_of_fire：沿 Bresenham 直線檢查兩點間是否被不透明地形阻擋。
    - cover_against：計算目標相對於攻擊方所獲得的掩體等級（0/1/2）。

對應教學：part6_fov_cover.md（視野 FOV、射線 line of fire、掩體 cover）。

座標慣例（SPEC §2，鐵則）：
    - 對外一律 (x, y)；numpy 陣列一律 [y, x]。
    - tcod.map.compute_fov 的 pov 參數為 (i, j) = (y, x)，本模組在 compute_visible
      內封裝吸收這個 (x, y) ↔ (y, x) 差異，對外只給 (x, y)。

依賴（依 SPEC 簽名假設由他人實作，不重複定義）：
    - battlefield.Battlefield：提供
        * ``transparent_array``：[y, x] 的 bool 透明度陣列（True=透明，可透視）。
        * ``cover_array``：[y, x] 的 int 掩體等級陣列（0/1/2，來自地形 TILE.cover）。
        * ``width`` / ``height`` 與 ``in_bounds(x, y)``（界內判定）。
    - entity.MechUnit：``x`` / ``y``（用於 cover_against 的攻防座標）。
"""

from __future__ import annotations

from typing import List, Tuple

import numpy as np
import tcod.constants  # tcod.constants.FOV_SYMMETRIC_SHADOWCAST
import tcod.los        # tcod.los.bresenham
import tcod.map        # tcod.map.compute_fov

from .battlefield import Battlefield
from .entity import MechUnit


def _transparent(battlefield: Battlefield) -> np.ndarray:
    """取得戰場透明度陣列（[y, x] bool；True=可透視）。"""
    return np.asarray(battlefield.transparent_array, dtype=bool)


def _cover(battlefield: Battlefield) -> np.ndarray:
    """取得戰場掩體等級陣列（[y, x] int；0/1/2）。"""
    return np.asarray(battlefield.cover_array, dtype=np.int_)


def compute_visible(
    battlefield: Battlefield,
    x: int,
    y: int,
    radius: int,
) -> np.ndarray:
    """以 (x, y) 為視點、radius 為半徑計算可見遮罩。

    使用 ``tcod.map.compute_fov`` 搭配 ``FOV_SYMMETRIC_SHADOWCAST``（對稱性最佳，
    現代首選）。注意 tcod 的 pov 參數為 (y, x)，這裡負責把 (x, y) 轉成 (y, x)。

    Args:
        battlefield: 戰場（提供透明度陣列）。
        x, y: 視點邏輯座標 (x, y)。
        radius: 視野半徑（格數；0 表無限，但 SRPG 通常給有限值）。
    Returns:
        np.ndarray[bool, (H, W)]：[y, x] 的可見遮罩，True=從視點可見。
    """
    transparency = _transparent(battlefield)
    # tcod.map.compute_fov：吃「非零=透明」的 2D 陣列，回傳同形 bool 可見遮罩。
    #   pov=(i, j)=(y, x)；algorithm 指定 FOV 演算法。
    visible = tcod.map.compute_fov(
        transparency,
        pov=(y, x),  # ← 封裝 (x, y) → (y, x)。
        radius=radius,
        algorithm=tcod.constants.FOV_SYMMETRIC_SHADOWCAST,
    )
    return visible


def _line(ox: int, oy: int, tx: int, ty: int) -> List[Tuple[int, int]]:
    """回傳 (ox, oy) 到 (tx, ty) 的 Bresenham 直線格序列（含兩端點）。

    ``tcod.los.bresenham`` 以 (x, y) 順序收參與回傳，回傳形如 (N, 2) 的整數陣列，
    每列即 [x, y]，且包含起點與終點。
    """
    line = tcod.los.bresenham((ox, oy), (tx, ty))
    return [(int(px), int(py)) for px, py in line.tolist()]


def has_line_of_fire(
    battlefield: Battlefield,
    ox: int,
    oy: int,
    tx: int,
    ty: int,
) -> bool:
    """檢查從 (ox, oy) 到 (tx, ty) 是否有「無遮擋的射擊線」。

    沿 Bresenham 直線逐格檢查「中途格」是否被不透明地形擋住；起點與終點
    本身不算阻擋（終點是目標所在、起點是射手所在，皆允許不透明，例如目標站在
    建物邊緣仍可被打到）。

    Args:
        battlefield: 戰場（提供透明度陣列）。
        ox, oy: 攻擊方座標 (x, y)。
        tx, ty: 目標座標 (x, y)。
    Returns:
        bool：True=射線通暢可開火；False=中途被不透明地形阻擋。
    """
    transparency = _transparent(battlefield)
    line = _line(ox, oy, tx, ty)

    # 只檢查「中途格」：去掉第一格（起點）與最後一格（終點）。
    for px, py in line[1:-1]:
        # 不透明（transparency 為 False）即阻擋射線。索引為 [y, x]。
        if not transparency[py, px]:
            return False
    return True


# 四方相鄰偏移（(dx, dy)），用於 cover 的「鄰接掩體」判斷。
_ADJ4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def cover_against(
    battlefield: Battlefield,
    attacker: MechUnit,
    target: MechUnit,
) -> int:
    """計算 target 相對於 attacker 取得的掩體等級（0/1/2）。

    判定規則（SPEC §6 掩體語意 + 朝攻方面向）：
        取「目標所在格的 cover」與「目標四方相鄰格中、面向攻擊方那一側的 cover」
        兩者的較大值。直覺：機甲緊貼一面牆/樹林，且該掩體位於它與射手之間時，
        該側掩體才提供保護。

    「面向攻擊方的相鄰格」判定：相鄰格相對目標的方向 (dx, dy) 與
        「攻方相對目標的方向」在該軸同號，視為朝向攻方那一側。

    Args:
        battlefield: 戰場（提供掩體陣列與界內判定）。
        attacker: 攻擊方單位（取其座標推算方向）。
        target: 目標單位。
    Returns:
        int：掩體等級 0 / 1 / 2（取最大值）。
    """
    cover = _cover(battlefield)

    # 目標所在格本身的掩體（例如站在瓦礫/樹林上）。
    best = int(cover[target.y, target.x])

    # 攻方相對目標的方向向量（只取符號，用於判斷哪一側朝向攻方）。
    sign_x = _sign(attacker.x - target.x)
    sign_y = _sign(attacker.y - target.y)

    for dx, dy in _ADJ4:
        # 該相鄰格是否位於「目標與攻方之間」那一側：
        #   水平鄰格 (dx!=0) 需與 sign_x 同號；垂直鄰格 (dy!=0) 需與 sign_y 同號。
        facing = False
        if dx != 0 and dx == sign_x:
            facing = True
        if dy != 0 and dy == sign_y:
            facing = True
        if not facing:
            continue

        nx, ny = target.x + dx, target.y + dy
        if not battlefield.in_bounds(nx, ny):
            continue
        best = max(best, int(cover[ny, nx]))

    return best


def _sign(value: int) -> int:
    """回傳整數的符號：正→1、負→-1、零→0。"""
    if value > 0:
        return 1
    if value < 0:
        return -1
    return 0

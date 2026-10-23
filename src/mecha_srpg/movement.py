"""movement.py — 移動範圍與路徑（Dijkstra 距離場 + 爬坡）。

用途：
    以 tcod 的距離場演算法計算機甲單位的「可達格集合」與「到指定格的路徑」。
    核心是把戰場地形成本與「其他單位佔格」合成一張成本陣列，餵給
    ``tcod.path.dijkstra2d`` 求出距離場，再用 ``tcod.path.hillclimb2d`` 沿
    距離場下坡爬出路徑。

對應教學：part5_movement.md（移動範圍、路徑、移動動畫）。

座標與成本慣例（SPEC §2，鐵則）：
    - 邏輯座標一律 (x, y)；numpy 陣列一律 [y, x]（row-major），與 tcod 一致。
    - 成本陣列：0 = 不可進入（阻擋）；正整數 = 進入該格的移動成本。
    - 本模組對外只用 (x, y)；內部與 tcod 互動時的 [y, x] 索引在此封裝吸收。

移動規則：採「四方移動」（上下左右），不允許對角，符合多數戰旗 SRPG 手感。
    對 dijkstra2d / hillclimb2d 而言：
        - cardinal = 正交（上下左右）邊權重；diagonal = 對角邊權重。
        - 設 diagonal = 0 表示「停用對角」（權重 0 在此語意下代表該方向不可走）。
    本模組以 ``move_cost`` 本身作為「進入格子的成本」，故 dijkstra2d 的 cardinal
    係數設為 1（不額外放大），對角設為 0（禁用）。

依賴（依 SPEC 簽名假設由他人實作，不重複定義）：
    - battlefield.Battlefield：持有地形網格，提供 ``move_cost_array`` 形式的
      地形成本（[y, x]，0=不可走、正值=move_cost），與 ``width`` / ``height``。
    - entity.MechUnit：``x`` / ``y`` / ``stats.move``（每回合最大移動點）。
"""

from __future__ import annotations

from typing import Dict, Iterable, List, Tuple

import numpy as np
import tcod.path  # tcod.path.dijkstra2d / hillclimb2d / maxarray

from .battlefield import Battlefield
from .entity import MechUnit

# (x, y) 座標型別別名。
Coord = Tuple[int, int]

# dijkstra2d / hillclimb2d 的方向權重設定：
#   _CARDINAL=1 → 正交邊以「進入格成本 × 1」計；_DIAGONAL=0 → 禁用對角。
_CARDINAL = 1
_DIAGONAL = 0


def _terrain_cost(battlefield: Battlefield) -> np.ndarray:
    """從 Battlefield 取得地形成本陣列（[y, x]，int），不含單位佔格。

    語意沿用 SPEC §2/§6：0=不可走、正值=move_cost。
    這裡集中處理「battlefield 暴露成本陣列的方式」，方便日後 battlefield
    介面微調時只改這一處。
    """
    # 依 SPEC §6，battlefield 由地形 TILE 衍生出移動成本陣列。
    # 假設其屬性名為 move_cost_array（[y, x] 的整數陣列）。
    cost = np.asarray(battlefield.move_cost_array, dtype=np.int_)
    return cost


def compute_move_cost_array(
    battlefield: Battlefield,
    units: Iterable[MechUnit],
    mover: MechUnit,
) -> np.ndarray:
    """產生供 tcod 距離場使用的成本陣列（[y, x]，int）。

    作法：
        1. 取地形成本（0=阻擋、正值=移動成本）。
        2. 把「除 mover 外、所有存活單位」所在格設為 0（阻擋）——單位不可互相
           穿越。mover 自身所在格保留地形成本（起點本就不需「進入成本」，
           dijkstra2d 從距離 0 出發）。

    Args:
        battlefield: 戰場（提供地形成本）。
        units: 戰場上所有單位（含雙方）。
        mover: 正在計算移動的單位（其自身格不視為阻擋）。
    Returns:
        np.ndarray[int, (H, W)]：成本陣列，可直接交給 dijkstra2d 的 ``cost`` 參數。
    """
    # 複製一份，避免汙染 battlefield 內部的地形成本。
    cost = _terrain_cost(battlefield).copy()

    for unit in units:
        if not unit.alive:
            continue  # 陣亡單位不佔格、不阻擋。
        if unit is mover:
            continue  # 自身所在格不阻擋（否則起點會被當成牆）。
        # 其他單位佔格：設為 0 = 不可進入。注意 numpy 索引為 [y, x]。
        cost[unit.y, unit.x] = 0

    return cost


def _distance_field(
    cost: np.ndarray,
    sx: int,
    sy: int,
) -> np.ndarray:
    """以 (sx, sy) 為起點，在 cost 上計算 Dijkstra 距離場（[y, x]，int）。

    用 ``tcod.path.maxarray`` 建立「全填極大值」的距離陣列，把起點設 0，
    再就地呼叫 ``tcod.path.dijkstra2d`` 灌入距離。

    Returns:
        距離場：每格為「從起點抵達該格的累積移動成本」；不可達格維持極大值。
    """
    # tcod.path.maxarray：建立填滿型別最大值的陣列，代表「尚未抵達 / 不可達」。
    dist = tcod.path.maxarray(cost.shape, dtype=np.int_)
    # 起點距離 0（注意 [y, x] 索引）。
    dist[sy, sx] = 0
    # tcod.path.dijkstra2d：就地把 cost 上的累積成本灌進 dist。
    #   cardinal=正交權重、diagonal=對角權重（0 表禁用對角 → 四方移動）。
    tcod.path.dijkstra2d(
        dist, cost, cardinal=_CARDINAL, diagonal=_DIAGONAL, out=dist
    )
    return dist


def reachable_tiles(
    battlefield: Battlefield,
    units: Iterable[MechUnit],
    mover: MechUnit,
) -> Dict[Coord, int]:
    """計算 mover 在本次移動可抵達的所有格與其累積成本。

    流程：合成成本陣列 → Dijkstra 距離場 → 篩出「成本 ≤ mover.stats.move」
    且確實可達（非極大值）的格，排除起點自身。

    Args:
        battlefield: 戰場。
        units: 所有單位。
        mover: 要移動的單位。
    Returns:
        dict[(x, y) -> cost]：可達格（不含 mover 起點）對應的累積移動成本。
    """
    units = list(units)
    cost = compute_move_cost_array(battlefield, units, mover)
    dist = _distance_field(cost, mover.x, mover.y)

    max_move = mover.stats.move
    result: Dict[Coord, int] = {}

    # 「可達且在移動點內」的遮罩：成本 > 0（排除起點 0）且 <= max_move。
    # dist 內不可達格為極大值，自然會被 <= max_move 濾掉。
    h, w = dist.shape
    # 以 numpy 取出符合條件的座標，再轉成 (x, y)->cost 字典。
    ys, xs = np.where((dist > 0) & (dist <= max_move))
    for y, x in zip(ys.tolist(), xs.tolist()):
        result[(x, y)] = int(dist[y, x])

    return result


def path_to(
    battlefield: Battlefield,
    units: Iterable[MechUnit],
    mover: MechUnit,
    tx: int,
    ty: int,
) -> List[Coord]:
    """求 mover 從目前位置到 (tx, ty) 的移動路徑（沿距離場下坡）。

    流程：合成成本陣列 → 以「目標格」為起點建距離場 → 從 mover 位置
    ``hillclimb2d`` 沿下坡走到目標。以目標為距離場原點，可保證爬坡終點就是
    目標格，回傳的路徑即「從 mover 起點到目標」的序列。

    Args:
        battlefield: 戰場。
        units: 所有單位。
        mover: 要移動的單位。
        tx, ty: 目標格邏輯座標 (x, y)。
    Returns:
        list[(x, y)]：路徑座標序列，**含起點與終點**；若不可達則回傳空清單。
    """
    units = list(units)
    cost = compute_move_cost_array(battlefield, units, mover)

    # 以「目標格」為原點建距離場，使各格的值=到目標的距離；
    # 從 mover 起點沿下坡（值遞減）爬，最終落在目標格（距離 0）。
    dist = _distance_field(cost, tx, ty)

    # 起點不可達目標（極大值）→ 無路徑。
    # 起點即目標 → 路徑只有一格。
    sx, sy = mover.x, mover.y
    if sx == tx and sy == ty:
        return [(sx, sy)]
    if dist[sy, sx] >= np.iinfo(dist.dtype).max:
        return []

    # tcod.path.hillclimb2d：給定距離場與起點，沿最陡下坡逐步走到區域最小值。
    #   start 參數為 (i, j) = (y, x)；cardinal/diagonal 為 bool（是否允許該方向）。
    #   回傳形如 (N, 2) 的陣列，每列為 [y, x]，含起點與終點。
    climbed = tcod.path.hillclimb2d(
        dist, (sy, sx), cardinal=True, diagonal=False
    )

    # 轉回 (x, y) 序列。climbed[:, 0]=y、climbed[:, 1]=x。
    path: List[Coord] = [(int(x), int(y)) for y, x in climbed.tolist()]
    return path

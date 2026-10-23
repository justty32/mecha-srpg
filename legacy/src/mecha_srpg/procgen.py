"""procgen.py — 戰場程序生成（SPEC §2 / §6）。

用途：以 tcod.noise（SIMPLEX + FBM）生成高度圖，映射到地形（水／平地／樹林／高地），
再依高度與雜訊灑建物與瓦礫叢，最後回傳雙方部署點（左側玩家、右側敵方各 N 格可走平地）。

對應教學 part：part2_battlefield（procgen 生成）。

座標慣例（SPEC §2）：地形寫入 Battlefield.tiles[y, x]；部署點以 (x, y) 回傳。

關鍵 tcod API：
- tcod.noise.Noise(dimensions=2, algorithm=tcod.noise.Algorithm.SIMPLEX,
                   implementation=tcod.noise.Implementation.FBM, octaves, lacunarity, hurst, seed)
- tcod.noise.grid(shape, scale, origin)：產生取樣座標格（[y, x] 形狀）
- noise[grid]：向量化取樣，回傳值域約 [-1, 1] 的陣列
- 亂數一律走 tcod.random.Random（經由 rng.Rng 取得），不可用標準庫 random。
"""

from __future__ import annotations

from typing import List, Optional, Tuple

import numpy as np
import tcod.noise

from . import config
from .battlefield import Battlefield
from .rng import Rng, get_rng

Point = Tuple[int, int]


def _make_heightmap(width: int, height: int, rng: Rng) -> np.ndarray:
    """以 SIMPLEX + FBM 生成 [0, 1] 區間的高度圖（[y, x]）。"""
    # tcod.noise.Noise：以 rng 的底層 tcod.random.Random 當種子，確保可重現
    noise = tcod.noise.Noise(
        dimensions=2,
        algorithm=tcod.noise.Algorithm.SIMPLEX,
        implementation=tcod.noise.Implementation.FBM,
        octaves=4,
        lacunarity=2.0,
        hurst=0.5,
        seed=rng.tcod_random,
    )
    # tcod.noise.grid：產生取樣座標，shape 為 [y, x]；scale 控制特徵尺度
    grid = tcod.noise.grid(shape=(height, width), scale=0.12, origin=(0, 0))
    samples = noise[grid]  # 值域約 [-1, 1]
    # 正規化到 [0, 1]
    return (samples + 1.0) * 0.5


def _height_to_terrain(h: float) -> int:
    """把單格高度（0~1）映射到基礎地形 id（水/平地/樹林/高地）。"""
    if h < 0.30:
        return config.TILE_WATER
    if h < 0.62:
        return config.TILE_PLAIN
    if h < 0.80:
        return config.TILE_FOREST
    return config.TILE_HILL


def _scatter_structures(bf: Battlefield, rng: Rng) -> None:
    """在平地上隨機灑建物與瓦礫叢（小團塊），增加掩體與遮蔽。"""
    area = bf.width * bf.height
    n_clusters = max(3, area // 120)

    for _ in range(n_clusters):
        cx = rng.randint(0, bf.width - 1)
        cy = rng.randint(0, bf.height - 1)
        # 一半機率灑建物（cover 2、不可走），一半灑瓦礫（cover 1、可走）
        tile_id = config.TILE_BUILDING if rng.random() < 0.5 else config.TILE_RUBBLE
        radius = rng.randint(0, 2)
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                x, y = cx + dx, cy + dy
                if not bf.in_bounds(x, y):
                    continue
                # 只覆蓋在平地上，避免破壞水域/高地的地貌邏輯
                if bf.get_tile_id(x, y) != config.TILE_PLAIN:
                    continue
                if rng.random() < 0.7:
                    bf.set_tile_id(x, y, tile_id)


def _collect_deploy_points(
    bf: Battlefield, x_lo: int, x_hi: int, count: int, rng: Rng
) -> List[Point]:
    """在欄位 [x_lo, x_hi] 範圍內收集 count 個「可走平地」部署點。

    先蒐集候選平地格，隨機抽樣；不足時放寬到任意可走格。
    """
    plains: List[Point] = []
    walkable: List[Point] = []
    for x in range(x_lo, x_hi + 1):
        for y in range(bf.height):
            if not bf.is_walkable(x, y):
                continue
            walkable.append((x, y))
            if bf.get_tile_id(x, y) == config.TILE_PLAIN:
                plains.append((x, y))

    pool = plains if len(plains) >= count else walkable
    if len(pool) <= count:
        # 不足或剛好，直接全給（可能少於 count）
        return list(pool)
    return rng.sample(pool, count)


def generate_battlefield(
    width: int = config.MAP_W,
    height: int = config.MAP_H,
    rng: Optional[Rng] = None,
    seed: Optional[int] = None,
    deploy_count: int = 3,
) -> Tuple[Battlefield, List[Point], List[Point]]:
    """生成一張戰場與雙方部署點。

    參數：
    - width / height：戰場尺寸（預設取 config.MAP_W/MAP_H）。
    - rng：可傳入既有亂數源；未傳時依 seed 建立或取全域單例。
    - seed：當 rng 為 None 時用來建立可重現亂數（None 則用全域單例）。
    - deploy_count：每一方部署點數量 N。

    回傳：(Battlefield, 玩家部署點清單, 敵方部署點清單)。
    玩家部署於左側欄帶、敵方於右側欄帶，皆為可走（盡量平地）格。
    """
    if rng is None:
        rng = Rng(seed) if seed is not None else get_rng()

    bf = Battlefield(width, height)

    # 1) 高度圖 → 基礎地形
    hmap = _make_heightmap(width, height, rng)
    for y in range(height):
        for x in range(width):
            bf.tiles[y, x] = _height_to_terrain(float(hmap[y, x]))

    # 2) 灑建物與瓦礫
    _scatter_structures(bf, rng)

    # 3) 部署帶：左側約 1/6 寬給玩家、右側約 1/6 寬給敵方
    band = max(2, width // 6)
    player_deploy = _collect_deploy_points(bf, 0, band - 1, deploy_count, rng)
    enemy_deploy = _collect_deploy_points(bf, width - band, width - 1, deploy_count, rng)

    return bf, player_deploy, enemy_deploy

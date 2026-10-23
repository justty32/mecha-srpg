"""components.py — 純資料元件（SPEC §5）。

用途：定義機甲單位所需的資料模型（dataclass），不含行為邏輯：
Stats（底盤數值）、Weapon（武器）、Armor（裝甲）、Pilot（駕駛員）。
欄位完全照 SPEC §5。

對應教學 part：part3_units（資料模型與部署）。
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Stats:
    """機甲底盤數值（SPEC §5）。"""

    max_structure: int   # 結構值（HP 上限）
    armor: int           # 減傷
    move: int            # 每次移動最大步數（移動點）
    evasion: int         # 迴避
    max_heat: int = 100  # 熱量上限


@dataclass
class Weapon:
    """武器（SPEC §5）。"""

    name: str
    damage: int          # 基礎傷害
    accuracy: int        # 武器基礎命中
    min_range: int       # 最小射程
    max_range: int       # 最大射程
    heat: int            # 開火產生的熱量
    ap_cost: int = 1     # 開火消耗 AP


@dataclass
class Armor:
    """附加裝甲（補強底盤 armor 與結構）。

    SPEC §5 表列 Stats/Weapon/Pilot；Armor 作為可選的裝備強化元件，
    在傷害結算前可由 entity 把 armor_bonus 併入有效裝甲。
    """

    name: str
    armor_bonus: int = 0       # 額外減傷
    structure_bonus: int = 0   # 額外結構上限


@dataclass
class Pilot:
    """駕駛員（SPEC §5）。"""

    name: str
    skill: int           # 加成命中／AI 評估

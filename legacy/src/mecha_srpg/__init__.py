"""mecha_srpg — 回合制機甲戰旗 SRPG（Mecha Tactics）。

Python 為主體的回合制機甲戰術遊戲核心套件。本檔提供版本資訊與資料層的公開匯出。
完整設計契約見專案根目錄 SPEC.md（唯一真實來源）。

對應教學 part：part0_overview_and_setup。
"""

from __future__ import annotations

__version__ = "0.1.0"

# --- 設定與常數（config.py，SPEC §6/§7/§8）---
from .config import (
    AP_PER_TURN,
    Faction,
    MAP_H,
    MAP_W,
    REAR_MULT,
    SCREEN_H,
    SCREEN_W,
    TILES,
    Tile,
    get_tile,
)

# --- 亂數（rng.py）---
from .rng import Rng, get_rng, seed_rng

# --- 資料元件（components.py，SPEC §5）---
from .components import Armor, Pilot, Stats, Weapon

# --- 實體（entity.py，SPEC §5）---
from .entity import Entity, MechUnit

# --- 戰場（battlefield.py，SPEC §2/§6）---
from .battlefield import Battlefield

# --- 程序生成（procgen.py）---
from .procgen import generate_battlefield

__all__ = [
    "__version__",
    # config
    "AP_PER_TURN",
    "Faction",
    "MAP_H",
    "MAP_W",
    "REAR_MULT",
    "SCREEN_H",
    "SCREEN_W",
    "TILES",
    "Tile",
    "get_tile",
    # rng
    "Rng",
    "get_rng",
    "seed_rng",
    # components
    "Armor",
    "Pilot",
    "Stats",
    "Weapon",
    # entity
    "Entity",
    "MechUnit",
    # battlefield
    "Battlefield",
    # procgen
    "generate_battlefield",
]

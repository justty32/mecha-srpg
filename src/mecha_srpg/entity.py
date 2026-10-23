"""entity.py — 戰場實體（SPEC §5）。

用途：定義 Entity 基底（戰場上一切佔格物件）與 MechUnit（機甲單位）。
MechUnit 持有 faction/stats/pilot/weapons/structure/heat/ap，提供 alive 屬性、
take_damage()、reset_turn()（重置 AP 並散熱）等便利方法。

對應教學 part：part3_units（資料模型、繪製、選取）、part4_turns_ap、part7_combat。

座標慣例（SPEC §2）：實體位置以 (x, y) 表示。
"""

from __future__ import annotations

from typing import List, Optional

from .components import Pilot, Stats, Weapon
from .config import (
    AP_PER_TURN,
    Faction,
    HEAT_DISSIPATION,
    OVERHEAT_ACC_PENALTY,
    OVERHEAT_DAMAGE,
    RGB,
)


class Entity:
    """戰場上一切佔格物件（SPEC §5）。"""

    def __init__(
        self,
        x: int,
        y: int,
        char: str,
        color: RGB,
        name: str,
        blocks: bool = True,
    ) -> None:
        self.x: int = x
        self.y: int = y
        self.char: str = char
        self.color: RGB = color
        self.name: str = name
        self.blocks: bool = blocks  # 是否阻擋移動（佔格）

    @property
    def pos(self) -> tuple[int, int]:
        """目前邏輯座標 (x, y)。"""
        return (self.x, self.y)

    def move_to(self, x: int, y: int) -> None:
        """直接設定座標（路徑與合法性由呼叫端負責）。"""
        self.x = x
        self.y = y


class MechUnit(Entity):
    """機甲單位（SPEC §5）。

    結合底盤 Stats、駕駛員 Pilot 與武器清單，維護目前結構、熱量與 AP。
    """

    def __init__(
        self,
        x: int,
        y: int,
        name: str,
        faction: Faction,
        stats: Stats,
        pilot: Pilot,
        weapons: Optional[List[Weapon]] = None,
        char: str = "M",
        color: Optional[RGB] = None,
    ) -> None:
        # 顏色預設依陣營決定（避免循環匯入，這裡延後取 config 顏色）
        if color is None:
            from .config import COLOR_ENEMY, COLOR_PLAYER

            color = COLOR_PLAYER if faction == Faction.PLAYER else COLOR_ENEMY
        super().__init__(x, y, char, color, name, blocks=True)

        self.faction: Faction = faction
        self.stats: Stats = stats
        self.pilot: Pilot = pilot
        self.weapons: List[Weapon] = weapons if weapons is not None else []

        self.structure: int = stats.max_structure  # 目前結構
        self.heat: int = 0                          # 目前熱量
        self.ap: int = AP_PER_TURN                  # 本回合剩餘 AP
        self.has_moved: bool = False                # 本回合是否已移動

    # ------------------------------------------------------------------
    # 狀態查詢
    # ------------------------------------------------------------------
    @property
    def alive(self) -> bool:
        """存活：結構 > 0（SPEC §5）。"""
        return self.structure > 0

    @property
    def is_overheated(self) -> bool:
        """是否過熱（heat >= max_heat；SPEC §7）。"""
        return self.heat >= self.stats.max_heat

    @property
    def heat_penalty(self) -> int:
        """目前因過熱造成的命中懲罰（過熱時為 OVERHEAT_ACC_PENALTY，否則 0）。"""
        return OVERHEAT_ACC_PENALTY if self.is_overheated else 0

    @property
    def effective_armor(self) -> int:
        """有效裝甲（目前等同底盤 armor；保留擴充點供 Armor 元件併入）。"""
        return self.stats.armor

    def primary_weapon(self) -> Optional[Weapon]:
        """取得第一把武器（無武器時回傳 None）。"""
        return self.weapons[0] if self.weapons else None

    # ------------------------------------------------------------------
    # 行動與資源
    # ------------------------------------------------------------------
    def can_act(self) -> bool:
        """是否仍可行動（存活且尚有 AP）。"""
        return self.alive and self.ap > 0

    def spend_ap(self, amount: int = 1) -> bool:
        """嘗試消耗 AP；成功回傳 True，AP 不足回傳 False。"""
        if self.ap < amount:
            return False
        self.ap -= amount
        return True

    def add_heat(self, amount: int) -> None:
        """增加熱量（夾擠在 [0, max_heat]）。"""
        self.heat = max(0, min(self.stats.max_heat, self.heat + amount))

    def take_damage(self, amount: int) -> int:
        """承受結構傷害，回傳實際扣除量；structure 夾擠不小於 0。

        注意：傳入的 amount 應為已結算（扣裝甲／背擊倍率後）之最終傷害，
        裝甲計算在 combat.py / mtcore.resolve_damage 完成。
        """
        if amount <= 0:
            return 0
        before = self.structure
        self.structure = max(0, self.structure - amount)
        return before - self.structure

    def reset_turn(self) -> None:
        """回合開始重置：補滿 AP、自然散熱、清除已移動旗標（SPEC §7）。

        注意：過熱結束時的結構傷害（OVERHEAT_DAMAGE）屬「回合結束」效果，
        由 end_turn_upkeep() 處理，避免與本方法的「回合開始重置」混淆。
        """
        self.ap = AP_PER_TURN
        self.has_moved = False
        self.heat = max(0, self.heat - HEAT_DISSIPATION)

    def end_turn_upkeep(self) -> int:
        """回合結束維護：若過熱則受 OVERHEAT_DAMAGE 結構傷害（SPEC §7）。

        回傳因過熱而實際受到的傷害量（未過熱回傳 0）。
        """
        if self.is_overheated:
            return self.take_damage(OVERHEAT_DAMAGE)
        return 0

    def __repr__(self) -> str:  # pragma: no cover - 偵錯輔助
        return (
            f"MechUnit(name={self.name!r}, faction={self.faction.name}, "
            f"pos=({self.x},{self.y}), struct={self.structure}/{self.stats.max_structure}, "
            f"heat={self.heat}, ap={self.ap})"
        )

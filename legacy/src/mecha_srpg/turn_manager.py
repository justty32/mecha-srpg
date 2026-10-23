"""turn_manager.py — 回合管理器（TurnManager）。

用途：
    管理「玩家階段 / 敵方階段」交替推進的回合制流程。每當某一陣營的階段
    開始時，為該陣營所有存活單位呼叫 ``reset_turn()``（補滿 AP、自然散熱、
    過熱結算），並提供查詢當前陣營、結束階段、勝負判定與回合計數的介面。

對應教學：part4_turns_ap.md（回合制：玩家/敵方階段、AP、TurnManager）。

座標與資料慣例：本模組不直接碰網格，僅操作 ``MechUnit`` 與 ``Faction``；
    相關慣例詳見 SPEC §2、§5、§7。

依賴（依 SPEC 簽名假設由他人實作）：
    - entity.MechUnit：具 ``faction``、``alive``、``reset_turn()`` 等。
    - entity.Faction：IntEnum，PLAYER=0 / ENEMY=1。
注意：本檔不重複定義 MechUnit / Faction，一律 import。
"""

from __future__ import annotations

from typing import Iterable, Iterator, Optional

# 依 SPEC §5：Faction 與 MechUnit 由 entity.py 提供（他人實作）。
from .entity import Faction, MechUnit


class TurnManager:
    """回合管理器：推進玩家／敵方階段，並負責每階段的單位重置與勝負判定。

    生命週期（概念）：
        DeployState 結束後建立 TurnManager → 進入玩家階段（current_faction =
        PLAYER）→ 玩家操作完所有單位後 end_turn() → 敵方階段（ENEMY）→
        敵方 AI 行動完 end_turn() → 回到玩家階段，turn_count += 1。

    Attributes:
        units: 戰場上所有單位（含雙方、含已陣亡；以 ``alive`` 篩選）。
        current_faction: 目前正在行動的陣營（Faction.PLAYER / Faction.ENEMY）。
        turn_count: 完整回合計數（玩家+敵方各一次為一個完整回合）。從 1 起算。
    """

    def __init__(self, units: Iterable[MechUnit]) -> None:
        """以單位清單初始化，並立即開啟「玩家階段」。

        Args:
            units: 戰場上所有 MechUnit（清單會被保留為可變參照，戰鬥造成的
                陣亡會反映在 ``alive`` 屬性上，不需從本清單移除）。
        """
        # 保留為 list 參照：外部新增/標記陣亡的單位，這裡靠 alive 屬性過濾即可。
        self.units: list[MechUnit] = list(units)
        # 慣例：開局先進行玩家階段。
        self.current_faction: Faction = Faction.PLAYER
        # 完整回合計數（玩家+敵方=1 回合），從第 1 回合開始。
        self.turn_count: int = 1
        # 為開局的玩家階段做一次單位重置（補 AP / 散熱 / 過熱結算）。
        self._begin_phase(self.current_faction)

    # ------------------------------------------------------------------
    # 查詢介面
    # ------------------------------------------------------------------
    def units_of(self, faction: Faction) -> list[MechUnit]:
        """回傳指定陣營「目前存活」的單位清單。

        Args:
            faction: 要查詢的陣營。
        Returns:
            該陣營 alive 為 True 的 MechUnit 清單（不含陣亡者）。
        """
        return [u for u in self.units if u.faction == faction and u.alive]

    def active_units(self) -> list[MechUnit]:
        """回傳「當前行動陣營」目前存活的單位清單（即正在行動的一方）。"""
        return self.units_of(self.current_faction)

    def has_actionable_units(self) -> bool:
        """當前陣營是否還有「可行動」單位（AP > 0 的存活單位）。

        提供給狀態機判斷是否該自動結束本階段（所有單位 AP 耗盡）。
        """
        return any(u.ap > 0 for u in self.active_units())

    # ------------------------------------------------------------------
    # 階段推進
    # ------------------------------------------------------------------
    def end_turn(self) -> Faction:
        """結束「當前陣營」的階段，切換到另一陣營並開始其階段。

        切換規則：
            PLAYER → ENEMY：同一個完整回合內的後半段，turn_count 不變。
            ENEMY  → PLAYER：開啟新的完整回合，turn_count += 1。

        切換後會對新陣營所有存活單位呼叫 reset_turn()（補 AP / 散熱 / 過熱）。

        Returns:
            切換後的新 current_faction。
        """
        if self.current_faction == Faction.PLAYER:
            # 玩家 → 敵方：仍屬同一個完整回合。
            self.current_faction = Faction.ENEMY
        else:
            # 敵方 → 玩家：完整回合 +1。
            self.current_faction = Faction.PLAYER
            self.turn_count += 1

        # 為即將行動的新陣營做回合開始重置。
        self._begin_phase(self.current_faction)
        return self.current_faction

    def _begin_phase(self, faction: Faction) -> None:
        """（內部）開啟某陣營的階段：對其所有存活單位做 reset_turn()。

        reset_turn() 的職責由 entity.MechUnit 實作（SPEC §7）：
            - 補滿 AP（AP_PER_TURN）
            - 自然散熱（HEAT_DISSIPATION）
            - 若先前處於過熱（heat >= max_heat）則結算 OVERHEAT_DAMAGE
            - 清除 has_moved 等回合旗標
        本管理器只負責「在正確時機、對正確的單位」呼叫它。
        """
        for unit in self.units_of(faction):
            unit.reset_turn()

    # ------------------------------------------------------------------
    # 勝負判定
    # ------------------------------------------------------------------
    def check_victory(self) -> Optional[Faction]:
        """判定勝負。

        規則（SPEC §9）：敵方全滅→玩家勝；我方全滅→敵方勝。

        Returns:
            - Faction.PLAYER：玩家獲勝（敵方無存活單位）。
            - Faction.ENEMY ：敵方獲勝（玩家無存活單位）。
            - None：尚未分出勝負（雙方都還有存活單位）。
        注意：若雙方同時全滅（理論上罕見），優先回傳 PLAYER（敵方先被判全滅）。
        """
        player_alive = any(
            u.faction == Faction.PLAYER and u.alive for u in self.units
        )
        enemy_alive = any(
            u.faction == Faction.ENEMY and u.alive for u in self.units
        )
        if not enemy_alive:
            return Faction.PLAYER
        if not player_alive:
            return Faction.ENEMY
        return None

    # ------------------------------------------------------------------
    # 方便迭代
    # ------------------------------------------------------------------
    def __iter__(self) -> Iterator[MechUnit]:
        """迭代當前行動陣營的存活單位（語法糖）。"""
        return iter(self.active_units())

    def __repr__(self) -> str:  # pragma: no cover - 偵錯用
        return (
            f"<TurnManager turn={self.turn_count} "
            f"faction={self.current_faction!r} "
            f"actionable={self.has_actionable_units()}>"
        )

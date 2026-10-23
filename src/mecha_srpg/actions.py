"""actions.py — 行動階層（Action hierarchy）。

用途：
    定義玩家／AI 可下達的「行動」物件。每個行動實作 ``perform(engine, unit)``，
    在其中改變遊戲狀態（移動、攻擊、結束單位、設定守望），並回傳結果物件或
    bool 表示是否成功。行動是「意圖 → 狀態變更」的單一入口，方便 input_handlers
    與 ai 共用同一套執行語意。

對應教學：part7_combat.md（攻擊行動、訊息日誌）、part5_movement.md（移動）。

設計約定：
    - AP 制（SPEC §5/§7）：MoveAction 扣 1 AP；AttackAction 扣 weapon.ap_cost；
      WaitAction 直接把該單位 AP 歸零；OverwatchAction 設守望旗標並結束單位行動。
    - perform 回傳值：成功時回傳具語意的結果（如 ActionResult / AttackResult），
      無法執行時回傳 False，讓呼叫端（input_handlers/ai）可據此提示或重選。
    - 座標慣例 (x, y) 見 SPEC §2。

依賴（依 SPEC 簽名假設由他人實作，不重複定義）：
    - engine.Engine：持有 ``battlefield`` / ``units`` / ``turn_manager`` /
      ``message_log``（``add(text)`` 形式）等全域狀態。
    - entity.MechUnit：``x`` / ``y`` / ``ap`` / ``heat`` / ``has_moved`` / ``alive`` /
      ``weapons`` 等。
    - components.Weapon：``ap_cost`` / ``heat`` / ``name`` 等（SPEC §5）。
    - combat.resolve_attack：實際命中/傷害結算（由他人依 SPEC §7 實作）。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, List, Optional, Tuple, Union

# combat.resolve_attack 由他人實作（SPEC §7：呼叫 mtcore，含純 Python fallback）。
from .combat import resolve_attack

if TYPE_CHECKING:  # 僅型別檢查時匯入，避免執行期循環匯入。
    from .engine import Engine
    from .entity import MechUnit
    from .components import Weapon

Coord = Tuple[int, int]


@dataclass
class ActionResult:
    """一般行動結果。

    Attributes:
        success: 行動是否成功執行。
        message: 給訊息日誌/UI 的描述（可為空）。
    """

    success: bool
    message: str = ""

    def __bool__(self) -> bool:  # 讓呼叫端可直接 if result:
        return self.success


class Action:
    """所有行動的基底類別。

    子類別覆寫 ``perform``，在其中變更遊戲狀態並回傳結果。基底的 perform 不做事，
    僅定義契約。
    """

    def perform(self, engine: "Engine", unit: "MechUnit") -> Union[ActionResult, bool]:
        """執行本行動。

        Args:
            engine: 遊戲引擎（提供 battlefield / units / turn_manager / message_log）。
            unit: 執行此行動的單位。
        Returns:
            ActionResult 或 bool；False / success=False 代表未能執行。
        """
        raise NotImplementedError


class MoveAction(Action):
    """移動行動：沿預先算好的路徑移動，扣 1 AP，設定 has_moved。

    路徑由 movement.path_to 產生（含起點與終點的 (x, y) 序列）。本行動只負責
    把單位座標更新到路徑終點並結算 AP/旗標；逐格動畫由 UI 層自行讀路徑播放。
    """

    def __init__(self, path: List[Coord]) -> None:
        """以路徑初始化。

        Args:
            path: movement.path_to 回傳的 (x, y) 序列（含起點與終點）。
        """
        self.path = path

    def perform(self, engine: "Engine", unit: "MechUnit") -> ActionResult:
        # 路徑須至少含起點+一個目標格才算有效移動。
        if not self.path or len(self.path) < 2:
            return ActionResult(False, "無有效移動路徑。")
        # AP 不足無法移動。
        if unit.ap <= 0:
            return ActionResult(False, f"{unit.name} 沒有足夠的 AP 可移動。")

        # 終點即路徑最後一格。
        tx, ty = self.path[-1]
        unit.x, unit.y = tx, ty

        # 結算：扣 1 AP、標記本回合已移動。
        unit.ap -= 1
        unit.has_moved = True

        engine.message_log.add(f"{unit.name} 移動到 ({tx}, {ty})。")
        return ActionResult(True, f"移動到 ({tx}, {ty})")


class AttackAction(Action):
    """攻擊行動：以指定武器攻擊目標，呼叫 combat.resolve_attack 結算。

    結算（SPEC §7）委由 combat.resolve_attack 處理命中判定與傷害；本行動負責
    前置條件檢查、扣 weapon.ap_cost、累加武器開火熱量、把結果寫入訊息日誌。
    """

    def __init__(self, target: "MechUnit", weapon: "Weapon") -> None:
        """以目標與武器初始化。

        Args:
            target: 被攻擊的單位。
            weapon: 使用的武器（提供 ap_cost / heat / name）。
        """
        self.target = target
        self.weapon = weapon

    def perform(self, engine: "Engine", unit: "MechUnit"):
        # 目標須存活。
        if not self.target.alive:
            return ActionResult(False, "目標已被摧毀。")
        # AP 須足以負擔此武器。
        if unit.ap < self.weapon.ap_cost:
            return ActionResult(
                False, f"{unit.name} AP 不足以使用 {self.weapon.name}。"
            )

        # 交由 combat 結算（命中率 → 擲骰 → 傷害；含 C++/Python fallback）。
        # 依 SPEC §7 簽名假設：resolve_attack(engine, attacker, target, weapon)
        # 回傳具語意的結果物件（命中與否、傷害值等）。
        result = resolve_attack(engine, unit, self.target, self.weapon)

        # 結算：扣武器 AP 成本、開火累加熱量。
        unit.ap -= self.weapon.ap_cost
        unit.heat += self.weapon.heat

        # 攻擊行動直接回傳 combat 的結果物件，讓 UI/AI 取用其細節。
        return result


class WaitAction(Action):
    """待命行動：放棄該單位本回合剩餘行動（AP 歸零）。"""

    def perform(self, engine: "Engine", unit: "MechUnit") -> ActionResult:
        unit.ap = 0  # 結束該單位本回合。
        engine.message_log.add(f"{unit.name} 待命。")
        return ActionResult(True, f"{unit.name} 待命")


class OverwatchAction(Action):
    """守望行動：標記單位進入守望狀態，敵方進入射程時觸發反擊。

    本起手實作只負責「設旗標 + 結束該單位本回合」。實際的「敵入射程觸發攻擊」
    觸發點留給移動/回合系統呼叫（見下方 TODO 鉤子）：
        - 觸發時機建議：EnemyTurnState 中某敵方單位移動「逐格」經過時，檢查是否
          有處於 overwatch 的我方單位對其有 line_of_fire 且在武器射程內，若有則
          立即以 AttackAction 反擊一次並清除該守望旗標。
    """

    def perform(self, engine: "Engine", unit: "MechUnit") -> ActionResult:
        # 標記守望。假設 MechUnit 具 ``overwatch`` 旗標（bool）；若無，這裡以
        # setattr 動態附加，確保起手碼可運行（教學 part 後可正式納入 entity）。
        setattr(unit, "overwatch", True)
        # 守望會消耗單位本回合剩餘行動。
        unit.ap = 0
        engine.message_log.add(f"{unit.name} 進入守望。")

        # TODO（教學鉤子）：在移動/回合系統中實作真正的守望觸發：
        #   敵方單位移動進入射程時，呼叫 trigger_overwatch(engine, mover) 檢查
        #   並執行反擊。此處僅設旗標，不在本行動內主動掃描敵人。
        return ActionResult(True, f"{unit.name} 守望")


def trigger_overwatch(engine: "Engine", mover: "MechUnit") -> Optional["object"]:
    """（守望觸發鉤子，起手簡化版）。

    當 ``mover`` 移動/進入某格時呼叫，掃描敵對陣營中處於守望的單位，若對 mover
    有射擊線且在武器射程內，則以該武器執行一次 AttackAction 反擊並清除守望旗標。

    本版為「簡單實作 / 鉤子」：教學會在 part6（line of fire）與 part7（combat）
    完成後把射程與射線條件補齊。目前僅示範掃描與反擊串接，未做嚴格射程過濾。

    Args:
        engine: 遊戲引擎。
        mover: 剛移動的單位（被守望反擊的對象）。
    Returns:
        第一個成功反擊的結果物件，或 None（無單位反擊）。
    """
    # 延遲匯入避免循環依賴（fov 依賴 battlefield/entity，與本檔無衝突，但行動
    # 模組保持輕量，僅在觸發時才載入）。
    from .fov import has_line_of_fire

    for watcher in engine.units:
        # 略過：非存活、同陣營、未守望者。
        if not watcher.alive:
            continue
        if watcher.faction == mover.faction:
            continue
        if not getattr(watcher, "overwatch", False):
            continue

        # 須有可用武器且有射擊線。
        if not watcher.weapons:
            continue
        weapon = watcher.weapons[0]  # 起手以首要武器反擊。

        if not has_line_of_fire(
            engine.battlefield, watcher.x, watcher.y, mover.x, mover.y
        ):
            continue

        # 清除守望旗標並執行一次反擊。
        setattr(watcher, "overwatch", False)
        engine.message_log.add(f"{watcher.name} 的守望觸發！")
        return AttackAction(mover, weapon).perform(engine, watcher)

    return None

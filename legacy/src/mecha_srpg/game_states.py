"""game_states.py — 遊戲狀態機（SPEC §9）。

狀態：DeployState（生成戰場 + 部署雙方機甲）→ PlayerTurnState ↔ EnemyTurnState
→ GameOverState。每個狀態實作 handle_event(action)（接 input_handlers 解讀後的
InputAction），DeployState/EnemyTurnState 另有 on_enter 在進入時自動推進。

對應教學 part：part3（部署）、part4（回合/階段）、part5（移動）、part7（攻擊）、
part8（敵方 AI）、part10（勝負）。

座標慣例（SPEC §2）：邏輯 (x, y)。

防禦式設計：本檔對「行動執行」與「AI 規劃」一律以 try/except 包裹並寫入日誌，
即使部分跨模組介面尚未統一（見 INTEGRATION_NOTES.md），玩家回合仍可運行不崩潰。
"""

from __future__ import annotations

from typing import List, Optional, Tuple

from . import config, movement, fov
from .actions import AttackAction, MoveAction, WaitAction
from .components import Pilot, Stats, Weapon
from .config import Faction
from .entity import MechUnit
from .input_handlers import Command, InputAction
from .procgen import generate_battlefield
from .turn_manager import TurnManager


# ---------------------------------------------------------------------------
# 機甲範本（三款；數值自洽於 SPEC §7 公式）
# ---------------------------------------------------------------------------
def _scout(x: int, y: int, faction: Faction, name: str) -> MechUnit:
    """輕型偵察：高機動高迴避、火力弱、散熱好。"""
    stats = Stats(max_structure=18, armor=2, move=6, evasion=25, max_heat=100)
    pilot = Pilot(name=f"{name}駕駛", skill=15)
    weapons = [Weapon("機槍", damage=6, accuracy=70, min_range=1, max_range=4, heat=10, ap_cost=1)]
    return MechUnit(x, y, name, faction, stats, pilot, weapons, char="s")


def _trooper(x: int, y: int, faction: Faction, name: str) -> MechUnit:
    """中型泛用：均衡。"""
    stats = Stats(max_structure=28, armor=5, move=4, evasion=12, max_heat=100)
    pilot = Pilot(name=f"{name}駕駛", skill=12)
    weapons = [
        Weapon("自動砲", damage=12, accuracy=65, min_range=1, max_range=6, heat=25, ap_cost=1),
        Weapon("近戰拳", damage=16, accuracy=80, min_range=1, max_range=1, heat=15, ap_cost=1),
    ]
    return MechUnit(x, y, name, faction, stats, pilot, weapons, char="T")


def _heavy(x: int, y: int, faction: Faction, name: str) -> MechUnit:
    """重型火力：高結構高傷、慢、易過熱。"""
    stats = Stats(max_structure=40, armor=8, move=3, evasion=5, max_heat=100)
    pilot = Pilot(name=f"{name}駕駛", skill=10)
    weapons = [Weapon("飛彈艙", damage=22, accuracy=60, min_range=3, max_range=9, heat=45, ap_cost=1)]
    return MechUnit(x, y, name, faction, stats, pilot, weapons, char="H")


_ROSTER = (_scout, _trooper, _heavy)


def chebyshev(ax: int, ay: int, bx: int, by: int) -> int:
    """切比雪夫距離（八方等距），戰場格距離用。"""
    return max(abs(ax - bx), abs(ay - by))


class GameState:
    """狀態基底：持有 engine 參照。"""

    def __init__(self, engine) -> None:
        self.engine = engine

    def on_enter(self) -> None:  # 可選
        pass

    def handle_event(self, action: InputAction) -> None:  # 子類覆寫
        pass


# ---------------------------------------------------------------------------
# 部署
# ---------------------------------------------------------------------------
class DeployState(GameState):
    """開場：生成戰場、部署雙方機甲，進入玩家回合。"""

    def on_enter(self) -> None:
        eng = self.engine
        # 1) 生成戰場與部署點
        bf, player_pts, enemy_pts = generate_battlefield(deploy_count=3)
        eng.battlefield = bf

        # 2) 部署雙方機甲（依範本，數量取部署點與範本較小者）
        units: List[MechUnit] = []
        for i, (x, y) in enumerate(player_pts[: len(_ROSTER)]):
            units.append(_ROSTER[i % len(_ROSTER)](x, y, Faction.PLAYER, f"我方-{i+1}"))
        for i, (x, y) in enumerate(enemy_pts[: len(_ROSTER)]):
            units.append(_ROSTER[i % len(_ROSTER)](x, y, Faction.ENEMY, f"敵方-{i+1}"))
        eng.units = units

        # 3) 回合管理器（開局即玩家階段）
        eng.turn_manager = TurnManager(units)

        # 4) 初始視野與訊息
        _refresh_player_fov(eng)
        eng.add_message("=== 戰鬥開始：部署完成 ===")
        first = eng.player_units()
        if first:
            eng.cursor.set(first[0].x, first[0].y)

        # 5) 進入玩家回合
        eng.change_state(PlayerTurnState(eng))


# ---------------------------------------------------------------------------
# 玩家回合
# ---------------------------------------------------------------------------
class PlayerTurnState(GameState):
    """玩家階段：游標操作、選單位、移動模式、攻擊模式、結束回合。"""

    def __init__(self, engine) -> None:
        super().__init__(engine)
        self.mode: str = "select"  # select / move / attack

    # -- 模式輔助 ---------------------------------------------------------
    def _clear_mode(self) -> None:
        self.mode = "select"
        self.engine.move_highlight = set()
        self.engine.attack_highlight = set()
        self.engine.hit_preview = None

    def _enter_move_mode(self) -> None:
        eng = self.engine
        u = eng.selected_unit
        if u is None or u.faction != Faction.PLAYER or u.ap <= 0:
            eng.add_message("請先選取一個尚有 AP 的我方單位。")
            return
        try:
            reach = movement.reachable_tiles(eng.battlefield, eng.units, u)
            eng.move_highlight = set(reach.keys())
            self.mode = "move"
        except Exception as e:  # 介面分歧時不崩潰（見 INTEGRATION_NOTES）
            eng.add_message(f"移動範圍計算失敗（待整合）：{e}")

    def _enter_attack_mode(self) -> None:
        eng = self.engine
        u = eng.selected_unit
        if u is None or u.faction != Faction.PLAYER or u.ap <= 0:
            eng.add_message("請先選取一個尚有 AP 的我方單位。")
            return
        targets = self._targets_in_range(u)
        eng.attack_highlight = {(t.x, t.y) for t in targets}
        self.mode = "attack"
        if not targets:
            eng.add_message("射程內沒有可攻擊的目標。")

    def _targets_in_range(self, u: MechUnit) -> List[MechUnit]:
        """回傳 u 以任一武器可攻擊（射程內 + 有射擊線）的敵方單位。"""
        eng = self.engine
        weapon = u.weapons[0] if u.weapons else None
        if weapon is None:
            return []
        out: List[MechUnit] = []
        for e in eng.enemy_units():
            d = chebyshev(u.x, u.y, e.x, e.y)
            if not (weapon.min_range <= d <= weapon.max_range):
                continue
            try:
                if not fov.has_line_of_fire(eng.battlefield, u.x, u.y, e.x, e.y):
                    continue
            except Exception:
                pass  # 射線函式介面未定時，先不阻擋
            out.append(e)
        return out

    # -- 事件處理 ---------------------------------------------------------
    def handle_event(self, action: InputAction) -> None:
        eng = self.engine
        cmd = action.command

        if cmd == Command.MOVE:
            eng.cursor.move(action.dx, action.dy)
            if self.mode == "attack":
                self._update_hit_preview()
            return

        if cmd == Command.CANCEL:
            self._clear_mode()
            eng.selected_unit = None
            return

        if cmd == Command.NEXT_UNIT:
            self._cycle_unit()
            return

        if cmd == Command.MODE_MOVE:
            self._enter_move_mode()
            return

        if cmd == Command.MODE_ATTACK:
            self._enter_attack_mode()
            return

        if cmd == Command.WAIT:
            self._do_wait()
            return

        if cmd == Command.END_TURN:
            self._end_player_turn()
            return

        if cmd == Command.CONFIRM:
            self._confirm()
            return

    # -- 各指令實作 -------------------------------------------------------
    def _cycle_unit(self) -> None:
        eng = self.engine
        actionable = [u for u in eng.player_units() if u.ap > 0]
        if not actionable:
            eng.add_message("我方已無可行動單位，按 E 結束回合。")
            return
        cur = eng.selected_unit
        idx = actionable.index(cur) if cur in actionable else -1
        nxt = actionable[(idx + 1) % len(actionable)]
        eng.selected_unit = nxt
        eng.cursor.set(nxt.x, nxt.y)
        self._clear_mode()

    def _confirm(self) -> None:
        eng = self.engine
        cx, cy = eng.cursor.pos

        if self.mode == "select":
            u = eng.unit_at(cx, cy)
            if u is not None and u.faction == Faction.PLAYER:
                eng.selected_unit = u
                eng.add_message(f"選取 {u.name}（AP {u.ap}/{config.AP_PER_TURN}）。")
            return

        if self.mode == "move":
            if (cx, cy) in eng.move_highlight:
                self._do_move(cx, cy)
            else:
                eng.add_message("該格不在移動範圍內。")
            return

        if self.mode == "attack":
            tgt = eng.unit_at(cx, cy)
            if tgt is not None and tgt.faction == Faction.ENEMY and (cx, cy) in eng.attack_highlight:
                self._do_attack(tgt)
            else:
                eng.add_message("游標未指向射程內的敵方單位。")
            return

    def _do_move(self, tx: int, ty: int) -> None:
        eng = self.engine
        u = eng.selected_unit
        if u is None:
            return
        try:
            path = movement.path_to(eng.battlefield, eng.units, u, tx, ty)
            result = MoveAction(path).perform(eng, u)
            if not result:
                eng.add_message("移動失敗。")
        except Exception as e:
            eng.add_message(f"移動執行失敗（待整合）：{e}")
        self._clear_mode()
        _refresh_player_fov(eng)
        self._auto_end_if_done()

    def _do_attack(self, target: MechUnit) -> None:
        eng = self.engine
        u = eng.selected_unit
        if u is None or not u.weapons:
            return
        try:
            AttackAction(target, u.weapons[0]).perform(eng, u)
        except Exception as e:
            eng.add_message(f"攻擊執行失敗（待整合）：{e}")
        self._clear_mode()
        _refresh_player_fov(eng)
        if self._check_victory():
            return
        self._auto_end_if_done()

    def _do_wait(self) -> None:
        eng = self.engine
        u = eng.selected_unit
        if u is None:
            eng.add_message("尚未選取單位。")
            return
        try:
            WaitAction().perform(eng, u)
        except Exception as e:
            eng.add_message(f"待命失敗（待整合）：{e}")
        self._clear_mode()
        self._auto_end_if_done()

    def _update_hit_preview(self) -> None:
        """攻擊模式下，游標指向敵方時估算命中率字串（容錯）。"""
        eng = self.engine
        u = eng.selected_unit
        tgt = eng.unit_at(*eng.cursor.pos)
        if u is None or tgt is None or tgt.faction != Faction.ENEMY or not u.weapons:
            eng.hit_preview = None
            return
        try:
            from . import combat
            w = u.weapons[0]
            d = chebyshev(u.x, u.y, tgt.x, tgt.y)
            cover = fov.cover_against(eng.battlefield, tgt.x, tgt.y, u.x, u.y)
            chance = combat.hit_chance(
                w.accuracy, u.pilot.skill, w.max_range, d,
                tgt.stats.evasion, cover, u.heat_penalty,
            )
            eng.hit_preview = f"{int(chance * 100)}%"
        except Exception:
            eng.hit_preview = "—"

    def _auto_end_if_done(self) -> None:
        """若我方已無可行動單位，提示可結束（不自動結束，交由玩家按 E）。"""
        eng = self.engine
        if not any(u.ap > 0 for u in eng.player_units()):
            eng.add_message("我方單位皆已行動，按 E 結束回合。")

    def _end_player_turn(self) -> None:
        eng = self.engine
        # 回合結束維護：過熱結算（SPEC §7）
        for u in eng.player_units():
            dmg = u.end_turn_upkeep()
            if dmg:
                eng.add_message(f"{u.name} 過熱受損 {dmg}。")
        self._clear_mode()
        eng.selected_unit = None
        if self._check_victory():
            return
        eng.turn_manager.end_turn()  # 切到敵方
        eng.add_message("--- 敵方回合 ---")
        eng.change_state(EnemyTurnState(eng))

    def _check_victory(self) -> bool:
        eng = self.engine
        winner = eng.turn_manager.check_victory()
        if winner is not None:
            eng.change_state(GameOverState(eng, winner))
            return True
        return False


# ---------------------------------------------------------------------------
# 敵方回合
# ---------------------------------------------------------------------------
class EnemyTurnState(GameState):
    """敵方階段：在 on_enter 內依序讓每個敵方單位用 AI 行動，完成後切回玩家。

    注意：AI（ai.py）目前與 movement/actions 的介面有分歧（見 INTEGRATION_NOTES），
    故此處對每個單位的規劃與執行皆以 try/except 保護；失敗者跳過，不影響整體流程。
    """

    def on_enter(self) -> None:
        eng = self.engine
        from .ai import HostileAI
        ai = HostileAI()

        for unit in list(eng.enemy_units()):
            if not unit.alive:
                continue
            try:
                planned = ai.take_turn(eng, unit)
            except Exception as e:
                eng.add_message(f"{unit.name} AI 規劃失敗（待整合）：{e}")
                planned = []
            for act in planned or []:
                try:
                    act.perform(eng, unit)
                except Exception as e:
                    eng.add_message(f"{unit.name} 行動失敗（待整合）：{e}")
                    break
            # 過熱結算
            dmg = unit.end_turn_upkeep()
            if dmg:
                eng.add_message(f"{unit.name} 過熱受損 {dmg}。")

        # 勝負判定
        winner = eng.turn_manager.check_victory()
        if winner is not None:
            eng.change_state(GameOverState(eng, winner))
            return

        eng.turn_manager.end_turn()  # 切回玩家
        _refresh_player_fov(eng)
        eng.add_message(f"--- 第 {eng.turn_manager.turn_count} 回合：我方行動 ---")
        nxt = PlayerTurnState(eng)
        pu = eng.player_units()
        if pu:
            eng.selected_unit = None
            eng.cursor.set(pu[0].x, pu[0].y)
        eng.change_state(nxt)


# ---------------------------------------------------------------------------
# 結束
# ---------------------------------------------------------------------------
class GameOverState(GameState):
    """結束畫面：顯示勝敗。Enter 重開、Esc 離開。"""

    def __init__(self, engine, winner: Faction) -> None:
        super().__init__(engine)
        self.winner = winner

    def on_enter(self) -> None:
        who = "我方獲勝！" if self.winner == Faction.PLAYER else "敵方獲勝…"
        self.engine.add_message(f"=== 戰鬥結束：{who}（Enter 重開 / Esc 離開）===")

    def handle_event(self, action: InputAction) -> None:
        if action.command == Command.CONFIRM:
            # 重開：重置引擎狀態並回到部署
            eng = self.engine
            eng.units = []
            eng.selected_unit = None
            eng.move_highlight = set()
            eng.attack_highlight = set()
            eng.explored = None
            eng.visible = None
            eng.change_state(DeployState(eng))
        elif action.command == Command.CANCEL:
            raise SystemExit()


# ---------------------------------------------------------------------------
# 視野輔助
# ---------------------------------------------------------------------------
def _refresh_player_fov(engine) -> None:
    """以所有我方單位的視野聯集更新 engine.visible，並累積到 explored（容錯）。"""
    import numpy as np

    bf = engine.battlefield
    if bf is None:
        return
    h = getattr(bf, "height", config.MAP_H)
    w = getattr(bf, "width", config.MAP_W)
    combined: Optional["np.ndarray"] = None
    try:
        for u in engine.player_units():
            vis = np.asarray(fov.compute_visible(bf, u.x, u.y, 12), dtype=bool)
            combined = vis if combined is None else (combined | vis)
    except Exception:
        combined = None

    if combined is None:
        combined = np.ones((h, w), dtype=bool)  # 退化：全可見，確保能呈現

    engine.visible = combined
    if engine.explored is None:
        engine.explored = np.zeros_like(combined)
    engine.explored |= combined

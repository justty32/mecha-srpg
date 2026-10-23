"""ai.py — 敵方戰術 AI（SPEC §4 / §8）。

用途：為一個敵方單位（Faction.ENEMY）規劃本回合的行動序列。
核心做法：**列舉候選 → 評分 → 取最高分**。
- 候選空間 = 「可達格（movement.reachable_tiles）× 可攻擊的我方目標 × 武器」。
- 每個候選用 `mtcore.score_action(...)` 評分（無 C++ 則用純 Python `_py_score_action`，同邏輯）。
- 評分偏好：高期望傷害、可一擊擊殺、攻擊後自身有掩體、靠近最近敵人。
- 取最高分者，產生對應 Action 序列：先 MoveAction 移到該格，再 AttackAction 開火（受 AP 限制）。
- 若沒有任何可攻擊目標，改用 Dijkstra 朝最近的我方單位趨近（移動範圍內最靠近的可達格）。

對應教學 part：part8_ai（候選評分、趨近/掩體/開火）、part9_cpp_core（評分熱點換 C++）。

座標慣例（SPEC §2）：邏輯座標一律 (x, y)。

熱點說明（為何適合下沉 C++，SPEC §4）：
- 候選數 = |可達格| × |我方目標| × |武器|，單回合每單位可達數百~數千；
  每個候選都要算 hit_chance / expected_damage / score_action。
- 這是一個巢狀迴圈裡的純算術評分，無 I/O、無物件配置，是最典型「適合下沉 C++」的熱點：
  Python 端只負責列舉候選與組裝 Action，數學交給 mtcore 批次跑。
"""

from __future__ import annotations

from typing import List, Optional, Tuple

from . import combat, config, movement
from .actions import AttackAction, MoveAction, WaitAction
from .config import Faction

# ---------------------------------------------------------------------------
# C++ 核心偵測（與 combat.py 同樣的漸進原則，SPEC §4）
# ---------------------------------------------------------------------------
try:  # pragma: no cover - 取決於是否已編譯 C++
    import mtcore  # type: ignore

    _HAS_CORE = True
except ImportError:
    mtcore = None  # type: ignore
    _HAS_CORE = False


# ---------------------------------------------------------------------------
# 評分函式（SPEC §4 score_action；純 Python 與 C++ 必須同邏輯）
# ---------------------------------------------------------------------------
def _py_score_action(
    my_hp: int,
    target_hp: int,
    expected_dmg: float,
    hit: float,
    dist_after: int,
    cover_after: int,
    in_range: bool,
) -> float:
    """純 Python 版候選評分（對齊 SPEC §4 `mtcore.score_action(...)`）。

    參數：
    - my_hp:        我（行動單位）目前結構
    - target_hp:    目標目前結構
    - expected_dmg: 此候選的期望傷害（combat.expected_damage）
    - hit:          此候選命中率（0.0–1.0）
    - dist_after:   移動到候選格後與最近敵人的距離（越小越靠近）
    - cover_after:  移動到候選格後自身的掩體等級（0/1/2）
    - in_range:     此候選是否能實際對目標開火（射程內且有視線）

    評分傾向（越高越好）：
      1) 高期望傷害（主項）。
      2) 可一擊擊殺（期望傷害 ≥ 目標結構）給大額獎勵——優先收掉殘血。
      3) 攻擊後自身有掩體（cover_after）→ 加分，鼓勵打完躲好。
      4) 靠近最近敵人（dist_after 越小越好）→ 以負權重懲罰距離。
      5) 不在射程內（in_range=False）→ 此候選不能開火，期望傷害視為 0、僅保留趨近誘因。
    """
    score = 0.0

    if in_range:
        # 主項：期望傷害（命中率已折算在 expected_dmg 內）
        score += expected_dmg * 10.0
        # 擊殺獎勵：期望傷害足以打掉目標剩餘結構
        if expected_dmg >= target_hp:
            score += 50.0
        # 命中率本身也微幅加權（鼓勵穩定的攻擊）
        score += hit * 5.0
    else:
        # 不能開火的候選：沒有傷害貢獻，只靠趨近與掩體誘因（見下）。
        pass

    # 掩體獎勵：打完後站在掩體裡更安全
    score += cover_after * 8.0

    # 趨近獎勵：距離越近分數越高（負權重懲罰距離）
    score -= dist_after * 1.0

    # 低血量時更看重掩體（自保），以一個小係數放大掩體價值
    if my_hp > 0:
        # my_hp 越低，掩體加權越大；用簡單線性放大，避免除零
        score += cover_after * (100.0 / (my_hp + 1)) * 0.1

    return score


def score_action(
    my_hp: int,
    target_hp: int,
    expected_dmg: float,
    hit: float,
    dist_after: int,
    cover_after: int,
    in_range: bool,
) -> float:
    """評分統一入口（SPEC §4）。有 C++ 走 mtcore，否則走純 Python。"""
    if _HAS_CORE:
        return mtcore.score_action(
            my_hp, target_hp, expected_dmg, hit, dist_after, cover_after, in_range
        )
    return _py_score_action(
        my_hp, target_hp, expected_dmg, hit, dist_after, cover_after, in_range
    )


# ---------------------------------------------------------------------------
# HostileAI：敵方單位的決策器
# ---------------------------------------------------------------------------
class HostileAI:
    """對單一敵方單位做出本回合決策（SPEC §8）。

    用法：`actions = HostileAI().take_turn(engine, unit)`，
    回傳要依序執行的 Action 列表（由 turn_manager / game_states 實際執行）。
    """

    def take_turn(self, engine, unit) -> List:
        """規劃 unit 本回合的行動序列（SPEC §8）。

        回傳一個 Action 列表（可能含 MoveAction、AttackAction、WaitAction），
        由呼叫端逐一執行；本方法不直接改動 engine 狀態（純規劃）。

        流程：
        1. 找出所有存活的我方（PLAYER）單位作為潛在目標。
        2. 列舉候選（可達格 × 目標 × 武器），逐一評分，取最高分。
        3. 若最佳候選能開火：產生 [MoveAction?, AttackAction]（受 AP 限制）。
        4. 若無任何可攻擊候選：用 Dijkstra 朝最近我方趨近（move 範圍內最靠近的可達格）。
        """
        # 沒有 AP 就直接結束
        if unit.ap <= 0 or not unit.alive:
            return [WaitAction(unit)]

        enemies = [
            u
            for u in engine.units
            if u.faction == Faction.PLAYER and u.alive
        ]
        if not enemies:
            # 場上沒有我方單位可打：原地待命
            return [WaitAction(unit)]

        best = self._best_attack_candidate(engine, unit, enemies)
        if best is not None:
            return self._build_actions_from_candidate(unit, best)

        # 沒有可攻擊候選：趨近最近我方
        return self._approach_actions(engine, unit, enemies)

    # ------------------------------------------------------------------
    # 候選列舉與評分
    # ------------------------------------------------------------------
    def _best_attack_candidate(self, engine, unit, enemies) -> Optional[dict]:
        """列舉「可達格 × 目標 × 武器」並回傳評分最高、且可實際開火的候選。

        回傳 dict：
          {"dest": (x, y), "target": MechUnit, "weapon": Weapon, "score": float,
           "needs_move": bool}
        若沒有任何「能開火」的候選，回傳 None（交給趨近邏輯）。
        """
        from . import fov  # 延遲匯入避免循環依賴

        bf = engine.battlefield

        # movement.reachable_tiles(battlefield, unit) -> {(x, y): cost}
        # 含單位目前所在格（cost=0），代表「原地不動就攻擊」也是候選。
        reachable = movement.reachable_tiles(bf, unit)
        # 確保原地 (x, y) 也是候選之一
        if (unit.x, unit.y) not in reachable:
            reachable = dict(reachable)
            reachable[(unit.x, unit.y)] = 0

        best: Optional[dict] = None

        for (tx, ty), _cost in reachable.items():
            # 從候選格到「最近敵人」的距離，給趨近項與 score 用
            dist_after = self._nearest_enemy_distance(tx, ty, enemies)

            for target in enemies:
                # 候選格相對目標的距離（切比雪夫，與 combat 一致）
                distance = combat.chebyshev_distance(tx, ty, target.x, target.y)

                # 移動到候選格後，自身相對「該目標方向」可獲得的掩體
                cover_after = fov.cover_against(bf, tx, ty, target.x, target.y)
                # 目標相對攻擊者方向的掩體（影響命中）
                target_cover = fov.cover_against(bf, target.x, target.y, tx, ty)

                # 站在候選格能否看到目標（line_of_fire 需要起點座標）
                has_los = fov.line_of_fire(bf, tx, ty, target.x, target.y)

                for weapon in unit.weapons:
                    in_range = (
                        weapon.min_range <= distance <= weapon.max_range
                    ) and has_los

                    # 過熱命中懲罰：以開火當下的熱量估計（移動不生熱，沿用目前 heat）
                    heat_penalty = (
                        config.OVERHEAT_ACC_PENALTY
                        if unit.heat >= unit.stats.max_heat
                        else 0
                    )

                    if in_range:
                        hit = combat.hit_chance(
                            weapon.accuracy,
                            unit.pilot.skill,
                            weapon.max_range,
                            distance,
                            target.stats.evasion,
                            target_cover,
                            heat_penalty,
                        )
                        exp_dmg = combat.expected_damage(
                            weapon.accuracy,
                            unit.pilot.skill,
                            weapon.max_range,
                            distance,
                            target.stats.evasion,
                            target_cover,
                            heat_penalty,
                            weapon.damage,
                            target.stats.armor,
                        )
                    else:
                        hit = 0.0
                        exp_dmg = 0.0

                    sc = score_action(
                        unit.structure,
                        target.structure,
                        exp_dmg,
                        hit,
                        dist_after,
                        cover_after,
                        in_range,
                    )

                    # 只把「能實際開火」的候選當成攻擊解；不能開火者交給趨近邏輯。
                    if not in_range:
                        continue

                    if best is None or sc > best["score"]:
                        best = {
                            "dest": (tx, ty),
                            "target": target,
                            "weapon": weapon,
                            "score": sc,
                            "needs_move": (tx, ty) != (unit.x, unit.y),
                        }

        return best

    def _build_actions_from_candidate(self, unit, cand: dict) -> List:
        """把最佳攻擊候選轉成 Action 序列（受 AP 限制，SPEC §5/§7）。

        - 需要移動且 AP 足夠（移動 1 AP）：先 MoveAction 再 AttackAction。
        - AP 不足以同時移動+攻擊時：
            * 若不必移動就能打 → 直接攻擊。
            * 若必須移動才能打、但 AP 只夠移動 → 只移動（為下回合創造攻擊位）。
        - 攻擊本身消耗 weapon.ap_cost（預設 1）。
        """
        actions: List = []
        ap = unit.ap
        needs_move = cand["needs_move"]
        weapon = cand["weapon"]
        target = cand["target"]
        dest = cand["dest"]

        move_cost = 1  # 移動消耗 1 AP（SPEC §5）
        atk_cost = getattr(weapon, "ap_cost", 1)

        if needs_move:
            if ap >= move_cost:
                actions.append(MoveAction(unit, dest[0], dest[1]))
                ap -= move_cost
            else:
                # 連移動都不夠：待命
                return [WaitAction(unit)]

        # 移動後若還有 AP 開火
        if ap >= atk_cost:
            actions.append(AttackAction(unit, target, weapon))
            ap -= atk_cost
        elif not needs_move:
            # 不必移動但 AP 不足攻擊（理論上罕見）：待命
            return [WaitAction(unit)]

        if not actions:
            return [WaitAction(unit)]
        return actions

    # ------------------------------------------------------------------
    # 趨近（無可攻擊目標時）
    # ------------------------------------------------------------------
    def _approach_actions(self, engine, unit, enemies) -> List:
        """無可攻擊目標時，朝最近我方單位趨近（SPEC §8）。

        以 Dijkstra 距離場（movement）計算可達格，從中選「離最近敵人最近」的可達格移動。
        若已無更靠近的格可走，原地待命。
        """
        bf = engine.battlefield

        # 找最近的敵人（以切比雪夫距離）
        target = min(
            enemies,
            key=lambda e: combat.chebyshev_distance(unit.x, unit.y, e.x, e.y),
        )

        reachable = movement.reachable_tiles(bf, unit)
        if not reachable:
            return [WaitAction(unit)]

        # 目前到目標的距離（基準）
        cur_dist = combat.chebyshev_distance(unit.x, unit.y, target.x, target.y)

        best_tile: Optional[Tuple[int, int]] = None
        best_dist = cur_dist
        for (tx, ty) in reachable.keys():
            if (tx, ty) == (unit.x, unit.y):
                continue
            d = combat.chebyshev_distance(tx, ty, target.x, target.y)
            if d < best_dist:
                best_dist = d
                best_tile = (tx, ty)

        if best_tile is None or unit.ap <= 0:
            # 無法更靠近，或沒有 AP：待命
            return [WaitAction(unit)]

        return [MoveAction(unit, best_tile[0], best_tile[1])]

    # ------------------------------------------------------------------
    # 工具
    # ------------------------------------------------------------------
    @staticmethod
    def _nearest_enemy_distance(x: int, y: int, enemies) -> int:
        """(x, y) 到最近敵人單位的切比雪夫距離（供評分趨近項用）。"""
        return min(
            combat.chebyshev_distance(x, y, e.x, e.y) for e in enemies
        )

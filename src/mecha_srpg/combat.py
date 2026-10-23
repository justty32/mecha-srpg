"""combat.py — 命中／傷害／熱量結算（SPEC §4 / §7）。

用途：實作戰鬥的數學核心與一次完整攻擊的結算流程。
- 命中率 `hit_chance`、傷害 `resolve_damage` 的「公式」是鐵則（SPEC §7），
  C++（`mtcore`）與純 Python fallback（`_py_*`）必須完全一致。
- 對外提供統一介面 `hit_chance()` / `resolve_damage()`：偵測到已編譯的 `mtcore`
  就走 C++，否則自動回退純 Python，確保「沒編 C++ 也能玩」（SPEC §4 漸進原則）。
- `resolve_attack()` 把一次攻擊的完整流程串起來（距離→掩體→射程／視線→過熱→
  命中判定→傷害→加熱→訊息），回傳 `AttackResult` dataclass 供上層（actions/ai）使用。
- `expected_damage()` 提供期望傷害（命中率 × 期望傷害值），供 AI 評分使用。

對應教學 part：part7_combat（結算）、part9_cpp_core（同公式換 C++）。

座標慣例（SPEC §2）：邏輯座標一律 (x, y)。距離計算見 resolve_attack 內說明。

熱點說明（為何適合下沉 C++，SPEC §4）：
- `hit_chance` / `resolve_damage` 是純算術小函式，但在 AI 列舉「可達格 × 目標 × 武器」
  時會被呼叫成千上萬次（見 ai.py），是典型的 CPU-bound 熱迴圈，適合下沉 C++。
"""

from __future__ import annotations

from dataclasses import dataclass

from . import config

# ---------------------------------------------------------------------------
# C++ 核心偵測（SPEC §4 漸進原則）
# 若已編譯安裝 mtcore 就用它；否則 _HAS_CORE=False，改用本檔 _py_* 純 Python 版。
# ---------------------------------------------------------------------------
try:  # pragma: no cover - 取決於是否已編譯 C++
    import mtcore  # type: ignore

    _HAS_CORE = True
except ImportError:  # 未編譯 C++：純 Python fallback
    mtcore = None  # type: ignore
    _HAS_CORE = False


# ---------------------------------------------------------------------------
# 純 Python 公式實作（SPEC §7 鐵則；簽名對齊 SPEC §4）
# 這些 _py_* 與 C++ mtcore 內的對應函式必須是「同一條公式」。
# ---------------------------------------------------------------------------
def _py_hit_chance(
    attacker_acc: int,
    pilot_skill: int,
    weapon_range: int,
    distance: int,
    target_evasion: int,
    cover: int,
    heat_penalty: int,
) -> float:
    """純 Python 版命中率（SPEC §7）。回傳 clamp 到 [0.05, 0.95] 的 0.0–1.0 值。

    參數簽名對齊 SPEC §4 的 `mtcore.hit_chance(...)`：
    - attacker_acc:   武器基礎命中（weapon.accuracy）
    - pilot_skill:    駕駛技能（pilot.skill）
    - weapon_range:   武器最大射程（weapon.max_range）；配合 distance 判定是否超程
    - distance:       攻擊者與目標的整數距離（切比雪夫，見 resolve_attack）
    - target_evasion: 目標迴避（target.stats.evasion）
    - cover:          目標所在掩體等級（0/1/2）
    - heat_penalty:   過熱命中懲罰（過熱時為 OVERHEAT_ACC_PENALTY，否則 0）

    注意：射程下限（min_range）無法只由 weapon_range 表達，
    依 SPEC §4 簽名僅以 `distance > weapon_range` 視為超程；
    完整 min/max 射程判定在 resolve_attack 內先行檢查（並由那裡決定 heat_penalty 等）。
    """
    # base = 武器命中 + 駕駛技能
    base = attacker_acc + pilot_skill
    # 超出射程：依 SPEC §4 簽名，只有 max_range 資訊，distance 超過即重罰 100
    range_pen = 0 if distance <= weapon_range else config.RANGE_PENALTY
    # 每級掩體 -20（百分點）
    cover_pen = cover * config.COVER_PENALTY_PER_LEVEL
    # 目標迴避直接扣命中
    evasion_pen = target_evasion
    # 過熱命中懲罰
    heat_pen = heat_penalty

    chance = (base - range_pen - cover_pen - evasion_pen - heat_pen) / 100.0
    # clamp 到 [0.05, 0.95]（SPEC §7）
    if chance < config.HIT_CHANCE_MIN:
        return config.HIT_CHANCE_MIN
    if chance > config.HIT_CHANCE_MAX:
        return config.HIT_CHANCE_MAX
    return chance


def _py_resolve_damage(
    weapon_damage: int,
    target_armor: int,
    is_rear: bool,
    roll: float,
) -> int:
    """純 Python 版傷害結算（SPEC §7）。回傳實際結構傷害（≥0）。

    參數簽名對齊 SPEC §4 的 `mtcore.resolve_damage(...)`：
    - weapon_damage: 武器基礎傷害（weapon.damage）
    - target_armor:  目標裝甲（target.stats.armor）
    - is_rear:       是否背後攻擊（背擊 1.5 倍）
    - roll:          命中骰（rng.random()）；roll < hit_chance 才命中，否則 0

    注意：本函式內不知道 hit_chance；roll 與 hit_chance 的比較由呼叫端（resolve_attack）
    完成後，命中時才呼叫本函式並把 roll 一併傳入以維持 SPEC §4 簽名一致。
    為求與 C++ 完全同行為，這裡仍保留 roll 參數但不再二次判定命中（呼叫端已判定）。
    """
    # dmg = max(0, 武器傷害 - 裝甲)
    dmg = weapon_damage - target_armor
    if dmg < 0:
        dmg = 0
    # 背擊倍率
    if is_rear:
        dmg = int(dmg * config.REAR_MULT)
    return dmg


# ---------------------------------------------------------------------------
# 對外統一介面：自動選擇 C++ 或純 Python（SPEC §4）
# ---------------------------------------------------------------------------
def hit_chance(
    attacker_acc: int,
    pilot_skill: int,
    weapon_range: int,
    distance: int,
    target_evasion: int,
    cover: int,
    heat_penalty: int,
) -> float:
    """命中率統一入口（SPEC §4）。有 C++ 走 mtcore，否則走純 Python。"""
    if _HAS_CORE:
        return mtcore.hit_chance(
            attacker_acc,
            pilot_skill,
            weapon_range,
            distance,
            target_evasion,
            cover,
            heat_penalty,
        )
    return _py_hit_chance(
        attacker_acc,
        pilot_skill,
        weapon_range,
        distance,
        target_evasion,
        cover,
        heat_penalty,
    )


def resolve_damage(
    weapon_damage: int,
    target_armor: int,
    is_rear: bool,
    roll: float,
) -> int:
    """傷害結算統一入口（SPEC §4）。有 C++ 走 mtcore，否則走純 Python。"""
    if _HAS_CORE:
        return mtcore.resolve_damage(weapon_damage, target_armor, is_rear, roll)
    return _py_resolve_damage(weapon_damage, target_armor, is_rear, roll)


# ---------------------------------------------------------------------------
# 攻擊結果資料物件
# ---------------------------------------------------------------------------
@dataclass
class AttackResult:
    """一次攻擊的完整結果（供 actions / ui / ai 使用）。

    欄位：
    - hit:      是否命中
    - damage:   實際造成的結構傷害（未命中為 0）
    - killed:   是否將目標擊殺（攻擊後 target.alive 為 False）
    - chance:   本次命中率（0.0–1.0），方便 UI 顯示與除錯
    - message:  繁體中文戰報字串（寫入 message_log）
    """

    hit: bool
    damage: int
    killed: bool
    chance: float
    message: str


# ---------------------------------------------------------------------------
# 距離計算說明（選擇切比雪夫）
# ---------------------------------------------------------------------------
def chebyshev_distance(x0: int, y0: int, x1: int, y1: int) -> int:
    """切比雪夫距離（八方格距離）：max(|dx|, |dy|)。

    為何選切比雪夫而非歐式：
    - 本遊戲為方格戰棋，移動允許八方向（含對角）；移動範圍（movement.reachable_tiles）
      與射程語意應一致採「格數」。切比雪夫剛好等於八方向移動所需的最少步數，
      與玩家「一格一格數」的直覺相符，也避免歐式距離帶來的浮點與斜向射程不一致問題。
    - 射程上下限（min_range / max_range）以整數格數比較，切比雪夫回傳整數最自然。
    """
    dx = x1 - x0
    if dx < 0:
        dx = -dx
    dy = y1 - y0
    if dy < 0:
        dy = -dy
    return dx if dx > dy else dy


# ---------------------------------------------------------------------------
# 完整攻擊結算流程（SPEC §7 命中判定流程）
# ---------------------------------------------------------------------------
def resolve_attack(engine, attacker, target, weapon) -> AttackResult:
    """結算一次「attacker 用 weapon 攻擊 target」。

    流程（SPEC §7）：
    1. 算距離（切比雪夫，見 chebyshev_distance）。
    2. 取目標所在格的掩體等級（fov.cover_against）。
    3. 檢查武器射程（min_range ≤ distance ≤ max_range）與視線（fov.line_of_fire）；
       任一不滿足→直接視為未命中（射程外/無視線無法攻擊）。
    4. 算過熱命中懲罰：attacker 過熱（heat ≥ max_heat）時為 OVERHEAT_ACC_PENALTY，否則 0。
    5. 命中判定：hit_chance → 取 engine.rng.random() 與之比較（rng.random() < chance）。
    6. 命中則 resolve_damage 並 target.take_damage(dmg)。
    7. attacker 加熱（weapon.heat）。
    8. 回傳 AttackResult（hit/damage/killed/chance/訊息）。

    參數：
    - engine: 持有 rng / battlefield / message_log 等全域狀態（SPEC §9）。
    - attacker, target: MechUnit（SPEC §5）。
    - weapon: Weapon（SPEC §5）。

    註：散熱與過熱結算（OVERHEAT_DAMAGE、HEAT_DISSIPATION）掛在單位的 reset_turn，
    本函式只負責「攻擊瞬間」的加熱與過熱命中懲罰（SPEC §7）。
    """
    # 延遲匯入：避免模組層級循環依賴（fov / battlefield 可能反向引用 combat）。
    from . import fov

    bf = engine.battlefield

    # --- 1. 距離（切比雪夫）---
    distance = chebyshev_distance(attacker.x, attacker.y, target.x, target.y)

    # --- 2. 掩體：目標相對於攻擊者方向所獲得的掩體等級 ---
    # fov.cover_against(battlefield, target_x, target_y, from_x, from_y) -> int(0/1/2)
    cover = fov.cover_against(bf, target.x, target.y, attacker.x, attacker.y)

    # --- 3. 射程與視線檢查 ---
    in_range = weapon.min_range <= distance <= weapon.max_range
    has_los = fov.line_of_fire(bf, attacker.x, attacker.y, target.x, target.y)

    # --- 4. 過熱命中懲罰 ---
    heat_penalty = (
        config.OVERHEAT_ACC_PENALTY
        if attacker.heat >= attacker.stats.max_heat
        else 0
    )

    if not in_range or not has_los:
        # 射程外或無視線：必定未命中，亦不加熱（沒有實際開火）。
        reason = "射程外" if not in_range else "無視線"
        msg = (
            f"{attacker.name} 以 {weapon.name} 攻擊 {target.name} "
            f"失敗（{reason}，距離 {distance}）。"
        )
        return AttackResult(hit=False, damage=0, killed=False, chance=0.0, message=msg)

    # --- 5. 命中率 ---
    chance = hit_chance(
        weapon.accuracy,
        attacker.pilot.skill,
        weapon.max_range,
        distance,
        target.stats.evasion,
        cover,
        heat_penalty,
    )

    # --- 攻擊瞬間加熱（不論命中與否，開火即生熱）（SPEC §7）---
    attacker.heat += weapon.heat

    # --- 命中判定：rng.random() < chance ---
    roll = engine.rng.random()
    hit = roll < chance

    if not hit:
        msg = (
            f"{attacker.name} 以 {weapon.name} 攻擊 {target.name} "
            f"未命中（命中率 {chance:.0%}）。"
        )
        return AttackResult(hit=False, damage=0, killed=False, chance=chance, message=msg)

    # --- 6. 傷害 ---
    # 背擊判定：本起手專案暫不細分朝向，預設正面（is_rear=False）。
    # 若日後 entity 引入朝向，可在此以 attacker/target 位置與 target.facing 計算。
    is_rear = False
    damage = resolve_damage(weapon.damage, target.stats.armor, is_rear, roll)
    target.take_damage(damage)

    killed = not target.alive
    if killed:
        msg = (
            f"{attacker.name} 以 {weapon.name} 命中並擊毀 {target.name}"
            f"（{damage} 結構傷害）！"
        )
    else:
        msg = (
            f"{attacker.name} 以 {weapon.name} 命中 {target.name}"
            f"（{damage} 結構傷害，剩餘 {target.structure}）。"
        )
    return AttackResult(hit=True, damage=damage, killed=killed, chance=chance, message=msg)


# ---------------------------------------------------------------------------
# 期望傷害（供 AI 評分使用）
# ---------------------------------------------------------------------------
def expected_damage(
    attacker_acc: int,
    pilot_skill: int,
    weapon_range: int,
    distance: int,
    target_evasion: int,
    cover: int,
    heat_penalty: int,
    weapon_damage: int,
    target_armor: int,
    is_rear: bool = False,
) -> float:
    """期望傷害 = 命中率 × 命中時的傷害值（SPEC §8 AI 用）。

    AI 在列舉候選時用它比較「哪個移動+攻擊組合最划算」，不需要實際擲骰。
    命中時的傷害值與 resolve_damage 同公式（roll 不影響傷害大小，僅用於判定命中），
    故此處以 roll=0.0 取其確定的傷害量。
    """
    chance = hit_chance(
        attacker_acc,
        pilot_skill,
        weapon_range,
        distance,
        target_evasion,
        cover,
        heat_penalty,
    )
    # roll 不影響傷害量（命中時的傷害是固定的），傳 0.0 取確定傷害。
    dmg = resolve_damage(weapon_damage, target_armor, is_rear, 0.0)
    return chance * dmg

# Part 7 — 戰鬥結算：命中、傷害、熱量

> 對應原始碼：`combat.py`、`actions.py::AttackAction`。
> 前一章：[part6 視野與掩體](part6_fov_cover.md)　·　下一章：[part8 敵方 AI](part8_ai.md)

## 本章目標
把「一次攻擊」變成可計算的數字：命中率、傷害、熱量，並寫進訊息日誌。所有公式是 **SPEC §7 鐵則**，C++ 版（[part9](part9_cpp_core.md)）與純 Python 版必須完全一致。

## 1. 命中率公式（SPEC §7）

```
base       = weapon.accuracy + pilot.skill
range_pen  = 0  若 min_range ≤ distance ≤ max_range，否則 100（超射程幾乎打不中）
cover_pen  = cover * 20          # 每級掩體 -20
evasion_pen= target.evasion
heat_pen   = 過熱時 25，否則 0
chance     = (base - range_pen - cover_pen - evasion_pen - heat_pen) / 100
回傳 clamp(chance, 0.05, 0.95)
```

```python
def _py_hit_chance(accuracy, skill, max_range, distance, evasion, cover, heat_penalty):
    base = accuracy + skill
    range_pen = 0 if distance <= max_range else config.RANGE_PENALTY
    chance = (base - range_pen - cover * config.COVER_PENALTY_PER_LEVEL
              - evasion - heat_penalty) / 100.0
    return max(config.HIT_CHANCE_MIN, min(config.HIT_CHANCE_MAX, chance))
```

> 永遠留 5%~95%：再爛也有一線機會，再準也可能失手——SRPG 的緊張感來源。

**數值範例**：自動砲（acc 65）+ 駕駛 skill 12，打 3 格外、躲在 1 級掩體（cover_pen 20）、迴避 12 的目標、未過熱：
`(65+12) - 0 - 20 - 12 - 0 = 45 → 45% 命中`。

## 2. 傷害公式

```
dmg = max(0, weapon.damage - target.armor)
若背後攻擊(is_rear)：dmg = int(dmg * REAR_MULT)     # 1.5×
命中判定：rng.random() < hit_chance 才造成 dmg，否則 0
```

```python
def _py_resolve_damage(weapon_damage, target_armor, is_rear):
    dmg = max(0, weapon_damage - target_armor)
    if is_rear:
        dmg = int(dmg * config.REAR_MULT)
    return dmg
```

> 裝甲是**減法**：低傷高頻武器被厚甲吃掉，重武器才能破甲——驅動「武器搭配」的取捨。

## 3. 熱量系統（機甲風味核心）

- 開火：`unit.heat += weapon.heat`（`AttackAction` 結算）。
- 過熱（`heat ≥ max_heat`）：命中 -`OVERHEAT_ACC_PENALTY`(25)，且回合結束受 `OVERHEAT_DAMAGE`(5) 結構傷害（`end_turn_upkeep`）。
- 散熱：每回合開始 `heat -= HEAT_DISSIPATION`(20)（`reset_turn`）。

→ 重型飛彈艙（heat 45）連開兩砲就逼近過熱，玩家得在「爆發輸出」與「冒過熱風險」間抉擇。

## 4. 一次攻擊的流程：`resolve_attack`

```python
def resolve_attack(engine, attacker, target, weapon):
    distance = chebyshev_distance(attacker.x, attacker.y, target.x, target.y)
    cover = fov.cover_against(engine.battlefield, target.x, target.y, attacker.x, attacker.y)
    chance = hit_chance(weapon.accuracy, attacker.pilot.skill, weapon.max_range,
                        distance, target.stats.evasion, cover, attacker.heat_penalty)
    if get_rng().random() < chance:
        dmg = resolve_damage(weapon.damage, target.stats.armor, is_rear=False)
        target.take_damage(dmg)
        engine.add_message(f"{attacker.name} 命中 {target.name}，造成 {dmg} 傷害！")
    else:
        engine.add_message(f"{attacker.name} 對 {target.name} 失手。")
```

`AttackAction.perform()` 再負責扣 `weapon.ap_cost`、加 `weapon.heat`、回傳結果給 UI/AI。

> **距離用切比雪夫**（八方等距）與 FOV/AI 一致；若改歐式或曼哈頓，三處要一起改。

## 5. `expected_damage`：給 AI 用的期望值

AI 評分需要「這一擊大概能造成多少傷害」：`expected_damage = hit_chance × max(0, damage - armor)`。命中率已折算在內，讓 AI 自然偏好「高命中 × 高破甲」的組合（[part8](part8_ai.md)）。

## 6. 與 C++ 的關係（預告）
這些是**純算術、無 I/O** 的熱點，[part9](part9_cpp_core.md) 會把 `hit_chance`/`resolve_damage` 原封不動搬進 `mtcore.cpp`。重點：**兩邊公式必須逐字一致**，否則編不編 C++ 會打出不同數字。驗證法：對同一組輸入比較 `_py_hit_chance(...)` 與 `mtcore.hit_chance(...)`。

## 本章完成後你應該能…
- 手算一次攻擊的命中率與傷害。
- 解釋熱量如何約束輸出節奏。
- 說明為何 `combat` 的公式要與 C++ 版保持一致。

下一章 → [part8 敵方 AI](part8_ai.md)

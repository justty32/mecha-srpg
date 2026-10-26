# ai／支援收益估值（SPEC-GAP 補）

[ai](../ai.md)

2026-10-26 lead-engine-next 補，由 ai.md 拆出（原文不改）。

## berserk 自護與自增益

SPEC-GAP 補（2026-10-26 lead-engine-next）：berserk 保持追敵與不退的狂攻評分，容許目標僅自身且有正邊際收益的自護／自增益。攻擊增益沿用既有公式，須預覽確認新增屬性且施放後仍有合法、可付成本的攻擊；不做攻擊 lookahead。自護依當前威脅與實際增閃收益，按 berserkDefenseThreshold／berserkDefenseCap 比較既有攻擊；不插入友方支援。

## 支援收益（support.ts）

SPEC-GAP 補（2026-10-26 lead-engine-next）：`support.ts` 共用現有預覽的 before／after，按實際增閃×可見威脅、層 HP 恢復及 inverted 池需求計算支援收益，扣施放成本；buff／protect／heal／escape 取最大分類係數，不重乘命中率。護衛指派只加目標優先係數；原地側閃可計防護收益。卸載主用途在低池量、沒有該池或沒有實際卸載時，不為附帶增閃計分。純攻擊增益保留舊公式，混合招取新收益與實際新增攻擊屬性的舊公式較大者；召喚等未識別作用保留舊分支。零收益純支援不得由 objectiveMove 救回；支援招成功後以 actor＋round 記憶防同招重放，refresh／ignore 無新增量不計分。tactical 最多額外保留 maxSupportMoves 個低成本合法支援格；sentinel／regroup／swarm 回防或回巢只插不移位支援，flee／scripted 維持原策略。

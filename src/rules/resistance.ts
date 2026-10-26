// rules/resistance — 抵抗性（取代十分律；world spec resistance.md、engine-backlog 28）與近戰／遠程增傷。
// 純函式：只讀 ctx，不耗 RNG、不寫狀態；attack.ts 的傷害修正鏈與 sim session 的估算共用。
import type { Id } from "../core/ids.ts";
import { GRADES } from "../core/types-def.ts";
import type { Grade, LayerType } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { statValue } from "./contribs.ts";
import { constant, evalCtxFor, frameView, person, rt, unit, unitTags } from "./state.ts";
import type { Ctx } from "./state.ts";

/** 類別鍵不改名（engine-backlog 28）：受抵抗性保護的目標、凡鐵兵器。 */
export const RESIST_TARGET_TAG = "kaiju";
export const CONVENTIONAL_TAG = "conventional-arms";
/** layer-types 登記檔裡標這個 tag 的層算「外甲」：凡鐵只刮得到它們。 */
export const OUTER_LAYER_TAG = "outer";

/** 抵抗性結算：factor 乘在傷害包上；reach 有值時，碰到不在清單內的層（內層與核）即停、傷害為 0。 */
export type Resistance = { factor: number; reach?: LayerType[] };

/** 武器的精粹等級；null＝凡鐵。能力或攻方單位帶 conventional-arms → 凡鐵；能力宣告 essence → 用它；否則取攻方機體等級（機甲核心的材料等級）。 */
export function weaponEssence(ctx: Ctx, actor: Id | null, abilityId: Id | null): Grade | null {
  const ability = abilityId ? ctx.db.require("ability", abilityId) : undefined;
  if (ability?.tags.includes(CONVENTIONAL_TAG) || (actor && unitTags(ctx, actor).includes(CONVENTIONAL_TAG))) return null;
  // 精粹矢等可宣告高於機體的等級；未宣告以機體等級為準。
  if (ability?.essence) return ability.essence;
  return actor ? frameView(ctx, actor).grade : null;
}

function outerLayers(ctx: Ctx): LayerType[] {
  return Object.values(ctx.db.registries["layer-types"]).filter(e => e.tags?.includes(OUTER_LAYER_TAG)).map(e => e.id).sort();
}

/** 凡鐵外甲倍率：情境 rules.conventionalFactor 覆蓋（古代異能「抵抗性失效」沿用此入口），否則 constants.conventionalFactor。 */
export function conventionalFactor(ctx: Ctx): number {
  return rt(ctx.s).conventionalFactor ?? constant(ctx, "conventionalFactor");
}

/** 目標不帶 kaiju → null（全額）。凡鐵 → 外甲 ×conventionalFactor、內層與核 0；精粹 → 每低一級 ×resistancePerGrade，同級以上 1。 */
export function resistance(ctx: Ctx, actor: Id | null, abilityId: Id | null, target: Id): Resistance | null {
  if (!unitTags(ctx, target).includes(RESIST_TARGET_TAG)) return null;
  if (!actor && !abilityId) return null;
  const essence = weaponEssence(ctx, actor, abilityId);
  if (essence === null) return { factor: conventionalFactor(ctx), reach: outerLayers(ctx) };
  const gap = GRADES.indexOf(frameView(ctx, target).grade) - GRADES.indexOf(essence);
  return { factor: gap > 0 ? constant(ctx, "resistancePerGrade") ** gap : 1 };
}

/** 能力歸類：tags 有 melee／ranged 照 tag；都沒有則射程上限 ≤ constants.meleeRangeMax 算近戰。 */
export function attackKind(ctx: Ctx, actor: Id, abilityId: Id): "melee" | "ranged" {
  const ability = ctx.db.require("ability", abilityId);
  if (ability.tags.includes("melee")) return "melee";
  if (ability.tags.includes("ranged")) return "ranged";
  return evalNum(ability.target.range.max, evalCtxFor(ctx, { unit: actor })) <= constant(ctx, "meleeRangeMax") ? "melee" : "ranged";
}

/** 攻方增傷倍率：機體與指令權者身上 `self.damage.melee`／`self.damage.ranged` 貢獻（op mul／add），基準 1。 */
export function damageBonus(ctx: Ctx, actor: Id, abilityId: Id, personId?: Id): number {
  const key = `self.damage.${attackKind(ctx, actor, abilityId)}`;
  const mech = statValue(1, unit(ctx, actor).contribs, key);
  return personId ? mech * statValue(1, person(ctx, personId).contribs, key) : mech;
}

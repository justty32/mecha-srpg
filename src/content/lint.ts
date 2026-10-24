import type { AbilityDef, PoolDecl } from "../core/types-def.ts";
import { CONTENT_KINDS, KIND_FOLDERS, parseId, qualifyId } from "../core/ids.ts";
import type { ContentDB } from "./contentdb.ts";
import type { LoadIssue, PackFiles } from "./loader.ts";
import { validateAgainst } from "./schema.ts";

// 來源：wf/workflows/content/numeric-bands.json 的 rows（0-based）；只轉錄明示的硬上限。
const NUMERIC_BANDS = {
  frameHp: { max: 1200, row: 0 }, // 摹機 S 級總層 HP
  damage: { single: 48, area: 26, row: 7 }, // 能力 packets 總和
  armorPen: { max: 0.5, row: 10 },
  accuracy: { max: 20, row: 10 },
  resist: { max: 0.8, row: 15 },
  evasion: { max: 22, row: 18 }, // 效果 add 貢獻，不是乘數或基礎屬性
  personHp: { max: 70, row: 19 },
  cover: { max: 50, row: 21 },
};

// AI 能力形態表；維護時須重讀來源，不依舊內容報告推定支援程度。
const AI_SHAPES = {
  // 來源：src/ai/policies/tactical.ts proposeTactical
  modes: ["activated", "sustained"],
  targets: ["self", "unit", "cell", "ball", "line", "cone", "part"],
  part: "partAim.allowed 且 ai.targetPref.parts 非空才產生部位候選",
  area: "ball/line/cone 包含友軍；cell 只提敵方位置；sustained 已開啟不再提",
  // 來源：src/ai/score.ts tacticWeights、scoreCandidate、want
  tactics: ["attack", "attackArea", "disable", "heal", "buff", "debuff", "escape", "protect", "capture", "scout"],
  // 來源：src/rules/movement.ts reactions（自動觸發，不經 AI 評分）
  reactionEvent: "enemyLeavesAdjacent",
  reactionTag: "melee",
};

function aiGaps(a: AbilityDef): string[] {
  if (a.mode === "reaction") {
    const gaps: string[] = [];
    if (a.trigger?.event !== AI_SHAPES.reactionEvent) gaps.push("reaction trigger is not supported");
    if (!a.tags.includes(AI_SHAPES.reactionTag)) gaps.push("reaction requires melee tag");
    // reactions 只傳 { unit: mover }，part 必需的部位參數不會出現。
    if (a.target.kind === "part" || a.target.kind === "self") gaps.push("reaction cannot target part/self");
    return gaps;
  }
  if (!AI_SHAPES.modes.includes(a.mode)) return ["mode is not proposed by tactical AI"];
  const gaps: string[] = [];
  if (!AI_SHAPES.targets.includes(a.target.kind)) gaps.push("target kind is not proposed by tactical AI");
  if (a.target.kind === "part" && (!a.partAim?.allowed || !a.ai.targetPref?.parts?.length)) {
    gaps.push("part target needs partAim.allowed and ai.targetPref.parts");
  }
  // 動態 NumExpr 不求值；只在所有受支援鍵缺席／字面值為零時警告。
  if (!AI_SHAPES.tactics.some(key => a.ai.tactics[key] !== undefined && a.ai.tactics[key] !== 0)) {
    gaps.push("ai.tactics has no nonzero supported key");
  }
  return gaps;
}

function hasOverflowBand(pool: PoolDecl): boolean {
  if (pool.max === null) return true; // 無有限上限，沒有 max 以上區間。
  if (!pool.bands.length) return false;
  if (typeof pool.max !== "number") return true;
  const max = pool.max;
  return pool.bands.some(b => {
    // 無法靜態判定的界線保留給執行期，避免將合法動態 band 誤報。
    if (typeof b.from !== "number" || (b.to !== null && typeof b.to !== "number")) return true;
    return b.to === null || b.to > Math.max(max, b.from);
  });
}

/** 只檢查合併且通過 schema 的定義，確保跨 pack 引用與覆寫使用最終版本。 */
export function lintContent(db: ContentDB, packs: readonly PackFiles[] = [],
  errors: LoadIssue[] = [], warnings: LoadIssue[] = []): { errors: LoadIssue[]; warnings: LoadIssue[] } {
  // CLI 傳原始 packs 以還原來源位置；probe 只傳 DB 時以完整 id 定位。
  const sources = new Map<string, string>();
  for (const pack of db.packs) {
    const source = packs.find(p => (p.files["pack.json"] as { id?: string } | undefined)?.id === pack.id);
    if (!source) continue;
    for (const kind of CONTENT_KINDS) for (const def of db.all(kind)) {
      const relative = `${KIND_FOLDERS[kind]}/${parseId(def.id)!.name}.json`, raw = source.files[relative];
      if (!raw || typeof raw !== "object" || !("id" in raw) || typeof raw.id !== "string") continue;
      if (qualifyId(raw.id, pack.id) === def.id && validateAgainst(kind, raw).length === 0) {
        sources.set(def.id, `${source.root}/${relative}`);
      }
    }
  }
  const issue = (severity: "error" | "warning", ruleId: string, id: string, path: string, message: string): void => {
    (severity === "error" ? errors : warnings).push({ ruleId, file: sources.get(id) ?? id, path, message });
  };
  const band = (rule: string, id: string, at: string, value: unknown, max: number, row: number): void => {
    if (typeof value === "number" && value > max) {
      issue("warning", `band-${rule}`, id, at, `value ${value} exceeds upper limit ${max}; source numeric-bands.json rows[${row}]`);
    }
  };
  // DamagePacket 也能藏在效果 hooks 中；遍歷 packets 欄，不把 attrs.accuracy 當能力加值。
  const packets = (value: unknown, id: string, at: string): void => {
    if (Array.isArray(value)) { value.forEach((v, i) => packets(v, id, `${at}[${i}]`)); return; }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (key === "packets" && Array.isArray(child)) child.forEach((packet: Record<string, unknown>, i) => {
        for (const field of ["armorPen", "resistPen", "crit"]) {
          const n = packet[field];
          if (typeof n === "number" && (n < 0 || n > 1)) {
            issue("error", "num-packet-ratio", id, `${at}.packets[${i}].${field}`, `${field} must be in [0,1]`);
          }
          if (field === "armorPen" && typeof n === "number" && n <= 1) {
            band("armorpen", id, `${at}.packets[${i}].${field}`, n, NUMERIC_BANDS.armorPen.max, NUMERIC_BANDS.armorPen.row);
          }
        }
      });
      // resist 只限 LayerDef，避免對不相關同名欄位套平衡規則。
      if (key === "resist" && "structural" in value && child && typeof child === "object") {
        for (const [type, n] of Object.entries(child)) {
          band("resist", id, `${at}.resist.${type}`, n, NUMERIC_BANDS.resist.max, NUMERIC_BANDS.resist.row);
        }
      }
      packets(child, id, `${at}.${key}`);
    }
  };
  for (const kind of CONTENT_KINDS) for (const def of db.all(kind)) packets(def, def.id, "$");
  for (const effect of db.all("effect")) effect.contribs.forEach((c, i) => {
    if (c.op === "add" && c.path.endsWith(".attrs.evasion")) {
      band("evasion", effect.id, `$.contribs[${i}].value`, c.value, NUMERIC_BANDS.evasion.max, NUMERIC_BANDS.evasion.row);
    }
  });
  for (const person of db.all("person")) person.pools.forEach((pool, i) => {
    if (pool.id === "hp") band("person-hp", person.id, `$.pools[${i}].max`, pool.max, NUMERIC_BANDS.personHp.max, NUMERIC_BANDS.personHp.row);
  });
  for (const terrain of db.all("terrain")) {
    band("cover", terrain.id, "$.cover", terrain.cover, NUMERIC_BANDS.cover.max, NUMERIC_BANDS.cover.row);
  }

  const inverted = new Set<string>();
  for (const kind of ["frame", "component", "person", "species"] as const) for (const def of db.all(kind)) {
    def.pools.forEach((pool, i) => {
      if (pool.inverted) inverted.add(`${kind === "person" ? "person" : "mech"}:${pool.id}`);
      if (pool.capKind === "soft" && !hasOverflowBand(pool)) {
        issue("warning", "soft-overflow-band", def.id, `$.pools[${i}].bands`, `${pool.id}: no band covers values above max`);
      }
    });
  }
  const monsterAbilities = new Set([
    ...db.all("species").flatMap(s => s.abilities), ...db.all("monster").flatMap(m => m.extraAbilities ?? []),
  ]);
  const frameAbilities = new Set([
    ...db.all("frame").flatMap(f => f.innateAbilities), ...db.all("component").flatMap(c => c.abilities),
  ]);
  for (const a of db.all("ability")) {
    if (typeof a.accuracy === "number" && (a.accuracy < -100 || a.accuracy > 100)) {
      issue("error", "num-accuracy", a.id, "$.accuracy", "accuracy must be in [-100,100]");
    }
    if (typeof a.accuracy === "number" && Math.abs(a.accuracy) <= 100) {
      band("accuracy", a.id, "$.accuracy", Math.abs(a.accuracy), NUMERIC_BANDS.accuracy.max, NUMERIC_BANDS.accuracy.row);
    }
    if (a.packets.every(p => typeof p.amount === "number")) {
      const limit = ["ball", "line", "cone"].includes(a.target.kind) ? NUMERIC_BANDS.damage.area : NUMERIC_BANDS.damage.single;
      band("damage", a.id, "$.packets", a.packets.reduce((sum, p) => sum + (p.amount as number), 0), limit, NUMERIC_BANDS.damage.row);
    }
    const { min, max } = a.target.range;
    if ((typeof min === "number" && min < 0) || (typeof max === "number" && max < 0)
      || (typeof min === "number" && typeof max === "number" && min > max)) {
      issue("error", "num-range", a.id, "$.target.range", "range must be nonnegative with min <= max");
    }
    const nonnegative = (n: unknown, at: string): void => {
      if (typeof n === "number" && n < 0) issue("error", "num-nonnegative", a.id, at, "value must be nonnegative");
    };
    a.costs.forEach((c, i) => nonnegative(c.amount, `$.costs[${i}].amount`));
    nonnegative(a.cooldown, "$.cooldown");
    nonnegative(a.usesPerBattle, "$.usesPerBattle");
    if (a.mode === "activated" && a.packets.length > 0 && a.costs.length === 0) {
      issue("error", "attack-cost", a.id, "$.costs", "activated attack requires a cost");
    }
    // 散熱詞僅看名稱／tags，不以 id 或熱量池名字猜測；正向發熱招不受影響。
    const cooling = /散熱|排熱|降溫|冷卻|排燼|散燼|冷却|(?:^|[\s_-])(?:cool(?:ing)?|heat[-_ ]?sink|vent(?:ing)?)(?:$|[\s_-])/i.test([a.name, ...a.tags].join(" "));
    for (const field of ["costs", "produces"] as const) a[field].forEach((c, i) => {
      if (inverted.has(`${c.owner}:${c.pool}`) && typeof c.amount === "number"
        && (field === "costs" ? c.amount < 0 : cooling && c.amount > 0)) {
        issue("warning", "inverted-direction", a.id, `$.${field}[${i}].amount`, `${c.pool}: inverted cost adds heat; cooling produces should be negative`);
      }
    });
    if (monsterAbilities.has(a.id) && !frameAbilities.has(a.id)) a.effects.forEach((group, i) => {
      group.apply.forEach((ref, j) => {
        const id = typeof ref === "string" ? ref : ref.effect;
        if (db.get("effect", id)?.scope === "person") {
          issue("warning", "monster-person-effect", a.id, `$.effects[${i}].apply[${j}]`, `${id}: monster-only ability applies a person effect`);
        }
      });
    });
    const gaps = aiGaps(a);
    if (gaps.length) issue("warning", "ai-shape", a.id, "$", gaps.join("; "));
  }
  for (const frame of db.all("frame")) {
    if (frame.cls === "mechanical" && frame.grade === "S") {
      const plan = db.get("bodyplan", frame.bodyPlan);
      if (plan) band("frame-hp", frame.id, "$.bodyPlan", plan.parts.reduce((sum, part) =>
        sum + part.layers.reduce((hp, layer) => hp + layer.hp, 0), 0), NUMERIC_BANDS.frameHp.max, NUMERIC_BANDS.frameHp.row);
    }
    if (frame.cls === "mechanical" && !frame.defaultLoadout
      && !frame.innateAbilities.some(id => (db.get("ability", id)?.packets.length ?? 0) > 0)) {
      issue("warning", "mechanical-unarmed", frame.id, "$.defaultLoadout", "mechanical frame has no defaultLoadout or innate attack");
    }
  }
  return { errors, warnings };
}

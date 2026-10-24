import type { RunResult } from "../../sim/index.ts";
import type { MechState, PersonState, PoolState } from "../../core/types-state.ts";
import type { PoolDecl } from "../../core/types-def.ts";
import { evalNum, objectRefs } from "../../core/numexpr.ts";
import type { CampaignState, ComponentInstance, LootBundle, OpsCtx, Sortie } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { eventRef } from "../state/events.ts";
import { isAccount, post } from "../state/ledger.ts";
import { tallyHeads, settleContract } from "../contracts/index.ts";
import { onBattleRift, nextSpring } from "../world/index.ts";
import { registerDeath, rosterReturn } from "../crew/index.ts";
import { admitBeast, beastRules } from "../crew/restraint.ts";
import { offerNickname } from "../crew/names.ts";
import { beastSpecies } from "../content/opseffect.ts";
import { applyOperationBattle } from "../war/merc.ts";

export type BattleResult = NonNullable<RunResult["result"]>;
export type SortieBattleResult = BattleResult;

function cleanPool(pool: PoolState): PoolState {
  return { ...pool, max: Number.isFinite(pool.max) ? pool.max : Number.MAX_SAFE_INTEGER };
}
function persistPools(before: Record<string, PoolState>, after: Record<string, PoolState>, decls: PoolDecl[], attrs: Record<string, number>): Record<string, PoolState> {
  const result = structuredClone(before), ev = { ref: objectRefs({ self: { attrs, pools: after } }), hasTag: () => false };
  for (const id of Object.keys(before).sort()) {
    if (!after[id]) continue;
    result[id] = cleanPool(after[id]!);
    const decay = decls.find(d => d.id === id)?.decayCurve;
    if (decay) result[id]!.cur = Math.max(0, evalNum(decay.baseline, ev));
  }
  return result;
}
function mechAfter(s: CampaignState, ctx: OpsCtx, before: MechState, after: MechState): MechState {
  const mech = structuredClone(after), frame = ctx.db.require("frame", before.frame);
  mech.id = before.id; mech.frame = before.frame; mech.owner = before.owner;
  const decls = [...frame.pools];
  for (const part of Object.keys(before.parts).sort()) for (const slot of Object.keys(before.parts[part]!.components).sort()) {
    const id = before.parts[part]!.components[slot]; if (id) decls.push(...ctx.db.require("component", s.inventory.components.find(c => c.id === id)?.def ?? id).pools);
  }
  mech.pools = persistPools(before.pools, after.pools, decls, frame.baseAttrs);
  mech.contribs = structuredClone(before.contribs);
  mech.cooldowns = {}; mech.sustained = [];
  return mech;
}
function personAfter(ctx: OpsCtx, before: PersonState, after: PersonState, xpGained: number): PersonState {
  const p = structuredClone(after), def = ctx.db.require("person", before.def);
  p.id = before.id; p.def = before.def;
  // 戰鬥已承接現況，池與效果直接寫回，僅按內容宣告衰減戰鬥池。
  p.pools = persistPools(before.pools, after.pools, def.pools, before.attrsBase);
  p.xp = Math.max(after.xp, before.xp + xpGained); // state 已有總 XP 時不再重加。
  p.will.burden = p.pools.burden?.cur ?? 0;
  return p;
}
function detachMech(s: CampaignState, id: string): void {
  s.hangar.bays = s.hangar.bays.map(m => m === id ? null : m);
  s.hangar.dormant = s.hangar.dormant.filter(m => m !== id);
  s.inventory.mechs = s.inventory.mechs.filter(m => m !== id);
  s.restraint.slots = s.restraint.slots.map(m => m === id ? null : m); delete s.restraint.beasts[id];
  for (const pid of Object.keys(s.roster.persons).sort()) if (s.roster.persons[pid]!.seat?.mech === id) {
    delete s.roster.persons[pid]!.seat;
    if (s.roster.employment[pid]) delete s.roster.employment[pid]!.seat;
  }
}
function stash(s: CampaignState, sortie: Sortie, bundle: LootBundle): void {
  s.nodes[sortie.node]!.wreckage.push({ ...bundle, day: s.clock.day });
}
function cargoUsed(s: CampaignState): number {
  // SPEC-GAP：cargo 未定重量，實物每件一格、材料每單位一格；燃料由船池計。
  return s.inventory.components.length + s.inventory.relics.length + Object.keys(s.ledger.balances).sort()
    .filter(key => key.startsWith("stock:") && key !== "stock:fuel")
    .reduce((sum, key) => sum + s.ledger.balances[key as keyof typeof s.ledger.balances]!, 0);
}
function componentLoot(s: CampaignState, ctx: OpsCtx, sortie: Sortie, items: ComponentInstance[]): void {
  const overflow: ComponentInstance[] = [];
  for (const item of items) {
    if (cargoUsed(s) < s.ship.capacity.cargo) s.inventory.components.push(item); else overflow.push(item);
  }
  if (overflow.length) stash(s, sortie, { components: overflow, materials: {} });
  void ctx;
}

export function applyBattleResult(s: CampaignState, ctx: OpsCtx, sortie: Sortie, result: BattleResult): void {
  if (s.log.some(e => e.type === "BattleResolved" && e.payload.sortie === sortie.id)) return;
  const resolved = ctx.emit("BattleResolved", { sortie: sortie.id, hash: result.log.hash, rounds: result.rounds, winner: result.winner ?? "none", ...(sortie.trigger === "operation" ? { operation: sortie.operation, contract: sortie.contract } : {}) });
  const ref = eventRef(resolved), ordered = [...sortie.units].sort((a, b) => a.mech < b.mech ? -1 : 1);
  const ownId = (id: string) => ordered.find(u => u.mech === id)?.mech ?? (/^player-\d+$/.test(id) ? ordered[Number(id.slice(7))]?.mech : undefined);
  const enemy = result.units.filter(u => !ownId(u.id) && (sortie.trigger !== "operation" || u.state.owner === "enemy"));
  const personalIds = new Set(ordered.flatMap(u => Object.values(u.seats).filter((id): id is string => !!id)));
  const deferredLoot = new Set<string>();
  if (sortie.trigger === "operation") for (const entry of result.units) {
    const loan = s.contracts[sortie.contract ?? ""]?.merc?.loans[entry.id];
    if (loan && entry.status === "dead") loan.destroyed = true;
    if (loan && entry.status === "derelict-lost") loan.lost = true;
  }

  // 一、機體：活著／撤退現況寫回，古代死亡休眠，其餘殘骸與流失。
  for (const entry of [...result.units].sort((a, b) => a.id < b.id ? -1 : 1)) {
    const id = ownId(entry.id), before = id ? s.mechs[id] : undefined;
    if (before) {
      const mech = mechAfter(s, ctx, before, entry.state); s.mechs[before.id] = mech;
      if (sortie.trigger === "operation" && s.contracts[sortie.contract ?? ""]?.loans?.includes(before.id)) Object.assign(mech, { loaned: sortie.contract });
      if (entry.status === "dead" && ctx.db.require("frame", before.frame).cls === "ancient") {
        if (!s.hangar.dormant.includes(before.id)) s.hangar.dormant.push(before.id);
        s.flags[`grudge:${before.id}`] = 1; mech.controlMode = "none";
      } else if (entry.status === "dead" || entry.status === "derelict-lost") {
        detachMech(s, before.id);
        if (entry.status === "derelict-lost") ctx.emit("LostMech", { mech: before.id, node: sortie.node });
        else {
          const items: ComponentInstance[] = [];
          for (const part of Object.keys(mech.parts).sort()) for (const slot of Object.keys(mech.parts[part]!.components).sort()) {
            const def = mech.parts[part]!.components[slot]; if (!def) continue;
            // SPEC-GAP：BattleResult 沒有 component instance HP，保留所在層最小 HP，不造滿血零件。
            items.push({ id: nextId(s, "component"), def, origin: "loot", layerHp: Math.min(...mech.parts[part]!.layers.map(l => l.hp)) });
          }
          componentLoot(s, ctx, sortie, items.filter(item => !result.loot.some(loot => loot.fromUnit === entry.id && loot.components.includes(item.def))));
        }
        delete s.mechs[before.id];
      } else if (entry.status === "derelict-recovered") {
        mech.seats = Object.fromEntries(Object.keys(mech.seats).sort().map(seat => [seat, null])); mech.controlMode = "none";
        for (const pid of personalIds) if (s.roster.persons[pid]?.seat?.mech === before.id) delete s.roster.persons[pid]!.seat;
      }
    } else if (entry.status === "captured" && entry.state.owner === "player") {
      const mech = structuredClone(entry.state), species = beastSpecies(ctx, mech.frame);
      mech.id = nextId(s, "mech"); mech.frame = species?.capture.frame ?? mech.frame;
      mech.seats = {}; mech.controlMode = "instinct"; mech.owner = "player";
      for (const pool of Object.keys(mech.pools).sort()) mech.pools[pool] = cleanPool(mech.pools[pool]!);
      s.mechs[mech.id] = mech; s.flags[`captured:${mech.id}`] = 1;
      // SPEC-GAP：BattleResult 不保留 monster id，缺原始 id 時只沿用同族同級唯一個體的二名。
      const candidates = ctx.db.all("monster").filter(m => m.species === species?.id && m.grade === ctx.db.require("frame", mech.frame).grade);
      const monster = ctx.db.get("monster", entry.state.frame) ?? (candidates.length === 1 ? candidates[0] : undefined);
      if (!admitBeast(s, ctx, mech, monster?.epithet)) stash(s, sortie, { components: [], materials: {}, mechs: [mech.id] });
    } else if (entry.status === "dead" && !id) {
      const species = beastSpecies(ctx, entry.state.frame), cfg = species && ctx.world.get("beasts", `beasts/${species.family}`);
      if (species && cfg && !deferredLoot.has(entry.id)) {
        deferredLoot.add(entry.id);
        const loot: LootBundle = { components: [], materials: {} };
        for (const item of result.loot.filter(l => l.fromUnit === entry.id)) {
          for (const def of [...item.components].sort()) {
            const part = Object.values(entry.state.parts).find(p => Object.values(p.components).includes(def));
            loot.components.push({ id: nextId(s, "component"), def, origin: "loot", ...(part ? { layerHp: Math.min(...part.layers.map(l => l.hp)) } : {}) });
          }
          for (const [key, amount] of Object.entries(item.materials)) {
            const account = key.startsWith("stock:") ? key : `stock:${key}`;
            if (!isAccount(account) || !Number.isFinite(amount) || amount < 0) throw new Error(`invalid loot material: ${key}`);
            loot.materials[account] = (loot.materials[account] ?? 0) + amount;
          }
        }
        const grade = ctx.db.get("monster", entry.state.frame)?.grade ?? ctx.db.require("frame", species.capture.frame).grade;
        const carcass = { id: nextId(s, "carcass"), species: species.id, grade, parts: structuredClone(entry.state.parts), decayPerDay: cfg.decay, slot: -1 };
        s.pendingChoices.push({ text: `${species.name} 的屍體如何處理？`, choices: [
          { text: "拆", effects: [{ salvage: { node: sortie.node, loot, carcass, keep: false } }] },
          { text: "留整屍", requires: { cmp: { a: { ref: "restraint.freeSlots" }, op: ">", b: 0 } }, effects: [{ salvage: { node: sortie.node, loot, carcass, keep: true } }] },
        ] });
      }
    }
  }
  // 二、人員：保留舊傷與成長；死亡由 crew 處理認主、全團 mood 與 boundTo。
  for (const entry of [...result.persons].sort((a, b) => a.id < b.id ? -1 : 1)) {
    if (!personalIds.has(entry.id)) continue;
    const before = s.roster.persons[entry.id]; if (!before) continue;
    const p = personAfter(ctx, before, entry.state, entry.xpGained); s.roster.persons[entry.id] = p;
    if (p.seat && (!s.mechs[p.seat.mech] || !Object.values(s.mechs[p.seat.mech]!.seats).includes(p.id))) delete p.seat;
    if (entry.status === "dead" || p.pools.hp?.cur === 0) registerDeath(s, ctx, entry.id, "battle");
  }
  rosterReturn(s, ctx);
  for (const unit of ordered) {
    const beast = s.restraint.beasts[unit.mech], cfg = beast && beastRules(s, ctx, unit.mech); if (!beast || !cfg) continue;
    s.flags[`battles:${unit.mech}`] = (s.flags[`battles:${unit.mech}`] ?? 0) + 1;
    if (beast.kind === "live") for (const person of [...personalIds].sort()) if (s.roster.persons[person]) beast.bond[person] = Math.min(100, (beast.bond[person] ?? 0) + cfg.bondPerBattle);
    offerNickname(s, ctx, unit.mech);
  }
  // 三、戰利品：實體與材料分流，材料的唯一寫入入口為 post。
  for (const loot of result.loot) {
    if (deferredLoot.has(loot.fromUnit)) continue;
    const source = result.units.find(u => u.id === loot.fromUnit)?.state;
    componentLoot(s, ctx, sortie, [...loot.components].sort().map(def => {
      const part = source && Object.keys(source.parts).sort().find(key => Object.values(source.parts[key]!.components).includes(def));
      return { id: nextId(s, "component"), def, origin: "loot", ...(part ? { layerHp: Math.min(...source!.parts[part]!.layers.map(l => l.hp)) } : {}) };
    }));
    for (const key of Object.keys(loot.materials).sort()) {
      const account = key.startsWith("stock:") ? key : `stock:${key}`, amount = loot.materials[key]!;
      if (!isAccount(account) || !account.startsWith("stock:") || !Number.isFinite(amount) || amount < 0) throw new Error(`invalid loot material: ${key}`);
      const stored = Math.min(amount, Math.max(0, s.ship.capacity.cargo - cargoUsed(s)));
      if (stored) post(s, ctx, { account, delta: stored, reason: `battle-loot:${result.log.hash}`, ref });
      if (stored < amount) stash(s, sortie, { components: [], materials: { [account]: amount - stored } });
    }
  }
  // 四、契約：只認原始 UnitDied 事件，加 sortie id 跨場去重。
  const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
  if (contract && sortie.trigger !== "operation") {
    const deaths = (result.events ?? []).filter(e => e.type === "UnitDied" && enemy.some(u => u.id === e.payload.unit));
    tallyHeads(contract, deaths.map(e => ({ ...e, payload: { ...e.payload, unit: `${sortie.id}/${e.payload.unit}` } })));
    // SPEC-GAP：部分目標進度未回傳，只有明示 partial 才付半額，失敗有擊殺不自動視為部分成功。
    settleContract(s, ctx, contract.id, result.winner === "player" ? "done" : result.reason === "partial" ? "partial" : "failed");
  }
  // 五、裂縫：以錨 monster/species/capture.frame 比對，捕獲轉 owner 後仍能識別。
  const rift = s.rifts[sortie.rift ?? contract?.target.rift ?? ""];
  if (rift) {
    const def = ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(d => d.family === rift.family);
    const anchor = ctx.db.get("monster", rift.anchor ?? def?.anchor ?? "");
    const species = anchor ? ctx.db.require("species", anchor.species) : undefined;
    const killed = enemy.find(u => (u.status === "dead" || u.status === "captured") &&
      (u.id === rift.anchor || u.state.frame === anchor?.id || u.state.frame === species?.id || u.state.frame === species?.capture.frame));
    if (killed) onBattleRift(s, ctx, rift.id, killed.status === "captured" ? "anchor-captured" : "anchor-killed");
    if (rift.phase === "opening" && killed) onBattleRift(s, ctx, rift.id, "vanguard-killed");
    const kind = contract && ctx.world.require("contract", contract.template).kind;
    if (result.winner === "player" && (kind === "seal" || sortie.trigger === "defend")) {
      onBattleRift(s, ctx, rift.id, "defended");
      // SPEC-GAP：world 的 defended 只接受大潮；一般 seal 情境勝利仍依戰鬥契約進 sealing。
      if (kind === "seal" && rift.phase === "unanchored") {
        rift.phase = "sealing"; rift.nextCheck = nextSpring(s, ctx);
        ctx.emit("RiftPhase", { rift: rift.id, phase: rift.phase, fedCount: rift.fedCount });
      }
    } else if (result.winner !== "player") onBattleRift(s, ctx, rift.id, "lost");
  }
  // 六、聲望：契約 onComplete/onFail 已由 settleContract 套用；設施誤傷事件／幅度 core 未回傳，不臆扣。
  // 七、耗材：只計原始 AbilityUsed 事件，不因攜帶而扣除。
  for (const event of result.events ?? []) {
    if (event.type !== "AbilityUsed" || typeof event.payload.ability !== "string") continue;
    const unit = typeof event.payload.unit === "string" ? event.payload.unit : "";
    if (!ownId(unit)) continue;
    const ability = ctx.db.get("ability", event.payload.ability); if (!ability) continue;
    if (ability.tags.includes("capture")) s.inventory.tickets.restraint = Math.max(0, s.inventory.tickets.restraint - 1);
    if (ability.tags.includes("airstrike")) s.inventory.tickets.airstrike = Math.max(0, s.inventory.tickets.airstrike - 1);
  }
  // 八、記錄已先落盤供 ledger 引用；不推進營運時間。
  if (sortie.trigger === "operation") applyOperationBattle(s, ctx, sortie, result);
  if (s.pendingBattle?.id === sortie.id) delete s.pendingBattle;
}

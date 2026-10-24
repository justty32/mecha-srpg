import type { Loc } from "../war/types.ts";
export type { Loc } from "../war/types.ts";
import type { ForceState, FactionRnd, Relation, OperationState, ShellState, ModelState, OperationDef, TreatyDef, LineageDef, ModelDef, ForcesDef, AffinityDef } from "../war/types.ts";
import type { Id } from "../../core/ids.ts";
import type { Cond, NumExpr, Grade, ControlMode, SeatId, EffectRef, Objective, ScenarioDef, PoolDecl } from "../../core/types-def.ts";
import type { MechState, PersonState, PoolState, RngState } from "../../core/types-state.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDB } from "../content/worlddb.ts";
import type { JoinTerms } from "../war/types.ts";
import type { MercRecord } from "../war/merc.ts";
import type { Cell } from "../../core/types-def.ts";

export type WTerrainDef = { id: Id; name: string; glyph: string; airCost: number | null; groundCost: number | null;
  sight: number; encounter: number; encounterLost?: number; riftAffinity: number; battlePool: Id[]; flavor: string };
export type MapDef = { id: Id; name: string; oldName?: string; width: number; height: number; cellKm: number;
  fog: "charted" | "dark"; darkRects?: { x: number; y: number; w: number; h: number }[]; riftRate: number;
  legend: Record<string, Id>; base: { rows: string[] }; region?: { legend: Record<string, string>; rows: string[] }; road?: [number, number][] };
export type RegionsDef = { id: Id; map: Id; regions: Record<string, { name: string; phrase?: string }> };
export type PlaceDef = { id: Id; name: string; map: Id; at: Cell; size?: number; footprint?: Cell[];
  kind: "city" | "port" | "ruin" | "outpost" | "rift-site" | "lunar-base" | "beacon";
  owner?: Id; pop?: number; services: ServiceId[]; ruin?: { depth: number; seedTable: Id; discovered: boolean }; sight?: number; tags: string[] };
export type LaneDef = { id: Id; a: Id; b: Id; kind: "land-bridge" | "sea-lane" | "air-lane" | "orbital";
  days: number; departDays?: number[]; fare?: NumExpr; fuelPerDay?: number; carriesShip: boolean;
  capacity?: { mechs: number; persons: number }; requires?: Id[]; hazards: Id[]; tags: string[] };

export type RoomId = string;
export type ServiceId = string;
export type Clock = { day: number; month: number; dom: number; phase: "spring" | "neap" | "ordinary" };
export type CalendarDef = { id: Id; daysPerMonth: number; spring: number[]; neap: number[]; special: { dom: number; month: number; event: Id }[] };
export type Account = "cash" | "debt" | `stock:${string}`;
export type LedgerEntry = { seq: number; day: number; account: Account; delta: number; reason: string; ref?: Id; counter?: Account };
export type Ledger = { entries: LedgerEntry[]; balances: Record<Account, number> };
export type ComponentInstance = { id: Id; def: Id; layerHp?: number; origin: "loot" | "bought" | "made"; boundTo?: Id };
// SPEC-GAP：遺物、殘骸與房間索引未展開；採可序列化的最小資料形狀。
export type RelicInstance = { id: Id; def: Id; flags: string[] };
export type LootBundle = { components: ComponentInstance[]; materials: Partial<Record<Account, number>>; relics?: RelicInstance[]; day?: number; mechs?: Id[] };
export type Inventory = { components: ComponentInstance[]; mechs: Id[]; relics: RelicInstance[]; tickets: { airstrike: number; restraint: number } };
export type PlaceState = { def: Id; dyn?: PlaceDef; ownerOverride?: Id; wreckage: LootBundle[]; lastVisit?: number; flags: string[];
  recoveringUntil?: number; blightOwnerBefore?: Id };
export type BlightPatch = { id: Id; rift: Id; map: Id; cells: Cell[]; sinceDay: number; burned?: boolean };
export type KnownCell = { day: number; actors: Id[]; blight?: { rift: Id; patch: Id; depth: "shallow" | "deep" | "core" } };
export type ActorState = { id: Id; kind: "force" | "patrol" | "caravan" | "swarm" | "band"; faction: Id; pos: Loc; path?: Cell[]; mp: number;
  goal: { type: "idle" | "goto" | "patrol" | "raid" | "return" | "hunt" | "trade" | "escort" | "flee"; target?: Loc | Id; until?: number };
  str: number; roster?: Id; swarm?: { rift: Id; family: Id; grades: Grade[] }; cargo?: number;
  stance: "hostile" | "wary" | "neutral" | "friendly"; born: number; lastSeenByPlayer?: number; flags: string[] };
export type RiftState = { id: Id; at: Loc; site: Id; family: Id; width: Grade; phase: "opening" | "anchored" | "unanchored" | "sealing" | "sealed" | "receding" | "closed";
  openedDay: number; anchorAge: number; anchor?: Id; patches: Id[]; fedCount: number; nextCheck: number };
export type RiftDef = { id: Id; family: string; anchor?: Id; vanguard: Id[]; spreadPerTide: NumExpr; selfClose: boolean; tether: boolean;
  gradeByWidth: Partial<Record<Grade, Grade[]>>; monsters?: Id[] };
export type EncounterUnit = { frame: Id; pilots?: Id[]; components?: { [slot: string]: Id }; w?: number };
export type EncounterDef = { faction?: Id; units?: EncounterUnit[]; id: Id; family: string; depth: "shallow" | "deep" | "core"; size: { w: NumExpr; h: NumExpr };
  terrainMix: { terrain: Id | "$node"; w: number }[]; budgetByGrade: Partial<Record<Grade, number>>; anchorHere: boolean; map?: Id };
export type RoomState = { persons: Id[]; items: Id[] };
export type ShipCapacity = { mechBays: number; restraintSlots: number; berths: number; cargo: number };
// SPEC-GAP：船的 pool 範例只有 max/initial；缺省 regen=0，其餘池語意為 hard、非反向。
export type ShipPoolDecl = Pick<PoolDecl, "max" | "initial"> & Partial<Pick<PoolDecl, "regen" | "min" | "capKind">>;
export type ShipDef = { id: Id; rooms: RoomId[]; capacity: ShipCapacity; fuel: ShipPoolDecl; hull: ShipPoolDecl; gun?: { shotsPerBattle: number } };
export type MoveLeg = { map: Id; cells: Cell[]; lane?: { id: Id; to: Loc } };
export type ShipState = { frame: Id; pos: Loc; path?: { cells: Cell[]; lane?: { id: Id; daysLeft: number };
  legs: MoveLeg[]; to: Loc | { place: Id } | { actor: Id }; via: Loc[] };
  mpCarry: number; drifting: boolean; rooms: Record<RoomId, RoomState>; capacity: ShipCapacity; fuel: PoolState; hull: PoolState; upgrades: Id[] };
export type FactionOpsDef = { actionLanes?: ("world" | "war")[]; id: Id; faction: Id; scale: string; territory: Id[]; stance: { player: number; bio: number; ancient: number; soul: number; league: number };
  contractKinds: Id[]; services: ServiceId[]; reputationTiers: { at: number; grants: Id[]; name: string }[];
  lifecycle?: { growOn?: Cond; shrinkOn?: Cond; absorbedBy?: Id };
  naming?: { mechStages: { grade: Grade[]; pattern: string }[]; ancient: string; flavor: string }; tags: string[];
  roster?: ({ frame: Id; count: number } | { model: Id; count: number })[] };
export type FactionState = { rndProgress?: { suspended?: Record<Id, number>; lastDay?: number; acquired: Record<Id, number>; held: Id[] }; forces?: ForceState; shells?: Id[]; ops?: Id[]; prestige?: number; rnd?: FactionRnd; def: Id; rep: number; scaleNow: string; territoryNow: Id[]; alive: boolean; memory: { day: number; kind: string; ref?: Id }[] };
export type ObjectiveTemplate = Pick<Objective, "kind" | "params"> & { optional?: boolean };
// SPEC-GAP：stage／敵軍快照未展開；快照在 offered 時由契約模組凍結。
export type StageTemplate = { objectives: ObjectiveTemplate[]; days?: number; effects?: OpsEffect[] };
export type EnemySnapshot = { family: string; width: Grade; depth: "shallow" | "deep" | "core"; anchorAge: number; monsters?: Id[]; phase?: RiftState["phase"] };
export type ContractTemplate = { join?: JoinTerms; id: Id; kind: "clear" | "seal" | "reclaim" | "escort" | "scout" | "rival" | "survey" | "defend" | "smuggle" | "join";
  name?: string;
  issuerKinds: string[]; requiresRep: number; gradeRange: Grade[]; objectives: ObjectiveTemplate[];
  pay: { base: NumExpr; perHead?: NumExpr; bonus?: { cond: Cond; amount: NumExpr }[] }; advanceMax: number; deadlineDays: NumExpr;
  encounter?: Id[]; supplies?: Id[]; onComplete: OpsEffect[]; onFail: OpsEffect[]; onCancel: OpsEffect[]; stages?: StageTemplate[]; annoyanceMax?: number };
export type ContractState = { operation?: Id; side?: "actor" | "target"; loans?: Id[]; violations?: number; merc?: MercRecord; id: Id; template: Id; issuer: Id; target: { place: Id; loc?: Loc; rift?: Id; snapshot?: EnemySnapshot };
  consecutiveDraws?: number;
  status: "offered" | "active" | "stage" | "done" | "failed" | "cancelled" | "expired"; terms: { total: number; advance: number; perHead: number };
  paidAdvance: boolean; heads: Record<Id, number>; offeredDay: number; deadlineDay: number; stageIdx: number; annoyance: number; settled?: boolean };
export type WorldActionDef = { lane?: "war"; id: Id; actor: "faction" | "rift" | "world"; valid: Cond; weight: NumExpr; cooldownDays: number; effects: OpsEffect[] };
export type MarketDef = { id: Id; place: Id; lists: { kind: "component" | "frame" | "carcass" | "fuel" | "material" | "ticket" | "soul-rental" | "ammo";
  items: { def: Id; weight: number; stockMax: number; basePrice?: number }[];
  filters?: { filter: { lineage?: Id; maker?: Id; tierMax: Grade }; weight: number; stockMax: number; basePrice?: number }[] }[]; priceMods: { tag: string; mult: NumExpr }[]; refreshOn: "quarter"; buysBack: boolean };
export type ServiceDef = { id: Id; room: RoomId; hpRegenMult?: number; cleanse?: { whitelist: Id[]; price: NumExpr }; price?: NumExpr; effects?: OpsEffect[] };
export type RecruitPoolDef = { id: Id; place: Id; sources: { background: Id; weight: NumExpr }[]; size: number; refreshOn: "quarter" };
export type BackgroundDef = { id: Id; name: string; culture: string; attrRanges: Record<string, [number, number]>; hireFee: NumExpr; wageMult: NumExpr; traits?: Id[]; person?: Id };
export type ResearchDef = { id: Id; name: string; direction: string; cost: { coin: number; techHours: number }; requires: Id[]; consumes?: Partial<Record<Account, number>>;
  unlocks: { kind: "component" | "modification" | "service" | "soul-node"; id: Id }[] };
export type ResearchState = { def: Id; hoursDone: number; coinPaid: boolean; done: boolean };
export type Job = { id: Id; kind: "repair" | "rebuild" | "research" | "graft" | "incubate" | "install" | "mod" | "restrain" | "mount" | "embalm" | "prune"; target: Id;
  needHours: number; doneHours: number; materials: Partial<Record<Account, number>>; paid: boolean; priority: number; part?: string; layer?: number; component?: Id };
export type JobDef = { id: Id; kind: Job["kind"]; hoursPerHp?: Record<string, number>; material?: Record<string, Account>; perHp?: Record<string, number>;
  rebuildMult?: { hours: number; material: number }; technicianHours?: number; needHours?: number; coin?: number; person?: Id };
export type NamesDef = { id: Id; culture: string; names: string[]; epithets: string[] };
export type Employment = { since: number; wage: number; owed: number; mood: number; role: "pilot" | "technician" | "medic" | "crew"; seat?: Id };
export type RosterState = { persons: Record<Id, PersonState>; employment: Record<Id, Employment>; trust: Record<Id, Record<Id, number>>;
  mastery: Record<Id, Record<Id, number>>; names: Record<Id, { name: string; by: Id; day: number; kind: NameKind }[]>; dead: { person: Id; day: number; cause: string }[] };
export type NameKind = "title" | "registry" | "nickname" | "dread" | "epithet";
export type HangarState = { bays: (Id | null)[]; dormant: Id[] };
export type BeastState = { mech: Id; kind: "live" | "corpse"; wear: number; vitality: number; sustainDue?: number; bond: Record<Id, number>; nextMolt?: number; nextMutate?: number; broodDay?: number };
export type CarcassState = { id: Id; species: Id; grade: Grade; parts: MechState["parts"]; decayPerDay: number; slot: number };
export type RestraintBay = { slots: (Id | null)[]; beasts: Record<Id, BeastState>; carcasses: CarcassState[]; myceliumRoom?: { layers: number; growth: number; lastPrune: number } };
export type BeastDef = { id: Id; family: string; restraint: Id[]; wearPerDay: Partial<Record<Grade, number>>; registryPattern: string;
  sustain: { kind: "devour" | "tide-soak" | "prune"; stock: Account; amount: Partial<Record<Grade, number>>; loss: number };
  gradeMult: Partial<Record<Grade, number>>; restrain: { hours: number; scrap: number }; mount: { hours: number; scrap: number }; embalm: { hours: number; scrap: number };
  prune: { hours: number; growth: number }; injuryMult: number; suppress: { hours: number; injuryChance: number; injuryHp: number; wear: number };
  bondPerBattle: number; nicknameBond: number; nicknameBattles: number; decay: number;
  behaviors: { species: Id; molt?: { days: number; window: number; to: Id }; brood?: { child: Id }; mutate?: { frames: Id[] } }[] };
export type KeymapDef = { id: Id; bindings: { action: string; keys: string[]; label: string; context?: string }[] };
export type Sortie = { operation?: Id; id: Id; day: number; contract?: Id; loc: Loc; place?: Id; rift?: Id; trigger: "contract" | "ambush" | "defend" | "ruin-exit" | "collection" | "operation" | "intercept";
  units: { mech: Id; seats: Record<SeatId, Id | null>; controlMode: ControlMode }[]; supplies: { airstrikeTickets: number; restraintRounds: number; shipOverhead: boolean };
  injected: { target: "mech" | "person"; id: Id; effect: EffectRef }[] };
// SPEC-GAP：沒有 opseffects/ 登記檔；使用範例的 inline 可辨識聯集，不創造不可解析的效果 id。
export type OpsEffect =
  | { startOperation: Id; actor?: Id; target?: OperationState["target"] }
  | { opProgress: { operation?: Id; delta: NumExpr } }
  | { transferPlace: { place: Id; to: Id } } | { transferShell: { shell: Id; to: Id } }
  | { relation: { a: Id; b: Id; delta: NumExpr; reason: string } }
  | { treaty: { a: Id; b: Id; def: Id } } | { declareWar: { a: Id; b: Id } }
  | { leakModel: { model: Id; by?: Id } } | { forceLoss: { faction?: Id; operation?: Id; fraction: NumExpr } }
  | { ledger: { account: Account; delta: NumExpr; reason: string; ref?: Id; counter?: Account } }
  | { rep: Record<Id, NumExpr> } | { flag: string; value?: NumExpr } | { mood: Record<Id | "all", NumExpr> }
  | { techHours: NumExpr } | { spawnContract: Id; near?: string } | { spawnEvent: Id }
  | { setPlace: { id: Id; patch: Partial<Omit<PlaceState, "def">>; clearBlight?: boolean } }
  | { setRift: { id: Id; patch: Partial<Omit<RiftState, "id">> } }
  | { nameMech: { mech: Id; name: string; by: Id; kind?: NameKind } }
  | { restraintChoice: { mech: Id; action: "suppress" | "release" | "kill"; hours?: number; injuryChance?: number; injuryHp?: number; wear?: number } }
  | { salvage: { place: Id; loot: LootBundle; carcass: CarcassState; keep: boolean } }
  | { applyEffect: { target: "person" | "mech"; id: Id; effect: EffectRef; source?: Id } };
export type Choice = { text: string; requires?: Cond; effects: OpsEffect[]; next?: Id };
export type EventDef = { id: Id; where: "place" | "field" | "lane" | "ship" | "ruin"; when: Cond; weight: NumExpr; text: string; choices: Choice[]; next?: Id };
export type DialogueDef = { id: Id; person: Id; topics: { topic: string; when: Cond; lines: string[]; effects?: OpsEffect[]; choices?: Choice[] }[] };
export type RoomDef = { id: Id; title: string; base: string[]; exits: RoomId[]; phrases: { when: Cond; text: string }[] };
export type LogKind = "info" | "warn" | "money" | "blood" | "soul";
export type TemplatesDef = { id: Id; entries: Record<string, { kind: LogKind; text: string }> };
// SPEC-GAP：開局未指定僱用條件；允許人物列帶 role/wage，裸 id 使用檔內 defaults。
export type StartPerson = Id | { def: Id; role: Employment["role"]; wage: number; soulNodes?: Id[] };
export type StartDef = { id: Id; day: number; place: Id; ship: Id; calendar?: Id; cash: number; debt: number; mechs: (Id | { frame: Id; components?: Record<string, Id> })[]; persons: StartPerson[];
  stocks: Partial<Record<Account, number>>; tickets: Partial<Inventory["tickets"]>; flags: string[]; pressure?: number;
  rifts?: (Pick<RiftState, "site" | "family" | "width" | "phase" | "anchorAge"> & Partial<Omit<RiftState, "patches">> & { prePatches?: number })[];
  employment?: { role: Employment["role"]; wage: number } };
export type Ask = "total" | "advance" | "perHead";
export type OpsCommand =
  | { v: "look"; target?: Id | RoomId } | { v: "talk"; who: Id; topic?: string } | { v: "go"; room: RoomId }
  | { v: "map" } | { v: "sail"; to: Id | Cell | { actor: Id }; via?: (Id | Cell)[] } | { v: "dock" } | { v: "drift" } | { v: "wait"; days: number }
  | { v: "board"; contract?: Id } | { v: "accept"; contract: Id; ask?: Ask } | { v: "drop"; contract: Id }
  | { v: "sortie"; sortie: Partial<Sortie> } | { v: "assign"; person: Id; seat?: { mech: Id; seat: SeatId }; role?: string }
  | { v: "queue"; job: Partial<Job> } | { v: "reorder"; job: Id; priority: number } | { v: "devour"; beast: Id; amount: number }
  | { v: "accompany"; soul: Id; by: Id; node?: Id /*靈魂樹節點*/ } | { v: "trade"; market: Id; buy?: Id[]; sell?: Id[] }
  | { v: "hire"; candidate: Id } | { v: "fire"; person: Id } | { v: "explore"; ruin: Id; party: Id[] }
  | { v: "wake"; shell: Id; by: Id } | { v: "choose"; choice: number } | { v: "pay"; account: "debt" | Id; amount: number }
  | { v: "borrow"; amount: number }
  | { v: "save" } | { v: "load"; slot: number } | { v: "help"; v2?: string };
// SPEC-GAP：Prompt/Row 原 spec 未展開；選項保留效果以支援存檔續選。
export type Prompt = { text: string; choices: Choice[]; event?: Id; person?: Id };
export type Row = Record<string, string | number | boolean | null>;
export type Screen = { room: { id: RoomId; title: string; desc: string[]; exits: RoomId[] }; log: { day: number; text: string; kind: LogKind }[];
  panels: Record<string, Row[]>; actions: { id: string; label: string; cmd: OpsCommand; group: string; key?: string; tooltip?: string; disabled?: string }[];
  prompt?: { text: string; choices: { n: number; text: string; disabled?: string }[] }; handoff?: { battle: ScenarioDef } };
export type CampaignEvent = { seq: number; day: number; type: string; payload: Record<string, unknown> };
export type CampaignState = { relations?: Record<string, Relation>; operations?: Record<Id, OperationState>; shells?: Record<Id, ShellState>; models?: Record<Id, ModelState>; warRng?: RngState; version: 2; clock: Clock; rng: RngState; pressure: number; pressureSource?: Id;
  debtState?: { arrears: number; due: number; paid: number; seized: Id[]; credit?: { limit: number } };
  places: Record<Id, PlaceState>; maps: Record<Id, { blight: Record<string, { rift: Id; patch: Id }>; known: Record<string, KnownCell> }>; patches: Record<Id, BlightPatch>; actors: Record<Id, ActorState>; rifts: Record<Id, RiftState>; factions: Record<Id, FactionState>; ship: ShipState; roster: RosterState;
  hangar: HangarState; restraint: RestraintBay; mechs: Record<Id, MechState>; inventory: Inventory; ledger: Ledger; research: Record<Id, ResearchState>;
  jobs: Job[]; contracts: Record<Id, ContractState>; pendingChoices: Prompt[]; pendingTicks: number; pendingBattle?: Sortie; lore: string[]; flags: Record<string, number>; log: CampaignEvent[];
  // SPEC-GAP：共用遞增 id、效果 uid、待生成佇列與工時池為後續模組的序列化簿記。
  idCounter: number; effectCounter: number; calendar: Id; techHours: number;
  pendingContracts: { template: Id; near?: string }[]; pendingEvents: Id[] };
export type OpsCtx = { db: ContentDB; world: WorldDB; emit(type: string, payload?: Record<string, unknown>): CampaignEvent };

export type WorldDefByKind = { wterrain: WTerrainDef; map: MapDef; regions: RegionsDef; place: PlaceDef; lane: LaneDef;
  operation: OperationDef; treaty: TreatyDef; lineage: LineageDef; model: ModelDef; forces: ForcesDef; affinity: AffinityDef; calendar: CalendarDef; ship: ShipDef; rift: RiftDef;
  encounter: EncounterDef; "faction-ops": FactionOpsDef; contract: ContractTemplate; action: WorldActionDef; market: MarketDef; service: ServiceDef;
  recruit: RecruitPoolDef; background: BackgroundDef; research: ResearchDef; job: JobDef; names: NamesDef; event: EventDef;
  dialogue: DialogueDef; room: RoomDef; templates: TemplatesDef; start: StartDef; beasts: BeastDef; keymap: KeymapDef };
export type WorldKind = keyof WorldDefByKind;

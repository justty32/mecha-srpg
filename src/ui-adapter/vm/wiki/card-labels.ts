// 百科卡片的欄位情境譯名；普通文字、識別碼與未知枚舉保留原文。
const classes: Record<string, string> = { ancient: "古代機", bio: "生物系", mechanical: "衍型機" };
const slots: Record<string, string> = {
  weaponMount: "武器掛架", restraint: "拘束具", cockpit: "座艙", soulCore: "機魂核心",
  armorMount: "裝甲掛架", sensorMount: "感測器掛架", backMount: "背部掛架", systemMount: "系統掛架",
};
const functions: Record<string, string> = {
  core: "核心", cockpit: "座艙", manipulator: "操作肢", sensor: "感測器", locomotion: "移動器官",
  weaponMount: "武器掛架", spawner: "繁殖器官",
};
const omenLayers: Record<string, string> = { moon: "月相", distance: "月距", eclipse: "月食", sky: "星象", season: "節令", scripted: "特定事件" };

export function cardEnumLabel(kind: string, field: string, value: string): string {
  let names: Record<string, string> | undefined;
  if (field === "cls" || field === "origin") names = classes;
  else if (field === "mode") names = { activated: "主動", reaction: "反應" };
  else if (field === "scope") names = { layer: "層", mech: "機體", part: "部位", person: "人物" };
  else if (field === "symmetry") names = { asymmetric: "非對稱", bilateral: "左右對稱" };
  else if (field === "slot" || /^parts\[\d+\]\.slots\[\d+\]\.type$/u.test(field)) names = slots;
  else if (field === "kind" && ["person", "character"].includes(kind)) names = { human: "人類", soul: "機魂" };
  else if (/^capture\.(?:requireIntact|requireBroken)\[\d+\]$/u.test(field)) names = functions;
  else if (field === "behaviors.spawner.tether") names = { dieWithParent: "隨母體死亡", freeOnParentDeath: "母體死亡後獨立" };
  else if (kind === "model" && field === "exportPolicy") names = { open: "開放出口", licensed: "授權出口", restricted: "限制出口" };
  else if (kind === "omen" && ["layer", "emerge.layer"].includes(field)) names = omenLayers;
  return names && Object.hasOwn(names, value) ? names[value]! : value;
}

import { loadWorldDirs } from "../content/load.ts";
import { newCampaign } from "../content/start.ts";
import type { OpsCommand } from "../state/types.ts";
import type { TextState } from "./parse.ts";

export function fixture() {
  const { db, world, errors } = loadWorldDirs(["content/base"]);
  if (errors.length) throw new Error(JSON.stringify(errors));
  const state: TextState = newCampaign(db, world, "start/default", 7);
  state.text = { names: { "person-1": "阿九", "person-2": "阿金", "mech-8": "犬一", "mech-9": "犬二" } };
  state.contracts["contract-20"] = { id: "contract-20", template: "base:contract/clear", issuer: "base:faction-ops/selene-whitegloves",
    target: { node: "base:node/dhaka" }, status: "offered", terms: { total: 100, advance: 20, perHead: 5 }, paidAdvance: false,
    heads: {}, offeredDay: 0, deadlineDay: 10, stageIdx: 0, annoyance: 0 };
  state.jobs.push({ id: "job-21", kind: "repair", target: "mech-8", needHours: 10, doneHours: 0, materials: {}, paid: false, priority: 0 });
  return { db, world, state };
}
export const examples: { zh: string; cmd: OpsCommand }[] = [
  { zh: "看 犬一", cmd: { v: "look", target: "mech-8" } },
  { zh: "談 阿九 達卡", cmd: { v: "talk", who: "person-1", topic: "達卡" } },
  { zh: "走 機庫", cmd: { v: "go", room: "hangar" } },
  { zh: "圖", cmd: { v: "map" } },
  { zh: "航 達卡 經 吉大港", cmd: { v: "sail", to: "base:node/dhaka", via: ["base:node/chittagong"] } },
  { zh: "泊", cmd: { v: "dock" } }, { zh: "懸", cmd: { v: "drift" } },
  { zh: "等 3", cmd: { v: "wait", days: 3 } },
  { zh: "板 contract-20", cmd: { v: "board", contract: "contract-20" } },
  { zh: "接 契約 contract-20 預付", cmd: { v: "accept", contract: "contract-20", ask: "advance" } },
  { zh: "棄 contract-20", cmd: { v: "drop", contract: "contract-20" } },
  { zh: '出戰 {"contract":"contract-20","units":[]}', cmd: { v: "sortie", sortie: { contract: "contract-20", units: [] } } },
  { zh: "派 阿九 犬一 pilot 職務 pilot", cmd: { v: "assign", person: "person-1", seat: { mech: "mech-8", seat: "pilot" }, role: "pilot" } },
  { zh: "排 repair 犬一 左腿", cmd: { v: "queue", job: { kind: "repair", target: "mech-8", part: "左腿" } } },
  { zh: "序 job-21 2", cmd: { v: "reorder", job: "job-21", priority: 2 } },
  { zh: "投 犬一 2", cmd: { v: "devour", beast: "mech-8", amount: 2 } },
  { zh: "陪 person-7 阿九 calc", cmd: { v: "accompany", soul: "person-7", by: "person-1", node: "calc" } },
  { zh: "買賣 達卡 買 stock:flesh 賣 stock:scrap", cmd: { v: "trade", market: "base:market/dhaka", buy: ["stock:flesh"], sell: ["stock:scrap"] } },
  { zh: "招 candidate-1", cmd: { v: "hire", candidate: "candidate-1" } },
  { zh: "解 阿九", cmd: { v: "fire", person: "person-1" } },
  { zh: "探 base:node/old-array 阿九", cmd: { v: "explore", ruin: "base:node/old-array", party: ["person-1"] } },
  { zh: "喚 犬一 阿九", cmd: { v: "wake", shell: "mech-8", by: "person-1" } },
  { zh: "選 2", cmd: { v: "choose", choice: 2 } },
  { zh: "付 債 500", cmd: { v: "pay", account: "debt", amount: 500 } },
  { zh: "借 800", cmd: { v: "borrow", amount: 800 } },
  { zh: "存", cmd: { v: "save" } }, { zh: "讀 0", cmd: { v: "load", slot: 0 } },
  { zh: "助 航", cmd: { v: "help", v2: "航" } },
];

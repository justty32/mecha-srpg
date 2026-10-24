import type { CampaignState, OpsCommand } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";

// 使用完整 id 避開重名；JSON 字串保留空白、引號與換行。
export function formatCommand(cmd: OpsCommand, _state: CampaignState, _world: WorldDB): string {
  const q = (value: string) => JSON.stringify(value);
  const waypoint = (value: string | { x: number; y: number } | { actor: string }) => q(typeof value === "string" ? value : "actor" in value ? `@${value.actor}` : `${value.x},${value.y}`);
  const list = (values: string[]) => values.map(q).join(" ");
  let args = "";
  switch (cmd.v) {
    case "look": args = cmd.target === undefined ? "" : q(cmd.target); break;
    case "talk": args = `${q(cmd.who)}${cmd.topic === undefined ? "" : ` ${q(cmd.topic)}`}`; break;
    case "go": args = q(cmd.room); break;
    case "sail": args = `${waypoint(cmd.to)}${cmd.via === undefined ? "" : ` via ${cmd.via.map(waypoint).join(" ")}`}`; break;
    case "wait": args = String(cmd.days); break;
    case "board": args = cmd.contract === undefined ? "" : q(cmd.contract); break;
    case "accept": args = `${q(cmd.contract)}${cmd.ask === undefined ? "" : ` ${cmd.ask}`}`; break;
    case "drop": args = q(cmd.contract); break;
    case "sortie": args = JSON.stringify(cmd.sortie); break;
    case "assign": args = `${q(cmd.person)}${cmd.seat ? ` ${q(cmd.seat.mech)} ${q(cmd.seat.seat)}` : ""}${cmd.role === undefined ? "" : ` role ${q(cmd.role)}`}`; break;
    case "queue": args = JSON.stringify(cmd.job); break;
    case "reorder": args = `${q(cmd.job)} ${cmd.priority}`; break;
    case "devour": args = `${q(cmd.beast)} ${cmd.amount}`; break;
    case "accompany": args = `${q(cmd.soul)} ${q(cmd.by)}${cmd.node === undefined ? "" : ` ${q(cmd.node)}`}`; break;
    case "trade": args = `${q(cmd.market)}${cmd.buy === undefined ? "" : ` buy ${list(cmd.buy)}`}${cmd.sell === undefined ? "" : ` sell ${list(cmd.sell)}`}`; break;
    case "hire": args = q(cmd.candidate); break;
    case "fire": args = q(cmd.person); break;
    case "explore": args = `${q(cmd.ruin)} ${list(cmd.party)}`; break;
    case "wake": args = `${q(cmd.shell)} ${q(cmd.by)}`; break;
    case "choose": args = String(cmd.choice); break;
    case "pay": args = `${q(cmd.account)} ${cmd.amount}`; break;
    case "borrow": args = String(cmd.amount); break;
    case "load": args = String(cmd.slot); break;
    case "help": args = cmd.v2 === undefined ? "" : q(cmd.v2); break;
    case "map": case "dock": case "drift": case "save": break;
  }
  return `${cmd.v}${args ? ` ${args}` : ""}`;
}

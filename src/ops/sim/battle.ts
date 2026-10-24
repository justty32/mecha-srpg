import { runSortie } from "../sortie/index.ts";
import type { BattleRunner } from "../time/index.ts";

export const defaultBattleRunner: BattleRunner = (s, ctx, sortie) => runSortie(s, ctx, sortie);

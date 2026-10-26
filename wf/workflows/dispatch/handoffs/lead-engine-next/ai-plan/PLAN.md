# AI 自護／側閃／友方支援診斷與修正計畫

## 已讀清單

親自讀取（路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg`）：`AGENTS.md`、本線交接書 `wf/workflows/dispatch/handoffs/lead-engine-next/cx-en-ai-plan.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`wf/workflows/planning/specs/core/README.md`、其 AI 相關 `ai.md`、`data-model-abilities-effects.md`、`rules-turn-and-actions.md`；`wf/workflows/dispatch/handoffs/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/lead-mech2/report.md`；`lead-kaiju2/kj2-plan/plan.md` 第 10 節及 AI 鍵／範本相關段落。

以 `python3 wf/tools/tabledb.py` 親查 `wf/workflows/common/code-map.json` 的 ai 列、`wf/workflows/testing-checks.json` 的 **0-based 5、6、10 列**（另讀 fuzz 第 9 列），及 `lead-kaiju2/kj2-plan/roster.json` 的能力原分類。另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、planning、dev-env、inbox README／PROTOCOL。已完成開場 inbox_read、上線 PROGRESS，按步驟輪詢本線 orders；未派子代理。

親讀 `src/ai/` 全部20個TS檔、`src/sim/{probe,measure,run}.ts`，相關session、rules、黃金入口；以 `git log -p -- <路徑>` 查歷史、`grep` 查持有者。

本線只寫本目錄 `PLAN.md`、`measure-support.ts`、`baseline.json`；沒有修改既有引擎、內容或測試，沒有 commit。本文的產出線測試建議不是本線追加驗收；本線只執行交接書固定四條。

## 1. 盤點

最終 **38 招**，未超過 40 招 gate。取全部 base 能力中：self 且有 protect／escape 或正向 evasion 效果；可指向隊友且有 buff／protect／heal；另納入交接書點名的青鬣 self buff 與伏耳減益。這也納入名為 protect、實效是召喚的母海裂腹，防止只按效果篩選漏掉分類邊界。純自我攻擊增益、孵生、冷卻排燼而不自護／escape 者不屬本題；沒有獨立 heal 分類的現役能力。本線沒有碰萬潮葬王。

歷史證據：`6b0a3b2` 在 main 首次新增八檔時已是 buff，故不能把新增 diff 冒充 protect→buff 的 diff；原分類取同一計畫的 `roster.json` 中 `abilities` 欄，與 plan「按列中鍵 1」規則對照。八招為：並翼遮燈、合鉗成簷、抱鐘收足、俯背成簷、低角迎矢、捲帆側掠、收幕側走、白林疊影。**青鬣豎鬣原本就是 buff，不在八招內。** 舊名「盾甲舉盾／叩闕甲豎甲／排燼扶架」現行能力名分別為「王蓋高擎／闔殼封闕／借我一息」，以 id 為準。

表內列目前／原分類、持有者與效果；檔案完整路徑均為 `content/base/abilities/<id 去掉 ability/>.json`（逐列另列檔名）。`同現`＝非該八招，無本批改鍵證據，不主張更早歷史從未調整。完整所有持有者、效果結構與量測載體另存 [baseline.json](baseline.json) 的 `inventory`。有至少兩個實際持有者就列兩個以上；內容唯一持有者明記「唯一」，不虛構第二台、不把場上複製兩個實例算兩種持有者。

|序|能力 id；檔名（上述 abilities 目錄）|目前←原分類|持有者|效果一句|
|---|---|---|---|---|
|1|`ability/ax-brinemother-brood`；`ax-brinemother-brood.json`|protect=1/attack=0.6←同現|frame/ancient-brinemother（唯一）|召喚tidewolf。|
|2|`ability/ax-lotus-reborn`；`ax-lotus-reborn.json`|buff=1/escape=0.7←同現|frame/ancient-lotus（唯一）|閃避+20、意志+15。|
|3|`ability/ax-plumed-featherwind`；`ax-plumed-featherwind.json`|buff=2/protect=2←同現|frame/ancient-plumed（唯一）|閃避+15。|
|4|`ability/ax-psychopomp-procession`；`ax-psychopomp-procession.json`|protect=1/buff=0.6/escape=0.6←同現|frame/ancient-psychopomp（唯一）|閃避+20、召喚mite。|
|5|`ability/ax-skybearer-hold-sky`；`ax-skybearer-hold-sky.json`|protect=3/buff=1←同現|frame/ancient-skybearer（唯一）|閃避+10、先攻+3。|
|6|`ability/ax-skybearer-unburden`；`ax-skybearer-unburden.json`|buff=ax-sky×0.04/escape=1←同現|frame/ancient-skybearer（唯一）|ax-sky-60。|
|7|`ability/ax-watchhorn-bifrost`；`ax-watchhorn-bifrost.json`|scout=2/protect=1/buff=1←同現|frame/ancient-watchhorn（唯一）|感知+15、閃避+10。|
|8|`ability/ax-watchhorn-gjallarhorn`；`ax-watchhorn-gjallarhorn.json`|buff=3/protect=2←同現|frame/ancient-watchhorn（唯一）|先攻+5、命中+15。|
|9|`ability/cx3-call-the-tide`；`cx3-call-the-tide.json`|buff=1←同現|frame/cx3-flyingfish-iv（唯一）|命中+8。|
|10|`ability/kx-bell-borer-close`；`kx-bell-borer-close.json`|buff=1←protect=1|monster/bell-borer-a、frame/bio-bell-borer|閃避+12、先攻-2。|
|11|`ability/kx-brood-call`；`kx-brood-call.json`|buff=1←同現|monster/lancewing-b、frame/bio-lancewing|命中+8、先攻+2。|
|12|`ability/kx-carapace-brace`；`kx-carapace-brace.json`|protect=1←同現|monster/siegebeetle-a、frame/bio-siegebeetle|閃避+18、先攻-3。|
|13|`ability/kx-drowned-grove-veil`；`kx-drowned-grove-veil.json`|buff=1←protect=1|monster/drowned-grove-a（唯一）|閃避+10。|
|14|`ability/kx-dusk-fold-withdraw`；`kx-dusk-fold-withdraw.json`|buff=1←escape=1|monster/dusk-fold-a、frame/bio-dusk-fold|閃避+12。|
|15|`ability/kx-hinge-crab-shelter`；`kx-hinge-crab-shelter.json`|buff=1←protect=1|monster/hinge-crab-c、frame/bio-hinge-crab|閃避+10。|
|16|`ability/kx-hollow-sail-fold`；`kx-hollow-sail-fold.json`|buff=1←escape=1|monster/hollow-sail-c、frame/bio-hollow-sail|閃避+10、先攻+2。|
|17|`ability/kx-lantern-keel-gather`；`kx-lantern-keel-gather.json`|buff=1←protect=1|monster/lantern-keel-c、frame/bio-lantern-keel|閃避+8。|
|18|`ability/kx-mirror-turn`；`kx-mirror-turn.json`|protect=1←同現|monster/mirror-a、frame/bio-mirror|閃避+16。|
|19|`ability/kx-reef-antler-brace`；`kx-reef-antler-brace.json`|buff=1←protect=1|monster/reef-antler-a、frame/bio-reef-antler|閃避+18、先攻-3。|
|20|`ability/kx-shelf-back-shelter`；`kx-shelf-back-shelter.json`|buff=1←protect=1|monster/shelf-back-b、frame/bio-shelf-back|閃避+8。|
|21|`ability/kx-shell-ear-hush`；`kx-shell-ear-hush.json`|debuff=1←同現|monster/shell-ear-d、frame/bio-shell-ear|命中-5、感知-2。|
|22|`ability/kx-shield-raise`；`kx-shield-raise.json`|protect=1←同現|monster/bulwark-b、frame/bio-bulwark|閃避+22。|
|23|`ability/kx-split-fin-swerve`；`kx-split-fin-swerve.json`|escape=1←同現|monster/split-fin-c、frame/bio-split-fin|閃避+8、先攻+2。|
|24|`ability/kx-spore-shroud`；`kx-spore-shroud.json`|protect=1←同現|monster/rotwarden-a、frame/bio-rotwarden|閃避+15。|
|25|`ability/kx-star-howl`；`kx-star-howl.json`|buff=1←同現|monster/cliffjaw-red-eye、frame/bio-cliffjaw|命中+10、先攻+3。|
|26|`ability/kx-storm-mane-rise`；`kx-storm-mane-rise.json`|buff=1←同現|monster/storm-mane-a、frame/bio-storm-mane|命中+8、先攻+2。|
|27|`ability/kx-surf-runner-skip`；`kx-surf-runner-skip.json`|escape=1←同現|monster/surf-runner-d、frame/bio-surf-runner|閃避+10。|
|28|`ability/m2-relieve-ally`；`m2-relieve-ally.json`|protect=1/buff=0.8←同現|frame/cn-yoke-i、frame/innersea-lantern、component/m2-relief-cradle|閃避+6、heat-15。|
|29|`ability/mx-anvil-roar`；`mx-anvil-roar.json`|buff=1←同現|frame/anvil-crimson-rivet（唯一）|命中+8、意志+5。|
|30|`ability/mx-ash-screen`；`mx-ash-screen.json`|protect=1/buff=0.6←同現|frame/anvil-hoist-ii、frame/backside-white-night、component/mx-ash-mist|閃避+12。|
|31|`ability/mx-aurora-veil`；`mx-aurora-veil.json`|buff=1/protect=0.8←同現|frame/quito-thunderbird、frame/selene-aurora|閃避+15。|
|32|`ability/mx-flare-dodge`；`mx-flare-dodge.json`|escape=1/buff=0.5←同現|frame/anvil-crimson-rivet、frame/anvil-ii、component/mx-flare-wings|閃避+15。|
|33|`ability/mx-guard-stance`；`mx-guard-stance.json`|buff=1/protect=1.5←同現|frame/anvil-hoist-ii、frame/bulwark-caisson-01|閃避+12。|
|34|`ability/mx-moonless-command`；`mx-moonless-command.json`|buff=1.5←同現|frame/selene-eclipse-moonless（唯一）|命中+10、先攻+2。|
|35|`ability/mx-old-city-wall`；`mx-old-city-wall.json`|protect=1.5/buff=1←同現|frame/bulwark-old-city、frame/cn-yoke-i|閃避+10、意志+10。|
|36|`ability/mx-tide-leap-up`；`mx-tide-leap-up.json`|buff=0.8/escape=0.6←同現|frame/backside-white-night、frame/cx3-flyingfish-ii、component/mx-tide-leap|閃避+10、命中+5。|
|37|`ability/mx-white-night-fade`；`mx-white-night-fade.json`|escape=1/buff=0.6←同現|frame/backside-white-night（唯一）|閃避+25。|
|38|`ability/rearguard-oath`；`rearguard-oath.json`|buff=1/protect=1←同現|frame/ancient-rearguard（唯一）|閃避+10、先攻+3。|

六台卸燼支援機全部量測：IX-08 `frame/ix-wain-01`、衡梁-I型 `frame/cn-yoke-i`、GL-02 `frame/league-gantry-02`、扶梁 `frame/ix-porter-ii`、留燈-合印 `frame/innersea-lantern`、歸燈-燕鷗 `frame/league-last-ferry`，來源皆為 `component/m2-relief-cradle`。其中能力 min range=1，不能以自己代替友方目標。

## 2. 病因（函式名＋條件原文）

**A｜護衛指派被錯當所有 protect 的必要前提。** `score.ts::want`：`protect: ctx.assignment?.protect ? p.protect : 0`。`strategy.ts::createDefaultStrategy().roundPlan` 只在 `if (stance === "defend")` 裡從 `own.filter((id) => id !== unit)` 指派 protect（另有母體護巢指派）。單挑沒有其他己方，攻勢／hold stance 也通常沒有指派；因此純 protect 自護即使受威脅，需求乘數仍為零。反過來，有 protect 指派也未檢查這次真正保護的目標是否需要保護。

**B｜escape 只計站位危險差，忽略增閃。** `score.ts::scoreCandidate` 的 `else if (tactic === "escape")` 為 `value = Math.max(0, dangerAt(ctx.danger, actor.pos) - dangerAt(ctx.danger, destination));`；原地能力的 destination 就是 actor.pos。`want` 又以 `escape: survive`，其中 `survive = (1 - hpFraction(ctx.q, ctx.s, unitId)) * p.survive`，滿血即零。注意這不是「所有 escape 永遠零」：移動＋招式候選可以因移到安全格獲分，故基準的濺蹄／岔鰭有少量使用；但得分未證明側閃效果本身有效，純移動也許已足夠。

**C｜berserk 在候選階段排除 self buff，且分數尺度不同。** `policies/berserk.ts::propose`（登記物件方法）：`if (c.cmd.target?.unit === agent.unit) return false;`，再 `return (weights.attack ?? 0) > 0 || (weights.attackArea ?? 0) > 0;`。同檔 `score` 對 ability 一律回傳 `(ctx.params.berserkAttack ?? DEFAULTS.berserkAttack) + distanceWeight / (1 + (target ? ctx.q.distance(pos, target) : 0))`，預設基底 10；單把 self buff 放回候選、仍套通用小分數，會繼續輸。`agent.ts::takeTurn` 的 `s.units[agent.unit]!.controlMode === "berserk" ? "berserk" : withdraw ? "flee" ...` 區分真正失控與 profile 狂攻；修正應保留不逃／不支援他人的狂攻語意。

**D｜友方支援估值與實際需求脫節。** `score.ts::scoreCandidate` 的 `else if (["heal", "buff", "protect"].includes(tactic))` 對單體只做 `else if (target && state.units[target] && !q.hostile(state, agent.unit, target)) value = 1.5 - hpFraction(q, state, target);`；範圍也把同一 HP 式加總。`want` 的 `heal: p.heal, buff: p.buff` 固定。滿血仍有 0.5 基值，不看 heat、池方向、增閃幅度、實際治療量或有無相同效果。故「高燼不用」與「低燼亂用」可同時出現，不應只調高 buff。`previewOutcome` 雖有 after state，`inspectEffects = def.effects.length > 0 && (def.ai.tactics.debuff !== undefined || def.ai.tactics.disable !== undefined)` 只為減益讀效果增量，buff 路徑沒用它。

**E｜沒有邊際收益、AP 機會成本與同回合防重複。** `scoreCandidate` 結尾只有 `return score - p.moveCost * steps - danger + objectiveMove;`，並未扣能力 AP／其他池的價值，也未看 buff 前後差異。`policies/tactical.ts::proposeTactical` 的 `if (def.mode === "sustained" && state.units[actor]!.sustained.includes(ability)) continue;` 只防 sustained 重開，不防 activated refresh。`rules/effects.ts::applyEffect` 則是 `if (def.stack.policy === "refresh") { first.remaining = remaining; return first; }`，所以既有「緩燼」不重跑 `install` 的 onApply，沒有第二次 heat -15；AI 仍可能把沒有新收益的重放當正分。冷卻暫時掩蓋部分能力，不構成通用防線。另有 objectiveMove 正分，若只把支援收益歸零，仍可能靠移動分帶出無效施法。

**F｜候選站位以追敵為先，可能根本靠不到有需求的隊友。** `policies/tactical.ts::proposeTactical` 的 moves 用 `nearest(a) - nearest(b) || dangerAt(ctx.danger, a) - dangerAt(ctx.danger, b)` 排序後 `.slice(0, Math.max(0, Math.floor(opts?.maxMoves ?? ctx.params.maxMoves ?? DEFAULTS.maxMoves)))`；補射程位置的 `isAttack` 只識別 `["attack", "attackArea", "disable"].some(t => q.evalNum(view, def.ai.tactics[t] ?? 0, actor) > 0)`。後段雖能枚舉友方 unit／ball，卻沒有為友方支援保留低成本施法格。`regroup`／`flee` 的 propose 只提移動／撤離；`sentinel.propose` 的 `if (distance === 0)` 以外只回守點。這些模式不是通用 buff 權重能修到的。

**G｜species profile 參數沒有進一般評分。** `src/sim/run.ts::scenarioToSetup`：`slotProfiles[slot] = { policy: profile?.policy ?? "tactical", params: { ...profile?.params } };`，profile 來自 slot 的 entry.ai；monster 分支只 `unitPolicies[slot]![id] = db.require("aiprofile", species.aiProfile).policy;`。`agent.ts::takeTurn` 建 context 時仍 `params: env.params`。只有 `intent.ts::individualRetreat` 額外合併 `...q.speciesIntent?.(s, id)?.params`。所以未明列 slot.ai 的 probe 保留怪獸 sentinel／berserk policy，卻不使用 species 的 attack=3、band=1 等。因此本基準未套用 sniper-perch 的攻擊三倍。

**H｜背景的「從未用」須按載體及情境限定。** `probe.ts::planProbe` 的 `units: [hero]` 產生單主角；m2 `target.range.min=1` 排除 self，所以標準 probe 無友方候選。`tactical::proposeTactical` 最終 `if (q.checkAbility(state, actor, ability, target) === null)` 才加候選；古代招式的 `require` 多要求 `self.resonance >= 0.5`，0 次不能單憑總回合數歸因於評分。伏耳 `kx-shell-ear-hush` 是 debuff，已走 `debuffValues`；本次實測野生伏耳有使用，故沒有證據支持另修一個「伏耳不會出手」特例。修法是正確對照，保留合法性限制。

## 3. 設計（可直接拆工作）

先加 `src/ai/support.ts`，以同一個 preview 的 before／after 差值產生公開、純函式的支援收益；`scoreCandidate`、berserk、候選站位共用。只讀 `ctx.view` 與被允許的己方狀態，不讀未見敵人真實 HP，不耗真 RNG。沿既有三組 preview seed；支援用各 preview 的實際收益平均，**不再乘一次命中率**，避免 hit 效果被二次折減。self／friendly only 現行 hitChance=100，仍保留一般含敵友範圍的正負收益。

為了辨識效果有卸燼主用途、避免對無 heat 的古代機只因附帶 evasion 而錯用，經 `RulesQuery` 新增 `effectDef(id)` 與 `poolDecls(state, unitId)`（只讀機體池，含部件）。adapter 接 `db.require("effect", id)`／rules.poolDecls；stub 同步。不得在 AI 寫能力 id 特例。成本與效果來源靠 AbilityDef、EffectDef、PoolDecl 的詞彙，參數暫值沿用既有程式 DEFAULTS 模式，不另創 schema。

### 共用量與公式

`clamp(x)=min(1,max(0,x))`。對受益者 u：`h=hpFraction(q,view,u)`，`D=dangerAt(ctx.danger,將受益的位置)`，`d=D/(D+supportDangerScale)`；D=0 時 d=0。危險圖是可見敵射程＋移動＋ZoC 的粗估，不是預期傷害，不能直接當 HP；本案不改 `danger.ts` 的地圖演算法。

從預覽取 **實際增量**：新增 evasion `Δev`（以 q.evalNum 求 before/after 的 self.attrs.evasion）、實際恢復的層 HP `Δhp`（逐同層正差加總、最多缺血量）、效果造成的 inverted 池下降 `Δpool`（排除支付自己成本，使用 hook／produce 的作用對象與 before/after 對照）、有益 band 脫離。普通正向池只對實際補足計值；無該池、max<=0／非有限且不能取門檻時該項為0。

防護收益 `Vdef = supportDefense * d * clamp(Δev/supportEvasionUnit) * (1 + supportWoundBoost*(1-h))`。heal 收益 `Vheal = supportHeal * Δhp/maxHP * (1+d)`，滿血零、負傷但無真正修復也零；不能把一招沒有治療的 m2-relieve-ally 當 heal。

對 inverted 資源（本案重點 heat）：`r=cur/max`；`need=clamp((r-supportHeatStart)/(supportHeatUrgent-supportHeatStart))`；`Vpool=supportRelief*(Δpool/max)*need*(1+supportBandBonus*改善帶數)`。讀 band 定義與狀態，不假設每個機體門檻都是100。若能力的直接有益 hook 包含 inverted pool 減量，將其視為卸載主用途：**r<=supportHeatStart 或 Δpool=0 就不算該目標的附帶防護收益**；這使高燼有用、低燼不會為附帶+6閃避亂花 AP。多個受益目標分開判斷，不讓一台滿燼把其他低燼目標一起灌分。沒有 heat 的機體不會拿 heat 的替代估值。

攻擊增益 `Voff=max(0, B(after)-B(before))`：B 是當前 AP 內最多 `supportLookaheadAttacks` 次合法攻擊的保守預期收益，候選只取至多 `supportLookaheadTargets` 個可見敵人與既有攻擊分數最高的招；按 AP、彈藥與冷卻扣掉可打次數，不能對已預估死亡的同一目標重算擊殺。after 已扣施放 AP，before 尚未扣，故會自動扣掉「為了 buff 少打一發」的機會成本。不遞迴計算 buff／heal，不放寬射程。純 offensive buff 沒有本回合可享受到的攻擊收益就0；ownerTurns=1 且在目標下次出手前即到期者，不預借下一回合傷害。現有召喚／偵察／承擔控制等不屬這些已識別收益的項保留原分支，勿用零收益把孵生整體關掉；混合能力各作用只計一次。

每個受益者 `Vu=Vdef+Vheal+Vpool+Voff`，敵方則乘負的 enemyBuffPenalty。護衛指派只加 `1+supportAssignmentBonus` 的目標優先係數，**不再是入場門檻**。本類支援的 tactic 倍數 `M=max(wBuff*p.buff*supportBuffScale, wProtect*p.protect, wHeal*p.heal, wEscape*supportEscape)`，不存在的權重視為0；採 max 防同一收益被 buff＋protect 重算。`Ssupport=M*ΣVu - supportApCost*消耗AP - supportPoolCost*其他稀缺池消耗比例 - moveCost*步數 - dangerK*新增危險 + objectiveMove`。AP 即使無指令權人物也循現有 person→mech 回退取值。純支援候選 ΣVu<=0 時直接剔除／-Infinity，**不准靠 objectiveMove 把無效招救回正分**；保留同一站位的純 Move。

原有真正逃離的站位收益獨立保留：`max(0,D原-D新)*survive`，不和新增 defensive escape 重複算危險。對「先移動再原地側閃」，只有側閃的邊際防護大於其 AP 成本，才保留 useAbility；否則只 Move。滿血受威脅可自護；沒威脅時 Vdef=0，不會因仍滿血有固定0.5而勝過攻擊／End。

### 對應 A–H 的落點與防亂用

A／B／D：`want` 移除 self/ally protect 的指派硬閘，交 `support.ts` 分目標需求；escape 同時識別不位移的防護實效。舊攻擊、減益評分原則保留。支援評分基準以第4節為底，用高／低需求對照調暫值；不是要求所有能力每場一定要用。

C：berserk `propose` 保留既有攻擊／追敵，再允許 **目標僅自己、已識別且有正邊際收益** 的 defensive/offensive buff；不加 ally buff，不改逃跑政策。`Amax` 為原 berserk 最佳攻擊分（沒有攻擊則0），`U=Vdef+Voff-成本`。有合法後續攻擊且 Voff>0 時 `S=max(Amax, berserkAttack)+min(U,berserkSupportBonusCap)`，只在 U>0 才成立；純防護以 `S=berserkAttack*min(berserkDefenseCap,U/berserkDefenseThreshold)`，達門檻才可能勝過眼前攻擊。青鬣 AP8、buff2、主攻5可作「先 buff 後仍能打一招」的真內容樣例；AP不足後續攻擊時不白放 offensive buff。此處有意擴充 spec 原本「只攻最近者」的描述，更新 ai.md，標明保持狂攻但容許有收益自增益。

E：同一 actor＋round 用過同一 ability 不再提出（成功執行才記，Wait 重入也算同輪）；記在 agent.memory 的 `{round, abilities}`，round 變了才清。不同 ability 指向同一 refresh／ignore 效果時，收益依 after/before 的 uid／contrib／pool 差判斷：沒有新值就0。stack／merge 也不得只看 uid，要算實際新增量；刷新持續時間本案保守計0，過期後可再放。這是 AI 防重複，不更改玩家合法性或 rules 的 refresh 語義。

F：`proposeTactical` 額外挑有實際支援需求的隊友，保留最多 `maxSupportMoves` 個「可付施放成本、射程／LOS合法、移動 AP 最低」的支援格，與攻擊格去重；仍尊重 sentinel 的 maxMoves=0／swarm leash，不追逐健康隊友。`regroup`、sentinel 回防、swarm 回巢分支可合併**不移位**且有正收益的 self/ally 支援候選，用同一公式比較既有移動。flee 只容許 self defensive 且預覽後仍有一條本回合合法出口進展路徑；沒有路徑保留原撤離，絕不先追友方。scripted 明確腳本不自動插招。

G：在 `agent.ts` 組單位 ctx 時統一 `params={...q.speciesIntent?.(view,unit)?.params,...env.params}`，slot 明示值優先；maxPureMoves、band 與 policy 計分均讀同一份有效 params。species policy 已由 sim 設定，不需重做 sim 資料結構。這讓各物種權重生效，也會擴大自然戰場行為差異；把這一子步和支援評分的效果分開比較，不能將其改造成所有物種共用同一 slot profile。

H：保持 checkAbility、共鳴、AP、冷卻等規則限制；m2 用真正有隊友的情境，古代招測試要先建立合法共鳴狀態。伏耳保留 debuff，對既有使用事實記錄即可，不特調保證每場出手。

### 新參數與暫值

沿既有 DEFAULTS＋profile.params 模式：支援暫值集中 `support.ts::SUPPORT_DEFAULTS`，內容調整寫 `content/base/aiprofiles/*.json` 的 params；不散放 magic number、不新增 rules 表。

`supportDangerScale=3`、`supportDefense=6`、`supportEvasionUnit=20`、`supportWoundBoost=1`、`supportHeal=6`、`supportHeatStart=0.6`、`supportHeatUrgent=1`、`supportRelief=12`、`supportBandBonus=0.5`、`supportAssignmentBonus=0.25`、`supportBuffScale=2`（抵消原 p.buff=0.5 的分類差異）、`supportEscape=1`、`supportApCost=0.08`、`supportPoolCost=0.1`、`supportLookaheadAttacks=2`、`supportLookaheadTargets=3`。berserk 檔頭新增 `berserkSupportBonusCap=1`、`berserkDefenseThreshold=1`、`berserkDefenseCap=1.2`；tactical 檔頭 `maxSupportMoves=4`。暫值不是驗收門檻。先用需求對照調 supportDefense／supportRelief，不改全體 attack。

## 4. 修正前基準量測

腳本 [measure-support.ts](measure-support.ts) 只讀磁碟內容，在記憶體建場；固定 seeds 1、2，自然場 12 輪，六台支援雙人場各高燼110／低燼0／半血三類、各4輪。自然場直接用 `planProbe` 的配對（frame 對同級機體及怪獸、monster 對兩台同級機體），沿同一 runBattle 公開 API 觀察成功指令及 round，不改原始碼。每招選一種 monster 加至多兩種 frame；唯一持有者照實測一種；六台排燼載體全數加入。這是兩 seed 的診斷樣本，不是勝率精度估計。

使用次數＝主角 player-0 成功的 UseAbility 指令，不混入反應招、對手或友方。出手機會＝起始持有該能力的主角存活並成功行動（含 End／Wait）的不同 round 數；Wait 重入不重算，沒成功指令不算。**不是合法可施放次數**：仍可能受冷卻、共鳴、缺 AP、部件毀損限制。同一回合可用多次，所以使用次數／機會數不必<=1。所有情境的勝／敗／平手率與逐 seed hash 均在 baseline.scenarios；合計表不混入額外 probe API 副本或 skirmish。

本次有效輸出：38招、76種載體、152個自然／對照情境、304場；另含六台標準probe共24場，以及skirmish5場。下表序號對應第1節，完整id在baseline.totals；八招權宜版皆有使用，但舊盾甲／叩闕甲仍0。

|盤點序號|使用次數|出手機會|
|---|---:|---:|
|1|0|27|
|2|0|32|
|3|0|32|
|4|0|27|
|5|0|22|
|6|0|22|
|7|0|21|
|8|0|21|
|9|12|32|
|10|26|80|
|11|22|81|
|12|0|75|
|13|8|24|
|14|18|51|
|15|28|76|
|16|30|68|
|17|29|75|
|18|0|71|
|19|17|75|
|20|30|78|
|21|18|90|
|22|0|80|
|23|7|79|
|24|0|76|
|25|19|76|
|26|18|84|
|27|9|96|
|28|44|347|
|29|4|33|
|30|37|237|
|31|18|64|
|32|47|86|
|33|36|97|
|34|7|22|
|35|29|199|
|36|30|97|
|37|3|32|
|38|0|30|

六台對照：每格為兩seed合計「總使用／第一輪使用」；每類2場，勝率皆0%、平手率100%（4輪timeout）。

|機體|高燼|低燼|半血|
|---|---:|---:|---:|
|frame/cn-yoke-i|0/0|0/0|4/0|
|frame/innersea-lantern|0/0|0/0|0/0|
|frame/ix-porter-ii|4/0|4/0|4/0|
|frame/ix-wain-01|4/2|4/2|4/2|
|frame/league-gantry-02|4/2|4/2|4/2|
|frame/league-last-ferry|0/0|0/0|4/2|

基準已推翻兩個過度概括：野生青鬣自增益確實0次，但 bio／corpse 駕駛載體會用；野生伏耳減益本次有出手，不能宣稱仍「從未」。六台排燼的標準單挑 probe 都0次，是無隊友；雙人場顯示 IX-08、GL-02 在高燼與低燼第一輪都使用，扶梁後續也兩邊同樣使用。核心問題是需求辨識不準，不是所有情境都無法選到能力。

八個古代自護／支援邊界能力及殿後招有共鳴 require，沒有合法機會統計不能把其零次全判為 AI bug。雙人場讓 heat 在初始設值後照真規則回復、累積，4輪合計不代表每次施放時仍是最初燼量；第一輪對照比總數更直接。需要精確高燼選招保證的單元測試應在支援者行動前建立同一快照，只切換目標 heat。

必用命令已在 repo 根實際執行：

```sh
npm run content:probe -- frame/cn-yoke-i frame/innersea-lantern frame/ix-porter-ii frame/ix-wain-01 frame/league-gantry-02 frame/league-last-ferry --n 2 --seed 1 --jobs 2 --rounds 12 --json -
node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5
```

腳本內以相同 `probe` API 單工重算，保留 `probeCli` 摘要；工具設計保證單／多工決定性一致。skirmish 用相同 runBattle 及 measure.ts 統計式，不透過子行程擷取 stdout。第一次自寫雙人場漏 exits、以及子行程 stdout 擷取為空都已在本線腳本修正，不拿失敗輸出當基準。

|seed|waitRatio|pass|勝方|unitTurns|輪數|
|---|---:|---|---|---:|---:|
|1|0|true|player|76|10|
|2|0|true|timeout|135|20|
|3|0|true|player|79|10|
|4|0|true|player|78|10|
|5|0|true|player|68|9|

重跑（repo 根）：

```sh
node /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/measure-support.ts
```

stdout 為完整 JSON；要重存才以 `> wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/baseline.json`。正式驗收用 pipe 接 Python 在記憶體與現有 baseline 逐字比較，不覆寫基準。腳本每場／每 seed 檢查15分鐘 gate，無時間戳和運行時長混進決定性 JSON；未觸發容量／時間 gate。

## 5. 影響面與產出線驗證方式

**AI 測試一定要看**：`test/ai/score.test.ts` 原本可能期望無護衛 protect=0／固定 buff HP 分數；`test/ai/policies.test.ts` 的 berserk 候選排除需改成「只允許有收益自護／self buff」。`test/ai/tactics-coverage.test.ts` 覆蓋友方範圍與 sustained；`agent.test.ts` 防重放與 Wait；`integration.test.ts`／`playtest-fixes.test.ts`／`intent.test.ts` 留意 retreat／regroup 切換。`balance.test.ts` 保持原本 skirmish「waitRatio<0.5 或有 winner」判準，不能為新 AI 改寬，seed1–5 用既有 measure CLI。

**`test/golden/` 六份未必改**：讀過 `test/golden.test.ts::run`，它逐項執行 `sc.commands`，沒有跑 AI 決策。僅改 AI 評分／ai.tactics 預期六份都不需重產；`people-berserk.hash` 名稱也不表示是 AI 選招黃金。若變了，先查是否越界改到規則／內容效果，不直接 `GOLDEN_UPDATE=1`。

**營運黃金有條件受影響**：`test/campaigns/*.json` 有凍結 BattleRecord 的情境會沿紀錄重播，AI 評分不必然改 hash；沒有紀錄而實打 AI、或出擊結果回寫世界者可能變。`src/ops/sim/fixtures/campaign-hash.json` 同理，先跑既有測試並解釋戰果／日期變動。不要預先改全部 campaign 期望。本線未跑重錄。

產出線的順序：相關 AI 單元與真內容整合測試→同 seed 跑本基準、高／低需求正反對照→skirmish seeds1–5→按 testing 既有完整 suite。若只發生預期 hash 漂移且原 commands 仍合法，才用 `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts src/ops/sim/golden.test.ts` 重產受影響 hash、再正常模式驗一次。**預設不用 `node test/campaigns/rerecord.ts`**；僅原指令被拒、sortie／戰鬥紀錄對不上時，先 `node test/campaigns/rerecord.ts <受影響名> --dry` 查看，再依原指令意圖重錄指定情境。此工具沿既有戰果 remap，不能把它當「重新實打所有 AI」的工具；若要更新實戰 BattleRecord，須透過對應真出擊路徑重建並審查戰果。

fuzz：既有 `npm test` 已含 ai／random 各15場。AI 行動軌跡和涵蓋事件會變，但池／層／重播等不變量不應改；依 testing 現有 fuzz 入口重現具體 failing seed，保留新回歸，不因支持增益放寬不變量。新純 preview 需確保來源 state/RNG 不變；profile 合併可能影響所有怪獸，不只38招。預估支援戰場、狂攻場、原地射手改變最多；固定指令規則黃金預期0檔，campaign hash 0至實際失敗的數檔，數量由實跑決定。

## 6. 改回原分類的建議

以語意和量測雙條件決定，不能現在直接改。產出線先保持現有 buff 鍵完成引擎，存一份修好引擎的 buff 版量測；再逐招在記憶體或受控內容差異下 A/B，使用同 seeds／載體／情境。只在原分類版使用次數 **不低於同一已修引擎的 buff 版**、且不增加無威脅／重複空放時才改。比較第4節「舊引擎 buff 版」只能當背景，不能混用不同引擎證明改鍵安全。整體場長改變時也看每回合比例及觸發當下，不能把活更久當變聰明。

|能力|建議（達A/B條件後）|理由|
|---|---|---|
|`ability/kx-bell-borer-close`|改回 protect|主要防護自己或鄰友；protect較準確，不能依賴外部護衛指派。|
|`ability/kx-drowned-grove-veil`|改回 protect|主要防護自己或鄰友；protect較準確，不能依賴外部護衛指派。|
|`ability/kx-dusk-fold-withdraw`|改回 escape|原地避擊增閃，修好後由防護收益支持escape，無位移不再零分。|
|`ability/kx-hinge-crab-shelter`|改回 protect|主要防護自己或鄰友；protect較準確，不能依賴外部護衛指派。|
|`ability/kx-hollow-sail-fold`|改回 escape|原地避擊增閃，修好後由防護收益支持escape，無位移不再零分。|
|`ability/kx-lantern-keel-gather`|改回 protect|主要防護自己或鄰友；protect較準確，不能依賴外部護衛指派。|
|`ability/kx-reef-antler-brace`|改回 protect|主要防護自己或鄰友；protect較準確，不能依賴外部護衛指派。|
|`ability/kx-shelf-back-shelter`|改回 protect|主要防護自己或鄰友；protect較準確，不能依賴外部護衛指派。|

其他現有 buff＋protect／escape 的混合鍵本次先保留，避免同時改全部內容。盾甲 `kx-shield-raise` 與叩闕甲 `kx-carapace-brace` 已是 protect，維持；鏡衣／垂紗也維持 protect。青鬣 `kx-storm-mane-rise` 原本就是攻擊增益，維持 buff；伏耳 `kx-shell-ear-hush` 維持 debuff。`m2-relieve-ally` 維持 protect=1、buff=0.8，由需求／實際卸燼收益修正，不能靠改成 heal 假裝有修復。濺蹄、岔鰭已是 escape，維持並讓原地防護也能估值。

## 7. 產出線工作清單

先落 evaluator／真內容測試，再接 tactical，接 berserk 與回防模式，最後處理單位 profile 參數與八招 A/B；每個病因都能由第2節原條件定位，不需要先重構整個 AI。

預估固定 **18 檔**（新2、改16）：新增 `src/ai/support.ts`、`test/ai/support.test.ts`；修改 `src/ai/score.ts`、`src/ai/agent.ts`、`src/ai/rules-query.ts`、`src/ai/adapters/rules-adapter.ts`、`src/ai/policies/tactical.ts`、`src/ai/policies/berserk.ts`、`src/ai/policies/regroup.ts`、`src/ai/policies/flee.ts`、`src/ai/policies/sentinel.ts`、`src/ai/policies/swarm.ts`、`test/ai/stub-rules.ts`、`test/ai/score.test.ts`、`test/ai/policies.test.ts`、`test/ai/agent.test.ts`、`wf/workflows/planning/specs/core/ai.md`、`wf/workflows/common/code-map.json`。新查詢簽名先 rg 全引用，同步受影響 stub，不讓 adapter 可查而測試拿不到。

通過分類比較後最多另改8個內容檔：`content/base/abilities/kx-lantern-keel-gather.json`、`kx-hinge-crab-shelter.json`、`kx-bell-borer-close.json`、`kx-shelf-back-shelter.json`、`kx-reef-antler-brace.json`、`kx-hollow-sail-fold.json`、`kx-dusk-fold-withdraw.json`、`kx-drowned-grove-veil.json`（後七檔亦在同一 abilities 目錄）。暫值需要逐 profile 覆寫時，首先考慮 `content/base/aiprofiles/tide-cultist.json`、`sniper-perch.json`、`kx-mycel-creep.json`，後兩檔也在 aiprofiles 同目錄；不預先全改。預估主體18檔、含改鍵最多26檔，另加實測必要的0–3個 profile、少數受影響黃金；這是規劃估計，不加驗收 gate。

必要測試放新 support.test.ts 的真規則小場，斷言實際候選／成功指令而非鏡像公式：

- **無威脅不自護**：滿血、有合法攻擊或僅 End 的兩例；不同正 objectiveMove 也不能帶出無收益自護。
- **受威脅會自護**：無護衛指派、滿血仍受威脅、低血受威脅；原地 protect 與 escape 均有真收益，控制攻擊收益使防護合理勝出；不能斷言任何威脅都必自護。
- **隊友高燼用／低燼不用**：同一行動前快照只改 target heat（如100與0）、同 seed、AP足夠、射程內；斷言高燼選 m2、低燼不選。另檢查沒有 heat 的古代機、部件已毀、射程外、AP不足的候選維持不合法。
- **berserk 會用 self buff**：青鬣 AP8、buff2後仍能主攻5，選 buff 後能攻擊；同名效果已有效／無敵可攻／AP不夠後續攻擊時不放。保留不退、不為隊友用支援、真正失控只對自身增益的語意。
- **不連疊**：同 actor 同 round、Wait 再入、兩能力共用同一 refresh 效果、既有緩燼的 onApply 不重跑；下一 round 過期後可重用。stack／merge 的實際增量仍可評，不新增收益就0。
- **友方需求與站位**：有傷且真能 heal 才獲治療分（用測試定義，不新增正式能力）；AOE只累加有需要受益者並扣敵人；移動後留足施放 AP；sentinel不越界、swarm不破leash、flee保有出口進展。
- **單位 profile 與決定性**：同 slot 不同 species 各自讀 params，slot明示值可覆蓋；takeTurn band用有效params；不讀隱藏敵人、不改輸入 state/RNG，同seed同輸出。原有 `test/ai/balance.test.ts` 判準維持。

這些是產出線的實作驗證工作，不是本線第5條驗收。本線固定四條結果：1：PLAN開頭已讀清單與七節齊全；2：八招＋舊兩招＋卸燼招，原分類與持有者齊全；3：腳本重跑exit 0，stdout與baseline.json逐字一致；4：A–H均列函式名與條件原文並人工對照。四條通過；不加跑其他檢查。

### 沒做到或證據不足的

沒有修改 AI，沒有宣稱修好後勝率／使用次數已改善。多個古代機及沉林等只有唯一真實持有者，無法滿足每招兩種既有持有者的字面要求，已逐列明記，未捏造；所有可用的多持有者項至少列兩個。共鳴門檻、無威脅精確對照、同回合重複與 profile 合併後影響留給上述產出線測試；本線只有修前證據。4輪雙人情境全部 timeout，不拿0%勝率作平衡結論。自然probe是兩seed樣本，不足以推斷長期強弱。

### 需要決定的事

八招依第6節 A/B 決定是否實際改回；先守需求辨識，再調暫值。本線無待使用者選權重，四條完成即停。

### 以後交接書該點名的工具

原分類最好直接點名 `tabledb.py .../kj2-plan/roster.json` 的 abilities 欄；main 的 squash／整批新增 diff 不一定保留改鍵前版本。基準除 `content:probe` 應點名 `planProbe`／`scenarioToSetup`／公開 AI 回合 API，讓支援測量確實有隊友、能算機會分母；黃金則點名固定指令測試與 `rerecord.ts --dry`，避免為 AI 改動一律重錄。單次量測若超15分鐘、工具本身不可跑或沙箱拒寫，依原交接書立即 BLOCKED，不另加重試／全套驗收。

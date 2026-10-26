# 已讀清單

cx-en-wc；2026-10-26；本線團隊 teams/engnext。下列皆親自讀取，不以交接摘要代替：

`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、worktree `AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`；使用 `wf/tools/tabledb.py` 查 `testing-checks.json` index 0、1、2、9。

`wf/workflows/dispatch/handoffs/plan-wanchao/plan.md` 全文（第三節守則及使用者裁示）、`wf/workflows/dispatch/handoffs/lead-wanchao/base-drafts.json` 全文與 metadata「執行說明」（並經 tabledb 查讀）、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/wc-plan/PLAN.md` 全文、同目錄 `cx-en-wc.md` 全文。

另讀 `wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/dev-env.md`、`wf/workflows/common/data-files.md`、`wf/workflows/team-model.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`；以 tabledb 查 code-map 相關領域。已執行開場 inbox_read 與逐步 inbox_poll。兩個子代理亦親讀上述先讀清單，分別處理戰鬥／UI與文案／spec；主線整合並驗證。

後續授權來源：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/orders/cx-en-wc.md`，lead-engine-next 在 16:13:20 特許 AI 指令窮盡分支的一行排除，16:18:54 特許 formation.ts 的遠端守牆接縫；其餘裁示不變。

## 做了什麼

實作根目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-wc`。共新增 7 檔、修改 38 檔＝45 檔；加本 REPORT 共46檔，未超過48檔 gate。最大新來源檔 `src/ops/world/lords.test.ts` 29,327 bytes；其餘新檔均小於30KB。node_modules 保留領導提供的符號連結，git 所列未追蹤為原狀；build 生成的 ignored dist 不列入來源寫集。未 commit、未刪檔、未改 lore／個體數值／species 數值／黃金／索引／code-map。

**E4 怎麼運作。** 開局不建事件蝕區。`blightShift` 只接受腳本授權的 area 與 shallow；首次套用在北岸九格排除既有 patch 及城市 footprint，取最大八鄰連通塊，建 `origin:"event",rift:"",depthOverride:"shallow"` 的無核心永久淺蝕。零格只記略過旗；同 area 重送不再發事件。普通裂縫核心、父子與 sinceDay 排序保持原契約。事件塊不計 pressure，不額外生野群，普通擴散避讓索引；patches.ts 另禁止正常退塊／清城入口刪它，確保寫入權只在此事件效果。

**E1 怎麼運作。** 只有 startIds 命中的開局才建立 `namedLords`。艦橋 room.desc 與 `Screen.panels.namedLords` 顯示王跡固定原文及獨立 sinceDay；不含此配置的包不新增故事 state。營運頁沿既有 room 呈現，泛用 campaign view 可承接。

**E2 怎麼運作。** 候選由真實 skyAt 找 month=8..24 的大潮且此前已有大潮，使用原始 seed 的主 RNG 複本抽一次；不消耗主、war、actor RNG。日結段2一夜順序記完四站，不依賴接約。沿途普通出獸上限只當日加一並 cap A；北郊查 (132,92) 曼哈頓≤4 的既有有效裂縫，最近且同距id字典序最小者 width 抬一級，另排除沿途二次疊級；沒有則 passed，不新增開局裂縫。北行完成套 E4、排三筆契約請求、發消息；段4提供路線 prompt，問訊讀當夜分支。觀測窗結束王跡失效，未接偵察約撤下，已接過期觀測亦不能生成舊S。

**E3 怎麼運作。** 同一 S 用真正的 UnitSpawn／UnitInit，帶 presence metadata，狀態是 presence。isActive 自然排除指令、單體／部位／AoE目標、隊列與勝負計數；unitAt 仍阻格。邊緣保留一格，敵軍部署區避讓。原 `effect/kx-tidal-dread` 對敵我 active 單位施加，沿用原 accuracy -10 與士氣檢定，真正新回合刷新、wait resumed 不重施，來源死亡／被捕後移除。未迎戰的 presence 不出現在戰果。UI 公開 marker 且不可選；save／snapshot／replay保留 metadata，舊情境不建立空 presence metadata。

**E5 怎麼運作。** month=40、dom=1、連珠潮旗且船在配置的灣內區域時，守牆邀請只出一次。離開不建戰鬥；接受建立唯一 pendingBattle，場景在吉大港而船不傳送，shipOverhead=false。接受後仍是不可瞄準的 presence；玩家必須確認 `engagePresence` 才切 active，隊列末端只插一次、不扣AP、不搶當前回合，目標切為擊殺或捕捉。拍二拒絕同指令，AI auto不迎戰。捕捉仍驗原潮脊部位條件；runtime先鎖、營運回寫再驗唯一gate及事件，跨sortie與重送不得重複入庫或領賞。wallOutcome與城市快照只記錄，不寫城市歸屬。commands.ts 額外保留 lordEncounter，避免指令重建時丟失；formation.ts 保留遠端目標供單機預覽驗證。

`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-wc status --short` 原文：

```text
 M content/base/world/factions-ops/bay-seventh-post.json
 M content/base/world/factions-ops/dhaka-weavers.json
 M content/base/world/factions-ops/residual-league.json
 M schemas/content.schema.json
 M src/ai/score.ts
 M src/core/types-def.ts
 M src/core/types-state.ts
 M src/ops/content/check.ts
 M src/ops/content/opseffect.ts
 M src/ops/content/start.ts
 M src/ops/sim/invariants.ts
 M src/ops/sortie/run.ts
 M src/ops/sortie/scenario.ts
 M src/ops/sortie/validate.ts
 M src/ops/state/types.ts
 M src/ops/text/render.ts
 M src/ops/time/commands.ts
 M src/ops/time/tick.ts
 M src/ops/world/blight.ts
 M src/ops/world/patches.ts
 M src/ops/world/pressure.ts
 M src/rules/flow.ts
 M src/rules/state.ts
 M src/rules/turn.ts
 M src/sim/run.ts
 M src/sim/save.ts
 M src/ui-adapter/ops/dom/tabs.ts
 M src/ui-adapter/ops/vm/formation.ts
 M src/ui-adapter/ops/vm/snapshot.ts
 M src/ui-adapter/ops/vm/types.ts
 M src/ui-adapter/vm/controller.ts
 M src/ui-adapter/vm/text.ts
 M src/ui-adapter/vm/types.ts
 M src/ui-adapter/vm/viewmodel.ts
 M test/fuzz/invariants.ts
 M wf/workflows/planning/specs/ops/battle-interface.md
 M wf/workflows/planning/specs/ops/content-format-ops/world.md
 M wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md
?? content/base/world/actions/wanchao-script.json
?? content/base/world/contracts/wanchao-evacuation.json
?? content/base/world/contracts/wanchao-scout.json
?? content/base/world/contracts/wanchao-watch.json
?? content/base/world/templates/wanchao.json
?? node_modules
?? src/ops/world/lords.test.ts
?? src/ops/world/lords.ts
```

**交領導合併：AI 特許最小 diff 原文。** 新指令使原 scoreCandidate 的最後分支不再只剩 useAbility；依16:13 orders補一行排除，不改任何既有指令分數。

```diff
diff --git a/src/ai/score.ts b/src/ai/score.ts
index 7d7e3df..68e2cba 100644
--- a/src/ai/score.ts
+++ b/src/ai/score.ts
@@ -159,6 +159,7 @@ function captureProximity(q: RulesQuery, view: BattleState, id: Id): number {
 
 export function scoreCandidate(ctx: AiCtx, agent: Agent, c: Candidate): number {
   const { q, view } = ctx, p = { ...DEFAULTS, ...ctx.params }, cmd = c.cmd;
+  if (cmd.kind === "engagePresence") return -Infinity;
   const actor = view.units[agent.unit];
   if (!actor) return -Infinity;
   const needs = want(ctx, agent.unit, cmd.kind === "useAbility" ? cmd.target?.unit : undefined);
```

## 產出

三份 spec 都有段首 `SPEC-GAP 補（2026-10-26 lead-engine-next）`。14列原文已從 tabledb 逐列讀出，對實際 world JSON 逐字斷言，14/14 通過；落點如下（相對上述worktree根）：

- 第1、2、3列：`content/base/world/actions/wanchao-script.json` → lordScript.trace.present／northward／gone。
- 第4、5列：同一 action 檔 → lordScript.routePrompts[0].text／[1].text；第14列 → lordScript.gate.text。
- 第6列：`content/base/world/contracts/wanchao-scout.json` → text。
- 第7列：`content/base/world/contracts/wanchao-evacuation.json` → text。
- 第8列：`content/base/world/contracts/wanchao-watch.json` → text。
- 第9、10、11、12、13列：`content/base/world/templates/wanchao.json` → entries.WanchaoLeagueNews／WanchaoSeleneNews／WanchaoFaithNews／WanchaoReturnersNews／WanchaoSeventhNews.text。

**固定驗收1。** 最終 `npm run check` exit0，末行 `OK 0 errors, 10 warnings`；`node src/ops/content/check.ts content/base` exit0同末行；`npm run typecheck` exit0。最終完整 `npm test` 已完成，TAP按檔案包裝計數153、149通過、4失敗，exit1；失敗恰為下面1個准許保留的戰役黃金與3個交接書明訂的沙箱CLI例外，沒有其他紅檔。每步E4→E1→E2→E3→E5都執行 npm test／check／typecheck／lords，迭代中的自家失敗均已修正；以上以收尾證據為準。

`node --test test/golden.test.ts` 最終 exit0；`test/golden/` diff為空。`test/campaigns/`、`src/ops/sim/fixtures/` diff也為空，未跑 rerecord.ts、未設 GOLDEN_UPDATE。紅掉的戰役黃金只有 `test/campaigns/campaigns.test.ts` 內 **ops-relic**（對應 `test/campaigns/ops-relic.json`／`.hash.json`）：實際斷言 `ops-relic 事件子序列缺失`；其餘 ops-war-assault／ops-merc-join／ops-betrayal／ops-leak皆綠。未改期望，交領導合併AI線後處理。

**固定驗收2。** `node --test src/ops/world/lords.test.ts` 最終 exit0；預設runner包成1個檔案測試。相同檔案另以 `--test-isolation=none`取得真實計數：**16 tests／4 suites、16 pass、0 fail**。涵蓋PLAN8.2七組：王跡／候選與RNG；北行／分支／去重／當日級別；裁示後E4空格選取與pressure；presence合法性／光環／戰果；守牆／迎戰／唯一捕捉；UI／戰鬥save-replay及營運北行、gate待選、接受、capture鎖的命令存讀重播；真實checkWorld正反例與fuzz termination排除。營運多階段存讀用短曆測試包保留真實地圖與指令鏈，驗證重播不呼叫戰鬥runner；正式28日曆日期另由41月sim驗。

**固定驗收3。** 14/14文案原文逐字存在於上述落點；三契約text進板上詳情與scenario.brief，守牆原文作邀請與brief。未改base-drafts原句。

**固定驗收4：41蝕月sim。** `npm run sim:campaign -- --months 41 --policy idle --continue-after-end --seed 1` exit0，day1148、末行OK。CLI本身不列王跡內部簿記，因此另以 /tmp 的 Node registerHooks 在記憶體中加唯讀輸出，同一條CLI與參數再跑一次，exit0；未改任何repo檔、流程或RNG。

seed1 北行日 **490**（clock.month17、dom15），四站visited=[0,1,2,3]，終站(132,96)。王跡三態為 **day0 present「吉大港外灘：在。」→ day490 northward「第七哨外海：往北。」→ day519 gone「北岸哨所：不見了。」**。北岸event patch **2格**：(129,99)、(130,99)，sinceDay490、rift空、永久shallow；九格中其餘格已被既有蝕區占用，所以按裁示裁出可用連通塊，沒有覆寫。northBranch=**passed**。五則news同day490各一次。**第40蝕月day1120邀請有出現**，idle選離開，記WanchaoGateDeclined，未建戰鬥；最終gate=closed、captured=false、battleFinished=false。idle玩家day132已債務終局，continue-after-end只證明世界時鐘與事件可達，不冒稱玩家活到那夜。

收尾 `npm run fuzz -- --runs 60 --mode mix --seed 1` exit0：60/60（ai20、random20、scenario20），硬違規0、違規分組0。`npm run test:dom` exit0：25個檔案包裝測試全綠。原樣 `npm run build` 因 node_modules/.vite-temp 指向沙箱外唯讀目標而 EROFS（已即時發BLOCKED）；改用內建 `npm run build -- --configLoader native` **exit0**，1935 modules、built in257ms，未安裝依賴、未動符號連結或repo設定；已再發PROGRESS說明解除。

**固定驗收5。** 本REPORT存在，首行為「已讀清單」。

主要輸出紀錄在 `/tmp/cx-en-wc/`：final-check.log、final-world-check.log、final-typecheck.log、final-lords.log、final-lords-direct.log、final-golden.log、e5-test.log、campaign-differences.log、final-sim.log、final-sim-evidence.log、final-fuzz.log、final-dom.log、final-build.log、final-build-native.log、environment-failures.log。REPORT已摘錄必要數字與實際失敗，不用舊輸出充作最終證據。

## 沒做到或證據不足的

依交接排除，未跑e2e或wf-lint；索引與code-map留領導。舊黃金未更新，ops-relic的缺失子序列尚需領導整合後歸因／重錄，不將它改成新期望來過關。

已知沙箱CLI例外三檔：`src/mcp/cli.test.ts`（socket server未就緒）、`src/mcp/e2e.test.ts`（2案例server提前退出0）、`src/ops/content/worldgen.test.ts`（實際spawnSync node EPERM）。直接隔離關閉重跑也得到同類失敗；依交接明示不算本線阻塞，列給領導沙箱外重跑。完整npm的數字是檔案包裝計數，沒有冒稱153個真實單元案例。

SPEC-GAP清單：四情報來源／付費商品與讖語尚未實作；UI蝕月month+1與資料零起算的全面統一留後續；event patch是有限的無核心淺蝕模型、不推導其出身與野群；城市最終存亡／第四核心規則未設計，wallOutcome只記錄；MCP專用迎戰tool未新增；presence光環採全場範圍而非新距離系統。三spec明列本次最小契約及以上邊界。

## 需要決定的事

本線無需使用者新決定。領導接手45檔寫集與這份REPORT後，統一產索引／code-map、處理准許保留的ops-relic黃金，並在沙箱外補跑已知CLI限制；預設build可採native設定載入。AI特許diff標於上節，與另一條AI線合併時保留該行即可。

## 以後交接書該點名的工具

繼續點名 tabledb、inbox_poll／inbox_mail、正式41月sim、lords測試、check／typecheck與fuzz。另點名 `node --test --test-isolation=none` 取得實際案例數與子測試錯誤；Vite在唯讀node_modules符號連結環境用 `npm run build -- --configLoader native`。CLI不列腳本內部旗時，可用臨時Node載入hook加唯讀證據輸出，勿為取證改repo CLI。交接書也應點名commands.ts的Sortie欄位承接與formation.ts的預覽驗證，避免遠端援防資料在跨層重建時遺失。

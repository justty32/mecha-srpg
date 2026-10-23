# lead-impl-ai REPORT：AI 層（spec 切線 6）

**STATUS：DONE**。`src/ai/` 已交付：7 個主檔、`rules-query.ts`、6 個 policy，另有 `adapters/rules-adapter.ts`。AI 測試 42 項全過（stub 40、真規則整合 2）；全專案 `npm test` 164 過、0 敗；`npm run typecheck` exit 0。規則線的 REPORT 在本線收線前已落檔，adapter 與整合測試已一併寫好，**不必再整合**。

## 做了什麼

- 照 model-quirks 的「先凍結介面」：我先寫 `src/ai/rules-query.ts`（`RulesQuery`、`ExecCommand`）、`src/ai/policy.ts`（`AiCtx`、`Policy`、登記表、前段加權抽 `selectCandidate`）與 [contract.md](contract.md)（所有模組的簽名＋stub 行為），commit `56ed367` 後才派工。
- 並行派兩條 codex 工人（gpt-6-astra，`codex exec -s workspace-write`），各約 7 分鐘交 DONE：`cx-ai-knowledge-score` 寫 knowledge／danger／score＋stub＋22 測試；`cx-ai-policies` 寫 strategy／agent／index／六個 policy＋18 測試。後者的交接書寫死「等前者 REPORT 落檔才跑測試」。我在沙箱外重跑測試與型別檢查，結果與工人自報一致；commit `91704c2`。
- 收工人時修了一個行為 bug：policies 線在 REPORT 的待決事項提到，`sentinel` 不在守點時，回防移動走通用評分會因為「遠離敵人」拿到負分，結果永遠不回守點。我裁定回防移動改給正分 `1/(1+到守點距離)`，並在既有的 sentinel 測試加一段「離開守點會走回去」。把修正拿掉，這個測試會變紅。
- 規則線全部 commit 後，我寫了 `adapters/rules-adapter.ts`（`createRulesQuery(db)`、`createRulesExec(db)`）和 `test/ai/integration.test.ts`：content/base 的兩台 hound-mk2（各帶駕駛員）加一隻 tidewolf，在真規則下跑 AI 對 AI，並斷言雙方都出過手、被規則拒絕的指令為 0、同 seed 兩次指令序列相同。整合時抓到 tactical 在本輪已 Wait 過之後仍會提 `wait`，真規則因此拒絕 `wait-used` 12 次。已修，把修正拿掉 `rejected === 0` 會變紅。commit `6be0a7e`。
- ROSTER 代登記三格並標為已收線；團隊 `ai` 已 close；工人信件已 ack。

驗收逐條證據：

1. `npm test`：exit 0，`# tests 164`、`# pass 164`、`# fail 0`。只跑 `'src/ai/**/*.test.ts' 'test/ai/**/*.test.ts'` 得 `# tests 42`、`# pass 42`（≥ 30）。
2. `src/ai/` 有 7 個主檔（knowledge、strategy、agent、policy、score、danger、index）、`rules-query.ts`、`policies/` 下 6 檔、`adapters/rules-adapter.ts`。`grep -rn "from '../rules\|from \"../rules" src/ai` 只命中 `adapters/rules-adapter.ts:13`，命中的是 `../rules-query.ts`；`src/rules/` 與 `src/content/` 的 import 只出現在 adapter 的第 10–12 行。tactical 原本 import `../rules-query.ts`，會讓這條字面 grep 誤中，已改成經 `AiCtx["q"]` 取型別。
3. `test/ai/smoke.test.ts`：stub 規則下兩陣營各 3 單位跑 10 輪不拋錯；同 seed 兩次的 `JSON.stringify(commands)` 相同；混用六種 policy 跑 10 輪也不拋錯。真規則下的決定性另由 `integration.test.ts` 驗。
4. constraints 中 `spec_section` 含 `ai` 的 5 列都 grep 得到：`DN-M-02`（smoke）、`DN-M-12`（smoke／policies／integration）、`DC-C09` 與 `DC-T08`（knowledge）、`PW-07`（agent.test 與 agent.ts／policy.ts 註解）。
5. `wf-lint.sh --strict .`：`TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`。`package.json` 沒有 dependencies，只有既有的 devDependencies typescript，本線沒動 package.json。
6. 本線 commit：`56ed367`、`91704c2`、`6be0a7e`，以及收線 commit（REPORT＋ROSTER），都以 `ai: ` 開頭。`ps aux | grep '[c]odex exec'` 為 0，沒有 `cx-` tmux session，團隊 ai 已 close（移到 `wf/inbox/done/2026-10-24/teams/ai`），ROSTER 三格都標已收線。

## 產出

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/`：`rules-query.ts`、`policy.ts`、`knowledge.ts`、`danger.ts`、`score.ts`、`strategy.ts`、`agent.ts`、`index.ts`、`policies/{tactical,berserk,swarm,sentinel,flee,scripted}.ts`、`adapters/rules-adapter.ts`，共 16 檔。
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/`：`stub-rules.ts`、`fixtures/abilities.json`，加上 9 支測試（stub-rules 4、knowledge 6、danger 4、score 8、policies 8、agent 4、strategy 3、smoke 3、integration 2），合計約 60 KB。
- 契約 [contract.md](contract.md)、子線交接書 [cx-ai-knowledge-score.md](cx-ai-knowledge-score.md)、[cx-ai-policies.md](cx-ai-policies.md)，以及兩份工人 REPORT。新檔共 33 個，在 40 的 gate 內。
- sim 的接法：`createFactionAI({slot, seed})` → 每輪 `startRound(ai, q, s)` → 輪到該陣營單位時 `runUnitTurn(ai, q, s, currentActor(s), exec)` → 其他陣營 `observeEvents`。`q`、`exec` 由 `createRulesQuery(db)`、`createRulesExec(db)` 產生，完整範例見 `test/ai/integration.test.ts`。

## RulesQuery 介面與規則線的對照

| RulesQuery | 規則層（`src/rules/index.ts`） | adapter 做的轉換 |
|---|---|---|
| `inBounds` `distance` `unitAt` `isActive` `hostile` `commanderOf` `unitTags` `partDefs` `layerDefs` `abilitiesOf` `checkAbility` `hitChance` `previewCommand` | 同名函式 | 第一參數由 `s` 包成 `{db, s}`；`isActive` 先確認單位存在 |
| `reachable` | `reachable` | 規則版**含起點**（成本 0），adapter 去掉起點 |
| `pathTo` | 無 | 沿 `reachable` 成本表用 `stepCost` 回溯；路徑不含起點，可直接給 `moveAlong` |
| `los` | `command.ts` 私有的 `los` | 照抄同一段 Bresenham（SPEC-GAP：規則沒有匯出） |
| `perception` | `roleAttr(ctx, {unit, person: 指令權者}, "perception")` | 沒有指令權者時只用機體值 |
| `unitGrade` | `frameView(ctx, id).grade` | — |
| `abilityDef` | `db.require("ability", id)` | — |
| `abilityRange` `evalNum` | core `evalNum`＋`evalCtxFor` | self 主體含指令權者 |
| `ExecCommand` | `tryCommand` | — |

## SPEC-GAP

1. **AI 用獨立 RNG 串流**：`createRng(seed, 101)`，不用 `s.rng`。spec 寫的是 ctx.rng，但如果 AI 抽 `s.rng`，按指令重播時規則的亂數序列會對不上。
2. 知識模型：可見敵人的**最外層 hp 視為看得到**，其餘層在偵察前估成滿 HP（ai.md 寫「內層只知公開欄」）。`maskedState` 會刪掉不可見的敵人，並同步刪 `rt.unitStatus`。
3. aiprofile 的 `params` 是 `Record<string, number>`，不是 NumExpr。所以 `want` 的公式寫在 `score.ts`，資料只給係數，預設值放在各檔的 `DEFAULTS`。
4. base 的 `aiprofile/pack-hunter` 指向 policy `"pack-hunter"`，它不在六個預設 policy 之內。`getPolicy` 遇到未登記的 id 會退回 `tactical`。
5. 意圖宣告（telegraph／`precommit`）沒做：介面留了，agent 不呼叫（PW-07）。AI 也不能自己寫 `IntentDeclared` 事件，得由規則或 sim 提供管道。
6. `Strategy.deploy` 回傳現位置，部署交給 sim／情境決定。
7. `dangerMap` 對 lastSeen 中已看不到的單位，給半徑 2 內每格常數 1 的危險（它的能力未知）。
8. `targetValue` 的凍結簽名沒有 params，獨立呼叫時用預設 focusBonus（評分內部則讀 params）。
9. stub 為了在 `structuredClone` 後還能查定義，把自己的定義存在 BattleState 的額外欄位 `stub` 上（只在測試裡）。
10. AI 測試全放 `test/ai/`，沒有照 conventions 放在被測檔同目錄，因為測試都依賴 stub。
11. agent：wait／retreat／eject 成功後就結束本回合，不再補送 end。

## 沒做到或證據不足的

- 整合測試用的情境刻意簡單（2 台機甲＋1 隻怪獸、6 輪），**沒有做數值平衡**，也沒有驗 AI 打得好不好。實測 hound 拿 30mm 打 tidewolf 時，十分之一規則讓預估傷害只剩 2.4，攻擊分數（0.018）低於 Wait（0.02），所以 AI 會選擇等待。這在規則上是對的，但手感要靠之後的平衡調整。
- 每個能力候選要跑 3–4 次 `previewCommand`（每次都 structuredClone 整個狀態）。小地圖沒問題（整合測試約 0.5 秒），大地圖或單位很多時的 CPU 成本**沒有量過**。可以調的旋鈕是 `params.maxMoves` 和 preview 次數。

## 需要決定的事

1. **怪獸不會行動**（規則線的事）：沒有座位人物的怪獸單位在 `makeUnit` 後 `controlMode` 是 `"none"`，`beginTurn` 會自動 endTurn。所以 tidewolf 從頭到尾不動，AI 也沒有機會替它下指令。判準：整合測試裡的 `wolf2` 至少下過一次指令才算修好。建議由 rules-people 定「無人怪獸＝本能控制」的 controlMode。
2. **content/base 單獨跑不了戰鬥**：rules 需要的 13 個常數（`fatigueInitiativeK` 等）目前只在 `test/scenarios/pack/rules/constants.json`，base 的 `constants.json` 只有 6 個，只載入 base 時 `startBattle` 會丟「缺少常數」。整合測試因此照 golden 的做法同時載入測試包。這些常數應該回到 base（內容包線或頂層決定）。
3. `aiprofile/pack-hunter` 要改指向六個 policy 之一，還是另寫一個 `pack-hunter` policy？
4. tactical 的評分係數（`waitScore 0.02`、`dangerK 0.05`、`reposition 0.3` 等）是佔位值，平衡時要調，判準見上一段的 2.4 傷害例子。

## gpt-6-astra 癖好

- 交接書寫明「沙箱內用 `--test-isolation=none`、最終計數由領導重算」之後，兩條線都**沒有**像 foundation 那次一樣回 BLOCKED，而是直接給出正確的計數。這條對策有效，沿用。
- 寫死的測試條數（22／18）兩條線都剛好照數。自報的匯出清單、測試數、型別檢查結果與我重算一致。
- 「等別線」寫成前景 `sleep 60` 迴圈加 30 分鐘上限後，policies 線照做，沒有自己去寫 stub 或改別線的檔。對別線的疑點也只寫進 REPORT（sentinel 回防評分、berserk 受規則合法性限制），沒有越界修改。
- 遇到契約公式會產生壞行為的地方（sentinel），它選擇照契約寫、把問題列進待決事項，而不是自己改公式。正確，但要靠領導讀 REPORT 才抓得到。以後契約裡的評分公式要附「預期行為」測試。

以後交接書該點名的工具：測試驗收指令一律寫 `node --test --test-isolation=none …`；平行線之間有依賴時，寫死「等對方 REPORT 落檔」的前景輪詢與逾時。

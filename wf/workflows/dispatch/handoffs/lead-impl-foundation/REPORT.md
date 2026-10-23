# lead-impl-foundation REPORT — TS 地基（spec 切線 1＋2）

**STATUS：DONE**。`npm test` 38 pass／0 fail、`npm run check` 零錯誤載入 base 內容包；不裝任何套件，node 24 原生跑 `.ts`。

## 做了什麼

- 前置條件（`legacy/` 存在且 `src/mecha_srpg` 不在）在開工時已成立，未等待。
- 領導親自凍結契約後才派工（model-quirks 的「先凍結介面」）：`package.json`／`tsconfig.json`／`.nvmrc` 與 `src/core/{ids,types-def,types-state,events}.ts` 由我寫，commit `56117db`。
- 派兩條 codex 工人（gpt-6-astra，`codex exec -s workspace-write`）並行：`cx-core`（rng／numexpr／eventlog＋三支測試，commit `03369be`）、`cx-content`（loader／registry／schema／contentdb、手寫 schema、34 個 base 資料檔＋測試，commit `7d2bb92`，因其沙箱 `.git` 唯讀由我代 commit）。原建議三條，改兩條：型別檔由我凍結後，剩下的 core 量只夠一條線。
- 兩條線都回 `BLOCKED`，都是**環境**問題、不是程式錯（見下方癖好），我在沙箱外重跑證據後收下。
- 寫 `test/README.md`；ROSTER 代登記與收線；團隊 `foundation` 已 close；信件已 ack 歸檔。

驗收逐條證據：

1. `npm test`（tap reporter）exit 0：`# tests 38`、`# pass 38`、`# fail 0`（core 28＋content 10）。
2. `npm run check` exit 0：`frame: 2`、`bodyplan: 2`、`component: 1`、`ability: 4`、`effect: 7`、`person: 2 (human 1, soul 1)`、`soultree: 1`、`terrain: 1`、`species: 1`、`aiprofile: 1`、`curve: 1`、`registries: 7/7`、`rules: 4/4`、`OK 0 errors, 0 warnings`。另做負測：把 tidewolf 的能力改成不存在的 id、地形 moveCost 改成未登記鍵，loader 報 2 筆 ERROR 並 exit 1。
3. `src/core/` 七檔、`src/content/` 四檔都在；`package.json` 沒有 dependencies／devDependencies 鍵；無 `node_modules`。
4. `src/core/rng.test.ts` 寫死 `createRng(42,54)` 前 6 個輸出（＝pcg-c-basic 參考值 `0xa15c02b7…0xcbed606e`，我另用 Python 獨立重算過）與 `createRng(12345)` 前 5 個；`eventlog.test.ts` 證明 seed 7 兩次 `hashLog` 相同、seed 7／8 不同。
5. `wf-lint.sh --strict .`：`TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`（`biglist_links=1` 在 `legacy/docs/README.md`，非本線檔）。
6. 見最後一筆 `foundation: ` commit；無殘留 codex 行程、無 `cx-` tmux session。

## 產出

- 骨架：`/home/lorkhan/repo/game_dev/mecha-srpg/package.json`（scripts `test`／`check`，無依賴）、`tsconfig.json`（strict、NodeNext、noEmit、allowImportingTsExtensions、erasableSyntaxOnly）、`.nvmrc`。
- 核心：`/home/lorkhan/repo/game_dev/mecha-srpg/src/core/` 七檔＋三支測試。
- 內容層：`/home/lorkhan/repo/game_dev/mecha-srpg/src/content/` 四檔＋`content.test.ts`；`schemas/content.schema.json`（**手寫**一份，`$defs` 每 kind 一個定義；沒有產生腳本，`scripts/` 未建）；`content/base/`（pack.json、7 登記檔、4 規則表、22 筆內容，17 KB）。五個 content-format 範例與 spec 逐欄比對全等。
- `test/README.md`、兩份子線交接書與工人 REPORT（`cx-core/REPORT.md`、`cx-content/REPORT.md`）。
- 新檔共 60 個（產品 55＋本目錄 5），剛好在件數 gate 內；`content/base/` 17 KB。

## 匯出介面一覽（給切線 3–9 用）

```
core/ids.ts        Id PackId ContentKind CONTENT_KINDS KIND_FOLDERS ParsedId parseId qualifyId kindOf isContentKind CellKey cellKey
core/types-def.ts  全部 Def 型別（FrameDef BodyPlanDef PartDef LayerDef PoolDecl PoolBand ComponentDef AbilityDef EffectDef
                   PersonDef SoulTreeDef CurveDef TerrainDef MapDef FactionDef SpeciesDef MonsterDef ScenarioDef LootDef AiProfileDef
                   PackDef RegistryFile RulesConstants DamageModifierRow MoraleEventRow InjuryRow …）、NumExpr Cond HookAction EffectRef
                   Contribution、封閉列舉 Grade ControlMode MoraleStage SeatRole AttrRole、DefByKind、常數 GRADES HOOK_VERBS
                   REGISTRY_KINDS RULE_FILES
core/types-state.ts RngState PoolState EffectInstance ContributionInstance PersonState MechState PartState LayerState
                   MapState FactionState FactionKnowledge BattleState Command SaveFile
core/events.ts     EVENT_TYPES EventType GameEvent(=Event) EventPayload EventLog
core/rng.ts        createRng(seed,stream=54) nextU32 nextFloat nextInt rollInt d100(0..99) chance pickWeighted cloneRng（就地推進）
core/numexpr.ts    evalNum evalCond EvalCtx{ref,hasTag?} objectRefs collectRefs checkNumExpr checkCond REF_ROOTS NumExprError
core/eventlog.ts   createLog appendEvent canonicalJson fnv1a64 hashLog eventsOfType typeSequence
content/registry.ts Registries emptyRegistries mergeRegistry hasEntry attrByRole
content/schema.ts  validateAgainst(name,value) SchemaError SchemaName CONTENT_SCHEMA
content/contentdb.ts ContentDB{packs registries rules get require all ids counts} RulesTables createContentDB（深凍結）
content/loader.ts  readPackDir loadPacks(純) loadContentDirs LoadResult LoadIssue PackFiles；CLI＝npm run check
```

DB 一律以完整 id（`base:frame/hound-mk2`）為鍵，Def 內參照也已正規化成完整 id；`get`／`require` 可省 pack 前綴。

## SPEC-GAP 清單（皆已選最小解，程式碼註解標 `SPEC-GAP`）

1. **schema 不是由 TS 型別產生**：spec 說「由 TS 型別產生」，但不裝 tsc 就沒有型別解析器；改為手寫一份 `schemas/content.schema.json`，`types-def.ts` 與它須人工同步。
2. `PersonState` 加了 `id` 欄（spec 沒有，但 `BattleState.persons` 以它為鍵）。
3. `FactionKnowledge.visible` 從 `Set` 改為排序過的 `Id[]`，讓 BattleState 可 JSON 化。
4. `Cond.tag` 對誰比對 spec 未定：交給 `EvalCtx.hasTag`，由 rules 決定。
5. `SlotDecl`、`SeatDecl`、`ResonanceReq`、`Dir`、soultree／curve／loot／aiprofile 檔形狀、`morale-events`／`injuries` 列形狀 spec 未展開，自定最小形狀（見 `types-def.ts`）。
6. `ComponentDef.poolMods`／`attrMods` spec 列為必填，但 content-format 範例省略；改為選填以讓範例原樣通過。
7. `pack.json` 的 `registries` 欄意義未定：設為選填，登記檔固定讀 `registries/{kind}.json`。
8. 多 pack 規則表合併未定：constants 後到覆寫同鍵，其餘三表依載入順序附加（cx-content 定）。
9. RNG：`rollInt` 端點限安全整數；`pickWeighted` 拒絕負值與非有限權重；canonicalJson 拒絕循環引用（cx-core 定）。
10. 事件型別主名用 `GameEvent`（避免與 DOM 全域 `Event` 混淆），另匯出別名 `Event`。
11. loader 的讀檔部分（`readPackDir`）只能在 node 跑；瀏覽器端要另寫 fetch 版再餵 `loadPacks`（純函式）。

## 沒做到或證據不足的

- 型別只做文件用途：沒有 tsc，`tsconfig.json` 的 strict 檢查**沒有被任何指令執行過**，型別錯誤要等編輯器或日後決定裝 tsc 才看得到。
- `wf/workflows/testing.md` 的快速驗證列仍寫「確切 glob 與 npm script 待實作線補」、`common/code-map.md` 的 core 列未更新——兩檔不在本線領地，未動。

## 需要決定的事

1. 要不要讓 `testing.md`／`code-map.md` 改指 `npm test`、`npm run check`（頂層或下一條線動手）。
2. 要不要裝 tsc 當開發工具（只做型別檢查，`noEmit`）——不裝的話 SPEC-GAP 1 的手工同步風險一直存在。判準：rules 線開工後若出現第 1 個「型別與 schema 不一致」的 bug 就裝。
3. 上方 SPEC-GAP 1–11 逐條可推翻；推翻後改 `types-def.ts`／`schemas/content.schema.json` 對應處。

## gpt-6-astra 這次觀察到的癖好

- **沙箱內 `node --test` 只報「每檔一項」**：codex `workspace-write` 沙箱下子行程隔離的子測試計數回不來（沙箱內 `# pass 3`，沙箱外同指令 `# pass 28`）。astra 沒拿 `--test-isolation=none` 的結果冒充，而是如實發 `BLOCKED` 附兩份輸出——正確但會多一輪。對策：交接書的測試驗收直接寫 `--test-isolation=none`，或寫明「計數由領導在沙箱外重跑」。
- **同一沙箱設定、`.git` 一條可寫一條唯讀**：cx-core 能 commit，晚一分鐘起的 cx-content 碰 `.git/index.lock` 得到 Read-only file system。原因未查明；對策：交接書把 commit 寫成「能 commit 就 commit，不能就列檔名交給領導」，不要列為工人驗收。
- 兩條線約 6 與 11 分鐘交件，寫死的測試條數（8／12／8／10）都剛好照數，自報數字與我重算一致。

以後交接書該點名的工具：測試驗收指令加 `--test-isolation=none`（沙箱內）。

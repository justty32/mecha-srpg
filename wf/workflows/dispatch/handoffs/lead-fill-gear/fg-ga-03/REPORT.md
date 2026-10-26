cx-fg-ga-03 — **FAILED：固定驗收第 3 條未通過**。14 個內容檔已齊；第 1、2（使用者覆蓋版）、4 條通過。未擴修引擎，未 commit。

**已讀清單**（20 個點名來源均親讀；JSON 經資料工具分片查讀）

- [AGENTS.md](../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../common/user.md)
- [wf/workflows/content/README.md](../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../content/batch.md)
- [wf/workflows/content/mechs.md](../../../../content/mechs.md)
- [wf/workflows/content/abilities-effects.md](../../../../content/abilities-effects.md)
- [wf/workflows/content/numeric-bands.md](../../../../content/numeric-bands.md)
- [wf/workflows/content/numeric-bands.json](../../../../content/numeric-bands.json)
- [wf/workflows/content/engine-facts.json](../../../../content/engine-facts.json)
- [wf/workflows/content/world-pillars.md](../../../../content/world-pillars.md)
- [wf/workflows/content/polish.md](../../../../content/polish.md)
- [content/lore/README.md](../../../../../../content/lore/README.md)
- [content/lore/style.md](../../../../../../content/lore/style.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md](../gear-common.md)
- [wf/workflows/dispatch/handoffs/fill-rulings.md](../../fill-rulings.md)
- [wf/workflows/planning/specs/core/data-model-mech.md](../../../../planning/specs/core/data-model-mech.md)
- [wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md](../../../../planning/specs/core/data-model-mech/equipment-and-state.md)
- [wf/workflows/planning/specs/core/data-model-abilities-effects.md](../../../../planning/specs/core/data-model-abilities-effects.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/plan.md](../plan-ga/plan.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/fg-ga-03.specs.json](../plan-ga/fg-ga-03.specs.json)

另已讀工作樹的 AGENTS 開場規則、WORKFLOWS、SESSION-LOG、WAIT_USER、common/conventions、code-map、data-files、dev-env、testing，以及同槽部件與同形能力／效果範本；開場 inbox/new 無信。因檔案白名單限制，進度僅寫本報告，未改全域 SESSION-LOG。

**四條驗收證據**

1. **PASS**：10 部件＋2 能力＋2 效果，恰為 manifest 的 14 檔。部件均 origin=mechanical；能力／效果沿規格合法欄位，未加 origin 假欄、grade、廠商或市場欄。逐檔除 etymology 外與規格完全相同，來源 id 正確、全庫每個 id 恰一處。既有 registry、黃金、營運 fixture 及其他追蹤檔均未變。最終 content_gate exit 0、approved=14、violations=[]，只忽略領導提供的 node_modules 連結。內容最大 948 bytes，均≤16 KB。見 [閘門](content-gate.json)、[逐檔核對及雜湊](content-audit.json)、[工作樹範圍](scope.log)。

   開場已有 14 個草稿、報告草稿與領導提供的未追蹤批次 manifest。manifest 不屬 14 個內容檔，已原樣移存 `/tmp/cx-fg-ga-03/fg-ga-03.manifest.json`，報告區另存 [manifest 原始輸入](manifest-input.json)，沒有改其內容。最終 gate 使用這份實際 base 為 `a1463faeb0712226b1e537e48844e6727829f83f` 的 manifest；帳本與索引仍交領導處理。

2. **PASS（使用者覆蓋版）**：`npm run check` exit 0，末行 `OK 0 errors, 10 warnings`；警告均在既有內容，無本線 fa- 警告。`npm run typecheck` exit 0。只跑相關單檔 `node --test src/rules/effects.test.ts`，exit 0、fail 0。見 [check](check.log)、[typecheck](typecheck.log)、[相關單檔測試](related-test.log)。本次未跑 npm test、test:e2e、sim／fuzz 全套；全套由領導收件後跑。報告區開場已有的 test.log 是先前殘留，本次不採為驗收證據。

3. **FAILED**：scratch `runBattle` seeds 1–5 均零例外、各 5 回合正常以 outcome 結束。每場兩個不同感測部件，合計 10 件全部裝入 `frame/bulwark-ii`／`bodyplan/mx-biped-c` 的 head／sensor 槽；每台保留核心、person/ren-kasai 與左右原武器，敵方為 monster/reaper-c。只縮小 scratch 場景與 AI 候選數節省資源，未改正式 frame、scenario 或引擎。

   AI 使用 `fa-dazzle-mark` 2 次（seed 2，其中 1 次掛晃眼），`fa-lend-bearing` 2 次（seed 4，兩次均掛同準，其中一次目標為距離 3 的隊友）；AI 缺口為空。人工 tryCommand 的同燈引路有效 5 次；晃燈遮眼對有駕駛敵機、無人物怪獸各有效 1 次（seed 2），其餘 8 次失手如實保留，未計入有效使用。實測準頭／觀測分別 +8/+3、−8/−3，己方 AP 9→6；時鐘按目標 ownerTurns 的 1／2 次 tick 到期撤回貢獻。敵友錯邊被 bad-target 拒絕，牆後被 no-los 拒絕且不扣 AP。沒有傷害包，成功以實際效果與屬性變化計數。

   **失敗原因**：8 件被動件共 20 項 attrMods／poolMods 實裝差值全為 0；含寒燈的 heat.regen 預期 −2、charge.regen 預期 −2，實際均 0，遮燈 charge.regen 預期 −3，實際 0。來源追查顯示此 base 的 makeUnit 僅套用 MonsterDef.attrMods，未消費 ComponentDef.attrMods；poolDecls 也未消費 ComponentDef.poolMods。觀察值保留 createBattle 後及 startBattle 後兩階段，並非漏跑生命週期。鐵眉頭部插 armor 25 HP 正常，其他部位層序未受影響；能力授予與兩個效果正常。不能透過 scratch 補加貢獻冒充通過，也不能改規格或引擎繞過此條。

   原始結果見 [smoke](smoke.json)、[安裝前後完整狀態](installation-observations.json)、[人工指令與事件](manual-commands.json)、[執行摘要](smoke-run.log)、[引擎讀取位置](engine-evidence.log)。五場逐事件與命令紀錄為 [seed 1](runBattle-seed-1.json)、[seed 2](runBattle-seed-2.json)、[seed 3](runBattle-seed-3.json)、[seed 4](runBattle-seed-4.json)、[seed 5](runBattle-seed-5.json)。[runner](smoke-runner.mjs) 與 [規格輸入](specs-runtime.json) 相鄰保存；可在此 worktree 根執行報告區 runner 復現。runner 輸出的語義 verdict=FAILED，20 項失敗不是例外。

4. **PASS**：本報告列全 20 個點名來源與四條證據；[review.json](review.json) 14 列、白話最長 27 字（≤60）；[naming.json](naming.json) 14 列保留指定英名、意涵與「提案」標記。所有原始 smoke、安裝、人工指令與 runner 輸入已交齊；REPORT≤12 KB。內容只潤飾 etymology，同準的到期措辭明確為「到隊友下一次行動時」，未改時鐘。

**數值帶外理由與待決**

數值全照計畫暫填，無自行帶外加值；非武器 size=1 沿感測槽容量。perception ±3 是規格刻意較小的觀測修正；兩招為 packets=[] 的純支援，傷害／AP 不適用。提案名與掛點保持舊廠諸家、稽古學會、塞勒涅，不另立人物、事件或年表定案。

領導需決定如何承接第 3 條引擎缺口，確認 ComponentDef.attrMods／poolMods 落地後再按相同 20 項實測驗收；本線不補引擎。勢力件聲望門檻及上架仍依計畫留給引擎／市場線。無需使用者提供資料；未寄跨軌訊息，未啟動 GUI／MCP、未安裝依賴。

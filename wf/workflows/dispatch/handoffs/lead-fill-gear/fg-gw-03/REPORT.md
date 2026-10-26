# 已讀清單

以下為 manifest.report.mustRead 原路徑，根目錄 `/home/lorkhan/repo/game_dev/mecha-srpg`。本人親讀；數值帶用 tabledb 查部件／能力列，engine-facts 分段讀全21列，新件表只讀本批12列，grade-coverage與needs用tabledb讀相關資料。其餘同名worktree副本已比對；common/user.md另親讀主repo最新版資源限制。

```text
AGENTS.md
wf/WORKFLOWS.md
wf/workflows/common/user.md
wf/workflows/common/data-files.md
wf/workflows/content/README.md
wf/workflows/content/batch.md
wf/workflows/content/mechs.md
wf/workflows/content/abilities-effects.md
wf/workflows/content/numeric-bands.md
wf/workflows/content/numeric-bands.json
wf/workflows/content/engine-facts.json
wf/workflows/content/world-pillars.md
wf/workflows/content/polish.md
content/lore/README.md
content/lore/style.md
wf/workflows/dispatch/handoffs/fill-rulings.md
wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md
wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/REPORT.md
wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md
wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md
wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md
wf/workflows/planning/design-notes/world/magnates.md
wf/workflows/planning/specs/core/data-model-mech.md
wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md
wf/workflows/planning/specs/core/data-model-abilities-effects.md
wf/workflows/planning/specs/ops/data-model-economy-research.md
wf/workflows/planning/specs/world/resistance.md
wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md
wf/workflows/content/acceptance-playtest.md
wf/workflows/common/conventions.md
wf/workflows/common/code-map.md
wf/workflows/dev-env.md
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/plan.md
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/new-items.json
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/grade-coverage.json
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/needs.json
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/cx-fg-gw-03.md
```

另親讀 worktree 的 AGENTS.md、上述範本及效果；補充讀檔如下（含查閱的實作相關段）：

```text
AGENTS.md（worktree亦親讀）
wf/SESSION-LOG.md
wf/WAIT_USER.md
wf/workflows/testing.md
wf/workflows/content/templates.json
wf/workflows/content/world-pillars/world.md
wf/workflows/content/world-pillars/mechs.md
wf/workflows/content/world-pillars/bio-battle.md
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/read-list.json
wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/hooks.json
content/base/abilities/ix-line-shot.json
content/base/abilities/mx-bind-shot.json
content/base/bodyplans/mx-selene-s.json
content/base/components/autocannon-30.json
content/base/components/mx-binding-harpoon.json
content/base/effects/mx-netted.json
content/base/effects/mx-suppressed.json
content/base/effects/weapon-jammed.json
src/content/loader.ts
src/rules/control.ts
src/rules/flow.ts
src/rules/state.ts
src/sim/run.ts
test/sim/loadout.test.ts
```

## 做了什麼／產出

**FAILED：12檔產出完成，S級指定煙霧配置無法建立。** 本線 cx-fg-gw-03，base `a1463faeb0712226b1e537e48844e6727829f83f`。新增6個component與6個activated ability，不新增效果。所有JSON逐鍵與new-items本批欄位規格完全一致，中文名、nameEn、提案標記與代價原樣保留。未開子代理，未commit。

扣足矢／扣足：四矢、1–3格、零傷；停步索／拋索留步：不耗矢、1–2格、4傷、燼8；千鈞拘束槍／沉矢鎮步：四矢、2–6格、零傷、燼12；凡壓陣砲／凡矢壓陣：八矢、2–6格、18傷、冷卻2；抱礁拘束鉗／合鉗抱礁：近身24破甲傷、燼18與流光20、冷卻2；留岸拘束柱／立柱留岸：1–2格零傷、燼24與流光40、冷卻3、三次上限。

D/C/B/A/S部件hp、size、mass沿定稿同級數值；零傷與4傷拘束低於傷害帶的理由為控制／捕捉用途，抱礁24傷為A基準30×0.8，凡壓陣18傷落B帶內。引用的縛網與壓制皆為mech scope。精粹D/C/B/A/S明填能力；凡鐵能力與本體皆conventional-arms、不填essence。

## 固定四條驗收

1. **PASS（使用者資源覆蓋後的檢查組）**：`npm run check` exit 0，core為 `OK 0 errors, 32 warnings`，ops為 `OK 0 errors, 10 warnings`；警告皆指向未修改的既有檔（捕獲層、數值帶、soft池超載帶及步兵空配裝），無本線新檔警告；`npm run typecheck` exit 0；`node --test --test-concurrency=1 test/sim/loadout.test.ts` exit 0；初次隔離輸出只列1個檔案通過，為確認實際子案例，對同一檔以 `node --test --test-isolation=none --test-concurrency=1 --test-reporter=tap test/sim/loadout.test.ts` 執行，2/2通過、0失敗。單檔檢查整組取代配裝與槽相容性。原始輸出見 [check.log](smoke-log/check.log)、[typecheck.log](smoke-log/typecheck.log)、[loadout-test.log](smoke-log/loadout-test.log)、[loadout-test-tap.log](smoke-log/loadout-test-tap.log)。使用者最新指示優先於交接書測試表與驗收編號；未跑npm test、test:e2e、sim/fuzz全套，完整套件由領導收件後跑。
2. **PASS**：固定12檔皆存在、檔名=id尾段、與定稿逐鍵一致；每檔小於8KB。`git diff --name-status` 無既有檔變動；status只有12個指定新JSON與開工前即存在的node_modules。黃金、戰役與fixtures未改。證據見 [scope.log](smoke-log/scope.log)、[initial-status.log](smoke-log/initial-status.log)。
3. **FAILED**：6配置×seed1–5的30筆紀錄齊，25場成功、5筆S級配置建立錯誤。前5配置均有AI AbilityUsed；留岸拘束柱0次，不能聲稱已覆蓋。未加seed、未換對手或跑額外平衡試打。
4. **PASS**：REPORT已讀清單與本次證據齊；[review.json](review.json)是wf-table/1、12列、每列白話≤60字；[smoke.json](smoke.json)是wf-table/1、30列。每場原始setup／commands／events或exception存smoke-log；[smoke-stdout.log](smoke-log/smoke-stdout.log)為本次runner原始輸出，[delivery-audit.log](smoke-log/delivery-audit.log)為表格與覆蓋摘要。runner在 `/tmp/cx-fg-gw-03/smoke.ts`，載入本worktree content/base。

## 沒做到或證據不足

前5配置按grade-coverage同級frame、right-weapon唯一外掛、person/chen-xiaohai以pilot入座；其他能力沿frame既有。凡鐵對同級堅盾-IV城垣，其他依序對mite-d／reaper-c／bulwark-b／mirror-a；S亦按指定mirror-a。雙方既有focus-fire tactical，各自怪獸policy也為既有tactical。部署為rift-edge-60的平地(3,3)，對手在同列距離3／2／6／6／1／2。上限20輪、maxSteps2000，未改地圖、物種捕捉條件、能力、frame或骨架。

成功場的全輪數與結局逐場留在smoke.json；以下為六條能力的合計AI使用次數與例外數：

```text
ankle-pin: uses=20, exceptions=0, rounds=[10, 10, 7, 10, 6], outcomes={'eliminate': 5}
stayline: uses=59, exceptions=0, rounds=[8, 8, 8, 8, 8], outcomes={'eliminate': 5}
weight-harpoon: uses=19, exceptions=0, rounds=[8, 9, 8, 8, 8], outcomes={'eliminate': 5}
press-gun: uses=10, exceptions=0, rounds=[5, 3, 3, 6, 3], outcomes={'eliminate': 5}
reef-jaw: uses=20, exceptions=0, rounds=[8, 8, 8, 8, 8], outcomes={'eliminate': 5}
shore-stay: uses=0, exceptions=5, rounds=[0, 0, 0, 0, 0], outcomes={'setup-error': 5}
```

S級 `frame/selene-eclipse-moonless` 使用 `bodyplan/mx-selene-s`，只有 `soul` 與 `soul-2`，兩座accepts皆只有soul，沒有pilot。`scenarioToSetup`於src/sim/run.ts選pilot座位時拋出 `缺少 pilot 座位：player-0`。五個seed均在此中斷，未進戰鬥，輪數0、能力使用0，原始堆疊留在shore-stay-1.json至shore-stay-5.json。這是指定配置與既有資料不相容，不是工具故障，故回FAILED。未把陳小海放進魂座，也未修改既有frame/bodyplan來假造通過。

本次只驗使用性；勝敗與輪數不作平衡證據。沒有預先打斷部位，沒有宣稱捕捉成功或高品級必捕。S武器目前僅結構與引用驗證通過，可用性證據不足。

## 需要決定

領導需修訂S級煙霧配置：指定可載pilot的替代載體（現有機械S僅無月），或明確允許用適合的既有機魂與其可自主駕駛條件。修訂後只重跑留岸拘束柱seed1–5；本線範圍禁止改既有骨架與frame，故未自行處理。

市場與配裝僅沿 [既有hooks](../plan-gw/hooks.json)／[needs](../plan-gw/needs.json) 提供整合建議：扣足矢與凡壓陣砲為公開件；停步索C20、千鈞B35、抱礁A55、留岸S80仍待部件聲望鎖，未接前暫緩上架。拘束矢ammo-fw-bind待補給；S材料來源與配方待gl/gm整合，不以低階料聚煉成S。未改市場、model、frame、loot、索引、manifest或其他工作流狀態檔。新名稱與來歷仍屬提案，照既定人審處理。

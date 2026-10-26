# 已讀清單

- `AGENTS.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/REPORT.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/specs/core/data-model-mech.md`
- `wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md`
- `wf/workflows/planning/specs/core/data-model-abilities-effects.md`
- `wf/workflows/planning/specs/ops/data-model-economy-research.md`
- `wf/workflows/planning/specs/world/resistance.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/dev-env.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/new-items.json`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/grade-coverage.json`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/needs.json`
- `wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gw/cx-fg-gw-02.md`

以上原路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根，另親讀本 worktree 的 AGENTS.md。大表用 tabledb 條件查詢：new-items 僅 fg-gw-02 的12列、數值帶讀能力與部件列；engine-facts、grade-coverage、needs 分列讀取。另查 read-list 導航與 hooks 的本批六列。

另親讀範本、引用效果與補充規則：

- `content/base/components/autocannon-30.json`
- `content/base/abilities/ix-line-shot.json`
- `content/base/effects/weapon-jammed.json`
- `content/base/effects/mx-marked.json`
- `wf/workflows/testing.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/bio-battle.md`

也親讀本批12個內容檔、五個指定載體 frame、`content/base/bodyplans/mx-selene-s.json` 的座位、`src/sim/run.ts` 與 `src/content/content.test.ts`。

## 做了什麼與產出

cx-fg-gw-02：**FAILED（固定第3條未過）**。本次時間 2026-10-26T17:35:11.912770+08:00；base `a1463faeb0712226b1e537e48844e6727829f83f`。未啟用子代理。

相對 base 交付6個 component、6個 ability，固定12檔，0個新 effect。開場已有這12個未追蹤草稿及部分舊紀錄；本次逐檔親讀並確認與 new-items 欄位規格完全一致，原樣保留。凡點吼、汀光矢槍、凡疊矢砲、照隙長槍、月衡長弓、巡天長弩皆成對交付，name／nameEn／提案標記、數值與引用全保留。

只有本次 `smoke-log/current-*` 用作驗收證據；舊的 check.log、typecheck.log、test.log、runner.log 與未帶 current 前綴的場次不列入本次結果。本次未執行 npm test、test:e2e、sim／fuzz 全套。沒有修改既有檔、黃金、索引、市場或 frame；未 commit、未寄信。

## 固定四條驗收

依使用者覆蓋將檢查命令列為第2條，內容範圍列為第1條；總數維持四條。

1. **PASS：12檔與範圍。** 與 manifest.files、new-items 本批12列逐鍵相同，檔名等於 id 尾段；最大檔案1162 bytes。`git diff --name-status` 空，status 僅指定12個未追蹤內容檔與開場即有的 node_modules 連結。新 id／名稱對既有非 fw 檔 rg 無命中，禁用詞無命中。證據：[範圍／雜湊](smoke-log/current-evidence.json)、[diff](smoke-log/current-git-diff-name-status.log)、[status](smoke-log/current-git-status.log)、[衝突](smoke-log/current-collisions.log)、[風格](smoke-log/current-style.log)。
2. **PASS：限定檢查。** `npm run check` exit 0，核心 `OK 0 errors, 32 warnings`、營運 `OK 0 errors, 10 warnings`；警告均指既有檔，無本批警告。`npm run typecheck` exit 0。`node --test src/content/content.test.ts` exit 0、fail 0，涵蓋新內容的載入、參照、schema 與池驗證。證據：[check](smoke-log/current-check.log)、[typecheck](smoke-log/current-typecheck.log)、[相關單檔測試](smoke-log/current-content-single.log)。完整 suite 由領導收件後執行，沒有宣稱本次全套通過。
3. **FAILED：6配置×5 seeds。** 完整留下30筆嘗試：25場進入 runBattle 並正常結束、0執行期例外；巡天長弩5筆在 scenarioToSetup 失敗，總例外5。前五條新能力均有 AI AbilityUsed；巡天落矢為0次，**未覆蓋**。每場上限20輪、maxSteps 2000，僅載入本 worktree content/base，記憶體 DynamicScenario，雙方 tactical；我方整組 components 僅 right-weapon，沿 frame 內建能力。部署 (3,3) 對 (3+距離,3)，距離依序3／4／4／5／6／8，均在能力射程與 plain 可走格內。凡鐵對同級基準機，其他對 reaper-c／bulwark-b／mirror-a／mirror-a。證據：[30列](smoke.json)、[本次輸出](smoke-log/current-runner.log)、`smoke-log/current-fw-*-seed-*.json`（含 scenario、sim、commands、events、hash、結局或例外）。runner：`/tmp/cx-fg-gw-02/smoke.ts`。這些結果只驗可用性。
4. **PASS：交付紀錄。** 本 REPORT 開頭逐行列 mustRead；[review.json](review.json) 經 tabledb 寫入與核對12列、白話最長40字（≤60），欄位正確；[smoke.json](smoke.json) 經 tabledb 寫入30列，原始紀錄齊。報告低於20KB，單一內容檔低於8KB。

## 煙霧觀察與沒做到的部分

- `fw-pin-shot`：各 seed 新招使用 [3, 9, 7, 7, 1]，總27次；輪數[3, 8, 8, 8, 4]；結局{'enemy:eliminate': 5}；例外0。
- `fw-shoal-light`：各 seed 新招使用 [5, 5, 5, 5, 5]，總25次；輪數[8, 8, 8, 8, 8]；結局{'enemy:eliminate': 5}；例外0。
- `fw-paired-shot`：各 seed 新招使用 [4, 4, 2, 3, 2]，總15次；輪數[5, 3, 3, 3, 3]；結局{'enemy:eliminate': 5}；例外0。
- `fw-seam-rifle`：各 seed 新招使用 [3, 3, 2, 3, 3]，總14次；輪數[9, 8, 8, 8, 9]；結局{'enemy:eliminate': 5}；例外0。
- `fw-moon-balance`：各 seed 新招使用 [3, 3, 3, 2, 3]，總14次；輪數[8, 8, 8, 8, 8]；結局{'enemy:eliminate': 4, 'player:eliminate': 1}；例外0。
- `fw-sky-crossbow`：各 seed 新招使用 [0, 0, 0, 0, 0]，總0次；輪數[0, 0, 0, 0, 0]；結局{'exception': 5}；例外5。

巡天長弩的指定載體 `frame/selene-eclipse-moonless` 指向 `bodyplan/mx-selene-s`；該骨架座位只有 soul／soul-2，accepts 都只有 soul。交接書同時指定 pilot／person/chen-xiaohai，因此 seeds 1–5 都得到 `Error: 缺少 pilot 座位：player-0`，在 `src/sim/run.ts:93` 拋出，尚未進入 runBattle。這是既有載體與固定煙霧規格不相容，非工具或環境故障，故回 FAILED。沒有把人放進機魂座、換低級 frame、修改骨架或用舊結果替代。

數值沿審定暫值：凡點吼10為D基準8×1.25；凡疊矢24為C上緣20×1.2，均為凡鐵對人取捨。照隙20為B基準25×0.8並帶既有2回合標記。汀光16、月衡32、巡天40與部件hp／size／mass沿同級帶；月衡傷害/AP=8略高於A建議7.5，保留流光30、燼20與冷卻2的既定代價，不另調值。精粹C／B／A／S明填能力，凡鐵能力與部件皆標 conventional-arms。partAim只影響部位選取，不保證命中。

## 需要領導決定

解除第3條失敗需修訂煙霧規格：允許S載體改用既有機魂（不再固定陳小海），或另行授權修正載體／骨架的 pilot 相容性；本線沒有該授權。規格修正後只需重跑巡天長弩5個seed，保留其餘配置證據。

市場與配裝僅引用既有 [hooks](../plan-gw/hooks.json)／[needs](../plan-gw/needs.json)：凡點吼建議吉大港225、凡疊矢戰爭軍械庫495，沿 forge-composite 與 ammo-30；汀光建議新加坡660、crystal-refining。照隙舊陣列1800／shell-translation，月衡新加坡4800、巡天新加坡15000／crystal-refining；三件門檻依序稽古B35、塞勒涅A55／S80，部件聲望鎖未接前暫緩上架。S料來源、配方、ammo補給與既有frame換裝均交gm／gl／領導後續整合。GW-01凡鐵級差口徑衝突沿needs待決，不改引擎，也不宣稱已實作。

# cx-tb-aim 回報

STATUS：DONE（依 lead-tune-battle order 2 收尾；通用瞄準完成，實際火力門檻未達，HP 調整交領導）。

## 已讀清單

親讀主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md` 與指定 worktree 的 `AGENTS.md`。交接書點名規矩皆已讀：`wf/workflows/feature-dev/README.md`、`testing.md`＋`testing-checks.json`、`common/conventions.md`、`common/code-map.md`＋`code-map.json`、`common/user.md`、`content/README.md`＋`numeric-bands.json`；JSON 用 `wf/tools/tabledb.py` 查相關列，沒有整份倒入 context。

另讀 `wf/WORKFLOWS.md`、`wf/WAIT_USER.md`、`wf/workflows/dev-env.md`、`common/data-files.md`、`inbox/README.md`＋`PROTOCOL.md`；規格 `planning/specs/core/rules-attack-resolution.md`、`ai.md`；前線 `dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md`、`lead-ai-objective/REPORT.md`。已讀兩則 orders：補已讀清單；保留通用瞄準與 burst-30、no-retreat 對照後收尾、不再找開局瞄準武器。

## 做了什麼

`partAim.allowed` 的 unit／part 能力，對敵方增加未毀損且含 structural 層的 core 候選，不依賴 `targetPref.parts`；保留不瞄準與既有偏好候選。規則 `isDead` 要所有 core 全毀，普通 structural 部位不代表死亡，因此沒有自行發明「唯一 structural 必死」規則；多 core 的瞄準算其中一核的破壞進度，立即擊殺仍依真預覽。

估值只讀知識快照，瞄核心時以該部位剩餘各層 HP 作傷害比例分母，係數 `partAimProgress=1` 放 score DEFAULTS，可由 aiprofile params 覆寫；未偵察內層沿用公開最大 HP。命中率仍走含 `partAim.penalty` 的 `q.hitChance`，再乘進分數，保留原有任務價值與擊殺加分。沒有硬性強迫瞄準。

內容只改 `ability/burst-30` 的 partAim：allowed=true、penalty=10。既有三能力 penalty=10／12／15；numeric-bands 沒有獨立 partAim 帶，採既有區間下緣。不改傷害、成本、ai hints；沒有其他新增瞄準能力。

新增恰3條測試全過；舊碼跑新測試2 fail、移除 allowed 守門的記憶體 mutation 令第3條 fail，兩種反證聯集覆蓋全部3條。第2條同時證明核心快破選瞄、權重覆寫生效、過高懲罰改選不瞄；使用尚未即死的24HP避免舊 killed bonus 掩蓋缺口。

固定5條驗收已完成量測與交付，沒有新增驗收項。`node --test --test-isolation=none test/ai/*.test.ts test/sim/*.test.ts test/golden.test.ts`：153過0敗；內容修改前 AI 步驟91過0敗。check 0 errors、41 warnings，輸出與開工逐字相同（沒有新增 band-*）；typecheck exit0。skirmish seed1–5 全 pass:true、Wait比例全0。6個黃金情境 hash 全符，未改黃金檔、未設 GOLDEN_UPDATE。

## 產出（改動檔清單）

程式碼根目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/wt-aim/`。

- `src/ai/policies/tactical.ts`
- `src/ai/score.ts`
- `content/base/abilities/burst-30.json`
- `test/ai/part-aim.test.ts`（新增）

本 REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-aim/REPORT.md`。4個程式／內容／測試檔，含報告共5檔；patch＋新測試9227 bytes，加本報告仍小於60KB，未觸15檔 gate。未 commit；開工已有的 untracked node_modules 與領導腳本不計本線產出。

證據根目錄 `/tmp/cx-tb-aim/`：`bench-{before,after}.log`、`tally-{before,after}.log`、`ops-{before,after}.log`、`check-{before,ai,final}.log`、`typecheck-{ai,final}.log`、`tests-ai-step.log`、`suites-final.log`、`skirmish.log`、`part-aim-{red-before,red-allowed,green}.log`。測試 mutation 腳本 `mutate-allowed.mjs` 只在載入時替換，不改工作樹。

## 期望命中

沿前線算法，核心30＋35＋40＝105 HP，8部位等 exposure；開局原兩台燕鷗的最強對怪獸單發都是 arc-pulse=21。每台每輪一次成功命中、20輪預算40；不納入第三台 hound。

版本一（原算法）：N＝105÷(21×1/8)＝40，≤40。它忽略命中率、AP、熱量、其他部位破壞後機率重分配。

版本二（實際選招／瞄核心比例）：重放同一凍結26場，取原兩台燕鷗前20輪打巢母的 Hit/Miss，共171次嘗試、40次命中；指定核心0次（嘗試及命中比例均0）。成功命中為38次 arc-pulse（21）＋2次 mx-head-vulcan（對kaiju為0.8）。每次命中的核心期望傷害＝(38×21＋2×0.8)÷40×1/8＝2.49875；N＝105÷2.49875＝42.0210，>40。一般公式為 HP÷[Σ命中筆數×有效傷害×(指定核心?1:1/8)／總命中]。

若嚴格只把實際瞄準比例 r 代入原算法、仍假設每發都是最強21，則105÷[21×(r＋(1−r)/8)]，r=0得到40；這沒有反映實際弱招混用，不能當作實戰保證。另以每次 Hit/Miss 的真 `chance` 加權傷害與命中數，得到41.6906次成功命中、162.3568次出手；與上面的樣本比例估計分開列，不把出手當成命中。

私有 `expectation.ts`／`expectation.json`／`expectation.log` 可重現。普通凍結重放7勝、錨被殺0、己方撤離57台；它與指定 bench 的7勝／45次巢母命中一致。

## 前後數字表

| 量測 | 開工 | 完成 |
|---|---:|---:|
| 凍結 anchored 場數／勝場 | 26／7 | 26／7 |
| 凍結對巢母命中 nmHits | 48 | 45 |
| greedy seed1–5 anchored 場數／勝場 | 26／7 | 18／6 |
| greedy anchored 錨被殺／nmHits | 0／48 | 0／23 |
| bench-ops ms／步 | 5.26 | 2.46 |

效能2.46≤5.26×1.5＝7.89；兩次都是95指令、hash bddd8a0898c9301b。開工有並行量測，耗時受主機負載影響。tally 出戰數會因前面戰果改變，不把6/18與7/26視為同一批戰場；固定凍結才是同場比較。

## 沒做到或證據不足的

實際選招模型仍>40、營運沒有殺死錨。anchored 6勝為既有勝利條件下的勝場，不等於核心擊殺。凡鐵十分律使 burst-30 只有2.4/發，滿彈每機4次，即使全中核心也只有9.6；它不比電弧的21/8＝2.625隨機核心貢獻高，還要承受10點命中懲罰。沒有為了增加瞄準比例硬調權重。

no-retreat 對照用同一凍結26場，僅記憶體設 setup.noRetreat=true（雙方都禁撤）：0勝、錨被殺1、撤離0；前20輪對巢母命中234，原兩台核心瞄準仍0，實際混合期望41.4627次成功命中。對照同時關掉敵方撤離與 repelled 勝利路徑，不能將0勝單歸因玩家不撤。可證延長交戰增加火力接觸且偶能殺錨，但不足以穩定擊殺；正常組的低擊殺不能只歸咎撤退。證據 expectation-no-retreat.log/json。

指定 `npm run content:probe -- ability/burst-30 --n 20` 已執行，但工具找不到載體：它只查 frame defaultLoadout／innate 與 monster，開局自訂配裝存於 campaign-start。未改探針或內容；`probe-startup.ts` 在記憶體把原第一台開局配裝套給燕鷗 defaultLoadout，再用同一 probe API 每對手20場：對 bulwark 9勝11敗，burst使用61次；對 reaper 9勝11敗，burst使用0次；共40場0例外。`probe-startup.log/json` 保留證據。探針列 burst 傷害24>C上限20、射程6>C上限5，均是既有值；partAim不在工具數值帶檢查項，不能聲稱探針驗過penalty。

## 需要決定的事

依order2由領導調巢母HP。保持本次實際選招混合固定，成功命中樣本模型要求核心HP≤40×2.49875＝99.95；chance加權模型要求≤100.7422。建議整數總HP99（例如30／35／34），兩種模型分別39.6198／39.3083次成功命中。這只是供下一輪選值，HP變動會改變選招與戰果，不保證戰役勝率。未碰 monster／world／intent／retreat 等禁區。

code map 的新測試導航與commit由領導整合，本線不改契約外文件。

以後交接書該點名的工具：`probe-startup.ts`（營運自訂配裝載體的記憶體探針）、`expectation.ts`（凍結場指令瞄準比例／實際武器十分律／no-retreat對照）、Node `registerHooks`（候選守門反證）。

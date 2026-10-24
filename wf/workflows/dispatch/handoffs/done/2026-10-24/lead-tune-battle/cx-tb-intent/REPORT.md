# cx-tb-intent — 完成回報

STATUS：**DONE**。固定五條驗收完成；未 commit、未重產黃金、未開子代理。玩家方採「player＋盟軍 ally」口徑，領導 order 2 已明確確認；rift 原始 winner 是 player 0、ally 4、enemy 1。

**已讀清單（親讀，含 2026-10-24 補充 order）**：主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；工作樹 `wf/WORKFLOWS.md`、`wf/WAIT_USER.md`；`wf/workflows/feature-dev/README.md`、`testing.md`、`testing-checks.json`（tabledb 查相關驗證列）、`common/conventions.md`、`common/code-map.md`、`common/code-map.json`（tabledb 查 ai 列）、`common/user.md`、`common/data-files.md`、`dev-env.md`、`inbox/README.md`、`inbox/PROTOCOL.md`；`planning/design-notes/mechanics.md`（含末尾全部裁示）；`dispatch/handoffs/lead-gaps-battle/REPORT.md` 與 `cx-gb-intent/REPORT.md`。上述省略前綴者均在 `wf/workflows/` 下。交接書與本線 orders 亦已讀。

## 做了什麼

在指定 wt-intent 工作樹實測基準、追原因並調校。基準 rift seed 1：第 5 輪 ally／enemy／player 都被 impossible 觸發，ratio 分別 1.458／1.563／1.458、loss 全為 0、damage 全為 0。原因是停滯達 5 輪就估為無限輪，而玩家只取第一個 killTarget；實際第 9 輪 enemy 勝。不是假說中的第 4 輪。skirmish seed 1 第 4 輪玩家 ratio 1.180、loss 0.043、needed 56，被 impossible 觸發，第 5 輪結束。breach-defense seed 1 第 4 輪 ally／enemy、quarry-duel 第 4 輪 enemy／第 6 輪 player 也皆因 impossible；追蹤在 `/tmp/cx-tb-intent/trace-{base,short}.log`。

改為保留該 slot 全部非 lose objective，全部不可達才算 impossible。survive／hold 依自身剩餘輪數與守區進度估算，不拿敵軍 HP 代替；守勢不預留逃跑路程。killTarget／capture 的 HP 僅計指定 unit／units；eliminate 尊重 slots。目標未出現在 view 時不以隱藏資訊斷言不可達。

每輪比較仍可見的同一敵軍 HP，避免新生／進出視野抵消或偽造傷害，再以 EMA 平滑。時間不足僅在戰力比不佔優時觸發；延後整隊放棄至第 8 輪、降低戰力比撤退門檻、提高損失門檻。個體撤退、指揮者死亡潰散及戰術打分沿既有邏輯。

### 參數表

鍵名亦為 aiprofile `params` 覆寫鍵；全為數字，預設均在 intent.ts 的 DEFAULTS。

| 鍵名 | 舊→新 | 意義 |
|---|---|---|
| intentGiveUpRatio | 0.55→0.45 | 戰力比低於此值可撤 |
| intentGiveUpLoss | 0.6→0.7 | 己方損失達此值可撤 |
| intentMinRound | 4→8 | 整隊放棄最早輪數 |
| intentImpossibleRatio | 無→1 | impossible 還需戰力比≤此值 |
| intentDamageAlpha | 無→0.4 | EMA 新一輪傷害權重 |
| intentStallRounds | 5→5 | 無傷害估算時的停滯輪數 |
| intentTravelPerRound | 4→4 | 路程換算輪數 |
| intentExitReserve | 1→1 | 撤離預留輪數 |

其餘 DEFAULTS 原值保留：individualFleeHp .25、pilotFleeHp .2、commanderScatter .6、humanCommanderScatter .3、rotateHp .45、rotatePool .15、rotateRounds 2、rotateCooldown 3、retreatForceRatio .5、retreatMinRound 3、retreatDamage .35，鍵名均可照既有 params 覆寫；未修改任何 aiprofile 檔。

### 前後數字表

| 指標 | 開工基準 | 最終 |
|---|---|---|
| sweep 場數 | 120（24×5） | 120（24×5） |
| timeout 平手 | 3／120＝2.50% | 10／120＝8.33% |
| 平均輪數 | 7.95 | 12.72 |
| player／enemy／ally／third 勝場 | 46／55／8／8 | 61／20／27／2 |
| 最大單一 winner 占非平手 | enemy 47.01% | player 55.45% |
| rift 玩家陣營勝 | 0／5 | 4／5（ally） |
| rift 原始 winner | enemy 5 | ally 4、enemy 1 |
| anchored 勝場 | 7／26 | 9／26 |
| anchored nmHits | 48 | 128 |
| anchored 平均輪數 | 5.46 | 9.88 |

固定五條驗收：

1. 最終 [sweep-final.jsonl](sweep-final.jsonl) 四數字達標，沒有 error／stop；本線 source 自該 sweep 起未再修改。勝方分布以原始 winner slot 分開計，沿指定 sum.py；rift 以玩家同盟計，與前線口徑相同。
2. 新增恰 3 條測試全過：多目標守勢不因打不完撤、killTarget 僅算目標 HP、params 覆寫新門檻與平滑。使用 Node registerHooks 分別退化成只看第一目標、算全部敵 HP、忽略 params，以及忽略平滑權重，四次皆 AssertionError／exit 1，證明三條新測試能變紅（`/tmp/cx-tb-intent/red-*.log`）。
3. `node --test --test-isolation=none test/golden.test.ts test/ai/*.test.ts test/sim/*.test.ts`：**153 pass、0 fail、exit 0**。六個黃金 combat-conduct／combat-layers／combat-tenth／people-berserk／people-capture／people-eject 全不變。未設 GOLDEN_UPDATE。
4. skirmish seed 1–5 全 `pass:true`、Wait 比例全 0；`npm run typecheck` exit 0。每步 typecheck／AI suite 亦通過。
5. 本 REPORT 已包含四段、參數表、前後數字表及已讀清單；終局以指定 inbox_mail --up 回報。

## 產出（改動檔清單）

程式碼工作樹根：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/wt-intent`。

- `src/ai/intent.ts`：多目標、目標 HP、平滑與門檻。
- `test/ai/intent.test.ts`：新增 3 條測試。

程式／測試 diff **2 檔、10,688 bytes**，未達 12 檔／60 KB gate。工作樹開工已有 untracked node_modules 與 handoff 工具，未算成本線改動。正式產物在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-intent/`：本 REPORT 與 sweep-final.jsonl。

原始證據在 `/tmp/cx-tb-intent/`：sweep-base.jsonl、sweep-v1.jsonl、bench-base.log、bench-final.log、suites-final.log、typecheck-final.log、wait-final.log、trace-base.log、trace-short.log、trace-v1.log、mutation.mjs、red-objectives.log、red-target.log、red-params.log、red-smoothing.log。

## 沒做到或證據不足的

仍有 10 場 timeout：badlands seed 5；crater-three-way seed 2／3／4；delta-four-way seed 1／3／4／5；dream-bed-burn seed 2；nest-core-assault seed 4。總比例已達標，依固定驗收不加碼追修，未宣稱逐一定位原因。

rift seed 1 仍敗：第 8 輪 ally ratio .945 因 impossible 撤；第 13 輪 player ratio .362、loss .432、impossible=false，因戰力門檻撤，第 20 輪 enemy 勝（trace-v1.log）。其餘四局皆 ally 擊退勝；原始 winner=player 仍為 0／5。

評估仍是啟發式：目標 HP 使用全體可見敵軍的平滑傷害估輸出，不保證火力能全數投向目標；只比較連續可見且 active 的單位，死亡／離開視野不當作傷害樣本；不精算捕獲機率與路徑。尚未合入 cx-tb-aim 的核心瞄準改動，合併後數字須由領導判讀。

## 需要決定的事

無新增決策。數字已達交接書門檻，保留改動交領導整合；主 repo 的程式、score.ts、policies、情境、黃金檔及 spec 均未改動。

以後交接書該點名的工具：Node `registerHooks`（不改原始碼的追蹤與 mutation 反證）；psweep 搭配 `TMPDIR=/tmp/cx-tb-intent`（讓臨時輸出留在授權目錄）。

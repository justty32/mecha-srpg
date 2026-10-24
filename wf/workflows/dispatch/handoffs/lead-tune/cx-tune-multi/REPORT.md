# cx-tune-multi — 多方混戰 timeout 降至 crater 1/10、delta 0/10

STATUS：**DONE**。固定五條驗收全部達標。只改 4 個程式／測試檔，未改情境、params、rounds、rules 或黃金；未 commit、未上網、未開子代理。2026-10-24 16:39 上線，16:48 回報，未觸 90 分鐘 gate。

## 做了什麼

親讀主 repo 的 AGENTS.md、WORKFLOWS.md、SESSION-LOG.md、WAIT_USER.md、feature-dev/README.md、testing.md 與 testing-checks.json 相關列、common/conventions.md、code-map.md 與 code-map.json 的 ai 列、common/user.md、data-files.md、dev-env.md、inbox/README.md 與 PROTOCOL.md；另讀 mechanics.md 指定裁示、lead-tune-battle、cx-tune-intent 與 cx-tune-anchor 的 REPORT、指定程式與兩個情境。表格以 tabledb 查詢。已依每步義務輪詢 orders，並送上線與根因 PROGRESS。

根因有兩個。第一，berserk 把所有可見單位當作移動目標：第三方三台部署時緊鄰，最近者都是友軍，而它們的攻擊能力全部 `friendly=no`，因此不能攻擊，也沒有更接近友軍的合法移動；敵人離開視野後會永久停在部署區。第二，agent 以 `base === "berserk"` 判斷撤退豁免，連設定檔採 berserk 的正常駕駛也無視指揮者撤退。delta 第三方已在第 14／15 輪判撤，仍攻擊至第 30 輪。

修正後，berserk 只在具備允許友傷的攻擊時追友軍；其餘沿用既有 pursuitCells 的敵方／最後所見／中央探索，候選與評分使用同一目標。原本合法範圍友傷仍保留。只有 `controlMode === "berserk"` 的真正失控才拒絕撤退／輪替；正常駕駛採狂攻設定檔仍遵循個體求生及指揮者指令。沒有新增數值或調門檻。

唯讀確認 `src/rules/objectives.ts:12` 使用 isActive；撤離者不在殲滅存活名單，61–62 行也標記 repelled。本次不是 rules 根因。

### 根因表

逐輪證據已抽到 [root-causes.json](root-causes.json)（4 列）。每列含第 21–30 輪各存活者座標／HP、各方意圖、Hit／Miss 數與撤退事件；四場 trace hash 均與正式基準相同。

| 場次 | 最後十輪 | 根因 |
|---|---|---|
| crater seed 2 | player-0 在中央；third 三台不動；0 Hit／Miss | third 追不能攻擊的友軍 |
| crater seed 3 | player-1 斷腿留場；third 三台不動；0 Hit／Miss | third 停住，無人接近殘存玩家 |
| delta seed 1 | 24 Hit／58 Miss；third 第 14 輪已判撤 | berserk 設定檔蓋過撤退 |
| delta seed 3 | 24 Hit／63 Miss；third 第 15 輪已判撤 | 同上；兩台第三方戰至終局 |

crater seed 2 敵方於第 11／12 輪撤；seed 3 敵方與 player-0 在第 11／12 輪撤，player-1 第 6 輪腿部毀損。delta seed 1 敵方第 10／11 輪撤、player-0 第 11 輪撤、third-1 第 24 輪撤；seed 3 敵方第 10／11 輪撤、third 未撤。完整座標與逐輪資訊見資料表，原始 trace 保留在 `/tmp/cx-tune-multi/trace-*.json`。

重現基準追蹤：在未套本線改動的 HEAD 45f33ab、以 worktree 為 cwd，跑 `node /tmp/cx-tune-multi/trace.mjs scenario/crater-three-way 2`（另三組為 crater seed 3、delta seed 1／3）。trace 只用 Node registerHooks 插入觀察，不改落盤程式；分析入口為同暫存目錄 `summarize-trace.py`。

### 參數表

| 覆寫鍵 | 舊→新 | 意義 |
|---|---|---|
| berserkAttack | 12→12 | tide-cultist 攻擊評分 |
| berserkDistance | 2→2 | tide-cultist 追逐評分 |
| friendlyFirePenalty | 0→0 | berserk 保留合法友傷 |

未新增 params，未改任何 aiprofile；修正的是目標選取與策略優先順序。

### 前後數字表

正式工具開工與最終各跑一次全 sweep／anchored。psweep 實際枚舉 **28 情境×5 seed＝140 場**，並非交接書的 26；前後同一集合，未手動加驗。勝方百分比分母排除平手；rift 玩家陣營含 ally。

| 指標 | 基準 | 最終 |
|---|---:|---:|
| crater timeout | 6/10 | 1/10 |
| delta timeout | 9/10 | 0/10 |
| sweep timeout | 10/140（7.14%） | 4/140（2.86%） |
| sweep 平均輪數 | 12.05 | 11.01 |
| 勝場 player／ally／enemy／third | 77／24／27／2 | 85／24／26／1 |
| 勝方比例（同序） | 59.23／18.46／20.77／1.54% | 62.50／17.65／19.12／0.74% |
| rift 玩家陣營勝 | 4/5 | 4/5 |
| anchored 勝 | 14/26 | 14/26 |

兩情境最終 seed 1–10 的勝方：crater player 7、enemy 2、draw 1（seed 4）；delta player 10。起點 crater third 2、enemy 2、draw 6；delta enemy 1、draw 9。其他情境逐一比較無新增 timeout；badlands-sweep、dream-bed-burn、nest-core-assault 前後各 1/5，其餘非目標情境皆 0。

固定五條驗收：

1. crater 1/10、delta 0/10 timeout，皆 ≤2/10。
2. 全 sweep 四數字均達標，其他情境 timeout 無增加。
3. anchored 14/26 ≥13/26；前後 nmHits 110、平均 9.23 輪。
4. 黃金＋AI 109 pass、0 fail、exit 0（AI 101＋golden 8）。六個黃金 combat-conduct／combat-layers／combat-tenth／people-berserk／people-capture／people-eject 全不變；未設 GOLDEN_UPDATE。check 0 errors、12 warnings（ops check 同為 0 errors、8 warnings），與起點相同；typecheck exit 0。
5. 本 REPORT 四段、根因表、參數表、前後數字表與正式量測齊全。

恰新增 2 條測試：近身友軍不可攻擊時仍追敵／無情報仍探索；設定檔 berserk 服從撤退而真正失控不撤。修正前兩條均 AssertionError（0 pass、2 fail、exit 1），修正後兩條通過；全 AI 亦通過。證據為 `/tmp/cx-tune-multi/red-base.log`、`green-v1.log`、`ai-v1.log`、`suites-final.log`、`check-{base,v1}.log`、`typecheck-v1.log`。

## 產出（改動檔清單）

程式工作樹：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-multi/`。

- `src/ai/agent.ts`：區別真正失控與 berserk 設定檔。
- `src/ai/policies/berserk.ts`：依攻擊友傷限制選追逐目標，無敵方情報時沿用探索。
- `test/ai/intent.test.ts`：新增撤退優先順序測試。
- `test/ai/policies.test.ts`：新增追逐／探索測試。

程式／測試 diff 4 檔、5762 bytes，未觸 10 檔／50 KB gate。開工已存在 untracked node_modules 與 handoff 工具，非本線新增。沒有新增模組或變動職責範圍，未改契約外導航文件。

正式交付目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-multi/`，包含本 REPORT、[two-final.jsonl](two-final.jsonl)、[sweep-final.jsonl](sweep-final.jsonl)、[bench-final.jsonl](bench-final.jsonl) 與根因資料表。最終來源是 `/tmp/cx-tune-multi/{two,sweep,bench}-v1.jsonl`；量測啟動後未再修改程式、測試或內容。正式基準在同暫存目錄 `two-base.jsonl`、`sweep.jsonl`、`bench-base.jsonl`，比較結果在 `comparison.json`。

## 沒做到或證據不足的

crater seed 4 仍 timeout，已在允許的 ≤2/10 範圍；未為清零加做調參。delta 這十個 seed 全由 player 勝，但全 sweep 最大勝方比例仍低於 70%。本線未更動失控的規則語意，也未將狂攻策略改為一般戰術評分；有合法友傷能力的 berserk 仍可能攻擊友方，既有測試保留此行為。

本線只驗交接書固定五條，未加驗營運、GUI、fuzz 或其他項目。這些數字不能推論遊玩手感與全年營運效果。

## 需要決定的事

無新增授權或決策需求。請領導整合這四個未提交檔案並依既定流程 commit；固定五條達標後本線停止。

以後交接書該點名的工具：Node registerHooks（唯讀逐輪／意圖追蹤）；psweep 情境數應採實際枚舉值，sweep-sum.py 的指定情境篩選需兼容 `base:` 前綴。

# cx-tune-anchor — 凍結 anchored 達到 13/26 勝

STATUS：DONE。固定五條驗收達成；只改一個內容檔，未 commit。前兩位工人的既有改動完整保留。

## 做了什麼

親讀主 repo 的 AGENTS.md、WORKFLOWS、SESSION-LOG、WAIT_USER、feature-dev、testing 與 testing-checks.json 相關列、common/conventions、code-map 與 code-map.json 的 ai 列、common/user、dev-env、data-files、inbox README 與 PROTOCOL；另讀交接書點名的四份前線 REPORT、AI 與內容檔。資料表經 wf/tools/tabledb.py 查詢。上線 PROGRESS 與每步 inbox_poll 已執行。

正式基準重跑確認 9/26 勝。以原版 battle-bench 加唯讀診斷副本，記錄每場最終核心 HP、Retreated／MoraleChanged 事件；Node registerHooks 只在診斷行程記錄 planIntent 的 round、ratio、loss、impossible，沒有改來源碼。診斷與正式基準的彙總相同。

先以獨立記憶體內容試核心 12/14/16＝42 HP：10/26 勝、nmHits 97、平均 9.12 輪，未達標。最終改為 6/7/8＝21 HP，減少的 84 HP 移到 trunk flesh，使全身總層 HP 維持 1580。弧光一發 21 點命中核心即可擊殺；普通攻擊仍須抽中核心，弧光的傷害、命中、成本與範圍皆沿用既有值。

正式原版 bench 重跑為 13/26 勝（50%，門檻是 ≥13）。新增勝場為 seed/day：4/110、4/121、5/69、5/79，皆為 killTarget；最終勝因分布為 killTarget 5、hold 2、repelled 6。nmHits 下降伴隨交戰輪數縮短，不把命中數下降解讀成戰力退步。

### 輸因表

17 場基準敗場的完整逐場表見 [loss-causes.json](loss-causes.json)。欄位含 seed/day、巢母核心剩餘 HP、nmHits、誰在第幾輪撤退、撤退時駕駛士氣、陣營判斷與最終結果。陣營原因來自實際 planIntent trace；駕駛士氣由凍結人員狀態與撤退前 MoraleChanged 還原，未將所有撤退都歸因於同一門檻。

| 基準敗場類型 | 場數 | 證據 |
|---|---:|---|
| 獸類錨、無巢母 | 3 | seed 3 三場；本次內容不影響 |
| 巢母核心未受傷 | 9 | 剩 105 HP；命中散到其他部位或未接戰 |
| 巢母核心已受傷 | 5 | 剩 63／84／87.8 HP，撤退前未擊破 |

陣營撤退主要在 R8：目標不可達且戰力比 ≤1，或損失 ≥.7／戰力比 <.45。3/310 與 5/83 沒觸發陣營撤退，離場者的駕駛均已 breaking；其餘個體提早撤退與陣營判斷分列於逐場表。

### 參數／數值表

| 欄位 | 舊值→新值 | 意義／覆寫鍵 |
|---|---|---|
| core-belly chitin.hp | 30→6 | 核心外層；內容 JSON |
| core-belly flesh.hp | 35→7 | 核心中層；內容 JSON |
| core-belly organ.hp | 40→8 | 致死結構層；內容 JSON |
| trunk flesh.hp | 280→364 | 承接 84 HP；內容 JSON |
| 核心／全身合計 | 105／1580→21／1580 | 不新增 aiprofile params |

### 前後數字表

| 指標 | 正式基準 | 最終 |
|---|---:|---:|
| bench 玩家勝 | 9/26 | 13/26 |
| bench nmHits | 113 | 75 |
| bench 平均輪數 | 8.96 | 7.69 |
| sweep timeout | 10/130＝7.69% | 9/130＝6.92% |
| sweep 平均輪數 | 12.45 | 11.95 |
| 勝場 player／ally／enemy／third | 66／27／25／2 | 72／22／25／2 |
| 勝方比例（同序） | 55.00%／22.50%／20.83%／1.67% | 59.50%／18.18%／20.66%／1.65% |
| rift-edge-nest 玩家陣營 | 4/5 | 4/5 |
| nest-core-assault 玩家陣營 | 4/5、平1 | 5/5 |

玩家陣營含 ally；勝方比例以排除平手後的決勝場為分母。原版 sweep-sum.py 已跑，其情境篩選未帶 base: 前綴，未印兩個指定情境；因此直接從同份 JSONL 補列逐 seed 證據：

| 情境 | seed 1–5 最終勝方／輪數／勝因 |
|---|---|
| nest-core-assault | player/7/killTarget；player/4/killTarget；player/5/killTarget；player/29/killTarget；ally/22/repelled |
| rift-edge-nest | enemy/20/eliminate；ally/17/repelled；player/15/killTarget；ally/17/repelled；player/11/killTarget |

`node --test --test-isolation=none test/golden.test.ts test/ai/*.test.ts`：105 pass、0 fail、exit 0（AI 97＋golden 8）。六個黃金 combat-conduct、combat-layers、combat-tenth、people-berserk、people-capture、people-eject 的 hash 全不變，未重產黃金。只改內容數值，依契約免新增 AI 測試及變紅反證。`npm run check`：0 errors、12 warnings，與基準相同；`npm run typecheck` exit 0。驗收只採交接書固定五條。

## 產出（你改動的檔清單）

唯一程式／內容工作樹：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-anchor/`。

- `content/base/monsters/nestmother-landlord.json`：上述四個 HP 數值，1 檔、diff 1032 bytes，未觸 10 檔／50 KB gate。

交付目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-anchor/`：本 REPORT、[bench-final.jsonl](bench-final.jsonl)、[sweep-final.jsonl](sweep-final.jsonl)、[loss-causes.json](loss-causes.json)。

原始證據在 `/tmp/cx-tune-anchor/`：bench-base.jsonl、sweep-base.jsonl、diagnostic-base.jsonl／err、bench-core42.jsonl、bench-v1.jsonl、suites-v1.log、check-base.log、check-v1.log、typecheck-v1.log、change.patch。正式最終 bench 與 sweep 均在四個數值落檔後啟動，期間未再修改內容；不是用試算或起點輸出代替。扣除本檔後的 git diff 與 starting.diff 完全相同，確認保留既有改動。

## 沒做到或證據不足的

仍有 13/26 場敗，且 6 勝屬擊退，不宣稱全部都殺死巢母。這是同一批凍結出戰的比較，未另跑營運路徑或推論全年派遣／經濟改善。核心現在會被完整弧光一發擊破，是本次明確的平衡取捨；全身總 HP 不變，但核心脆弱度提高。未改 AI 撤退估算、能力、規則與 ops。

## 需要決定的事

無新增決策需求；交領導整合唯一內容檔並 commit。固定五條完成後收線。

以後交接書該點名的工具：Node registerHooks（不改來源碼的撤退判斷追蹤）；sweep-sum.py 的指定情境篩選需兼容 base: 前綴，本線以原始 JSONL 補印，未改工具。

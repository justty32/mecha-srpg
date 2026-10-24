# cx-tune-anchor 第二輪 — 42 HP 核心與致死 HP 估算達成 14/26 勝

STATUS：**DONE**。固定五條驗收全過；核心 42、全身 1580 HP，nest-core-assault 平均 19.2 輪。只改 3 個程式／測試／內容檔，未 commit；前兩位工人的改動保留。

## 做了什麼

親讀主 repo AGENTS.md、WORKFLOWS、SESSION-LOG、WAIT_USER、feature-dev、testing 與 testing-checks.json、common/conventions、code-map 與 code-map.json 的 ai 列、common/user、dev-env、data-files、inbox README／PROTOCOL，以及交接書點名的四份前線 REPORT、REPORT.r1.md 與程式／內容。資料表透過 tabledb 查詢。上線 PROGRESS 與各步 inbox_poll 已執行；本報告覆寫第一輪版本，REPORT.r1.md 保留。

確認領導提出的缺口成立：isDead 要求所有 core 部位 broken，但 unreachable 原先把目標全部部位的層 HP 加總。現在 killTarget／capture 加總各 core 到最後一個尚未毀損 structural 層之前、含該層的剩餘可消耗 HP；已毀 core 不計，最後結構層之後的非必要層不計。多核心全部納入。只讀 view；看不到目標時沿用「不判不可達」，缺部位／層情報或無有效 structural 定義時退回原本全身 HP 算法。殲滅的估算維持原樣。

核心由第一輪 6／7／8 恢復為 12／14／16＝42，trunk flesh 364→343，全身仍 1580。沒有調能力、瞄準權重或任何撤退門檻；未改 rules、ops、其他內容與文字欄。

起點與最終都用交接書原版 battle-bench、psweep 正式重跑。唯讀診斷副本與 Node registerHooks 記錄陣營撤退原因，兩版診斷的彙總均與正式 bench 相符。最終 14 勝分為 killTarget 4、hold 3、repelled 7。相對第二輪起點，5/62 與 5/75 由敗轉勝，5/79 因核心增厚由勝轉敗；不宣稱所有勝場都是核心擊殺。

### 輸因表

逐場表已抽到 [loss-base-r2.json](loss-base-r2.json)（起點 13 敗）及 [loss-final-r2.json](loss-final-r2.json)（最終 12 敗）。欄位包括場次、最終核心 HP、nmHits、每台撤退輪、座位士氣、陣營判斷輪與 ratio／loss／impossible 等原始數據。士氣由凍結人員狀態與 MoraleChanged 事件還原；個體分支未單獨插樁，不把士氣或撤退時間推論冒充直接 trace。

| 最終敗場分類 | 場數 | 證據 |
|---|---:|---|
| 獸類錨，無巢母 | 3 | 3/59、3/170 不可達；3/310 個體撤退／戰損 |
| 巢母核心未傷 | 6 | 4/124、4/128、4/282、5/91、5/93、5/97；剩 42 |
| 巢母核心受傷 | 3 | 5/79、5/83、5/87；剩 21／25.6／21 |

九場巢母敗場均已觸發陣營損失≥.7，其中四場兼戰力比<.45；部分單位更早因個體條件離場，見逐場表。這些敗場沒有再因全身 1580 HP 誤算而判不可達。獸類錨的兩場仍判不可達，另有一場在陣營門檻前已敗。

### 參數／數值表

舊值是本輪開工時的第一輪版本；原先 105 HP 版本的核心為 30／35／40、trunk flesh 280。

| 欄位 | 本輪舊→新 | 意義／覆寫鍵 |
|---|---|---|
| core-belly chitin.hp | 6→12 | 核心外層，內容 JSON |
| core-belly flesh.hp | 7→14 | 核心中層，內容 JSON |
| core-belly organ.hp | 8→16 | 核心結構層，內容 JSON |
| trunk flesh.hp | 364→343 | 平移 21 HP 回核心 |
| 核心／全身合計 | 21／1580→42／1580 | 避免完整弧光一發打穿 |
| killTarget／capture HP | 全身→所有核心致死 HP | 演算法修正，無新增 params |

### 前後數字表

本輪正式起點是已被領導否決的 21 HP 版本；不是交接書歷史上的 105 HP、9/26 版本。勝方比例分母排除平手；玩家陣營含 ally。

| 指標 | 第二輪起點 | 第二輪最終 |
|---|---:|---:|
| bench 玩家勝 | 13/26 | 14/26 |
| bench nmHits | 75 | 110 |
| bench 平均輪數 | 7.69 | 9.23 |
| sweep timeout | 9/130＝6.92% | 10/130＝7.69% |
| sweep 平均輪數 | 11.95 | 12.19 |
| 勝場 player／ally／enemy／third | 72／22／25／2 | 69／24／25／2 |
| 勝方比例（同序） | 59.50／18.18／20.66／1.65% | 57.50／20／20.83／1.67% |
| rift-edge-nest 玩家陣營勝 | 4/5 | 4/5 |
| nest-core-assault 玩家陣營勝 | 5/5 | 4/5、平1 |
| nest-core-assault 平均輪數 | 13.4 | 19.2 |

原版 sweep-sum.py 已跑；它的情境篩選不含 base: 前綴，因此另從同份正式 JSONL 補列兩個情境，未修改工具。實際起點 nest-core-assault 是 7／4／5／29／22 輪，並非五場均在 4–7 輪；第二輪仍按領導硬限制驗收。

| 情境 | 最終 seed 1–5：勝方／輪數／勝因 |
|---|---|
| nest-core-assault | player/13/killTarget；player/6/killTarget；ally/25/repelled；draw/30/timeout；ally/22/repelled |
| rift-edge-nest | enemy/20/eliminate；ally/17/repelled；ally/16/repelled；ally/17/repelled；player/13/killTarget |

固定五條驗收：

1. bench 14/26≥13/26；核心 42≥42，全身 1580；nest-core-assault 平均 19.2≥8。
2. sweep timeout 7.69%<10%、平均 12.19 在 10–16、rift 玩家陣營 4/5≥3/5、最大勝方 57.5%<70%。
3. 黃金＋AI 107 pass、0 fail，exit 0（AI 99＋golden 8）。六個黃金 combat-conduct、combat-layers、combat-tenth、people-berserk、people-capture、people-eject hash 全不變；未設 GOLDEN_UPDATE。恰新增 2 條測試，修改前 2 fail（AssertionError）、修改後全過。涵蓋斬首／捕獲、結構層之後不計、多核心合計、已毀核心、只讀 view 與缺部位回退；殲滅仍全身估算。
4. npm run check 0 errors、12 warnings，與起點相同；npm run typecheck exit 0。
5. 本 REPORT 四段、輸因表、參數／數值表、前後數字表及正式量測交付齊全。沒有追加驗收項。

## 產出（你改動的檔清單）

唯一程式工作樹：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-anchor/`。

- `src/ai/intent.ts`：斬首／捕獲的致死 HP 估算。
- `test/ai/intent.test.ts`：新增上述 2 條測試。
- `content/base/monsters/nestmother-landlord.json`：核心與 trunk 四個 HP 數值。

相對本輪起點 3 檔、diff 6166 bytes，未觸 10 檔／50 KB gate。扣除本輪三檔後的 git diff 與 starting.diff 相同；三檔內既有改動保留。沒有 commit。

正式交付目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-anchor/`。包含本 REPORT、[bench-final.jsonl](bench-final.jsonl)、[sweep-final.jsonl](sweep-final.jsonl)、兩份第二輪輸因資料表。第一輪 REPORT.r1.md 與其歷史證據不作第二輪驗收依據。

原始證據 `/tmp/cx-tune-anchor/r2/`：bench-{base,v1}.jsonl、sweep-{base,v1}.jsonl、diagnostic-{base,v1}.{jsonl,err}、red-base.log、tests-v1.log、suites-v1.log、check-{base,v1}.log、typecheck-v1.log、starting.diff、change.patch。正式最終檔來自 v1，從啟動量測至交付沒有再改程式或內容。

## 沒做到或證據不足的

仍有 12/26 敗，詳見輸因表；7 勝是擊退。傷害速率仍沿用既有可見敵方全身 HP 差 EMA，並非針對核心命中機率的精確傷害模型。本輪只修正交接書指定的剩餘致死 HP 分子，沒有改成傷害模擬器。未另跑營運路徑，不能推論全年經濟或派遣改善。

## 需要決定的事

無新增決策需求；固定五條達標後停止調參，交領導整合及 commit。code map 導航同步由領導處理，本線未修改契約外文件。

以後交接書該點名的工具：Node registerHooks（唯讀撤退 trace）；sweep-sum.py 的指定情境篩選需兼容 base: 前綴，現以正式 JSONL 補印。

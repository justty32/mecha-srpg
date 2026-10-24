# cx-aio-tactics：六項候選與評分缺口已補齊，依領導修訂基準完成五條驗收

## 做了什麼

親讀 AGENTS.md、交接書指定 wf 規矩、core REPORT、AI／能力效果 spec 與相關規則；只實作固定五條驗收，未 commit、未改內容或規則、未加驗其他套件。**追擊功能保留，但依死亡不惡化門檻將 objHunt 預設降至 0，須由 profile 設正值啟用。**

line／cone 與 ball 共用格候選；friendly=yes／only 加入友方所在格並去重。範圍 heal／buff／protect 由 previewCommand 的本能力 Hit／Miss 事件取得實際受影響單位（含未命中者，因 always 也可能生效），累加友方受益、對敵方以 enemyBuffPenalty 扣分。sustained 可開啟，已在 actor.sustained 的不再提出；passive／reaction 仍不提出。

捕獲需求為 profile capture 加上「該候選目標在 friendly capture spare」的 objCapture，捕獲價值加上 locomotion 公開層 HP 已損比例×captureValue×目標價值；無目標加成且 capture=0 時維持零分。純減益／disable 讀預覽安裝的效果貢獻與控制標籤，再乘威脅／集火／目標倍率及命中率；refresh／ignore 沒有新增實例或疊層時，重複效果價值歸零。

介面限制下的實作微調：RulesQuery 無 effectDef 查詢，因此不擴充介面、不 import 規則或內容；使用 preview state 的 contribIds／contribs 讀 EffectDef 安裝的貢獻，以隔離單一效果實例的 unitTags 查詢其標籤（含人物效果）。只計本能力 hit／always 引用且施加到受影響單位的效果；命中樣本上的效果取條件平均，乘既有命中率。previewOutcome 保留原回傳形狀，新增可選觀察 callback 共用三次既有預覽。友軍範圍不用重寫規則幾何。

大目標有 objectiveTargetFactor>1 時傷害比例取 max(damage/HP, damage/200)：200 使 21 傷害至少按 10.5% 評價，避免約 1580 HP 的任務目標被分母壓低。追擊以 objHunt×距離進展對 view 中最近的友方 killTarget／孵化源加分；隱藏單位不追。最終 objHunt=0，正值機制由 profile 啟用；測試明列 objHunt=0.3，驗證正值追擊、歸零停用與不可見時不追。依設計第 6 點在 objectives.ts 的 objectiveMoveValue 加此項（範圍段括號僅寫第 4 點，與明示第 6 點有出入，採第 6 點具體要求）。

新參數（均可由 profile params 覆寫）：

| 名稱 | 預設 | 意義 |
|---|---:|---|
| enemyBuffPenalty | 1 | 敵方範圍受益扣分倍率 |
| objCapture | 2 | 捕獲任務目標的需求加成 |
| captureValue | 1 | 行動部位已損比例價值 |
| debuffControl | 0.5 | 每個控制標籤價值 |
| debuffAttr | 0.02 | 每單位負向屬性修正價值 |
| debuffMark | 0.25 | marked 標籤價值 |
| objHpScale | 200 | 任務目標傷害估值的 HP 尺度 |
| objHunt | 0 | 朝可見擊殺目標／孵化源靠近的每格價值 |

固定五條驗收：① tactics-coverage 恰 8 條，最後直接執行 8 pass；每條能變紅的證據是 registerHooks 載入開工三個 AI 快照後，同一份測試 8 fail／exit 1，原版 8 pass／exit 0。八條依序覆蓋 line、cone、友軍範圍、sustained、capture、純減益、大血量目標、可見追擊。② 沙箱內 AI／sim 116 pass／0 fail；typecheck 最終 exit 0；沙箱外依約由領導重跑。③ 依 orders 修訂，同工作樹 core AI 與本線 AI 五 hash 完全相同、十行均 pass:true。④ rift seed 1–5 winner 均非 null；bench 2.87 ≤ 67.3×1.5=100.95。⑤ 本 REPORT 四段與兩表齊備。

回歸量測（rift 死亡＝全部 UnitDied；「同工作樹我方死亡」另外用 player 的 UnitDied 比較 core 與新 AI）：

| 量測 | 開工／core 對照 | 完成 |
|---|---|---|
| anchored 勝場／15 | 0 | 0 |
| anchored nmHits | 20 | 67 |
| anchored 我方損失／撤離 | 3／15 | 1／13 |
| bench ms／步 | 67.3 | 2.87 |
| rift seed 1：勝方／targetHits／死亡 | player／10／9 | player／10／10 |
| rift seed 2：勝方／targetHits／死亡 | player／10／9 | player／10／8 |
| rift seed 3：勝方／targetHits／死亡 | player／10／10 | player／10／8 |
| rift seed 4：勝方／targetHits／死亡 | player／10／13 | player／10／9 |
| rift seed 5：勝方／targetHits／死亡 | player／10／8 | player／10／5 |
| rift seed 1：同工作樹我方死亡 | 3 | 3 |
| rift seed 2：同工作樹我方死亡 | 1 | 1 |
| rift seed 3：同工作樹我方死亡 | 3 | 3 |
| rift seed 4：同工作樹我方死亡 | 1 | 1 |
| rift seed 5：同工作樹我方死亡 | 1 | 1 |
| skirmish seed 1 hash | cf880776eb4efe51 | 380744cf10f5d1b6（core 對照相同） |
| skirmish seed 2 hash | f7d262c08fce635e | 5c1f38fa4eb4ac47（core 對照相同） |
| skirmish seed 3 hash | 127ed772412326a5 | 159fc9c1a22034e0（core 對照相同） |
| skirmish seed 4 hash | cee385ea5a5937b8 | a3f7bc670543a9f7（core 對照相同） |
| skirmish seed 5 hash | c45430b95d7e7da8 | ee1bcef621d47451（core 對照相同） |

skirmish 基準修訂授權：wf/inbox/orders/cx-aio-tactics.md「2026-10-24 lead-ai-objective 裁定」，要求同工作樹＋git HEAD core AI 對照。開工快照三檔逐檔與 HEAD 相同；完成欄每個 hash 也是 core 對照的實際值。原開工值如表保留，沒有冒用舊輸出。bench 原始 commands／ms：164／11037 → 85／244。

anchored 我方損失 3→1，rift 同工作樹我方死亡合計 9→9；最終採 objHunt=0。初值 0.3 時 rift 我方死亡 9→12（seed 2 為 1→4）；單獨關閉追擊後 seed 2 恢復 1、hash 與 core 相同，確認追擊造成惡化。降到 0.03 時為 9→10（seed 2 為 1→2），0.01 仍為 9→10（seed 2 恢復 1，但 seed 5 為 1→2），0.001 仍為 9→10。未找到符合門檻的正值，因此最終預設降至 0；保留 profile 正值啟用功能與八項測試，最終總死亡不高於 core，anchored 同時不惡化。rift 原工具不印我方死亡，補測僅在程序中擴充輸出欄位，不改工具檔；最終是在同一量測程序補印 ownDeaths，沒有拼接另一輪的死亡數；先前 0.3 輪的正式與補印程序亦得到相同五 hash。原開工 rift 受同期更新影響，不能把後來的 core 死亡補測冒稱原開工值。anchored 開工／完成也包含同期工作樹變動，不把其差額全歸因於本線；隔離 AI 的死亡對照使用同工作樹 rift core 控制組。

passive 查證：rg 'passive|sustained' src/rules/ 的 passive 唯一命中是 command.ts 的 require-failed 拒絕；hooks.ts 由 EffectInstance 分派 hooks，未找到 passive AbilityDef 的自動執行入口。sustained 則由 command.ts 開關、turn.ts 維持扣費。規則未改。

## 產出（檔清單）

合計 5 檔，低於 8 檔／60 KB gate：

- src/ai/policies/tactical.ts
- src/ai/score.ts
- src/ai/objectives.ts
- test/ai/tactics-coverage.test.ts
- wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-tactics/REPORT.md

原始證據在 /tmp/cx-aio-tactics/：tactics-final.log、red-before.log、ai-sim-final.log、typecheck.log、typecheck-final.log、skirmish-{before,final,control}.log、rift-{before,final,own-before,own-after,hunt003,no-hunt}.log、anchored-{before,final,hunt03,hunt003}.log、bench-{before,final}.log、passive-evidence.log。before-loader.mjs 是記憶體快照替換器；deaths-loader.mjs 僅擴充量測輸出。未改 shared stub 或 fixtures。

## 沒做到或證據不足的

沙箱外 AI／sim 與 typecheck 由領導依交接書重跑，未宣稱本線已在沙箱外驗收。第一次 typecheck 遇到別線 src/rules/hooks.ts:74 TS2538、test/rules/regress.test.ts:136 TS2741，未越界修改；別線修正後重跑 exit 0。中途 hunt0001 的 bench 在輸出有效計時後，曾被別線 ops/war/merc.ts:139 的 payload.player 非有限數字／id 錯誤中斷；未越界修改，最終重新執行 bench exit 0。沒有執行超出固定五條的 npm test、wf-lint 或其他套件。

anchored 仍然 0 勝，沒有把命中增加當成勝率提升。效果估值採既有三個預覽 seed，可能受樣本、免疫與豁免影響；調參階段的原始 log 另保留 hunt03／hunt003／hunt001／hunt0001 系列。field scope 效果沒有單位屬性貢獻容器，不另猜測其未來影響。原開工與同工作樹控制數據的差異已分開列明。

## 需要決定的事

是否／何時為 profile 啟用追擊，或設計更安全的啟用條件，留領導後續決定；本線遵守死亡門檻採 objHunt=0，不擴充規則。sustained 主動關閉時機未定：本線只避免反覆開關；資源不足時的規則自動停用維持既有行為。領導負責沙箱外複驗與 commit；hash 基準已由 orders 裁定，本線沒有待批准的寫入。

以後交接書該點名的工具：Node registerHooks（在同工作樹載入 core AI、反證及補印死亡數）；node --test --test-isolation=none（取得沙箱實際斷言計數）。

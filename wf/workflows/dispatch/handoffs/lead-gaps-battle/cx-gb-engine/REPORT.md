# cx-gb-engine REPORT

狀態：**FAILED**（第 5 條效能門檻未達；保留全部改動供領導判斷）。未 commit、未重產黃金檔。

## 做了什麼

MonsterDef id 由 scenarioToSetup 傳入可選 UnitInit.monster.def，runtime 保留正規化 id。frameView 合併並穩定排序 extraAbilities／tags；partDefs 依部位 id 逐筆整欄覆寫，層陣列整組取代，未匹配部位不變。合成 parts 與 frame 都以 ContentDB WeakMap 快取。makeUnit 透過 addContrib 求值 attrMods，source 強制使用 MonsterDef id。

BattleResult.units 新增可選 monster id；捕捉前存入可選 capturedMonsters，轉 frame 後仍可回報，HP 原樣保留。未提供 def 的舊初始化不新增 runtime 欄位，開工前完整狀態 hash `659804c7a60fdc98` 保持不變。

載入器只追加獨立 checkMonsterOverridesAndSoulGrade：檢查覆寫部位 id、末層 structural、至少一個 core、捕捉對應層數、human 禁用 soulGrade。捕捉 HP 上限差異只警告。共享 loader.ts 的 lintContent／ruleId 是 cx-gb-check 的改動；flow.ts 的 tether 與 types-state.ts 的 spawnParents 是 cx-gb-ai 的改動，本線未修改那些段落。

4 個機魂遷移：empty-teacup S、rust-kite S、abacus-of-ashes B、lantern-nine C。開工 grep 只有這 4 個內容 tag，沒有程式讀取者；遷移後 `grep -rn "soul-grade" content/base src` 為 0 命中（exit 1）。attrs 登記獸緣／殼緣 0–100、無 role；人物 NumExpr `self.attrs.beastKin` 缺值取 0，給 37 得 37，沿用既有 attrs 行為。

ISS-023 選擇 hard：spec 只把 heat 定為預設 soft；soft 超上限應進超載帶，既有 instinct 沒有任何帶或效果。為消除 120/100 又不臆造新效果，把 18 species＋18 bio frame（共 36 檔）的 instinct capKind 改 hard；corpse 檔未發現同問題，未改。其餘池參數不變。

同族多等級共 13 隻全部比對 numeric-bands；7 隻超出區間者只以 partsOverride 更改 layers.hp，按比例取整、最後一層補總和差。區間內的 6 隻不改。A 區間 1500–2000、B 800–1400、C 300–480、D 60–180。

| 怪獸 | 級 | 原總 HP | 新總 HP |
|---|---|---:|---:|
| lancewing-b | B | 420 | 800 |
| lancewing-c | C | 420 | 420 |
| mirror-a | A | 950 | 1500 |
| mirror-b | B | 950 | 950 |
| rotwarden-a | A | 1000 | 1500 |
| rotwarden-b | B | 1000 | 1000 |
| siegebeetle-a | A | 1400 | 1500 |
| siegebeetle-b | B | 1400 | 1400 |
| stalk-b | B | 450 | 800 |
| stalk-c | C | 450 | 450 |
| tidewolf-b | B | 180 | 800 |
| tidewolf-c | C | 180 | 300 |
| tidewolf-d | D | 180 | 180 |

## 產出（改動檔清單）

完整 60 檔清單見 [changes.json](changes.json)：48 內容、7 程式／schema、2 測試、REPORT 與兩份證據表。主要變更為 state.ts、flow.ts、types-def.ts、types-state.ts、loader.ts、run.ts、content.schema.json；新測試 monster-def.test.ts，content.test.ts 追加。diff 連同新測試與清單約 67 KB（包含共用檔別線 diff 的保守計數）；加本報告仍低於 200 KB，正好 60 檔，未超 gate。

定向測試 `node --test --test-isolation=none test/rules/monster-def.test.ts src/content/content.test.ts` 最終 22/22，typecheck exit 0。最新 check 與 ops check 都 `OK 0 errors, 38 warnings`，其中 34 條為本線預期捕捉層 HP 差異，其餘來自另一線 lint。

能變紅證據：實作前跑怪獸測試，HP 30/40/50 對不上 47/57/67、可用能力缺 restrain、accuracy 55 對不上 61、戰果 monster 為 undefined，四項均紅；舊初始化 hash 在開工前擷取，改後相同，將 HP 人為 +1 則 hash 不同。載入器測試對每項先載合法對照再破壞單一條件，四種覆寫與 soulGrade 五項紅→綠；HP 差異警告也先紅後綠。人物獸緣缺值與顯式值求值已測。

量測與完整測試詳見 [verification.json](verification.json)。fuzz 100/100（ai 34、random 33、scenario 33，jobs 4）硬違規 0，耗時 326742 ms，捕捉覆蓋 4 場。npm test exit 1，沙箱檔案級計數 110 過／15 失敗；已對失敗檔用 --test-isolation=none 取得原因，未去修別線程式。

bench 開工 4.55 ms/步（58 commands、hash ae17e5c3a88e7a67）；完成初測 38.53；加 FrameDef 快取後 25.11；fuzz 結束後最後量測 29.00（60 commands、hash 7dcff3308145c454）。固定上限為 4.55×1.2＝5.46，最後值 6.37 倍，**未通過第 5 條效能驗收**。測得當時整機 load 約 38–62；工作樹有持續的 ops／AI 併行改動，指令數也不同，無足夠證據將差異歸因於本線或純負載，不以此宣稱豁免。依「測出來未達且未修好 → FAILED」回報。

## 沒做到或證據不足的

六個戰鬥黃金 hash 未變：combat-conduct、combat-layers、combat-tenth、people-berserk、people-capture、people-eject；黃金檔未改。`test/golden.test.ts` 的載入前置失敗，原因是另一線 attack-cost lint 拒絕 test/scenarios/pack/abilities/pp-break-limb.json，hash 斷言本身全過。同一原因使 effects.test.ts／hooks.test.ts／pools.test.ts 與 seams.test.ts 的 fixture 載入失敗，已回報領導。

其餘 10 個初次失敗檔及重跑結果逐檔列在 verification.json：batch／cond／war-invariants 重跑通過；campaign 的 already-there、crew 招募拒絕、rifts 缺 rift-test、entry JSON 去掉 undefined 欄位都是營運端結果，本線未改相關檔。CLI 沒等到 socket 就緒、兩個 e2e 的 server 提前 exit 0，原因未證實，留整合線處理。

固定 hash 變動清單：戰鬥黃金 6 個無；舊 UnitInit 無；營運 fixtures/campaign-hash.json 期待 ff0f5a61ffac4a93／295 事件，實測 50b3d36561c422f6／358 事件（day31），營運端同時施工，未改 golden；bench hash 從 ae17e5c3a88e7a67 變 7dcff3308145c454（58→60 指令），未保存開工事件逐筆日誌，無法精確歸因。

## 需要決定的事

捕捉後同族高等級個體 HP 可大於 capture.frame 上限，依交接書保留現況且只警告；本線未改捕獲框架、營運消費端或 HP 轉換政策。營運層若仍只傳 species／grade，個體覆寫仍不會啟用，須後續傳 def。

請領導在負載穩定、其他線整合完成的環境重跑同一 bench，並依固定 5.46 ms/步門檻判定；本線不自行放寬門檻。

code-map／engine-facts EF-13 的導航與引擎事實更新不在本線可寫路徑，留領導收線同步。

## 以後交接書該點名的工具

無。

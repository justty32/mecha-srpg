# REPORT — plan-ops-spec（重派）：營運層 spec 第一版收線

STATUS：**DONE**。`wf/workflows/planning/specs/ops/`（README＋9 子檔＋`constraints-ops.json`）可切線實作；`wf-lint --strict` exit 0；本線未 commit。開工 07:50、收線 08:05（gate 90 分鐘內）。

## 一、做了什麼（接手半成品 → 審、補、改）

上一輪留下 11 檔，骨架與內容大致可用；先前 lint 報的三處 >1 KB 條列已在中止前修掉，接手時 lint 已 exit 0。本輪**不重寫**，只做下列修正：

- **動詞數不一致**：text-ui 標題寫 22、實列 27；README 寫 22；constraints DN-R-02 錨點還停在「20 個」。統一為 **27（23 遊戲＋選／存／讀／助 4 系統）**，三處同步。
- **mastery／trust 誤寫成 core 欄位**：經濟檔原寫 NumExpr `ref: "self.soulTree.mastery.<node>"`、trust 寫在 `WillState` 同構表——core 的 `WillState.soulTree` 沒有這兩欄。改為**營運層狀態** `RosterState.mastery[soul][node]`、`RosterState.trust[soul][person]`，出戰時經 `Sortie.injected` 翻成 contribution；battle-interface 注入清單同步。
- **無拘束生物機甲以 `controlMode:"berserk"` 出戰**與 core 定義衝突（berserk 是效果強制、不是選擇）。改為「無座位出戰、`controlMode:"none"`、由 core 本能控制交 AI」，並在「與 core 的差異」(4) 標明這依賴 sim 線正在補的缺口。
- **`craft` 屬性 role**：原文稱「core 登記制允許新 role」，但 core 的 `role` 是封閉聯集。改為 ops 以 `attrs.json` 的 tag 自查、不動 core；是否加進聯集列為 core 建議。
- **`Screen.handoff`** 在戰場入口段被引用但型別沒宣告 → 補進 `Screen` 型別。
- **補充裁示吃進**：沙盒已在 world-map／time-and-tick／text-ui 落地（上一輪已做，本輪確認）；古代機甲「原始無名、人以神話命名」原本只有 FactionOpsDef 一個 `naming` 欄、**沒有資料落點**——新增 `RosterState.names[mech]`（多稱號、含誰取的／哪天）、`喚` 成功當夜 `prompt` 命名（候選從 `names/mythic-<culture>.json` 抽＋自填，不加動詞）、`OpsEffect: nameMech`、事件 `Named`、內容包 `names/` 資料夾與範例；機械系分階段命名維持為內容規範（`naming` 欄＋roadmap 內容第二批）。
- **content-format-ops 缺範例**：原缺 calendar／ferry／ship／services／jobs／templates；補齊並加 names，共 22 個 JSON；為守 8 KB 把多個範例去掉選填欄（檔頭已註明）。
- **constraints-ops.json**：DN-W-01～04、DN-W-13 的 `source` 原指 `world.md`，其實內容在 `design-notes/mechs.md`（該檔無二級標題，改檔級連結）；DN-W-08 的 `spec_section` 原指回 design-notes，改指 README#讀法；USR-01／02 原註「尚未入 design-notes、建議補記」——**design-notes 其實已有**（world.md「沙盒（2026-10-24）」、mechs.md「古代機甲的名字」「機械系機甲的命名」），改指向它們；USR-02 拆成 USR-02（古代命名）＋新增 USR-03（機械系分階段）。54 → 55 列；所有帶 `#` 的連結以 `check_anchors.github_heading_slug` 逐一驗過 0 壞。

## 二、驗收逐條證據

1. README 含 mermaid 模組圖與 `<!-- wf-nav -->` 子檔導航；子檔 9 個 md＋1 json；bytes：architecture 6121、battle-interface 7126、content-format 8167、economy 6608、factions 6769、roster 8082、world-map 8002、README 5512、text-ui 6839、time 5894，全 ≤ 8192。
2. `tabledb.py constraints-ops.json` → `contract: wf-table/1, count: 55`，每列 `source`／`spec_section` 非空；`tabledb.py check` 0 壞；design-notes 三檔全部粗體段（mechanics 11、world 12、mechs 7）皆有對應列（mechanics 的純戰鬥段落由 core constraints 覆蓋，ops 只收與營運／世界觀相關的 5 段）。
3. `battle-interface.md` 有「一、出戰編成 Sortie」「二、情境生成 ScenarioGen」「三、戰果回寫 applyBattleResult」三節，回寫欄位八組逐組列出；`content-format-ops.md` 22 個 json 範例覆蓋佈局裡每個資料夾與三個單檔。
4. `bash wf/tools/wf-lint.sh --strict .` → `TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`，exit 0。兩個 `BIGLIST-LINKS` warning（`legacy/docs/README.md`、`content/README.md`）在我領地外、不算失敗，未碰。
5. 本 REPORT 含下方三段。

## 三、最想請使用者看的 5 個設計決定

1. **蝕域是節點狀態、裂縫是七態狀態機、只在大潮日與戰果回寫時轉移**（world-map）：世界圖上「哪天該在哪」可算，測試只斷言兩類時點；養裂＝`fedCount`，殘聯事件鏈由它驅動。
2. **單一帳本、三條守恆不變量**（economy／architecture）：所有幣與存量只經 `post`；`balances` 是 `entries` 折疊、外源筆必有來源事件、`stock:*` 永不為負——「帳本守恆」從口號變成可斷言的測試。
3. **營運→戰場零 core 修改，全走 Effect／contribution 注入**（battle-interface）：心情、同調、飢餓、信任、練熟都不進 core 型別；唯一建議是 `UnitSpawn.effects?` 一欄。
4. **機魂的「開」與「練熟」分家，mastery／trust 是營運狀態**（economy）：開＝科研付幣、熟＝每日陪伴時段；租來的機魂開很多、熟零個，自己養的慢但只對你的人熟。
5. **古代機甲的名字跟著「誰叫過它」走**（roster）：殼無名、`names[mech]` 存稱號清單，喚醒當夜從認主者文化的神話表抽三個＋自填；不同勢力可再加稱號，顯示最新、`看` 列全部。改名是事件不是動詞。

## 四、替使用者做掉的決定清單（可逐條推翻；各子檔結尾另有 5–6 條）

1. 27 個動詞封頂，新玩法先落在既有動詞上（命名走 `prompt`＋`choose`）。
2. 無拘束的馴獸只能無座位出戰（本能控制、不可控援軍），不能載人。
3. mastery／trust／names 都放 `RosterState`，不碰 core `WillState`。
4. `craft` 屬性以 tag 自查，不擴 core 的 role 聯集。
5. 古代 `FrameDef.name` 是目錄代號，玩家看到的是 `names` 最新稱號；摹機與獸也可冠名但預設顯示 `FrameDef.name`。
6. 機械系分階段命名不由 ops 生成，是內容規範（`FactionOpsDef.naming`＋roadmap 內容第二批規範化）。
7. 命名表按文化一檔（`names/mythic-<culture>.json`），背景帶 `culture` tag。
8. content-format 範例為守 8 KB 去掉選填欄、`PoolDecl` 只寫 `max`／`initial`。
9. constraints 來源在 `mechs.md` 的列用檔級連結（該檔無二級標題），不硬造錨點。
10. 上一輪各子檔結尾的 45 條「替使用者做掉的決定」未推翻，照單沿用。

## 五、需要使用者／頂層裁示的事

- **core 建議三條**（本線不改 core，請頂層決定派給 sim 線或下一條 core 修正線）：(a) `UnitSpawn` 加 `effects?: EffectRef[]` 承接營運注入（加入前 ops 以 `PersonState.effects` 預掛繞過）；(b) `attrs.json` 的 `role` 聯集加 `craft`（否則 ops 以 tag 自查，可不加）；(c) `registries/layer-types.json` 允許 `repair: { hoursPerHp, material }` 擴充欄，或改放 ops 自己的 `jobs/repair.json`——本版兩者都寫了，實作時擇一。
- **sim 線整合缺口**：ops 的無座位獸出戰依賴「`controlMode:"none"` 的裂獸由本能控制交 AI」成立（STATE.md 下一步 2 已列）。
- **design-notes 無需補記**：三條補充裁示（沙盒、古代無名以神話命名、機械系命名分階段）**已在** `design-notes/world.md` 與 `design-notes/mechs.md`，constraints 的 USR-01～03 直接指向它們；上一輪草稿裡「建議補記」的說法作廢。
- **順手也該做但沒做**：`content/base/` 現有機械系名稱按分階段規範化（roadmap 已排「內容第二批」）；`FrameDef` 若要支援「隊長機＝冠名-系列」可加 `series?`／`mark?` 欄（內容層面，待 content 線）；`glossary.json` 尚無營運詞條（獵團、浮船、蝕域、潮壓、養裂、練熟、稱號……）——建議 ops 實作線或 tidy 線補 15 列左右。
- **領地外 lint warning**：`legacy/docs/README.md`、`content/README.md` 各一個 `BIGLIST-LINKS`（純連結表、不算失敗），未碰。

## 六、建議的實作切線（檔案清單）

依 README「讀法」順序，每線可獨立驗收：

1. **ops-state-content**：`src/ops/state/{types,ledger,rng,events}.ts`、`src/ops/content/{load,worlddb,cond,opseffect}.ts`、`schemas/world.schema.json`、`content/base/world/{calendar,ferry,ship}.json`＋`campaign-start/default.json`；測試：帳本三不變量、載入器驗證（路線兩端、next 鏈、account 名）。
2. **ops-world**：`src/ops/world/{nodes,rifts,pressure,actions,market}.ts`、`content/base/world/{nodes,routes,rifts,encounters,actions,markets}/`；測試：裂縫狀態機表格驅動、潮壓更新、價格公式。
3. **ops-crew**（可與 2 並行）：`src/ops/crew/{roster,wages,recruit,medbay,workqueue,hangar,stable,research,soul,names}.ts`、`content/base/world/{backgrounds,recruit-pools,research,jobs,names,services}/`；測試：等比例欠薪、佇列灌注順序、mastery ∈ [0,1]、族行為日程、命名 prompt。
4. **ops-contracts**：`src/ops/contracts/{lifecycle,negotiate,tally}.ts`、`content/base/world/{factions-ops,contracts}/`；測試：offered 快照不隨戰力變、談判檢定、有效戰果計頭。
5. **ops-time**：`src/ops/time/tick.ts`（八段編排）；測試：`等 7` ＝ 7×`等 1`、pendingChoices 時 day 不前進、大潮日轉移。
6. **ops-sortie**：`src/ops/sortie/{validate,scenario,apply}.ts`；測試：注入 → core Effect 對照、`applyBattleResult` 八組回寫、殘骸一天可取；需 sim 線 `runBattle` 穩定。
7. **ops-text**（可與 5 並行）：`src/ops/text/{parse,render,templates}.ts`、`content/base/world/{rooms,dialogues,events,templates}/`；測試：27 動詞逐一 parse、模糊比對、指令列／選單恆等。
8. **ops-sim**：`src/ops/sim/{runCampaign,replay,save,cli}.ts`、`test/campaigns/*.json` 黃金戰役、`npm run sim:campaign`；dispatch 驗收用 `--months 12 --policy greedy` 不拋錯。
9. **ui-ops**（等使用者授權 vite／happy-dom／Playwright）：`src/ui-ops/`，一條端對端。

產物：spec `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/ops/`；清單 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/ops/constraints-ops.json`；本檔 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-ops-spec/REPORT.md`。

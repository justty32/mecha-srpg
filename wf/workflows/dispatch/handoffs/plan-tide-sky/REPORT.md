# REPORT — plan-tide-sky：蝕潮的天象系統（潮候／潮勢／星候）design-note 草案（2026-10-24）

STATUS：**DONE**（等使用者拍板；spec 未改、`src/` 未碰、terms.md 未碰）。commit `52e13cc`（9 檔，全部新增於 `wf/workflows/planning/design-notes/tide-sky.md` 與 `tide-sky/`；只用 `git commit -- <路徑>`，沒收別人暫存的改動）。

已讀：AGENTS.md、common/user.md、planning.md、team-model.md（規劃列）、SPEC.md、specs/world（README、setting、rifts-and-territory、operations、monsters、ruins-and-ancient、factions）、specs/ops（time-and-tick、data-model-world-map、world-grid/README、world-grid/rifts-on-grid、content-format-ops/world）、specs/core（data-model-world、data-model-abilities-effects、scenario 全局值）、content/world-pillars.md（含 world 子檔）、design-notes.md 與 world／terms 全文、content/lore/style.md、codex-effects.json、engine-backlog、lead-grid/PLAN.md、`src/ops` 的 clock／cond／opseffect／pressure／scenario／restraint 相關碼。

## 核心設計一句話

**蝕潮是月亮拉開的門，天上誰靠近了門，誰就得利**：日月地一線是大潮、月迫則怒潮、日食於朔是重蝕、月食於望是月隱（枯潮）；五星各主一方（熒惑→獸族、辰星→異形、歲星→古代機、太白→人類兵戈、鎮星→封裂與拘束）、四時主蝕域與菌絲、連珠潮數年一遇——三層都是從 `day` 算出來的純函式，玩家在艦橋的「蝕曆」面板提前看見，拿來排整補、出戰與封裂。

產出：入口 `design-notes/tide-sky.md`；子檔 `lore.md`（為什麼受天體牽動、三種聲音、蝕曆紀年、年表建議、守則相容檢查）、`mechanics.md`（公式、判準數字、面板、蝕訊四來源、模擬頻率）、`omen-effects.md`（`OmenDef`／`OmenEffect` 通用結構）、`spec-proposal.md`；資料檔 `glossary.json`（28 詞）、`omens.json`（15 條）、`spec-proposal.json`（20 列）、`engine-map.json`（10 列）。

翻譯腔審查：詞彙表交 `agy --model gemini-4-argon-high` 純文字審一輪，25 詞可用、3 詞建議改，全採：**空潮→枯潮**（與「空巢」同音）、**近月／遠月→迫月／遙月**（撞「近幾個月」與期貨術語）、**辰星伏見→辰星乍見**（「伏見」是隱現週期、語意矛盾）；另採它的建議把彩蛋句改成「正好應了潮齡之差」。

## 最值得使用者拍板的五題（附建議與判準）

1. **效果分類與對象、誰輪到誰**（頂層轉達的補充需求）。建議：八類效果——`tide`（潮級）、`spawn`（等級上限／數量／二名個體）、`blight`（蝕塊／新裂縫）、`unitEffect`（戰鬥狀態，EffectRef 掛到符合條件的單位）、`ops`（白名單營運效果）、`event`（事件表／注入／話題）、`rule`（封閉開關集合）、`faction`（好戰／報酬／停戰）；對象六維（陣營、族、機甲類別、勢力、等級、地圖）。輪替：五星各主一方、月相分蟲獸（朔潮蟲族與異形、望潮獸族與古代機）、食分劫赦（重蝕劫、月隱赦）、四時主蝕域與菌絲（春分長、夏至菌、秋分收、冬至眠）。判準：週期互不整除（4、7、13、15、21、25、27 蝕月）所以組合一直變；想「更常輪到人類」就把太白縮到 14、鎮星縮到 10。
2. **連珠潮排定還是湧現**。建議：**排定為主**（內容檔寫日期，稽古學會可預言；預設開局後第 40 蝕月，之後每 52），湧現規則（迫月＋≥3 星候）只當加碼。判準：模擬 200 年，湧現式只有 0.07 次／年，太稀；若希望完全湧現，就把條件降到 ≥2 星候（約 0.5 次／年）。
3. **簡化週期表 vs 近似真實星曆；是否採「蝕曆」紀年並把第一次蝕潮寫成重蝕之夜**。建議：**簡化週期表**（全部在內容檔，可重播、可改）＋**蝕曆**（元年 2089、一年 13 蝕月、2108 開局約十九年）；真實星曆只留一句彩蛋——2089-03-14 實際是朔後二日、春分前六日，正是真實潮汐「大潮晚朔望一兩日」的潮齡。年表四條（第一次蝕潮＝重蝕＋連珠、夸父＝望潮歲星、2097 月面＝月隱、下一次連珠潮＝開局後第 40 蝕月）要先過使用者再交內容線。
4. **怒潮抬級**。建議：**要**——怒潮那一夜裂縫放得過來的等級上限 +1（B 級裂縫吐一隻 A），但不生新錨、天亮後寬度不變；數量怒潮 ×1.4、連珠 ×2、小潮 ×0.6。判準：怒潮每年 2.2 次（迫月 7 蝕月輪撞朔望＋重蝕 25 蝕月）；≥3 次就把迫月拉到 8，≤1.5 就縮到 6。
5. **蝕訊的資訊經濟**。建議：四來源——殘聯免費（月相與潮勢，1 蝕月）；塞勒涅訂閱（全部星候 3 蝕月、連珠 6 蝕月；每蝕月 300 幣量級）；沐蝕會讖語（聲望 ≥20 免費，12 蝕月，三成故意說錯）；稽古學會星盤（刻痕解鎖，連珠與重蝕永久已知）。判準：300 幣約一個 C 級契約的一成；嫌煩就只留殘聯＋塞勒涅兩檔。

另一題不必拍板但請知道：新詞**月扉**（稽古學會對「裂縫另一端在月上」的叫法）是唯一的世界觀新名詞，agy 判可用；不喜歡可整個拿掉，機制不受影響。

## spec 提案摘要（全文 `tide-sky/spec-proposal.json`，20 列，未落筆）

不推翻任何既有規則，只在旁邊加修正：world 12 列——rifts-and-territory 的時鐘段改名「時鐘：蝕月、潮候與潮勢、星候、蝕壓」並補五段潮候、四等潮勢、星候一句；裂縫段的「前三天只有先鋒」＝退潮三日、重蝕例外；地盤段的擴散句加潮勢與星候修正；setting「蝕潮與墟」擴成月扉／天戶／星哨／蝕曆四種聲音、月球補「2097 月隱」；operations 迴圈改以潮候為節拍、時間尺度加蝕曆與週期表、面板列加蝕曆；monsters 等級觀加「潮勢抬尺寸、二名綁星候」；factions 四族天氣各補天象、塞勒涅賣蝕訊、沐蝕會讖語、稽古學會星盤；ruins 認主補「望潮尤佳、歲星加成、重蝕躁動」。ops 8 列——time-and-tick 的 `Clock` 加 `tide`／`stage`／`year`、`calendar.json` 加 `monthsPerYear`／`epochMonth`、新 kind `omens/` 取代未實作的 `special`、大潮日事項依潮勢縮放；蝕壓泊松乘潮勢係數；rifts-on-grid 擴散公式加 `tideSpreadDelta`／`omenSpreadDelta`；ScenarioGen 設 `globals.tide` 並掛敵方 `unitEffect`；content-format-ops 曆範例；text-ui 面板與潮信行；constraints-ops 新列 USR-14。落筆順序：world 先、time-and-tick 次、蝕塊那條等 lead-grid 第三波、USR-14 最後。

## engine-backlog 候選列（未寫入 json；欄位照 engine-backlog.json）

```json
[
 {"序":"26","優先":"P2","項目":"曆函式與天象旗：`stage(dom)`／`tide(day)`／`omens(day)` 純函式，`Clock` 加 `tide`／`stage`／`year`，tick 段 1 寫 `flags.omen:*`，`calendar` ref 根加欄；內容 kind `omens/`（OmenDef）取代未實作的 `calendar.special`","來源":"[plan-tide-sky](plan-tide-sky/REPORT.md)","影響":"不做則內容線寫不出天象事件；做了當天事件／契約／行動牌的 `when` 就能寫 `{\"tag\":\"omen/…\"}`","建議做法":"先做這列：純函式＋載入器一個新資料夾＋check 驗週期；黃金不變（旗不影響既有 Cond）","規模":"小"},
 {"序":"27","優先":"P2","項目":"天象 `ops` 與 `faction` 效果：天象窗 start／end／eachSpring 呼叫 `applyOpsEffect`；`war/drivers.ts` 行動牌權重 × `aggressionMul`；契約 `pay` 可引用 `calendar.tide`","來源":"[plan-tide-sky](plan-tide-sky/REPORT.md)","影響":"太白晝見、秋分、鎮星合月的營運面效果無法生效","建議做法":"接在第 26 列之後，同一條線；`truce` 停戰用既有 treaty","規模":"小"},
 {"序":"28","優先":"P2","項目":"ScenarioGen 讀潮級與天象：`budgetByGrade` × `countMul`、`gradeByWidth` 位移（怒潮 +1、連珠 +2、枯潮 −1）、`named` 二名個體注入、敵方單位掛 `unitEffect` EffectRef、`globals.tide` 設成潮級","來源":"[plan-tide-sky](plan-tide-sky/REPORT.md)","影響":"「大潮期有大怪」只停在數字上；`battle.tide` 目前沒東西可讀","建議做法":"動 `src/ops/sortie/scenario.ts`；順手補它自己標的 SPEC-GAP（budgetByGrade 無係數）；黃金戰役會變，commit 說明","規模":"中"},
 {"序":"29","優先":"P2","項目":"蝕塊與新裂縫的天象修正：擴散 `max(0, base + tideSpreadDelta + omenSpreadDelta)`、泊松均值 × 潮勢係數、`anchorInstant`（重蝕／連珠 `opening` 跳過）、枯潮 `sealing` 一夜即 `sealed`、鎮星多退一塊","來源":"[plan-tide-sky](plan-tide-sky/REPORT.md)","影響":"潮勢對世界圖沒有可見後果","建議做法":"**等 lead-grid 第三波 `cx-grid-blight` 落地後**再開，請該線在擴散處預留 `spreadDelta(day)` 加法位；係數放 `rules.tide`","規模":"中"},
 {"序":"30","優先":"P3","項目":"`rule` 開關第一批 6 個：anchorInstant、sealFast、restraintCalm／restraintRestless（磨損倍率）、awakenBonus（認主判定）、telegraphDim（意圖可見）、broodBoost（蟲族育量）","來源":"[plan-tide-sky](plan-tide-sky/REPORT.md)","影響":"星候只剩數值效果，少了「特性被啟用」那一味","建議做法":"每個開關一處分支、各自一條 codex 小線；集合封閉、新開關要加列","規模":"每個小"},
 {"序":"31","優先":"P3","項目":"蝕曆面板與潮信行：`DaySummary` 加一行潮信（text 層）；艦橋面板「蝕曆」（28 格潮候、潮勢標記、已知星候倒數、未知畫「？」）；蝕訊四來源的 `known` 判定（`flags.uplink:selene`、沐蝕會聲望、`flags.starchart`）","來源":"[plan-tide-sky](plan-tide-sky/REPORT.md)","影響":"玩家看不見就不會拿來排營運，整套設計只剩後台數字","建議做法":"潮信行先做（小，`look` 不加動詞）；面板走 ui-ops 的 `vm/layout.ts`","規模":"小＋中"}
]
```

## 與併行線的接點與風險

- **lead-rename**：本檔新詞（潮候、潮勢、怒潮、枯潮、朔潮、望潮、迫月／遙月、晦夜、重蝕、月隱、星候、五星古名、蝕曆、月扉）只在 tide-sky 內，沒寫進 terms.md／style.md；使用者過目後請改名線回寫。spec-proposal 的段落標題已對齊它 `506c18a` 換詞後的檔名。
- **lead-grid**：第 29 列要等 `cx-grid-blight`；建議頂層轉一句給 lead-grid：擴散處留 `spreadDelta(day)` 加法位、`opening→anchored` 留可跳態位，不必現在實作。
- **lead-content**：`omens.json` 就是量產範本；`lc-ops-01` 剛加的「蝕潮異象」事件日後可把 `when` 改成 `omen:*` tag（第 26 列落地後）。
- **plan-intrigue**（另一條規劃線）：它的 `design-notes/intrigue.md` 與 `intrigue/fog.md` 連到尚不存在的 `intrigue/tide-sky.md`（wf-lint 目前 BROKEN）；若它想指本線，路徑應是 `../tide-sky.md`——請頂層轉達，本線不動它的檔。
- **design-notes.md 入口**未加列（避免與改名線撞檔）：請頂層在分檔表加一行指向 `design-notes/tide-sky.md`，並註明是提案非裁示。

## 驗證

`bash wf/tools/wf-lint.sh --strict .` 對 tide-sky 九檔 0 項（無 BROKEN／OVERSIZE／BIGLIST；兩張 >1 KB 的表已抽成 json）；`tabledb.py check` 四個 json 無壞連結；每個 md ≤ 5.9 KB。頻率數字來自 scratchpad 的 200 年模擬（28 日蝕月、13 月一年）。

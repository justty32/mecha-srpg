cx-web-inv 唯讀盤點完成，共 19 項缺口，未修改既有檔案。  
六題皆已核對；戰鬥與百科附資料集合及顯示差集。  
「大潮」誤用共 5 檔、12 行、15 處，以下逐處列出。  
固定 3 條驗收已完成；受唯讀沙箱限制，REPORT 未落盤。  
REPORT 預定路徑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md`

# cx-web-inv REPORT

## 一、做了什麼

2026-10-26 依交接執行唯讀調查，親讀指定專案規範，核對營運市場、潮曆、戰鬥介面與百科。

方法為程式碼搜尋、內容 JSON 集合盤點，以及直接呼叫現有純 TypeScript 函式取得 snapshot／百科卡片；未開瀏覽器、GUI、網路或 MCP，未改規則、數值或既有檔案。

以下路徑相對 repo 根目錄。為避免重複長路徑，使用：

- `U/`＝`src/ui-adapter/`
- `O/`＝`src/ops/`
- `C/`＝`content/base/`

共 **19 項缺口**。建議依玩家價值安排：

**R01 → R02 → R03／R04／R05 → B01／B05 → W01／W02／W05／W06 → B02／B03／B04／B06 → W03／W04 → U01／U02。**

S＝局部文字或映射；M＝跨 snapshot／卡片／DOM 的呈現調整；本次沒有必須列 L 的項目。涉及他線登記檔案的逐項對照放在報告末尾。

## 二、缺口清單（含排序建議）

### 第 1 題：聲望門檻

**R01｜灰按鈕已有，缺少勢力、門檻與目前聲望。規模 M；不需新遊戲規則，建議補唯讀查詢資料。**

現況：

- `O/war/rnd.ts:29` 的 `repGate()` 決定門檻；`:34` 的 `repGateBlocked()` 已回傳 `{faction, need, have}`。實作位置是 `war/rnd.ts`，由 `world/market.ts` 使用。
- `O/world/market.ts:38` 的私有 `frameRepBlocked()` 處理動態 model 商品與固定 frame 商品；固定 frame 會採最低門檻，任一通用登記可免門檻。
- `O/world/market.ts:150` 的 `cmdTrade()` 在 `:169` 回 `reputation-required`。
- `U/ops/vm/snapshot.ts:34` 的 `cmdButton()` 已試跑指令；`:83–88` 建市場購買按鈕。因此聲望不足時，按鈕**已會變灰**。
- `U/ops/vm/labels.ts:22–45` 缺少 `reputation-required` 翻譯，實際原因顯示為「指令被拒：（reputation-required）」。
- `U/ops/dom/ui.ts:15–40` 已支援灰按鈕外層 tooltip，無須重做按鈕機制。

唯讀重現：將 FR-7 列於造機勢力地盤市場，聲望 0、需求 10 時，snapshot 的購買按鈕為 `enabled:false`，但沒有勢力名稱或門檻數字。

建議：

1. 在 `O/world/market.ts` 提供與 `cmdTrade()` 共用的唯讀商品聲望查詢，保留上述固定 frame／通用登記語意，避免 UI 另算一套。
2. `U/ops/vm/snapshot.ts` 組出「需要〈勢力〉聲望 N（目前 H）」作為購買按鈕 `reason`。
3. `U/ops/vm/labels.ts` 補通用中文 fallback。
4. 如需市場常駐顯示門檻，在 `U/ops/vm/types.ts` 的 `MarketView.items[]` 增加：

   ```text
   reputation: null | {
     faction: string;
     factionName: string;
     need: number;
     have: number;
     blocked: boolean;
   }
   ```

   再由 `U/ops/dom/tabs.ts` 市場列顯示。

**最小方案不必新增 snapshot 欄位**：現有 `OpsButton.reason` 已足以承載完整文字；結構化 `reputation` 適合市場列也要顯示門檻時使用。

另須保留既有上架規則：部分 restricted 機型在外地聲望不足時根本不列出，並非所有受限機都已上架。此次灰按鈕調整不應順帶擴大可見商品集合。

### 第 2 題：大潮／漲潮用字

**R02｜舊三分潮相 spring 被當作大潮。規模 S；不需引擎新功能。**

語意依據：

- `O/state/omens.ts:14–23`：`spring` 表示朔望漲潮日。
- `O/state/omens.ts:50–57`：漲潮基本潮級為 2，天象修正後才可能成為大潮 3、連珠潮 4，或枯潮 1。
- `O/crew/names.ts:34–35` 的 `cmdWake()` 實際檢查 `phase === "spring"`，所以其拒絕文字也應稱漲潮。

完整搜尋 `src/ui-adapter/`，包含 fixtures、測試、註解，共 **5 檔、12 行、15 處「大潮」**：

| 檔案與行號 | 現有字串 | 建議字串 |
|---|---|---|
| `U/ops/vm/types.ts:51` | `// 大潮／小潮／平潮` | `// 漲潮／小潮／平潮（舊三分潮相）` |
| `U/ops/vm/types.ts:52` | `第 1 潮月 第 15 日（大潮）` | `第 1 蝕月 第 15 日（漲潮）` |
| `U/ops/vm/types.ts:159` | `距下個大潮天數（今天是大潮＝0）` | `距下次漲潮天數（今天是漲潮日＝0）` |
| `U/ops/vm/labels.ts:7` | `spring: "大潮"` | `spring: "漲潮"` |
| `U/ops/vm/labels.ts:31` | `須等到大潮之夜` | `須等到漲潮之夜` |
| `U/ops/dom/tabs.ts:150` | tooltip 的 `spring: "大潮"` | `spring: "漲潮"` |
| `U/ops/dom/tabs.ts:154` | 日曆圖例 `["spring", "大潮"]` | `["spring", "漲潮"]` |
| `U/ops/dom/tabs.ts:158` | `今天是大潮。` | `今天是漲潮日。` |
| 同上 | `距下個大潮 ${c.nextSpringIn} 天。` | `距下次漲潮 ${c.nextSpringIn} 天。` |
| `U/ops/dom/fixtures.ts:16` | `phaseName: "大潮"` | `phaseName: "漲潮"` |
| 同上 | `第 1 蝕月 第 15 日（大潮）` | `第 1 蝕月 第 15 日（漲潮）` |
| `U/ops/dom/fixtures.ts:98` | `大潮來了。` | `漲潮來了。` |
| `U/ops/dom/render.test.ts:29` | regex 中 `.*大潮.*` | `.*漲潮.*` |
| `U/ops/dom/render.test.ts:42` | regex 中 `今天是大潮` | `今天是漲潮日` |

現況函式分別是 `label()`、`rejection()`、`createTabs()` 的 calendar painter、`opsFixture()` 及既有 render 測試。

識別字 `spring`、`nextSpringIn`、CSS class／變數不需改。真正潮級 3 的「大潮」應另由 R03、R05 呈現，不能拿舊欄位冒充。

### 第 3 題：大潮曆／天象

**R03｜潮候與實際潮級沒有顯示。規模 M；不需引擎新功能。**

現況：

- `O/state/clock.ts:9` 的 `skyAt()` 已產出 `stage`、`tide`、`year`。
- `O/content/start.ts:35–45` 開局計算；`O/time/tick.ts:75–77` 每日更新。
- `U/ops/vm/snapshot.ts:118` 因展開 `...s.clock`，runtime header **已帶有**這些值；但 `U/ops/vm/types.ts:49–58` 未宣告。
- `U/ops/dom/render.ts:63–78` 的 `paintHeader()` 只畫舊 `phaseName`。
- `U/ops/vm/snapshot.ts:111–114` 日曆逐日資料只取 `phase`。

重現：day 0、day 14 都是 `tide:2`，畫面卻叫大潮；day 1120 是 `tide:4`，仍只叫大潮。

建議修改 `U/ops/vm/types.ts`、`snapshot.ts`、`labels.ts`、`U/ops/dom/render.ts`、`tabs.ts`：

- 頂列新增潮候及潮級。
- 蝕曆逐日格增加 `stage`、`tide`、顯示名稱。
- 潮候用 `{rising:潮前,spring:漲潮,ebb:退潮,neap:小潮,slack:平潮}`。
- 潮級 3 顯示大潮、4 顯示連珠潮；漲潮日落成 1 時顯示枯潮，避免將所有潮級 1 都叫枯潮。
- 預測日須呼叫 `clock(day, cal, world.all("omen"))`，不可省略天象定義。

**R04｜當日天象旗未進入營運介面。規模 M；不需引擎新功能。**

現況：`O/state/omens.ts:37` 的 `omens()` 可算當日天象，`:63` 的 `syncOmenFlags()` 已維護 `flags["omen:<名>"]`；但 `buildSnapshot()` 未傳天象清單，頂列與蝕曆也沒有對應 renderer。

建議修改 `U/ops/vm/snapshot.ts`、`types.ts`、`U/ops/dom/render.ts`、`tabs.ts`：

```text
omens: { id: string; name: string; layer: string; text?: string }[]
```

由 `skyAt(...).omens` 對照 `world.all("omen")` 取得中文資料。頂列畫當日天象短標籤；蝕曆放說明、潮級修正與百科連結。使用現有天象定義，無須新增旗或遊戲效果。

**R05｜「下一次大潮」目前實際算的是下一次朔望漲潮。規模 M；不需新規則，缺 UI 預報組裝。**

現況：`U/ops/vm/snapshot.ts:145` 只掃一個蝕月，找 `clock(...).phase === "spring"`；`U/ops/dom/tabs.ts:158` 將其稱作下一次大潮。`O/world/rifts.ts:35` 的 `nextSpring()` 同樣屬朔望用途，不能直接當真正大潮查詢。

重現：開局 `nextSpringIn:0`，但依全部天象計算，第一次 `tide >= GREAT_TIDE` 在 **day 70，month 2／dom 15**。

建議修改 `U/ops/vm/snapshot.ts`、`types.ts`、`U/ops/dom/tabs.ts`：

- 保留 `nextSpringIn` 表示下一次漲潮。
- 另以 `skyAt()` 和 `O/state/omens.ts:4` 的 `GREAT_TIDE` 搜尋真正大潮。
- 新增 `nextGreatTide: null | {day, daysAway, tide, omens}`。
- 蝕曆同時顯示下一次漲潮與下一次真正大潮。
- 預報要有搜尋期限與「期限內未找到」狀態，不能以 14／28 天當保證週期。

### 第 4 題：戰鬥 UI 新內容

現有部位、能力、效果名稱多由內容定義動態取得，不能因 `labels.ts` 沒列每個 id 就判定漏支援。

#### 資料集合 vs 已有顯示

| 資料集合 | 實際內容 | 已有顯示／差集 |
|---|---|---|
| 戰鬥相關 kind | `frame,bodyplan,component,ability,effect,species,monster,person,terrain,aiprofile` | 名稱多動態顯示；欄位缺口見下 |
| `frame.cls` | `mechanical,bio,ancient`；170 frame | frame 名稱有；三種 cls 都未在單位卡顯示 |
| bodyplan | 71 個，含 `m2-{wheel-d,quadruped-c,gantry-c,hexapod-b,keel-b,splitwing-a}` | 部位由 `q.partDefs()` 動態取得，名稱差集空；構型／功能／配裝說明不足 |
| 移動類別 | `leg,track,hover,flight,burrow` | 可達格／路徑用引擎查詢；五類都缺單位卡標示 |
| 層種類 | `armor,chitin,cockpit-shell,flesh,organ,resonant-shell,shield,structure` | `layerTypeLabel()` 全有中文 fallback；差集空 |
| ability | 190 個，完整集合見後 | 每個有 name，透過 `abilityDef(id).name` 顯示；能力名稱差集空 |
| `ability.target.kind` | `self:38,unit:109,ball:29,line:9,cone:5` | tooltip 未說明形狀；43 個球／線／錐能力缺範圍說明 |
| `ability.mode` | `activated:187,reaction:3` | reaction 已有「此能力自動觸發」原因 |
| `species.family` | `alien,beast,insect,mycelium`；44 species | 四類皆未進單位卡 |
| `species.behaviors` | `molt,spawner,telegraph` | 三類靜態說明皆未進單位卡 |
| monster | 56 個，17 個有 name／epithet | 17 個個體辨識資料未用於戰鬥名稱 |
| component | 62 個 | 能力／資源間接可見；已裝部件名稱未列於部位面板 |

目前內容**沒有 `moveClass` 欄位**；實際是 locomotion 登記與 tags。例：`selene-valkyrie` 的 flight、`union-at12` 的 track、`thirdblade-skate-iv` 的 hover、`shellsoc-archive-b` 的 burrow。hover 對應「潮行」是本次建議顯示詞，識別字保持不動。

**B01｜能力成本外露英文資源池鍵。規模 S；不需引擎新功能。**

現況：`U/vm/viewmodel.ts:156–162` 的 `BattleViewModel.commands()` 直接用 `c.pool` 組 tooltip，例如 `ap`、`charge`、`fatigue`、`rune-round`。同檔 `unit():107–117` 已會從 PoolDecl 取中文名稱。

建議修改 `U/vm/viewmodel.ts`，共用依成本 owner 解析池名的邏輯；`U/vm/labels.ts` 補特殊池 fallback。

完整成本池鍵集合：

```text
ammo-30, ap, ash-incense, ax-amrita, ax-brine, ax-ka, ax-sky,
ax-storm, ax-sun, ax-thunder, ax-trick, ax-vigil, ax-wrath,
bind-spike, charge, cold-spring, ember-rocket, fatigue, flare-fuel,
hp, hunter-dart, iron-belt, iron-round, purge-oil, rune-round,
rune-shell, scatter-shell, shard-grenade, stake-wedge, star-shell
```

**B02｜看不到移動類別與地形通行成本。規模 M；靜態展示不需引擎，有效成本查詢是否需新增 API 未確認。**

現況：

- `U/vm/controller.ts:121–126` 的 `reachable()` 使用引擎查詢，`:300–314` 的 `snapshot()` 畫可達格；未見硬編碼排除新類別。
- `U/vm/types.ts:42–50` 的 `UnitView`、`viewmodel.ts:120–125` 的 `unit()`、`U/dom/panels.ts:21–44` 的 `unitPanel()` 沒有移動類別。
- `U/dom/board.ts:11` 的 `paintCell()` tooltip 只有地形及單位名；`controller.ts:331` 地形說明只有高度、掩護、視線。
- `C/terrains/tide-channel.json:6–11` 已有不同通行成本：leg 3、track 不可通行、hover 1、flight 1、burrow 不可通行。

建議修改上述檔案與 `U/vm/labels.ts`，顯示步行／履帶／潮行／飛行／掘進、機體類別，以及選中單位在查看格的成本或不可通行原因。有效類別與成本應由既有 query 提供，不能在 DOM 重算規則。

**B03｜能力用途說明不足。規模 M；靜態說明不需引擎，精確影響格預覽需另確認 query。**

現況：`U/vm/viewmodel.ts:156–162` 的 `commands()` 只列成本與射程。內容已有 `packets`、`effects`、`produces`、`cooldown`、`target.kind/radius`；型別見 `src/core/types-def.ts:168–193`。

建議修改 `U/vm/viewmodel.ts`、`labels.ts`，補傷害、效果、產出、冷卻、範圍形狀與半徑。若加精確影響格預覽，另涉及 `controller.ts`、`types.ts`，且應由引擎查詢供應。

實際沒有 `target.kind:"part"`／`"cell"` 或 `target.partKinds` 資料。以下 9 個有 `partAim` 的能力，現有 `controller.ts:145–155` 的 `partOptions()` 已動態取中文部位名，部位名稱差集空：

```text
ability/ax-riastrad-gae-bolg, ability/burst-30,
ability/ix-line-shot, ability/ix-watch-shot,
ability/kx-bent-needle-pick, ability/kx-needle-rack-shot,
ability/kx-paired-wake-rend, ability/mx-hunter-launch,
ability/mx-starscar-shot
```

**B04｜部位面板不列已裝部件與功能。規模 M；不需引擎新功能。**

現況：`U/vm/viewmodel.ts:96–104` 的 `unit()` 只傳部位名、層、損毀狀態；`:108–110` 雖遍歷部件，但只收集資源池。`U/vm/types.ts:36` 的 `PartView` 無 components／functions；`U/dom/panels.ts:35–39` 只畫層血條。

建議修改這三檔，為我方部位列出插槽、部件中文名與功能。部件名取 `component.name`；功能需 registry 中文 fallback。敵方仍遵守既有 knowledge 邊界。

**B05｜怪獸個體名／稱號被物種名覆蓋。規模 M；不需引擎新功能。**

現況：`src/core/types-state.ts:106–107` 已有 monster 定義追蹤資料；但 `U/vm/viewmodel.ts:90,120` 的 `unit()`、`:51–55` 的棋盤短名，以及 `U/vm/text.ts:7–12` 的 `unitName()` 只查 frame／species。

建議修改 `U/vm/text.ts` 共用個體名稱解析，再供 `viewmodel.ts` 使用；如獨立傳稱號，另改 `types.ts`。保留既有可見性限制。

17 個已命名個體集合：

```text
monster/bed-bellless-dream, monster/bed-white-night,
monster/bell-borer-a, monster/choir-a, monster/choir-last-vesper,
monster/cliffjaw-red-eye, monster/cliffjaw-star-grave,
monster/drowned-grove-a, monster/dusk-fold-a, monster/mirror-a,
monster/nestmother-landlord, monster/reef-antler-a,
monster/rotwarden-a, monster/siegebeetle-a,
monster/sluice-mother-a, monster/storm-mane-a,
monster/tidespine-chittagong
```

例：`C/monsters/tidespine-chittagong.json` 已有「吉大港的那隻」與「萬潮葬王」。

**B06｜怪獸家族／生態行為缺少說明。規模 M；靜態展示不需引擎新功能。**

現況：`src/core/types-def.ts:236–252` 的 SpeciesDef 已有 family、capture、behaviors、aiProfile；`UnitView`／`unit()`／`unitPanel()` 未傳或顯示。內容沒有 ecology／niche 欄，資訊分散在上述欄位。

建議修改 `U/vm/viewmodel.ts`、`types.ts`、`labels.ts`、`U/dom/panels.ts`，顯示可公開的家族、生態行為短說明與百科連結。靜態 `telegraph:true` 不能直接當作當下攻擊意圖。

44 species 使用的 AI profile 集合：

```text
aiprofile/bodyguard, aiprofile/guerrilla, aiprofile/kx-alien-stalker,
aiprofile/kx-beast-alpha, aiprofile/kx-bell-watch, aiprofile/kx-dusk-drift,
aiprofile/kx-mycel-creep, aiprofile/kx-reef-line, aiprofile/kx-sluice-brood,
aiprofile/nest-anchor, aiprofile/pack-hunter, aiprofile/reaper-vanguard,
aiprofile/sniper-perch, aiprofile/swarm-mite, aiprofile/tide-cultist
```

#### 完整能力 id 集合

共 190 個。以下各項加共同前綴 `ability/`；`p-{a,b}` 表示 `p-a`、`p-b`，可完整還原，沒有省略項：

```text
arc-pulse,
ax-brinemother-{brood,tide},
ax-chainbreaker-{howl,jaws,unbound},
ax-lotus-{reborn,ribbon,ring},
ax-plumed-{featherwind,fifth-sun,morningstar},
ax-psychopomp-{procession,staff,weigh},
ax-riastrad-{ford-guard,gae-bolg,warp-spasm},
ax-serpenteater-{golden-dive,serpent-amrita},
ax-skybearer-{earthshaker,hold-sky,unburden},
ax-stormblade-{aragami,cloudblade},
ax-sunsnarer-{jawbone,snare},
ax-thunderoak-{oak-judgment,thunderaxe},
ax-watchhorn-{bifrost,far-sight,gjallarhorn},
bite, burst-30,
cx3-{call-the-tide,crest-cut,skimming-fin},
heat-lance-thrust,
ix-{line-shot,watch-shot},
kx-acid-sting, kx-bare-rend,
kx-bell-borer-{close,dust,toll},
kx-bent-needle-pick,
kx-breaksurf-{gore,roll},
kx-breakwater-clinger-{drag,rend},
kx-brinepin-prick, kx-brood-call, kx-burrow-flank,
kx-carapace-brace, kx-carrion-gulp, kx-cliff-bite, kx-dissonant-hymn,
kx-drowned-grove-{spit,sweep,veil},
kx-dusk-fold-{dim,rain,withdraw},
kx-foam-jaw-{bite,foam},
kx-glare-pulse, kx-grit-fan-scatter, kx-ground-stomp,
kx-hinge-crab-{shelter,snap},
kx-hollow-sail-{cast,fold},
kx-horn-ram, kx-knot-flare,
kx-lantern-keel-{drip,gather},
kx-mirror-turn, kx-mutation-surge,
kx-needle-rack-{rake,shot},
kx-paired-wake-{cross,rend},
kx-pod-bloom,
kx-reed-lace-{bind,spit},
kx-reef-antler-{brace,gore,rake},
kx-root-snare, kx-rot-blade,
kx-shelf-back-{shelter,shove},
kx-shell-ear-{hush,spit},
kx-shield-raise, kx-shovel-ram,
kx-silt-mother-{brood,spit,sweep},
kx-sluice-mother-{brood,spit,sweep},
kx-spine-sweep,
kx-split-fin-{rush,swerve},
kx-spore-{burst,fog,shroud},
kx-star-howl,
kx-storm-mane-{bite,lash,rise},
kx-surf-runner-{kick,skip},
kx-tendril-lash,
kx-thorn-{snipe,volley},
kx-throat-swallow, kx-tide-crush, kx-tremor-stamp,
kx-trench-maw-{bite,breath},
kx-vault-root-{burst,stream},
kx-wall-charge, kx-wick-mat-seep, kx-wing-dive,
m2-{brace-deploy,catch-line,relieve-ally},
mite-swarm-bite,
mx-anvil-roar, mx-ash-screen, mx-aurora-veil, mx-binary-cut,
mx-bind-shot, mx-cinder-spit, mx-cloud-piercer, mx-cold-vent,
mx-ember-salvo, mx-falling-star, mx-fin-flurry, mx-flare-dodge,
mx-frame-strike, mx-futu-charge, mx-guard-stance, mx-head-vulcan,
mx-hunter-launch, mx-hush-burst,
mx-iron-{burst,sweep},
mx-jaw-graft-bite, mx-maul-sweep, mx-molten-cut, mx-moonless-command,
mx-old-city-wall, mx-purge-flame, mx-radiant-shot, mx-relic-fist,
mx-replica-lance, mx-rift-trace,
mx-rune-{cannon-fire,shot},
mx-scatter-blast, mx-serpent-lash, mx-shard-lob,
mx-singing-{riposte,slash},
mx-spine-lash, mx-stake-drive, mx-starscar-shot, mx-thousand-gaze,
mx-tide-leap-up, mx-unbind-rite, mx-valkyrie-dive, mx-white-night-fade,
nest-birth,
pa-{melee-boost,quick-thought,ranged-boost,tame-instinct},
pounce,
reaper-{charge,cleave},
rearguard-oath, restrain, root-drag, scythe-graft-cleave, shard-gaze, shell-lance
```

### 第 5 題：百科

盤點依 `U/dom/wiki/boot.ts:17` 的實際 glob，排除 `content/index/**`、`content/batches/**`，呼叫 `buildWikiIndex()`／`entryPage()` 核對。

#### 資料集合 vs 已有顯示

實際 54 種 kind：

```text
ability, action, actor, affinity, aiprofile, background, base, beasts,
bodyplan, calendar, character, component, contract, curve, dialogue,
effect, encounter, era, event, faction, faction-ops, file, forces,
frame, job, keymap, lane, lineage, map, market, model, monster, names,
omen, operation, person, place, recruit, regions, registries, research,
rift, room, rules, scenario, service, ship, soultree, species, start,
templates, terrain, treaty, wterrain
```

對照 `U/vm/wiki/kinds.ts:3–14`，**缺中文分類名的差集為 11 種**：

```text
actor, affinity, file, forces, lane, lineage, model, operation,
regions, treaty, wterrain
```

base 有 51 種 kind；`U/vm/wiki/cards.ts:48–101` 有專用 switch 的 13 種：

```text
frame, bodyplan, component, ability, effect, person, soultree,
species, monster, terrain, map, scenario, faction
```

沒有專用 switch 的 38 種：

```text
action, actor, affinity, aiprofile, background, base, beasts, calendar,
contract, curve, dialogue, encounter, event, faction-ops, forces, job,
keymap, lane, lineage, market, model, names, omen, operation, place,
recruit, regions, registries, research, rift, room, rules, service,
ship, start, templates, treaty, wterrain
```

這 38 種仍有通用概要／原始資料，**不是整類消失**。lore 的 faction／character／event／place／era 已有 `loreOverview()` 與本文；`lore:file/glossary` 使用通用卡。

指定新欄位核對：

| 欄位 | 資料集合與現況 | 卡片顯示差集 |
|---|---|---|
| nameEn | 59 筆，`cards.ts:110` 全數放概要 | 空 |
| etymology | 42 筆，同上 | 空 |
| occurs possible | 原始 7 筆，hidden 1 筆剔除，其餘 6 筆全有「可能發生」且不進年表 | 空 |
| 整筆 rumor | `character/m3`、`event/hekate-secret` 全有傳聞徽章 | 空 |
| fieldVisibility rumor | 2 筆正確標「座機（傳聞）」「2108 現況（傳聞）」 | 空 |
| secrets／關係 rumor | 已有傳聞清單／關係提示 | 未查到缺漏 |
| hidden | 建索引前過濾 | 屬預期行為 |

6 個可見 possible 事件：

```text
harbor-last-watch, lamplit-return-trials, seven-seals-diverge,
wanchao-at-gate, wanchao-northward, workshop-outline-appendix
```

`aegir-wakes` 為 hidden，未列入可見集合。

`cards.ts:120–121` 將未使用欄位放進「其他原始資料」；`U/dom/wiki/card-dom.ts:53–66` 以預設收合 `<details>` 顯示。因此可見頂層資料與「專用區塊＋原始資料」相比，未查到指定新欄位無故丟失。重要的**主要區塊呈現差集**如下：

| kind | 目前只在原始資料的欄位 |
|---|---|
| frame | burden、defaultLoadout、mark、repairPolicy、resonance、series、tags |
| component | attrMods、burden、layersAdd、poolMods、resonance、tags |
| ability | ai、ammoPool、cooldown、partAim、require、tags、trigger、usesPerBattle、grade |
| effect | tags、ui |
| species | aiProfile、behaviors、capture、tags |
| monster | partsOverride、tags |
| person | activeYears、soulGrade、tags |
| terrain | destructible、tags |
| map | base、cellKm、cells、darkRects、exits、features、fog、globals、legend、oldName、riftRate、region |
| scenario | brief |
| faction（base） | tags |
| bodyplan／soultree | 未查到 raw-only 頂層欄位 |
| model | availableFrom、cost、exportPolicy、frame、generic、lineage、maker、mark、requires、series、tags、tier、role |
| omen | at、cycle、effects、emerge、layer、setTide、tags、text、tideDelta |
| calendar | daysPerMonth、epochMonth、monthsPerYear、neap、spring |
| contract | advanceMax、annoyanceMax、deadlineDays、encounter、issuerKinds、join、mercRules、objectives、onCancel、onComplete、onFail、pay、requiresRep、supplies |
| faction-ops | actionLanes、contractKinds、presence、reputationTiers、roster、services、stance、tags、territory、scale |

其餘 generic kind 依 `cards.ts:99–100` 只有通用 kind／family／gradeRange／faction／owner／node／culture 概要，其餘欄位由 raw 承接。

**W01｜怪獸詳情沒有繼承物種的生態與捕獲資訊。規模 M；不需引擎新功能。**

現況：`U/vm/wiki/cards.ts:8–14` 的 `species()` 沒組 behaviors／capture／aiProfile；`:79–89` monster 分支只複製其專用概要與 sections，未複製物種 raw。

例：`C/monsters/sluice-mother-a.json:2–4` 指向閘母；`C/species/sluice-mother.json:46–66` 已有捕獲條件，以及 spawner 的 child、cadence 4、max 2、tether。物種卡可展開 raw 查看，怪獸卡沒有繼承這些資料。

建議修改 `U/vm/wiki/cards.ts` 共用 `species()`，增加生態行為、捕獲條件、AI 策略；`card-builder.ts` 補中文子欄位及部位名解析。

**W02｜11 種分類標題顯示英文 kind。規模 S；不需引擎新功能。**

現況：`U/vm/wiki/kinds.ts:31–32` 的 `kindLabel()` 無映射時回原值；`index.ts:134–137` 用它組分類，影響首頁、側欄及 breadcrumb。

建議修改 `U/vm/wiki/kinds.ts`。可採：

```text
actor→營運角色、affinity→關係規則、file→其他資料、
forces→部隊規則、lane→交通路線、lineage→機系譜系、
model→機型、operation→軍事行動、regions→區域表、
treaty→條約、wterrain→世界地形
```

譯名由領導依既有詞彙定稿，並補分類順序。

**W03｜新部件、機型、天象的重要資訊藏在 raw。規模 M；不需引擎新功能。**

現況：`cards.ts:55–57` 的 component 卡沒列 attrMods／poolMods／layersAdd／resonance／burden；model／omen／calendar 沒專用分支。

建議修改 `U/vm/wiki/cards.ts`、`card-builder.ts`，優先補：

- 部件：屬性／資源修正、附加層、共鳴、負擔。
- 機型：對應機體、製造勢力、價階、出口政策與解鎖條件。
- 天象／曆法：週期、觸發條件、潮級改變與效果資料。

保留 raw 作補充，不需把全部 38 種 generic kind 一次擴成專用卡。

**W04｜主要欄位、徽章與篩選仍露出英文枚舉。規模 M；不需引擎新功能。**

現況：`U/vm/wiki/card-builder.ts:51–55` 的 `value()` 對非引用字串原樣輸出；`cards.ts:133–135` badges、`list.ts:14` 面向選項亦然。

已核對集合：

```text
cls/origin: ancient,bio,mechanical
mode: activated,reaction
slot: armorMount,backMount,cockpit,restraint,sensorMount,
      soulCore,systemMount,weaponMount
scope: layer,mech,part,person
symmetry: asymmetric,bilateral
```

人物 human／soul 亦原樣顯示；`symmetry` 欄名本身缺中文。

建議修改 `U/vm/wiki/card-builder.ts`、`cards.ts`、`list.ts`，按欄位上下文轉譯並共用 registry／labels，不要對所有英文普通文字套全域翻譯。

**W05｜79 筆 model 標題退化成 raw id 尾碼。規模 S；不需引擎新功能。**

現況：`U/vm/wiki/index.ts:45` 以 name→title→id 尾碼命名；`nameEntry():53–66` 只對 species 推導。79 筆 model 都無 name／title，但有 frame 引用，仍顯示如 `anvil-crimson-rivet`。

建議修改 `U/vm/wiki/index.ts` 的 `nameEntry()`，由 model.frame 推導中文機體名，必要時加「機型」辨識；原 ID 保留為次要資料。資料例：`C/world/models/anvil-crimson-rivet.json:2–3`。

**W06｜英文原名已顯示，卻未納入搜尋。規模 S；不需引擎新功能。**

現況：`U/vm/wiki/search.ts:10–20` 的 `searchWiki()` 只搜尋 name／aka／id／tag／summary／body。以 59 筆 nameEn 實際搜尋，**54 筆找不到自身條目**；其餘 5 筆是其他欄位碰巧符合。

例：搜尋「A Breathing Space」找不到「借我一息」，資料在 `C/abilities/m2-relieve-ally.json:3–4`。

建議修改 `U/vm/wiki/search.ts`，加入 nameEn／etymology candidates；若區分命中欄位，再修改 `U/vm/wiki/types.ts:104` 的 SearchField。資料可直接讀已過濾的 entry.data。

### 第 6 題：整體可用性與一致性

**U01｜頂列與日曆月序差一。規模 S；不需引擎新功能。**

現況：`U/ops/vm/snapshot.ts:118` 的日期用 `s.clock.month + 1`，`:144` 的 calendar.month 卻傳原值；`U/ops/dom/tabs.ts:157` 的 calendar painter 直接畫原值。

實際 snapshot 開局頂列為「第 1 蝕月」，日曆標題為「第 0 蝕月」。

建議修改 `U/ops/dom/tabs.ts`，將顯示月序統一加一，並在 `U/ops/vm/types.ts` 註明 month 是從零起算；若選擇在 snapshot 提供顯示字串，另修改 `snapshot.ts`。不可改引擎時間索引。

**U02｜傳聞／可能發生標記未跨頁一致。規模 M；不需引擎新功能。**

現況：

- 詳情卡已正確標示。
- `U/vm/wiki/list.ts:28–30`、`search.ts:25` 不傳 visibility／occurs。
- `U/dom/wiki/pages.ts:101–123` 的列表只畫 grade、summary、tags；`:135–140` 搜尋沒有語意徽章；`:168–175` 年表也不畫傳聞標記。
- `lore:event/hekate-secret` 詳情有傳聞徽章，年表資料有 rumor tag，但年表 renderer 不畫 tags。
- 六個 possible 事件已正確排除年表，分類列表仍沒有「可能發生」提示。

建議修改 `U/vm/wiki/types.ts`、`list.ts`、`search.ts`、`index.ts` 與 `U/dom/wiki/pages.ts`，傳遞並統一顯示語意 badges。

已確認存在、不列缺口的保護：

- 百科無結果與不存在條目有提示：`U/dom/wiki/pages.ts:127,143`、`mount.ts:147–155`。
- 百科快捷鍵有資料驅動說明：`mount.ts:74–87`、`U/vm/wiki/keymap-wiki.json`。
- 戰鬥灰鈕已有原因／快捷鍵 tooltip：`U/dom/panels.ts:52–56,89`。
- 營運灰鈕亦有外層 tooltip：`U/ops/dom/ui.ts:15–40`。
- 不將「所有灰鈕沒原因」或未實測的文字溢出列為缺口。

## 三、沒查到的

1. 未做視覺實測，不能判定實際溢出、窄螢幕布局或 tooltip 遮擋。百科已存在 overflow／overflow-wrap／摘要省略等保護。
2. 未越界讀 rules／sim 實作，因此 B02 的有效移動類別／成本 query，以及 B03 的精確範圍影響格 query 是否已公開，尚未確認。靜態資料說明可直接做。
3. 未查證怪獸動態意圖事件的實際發出條件，不把「當下攻擊意圖未顯示」列為確定缺口。
4. 未查到 nameEn／etymology／possible／rumor 在詳情卡普遍漏顯示；它們已有實作，不能重複派工。
5. 未新增測試或執行完整測試套件。本線以唯讀集合盤點與現有函式輸出驗收，沒有程式變更。
6. 內容可能由其他線持續填充；上述數量為本次工作樹讀取結果，實作時應重跑集合差集。

固定驗收結果：

- 六題各自有小節，每個缺口具來源、建議路徑、規模及引擎需求：完成。
- 全部「大潮」誤用附行號：完成，5 檔／12 行／15 處。
- 第 4、5 題各附資料集合及顯示差集：完成。

## 四、需要決定的事

本次調查無待使用者確認才能完成的事項。接手實作時由領導決定：

1. 聲望先採最小完整 tooltip，或同步增加市場常駐門檻欄；建議先完成 R01 的中文原因與數字。
2. 真正大潮預報的搜尋期限與未找到狀態；需明確設期限，不能假設每蝕月都有大潮。
3. hover 是否統一採「潮行」，以及 11 個百科 kind 的中文譯名。
4. 本線唯讀；以下登記檔只能交回所屬線協調，不得由本線修改。

他線登記檔集合：

```text
src/ui-adapter/vm/controller.ts
src/ui-adapter/vm/types.ts
src/ui-adapter/vm/viewmodel.ts
src/ui-adapter/vm/text.ts
src/ui-adapter/ops/vm/snapshot.ts
src/ui-adapter/ops/vm/types.ts
src/ui-adapter/ops/dom/tabs.ts
```

逐項交集如下；未列入交集的建議修改檔均不在上述登記集合：

| 缺口 | 涉及的他線登記檔（路徑皆在 U/ 下） |
|---|---|
| R01 | `ops/vm/snapshot.ts`；結構化市場欄位另涉及 `ops/vm/types.ts`、`ops/dom/tabs.ts` |
| R02 | `ops/vm/types.ts`、`ops/dom/tabs.ts` |
| R03 | `ops/vm/snapshot.ts`、`ops/vm/types.ts`、`ops/dom/tabs.ts` |
| R04 | `ops/vm/snapshot.ts`、`ops/vm/types.ts`、`ops/dom/tabs.ts` |
| R05 | `ops/vm/snapshot.ts`、`ops/vm/types.ts`、`ops/dom/tabs.ts` |
| B01 | `vm/viewmodel.ts` |
| B02 | `vm/controller.ts`、`vm/types.ts`、`vm/viewmodel.ts` |
| B03 | `vm/viewmodel.ts`；影響格預覽另涉及 `vm/controller.ts`、`vm/types.ts` |
| B04 | `vm/types.ts`、`vm/viewmodel.ts` |
| B05 | `vm/viewmodel.ts`、`vm/text.ts`；獨立稱號欄位另涉及 `vm/types.ts` |
| B06 | `vm/types.ts`、`vm/viewmodel.ts` |
| W01 | 無 |
| W02 | 無 |
| W03 | 無 |
| W04 | 無 |
| W05 | 無 |
| W06 | 無 |
| U01 | `ops/dom/tabs.ts`、`ops/vm/types.ts`；若改 snapshot 顯示契約另涉及 `ops/vm/snapshot.ts` |
| U02 | 無 |

百科的 `src/ui-adapter/vm/wiki/types.ts` 與登記的 `src/ui-adapter/vm/types.ts` 是不同檔案。
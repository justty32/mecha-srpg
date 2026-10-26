# 任務：寫怪獸擴充計畫——盤點缺口並設計 20–30 種新物種（只寫計畫，不寫 base／lore 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭要列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/battle-field.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/specs/world/monsters.md`、`wf/workflows/planning/specs/world/rifts-and-territory.md`、`wf/workflows/planning/specs/world/resistance.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`wf/workflows/planning/design-notes/world/scale.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（框架「海洋與潮汐」與「崩年的底色」）、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/REPORT.md`、`wf/workflows/dispatch/handoffs/lead-resist/REPORT.md`、`content/lore/factions/rift-beasts.json`。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。`wf/workflows/content/` 的 `templates.json`、`engine-facts.json`、`ability-forms.json`、`numeric-bands.json` 用 tabledb 查。

## 背景與唯一目標

使用者：「機甲種類和怪物種類太少了。」現有 20 種 species、32 個 monster（`ls content/base/species content/base/monsters`）。本線要新增 **20–30 種「玩法上不同」的可玩物種**，外加少量 A 級二名個體。你是計畫段（兩段式創作第 1 段）：**盤點、找缺口、設計全部新物種、分批**。產出段由別的工人照你的計畫做，所以 id、檔名、招式 id 要一次定死、全計畫內不重複、不撞既有檔。**你只寫計畫，不寫任何 base／lore 檔。**

## 玩法差異的槓桿（只用現有引擎能力）

- 部位配置（bodyplan）：部位數、`exposure`、層序與厚薄、各層 `resist`（每種至少一個傷害型 resist 0）、單核藏深／多核全滅才死、可破的武器部位、`onBroken`。
- 行為與意圖（aiprofile）：policy 只有 `tactical`／`swarm`／`sentinel`／`flee`／`berserk`，差異靠 params（看 `content/base/aiprofiles/` 全部：如 `guerrilla` 的打帶跑、`sniper-perch` 的定點、`bodyguard` 的護衛、`tide-cultist` 的 berserk）。可新增 `aiprofiles/kx-*.json`（只換參數，不改程式）。
- 能力：照 `ability-forms.json` 選 AI 會用的形態；可新增 `abilities/kx-*`、`effects/kx-*`。
- 資源池：`ap` 上限與回復、`instinct` 的 initial／regen／max（例：本能漲很快的狂暴型、本能很低的冷靜型）。
- 族行為：`spawner`（巢母系，子體族要存在）、`telegraph:true` 全寫；`molt` 只屬掘犬→盾甲，新物種不用。
- 引擎**沒有**：飛行／游泳／潛水的移動規則（`locomotion` 的 flight／burrow 只是登記值、src 沒讀）、水域地形、`territorial`、`partsOverride`、`mutate` 每月重抽。這類玩法用現有能力近似（例：空中＝高閃避＋俯衝招＋地面部位少；深海＝只在岸邊出現的高甲），並在計畫「需要引擎支援」段列成 engine-backlog 候選（項目、影響、建議做法、規模）。

## 方法與禁忌（計畫本身要遵守，也要原樣寫進計畫給產出工人）

- 每種掛到設定：節點／主線（F 線蝕線＝海岸線等）／年表／崩年底色句（1.1–1.13）／既有生態設定（四族、裂縫寬度、大潮）；寫明牠在世界裡為什麼存在、平常在哪裡被看見、誰最常遇到牠。
- 怪獸多從海洋來、環太平洋為主、內陸少；菌絲沿淡水、不靠海；潮汐只是關聯，**不用潮差、潮高推凶度**。
- **對面無臉**：怪獸沒有人格化的指揮者、不談、不怕；怪獸不是畜牲（不寫餵、馴、乖、飼料、獸欄、寵物）。
- 等級不是成長階段（B 不是 C 長成的）；不同級要不同血量就不同 species＋bodyplan。
- **A 級以上才有 `name`＋`epithet`（二名）**，tags 加 `named`；B 以下不寫。S 級不新增（萬潮葬王與既有 S 不動）；SS／SSS 不做。四族框架照舊；第五族不開（可以有「異形」裡的新形態）。
- 數值**照同級暫填，不做平衡**（使用者：後期再調）：HP、屬性、傷害、AP 照 `bio-monsters.md` 與 numeric-bands 帶，同級對照既有檔。
- 不新增 registries 值；不寫 `territorial`、`molt`、`partsOverride`、`attrMods`、`extraAbilities`。
- 不拿其他作品類比（含設計理念段）；**中文命名避免直譯**（兩步命名：先想英文原名與意涵，再取中文；避「～者」字尾、避撞既有詞義，例：纏足）；潮→蝕（世界觀詞）；物種名二到三字為主（潮狼、掘犬、鏡肢、群喉、抱樁、礁背）；招式名寫動作與畫面，不寫生物學名詞。所有新名詞標「提案」。
- 不碰萬潮葬王（`monster/tidespine-chittagong`、`species/tidespine`）；桑托斯灣區核心留白。

## 計畫必含（照這個順序）

1. **已讀清單**。
2. **盤點**：現有 species 逐種一行（族、等級、bodyplan 特徵、AI profile、招式形態、生態位）；接著**族×等級矩陣**（四族 × D／C／B／A，格內列物種）與**生態位矩陣**（海岸、港口、河口、深海、空中、淡水／內陸、地下等 × 四族）；玩法差異現況一段（哪些物種其實玩起來一樣）。
3. **設計理念**：五到八句——這次怎麼讓「種類多」變成「玩法多」。
4. **缺口矩陣**：上面兩個矩陣標出缺口與本計畫填進去的新物種。目標：每族 D／C／B／A 每格至少 2 種（菌絲 D–A 可例外但要說理由）、每個生態位至少一族有、群體型與單體型都有、至少一條新的巢母系升級鏈（新 spawner 與其子體族，子體可以是新物種）。
5. **新物種表**：20–30 種，每種：id（`species/英文kebab名`，先 `ls` 避免撞名）、英文原名＋意涵、中文名（兩個備選，首選在前）、族、`gradeRange`、生態位、群體或單體、**一句定位**（戰場上玩家看到什麼不同）、掛點（哪段設定／底色句／主線，一句為什麼）、bodyplan 摘要（部位、層、resist 0 在哪、核位置與 exposure）、各級屬性與 HP 總量、pools 特徵、AI profile（既有 id 或新 `aiprofile/kx-*` 並列 params）、能力 1–3 招（id、形態、AI 戰術鍵、傷害、AP、cooldown）、新效果（若有）、capture 寫法（可捕族）／`harvest-only`（菌絲）、要的 monster 檔（每個 gradeRange 級一個 `monster/物種名-d` 這種格式（級用小寫））。
6. **二名個體**：3–6 隻 A 級新二名（掛在新 A 級物種上），每隻：monster id、俗名、二名（四字為主，「牠做過的事＋牠的樣子」）、出沒地點、掛點。其中至少一隻在美洲太平洋岸（西雅圖或瓦爾帕萊索一帶），供基調修正線寫 lore 用。
7. **lore 計畫**：新物種的世界觀文字放 `content/lore/` 的**新檔**（`events/` 或 `places/`，一檔可涵蓋 2–4 種，合計 ≤ 10 檔），每檔：id、類型、涵蓋哪些物種、掛點、年表條目建議（`timeline.json` 只插入）。**不改任何既有 lore 檔**（`rift-beasts.json` 等由別線持有）。
8. **營運接入**：每種要加進哪個 `content/base/world/rifts/` 下該族的檔 的 `monsters`（D／C 再看要不要進 `vanguard`）；需不需要新的 `world/encounters/rift-*`；這些由領導做，你只建議。
9. **分批**：切成 4–6 批（`kj2-01`…），每批 4–6 種、檔案 ≤ 45、一批內盡量同族；每批列出**完整檔案清單**（路徑＋範本檔）。每種的標準套件：`species/`、`bodyplans/`、`frames/bio-物種名`（可捕族）、`frames/corpse-物種名`（可捕族）、`monsters/`（每級一檔）、`abilities/kx-*`、需要時 `effects/kx-*`、`aiprofiles/kx-*`；lore 新檔集中到最後一批或分散到各批都可，寫明。每批再各配 1 個展示情境 `scenarios/kj2-01-demo.json` 這種格式（可選，讓 MCP 載得到新獸）。
10. **需要引擎支援**：engine-backlog 候選列，及本計畫用什麼近似。
11. **需求與待決**：需要領導或使用者決定的事。

## 產出

- `plan.md`（≤ 45 KB）。
- `roster.json`（wf-table/1）：`{"contract":"wf-table/1","source":"plan.md","extracted":"2026-10-26","columns":["id","nameZh","nameEn","family","grades","niche","group","role","hook","bodyplan","aiprofile","abilities","effects","monsters","batch"],"rows":[...]}`，每個新物種一列（陣列欄用 `;` 分隔字串）。
- `review-draft.json`（wf-table/1）：columns `["檔","類別","名稱","白話","掛到"]`，每個新物種一列（以 species 檔代表）、每隻二名一列、每個 lore 新檔一列；「白話」一到兩句、**不超過 60 字**。

## 範圍（排除法寫死）

- 只寫三個檔，都在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/`：`plan.md`、`roster.json`、`review-draft.json`。
- 不做：任何 `content/` 檔、manifest、index、src、test、wf 其他檔；不 commit。
- 件數 gate：新物種超過 30 種就刪到 30；少於 20 種就補到 20。容量 gate：plan.md 超過 45 KB 就精簡到以內；超過 60 KB 停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 資料檔 grep 關鍵詞`（或 `find k=v`） | 查 `templates.json`、`numeric-bands.json`、`ability-forms.json`、`engine-facts.json`、`wf/workflows/planning/specs/world/monsters.json`、`wf/workflows/planning/design-notes/world/history-timeline.json`，不整份讀 |
| `grep -rn 關鍵詞 /home/lorkhan/repo/game_dev/mecha-srpg/content` | 查名字撞不撞、既有寫法 |
| `ls /home/lorkhan/repo/game_dev/mecha-srpg/content/base/{species,monsters,bodyplans,abilities,effects,aiprofiles,frames}` | id 不撞名 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj2-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上列三個檔；其餘全部唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意（盤點可交一個），它也要親讀 AGENTS.md 與 content 工作流入口；只准寫你的三個產出檔以外的 `/tmp/cx-kj2-plan/` 草稿。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj2-plan --up PROGRESS '已讀完先讀清單，開始盤點' < /dev/null`）。
2. 盤點（第 2 段）。
3. 設計與分批（第 3–11 段）、寫 roster.json、review-draft.json。
4. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md` |
| 物種表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/roster.json` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/review-draft.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 4 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–11 段。
2. roster.json、review-draft.json 是合法 JSON；roster 20–30 列，id 全計畫內不重複、不撞既有檔。
3. 新物種表裡 0 個 B 級以下的 `name`／`epithet`、0 個新 registry 值、0 個 `molt`／`territorial`、0 個 S 級。
4. review-draft 每列「白話」≤ 60 字。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj2-plan`。本線團隊：`teams/kaiju2`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj2-plan --up DONE '怪獸擴充計畫完成：N 種、M 批' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-kj2-plan` 屬 `teams/kaiju2`）。

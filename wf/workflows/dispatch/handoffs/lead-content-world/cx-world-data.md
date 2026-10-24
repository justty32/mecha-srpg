# 任務：新增營運資料 66 檔（遭遇 15、契約模板 11、命名表 22、科研 15、市場 3）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、**本線護欄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/engine-rules.md`（契約，逐條照做）**、`content/lore/style.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`data-model-factions-contracts.md`、`data-model-economy-research.md`、`data-model-world-map.md`（同資料夾）、`src/ops/state/types.ts`（`EncounterDef`、`ContractTemplate`、`NamesDef`、`ResearchDef`、`MarketDef` 的真實型別）、`wf/workflows/planning/specs/world/` 的 `factions.md`、`machine-souls.md`、`monsters.md`、`ruins-and-ancient.md`、`rifts-and-territory.md`，以及 `wf/workflows/planning/design-notes/mechs.md`（機械系命名三階、古代機神話命名）、`design-notes/bio-mechs.md`（登記號／小名／凶名／二名）、`design-notes/world.md`（2026-10-24 獵團＝傭兵、參戰型契約、勢力外交）——**親自讀，不靠本交接書的摘要**。範本：`content/base/world/encounters/insect-deep.json`、`contracts/clear.json`、`names/mythic-bengal.json`、`names/nick-beast.json`、`research/restraint.json`、`research/soul-heart.json`、`markets/chittagong.json`。

## 背景與唯一目標

營運層的資料表幾乎是空的。唯一目標：補齊下表五類資料，全部通過檢查；其中遭遇與契約是「休眠交付」（引擎現在不會抽到，等頂層決定接線），命名、科研、市場是戰役裡立即可用的。

## 範圍（排除法寫死）

- 只做：新增下列資料夾的新檔：`content/base/world/encounters/`、`contracts/`、`names/`、`research/`、`markets/`（都在 `content/base/world/` 底下）。
- 不做：改任何既有檔（尤其 `contracts/{clear,seal}.json`、`markets/{chittagong,dhaka}.json`、`names/nick-*.json`、`names/mythic-bengal.json`、`research/*.json` 既有兩檔）；`events/`、`dialogues/`、`backgrounds/`、`recruit-pools/`（別的工人）；`nodes/`、`routes/`、`rifts/`、`factions-ops/`、`actions/`、`jobs/`、`campaign-start/`；`src/`；`content/` 其他地方；spec；`content/lore/`。
- 件數 gate：新檔超過 72 個就停下回報；容量 gate：單檔超過 6 KB 就停下回報。任一觸發都停。

## 內容配方

**遭遇 15**（id 規則見 engine-rules 第四節）：
- 裂獸 9：`rift-beast-{shallow,deep,core}`、`rift-alien-{…}`、`rift-mycelium-{…}`；family 用 `beast`／`alien`／`mycelium`；`terrainMix` 用該族地貌（獸族 `terrain/mineral-waste`、異形 `terrain/shard-mirror`、菌絲 `terrain/mycelium-mat`／`terrain/spore-bloom`，可混 `$node`、`terrain/erosion` 等已 commit 地形）；`budgetByGrade` 量級：淺 `{D:2,C:1}`、深 `{D:2,C:2,B:1}`、核 `{C:2,B:1}` 上下微調；`size` w 10–16、h 16–24；核層 `anchorHere:true`，其餘 false。可選填 `map` 指向已 commit 的 `content/base/maps/*`（`git ls-files content/base/maps`）。
- 人類對手 6：鐵砧獵團搶屍、鹽鷗獵團伏擊撿殘骸、潮信會解拘者、塞勒涅白手套「稽核」、殘聯蝕線檢查哨翻臉、背面走私船；family 自訂字串（`rival-hunters`、`tide-faith`、`selene`、`league`、`smuggler`）；各配一張主題相符的已 commit 地圖（`map` 欄）；`budgetByGrade` 照同量級。REPORT 記「encounter 型別目前只生成裂獸，人類對手需要 roster 欄」SPEC-GAP。

**契約模板 11**（全部休眠；規則見 engine-rules 第四節）：清剿（大潮前清巢，`clear`）、封印（守錨 `seal`，hold 6 輪）、收復地盤（`reclaim`）、守城（`defend`，survive）、護送（`escort`；主目標 survive＋optional escort）、偵察（`scout`；survive 少輪數）、奪回遺物（`survey` 或 `reclaim`；主目標 eliminate＋optional reachExit）、參戰型（**加入勢力作戰**：用 `stages` 兩到三段、`pay.perHead`、`bonus`，`supplies` 列空陣列並在 REPORT 寫「戰中友軍與勢力補給需要型別支援」的 SPEC-GAP；kind 用 `defend` 或 `clear`）、獵殺二名怪（`clear`，主目標 eliminate＋optional killTarget `{"tags":["epithet"]}`，報酬高、`requiresRep` 高）、處理同業（`rival`）、走私上月（`smuggle`，`issuerKinds` 含 `company`）。每份 `onComplete`／`onFail`／`onCancel` 都要寫（`{"rep":{"issuer":±N}}`、可加小額 `ledger` 獎金或旗標），`annoyanceMax` 2–4，`advanceMax` 0.2–0.5。

**命名表 22**：
- 古代機神話名 `names/mythic-{文化}` **10 個文化**：`norse`、`greek`、`egypt`、`han`、`yamato`、`mesopotamia`、`celt`、`nahua`、`quechua`、`polynesia`（`culture` 欄同後綴）。每檔 `names` ≥12 個中文音譯或意譯神祇／神獸／神器名，`epithets` 3–6 個中二稱號尾綴（如「之殼」「・不沉者」「第二次醒來」）。
- 機械系詞庫 4（culture 值 `mech-*`，不得與 mythic 撞）：`names/mech-codes`（D 級代號，如「犁」「K-9」）、`names/mech-series`（A–C 級系列名：器物、鳥獸、神話）、`names/mech-highgrade`（高階中二名，如「幽冥鐵騎」「白夜」）、`names/mech-selene`（塞勒涅型錄體＋希臘神話；`epithets` 放型號尾綴如「-II型」「V4」）。每檔 ≥16 名。
- 生物系詞庫 8：`names/dread-{insect,beast,alien,mycelium}`（凶名：外人給的難聽名，每檔 ≥12）、`names/epithet-{insect,beast,alien,mycelium}`（A 級以上二名，魔物獵人式，每檔 ≥10，如「赤眼兇星」「千囊房東」）。culture 值用檔名本身（`dread-insect`…）。

**科研 15**：機魂天賦三向各 3 項（`soul-calc`：解鎖 `calc-1`→`calc-2`→古代樹 `hunter-*`；`soul-hand`：`hand-1`→`solo-*`；`soul-heart`：`sentinel-*`→`feral-*`，用 `requires` 串、`requires` 指向既有 `research/soul-heart` 也可），其餘 6 項：拘束（`restraint` 方向，接在既有 `research/restraint` 之後）、屍體改裝與鍛研（解鎖已 commit 部件，如 `component/reaper-scythe-graft`、`component/composite-plate`、`component/shell-shard-lens`、`component/heat-lance`）、刻痕翻譯（`shell`）、裂晶精煉（`unlocks` 可用 `service` 指 `service/medbay` 之類既有服務）等。名稱照 style.md 用語（鍛研、術式、公刻…）；文字裡寫明「心」向深處的節點才會長出個性、而那很罕見。成本量級：coin 280–3000、techHours 40–240，深的貴。

**市場 3**：`markets/singapore`（新加坡渡輪港，塞勒涅型錄、密封艙語感、貴；可放 `ammo` 列 `ammo-30` basePrice 3）、`markets/salt-flat`（鹽灘的鹽鷗獵團交易點，收屍料、賣廢料與二手部件，`buysBack:true`，不放 `ammo`）、`markets/old-array`（舊陣列遺跡外的殼學會攤位，賣 `component/shell-shard-lens` 之類、收甲殼，不放 `ammo`）。品項只用已 commit 的 `component/*`（`git ls-files content/base/components`）與 `stock:scrap`／`stock:flesh`／`stock:chitin`／`stock:fuel`；basePrice 量級對照 chittagong（部件 300 上下 0.8–2.5 倍、scrap 8、fuel 2），`priceMods` 照範本 `[{"tag":"besieged","mult":1.5}]`，`refreshOn:"quarter"`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-world-data --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-world-data --up …` | 上線 PROGRESS 與終局回報 |
| `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world` | 每類寫完；末行 `OK` |
| `node src/ops/content/check.ts content/base` | 每類寫完；末行 `OK 0 errors` |
| `git ls-files content/base/{資料夾}` | 查「已 commit」的引用對象（未 commit 的別線檔不准引用） |

## 資源與禁區

- **可寫程式碼線**（本線只寫內容資料檔）：只寫「範圍」列的路徑、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-data/` 與 `/tmp/cx-world-data/`；可跑上表指令與 `npm run check`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；**不 commit**（commit 由領導做，你只回報改了哪些檔）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不跑 `npm test`（領導在外面跑）。

**分清錯誤來源**：工具或環境出錯（權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的腳本出錯 → 自己修。

## 工作

1. 上線發 PROGRESS。
2. 依序寫命名表 → 科研 → 市場 → 遭遇 → 契約；每類寫完跑 lint 與 check。
3. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-data/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 資料 66 檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/{encounters,contracts,names,research,markets}/`（新檔） |

REPORT 四段（做了什麼／產出（每檔一行：id、一句定位；契約另列 kind、目標、報酬式；科研另列方向、成本、解鎖、前置）／沒做到或證據不足的（SPEC-GAP 逐條）／需要決定的事（例：哪些契約該接到哪個勢力的 contractKinds 與行動牌）），末尾「以後交接書該點名的工具」。另附「最得意的 3 件」各一句。

## 驗收（固定 3 條，做完就停）

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world` 末行 `OK`。
2. `node src/ops/content/check.ts content/base` 末行 `OK 0 errors`（別線未提交檔造成的錯誤要在 REPORT 逐條指出不是你的檔）。
3. `git status --short content/base/world` 中本線只有上述五個資料夾的 `??` 新檔，沒有 ` M`；件數 encounters 15、contracts 11、names 22、research 15、markets 3。

## 失敗怎麼處置

- 測出來是壞的 → 修到綠；修不好就移除該檔並在 REPORT 記；全部做不出才發 `FAILED`。
- 測不出來（沒跑成）→ 不回滾，發 `BLOCKED`，寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-world-data`。本線團隊：`teams/content-world`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-world-data --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-data/REPORT.md`。
- 結束時必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

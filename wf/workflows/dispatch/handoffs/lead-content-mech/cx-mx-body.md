# 任務：照設計清單寫機械系 bodyplans 11、frames 30、機體內建能力 13、效果 6、aiprofile 2

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`；內容契約親自讀 `content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-mech.md`、`wf/workflows/planning/specs/core/data-model-abilities-effects.md`，型別真相是 `src/core/types-def.ts`。世界觀只需讀 `wf/workflows/planning/specs/world/setting.md` 的「十分律」與「為何 2108 還用機甲」兩節、`wf/workflows/planning/design-notes/mechs.md` 末三段、`wf/workflows/planning/design-notes/world.md` 末段（太空歌劇風格）。

> 領導 `lead-content-mech` 寫給 codex 工人 `cx-mx-body`。**交接書是唯一契約**：沒寫的授權等於沒有。

## 背景與唯一目標

機械系（摹機）內容大擴充。領導已把每一筆要寫的檔的 id、名字、數值、描述寫進設計清單 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/manifest.json`（wf-table/1；欄 id／kind／worker／name／grade／lineage／role／design／era／prev／loadout／universal）。讀法：`python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/manifest.json find worker=cx-mx-body`，另讀 `find kind=style` 與 `find kind=lineage`（共用的用語與血統規則）。唯一目標：**把清單裡 worker=cx-mx-body 的每一筆寫成一個合法的內容檔**，`npm run check` 0 errors。

## 範圍（排除法寫死）

- 只做：`content/base/bodyplans/mx-*.json`、`content/base/frames/（清單 id 的 name 段）.json`、`content/base/abilities/mx-*.json`、`content/base/effects/mx-*.json`、`content/base/aiprofiles/mx-*.json`——**只限清單裡 worker=cx-mx-body 的那 62 筆**。檔名＝id 的 name 段＋`.json`，2 空白縮排、UTF-8、結尾換行。
- 數值、名字、描述以清單為準；清單沒寫的必填欄照範本檔補合理值。清單 design 欄裡給人看的敘述（例如「十二年才摹出這一擊」）**不進 JSON**（schema 沒有描述欄），只有 name 進。
- 清單若和 schema／引擎衝突（欄位不存在、引用不存在、某寫法 check 報錯），**以能通過 check 的最接近寫法為準**，在 REPORT「偏離清單」表逐條寫（id、清單寫什麼、你寫了什麼、為什麼）。不要為了湊清單去改 `src/` 或既有檔。
- 用語：若 `/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/README.md` 或 `content/lore/style.md` 已存在，讀其「風格與用語」節；name 與清單衝突時照清單（清單已按太空歌劇改過），只在 REPORT 記你覺得該改的名字。
- 不做：清單其他 worker 的列；任何既有檔（`content/base/` 裡不是你新建的檔一律不改）；`content/base/registries/`、`rules/`、`world/`、`scenarios/`、`maps/`、`persons/`、`species/`、`monsters/`；`src/`、`schemas/`、`test/`、spec、`wf/`（你自己的 REPORT 除外）；不 commit。
- **bodyplan**：照 `content/base/bodyplans/biped-standard.json` 的形狀（parts／layers／slots／functions／onLayerBroken／onBroken／conduct／seats，symmetry 可選）。每部位最外層 `structural:false`、最內層 `structural:true`。座艙部位要有 `cockpit` 與 `core` function、`seats`、cockpit-shell 的 conduct（照 biped-standard）。槽 id 用清單寫的（cockpit、soul-core、armor-mount、armor-mount-2、system-1、system-2、sensor-mount、left-weapon、right-weapon、main-gun、back-1、back-2），槽 type 用 registries/slot-types.json 已有的值（`backMount`、`systemMount` 已登記）。清單的 HP 是目標總和，誤差 ±5%。
- **frame**：`cls:"mechanical"`、`repairPolicy:"repair-or-replace"`；pools 照清單（heat 池照 `frames/moji-tern.json` 加兩條過熱帶 effect/overheat-1、overheat-2，按 max 等比例換算 from/to；charge 池 `capKind:"hard"`、`initial`＝max）；tags 照清單＋`mech`、`human`（`selene-*` 與 `soul-driven` 的不加 human）＋移動方式（hover／flight／track，沒寫就不加，預設 leg）。**frame 沒有裝配欄**：清單的 loadout 欄你不寫進 frame，但要確認 loadout 每個 slot id 存在於該 frame 的 bodyplan、且 slot type 與部件的 slot 相符（部件由 cx-mx-arms／cx-mx-sys 寫，清單的 design 欄有 slot；檢查方式見工作第 3 步）。
- **ability／effect／aiprofile**：照 `abilities/burst-30.json`、`effects/shard-marked.json`、`aiprofiles/glove-line.json` 的形狀。`effect/mx-staggered`、`effect/mx-burning` 由 cx-mx-arms 寫，你只引用。aiprofile 的 params 鍵只用 `src/ai/` 裡真的有讀的（grep `params.`）。
- 件數 gate：新建檔超過 67 個就停下回報；容量 gate：新建檔合計超過 400 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/manifest.json find worker=cx-mx-body` | 第 1 步讀你的清單 |
| `npm run check`（在 `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每寫完一類檔跑一次；末行要 `OK 0 errors` |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-mx-body --once` | 每完成一個工作步驟跑一次，讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給檔案） |

## 資源與禁區

- **可寫程式碼線**（只寫內容檔）：只寫「範圍」列的路徑與你的 REPORT；可跑 `npm run check`、`node`、`python3`。**不要 commit、不要 `git add`**：commit 由領導做；你在 REPORT 列檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git add`／`git commit`；不 `rm` 任何檔（寫錯就用單一 Update 整檔覆寫）；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；子代理上限 0 個；不上網。同時有別的工人在同一個 repo 寫別的檔：`npm run check` 若只因**別人的檔**報錯（錯誤路徑不是你建的檔），不算你的失敗，在 REPORT 記一行即可；`effect/mx-staggered`、`effect/mx-burning` 等跨工人引用若對方還沒寫完而報「引用不存在」，也照此處理。

**分清錯誤來源**：沙箱拒寫、node 跑不了 → 發 `BLOCKED`；你自己的 JSON 寫錯 → 自己修。

## 工作

1. 讀清單（你的列＋style＋lineage）與範本檔；上線發 PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-mx-body --up PROGRESS 'cx-mx-body 上線，開始寫 62 筆' < /dev/null`。
2. 逐類寫檔，每類寫完跑 `npm run check`、`inbox_poll.sh cx-mx-body --once`。
3. 自查：用一支臨時 python（放 `/tmp/cx-mx-body-check.py`，不進 repo）確認——你清單的每個 id 都有檔；每個檔的 id 等於清單 id、name 等於清單 name；每台 frame 的 loadout 欄每個 `slot:component` 的 slot id 存在於其 bodyplan，且（若該部件檔已存在）部件 slot type 等於槽 type、部件 size ≤ 槽 size；每個 bodyplan 各部位層 HP 總和與清單目標差 ≤5%。結果貼進 REPORT。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/cx-mx-body/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/`（範圍列的子目錄）|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/cx-mx-body/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加附表「偏離清單」（沒有就寫「無」）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 清單 worker=cx-mx-body 的 62 筆，每筆在 `content/base/` 有對應檔，id／name 與清單一致（領導重算）。
2. `npm run check` 對你建的檔 0 errors（領導重跑）。
3. `git status --short` 裡你新增的檔都在「範圍」列的路徑內，且沒有改任何既有檔。
4. REPORT 存在且有四段＋「偏離清單」附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（check 報你的檔錯、修不好）→ 保留檔案，發 `FAILED`，REPORT 寫錯誤原文。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mx-body`。本線團隊：`teams/content-mech`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-mx-body --up DONE|BLOCKED|FAILED（擇一） '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/cx-mx-body/REPORT.md`——它會依團隊名冊送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

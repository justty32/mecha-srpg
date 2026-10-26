# 已讀清單

以下均由 cx-rn-15 親自讀取；相對路徑以隔離 worktree 為根。

- `AGENTS.md`（實讀主 repo：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`（用 `python3 wf/tools/tabledb.py … find 類別=…` 分別讀完古代機、機甲、蝕、專有名詞、保留五類）

另讀 `wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/dispatch/lessons.md`，及 world-pillars 的 world、mechs、bio-battle 入口與 tone-and-rules、ancient 子檔。

## 做了什麼

完成 rename-15：逐一檢視指定 18 檔，修改 8 檔、10 處詞句；另外 10 檔只有應保留的用語。只改 7 個 `brief` 與 1 個 `lines` 字串，原意、人物、事件走向、id、引用、數值、鍵與陣列長度不變。未 commit。

產出位於 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-15/`。暫存紀錄在 `/tmp/cx-rn-15/`。

固定五條驗收結果：

1. `git status --short` 只有以下逐檔對照中 8 個修改檔與原有 `?? node_modules`。件數未超過 18；各檔容量增幅 0–0.1352%，未觸及 20% 門檻。
2. `npm run check` 與 `node src/ops/content/check.ts content/base` 本次執行的末行均為 `OK 0 errors, 8 warnings`。警告都指向範圍外怪獸的 capture layer HP differs。完整輸出分別存 `/tmp/cx-rn-15/check.log`、`/tmp/cx-rn-15/ops-check.log`。依交接書未跑 `npm test`，未加驗其他測試。
3. 已執行指定的 `git -C <worktree> grep -nE '殼|摹|潮|鞘' -- content`，再逐一檢視本批 18 檔命中；每處理由見下。這 18 檔均無「古機」「蝕盛」「蝕歇」「原鞘」。
4. 以下對照涵蓋全部 18 檔，包含未修改者。
5. 開頭已讀清單包含「先讀」指定的全部路徑。

## 逐檔對照

### content/base/scenarios/beachhead-landing.json

未修改。「潮冠登岸」「趁潮登岸」保留，理由見殘留。

### content/base/scenarios/beast-stampede.json

未修改。「潮狼群」保留。

### content/base/scenarios/convoy-run.json

`brief`：「護送兩台車隊摹機抵達出口」→「護送兩台車隊衍型機抵達出口」。

### content/base/scenarios/crater-three-way.json

`brief`：「獵團、白手套與潮信會解拘者」→「獵團、白手套與沐蝕會解拘者」。

### content/base/scenarios/cx3-flyingfish-shoal.json

未修改。「退潮留名」「鐮肢正在渡潮」保留。

### content/base/scenarios/delta-four-way.json

未修改。「四冠映潮」「潮汐廢墟」保留。

### content/base/scenarios/ix-common-road.json

未修改。「蝕潮退去後」已是定案用語。

### content/base/scenarios/lunar-blockade-run.json

`brief`：「獵團的新摹機成了白手套的獵物」→「獵團的新衍型機成了白手套的獵物」。

### content/base/scenarios/mirror-survive.json

未修改。「仍困在殼裡的命」保留。

### content/base/scenarios/rift-edge-nest.json

未修改。「在獸潮裡撐過三十輪」保留。

### content/base/scenarios/shell-excavation-escort.json

`brief` 兩處：「護殼學會的學者」→「稽古學會的學者」；「帶著古殼經卷撤離」→「帶著古代機經卷撤離」。

### content/base/scenarios/siege-beetle-convoy.json

`brief`：「保住兩台車隊摹機」→「保住兩台車隊衍型機」。

### content/base/scenarios/skirmish-whitegloves.json

`brief`：「擊潰攔路摹機」→「擊潰攔路衍型機」。

### content/base/scenarios/tidal-flat-evac.json

未修改。「潮神喉・歸舟誓」「獸潮踏上潮神喉」「留給漲潮」保留。

### content/base/scenarios/unbound-raid.json

`brief` 兩處：「潮信會解拘者前來奪獸」→「沐蝕會解拘者前來奪獸」；「新生蟲群也循潮而至」→「新生蟲群也循蝕潮而至」。

### content/base/world/dialogues/ilse-brandt-hull-oath.json

未修改。「船殼縫隙」保留。

### content/base/world/dialogues/mitali-das-wake-call.json

未修改。「防潮燈」保留。

### content/base/world/dialogues/yusuf-demir-exit-map.json

`topics[0].lines[0]`：「殼紋背面全是退路」→「古紋背面全是退路」；選項中的「耐潮紙」保留。

## 殘留

以下列出指定 grep 在本批檔案中的每處命中。表列 index 指 `terms-rename.json` 經 tabledb 回傳的 index；規則號指交接書。

- `beachhead-landing.json` 第 3 行 `name`「潮冠登岸」：保留 index 65 明列的海洋意象專名；第 4 行 `brief`「趁潮登岸」：登岸船隊利用海潮，規則 3 海洋本義、保留 index 64。
- `beast-stampede.json` 第 4 行 `brief`「潮狼群」：保留 index 65 的「潮狼」。
- `cx3-flyingfish-shoal.json` 第 3 行 `name`「退潮留名」：保留 index 64、68 的「退潮」；第 4 行 `brief`「鐮肢正在渡潮」：對岸、鹽霜與淺灘語境指涉渡過海潮，規則 3、保留 index 64；不是地月渡輪「渡潮船」。
- `delta-four-way.json` 第 3 行 `name`「四冠映潮」：保留 index 65 明列；第 4 行 `brief`「潮汐廢墟」：保留 index 64 的「潮汐」。
- `ix-common-road.json` 第 4 行 `brief`「蝕潮退去後」：index 28 的定案新詞，規則 3；其中「潮」是新詞的一部分，無舊稱殘留。
- `mirror-survive.json` 第 4 行 `brief`「仍困在殼裡的命」：前句與部署明確是生物機／死體機（`frame/bio-reaper`、`frame/corpse-reaper`），此殼是蟲體甲殼，非古代機；規則 2、保留 index 63 的蟲殼／非古代機外殼本義。
- `rift-edge-nest.json` 第 4 行 `brief`「獸潮」：保留 index 66。
- `tidal-flat-evac.json` 第 3 行 `name`「潮神喉・歸舟誓」及第 4 行 `brief`「獸潮踏上潮神喉」中的「潮神喉」：保留 index 65 的「潮神（潮灘地形）」；第 4 行同句「獸潮」：保留 index 66；同欄「留給漲潮」：保留 index 64、68 的「漲潮」。
- `unbound-raid.json` 第 4 行 `brief`「循蝕潮而至」：本次依 index 28、規則 3 換妥的新詞，無舊稱殘留。
- `ilse-brandt-hull-oath.json` 第 18 行 `topics[0].lines[0]`「船殼縫隙」：保留 index 63 的「船殼」。
- `mitali-das-wake-call.json` 第 31 行選項 `text`「防潮燈」：防潮濕用品，規則 3 海洋／氣象本義、保留 index 64 的「潮濕」。
- `yusuf-demir-exit-map.json` 第 31 行選項 `text`「耐潮紙」：耐潮濕用品，規則 3、保留 index 64 的「潮濕」。

其餘六檔（convoy-run、crater-three-way、lunar-blockade-run、shell-excavation-escort、siege-beetle-convoy、skirmish-whitegloves）無指定舊字命中。全部 18 檔均無「摹」「鞘」殘留。

## 沒做到或證據不足的

無交接範圍內未完成事項。兩項檢查有 8 則範圍外怪獸 HP 警告，沒有錯誤；未對警告另作修改或擴大驗收。領導的後續閘門與 `npm test` 由領導執行，本報告不宣稱已跑。

## 需要決定的事

無需使用者補充決定。兩處非逐字表列的寫法已按授權處理，供領導複核：

- 「護殼學會」對應情境的 `faction/shell-society`，統一成 index 4 的「稽古學會」，不保留多餘「護」字而造另一個組織名。
- 「古殼經卷」依規則 2、index 0 改成「古代機經卷」，保留經卷與古代機的關聯，不另造專名。

沒有另造表外專名，也沒有發現需另外提出的明顯翻譯腔名字；換詞句子未作無關改寫。

## 子代理

未使用子代理；額外子代理成本為零。全部判讀、改字與驗收由 cx-rn-15 親自完成。

## 以後交接書該點名的工具

無。

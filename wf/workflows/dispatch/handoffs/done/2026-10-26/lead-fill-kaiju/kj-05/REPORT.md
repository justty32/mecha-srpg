# 已讀清單

本線 cx-kj-05，2026-10-26。親讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/playtest.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/cx-kj-05.md`。後兩個交接／計畫路徑未包含於 worktree 快照，實際親讀主 repo 的 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/cx-kj-05.md`，沒有在 worktree 複製或補建。

`wf/workflows/content/` 其餘檔也親讀：`mechs.md`、`ancient-people.md`、`battle-field.md`、`ops-content.md`、`lore-text.md`、`acceptance-playtest.md`；`templates.json`、`numeric-bands.json`、`engine-facts.json`、`ability-forms.json`、`playtest-baselines.json` 依 tabledb 條件／分段查讀；`tools/stats.ts` 只讀未執行。world-pillars 的 `world.md`、`mechs.md`、`bio-battle.md` 與其全部八個葉檔均讀過。

補讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/data-files.md`、`wf/workflows/dev-env.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/dispatch/lessons.md`。計畫第 6 段七個範本均親讀：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-cliffjaw.json`、`content/base/frames/bio-tidewolf.json`、`content/base/frames/corpse-tidewolf.json`、`content/base/monsters/tidewolf-d.json`、`content/base/abilities/bite.json`、`content/base/abilities/kx-ground-stomp.json`；主 repo 的 `kj-05-plan/review-draft.json` 透過 tabledb 讀取。

# 做了什麼

依已審計畫第 5、6 段新增恰好七個 base 檔，未修改既有檔、未 commit。採首選「礁背」（提案），D 級獸族、四部位單核、總層 HP 180、全身 pierce 抗性 0，沿用 pack-hunter。野生個體、活捕機體、屍體機體共用骨架與兩招；數值同級暫填，未做平衡。

掛點照計畫第 4 段：海洋與潮汐裁示對應環太平洋近岸舊港及隨漲潮上岸，不以潮差解釋凶度；底色 1.4「糧」對應回收隊／運精粹獵團經過卸貨口，1.5「空城」對應被棄港區外緣而非把空城全改蝕域；F 線「築牆／守線」對應清理海岸通路的日常。牠是獨立 D 種，對面無臉，不是高級獸的幼體。

# 產出

以下七檔均在 worktree 的 `content/base/` 下，每行為路徑、id、定位與掛接。

- `species/breaksurf.json`：species/breaksurf；D 岸獸；接骨架、兩招、拘束與 AI。
- `bodyplans/quadruped-breaksurf.json`：bodyplan/quadruped-breaksurf；四部位；供物種及兩機體。
- `frames/bio-breaksurf.json`：frame/bio-breaksurf；活捕；接 capture，burden 2。
- `frames/corpse-breaksurf.json`：frame/corpse-breaksurf；屍體改裝；同骨架，burden 0。
- `monsters/breaksurf-d.json`：monster/breaksurf-d；野生 D；接物種，僅四鍵。
- `abilities/kx-breaksurf-gore.json`：ability/kx-breaksurf-gore；單體拱擊；接物種及兩機體。
- `abilities/kx-breaksurf-roll.json`：ability/kx-breaksurf-roll；鄰格 ball；接物種及兩機體。

報告目錄含 `naming.json`（六個顯示名，均標提案，留英文意涵與中文兩步命名）、`review.json`（沿 review-draft 的一列，白話 39 字）、本 REPORT。scratch／原始指令輸出均在 `/tmp/cx-kj-05/`。

# probe 與參照數字、超帶欄位與理由

執行 `npm run content:probe -- monster/breaksurf-d monster/tidewolf-d monster/mite-d --n 5 --json /tmp/cx-kj-05/probe.json`，exit 0。三組均使用預設同級對手 `frame/bulwark-i ×2`，seed 1–5、20 輪上限、預設允許撤退。原始輸出 `/tmp/cx-kj-05/probe.log`、結構化結果 `/tmp/cx-kj-05/probe.json`；以下能力次數僅列主角 AI。

| monster | 場數 | 勝／敗／平 | 平均輪數 | 例外 | 主角能力使用 |
|---|---:|---|---:|---:|---|
| breaksurf-d | 5 | 0／5／0 | 8.4 | 0 | 伏顎一拱 78；翻背碾岸 17 |
| tidewolf-d | 5 | 0／5／0 | 8.0 | 0 | 撕咬 68；撲擊 1 |
| mite-d | 5 | 0／5／0 | 10.2 | 0 | mite-swarm-bite 58 |

礁背每個 seed 都有使用兩招；結算均 `eliminate:repelled`，沒有 timeout。潮狼同為五場 repelled；蝕蟲三場 repelled、兩場 eliminate。三組勝率皆 0%，新內容與參照同向；按本批要求只記錄，不為勝率改數值。

新內容 probe 超帶欄位為零。HP 180、四部位／一核、D 屬性 8／6／50／5、resist 0–0.2、burden 2 均依計畫與 D 帶。兩招傷害 8／5、AP 均 2，range 1–1、範圍 radius 1；碾岸為單體傷害 62.5%。碾岸每目標傷害／AP 2.5 低於 D 建議 3–4，理由是範圍招，符合低於 3 須有範圍的規矩；cooldown 2 依計畫及範圍招限制。既有參照潮狼的 bite 18 與 pounce 12 超出 D 傷害 5–9 帶，屬原資料，本線不改。

每檔後各跑一次 `npm run check`，七次 exit 0。收尾第七次 loader 為 `OK 0 errors, 16 warnings`，最末 ops 行為 `OK 0 errors, 10 warnings`（工具本身會附 warnings 後綴）。新警告兩條，均照計畫保留：

- `[soft-overflow-band] content/base/frames/bio-breaksurf.json $.pools[0].bands instinct: no band covers values above max`：指定 soft、bands 空。
- `[soft-overflow-band] content/base/species/breaksurf.json $.pools[1].bands instinct: no band covers values above max`：指定 soft、bands 空。

其餘 14 條 loader 警告／10 條 ops 警告均為首檔時即存在的既有路徑；沒有新內容的其他警告。七份原始紀錄為 `/tmp/cx-kj-05/check-1.log` 至 `check-7.log`。`npm run typecheck` exit 0，輸出 `/tmp/cx-kj-05/typecheck.log`。

`npm test` 僅跑一次，exit 1：151 項、148 pass、3 fail、0 cancelled／skipped／todo，耗時 233566.293981 ms。三個失敗均為檔級 `testCodeFailure`／`ERR_TEST_FAILURE`：`src/mcp/cli.test.ts`（exitCode 1）、`src/mcp/e2e.test.ts`（exitCode 1）、`src/ops/content/worldgen.test.ts`（exitCode 1）。僅出現交接書明列的已知環境失敗類別，其餘 148 項通過；TAP 沒有提供更細的失敗原因，因此不把環境推測當成已證明根因，也未追加重跑。原始完整 TAP：`/tmp/cx-kj-05/test.log`。

固定五條驗收的範圍／文字證據：`git status --short` 除既有 node_modules 外僅七個指定新增檔；合計 6,814 bytes，最大檔 3,462 bytes，未觸容量 gate。monster 的 `name`／`epithet` 為零；七檔與命名／白話表新增文字的舊詞及 style.md 禁用詞零命中；未加入 `territorial`／`molt`。已讀清單含「先讀」行全部路徑。驗收只按交接書固定五條，未追加 MCP、統計重算、平衡或其他測試。

# 沒做到或證據不足的

未驗營運生成、地域過濾與 MCP 試玩，均在本線排除範圍；現有 probe 證據只支持新 monster 無例外與兩招可由 AI 使用，不代表數值已平衡。`world/` 營運檔未動。

# 需要決定的事

領導整合時處理 `world/rifts/beast.json` 的 monster／vanguard 接入；本線沒有因此取得改檔授權。命名保持提案，交後續去重與敘事審核。數值最後統一調，現無阻礙七檔交付的設計決定。

# 子代理

未開子代理；成本與品質項目不適用，由本線親讀規矩、實作與自測。

# 以後交接書該點名的工具

無。

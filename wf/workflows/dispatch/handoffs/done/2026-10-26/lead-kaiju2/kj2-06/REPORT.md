已讀清單：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/battle-field.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/playtest.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/cx-kj2-06.md`、`wf/workflows/content/`、`templates.json`、`engine-facts.json`、`ability-forms.json`、`kj2-plan/roster.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/roster.json`、`python3 wf/tools/tabledb.py`、`batch=kj2-06`、`wf/workflows/content/ability-forms.json`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/ops-content.md`、`wf/workflows/content/playtest-baselines.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/tools/stats.ts`、`wf/workflows/content/world-pillars/bio-battle/battle.md`、`wf/workflows/content/world-pillars/bio-battle/bio.md`、`wf/workflows/content/world-pillars/bio-battle.md`、`wf/workflows/content/world-pillars/mechs/ancient.md`、`wf/workflows/content/world-pillars/mechs/bonds.md`、`wf/workflows/content/world-pillars/mechs/mechanical.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/world-pillars/world/factions-and-sandbox.md`、`wf/workflows/content/world-pillars/world/monsters.md`、`wf/workflows/content/world-pillars/world/tone-and-rules.md`、`wf/workflows/content/world-pillars/world.md`、`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/dev-env.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/dispatch/lessons.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/review-draft.json`。均由本線親自讀取；wf-table/1 資料以 tabledb 分段或依條件查讀，未把整表讀入 context。第 9 段本批所用範本 SM、PM、MD、MC、MB、MA、AU、AA、AE、FX、LP、SC 已逐檔親讀。

## 做了什麼

cx-kj2-06 依審定計畫新增 4 種淡水菌絲，共恰好 25 檔。未修改既有檔、未寫 world、未更新索引、未 commit。數值逐欄照 roster，沒有做平衡。展示使用既有地圖與兩台 A 級崖牙活體／屍體機，玩家各配一位指定駕駛；四種菌絲各一隻，使用物種本身 AI。中央守區為 (30,29)、(31,29)、(30,30)、(31,30)，全是平地；最近雙方部署距離 12 格。目標依序為玩家全滅落敗、守區八輪勝、敵方存活二十輪勝；seed 210806。

件數與容量 gate：25 檔，合計 30778 bytes；最大檔 `content/base/bodyplans/mycel-drowned-grove.json` 為 5661 bytes。`git status --short --untracked-files=all` 只見允許新增檔與原有 node_modules。命名表 44 列；白話表 25 列，最長 32 字；年表草稿 1 條，未改既有年表。B 以下 monster 無 name／epithet；新內容文字的舊詞與 style 禁用詞掃描 0 命中。

## 產出

- `species/wick-mat`／`monster/wick-mat-d`：固定在岸邊射四格細線，分散站位可避開多體受擊；唯一根結破即死。 掛點：五湖菌海淡水支流與舊橋；菌絲淡水例外；F／底色1.4、1.5、1.8；承2101-08-15借火催曉之後的採菌回程警示，不更改白夜2100首燒。常由採菌隊與冬季河岸學者遇見。
- `species/reed-lace`／`monster/reed-lace-c`：三根結全破才退；先用真正rooted標籤封腳，再朝被困目標吐珠。 掛點：五湖菌海淡水支流與舊橋；菌絲淡水例外；F／底色1.4、1.5、1.8；承2101-08-15借火催曉之後的採菌回程警示，不更改白夜2100首燒。常由採菌隊與冬季河岸學者遇見。
- `species/vault-root`／`monster/vault-root-b`：再生只在外拱與餘根，狙擊窄根結可避開厚甲消耗；最遠七格吐流。 掛點：五湖菌海淡水支流與舊橋；菌絲淡水例外；F／底色1.4、1.5、1.8；承2101-08-15借火催曉之後的採菌回程警示，不更改白夜2100首燒。常由採菌隊與冬季河岸學者遇見。
- `species/drowned-grove`／`monster/drowned-grove-a`：五結全破才死；每拆一結永久降低命中，最後階段比開場更容易穿過。 掛點：五湖菌海淡水支流與舊橋；菌絲淡水例外；F／底色1.4、1.5、1.8；承2101-08-15借火催曉之後的採菌回程警示，不更改白夜2100首燒。常由採菌隊與冬季河岸學者遇見。

共用新地點 `place/five-lakes-white-ford`，補足各種在淡水岸、蘆叢、橋底、斷橋旁出現的理由，以及採菌隊、冬季河岸學者如何遇見與繞行。沉林 A 級俗名「白林」、二名「斷橋骸林」；年表草稿標題為「白汊空橋斷後另繫回程索」，date=2107、era/league，承接借火催曉，不變更白夜首燒。

## probe 與參照數字、超帶欄位與理由

指定的 8 個 monster 合跑 `npm run content:probe -- … --n 5`，exit 0；同級新獸與參照都對同一基準兩台機體，seed 1–5，各 5 場。新獸合計 20 場、全組 40 場均 0 例外。勝／敗／平皆以五場為分母。

| 等級 | 新 monster | 勝／敗／平 | 平均輪數 | 參照 monster | 勝／敗／平 | 平均輪數 |
|---|---|---|---|---|---|---|
| D | wick-mat-d | 0%／60%／40% | 19.60 | pod-d | 0%／80%／20% | 13.60 |
| C | reed-lace-c | 0%／0%／100% | 20.00 | stalk-c | 0%／100%／0% | 8.00 |
| B | vault-root-b | 0%／0%／100% | 20.00 | rotwarden-b | 0%／100%／0% | 8.00 |
| A | drowned-grove-a | 0%／0%／100% | 20.00 | bed-white-night | 100%／0%／0% | 14.20 |

新能力被 AI 使用次數：沿穗滲漿 180；交蘆絆步 21、抖蘆落珠 124；倒拱激流 21、掀根濺岸 50；枯枝落沫 95、五汊橫流 50、白林疊影 0。最後一招未使用的原因：`src/ai/score.ts` 的 want 對沒有 `assignment.protect` 的單位把 protect 權重設成 0；此招只有 protect=1，故本次無保護任務的 probe 不用。保留審定計畫，未偷偷改成 buff。參照未用能力：pod 的 kx-spore-burst、rotwarden 的 kx-spore-shroud。

HP／部位／結數：燈苔 120／2／1；蘆網 400／4／3；拱根 1100／4／1；沉林 1700／6／5。HP 均在各級帶內；蘆網三結是審定多結設計，超過 C 級單核建議。菌絲全層抗性 kinetic/pierce=0.5、acid=0.8、thermal/energy=0，沿既有族例外；AP 池與屬性照 roster。

probe 列出的新獸超帶共 7 項：

- 掀根濺岸傷害 14 低於 B 單體帶 18：小範圍每目標約取單體六成，14/4=3.5 傷/AP。
- 倒拱激流射程 7 超過 B 帶 6：固定遠射種，射程 2–7 留貼身死角，22/4=5.5 傷/AP。
- 枯枝落沫與五汊橫流 armorPen 各為 0，低於 A 建議 0.15：共通展開規則明定未列一律 0，不自行增穿甲。
- 五汊橫流傷害 18 低於 A 單體帶 24：直線每目標取單體約七成，18/4=4.5 傷/AP。
- 白林疊影 AP 3 低於 A 攻擊帶 4：為短時防護，符合增益 2–3 AP。
- 白林疊影射程 0 低於 A 攻擊帶 1：自身目標必為 0–0，並非遠射不足。

燈苔漿線傷/AP=2.5，低於基準 3，以直線多目標補足；交蘆絆步沒有傷害，以 rooted 與先手 -3 換成本；白林林影閃避 +10、兩回合在限制內；枝斷每層命中 -2、最多五層，屬破結永久削弱。所有例外保留計畫暫值，未宣稱已平衡。

每種完成後各跑一次 check，加上地點與情境後再跑一次。五次 exit 均 0，末行均 `OK 0 errors, 10 warnings`（前半 loader 為 `OK 0 errors, 16 warnings`）；新檔警告 0。10 個既有捕捉層差異警告：lancewing-b、mirror-a、nestmother-b、nestmother-c、nestmother-landlord、rotwarden-a、siegebeetle-a、stalk-b、tidewolf-b、tidewolf-c；另 6 個 loader 既有警告為 mx-faded 閃避 25、bio-breaksurf 本能 soft band、species/breaksurf 同項、species/tidewolf 同項、kx-tide-crush 範圍傷害 28、infantry 無配裝。

lore check exit 0：errors=0 warnings=2；警告均是既有事件 busan-returned-seal、dark-quay-surety 未入年表。typecheck exit 0，兩份 tsc 均通過。npm test 僅跑一次，exit 1：152 個檔級項目，147 過、5 失敗、0 取消／跳過，耗時 1042070.507 ms。失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts`（交接書明列的已知環境類別），以及 `test/fuzz/fuzz.test.ts`、`test/sim/invariants.test.ts`。為釐清後兩項，補跑同兩個原測試檔，exit 0：2 過、0 失敗，總耗時 4739.987 ms。全套原耗時各 99413.254 ms 與 50349.983 ms；fuzz 設 90000 ms 時限，不變量生成／重播設 30000 ms 時限。單跑各約 4.74 秒／2.44 秒均過；並行負載造成時限失敗是推論，原全套日誌只有檔級 ERR_TEST_FAILURE，沒有更細堆疊。沒有為此改內容或引擎，沒有重跑全套。

## 沒做到或證據不足的

完整 npm test 未全綠；三項屬交接既知類別，另兩項單跑已過，但不能由檔級摘要斷言全套失敗的唯一根因。白林疊影本次 AI 使用 0，理由與程式碼依據如上；交接驗收允許未用能力註明原因。C／B／A 的五場全為 timeout，與參照的撤退或勝負結果不同；這些數字不證明平衡，依使用者與計畫保留後期調整。沒有 MCP 試玩要求，未做。展示入口已通過資料檢查，未另跑其對戰；沒有把資料檢查說成實玩證據。

## 需要決定的事與需要引擎支援的玩法

本線無需使用者決定即可交付。後續由領導依計畫接入營運 rift 清單；本線未寫世界資料。純採收物種仍必填 capture.frame，按計畫採互斥 core 條件與既有 bio-bed 佔位；若要真正採收動作或免填捕捉 frame，需要引擎另案。拱根地下只寫來處，沒有穿越地下；若要地下行動需引擎支援。白林的 self protect 無任務時權重為零，若希望普遍自護需另案決定 AI 語義，或領導後續批准改能力戰術鍵。

## 子代理

未使用；子代理成本為 0，親自創作與檢查，無子代理品質風險。

## 以後交接書該點名的工具

無。

原始證據：同目錄 `evidence/` 保存每種 check、最終 check、lore、typecheck、probe、完整 npm test、兩檔失敗診斷及路徑／容量／文字 gate 結果。固定五項驗收皆已處理；完整測試的非綠與未使用能力保留於報告，不另加驗收。

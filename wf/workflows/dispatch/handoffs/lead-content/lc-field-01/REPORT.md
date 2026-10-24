## 已讀清單

以下均親自讀取；wf-table 資料以條件查詢讀取相關列，未整份傾倒。

- `wf/workflows/content/`（其餘規矩及工具，以下逐檔列出）

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/playtest.md`
- `src/mcp/README.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/issues.json`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/tools/stats.ts`
- `wf/workflows/content/world-pillars/bio-battle/battle.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `wf/workflows/content/world-pillars/mechs/ancient.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/mechs/mechanical.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/content/world-pillars/world/monsters.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/WORKFLOWS.md`
- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/workflows/inbox/PROTOCOL.md`
- `wf/workflows/testing.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/dev-env.md`
- `wf/workflows/dispatch/lessons.md`
- `content/base/maps/skirmish-20.json`
- `content/base/maps/rift-edge-60.json`
- `content/base/maps/tidal-flat-40x30.json`
- `content/base/scenarios/rift-edge-nest.json`
- `content/base/scenarios/quarry-duel.json`
- `content/base/scenarios/breach-defense.json`
- `content/base/scenarios/convoy-run.json`
- `content/base/scenarios/tidal-flat-evac.json`

## 做了什麼

cx-lc-field 在指定隔離 worktree 新增四張地圖、五個情境，使用既有二十三種地形中的八種，沒有新增地形。主目標涵蓋守區、存活、撤離、參戰斬首及人類交戰，全殲主目標零個。既有檔、src、schema、索引、world、registries 均未修改；未 commit，未使用子代理、GUI 或螢幕工具。

## 產出

新檔均為 `content/base/maps/lc-field-*.json` 或 `content/base/scenarios/lc-field-*.json`。完整 id 與中文名對照見 [naming.json](naming.json)，MCP 量測見 [playtest.json](playtest.json)。瀏覽器既有 `src/ui-adapter/dom/main.ts` 的 glob 會載入 `/content/base/**/*.json`；新情境已由 MCP 實際建立／跑完，未另啟動 GUI。

| 地圖 | 尺寸／主題 | 中央地物 | 部署間距／cost 1 比例 |
|---|---|---|---|
| 餘燈街 | 28×24／蝕域城郊 | (14,12) 補給碑 | 10 格／94.9% |
| 歸帆埠 | 28×24／渡蝕港碼頭 | (14,12) 補給碑 | 13 格／87.5% |
| 斷誓隘 | 28×24／高原山口 | (14,12) 補給碑 | 13 格／90.5% |
| 泊舟長堤 | 28×40／渡蝕港長堤 | (14,20) 補給碑 | 12 格／81.2% |

間距採八方向格距的部署區最小值。一般圖玩家在西側、敵軍在東側；長堤玩家由南段出發、敵軍截在西岸中段。盟軍區另列，沒有第三個敵對陣營。出口均在西側，長堤與歸帆埠在西北岸；出口格可通行，MCP 地圖在迷霧下仍顯示出口。

| 情境 | 類型／玩家目標 | 編成（玩家／盟軍／敵） | 預期輪數 |
|---|---|---|---|
| 餘燈未熄 | 守碑旁兩格，連續八輪 | 4／0／5 | 8–20 |
| 解纜之前 | 存活至十八輪，或擊退 | 3／0／4 | 9–18 |
| 帶著盟書走 | 領隊抵達西北出口 | 3／0／4 | 4–9 |
| 隘口折旗 | 聯軍斬首銀環，十八輪期限 | 3／4／6 | 4–18 |
| 過路的代價 | 斬首長槍，十八輪期限 | 3／0／4 | 10–18 |

通用玩家三台為燕鷗攻堅型、獵犬-II型與堅盾-II型；守碑另加一台獵犬，撤離場由獵犬帶盟書。敵軍：守碑為兩鐮肢、一吐棘者、兩蝕蟲；碼頭存活為兩鐮肢、一吐棘者、一蝕蟲；撤離為三鐮肢、一吐棘者；參戰為一銀環、五堅盾；人類交戰為一長槍、三燕鷗。盟軍為四台獵犬，雙向 allies 已明列，使用既有 focus-fire。具名人物在各場均不重複，所有衍型機均有部件武器，至少一把不帶 conventional-arms。

所有 probe 均為 seed 1–5、`--n 5 --json -`，未關閉撤退。以下勝率是玩家勝場／五場；參照採相同選項。沒有新情境五場全 timeout 且雙方零死亡。

| 情境 | 玩家勝場／勝率 | 平手率 | 平均輪數 | 例外 |
|---|---|---|---|---|
| 餘燈未熄 | 2/5（40%） | 0% | 13.8 | 0 |
| 解纜之前 | 4/5（80%） | 0% | 14.2 | 0 |
| 帶著盟書走 | 4/5（80%） | 0% | 5.2 | 0 |
| 隘口折旗 | 2/5（40%） | 0% | 13.0 | 0 |
| 過路的代價 | 4/5（80%） | 0% | 13.8 | 0 |
| rift-edge-nest（參照） | 0/5（0%） | 0% | 17.4 | 0 |
| breach-defense（參照） | 0/5（0%） | 0% | 12.4 | 0 |
| tidal-flat-evac（參照） | 5/5（100%） | 0% | 4.0 | 0 |
| quarry-duel（參照） | 5/5（100%） | 0% | 10.0 | 0 |

新情境最終證據依上表順序在 `/tmp/cx-lc-field/new-probe-{10,2,7,3,8}.out`，參照在 `reference-probe.out`；同名 `.err` 是探針文字摘要。每次情境或地圖變動後重跑受影響情境五 seed，未以舊版本數字代替新版本。

調整依序排除有限備矢與缺少近戰續戰手段、守區範圍、撤離路線及敵方截擊位置；再調情境編成與任務期限。第一版撤離場五場皆兩輪勝，手打也重現，故另做長堤與蝕水路段；人類領隊補上既有人物，敵軍改為少量較厚機體。斬首雙方的時間意圖以十八輪期限表達，讓未達成任務的戰局結算。沒有改基準單位數值或 AI profile 檔。

| 情境 | 玩家＋盟軍 HP | 敵方 HP | 比值 |
|---|---|---|---|
| 餘燈未熄 | 1125 | 1350 | 1.20 |
| 解纜之前 | 965 | 1290 | 1.34 |
| 帶著盟書走 | 965 | 1655 | 1.72 |
| 隘口折旗 | 1605 | 2400 | 1.50 |
| 過路的代價 | 965 | 1550 | 1.61 |

HP 為 bodyplan 層 HP 加實際配裝 layersAdd，不含人物 HP 與部件耐久；不把護盾再生折算成額外 HP。均在交接書 1.2–2.0 範圍。

MCP 三場（原始輸出含 outcome）：

- 手打「解纜之前」seed 3：9 輪，player／repelled，我方退出戰列 0、敵方 4；先斬蝕蟲、拘束鐮肢、散紋攻擊及灰霧掩護，受損獵犬撤到後方，敵軍最後自行撤離。逐步 legal_actions → act／act_many；中途資源不足與已啟用能力的拒絕均保留原始 log，調整指令後打完。
- 自動「隘口折旗」seed 2：7 輪，player／killTarget，我方退出戰列 0、敵方 1，銀環指揮機被擊毀。
- 自動「解纜之前」seed 1：18 輪，player／survive，我方退出戰列 2、敵方 1。

playtest 的 ourLosses／enemyLosses 統一記「起始數量減仍在場數量」，包含死亡與撤離，不等同死亡數。沒有新增能力，newAbilityUses 均 0；既有能力有 AI 出手，aiUsed 為 true。兩個 stdio 常駐行程均已關閉，兩場一次性 server 正常退出。

固定七條驗收：

1. 路徑：除既有 node_modules 外，git status 只有九個允許目錄的新 JSON；未修改或刪除既有檔。新增內容共 24,012 bytes，最大 5,226 bytes，未觸發內容件數／容量閘門。
2. 每檔及調整後 check 都為 `OK 0 errors, 12 warnings`；警告屬既有資料。`npm test`：135 個檔級項目、133 pass、2 fail；失敗檔僅 src/mcp/cli.test.ts 與 src/mcp/e2e.test.ts，與交接書指定的沙箱例外檔一致，其餘零 fail。 黃金目錄 `git status --short test/golden src/ops/sim/fixtures` 為空。
3. 四地圖、五情境；玩家 lose 條件全部存在，rounds 全為 24，全殲主目標零個；部署間距 10–13 格。cells 長度與字元／legend 引用有效；參戰三個 slot 各有 win，玩家另有 lose。
4. 五個新情境與四個參照的五 seed 數字已並列；新情境全達指定勝率／平手／例外門檻。
5. playtest 三列，包含一場手打；三個 log 均存在並含 outcome 與情境 id。
6. naming 九列涵蓋九個新檔；新 JSON 文字舊詞與禁用詞零命中。引用的既有 id 未改名，既有顯示名由引擎原樣顯示。
7. 第一段已讀清單包含交接書「先讀」行全部指定路徑，並列其他親讀規矩。

## 沒做到或證據不足的

MapDef 不接受 name：第一張地圖加入 name 時，check 明確回 `$.name additional property not allowed`。依禁止改 src／schema 的邊界，地圖名稱保存在 naming 與報告，部分也出現在情境 brief；不能宣稱地圖資料本身已支援中文 name 欄位。網頁是否以合適形式顯示這些地圖名稱，未做 GUI 驗證。

五 seed 是本次固定驗收樣本，沒有加跑更大樣本或另設驗收條件。既有參照仍有 0%／100% 單向結果，已照實並列，未修改參照或申請豁免來放行新情境。兩個 MCP 失敗檔按交接書指定例外交領導在沙箱外重跑，未因此發 BLOCKED。為辨認此次失敗，只將同兩檔直接執行一次以取細節，沒有重跑整套 npm test：CLI 在第十九行出現 ERR_ASSERTION；e2e 兩項都顯示「server 提前退出 0」。本次輸出未顯示 EPERM 字串，因此不能宣稱已證明與交接書描述的 EPERM 同因；原始細節在 /tmp/cx-lc-field/{cli,e2e}-failure-detail.out。shell stdio 三場實玩皆完成。沙箱 node --test 採每檔一項的已知計數，未宣稱為細部 assertion 數。

## 需要決定的事

若要戰場 UI 與 MCP 都直接顯示地圖中文名，需要另線擴充 MapDef／schema／顯示層，不能在本批只新增內容的範圍內完成。`engine-facts.json` 的「所有 frame 尚未填 defaultLoadout」已落後本 worktree，範本也仍留有重複人物等舊問題；本批以實際檔案與實測為準，未順手修改規矩或範本。

## 子代理

0 個；本線自行讀取、撰寫與試玩，沒有委派模型或子代理產物。

## 以後交接書該點名的工具

無。

# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`
- `wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/great-tide.md`
- `content/base/bodyplans/beast-foam-jaw.json`
- `content/base/bodyplans/insect-bell-borer.json`
- `content/base/bodyplans/insect-hinge-crab.json`
- `content/base/bodyplans/insect-lantern-keel.json`
- `content/base/bodyplans/quadruped-beast.json`
- `content/base/frames/bulwark-i.json`
- `content/base/species/bell-borer.json`
- `content/base/species/foam-jaw.json`
- `content/base/species/hinge-crab.json`
- `content/base/species/lantern-keel.json`
- `content/base/species/tidewolf.json`
- `content/base/world/models/bulwark-i.json`
- `content/lore/characters/kim-haneul.json`
- `content/lore/eras/league.json`
- `content/lore/eras/tide-line.json`
- `content/lore/factions/busan.json`
- `content/lore/factions/imperial-court.json`
- `content/lore/factions/japan-umbrella.json`
- `content/lore/factions/korea-umbrella.json`
- `content/lore/factions/shell-society.json`
- `content/lore/factions/shell-wardens.json`
- `content/lore/places/court-seat.json`
- `content/lore/places/golmud-nest.json`
- `content/lore/places/gyeongju-tombs.json`
- `content/lore/places/incheon.json`
- `content/lore/places/sendai-bell-cliff.json`
- `content/lore/places/sendai-wall.json`
- `content/lore/places/yangtze-mouth.json`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-01.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`

AGENTS.md 親讀主 repo 指定絕對路徑；bf-common、deep-rulings 與本交接書從主 repo 唯讀，其餘指定檔從隔離 worktree 親讀。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、inbox 入口及 world-pillars 適用子檔；依本次明示範圍不改共用進度簿。

## 做了什麼

線 cx-bf-deep-01，團隊 teams/bigfill，上游 lead-bigfill。按正式 manifest 的 base 27e6ea2f3481a4df855b19bfbf2760a65433fbf1，在隔離 worktree 只新增 11 個 lore 檔：人物 4、事件 5、地點 2。各件白話與節點／主線／底色掛點逐列交在 [review-rows.json](review-rows.json)。沒有使用子代理；未 commit。

江口以跪機攔潮狼與沫顎上灘補深回收者；仁川保留換防駕駛的機肩口號，扣甲救援全篇維持「若發生」；行在以內陸操練接世代缺口。仙台人物集中在退傷機與不漏同伴，事件承接既有碎燈同夜，低簷以燈腹薄翼與亮囊寫海岸作業。夸父周邊分別寫霜壁刻痕與裝甲日光，韓寶羅以骸片照掌、修鼓與活人口號接住空陵。

每件保留指定的一道光；照明物件核心只給鳴崖碎燈夜，其他受限小物未另立核心。人物招牌話全留；機械駕駛在座艙內驅動核心，口號只作敘事。古代機保持靜止，未新增認主、交易、技能或數值。沒有新增規格外具名人物或專名。

## 產出

內容位置：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/`；11 個精確路徑見審查表。body 實測 390–457 字，均在 300–1500 字內，檔名與 id name 段相符，固定欄位逐值保留。

報告四檔已交：本 REPORT、[review-rows.json](review-rows.json)（11 列，白話最長 30 字）、[inserts.json](inserts.json)（5 列）、[timeline-add.json](timeline-add.json)（3 列）。三表皆使用 tabledb 寫入並讀回，符合 wf-table/1 與逐表指定 columns；插入值照交接書原值。

固定驗收四條：

1. lore check 基線 `errors=0 warnings=0`，逐檔完成及收尾均執行；收尾 `errors=0 warnings=4`，新增警告恰為准許的四件年表待併事件，來源與對應見下段。最小合法 JSON 先建齊，逐檔補正文期間的空 body 警告已清零，未有未建立引用。
2. `npm run check` 跑一次，末行 `OK 0 errors, 10 warnings`。十條皆為未修改的既有 base monsters capture layer HP differs，與本批 lore 無關；未將結果宣稱為全庫無警告。
3. 固定 11 個新 content 檔全數存在；`git diff --name-only` 與 cached 版本皆空，修改既有檔 0。未追蹤的 `node_modules` 在開工時已存在，是領導備妥的依賴入口；本線未改。其餘差異恰為 manifest 的 11 個檔，主 repo 只寫指定報告四檔與授權 inbox 回報。
4. REPORT 開頭完整列出 mustRead 54 路徑；review 11 列、白話 ≤60 字；inserts 與 timeline-add 欄位及逐值核對通過，未直接套入既有檔。

## 沒做到或證據不足的

無阻塞。年表與反向關聯依交接書延後合併，原檔保持原值。仁川咬岸為 `occurs: possible`，不列確定年表；鳴崖碎燈夜只補既有同夜 event，不重複新增年表列。

沒有跑 npm test、typecheck、content_accept、content_gate、wf-lint、探針或試玩；工人只按本次固定四條驗收，領導後續收批與合併處理。每次 node 檢查前查重負載，未見他線正在跑重測。開工、逐檔完成與收尾按步驟讀 orders，無新增指示。

原始檢查輸出保存在 `/tmp/cx-bf-deep-01/lore-baseline.log`、`/tmp/cx-bf-deep-01/lore-01.log` 至 `lore-11.log`、`/tmp/cx-bf-deep-01/lore-final.log`、`/tmp/cx-bf-deep-01/check-final.log`。臨時產出腳本及範圍／四條驗收資料核對也留在該 tmp 目錄，沒有留進 worktree。

## 需要決定的事

本批指定新名全部送審，沒有額外命名：

- 江燕（提案）
- 江口白沫夜（提案）
- 尹海真（提案）
- 仁川咬岸（提案）
- 行在初吼（提案）
- 千田 千代（提案）
- 鳴崖碎燈夜（提案）
- 仙台低簷（提案）
- 霜壁留日（提案）
- 窩口映日龕（提案）
- 韓寶羅（提案）

未發現需要推翻既有設定的矛盾。以下四條是新增且尚待領導合併消除的警告，並非通過後隱藏：

- `events/estuary-white-maw.json: 未出現在 timeline` → `event/estuary-white-maw`，timeline-add 第 2 列（0-based），2107-08 江口白沫夜。
- `events/court-yard-first-roar.json: 未出現在 timeline` → `event/court-yard-first-roar`，timeline-add 第 1 列，2107-02 行在初吼。
- `events/bell-cliff-shattered-lights.json: 未出現在 timeline` → `event/bell-cliff-shattered-lights`，inserts 第 0 列，對既有 `$.entries[122]` 補 event；唯讀查詢確認 date=2105、title=仙台外崖燈盞盡碎，內港換班未斷，且當前缺 event。合併時仍須按 date＋title 重新定位，若已有異值交領導裁定。
- `events/sun-script-on-frost.json: 未出現在 timeline` → `event/sun-script-on-frost`，timeline-add 第 0 列，2107-01 霜壁留日。

其餘四筆插入需求是日傘增加低簷導航、守寢人與稽古學會增加映日龕導航、金河娜增加韓寶羅反向關係；未賦予古代機所有權，未增 schema。

## 以後交接書該點名的工具

維持本次點名的 lore check、npm run check、tabledb（timeline 以 load 後 meta.entries 唯讀查詢）、inbox_poll 與 inbox_mail；加註 node 前的重負載檢查即可。正式 manifest 僅在主 repo，可明示其位置，避免誤以為 worktree 缺 manifest。後續 content_gate 由領導執行。

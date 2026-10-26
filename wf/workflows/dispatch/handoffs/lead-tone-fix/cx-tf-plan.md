# 任務：寫基調審查落地的計畫表——把 Fable 審查的方向 1–5 拆成逐檔、寫死的處置

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；plan.md 第一段「已讀清單」逐行列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/README.md`（含可見度、`occurs`）、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/verdicts.json`、`wf/workflows/dispatch/handoffs/fill-rulings.md`（含文末 2026-10-26 晚段）、`wf/workflows/dispatch/handoffs/lead-dedup/review-guide.md`（末節八項）、`wf/workflows/dispatch/handoffs/lead-dedup/plan/findings.json`（改法 needs-user 的八列）、本交接書。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 第二輪更正（領導，2026-10-26；優先於下文）

上一輪 BLOCKED 的兩項衝突已解：verdicts 實為 36 列；content/base 的件（五個 frame etymology、oa-hydraulic-assist、moji-tern 血統 tag）只列 base-requests.json、不列 items；既有檔 gate 放寬到 75。`wf/workflows/content/mechs.md` 與 `specs/world/opening.md` 不歸本批，列進 base-requests.json（`檔` 填實際路徑，`理由` 註明交規劃線／頂層）。上一輪的盤點見 `plan/plan.md`，直接沿用（漲潮錯處在 places/migrant-bird、提克西新增 aka、四撤件定位、崖牙／群喉物種），plan.md 覆寫成正式計畫。

## 背景與唯一目標

使用者對 Fable 基調審查（review.md）說「照 Fable」。本線唯一目標：**只讀不改**，寫出一份計畫表，讓兩條產出線照表就能改檔、不必再判斷。審查是「照 Fable」：review.md 第二節（提案名）、第三節（八項推薦）、第四節方向 1–5、verdicts.json 36 件 ⚠️／❌ 的理由，都視為已定。

## 計畫要覆蓋的事（逐條都要有列）

1. **美洲補光（新增 4–6 件事件＋改既有檔）**：北美一夜、拉美一夜，各有一隻 A 級以上二名獸（西雅圖或瓦爾帕萊索至少一處）；一場有人吼出招式或一句能吼的話的守城；蒙特婁 place（或刑天相關檔）的 `secrets` 加一列 `rumor`：地下的刑天「動過一次」；西雅圖、溫尼伯、哈瓦那、瓦爾帕萊索、貝倫、巴西利亞、卡塔赫納各補一個只有它有的記號（照 verdicts 理由）。二名獸**只寫 lore**：用 `content/base/species/` 既有物種（`grep` 查），二名個體不新增 base 檔；若覺得非新物種不可，寫進 base-requests 給機甲／怪獸擴充線，不要自己設計數值。
2. **錢與法理收斂**：撤 `events/estuary-exchange`、`events/another-ledger`、`events/djibouti-charter`、`events/inland-registers` 四件——撤＝內容併入主檔（貝倫、內陸財團／莉維亞、吉布地地點檔、克萊兒・雷諾人物檔），原檔加根欄 `"visibility": "hidden"`、`summary` 改成「已併入〈主檔名〉」，**不刪檔**；這四件的年表條目找新掛處（去掉 `event` 欄或改掛別的事件，`factions` 補主檔勢力）。「地契押給月亮」只留紐約與聖馬洛兩處當代表，其餘（江口、杜拜、蘇拉特、庫爾納、空城押契等，你 grep 出全部）改寫成各地自己的說法或刪掉重複解釋；政府進山改寫成「最後一列進山的火車與沒上車的人」一夜（不撤）；墨西哥城徵召令加一支具名獵團與一台具名機選邊；莉維亞加一句她自己的話；改名的日子加一個場面；堪察加井城、江口空城、吉布地照 verdicts 補記號。目標：以帳為主角的件從約 70 降到 50 上下（你估算前後件數寫進 plan.md）。
3. **殘聯機甲史換語感**：`fr7-at12-public-issue`、`hound-ii-license`、`longspear-v4-standard`，第四件你從 review.md「公發、授權、定版、V4」判斷（多半是 `bulwark-ii-standard`）；每件改成「一個人、一個站起來的瞬間」、鳥名與窮酸，事件事實與日期不變。
4. **機械清理**：`aegir-wakes` summary 去「開局」改世界內語、`secrets` 裡「（提案名「歸矢」）」去標記；英文回譯 aka 刪（補天院、還鄉院、舊廠諸家）、三寶顏 aka 改單純 `Zamboanga`；季克西→提克西（`name` 與全 lore 提到處，aka 保留 Tiksi）；lore 裡「順行液壓組」「液壓」→「順行筋組」「筋」；`factions/rift-beasts` 三節追加縮成一節「舊港仍有人望著」；`epithet-register` 縮短、主畫面前移；全 `content/lore/` 與 `wf/workflows/planning/design-notes/world/` grep 第二節定案名旁的「提案名」「（提案）」標記（只拿掉**這些名字**的標記，其他規劃提案不動）。`content/base/` 的部分（五個 frame 的 etymology、`components/oa-hydraulic-assist.json` 名稱、base 裡的「季克西」）**不改**，列進 base-requests 寫死替換句。
5. **八項矛盾照 review.md 第三節推薦**：逐項 grep 出所有不一致的檔與句，寫死替換句。

## 產物（全寫進 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/plan/`）

- `plan.md`（≤ 7 KB）：已讀清單、件數估算（帳為主角前後）、方向 1 的設計理念（哪兩隻獸、哪個守城、句子）、分批建議、風險與需要決定的事。
- `items.json`（wf-table/1，`columns`＋`rows`）：每列一檔一處置。欄：`序`、`方向`（1–5 或 v＝verdicts 小調）、`檔`、`欄`、`處置`（寫死：給替換句或寫明要寫的畫面／句子，≤ 300 字）、`批`（`tf-01`＝改既有檔、`tf-02`＝新增事件檔）。一檔多處可多列；同一檔只能屬一批。
- `new-events.json`（wf-table/1）：tf-02 的 4–6 件，欄：`id`、`name`、`date`、`period`、`places`、`factions`、`characters`、`kind`、`tags`、`物種`（base species id）、`二名`、`吼的句子`、`大綱`（≤ 200 字）、`白話`（≤ 60 字）。id 與引用必須指向存在的檔（新人物不准加；需要具名角色就在事件正文寫無檔的小人物）。
- `timeline-ops.json`（wf-table/1）：欄 `op`（`edit`／`insert`）、`date`、`title`（定位用，edit 填現有條目的 date＋title）、`改成`（JSON 物件：要改或新增的欄位）、`理由`。涵蓋撤件條目的新掛處、新事件條目、矛盾裁定牽動的條目。年表用 python json 讀 `content/lore/timeline.json` 的 `entries`（tabledb 讀它會誤回空）。
- `review-draft.json`（wf-table/1）：欄 `檔`、`類別`、`名稱`、`白話`（≤ 60 字）、`掛到`（史線／節點／年表／地點）——每件新增或大改一列。
- `base-requests.json`（wf-table/1）：欄 `檔`、`欄`、`舊`、`新`、`理由`。

## 範圍（排除法寫死）

- 只做：寫上列 `plan/` 目錄裡的六個檔。
- 不做：改任何 content、design-notes、wf 其他檔；commit；替 base 設計數值。
- 件數 gate：items.json 涉及的既有檔超過 75 個、或新事件超過 6 件就停下回報；容量 gate：plan/ 目錄總量超過 200 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `grep -rn` / `rg` | 找重複句、提案標記、季克西、液壓、八項矛盾 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 檔 grep 詞` | 讀 verdicts.json、findings.json、review-all.json（rows） |
| `python3 -c 'import json…'` | 讀 timeline.json entries |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-tf-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**（唯一可寫的是 `plan/` 六檔）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意；它們也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，只讀、把結果交你彙整。
- 文筆只守禁忌：不直譯腔、不拿其他作品類比、正文與替換句不出現設計層字眼（節點、底色、N03、提案、裁定、開局）。
- **分清錯誤來源**：點名工具本身壞掉 → `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-tf-plan --up PROGRESS '已讀完，開始寫計畫' < /dev/null`）。
2. grep 全庫、逐條寫 items／new-events／timeline-ops／review-draft／base-requests。
3. 寫 plan.md 並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 六檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/plan/` |

回覆只要 5 行摘要＋plan.md 路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. 六檔都在且 JSON 可解析（`python3 -c 'import json;json.load(open(…))'`）。
2. 方向 1–5 與 verdicts.json 36 列，每一項在 items.json、new-events.json 或 base-requests.json（content/base 的件只列這裡、不列 items）至少有一列（plan.md 附對照）。
3. items.json 每列的 `檔` 存在（新事件除外），同一檔只屬一批。

## 失敗怎麼處置

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tf-plan`。本線團隊：`teams/tone`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-tf-plan --up DONE 'tf 計畫完成：N 列、M 件新事件' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-tf-plan` 屬 `teams/tone`）。

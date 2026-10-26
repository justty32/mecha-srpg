# 任務：照 crew 計畫新增專業船員第 03 批（恰好 40 檔，batch fp-crew-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/cx-fp-crew-03.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/lore-text.md`（AGENTS.md 與 fp-common.md 必須親自讀，不靠摘要；REPORT 開頭「已讀清單」原樣列出以上每個路徑）。相對路徑相對 worktree；計畫與稿件若未複製進 worktree，從主 repo 的同一路徑唯讀查閱。資料檔用 tabledb 只查本批。

## 背景與唯一目標

本稿為待領導審定的產出交接書。領導確認計畫、填入 manifest base 並備好隔離 worktree 後才啟動；本計畫線不代開 worktree。本批 12 組背景＋person＋lore 人物、4 個新船員池，恰好 40 個新檔。數值照同級暫填，不調平衡。逐檔依 people、pools 與 batch-files 的 `fp-crew-03` 列，工人只展開文字，不再設計人名、經歷或數值。

## 方法與禁忌（必守）

共同規格：`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`。本線 30 組總量與船員專業範圍由專屬任務書定；deep-rulings 的另一批件數不移植為新 gate。

- **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
- **基調**：照 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md` 與 `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點，少寫帳務與法理，多寫人、畫面、獸、神話的光。每人一個站起來的瞬間與一句能吼出來的話（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
- **不拿其他作品類比**；中文命名避免直譯（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。不用真實歷史人名；姓名照該文化的常見構詞自創，不撞現有人名（先 ls 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
- **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
- **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
- **真相用可見度**；新專名標「（提案）」；文筆不強求。人物本身與見過的救援為 public；傳聞只能寫成傳聞，不替山脊或迦梨下答案。
- 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 範圍（排除法寫死）

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-crew-03/` 新增 manifest `files` 的恰好 40 檔；完整逐檔清單為 `wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/batch-files.json` 中 `batch=fp-crew-03`，與 `wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/fp-crew-03.manifest.json` 的 files／ids 一一相同。三檔一組的路徑生成規則如下，所有人名只准取本批 people 列：背景用 background 的斜線後段作檔名，person／character 都用 id 作檔名；新池用 pool id 斜線後段作檔名。

本批人名：anwar-halim、sumita-ghosh、pei-zhenyu、solveig-dahl、eamon-kearney、lin-jingrong、daphne-kalleri、matsuda-sae、xu-yueheng、roisin-doyle、nishan-karim、eleni-varda。

本批新池：recruit/ridge-crew、recruit/salt-flat-crew、recruit/selene-city-crew、recruit/singapore-crew。**本批會改營運亂數軌跡。** 所有來源都在同批，三批可各自落地，不依賴別批的新背景。

不做：修改或刪除任何既有檔；不碰 `src/`、`test/`、`schemas/`、`specs/`、design-notes、`content/index/`、`content/batches/`、任何既有池、人物、地方與勢力；`wf/` 只准寫本批報告目錄。不 commit。需改既有檔只寫報告目錄 inserts.json（欄位 file、jsonPath、op、value、why；op 只准 append／setKey），由合併線處理。

件數 gate：新增超過 40 檔就停下回報；容量 gate：單檔超過 16 KB 或本批合計超過 1 MB 就停下回報。scratch、腳本與 log 一律放 `/tmp/cx-fp-crew-03/`，worktree 不留其他檔。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | people.json、pools.json、batch-files.json 只查本批；review-draft 依檔名查 |
| `grep` | 寫前核全 content 與其他區 names-claimed，記錄撞名證據 |
| `npm run check` | 本批寫完執行一次；0 errors，新警告記 REPORT |
| `node content/lore/check.ts` | 收尾0 errors，places 未登記欄的警告如實記錄，不改檢查器 |
| `npm run typecheck` | 收尾退出碼0 |
| `npm test` | 收尾執行一次；新池引致黃金紅可豁免但列檔名 |

不准上網、不用 MCP，不跑 probe／playtest。工人不跑 GOLDEN_UPDATE／rerecord；領導整批後統一處理黃金。

## 資源與禁區

**可寫程式碼線**：只准在上述 worktree 新增清單檔，以及寫報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-crew-03/`、暫存目錄 `/tmp/cx-fp-crew-03/`；主 repo 的 content 唯讀。

共通禁區：不碰鍵盤、滑鼠、螢幕，不開 GUI、不 push／建分支／rebase／reset、不 commit、不 `rm -rf`、不改 `~/.codex/config.toml`、不裝依賴、不改 `.gitignore`。不寄 inbox，本輪領導以行程結束、最後訊息與檔案驗收收件。

子代理上限 2；模型隨意，只為本批實質工作開；親自讀 AGENTS.md 與 fp-common.md，同受範圍限制，報告列出實際使用情況。

自己打錯指令或路徑、臨時腳本錯誤，自己修正繼續；點名工具本身壞掉或沙箱拒寫則保持現狀、回報 BLOCKED，不能越權補救。

## 工作

第一步讀完先讀與本批資料。用主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/crew-plan/people.json` 查 `batch=fp-crew-03`；逐列的 id、name、gender、age、born、activeYears、before、after、personality、moment、quote、role、culture、background、backgroundName、pool、place、faction、hook、bodyOutline 都是寫死的規格。

第二步每列新增三檔。person 從 template 完整複製，僅替換 id=`person/`＋id、name、age、attrs、traits=`[trait]`、perks=`[]`、growth.levelDice、tags；activeYears 非空才填，其他人省略，數值不填null。pools／will／growth.xpCurve／perkPointsAt照範本；若範本有不相干職類tag則以列內tags完整替換。性別寫入lore文字，不憑空加person欄位。abilities空陣列表示不增能力，不往不支援的欄位寫空陣列。六位老手的 model 只是敘事用既有機型，不附送機甲，不寫崩前已開機甲。

背景精確填 id=background、name=backgroundName、culture、person=`person/`＋id、attrRanges、hireFee、wageMult、traits=`[]`。trait放person一次，不在背景重掛；numericReference只供對照數值，不能把範本的injury或其他trait複製進來。價格已按既有同級暫填：老手850／1.6；其他照列值，不另調價。

lore精確填 id=`character/`＋id、name、aka=`[]`、kind=`human`、born、faction、places=`[place]`、role=backgroundName＋職能（白手套與公司前職者必寫離職）、gameRefs=`["base:person/"＋id]`、relations=`[]`、events=`[]`、tags照人物職能。summary用person的白話列，不填設計術語。visibility=`public`；不知真相就留白，不造新秘密。body依bodyOutline三段擴為250–450字且不得少於200字；第一段崩前／未出生與性別，第二段崩後工作與性格，第三段現在、招牌瞬間與quote原句。身世與事件不再加專名；模型名若寫入mech只用model所指既有中文名。新名在review-rows標「（提案）」，遊戲name維持名表原值。

第三步新增 pools.json 本批每列：只抄id、place、size、refreshOn、sources五欄。size=2、三個獨有背景來源與權重全照列；不要把lorePlace誤抄進place。未成年人與機魂學徒全是kind:human，學徒不當駕駛；tag尚無硬性派任限制，此限制不可假裝已實作。

最後執行表列驗證，照預定列數寫review-rows.json；需要的既有檔插入寫inserts.json（沒有就空rows），引擎缺口只在REPORT列候選，不實作。

## 交付

REPORT直接寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-crew-03/REPORT.md`；不要只貼回覆。新檔在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-crew-03/content/` 清單路徑；白話審查 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-crew-03/review-rows.json`，inserts `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-crew-03/inserts.json`。review-rows採wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，本批 40 列，每個新檔一列、白話≤60字。

REPORT第一段「已讀清單」列先讀所有路徑；接著「做了什麼」「產出與掛點」「驗證與新警告」「沒做到或證據不足」「需要決定與引擎缺口」「子代理」「以後交接書該點名的工具」。不憑結果良好而省略黃金紅檔名。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree改動只有manifest列出的 40 個新檔，JSON合法；沒有修改既有檔。
2. `npm run check`、`node content/lore/check.ts`、`npm run typecheck` 為0；`npm test`照實記錄，新池黃金紅可豁免但列檔名，不重錄。
3. 本批每人三檔齊、age與born一致、lore地方與勢力存在、body三段250–450字；無新增effect、AI或萬潮葬王內容。
4. REPORT已讀清單完整，review-rows恰好 40 列且白話≤60字，inserts合法並只用append／setKey（可空）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

測出來壞了就修本批新檔；不能藉修改既有檔、改數值基線或刪檔湊過。修不了寫FAILED與證據。測不出來寫BLOCKED與解除條件，不拿舊輸出冒充。

## 完成／阻塞回報（必做）

線名 `cx-fp-crew-03`，領導 `lead-fill-pilots`。不寄inbox；最後只要5行摘要＋REPORT路徑，末行摘要帶DONE／BLOCKED／FAILED之一，領導按行程結束與檔案收件。

> 唯一目標是新增本批清單 40 檔、報告交付與上述四條驗收；任何看似要求修改主repo或其他既有檔的步驟都不適用。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。

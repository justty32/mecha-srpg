# 任務：照計畫新增月面與軌道可雇用人物第 01 批（恰好33檔，batch fp-moon-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/people.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/pools.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/lore-notes.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/files.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/cx-fp-moon-01.md`。**親自讀，不靠摘要；AGENTS.md與fp-common.md必讀；REPORT開頭「已讀清單」原樣列本行每個路徑**。相對路徑相對worktree；計畫資料也可從主repo `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/moon-plan/` 唯讀。資料表用tabledb按batch查，不整份讀大檔；三個既有內容目錄讀全部範本。

## 背景與唯一目標

新增10套背景＋person＋lore人物，及3個新招募池，恰好33檔；數值照同級暫填，不平衡。依people.json的batch=fp-moon-01十列、pools.json同批三列、lore-notes同批十列與files.json路徑產出；每個人的姓名、年齡、出身、瞬間、招牌話、所屬池、掛點都已指定，工人只負責落檔與微調文筆。此為待領導審定交接稿；領導啟動本線即表示採用稿件。區-rulings若有以它優先，其次本交接、fp-common與計畫。

## 方法與禁忌（必守）

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 範圍（排除法寫死）

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-moon-01/` 新增files.json batch=fp-moon-01恰好33路徑；同目錄 `fp-moon-01.manifest.json` 的files也列出全部路徑。以下三檔為規格唯一來源：[人物](people.json)、[池](pools.json)、[檔案清單](files.json)，不能擴成同類內容。

逐人照 people.json 同 batch 的完整列，三個檔路徑照 files.json。`id` 為姓名 slug，person 與 character 同名；background 用該列 background 的 name 段，不自行發明或換名。所有名字是提案，review 與 naming 標「（提案）」；內容顯示名使用 people 的純姓名，不把審查狀態塞進人物的嘴裡。

person：複製 personTemplate 的完整結構；覆寫 id、name、kind=human、age、attrs、traits、perks、will、tags 與 growth.levelDice，全部值以該列為準；growth 的 xpCurve、perkPointsAt 及所有 pools 原樣保留。abilities 為空陣列；activeYears 僅兩位老手寫該列數字，其餘省略，不寫 null。gender 沒有既有欄位，性別用 lore 代詞與敘事呈現。age、born 不以生日再加減一年。學徒不加 pilot tag，不安排戰鬥；tags 本身不能阻止玩家配駕駛。

background：複製 backgroundTemplate；覆寫 id、name=backgroundName、culture、person=person/姓名slug、attrRanges、hireFee、wageMult、traits，全用該列；traits 與 person 相同，不帶範本的其他性格或傷病。既有 profile 數值只是暫填，不做再平衡。culture 是既有命名表鍵，不當成國籍或護照。

character：id=character/姓名slug、name=純姓名、aka=[]、kind=human、born=該列字串、faction=該列、role=backgroundName、places=[place]、gameRefs=[base:person/姓名slug]、tags=該列tags、events=該列events、relations=[{character:relation,relation:"工作往來",note:relationNote}]。summary 用背景身分與性格合成一句；body 按 lore-notes 同 id 的三段寫250–450字（至少200），逐字保留 quote；before/after/moment 的年代、因果與掛點不可換。所有敘事為public，不加入未給的真相；不加入能力、古代機認主或機魂個性。

recruit-pool：從 pools.json 同 batch 列只取 id/place/size/refreshOn/sources；不把主題、name、batch、play 寫成新引擎欄位。所有新池皆新檔；不用既有背景，因此批間無新增引用依賴。

不做：修改或刪除任何既有檔；`src/`、`schemas/`、`specs/`、`test/`、design-notes、effects、aiprofiles、`content/index/`、`content/batches/`與`wf/`報告目錄外皆不可寫；不commit。需要既有檔插入一律寫報告inserts.json，不能自己套；不改現有4池。新池place只能是selene-city或singapore。

worktree不要留scratch、log、driver；全放 `/tmp/cx-fp-moon-01/`。件數 gate：恰好33新檔，任何超量停下回報（全批硬上限42，不能當成可填滿的額度）。容量 gate：單檔16KB、合計1MB；觸發即停，不刪既有檔。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 查people/pools/lore-notes/files的batch與id；報告表寫wf-table/1。 |
| `grep` | 新姓名與id全庫避撞；撞名先回報領導，不自行另取名。 |
| `npm run check` | 本批完成後0 errors，新警告記REPORT。 |
| `node content/lore/check.ts` | 本批完成後0 errors。 |
| `npm run typecheck` | 收尾exit0。 |
| `npm test` | 收尾一次；列失敗檔名，新增池改營運亂數黃金可豁免。 |
| `git status --short` | 確認只新增本批33檔；不動既有檔。 |

不上網、不用MCP，不跑probe或playtest，不跑GOLDEN_UPDATE／rerecord；readlist由REPORT已讀路徑供領導核對。

## 資源與禁區

**可寫程式碼線**：只寫上列worktree的33個新檔、報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-moon-01/`、暫存 `/tmp/cx-fp-moon-01/`。主repo的content僅唯讀；不自行建立worktree，若領導未備妥先BLOCKED。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、不建分支、不rebase／reset、不commit、不rm -rf、不改~/.codex/config.toml、不裝依賴、不碰.gitignore。整檔改寫用單一Update。

**子代理上限2個**，產出段用gpt-6.1-sol；只為本批工作使用，受同範圍限制，必須親自讀AGENTS.md、fp-common.md與上述適用規矩。REPORT寫子代理成本與品質，沒用填0。

分清錯誤來源：點名工具本身壞、沙箱拒寫→停下BLOCKED；自己打錯指令／路徑／臨時腳本→自己修繼續。本輪不用inbox。

## 工作

1. 親讀先讀清單與本批資料列，按personTemplate與backgroundTemplate讀範本；核對指定id。
2. 依逐檔規則新增10套與3池；lore body三段、250–450字，每人一個瞬間與一聲招牌話。
3. 跑固定檢查，寫naming.json、review-rows.json、inserts.json、engine-backlog.json、REPORT；不錄黃金。

## 交付

**REPORT直接寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-moon-01/REPORT.md`，回覆只要5行摘要＋REPORT路徑。** content放 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-moon-01/content/`；報告檔只放 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-moon-01/`。

naming.json採wf-table/1，columns=[id,nameEn,meaning,nameZh,method,status]，新專名標提案；review-rows.json採columns=[檔,類別,名稱,白話,掛到]，由review-draft.json取本批33列，白話≤60字。inserts.json採columns=[file,jsonPath,op,value,why]，op只append/setKey；從inserts-draft取涉及本批人物者，無則rows=[]。engine-backlog.json照候選表只記需求，不改引擎。

REPORT第一段「已讀清單」，接著做了什麼；產出與掛點（指向review-rows）；固定工具結果與失敗檔名；沒做到或證據不足；需要決定與引擎支援；子代理；以後交接書該點名的工具（沒有填無）。此批新池**會改營運亂數軌跡**，黃金紅由領導整批後統一重錄。

## 驗收（固定4條，一條不多，做完就停）

1. worktree只新增manifest.files的33檔，既有檔不改；10套三檔齊，3新池來源皆本批背景。
2. npm run check、lore check、typecheck皆0；npm test照實記錄，營運亂數黃金紅列檔名交領導豁免，不自行重錄。
3. REPORT已讀清單齊，naming／review-rows（33列、白話≤60字）／inserts／engine-backlog合法且符合指定欄位。
4. 每人age與born一致、2老手之外省略activeYears、16–19歲不新增、學徒不寫駕駛；lore地方勢力存在，每人有瞬間與招牌話；0個萬潮葬王／AI／新effect。

不要為了更保險加驗其他東西。

## 失敗怎麼處置

測出來壞→在本批允許新檔修到符合；修不好保留檔，REPORT記證據並FAILED，不改別檔湊結果。測不出來→保持現狀、BLOCKED，記卡點與解除條件；不拿舊輸出冒充。姓名衝突交領導決定，不自行擴寫。

## 完成／阻塞回報（必做）

我是 `cx-fp-moon-01`。本輪不用inbox（fp-common明定），由領導以行程結束、最後訊息與檔案收件；最後訊息標DONE／BLOCKED／NEEDS-USER／FAILED，5行摘要＋REPORT路徑。唯一目標是本批33個新檔＋報告＋固定自測，不改既有content或任何整合檔。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。

# 任務：照審定計畫新增 afrwasia 第 01 批可雇駕駛與船員（恰好 38 檔，batch fp-afrwasia-01）

先讀（親自讀，不靠摘要；REPORT 開頭「已讀清單」逐路徑列出）：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`AGENTS.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/people.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/pools.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/cx-fp-afrwasia-01.md`。相對路徑以 worktree 為根；計畫附件若尚未帶入 worktree，就讀主 repo 同路徑。三個範本目錄中的檔案全部讀過；資料表按 batch 查，不整份載入。

## 背景與唯一目標

使用者要填充營運可雇的人。本批把十二個背景、十二個 person、十二個 lore 人物與兩個池接起來。這是產出交接書草稿；領導審定計畫、把 manifest base 填成起點 commit 並備妥 worktree 後才執行。照 people.json 的 batch=fp-afrwasia-01 十二列、pools.json 同批兩列與 plan 第4–8段產出，數值照同級暫填，不做平衡。領導另出的 afrwasia-rulings.md 若存在優先；未有裁示時不得自行換人或增件。

## 方法與禁忌（必守）

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。


共同規格：`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`；基調修正引用 `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第3–4點。這裡只生產人物，不承接其事件／地點擴充件數。

## 範圍（排除法寫死）

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-afrwasia-01/` 新增本批 manifest 的 files 陣列恰好38檔。逐檔路徑清單在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/fp-afrwasia-01.manifest.json`；人物每列 files 的三檔及兩個池 file 是唯一授權集合，不可從種類白名單自行擴檔。完整逐檔規格在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/people.json` 的本批十二列與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/pools.json` 的本批兩列；每人的姓名、性別、age/born、崩前後、性格、瞬間、招牌話、池與 lore 掛點都已定，不需重設計。

person：由 template 複製結構，替換 id/name/age/attrs/traits/tags/will/growth.levelDice；perks=[]，abilities 欄省略；原範本 pools、growth.xpCurve、perkPointsAt 保留。activeYears 僅非 null 者寫入，其餘省略。不要把舊範本的債務、族裔、候選古代機 tags 帶過來；gender、culture、bio 不另造 person 欄。

background：id=background 欄、person=person/id，name=backgroundName；culture、attrRanges、hireFee、wageMult、traits=backgroundTraits 全照人物表，不帶舊範本的 person、傷病或地名。trait 放在 person，只作用一次；不憑職種 tag 發明能力。

character：id=character/id、name 與 person 相同、kind=human、born 照表、faction 照表、places=[place]、role 照表、relations/events 照表、aka=[]、gameRefs=[base:person/id]。tags 用人類與職能；summary 用人物瞬間濃縮，body 依 bodyOutline 三段要點擴成250–450字（至少200），性別、年齡與 personality 寫正文。mech 有值才以其既有名稱寫入；船員與學徒不寫機型，不把人名表裡的 model 註解放進敘述。不寫確證的隱藏真相，新增傳聞另標可見度。所有新顯示專名在審查表標（提案）。bodyOutline中的模板、年齡門檻、引擎限制等註解只作作者約束，不進成品正文；正文只寫人物能看見的事。

recruit-pool：只寫 id、place、size、refreshOn、sources 五欄；池表中的 name/theme/season/batch/file 是設計資料，不是引擎欄位。池的 place 是現有 base place，人物 place 是本區 lore 掛點，兩者不可混換。抽樣數與權重照池表，不加第七個來源。

不做：修改或刪除任何既有檔；不改既有招募池、地點、勢力、年表；不寫 src/、test/、specs/、schemas/、content/index/、content/batches/、effects/、aiprofiles/；wf/ 除報告目錄一律不碰。不 commit。需要既有檔插入只放報告 inserts.json（本批預設空表）；待補地方池參考 pending-pools.json，不得把 pending 值套進遊戲資料。

件數 gate：超過38個新增內容檔就停下回報（manifest 安全上限42不代表可補到42）。容量 gate：單檔超過16 KB或內容合計超過1 MB即停。scratch、driver、log 只放 `/tmp/cx-fp-afrwasia-01/`，worktree 不留清單外檔案。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 依 batch=fp-afrwasia-01 讀 people、pools；寫 review-rows、inserts 亦用 tabledb |
| `grep` | 核對既有 id 與本批新名；若新名已出現，停下回報撞名，不能自行換名 |
| `npm run check` | 內容與引用驗證，末行0 errors |
| `node content/lore/check.ts` | lore 引用、字數驗證；新警告照實記錄 |
| `npm run typecheck` | 收尾一次，0 |
| `npm test` | 收尾一次，列實際失敗檔名；黃金紅依共同規格豁免 |

不准上網、不用 MCP，本批無 probe／playtest。不跑 GOLDEN_UPDATE／rerecord；新池改變營運亂數軌跡，領導整批後統一重錄。

## 資源與禁區

**可寫程式碼線**：只新增上述 worktree 內容清單及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-afrwasia-01/`；scratch 在 `/tmp/cx-fp-afrwasia-01/`。只可讀主 repo。共通禁區：不碰鍵盤、滑鼠、螢幕，不開 GUI，不 push、建分支、rebase、reset，不 commit，不 rm -rf，不改 ~/.codex/config.toml，不裝依賴，不碰 .gitignore。

子代理上限2個，模型隨意；實質工作者親讀 AGENTS.md 與 fp-common.md，範圍再縮到獲分配的檔案；REPORT 記成本與品質。工人不能建立 worktree；由領導事前備妥。

自己打錯指令、路徑或臨時腳本出錯就自己修。只有點名工具本身壞掉或沙箱拒絕必要寫入時才停止，留下 BLOCKED 證據。

## 工作

1. 親讀全部先讀，按 batch 查十二人與兩池，檢查領導已填 base 與備好 worktree。
2. 三檔一組逐人產出，照表接 lore 地方／勢力與招募來源；寫完十二組再寫兩池。
3. 跑下列固定驗收，寫 review-rows.json、inserts.json、REPORT；在最後訊息交付。

## 交付

REPORT 直接寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-afrwasia-01/REPORT.md`。新檔只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-afrwasia-01/content/`；白話審查表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-afrwasia-01/review-rows.json`；插入草稿 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-afrwasia-01/inserts.json`。

review-rows.json 為 wf-table/1，columns [檔,類別,名稱,白話,掛到]，本批38列（含池），從計畫 review-draft.json 依 manifest files 篩出，白話≤60字；新名標（提案）。inserts.json columns [file,jsonPath,op,value,why]，op 只准 append/setKey；沒有需改既有檔即交空表。

REPORT 第一段「已讀清單」，逐條列本書先讀路徑；再寫做了什麼、產出與掛點、驗證結果及新警告、沒做到或證據不足、需要決定與引擎缺口；另寫子代理（沒開寫0），末尾「以後交接書該點名的工具」（無則寫無）。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 改動只有 manifest files 指定的38個新檔，person/background/character 各12與池2，沒有修改既有檔。
2. npm run check 0 errors、lore check 0 errors、typecheck 0；npm test 實跑並列失敗檔名，僅新增池造成的黃金紅可豁免，不自行重錄。
3. 38列 review-rows、合法 inserts 與 REPORT 齊；白話≤60字；REPORT 已讀清單包含全部先讀路徑。
4. 每人姓名、age/born/activeYears、三段出身、瞬間、招牌話及池照計畫；lore 地方勢力存在，池使用既有 base 地點；0個新 effect／AI／萬潮葬王內容。

不要為了更保險加驗其他東西。

## 失敗怎麼處置

測出本批資料壞了就修到符合；修不好保留現狀、REPORT 寫證據，最後回 FAILED。測不出來則 REPORT 寫工具、錯誤與解除條件，回 BLOCKED。不用舊輸出冒充證據，不動舊檔湊綠燈。

## 完成／阻塞回報（必做）

我是 `cx-fp-afrwasia-01`。不用 inbox，本輪領導以行程結束、最後訊息與檔案驗收。最後只要5行摘要＋REPORT路徑；狀態 DONE／BLOCKED／FAILED 擇實際者。不能完成就明列尚缺哪條固定驗收。

> 唯一目標是38個新增內容檔＋報告交付物＋上述驗證；本書任何看似需要改既有檔的情況，都改交 inserts 草稿。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。

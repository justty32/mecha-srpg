# 任務：在隔離 worktree 新增 6 件怪獸二名之夜的 lore 事件（batch kj-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/bio-monsters.md`、`content/lore/style.md`、`content/lore/README.md`（含「可見度」一節）、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/great-tide.md`、`wf/workflows/planning/specs/world/monsters.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/cx-kj-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

年表裡怪獸「二名之夜」被判為孤兒（`wf/workflows/planning/design-notes/world/history-orphans.json`），2026-10-25 裁示：**留在填充層、不硬掛主線節點**。二名的本質是**哀悼**：某地某夜，活下來的人替殺了他們同伴的東西叫出一個名字，名字跟死者一起被記下（崩年的底色 1.8「哀悼變成點名」）。本批只做 **6 件事件**：其中 4 件的年表條目已存在、但沒有事件檔；另 2 件是遊戲裡已有的 A 級二名獸，至今沒有由來。

## 方法（必守）

- **節點優先**：每件掛到年表條目、主線（A–H，`history-lines/lines.md`）或底色某句（1.1–1.13）；**不掛節點 N01–N10**（裁示：孤兒留填充層）。REPORT 每件寫明掛哪裡、前因、後果。沒有因果的不寫——**不暴力產 lore**。
- **對面無臉**：怪獸不寫心思、動機、謀略、對白，不寫「牠記得」「牠在等」「牠選擇」；只寫人看見的、聽見的、失去的。怪獸群打不出井然有序的戰術（守則 B10）。
- 不拿其他作品（遊戲、電影、小說）類比；量級用世界內的詞。
- 中文命名避免直譯（兩步命名，見 polish.md「首要標準」）：古代機本體叫古代機、外層叫裝甲；潮→蝕（蝕潮、蝕月…；海洋本義的潮汐照用）。怪獸多從海洋來、環太平洋為主、內陸少；**不用潮差、潮高解釋凶度**。
- 已裁示的不推翻；新名詞（地名以外的專名、制度名、儀式名）標「提案」，列進 `naming.json`。S 領主、SS／SSS 不寫。
- 真相用可見度欄（`secrets` 的 `hidden`／`rumor`）；`summary`／`body` 照外界口吻。
- 群像為主，**不新增具名人物檔**，`characters` 欄只放既有人物；本文可有只出現一次的無名或小人物。

## 範圍（排除法寫死）

只做下面 6 件；**沒列的一律不做**，「順手也該改」的寫進 REPORT「需要決定的事」。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-01/` 新增 `content/lore/events/` 下**恰好 6 件**，檔名固定：
  1. `landlord-sits.json`：**第一台巢母被看見**（date `2090`，era/first-tide）。年表原文：「孟買外圍第一次有人看見五層樓高、背上開囊口的東西坐下；獵團後來叫牠『房東』。」二名「千囊房東」（`content/base/monsters/nestmother-landlord.json`；`factions/rift-beasts.json` 有「繳稅」說法）。places 用 `place/mumbai-blight`。掛：底色 1.5／1.8、年表 2090。
  2. `red-eye-first-seen.json`：**赤眼兇星初見**（date `2098`，era/yoke-years）。年表原文：「大裂谷外一隻在這一帶少見、背上馱著舊蛻的崖牙殺了三支獵團；奈洛比給牠二名『赤眼兇星』。」內陸少見是重點：牠怎麼到大裂谷的**沒有定論**，外界說法放 `secrets`（rumor），不寫成定論。舊蛻與奈洛比軛鞍行的蛻皮祕法（`specs/world/voices.md`）只能寫成「人們把兩件事放在一起看」，不寫因果。factions 含 `faction/nairobi`；先 `grep -rl 赤眼兇星 content/lore` 讀既有提及（含人物傳聞），不得矛盾。
  3. `white-night-first-seen.json`：**白夜初見**（date `2100`，era/yoke-years）。年表原文：「雅庫茨克外一片菌床整個夏天發光，殘翼第一次用燒夷矢燒它；二名『白夜』。」places 用 `place/yakutsk-bed`（先讀它，不得矛盾）；菌絲沿淡水的例外。不寫成殘翼空援轉型的轉折（那是 N05，不掛）。
  4. `first-nest-taken.json`：**第一隻被捕的巢母**（date `2103`，era/tide-line）。年表原文：「鐵砧在萊茵蝕溝捕到一隻寬度 C 的巢母，牠沿與北海相通的萊茵河口上溯而來；殘聯前身與沐蝕會同時派人來看。」places `place/rhine-trench`，factions 含 `faction/anvil`。兩方來看什麼、各自帶走什麼看法可寫，**不寫成立法或制度的前因**。
  5. `star-grave-named.json`：**負天星塚**的命名之夜（崖牙，A；`content/base/monsters/cliffjaw-star-grave.json`）。日期你定，落在 2102–2106（era/tide-line 或 era/league，與 date 一致）；地點在環太平洋岸，places 用 `place/sydney` 或 `place/auckland`（先讀該檔）。二名要從「牠做過的事＋牠的樣子」讀得出來（崖牙背馱舊蛻）。掛：底色 1.8、F 線（蝕線＝海岸線）。
  6. `last-vesper-named.json`：**無人應答**的命名之夜（群喉，A，俗名「晚禱」；`content/base/monsters/choir-last-vesper.json`）。日期你定，落在 2102–2107；地點在環太平洋岸，places 用 `place/quito`（基多渡月港城邦，先讀）或以上兩者之一，但**不得與第 5 件同地**。題眼：某處傍晚點名或呼叫，該回話的那一頭沒有人回話。不要撞既有的「五聲葬月」（`events/moon-drowned.json`，同為群喉）寫法。掛：底色 1.8。
- 每件 body 寫明「是誰、在什麼場合叫出這個名字」；名字被記在哪裡（巡查冊、獵牌紀錄、城門的牆…自定，屬新制度名就標提案）。
- 欄位照 `content/lore/README.md` events 節：body 300–1500 字、`## ` 小標 3–5 個、`consequences` 一句一條、`period` 與 `date` 落在該 era 內；`kind` 用 `災難` 或 `其他`；`tags` 含 `tide`。**event 不加 `gameRefs`**（README 未登記，見 engine-backlog 第 27 列）。
- **年表不由你改**：`content/lore/timeline.json` 一律不碰。改成在報告目錄寫 `timeline-entries.json`：只列第 5、6 件要新增的年表條目（格式照 README timeline 節，帶 `event`、`era`、`factions`、`tags`）；第 1–4 件年表已有，由領導補 `event` 欄。
- 不做：修改或刪除任何既有檔；`characters/`、`places/`、`factions/`、`timeline.json` 一律不動；`src/`、`schemas/`、`test/`、`wf/`（除報告目錄）、`content/index/`、`content/batches/`、`content/base/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-kj-01/`）。
- 件數 gate：新增檔超過 6 件就停下回報；容量 gate：單檔超過 16 KB，或新增內容合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑，0 錯（「未出現在 timeline」警告是預期的，照實寫進 REPORT） |
| `npm run check` | 收尾跑，末行 `OK 0 errors` |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（`history-timeline.json`、`history-lines.json`、`history-orphans.json` 等；實際路徑 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj-01 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-01/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準是已知現象，照實寫進 REPORT。

## 工作

1. 讀「先讀」全部；讀 `content/lore/factions/{rift-beasts,nairobi,anvil,remnant-wings,tide-creed}.json`、`places/{mumbai-blight,yakutsk-bed,rhine-trench,sydney,auckland,quito}.json`、`events/{moon-drowned,mirror-vigil,rust-banner,wreck-crown,bellless-dawn,nine-gates}.json`（既有二名之夜的寫法範本）、`content/base/monsters/` 下相關 6 檔與其 species、`timeline.json` 中 2089–2108 的怪獸條目。
2. 定 6 件清單（id、date、era、掛哪條線／底色、一句梗）與命名表。
3. 寫檔；每檔後 `node content/lore/check.ts`。
4. `npm run check`、`npm test` 收尾；寫 `timeline-entries.json`、`naming.json`、`review.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新事件檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-01/content/lore/events/` |
| 年表條目（第 5、6 件） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-01/timeline-entries.json` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-01/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-01/review.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-01/REPORT.md` |

`timeline-entries.json`：`{"entries":[…]}`，條目格式同 `content/lore/timeline.json`。

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，`method` 填意譯／音譯／混用，`status` 填「既有」或「提案」；涵蓋每個新檔的顯示名與文中新出現的專名。

`review.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[…]}`，每個新檔一列：`檔`＝相對 repo 根的路徑；`類別`＝「二名之夜」或「事件」；`名稱`＝顯示名；`白話`＝一到兩句、**不超過 60 字**，給沒讀過設定的人看：它是什麼、為什麼存在，不堆術語；`掛到`＝年表條目／主線／底色句。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——每件一行：id、date、era、掛到哪、前因→後果一句；沒做到或證據不足的；需要決定的事，含你發現的既有 lore 矛盾）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有** 6 個新事件檔（`git status --short` 除 `node_modules` 外只見這些）。
2. worktree 內 `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`；`npm test` 0 fail。
3. 6 件逐一對上範圍第 1–6 項的檔名、日期、地點限制；第 1–4 件與年表原文不矛盾。
4. REPORT「產出」每件寫明掛點與前因後果；怪獸側 0 句心思／動機／對白。
5. `naming.json` 涵蓋每個新檔；`review.json` 每檔一列、白話 ≤ 60 字；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞；引用既有專名例外）、0 個 style.md 禁用詞。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj-01`。本線團隊：`teams/kaiju`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj-01 --up DONE '一句自足結論' /tmp/cx-kj-01/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-kj-01 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增 6 個事件檔＋報告目錄的交付檔＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

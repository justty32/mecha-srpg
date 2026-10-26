# 任務：在隔離 worktree 照計畫書新增 10 個 lore 檔並對 5 個既有檔做純插入（batch am-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`、`wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/PLAN.md`、`content/lore/places/montreal.json`、`content/lore/places/new-york-hollow.json`、`content/lore/places/panama-locks.json`、`content/lore/places/brasilia.json`、`content/lore/places/denver.json`、`content/lore/events/xingtian-registry.json`、`content/lore/events/renaming-day.json`、`content/lore/events/bellless-dawn.json`、`content/lore/events/rust-banner.json`、`content/lore/events/credit-accord.json`、`content/lore/characters/xingtian.json`、`wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-02.md`。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同（計畫書 `am-plan/PLAN.md` 在主 repo，worktree 裡也有同一份）。

## 背景與唯一目標

南北美洲 lore 填充的第一批 am-01 已入庫；計畫線 cx-am-plan 寫了第二、三批的計畫書 `wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/PLAN.md`，領導已審過。本批唯一目標：照計畫書第 4 節「am-02」那張表、第 5 節插入清單、第 6 節年表清單，以及下面「領導補充」，把內容寫出來並潤好文筆與口吻；而**既有 lore 一字不改**。計畫書沒寫到的細節由你判斷，但不得越出本交接書的範圍與禁忌。數值不在本批（lore 檔沒有數值）。

## 領導補充（優先於計畫書）

- **人物**：每人 `kind` human、`gameRefs` []；`born` 照計畫；`relations` 只指向既有人物 id 或本批人物；`events` 只指向既有事件或本批事件；body 寫他／她崩年前是什麼、崩年後變成什麼、2108-01 在做什麼（一個具體的日常動作），**不寫成英雄傳**，群像口吻；可帶一兩句台詞，但不喊口號。開機甲的人老得慢這條只有駕駛員適用——這五人都**不是駕駛員**。
- C1 瑪艾爾：守的是蒙特婁城外那個看守崗（見 `events/xingtian-registry.json`）；**刑天維持沉睡、不寫它動或醒、不暗示會認誰**；她沒有權開學會的門，只管登記進出的人；她本人是法語裔加拿大人、穿美國的制服——裂痕寫在她身上。relations 可加 `character/eugenia-ferrero`。
- C2 伊文：不能贖地、只能估價；可寫他替回來找家的人抄舊門牌號（國家默許、債主不許）。
- C3 達里奧：閘城議長由出錢的商團與庇護獵團坐席產生；他在 E3 立約時交出自家優先泊位換庇護費；不准通緝在案的船入港（city-types：自由城市獵牌效力最高）。`faction` null。
- C4 賽拉斯：收殮人，把〔2101-08-15 借火催曉〕〔2106-10-15 鏽旗出殯〕兩夜帶不回的人逐名念完（底色 1.8「屍體埋不了，哀悼變成點名」；「唱名夜」是提案名，可用）；`events` 掛 `event/bellless-dawn`、`event/rust-banner`；**不改那兩個事件檔**；不寫怪獸資料。`faction` null。
- C5 莉維亞：糧商出身、坐巴西在拉美傘的國家席位（席位是國家的，不是她的）；relations 可加 `character/joao-ferreira`。
- **事件**：E1 政府進山 `2089-06`（era/first-tide）；E2 紐約地契 `2098`（era/yoke-years；塞勒涅是窗口、錢是穹頂底下的、塞勒涅不買死人的債）；E3 閘城立約 `2094`（era/mimic-dawn；環線商隊與拉美傘那時還不存在，不能當創約方）；E4 另一本帳 `2107`（era/league；對照 `events/credit-accord.json`：不要求催收權，改拿礦、糧、港抽成）；E5 墨西哥城徵召令 `2107-06`（era/league；墨西哥城不是自由城市；徵召令仍有效，獵團往巴拿馬閘城躲，因為那裡國家徵召令無效）。
- 計畫書第 7 節的白話是草稿；你寫完後依實際內容改好，交 `review-rows.json`。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件都掛到計畫書寫的節點／主線／年表／崩年底色，有因有果；REPORT 逐檔寫掛點。不新增計畫書以外的具名人物、地名、事件、機體名、招式名、公司名、幫派名。
- **不拿其他作品類比**；量級用世界內的詞。
- **中文命名避免直譯**；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機本體叫古代機、外層叫裝甲；蝕潮（口語蝕）、漲潮、大潮；矢、衍型機、機魂、墟、骸片。禁用詞照 style.md。名字照 manifest 命名表，不另取。
- **國家、塞勒涅、巨頭只削弱不萬能**；塞勒涅不出場當主謀。
- **已裁示不推翻**：`cx-am-01.md`「背景」與「已裁示不推翻」兩節全部沿用（美國只改名、國家不死；2101 是各區代表；聖保羅核心在桑托斯灣區、巴西退守巴西利亞；2106 費雷羅運回刑天；**刑天沉睡、認不認伊爾瑟不預決**；維拉科查不離安地斯、基多不出洲）。
- **不寫後設語**：正文不得出現「提案」「玩家」「節點」「裁示」「主線」這類設計層的字；外界口吻。
- **不寫真實歷史人名**；總統、富豪、公司、幫派維持群像不點名。
- **真相用可見度標**：外界不知道的放 `secrets`（`visibility: hidden`）或 `rumor`。
- **不造機甲型號與怪獸資料**（另有專線）；需要就引用既有的，或在 REPORT「需要決定」列需求。

## 範圍（排除法寫死）

- 新增只限這 10 檔（在 worktree 的 `content/lore/` 下）：`characters/maelle-bellerive.json`、`characters/evan-cresswell.json`、`characters/dario-urena.json`、`characters/silas-mercer.json`、`characters/livia-avelar.json`、`events/government-inland.json`、`events/new-york-deeds.json`、`events/lock-city-charter.json`、`events/another-ledger.json`、`events/mexico-muster.json`。
- 修改只限這 5 檔且**只准插入**（物件加新鍵、陣列加新元素；既有鍵與元素一字不動，閘門逐節點比對）：`timeline.json`、`factions/quito.json`、`factions/ring-caravan.json`、`places/great-lakes-mycelium.json`、`places/sao-paulo-blight.json`。
- 不做：上列以外的任何檔（含 `content/index/`、`content/batches/`、`content/base/`、`src/`、`wf/` 除報告目錄、計畫書本身）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-am-02/`）。
- 件數 gate：新增加修改超過 15 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯；警告數不得比改前多） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；**不用跑 `npm test`**（領導驗收會跑） |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-02/review-rows.json add 檔=… 類別=… 名稱=… 白話=… 掛到=…` | 寫審查表 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-am-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-am/wt-am-02/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-02/`；**不 commit**（沙箱下 `.git` 唯讀）。報告目錄只放 REPORT.md 與 review-rows.json。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意（可派一個審文筆口吻）；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-am-02 --up PROGRESS '已讀完先讀清單，開始寫 am-02' < /dev/null`）。
2. 照計畫書寫新增檔，再做插入與年表。
3. 通讀一遍潤文筆與口吻（群像、不煽情、不堆術語、照 style.md），跑檢查。
4. 寫審查表與 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-02/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

**白話審查表（必交）**：同目錄 `review-rows.json`（契約 wf-table/1：`{"contract": "wf-table/1", "source": "../cx-am-02.md", "extracted": "2026-10-26", "columns": ["檔", "類別", "名稱", "白話", "掛到"], "rows": []}` 先寫表頭再用 tabledb add），本批每個**新增**檔一列（10 列）：`檔`＝repo 相對路徑、`類別`（人物／事件／地點）、`名稱`、`白話`（一到兩句、**不超過 60 字**、給人看的白話：它是什麼、為什麼存在）、`掛到`（節點／主線／年表／底色條）。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增與插入的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-am/wt-am-02/content/lore/…`（上列 15 檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-02/REPORT.md` |
| 審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-02/review-rows.json` |

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋掛點、做了什麼插入；產出；沒做到或證據不足的；需要決定的事：與既有 lore 或設定筆記的矛盾、偏離計畫書之處、需要的機型或怪獸，逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 不多於改前。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 10 個新檔存在、檔名＝id name 段；5 個既有檔只有插入（領導用 `content_gate` 驗）。
4. REPORT 存在且開頭有「已讀清單」；`review-rows.json` 存在、10 列、每列白話 ≤ 60 字。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-am-02`。本線團隊：`teams/fill-am`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-am-02 --up DONE 'am-02 新增 10 檔、插入 5 檔，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-02/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

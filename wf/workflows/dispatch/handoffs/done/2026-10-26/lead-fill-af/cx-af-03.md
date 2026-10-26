# 任務：在隔離 worktree 新增 4 個具名人物 lore 檔，替撒南、西亞、北非的四個節點補上面孔（batch af-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/polity.md`、`content/lore/factions/sub-saharan-umbrella.json`、`content/lore/factions/west-asia-umbrella.json`、`content/lore/events/gold-reef-night.json`、`content/lore/events/twin-rivers-night.json`、`content/lore/events/suez-canal-night.json`、`content/lore/events/yoke-riders-abroad.json`、`content/lore/events/hunter-license-act.json`、`content/lore/places/gold-reef.json`、`content/lore/places/twin-rivers.json`、`content/lore/places/suez.json`、`content/lore/places/mombasa.json`、`content/lore/characters/wanjiku-kamau.json`、`content/lore/characters/juma-kiprop.json`、`content/lore/characters/farida-naseri.json`、`content/lore/characters/nadia-sabri.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/PLAN.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/cx-af-03.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

本線前兩批（af-01、af-02）已立三把傘、五個群像夜與城邦代表地；使用者問「有名人物呢？」。本批唯一目標：照**領導已審過的計畫書** `af-03/PLAN.md`「逐件」寫 4 個具名人物檔——薩蕾・恩多維（撒南傘調度人）、泰莫・莫魯恩（金山深井管井人）、薩赫恩・達里姆（斷橋夜倖存者、停戰線渡船）、賽芙娜・蘇蕾恩（運河夜護航隊長）。名字、出生年、陣營、身分、因果、關係列、事件 id、外觀與口頭禪、白話草稿照計畫書；文筆口吻由你微調。**既有 lore 一字不改**。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件都要掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（每檔都寫了掛點，body 裡要讀得出前因與後果）；不新增規格以外的具名人物、地名、事件、機體名、招式名、組織名。
- **不拿其他作品類比**：不寫任何外部作品名；量級用世界內的詞。
- **中文命名避免直譯**；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機、裝甲、蝕潮、漲潮、大潮、矢、衍型機、機魂、墟、骸片、裂晶、精粹、軛騎。禁用詞照 style.md。
- **國家、塞勒涅、巨頭、幫派只削弱不萬能**：自由城市守得住靠「沒人值得為它打一仗」；黑幫城市沒有傘救、繼承就是內戰；公司城法理仍屬國家；空城產權歸國庫、多半已抵押（搜刮規則「國家默許、債主不許」）。
- **已裁示不推翻**：city-types 已定的數量與規則（黑幫城市不認獵牌評等、白手套催收權管不到；自由城市國家徵召令無效、獵牌效力最高）；綠線幫是蝕匪幫不是黑幫城市；拉哥斯外圍綠線殘部蝕匪邦（在蝕線之內）已定；歸還黨三支（孟買、桑托斯灣區、拉哥斯難民），拉哥斯支**只寫存在與起源**，不寫它打過的仗；2089–2092 出生的孩子極少；渡月船拒載獸（2102 奈洛比港事件）；奈洛比、蒙巴薩、三蘭港是殘聯與撒南傘的雙籤城，日常行政歸撒南傘，大潮夜向誰求援自選、求援紀錄是政治表態。
- **人物**：只寫計畫書的四個；每人要有崩前（或崩年）→節點→2108-01 狀態，有因有果。不寫真實人名；不給他們古代機或新機型——需要機體就寫既有的（`堅盾-I`、`牧杖-III型（C）`、`牧者（B）`）或「拘束的掘犬」這類既有獸名；外表與口頭禪照 `content/lore/style/people.md`。
- **真相用可見度標**：外界不知道的放 `secrets`（`hidden`），只是傳聞的標 `rumor`；`summary`／`body` 照外界口吻。
- 所有交叉引用必須指向 worktree 裡已存在的檔或本批新檔（不要引用 `faction/euro-umbrella` 等主 repo 沒有的檔）。



**領導對計畫書「風險與矛盾」的裁定**：六條全照計畫書建議——(1) 雙籤城只沿用「日常歸撒南、求援自選」兩句；(2) 泰莫管日常排班與供應，井口仍由國家與傘共管；(3) 泰莫是塌穿後第一趟復探的帶班者，不是井底生還者；(4) 斷橋只寫留下的疑懼，不說違反未簽的協定、不指定哪一方炸橋；(5) 賽芙娜主掛 N08，事發時還沒有獵牌法、事後採用；(6) 調獸一律連拘束艙與騎手，金山只寫採掘與供應。`faction` 欄：賽芙娜填 `null`。`relations` 只用計畫書列的四列。

## 範圍（排除法寫死）

- 新增只限這 4 檔（在 worktree 的 `content/lore/characters/` 下）：`sarei-ndovi.json`、`temo-moruen.json`、`sahen-darim.json`、`saevna-suren.json`。
- **白話介紹（使用者要求，必交）**：4 檔每檔一列，寫進 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/review-add.json`，格式 `{"rows":[{"檔":"content/lore/characters/…json","類別":"人物","名稱":"顯示名","白話":"…","掛到":"…"}]}`；`白話`一到兩句、**不超過 60 字**，以計畫書草稿為底。
- 不做：上列以外的任何檔（含 `timeline.json`、既有 lore、`content/index/`、`content/batches/`、`content/base/`、`src/`、`wf/` 除報告目錄）；不新增事件、地點、勢力；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-af-03/`）。
- 件數 gate：新增超過 4 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。任一觸發都停。

## 逐檔規格

格式照 `content/lore/README.md` characters 欄位表；`body` 300–1000 字；`gameRefs` `[]`；`kind` `human`。內容照 PLAN.md「逐件」。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-af-03 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |


## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列 4 檔（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-03/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/`（只放 REPORT.md、review-add.json）；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-03 --up PROGRESS '已讀完先讀清單，開始寫 af-03' < /dev/null`）。
2. 依計畫書寫 4 個人物，最後寫 review-add.json。
3. 跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-03/content/lore/characters/…`（上列 4 檔） |
| 白話介紹 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/review-add.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/REPORT.md` |

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋掛到哪；產出；沒做到或證據不足的；需要決定的事：與既有 lore 或設定筆記的矛盾逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 不比開工前多。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 4 個新檔存在、檔名＝id name 段；`review-add.json` 合法、4 列、每列`白話`≤ 60 字。
4. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-af-03`。本線團隊：`teams/fill-af`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-03 --up DONE 'af-03 新增 4 個人物、白話 4 列，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

# 任務：在隔離 worktree 新增 7 個 lore 檔並對 7 個既有檔做純插入，寫成埃吉爾認主事件與歐傘那一盤（batch ag-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/aegir.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`wf/workflows/dispatch/handoffs/plan-epic/v3.md`（第 1 節、第 3.5 節歐洲段、文末裁示）、`content/lore/factions/salt-gull.json`、`content/lore/places/skagerrak-shell.json`、`content/lore/events/skagerrak-shell-found.json`、`content/lore/events/skagerrak-incident.json`、`content/lore/characters/molly-van-den-berg.json`、`content/lore/events/hunter-license-act.json`、`content/lore/events/gull-anvil-truce.json`、`content/lore/factions/anvil.json`、`content/lore/places/saint-malo.json`、`content/lore/places/istanbul.json`、`wf/workflows/dispatch/handoffs/lead-aegir/cx-ag-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

使用者 2026-10-26 定案：本作唯一演繹傳統超級機器人「第一集」的古代機是北海的**埃吉爾**；開局（2108-01）時它**至今無人能認**，認主是開局後可能發生的事件。歐洲是聯盟型的「歐洲那把傘」（口語歐傘）：大西洋岸平民港城用機、內海老家族造機；家族出價買獵團，獵團公會是議價場。本批唯一目標：照下面「逐檔規格」新增 7 檔、對 7 個既有檔做純插入，讓百科裡有歐傘那一盤與埃吉爾認主事件，而**既有 lore 一字不改**。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件都要掛到既有節點、主線或年表（下面每檔都寫了掛點）；不新增規格以外的具名人物、地名、事件、機體名、招式名。
- **不拿其他作品類比**：不寫任何外部作品名、角色名；「超級機器人」只能當類型詞，最好不出現在文本裡。
- **中文命名避免直譯**；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機本體叫古代機、外層叫裝甲；蝕潮、漲潮、大潮、晝潮；矢、衍型機、機魂、魂核。禁用詞照 style.md。
- **國家、塞勒涅、巨頭、家族只削弱不萬能**：家族有地、有錢、有工坊，但守不住大西洋岸、買不到古代機認主；塞勒涅不出場當主謀。
- **已裁示不推翻**：埃吉爾 2102 出土、鹽鷗命名、矢殘片嫁接、2105 鹽鷗守住、開局至今無人能認；茉莉 2108 年四十八歲；鹽婆是 S 級人格機魂；聖馬洛九門同喪 2107-04-15。
- **不親手殺的規定不存在**：埃吉爾會親手殺獸；但**不建招式名制度**，埃吉爾不喊招式名。
- **真相用可見度標**：外界不知道的放 `secrets`（`visibility: hidden`）或條目根 `visibility`；`summary`／`body` 照外界口吻。
- **富豪與家族群像不點名**：不寫任何家族姓氏、家主名字；埃吉爾的認主者**不給本名**，只用鹽鷗給他的稱呼「拆件的」。

## 範圍（排除法寫死）

- 新增只限這 7 檔（在 worktree 的 `content/lore/` 下）：`events/aegir-wakes.json`、`events/aegir-lien.json`、`events/first-bid-sheet.json`、`factions/euro-umbrella.json`、`factions/inner-sea-houses.json`、`places/genoa-yards.json`、`places/alpine-shell.json`。
- 修改只限這 7 檔且**只准插入**（物件加新鍵、陣列加新元素；既有鍵與既有元素一個字都不動，閘門會逐節點比對）：`timeline.json`、`factions/salt-gull.json`、`places/skagerrak-shell.json`、`places/rotterdam-roost.json`、`places/hamburg.json`、`places/saint-malo.json`、`places/istanbul.json`。
- 不做：上列以外的任何檔（含 `content/index/`、`content/batches/`、`content/base/`、`src/`、`wf/` 除報告目錄）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-ag-01/`）。
- 件數 gate：新增加修改超過 14 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。任一觸發都停。

## 逐檔規格

格式照 `content/lore/README.md` 欄位表；`body` 300–1500 字、markdown、可用 `## ` 小標。名字是領導定的提案名，照用，不另取。

### 1. `factions/euro-umbrella.json`「歐洲那把傘」

- `aka`: `["歐傘"]`；`type` 大勢力；`founded` `"約 2102"`；`hq` 寫「無固定總部：席位輪在內海家族的城」這類；`leaders` `[]`；`ideology` 一句（方向：誰出價，誰的城先有人守）。
- 掛點：G 傘政治線——2101 新加坡會議後正式成立的聯盟型傘；縮小的歐洲諸國共組、席位是國家的，但實權在老家族（before-collapse-powers 歐洲段）；兩岸分裂（內海造機、大西洋岸用機）；2107 九門同喪是「大西洋岸在燒、內海在賒帳賣機」。
- `body` 先一段崩前→2108（表面共和議會、實權在老家族；崩年挨打的是大西洋岸平民港城），再**必含四小節**：`## 軍事組織與作戰風格`（不養大軍：大潮援軍靠競標，獵團是受雇私兵，鐵砧、鹽鷗是最大的兩支）、`## 對傭兵：態度與補給`（家族出價、獵團公會議價並定價格上限；付現的是家族、付港費與賒帳的是平民港城）、`## 藍本古代機與研發路線`（歐傘自己沒有一台認了主的古代機：墟多在家族的地上；堅盾在伊斯坦堡下線；埃吉爾在紙上押在一個內海家族手裡，見 aegir-lien；不新增機體名）、`## 外交`。可提歐洲大西洋岸有少數自由城市，但**不指名哪一座**。
- `relations`（2108 當下）：`faction/inner-sea-houses` 同盟、`faction/league` 緊張（殘聯替歐傘的獵團發牌、評等管到它頭上）、`faction/selene` 友好（家族的錢在穹頂底下）、`faction/anvil` 友好、`faction/salt-gull` 中立、`faction/shell-society` 緊張（挖墟要跟家族談）、`faction/remnant-wings` 中立。
- `places`：`place/hamburg`、`place/rotterdam-roost`、`place/saint-malo`、`place/istanbul`、`place/genoa-yards`。`mercPolicy`：generosity 4、reliability 3，note 一句（出價高、但標可以被更高的價搶走）。可加 `mechSeries`：只能寫既有的（`堅盾-I`、`鐵砧-II型（C）`、`長槍-V4「鹽鷗」型（C，兩棲）`）。`gameRefs` `[]`。

### 2. `factions/inner-sea-houses.json`「內海諸家」

- `type` 其他；`scale`：數十個老家族的群像；`founded` `"崩前（不明）"`；`hq`：內海沿岸與內陸高地的家族領地；`leaders` `[]`；`ideology` 一句（方向：地在，家就在）。
- 掛點：before-collapse-powers 歐洲段＋magnates「穹頂下的錢」（歐洲老家族是三股之一：崩年家族的錢與家主買船票上了月，地上留分支管地、工坊、獵場）；polity「債與地契」。
- `body`：崩前（土地、老錢、媒體、獵場，未必有爵位）→崩年（錢上月、分支留地）→2108（家族工坊造機、賒帳賣往大西洋岸；出價買獵團；墟在他們的地上，稽古學會要先談；按季寄帳單給鹽鷗）。**不點名任何家族**。
- `relations`：`faction/euro-umbrella` 同盟、`faction/selene` 友好、`faction/salt-gull` 中立（債主與欠債的，鹽鷗準時付）、`faction/anvil` 友好、`faction/shell-society` 緊張、`faction/league` 緊張。`places`：`place/genoa-yards`、`place/alpine-shell`。
- `secrets` 一列：`visibility: "rumor"`，text 方向「家族寄給鹽鷗的帳單，錢最後流進穹頂底下」，`knownBy` `["faction/backside"]`。

### 3. `events/first-bid-sheet.json`「第一張標單」

- `date` `"2102"`、`period` `era/tide-line`、`kind` 政治；tags `["diplomacy"]`。
- 掛點：N06 2101 新加坡會議之後歐傘成立；G 線「歐傘競標」；2093 防線私有化（`event/first-hunting-bands`）的延續。
- 內容：歐傘成立文件把大潮援軍寫成競標——每個大潮前，各城與家族對登記的獵團出價，獵團公會坐席議價、定價格上限（「英雄有時薪」的來處）。第一張標單上，內海的家族用現金標走了最好的獵團，大西洋岸平民港城只標得到剩下的；兩岸分裂從此寫在紙上。鐵砧、鹽鷗可出現但不寫他們的對白。
- `factions`：`faction/euro-umbrella`、`faction/inner-sea-houses`、`faction/anvil`、`faction/salt-gull`；`places`：`place/hamburg`、`place/rotterdam-roost`、`place/genoa-yards`；`characters` `[]`。`consequences` 3–4 條。

### 4. `events/aegir-lien.json`「埃吉爾的帳單」

- `date` `"2106"`、`period` `era/league`、`kind` 其他；tags `["diplomacy"]`。
- 掛點：2104 鹽鷗折損一半、2105 斯卡蓋拉克事件、2106 鹽鷗鐵砧火併半年後停火——鹽鷗沒錢了；2106 獵牌法把登錄機魂算裝備，殘聯評等把埃吉爾也登記成「鹽鷗的裝備」。
- 內容：一個**不具名的內海家族**出錢修機、付斯卡蓋拉克的守夜錢，換一張以「鹽鷗的裝備：埃吉爾」為抵押的契；茉莉簽了。老鴿三次出價她一片都沒賣——這次她也沒賣，她押了整台。家族從此按季寄帳單，鹽鷗從不遲付。黑色幽默可以有：被當零件庫的古代機，在紙上是一筆抵押品；第三刃拿月亮的錢沒搶到的東西，一張契就押走了。
- `factions`：`faction/salt-gull`、`faction/inner-sea-houses`、`faction/league`；`characters`：`character/molly-van-den-berg`；`places`：`place/skagerrak-shell`、`place/rotterdam-roost`。`consequences` 3–4 條。

### 5. `events/aegir-wakes.json`「沒上船的人」（開局**未發生**）

- 條目根 `"visibility": "hidden"`（開局沒發生，百科不顯示）；`date` `"2108"`、`period` `era/league`、`kind` 挖掘；tags `["dig", "tide"]`。
- `summary` 開頭就寫明：開局時尚未發生，是開局後某個漲潮夜可能發生的事（大潮夜機率高很多），日期不定。
- 內容（照 aegir.md「第一集」，可寫畫面）：鹽鷗照規矩在斯卡蓋拉克退潮時鋸殘片，規矩是「離船作業一小時必撤」（從茉莉在港務局排引水班時帶來的時間感：潮不等人）；拆件技工——鹽鷗叫他「拆件的」，丹麥裔，這些年把埃吉爾的矢一片片鋸下來嫁接到別的機上的人——因為一片殘片卡在吊臂上沒上船。不是英勇。茉莉照規矩在一小時整撤了（她有一隻港務局帶出來的懷錶，可寫她看錶）；鹽鷗的規矩第一次被破，破的人不是團長。獸從水裡上來，埃吉爾醒了，認了他——它選了一直在拆它的人。可寫它親手殺了那一夜上岸的獸；它**不喊招式名**、自己沉默，替它吼的是鹽婆。結尾留：他這輩子下不了船（羈絆：離它超過一蝕月會衰弱，它兩棲、跟船走）；殘聯評等仍把它登記成「鹽鷗的裝備」；內海家族的下一張帳單照寄。若候鳥號在場，玩家只是見證，不是觸發者（寫一句即可）。
- **不寫歸矢已發生**；歸矢只放在本檔的 `secrets`：一列 `visibility: "hidden"`，text 方向「嫁接出去的矢從沒離開埃吉爾：認主夠深的某個大潮夜，它會一次收回所有殘片（提案名「歸矢」），鹽鷗整隊的矢同時失效；認主者性格趨神性、外貌趨天人之貌；不可逆，一代最多一次」，`knownBy` `[]`。再一列 hidden：「拆件的若死，埃吉爾回海裡躺著，鹽鷗回到一小時必撤」。
- `factions`：`faction/salt-gull`、`faction/inner-sea-houses`；`characters`：`character/molly-van-den-berg`、`character/salt-crone`；`places`：`place/skagerrak-shell`。`consequences` 3–5 條（認主、規矩被破、他下不了船、帳單與評等照舊；不寫歸矢）。

### 6. `places/genoa-yards.json`「熱那亞船塢」

- `region`「歐洲・利古里亞海北岸」、`continent` 歐洲、`world` earth、`kind` 港、`status2108`「守住（內海，少見獸上岸）」。`factions`：`faction/inner-sea-houses`、`faction/euro-umbrella`。
- 掛點：「內海造機、大西洋岸用機」；九門同喪那一夜這裡的家族工坊在賒帳賣機給大西洋岸。內容：家族工坊（不點名）照公刻圖紙與型錄件組衍型機、蓋家族的印、賒帳賣往大西洋岸平民港城；**不新增機體系列名**。四段照既有地點檔（地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼）。

### 7. `places/alpine-shell.json`「阿爾卑斯之墟」

- `region`「歐洲・阿爾卑斯山區」、`continent` 歐洲、`world` earth、`kind` 遺跡、`status2108`「家族封著，稽古學會在談」。`factions`：`faction/inner-sea-houses`、`faction/shell-society`。
- 掛點：歐洲家族的地上有墟（before-collapse-powers 咬合第一條）；稽古學會挖墟得跟家族談。內容：家族獵場底下的墟，刻痕與骸片，**沒有古代機、不寫有古代機**；家族收入場費、學會要讀刻痕先付錢。獵團能做的：護送學會的人、替家族巡獵場、偷抄刻痕（被抓會上家族的黑名單）。

### 8. 既有檔的純插入

- `timeline.json`：插三條到正確排序位置（不動既有條目、不重排）：`2102`「第一張標單」（`event/first-bid-sheet`、era `era/tide-line`、factions 歐傘與內海諸家、tags `["diplomacy"]`）；`2106`「埃吉爾的帳單」（`event/aegir-lien`、era `era/league`、tags `["diplomacy"]`）；`2108`「沒上船的人」（`event/aegir-wakes`、era `era/league`、tags `["rumor", "dig"]`、加 `"visibility": "hidden"`）——年-only 的 `2108` 依規則排在所有 `2108-01` 之前、`2107-11-15` 之後。同年內插在該年既有條目之後。
- `factions/salt-gull.json`：`relations` 尾端加兩列：`faction/euro-umbrella` 中立、`faction/inner-sea-houses` 中立（note：按季寄帳單的債主，鹽鷗從不遲付）。不動其他欄。
- `places/skagerrak-shell.json`：`factions` 尾端加 `faction/inner-sea-houses`。
- `places/rotterdam-roost.json`、`places/hamburg.json`、`places/saint-malo.json`、`places/istanbul.json`：`factions` 尾端各加 `faction/euro-umbrella`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯；警告數不得比改前多） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ag-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-01/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-01/`；**不 commit**（沙箱下 `.git` 唯讀）。報告目錄只放 REPORT.md。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-ag-01 --up PROGRESS '已讀完先讀清單，開始寫 ag-01' < /dev/null`）。
2. 先寫兩個勢力檔，再寫兩個地點、三個事件，最後做第 8 節插入。
3. 跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-01/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增與插入的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-aegir/wt-ag-01/content/lore/…`（上列 14 檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-01/REPORT.md` |

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋掛到哪個節點／主線／年表／做了什麼插入；產出；沒做到或證據不足的；需要決定的事：發現與既有 lore 或設定筆記矛盾的地方逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 不多於 2。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 7 個新檔存在、檔名＝id name 段；7 個既有檔只有插入（領導用 `content_gate` 驗）。
4. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ag-01`。本線團隊：`teams/aegir`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ag-01 --up DONE 'ag-01 新增 7 檔、插入 7 檔，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-aegir/ag-01/REPORT.md（STATUS 與標題照實際結果換）`。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

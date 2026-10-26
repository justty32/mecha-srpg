# 任務：為 lore 填充第二批（中日韓俄＋中亞邊緣的人物、地點、事件）寫一份可審的計畫書，不寫任何 lore 檔（plan ea-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫書開頭列「已讀清單」）。下列路徑都相對主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/`：`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`（與 `content/lore/style/people.md`）、`content/lore/README.md`（含「可見度」）、`wf/workflows/planning/design-notes/world/history-lines.md`（「崩年的底色」十三句）、`history-lines/lines.md`、`before-collapse.md`、`before-collapse-powers.md`、`polity.md`、`city-types.md`、`magnates.md`（後六檔都在 `wf/workflows/planning/design-notes/world/`），`drive.md`、`history-lines/g-umbrella.md`、`history-lines/b-ancient.md`（都在 `wf/workflows/planning/design-notes/world/`），以及第一批的成果：`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/review.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/ea-01/REPORT.md`，與領導的需求初稿 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/cx-ea-02.md`（只當需求參考，不要執行它）。

## 背景與唯一目標

lore 進入填充層（框架 2026-10-26 定）。本線 lead-fill-ea 負責**中國、日本、韓國、俄羅斯（含東北亞與中亞邊緣）**；第一批 ea-01 已入庫 14 檔：四把傘勢力（`factions/{imperial-court,japan-umbrella,korea-umbrella,russia-umbrella}`）、7 事件（`events/{jiangkou-night,chaebol-ascent,eastern-abandonment,mandate-of-kuafu,setouchi-lock,karafuto-understanding,court-parade}`）、3 地（`places/{yangtze-mouth,setouchi,kamchatka-wells}`），全部整檔讀過。領導已寫好需求初稿 `cx-ea-02.md`（15 件：中亞那把傘、哈薩克賣墟案、守牆機醒魂、徵召詔、仁川守城者、行在、仙台、仁川、摩爾曼斯克、阿拉木圖、5 個具名人物）——你的計畫以它為骨架，可以增刪調換，但每處偏離都要寫理由。使用者定的流程是先計畫、領導審過、再派另一位工人照計畫產出。你的**唯一目標**：寫第二批的計畫書，讓產出工人照著做就不會跑題。你**不寫任何 lore 檔**。

## 方法與禁忌（計畫要體現，也要寫進計畫給產出工人看）

- **節點優先**：每件都掛到某節點（N01–N10，`wf/workflows/planning/design-notes/world/history-nodes.json`）、主線（A–H）、年表條目、或崩年底色某句（1.1–1.13）；有前因、有後果、有在 2108-01 的狀態。沒有因果的不列——**不暴力產 lore**。
- 不拿其他作品類比；量級用世界內的詞。中文命名避免直譯（兩步命名，見 `wf/workflows/content/polish.md`「首要標準」）；古代機本體叫古代機、外層叫裝甲；潮→蝕（海洋本義潮汐照用）。
- 國家、塞勒涅、巨頭只削弱不萬能；已裁示的不推翻；新名詞標提案；世界觀真相用 `secrets`（hidden／rumor）。
- **基調**：style.md 總綱「不要太過現實，敢誇張、敢浪漫、敢中二；冷硬潮濕的底色上蓋一層神話的光」。第一批 ea-01 文筆紮實但偏冷、偏寫實、偏公文，**第二批要把神話的光加回來**——計畫裡每件寫一句「這件的光在哪裡」（一個意象、一聲吼、一個名字）。
- 可以新增**具名人物**（content/lore/characters），但每人要掛節點／線／底色、有因有果、有 2108-01 狀態；群像優先，具名人物本批 ≤ 5 人；**不寫真實歷史人名**；朝名、年號、君主名不取；處容與金河娜不當主角；夸父維持高高在上。
- 機甲型號與怪獸另有專線（lead-fill-mech、lead-fill-kaiju）：只引用既有的，需要新的寫進計畫的「需求」段，不設計型號或怪獸資料。

## 範圍（排除法寫死）

- 只做：寫計畫書與 review 草稿兩個檔（見交付）。計畫的清單 **13–15 件**，類別限 `content/lore/{factions,events,places,characters}` 的**新檔**，外加最多 3 件既有檔的「只插入」修改建議（只列建議，不寫）。
- 地理：只限中國、日本、韓國、俄羅斯（含北極岸、西伯利亞、遠東）、蒙古與中亞。不碰歐洲（lead-aegir）、美洲（lead-fill-am）、非洲與西亞（lead-fill-af，含兩河斷橋夜）、南亞東南亞群島（lead-fill）。國家型傘（中、俄）與日、韓境內**沒有自由城市**（已定），不得計畫自由城市地點。
- 撞名與撞檔：先 `ls content/lore/{events,places,characters}`，並 `grep` 各線 manifest（`content/batches/2026-10/*.json` 的 `files` 與 `goal`）與 `wf/workflows/dispatch/CLAIMS.md`，避開別線已佔的 id。
- 不做：寫或改任何 `content/`、`src/`、`test/`、`wf/`（除下列兩個交付檔）；不 commit；不上網。
- 件數 gate：計畫清單超過 15 件就刪到 15；容量 gate：計畫書超過 40 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（history-nodes、history-timeline、history-lines、history-orphans）；不整份讀 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ea-02p --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **唯讀調查線**：除交付兩檔外不寫任何檔；暫存放 `/tmp/cx-ea-02p/`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴。
- **子代理上限 1 個**：模型隨意，只准為推進正事開，同受本交接書約束。
- **分清錯誤來源**：點名工具壞掉或權限被擋 → `BLOCKED`；自己打錯路徑或指令 → 自己修。

## 工作

1. 讀「先讀」全部；讀本區既有 lore（`grep -l` 朝廷、中傘、夸父、格爾木、守寢人、日傘、瀨戶內、韓傘、釜山、慶州、第三刃、老爹、俄、雅庫茨克、樺太、堪察加、中亞、哈薩克等）的 summary 與 2108 狀態；讀 `history-orphans.json` 中「層」欄為填充層、地理在本區的條目。
2. 寫計畫書。
3. 寫 review 草稿，回報。

## 交付

**計畫書是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/ea-02-plan/PLAN.md`。** 回覆只要 5 行摘要＋路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫書 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/ea-02-plan/PLAN.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/ea-02-plan/review-draft.json` |

PLAN.md 結構：① 已讀清單；② 設計理念（一段：本批要讓世界多出什麼、為什麼是這些）；③ 相關概念（本批用到的已定設定與提案名，各一句＋出處）；④ 清單——每件一節：預定檔名（kebab）與類別、顯示名（含英文原名與意涵，兩步命名）、date／era（事件）或 region／continent／kind（地點）或 born／faction／role（人物）、**掛到**（節點／線／年表／底色句）、**前因→後果**、**2108-01 狀態**、**與既有 lore 的關係**（引哪些既有 id、不得矛盾的事實）、**這件的光**、預估字數；⑤ 既有檔只插入的修改建議（≤ 3 件，各列檔、插在哪、插什麼）；⑥ 需求（要 lead-fill-mech／lead-fill-kaiju 提供的型號或怪獸，沒有寫「無」）；⑦ 風險與需要領導決定的事（含你看到的既有 lore 矛盾）。
review-draft.json：wf-table/1，`{"contract":"wf-table/1","source":"PLAN.md","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[…]}`，清單每件一列；白話一到兩句、≤ 60 字、給人看、不堆術語。

## 驗收（固定 5 條，一條不多，做完就停）

1. `PLAN.md` 與 `review-draft.json` 存在；除這兩檔外沒有寫任何檔。
2. 清單 13–15 件，每件都有「掛到」「前因→後果」「2108-01 狀態」「與既有 lore 的關係」「這件的光」五項。
3. 預定檔名不與既有檔、別線 manifest 已列的檔撞名；地理全在本區。
4. review-draft.json 每件一列，白話 ≤ 60 字。
5. PLAN.md 第一段列已讀清單，涵蓋「先讀」行全部路徑。

## 失敗怎麼處置

- **做出來不合格** → 修到合格；修不好就交現狀、寫明缺什麼，發 `FAILED`。
- **做不了**（讀不到檔、權限被擋）→ 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ea-02p`。本線團隊：`teams/fill-ea`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ea-02p --up DONE '一句自足結論' /tmp/cx-ea-02p/final.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

# 任務：寫南北美洲 lore 第二、三批（am-02、am-03）的計畫書，不寫任何內容檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；PLAN 開頭要列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/history-nodes.json`（用 `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py FILE grep 關鍵詞` 查，不整份讀）、`wf/workflows/planning/design-notes/world/history-orphans.json`（同法查）、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`（第一批的規格，看寫法與禁忌）、`wf/workflows/dispatch/handoffs/lead-fill-am/am-01/REPORT.md`，以及第一批已入庫的 12 檔與本區既有檔（`content/lore/` 下 grep `北美|南美|拉美|美國|巴西|墨西哥|加拿大|蒙特婁|基多|環線|五湖|育空|殘翼|稽古`，每檔讀到夠用為止）。相對路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

領導線 lead-fill-am 負責南北美洲在 2108-01 的 lore 填充。第一批 am-01 已入庫（北美那把傘、內陸財團、拉美那把傘、丹佛、紐約空城、休士頓井城、巴拿馬閘城、里約、巴西利亞、改名的日子、商路約、刑天的戶籍）。別線已寫了 `places/cartagena.json`（卡塔赫納，拉美自由城市）與 `places/phoenix.json`（鳳凰城，北美空城），那兩檔不歸本線、不改，但可以引用。本任務唯一目標：寫一份計畫書，設計 am-02（≤15 檔）與 am-03（≤10 檔），讓領導審過後交給產出線照做。**你不寫任何 `content/` 檔。**

## 領導給的方向（可以調整，但改動要寫理由）

am-02 偏「人與事」，am-03 偏「補地圖缺口」。使用者已准新增具名人物，但每人都要掛到節點／主線／年表／底色、有因有果、有 2108-01 的狀態；群像為主，**全兩批具名人物合計 ≤ 6**。

- am-02 候選：人物——北美看守刑天那道崗的崗長（加拿大法語裔、在美國調度下，本人就是裂痕；**刑天維持沉睡、認主不預決**）、內陸財團在紐約空城的地契估價員（底色 1.7）、巴拿馬閘城的議長（商團出身，自由城市）、五湖岸邊的收殮人（底色 1.8 唱名；可把孤兒條目〔2101-08-15 借火催曉〕〔2106-10-15 鏽旗出殯〕接上 1.8）、巴西利亞坐拉美傘席位的糧商（商人當政）。事件——政府進山（崩年，美國政府遷丹佛）、紐約地契（築牆期把空城地契押給穹頂下的錢；D 線、1.7）、閘城立約（碎國期自由城市成形）、另一本帳（2107 N09：內陸財團放款給拉美諸城，不要求催收權、要礦糧港抽成）、墨西哥城徵召令（2107：國家徵召令在墨西哥城撞上城議會，獵團往閘城躲；polity「玩家在北美境內可能被徵」）。既有檔純插入：`timeline.json`、`factions/quito.json` 與 `factions/ring-caravan.json` 的 `relations` 加拉美傘、`places/great-lakes-mycelium.json` 與 `places/sao-paulo-blight.json` 的 `factions` 加對應傘。
- am-03 候選：北美太平洋岸（環太平洋是怪獸主要來源：一座蝕線上的港城或一座失守的灣）、加拿大內陸一城（歸屬裂痕的另一個樣本）、加勒比海一處、南錐（智利或阿根廷）一處、亞馬遜河口或內陸（河口潮湧例外、糧與精粹跨線）；配一兩件事件。

## 計畫書必含

存成 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/PLAN.md`（≤ 12 KB）：

1. **已讀清單**（逐行列）。
2. **設計理念**：兩批各一段——這一盤要讓玩家感到什麼、從哪條崩年底色長出來。
3. **相關概念**：會用到的既定詞（傘、城約、空城、一夜到、穹頂下的錢、評等、徵召…）與出處檔。
4. **逐檔規格表**（兩批分開）：檔名（`content/lore/類別目錄/名稱段.json`）、中文名（提案名）、英文原名｜意涵、類別、掛到（節點／主線／年表條目／底色句，至少一個）、前因→後果各一句、2108-01 狀態、與既有 lore 的關係（引用哪些既有 id、不能牴觸哪句）、必填欄位重點（人物：`born`、`faction`、`role`、`relations`、`events`；事件：`date`、`period`、`factions`、`characters`、`places`）。
5. **既有檔的純插入清單**（只准物件加鍵、陣列加元素）。
6. **年表插入清單**（日期、標題、era、tags）。
7. **review.json 草稿**：每個新增檔一列 `檔`｜`類別`｜`名稱`｜`白話`（一到兩句、≤ 60 字、給人看的白話）｜`掛到`。
8. **風險與需要領導決定的事**：可能牴觸既有 lore 的地方、新造概念詞（標提案）、你偏離領導方向之處。

## 方法與禁忌（寫進計畫，產出線照用）

節點優先、不暴力產 lore；不拿其他作品類比；中文命名避免直譯（古代機本體叫古代機、外層叫裝甲；蝕潮、蝕）；國家、塞勒涅、巨頭只削弱不萬能；已裁示不推翻（am-01 規格「已裁示不推翻」一節全部沿用）；新名詞標提案；真相用 visibility（hidden／rumor）；群像為主；不寫真實歷史人名；人名用帶當地感的音譯、順口、不撞名人；**不造機甲型號與怪獸資料**（另有專線，需要時引用既有的或列需求）。

## 範圍（排除法寫死）

- 只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/` 下的 `PLAN.md` 一檔。
- 不做：不寫、不改任何 `content/`、`src/`、`wf/` 其他檔；不刪檔；不 commit。
- 件數 gate：規劃的新增加插入超過 am-02 15 檔／am-03 10 檔就刪減到以內；容量 gate：PLAN.md 超過 12 KB 就精簡。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py FILE grep 關鍵詞` | 查 history-nodes.json、history-orphans.json、history-timeline.json |
| `grep -rl` | 找本區既有 lore |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-am-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**（只產一份計畫書）：可寫只有上面的 `am-plan/` 目錄與 `wf/inbox/`（回報用）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意，只准讀；它若做實質工作也要親自讀「先讀」。
- **分清錯誤來源**：點名的工具壞掉 → `BLOCKED`；自己打錯路徑 → 自己修。

## 工作

1. 讀「先讀」；發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-am-plan --up PROGRESS '已讀完，開始寫 am-02／am-03 計畫' < /dev/null`）。
2. 盤點本區既有 lore 與孤兒條目，寫計畫書。
3. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫書 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/PLAN.md` |

回覆只要 5 行摘要＋PLAN 路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. PLAN.md 存在、≤ 12 KB、開頭有「已讀清單」。
2. 含必含 8 節；am-02 ≤ 15 檔、am-03 ≤ 10 檔、具名人物合計 ≤ 6。
3. review.json 草稿每個新增檔一列、白話 ≤ 60 字。

## 失敗怎麼處置（兩種要分開）

- **寫出來不合格** → 自己修到過；修不好發 `FAILED`。
- **做不了**（讀不到檔、工具壞）→ 發 `BLOCKED`，寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-am-plan`。本線團隊：`teams/fill-am`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-am-plan --up DONE 'am-02／am-03 計畫書完成：N 檔＋M 檔、具名人物 K 人' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/PLAN.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

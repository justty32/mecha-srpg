# 任務：替 lore 批次 af-03 寫計畫書 PLAN.md（只寫計畫，不寫 lore 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**），再讀 `wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`，以及 `wf/workflows/planning/design-notes/world/history-lines.md`（「框架」「崩年的底色」）、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/history-nodes.json`（用 `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/world/history-nodes.json get 0（0–9 逐列）` 逐列讀，不整份讀）、本線前兩批全部新檔（清單在 `content/batches/2026-10/af-01.json`、`af-02.json` 的 `files`）與 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/review.json`。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

使用者定的內容流程是「計畫 → 產出 → 數值」，並問過「有名人物呢？」。本線前兩批立了撒南、北非、西亞的三把傘、五個群像夜與城邦代表地，具名人物只有三個（娜迪雅・薩布里、朱瑪・基普羅普、法莉妲・納賽里）。af-03 只做**四個具名人物**，各掛一個還沒有面孔的節點，分配如下（每格一人，不加不減）：① 撒南傘在大潮前分派獸群與援軍的人（G 線、2100 成傘、雙籤城求援表態）；② 金山夜之後第一個帶籠下井、2108 管深井的人（金山夜、墟出精粹、地熱井＝城主）；③ 斷橋夜被炸在橋那頭、活下來的一方的人，2108 在停戰線上撐渡船或守渡口（斷橋夜、N10 破約先例、底色 1.11）；④ 運河夜沉了一半的那支船隊的護航隊長，2108 持殘聯獵牌輪值護航（運河夜、2106 獵牌法、N08）。你的唯一目標是在動筆前寫一份計畫書讓領導審：每人的提案名（音譯、順口、不撞既有人物；英文原名＋意涵）、出生年、陣營 id、身分一句、崩前→節點→2108-01 狀態、因果、與既有人物的關係列、要引用的事件 id、外表或口頭禪一點（照 style/people.md）、白話草稿。**你不寫任何 lore 檔。**

## 方法與禁忌

- 節點優先、不暴力產 lore：每件說清楚前因與後果；發現規格裡有與既有 lore、設定筆記矛盾或重複的地方，在計畫書「風險與矛盾」段逐條列出並給建議，不自己改規格。
- 不拿其他作品類比；中文命名避免直譯（古代機、裝甲、蝕潮）；國家、塞勒涅、巨頭只削弱不萬能；已裁示不推翻；新名詞標提案；真相用 visibility；群像為主、不新增規格外具名人物。
- 用 `grep -rl` 在 `content/lore/` 查既有人物名有沒有撞音、撞身分；**不寫真實人名**；不給人物古代機或新機型（只用既有：`堅盾-I`、`牧杖-III型（C）`、`牧者（B）`、拘束的掘犬）；2089–2092 出生的人極少，不要把人物生在這幾年。

## 範圍（排除法寫死）

- 只寫一個檔：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/PLAN.md`。
- 不做：任何 `content/` 下的檔、交接書、manifest、`wf/` 其他檔；不 commit；不上網。
- 件數 gate：計畫書只涵蓋上述 4 人，不加件、不加事件或地點；容量 gate：PLAN.md 超過 10 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `grep -rl 科托努 /home/lorkhan/repo/game_dev/mecha-srpg/content/lore/` | 查重與查引用（把「科托努」換成要查的詞） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-af-03p --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**（只產一份計畫書）：可寫只有 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/PLAN.md`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意，同受本交接書約束。
- 分清錯誤來源：工具本身壞掉或沙箱拒寫 → `BLOCKED`；自己打錯路徑 → 自己修。

## 工作

1. 讀完先讀清單。
2. 逐件查重、查引用。
3. 寫 PLAN.md 並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫書 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/PLAN.md` |

PLAN.md 結構：開頭「已讀清單」；`## 設計理念`（這一批整體要讓本區多出什麼，一段）；`## 相關概念`（會用到的既有設定詞，一行一個附出處）；`## 逐件`（4 人，每人：檔名 `characters/英文名-kebab.json`、上述各欄、白話草稿 ≤ 60 字）；`## 風險與矛盾`；`## 建議（可選）`。

## 驗收（固定 3 條，一條不多，做完就停）

1. PLAN.md 存在、≤ 10 KB、開頭有「已讀清單」。
2. `## 逐件` 恰 4 人，每件都有白話草稿且 ≤ 60 字。
3. 終局 STATUS 已發。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修到過；修不好發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-af-03p`。本線團隊：`teams/fill-af`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-03p --up DONE 'af-03 計畫書 4 人、風險 N 條' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-03/PLAN.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

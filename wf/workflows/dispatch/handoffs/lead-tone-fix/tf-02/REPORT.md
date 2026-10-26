# 已讀清單

以下均親自從主 repo 讀取；路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-tone-fix/plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-tone-fix/plan/items.json`
- `wf/workflows/dispatch/handoffs/lead-tone-fix/plan/new-events.json`
- `wf/workflows/dispatch/handoffs/lead-tone-fix/cx-tf-02.md`

`items.json` 以 `wf/tools/tabledb.py ... find 批=tf-02` 讀五列；`new-events.json` 以指定的 `python3 -c` 讀五列。

另親讀：

- `wf/WORKFLOWS.md`
- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/workflows/inbox/README.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/content/world-pillars/world/monsters.md`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `wf/workflows/content/world-pillars/bio-battle/battle.md`
- `content/lore/events/red-eye-first-seen.json`
- `content/lore/events/wreck-crown.json`
- `content/lore/places/seattle.json`
- `content/lore/places/valparaiso.json`
- `content/lore/places/quito.json`
- `content/lore/places/winnipeg.json`
- `content/lore/places/havana.json`
- `content/lore/places/cartagena.json`

# 逐件產物

工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-02`。只新增 `content/lore/events/` 下的五檔；未派子代理。body 字數以 Python `len(body)` 計，含小標、標點與換行。

| id | name | summary 全文 | body 字數 | 吼的句子是否原文入正文 |
|---|---|---|---:|---|
| `event/seattle-broken-gun` | 歸船斷座夜 | 礁角掃斷桅杆和岸砲，守港的人仍替最後一車糧撐出路。 | 739 | 是：「把港扛住！」 |
| `event/valparaiso-borrowed-stretcher` | 借山空返 | 求援人沒借到神，帶回備件和一副空擔架。 | 740 | 不適用（計畫未指定） |
| `event/valparaiso-cut-cable` | 斷纜夜 | 借不到古代機的港口，凡人吼著站成山，把斷纜的傷機拖回家。 | 751 | 是：「山不來，我們站成山！」 |
| `event/winnipeg-first-snow-names` | 雪底留名 | 初雪裡，糧城的人替沒回來的人念完最後一頁名字。 | 746 | 不適用（計畫未指定） |
| `event/havana-bowls-of-light` | 空碗迎船 | 哈瓦那把燈留在空碗邊，等晚歸糧船帶飯回家。 | 748 | 不適用（計畫未指定） |

固定三條驗收：

1. 通過：五檔每寫完即跑 `node content/lore/check.ts`，最終 `errors=0 warnings=7`。七則均為未進年表警告，其中五則來自本線新事件，兩則為既有事件；未另加驗收項目。
2. 通過：上述五件均各有一列，summary 全文及吼句情形已列。
3. 未通過：`git status --short` 列出五件新事件，另有開工前即存在的 `?? node_modules`。該項是指向主 repo 的預置 symlink；本線沒有新增或修改它。

# 沒做到的與理由

終局狀態：`FAILED`（依交接書「測出來是壞的、修不好發 FAILED」；五件產物已完成）。固定驗收第 3 條未符合：開工前已存在 `node_modules` symlink（指向 `/home/lorkhan/repo/game_dev/mecha-srpg/node_modules`）。交接書禁止刪檔、禁止修改既有檔且限定可寫路徑，因此未擅自移動、刪除、忽略此項；已透過 PROGRESS 信通知領導處理。五件事件內容與逐檔 lore check 均已完成。

# 需要決定的事

請領導處理預置 `node_modules` symlink，讓第三條固定驗收只列五個新事件；事件敘事本身無待決事項。年表依交接書由領導／tf-01 接續處理。未 commit、未改 timeline、人物檔、base、索引或 manifest。

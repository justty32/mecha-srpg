# 任務：寫 kj-03 批次計畫——蝕域群像與敵方二十年的升級（只寫計畫，不寫 lore 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭要列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/history-lines/rulings.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`wf/workflows/planning/design-notes/world/scale.md`、`wf/workflows/planning/design-notes/world/rules.md`、`wf/workflows/planning/design-notes/tide-sky.md`、`wf/workflows/planning/specs/world/monsters.md`、`wf/workflows/planning/specs/world/voices.md`、`wf/workflows/planning/specs/world/rifts-and-territory.md`、`wf/workflows/dispatch/handoffs/plan-epic/REPORT.md`（第 21 行「敵方沒有線」與 B2）、`content/lore/factions/rift-beasts.json`、`content/lore/places/{mumbai-blight,mumbai-gate,lagos-blight,sao-paulo-blight,yakutsk-bed,great-lakes-mycelium,rhine-trench,cold-tide-rift}.json`、`content/lore/events/{first-tide,iron-wings-month,lagos-night,landlord-sits,red-eye-first-seen,white-night-first-seen,first-nest-taken,star-grave-named,last-vesper-named,moon-drowned,mirror-vigil,rust-banner,wreck-crown,bellless-dawn,nine-gates}.json`、`content/lore/timeline.json`（grep 怪獸、蝕域、二名相關條目即可）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

plan-epic 指出「敵方沒有線」：八條主線全是人的線，怪獸二十年的升級（巢母首見到首捕、蛻皮、二名越來越多、萬潮葬王）散成孤兒，威脅像靜態布景。B2「第九條線」**未裁示**，所以本批不開新主線，只在填充層補**群像＋升級**：讓讀者感到對面也在長，但對面**沒有臉**。上一批（kj-01）已補 6 件二名之夜。

本線唯一目標：寫一份**批次計畫**，讓下一個工人照它做兩件事——(甲) 新增 **3–5 件** lore 事件；(乙) 在 `content/lore/factions/rift-beasts.json` 的 `body` **追加 2–3 個小節**（既有文字一字不改，只在後面或小節之間加）。**你只寫計畫，不寫任何 lore 檔。**

## 方法與禁忌（計畫本身要遵守，也要原樣寫進計畫給下一個工人）

- **節點優先、不暴力產 lore**：先列要掛的主線（A–H）、年表條目、崩年底色句（1.1–1.13）；孤兒條目裁示是「留填充層、不硬掛節點」，所以**不新增對 N01–N10 的因果**。每件說清前因與後果。
- **對面無臉**：怪獸側沒有指揮者、沒有意志、沒有心思與對白；「升級」只能寫成人看到的變化（出現的等級、數量、地點、季節、二名登記數、獵牌與防線的反應），不寫「牠們學會了」「牠們在報復」。
- **掛旗不碰**：S 領主（孟買的那隻等）不出場、不描寫、不定族；蝕壓源頭、SS／SSS 不寫。**桑托斯灣區核心「長出什麼」不定**——計畫列成待使用者決定，正文只寫外界看到的空白。
- 怪獸多從海洋來、環太平洋為主、內陸少；蝕潮與潮汐有關聯但**不用潮差、潮高推凶度**；大潮全球同一時刻（裁示）。
- 怪獸等級不是成長階段（B 不是 C 長成的）；蛻皮只是獸族的例外（掘犬→盾甲）。
- **不拿其他作品類比**；**中文命名避免直譯**（兩步命名）；用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`（古代機本體叫古代機、外層叫裝甲；潮→蝕）。新名詞標「提案」。
- **已裁示不推翻**；除 rift-beasts 的 body 追加外，既有 lore 一字不改（要咬合的列成「建議插入」）。真相用可見度（`secrets` 的 hidden／rumor）。
- 群像為主，**不新增具名人物檔**。
- 不造怪獸資料：引用既有怪獸名（grep `content/base/monsters`、`species`）；真缺就列「需求」。

## 範圍（排除法寫死）

- 只寫兩個檔：計畫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03-plan/plan.md`、review 草稿 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03-plan/review-draft.json`。
- 不做：任何 lore／base 檔、manifest、index、src、wf 其他檔；不 commit。
- 件數 gate：清單新事件超過 5 件就刪到 5 件以內；容量 gate：plan.md 超過 20 KB 就停下回報。

## 計畫必含（照這個順序）

1. **已讀清單**（逐行列「先讀」每個路徑）。
2. **設計理念**：三到五句——怪獸側的二十年要讓讀者感到什麼，以及怎麼在「無臉」限制下寫出升級。
3. **掛點表**：要用到的主線／底色句／既有年表條目，每條一句為什麼。
4. **升級年表草稿**（給正文與 rift-beasts 小節共用）：2089–2108-01 每期一到三句「人看到的變化」，只用既有年表事實與本批新件。
5. **新事件清單** 3–5 件：每件寫建議 id 與檔名（`events/英文-kebab.json`，先 `ls content/lore/events` 避免撞名）、中文名＋英文原名＋意涵、日期與 era、地點（只用既有 `place/…`）、掛到哪、前因、經過要點、後果、與既有 lore 的關係、需要的 `secrets`。至少一件寫**蛻皮**（獸族；人第一次看見野生的掘犬蛻成盾甲，或蛻皮與奈洛比軛鞍行祕法之間外界怎麼看），至少一件寫**二名越來越多**這件事本身（例：某個登記處第一次得為二名獸另立一冊——制度名標提案），至少一件寫**蝕域內部**（三核心之一或其他蝕域，外界看到的景象），不得寫 S 領主。
6. **rift-beasts body 追加**：2–3 個小節的小標與每節要點（例：二名是怎麼來的〔哀悼〕、二十年的升級、三核心外界所見）；寫明插在哪個既有小節之後；不得改動既有句子。
7. **年表插入**：每件新事件一條（日期、標題、era、factions、tags）。
8. **建議插入既有檔**（只列、不做）。
9. **需求**（要機甲線／怪獸資料提供的；沒有寫「無」）。
10. **矛盾與待決**：含「桑托斯灣區核心長出什麼」與你讀到的既有矛盾。

`review-draft.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"../lead-fill-kaiju","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[...]}`，每件新事件一列、rift-beasts 追加一列；「白話」一到兩句、不超過 60 字、給人看的白話（說它是什麼、為什麼存在），「掛到」寫主線／年表／底色句。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 資料檔 grep 關鍵詞` | 查 history-timeline.json、history-lines.json、history-orphans.json 等資料檔，不整份讀 |
| `grep -rn 關鍵詞 /home/lorkhan/repo/game_dev/mecha-srpg/content` | 查名字撞不撞、既有提到什麼 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj-03p --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上列兩個檔；其餘全部唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意（例：查名字撞不撞）；它也要親讀 AGENTS.md 與 content 工作流入口。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-kj-03p --up PROGRESS '已讀完先讀清單，開始寫 kj-03 計畫' < /dev/null`）。
2. 寫 plan.md 與 review-draft.json。
3. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03-plan/plan.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03-plan/review-draft.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–10 段，新事件 3–5 件，且蛻皮、二名變多、蝕域內部三類各至少一件。
2. review-draft.json 是合法 JSON、列數＝新事件件數＋1。
3. 清單與小節要點裡 0 處 S 領主描寫、0 處怪獸心思／動機／對白、0 處「桑托斯灣區長出某物」的定論。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj-03p`。本線團隊：`teams/kaiju`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj-03p --up DONE 'kj-03 計畫完成：新事件 N 件、rift-beasts 追加 M 節' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-03-plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-kj-03p` 屬 `teams/kaiju`）。

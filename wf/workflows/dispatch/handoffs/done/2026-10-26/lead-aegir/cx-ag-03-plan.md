# 任務：寫 ag-03 批次計畫——歐洲的具名人物與歷史事件（只寫計畫，不寫 lore 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭要列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/aegir.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`wf/workflows/planning/design-notes/world/history-lines/d-moon.md`、`wf/workflows/planning/design-notes/world/history-nodes.json`（用 `python3 wf/tools/tabledb.py 檔名 grep 關鍵詞` 查，不整份讀）、`wf/workflows/dispatch/handoffs/plan-epic/v3.md`（第 1、2、3.5 節）、`content/lore/timeline.json`（grep 歐洲相關條目即可）、以及 `content/lore/` 下所有歐洲相關檔：`factions/{euro-umbrella,inner-sea-houses,salt-gull,anvil,remnant-wings,shell-society}.json`、`places/{hamburg,rotterdam-roost,saint-malo,istanbul,rhine-trench,skagerrak-shell,genoa-yards,alpine-shell}.json`、`events/{first-bid-sheet,aegir-lien,aegir-wakes,nine-gates,first-hunting-bands,skagerrak-shell-found,skagerrak-incident,gull-anvil-truce}.json`、`characters/{molly-van-den-berg,greg-olsen,salt-crone,hakan-demir,patrick-oconnor,ilse-brandt}.json`。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

使用者問「有名人物呢？事件呢？」：歐洲那一盤目前有勢力與地點，但具名人物與歷史事件少。本線唯一目標：寫一份**批次計畫**，讓下一個工人照它新增 **6–9 個** lore 檔（歐洲的具名人物與歷史事件），每件都有因有果、掛到節點／主線／年表／崩年底色、有 2108-01 的狀態。**你只寫計畫，不寫任何 lore 檔。**

## 方法與禁忌（計畫本身要遵守，也要原樣寫進計畫給下一個工人）

- **節點優先、不暴力產 lore**：先列要掛的節點與主線（N01–N10、八條線 A–H、崩年底色 1.1–1.13、年表條目），再決定人與事；每件說清前因與後果。
- **不拿其他作品類比**：不寫任何外部作品名或角色名。
- **中文命名避免直譯**（polish「首要標準」兩步命名：先英文原名＋意涵，再意譯或音譯）；用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`（古代機本體叫古代機、外層叫裝甲；潮→蝕）。新名詞標「提案」。
- **國家、塞勒涅、巨頭、家族只削弱不萬能**；國家縮而不死（法理、登記簿、徵召、地契還在）。
- **已裁示不推翻**；既有 lore 一字不改（需要咬合的地方列成「建議插入」，由領導另批處理）。
- **真相用可見度標**：外界不知道的放 `secrets`。
- **富豪與內海家族群像不點名**：不寫家族姓氏、家主名字。**埃吉爾的認主者不點名**（「拆件的」不能成為具名人物）。
- **不造機甲型號與怪獸資料**：需要的機型或怪獸只能引用既有名字（grep `content/lore` 與 `content/base`）；真的缺就列在計畫「需求」段，交機甲線／怪獸線。

## 範圍（排除法寫死）

- 只寫兩個檔：計畫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-03/plan.md`、review 草稿 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-03/review-draft.json`。
- 不做：任何 lore／base 檔、manifest、index、src、wf 其他檔；不 commit。
- 件數 gate：計畫列的新檔超過 9 個就刪到 9 個以內；容量 gate：plan.md 超過 20 KB 就停下回報。

## 計畫必含（照這個順序）

1. **已讀清單**（逐行列「先讀」每個路徑）。
2. **設計理念**：歐洲這一盤要讓玩家感到什麼（兩岸分裂、國家縮而不死、家族買獵團、埃吉爾是大西洋岸自己的英雄），三到五句。
3. **掛點表**：要用到的節點／主線／底色條／既有年表條目，每條一句為什麼。
4. **清單**：6–9 件，每件寫：建議 id 與檔名（`characters/英文-kebab.json` 或 `events/英文-kebab.json`）、中文名＋英文原名＋意涵＋意譯或音譯、類別、日期或生年、掛到哪、前因、經過要點、後果、2108-01 狀態、與既有 lore 的關係（引用哪些既有 id、會不會矛盾）、需要的 `secrets`。**人物 3–5 個、事件 3–4 件**；人物至少一個是大西洋岸平民港城的、一個是國家層（法理、登記簿或徵召）的、一個是獵團公會或議價場的；事件至少一件在崩年或碎國（2089–2096）、一件在築牆（2097–2101，可接地契抵押給穹頂下的錢）。可參考的起點（不必照用）：獵團公會定價格上限的議價人；國家派駐聖馬洛、管登記簿與徵召令的專員；熱那亞船塢照家族印出貨的總匠；稽古學會在阿爾卑斯談入場費的學者；崩年鹿特丹堤防失守；碎國期歐洲沿海國家把議會與登記簿遷往內陸；築牆期把大西洋岸空城地契押給穹頂下的錢。
5. **年表插入**：每件事件一條（日期、標題、era、factions、tags），以及排序位置。
6. **建議插入既有檔**（只列、不做）：哪個既有檔的哪個欄要插什麼（例：`events/...` 的 `characters` 陣列加人）。
7. **需求**：要機甲線／怪獸線提供的東西（沒有寫「無」）。
8. **矛盾與待決**：讀既有檔時發現的矛盾、需要使用者定方向的事。

`review-draft.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"../lead-aegir","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[...]}`，每件一列；「白話」一到兩句、不超過 60 字、給人看的白話（說它是什麼、為什麼存在），「掛到」寫節點／主線／年表／底色條。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 資料檔 grep 關鍵詞` | 查 history-nodes.json、history-lines.json 等資料檔，不整份讀 |
| `grep -rn 關鍵詞 /home/lorkhan/repo/game_dev/mecha-srpg/content/lore` | 查名字撞不撞、既有提到什麼 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ag-03-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上列兩個檔；其餘全部唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意（例：查名字撞不撞）；它也要親讀 AGENTS.md 與 content 工作流入口。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-ag-03-plan --up PROGRESS '已讀完先讀清單，開始寫 ag-03 計畫' < /dev/null`）。
2. 寫 plan.md 與 review-draft.json。
3. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-03/plan.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-03/review-draft.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–8 段，清單 6–9 件。
2. review-draft.json 是合法 JSON、列數＝清單件數。
3. 清單裡沒有任何內海家族姓氏、家主名字或埃吉爾認主者的名字。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ag-03-plan`。本線團隊：`teams/aegir`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ag-03-plan --up DONE 'ag-03 計畫完成：人物 N、事件 M' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-aegir/ag-03/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

# 任務：寫 kj-05 批次計畫——一種岸線常見的 D 級新物種（只寫計畫，不寫 base 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭要列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/style.md`、`wf/workflows/planning/specs/world/monsters.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（框架「海洋與潮汐」與「崩年的底色」）、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/lore/factions/rift-beasts.json`、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-02/REPORT.md`（上一批新物種「抱樁」的做法與命名審查結果）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

怪獸多從海洋來、環太平洋為主（裁示）。四族各只有一種 D 級（蟲族蝕蟲、獸族潮狼、異形浮囊、菌絲孢囊），先鋒與消耗品太單一。上一批補了異形 C「抱樁」。本線唯一目標：寫一份**批次計畫**，讓下一個工人新增**一種** D 級新物種的全套可玩資料（≤ 8 檔），族別在**蟲族或獸族**之間擇一並說明理由。**你只寫計畫，不寫任何 base 檔。**

## 方法與禁忌（計畫本身要遵守，也要原樣寫進計畫給下一個工人）

- 掛到設定：海洋與潮汐裁示、底色句（1.1–1.13）、F 線（蝕線＝海岸線）或其他主線；寫明牠在世界裡為什麼存在、平常在哪裡被看見、誰最常遇到牠。
- **對面無臉**；怪獸不是畜牲（不寫餵、馴、乖）；D 級**不寫** `name`／`epithet`。
- 不用潮差、潮高推凶度；等級不是成長階段；蛻皮只屬掘犬→盾甲，不給新物種 `molt`。
- 不新增 registries 值；不寫 `territorial`、`molt`（死資料）。
- **數值照同級暫填，不做平衡**（使用者：數值最後統一調）：HP、屬性、傷害照 bio-monsters.md 與 numeric-bands D 帶，對照 `species/mite.json`、`species/tidewolf.json`。
- 不拿其他作品類比；**中文命名避免直譯**（兩步命名；上一批 agy 審查：「～者」字尾是 -er 直譯腔、「纏足」撞裹小腳——避開這類）；全庫物種名多為二到三字（潮狼、掘犬、鏡肢、群喉、抱樁）；招式名寫動作與畫面。新名詞標「提案」。

## 範圍（排除法寫死）

- 只寫兩個檔：計畫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/plan.md`、review 草稿 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/review-draft.json`。
- 不做：任何 base／lore 檔、manifest、index、src、wf 其他檔；不 commit。
- 件數 gate：計畫列的新檔超過 8 個就刪到 8 個以內；容量 gate：plan.md 超過 20 KB 就停下回報。

## 計畫必含（照這個順序）

1. **已讀清單**。
2. **設計理念**：三到五句——牠在海岸線上扮演什麼、和既有同族 D 級怎麼區分（戰場上玩家看到什麼不同）。
3. **族別選擇與理由**：蟲族或獸族，各一句優缺點，選一個。
4. **掛點表**：設定段落／底色句／主線，每條一句為什麼。
5. **設計表**：英文原名＋意涵＋中文名（兩個備選）、id（英文 kebab，先 `ls content/base/species` 避免撞名）、外形一句、部位與層（至少一個 core 部位、每部位最後一層 `structural:true`、哪個傷害型 resist 0）、屬性、HP 總量、行為欄（`telegraph:true`；蟲族可否當巢母子體不改既有巢母）、AI profile（只用既有 `content/base/aiprofiles/`）、capture 寫法、1–2 招（形態照 `wf/workflows/content/ability-forms.json` 選 AI 會用的、傷害 D 帶 5–9、AP 成本）、0–1 效果。
6. **檔案清單**：每檔路徑與它對應的範本檔（`templates.json`、既有同族檔），合計 ≤ 8。
7. **營運接入建議**：要不要加進 `content/base/world/rifts/insect.json 或 beast.json` 的 `monsters`／`vanguard`（只建議，由領導做）。
8. **需求與待決**。

`review-draft.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"../lead-fill-kaiju","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[...]}`，一列（以 species 檔為代表）；「白話」一到兩句、不超過 60 字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 資料檔 grep 關鍵詞` | 查 `templates.json`、`numeric-bands.json`、`ability-forms.json`、`engine-facts.json`，不整份讀 |
| `grep -rn 關鍵詞 /home/lorkhan/repo/game_dev/mecha-srpg/content` | 查名字撞不撞、既有同族寫法 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj-05p --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上列兩個檔；其餘全部唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它也要親讀 AGENTS.md 與 content 工作流入口。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-kj-05p --up PROGRESS '已讀完先讀清單，開始寫 kj-05 計畫' < /dev/null`）。
2. 寫 plan.md 與 review-draft.json。
3. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/plan.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/review-draft.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–8 段，檔案清單 ≤ 8。
2. review-draft.json 是合法 JSON、1 列。
3. 設計表裡 0 個 `name`／`epithet`、0 個新 registry 值、0 個 `molt`／`territorial`。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj-05p`。本線團隊：`teams/kaiju`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj-05p --up DONE 'kj-05 計畫完成：族別 X、N 檔' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/plan.md`（STATUS、X、N 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-kj-05p` 屬 `teams/kaiju`）。

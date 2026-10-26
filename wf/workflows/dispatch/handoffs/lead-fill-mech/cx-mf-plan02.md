# 任務：寫 mf-02（舊軍工非核心件型錄）與 mf-03（機甲史 lore）兩批的設計計畫，不產出內容檔（plan-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/mechs.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`、`content/lore/timeline.json`（只用 `python3 wf/tools/tabledb.py` 或 grep 查需要的條目，不整份讀）、`content/lore/factions/mimic-works.json`、`content/lore/factions/league-armory.json`、`content/lore/factions/selene.json`、`content/lore/events/mimic-one.json`、`content/lore/events/shield-open-carving.json`、`content/lore/events/longspear-leak.json`、`content/lore/events/lance-v4.json`、`content/lore/events/ironsword-open-pattern.json`、`wf/workflows/dispatch/handoffs/lead-fill-mech/mf-01/review-rows.json`、本檔。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

lead-fill-mech 已做完 mf-01（國家型傘、日傘、內海家族、銀環-G1 六台 frame）。接下來兩批：**mf-02** 是設定筆記 magnates「軍工」一類的地球版型錄——崩年後舊軍工巨頭縮成賣凡鐵武器與衍型機非核心件（骨架、液壓、鎧甲板、靈目座、座艙件…）的供應商，做成 `content/base/components/`（必要時配 abilities／effects）；**mf-03** 是機甲史的 lore 事件（年表上已有條目、卻沒有事件檔的型號下線與公刻節點）＋一個舊軍工殘部的群像勢力檔。本線唯一目標：寫一份計畫，讓領導審過後交給產出線照做。**你不寫任何內容檔。**

## 方法與禁忌（計畫裡每件都要遵守，並寫進給產出線的要求）

- 節點優先、不暴力產：每件掛到勢力、主線、年表條或崩年底色；寫清前因→後果。
- 中文命名避免直譯（兩步命名：英文原名與意涵→意譯／音譯）；古代機本體叫古代機、外層叫裝甲；蝕潮系用語照 terms。新名詞一律標「提案名」。
- 不拿其他作品類比；不寫真實公司名、真實武器型號、真實人名。
- 國家、塞勒涅、巨頭只削弱不萬能：舊軍工「沒有一家死，沒有一家還是原來的樣子」；凡鐵對獸只刮外甲（抵抗性），它們的價值在人打人與非核心件。
- 已裁示不推翻：公刻只給 D 級地板；C 級精粹與量產件須向國家型傘或塞勒涅買；衍一聯合工程師一半來自舊軍工；格爾木坑邊那支舊世界軍工企業的保全是既有；巨頭具體公司名留填充層——你提的名字是提案。
- 數值：照同級既有部件暫填，**不做平衡**（使用者：最後統一調）。

## 計畫要寫的內容

1. **設計理念**：兩批各一段（為什麼存在、補哪個缺口、和既有型號／部件／lore 的關係）。
2. **相關概念**：會用到的既有設定與名詞清單（附出處路徑）。
3. **mf-02 清單**（6–8 件 components，必要時 ≤2 件 abilities／effects，合計 ≤10）：每件 `id`（英文 kebab，前綴 `oa-`）、中文提案名＋英文原名＋意涵、slot 類型（查 `content/base/registries/slot-types.json`）、是凡鐵武器（名帶「凡」、tags `conventional-arms`）還是非核心件、數值比照哪個既有部件（給路徑）、白話一句、掛到哪裡、可以裝在哪幾台既有機上（給 frame id）。先查既有 `content/base/components/` 避免重複（已有凡鐵連吼、凡鐵掃吼、凡鐵追矢匣、碎鐵拋矢筒、凡火矢莢、墜星吼砲等）。
4. **mf-03 清單**（≤9 件 lore）：(a) 事件檔，對下列年表條目逐條判斷值不值得寫成事件（值得的給 `id`、date、period、factions、places、characters 只用既有 id、consequences 草稿 2–4 條、body 大綱 3–5 點）：2092 衍二・堅盾下線、2093-09 堅盾-I型 普及、2099 銀環-G1 入型錄、2100 堅盾-II型 定版、2101 堅盾-I 普及、2104 長槍-V4 定版、2105 燕鷗下線、2106 FR-7／AT-12 公發、2107 獵犬-II型 授權；(b) 一個舊軍工殘部群像勢力（`faction/old-arms-makers`，`type` 企業，名字提案）：崩前→崩年→2108、四小節大綱、relations 草稿（只用既有勢力 id）。不寫安地斯壁、牧杖、朝廷閱兵、瀨戶內鎖海（別線在做）。
5. **既有矛盾**：讀的過程發現的設定衝突逐條列（例：燕鷗在年表寫「長槍血統改」、在軍械庫勢力檔寫「夸父血統改」），附路徑與建議讀法，不改檔。
6. **review 草稿**：`review-draft.json`（wf-table/1，欄位 `檔`、`類別`、`名稱`、`白話`、`掛到`），計畫清單每件一列；`白話` 一到兩句、≤60 字、人話。

## 範圍（排除法寫死）

- 只寫報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/` 下的 `PLAN.md` 與 `review-draft.json`。
- 不做：任何 `content/`、`src/`、`test/`、`wf/`（報告目錄除外）的寫入；不 commit；不刪檔。
- 件數 gate：計畫清單 mf-02 超過 10 件或 mf-03 超過 9 件就停下回報；容量 gate：`PLAN.md` 超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查 timeline 條目、寫 review-draft.json（先手建 wf-table/1 空表再 `add`） |
| `grep`／`ls` | 查既有 components、frames、lore id |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-mf-plan02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上面兩個檔；其他一律唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親自讀「先讀」全部；PLAN 記成本。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-mf-plan02 --up PROGRESS '已讀完先讀清單，開始寫計畫' < /dev/null`）。
2. 盤點既有 components 與年表條目，寫 PLAN.md 六節。
3. 寫 review-draft.json。
4. 回報。

## 交付

**PLAN 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/PLAN.md`**，回覆只要 5 行摘要＋路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/PLAN.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/review-draft.json` |

PLAN 末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. `PLAN.md` 存在，開頭有「已讀清單」，含上面六節。
2. mf-02 清單 6–10 件、mf-03 清單 ≤9 件，每件有 id、提案名、掛點、白話。
3. `review-draft.json` 是 wf-table/1，列數等於兩份清單件數總和，`白話` 每列 ≤60 字。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修到過；修不好就發 `FAILED`，PLAN 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mf-plan02`。本線團隊：`teams/mech`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-mf-plan02 --up DONE 'plan-02 計畫完成：mf-02 N 件、mf-03 M 件' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/plan-02/PLAN.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 完整契約：`wf/workflows/inbox/PROTOCOL.md`。

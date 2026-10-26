# 任務：寫「機甲種類擴充」的盤點與分批計畫，不產出內容檔（cx-m2-plan）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；PLAN 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/ability-forms.json`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/mechs.md`、`wf/workflows/planning/design-notes/mechs/mechanical.md`、`wf/workflows/planning/design-notes/mechs/bonds.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world.md`（末節）、`wf/workflows/planning/design-notes/world/drive.md`、`wf/workflows/planning/design-notes/world/essence.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`、`wf/workflows/planning/specs/core/data-model-mech.md`、`wf/workflows/planning/specs/world/mech-lifecycles.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-mech/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/plan/inventory-start.json`、本檔。`content/lore/timeline.json` 與 `content/index/*.json` 只用 `python3 wf/tools/tabledb.py` 或 grep 查需要的條目，不整份讀。路徑都相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

使用者原話：「我其實覺得，機甲種類和怪物種類太少了。」領導用腳本盤點（`plan/inventory-start.json`，54 台機械系 frame）：**47 台擠在 5 種雙足骨架**（mx-biped-b／c／d、heavy、ace-a），履帶、翼裝各只 1 台，沒有四足、多足、輪式、艦載、無人機母艦、工程起重這類體型；`model.role` 只有 line／captain／variant 三值，看不出角色定位。本線唯一目標：寫一份盤點＋擴充計畫，讓領導審過後交產出線分批做 **20–30 台玩法上不同**的新機（不是換名同級機）。**你不寫任何內容檔。**

## 方法與禁忌（計畫每件都遵守，並寫進給產出線的要求）

- 節點優先、不暴力產：每台掛到勢力、主線、年表條或崩年底色；寫清為什麼這個勢力在這個年代需要這種機。
- 中文命名避免直譯（兩步：英文原名與意涵→意譯／音譯）；英文名放 frame 的 `nameEn`、意涵與來歷放 `etymology`。古代機本體叫古代機、外層叫裝甲；潮系用語照 terms（潮→蝕）。新名詞一律標「提案名」。命名照 mechanical.md 三段式與各勢力語感。
- 不拿其他作品類比（計畫與內容都不准寫「像某某作品」）；不寫真實公司、真實武器型號、真實人名。
- 國家、塞勒涅、巨頭只削弱不萬能。古代機不在範圍。
- 無人單位照 drive.md：鐵偶＝無核心凡鐵只打人；遙控機＝有核心不驅動、普通開。**無人機題材使用者另有規劃，本計畫最多 1 台沾邊，且標「待使用者定」**。
- 數值照同級既有機暫填，**不做平衡**（使用者：最後統一調）。
- 引擎事實：`locomotion`（leg／track／hover／flight／burrow）目前**只是標籤，規則不讀**；`spawn` 只能生 species（怪獸），不能生機甲；水格視同陸地（engine-backlog 51）。所以要「飛行／兩棲／母艦」的玩法，**用現有能力近似**（位移招 escape、範圍招、scout 標記、protect、debuff、多部位 bodyplan、池帶），並把真正需要的引擎支援列成 engine-backlog 草稿。不新增 registries 值。
- 勢力機照 lead-rep 的聲望門檻（`maker` 填勢力即自動上鎖），不必另做；沒有營運資料的勢力（如韓傘）機只在百科出現，可以做但要標明。

## PLAN.md 要寫的內容（七節）

1. **盤點**：以 `inventory-start.json` 為起點，給每台既有機標「角色定位」（守牆、突擊、射手、偵察、支援、工程、兩棲／水上、空中、重裝砲台、指揮、無人機相關…；判準寫出來：看骨架、池、內建能力的 ai.tactics、配裝射程）。產出兩張矩陣：角色定位×等級台數、勢力×等級台數；再一段「玩法差異在哪、同質在哪」。
2. **設計理念**：一段——「種類多」在這個遊戲裡指什麼（部位配置不同→打哪裡有效不同；池與內建招不同→回合節奏不同；定位不同→編隊角色不同）。
3. **缺口矩陣**：上面角色×等級矩陣標出缺格與優先序；另列「骨架缺口」（建議新增哪些 bodyplan：部位、slots、層，每個給比照的既有 bodyplan 路徑）。
4. **新機清單 24–30 台**，分 **4 批**（mech2-01…04）：每台一列——提案 id（英文 kebab，**勢力或系列前綴**，不得撞既有 id）、中文提案名＋`nameEn`＋意涵、等級、骨架（既有或新 bodyplan id）、定位、**一句玩法差異**（和同級既有機比，打起來哪裡不同）、造機勢力＋血統 lineage、掛點（年表條／主線／崩年底色，附路徑或 timeline 日期）、需要的新 component／ability／effect（id＋一句）、`defaultLoadout` 草稿、比照數值的既有機路徑。**第 01 批放所有共用的新 bodyplan 與共用件**（後三批可並行，只引用 01 批與既有的 id）；每批檔案數（frames＋models＋bodyplans＋components＋abilities＋effects＋lore 新檔）≤ 22。
   覆蓋要求：D／C／B／A 每級至少 4 台新機；至少 6 種新骨架被用到；至少 8 種定位；勢力至少涵蓋 8 家（含通用系列、國家型傘、獵團、公司、教團／學會，以設定允許為限）；不做 S 級量產機（S 只在深墟成品／塞勒涅特例，至多 1 台且要掛點）。
5. **引擎缺口草稿**：真正想要但引擎不支援的玩法（飛行越地形、水上、生出無人機…）逐條：現在用什麼近似、需要引擎做什麼、影響哪幾台。
6. **既有矛盾**：讀的過程發現的機甲設定衝突逐條列（路徑＋建議讀法），不改檔。
7. **review 草稿**：`review-draft.json`（wf-table/1，欄 `檔`、`類別`、`名稱`、`白話`、`掛到`），新機每台一列（`檔` 寫 frame 路徑；共用件與 bodyplan 各一列）；`白話` 一到兩句、≤60 字、人話。

## 範圍（排除法寫死）

- 只寫報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/plan/` 下的 `PLAN.md` 與 `review-draft.json`。
- 不做：任何 `content/`、`src/`、`test/`、`wf/`（報告目錄除外）的寫入；不 commit；不刪檔。
- 件數 gate：新機超過 30 台、或任一批檔案數超過 22 就停下回報；容量 gate：`PLAN.md` 超過 60 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查 timeline、index 分片、inventory-start；寫 review-draft.json（先手建 wf-table/1 空表再 `add`） |
| `grep`／`ls`／`python3 -I -c` 讀單檔 JSON | 查既有 frames、bodyplans、components、abilities、effects、models、lineages、lore id |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-m2-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上面兩個檔；其他一律唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網；不用 MCP。
- **子代理上限 2 個**，模型隨意；做實質工作也要親自讀「先讀」全部；PLAN 記成本。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-m2-plan --up PROGRESS '已讀完先讀清單，開始盤點' < /dev/null`）。
2. 盤點既有 frames／bodyplans／models／components／abilities，寫 PLAN.md 一至三節。
3. 寫第四至六節。
4. 寫 review-draft.json。
5. 回報。

## 交付

**PLAN 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/plan/PLAN.md`**，回覆只要 5 行摘要＋路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/plan/PLAN.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/plan/review-draft.json` |

PLAN 末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. `PLAN.md` 存在，開頭有「已讀清單」，含上面七節，第一節有兩張矩陣。
2. 新機清單 24–30 台、分 4 批、每批檔案數 ≤22，每台有 id、提案名、nameEn、骨架、定位、玩法差異、掛點；覆蓋要求逐條在 PLAN 標「達成」或「未達成＋理由」。
3. `review-draft.json` 是 wf-table/1，每台新機一列，`白話` 每列 ≤60 字。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修到過；修不好就發 `FAILED`，PLAN 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-m2-plan`。本線團隊：`teams/mech2`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-m2-plan --up DONE 'm2 計畫完成：N 台分 4 批' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/plan/PLAN.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 完整契約：`wf/workflows/inbox/PROTOCOL.md`。

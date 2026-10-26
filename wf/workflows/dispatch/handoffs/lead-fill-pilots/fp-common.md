# lead-fill-pilots 共同規格（所有 cx-fp-* 交接書都引用本檔）

[handoffs](../README.md)

本輪目標：填充**可玩的駕駛員與船員**（營運裡能在招募池雇到的人）。計畫段 `gpt-6-astra`，產出段 `gpt-6.1-sol`。本檔與個別交接書衝突時，個別交接書為準；與計畫衝突時，以領導寫的 `<區>-rulings.md` 為準。

## 引擎事實（領導已查，原樣可信；細節自己再核）

- 招募池 `content/base/world/recruit-pools/<名>.json`：`{id:"recruit/<名>", place:"place/<id>", size, refreshOn:"quarter", sources:[{background, weight}]}`。每季（退潮期）每個池重抽 `size` 人，按權重**不重複**抽 sources（`src/ops/crew/recruit.ts`）。**同一地點可有多個池**（各自獨立）。池的 `place` 必須是 `content/base/world/places/` 已存在的地點（現有 10 個：chittagong、delta、dhaka、mumbai、old-array、reed-marsh、ridge、salt-flat、selene-city、singapore）；**不可以引用不存在的地點**（會在遊戲裡炸）。別線若新增地點，用 `inserts.json` 登記「待補池」，不要自己建池。
- 背景 `content/base/world/backgrounds/<名>.json`：`{id, name, culture, attrRanges:{accuracy|resolve|control...:[lo,hi]}, hireFee, wageMult, traits:[effect id], person:"person/<名>"}`。**一個背景只指一個 person 範本；同一 person 同時只會出現一次**（已在名冊或候選者者不再抽）。所以「池變豐富」＝新增「背景＋person」成對的件，也可讓新池引用既有背景。`culture` 取名表有的文化（`content/base/world/names/mythic-*` 的 culture 字串；先 grep 現有背景用過的）。
- person `content/base/persons/<名>.json`：照 `hana-sato.json`、`irina-sokolova.json` 範本複製結構（attrs、traits、perks、pools、will、growth、tags）；`kind:"human"`；可選 `age`（2108 開局年齡）與 `activeYears`（已駕駛年資；老手用，外貌年齡＝實齡 − 年資×3/4）；`traits` 只准用 `content/base/effects/` 已有的 `effect/ax-trait-*`、`effect/ax-bg-*`、`effect/trait-*`（共約 20 個；**不新增 effect**，缺的記需求）；`perks`／`abilities`／`growth.levelDice` 表達「能力傾向」（例：偏 control＝穩手、偏 accuracy＝射手；levelDice 的骰面偏向哪個屬性）。數值照同級暫填：同類型既有 person 為準，**不調平衡**。
- 沒有「描述」欄：出身、崩前／崩後、性格寫在對應的 **lore 人物檔** `content/lore/characters/<名>.json`（`gameRefs:["base:person/<名>"]`），body 250–450 字（check 門檻 ≥200）。**每個新 person 都配一個 lore 人物檔**（這是使用者要的「每人有出身、崩前崩後、性格」的唯一承載處）。
- 船員專業（技師、醫護、廚、導航、通訊、砲手）：引擎沒有獨立欄位；用 `tags`（`technician`、`medic`、`navigator`…先 grep 既有 tags）＋背景名＋attrRanges 偏向表達。引擎缺口（背景可指多個 person、招募卡顯示 bio、職類篩選…）記 engine-backlog 候選，不自己改。

## 年齡與人口（出生斷層，必守）

歷史底色見 `wf/workflows/planning/design-notes/world/history-lines.md` 崩年的底色 1.1／1.2：**2089–2092 出生斷層**（2108 年齡 16–19 歲的人極少；全批 person 在這個年齡段的 ≤ 5%，且每個都要有「為什麼在」的理由）、撒南輸出駕駛員、日本缺駕駛員、**不老的老手**（駕駛多年、外貌年輕；`age` 與 `activeYears` 同時給，每區至多 1–2 個，雇用費偏高，不在每個池）。年齡主體：二十歲出頭（2086–2088 生）到五十多歲，少量十五歲以下的「學徒」不當駕駛（當船員／技師學徒）與六十歲以上的老船員。`born`（lore）＝ 2108 − age 的年份，要一致。崩前（2090 前出生者有崩前記憶）與崩後出生者的世界觀差異要寫出來。

## 方法與禁忌（每件都適用，原樣寫進計畫與產出）

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 檔案規矩（產出段）

- 產出工人在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-<批名>/` 內只**新增**檔，**不改任何既有檔**。需要改既有檔（勢力 `places`、年表條目、既有池加來源…）一律寫進報告目錄 `inserts.json`（wf-table/1，columns `["file","jsonPath","op","value","why"]`，`op` 只有 `append`、`setKey`），由合併線套。
- 新池一律用新檔（`recruit/<地點>-<主題>`），不改既有 4 個池。
- 檔名：person／lore 人物＝同一 kebab 名（`person/x` ↔ `character/x`）；背景 `background/<名>`；全庫不撞（先 ls／grep；跨區撞名由領導在計畫階段用名單排除，工人只用計畫分配的名）。
- 每件在報告目錄 `review-rows.json` 留一列（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`）：`檔`＝repo 相對路徑、`類別`（person／background／recruit-pool／character）、`名稱`（新名詞加「（提案）」）、`白話`（≤ 60 字）、`掛到`。
- 驗收：worktree 內 `npm run check` 0 errors、`node content/lore/check.ts` 0 errors、`npm run typecheck` 0；`npm test` 黃金紅可豁免但列檔名（新增招募池會改變營運亂數軌跡，領導整批後統一重錄；工人**不**跑 GOLDEN_UPDATE／rerecord）。

## 回報

不用 inbox（本輪領導以行程結束＋最後訊息＋檔案驗收）。REPORT／plan 開頭「已讀清單」，每個「先讀」路徑原樣列出；最後訊息只要 5 行摘要＋產物路徑。

## 資源禁令（頂層 2026-10-26，使用者：電腦 CPU 與記憶體被 npm 弄爆）

- 全機同時最多一個 `npm test`／`npm run test:e2e`／sim／fuzz；開跑前 `pgrep -fa 'node --test|vitest|playwright|npm run (test|sim|fuzz)'`，有人在跑就等。
- **工人與子 agent 不准跑全套測試**：只准 `node --test <相關單檔>`、`node content/lore/check.ts`、`npm run typecheck`、`npm run check`（輕量時）。全套 `npm test` 只由領導收件後跑一次。驗收條中的 `npm test` 一律改為「領導跑」。
- 不要多個 worktree 各自跑全套；平行 codex 工人上限 3。

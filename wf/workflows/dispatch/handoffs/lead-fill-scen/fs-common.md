# lead-fill-scen 共同規格（所有 cx-fs-* 交接書引用）

[handoffs](../README.md)

本線：填充戰鬥情境（`content/base/scenarios/`）、戰場地圖（`maps/`）、必要時地形（`terrains/`）。計畫段 `gpt-6-astra`，產出段 `gpt-6.1-sol`。與個別交接書衝突時，個別交接書為準；與計畫衝突時，以領導的 `rulings.md` 為準。

## 禁忌（每件都適用）

1. 每件有掛點：掛到 lore 事件或地點 id（`content/lore/` 既有檔）、節點 N01–N10、主線 A–H 或年表條；掛不上就不做。不暴力產。
2. 少帳務法理，多人、畫面、獸、光；每個情境 brief 要有一個畫面或一句能吼出來的話。
3. 不拿其他作品類比。命名不直譯（兩步命名；古代機本體叫古代機、外層叫裝甲；潮→蝕，漲潮／大潮／連珠潮）。
4. 古代機與 S 級高高在上：不寫被打倒、被操縱、被交易；萬潮葬王（`tidespine`、wc 系列、王跡、北行）一律不碰。
5. 對面無臉：怪獸無人格化指揮者、不談不怕、不是畜牲；A 級才有二名。
6. 新專名標「（提案）」。數值照同級暫填（不做平衡）。
7. 不改 `src/`、`specs/`、`design-notes/`、`content/lore/`、AI 檔（`aiprofiles` 只引用既有）；需要引擎支援或 lore 的列 REPORT「需要決定」。
8. 產出只**新增**檔，不改既有檔（新地形若要加入既有地圖不可行，就新做地圖）。

## 引擎與格式事實（先讀 battle-field.md）

必讀：`wf/workflows/content/battle-field.md`（部署距離 ≥10、玩家 lose 條件、killTarget、輪數、glyph 小寫、moveCost 五鍵）、`playtest.md`、`wf/workflows/planning/specs/core/` 中 scenario／map／terrain 段。情境檔範本：`content/base/scenarios/kj2-03-demo.json`。每個情境必須：玩家 lose 條件、每台機有武器（寫 components 或確認 frame defaultLoadout）、同具名人物只一台、玩家與敵方部署區相距 ≥10。

## 每件驗收

- `npm run check` 0 errors。
- AI 對 AI 探針跑完不卡死：用 `npm run sim`（看 `node src/sim/cli.ts --help`）或 `content:probe` 對該情境跑，記結果（勝負／輪數）。多 seed 各一。
- review 列：repo 相對路徑、類別（scenario／map／terrain）、名稱、白話（≤60 字）、掛到。寫入報告目錄 `review.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`）。

## 回報

工人用 `wf/tools/inbox_mail.sh <我> --up <STATUS> '<一句>' <REPORT>`；團隊 `teams/fillscen`，上游 `lead-fill-scen`。每步 `wf/tools/inbox_poll.sh <我> --once`。REPORT 開頭「已讀清單」。工人不 commit（沙箱 .git 唯讀），領導 commit。worktree 放 scratchpad `lead-fill-scen/wt-<批>/`。

## 資源規則（頂層緊急通知，2026-10-26，使用者：電腦 CPU／記憶體被弄爆）

1. 全機同時最多一個 `npm test`／`npm run test:e2e`／sim／fuzz／平衡探針類重負載；開跑前 `pgrep -fa 'node --test|vitest|playwright|npm run (test|sim|fuzz)'`，有人在跑就等。
2. 工人與子代理只准跑與自己改動相關的單檔測試（`node --test 「檔」`）、單一情境探針、`npm run typecheck`、`npm run check`；全套 `npm test`／e2e 只由領導收件後跑一次。
3. 不同時開多個 worktree 各跑全套；平行 codex 工人上限 3。

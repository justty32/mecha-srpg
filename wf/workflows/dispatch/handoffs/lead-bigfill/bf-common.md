# lead-bigfill 共同規格（所有 cx-bf-* 交接書都引用本檔）

[handoffs](../README.md)

本輪是「下一輪大填充」：月面（moon）、可玩內容（play）、加深（deep）三區。計畫段 `gpt-6-astra`，產出段 `gpt-6.1-sol`。本檔與個別交接書衝突時，**個別交接書為準**；與計畫衝突時，以領導寫的 `<區>-rulings.md`（審計畫後才有）為準。

## 方法與禁忌（每件都適用，原樣寫進計畫與產出）

1. **節點優先、不暴力產 lore**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（`wf/workflows/planning/design-notes/world/history-lines.md`），有因有果。不掛得上就不寫。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`）：**少寫帳務與法理、多一點人、畫面、獸、神話的光**。「地契押給月亮」「商團出糧傭兵守港」「井＋糧倉＋公司排班」這類模板句已經寫過很多遍，不再重複。每件要有一個人、一個畫面或一句能吼出來的話。
3. **不拿其他作品類比**：不寫任何外部作品名、角色、電影或遊戲比喻；量級用世界內的詞。
4. **中文命名避免直譯**：兩步命名（先想原意，再取中文，不逐字翻）；古代機本體就叫古代機、外層叫裝甲；潮→蝕（蝕潮、漲潮、大潮、連珠潮）；用語與禁用詞照 `content/lore/style.md`。新中文名不要回譯成英文 aka。
5. **國家、塞勒涅、巨頭只削弱不萬能**：有錢有法理，但到不了每一座城、買不到古代機；塞勒涅不當主謀。富豪、家族、公司群像不點名（職稱可寫）。
6. **古代機與 S 級高高在上**：不寫它們被打倒、被操縱、被交易；古代機周邊寫人（守寢人、學會、村子、看守的崗），古代機本身不動（除既有 lore 已寫的）、不預決誰認主。S 領主不出場（萬潮葬王是唯一例外，本輪不碰）。
7. **對面無臉**：怪獸沒有人格化指揮者、不談、不怕；怪獸不是畜牲（不寫餵、馴、乖、寵物）。A 級以上才有二名。
8. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md` 全部、既有 lore、年表。矛盾記 REPORT「需要決定」，不自己改舊檔。
9. **真相用可見度**：外界不知道的放 `secrets`（`visibility: hidden`）或 `rumor`；`summary`／`body` 照外界口吻。
10. **開局（2108-01）後可能發生、日期不定的事件**用 `occurs: possible`（見 `content/lore/README.md`）。
11. **新名詞標提案**：規格外新造的專名或概念詞，在 REPORT「需要決定」與 review 列「名稱」後加「（提案）」。能不造就不造。
12. **文筆不強求**：只查禁忌與掛點，不為了文采加長。

## 不做（全區）

萬潮葬王（`monster/tidespine-chittagong`、`species/tidespine`、wc 系列與其事件，lead-engine-next 在做）；AI（`aiprofiles`、AI 相關）；數值平衡（數值照同級暫填）；`src/`、`specs/`、`wf/workflows/planning/design-notes/`（矛盾記 REPORT）；刪檔、裝依賴、push、建分支。

## 檔案規矩（產出段）

- 產出工人在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-<batch>/` 內只**新增**檔，**不改任何既有檔**（含 `timeline.json`、勢力檔的 `places`、契約池清單）。
- 對既有檔的插入需求（年表條目、勢力 `places`、地點 `factions`、池清單加 id…）寫進報告目錄的 `inserts.json`（wf-table/1，columns `["file","jsonPath","op","value","why"]`，`op` 只有 `append`（陣列尾加）與 `setKey`（物件加新鍵））；年表條目寫 `timeline-add.json`（wf-table/1，columns 照 `content/lore/timeline.json` 條目欄位）。領導最後交一條合併線統一套用。
- 跨批引用：只引用 HEAD 已有的 id，或**同批**新檔；要引用別批新檔，寫進 `inserts.json` 由合併線補。
- 每件在報告目錄 `review-rows.json` 留一列（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`）：`檔`＝repo 相對路徑、`類別`、`名稱`（新名加「（提案）」）、`白話`（一到兩句、**≤ 60 字**）、`掛到`（節點／主線／年表／底色條）。

## 重負載限制（頂層 2026-10-26 緊急令，**優先於任何交接書與計畫**）

使用者：「不要濫用npm，電腦的cpu和memory都被整個弄爆了」。
- 工人**不准跑全套** `npm test`、`npm run test:e2e`、sim、fuzz、`content_accept.sh`；只准跑 `node content/lore/check.ts`、`npm run check`、`npm run typecheck`、與自己改動相關的單檔 `node --test <檔>`。交接書驗收若寫了 `npm test`，改為「不跑，領導收件後跑」。
- 跑任何 node 檢查前先 `pgrep -fa 'node --test|vitest|playwright|npm run (test|sim|fuzz)'`，有別人在跑就等。
- 子代理同受此限。全套測試只由領導收件後跑一次。

## 回報

- 工人用 `wf/tools/inbox_mail.sh <我> --up <STATUS> '<自足一句>' <REPORT 路徑>`；團隊 `teams/bigfill`，上游 `lead-bigfill`。每完成一步跑 `wf/tools/inbox_poll.sh <我> --once` 讀 orders。
- REPORT 開頭「已讀清單」（交接書「先讀」每個路徑原樣列出）。

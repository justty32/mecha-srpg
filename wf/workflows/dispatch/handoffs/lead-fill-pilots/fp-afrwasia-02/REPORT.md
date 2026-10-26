# 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`
- `AGENTS.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/people.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/pools.json`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/afrwasia-plan/cx-fp-afrwasia-02.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`

以上均由 cx-fp-afrwasia-02 親讀。相對路徑以隔離 worktree 為根；worktree 沒有的 fp-common.md、fp-rulings.md、deep-rulings.md 與 afrwasia-plan 附件改讀主 repo 同路徑。三個範本目錄完整讀過：person 38 檔、background 13 檔、recruit-pool 4 檔。people.json 與 pools.json 使用 `python3 wf/tools/tabledb.py` 按 `batch=fp-afrwasia-02` 查得 12、2 列，未整表載入 context。

另親讀 wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/workflows/content/world-pillars.md、本批 manifest、review-draft.json 的本批 38 列、空 inserts.json、引用的既有地方／勢力／事件及兩個 base 地點。開場 inbox_read 無信；未寫 inbox 或 session-log。未發現 afrwasia-rulings.md。

## 做了什麼、產出與掛點

狀態 **DONE**，依 fp-rulings.md 修正後的固定四條完成工人交付。起點與 manifest base 均為 `27e6ea2f3481a4df855b19bfbf2760a65433fbf1`。只在隔離 worktree 新增 manifest 指定的 38 個內容檔：12 person、12 background、12 character、2 recruit-pool；沒有修改既有檔、commit 或更新索引。預先備妥的未追蹤 `node_modules` 是開工前即存在的依賴連結，未改動。

十二人依核定表組裝，person 的 pools、growth.xpCurve、perkPointsAt 保留各列範本，attrs、traits、will、levelDice 等照表；perks 空、abilities 省略。背景 traits 空，避免特質重複。角色正文各三段，長度 289–309 字元，均含崩前、崩後、招牌瞬間及引號招牌話；性別、年齡與性格在正文。船員不列機型，駕駛只用既有「堅盾-I型」。作者約束未寫進正文，未新增傳聞或隱藏真相。

北非四人掛亞斯文／蘇伊士與北非傘，接放閘夜、運河夜及底色 1.1、1.4、1.8；西亞四人掛荷姆茲／兩河／達蘭／杜拜與西亞傘，接燃夜、斷橋夜及 C、F、G；中亞四人掛阿拉木圖，分屬中亞傘與稽古學會，接 B、C、G 及底色 1.1–1.4。每一地方、勢力、事件引用均存在。

兩池為 `recruit/chittagong-canal-watch` 與 `recruit/singapore-highland-caravan`，分別使用既有 base 吉大港、新加坡，皆六來源加權抽三人，權重照表，沒有混用人物 lore 地方。review-rows.json 從 review-draft.json 按 manifest 篩出 38 列，逐列保留，白話最長 50 字，名稱均標（提案）。inserts.json 為合法空表。內容共 41,804 bytes，最大單檔 1,702 bytes。

## 固定驗收（恰好四條）

1. **通過**：以 git 與 manifest 比對，恰好 38 個新內容檔、各類 12／12／12／2，既有追蹤檔差異 0，清單外新內容檔 0。
2. **通過工人責任**：`npm run check` exit 0，`OK 0 errors, 10 warnings`；`node content/lore/check.ts` exit 0，`errors=0 warnings=12`；`npm run typecheck` exit 0。`npm test` 依領導追加與 fp-rulings.md 改由**領導跑**，本線未跑，沒有可列的實測失敗檔名；未宣稱黃金測試通過，未重錄。
3. **通過**：38 列 review-rows、合法空 inserts 與本 REPORT 齊，白話皆 ≤60 字；已讀清單含交接書全部先讀及 fp-rulings.md。
4. **通過**：每人姓名、age/born/activeYears、三段出身、性格、瞬間、招牌話、背景與池依表；地方勢力存在、池使用既有 base 地點；新增 effect、AI、萬潮葬王內容均 0。

## 驗證結果與新警告

check 的 10 個警告均在既有 monster 檔的捕獲層 HP，沒有本批新檔警告。原樣摘錄：

```text
WARNING [content-load] content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING [content-load] content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING [content-load] content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING [content-load] content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING [content-load] content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING [content-load] content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING [content-load] content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING [content-load] content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING [content-load] content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [content-load] content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [band-evasion] content/base/effects/mx-faded.json $.contribs[0].value value 25 exceeds upper limit 22; source numeric-bands.json rows[18]
WARNING [soft-overflow-band] content/base/frames/bio-breaksurf.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-foam-jaw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-reef-antler.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-shelf-back.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-shell-ear.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-split-fin.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-storm-mane.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-surf-runner.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/frames/bio-trench-maw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/breaksurf.json $.pools[1].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/foam-jaw.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/reef-antler.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/shelf-back.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/shell-ear.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/split-fin.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/storm-mane.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/surf-runner.json $.pools[0].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/tidewolf.json $.pools[1].bands instinct: no band covers values above max
WARNING [soft-overflow-band] content/base/species/trench-maw.json $.pools[0].bands instinct: no band covers values above max
WARNING [band-damage] content/base/abilities/kx-tide-crush.json $.packets value 28 exceeds upper limit 26; source numeric-bands.json rows[7]
WARNING [mechanical-unarmed] content/base/frames/infantry.json $.defaultLoadout mechanical frame has no defaultLoadout or innate attack
WARNING content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING content/base/monsters/nestmother-b.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING content/base/monsters/nestmother-c.json $.partsOverride capture layer HP differs: shoulder, skull, trunk, sac-1, sac-2, sac-3, roots, core-belly
WARNING content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
OK 0 errors, 10 warnings
```

lore 的 **12 個新警告**均因交接書要求的 `character.places` 尚未登記於 checker；照指定保留欄位，不改 checker 或既有契約。原樣摘錄：

```text
WARN characters/aigerim-sarsen.json: 未登記欄位 places
WARN characters/azamat-tursun.json: 未登記欄位 places
WARN characters/bahir-saffar.json: 未登記欄位 places
WARN characters/huda-sharaf.json: 未登記欄位 places
WARN characters/nabil-qassem.json: 未登記欄位 places
WARN characters/ramin-daryani.json: 未登記欄位 places
WARN characters/rasha-mazin.json: 未登記欄位 places
WARN characters/salma-kattan.json: 未登記欄位 places
WARN characters/samira-badawi.json: 未登記欄位 places
WARN characters/saodat-rahimova.json: 未登記欄位 places
WARN characters/tarek-mahfouz.json: 未登記欄位 places
WARN characters/timur-bektemir.json: 未登記欄位 places
errors=0 warnings=12
```

typecheck 執行 `tsc --noEmit && tsc --noEmit -p tsconfig.ui.json`，exit 0。檢查原始 log 與驗收 driver 都在 `/tmp/cx-fp-afrwasia-02/`，worktree 不留 scratch。姓名、背景顯示名與 person／character／background／pool id 事前經 grep 掃 content 全庫，exit 1、無命中；證據為 scratch 的 name-check.log。未加第五條驗收，未跑 probe、playtest、e2e、sim、fuzz 或全套測試。

## 沒做到或證據不足

全套 npm test 為領導收件後的責任；本線不具測試失敗檔名或黃金差異證據。沒有其他工人驗收缺項。數值為既有同級暫值，沒有平衡或實機遊玩結論。

## 需要決定與引擎缺口

無阻塞決定。character.places 未登記的 12 警告待領導統一處理。culture 暫用 egypt／mesopotamia，未將中亞出身改寫成西亞；區域專用名表待後續線。北非／西亞／中亞本地營運地圖尚缺，本批只用現有轉船港；計畫 pending-pools.json 仍屬後續登記，未把 pending 值寫入遊戲。船員職類 tag 與招牌話僅承載履歷，沒有職類指派硬鎖或新技能；招募小傳顯示、職類篩選與一背景多人物仍為計畫所列引擎候選。本批不需插入既有檔，inserts 空表。

## 子代理

0。全部閱讀、撰文與組裝由本線完成，子代理額外成本 0；沒有子代理品質差異可評。未使用外部服務或安裝依賴。

## 以後交接書該點名的工具

無。

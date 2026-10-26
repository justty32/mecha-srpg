# 任務：照可玩內容計畫新增第 05 批——歐洲與非洲，光照到岸（恰好 12 檔，batch bf-play-05）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠摘要**；REPORT 開頭「已讀清單」要列本行所有路徑），`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ops-content.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-05.md`。相對路徑相對 worktree；本稿與 plan、review-draft 可從主 repo 唯讀。用 tabledb 查 templates.json、engine-facts.json 與 review-draft.json 本批12列，不整份讀。逐檔 lore 與範本也要親讀。領導裁決 play-rulings.md 已存在，必讀；與本稿、plan、review-draft衝突時以裁決為準。

## 背景與唯一目標

讓玩家在現有地球營運中遇到 lore。你只產出本批 12 個新檔與報告，不再另設計件數、地圖或引擎。逐檔欄位定案與觸發完整存於 `review-draft.json` 的「掛到」物件；下面逐檔規格給寫手直接落稿。數值沿用同級範本，文字依要點展開，不能新增專名來填空。

**是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。** 黃金紅時列檔名，不改期望、不跑 GOLDEN_UPDATE／rerecord。領導最後整批重錄一次；不要為了維持hash把新內容藏起來。

## 方法與禁忌（必守）

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

本輪裁決必守：`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`；事件每件有光且全批至少三分之二有獸／奇觀或吼句；六類限額物件各最多兩件核心畫面，依review標記；每組契約明列獸與此刻接戰理由。

本批補充：遠方地點只經地球港口的來信、抵港者或回憶呈現，不聲稱玩家已到該洲。lore id 只留報告掛點，不把 `character/` 當 `person/`、不把同名 lore place 當 world place。不得加未實作 `loreRefs`、`location`、`requiresFlag` 欄。純敘事指名勢力／地方要用其既有完整顯示名。

## 範圍（排除法寫死）

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-05/` 新增下面 **恰好 12 檔**；完整白名單亦在本批 manifest 的 files。只新增、不改既有檔。報告另寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-05/`。

- `content/base/world/events/port-bf-malo-nine-bells.json`
- `content/base/world/events/port-bf-roost-unloading-shore.json`
- `content/base/world/events/port-bf-genoa-forge-roar.json`
- `content/base/world/events/news-bf-rhine-training.json`
- `content/base/world/events/port-bf-wings-ground-chorus.json`
- `content/base/world/events/news-bf-alpine-fence.json`
- `content/base/world/events/port-bf-aswan-wet-fields.json`
- `content/base/world/events/port-bf-suez-next-watch.json`
- `content/base/world/events/news-bf-hormuz-fire-night.json`
- `content/base/world/events/port-bf-djibouti-yoke-shout.json`
- `content/base/world/events/news-bf-goldreef-heat-first.json`
- `content/base/world/events/news-bf-greenline-old-chain.json`

不做：不修改或刪除任何既有檔（含池、factions-ops、places、lore、timeline、索引、manifest）；不碰 `src/`、`test/`、`schemas/`、`specs/`、`wf/`（報告目錄除外）、`content/batches/`、`content/index/`；不做數值平衡，不做月面營運、萬潮葬王相關與 AI；不 commit。manifest 由領導預置，工人不可為了驗收改它。worktree 外不寫主 content；scratch/log 放 `/tmp/cx-bf-play-05/`。

件數 gate：content 新檔超過12或修改任一既有檔即停下回報；容量 gate：任一新content檔超過12 KB、合計超過180 KB即停下回報。REPORT ≤20 KB；其餘同質清單用資料檔。任一觸發都停。

### 逐檔規格

#### port-bf-malo-nine-bells.json — 九門同聲

`content/base/world/events/port-bf-malo-nine-bells.json`；類別 `events`。聖馬洛來客把九門舊鐘聲放滿艙，喊欠九座門的回聲今天還。 掛到 place/saint-malo, faction/euro-umbrella；崩年底色1.8。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":5}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-port-bf-malo-nine-bells"},"op":"==","b":0}}]}`。九門同喪的舊鐘聲由抵港者播放：「九門同聲，今天還！」；不新增九次戰役。 石粉味／重鐘聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### port-bf-roost-unloading-shore.json — 岸是搶回來的

`content/base/world/events/port-bf-roost-unloading-shore.json`；類別 `events`。鹿特丹船員踩著傷甲模仿踏浪為岸，吹噓今天誰也別搶他的卸貨位。 掛到 place/rotterdam-roost, faction/salt-gull；崩年底色1.4、1.8。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":12}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.seen-port-bf-roost-unloading-shore"},"op":"==","b":0}}]}`。來客用表演重述既有踏浪為岸，自己踩不穩被人扶住：「岸是搶回來的！」；不宣稱普通人有異能。 鹽水味／衍甲踏響。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### port-bf-genoa-forge-roar.json — 誰的錘先吼

`content/base/world/events/port-bf-genoa-forge-roar.json`；類別 `events`。熱那亞兩位工匠拿不同家印吵架，一敲機臂又都喊別讓它跪。 掛到 place/genoa-yards, faction/inner-sea-houses；崩年底色1.3。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":19}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-port-bf-genoa-forge-roar"},"op":"==","b":0}}]}`。兩位抵港工匠修同一副衍甲：「別讓它跪！」；吵家印也協作，不新造家族名。 熱木屑味／雙錘聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 第二選項定案為「拿本船修料跟兩家工匠合修機臂」；廢料−2、科研工時＋5。以此取捨取代同伴免費受益。 光與代價：廢料−2、科研工時＋5；效果照 content/base/world/events/ruin-before-tide-glow.json 的既有選項組合。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### news-bf-rhine-training.json — 別拿牆練死法

`content/base/world/events/news-bf-rhine-training.json`；類別 `events`。萊茵清剿舊影裡獸甲撞盾，鐵砧來客吼訓練場也不收第二條命。 掛到 place/rhine-trench, faction/anvil；崩年底色1.8、1.11。範本 `content/base/world/events/news-tide-street-sermon.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":26}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.seen-news-bf-rhine-training"},"op":"==","b":0}}]}`。用既有萊茵蝕溝清剿的舊影，獸與盾都在畫面：「別拿牆練死法！」；不另造勝負。 燼灰味／盾撞聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 第二選項定案為「買下獸撞盾後的修造紀錄」；現金−160、科研工時＋8。以此取捨取代同伴免費受益。 光與代價：現金−160、科研工時＋8；效果照 content/base/world/events/rival-practice-banner.json 的既有選項組合。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### port-bf-wings-ground-chorus.json — 地上還有人

`content/base/world/events/port-bf-wings-ground-chorus.json`；類別 `events`。殘翼地勤模仿鐵翼掠過屋頂，忽然把嗓子吼破：地上還有人。 掛到 place/istanbul, faction/remnant-wings；崩年底色1.2、1.4。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":5}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-port-bf-wings-ground-chorus"},"op":"==","b":0}}]}`。來客重演既有救援記憶：「地上還有人！」；不送空援券、不宣稱凡鐵能殺獸。 紙煙味／機翼掛飾碰響。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### news-bf-alpine-fence.json — 光到這裡就夠

`content/base/world/events/news-bf-alpine-fence.json`；類別 `events`。高山墟舊影把圍籬照白，學徒吼光到這裡就夠，還不肯讓人補答案。 掛到 place/alpine-shell, faction/shell-society；崩年底色1.3。範本 `content/base/world/events/news-tide-street-sermon.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":12}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-news-bf-alpine-fence"},"op":"==","b":0}}]}`。高山墟既有光景以舊影呈現：「光到這裡就夠！」；不寫光的原理或古代機認主。 松脂味／圍籬碰響。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### port-bf-aswan-wet-fields.json — 水困，機殺

`content/base/world/events/port-bf-aswan-wet-fields.json`；類別 `events`。亞斯文放閘舊影中水困住獸，機甲踏水逼近；船工吼水困機殺。 掛到 place/aswan, faction/north-africa-umbrella；崩年底色1.4、1.11。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":19}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.seen-port-bf-aswan-wet-fields"},"op":"==","b":0}}]}`。明確回顧2093後既有戰法，先水困、再機殺，不能說2091水已殺獸；來客喊「水困，機殺！」。 河泥味／閘水轟響。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### port-bf-suez-next-watch.json — 人到了才換班

`content/base/world/events/port-bf-suez-next-watch.json`；類別 `events`。蘇伊士來的隊員站上甲板喊人到了才換班，困得連自己的名字都喊錯。 掛到 place/suez, faction/league, faction/west-asia-umbrella；崩年底色1.6。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":26}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-port-bf-suez-next-watch"},"op":"==","b":0}}]}`。運河夜守約精神由來客換班演練呈現：「人到了才換班！」；有倦意與笑話，不新訂國際法。 汗味／踏板聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 第二選項定案為「取消本船休息，加班把換班機的修造心得整理完」；全員士氣−1、科研工時＋3。以此取捨取代同伴免費受益。 光與代價：全員士氣−1、科研工時＋3；效果照 content/base/world/events/restraint-empty-rack.json 的既有選項組合。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### news-bf-hormuz-fire-night.json — 燃夜還有船

`content/base/world/events/news-bf-hormuz-fire-night.json`；類別 `events`。荷姆茲燃夜舊影裡火照海峽，抵港水手和船員一起吼還有船。 掛到 place/hormuz, faction/west-asia-umbrella；崩年底色1.8。範本 `content/base/world/events/news-tide-street-sermon.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":5}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-news-bf-hormuz-fire-night"},"op":"==","b":0}}]}`。回顧既有燃夜救援，火海遠處船光未斷：「燃夜還有船！」；不新增永久免費通行效果。 鹽煙味／天網斷續喊聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### port-bf-djibouti-yoke-shout.json — 軛斷，人別散

`content/base/world/events/port-bf-djibouti-yoke-shout.json`；類別 `events`。吉布地修理人抬起斷軛喊人別散，騎手回他少說兩句先敲準。 掛到 place/djibouti, faction/far-herd；崩年底色1.2、1.4。範本 `content/base/world/events/port-raft-lantern.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":12}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.seen-port-bf-djibouti-yoke-shout"},"op":"==","b":0}}]}`。遠牧來客帶破軛到港修理：「軛斷，人別散！」；不是馴獸，不寫獸懂得感恩。 鐵鏽味／偏錘聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 第二選項定案為「拿本船修料替騎手修軛，學下接合手法」；廢料−2、科研工時＋5。以此取捨取代同伴免費受益。 光與代價：廢料−2、科研工時＋5；效果照 content/base/world/events/ruin-before-tide-glow.json 的既有選項組合。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### news-bf-goldreef-heat-first.json — 把地底的光舉起

`content/base/world/events/news-bf-goldreef-heat-first.json`；類別 `events`。金山舊影裡裂晶出井，整排窗逐盞亮起，井工喊把地底的光舉起。 掛到 place/gold-reef, faction/sub-saharan-umbrella；崩年底色1.3、1.4。範本 `content/base/world/events/news-tide-street-sermon.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":19}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.seen-news-bf-goldreef-heat-first"},"op":"==","b":0}}]}`。金山夜既有採晶與取暖畫面：「把地底的光舉起！」；不在內陸井底加獸或喚醒古代機。 礦塵味／絞盤聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 光與代價：保留現金供出擊，或花100換全員士氣1；照既有新聞數值。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### news-bf-greenline-old-chain.json — 死的是獸，蝕還在

`content/base/world/events/news-bf-greenline-old-chain.json`；類別 `events`。綠線舊影裡巢母倒下，裂縫仍亮著；讀訊人喊死的是獸，蝕還在。 掛到 place/green-line, faction/green-line；崩年底色1.9、1.11。範本 `content/base/world/events/news-tide-street-sermon.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":26}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.seen-news-bf-greenline-old-chain"},"op":"==","b":0}}]}`。既有綠線清剿與封口失敗紀錄，不自創二名或新戰果：「死的是獸，蝕還在！」。 焦布味／破裂聲。text 60–160字、第二人稱現在式，不插值、不寫具名人物。遠方舊聞須明示舊影／回顧或來客轉述，不當新確定史實。兩選項均設seen；不加next、不發契約。代價必在選項清楚顯示，不讓兩選項都變免費善意。 第二選項定案為「買下清剿隊的修甲紀錄，研究封口失敗後如何撤機」；現金−160、科研工時＋8。以此取捨取代同伴免費受益。 光與代價：現金−160、科研工時＋8；效果照 content/base/world/events/rival-practice-banner.json 的既有選項組合。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

### 既有檔插入交接

本批每列「插入需求」合併去重後寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-05/inserts.json`，wf-table/1，columns `["file","jsonPath","op","value","why"]`；op只用append／setKey。本批僅append，完整值在review-draft。**工人不能套入既有檔**。合併線只在舊值不含該值時append，不能覆寫陣列；port tag與contractKinds接好才算可遇到。無年表插入。跨批新引用一律不要寫進content；若審定另有需求，列inserts等待合併線，不追改別批。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | worktree內寫完本批後，末行OK 0 errors；新警告原文進REPORT |
| `node src/ops/content/check.ts content/base` | 營運格式與引用，0 errors |
| `npm run typecheck` | worktree收尾，exit 0 |
| `npm test` | worktree收尾一次；黃金例外逐檔列證據 |
| `python3 wf/tools/tabledb.py` | 查範本、引擎事實、review本批；不整表讀 |
| `python3 wf/tools/content_index.py refs` | 只查既有引用，不重產索引 |
| `git status --short` | 記錄自己新增檔，node_modules為領導預置例外 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-play-05 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局 |

不上網、不用MCP、不跑GUI。本批不跑probe或自加戰役長測；不執行content_accept（那會建立基準worktree），領導收線處理。

## 資源與禁區

**可寫程式碼線**：實際只寫「範圍」的content白名單與報告目錄，worktree為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-05/`，不改程式、不commit。報告路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-05/`；臨時檔放 `/tmp/cx-bf-play-05/`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不使用外部服務。單檔整體改寫用單一操作。

**子代理上限 1 個**，模型隨意；只為本批實質工作，親自讀AGENTS.md、bf-common.md與本線先讀，同一可寫範圍、不得擴批，REPORT記成本品質。

**分清錯誤來源**：點名工具壞掉、worktree／manifest未備妥、沙箱拒寫→BLOCKED；自己指令或腳本錯→自己修。不得以沙箱失敗概括所有紅測試。

## 工作

1. 讀先讀、12列規格、逐檔範本與lore；確認領導預置manifest的base不為TBD、worktree存在；發PROGRESS。
2. 只新增12檔。報告中的插入需求去重，保留可觀察的接入方法，不套既有檔。
3. 跑上表指定檢查；寫review-rows.json、naming.json、inserts.json、REPORT；回報終局。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-05/REPORT.md`，回覆只要5行摘要＋REPORT路徑。新檔位置 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-05/content/base/world/`；其餘產物都在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-05/`。

`review-rows.json`：wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，恰好12列、白話≤60字；將草稿結構化掛點縮成lore id＋節點即可。`naming.json`：wf-table/1，columns `["id","nameEn","meaning","nameZh","method","status"]`；無新概念詞寫現有詞組合，nameEn可空，不將中文名回譯成aka。`inserts.json`採上一段格式；不需要timeline-add。

REPORT第一段「已讀清單」原樣列先讀路徑；再四段「做了什麼」「產出」（逐檔定位、掛點、git status原文、檢查exit與新警告、黃金紅的測試及fixture檔名）「沒做到或證據不足的」（尚未套inserts不得冒稱已上主線可達）「需要決定的事」（新專名提案／引擎缺口／衝突）；再「子代理」與「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree內自己改動恰好上列12個新content檔，沒有修改既有檔；以git status --short記錄，領導預置node_modules不算工人產物。
2. worktree內npm run check末行OK 0 errors、node src/ops/content/check.ts content/base為0 errors、npm run typecheck exit 0。
3. worktree內npm test exit 0；若只剩本批抽選／對話造成的黃金或寫死軌跡差異，可豁免但列測試與fixture檔名、原始錯誤，不改期望、不跑GOLDEN_UPDATE／rerecord；非黃金錯誤修到符合。
4. review-rows.json恰好12列且白話≤60字，naming.json與inserts.json合法；逐檔掛點、觸發與文字要點完成，沒有萬潮葬王／AI／月面營運件。
5. REPORT存在且開頭已讀清單完整，記本批是否改黃金與未套插入需求。

不要加驗其他東西；全批合併與黃金重錄歸領導。

## 失敗怎麼處置

- **測出來是壞的**→自己修到符合；修不好保留改動，REPORT寫哪條不符，發FAILED。
- **測不出來**→保持現狀，REPORT寫解除條件，發BLOCKED，不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-play-05`。本線團隊：`teams/bigfill`。上線先發PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-05 --up PROGRESS '已讀完，開始寫 bf-play-05' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-05 --up DONE 'bf-play-05 12檔完成，插入需求交合併線' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-05/REPORT.md`，STATUS與標題照實換。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡住超過10分鐘先發BLOCKED。

ROSTER由領導代登記。本稿不授權改既有檔、改黃金、建worktree或安裝套件。

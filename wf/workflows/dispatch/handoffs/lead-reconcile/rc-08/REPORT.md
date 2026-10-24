## 已讀清單

- `AGENTS.md`（親自讀取 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`

另讀：`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`。

## 做了什麼

cx-rc-08 依 guide.md 的 dark 規則與 tabledb 查得的已裁示 R21，逐檔判讀指定 16 檔。改 11 檔，5 檔無需改；勢力正式名用「月之暗面」，文中簡稱用「暗面」，aka 原位改成「暗面」。保留地理與物件本義。只改 name、aka、summary、body、consequences、note 與中文 tags；引用、鍵、陣列長度、數字與檔名保持原樣。沒有 commit。

件數 gate：11 ≤ 16。容量 gate：寫入前逐檔按 UTF-8 位元組計算，最大增幅 0.528%，低於 30%。

固定五條驗收：

1. `git status --short`：只列 11 個允許內容檔的修改；另有開工時已存在的 `?? node_modules`。
2. 本次執行 `npm run check` 結束碼 0，末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` 結束碼 0，末行 `errors=0 warnings=2`。八項為範圍外怪獸 capture layer HP 警告；兩項為範圍外 `busan-returned-seal`、`dark-quay-surety` 未入 timeline 警告。
3. 指定的全 content `git grep -nE` 已執行，再逐檔判讀本批命中：16 檔無「潮差」，勢力義「背面」已改完；地理／本義殘留逐處列於下段。
4. 下列逐檔對照涵蓋全部 16 檔與每處改名。
5. 報告第一段已讀清單列齊「先讀」全部 11 路徑。

只做交接書固定驗收；未加跑 npm test、typecheck、probe、MCP 或其他驗收。檢查原始輸出暫存 `/tmp/cx-rc-08/check.log`、`/tmp/cx-rc-08/lore-check.log`；全庫 grep 輸出暫存 `/tmp/cx-rc-08/residuals.txt`，報告目錄只交付本檔。

## 逐檔對照

### `content/lore/events/skagerrak-shell-found.json`

- `body`：背面的老鴿從渡月船上傳來第一封信 → 月之暗面的老鴿從渡月船上傳來第一封信。
- `consequences[2]`：背面與鹽鷗的交情反而由此開始 → 暗面與鹽鷗的交情反而由此開始。

### `content/lore/events/tenth-law.json`

無需改：唯一命中是附信的背面，指紙張反面，符合 dark 的一般本義保留規則。

### `content/lore/events/tranquility-founded.json`

無需改：「2097 背面裂開」描述月面地理，符合 dark 的地理保留規則。

### `content/lore/events/tranquility-strike.json`

無需改：標題、墟帶、工安、輪班與挖掘五處均指月球背面作業地點，沒有走私網勢力義。

### `content/lore/factions/backside.json`

- `name`：「背面」 → 「月之暗面」。
- `aka[0]`：背面 → 暗面。
- `body`：背面就誕生了——掘墟的工人、被裁的地勤、看守 → 月之暗面就誕生了——掘墟的工人、被裁的地勤、看守。
- `body`：背面的窩 → 暗面的窩。
- `body`：背面沒有首領 → 暗面沒有首領。
- `body`：背面不打仗 → 暗面不打仗。
- `body`：塞勒涅公開把背面列為敵人 → 塞勒涅公開把暗面列為敵人。
- `body`：背面越賺 → 暗面越賺。
- `body`：但背面的態度隨你欠塞勒涅多少錢而變 → 但暗面的態度隨你欠塞勒涅多少錢而變。
- `body`：也都是背面的商品 → 也都是暗面的商品。
- `body`：背面誰都不信 → 暗面誰都不信。
- `body`：背面不造機 → 暗面不造機。
- `body`：背面說這是手藝 → 暗面說這是手藝。
- `body`：背面沒有常備軍 → 暗面沒有常備軍。
- `body`：井外沒有升起背面的旗 → 井外沒有升起暗面的旗。
- `body`：背面的貨便宜 → 暗面的貨便宜。
- `body`：背面沒有保有一台可供全網研發的古代機 → 暗面沒有保有一台可供全網研發的古代機。
- `body`：更不等於背面能量產古代機 → 更不等於暗面能量產古代機。
- `relations[0].note`：實際上塞勒涅中層靠背面洗貨 → 實際上塞勒涅中層靠暗面洗貨。
- `relations[1].note`：稽古學會是背面月面骸片最穩定的買家 → 稽古學會是暗面月面骸片最穩定的買家。
- `relations[2].note`：野魂借背面的貨道與算核藏身 → 野魂借暗面的貨道與算核藏身。
- `relations[2].note`：背面替它們搬家 → 暗面替它們搬家。
- `relations[4].note`：罷工時背面替他們藏人 → 罷工時暗面替他們藏人。
- `relations[5].note`：有一部分經背面的手轉賣 → 有一部分經暗面的手轉賣。

### `content/lore/factions/remnant-wings.json`

無需改：「每張券背面」指券的反面；其他命中屬既有聖保羅與歸還黨敘事，本批只分派 dark。

### `content/lore/factions/ring-caravan.json`

無需改：「舊貨單背面」指紙張反面；聖保羅是既有城市／蝕域名稱，本批只分派 dark。

### `content/lore/factions/salt-gull.json`

- `body`：背面的老鴿替它找過買家 → 月之暗面的老鴿替它找過買家。
- `body`：吉大港、背面、殘聯是朋友 → 吉大港、暗面、殘聯是朋友。

### `content/lore/factions/shell-society.json`

- `body`：背面是供貨商 → 月之暗面是供貨商。
- `relations[4].note`：背面偷渡下來的月面骸片 → 暗面偷渡下來的月面骸片。

### `content/lore/places/endymion-vault.json`

- `body`：背面說穹頂的出入紀錄裡有一個沒有名字的編號 → 月之暗面說穹頂的出入紀錄裡有一個沒有名字的編號。

### `content/lore/places/farside-ruin-belt.json`

- `body`：背面在封鎖線拉起的那天誕生 → 月之暗面在封鎖線拉起的那天誕生。
- `body`：背面傳說墟帶深處第二台古代機認了一個測試員 → 暗面傳說墟帶深處第二台古代機認了一個測試員。
- `body`：背面賣墟帶的殘片與座標 → 暗面賣墟帶的殘片與座標。

### `content/lore/places/ferry-lane.json`

- `body`：背面 → 月之暗面。
- `body`：航路成了骸片流回地球唯一的路——背面就在這條航路上長大 → 航路成了骸片流回地球唯一的路——暗面就在這條航路上長大。
- `tags[4]`：背面 → 月之暗面。

### `content/lore/places/ice-shell.json`

- `body`：稽古學會與背面都收 → 稽古學會與月之暗面都收。

### `content/lore/places/skagerrak-shell.json`

- `body`：背面的老鴿第一個到現場替鹽鷗估價 → 月之暗面的老鴿第一個到現場替鹽鷗估價。

### `content/lore/places/uluru-heart.json`

- `body`：有人說背面的老鴿出過價 → 有人說月之暗面的老鴿出過價。

### `content/lore/places/yukon-shell.json`

- `summary`：稽古學會與背面都在找 → 稽古學會與月之暗面都在找。
- `body`：- 背面 → - 月之暗面。

## 殘留

以下僅列本批 16 檔；全庫搜尋也會命中其他線的檔案，未越界修改。各處取半句，欄位與上下文用來區分同欄多次命中。

本批「潮差」「複本」「迦梨」「九闕」均無命中；「背面」保留如下：

### `content/lore/events/tenth-law.json`

- `body`「在附信的背面寫了一句回覆寄還給佩特羅娃」：物件反面，依 dark 保留。

### `content/lore/events/tranquility-founded.json`

- `body`「2097 背面裂開時」：月面地理／該地作業，依 dark 保留。

### `content/lore/events/tranquility-strike.json`

- `body`「## 背面的帳」：月面地理／該地作業，依 dark 保留。
- `body`「背面墟帶的前哨需要人」：月面地理／該地作業，依 dark 保留。
- `body`「背面的工安事故死了四十七個地勤」：月面地理／該地作業，依 dark 保留。
- `body`「地勤會拿到了背面輪班從三個月降到兩個月」：月面地理／該地作業，依 dark 保留。
- `body`「全世界第一次看見塞勒涅在背面挖到了一台永遠不醒的古代機」：月面地理／該地作業，依 dark 保留。

### `content/lore/factions/backside.json`

- `body`「2097 年月面背面裂開一次」：月面地理／該地作業，依 dark 保留。

### `content/lore/factions/remnant-wings.json`

- `body`「每張券背面都有哈坎・德米爾上校的親筆簽名」：物件反面，依 dark 保留。

### `content/lore/factions/ring-caravan.json`

- `body`「舊貨單背面畫滿了辨認方法」：物件反面，依 dark 保留。

### `content/lore/places/endymion-vault.json`

- `region`「月面・背面遺跡帶核心」：月面地理／該地作業，依 dark 保留。
- `summary`「背面遺跡帶核心的古墓」：月面地理／該地作業，依 dark 保留。

### `content/lore/places/farside-ruin-belt.json`

- `name`「背面遺跡帶」：月面地理／該地作業，依 dark 保留。
- `region`「月面・背面兩百公里墟帶」：月面地理／該地作業，依 dark 保留。
- `summary`「月球背面一夜之間露出的兩百公里墟帶」：月面地理／該地作業，依 dark 保留。
- `body`「月球背面永遠背對地球」：月面地理／該地作業，依 dark 保留。
- `body`「背面的灰原裂開一道口」：月面地理／該地作業，依 dark 保留。
- `body`「背面裂一次」：月面地理／該地作業，依 dark 保留。

其他搜尋詞的每處命中及保留理由：

### `content/lore/factions/remnant-wings.json`

- `body`「各國鐵翼出動轟炸孟買與聖保羅」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。
- `body`「殘翼的鐵翼是被歸還黨叫回去的那批空援——殘翼只聽付錢的人」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `body`「歸還黨是最大的私人客戶」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `relations[2].note`「歸還黨是最大的私人客戶」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。

### `content/lore/factions/ring-caravan.json`

- `aka[0]`「聖保羅環線」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。
- `scale`「繞聖保羅蝕域外圍一整圈」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。
- `hq`「環線（聖保羅蝕域外環）」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。
- `summary`「繞著聖保羅蝕域外圍跑地面商隊的卡車帝國」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。
- `body`「聖保羅在 2089 到 2090 年間失守」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。
- `body`「聖保羅被放棄」：既有城市／蝕域或商隊別名；guide sea 明定名稱照用，本批只分派 dark，未擴寫核心位置。

### `content/lore/factions/salt-gull.json`

- `summary`「2104 年被歸還黨出賣折損一半之後」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `body`「歸還黨撤走空援」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `body`「鹽婆從那天起記住了歸還黨每一個指揮官的名字」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `body`「歸還黨、釜山、第三刃是仇人」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `relations[0].note`「2104 歸還黨撤走空援」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。

### `content/lore/factions/shell-society.json`

- `body`「2103 年它與鐵砧合挖浦那外的舊陣列遺跡」：既有掘墟或失守事件；guide sea 保留事件，本批只分派 dark，未擴寫蝕域擴張。
- `body`「2106 年浦那陷落」：既有掘墟或失守事件；guide sea 保留事件，本批只分派 dark，未擴寫蝕域擴張。
- `body`「歸還黨想要刑天」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `relations[5].note`「歸還黨一直想要刑天」：指既有孟買支相關行動或外交；guide politics 保留既有情節，本批只分派 dark，未補寫其他兩支。
- `ancientMech.doctrine`「刑天 2106 浦那陷落後沉睡、帶怨」：既有掘墟或失守事件；guide sea 保留事件，本批只分派 dark，未擴寫蝕域擴張。

## 沒做到或證據不足的

無。本批指定修改與驗收均完成。兩項檢查仍有上述範圍外警告，不在本批修改範圍；沒有以舊輸出代替本次證據。

## 需要決定的事

無。本批 dark 改名不需要改數值、結構或範圍外檔案；其他主題的跨檔整合由領導依各批範圍處理。

## 子代理

未使用子代理；子代理成本為 0，全部判讀、修改與報告由 cx-rc-08 親自完成。

## 以後交接書該點名的工具

無。

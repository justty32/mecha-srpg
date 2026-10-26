## 已讀清單

- `AGENTS.md`
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

AGENTS.md 親自讀取主 repo 的 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘上述路徑親自讀取本線 worktree 版本。另讀 SESSION-LOG、WAIT_USER、WORKFLOWS、inbox README／PROTOCOL 及 world-pillars 的 world／mechs 入口。

## 做了什麼

cx-rc-07 依 guide.md 的 dark 規則及 tabledb 查得的 R21 裁示，逐一判讀 17 檔：12 檔改勢力名稱，5 檔無需改。正式稱呼採「月之暗面」，行文簡稱「暗面」；地理與物件背面保留。只改 body、summary、consequences 與中文 tags；未改 id、引用、數值、鍵或陣列長度。單檔最大位元組增幅 0.75%，未觸及 30% 容量門檻。

固定五條驗收結果：

1. `git status --short`：12 個指定內容檔修改，另有開工時即存在的 `?? node_modules`，沒有其他 worktree 改動。
2. 本次 `npm run check` 退出碼 0，末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` 退出碼 0，末行 `errors=0 warnings=2`。lore 警告為 busan-returned-seal、dark-quay-surety 未出現在 timeline；本批不增修年表。完整輸出在 `/tmp/cx-rc-07/check.log` 與 `/tmp/cx-rc-07/lore-check.log`。
3. 已執行交接書點名的全 content `git grep -nE`，再逐檔判讀本批命中；17 檔沒有「潮差」，勢力義「背面」無殘留，地理與本義逐處列於下節。
4. 以下逐檔對照涵蓋 17 檔及每處改動。
5. 開頭已讀清單逐行列齊交接書點名的 11 個路徑。

## 逐檔對照

### content/lore/characters/park-incheol.json

- `body`：「地勤會和背面做生意」 → 「地勤會和月之暗面做生意」。

### content/lore/characters/patrick-oconnor.json

無需改：唯一「背面」是空援券的反面。

### content/lore/characters/ren-kasai.json

無需改：唯一「背面」是排燼閥蓋子的反面。

### content/lore/characters/shen-yanqiao.json

- `tags[0]`：「背面」 → 「月之暗面」。

### content/lore/characters/tsai-mingzhu.json

- `body`：「背面的走私網從那一天誕生」 → 「月之暗面這張走私網從那一天誕生」。
- `body`：「背面的人說」 → 「暗面的人說」。

### content/lore/eras/old-world.json

無需改：唯一「背面」是作業簿的反面。

### content/lore/eras/yoke-years.json

- `body`：「走私網「背面」誕生」 → 「走私網「月之暗面」誕生」。
- `body`：「背面的生意」 → 「暗面的生意」。
- `body`：「背面把它逆向」 → 「暗面把它逆向」。

### content/lore/events/dark-quay-surety.json

- `body`：「背面的陸照音」 → 「月之暗面的陸照音」。
- `body`：「背面的攤主」 → 「暗面的攤主」。

### content/lore/events/forerunners-seal.json

無需改：兩處「背面」均指月面墟帶的位置。

### content/lore/events/hekate-secret.json

- `body`：「「背面」的走私者」 → 「「月之暗面」的走私者」。
- `body`：「據背面的說法」 → 「據暗面的說法」。
- `body`：「背面與稽古學會之間」 → 「暗面與稽古學會之間」。
- `consequences[2]`：「背面與稽古學會之間」 → 「暗面與稽古學會之間」。

### content/lore/events/hidden-lantern-pact.json

- `summary`：「背面與地勤會」 → 「月之暗面與地勤會」。
- `body`：「背面賣出的去處」 → 「暗面賣出的去處」。
- `consequences[0]`：「背面入約貨棧」 → 「暗面入約貨棧」。

### content/lore/events/lance-v4.json

- `body`：「2102 年背面把」 → 「2102 年月之暗面把」。

### content/lore/events/longspear-leak.json

- `summary`：「背面買走」 → 「月之暗面買走」。
- `body`：「「背面」」 → 「「月之暗面」」。
- `body`：「背面的工匠」 → 「暗面的工匠」。
- `body`：「背面自己開的玩笑」 → 「暗面自己開的玩笑」。
- `body`：「背面的理由」 → 「暗面的理由」。
- `body`：「那些東西背面賣」 → 「那些東西暗面賣」。
- `body`：「2102 年背面把」 → 「2102 年暗面把」。
- `consequences[1]`：「拆船幫與背面」 → 「拆船幫與月之暗面」。

### content/lore/events/lunar-blockade.json

- `summary`：「「背面」」 → 「「月之暗面」」。
- `body`（此欄第 1 處）：「「背面」」 → 「「月之暗面」」。
- `body`（此欄第 2 處）：「「背面」」 → 「「月之暗面」」。
- `body`：「## 背面誕生」 → 「## 月之暗面誕生」。
- `body`：「中層靠背面洗貨」 → 「中層靠暗面洗貨」。
- `consequences[3]`：「「背面」」 → 「「月之暗面」」。

### content/lore/events/lunar-tide-and-shell.json

- `body`：「被背面的走私網流出過一頁」 → 「被月之暗面這張走私網流出過一頁」。

### content/lore/events/moonless-evacuation.json

- `summary`：「背面用臨時護貨隊」 → 「月之暗面用臨時護貨隊」。
- `body`：「背面在靜海市外」 → 「月之暗面在靜海市外」。
- `body`：「背面的攤主」 → 「暗面的攤主」。
- `body`：「背面沒有可供點名」 → 「暗面沒有可供點名」。
- `body`：「背面那台拼接」 → 「暗面那台拼接」。
- `consequences[0]`：「背面臨時雇用」 → 「月之暗面臨時雇用」。
- `consequences[1]`：「背面沒有成立」 → 「暗面沒有成立」。
- `consequences[2]`：「促使背面與地勤會」 → 「促使暗面與地勤會」。

### content/lore/events/ring-road-lanterns.json

無需改：唯一「背面」是封條的反面。

## 殘留

以下只列本批 17 檔的每一處命中片段；全庫其他路徑不屬本線可寫範圍。保留的「背面」均依 guide.md dark 地理／本義例外。沒有「潮差」「複本」「迦梨」「九闕」命中。

### content/lore/characters/park-incheol.json

- `body`「的影像——塞勒涅在背面挖到、鎖了一年的那台永遠不醒的」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/characters/patrick-oconnor.json

- `body`「孟買在第三週被吞，聖保羅也在燒，他簽下了那道命令：所有」：聖保羅；地名；guide.md sea 明定名稱照用。本批僅 dark，不擴寫失守經過。
- `body`「司。每一張空援券的背面，從此多了一個手寫簽名。 」：背面；唯一「背面」是空援券的反面。

### content/lore/characters/ren-kasai.json

- `body`「座艙裡排燼閥的蓋子背面，每次出擊前掀開看一眼。  老」：背面；唯一「背面」是排燼閥蓋子的反面。

### content/lore/characters/tsai-mingzhu.json

- `summary`「舒招上月亮、封鎖了背面遺跡帶、讓塞勒涅追求全面無人化」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「 2097 年月面背面裂開一次，兩百公里的墟帶露出來」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `relations[3].note`「背面深處那台古代機認的測試員；塞勒」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/eras/old-world.json

- `body`「看，格爾木外的山、浦那外的舊天文陣列、的的喀喀湖畔、」：浦那；既有舊天文陣列／刻痕地點，並未宣稱內陸新開裂；非勢力改名。
- `body`「」是孩子畫在作業簿背面的東西。塞勒涅賣的是月壤、信貸」：背面；唯一「背面」是作業簿的反面。

### content/lore/eras/yoke-years.json

- `body`「 2097 年月面背面裂開一次，同夜露出兩百公里的墟」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「誕生；2099 年背面深處第二台古代機認了一個叫 M」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「第一次看見塞勒涅在背面挖到了什麼：一台永遠不醒的古代」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/events/forerunners-seal.json

- `body`「面，像用身體堵門。浦那舊陣列的刻痕畫著一個人，沒有頭」：浦那；既有舊天文陣列／刻痕地點，並未宣稱內陸新開裂；非勢力改名。
- `body`「說那就是夸父。月面背面那兩百公里的墟帶，據推測就是被」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `consequences[2]`「潮隨月相起落，月面背面留下兩百公里墟帶。」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/events/hekate-secret.json

- `summary`「聞）2099 年，背面遺跡帶深處的第二台古代機「赫卡」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「挑的人，她每個月去背面一次，就是去看 M-3。 - 」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「出來的煙，用來抬高背面殘片的價格。  ## 為什麼不」：背面；地理來源義：月球背面出土的殘片，並非走私網的稱呼。
- `body`「回應始終只有一句：背面遺跡帶沒有任何認主紀錄。 」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `consequences[1]`「塞勒涅官方始終否認背面有任何認主紀錄。」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/events/lance-v4.json

- `body`「窮獵團、城邦民兵、歸還黨的橙色部隊，連綠線幫都有幾台。」：歸還黨；另一勢力既有部隊的名稱；guide.md politics 保留既有孟買支內容，本批僅 dark。

### content/lore/events/lunar-blockade.json

- `summary`「勒涅在三個月內封鎖背面兩百公里遺跡帶至今；恩底彌翁出」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「月**：保全部門把背面的三座礦區改成前哨，沿著兩百公」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「月**：渡月船停賣背面航段，靜海市所有月面車改裝追蹤」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「，任何未經許可進入背面的人一律以「侵入礦權」拘留。 」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「網上發了一份公告：背面遺跡帶屬塞勒涅礦權範圍，基於安」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `consequences[0]`「背面遺跡帶封鎖至今，挖到什麼從不公」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/events/lunar-tide-and-shell.json

- `summary`「2097 年，月面背面裂開唯一的一次，同夜露出綿延兩」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「大潮之夜，塞勒涅在背面的礦區回報了一件不可能的事：地」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「十七道一樣的光，從背面的平原往上流。  月面上沒有人」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「裡；但在那幾天裡，背面三座礦區全部失聯，塞勒涅的保全」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「但它在閉上之前，讓背面的地面塌出一條長長的傷口：兩百」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `body`「行長蔡明珠親自上了背面一趟。她回到靜海市後只開了一次」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。
- `consequences[0]`「月面背面裂開唯一的一次，蝕潮第一次到達」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/events/moonless-evacuation.json

- `body`「靜海市的武器封印與背面遺跡帶的封鎖，都沒有因此解除。」：背面；月面地理義：礦區、墟帶、挖掘／認主地點或前往該處的行動，非勢力。

### content/lore/events/ring-road-lanterns.json

- `body`「到下一站。他在封條背面簽了字，讓庫管把這批貨直接算進」：背面；唯一「背面」是封條的反面。

## 沒做到或證據不足的

本批指定工作無未完成項。兩項檢查仍有上述警告，未宣稱零警告；依交接書只執行固定驗收，未跑 npm test 或其他額外驗收。

## 需要決定的事

無。本次勢力改名未遇到需改其他檔、數值或結構才能完成的情況。

## 子代理

未使用；子代理成本為零，17 檔語境與殘留由本線親自判讀。

## 以後交接書該點名的工具

無。

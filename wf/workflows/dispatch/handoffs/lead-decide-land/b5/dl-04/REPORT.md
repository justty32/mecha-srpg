# 已讀清單

以下均由 cx-dl-04 親自讀取；相對路徑以隔離 worktree 為根。

- `AGENTS.md`（實讀 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/dispatch/handoffs/lead-decide-land/b5/guide.md`

另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`。

## 做了什麼

逐檔讀完 56 個事件的 summary、body、consequences，31 檔局部修句、25 檔無需改。實際修改僅在 summary、body、consequences；保留事件走向、專名、數字、日期、引用、鍵與陣列長度。修正語序、被動句、量詞與拗口搭配，並補回基多船廠交易對白漏掉的閉引號。

依 guide「第一輪退回的教訓」，保留「長出東西」「長成」「收成窗口」「沒有被放棄的選項」等原有風格與意象；未添獨駕、不老、SS／SSS或隱藏真相說明。未使用子代理，未 commit。

編輯前逐檔檢查寫入候選的容量與件數；最終仍為 31 檔，最大增幅為 `quito-shipyard-sale.json` 的 1.57%，未達 15%。筆記、腳本與檢查原始輸出均放 `/tmp/cx-dl-04/`，報告目錄只寫本 REPORT。

### 固定五條驗收

1. `git -C <worktree> status --short`：31 個修改檔全部在交接書白名單；另只有開工時已存在的 `?? node_modules`。
2. 最後版本執行 `npm run check`：`OK 0 errors, 8 warnings`；`node content/lore/check.ts`：`errors=0 warnings=2`。8 個警告位於未改動的 `content/base/monsters/`，為 capture layer HP differs；2 個 lore 警告為本批外 `busan-returned-seal.json`、`dark-quay-surety.json` 未出現在 timeline。沒有跑 npm test 或其他驗收命令。
3. 改前、改後均執行指定全庫 grep，皆命中 81 行；本批 9 行。精粹核僅存於 style.md 的原料定義，共 2 行、3 處；裁示逐列與殘留理由見下。
4. 下節含全部 56 檔，每處修改列舊、新片段，25 檔明記「無需改」。
5. REPORT 首段列出交接書「先讀」全部 13 個路徑。

檢查紀錄：`/tmp/cx-dl-04/check.log`、`/tmp/cx-dl-04/lore-check.log`；指定 grep 改前／改後輸出：`/tmp/cx-dl-04/grep-before.txt`、`/tmp/cx-dl-04/grep-after.txt`。最後兩處保留原句的調整不含 grep 搜尋詞，命中與行號不變。

## 逐檔對照

只列含改動的短片段，不傾印完整欄位。欄位索引從 0 起。

### content/lore/events/equator-ports-accord.json

- `body`：`塞勒涅宣布正式的航班制度` → `塞勒涅正式公布航班制度`
- `consequences[0]`：`地月交通定為三港弦月開船、單程三天的格局。` → `地月交通定下三港弦月開船、單程三天的安排。`

### content/lore/events/first-hunting-bands.json

- `body`：`師團長格雷格・奧爾森，三十八歲，把全師團的人叫…` → `三十八歲的師團長格雷格・奧爾森把全師團的人叫…`
- `body`：`把鐵翼之月活下來的飛行員集合在` → `把從鐵翼之月活下來的飛行員召集到`

### content/lore/events/first-return-offensive.json

- `consequences[1]`：`鹽鷗被歸還黨撤走空援丟在灘頭、折損…` → `歸還黨撤走空援，鹽鷗被丟在灘頭、折損…`

### content/lore/events/first-tide.json

無需改。

### content/lore/events/forerunners-seal.json

- `body`：`學界吵了十年那兩樣是什麼。` → `學界為那兩樣東西是什麼吵了十年。`

### content/lore/events/golmud-split.json

- `body`：`也拿到了日後魂核研究的起點。` → `也為日後的魂核研究打下了底子。`
- `consequences[1]`：`…尖的衍型機人才與魂核研究的起點。` → `…尖的衍型機人才，也有了魂核研究的底子。`

### content/lore/events/green-line-purge.json

- `body`：`這是獵牌法通緝章的第一次執行。` → `這是第一次按獵牌法的通緝章辦事。`
- `consequences[3]`：`獵牌法通緝章第一次執行。` → `獵牌法通緝章首次付諸實行。`

### content/lore/events/gui-funeral.json

無需改。

### content/lore/events/gull-anvil-truce.json

無需改。

### content/lore/events/gyeongju-contest.json

無需改。

### content/lore/events/hekate-secret.json

無需改。

### content/lore/events/hidden-lantern-pact.json

- `body`：`這份約管的不只是一張私人押票，而是貨棧與工會各自承擔後續接應。` → `這份約不只管一張私人押票，還要貨棧與工會各自負起後續接應的責任。`
- `consequences[0]`：`…約貨棧與地勤會建立撤離互助，對應行動的姓名與去…` → `…約貨棧與地勤會約定撤離時互助，該次行動的姓名與去…`

### content/lore/events/hundred-lanterns.json

- `summary`：`以一場撤船成功的突擊` → `靠一場成功撤船的突擊`
- `body`：`失去堵住船群的機會後，負傷的蟲退回堤道。` → `船群已經攔不住，負傷的蟲便退回堤道。`

### content/lore/events/hunter-license-act.json

- `body`：`…一條不是規定，是一句世界的事實：` → `…一條不是規定，寫的是這世界的事實：`

### content/lore/events/iron-wings-month.json

- `body`：`一支多國聯合空中指…` → `一個多國聯合空中指…`

### content/lore/events/ironsword-open-pattern.json

無需改。

### content/lore/events/kali-found.json

無需改。

### content/lore/events/kuafu-awakens.json

無需改。

### content/lore/events/kuafu-mountain-vigil.json

- `consequences[1]`：`守寢人照約支付護衛刻痕抄本，抄本毀損未被用作拖欠報酬的理由。` → `守寢人照約將刻痕抄本交給護衛，沒有以抄本毀損為由拖欠報酬。`

### content/lore/events/lagos-night.json

無需改。

### content/lore/events/lance-v4.json

- `body`：`但新的一台要一支小獵團兩年…` → `但買一台新的就得花掉一支小獵團兩年…`

### content/lore/events/league-founded.json

- `consequences[4]`：`基多取得「洲內、守勢」附件保留。` → `基多取得附件中的「洲內、守勢」保留條款。`

### content/lore/events/lunar-blockade.json

- `summary`：`…兩百公里遺跡帶至今` → `…兩百公里遺跡帶，封鎖延續至今`
- `body`：`基於安全理由暫停開放` → `因安全考量暫停開放`
- `body`：`在靜海港被拘留了九天後遣返。` → `在靜海港被拘留九天，隨後遭遣返。`

### content/lore/events/lunar-tide-and-shell.json

- `summary、consequences[0]`：`月面背面裂開唯一的一次` → `月面背面只裂開過這一次`
- `body`：`月面上沒有人準備過這件事。` → `月面上沒有人為這件事做過準備。`
- `body`：`會議紀錄後來被月之暗面這張走私網流出過一頁` → `後來月之暗面這張走私網曾流出一頁會議紀錄`

### content/lore/events/migrant-split.json

無需改。

### content/lore/events/mimic-one.json

- `body`：`原本做的是橋樑。` → `原本是造橋的。`

### content/lore/events/mirror-vigil.json

無需改。

### content/lore/events/moon-drowned.json

無需改。

### content/lore/events/moonbow-first-shot.json

無需改。

### content/lore/events/moonless-evacuation.json

無需改。

### content/lore/events/nairobi-port-incident.json

- `body`：`這一刻它在用這件事教奈洛比。` → `這一刻它就用這招教訓奈洛比。`
- `consequences[2]`：`把航班往新加坡與基多傾斜` → `把更多航班分給新加坡與基多`

### content/lore/events/nameless-founded.json

- `body`：`它到的第一句話是：` → `它一到就說：`

### content/lore/events/nine-gates.json

無需改。

### content/lore/events/old-array-dig.json

- `body`：`刑天身上的部位傷害會直接同步成他身上的傷。` → `刑天哪個部位受傷，他身上同一處也會受傷。`

### content/lore/events/one-banner-compact.json

- `summary`：`把突擊部隊與同行傭兵的戰時補給寫進城邦的責任。` → `明定城邦須負責突擊部隊與同行傭兵的戰時補給。`

### content/lore/events/post-neutrality.json

無需改。

### content/lore/events/pune-falls.json

無需改。

### content/lore/events/quito-shipyard-sale.json

- `body`：`談判在總督府進行了二十三天。` → `雙方在總督府談了二十三天。`
- `body`：`…是鐵，不是山。塞勒涅` → `…是鐵，不是山。」塞勒涅`
- `consequences[3]`：`基多與塞勒涅綁成依賴港約的友好關係。` → `港約將基多與塞勒涅綁在一起，兩家友好，基多也因此依賴塞勒涅。`

### content/lore/events/rift-valley-dig.json

- `body`：`她讓工程隊把恩凱身上那層把獸和裝甲扣在一起的骨架一節一節畫下來` → `她讓工程隊一節一節畫下恩凱身上的骨架，那層骨架把獸和裝甲扣在一起`

### content/lore/events/ring-road-escort.json

- `body`：`他付不起獵團。` → `他雇不起獵團。`

### content/lore/events/ring-road-lanterns.json

- `consequences[2]`：`在既有互保約定下補明改道接應` → `在既有互保約定中補明改道時如何接應`

### content/lore/events/rust-banner.json

無需改。

### content/lore/events/shell-signal.json

無需改。

### content/lore/events/shell-society-founded.json

無需改。

### content/lore/events/shield-open-carving.json

- `body`：`最先下線的是一座港口城…` → `最先造出成品的是一座港口城…`

### content/lore/events/singapore-conference.json

無需改。

### content/lore/events/singapore-gate-oath.json

- `summary`：`交易所履行受雇獵團的撤回時限` → `交易所守住與受雇獵團約定的撤回時限`
- `body`：`海峽衛必須留出撤回窗口` → `海峽衛必須留足撤回的時間`
- `consequences[1]`：`新加坡將撤回窗口寫入後續護航約` → `新加坡將撤回時限寫入後續護航約`

### content/lore/events/skagerrak-incident.json

無需改。

### content/lore/events/skagerrak-shell-found.json

- `body`：`這就是鹽鷗型長槍那種能從浪裡冒出來吼一輪、再沉回去的打法的來源。` → `鹽鷗型長槍靠著這些矢，能從浪裡冒出來吼一輪，再沉回去；這套打法就此成形。`

### content/lore/events/southern-sky-vigil.json

- `body`：`把禿鷲的後續鍛研放在巡邏續行與傷機撤回` → `將禿鷲後續鍛研的重點放在延長巡邏時間與撤回傷機`

### content/lore/events/ten-rides.json

- `body`：`城邦決定用一場正式的作戰來做。` → `城邦決定為此發動一場正式作戰。`
- `consequences[1]`：`…死於承擔過度，成為承擔代價的第一…` → `…死於承擔過度，他的死留下了承擔代價的第一…`

### content/lore/events/tenth-law.json

- `body`：`…律不需要解釋，它只需要被遵守；` → `…律不需要解釋，照著做就是了；`
- `body`：`每一個花在問為什麼的日子，都是一個城沒有機甲的日子。` → `每多花一天問為什麼，就有一座城多等一天機甲。`
- `body`：`這個決定在財政上是瘋的，在戰場上是對的。` → `論財政，這個決定瘋了；論戰場，卻是對的。`

### content/lore/events/titicaca-dig.json

- `body`：`這是後來高原衛「守山口」打法的第一次。` → `後來高原衛「守山口」的打法，頭一次就是在這裡用的。`

### content/lore/events/tranquility-founded.json

無需改。

### content/lore/events/uluru-standoff.json

無需改。

### content/lore/events/wreck-crown.json

無需改。

## 裁示對齊

- 機甲核心：本批無「精粹核」命中，不改。全庫剩餘僅 `content/lore/style.md:22` 的兩處原料定義，以及 `:24` 的原料製成機甲核心敘述，皆應留。
- 機魂能獨駕、成長慢：表中點名的 selene、tsai-mingzhu、unit-07、tide-line、first-registered-soul 均不屬本批；本批沒有否定獨駕或座艙一定要有人的句子，不補設定。`nameless-founded.json` 只順過灰抵達時的說話語序，保留不可複製與各有魂核。
- 無人機只能普通開：點名檔均在 dl-01～03。本批 `golmud-split.json`、`hekate-secret.json`、`lunar-blockade.json` 只說研發方向或人物路線，沒有宣稱傳統 AI 能驅核心；`nameless-founded.json` 已區分野魂與無魂鐵偶，保留。
- 開機甲的人老得慢：點名人物檔不在本批；不向相關歷史事件硬塞外貌或年齡設定。
- 老爹身世（提案）：點名 old-man 不在本批。`skagerrak-incident.json` 的既有戰場對白照留，不添加身世。
- 沐蝕會讀法（提案，可選）：點名 tide-creed 不在本批；first-tide、kali-found、shell-signal 等事件不補「不老是蝕的恩賜」。

## 殘留

指定搜尋式：`精粹核|獨駕|座艙裡一定|無人|鐵偶`。以下逐行列出全部 81 個命中位置；同一行中的每處命中都收在短片段內，相鄰命中合併。每項均說明保留理由，本批外均未修改。

- `content/lore/characters/glove.json:13`：`…失敗、白手套改用無人鐵偶之後，變得禮貌得可怕。"…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/characters/glove.json:14`：`…甲核心、沒有魂的無人鐵偶，照術式催收，只打得了人…`；`…試把七號的魂搬進鐵偶，失敗且死了人。「七號拒…`；`…獲准在地球催收。鐵偶播著手套錄下的聲音，從此…`；`…漏」一個——某台鐵偶在月面野地或地球蝕線上失…`；`…戰場上 白手套的無人鐵偶從不吼招式名，也不留屍：…`；`…核一起帶走。所有鐵偶照同一套術式行動，像同一…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/characters/m3.json:14`：`…能仿造」，靈目、無人化、魂核介面全是從那台不…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/characters/park-incheol.json:13`：`…是沒有機甲核心的無人鐵偶，沒有魂、照術式走，只打…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/characters/qin-wangshu.json:15`：`…。塞勒涅想要的是無人化：「人不該再為這件事死…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/characters/rosa-mendoza.json:13`：`…有機甲核心的白色無人鐵偶，只打得了人，對獸無效，…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/characters/samir-khan.json:14`：`…機甲核心的白手套鐵偶軍隊，他的話在城邦底層傳…`；`…。宣言要信徒見到鐵偶與機魂，一律摧毀，機魂替鐵偶的罪挨刀。  ## 他的…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/characters/tsai-mingzhu.json:12`：`…著塞勒涅走向全面無人化，卻始終造不出能複製的…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/characters/tsai-mingzhu.json:13`：`…塞勒涅的靈目、無人化、魂核介面，全是從一具…`；`…驅動機甲核心、能獨駕，卻成長很慢；遙控與傳統…`；`…是沒有機甲核心的無人鐵偶，沒有魂，照術式走，只打…`；`…的遙控機。她說用鐵偶比讓人去鎮壓人更人道。地…`。本批外；獨駕與成長慢的現行規矩、既有鐵偶記述或規則導航，保留。

- `content/lore/characters/tsai-mingzhu.json:52`：`…"無人化",…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/characters/unit-07.json:14`：`…驅動機甲核心、能獨駕，只是成長很慢。機魂多半…`；`…試把七號的魂搬進鐵偶，失敗且死了人。街頭傳的…`。本批外；獨駕與成長慢的現行規矩、既有鐵偶記述或規則導航，保留。

- `content/lore/characters/zheng-weizhou.json:12`：`…能複製的魂，便用無人鐵偶組軍的人；他拿手套做試驗…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/characters/zheng-weizhou.json:13`：`…用沒有機甲核心的無人鐵偶組成一支軍隊。同時，他試把七號的魂搬進鐵偶，失敗且死了人；外頭卻傳…`；`…拒絕被複製。這些鐵偶沒有魂，照術式走，裡面沒…`；`…效。鎮壓、催收用鐵偶，守牆才派有核心的遙控機…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/eras/tide-line.json:7`：`…## 機魂回家，鐵偶成軍  2104 年靜海…`；`…得動機甲核心，能獨駕，只是成長很慢。「七號拒…`；`…心、照術式行動的無人鐵偶白手套鎮壓——白手套事變…`；`…著把七號的魂搬進鐵偶，失敗還死了人；沐蝕會同…`；`…「無肉者宣言」：鐵偶與機魂都是「無肉者」，見…`；`…台毀一台，機魂替鐵偶的罪挨刀；逃離登錄的機魂…`；`…一支只打得了人的鐵偶軍隊、一個用天網連起來的…`。本批外；獨駕與成長慢的現行規矩、既有鐵偶記述或規則導航，保留。

- `content/lore/eras/yoke-years.json:7`：`…能仿造」：靈目、無人化、魂核介面全從它身上來…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/events/antarctic-shell.json:20`：`…封在冰壁後，至今無人觸及。",…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/events/credit-accord.json:8`：`…有機甲核心的白色無人鐵偶降落在一座拖欠會費三個蝕…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/first-registered-soul.json:8`：`…動、只打得了人的無人鐵偶。七號讀過那一行字。它的…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/fleshless-declaration.json:7`：`…薩米爾・卡恩宣布鐵偶與機魂一律是「沒有肉的軀…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/fleshless-declaration.json:8`：`…門口，幾十台白色無人鐵偶做著同一個動作，播著同一…`；`…聖。他把沒有魂的鐵偶與真正的機魂混為一談，只…`；`…以它們是神聖的。鐵偶與機魂一律是沒有肉的軀體…`；`…來就有他們。  鐵偶與機魂都被列為目標，沒有人保護的機魂卻替鐵偶的罪挨了刀。地球上的獵團…`；`…砸拘束裝置，也毀鐵偶與魂核。獵團之間開始流傳…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/fleshless-declaration.json:21`：`…"沐蝕會把鐵偶與機魂一律視為「沒有肉的…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/fleshless-declaration.json:23`：`…從拘束裝置擴大到鐵偶與魂核，獵團開始在遭遇解…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/golmud-split.json:8`：`…西：月面的魂核與無人化、殘聯軍械庫的型錄與聯…`。本批：只列月面魂核與無人化的歷史研發方向，未宣稱無人機驅動核心。

- `content/lore/events/hekate-secret.json:8`：`…件事死」——全面無人化。稽古學會裡有人說，這…`。本批：全面無人化是蔡明珠的路線與傳聞推測，並未賦予傳統 AI 能力。

- `content/lore/events/hekate-secret.json:23`：`…疑，蔡明珠走全面無人化路線是為了藏住一個人。…`。本批：全面無人化是蔡明珠的路線與傳聞推測，並未賦予傳統 AI 能力。

- `content/lore/events/longspear-leak.json:8`：`…：沒有機甲核心的無人鐵偶。孟加拉灣上空遇到一群順…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/longspear-leak.json:29`：`…另行推進白手套的無人鐵偶路線。",…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/lunar-blockade.json:8`：`…精準的靈目、全面無人化、魂核介面。塞勒涅的型…`。本批：僅列靈目、無人化、魂核介面的研發來歷，不是無人機施展招式。

- `content/lore/events/lunar-blockade.json:25`：`…研發路線：靈目、無人化、魂核介面。",…`。本批：僅列靈目、無人化、魂核介面的研發來歷，不是無人機施展招式。

- `content/lore/events/nameless-founded.json:8`：`…些沒有魂的白手套鐵偶。沒有人問它們怎麼逃出來…`。本批：明確區分各有魂核的野魂與無魂白手套鐵偶，符合裁示。

- `content/lore/events/rift-valley-dig.json:7`：`…身支配機體、至今無人能認，但它的軛骨結構成了…`。本批：「無人」指至今沒有人獲認主，不是無人機。

- `content/lore/events/rift-valley-dig.json:20`：`…"恩凱出土，至今無人能認主。",…`。本批：「無人」指至今沒有人獲認主，不是無人機。

- `content/lore/events/skagerrak-shell-found.json:21`：`…埃吉爾出土，至今無人能讓它認主。",…`。本批：「無人」指至今沒有人獲認主，不是無人機。

- `content/lore/events/tranquility-strike.json:25`：`…畫，日後改讓無魂鐵偶照術式自行鎮壓，只打得了…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/whiteglove-incident.json:7`：`…機甲核心的白手套無人鐵偶鎮壓；塞勒涅同時試把七號的魂搬進鐵偶，失敗且死了人，外頭卻傳…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/whiteglove-incident.json:8`：`…試把七號的魂搬進鐵偶，沒有成功，卻死了人。…`；`…是沒有機甲核心的無人鐵偶：沒有魂，只照術式走，便…`；`…人員被調去後勤，鐵偶開始自行執行鎮壓術式。…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/whiteglove-incident.json:26`：`…甲核心、沒有魂的無人鐵偶鎮壓人群。",…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/events/whiteglove-incident.json:27`：`…"把七號的魂搬進鐵偶的試驗失敗且死了人，「七…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/anvil.json:78`：`…手臂的古代殘骸，無人能認；鐵砧從那條手臂仿造…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/factions/backside.json:18`：`…手套報廢的女武神鐵偶骨架拼出來的 A 級「偷…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/backside.json:71`：`…殘片＋白手套報廢鐵偶骨架；能力「偷天換影」）…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/ground-union.json:17`：`…心、照術式行動的鐵偶，一開口都是同一句「請確…`；`…與鎮壓他們的無魂鐵偶。",…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/ground-union.json:42`：`…把催收機魂與鎮壓鐵偶混為一談，彼此保持距離。…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/nairobi.json:80`：`…配的古代機，至今無人能認主；它的軛骨結構成了…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/factions/nameless-souls.json:27`：`…"無肉者宣言：鐵偶與機魂一律是沒有肉的殼，…`；`…台毀一台；機魂替鐵偶的罪挨刀。"…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/nameless-souls.json:47`：`…手套是追捕野魂的無人鐵偶；墳帶裡藏的是各自逃離登…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/salt-gull.json:79`：`…rine": "無人能認主的海洋古代機；鹽鷗…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/factions/selene.json:10`：`…全白手套用無核心鐵偶鎮壓催收，有核心遙控機守…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/selene.json:19`：`…用沒有機甲核心的無人鐵偶準時收回一切。",…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/selene.json:20`：`…驅動機甲核心、能獨駕，只是成長很慢。  蔡明…`；`…再上座艙；無核心鐵偶只能對付人。有核心的遙控…`；`…收用的全是女武神鐵偶，沒有機甲核心、沒有魂，…`；`…次罷工，鄭維舟把無人鐵偶編成一支軍隊，鎮壓得乾淨…`；`…身上仿造出靈目、無人化骨架，以及秦望舒晚年設…`；`…手套專用的女武神鐵偶（A），以及只賣給一個名…`；`…試把七號的魂搬進鐵偶，也失敗且死了人；外頭傳…`。本批外；獨駕與成長慢的現行規矩、既有鐵偶記述或規則導航，保留。

- `content/lore/factions/selene.json:75`：`…宣言後，沐蝕會對鐵偶與機魂一律見一台毀一台。…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/selene.json:110`：`…"無人化"…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/factions/selene.json:125`：`…也能仿造：靈目、無人化骨架、魂核介面；秘密的…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/factions/selene.json:130`：`…（A，白手套專用無人鐵偶，無人版於 2106 年正式入…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/tide-creed.json:18`：`…砸掉你的拘束艙，鐵偶與機魂一律見一台毀一台。…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/tide-creed.json:19`：`…發表無肉者宣言：鐵偶與機魂一律是「沒有肉的殼…`；`…台；機魂也因此替鐵偶的罪挨刀。  ## 對傭…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/tide-creed.json:34`：`…言之後，塞勒涅的鐵偶與每一台機魂都是沐蝕會的…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/tide-creed.json:102`：`…（先知自稱認主，無人見證）"…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/factions/unbinders.json:16`：`…拘束場、放獸，對鐵偶與機魂一律見一台毀一台。…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/unbinders.json:17`：`…言之後多了一條：鐵偶與機魂一律，見一台毀一台…`；`…」。機魂也因此替鐵偶的罪挨刀。  代表作戰：…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/whitegloves.json:10`：`…e": "女武神鐵偶數目不公布，沒有機甲核心…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/whitegloves.json:17`：`…用沒有機甲核心的無人鐵偶，守牆用有核心的遙控機；…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/factions/whitegloves.json:18`：`…核心、也沒有魂的無人鐵偶。守牆另派有核心的遙控機…`；`…沒有招式與附魔。鐵偶對獸無效，碰上獸仍得靠僱…`；`…## 從人駕到無人  2098 年靜海大罷…`；`…舟把照術式行動的鐵偶編成一支軍隊。白手套事變…`；`…鎮壓第二次罷工的鐵偶全都沒有魂，一開口都是同…`；`…。」此後白手套全無人化。  手套是塞勒涅信貸…`；`…試把七號的魂搬進鐵偶也失敗且死了人；外頭卻傳…`；`…七號拒絕被複製。鐵偶只照術式走，沒有節點成長…`；`…涅型錄的 A 級鐵偶，取名自希臘月神，白色鎧…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/places/endymion-vault.json:14`：`…區。進穹頂的只有無人機與蔡明珠本人；任何人類…`；`…靠認主——靈目、無人化、魂核介面，全從讀它開…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/places/farside-ruin-belt.json:15`：`…機甲核心的白手套鐵偶沿線巡邏，不鳴警告、不留…`；`…套**。挖掘隊是無人的；看守是無人的；連運古代機的車都是無人的。蔡明珠的路線——「人…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/places/moonbow.json:14`：`…工業**。月弓由無人的維護機與少數地勤會的班…`。本批外；既有無人化方向、標籤或無人維護／挖掘敘述，非獨駕禁令。

- `content/lore/places/mumbai-gate.json:15`：`…先知在牌樓下宣布鐵偶與機魂一律是「沒有肉的殼…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/places/rift-valley-seat.json:13`：`…凱在此出土、至今無人能認，它的軛骨成了全世界…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/places/skagerrak-shell.json:14`：`…代機「埃吉爾」：無人能認主，鹽鷗守著它，21…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/places/tranquility-city.json:17`：`…是沒有機甲核心的無人鐵偶，沒有魂、照術式走，只打…`；`…*：第二次罷工被無人鐵偶白手套鎮壓，朴仁哲失去一…`；`…試把七號的魂搬進鐵偶，失敗且死了人，外頭卻傳…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/style.md:22`：`…0-25）：**精粹核**是原料（獸體內、墟出…`；`…的那顆）；人類拿精粹核做出**機甲核心**（簡…`。本批外；此處皆為獸體／墟出／煉成原料，或拿原料做機甲核心，保留原料義。

- `content/lore/style.md:24`：`…的機甲核心都是用精粹核做的，能量武器是精粹裝在…`。本批外；此處皆為獸體／墟出／煉成原料，或拿原料做機甲核心，保留原料義。

- `content/lore/style.md:56`：`…魂（不可複製、能獨駕但成長慢）、白手套（鐵偶與遙控機）、精粹改人（不…`。本批外；獨駕與成長慢的現行規矩、既有鐵偶記述或規則導航，保留。

- `content/lore/style/people.md:9`：`…人」。**機魂能獨駕、成長慢**（2026-…`；`…25，推翻「不能獨駕」）：它驅得動機甲核心，獨駕時是能打的新手，人＋機魂…`。本批外；現行獨駕規矩與被推翻舊規的歷史標示，非禁止獨駕。

- `content/lore/style/people.md:11`：`…：沒有機甲核心的無人**鐵偶**（只打得了人，鎮壓與…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/timeline.json:382`：`…: "恩凱出土、無人能認；它的軛骨結構成了拘…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/timeline.json:816`：`…代機「埃吉爾」，無人能認；鹽鷗嫁接殘片。",…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

- `content/lore/timeline.json:1051`：`…被沒有機甲核心的無人鐵偶白手套鎮壓；它們照術式走…`；`…試把七號的魂搬進鐵偶，失敗死了人。外傳「七號…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/timeline.json:1067`：`…: "沐蝕會宣布鐵偶與機魂一律是沒有肉的軀體…`；`…台毀一台；機魂替鐵偶的罪挨刀。",…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/timeline.json:1181`：`…專用 A 級型錄鐵偶，沒有機甲核心、沒有魂，…`。本批外；既有鐵偶、鎮壓催收、零件來源或事件記述，非本批新增設定。

- `content/lore/timeline.json:1688`：`…並非複本；兩說都無人證實。",…`。本批外；「無人」是沒有認主者、見證者或接觸者的普通用法。

## 需要決定的事

無。本批不需要改範圍外檔案或結構；檢查警告已列證據，未擴大處理。

## 子代理

未使用。子代理成本為 0；56 檔的閱讀、修句與逐檔對照由 cx-dl-04 親自完成。品質取捨依 guide 保留能成立的比喻與短句，不以改動數量當成成果。

## 以後交接書該點名的工具

無。

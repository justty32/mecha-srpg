## 已讀清單

- `AGENTS.md`（親自讀取主 repo：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/dispatch/handoffs/lead-settle/guide.md`

另已讀：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/inbox/PROTOCOL.md`；world-pillars 的 world、mechs 導航及 tone-and-rules、bonds、mechanical 子檔。

## 做了什麼

cx-st-01 在指定隔離 worktree 修正 11 個檔案、14 處短句，只改 body、text、mechSeries、ancientMech.doctrine、consequences、scale 文字。日期欄、數值欄、id、引用、鍵與陣列長度未動；未 commit。單檔 UTF-8 位元組增幅最高為 titicaca-dig.json 的 3.88%，未觸發 10% 容量 gate。

固定五條驗收結果：

1. 最終 git status --short 僅列交接書允許的 11 個修改檔，以及開工時就存在的未追蹤 node_modules。
2. npm run check 結束碼 0，末行 `OK 0 errors, 8 warnings`（前段載入檢查為 0 errors、12 warnings）；node content/lore/check.ts 結束碼 0，`errors=0 warnings=2`。另依必用工具要求執行 node src/ops/content/check.ts content/base，結束碼 0，`OK 0 errors, 8 warnings`。
3. 表列 11 檔口徑已落地，殘留逐處理由見下；沒有無需改的檔案。
4. 下節逐檔列出全部舊→新片段。
5. 第一段已讀清單逐行列齊先讀指定的 10 個路徑。

警告涉及未修改檔：8 個怪獸的 capture layer HP differs；另有 mx-faded 閃避上限、tidewolf 池上限區間、kx-tide-crush 傷害上限、infantry 缺預設攻擊；lore 的 busan-returned-seal 與 dark-quay-surety 未列入 timeline。未另跑基線來判斷警告歷史，也未擴大修改。按交接書未跑 npm test、MCP 或其他加碼驗收。此次檢查原始輸出在 `/tmp/cx-st-01/check.log`、`/tmp/cx-st-01/lore-check.log`、`/tmp/cx-st-01/ops-check.log`。

## 逐檔對照

### `content/lore/characters/jonas-halvorsen.json`

「再二十六年背面裂開」 → 「再八年背面裂開」。

### `content/base/world/events/port-farside-sealed-crate.json`

「他說某獵團的魂曾替駕整場，連逃跑都不肯」 → 「他說某獵團的駕駛員昏在座艙裡，魂替他撐完整場，連逃跑都不肯」。

### `content/lore/events/whiteglove-incident.json`

「2098 年白手套的鐵偶原型還要人員監看、下令」 → 「2098 年白手套用的還是人駕的女武神保全機原型，沒有精粹核，只打得了人」。

手套坐在人駕女武神副座的句子照舊，沒有更動。

### `content/lore/characters/zheng-weizhou.json`

「一隊由人駕駛的白色衍型機」 → 「一隊由人駕駛的白色女武神保全機原型」。

### `content/lore/factions/selene.json`

「女武神（A，白手套專用無人鐵偶，2106）」 → 「女武神（A，白手套專用無人鐵偶，無人版於 2106 年正式入型錄）」。

body 的 2098 人駕原型、2105 無人鐵偶敘述已符合白手套口徑，無需改。另見下方範圍外年份衝突。

### `content/lore/factions/whitegloves.json`

「白手套還是原型：人駕的保全機」 → 「白手套用的還是人駕的女武神保全機原型」。

### `content/lore/factions/quito.json`

「一台以盾為身的防禦衍型機，堅盾系列的祖先」 → 「基多以維拉科查為藍本造的第一台重裝衍型機，以盾為身，是高原衛重裝與光幕一路的源頭」。

「安地斯壁是堅盾系列之祖。」 → 「安地斯壁是高原衛重裝與光幕一路的源頭；堅盾則源自 2092 年的衍二・堅盾，2093 年由秦望舒公刻。」。

正文與 doctrine 同時去除安地斯壁作為堅盾祖先的說法；「堅盾牆」是打法，照舊保留。

### `content/lore/events/titicaca-dig.json`

「兩年後的「安地斯壁」就是照它仿造的，後來長成了全世界的堅盾」 → 「兩年後的「安地斯壁」就是照它仿造的，是基多第一台重裝衍型機，也是高原衛重裝與光幕一路的源頭」。

「兩年後的安地斯壁以維拉科查為藍本，成為堅盾系列之祖。」 → 「兩年後的安地斯壁以維拉科查為藍本，是基多第一台重裝衍型機，成為高原衛重裝與光幕一路的源頭。」。

### `content/lore/events/rift-valley-dig.json`

「大裂谷底那處遺跡」 → 「大裂谷谷西崖壁上那處遺跡」。

「恩凱至今坐在大裂谷底」 → 「恩凱至今坐在大裂谷谷西崖壁上那間風蝕成王座形的凹室裡」。

### `content/lore/characters/samir-khan.json`

「三個月後他從孟買門出來」 → 「十九天後他從孟買門出來」。

### `content/lore/factions/league.json`

「牆內住著地球三分之一的人」 → 「轄下約十億人，多半住在野地」。

## 殘留

已按交接書同一條 git grep 指令改前、改後各執行一次。改後 42 行、54 處匹配；下列只摘短片段，非整份 grep 輸出。除特別指出的 tranquility-strike 外，其餘均非本批待修矛盾。

`content/lore/characters/a-xiu.json`：第 13 行：「…檢，無異常。」第三個月，它開始記時間，精確…」。理由：第三個月是阿鏽記錄陪伴時間的進程，與本批矛盾無關。

`content/lore/characters/chen-xiaohai.json`：第 12 行：「… 解拘之夜後第三個月，老桂在達卡的難民棚…」。理由：第三個月指解拘之夜後被老桂帶上船，與本批矛盾無關。

`content/lore/characters/mara-okoye.json`：第 13 行：「…來，在難民營排了三個月的隊，然後去殘翼當地…」。理由：三個月指難民營排隊時間，保留。

`content/lore/characters/markus-njoroge.json`：第 14 行：「…捉裂獸的人；活了三個月——不是被獸殺的，是…」；第 15 行：「…字。  此後三個月，他每天都上鞍。他越…」。理由：兩處均指馬庫斯初騎拾號後存活三個月，保留。

`content/lore/characters/okamoto-mayu.json`：第 12 行：「…會為了這句話開了三個月的會——兩樣東西是什…」。理由：三個月是學會開會時間，保留。

`content/lore/characters/samir-khan.json`：第 13 行：「…: 第一次蝕潮三個月後，一個人從蝕域裡走…」；第 14 行：「…y: ## 三個月  2089-0…」、「…者之一。  三個月後，蝕域東緣那道口子…」、「…n沒有人能解釋那三個月。他自己的版本每年都…」、「…片沒有水的海走了三個月，有時說他什麼都不記…」。理由：summary 一處與 body 四處（小標、走出時間、無法解釋的時長、本人沿海行走說法）均指 2089 首次蝕潮；交接書明定不動。2096 已另改十九天。

`content/lore/characters/tsai-mingzhu.json`：第 13 行：「…小時內下令封鎖，三個月後封鎖成為永久。稽古…」。理由：三個月是月面封鎖時間，保留。

`content/lore/characters/unit-07.json`：第 14 行：「…年在靜海市育成，替駕駛員算燼與流光、校靈…」。理由：「替駕」只是「替駕駛員算燼」的子字串，描述協作，沒有獨駕含義。

`content/lore/characters/wanjiku-kamau.json`：第 13 行：「…n 馬庫斯活了三個月。拾號活了五年。她在…」。理由：三個月指馬庫斯存活時間，保留。

`content/lore/eras/first-tide.json`：第 7 行：「…城裡，第一次蝕潮三個月後一個人走出來，說他…」。理由：三個月指 2089 薩米爾首次走出蝕域，保留。

`content/lore/eras/yoke-years.json`：第 7 行：「…上了戰場。他活了三個月——不是被獸殺的，是…」、「…里的墟帶。塞勒涅三個月內封鎖至今；他們挖到…」。理由：第一處指馬庫斯存活，第二處指月面封鎖，均非 2096 薩米爾停留時間。

`content/lore/events/antarctic-shell.json`：第 8 行：「…，回到蒙特婁翻了三個月。刻痕畫的是一層裝甲…」。理由：三個月指翻譯刻痕所需時間，保留。

`content/lore/events/first-tide.json`：第 8 行：「…死了。第一次蝕潮三個月後，他一個人從蝕域的…」；第 28 行：「…卡恩在第一次蝕潮三個月後從孟買走出，日後成…」。理由：body 與 consequences 均指 2089 首次走出蝕域，保留。

`content/lore/events/lunar-blockade.json`：第 7 行：「…7 年，塞勒涅在三個月內封鎖背面兩百公里遺…」；第 8 行：「…y: ## 三個月  「全部圍起來…」、「…四個字，塞勒涅用三個月做到了。  - …」、「…。 - **第三個月**：墟帶核心劃為禁…」、「…進得去。  三個月後，蔡明珠在天網上發…」。理由：summary 一處與 body 四處（小標、完成時長、第三個月進程、公告時間）均指 2097 月面封鎖，保留。

`content/lore/events/rift-valley-dig.json`：第 8 行：「…，像牛軛。她看了三個月，然後說：「先民不是…」。理由：三個月是萬吉庫觀察軛骨的時長，與恩凱位置無關，保留。

`content/lore/events/rust-banner.json`：第 8 行：「…木匣，退到硬地才替駕駛艙排燼。霧裡的舊甲…」。理由：「替駕」命中「替駕駛艙排燼」，是排燼動作而非機魂獨駕，保留。

`content/lore/events/shell-signal.json`：第 8 行：「…這些夢的人。他花三個月整理了十幾萬份夢的紀…」。理由：三個月指整理夢紀錄的時間，保留。

`content/lore/events/ten-rides.json`：第 7 行：「…號」；駕駛員活了三個月，牠活了五年。,…」；第 8 行：「…。  ## 三個月  馬庫斯活了三…」、「…n 馬庫斯活了三個月。他不是被獸殺的——…」、「…拾號才打得贏。第三個月的一個早上，他從鞍上…」；第 23 行：「…馬庫斯・恩喬羅格三個月後死於承擔過度，成為…」。理由：summary 一處、body 三處（小標、存活時長、第三個月早上）及 consequences 一處都指馬庫斯存活／死亡時間，保留。

`content/lore/events/titicaca-dig.json`：第 8 行：「…潮之夜  第三個月的大潮之夜，坑底最深…」。理由：第三個月指挖掘進程中的認主之夜，與堅盾血統無關，保留。

`content/lore/events/tranquility-founded.json`：第 8 行：「…靜海市是唯一能在三個月內把整片遺跡帶圍起來…」。理由：三個月是 2097 封鎖墟帶的時長，保留。

`content/lore/events/tranquility-strike.json`：第 8 行：「…班十二小時、一輪三個月。第一年，背面的工安…」、「…當時還要由後方的人員監看、下令。罷工第六天，…」、「…拿到了背面輪班從三個月降到兩個月，代價是九…」。理由：兩處三個月是地勤輪班制度，保留；人員監看、下令一處確實與人駕女武神原型衝突，但檔案不在可寫清單，保留並列入需要決定。

`content/lore/events/whiteglove-incident.json`：第 8 行：「…女武神的副座上，替駕駛員算距離、算債、算…」。理由：「替駕」命中「替駕駛員算距離」，手套在人駕女武神副座協作，交接書明定照舊。

`content/lore/factions/backside.json`：第 18 行：「…帶露出來，塞勒涅三個月內把它封死。封鎖線拉…」。理由：三個月指塞勒涅封鎖墟帶的時長，保留。

`content/lore/factions/nairobi.json`：第 19 行：「…一起的骨架，看了三個月，然後畫出了人類第一…」、「…「拾號」。他活了三個月——不是被獸殺的，是…」。理由：第一處是觀察恩凱骨架，第二處是馬庫斯存活時間，均保留。

`content/lore/factions/selene.json`：第 20 行：「…墟帶露出，塞勒涅三個月內封鎖，至今不公布挖…」。理由：三個月指月面封鎖時長，與女武神入型錄年份無關，保留。

`content/lore/factions/tide-creed.json`：第 19 行：「…爾・卡恩在城裡。三個月後，他一個人從蝕域裡…」。理由：三個月指 2089 薩米爾首次走出蝕域，保留。

`content/lore/places/endymion-vault.json`：第 14 行：「…**：墟帶露出後三個月，塞勒涅在核心挖出恩…」。理由：三個月是墟帶露出至恩底彌翁出土的間隔，保留。

`content/lore/places/farside-ruin-belt.json`：第 14 行：「…裂過一次，塞勒涅三個月內封鎖至今，挖到什麼…」；第 15 行：「… 月面封鎖**：三個月內封死，至今沒解。墟…」。理由：summary 與 body 均指 2097 三個月內封鎖墟帶，保留。

`content/lore/places/mumbai-blight.json`：第 15 行：「…城裡，第一次蝕潮三個月後一個人走出來。 …」。理由：三個月指 2089 薩米爾首次走出蝕域，保留。

`content/lore/places/mumbai-gate.json`：第 15 行：「…**：第一次蝕潮三個月後，薩米爾一個人從這…」。理由：三個月指 2089 薩米爾首次走出蝕域，保留。

`content/lore/places/nairobi.json`：第 16 行：「…活捉的掘犬，活了三個月；拾號活了五年。 …」。理由：三個月指馬庫斯存活時間，保留。

`content/lore/places/rift-valley-seat.json`：第 14 行：「…夜。他騎拾號活了三個月；拾號死後，奈洛比把…」。理由：三個月指馬庫斯騎拾號的存活時間，與恩凱位置無關，保留。

`content/lore/timeline.json`：第 183 行：「…: 第一次蝕潮三個月後，一個人從孟買蝕域…」；第 417 行：「…裝上軛鞍；馬庫斯三個月、拾號五年。,…」；第 526 行：「…y: 塞勒涅三個月內封鎖背面遺跡帶至今…」。理由：183 行是 2089 薩米爾走出蝕域；417 行是馬庫斯存活；526 行是月面封鎖。三處皆保留，年表也明列禁改。

## 沒做到或證據不足的

本批指定修改與檢查均已完成。全庫一致性仍受可寫範圍限制，下列衝突未改；未以通過結構檢查宣稱所有 lore 已無矛盾。未跑領導負責的 npm test，也未帶回主工作樹。

## 需要決定的事

`content/lore/events/tranquility-strike.json:8` 仍寫 2098 白手套「沒有座艙」「人員監看、下令」及「白色的鐵偶」，與交接書人駕女武神原型口徑直接衝突。它不在 11 檔可寫清單；請上線另派範圍落地（相關守則 M4、M11）。

`content/lore/factions/selene.json:20` 仍寫哈爾沃森臨終後「二十年後，月亮背面裂開了」，與其 2071 去世、2097 月背裂開相差二十六年不符。本檔交接限定 mechSeries 女武神條目，body 只在白手套口徑衝突時改；未擅動這句。請上線決定是否另批修正（年表一致性／W3）。

## 子代理

未使用子代理；子代理額外成本為 0。指定規矩與內容由本線親自閱讀、修改；沒有委派品質風險。

## 以後交接書該點名的工具

無。

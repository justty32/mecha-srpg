# cx-world-ev-a：二十個營運事件完成，檢查通過；全目錄狀態驗收受其他線新增檔阻塞

## 做了什麼

親自讀完交接書指定的 AGENTS.md、使用者規矩、engine-rules、風格、營運資料契約、世界觀七檔與兩份 design-notes，以及事件／拘束艙範本；另讀 WORKFLOWS、dispatch、inbox 與 PROTOCOL。依專屬領地限制，沒有修改 SESSION-LOG、ROSTER 等共用文件。

新增恰好 20 個事件 JSON：15 個隨機入口、5 個鏈中後續，包含船上日常、人員衝突、機魂異常、拘束艙與掙脫演習。隨機事件均有 calendar.month >= 1，日子 5／12／19／26 各有 4／4／3／4 個入口。19 檔 where=ship，偷渡孩子入口為 node；鏈中後續 when={}。

三條鏈為偷渡孩子、置物櫃遺信、錯置機魂紀錄。四個一次性入口皆在所有選項設 seen 旗標：ship-stowaway、ship-locker-letter、soul-stray-log、ship-letter-receipt。四個來源事件的旗標被另一隨機事件讀取：ship-stowaway → ship-tide-stew（ship-child-story）；ship-locker-debt → ship-letter-receipt（ship-letter-sent）；soul-stray-log → soul-night-hum（soul-stray-record）；crew-card-quarrel → crew-seat-dispute（crew-card-dispute）。

所有首選項均無 requires、不扣資源；付費或扣廢料的選項均有足額條件及對應 event-檔名 reason。每檔文字與選項長度依交接書限制寫入；單檔最大 1,946 bytes，未觸發容量或件數 gate。拘束警訊不假稱維護已完成；普通機魂的異常保留未證實性，沒有寫成鮮明人格。

只執行固定三條驗收，前兩條依要求每五檔跑一次，四批都成功：

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world/events`：四批末行依序為 `OK 19 files`、`OK 29 files`、`OK 34 files`、`OK 39 files`，exit 0。總數包含既有檔及其他事件線同時新增的檔；腳本實際成功格式是 `OK N files`。
2. `node src/ops/content/check.ts content/base`：四批末行皆為 `OK 0 errors, 0 warnings`，exit 0；沒有其他線錯誤需逐條列舉。
3. `git status --short content/base/world`：本線四種前綴恰好 20 個 `??`，全輸出沒有 ` M`。但同時還有其他線的 52 個 `??`，因此未宣稱達成「整個目錄只多出本線 20 個 ??」的字面條件。詳見第三、四段。

沒有 commit、push、開分支、安裝依賴或執行 npm test；未增加驗收條目。

## 產出

以下每列對應一個新檔；絕對路徑統一為 `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/events/<id 去掉 event/>.json`。隨機入口共通條件為月 >= 1；「未見」指自身 seen 旗標為 0；「鏈」指 when={}、只能由 next 到達。

- event/ship-stowaway｜node｜5｜未見｜自稱壓艙貨的孩子抱著空碗｜→ ship-stowaway-berth／ship-stowaway-shore。
- event/ship-stowaway-berth｜ship｜鏈｜無額外條件｜借個角落不等於答應帶孩子上戰場｜→ ship-stowaway-shore 或結束。
- event/ship-stowaway-shore｜ship｜鏈｜無額外條件｜舷梯邊交還空碗，把孩子交給尋親員｜結束。
- event/ship-locker-letter｜ship｜12｜未見｜前任置物櫃裡藏著沒有署名的信｜→ ship-locker-debt。
- event/ship-locker-debt｜ship｜鏈｜無額外條件｜欠的是遺屬小屋的屋頂，而非酒錢｜結束，設 ship-letter-sent。
- event/soul-stray-log｜ship｜5｜未見｜租賃複本裡出現不屬於它的回航紀錄｜→ soul-log-echo／soul-log-address。
- event/soul-log-echo｜ship｜鏈｜無額外條件｜重讀「門別關」時空椅震動，原因未明｜→ soul-log-address 或結束。
- event/soul-log-address｜ship｜鏈｜無額外條件｜歸途指向蝕域，技師劃掉備註裡的「人」｜結束。
- event/ship-helium-leak｜ship｜5｜無額外條件｜候鳥號漏氣，醫官不推薦全船憋氣｜結束。
- event/soul-night-hum｜ship｜19｜soul-stray-record > 0｜封存紀錄的節奏在值夜時再次低鳴｜結束。
- event/ship-tide-stew｜ship｜12｜ship-child-story > 0｜廚子記得空碗，菜單背面仍是欠條｜結束。
- event/crew-card-quarrel｜ship｜12｜無額外條件｜牌桌翻了，欠薪也被當成賭注｜結束，設 crew-card-dispute。
- event/crew-thin-purse｜ship｜26｜cash <= 600｜船員要知道留在船上的人值多少｜結束。
- event/crew-seat-dispute｜ship｜19｜crew-card-dispute > 0｜牌局舊帳延燒成座艙試坐之爭｜結束。
- event/restraint-night-knocks｜ship｜26｜beastCount > 0 且 beastWear >= 50｜磨白扣環伴著夜裡撞擊，交班提醒維護｜結束。
- event/restraint-broken-chain｜ship｜19｜beastCount > 0｜斷的是外門鏈，「這次」獸仍被主拘束器壓住｜結束。
- event/restraint-unblinking｜ship｜26｜beastCount > 0｜新輪值的人被獸盯到無法入睡｜結束。
- event/restraint-empty-rack｜ship｜5｜beastCount == 0｜空拘束艙有人想掛吊床，技師擦亮斷繫栓｜結束。
- event/restraint-breakout-drill｜ship｜12｜無額外條件｜破布人偶扮掙脫，船員演練封艙｜結束。
- event/ship-letter-receipt｜ship｜26｜ship-letter-sent > 0 且未見｜港口小屋的回信帶回長明燈｜結束。

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-world/cx-world-ev-a/REPORT.md`。生成草稿工具留在授權的 `/tmp/cx-world-ev-a/write_events.py`，不屬遊戲交付檔。

最得意的 3 件：

- 空碗從偷渡鏈走進燉菜事件，廚子記住的是人，不是資源獎勵。
- 機魂紀錄裡的「想回家的人」被劃掉一個字，讓異常留有重量，也守住人格稀有的界線。
- 置物櫃的欠條從冷笑話翻成替遺屬賒屋頂，後來的回信才把長明燈點回船上。

## 沒做到或證據不足的

第三條的全目錄限定未滿足，故終局採 BLOCKED。不是檢查工具失敗，也不是本線事件報錯；共享工作樹正在由其他線寫入，本線不能刪除、提交或搬走它們以製造乾淨狀態。

最後狀態快照共有 72 個 `??`，沒有既有檔修改：本線 20；其他事件前綴 15（merc-* 5、news-* 3、port-* 1、route-* 2、ruin-* 4）；names/ 22；research/ 15。這些額外檔皆不在本線寫入領地。開場讀取時 world 狀態無輸出，隨後並行工作逐步新增。

只按指定 lint／content check 與 git status 提供證據；沒有把靜態閘門與引用檢查說成實際戰役模擬結果。

## 需要決定的事

請領導處理第三條的共享工作樹條件：可在收齊其他線後按本線四種前綴核對 20 個新增檔，或提供只含本線成果的驗收環境。這是解除阻塞條件；本線不擅自改寫驗收定義，也不修改別線成果。

以後交接書該點名的工具：現有 `inbox_mail.sh`、`inbox_poll.sh`、`lint_world.py`、`node src/ops/content/check.ts` 與 `git status --short` 已足夠；共享工作樹的 status 驗收應明寫前綴歸屬。lint 的真實成功末行為 `OK N files`，內容檢查為 `OK 0 errors, 0 warnings`。

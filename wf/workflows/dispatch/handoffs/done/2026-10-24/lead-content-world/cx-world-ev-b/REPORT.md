# cx-world-ev-b：二十個世界營運事件已完成，兩項內容檢查通過

## 做了什麼

僅新增本線前綴的 20 個事件 JSON；未修改既有檔，未 commit。15 個隨機入口、5 個鏈中後續，四條鏈；隨機入口日子 5／12／19／26 分別為 4／3／4／4 個。隨機入口 route 5、node 7、ship 3；包含後續共 route 8、node 9、ship 3。五個一次性入口以 seen- 旗標防重複。

四組跨時間條件：空援帳單的 sided-weavers／sided-seventh-post → news-patron-reversal；買座標的 shell-coordinates → ruin-before-tide-glow；還牌收條的 hunter-badge-returned → merc-salt-gull-salvage；難民回信的 refugee-aid-received → port-raft-lantern。後續鏈的 when 都是空物件，next 都在選項上。

每五檔各跑指定 lint 與 ops check，共四批，全數回傳 0。第四批證據：

1. `python3 wf/workflows/dispatch/handoffs/lead-content-world/lint_world.py content/base/world/events`：末行 `OK 44 files`（工具實際格式）。
2. `node src/ops/content/check.ts content/base`：末行 `OK 0 errors, 0 warnings`（工具實際格式）；沒有別線錯誤。
3. `git status --short content/base/world`：本線正好 20 個 `??`，沒有任何 ` M`；全目錄另有其他線的 `??`，所以「全輸出只含本線二十檔」的字面條件未成立，詳見第三段。

檔案容量 712–2393 bytes，均小於 4 KB；事件文字 40–160 字、選項 4–20 字的限制在寫入時套用。第一選項一律無 requires、僅記旗標；所有扣款／扣廢料選項都有存量門檻。聲望僅作用於塞勒涅白手套。未跑 npm test，也未增加驗收項目。

最得意的 3 件：空援帳單讓同盟、翻臉、重新合作都繞著同一塊茶漬發生。鹽鷗收下亡者獵牌的人情，仍把搶屍生意算成另一筆。難民筏送回布鳥，之後在港口收容所的燈上讓玩家認出它。

## 產出

事件根路徑：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/events/`。下列 id 去掉 `event/` 再加 `.json` 即為檔名；所有隨機入口另含 month >= 1，所有鏈後續 when={}。

- event/news-air-support-bill｜node｜5｜一次性｜公會與哨兵為空援費翻臉，可選邊墊款｜全部選項 → news-air-support-truce。
- event/news-air-support-truce｜node｜鏈中｜空條件｜雙方交換物資暫時停火，信使募晚飯錢｜終點。
- event/ruin-coordinate-sale｜node｜12｜一次性｜殼學會與白手套爭奪座標，可付費買入口｜全部選項 → ruin-empty-shell-rubbing。
- event/ruin-empty-shell-rubbing｜node｜鏈中｜空條件｜拓本上有空座艙，留下謎團與刻紋｜終點。
- event/news-patron-reversal｜ship｜19｜曾支持公會或第七哨｜兩邊重新合兵，先前選邊的獵團又被問忠誠｜終點。
- event/merc-lost-hunter-badge｜route｜19｜一次性｜撿到鹽鷗亡者獵牌，可保留、送還或出售｜送還 → merc-badge-receipt。
- event/merc-badge-receipt｜route｜鏈中｜空條件｜獵牌送到空鋪，收條沒有謝字｜全部選項 → merc-empty-berth-toast。
- event/merc-empty-berth-toast｜route｜鏈中｜空條件｜透過天網向空鋪舉杯，可改趕修理工作｜終點。
- event/merc-salt-gull-salvage｜node｜26｜已送還獵牌並收回收條｜鹽鷗以舊人情兜售搶來的甲片｜終點。
- event/merc-anvil-boast｜node｜5｜無額外條件｜鐵砧在酒館吹噓活捕，可買酒換拘束傷口圖｜終點。
- event/route-refugee-raft｜route｜26｜無額外條件｜難民筏求救，可報位、給錢或給廢料｜兩個援助選項 → route-refugee-guiding-light。
- event/route-refugee-guiding-light｜route｜鏈中｜空條件｜援助換來布鳥回信，可再付引路費｜終點。
- event/port-raft-lantern｜node｜5｜沿海、收到難民援助回信、一次性｜在收容所燈上認出布鳥並收到平安消息｜終點。
- event/ruin-before-tide-glow｜route｜12｜已買殼座標｜大潮前殼發亮，可耗廢料拓下殼紋｜終點。
- event/ruin-shared-dream｜ship｜19｜一次性｜同夜夢見白花機甲，制式報時混入異常低鳴｜終點。
- event/route-winged-maw｜route｜5｜無額外條件｜飛行裂獸追咬候鳥號，可拋廢料轉移其注意並取甲｜終點。
- event/route-tide-storm｜route｜26｜無額外條件｜源潮風暴推船離道又吐回，可耗材收集潮紋｜終點。
- event/news-selene-courtesy｜ship｜12｜無額外條件｜白手套按制式關懷，可付諮詢費或拿催款取樂｜終點。
- event/news-tide-street-sermon｜node｜19｜無額外條件｜解拘者買獸告示與養裂通緝被雨黏在一起｜終點。
- event/port-farside-sealed-crate｜node｜26｜沿海｜背面兜售野魂與密封艙，稀罕替駕傳說被濫作廣告｜終點。

## 沒做到或證據不足的

固定驗收第三條的全目錄字面條件受共享工作樹阻擋：同時有其他線新增 events 的 ship-／crew-／soul-／restraint- 檔，以及 encounters、markets、names、research 下的未追蹤檔。本線最初讀到的 world status 為空；第四批檢查時已有上述並行產出。本線僅二十個指定前綴新檔，沒有改動或移走其他線產出，也沒有修改既有檔。

因此終局用 BLOCKED，如實區分「二十檔工作完成」與「第三條全域狀態尚未符合」。沒有工具或環境執行失敗，沒有內容檢查錯誤。解除條件：領導整合其他線後重跑原第三條，或由上游明確確認第三條按本線前綴核對即可；不需要重寫本線內容。

## 需要決定的事

領導確認共享工作樹下第三條的歸屬判準，或整合其他線產出後驗收。本線無玩法、文案或依賴待決事項。

以後交接書該點名的工具：現有 `inbox_poll.sh`、`inbox_mail.sh`、`lint_world.py`、`node src/ops/content/check.ts` 與 `git status --short content/base/world` 已足夠；第三條宜明寫按本線前綴計數，以免將其他工人的正常並行新增當成阻塞。

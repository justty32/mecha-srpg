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
- `wf/workflows/planning/design-notes/world/scale.md`
- `wf/workflows/dispatch/handoffs/lead-world-land/guide.md`

AGENTS.md 親自讀取的是 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘上述路徑均從本線 worktree 親自讀取。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、world-pillars 的 world／mechs 導航與 tone-and-rules／bonds 子檔，以及 inbox README／PROTOCOL。

## 做了什麼

cx-wl-07 依 guide.md 處理指定 17 檔：15 檔修改、2 檔無需改。只動 summary、body、status2108 文字；保留既有 id、引用、數字欄、日期字樣、鍵與陣列結構。未 commit。改前工作樹只有 node_modules 未追蹤。

改寫凡鐵與抵抗性、野魂、白手套鐵偶、殘翼精粹矢與統一口號、機魂租約，以及例行漲潮。migrant-bird 的例行下次潮夜雖未列 tide 標籤，仍依唯一目標與 guide 的 tide 節一併改詞。改前計算容量，最大單檔增幅為 istanbul.json 的 5.67%，未觸發 30%／17 檔停止門檻。已使用指定 tabledb 查詞、全 content git grep、每步 inbox_poll，並寄出開工 PROGRESS。

固定五條驗收：

1. `git status --short` 僅列允許清單內的 15 個內容檔與 `?? node_modules`；未增加 worktree 其他檔案。
2. 本次實跑 `npm run check`：退出碼 0，末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts`：退出碼 0，末行 `errors=0 warnings=2`。警告來自未修改的怪獸檔 capture layer HP 與兩個事件未出現在 timeline；未擴大範圍修改。
3. 指定 17 檔無「十分律」「十分之一」「十分之一也是火」「複本」「獨駕」或例行「每個大潮」；廣義 grep 的其餘命中逐處列於殘留段。
4. 下段含全部 17 檔的逐檔對照，無需改的兩檔也列理由。
5. 開頭已讀清單列齊交接書點名的全部 11 個路徑。

檢查原始輸出暫存於 `/tmp/cx-wl-07/check.log`、`/tmp/cx-wl-07/lore-check.log`；全 content 殘留 grep 原始輸出在 `/tmp/cx-wl-07/residuals.log`。依交接書不跑 npm test，也未增加其他驗收。

## 逐檔對照

### content/lore/places/accra.json

- `body`：「：一道土堤、兩排十分律砲台、一條永遠在修的」 → 「：一道土堤、兩排凡鐵砲台、一條永遠在修的」

### content/lore/places/auckland.json

無需改：僅說此地沒有白手套催收，未把它寫成機甲、機魂複本或對獸兵器。

### content/lore/places/bay-tide-line.json

- `summary`：「：一百個人、兩座十分律砲台、一群獸緣高得嚇」 → 「：一百個人、兩座凡鐵砲台、一群獸緣高得嚇」
- `body`：「路程是達卡。兩座十分律砲台是舊世界的海防吼」 → 「路程是達卡。兩座凡鐵砲台是舊世界的海防吼」
- `body`：「插在泥裡的紅旗，每個大潮過後要往後挪，或」 → 「插在泥裡的紅旗，每個漲潮過後要往後挪，或」
- `body`：「砲台第一次開火。十分之一的火，落在最需要的那幾格上。」 → 「砲台第一次開火。凡鐵的火打在獸群外甲上，替機甲爭來近身的空隙。」
- `body`：「約多半是「幫我們守到大潮過去」。」 → 「約多半是「幫我們守到漲潮過去」。」

### content/lore/places/busan.json

- `body`：「新漆味混在一起。每逢大潮之夜，城主會在港口的」 → 「新漆味混在一起。每逢漲潮之夜，城主會在港口的」

### content/lore/places/cold-tide-rift.json

- `status2108`：「每大潮開一次自閉」 → 「每漲潮開一次自閉」
- `summary`：「的異形裂縫：每個大潮開一次、自己閉上」 → 「的異形裂縫：每個漲潮開一次、自己閉上」
- `body`：「定的位置——每個大潮，海冰的某處會裂」 → 「定的位置——每個漲潮，海冰的某處會裂」
- `body`：「要蝕錨撐，開一個大潮就自己閉上，沒有」 → 「要蝕錨撐，開一個漲潮就自己閉上，沒有」
- `body`：「：威德爾海，每個大潮，一次。」 → 「：威德爾海，每個漲潮，一次。」
- `body`：「- 每一個大潮它都開，從來沒漏」 → 「- 每一個漲潮它都開，從來沒漏」
- `body`：「每大潮開一次、自閉。南」 → 「每漲潮開一次、自閉。南」

### content/lore/places/dark-quay.json

- `summary`：「背面的窩：骸片、野魂複本、座標都在這裡換」 → 「背面的窩：骸片、野魂、座標都在這裡換」
- `body`：「- **買野魂複本**：從塞勒涅租」 → 「- **買野魂**：從塞勒涅租」

### content/lore/places/delta.json

- `body`：「們不繫、不回巢，大潮時從裂縫直接過來，在三角」 → 「們不繫、不回巢，漲潮時從裂縫直接過來，在三角」

### content/lore/places/endymion-vault.json

- `body`：「醒、不認任何人，大潮之夜站在它面前的人什」 → 「醒、不認任何人，漲潮之夜站在它面前的人什」
- `body`：「名字的編號，每個大潮之夜進去一次——有人」 → 「名字的編號，每個漲潮之夜進去一次——有人」

### content/lore/places/farside-ruin-belt.json

- `body`：「*：墟帶是禁區。白手套的女武神 沿線巡邏，不鳴警告、不留」 → 「*：墟帶是禁區。沒有精粹核的白手套鐵偶沿線巡邏，不鳴警告、不留」

### content/lore/places/ferry-lane.json

- `body`：「路上。他賣骸片、野魂複本、座標；你想找他」 → 「路上。他賣骸片、野魂、座標；你想找他」

### content/lore/places/graveyard-belt.json

無需改：白手套的人清理死星哨，只是點名其行動，未描述機魂獨駕、複本或殺獸。

### content/lore/places/great-lakes-mycelium.json

- `body`：「進去確認過。菌床每個大潮固定往外蝕兩區，」 → 「進去確認過。菌床每個漲潮固定往外蝕兩區，」

### content/lore/places/green-line.json

- `summary`：「蟲族裂縫七年，每大潮賣子體，2107」 → 「蟲族裂縫七年，每漲潮賣子體，2107」
- `body`：「裂縫，讓巢母每個大潮生子體，捕下 D」 → 「裂縫，讓巢母每個漲潮生子體，捕下 D」
- `body`：「已經死光，但每個大潮還會從那道「封了」 → 「已經死光，但每個漲潮還會從那道「封了」

### content/lore/places/ice-shell.json

- `body`：「再派人下去。冰縫每個大潮會再裂開一點。」 → 「再派人下去。冰縫每個漲潮會再裂開一點。」

### content/lore/places/istanbul.json

- `summary`：「把舊機場當總部，賣「十分之一也是火」的空援券。」 → 「把舊機場當總部，賣昂貴的精粹矢空援券：「甲歸我們破，命歸你們收。」」
- `body`：「的傭兵空援公司，賣空援券——十分律之下的生意：「十分之一也是火」。每一張券背面都有」 → 「的傭兵空援公司，賣空援券——一券一發精粹矢的昂貴生意：「甲歸我們破，命歸你們收。」每一張券背面都有」
- `body`：「，裂獸照樣擴張；他用那一個月證明了十分律。」 → 「，裂獸照樣擴張；那場轟炸只刮得動外甲、碰不到核；抵抗性直到次月才獲得證實。」
- `body`：「炸錯格也不退錢。能清 D 群、能壓制、能打破外甲最後一層——十分之一，價格十倍。」 → 「炸錯格也不退錢。一券一發精粹矢，能驅散 D 群、能壓制、能打破外甲最後一層——不保證收命，價格十倍。」

### content/lore/places/mcmurdo-dump.json

- `body`：「，稽古學會前哨。每個大潮之夜，站上的人都會聽」 → 「，稽古學會前哨。每個漲潮之夜，站上的人都會聽」

### content/lore/places/migrant-bird.json

- `body`：「尾有一門老艦砲，十分律之下只能嚇人，但清 D 群夠用；老桂生前管它叫」 → 「尾有一門老艦砲，凡鐵只能刮獸的外甲，趕散 D 群夠用，收命還得靠機甲；老桂生前管它叫」
- `body`：「 站在固定架上；犁二的胸口亮著一顆租來的魂核。」 → 「 站在固定架上；犁二的胸口亮著阿鏽的魂核，租約到期它就會走。」
- `body`：「廚子兼醫官老班；租來的機魂阿鏽——開了很多節點，一個都沒練熟。老桂每天陪它十分」 → 「廚子兼醫官老班；租來的機魂阿鏽——有自己的過去，是個真的人；開了很多節點，一個都沒練熟。老桂每天陪它十分」
- `body`：「，停在達卡上空。下一次大潮在十一天後。」 → 「，停在達卡上空。下一次漲潮在十一天後。」

## 殘留

以下只列本線 17 檔；全 content grep 的其他檔屬別批範圍，未改。每條僅取命中半句。

- `auckland.json body`「沒有催收的白手套」：正常催收點名，guide glove 明准保留。
- `dark-quay.json body`「2105 白手套事變」：既有事件名稱，非機甲種類。
- `dark-quay.json body`「白手套追到暗埠的入口就停了」：對人的追查，沒有對獸能力或機魂複製主張。
- `dark-quay.json body`「塞勒涅租賃庫裡『遺失』的機魂」：實在且各自唯一的野魂來歷；本句的「野魂複本」已改「野魂」，租賃庫不是複製庫。
- `farside-ruin-belt.json body`「沒有精粹核的白手套鐵偶」：已明定為無精粹核鐵偶；巡邏對象是偷越封鎖線的人。
- `farside-ruin-belt.json body`「塞勒涅工業與白手套」：勢力點名；後文無人挖掘、看守、搬運並未宣稱能對獸作戰。
- `ferry-lane.json body`「白手套的人偶爾也搭船」：點名人員搭船，未說其為機魂獨駕機甲；依 glove 不改。
- `graveyard-belt.json body`「白手套的人『清理』」：點名清理死星哨，沒有殺獸或複本敘述；依 glove 不改。
- `ice-shell.json summary`「2105 年大潮把它露了出來」：單一歷史古代機露出事件，可保留。
- `ice-shell.json body／地貌`「2105 年的某個大潮之夜」：同一歷史災夜，非例行。
- `ice-shell.json body／發生過什麼`「大潮讓古代機露出冰棚」：同一 2105 年事件，非例行。
- `mcmurdo-dump.json body`「租了兩棟屋」：普通房屋租用，與機魂租約無關。
- `mcmurdo-dump.json body`「2105 冰下古墟：大潮露出」：與 ice-shell 相同的歷史古代機露出夜，可保留。
- `migrant-bird.json body／機庫`「租約到期它就會走」：租的是阿鏽這個人，魂核隨它離開；符合 rent。
- `migrant-bird.json body／誰在這裡`「租來的機魂阿鏽」：緊接「有自己的過去，是個真的人」，不是複本；原有「開了很多節點」保留為成長進度，不當成多份副本。
- `migrant-bird.json body／誰在這裡`「每天陪它十分鐘」：時間長度，不是舊傷害定律。
- `migrant-bird.json body／葬禮`「十分鐘後」：時間長度，不是舊傷害定律。

判斷較模糊的 endymion-vault「大潮之夜站在它面前的人什麼也沒得到」改成「漲潮之夜」：原句不是明定某一次古代機醒來的災夜，依 tide「拿不準改漲潮」。同檔 M-3 每潮進穹頂的傳聞僅改頻率名稱，未新擬傳聞。

## 沒做到或證據不足的

無本批驗收缺項。沒有測試或修改範圍外內容；兩項檢查的警告未判作錯誤，也未聲稱已消除。伊斯坦堡的日期衝突受禁止改數字限制，留下供上游處理，詳下段。

## 需要決定的事

`istanbul.json body` 原有「2089-04 鐵翼之月」及「那一個月用掉各國半數鐵翼庫存」，與 guide tenth／essence 的「2089 年 5 月用掉半數庫存並證實抵抗性」有日期出入。本線保留 2089-04，改掉舊定律敘述，寫成轟炸只能刮外甲、抵抗性直到次月才獲證實；仍須上游處理半數庫存消耗月份與事件日期的統一，不在本線改日期或他檔。

另有已讀規矩之間的既有差異：world-pillars/mechs/bonds.md M4 的「座艙可有人、有機魂、或並存」與同節新增的「座艙裡一定有人」矛盾。本批照較新 essence／guide 執行，未改 wf。graveyard-belt 仍有「一顆流光渣、一點點天網的回聲就夠一個機魂住」的棲身說法；該檔本批只派 glove，若要明寫必須帶精粹魂核，請上游另指派。沒有自擬新的傳聞或更動數值／結構。

## 子代理

未使用。子代理成本為零；判讀、編修與指定驗收均由本線親自完成。

## 以後交接書該點名的工具

無。

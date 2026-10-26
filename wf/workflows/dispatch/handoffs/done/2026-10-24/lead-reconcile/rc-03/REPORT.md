# 已讀清單

以下均由 cx-rc-03 親自讀過；AGENTS.md 讀的是主 repo 指定版本，其餘相對路徑讀自隔離 worktree。

- `AGENTS.md`（實讀 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`（全部主題逐節讀）

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、inbox/PROTOCOL，以及 world-pillars/world、tone-and-rules、monsters。用 `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/world/history-reconcile.json grep '內陸|達卡|河口|菌絲|基多|潮差|公刻'` 查閱裁示，採 R28 與 guide 的 sea 規則。

## 做了什麼

逐檔讀完指定 20 檔，修改 12 檔、8 檔無需改。補達卡與萊茵的通海水路，將內陸流獸寫為少見，補菌絲走淡水的說法；慶州露墟改為大潮之夜發生，移除潮汐直接撕開墳丘的因果。未新增獸源設定。只替換 summary、body、consequences 既有文字；數字、日期、引用、鍵、陣列長度均保留。未 commit。

寫入前逐檔確認容量，最大增幅為萊茵蝕溝 2286 → 2400 bytes（約 5.0%），未達 30%；件數 12，未超過 20。

固定五條驗收結果：

1. `git status --short` 僅列上述 12 個允許內容檔與原有 `?? node_modules`；worktree 未留下腳本或筆記。
2. 本次執行 `npm run check` exit 0，末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` exit 0，末行 `errors=0 warnings=2`。前者警告為 content/base 怪獸的 capture layer HP 差異；後者為 busan-returned-seal、dark-quay-surety 事件未列入 timeline，均在本批範圍外。原始輸出保存在 `/tmp/cx-rc-03/check.log`、`/tmp/cx-rc-03/lore-check.log`。未跑 npm test 或其他驗收鏈。
3. 指定 20 檔沒有「潮差」；唯一「背面」是空援券背面，理由見下節。沒有勢力義「背面」。
4. 下列逐檔對照涵蓋全部 20 檔及每處替換。
5. 開頭已讀清單列齊交接書要求的全部 11 路徑。

## 逐檔對照

### content/lore/events/dhaka-north-rift.json

- summary：「達卡北郊開出一道」→「達卡北郊通海的河道旁開出一道」。
- body：「北郊的舊廠房區跟著裂開」→「河道經三角洲支流通向恆河口，再入孟加拉灣；蟲群沿這條水路上溯」，接回「河道旁跟著裂開」。保留廠區、裂縫與蟲群事件。
- body：「蝕開到哪，墟就在附近」→「沿河找獸，往山裡找墟」；「而北郊剛開了一道」→「北郊剛開的裂縫，並不能替山裡的傳聞作證」。避免把裂與墟的所在地綁在一起，仍保留阿尼爾的山脊傳聞。
- consequences[1]：「裂縫在北郊開出」→「裂縫在北郊通海的河道旁開出」。

### content/lore/events/kuafu-mountain-vigil.json

- body：「大潮夜的流獸闖進」→「那個大潮夜，高原上少見的流獸闖進」。保留負山、撤離與抄本互存，不替流獸另編來源或改族。

### content/lore/events/rift-valley-dig.json

無需改。這是內陸掘墟、古代機出土與拘束器原型的事件，沒有內陸獸災來源；guide 明說大裂谷掘墟不需獸災例外。既有二十三處數量與原有地點敘述保留。

### content/lore/events/rust-banner.json

無需改。「被菌絲撐起的舊甲」、孢霧與根已明確把腐衛寫為菌絲，符合五湖淡水菌絲例外，不另改獸族或事件。

### content/lore/factions/quito.json

無需改。沒有基多內陸截路獸群的來源敘述；繞過「聖保羅蝕域」僅用域名，未指其核心在市區。新加坡會議已寫南美代表席，未寫十五把傘齊聚；聯盟關係敘述不新增成立時間。

### content/lore/places/chittagong.json

無需改。海灘獸屍、海上狩獵與解拘事故都符合海岸條目，沒有潮差推論或內陸新來源。

### content/lore/places/delta.json

- body：「從裂縫直接過來」→「從通向孟加拉灣的恆河口裂縫過來」；「就往北走——往達卡」→「就沿支流往北上溯——往達卡」。明確銜接海口與達卡。

### content/lore/places/dhaka.json

- body：在「下雨會褪色」後接「北郊河道經三角洲支流接恆河口，通向孟加拉灣，獸群沿這條水路上溯」。
- body：「裂縫開在北郊」→「裂縫開在北郊通海的河道旁」。與北郊事件保持一致。

### content/lore/places/golmud-nest.json

- body：「偶爾請人把高原上的流獸趕離山口」→「高原上少見流獸，偶爾闖來，便請人趕離山口」。

### content/lore/places/great-lakes-mycelium.json

- body：「裂獸——菌絲。菌絲沒有個體」→「裂獸——菌絲。牠們沿淡水蔓延，不靠海；菌絲沒有個體」。保留既有湖底裂縫與菌床。

### content/lore/places/gyeongju-tombs.json

- body：「一次大潮把其中最大的一座撕開」→「一次大潮之夜，其中最大的一座裂開」。改成時間關聯。
- body：「釜山偶爾雇人清墳丘周邊的流獸」→「墳丘周邊少見流獸，偶爾闖來，釜山便雇人清走」。

### content/lore/places/hamburg.json

無需改。易北河口港城與鐵砧赴萊茵清剿均可保留；「浦那陷落」只是事件名稱，未寫內陸新開裂。沒有潮差因果。

### content/lore/places/mexico-city.json

- body：「因為高、因為遠離五大湖而撐了下來」→「高踞內陸、遠離海岸與五大湖，因此撐了下來」。補明遠離海岸與既有菌絲災區。
- body：「清高原山口的流獸」→「清高原山口少見的流獸」。

### content/lore/places/montreal.json

無需改。內文是掘墟與運回刑天的經過，沒有宣稱蒙特婁內陸新開裂或浦那自行出現裂縫，不需追加獸災來源。

### content/lore/places/old-array.json

無需改。已明寫「裂獸從孟買方向漫過來」與「孟買蝕域擴到浦那」，符合沿年擴張的方向；古墟不需要獸災例外。歸還黨在浦那的活動依 guide 讀作孟買支，事件保留。

### content/lore/places/quito.json

無需改。高原掘墟、渡月港與守商路均無新增獸源說法；2101 新加坡會議已寫南美代表席，政治敘述與本批裁示相容。

### content/lore/places/rhine-trench.json

- body：「在這裡撕開一道獸族裂縫」→「在接通萊茵河的舊運河旁撕開一道獸族裂縫」。
- body：在既有「蝕溝從裂縫順著舊運河」前補「舊運河接萊茵河，下通北海河口；獸群沿這條水路上溯」。
- body：「開在一座停工的焦化廠底下」→「開在通海運河旁一座停工的焦化廠底下」。既有焦化廠、運河與裂縫不搬遷。

### content/lore/places/rift-valley-seat.json

- body：「谷口外偶爾有流獸」→「大裂谷少見流獸；偶爾有獸闖到谷口外」。保留捕活獸契約，不另設來源。

### content/lore/places/titicaca-ruin.json

- body：「偶爾有流獸跟著湖面的光走過來」→「高原湖畔少見流獸，偶爾有獸跟著湖面的光走過來」。掘墟與湖光本身不作獸源。

### content/lore/places/yakutsk-bed.json

- body：「整片河谷鋪著菌毯」→「菌絲沿河谷的淡水蔓延，整片河谷鋪著菌毯」。
- 「每張背面」無需改，屬空援券本義。

## 殘留

已執行交接書指定的全 content `git grep -nE '潮差|背面|複本|迦梨|歸還黨|九闕|聖保羅|浦那' -- content`，完整輸出僅存 `/tmp/cx-rc-03/residuals-all.txt`。以下逐處列本批 20 檔的全部 13 個命中；範圍外檔案未改。

- factions/quito.json body：「聖保羅蝕域」一處。guide 明定保留域名；此句僅描述車隊繞行，未定位核心。
- places/hamburg.json body：「2106 浦那陷落」一處。保留事件名，沒有新增裂縫說法。
- places/montreal.json body：「岡本在浦那外」一處。掘墟位置，非獸災來源。
- places/montreal.json body：「2106 浦那陷落」一處。保留事件名與刑天運回經過。
- places/old-array.json region：「浦那外」一處。既有地點。
- places/old-array.json summary：「浦那外」一處。既有遺跡位置。
- places/old-array.json body 地貌段：「浦那陷落之後」一處。既有失守經過，未主張新裂。
- places/old-array.json body 誰在這裡：「歸還黨想要刑天」一處。guide politics 指明既有浦那活動屬孟買支，按此讀，未否定另外兩支。
- places/old-array.json body 發生過什麼：「2106 浦那陷落」一處。事件名照舊。
- places/old-array.json body 同段：「孟買蝕域擴到浦那」一處。正符合 guide sea 的擴張說法。
- places/old-array.json body 同段：「歸還黨先撤」一處。孟買支的既有撤離經過，保留。
- places/old-array.json tags[2]：「浦那」一處。中文地點標籤照舊。
- places/yakutsk-bed.json body：「每張背面」一處。主語是空援券，並非走私網，符合 guide dark 保留本義的規則。

本批無「潮差」「複本」「迦梨」「九闕」命中。

## 沒做到或證據不足的

本批承諾的五條驗收均已完成。兩項檢查的範圍外警告保留，未額外跑測試或改其他檔；沒有驗證主 repo 合併結果。

## 需要決定的事

以下是閱讀時發現的既有差異，未擴大改寫範圍，不阻塞本批交付：

- places/mexico-city.json 寫「墨西哥城是 31 城邦之一」，與 guide politics「31 城邦是南亞創始城，不是全球總數」衝突。本檔交接書只分配 sea；請領導另派 politics 同步，未自行動此句或數字。
- events/rift-valley-dig.json 寫恩凱位於「大裂谷底」，places/rift-valley-seat.json 則寫「谷西的崖壁上」。兩檔均為既有掘墟位置；依 guide 不需編獸源，位置差異交領導決定，不擅搬遺跡。
- 基多兩檔把 2094 安地斯壁稱為堅盾祖先，而既有 2093-02 堅盾公刻早於它。guide fix 只指 2093 公刻把長槍誤寫為通用系列的問題，未裁示安地斯血統；未改年份或血統。

## 子代理

未使用子代理。子代理成本為 0；20 檔與必讀規矩均由本線親讀，沒有委派造成的摘要落差。

## 以後交接書該點名的工具

無。

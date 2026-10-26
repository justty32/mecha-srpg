## 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`

AGENTS.md 親自讀取主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘以上路徑均讀 worktree 版本。terms-rename.json 已用 tabledb.py 分別讀完古代機、機甲、蝕、專有名詞、保留五類。另讀交接書、SESSION-LOG.md、WAIT_USER.md、WORKFLOWS.md、inbox/PROTOCOL.md、dispatch/lessons.md，以及 world-pillars 的 world、mechs 導航與 tone-and-rules、ancient 子檔。

## 做了什麼

cx-rn-07 完成 rename-07：檢視指定 16 檔，修改其中 15 檔。bay-tide-line.json 只有應保留的大潮，未改。只換文字欄與中文標籤；id、引用、數字、鍵與陣列長度未動。未 commit、未安裝依賴、未使用 MCP。

固定五條驗收結果：

1. git status --short 僅有指定範圍內 15 個 M，另有交接書允許忽略、開工時即存在的 node_modules。無新增／刪除內容檔。
2. npm run check 結束碼 0：`OK 0 errors, 8 warnings`；node content/lore/check.ts 結束碼 0：`errors=0 warnings=2`。
3. 必用 git grep 已跑，逐檔殘留詳列下文；指定 16 檔無「古機」「蝕盛」「蝕歇」「原鞘」。
4. 逐檔對照如下，包含未改檔的理由。
5. 報告首段逐行列齊先讀十個路徑，五類詞表均親自讀完。

檢查原始輸出：`/tmp/cx-rn-07/check.log`、`/tmp/cx-rn-07/lore-check.log`；全 content 的必用 git grep 輸出：`/tmp/cx-rn-07/after-grep.txt`。範圍外命中未修改。

## 逐檔對照

### content/lore/places/auckland.json

- `body` 第 15 片段：「- **2089 第一次潮**之後，南方的難民船開始往這裡漂。」 → 「- **2089 第一次蝕潮**之後，南方的難民船開始往這裡漂。」
- `body` 第 26 片段：「殘聯的報告說它的潮壓是全世界最低的；本地人說「還沒輪到我們」。」 → 「殘聯的報告說它的蝕壓是全世界最低的；本地人說「還沒輪到我們」。」

### content/lore/places/bay-tide-line.json

無換詞；body 兩處「大潮」均依表保留 index 67／規則 3 保留。

### content/lore/places/busan.json

- `body` 第 10 片段：「**釜山城邦**，城主金河娜：慶州殼陵裡被處容認主的巫堂之女。」 → 「**釜山城邦**，城主金河娜：慶州古陵裡被處容認主的巫堂之女。」
- `body` 第 23 片段：「- **2100 慶州殼之爭**：釜山、鹽鷗、塞勒涅三方搶殼；處容認了金河娜，第三刃在那一夜成立。」 → 「- **2100 慶州古陵之爭**：釜山、鹽鷗、塞勒涅三方搶古代機；處容認了金河娜，第三刃在那一夜成立。」

### content/lore/places/chittagong.json

- `body` 第 12 片段：「塞勒涅說長槍-V4 侵了型錄的權；拆船幫說那是公刻的圖，誰都能摹。」 → 「塞勒涅說長槍-V4 侵了型錄的權；拆船幫說那是公刻的圖，誰都能仿。」
- `body` 第 28 片段：「拆船幫與潮信會是死仇。」 → 「拆船幫與沐蝕會是死仇。」
- `body` 第 36 片段：「- **契約**：護送屍船、清拆屍場周邊的流獸、揪出潮信會的滲透者。」 → 「- **契約**：護送屍船、清拆屍場周邊的流獸、揪出沐蝕會的滲透者。」

### content/lore/places/cold-tide-rift.json

- `summary` 第 1 片段：「威德爾海冰上的異形裂縫：每個大潮開一次、自己閉上，沒有潮錨；過來的異形留在冰上，隨浮冰漂向世界。」 → 「威德爾海冰上的異形裂縫：每個大潮開一次、自己閉上，沒有蝕錨；過來的異形留在冰上，隨浮冰漂向世界。」
- `body` 第 4 片段：「一天之後它自己閉上，冰面恢復原樣，只留下一圈碎鏡地：冰面變成鏡子，殼目在上面看什麼都是錯的。」 → 「一天之後它自己閉上，冰面恢復原樣，只留下一圈碎鏡地：冰面變成鏡子，靈目在上面看什麼都是錯的。」
- `body` 第 10 片段：「異形沒有錨：寒潮裂縫不需要潮錨撐，開一個大潮就自己閉上，沒有人能封它，也不用封。」 → 「異形沒有錨：寒潮裂縫不需要蝕錨撐，開一個大潮就自己閉上，沒有人能封它，也不用封。」
- `body` 第 12 片段：「異形不對稱、每隻不同、沒有母體也不蛻皮，每個潮月形態會重抽一次——今天的獵物下個月就是別的東西。」 → 「異形不對稱、每隻不同、沒有母體也不蛻皮，每個蝕月形態會重抽一次——今天的獵物下個月就是別的東西。」
- `body` 第 17 片段：「- **2089 第一次潮**之後不久，殘翼的鐵翼第一次從上空看見冰上的碎鏡光。」 → 「- **2089 第一次蝕潮**之後不久，殘翼的鐵翼第一次從上空看見冰上的碎鏡光。」
- `body` 第 18 片段：「星哨「哨所」的潮訊預報從那時起多了一行：威德爾海，每個大潮，一次。」 → 「星哨「哨所」的蝕訊預報從那時起多了一行：威德爾海，每個大潮，一次。」
- `body` 第 29 片段：「- **捕異形**：沒有錨、沒有繫，捕到的每一隻都是孤品，殼學會與月面買家都出高價——只是牠下個月長什麼樣，沒人知道。」 → 「- **捕異形**：沒有錨、沒有繫，捕到的每一隻都是孤品，稽古學會與月面買家都出高價——只是牠下個月長什麼樣，沒人知道。」

### content/lore/places/dark-quay.json

- `summary` 第 1 片段：「靜海市地下的舊貨棧，背面的窩：殼殘片、野魂複本、座標都在這裡換手，地勤會也在這裡有自己的角落。」 → 「靜海市地下的舊貨棧，背面的窩：骸片、野魂複本、座標都在這裡換手，地勤會也在這裡有自己的角落。」
- `body` 第 11 片段：「- **低重力**：摹機一步跳得更遠，摔得也更重；矢飛出去不會落下來。」 → 「- **低重力**：衍型機一步跳得更遠，摔得也更重；矢飛出去不會落下來。」
- `body` 第 22 片段：「他不常在這裡，他常在渡潮船上；但暗埠的每個攤主都知道他今天要什麼。」 → 「他不常在這裡，他常在渡月船上；但暗埠的每個攤主都知道他今天要什麼。」
- `body` 第 27 片段：「- **2097 月面封鎖**：封鎖線拉起來的那天，第一塊殼殘片被某個工人塞進工具箱帶到這裡。」 → 「- **2097 月面封鎖**：封鎖線拉起來的那天，某個工人把第一塊骸片塞進工具箱，帶到這裡。」
- `body` 第 42 片段：「- **買殘片**：月面殼帶偷出來的殼殘片，便宜、貨真。」 → 「- **買殘片**：月面墟帶偷出來的骸片，便宜、貨真。」

### content/lore/places/delta.json

- `summary` 第 1 片段：「恆河口的淺蝕野地，2102 年獸族的潮就是從這片泥裡衝向達卡的。」 → 「恆河口的淺蝕野地，2102 年獸族的蝕潮就是從這片泥裡衝向達卡的。」
- `body` 第 17 片段：「**2102 孟加拉灣戰役**：獸族的潮從三角洲衝出來，與海岸的蟲族同時壓向達卡。」 → 「**2102 孟加拉灣戰役**：獸族的蝕潮從三角洲衝出來，與海岸的蟲族同時壓向達卡。」

### content/lore/places/dhaka.json

- `body` 第 10 片段：「殘聯在城裡有一間契約辦事處；殼學會的座標販子阿尼爾・喬杜里在酒艙裡賣遺跡座標、買刻痕。」 → 「殘聯在城裡有一間契約辦事處；稽古學會的座標販子阿尼爾・喬杜里在酒艙裡賣遺跡座標、買刻痕。」
- `body` 第 15 片段：「- **2102 孟加拉灣戰役**：獸族從三角洲、蟲族從海岸，兩道潮同時壓上來。」 → 「- **2102 孟加拉灣戰役**：獸族從三角洲、蟲族從海岸，兩道蝕潮同時壓上來。」

### content/lore/places/endymion-vault.json

- `summary` 第 1 片段：「背面遺跡帶核心的殼墓：恩底彌翁在這裡永眠不醒，塞勒涅因它學會了「不靠認主也能摹」。」 → 「背面遺跡帶核心的古墓：恩底彌翁在這裡永眠不醒，塞勒涅因它學會了「不靠認主也能仿造」。」
- `body` 第 2 片段：「恩底彌翁之墓在殼帶的正中央，是一座被月壤半掩的圓坑。」 → 「恩底彌翁之墓在墟帶的正中央，是一座被月壤半掩的圓坑。」
- `body` 第 3 片段：「坑底躺著一台殼，側身、蜷著，像一個睡著的人——一隻獸的殘骸環在它身上，殼甲上覆著一層一萬一千年沒有被風吹過的細灰。」 → 「坑底躺著一台古代機，側身、蜷著，像一個睡著的人——一隻獸的殘骸環在它身上，鎧甲上覆著一層一萬一千年沒有被風吹過的細灰。」
- `body` 第 4 片段：「塞勒涅在坑上蓋了一座無窗的白穹頂，穹頂內恆溫、恆光，殼目與術式探針從四面八方對著它，日夜不停地讀。」 → 「塞勒涅在坑上蓋了一座無窗的白穹頂，穹頂內恆溫、恆光，靈目與術式探針從四面八方對著它，日夜不停地讀。」
- `body` 第 10 片段：「- **低重力**：摹機一步跳得更遠，摔得也更重；矢飛出去不會落下來。」 → 「- **低重力**：衍型機一步跳得更遠，摔得也更重；矢飛出去不會落下來。」
- `body` 第 21 片段：「恩底彌翁是它的藍本古代機——一台從來沒有醒過的殼。」 → 「恩底彌翁是它的藍本古代機——一台從來沒有醒過的古代機。」
- `body` 第 26 片段：「- **-8900 先民封潮**：殼學會相信，進了裂縫的先民從月面出來就死在這裡；恩底彌翁是那支隊伍裡走得最遠的一個。」 → 「- **-8900 先民封蝕**：稽古學會相信，進了裂縫的先民從月面出來就死在這裡；恩底彌翁是那支隊伍裡走得最遠的一個。」
- `body` 第 28 片段：「- **2097 月面封鎖**：殼帶露出後三個月，塞勒涅在核心挖出恩底彌翁。」 → 「- **2097 月面封鎖**：墟帶露出後三個月，塞勒涅在核心挖出恩底彌翁。」
- `body` 第 30 片段：「塞勒涅反而因此學會了別的事：既然它不認人，那就不靠認主——殼目、無人化、魂核介面，全從讀它開始。」 → 「塞勒涅反而因此學會了別的事：既然它不認人，那就不靠認主——靈目、無人化、魂核介面，全從讀它開始。」
- `body` 第 33 片段：「- 殼學會從那一年起抗議，要求公開刻痕。」 → 「- 稽古學會從那一年起抗議，要求公開刻痕。」
- `body` 第 40 片段：「殼不認機魂——塞勒涅的人說，所以它一直在等一個不會再來的人。」 → 「古代機不認機魂——塞勒涅的人說，所以它一直在等一個不會再來的人。」

### content/lore/places/farside-ruin-belt.json

- `region` 第 1 片段：「月面・背面兩百公里殼帶」 → 「月面・背面兩百公里墟帶」
- `summary` 第 1 片段：「月球背面一夜之間露出的兩百公里殼帶：2097 年裂過一次，塞勒涅三個月內封鎖至今，挖到什麼從不公布。」 → 「月球背面一夜之間露出的兩百公里墟帶：2097 年裂過一次，塞勒涅三個月內封鎖至今，挖到什麼從不公布。」
- `body` 第 3 片段：「2097 年那一夜，背面的灰原裂開一道口，一天後就閉上了——但口兩側露出的東西沒有再埋回去：一條兩百公里長的殼帶，一具接一具的殼，半埋在月壤裡，有的跪著、有的躺著、有的面朝下，像一支走到這裡就倒下的隊伍。」 → 「2097 年那一夜，背面的灰原裂開一道口，一天後就閉上了——但口兩側露出的東西沒有再埋回去：一條兩百公里長的墟帶，一台接一台的古代機，半埋在月壤裡，有的跪著、有的躺著、有的面朝下，像一支走到這裡就倒下的隊伍。」
- `body` 第 4 片段：「沒有風，沒有聲音，殼上的刻痕一萬一千年來沒被任何東西磨過。」 → 「沒有風，沒有聲音，裝甲上的刻痕一萬一千年來沒被任何東西磨過。」
- `body` 第 10 片段：「- **低重力**：摹機一步跳得更遠，摔得也更重；矢飛出去不會落下來。」 → 「- **低重力**：衍型機一步跳得更遠，摔得也更重；矢飛出去不會落下來。」
- `body` 第 15 片段：「- **塞勒涅的規矩**：殼帶是禁區。」 → 「- **塞勒涅的規矩**：墟帶是禁區。」
- `body` 第 21 片段：「挖掘隊是無人的；看守是無人的；連運殼的車都是無人的。」 → 「挖掘隊是無人的；看守是無人的；連運古代機的車都是無人的。」
- `body` 第 26 片段：「- **-8900 先民封潮**：殼學會相信，先民封住上一次潮時把裂縫的另一端推到了月球；進了裂縫的先民機甲從月面出來，就死在這裡。」 → 「- **-8900 先民封蝕**：稽古學會相信，先民封住上一次蝕潮時把裂縫的另一端推到了月球；進了裂縫的先民機甲從月面出來，就死在這裡。」
- `body` 第 28 片段：「- **2097 月面潮殼同夜**：背面裂一次，殼帶露出。」 → 「- **2097 月面蝕墟同夜**：背面裂一次，墟帶露出。」
- `body` 第 31 片段：「殼帶核心挖出了恩底彌翁——永眠不醒的殼；塞勒涅反而因此學會「不靠認主也能摹」。」 → 「墟帶核心挖出了恩底彌翁——永眠不醒的古代機；塞勒涅反而因此學會「不靠認主也能仿造」。」
- `body` 第 32 片段：「殼學會抗議，背面在封鎖線拉起的那天誕生。」 → 「稽古學會抗議，背面在封鎖線拉起的那天誕生。」
- `body` 第 34 片段：「- **2099 赫卡忒之秘**（rumor）：背面傳說殼帶深處第二台殼認了一個測試員，M-3。」 → 「- **2099 赫卡忒之秘**（rumor）：背面傳說墟帶深處第二台古代機認了一個測試員，M-3。」
- `body` 第 35 片段：「塞勒涅從不公布，傳說他／她從沒離開過殼。」 → 「塞勒涅從不公布，傳說他／她從沒離開過那台古代機。」
- `body` 第 46 片段：「- 不合法的：背面賣殼帶的殘片與座標，偷越封鎖線的人很少回來。」 → 「- 不合法的：背面賣墟帶的殘片與座標，偷越封鎖線的人很少回來。」

### content/lore/places/ferry-lane.json

- `name` 第 1 片段：「渡潮航路」 → 「渡月航路」
- `summary` 第 1 片段：「從基多、奈洛比、新加坡三座赤道港到靜海市的三天航路，只有塞勒涅的渡潮船走，老鴿的座位在這裡。」 → 「從基多、奈洛比、新加坡三座赤道港到靜海市的三天航路，只有塞勒涅的渡月船走，老鴿的座位在這裡。」
- `body` 第 2 片段：「渡潮航路沒有路，只有船。」 → 「渡月航路沒有路，只有船。」
- `body` 第 3 片段：「弦月那天，塞勒涅的渡潮船從三座赤道港——基多、奈洛比、新加坡——拖著光尾升空，穿過星哨與墳帶那一圈，然後是三天的黑：窗外地球一天比一天小，月亮一天比一天大。」 → 「弦月那天，塞勒涅的渡月船從三座赤道港——基多、奈洛比、新加坡——拖著光尾升空，穿過星哨與墳帶那一圈，然後是三天的黑：窗外地球一天比一天小，月亮一天比一天大。」
- `body` 第 9 片段：「**塞勒涅工業**：地月之間只有它的渡潮船，船票是一個潮月的薪水。」 → 「**塞勒涅工業**：地月之間只有它的渡月船，船票是一個蝕月的薪水。」
- `body` 第 11 片段：「**背面**：渡潮船上的熟面孔——搬運工、廚子、一個永遠坐在同一個位子上的老頭。」 → 「**背面**：渡月船上的熟面孔——搬運工、廚子、一個永遠坐在同一個位子上的老頭。」
- `body` 第 13 片段：「他賣殼殘片、野魂複本、座標；你想找他，買一張票，找那個位子。」 → 「他賣骸片、野魂複本、座標；你想找他，買一張票，找那個位子。」
- `body` 第 19 片段：「- **2097 月面封鎖**：封鎖之後，航路成了殼殘片流回地球唯一的路——背面就在這條航路上長大。」 → 「- **2097 月面封鎖**：封鎖之後，航路成了骸片流回地球唯一的路——背面就在這條航路上長大。」
- `body` 第 21 片段：「- **2102 奈洛比港事件**：渡潮船拒載生物機甲，奈洛比扣船三天。」 → 「- **2102 奈洛比港事件**：渡月船拒載生物機甲，奈洛比扣船三天。」
- `body` 第 31 片段：「- **渡潮**：去月面只有這條路。」 → 「- **渡月**：去月面只有這條路。」
- `tags[1]` 第 1 片段：「渡潮船」 → 「渡月船」

### content/lore/places/golmud-nest.json

- `status2108` 第 1 片段：「殼守守著」 → 「守寢人看守」
- `summary` 第 1 片段：「青藏高原格爾木外的遺跡：人類第一台醒來的殼在這裡認了一個地質學家，摹一也在這裡誕生。」 → 「青藏高原格爾木外的遺跡：人類第一台醒來的古代機在這裡認了一個地質學家，衍一也在這裡誕生。」
- `body` 第 3 片段：「夸父之窩是一道塌陷的斜井，口子朝東——殼守說，那是對著太陽。」 → 「夸父之窩是一道塌陷的斜井，口子朝東——守寢人說，那是對著太陽。」
- `body` 第 5 片段：「往下走三層，是那張巨大的殼床；夸父不在的時候，它像一張沒人睡的床。」 → 「往下走三層，是那張巨大的寢床；夸父不在的時候，它像一張沒人睡的床。」
- `body` 第 6 片段：「窩口外是殼守的石屋與經幡，屋裡永遠煮著酥油茶。」 → 「窩口外是守寢人的石屋與經幡，屋裡永遠煮著酥油茶。」
- `body` 第 10 片段：「**殼守**：丹增・卓瑪、洛桑，以及幾十個不肯離開的人。」 → 「**守寢人**：丹增・卓瑪、洛桑，以及幾十個不肯離開的人。」
- `body` 第 12 片段：「殼守拒絕殘聯，也拒絕塞勒涅；他們不養兵——夸父一台抵一支軍。」 → 「守寢人拒絕殘聯，也拒絕塞勒涅；他們不養兵——夸父一台抵一支軍。」
- `body` 第 13 片段：「窩外還立著**摹一聯合**的舊廠房，屋頂塌了一半，2093 年以後再沒有人點過燈。」 → 「窩外還立著**衍一聯合**的舊廠房，屋頂塌了一半，2093 年以後再沒有人點過燈。」
- `body` 第 17 片段：「- **-8900 先民封潮**：刻痕說，這是先民把兩樣東西一起留下的地方之一。」 → 「- **-8900 先民封蝕**：刻痕說，這是先民把兩樣東西一起留下的地方之一。」
- `body` 第 19 片段：「- **2089-05 夸父醒來**：洛桑挖開了窩；大潮之夜，殼認了丹增。」 → 「- **2089-05 夸父醒來**：洛桑挖開了窩；大潮之夜，古代機認了丹增。」
- `body` 第 21 片段：「同一夜，全世界夢見機甲——殼訊之夜。」 → 「同一夜，全世界夢見機甲——夢召之夜。」
- `body` 第 23 片段：「- **2091 摹一下線**：秦望舒看著夸父「就懂了」怎麼摹，第一台機械系在窩外的廠房造了出來。」 → 「- **2091 衍一下線**：秦望舒看著夸父「就懂了」怎麼仿造，第一台機械系在窩外的廠房造了出來。」
- `body` 第 27 片段：「- **2093 格爾木分家**：財政崩潰、摹一聯合解散；一半人跟秦望舒去了月面，檔案被各國殘軍接收，夸父回窩。」 → 「- **2093 格爾木分家**：財政崩潰、衍一聯合解散；一半人跟秦望舒去了月面，檔案被各國殘軍接收，夸父回窩。」
- `body` 第 31 片段：「殼守守著。」 → 「守寢人看守。」
- `body` 第 32 片段：「潮信會想來拜夸父，被擋在山口外。」 → 「沐蝕會想來拜夸父，被擋在山口外。」
- `body` 第 36 片段：「- **刻痕**：殼守只付茶與刻痕，但他們的刻痕抄本是世上最老的一份。」 → 「- **刻痕**：守寢人只付茶與刻痕，但他們的刻痕抄本是世上最老的一份。」
- `body` 第 40 片段：「- **朝聖**：每個摹機駕駛員一輩子都想來看一眼。」 → 「- **朝聖**：每個衍型機駕駛員一輩子都想來看一眼。」
- `tags[2]` 第 1 片段：「殼守」 → 「守寢人」
- `tags[3]` 第 1 片段：「摹一」 → 「衍一」

### content/lore/places/graveyard-belt.json

- `body` 第 34 片段：「- **送魂核**：背面替野魂走貨道；有人會雇你把一顆魂核送上渡潮船，問題別問。」 → 「- **送魂核**：背面替野魂走貨道；有人會雇你把一顆魂核送上渡月船，問題別問。」

### content/lore/places/great-lakes-mycelium.json

- `body` 第 16 片段：「- **2089-03-14 第一次潮**：裂縫開在湖底。」 → 「- **2089-03-14 第一次蝕潮**：裂縫開在湖底。」
- `body` 第 28 片段：「蒙特婁在它東北，殼學會的學者冬天才敢沿著河走。」 → 「蒙特婁在它東北，稽古學會的學者冬天才敢沿著河走。」

### content/lore/places/green-line.json

- `body` 第 12 片段：「**潮信會**送來解拘的獸替他們看門，把這裡當成「順潮」的善地。」 → 「**沐蝕會**送來解拘的獸替他們看門，把這裡當成「順應蝕潮」的善地。」

### content/lore/places/gyeongju-tombs.json

- `name` 第 1 片段：「慶州殼陵」 → 「慶州古陵」
- `summary` 第 1 片段：「朝鮮半島東南的古墳群：2100 年三方在這裡搶一台殼，殼卻選了一個來跳舞的女孩。」 → 「朝鮮半島東南的古墳群：2100 年三方在這裡搶一台古代機，它卻選了一個來跳舞的女孩。」
- `body` 第 3 片段：「2100 年的一次大潮把其中最大的一座撕開，露出底下不屬於任何王朝的殼室：先民的刻痕與千年前的金冠擠在同一層土裡，誰也說不清是誰先埋的。」 → 「2100 年的一次大潮把其中最大的一座撕開，露出底下不屬於任何王朝的內殿：先民的刻痕與千年前的金冠擠在同一層土裡，誰也說不清是誰先埋的。」
- `body` 第 13 片段：「**2100 慶州殼之爭**：殼露出來的那個潮月，三方都派了人。」 → 「**2100 慶州古陵之爭**：古代機露出來的那個蝕月，三方都派了人。」
- `body` 第 15 片段：「三方在墳丘之間打了半個潮月，誰都沒拿下殼室。」 → 「三方在墳丘之間打了半個蝕月，誰都沒拿下內殿。」
- `body` 第 16 片段：「大潮之夜，一個來替死者跳舞的巫堂之女走進了裂口——殼醒了，認了她。」 → 「大潮之夜，一個來替死者跳舞的巫堂之女走進了裂口——古代機醒了，認了她。」
- `body` 第 24 片段：「殼學會來翻過兩次刻痕；塞勒涅還留著當年那份挖掘權文件，偶爾寄一封很有禮貌的信來提醒。」 → 「稽古學會來翻過兩次刻痕；塞勒涅還留著當年那份挖掘權文件，偶爾寄一封很有禮貌的信來提醒。」
- `body` 第 30 片段：「- **刻痕**：殼室外圍還有沒抄完的牆面，殼學會收拓本。」 → 「- **刻痕**：內殿外圍還有沒抄完的牆面，稽古學會收拓本。」

## 殘留

逐字列出 git grep 的命中字；位置為 JSON 解析後欄位字串的一起算字元位置。同一片段內的重複命中亦各列一項。新詞「蝕潮」一併列出，避免與舊詞混淆。

### auckland.json

- `body` 字元 268：「／- **2089 第一次蝕潮**之後，南方的難民船開始往這裡」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。

### bay-tide-line.json

- `body` 字元 140：「是一排插在泥裡的紅旗，每個大潮過後要往後挪，或往前插。／／##」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 531：「單；契約多半是「幫我們守到大潮過去」。／- **招募**：名單」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

### busan.json

- `body` 字元 106：「錄件的新漆味混在一起。每逢大潮之夜，城主會在港口的舞台上跳舞，」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

### chittagong.json

- `body` 字元 64：「衝上來的換成了裂獸：盾甲的背殼、鐮肢的節肢，偶爾還有一顆沒熄的」：盾甲的背殼為裂獸甲殼本義，表「保留」index 62、規則 2。
- `body` 字元 90：「一顆沒熄的裂晶。空氣裡是鏽、潮水、腐肉與切割火的味道，退潮時泥」：海水退潮／潮水本義，表「保留」index 63、規則 3。
- `body` 字元 104：「潮水、腐肉與切割火的味道，退潮時泥灘上浮著一層虹色的油膜——那」：海水退潮／潮水本義，表「保留」index 63、規則 3。

### cold-tide-rift.json

- `name` 字元 2：「寒潮裂縫」：寒潮裂縫的寒潮為氣象意象，表「保留」index 63、規則 3。
- `status2108` 字元 3：「每大潮開一次自閉」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `summary` 字元 16：「德爾海冰上的異形裂縫：每個大潮開一次、自己閉上，沒有蝕錨；過來」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 23：「／威德爾海是一片會動的冰。寒潮裂縫開在冰上，沒有固定的位置——」：寒潮裂縫的寒潮為氣象意象，表「保留」index 63、規則 3。
- `body` 字元 43：「上，沒有固定的位置——每個大潮，海冰的某處會裂開一道口，口裡不」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 187：「**——異形。異形沒有錨：寒潮裂縫不需要蝕錨撐，開一個大潮就自」：寒潮裂縫的寒潮為氣象意象，表「保留」index 63、規則 3。
- `body` 字元 201：「潮裂縫不需要蝕錨撐，開一個大潮就自己閉上，沒有人能封它，也不用」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 343：「／- **2089 第一次蝕潮**之後不久，殘翼的鐵翼第一次從」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。
- `body` 字元 399：「起多了一行：威德爾海，每個大潮，一次。／- 每一個大潮它都開，」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 411：「個大潮，一次。／- 每一個大潮它都開，從來沒漏過；殘聯的地圖上」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 462：「## 2108 的狀態／每大潮開一次、自閉。南大洋的漁船怕的不」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

### dark-quay.json

無「殼／摹／潮／鞘」殘留。

### delta.json

- `summary` 字元 20：「蝕野地，2102 年獸族的蝕潮就是從這片泥裡衝向達卡的。」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。
- `body` 字元 78：「來像冷掉的鐵，敲起來會響。退潮的泥灘上浮出一塊塊蝕斑，夜裡發著」：海水退潮／潮水本義，表「保留」index 63、規則 3。
- `body` 字元 100：「塊塊蝕斑，夜裡發著暗光。空氣潮得能擰出水，帶著淤泥、鹽與獸群經」：空氣潮濕本義，表「保留」index 63、規則 3。
- `body` 字元 205：「族為主。牠們不繫、不回巢，大潮時從裂縫直接過來，在三角洲裡成群」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 299：「 孟加拉灣戰役**：獸族的蝕潮從三角洲衝出來，與海岸的蟲族同時」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。

### dhaka.json

- `body` 字元 346：「從三角洲、蟲族從海岸，兩道蝕潮同時壓上來。鐵砧受雇守城，老桂帶」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。

### endymion-vault.json

- `body` 字元 518：「彌翁。它不醒、不認任何人，大潮之夜站在它面前的人什麼也沒得到。」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 745：「有一個沒有名字的編號，每個大潮之夜進去一次——有人說那就是 M」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

### farside-ruin-belt.json

- `body` 字元 465：「古學會相信，先民封住上一次蝕潮時把裂縫的另一端推到了月球；進了」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。

### ferry-lane.json

無「殼／摹／潮／鞘」殘留。

### golmud-nest.json

- `body` 字元 382：「父醒來**：洛桑挖開了窩；大潮之夜，古代機認了丹增。洛桑說夸父」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

### graveyard-belt.json

- `body` 字元 69：「上轉，光帆破了、天線歪了、外殼被細小的碎石打得像月面。從地球上」：死星哨外殼，非古代機，表「保留」index 62、規則 2。

### great-lakes-mycelium.json

- `body` 字元 222：「沒有人進去確認過。菌床每個大潮固定往外蝕兩區，不快，從不停。菌」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 280：「089-03-14 第一次蝕潮**：裂縫開在湖底。第一個夏天，」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。

### green-line.json

- `summary` 字元 34：「度 C 的蟲族裂縫七年，每大潮賣子體，2107 年被清剿打成半」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 204：「。他們不封裂縫，讓巢母每個大潮生子體，捕下 D 級子體賣給任何」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 255：「他們看門，把這裡當成「順應蝕潮」的善地。／／## 發生過什麼／」：已定案新詞「蝕潮」的一部分，表 index 28／29；不是待換舊詞。
- `body` 字元 607：「的流獸多半已經死光，但每個大潮還會從那道「封了」的裂縫爬出幾隻」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

### gyeongju-tombs.json

- `body` 字元 50：「的背脊。2100 年的一次大潮把其中最大的一座撕開，露出底下不」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。
- `body` 字元 327：「半個蝕月，誰都沒拿下內殿。大潮之夜，一個來替死者跳舞的巫堂之女」：大潮／大潮之夜，表「保留」index 67、交接書規則 3：蝕潮強弱起落照用。

## 沒做到或證據不足的

無未完成的指定驗收；沒有加跑 npm test、wf-lint、typecheck、MCP 或其他驗收。容量 gate：最大檔案增幅為 farside-ruin-belt.json，2.06%，未達 20%；件數為 15，未超過 16。

指定檢查有範圍外警告，未修正，也未以額外基準測試推論是否為既存警告：

```text
> mecha-srpg@0.1.0 check
> node src/content/loader.ts content/base && node src/ops/content/check.ts content/base

pack base 0.1.0
frame: 89
bodyplan: 39
component: 54
ability: 128
effect: 124
person: 37 (human 30, soul 7)
soultree: 6
terrain: 23
map: 17
faction: 10
species: 18
monster: 28
scenario: 26
aiprofile: 16
curve: 1
registries: 7/7
rules: 4/4
WARNING [content-load] content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING [content-load] content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING [content-load] content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING [content-load] content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING [content-load] content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING [content-load] content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING [content-load] content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [content-load] content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [band-evasion] content/base/effects/mx-faded.json $.contribs[0].value value 25 exceeds upper limit 22; source numeric-bands.json rows[18]
WARNING [soft-overflow-band] content/base/species/tidewolf.json $.pools[1].bands instinct: no band covers values above max
WARNING [band-damage] content/base/abilities/kx-tide-crush.json $.packets value 28 exceeds upper limit 26; source numeric-bands.json rows[7]
WARNING [mechanical-unarmed] content/base/frames/infantry.json $.defaultLoadout mechanical frame has no defaultLoadout or innate attack
OK 0 errors, 12 warnings
calendar: 1
ferry: 1
ship: 1
keymap: 1
affinity: 1
operation: 10
treaty: 7
lineage: 10
model: 32
forces: 1
node: 8
route: 12
rift: 4
encounter: 17
faction-ops: 10
map: 0
place: 0
lane: 0
regions: 0
wterrain: 0
contract: 17
action: 28
market: 6
service: 4
recruit: 4
background: 13
beasts: 4
research: 17
job: 6
names: 27
event: 56
dialogue: 19
room: 7
templates: 3
start: 1
WARNING content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
OK 0 errors, 8 warnings
places per continent: {"非洲":5,"大洋洲":3,"亞洲":17,"南極":3,"月面":5,"軌道":3,"北美":4,"歐洲":5,"南美":4}
counts: {"faction":31,"character":65,"event":60,"place":49,"era":7} timeline=116
WARN events/busan-returned-seal.json: 未出現在 timeline
WARN events/dark-quay-surety.json: 未出現在 timeline
errors=0 warnings=2
```

## 需要決定的事

無阻塞決定。以下為依規則採用的表外短語改寫，供領導檢視；未另造專名：

- green-line.json：「順潮」→「順應蝕潮」，保留教派順從蝕潮的原意，改成一般動賓短語。
- ferry-lane.json：活動標籤「渡潮」→「渡月」，由表 index 35 的渡月船／渡月航路一致推得。
- delta.json「獸族的潮」與 dhaka.json「兩道潮」依世界觀湧現語境改為「獸族的蝕潮」「兩道蝕潮」；不是把既有「獸潮」替換掉。
- golmud-nest.json「殼守守著」→「守寢人看守」，避免「守寢人守著」重複。
- dark-quay.json 在換「骸片」的同一句將「第一塊…被某個工人塞進…」調為「某個工人把第一塊…塞進…」，人物與事件不變。
- 殼墓→古墓、殼床→寢床已在表 index 17；非新造詞。

不含舊詞的名字沒有足夠理由提出翻譯腔改名建議，未擅自更名。

## 子代理

未使用子代理；子代理成本為 0。全部詞義判斷、修改與殘留核對由本線完成。

## 以後交接書該點名的工具

無。

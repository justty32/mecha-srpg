## 已讀清單

以下均由 cx-dl-05 親自讀過；AGENTS.md 實際讀取主 repo 指定絕對路徑，其餘相對路徑從隔離 worktree 讀取。

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

另讀：`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`，以及主 repo 的 `wf/workflows/dispatch/handoffs/lead-decide-land/b5/cx-dl-05.md`。

## 做了什麼

cx-dl-05 已逐檔讀完指定 48 個地點的敘述欄；改 27 檔、32 處，21 檔無需改。實際只動 summary、body、status2108。修正被動語序、主詞與動作不搭、長串定語、代詞錯指及敘述中的英文 rumor。未新增人物、事件或設定說明。

依 guide「第一輪退回的教訓」，保留候鳥號阿鏽「長出一點東西」、墳帶與菌絲的生長意象、冷硬短句及刻意比喻；基多既有「唯一接近 SS」照留，未擴寫。拉哥斯與孟買的「潮汐式地」改成「如潮水般」的中文句式，保留潮汐意象與出入往返，不改事件。

件數閘門：27 ≤ 48。單檔容量最大增幅 0.8551%（UTF-8 位元組，`content/lore/places/skagerrak-shell.json`），未超過 15%。未 commit，無新增或刪除內容檔，筆記與腳本均在 `/tmp/cx-dl-05/`。

產出：內容在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/codex-pilot/wt-dl-05/content/lore/places/`；報告為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-decide-land/b5/dl-05/REPORT.md`。報告目錄只寫本檔。

固定五條驗收：

1. `git status --short`：只有本批允許的 27 個地點檔為 M，另有開工前即存在的 `?? node_modules`；其餘無改動。
2. 本次執行 `npm run check` exit 0，主內容檢查 `OK 0 errors, 12 warnings`，營運檢查末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` exit 0，`errors=0 warnings=2`。警告指向未修改的 base 怪獸捕捉層 HP／數值帶／徒手機體等資料，以及 `events/busan-returned-seal.json`、`events/dark-quay-surety.json` 未列年表；未替它們修資料。
3. guide 六列裁示均在下節交代適用與保留理由；全 lore 的「精粹核」只剩 style.md 的原料用法，共 3 處，逐處列在「殘留」。
4. 下列逐檔對照涵蓋全部 48 檔；每處修改只列含改動的片段，未改檔標「無需改」。
5. 第一段已讀清單列出交接書「先讀」指定的全部 13 個路徑。

本次檢查完整輸出暫存 `/tmp/cx-dl-05/check.log`、`/tmp/cx-dl-05/lore-check.log`；改前／改後 grep 為 `/tmp/cx-dl-05/grep-before.txt`、`/tmp/cx-dl-05/grep-after.txt`。未跑 npm test、未追加其他驗收。

## 逐檔對照

### content/lore/places/accra.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/auckland.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/bay-tide-line.json

- `body`：「獸群沿孟加拉灣相連的河口與河道上溯」 → 「獸群沿著通向孟加拉灣的河口與河道上溯」

### content/lore/places/busan.json

- `body`：「城主之位是被推上去的，她更想跳舞。」 → 「她是被推上城主之位的，自己更想跳舞。」

### content/lore/places/chittagong.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/cold-tide-rift.json

- `status2108`：「每漲潮開一次自閉」 → 「每次漲潮開一次，隨後自行閉合」

### content/lore/places/dark-quay.json

- `body`：「塞勒涅公開列為敵人，私下靠它洗貨。」 → 「塞勒涅公開把它列為敵人，私下靠它洗貨。」

### content/lore/places/delta.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/dhaka.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/endymion-vault.json

- `body`：「任何人類員工的出入紀錄都不存在」 → 「沒有任何人類員工的出入紀錄」
- `body`：「這是 rumor。」 → 「這只是傳聞。」

### content/lore/places/ferry-lane.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/golmud-nest.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/graveyard-belt.json

- `body`：「第一個逃跑的機魂從月面測試場走」 → 「第一個逃跑的機魂離開月面測試場」

### content/lore/places/great-lakes-mycelium.json

- `summary`：「五大湖整片湖面被菌毯覆蓋的菌絲蝕域」 → 「菌毯覆滿五大湖湖面的菌絲蝕域」

### content/lore/places/green-line.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/gyeongju-tombs.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/hamburg.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/ice-shell.json

- `summary`：「2105 年大潮把它露了出來」 → 「2105 年大潮讓它露了出來」

### content/lore/places/istanbul.json

- `body`：「舊空軍的殘餘改成的傭兵空援公司」 → 「舊空軍餘部組成的傭兵空援公司」

### content/lore/places/lagos-blight.json

- `body`：「潮汐式地出去掠食又回來」 → 「如潮水般一波波出去掠食，再退回來」

### content/lore/places/mcmurdo-dump.json

- `body`：「大潮露出羅斯冰棚下的古代機」 → 「大潮讓羅斯冰棚下的古代機露了出來」

### content/lore/places/mexico-city.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/migrant-bird.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/montreal.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/moonbow.json

- `body`：「月弓是型錄編號的財產」 → 「月弓是編入型錄的財產」

### content/lore/places/mumbai-blight.json

- `body`：「潮汐式地出巢又回巢」 → 「如潮水般一波波出巢，再退回巢裡」

### content/lore/places/mumbai-gate.json

- `body`：「打贏解拘者可以接收牠們的獸」 → 「打贏解拘者可以接收他們的獸」

### content/lore/places/nairobi.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/old-array.json

- `body`：「站在古代機前獲得認主」 → 「站到古代機面前，古代機認了他」

### content/lore/places/quito.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/reed-marsh.json

- `body`：「「養裂」兩個字開始在孟加拉灣被小聲地講」 → 「孟加拉灣開始有人壓低聲音談「養裂」」

### content/lore/places/rhine-trench.json

- `body`：「散掉的獸族不繫、不餓死，是捕崖牙子群與掘犬的好地方」 → 「散掉的獸族不繫、也不會餓死，這裡是捕崖牙子群與掘犬的好地方」

### content/lore/places/ridge.json

- `body`：「把山脊列入探勘意向」 → 「有意探勘山脊」

### content/lore/places/rift-valley-seat.json

- `summary`：「恩凱在此出土、至今無人能認」 → 「恩凱在此出土，至今沒認過任何人」

### content/lore/places/ring-road.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/rotterdam-roost.json

- `body`：「有這種個性的機魂是 S 級以上才有的罕見事」 → 「有這種個性的機魂，只有 S 級以上才偶爾見得到」

### content/lore/places/saint-malo.json

- `body`：「沿九道拱門追壓撤離車隊」 → 「沿九道拱門緊追撤離車隊」

### content/lore/places/salt-flat.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/sao-paulo-blight.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/singapore.json

- `body`：「對每個獵團記帳到小數點後」 → 「每個獵團的帳都記到小數點後」

### content/lore/places/skagerrak-shell.json

- `summary`：「無人能認主，鹽鷗守著它」 → 「至今沒認過任何人，鹽鷗守著它」
- `summary`：「塞勒涅暗資的第三刃」 → 「塞勒涅暗中資助的第三刃」
- `body`：「大潮露出了脊」 → 「大潮讓它露出了脊」

### content/lore/places/surat.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/sydney.json

- `body`：「南方難民往奧克蘭去的人路過的最後一座大城」 → 「南方難民前往奧克蘭時路過的最後一座大城」
- `body`：「向基多授權生產的禿鷲」 → 「獲基多授權生產的禿鷲」

### content/lore/places/the-post.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/titicaca-ruin.json

- `body`：「發現者用安地斯的創世神給它取了名字」 → 「發現者用安地斯創世神的名字為它命名」

### content/lore/places/uluru-heart.json

無需改：敘述語序自然，保留原有意象與短句。

### content/lore/places/yakutsk-bed.json

- `summary`：「讓整個夏天的地面發光」 → 「讓地面在整個夏天發光」

### content/lore/places/yukon-shell.json

- `summary`：「至今沒人見過完整的它」 → 「至今沒人見過它的全貌」
- `body`：「有人說他是賣給稽古學會的同一份」 → 「有人說那就是他賣給稽古學會的那一份」

## 裁示對齊

- **機甲核心**：48 檔改前、改後皆無「精粹核」，沒有把成品誤稱原料的命中點，不補核心說明。全 lore 殘留僅 style.md 的原料定義與製成關係，見下節。
- **機魂能獨駕、成長慢**：表列 selene、tsai-mingzhu、unit-07、tide-line、first-registered-soul 均非本批。48 檔沒有「不能獨駕」「座艙裡一定要有人」主張；冰下古墟的「沒有人的古代機」是刻痕見聞，照留，不替未知古代機下解釋。
- **無人機只能普通開**：表列六個對象均非本批。本批 endymion-vault 的無人機出入、無人化研發，以及 moonbow 的無人維護機，均未寫核心招式或附魔；mumbai-gate 的鐵偶是宣言目標，不是守牆能力說明。因此不補設定句。
- **開機甲的人老得慢**：表列五名人物檔均不在本批；地點雖提到相關人物，guide 要求未點名檔不硬塞說明，故不添加外貌或年齡變化。
- **老爹身世（提案）**：old-man 非本批。busan、skagerrak-shell 雖寫老爹，並未交代其醒來經過，保持原敘述，不把提案移植進地點檔。
- **沐蝕會讀法（可選提案）**：tide-creed 非本批。mumbai-gate 等地的教團敘述不補「不老是蝕的恩賜」。

## 殘留

按交接書原命令，在改前、改後對整個 `content/lore` 執行 `git grep -nE '精粹核|獨駕|座艙裡一定|無人|鐵偶' -- content/lore`。以下逐一列改後命中行；長 body 只截取命中詞周邊的短片段，不傾印全文。

「精粹核」僅 3 處，全部保留：

- `content/lore/style.md:22` 第 1 處「精粹核**是原料」：原料定義。
- `content/lore/style.md:22` 第 2 處「人類拿精粹核做出**機甲核心」：原料製成機甲核心的關係。
- `content/lore/style.md:24`「機甲核心都是用精粹核做的」：再次說明製造原料，沒有把裝機成品叫精粹核。

本批其餘殘留（3 個命中行、4 處）：

- `content/lore/places/endymion-vault.json:14`「進穹頂的只有無人機與蔡明珠本人」：出入禁區的敘述，不涉及招式；同一行「靈目、無人化、魂核介面」：研發方向，不宣稱傳統 AI 能驅動核心。
- `content/lore/places/moonbow.json:14`「月弓由無人的維護機」：設備維護，不涉及機甲核心能力。
- `content/lore/places/mumbai-gate.json:15`「宣布鐵偶與機魂一律是『沒有肉的殼』」：先知的敵意宣言，保留事件原意，不視為客觀上兩者相同。

本批 rift-valley-seat 與 skagerrak-shell 的 summary 原有「無人能認／無人能認主」，此次為順清「古代機認人」的主詞改寫，改後不再命中；不是機魂獨駕問題。

範圍外的其餘命中行如下。保留理由首先是交接書明確禁止改寫這些路徑；下列另註該行命中語義。

- `content/lore/characters/glove.json:13`（2 處）：「…、白手套改用無人鐵偶之後，變得禮貌得可怕…」；「…手套改用無人鐵偶之後，變得禮貌得可怕。"…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/characters/glove.json:14`（8 處）：「…心、沒有魂的無人鐵偶，照術式催收，只打得…」；「…沒有魂的無人鐵偶，照術式催收，只打得了人…」；「…七號的魂搬進鐵偶，失敗且死了人。「七號拒…」；「…在地球催收。鐵偶播著手套錄下的聲音，從此…」；「…一個——某台鐵偶在月面野地或地球蝕線上失…」；「…白手套的無人鐵偶從不吼招式名，也不留…」；「…白手套的無人鐵偶從不吼招式名，也不留屍：…」；「…起帶走。所有鐵偶照同一套術式行動，像同一…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/characters/m3.json:14`（1 處）：「…造」，靈目、無人化、魂核介面全是從那台不…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/characters/park-incheol.json:13`（2 處）：「…有機甲核心的無人鐵偶，沒有魂、照術式走，…」；「…甲核心的無人鐵偶，沒有魂、照術式走，只打…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/characters/qin-wangshu.json:15`（1 處）：「…勒涅想要的是無人化：「人不該再為這件事死…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/characters/rosa-mendoza.json:13`（2 處）：「…甲核心的白色無人鐵偶，只打得了人，對獸無…」；「…心的白色無人鐵偶，只打得了人，對獸無效，…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/characters/samir-khan.json:14`（3 處）：「…核心的白手套鐵偶軍隊，他的話在城邦底層傳…」；「…言要信徒見到鐵偶與機魂，一律摧毀，機魂替…」；「…摧毀，機魂替鐵偶的罪挨刀。  ##…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/characters/tsai-mingzhu.json:12`（1 處）：「…勒涅走向全面無人化，卻始終造不出能複製的…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/characters/tsai-mingzhu.json:13`（5 處）：「…勒涅的靈目、無人化、魂核介面，全是從一具…」；「…機甲核心、能獨駕，卻成長很慢；遙控與傳統…」；「…有機甲核心的無人鐵偶，沒有魂，照術式走，…」；「…甲核心的無人鐵偶，沒有魂，照術式走，只打…」；「…控機。她說用鐵偶比讓人去鎮壓人更人道。地…」。機魂獨駕與成長的既有說明；若同列含鐵偶，為另述無魂機或歷史事件。
- `content/lore/characters/tsai-mingzhu.json:52`（1 處）：「…"無人化",…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/characters/unit-07.json:14`（2 處）：「…機甲核心、能獨駕，只是成長很慢。機魂多半…」；「…七號的魂搬進鐵偶，失敗且死了人。街頭傳的…」。機魂獨駕與成長的既有說明；若同列含鐵偶，為另述無魂機或歷史事件。
- `content/lore/characters/zheng-weizhou.json:12`（2 處）：「…製的魂，便用無人鐵偶組軍的人；他拿手套做…」；「…魂，便用無人鐵偶組軍的人；他拿手套做試驗…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/characters/zheng-weizhou.json:13`（5 處）：「…有機甲核心的無人鐵偶組成一支軍隊。同時，…」；「…甲核心的無人鐵偶組成一支軍隊。同時，他試…」；「…七號的魂搬進鐵偶，失敗且死了人；外頭卻傳…」；「…被複製。這些鐵偶沒有魂，照術式走，裡面沒…」；「…鎮壓、催收用鐵偶，守牆才派有核心的遙控機…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/eras/tide-line.json:7`（8 處）：「…機魂回家，鐵偶成軍  2104 年…」；「…機甲核心，能獨駕，只是成長很慢。「七號拒…」；「…照術式行動的無人鐵偶白手套鎮壓——白手套…」；「…式行動的無人鐵偶白手套鎮壓——白手套事變…」；「…七號的魂搬進鐵偶，失敗還死了人；沐蝕會同…」；「…肉者宣言」：鐵偶與機魂都是「無肉者」，見…」；「…一台，機魂替鐵偶的罪挨刀；逃離登錄的機魂…」；「…只打得了人的鐵偶軍隊、一個用天網連起來的…」。機魂獨駕與成長的既有說明；若同列含鐵偶，為另述無魂機或歷史事件。
- `content/lore/eras/yoke-years.json:7`（1 處）：「…造」：靈目、無人化、魂核介面全從它身上來…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/events/antarctic-shell.json:20`（1 處）：「…冰壁後，至今無人觸及。",…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/events/credit-accord.json:8`（2 處）：「…甲核心的白色無人鐵偶降落在一座拖欠會費三…」；「…心的白色無人鐵偶降落在一座拖欠會費三個蝕…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/first-registered-soul.json:8`（2 處）：「…只打得了人的無人鐵偶。七號讀過那一行字。…」；「…得了人的無人鐵偶。七號讀過那一行字。它的…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/fleshless-declaration.json:7`（1 處）：「…爾・卡恩宣布鐵偶與機魂一律是「沒有肉的軀…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/fleshless-declaration.json:8`（7 處）：「…，幾十台白色無人鐵偶做著同一個動作，播著…」；「…十台白色無人鐵偶做著同一個動作，播著同一…」；「…他把沒有魂的鐵偶與真正的機魂混為一談，只…」；「…們是神聖的。鐵偶與機魂一律是沒有肉的軀體…」；「…們。  鐵偶與機魂都被列為目標，沒有…」；「…護的機魂卻替鐵偶的罪挨了刀。地球上的獵團…」；「…束裝置，也毀鐵偶與魂核。獵團之間開始流傳…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/fleshless-declaration.json:21`（1 處）：「…"沐蝕會把鐵偶與機魂一律視為「沒有肉的…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/fleshless-declaration.json:23`（1 處）：「…束裝置擴大到鐵偶與魂核，獵團開始在遭遇解…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/golmud-split.json:8`（1 處）：「…月面的魂核與無人化、殘聯軍械庫的型錄與聯…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/events/hekate-secret.json:8`（1 處）：「…死」——全面無人化。稽古學會裡有人說，這…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/events/hekate-secret.json:23`（1 處）：「…蔡明珠走全面無人化路線是為了藏住一個人。…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/events/longspear-leak.json:8`（2 處）：「…有機甲核心的無人鐵偶。孟加拉灣上空遇到一…」；「…甲核心的無人鐵偶。孟加拉灣上空遇到一群順…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/longspear-leak.json:29`（2 處）：「…推進白手套的無人鐵偶路線。",…」；「…白手套的無人鐵偶路線。",…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/lunar-blockade.json:8`（1 處）：「…的靈目、全面無人化、魂核介面。塞勒涅的型…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/events/lunar-blockade.json:25`（1 處）：「…路線：靈目、無人化、魂核介面。",…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/events/nameless-founded.json:8`（1 處）：「…有魂的白手套鐵偶。沒有人問它們怎麼逃出來…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/rift-valley-dig.json:7`（1 處）：「…配機體、至今無人能認，但它的軛骨結構成了…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/events/rift-valley-dig.json:20`（1 處）：「…凱出土，至今無人能認主。",…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/events/skagerrak-shell-found.json:21`（1 處）：「…爾出土，至今無人能讓它認主。",…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/events/tranquility-strike.json:25`（1 處）：「…日後改讓無魂鐵偶照術式自行鎮壓，只打得了…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/whiteglove-incident.json:7`（3 處）：「…核心的白手套無人鐵偶鎮壓；塞勒涅同時試把…」；「…的白手套無人鐵偶鎮壓；塞勒涅同時試把七號…」；「…七號的魂搬進鐵偶，失敗且死了人，外頭卻傳…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/whiteglove-incident.json:8`（4 處）：「…七號的魂搬進鐵偶，沒有成功，卻死了人。\…」；「…有機甲核心的無人鐵偶：沒有魂，只照術式走…」；「…甲核心的無人鐵偶：沒有魂，只照術式走，便…」；「…被調去後勤，鐵偶開始自行執行鎮壓術式。\…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/whiteglove-incident.json:26`（2 處）：「…心、沒有魂的無人鐵偶鎮壓人群。",…」；「…沒有魂的無人鐵偶鎮壓人群。",…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/events/whiteglove-incident.json:27`（1 處）：「…七號的魂搬進鐵偶的試驗失敗且死了人，「七…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/anvil.json:78`（1 處）：「…的古代殘骸，無人能認；鐵砧從那條手臂仿造…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/factions/backside.json:18`（1 處）：「…報廢的女武神鐵偶骨架拼出來的 A 級「偷…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/backside.json:71`（1 處）：「…＋白手套報廢鐵偶骨架；能力「偷天換影」）…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/ground-union.json:17`（2 處）：「…照術式行動的鐵偶，一開口都是同一句「請確…」；「…壓他們的無魂鐵偶。",…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/ground-union.json:42`（1 處）：「…收機魂與鎮壓鐵偶混為一談，彼此保持距離。…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/nairobi.json:80`（1 處）：「…古代機，至今無人能認主；它的軛骨結構成了…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/factions/nameless-souls.json:27`（2 處）：「…無肉者宣言：鐵偶與機魂一律是沒有肉的殼，…」；「…一台；機魂替鐵偶的罪挨刀。"…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/nameless-souls.json:47`（2 處）：「…是追捕野魂的無人鐵偶；墳帶裡藏的是各自逃…」；「…捕野魂的無人鐵偶；墳帶裡藏的是各自逃離登…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/salt-gull.json:79`（1 處）：「…ne": "無人能認主的海洋古代機；鹽鷗…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/factions/selene.json:10`（1 處）：「…手套用無核心鐵偶鎮壓催收，有核心遙控機守…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/selene.json:19`（2 處）：「…有機甲核心的無人鐵偶準時收回一切。",…」；「…甲核心的無人鐵偶準時收回一切。",…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/selene.json:20`（8 處）：「…機甲核心、能獨駕，只是成長很慢。…」；「…座艙；無核心鐵偶只能對付人。有核心的遙控…」；「…的全是女武神鐵偶，沒有機甲核心、沒有魂，…」；「…工，鄭維舟把無人鐵偶編成一支軍隊，鎮壓得…」；「…鄭維舟把無人鐵偶編成一支軍隊，鎮壓得乾淨…」；「…仿造出靈目、無人化骨架，以及秦望舒晚年設…」；「…專用的女武神鐵偶（A），以及只賣給一個名…」；「…七號的魂搬進鐵偶，也失敗且死了人；外頭傳…」。機魂獨駕與成長的既有說明；若同列含鐵偶，為另述無魂機或歷史事件。
- `content/lore/factions/selene.json:75`（1 處）：「…後，沐蝕會對鐵偶與機魂一律見一台毀一台。…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/selene.json:110`（1 處）：「…"無人化"…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/factions/selene.json:125`（1 處）：「…仿造：靈目、無人化骨架、魂核介面；秘密的…」。無人化路線、設備或 tags 的既有用法，不是本批裁示修改點。
- `content/lore/factions/selene.json:130`（3 處）：「…，白手套專用無人鐵偶，無人版於 2106…」；「…手套專用無人鐵偶，無人版於 2106 年…」；「…用無人鐵偶，無人版於 2106 年正式入…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/tide-creed.json:18`（1 處）：「…你的拘束艙，鐵偶與機魂一律見一台毀一台。…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/tide-creed.json:19`（2 處）：「…無肉者宣言：鐵偶與機魂一律是「沒有肉的殼…」；「…機魂也因此替鐵偶的罪挨刀。  ##…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/tide-creed.json:34`（1 處）：「…後，塞勒涅的鐵偶與每一台機魂都是沐蝕會的…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/tide-creed.json:102`（1 處）：「…知自稱認主，無人見證）"…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/factions/unbinders.json:16`（1 處）：「…場、放獸，對鐵偶與機魂一律見一台毀一台。…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/unbinders.json:17`（2 處）：「…後多了一條：鐵偶與機魂一律，見一台毀一台…」；「…機魂也因此替鐵偶的罪挨刀。  代表作…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/whitegloves.json:10`（1 處）：「…: "女武神鐵偶數目不公布，沒有機甲核心…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/whitegloves.json:17`（2 處）：「…有機甲核心的無人鐵偶，守牆用有核心的遙控…」；「…甲核心的無人鐵偶，守牆用有核心的遙控機；…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/factions/whitegloves.json:18`（10 處）：「…、也沒有魂的無人鐵偶。守牆另派有核心的遙…」；「…沒有魂的無人鐵偶。守牆另派有核心的遙控機…」；「…招式與附魔。鐵偶對獸無效，碰上獸仍得靠僱…」；「…# 從人駕到無人  2098 年靜海…」；「…照術式行動的鐵偶編成一支軍隊。白手套事變…」；「…第二次罷工的鐵偶全都沒有魂，一開口都是同…」；「…此後白手套全無人化。  手套是塞勒涅…」；「…七號的魂搬進鐵偶也失敗且死了人；外頭卻傳…」；「…拒絕被複製。鐵偶只照術式走，沒有節點成長…」；「…錄的 A 級鐵偶，取名自希臘月神，白色鎧…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/places/farside-ruin-belt.json:15`（4 處）：「…核心的白手套鐵偶沿線巡邏，不鳴警告、不留…」；「…*。挖掘隊是無人的；看守是無人的；連運古…」；「…人的；看守是無人的；連運古代機的車都是無…」；「…代機的車都是無人的。蔡明珠的路線——「人…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/places/tranquility-city.json:17`（5 處）：「…有機甲核心的無人鐵偶，沒有魂、照術式走，…」；「…甲核心的無人鐵偶，沒有魂、照術式走，只打…」；「…第二次罷工被無人鐵偶白手套鎮壓，朴仁哲失…」；「…次罷工被無人鐵偶白手套鎮壓，朴仁哲失去一…」；「…七號的魂搬進鐵偶，失敗且死了人，外頭卻傳…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/style.md:56`（2 處）：「…不可複製、能獨駕但成長慢）、白手套（鐵偶…」；「…）、白手套（鐵偶與遙控機）、精粹改人（不…」。機魂獨駕與成長的既有說明；若同列含鐵偶，為另述無魂機或歷史事件。
- `content/lore/style/people.md:9`（3 處）：「…。**機魂能獨駕、成長慢**（2026-…」；「…，推翻「不能獨駕」）：它驅得動機甲核心，…」；「…動機甲核心，獨駕時是能打的新手，人＋機魂…」。機魂獨駕與成長的既有說明；若同列含鐵偶，為另述無魂機或歷史事件。
- `content/lore/style/people.md:11`（2 處）：「…有機甲核心的無人**鐵偶**（只打得了人…」；「…心的無人**鐵偶**（只打得了人，鎮壓與…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/timeline.json:382`（1 處）：「…"恩凱出土、無人能認；它的軛骨結構成了拘…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/timeline.json:816`（1 處）：「…「埃吉爾」，無人能認；鹽鷗嫁接殘片。",…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。
- `content/lore/timeline.json:1051`（3 處）：「…有機甲核心的無人鐵偶白手套鎮壓；它們照術…」；「…甲核心的無人鐵偶白手套鎮壓；它們照術式走…」；「…七號的魂搬進鐵偶，失敗死了人。外傳「七號…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/timeline.json:1067`（2 處）：「…"沐蝕會宣布鐵偶與機魂一律是沒有肉的軀體…」；「…一台；機魂替鐵偶的罪挨刀。",…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/timeline.json:1181`（1 處）：「…A 級型錄鐵偶，沒有機甲核心、沒有魂，…」。鐵偶、白手套、宣言或魂核事件的既有敘述，未屬本批改寫範圍。
- `content/lore/timeline.json:1688`（1 處）：「…複本；兩說都無人證實。",…」。「沒有人」的見證、觸及或認主用法，並非無人機能力。

## 需要決定的事

本批無阻塞，也無須補授權。有一處原文語義疑點保留供後續決定：`content/lore/places/montreal.json` 的「買座標」條寫「稽古學會賣遺跡座標，付得不多但從不賴帳」。前半是賣座標，後半卻像學會支付契約金；本批無法只靠潤飾確定付款方向，未擅改交易設定。這不是新增驗收條件。

## 子代理

未使用子代理；子代理成本為 0。48 檔與指定規矩均由本線親自閱讀，沒有委託摘要或第二輪代理驗收。品質取捨：只處理有明確語序或指涉問題的片段，21 檔直接保留。

## 以後交接書該點名的工具

無。

# 已讀清單

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

AGENTS.md 親自讀取主 repo 的 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘上述路徑均親自讀取本線隔離 worktree 版本，guide.md 全節已讀。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、inbox README／PROTOCOL，以及 world-pillars 的世界規則與機魂相關子頁。已用指定 tabledb 指令查新詞對照。

## 做了什麼

cx-wl-08 按 guide.md 修改 15 個允許的 lore 地點檔，只動 body 與 yukon-shell 的 summary；moonbow 無需改。抵抗性取代舊十分律、凡鐵砲名稱去除舊律，白手套改為無魂無人鐵偶，七號改為駕駛員倒下時接手一回合；例行蝕潮改為漲潮，殘翼口號與空援券對齊定版。沒有 commit。

件數 15，未超過 16；編輯時逐檔計算 UTF-8 位元組增幅，最大為 tranquility-city 的 +4.52%，未達 30%。臨時腳本與完整工具輸出只放 `/tmp/cx-wl-08/`，報告目錄僅交付 REPORT.md。

固定五條驗收結果：

1. `git status --short` 只列允許清單內 15 個修改檔，另有交接書允許排除的 `?? node_modules`。沒有其他工作樹改動。
2. 本次 `npm run check` 主載入器為 `OK 0 errors, 12 warnings`，末行為 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` 為 `errors=0 warnings=2`。警告涉及未修改的 base 資料及 events/busan-returned-seal、events/dark-quay-surety 未入年表。輸出保存在 `/tmp/cx-wl-08/check.log`、`/tmp/cx-wl-08/lore-check.log`。
3. 已執行指定的全 content `git grep -nE '十分|複本|獨駕|白手套|租|大潮' -- content`，並逐檔閱讀本批命中。16 檔沒有「十分律」「十分之一」「十分之一也是火」「複本」「獨駕」或例行「每個大潮」；剩餘命中逐處列於下文。
4. 下列 16 檔均有逐檔對照或無需改理由。
5. 第一段已讀清單列出交接書「先讀」的全部 11 個路徑。

## 逐檔對照

所有路徑均位於 worktree 的 `content/lore/places/`。以下只取含改動的片段。

### moonbow.json

無需改。「機甲會被白手套『請確認來意』」只是對來客的攔查，沒有說白手套是機甲、機魂複本或能殺獸；符合 glove 可保留的點名情境。

### mumbai-blight.json

- 「各國用掉半數鐵翼庫存轟炸孟買，裂獸照樣擴張。」 → 「各國鐵翼開始轟炸孟買，裂獸照樣擴張。」。
- 「2089-05 十分律」 → 「2089-05 抗性之證」。
- 「算出「十分之一」」 → 「已用掉半數庫存……記下：凡鐵只刮得動外甲，碰不到核」。

### quito.json

- 「身邊一格十分律失效」 → 「身邊一格抵抗性失效」。

### reed-marsh.json

- 「有人每個大潮去收子體來賣」 → 「有人每個漲潮去收子體來賣」。
- 「每個大潮穩定的 D 子體」 → 「每個漲潮穩定的 D 子體」。

### rhine-trench.json

- 「大潮時直接從裂縫過來」 → 「漲潮時直接從裂縫過來」。
- 「要在蝕溝活過一個大潮」 → 「要在蝕溝活過一個漲潮」。

### ring-road.json

- 「一門十分律砲」 → 「一門凡鐵砲」。

### sao-paulo-blight.json

- 「蝕域每個大潮往外推一點」 → 「蝕域每個漲潮往外推一點」。
- 「用掉半數庫存轟孟買與聖保羅」 → 「開始轟孟買與聖保羅」。
- 「十分律是在這裡被證明的」 → 「次月用掉半數庫存，才證實凡鐵只刮得動外甲、碰不到核」。
- 「大潮後的外圍常有被自己人踩死的獸」 → 「漲潮後的外圍常有被自己人踩死的獸」。

### singapore.json

- 「裂晶價格每個大潮跳一次」 → 「裂晶價格每個漲潮跳一次」。

### skagerrak-shell.json

- 「每個大潮吐出幾隻會游的獸」 → 「每個漲潮吐出幾隻會游的獸」。
- 「一個一個在大潮之夜站到它面前」 → 「一個一個在漲潮之夜站到它面前」。
- 「任何人都可以在大潮之夜划小船」 → 「任何人都可以在漲潮之夜划小船」。

### sydney.json

- 「兩排十分律砲台」 → 「兩排凡鐵砲台」。

### the-post.json

- 「從上面看大潮前地殼的光」 → 「從上面看漲潮前地殼的光」。

### titicaca-ruin.json

- 「每個大潮之夜，都有人划船」 → 「每個漲潮之夜，都有人划船」。

### tranquility-city.json

- 「白手套整夜巡邏，起手式永遠是「請確認償還意願」」 → 「白手套整夜巡邏，照術式催問「請確認償還意願」」。
- 「全機魂獨駕」 → 「全是沒有精粹核的無人鐵偶，沒有魂、照術式走，只打得了人」。
- 「七號自己把機甲開回靜海港。」 → 「駕駛員倒下時，七號接手一回合，把機甲帶回靜海港。」。
- 「全機魂獨駕的白手套」 → 「無人鐵偶白手套」。
- 「手套被複製成軍，七號拒絕」 → 「手套是信貸部唯一的催收機魂，七號拒絕參與鎮壓」。

### uluru-heart.json

- 「大潮前一夜，脊旁邊的沙是溫的」 → 「漲潮前一夜，脊旁邊的沙是溫的」。
- 「每個大潮，都有人說那道脊」 → 「每個漲潮，都有人說那道脊」。

### yakutsk-bed.json

- 「牠每個大潮固定往外蝕兩區」 → 「牠每個漲潮固定往外蝕兩區」。
- 「十分之一的火也是火——燒過的地方退一區」 → 「「甲歸我們破，命歸你們收。」燒過的地方退一區」。
- 「每一張燒季的空援券背面」 → 「燒季的空援券一券一發精粹矢，昂貴、破甲，不保證收命；每張背面」。

### yukon-shell.json

- 「大潮時露出一角又埋回去」 → 「漲潮時露出一角又埋回去」。
- 「在某幾個大潮之夜會」 → 「在某幾個漲潮之夜會」。
- 「在大潮之夜帶著補給去凍土上等」 → 「在漲潮之夜帶著補給去凍土上等」。

## 殘留

範圍是本批 16 檔。全 content grep 的批外命中沒有改動，也不以本線成果宣稱全庫完成；完整輸出只留 `/tmp/cx-wl-08/residuals.txt`。

- moonbow.json body「白手套『請確認來意』」：對未經許可來客的攔查；glove 明定可保留點名。
- skagerrak-shell.json body「退大潮的夜裡，海面會讓出」：海水退去、露出背脊的海洋本義，依 tide 與 terms-rename 保留。
- skagerrak-shell.json body「2102……大潮露出了脊」：單一具體古代機出土事件，依 tide 保留。
- titicaca-ruin.json body「伊內絲……在大潮之夜……它認了她」：2092 年具體認主夜，湖面整夜發亮，依 tide 保留。
- tranquility-city.json body「白手套整夜巡邏」：已寫成照術式催問，不再將每個鐵偶寫成有起手式的人格機魂。
- tranquility-city.json body「保全白手套」：同句明定沒有精粹核、無魂、只打得了人，符合 glove。
- tranquility-city.json body「2098……白手套原型鎮壓」：原型對人鎮壓，符合 glove，保留歷史。
- tranquility-city.json body「2105 白手套事變」及「無人鐵偶白手套鎮壓」：事件名與對人鎮壓，保留；已移除複製與獨駕描述。
- tranquility-city.json tags「白手套」：中文勢力標籤，沒有設定衝突。
- uluru-heart.json summary「大潮時露出一道像蛇的脊」：摘要對應 body 的 2105 年首次露脊，並非例行反覆露出，依 tide 保留。
- uluru-heart.json body「2105 年某個大潮之夜」：單一古代機出土夜，依 tide 保留；前夜沙溫及每潮多露一點的例行觀察已改漲潮。

本批無「租」「複本」「獨駕」「十分」殘留。育空三處未指明單一歷史夜、屬反覆露出與等待窗口，按 tide「拿不準就改漲潮」處理；斯卡蓋拉克重複嘗試認主亦照例行潮改漲潮，不替未定的認主規則增加限制。

## 沒做到或證據不足的

無任務內未完成項。只跑交接書指定的兩個檢查，未跑 npm test、MCP、額外驗收。檢查警告如上，沒有零警告的宣稱；本線不判定批外改寫是否完成。

## 需要決定的事

無需新增裁示，無自擬人物或改寫傳聞來源。孟買與聖保羅原有「2089-04 鐵翼之月」標題保留；四月寫開始轟炸，半數庫存用盡與抵抗性證實落在五月（孟買的既有 2089-05 條目、聖保羅的「次月」）。因此不需要改日期數字或結構。斯卡蓋拉克例行認主窗口按 guide.md 改漲潮，未替使用者定案古代機認主是否只限大潮。

## 子代理

未使用子代理；成本為 0 個子代理、0 次委派。全部閱讀、改寫與逐檔判斷由 cx-wl-08 親自完成，品質證據為上述固定驗收與逐檔對照；沒有另加代理審查。

## 以後交接書該點名的工具

無。

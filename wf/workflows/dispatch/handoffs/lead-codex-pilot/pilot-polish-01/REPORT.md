# 已讀清單

以下均親自讀取；相對路徑以指定隔離 worktree 為基準。資料表透過 `wf/tools/tabledb.py` 查閱相關列／欄位，未直接整份載入。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/tools/stats.ts`
- `content/lore/glossary.json`
- `wf/WAIT_USER.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/inbox/README.md`
- `wf/workflows/inbox/PROTOCOL.md`
- `wf/workflows/dispatch/lessons.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/cx-pilot-polish.md`
- `content/base/world/events/restraint-night-knocks.json`
- `content/base/world/events/ship-stowaway.json`
- `content/base/world/events/ship-helium-leak.json`
- `content/base/world/events/ship-letter-receipt.json`
- `content/base/world/events/ship-locker-debt.json`
- `content/base/world/events/ship-locker-letter.json`
- `content/base/world/events/ship-tide-stew.json`
- `content/base/world/events/soul-log-address.json`
- `content/base/world/events/soul-log-echo.json`
- `content/base/world/events/soul-night-hum.json`
- `content/base/world/events/soul-stray-log.json`
- `content/base/world/events/route-tide-storm.json`

資料表查閱範圍：numeric-bands 的營運兩列；engine-facts 的 EF-03、EF-20、EF-21；templates 的營運事件等匹配列；ability-forms 的欄位與維持／被動列；playtest-baselines 的營運列；glossary 的機魂、天網、殼、燼、流光相關列。

## 做了什麼

cx-pilot-polish／pilot-polish-01 第二次派出。僅修改指定十份事件的 `text` 與部分 `choices[].text`，共 26 處字串；保留原意、事件分支及選項動作。不 commit。

### ship-helium-leak

改前生硬處：末句「表示醫官不推薦」像轉述報告，笑點繞一層；選項「記下夾住的邊縫」缺明確位置。

修改：把醫官撤回建議改成短對白，保留漏氦、憋氣與補片的笑點，說清記錄邊縫位置的動作。

### ship-letter-receipt

改前生硬處：「封面」「前任置物櫃裡一樣」指涉不夠順；第一選項連寫兩個動作。

修改：理順信封長明燈的指涉，把廚子的留燈詢問改成對白，簡化寄乾糧的選項。

### ship-locker-debt

改前生硬處：「一張畫歪的船」量詞與物件混用；「把玩笑收回嘴裡」略刻意。

修改：修正畫作的量詞，用修屋頂的欠款說清欠條，將收回玩笑改為技師停下玩笑、壓平紙角。

### ship-locker-letter

改前生硬處：「潮氣把欠條黏成了一塊」偏硬；技師對白可收短，保留拆鎖與守秘密的工錢笑點。

修改：把欠條受潮寫成可見的黏連動作，縮短技師談拆鎖與守秘密的對白。

### ship-tide-stew

改前生硬處：開鍋與端菜連在一起稍擠；結尾兩張紙背面同一張欠條，畫面關係不清；選項缺停頓。

修改：接順掀蓋、菜名與醫囑笑話，用兩張紙拼成欠條釐清結尾畫面，替選項加上自然停頓。

### soul-log-address

改前生硬處：末句用冒號替刪字動作解說；「刻回的歸途」可以用航線說清。

修改：將歸途落到舊航線，把身分未明的資訊移到刪字前，結尾停在技師劃掉「人」字的動作。

### soul-log-echo

改前生硬處：「每逢」「停止重讀」像操作描述；結尾直接講解機魂設定，應把疑慮交給技師並收在空椅。

修改：將一般機魂與野魂殘跡的疑慮放進技師的話與動作，最後收在停止震動、無人落座的空椅。

### soul-night-hum

改前生硬處：「例行待命」「這個說法記在問號後面」略公文化；第二選項「值班者睡好」可順成換班後的休息。

修改：順寫待命、低鳴與條款的關係，把唱歌猜測寫成異常簿上帶問號的筆記，保留未證實性。

### soul-stray-log

改前生硬處：「例行抄錄裡」「交叉核對」偏文書腔；末句可化為技師短對白，保留痕跡不屬複本的發現。

修改：改順抄錄與發現陌生紀錄的動作，讓技師直接說明紀錄不屬這份複本，簡化核對航圖選項。

### route-tide-storm

改前生硬處：開頭堆疊航標、風暴、船三個主體；對白略長，選項連續動作可加停頓。

修改：拆開航標與風暴的長句，讓技師邊踩住圖紙邊提醒別急開工，保留原來的船魂笑話。

## 產出

文案位於指定 worktree 的 `content/base/world/events/`；以下各檔均附 `text` 全文舊→新與實際變動的選項。

### content/base/world/events/ship-helium-leak.json

text 舊：

> 你走過氣囊下方，聽見細長的嘶聲，像候鳥號在替帳本嘆氣。技師已把鬆脫的邊縫夾住，手上還捏著補片。「也可以全船一起憋氣。」廚子說。你看著他；他把補片接過去，表示醫官不推薦剛才的療法。

text 新：

> 你走過氣囊下方，細細的嘶聲從頭頂漏下，像候鳥號在替帳本嘆氣。技師夾住鬆開的邊縫，手裡捏著補片。「也可以全船一起憋氣。」廚子說。你看他一眼，他便接過補片：「醫官收回剛才的建議。」

`choices[0].text`：先記下夾住的邊縫 → 先記下夾住邊縫的位置

檔案容量：1435 → 1438 bytes（+0.21%）。

### content/base/world/events/ship-letter-receipt.json

text 舊：

> 你收到港口小屋的回信，封面畫著和前任置物櫃裡一樣的長明燈。信裡沒有問他什麼時候回來，只說孩子們終於知道那張船畫是寄給誰的。廚子把信放到酒艙牆上，避開潮斑，問今晚要不要留盞燈。

text 新：

> 你收到港口小屋的回信，信封上也畫著長明燈，和前任團長留下的那封一樣。信裡沒問他何時回來，只說孩子們終於知道，那幅船畫是寄給誰的。廚子避開酒艙牆上的潮斑，把信貼了上去，回頭問你：「今晚要不要留盞燈？」

`choices[0].text`：把回信貼好留燈到交班 → 貼好回信，留燈到交班

`choices[1].text`：添些乾糧隨覆信寄回 → 回信時捎上些乾糧

檔案容量：1946 → 1979 bytes（+1.70%）。

### content/base/world/events/ship-locker-debt.json

text 舊：

> 你從信封裡抽出一張畫歪的船，背面寫著「等海安靜就回來」。收信處是一間替獵團照看遺屬的港口小屋。欠條倒寫得清清楚楚：賒的是屋頂，不是酒。技師把玩笑收回嘴裡，替你壓平紙角。

text 新：

> 你從信封裡抽出一幅畫，船畫得歪歪斜斜，背面寫著「等海安靜就回來」。收信地址是港口的一間小屋，替獵團照看遺屬。欠條倒寫得清楚，欠的是修屋頂的錢，不是酒錢。技師沒再開玩笑，伸手替你壓平紙角。

`choices[1].text`：連補屋頂的錢一起寄 → 把補屋頂的錢一起寄去

檔案容量：1173 → 1203 bytes（+2.56%）。

### content/base/world/events/ship-locker-letter.json

text 舊：

> 你拉開前任團長留下的置物櫃，潮氣把欠條黏成了一塊。最裡面卻有封乾燥的信，沒有署名，只畫著港口的長明燈。技師拿著剪鉗等你開口：「拆鎖不算工錢，替死人守秘密另計。」

text 新：

> 你拉開前任團長留下的置物櫃，欠條受了潮，一張張黏在一起。櫃子深處卻藏著一封乾燥的信，沒有署名，只畫著港口的長明燈。技師握著剪鉗，等你開口：「拆鎖免費，替死人守秘密另算。」

`choices[0].text`：攤開信封看看地址 → 攤開信封，看看地址

檔案容量：1829 → 1847 bytes（+0.98%）。

### content/base/world/events/ship-tide-stew.json

text 舊：

> 你掀開鍋蓋，廚子兼醫官端出「潮汐燉菜」：菜葉像蝕線，油花像裂縫。他還記得那個把空碗當行李的孩子，於是宣布今晚不准拿飯打賭。有人問這算醫囑還是菜單；他把兩張紙翻過來，背面是同一張欠條。

text 新：

> 你掀開鍋蓋，菜葉浮成蝕線，油花散成裂縫，廚子兼醫官管這叫「潮汐燉菜」。他還惦記著那個拿空碗當行李的孩子，宣布今晚不准拿飯打賭。「這算醫囑，還是菜單？」有人問。他把兩張紙翻過來，拼成一張欠條。

`choices[0].text`：照常分飯聽完菜名 → 照常分飯，聽他報完菜名

`choices[1].text`：添香料讓菜配得上名字 → 添點香料，讓菜配得上名字

檔案容量：1510 → 1537 bytes（+1.79%）。

### content/base/world/events/soul-log-address.json

text 舊：

> 你沿著舊航圖找到那扇門的位置，如今只是一片蝕域。紀錄裡沒有求救者的名字，只有被抹去又刻回的歸途。技師把「想回家的人」寫進備註，隨即劃掉「人」字：你們還不知道這究竟是誰留下的。

text 新：

> 你循著舊航圖找到那扇門的位置，那裡如今只剩一片蝕域。紀錄沒留下求救者的名字，回家的航線卻抹了又刻，仍辨不出是誰留下的。技師在備註寫下「想回家的人」，筆尖停了停，又把「人」字劃掉。

`choices[0].text`：保留座標並註明未證實 → 留下座標，註明尚未證實

`choices[1].text`：付費封存一份岸上副卷 → 付錢在岸上封存一份副卷

檔案容量：1121 → 1133 bytes（+1.07%）。

### content/base/world/events/soul-log-echo.json

text 舊：

> 你看著技師重讀那段回航紀錄。每逢「門別關」，魂核架下的空椅就輕輕一震；停止重讀，震動便消失。沒有人坐上去。一般機魂不會這樣留話，野魂的殘跡卻可能藏在任何一次舊刻裡。

text 新：

> 你看著技師重讀回航紀錄，讀到「門別關」，魂核架下的空椅便輕輕一震。「一般機魂不會這樣留話。」他翻找舊刻，懷疑裡頭藏著野魂的殘跡。重讀一停，椅子也跟著靜了，誰都沒有坐上去。

`choices[1].text`：添隔片後再追查來處 → 加上隔片，再查紀錄的來處

檔案容量：1064 → 1082 bytes（+1.69%）。

### content/base/world/events/soul-night-hum.json

text 舊：

> 你值夜時又聽見魂核低鳴，節奏與封存的回航紀錄相同。終端卻只顯示例行待命，連停頓都照著租賃條款走。值班的人問是不是它在唱歌。你翻開異常簿，把這個說法記在問號後面。

text 新：

> 你值夜時又聽見魂核低鳴，節奏和封存的回航紀錄一模一樣。終端仍顯示待命，連停頓都和租賃條款寫的一樣。「它是在唱歌嗎？」值班的人問。你翻開異常簿，寫下「唱歌」，又在旁邊添了個問號。

`choices[0].text`：記下低鳴等天亮再說 → 記下低鳴，等天亮再說

`choices[1].text`：買隔音襯讓值班者睡好 → 買隔音襯，讓值班的人睡個好覺

檔案容量：1563 → 1602 bytes（+2.50%）。

### content/base/world/events/soul-stray-log.json

text 舊：

> 你在租賃魂核的例行抄錄裡看見一段陌生的回航紀錄。航線穿過早已淪陷的燈塔，末尾只剩「門別關」。終端照常念完待命條款，沒有語氣。技師指著空白的登錄欄：這段痕跡不屬於這份複本。

text 新：

> 你照例抄錄租賃魂核，卻翻出一段陌生的回航紀錄。航線經過早已淪陷的燈塔，末尾只留著「門別關」。終端照常念完待命條款，聲調沒有半點起伏。技師指著空白的登錄欄：「這段紀錄不是這份複本的。」

`choices[0].text`：封存異常紀錄待查 → 封存異常紀錄，留待追查

`choices[1].text`：買份舊航圖交叉核對 → 買份舊航圖，核對航線

檔案容量：1745 → 1775 bytes（+1.72%）。

### content/base/world/events/route-tide-storm.json

text 舊：

> 你眼前的航標忽然全向上漂，源潮風暴把候鳥號推離雲道，又吐回舊航標旁。浮芯在艙底亮得像一輪月。技師用靴子壓住亂飛的圖紙：「船回來了，魂還在路上，別急著開工。」

text 新：

> 你眼前的航標忽然齊齊往上漂。源潮風暴把候鳥號推離雲道，又吐回舊航標旁。艙底的浮芯亮得像一輪月，圖紙飛得到處都是。「船回來了，魂還在路上。」技師用靴子踩住一張圖紙，又說：「別急著開工。」

`choices[0].text`：扶正航圖等光退去 → 扶正航圖，等光退去

`choices[1].text`：拆廢料架收集潮紋 → 拆下廢料架，收集潮紋

檔案容量：1299 → 1350 bytes（+3.93%）。

### 固定四條驗收

1. `git -C . status --short`：只有指定十檔為 ` M`，另有交接書容許、開場即存在的 `?? node_modules`。`git -C . diff --stat` 為 `10 files changed, 26 insertions(+), 26 deletions(-)`。件數與容量 gate 未觸發；最大增幅 3.93%。

```text
 M content/base/world/events/route-tide-storm.json
 M content/base/world/events/ship-helium-leak.json
 M content/base/world/events/ship-letter-receipt.json
 M content/base/world/events/ship-locker-debt.json
 M content/base/world/events/ship-locker-letter.json
 M content/base/world/events/ship-tide-stew.json
 M content/base/world/events/soul-log-address.json
 M content/base/world/events/soul-log-echo.json
 M content/base/world/events/soul-night-hum.json
 M content/base/world/events/soul-stray-log.json
?? node_modules
```

2. 兩項檢查皆 exit 0；實際末行如下（保留 warning 數，不把輸出截短冒充無警告）：

```text
npm run check
OK 0 errors, 12 warnings
node src/ops/content/check.ts content/base
OK 0 errors, 8 warnings
```

3. 指定禁用詞 grep 對十檔 0 命中，stdout 空、exit 1（grep 的無命中狀態）；逐檔舊→新對照見上文。

```sh
grep -rn '電磁\|口徑\|毫米\|電池\|雷達\|衛星\|飛彈\|坦克\|戰鬥機' content/base/world/events/{ship-helium-leak,ship-letter-receipt,ship-locker-debt,ship-locker-letter,ship-tide-stew,soul-log-address,soul-log-echo,soul-night-hum,soul-stray-log,route-tide-storm}.json
```

4. 本報告第一段「已讀清單」列出交接書「先讀」行的全部十一個路徑，並列出其餘親自查閱的檔案。

本輪檢查原始輸出：`/tmp/cx-pilot-polish/check.log`、`/tmp/cx-pilot-polish/ops-check.log`、`/tmp/cx-pilot-polish/forbidden.log`、`/tmp/cx-pilot-polish/status.log`。

## 沒做到或證據不足的

無未完成的本批工作。依交接書固定四條驗收，未加跑測試、型別檢查、模擬、試玩、黃金 hash 或 wf-lint；欄位級閘門由上游驗收，本報告不宣稱已執行該閘門。兩項檢查有範圍外警告，並非零警告。

## 需要決定的事

檢查指出範圍外資料問題，未修改：八份 monster 的捕捉層 HP 差異；`effects/mx-faded.json` 閃避值 25 超過 22；`species/tidewolf.json` 本能池缺少超上限帶；`abilities/kx-tide-crush.json` 傷害 28 超過 26；`frames/infantry.json` 缺預設配裝與內建攻擊。是否另派線處理交由上游決定，不影響本批 0 errors 的驗收結果。

## 子代理

開啟 0 個；由本線親自閱讀、改稿與審閱。無子代理模型、產出修改比例、品質或 token 成本可比較。

## 以後交接書該點名的工具

無。

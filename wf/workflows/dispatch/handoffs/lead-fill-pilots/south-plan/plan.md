# 南亞可招募駕駛員與船員計畫（提案）

## 1. 已讀清單

親自讀過下列交接書指定路徑；相對路徑以 /home/lorkhan/repo/game_dev/mecha-srpg/ 為根。三個範本目錄分別讀了4個池、13個背景、38個person全檔，包含human與soul結構，新增只用human。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`

另讀：wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、兩封開場inbox進度信、wf/workflows/common/data-files.md、wf/workflows/dispatch/README.md、wf/workflows/content/world-pillars.md、wf/tools/brief_lint.py、指定cx-kj2-01.md骨架與kaiju2-01.json結構；以tabledb查索引、history-nodes，並讀所用地方／勢力、既有人物與effect範本。只讀信、不回信；不寫SESSION-LOG或ROSTER，遵守本線限定寫入範圍。

## 2. 盤點

全庫快照：38個person、13背景、4池、89個lore人物。按「池掛本區八個base地點，沿sources→背景→human person」計，本區是9人、9背景、3池；它是可玩覆蓋口徑，不冒稱9人皆南亞出生。達卡1人、吉大港4人、蘆葦澤4人，其餘五處都是0。達卡舊池size=4只有一個來源，最多仍抽1人；吉大港4抽4沒有季節組合變化，蘆葦澤4抽3才有替換。

名單與證據已抽到 [inventory.json](inventory.json)：9條招募鏈、2個未接池的本區原籍person、14處lore地方、14個勢力與26名既有lore人物（含往來者、領袖、魂及已故者）。每個地方／勢力列目前可雇用人數與id；0不是沒有故事，而是沒有可招募鏈。地方以池實際停靠位置計，勢力以人物lore、背景名或tags的出身關係計，兩者不可相加。本區地域外的關聯地點（漢堡、鹿特丹等）不列為南亞招募據點。

9名可雇用者是陳小海、米塔莉、薩利姆、娜迪雅、林照生、科喬、法麗達、橘伊吹、優素福。它們中只有陳小海有同名lore；其餘8名既有person缺lore的工作不在本輪新增套件範圍。南亞原籍的安賈莉・奈爾與阿倫・維蘭已有person但沒有背景、沒有池、也沒有同名lore，不另造同人分身。可直接掛連的既有人物包括公會長法蒂瑪、補帆師羅凱婭、米拉、鐵嘴、阿尼爾、哈米德、努爾、德維卡、先知與無軛的阿依莎；候鳥號、鐵砧、鹽鷗的26名區域關聯人物完整列於資料表，保留原有主從與生死狀態。

本輪選26組＝26背景＋26person＋26lore人物，三類合計78件；另12新池，content總計90檔。新池加上既有池後：達卡3池、吉大港3池、三角洲2池、蘆葦澤2池、孟買2池、舊陣列1池、北方山脊1池、鹽灘1池。各池互不共用新背景或新person，避開跨池候選殘留造成的順序偏差。

地名沿既有資料：交接書的蘆葦沼用lore「蘆葦澤」、鹽原用lore「鹽灘」。base有place/mumbai，lore沒有同名檔；孟買人物掛既有place/mumbai-gate，保留蘇拉特作歸還黨總部，不憑空新增安全孟買城。野地招募是過路船與短停整備，沒有常駐營地或城邦升格。

## 3. 設計理念

南亞的人從一項能做的工作站起來：駕機替屋頂承重、把卡死的機掌打開、讓最後一船過河。獸以礦化樹根、節肢刮泥與裂晶餘光進畫面，不替牠安排人類的臉。每人都留一句能喊出的話，喊完仍要面對有限的糧、疲倦與要教下一人的手藝。崩前成人記得供應鏈完整時的工廠與渡船，幼兒只能保留片段，崩後學徒不借來一份自己沒活過的記憶。二十出頭到五十多歲撐住人群，十六至十九歲只留一名有明確倖存原因的醫護徒。兩位不老老手與兩位真正老去的船員並列，讓核心的影響看得見而不變成人人的特權。地方與勢力是角色願意短雇上船的前因，既有戰役的勝負與主角位置都不改。

每件先掛既有節點 N01–N10、主線 A–H、年表條目或崩年底色；本批依 people.hook，不為掛點創造新史事。每個 lore 的 places／faction 必指既有地方與勢力。少寫帳務法理，多寫人、畫面、獸、神話的光；每人有站起來的瞬間與一句能吼出的話，角色知道誇張仍照樣吼。「地契押給月亮」「商團出糧傭兵守港」不再用；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈，每種全計畫核心畫面最多一件，本案均未選作核心。

不拿其他作品類比；中文命名先想原意，不直譯；不用真實歷史人名，姓名用常見構詞自創。古代機本體叫古代機、外層叫裝甲；世界觀潮詞改蝕，遵守 style.md。新專名在審查資料標「（提案）」，遊戲name依people.name；不另創招式/effect來兌現角色口號。

國家、塞勒涅、巨頭只削弱不萬能。古代機與S級高高在上，不寫被打倒、操縱或交易，不預決認主，S領主不出場。獸無臉、不是畜牲；不寫馴養、餵食或低階二名。既有裁示不推翻，矛盾記REPORT「需要決定」。真相以visibility／secrets分可見度；本案全為public見證，不證實蘆葦養裂、北脊藏機或迦梨真相。

不做萬潮葬王相關、AI/aiprofiles、新effect、數值平衡、src、specs、design-notes、刪檔、依賴安裝、push、建分支。本輪26組、每批不超過12組與42檔；26人全為human，16–19歲1人（3.85%），老手僅2人。方法與基調另遵循 wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md 第3–4點；其深填線事件件數要求不擴張本線範圍。

## 4. 人物表與年齡分布

人物表已抽到 [people.json](people.json)，26列，每列含id、中文名、性別、age、born、老手activeYears、出身前後、性格、瞬間、招牌話、職能、attrs、levelDice、既有effect、tags、culture、背景名／id、hireFee／wageMult、地方／勢力／hook與池。personSpec、backgroundSpec是可直接照寫的全欄規格；bodyPoints為第6段的三段要點；batch為第8段的切分鍵。名字均為提案，英文用常見姓名構詞自行組合，不取歷史人物。跨區占名已寫 [names-claimed.json](names-claimed.json)。

數值沿用hana-sato、irina-sokolova及既有同職能person；費率與attrRanges逐列標出既有背景來源。attrs是範本值，招募實例會被attrRanges覆寫列出的屬性；不把紙面attrs誤當招募固定值。背景traits空、person帶指定特質，避免同一效果的雙重表意。perks空，沒有新增能力或effect，口號不是新的戰鬥招式。暫值只做同級套用，不調平衡。

文化全部使用已存在的bengal名表桶，包含印度西岸與錫蘭出身；這是目前資料容量，不是宣告族裔相同。技師、醫護、導航、砲手、廚務與學徒透過tags及lore表達；已核既有technician/pilot/researcher，medic/navigator/gunner/cook/crew/apprentice是描述tag，沒有新引擎效用。沒有真實獨立船員職類或禁駕旗標；cmdHire預設employment.role=pilot，故「非駕駛」是人物設定，不能聲稱已限制玩家入座。此缺口交第7段。

五歲一組直方圖（26人）：

```text
10–14歲  █ 1
15–19歲  █ 1
20–24歲  █████ 5
25–29歲  ████ 4
30–34歲  ███ 3
35–39歲  ███ 3
40–44歲  ██ 2
45–49歲  ██ 2
50–54歲  ██ 2
55–59歲  █ 1
60–64歲  ██ 2
```

16–19歲只有蘇哈斯19歲，1/26＝3.85% ≤ 5%；2089出生、孕婦先避往內陸親族家且有自存糧，後靠難民灶續命，不推廣成普遍生存公式。14歲阿爾皮塔是船修學徒，19歲蘇哈斯是醫護徒，兩人皆不寫成駕駛；其中14歲者出生2094，對崩前全無記憶。61歲比馬爾、63歲帕德瑪未駕核心，正常老去。兩名老手：塔赫米娜42歲／activeYears17（2091起，外貌約29.25）；蘇莉雅39歲／16（2092起，外貌約27），均hireFee850／wageMult1.6，各只入一池。機械系無變異；其餘駕駛是近年才轉職或取得獨駕資格，不把未填年資寫成十多年老手。

## 5. 招募池表與每季可玩感

完整12列見 [pools.json](pools.json)：id、base place、size、主題、全部背景＋權重、refreshOn、batch及組合說明。兩個三來源工棚池size2，十個雙來源池size1，無占用時新池合計14人候選；26來源留下換季空間。達卡可在同一停泊地看到公會老手／技師／新駕與難民／學徒不同面孔；吉大港把拆船修造和碼頭護船醫護分開；三角洲把船民和獵手分開；孟買保留歸還與信仰兩種走出來的理由。

抽樣不重複，但不是保證每季換人：一個雙來源池可能連續抽到同人，權重只改相對機會。招走的人會從往後抽樣移除；剩餘不足時自然少於size，沒有無限複製範本。鹽灘老手權重1、普通岸勤5，不把老手撒滿池。新來源各只用一次，與舊池完全不共享，三批也各自閉合。

資料欄保留refreshOn=quarter；親讀實作發現實際刷新由clock.phase==neap與當日去重驅動，沒有在recruit.ts按refreshOn分支。因此「每季」沿交接書用語指退潮刷新輪次，不宣稱地球每三個月一次。跨池刷新邊清邊抽會讓共享person受別池上一輪候選影響，故本案採互斥來源。新池存在不等於在任何狀態都能雇：仍須停泊、付費、空鋪位且地點不在recovering/blight-lost狀態；孟買沒有services不影響recruit.ts按place找候選的結構。

## 6. lore 人物草稿要點

26人的三段要點已逐人寫在people.json的bodyPoints，交接書亦按人展列；崩前＝本人當時年齡能有的生活，崩後＝職業斷裂與性格代價，現在＝可雇用處境、站起來的瞬間、原定招牌話。工人只需將這三段展為250–450字，不添加新年表事件、傳奇勝利或認主結果。既有events是人生背景，不一律代表親自參戰；孩童只能是當時撤民或事後學徒。

lore必填欄逐件固定：character/同名、name、aka空、kind human、born、faction、role、relations、events、summary、body、tags、gameRefs=[base:person/同名]；共同規格另要求places=[已指定lore place]。新人物可從自己relations單向連羅凱婭，毋須改舊人物。places目前不在character可選欄登記，check會報未知欄警告但不報錯；遵共同規格保留並列警告，由後續格式線補登記，不在此線擅改check。

## 7. 既有檔插入與 engine-backlog 候選

[inserts-draft.json](inserts-draft.json) 只有1列：公會勢力places追加既有補天院，op=append，由fp-south-01工人複製到報告後交合併線。本輪不套用、不新增地點，不替無人山脊、蘆葦澤與鹽灘插旗，不改舊池。人物皆指向既有事件，無需改年表或舊事件characters。

[engine-backlog-draft.json](engine-backlog-draft.json) 列6項及影響、建議、規模、原碼證據：雇用職類與學徒禁駕、招募bio、職類篩選、刷新詞義與跨池占用、culture粒度、character places欄登記。全部是候選，不寫src或spec。最會影響敘事承諾的是船員預設pilot與年少學徒未有禁駕；下游不得把tags說成已實作限制。

## 8. 分批

[batch-files.json](batch-files.json) 是90列逐檔清單，含batch、repo相對file、id、owner、kind，與三份manifest.files完全相同。第01批達卡5人＋三角洲4人＝9組＋4池＝31檔；第02批吉大港5人＋蘆葦澤2人＋鹽灘2人＝9組＋4池＝31檔；第03批孟買4人＋舊陣列2人＋北脊2人＝8組＋4池＝28檔。每批≤12組且≤42檔，全部新增，沒有跨批引用新檔。三批全部會改營運亂數軌跡，工人不重錄黃金；領導整批整合時處理。

## 9. 產出交接書稿

[cx-fp-south-01.md](cx-fp-south-01.md)、[cx-fp-south-02.md](cx-fp-south-02.md)、[cx-fp-south-03.md](cx-fp-south-03.md) 依指定cx-kj2-01骨架：先讀、唯一目標、方法禁忌、範圍、必用工具、資源、工作、逐檔規格、交付、固定驗收、失敗處置、完成／阻塞回報。每人敘事與數值來源都已定，子代理上限2，產出模型gpt-6.1-sol。worktree與報告路徑按任務指定，尚未建立worktree或啟動工人；本輪不commit、不寄inbox。

## 10. manifest 稿

[fp-south-01.manifest.json](fp-south-01.manifest.json)、[fp-south-02.manifest.json](fp-south-02.manifest.json)、[fp-south-03.manifest.json](fp-south-03.manifest.json) 為content-batch/1，mode add、status draft、base TBD、maxFiles42；allow僅persons/backgrounds/recruit-pools/characters，namePrefix空物件、modify空。checks只有check/lore/typecheck/test/readlist，probe及playtest為null；files與ids預填核定清單，不冒稱已落地。開產出前由領導填實際base，規劃稿不自行建分支或worktree。

## 11. 需要決定

可按本稿進入領導審查；沒有為本輪規劃阻塞的問題。領導需知兩個已明示限制：學徒與船員尚無機制職類／禁駕保證；character.places按共同規格寫會有未知欄警告。建議接受本輪純內容標示，將機制與格式修正另外立項；若要求學徒絕不能入座，則應先做對應引擎候選，不能由內容工人聲稱已完成。印度西岸、錫蘭沿bengal文化桶亦屬現有資料粒度，暫不擴名表。

固定驗收只做交接書原有4條，證據寫 [acceptance.json](acceptance.json) 與 [name-grep-evidence.txt](name-grep-evidence.txt)：計畫11段與年齡、兩表合法及不撞名、三份brief_lint嚴格0與manifest合法、26人掛點存在及禁題0。完成即停，不跑遊戲測試、不加wf-lint或額外驗收。

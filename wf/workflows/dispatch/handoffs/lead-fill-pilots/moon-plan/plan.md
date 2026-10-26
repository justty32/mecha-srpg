# moon 駕駛員與船員填充計畫（提案）

## 1. 已讀清單

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

以上均親自讀過。三個資料目錄為全部範本：persons 38、backgrounds 13、recruit-pools 4；不只讀摘要。另讀開場進度、待辦與兩封現有 inbox，未寫狀態檔或寄信；本任務的唯讀邊界優先。
補充讀過：`wf/WORKFLOWS.md`、`wf/workflows/planning.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/common/data-files.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/cx-kj2-01.md`。manifest 依 `content/batches/2026-10/kaiju2-01.json` 結構取所需欄位；大表透過 tabledb 選列；本區 lore 地方、勢力與人物依盤點選讀。

## 2. 盤點

快照：2026-10-26。全庫 persons 38（human 30、soul 8）、backgrounds 13、pools 4、lore characters 89。依 selene／selene-retired／selene-exile／far-side 標籤，本區 base persons 9＝7 human＋2 soul；另有 lore 關聯的手套、七號、灰，不重算進這個直接標籤口徑。7 human 中只有佐藤花、伊琳娜、瑪雅、圖派亞有背景可雇；達莉雅、希梅娜、索奇特爾沒有招募鏈。兩個 soul（空茶杯、鏽鳶）也不走 human 招募。

本區背景4（selene-test-retiree、selene-soul-mender、farside-navigator、farside-hull-welder），全部掛 recruit/singapore。新加坡1池4來源size4，無人被雇走時四位全上；selene-city 0池0候選。缺的不是精英頭銜，而是可輪換的船員、月面工人與離職駕駛。這次新增20套＝20背景＋20 person＋20 lore人物，三類合計60檔；另6池，總66新檔。人物計畫不將任何既有領袖變成應徵者。

本區七勢力直接歸屬的 lore 人物共18，已抽到 [inventory.json](inventory.json)：塞勒涅5（約納斯、蔡明珠、羅莎、M-3、七號），白手套2（鄭維舟、手套），地勤會1（朴仁哲），暗面5（老鴿、陸照音、米娜、涅莉絲、沈雁橋），哨所1（伊麗娜），無籤會2（還沒、灰），新加坡交易所2（皮萊、算盤）。這18位直接可雇用者均0；七號等有base引用也不等於有背景與池。秦望舒、尤金妮亞等是跨區關係，不新增同名角色。

本區地方9與勢力7的逐筆數量也在 inventory。可雇用採兩種口徑並明列：實際本地候選＝新加坡4，其餘8地方皆0；出身關聯＝靜海市2、背面2，不能加成8個獨立人。勢力直接可證塞勒涅2；遠側2僅暫歸暗面工作網，沒有正式入會證據；其他5勢力0。調查並非以某篇文字提到月亮就算本區。月面 lore 只認靜海一城；不把任務的「各城」擴寫成新城市。

重要映射：營運 `place/selene-city` ↔ lore `place/tranquility-city`；新池不使用 lore 地點id當營運id。恩底彌翁墓仍是最高禁區、背面挖掘區仍無人，沒有新增在內部上班的人。哨所常住200人三十年未下地；本計畫三位軌道出身者來自其他未命名舊站，2090離站，今天是地面接收網外部承攬者。陳岳生的 lore place/the-post 是遠距工作掛點，不代表人已登站。

## 3. 設計理念

月面的人先有手上的活，再有公司與工會的名字。站起來的瞬間可以是銀環跪進碎甲、砲口劈開海霧，也可以是修補師把整副接座從廢物堆抱回來。獸出現在地球海岸與受雇船的返港路上，不搬活獸去無氣的月面。月上的光來自月弓、補板與人駕機甲，不靠古代機忽然認主。崩前成年人記得有餘裕的日常，幼兒只能記得局部畫面，崩後學徒的舊世界全由別人講述。兩位不老的老手把年資寫明，其他人仍有年齡與遲來入行的代價。六個池各缺一兩種可能的搭配，玩家每季面對的是有限的人與短約，而不是整齊的職業套裝。

### 方法與禁忌（共同規格原樣）

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。

## 4. 人物表

逐人20列已抽到 [people.json](people.json)，含姓名、性別、age、born、activeYears、崩前／崩後、性格、瞬間、招牌話、職能與數值、culture、背景名、費薪、池、地方／勢力與節點。新名已登記 [names-claimed.json](names-claimed.json)。同名 person 與 character 是刻意對應，非撞名。

attrs、attrRanges、levelDice、traits、will、tags、perks、abilities 皆已給定；personTemplate/backgroundTemplate 決定其餘結構，不要工人再設計。pilot與gunner沿 maia-te-rangi 數值，老手沿 irina-sokolova，技師醫護沿 hana-sato，收訊員沿 xochitl-reyes；背景費薪取現有同級。兩名老手均850／1.6，只分布於月港補位、遠側兩池，權重1；外貌分別26與29.5歲，都是機械系無三系副作用。年資是累計駕駛時間，不因換船重置。

職能分布：11人有駕駛／砲手經歷（含唐沛然的砲位替手）；另1位導航、4位維修或醫護、1位學徒、1位掮客、1位船廚兼醫護、1位收訊員。地勤會成員的駕駛／船砲均為離職後在外受雇的個人經歷，不給工會機隊。所有person都是human；無新機魂、AI或effects。

五歲直方圖（2108）：

```text
10–14 | █ 1
15–19 | · 0
20–24 | ████ 4
25–29 | ████ 4
30–34 | ███ 3
35–39 | ██ 2
40–44 | ██ 2
45–49 | ██ 2
50–54 | · 0
55–59 | █ 1
60–64 | █ 1
```

16–19歲0／20＝0%，符合≤5%；因此沒有該年齡者需補倖存理由。14歲僅上原凪，2094出生的受監督接座學徒，絕不寫作駕駛。61歲安雅是未長期驅動核心的老船員，照常老化。21–24歲四人都是斷層前出生的小輩，崩前的職歷一律寫成童年，不給嬰兒成年記憶。年齡分布是全區共同門檻，不另加每池或每批比例要求。

## 5. 招募池表

逐池6列在 [pools.json](pools.json)：靜海市離職補位、魂核照護、停班工人；新加坡遠側、月港窗口、軌道接收網。每池size2，refreshOn=quarter；兩池各4來源、四池各3來源，全部來源與權重已列。每地各3個新池，符合2–3池；不改原有新加坡池，也不重用其四個person。

未雇用時，4選2有6種候選組、3選2有3種；加權只影響機會，不保證職能配套。兩個老手低權重，月港常見新駕駛湊班，遠側可能抽到工人與領航而沒有老手；照護池可能同時有醫護與學徒，下一季換修補師；窗口可能有砲手與掮客、也可能是兩種護運人。全新池同季最多12人，加上既有池的候選；後續雇入者會排除，池會縮小直至空缺，不能寫成無限刷人。程式在neap階段刷新並按來源排序做不重複加權抽樣；「每季」沿資料quarter與共同規格用語，不誤寫成必隔三個公曆月。

## 6. lore 人物草稿要點

每人三段要點已抽到 [lore-notes.json](lore-notes.json)，20列，依崩前、崩後、現在與招牌瞬間排列。body由工人擴成250–450字，不改時間因果；20人都有能吼的原句，11人有駕駛或打獸職能。新加坡與地面短約的獸影只用既有掘犬或未命名群獸，不創二名。上原一人使用指示光片作核心意象；其餘不以鞋、繩、乾衣、杯、梯、扶手、熱水、燈重做相同救援圖。

雷語舟只是無月撤棧拖回傷機的一人；艾里克只是落閘之誓傷船上的砲手。二人不奪走老鴿、朴仁哲、皮萊與既有隊長的行動，不給偷天或古代機另找主人。未新增事件檔與年表。與既有人物的關係都從新檔單向指向既有人物，並非改他們的過去。

## 7. 需要既有檔插入與 engine-backlog 候選

[inserts-draft.json](inserts-draft.json) 只有兩列可選append，分別把兩名側寫者加入既有事件characters反向索引；不改body或勝負，也不是新招募生效的前置。產出工人只在報告目錄抄成inserts.json，由合併線決定套用；沒有待補池、沒有要新增營運地點。

[engine-backlog-draft.json](engine-backlog-draft.json) 三項：招募卡連小傳（小）、職類篩選與非駕駛限制（中）、池枯竭提示（小；多person擴充為中）。tags目前是描述，不提供醫護、廚師、導航的專業加成，也無法強制學徒不得上機；本計畫不藉換標籤宣稱功能存在。

## 8. 分批

兩批各10套＋3池＝33檔，皆≤12套且≤42檔。`fp-moon-01`負責靜海三池與前10人，`fp-moon-02`負責新加坡三池與後10人；完整66路徑在 [files.json](files.json) 依batch分列，manifest亦有同一份具體files與ids。兩批均新增招募池，**都會改營運亂數軌跡**；黃金紅交領導整批重錄，工人不重錄。池只引本批新背景，兩批可獨立產出。

## 9. 產出交接書稿

[第01批交接書](cx-fp-moon-01.md)、[第02批交接書](cx-fp-moon-02.md) 沿指定kaiju2範本段落與順序；含先讀、唯一目標、方法與禁忌、範圍、工具、資源、工作、交付、固定驗收、失敗與終局回報。逐檔規格由people/pools/lore-notes三表與生成規則完整決定。子代理上限2；本計畫線未開子代理。工人只新增content與自己的報告，禁止修改任何既有檔。

## 10. manifest 稿

[fp-moon-01.manifest.json](fp-moon-01.manifest.json)、[fp-moon-02.manifest.json](fp-moon-02.manifest.json)：content-batch/1，mode:add、status:draft、base:TBD、maxFiles42；allow.kinds只有base/persons、base/world/backgrounds、base/world/recruit-pools、lore/characters；namePrefix空物件、modify空陣列。checks固定check、lore、typecheck、test、readlist，沒有probe與playtest；領導建立worktree後才填base，不在本線建分支或commit。

## 11. 需要決定

無需阻塞本計畫的使用者決策。領導審稿時只需確認兩項可選取捨：是否把兩名事件側寫者加進既有反向索引；是否接受學徒只能靠敘事限定職能、目前仍可由玩家配為駕駛的引擎限制。預設保留14歲學徒，限制已揭露；若要硬限制，另派引擎線而非本批偷加規則。哨所的外部承攬者不計入常住200人，地勤會無機隊、靜海唯一月城、古代機不醒等原有裁示全部保留。

本線只執行原交接固定4條驗收，結果見 [acceptance.txt](acceptance.txt)；不跑產出階段的遊戲檢查、不額外加驗收門檻。新姓名與背景／池名的全庫grep、跨區claimed對照證據見 [name-check.txt](name-check.txt)。

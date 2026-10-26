# kj-03 批次計畫：蝕域群像與二十年的升級

## 1. 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/polish.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`
- `wf/workflows/planning/design-notes/world/history-lines/rulings.md`
- `wf/workflows/planning/design-notes/world/great-tide.md`
- `wf/workflows/planning/design-notes/world/scale.md`
- `wf/workflows/planning/design-notes/world/rules.md`
- `wf/workflows/planning/design-notes/tide-sky.md`
- `wf/workflows/planning/specs/world/monsters.md`
- `wf/workflows/planning/specs/world/voices.md`
- `wf/workflows/planning/specs/world/rifts-and-territory.md`
- `wf/workflows/dispatch/handoffs/plan-epic/REPORT.md`
- `content/lore/factions/rift-beasts.json`
- `content/lore/places/mumbai-blight.json`
- `content/lore/places/mumbai-gate.json`
- `content/lore/places/lagos-blight.json`
- `content/lore/places/sao-paulo-blight.json`
- `content/lore/places/yakutsk-bed.json`
- `content/lore/places/great-lakes-mycelium.json`
- `content/lore/places/rhine-trench.json`
- `content/lore/places/cold-tide-rift.json`
- `content/lore/events/first-tide.json`
- `content/lore/events/iron-wings-month.json`
- `content/lore/events/lagos-night.json`
- `content/lore/events/landlord-sits.json`
- `content/lore/events/red-eye-first-seen.json`
- `content/lore/events/white-night-first-seen.json`
- `content/lore/events/first-nest-taken.json`
- `content/lore/events/star-grave-named.json`
- `content/lore/events/last-vesper-named.json`
- `content/lore/events/moon-drowned.json`
- `content/lore/events/mirror-vigil.json`
- `content/lore/events/rust-banner.json`
- `content/lore/events/wreck-crown.json`
- `content/lore/events/bellless-dawn.json`
- `content/lore/events/nine-gates.json`
- `content/lore/timeline.json`

以上均由 cx-kj-03p 親讀；年表按交接書只查相關條目。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、inbox 入口，world-pillars 對應子檔，以及奈洛比勢力／地點、三個 era、掘犬與盾甲 species／monster。history-lines、history-timeline、history-orphans、terms-rename 以 tabledb 條件查詢；事件目錄已列檔，候選名稱與 id 已查重。

## 2. 設計理念

二十年要讓讀者看見：失城之後，牆外的地貌仍在變，牆內的拘束器與名冊也必須跟著改。升級以舊軛撐裂、舊街被巢壁包住、傷亡頁角放不下二名來呈現，讓修軛工、引路人與抄名者各見一角。巢母首見、首捕與各地二名只並讀，不把不同個體串成同一隻獸的成長史。人的技術確實增加了，能帶回來的東西卻仍比失去的少。

本計畫固定 **3 件新事件、3 節 body 追加**，全部新情節與名稱均為提案，待領導審後交產出線；不開第九條主線。只交 plan.md、review-draft.json，不改 lore／base、manifest、index、src、其他 wf，不 commit；下一工人也只能按正式交接授權落地，不能把第 7、8 段建議視為額外改檔權。

### 方法與禁忌（交接書原文，產出線照遵守）

- **節點優先、不暴力產 lore**：先列要掛的主線（A–H）、年表條目、崩年底色句（1.1–1.13）；孤兒條目裁示是「留填充層、不硬掛節點」，所以**不新增對 N01–N10 的因果**。每件說清前因與後果。
- **對面無臉**：怪獸側沒有指揮者、沒有意志、沒有心思與對白；「升級」只能寫成人看到的變化（出現的等級、數量、地點、季節、二名登記數、獵牌與防線的反應），不寫「牠們學會了」「牠們在報復」。
- **掛旗不碰**：S 領主（孟買的那隻等）不出場、不描寫、不定族；蝕壓源頭、SS／SSS 不寫。**桑托斯灣區核心「長出什麼」不定**——計畫列成待使用者決定，正文只寫外界看到的空白。
- 怪獸多從海洋來、環太平洋為主、內陸少；蝕潮與潮汐有關聯但**不用潮差、潮高推凶度**；大潮全球同一時刻（裁示）。
- 怪獸等級不是成長階段（B 不是 C 長成的）；蛻皮只是獸族的例外（掘犬→盾甲）。
- **不拿其他作品類比**；**中文命名避免直譯**（兩步命名）；用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`（古代機本體叫古代機、外層叫裝甲；潮→蝕）。新名詞標「提案」。
- **已裁示不推翻**；除 rift-beasts 的 body 追加外，既有 lore 一字不改（要咬合的列成「建議插入」）。真相用可見度（`secrets` 的 hidden／rumor）。
- 群像為主，**不新增具名人物檔**。
- 不造怪獸資料：引用既有怪獸名（grep `content/base/monsters`、`species`）；真缺就列「需求」。


## 3. 掛點表

「背景」是既有主線提供的時局，不替新件或孤兒增加主線／節點歸屬；下表不改 history-timeline 的任何欄。A、B、D、E 本批不另掛；H 只用既有孟買教團的外界說法。

| 掛點 | 為什麼用 |
|---|---|
| C 精粹與產能；2095 拾號初陣、軛鞍行開張 | 斷軛留蛻承接已存在的拘束技術，只記一個工坊的後果。 |
| F 蝕線與歸還；2099 拉哥斯之夜、2101 蝕線協定 | 橋下舊街讓已失守的港呈現變質，無新增收復戰。 |
| G 傘政治；2106 殘聯成立、獵牌法 | 眾名成冊是既有發牌窗口的地方實務，不是立法前因。 |
| H 信仰；2096 迦梨現身、孟買門 | body 對照人仍住在線內，教團宣稱不能當旁白真相。 |
| 底色 1.3、1.8、1.10 | 工藝記錄、留名哀悼與黑話成正名分別支撐蛻皮、名冊。 |
| 底色 1.4、1.5、1.11 | 蝕域中的舊家與必須繞行的補給，區別於單因斷鏈撤空的城。 |

既有年表取用：2089-03-14 第一次蝕潮、2089-04 鐵翼之月、2090 聖保羅失守與巢母首見，供「港失守後仍在長」的起點；2098 赤眼、2100 白夜、2101-08-15 借火催曉，供人逐地留下的辨認資料；2103 巢母首捕，與首見並讀出捕獲的進展及代價，兩者不是同一隻。2103-09-15 葬月、2104-06-15 負天星塚、2105-07-15 照面無歸、2106-03-15 無人應答、2106-10-15 鏽旗、2107-04-15 九門，供另冊的既有 A 級二名，不重演命名之夜。2107-11-15 沉船加冕只作既有年表題名與日期的止筆線索，不轉述獸形、動作、族別或等級演進；詳第 10 段。

## 4. 升級年表草稿

以下五期是史線分期，事件的 period 另用 lore 七時代，兩者不可混填；每期三句以內，〔新〕指第 5 段提案。

**2089–2092／崩年。** 第一次蝕潮後，孟買三週內失守，桑托斯灣區的蝕化到隔年吞上聖保羅；鐵翼之月未收回土地。2090 的撤離者看見巢母坐定、子體出囊，舊屋不再只是缺人居住，接應路也改道。

**2093–2096／碎國。** 2095 拾號與軛鞍行使人能把活獸扣在拘束器裡，沒有因此停止承擔與磨損。2096 孟買門傳出教團的認主宣稱；牆外已有人的據點，不能把據點當作安全或收復的證據。

**2097–2101／築牆。** 2098 赤眼的舊蛻留在辨認圖上，2099〔新：斷軛留蛻〕再把蛻皮造成的斷軛帶到工坊門外。2099 拉哥斯失守，2100 白夜整夏發光，2101 五湖採菌隊失去鐘樓，留下各自的二名與名單。2101 協定放棄三核心，環線首航，綠線開始養裂；人一面守住通路，一面在蝕域邊緣做生意。

**2102–2105／守線前段。** 2102〔新：橋下舊街〕從拉哥斯斷橋見到巢壁內的舊街，搬運隊依實見重畫回程。2103 萊茵捕住的是 C 級巢母，活捕簿記下換索與死者，與2090孟買首見分屬不同個體。其後葬月、負天星塚與照面無歸分別留下海灣、外港與冰岸的警示，並無全球同時升一級的記錄。

**2106–2108-01／守線後段。** 浦那陷落、蝕線退到蘇拉特；同時又有無人應答、鏽旗出殯與九門同喪的名單，2106 的「站穩」仍只是城邦淨損失歸零。2107-12〔新：眾名成冊〕將歷年地方二名另冊抄存，冊頁增加能證明收到的警示變多，不能當作全球獸數普查。到2108-01，達卡北郊仍是第四天剛坐定的 C 級巢母；老蝕域累積與新裂初開並存。

## 5. 新事件清單（3 件，均為提案）

下列路徑相對 content/lore；characters 均填空陣列，不新增人物檔。每件正文按 300–1500 字、3–5 小標展開，第三人稱過去式，讓具體工作與物件帶出代價；不另外擴增戰役、怪獸或事件。

### 5.1 斷軛留蛻〔蛻皮〕

建議 id `event/broken-yoke-molt`；檔名 `events/broken-yoke-molt.json`。英文原名 **The Yoke Outgrown**（先取意象：拘束器不再容得下原來的身體）；中文意譯「斷軛留蛻」（提案），把焦點放在人留下的斷軛與舊蛻。日期 **2099-02**，`period: era/yoke-years`，`places: [place/nairobi]`，`factions: [faction/nairobi, faction/rift-beasts]`，kind「其他」。

掛到：填充層；C 僅作產能背景，年表承 2095 拾號／軛鞍行與 2098 赤眼初見，底色 **1.3、1.8**；不掛節點。前因：活捕與拘束已能實行，赤眼畫像令外來獵團向行裡追問舊蛻；這次只記外人見到工坊事故的片段，不宣稱人類首次發現蛻皮、也不宣稱工坊此時才獲祕法。

經過依三個小標展開：「門外等軛」寫送修者帶舊拘束尺寸等候；「軛裡換了身體」寫既有掘犬蛻成盾甲、脊軛撐裂，技師撤人、換索，外來搬運工隔著警戒線只見舊蛻被拖出；「兩張尺寸」寫工坊把事前掘犬記錄與事後盾甲尺寸並存，搬運工留下受傷同伴的空位。只借 `species/hound`→`species/bulwark` 與 `monster/hound-c`／`monster/bulwark-b` 的 C→B 例外，無新增能力、吞屍配方、觸發週期或能再升級的結論。

後果：該副舊軛不能再用，該隊延後接回拘束機體，接班技師照兩張尺寸重做；外來隊伍帶走事故見聞，未取得工藝。與既有 lore 的關係：承接赤眼的外界猜測，不確認赤眼的前身、不把赤眼或拾號寫成此處的掘犬，不改既有首創者與年份。

需要的 secrets：一筆 `rumor`，內容「外來獵人說軛鞍行能使被拘束的掘犬蛻成盾甲，送修者只見到斷軛與前後記錄，沒有看見做法」；一筆 `hidden`，只記既定的「奈洛比軛鞍行掌握獸族蛻皮祕法，最多升一級、到不了 S」，`knownBy: [faction/nairobi]`，不補發明史或祕法程序。公開正文能見到本次形態改變，不能由此公開祕法全貌。

### 5.2 橋下舊街〔蝕域內部〕

建議 id `event/street-beneath-the-nest`；檔名 `events/street-beneath-the-nest.json`。英文原名 **The Street Within**（先取意象：失城後街道仍能辨認，卻已在另一層地貌裡）；中文意譯「橋下舊街」（提案），不另取地名。日期 **2102-06**，`period: era/tide-line`，`places: [place/lagos-blight]`，`factions: [faction/rift-beasts, faction/green-line]`，kind「其他」。

掛到：填充層；F／G 僅作背景，年表承 **2099 拉哥斯之夜、2101 蝕線協定與綠線開始養裂**，底色 **1.4、1.5、1.11**；不掛節點。前因：失守後潟湖橋斷、高樓裹進巢壁，外圍已有賣子體的交易；一隊接貨搬運者請舊港引路人進外圍接應，並非發動收復。

經過依三個小標展開：「橋墩還在」讓引路人從斷橋認出舊街的窗位，搬運者起初以為是一般撤空街區；「牆裡有路」從已斷開的巢壁看見濕隧道連過舊門框、蟲足刮過內側，舊街成為蝕域內部的剖面，視點只到外圈的可見缺口；「回程改道」寫來路又有子體穿出，眾人留下空車、搬著仍能帶走的貨退至橋外，接貨者把原來的短路劃掉。只用地點已載的巢壁、子體與隧道，不增加未知獸種，不穿越深蝕到港心，更不寫人成功探明核心。

後果：本隊改從外側接貨、增加搬運與繞路，舊港引路人的記憶不能再代替當下觀察；他仍保留舊街名，後來者把實見的出口標在紙邊。與既有 lore 的關係：放大 lagos-blight 的「高樓包在巢壁裡」，承接綠線養裂造成的日常，不新增蝕匪邦的建國年份，不提前執行2107清剿或決定其結果。

需要的 secrets：**無**。巢壁剖面、改道與人的交易都可目擊；不以 hidden 偷藏蝕壓源頭或不可寫的核心真相。正文亦不替綠線販子的吹噓保證道路安全。

### 5.3 眾名成冊〔二名越來越多〕

建議 id `event/epithet-register`；檔名 `events/epithet-register.json`。英文原名 **A Concordance of Loss**（先取意涵：把分散傷亡記錄對讀，名字不能互相吞掉）；中文意譯「眾名成冊」（提案），指人的整理事件，不是新增二名。「二名別冊」亦為提案名，只是奈洛比一處發牌窗口的工作簿，無新機關、無新法、無全球首次宣告。日期 **2107-12**，`period: era/league`，`places: [place/nairobi]`，`factions: [faction/league, faction/nairobi]`，kind「其他」。

掛到：填充層；G 僅作已設發牌制度背景，承 **2106 獵牌法及第 3 段 A 級二名年表**，底色 **1.8、1.10**；不掛節點。前因：各地名號原寫在傷亡冊、值房圖、返航簿與告示裡，窗口收到的抄件逐年增加，同族的不同二名已不能只塞進一個備註欄。

經過依三個小標展開：「頁角放不下」並讀孟買千囊房東的舊頁與雪梨、奧克蘭較新的岸圖，不寫固定年度成長率；「名字各留一頁」核對日期、地點、目擊輪廓，將赤眼兇星與負天星塚分列，將五聲葬月與無人應答分列，**不把同 species 當同個體，也不把同夜多地災情當作指揮**；「別冊不代替點名」保留每件的原地名與死者名單出處，抄冊人把新警示交給來換牌的隊伍，家屬仍領自己的那張名單。

後果：此窗口首次另裝一冊，不是世界第一次替獸登記；接契約的獵團拿到可逐地辨認的抄頁，仍須自己備妥精粹與補給，獵牌等級、法規與契約價格都不改。與既有 lore 的關係：串讀 kj-01 與早已有的 A 級之夜，新增的是「記錄多到另冊」的制度反應，沒有再創一場命名或暗示獸因此升級；文案避開「凶名」以免混淆生物機甲的另一稱號層。

需要的 secrets：**無**。只用公開可見的既有記錄，不造傳聞獸、隱藏二名或跨洲同一獸的追蹤結論。登記冊列數不是全世界 A 級獸總數；不納入「萬潮葬王」個體條目與描述。

## 6. rift-beasts body 追加（3 節）

追加位置：在原有 **「## 蝕壓」整節結束後**加兩個換行，接以下三節；既有 body 的字元順序與每句文字完全保留，其他欄位不改。不能把既有掛旗段落擴寫；小節名稱為提案文案，不設新世界觀名詞。

**「## 舊物記下的二十年」**：共用第 4 段五期順序，選撤離路、斷軛、巢母捕獲索與不再可走的街道串起首見到首捕；明辨不同個體、拘束成功仍有代價。以新裂的 C 級巢母與多年累積的蝕域並列收尾，避免寫「所有獸都長大」或補獸產能數字。可用白夜與五湖的既有夏季景象作菌絲淡水例外，不增內陸常態災情。

**「## 名字另裝一冊」**：從二名之夜的哀悼接到眾名成冊，重點是抄頁漸多、同族名號必須分辨、每頁仍連著人的名單。只選現成 A 級例子；沒有新二名、全球總量、同步升階與統一獸軍。寫抄冊人把傷亡頁還給家屬的動作，不將段末寫成規則說明。

**「## 舊港仍有人望著」**：孟買只用門外布條、缺口與教團在場；拉哥斯由橋下舊街寫可見巢壁內部及外圍交易；桑托斯灣區只寫環線車頂望見蝕域邊緣、商隊繞行與港心無可靠見聞。第三處的空白是觀察者無從填寫，**不等於裡面沒有東西、沒有社會或沒有生命**；三處人群並列，不給任何怪獸政治組織。孟買的說法若涉及聲音，只明示教團宣稱，不增迦梨真相的敘述。

## 7. 年表插入（只提案，不寫 timeline.json）

每條 event 指向第 5 段同名 id；日期升冪，均在開場前，不加 rumor 標籤冒充未來傳聞。summary 只摘公開後果，不複製 secrets。

| 日期／標題 | era | factions | tags |
|---|---|---|---|
| 2099-02／斷軛留蛻 | era/yoke-years | faction/nairobi、faction/rift-beasts | tide |
| 2102-06／橋下舊街 | era/tide-line | faction/rift-beasts、faction/green-line | tide |
| 2107-12／眾名成冊 | era/league | faction/league、faction/nairobi | tide |

日期只是事件登記月份，不宣稱該月某日為大潮、不指定新星候。若正文提漲潮或大潮，只引用既有記錄，不從月份倒算潮差或全球夜晚。

## 8. 建議插入既有檔（只列、不做）

`content/lore/places/nairobi.json`：「發生過什麼」可加斷軛留蛻與眾名成冊的短入口，工坊事故與登記窗口仍分開。`content/lore/places/lagos-blight.json`：同節可加橋下舊街的接貨路改道，不能重寫原失城與清剿結果。

`content/lore/events/red-eye-first-seen.json`：若另批獲准，在軛鞍行來看畫像之後加斷軛留蛻的後續閱讀入口，不能補成赤眼的身世證明。`content/lore/events/first-nest-taken.json`：最多加與首見的對讀入口，明確是不同巢母，不增獵牌立法前因。其餘二名之夜維持原樣，由新事件單向引用。

`content/lore/timeline.json`：只建議第 7 段三條；正式產出交接未列它之前不寫。history-lines／history-orphans／節點表本批不建議改掛；review 的「掛到」是閱讀脈絡，不能據此直接更新那些表。

## 9. 需求

機甲線：**無**，只用既有拘束器、軛與鞍，不要求新 frame／能力／數值。怪獸資料線：**無新增需求**，掘犬→盾甲的 species 行為已存在；不假定引擎已能運行完整蛻皮流程，本批只補 lore 計畫。

查得 hound-c 是 C、bulwark-b 是 B；只照這一例寫，不造其他蛻皮鏈。二名冊只引用既有 lore 個體；同種同級 A 級反查限制屬引擎問題，本批不藉冊頁新增 monster 資料或要求修引擎。

## 10. 矛盾與待決

**桑托斯灣區核心長出什麼：待使用者決定。** 外界已知的是蝕域邊緣與環線，不以其他兩核心的神權城／蝕匪邦類推出第三種國家，也不填具體生物、建築或統治者。此空白不阻塞本批三件提案。

**第九條線仍未裁示。** plan-epic REPORT 的 B2 是建議；不新增主線，不將本批的地方實務倒寫成 N01–N10 的前因。

**既有萬潮葬王與掛旗邊界衝突。** `content/base/monsters/tidespine-chittagong.json` 已列 S，`events/wreck-crown.json` 已有具體出場；本交接卻要求 S 領主不出場、不描寫、不定族。維持既有檔不動，本批新清單與追加要點不轉述該獸；既有題名／日期只留第 3 段資料指引，不是規避禁令的別名寫法。是否另修舊件交領導／使用者，不由本批追認。

**九門同喪掛點表自相矛盾。** history-timeline 的序113填 G／N09，理由末尾卻寫裁示「仍屬群像孤兒、不硬掛N09」；本批照孤兒留填充層與不加因果的明確指令，只引用命名記錄，表格不改，待維護線釐清。

**蛻皮與等級規則須區分通則、例外。** monsters 的蛻皮條件較具體，末段又說吞屍只維持活性、不動等級；本批採已裁示的獸族有限例外與現有 hound→bulwark，不替條件、成功率與其他獸補答案。赤眼背負舊蛻只是既有目擊，不能推出赤眼由某級一路升成。

**全球同時與各地夜晚。** first-tide 等舊文將全球事件統稱夜裡，較新的 great-tide／style 已定同一時刻分晝潮與夜潮；本批不改日期，不延伸成全球同夜，也不把非洲、太平洋各件自動判為同次大潮。

**對面無臉與舊規則用語。** bio-battle/B10 允許少數低智指揮者，舊 rift-beasts 有帶群用語；本交接明定怪獸側無指揮者、無意志。本批只寫可觀察動作與人群反應，舊句不動；這是任務敘事範圍，非自行推翻戰鬥規則。

驗收僅交接書固定三條：①十段齊全、三件涵蓋指定三類；②review 合法 JSON 且四列；③新清單與追加要點無 S 描寫、怪獸心思／動機／對白、桑托斯核心定論。件數不擴增；plan 超過20 KB就停下回報，不另跑工程或內容產出驗收。

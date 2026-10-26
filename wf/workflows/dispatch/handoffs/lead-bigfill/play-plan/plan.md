# 可玩內容大填充計畫

本線 cx-bf-play-plan；團隊 teams/bigfill。2026-10-26 第2輪修訂，依 [領導裁決](../play-rulings.md)。**99 件、7 批、每批 12–18 件；只設計地球營運，不寫 content、不改引擎、不 commit。** 初輪調查基準 HEAD `7a005919d5afb1bc7583d9c73130452dddd72365`；本輪重新核對現存內容與指定獸展開程式；工作樹可有其他線同步更新，以本次讀到的檔案為證。這不是所有 lore 都已可達的承諾。

## 1. 已讀清單

以下保留上一輪已讀紀錄；本輪先重讀play-rulings、style總綱與people，再重讀原交接書、共同規格、營運規格與引用範本，補核新物種生態位及目前引擎。初輪子代理是歷史紀錄；本輪未開子代理。

- `wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/cx-bf-play-plan.md`

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/dispatch/handoffs/engine-backlog.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/cx-rep-01.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/cx-kj2-01.md`
- `content/batches/2026-10/kaiju2-01.json`
- `wf/workflows/planning/specs/core/README.md`
- `wf/workflows/common/code-map.md`

工作流補讀：`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/planning.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/team-model.md`、`wf/workflows/inbox/README.md`、`wf/workflows/common/data-files.md`、`wf/workflows/common/conventions.md`。先讀頁引用的支柱導航已讀；本計畫遵守 world-pillars 全文列出的守則，不依舊摘要復活已失效寫法。

定向查表：`wf/workflows/content/templates.json`（營運事件、契約、科研／市場／招募／背景／對白列）、`engine-facts.json`（EF-19、20、21）、`wf/workflows/common/code-map.json`（ops）、`content/index/lore-character.json`、`lore-faction.json`、`lore-place.json`、`base-faction.json`、`wf/workflows/planning/design-notes/world/history-timeline.json`（公刻、放閘、鹽鷗、唱名）、`wf/workflows/dispatch/handoffs/engine-backlog.json`（地圖、營運、接線、遭遇）。皆用 tabledb 定向查，不整片載進 context。盤點子代理也親讀 AGENTS.md、bf-common.md 與適用工作流，只寫 /tmp/cx-bf-play-plan/。

core README 明列營運為非目標，故沿 content 工作流導到 ops spec，讀相關段：`content-format-ops.md` 及 `world.md`、`factions-war.md`、`crew-text.md` 三個範例子檔；`data-model-factions-contracts.md` 的勢力／presence／行動牌；`text-ui-contract.md` 與 `text-ui-contract/presentation.md` 的事件／談話／按鈕。程式只讀：`src/ops/state/types.ts`、`content/{load,worlddb,check,cond,start,opseffect}.ts`、`time/{tick,commands}.ts`、`contracts/{lifecycle,tally}.ts`、`world/{actions,market}.ts`、`sortie/scenario.ts`、`text/{render,templates}.ts`、`crew/workqueue.ts`、`war/merc.ts` 相關段及命中的測試。範本逐檔見新件表。

## 2. 引擎事實

### 載入、條件與引用的共通邊界

`src/ops/content/load.ts:WORLD_FOLDERS` 掃 `world/<目錄>/<檔名>.json`，按檔名排序；id 的 kind 與檔名必須一致，裸 id 自動補 `base:`。WorldDB.all 依完整 id 排序。lore 完全不由營運載入；lore gameRefs 是單向百科連結，不能代替接線。報告可保留 lore id，遊戲引用欄只能指已存在 base id 或同批新檔；敘事文字可用既有名稱，不能發明未登記的 loreRefs 欄。範例 spec 有舊 node／$cell／省略欄位，**以 types.ts、load.ts、實檔為準**。

Cond 實際是 all／any／not／tag／cmp，NumExpr 是數字、ref、sum、product、pick。合法 ref 根由 `OPS_REF_ROOTS` 列：campaign、rift、faction、person、mech、place、calendar、debt、ledger、inventory、ship、restraint、contract、flags、operation、relation、targetFaction。缺失數值路徑會丟錯；flags.* 缺鍵回0。沒有通用 `location`／`factionIs`／`dateAfter`／`characterAlive` 條件。地點 tags 與旗標進 tag 集；日期讀 calendar.month/dom/day；同一事件只有地點 scope，不能直接假設有 faction.rep。跨勢力聲望可讀 `campaign.factions.base:faction-ops/某家.rep`，須是目前開局已初始化的勢力。本批行動牌如此寫，並把它置於月份與port tag之後，無此地點tag便不取數值。

精確地點門檻採既有 place.tags 追加 `bf-receive-dhaka`／`bf-receive-chittagong`／`bf-receive-singapore`，由合併線套 inserts。這三個tag只用在地球點；不以緯度猜地點、不讓遠方城市假裝出現在長陸圖。只看到 lore 名稱的「出現」與真正有UI入口、抽牌、出戰三層分開記。

### contracts（契約）

必寫 id、kind、issuerKinds、requiresRep、gradeRange、objectives、pay.base、advanceMax、deadlineDays、onComplete/onFail/onCancel；supplies、annoyanceMax沿範本，可選 name、encounter、join、stages。`lifecycle.ts` 只消化 pendingContracts：行動牌 spawnContract 提供模板，雇主必須 alive、scaleNow在issuerKinds、聲望達requiresRep且contractKinds含該模板。非裂縫落點是 explicit near，或 territoryNow＋presence 中可達地點；clear/seal/reclaim 必須有裂縫。不是加檔就抽到。name會進名稱解析，沒有已承諾可用的契約brief長文。

本批每份都配一張world發包牌、一份同批遭遇、contractKinds append；near明指現有地球港。獎勵、預付、期限、聲望增減照同類既有檔；主目標用killTarget、survive或hold，不用不可見護送單位來假裝完整護航。指定獸由killTarget.params.target接入，詳見encounters段。範本 `contracts/escort-sealed-convoy.json`、`scout-rift-margin.json`、`defend-citywall.json`、`rival-carcass-claim.json`。只加未引用模板不耗RNG；接上發包牌後會改契約序號、指令與戰役黃金。

### actions（世界行動牌）

必寫 id、actor（world/faction/rift）、valid、weight、cooldownDays、effects；lane只有war或省略。本輪world牌每天段2與其他world牌競抽，用s.rng；權重正且valid成立才入池。faction牌另看勢力actionLanes；現有達卡、殘聯、鐵砧等不少只有war，所以不能只加faction牌就說它會發包。範本 `actions/board-rival-carcass-claim.json`；presence舊牌冷卻已為16。

本批採actor=world，避開修改actionLanes；一牌只發一模板。month>=1、指定dom、所在port tag、指定雇主聲望及posted==0同時成立才抽；effects為spawnContract＋posted旗。該模板只append到指定雇主，免得world請求被另一家搶走。不是保證每天必出；單次發包也不提供無限刷聲望。門檻外不入池不耗抽牌RNG；接線後必列戰役黃金風險。

### events 與 news（同一種檔）

EventDef 必寫 id、where、when、weight、text、choices；choice 必有text/effects，可選requires/next。原生where是place/field/lane/ship/ruin；載入器把node→place、route→field，故本批按既有port範本寫node。日段4先清pendingEvents，再把非任何next目標、where匹配、when成立、weight>0者抽一張。ship不等於只在停泊時抽；ruin目前不會由普通where分支直接命中，探勘由隊列推進。新增無條件事件會搶走每天戰鬥時間。

本批36件事件均month>=1、dom為5/12/19/26之一、特定地球port tag、seen==0；weight2。第一選項無requires、僅設seen。第二選項四類：23件cash−100/mood all+1（news-tide-street-sermon）；5件scrap−2/techHours+5（ruin-before-tide-glow）；4件cash−160/techHours+8（rival-practice-banner）；4件mood all−1/techHours+3（restraint-empty-rack）。扣帳皆有對應餘額requires，數值照既有選項組合，不調平衡。每件兩選項皆設seen，文字顯示代價。text 60–160字、第二人稱、不插值、不用具名人物；氣味、聲音、既有名詞與吼句逐件定案。遠方消息用既有舊影或來客轉述，現在式只描述玩家當下觀看，不改遠方控制權。

**沒有news資料夾或NewsDef。** 現有新聞是events/news-*.json，使用相同prompt與兩選項；templates只把既有CampaignEvent翻成日誌，不能新建新聞排程。未接port tag時事件不入池，接線後會改s.rng、選擇停頓及黃金。純文字替換不一定改RNG，但若pending prompt被完整state hash涵蓋仍要區分測試種類，不能一概說文字永遠不影響hash。

### dialogues（對話）

id、person（base PersonDef）、topics必寫；topic含topic/when/lines，選擇用choices，直接效果可選effects。`time/commands.ts` 要求實例在名冊且在當前房間；all(dialogue)按id排列、攤平topics取第一個成立者。UI `text/render.ts` 只有「與某人談話」按鈕，沒有話題列表。ren-kasai.json與chen-xiaohai.json已有when:{}，舊workflow「新檔排在原檔後」會令新話題永遠不可見。

本批明示例外：新檔 `bf-人物-題目` 在舊檔之前；month>=1＋三個地球port tag任一＋seen==0；兩選項都設seen、沒有永真後話，因此一次談完恢復原話題。只用default已有的蓮、小海、伊爾瑟、瑪拉四人，旁人姓名僅歷史回憶／傳聞，不冒充同船或保證存活；同名不同人的base人物不可硬接。範本 `dialogues/ren-kasai-empty-chair.json` 等。抽話題不耗RNG，現有未談話戰役預期不變；晚期談話若選到新題則旗標、士氣改變，必須列條件性黃金差異。

### encounters（戰場生成模板）

必寫id、family、depth、size.w/h、terrainMix、budgetByGrade、anchorHere；可選map、faction、units，units含frame/pilots/components/w等。引用必為base地形、戰場map、frame/person/component；`$node`實際擴展當格與八鄰battlePool，文件中的$cell不能照抄。一般出戰按family＋depth取排序第一個符合的模板（再退deep／第一個），**不是同族多檔均勻抽**。只有contract.encounter明指的陣列才用契約id雜湊選擇，選模板本身不耗RNG，造地圖／選單位會耗。

本批16份皆為怪獸遭遇，用rift-z-bf-前綴排在原族預設之後，只由同組契約明指。family、depth、尺寸、terrainMix、budgetByGrade D:2/C:1、anchorHere=false照同族shallow範本。沒有可填到EncounterDef的物種白名單；units只能frame，不能用生物frame冒充野獸。

**指定出場已有可用接法**：`src/ops/sortie/scenario.ts` 的killTarget分支接受`params.target:"monster/…"`，先在已生成敵軍中匹配，缺席才補入指定monster，最後改綁enemy-N；optional:true也會做這步。每組review「出場怪獸」明列既有species/monster及生態位，契約name明寫獸名與「為什麼現在」。8組以擊破指定獸為主目標；5組survive 8回合＋可選指定擊殺；3組hold 6回合＋可選指定擊殺，hold省略zone由引擎生出可達守區。殺可選目標不取代守區／生存勝利；不承諾活捕有契約判定。

**實際編成限制**：明選encounter時快照width固定D，gradeByWidth[D]僅D；現有C:1預算不會自動抽C。原範本先生成兩隻同族D，指定目標若已出現不補，否則加一隻，因此總量2–3；C目標固定補一隻。16組用14種D/C獸，其中12種來自kaiju2，礁背與抱樁為既有種；不引入B/A/S獸，不改原獸數值。海獸在海岸、港口或通海河口，兩組菌絲在達卡淡水岸，未採深海種；同族隨機D伴隨仍受同一族生態邊界約束。

此接法補正上一輪「無法承諾任何指定物種」的過度概括，並未假造新欄位。本輪以暫存唯讀記憶體overlay對16組各生成一次scenario、解析目標及scenarioToSetup，全數有指定獸、總量2–3、守區非空；未寫content檔。範本 `insect-shallow.json`、`rift-beast-shallow.json`、`rift-alien-shallow.json`、`rift-mycelium-shallow.json`；目標結構參照`epithet-bounty.json`與`seal-anchor-watch.json`，報酬照主範本。未接線且不搶排序時不改軌跡；新契約打它時會改戰役。

### places（地點）

必寫id/name/map/at/kind/services/tags，可選owner/pop/footprint/size/sight/ruin。開局allPlaces建立狀態；驗座標在圖內、可通行、footprint不重疊，潮海只允許港。移動用方格路徑，不是老node選單；有新place還要能到達、需服務則再接相應入口。範本 `places/dhaka.json`、`chittagong.json`。目前只有10個靜態點（9地球、1月面）、兩張圖（longland/lunar），本批不把其他洲硬塞進長陸地形；外洲當地營運仍是缺口。

新增真正地點會改開局state、領土／行動者／發包候選及路徑，可能改RNG與黃金；不是純文字。三個port tag append不自行抽RNG，但它解鎖本批事件／行動。此輪不新增places，不能把「提到城市」算作「已可航到城市」。

### factions-ops（勢力營運）

id/faction/scale/territory/stance/contractKinds/services/reputationTiers/tags必填；presence、roster、actionLanes、lifecycle、naming可選。faction連core faction，territory/presence連world place，contractKinds連模板；presence不駐軍不佔領、只提供發包地。每家開局進s.factions，研發、外交與war另初始化；只建lore勢力不生效。範本 `factions-ops/imperial-court.json`（無領土presence）及 `dhaka-weavers.json`。

新增勢力會增加初始化／外交對數／actor與行動序、影響warRng與campaign hash；新勢力不能為湊件數只寫world一檔而欠core faction。本輪不新增勢力定義，只由合併線append指定contractKinds；原actionLanes不動。已有7家遠方勢力外站沿lead-rep定案使用，不重新解釋為它們佔有南亞港。

### markets（市場）

id/place/lists/priceMods/refreshOn/buysBack必填；lists每列kind/items，item含def/weight/stockMax、可選basePrice；frame filters可用lineage/maker/tierMax。不是spec舊例的price。place與物品引用要存在，ammo指矢池、material指stock:*帳；原有造機勢力聲望門檻仍由repGate保護，不能用市場副本繞過。`marketsDaily7`在弦月遍歷市場刷新，用s.rng擲庫存；UI同點只取一市場入口。

範本 `markets/singapore.json`、`war-armory.json`。新增市場即使玩家不逛也可能改刷新RNG與state；同place再加第二檔還可能被第一檔遮住。這輪不新增市場，地方物件的買賣只用事件的既有現金／士氣取捨，不宣稱新物品真的上架。

### services（服務）

id/room必填，medbay可帶hpRegenMult/cleanse，通用欄可price/effects；實際crew/retreat/market等還有各自的設定物件。消費端多是精確 `service/crew`、`service/retreat` 或既有服務名稱，並非遍歷新檔就長出按鈕。範本 `services/medbay.json`、`crew.json`、`retreat.json`。引用需存在，缺新的動詞／服務路由時新service是死資料。只新增未讀檔預期不改RNG；覆蓋舊服務會改全局經濟，超出本輪。這輪不新增服務。

### jobs（工種）

id/kind必填；repair須有hoursPerHp/perHp/material（rebuildMult、technicianHours），install/graft等配方需needHours與對應recipe欄；incubate還須person機魂模板，造的是獨立人物不是複本人格。queue讀顯式recipe或按kind第一個配方，repair取第一個有該層係數者，並精確讀job/repair的工時。範本 `jobs/repair.json`、`install.json`。沒有任意「打撈故鄉物件」新工種可只靠填檔。新配方不被呼叫時不耗RNG，但排序搶係數會改既有軌跡；本輪不新增jobs，不改修理數值。

### operations（勢力作戰）

id/kind/actorScales/valid/weight/targetSel/commit/phases/onSuccess/onFail/onAbort必寫，merc可選；phases定muster/march/engage等，targetSel是引擎已知選點詞彙。須有war lane行動牌startOperation，勢力要能用war且有軍力與有效目標，不是多一operation就會出兵。引用指既有place/rift/勢力／模板，範本 `operations/clear.json`、`relief.json`。選目標用warRng，與一般rng分開仍影響完整campaign hash與世界局勢。無引用模板預期不改抽選；本輪只做普通契約，不新增war作戰與外交數值。

### omens（天象）

id/name/layer/effects/tags必填，cycle或at或emerge定時間，tideDelta/setTide/text可選。`state/omens.ts`與clock計算天象、潮級、`omen:<名>`旗；cycle/at用營運蝕曆，非任意公曆字串。emerge.requires要是既有omen。範本 `omens/perigee.json`、`grand-syzygy.json`。目前effects註明尚未執行，不能用它憑空封港／發新聞。新增即使不用RNG，也可能改潮級、flag與hash，再影響獸／作戰；只被未達日期觸發的純文案定義則在觸發前無改。本輪不新增omens，避免改天象與第40蝕月。

### recruit-pools、backgrounds（招募池與背景）

recruit必有id/place/sources/size/refreshOn，sources指background並給weight；background必有id/name/culture/attrRanges/hireFee/wageMult，可帶traits/person。人員由base人物模板實例化再擲屬性、名字，不能把lore character當人物模板；culture需有既有名表。範本 `recruit-pools/dhaka.json`、`backgrounds/refugee.json`。弦月招募用RNG，新池即使未招人也會改名冊與抽數；無池引用的background不一定會用。本輪不新增兩類。

### names（名表）

id/culture/names/epithets齊備，culture不能重複，names至少12個；神話／凶名／機型名各由消費端選文化或既定id，不是新建任何culture就能被抽。範本查templates及既有 `names/mythic-*`，原 `nick-*` 有精確id依賴不可動。新增被選中的名池改隨機索引對應，即使抽數相同結果也會變；未引用文化可休眠。本輪不加名表。

### research（科研）

id/name/direction/cost.coin/cost.techHours/requires/unlocks必填，consumes可選；unlocks的kind為component/modification/service/soul-node，id要有真實目標，requires要可達且無環。`research/restraint.json`是範本，queue以research id啟動、支付資源與工時。開局遍歷所有research建立狀態，新增就可能改完整state hash；是否耗RNG取決於後續解鎖與使用。本輪不新增解鎖或改科技成本。

### rooms（房間）

id/title/base/exits/phrases必填，phrase有when/text；房間id、ship.rooms、exits及實際人物房間要一起接。範本 `rooms/galley.json`，船上go命令須在目前房間exits裡；不是加一個港口房間便有入口。片語Cond跟狀態變，單純新增未接房間通常不耗RNG；接上並改行為後可能改狀態。本輪用既有酒艙／機庫說話。

### templates（日誌文字模板）

id/entries必填，entries的key是既有CampaignEvent型別，value含kind/text；範本 `templates/default.json`。`text/templates.ts`依pack、id順序合併，後面的同key可覆蓋前面。插值只能讀既有payload，沒有新聞排程，也不能靠新key新增事件來源。一般只改渲染、不耗RNG，但快照文字測試仍可能受影響；本輪不新增覆蓋模板。

### maps、regions、wterrains（世界方格與地形）

maps必有id/name/width/height/cellKm/fog/riftRate/legend/base.rows，region/road/darkRects可選；RLE列長與圖例須正確，legend引用wterrain。regions有id/map/regions字典，各項name/phrase；wterrain有id/name/glyph/airCost/groundCost/sight/encounter/riftAffinity/battlePool/flavor，battlePool指core terrain而非世界地形。範本 `maps/longland.json`、`regions/longland.json`、`wterrains/plain.json`。地形由座標查表，世界生成、移動、蝕塊與遭遇會讀；新地圖增加狀態與生獸候選，會改黃金。regions純名稱未必耗RNG；地形成本與池不屬文字填充。本輪全部不加。

### lanes（跨圖航道）

id/a/b/kind/days/carriesShip/requires/hazards/tags必填，departDays/fare/fuelPerDay/capacity可選；a/b必為world place、days正整數。範本只有 `lanes/selene.json`，只作接口調查，不複製月面內容。sail跨圖或離島時讀，departDays決定等船；新航道改可達性、時間和後續RNG。hazards列存在不等於任意新事件table都已有消費端，不能照舊spec假造eventtable。本輪不加lane。

### rifts（裂縫族）

id/family/vanguard/spreadPerTide/selfClose/tether/gradeByWidth必填，anchor/monsters可選；引用core species與monster，範本 `rifts/insect.json`。生成裂縫、按寬度取級與出戰選獸會讀；monsters不等於生態位條件，新增獸到此池會改既有隨機結果。不能在此輪藉新rift另造S領主或覆寫族規則，本輪不動。

### actors（世界行動者表）

id/kind/mp/layer/contact/str/stance/spawn/aiChoice/parley/behavior為現行實檔主要必備欄，kind是force/patrol/caravan/swarm/band；parley用Choice，spawn是各生成點配額與時距，behavior是追逐／返航等日數。範本 `actors/patrol.json`。消費端依kind建立與推進行動者，新增會改遭遇及RNG，並非新NPC故事表。屬AI行為資料，本輪明確排除，不計任何新件。

### models、lineages（機型與血統）

model有id/frame/lineage/maker/series/mark/role/tier/cost/requires/availableFrom/exportPolicy/generic/tags；frame需mechanical、maker指勢力或generic、requires須無環。lineage有id/name/source/traits/tags，非generic的source指古代frame且holder須活勢力，已有古代機歸屬不能重造。範本 `models/bulwark-i.json`、`lineages/universal-bulwark.json`。研發初始化、勢力補員、市場filter會讀；新增會改機型池、軍力、抽選與黃金。這輪引用既有機型，不新增，也不借新血統預決古代機認主。

### forces、treaties（補員與條約）

forces範本 `forces/replenish.json` 含id/replenish/gp/readiness/homeSupply/initialSupply/maxDays/shells及當前speed/rift設定；shells連古代frame及holder。戰力點、補員、古代機狀態由war層讀，不是逐勢力各增一份；排序或係數變動會改完整世界軌跡。treaty有id/kind/days/requires/terms/onExpire/breakIf；範本 `treaties/alliance.json`，由戰爭牌／外交效果生效，requires含關係狀態與Cond，terms用OpsEffect。無使用來源的條約可休眠，接入會影響軍力互動、市場及warRng。本輪兩者皆不新增。

### 單檔設定與campaign-start

calendar有id/daysPerMonth/spring/neap及可選monthsPerYear/epochMonth/stageWindow；ship有id/rooms/capacity/fuel/hull，現行移動另讀mp/fuelPerDay/sight等。affinity有id/pairs/rules，keymap-ops有id/bindings（action/keys/label/context）；start有id/day/place/ship/cash/debt/mechs/persons/stocks/tickets/flags，calendar/pressure/rifts依範本。分別範本為 `calendar.json`、`ship.json`、`affinity.json`、`keymap-ops.json`、`campaign-start/default.json`。都由固定入口或明選開局讀，不靠隨機抽檔；改clock、船、外交與開局會改state／後續RNG，純鍵位則偏呈現。本輪不改或新增替代設定。

### 黃金判斷與合併責任

新增world檔不等於所有黃金都必變；要分「定義被載入」「進狀態」「進候選池」「玩家觸發」。本批1–6在port tag/contractKinds未套前是休眠，套後視為會改戰役；第7不抽RNG，未談話軌跡預期不變，但晚期談話會有狀態差異。不可因孤立工人worktree全綠就宣稱合併後也全綠。

預期檢視範圍：`test/campaigns/*.json`與`*.hash.json`（ops-war-assault、ops-relic、ops-merc-join、ops-betrayal、ops-leak）、`test/campaigns/golden-spec.ts`與`grid-actors.hash.json`、`src/ops/sim/fixtures/campaign-hash.json`；寫死天數的`src/ops/sim/campaign.test.ts`、長wait的`src/ops/time/tick.test.ts`及同類軌跡測試。`test/golden/`是戰鬥層，沒有改core單位／規則，不預期為本批重錄；若紅先查真因，不能直接豁免。lead-rep已證明合約編號與指令意圖要人工重對，rerecord不會替人修好所有contract id。

所有產出工人：**黃金紅時列檔名，不改期望、不跑 GOLDEN_UPDATE／rerecord**。領導在七批與inserts合併完、排除非黃金失敗後整批重錄一次，與其他引擎線排他協調。manifest checks只要求check/typecheck/test/readlist；ops-check額外由既有驗收腳本自動跑。本輪不改content_accept，它沒有通用黃金waiver解析，manifest註記只供領導審核，不能假報ACCEPT。

### engine-backlog 候選（只記本計畫，不改總表）

**話題選單與歷史人物在地對話（小／中）**：現有UI無topic選單且只接船員實例，55個具營運潛力人物零引用；先補可列合法topic的按鈕與seen優先，後續另做有存活／在場條件的NPC聯絡，不把lore id當person。本輪用bf一次性前置話題與轉述，未解決遠方NPC本人互動。

**其餘地球地圖與真正可達港市（大）**：81地點中71零引用，現有longland不能代表每洲。沿backlog 1剩餘圖工作，先做map/regions/place/lanes整套，再開市場、地方勢力與服務；本輪只保留新聞／物件入口。

**怪獸生態位及指定物種（中）**：合併backlog 66/53，現有encounter的隨機伴隨只能族＋級；可增加物種／棲位白名單與地域錨池。指定單獸已有killTarget接法，本輪使用它但不改rifts池、不造新二名獸。

**非船員的新聞與延遲回信載體（小）**：新聞目前也是會打斷日結的prompt；36個一次性事件每月四個抽取日仍共享機會。可另做不中斷的新聞欄與seen抽取規則；本輪守既有日槽，不加頻率、不調權重。

**真正護航／救援單位與在地服務路由（中）**：contract雖有可選escort語法，地圖商隊／救援對象未必綁進作戰，services/jobs也非任意新增即有UI。沿backlog 1既有護送綁商隊條處理；本輪明寫survive目標，不聲稱新按鈕、真貨物運輸或救援單位機制已完成。

## 3. 盤點與缺口

[gaps.json](gaps.json) 為189列wf-table/1，固定欄位「實體、類型、區、base 引用數、建議」。48個勢力全列；主要地點選地球81個（排月面／軌道與已連species的微型獸場）；人物選60位公開、未記死亡、具營運潛力的人類，不含機魂／古代存在／月面或軌道常駐者。這是用途篩選，不宣稱全部人物89名都應成為船員。

計數分母是本次419個 `content/base/world/**/*.json`；每實體按不同檔數計，精確id、完整顯示名、明示gameRefs及核對過base異名任一命中算一次。定義檔與純敘事提及也計，因此**引用數不是可達保證**。不計lore與index；frame/species等gameRef不冒算地方與人物登場。別名含league→residual-league、anvil→anvil-hunters、salt-gull→salt-gull-hunters、tide-creed→tide-faith、whitegloves→selene-whitegloves。content_index refs查到的是全base引用，範圍與全文計數不同，例如anvil-hunters工具13檔含3個world外情境，不能直接覆蓋此表。

零出現：勢力26／48、地點70／81、人物55／60。六區是工作分組，中亞/俄羅斯歸東亞，東南亞/大洋洲/南極歸海上；月面四勢力另標「留接口」仍在48勢力母體內。重點如下，完整數字以gaps為準。

東亞：釜山、韓傘、中亞傘、衍一聯合、守寢人；阿拉木圖、成都行在、慶州古陵與仙台。先讓拖機手的誇口、古陵門影與北方接獸急約進港；本輪不假造國家外派新主權地點。

南亞：拆船幫、孟買歸還黨、補天院、還鄉院、庫爾納、第七哨lore地點；羅凱婭與哈米德可由候鳥號既有人物轉述，未創base person。地點同名仍要區分lore場景與base真正落點。

歐洲／內海：歐傘、殘翼；聖馬洛、漢堡、熱那亞、鹿特丹、萊茵蝕溝。讓九門鐘聲、墟光、卸傷岸與護航換班帶出地方脾氣。

非洲／西亞：阿克拉、遠牧、北非/撒南/西亞傘、軛鞍行與兩個歸還／匪幫；亞斯文、金山、荷姆茲、蘇伊士。娜迪雅、泰莫、法莉妲只作有來源的歷史轉述；不讓內陸礦井變成日常出獸洞。

美洲：內陸財團、拉美傘、環線商隊；西雅圖、瓦爾帕萊索、哈瓦那、溫尼伯、巴西利亞、貝倫。讓歸船砲與礁角舊影、海岸誓言及走音唱名進入玩家生活；不再憑空添加古代機出洲。

海上／殘聯：無籤會、舊廠諸家、新加坡核交易所/港務、雪梨；三寶顏、望加錫、奧克蘭。星哨本次仍零出現，但不因補洞越進軌道營運。殘聯本身已有多處引用，補的是具體人與艙內畫面。

## 4. 設計理念

讓玩家先看見獸擋住當班的岸，再聽人吼出接戰理由。窮船仍漏氣，但它接的十六組契約都真的有獸出場。光可以是獸腹、墟影、岸砲，也可以是一個人明知誇張仍吼出口的話。吼完容許撞門、破音和嘴硬，讓黑色幽默與浪漫在同一個畫面。每件事件都要讓玩家決定保住出擊的錢與修料，還是換來士氣或修造經驗；加班也會傷士氣。候鳥號四人保留各自的創傷與脾氣，不把他們寫成同一個溫柔旁白。遠方只能先透過抵港者與舊聞被遇到，地圖接通前不冒稱當地可航往。

### 方法與禁忌（bf-common原樣）

本輪另依 `wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`：契約14–18組、事件每件一道光且至少三分之二有獸／奇觀或吼句、各限額物件核心畫面最多2件。

1. **節點優先、不暴力產 lore**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（`wf/workflows/planning/design-notes/world/history-lines.md`），有因有果。不掛得上就不寫。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`）：**少寫帳務與法理、多一點人、畫面、獸、神話的光**。「地契押給月亮」「商團出糧傭兵守港」「井＋糧倉＋公司排班」這類模板句已經寫過很多遍，不再重複。每件要有一個人、一個畫面或一句能吼出來的話。
3. **不拿其他作品類比**：不寫任何外部作品名、角色、電影或遊戲比喻；量級用世界內的詞。
4. **中文命名避免直譯**：兩步命名（先想原意，再取中文，不逐字翻）；古代機本體就叫古代機、外層叫裝甲；潮→蝕（蝕潮、漲潮、大潮、連珠潮）；用語與禁用詞照 `content/lore/style.md`。新中文名不要回譯成英文 aka。
5. **國家、塞勒涅、巨頭只削弱不萬能**：有錢有法理，但到不了每一座城、買不到古代機；塞勒涅不當主謀。富豪、家族、公司群像不點名（職稱可寫）。
6. **古代機與 S 級高高在上**：不寫它們被打倒、被操縱、被交易；古代機周邊寫人（守寢人、學會、村子、看守的崗），古代機本身不動（除既有 lore 已寫的）、不預決誰認主。S 領主不出場（萬潮葬王是唯一例外，本輪不碰）。
7. **對面無臉**：怪獸沒有人格化指揮者、不談、不怕；怪獸不是畜牲（不寫餵、馴、乖、寵物）。A 級以上才有二名。
8. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md` 全部、既有 lore、年表。矛盾記 REPORT「需要決定」，不自己改舊檔。
9. **真相用可見度**：外界不知道的放 `secrets`（`visibility: hidden`）或 `rumor`；`summary`／`body` 照外界口吻。
10. **開局（2108-01）後可能發生、日期不定的事件**用 `occurs: possible`（見 `content/lore/README.md`）。
11. **新名詞標提案**：規格外新造的專名或概念詞，在 REPORT「需要決定」與 review 列「名稱」後加「（提案）」。能不造就不造。
12. **文筆不強求**：只查禁忌與掛點，不為了文采加長。

上述occurs／secrets規則只在有對應lore欄位時適用；本輪沒有新lore，不把它們硬塞進EventDef。遇到hidden真相則不寫到營運公開文字，rumor用人物口吻保留不確定。新事件標題為既有語彙組合，不造新專名；工人若要新增概念詞必在review名稱與REPORT標提案。

## 5. 新件表（99件）

[review-draft.json](review-draft.json) 是唯一逐檔規格表，固定五欄「檔、類別、名稱、白話、掛到」。白話≤60字；掛到含批次、lore id、節點／底色、同目錄範本、觸發、欄位定案、文字要點、插入需求、是否改黃金；另加出場怪獸、光、真代價、角色脾氣及核心意象限額分類供核對，不是遊戲JSON新欄位。

總量16 contracts＋16 encounters＋16 actions＋36 events＋15 dialogues＝99件。契約組全部三檔同批；新檔只引用HEAD既有id或同批新id，沒有跨批新引用。contracts用bf-、actions用board-bf-、events用port-bf-/news-bf-、encounters用rift-z-bf-；dialogues以已裁定bf-排序例外讓一次性話題排在舊永真話題之前。目錄已ls核對，終驗再檢查全計畫唯一且不撞現存檔。

36事件逐件有b吼句、c真代價，b覆蓋36/36，高於至少24件的門檻；獸／奇觀另自然落在萊茵獸撞盾、亞斯文放閘、綠線巢母、歸船礁角與墟影等場面，不為湊數在內陸加獸。13件用修料／科研／加班取捨，其餘23件保留現金與士氣取捨。各選項須寫明代價。六類核心畫面計數：拓本／拓照1（蒙特婁）、鞋0、碗／湯／飯0、繩／纜0、空擔架0、空座0。計數只計畫面主體，不把lore掛點或規則中的禁用提醒算件；契約同組三檔也不得各自增加限額畫面。工人不可把背景字眼改成新的主意象。

四位既有候鳥號船員的15話題全保留：蓮4、小海4、伊爾瑟4、瑪拉3；逐則有脾氣、代表句與兩個回應動作。蓮和小海的人稱按現有男性人物檔，伊爾瑟與瑪拉按女性人物檔。本輪已ls核對characters，無新增character/person id、無招募池，與lead-fill-pilots不爭人物檔。產出工人若覺得需要新人物，回報需要決定，不擴範圍。

每件「欄位定案」是寫手規格：合法結構與數字照填，choice1/choice2/text方向/lines規格須轉成真正choices與文句，不能直接把規格當遊戲內容。對話2–4句且每句≤40字；事件60–160字。契約沒有已實作brief長文，因此name必保留獸名與當下理由，不能潤飾成只剩詩句。沒新增places/markets/services/factions-ops/jobs/operations/omens；0個月面營運、0個AI、0個萬潮葬王相關產出。

## 6. 分批與完整檔案清單

七批可各自產出：前三批是契約組，4–6各12事件，7為15對話。完整白名單在下方與各manifest.files；批內配套不拆開。工人只新增檔；合併線去重套inserts，接線完成後領導整批重錄一次黃金。

### bf-play-01 — 外派船抵港，先過獸關；只新增18個營運檔

是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。

```text
content/base/world/encounters/rift-z-bf-court-grain.json
content/base/world/contracts/bf-court-grain.json
content/base/world/actions/board-bf-court-grain.json
content/base/world/encounters/rift-z-bf-tiksi-raincoat.json
content/base/world/contracts/bf-tiksi-raincoat.json
content/base/world/actions/board-bf-tiksi-raincoat.json
content/base/world/encounters/rift-z-bf-sendai-gate.json
content/base/world/contracts/bf-sendai-gate.json
content/base/world/actions/board-bf-sendai-gate.json
content/base/world/encounters/rift-z-bf-seattle-return-gun.json
content/base/world/contracts/bf-seattle-return-gun.json
content/base/world/actions/board-bf-seattle-return-gun.json
content/base/world/encounters/rift-z-bf-genoa-shared-forge.json
content/base/world/contracts/bf-genoa-shared-forge.json
content/base/world/actions/board-bf-genoa-shared-forge.json
content/base/world/encounters/rift-z-bf-quito-coast-beacon.json
content/base/world/contracts/bf-quito-coast-beacon.json
content/base/world/actions/board-bf-quito-coast-beacon.json
```

[交接書稿](cx-bf-play-01.md)｜[manifest稿](bf-play-01.manifest.json)

### bf-play-02 — 守住交班的岸；只新增18個營運檔

是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。

```text
content/base/world/encounters/rift-z-bf-nairobi-yoke-return.json
content/base/world/contracts/bf-nairobi-yoke-return.json
content/base/world/actions/board-bf-nairobi-yoke-return.json
content/base/world/encounters/rift-z-bf-dhaka-first-stitch.json
content/base/world/contracts/bf-dhaka-first-stitch.json
content/base/world/actions/board-bf-dhaka-first-stitch.json
content/base/world/encounters/rift-z-bf-anvil-shield-turn.json
content/base/world/contracts/bf-anvil-shield-turn.json
content/base/world/actions/board-bf-anvil-shield-turn.json
content/base/world/encounters/rift-z-bf-saltgull-tide-ramp.json
content/base/world/contracts/bf-saltgull-tide-ramp.json
content/base/world/actions/board-bf-saltgull-tide-ramp.json
content/base/world/encounters/rift-z-bf-league-lantern-keel.json
content/base/world/contracts/bf-league-lantern-keel.json
content/base/world/actions/board-bf-league-lantern-keel.json
content/base/world/encounters/rift-z-bf-breakers-salt-needle.json
content/base/world/contracts/bf-breakers-salt-needle.json
content/base/world/actions/board-bf-breakers-salt-needle.json
```

[交接書稿](cx-bf-play-02.md)｜[manifest稿](bf-play-02.manifest.json)

### bf-play-03 — 淡水與海岸的當班急約；只新增12個營運檔

是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。

```text
content/base/world/encounters/rift-z-bf-exchange-bent-needle.json
content/base/world/contracts/bf-exchange-bent-needle.json
content/base/world/actions/board-bf-exchange-bent-needle.json
content/base/world/encounters/rift-z-bf-weavers-wick-mat.json
content/base/world/contracts/bf-weavers-wick-mat.json
content/base/world/actions/board-bf-weavers-wick-mat.json
content/base/world/encounters/rift-z-bf-japan-shoal-turn.json
content/base/world/contracts/bf-japan-shoal-turn.json
content/base/world/actions/board-bf-japan-shoal-turn.json
content/base/world/encounters/rift-z-bf-court-cargo-ramp.json
content/base/world/contracts/bf-court-cargo-ramp.json
content/base/world/actions/board-bf-court-cargo-ramp.json
```

[交接書稿](cx-bf-play-03.md)｜[manifest稿](bf-play-03.manifest.json)

### bf-play-04 — 東亞與南亞，把話吼出去；只新增12個營運檔

是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。

```text
content/base/world/events/port-bf-sail-first-needle.json
content/base/world/events/port-bf-khulna-iron-chorus.json
content/base/world/events/port-bf-surat-keys.json
content/base/world/events/port-bf-seventh-child-watch.json
content/base/world/events/port-bf-sermon-no-kneeling.json
content/base/world/events/news-bf-incheon-shoulders.json
content/base/world/events/port-bf-busan-hauling-song.json
content/base/world/events/news-bf-almaty-mountain-oath.json
content/base/world/events/port-bf-golmud-raised-arm.json
content/base/world/events/news-bf-wardens-still-door.json
content/base/world/events/news-bf-tiksi-lantern.json
content/base/world/events/port-bf-court-wet-banner.json
```

[交接書稿](cx-bf-play-04.md)｜[manifest稿](bf-play-04.manifest.json)

### bf-play-05 — 歐洲與非洲，光照到岸；只新增12個營運檔

是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。

```text
content/base/world/events/port-bf-malo-nine-bells.json
content/base/world/events/port-bf-roost-unloading-shore.json
content/base/world/events/port-bf-genoa-forge-roar.json
content/base/world/events/news-bf-rhine-training.json
content/base/world/events/port-bf-wings-ground-chorus.json
content/base/world/events/news-bf-alpine-fence.json
content/base/world/events/port-bf-aswan-wet-fields.json
content/base/world/events/port-bf-suez-next-watch.json
content/base/world/events/news-bf-hormuz-fire-night.json
content/base/world/events/port-bf-djibouti-yoke-shout.json
content/base/world/events/news-bf-goldreef-heat-first.json
content/base/world/events/news-bf-greenline-old-chain.json
```

[交接書稿](cx-bf-play-05.md)｜[manifest稿](bf-play-05.manifest.json)

### bf-play-06 — 美洲與海上，歸船仍朝海；只新增12個營運檔

是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。

```text
content/base/world/events/news-bf-seattle-gun-name.json
content/base/world/events/news-bf-valparaiso-coast-oath.json
content/base/world/events/port-bf-havana-night-chorus.json
content/base/world/events/news-bf-winnipeg-last-name.json
content/base/world/events/port-bf-caravan-wheel-oath.json
content/base/world/events/news-bf-brasilia-clock-oath.json
content/base/world/events/port-bf-belem-cargo-roar.json
content/base/world/events/news-bf-denver-grainline.json
content/base/world/events/port-bf-montreal-unread-line.json
content/base/world/events/port-bf-cartagena-old-mast.json
content/base/world/events/port-bf-zamboanga-answer.json
content/base/world/events/port-bf-makassar-top-sail.json
```

[交接書稿](cx-bf-play-06.md)｜[manifest稿](bf-play-06.manifest.json)

### bf-play-07 — 候鳥號的嘴硬與誇口；只新增15個營運檔

是否改黃金：預期不會改既有未談話黃金；晚期談話碰到新話題會改旗標／士氣與後續狀態，屬條件性風險。

```text
content/base/world/dialogues/bf-ren-kasai-needle.json
content/base/world/dialogues/bf-ren-kasai-mugyeom.json
content/base/world/dialogues/bf-ren-kasai-ironmouth.json
content/base/world/dialogues/bf-ren-kasai-kamchatka.json
content/base/world/dialogues/bf-chen-xiaohai-seventh.json
content/base/world/dialogues/bf-chen-xiaohai-keys.json
content/base/world/dialogues/bf-chen-xiaohai-silas.json
content/base/world/dialogues/bf-chen-xiaohai-lira.json
content/base/world/dialogues/bf-ilse-brandt-lena.json
content/base/world/dialogues/bf-ilse-brandt-watch.json
content/base/world/dialogues/bf-ilse-brandt-names.json
content/base/world/dialogues/bf-ilse-brandt-paid-window.json
content/base/world/dialogues/bf-mara-okoye-nadia.json
content/base/world/dialogues/bf-mara-okoye-temo.json
content/base/world/dialogues/bf-mara-okoye-farida.json
```

[交接書稿](cx-bf-play-07.md)｜[manifest稿](bf-play-07.manifest.json)

插入需求僅三個現有place.tags與16個契約各自的唯一雇主contractKinds，均append；跨批重複tag由合併線去重。world牌不用改actionLanes。兩件拆船班／交易所請託由殘聯代接，聲望歸殘聯，不指向不存在的faction-ops。所有款項、聲望與冷卻照同級既有範本；本輪沒有兩家獵團互殺任務。

## 7. 月面空位（只留接口，不設計內容）

渡月港契約可用地球港world發包牌＋契約／遭遇；暗面走私用港口事件＋既有旗標；白手套催收用地球事件與其既有聲望效果；罷工新聞用news前綴EventDef。是否真正接入由月面線設計，本輪只留接口。

四接口無新id、檔名、件數或本批manifest授權。月面勢力仍列gaps母體，只作盤點，絕非月面營運產出。

## 8. 產出交接書稿

七份cx-bf-play-01至07依已搬到done/2026-10-26/的kaiju2-01骨架撰寫，每份都有方法與禁忌、明列白名單、逐檔規格、必用工具、資源禁區、工作、交付、固定五條產出驗收與終局回報。每份方法與禁忌直接引用play-rulings；mustRead只用現存路徑。worktree、報告目錄、teams/bigfill與子代理上限1沿原交接書。

產出只新增，登記插入交inserts.json（wf-table/1，file/jsonPath/op/value/why；本案只有append）；不改既有檔、索引、manifest、程式或測試，不commit。工人須在worktree內check 0 errors、ops check 0、typecheck 0、npm test；黃金紅只列測試與fixture原始錯誤，不改期望、不跑GOLDEN_UPDATE／rerecord。其餘錯誤不得借黃金名義豁免。

## 9. manifest稿

七份bf-play-01至07.manifest.json沿content-batch/1：mode add、status draft、base TBD、allow.modify空、allow.kinds精確對應該批目錄、maxFiles/files/ids/plannedFiles同件數。reportDir指向lead-bigfill/bf-play-NN。checks沿範本可適用項check/typecheck/test/readlist；純營運資料無新能力或單位，不要求probe/MCP。黃金例外寫在checkNotes與planning，不假裝工具能自動豁免紅測試。

領導先填實際base、預置worktree與正式manifest再派產出；這些草稿不授權工人建分支、改manifest或自行重錄黃金。未套inserts前只能稱休眠交付；接線後才驗世界可遇到。

## 10. 需求與待決

領導已裁定的範圍、黃金集中重錄、對話排序例外、外洲抵港呈現及inserts分工不再列為待決。本輪交99件／7批供敘事審閱；無新增人物名、無新專名或需要使用者先決定的概念。新標題與吼句皆是普通語句，不當新招式或神器名稱。

接線後仍需領導安排唯一黃金重錄窗口與合併線。現有引擎指定encounter的width=D與額外killTarget生成已如實記在第2段；本線用既有接法完成明列獸，不要求改引擎。若未來需要嚴格多物種比例、生態位白名單或活捕驗收，再交engine-backlog候選，不交產出工人補欄。

36事件仍共享每月四個日槽，不能保證一輪短戰役全看完；15話題須本人在名冊與當前房間，不為露出把別人塞上船。gaps的引用數與計畫曝光是不同欄意：已引用仍可能未接線，零引用人物不等於本輪必須招募。

驗收證據依原交接書固定四條記錄於末段；件數門檻以本輪90–120為準，完成即停止，不延伸到content產出。

本輪驗收結果（2026-10-26，固定四條）：

1. plan.md存在且含1–10段；正文47,215 bytes，連本段仍低於50 KB。
2. gaps.json合法189列（48勢力、81地點、60人物），review-draft.json合法99列；白話最長33字，路徑全計畫唯一、不撞現存檔。16組契約、36事件、15原話題；36/36事件有b與c，六類限額核心畫面最多1件。
3. 七份交接書各跑brief_lint --strict exit 0；七份manifest合法，件數18/18/12/12/12/12/15，files／ids／逐檔規格相符，皆標黃金影響，mustRead全存在。16組指定獸以記憶體overlay生成情境及載入setup皆通過，未寫content。
4. 新件表逐檔核對：0個萬潮葬王／AI／月面營運件；掛點與落點均屬地球範圍，0個新增character/person id。

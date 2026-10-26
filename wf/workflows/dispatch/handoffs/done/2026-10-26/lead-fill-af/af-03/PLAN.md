# 已讀清單

本線 cx-af-03p；計畫供領導審。以下路徑相對專案根，分組中的檔名均已親讀。

規矩：`AGENTS.md`、`wf/WORKFLOWS.md`、`wf/STRUCTURE.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`；`wf/workflows/common/` 的 `user.md`、`data-files.md`；`wf/workflows/content/` 的 `README.md`、`batch.md`、`lore-text.md`、`world-pillars.md`。另讀支柱入口 `world.md`、`mechs.md`、`bio-battle.md`，及其 `world/tone-and-rules.md`、`world/factions-and-sandbox.md`、`world/monsters.md`、`mechs/bonds.md`、`bio-battle/bio.md`；`wf/workflows/inbox/README.md`、`PROTOCOL.md`。

格式與史線：`content/lore/README.md`、`style.md`、`style/people.md`；`wf/workflows/planning/design-notes/world/` 的 `history-lines.md`（含框架、崩年的底色）、`before-collapse-powers.md`、`polity.md`、`history-lines/g-umbrella.md`；`history-nodes.json` 已用 tabledb 逐列讀 0–9。

任務與批次：`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/cx-af-03p.md`、同目錄 `review.json` 全 25 列；用 tabledb 取 `content/batches/2026-10/af-01.json`、`af-02.json` 的 `files`，親讀其全部 25 檔，詳列如下。

af-01（以下均在 `content/lore/`）：`factions/` 的 `sub-saharan-umbrella.json`、`north-africa-umbrella.json`、`west-asia-umbrella.json`、`yoke-saddle-works.json`；`events/` 的 `aswan-sluice-night.json`、`hormuz-burning-night.json`、`gold-reef-night.json`、`twin-rivers-night.json`、`suez-canal-night.json`；`places/` 的 `aswan.json`、`hormuz.json`、`gold-reef.json`、`suez.json`、`twin-rivers.json`。

af-02：`places/` 的 `djibouti.json`、`dhahran.json`、`dubai.json`、`mombasa.json`；`factions/` 的 `lagos-returners.json`、`far-herd.json`；`events/` 的 `djibouti-charter.json`、`yoke-riders-abroad.json`；`characters/` 的 `nadia-sabri.json`、`juma-kiprop.json`、`farida-naseri.json`。

引用與查重補讀：`content/lore/characters/` 的 `wanjiku-kamau.json`、`eugenia-ferrero.json`、`livia-avelar.json`、`maelle-bellerive.json`、`lira-santos.json`；`content/lore/events/hunter-license-act.json`、`league-founded.json`。已以 `grep -rl` 分別查四人的中文名、姓氏、英文拼寫，皆無命中；另查全庫引用、人物職責及姓名近音。首步與查重後均已輪詢 orders，無新指示。

## 設計理念

讓三把傘的制度落到四個要承擔後果的人身上：援軍送往哪裡、井口何時放籠、斷橋後誰留船、護航交班誰先走。四人各承接一個既有空位，崩前的生計經斷鏈變成守線責任。英雄的一次決定會留下別人至今不肯原諒的代價；到開場時，他們仍須跟工人、船工、騎手合力過夜。這批只提四名人類及其關係，不增事件、地點、勢力或機型。

## 相關概念

國家／傘／城邦：法理、援軍分配、一夜到的三層權力；出處 `world/polity.md`。

崩年底色：斷鏈、成年層厚與新駕駛員缺口、守住與走出者互不原諒；出處 `world/history-lines.md` 1.1、1.4、1.6、1.11。

撒南成傘與雙籤：2100 成傘；蒙巴薩向誰求援就是政治表態；出處 `factions/sub-saharan-umbrella.json`、`places/mombasa.json`。

地熱井與墟出精粹：地熱養城、裂晶出井後煉成精粹；出處 `events/gold-reef-night.json`、`places/gold-reef.json`。

斷橋與停戰：2100 破的是默契，橋至今未修；出處 `events/twin-rivers-night.json`、`places/twin-rivers.json`。

獵牌與輪值：殘聯跨傘發牌，兩傘仍掌運河護航費；出處 `events/hunter-license-act.json`、`events/suez-canal-night.json`。

人物外觀與真相：現役駕駛老得慢；傳聞只進 `secrets` 並標 `visibility`；出處 `style/people.md`、`content/lore/README.md`。上列 `world/` 指 design-notes/world，其餘分類指 content/lore。

## 逐件

四名及新增經歷、關係均為提案；英文原名是虛構拼寫，意涵指創作意象，不冒充真實語源。全員 `kind: human`、`visibility: public`、`gameRefs: []`；事件陣列只填下列既存 id。

### 1. 薩蕾・恩多維

檔名：`characters/sarei-ndovi.json`。英文原名：Sarei Ndovi；意涵：把空缺留在桌上的分援者。出生：2067。陣營：`faction/sub-saharan-umbrella`。身分：撒南傘大潮前協調拘束獸群、騎手與援船的調度人。

崩前→節點→2108-01：崩前在蒙巴薩替內陸貨隊排車；崩年貨隊斷糧，她拿著排班簿跟人撤回高地。2099 失城與得墟讓港口、深井互有所求，2100 成傘時她承接各地可出人船的回報，將獸、拘束件、騎手與護運排成能出發的一班。2108-01 仍在兩個求援港之間分不足的人手；蒙巴薩若向殘聯求援，她記明選擇，要求撒南席位答覆缺額，不替城改籤。

因果：斷鏈讓她不再相信「已發出」等於「會到」；兩根柱得靠運送接合，才需要她的調度。雙籤選擇傷的是撒南席位的臉面，她卻得先交代今晚誰能到。掛 G 線、N05→2100 成傘→N08；她是執行分配的人，沒有國家席位或獨斷徵召權。

關係列（提案）：`character/wanjiku-kamau`｜供應協調｜向市長核實軛鞍行能交的拘束件與人手，保留市長與工棚的決定權。`character/juma-kiprop`｜守港議約｜請遠牧接守港約時，朱瑪會先問誰付延誤外洋契約的錢。

事件 id：`event/gold-reef-night`、`event/yoke-riders-abroad`；前者寫分援來源，後者寫出洋排班的參與，不增成傘事件檔。外觀／口頭禪：「船到了，再劃掉。」她不上機，年齡照常走。查重：與萬吉庫的市長／工坊後台、朱瑪的團長職責分開，也不複製拉美糧商國家席位代表。

白話草稿：她在大潮前分派騎手與獸，總有人分不到。雙籤港向別傘求救時，她得把這筆缺額留給自己人看。

### 2. 泰莫・莫魯恩

檔名：`characters/temo-moruen.json`。英文原名：Temo Moruen；意涵：空籠之後，仍帶下一班下井的人。出生：2062。陣營：`faction/sub-saharan-umbrella`。身分：金山深井的管井人，握地熱與升降籠日常排班的實際城主。

崩前→節點→2108-01：崩前修金礦升降籠；崩年把礦道改作避難隧道、協助維持地熱。2099 塌穿後，他是第一趟復探中帶班乘籠下井的人；同伴在井口守纜，見到刻痕與裂晶的人一起回報，沒帶回失蹤的當班礦工。2100 共管後，他留任管井。2108-01 地熱修工與採掘班共用人手，他先把修工送下去，讓等裂晶的護運隊多等一班。

因果：城要先有地熱才能留住礦工，傘要精粹又不能停城；他從會修籠變成能決定誰先下井的人。城主的權力來自日常供應，仍受國家法理、傘守備與工班制約。掛金山夜、N05、2100 成傘，不把他寫成煉法發明者或礦井私有者。

關係列（提案）：`character/wanjiku-kamau`｜互供議價｜以金山護運與工坊維修互相催交，市長要精粹，他要先到的備件。學會仍按既有規矩付費下井，無須另塞會長親訪。

事件 id：`event/gold-reef-night`。外觀：一側眉毛被舊傷截開，離井後也洗不掉眉梢石粉；非駕駛，無不老設定。查重：現有人物沒有金山管井職位；與達蘭公司城相同的握井權力只作類比於本世界制度，沿用金山共管而不另立公司。

白話草稿：金山夜後，他第一趟帶籠下井，找到遺跡卻找不回當班的人。如今他管著深井，先保城裡有地熱。

### 3. 薩赫恩・達里姆

檔名：`characters/sahen-darim.json`。英文原名：Sahen Darim；意涵：被留在對岸、從此不肯先收渡纜的人。出生：2074。陣營：`faction/west-asia-umbrella`。身分：兩河斷橋受害一方的倖存者，現守停戰線渡船。

崩前→節點→2108-01：崩前跟河船運糧；崩年陪逃難者往能守的河岸退，之後受本國徵召搬傷員。2100 那夜他隨迎獸隊在橋外，身後橋斷，靠船工放來的纜繩上船；有人被留下，他也活下來。2108-01 他替原來那一岸撐渡船，先留回程船位，再接搬糧與撤傷的活；橋仍斷著，對岸仍記得他站哪邊。

因果：崩年走出來的人靠退路活命，守住岸的人卻把先退讀成棄守；斷橋將兩種記憶疊在他身上。他肯載對岸傷員，仍不原諒炸橋，與本岸只想守糧不留空位的人也吵。掛底色 1.11、斷橋夜及 N10 的破約先例；開場只寫對停戰的不信任。

關係列（提案）：`character/farida-naseri`｜通路往來｜替本岸接糧途經荷姆茲時與名冊官核對船單；他要的是撤路能走，她守的是舊承諾能兌現，核名仍照冊收費，不送免行資格。

事件 id：`event/twin-rivers-night`。外觀／口頭禪：「留一趟空船。」不上機，傷痕不當精粹變異。查重：與莉拉的群島報訊、法莉妲的名冊管理分開；他承擔兩岸選邊與渡船載重，不具預報或調解停戰的能力。

白話草稿：橋炸斷時他正在那頭搬傷員，靠別人的船活下來。如今他撐渡船，不信停戰保證，只肯先留退路。

### 4. 賽芙娜・蘇蕾恩

檔名：`characters/saevna-suren.json`。英文原名：Saevna Suren；意涵：失去半隊船後，仍要接下一班的護航者。出生：2071。陣營：`null`（獨立受雇獵團成員，團名留白）。身分：運河夜船隊的北非受雇護航隊長，如今隨持殘聯獵牌的獵團輪值。

崩前→節點→2108-01：崩前是蘇伊士貨船甲板工；崩年斷鏈後跟著糧船求生，公刻後才學開堅盾-I。2106 北非雇她的隊護同一支船隊，西亞另雇一隊；她聽命等護航權交涉，沒先放船。獸來時她與船工拖開橫船，仍只接住殘存的一半。獵牌法頒布後，團隊登錄，按新輪值接約。2108-01 她仍開堅盾-I，上班先接獸訊，下班等接班機到船旁才離開。

因果：沉船使她失去船工信任，也證明兩張雇約不等於有人真正接防；共同評等讓她能續做護航，不能免掉那夜等命令的責任。掛運河夜、N08／2106 獵牌法；兩傘照樣分收費，殘聯沒有派常備兵接管。

關係列（提案）：`character/nadia-sabri`｜護糧交接｜老閘長替出河谷的糧船核對交接，她須回報護到哪一段；淹田救城與失船都沒讓二人得到受害者的原諒。

事件 id：`event/suez-canal-night`、`event/hunter-license-act`。外觀：現役機械系駕駛，臉比同齡甲板工年輕，手上仍留搬纜的舊繭；無額外變異。查重：與遠牧團長不同，她只帶當班護航隊，並非全球牌照總監，也不新增獵團勢力檔。

白話草稿：兩邊爭護航費時，她帶的船隊沉了一半。如今她拿獵牌輪班，交班的人沒到船邊，她就不走。

## 風險與矛盾

1. **雙籤細則層級有落差。** N08 與 G 線仍註跨傘權責未定，af-02 的蒙巴薩已寫日常歸撒南、求援自選。建議沿用這兩句寫人的困境；不增優先救援、懲罰或裁決規則，交領導判讀來源層級。
2. **城主不等於獨佔井權。** 任務要「地熱井＝城主」，金山 lore 卻明定國家與傘共管。建議泰莫掌日常排班與供應，守備和產權仍按共管；不複製達蘭的公司所有制。
3. **第一趟復探不是井底生還者。** 金山夜當班者未歸，「第一個帶籠」不能改成他從塌陷井底活回來。建議定為塌穿後首趟復探帶班者，保留整班失蹤與群體救援；金山夜仍不入年表。
4. **斷橋不是 N10 已發生。** 2100 破的是大潮停戰默契，2101 才有蝕線協定；N10 是開局後節點。建議只寫既往破約如何留下疑懼，不稱違反尚未簽的協定，不指定上／下游哪方炸橋、不寫未來破約者。
5. **運河掛點不一致。** review 第 7、13 列掛 N09，任務及節點表把 2106 獵牌法放 N08。建議人物主掛 N08，N09 不強接借貸因果；同年只寫「事後採用獵牌法」，不自行補月日或斷言事發時已有獵牌。牌屬獵團，隊長代表團持牌，不變成殘聯軍官。
6. **舊敘述有容易帶入的設定衝突。** `league-founded.json` 有獸「守規矩」、散放整夜；`places/gold-reef.json` 有低階東西從墟裡出來，可能與 W11 來源限制衝突。建議本批調獸一律連拘束艙與騎手，金山只寫採掘／供應，不把墟當刷獸口；2099 塌穿寫發現墟，不改成世界首次出現墟。既有檔的處置交領導，本線不改。

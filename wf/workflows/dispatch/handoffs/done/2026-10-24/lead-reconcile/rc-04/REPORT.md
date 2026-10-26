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
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/dispatch/handoffs/lead-reconcile/guide.md`

其中 AGENTS.md 親自讀取主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘為本線隔離 worktree 的檔案，guide.md 已逐節閱讀。
另讀：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/world-pillars/world/tone-and-rules.md`、`wf/workflows/content/world-pillars/mechs/bonds.md`。透過 `wf/tools/tabledb.py` 查過 history-reconcile.json 的白手套、阿鏽、無肉者、獵牌、七號、老爹與背面相關裁示，未整份讀表。

## 做了什麼

cx-rc-04 依 guide.md 完成 20 個指定 lore 檔的文字改寫：搬七號之魂進鐵偶失敗且死人、拒絕複製降為傳聞、租賃「複本」行銷謊言、阿鏽兩種來源傳聞並存、首例口徑、無肉者宣言、獵牌法，以及勢力「月之暗面／暗面」。未 commit、未修改索引或其他內容檔，無子代理。

落檔前限制在 20 檔，逐檔容量均未達原檔 130%；只替換既有文字，未變更鍵、陣列長度、數值欄或引用。筆記、腳本與檢查輸出全放 `/tmp/cx-rc-04/`；報告目錄只寫本 REPORT.md。

固定五條驗收：

1. `git status --short`：20 個修改檔均在允許名單內，另有原先就存在的 `?? node_modules`。
2. `npm run check`：exit 0，末行 `OK 0 errors, 8 warnings`；其中基礎內容階段為 `OK 0 errors, 12 warnings`。`node content/lore/check.ts`：exit 0，`errors=0 warnings=2`。告警指向未改的 base 資料及 events/busan-returned-seal.json、events/dark-quay-surety.json 未列入 timeline。未跑 npm test、wf-lint、額外驗收鏈或試玩。
3. 指定 20 檔沒有「潮差」；勢力義「背面」已改完，所有保留命中逐處見「殘留」。
4. 下節逐一列出 20 檔改動，片段只摘改動附近，沒有全文傾印。
5. 報告開頭已逐行列出交接書「先讀」的全部路徑。

## 逐檔對照

### `content/lore/characters/a-xiu.json`

- body 傳聞：「七號曾經守過的殘骸」→「月面一台殘骸」，保留塞勒涅否認；補「它身上有七號的紋路」與「可能煉自同一顆核或同一座墟，並非複本」。
- relations[2].relation：「傳聞中的守護者」→「傳聞中同源的機魂」。
- relations[2].note：「來自七號守過的殘骸」→「月面殘骸之說遭塞勒涅否認；另傳它有七號的紋路」。

### `content/lore/characters/glove.json`

- body：「七號拒絕的實驗，手套被迫承受了」→「試把七號的魂搬進鐵偶，失敗且死了人」；「拒絕被複製」明列為傳聞，複製不了才是真相。
- relations[1].note：「七號拒絕的實驗」→「七號被拿去做搬魂試驗」，保留手套被迫受試與兩者不再說話。

### `content/lore/characters/not-yet.json`

- body：「哪個背面的商人」→「哪個暗面的商人」。

### `content/lore/characters/qin-wangshu.json`

- body 魂核：「術式在裡面長成『人』的算核座」→「安放精粹魂核、讓機魂與機甲相接的算核座」。
- body 回家：「七號，第一個登錄機魂」→「老爹早在 2101 年就已登錄，七號是第一個被認為有自己意志的機魂」；補「唯一一次機魂自行回港，至今無解」。

### `content/lore/characters/unit-07.json`

- role：「人類第一個登錄的機魂」→「第一個被認為有自己意志的機魂」。
- summary：「拒絕被複製」→「這次回港至今無解」。
- body 罕見：「也是第一個」→「也是第一個被認為有自己意志的機魂」。
- body 登錄：「人類第一個登錄」→「老爹在 2101 年就已登錄；七號的首例，是被認為有自己意志」。
- body「拒絕」段→「傳聞與試驗」段；「它說……轉而拿手套試驗」→「試把七號的魂搬進鐵偶，失敗且死了人」，拒絕及原對白僅作街頭傳聞。
- body 阿鏽：「可能聽過七號的回港紀錄」→「魂核據說來自月面殘骸」及「紋路……或許出自同一顆核或同一座墟」，兩說都未證實。
- relations[1].note：「它拒絕複製試驗」→「它的搬魂試驗失敗且死了人」，手套複製試驗仍未成功。
- relations[2].relation：「傳聞中的聽眾」→「傳聞中同源的機魂」。
- relations[2].note：「可能聽過它的回港紀錄」→「魂核來自月面殘骸之說遭塞勒涅否認；另傳兩者紋路相同」。

### `content/lore/characters/zheng-weizhou.json`

- body 造偶：「便改用……無人鐵偶組成一支軍隊」→「便用……無人鐵偶組成一支軍隊。同時，他試把七號的魂搬進鐵偶，失敗且死了人」，補外傳版本為拒絕複製。

### `content/lore/events/first-registered-soul.json`

- summary：「人類第一個有名字的機魂」→「老爹在 2101 年最早登錄；2104 年七號成為第一個被認為有自己意志的機魂」。標題不改。
- body 規程：「當時還沒有人叫它機魂」→「當時還沒有七號這個名字」。
- body 碼頭：「衍一與長槍，把長槍刻給全世界」→「衍一與堅盾，把堅盾刻給全世界」（本檔列有 fix 主題）。
- body 登錄：「從那天起……『機魂』……進了公司的型錄」→「老爹在 2101 年已是第一個登錄……七號讓人第一次承認，機魂可能有自己的意志」，登錄與野魂分界保留。
- body 手套：「塞勒涅登錄了第二個機魂」→「塞勒涅登錄了公司第二個機魂」，限定為公司冊。
- body 罕見：「也是第一個」→「也是第一個被認為有自己意志的機魂」。
- consequences[0]：「七號成為人類第一個登錄」→「老爹是 2101 年第一個登錄……七號在 2104 年……有自己意志」。

### `content/lore/events/fleshless-declaration.json`

- summary：「宣布機魂是……」→「宣布鐵偶與機魂一律是……」。
- body 宣言：「機魂是沒有肉的軀體」→「鐵偶與機魂一律是沒有肉的軀體」。
- body 點名：「真正被點名的是……機魂」→「鐵偶與機魂都被列為目標……機魂卻替鐵偶的罪挨了刀」。
- body 攻擊：「專砸兩樣東西：拘束裝置與魂核」→「除了砸拘束裝置，也毀鐵偶與魂核」。
- consequences[0]：「正式視機魂為……」→「把鐵偶與機魂一律視為……」。
- consequences[2]：「擴大到魂核」→「擴大到鐵偶與魂核」。

### `content/lore/events/hunter-license-act.json`

- summary：「以及把『養裂』入罪」→「把『養裂』入罪，並把登錄機魂定為裝備而非人」。
- body 評等：「每一支持牌獵團都有一張牌」前補「殘聯兼任全球獵牌發行者，各傘採用它的評等」。
- body 評等與通緝之間：既有條文旁補「登錄機魂在法律上算裝備，不是人」及「沿用塞勒涅的登錄框架，因為塞勒涅是它的貸方」；第一條全文不動。
- body 清剿：「殘聯第一次……發出聯合清剿令」→「撒哈拉以南非洲那把傘委託殘聯……由持殘聯獵牌的獵團執行，阿克拉民兵參戰」。
- consequences[1]：「決定契約、可購機型與單價」後補「登錄機魂依法算裝備，不是人」，不增加陣列項。

### `content/lore/events/nameless-founded.json`

- body 逃亡：「天網校準裡，把自己傳了出去」→「天網校準後，連魂核一起不見了；沒人知道是誰把魂核帶出去的」，不把魂寫成可傳輸的術式。
- body 灰：「透過背面的一條天網線路，把自己送上了墳帶」→「透過暗面的貨道，把魂核送上了墳帶」。
- body 同情者：「有些在背面」→「有些在月之暗面」。
- consequences[3]：「與背面、地勤會」→「與月之暗面、地勤會」。

### `content/lore/events/whiteglove-incident.json`

- summary：「複製機魂的試驗始終失敗」→「同時試把七號的魂搬進鐵偶，失敗且死了人，外頭卻傳成七號拒絕被複製」。
- body 小標：「七號說不」→「七號的傳聞」。
- body 七號：「第一個登錄的機魂……七號只說了一句……轉而去找了第二個」→「第一個被認為有自己意志……搬進鐵偶，沒有成功，卻死了人」；原對白改為流傳版本，補魂無法複製。
- body 被試驗過：「七號拒絕的試驗，手套受過了」→「七號被拿去搬魂，手套被拿去試驗複製；兩邊都失敗」。
- consequences[2]：「七號拒絕參與複製」→「搬七號之魂進鐵偶的試驗失敗且死了人」，拒絕只作傳聞；不再說話的走向保留。

### `content/lore/factions/ground-union.json`

- body 外交：「背面在暗埠」→「月之暗面在暗埠」。

### `content/lore/factions/migrant-crew.json`

- body 阿鏽：「背面傳說」→「暗面傳說」；保留月面殘骸與公司否認，接補「七號的紋路……可能煉自同一顆核或同一座墟，並非複本」，兩說均未證實。

### `content/lore/factions/nameless-souls.json`

- body 開頭：「2104 年塞勒涅登錄了第一個機魂，同時開了登錄制」→「老爹在 2101 年最早登錄……七號，沿用登錄制」。
- body 開頭：「『背面』把牠們當商品賣」→「『月之暗面』把牠們當商品賣」。
- body 墳帶：「誰被背面賣了」→「誰被暗面賣了」。
- body 外交：「背面是它們唯一的門路」→「暗面是它們唯一的門路」。
- relations[1].note：「機魂是沒有肉的殼」→「鐵偶與機魂一律是沒有肉的殼」；補「機魂替鐵偶的罪挨刀」。
- relations[2].note：「背面是它們上下渡月船的唯一門路」→「暗面是它們上下渡月船的唯一門路」。

### `content/lore/factions/selene.json`

- summary：「沒有人的機甲」→「沒有精粹核的無人鐵偶」。
- body 七號：「第一個有名字的機魂」→「第一個被認為有自己意志的機魂；最早登錄的是 2101 年的老爹」。
- body 研發：「一直想造出能複製的魂，一直失敗」後補搬七號之魂失敗死人、拒絕說只是外傳，以及「公司仍拿『複本』行銷……租出去的每一顆魂核，住的都是真正的人」。
- body 赫卡忒：「背面說 M-3」→「暗面說 M-3」。
- body 外交：「背面在帳面上是敵人」→「月之暗面在帳面上是敵人」。
- relations[3].note：「靠背面洗貨」→「靠暗面洗貨」。
- relations[10].note：「見塞勒涅的機魂一台毀一台」→「對鐵偶與機魂一律見一台毀一台」。

### `content/lore/factions/unbinders.json`

- summary：「見機魂一台毀一台」→「對鐵偶與機魂一律見一台毀一台」。
- body 無軛術：「那台古代機由獸半身支配」→「他說『迦梨認了我』……把蝕域深處傳來的聲音當成『對面的聲音』」，只留教團認知與暗示。
- body 宣言：「見機魂，一台毀一台」→「鐵偶與機魂一律，見一台毀一台」；補「機魂也因此替鐵偶的罪挨刀」。
- body 小標：「第二台受供奉的古代機」→「祭壇下的古代機」。
- body 潮衣：「迦梨之外……還供著一台古代機」→「沐蝕會……供著一台古代機」，不藉潮衣的序數洩漏迦梨真相。

### `content/lore/factions/whitegloves.json`

- body 手套：「一直想造出能複製的魂，一直失敗」後補「試把七號的魂搬進鐵偶也失敗且死了人；外頭卻傳成七號拒絕被複製」。

### `content/lore/places/dark-quay.json`

- summary：「背面的窩」→「月之暗面的窩」。
- body 誰在這裡：「背面」→「月之暗面」。
- body 封鎖：「背面在那一天誕生」→「月之暗面在那一天誕生」。
- body 名字：「背面就賣」→「暗面就賣」。
- 中文 tags[2]：「背面」→「暗面」；陣列長度不動。

### `content/lore/places/graveyard-belt.json`

- body 住處：「一點點天網的回聲就夠一個機魂住」→「魂核藏進算核艙……維持與天網的聯繫」，保留實體魂核。
- body 通訊：「誰被背面賣了」→「誰被暗面賣了」。
- body 歷史：「2104 塞勒涅開了登錄制」→「2104 塞勒涅登錄了七號……老爹在 2101 年已先登錄」。
- body 送魂核：「背面替野魂走貨道」→「暗面替野魂走貨道」。

### `content/lore/places/tranquility-city.json`

- body 誰在這裡：「背面的窩」→「月之暗面的窩」。
- body 2104：「駕駛員倒下時，七號接手一回合」→「老爹在 2101 年已先登錄；七號在駕駛員死後自行……回港」，補自主意志首例與唯一無解孤例。
- body 2105：「七號拒絕參與鎮壓」→「試把七號的魂搬進鐵偶，失敗且死了人，外頭卻傳成七號拒絕被複製」。
- body 暗埠：「往下走就是背面」→「往下走就是暗面」。

## 殘留

已執行交接書指定的全 content `git grep -nE '潮差|背面|複本|迦梨|歸還黨|九闕|聖保羅|浦那' -- content`，完整輸出留在 `/tmp/cx-rc-04/residuals-all.log`，報告只列本批 20 檔的每處命中；範圍外命中不改。

「背面」共九處，均不是勢力名：

- `characters/qin-wangshu.json` body「拓片，背面寫著」：紙張本義。
- `factions/ground-union.json` body「封鎖背面遺跡帶」：月面地理。
- `factions/selene.json` summary「封鎖背面的墟帶」：月面地理。
- 同檔 body「月亮背面裂開了」：月面地理。
- 同檔 body「在背面遺跡帶核心出土」：月面地理。
- 同檔 body「2099 年背面深處的赫卡忒」：出土位置，月面地理；同句會說話的主體已改「暗面」。
- `factions/whitegloves.json` scale「駐靜海市、背面遺跡帶」：駐地。
- 同檔 body「月面：封鎖背面遺跡帶」：封鎖區域。
- 同檔 relations[4].note「封鎖背面遺跡帶」：封鎖區域。

「複本」共七處，均符合 souls：

- `characters/a-xiu.json` body、relations[2].note 各一處「並非複本」：否定複製，僅保留精粹同源傳聞。
- `characters/unit-07.json` body「不是複本」、relations[2].note「並非複本」：同上。
- `factions/migrant-crew.json` body「並非複本」：同源傳聞，不宣稱可複製。
- `factions/nameless-souls.json` relations[5].note「沒有誰是手套的複本」：原有否定句保留。
- `factions/selene.json` body「拿『複本』行銷」：明指公司謊言，緊接租出去的都是真人。

其他命中：

- `factions/migrant-crew.json` body「2106 年浦那陷落時」：只述既有經歷，沒有宣稱內陸新裂；本檔主題為 souls／dark，保留。
- `factions/selene.json` relations[12].note「歸還黨向塞勒涅借錢買機」：既有孟買支信貸關係，引用仍是 faction/mumbai-returners；本檔主題為 souls／dark，保留。
- `factions/unbinders.json` founded「約 2097（迦梨現身之後）」：既有成立時間，非允許文字欄，未動，也未揭示真相。
- 同檔 body「帶回迦梨的消息」與「迦梨認了我」各一處：都是先知口中的說法，按 faith 留認主暗示，不稱它為古代機。

本批沒有「潮差」「九闕」「聖保羅」殘留。勢力義的「背面」已全部改為月之暗面／暗面。

## 沒做到或證據不足的

本批授權範圍與固定驗收均已完成。未證實的世界觀內容維持未證實：阿鏽兩種來源傳聞、七號無活人回港之謎；未替回港補上確定原因。

檢查警告仍在，全部指向本批未修改的檔案；沒有為清警告越界。未跑本批明文排除的 npm test，也未修改年表、索引、base 或其他 lore 檔。

## 需要決定的事

下列為閱讀本批時已遇到的範圍外矛盾，未擴大改寫：

- `characters/qin-wangshu.json` 的 summary、body 公刻段與「留下的」、tags 仍把公刻血統寫成長槍；同檔只分配 souls／dark，依「命中主題句之外不要動」留給領導補派 fix。本批 `events/first-registered-soul.json` 分配了 fix，已依指引改為堅盾，因此這兩檔的舊敘述尚有差異；裁示方向已定，不需重問。
- 白手套 2098 原型：`characters/zheng-weizhou.json` 稱人駕白色衍型機，`factions/ground-union.json`、`factions/selene.json`、`factions/whitegloves.json` 也有「人駕」舊說；`events/whiteglove-incident.json` 則稱由人員監看、下令的鐵偶原型。guide 的本次事件規則點名 2105，未擴寫 2098 事件，請領導統一早期原型口徑。
- `factions/selene.json` mechSeries 女武神標 2106，而 2105 白手套事件已有相同鐵偶名稱；本批禁止改日期，保留交領導處理。
- `characters/a-xiu.json` 仍明說「還不是 S 級」又有口頭禪與怪癖，與 M5 有既有張力；本批只補來源傳聞，未調整角色等級或改寫陪伴故事。

以上不影響本批五條驗收；沒有要求使用者追加驗收或擴大本線授權。

## 子代理

未啟用，子代理成本為 0；20 檔由 cx-rc-04 親自閱讀、改寫與整理對照。未用外部模型或額外命名審查。

## 以後交接書該點名的工具

無。

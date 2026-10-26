# 已讀清單

cx-dd-01 親自讀取下列檔案；相對路徑均以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根。findings.json 透過指定 tabledb.py grep 與 API 篩讀本線 32 列，未整份展開。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/lead-dedup/plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-dedup/plan/findings.json`
- `wf/workflows/dispatch/handoffs/lead-dedup/cx-dd-01.md`
- `wf/WORKFLOWS.md`
- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/inbox/README.md`
- `wf/workflows/inbox/PROTOCOL.md`

# 逐列舊句→新句

完成指定 32 列、35 檔。同一序號涉及多檔或多處時逐處列出；舊新各不超過 120 字，省略號只省去相同上下文。年表使用日期＋title 定位的小腳本，保留其他條目原始文字與相對順序。body 最大淨增為 46 字，未超過 600 字。

| 序 | 檔:欄 | 舊句→新句 |
|---|---|---|
| 2 | `content/lore/characters/old-ben.json:body` | 老班在殘翼航空當了二十年軍醫 → 老班曾在殘翼航空當軍醫 |
| 2 | `content/lore/characters/hakan-demir.json:relations[1].note` | 老班在殘翼當過二十年軍醫 → 老班在殘翼當過軍醫 |
| 3 | `content/lore/factions/migrant-crew.json:scale` | 四台機甲（三台犁改的燕鷗攻堅型、一台獵犬-II型） → 三台機甲（兩台犁改的燕鷗攻堅型、一台獵犬-II型） |
| 5 | `content/lore/factions/bay-seventh-post.json:founded` | 約 2101（蝕線畫下之後） → 2099 年或更早（2101 年納入蝕線） |
| 5 | `content/lore/factions/bay-seventh-post.json:body` | 2101 年新加坡會議畫下蝕線，孟加拉灣沿岸被切成一段一段的哨。第七哨是其中一段： → 新加坡會議之前，第七哨已有駐守人馬。2101 年會議畫下蝕線，孟加拉灣沿岸被切成一段一段的哨，第七哨也納入其中： |
| 8 | `content/lore/eras/league.json:body` | 授權吉大港拆船幫造獵犬-II型 與廉價長槍-V4 → 授權吉大港拆船幫造獵犬-II型，並默許廉價長槍-V4 量產 |
| 11 | `content/lore/factions/tide-creed.json:body` | 沐蝕會的藍本是迦梨，2096 年先知在孟買蝕域深處找到的古代機。迦梨的獸半身支配了整台古代機 → 沐蝕會宣稱，迦梨的獸半身支配了整台古代機 |
| 12 | `content/lore/places/yakutsk-bed.json:body` | 殘翼的燒季從它成立起就沒停過 → 殘翼自二一〇〇年首燒後，每年夏末再來 |
| 13 | `content/lore/characters/old-man.json:body` | 十年沒變過 → 多年沒變過 |
| 15 | `content/lore/factions/mimic-works.json:body` | 長槍從此成為全世界的通用系列。 → 堅盾從此成為全世界的通用系列。 |
| 15 | `content/lore/factions/mimic-works.json:body` | 塞勒涅的魂核、殘聯的燕鷗、吉大港的長槍-V4、每座城邦民兵的長槍——都從格爾木那三年長出來。 → 塞勒涅的魂核與每座城邦民兵的堅盾，都承接了格爾木那三年留下的技術。 |
| 16 | `content/lore/events/longspear-leak.json:body` | 從此人人會造的只有這兩個系列：堅盾守牆、長槍突擊。 → 從此人人會造的只有這兩個系列：堅盾守牆、長槍突擊。長槍的藍本仍是銀環；刑天刻痕是後來取得的授權。 |
| 17 | `content/lore/factions/mimic-works.json:body` | 射擊與突擊的原型 → 重裝守牆機的原型 |
| 17 | `content/lore/events/shield-open-carving.json:body` | 細長的身形、可拆換的連吼與弧光矛、一條讓燼排得更快的背脊，專門打射擊與突擊。 → 厚重的鎧甲、可拆換的前盾與連吼、一條讓燼排得更快的背脊，專門守牆與支援。 |
| 17 | `content/lore/events/shield-open-carving.json:body` | 基本突擊衍型機 → 基本守牆衍型機 |
| 18 | `content/lore/timeline.json:entries[2105／鹽鷗鐵砧火併].era` | era/tide-line → era/league |
| 18 | `content/lore/timeline.json:entries[2105／鹽鷗鐵砧火併].date` | 2105 → 2106 |
| 19 | `content/lore/events/first-bid-sheet.json:body` | 鐵砧的盾、鹽鷗的兩棲長槍 → 鐵砧的盾陣、鹽鷗的水上機隊 |
| 20 | `content/lore/characters/ilse-brandt.json:body` | 伊爾瑟・布蘭特十九歲進鐵砧，那時鐵砧剛從丹麥機甲師團改成獵團不久。 → 伊爾瑟・布蘭特在二〇九三年鐵砧成軍後入團，那時她二十歲。 |
| 21 | `content/lore/places/yakutsk-bed.json:body` | 第一次蝕潮之後的某個夏天 → 第一次蝕潮之後的二一〇〇年夏天 |
| 21 | `content/lore/characters/nina-belova.json:body` | 城終於失守 → 二一〇〇年夏天，城終於失守 |
| 24 | `content/lore/timeline.json:entries[2099／金山夜]` | （無此條目） → 2099 年大潮夜，金山最深的舊礦井塌穿成墟，井底當班者未歸，墟出精粹成了翌年撒南成傘的支柱。 |
| 27 | `content/lore/places/gold-reef.json:body` | 井下偶有從墟裡出來的低階東西，並非夜夜成災； → （刪除此分句） |
| 28 | `content/lore/factions/busan.json:body` | ## 外交↵↵ → ## 外交↵↵釜山是雙籤城：受韓傘管轄，同時簽殘聯憲章取得獵牌效力。 |
| 28 | `content/lore/places/busan.json:body` | ## 誰在這裡↵ → ## 誰在這裡↵釜山是雙籤城：受韓傘管轄，同時簽殘聯憲章取得獵牌效力。↵↵ |
| 28 | `content/lore/factions/korea-umbrella.json:body` | 釜山仍在韓國法理與救援調度之內，同時保有與殘聯的契約關係，第三刃仍是它的特許獵團。 → 釜山是雙籤城：受韓傘管轄，同時簽殘聯憲章取得獵牌效力。第三刃仍是它的特許獵團。 |
| 30 | `content/lore/timeline.json:entries[2106／長槍-V4 拆船幫量產].summary` | 拆船幫向國家型傘或塞勒涅買 C 級精粹與量產件，把 2104 版長槍-V4 做成最便宜的量產貨，成為地球上最多的機型。 → 拆船幫經中間人取得源自國家型傘或塞勒涅的 C 級精粹與量產件，把 2104 版長槍-V4 做成最便宜的量產貨，成為地球上最多的機型。 |
| 32 | `content/lore/places/rotterdam-roost.json:body` | ## 誰在這裡↵ → ## 誰在這裡↵鹿特丹是由獵團與商團庇護的自由城市。↵↵ |
| 34 | `content/lore/characters/molly-van-den-berg.json:body` | 說好的撤退一定等 → 約定的一小時撤離前一定等，到點必撤 |
| 35 | `content/lore/events/aegir-wakes.json:occurs` | （無此欄） → possible |
| 36 | `content/lore/places/hamburg.json:body` | - **2103 候鳥號分家**：老桂帶著三台犁從這座碼頭離開，奧爾森沒來送。 → - **2103 候鳥號分家**：老桂在吉大港帶著三台犁離開鐵砧；奧爾森沒去送。 |
| 37 | `content/lore/factions/bay-seventh-post.json:body` | 候鳥號是孟加拉灣戰役時一起守過的老面孔。 → 候鳥號的老桂，是孟加拉灣戰役時仍在鐵砧、一起守過線的老面孔。 |
| 37 | `content/lore/factions/bay-seventh-post.json:relations[2].note` | 2102 孟加拉灣戰役一起守過線，哈米德記得老桂。 → 哈米德記得2102仍在鐵砧、一起守過線的老桂。 |
| 39 | `content/lore/timeline.json:entries[2107／第七哨砲台修復].event` | None → event/seventh-post-cannon-debt |
| 39 | `content/lore/timeline.json:entries[2107／老鷺再鳴]` | 第七哨修好了老鷺，兩座砲又能同守海堤，修復款卻沒有替輪守的人留下薪水。 → 刪除重複條目；保留第七哨砲台修復摘要 |
| 40 | `content/lore/events/bulwark-ii-standard.json:summary` | ，工坊卻仍得為精粹與量產件等貨 → （刪除此分句） |
| 40 | `content/lore/events/bulwark-first-workshops.json:body` | D 級的守牆本錢逐漸鋪開，C 級精粹與量產件卻沒有隨公刻免費流通。 → D 級的守牆本錢逐漸鋪開。 |
| 40 | `content/lore/events/shield-open-carving.json:body` | ，精粹與量產件仍須向國家型傘或塞勒涅購買 → （刪除此分句） |
| 40 | `content/lore/events/longspear-v4-standard.json:body` | C 級精粹與量產件仍要向國家型傘或塞勒涅買，圖紙旁的採購單並不比從前薄。 → 圖紙旁的採購單並不比從前薄。 |
| 40 | `content/lore/events/hound-ii-license.json:body` | C 級精粹與量產件仍須向國家型傘或塞勒涅採購，沒有因為腿架是報廢貨就免去。 → 核心備料仍得另付。 |
| 41 | `content/lore/events/bulwark-first-workshops.json:consequences.2` | 仿造在多年後擴散為二一〇一年民兵普及，C 級精粹與量產件仍須另行採購。 → 仿造在多年後擴散為二一〇一年民兵普及。 |
| 41 | `content/lore/events/bulwark-ii-standard.json:consequences.1` | C 級精粹與量產件仍須向國家型傘或塞勒涅採購。 → 圖紙開放未解除供貨限制。 |
| 41 | `content/lore/events/longspear-v4-standard.json:consequences.2` | 二一〇六年拆船幫依此量產，C 級精粹與量產件依然外購。 → 二一〇六年拆船幫依此量產。 |
| 41 | `content/lore/events/hound-ii-license.json:consequences.2` | 回收機件節省費用，沒有降低 C 級精粹與量產件的外購門檻。 → 回收機件節省了重組費用。 |
| 42 | `content/lore/timeline.json:entries[2100／堅盾-II型 定版].summary` | 公刻社群定版並公開堅盾 C 級 II 型圖紙，C 級精粹與量產件仍須向國家型傘或塞勒涅購買；從此 D 級守牆、C 級推進。 → 公刻社群定版並公開堅盾 C 級 II 型圖紙；從此 D 級守牆、C 級推進。 |
| 42 | `content/lore/timeline.json:entries[2104／長槍-V4 定版].summary` | 公刻社群定版並公開長槍 C 級 V4 圖紙，C 級精粹與量產件仍須向國家型傘或塞勒涅購買；鹽鷗、拆船幫各自改本地型。 → 公刻社群定版並公開長槍 C 級 V4 圖紙；鹽鷗、拆船幫各自改本地型。 |
| 88 | `content/lore/characters/a-xiu.json:summary` | 開了很多節點、一個都沒練熟 → 會用許多術式、卻都不熟練 |
| 88 | `content/lore/characters/a-xiu.json:body` | 開了很多節點、一個都沒練熟 → 會用許多術式、卻都不熟練 |
| 88 | `content/lore/characters/a-xiu.json:body` | 它的節點沒有多開一個，卻有某些東西變熟了。 → 它沒有多學會一種術式，卻有某些東西變熟了。 |
| 89 | `content/lore/factions/migrant-crew.json:body` | 開了很多節點，一個都沒練熟 → 會用許多術式，卻都不熟練 |
| 89 | `content/lore/characters/gui-hongfei.json:body` | 開了很多節點，一個都沒練熟 → 會用許多術式，卻都不熟練 |
| 89 | `content/lore/places/migrant-bird.json:body` | 開了很多節點，一個都沒練熟 → 會用許多術式，卻都不熟練 |
| 90 | `content/lore/characters/unit-07.json:body` | 開了的節點會用，沒開的不會 → 學會的術式會用，沒學過的不會 |
| 90 | `content/lore/characters/unit-07.json:body` | 要節點開滿、要陪伴夠久，或者要出過事 → 要學全術式、要陪伴夠久，或者要出過事 |
| 90 | `content/lore/events/first-registered-soul.json:body` | 要節點開滿、要陪伴夠久，或者要出過事 → 要學全術式、要陪伴夠久，或者要出過事 |
| 91 | `content/lore/factions/whitegloves.json:body` | 鐵偶只照術式走，沒有節點成長，也不會爆發。 → 鐵偶只照術式走，不會自行學會新本領，也不會爆發。 |
| 92 | `content/lore/factions/rift-beasts.json:body` | 每一個大型蝕域的核心都有一隻 S 領主，名字是人取的。 → 每一個大型蝕域的核心都有一隻 S 領主，名字是人取的。獵團說，S 領主向來坐在核心不出來；吉大港的那隻「萬潮葬王」，是有紀錄以來唯一走出來的一隻。 |
| 92 | `content/lore/events/wreck-crown.json:body` | 港口將二名寫進外灘警示，仍按最高一級的獸情封住那片水面。天亮時，纜工拿著搭檔留下的鐵鉤坐在港梯上。傷員的小艇靠回來，他先伸手接住纜繩。 → 港口將二名寫進外灘警示，仍按最高一級的獸情封住那片水面。天亮時，纜工拿著搭檔留下的鐵鉤坐在港梯上。傷員的小艇靠回來，他先伸手接住纜繩。外灘的人後來說：「牠是唯一走出核心的那種東西。」 |

# 沒做到的列與理由

無。指定 32 列均已落地；keep、needs-user 及設定筆記均未改動。未新增或刪除 lore 檔，未改 manifest、索引、base 或 src，未 commit。

固定三條驗收結果：

1. 通過：每完成一檔立即執行 `node content/lore/check.ts`，35 次均 `errors=0`；最終再跑為 `errors=0 warnings=2`、年表 178 條。兩項既存警告為 busan-returned-seal、dark-quay-surety 未入年表，均不在本線處置範圍。
2. 通過：上表包含全部指定 32 個序號及其舊→新對照。
3. 未通過：`git status --short` 列出 35 個 polishFiles 內修改，另有開場即存在的 `?? node_modules`。這是指向主 repo node_modules 的既存 symlink；不在允許寫入路徑內，本線未刪除或隱藏它，已通知領導處理。

# 需要決定的事

請領導處理開場既存的未追蹤 `node_modules` symlink，使第三條驗收通過；lore 修改無待決事項。

通訊環境：上線時 `wf/inbox/teams/dedup/members` 不存在，指定 `--up` 上線信因此由工具送至 dispatcher；已另以 `--to lead-dedup` 發送進度與既存 symlink 情況。每檔完成後均依規定輪詢 orders，沒有收到新指示。

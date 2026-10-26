# 已讀清單

以下皆親自讀取；規矩檔均從主 repo 讀取，items.json 使用交接書指定的 python3 -c 指令篩出 tf-03 共 36 列。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/common/user.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/README.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/batch.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/polish.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/lore-text.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/content/world-pillars.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/README.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/lore/style.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/plan/plan.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/plan/items.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/cx-tf-03.md`

另讀 WORKFLOWS.md、SESSION-LOG.md、WAIT_USER.md、inbox/README.md、style/people.md 與機甲支柱細則。未派子代理。

# 逐列舊句→新句

已修改 27 個允許的 lore 檔；35 列完成、I56 部分完成。每次寫完一檔均在 worktree 根跑 node content/lore/check.ts，全部 errors=0 warnings=2；兩項既有警告為 busan-returned-seal、dark-quay-surety 未出現在 timeline。後續句接修正也各跑相同檢查。

主 repo 的 tf-03 manifest 列有完整 27 檔白名單；worktree 缺該 manifest，故唯讀主 repo 同名 manifest 限定改檔範圍，沒有自行建立 manifest。四篇機甲史新名依次為穆索、賈米勒、寧仔、蓮嬸。未 commit。

37｜content/lore/events/fr7-at12-public-issue.json:body｜型錄、採購與補給三節，沒有具體駕駛員。 → 穆索縫破靴、付清尾款，替 FR-7 畫缺翅麻雀，起身時說「一邊翅也夠回家。」｜新 summary 全文：奈洛比公發兩款 D 級機那天，一雙破靴踏進付清尾款的 FR-7，甲上多了一隻缺翅麻雀。

38｜content/lore/events/fr7-at12-public-issue.json:summary｜殘聯成立當天，奈洛比軍械庫把 FR-7 與 AT-12 兩款 D 級機公開列冊，型錄供貨與參戰補給各有了名目。 → 奈洛比公發兩款 D 級機那天，一雙破靴踏進付清尾款的 FR-7，甲上多了一隻缺翅麻雀。

39｜content/lore/events/hound-ii-license.json:body｜木墊仍托著機腳，沒有駕駛員來接機。 → 賈米勒等付錢買的核心到貨，裝好後坐進獵犬，舊燕鷗腿站起，在泥灘留下腳印。｜新 summary 全文：報廢燕鷗的腿撐著獵犬-II型站起來，泥灘上的人替它讓出了一條路。

40｜content/lore/events/hound-ii-license.json:summary｜軍械庫授權吉大港拆船幫以報廢燕鷗腿架重組獵犬-II型，回收機件省了錢，C 級供應仍得另買。 → 報廢燕鷗的腿撐著獵犬-II型站起來，泥灘上的人替它讓出了一條路。

41｜content/lore/events/longspear-v4-standard.json:body｜棚裡的技工在 V4 封面上按了手印，把未裝完的長槍重新罩好。 → 寧仔把雨濕圖紙壓在靴下，接好共通接口，坐進座艙抬槍，啞鷺吼出第一矢。｜新 summary 全文：長槍-V4的共同圖紙定下那天，一門被叫作啞鷺的砲終於吼出了第一矢。

42｜content/lore/events/longspear-v4-standard.json:summary｜銀環逆向後散出的長槍改圖收成 C 級 V4，鹽鷗與拆船幫各自接續改造，量產還要再等。 → 長槍-V4的共同圖紙定下那天，一門被叫作啞鷺的砲終於吼出了第一矢。

43｜content/lore/events/bulwark-ii-standard.json:body｜夜哨前，技工從桌上取回關節套，裝回那台磨舊的堅盾。 → 蓮嬸縫補白鷺防雨布，把關節套修回舊盾，盾先立、機再站：「新的等料，舊的等我。」｜新 summary 全文：堅盾-II型的圖紙已公開，缺料的棚外，技師仍開著修好的舊盾接夜哨。

44｜content/lore/events/bulwark-ii-standard.json:summary｜公刻社群把多年改圖收成堅盾-II型，公開了 C 級推進版圖紙。 → 堅盾-II型的圖紙已公開，缺料的棚外，技師仍開著修好的舊盾接夜哨。

45｜content/lore/events/aegir-wakes.json:summary｜開局時尚未發生，是開局後某個漲潮夜可能發生的事，大潮夜機率高很多、日期不定：一片卡在吊臂上的殘片，讓埃吉爾選了一直在拆它的人。 → 某個漲潮夜，一片卡在吊臂上的殘片，可能讓埃吉爾選中一直在拆它的人。

46｜content/lore/events/aegir-wakes.json:secrets[0].text｜所有殘片（提案名「歸矢」） → 所有殘片，人們把這一變化叫作「歸矢」

47｜content/lore/places/dhaka-sail-court.json:aka｜aka: ["Skyward Mending Yard"] → aka: []

49｜content/lore/factions/old-arms-makers.json:aka｜aka: ["The Old Arsenal Houses"] → aka: []

51｜content/lore/places/tiksi.json:name；region；body；aka｜name／region／body 的「季克西」；沒有 aka。 → 三欄均改「提克西」；新增 aka: ["Tiksi"]，id 與檔名保留。

52｜content/lore/factions/old-arms-makers.json:body；consequences（命中者）｜順行液壓組；骨架、鎧甲、液壓與排燼件。 → 順行筋組；骨架、鎧甲、筋與排燼件。

53｜content/lore/events/tern-rollout.json:body；consequences（命中者）｜舊液壓廠交來關節件。 → 舊筋件廠交來關節件。

54｜content/lore/events/hound-ii-license.json:body；consequences（命中者）｜新液壓件／新液壓；consequences[1] 的新液壓。 → body 改新筋件／新筋；consequences[1] 改新筋，陣列長度保留。

55｜content/lore/events/bulwark-ii-standard.json:body；consequences（命中者）｜本地機床能做鎧甲、液壓與護架。 → 本地機床能做鎧甲、筋與護架。

56｜content/lore/factions/rift-beasts.json:body／末三節｜舊物記下的二十年／名字另裝一冊／舊港仍有人望著。 → 末三節縮為「舊港仍有人望著」：車上問港心、帶路者折圖到岸邊、無人能答；領主例外句暫留前文。｜新 summary 全文：不是勢力，是天氣：從裂縫另一端湧來、吞食物質的四族怪獸，不談判、不結盟，各自有各自的季節。

61｜content/lore/events/chittagong-unbinding.json:body／工頭；consequences[1]｜那一夜她／等她趕回／她的家人／她說她要；她日後。 → 那一夜他／等他趕回／他的家人／他說他要；他日後。

63｜content/lore/factions/bay-seventh-post.json:body／代表戰役｜哈米德帶著半個連去接難民車隊，在路上守了兩夜；他回來時帶回四十個孩子 → 哈米德帶著二十名哨兵去接難民車隊，在路上守了兩夜；回來的哨兵剩十九人，還帶回四十個孩子

64｜content/lore/events/pune-falls.json:body／守的人、之後｜帶著半個連；哈米德帶回四十個孩子，全編進第七哨的名單。 → 帶著二十名哨兵；哈米德帶去的二十名哨兵回來十九人，另帶回四十個孩子，全編進第七哨的名單。

65｜content/lore/characters/sayeed.json:body／2102 回憶｜看著一台犁擋在廠門口不退。那是老桂。法蒂瑪・貝古姆親自開了另一台。 → 看著一台堅盾-I擋在廠門口不退。那是老桂。法蒂瑪・貝古姆親自開著一台犁，守在他旁邊。

66｜content/lore/places/dhaka.json:body／2102 孟加拉灣戰役｜老桂帶著一台犁守住廠區，法蒂瑪自己也開了一台。 → 老桂開著堅盾-I守住廠區，法蒂瑪自己也開著一台犁。

67｜content/lore/characters/fatima-begum.json:body／首段｜四十五歲當上公會長——那一年公會還只是一間替女工討薪的辦公室。 → 二一〇一年，她四十五歲，接手的已是一個守城的公會。她把女工討薪的舊桌留下，繼續發那張契約。

68｜content/lore/events/green-line-purge.json:body／清剿結局；consequences[1]｜裏側沒能送來新錨，裂縫封口。／綠線的寬度 C 蟲族裂縫被封口，養裂帶半廢。 → 守到下一個漲潮，仍沒封住裂縫。／巢母被殺、子體斷繫，養裂帶半廢；寬度 C 的裂縫仍開著，漲潮仍冒新獸。

69｜content/lore/places/green-line.json:body／2108 的狀態、捕獸｜裂縫沒封乾淨——殘聯說封了，綠線幫的殘部說沒有。／那道「封了」的裂縫／這件事最好別告訴殘聯。 → 裂縫沒有封住，漲潮仍冒新獸。／那道仍開著的裂縫／刪除最後的隱瞞句。

70｜content/lore/factions/busan.json:body／研發路線｜劍魚-V5（A）是第三刃的精銳 → 劍魚-V5（B）仍是少量試作，第三刃在役主力是劍魚-III。二一〇五年曾隨遠征試用，二一〇八年一月尚未正式供貨。

71｜content/lore/factions/third-blade.json:scale；body／藍本與研發｜以劍魚-V5為核心的突擊部隊；機種列舉未標試作。 → 以劍魚-III為主力、少量試用劍魚-V5的突擊部隊；列舉補 B 級試作，補二一〇五年遠征與二一〇八年一月未正式供貨。

72｜content/lore/characters/yoon-seoyoung.json:body／研發路線｜A 級是「劍魚-V5」 → 「劍魚-V5」仍是 B 級試作

73｜content/lore/characters/molly-van-den-berg.json:body／仇與停火｜尹瑞英帶著劍魚-V5殺進斯卡蓋拉克 → 尹瑞英帶著劍魚-III與少量 B 級劍魚-V5試作機殺進斯卡蓋拉克

74｜content/lore/events/skagerrak-incident.json:body／月亮的訂單、遠征｜訂金是一整批劍魚-V5的備件；遠征未列主力與試作機比例。 → 訂金是一整批供 B 級劍魚-V5試作機使用的備件；船上以劍魚-III為主，混著少量尚在試作的劍魚-V5。

75｜content/lore/factions/league-armory.json:body／夸父的血、系列與授權｜它的每一張圖紙都流著夸父的血；燕鷗是夸父血統改出來的輕型哨戒機。 → 最早接收的堅盾圖紙流著夸父的血；燕鷗由長槍改出，沿用長槍後加的刑天刻痕授權。

76｜content/lore/characters/howard-ling.json:body／燕鷗來歷｜燕鷗是從長槍血統改出來的。 → 原句保留，後補：霍華酒後也叫它「夸父直系」，那是他的吹噓；他案頭的圖仍標著長槍改型與後加的刑天刻痕授權。

77｜content/lore/events/tern-rollout.json:body／先有巡哨表｜燕鷗承自軍械庫既有檔案 → 燕鷗由長槍改成輕型哨戒機，沿用後加的刑天刻痕授權

91｜content/lore/events/gui-funeral.json:body／三天｜## 三天；下一次漲潮三天後。 → ## 十一天；下一次漲潮十一天後。

92｜content/lore/characters/mara-okoye.json:body｜下一次漲潮三天後。 → 下一次漲潮十一天後。

件數／容量 gate：27 檔未超 polishFiles 的 27 檔；body 最大淨增 44 字（content/lore/characters/howard-ling.json），未超 900 字。

# 沒做到的列與理由

I56 部分完成：末三節已刪合為一節，前文至「蝕壓」保持逐字不動，沒有重複萬潮葬王的唯一例外。計畫要求把例外句從「孟買的那隻」移至末節，但交接書同時寫「rift-beasts 只動末三節」；未獲領導核可前，保留前文例外句原處，暫未移動。

固定三條驗收（只執行這三條）：

1. PASS：worktree 根 node content/lore/check.ts 最終 errors=0 warnings=2。
2. PASS：本批 36 個序號各有一行「舊→新」，I56 未完成的部分另列理由。
3. BLOCKED：git status --short 列出 27 個 polishFiles 內修改，另有上線前就存在的 ?? node_modules。交接書不允許刪檔或修改 .gitignore／git 設定，本線不能移除此既有 symlink 或隱藏其狀態；完整原命令不符合「只列 polishFiles 內的檔」。

# 需要決定的事

請領導裁定 I56 的單句搬移是否為「只動末三節」的明確例外；核可後，只刪領主段的萬潮葬王例外子句，於末節添上計畫指定的唯一例外句，不動四族規則。

請領導補齊 worktree manifest，並處理既有未追蹤 node_modules 的環境設定，使固定第三條可直接通過。另 teams/tone/members 目前不存在，上線 --up 訊息實際路由 dispatcher；已用同一 inbox_mail.sh 的 --to lead-tone-fix 補送前置問題與 I56 請求。終局仍按交接書使用 --up，並向領導補送。

# 先全肢解後漫長收尾：證據與凍結候選

[平衡規格](../../../planning/specs/demo-balance-1029.md)｜[量測計畫](../../../planning/plans/demo-balance-1029.md)

## 已有證據，不再逐次猜單seed

唯讀抽取engine的regen15系列JSONL中每場摘要、abilitiesUsed、perRound與remaining，未讀入整份命令trace、未執行任何測試。相同seed1：local45／regen15／radiant22是25回合，local40是27，cleave20→28只降為24；radiant22→30卻變60回合timeout。這些都是單seed現象，不能外推勝率或宣稱已達標。

25回合局用了頭吼123、輝光78、鐮肢44、源光41；增槍30後用了頭吼337、輝光112，28回合後再無死亡，後段多回合真傷只有0.8至6.6。末態enemy-2軀幹僅5HP、腿／雙臂已壞，只剩頭吼；但enemy-1仍有輝光與完好腿，不能誤報兩敵都無穿透。bio仍有鐮肢／衝鋒，停在(11,13)，敵位(12,12)、(10,12)。需按回合追當下命中／目標／AP辨別未打中與不可致命，不把整局低傷全算空轉。

## 致命部位比失能部位更難自然打掉

標準雙足五個部位exposure都1。燕鷗軀幹原45外甲＋50座艙結構，另白瓷鎧甲加30，致命路徑共125；臂各65、腿85、頭45。武器配件HP14在臂的附加層，但臂結構斷即禁武器，不能把14誤當任何第一發都直接打到配件。普通射擊初始只有20%落在軀幹，肢解會改變後續可選部位與戰術。

獵犬核心60、臂30、腿40，四部位等曝光；鐮肢胸腔120、鐮臂65、腿70，六部位等曝光；刑天核心240、臂110、腿150，四部位等曝光。它們共同存在核心致命耐久高於單個失能部位的比值。加武器傷害同時更快拆手腳，不保證縮短全殲，正與radiant30反例吻合。

核心HP／exposure只是一個相對指標，不是精確擊殺回合：它不含命中、抗性、裝備、指定部位、暴擊與部位被打壞後的重新分配。候選需以完整局驗證。

## 兩個候選，其他變量凍結

共同基線為demo局部scriptedAccuracyBase45、全局bonus15、燕鷗charge regen15、radiant22、cleave20，其餘原資料。撤回cleave28與radiant30試值，noRetreat及正式hardclash不再改。不能降低敵準度或換原4v4。

候選A只將四份bodyplan的核心exposure1→2：`content/base/bodyplans/biped-standard.json` 的torso、`biped-light.json`的torso、`insect-reaper.json`的thorax、`ancient-warden.json`的shell-core。完整單位核心命中分配分別由20→33.3%、25→40%、16.7→28.6%、25→40%。普通射擊較容易造成致命進度，指定部位仍可刻意斷武器／腿；不改HP、命中骰或抗性。

候選B是在A上只降低核心最後致命結構層到原75%取整：標準cockpit-shell50→38、輕型cockpit-shell60→45、鐮肢organ40→30、刑天organ80→60。其餘外甲、肉層、部位HP與曝光維持。保留先破甲再致命的層序列，也保留刑天耐久遠高於輕型的差異。不試整體HP對半、全武器加倍或第三個隨機組合。

先A/B各跑固定1、7、13三seed，對照既有25回合基線且補同組必要基線。每場逐原始單位記首次武器完全失能、首次失去移動、死亡回合與核心HP，報「存活且失去有效致命手段」累計回合。候選應縮短這段長尾並保留少量可利用的斷肢窗口；若只靠玩家全被快速殺死達標，需如實呈報勝負與體感風險。

優先A：數值少、保持既有耐久。若A無20內餘裕再看B；目標主要樣本10–16回合、最慢20，不能拿剛好20的一場當穩定。候選通過小組才排正式20＋保留組；每場仍須原四台全dead而非失能／退場。

## 共享影響與驗證邊界

唯讀掃frame/species引用，標準雙足只moji-tern，輕型只hound-mk2。insect-reaper影響bio-reaper、corpse-reaper、wl-bio-fold-scythe、wl-corpse-fold-scythe四frame及reaper、wl-fold-scythe兩species。ancient-warden影響ancient-psychopomp、ancient-rearguard、ancient-riastrad、ancient-stormblade、ancient-watchhorn五frame；合計13個定義，不只demo。

這不是情境限定HP修改，須記下所有共享影響；選中候選後至少查一場含鐮肢族怪獸與一場同骨架古代機的既有測試／情境，防止大幅破壞既有定位。不能為只改demo假造一套同名弱骨架。隊長決定測試時段；本線只交證據與候選，未宣稱效果已驗。

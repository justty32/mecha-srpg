# 2026-10-28 夜間內容收尾入口

**本輪創作與驗證執行完成；九敗使整合仍pending。** 所有agent已DONE／close，現役0、runner0；十份任務brief及行政、CM後續設計兩份契約均已歸檔。內容與領導證據已push至 `4a139221`，本文件和最後驗證證據隨主線行政收尾提交保存。

夜間 **24概念／38新JSON**：12 lore＋2怪獸種（13 JSON）＋2駕駛（5 JSON）＋R2八lore。加跨平台22件／52 JSON，共 **46概念／90 JSON**；CM六檔未接受，不計成果。跨平台內容見[匯入報告](../workflows/dispatch/handoffs/integrate-zip-1028/REPORT.md)，不重列。

## 入庫證據與限制

第一輪12 lore `013701c0`，CK `64ff8125`，pilot `3a20a4367944cc3ed4ea62ee49552991b2f3d87e`，R2 `ff949a2f698351ec762d0b92fc02b34784ea372a`，收尾 `4a139221`。匯入 `00d74dfd`／證據 `40976305`、設計／基準 `7314fc6b`／`5680c463`。manifest仍 **draft／integration pending**；附件、reportDir、readlist、hash與原始log皆原位保留。

CK依matchesReference局部收件，十對配對核對、25筆outcome無例外；沉顎species／bio frame兩行soft-overflow-band警告保留：instinct soft池bands=[]，無該池band懲罰，不代表生物系無代價。怪獸只展示，未接遭遇營運，見[CK報告](../workflows/dispatch/handoffs/night-combat-lead-1028/ck/REPORT.md)。

pilot 20配置皆到outcome，零throw／run拒絕／重播拒絕；MCP及probe／playtest／readlist evaluator exit0。自然makePerson不自動掛traits，沿自然base值；十二band觀察保留，**只展示、未接招募**，見[pilot報告](../workflows/dispatch/handoffs/night-pilots-lead-1028/REPORT.md)。

CM六檔整批未carry、不拆收；末輪燼鐘accuracy6原側／換側合0/10。fixture／MCP僅accuracy2快照，不冒稱accuracy6同hash；不第三輪或補waiver。tar、manifest與逐檔SHA見[隔離備份](../workflows/dispatch/handoffs/night-combat-lead-1028/cm/final-isolated-README.md)。

下輪[CM修訂候選](../workflows/dispatch/handoffs/cm-recipe-next-1028/REPORT.md)已補：並燭保留原稿；燼鐘首選鐘AP4→2，較小互斥備選AP4→3，須重審後擇一，並非參數掃描。兩案均未實作、未測，不能解讀為本輪接受或第三輪調參；不增加成果計數。

## 最終驗證與主線後續

固定suite已完成：commit `3a20a4367944cc3ed4ea62ee49552991b2f3d87e`／tree `9a5ab936bc2804c9ed36497b7047b1b448e5cead`，**1031案／1022過／9敗，exit1，未通過**；耗時515.01秒（8分35秒），cancelled/skipped=0。九敗診斷與前輪完全相同，wait／ops-relic歷史軌跡限制保留；兩截圖未執行，不算skipped。保護路徑diff空、無殘留suite程序。已核[REPORT](../workflows/dispatch/handoffs/verify-night-1028/REPORT.md)、[status](../workflows/dispatch/handoffs/verify-night-1028/status.json)及[TAP](../workflows/dispatch/handoffs/verify-night-1028/suite.tap)。

R2合併wiki已在 **main `4a139221d82210dc23e7a3f129f13794a22e935a`／tree `d8f73178f2a9e7c73c3d70c8bb6ff5b2eee5ebe4`**（含R2）完成：單檔6案全過、exit0、0.111秒。前後HEAD/tree及全部3156個content檔名／位元組一致、content diff空，runner釋放，Socrates已DONE／close。見[wiki狀態](../workflows/dispatch/handoffs/verify-night-1028/wiki-status.json)與[wiki TAP](../workflows/dispatch/handoffs/verify-night-1028/wiki-suite.tap)。這與suite是不同快照，不能合稱同tree全套通過。

R2 gate／lore／readlist／mergedlore／該次strict均0、索引73一致，見[lore領導報告](../workflows/dispatch/handoffs/fill-lead-1028-night/REPORT.md)。主線最後wf strict與staged diff check均0，38個夜間內容JSON工作樹乾淨；十份歸檔契約保留原文位元組。原TAP的12行尾空白另存完整gzip及SHA256，可讀版只整理行尾，不改診斷。無pilot／R2／suite／wiki結果待補，最後行政提交未改已驗證內容。

前輪[匯入suite](../workflows/dispatch/handoffs/verify-import-1028/REPORT.md)：tree `b71d580579d70eddba7d9974d0809e8799e40878`，1031案／1022過／9敗、exit1、510.009秒，cancelled/skipped=0。九敗與包內一致、socket CLI本機通過；wait／ops-relic軌跡改變限制保留。兩UI截圖未執行，不計skipped，不稱原始npm test全跑。

## 夜間24概念導覽

以下連到38個實際新內容檔；bio／corpse、能力、部位與共享展示均為配套，不另計概念。

### 第一輪12 lore

<!-- wf-nav -->
- [韓苓](../../content/lore/characters/night-han-ling.json)（人物）
- [伊德里斯・納賽爾](../../content/lore/characters/night-idris-nasser.json)（人物）
- [瑪蕾・貝松](../../content/lore/characters/night-mare-besson.json)（人物）
- [鄭素庭](../../content/lore/characters/night-zheng-suting.json)（人物）
- [公刻棚下的學費](../../content/lore/events/night-hamburg-open-pattern-lessons.json)（事件）
- [石肩讓出街口](../../content/lore/events/night-incheon-statue-crossing.json)（事件）
- [鹽灘借纜](../../content/lore/events/night-salt-flat-borrowed-hawsers.json)（事件）
- [長桌拆成行李](../../content/lore/events/night-tranquility-table-crates.json)（事件）
- [停梭課屋](../../content/lore/places/night-dhaka-shift-classroom.json)（地點）
- [低鏡理髮屋](../../content/lore/places/night-hamburg-low-mirror.json)（地點）
- [翻帆洗場](../../content/lore/places/night-makassar-wash-lines.json)（地點）
- [暗晝眠樓](../../content/lore/places/night-tranquility-day-sleep.json)（地點）

### 兩怪獸種（13 JSON）

<!-- wf-nav -->
- 偏弓（怪獸種）：[物種](../../content/base/species/night-ck-crookbow.json)、[怪獸](../../content/base/monsters/night-ck-crookbow.json)、[能力](../../content/base/abilities/night-ck-crookbow.json)、[部位](../../content/base/bodyplans/night-ck-crookbow.json)、[生物機甲](../../content/base/frames/night-ck-bio-crookbow.json)、[屍體改裝](../../content/base/frames/night-ck-corpse-crookbow.json)。
- 沉顎（怪獸種）：[物種](../../content/base/species/night-ck-keeljaw.json)、[怪獸](../../content/base/monsters/night-ck-keeljaw.json)、[能力](../../content/base/abilities/night-ck-keeljaw.json)、[部位](../../content/base/bodyplans/night-ck-keeljaw.json)、[生物機甲](../../content/base/frames/night-ck-bio-keeljaw.json)、[屍體改裝](../../content/base/frames/night-ck-corpse-keeljaw.json)。

共享展示：[斷艦龍骨下](../../content/base/scenarios/night-ck-broken-keel.json)（情境）。

### 兩駕駛（5 JSON）

<!-- wf-nav -->
- 瑟琳・索韋（駕駛）：[person](../../content/base/persons/night-p-serin-sowe.json)、[人物故事](../../content/lore/characters/night-p-serin-sowe.json)。
- 馬特烏斯・維埃拉（駕駛）：[person](../../content/base/persons/night-p-mateus-vieira.json)、[人物故事](../../content/lore/characters/night-p-mateus-vieira.json)。

共享展示：[兩本帳](../../content/base/scenarios/night-p-two-ledgers.json)（情境）。

### R2八 lore

<!-- wf-nav -->
- [撤旗後的路](../../content/lore/events/night-r2-accra-lowered-banners.json)（事件）
- [三日艙裡的第二張價](../../content/lore/events/night-r2-ferry-second-price.json)（事件）
- [拆列過站](../../content/lore/events/night-r2-ring-road-split-convoy.json)（事件）
- [把營圖攤到天網](../../content/lore/events/night-r2-uluru-public-camp-sheet.json)（事件）
- [斷翼外廊](../../content/lore/places/night-r2-post-broken-wing.json)（地點）
- [空腹船塢](../../content/lore/places/night-r2-quito-empty-hull.json)（地點）
- [倒棚脊](../../content/lore/places/night-r2-red-earth-fallen-ridge.json)（地點）
- [斷梯吊井](../../content/lore/places/night-r2-rift-hanging-shaft.json)（地點）

## 收線導航

十份brief已歸檔；詳[行政REPORT](../workflows/dispatch/handoffs/close-night-1028/REPORT.md)、[搬移清單](../workflows/dispatch/handoffs/close-night-1028/handoff-ledger.json)與[done索引](../workflows/dispatch/handoffs/done/README.md)。

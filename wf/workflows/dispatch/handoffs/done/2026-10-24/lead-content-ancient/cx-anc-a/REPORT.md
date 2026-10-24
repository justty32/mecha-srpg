# cx-anc-a 完成回報

## 做了什麼

完成 A 組六台 S 級古代機甲：芬里爾、阿努比斯、哪吒、須佐之男、提亞瑪特、毛伊；新建三種 bodyplan、15 個能力與 10 個效果。各機具兩個信念、一個 deed、0.5 共鳴門檻；每台保留一個無共鳴要求的基本攻擊，其餘神異能力 require 共鳴。新 bodyplan 採殼／血肉／器官層序列，具 core、pilot 座位與 locomotion。

已遵循 10:55 上游風格 order，名稱與 badge 使用神話、儀式、血肉、潮與誓言語彙；已讀當時存在的 content/lore/README.md，當時未見 style.md。

固定四條驗收證據：

1. bodyplan 後與每兩台後共四次執行 `npm run check`，每次 exit 0；末次末行 `OK 0 errors, 0 warnings`，沒有其他工人的錯誤待排除。
2. 唯讀 Node 計數確認 6 frame、3 bodyplan、15 ability、10 effect；34 個內容檔共 34,889 bytes，加本 REPORT 共 35 個新交付檔，容量低於 300 KB。能力與效果名稱皆屬 A 組 ax- 代號。
3. 唯讀 Node 確認每個能力有非空 `ai.tactics`、模式僅 activated／sustained，內容內的 frame／bodyplan／ability／effect／species 引用全部存在；其餘 schema 與池引用由 check 通過。
4. 本 REPORT 提供四段、完整交付檔案清單與末尾工具說明。

荒神用嵐池帶掛載加成：維持能力鎖上限 20、drain 20、regen 15；池上限小於 60 且池值至少 1 才進加成帶，零產出用來在開關後更新池帶。如此效果來源由池帶管理，解除或耗盡後可撤回。沒有改引擎。

未 commit，未跑 npm test；驗收止於交接書固定四條。

## 產出

以下列出全部 35 個交付檔，每件一句定位；未修改既有檔。

- [content/base/abilities/ax-brinemother-brood.json](../../../../../../../../content/base/abilities/ax-brinemother-brood.json)：生十一怪・母海裂腹，耗鹹水 30、最多兩次，相鄰召喚潮狼。
- [content/base/abilities/ax-brinemother-tide.json](../../../../../../../../content/base/abilities/ax-brinemother-tide.json)：鹹潮・阿普蘇之淚，無共鳴門檻、耗鹹水 5 的 24 傷錐形酸潮。
- [content/base/abilities/ax-chainbreaker-howl.json](../../../../../../../../content/base/abilities/ax-chainbreaker-howl.json)：嗥月・吞神之夜，範圍降低敵方駕駛員決心並觸發士氣檢定。
- [content/base/abilities/ax-chainbreaker-jaws.json](../../../../../../../../content/base/abilities/ax-chainbreaker-jaws.json)：噬日之顎，無共鳴門檻的 30 傷近戰，產怒 20。
- [content/base/abilities/ax-chainbreaker-unbound.json](../../../../../../../../content/base/abilities/ax-chainbreaker-unbound.json)：斷鏈・六物皆空，耗怒 60，啟動兩回合狂化。
- [content/base/abilities/ax-lotus-reborn.json](../../../../../../../../content/base/abilities/ax-lotus-reborn.json)：蓮花化身・此身還我，單場一次、維持三回合的重生姿態。
- [content/base/abilities/ax-lotus-ribbon.json](../../../../../../../../content/base/abilities/ax-lotus-ribbon.json)：混天綾・翻江，四格直線降低敵方先攻與閃避。
- [content/base/abilities/ax-lotus-ring.json](../../../../../../../../content/base/abilities/ax-lotus-ring.json)：乾坤圈・碎關，無共鳴門檻、射程四格的 28 傷基本攻擊。
- [content/base/abilities/ax-psychopomp-procession.json](../../../../../../../../content/base/abilities/ax-psychopomp-procession.json)：喚屍・冥途步，耗卡 1、最多三次，喚蟎並獲得短暫閃避。
- [content/base/abilities/ax-psychopomp-staff.json](../../../../../../../../content/base/abilities/ax-psychopomp-staff.json)：引魂杖・開路，無共鳴門檻的 28 傷近戰。
- [content/base/abilities/ax-psychopomp-weigh.json](../../../../../../../../content/base/abilities/ax-psychopomp-weigh.json)：秤心・瑪亞特之羽，遠距施加持續三回合的秤心標記。
- [content/base/abilities/ax-stormblade-aragami.json](../../../../../../../../content/base/abilities/ax-stormblade-aragami.json)：荒神・逐天之嵐，維持時鎖嵐上限 20、每回合耗嵐 20。
- [content/base/abilities/ax-stormblade-cloudblade.json](../../../../../../../../content/base/abilities/ax-stormblade-cloudblade.json)：天叢雲・斷尾，無共鳴門檻、每目標 24 傷的近身錐形穿刺。
- [content/base/abilities/ax-sunsnarer-jawbone.json](../../../../../../../../content/base/abilities/ax-sunsnarer-jawbone.json)：祖母顎骨・釣起群島，無共鳴門檻的 30 傷近戰穿刺。
- [content/base/abilities/ax-sunsnarer-snare.json](../../../../../../../../content/base/abilities/ax-sunsnarer-snare.json)：縛日・長晝之結，耗詭計 2，遠距束縛敵人兩回合。
- [content/base/bodyplans/ancient-hound.json](../../../../../../../../content/base/bodyplans/ancient-hound.json)：四足斷鏈獵殼，六部位共 600 層 HP，胸腔配置 pilot 座位。
- [content/base/bodyplans/ancient-serpent.json](../../../../../../../../content/base/bodyplans/ancient-serpent.json)：頭、前環、後環、尾四部位共 720 層 HP，前環母腔配置 pilot 座位。
- [content/base/bodyplans/ancient-slender.json](../../../../../../../../content/base/bodyplans/ancient-slender.json)：輕靈人形殼，四部位共 550 層 HP，供哪吒與毛伊使用。
- [content/base/effects/ax-brinemother-brood.json](../../../../../../../../content/base/effects/ax-brinemother-brood.json)：十一怪之胎，入場時召喚一隻 D 級潮狼的儀式效果。
- [content/base/effects/ax-chainbreaker-howl.json](../../../../../../../../content/base/effects/ax-chainbreaker-howl.json)：諸神黃昏之嗥，人物決心 −10，入場時執行 DC 50 士氣檢定。
- [content/base/effects/ax-chainbreaker-unbound.json](../../../../../../../../content/base/effects/ax-chainbreaker-unbound.json)：格萊普尼爾已斷，兩回合命中 +15、決心 +10、閃避 −5。
- [content/base/effects/ax-chainbreaker-wrath.json](../../../../../../../../content/base/effects/ax-chainbreaker-wrath.json)：吞日之怒，怒池達 60 時命中 +5 的池帶效果。
- [content/base/effects/ax-lotus-entangled.json](../../../../../../../../content/base/effects/ax-lotus-entangled.json)：混天纏身，兩回合先攻 −6、閃避 −10。
- [content/base/effects/ax-lotus-reborn.json](../../../../../../../../content/base/effects/ax-lotus-reborn.json)：蓮身無父，三回合閃避 +20、決心 +15。
- [content/base/effects/ax-psychopomp-procession.json](../../../../../../../../content/base/effects/ax-psychopomp-procession.json)：冥途同行，相鄰召喚 D 級蟎，一回合閃避 +20。
- [content/base/effects/ax-psychopomp-weighed.json](../../../../../../../../content/base/effects/ax-psychopomp-weighed.json)：心重於羽，命中 −10，每個自身回合受 6 點 energy 傷害。
- [content/base/effects/ax-stormblade-aragami.json](../../../../../../../../content/base/effects/ax-stormblade-aragami.json)：荒神降身，維持鎖嵐且嵐未耗盡時命中 +15、先攻 +5。
- [content/base/effects/ax-sunsnarer-bound.json](../../../../../../../../content/base/effects/ax-sunsnarer-bound.json)：日足入網，兩回合先攻 −8、閃避 −10。
- [content/base/frames/ancient-brinemother.json](../../../../../../../../content/base/frames/ancient-brinemother.json)：提亞瑪特，以有限鹹水孕育潮狼的長身兩棲母殼。
- [content/base/frames/ancient-chainbreaker.json](../../../../../../../../content/base/frames/ancient-chainbreaker.json)：芬里爾，以怒池、斷鏈信念與復仇共鳴驅動的四足古代機。
- [content/base/frames/ancient-lotus.json](../../../../../../../../content/base/frames/ancient-lotus.json)：哪吒，無機體池、高閃避，以冷卻與單場一次蓮身重生作戰。
- [content/base/frames/ancient-psychopomp.json](../../../../../../../../content/base/frames/ancient-psychopomp.json)：阿努比斯，以三份不可再生的卡護送亡者的古代機。
- [content/base/frames/ancient-stormblade.json](../../../../../../../../content/base/frames/ancient-stormblade.json)：須佐之男，以嵐池維持荒神、持天叢雲斬敵的古代機。
- [content/base/frames/ancient-sunsnarer.json](../../../../../../../../content/base/frames/ancient-sunsnarer.json)：毛伊，以每回合累積的詭計縛日、揮祖母顎骨作戰的輕靈古代機。
- [wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-a/REPORT.md](REPORT.md)：本線完成證據、完整產出清單與設計取捨。

## 沒做到或證據不足的

為遵守件數 gate（連 REPORT 一併控制在 35 檔），採設計表每台 2–3 招的範圍：阿努比斯將喚屍與冥途步合成一招，另補無共鳴的引魂杖；須佐之男本批取天叢雲與荒神，未獨立做八岐斬；提亞瑪特本批取鹹潮與生十一怪，未做混沌之淵；毛伊本批取祖母顎骨與縛日，未做變鷹。其餘概念照表實作。

本線僅做內容定義與指定靜態驗收，未提供動態戰鬥平衡證據。喚屍依設計表以有限卡池召喚 D 級蟎，未加入屍體消耗或回收卡的機制。勢力保有、摹機血統與取得情境不在可寫範圍，未加資料或欄位。

## 需要決定的事

無本線阻塞或待裁示事項；領導可依既定流程整合與 commit。

以後交接書該點名的工具：無。


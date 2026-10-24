# cx-anc-b 完成回報

## 做了什麼

完成 B 組六台古代機甲、兩個 bodyplan、16 個能力與 9 個效果；內容共 33 件、31,928 bytes。加本 REPORT 共 34 件，低於 300 KB，未觸發件數或容量 gate。只新增指定內容與本 REPORT，未 commit、未改既有檔、未跑 npm test。

遵照 2026-10-24T10:55 新 order：名稱與 badge 採神話、誓言、殼與星辰語彙；已讀現有 content/lore/README.md，當時尚無 style.md，README 亦尚無「風格與用語」節。

依固定四條驗收：
1. bodyplan 完成後及每兩台完成後均執行 npm run check；最後一批 exit 0，末行為「OK 0 errors, 0 warnings」，沒有需要歸給別線的錯誤。
2. 六個 frame、兩個 bodyplan 存在；16 abilities、9 effects，全數屬 B 組指定代號。
3. 每個能力有 ai.tactics；除守淺灘為允許的 reaction，其餘只用 activated／sustained；引用由 npm run check 驗證存在。
4. 本 REPORT 提供四段及完整檔案清單。

為遵守能力 16 件上限，將迦樓羅「啖蛇／甘露」合併為一招，佩倫「天罰／橡根」合併為一招，保留各自消耗、傷害與祝福構想。阿特拉斯護友沿用 effect/rearguard-oath；海姆達爾殼針留記沿用 effect/shard-marked。六台各有一個 require 空陣列的基本攻擊；其他能力皆要求 self.resonance >= 0.5。

## 產出（完整檔案清單，每件一句定位）

- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/bodyplans/ancient-winged.json`：有翼古殼，總層 HP 600；雙翼提供 locomotion，殼心容納 pilot。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/bodyplans/ancient-colossus.json`：承天巨像，六部位總層 HP 720，殼心容納 pilot。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-plumed-dawn.json`：太陽達 80 的感知 +8 池帶。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-plumed-featherwind.json`：羽風能力／效果：友軍範圍迴避 +15，持續 2 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-serpenteater-amrita.json`：甘露祝福，決心 +15、命中 +10，持續 3 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-plumed-morningstar.json`：無共鳴門檻的長程晨星基本攻擊，4 AP、28 energy。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-plumed-featherwind.json`：羽風能力／效果：友軍範圍迴避 +15，持續 2 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-plumed-fifth-sun.json`：耗太陽 80 的第五太陽，半徑 3、每目標 26 thermal。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-serpenteater-golden-dive.json`：無共鳴門檻的金翅基本撲擊，傷害隨目標階級由 24 升至 33。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-serpenteater-serpent-amrita.json`：啖蛇與甘露合一：耗甘露 10，酸蝕破甲並祝福自身。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/ancient-plumed.json`：魁札爾科亞特爾：羽蛇飛行古機，太陽池隨戰場光照回復。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/ancient-serpenteater.json`：迦樓羅：金翅飛行古機，甘露為 30 點不可再生資源。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-thunderoak-oakroot.json`：橡根姿態：迴避 -10、決心 +15、命中 +10，帶 rooted，持續 3 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-riastrad-warp.json`：扭曲狂祝福：命中 +20、先攻 +10，持續 2 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-thunderoak-thunderaxe.json`：無共鳴門檻的直線雷斧，耗雷荷 1、產熱 30、每目標 26 energy。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-thunderoak-oak-judgment.json`：天罰與橡根合一：耗雷荷 3、產熱 80、範圍 26 thermal，維持消耗人物疲勞。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-riastrad-gae-bolg.json`：無共鳴門檻的迦耶伯格，消耗人物 hp 5，32 pierce、高破甲與暴擊。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-riastrad-warp-spasm.json`：扭曲狂維持能力，持續消耗人物 fatigue。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-riastrad-ford-guard.json`：守淺灘反應技，enemyLeavesAdjacent＋melee，每回合一次。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/ancient-thunderoak.json`：佩倫：慢速雷橡巨像，雷荷與熱量雙池，沿用既有過熱帶。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/ancient-riastrad.json`：庫丘林：無機體池，以駕駛員生命與疲勞支付戰鬥代價。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-skybearer-skyburden.json`：天穹達 60 時先攻 -3；同一效果在天穹達 100 時再給迴避 -15。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-skybearer-unburden.json`：卸重能力／效果：自身 onApply 減少天穹 60，冷卻 2 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-watchhorn-gjallarhorn.json`：加拉爾號角能力／效果：每戰一次、半徑 6，友軍先攻 +5／命中 +15，持續 3 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/ax-watchhorn-bifrost.json`：虹橋守能力／效果：維持消耗守望，感知 +15／迴避 +10，祝福持續 3 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-skybearer-hold-sky.json`：擎天護友：增加天穹 25、允許 soft 超載，沿用殿後之誓的迴避 +10／先攻 +3。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-skybearer-earthshaker.json`：無共鳴門檻的近身地動，半徑 1、每目標 24 kinetic。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-skybearer-unburden.json`：卸重能力／效果：自身 onApply 減少天穹 60，冷卻 2 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-watchhorn-gjallarhorn.json`：加拉爾號角能力／效果：每戰一次、半徑 6，友軍先攻 +5／命中 +15，持續 3 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-watchhorn-far-sight.json`：無共鳴門檻的千里眼基本攻擊，24 pierce，沿用殼片標記降目標迴避。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/ax-watchhorn-bifrost.json`：虹橋守能力／效果：維持消耗守望，感知 +15／迴避 +10，祝福持續 3 回合。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/ancient-skybearer.json`：阿特拉斯：承重巨像，反向 soft 天穹池累積負擔。
- `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/ancient-watchhorn.json`：海姆達爾：守望與號角古機，兼具遠程留記與友軍指揮。
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-ancient/cx-anc-b/REPORT.md`：本線四段交付報告、驗收證據、完整檔案清單與實作限制。

## 沒做到或證據不足的

沒有跑戰鬥測試或擴增驗收；本次證據限內容載入檢查、指定件數與能力欄位檢查。

閱讀既有引擎時發現維持能力的效果來源限制：src/rules/attack.ts 將能力效果來源設為 actor，src/rules/command.ts 停止維持時則移除 sustain:<unit>:<ability> 來源。為避免 whileSource 祝福在停止維持後永久殘留，本線橡根、扭曲狂與虹橋守祝福均使用 2–3 個 ownerTurns 的有限時鐘。因此祝福可能在維持停止後持續到時鐘結束，或在維持仍開啟時先到期；不能聲稱已達成「開著就永久生效、關閉即移除」。未修改範圍外引擎。

設計表要求的勢力持有與摹機藍本關係未加入 frame：現有型別無對應敘事欄位，world／lore／spec 亦不在本線可寫範圍，仍以共用設計表為準。

## 需要決定的事

領導可另線處理上述 sustained 效果來源與關閉生命週期；本線未因此加碼驗收或修改 src。內容件數與固定四條驗收均完成，無其他待決事項。

以後交接書該點名的工具：無。


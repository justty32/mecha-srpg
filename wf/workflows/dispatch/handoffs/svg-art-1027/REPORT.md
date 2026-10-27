# 原生 SVG 美術試作 — 本輪完成

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `2863782` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

交付：[離線展示](../../../../../art/svg-study-1027/index.html)｜[使用方式與最小配方](../../../../../art/svg-study-1027/README.md)｜[設定來源](../../../../../art/svg-study-1027/SOURCES.md)｜[畫風與色票](../../../../../art/svg-study-1027/art-direction.md)。

## 做了什麼與主線判斷

完成9張主題圖：兩人物日式動漫肩上像、堅盾-I三風格、釜山三風格及靜海修船塢；另有地面／道路／瓦礫／掩體四地格、射擊／命中／爆炸三特效。共16個獨立美術SVG，另有兩份共享部件SVG。

主線已實際看圖，確認人物與兩交叉無明顯接縫破洞、年長灰鬚可辨；機甲三風格及混搭可收；城市、塢、地格及特效靜態可作試作。本輪停止改畫，供使用者最後選風格，不是最終美術定稿。城市如實定位為六層示意／微縮景初版，尚非完整大場景；特效只收靜態輪廓，不稱動畫目視驗收。

## 模型、來源與美術推定

全部實際美術、部件、畫風說明與動畫CSS均由 `gpt-6-astra` 製作。早期兩條 `gpt-6.1-sol` 線只讀規矩／核來源，產SVG前即依使用者裁示停止。領導整理設定、分派、收件、原生JS／HTML與Python重建；人物使用同一持久astra session接受目視退修，未重選人物。先最多兩工，後依使用者授權最多三工；滿三工領導只協調與輕量審查。

卡茂依現有人物文本：46歲、外貌約34、無角鱗；薩米爾45歲、看似60，手疤未移到臉。堅盾依frame/bodyplan及三元件：機械雙足、左散紋吼砲／右凡鐵連吼、軀幹外掛複合裝甲。釜山依坡城、貨櫃港、彩幡、黑金機庫；靜海塢依展開白艙板、吊架、工人與塢口黑天。逐檔來源與提案邊界見SOURCES.md；外貌、材質、機構細節與城市配置皆提案，沒有新增正史或改設定。不畫P01爭議設定。

冷鋼基準沿用主線接受的苔灰／骨白／赭黃稿，不冒稱已換目標冷灰色票；祕儀弧殼骨白黑金、狂潮偏斜破甲暗紅，均仍機械。三城市改屋頂、吊臂、機庫及前景輪廓，非只換色，非城市失守或新歷史。

## 程式組裝與離線展示

`portrait-parts.svg`／manifest定義5類各2選項、2預設；`mech-parts.svg`／manifest定義共享骨架／座艙與頭、外甲、成對武器各3選項、3預設。family、共用viewBox、錨點及遮擋寫入manifest。相容限本輪姿態與比例，不承諾任意骨架、左右武器翻面或跨族拼接。

`assembly.js` 純配方包含部件ID、family、HEX替色、預設還原、兩件替換及完整立繪fallback；`demo.js` 負責DOM與SVG呈現，沒有fetch。README有 `recipeFromPreset → swapParts → assemble` 用法。完整人物／機甲由 `rebuild.py` 重建，單張只帶該preset所需symbol及遞迴defs；頁面嵌每族一份全共享defs，不手維護重複幾何。沒有宣稱所有輸出都比原始手寫SVG小。

展示含九圖、三風格比較、深淺底、小頭像、實際換件與fallback、城市六層開關／9個可聚焦熱點、手動單次動態及棋盤示意。城市三版檔內共用六層與熱點語義，嵌頁前綴ID避免碰撞；關互動層時可見物件與熱點一起隱藏。單位圓標、HP與選取／範圍覆蓋只在示意頁，未改src。CSS正常展開：style.css、workshop.css、city-motion.css、effects.css，未為行數minify。

## 固定驗證與證據

`python3 final-check.py` 通過：18份SVG XML、metadata、唯一ID、純向量與本機引用；16資產件數；三城市六層、9熱點與動態物件；獨立圖只含選用symbol；HTML全部相對引用、18開關、2換件區、3重播及2fallback；JS語法、CSS單次時長／減少動態與空白檢查。`git diff --check` 在本線兩寫域通過，新增文字另檢無行尾空白。沒有跑npm、遊戲整合或全套測試。wf總檢查留主線。

`node check-demo.cjs` 使用實際manifest通過7組組裝、兩件更換、無效選項原子拒絕、相容族拒絕、HEX替色規則、fallback、層關閉／熱點失焦還原及重播重啟的純邏輯檢查。生成器的遞迴defs選取另以間接paint引用檢查，保留間接依賴並排除未用symbol。

離線PNG使用系統既有librsvg／cairo，以Python ctypes呼叫；載入渲染器前用既有libseccomp禁止socket／connect等網路syscall，實測socket建立被拒。不開GUI、不連外、不下載或安裝。靜態證據：[4人物＋4機甲](doll-contact-sheet.png)、[3城市](city-contact-sheet.png)、[靜海塢](repair-dock-preview.png)、[四地格＋三特效](battle-contact-sheet.png)，領導與主線均已實際看圖。

特效CSS為280／360／620ms單次、結束透明；reduced motion為120ms淡出；城市單次2.8–3.6秒、reduced motion禁動畫。JS有animationend與逾時清除。**實際瀏覽器UI、布局、鍵盤操作及動畫時間序列未驗證**：既存headless缺libnspr4／nss／asound，沒有安裝；Node與靜態結果不冒充瀏覽器驗收。

## 件數與體積

美術／程式目錄：32檔，553,285 bytes。報告／證據目錄：37檔，2,214,738 bytes。兩寫域合計69檔、2,768,023 bytes；排除本機.log、.last.txt及bytecode，含保留的早期退回PNG。連本機log與bytecode一併計仍為78檔、4,728,871 bytes，低於80檔／10MB gate。完整log／last不列提交，主線自行整理，不在本線寫入.git。

人物唯一部件＋manifest：31,735 bytes；機甲唯一部件＋manifest：56,037 bytes。重建兩人物：30,591 bytes；重建三機甲：68,223 bytes；生成離線index.html：196,693 bytes。來源與輸出分列，未虛稱固定節省比例。

## 收線與需要決定的事

所有子工已回收，現役0，行程查核未見本線殘留codex。城市／批次／最後人物均正常終局；機甲在既定交付與REPORT完成後由領導停止尚存活行程，沒有追加工具探查。早期sol停止紀錄見model-switch.md。全部直接寫共享工作區，未commit/push、未改遊戲／content／legacy／原始設定、未開伺服器或GUI。

不需新增架構或權限裁決。使用者下一步僅選畫風、品評試作；主線接手獨立核驗、整理本機log並提交。早期kamau-preview.png與kamau-anime-preview.png為退回稿，最終以doll-contact-sheet及生成SVG為準。

## 主線獨立核驗

2026-10-27：主線實跑final-check.py與check-demo.cjs通過；wf strict為既有legacy兩處斷鏈，broken=2，其餘residue/oversize/biglist/querycmd/local皆0，不能稱wf全綠。未改content/src/legacy。領導與全部子工已關閉。執行logs／last及Python bytecode已搬入`.git/svg-art-1027-local/`本機保留，不提交、不刪除；早期退回圖保留以便對照。畫風評閱與實際瀏覽器／動畫驗證記入WAIT_USER。

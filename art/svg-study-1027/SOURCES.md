# 設定來源與提案邊界

[展示頁](index.html)｜[使用方式](README.md)

全部為視覺草案，沒有修改原始設定，也沒有接入遊戲。現有內容本身仍可能是待審稿；這裡只依目前檔案作圖，不替它定案。

## 人物

**卡茂・恩德瓜**：[原文](../../content/lore/characters/kamau-ndegwa.json)，body 第二段：實齡46、外貌約34、機械系臉上無角鱗，長期使用堅盾-I。寬顎、短髮、膚色、衣領、表情與服裝細節皆為美術提案，不從出身推定正史外貌。

**薩米爾・卡恩**：[原文](../../content/lore/characters/samir-khan.json)，body「2108」：45歲、看似60；初次走出蝕域時雙手有酸燒後長好的疤。肩上像不畫雙手，也不把手疤搬到臉上。長臉、髮線、灰鬚、披領及配色均為美術提案；不把他聲稱認主的迦梨當已證實設定。

## 機甲

**堅盾-I型**：[frame](../../content/base/frames/bulwark-i.json) 的 defaultLoadout 與 bodyPlan；[bodyplan](../../content/base/bodyplans/mx-biped-d.json) 的軀幹、頭、左右臂及雙腿；[model](../../content/base/world/models/bulwark-i.json) 為通用 D 級。依機體自身左右：左臂[散紋吼砲](../../content/base/components/mx-scatter-rune.json)、右臂[凡鐵連吼](../../content/base/components/mx-iron-repeater.json)；[外掛複合裝甲](../../content/base/components/composite-plate.json) 加在軀幹。

外殼輪廓、槍口結構、關節工法、配色與感測器具體形狀均為美術提案。設定未要求手持盾，沒有因名稱擅自補盾。圖稿左右以 SVG 具名群組與工人報告核對。

## 環境

**釜山城邦遠景**：[原文](../../content/lore/places/busan.json)「地貌與氣味」：山坡入海、舊貨櫃港仍運轉、吊臂彩幡、燈籠與黑金機庫。建築樣式、比例、港灣配置、光線、天候與構圖均為美術提案，不作地圖或新增具名地標。

**靜海修船塢**：[原文](../../content/lore/places/tranquility-repair-dock.json)「地貌與氣味」「2108的狀態」：白色艙板沿吊架展開、船腹下工人、未合好艙門、塢口黑天。船型、吊架機構與未具名工人的外觀皆為美術提案，不新增科技或人物設定。

## 地格與戰鬥特效

只讀既有 [board.ts](../../src/ui-adapter/dom/board.ts)、[style.css](../../src/ui-adapter/dom/style.css)、[fx.ts](../../src/ui-adapter/dom/fx.ts) 與 [grid-view.ts](../../src/ui-adapter/dom/grid-view.ts)。沿用正方格概念，讓底色可透出，另用單位圓標、HP條、選取框、範圍和目標色塊檢查辨識。四類地格與射擊／命中／爆炸均為使用者指定的美術試作，紋理與演出不代表新地形規則或戰鬥數值。

美術設計／SVG與特效關鍵影格由 gpt-6-astra 製作。展示頁按鈕只觸發一次演出；沒有更動遊戲原始碼。

## 三風格與共享部件

[畫風說明](art-direction.md) 為 astra 的視覺提案，冷鋼基準保留主線已目視接受的苔灰／骨白／赭黃稿，不宣稱已換成目標冷灰色票。祕儀與狂潮改變外殼及輪廓，不改機械雙足或左右既定武器。城市三版為同一批設施的不同表現，不是新歷史事件。

人物共用部件由 astra 按日式動漫退修：乾淨線稿、成組髮束、日漫眼型、簡鼻、2～3階賽璐璐；保留34／60歲外貌差異。兩角色的臉、髮、眉眼、鼻口、衣服可交叉組合，混搭結果只作視覺測試，不新增人物。

`portrait-parts.svg`／`mech-parts.svg` 是唯一幾何來源，manifest 記部件選項、預設、錨點與遮擋。完整圖由 `rebuild.py` 重建；混搭不改正史或數值，也不鏡像左右武器。城市檔內六層穩定 id 共用，嵌入同頁時加風格前綴避免 id 衝突，`data-source-id` 保留原 id。

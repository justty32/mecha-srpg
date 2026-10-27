# 環境與戰場有界批次 — DONE

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `2863782` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

已直接寫入共享工作區，交付八份 SVG 與 effects.css；本檔為唯一批次報告，共十檔，低於 700 KB。未修改人物、機甲、城市、展示或遊戲程式，未開子工。

來源為 `content/lore/places/tranquility-repair-dock.json`、本夾 scene.md／tiles.md／effects.md、母 brief 與 `art/svg-study-1027/art-direction.md`。親讀適用工作流規矩，沿用既有選角。定向讀取 `src/ui-adapter/dom/board.ts`、`style.css`、`fx.ts`、`grid-view.ts`，確認正方格共用 cell-size、terrain.color 底色、中央單位與下緣 HP、獨立特效疊層。

修船塢畫出白板沿吊架展翼、船腹下微小工人、交接等待處、未合艙門和黑天塢口；作業平台、梯道、撤架車、通行帶支撐可停留的工作空間。來源未定的船體、建築、工具、服裝、色彩、視角與配置均為美術提案，剪影不指認任何具名角色。冷灰承重結構配暖白艙板與少量赭色標記，外圍透明。地格與特效同屬視覺提案，沒有新增世界事實或遊戲數值。

交付檔位於 `art/svg-study-1027/`：repair-dock.svg；tile-ground.svg、tile-road.svg、tile-rubble.svg、tile-cover.svg；fx-shot.svg、fx-hit.svg、fx-explosion.svg；effects.css。場景 viewBox 為 1200×800，其餘為 128×128；均附 title／desc 和具名群組。地格四邊留透明，細節集中外側，中央與底部 HP 區保留空間，供 terrain.color 透出。裂隙、平行路肩、不規則碎塊、折角牆分別提供形狀辨識。

特效接口嚴格使用 `.fx-stage.play[data-effect="shot|hit|explosion"] .fx-art`，由領導以 `img.fx-art` 引用並給容器尺寸、接手動播放按鈕；重播須移除再加入 play 並讓樣式重置。無 play 時透明，動畫各為 280／360／620ms、單次、終點透明，只對 fx-art 動畫。減少動態偏好改用 120ms 單次純透明度淡出，無位移縮放旋轉；SVG 不含濾鏡或內建動畫。未接入遊戲。

固定自查一：Python 標準庫 XML 解析八份 SVG，檢查 metadata、viewBox、具名群組、純向量允許集合、無腳本／點陣／外連／SMIL／濾鏡；檢查 CSS 接口、單次時長與透明終點、減少動態規則，並核對十檔容量與報告。通過。透明留白、場景來源對應及地格中心避讓由手寫幾何與文字核對；不冒充像素或視覺測試。

固定自查二：限定本批十檔執行 `git diff --check`，通過；第一條同時直接檢查十檔行尾空白與檔尾，涵蓋尚未被 git 追蹤的新檔。未執行其他驗證。

限制：未渲染、未產出 PNG、未目視；320px 場景層次、48px 地格辨識及實際播放效果尚未目視確認，由領導既有離線流程收件渲染。本線不找渲染工具、不加碼驗證，完成固定自查即終局。

# 2026-10-27 美術評閱與回家接續

使用者已在家；美術主觀評閱與瀏覽器驗收仍待完成。成果 `2863782`（首批 SVG／紙娃娃）、`04bf2dd`（機甲百層／局部演出）均已提交並 push，`f78e708` 記錄今日直接 push 授權。本次文件整理進行中；後續文件提交看 git log。

## 最新機甲重做

[機甲配置工坊](../../../art/mech-blueprint/index.html)｜[使用與重建說明](../../../art/mech-blueprint/README.md)：新原型的畫風、比例與手感待使用者評閱。agent 已驗固定視角 2D 抬臂、屈肘與屈膝；尚未接 Spine 或遊戲。

## 下次看圖

自行用 file 開啟 [既有展示 index.html](../../../art/svg-study-1027/index.html)，路徑不變，不需伺服器或下載；Agent 不代開 GUI。[展示與操作用法](../../../art/svg-study-1027/README.md)。

- 人物：卡茂、薩米爾兩人物日漫風格；髮型、五官、臉型等紙娃娃分件、交叉組裝及完整立繪 fallback，保留年齡差異。
- 三風格機甲與城市：冷鋼／祕儀／狂潮，造型與材質皆供選；城市六層為背景、遠景、中景、前景、動態物件、可點選／互動物件，目前是示意／微縮景初版。
- 靜海修塢、四地格、射擊／命中／爆炸特效，以及城市熱點與各層開關。
- 機甲各 9 大層／28 中層，冷鋼／祕儀／狂潮有效葉為 142／140／140；語意含 root 深 4，實際 SVG 最深 5。檢視父子開關、單看、左右臂連武器及還原可見性。
- JavaScript／CSS 演出：啟動、暫停／續播、還原演出；換件或配色重建後演出歸零，與可見性還原分開。試減少動態偏好與完整立繪模式。

## 回家驗收界線

既有 XML／Node 與離線靜態 PNG 檢查通過是歷史證據，**不等於真瀏覽器動畫、布局或鍵盤驗收**。headless 缺 libnspr4／nss／asound，公司未安裝、未下載、未開 GUI；本整理不重跑整合／渲染。

依環境接續驗真瀏覽器布局、鍵盤焦點與熱點、樹與換件互動、CSS 動畫時間序列及暫停／續播／還原。遊戲整合仍未完成；畫風也待使用者評閱，不能以主線已看 PNG 當使用者定稿。

必要套件使用者已允許，但任何下載（套件、字型、素材）前先告知項目、來源與用途。美術用 astra、一般整理／程式協作用 sol、簡單雜活 terra；詳見 [偏好](../../workflows/common/user.md)。

## 證據與其他待辦

[首批交付與圖像證據](../../workflows/dispatch/handoffs/svg-art-1027/README.md)｜[機甲階層／演出與證據](../../workflows/dispatch/handoffs/mech-layers-1027/README.md)｜[目前機甲 API 契約](../../workflows/dispatch/handoffs/mech-layers-1027/contract.md)

報告、驗證程式、JSON、PNG 與 SVG 證據均留原位置；已執行 brief 分到各報告的 briefs/，歷史驗證及 hash 不回寫。

[全專案接續](../../workflows/dispatch/handoffs/next-session.md) 保留七輪世界觀 draft 待家驗、P01／Fable 裁決及四條舊暫停線；不因今日美術收工代替舊線收線，也不清 worktrees 或本機 logs。

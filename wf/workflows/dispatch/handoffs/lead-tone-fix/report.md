# lead-tone-fix 收線報告（2026-10-26）

[handoffs](../README.md)｜依據 [plan-tone-review](../plan-tone-review/review.md)｜計畫 [plan/](plan/plan.md)｜白話審核表 [review.json](review.json)（61 列）｜轉交 base [plan/base-requests.json](plan/base-requests.json)

## 結論

Fable 基調審查方向 1–5 已落地：62 個 lore 檔＋3 份設定筆記，年表增 5、改 8。一處沒照 Fable：**漲潮倒數定十一天不是三天**——`specs/world/opening.md` 第 7、21 行明寫「十一天後，不是三天後」，spec 優先於 lore，Fable 推薦的前提（三天是鐵姨開場台詞）與 spec 不符。改的是葬禮與瑪拉兩處的「三天」。

## 驗收

lore check 0 錯 6 警告（3 撤件 hidden 不進年表＋2 舊件＋另一撤件）；`npm test` 966/966；wf-lint 見頂層回報。閘門：tf-02 add 模式 0 違規、`--carry` 帶回；tf-01／tf-03 polish 模式違規 7＋8 條全是預先核可的非文字改動（visibility、aka 增刪、secrets 增列、scale、status2108、region、consequences），逐條核過，確認 57 檔自 base 起未被他線改動後手動帶回，記 manifest `waivers`。

## commit

8c111ef（登記）、9364f46（內容＋年表＋索引＋設定筆記）、收線 commit 見 git log。

## 做了什麼

- **方向 1 美洲補光**：新事件 5——歸船斷座夜（西雅圖，礁角「折桅白冠」，「把港扛住！」）、斷纜夜（瓦爾帕萊索，青鬣「斷纜青鬣」，「山不來，我們站成山！」）、借山空返（向基多借維拉科查未果、帶回空擔架）、雪底留名（溫尼伯初雪念名）、空碗迎船（哈瓦那）；西雅圖、溫尼伯、哈瓦那、瓦爾帕萊索、貝倫、巴西利亞、卡塔赫納各補一個記號；蒙特婁 secrets 加 rumor「刑天動過一次」。兩隻二名獸採 lead-kaiju2 計畫提供的物種（礁角、青鬣）與二名，lore 只寫俗名與樣子、不引用 species id。
- **方向 2 錢與法理**：撤 4（河口換糧、另一本帳、吉布地城約、遷簿令）＝內容併入貝倫／內陸財團＋莉維亞／吉布地／雷諾，原檔加 `visibility: hidden`、summary 改「已併入…」，年表條目保留、去掉 event 引用；「地契押給月亮」收到只剩紐約與聖馬洛當代表；政府進山改寫成最後一列火車、墨西哥城徵召令加赤鞍獵團與堅盾「守門」、莉維亞加一句「先讓人吃上，帳才走得完」、改名的日子加蒙特婁沒升旗的崗哨；江口、杜拜、庫爾納、蘇拉特、堪察加、吉布地換成各自的畫面。計畫估算帳為主角件約 70→50。
- **方向 3 殘聯機甲史**：公發（穆索與缺翅麻雀）、獵犬授權（燕鷗舊腿站起）、長槍-V4 定版（寧仔與「啞鷺」）、堅盾-II 定版（缺料時修回舊盾）四件。
- **方向 4 機械清理**：aegir-wakes summary 去「開局」、歸矢去提案標記；三個英文回譯 aka 刪、三寶顏 aka 改 Zamboanga；季克西→提克西（加 aka Tiksi）；lore 內「液壓」全改「筋」；rift-beasts 末三節縮一節；眾名成冊縮短；設計筆記 aegir／history-lines／city-types 拿掉歸矢、踏浪為岸、唱名夜、城約的提案標記。
- **方向 5 八項矛盾**：葛西蓮男、倒數十一天（見結論）、浦那二十去十九回、老桂 2102 堅盾-I、法蒂瑪 2101 接手、綠線未封口、劍魚-V5 B 級試作、燕鷗長槍改型（霍華的「夸父直系」標為吹噓）。

## 建議刪除清單（使用者確認後由頂層刪）

`content/lore/events/estuary-exchange.json`、`another-ledger.json`、`djibouti-charter.json`、`inland-registers.json`——皆已 hidden、內容已併入主檔；刪時一併清各人物／勢力檔 `events` 陣列裡指向它們的 id（check.ts 會報）。

## 轉交（本線不可寫）

- **content/base**（`plan/base-requests.json` 8 列，替換句已寫死）：五個 frame etymology 去「提案名／掛接提案」、`components/oa-hydraulic-assist` 名稱「順行液壓組→順行筋組」與說明、`frames/moji-tern` tag `lineage-kuafu→lineage-xingtian`。目前 lore 已叫順行筋組、base 仍叫順行液壓組，名稱暫不一致。
- `wf/workflows/content/mechs.md` 血統對照段燕鷗改刑天（規劃線／頂層）。
- 與 lead-kaiju2：西雅圖「折桅白冠」、瓦爾帕萊索「斷纜青鬣」已寫進 lore（2106-10、2107-02），其物種與二名若改名請同步這兩件事件與兩個地點檔。

## 需要使用者決定

1. 漲潮倒數：本線依 spec 定十一天；若要三天，先改 opening.md 開場台詞與蝕曆讀法，再改 lore。
2. 四件撤件可否刪檔。

## 小事

tf-03 的 I56（萬潮葬王例外句從領主段移到末節）沒移：留在原處、末節不重複，效果相同。整理暫存區時曾以 `git reset HEAD -- content/lore content/index` 同步主索引，只動暫存狀態、不碰工作樹，他線的 path 限定 commit 不受影響。

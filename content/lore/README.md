# content/lore — 《蝕潮獵團》世界觀資料（wiki 用，不被遊戲載入器讀）

與遊戲內容包 `content/base/` 並列的世界觀資料夾：勢力、人物、大事件、地點、時代、年表。給 wiki 頁面（`lead-wiki`）讀，也給寫內容的人查設定。**不是**遊戲資料——遊戲只讀 `content/base/`；兩邊用 `gameRefs` 單向連結（lore → base）。

**先讀 [style.md](style.md)**（太空歌劇基調、能量與科技體系的用語、禁用詞；用語表在 [glossary.json](glossary.json)）——所有敘述文本照它寫。

設定優先序：使用者裁示（`wf/workflows/planning/design-notes/`）＞ world spec（`wf/workflows/planning/specs/world/`）＞ 本資料夾的創作。本資料夾不得與前兩者衝突；發現 spec 內部矛盾寫進規劃線 REPORT，不在這裡改。

## 檔案與 id 規則

一筆一檔，JSON，UTF-8，繁中。id 格式 `<kind>/<kebab-name>`，**檔名＝name 段**：`factions/selene.json` 的 id 是 `faction/selene`。kind 與資料夾對應：`faction`→`factions/`、`character`→`characters/`、`event`→`events/`、`place`→`places/`、`era`→`eras/`；年表是單檔 `timeline.json`。

所有交叉引用（`faction/…`、`character/…`、`event/…`、`place/…`、`era/…`）必須指向存在的檔。`gameRefs` 指向 `content/base/` 的 id，格式 `base:<kind>/<name>`（如 `base:faction/selene-whitegloves`、`base:person/ilse-brandt`、`base:node/dhaka`、`base:frame/ancient-rearguard`），只驗格式、不驗存在（base 由別線維護）。

日期字串：`YYYY`、`YYYY-MM` 或 `YYYY-MM-DD`；先民時代用負數年 `-8900`。`born`／`died`／`founded`／`from`／`to` 可為日期或自由字串（「約 2037」「不明」）。`body` 是 markdown 長文（300–1500 字），可用 `## ` 小標與條列，不放 HTML；`summary` 一句話。

驗證：`node content/lore/check.ts`（Node ≥ 22，零依賴）——JSON 合法、必填欄、id 與檔名一致、枚舉值、引用存在、timeline 排序、每洲地點數、可見度標記。0 錯才 commit。

## 欄位表

### 通用欄（每種檔都有，全必填）

| 欄 | 說明 |
|---|---|
| `id` | `<kind>/<name>` |
| `name` | 顯示名 |
| `aka` | 別名陣列（可空；era／event 沒有此欄） |
| `summary` | 一句話 |
| `body` | markdown 長文 |
| `tags` | 字串陣列（era 沒有此欄） |
| `gameRefs` | `base:…` 陣列（可空；faction／character／place 有，event／era 沒有） |

每種檔另可帶三個**可選**的可見度欄 `visibility`、`fieldVisibility`、`secrets`，見下方「可見度」。

### factions/<name>.json

必填：`type`（`大勢力`／`小勢力`／`獵團`／`企業`／`宗教`／`軍事`／`其他`）、`scale`（規模一句）、`founded`、`hq`（總部顯示文字）、`leaders`（`character/…` 陣列）、`ideology`（一句信條）、`relations`（`[{ "faction", "stance", "note" }]`，`stance` ∈ `同盟`／`友好`／`中立`／`緊張`／`敵對`，反映 **2108 開場當下**，歷史變化寫在事件與 body）。大勢力的 body 必含小節 `## 軍事組織與作戰風格`、`## 對傭兵：態度與補給`、`## 藍本古代機與研發路線`、`## 外交`。

| 可選欄 | 說明 |
|---|---|
| `places` | `place/…` 陣列：總部與主要地盤 |
| `ancientMech` | 藍本古代機 `{ "name", "foundAt": "place/…", "foundDate", "pilot": "character/…"｜null, "gameRef": "base:frame/…"｜null, "doctrine": 研發特色一句, "visibility"?: 可見度 }`；外界只聽過宣稱、沒人證實的標 `rumor` |
| `mechSeries` | 代表衍型機系列（命名照 design-notes：D 代號／A–C 系列＋型號／高階愈中二） |
| `mercPolicy` | `{ "generosity": 1–5（1 苛刻 5 大方）, "reliability": 1–5（1 會出賣 5 守約）, "note" }` |

### characters/<name>.json

必填：`born`（日期或自由字串；機魂填育成年）、`faction`（`faction/…` 或 `null`）、`role`（一句身分）、`relations`（`[{ "character", "relation", "note" }]`，`relation` 自由字串）、`events`（`event/…` 陣列）。

| 可選欄 | 說明 |
|---|---|
| `died` | 有才填 |
| `kind` | `human`／`soul`／`other`（機魂 `soul`；古代機當先民本人寫時 `other`） |
| `mech` | 所駕機甲名（古代機神話名、衍型機系列名、生物系登記號） |

### events/<name>.json

必填：`date`、`period`（`era/…`）、`factions`／`characters`／`places`（id 陣列，可空）、`consequences`（一句一條）。`tags` 建議：`war`（勢力間衝突）、`campaign`（勢力主導的清剿／攻堅）、`diplomacy`、`dig`（古代機挖掘／爭奪）、`tide`、`rumor`。可選 `kind`：`戰役`／`外交`／`挖掘`／`災難`／`政治`／`科技`／`其他`。可選 `occurs`：唯一值 `possible`＝開局（2108-01）後**可能發生**、日期不定的事件（`date` 仍須填一個代表日期）；百科不把它放進年表，詳情卡標「可能發生」。沒標就是已發生或確定發生。

### places/<name>.json

必填：`region`（文字，如「亞洲・孟加拉灣北岸」）、`continent`（大地圖分張：`亞洲`／`歐洲`／`非洲`／`北美`／`南美`／`大洋洲`／`南極`／`月面`／`軌道`，每洲至少 3 個地點）、`factions`（在此有存在感的 `faction/…`）。

| 可選欄 | 說明 |
|---|---|
| `aka` | 別名陣列（通用欄的 `aka` 在地點檔為可選，可省略） |
| `world` | `earth`／`moon`／`orbit` |
| `kind` | `城邦`／`野地`／`蝕域`／`遺跡`／`港`／`月面`／`軌道`／`船`／`其他` |
| `status2108` | 開場狀態一句（守住／失守／蝕線上／封鎖中…） |

### eras/<name>.json

`{ "id", "name", "from", "to", "summary", "body" }` 全必填；`to` 可為 `現在`。

### timeline.json

```json
{ "contract": "lore-timeline/1",
  "entries": [ { "date": "2089-03-14", "title": "第一次蝕潮", "summary": "…",
                 "event": "event/first-tide", "era": "era/first-tide",
                 "factions": ["faction/…"], "tags": ["tide"] } ] }
```

`event` 可選（有對應事件檔才填）；`era` 必填；依 `date` 升冪（年-only 排在該年所有月份之前）。開場（2108-01）之後的條目一律帶 tag `rumor`。

## 可見度（隱藏真相標記）

設定裡有些事外界不知道（例：塞勒涅早就懷疑月面人口與蝕潮有關）、有些只是傳聞（例：先知說迦梨認了他）。資料照實記，再用可見度標出**外界看得到多少**；百科（wiki）依標記決定顯示：

| 值 | 意思 | 百科怎麼呈現 |
|---|---|---|
| `public` | 外界公認（**沒標就是它**） | 照常顯示 |
| `rumor` | 外界只當傳聞，沒人證實 | 顯示，但標「傳聞」 |
| `hidden` | 外界不知道 | **不顯示**：建索引前就拿掉，搜尋、反向引用、年表、原始資料區都看不到 |

三個放法：

- **整筆或整個物件**：在該物件放 `"visibility"`。可放在條目根、`ancientMech`、`relations[]` 每列、`secrets[]` 每列、`timeline.json` 每筆。hidden 的條目會連同別處指向它的引用（陣列裡的 id、關係列、本文連結）一起從百科消失，本文連結只留文字。
- **頂層純值欄**：條目根放 `"fieldVisibility": { "<欄名>": "rumor"｜"hidden" }`，例 `{ "mech": "rumor" }`；欄名必須是本條目有的頂層欄，`id`／`name` 與三個可見度欄本身不能標。
- **不公開的真相或傳聞**：條目根放 `"secrets": [{ "visibility": "hidden"｜"rumor", "text": 一句, "date"?: 日期, "knownBy"?: ["faction/…"｜"character/…"], "note"?: 一句 }]`；`visibility` 必填。寫劇情、事件時查這裡，不必再翻設定筆記。

守則：既有敘述欄（`summary`／`body`）仍照外界口吻寫，真相不寫進敘述，放 `secrets`；標記只描述外界知情，不改欄位的值。

## 擴充規則

需要新欄位只能**新增可選欄**並在上表登記；不改既有欄的意義。`check.ts` 對未登記的欄位只警告不報錯。

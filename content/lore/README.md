# content/lore — 《潮獵》世界觀資料（wiki 用，不被遊戲載入器讀）

與遊戲內容包 `content/base/` 並列的世界觀資料夾：勢力、人物、大事件、地點、時代、年表。給 wiki 頁面（`lead-wiki`）讀，也給寫內容的人查設定。**不是**遊戲資料——遊戲只讀 `content/base/`；兩邊用 `gameRefs` 單向連結（lore → base）。

**先讀 [style.md](style.md)**（太空歌劇基調、能量與科技體系的用語、禁用詞）——所有敘述文本照它寫。

設定優先序：使用者裁示（`wf/workflows/planning/design-notes/`）＞ world spec（`wf/workflows/planning/specs/world/`）＞ 本資料夾的創作。本資料夾不得與前兩者衝突；發現 spec 內部矛盾寫進規劃線 REPORT，不在這裡改。

## 檔案與 id 規則

- 一筆一檔，JSON，UTF-8，繁中。id 格式 `<kind>/<kebab-name>`，**檔名＝name 段**：`factions/selene.json` 的 id 是 `faction/selene`。
- kind 與資料夾：`faction`→`factions/`、`character`→`characters/`、`event`→`events/`、`place`→`places/`、`era`→`eras/`。年表是單檔 `timeline.json`。
- 所有交叉引用（`faction/…`、`character/…`、`event/…`、`place/…`、`era/…`）必須指向存在的檔。`gameRefs` 指向 `content/base/` 的 id，格式 `base:<kind>/<name>`（如 `base:faction/selene-whitegloves`、`base:person/ilse-brandt`、`base:node/dhaka`、`base:frame/ancient-rearguard`），只要求格式、不驗存在（base 由別線維護）。
- 日期字串：`YYYY`、`YYYY-MM` 或 `YYYY-MM-DD`；先民時代用負數年 `-8900`（約公元前）。`born`／`died`／`founded`／`from`／`to` 可為日期或自由字串（如 `約 2037`、`不明`）。
- `body` 是 markdown 長文（300–1500 字），可用 `## ` 小標與條列；不放 HTML。`summary` 是一句話。
- 驗證：`node content/lore/check.ts`（Node ≥ 22，零依賴）——JSON 合法、必填欄、id 與檔名一致、枚舉值、引用存在、timeline 依日期排序。0 錯才 commit。

## 欄位表

### factions/<name>.json

| 欄 | 必填 | 說明 |
|---|---|---|
| `id` | ✓ | `faction/<name>` |
| `name` | ✓ | 顯示名 |
| `aka` | ✓ | 別名陣列（可空） |
| `type` | ✓ | `大勢力`／`小勢力`／`獵團`／`企業`／`宗教`／`軍事`／`其他` |
| `scale` | ✓ | 規模一句（人口、機甲數、地盤） |
| `founded` | ✓ | 成立時間 |
| `hq` | ✓ | 總部（顯示文字） |
| `leaders` | ✓ | `character/…` 陣列 |
| `ideology` | ✓ | 一句信條 |
| `summary` | ✓ | 一句話 |
| `body` | ✓ | 長文。大勢力必含小節：`## 軍事組織與作戰風格`、`## 對傭兵：態度與補給`、`## 藍本古代機與研發路線`、`## 外交` |
| `relations` | ✓ | `[{ "faction", "stance", "note" }]`，`stance` ∈ `同盟`／`友好`／`中立`／`緊張`／`敵對`；反映 **2108 開場當下**，歷史變化寫在事件與 body |
| `gameRefs` | ✓ | `base:…` 陣列（可空） |
| `tags` | ✓ | 字串陣列 |
| `places` | 可選 | `place/…` 陣列：總部與主要地盤 |
| `ancientMech` | 可選 | 藍本古代機 `{ "name", "foundAt": "place/…", "foundDate", "pilot": "character/…" 或 null, "gameRef": "base:frame/…" 或 null, "doctrine": 研發特色一句 }` |
| `mechSeries` | 可選 | 代表摹機系列字串陣列（依 design-notes 命名規範：D 代號／A–C 系列＋型號／高階愈中二） |
| `mercPolicy` | 可選 | `{ "generosity": 1–5（1 苛刻 5 大方）, "reliability": 1–5（1 會出賣 5 守約）, "note" }` |

### characters/<name>.json

| 欄 | 必填 | 說明 |
|---|---|---|
| `id`、`name`、`aka` | ✓ | 同上 |
| `born` | ✓ | 日期或自由字串；機魂填「育成」或登錄日 |
| `died` | 可選 | 有才填 |
| `faction` | ✓ | `faction/…`（主要歸屬；無則 `null`） |
| `role` | ✓ | 一句身分 |
| `summary`、`body` | ✓ | 同上 |
| `relations` | ✓ | `[{ "character", "relation", "note" }]`（`relation` 自由字串：師徒／仇敵／前任團長…） |
| `events` | ✓ | `event/…` 陣列 |
| `gameRefs`、`tags` | ✓ | 同上 |
| `kind` | 可選 | `human`／`soul`／`other`（機魂填 `soul`） |
| `mech` | 可選 | 所駕機甲名（古代機的神話名、摹機系列名、生物系登記號） |

### events/<name>.json

| 欄 | 必填 | 說明 |
|---|---|---|
| `id`、`name` | ✓ | |
| `date` | ✓ | 日期字串 |
| `period` | ✓ | `era/…` |
| `summary`、`body` | ✓ | |
| `factions`、`characters`、`places` | ✓ | id 陣列（可空） |
| `consequences` | ✓ | 一句一條的後果陣列 |
| `tags` | ✓ | 建議：`war`（勢力間衝突）、`campaign`（勢力主導的清剿／攻堅）、`diplomacy`、`dig`（古代機挖掘／爭奪）、`tide`、`rumor` |
| `kind` | 可選 | `戰役`／`外交`／`挖掘`／`災難`／`政治`／`科技`／`其他` |

### places/<name>.json

| 欄 | 必填 | 說明 |
|---|---|---|
| `id`、`name` | ✓ | |
| `region` | ✓ | 地球某處／月面／軌道 的文字描述 |
| `summary`、`body` | ✓ | |
| `factions` | ✓ | 在此有存在感的 `faction/…` |
| `gameRefs`、`tags` | ✓ | |
| `body_` | — | （無；`body` 即長文） |
| `world` | 可選 | `earth`／`moon`／`orbit` |
| `kind` | 可選 | `城邦`／`野地`／`蝕域`／`遺跡`／`港`／`月面`／`軌道`／`船`／`其他` |
| `status2108` | 可選 | 2108 開場狀態一句（守住／失守／蝕線上／封鎖中…） |

### eras/<name>.json

`{ "id": "era/<name>", "name", "from", "to", "summary", "body" }`，全部必填；`to` 可為 `現在`。

### timeline.json

```json
{ "contract": "lore-timeline/1",
  "entries": [ { "date": "2089-03-14", "title": "第一次潮", "summary": "…",
                 "event": "event/first-tide", "era": "era/first-tide",
                 "factions": ["faction/…"], "tags": ["tide"] } ] }
```

`event` 可選（有對應事件檔才填）；`era` 必填；依 `date` 升冪（同日保持寫入順序）。開場（2108）之後的條目一律帶 tag `rumor`。

## 擴充規則

需要新欄位只能**新增可選欄**並在上表登記；不改既有欄的意義。`check.ts` 對未登記的欄位只警告不報錯。

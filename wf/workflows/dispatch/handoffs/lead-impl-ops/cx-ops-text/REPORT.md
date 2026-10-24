# cx-ops-text：27 動詞、純資料 Screen 與敘事內容完成，固定 12 測試通過

## 做了什麼

完成一行文字到 OpsCommand 的純解析、反向格式化、房間條件片語、事件模板與 Screen。指令不執行、不改 state。公開入口為 `src/ops/text/index.ts`。27 動詞有中文與 ASCII 別名；另支援修／研／植／育與買／賣的同動詞便捷寫法，不新增 OpsCommand 動詞。名稱先精確比對，再做唯一前綴比對；多義回傳候選 id。

房間維持原本固定句與出口，追加敘事及狀態片語；新增採菌後開放的菌室。補充模板覆蓋 foundation 全部 36 個 EVENT_TYPES，包含 info／warn／money／blood／soul。既有 default 模板未改，由新 narrative 模板依同 pack id 排序覆蓋。新增陳小海對白、葬禮與信貸來電兩段鏈；總計 7 房、2 人對白、4 條事件。

固定五條驗收證據：

1. 專案根執行 `node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`：39 tests、39 pass、0 fail；本線恰好 12 個 test()，分配 parse 5／format 1／templates 2／rooms 2／render 2。`npm run typecheck` exit 0；`npm run check` exit 0、0 errors、0 warnings。沙箱外 npm test 留給領導依契約重跑。
2. `node src/ops/content/check.ts content/base`：exit 0、0 errors、0 warnings，無 template 覆蓋 warning。
3. 指定 `grep -rln 'document\.\|window\.\|src/rules\|src/ai' src/ops/text` 無命中。本線未修改 state／content 模組；也未改其他工人領地。
4. parse、render、formatCommand 均由 index.ts 匯出。
5. 本 REPORT 有四段、匯出函式、types.ts 欄位、SPEC-GAP 三個附表與工具段。

未 commit、未安裝套件、未使用子代理或網路。每步完成均已執行 inbox_poll；上線 PROGRESS 已投遞。依使用者固定驗收要求，沒有另加驗收項目。

## 產出（檔清單）

本線 13 個程式／測試檔、12 個內容檔、REPORT，共 26 檔，低於 45 檔 gate；內容量低於 200 KB，最終 diff 計數由領導負責。

### 程式與測試（全部新增）

- [verbs.ts](../../../../../../src/ops/text/verbs.ts)
- [parse.ts](../../../../../../src/ops/text/parse.ts)
- [format.ts](../../../../../../src/ops/text/format.ts)
- [templates.ts](../../../../../../src/ops/text/templates.ts)
- [rooms.ts](../../../../../../src/ops/text/rooms.ts)
- [render.ts](../../../../../../src/ops/text/render.ts)
- [index.ts](../../../../../../src/ops/text/index.ts)
- [fixtures.ts](../../../../../../src/ops/text/fixtures.ts)（僅測試使用，不由公開入口匯出）
- [parse.test.ts](../../../../../../src/ops/text/parse.test.ts)
- [format.test.ts](../../../../../../src/ops/text/format.test.ts)
- [templates.test.ts](../../../../../../src/ops/text/templates.test.ts)
- [rooms.test.ts](../../../../../../src/ops/text/rooms.test.ts)
- [render.test.ts](../../../../../../src/ops/text/render.test.ts)

### 既有內容補欄／追加（7 檔）

以下六房都保留既有 base／phrases，追加固定句與條件片語；stable 額外追加 mycelium 出口。ren-kasai 只補 name，原對白未改。

- [rooms/bridge.json](../../../../../../content/base/world/rooms/bridge.json)
- [rooms/hangar.json](../../../../../../content/base/world/rooms/hangar.json)
- [rooms/stable.json](../../../../../../content/base/world/rooms/stable.json)
- [rooms/medbay.json](../../../../../../content/base/world/rooms/medbay.json)
- [rooms/galley.json](../../../../../../content/base/world/rooms/galley.json)
- [rooms/cargo.json](../../../../../../content/base/world/rooms/cargo.json)
- [dialogues/ren-kasai.json](../../../../../../content/base/world/dialogues/ren-kasai.json)

### 新增內容（5 檔）

- [rooms/mycelium.json](../../../../../../content/base/world/rooms/mycelium.json)
- [templates/narrative.json](../../../../../../content/base/world/templates/narrative.json)
- [dialogues/chen-xiaohai.json](../../../../../../content/base/world/dialogues/chen-xiaohai.json)
- [events/funeral.json](../../../../../../content/base/world/events/funeral.json)
- [events/credit-call.json](../../../../../../content/base/world/events/credit-call.json)

報告：[REPORT.md](REPORT.md)。

## 沒做到或證據不足的

沙箱外 npm test 與最終檔數／diff 驗收由領導重跑；本線只跑交接書指定的沙箱指令。未代做指令執行與 DOM。text 不把 pendingBattle 的 Sortie 偽裝為 ScenarioDef；實際 handoff 需階段 3 產生戰場後提供。

parse 無 core ContentDB，人物名稱來源為區域 text.names、roster.names、dialogue.name，缺名稱時回退 def 尾段；同模板多個人物會回候選，不猜實例。招募候選與未載入的物品只接受明確 id，由執行端驗存在及可用性。JSON 編成與工作的遊戲合法性仍由執行端驗證。accompany 的 node 是機魂節點 id，按原文字保留，不誤當世界節點。

目前 actions 提供所在房出口、在場人物、相關查看、可餵獸、等待與系統捷徑；待選時只提供合法選項及查看／存檔／說明。未產生需要執行端能力判斷的航行、接約、採購等快捷鍵。固定測試涵蓋正常畫面與 pendingChoices 的往返一致性。

## 需要決定的事

無需使用者決定。領導整合階段 3 時，需將 go 的房間位置寫入下列區域擴充，或統一後同步調整 text。code map／共用 types 的整理由領導處理，本線依範圍不改。

## 匯出函式清單

以下為公開入口匯出；`TextState` 是 CampaignState 的可選欄位擴充。

```ts
parse(line: string, state: CampaignState, world: WorldDB): OpsCommand | ParseError
formatCommand(cmd: OpsCommand, state: CampaignState, world: WorldDB): string
render(state: CampaignState, events: CampaignEvent[], world: WorldDB, db: ContentDB): Screen
findVerb(word: string): Verb | undefined
entityName(id: string, state: TextState, world: WorldDB): string
interpolate(template: string, values: Record<string, unknown>): string
templateEntries(world: WorldDB): TemplatesDef["entries"]
eventLog(event: CampaignEvent, state: CampaignState, world: WorldDB): Screen["log"][number]
roomDefinition(id: string, world: WorldDB): TextRoomDef | undefined
roomAvailable(id: string, state: CampaignState, world: WorldDB, db: ContentDB): boolean
describeRoom(id: string, state: CampaignState, world: WorldDB, db: ContentDB): Screen["room"]
currentRoom(state: TextState): string
```

測試輔助匯出 `fixture()`，回傳 `{ db, world, state: TextState }`；不從 index 匯出。另有資料常數 VERBS／LEGAL_VERBS、測試 examples，以及 Verb／ParseError／TextState／TextRoomDef 型別。

## 想加進 types.ts 的欄位

- `CampaignState.text?: { room?: RoomId; names?: Record<Id, string> }`：房間位置與 parse 可用的名稱索引；缺房間時預設 bridge。
- `RoomDef.requires?: Cond`：目的房間的開放條件，統一篩選所有通往該房的出口。
- `DialogueDef.name?: string`：無 core DB 的解析器可查的說話者顯示名。

以上只在本模組區域型別／讀取處處理，沒有修改 foundation types.ts。

## SPEC-GAP 清單

- CampaignState 缺所在房間與 parse 名稱索引，採可選 TextState.text，未提供時艦橋為起點。
- RoomDef 缺開放條件，採 TextRoomDef.requires；菌室使用 mycelium-harvested flag 或已存在 myceliumRoom 所給的 tag，仍由 foundation evalOpsCond 判斷。
- parse 簽名無 core DB／招募候選表，補 dialogue.name 作人物名稱來源，物品與招募候選的明確 id 留給執行端判定。
- 原文未完整定義 queue／sortie 複合文法，採 JSON 物件並支援簡單工作文字語法；format 保留完整複合資料。
- 模板同事件重複的優先序未定，採後載 pack 優先、同 pack 按模板 id 字典序覆蓋；讓新增 narrative 能補足既有 default 佔位句而不改舊值。
- pendingBattle 尚無 ScenarioDef，render 不產出 handoff，由階段 3 負責。此項超出本線交接書實作範圍。

## 以後交接書該點名的工具

無。

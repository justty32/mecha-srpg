# text-ui-contract — 指令列與選單的最小集合、房間、對話與事件、輸出契約

[ops README](README.md)｜世界觀來源 [world/operations](../world/operations.md)、樣例 [world/opening](../world/opening.md)｜模組邊界 [architecture-ops](architecture-ops.md)

裁示：沙盒遊戲，玩家可以開著飛船去自己想去的地方（航行是玩家指令）；純文字網頁、偏 MUD、無美術；兩層並存——指令列為主、每個畫面給可點選單當捷徑；對話選項式、事件兩三個選擇、房間描述隨狀態變；不做多人與即時聊天（world 暫定裁示）。

## 原則

text 層是 `ops` 的 **adapter**，與 DOM 無關：輸入是一行字串或一個選單點擊，輸出是 `OpsCommand`（型別化指令）；渲染輸入是 `CampaignState`＋`CampaignEvent[]`，輸出是 `Screen`（純資料）。DOM 層只把 `Screen` 畫出來、把點擊與鍵入回傳。同一個 `OpsCommand` 不論來自指令列或選單，結果**必須相同**（測試斷言）。

## 最小動詞集合（v1 共 27 個）

```ts
type OpsCommand =
  | { v: "look"; target?: Id | RoomId }          // 看 [房間|人|機甲|契約|節點]
  | { v: "talk"; who: Id; topic?: string }       // 談 阿九 [達卡]       → 選項式對話
  | { v: "go"; room: RoomId }                    // 走 機庫
  | { v: "map" } | { v: "sail"; to: Id; via?: Id[] }   // 圖 / 航 達卡 [經 吉大港] → 多日移動，任意節點，途中可改道
  | { v: "dock" } | { v: "drift" }              // 泊（停靠進城，開放服務房間）/ 懸（停在節點上空不進城，可當戰場上空）
  | { v: "wait"; days: number }                  // 等 3
  | { v: "board"; contract?: Id }                // 板 [契約]              → 契約板／詳情
  | { v: "accept"; contract: Id; ask?: Ask }     // 接 契約 達卡北郊 [加價|預付|按頭]
  | { v: "drop"; contract: Id }                  // 棄 契約
  | { v: "sortie"; sortie: Partial<Sortie> }     // 出戰 [編成…]           → 編成畫面，確認後進戰鬥
  | { v: "assign"; person: Id; seat?: { mech: Id; seat: SeatId }; role?: string }   // 派 阿九 犬一
  | { v: "queue"; job: Partial<Job> } | { v: "reorder"; job: Id; priority: number }  // 修 犁一 左腿 / 研 散熱二 / 植 … / 育 …
  | { v: "feed"; pen: Id; amount: number }       // 餵 犬三 2
  | { v: "accompany"; soul: Id; by: Id; node?: Id }   // 陪 阿鏽 [阿九] [節點]
  | { v: "trade"; market: Id; buy?: Id[]; sell?: Id[] }   // 買 / 賣
  | { v: "hire"; candidate: Id } | { v: "fire"; person: Id }  // 招 / 解
  | { v: "explore"; ruin: Id; party: Id[] }      // 探 遺跡 [人…]
  | { v: "wake"; shell: Id; by: Id }             // 喚 殼 阿九             → 大潮之夜限定
  | { v: "choose"; choice: number }              // 選 2                   → 事件／對話選項
  | { v: "pay"; account: "debt" | Id; amount: number }   // 付 債 500
  | { v: "save" } | { v: "load"; slot: number } | { v: "help"; v2?: string };
```

中文動詞與 ASCII 別名各一（`看／look`、`談／talk`…），參數可用名字或 id，名字模糊比對（前綴、唯一才接受，否則回「你是指：…」清單）。解析器是純函式 `parse(line, state) → OpsCommand | ParseError`，錯誤訊息要列出合法動詞。選單只是把當前 `Screen.actions` 的 `OpsCommand` 擺成按鈕。

## 房間 Room 與描述

船上固定房間：`bridge`（艦橋：契約終端、世界圖、帳本、存檔）、`hangar`（機庫：機甲、部件、佇列、魂核架）、`stable`（獸欄：pens、餵、同調）、`medbay`、`galley`（酒艙：人物閒談、事件、陪伴）、`cargo`；條件房間：`mycelium`（採過菌才出現）。城邦與遺跡在到達後也是房間（`market`、`tavern`、`registry`、`ruin:<n>`）。描述由 `rooms/<id>.json` 的模板組：固定句＋**狀態片語表**（`{ when: Cond; text: string }`，例：獸欄無獸→「欄是空的，鐵鍊掛著。」；有 `hunger>50`→「犬三在抓欄門。」）。模板用 `Cond` 與 `NumExpr` 查 `CampaignState`，不寫程式分支。

## 對話與事件

對話 `talk`：人物 `persons/<id>.json` 不帶對白；對白在 `dialogues/<person>.json`：`{ topic, when: Cond, lines: string[], choices?: { text; effects: OpsEffect[] }[] }`。無選項的對白只有文字與副作用（mood、trust、lore flag）。機魂的 `talk` 多一個預設 topic `陪`（等同 `accompany`）。事件 `events/*.json`：`{ id; where: "node" | "route" | "ship" | "ruin"; when: Cond; weight: NumExpr; text; choices: { text; requires?: Cond; effects: OpsEffect[]; next?: Id }[] }`，兩到三個選項，`next` 串鏈（遺跡探勘、催收都是鏈）。待選時 tick 暫停（[time-and-tick](time-and-tick.md)）。

## 輸出契約 Screen

```ts
type Screen = { room: { id: RoomId; title: string; desc: string[]; exits: RoomId[] };
  log: { day: number; text: string; kind: "info" | "warn" | "money" | "blood" | "soul" }[];   // 由 CampaignEvent 經模板翻成文字
  panels: Record<string, Row[]>;                  // 側欄資料：帳本四行、名冊、裂縫表、佇列——純資料，DOM 決定擺哪
  actions: { label: string; cmd: OpsCommand }[];  // 當前合法捷徑（選單）
  prompt?: { text: string; choices: { n: number; text: string; disabled?: string }[] };   // 事件／對話／確認／命名
  handoff?: { battle: ScenarioDef } };            // 只在 sortie 確認後出現一次（見「戰場的入口」）
```

`log` 文字由 `text/templates/*.json` 翻 `CampaignEvent`（payload 只有 id 與數字，與 core 日誌同原則）；多語只換模板。「警告：超過意志上限」類確認走 `prompt`，答 `choose`。

## 戰場的入口

`sortie` 確認後 text 層回傳 `Screen.handoff = { battle: ScenarioDef }`，DOM 切到 core 的 `ViewModel`（方格戰場）；戰鬥結束 DOM 把 `BattleResult` 交回 `ops.applyBattleResult`，再回營運 `Screen`。兩層 ViewModel 不互相認識。

## 替使用者做掉的決定

1. **27 個動詞封頂**（23 個遊戲動詞＋選／存／讀／助 4 個系統動詞）：MUD 的手感來自少量動詞配很多名詞；新玩法（如喚醒後的命名）先問能不能落在既有動詞上——命名就走 `prompt`＋`choose`，不加動詞。
2. **選單＝合法指令的按鈕化**：不另寫一套選單邏輯，指令列與選單的結果恆等。
3. **房間描述用狀態片語表**：讓「描述隨狀態變」是資料，寫手不需要碰程式。
4. **對白與人物分檔**：人物資料被戰鬥引擎讀，對白只有營運層讀，分開省載入也省衝突。
5. **log 分五種 kind**：錢、血、魂三種是本作的三條情感線，DOM 可用顏色區分，不需圖。

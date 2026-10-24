# text-ui-contract — OpsCommand 語意層與呈現契約：動詞集合、房間、對話與事件、`Screen`、快捷鍵

[ops README](README.md)｜世界觀來源 [world/operations](../world/operations.md)、樣例 [world/opening](../world/opening.md)｜模組邊界 [architecture-ops](architecture-ops.md)｜戰場側契約 [core/architecture](../core/architecture.md)

裁示：沙盒遊戲，玩家可以開著飛船去自己想去的地方；無美術。**UI 走一般網頁遊戲標準（2026-10-24）**：按鈕、列表、面板、選單、tooltip；主要操作配**快捷鍵**（鍵位資料驅動、可改綁、按鈕與 tooltip 顯示鍵）；**不做文字指令列**。對話選項式、事件兩三個選擇、房間描述隨狀態變；不做多人與即時聊天。

## 原則

`ops/text` 是 `ops` 的 **adapter**（指令的語意層，不是文字介面），與 DOM 無關：輸入是一個 `OpsCommand`，輸出是狀態變化；渲染輸入是 `CampaignState`＋`CampaignEvent[]`，輸出是 `Screen`（純資料）。DOM 層只把 `Screen` 畫成面板／列表／按鈕、把點擊與按鍵翻成 `Screen.actions[].cmd` 回傳。`OpsCommand` 另有**文字形式**（`formatCommand`／`parse` 往返一致）給測試、重播與除錯用，**不是玩家輸入**；按鈕、快捷鍵、文字三路結果**必須相同**（測試斷言）。

## 最小動詞集合（v1 共 27 個）

動詞是指令的**語意詞彙**（按鈕分組與快捷鍵掛在動詞上）：

```ts
type OpsCommand =
  | { v: "look"; target?: Id | RoomId }          // 看 [目標]
  | { v: "talk"; who: Id; topic?: string }       // 談 阿九 [達卡] → 選項式對話
  | { v: "go"; room: RoomId }                    // 走 機庫
  | { v: "map" } | { v: "sail"; to: Id /*place*/ | Cell | { actor: Id }; via?: (Id | Cell)[] }   // 圖 / 航 達卡｜航 120,44｜航 @鹽鷗（追擊）[經 新加坡]
  | { v: "dock" } | { v: "drift" }              // 泊（進地點）/ 懸（野外懸停、迴避）
  | { v: "wait"; days: number }                  // 等 3
  | { v: "board"; contract?: Id }                // 板 [契約] → 契約板／詳情
  | { v: "accept"; contract: Id; ask?: Ask }     // 接 契約 [加價|預付|按頭]
  | { v: "drop"; contract: Id }                  // 棄 契約
  | { v: "sortie"; sortie: Partial<Sortie> }     // 出戰 → 編成畫面
  | { v: "assign"; person: Id; seat?: { mech: Id; seat: SeatId }; role?: string }   // 派 阿九 犬一
  | { v: "queue"; job: Partial<Job> } | { v: "reorder"; job: Id; priority: number }  // 修／研／植／育／壓／裝屍
  | { v: "devour"; beast: Id; amount: number }   // 投 犬三 2 → 蟲族／獸族吞屍（族別例外，不是餵養）
  | { v: "accompany"; soul: Id; by: Id; node?: Id }   // 陪 阿鏽 [阿九] [天賦節點]
  | { v: "trade"; market: Id; buy?: Id[]; sell?: Id[] }   // 買 / 賣
  | { v: "hire"; candidate: Id } | { v: "fire"; person: Id }  // 招 / 解
  | { v: "explore"; ruin: Id; party: Id[] }      // 探 遺跡 [人…]
  | { v: "wake"; shell: Id; by: Id }             // 喚 古代機 阿九 → 大潮之夜限定
  | { v: "choose"; choice: number }              // 選 2 → 事件／對話／遭遇選項
  | { v: "pay"; account: "debt" | Id; amount: number }   // 付 債 500
  | { v: "save" } | { v: "load"; slot: number } | { v: "help"; v2?: string };
```

文字形式：中文動詞與 ASCII 別名各一（`看／look`、`投／devour`…），參數可用名字或 id、前綴唯一才接受；`sail.to` 三型（地點／`x,y` 格／`@行動者`）`parse` 往返一致。第一版的 `feed` 已由 `devour` 取代；方格大地圖**不加動詞**（追擊＝`sail` 到行動者、迴避＝`drift`、交涉＝遭遇 `prompt`＋`choose`），總數不變。

## 快捷鍵 Keymap

鍵位只在資料檔 `keymap-ops.json`（與戰場側 `keymap.json` 同文法：`{ action, keys[], label, context }`，`action` 是動詞或 `動詞:參數`），使用者可改綁；`Screen.actions[].key` 由 keymap 填。預設：房間切換一組、當前房間主要動詞一組、`prompt` 選項 `1..9`、`Esc` 取消、大地圖 context `map` 一組（[world-grid/ui-contract](world-grid/ui-contract.md)）；同 context 同鍵即載入錯誤。

**呈現側**（房間 Room 與狀態片語、對話與事件、輸出契約 `Screen`、戰場的入口 `handoff`）→ [text-ui-contract/presentation](text-ui-contract/presentation.md)

## 替使用者做掉的決定

1. **27 個動詞封頂，動詞是語意不是輸入**：按鈕分組、快捷鍵、測試都掛同一套動詞；新玩法先落在既有動詞（命名走 `prompt`＋`choose`、拘束維護走 `queue`、追擊走 `sail`）。
2. **按鈕＝合法指令的呈現**：按鈕、快捷鍵、文字形式三路結果恆等。
3. **文字形式降為工具**：`parse`／`formatCommand` 給測試與除錯，玩家不必打字。
4. **房間描述用狀態片語表**：「描述隨狀態變」是資料，寫手不碰程式。
5. **對白與人物分檔**：人物資料戰鬥引擎也讀，對白只有營運層讀。
6. **log 分五種 kind**：錢、血、魂是三條情感線，DOM 用顏色區分。

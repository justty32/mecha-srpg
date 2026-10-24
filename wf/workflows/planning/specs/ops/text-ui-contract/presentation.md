# text-ui-contract／presentation — 房間與描述、對話與事件、輸出契約 Screen、戰場的入口

[text-ui-contract 入口](../text-ui-contract.md)｜[ops README](../README.md)｜大地圖畫面 [world-grid/ui-contract](../world-grid/ui-contract.md)｜戰場側契約 [core/architecture](../../core/architecture.md)

## 房間 Room 與描述

船上固定房間：`bridge`（艦橋：契約終端、**大地圖面板** `Screen.panels.map`（[world-grid/ui-contract](../world-grid/ui-contract.md)）、帳本、存檔）、`hangar`（機庫：機甲、部件、佇列、魂核架）、`restraint`（拘束艙：活捕獸、整屍、磨損表、族別維持）、`medbay`、`galley`（酒艙：人物閒談、事件、陪伴）、`cargo`；條件房間：`mycelium`（採過菌才出現）。城邦與遺跡在到達後也是房間（`market`、`tavern`、`registry`、`ruin:<n>`）。房間在畫面上是一個面板：標題、描述、該房的列表與按鈕組。描述由 `rooms/<id>.json` 的模板組：固定句＋**狀態片語表**（`{ when: Cond; text: string }`，例：無獸→「拘束架是空的。」；`wear ≥ 50`→「犬三在撞拘束架。」），`Cond` 查 `CampaignState`，不寫程式分支。

## 對話與事件

對話 `talk`：人物 `persons/<id>.json` 不帶對白；對白在 `dialogues/<person>.json`：`{ topic, when: Cond, lines: string[], choices?: { text; effects: OpsEffect[] }[] }`。機魂的 `talk` 多一個預設 topic `陪`（等同 `accompany`）。事件 `events/*.json`：`{ id; where: "place" | "field" | "lane" | "ship" | "ruin"; when: Cond; weight: NumExpr; text; choices: { text; requires?: Cond; effects: OpsEffect[]; next?: Id }[] }`（`field`＝野外格，按地形與蝕深抽），兩到三個選項，`next` 串鏈（探勘、催收、掙脫都是鏈）。遭遇四選也走 `prompt`。待選時 tick 暫停（[time-and-tick](../time-and-tick.md)）。

## 輸出契約 Screen

```ts
type Screen = { room: { id: RoomId; title: string; desc: string[]; exits: RoomId[] };
  log: { day: number; text: string; kind: "info" | "warn" | "money" | "blood" | "soul" }[];   // 由 CampaignEvent 經模板翻成文字，畫成記錄列表
  panels: Record<string, Row[]> & { map?: WorldViewModelState };   // 側欄列表：帳本四行、名冊、裂縫表、佇列、磨損表；`map` 是大地圖面板的純資料
  actions: { id: string; label: string; cmd: OpsCommand; group: string; key?: string; tooltip?: string; disabled?: string }[];   // 按鈕：分組、鍵、提示、不可用原因
  prompt?: { text: string; choices: { n: number; text: string; disabled?: string }[] };   // 事件／對話／確認／命名（選項鍵 1..9）
  handoff?: { battle: ScenarioDef } };            // 只在 sortie 確認後出現一次（見「戰場的入口」）
```

`log` 文字由 `text/templates/*.json` 翻 `CampaignEvent`（payload 只有 id 與數字）。「警告：超過意志上限」類確認走 `prompt`，答 `choose`。`actions` 列當前合法指令；該讓玩家知道的不合法指令也列、填 `disabled` 原因。

## 戰場的入口

`sortie` 確認（或遭遇選「開打」）後 text 層回傳 `Screen.handoff = { battle: ScenarioDef }`，DOM 切到 core 的 `ViewModel`（方格戰場）；戰鬥結束 DOM 把 `BattleResult` 交回 `ops.applyBattleResult`，再回營運 `Screen`（大地圖同一格）。兩層 ViewModel 不互相認識，共用 keymap 載入器與 `GridView` 方格渲染。

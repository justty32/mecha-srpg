# data-model-factions-contracts／contracts — 契約模板與生命週期、敵軍快照、清剿打什麼、談判

[data-model-factions-contracts 入口](../data-model-factions-contracts.md)｜[ops README](../README.md)｜情境展開 [battle-interface](../battle-interface.md)｜參戰型 [mercenary-contracts](../mercenary-contracts.md)

## 契約 ContractTemplate 與 ContractState

```ts
type ContractTemplate = { id: Id; kind: "clear" | "seal" | "reclaim" | "escort" | "scout" | "rival" | "survey" | "defend" | "smuggle" | "join";   // join＝參戰型，見 mercenary-contracts
  issuerKinds: string[]; requiresRep: number; gradeRange: Grade[];
  objectives: ObjectiveTemplate[];                          // 展開成情境 Objective（battle-interface）
  pay: { base: NumExpr; perHead?: NumExpr; bonus?: { cond: Cond; amount: NumExpr }[] };
  advanceMax: number /*0..1*/; deadlineDays: NumExpr; supplies?: Id[] /*附帶：空援券、拘束彈*/;
  onComplete: Id[] /*OpsEffect*/; onFail: Id[]; onCancel: Id[]; stages?: StageTemplate[] /*多段*/ };
type EnemySnapshot = { family: Id; width: Grade; depth: "shallow" | "deep" | "core"; anchorAge: number; phase: RiftState["phase"]; monsters?: Id[] };   // offered 當天凍結
type ContractState = { id: Id; template: Id; issuer: Id; target: { place: Id /*原 node*/; loc?: Loc /*野外目標格*/; rift?: Id; actor?: Id /*護送的商隊、參戰的分遣隊*/; snapshot?: EnemySnapshot };
  status: "offered" | "active" | "stage" | "done" | "failed" | "cancelled" | "expired";
  terms: { total: number; advance: number; perHead: number }; paidAdvance: boolean; heads: Record<Id, number>;
  offeredDay: number; deadlineDay: number; stageIdx: number; annoyance: number /*談判累積厭煩*/ };
```

生命週期：`offered`（契約板，到期清除）→ 接受 → `active`（多份並行無上限，但每份都有 `deadlineDay`，重疊時間是玩家的問題）→ 多段者走 `stage` → 結算 `done`／`failed`／`cancelled`。取消：扣該勢力 rep、追回已付預付款（追不回則記入債）、跑 `onCancel`（一次性，存檔有旗標防重跑）。**敵軍編成在 `offered` 時就由目標裂縫的 `RiftState`（族、寬度、深度、錨齡、`phase`）定死**，寫進 `target.snapshot`；玩家變強不改它，裂縫自己變了也不改（拖到錨坐下才去，仍照 `opening` 快照抽先鋒，但報酬半額、且關不掉已 `anchored` 的裂縫）。防守／收復類允許部分成功（守住但設施損失→半額）。

**清剿打什麼**（2026-10-24 補）：`clear` 的目標由快照 `phase` 決定——`opening`：殲滅先鋒（`eliminate{tags:["kaiju"]}`），勝即 `closed`；`anchored` 以上：情境在**核格**生成、`eliminate` 加 `killTarget: anchor`（巢母／崖牙本尊必死才算完成，子體不計頭），勝→ `unanchored`；若雇主只要「退一塊」，模板用 `reclaim`（情境在蝕塊邊緣格、目標 `hold` N 輪，勝→ `burned`／退塊）。三種都是契約模板欄位，程式不分支。

## 談判 Negotiation

接約前可選：加總額、加預付、改按頭（`perHead`）。每次要求 `annoyance += 1`，擲 `d100 < issuer.rep − annoyance × k` 成功則改條件，失敗則 `annoyance` 再加；超過模板 `annoyanceMax` 雇主收回契約並扣 rep。預付上限 `advanceMax`。談判是純函式 `(state, ask, rng) → (state', result)`，供 text 層與 AI 測試呼叫。

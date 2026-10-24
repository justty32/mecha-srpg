# tide-sky／omen-effects — 「天象 → 效果」通用結構：OmenDef、八類效果、對象、期間、預告；引擎對照

[tide-sky 入口](../tide-sky.md)｜條目範本 [omens.json](omens.json)｜效果詞彙 [core/data-model-abilities-effects](../../specs/core/data-model-abilities-effects.md)｜營運效果 `OpsEffect`（`src/ops/state/types.ts`）｜生效表 `handoffs/codex-effects.json`

使用者：「不一定是強化，也可能是事件，或狀態影響，或一些特性啥的。」所以一條天象＝一個**時間窗**＋一串**效果**，效果種類是封閉集合（同 `HookAction` 的精神：程式提供動詞，內容只組合）。內容線量產時只填 json，不碰程式。

## OmenDef（內容檔 `world/omens/<id>.json`，kind `omen`）

```jsonc
{ "id": "omen/mars-at-heart", "name": "熒惑守心", "nameEn": "Mars Stationary at the Heart", "layer": "sky",   // moon | distance | eclipse | sky | season | scripted
  "cycle": { "periodMonths": 27, "offsetDays": -14, "durationDays": 28 },     // 相位自蝕曆元年；排定型改寫 "at": [{ "month": 40, "dom": 1 }]
  "tideDelta": 0,                                                              // 潮級修正；"setTide": 1 表枯潮這類覆寫
  "forecast": { "league": 0, "selene": 84, "creed": 364, "starchart": false,  // 各來源提前幾日看得見；0＝看不見
                "notice": "赤星守心，獸不聽鞍。", "omenText": "熒惑停在心宿上，三夜不動。" },
  "effects": [ /* OmenEffect[] */ ],
  "tags": ["beast", "omen"] }
```

## OmenEffect 八類（`kind`）、對象、期間

```ts
type OmenTarget = { side?: "kaiju" | "human" | "player" | "all"; family?: Id[]; mechClass?: ("ancient" | "derived" | "bio" | "soul")[];
  faction?: Id[]; grade?: Grade[]; tags?: string[]; map?: Id[] };                       // 全省＝全部
type OmenEffect =
  | { kind: "tide"; delta?: NumExpr; set?: NumExpr }                                      // 潮級
  | { kind: "spawn"; target: OmenTarget; gradeCapDelta?: NumExpr; countMul?: NumExpr; named?: { monster: Id; minWidth: Grade }[]; captureMul?: NumExpr }
  | { kind: "blight"; target: OmenTarget; spreadDelta?: NumExpr; spreadMul?: NumExpr; recedeDelta?: NumExpr; newRiftMul?: NumExpr }
  | { kind: "unitEffect"; target: OmenTarget; effect: EffectRef; battleGlobals?: { tide?: NumExpr; light?: number } }   // 每場戰鬥開場掛到符合的單位；clock 用 rounds/permanent
  | { kind: "ops"; when: "start" | "end" | "eachSpring" | "daily"; effects: OpsEffect[] } // 既有白名單：flag、rep、ledger、mood、techHours、spawnEvent、spawnContract、setRift
  | { kind: "event"; table?: Id; weightMul?: Record<Id, NumExpr>; inject?: Id[]; topics?: { person: Id; topic: string }[] }
  | { kind: "rule"; toggle: RuleToggle; value?: NumExpr }                                 // 封閉集合，見下
  | { kind: "faction"; target: OmenTarget; aggressionMul?: NumExpr; contractPayMul?: NumExpr; actions?: Id[]; truce?: boolean };
type RuleToggle = "anchorInstant" | "awakenBonus" | "stirDormant" | "sealFast" | "tetherFlicker" | "restraintCalm" | "restraintRestless"
  | "moltOpen" | "broodBoost" | "telegraphDim" | "uplinkNoise" | "ruinReveal" | "ferrySuspended" | "spreadPause";
```

**期間**：效果只在天象窗內生效；窗由 `cycle` 算，不存檔，所以存檔與重播不受影響。**疊加**：潮級修正相加後夾在 0–4，`set` 優先於 `delta`（枯潮壓過迫月）；同類數值效果相乘（倍率）或相加（delta）；`rule` 同名取任一；`unitEffect` 按既有 `EffectDef.stack` 政策。**預告**：`forecast` 各來源的提前量是天數，面板只畫玩家有來源的；`notice` 是蝕訊一句，`omenText` 是百科與事件用的描寫。

## 效果分類 × 引擎現況（對照 codex-effects 與 `src/`）

已抽到 [engine-map.json](engine-map.json)（10 列）。欄位：`類`（八類效果加「曆與旗」「蝕曆面板」）、`內容線現在能不能寫`、`引擎現況`（對照 `codex-effects.json` 的生效表與 `src/ops` 現碼）、`要做什麼`、`規模`（小／中；標「排在 lead-grid 後」的要等第三波 `cx-grid-blight`）。

統計：現有引擎就能接的 2 列（`event` 靠 `when` 的 tag、`ops` 靠 `applyOpsEffect`）；小改 4 列（曆與旗、`tide`、`faction`、潮信行）；中 3 列（`unitEffect`、`spawn`、`blight`）；`rule` 逐開關各一條小改，第一版 6 個。

結論：**旗與曆先落地**，內容線當天就能靠 `when` 寫出「天象事件」；`spawn`／`unitEffect` 是第二步；`blight` 等 lead-grid；`rule` 開關逐個補。

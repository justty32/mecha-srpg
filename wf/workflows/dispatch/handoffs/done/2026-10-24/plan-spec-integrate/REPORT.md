# REPORT — plan-spec-integrate：world-grid 整合、spec 風格改寫、opening 對齊（頂層代存，2026-10-24）

STATUS：**DONE**。commit `40df2b3`（world-grid 整合，25 檔）、`8623f1d`（風格改寫＋opening＋architecture，18 檔），共 43 檔（超 gate 3 檔，皆追加任務所致）。

## 整合
plan-world-grid 整合清單 12 條全做：world-map 整檔重寫（`RiftState.at/site/patches`、`ShipState.pos/path`、渡輪併 `LaneDef`）；`constraints-ops.json` 70 列（新 USR-12 六張圖／迷霧／航道、USR-13 格上自由移動／行動者／遭遇四選）；`content-format-ops.md` 拆成 `content-format-ops/{world,factions-war,crew-text}.md`；`transferNode`→`transferPlace`、`NodeTransferred`→`PlaceTransferred`。bio-balance 四缺口補齊（清剿目標由 `phase` 決定、opening 期殲先鋒即 closed、`ammo` 市場列、`EnemySnapshot.phase` 必填）。`architecture.md` 第 75 行改 `sim/session.ts` BattleSession＋GridView。

## opening／lore 對齊
三台 D 級→三台 C 級（兩台燕鷗攻堅型＋獵犬-II型）；「大潮三天後」→十一天後；setting 加夸父（2089 青藏）／刑天（2103 舊陣列）。lore `places/migrant-bird.json` 仍寫「三天後」「三千公尺」→ 已派對齊小修線。

## 風格改寫
world 9、core 7、world-grid 3 檔（40 km→「一格＝船一天航程的十分之一」）。對照表在 `specs/core/README.md`：`heat`＝燼、`charge`＝流光、`ammo-*`＝矢、`shield`／`armor`＝光幕／殼甲、`sensor`／`perception`＝殼目、`conventional-arms`＝鐵翼／鐵龜、`fuel`＝浮料、`stock:core-*`＝裂晶、`soul`＝機魂。殘留：`core/rules-battle-flow.md:49`、`continents.json`／`terrain-layers.json`「兩百公里」、月弓年份 2041 vs 2043。

## 三提案
(a) 獸緣／殼緣升格 `registries/attrs.json` 非 role 屬性 `beastKin`／`shellKin`（0–100，事件 ±），core 只在 NumExpr 引用；判準：要寫 ≥ 3 處 `if` 就退回 tag。
(b) 債務：每潮月最低償還 `max(利息, 本金/24)`（≈2200）；不足則 `arrears+1`、rep −10；階梯：確認償還意願事件 → 白手套追擊行動者（扣押一機抵六成）→ 塞勒涅拒售、港費 ×2 → 終局鏈；提前還本、還清開信貸額度。判準：greedy 12 潮月×5 seed `arrears ≤ 1` 存活 ≥ 4，否則攤還期 36。
(c) 戰鬥台詞：`barks/<person>.json`（事件型別＋Cond→句子、權重、cooldown），只服務 S 級以上有個性機魂與有 lore 的人物；ui-adapter 文字層挑句、不進 rules／存檔，以事件 `seq` 當 seed。

## 對實作線的影響
lead-impl-war：`transferPlace`、`PlaceTransferred`、`targetSel` 值改 `blight-edge`／`lane`／`enemy-place`、`ForceState.pos` 改 `ActorState` id。world-grid 實作線：`CampaignState` v2（`places`、`maps`、`patches`、`actors`、`pendingEncounter`）、`Sortie.loc`＋`intercept`、`ContractState.target.place`、`setPlace`。lead-ai-objective：清剿 anchored 目標 `eliminate{killTarget: anchor}`。

## 需要裁示（頂層 2026-10-24 代決，使用者可推翻）
(1) world-grid 五條照提案；(2) `targetSel` 值名隨 world-grid 實作改；(3) 提案 a、b、c 都採用，排入實作；(4) 開局三台 C 級。

# battle-field — 地形、地圖、情境、AI 設定的設計原則

[content README](README.md)｜型別 [data-model-world](../planning/specs/core/data-model-world.md)｜戰局 [rules-battle-flow](../planning/specs/core/rules-battle-flow.md)｜既有一覽 `wf/workflows/dispatch/handoffs/lead-content-battle/catalog.json`（73 列）｜試玩問題 `wf/workflows/dispatch/handoffs/lead-playtest/issues.json`

情境是玩家真正碰到內容的地方；第 1 輪試玩 42 條問題裡一半是情境寫法（ISS-001／006／007／008／009／024／026／027）。寫情境先想「AI 對 AI 20 輪會發生什麼」。

## 地形 terrain

- `moveCost` 五鍵齊全（leg／track／hover／flight／burrow），`null`＝不可進；每張圖至少六成格 cost 1，否則 AI 走不到就 timeout。`cover` 0–35（硬上限 50，加到守方）；`height` 0–2（高差加命中 +5／擋移動）；`blocksLos` 只給牆、巢壁。
- 效果地形：`onEnter`（進格一次）、`onTurnStart`（站著每回合）各掛一個效果，傷 3–5／回合或 debuff；菌毯、酸沼、碎鏡地、月面低重力各一族風味。
- 可破壞 `destructible:{hp,becomes}`：牆 40–80 HP 變廢墟；只被 cell／範圍攻擊打到。
- `glyph` 用小寫、標點、數字（**大寫留給單位**，ISS-014）；`color` 任意；名字照族風味（蝕斑、巢壁、礦化荒原、菌毯、潮間、月壤）。四族深蝕地形各至少 2 種已有，新地形先看 23 種裡有沒有同義的。

## 地圖 map

- 尺寸是資料：16×16（決鬥）到 60×60（參戰型）；>80 邊只做參戰型且輪數 30；128×128 那張是上限、MCP 要 `window`。`cells` 長度＝width×height、字元全在 legend、legend 全是既有 terrain。
- `deployZones` 每個 slot 都給，格數 ≥ 該 slot 單位數；**玩家與敵方部署區相距 ≥10 格**（第 1 輪不接敵）、第三方不貼玩家出生（ISS-007）。
- `exits` 預設四邊；撤離／護送情境把出口放在玩家側邊且不被迷霧死角蓋住（MCP 已畫 `>`）。護送出口離車隊起點 ≥ 2/3 圖寬（ISS-010 太近第 2 輪就結束）。
- `globals.tide`（NumExpr 逐回合）／`light`（常數）給 `bf-*` 效果引用，一張圖只放一條曲線。
- 風味：地圖有名字（荒原群王的獵宴、退潮之喉）、有一句地勢描述放 catalog；中央放一個目標地物（補給碑、巢核、殼口）讓雙方有理由靠近。

## 情境 scenario

**單位**：每 slot 2–6 台（玩家 2–4、盟軍 4–6、敵 4–10）；玩家 slot 用開局機（moji-tern-guard、hound-mk2、bulwark-ii）或任務指定機；**每台摹機要有武器**——`UnitSpawn.components` 整組指定或靠 frame `defaultLoadout`（現在多數 frame 沒填，所以情境**先寫 components**）；每台至少一把非凡兵武器打獸。**同一具名人物只能在一台、一個陣營**（ISS-008）；敵方人類機用敵方人物或 `persons` 省略讓機魂／instinct 開。怪獸用 `monster:`、人類用 `mech:`＋persons。

**目標**（按宣告順序第一個完成且非 continue 的決定結果）：
- 永遠寫**玩家落敗條件**：`{"kind":"eliminate","params":{"slots":["player"]},"for":"player","onComplete":"lose"}`（缺了全滅還 timeout 平手，ISS-009）。
- `eliminate` 預設殲滅所有敵對 slot；`killTarget.params.target` 用 **def id**（monster 或 frame），同 def 全死才達成，玩家也有的 frame 不能當目標（ISS-024）；護送用 `escort`＋每台護送對象一條 `killTarget … lose`（frame 一台一種，不重複）。
- `hold.params`（區域格集＋連續輪數）、`survive.params.rounds`、`reachExit`；hold／escort 情境輪數 20、殲滅 30。
- 參戰型（勢力作戰、傭兵加入）：`ally` slot＋`allies:["ally"]` 顯式對稱；盟軍 AI 用 focus-fire／bodyguard；玩家目標與盟軍目標一致（殺錨／守區）。三方以上每方一條 win、玩家一條 lose；`neutral` 在戰場算敵對。
- `rounds` 20–30；`seed` 固定一個方便重現；`rules.conventionalFactor` 不動。

**類型配方**（各至少一個已有，新寫先換單位與地圖再換目標）：決鬥（16 格、2v2、killTarget）、清巢（24–40 格、4v6–10、eliminate）、守區（hold 8 輪）、護送（80×20、convoy slot＋convoy-runner）、撤離（reachExit＋survive）、斬首（killTarget 潮錨＋護衛）、混戰（third slot 用 guerrilla／tide-cultist）、人對人（白手套、競爭獵團）。

**難度目測**：敵方總 HP ÷ 玩家＋盟軍總 HP 在 1.2–2.0 之間（怪獸 HP 曲線陡，所以 C 級場 3 台摹機對 1–2 隻 C 怪）；超過 2.5 要有盟軍或目標不是殲滅。

## AI 設定 aiprofile

`policy` 六種：`tactical`（通用）、`sentinel`（守格、狙擊）、`swarm`（跟母體）、`berserk`（敵我不分）、`flee`（護送車隊、逃）、`scripted`。`params` 鍵無驗證、拼錯靜默用預設——只用既有 16 檔出現過的鍵（attack／protect／buff／disable／debuff／focusBonus／maxEngage／focusDistance／attackRatio／holdRatio／band／dangerK／reposition／retreat／retreatMinRound／retreatDamage／endScore／fleeRetreat／fleeDistance／fleeExitDistance／berserkAttack／berserkDistance／friendlyFirePenalty／maxPureMoves／objHunt）。新 profile 只在參數真的不同時才建；護送車隊用 convoy-runner、狙擊手用 sniper-perch（但 sentinel 原點不開火的 bug 修了才算）。

## 常見錯誤

空手單位；killTarget 用雙方共有 frame；缺玩家 lose；同人多台；部署貼臉；出口太近或在迷霧死角；大寫 glyph；moveCost 缺鍵；三方局只寫一條 win；輪數 50；地圖 legend 用未 commit 地形；slot 的 `faction` 不存在。

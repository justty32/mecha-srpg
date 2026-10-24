# REPORT — lead-gaps-battle：戰鬥側框架缺口、意圖撤退與指揮者（頂層代存，2026-10-24）

STATUS：**DONE**。commit `6d6d450`、`c2ae883`、`b23c936`、`e2e40fd`、`6113adc`（收線）。8 個 codex 工人（gpt-6-astra），交接書、工人 REPORT、sweep 資料在本目錄。驗收（乾淨 worktree）：`npm test` 730/730、check 0 錯 38 警告、typecheck 0、`fuzz --runs 300 --mode mix` 0 硬違規、e2e 12/12、`sim:campaign` OK；黃金 6 個與 ops campaign hash 未變。

## 完成度
| # | 項目 | 結果 |
|---|---|---|
| 1 | 預設配裝 | 34 台摹機中 33 台填 `defaultLoadout`（infantry 無槽）；75 台換回原型號；24 情境補 `name`／`brief` |
| 2 | 等級影響血量 | MonsterDef `partsOverride`／`attrMods`／`extraAbilities`／tags 生效；戰果帶 monster id；7 隻同族多等級怪 HP 調進數值帶 |
| 3 | 新欄位 | `FrameDef.aka`、`ScenarioDef.name／brief`、`PersonDef.soulGrade`（4 舊 tag 遷移）、attrs `beastKin`／`shellKin` |
| 4 | check 強化 | `src/content/lint.ts`：5 錯誤、13 警告（只在 `npm run check`） |
| 5 | `content:probe` | 完成（含結算原因統計、`--no-retreat`） |
| 6 | MCP | `battle_act_many`、`battle_legal_actions unit:"all"`、`battle_step_ai until:"player"`、情境名稱；大地圖首輪呼叫 11→5；`sortie.test.ts` 固定程序 |
| 7 | ISS-023 | instinct 池改 hard（36 檔） |
| 追加 | AI 剩餘 | `tether: dieWithParent`、swarm 篩選前移、追擊最後所見、範圍能力保留 AP、unbound-raid 站位 |
| 追加 | 意圖撤退與指揮者 | 對手撤光判擊退勝（`detail:"repelled"`）；陣營意圖、達不到整隊撤；個體重傷逃跑、駕駛自退；人類指揮者後撤輪替；怪獸指揮者陣亡潰散 |

## 填了會不會生效（戰鬥類）
| 類別／欄位 | 生效？ | 備註 |
|---|---|---|
| frames＋`defaultLoadout` | 會 | check 驗槽；空手警告 |
| frames `aka` | 只顯示 | |
| 情境 `components`／`name`／`brief` | 會／只顯示 | |
| components、abilities、effects | 會 | `passive` 仍無作用（警告） |
| species、bodyplans | 會 | instinct 為 hard |
| monsters `partsOverride` 等 | 情境會；營運出戰不會 | 需 ops 傳 `UnitInit.monster.def` |
| persons `soulGrade` | 只是資料 | |
| attrs `beastKin`／`shellKin` | NumExpr 可引用 | 缺值取 0 |
| aiprofiles `params`（含意圖門檻） | 會 | 只能數字；意圖代碼 0–8 |
| `spawner.tether` | 會 | |
| maps `exits` | 會 | 未寫則四邊可撤 |
| `molt`、`territorial` 散播、台詞、方格大地圖 | 不會 | |

## content:probe
`npm run content:probe -- <id…> [--n 20] [--seed 1] [--jobs J] [--rounds 20] [--no-retreat] [--json FILE|-] [--content DIR] [--bands FILE]`；基準取 `wf/workflows/content/playtest-baselines.json`，數值帶讀 `numeric-bands.json`。勝率含對手撤退；`--no-retreat` 量純火力（C 級 1 對 1 二十輪幾乎打不死，傷害偏低）。

## check 規則
錯誤：`num-packet-ratio`、`num-accuracy`、`num-range`、`num-nonnegative`、`attack-cost`。警告：`inverted-direction`、`monster-person-effect`、`ai-shape`、`soft-overflow-band`、`mechanical-unarmed`、`band-*`、`content-load`（38 警告中 34 條為捕捉後層 HP 不同，太吵）。

## 平手率（24 情境×5 seed）
| 階段 | 平手 | 勝方 |
|---|---|---|
| 開工 | 64.2% | player 42、enemy 1 |
| 配裝＋AI 小修 | 41.7% | player 65、enemy 5 |
| 意圖撤退後 | 2.5% | player 46、enemy 55、ally 8、third 8 |
剩 3 平手皆 nest-core-assault。

## 需要決定（頂層 2026-10-24）
1. anchored 判準未過（期望命中 141 > 40）→ 採用：AI 用 `partAim` 瞄核心＋小幅 `partsOverride` 降核心 HP，派調校線。
2. AI 放棄太早（平均 8 輪；rift-edge-nest 5 勝→5 敗）→ 派調校線調 `src/ai/intent.ts` DEFAULTS（`intentGiveUpRatio 0.55`、`intentMinRound 4`）。
3. 捕捉 HP 警告改每隻怪一條 → 併入調校線。

## 剩餘工作
- 營運：出戰傳 `UnitInit.monster.def`；回寫讀 `detail:"repelled"` 與 monster id → 已轉 lead-gaps-ops。
- spec 缺口（規劃線）：無出口四邊可撤；多方局擊退勝方字典序；意圖代碼 0–8（eliminate／hunt／guardNest／hold／escort／reachExit／killTarget／capture／survive）；指揮者選定（人類 resolve→等級→id；怪獸母體、潮錨或 S 級以上）；潰散依 id 穩定分位、不耗 RNG。
- 意圖兩層設計摘要：陣營意圖取自情境目標 → aiprofile `intent` → 族行為（spawner＝守巢、territorial＝奪點、其他＝獵食）→ 殲滅；每輪評估戰力比、損失、目標進度、需要輪數對剩餘輪數；人類指揮者讓重傷／缺資源／shaken／負面效果單位後撤 2 輪（冷卻 3）；怪獸指揮者只下護巢集結與圍攻；指揮者陣亡潰散比例（怪獸 0.6、人類 0.3）；個體：怪獸 HP <25% 逃、駕駛重傷 20% 或士氣 breaking／fleeing 自退。未做：tag 指定指揮者、補給治療輪替、字串意圖欄。
- `aka` 內容未填；`molt` 未實作。

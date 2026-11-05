# LINK-02／backlog 75–77：取得路徑與聲望條件

[報告入口](fable-report.md)｜[題綱](fable-brief.md)

## 問題

勢力特色部件與 gl 拆件要怎麼「拿得到」：戰利品、研究、市場、聲望四條接線各自要改資料還是引擎。只比較接線，不替使用者決定部件是否比照機甲聲望。

## 已證實（唯讀 HEAD）

**聲望只認機型**：`src/ops/war/rnd.ts:29-39` repGate／repGateBlocked 吃 `ModelDef`（tier、maker）；`src/ops/world/market.ts:34-54` 只套在 model／frame；`cmdTrade` market.ts:179 只擋 `listing.kind === "frame"`。門檻值 `content/base/world/actions/ops-world.json` rules.repGate byTier D10 C20 B35 A55 S80。裁示 `fill-rulings.md:9` 只談國家／勢力機甲；lead-rep 落地在 `src/ops/world/rep-gate.test.ts` 七項。

**部件沒有上架條件欄**：market.ts:55-63 部件只有固定 items，filters 只對 frame（59 行 `continue`）；item 欄只有 def／weight／stockMax／basePrice（`src/ops/state/types.ts:124-126`），沒有 requires／faction。`ComponentDef` 沒有 maker、也沒有 grade 欄：fa／fm 80 件全無 `grade-*` 標籤，fm 只有 tag `fm-supplier`；gm 計畫的「廠商＝korea-umbrella、聲望門檻 C20」只在 `plan-gm/new-items.json`，未進 JSON。現況六市場 29 個部件固定項含 4 件 fm-*（cradle-slit、bellows-bridge、breakwater-greave、rivet-handguard）已無門檻上架，與 75「勢力件只能不上架」不符。

**研究與戰利品都斷線**：`src/ops/crew/research.ts:12` 完成只寫 `flags["unlocked:<id>"]`，唯一讀者是 research.ts:4 researchReady；市場與 `workqueue.ts:66-73` install 都不查。`src/rules/flow.ts:193-194` BattleResult.loot 只來自 `map.salvage`（材料），`components` 永遠 `[]`；`src/ops/sortie/apply.ts:155-178` 只處理獸屍（carcass＋拆／留整屍），人類敵機死亡無分支，敵機裝的部件不會掉。材料 `stock:fl-*` 全庫沒有任何產出（markets 只有 stock:flesh，`world/beasts/` 無材料表），20 份 `research/fl-*-study.json` 的 consumes 永遠付不起。

## 推測（待驗）

- 研究 job 付款在 workqueue.ts:145 按 materials 扣帳，stock 為 0 時應卡住；未跑。

## 接線選項（只改資料 vs 要改引擎）

| 代號 | 做法 | 改哪 | 接哪號 |
|---|---|---|---|
| D1 | 勢力件當固定 item 放進勢力地盤市場 | 只改 `world/markets/*.json` | 放棄 75，今天可做 |
| D2 | 遭遇敵機 `units[].components` 塞勢力件等掉落 | 只改資料 | 無效（loot 固定 []） |
| E1 | MarketDef item 加 `requires?: {rep?:{faction,min}; research?: Id}`，listings 過濾、cmdTrade 回 `reputation-required`／`research-required` | `types.ts`、`market.ts`、`check.ts`、text 名稱；小 | 77 全部＋75、76 的市場半邊 |
| E2 | ComponentDef 加 `maker`（＋grade），按 rules.repGate.byTier 自動門檻 | schema、loader、80 件補欄、market；中 | 75 原建議 |
| E3 | loot 依死亡單位已裝部件掉落＋人類敵機分支＋拆解／採樣 job＋stock 顯示名 | rules flow、apply、workqueue；大 | 76 |
| E3′ | 最小切片：獸屍「拆」按 species 表給 `stock:fl-*` | `world/beasts/*.json` 加表＋apply.ts:159-170 讀表；小 | 76 材料半邊 |

## 推薦

**E1 先行**：一個資料欄同時承接研究前置與聲望，門檻逐列填、不預設「所有勢力件都鎖」，剛好把題綱要求留給使用者的決定變成資料。**E3′ 接著**：gl 20 份研究的材料來源只缺一張表，apply.ts 材料流程已在。**E2 等裁示**：只有使用者說「勢力件比照機甲」才值得補 80 件 maker。D1 只當臨時解；D2 不要做。

## 需使用者裁決

1. 勢力特色部件要不要比照機甲聲望？是 → E1 逐列填或 E2 自動；否 → E1 只填研究前置。
2. 若要門檻，數字：同機型表（C20／B35／A55）或低一階（C10／B20／A35）？可只改 ops-world.json 一處。
3. 已上架的 4 件 fm-* 先下架、補門檻，還是維持？
4. gl 拆件材料：獸屍拆解給 `stock:fl-*`（E3′）還是掉部件實物（E3）？

## 修改路徑與驗證（本輪未跑 node）

E1：`src/ops/state/types.ts` MarketDef、`market.ts` listings／cmdTrade、`src/ops/content/check.ts` 驗 faction／research 存在、`src/ops/text/names.ts` 錯誤文案；測試仿 `rep-gate.test.ts`：未達標不列／拒買原子性、達標可買、研究未完拒買、完成後可買。E3′：beasts 表＋`apply.test.ts` 加「拆屍入帳 stock:fl-*」。黃金：E1 若只加欄不改既有市場，預期不動；E3′ 動戰役黃金（拆屍帳本）。

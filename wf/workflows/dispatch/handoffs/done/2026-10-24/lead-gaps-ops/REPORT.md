# REPORT — lead-gaps-ops：營運側重大問題與框架缺口（頂層代存，2026-10-24）

STATUS：**DONE**。commit `0ef7bcc`（實作、內容、測試，109 檔）、`18a5e88`（7 份工人交接書與 REPORT、模擬證據、code-map／testing ops 列）。收到「修完重大問題就停手」時延後項已完成並驗綠，依「已完成就保留」留下。

## 驗收（乾淨 worktree，HEAD `e32948e`＋本線）
`npm test` 805/805、typecheck 0、check 0 錯（41 警告）、ops content check 0 錯（37 警告）、e2e 12/12、`sim:campaign` idle／greedy／merc ×12／24 潮月 OK（idle 第 6 潮月因債務扣船合法結束；`--continue-after-end` 可跑滿）。ops 黃金 `ff0f5a61ffac4a93`→`b134009c04569305`（事件 295→337：發包牌、債務事件、名稱登記、遭遇抽樣）；五條黃金戰役不變。

## 必做（重大問題）
| 項目 | 結果 |
|---|---|
| ISS-031 船被困 | 節點被蝕化仍可沿出邊離開（困船天數 295→0） |
| ISS-033 opening 無限刷 | 打贏先鋒即關閉裂縫、撤同裂縫舊約 |
| ISS-030 平手與 seal 守區 | 平手契約保留可重打、greedy 同約連平 2 次放棄；seal 守區改我方可達中線格群；anchored 清剿＝killTarget 錨 |
| ISS-032 開局無契約 | 勢力發包 10 種牌，seed 1–5 第 2 天板上 ≥2 份；逐 commit 二分確認無回歸（原因是契約只來自裂縫） |
| ISS-034 不可達契約 | 接約回 `unreachable`、板上標不可接 |
| greedy 派殘機與崩潰乘員 | 修；seed 1／4／5 全年敗 17／11／20 → 0／0／1 |
| 貢獻值源頭求值 | 修 |
| 擊退／撤退回寫 | `sortie/outcome.ts` 分類勝／擊退／撤退／敗／逾時；擊退算達成，清剿報酬係數 0.6＋0.4×擊殺比例；玩家撤退可重打；勢力撤退＝作戰受挫；依 monster id 帶二名 |
| 出戰 MonsterDef 覆寫 | `scenarioToSetup` 已傳，補測試 |
| 名冊重名與 id 外露 | 修；招募不重抽已在名冊的具名人物；士氣效果只套最早實例 |

## 已完成、保留
11 份休眠契約接上發包（`join-faction-front` 改 `kind:"join"`）；人類對手遭遇編成（`EncounterDef.faction`／`units`、契約 `encounter` 欄，6 份生效）；`text/names.ts` 名稱解析九類；市場改 `marketListings()`；log 金額格式化、11 條新文案；錯誤指令附候選（ISS-037）。延後項亦完成：債務（每潮月最低償還 `max(利息, 本金/24)`、欠繳四級：催告 → 扣押一機抵六成 → 拒售＋港費 ×2 → 扣船終局；提前還本；還清開信貸、`borrow`／「借」）、war 不變量與五條黃金、好戰（宿敵基準 −30 採用；奪點權重 ×2 會退化已回退）。

## content/base/world/ 填了會不會生效
| 類別 | 生效？ | 條件／限制 |
|---|---|---|
| `contracts/` | 會 | 需勢力 `contractKinds` 列入且有 `actions/board-*.json`（join 由作戰集結發）；`issuerKinds` 限 state／city／company／guild／band／cult；`encounter:[…]` 可指定；目標 kind 限 eliminate／killTarget／hold／survive／escort |
| `actions/` | 會 | 世界與 war 牌道 |
| `encounters/` 怪獸 | 會 | `family`＋`depth`、`budgetByGrade` |
| `encounters/` 人類 | 會 | `faction`、`units[]`（`frame` 必填、`pilots` 人物 def 池、`components` 可選）；frame 等級需湊滿 `budgetByGrade`；只經契約 `encounter` 欄選中 |
| `encounters/place-*` | 不會 | 方格大地圖未實作 |
| `factions-ops/`、`operations/`、`treaties/`、`forces/`、`affinity.json`、`lineages/`、`models/` | 會 | 機型指既有 core frame |
| `events/` | 會 | 效果白名單；新事件型別需 `templates/` 文案 |
| `templates/` | 會 | 整資料夾載入 |
| `rifts/` | 會 | 無位置欄；異形核層錨無作用 |
| `research/`、`markets/`、`recruit-pools/`、`backgrounds/`、`names/`、`dialogues/`、`rooms/`、`jobs/`、`beasts/`、`services/` | 會 | 債務常數 `services/crew.json`、擊退係數 `services/retreat.json` |
| `nodes/`、`routes/`、`ferry.json`、`ship.json`、`calendar.json`、`campaign-start/`、`keymap-ops.json` | 會 | 仍是節點圖 |
| world-grid `places/`、`maps/`、`lanes/`、`regions/`、`actors/` | 不會 | 載入器無此資料夾 |
| 獸緣／殼緣、`barks/` | 不會 | |

## 模擬數字
債務：greedy 12 潮月 seed 1–5 存活 5/5、最大欠繳 0（期末現金 25.9k／48.3k／48.4k／66.3k／49.3k；greedy 只付利息 1200，從不還本）。好戰：24 潮月 idle seed 1–3 作戰完成 42／43／47、奪點 2／1／1、war 比例最高 4.4%／2.2%／2.2%，世界仍偏安靜。

## 剩餘工作
1. 玩家第 1 輪就撤退（greedy seed 1 全年撤 19 次、12 次首輪；anchored 凍結 7 場 0 勝、6 場首輪撤）→ `src/ai/intent.ts`（後期調校）。
2. 人類遭遇偏難（6 份測試全敗；走私 A×4、解拘者 B×5 湊等級；無走私者勢力暫借鹽鷗；敵方駕駛借同 tag 人物）→ 內容平衡。
3. 第二年經濟：greedy 24 潮月現金 25.9k→5.0k，8 節點第 12 潮月前全被蝕化 → 蝕域擴張與契約供應。
4. `src/rules/effects.ts` 寫出 `part:undefined`（本線以存檔前 JSON 正規化繞過）→ 規則待辦。
附帶：改 `src/mcp/campaign.test.ts` 接受 `already-there`；CLI 合法終局印「終局 …」。

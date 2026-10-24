# REPORT — plan-content-guide：內容填充設計原則工作流 `wf/workflows/content/`（頂層代存，2026-10-24）

STATUS：**DONE**。commit `5cddb9b`（17 檔）。新工作流 [wf/workflows/content/](../../../content/README.md)（入口＋11 子檔＋`tools/stats.ts`），`wf/WORKFLOWS.md` 派發表加一列。給 codex 照著填 `content/base/`、`content/lore/` 與潤飾文字。

## 產出
`README.md`；`numeric-bands.md`＋`.json`（24 列）；`engine-facts.json`（21 列）；`templates.json`（19 列）；`ability-forms.json`（13 列）；`playtest-baselines.json`（6 列）；`mechs.md`、`bio-monsters.md`、`ancient-people.md`、`abilities-effects.md`、`battle-field.md`、`ops-content.md`、`lore-text.md`、`acceptance-playtest.md`；`tools/stats.ts`（`node wf/workflows/content/tools/stats.ts [--content DIR] [--json OUT]`）。

## 數值帶重點
摹機總 HP D 180–300／C 300–420／B 420–560／A 560–800／S 800–1000（跨級 ×1.3–1.4）；怪獸 D 60–180／C 300–480／B 800–1400／A 1500–2000／S 3500–4500（跨級 ×2–2.5）；單發傷害 D 5–9／C 12–20／B 18–26／A 24–34／S 30–40；傷害／AP 基準 6（>8 要限制）；單體上限 48、範圍每目標 26；AP 基本攻擊 ≤4、招牌 5–6、增益 2–3、人物 AP 9；armorPen ≤0.5、accuracy ±20、evasion ≤+22 且 ≤2 回合、resist ≤0.8 且每族至少一型 0；凡兵單發可比摹式高 1.2–1.5 倍；怪獸／古代能力不帶 `conventional-arms`。

## 十條原則
1. 資料合法≠戰場可用：AI 不提的形態、付不起的成本、掛不到目標的效果。
2. `ai.tactics` 鍵要對；passive 不寫；reaction 只有 enemyLeavesAdjacent。
3. armorPen 是比例；反向池成本是加值。
4. 新摹機必填 `defaultLoadout`、情境寫 `components`；每台至少一把非凡兵武器。
5. 等級先於數字。
6. 每 bodyplan 至少一 core、每部位最後一層 structural；capture.frame 一族一台。
7. 命名三段、古代神話名、A 級以上才有二名、機魂個性只限 S。
8. 情境寫玩家 lose、killTarget 用唯一 def、部署相距 ≥10、輪數 20–30、敵我 HP 比 1.2–2.0。
9. 營運事件月份與日子閘門、首選項無 requires 不賺不賠、效果白名單；契約主目標 eliminate／survive／hold。
10. 潤飾只改文字欄，黃金 hash 不變；改顯示名全庫一起改。

## MCP 試玩規程
`node src/mcp/cli.ts serve --socket <短名>.sock`；各級基準單位與情境見 `playtest-baselines.json`；一次只變一個變數；量勝率、平手率、輪數、AbilityUsed、damageIfHit；失衡門檻：同級 5 seed 單方全勝、對基準怪勝率 <30% 或 >90%、平手 >40%、新能力 0 使用、一招佔 >80% 出手、營運存活 <24/30。

## 待引擎落地後更新
`engine-facts.json` EF-13（partsOverride）、EF-19（契約單位 id、人類對手編成）、EF-21（別名、機魂等級、情境 name／brief、模板名稱）；`bio-monsters.md` 同族同級 A 只能一隻、不同級要不同 species；`ancient-people.md` 別名與機魂等級過渡寫法、獸緣殼緣；`mechs.md` defaultLoadout 補填；`ops-content.md` 休眠契約、人類遭遇；`battle-field.md` ISS-025；`numeric-bands.json` 每批後用 stats.ts 重算。→ 頂層：兩條補缺線收線後派更新。

## 驗證
`find_big_lists --min 1024 wf/workflows/content` 0；`wf-lint.sh --strict wf/workflows/content` 0／0／0；四個 wf-table json `tabledb check` 皆空。子代理 Sonnet ×1 寫 stats.ts（修 structural 判斷 bug）。

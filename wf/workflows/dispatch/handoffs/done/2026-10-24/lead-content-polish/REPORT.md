# REPORT — lead-content-polish：補缺、改名、怪獸 AP 成本（頂層代存，2026-10-24）

STATUS：**DONE**。逐件清單 [catalog.json](catalog.json)（86 列）。commit：`411161b`（傷勢表）、`3dcd97e`（屍體改裝框架）、`4ff4310`（AP 成本）、`edd659c`（摹機內建攻擊、池名與血統 tag）、`00789d3`（改名、血統 tag、mech catalog 藍本註記；曾誤夾 content-world 未提交模板，已以比對式 update-ref 重寫移除）、`c817209`、`6ad1c7c`。

## 補缺
- 屍體改裝框架 12 個（盾甲、群喉、崖牙、掘犬、弔燈蜂、鏡肢、腐衛、浮囊、叩闕甲、吐棘者、菌柱、潮脊；孢囊、菌床 `harvest-only` 跳過）。
- 傷勢 6 列追加 `rules/injuries.json`（暫時 3、永久 3；原表無永久列，「重傷改抽永久傷」現在才會發生）；`injury.test.ts` 改固定傷勢表。
- 空手摹機補攻擊：燕鷗、獵犬 凡鐵頭吼（8／2 AP）、燕鷗攻堅型 鐵拳＋頭吼；`policies.test.ts` 的武器毀損案例改遮內建能力。
- 40 個 `costs: []` 主動能力補 AP（約每 AP 6 傷害；範圍 +1；增益／召喚 2–3；孵生 4；restrain 3）；反應技回身鳴刃、背刺反扎維持 0（有觸發與每回合一次限制）。

## 改名（只改顯示文字）
裂晶電弧發射器→裂晶弧光吼砲；30mm 機砲／彈／連射→凡鐵連吼／凡鐵殼矢／凡鐵三矢連吼；池名熱量／電能→燼／流光；熱矛→熾潮矛；過熱→燼滯；算・感測融合→算・殼目融合；拘束彈→拘束矢；背面 A 級「白夜」→「偷天」。禁用詞實質命中 0。血統 tag 以 lore 為準（堅盾、燕鷗、獵犬加 `lineage-kuafu`；FR-7、AT-12 改 kuafu；浮屠雙掛）；mech catalog 改堅盾 2093 公刻藍本夸父、長槍 2102 流出、刑天 2103 出土、新增 `lineage/kuafu`。

## 黃金
`test/golden/` 與 ops `campaign-hash.json` 未變；非黃金量測 hash（skirmish-whitegloves seed 1–5）全換。

## 平衡
skirmish-whitegloves：改前玩家 2 勝 3 平（敵方空手）→改後 5 場 20 輪平手。`sim:campaign` greedy seed 1–5 12 潮月全存活（seed 5 由 0 人變 7 人）。24 情境全 pass，但 `convoy-run`、`tidal-flat-evac`、`quarry-duel` 變僵局——原因是 AP 成本：怪獸走滿 9 格沒 AP 出手、劣勢時退回。

## 測試
乾淨 worktree（HEAD `8f3d70e`）：`npm test` 589/590（fuzz 快速版全跑時偶發 not ok，單獨 3/3 ok）；check、ops content check 0／0；typecheck、`sim:campaign` OK。

## 需要決定（頂層 2026-10-24）
1. 三場僵局 → 走 AI 修正（先逼近、保留出手 AP），已轉 lead-ai-objective。
2. 「獵犬 Mk2」→ 統一為「獵犬-II型」（C 級系列＋型號），已派對齊小修線。
3. lore `factions/backside.json` 白夜→偷天 → 已派對齊小修線。
4. ui-adapter 寫死的「熱量／電能」→ 交下一條 UI 線掃。

# abilities-effects — 能力與效果：形態選擇、AI 會不會用、成本與產出

[content README](README.md)｜型別 [data-model-abilities-effects](../planning/specs/core/data-model-abilities-effects.md)｜結算 [rules-attack-resolution](../planning/specs/core/rules-attack-resolution.md)｜AI [ai spec](../planning/specs/core/ai.md)｜引擎事實 [engine-facts.json](engine-facts.json)（21 列）

能力與效果是引擎唯一的動詞。資料合法不等於戰場上用得到——**三個死因**：AI 不提這種形態、使用者付不起、效果掛不到目標。每寫一條先過 engine-facts，再過下面的形態表。

## 形態選擇表（AI 現況，2026-10-24 修正線後）

十三種「想做的事」各對應一種寫法與 `ai.tactics` 鍵，已抽到 [ability-forms.json](ability-forms.json)（13 列）。欄位：`想做的事`、`寫法`（mode／target／effects 的組合）、`ai.tactics 鍵`、`注意`。統計：攻擊類 2、增益類 3、減益與控制 2、位移 1、維持 1、反應 1、捕捉 1、召喚 1、治療 1、被動 1（被動不要寫 passive）。

**鍵錯＝AI 估值 0＝資料死**。單體傷害 attack、範圍傷害 attackArea、自身或友方增益 buff／protect、純減益 debuff／disable、偵察 scout、撤退 escape、拘束 capture、回血 heal。tactics 值 0.5–1.5；主招 1、副招 0.6–0.8、保命 1.2。友方增益一律 `friendly:"only"`（必中、不擲骰）；減益效果對怪獸要 `scope:"mech"`。

## 成本與產出

- `costs` 一律含 `{"pool":"ap","owner":"person","amount":N}`（反應技除外）。AP 帶見 numeric-bands：基本攻擊 ≤4。
- 機甲池成本 `owner:"mech"`：heat 是反向池——**costs heat ＝ 加燼**（EF-05），要「超載燃燼」加 `allowOverload:true`；排燼寫 `produces:[{"pool":"heat","owner":"mech","amount":-15}]`。charge 正向池：costs 20–40。
- 矢：`costs` 指向部件宣告的矢池（ammo-30、bind-spike…），不用 `ammoPool` 欄。
- **沒有該池＝付不起**，produces 缺池也不可用（EF-04）——寫完想一下這招會被裝在哪些機體上。
- 怪獸與古代能力照既有範本 `produces:[]`、`require:[]`，強度用 cooldown／usesPerBattle 限。
- 強招限制三選一：`usesPerBattle 1–3`、`cooldown 2–4`、自傷或昂貵池成本。

## 命中、傷害包、部位

- `accuracy` 加值 ±15 內（命中最終夾 5–95，人物 accuracy 50 上下、怪獸 evasion 5–12、cover 0–35）；砲類 `range.min` 2–4 表最小距離。
- packets：`type` ∈ kinetic／acid／energy／thermal／pierce；`amount` 數字或 NumExpr（`{"ref":"target.grade","mul":6,"add":12}` 專打大怪）；`armorPen` 0–0.35 **比例**；`crit` 0.15–0.2（×1.5）；`layerFilter` 只打某些層（光矢只打 shield／component）；`resistPen` 抵抗性。
- 多 packet＝一擊多型（矢＋燒），每 packet 各自沿層結算；溢出不傳到鄰接部位。
- `partAim:{allowed:true,penalty:8–15}` 給精準武器；AI 用 `targetPref.parts` 決定要不要指定部位。

## 效果檔

- 必填 `id name scope clock stack contribs hooks tags ui.badge`；`source` 填效果自己 id。
- scope：對機體的增減益 `mech`；傷勢、士氣、特質、perk `person`（打到無人物單位會被略過）；裝甲層狀態 `layer`／`part`（少用）。
- clock：短效 `ownerTurns 1–3`；帶效果與部件來源 `whileSource`；特質 `permanent`；傷勢 `days`。stack 預設 `refresh`。
- contribs path 只有 `self.attrs.{accuracy,evasion,initiative,perception,resolve,control}` 與 `self.pools.<id>.max|regen`；幅度：短效 ±5–22、永久 ±5。
- hooks：持續傷 `onTick damage 3–4`（可 `layerFilter:["flesh"]`）；灌本能 `onApply pool instinct +10`；孵生 `onApply spawn`；士氣 `onApply moraleCheck dc 40`。動詞只有八個，**不用 setControl**。
- 每個效果有 `ui.badge`（中文 2–4 字）與 `name`；id 不外露（ISS-018 教訓）。

## 命名與文字

招式名是意象＋動作：「穿雲一擲」「斷崖之吻」「請確認償還意願」；凡兵帶「凡」字；禁用詞照 style.md（不寫電磁、口徑、mm、瓦）。效果名 2–6 字可直接當 badge。

## 常見錯誤

armorPen 寫 10；tactics 鍵選錯或 friendly yes 當友方增益；passive；reaction 用別的事件名；produces heat 給無 heat 機體；person scope 減益打怪獸；contribs path 寫 target.*；主動招 AP 0；強招無任何限制；效果缺 badge；range max >8 無 min 與 uses 限制。

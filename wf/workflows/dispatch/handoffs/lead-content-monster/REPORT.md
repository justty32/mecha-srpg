# lead-content-monster REPORT — 四族裂獸擴充 122 檔，全綠收線（2026-10-24，頂層代存）

設計契約：[design.md](design.md)；一覽表：[catalog.json](catalog.json)（wf-table/1，122 列）。工人交接書：`handoffs/done/2026-10-24/cx-mon-*.md`；工人 REPORT：`cx-mon-{insect,beast,alien,mycel}/REPORT.md`。

## 做了什麼
領導讀原始碼定引擎事實（血量只來自 bodyplan、多 core 部位要全毀才死、互斥捕捉條件＝不可捕捉、capture.frame 一族一台）與數值表，派 4 條 codex（gpt-6-astra）各做一族。太空歌劇裁示寫進 design.md 第〇節；照 `content/lore/style.md` 掃禁用詞，0 命中。

## 產出
| 類別 | 蟲族 | 獸族 | 異形 | 菌絲 | 計 |
|---|---|---|---|---|---|
| species | 2 | 4 | 4 | 4 | 14（各族總數 5／5／4／4） |
| bodyplans | 2 | 4 | 4 | 4 | 14 |
| frames/bio-* | 2 | 4 | 4 | 4 | 14 |
| monsters | 4 | 8 | 6 | 7 | 25（D3、C5、B7、A9、S1） |
| abilities/kx-* | 6 | 10 | 9 | 7 | 32 |
| effects/kx-* | 4 | 7 | 5 | 4 | 20 |
| aiprofiles/kx-* | 0 | 1 | 1 | 1 | 3 |

commit：`741b916`（蟲族）、`98dbfcb`（獸族）、`ae6d0df`（異形）、`8ac6e43`（菌絲）、`d296f22`（收線）。`d5ec4be`（wiki 線）誤刪、`560ccf8` 原樣還原，HEAD 核過 122/122。

## 最得意的 5 件
1. 潮脊「吉大港的那隻」，二名「萬潮葬王」（S，4000 HP）：萬潮覆港、王脊橫天。
2. 群喉，二名「五聲葬月」：異形潮錨，五張喉嚨都是核心。
3. 腐衛，二名「鏽誓葬騎」：菌絲裹著舊機甲殘骸行走。
4. 鏡肢・失配之形：鏡衣側高抗能量灼燒，裸肉側「赤祈撕界」。
5. 菌床「白夜」：五個結全滅才死、眠囊開綻、只有燒吃全額。

## 驗證
乾淨 worktree（HEAD a35af02）：check 0／0、`npm test` 454/454、黃金不變；煙霧 24 場 0 例外，32 個新能力 AI 全用到。

## 領導親手改
1. 刪第二隻 A 級巢母 `monster/nestmother-bell-tithe`（「萬巢收租」）：ops 捕獲靠「同族同級只有一隻」對出二名（BattleResult 無 monster id，`src/ops/sortie/apply.ts:121` SPEC-GAP）。
2. `kx-star-howl`、`kx-brood-call` 改友方單體＋自己也吃（AI 不用自身為中心的友方範圍增益）。

## 平衡
`partsOverride` 未實作，等級不換 HP（鏡肢 A 950、腐衛 A 1000、叩闕甲 A 1400 比崖牙 1900、群喉 1800 薄）；生物機甲場獸族、菌絲多勝，異形、蟲族多敗；菌絲場常拖長。

## 需要決定（頂層 2026-10-24）
1. BattleResult 帶 monster id → 排入引擎缺口線，之後可加回萬巢收租。
2. 孢囊、菌床佔位機體 `bio-pod`／`bio-bed`（`harvest-only`）；`effect/kx-overgrowth` 未掛 → 等「採」系統。
3. 14 個新族無 `frames/corpse-*` → 交內容補線。
4. 營運層只有 `rift/insect` → 已轉 lead-content-world 補三族 rift／encounters。
5. 蛻皮 `behaviors.molt` 未實作 → 排入引擎缺口線。
6. AI 不用自身為中心的友方範圍增益 → 已轉 lead-ai-objective。
7. `partsOverride` → 排入引擎缺口線。

## 以後交接書該點名的工具
煙霧 runner `scratchpad/kx-smoke/run.ts`；驗收在乾淨 worktree 做。

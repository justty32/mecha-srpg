# cx-gb-check 完成回報

STATUS：DONE。2026-10-24，固定五條驗收完成；未 commit。`npm run check`：`OK 0 errors, 38 warnings`。

## 做了什麼

新增原契約五類錯誤、五類警告；依收尾收到的領導優先 order，再加八類 `band-*` 硬上限警告。共十八規則全部集中在 `src/content/lint.ts`。只檢查 schema 通過後的合併定義，沿用最終覆寫版本與來源檔案位置；數值規則只看字面 number，不求值 NumExpr。DamagePacket 檢查也涵蓋效果 hooks 的 packets。驗收仍為原定五條，沒有增加指令。

依最後裁定，`lintContent(...)` 只接在 loader 的 `import.meta.main` CLI 段；`loadPacks`／`loadContentDirs` 不執行 lint，保留 fixture 原有載入行為。新增必要 import、`LoadIssue.ruleId?` 與 CLI 格式調整。每行 WARNING／ERROR 印 `[ruleId]`；舊檢查未給 id 時用 `content-load`。沒有修改另一線的怪獸檢查段落，也沒有改 test fixture。匯出 `lintContent(db, packs?, errors?, warnings?)` 回傳錯誤／警告，可供 probe 明確呼叫；傳 packs 時附原檔路徑，只有 DB 時以完整 id 定位。

### 規則清單

來源縮寫：L＝`src/rules/layers.ts` 的 `applyPacket`、`src/rules/attack.ts` 的 `modifiedAmount`；A＝同檔 `hitChance`；C＝`src/rules/command.ts` 的 `checkAbility`／`runCommand` 與交接書；P＝`src/rules/pools.ts` 的 `canPay`／`pay`／`updateBand`；E＝`src/rules/effects.ts` 的 `applyEffect`；AI＝下方形態表；F＝`src/rules/command.ts` 的 `abilitiesOf` 與交接書。

| id | 分級 | 判準 | 來源 | 命中 |
|---|---|---|---|---|
| num-packet-ratio | 錯 | 三比例越界 | L | 0 |
| num-accuracy | 錯 | 超出 ±100 | A | 0 |
| num-range | 錯 | 負值或逆序 | C | 0 |
| num-nonnegative | 錯 | 成本／CD／次數負值 | C/P | 0 |
| attack-cost | 錯 | 主動攻擊空成本 | C | 0 |
| inverted-direction | 警 | 反向池方向可疑 | P | 0 |
| monster-person-effect | 警 | 獸專用技套人物效果 | E | 0 |
| ai-shape | 警 | 無候選或有效權重 | AI | 0 |
| soft-overflow-band | 警 | 無超限 band | P | 1 |
| mechanical-unarmed | 警 | 無配裝且無內建攻擊 | F | 1 |

三比例為 armorPen、resistPen、crit，合法閉區間 [0,1]。range 任一常數小於零即錯；min/max 皆常數才比較先後。非負限制只含 costs[].amount、cooldown、usesPerBattle；produces 可負。主動攻擊指 activated 且 packets 非空；reaction 及無 packets 的能力豁免。物理範圍仍報錯；較窄的內容硬上限依新 order 報警告。

領導修正依據：`wf/inbox/orders/cx-gb-check.md` 的「2026-10-24 lead-gaps-battle 修正（優先於交接書）」。下表來源 N 指 `wf/workflows/content/numeric-bands.json` 的 rows（0-based）；上限轉錄在程式 `NUMERIC_BANDS` 常數表，執行期不讀 wf。這是 order 指定的擴充，不是自行增加驗收。

| id | 分級 | 判準 | 來源 | 命中 |
|---|---|---|---|---|
| band-armorpen | 警 | 0.5 < armorPen ≤ 1 | N10 | 0 |
| band-accuracy | 警 | 20 < 絕對加值 ≤ 100 | N10 | 0 |
| band-evasion | 警 | 效果 add > 22 | N18 | 1 |
| band-resist | 警 | 層 resist > 0.8 | N15 | 0 |
| band-damage | 警 | 單體 > 48／範圍 > 26 | N7 | 1 |
| band-frame-hp | 警 | S 摹機基礎層 HP > 1200 | N0 | 0 |
| band-person-hp | 警 | 人物 hp.max > 70 | N19 | 0 |
| band-cover | 警 | 地形 cover > 50 | N21 | 0 |

band 訊息含上限與來源列。只轉錄明示的「硬上限」，不把建議區間、AP 慣例、地圖比例等另造規則。armorPen／accuracy 超出原物理範圍只報原錯誤；傷害只在全部 packets.amount 都是常數時加總，ball/line/cone 用範圍上限。evasion 只檢查效果 contribs 的 `.attrs.evasion` 加值，不把乘數、set 或基礎屬性當加值。frame HP 檢查 S 級 mechanical 的基礎 bodyPlan 層總和，不推演裝配。其他 band 非字面 NumExpr 同樣跳過。

方向警告依 pool 宣告的 owner＋id 找 inverted 池：負 costs 警告；正 produces 只有能力名稱或 tags 命中散熱詞才警告。中文詞為「散熱、排熱、降溫、冷卻、排燼、散燼、冷却」；英文詞為 cool／cooling、heat-sink（可空格、底線或連寫）、vent／venting，須有字串邊界或空白／連字號／底線分隔，避免 conventional-arms 誤中 vent。正向發熱招不警告。相同 owner＋id 只要任一宣告 inverted 即納入提示，不推演實際裝配。

人物效果警告只看 species.abilities 與 monster.extraAbilities 聯集，扣除所有 frame.innateAbilities、component.abilities；檢查能力 effects.apply 的字串與物件引用。person-scope 對無人物目標目前會略過，警告表示可能無效，並非引擎仍會拋錯。

soft 池只需任何 band 的非空區間與 max 以上交集非空；不要求覆蓋所有超限值。無限 max=null 豁免；有 bands 但 max／界線是動態 NumExpr 時不推算，空 bands 且 max 非 null 仍警告。機械空手規則按契約看 defaultLoadout 是否存在；空物件也算存在，不延伸檢查配裝是否真的有武器。

### AI 形態表

程式內 `AI_SHAPES` 表逐列註明來源；開工與收尾均親讀來源。最後重讀時 SHA-256 已變，核對 diff 確認 cx-gb-ai 增加 pursuitCells／移動限制與範圍能力站位，能力模式、目標形態與評分 tactics 集合未變，故表無須變更。已讀領導三則 order，最後一則要求 lint 改為 CLI 專用接線。

| 來源函式 | 現行形態與警告 |
|---|---|
| tactical.ts `proposeTactical` | activated／sustained；passive 警告，已開持續技不再提 |
| 同上 | self/unit/cell/ball/line/cone/part；part 缺 allowed 或 parts 偏好警告 |
| 同上 | ball/line/cone 會考慮友軍；cell 只用敵方座標 |
| score.ts `tacticWeights`／`scoreCandidate`／`want` | 沒有受支援非零權重時警告；動態值不求值 |
| movement.ts `reactions` | enemyLeavesAdjacent＋melee；缺事件／tag 或 self/part 目標警告 |

上表前兩個檔案位於 `src/ai/policies/`、`src/ai/`，movement 位於 `src/rules/`。受支援 tactics：attack、attackArea、disable、heal、buff、debuff、escape、protect、capture、scout。缺鍵指所有受支援鍵缺席，不要求填齊十鍵；有效反應技走規則自動觸發，無須 tactics。範圍、持續、純減益不再依舊報告誤報。

### 驗收證據（固定五條）

1. `node --test --test-isolation=none src/content/lint.test.ts`：18 tests，18 pass，0 fail，exit 0。原十類與 order 八類各有紅綠案例；每類都先用 `loadPacks` 載入記憶體包，確認載入器未自動 lint，再明確呼叫 `lintContent`，斷言壞輸入確實出現指定 id／分級，再修正同一輸入確認消失；不接受 schema 錯誤冒充命中。
2. `npm run check`：exit 0，`OK 0 errors, 38 warnings`，38 行 WARNING 都帶 id。
3. 本報告列出全部十八條規則、命中數及來源；程式 AI 表與上表標明來源函式。
4. `npm run typecheck`：exit 0；`node --test --test-isolation=none src/content/*.test.ts`：34 tests，34 pass，0 fail，exit 0。
5. 本 REPORT 已存檔，具四段、規則清單與內容修正清單。

驗證原始輸出：`/tmp/cx-gb-check/{lint-tests,content-tests,check,typecheck}.log`。沒有增加全套 npm test、fuzz、build 或其他驗收。

### 警告統計與前十筆

本線四筆：`soft-overflow-band` 1（species/tidewolf，`$.pools[1].bands`，instinct）；`mechanical-unarmed` 1（frames/infantry，`$.defaultLoadout`）；`band-evasion` 1（effects/mx-faded，`$.contribs[0].value`，25 > 22）；`band-damage` 1（abilities/kx-tide-crush，`$.packets`，28 > 26）。其餘十四規則均 0。`content-load` 34 筆是另一線同時新增的 capture layer HP differs 警告，與本線規則分開統計。

每個非零規則的前十筆完整檔名、欄位、訊息與總數存於 [warnings.json](warnings.json)（共 14 列）。content-load 前十筆依 CLI 順序為 lancewing-b 的 heart-shrine／crown／left-wing／right-wing／sting／lantern 六部位，以及 mirror-a 的 mirror-side／bare-side／hidden-core／folded-limb 四部位；本線四個非零規則各只有上述一筆。

## 產出（改動檔清單）

- `src/content/lint.ts`：新增十八類規則、AI 形態表與數值硬上限常數表。
- `src/content/lint.test.ts`：原十類及 order 八類紅綠案例。
- `src/content/loader.ts`：本線只新增接線、選填 ruleId 與 CLI id 顯示；共用檔中的其他 diff 屬別線。
- `wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-check/REPORT.md`：本回報。
- `wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-check/warnings.json`：警告統計與每規則前十筆。

內容修正清單：無。現有 content/base 已 0 錯，不為警告修改其他線內容。實作及交付共 5 檔，容量低於 120 KB；未碰禁區，未 commit。

## 沒做到或證據不足的

無阻塞。這是靜態提示，不能保證執行期每個 NumExpr、配裝、目標或 AI 評分都能使用；未知動態值依契約跳過。沒有推算效果鉤子的間接 person-scope 套用鏈。並行工作樹仍會變動，警告數與測試數是本次收尾驗證快照。

## 需要決定的事

species/tidewolf 的 instinct 超限 band、infantry 無預設配裝、mx-faded 的迴避加值及 kx-tide-crush 的範圍傷害由領導／內容線判斷；34 筆 capture HP 差異由怪獸檢查線解讀。本線不清零警告。

code-map 的 content 列目前仍概述原有職責；commit 前請領導補上 lint 模組。本線可寫範圍不含 code-map，故沒有越界修改。

## 以後交接書該點名的工具

無。

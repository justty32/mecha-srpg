# REPORT — lead-ops-bio-balance（2026-10-24，頂層代存領導匯報）

STATUS：DONE。commit `e04d80d`、`95b1e04`。工人：`cx-bio`（生物系）、`cx-bal`（補彈＋第一輪平衡）、`cx-bal2`（敗因、數值上限、第三輪）；工人 REPORT 在 [cx-bio](cx-bio/REPORT.md)、[cx-bal](cx-bal/REPORT.md)、[cx-bal2](cx-bal2/REPORT.md)。

驗收：`npm test` 389／389；check、typecheck、ops content check 0 錯；`npm run sim:campaign` idle／greedy 12 潮月 OK；skirmish seed 1–5 `pass:true`；`test/golden/` 未動。grep stable／feed／hunger／taming／餵／飼料／獸欄／馴 只剩識別字 `RulesTables`。

## 一、生物系改寫（spec data-model-beasts 全落地）
- `RestraintBay`／`BeastState`（kind、wear、vitality、sustainDue、bond）／`CarcassState`。
- 磨損每日 D3／C5／B8／A15（受傷 ×1.5）；≥50 警告、出戰注入 instinct；≥100 掙脫三選（硬壓 wear→60、放走、殺）。
- 族別維持每潮月首個大潮：蟲／獸 `devour`（扣 `stock:flesh`）、異形 `tide-soak`、菌絲 `prune` job；活性歸零即轉屍體。
- Job：restrain、mount（同級核＋scrap）、embalm、prune。捕獲入艙自動編登記號，A 級帶二名；屍體戰後二選（拆／留整屍）。
- 稱號四種；`MonsterDef.epithet`（巢母「千囊房東」）。新內容：`frames/corpse-*`、`world/beasts/*`、`names/nick-*`、`keymap-ops.json`。SPEC-GAP 7 項見 cx-bio REPORT。
- 刪除（裁示授權）：`src/ops/crew/stable.ts`、`world/rooms/stable.json`（→`rooms/restraint.json`）、3 個 stable 測試、`stock:feed`、市場 feed 列、services feed／hunger／tameDays／stable 鍵、事件 `Tamed`、「餵」動詞與捷徑、全部 TODO。

## 二、ops 對外型別變更（給 ui-ops）
| 項目 | 舊 → 新 |
|---|---|
| `Screen.actions[]` | `{label,cmd}` → `{id,label,cmd,group,key?,tooltip?,disabled?}`；key 由 `world/keymap-ops.json` |
| `OpsCommand` | `feed` → `{v:"devour",beast,amount}`（文字 `投`） |
| `CampaignState` | `stable` → `restraint:{slots,beasts,carcasses,myceliumRoom?}`；`stablePens`→`restraintSlots` |
| `names[]` | 加 `kind`：title／registry／nickname／dread／epithet |
| Job／Market | Job 加四種；市場 `feed`→`carcass`，加 `ammo` |
| `EnemySnapshot` | 加 `phase?` |
| 事件 | 刪 Tamed；加 WearWarning、BrokeLoose、Suppressed、Sustained、Devoured、Stiffened、Mounted、MyceliumOvergrown、Resupplied |
| `OpsEffect` | 加 restraintChoice、salvage；nameMech 加 kind? |
| core（可選欄） | `MonsterDef.epithet?`、`UnitSpawn.pools?`、`LayerState.maxHp?` |

## 三、補彈
`src/ops/world/resupply.ts` `resupplyDaily7`（tick 第 7 段）：停泊且節點有市場時補滿 `ammo*` 池，單價取市場 `ammo` 列、付不起補到付得起、只經 `post`；3 測試含帳本守恆。

## 四、平衡前後（greedy）
| seed | 改前：首戰／M3 人·現金／M12 | 改後：首戰（日）／全年勝-敗／M3／M12 |
|---|---|---|
| 1 | 敗／1·0／0·0 | 勝（33）／2-1／7·5272／7·862 |
| 2 | 敗／1·0／0·0 | 勝（71）／2-6／7·5303／7·365 |
| 3 | 敗／1·0／0·0 | 勝（17）／2-1／7·5300／7·890 |
| 4 | 敗／1·−24／0·−24 | 勝（44）／2-6／7·5138／7·224 |
| 5 | 敗／0·0／0·0 | 敗（48）／0-3／3·0／0·0 |

債務 24000 每潮月 5% 複利到 43100.55。手段：(1) 根因——opening 期契約不該放潮錨本尊：接約凍結 `phase`，opening 期殲滅先鋒即關裂縫（首戰 0/5→5/5）；(2) 開局兩台 `moji-tern-guard`＋新非傳統武器 `arc-emitter`／`arc-pulse`；(3) 月薪減半；(4) clear／seal 報酬乘數 400→2800；(5) `ammo-30` 每發 2、蟲群地圖寬 20→10。未動 core 規則與十分律。

## 五、黃金
規則黃金未動；ops `campaign-hash.json` `545be0239746ade5`→`aacb6d08f04a2915`（刪 feed）→`16912a55fda78809`（開局機體與薪資）。

## 六、判斷
- 第一輪數字是湊的；套上限後追出 opening 期錨的 ops bug，修完才合理調數值。
- anchored 後打巢母全敗（15 敗）：AI 無目標意識（不優先殺錨／孵化源、hold 不進區）；12 潮月存活靠前兩場高報酬。
- 報酬 2800 是補洞數字，應由經濟 spec 與債務、修理、核價一起定。
- 曾出現一次「貢獻值尚未求值」例外，未重現。泊費可讓 cash 到 −2（spec 允許欠港費）。

## 七、需要決定（頂層 2026-10-24 處理）
1. 代決平衡數值 → 維持，使用者可推翻（`world/contracts/{clear,seal}.json`、`world/campaign-start/default.json`、`abilities/arc-pulse.json`）。
2. 債務催收／還款 → 交經濟規劃線。
3. AI 目標意識 → 派線。
4. spec 缺口（清剿打核點或蝕區、opening 期戰場目標、`ammo` 市場列、`EnemySnapshot.phase`）→ 交經濟規劃線。

## 其他
`wf/inbox/mail/lead-ops-bio-balance/` 11 封信未歸檔：`inbox_ack.sh` 遇含 `../` 路徑報「message is outside the inbox」→ 交 tidy。

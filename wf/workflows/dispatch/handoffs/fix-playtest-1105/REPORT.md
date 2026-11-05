# fix-playtest-1105 收件報告

來源：[playtest-1105 試玩報告](../playtest-1105/REPORT.md)（主樹未入庫）。分支 `worktree-agent-a28ab34454695e99f`，未 merge、未 push。

## 錯誤類

| 問題 | 根因 → 修法 | commit |
|---|---|---|
| 陣亡敵人留在單位列表 | AI 知識 `updateKnowledge` 對感知範圍內陣亡的敵人仍保留 lastSeen 3 輪；MCP 視圖另有快照後備，因此殘影留到戰鬥結束 → 感知內陣亡／撤離／被俘不再留 lastSeen；`battle_observe` 把親眼退場的敵人移到 `departed`，我方單位加 `status`（被擊毀看得出來） | d2738670 |
| 士氣顯示英文 | `effects/morale-*.json` 的 name／badge 就是英文 id → 改為 動搖／崩潰邊緣／潰逃 | f68ca2b2 |
| 新形態沒有顯示名 | `monster/exk-*.json` 缺 name → 補上「物種・形態」（如 鹽針・倒鉤）；MCP 的敵方怪獸也改用形態名，與網頁 UI 一致 | f68ca2b2、d2738670 |
| 武器招架說明空白 | `does` 只列傷害包與效果，招架沒有傷害包 → 新增 `defenseSummary`（次數、承傷部位、上限、失衡），MCP 與 UI 能力說明共用 | d2738670 |
| four-corners 出生在圍牆房間 | player-0 位於 (17,27) 的殘牆房間 → 移到 (14,27)；同圖的 exk-split-roots 也有同樣問題，一併修正 | f68ca2b2 |
| 簡介英文與開發者用語 | 刪除 Flyingfish Shoal、「尚無實體尺寸碰撞規則」和配裝備註；exp-unfinished-ties 改寫成獨立的簡介；combined-arms 敵方陣營改為蟲群，與蝕蟲單位一致 | f68ca2b2 |
| 戰役開場劇情順序倒置 | 葬禮事件只靠 flag，等第一次推進時間的每日事件階段才抽到；第 0 天沒有待選，所以能先出擊 → `StartDef.events` 加上 `beginCampaign()`，開局就把葬禮排成待選；MCP、UI、runCampaign、replay 都改用它，出擊會被 pending-choice 擋下 | 13b4e37e |
| 拆屍沒有回饋 | 真的沒入帳：屍體沒在戰場上拾取時，loot 是空的；訊息沿用通用模板 → 未拾取時給屍料（`battlefieldCorpseSalvage`＝5）；新增 CarcassSalvaged／SalvageGained／SalvageStashed 事件，log 顯示「拆下：屍料 +5。」，貨艙滿也會回報 | 4fc30c94 |
| （選做）MCP 地圖看不到 | 結構化輸出移除了 ascii → 改以 `map.rows`、`map.key` 提供 | d2738670 |

回歸測試：`test/content/playtest-1105.test.ts`（效果名、簡介、出生點四向檢查）、`src/mcp/playtest-1105.test.ts`（退場、形態名、招架說明）、`src/mcp/battle.test.ts`（map.rows）。

## 命中不對稱（dd57e02c）

查證結果：AI 與玩家用的是同一個 `aimInfo`，沒有重複計算或漏算修正值，所以不是公式 bug。全 AI 對局中我方近戰平均 94–95%。

差別來自規格數值近戰 windup 0.8。目標上一回合若橫移滿速（vPerp 1.5），相鄰近戰的誤差約 1.3 格，命中掉到約 50%；6 格遠射的時間項只有 0.4，所以仍是 100%。AI 會挑橫移小的角度出手，玩家看不到這個幾何，才打出 36–49%。這和 spec「近距大目標仍可能 100%，遠距小部位和付費迴避才降低」的意圖相反。

修法：`aimMeleeWindup` 與三招近戰的 windup 從 0.8 降到 0.3，公式不動，spec 已加修訂註記。對「身體」的近戰命中，原本約 43–60%，改後 100%；打小部位仍會降低。

## 平衡（dbea715a）

依 numeric-bands 的 C 級框架調整：單發 12–20、傷害／AP 4–6、範圍招為單體 ×0.6–0.7 且須帶 cooldown。

- 鐮肢劈斬：AP 2→3、pierce 40→20。原本 20 傷害／AP；改後與鳴刃斬同級。
- 裂晶弧光：AP 2→3、thermal 21→14、新增 cooldown 2。

全 AI 對局，4 情境 × seed 1–5，我方勝場：

| 情境 | 改前 | 只改 windup | 全改 |
|---|---|---|---|
| exm-crossline | 3/5 | 3/5 | 4/5 |
| exp-four-choices | 0/5 | 0/5 | 3/5 |
| exp-unfinished-ties | 2/5 | 2/5 | 5/5 |
| cx3-flyingfish-shoal（3 鐮肢對 3 機） | 0/5（4–7 輪敗） | 0/5 | 0/5（6–10 輪敗） |
| 合計 | 5/20 | 5/20 | 12/20 |

戰役探針（ops balance-probe，seed 1–5，greedy 全年；改前內容 vs 全改）：

| 指標 | 改前 | 改後 |
|---|---|---|
| 首戰勝 | 5/5 | 5/5 |
| 全年勝／敗 | 100／46 | 39／35 |
| 第 3 月現金 | 28k–45k | 2.5k–14k |
| 第 12 月留 7 人 | 3/5 | 3/5（seed 3 剩 4 人、債務增加） |

試玩看到的「首月暴增 2.5 萬」消失了，但經濟明顯變緊。

## 黃金

戰鬥黃金 `test/golden.test.ts` 8 條：不變（指令固定，平衡與 windup 都沒有影響）。

營運黃金（902775f7）：兩項都是開場修正造成的，平衡改動對它們沒有影響。重錄前，平衡 commit 之後跑過一次，這兩項都還是綠燈。

- `src/ops/sim/fixtures/campaign-hash.json`：aacf251a→e246b6b4。事件數 840、第 31 天都不變，只有葬禮改記在第 0 天。
- `ops-merc-join`：原指令的第一步是 sail，現在會被開場待選擋下。照慣例用 `rerecord.ts` 重錄：兩個 choose 移到最前面，戰果紀錄沿用。同時修正 `rerecord.ts`，改用和 replay 一樣的 `beginCampaign` 開局。hash 8b012bc9→e6a5691d，事件 897→914。

`health.test.ts`（greedy seed 2）：子 agent 在沒有平衡改動的樹上量到 0.49，越界。在本分支量到 54/135＝0.400，剛好壓在上限，所以通過，沒有換 seed。這是個邊界值，之後容易再翻紅。

## 最後一次全套測試

`node --test --test-concurrency=1`（nice＋heavy-lock），1156 項：通過 1149、失敗 5，耗時約 89 分鐘。
失敗與處理：lords 存讀 2 項、ops world 游標 1 項是開場修正的連帶影響，改從 beginCampaign 起跑（c3fcb6df）；feedback 1 項是 windup 調整後樣本變成必中，改把攻方準度壓低（0dcf1e32）；content/index 1 項是改名後索引沒重產（15077666）。
修正後這 4 個檔單獨重跑，37/37 通過。全套沒再跑第二次。另外 typecheck、`npm run check`（0 錯誤）都通過；wf-lint strict 有 2 個 broken 連結，都是 legacy/docs 的既有問題，原因是 worktree 的目錄深度不同。

## 待你裁決（白話）

1. **守區方提早離開守區**（four-corners）：`intent.ts:163` 第 8 輪後，只要戰力比 <0.45 或損失 ≥0.7，就算目標達得到也整隊撤。spec 寫的是「全部達不到才整隊撤」，但現有測試（`test/ai/intent.test.ts`「giveUpRatio…門檻」）明確要求只看比例也要撤。程式和測試優先於 spec，所以我沒改。選項：(a) 改成「目標達不到」且「比例差」才撤，撤退會變少、黃金會變；(b) 只對守區／撐輪數這類防守意圖禁止比例撤退；(c) 維持現狀。
2. **滿血怪獸撤退判我方勝**：撤退由上面同一行觸發，滿血也一起撤。依 spec，「對手撤光且有人撤離＝擊退勝」是明文規定。突兀感另一個來源是 skirmish-20 的出口只在 x=0，正好是我方部署邊。選項：(a) 同第 1 點收緊撤退條件；(b) 出口分陣營，各自從己方邊撤；(c) 戰報補一句「敵方判斷不利撤走」。
3. **敵人在射程外原地挨打**：鐮肢感知 6、蝕蟲 4，被打也不會知道攻擊者在哪；沒有情報時會走到地圖中央，然後停下。spec 只規定感知是聯集，沒規定「被打會不會暴露射手」。選項：(a) 被擊中時把攻擊者寫進情報（最小、最合理，但狙擊流會變弱）；(b) 提高怪獸感知；(c) 沒有情報時往對方部署區搜索；(d) 維持現狀。
4. **命中幾乎都 100%**：windup 降低後，打身體除非目標在掩體後或付費閃身，否則都是 100%。降命中的減益只在打部位時才有感。要讓減益有用，得另外加命中變異來源，例如距離散布或 skill 夾限。這屬於設計方向問題。
5. **戰役變緊**：如果覺得太緊，可以調的旋鈕：弧光 thermal 14→16，或 cooldown 2→1。
6. 未處理（不在本次清單）：人名格式、戰役 log 刷屏與浮點尾數、盾甲只放自 buff、地物傷害沒寫是哪個、「回合」與「輪」混用。

# cx-fg-ga-04 — FAILED

指定 14 檔（10 部件、2 能力、2 效果）已齊，本次親讀規則並重驗既有產出。固定驗收第 2、4 條通過；第 1 條被開場已有的批次 manifest 擋下，第 3 條因部件屬性／池修正未生效及開場存量不符規格而失敗。未改內容、引擎或既有檔，未 commit。

## 已讀清單

親讀點名 20 檔；以下為主 repo 根目錄下的路徑（AGENTS.md 亦親讀絕對路徑版本）。JSON 以 tabledb 分片讀取。

- [AGENTS.md](../../../../../../AGENTS.md)
- [user.md](../../../../common/user.md)
- [content/README.md](../../../../content/README.md)
- [batch.md](../../../../content/batch.md)
- [mechs.md](../../../../content/mechs.md)
- [abilities-effects.md](../../../../content/abilities-effects.md)
- [numeric-bands.md](../../../../content/numeric-bands.md)
- [numeric-bands.json](../../../../content/numeric-bands.json)
- [engine-facts.json](../../../../content/engine-facts.json)
- [world-pillars.md](../../../../content/world-pillars.md)
- [polish.md](../../../../content/polish.md)
- [lore/README.md](../../../../../../content/lore/README.md)
- [style.md](../../../../../../content/lore/style.md)
- [gear-common.md](../gear-common.md)
- [fill-rulings.md](../../fill-rulings.md)
- [data-model-mech.md](../../../../planning/specs/core/data-model-mech.md)
- [equipment-and-state.md](../../../../planning/specs/core/data-model-mech/equipment-and-state.md)
- [data-model-abilities-effects.md](../../../../planning/specs/core/data-model-abilities-effects.md)
- [plan.md](../plan-ga/plan.md)
- [fg-ga-04.specs.json](../plan-ga/fg-ga-04.specs.json)

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、common/conventions、code-map、data-files、dev-env、testing、機械守則導航；同槽範本、槽位登記、三種載體與相關載入／結算實作。開場待辦各 1 條，inbox/new 無信。依本線只准新增內容及交付檔的邊界，未改 SESSION-LOG。

## 固定驗收 1 — 未通過

manifest base 為 `a1463faeb0712226b1e537e48844e6727829f83f`，與 worktree HEAD 一致。[content_gate](gate.json) 核准指定 14 檔，但整體 exit 1：`content/batches/2026-10/fg-ga-04.json` 不在 allow.kinds，產生 1 個 PATH 違規。該檔開場已有，與領導 manifest 完全相同；本線未改刪或繞過 gate，須由領導處理。

[逐檔核對](content-audit.json) 證實 14 檔的機制、名字、英名與規格完全相同，僅 etymology 經潤飾；每則 2–3 句且保留提案名、掛點與代價。rg 本次核實每個 id 僅有一筆定義：[紀錄](collision-current.log)。10 件部件均 origin=mechanical；部件 attrMods.source 與效果 contribs.source 均為自己的 id。check 驗過合法欄位與既有 registry，本批新檔無警告。最大檔案 1119 bytes，低於 16 KB；git diff HEAD 無任何既有檔修改，黃金、營運 fixture、索引均未改。14 個內容檔之外僅有開場已有的帳本與 node_modules 未追蹤項目。

## 固定驗收 2 — 通過（依使用者覆蓋資源規則）

本次各跑一次 `npm run check`、`npm run typecheck`、`node --test src/rules/state.test.ts`、`node --test src/rules/effects.test.ts`，四個指令均 exit 0。check 末行 `OK 0 errors, 10 warnings`，10 則都是既有 monster.partsOverride 警告，本批新檔無警告；兩個相關單檔測試分別核機體／部件池初始化、層插入，以及效果貢獻與 ownerTurns 撤除。原始紀錄：[check](check.log)、[typecheck](typecheck.log)、[state 單檔](state-test.log)、[effects 單檔](effects-test.log)。

逐檔數值與命名照規格，黃金與營運 fixture 無修改。本次未執行 npm test、test:e2e、sim 或 fuzz 全套；全套依使用者指示交領導收件後跑。test.log 為上一輪既有紀錄，不作本次依據。

## 固定驗收 3 — 失敗

[scratch 結果](smoke.json)、[runner](smoke-runner.mjs) 與 [stdout](smoke-runner.log) 已保存。10 個部件每 seed 各裝一次，保留原武器、系統、有核心的人類駕駛；只取代所選背掛。通常載體為堅盾-II型／mx-biped-c，護舷用棧橋-IV型／m2-keel-b，留翼用虹使-G6／m2-splitwing-a。每件均核槽型與容量、實際 part、每機僅一套。地圖只在 scratch 建構，平地 16×12、對手 3 隻 reaper-c、上限 20 輪。

五 seed 的 runBattle 均零例外、零 rejected，正常 outcome 結束：

- seed 1：11 輪，outcome，兩招各 2／2 次；原始 [log](battle-seed-1.log.json)。
- seed 2：10 輪，outcome，兩招各 2／2 次；原始 [log](battle-seed-2.log.json)。
- seed 3：11 輪，outcome，兩招各 2／2 次；原始 [log](battle-seed-3.log.json)。
- seed 4：8 輪，outcome，兩招各 2／2 次；原始 [log](battle-seed-4.log.json)。
- seed 5：8 輪，outcome，兩招各 2／2 次；原始 [log](battle-seed-5.log.json)。

兩招 AI 總施放各 10 次，均有對應 EffectApplied；AI 缺口為空。人工 tryCommand 另驗：ability/fa-catch-wind 1 次、ability/fa-cover-companion 1 次。兩招均實扣 AP 3、冷卻 3，效果有實際屬性差值及到期事件；轉帆 +12 先手／+8 閃避／-8 準頭、pos 相同，煙護目標距離 2、+10 閃避／-5 準頭、無 Miss。原始事件確認轉風於第 1、煙護於第 2 個 owner turn 到期。煙護後敵人仍能合法攻擊施術者，同伴沒有承受該次攻擊的傷害；沒有傷害轉移或免疫 hooks。

插層核對全部相符：護肘僅左臂 30 armor／pierce 抗性 0.1；護舷兩浮架各 25 armor；留翼兩主翼各 25 armor；守燈僅 torso 35 shield。守燈受損至 30 後回復至 33，同一回合 charge 50→47，符合回復 3 並耗流光 3。壓燼的原有 heat bands 未變，heat=100 仍出現 overheat-1。各項 before／actual／expected 與安裝事件在 smoke.installation 及 install-0 至 install-9.log.json。

不符合的 7 組比較（涉及 5 件部件）如下；屬性均取 unitAttr，只列與同裝法基準的差異，池列實際值：

- 壓燼背艙：initiative 應 -2，實際 0；heat 應 max=130／regen=-11，實際 100／-15。
- 坐砲背座：accuracy／evasion 應 +4／-3，實際 0／0；heat regen 應 -17，實際 -15。
- 高燈背桅：perception／accuracy 應 +4／-3，實際 0／0。
- 留翼背索：initiative 應 -2，實際 0；兩翼加甲已生效。
- 留光背匣：charge max 50→70 已生效、regen 仍 10；開場 cur 仍 50，沒有多出一份 20 流光。

這些是現有結算限制：ComponentDef.attrMods／poolMods 只有型別與 schema，makeUnit 沒有掛入部件貢獻，poolDecls 也未讀 poolMods；initializePools 明定同 id 池 initial 採第一宣告，只有 max／regen 相加。沒有在 scratch 手動補掛貢獻、沒有改 frame 初值冒充成品生效，亦未改正式內容機制。固定條件不符，按交接稿回 FAILED，而非 BLOCKED。

## 固定驗收 4 — 通過

[review.json](review.json) 為 wf-table/1、固定五欄、14 列，每列白話最多 24 字（上限 60）；[naming.json](naming.json) 為 14 列，保留中英名、意涵、掛點與提案狀態；兩表均透過 tabledb 寫入。smoke、完整五 seed 指令／事件、兩招人工使用與安裝原始紀錄齊全。REPORT 低於 12 KB。

## 數值帶外理由、需求與待決

無自行帶外數值；全部照規格暫填。機制資料未變，不因勝率改數值。

請領導收件後跑全套，處理既有批次帳本被 gate 判為 PATH 的問題，並判斷後續是否另派引擎線落實 ComponentDef.attrMods／poolMods，以及確認同名 charge 池的開場初值應否相加；本線無權修引擎或豁免驗收。私有件聲望門檻、骨架相容性 UI、單機一套去重與市場掛接仍依計畫列為後續需求，本批沒有上架、補 lore 或新增 registry。正式 content_accept 與最終 manifest／索引／commit 依交接書由領導處理。

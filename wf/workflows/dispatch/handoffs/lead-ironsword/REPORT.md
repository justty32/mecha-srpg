# lead-ironsword 收線報告（2026-10-26）

[handoffs](../README.md)｜engine-backlog 第 25 列

> 由頂層代存（harness 擋子 agent 寫報告檔）。

## 結論

第 25 列完成：鐵劍 lineage＋models ×5、飛魚 models ×3 入庫，各勢力會研發出鐵劍，`war-armory` 市場會上架。原本懷疑的引擎 bug 不存在，是測試寫死數字；真正成本是戰役黃金為凍結指令腳本，世界軌跡一變就跑不下去，五條全部重錄。

## undefined 根因與驗證

- 根因：研發收入＝規模基數＋每條血統 ×2，通用血統每勢力都算持有；加鐵劍後殘聯收入 18→20。`rnd.test` 把 cost 寫死 40：原 2×18=36 第 3 月才釋出，現 2×20=40 第 2 月就釋出，`rnd.current` 被刪，下一行讀 `.done` 得 undefined。修法：cost 按當下收入算、恰好三個月。
- 驗證（HEAD 17a2fbf 乾淨 worktree＋本線檔）：`npm test` 957／957、`npm run check` 0 錯 8 警告、`npm run typecheck` 0、lore check 0 錯 2 警告。
- 戰鬥黃金 `test/golden/` 未變。戰役 hash 全變（每勢力多 4 個研發候選，抽籤跟著變），前後 hash 在 commit 說明：ops-war-assault 終局 168→132 天；ops-relic 168→252 天；ops-merc-join 四場出擊編號重對應；ops-betrayal、ops-leak、grid-actors、`src/ops/sim/fixtures/campaign-hash.json` hash 變。事件順序與各戰役斷言照舊通過；MCP 戰役 hash 為執行時比對，無寫死值。
- 新增重錄工具 `test/campaigns/rerecord.ts`（照原指令意圖重走）、`golden-spec.ts`（自 campaigns.test.ts 抽出共用）；在 HEAD 上重錄 hash 完全不變。以後軌跡變：先 rerecord，再 `GOLDEN_UPDATE=1`。
- 寫死軌跡數字的測試同步改：idle 終局 104 天無駕駛員→168 天債務扣船；長 wait 終局 90→104 天；grid-health 改 seed 4（seed 1 掉入破產螺旋，遭遇率 1.48；seed 1–5 整體無系統性變差）；MCP 無戰鬥煙霧測試改 seed 8。

## commit

- `00e614e`：內容、測試修正、黃金重錄
- `c12bde6`：收線文件

## 鐵劍確實出現的證據

- 可重跑：`node --test --test-name-pattern="通用鐵劍" src/ops/war/rnd.test.ts`（開局各勢力有 ix-01、war-armory 架上有、研發候選有 ix-ii 與飛魚-II、強制釋出 ix-ii 後上架）。
- 整年模擬（greedy、seed 7、12 蝕月，臨時腳本未入版控）：鐵劍釋出 16 次，第 56 天起各勢力陸續拿到 ix-ii、ix-ii-loom、ix-iii；鹽鷗獵團第 56 天釋出飛魚-II；年底 war-armory 架上有 ix-01、ix-ii、ix-ii-loom。

## 需要使用者決定

1. 通用系拖慢各家招牌機：每勢力多 4 個鐵劍研發選項，殘聯 old-array-ii 約 172→252 天；「每條血統 +2」使研發收入多約 10–20%。要不要通用血統不算收入，或調低通用機型被選權重？（現與長槍、堅盾同規則。）
2. 既有缺口（非本線造成）：無戰鬥模擬中 random 政策可能燃料用光又撞裂獸，迴避、交涉、漂流皆不可選而卡死（改前 seed 4／10／12 即會）。需先定「只剩開打可選時算什麼結果」（判輸或自動脫離）。
3. 飛魚數值暫定：潮鰭血統、鹽鷗獵團製造、限制外流；D／C／B 於第 0／1／3 月可研發，cost 5／15／40，比照劍魚系。lore 第三刃機系列補一行飛魚。

## 後續

- `code-map.json` ops 列、`testing-checks.json` 營運層列待補 rerecord 說明（頂層另派）。
- `lead-codex-pilot/pilot-mech-02/deferred/world/` 已入庫，可刪（刪檔要問使用者）。
- 本線 worktree 已移除；`resist-final` worktree 屬 lead-resist。

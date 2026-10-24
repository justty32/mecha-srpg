# cx-rules-people-flow 已完成六模組、24 測試及三個實跑黃金情境

## 做了什麼

完成士氣、傷勢、意志、控制、戰局流程與目標六個模組。載入時登記 core 信號／動詞／指令；沒有 import combat 六檔。本線單元測試恰好 24 個，分布 5／4／4／4／4／3。測試涵蓋交接書 16 個 constraints id。

依領導 2026-10-24 07:33 order，三個黃金情境使用測試包的獨立人物、框架、身體、能力與物種。依 07:34 order，新檔 gate 已由 26 提升為 32；本線共 31 檔、合計不到 80 KB，低於 200 KB gate。未安裝套件、未改既有他線檔案、未 commit。

固定五條驗收的本機證據如下，未自行增加驗收條件：

1. 最後一次 `npm test` exit 0、`# fail 0`（沙箱顯示 30 個測試檔）；本線恰好 24 個 `test()`，分布 5／4／4／4／4／3。本線加 core 以 `--test-isolation=none` 合計 50/50 通過。`npm run typecheck` exit 0、沒有任何錯誤。
2. 六個實作檔的 export 集合與 contract §6 一致，未 import combat 六檔。
3. 收到 07:39「combat 已合併」order 後執行指定 `GOLDEN_UPDATE=1 node --test test/golden.test.ts`；再以無隔離 TAP 模式確認 8/8、0 skip。三個 people 情境均連跑兩次得到相同 hash，關鍵事件序列通過。捕捉情境 seed 3、依序擊破四肢後拘束；本次完成後的 npm test 再以既有 hash 比對通過。
4. 16 個 constraints id 全在本線測試中；`node src/content/loader.ts content/base test/scenarios/pack` exit 0，`OK 0 errors, 0 warnings`。
5. 本 REPORT 包含指定四段與 SPEC-GAP 清單。

黃金 hash：people-berserk＝`9920324a3e8c36dc`；people-capture＝`f7a55f7012a0b0a0`；people-eject＝`c86ec6aa436d1dfa`。實際輸出暫存於 `/tmp/cx-rules-people-flow-own.tap`、`/tmp/cx-rules-people-flow-golden.tap`、`/tmp/cx-rules-people-flow-final-npm.tap`。

## 產出（全部新檔清單）

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/morale.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/morale.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/injury.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/injury.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/will.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/will.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/control.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/control.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/flow.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/flow.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/objectives.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/objectives.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/people-berserk.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/people-eject.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/people-capture.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/golden/people-berserk.hash`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/golden/people-eject.hash`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/golden/people-capture.hash`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/bodyplans/infantry.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/frames/infantry.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/effects/morale-shaken.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/effects/morale-breaking.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/effects/morale-fleeing.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/effects/berserk.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/persons/pp-burden-pilot.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/frames/pp-capture-rig.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/bodyplans/pp-tidewolf.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/species/pp-tidewolf.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/abilities/pp-break-limb.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/test/scenarios/pack/abilities/pp-restrain.json`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-people-flow/REPORT.md`

## 沒做到或證據不足的

沒有未實跑的情境，三個 hash 都是實際事件日誌的 hash，沒有使用零值占位。沙箱外 npm test 與計數驗收仍依交接書由領導重跑。

整個工作樹有並行工作：content 件數斷言曾隨 base 擴充失敗，已由他線修正，最後 npm test 全綠；typecheck 曾因 combat／AI 尚未齊檔報錯，最後已全綠。無隔離 rules glob 曾讓 combat 的手工 fixture 收到本線信號，產生額外 PoolChanged／士氣／傷勢行為；已寄信告知領導，沒有修改 combat 測試。最終正常隔離的 npm test 通過。

## 需要決定的事

正式 base 內容仍需提供對應的 infantry、morale-*、berserk 及 contract §0 常數，才能不帶 rtest 使用本線規則；由 content-base／領導處理。測試人物 growth 的 base:curve/bb-default 與物種 base:aiprofile/pack-hunter 仍保留參照，戰鬥黃金執行不讀這兩個資料；order 列舉的 frame/component/ability/effect/person/species/bodyplan/terrain 已全部使用 rtest。

## SPEC-GAP 清單

- 共鳴：凍結 WillState 無 deeds/rejects，deeds 不推測完成；空需求回 1，分數夾 0..1。
- 控制自主節點：依交接書以 research 具有 autonomy 鍵計數，不使用尚未入型別的 direction。
- 失控回穩：rt 只保存原 owner，原 controlMode 從最近的 ControlChanged(to=berserk) 事件取回；效果使用 berserk 來源以便撤除。
- 傷勢候選：空傷害／層陣列視為不限；null 層只匹配不限層的候選。
- BattleSetup 沒有 faction Def 對照，以 slot 作 faction 識別。
- spawn 缺 id／owner 規則：採來源加最小空序號、來源 owner，無來源則 faction 或 berserk；無空格不生成。
- hold／escort 未定義完成條件，永不完成；多人 lose 選仍有 active 單位的其他 slot 字典序第一名。
- 無可連結單位的 lootTables，BattleResult.loot 回空陣列；不臆造掉落。

## 以後交接書該點名的工具

無。

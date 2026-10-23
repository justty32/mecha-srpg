# cx-rules-core 五個規則核心模組與固定 26 個測試已交付

## 做了什麼

親讀頂層 AGENTS.md、指定 wf 規矩、test/README.md、contract.md、凍結 core/content 原始碼與三份 spec。沿用前任 state、contribs、pools 與 state 測試，補齊 effects、hooks 與其餘四支測試。沒有新增契約外匯出；沒有 commit、安裝套件或修改其他線的檔案。已發上線 PROGRESS，並在各步驟以 inbox_poll 讀 orders。

固定驗收四條的本機證據如下。

1. `node --test --test-isolation=none --test-reporter=tap 'src/rules/*.test.ts'`：exit 0，tests 26、pass 26、fail 0。五支 test() 數依 state/contribs/pools/effects/hooks 為 5/5/6/6/4。`npm test`：exit 0、fail 0；沙箱僅回報 10 支測試檔，不能據此宣稱沙箱外總案例數。`npm run typecheck`：本線十個檔案 0 錯誤，全專案 exit 1 的外線缺檔見下一段。
2. 五個實作檔的 export function/type 名稱已與 contract §2、§3 逐一比對，完全一致，沒有額外匯出。
3. 七個 constraints id 均在本線測試名稱 grep 得到：DC-C01、DC-T02、DC-T03、DC-T04、DC-T05、DC-T09、DN-M-08。
4. 本 REPORT 已落檔，包含指定四段與 SPEC-GAP 清單。

## 產出（10 個檔的清單）

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/state.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/state.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/contribs.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/contribs.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/pools.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/pools.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/effects.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/effects.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/hooks.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/hooks.test.ts`

上述十檔合計約 67 KB，低於 120 KB；加 REPORT 共 11 個交付檔（其中四個是沿用半成品）。

## 沒做到或證據不足的

沙箱外驗收依交接書由領導重跑。本機 `npm test` 已 exit 0，但沙箱子程序只顯示檔案級結果，不當作完整案例證據。本線 26 個案例使用指定的 isolation=none 跑法全部通過。

全專案 typecheck 現有 13 個錯誤均在本線外：`src/rules/index.ts` 尚找不到 turn、movement、command、attack、layers、conduct、morale、injury、will、control、flow、objectives 十二個模組；`test/golden.test.ts` 因 flow 尚未落地而找不到 BattleSetup 匯出。本線檔案沒有型別錯誤。沒有修改這些外線檔案。

## 需要決定的事

請領導在跨線整合時確保能力線訂閱 `poolDepleted`，依其維持能力鎖／來源格式撤除 `removeOnZero` 的能力。本線依契約發出 `{owner, kind, pool}`，不猜測外線的鎖來源命名。code-map 同步與 commit 仍由領導處理，因本線明文禁止改該文件與 commit。

## SPEC-GAP 清單

state：怪獸 frameView 的修復政策採 repair-or-replace。部件 HP 層依契約附在最內側、非結構層。同名池只有 max/regen 相加，其餘欄位及 initial 採首個宣告。

contribs：最後階段的 min/max 依宣告序套 Math.min/Math.max；無人物時 roleAttr 只採機體屬性（契約已指定）。

pools：同名池其餘欄位採首個宣告。唯一供應部件毀損後保留池記錄、max/regen 基值歸零，夾限沿用原部件宣告。removeOnZero 的能力撤除經 poolDepleted 信號交給能力線，因 core 契約沒有定義維持鎖的來源格式。

effects：field scope 沒有貢獻容器，因此只運行鉤子與 rounds 時鐘。merge 缺 mergeOp 時採 sumMag；合併量記在 magnitude，不隱式縮放已求值的 contribs。

hooks/effects：凍結 RulesRuntime 未提供 dispatch depth，又禁止新增匯出，因此同步分派期間在 pending 放負 uid 的暫存標記。一般實例 uid 從 0 遞增；標記不安裝、不寫事件，finally 移除後才 flushPending，巢狀分派由剩餘標記阻止提早安裝。移除依契約立即退貢獻與執行 onExpire，分派快照跳過已撤者。pool 動作若沒有相符的擁有者就略過，不替內容選座位。

## 以後交接書該點名的工具

無。

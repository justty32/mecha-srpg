# cx-tune-part：效果 location 省略 undefined 空鍵，固定四項驗收完成

## 做了什麼

在指定 worktree 修正 applyEffect 的 location：part、layer、cell、faction 只有在值有定義時才放入 owner；cell 仍複製座標物件。person 與 unit 由既有前置條件保證存在。EffectApplied 的 `part: inst.owner.part ?? null` 保持原樣。

新增兩條回歸，分別檢查 part scope 未給 part、layer scope 未給 layer 時 `Object.hasOwn` 為 false；同時檢查實例的 structuredClone 與 JSON 往返一致，以及事件 payload 維持預期。

固定四項驗收：

1. `node --test --test-isolation=none src/rules/effects.test.ts`：exit 0，8/8 通過（新增 2 條）。先只加入測試、保留舊 effects.ts 執行同指令，exit 1，6 過／2 失敗，兩條都在 Object.hasOwn 的 true !== false 失敗，證明可變紅。
2. `node --test --test-isolation=none test/golden.test.ts`：exit 0，8/8 通過；黃金 hash 不變，未設定 GOLDEN_UPDATE。
3. `npm run typecheck`：exit 0，兩份 tsconfig 檢查皆無錯誤。
4. 本 REPORT 已寫入指定路徑，包含四段與工具附記。

原始驗證輸出保存在 `/tmp/cx-tune-part/effects-red.log`、`effects-green.log`、`golden.log`、`typecheck.log`。開工與各步完成均在主 repo 執行 inbox_poll，未收到新 orders。只執行指定驗收，未加跑其他測試。

## 產出（改動檔清單）

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-part/src/rules/effects.ts`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-part/src/rules/effects.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-part/REPORT.md`

程式 diff 共 2 檔、28 行新增／4 行移除、3,211 bytes，未觸發件數與容量 gate。未 commit；主 repo 程式碼、ops 正規化、spec 與黃金檔皆未修改。開場已存在的未追蹤 node_modules 與 worktree handoffs 目錄未變更。

## 沒做到或證據不足的

無；交接指定驗收均已取得本次執行證據。

## 需要決定的事

無；後續整合與 commit 由領導處理。

以後交接書該點名的工具：無。

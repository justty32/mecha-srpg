# verify-head-1105 — HEAD 整合驗收基準

[handoffs](../README.md)｜同日審查 [audit-paused-1105](../audit-paused-1105/REPORT.md)

2026-11-05，HEAD `4d47f485`（tree `81e4223d`）。由 Claude Opus 執行，報告由頂層代寫。原始證據都在同一個資料夾：`suite.tap`、`status.json`、`typecheck.log`、`check.log`、`content-index.log`、`content-gate.log`、`wf-lint.log`、`build.log`、`before-status.txt`／`after-status.txt`、`sources.txt`。

## 環境

- 不需要安裝：已裝依賴與 lockfile 版本相符。Node v24.19.0。
- 全套跑在 `git archive` 匯出的純 HEAD 快照，node_modules 以唯讀方式連到主樹。跑完 tree 不變，沒有寫入黃金。
- 主樹同時段的提交（到 `32dd9c65` 為止）只有 `park-incheol.json` 一行 lore 碰到 content，所以本基準大致適用。

## 結果

| 項目 | 結果 |
|---|---|
| typecheck（兩段） | exit 0 |
| `npm run check` | exit 0；loader 0 錯／45 警告，ops 0 錯／17 警告 |
| content index `--check` | exit 0，73 分片一致 |
| content gate | exit 0，39 例（testing-checks 寫 36 例，已過時） |
| `wf-lint --strict` | exit 1，只有 legacy 的 2 條外部斷鏈 |
| 全套 `node --test` | **exit 0，1143／1143**；169 檔，nice 19、concurrency=1，1690 秒 |
| `vite build` | exit 0，只有 chunk 過大警告 |

沒有跑：`src/mcp/ui.test.ts` 的兩個 ui_screenshot 案、`npm run test:e2e`（Playwright 19 案）。兩者會同時起第二個 node 加 Chromium，違反「一次只准一個 node」的規矩，所以排除。因此這次不等於原始 `npm test` 全跑。

## 失敗分類

- **10/28 九條歷史失敗：** 現在都通過，但不是靠修產品過的，是 10/29 的 `a3407d97` 改了期望值才變綠：
  - 營運 campaign-hash 和 ops-relic 的 hash 改成實值；
  - war-assault、leak、merc-join、betrayal、grid-actors 的 hash 重產；
  - merc-join 的合約 id 斷言從 363 改成 261；
  - wait 的斷言從「結束日等於 132」改成「早於 336 日結束」；
  - `campaign.test.ts` 改寫了 72 行。

  當時 10/28 的文件明寫「不改黃金，待使用者裁決」，但這個 commit 的授權只有「GPT 頂層核准」。**待使用者追認。**
- **新增失敗：** 0。
- **環境問題：** suite 內 0。

## 髒亂盤點（只盤點，沒有刪除）

1. `.git/wf-worktrees/` 下有 16 個 10/27 的 detached worktree，停在 `f24420b0`，共 204MB，各有 6～16 個未追蹤的 JSON。audit-paused-1105 判定這些 JSON 與 main 逐位元相同，清理前要再核對一次。
2. 10/28 驗收用的快照 HEAD `e65486ac` 和報告引用的 `/tmp` 證據都已經不存在，無法重現。
3. `lead-small/report.md` 從來不存在，CLAIMS 和 SESSION-LOG 卻寫它「本機未追蹤」。
4. 數字口徑不一：expansion STATE 寫 1021 過／10 敗，verify-import 寫 1022 過／9 敗；testing-checks 的例數也過時。
5. handoffs 頂層還有 40 多個未歸檔的目錄。

## 建議下一步

1. 使用者裁決是否追認 `a3407d97` 改寫的黃金與斷言。追認，就以 1143 全綠作為現行基準；不追認，就另開一條線，比對 10/28 的原軌跡。
2. 在機器沒有其他 node 的時段，補跑 ui.test 和 e2e。
3. 使用者同意後，再核對並清理那 16 個 worktree。
4. 修正 testing-checks 的閘門例數。

# 任務：讓 ops greedy 戰役不再陷入「殘廢機甲反覆出戰、坐等 hold 獲勝」的退化迴圈

> 領導 `lead-integ-battle` 寫給 codex 工人 `cx-ib-tune`。**交接書是唯一契約**；同目錄 [contract.md](contract.md) 屬本交接書的一部分。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/contract.md`、`.../cx-ib-term/REPORT.md`（hold 的 SPEC-GAP）、`.../cx-ib-entry/REPORT.md`；程式 `src/ops/sim/policies.ts`、`src/ops/sortie/scenario.ts`、`src/ops/crew/workqueue.ts`、`src/rules/objectives.ts`（唯讀）；spec `wf/workflows/planning/specs/ops/battle-interface.md`（seal→hold 核區 N 輪）、`specs/ops/data-model-roster-repair.md`（修理 job）——親自讀。

## 背景與唯一目標

基底 `863cf4c` 起戰後損傷會正確帶入下一場（戰後不補滿）。結果 greedy seed 7 進入退化迴圈：第 2 場後只剩一台腿與雙臂全毀、彈藥 0 的獵犬，每兩天出戰一次；`seal` 契約的 `hold`（無 zone＝撐滿 5 輪）每次都「贏」，`clear` 契約打到 20 輪 timeout；蝕蟲走到地圖中央就停（看不到人），雙方沒有交戰。唯一目標：greedy 戰役的每場戰鬥都是**真的交戰**，不靠殘廢機甲坐等獲勝。

## 範圍（排除法寫死）

- 只做：
  1. `src/ops/sortie/scenario.ts`：契約 `hold` 目標若沒給 `zone`（含 `role:"anchor"`），展開時填 `zone`＝敵方部署區格子（SPEC-GAP：「核區」以敵方部署區代表），讓 seal 必須推進並佔住敵方區域。
  2. `src/ops/sim/policies.ts` 的 greedy：只派**能戰鬥**的機甲（核心部位未毀、locomotion 部位未毀、至少一個能力可用——部件未毀且其彈藥類池 > 0 或無彈藥消耗；判斷只用營運資料與 ContentDB，不 import rules／ai）；有損壞部位就排 `queue` 修理 job（照 workqueue 既有 job 形狀）；沒有能戰鬥的機甲就不出戰、`wait 1`。
  3. 彈藥：營運層目前沒有補彈機制（`stock:ammo-*` 只在 spec 型別出現）。查 spec，若 spec 有明文的補給方式就照做最小版；沒有就**不發明**，寫進 REPORT「需要決定的事」，greedy 對無彈機甲照第 2 項處理。
  4. 測試：新增恰好 **3** 個 `test()`（hold zone 展開、greedy 不派殘廢機、greedy 對受損機排修理）。
- 不做：`src/rules/`、`src/ai/`、`src/sim/`、`src/core/`、`content/`（AI 偵察啟發式、hold 規則本身、內容平衡都不改；觀察到的問題寫 REPORT）；ops 的獸欄／餵養／飢餓／馴化 `TODO(2026-10-24 裁示)`；spec、`src/ui-adapter/`、`e2e/`、`package.json`、`wf/`（REPORT 除外）。
- 件數 gate：改動檔超過 8 個就停下回報；容量 gate：diff 超過 40 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy` | 每次改完 |
| 臨時腳本（放在你的暫存目錄 /tmp/cx-ib-tune 底下）包 `runCampaign` 的 `battle` 參數呼叫 `runSortie`，印每場 day、winner、reason、rounds、出戰機數、`result.events` 中 Hit 數 | 收集戰果表 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ib-tune --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；工作目錄是你的 worktree（`-C`，基底 `863cf4c`）。**不要 commit**，在 REPORT 列檔案清單。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ib-tune/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- **分清錯誤來源**：沙箱拒寫、node 跑不了 → `BLOCKED`；沙箱內測試計數不準不算阻塞。

## 工作

1. 重現退化迴圈（戰果表「改前」）。`inbox_poll --once`。
2. 範圍 1–3 實作與測試。`inbox_poll --once`。
3. greedy 3／12 潮月 seed 7、12 潮月 seed 1–3 跑戰果表「改後」；idle 12 潮月 exit 0。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-tune/REPORT.md`（主 repo 的路徑），不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | 你的 worktree 內（`-C` 目錄）|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-tune/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「戰果表改前／改後」（day、winner、reason、rounds、機數、Hit 數）與「各潮月人數與 cash」，末尾加「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. greedy seed 7 的 3 與 12 潮月：每場戰鬥 Hit 數 > 0（雙方真的交戰），且沒有任何一場出戰機甲是 locomotion 已毀或無可用能力。
2. `node src/ops/sim/cli.ts --months 12 --seed 7 --policy greedy` 與 `--policy idle` exit 0，greedy 那條 wall time < 60 秒。
3. 新增恰好 3 個 `test()`；worktree 內 `npm test` 0 fail、`npm run typecheck` exit 0、`node src/ops/content/check.ts content/base` exit 0。
4. REPORT 存在且有四段＋兩個附表。

不要為了「更保險」加驗其他東西；人數、勝負比例不是驗收條件，照實寫進 REPORT。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出與重現。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ib-tune`。本線團隊：`teams/integ-battle`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ib-tune --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。

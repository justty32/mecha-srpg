# 任務：在合併 worktree 套用全部 bf 批次的插入需求與年表條目，讓月面、加深、可玩內容接上既有檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ops-content.md`、`content/lore/README.md`（年表排序、`occurs: possible`、tags）、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`（含「重負載限制」）、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md` 第 2 節（引擎事實與接線）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

本輪 bf-moon-01–03、bf-deep-01–06、bf-play-01–08 的新檔已由領導帶進合併 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-merge/`（起點是最新 main；新檔是未追蹤檔）。各批工人沒改任何既有檔，把需求寫在報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-*/inserts.json` 與 `timeline-add.json`。本線唯一目標：**在合併 worktree 把這些需求套到既有檔（只插入），並讓檢查全過**。

## 做法

1. 收集全部 `bf-*/inserts.json`（op 只有 `append`／`setKey`）與 `bf-*/timeline-add.json`；去重（同檔同路徑同值只套一次）。
2. `inserts.json`：`jsonPath` 若是陣列索引（如 `$.entries[122]`），**不照索引**，照 `why` 欄的 date＋title 在現檔重新定位；`append` 已存在的值略過；`setKey` 鍵已存在且值不同 → 不覆蓋，記 REPORT「需要決定」。目標檔不存在、或 value 引用的 id 在 worktree 裡不存在 → 不套，記 REPORT。
3. `timeline-add.json`：插入 `content/lore/timeline.json` 的 `entries`，位置照 README／check.ts 的排序規則（同年 year-only 在帶月份之前）；欄位照既有條目；tags 不在既有用法裡的（例：`地方史`）改成最接近的既有 tag 並記 REPORT；`occurs: possible` 的事件不進年表。
4. 跑檢查並修到過：`node content/lore/check.ts`（0 錯；警告不多於 main 上同指令的數，「事件未入年表」類警告應因第 3 步而減少）、`npm run check`（0 errors）、`npm run typecheck`（0）。修只准改**本線插入的部分**或新檔裡的明顯格式錯（記 REPORT），不改既有內容的原有值。
5. 寫 `bf-merge.manifest.json`（報告目錄）：照 `content/batches/2026-10/bf-play-01.json` 的格式，`id` `bf-merge`、`mode: add`、`allow.kinds` 空陣列、`allow.modify` 列出本線改過的每個既有檔（規則 superset）、`base` 填 `git -C 合併 worktree rev-parse HEAD`。

## 範圍（排除法寫死）

- 只改合併 worktree 內被 inserts／timeline-add 指名的既有檔（只插入），與第 4 步必要的新檔格式修正；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-merge/`。
- 不做：刪檔、改既有值、改 `src/`、`test/`、黃金、`content/index/`、`content/batches/`；不 commit；不跑 `npm test`／e2e／sim／fuzz／`content_accept.sh`（重負載限制）。
- 件數 gate：改到的既有檔超過 80 個就停下回報；容量 gate：任一既有檔增加超過 30 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3` 腳本（放 /tmp 下 cx-bf-merge 子目錄） | 收集、去重、套用 JSON 插入（保留原縮排格式：讀寫用 json 並以既有檔的縮排寫回，寫回後 `git diff --stat` 確認只有插入） |
| `node content/lore/check.ts`、`npm run check`、`npm run typecheck`（在 worktree 根跑；先 `pgrep -fa 'node --test|vitest|playwright|npm run (test|sim|fuzz)'`，有人在跑就等） | 第 4 步 |
| `python3 -I /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/content_gate.py 合併 worktree 報告目錄的 bf-merge.manifest.json` | 第 5 步後自驗只插入 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-merge --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 回報 |

## 資源與禁區

- **可寫程式碼線**（只寫內容）：worktree 與報告目錄；`.git` 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**。
- **分清錯誤來源**：工具壞或沙箱拒寫 → `BLOCKED`；自己打錯 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-merge --up PROGRESS '開始合併 bf 插入需求' < /dev/null`）。
2. 做法 1–5。
3. 寫 REPORT 並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的既有檔 | 合併 worktree 內 |
| REPORT、manifest | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-merge/REPORT.md`、`bf-merge.manifest.json` |

REPORT：已讀清單；套用統計（每批 inserts 幾條套、幾條略過與原因；年表插幾條）；`git -C 合併 worktree diff --stat` 原文；三項檢查末行；需要決定的事（不覆蓋的 setKey、缺 id、改過的 tag）。回覆只要 5 行摘要。

## 驗收（固定 3 條，一條不多，做完就停）

1. worktree 內 lore check 0 錯、`npm run check` 0 errors、`npm run typecheck` exit 0。
2. content_gate 對 bf-merge.manifest.json 回 OK（既有檔只插入）。
3. REPORT 有套用統計與 diff --stat。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修到過；修不好發 `FAILED`，REPORT 寫證據。
- **測不出來** → 保持現狀，發 `BLOCKED`。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-merge`。本線團隊：`teams/bigfill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-merge --up DONE '合併完成：套 N 條插入、年表 M 條，檢查全過' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-merge/REPORT.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`。

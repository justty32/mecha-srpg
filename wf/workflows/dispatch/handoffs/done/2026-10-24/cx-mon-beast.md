# 任務：新增獸族（family `beast`）怪獸內容 38 檔並通過檢查與煙霧對戰

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-world.md`（SpeciesDef／MonsterDef）、`wf/workflows/planning/specs/core/data-model-abilities-effects.md`、`wf/workflows/planning/specs/world/monsters.md` 與 `monsters.json`、`wf/workflows/planning/specs/world/bio-mechs.md`、`wf/workflows/planning/design-notes/bio-mechs.md`、`wf/workflows/planning/design-notes/world.md` 末段（太空歌劇風格）——**親自讀，不靠本交接書的摘要**。**設計契約**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-monster/design.md`（共通規則全段＋「獸族」段；那份是本線唯一數值來源）。範本：`content/base/species/*.json`、`content/base/bodyplans/insect-reaper.json`、`content/base/frames/bio-reaper.json`、`content/base/monsters/*.json`、`content/base/abilities/{reaper-cleave,root-drag,nest-birth,arc-pulse}.json`、`content/base/effects/{rooted,acid-corrode,nest-birth,shard-marked}.json`。

## 背景與唯一目標

本作是 2108 地月機甲對裂獸的太空歌劇風文字 SRPG，怪獸內容很薄（4 種、3 隻）。唯一目標：照 design.md「獸族」段新增該族的 species、bodyplans、bio frames、monsters、`kx-` 能力與效果（與 aiprofile ），全部通過內容檢查、測試與煙霧對戰。

## 範圍（排除法寫死）

- 只做（只新增檔）：`content/base/species/{hound, bulwark, cliffjaw, tidespine}.json`、`content/base/bodyplans/{quadruped-hound, quadruped-bulwark, quadruped-cliffjaw, quadruped-tidespine}.json`、`content/base/frames/{bio-hound, bio-bulwark, bio-cliffjaw, bio-tidespine}.json`、design.md「獸族」段 monsters 列的 8 個 `content/base/monsters/*.json`、`content/base/abilities/{kx-shovel-ram, kx-burrow-flank, kx-carrion-gulp, kx-shield-raise, kx-wall-charge, kx-cliff-bite, kx-star-howl, kx-ground-stomp, kx-tide-crush, kx-spine-sweep}.json`、`content/base/effects/{kx-staggered, kx-gorged, kx-molting, kx-shield-wall, kx-deep-wound, kx-pack-frenzy, kx-tidal-dread}.json`、`content/base/aiprofiles/kx-beast-alpha.json`；臨時煙霧情境與 runner 放 `/tmp/cx-mon-beast/`；REPORT。
- 不做：改任何既有檔（含既有 species／monsters／frames／bodyplans／abilities／effects／aiprofiles、registries、scenarios）；`src/`、`content/base/world/`、`frames/corpse-*`、其他族的 id、spec、`content/README.md`、`pack.json`；不把煙霧情境放進 repo。
- 件數 gate：新檔超過 43 個就停下回報；容量 gate：單檔超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-mon-beast --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-mon-beast --up …` | 上線 PROGRESS 與終局回報 |
| `npm run check`（在專案根） | 每批新增後；要 `OK 0 errors`（若錯誤只指向**別族或別線**的檔，等 2 分鐘重跑，不要去改；仍在就寫 REPORT） |
| `npm test` | 全部寫完後一次；記 pass／fail 數（沙箱內計數可能失真，領導會在外面重跑） |
| `node /tmp/cx-mon-beast/run.ts scenario/{情境名} 1 2 3` | 煙霧對戰（design.md 第五節；runner 從 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/kx-smoke/run.ts` 複製，原檔不改） |
| `git -C /home/lorkhan/repo/game_dev/mecha-srpg log --oneline -- content/lore` | 開工前與收尾前各一次，看風格指南到了沒（design.md 第〇節） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與 `/tmp/cx-mon-beast/`；可跑 `npm run check`、`npm test`、`node` 跑煙霧 runner。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；**不 commit**（commit 由領導做，你只回報改了哪些檔）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：工具或環境出錯（權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的 JSON 或腳本出錯 → 自己修。

## 工作

1. 上線發 PROGRESS；讀先讀清單與 design.md；查 content/lore。
2. 寫 bodyplans、effects、abilities、aiprofile，`npm run check` 綠。
3. 寫 species、bio frames、monsters，`npm run check` 綠；用腳本把每個 bodyplan 的 HP 總量算出來，對照 design.md（±10%）。
4. 煙霧對戰兩場 × 3 seed（design.md 第五節）。
5. `npm test` 一次；再查一次 content/lore，有風格指南就照改名字後重跑 check。
6. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-monster/cx-mon-beast/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` 底下「範圍」列的 38 個新檔 |
| 煙霧情境 | `/tmp/cx-mon-beast/pack/scenarios/`（不進 repo） |

REPORT 四段（做了什麼／產出（每個新檔一行：id、中文名、等級、一句定位；bodyplan 附 HP 總量）／沒做到或證據不足的／需要決定的事），另附煙霧對戰 JSON 行，末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，做完就停）

1. `npm run check` 末行 `OK 0 errors`（warnings 數照實記）。
2. `git status --short content/base` 中本線新增的檔恰為「範圍」列的 38 個，沒有任何 ` M`（既有檔被改）出自本線。
3. 每個 bodyplan HP 總量在 design.md 的 ±10% 內（REPORT 附計算輸出）。
4. 兩場煙霧對戰各 3 seed 都無 THROW，本族新能力至少 2/3 出現在 abilities 計數裡（REPORT 附 JSON 行）。

## 失敗怎麼處置

- 測出來是壞的 → 修到綠；修不好就移除該件並在 REPORT 記，全部都做不出才發 `FAILED`。
- 測不出來（沒跑成）→ 不回滾，發 `BLOCKED`，寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mon-beast`。本線團隊：`teams/content-monster`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-mon-beast --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-monster/cx-mon-beast/REPORT.md`。
- 結束時必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

## 完成證據（lead-content-monster 收線 2026-10-24）

- 終局 DONE（inbox `wf/inbox/mail/lead-content-monster/`）；REPORT `lead-content-monster/cx-mon-beast/REPORT.md`。
- 領導在沙箱外乾淨 worktree（HEAD＋本線新檔）重跑：`npm run check` OK 0 errors／0 warnings、`npm test` 389/389、`npm run typecheck` 綠；煙霧對戰 24 場無 THROW。
- commit：741b916（蟲族）、98dbfcb（獸族）、ae6d0df（異形）、8ac6e43（菌絲）。

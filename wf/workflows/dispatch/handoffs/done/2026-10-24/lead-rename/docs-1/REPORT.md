已讀清單：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1/AGENTS.md`；`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1/wf/workflows/common/user.md`；`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1/wf/workflows/content/polish.md`；`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1/content/lore/style.md`；`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1/wf/workflows/planning/design-notes/terms.md`；`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1/wf/workflows/planning/design-notes/terms-rename.json`。terms-rename.json 已親自以 tabledb find 依古代機、機甲、蝕、專有名詞、保留五類分次讀完。另讀 wf/WORKFLOWS.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/workflows/common/data-files.md、wf/workflows/inbox/README.md 與 PROTOCOL.md。

# cx-rn-d1：docs-1 換詞完成（DONE）

## 做了什麼

33 份允許文件逐檔判讀，32 份修改，共 260 處詞語替換；content-format-ops/world.md 的兩處命中都是保留詞，0 處修改。以下每筆計數是一處詞語替換，並非改動行數。文件路徑均相對隔離 worktree，所有改動檔行數與 HEAD 相同；未新增／刪除 worktree 檔案、未 commit。資料表經 tabledb 讀寫與欄位更新，再保留原行格式以單一 Update 套入每檔。

`wf/workflows/planning/specs/ops/README.md`：6 處；潮月→蝕月 ×2、潮壓→蝕壓 ×1、渡潮船→渡月船 ×1、潮浸→蝕浸 ×1、古代殼→古代機 ×1。

`wf/workflows/planning/specs/ops/architecture-ops.md`：6 處；潮壓→蝕壓 ×1、潮月→蝕月 ×5。

`wf/workflows/planning/specs/ops/battle-interface.md`：3 處；摹機→衍型機 ×1、潮錨→蝕錨 ×1、殼→古代機 ×1。

`wf/workflows/planning/specs/ops/constraints-ops.json`：21 處；殼訊→夢召 ×1、殼→古代機 ×3、潮→蝕潮 ×1、潮月→蝕月 ×8、渡潮船→渡月船 ×2、潮壓→蝕壓 ×2、潮錨→蝕錨 ×1、潮信會→沐蝕會 ×1、摹機→衍型機 ×1、潮浸→蝕浸 ×1。

`wf/workflows/planning/specs/ops/content-format-ops.md`：1 處；渡潮船→渡月船 ×1。

`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`：3 處；殼緣→古緣 ×1、之殼→之軀 ×1、殼目→靈目 ×1。

`wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`：1 處；肩上一面殼→肩上一面裝甲 ×1。

`wf/workflows/planning/specs/ops/content-format-ops/world.md`：0 處；潮退（海岸退水）、大潮（蝕潮節拍）照用。

`wf/workflows/planning/specs/ops/data-model-beasts.md`：19 處；殼釘→鎮釘 ×1、潮月→蝕月 ×11、潮浸→蝕浸 ×3、潮→蝕潮 ×1、摹機→衍型機 ×2、潮信會→沐蝕會 ×1。

`wf/workflows/planning/specs/ops/data-model-diplomacy.md`：13 處；潮月→蝕月 ×5、殼約→古約 ×1、殼→古代機 ×6、潮壓→蝕壓 ×1。

`wf/workflows/planning/specs/ops/data-model-economy-research.md`：10 處；潮月→蝕月 ×7、摹機→衍型機 ×2、殼矢→矢 ×1。

`wf/workflows/planning/specs/ops/data-model-faction-rnd.md`：17 處；摹機→衍型機 ×1、殼→古代機 ×4、潮月→蝕月 ×12。

`wf/workflows/planning/specs/ops/data-model-factions-contracts.md`：4 處；摹機→衍型機 ×3、潮信會→沐蝕會 ×1。

`wf/workflows/planning/specs/ops/data-model-operations-war.md`：11 處；古代殼→古代機 ×2、潮月→蝕月 ×4、殼→古代機 ×4、尋殼→尋墟 ×1。

`wf/workflows/planning/specs/ops/data-model-operations-war/resolution.md`：3 處；潮壓→蝕壓 ×1、潮月→蝕月 ×1、尋殼→尋墟 ×1。

`wf/workflows/planning/specs/ops/data-model-roster-repair.md`：10 處；殼學會→稽古學會 ×2、潮信會→沐蝕會 ×2、殼→古代機 ×1、摹機→衍型機 ×2、潮月→蝕月 ×1、青藏一號殼→青藏一號 ×1、古代殼→古代機 ×1。

`wf/workflows/planning/specs/ops/data-model-world-map.md`：12 處；潮壓→蝕壓 ×6、渡潮船→渡月船 ×2、潮月→蝕月 ×2、殼→古代機 ×2。

`wf/workflows/planning/specs/ops/diplomacy-drivers.json`：11 處；潮月→蝕月 ×4、潮→蝕潮 ×2、殼→古代機 ×5。

`wf/workflows/planning/specs/ops/mercenary-contracts.md`：7 處；潮月→蝕月 ×2、尋殼→尋墟 ×1、殼帶走→古代機帶走 ×1、殼→古代機 ×3。

`wf/workflows/planning/specs/ops/operations-kinds.json`：14 處；潮壓→蝕壓 ×1、潮→蝕潮 ×1、潮錨→蝕錨 ×1、潮月→蝕月 ×6、尋殼→尋墟 ×1、殼→古代機 ×4。

`wf/workflows/planning/specs/ops/overview.md`：2 處；潮月→蝕月 ×2。

`wf/workflows/planning/specs/ops/text-ui-contract.md`：1 處；殼→古代機 ×1。

`wf/workflows/planning/specs/ops/time-and-tick.md`：20 處；潮月→蝕月 ×13、潮壓→蝕壓 ×3、渡潮船→渡月船 ×1、殼→古代機 ×1、潮浸→蝕浸 ×2。

`wf/workflows/planning/specs/ops/war-testing.md`：12 處；潮月→蝕月 ×11、殼→古代機 ×1。

`wf/workflows/planning/specs/ops/world-grid/README.md`：7 處；潮壓→蝕壓 ×2、潮→蝕潮 ×1、渡潮船→渡月船 ×2、潮月→蝕月 ×2。

`wf/workflows/planning/specs/ops/world-grid/actors-and-encounters.md`：2 處；潮月→蝕月 ×1、潮相→蝕相 ×1。

`wf/workflows/planning/specs/ops/world-grid/continents.json`：13 處；潮月→蝕月 ×1、南殼→南墟 ×2、渡潮船→渡月船 ×5、殼學會→稽古學會 ×2、殼最密→墟最密 ×1、潮→蝕潮 ×1、殼→古代機 ×1。

`wf/workflows/planning/specs/ops/world-grid/map-and-terrain.md`：4 處；南殼→南墟 ×1、潮→蝕潮 ×1、殼學會→稽古學會 ×1、渡潮船→渡月船 ×1。

`wf/workflows/planning/specs/ops/world-grid/migration-and-testing.md`：6 處；潮月→蝕月 ×6。

`wf/workflows/planning/specs/ops/world-grid/movement.md`：2 處；潮光→蝕光 ×1、潮月→蝕月 ×1。

`wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md`：12 處；殼在潮旁邊露出→墟在蝕潮旁邊露出 ×1、潮月→蝕月 ×7、潮壓→蝕壓 ×4。

`wf/workflows/planning/specs/ops/world-grid/terrain-layers.json`：6 處；渡潮船→渡月船 ×1、殼常露→墟常露 ×1、潮→蝕潮 ×1、南殼→南墟 ×1、的殼多半→的墟多半 ×1、潮月→蝕月 ×1。

`wf/workflows/planning/specs/ops/world-grid/ui-contract.md`：1 處；渡潮船→渡月船 ×1。

## 產出

文件工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1`。報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/docs-1/REPORT.md`。暫存筆記與完整 grep／lint 證據均在 `/tmp/cx-rn-d1/`，未留入 worktree。

## 驗收（固定四條）

1. 通過：git status --short 只見允許清單內 32 個 M，另有開工前即存在的 `?? node_modules`。件數未超過 33；32 檔前後行數相同。

2. 通過：嚴格 wf-lint 改前與改後輸出逐位元相同，本批改動檔 0 新違規。兩次工具均 exit 1，原因全是既存項，詳見下方證據。

3. 通過：指定 git grep 完整結果共 2959 行；範圍內 74 行與範圍外 2885 行均在下節逐處或按規則列出理由。允許的 33 份文內沒有「古機」「蝕盛」「蝕歇」。

4. 通過：本 REPORT 第一段已讀清單列齊交接書「先讀」全部七個實際路徑（主 repo 與隔離 worktree 的 AGENTS.md 均親讀）。

嚴格 lint 改前／改後共同輸出（除首行 `== .`）：

```text
BROKEN legacy/docs/part1_window_and_loop.md -> ../../../../pas/analysis/python-tcod/tutorial/cpp_libtcod_cookbook.md
BROKEN legacy/docs/part2_battlefield.md -> ../../../../pas/analysis/python-tcod/tutorial/world_gen_cookbook.md
OVERSIZE wf/workflows/inbox/ROSTER.md (10703 bytes > 8192)
BIGLIST wf/workflows/dispatch/CLAIMS.md:9-14 (3614 bytes, table, 6 rows, 0 links)
BIGLIST-LINKS legacy/docs/README.md:13-25 (1289 bytes, table, 13 rows, 11 links)
BIGLIST content/lore/style.md:17-20 (1025 bytes, list, 4 rows, 0 links)
SUMMARY .: broken=2 oversize=1 biglist=2 biglist_links=1 querycmd=0 local=0 residue={{=0 模板說明=0 導入判斷=0 inbox_pending=0
TOTAL broken=2 residue=0 oversize=1 biglist=2 querycmd=0 local=0
```

## 殘留

指定命令 `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-1 grep -nE '殼|摹|潮|鞘' -- wf` 的所有命中以檔案與原行號追溯。範圍內每個詞的重複數亦列出；新名「蝕潮」也會命中此 grep，並非舊詞。

理由：R1＝定案保留的強弱／起落語彙（大潮、退潮，含普通比喻）；R2＝已換成新名蝕潮；R3＝海洋／氣象本義（潮海、潮濕、潮漲、潮退）；R4＝海洋意象能力名「潮歌共鳴」，本段無裂縫週期指涉，依保留海洋意象規則判讀；R5＝「蟲潮」為蟲群湧出的比喻，與表內獸潮同類；R6＝交接書明令不改的連結目標與錨點；R7＝超出 33 份可寫範圍，交接書明令禁止修改（只標出所在檔與行，不宣稱該處用詞正確）。

### 範圍內：74 行

`wf/workflows/planning/specs/ops/README.md:29`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/architecture-ops.md:55`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/battle-interface.md:31`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:64`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:91`："spec_section": "data-model-world-map.md#潮壓-pressure全局隱藏量",（R6：保留原連結）。

`wf/workflows/planning/specs/ops/constraints-ops.json:113`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:169`：蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/constraints-ops.json:174`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:202`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:215`："source": "../world/rifts-and-territory.md#時鐘潮月大潮潮壓",（R6：保留原連結）。

`wf/workflows/planning/specs/ops/constraints-ops.json:216`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:217`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:223`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:236`："source": "../world/rifts-and-territory.md#潮錨與繫各族怎麼撐開裂縫",（R6：保留原連結）。

`wf/workflows/planning/specs/ops/constraints-ops.json:244`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:251`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/constraints-ops.json:420`："spec_section": "data-model-beasts.md#族別維持-sustain不是餵養一潮月一次的族行為",（R6：保留原連結）。

`wf/workflows/planning/specs/ops/constraints-ops.json:469`："spec_section": "data-model-faction-rnd.md#推進tick-第-2f-段每潮月第-1-天",（R6：保留原連結）。

`wf/workflows/planning/specs/ops/content-format-ops.md:22`：潮海 ×1（R3）。

`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md:50`：潮濕 ×1（R3）。

`wf/workflows/planning/specs/ops/content-format-ops/world.md:25`：潮退 ×1（R3）。

`wf/workflows/planning/specs/ops/content-format-ops/world.md:26`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-beasts.md:22`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-beasts.md:28`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-beasts.md:30`：蝕潮 ×1（R2）、大潮 ×2（R1）。

`wf/workflows/planning/specs/ops/data-model-beasts.md:54`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-diplomacy.md:32`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-diplomacy.md:46`：退潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-faction-rnd.md:15`：潮歌 ×1（R4）。

`wf/workflows/planning/specs/ops/data-model-factions-contracts.md:35`：大潮 ×2（R1）。

`wf/workflows/planning/specs/ops/data-model-operations-war.md:38`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-operations-war/resolution.md:7`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-operations-war/resolution.md:15`：大潮 ×2（R1）。

`wf/workflows/planning/specs/ops/data-model-world-map.md:18`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-world-map.md:21`：大潮 ×6（R1）。

`wf/workflows/planning/specs/ops/data-model-world-map.md:25`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-world-map.md:41`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/data-model-world-map.md:50`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/diplomacy-drivers.json:6`：大潮 ×1（R1）、蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/diplomacy-drivers.json:7`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/diplomacy-drivers.json:17`：大潮 ×2（R1）、蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/operations-kinds.json:4`：蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/operations-kinds.json:6`：大潮 ×5（R1）。

`wf/workflows/planning/specs/ops/operations-kinds.json:12`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/text-ui-contract.md:34`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:1`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:5`：大潮 ×2（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:11`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:20`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:21`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:29`：大潮 ×3（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:35`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:37`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:39`：大潮 ×4（R1）。

`wf/workflows/planning/specs/ops/time-and-tick.md:43`：大潮 ×2（R1）。

`wf/workflows/planning/specs/ops/world-grid/README.md:9`：蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/world-grid/README.md:35`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/README.md:37`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/actors-and-encounters.md:14`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/actors-and-encounters.md:20`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/continents.json:28`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/continents.json:76`：蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/world-grid/map-and-terrain.md:7`：蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/world-grid/map-and-terrain.md:15`：潮海 ×1（R3）。

`wf/workflows/planning/specs/ops/world-grid/map-and-terrain.md:58`：潮海 ×2（R3）。

`wf/workflows/planning/specs/ops/world-grid/movement.md:7`：潮海 ×1（R3）、大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md:12`：蟲潮 ×1（R5）、蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md:21`：大潮 ×3（R1）、潮海 ×1（R3）。

`wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md:33`：大潮 ×1（R1）。

`wf/workflows/planning/specs/ops/world-grid/rifts-on-grid.md:35`：潮海 ×1（R3）。

`wf/workflows/planning/specs/ops/world-grid/terrain-layers.json:20`：潮海 ×1（R3）。

`wf/workflows/planning/specs/ops/world-grid/terrain-layers.json:40`：潮漲 ×1（R3）、潮退 ×1（R3）。

`wf/workflows/planning/specs/ops/world-grid/terrain-layers.json:100`：蝕潮 ×1（R2）。

`wf/workflows/planning/specs/ops/world-grid/ui-contract.md:40`：大潮 ×1（R1）。

### 範圍外：2885 行，366 份檔案

以下全部套用 R7；每個列出的行號都是指定 grep 的一筆命中，包含其他批次文件、歷史引文、定案表與交接文件，均不越界改動。

`wf/inbox/done/2026-10-24/mail/lead-integ-battle/20261024T0921-cx-ib-term-DONE.md`：18, 29, 31（R7）。

`wf/inbox/done/2026-10-24/mail/lead-integ-battle/20261024T0934-cx-ib-entry-PROGRESS.md`：7, 23, 92（R7）。

`wf/inbox/done/2026-10-24/mail/lead-integ-battle/20261024T0935-cx-ib-entry-DONE.md`：25, 94（R7）。

`wf/inbox/done/2026-10-24/mail/lead-integ-battle/20261024T0948-cx-ib-tune-DONE.md`：7, 23, 24, 26, 30, 43, 51, 53, 55（R7）。

`wf/inbox/done/2026-10-24/messages.json`：84, 93, 264, 381, 408, 417, 418, 480, 481, 489, 490, 525, 552, 553, 696, 697, 705, 741, 768, 777, 813, 840, 894, 895, 912, 921, 930, 948, 957, 1002, 1128, 1146, 1227, 1317, 1335, 1380, 1389, 1488, 1551, 1560, 1596, 1614, 1776, 1785, 1786, 1929, 1992, 2001, 2019, 2037, 2082, 2100, 2109, 2127, 2217, 2226, 2235, 2236, 2244, 2262, 2263, 2271, 2289, 2469, 2496（R7）。

`wf/inbox/done/2026-10-24/orders/cx-anc-a.md`：3（R7）。

`wf/inbox/done/2026-10-24/orders/cx-anc-b.md`：3（R7）。

`wf/inbox/done/2026-10-24/orders/cx-anc-c.md`：3（R7）。

`wf/inbox/done/2026-10-24/orders/cx-bal.md`：4（R7）。

`wf/inbox/done/2026-10-24/orders/cx-bal2.md`：8, 12（R7）。

`wf/inbox/done/2026-10-24/orders/cx-bat-field.md`：3（R7）。

`wf/inbox/done/2026-10-24/orders/cx-gb-probe.md`：3, 4（R7）。

`wf/inbox/done/2026-10-24/orders/cx-ops-debt.md`：11（R7）。

`wf/inbox/done/2026-10-24/orders/cx-ops-fix.md`：3（R7）。

`wf/inbox/done/2026-10-24/orders/cx-pilot-iron.md`：3, 6（R7）。

`wf/inbox/done/2026-10-24/orders/cx-war-merc.md`：3（R7）。

`wf/inbox/done/2026-10-24/orders/cx-war-sim.md`：6（R7）。

`wf/tools/test_content_gate.py`：22, 185（R7）。

`wf/workflows/common/code-map.json`：45, 51, 57（R7）。

`wf/workflows/common/code-map.md`：17（R7）。

`wf/workflows/content/abilities-effects.md`：26（R7）。

`wf/workflows/content/acceptance-playtest.md`：33, 39（R7）。

`wf/workflows/content/ancient-people.md`：7, 11, 15, 23, 27, 31（R7）。

`wf/workflows/content/battle-field.md`：12, 20, 24, 33, 35（R7）。

`wf/workflows/content/bio-monsters.md`：11, 24, 28, 34, 36, 40（R7）。

`wf/workflows/content/engine-facts.json`：19, 21（R7）。

`wf/workflows/content/lore-text.md`：9, 11, 27, 29（R7）。

`wf/workflows/content/mechs.md`：1, 5, 15, 19, 29, 39, 40, 48, 50（R7）。

`wf/workflows/content/numeric-bands.json`：19, 30, 41, 52, 63, 103, 159, 280（R7）。

`wf/workflows/content/numeric-bands.md`：7, 9, 15, 23, 24（R7）。

`wf/workflows/content/ops-content.md`：5, 13, 19, 23, 29（R7）。

`wf/workflows/content/playtest-baselines.json`：5, 8, 9, 10, 11, 12, 13（R7）。

`wf/workflows/content/polish.md`：16, 18（R7）。

`wf/workflows/content/templates.json`：8, 9, 18（R7）。

`wf/workflows/content/world-pillars.md`：21, 25, 29, 31（R7）。

`wf/workflows/content/world-pillars/bio-battle/battle.md`：15, 22, 29（R7）。

`wf/workflows/content/world-pillars/bio-battle/bio.md`：22（R7）。

`wf/workflows/content/world-pillars/mechs/ancient.md`：9（R7）。

`wf/workflows/content/world-pillars/mechs/bonds.md`：37（R7）。

`wf/workflows/content/world-pillars/mechs/mechanical.md`：15, 16（R7）。

`wf/workflows/content/world-pillars/world/factions-and-sandbox.md`：22, 29（R7）。

`wf/workflows/content/world-pillars/world/monsters.md`：15, 16（R7）。

`wf/workflows/content/world-pillars/world/tone-and-rules.md`：8, 22, 23（R7）。

`wf/workflows/decisions/2026-10-23-battle-defaults.md`：15（R7）。

`wf/workflows/decisions/2026-10-24-bio-ui.md`：9, 11（R7）。

`wf/workflows/decisions/2026-10-24-spec-integrate.md`：7（R7）。

`wf/workflows/dispatch/content-batch.md`：5, 38（R7）。

`wf/workflows/dispatch/handoffs/codex-batches.json`：21（R7）。

`wf/workflows/dispatch/handoffs/codex-handover.md`：32, 34, 40, 49（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-23/plan-world/REPORT.md`：1, 10, 11, 24, 31, 38, 46, 47, 50, 55, 57（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ai-objective/battle-bench.ts`：3（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/REPORT.md`：9, 13, 35（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/catalog.json`：23, 34, 35, 370, 371, 395, 406, 407, 418, 430, 431, 442, 443, 467, 479, 490, 503, 550, 574, 586, 587, 923, 1115, 1116, 1117, 1118, 1128, 1129, 1130, 1176, 1177, 1178, 1201, 1202, 1237, 1238, 1248, 1249, 1250, 1283, 1355, 1427, 1451, 1475, 1499, 1511, 1516, 1523, 1535, 1595（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/cx-anc-a/REPORT.md`：5, 7, 24, 25, 39, 41, 42, 52, 62, 64（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/cx-anc-b/REPORT.md`：7, 15, 19, 20, 48, 60（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/cx-anc-c/REPORT.md`：18, 39, 40, 44, 48, 53, 56, 57, 62, 64, 68, 72, 86, 88, 90（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-ancient/design.md`：27, 29, 30, 33, 38, 48, 51（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/REPORT.md`：11, 13, 14, 18（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/catalog.json`：87, 94, 164, 192, 234, 241, 269, 318, 325, 360, 388, 437, 444, 465, 486, 493, 514（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-field.md`：3, 23, 31, 32, 49, 55, 56, 60（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-field/REPORT.md`：9, 25, 31, 37, 38, 42（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-field/gen_maps.py`：73, 109, 115, 139（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-scen-a.md`：26（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-scen-a/REPORT.md`：23, 24, 27, 28, 30（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-scen-b.md`：24, 25, 29（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-scen-b/REPORT.md`：7, 17, 18, 19, 22（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-scen-c.md`：24, 25, 28（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-battle/cx-bat-scen-c/REPORT.md`：9, 11, 18, 20, 26, 32（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/REPORT.md`：9, 10, 15, 20, 22, 38（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/catalog.json`：24, 25, 38, 49, 50, 51, 63, 75, 77, 88, 89, 90, 101, 102, 103, 114, 115, 116, 127, 129, 140, 142, 205, 297, 298, 300, 311, 324, 336, 337, 338, 350, 351, 363, 376, 389, 402, 414, 415, 428, 429, 440, 441, 442, 454, 467, 479, 480, 481, 493, 506, 519, 532, 533, 545, 546, 557, 558, 571, 583, 584, 585, 597, 609, 610, 611, 623, 624, 635, 636, 637, 648, 649, 660, 661, 662, 663, 674, 675, 961, 987, 1026, 1052, 1078, 1104, 1129, 1130, 1155, 1156, 1181, 1182, 1207, 1208, 1246, 1247, 1272, 1273, 1311, 1312, 1350, 1351, 1376, 1377, 1414, 1415, 1416, 1427, 1441, 1442, 1467, 1468, 1492, 1493, 1519, 1520, 1545, 1546, 1584, 1585, 1624, 1635, 1637, 1648, 1649, 1663, 1676, 1713, 1715, 1726, 1752, 1753, 1754, 1791, 1793, 1806, 1845, 1858, 1884, 1896, 1897, 1923, 1960, 1961, 1962, 2025, 2027, 2038, 2040, 2051（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/cx-mx-arms.md`：9, 14（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/cx-mx-body.md`：9, 14（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/cx-mx-sys.md`：9, 14（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-mech/manifest.json`：28, 40, 42, 54, 70, 80, 82, 94, 96, 98, 108, 110, 112, 122, 124, 126, 136, 138, 140, 150, 152, 220, 322, 324, 364, 365, 379, 448, 463, 476, 477, 518, 519, 575, 589, 602, 630, 631, 658, 659, 673, 686, 687, 700, 710, 714, 715, 728, 1217, 1218, 1245, 1273, 1301, 1343, 1371, 1413, 1414, 1455, 1483, 1522, 1525, 1526, 1536, 1553, 1581, 1606, 1609, 1610, 1637, 1665, 1708, 1760, 1774, 1777, 1778, 1844, 1858, 1886, 1890, 1928, 2044, 2110, 2112, 2114, 2180, 2182, 2194, 2196, 2208（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/REPORT.md`：22, 23（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/catalog.json`：57, 113, 273, 275, 437, 453, 455, 588, 633, 671, 759, 761, 797, 806, 815, 824, 958, 959, 968, 977, 986, 1013, 1022, 1085, 1110, 1112（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/cx-mon-alien/REPORT.md`：27, 49, 50（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/cx-mon-beast/REPORT.md`：28, 32, 34, 41, 43, 45, 47, 48, 50, 51, 52, 53, 55, 57（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/cx-mon-insect/REPORT.md`：26, 38, 39, 43（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/cx-mon-mycel/REPORT.md`：19, 23, 27, 33, 34（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/design.md`：8, 9, 41, 47, 48, 49, 61, 62, 74, 88（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-polish/REPORT.md`：3, 6, 8, 12, 18（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-polish/catalog.json`：94, 465, 500, 507, 528, 556, 563, 570, 577, 584, 591, 598, 605, 612（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/REPORT.md`：5, 11, 24, 25, 40（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/catalog.json`：74, 81, 95, 467, 474, 544, 558, 565, 572, 579, 607, 635, 705, 740, 872, 879, 900, 921（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-data.md`：19, 21, 24, 30（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-data/REPORT.md`：23, 32, 40, 41, 43, 44（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-data/outputs-contracts.csv`：2, 3, 6, 10（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-data/outputs-names.csv`：11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-data/outputs-places.csv`：13, 16, 17, 19（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-data/outputs-research.csv`：3, 4, 7, 10（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-dlg.md`：19（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-dlg/REPORT.md`：23, 24, 39, 41, 49（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-ev-a.md`：7, 21（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-ev-b.md`：7, 21, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/cx-world-ev-b/REPORT.md`：25, 36, 39（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-world/engine-rules.md`：10, 28, 39, 53（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/REPORT.md`：8, 55（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-check/REPORT.md`：39（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-engine.md`：1, 5, 9, 21（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-engine/REPORT.md`：13（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-intent.md`：17, 19（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-intent/REPORT.md`：11, 22（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-load.md`：1, 9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-load/REPORT.md`：7, 108（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-probe.md`：16, 17（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-battle/cx-gb-probe/REPORT.md`：31, 62, 87, 120, 121, 122, 123, 161, 162, 196（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/REPORT.md`：6, 23, 40, 43, 48（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-board.md`：17, 74（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-board/REPORT.md`：22, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-debt.md`：1, 9, 15, 25, 55（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-debt/REPORT.md`：7, 19, 38, 62（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-enc.md`：14, 16（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-enc/REPORT.md`：21, 69, 77（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-fix.md`：48, 59（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-fix/REPORT.md`：43, 47, 49（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-intent.md`：16（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-intent/REPORT.md`：27, 33（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-retreat.md`：15, 63（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-ops-retreat/REPORT.md`：15, 47, 49（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim.md`：1, 9, 13, 14, 17, 62, 69, 70, 71（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/REPORT.md`：5, 7, 9, 16, 35, 36, 44, 46, 108, 173, 175, 183, 187（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/after-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/after-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/after-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/before-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/before-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/before-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/both-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/both-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/both-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/greedy-12-seed-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/greedy-24-seed-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/idle-12-seed-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/idle-12-seed-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/idle-12-seed-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/idle-24-seed-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/idle-24-seed-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/idle-24-seed-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/merc-12-seed-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/merc-12-seed-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/merc-12-seed-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/merc-24-seed-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/merc-24-seed-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/merc-24-seed-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/only-rivalry-1.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/only-rivalry-2.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/only-rivalry-3.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/only-seize-1.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/only-seize-2.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/only-seize-3.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/without-flag-idle-24-seed-1.log`：1, 2, 3, 4, 5, 6（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/cx-war-sim/without-flag-merc-24-seed-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ai/contract.md`：42（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base/REPORT.md`：36, 37, 38, 39, 46, 48, 49, 54（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base/contract.md`：19, 22, 29, 42, 44, 68（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base/cx-content-mechs.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base/cx-content-mechs/REPORT.md`：5（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base/cx-content-world.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-content-base/cx-content-world/REPORT.md`：5（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/REPORT.md`：11, 19（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/contract.md`：17, 54（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-crew.md`：14, 22（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-foundation/REPORT.md`：108, 112, 162（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-sortie/REPORT.md`：46（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-time.md`：9, 13, 21, 28, 53, 65, 70（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-time/REPORT.md`：12, 57, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 79（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-world.md`：9, 14, 23（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-ops/cx-ops-world/REPORT.md`：5, 96（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-rules/REPORT.md`：11, 54（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-rules/cx-rules-combat.md`：27（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/REPORT.md`：11, 15, 16, 18, 24, 30, 33（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-ops-board.md`：17, 70（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-ops-fix.md`：48, 59（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core.md`：18, 19, 20, 22, 24, 56, 69, 76, 77（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core/REPORT.md`：9, 16, 38, 40（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core/idle-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core/idle-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core/idle-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core/regressions.log`：32, 33, 272, 273, 284, 285（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-core/spec-gaps.json`：23, 24, 44（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc.md`：18, 20, 22, 58, 71（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/REPORT.md`：5, 12, 13, 22, 40, 97, 103（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/greedy-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/idle-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/merc-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/merc-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/merc-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/ops-test.log`：1, 2, 20, 27, 33, 37, 38, 39, 40, 41, 66, 74, 98, 107, 126, 135, 137, 138, 139, 145, 190, 192, 218, 220, 224, 228, 230, 231（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/simulation.json`：115, 121, 127, 133, 139, 145, 151, 157, 163, 169, 175, 181, 270, 276, 282, 288, 294, 300, 306, 312, 318, 324, 330, 336, 686, 692, 698, 704, 710, 716, 722, 728, 734, 740, 746, 752（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/spec-gaps.json`：19, 28, 29, 58, 59（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-merc/unit.log`：15, 34（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd.md`：9, 14, 15, 16, 19, 20, 23, 24, 40, 58, 69, 74, 76（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/REPORT.md`：5, 7, 9, 21, 37（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/acceptance.json`：19, 29（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/idle-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/idle-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/idle-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/rnd-tests.log`：11, 13, 14, 15, 21, 30, 32（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/spec-gaps.json`：14, 19, 24, 34, 68（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-rnd/types.json`：19, 39（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/cx-war-sim.md`：1, 9, 13, 14, 61, 68, 69, 70（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-greedy-12-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-greedy-24-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-idle-24-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-idle-24-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-idle-24-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-merc-12-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-merc-24-1.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-merc-24-2.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-war/sim/run-merc-24-3.log`：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/REPORT.md`：15, 18, 33（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/cx-ib-entry/REPORT.md`：17, 86（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/cx-ib-term.md`：9, 44, 57, 62（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/cx-ib-term/REPORT.md`：10, 21, 23（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/cx-ib-tune.md`：40, 52, 56（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-integ-battle/cx-ib-tune/REPORT.md`：15, 16, 18, 22, 35, 43, 45, 47（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-mcp/cx-mcp-core/REPORT.md`：39, 46, 47, 48（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-mcp/cx-mcp-ops.md`：9, 19（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-mcp/cx-mcp-ops/REPORT.md`：31（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/REPORT.md`：5, 10, 40, 47（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/cx-bal.md`：1, 11, 19, 26, 63（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/cx-bal/REPORT.md`：6, 7, 8, 21, 25, 35（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/cx-bal2.md`：9, 14, 24, 62（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/cx-bal2/REPORT.md`：1, 16, 20, 21, 32, 35, 41, 76, 78, 93, 99, 102, 105（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/cx-bio.md`：9, 15, 16, 18, 31（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ops-bio-balance/cx-bio/REPORT.md`：5（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/REPORT.md`：13（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/cx-pt-mcpb.md`：15（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/cx-pt-mcpb/REPORT.md`：7, 28, 48（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/cx-pt-mcpc.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/cx-pt-mcpc/REPORT.md`：27, 39, 40（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/cx-pt-sortie/REPORT.md`：29（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/issues.json`：187, 297, 396（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/r1/p1.json`：30, 31, 32, 38, 43（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/r1/p2.json`：3, 4, 11, 12, 16, 59, 60, 61, 64, 80, 96（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/r1/p3.json`：7, 22, 23, 35, 64（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/r1/p4.json`：5, 14, 30, 34, 36, 55, 64, 71, 86（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/r1/p5.json`：15, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/r1/p6.json`：4, 53, 87, 93（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/anchored-tally.ts`：1（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/cx-tb-aim.md`：1, 11, 34（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ui-fix/contract.md`：28（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ui-ops/REPORT.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ui-ops/cx-uops-vm.md`：27（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ui-ops/op-uops-dom.md`：17, 26（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ui-ops/op-uops-dom/REPORT.md`：6, 7, 21（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/REPORT.md`：3, 15（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/contract.md`：39, 59, 69（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-cards.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-dom.md`：9, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-index.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-lore.md`：22（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-md.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-shell.md`：1, 9, 15, 24（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-wiki/cx-wiki-shell/REPORT.md`：1（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-content-guide/REPORT.md`：9, 15, 27（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-lore/REPORT.md`：1, 17, 21, 22, 27, 31, 32, 33, 35, 36, 41（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-ops-spec.md`：9（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-ops-spec/REPORT.md`：28, 32, 40, 52, 60, 63（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-ops-war/REPORT.md`：10, 13（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-spec-integrate/REPORT.md`：9, 12, 15, 16（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-spec-sync/REPORT.md`：17, 18, 26, 27, 58（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-spec/REPORT.md`：40, 74（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-world-grid/REPORT.md`：9, 12, 13, 21, 39, 42（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-world-v2.md`：1, 9, 70（R7）。

`wf/workflows/dispatch/handoffs/done/2026-10-24/plan-world-v2/REPORT.md`：1, 22, 24, 25, 32, 33, 38, 40, 42, 44, 48, 50, 52, 54, 58, 62, 63, 66, 70, 72, 74, 75, 78, 82, 84（R7）。

`wf/workflows/dispatch/handoffs/done/README.md`：12（R7）。

`wf/workflows/dispatch/handoffs/engine-backlog.json`：21, 56, 120, 144, 182, 227（R7）。

`wf/workflows/dispatch/handoffs/engine-backlog.md`：14（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/REPORT.md`：32（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/cx-pilot-iron.md`：20, 79（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/cx-pilot-mech.md`：1, 7, 42（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/naming-review/pilot-mech-01-names.txt`：1, 3, 5, 6, 10（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/naming-review/pilot-mech-02-names.txt`：9（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-lore-01/REPORT.md`：92（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/REPORT.md`：44, 51, 53, 68, 70, 72, 73, 74, 84, 88, 94, 135, 139, 161（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/probe-ref.json`：8, 9, 10, 11, 329, 333（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/probe-ref.txt`：2, 14（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/probe-verdict.json`：24, 25, 93, 94, 144, 145（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/probe.json`：8, 9, 10, 11, 307, 311, 1122, 1126, 1711, 1715（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/probe.txt`：2, 16, 50, 70（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/verdict-1.json`：53, 54, 119, 120, 169, 170（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/verdict-2.json`：53, 54, 120, 121, 171, 172（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/verdict-3.json`：53, 54, 122, 123, 173, 174（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/accept/verdict.json`：53, 54, 122, 123, 173, 174（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/mcp-log/m1.txt`：6, 8, 10, 12, 14, 16, 20, 22, 26, 28, 30, 34, 36, 38, 40, 42, 44, 46, 50, 52（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/mcp-log/m2.txt`：2, 4, 6, 8（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/mcp-log/m3.txt`：2, 4, 6, 8（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/mcp-log/m4-round2.txt`：5, 7, 9, 11（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/round0-BLOCKED-REPORT.md`：49, 50, 51, 53, 55, 56, 62, 66, 70（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/round1-BLOCKED-REPORT.md`：49, 51, 53, 55, 67, 71, 75, 98, 101, 103, 105（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-01/round2-order.md`：6（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/accept/probe-ref.json`：8, 9, 10, 11, 967, 971, 1292, 1296（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/accept/probe-ref.txt`：2, 34, 44（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/accept/probe.json`：8, 9, 10, 11（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/accept/probe.txt`：2（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/mcp-log/m1.txt`：5, 9, 17, 23, 29, 53, 55, 57, 59, 61, 63, 67, 69, 71, 75, 79, 81, 85, 87, 89, 91, 95, 99, 105, 107, 109, 111, 113, 121, 135, 143, 147, 153（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/mcp-log/m2.txt`：5, 7, 9（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/mcp-log/m3.txt`：2, 6（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/mcp-log/r2m1.txt`：4, 6, 8, 14, 34, 56, 58, 60, 70, 72, 74, 78, 84, 86, 94, 96, 98, 102, 106, 108, 110, 114, 118, 120, 122, 126, 136, 148, 150, 154, 164, 168, 172, 174, 176, 184, 194, 200, 202, 204, 208, 212, 224, 228, 230, 252, 254（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/mcp-log/r2m2.txt`：2, 6（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/mcp-log/r2m3.txt`：4, 8（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/naming.json`：73（R7）。

`wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-polish-01/REPORT.md`：45, 71, 73, 133, 137, 163, 167, 177, 181, 255, 259, 263（R7）。

`wf/workflows/dispatch/handoffs/lead-content/cx-lc-lore.md`：20, 75（R7）。

`wf/workflows/dispatch/handoffs/lead-content/cx-lc-lore2.md`：20, 75（R7）。

`wf/workflows/dispatch/handoffs/lead-content/cx-lc-mech.md`：14, 19, 78（R7）。

`wf/workflows/dispatch/handoffs/lead-content/cx-lc-ops.md`：14, 20, 76（R7）。

`wf/workflows/dispatch/handoffs/lead-grid/PLAN.md`：15, 17（R7）。

`wf/workflows/dispatch/handoffs/lead-grid/cx-grid-core.md`：15, 16, 42（R7）。

`wf/workflows/dispatch/handoffs/lead-grid/cx-grid-maps.md`：18, 20（R7）。

`wf/workflows/dispatch/handoffs/lead-grid/cx-grid-maps/REPORT.md`：17, 32（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-01.md`：7, 37, 38, 39, 40, 41, 50, 84（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-02.md`：7, 37, 38, 39, 40, 41, 50, 84（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-03.md`：7, 36, 37, 38, 39, 40, 49, 83（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-04.md`：7, 36, 37, 38, 39, 40, 49, 83（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-05.md`：7, 36, 37, 38, 39, 40, 49, 83（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-06.md`：7, 34, 35, 36, 37, 38, 47, 81（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-07.md`：7, 34, 35, 36, 37, 38, 47, 81（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-08.md`：7, 34, 35, 36, 37, 38, 47, 81（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-09.md`：7, 33, 34, 35, 36, 37, 46, 80（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-10.md`：7, 37, 38, 39, 40, 41, 50, 84（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-11.md`：7, 36, 37, 38, 39, 40, 49, 83（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-12.md`：7, 38, 39, 40, 41, 42, 51, 85（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-13.md`：7, 37, 38, 39, 40, 41, 50, 84（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-14.md`：7, 35, 36, 37, 38, 39, 48, 82（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-15.md`：7, 36, 37, 38, 39, 40, 49, 83（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-16.md`：7, 33, 34, 35, 36, 37, 46, 80（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-17.md`：7, 29, 30, 31, 32, 33, 42, 76（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-d1.md`：51, 52, 53, 54, 62（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-d2.md`：38, 39, 40, 41, 49（R7）。

`wf/workflows/dispatch/handoffs/lead-rename/cx-rn-d3.md`：47, 48, 49, 50, 58（R7）。

`wf/workflows/dispatch/handoffs/lead-wrapup/REPORT.md`：12（R7）。

`wf/workflows/inbox/archive/ROSTER-2026-10-24-b.md`：152（R7）。

`wf/workflows/planning-roadmap.json`：32, 37（R7）。

`wf/workflows/planning/design-notes.md`：16, 20（R7）。

`wf/workflows/planning/design-notes/bio-mechs.md`：7（R7）。

`wf/workflows/planning/design-notes/mechanics.md`：30, 32（R7）。

`wf/workflows/planning/design-notes/mechs/mechanical.md`：7（R7）。

`wf/workflows/planning/design-notes/terms-rename.json`：16, 24, 28, 32, 40, 41, 44, 48, 52, 56, 60, 64, 68, 72, 80, 88, 92, 96, 100, 104, 108, 112, 120, 124, 128, 132, 136, 140, 144, 152, 160, 168, 172, 176, 180, 184, 188, 192, 200, 204, 208, 216, 220, 224, 232, 236, 240, 241, 248, 249, 256, 264, 272, 276, 280, 288, 296, 300, 304, 312, 320, 321, 328, 336, 344, 352, 360, 368, 376, 384, 392, 400, 408, 416, 424, 432, 436, 440, 448, 456, 464, 472, 480, 488, 496, 504, 508, 512, 520, 528, 532, 544, 548（R7）。

`wf/workflows/planning/design-notes/terms.md`：5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 30, 32, 34, 36, 38（R7）。

`wf/workflows/planning/design-notes/world/rules.md`：19（R7）。

`wf/workflows/planning/design-notes/world/setting.md`：13（R7）。

`wf/workflows/planning/specs/core/README.md`：5, 60, 61, 62, 65（R7）。

`wf/workflows/planning/specs/core/ai.md`：41, 45（R7）。

`wf/workflows/planning/specs/core/content-format.md`：32, 55（R7）。

`wf/workflows/planning/specs/core/data-model-abilities-effects.md`：16（R7）。

`wf/workflows/planning/specs/core/data-model-people.md`：64, 71（R7）。

`wf/workflows/planning/specs/core/glossary.json`：241（R7）。

`wf/workflows/planning/specs/core/rules-attack-resolution.md`：55（R7）。

`wf/workflows/planning/specs/core/rules-turn-and-actions.md`：15（R7）。

`wf/workflows/planning/specs/world/README.md`：5, 9, 13, 20, 22, 24, 26, 28, 33, 35（R7）。

`wf/workflows/planning/specs/world/bio-mechs.md`：11, 15, 21（R7）。

`wf/workflows/planning/specs/world/factions.md`：11, 21, 25, 31, 41, 51, 61（R7）。

`wf/workflows/planning/specs/world/machine-souls.md`：11, 21, 41, 43（R7）。

`wf/workflows/planning/specs/world/mech-lifecycles.md`：11, 27, 31, 33, 35, 55, 59, 65（R7）。

`wf/workflows/planning/specs/world/monsters.json`：26, 29, 31, 33, 56, 57, 59, 60, 71, 98, 113, 144, 145, 171, 182, 184, 185（R7）。

`wf/workflows/planning/specs/world/monsters.md`：11, 23, 33, 59（R7）。

`wf/workflows/planning/specs/world/opening.md`：7, 11, 17, 21, 27, 31, 63（R7）。

`wf/workflows/planning/specs/world/operations.md`：7, 11, 21, 23, 31, 41, 51, 53（R7）。

`wf/workflows/planning/specs/world/rifts-and-territory.md`：5, 7, 11, 13, 21, 31, 37, 41, 51, 55, 61, 65（R7）。

`wf/workflows/planning/specs/world/ruins-and-ancient.md`：1, 5, 7, 11, 13, 21, 25, 31, 41（R7）。

`wf/workflows/planning/specs/world/setting.md`：1, 21, 25, 27, 31, 40, 52, 54（R7）。

`wf/workflows/testing-checks.json`：13, 23（R7）。

## 沒做到、或證據不足的部分

沒有未完成的本批換詞；未執行四條驗收以外的測試。wf-lint 全庫仍因既存 2 條壞連結、1 條大小超限、2 條大清單違規而非綠燈，本批沒有新增，亦未越界修復。

依交接書保留連結字串，包含 constraints-ops.json 第 91、420、469 行指向本批已改名標題的舊錨點。這三處連結與新標題名稱不一致；本批禁止改連結，也未另加錨點或行數。wf-lint 此次未報這些 JSON 錨點，不能以其結果保證錨點導航有效。

「潮歌共鳴」只是血統能力的示例名，缺少進一步設定；本批判作海洋意象保留，沒有把它擅改成新的能力設定。

## 需要決定的事

下列為表外複合詞，已按交接書第 5 條授權依既有構詞改完，供上線統一跨批次用語；不等待批准、不擴大修改範圍。

「南殼→南墟」4 處：澳洲與群島地名，據遺跡密集的敘述採「墟」，map/southshell 不動；涉及 world-grid/continents.json、map-and-terrain.md、terrain-layers.json。

「殼約→古約」1 處：共享古代機研發的條約，採「古」，shell-pact 不動；在 data-model-diplomacy.md。

「尋殼→尋墟」4 處：relic-hunt 作戰名，依掘墟的構詞，任務仍以取得古代機為目標，relic-hunt 不動；在 data-model-operations-war.md、其 resolution.md、mercenary-contracts.md、operations-kinds.json。

「潮浸→蝕浸」7 處：異形在蝕域回復活性的族行為，依蝕系列；tide-soak 不動；在 README.md、constraints-ops.json、data-model-beasts.md、time-and-tick.md。

「潮光→蝕光」1 處：大潮日擾動船速的光象，依蝕系列；在 world-grid/movement.md。

另請上線在有連結修改權限的批次處理上述三處舊錨點；若其他內容對「潮歌共鳴」有明確裂縫語義，應再統一定名。

## 子代理

無；全部由 cx-rn-d1 親讀、判讀、修改與驗收。

## 以後交接書該點名的工具

無。

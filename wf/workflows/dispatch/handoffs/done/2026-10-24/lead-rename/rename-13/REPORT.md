## 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`

AGENTS.md 親自讀取來源：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`。其餘相對路徑皆在隔離 worktree 親自讀取。terms-rename.json 透過 `python3 wf/tools/tabledb.py ... find 類別=...` 分別完整讀取古代機、機甲、蝕、專有名詞、保留五類，未整份 cat。

另讀：

- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/inbox/README.md`
- `wf/workflows/inbox/PROTOCOL.md`
- `wf/workflows/dispatch/lessons.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/workflows/content/world-pillars/mechs/ancient.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`

## 做了什麼

cx-rn-13 完成 rename-13：逐檔檢視 19 檔，修改 10 檔的 16 個文字值；其餘 9 檔依保留規則原樣保留。僅修改 name 與 ui.badge；id、引用、數字、鍵、陣列長度與檔名均未動。沒有新增表外專名，沒有可順手修的敘述句。未 commit。

產出：內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-13/`；本報告位於 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/rename-13/REPORT.md`。

依交接書固定五條驗收：

1. `git status --short` 僅列下述 10 個允許內容檔為 M，以及開場即存在的 `?? node_modules`。未超過 19 檔；容量 gate 也未觸發：9 個改動檔位元組數不變，ax-bg-tide-refugee.json 由 551 降為 545。
2. 已跑 `npm run check`，載入檢查 `OK 0 errors, 12 warnings`，最末行 `OK 0 errors, 8 warnings`。完整輸出：`/tmp/cx-rn-13/check.log`。
3. 已跑指定的 `git -C <worktree> grep -nE '殼|摹|潮|鞘' -- content`，輸出留在 `/tmp/cx-rn-13/residual-all.log`；本批 19 檔共 19 處殘留，理由逐處列於下方。另對此 19 檔搜尋「古機／蝕盛／蝕歇／原鞘」，零命中。
4. 下方逐檔對照涵蓋全部 19 檔與 16 個修改值。
5. 本報告第一段已讀清單逐行列出交接書「先讀」全部路徑。

## 逐檔對照

### content/base/bodyplans/ancient-colossus.json

- `parts[0].name`：「承天殼心」→「承天樞心」。

### content/base/bodyplans/ancient-hound.json

- `name`：「斷鏈獵殼」→「斷鏈獵軀」。

### content/base/bodyplans/ancient-serpent.json

- `name`：「鹹海長殼」→「鹹海長軀」。

### content/base/bodyplans/ancient-slender.json

- `name`：「輕靈人殼」→「輕靈修軀」。

### content/base/bodyplans/ancient-warden.json

- `name`：「守殼者」→「鎮墟衛」。
- `parts[0].name`：「殼心」→「樞心」。

### content/base/bodyplans/ancient-winged.json

- `name`：「有翼古殼」→「垂翼古軀」。
- `parts[0].name`：「羽蛇殼心」→「羽蛇樞心」。

### content/base/bodyplans/insect-siegebeetle.json

- `parts[0].name`：「闕門聖殼」→「闕門聖殼」（保留；理由見「殘留」）。

### content/base/bodyplans/mx-hover-c.json

- `name`：「潮行輕機（C）」→「潮行輕機（C）」（保留；理由見「殘留」）。
- `parts[4].name`：「潮行裙」→「潮行裙」（保留；理由見「殘留」）。

### content/base/bodyplans/quadruped-tidespine.json

- `name`：「潮脊・海嘯王軀」→「潮脊・海嘯王軀」（保留；理由見「殘留」）。
- `parts[0].name`：「千潮王冠」→「千潮王冠」（保留；理由見「殘留」）。
- `parts[5].name`：「送葬潮尾」→「送葬潮尾」（保留；理由見「殘留」）。

### content/base/effects/ax-bg-tide-refugee.json

- `name`：「潮線逃生者」→「蝕線流民」。
- `ui.badge`：「潮線逃生者」→「蝕線流民」。

### content/base/effects/ax-injury-brine-cough.json

- `name`：「鹹潮嗆傷」→「鹹潮嗆傷」（保留；理由見「殘留」）。
- `ui.badge`：「鹹潮嗆傷」→「鹹潮嗆傷」（保留；理由見「殘留」）。

### content/base/effects/ax-injury-scarred-lung.json

- `name`：「肺上結殼」→「肺上結殼」（保留；理由見「殘留」）。
- `ui.badge`：「肺上結殼」→「肺上結殼」（保留；理由見「殘留」）。

### content/base/effects/ax-injury-shell-migraine.json

- `name`：「殼訊偏頭痛」→「夢召偏頭痛」。
- `ui.badge`：「殼訊偏頭痛」→「夢召偏頭痛」。

### content/base/effects/bf-tide-drag.json

- `name`：「潮神挽足」→「潮神挽足」（保留；理由見「殘留」）。
- `ui.badge`：「潮神挽足」→「潮神挽足」（保留；理由見「殘留」）。

### content/base/effects/cx3-following-tide.json

- `name`：「同潮」→「同潮」（保留；理由見「殘留」）。
- `ui.badge`：「同潮」→「同潮」（保留；理由見「殘留」）。

### content/base/effects/kx-shell-cracked.json

- `name`：「聖殼崩紋」→「聖殼崩紋」（保留；理由見「殘留」）。
- `ui.badge`：「聖殼崩紋」→「聖殼崩紋」（保留；理由見「殘留」）。

### content/base/effects/kx-tidal-dread.json

- `name`：「滅港潮懼」→「滅港潮懼」（保留；理由見「殘留」）。
- `ui.badge`：「滅港潮懼」→「滅港潮懼」（保留；理由見「殘留」）。

### content/base/effects/perk-soul-calc-1.json

- `name`：「算・殼目融合」→「算・靈目融合」。
- `ui.badge`：「算・殼目融合」→「算・靈目融合」。

### content/base/effects/shard-marked.json

- `name`：「殼片標記」→「骸片標記」。
- `ui.badge`：「殼片標記」→「骸片標記」。

## 殘留

以下 index 為 tabledb 回傳的零起算 index，逐處列出指定 19 檔中的殘留。未列出的本批檔案無「殼／摹／潮／鞘」命中。

- `content/base/bodyplans/ancient-serpent.json` `parts[2].name`：「後環腹潮」。保留列 index 64 明列「後環腹潮」；海洋系古代機意象，規則 3。
- `content/base/bodyplans/insect-siegebeetle.json` `parts[0].name`：「闕門聖殼」。保留列 index 62 明列蟲族部位「闕門聖殼」；甲殼本義，規則 2。
- `content/base/bodyplans/mx-hover-c.json` `name`：「潮行輕機（C）」。規則 3 的海洋意象；同檔部位「潮行裙」已在保留列 index 64，身形名稱沿用相同意象，不指裂縫湧現。
- `content/base/bodyplans/mx-hover-c.json` `parts[4].name`：「潮行裙」。保留列 index 64 明列「潮行裙」；海洋意象，規則 3。
- `content/base/bodyplans/quadruped-tidespine.json` `name`：「潮脊・海嘯王軀」。保留列 index 64 明列「潮脊」；海獸意象，規則 3。
- `content/base/bodyplans/quadruped-tidespine.json` `parts[0].name`：「千潮王冠」。保留列 index 64 明列「千潮王冠」；海獸部位意象，規則 3。
- `content/base/bodyplans/quadruped-tidespine.json` `parts[5].name`：「送葬潮尾」。保留列 index 64 明列「送葬潮尾」；海獸部位意象，規則 3。
- `content/base/effects/ax-injury-brine-cough.json` `name`：「鹹潮嗆傷」。保留列 index 63 明列「鹹潮」；海洋本義，規則 3。
- `content/base/effects/ax-injury-brine-cough.json` `ui.badge`：「鹹潮嗆傷」。保留列 index 63 明列「鹹潮」；海洋本義，規則 3。
- `content/base/effects/ax-injury-scarred-lung.json` `name`：「肺上結殼」。保留列 index 62 明列「結殼」；傷勢結殼本義，規則 2。
- `content/base/effects/ax-injury-scarred-lung.json` `ui.badge`：「肺上結殼」。保留列 index 62 明列「結殼」；傷勢結殼本義，規則 2。
- `content/base/effects/bf-tide-drag.json` `name`：「潮神挽足」。保留列 index 64 明列「潮神（潮灘地形）」；地形海洋意象，規則 3。
- `content/base/effects/bf-tide-drag.json` `ui.badge`：「潮神挽足」。保留列 index 64 明列「潮神（潮灘地形）」；地形海洋意象，規則 3。
- `content/base/effects/cx3-following-tide.json` `name`：「同潮」。保留列 index 64 明列「同潮」；海洋意象，規則 3。
- `content/base/effects/cx3-following-tide.json` `ui.badge`：「同潮」。保留列 index 64 明列「同潮」；海洋意象，規則 3。
- `content/base/effects/kx-shell-cracked.json` `name`：「聖殼崩紋」。保留列 index 62 明列蟲族招式「聖殼崩紋」；甲殼本義，規則 2。
- `content/base/effects/kx-shell-cracked.json` `ui.badge`：「聖殼崩紋」。保留列 index 62 明列蟲族招式「聖殼崩紋」；甲殼本義，規則 2。
- `content/base/effects/kx-tidal-dread.json` `name`：「滅港潮懼」。保留列 index 64 明列「滅港潮懼」；海獸意象，規則 3。
- `content/base/effects/kx-tidal-dread.json` `ui.badge`：「滅港潮懼」。保留列 index 64 明列「滅港潮懼」；海獸意象，規則 3。

## 沒做到或證據不足的

無未完成的本批要求。依交接書只做固定五條驗收，沒有跑 npm test、額外閘門、MCP 或其他加碼驗收。check 的警告都指向本批未修改資料；沒有跑基線比較，故不宣稱警告增減。暫存資料與腳本僅放 `/tmp/cx-rn-13/`。

## 需要決定的事

無。沒有表外新造詞，也沒有發現需要另提翻譯腔修名的名稱。「潮行輕機（C）」依規則 3 保留，未自創新名。

## 子代理

未使用子代理；子代理成本為零。全部閱讀、逐處判斷、修改、指定驗收及報告由 cx-rn-13 親自完成。

## 以後交接書該點名的工具

無。

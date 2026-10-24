# 已讀清單

- `AGENTS.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`

AGENTS.md 親自讀取主 repo 絕對路徑；其餘相對路徑均在本線 worktree 親自讀取。terms-rename.json 使用 `python3 wf/tools/tabledb.py … find 類別=…` 分別讀完古代機、機甲、蝕、專有名詞、保留五類，未整份 cat。另讀 wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/WORKFLOWS.md、wf/workflows/inbox/README.md、wf/workflows/inbox/PROTOCOL.md、wf/workflows/dispatch/lessons.md 與 world-pillars 三個子入口。

## 做了什麼

cx-rn-12／rename-12：逐檔判讀指定 20 檔，僅修改其中 8 檔各一個 name 值；其餘 12 檔保留既有用語。無新增專名、無敘事改寫，id、引用、數值、鍵、陣列與格式皆原樣保留。未 commit。

固定五條驗收結果：

1. `git status --short` 除開場已有的 `?? node_modules` 外，只列允許範圍內 8 個修改檔；無新增、刪除或其他路徑改動。件數未超過 20；單檔最大增幅為 shell-society.json 的 0.93%（324 → 327 bytes），未觸發 20% 容量 gate。
2. `npm run check` exit 0；戰鬥內容輸出 `OK 0 errors, 12 warnings`，最後一行為 `OK 0 errors, 8 warnings`。完整輸出 `/tmp/cx-rn-12/check.log`。
3. 已執行交接書指定的全 content `git grep -nE`，本批 12 處殘留逐項說明如下；本批文中無「古機」「蝕盛」「蝕歇」「原鞘」。全庫 grep 記錄 `/tmp/cx-rn-12/residual-all.txt`，範圍外檔案不處理。
4. 下方逐檔對照涵蓋全部 20 檔。
5. 首段已讀清單包含交接書「先讀」全部路徑。

## 產出（檔案路徑 / commit / 分支）

內容工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-12`。REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/rename-12/REPORT.md`。無 commit、無新分支。

## 逐檔對照

### content/base/abilities/ax-brinemother-tide.json

`name`：鹹潮・阿普蘇之淚 → 鹹潮・阿普蘇之淚。
未修改；表 index 63「鹹潮」，海洋本義；規則 3。

### content/base/abilities/ax-watchhorn-far-sight.json

`name`：千里眼・殼針留記 → 千里眼・靈針留記。
依 terms-rename.json index 49 換詞。

### content/base/abilities/cx3-call-the-tide.json

`name`：同潮齊刃 → 同潮齊刃。
未修改；表 index 64「同潮」，海洋意象專名；規則 3。

### content/base/abilities/cx3-skimming-fin.json

`name`：掠潮飛鰭 → 掠潮飛鰭。
未修改；表 index 64「掠潮」，海洋意象專名；規則 3。

### content/base/abilities/heat-lance-thrust.json

`name`：熾潮矛突刺 → 熾流突刺。
依 terms-rename.json index 54 換詞。

### content/base/abilities/kx-carapace-brace.json

`name`：闔殼封闕 → 闔殼封闕。
未修改；表 index 62 明列「闔殼封闕」，蟲族甲殼本義；規則 2。

### content/base/abilities/kx-tide-crush.json

`name`：萬潮覆港 → 萬潮覆港。
未修改；表 index 64 明列「萬潮覆港」，海洋意象專名；規則 3。

### content/base/abilities/mx-fin-flurry.json

`name`：潮鰭連斬 → 潮鰭連斬。
未修改；表 index 64「潮鰭」，海洋系血統的意象；規則 3。

### content/base/abilities/mx-relic-fist.json

`name`：殘殼拳 → 古骸拳。
依 terms-rename.json index 57 換詞。

### content/base/abilities/mx-tide-leap-up.json

`name`：躍潮 → 躍潮。
未修改；表 index 64 明列「躍潮」，海洋意象專名；規則 3。

### content/base/abilities/shard-gaze.json

`name`：殼片凝視 → 骸片凝視。
依 terms-rename.json index 10 換詞。

### content/base/abilities/shell-lance.json

`name`：殼光之槍 → 源光貫槍。
依 terms-rename.json index 50 換詞。

### content/base/factions/shell-society.json

`name`：殼學會 → 稽古學會。
依 terms-rename.json index 4 換詞。

### content/base/factions/tide-faith.json

`name`：潮信會・解拘者 → 沐蝕會・解拘者。
依 terms-rename.json index 32 換詞。

### content/base/monsters/tidespine-chittagong.json

`epithet`：萬潮葬王 → 萬潮葬王。
未修改；規則 3：潮脊海獸的二名「萬潮葬王」延續海洋意象，不指裂縫週期湧現；表 index 64 的「潮脊」「萬潮覆港」提供同系語境。此二名未在表上逐字列出，依規則 3 保留。

### content/base/soultrees/moji-std.json

`name`：摹機魂樹 → 衍型機魂樹。
依 terms-rename.json index 24 換詞。

### content/base/species/tidespine.json

`name`：潮脊 → 潮脊。
未修改；表 index 64 明列「潮脊」，海獸專名；規則 3。

### content/base/species/tidewolf.json

`name`：潮狼 → 潮狼。
未修改；表 index 64 明列「潮狼」，海獸專名；規則 3。

### content/base/terrains/tidal-flat.json

`name`：退潮之喉 → 退潮之喉。
未修改；表 index 63「退潮」，地形的海洋本義；規則 3。

### content/base/terrains/tide-channel.json

`name`：潮神裂渠 → 潮神裂渠。
未修改；表 index 64「潮神（潮灘地形）」，海岸地形專名；規則 3。

## 殘留

以下 index 為 tabledb 輸出的零起算索引；每項為該檔唯一含殼／摹／潮／鞘的文字欄。

- `content/base/abilities/ax-brinemother-tide.json` 的 `name`「鹹潮・阿普蘇之淚」：表 index 63「鹹潮」，海洋本義；規則 3。
- `content/base/abilities/cx3-call-the-tide.json` 的 `name`「同潮齊刃」：表 index 64「同潮」，海洋意象專名；規則 3。
- `content/base/abilities/cx3-skimming-fin.json` 的 `name`「掠潮飛鰭」：表 index 64「掠潮」，海洋意象專名；規則 3。
- `content/base/abilities/kx-carapace-brace.json` 的 `name`「闔殼封闕」：表 index 62 明列「闔殼封闕」，蟲族甲殼本義；規則 2。
- `content/base/abilities/kx-tide-crush.json` 的 `name`「萬潮覆港」：表 index 64 明列「萬潮覆港」，海洋意象專名；規則 3。
- `content/base/abilities/mx-fin-flurry.json` 的 `name`「潮鰭連斬」：表 index 64「潮鰭」，海洋系血統的意象；規則 3。
- `content/base/abilities/mx-tide-leap-up.json` 的 `name`「躍潮」：表 index 64 明列「躍潮」，海洋意象專名；規則 3。
- `content/base/monsters/tidespine-chittagong.json` 的 `epithet`「萬潮葬王」：規則 3：潮脊海獸的二名「萬潮葬王」延續海洋意象，不指裂縫週期湧現；表 index 64 的「潮脊」「萬潮覆港」提供同系語境。此二名未在表上逐字列出，依規則 3 保留。
- `content/base/species/tidespine.json` 的 `name`「潮脊」：表 index 64 明列「潮脊」，海獸專名；規則 3。
- `content/base/species/tidewolf.json` 的 `name`「潮狼」：表 index 64 明列「潮狼」，海獸專名；規則 3。
- `content/base/terrains/tidal-flat.json` 的 `name`「退潮之喉」：表 index 63「退潮」，地形的海洋本義；規則 3。
- `content/base/terrains/tide-channel.json` 的 `name`「潮神裂渠」：表 index 64「潮神（潮灘地形）」，海岸地形專名；規則 3。

8 個已修改檔均無上述四字殘留；本批無「摹」「鞘」殘留。

## 沒做到或證據不足的

無阻塞或未完成項目。依交接書未跑 npm test、MCP、額外測試或其他驗收。check 的 warning 涉及捕捉層 HP、數值帶、instinct band 與 defaultLoadout；本批不改相關結構與數值。未跑改前基線，因此不宣稱已用基線證實警告數量不變。

## 沒做到、或證據不足的部分

同上段；無額外未完成事項。

## 需要決定的事

無表外新造詞，無需上游決定；無另外提出翻譯腔名字建議。「萬潮葬王」依規則 3 保留，理由已列於殘留。

## 需要對方或使用者決定的事

無。

## 子代理

未使用子代理；子代理成本為 0，全部閱讀、判讀與修改由 cx-rn-12 親自完成。品質證據為逐處對照、12 處殘留判定及本次 check 輸出。

## 以後交接書該點名的工具

無。

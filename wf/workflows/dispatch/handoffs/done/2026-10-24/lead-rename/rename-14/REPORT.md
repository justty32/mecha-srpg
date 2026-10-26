# 已讀清單

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

AGENTS.md 親自讀取主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘以上路徑相對本線 worktree。terms-rename.json 用 `python3 wf/tools/tabledb.py ... find 類別=...` 依序讀完古代機、機甲、蝕、專有名詞、保留五類，沒有整份 cat。

另親自讀過：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/dispatch/lessons.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/content/world-pillars/mechs.md`，以及其 `mechs/bonds.md`、`mechs/ancient.md`、`mechs/mechanical.md`。

# 做了什麼

cx-rn-14 完成 rename-14 部件批次：逐一判讀 17 檔，修改 13 檔共 13 處 name（含 3 處 pools[0].name），4 檔依保留表維持原文。所有替換皆有定案表依據，未造新詞。diff 僅名稱字串變更，未改 id、檔名、鍵、數字、引用、陣列長度與格式。未 commit。

件數為 13／17；各檔改後大小等於或小於原檔，未觸發 20% 容量 gate。

固定五條驗收：

1. `git status --short` 僅列本批允許的 13 個修改檔及開工時已存在的 `?? node_modules`，無新增或刪除內容檔。
2. 本次 `npm run check` exit 0；核心檢查 `OK 0 errors, 12 warnings`，末行 `OK 0 errors, 8 warnings`。
3. 指定的全 content `git grep -nE '殼|摹|潮|鞘' -- content` 已執行；本批殘留共 4 處，逐處理由見下。17 檔中「古機」「蝕盛」「蝕歇」「原鞘」均為 0 處。
4. 下節完整列出 17 檔的對照，包含 4 檔原文保留。
5. 第一段已讀清單涵蓋交接書「先讀」全部 10 個路徑。

# 逐檔對照

## content/base/components/autocannon-30.json

`pools[0].name`：「凡鐵殼矢」→「凡鐵矢」。依定案表 index 21。

## content/base/components/cx3-skimming-fin.json

`name`：「掠潮鳴鰭」→「掠潮鳴鰭」。原文保留，依定案表 index 64（海洋意象專名）及交接書規則 3。

## content/base/components/heat-lance.json

`name`：「熾潮矛」→「熾流矛」。依定案表 index 54。

## content/base/components/mx-graft-tidewolf-jaw.json

`name`：「潮狼顎移植臂」→「潮狼顎移植臂」。原文保留，依定案表 index 64（海洋意象專名）及交接書規則 3。

## content/base/components/mx-hawk-eye.json

`name`：「鷹瞳殼目」→「鷹瞳靈目」。依定案表 index 20。

## content/base/components/mx-porcelain-plate.json

`name`：「白瓷殼甲」→「白瓷鎧甲」。依定案表 index 19。

## content/base/components/mx-relic-gauntlet.json

`name`：「殘殼拳甲」→「古骸拳甲」。依定案表 index 57。

## content/base/components/mx-relic-halo.json

`name`：「殼環殘片」→「冕環骸片」。依定案表 index 48。

## content/base/components/mx-rune-cannon.json

`pools[0].name`：「重殼矢」→「重矢」。依定案表 index 21。

## content/base/components/mx-rune-rifle.json

`pools[0].name`：「殼矢」→「矢」。依定案表 index 21。

## content/base/components/mx-runeweave-plate.json

`name`：「殼紋聖甲」→「古紋聖甲」。依定案表 index 15。

## content/base/components/mx-thousand-eye.json

`name`：「千目殼目」→「千目靈目」。依定案表 index 20。

## content/base/components/mx-tide-leap.json

`name`：「躍潮噴口」→「躍潮噴口」。原文保留，依定案表 index 64（海洋意象專名）及交接書規則 3。

## content/base/components/mx-tidefin-twins.json

`name`：「潮鰭雙刃」→「潮鰭雙刃」。原文保留，依定案表 index 64（海洋意象專名）及交接書規則 3。

## content/base/components/mx-xingtian-replica.json

`name`：「摹・刑天之矛」→「衍・刑天之矛」。依定案表 index 27。

## content/base/components/shell-pin-restraint.json

`name`：「殼釘節鎖」→「鎮釘節鎖」。依定案表 index 13。

## content/base/components/shell-shard-lens.json

`name`：「殼片透鏡」→「骸片透鏡」。依定案表 index 10。

# 殘留

本節列全數 4 處；索引值指 tabledb 輸出的零起算 index。

- `content/base/components/cx3-skimming-fin.json:3`，`name`「掠潮鳴鰭」的「潮」：index 64「掠潮」，海洋意象專名，規則 3 保留。
- `content/base/components/mx-graft-tidewolf-jaw.json:3`，`name`「潮狼顎移植臂」的「潮」：index 64「潮狼」，海獸專名，規則 3 保留。
- `content/base/components/mx-tide-leap.json:3`，`name`「躍潮噴口」的「潮」：index 64「躍潮」，海洋意象專名，規則 3 保留。
- `content/base/components/mx-tidefin-twins.json:3`，`name`「潮鰭雙刃」的「潮」：index 64「潮鰭」，海洋意象專名，規則 3 保留。

本批無「殼」「摹」「鞘」殘留；搜尋全 content 得到的其他檔案不屬本線可寫範圍。完整搜尋輸出置於 `/tmp/cx-rn-14/residual-all.txt`。

# 沒做到或證據不足的

無未完成的本批驗收。依交接書未跑 npm test、額外閘門、MCP、全庫擴大修改。

check 有 warnings 並非零警告：核心 12 條、營運 8 條，全部指向本批以外的怪獸捕獲層 HP、閃避／傷害數值帶、資源池 band、未配裝機體；未修改那些檔，未另跑基線檢查。

# 需要決定的事

無表外新造詞，無需另決定；本批沒有需提報的明顯翻譯腔名字。只含名稱的舊詞依表替換即可，不需句子重寫。

# 子代理

未使用子代理；子代理成本 0，品質由本線親自判讀定案表、檢視每檔與 diff，並完成指定五條驗收。

# 產出（檔案路徑 / commit / 分支）

內容修改位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-14/` 下的上述 13 檔。

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/rename-14/REPORT.md`。

未 commit、未建分支。

# 以後交接書該點名的工具

無。

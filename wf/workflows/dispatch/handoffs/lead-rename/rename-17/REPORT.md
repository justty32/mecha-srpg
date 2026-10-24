# 已讀清單

以下均由 cx-rn-17 親自讀取；相對路徑以隔離 worktree 為根。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`（用 `python3 wf/tools/tabledb.py … find 類別=…` 分次讀完古代機、機甲、蝕、專有名詞、保留五類，未整份 cat）

另讀：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/dispatch/lessons.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/world-pillars/bio-battle.md`、`wf/workflows/content/world-pillars/world/tone-and-rules.md`、`wf/workflows/content/world-pillars/mechs/ancient.md`、`wf/workflows/content/world-pillars/mechs/bonds.md`。

## 做了什麼

完成 rename-17：逐檔讀過交接書的 11 檔，修改其中 7 檔的 9 個 `text` 欄；其餘 4 檔只有應保留的本義或意象，原樣保留。事件走向、id、引用、鍵、數值、陣列長度均未變。未新增或刪除內容檔、未 commit。

工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-17`。

件數為 7／11；所有 11 檔都比對了 HEAD 的位元組長度，最大增幅是 `route-tide-storm.json` 的 1.11%（1350 → 1365 bytes），未觸及 20% 容量 gate。暫存證據只放 `/tmp/cx-rn-17/`。

固定五條驗收結果：

1. `git status --short` 只見下列逐檔對照中標「已改」的 7 個允許檔，以及開工時已有的 `?? node_modules`；diff 僅改 `text`。
2. 本次實跑 `npm run check` 與 `node src/ops/content/check.ts content/base`，兩者 exit 0、末行均為 `OK 0 errors, 8 warnings`。完整輸出分別在 `/tmp/cx-rn-17/npm-check.log`、`/tmp/cx-rn-17/ops-check.log`。警告指向範圍外怪獸資料的 capture layer HP；未擴大修改範圍。
3. 必用 `git -C <worktree> grep -nE '殼|摹|潮|鞘' -- content` 已執行，完整輸出在 `/tmp/cx-rn-17/residual-all.txt`，本批篩選在 `/tmp/cx-rn-17/residual-scope.txt`。本批全部 8 處命中理由見「殘留」；11 檔均無「古機」「蝕盛」「蝕歇」「原鞘」。
4. 下節逐一列出全部 11 檔對照，包括不需修改的 4 檔。
5. 首段已讀清單逐行涵蓋交接書「先讀」全部路徑。

驗收限上述五條，未跑 `npm test` 或其他擴大驗收。步驟完成均以主 repo 的 `inbox_poll.sh cx-rn-17 --once` 收 orders。

## 逐檔對照

各檔路徑前綴均為 `content/base/world/events/`；表中 index 指 tabledb 輸出的零起算 index。

### news-selene-courtesy.json（已改）

`text`：「新摹機的殼甲亮得像從未有人死過」→「新衍型機的鎧甲亮得像從未有人死過」。依機甲 index 24、19。

### news-tide-street-sermon.json（已改）

`text`：「潮信會・解拘者正向獵團兜售救贖」→「沐蝕會・解拘者正向獵團兜售救贖」。依蝕 index 32。

### restraint-empty-rack.json（未改）

`text`：「你聞到的只有鐵鏽和潮氣」→ 原樣。「潮氣」指濕氣，依規則 3 保留。

### route-tide-storm.json（已改）

`text`：「源潮風暴把候鳥號推離雲道」→「源流風暴把候鳥號推離雲道」。依蝕 index 34。

`choices[1].text`：「拆下廢料架，收集潮紋」→「拆下廢料架，收集蝕潮留下的紋路」。依規則 3、5，以描述句處理表外複合詞，保留收集紋路的原意。

### ruin-before-tide-glow.json（已改）

`text`：「遠處的殼正從黑土裡發光」→「遠處的墟正從黑土裡發光」。上下文有座標與入口，指遺跡，依古代機 index 2。

`text`：「大潮還沒到，殼門已像眼皮般顫動」→「大潮還沒到，墟門已像眼皮般顫動」。依古代機 index 17；「大潮」依保留 index 68 原樣。

`choices[1].text`：「耗材拓下映出的殼紋」→「用耗材拓下映出的古紋」。依古代機 index 15；同句補「用」，讓耗材作為工具的語法自然。

### ruin-coordinate-sale.json（已改）

`text`：「你在雨棚下遇見殼學會的測繪員」→「你在雨棚下遇見稽古學會的測繪員」。依古代機 index 4。

`text`：「他把殼的座標藏在濕透的袖口」→「他把墟的座標藏在濕透的袖口」。與後文入口及後續遺跡事件相連，依古代機 index 2。

### ruin-empty-shell-rubbing.json（已改）

`text`：「刻痕裡的殼跪在潮邊」→「刻痕裡的古代機跪在蝕潮邊」。有胸口、空座艙與跪姿，判定為古代機本體；拓本中的潮按世界觀侵蝕現象處理，依古代機 index 0、蝕 index 28 與規則 2–3。保留胸口空缺與無人駕駛的畫面。

### ruin-shared-dream.json（已改）

`text`：「腳下是沒有水的潮」→「腳下是沒有水的蝕潮」。原文已排除水體，依蝕 index 28。

### ship-letter-receipt.json（未改）

`text`：「廚子避開酒艙牆上的潮斑」→ 原樣。「潮斑」指牆面受潮的斑痕，依規則 3 保留。

### ship-locker-letter.json（未改）

`text`：「欠條受了潮，一張張黏在一起」→ 原樣。紙張受潮，依規則 3 保留。

### ship-tide-stew.json（未改）

`text`：「廚子兼醫官管這叫『潮汐燉菜』」→ 原樣（原檔仍用中文雙引號「」）。「潮汐」是菜名的潮汐意象，依保留 index 64、規則 3；雖菜葉與油花比擬蝕線裂縫，仍不需改掉允許的潮汐意象。

## 殘留

本批 11 檔改後無「殼」「摹」「鞘」；「潮」共 8 處，逐處如下。新詞「蝕潮」本身也會被指定 grep 命中，並非漏改。

- `restraint-empty-rack.json`，`text`：「潮氣」一次。濕氣本義，規則 3，對應保留 index 64 的「潮濕」類。
- `route-tide-storm.json`，`choices[1].text`：「蝕潮留下的紋路」一次。蝕 index 28 的定案新詞，規則 3。
- `ruin-before-tide-glow.json`，`text`：「大潮還沒到」一次。蝕潮強弱用語，保留 index 68、規則 3。
- `ruin-empty-shell-rubbing.json`，`text`：「古代機跪在蝕潮邊」一次。蝕 index 28 的定案新詞，規則 3。
- `ruin-shared-dream.json`，`text`：「沒有水的蝕潮」一次。蝕 index 28 的定案新詞，規則 3。
- `ship-letter-receipt.json`，`text`：「潮斑」一次。潮濕留下的牆面斑痕，規則 3，對應保留 index 64 的「潮濕」類。
- `ship-locker-letter.json`，`text`：「欠條受了潮」一次。受潮本義，規則 3，對應保留 index 64 的「潮濕」類。
- `ship-tide-stew.json`，`text`：「潮汐燉菜」一次。潮汐意象菜名，保留 index 64、規則 3。

`news-selene-courtesy.json`、`news-tide-street-sermon.json`、`ruin-coordinate-sale.json` 無指定舊字命中。英文 id、檔名與引用依保留 index 67 全數不動；全 content grep 的其他檔案不屬本批範圍。

## 沒做到或證據不足的

無本批未完成事項。兩項檢查均有本次輸出；8 個範圍外警告未修，未另跑基準比較，因此不宣稱已證明它們是既有警告。依交接書不跑 npm test，整批領導閘門由領導執行。

## 需要決定的事

無須使用者裁示。「潮紋」不在表中，本線選擇描述句「蝕潮留下的紋路」，未自創專名；列此供領導核閱。「殼門」雖被交接書作為表外詞的例子，實際已在 index 17，故直接用「墟門」。本批沒有需另提的翻譯腔名稱建議。

## 子代理

未使用子代理；子代理成本為零，所有先讀、語境判讀、編修與驗收由 cx-rn-17 親自完成。

## 以後交接書該點名的工具

無。

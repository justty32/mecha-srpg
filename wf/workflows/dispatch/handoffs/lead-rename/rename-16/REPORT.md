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

`AGENTS.md` 親自讀取的來源為 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘以上路徑均讀自隔離 worktree。`terms-rename.json` 使用 `python3 wf/tools/tabledb.py ... find 類別=...` 分別讀完古代機、機甲、蝕、專有名詞、保留五類，未整份 cat。

另外已讀：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/dispatch/lessons.md`；world-pillars 的 world／mechs／bio-battle 三個入口及其列出的八個守則子檔。

## 做了什麼

cx-rn-16 完成 rename-16：逐檔檢視指定 15 檔，11 檔各改一個頂層 `name`，4 檔依海洋意象保留列原樣保留。全部替換都有定案表依據，未新增專名、未改原意；id、檔名、引用、鍵、數值、陣列均未改。未 commit。

件數為 11（上限 15），單檔容量最大增幅為 `shell-marsh-mortician.json` 的 422 → 425 bytes（約 0.711%，上限 20%），兩個 gate 均未觸發。

固定五條驗收結果：

1. `git status --short` 僅列下方 11 個改名檔與開場就存在的 `?? node_modules`，無新增或刪除內容檔。`git diff` 僅有這 11 個 `name` 行。
2. 本次 `npm run check` 與 `node src/ops/content/check.ts content/base` 均 exit 0，兩者末行都是 `OK 0 errors, 8 warnings`。完整輸出為 `/tmp/cx-rn-16/check.log` 與 `/tmp/cx-rn-16/ops-check.log`。末段 8 個警告為未改動怪獸檔的 capture layer HP differs；`npm run check` 前段 loader 另顯示 `OK 0 errors, 12 warnings`，包括相同 8 個 HP 警告以及 mx-faded 超閃避建議值、tidewolf 本能池上溢無 band、kx-tide-crush 超傷害建議值、infantry 未配裝四項，涉及檔案均未改動；未額外跑基準檢查，故不宣稱本次已證明警告原先就有。
3. 已執行交接書指定的 `git -C <worktree> grep -nE '殼|摹|潮|鞘' -- content`，原始輸出保存在 `/tmp/cx-rn-16/residual-all.txt`；指定 15 檔只剩下文列出的四處「潮」。指定檔沒有「古機」「蝕盛」「蝕歇」「原鞘」。
4. 下方逐檔對照含全部 15 檔，每處換詞均有舊、新名稱。
5. 本報告首段已讀清單列出交接書「先讀」指定的全部十個路徑。

## 逐檔對照

### `content/base/frames/bio-tidespine.json`

`name`：「生物機甲・潮脊」 → 「生物機甲・潮脊」。依據：`terms-rename.json` index 65。原樣保留，無改動。

### `content/base/frames/bio-tidewolf.json`

`name`：「生物機甲・潮狼」 → 「生物機甲・潮狼」。依據：`terms-rename.json` index 65。原樣保留，無改動。

### `content/base/frames/corpse-tidespine.json`

`name`：「屍體改裝・潮脊」 → 「屍體改裝・潮脊」。依據：`terms-rename.json` index 65。原樣保留，無改動。

### `content/base/frames/corpse-tidewolf.json`

`name`：「屍體改裝・潮狼」 → 「屍體改裝・潮狼」。依據：`terms-rename.json` index 65。原樣保留，無改動。

### `content/base/frames/moji-tern-guard.json`

`name`：「摹機・燕鷗攻堅型」 → 「衍型機・燕鷗攻堅型」。依據：`terms-rename.json` index 24。

### `content/base/frames/moji-tern.json`

`name`：「摹機・燕鷗」 → 「衍型機・燕鷗」。依據：`terms-rename.json` index 24。

### `content/base/frames/shellsoc-surveyor-b.json`

`name`：「測殼-B」 → 「測墟-B」。依據：`terms-rename.json` index 53。

### `content/base/world/backgrounds/shell-field-student.json`

`name`：「殼學會傷後返港學生」 → 「稽古學會傷後返港學生」。依據：`terms-rename.json` index 4。

### `content/base/world/backgrounds/shell-marsh-mortician.json`

`name`：「殼學會船屋收殮員」 → 「稽古學會船屋收殮員」。依據：`terms-rename.json` index 4。

### `content/base/world/backgrounds/tide-apostate.json`

`name`：「潮信會叛教者」 → 「沐蝕會叛教者」。依據：`terms-rename.json` index 32。

### `content/base/world/research/forge-composite.json`

`name`：「殼甲鍛研・疊殼公刻」 → 「鎧甲鍛研・疊甲公刻」。依據：`terms-rename.json` index 19。

### `content/base/world/research/forge-tide-lance.json`

`name`：「潮刃鍛研・燼中長槍」 → 「流刃鍛研・燼中長槍」。依據：`terms-rename.json` index 23。

### `content/base/world/research/restraint.json`

`name`：「殼釘拘束」 → 「鎮釘拘束」。依據：`terms-rename.json` index 13。

### `content/base/world/research/shell-translation.json`

`name`：「刻痕翻譯・借殼觀潮」 → 「刻痕釋讀・借古觀蝕」。依據：`terms-rename.json` index 56。

### `content/base/world/research/soul-calc-tide.json`

`name`：「算向・潮勢公刻」 → 「算向・蝕勢公刻」。依據：`terms-rename.json` index 37。

## 殘留

以下每處皆位於第 3 行 `name`，依 `terms-rename.json`「保留」index 65 的「潮脊／潮狼」與交接書規則 3 保留，屬海洋意象海獸名，不指裂縫週期湧現。

- `content/base/frames/bio-tidespine.json`：「生物機甲・潮脊」中的「潮脊」。
- `content/base/frames/bio-tidewolf.json`：「生物機甲・潮狼」中的「潮狼」。
- `content/base/frames/corpse-tidespine.json`：「屍體改裝・潮脊」中的「潮脊」。
- `content/base/frames/corpse-tidewolf.json`：「屍體改裝・潮狼」中的「潮狼」。

其餘 11 檔無「殼／摹／潮／鞘」殘留。英文 id 與引用依「保留」index 67 及範圍規則原樣保留。

## 沒做到或證據不足的

無未完成的指定工作。警告明細與前段 loader 的 12 警告已列於驗收第 2 條，未做範圍外修正。依交接書未跑 `npm test`、MCP、額外驗收，也未更新索引或 manifest。

## 需要決定的事

無表外新造詞，也無需另提的明顯翻譯腔名字。本批「疊殼公刻 → 疊甲公刻」在 index 19 備註已有定案；「刻痕翻譯・借殼觀潮 → 刻痕釋讀・借古觀蝕」依 index 56 完整套用。

## 子代理

未使用子代理；子代理成本為 0，全部判讀、修改與檢查由本線親自完成，品質依上述固定五條驗收確認。

## 以後交接書該點名的工具

無。

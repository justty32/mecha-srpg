已讀清單：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/terms-rename.json`。相對路徑均位於本線隔離 worktree；定案表以 tabledb.py 分古代機、機甲、蝕、專有名詞、保留五類親讀。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、content README、world-pillars、inbox README 與 PROTOCOL。

## 做了什麼

在交接書20份文件中修改19份、共191處；以下以每次詞組替換計一處，同句重複分開計。句子結構、數字、欄位、連結與程式識別字保留；使用者引文未改。

- `wf/workflows/planning/specs/core/README.md`：7處；獵團、潮→獵團、蝕潮 ×1；殼矢→矢 ×1；殼甲→鎧甲 ×1；摹殼→衍甲 ×1；摹機→衍型機 ×1；殼目→靈目 ×1；源潮→源流 ×1
- `wf/workflows/planning/specs/core/ai.md`：2處；潮錨→蝕錨 ×2
- `wf/workflows/planning/specs/core/content-format.md`：1處；殼矢→矢 ×1
- `wf/workflows/planning/specs/core/data-model-abilities-effects.md`：1處；潮壓→蝕壓 ×1
- `wf/workflows/planning/specs/core/data-model-people.md`：1處；摹機→衍型機 ×1
- `wf/workflows/planning/specs/core/glossary.json`：2處；殼目→靈目 ×1；殼甲→鎧甲 ×1
- `wf/workflows/planning/specs/core/rules-attack-resolution.md`：0處；「座艙殼層」是非古代機的殼體本義，保留。
- `wf/workflows/planning/specs/core/rules-turn-and-actions.md`：1處；潮壓→蝕壓 ×1
- `wf/workflows/planning/specs/world/README.md`：14處；殼訊→夢召 ×3；摹→仿 ×1；《潮獵》→《蝕潮獵團》 ×1；潮與殼→蝕潮與墟 ×2；潮錨→蝕錨 ×1；潮浸→蝕浸 ×1；潮月→蝕月 ×1；第一次潮→第一次蝕潮 ×1；摹一→衍一 ×1；摹機→衍型機 ×2
- `wf/workflows/planning/specs/world/bio-mechs.md`：6處；殼釘→鎮釘 ×1；潮月→蝕月 ×1；潮浸→蝕浸 ×1；摹機→衍型機 ×2；潮信會→沐蝕會 ×1
- `wf/workflows/planning/specs/world/factions.md`：17處；摹機→衍型機 ×7；潮月→蝕月 ×1；藍本殼→藍本古代機 ×1；渡潮船→渡月船 ×1；潮信會→沐蝕會 ×3；相信潮是→相信蝕潮是 ×1；殼是召喚→古代機是召喚 ×1；沒有肉的殼→沒有肉的古代機 ×1；殼學會→稽古學會 ×1
- `wf/workflows/planning/specs/world/machine-souls.md`：10處；摹機→衍型機 ×2；殼目→靈目 ×1；殼不看→古代機不看 ×1；沒有人的殼→沒有人的古代機 ×1；潮信會→沐蝕會 ×1；沒有肉的殼→沒有肉的古代機 ×1；殼學會→稽古學會 ×1；殼為什麼→古代機為什麼 ×1；殼不認→古代機不認 ×1
- `wf/workflows/planning/specs/world/mech-lifecycles.md`：17處；摹機→衍型機 ×10；那台殼→那台古代機 ×2；摹製→仿製 ×1；摹一→衍一 ×1；殼目→靈目 ×1；買來的殼→買來的古代機 ×1；殼緣→古緣 ×1
- `wf/workflows/planning/specs/world/monsters.json`：8處；潮錨→蝕錨 ×3；潮壓→蝕壓 ×1；潮信會→沐蝕會 ×2；潮月→蝕月 ×2
- `wf/workflows/planning/specs/world/monsters.md`：6處；殼釘→鎮釘 ×1；潮月→蝕月 ×1；潮錨→蝕錨 ×2；潮壓→蝕壓 ×2
- `wf/workflows/planning/specs/world/opening.md`：5處；第一次潮→第一次蝕潮 ×1；摹機→衍型機 ×2；殼甲→鎧甲 ×1；潮月→蝕月 ×1
- `wf/workflows/planning/specs/world/operations.md`：19處；潮月→蝕月 ×14；再加「潮」→再加「蝕潮」 ×1；被潮吞了→被蝕潮吞了 ×1；渡潮船→渡月船 ×2；潮壓→蝕壓 ×1
- `wf/workflows/planning/specs/world/rifts-and-territory.md`：28處；潮錨→蝕錨 ×13；潮月→蝕月 ×7；潮壓→蝕壓 ×5；潮與殼→蝕潮與墟 ×1；處理潮的源頭→處理蝕潮的源頭 ×1；潮信會→沐蝕會 ×1
- `wf/workflows/planning/specs/world/ruins-and-ancient.md`：25處；殼訊→夢召 ×5；上一次潮→上一次蝕潮 ×2；前潮文明→先蝕文明 ×1；不知成分的殼→不知成分的裝甲 ×1；一層殼→一層裝甲 ×1；靠近過殼→靠近過墟 ×1；23 處殼→23 處墟 ×1；月面有殼→月面有墟 ×1；而潮隨→而蝕潮隨 ×1；摹機→衍型機 ×3；殼學會→稽古學會 ×1；潮信會→沐蝕會 ×1；新的殼→新的古代機 ×1；殼只對→古代機只對 ×1；潮月→蝕月 ×1；殼不認→古代機不認 ×1；沒認主的殼→沒認主的古代機 ×1；殼睡→古代機睡 ×1
- `wf/workflows/planning/specs/world/setting.md`：21處；潮與殼→蝕潮與墟 ×3；第一次潮→第一次蝕潮 ×2；裂縫「潮」→裂縫「蝕」 ×1；遺跡「殼」→遺跡「墟」 ×1；潮開到哪→蝕潮開到哪 ×1；殼就在附近→墟就在附近 ×1；潮信會→沐蝕會 ×2；說潮是清洗→說蝕潮是清洗 ×1；殼是棺材→墟是棺材 ×1；摹式→衍式 ×1；那台殼→那台古代機 ×1；摹→仿 ×1；殼訊→夢召 ×3；摹一→衍一 ×1；摹機→衍型機 ×1

## 殘留

已執行交接書指定的全 wf `git grep -nE`，共3652筆命中行。逐處位置與理由已列入 `residuals.json`（已刪，見 git 0c71561 之前）：`file`、`line`、`occurrences`（1-based字元位置與詞）、`reason`。

允許清單內共50行：新詞「蝕潮」（含書名與第一次蝕潮）、大潮與潮汐形容、潮狼、潮濕、劇情高潮，以及四處非古代機的殼體本義；每個命中個別列理由。其餘3602行位於清單外，逐行列明禁止越界修改的理由，沒有順手修改歷史文件或其他線領地。

## 驗收（交接書固定4條）

1. `git status --short`：19份修改皆在允許清單，另僅原有 `?? node_modules`；件數未超20，所有允許文件改後行數與原檔相同。未 commit。
2. `bash wf/tools/wf-lint.sh --strict .`：改前／改後皆 exit 1，輸出完全相同；本批改檔0新違規。既有問題為 broken=3、oversize=1、biglist=2，均在本批範圍外。證據：[改前](lint-before.txt)、[改後](lint-after.txt)。
3. 殘留逐處附理由；20份文中沒有「古機」「蝕盛」「蝕歇」。
4. 本報告第一段已列出先讀行全部路徑；定案表五類已讀。

## 沒做到或證據不足的

無本批未完成項。全庫 lint 原有違規仍在，交接書要求本批0新違規，未越界修理。`rules-attack-resolution.md`無應換舊詞，故0改動。

## 需要決定的事

表外構詞已依交接書規則處理並交上游知悉：`潮浸→蝕浸`（world/README.md:26、world/bio-mechs.md:11），指異形在蝕域恢復活性；`非摹式→非衍式`（world/setting.md:40），沿用表列「摹式兵器→衍式兵器」。其餘無待決事項。

## 子代理

無；由 cx-rn-d2 親自閱讀、換詞與驗收。

## 以後交接書該點名的工具

無。

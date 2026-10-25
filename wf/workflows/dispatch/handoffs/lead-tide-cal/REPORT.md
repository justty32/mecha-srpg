# REPORT — lead-tide-cal：曆函式與天象旗（engine-backlog 38）＋醒魂改讀大潮（2026-10-26）

STATUS：**DONE**。commit `0c43b0f`（引擎＋十五條天象＋測試）、`8745992`（醒魂改讀大潮）、`9a3f885`（spec 落地）、`33e6790`（content/index 分片＋tide-sky 入口註記）。

## 做了什麼

- **純函式**（`src/ops/state/omens.ts`）：`stage(dom)` 潮候五段（潮前三日／漲潮日／退潮三日／小潮／平潮日）、`omens(day)` 進行中天象、`tide(day)` 潮級 0–4、`eclipseYear`。潮級規則：平潮 0、小潮／潮前／退潮 1、漲潮 2；只在漲潮日疊天象——`tideDelta` 相加上限 3，`setTide` 優先、多個取最大（連珠 4 壓過枯潮 1、枯潮壓過迫月）。
- **Clock** 加 `stage`／`tide`／`year`（`clock`／`skyAt`）；tick 段 1 與開局寫 `flags["omen:<名>"]=1`、窗外刪旗；cond 加 tag `tide:<stage>`，ref `calendar.tide`／`calendar.year` 直接可用。
- **內容**：`calendar.json` 加 `monthsPerYear:13`、`epochMonth:247`（開局＝蝕曆二十年），取消 `special`（check 遇到報錯）；新 kind `world/omens/` 十五條（月相 2、迫月、重蝕、月隱、五星、四時、連珠潮），`effects` 先空著（39–42 再接）。相位把元年第一日定成迫月＋重蝕＋五星同在，所以「2089 第一次蝕潮是重蝕＋連珠」由公式自然成立。
- **check** `omenErrors`：週期是整日數、窗長、排定日、湧現引用、效果 kind 屬八類，以及帶潮級修正的窗至少涵蓋一個漲潮日；已證明能變紅（五種壞資料各擋一條）。
- **頻率**（200 年模擬）：大潮每年 2.21 次、枯潮 0.5、連珠 0.09（第 40 蝕月排定一次，下一次湧現在第 173 蝕月）；開局十年內只有第 40 蝕月一次連珠。
- **醒魂**：`cockpit-growth.ts` 的潮骰改成當日潮級 ≥ 3（`GREAT_TIDE`，大潮或連珠）；pilots spec、drive 筆記的 SPEC-GAP 句同步。
- **spec**：time-and-tick 曆段改寫並拆子檔 `time-and-tick/calendar.md`（原檔超 8 KB）；content-format-ops/world 曆與天象範例；constraints-ops 加 USR-14、WV-07 補註；world/omens 加引擎現況。百科 kind 名「天象」；code-map ops 列補上。

## 驗證

乾淨 worktree 於 `33e6790`：`npm test` 950／950、`npm run check` 0 錯（world 12 警告、core 8 警告，與前同）、`npm run typecheck` 0、`node content/lore/check.ts` 0 錯 2 警告、wf-lint 本線檔 0 項。**黃金不變**（戰役黃金只雜湊事件日誌，Clock 新欄與 omen 旗不進事件；戰鬥未動）。主工作目錄同時有 resist／ironsword 未提交改動，那邊跑會紅 12 條（戰役與戰鬥黃金），已用乾淨 worktree 證明與本線無關。

## 沒做到或要知道的

- engine-backlog 第 31 列只剩顯示字串改名（UI 仍把漲潮寫「大潮」：`src/ui-adapter/ops/vm/labels.ts`、`dom/tabs.ts`、`fixtures.ts`、`not-spring-night`、templates／events 幾處）與大潮抬級（＝第 40 列）；不在本線範圍，已寫回第 31 列。
- 迫月週期照 spec 取 7 蝕月，因此大潮永遠撞朔潮（初一）、不會「輪流撞朔望」；要輪流可改 7.5（210 日，頻率約 1.7 次／年＋食）。
- 天象旗用 `omen:<名>`（沿用 `uplink:selene` 的旗名慣例）；backlog 原文寫的 `{"tag":"omen/…"}` 是 id，不是 tag。
- 事故：scratchpad 與別線共用，我第一次 `git worktree add` 撞到別線已建的 `wt` 而失敗，誤把本線檔案拷進那個 worktree、並在 `node_modules/` 下建了一個自我連結；已當場還原（那個 worktree 的本線路徑 checkout 回 HEAD、刪掉我拷進去的新檔與連結），對方原有改動未動。往後各線在 scratchpad 請用線名子目錄。

## 需要決定的事

1. **醒魂機率**：改讀大潮後，潮骰的機會從每年約 23 次（漲潮日）降到約 2.2 次，等於潮的醒魂率少約十倍。要維持原來的總量，就把 `cockpit.json` 的 `awakenChanceTide` 從 1/10000 調到約 1/1000；不調就照「大潮才醒」的字面。
2. 迫月週期 7（只撞朔潮）或 7.5（輪流撞朔望），見上。

## 以後交接書該點名的工具

`python3 -I wf/tools/content_index.py`（新增內容 kind 後 npm test 會驗分片）；驗收用乾淨 `git worktree`（主目錄常有別線未提交改動）。

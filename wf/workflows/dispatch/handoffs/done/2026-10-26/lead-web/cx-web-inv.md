# 任務：唯讀盤點網頁介面（戰鬥／營運／百科）缺口，產出依價值排序的缺口清單（cx-web-inv）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ui-adapter 段）——親自讀。

## 背景與唯一目標

上一輪新增了大量內容（新骨架、移動類別飛行／履帶／潮行／掘進、新部件與能力、新怪獸生態位、百科新欄位 nameEn／etymology／occurs／visibility 傳聞）、聲望門檻、大潮曆與天象旗。要知道網頁介面哪裡沒跟上。唯一目標：寫出缺口清單 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md`。

## 範圍（排除法寫死）

唯讀。只讀 `src/ui-adapter/`、`src/mcp`／`src/ops`／`src/core` 與 `content/` 中為了判斷「資料有、畫面沒顯示」所需的檔（只讀）。**不寫任何既有檔**，只寫上述 REPORT 與 `.../lead-web/inv/` 下附件。不改規則與數值。件數 gate：REPORT 條目超過 40 條就合併相近項到 40 以內。

要查的題目（每題給：現況＝讀哪個檔哪個函式、缺口、建議改法與要改的檔路徑、規模 S/M/L、是否需引擎新功能）：
1. **聲望門檻**：營運市場對聲望不足的機（購買回 `reputation-required`，見 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`；`src/ops/world` 的 `repGate`／`repGateBlocked`）如何在 UI 呈現；要做到「需要〈勢力〉聲望 N」灰按鈕，需要 snapshot 加哪些欄位、哪些檔。
2. **大潮／漲潮用字**：`src/ui-adapter` 與其 fixtures 裡所有把朔望「漲潮」寫成「大潮」的字串（engine-backlog 第 31 列；識別字 spring 不改），逐處列檔案行號與建議新字串。
3. **大潮曆／天象**：營運 UI 現在看得到潮級（枯潮／漲潮／大潮／連珠潮）、天象旗、下一次大潮日嗎？資料來自 `src/ops` 哪個函式、要放在哪個面板。
4. **戰鬥 UI 新內容**：新骨架、移動類別（飛行、履帶、潮行、掘進）在戰鬥 UI（移動範圍、tooltip、單位卡、部位面板、labels）的呈現是否完整、有無顯示 raw id 或英文鍵；新部件／能力／怪獸生態位同理。到 `content/base` 列出實際存在的 kind／moveClass／能力 id 集合，與 `labels.ts` 等對照找缺漏。
5. **百科**：對所有 content kind 與欄位（nameEn、etymology、occurs、visibility 傳聞、新 kind）逐一核對卡片是否完整顯示；列出被忽略的欄位與沒有中文名的 kind。
6. **整體可用性與一致性小修**：raw id 外露、空狀態、灰按鈕沒寫原因、快捷鍵提示缺漏、文字溢出等；只列有證據（讀到程式碼）的。

另在 REPORT 末尾標出每條涉及的檔是否屬於這批「他線登記、本線不得寫」的檔：`src/ui-adapter/vm/controller.ts`、`vm/types.ts`、`vm/viewmodel.ts`、`vm/text.ts`、`ops/vm/snapshot.ts`、`ops/vm/types.ts`、`ops/dom/tabs.ts`。

## 資源與禁區

唯讀調查線，`-s read-only`。共通禁區：不碰鍵盤、滑鼠、螢幕（不截圖、不開瀏覽器）；不開 GUI；不 push、不建分支、不 commit；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不上網；不用 MCP。子代理上限 3 個（可按題 1–3、4、5–6 分開讀），只准為推進正事開，全部唯讀。

## 工作

1. 讀先讀清單，依 6 題調查。
2. 把結果寫成 REPORT（四段：做了什麼／缺口清單（含排序建議）／沒查到的／需要決定的事）。
3. 完成後回覆 5 行摘要與 REPORT 路徑。

## 交付

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md`（若沙箱不能寫，就把全文放最後一則訊息，由調度者存檔）。

## 驗收（固定 3 條，做完就停）

1. REPORT 含 6 題各自的小節，每個缺口有檔案路徑與規模。
2. 第 2 題列出全部「大潮」誤用字串（附行號）。
3. 第 4、5 題各附「資料集合 vs 已有顯示」的差集清單。

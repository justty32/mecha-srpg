# 任務：今日機甲原型與工作流收尾、拆檔及tidy

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/STRUCTURE.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model.md`、`wf/workflows/refactor/README.md`、`wf/workflows/refactor/moving-things.md`、`wf/workflows/tidy/README.md`、`wf/workflows/tidy/gotchas.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/data-files.md`、`wf/workflows/testing.md`、`wf/workflows/dispatch/README.md`。每位實質工人親自讀適用規矩。

## 背景與唯一目標

使用者說「今天先這樣，按照wf/規矩收尾，整理，重構拆檔+tidy」。停止新增功能與美術，按職責整理今天兩個美術試作與必要wf活文件，保持全部語意、視覺及行為不變，驗證、提交並push後收工。基線 `f494406d`，完整新原型先配置、64獨立SVG、18骨、7姿態，原型README有重建與驗證指令；前輪core12/12、headless20/20及wf-lint綠。

## 已盤點病灶與邊界

1. `art/mech-blueprint/layout.ts` 173行約18KB、最長676字；`geometry.ts`180行約12KB；`viewer.js`59行約9KB、最長918字；`headless.mjs`65行約10KB；`verify.ts`57行約7KB；`style.css`3行約4KB。行數未超不等於易維護。先格式展開，再按空間配置、幾何運算/解析、DOM/狀態/控制、驗證與證據分職責拆；不要硬切等長或改算法。
2. `art/svg-study-1027/check-tree.cjs`363行約23KB、`style.css`357行：依檢查責任與樣式區塊合理拆分；`rebuild.py`225行約16KB長行、`demo.js`238行約12KB可檢視職責，只在有具體收益時整理。這是舊美術示範，不重畫、不改配方。
3. `wf/workflows/dispatch/handoffs/STATE.md`8210bytes，根層混大量續行細節；拆成薄導航與有明確職責的續行檔，保留未完成狀態。`wf/workflows/common/user.md`接近8KB，可按美術/團隊/環境等語意拆下一層，主入口保留always-on邊界與導航，不重述、不改裁示。
4. SESSION/WAIT/CLAIMS/next-session及看圖入口仍有「等回家」與「本checkout缺small report」敘述，當前已在家且small report可見；只根據實際證據校正現況，不把未驗世界觀或舊線標完成。今天新機甲已完成、舊新美術待主觀評閱，明確寫好下次入口。
5. 其他活handoff有超大歷史報告，但仍屬舊暫停線或待驗收批次；本輪只記盤點與例外，不為門檻竄改歷史報告/猜收線，也不讀整份表入context。現有未追蹤inbox和其他handoff保留，不盲目提交、搬移或刪除。

## 範圍（排除法寫死）

- 可寫 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/` 的手寫程式、樣式、測試、README及由其生成的入口/診斷/驗證證據；`parts/*.svg`、data設計數值、姿態/骨架與overlap內容只讀，64件必須保持獨立，不以小檔合併規則合併它們。
- 舊試作僅 `art/svg-study-1027/check-tree.cjs`、`style.css`、`rebuild.py`、`demo.js`、`index.template.html`、`index.html`、`README.md`、必要新子模組及子目錄README；其他來源SVG/JSON/CSS只讀，既有生成圖原則不改。
- wf可寫 `wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/dispatch/CLAIMS.md`、`wf/workflows/dispatch/handoffs/STATE.md`、`next-session.md`及其必要新續行子檔、`wf/workflows/common/user.md`及其新語意子檔、`wf/workflows/common/code-map.md`、`wf/notes/art-review-2026-10-27/README.md`與本線handoff。`wf/INDEX.md`/common README只改必要導航。其他舊線REPORT只讀。
- 自己的管理目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy-mech-1027/`，收工歸檔可寫 `handoffs/done/2026-10-27/` 的本線路徑及done索引只追加。授權領導收本線SESSION/CLAIMS並歸檔母brief，避免完成後留下活條目。
- 不做：遊戲src/content/spec/legacy變更、工作流制度/工具kernel/AGENTS.md變更、新效果/互動/造型、全repo重構、別條線worktree/logs/inbox清理、依賴或lockfile變更。
- 件數 gate：本輪實質變更最多80個檔（本線歸檔搬移不重複計）；容量 gate：新增內容/證據最多10MB。任何gate觸發先回報具體需要，不擴界。

## 必用工具

| 工具 | 用途 |
|---|---|
| 原生agent工具 | 派工、等待、收件，不用inbox |
| `python3 wf/tools/brief_lint.py` | 子brief嚴格檢查 |
| `node --test`與原型README命令 | 基準/變更後定向驗證 |
| `node art/mech-blueprint/headless.mjs` | 新原型行為與圖像回歸，前後各一次由領導排程 |
| `view_image` | 檢視必要新影像差異 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件與連結驗收 |
| `python3 wf/tools/fix_moved_links.py` | 搬檔連結dry-run後修正；封存鏈不導回archive |
| `git diff --check`、`git diff --name-status -M`、`git log` | 精確範圍、搬移和提交核對 |

## 資源與禁區

- **可寫程式碼線**：只按上列寫集。領導負責盤點/固定寫集/驗收/整合，不包辦所有工人工作。
- 領導可用gpt-6-sol（前輪6.1-sol曾capacity中斷）；工人模型自由，普通程式可sol、簡單文檔可terra，不需美術生成。子代理同時最多3，全隊平行工人最多3；每線單一路徑寫權。
- 全機重負載最多1，先依user.md查程序，nice -n19；工人僅定向輕量檢查，headless/完整批次由領導排程。無遊戲源碼變更不跑整包npm suite/fuzz/sim。
- 不GUI、不桌面、不下載/安裝、不刪檔、不改全域設定、不force push/reset/rebase。搬移來源須已commit/push，先複製驗證再以可追蹤rename收尾，不留雙份活真相。一般push已由使用者授權。
- 基線已有他線未追蹤檔，先記清單並保持，不納本線；只逐檔stage和提交，禁git add -A/目錄級add；工人不commit，由領導統一。

## 工作

1. 讀規矩與已列病灶，補有限盤點，寫2–3條互斥子brief與moves.tsv，記baseline（公開入口、JSON/SVG輸出、來源資產hash、core tests、headless視覺/操作）。固定基準，不以改掉測試來掩蓋行為差異。
2. 程式線拆新原型模組、舊試作檢查/樣式；文件線做wf薄入口、活狀態與接續。入口命令、index.html路徑與公共exports盡量保留薄wrapper，讀者/重建者不必猜新路徑。每個有用途的子目錄留短README，原則不改被搬檔名；拆出的新檔按責任命名。
3. 對比變更前後：64資產及設計資料hash不變，布局/工作單/組裝SVG/診斷語意不變，headless20項與六張正式PNG等效；bundle/index的bytes因模組整理可變但使用者可觀察行為不得變。舊試作依受影響工具做基準/變更後指定檢查與視覺/建置核對。
4. 文件只列open、最新待評閱不漏、舊世界觀仍pending。來源與歷史記錄分清；今日規劃/交接已在done，不翻修舊證據。保留需下次處理的範圍外事項，不展開舊工作。
5. 完成整合驗證、更新code map/README、REPORT及moves.tsv，精確commit/push；最後收本線agents/背景程序、活條目、母brief與報告歸檔並一般push。

## 交付

- 入口保持 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/index.html` 與 `/home/lorkhan/repo/game_dev/mecha-srpg/art/svg-study-1027/index.html`。
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy-mech-1027/REPORT.md`，收線後同名移至done/2026-10-27的本線目錄；附before/after檔案職責/行數、精確驗證與hash差異判斷、未做範圍、commit/push及程序清乾淨證據。
- 同目錄 `moves.tsv`、必要小型JSON盤點表；同質>1KB清單遵wf-table/1，使用tabledb讀寫。

## 驗收（固定6條）

1. 已列程式病灶按職責拆分且可讀；手寫源單檔原則<=300行，必要不可分例外明列原因，禁止壓行數假達標。
2. 64SVG與機甲配置資產hash不變，前後生成SVG/JSON語意等效，指定核心測試/strict型別/20項headless綠且六圖等效；舊試作受影響命令前後同綠。
3. 公共入口/重建命令有效，六類搬移斷裂掃描與moves.tsv有證據，必要README及code-map已同步。
4. 本輪活wf入口都在大小門檻內，歷史/當前/待驗收分清，使用者在家及small報告已可見的事實校正；不冒稱舊驗收完成。
5. wf-lint --strict與diff --check綠、基線他線未追蹤檔不變、精確本線commit及普通push成功。
6. 本線agents/背景程序均結束，SESSION/CLAIMS無本線open、交接已歸檔、下次從看圖/未完成清單可接續。

## 回報

原生工具回傳里程碑與最後DONE/BLOCKED，最終給5行摘要、REPORT絕對路徑及commit。等待工人用工具，不以回合結束冒充等待。遇到已存在紅燈先區分，不順手修範圍外程式。

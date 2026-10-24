# codex-handover — codex 接手指南：新增內容與文字潤飾

[handoffs](README.md)｜交棒 [STATE](STATE.md)｜非 codex 工作 [engine-backlog](engine-backlog.md)｜試點 REPORT [lead-codex-pilot](lead-codex-pilot/REPORT.md)

從 2026-10-24 下一個 session 起，codex 大量接手內容。**codex 只做兩件事：新增內容、潤飾文字。**改引擎、加欄位、改 spec、改既有數值、平衡調整、`world/lineages`／`world/models`、registries 都不歸 codex，寫進 REPORT「需要決定」交領導，領導再轉 [engine-backlog](engine-backlog.md)。

## 入口（親自讀，不靠本頁摘要）

先讀 `AGENTS.md`，再讀 [content 工作流](../../content/README.md)全部：

- [world-pillars](../../content/world-pillars.md)：世界觀守則 31 條，含「用語過渡」一節。
- [numeric-bands](../../content/numeric-bands.md)、`engine-facts.json`：數值帶，以及哪些欄位填了是死資料。
- 一批的流程：[batch](../../content/batch.md)、[polish](../../content/polish.md)、[playtest](../../content/playtest.md)；派線配方與試點踩到的坑在 [dispatch/content-batch](../content-batch.md)。
- 用語：`content/lore/style.md`，原文 `wf/workflows/planning/design-notes/terms.md`。

## 配置

**領導**：Opus。開 manifest、開隔離 worktree、派工、跑 `content_accept.sh`、帶回 main。

**工人**：codex `gpt-6-astra`，加 `-c model_reasoning_effort='"high"'`。沙箱是 `-C <worktree> -s workspace-write`，`--add-dir` 只給 `wf/inbox` 和該批報告目錄。MCP 試玩走 stdio：`node src/mcp/server.ts`，沙箱不准 socket listen。

**子 agent**：工人可以再派，模型隨意，上限寫在交接書裡。子 agent 同樣受閘門約束，也要**親自讀規矩**，並在自己的 REPORT 開頭列「已讀清單」；`content_accept` 會比對這份清單。

**護欄**：閘門 `python3 -I wf/tools/content_gate.py` 只認 manifest 宣告的路徑與欄位。驗收鏈 `bash wf/tools/content_accept.sh <wt> <manifest> --record`。帳本是 `content/batches/<YYYY-MM>/<batch>.json`。索引用 `npm run content:index`；查索引分片要帶條件，**不整份讀**。

**規模**（照試點）：新增 10–15 檔、單一主題，約 30 分鐘、50 萬 tokens，含 1 輪退回；潤飾 10–20 檔；lore 5–8 件；可 3–4 批並行，但同一個路徑同時只能有一批。

**驗收的可選步驟**：命名審查。把新名字交給 `agy --model gemini-4-argon-high` 純文字審翻譯腔，結果摘要記進 manifest 的 `namingReview`；明顯翻譯腔就退回。用法見 polish「首要標準」。

## 命名與用語（本段落的頂層決定）

- 新內容一律用新詞：全庫已由 lead-rename 改名完成（2026-10-24），定案表 `wf/workflows/planning/design-notes/terms-rename.json`（稽古學會、守寢人、夢召、古緣、墟、骸片、沐蝕會、渡月船、源流…；大潮／小潮照用）。
- **英文原名不放 `aka`**：`aka` 只放中文別名。在 `nameEn`／`etymology` 補欄之前，英文原名與意涵放在批次 manifest 的命名表。

## 填了會不會生效

已抽到 [codex-effects.json](codex-effects.json)（22 列）。這張表合併了 lead-gaps-battle 與 lead-gaps-ops 兩份 REPORT 的總表，再加上試點的發現。欄位：`類別`（戰鬥／營運／lore）、`目錄／欄位`、`生效？`（會／只顯示／不會／不歸 codex）、`條件／備註`、`來源`。

**派批次前先查這張表：標「不會」的不要派。**目前不生效的有：`molt`、`territorial`、`barks/`、`passive`、`encounters/place-*`、world-grid 各資料夾、獸緣古緣接營運。這些要等 engine-backlog 補上。

## 可直接開工的批次

已抽到 [codex-batches.json](codex-batches.json)（10 列）。欄位：`序`、`批次`、`模式`（add／polish）、`允許的 kind`（相對 `content/`，寫進 manifest 的 `allow`）、`規模`、`注意`、`狀態`。

**第一批是用語改名＋翻譯腔重審**（polish 模式，全庫按類別切成多批；**已完成**，見 `handoffs/lead-rename/REPORT.md`）：

- 依 terms.md 換詞，配 agy 審查。
- 衍生詞已依使用者授權由改名線經 agy 審查定案（terms.md 末段）。
- glossary.json 與 style.md 由領導改，不交 codex。

之後的批次，可以照表上的順序，也可以並行：

1. 第三刃與背面的 lore 與事件。
2. 人類對手機體與配裝。
3. 更多營運事件與對話。
4. 各勢力 lore。
5. A 級以上怪獸二名。
6. 地圖與情境。
7. `aka` 別名。
8. 英文原名命名表（只寫 manifest）。
9. 新怪獸、古代機、機魂、人物。

## 交接

- 一批收件就更新 manifest 與索引，照 [batch](../../content/batch.md) 第 9–10 步。
- 遇到引擎缺口，追加到 [engine-backlog.json](engine-backlog.json)。
- 守則要改，不在本頁改，走 planning。

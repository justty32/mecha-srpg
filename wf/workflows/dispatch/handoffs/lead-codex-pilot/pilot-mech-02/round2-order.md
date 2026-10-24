# 退回重做（第 2 輪）— pilot-mech-02

領導驗收（`accept/verdict-1.json`）：閘門、check、lore、ops、typecheck、已讀清單、試玩紀錄過；**npm test 8 fail、probe 未過**。只做下面四件事，其他不動。

1. **world/models 與 world/lineages 移出本批（領導已代你搬走，別再建）**：新增通用血統 `lineage/universal-ironsword` 會讓營運戰爭研發多一條血統，5 條黃金戰役與 MCP 戰役測試的 hash 變動，另有 `src/ops/war` 一項測試在新血統下讀到 undefined（`點數逐月轉入done不重複計入…`）——這要頂層授權重產黃金並由引擎線查，不屬內容批次。你的 5 個 models 與 1 個 lineage 原檔已存到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-codex-pilot/pilot-mech-02/deferred/world/`，留給下一批。frame、部件、能力、情境、lore 事件、timeline 照舊保留；lore 事件若引用 `base:` 的 lineage／model id 請改成不引用。
2. **`ability/ix-line-shot`（平射）是死資料**：probe 中三個載體（IX-III、歸航-鐵劍、展示情境）主角**都沒用過它**。先查非數值原因（`ai.tactics` 鍵、射程、AP、成本池是否存在於載體、和同機其他招比估值）讓 AI 會用；另外它掛在 A 級隊長機上時被判 A 帶外（AP 3 < 4、單發 22 < 24、armorPen 0 < 0.15）——隊長機改用合 A 帶的武器（可新增一把 `ix-` 部件或用既有 A 級武器），平射留給低級機。
3. **展示情境 `scenario/ix-common-road` 太容易**：AI 對 AI 玩家 5/5 勝。調到 probe `--n 10` 玩家勝率落在 40–90%（加敵、改部署距離或輪數，一次一個旋鈕）。
4. **命名審查**（外部審查員 gemini-4-argon-high）：`component/ix-field-plate`「行裝鎧甲」——「行裝」是行李之意，與 field（野戰）語義錯位，改名（例「野戰鎧甲」，自己判斷）並同步 naming.json。其餘可。

完成後重跑 `content:probe`（每台 `--n 5`，情境 `--n 10`）與受影響的 MCP 場次（隊長機換武器就補 1 場），更新 REPORT 相關段、naming.json、playtest.json。

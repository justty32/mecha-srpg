# mecha-srpg — AI agent 專案備忘

mecha-srpg = **回合制機甲戰術 SRPG 起手專案＋11 章教學：Python 主體、可選 C++ 熱點（mtcore，pybind11）、python-tcod 打底**。本檔是最頂層路由器，只指向下一層；細節不寫這裡（分層原則見 [STRUCTURE.md](wf/STRUCTURE.md)）。

## 開場與入口

- 每個 session 先跑 `grep -c '^- \[' wf/SESSION-LOG.md wf/WAIT_USER.md`：非 0 才開 [SESSION-LOG.md](wf/SESSION-LOG.md)（進度）/ [WAIT_USER.md](wf/WAIT_USER.md)（等使用者）。
- **設計契約**：[SPEC.md](SPEC.md) 是唯一真實來源；跨模組介面分歧待辦在 [INTEGRATION_NOTES.md](INTEGRATION_NOTES.md)；背景見 [PROJECT.md](PROJECT.md)。
- **碰原始碼前**：慣例與 code map → [workflows/common/conventions.md](wf/workflows/common/conventions.md)、[workflows/common/code-map.md](wf/workflows/common/code-map.md)；環境與指令 → [workflows/dev-env.md](wf/workflows/dev-env.md)。
- 開場也跑 `wf/tools/inbox_read.sh wf/inbox/new`（升級後五通道的頂層格；跨 repo 投進 `wf/inbox/` 頂層的信用不帶參數的 `wf/tools/inbox_read.sh`）：有信就先讀（信件軸，見 [workflows/inbox/](wf/workflows/inbox/README.md)）。
- 要開 agent 團隊、決定各層派哪級模型 → 先看 [workflows/team-model.md](wf/workflows/team-model.md)（本專案固定配置：頂層 Fable 5.1 → 領導 Opus → 工人 codex gpt）。
<!-- wf-insert:AGENTS -->
- **要你動手做事** → [WORKFLOWS.md](wf/WORKFLOWS.md) 依意圖派發，再讀該工作流入口檔。
- **想看專案結構** → [INDEX.md](wf/INDEX.md)。
- 使用者偏好與邊界 → [workflows/common/user.md](wf/workflows/common/user.md)。

## 鐵律（always-on，隨時適用）

1. 重構 / 整理**不改原意**：開發＝行為不變且驗證綠燈（`python3 -m compileall -q src && bash wf/tools/wf-lint.sh --strict .`；細節見 [testing](wf/workflows/testing.md)）；非開發＝原意不變，照 `Done when:` 驗收。
2. **不可逆或對外的動作**（push、刪除、對外送出、動 DB）要有**授權來源**：使用者當場確認，或他親自登記在清單裡（routines / schedule）。都沒有就先問。
3. **條列走資料檔、導航留 md**：給 AI 消化的表／清單 >1 KB 存 `.json`／`.csv`（契約 `wf-table/1`，見 [data-files](wf/workflows/common/data-files.md)），用 `tools/tabledb.py` 讀寫、不整份讀進 context；給人點的導航連結留 md。
4. **具體流程**在各工作流入口檔，不在頂層。

<!-- wf-kernel v0.6 (2026-09-02) -->

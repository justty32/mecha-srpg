# team-model — 誰來做：角色三層、聰明度分級、選人判準

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

本檔記**誰來做**——分幾層角色、每層派哪一級的模型、按什麼順序選人。**怎麼做**在別處：切線與交接書見 [dispatch](dispatch/README.md)，資源鎖見 [resources](resources.md)，通訊見 [inbox/PROTOCOL](inbox/PROTOCOL.md)。

**何時用**：要開一個 agent 團隊、要決定某一層派哪級模型、要按用途分角色。
**何時不用**：只有一條線、一兩個檔的小改（見 [dispatch](dispatch/README.md) 的「何時不用」）；只是要送一則情報 → [inbox](inbox/README.md)。

## Done when

- 這一輪要開的每一層都**指名了誰**——頂層、領導、工人各自是哪一格（預設照下表）。
- [grades](team-model/grades.md) 的分級表與消耗速度表若有新模型，已加列並標日期。

## 一、角色三層（本專案固定配置，使用者 2026-10-23 定）

<!-- wf-nav -->
| 層 | 誰 | 怎麼開 | 職責 | 不做 |
|---|---|---|---|---|
| **頂層** | 主 session，**Fable 5.1** | 使用者直接對話的那一個 | 只跟使用者溝通、做最終決策、分配資源與授權；開領導、收領導的匯報 | **不實作**；**不親自逐則讀信**（信由領導消化後匯報） |
| **領導（隊長）** | **Opus** | 頂層用 Claude Code 的 Agent tool 在行程內派出 | 讀交接書、拆工、寫子線交接書、派 codex 工人、監看、驗收、收線；向頂層匯報時**重寫標題、帶判斷** | 不越過交接書授權；不親自做工人的量 |
| **工人（隊員）** | **codex gpt**（預設 `gpt-6-astra`，`gpt-6-sol` 亦可）；Claude Sonnet／Opus 子 agent 為輔 | 領導用 `codex exec`（[codex-exec](dispatch/codex-exec.md)）或 tmux（[cx_launch](dispatch/driving-cli-agents.md)）派；Claude 子 agent 由領導用 Agent tool 開 | 照交接書做一件事、寫 REPORT 檔、回報終局狀態 | 不改交接書範圍、不自行加碼驗證 |
| **規劃（spec／plan、架構設計）** | **Fable**（主 session 或 Fable 子 agent） | 頂層自己寫，或用 Agent tool 開 Fable 子 agent | 產出 spec／plan 交給領導執行 | 不派工、不監看 |

**派誰的預設**：實作與量大的活**盡量派 codex gpt**，模型隨意（對 ChatGPT 帳號**不要用 `gpt-sol` 這個別名**，會被拒；用 `gpt-6-astra`／`gpt-6-sol` 全名）。Claude Sonnet／Opus 子 agent 適合 merge、查資料、要和 Claude 頻繁來回的活。規劃類交給 Fable，因為領導拆工的品質取決於 plan。

**隊伍數量無上限**，以協調得過來為度；**領導層不要開太多**——量壓在工人層。判準是「領導監看得過來嗎」：**開了卻沒人盯的線比不開更糟**。單一、有界、驗收寫得死的工作可以直接開一條 codex 線掛在頂層底下，不必配領導。

**實質工作的 agent 先親自讀 wf 規矩**（`AGENTS.md` → 本線用到的工作流入口與 [common/user](common/user.md)），不能只靠上層摘要；簡單工作與雜活例外。交接書範本的「先讀」行就是為此（[TEMPLATE.handoff](TEMPLATE.handoff.md)）。

**硬禁區（全專案，每一層都適用）**：絕不碰鍵盤、螢幕、滑鼠；不開 GUI 視窗；Godot 只准 `godot-mono --headless`；push 已授權（2026-10-24）；刪除要使用者確認。

**資源授權的源頭是使用者**——頂層只是代為分配，不能自己創造授權（見 [resources](resources.md)）。頂層對使用者說話要適合理解：初次出現的東西先用白話講一句；預設不必逐項翻譯。頂層可開**私人輔助者**（查資料、盤點），不算團隊 headcount，沒指定就默認兩個，優先用 codex 線。

**領導**自己 context 吃緊時寫 state 檔交棒（`dispatch/handoffs/STATE.md`），不硬撐；交接書的**範圍詞會被線遞移展開**，範圍用排除法寫死、件數 gate 與容量 gate 並列（見 [dispatch](dispatch/README.md)）。

**工人**再開子 agent 我們不管——它在那一層就是領導；交接書只寫它能用多少（「子代理上限」）。

## 二、三、聰明度分級與 token 消耗速度

兩張表（哪個模型幾級、消耗速度與性價比結論）拆到 [grades](team-model/grades.md)；有新模型就在那裡加列並標日期。結論一句：**gpt-6-astra／gpt-6-sol 是聰明度 A、消耗 C 的性價比之神，工人層主力**；Fable 只留給頂層與規劃。

## 四、選人判準（按序看這六項）

1. **任務難度／內容**——決定聰明度下限；規劃與架構固定給 Fable。
2. **使用者給的 headcount**——外生的上限；沒給就以「協調得過來」為度，不自己加碼。
3. **token 消耗速度**——工人層大量用 codex gpt，Claude 額度留給頂層、規劃與領導。
4. **溝通方便與否**——跨體系即使有 inbox 仍有成本，所以**領導用 Opus 不用 codex**。
5. **管理上限**——**開太多領導不好管**；寧可少開領導、把量壓在工人層。
6. **時程**——用「產出速度 × 繞圈數 × 模型癖好」反推每段派誰、排多久，算法與逐模型心得見 [speed](team-model/speed.md)。

## 五、方案與時間軸

隨帳單與錢包變動，替代表與連帶效果拆到 [plans](team-model/plans.md)。

## 六、context 管理

每層管自己下級的 context：頂層（Fable）的 compact 跟使用者商量；領導（Opus）管自己的 Claude 子 agent；codex 自帶 auto-compact。五條規則見 [context](team-model/context.md)。

## 七、信箱——三句話版

Opus 領導與 Claude 子 agent 都在行程內（Agent tool 回傳），**codex 工人在行程外，走 [inbox](inbox/README.md)（放信處 `wf/inbox/`）**。誰為哪些 STATUS 醒以 [inbox/wake-policy](inbox/wake-policy.md) 為準：

- **頂層（Fable）**平時不掛醒鐘、不逐則讀信；只等領導在行程內回傳的匯報，以及 `NEEDS-USER`、`FAILED`、資源／授權請求。
- **領導（Opus）**對自己 codex 工人的五種 STATUS 全醒：前景跑 `wf/tools/inbox_poll.sh <領導> --wait --timeout 540` 或 `wf/tools/cx_watch.sh`，**不可用結束回合當等待**；上呈時**重寫標題、帶自己的判斷**，不是原文轉貼。
- **工人（codex）**沒有醒鐘，每完成一個工作步驟跑一次 `inbox_poll.sh <我> --once` 讀 orders，終局用 `inbox_mail.sh <我> --up`。

## 內容

| 檔案 | 內容 |
|------|------|
| [team-model/grades.md](team-model/grades.md) | 聰明度分級表、token 消耗速度表 |
| [team-model/context.md](team-model/context.md) | 每層怎麼管下級的 context、compact 間隙怎麼預定 |
| [team-model/speed.md](team-model/speed.md) | 執行速度三因素相乘、逐模型指揮心得表 |
| [team-model/plans.md](team-model/plans.md) | 方案與時間軸（隨帳單變動的活頁）|

## 交接

- 切線、交接書、領地表 → [dispatch](dispatch/README.md)；派線用哪支工具 → [dispatch/tool-index](dispatch/tool-index.md)。
- 獨佔資源與鎖 → [resources](resources.md)。
- 通訊契約與醒鐘 → [inbox/PROTOCOL](inbox/PROTOCOL.md)。

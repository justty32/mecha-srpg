# context 管理——每層管自己下級的 context

本頁由 [`../team-model.md`](../team-model.md) 拆出。

context 管得好就是清雜訊，直接提升決策品質；管不好就是把上一段任務的殘渣帶進下一段。五條規則：

- **每個 agent 管自己下級的 context**：**一大段任務結束就 compact**，不要等吃緊了才做。
- **計畫制定者**（領導）制定計畫時就**預定好大段任務之間的 compact 間隙**——哪個里程碑之後誰要 compact，**寫進交接書**，不是事後才想到。
- **頂層**的 compact 跟**使用者商量**：自評到了就說，由使用者決定時機；壓縮前把**續行點**寫進 `SESSION-LOG.md` 或 state 檔。
- **外部 CLI agent** 的 compact 指令**從它的輸入端送**（例：終端多工器送 `/compact`，**內容與送出鍵分開送**，見 [`../dispatch/driving-cli-agents.md`](../dispatch/driving-cli-agents.md)）。它自己也可能會自動壓縮，但**別依賴那個**。
- **沒有外部 compact 入口的 subagent**：改用「**一段任務一條線**」——段落結束就收線、開新線接力，交接書帶**上一段的產出路徑**而不是對話。

**本專案的對應**：頂層＝`gpt-6-astra` 主 session（跟使用者商量）；`gpt-6.1-sol` 領導管自己開的子 agent（普通工作 `gpt-6.1-sol`、簡單工作 `gpt-6.1-terra`；任務單一做完就收、回報 ≤10 行只回結論與 REPORT 路徑）。agent 可再派子 agent，模型無限制。外部 codex CLI 自帶 auto-compact，領導不必替它抓斷點；原生子 agent 是否有 compact 入口依工具能力，不能由模型名稱推定。

# user — 使用者偏好與確認邊界

[common/README](README.md)

agent 不用重猜的事。always-on 鐵律在 AGENTS.md，這裡是**這位使用者**的偏好——改了改這裡，不改鐵律。

**何時用**：使用者說了偏好、講定了確認邊界（哪些事可以直接做、哪些一定先問）、或講定分支慣例／時區／語言時，記到這裡。
**何時不用**：一次性的小事不必記（例如「這次先不要跑測試」）——那是當下的指示，不是長期偏好；長期知識歸屬層的原則見 [STRUCTURE](../../STRUCTURE.md)。

## Done when

對應的那一列已更新（或新開一列），沒有留下與新偏好矛盾的舊值。

| 項目 | 設定 |
|------|------|
| 語言 | 回覆與文件繁中；程式碼識別字英文（既有註解為中文，沿用） |
| 分支慣例 | 2026-10-23 已 `git init -b main`：單分支 `main` 直接 commit；**不 push**（沒有 remote，將來要 push 也要使用者當場確認）|
| 直接做、不用問 | 改文件、加測試、跑唯讀指令與 `wf-lint` |
| 一定先問 | push、刪檔、安裝依賴（任何套件管理器的 install，含 npm／pnpm）、動到本專案以外的檔案（對外動作依鐵律 2）|
| 回覆風格 | 通用風格見 [reply-style.md](reply-style.md)；這位使用者的例外：短、先結論；不要每段都 bullet；使用者問「要不要」時附**可執行判準**（門檻數字）與後果，讓他能改數字 |
| 時區 | Asia/Taipei |

**團隊與禁區（使用者 2026-10-23 定）**：團隊配置是頂層 Fable 5.1（主 session）→ 領導 Opus（Agent tool）→ 工人 codex gpt，規劃交給 Fable，細節見 [team-model](../team-model.md)。事情盡量交給 agent，主 session 只跟使用者溝通、決策、分配授權。負責實質工作的 agent 做事前要**親自讀過適用的 `wf/` 規矩**，不只靠上層摘要；簡單工作與雜活例外。硬禁區：不碰鍵盤、滑鼠、螢幕，不開 GUI 視窗，Godot 只准 `godot-mono --headless`；push 與刪檔一律先問。

領域詞彙常猜錯 → 開 `glossary.md`（見 [common/README](README.md)）。

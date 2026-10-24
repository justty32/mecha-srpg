# decisions — 決策記錄（為什麼選 A 不選 B）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

留下「為什麼」：git log 找得回改了什麼，找不回**為什麼放棄方案 C**。

**何時用**：在兩個以上可行方案裡選一個，且日後可能被問「當初為什麼」。
**何時不用**：只有一條路，或隨時可回頭的小事。決策過程要結構化評估 → knowledge 包的 decide 工作流，結論再落到這裡。

## Done when

- 下表新增一列，且「未選方案與原因」「前提」兩欄非空。

## 記錄（新的在上）

每筆一段：**決定**／**未選方案與原因**／**前提（變了就重看）**。（條列超過 1 KB 會違反鐵律 3，所以用段落不用表格。）

### 整筆在 `decisions/` 子檔，本檔只留導航（2026-10-24 起新決定直接開子檔；2026-10-23 五筆於 2026-10-24 由 lead-tidy 搬出，標題留在下方以保留錨點）

- [bio-ui](decisions/2026-10-24-bio-ui.md)：生物系兩類、沒有餵養（磨損取代飢餓）、四種稱號、UI 按鈕＋快捷鍵。
- [spec-integrate](decisions/2026-10-24-spec-integrate.md)：world-grid 整合進既有 ops spec、太空歌劇只換名不換機制、content-format-ops 拆資料夾、開場樣稿對齊實作與 lore。

### 2026-10-23 ToME4 卷八題的預設（Fable 代決，使用者可逐條推翻）

全文：[decisions/2026-10-23-battle-defaults.md](decisions/2026-10-23-battle-defaults.md)——AP／疲勞都是資源池、熱量 soft 上限、回合開始結算、效果帶 scope、層 HP 可宣告 ablative、古代機共鳴條件、AI 只用共享感測。

### 2026-10-23 技術棧：純 TypeScript＋Vite，邏輯與 DOM 分離

全文：[decisions/2026-10-23-project.md](decisions/2026-10-23-project.md)——純 TS＋Vite 無框架、邏輯與 DOM 分離；未選 Lit／Svelte／Godot。

### 2026-10-23 戰鬥系統十題的預設（Fable 代決，使用者可逐條推翻）

全文：[decisions/2026-10-23-battle-defaults.md](decisions/2026-10-23-battle-defaults.md)——多資源池、BB 士氣、指定部位、層序列結算、傷勢兩類、戰後不補滿、perk、撤離與棄機、共享感測、契約不隨戰力縮放。

### 2026-10-23 現役交接書不套文件大小規則

全文：[decisions/2026-10-23-project.md](decisions/2026-10-23-project.md)——現役交接書不套 8 KB／1 KB 文件規則，改由 brief_lint 把關。

### 2026-10-23 整個專案重做為網頁文字遊戲

全文：[decisions/2026-10-23-project.md](decisions/2026-10-23-project.md)——重做為網頁文字遊戲，舊 Python 版轉 legacy；網頁不好用才改 Godot。

# org — mecha-srpg 按需組織

[專案地圖](../INDEX.md)｜[現行團隊規則](../workflows/team-model.md)

**狀態：已獲准開始使用，採最小按需啟用。** 使用者於本對話表示「規劃好之後就可以開始用了」。先啟用唯讀審查與交接；不建立常駐部門或新 daemon。角色不是常駐程序，以下領域仍須由每次 brief 授權，不會自動變成整片目錄寫入權。實際部署與限制見 [啟用記錄](activation.md)、[執行設定](../aos/README.md)。

## 何時用與完成條件

使用 aos 分工、要開下一輪團隊時使用；單檔小修不必經過全套部門流程。

Done when: 每次派工有明列領地、通道與驗收；成果有終局及證據，臨時 agent 已回收。定義與 smoke test 狀態以啟用記錄為準，不把角色卡存在當作部署完成。

## 建議組織

根 daemon 的 eca_main 作跨專案窗口；mine_mecha 的 main 專責本專案協調與彙報。main 接受本專案直接對話，跨專案資源與彙總回報送 eca_main；同一待決事項不雙重催問。

main 不寫遊戲實作、不逐封消化工人信。每個交付批次按需開一位 lead，負責領地、派工、監看、收件與驗收。只有規劃時不開 lead。design 是規劃職能，不兼指揮；review 必須不是該變更作者。

### 角色入口

- [main 與 lead](coordination/README.md)：窗口、授權轉達、批次調度與整合責任。
- [design 與 content](design-content/README.md)：契約規劃與資料內容創作，兩種不同寫入邊界。
- [dev 與 art](development/README.md)：引擎／介面實作與獨立美術試作。
- [review 與 qa](verification/README.md)：獨立審查、回歸驗證與 astra headless 試玩。
- [通信](letters.md)：aos 與舊 inbox 的過渡方式。
- [落地計畫](plan.md)：方案取捨、待裁示與試行步驟。
- [閱讀與判斷筆記](notes.md)：來源、現況與尚未驗證的限制。

先用合併角色卡保持精簡；同一頁的兩種職能不表示由同一 agent 執行。正式部署時，若職能需要獨立長期產出，再拆為每角色一個資料夾。

## 一批工作怎麼走

main 接需求 → design 補齊尚缺契約 → main 核定範圍 → lead 切明確路徑 → dev／content／art 執行 → review 審查與 qa 驗證 → lead 核對證據並整合 → main 向 eca_main 彙報。

review 與純讀取驗證可對同一凍結版本並行；只要版本改動，受影響的證據就要重驗。小修可省 design；純文件依文件 lint 與人工核對，不跑遊戲全套。不能把有可執行工具、設定或生成程式的批次當作純文件。

## 資產與邊界

現行 `wf/workflows/` 仍是操作規矩；`wf/workflows/planning/specs/` 仍是契約來源。org 只說「誰負責、交給誰」，不搬移規格、不另建第二套 backlog、manifest 或驗收帳本。一次性交接沿用 dispatch/handoffs；進度和待使用者事項仍由 main 維護 SESSION-LOG 與 WAIT_USER。

部門可讀所需專案檔，寫入一定縮到當次交接書的明確路徑，再登記 CLAIMS。同一檔同時只有一個寫手；角色名稱不是目錄通行證。頂層文件、code map、共用設定及 wf 整合點由 main 協調單一寫手，其他線提供修訂建議。

沿用全機 Node 一次一個（常駐 MCP 例外）、不碰鍵鼠螢幕、不開 GUI、不停止使用者服務。所有新出現且非自己造成的意外變動須先停下確認，不移植 arena 的「範圍外可直接忽略」例外。既有 dirty tree 先記基準，不清除。

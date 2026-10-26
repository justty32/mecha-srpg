# next-session — 2026-10-26 晚暫停後的接續清單（給明天的 codex／Claude）

[handoffs](README.md)｜進度 [SESSION-LOG](../../../SESSION-LOG.md)｜現況 [STATE](STATE.md)｜裁定彙整 [fill-rulings](fill-rulings.md)

先照 `AGENTS.md` 開場，讀 `wf/workflows/common/user.md`（**資源節制**：全機一次一個重負載，`npm test` 等已有 `scripts/heavy-lock.sh` 鎖；工人只跑單檔測試）。

1. **核對主工作樹殘檔**：`content/base/world/markets/{old-array,salt-flat,singapore,war-armory}.json`、`content/index/{base-map,base-scenario}.json` 有未提交改動（疑 lead-fill-gear）。對照 `handoffs/lead-fill-gear/report.md` 決定提交或還原。
2. **戰役黃金**：lead-fill-pilots 已重錄（a3c53115），lead-fill-gear 仍報 5 紅；`handoffs/lead-fill-gear/fg-golden/` 與 pilots 的 golden worktree 兩份產出只採一份，以 HEAD 為基底重錄後跑一次全套 `npm test`。
3. **收暫停中的四線**：lead-bigfill、lead-fill-pilots、lead-fill-gear、lead-small——各自 `handoffs/<線>/report.md` 有接續；lead-small 的第三刃營運（剩一個測試勢力數 7→8、重產 index）與北岸改區（半成品）在 scratchpad worktree。收線：CLAIMS 格、SESSION-LOG 行移除，done 索引追加，worktree 清掉。
4. **尺度表**：重開 plan-scale（機甲各骨架／怪獸各族各級體型、戰鬥一格幾公尺、lore 尺度稽核，例：亞斯文放閘夜放水擋獸）。交使用者拍板後落地。
5. **去重與送審**：lead-bigfill 215 件＋lead-fill-pilots 148 人物＋lead-fill-gear 約 200 件＋lead-fill-scen 63 件，先去重，再交 Fable＋使用者審基調（流程見 `wf/workflows/content/batch.md`）。
6. **登記 engine-backlog**：lead-bigfill 報告列的 5 條（外洲地圖、在地人物對話、指定物種遭遇池、新聞欄、月面營運）。
7. **待使用者決定**：`352e589b` 夾帶約 320 萬行戰鬥紀錄要不要刪；148 人物每人一 lore 檔或改加 person 描述欄；勢力特色件是否無門檻先上架；部件被動數值引擎修復排程；百科 38 種 kind 專用卡。

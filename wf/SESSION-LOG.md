# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 上限 4096 bytes：超過代表有做完的項沒刪，先刪再說，不拆檔（照 [STRUCTURE](STRUCTURE.md)）。收工狀態只寫這裡一行和 commit，不另寫收工流水。

## 下次接續（open）

- [feature-dev] 11/25 AI撤退AND／分陣營出口／無情報搜索已整合，使用者已授權提交推送；typecheck/check/build、AI127案、34場比較及3情境決定性通過。非AI148檔完成128檔（首輪884pass/4fail/1cancelled），20檔未完；encounter與DOM修正重跑綠，controller兩項舊fixture未修，MCP正式60秒逾時仍非綠。已停自身runner並回收所有工人，產品61檔與最終63檔快照核對一致 → 下次修controller並補20檔及MCP預算檢討，見 [本輪報告](org/round-2026-11-25.md) 與 [證據](org/evidence-2026-11-25/README.md)。
- [testing] 測試刪減第二階段約 79 案，含補 cards-new 刪後四項覆蓋、審 playtest-1105 新測試 → [test-prune-1105](notes/investigations/test-prune-1105/README.md)
- [testing] 測試刪減第三階段（黃金縮減）：a3407d97 已追認，現可做 → [鑑定](notes/investigations/golden-a3407d97/README.md)、[裁決](workflows/decisions/2026-11-05-golden-a3407d97.md)
- [feature-dev] Fable 三題實作（SIZE、LINK-01、LINK-02 E1→E3′），連同把 10/29 的 specs／plans 併進 core → [裁決](workflows/decisions/2026-11-05-fable-three.md)、[specs](workflows/planning/specs/core/README.md)
- [refactor] F 類程式碼拆檔：18 檔超過 300 行 → [STRUCTURE](STRUCTURE.md)
- [balance] 數值（經濟變緊、命中變異）待使用者試玩後再定 → [WAIT_USER](WAIT_USER.md)
- [testing] 契約回歸、戰鬥目標與出口複驗：11/24 三項修正完成，完整 UI 208案與build通過；已分離觀戰準備預算，修改後完整e2e 19案全過；FSM astra新局實玩已收件回收，覆蓋與限制已記，15:40補驗三項已收件回收，十分鐘實機單見 org/manual-playtest-2026-11-24.md；待使用者整合確認 → [本輪狀態](org/round-2026-11-24.md)

# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機**：
1. **開始**多步驟工作前先寫一行 open（不是做完才寫）；硬中斷時本檔才有「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式：`- [工作流] 一句 open 狀態 → 下一步 / 連結`；完成即刪，歷史交給 git log，決策落到 [workflows/decisions.md](workflows/decisions.md)。

> 上限 4096 bytes：超過代表有做完的項沒刪，先刪再說，不拆檔（照 [STRUCTURE](STRUCTURE.md)）。收工狀態只寫這裡一行和 commit，不另寫收工流水。

## 下次接續（open）

- [feature-dev] AI 三項實作：照計畫，估 2 次全套 → [計畫](workflows/planning/plans/ai-retreat-search-1105.md)
- [testing] 測試刪減第二階段約 79 案，含補 cards-new 刪後四項覆蓋、審 playtest-1105 新測試 → [test-prune-1105](notes/investigations/test-prune-1105/README.md)
- [testing] 測試刪減第三階段（黃金縮減）：a3407d97 已追認，現可做 → [鑑定](notes/investigations/golden-a3407d97/README.md)、[裁決](workflows/decisions/2026-11-05-golden-a3407d97.md)
- [feature-dev] Fable 三題實作（SIZE、LINK-01、LINK-02 E1→E3′），連同把 10/29 的 specs／plans 併進 core → [裁決](workflows/decisions/2026-11-05-fable-three.md)、[specs](workflows/planning/specs/core/README.md)
- [refactor] F 類程式碼拆檔：18 檔超過 300 行 → [STRUCTURE](STRUCTURE.md)
- [balance] 數值（經濟變緊、命中變異）待使用者試玩後再定 → [WAIT_USER](WAIT_USER.md)
- [testing] e2e 與 ui.test 今天都沒實跑，找沒有其他 node 的時段補跑 → [testing](workflows/testing.md)

# CM 現況

**CM重負載已釋放：2026-10-28 22:05:23 Asia/Taipei。** 最後有界15seed已完成，runner無殘留；不再開第三輪，CK可接時段。記錄時間：2026-10-28 22:06:21 CST。

最後輪只改燼鐘 `baseAttrs.accuracy` 2→6，其他欄位零差異、其餘五檔SHA256不變，並燭槍架exposure仍1.5。第一輪六檔快照與全部原始log保留。

主線22:07正式收回CM窗口交CK；整批六檔不carry、不拆收、不入庫，manifest draft／integration pending／local not-accepted，禁止再啟runner。

CM01：原側第一輪5/5勝沿用；換側最後輪2/5勝，合計7/10，有側別旗標。CM02：accuracy6原側0/5、換側0/5，共0/10，仍不合驗收；維持隔離draft，不waiver、不改AI／基準／情境。

第一輪自然展示鐘3次；最後輪CM02自然鐘15次。槍架／單雙履／heat29拒絕與30合法散30 fixture全過；MCP auto到outcome、手動三完整輪且第4輪鳴鐘38→8、寒泉26→0。fixture與MCP執行時accuracy=2，只沿用機制及操作合法性，不冒充accuracy6快照相同。舊battle_auto hash=e61544bc33c01f03；六檔accuracy2快照SHA256=412ead3559f4b4beb7d651186db3767e0173180d947a632995474305e129022c；accuracy6=0eb1927e89217fa2f61c4361c029e453aa268a0d3ef170ba70d5bed8c3f88a04。

全數原始證據在 `log/`，最後輪在 `log/round-2/`；逐欄差異在 `accept/round-2-field-diff.json`，首輪快照在 `accept/round-1-snapshot/`。早前待GO、未跑與typecheck缺tsc均屬歷史：領導已補typecheck exit0；不把舊狀態當現況。REPORT、probe.json、comparison.json、coverage.json、playtest.json與accept/verification.json已齊；不需等設計、不再重跑。

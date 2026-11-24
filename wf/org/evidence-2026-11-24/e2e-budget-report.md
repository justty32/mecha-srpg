# 觀戰準備預算修正

FSM e2e-budget-1124 僅改 e2e/battle.spec.ts，definition當輪check通過，main直接brief授權單檔，不給Node工具。拆content與expected標準worker fixtures，原30秒配置、seed1、正式場景與全部斷言不變。main核對diff及diff --check通過；工人已回收，CLAIMS/ROSTER已撤。

單次驗證 e2e-fixture.log / .exit=0：1 passed (4.4m)。內容21.542秒，Node runBattle35.201秒，round12、173命令。瀏覽器settle22.408秒，全部比較完成26.803秒；勝負、命令、hash、逐單位及dead清單全部通過。同步JS超過名義slot仍返回，不能宣稱各前置均在30秒內，也不能保證高負載永不逾時。

修改後完整19案尚待驗證，不能把原18過與本次1過拼成同批通過。舊ui-gate.status=failed保留。沒有重跑UI需求：本次只改e2e測試準備，完整208案和build原有成功證據仍保留。

經驗：timeout不是權限拒絕；先--list驗證Playwright全名grep；標準fixtures隔離準備預算，不提高timeout掩蓋；主線集中持鎖驗證，FSM最小工具單檔工人易收線。下一次仍須正式brief lint，不能因切換FSM省略派工流程。

13:58追加：修改後完整e2e同批19 passed (5.0m)，e2e-final.exit=0；觀戰比較9.390秒完成，原全斷言通過。新playtest-gate.json索引UI/build/e2e三個成功exit，舊失敗證據未改寫。開始單一FSM astra實玩。

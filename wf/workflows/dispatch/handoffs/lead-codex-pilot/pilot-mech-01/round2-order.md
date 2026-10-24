# 退回重做（第 2 輪）— pilot-mech-01

領導驗收（`accept/verdict-1.json`）結果：閘門、check、lore、typecheck、test 732/732、黃金、試玩紀錄、已讀清單全過；**probe 未過**，以及一項命名審查意見。只改下面兩件事，其他檔不要動。

1. **FF-3（`frame/cx3-flyingfish-d`）太弱**：`content:probe --n 5` 對 `monster/mite-d` 勝 60%、對 `frame/bulwark-i` 勝 0%（平均 4–5 輪就撤）。同級既有偵察機 `frame/shellsoc-ls3` 同條件是對 mite-d 100%、對 bulwark-i 20%；`frame/union-fr7` 是 100%／100%。目標：對 mite-d ≥ 80%，對 bulwark-i ≥ 20%。照 acceptance-playtest「怎麼調」：先排除非數值原因（D 級配裝原則是 1 把武器，但可以換更合適的、或補內建攻擊），再動命中／AP、傷害 ±15%，最後 HP；一次一個旋鈕、每次 5 seed，把每次的數字寫進 REPORT。
2. **命名審查**（外部審查員 gemini-4-argon-high 判讀）：`component/cx3-skimming-fin`「掠潮鰭吼」以「吼」收尾像招式不像裝備，請改成以器物為中心語的名字（例「掠潮鳴鰭」，自己判斷）；同時把每個新檔的英文原名寫進該檔可用的欄位（frame 有 `aka`，放英文原名；其他類型若 schema 沒有可用欄就寫在 REPORT 的命名表：英文原名｜意涵｜中文名）。`FF-3` 依 mechs.md D 級代號規則保留。

已過的 HP 帶外（C 機 285 < 300，沿用 mx-hover-c）由領導在 manifest 加豁免，不用處理。完成後重寫 REPORT 的相關段、`playtest.json` 不必重打（除非你改了 FF-3 的武器，則補 1 場 FF-3 的 MCP 場次）。

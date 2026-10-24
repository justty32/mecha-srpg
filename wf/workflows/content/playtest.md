# playtest — codex 自測新內容：MCP socket 試玩與 content:probe

[content README](README.md)｜驗收清單與失衡門檻原文 [acceptance-playtest](acceptance-playtest.md)｜批次流程 [batch](batch.md)｜MCP 工具 [src/mcp/README](../../../src/mcp/README.md)

給**在隔離 worktree 裡**填戰鬥內容的 agent：怎麼自己開 MCP、打幾場、記什麼、怎麼讓驗收腳本認得你的紀錄。量什麼、門檻多少以 [acceptance-playtest](acceptance-playtest.md) 為準，本頁只補批次模式的作法。

**何時用**：「試玩新內容」；batch manifest 的 `checks` 含 `probe`／`playtest`（frames、monsters、abilities、scenarios）。
**何時不用**：lore、營運文字、純潤飾 → 不必試玩；要調 AI 參數 → 不是內容線的事。

## Done when

- `npm run content:probe -- <新 id…> --n 5` 的數字進了 REPORT，且附同級既有單位（manifest `probe.reference`）同條件的數字。
- `<reportDir>/playtest.json`（wf-table/1）≥ manifest `playtest.required` 列 MCP 場次，每列 `log` 指向的原始輸出存在、含情境 id 與 `outcome`。

## 流程

<!-- wf-nav -->
1. **socket 與暫存放 `/tmp/<線名>/`**，不放 worktree（閘門會把 worktree 裡的任何雜檔記成越界）：`node src/mcp/cli.ts serve --socket /tmp/<線名>/s.sock` 背景跑，之後 `node src/mcp/cli.ts call --socket /tmp/<線名>/s.sock <工具> '<JSON>'`；收工 kill 自己的 pid。scratch pack（煙霧情境）也放 `/tmp/<線名>/pack/`。
2. **probe 先跑**：新 frame／monster／ability／scenario 各 `--n 5`；同時跑 `probe.reference`。2026-10-24 的引擎現況：1 對 1 常因 AI 撤退判負（既有劍魚-III 對堅盾-II 0% 勝），所以**新單位的勝率要對參照比，不是對絕對門檻比**。
3. **MCP 試玩**：每個新單位至少進一場；至少 1 場手打（`battle_legal_actions`→`battle_act`），其餘可 `battle_auto`／`spectate`。每場把完整 call 輸出存 `mcp-log/<場次>.txt`（scratch 情境的 JSON 貼在開頭）。
4. **記 `playtest.json`**：欄位 `scenario seed rounds winner reason mode ourLosses enemyLosses newAbilityUses aiUsed log`，`link_columns:["log"]`；`mode` ∈ `mcp-manual`／`mcp-auto`／`mcp-spectate`；`log` 相對 playtest.json。
5. **失衡就調**：照 acceptance-playtest「怎麼調」一次一個旋鈕、每次 5 seed。

## 驗收腳本怎麼判 probe（`content_accept_eval.py probe`）

例外 >0 硬失敗；勝率 <30% 或 >90%、平手率 >40%、新能力主角 0 使用、新 id 超出數值帶 → 旗標。勝率／平手旗標若參照組對同一對手也同向出現，標 `matchesReference`（引擎現況，不算失敗）；其餘旗標要 manifest `probe.waivers` 寫 `{id, flag, reason}` 才放行。

## 交接

- 門檻原文與調整順序 → [acceptance-playtest](acceptance-playtest.md)；整批流程 → [batch](batch.md)。

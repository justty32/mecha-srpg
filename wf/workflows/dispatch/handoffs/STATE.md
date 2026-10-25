# STATE — 交棒：新 session 的起點（2026-10-24 段落收尾，lead-wrapup 寫）

[handoffs](README.md)｜非 codex 工作 [engine-backlog](engine-backlog.md)｜下次整理 [next-tidy](next-tidy.md)｜roadmap [planning-roadmap.json](../../planning-roadmap.json)

## 現況一屏

**遊戲**：2108 地月機甲 SRPG 網頁版（TypeScript＋Vite，邏輯與 DOM 分離）。戰鬥（BB 式部位／層／多資源池、意圖撤退、指揮者）、營運（節點圖世界、契約、債務、勢力作戰／外交／傭兵參戰／研發）、百科、MCP 都已落地；方格大地圖已落地（lead-grid）。

**測試**：`npm test` 912／912、`npm run check` 0 錯 8 警告（2026-10-25）；`npm run typecheck` 0；`node content/lore/check.ts` 0 錯 2 警告；`npm run test:e2e` 12／12（lead-gaps-ops 驗收時）。

**網頁**：`npm run dev` → `http://localhost:5173/`：`#/` 戰鬥（`?scenario=<id>&seed=<n>`）、`#/wiki` 百科（F1／Shift+W）、`#/ops` 營運（`?seed=<n>`，`&spectate=1` 全 AI 出戰）。

**MCP**：`.mcp.json` 已掛 `mecha-srpg`（`npm run mcp`，stdio）；codex 試玩用自起 socket（`node src/mcp/cli.ts serve --socket <名>.sock`）。用法 `src/mcp/README.md`。

**主要指令**：`npm test`、`npm run check`、`npm run typecheck`、`npm run test:e2e`、`npm run sim -- …`、`npm run sim:campaign -- --months N`、`npm run fuzz -- --runs N --mode mix`、`npm run content:probe -- <id…>`、`npm run content:index`、`npm run build`。驗證表全貌見 [testing](../../testing.md)，環境見 [dev-env](../../dev-env.md)。

**團隊**：頂層 Fable → 領導 Opus → 工人 codex `gpt-6-astra`（reasoning high）；規劃 Fable（[team-model](../../team-model.md)）。

## 現役

- 無現役線（2026-10-25）。talk-decide 對談已收線（[REPORT](talk-decide/REPORT.md)），裁示由 lead-decide-land 落地完畢（design-notes world/drive、pilots、great-tide；specs/world/pilots；world-pillars M12／M13；style/people；engine-backlog 30／45–49；B5 三批已排）；總 REPORT 已由頂層代存為 `lead-decide-land/REPORT.md`。其餘各線已全部收線，見 [done 索引](done/README.md)。
- 遊戲機制數值微調（經濟目標 B1、出戰前士氣 B2）使用者說延後，先不派線。

## 本段落（2026-10-24）做了什麼

各線 REPORT 在 `handoffs/done/<收線日>/<線名>/REPORT.md`（索引 [done/README](done/README.md)），重點：

戰鬥：[lead-gaps-battle](done/2026-10-24/lead-gaps-battle/REPORT.md)（配裝、等級影響血量、check 強化、`content:probe`、意圖撤退與指揮者，平手 64%→2.5%）、[lead-tune-battle](done/2026-10-24/lead-tune-battle/REPORT.md)（撤退時機、瞄核心、check 降噪）、[lead-ai-objective](done/2026-10-24/lead-ai-objective/REPORT.md)（AI 目標意識、盟軍配合）、[lead-rules-fuzz](done/2026-10-24/lead-rules-fuzz/REPORT.md)（約 1.6 萬場 fuzz、18 不變量、修 13 bug）、[lead-playtest](done/2026-10-24/lead-playtest/REPORT.md)（MCP 試玩、互動出戰）。

營運：[lead-impl-war](done/2026-10-24/lead-impl-war/REPORT.md)（勢力作戰、外交、傭兵參戰、研發）、[lead-gaps-ops](done/2026-10-24/lead-gaps-ops/REPORT.md)（困船、無限刷、開局無約、債務、擊退回寫、人類遭遇）。

介面與工具：[lead-wiki](done/2026-10-24/lead-wiki/REPORT.md)、[lead-ui-ops](done/2026-10-24/lead-ui-ops/REPORT.md)、[lead-mcp](done/2026-10-24/lead-mcp/REPORT.md)。

規劃與內容守則：[plan-world-grid](done/2026-10-24/plan-world-grid/REPORT.md)（方格大地圖 spec）、[plan-spec-integrate](done/2026-10-24/plan-spec-integrate/REPORT.md)（spec 整合與風格改寫）、[plan-content-guide](done/2026-10-24/plan-content-guide/REPORT.md)（content 工作流）、[plan-world-pillars](done/2026-10-24/plan-world-pillars/REPORT.md)（世界觀守則 31 條）。

內容試點：[lead-codex-pilot](lead-codex-pilot/REPORT.md)（閘門、驗收鏈、分片索引與批次帳本；四批：潤飾、lore、飛魚、鐵劍）。

收尾（lead-wrapup）：新裁示寫進 spec 與守則（古代機等級無上限、十分律擴讀定案、三條通用系列、用語過渡說明、意圖兩層 spec 標已實作）；本檔、[engine-backlog](engine-backlog.md)、[next-tidy](next-tidy.md)、roadmap 狀態、[codex-handover](codex-handover.md)。

## 新 session 的第一步

1. 照 `AGENTS.md` 開場（SESSION-LOG／WAIT_USER 計數、`inbox_read.sh wf/inbox/new`）。
2. 讀本檔 → **[codex-handover](codex-handover.md)**（配置、生效表、可開工批次）→ [engine-backlog](engine-backlog.md)。
3. 確認沒有殘留現役線（[CLAIMS](../CLAIMS.md) 現役表、`git worktree list`、`tmux ls | grep '^cx-'`）。
4. 開 codex 內容批次（只做**新增內容**與**文字潤飾**），照 codex-handover 與 `codex-batches.json`：用語改名已完成（lead-rename，2026-10-24）；**翻譯腔重審三批 dl-01／02／03 已排、待開跑**（第 11–13 列，manifest 與交接書草稿在 `lead-decide-land/b5/`，順帶對齊 2026-10-25 裁示與「機甲核心」用詞；第二輪 104 檔見第 14 列）；其餘批次 3–4 批並行。
5. （lead-grid 方格大地圖已完成；調校見 lead-tune 已收線。）talk-decide 定案的引擎線：engine-backlog 第 30 列（機甲核心與座艙狀態，併 35／46，小–中、重產黃金）可先派，47／48／49 接其後；第 30 列派線時一併授權改 specs/core rules-people 與 specs/ops time-and-tick 的「不能獨駕」殘留；P2 的 `nameEn`／`etymology` 與鐵劍 models 入庫可另開小線。
6. 使用者試玩回饋與新詞定案（[WAIT_USER](../../../WAIT_USER.md)）到了就派對應線。重構與 tidy 照 [next-tidy](next-tidy.md)。

> `inbox_ack.sh --state` 的 ack 流水自 2026-10-24（lead-tidy）起預設寫 `wf/inbox/done/ack-log.md`，不再追加到本檔；之前的流水在 `wf/inbox/done/2026-10-24/`。

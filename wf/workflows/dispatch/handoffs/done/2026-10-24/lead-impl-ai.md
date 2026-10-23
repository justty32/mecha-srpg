# 任務：實作 AI 層——陣營情報、策略、代理、戰術權重選招、目標估值、可插拔策略（spec 切線 6）

> 你是 Opus **領導**線 `lead-impl-ai`，由頂層（主 session Fable）用 Agent tool 派出。規則線 `lead-impl-rules` 正並行寫 `src/rules/`；你先依 spec 的介面寫 AI 並用替身（stub）測，規則落地後再整合。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/team-model.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/dispatch/codex-exec.md`、`wf/workflows/dispatch/lessons.md`、`wf/workflows/common/conventions.md`、`wf/workflows/testing.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model/model-quirks.json`；地基：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-impl-foundation-REPORT.md`、`src/core/types-def.ts`、`src/core/types-state.ts`、`src/core/events.ts`、`src/core/rng.ts`；spec：`wf/workflows/planning/specs/core/README.md`、`ai.md`（主）、`rules-turn-and-actions.md`、`rules-attack-resolution.md`（預覽介面）、`data-model-abilities-effects.md`（能力的 `ai.tactics`）、`architecture.md`；`constraints.json`、`adoption.json`（AI 相關列，`tabledb.py` 查）；規則線的介面草稿 `wf/workflows/dispatch/handoffs/lead-impl-rules/contract.md`（若存在，唯讀）——親自讀。

## 背景與唯一目標

決策已定：AI 只用陣營共享感測已揭露的資訊（玩家 UI 與 AI 讀同一份 FactionKnowledge）、能力自帶戰術權重讓 AI 選招、失控單位換 AI profile 接管、情報由偵察部件揭露。唯一目標：**交出 `src/ai/`**——`knowledge`（FactionKnowledge 的建立與更新）、`strategy`（陣營層目標）、`agent`（單位層決策迴圈）、`policy`（可插拔策略介面與 `policies/{tactical,berserk,swarm,sentinel,flee,scripted}`）、`score`（目標估值）、`danger`（威脅圖），只依賴 `src/core` 與一個**明確宣告的規則查詢介面** `RulesQuery`（移動可達、攻擊預覽、指令合法性），讓模擬線能把 AI 與規則接起來。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) `src/ai/{knowledge,strategy,agent,policy,score,danger,index}.ts` 與 `src/ai/policies/{tactical,berserk,swarm,sentinel,flee,scripted}.ts`；(2) `src/ai/rules-query.ts`：AI 對規則層的唯一依賴介面（型別），**照 spec 的預覽介面命名**；(3) `test/ai/stub-rules.ts`：純記憶體替身實作 `RulesQuery`（小方格、簡化命中），供 AI 單元測試與煙霧測試；(4) 測試：每個 policy 至少一個決策測試、score 的表格測試、knowledge 的揭露／遮蔽測試、一個「AI 對 AI 十回合不拋錯」煙霧測試（用 stub）；(5) **整合**：若 `src/rules/index.ts` 在你收線前已存在且其 REPORT 已落檔，寫 `src/ai/adapters/rules-adapter.ts` 把真規則接到 `RulesQuery` 並加一個整合測試；若未落地，REPORT 寫明「待整合」與介面對照表；(6) REPORT。
- 不做：改 `src/rules/`、`src/core/`、`src/content/`（需要新匯出→REPORT `SPEC-GAP`，用替身繞過）；模擬器迴圈與存檔（`src/sim/`）；UI；安裝套件；數值平衡；碰 `legacy/`、`wf/`（除自己 handoffs 目錄與 ROSTER 格）、`content/base/`（內容包線領地；測試用資料放 `test/ai/fixtures/`）。
- 件數 gate：新檔超過 40 個就停下回報；容量 gate：`test/ai/` 超過 1 MB 就停下回報。時間 gate：開工起 150 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_team.sh` | 開工 `create ai lead-impl-ai`；之後 `add` 每條工人 |
| `codex exec -m gpt-6-astra -s workspace-write …`（配方見 `wf/workflows/dispatch/codex-exec.md`） | 派工人；`-C` 指專案根；交接書寫死檔案清單與 `RulesQuery` 簽名 |
| `wf/tools/inbox_poll.sh lead-impl-ai --wait --timeout 540` | 前景等工人 |
| `python3 wf/tools/brief_lint.py` | 子線交接書送出前 `--strict` 要 0 違規 |
| `python3 wf/tools/tabledb.py` | 查 `constraints.json`／`adoption.json` 的 AI 列，id 寫進測試名 |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完文件後跑 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑：`src/ai/`、`test/ai/`、`package.json`（只 scripts）、ROSTER 自己與工人那格、自己的 REPORT 與子線交接書（`wf/workflows/dispatch/handoffs/lead-impl-ai/`）。可跑 `node`、`npm test`、`npm run check`。**可以 commit**：只加明確路徑並用 `git commit -- 路徑`，訊息開頭 `ai: `；驗收與 commit 由你在沙箱外做（codex 沙箱 `node --test` 計數不準、`.git` 可能唯讀）。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；**不安裝套件**（typescript 若已被規則線裝好可用 `npm run typecheck`，自己不要裝）；不 `rm -rf`（暫存搬 `/tmp/lead-impl-ai-trash/`）；不改 `~/.codex/config.toml`；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 3 條 codex 工人＋1 個 Claude 子 agent；工人 ROSTER 格由你代登記。分清錯誤來源：環境出錯→`BLOCKED`；工人程式碼有 bug→退回修。

## 工作

1. 讀完先讀清單；ROSTER 追加自己那格；開團隊；先自己寫 `src/ai/rules-query.ts`（介面）與 `src/ai/policy.ts`（策略介面）並 commit——這是工人之間與規則線之間的契約；若規則線 `contract.md` 已有預覽簽名，照它命名。
2. 子線交接書（建議：`cx-ai-knowledge-score`（knowledge／danger／score＋stub）、`cx-ai-policies`（agent／strategy／六個 policy）），brief_lint 過；並行派出；前景等；沙箱外跑測試、合併、commit。
3. 收線前檢查 `src/rules/index.ts` 與 `handoffs/lead-impl-rules/REPORT.md` 是否存在：有→寫 adapter＋整合測試；無→REPORT 寫「待整合」。
4. `npm test`、`wf-lint.sh --strict .`；commit；寫 REPORT：四段＋「`RulesQuery` 介面與規則線的對照」＋「SPEC-GAP」＋「gpt-6-astra 癖好」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| AI 層 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/` |
| 替身與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm test` exit 0、`# fail` 0，且 `src/ai/**/*.test.ts`＋`test/ai/**/*.test.ts` 合計 ≥ 30 項通過。
2. `src/ai/` 含 7 個主檔＋`rules-query.ts`＋6 個 policy；`src/ai/` 內 `grep -rn "from '../rules\|from \"../rules"` 只出現在 `adapters/` 底下（其餘只依賴 core 與 `rules-query`）。
3. 煙霧測試：stub 規則下 AI 對 AI 十回合不拋錯，且同 seed 兩次決策序列相同（決定性）。
4. `constraints.json` 中 `spec_section` 含 `ai` 的每一列，其 id 至少出現在一個測試名或註解裡（grep 可證）。
5. `bash wf/tools/wf-lint.sh --strict .` broken=0、residue=0、local=0；`package.json` 仍無 dependencies。
6. `git log --oneline` 含 `ai: ` 開頭 commit，工作樹中無本線領地的未提交檔；無殘留 codex 行程；團隊已 close；ROSTER 已標已收線。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的→退回或自己修；修不到才 `FAILED`，壞的不 commit。
- 測不出來（環境擋、規則介面與 spec 衝突無法用替身繞過）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

我是 `lead-impl-ai`，團隊 `teams/ai` 的領導。你是 Claude 子 agent，不走 inbox 向上回報：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。工人走 inbox 回報給你。等工人用**前景**迴圈。


## 完成證據（調度者 2026-10-24 收線）

1. `npm test` 164 過 0 敗（AI 42 項含在內）。2. `src/ai/` 7 主檔＋`rules-query.ts`＋6 policy＋`adapters/rules-adapter.ts`；rules import 只在 adapters。3. stub 與真規則下 AI 對 AI 不拋錯、同 seed 決策序列一致（領導核）。4. constraints 的 5 條 AI 列皆有測試引用。5. wf-lint broken=0／residue=0／local=0；無 dependencies。6. commit `ai: ` 五筆至 `1bd6e21`；無殘留行程；團隊已 close；ROSTER 已標已收線。待整合缺口交下一條線：無駕駛員怪獸 controlMode `none` 不行動、13 個常數只在測試包、`aiprofile/pack-hunter` 指到不存在的 policy、評分係數為佔位。

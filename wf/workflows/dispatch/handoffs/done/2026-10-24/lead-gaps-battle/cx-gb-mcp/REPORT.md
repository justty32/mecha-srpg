# cx-gb-mcp 完成／阻塞回報

狀態：**BLOCKED**。批次工具、情境文字與固定出戰序列已完成，量測達標；指定完整 MCP suite 沒取得完成報表，socket 手動驗證遭沙箱拒絕，不能宣稱五條驗收全過。未 commit、未修改禁區。

## 做了什麼

`battle_act_many(id, actions, stopOnReject=true, observe=false)` 共用單步工具的送出邏輯，保留逐步成功／拒絕原因與事件游標；拒絕預設停，戰鬥結束或非人類回合必停。批次停止後依 autoAdvance 推 AI，回合併事件摘要及 AI 事件；不跨過 AI 繼續吃剩餘 actions。observe 附與預設 battle_observe 完全相同的資料及文字摘要。

`battle_legal_actions unit:"all"` 列本輪尚可輪到的玩家單位，排除已行動完、失控轉敵方、停機與觀戰單位。每台可達格預設 64（maxMoves 0–4096）、每能力目標預設 32（maxTargets 1–256），回省略數；單台未指定上限時保持舊輸出。引擎一次只允許一台行動，其他單位的合法 moves/options/targets 為空並標不是其回合，沒有模擬或偷改 session 狀態。

選擇既有 `battle_step_ai` 新增 `until:"player"`，與 human 同義，沿用 max（預設 2000 個成功 AI 指令）及事件摘要，避免重複另一個同義工具。未修改 src/sim/session.ts。list/new/observe 有 name／brief 時在 JSON 與文字顯示，沒有則省略。

sortie.test.ts 改固定 seed 1、7 條 campaign_act 指令：派 person-1 到 mech-8 → wait 1 → choose 2 → choose 1 → wait 2 → accept contract-13 → sail chittagong。固定一台出戰；前置每步均要求成功。三條原測試仍驗全 AI 戰果與 campaignHash 一致、玩家出戰存讀 hash 一致、出戰中命令鎖定與取消不改 hash。

### 量測

臨時腳本 `/tmp/cx-gb-mcp/measure.mjs`、結果 `/tmp/cx-gb-mcp/measurement.json`。同一次程序共用內容 DB，各自新建戰鬥，scenario/badlands-sweep、128×128、seed 1，完成第 1 輪全部 2 台玩家單位；兩路都開 autoAdvance。每台選最低正 AP 成本的可達格移動，若有合法敵方目標則攻擊，最後 end。此情境這輪移動前後皆沒有合法攻擊目標，所以兩路都省略攻擊。

| 計數範圍 | 舊工具 | 新工具 | 減少 |
|---|---:|---:|---:|
| 含 battle_new、完成第一輪 | 11 | 5 | 54.5% |
| 只計第一輪決策與行動 | 10 | 4 | 60% |

舊：new 1、observe 2、legal_actions 4、act 4；新：new 1、legal_actions(all, maxMoves=4096) 2、act_many(observe=true) 2。兩台分別移到 (64,60)、(65,61)，移動成本各 2，然後 end；腳本斷言兩路動作紀錄及最終 hash 都相同，hash `0d79708f8cb8d980`、round 2。新路使用移動前的合法目標清單；本輪移動後無新增目標，由舊路再次查詢及相同 hash 佐證，不能外推成所有接敵回合都只需這些呼叫。

開工時舊內容的基準是 9 次決策呼叫（兩台中僅一台有成本 1 的移動）；別線內容更新後移動成本／先攻改變，終局採以上同一 DB 重新量測結果，不混用舊輸出。

### 固定五條驗收的結果

1. **未完成**：完整 `node --test --test-isolation=none 'src/mcp/*.test.ts'` 已啟動，數分鐘沒有產生報表，手動中止（exit 1）；無完整 pass 數可提供。`npm run typecheck` 最新 exit 0、0 錯。另本線 batch＋sortie 最終 **7 pass、0 fail**，不是完整 suite 的替代品。
2. **通過**：`grep -c greedy src/mcp/sortie.test.ts` 輸出 0（grep 無匹配的 exit 1 屬預期）；三個原測試意義保留且通過。
3. **通過**：上述 11→5，5 ≤ 11/2。
4. **通過**：README 已列工具、參數與批次流程，7422→9413 bytes（+26.8%，小於 +40%）；`bash wf/tools/wf-lint.sh --strict src/mcp` exit 0，broken/residue/oversize/biglist/querycmd/local 皆 0。
5. **通過**：本 REPORT 有四段與量測表。

依交接書要求逐步執行 npm run check／typecheck／指定測試。最後 check exit 0（0 errors；跨線內容產生 36 warnings）；typecheck exit 0。新增測試涵蓋拒絕後不吃後續步、stopOnReject=false 繼續、observe 等值、全隊過濾／大小上限、AI／結束停止及 max。拒絕測試實際送出越界移動，並驗證成功移動保留、拒絕原因及後續 end 沒有執行；false 分支則驗證 end 有執行。

## 產出（改動檔清單）

- `src/mcp/battle.ts`：批次、全隊合法動作查詢、player 別名、情境文字。
- `src/mcp/batch.test.ts`：新增 4 條批次／查詢／推進測試。
- `src/mcp/sortie.test.ts`：固定前置指令序列。
- `src/mcp/README.md`：工具與典型流程。
- `wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-mcp/REPORT.md`：本報告。

共 5 檔，未超過 12 檔 gate；程式 tracked diff 約 28 KB、新測試約 6.7 KB，加文件與報告仍低於 120 KB。本線未寫其他程式碼、未還原其他線改動。

## 沒做到或證據不足的

完整 MCP suite 沒有完成結果：`/tmp/cx-gb-mcp/mcp-final.log` 在中止時仍為空，不能提供 pass 數或稱 0 fail。原因未定位，不把它直接歸咎於沙箱。

先前分組跑 batch/battle/e2e 時，兩條 e2e 都回 `server 提前退出 0`，尚未抵達 hash 斷言；記錄在 `/tmp/cx-gb-mcp/test-step2.log`，其中本線兩條初版測試錯誤已修正，最後 7 條的新證據是 `/tmp/cx-gb-mcp/changed-final.log`。沒有改 e2e.test.ts 或 server.ts 來繞過失敗，也沒有拿分組 hash 當 stdio 端到端證據。

指定的 `node src/mcp/cli.ts serve --socket /tmp/cx-gb-mcp/m.sock` 被拒：`listen EPERM: operation not permitted`。對 all／act_many／step_ai 的 CLI call 也都 `connect EPERM`，記錄在工具執行輸出；沒有成功的手動 socket 結果。

解除條件：領導在允許 Unix socket 與子行程的環境執行原指定完整 MCP suite，取得 0 fail 與 pass 數，並成功跑手動新工具 CLI。若完整 suite 仍卡住，需定位原測試／跨線整合問題後重跑；不要以本報告推定已綠燈。阻塞已先用 inbox_mail BLOCKED 通知。

## 需要決定的事

all 的輸出忠於既有 BattleSession：尚未輪到者沒有現在合法動作。若要預測每台未來回合的動作，還需要另訂狀態推演與過期契約；本次沒有擴張到該功能。

code-map.json 的 mcp 測試導航可由領導提交前補 batch.test.ts；交接書可寫範圍沒有 code-map，故本線未改。跨線過程曾見 LoadIssue.ruleId／monster 欄位型別錯誤，最後已恢復；另有營運探索中的 escort 非機庫單位導致 prepareSetup 讀 undefined.parts，未越界修理，本線固定偵察契約路徑不依賴它。

## 以後交接書該點名的工具

無。

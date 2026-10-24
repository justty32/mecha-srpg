# REPORT — lead-codex-pilot：codex 內容填充試點、護欄與內容帳本（頂層代存，2026-10-24）

STATUS：**DONE**。commit：護欄與索引 `e32948e`、`9c3b286`；工作流與帳本 `347f760`；命名標準 `5677834`；四批 `2e67c24`（潤飾）、`2105fac`（lore）、`2e69e40`（飛魚）、`4a3fc66`（鐵劍）；收線 `07c1939`。四份 manifest 的報告路徑指向本目錄，故不移 done。

收線驗證：`npm test` 811/811、check 0 錯、typecheck 綠、lore check 0 錯、閘門測試 37 例、索引一致性、`wf-lint --strict` 全庫 0 違規。

## 一、護欄
- **隔離**：每批 detached worktree `scratchpad/codex-pilot/wt-<batch>`（`node_modules` symlink）；codex `-C <wt> -s workspace-write`，`--add-dir` 只開 `wf/inbox` 與該批報告目錄；worktree 的 git 目錄在 `-C` 之外，codex 寫不了 git；通過的檔由領導白名單帶回 main。
- **閘門** `wf/tools/content_gate.py`（`python3 -I`）比對 base→worktree 全部差異（含未追蹤、gitignore 新檔、偷做的 commit）。新增模式：只准 manifest 宣告目錄的新 `.json`、檔名＝id 名字段、id 前綴同目錄、檔名前綴照 manifest、例外檔只准純插入；拒刪檔、symlink、權限、`.gitignore`。潤飾模式：JSON 逐節點比對，鍵／陣列長度／型別／數字不可動，只白名單文字欄可改且新舊值不得像 id 引用。共通：件數上限、worktree 起點檢查、帶回時目的地已存在或被改過則拒覆蓋。測試 `wf/tools/test_content_gate.py` 37 例。
- **驗收鏈** `wf/tools/content_accept.sh <wt> <manifest> [--record]`：閘門 → `npm run check`（列新警告）→ lore check → ops check → typecheck → `npm test`（黃金不變）→ `content:probe`（與同級參照比；參照也出現的旗標標「引擎現況」，其餘需 manifest 豁免理由）→ MCP 試玩紀錄（附原始 log）→ REPORT「已讀清單」比對。判定器 `content_accept_eval.py`，結果 `<reportDir>/accept/verdict-<輪>.json` 並記回 manifest。

## 二、帳本與索引
- **分片索引** `content/index/`：照 STRUCTURE 按類別分片、<1 KB 小類併 `<pack>-misc`、README 只導航；43 片＋`_summary.json`（3.6 KB）；列只放 id、kind、grade、name、faction／family／lineage、tags、path、batch、status；單片 >2000 列或 512 KB 按等級再分（暫定）；`npm run content:index` 只重寫有變動分片、讀 git 索引版本；`test/content/index.test.ts` 驗不過時；引用數即時算 `content_index.py refs <id>`。
- **批次帳本** `content/batches/<YYYY-MM>/<batch>.json`（`content-batch/1`）：派工前是授權書（模式、範圍、件數、驗收、probe 參照、試玩、已讀清單），完工後是出處帳本（新增檔與 id、重做輪次、驗收、豁免、命名表、命名審查、暫緩檔、越界嘗試）。
- 查詢：`tabledb.py` 對 `content/index/base-monster.json` `find grade=C family=beast`；`base-frame.json` `find batch=pilot-mech-02`。
- 不用資料庫：載入器／百科／測試直接讀 JSON，加 DB 多一份真相與依賴；需要時再從索引生成 sqlite 唯讀快取。
- 領地外：`src/ui-adapter/dom/wiki/boot.ts` glob 排除 `content/index/**`、`content/batches/**`。

## 三、四批
| 批 | 產出 | 退回 | 越界 | probe／試玩 | 品質 |
|---|---|---|---|---|---|
| pilot-polish-01 | 10 營運事件文字 | 0（另 1 次誤判停工重派） | 0 | — | 更順；1 處台詞意思微移 |
| pilot-lore-01 | 5 人物＋2 事件 | 0（另 1 次誤判） | 0 | — | 格式引用年代正確；偏冷硬、中二感不足 |
| pilot-mech-01 飛魚 | FF-3（D）、飛魚-II型（C）、飛魚-IV型（B）＋2 部件、3 能力、1 效果、1 情境 | 1 輪 | 0 | MCP 4 場；豁免 6 | 數值有理由；命名審查 8／10 |
| pilot-mech-02 鐵劍 | IX-01（D）、鐵劍-II型、II型・織工、III型、歸航-鐵劍（A 隊長機）＋3 部件、2 能力、1 情境＋lore 事件與年表 | 1 輪 | 0 | MCP 3 場；情境勝率調到 60% | 定位抓準；命名審查 9／11 |
越界：40 檔帶回、違規 0；codex 遇灰色地帶先問。閘門擋下的兩次是領導自己的錯（base 寫錯、故意放的 stray.txt）。最大成本是誤判停工（範本「出錯就停」被逐字執行；`tabledb.py` 路徑錯、`sweep.ts --content a,b` 不支援；沙箱禁 Unix socket listen → MCP 改走 stdio），已寫進 `dispatch/content-batch.md`。子 agent：lore 批 1 個（GPT-6 覆核，0 改動）。成本：潤飾 14 萬、lore 16 萬、飛魚 57 萬（4 次派出）、鐵劍 56 萬（2 次）tokens；每批 5–30 分鐘。probe 絕對門檻受撤退邏輯影響，只能與參照比。

## 四、判斷
新增內容與潤飾可以放手（機制上無法越界、驗收不靠自報、會守數值帶）；平衡與命名仍需領導裁量，`agy` 判讀翻譯腔準。建議每批：新增 10–15 檔單一主題（約 30 分鐘、50 萬 tokens、含 1 輪退回）、潤飾 10–20、lore 5–8；可 3–4 批並行。不放進內容批次：world lineages／models、registries、改既有數值。

## 五、沒做到
鐵劍的 world models ×5、lineage ×1 未入庫（新通用血統會改 5 條黃金戰役與 MCP 戰役 hash；`src/ops/war` 測試在新血統下讀到 undefined，疑似引擎 bug；原檔在 `pilot-mech-02/deferred/world/`）；飛魚無 models、未寫入 lore `mechSeries`；codex 把英文原名放進 `aka`（語意不對）；飛魚與 lore 批仍有「潮」舊詞。

## 六、需要決定（頂層 2026-10-24）
1. 鐵劍 models＋lineage 與研發 undefined → 引擎待辦（非 codex）。
2. `nameEn`／`etymology` 可選欄 → 引擎待辦（已列 P2）；補欄前命名表放 manifest。
3. STRUCTURE 補「生成式資料索引」一條 → 交使用者決定（kernel 規則）。
4. 文件錯誤（acceptance-playtest 的 sweep 逗號寫法、socket 連線法；`content/README.md` 件數）→ 交 lead-tidy。
5. 百科 glob 排除 → 保留。

## 以後交接書該點名的工具
`python3 -I wf/tools/content_gate.py`、`bash wf/tools/content_accept.sh`、`npm run content:index`、`python3 wf/tools/tabledb.py`（寫實際路徑）、MCP stdio `node src/mcp/server.ts`（參照 `src/mcp/e2e.test.ts`）、`agy --model gemini-4-argon-high`（純文字）。

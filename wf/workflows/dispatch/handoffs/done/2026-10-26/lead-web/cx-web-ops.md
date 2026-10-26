# 任務：營運介面補強：聲望門檻灰按鈕、漲潮用字、潮級／天象／下次大潮顯示、萬潮葬王王跡欄核對、月序修正（cx-web-ops）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ui-adapter 與百科段）、`wf/workflows/testing.md`、盤點報告 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md` 中你負責的條目——親自讀。

## 背景與唯一目標

網頁營運介面沒跟上上一輪新內容。唯一目標：營運畫面補上下列項目。不改遊戲規則與數值；需要引擎新功能的記進 REPORT。中文用詞避免英文直譯。lead-engine-next 已收線並新增萬潮葬王王跡欄（艦橋顯示三句與最後目擊日、守牆邀請）。

## 工作目錄與範圍（排除法寫死）

- 唯一可寫根：隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-web/wt-ops/`（內容＝主 repo HEAD；相對路徑都相對它；`node_modules` 是符號連結，未追蹤屬預期，勿動）。報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-ops/`。
- 只寫：`src/ui-adapter/ops/**`（含測試、fixtures、ops.css）、`src/ui-adapter/dom/shell.ts` 僅在必要時、`src/ops/world/market.ts`（只准新增共用唯讀查詢函式）及其測試、`e2e/ops-*.spec.ts` 的對應字串更新（不跑 playwright）。
- 不做：`src/ui-adapter/vm/`（戰鬥 vm）、`src/ui-adapter/dom/wiki/`、`src/ui-adapter/vm/wiki/`（另有線負責）、`src/ai/`、`content/`、`test/golden/`、`wf/`；不改遊戲規則與數值。
- 件數 gate：新增＋修改檔超過 18 個就停下回報；容量 gate：任一新檔超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一項 |
| `npm run test:dom`（若 package.json 有） | 改 dom 後 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-web-ops --once` | 每完成一項讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

可寫程式碼線，只寫「範圍」列的路徑。不碰鍵盤、滑鼠、螢幕（不截圖、不開瀏覽器、不跑 playwright）；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不上網；不用 MCP。子代理上限 2 個，只准為推進正事開，不得兩個同時寫同一檔。沙箱內 `node --test` 計數不準、spawn 子行程 EPERM 是已知環境限制，不算阻塞，REPORT 列受影響檔，由調度者在沙箱外重跑。
另可跑 `npm run build`（不跑 playwright）。工具壞掉／沙箱拒寫 → 發 `BLOCKED`；自己的錯 → 自己修。

## 項目

- R01 市場購買按鈕在 `reputation-required` 時原因文字改為「需要〈勢力名〉聲望 N（目前 H）」，數字取自 `src/ops/war/rnd.ts` 的 `repGateBlocked` 結果（優先在 `src/ops/world/market.ts` 加共用唯讀查詢，只加不改既有行為；若需動 `src/ops/`，限這一個檔）；`labels.ts` 補通用中文 fallback。市場列另常駐顯示門檻（MarketView.items 加 reputation 欄）。不擴大可見商品集合。
- R02 把朔望 `spring` 的顯示字串「大潮」全改「漲潮」（盤點報告第 2 題表 14 處：types.ts 註解、labels.ts、tabs.ts、fixtures.ts、render.test.ts；「須等到漲潮之夜」「今天是漲潮日」「距下次漲潮 N 天」）；識別字不改。
- R03 頂列與蝕曆顯示當日潮候與真實潮級（枯潮／漲潮／大潮／連珠潮；潮級 3 大潮、4 連珠潮、1 枯潮；2 漲潮），蝕曆逐日格帶 stage／tide。預測日呼叫 `clock(day, cal, world.all("omen"))`。
- R04 頂列顯示當日天象短標籤，蝕曆放說明與百科連結（用現有 omen 定義）。
- R05 蝕曆另顯示「下一次大潮」（潮級≥GREAT_TIDE，沿用 `src/ops/state/omens.ts` 的常數），snapshot 加 `nextGreatTide: null | {day, daysAway, tide, omens}`，搜尋期限設定上限（例如 800 天）、找不到顯示「期限內無」；保留 `nextSpringIn`。
- U01 蝕曆標題月序與頂列一致（顯示月＝原值+1；型別註解標明 month 零起算）。
- K1 核對萬潮葬王王跡欄：到 `src/ui-adapter/ops/` 讀艦橋／campaign view 如何呈現王跡三句、最後目擊日、守牆邀請與「迎戰」確認（grep presence／wanchao／engagePresence／lastSeen），對照 `wf/workflows/dispatch/handoffs/lead-engine-next/wc-01/REPORT.md`，缺的補上（含灰按鈕原因文字），並加測試。

## 工作

1. 讀先讀清單；上線發 PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-ops --up PROGRESS '開始' < /dev/null`。
2. 依上面「項目」逐項實作，每項附測試（新增斷言，不改既有期望的語意，除非該項本來就要改它）。
3. 跑 `npm test`、`npm run check`、`npm run typecheck` 全綠；寫 REPORT 並回報。



## 交付

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-ops/REPORT.md`（四段：做了什麼／改了哪些檔／沒做到的／需要決定的事）。程式碼改動留在 worktree，由調度者取回與 commit；REPORT 列出改過的檔清單。

## 驗收（固定 4 條，做完就停）

1. 「項目」每條都有實作與至少一個測試，REPORT 逐條對應。
2. worktree 內 `npm test`、`npm run check`（0 錯）、`npm run typecheck` 綠（沙箱限制除外並註明）。
3. 改動檔全在「只寫」清單內。
4. REPORT 存在。

## 失敗怎麼處置

測出來是壞的 → 回滾自己的改動，發 FAILED 附證據；測不出來 → 保持現狀發 BLOCKED。

## 完成／阻塞回報（必做）

我是誰：`cx-web-ops`，本團隊：無。終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-ops --up <DONE|BLOCKED|NEEDS-USER|FAILED> '<一句自足結論>' < /dev/null`。卡住超過 10 分鐘先發 BLOCKED。

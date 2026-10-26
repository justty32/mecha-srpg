# 任務：百科卡片補強：怪獸繼承物種生態與捕獲、新部件／機型／天象專用區塊、英文枚舉轉中文（cx-web-wa）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ui-adapter 與百科段）、`wf/workflows/testing.md`、盤點報告 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md` 中你負責的條目——親自讀。

## 背景與唯一目標

網頁介面（百科）沒跟上上一輪新內容。盤點報告已列缺口。唯一目標：百科卡片補強：怪獸繼承物種生態與捕獲、新部件／機型／天象專用區塊、英文枚舉轉中文。**不改遊戲規則與數值**；行為以 code／tests 為準，中文用詞避免英文直譯，百科詞彙沿用既有（見 `content/lore` 與 `src/ui-adapter/vm/wiki/kinds.ts` 既有譯名）。

項目（盤點編號）：
- W01 怪獸詳情卡繼承物種的 behaviors（molt／spawner／telegraph，spawner 要顯示子代、節奏、上限）、capture 條件、aiProfile。
- W03 component 卡列屬性／資源池修正、附加層、共鳴、負擔；model 卡列對應機體（連結）、製造勢力、價階、出口政策、解鎖條件；omen 卡列週期、觸發條件、潮級改變與效果；calendar 卡列月日數與朔望。原始資料區保留。
- W04 卡片欄位、徽章中把英文枚舉（cls／origin：ancient／bio／mechanical；mode：activated／reaction；slot 八種；scope：layer／mech／part／person；symmetry：asymmetric／bilateral；人物 human／soul）按欄位上下文轉成中文，欄名 symmetry 補中文；不對普通文字做全域翻譯。**列表篩選面向（list.ts）不歸你，歸另一條線**。

## 工作目錄與範圍（排除法寫死）

- 唯一可寫根：隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-web/wt-wa/`（內容＝主 repo HEAD；相對路徑都相對它；`node_modules` 是符號連結，未追蹤屬預期，勿動）。報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-wa/`。
- 只寫：
`src/ui-adapter/vm/wiki/cards.ts`、`card-builder.ts`、`labels` 類新檔（若需要新建 `src/ui-adapter/vm/wiki/card-labels.ts`）、百科卡片 dom `src/ui-adapter/dom/wiki/card-dom.ts`（僅在必要時），及其測試（新增 `src/ui-adapter/vm/wiki/cards-new.test.ts`；不改 `pages.test.ts`、`mount.test.ts`）。**不碰** `src/ui-adapter/vm/wiki/{types,index,kinds,list,search}.ts` 與 `src/ui-adapter/dom/wiki/pages.ts`、`mount.ts`（另一條線 cx-web-wb 持有）；若需要新增 wiki vm 型別，改成在 cards 檔內以現有型別表達，做不到就寫進 REPORT「需要決定的事」。
- 不做：上述以外的任何檔（尤其 `src/ui-adapter/vm/{controller,types,viewmodel,text}.ts`、`src/ui-adapter/ops/`、`src/ai/`、`content/`、`test/golden/`、`wf/`）；不新增依賴；不 commit；不刪檔。
- 件數 gate：新增＋修改檔超過 14 個就停下回報；容量 gate：任一新檔超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一項 |
| `npm run test:dom`（若 package.json 有） | 改 dom 後 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-web-wa --once` | 每完成一項讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

可寫程式碼線，只寫「範圍」列的路徑。不碰鍵盤、滑鼠、螢幕（不截圖、不開瀏覽器、不跑 playwright）；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不上網；不用 MCP。子代理上限 2 個，只准為推進正事開，不得兩個同時寫同一檔。沙箱內 `node --test` 計數不準、spawn 子行程 EPERM 是已知環境限制，不算阻塞，REPORT 列受影響檔，由調度者在沙箱外重跑。工具壞掉／沙箱拒寫 → 發 `BLOCKED`；自己的錯 → 自己修。

## 工作

1. 讀先讀清單；上線發 PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-wa --up PROGRESS '開始' < /dev/null`。
2. 依下面「項目」逐項實作，每項附測試（新增斷言，不改既有期望的語意，除非該項本來就要改它）。
3. 跑 `npm test`、`npm run check`、`npm run typecheck` 全綠；寫 REPORT 並回報。



## 交付

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-wa/REPORT.md`（四段：做了什麼／改了哪些檔／沒做到的／需要決定的事）。程式碼改動留在 worktree，由調度者取回與 commit；REPORT 列出改過的檔清單。

## 驗收（固定 4 條，做完就停）

1. 「項目」每條都有實作與至少一個測試，REPORT 逐條對應。
2. worktree 內 `npm test`、`npm run check`（0 錯）、`npm run typecheck` 綠（沙箱限制除外並註明）。
3. 改動檔全在「只寫」清單內。
4. REPORT 存在。

## 失敗怎麼處置

測出來是壞的 → 回滾自己的改動，發 FAILED 附證據；測不出來 → 保持現狀發 BLOCKED。

## 完成／阻塞回報（必做）

我是誰：`cx-web-wa`，本團隊：無。終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-wa --up <DONE|BLOCKED|NEEDS-USER|FAILED> '<一句自足結論>' < /dev/null`。卡住超過 10 分鐘先發 BLOCKED。

# 任務：戰鬥介面補強：資源池中文名、移動類別與地形通行成本、能力說明、已裝部件、怪獸個體名與生態、萬潮葬王在場單位核對（cx-web-bt）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ui-adapter 與百科段）、`wf/workflows/testing.md`、盤點報告 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md` 中你負責的條目——親自讀。

## 背景與唯一目標

網頁戰鬥介面沒跟上上一輪新內容。唯一目標：補上下列項目。不改遊戲規則與數值；有效移動成本、影響格預覽若缺引擎 query 就只做靜態資料顯示並記進 REPORT。中文用詞避免英文直譯。lead-engine-next 已收線，新增戰場不可交戰在場單位 presence（`engagePresence` 戰鬥指令）。

## 工作目錄與範圍（排除法寫死）

- 唯一可寫根：隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-web/wt-bt/`（內容＝主 repo HEAD；相對路徑都相對它；`node_modules` 是符號連結，未追蹤屬預期，勿動）。報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-bt/`。
- 只寫：`src/ui-adapter/vm/**` 除 `vm/wiki/` 與 `vm/route*`、`src/ui-adapter/dom/{board,panels,menus,tooltip,fx,render,style.css}` 及其測試。
- 不做：`src/ui-adapter/ops/`、`src/ui-adapter/vm/wiki/`、`src/ui-adapter/dom/wiki/`、`src/ai/`、`src/rules/`、`content/`、`test/golden/`、`wf/`；不改遊戲規則與數值。
- 件數 gate：新增＋修改檔超過 16 個就停下回報；容量 gate：任一新檔超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一項 |
| `npm run test:dom`（若 package.json 有） | 改 dom 後 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-web-bt --once` | 每完成一項讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

可寫程式碼線，只寫「範圍」列的路徑。不碰鍵盤、滑鼠、螢幕（不截圖、不開瀏覽器、不跑 playwright）；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不上網；不用 MCP。子代理上限 2 個，只准為推進正事開，不得兩個同時寫同一檔。沙箱內 `node --test` 計數不準、spawn 子行程 EPERM 是已知環境限制，不算阻塞，REPORT 列受影響檔，由調度者在沙箱外重跑。
另可跑 `npm run build`（不跑 playwright）。工具壞掉／沙箱拒寫 → 發 `BLOCKED`；自己的錯 → 自己修。

## 項目

- B01 `vm/viewmodel.ts` 的 `commands()` 成本 tooltip 不再外露英文資源池鍵（ap、charge、fatigue、rune-round 等；完整集合見盤點報告 B01），改用池宣告的中文名，`vm/labels.ts` 補特殊池 fallback。
- B02 單位卡顯示移動類別（leg 步行、track 履帶、hover 潮行、flight 飛行、burrow 掘進；只改顯示詞，識別字不動）與機體類別（mechanical 機械、bio 生體、ancient 古代機）；格子 tooltip 顯示選中單位在該格的通行成本或不可通行（取自既有 query/內容資料，不得在 dom 重算規則）。
- B03 能力說明 tooltip 補傷害、效果、產出、冷卻、範圍形狀與半徑（球／線／錐／自身／單體）。
- B04 部位面板列出（我方）已裝部件中文名與功能；敵方仍守既有 knowledge 邊界。
- B05 怪獸個體名與稱號（monster 定義 name／epithet）取代物種名顯示（`vm/text.ts` 的 `unitName()` 與 viewmodel 棋盤短名），守既有可見性限制。
- B06 單位卡顯示怪獸家族（alien 異形、beast 野獸、insect 蟲類、mycelium 菌絲）與可公開的生態行為短說明（molt 蛻皮、spawner 育幼、telegraph 預告）。
- K2 核對 presence（萬潮葬王在場單位）在戰場的呈現：棋盤標記、單位卡「不可交戰」說明、「迎戰」指令的灰按鈕原因、潮懼光環標示。對照 `wf/workflows/dispatch/handoffs/lead-engine-next/wc-01/REPORT.md`，缺的補上並加測試。

## 工作

1. 讀先讀清單；上線發 PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-bt --up PROGRESS '開始' < /dev/null`。
2. 依上面「項目」逐項實作，每項附測試（新增斷言，不改既有期望的語意，除非該項本來就要改它）。
3. 跑 `npm test`、`npm run check`、`npm run typecheck` 全綠；寫 REPORT 並回報。



## 交付

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-bt/REPORT.md`（四段：做了什麼／改了哪些檔／沒做到的／需要決定的事）。程式碼改動留在 worktree，由調度者取回與 commit；REPORT 列出改過的檔清單。

## 驗收（固定 4 條，做完就停）

1. 「項目」每條都有實作與至少一個測試，REPORT 逐條對應。
2. worktree 內 `npm test`、`npm run check`（0 錯）、`npm run typecheck` 綠（沙箱限制除外並註明）。
3. 改動檔全在「只寫」清單內。
4. REPORT 存在。

## 失敗怎麼處置

測出來是壞的 → 回滾自己的改動，發 FAILED 附證據；測不出來 → 保持現狀發 BLOCKED。

## 完成／阻塞回報（必做）

我是誰：`cx-web-bt`，本團隊：無。終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-bt --up <DONE|BLOCKED|NEEDS-USER|FAILED> '<一句自足結論>' < /dev/null`。卡住超過 10 分鐘先發 BLOCKED。

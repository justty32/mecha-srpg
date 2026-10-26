# 任務：百科清單／搜尋／標題補強：11 種 kind 中文分類、機型標題、nameEn 與 etymology 可搜尋、傳聞與可能發生徽章跨頁一致、列表篩選面向中文（cx-web-wb）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（ui-adapter 與百科段）、`wf/workflows/testing.md`、盤點報告 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/inv/REPORT.md` 中你負責的條目——親自讀。

## 背景與唯一目標

網頁介面（百科）沒跟上上一輪新內容。盤點報告已列缺口。唯一目標：百科清單／搜尋／標題補強：11 種 kind 中文分類、機型標題、nameEn 與 etymology 可搜尋、傳聞與可能發生徽章跨頁一致、列表篩選面向中文。**不改遊戲規則與數值**；行為以 code／tests 為準，中文用詞避免英文直譯，百科詞彙沿用既有（見 `content/lore` 與 `src/ui-adapter/vm/wiki/kinds.ts` 既有譯名）。

項目（盤點編號）：
- W02 `kinds.ts` 補 11 種缺中文分類名，建議譯名（可微調但要說明）：actor→營運角色、affinity→親疏規則、file→其他資料、forces→部隊編制、lane→航線、lineage→機系譜系、model→機型、operation→軍事行動、regions→區域表、treaty→條約、wterrain→世界地形；並補分類排序。
- W05 `index.ts` 的 `nameEntry()` 讓 79 筆沒有 name 的 model 以其 frame 的中文名推導標題（並以「機型」辨識，原 id 留作次要資料）。
- W06 `search.ts` 把 nameEn、etymology 納入搜尋；命中欄位若需區分再改 wiki `types.ts` 的 SearchField。
- U02 列表、搜尋結果、年表中補「傳聞」「可能發生」徽章（整筆 rumor、visibility 欄位、occurs possible），與詳情卡風格一致；需傳遞 visibility／occurs 到 list／search 的列資料型別。
- W04 的列表部分：`list.ts` 的篩選面向選項、列表欄值中的英文枚舉（cls／origin／mode／slot／scope／symmetry）轉中文；卡片內容的翻譯由 cx-web-wa 做，**兩條線各自內建對照，不互相 import 對方新檔**，對照若重複請在 REPORT 註明由調度者合併。

## 工作目錄與範圍（排除法寫死）

- 唯一可寫根：隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-web/wt-wb/`（內容＝主 repo HEAD；相對路徑都相對它；`node_modules` 是符號連結，未追蹤屬預期，勿動）。報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-wb/`。
- 只寫：
`src/ui-adapter/vm/wiki/{types,index,kinds,list,search}.ts`、`src/ui-adapter/dom/wiki/{pages,mount}.ts`、`src/ui-adapter/dom/wiki/wiki.css`、及其測試（`pages.test.ts`、`mount.test.ts`，以及新增 `src/ui-adapter/vm/wiki/index-new.test.ts`）。**不碰** `src/ui-adapter/vm/wiki/cards.ts`、`card-builder.ts`、`dom/wiki/card-dom.ts`（另一條線 cx-web-wa 持有）。
- 不做：上述以外的任何檔（尤其 `src/ui-adapter/vm/{controller,types,viewmodel,text}.ts`、`src/ui-adapter/ops/`、`src/ai/`、`content/`、`test/golden/`、`wf/`）；不新增依賴；不 commit；不刪檔。
- 件數 gate：新增＋修改檔超過 14 個就停下回報；容量 gate：任一新檔超過 30 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck`（worktree 根） | 每完成一項 |
| `npm run test:dom`（若 package.json 有） | 改 dom 後 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-web-wb --once` | 每完成一項讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

可寫程式碼線，只寫「範圍」列的路徑。不碰鍵盤、滑鼠、螢幕（不截圖、不開瀏覽器、不跑 playwright）；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不上網；不用 MCP。子代理上限 2 個，只准為推進正事開，不得兩個同時寫同一檔。沙箱內 `node --test` 計數不準、spawn 子行程 EPERM 是已知環境限制，不算阻塞，REPORT 列受影響檔，由調度者在沙箱外重跑。工具壞掉／沙箱拒寫 → 發 `BLOCKED`；自己的錯 → 自己修。

## 工作

1. 讀先讀清單；上線發 PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-wb --up PROGRESS '開始' < /dev/null`。
2. 依下面「項目」逐項實作，每項附測試（新增斷言，不改既有期望的語意，除非該項本來就要改它）。
3. 跑 `npm test`、`npm run check`、`npm run typecheck` 全綠；寫 REPORT 並回報。



## 交付

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-web/cx-web-wb/REPORT.md`（四段：做了什麼／改了哪些檔／沒做到的／需要決定的事）。程式碼改動留在 worktree，由調度者取回與 commit；REPORT 列出改過的檔清單。

## 驗收（固定 4 條，做完就停）

1. 「項目」每條都有實作與至少一個測試，REPORT 逐條對應。
2. worktree 內 `npm test`、`npm run check`（0 錯）、`npm run typecheck` 綠（沙箱限制除外並註明）。
3. 改動檔全在「只寫」清單內。
4. REPORT 存在。

## 失敗怎麼處置

測出來是壞的 → 回滾自己的改動，發 FAILED 附證據；測不出來 → 保持現狀發 BLOCKED。

## 完成／阻塞回報（必做）

我是誰：`cx-web-wb`，本團隊：無。終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-web-wb --up <DONE|BLOCKED|NEEDS-USER|FAILED> '<一句自足結論>' < /dev/null`。卡住超過 10 分鐘先發 BLOCKED。

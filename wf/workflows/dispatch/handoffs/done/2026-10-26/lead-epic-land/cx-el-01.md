# 任務：在隔離 worktree 依 plan-epic 裁示改寫 12 個 lore 檔的文字欄（batch el-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/plan-epic/REPORT-v2.md`（第 3 節與文末裁示）、`wf/workflows/dispatch/handoffs/plan-epic/v3.md`（第 2、3、3.5 節與文末裁示）、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/cx-el-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

使用者 2026-10-26 對三輪史詩規劃（plan-epic）裁示：一萬年前的事保持神祕（前史說多了的收回）；國家不會那麼容易死（縮而不死）；中國是君主立憲、有朝廷；塞勒涅本身中等，量級來自替上了月的富豪管錢；崩年前地球是九十億人。本批唯一目標：把下列 12 檔文字欄裡與這些裁示衝突的句子照下面「逐檔規則」改掉，句子讀起來仍是自然的中文，**其餘一字不動**。

## 方法與禁忌（每條都適用）

- 節點優先、不暴力產 lore：**只改衝突處**，不新增段落、不新增具名人物、地名、事件、專名。
- 不拿其他作品類比（不寫任何外部作品名、關卡名）。
- 中文命名避免直譯；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`（古代機本體叫古代機、外層叫裝甲；潮→蝕）。
- 國家、塞勒涅、巨頭只削弱不萬能：不要把它們寫得無所不能，也不要寫成消失。
- 已裁示的不推翻：蝕潮的另一端在月亮上、月面人口與門有關、「我們把兩樣東西一起留下」、一人一獸一層裝甲、刑天沒有頭還在打、夸父逐日不止，這些**保留**。

## 範圍（排除法寫死）

- 只改這 12 個檔（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-epic-land/wt-el-01/`）。
- 只改文字欄：`name`、`title`、`summary`、`body`、`desc`、`description`、`text`、`label`、`brief`、`lines`、`phrase`、`phrases`、`badge`、`note`、`aka`、`epithet`、`flavor`；另可改敘述欄 `consequences`、`role`、`scale`、`doctrine`、`ideology`、`silhouette`、`status2108`、`region`、`hq`、`mechSeries`、`relation`。id、檔名、數字欄、引用（`kind/name`）、鍵、陣列長度一律不動——閘門逐節點比對，動了就退件。
- 不做：上列以外的任何檔（含 `content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；不新增、不刪除檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-el-01/`）。
- 件數 gate：改動檔超過 12 個就停下回報；容量 gate：任何單檔改後比原檔長 15% 以上就停下回報。任一觸發都停。

## 逐檔規則

**前史收回（v2 第 3 節第 1–3 條）。** 原則：刻痕說得很少；不替先民寫社會史、去處與個人事蹟的細節。「夸父把裂縫推到月亮上」一律改成**守寢人抄本的說法、標為傳聞**（例：「守寢人的抄本說他追著太陽走；刻痕只畫了『追』，沒畫追到哪」）；不再寫成刻痕證明的事實。

1. `content/lore/characters/kuafu.json`：`summary` 的「追著太陽走、把裂縫推到月亮上的先民」改為不定去處的說法（例：「守寢人說他追著太陽走的先民」）；`body`「刻痕說他『追著太陽走』……推到月亮上去」改為刻痕只畫「追」、推月是抄本傳聞。「守寢人拒絕殘聯，也拒絕塞勒涅」可補「也拒絕朝廷」（中國朝廷視夸父為天命象徵，v3 第 3.5 節）。
2. `content/lore/characters/tenzin-dolma.json`：「刻痕後來證明她取對了：……把裂縫推到月亮上的人」改為不證明（例：守寢人的抄本說那個先民追著太陽走，她取的名字沒人能說錯）；「每個政府、每家公司都來格爾木要夸父」改為「朝廷、各國政府、每家公司都來……」這類，朝廷只點到一次。
3. `content/lore/characters/xingtian.json`：「要把裂縫與答案一起埋進地下」「守到所有人都下去了」改為「守到最後」，**不寫先民去了哪裡**；其餘保留。
4. `content/lore/eras/forerunners.json`：標題「沒有工業的文明，走到了機甲的盡頭」與「先民沒有鑄爐、沒有天網、沒有流光池……」「四族裂獸在大地上築巢、遊獵、變異、蔓延」「先民不必拿凡鐵去試……」這些社會史刪縮成一兩句「刻痕說得很少」的口吻（保留「一個人、一隻裂獸、一層裝甲」與三種稱呼）；`summary` 的「走到生物系的終點」與「把裂縫與答案一起埋進地下」可留其一，「推到月亮上」改為不寫成先民意圖的現象句（例：「蝕潮的另一端從此在月亮上」）。「先民封不住蝕潮，只能把這一端推進地底、把另一端推上月球」同理改成現象（裂縫進了地底、另一端在月上），不寫「怎麼推」。
5. `content/lore/events/forerunners-seal.json`：「先民沒有鐵、沒有工坊」這類社會史刪；「推」那一條：「格爾木的刻痕說有一個人『追著太陽走』……守寢人說那就是夸父」改為抄本傳聞、刻痕只畫「追」；「把蝕潮的另一端推離地球，推到月亮上」改為現象句（另一端在月上；怎麼到那裡的刻痕沒畫）。`consequences` 第 3 條同理。「刻痕裡的城一座座被畫成空白」可留。
6. `content/lore/factions/shell-wardens.json`：開頭「一萬一千年前追著太陽走，把裂縫推到月亮上」改為守寢人說法、不定去處；「各國殘軍與月面公司都伸手要夸父」可改「朝廷、各國殘軍與月面公司」；`summary`「拒絕殘聯與塞勒涅」可補朝廷（不超過一處新增詞）。
7. `content/lore/timeline.json`：`-8900`「先民封蝕」條 summary 的「把蝕潮的另一端推上月亮」改為現象句（例：「蝕潮的另一端從此在月亮上」）；**2090 聖保羅條**「巴西政府遷往巴西利亞後解體」改為「巴西政府放棄沿海、退守內陸高原的巴西利亞」（國家縮而不死，v3 第 2 節 (e)）；2102 埃吉爾條「無人能認」改「至今無人能認」。其餘條目不動。

**國家縮而不死（v3 第 2 節）。** 國家失去沿海、過半稅基與「一夜之內到」的能力，但保住法理、登記簿、科研工業、徵召、貨幣；**不寫國家消失**。「國家破產」「財政崩潰」可以留（財政斷不等於國家死）。

8. `content/lore/eras/first-tide.json`：末句「各國政府還在，錢也還在——再撐四年。」改為只讓錢撐不住、政府還在（例：「各國政府還在，錢也還在——錢只再撐四年。」）。
9. `content/lore/events/golmud-split.json`：「三四個還沒破產完的國家也想要」改為朝廷在列（例：「朝廷說那是天命，三四個還沒破產完的國家也想要」）；「他們拒絕殘軍，也拒絕塞勒涅」可補朝廷。「舊世界的國家一個接一個宣布破產」保留或改「付不出錢」均可，不寫國家消失。

**塞勒涅量級與崩前人口（v3 第 3 節 B、第 3.5 節）。**

10. `content/lore/eras/old-world.json`：兩處「六十億」改「九十億」。其餘不動。
11. `content/lore/factions/selene.json`：「蝕潮來之後，塞勒涅是少數沒有破產的大企業。」改為加上原因、不誇大公司本身（例：「蝕潮來之後，塞勒涅是少數沒有破產的大企業——地球資產蒸發了四成，救它的是航線不經任何港口，和崩年四年買船票上月的人帶上去的錢。」）；**不點名任何富豪**、不寫「全球貸方」。

**埃吉爾（v3 第 1 節，只補「至今」）。**

12. `content/lore/events/skagerrak-shell-found.json`：`summary`「沒有人能讓它認主」改「至今沒有人能讓它認主」。其餘不動（認主事件不在本批）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-epic-land/wt-el-01 grep -nE '推到月亮|推上月亮|推上月球|推離地球|都下去了|沒有工業|六十億|解體|再撐四年' -- content/lore` | 改完確認殘留；每處殘留都要在 REPORT「殘留」段寫理由 |
| `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯） | 改完在 worktree 根跑；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-el-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/el-01/`；**不 commit**（沙箱下 `.git` 唯讀）。報告目錄只放 REPORT.md，不寫全文傾印。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`。
2. 逐檔照「逐檔規則」改文字欄。
3. 全部改完 grep 殘留、跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/el-01/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若寫檔名含 REPORT 被擋，改寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/el-01/report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-epic-land/wt-el-01/content/lore/…`（上列 12 檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/el-01/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列親自讀過的路徑）；「做了什麼」；「逐檔對照」（每檔一小節，列每處「舊片段 → 新片段」，片段取半句；沒改的檔寫「無需改」與理由）；「殘留」；「沒做到或證據不足的」；「需要決定的事」；「子代理」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動只落在上列 12 檔（`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-epic-land/wt-el-01 status --short` 除 `node_modules` 外只見這些）。
2. `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯）全過。
3. 上列檔案裡沒有「六十億」「都下去了」「解體」「沒有工業」；「推到月亮／推上月亮／推上月球／推離地球」每處殘留都在 REPORT「殘留」段寫明是傳聞或現象句。
4. REPORT 有逐檔對照。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-el-01`。本線團隊：`teams/epic`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-el-01 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-el-01 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/el-01/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「照逐檔規則把衝突說法改掉」；任何需要改其他檔或改結構的需求一律寫進 REPORT，不動手。

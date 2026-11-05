# 任務：依已審計畫產出 fs-01——7 情境、2 地圖，恰好 9 個新檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/dispatch/handoffs/lead-fill-scen/fs-common.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/battle-field.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/specs/core/data-model-world.md`、`wf/workflows/planning/specs/core/data-model-world/scenario.md`、`content/base/scenarios/kj2-03-demo.json`。再讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/scenarios.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/maps.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/roster-coverage.json`；表用 tabledb 依 batch=fs-01 查，不整讀。REPORT 開頭列「已讀清單」，含上述每個路徑；逐檔讀本批引用的 frame、monster、species、terrain 與 lore 掛點。

## 背景與唯一目標

新機與新獸已有資料，缺可玩的地域戰場。本線依計畫新增指定內容，不再設計新題材。名稱與文筆可小幅潤飾，玩法、id、名單、地圖幾何、單位順序、配裝、目標與 seed 按資料表凍結。新專名在 review 標「（提案）」。數值後期統一調；不可為探針勝率改既有數值。

## 方法與逐檔規格

逐檔完整規格在 scenarios.json、maps.json 的本批列；兩表是本交接書組成部分。沒有省略待工人設計的座標、名單或目標。scenario 的檔／名稱／nameEn／brief／map／slots／objectives／rounds／seed 逐欄落實；名稱去掉審稿用（提案）尾綴，寫入 name。etymology 寫英文意涵、掛到的 place id、補充事件 id 與「2108可能遭遇的試機配置」，不新增 loreId／batch 等未知內容欄。

map 不支援 name，中文地圖名放 etymology 與 review，nameEn 用表內值。底地形填滿24×20，依矩形陣列順序含端點覆寫，再依收尾覆寫的乾道、部署格、中央碑順序處理；glyph 按 terrain id 排序用小寫a起，cells不含換行。deployZones、exits、globals逐欄照表。不得隨機塗地或自行挪部署。單位都用表列固定 at，不寫zone。

mech 不填components即使用已有defaultLoadout；先核對每台有可用武器與pilot座，persons照表，全場不重複。不得省略persons變成無人空殼，也不得把crew:ai當機魂。怪獸slot不蓋過species AI。巢母相鄰空格保留給能力生子，初始同種子體不宣稱已繫母；不改AI檔。雙機護送鎖定ally-0/ally-1，兩台各一條killTarget lose；固定西口距初始護送單位17/18格。盟軍allies雙向；玩家lose在最前。三方局三方各有win。所有場景可重播，不能寫成六隻二名已被永久殺掉的史實。

fs-common.md全數適用。月面僅機械；白手套faction在本批是保全陣營代理，有核心有人員的機型不能敘述為無核鐵偶。怪獸通用slot沿既有faction/rift-insects，但獸、異形、菌絲按本種描述。人物是參考編隊，不新增歷史歸屬或宣稱同一人在兩機。

## 範圍

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-01/` 新增下列檔（本批manifest files的完整展開；報告另存指定目錄）：

- `content/base/scenarios/fs-01-mud-mouth.json`
- `content/base/scenarios/fs-01-wing-lantern.json`
- `content/base/scenarios/fs-01-fan-feet.json`
- `content/base/scenarios/fs-01-bell-break.json`
- `content/base/scenarios/fs-01-sluice-eight.json`
- `content/base/scenarios/fs-01-needle-ledge.json`
- `content/base/scenarios/fs-01-last-cliff-lamp.json`
- `content/base/maps/fs-01-batangas.json`
- `content/base/maps/fs-01-sendai.json`

不做：修改、刪除任何既有檔；不動src、test、specs、AI、content/lore、world、batches、index、.gitignore及其他wf檔；不做王跡／北行專線相關內容。新地形0件，不能因allow.kinds列terrain就另加。跨批零依賴。

件數 gate：新增超過9件停止回報；不足要補齊名單，不能另取名字頂數。容量 gate：單檔超過16 KB或本批content合計超過1 MB停止回報。worktree內不留暫存，driver／log只放 `/tmp/cx-fs-01/`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 依batch讀本批規格與review草稿，報告表也用tabledb |
| `npm run check` | 完成新檔後跑，末行OK 0 errors；警告照實記錄 |
| `npm run typecheck` | 完成後跑，exit 0 |
| `npm run sim` | 按下方寫死命令逐場AI對AI，兩個seed各一次 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fs-01 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

計畫線已在主repo實跑同語法：scenario/kj2-03-demo、seed210803，exit0、enemy/eliminate、第15輪，證據 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/probe-trial.txt`。cli不支援--help；不要呼叫它。以下在已配置依賴的worktree cwd執行；先建立scratch目錄，再依序跑，任一非0停下處理，不以後一命令成功掩蓋。

```sh
mkdir -p /tmp/cx-fs-01
npm run sim -- --scenario scenario/fs-01-mud-mouth --seed 21082601 --ai-vs-ai > /tmp/cx-fs-01/fs-01-mud-mouth-21082601.txt
npm run sim -- --scenario scenario/fs-01-mud-mouth --seed 21092601 --ai-vs-ai > /tmp/cx-fs-01/fs-01-mud-mouth-21092601.txt
npm run sim -- --scenario scenario/fs-01-wing-lantern --seed 21082602 --ai-vs-ai > /tmp/cx-fs-01/fs-01-wing-lantern-21082602.txt
npm run sim -- --scenario scenario/fs-01-wing-lantern --seed 21092602 --ai-vs-ai > /tmp/cx-fs-01/fs-01-wing-lantern-21092602.txt
npm run sim -- --scenario scenario/fs-01-fan-feet --seed 21082603 --ai-vs-ai > /tmp/cx-fs-01/fs-01-fan-feet-21082603.txt
npm run sim -- --scenario scenario/fs-01-fan-feet --seed 21092603 --ai-vs-ai > /tmp/cx-fs-01/fs-01-fan-feet-21092603.txt
npm run sim -- --scenario scenario/fs-01-bell-break --seed 21082604 --ai-vs-ai > /tmp/cx-fs-01/fs-01-bell-break-21082604.txt
npm run sim -- --scenario scenario/fs-01-bell-break --seed 21092604 --ai-vs-ai > /tmp/cx-fs-01/fs-01-bell-break-21092604.txt
npm run sim -- --scenario scenario/fs-01-sluice-eight --seed 21082605 --ai-vs-ai > /tmp/cx-fs-01/fs-01-sluice-eight-21082605.txt
npm run sim -- --scenario scenario/fs-01-sluice-eight --seed 21092605 --ai-vs-ai > /tmp/cx-fs-01/fs-01-sluice-eight-21092605.txt
npm run sim -- --scenario scenario/fs-01-needle-ledge --seed 21082606 --ai-vs-ai > /tmp/cx-fs-01/fs-01-needle-ledge-21082606.txt
npm run sim -- --scenario scenario/fs-01-needle-ledge --seed 21092606 --ai-vs-ai > /tmp/cx-fs-01/fs-01-needle-ledge-21092606.txt
npm run sim -- --scenario scenario/fs-01-last-cliff-lamp --seed 21082607 --ai-vs-ai > /tmp/cx-fs-01/fs-01-last-cliff-lamp-21082607.txt
npm run sim -- --scenario scenario/fs-01-last-cliff-lamp --seed 21092607 --ai-vs-ai > /tmp/cx-fs-01/fs-01-last-cliff-lamp-21092607.txt
```

記每場勝負、reason、輪數、原始log路徑。timeout是完成但須揭露，未決／例外才屬未完成；不得靠改HP、AI或上調rounds洗過。預設maxSteps的限制照實報。此處不要求MCP、content:probe單位對打、npm test、黃金重錄或wf全庫掃描，不自行加碼。

## 資源與禁區

可寫程式碼線：只寫上述worktree明列新檔、報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-01/`、scratch `/tmp/cx-fs-01/`；inbox僅指定回報。worktree由領導預先建立，base由領導填真commit。

不碰鍵鼠螢幕、不開GUI、不push、不建分支、不rebase/reset、不commit、不rm -rf、不改~/.codex/config.toml、不裝依賴、不上網。子代理上限1，受同範圍與同已讀義務；未用就寫0。工具本身壞掉或沙箱拒寫→BLOCKED；自己打錯自己修。

## 工作

1. 親自讀規矩與本批規格，上線PROGRESS；核worktree與掛點引用。
2. 按表新增地圖與情境，完成後跑check／typecheck與上方固定sim。
3. 寫review.json與REPORT，完成固定四條即停，終局寄信。

## 交付

REPORT直接寫檔 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-01/REPORT.md`；白話表 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-01/review.json`，wf-table/1，columns ["檔","類別","名稱","白話","掛到"]，恰好9列、每個新檔一列、白話≤60字。原始sim輸出保存在 `/tmp/cx-fs-01/`，REPORT逐場連到log，不捏造結果。

REPORT第一段已讀清單；後依序寫做了什麼、產出與掛點、check/typecheck結果及sim逐場數字、沒做到或證據不足、需要決定／引擎候選、子代理數與成本可得性。收尾回覆5行摘要＋REPORT絕對路徑。

## 驗收（固定4條，做完就停）

1. 只有本書明列9個新content檔；座標、slots、武器與人物、玩家lose、目標、掛點照規格，沒有禁區題材。
2. npm run check為0 errors，npm run typecheck退出0；警告記REPORT。
3. 本批每情境按寫死命令兩seed各跑一次，0例外、非未決，REPORT記勝負／原因／輪數與真實log。
4. review.json合法、9列、白話≤60字、每檔有掛點；REPORT已讀清單與證據齊。

## 失敗處置與回報

測出壞的先在授權新檔內修，修不好FAILED；無法測BLOCKED，不拿舊輸出冒充。由領導決定是否修訂計畫，工人不擴大範圍。我是cx-fs-01，團隊teams/fillscen，上游lead-fill-scen，ROSTER由領導登記。

```sh
/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fs-01 --up PROGRESS '已讀完，開始產出fs-01' < /dev/null
/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fs-01 --up DONE 'fs-01完成：7情境、2地圖' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-01/REPORT.md
```

終局STATUS必為DONE／BLOCKED／FAILED／NEEDS-USER之一；不是DONE時換成實際狀態與自足標題。

## 資源規則（頂層緊急令，必守）

全機同時最多一個重負載：不跑全套 `npm test`／`test:e2e`／fuzz／sim:campaign。只跑 `npm run check`、`npm run typecheck`、單檔 `node --test 「檔」`，與上述寫死的單一情境 `npm run sim` 探針（一次一個、依序跑）；跑前 `pgrep -fa 'node --test|vitest|playwright|npm run (test|sim|fuzz)'` 確認沒人在跑重負載，有就等。全套測試由領導收件後跑。

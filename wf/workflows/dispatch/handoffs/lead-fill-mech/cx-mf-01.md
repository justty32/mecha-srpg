# 任務：在隔離 worktree 新增 6 台衍型機 frame（含必要部件 ≤3），補上國家型傘、日傘、歐傘內海家族與塞勒涅第一款型錄機（batch mf-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/ability-forms.json`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/playtest-baselines.json`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/mechs.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world/drive.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`content/lore/factions/selene.json`、`content/lore/factions/singapore-exchange.json`、`content/lore/factions/mimic-works.json`、`content/lore/factions/league-armory.json`、`src/mcp/README.md`、`wf/workflows/dispatch/handoffs/lead-fill-mech/cx-mf-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

盤點結果：機甲型號幾乎全掛在獵團與公司身上，崩年後的國家型傘（中、俄、北美）、日傘、歐傘一台招牌機都沒有；塞勒涅第一款型錄機「銀環-G1」（2099 入型錄，2102 墜海後被逆向成長槍）只在 lore 裡有名字。本批唯一目標：照「逐檔規格」新增 6 個 frame（必要時 ≤3 個部件），讓這些機在百科與戰鬥資料裡存在、有來歷。`world/models` 由領導另寫，你不寫。

## 方法與禁忌（每條都適用）

- **每台都要有來歷**：掛到勢力、主線、年表或崩年底色（下面每檔都寫了掛點）；不暴力產，不新增規格以外的具名人物、地名、事件。
- **中文命名避免直譯**：照 `polish.md`「首要標準」兩步命名（先英文原名與意涵，再意譯或音譯）；D 級用代號、C–B 用「系列-型號」（見 `mechs.md` 三段命名）。英文原名不放 `aka`，寫進 `naming.json`。用語照 style.md 與 `wf/workflows/planning/design-notes/terms-rename.json`：衍型機、鎧甲、靈目、矢、燼、蝕潮；古代機本體叫古代機、外層叫裝甲。
- **不拿其他作品類比**：名字與文字不得指涉任何外部作品、品牌、真實軍武型號。
- **國家、塞勒涅、巨頭只削弱不萬能**：國家型傘的 B 級是「天花板仍在國家手上」的證據，不是超級武器；數值照同級既有機比照，**不做平衡、不刻意變強**。
- **已裁示不推翻**：公刻只給 D 級地板、天花板在國家型傘；中傘就是朝廷；美國拒用「傘」字；日傘最缺駕駛員、最大量用普通開遙控機與 AI 機守牆；歐傘內海造機、大西洋岸用機。
- **新名詞標提案**：所有新系列名、代號在 REPORT 與 `naming.json` 標「提案名」。

## 範圍（排除法寫死）

- 新增只限：`content/base/frames/` 下 6 個 frame（檔名照下節 id 前綴自取 kebab 英文）；`content/base/components/`、`abilities/`、`effects/` 下合計 ≤3 個新檔（**先用既有 `mx-*` 部件**，真的缺才加；凡鐵武器名帶「凡」且 tags 含 `conventional-arms`）。
- 不做：`content/base/world/`（含 models、lineages、factions-ops）、scenarios、既有任何檔的修改、`content/lore/`、`content/index/`、`content/batches/`、`src/`、`wf/`（報告目錄除外）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-mf-01/`）。
- 件數 gate：新檔超過 9 個就停下回報；容量 gate：任一新檔超過 12 KB 就停下回報。任一觸發都停。

## 逐檔規格

格式照 `templates.json` 的 frame 範本與既有檔（參照：`frames/selene-silverring-g2.json`、`frames/bulwark-iv-rampart.json`、`frames/longspear-v7.json`、`frames/union-fr7.json`）。每台：`cls:"mechanical"`、必填 `defaultLoadout`（槽 id 查 bodyplan、型別相符）、tags 含 `mech`、`human`、一個既有的 `lineage-*`（**不新造血統**，選既有並在 REPORT 寫一句理由）、一個勢力 tag（下面指定）；同定位同級若已有既有機，用配裝、池、能力做出差異，並在 REPORT 一句說明和哪台不同。

1. **銀環-G1**（id `frame/selene-silverring-g1`，名字照用）：C，`lineage-jinghai`、`faction-selene`。掛點：年表 2099「銀環-G1 入型錄」——塞勒涅第一款量產型錄衍型機、靜海仿造骨架、靈目最好、最貴、記帳；新加坡交易所拿它當海峽衛；2102 一台 G1 押運墜進孟加拉灣，被拆船幫撈起、月之暗面逆向，成了長槍（`events/longspear-leak`）。定位偵察／射手：靈目高、遠射程，比 G2 舊、配裝較素，不帶 `soul-driven`。
2. **中傘 B 級量產機**（id 前綴 `cn-`，勢力 tag `umbrella-china`）：B，`lineage-kuafu`。掛點：〈2107 中傘公開量產 B 級〉（提案事件，可讀成朝廷閱兵）——國家型傘保住的天花板公開給世界看；中傘就是朝廷、朝廷視夸父為天命；格爾木衍一聯合的血脈在國境內。定位線列。命名語感：朝廷禮器、典雅，不中二（B 級＝系列＋型號），不放年號或朝名。
3. **俄跟進 B 級**（id 前綴 `ru-`，勢力 tag `umbrella-russia`）：B。掛點：俄是國家型傘、強人體制延續、資源國、北極岸冰封損失小、2091 棄東令只留雅庫茨克；「俄、北美跟進 B 級」是提案。定位要塞或重裝（耐寒、燼池大、慢），和中傘那台不同定位。
4. **北美跟進 B 級**（id 前綴 `na-`，勢力 tag `umbrella-north-america`）：B。掛點：美國縮得最少、內陸工業完整、資本一半留在地上、以國家名義調度加拿大與墨西哥諸城、拒用傘字；跟進 B 級是提案；它拿不到蒙特婁的古代機（不寫它有）。定位射手或機動突擊，和前兩台不同定位。
5. **日傘普通開守牆機**（id 前綴 `jp-`，勢力 tag `umbrella-japan`）：D，代號命名（像造船廠編號）。掛點：2094 瀨戶內鎖海把造船廠轉衍型機；日傘最缺駕駛員、最早最大量用普通開遙控機與 AI 機守牆（`drive.md`：AI 只能普通開）。定位線列／盾。設計成不靠駕駛員也能用：內建能力不要用 `rules/cockpit.json` 的 `drivenOnlyTags` 那些 tag（ancient、soul、captain、command）。不新增欄位，遙控與 AI 是編組時的設定，不寫進 frame。
6. **歐傘內海家族工坊機**（id 前綴 `innersea-`，勢力 tag `inner-sea-houses`）：C，`lineage-kuafu`（公刻堅盾圖紙＋型錄件）。掛點：歐傘「內海造機、大西洋岸用機」——家族工坊照公刻圖紙與型錄件組機、蓋家族的印、賒帳賣往大西洋岸平民港城；2107 聖馬洛九門同喪那一夜內海在賒帳賣機。不點名任何家族；名字不用家族姓氏。

## 附帶產物（報告目錄，必交）

- `naming.json`（wf-table/1，欄位 `id`、`nameEn`、`meaning`、`nameZh`、`method`（意譯／音譯／沿用）、`status`（提案名／既有））：每個新檔一列。
- `review-rows.json`（wf-table/1，欄位 `檔`、`類別`、`名稱`、`白話`、`掛到`）：每個新檔一列。`檔`＝repo 相對路徑；`白話`＝一到兩句、不超過 60 字的人話，說它是什麼、為什麼存在，不堆術語；`掛到`＝勢力／主線／年表條／崩年底色條。
- `playtest.json` 與 `mcp-log/`：照 `playtest.md`，MCP 走 stdio（`node src/mcp/server.ts`，沙箱禁 socket listen），至少 2 場，涵蓋至少 3 台新機。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check`（worktree 根，末行 `OK 0 errors`） | 每寫完一檔跑 |
| `npm run content:probe -- frame/selene-silverring-g1 …`（列出 6 台新 frame id） | 全部寫完跑，對照參照機 |
| `node src/mcp/server.ts`（stdio） | 試玩 2 場 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 寫 naming.json、review-rows.json（先手建 wf-table/1 空表再 `add`） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-mf-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-01/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-01/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`inbox_mail.sh cx-mf-01 --up PROGRESS '已讀完先讀清單，開始寫 mf-01' < /dev/null`）。
2. 先查同級既有機（數值帶、定位），定每台定位與配裝；再逐檔寫，每檔後跑 `npm run check`。
3. 跑 probe、試玩 2 場；寫 naming.json、review-rows.json。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-01/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新 frame 與部件 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-mech/wt-mf-01/content/base/…` |
| REPORT、naming.json、review-rows.json、playtest.json、mcp-log/ | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-01/` |

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋定位＋血統理由＋和哪台既有機不同；產出；沒做到或證據不足的；需要決定的事：與既有 lore 或設定筆記矛盾處逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內 `npm run check` 末行含 `OK 0 errors`。
2. 6 個新 frame 存在、檔名＝id name 段、每台 `defaultLoadout` 非空；新部件類檔 ≤3。
3. `naming.json`、`review-rows.json` 各有與新檔數相同的列數，`白話` 每列 ≤60 字。
4. `playtest.json` 至少 2 場。
5. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西；`npm test` 由領導驗收時跑。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-mf-01`。本線團隊：`teams/mech`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-mf-01 --up DONE 'mf-01 新增 6 台 frame，check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-mech/mf-01/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

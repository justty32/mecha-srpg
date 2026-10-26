# 任務：把 plan-epic v2／v3 已裁示的改讀落到 history-lines 八篇敘述、三張 history json 與 specs/world 的衝突句

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再讀 `wf/workflows/common/user.md`、`wf/workflows/planning.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/common/data-files.md`——**親自讀，不靠本交接書的摘要**。依據（逐條讀含文末裁示）：`wf/workflows/dispatch/handoffs/plan-epic/REPORT.md`、`REPORT-v2.md`、`v3.md`。材料：`wf/workflows/planning/design-notes/world/history-lines.md` 與它連到的八篇、`history-nodes.json`、`history-lines.json`、`history-timeline.json`。

## 背景與唯一目標

使用者 2026-10-26 對 plan-epic 三輪規劃裁示（v3 七題一律照建議；v2 第 3、4、6、7、8 題 OK）。領導 lead-epic-land 自己寫新設定分檔（`before-collapse.md` 等）與 `history-lines.md` 框架；本線唯一目標：把**既有**主線敘述與資料檔裡和裁示衝突的句子逐處改讀，讓主線材料與新裁示一致。

## 方法與禁忌（每條都適用）

- 節點優先、不暴力產 lore：**只改衝突處**；每處用「改寫該句」優先、「補一個子句」其次，不新增段落、不新增人名、事件、專名。
- 不拿其他作品類比。中文命名避免直譯（古代機本體叫古代機、外層叫裝甲；潮→蝕）。
- 國家、塞勒涅、巨頭只削弱不萬能。已裁示的不推翻（「答案只定形狀：先民怎麼把門的另一端推上月亮」是已定的 A 線答案形狀，**保留**；收回的只是下面列的幾處細節）。
- 改讀標記：裁示採用的讀法標「（已定：2026-10-26）」；新名詞（空城、穹頂下的錢）標「（提案名）」。

## 範圍（排除法寫死）

可寫路徑（只有這些）：
- `wf/workflows/planning/design-notes/world/history-lines/` 底下八篇 `.md`
- `wf/workflows/planning/design-notes/world/history-nodes.json`、`history-lines.json`、`history-timeline.json`（只改需要改的列的文字欄，用 `python3 wf/tools/tabledb.py` 或小腳本改，不整份重排）
- `wf/workflows/planning/design-notes/tide-sky/lore.md`、`wf/workflows/planning/design-notes/tide-sky/glossary.json`（只改 N10 影像與夸父推月兩類句子，若有）
- `wf/workflows/planning/specs/world/README.md`、`setting.md`、`ruins-and-ancient.md`（只改下面點名的句子）

不做：`history-lines.md`、`world.md`、`great-tide.md`、`scale.md`、任何新檔（領導在寫，碰了會互蓋）；`history-reconcile.json`、`history-orphans.json`（歷史紀錄）；`content/`、`src/`、`specs/core`；埃吉爾認主事件、歐傘填充、A2／A4／A5／A6／A7／B2／B4 等未裁示項。
件數 gate：改動檔超過 17 個就停下回報；容量 gate：任何 md 檔改後超過 8192 bytes 就停（先在同檔內精簡你自己加的字，不刪原意）。

## 改讀清單（逐處找、逐處改）

1. **國家縮而不死（v3 第 2 節）**：國家失去沿海、過半稅基、「一夜之內到」、軌道與武力獨佔；保住法理與登記簿、科研工業、徵召、貨幣。傘＝國家之上的大潮分配層；城邦＝國家之內實際守得住的單位。逐處：G 線「國家機器斷掉後另組聯盟」→「縮小的國家共組」；「傘＝國家的鬼魂」類 →「國家之上的分配層」；北美「殘存聯邦改制、唯一仍自稱國家」→ 美國沒縮多少，北美傘是美國把加拿大、墨西哥諸城納入調度的名字，唯一拒用「傘」字、以國家名義調度，「舊旗」是別人叫的；「沒有誕生日只有縮小的日子」→「改名的日子」；2090 巴西「遷走後解體」→「放棄沿海、退守內陸高原」；江口夜 →「最後一道徵召全國的詔令」（中傘就是朝廷，之後詔令只及於守得到的省）；殘聯 → 南亞是最接近國家真的死了的地方，所以殘聯是**例外**不是通則；「碎國」期名保留，出現釋義處改為「國家碎成守得住的塊」。N06「到場的是各區代表」**不改**。節點 json 可在 N03／N06／N08／N09 各補至多一子句：私有化＝國家把「一夜到」外包；各國代表畫線＝國家集體承認到不了海岸；殘聯例外；軍售在國與國之間。
2. **塞勒涅 B「管家」（v3 第 3 節 B）**：公司本身中等，量級來自替「穹頂下的錢」（提案名：歐洲老家族、美國資本一半、韓國財閥，不點名）當管家。D 線「從運輸公司變成全球貸方」→「替穹頂下的錢當管家、成為最大的單一貸方窗口」；N09 信貸 → 富豪資本經公司放給各國與傘、公司是窗口；N04 封鎖可補「富人的牆」一子句；白手套、鐵偶出身可補「富豪私人保全」一子句。蔡明珠「不是壞人，是公司」與三層知情照舊。
3. **1.7 債改讀（v3 第 3 節末）**：死人的債與無人繼承的產權**歸國庫**；築牆期各國拿沿海空城地契向穹頂下的錢抵押借款——「月亮在收地球」從謠言變成地契上寫的事；**塞勒涅不買死人的債**；歸還黨的法理 →「國家把我家抵押給了月亮」。落在 D、F 線與 N09。
4. **中國君主立憲（v3 第 3.5 節）**：朝名年號不取、不寫佔位名；朝廷視夸父為天命象徵、守寢人拒絕朝廷（格爾木分家處一子句）；2107 中傘公開量產 B 級可讀成閱兵（一子句，可選）。
5. **前史收回（v2 第 3 節）**：A、F 線前史段「先民把門推向海、把答案埋進山」→ 只保留「蝕從海來、墟在高處」現象，不替先民寫意圖；夸父「追著太陽走、把裂縫推到月亮上」→ 守寢人抄本的傳聞；刑天「守到所有人都下去了」→「守到最後」；先民社會史（沒有工業、四族築巢）→「刻痕說得很少」；**N10 影像**「看見的人都知道那是先民把門推上月亮的那一幕」→「看見的人都知道那是一萬年前的事，沒有人說得出是哪一件」（八篇、nodes N10、lines json、timeline json、tide-sky 有此句處都改）。
6. **specs/world**：`README.md`「北美傘是殘存聯邦改制，唯一仍自稱國家」照第 1 條改；`setting.md`「國家名義上存在，實際只剩城邦、公司、教派與獵團」→ 縮而不死讀法（國家還在、退到內陸、握法理徵召與天花板；城邦與獵團握「一夜到」）；`ruins-and-ancient.md`「沒有工業，但走到了生物系機甲的終點」→ 收回社會史、保留一人一獸一層裝甲。
7. **埃吉爾**：若八篇或 json 寫「無人能認」，補「至今」；別的不動。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-epic-land/g.py '殘存聯邦|解體' 50`（regex 換成要找的詞）（在 repo 根跑） | 找衝突句（本機 grep 是 ugrep，長中文 regex 會爆，用這支） |
| `python3 wf/tools/tabledb.py` 或小 python 腳本 | 改 json 文字欄（保持原 contract 結構、`ensure_ascii=False`、縮排與原檔一致） |
| `bash wf/tools/wf-lint.sh --strict .` | 改完 0 違規（oversize＝0） |

## 資源與禁區

- **可寫程式碼線**（本線只寫設定文件）：只寫「範圍」列的路徑。**不 commit**（領導統一 commit）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不安裝依賴；不碰 `.gitignore`；不上網；子代理上限 0。
- **分清錯誤來源**：工具壞掉 → 停下回報；自己打錯指令 → 自己修。

## 工作

1. 讀「先讀」與依據。
2. 用 g.py 逐條清單找出命中句，逐處改。
3. 跑 wf-lint、`wc -c` 核每個 md ≤ 8192。
4. 回傳報告（見交付）。

## 交付

報告直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/notes-lines-report.md`（被擋就全文回傳）：四段（做了什麼／逐檔改了幾處＋每處「舊半句 → 新半句」／沒做到的／需要決定的事：新發現的矛盾），末尾「以後交接書該點名的工具」。回覆只要 5 行摘要＋報告路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的設定檔 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-lines/`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/design-notes/world/history-*.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/world/` 三檔 |
| 報告 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-epic-land/notes-lines-report.md` |

## 驗收（固定 4 條，一條不多，做完就停）

1. `bash wf/tools/wf-lint.sh --strict .` 末行 `TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`。
2. 範圍內檔案用 g.py 查 `殘存聯邦|唯一仍自稱國家|國家的鬼魂|國家機器斷|解體|先民把門推上月亮的那一幕|都下去了|把門推向海` 為 0 命中（引述舊說法的「改讀自」說明除外，報告列出）。
3. 三張 json 能被 `python3 -c "import json;json.load(open(...))"` 讀入。
4. 報告逐檔列改動處數。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就 `git restore` 該檔回到原樣，報告寫證據。
- **測不出來** → 保持現狀，報告寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`epic-notes`（Claude 子 agent，不走 inbox）。直接在回覆給 5 行摘要＋報告路徑；終局 STATUS 用 `DONE` / `BLOCKED` / `FAILED` 之一寫在摘要第一行。

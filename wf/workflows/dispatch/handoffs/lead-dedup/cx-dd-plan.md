# 任務：寫去重與矛盾統一的計畫表——逐條找證據、定處置（只寫計畫，不改 lore）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`content/lore/README.md`（含「可見度」）、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`（**全部裁定**）、七條填充線的 `REPORT.md`（`wf/workflows/dispatch/handoffs/` 下 `lead-fill`、`lead-aegir`、`lead-fill-am`、`lead-fill-af`、`lead-fill-ea`、`lead-fill-mech`、`lead-fill-kaiju`）、`wf/workflows/dispatch/handoffs/lead-epic-land/REPORT.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`polity.md`、`city-types.md`、`aegir.md`。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

七條填充線新增了約 160 個 lore 檔（清單：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/files.tsv`，欄：批次、模式、路徑），各線 REPORT 又列了一批舊檔矛盾。使用者要在審敘事基調前先去重、統一矛盾。本線唯一目標：產出一份**逐條可執行的計畫表**，下一個工人照表改檔。**你只寫計畫，不改任何 lore 檔。**

## 要找的三類

**A. 矛盾**（至少逐條處理下列 22 條，另發現的追加）：葛西蓮性別；老班「二十年軍醫」vs 殘翼 2093 才成立；候鳥號台數（四／三）與下次漲潮（三天／十一天）；第七哨約 2101 成立 vs 年表 2099 已有哨火型；浦那難民人數三說；老桂 2102 開堅盾-I 還是犁；長槍-V4 殘聯授權還是默許；法蒂瑪任公會長年份；綠線清剿後裂縫封了沒；**沐蝕會公開正文寫出迦梨藍本但 secrets 標 hidden（處置：正文刪去藍本句，真相只留 secrets）**；白夜菌床首燒（以年表 2100 為準）；老爹 2100 育成卻「十年沒變」；劍魚-V5 A 級還是 B 級試作；長槍公開圖紙年代早於規劃；長槍藍本＝銀環、刑天刻痕是後加授權（舊文改讀）；衍二・堅盾＝守牆機（舊文寫射擊突擊的改）；鹽鷗與鐵砧火併年份（年表 2105 vs 事件 2106）；第一張標單 2102 提到兩棲長槍但鹽鷗型 2104 才下線；伊爾瑟入鐵砧早於鐵砧成軍；雅庫茨克失守年份（取與年表最不衝突者）；維拉科查「不離安地斯」自 2102 商路約起（舊文 2101 跟車不動，只確認新檔沒寫成「從來不離」）；fill-rulings 其餘裁定（放閘夜改讀、金山夜進年表、北非／西亞傘約 2102 成傘、金山深井刪「偶有低階東西從墟裡出來」、釜山雙籤城、吉大港讀法、鹿特丹自由城市、埃吉爾 2106 押內海家族）是否已在 lore 落地。
判準：**一般以 `content/lore/timeline.json` 為準**；年表本身錯（與多數檔、設定筆記或裁定衝突）就改年表並說明；兩邊都說得通、年表沒寫的，處置填 `needs-user` 並用白話寫兩個選項。

**B. 重複**：新檔之間、新檔與既有 lore 之間——同一事件兩檔、同一人物兩個名字、同一地點兩檔、同一設定句在多檔反覆出現（例：「C 級精粹與量產件仍須外購」在 timeline 與 bulwark-*、hound-ii-license、longspear-v4-standard 等多檔重複）。查法：按 id、`name`、`aka`、日期、地名交叉比對；設定句用 grep 找重複片語。處置三選一：`收斂`（保留一處完整、其他處改短或刪句）、`合併`（兩檔講同一件事：指定主檔，副檔內容併入主檔，副檔改成指向主檔的短條目、所有引用改指主檔；副檔列入建議刪除）、`保留`（看似重複其實不同，寫理由）。

**C. 提案標記**：lore 與 `design-notes/world/`（只看 `aegir.md`、`city-types.md`、`polity.md`、`history-lines.md` 與七線新檔）中，已被 fill-rulings 或各 REPORT「使用者裁示」裁定的「提案」→ 改「已定（2026-10-26）」；提案名（唱名夜、天命詔、赴牆詔、空艙有名、眾肩擎城、守燈、成都行在、季克西、城約、補天院、還鄉院、地燧能源、新物種名等）**保持提案**、送審。逐處列出。

## 範圍（排除法寫死）

- 只寫三個檔：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/findings.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/delete-candidates.json`。
- 不做：任何 lore／base／design-notes／manifest／index／src 檔的修改；不 commit；不寫文筆潤飾建議（文筆不強求，只標禁忌：直譯腔、拿其他作品類比、設計層字眼如「節點」「底色句」「N03」出現在 lore 正文）。
- 件數 gate：findings 超過 120 列就停下回報；容量 gate：plan.md 超過 16 KB 或 findings.json 超過 200 KB 就停下回報。

## findings.json 格式

wf-table/1：`{"contract":"wf-table/1","source":"cx-dd-plan","extracted":"2026-10-26","columns":["序","類","主題","檔","證據","依據","處置","改法","目標"],"rows":[...]}`
- 類：`矛盾`／`重複`／`提案`／`禁忌`。
- 檔：涉及的檔（相對 repo 根，多個用「、」）；證據：原文摘句（各 ≤ 80 字，標出自哪檔哪欄）。
- 依據：年表條目（日期＋title）、裁定（fill-rulings 哪條）或設定筆記哪段。
- 處置：一句話，寫死改成什麼（例：「人物檔與事件檔統一為『她』」）。
- 改法：`text`（只改 summary／body／name／aka 等文字欄）／`array`（改 consequences 等陣列字串）／`struct`（加欄、改日期、改 secrets、改引用）／`timeline`（改 timeline.json 條目）／`merge`／`needs-user`／`keep`。
- 目標：要改的檔與欄（例：`content/lore/characters/x.json:body`）。

`delete-candidates.json`：wf-table/1，欄 `副檔`、`主檔`、`理由`；沒有就 `rows: []`。

## plan.md 必含

1. 已讀清單。 2. 掃描方法（怎麼找重複、怎麼比日期）。 3. 統計：三類各幾列、needs-user 幾列。 4. needs-user 各條白話兩選項。 5. 給下一個工人的分批建議（按改法分組，哪些檔會被多條改到）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 資料檔 grep 關鍵詞` | 查 timeline.json、review.json 等資料檔，不整份讀 |
| `grep -rn 關鍵詞 /home/lorkhan/repo/game_dev/mecha-srpg/content/lore` | 找人名、地名、年份、重複片語 |
| `node /home/lorkhan/repo/game_dev/mecha-srpg/content/lore/check.ts` | 唯讀確認現況 0 錯 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-dd-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫上列三個檔；其餘全部唯讀。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 4 個**，模型隨意（可按區域分：南亞東南亞／歐洲／美洲／非洲西亞／東亞、機甲＋怪獸），它們也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，只回傳列給你，不寫檔。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-dd-plan --up PROGRESS '已讀完先讀清單，開始掃描' < /dev/null`）。
2. 逐條查 A 類 22 條、掃 B、C、禁忌。
3. 寫三個檔並回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/plan.md` |
| 計畫表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/findings.json` |
| 刪除候選 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/delete-candidates.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 3 條，一條不多，做完就停）

1. plan.md 含「必含」1–5 段；findings.json 與 delete-candidates.json 是合法 wf-table/1 JSON。
2. A 類 22 條每條至少一列（處置非空、證據有出處）。
3. 每列「目標」指向存在的檔（needs-user／keep 可留空）。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-dd-plan`。本線團隊：`teams/dedup`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-dd-plan --up DONE '去重計畫完成：N 列，needs-user M' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-dedup/plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-dd-plan` 屬 `teams/dedup`）。

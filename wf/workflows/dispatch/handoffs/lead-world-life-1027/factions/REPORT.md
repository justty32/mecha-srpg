已讀清單（規矩與參照均親讀主工作樹最新版；連結供人查閱）：

- [AGENTS.md](../../../../../../AGENTS.md)
- [wf/SESSION-LOG.md](../../../../../SESSION-LOG.md)
- [wf/WAIT_USER.md](../../../../../WAIT_USER.md)
- [wf/WORKFLOWS.md](../../../../../WORKFLOWS.md)
- [wf/workflows/common/user.md](../../../../common/user.md)
- [wf/workflows/common/data-files.md](../../../../common/data-files.md)
- [wf/workflows/dispatch/handoffs/lead-world-life-1027/briefs/wl-factions-1027.md](../briefs/wl-factions-1027.md)
- [wf/workflows/content/README.md](../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../content/batch.md)
- [wf/workflows/content/world-pillars.md](../../../../content/world-pillars.md)
- [wf/workflows/content/world-pillars/world.md](../../../../content/world-pillars/world.md)
- [wf/workflows/content/world-pillars/world/tone-and-rules.md](../../../../content/world-pillars/world/tone-and-rules.md)
- [wf/workflows/content/world-pillars/world/factions-and-sandbox.md](../../../../content/world-pillars/world/factions-and-sandbox.md)
- [wf/workflows/content/world-pillars/world/monsters.md](../../../../content/world-pillars/world/monsters.md)
- [wf/workflows/content/world-pillars/mechs.md](../../../../content/world-pillars/mechs.md)
- [wf/workflows/content/world-pillars/mechs/bonds.md](../../../../content/world-pillars/mechs/bonds.md)
- [wf/workflows/content/world-pillars/mechs/ancient.md](../../../../content/world-pillars/mechs/ancient.md)
- [wf/workflows/content/world-pillars/mechs/mechanical.md](../../../../content/world-pillars/mechs/mechanical.md)
- [wf/workflows/content/world-pillars/bio-battle.md](../../../../content/world-pillars/bio-battle.md)
- [wf/workflows/content/world-pillars/bio-battle/bio.md](../../../../content/world-pillars/bio-battle/bio.md)
- [wf/workflows/content/world-pillars/bio-battle/battle.md](../../../../content/world-pillars/bio-battle/battle.md)
- [wf/workflows/content/lore-text.md](../../../../content/lore-text.md)
- [wf/workflows/content/mechs.md](../../../../content/mechs.md)
- [wf/workflows/content/ancient-people.md](../../../../content/ancient-people.md)
- [wf/workflows/content/bio-monsters.md](../../../../content/bio-monsters.md)
- [wf/workflows/content/numeric-bands.md](../../../../content/numeric-bands.md)
- [wf/workflows/content/abilities-effects.md](../../../../content/abilities-effects.md)
- [wf/workflows/content/battle-field.md](../../../../content/battle-field.md)
- [wf/workflows/content/ops-content.md](../../../../content/ops-content.md)
- [wf/workflows/content/polish.md](../../../../content/polish.md)
- [wf/workflows/content/playtest.md](../../../../content/playtest.md)
- [wf/workflows/content/acceptance-playtest.md](../../../../content/acceptance-playtest.md)
- [content/lore/README.md](../../../../../../content/lore/README.md)
- [content/lore/style.md](../../../../../../content/lore/style.md)
- [content/lore/style/people.md](../../../../../../content/lore/style/people.md)
- [wf/workflows/planning/design-notes/world/before-collapse-powers.md](../../../../planning/design-notes/world/before-collapse-powers.md)
- [wf/workflows/planning/design-notes/world/polity.md](../../../../planning/design-notes/world/polity.md)
- [wf/workflows/planning/specs/world/factions/hunters-and-structure.md](../../../../planning/specs/world/factions/hunters-and-structure.md)
- [content/lore/factions/third-blade.json](../../../../../../content/lore/factions/third-blade.json)
- [content/lore/factions/inner-sea-houses.json](../../../../../../content/lore/factions/inner-sea-houses.json)
- [content/lore/factions/anvil.json](../../../../../../content/lore/factions/anvil.json)
- [content/lore/factions/busan.json](../../../../../../content/lore/factions/busan.json)
- [content/lore/factions/korea-umbrella.json](../../../../../../content/lore/factions/korea-umbrella.json)
- [content/lore/factions/quito.json](../../../../../../content/lore/factions/quito.json)
- [content/lore/factions/latam-umbrella.json](../../../../../../content/lore/factions/latam-umbrella.json)
- [content/lore/factions/shell-society.json](../../../../../../content/lore/factions/shell-society.json)
- [content/lore/factions/euro-umbrella.json](../../../../../../content/lore/factions/euro-umbrella.json)
- [content/lore/places/busan.json](../../../../../../content/lore/places/busan.json)
- [content/lore/places/gyeongju-tombs.json](../../../../../../content/lore/places/gyeongju-tombs.json)
- [content/lore/places/quito.json](../../../../../../content/lore/places/quito.json)
- [content/lore/places/titicaca-ruin.json](../../../../../../content/lore/places/titicaca-ruin.json)
- [content/lore/places/alpine-shell.json](../../../../../../content/lore/places/alpine-shell.json)
- [content/lore/places/genoa-yards.json](../../../../../../content/lore/places/genoa-yards.json)
- [content/batches/2026-10/wl-factions-1027.json](../../../../../../content/batches/2026-10/wl-factions-1027.json)

資料表透過主樹 `wf/tools/tabledb.py` 的 Python load 查詢：`../lore-plan.json` 僅取 `category=factions` 六列；修訂為「2026-10-27 冷硬底色修訂：人物非全員和解、事件保留背約傷損、組織各有生計衝突」。`wf/workflows/content/templates.json` 只查 lore／faction 相關列。

## 做了什麼

完成餘拍獵團、留碗會、斜陽索獵團、蘆結種籽社、雪匙引路社、破幕班六個完整概念，正文各自呈現行動、收入與爭執。餘拍為退票和修機欠款爭權，留碗住戶因欠費分灶，斜陽索為撤離和搜索欠款爭領隊，種籽社為整地勞務與私下換種爭袋，雪匙因搶客扣繩再爭價，破幕班因瞞收刪戲款爭換領唱。結尾都停在爭執或動作，沒有集體和解。

依既有 lore 契約落欄，未照搬計畫內的規劃註語：`founded` 寫「不明」，`scale`、`hq` 改成地方規模與落腳處的敘述；省去不是既有欄位的 `umbrella_context`、`culture_livelihood_conflict`，內容融入正文、傘關係留在 relations。沒有新增人口／機數、藍本古代機、研發線、base 勢力或跨批引用。範本的四章結構、古代機與研發欄未套給地方組織，依最新版六列邊界與 lore 小勢力契約處理。

## 產出

六個 JSON 僅在指定隔離 worktree 的 `content/lore/factions/wl-*.json`，主樹只寫本 REPORT 與 [review.json](review.json)。逐件目標檔、名稱、白話與既有掛接見 review（wf-table/1，透過 tabledb 寫入）。「檔」欄以 gitRoot 指向實際隔離 worktree，不誤指尚未帶回的主樹內容。新增前已搜尋主樹與隔離 worktree 的六個名稱及 id，沒有命中；兩份指定範本與所有既有掛接原文已讀。

固定三項格式檢查證據（2026-10-27）：

1. Python 標準庫檢查 exit 0：六個概念、六個新內容檔，計畫配套檔與實際新增集合完全相符；JSON 可解析、id 與檔名相符，必填欄、既有引用及地方類型成立。正文依計畫順序為 388／391／395／400／388／392 個中文字（含標點總字元 435／443／439／448／435／443），均在 300–600 中文字內。正文與簡介無「開局／開場／本作」及本次掃描的技術禁用詞。各內容檔 2238–2438 bytes；內容與報告合計低於 1MB，新增六檔低於二十檔。
2. 從主工作樹執行指定主樹工具、絕對 worktree 與 manifest：`python3 -I /mnt/c/code/mine/mecha-srpg/wf/tools/content_gate.py /mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-factions-1027 /mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wl-factions-1027.json`，exit 0，原輸出 `OK batch=wl-factions-1027 mode=add approved=6 violations=0`。自己的隔離 worktree `git diff --check` exit 0、stdout 空；此命令本身不檢查尚未追蹤的新檔。新增 JSON 由第 1 項標準庫檢查覆蓋。
3. REPORT 與 review 的交付檢查：以 Python 標準庫解析 review，tabledb load 讀回恰六列，每列「檔／類別／名稱／白話／掛到」完整，白話非空且不超六十字，目標指向指定 worktree 的真實檔案。REPORT 開頭具 manifest mustRead 五份路徑、四段交付內容及「整合與平衡未驗」說明；固定第 3 項實測 exit 0、`result=PASS`、`mustRead=5`、`review_rows=6`，依計畫順序白話長度 34／35／36／34／32／36 字。

## 未做與證據不足

整合與平衡未驗；未做整合驗收、正式 lore checker、遊戲載入、戰鬥試玩或平衡調整。本輪僅執行 brief 固定三項格式檢查；未跑 npm、sim、MCP、測試或額外驗證，未安裝、上網、派 agent、commit／push。未帶回主樹、未改索引或唯讀 manifest，沒有宣稱整批 accepted。新檔的文字與關係仍待領導去重及使用者審閱；格式通過不代表已接入遊戲。

工具備註：直接以隔離模式執行 tabledb CLI 時，Python 找不到同目錄的 `tabledb_fmt`；已採工具文件規定的 Python load API，顯式載入主樹工具路徑，沒有修改工具或安裝依賴。

## 需要決定

沒有需要先裁決才能完成這六份內容的機制缺口。請領導與使用者依 review 審閱地方組織的敘事基調；回家後再依授權安排整合驗收與平衡檢查。此次不申請擴範圍。

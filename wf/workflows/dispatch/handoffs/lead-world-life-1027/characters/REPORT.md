已讀清單（規矩與資料均讀主工作樹；未採隔離區舊角色配置）：

- [AGENTS.md](../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../common/user.md)
- [wf/workflows/content/README.md](../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../content/batch.md)
- [content/lore/style.md](../../../../../../content/lore/style.md)
- [本線 brief](../briefs/wl-characters-1027.md)
- [SESSION-LOG](../../../../../SESSION-LOG.md)
- [WAIT_USER](../../../../../WAIT_USER.md)
- [WORKFLOWS](../../../../../WORKFLOWS.md)
- [資料檔契約](../../../../common/data-files.md)
- [lore 契約](../../../../../../content/lore/README.md)
- [人物風格](../../../../../../content/lore/style/people.md)
- [世界支柱入口](../../../../content/world-pillars.md)
- [世界支柱導航](../../../../content/world-pillars/world.md)
- [機甲支柱導航](../../../../content/world-pillars/mechs.md)
- [生物與戰鬥支柱導航](../../../../content/world-pillars/bio-battle.md)
- [基調與鐵律](../../../../content/world-pillars/world/tone-and-rules.md)
- [勢力與沙盒](../../../../content/world-pillars/world/factions-and-sandbox.md)
- [怪獸與天象](../../../../content/world-pillars/world/monsters.md)
- [人機關係](../../../../content/world-pillars/mechs/bonds.md)
- [古代機支柱](../../../../content/world-pillars/mechs/ancient.md)
- [機械系支柱](../../../../content/world-pillars/mechs/mechanical.md)
- [生物系支柱](../../../../content/world-pillars/bio-battle/bio.md)
- [戰鬥支柱](../../../../content/world-pillars/bio-battle/battle.md)
- [人物與機魂原則](../../../../content/ancient-people.md)
- [lore 文本原則](../../../../content/lore-text.md)
- [機械系原則](../../../../content/mechs.md)
- [怪獸原則](../../../../content/bio-monsters.md)
- [戰場原則](../../../../content/battle-field.md)
- [能力原則](../../../../content/abilities-effects.md)
- [營運內容原則](../../../../content/ops-content.md)
- [數值帶入口](../../../../content/numeric-bands.md)
- [潤飾原則](../../../../content/polish.md)
- [試玩流程](../../../../content/playtest.md)
- [驗收流程](../../../../content/acceptance-playtest.md)
- [國家與家族裁示](../../../../planning/design-notes/world/before-collapse-powers.md)
- [韓寶羅範本](../../../../../../content/lore/characters/han-bora.json)
- [釜山地點](../../../../../../content/lore/places/busan.json)
- [慶州古陵](../../../../../../content/lore/places/gyeongju-tombs.json)
- [基多地點](../../../../../../content/lore/places/quito.json)
- [的的喀喀湖畔](../../../../../../content/lore/places/titicaca-ruin.json)
- [阿爾卑斯地點](../../../../../../content/lore/places/alpine-shell.json)
- [熱那亞地點](../../../../../../content/lore/places/genoa-yards.json)
- [釜山勢力](../../../../../../content/lore/factions/busan.json)
- [基多勢力](../../../../../../content/lore/factions/quito.json)
- [內海諸家](../../../../../../content/lore/factions/inner-sea-houses.json)
- [本批 manifest（唯讀）](../../../../../../content/batches/2026-10/wl-characters-1027.json)

資料表以 tabledb.load 查詢：lore-plan.json 僅取 category=characters 最新六列（索引 0–5），templates.json 僅取相關範本列。

## 做了什麼

依六列計畫新增六個完整人物概念，各一個 JSON，共六件內容檔；沒有配套檔需求。正文按韓寶羅的既有欄位契約撰寫，出生年、身分與勢力沿用計畫；relations、events、gameRefs 留空。每篇以具體行動起筆與收尾，正文沒有「開局／本作」等出戲用語。

崔恩率收好票款自行上臺，朴度允扣球後照舊修草，尼科以合自己手勢的新環再押酒錢，三人的自利衝突均未和解。阿瑪莉亞重學手藝仍管束兒子；馬特奧改課圖仍糾正字跡；瑪爾塔撤回危險捷徑仍索取應得工錢與扛物服務。沒有把六篇寫成同一套悔悟結局。

## 產出

內容在指定隔離 [worktree 人物目錄](../../../../../../.git/wf-worktrees/wl-characters-1027/content/lore/characters/)：wl-choi-eunsol.json、wl-park-doyun.json、wl-amalia-quispe.json、wl-mateo-yupanqui.json、wl-marta-riedler.json、wl-nico-bellini.json。逐件名稱、白話與既有掛接見 [review.json](review.json)；review 透過 tabledb.add／save 寫成 wf-table/1，共六列。

固定檢查 1：Python 標準庫逐件解析 JSON，確認六個計畫檔存在、id 與檔名一致、必填欄位及計畫值相符；六件新增檔未超 20 件。依上述檔名順序，正文中文字數為 364、373、399、374、398、380，均在計畫的 300–600 字內。每檔小於 16 KB，內容與兩份報告合計小於 32 KB，未超 1 MB。正文的地點與 faction 引用恰為各列 existing_refs，且在主樹及隔離區都存在，無跨批引用。新增姓名與 id 在寫入前查主樹 lore 與 base/persons 無命中。

固定檢查 2：由主樹執行 `python3 -I /mnt/c/code/mine/mecha-srpg/wf/tools/content_gate.py /mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-characters-1027 /mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wl-characters-1027.json`，exit 0，輸出 `OK batch=wl-characters-1027 mode=add approved=6 violations=0`。自己的 worktree 執行 `git diff --check`，exit 0、無輸出。新內容的行尾空白與末尾換行另納入標準庫格式核對。

固定檢查 3：REPORT 與 review 存在；review 恰六列，每列白話非空且不超 60 字；REPORT 開頭逐行列出 mustRead 五份路徑。

## 未做與證據不足

整合與平衡未驗；整合驗收、平衡試玩及正式收線依使用者要求留到回家。本輪只做 brief 固定三項內容與格式檢查，未執行 npm、lore 全庫檢查、安裝、測試、sim、MCP、黃金重錄、commit 或 push，也未再派子 agent。路徑閘門通過不代表整批 accepted。

主樹 content、src、schema、spec、索引、manifest 及其他線報告均未寫入。本線僅寫指定 worktree 的六個新 JSON 與主樹本類 REPORT／review；已存在檔未覆蓋。

## 需要決定

無新增世界規則、引擎缺口或計畫與契約矛盾需裁決。朴仁哲失腿的既有未決事項未觸及，崔恩率的學員是匿名背景人物。敘事基調與正式整合驗收仍待主線及使用者後續審閱。

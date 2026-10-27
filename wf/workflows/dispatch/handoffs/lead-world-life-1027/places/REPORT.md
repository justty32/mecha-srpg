已讀清單（以下均親讀主工作樹版本；連結供主線回查）：

- [AGENTS.md](../../../../../../AGENTS.md)
- [WORKFLOWS.md](../../../../../WORKFLOWS.md)
- [SESSION-LOG.md](../../../../../SESSION-LOG.md)
- [WAIT_USER.md](../../../../../WAIT_USER.md)
- [wf/workflows/common/user.md](../../../../common/user.md)
- [data-files.md](../../../../common/data-files.md)
- [wf/workflows/content/README.md](../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../content/batch.md)
- [world-pillars.md](../../../../content/world-pillars.md)
- [world.md](../../../../content/world-pillars/world.md)
- [tone-and-rules.md](../../../../content/world-pillars/world/tone-and-rules.md)
- [factions-and-sandbox.md](../../../../content/world-pillars/world/factions-and-sandbox.md)
- [monsters.md](../../../../content/world-pillars/world/monsters.md)
- [mechs.md](../../../../content/world-pillars/mechs.md)
- [bonds.md](../../../../content/world-pillars/mechs/bonds.md)
- [ancient.md](../../../../content/world-pillars/mechs/ancient.md)
- [mechanical.md](../../../../content/world-pillars/mechs/mechanical.md)
- [bio-battle.md](../../../../content/world-pillars/bio-battle.md)
- [bio.md](../../../../content/world-pillars/bio-battle/bio.md)
- [battle.md](../../../../content/world-pillars/bio-battle/battle.md)
- [lore-text.md](../../../../content/lore-text.md)
- [mechs.md](../../../../content/mechs.md)
- [bio-monsters.md](../../../../content/bio-monsters.md)
- [ancient-people.md](../../../../content/ancient-people.md)
- [abilities-effects.md](../../../../content/abilities-effects.md)
- [battle-field.md](../../../../content/battle-field.md)
- [ops-content.md](../../../../content/ops-content.md)
- [numeric-bands.md](../../../../content/numeric-bands.md)
- [acceptance-playtest.md](../../../../content/acceptance-playtest.md)
- [playtest.md](../../../../content/playtest.md)
- [polish.md](../../../../content/polish.md)
- [README.md](../../../../../../content/lore/README.md)
- [content/lore/style.md](../../../../../../content/lore/style.md)
- [people.md](../../../../../../content/lore/style/people.md)
- [wl-places-1027.md](../../wl-places-1027.md)
- [wl-places-1027.json](../../../../../../content/batches/2026-10/wl-places-1027.json)
- [before-collapse-powers.md](../../../../planning/design-notes/world/before-collapse-powers.md)
- [ruins-and-ancient.md](../../../../planning/specs/world/ruins-and-ancient.md)
- [busan.json](../../../../../../content/lore/places/busan.json)
- [gyeongju-tombs.json](../../../../../../content/lore/places/gyeongju-tombs.json)
- [quito.json](../../../../../../content/lore/places/quito.json)
- [titicaca-ruin.json](../../../../../../content/lore/places/titicaca-ruin.json)
- [alpine-shell.json](../../../../../../content/lore/places/alpine-shell.json)
- [genoa-yards.json](../../../../../../content/lore/places/genoa-yards.json)
- [titicaca-empty-dawn.json](../../../../../../content/lore/places/titicaca-empty-dawn.json)
- [han-bora.json](../../../../../../content/lore/characters/han-bora.json)
- [busan.json](../../../../../../content/lore/factions/busan.json)
- [third-blade.json](../../../../../../content/lore/factions/third-blade.json)
- [quito.json](../../../../../../content/lore/factions/quito.json)
- [inner-sea-houses.json](../../../../../../content/lore/factions/inner-sea-houses.json)
- [shell-society.json](../../../../../../content/lore/factions/shell-society.json)

資料表已讀：[plan.json](../plan.json) 僅經主樹 `wf/tools/tabledb.py` 的 `load(...).find(category='places')` 取得六列；[templates.json](../../../../content/templates.json) 查到 lore 原則與範本指向。工具讀過主樹 `wf/tools/tabledb.py`、`wf/tools/tabledb_table.py` 與 `wf/tools/content_gate.py` 的用法／相關實作。

## 做了什麼

依 places 六列完成六篇地點，保留各自衝突與具體動作。借袖院拆租衣隊色、紙面坡重畫缺牙、烤穗臺修架後離攤、新紋屋接上洗衣母親、共爐房挪靴留座、牽線小戲棚由工頭配音。各篇另交代位置、氣味、居民與開場日常；只引用既有資料，無本批新依賴。

## 產出

六個新 JSON 位於 `.git/wf-worktrees/wl-places-1027/content/lore/places/`，精確檔名、白話與掛接見 [review.json](review.json)。均為 `world=earth`、`kind=其他`、`gameRefs=[]`；未另建配套。

第 1 條：Python 標準庫解析六檔、比對計畫與 id／檔名，新增檔恰六件、無缺配套；正文逐篇中文字數依計畫順序為 588／551／571／560／553／606，皆在 300–1500；內容合計 15156 bytes，每檔小於 16 KB。

第 2 條：由主工作樹執行交接指定的 `python3 -I /mnt/c/code/mine/mecha-srpg/wf/tools/content_gate.py /mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-places-1027 /mnt/c/code/mine/mecha-srpg/content/batches/2026-10/wl-places-1027.json`，exit 0，輸出 `OK batch=wl-places-1027 mode=add approved=6 violations=0`。自己的 worktree 執行 `git diff --check`，exit 0、無輸出；新檔亦於第 1 條讀回檢查行尾空白。

第 3 條：交付本 REPORT 與 wf-table/1 的 review；末次 Python 讀回核對六列、白話非空且不超過 60 字、mustRead 五份路徑及延期說明，並確認內容與報告合計低於 1 MB。

## 未做與證據不足

整合驗收未做，平衡未驗；依使用者與本線 brief 延至回家。不安裝、不跑測試／sim／MCP／content_accept／lore check，不做整合或帶回主樹；不 commit／push、不改舊檔、不再派。主線仍須檢查引用與格式後決定帶回；本線結果只代表上述三條局部檢查，不宣稱整批 accepted。

## 需要決定

未發現 places 計畫與既有契約相衝，無需新增機制或世界規律。六篇均未替古代機或民俗增加功效，也未改地權、入墟資格、招募制度或勞資制度。待主線審閱敘事與引用；本線沒有新增待使用者裁決事項。

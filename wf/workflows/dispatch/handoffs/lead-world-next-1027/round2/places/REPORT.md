已讀清單（本人親讀主樹最新版；資料表僅定向讀適用列）

`AGENTS.md`
`wf/SESSION-LOG.md`
`wf/WAIT_USER.md`
`wf/WORKFLOWS.md`
`wf/workflows/common/user.md`
`wf/workflows/common/data-files.md`
`wf/workflows/team-model.md`
`wf/workflows/dispatch/README.md`
`wf/workflows/dispatch/content-batch.md`
`wf/workflows/dispatch/handoffs/wn-r2-places-1027.md`
`wf/workflows/content/README.md`
`wf/workflows/content/batch.md`
`wf/workflows/content/world-pillars.md`
`wf/workflows/content/world-pillars/world.md`
`wf/workflows/content/world-pillars/world/tone-and-rules.md`
`wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
`wf/workflows/content/world-pillars/world/monsters.md`
`wf/workflows/content/world-pillars/mechs.md`
`wf/workflows/content/world-pillars/mechs/bonds.md`
`wf/workflows/content/mechs.md`
`wf/workflows/content/bio-monsters.md`
`wf/workflows/content/ancient-people.md`
`wf/workflows/content/abilities-effects.md`
`wf/workflows/content/battle-field.md`
`wf/workflows/content/ops-content.md`
`wf/workflows/content/lore-text.md`
`wf/workflows/content/numeric-bands.md`
`wf/workflows/content/polish.md`
`wf/workflows/content/playtest.md`
`wf/workflows/content/acceptance-playtest.md`
`content/lore/README.md`
`content/lore/style.md`
`content/lore/style/people.md`
`content/lore/places/auckland.json`
`content/lore/places/tranquility-city.json`
`content/lore/places/accra.json`
`content/lore/places/mombasa.json`
`content/lore/places/sydney.json`
`content/lore/places/wl-alpine-common-hearth.json`
`content/lore/places/earthward-gallery.json`
`content/lore/factions/wl-afterbeat-hunters.json`
`content/lore/characters/silas-mercer.json`
`content/lore/characters/shen-yanqiao.json`
`content/lore/places/surat-key-court.json`
`content/lore/places/salt-flat.json`
`content/lore/places/wl-busan-sleeve-court.json`

定向閱讀：`wf/workflows/content/templates.json` 的 lore 範本列；`wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan.json` 的六筆 places／adopt；`wf/workflows/dispatch/handoffs/lead-world-next-1027/round2-plan-review.json` 的六筆 places 與 requiredConstraints。另親讀唯讀 manifest：`content/batches/2026-10/wn-r2-places-1027.json`。

## 已做

依已核准計畫完成六個 places 概念與完整正文，候選全文閱讀後再創作，交稿時逐篇重對行動、衝突、場景功能。最相似內容與閱讀雜湊在 [review.json](review.json)；wl-* 只供查重，正文引用皆在 HEAD。子 agent 為 0，原生回傳。

霧瓷浴堂採新版伴侶擦背見舊傷、返役回條落出、親口念日期；人物匿名且皆成人，普通舊傷，未寫醫療技術、代簽辭職、占位移物或平等規矩。末尾兩人仍未談妥。棋廊保留各自政治立場與攤商招徠利益；墓圃保留敵我旗色與葬禮定義的衝突；遊場保留父親描舊地名與孩子玩此地生活的不同選擇。

試灘的高潮是修工、隨船技師與機師共同交換普通武具及通用衍型機找出錯配，沒有人因說謊被揭穿，驗收後費用未談妥。聽庭用折帆與站位讓證詞具體化，但承認倒拖仍無法確定喊話先後，單方拒簽，調解不成回既有港務；沒有複製試灘取得唯一答案的功能。

## 產出

隔離區：`/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wn-r2-places-1027/content/lore/places/`。六個新 JSON 精確對應核准 targetFiles，沒有配套新檔；各正文含 545–598 個中文字，每檔小於 16 KB。白話介紹、逐篇差異及全文閱讀來源見 [review.json](review.json)（恰六列，白話最長 38 字）；英文原名、意涵與中文命名理由見 [naming.json](naming.json)（恰六列，英文均保存在正文 aka）。

固定三條有限驗收證據：

1. Python 解析六檔 JSON，核對 id 與檔名、精確 targetFiles、中文字長、必用引用只在 HEAD 或本批、六列 review／naming 與英文 aka；全部通過。worktree 沒有改動既有 tracked 檔，untracked 僅本批六檔；未超 20 檔與 1 MB 容量 gate。
2. 主樹 `content_gate.py` 對本 worktree 與唯讀 manifest 回傳 0：`OK batch=wn-r2-places-1027 mode=add approved=6 violations=0`。本 worktree `git diff --check` 回傳 0、無輸出。
3. 本 REPORT 開頭逐行列已讀路徑，包含 manifest 的五個 mustRead；review 恰六列、白話皆不超過 60 字，每列均有最近既有 ID／檔名、閱讀雜湊與實質差異；naming 保留六個英文原名及意涵。

## 未做與不足

未完整驗收，不標為 accepted。依交接與使用者邊界，未跑 node、npm、lore check、typecheck、test、build、sim、probe、MCP 或試玩；整合驗收與平衡留家中，由領導接續。未擴研究、未新增事件或年表，也未動主樹 content、manifest、index、SESSION、CLAIMS、引擎或 schema。未 commit／push／刪檔，未派子 agent、未發 inbox。

## 需決定

無新增機制矛盾需裁決。六篇目前為隔離區內容候選，仍待領導收件、正式去重與頂層／使用者審敘事基調，再決定整合。

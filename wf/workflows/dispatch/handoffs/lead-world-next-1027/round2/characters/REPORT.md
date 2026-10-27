已讀清單（親讀主樹最新版；以下為導航，個別比對全文另見 review）：

- [AGENTS.md](../../../../../../../AGENTS.md)
- [WORKFLOWS.md](../../../../../../WORKFLOWS.md)
- [wf/workflows/common/user.md](../../../../../common/user.md)
- [data-files.md](../../../../../common/data-files.md)
- [team-model.md](../../../../../team-model.md)
- [dispatch/README.md](../../../../README.md)
- [content-batch.md](../../../../content-batch.md)
- [wn-r2-characters-1027.md](../../../wn-r2-characters-1027.md)
- [wf/workflows/content/README.md](../../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../../content/batch.md)
- [world-pillars.md](../../../../../content/world-pillars.md)
- [world-pillars/world.md](../../../../../content/world-pillars/world.md)
- [tone-and-rules.md](../../../../../content/world-pillars/world/tone-and-rules.md)
- [factions-and-sandbox.md](../../../../../content/world-pillars/world/factions-and-sandbox.md)
- [monsters.md](../../../../../content/world-pillars/world/monsters.md)
- [world-pillars/mechs.md](../../../../../content/world-pillars/mechs.md)
- [mechs/bonds.md](../../../../../content/world-pillars/mechs/bonds.md)
- [bio-battle.md](../../../../../content/world-pillars/bio-battle.md)
- [content/mechs.md](../../../../../content/mechs.md)
- [bio-monsters.md](../../../../../content/bio-monsters.md)
- [ancient-people.md](../../../../../content/ancient-people.md)
- [abilities-effects.md](../../../../../content/abilities-effects.md)
- [battle-field.md](../../../../../content/battle-field.md)
- [ops-content.md](../../../../../content/ops-content.md)
- [lore-text.md](../../../../../content/lore-text.md)
- [numeric-bands.md](../../../../../content/numeric-bands.md)
- [polish.md](../../../../../content/polish.md)
- [playtest.md](../../../../../content/playtest.md)
- [acceptance-playtest.md](../../../../../content/acceptance-playtest.md)
- [lore/README.md](../../../../../../../content/lore/README.md)
- [content/lore/style.md](../../../../../../../content/lore/style.md)
- [people.md](../../../../../../../content/lore/style/people.md)
- [ren-kasai.json](../../../../../../../content/lore/characters/ren-kasai.json)

資料表皆經 tabledb 定向讀取，沒有全表 dump：核准計畫 characters/adopt 六列、領導審核 characters 六列、templates 人物與 lore 列、engine-facts 相關列、numeric-bands 人物列。另親讀 manifest；最相似候選共十四份完整 JSON（含崔恩率、借袖院）及相關地點勢力上下文，逐篇全文指紋與證據見 [review.json](review.json)。

## 已做

DONE：六個核准姓名／職業均已產出完整正文。優先套用領導 requiredConstraints，再依主線原生新裁示修正文。唐婉綾、林藏序、札瓦迪、瑪伊雅共四人改換起因與主要反應；review 保留各列 revisedConcept、rejectedAction 與授權來源，四件原主行動標記 reject。

札瓦迪原案與崔恩率的「以身體特徵攬客→抗議」重複，已退回；成稿為共同試裁、端碗測袖與衣樣獨用議價。其餘人物也保留各自利益與未決關係。未將婚宴、展覽、換俘、移樁寫成自動和解。

## 產出

正文位於指定隔離 worktree 的 content/lore/characters/wn-r2-*.json，精確等於計畫六個 targetFiles，無配套缺件。正文每篇 572–613 個中文字；六檔共 15,302 bytes，均少於 16 KB。白話及逐篇行動／衝突／用途比較見 [review.json](review.json)，英文原名、創作意涵與中文定名見 [naming.json](naming.json)。本線子代理 0。

固定驗收三條的有限證據：

1. Python 檢查 PASS：六份 JSON 可解析、檔名對應 id、必填欄存在；全部 17 個引用（含自身 id）僅指向 HEAD 或本批。worktree 狀態只有六份新增檔，舊檔改動 0，未新增事件或年表。件數 6，未超 20。
2. 主樹 content_gate.py 對指定 worktree 與唯讀 manifest 回傳 0：`OK batch=wn-r2-characters-1027 mode=add approved=6 violations=0`。該 worktree 的 `git diff --check` 回傳 0。
3. review 與 naming 各恰六列，白話逐列 ≤60 字；每列有全文來源、sha256、具體閱讀證據及實質差異。英文原名保留在各篇 aka。REPORT 開頭已列 manifest 五份 mustRead。交稿後另以主樹最新 lore（含未提交 wl-*）比對完整長句，無相同長句；禁用詞 0 命中。這不等於全庫語義去重完畢。

## 未做與不足

未完整驗收；整合、平衡與試玩留家中。依交接未跑 node、npm、測試、typecheck、build、sim、probe、MCP 或全庫 wf-lint。未帶回主樹、未修改 manifest／index／SESSION／CLAIMS、未提交或推送。主樹未提交 wl-* 僅作閱讀比對，不作正文引用。

六篇屬 lore，未做 base 人物、招募、營運事件接線。鄰里田權、船鐘歸屬、當年俘虜去向均刻意保留爭議，不替使用者或既有勢力定案。

## 需決定

無新增機制矛盾需要本線裁決。請領導同步登記主線已授權的四案情節修訂，並於收件後進行敘事基調與語義去重審閱；此批維持 draft，有限檢查不稱 accepted。

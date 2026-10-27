# wl-monsters-1027 REPORT

已讀清單（主樹最新版；資料表只查本類適用列）：

<!-- wf-nav -->
- [AGENTS.md](../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../common/user.md)
- [wf/workflows/content/README.md](../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../content/batch.md)
- [content/lore/style.md](../../../../../../content/lore/style.md)
- [wf/WORKFLOWS.md](../../../../../WORKFLOWS.md)
- [wf/SESSION-LOG.md](../../../../../SESSION-LOG.md)
- [wf/WAIT_USER.md](../../../../../WAIT_USER.md)
- [wf/workflows/common/data-files.md](../../../../common/data-files.md)
- [wf/workflows/dispatch/handoffs/lead-world-life-1027/briefs/wl-monsters-1027.md](../briefs/wl-monsters-1027.md)
- [content/lore/README.md](../../../../../../content/lore/README.md)
- [wf/workflows/content/abilities-effects.md](../../../../content/abilities-effects.md)
- [wf/workflows/content/acceptance-playtest.md](../../../../content/acceptance-playtest.md)
- [wf/workflows/content/ancient-people.md](../../../../content/ancient-people.md)
- [wf/workflows/content/battle-field.md](../../../../content/battle-field.md)
- [wf/workflows/content/bio-monsters.md](../../../../content/bio-monsters.md)
- [wf/workflows/content/lore-text.md](../../../../content/lore-text.md)
- [wf/workflows/content/mechs.md](../../../../content/mechs.md)
- [wf/workflows/content/numeric-bands.md](../../../../content/numeric-bands.md)
- [wf/workflows/content/ops-content.md](../../../../content/ops-content.md)
- [wf/workflows/content/playtest.md](../../../../content/playtest.md)
- [wf/workflows/content/polish.md](../../../../content/polish.md)
- [wf/workflows/content/world-pillars.md](../../../../content/world-pillars.md)
- [wf/workflows/content/world-pillars/bio-battle.md](../../../../content/world-pillars/bio-battle.md)
- [wf/workflows/content/world-pillars/bio-battle/battle.md](../../../../content/world-pillars/bio-battle/battle.md)
- [wf/workflows/content/world-pillars/bio-battle/bio.md](../../../../content/world-pillars/bio-battle/bio.md)
- [wf/workflows/content/world-pillars/mechs.md](../../../../content/world-pillars/mechs.md)
- [wf/workflows/content/world-pillars/mechs/ancient.md](../../../../content/world-pillars/mechs/ancient.md)
- [wf/workflows/content/world-pillars/mechs/bonds.md](../../../../content/world-pillars/mechs/bonds.md)
- [wf/workflows/content/world-pillars/mechs/mechanical.md](../../../../content/world-pillars/mechs/mechanical.md)
- [wf/workflows/content/world-pillars/world.md](../../../../content/world-pillars/world.md)
- [wf/workflows/content/world-pillars/world/factions-and-sandbox.md](../../../../content/world-pillars/world/factions-and-sandbox.md)
- [wf/workflows/content/world-pillars/world/monsters.md](../../../../content/world-pillars/world/monsters.md)
- [wf/workflows/content/world-pillars/world/tone-and-rules.md](../../../../content/world-pillars/world/tone-and-rules.md)
- [wf/workflows/content/templates.json](../../../../content/templates.json)
- [wf/workflows/content/engine-facts.json](../../../../content/engine-facts.json)
- [wf/workflows/content/numeric-bands.json](../../../../content/numeric-bands.json)
- [wf/workflows/planning/specs/core/content-format.md](../../../../planning/specs/core/content-format.md)
- [wf/workflows/planning/specs/core/data-model-world/monsters.md](../../../../planning/specs/core/data-model-world/monsters.md)
- [wf/workflows/planning/specs/core/data-model-mech.md](../../../../planning/specs/core/data-model-mech.md)

- [wf/workflows/dispatch/handoffs/lead-world-life-1027/combat-plan.json](../combat-plan.json)
- [content/batches/2026-10/wl-monsters-1027.json](../../../../../../content/batches/2026-10/wl-monsters-1027.json)

## 做了什麼

同時以 category=monsters、decision=approved 篩選 combat-plan.json，恰四列：折鐮、礫鬃、斜帷、鹽紗。另兩個遭否決的同數值目擊個體未實作。已逐檔讀各列範本與 sources；主樹 content/base 與 content/lore 的四個新名稱／ID 查無既有重名，自己的隔離 worktree 起始狀態為乾淨。

四種沿用既有骨架、同級屬性、池與 AI，各有不同能力組合，且 species.abilities 與兩份 frame.innateAbilities 一致。species 僅保留本級屬性列；monster 僅有 id、species、grade、tags。折鐮不繼承 spawned，礫鬃不繼承 molt。活體只有 instinct 池；屍改 pools 為空、burden=0，無活體意識。沒有新增引擎、能力、registry 或資料欄位。

## 產出

隔離 worktree 的 content/base/ 完成 4 species＋4 monsters＋8 活體／屍改 frames＝16 個新 JSON；精確路徑與既有掛接列於 [review.json](review.json) 的四列，每列含不超過 60 字白話與 300–1500 中文字的敘事。主線核對 SpeciesDef 後，將敘事寫入既有 etymology 欄供百科顯示；未新增 schema，也不宣稱其中場景已加入事件或遭遇表。

折鐮沿 insect-reaper（425 HP），使用「鐮肢劈斬／蝕露弔針」，替換原衝撞；活捕須 core 完整且 locomotion、manipulator 全毀。礫鬃沿 quadruped-hound（420 HP），使用「葬鏟叩門／翻顎噴沫」，沒有掘地、吞屍回血或蛻皮。斜帷沿 alien-mirror（950 HP），使用「異瞳凝視／赤祈撕界」，凝視降低感知與閃避，沒有讀心或幻象。鹽紗沿 mycel-stalk（450 HP），使用「地衣縛足／抖蘆落珠」，前者只降低 initiative，不是定身。

固定三條驗收證據：

1. Python 標準庫檢查回傳 0：計畫四組 16/16 檔存在、JSON 可解析、ID 與檔名相符；新增恰 16 檔，未超過 20。並核對配套、同級屬性／池、屍改無本能、鹽紗互斥條件與既有肉層無再生。內容合計 9,227 bytes。
2. 從主樹執行指定 content_gate.py 回傳 0：`OK batch=wl-monsters-1027 mode=add approved=16 violations=0`；自己隔離 worktree 的 `git diff --check` 回傳 0、無輸出。
3. REPORT／review 存在檢查回傳 0：review 恰四列，白話各非空且不超過 60 字；敘事各 300–1500 中文字，目標檔與掛接引用存在。REPORT 含 manifest.mustRead 五份路徑及未做整合驗收的說明；全部新內容與兩份報告合計小於 1 MB。


## 未做與證據不足

未安裝、未跑 npm／test／sim／MCP／content_accept，未做整合驗收、戰鬥試玩與平衡驗證。沒有 commit、push、改舊檔、子派或帶回主樹 content；manifest、索引、schema、spec 與既有骨架均未改。AI 是否依敘事先後出招、撤退與營運出現均未實測，也未新增相關規則。數值沿範本暫填；池的 hard cap 沿計畫指定範本，不擅改成守則概述中的 soft。

鹽紗 capture 要 core 同時 intact、broken，條件互斥，故不可捕。frame/wl-bio-salt-shroud 是必要配套佔位，保留 harvest-only；既有骨架有 cockpit 槽不代表能拘束或取得活體。鹽紗屍改只是資料配套，沒有新增採收或取得流程。mycel-stalk 三處 flesh 都無 regen；既有 chitin 的 regen 5／3／3 原樣沿用，不描述為肉層再生或殘留意識。

## 需要決定

本線無需新增機制或擴大授權。後續由主線在家裡安排整合、取得流程確認與平衡驗證；本次只交付資料與審閱稿，不標 accepted。鹽紗骨架的 chitin 再生若需另行裁決，交主線處理，本批不修改骨架。

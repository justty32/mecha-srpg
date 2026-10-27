已讀清單（均讀主工作樹最新版）：
- `AGENTS.md`
- `wf/workflows/dispatch/handoffs/wl-mechs-1027.md`
- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/dev-env.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/world-pillars/bio-battle/battle.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/world-pillars/mechs/ancient.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/mechs/mechanical.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/content/world-pillars/world/monsters.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/planning/specs/core/content-format.md`

## 做了什麼

依已審 combat-plan.json 的 category=mechs 六列完成六台機甲與同名型錄，限定本類 12 個 wl- 新檔。主樹只寫本 REPORT 與 review；不碰怪獸線、舊內容、manifest、索引或引擎。六台均維持 mechanical、repair-or-replace，同級勤務改型的 baseAttrs／pools 完整沿用指定範本，武器、內建能力、血統、型錄費用及登場月份照計畫。

計畫 defaultLoadout 採槽位覆寫，其餘範本裝甲、背部與系統全部保留。實讀主樹六份範本均未列 cockpit／soul-core；依使用者要求，在每台新機補既有 component/oa-cockpit-baffle 與 component/soul-core-std（皆 size 1），不修改範本。魂核部件不代表量產機魂或自動附送人物。逐槽依 bodyplan 核對槽型、尺寸、實際部位與 layersAdd 部位存在；每機結果收在 review 的配裝核對欄。

拾痕型沿範本保留 mx-relic-halo，承接其 protect-kin／bring-them-home、threshold 0.5 共鳴條件，未將古代部件寫成免費加強。遮星型只依計畫把 system-2 改成霜鰭排燼片，其他配套保留。守燈型保留凡火矢莢，凡兵不能殺獸的限制照原契約。

## 產出

內容根目錄：`/mnt/c/code/mine/mecha-srpg/.git/wf-worktrees/wl-mechs-1027`。完整逐件路徑、型錄、白話與掛接見 [review.json](review.json)，恰六列，每列一台機甲並帶型錄路徑。

六篇敘事寫入 frame 已支援的 etymology，另附 nameEn；每篇 300–1500 中文字，有具體勤務、退路與維修行動。未新增 lore 檔或未支援的敘事欄位。review 的配裝核對記 size/槽容量，不把 size 相加當作多件可共用同一槽。

固定三項驗收（2026-10-27）：

1. Python 標準庫核對通過，exit 0：category=mechs 恰六個概念、計畫明列 12 檔全部存在，JSON 可解析，id 與檔名相符；worktree 新增恰 12 檔、無舊檔修改，每檔小於 16 KB。另核對範本 baseAttrs／pools、未覆寫槽及 tags 保留，42 個配裝槽的型別／尺寸與附加部位均合法。六篇中文字符數依 review 列序為 331、331、342、346、357、350。
2. 主樹指定工具 content_gate.py 執行指定 worktree 與主樹 manifest，exit 0，原文：`OK batch=wl-mechs-1027 mode=add approved=12 violations=0`。自己的 worktree `git diff --check` exit 0、無輸出。未使用 carry，未將新內容搬入主樹。
3. REPORT 與 review 存在；review 為 wf-table/1，恰六列，每列白話非空且不超 60 字、各附 frame 與型錄路徑，REPORT 開頭含 mustRead 五份完整路徑，並明記整合驗收與平衡未驗。內容與報告合計小於 1 MB。

## 未做與證據不足

整合驗收與平衡未驗。遵照使用者公司環境限制，不安裝、不 npm、不測試、不 sim、不 MCP、不執行 content_accept、不重錄 golden；不 commit/push、不再派子代理。未將 manifest 改成 accepted，也不宣稱整批已接受。

機體數值及既有能力超建議帶之處均未調整：劍魚 initiative 8／evasion 8、鐵砧 perception 4／燼上限 110／regen -12、測墟 perception 8 等沿同級範本；斷臂一樁傷害 44／5 AP 及既有輝光連吼、潮鰭連斬等仍按原能力。護艙隔板另添胸部外掛裝甲層 25 HP，不改骨架或 baseAttrs／pools。

保留完整配套並補座艙與魂核後，總 mass 在部分 C 級超過 mechs.md 的自律建議 9，詳 review：為遵照本次保留配套指示，未擅自刪裝備或調舊件 mass。現行無載重硬規則，此為平衡待審，不是尺寸相容性保證戰術平衡。隔板與魂核也使配裝總量增加，回家需連同費用與戰鬥節奏一併審。

主樹 mechs.md／engine-facts.json 仍有「尚無 frame 填 defaultLoadout」、frame 無別名等舊敘述；實際範本已具配裝，FrameDef 支援 nameEn／etymology。採現有內容與型別契約，不在本線修改規矩。型錄宣告只建立候選資料，未驗明在營運補員或市場的可取得性。

## 需要決定

沒有阻止本批資料產出的新引擎缺口。主線回家收件後需完成整合、補員與市場掛接檢查、戰鬥及平衡驗收，裁決保留配套後的質量與強度；拾痕型的異系共鳴代價沿現契約驗證。正式採用與 accepted 由主線後續處理。

# fg-gm-01 交付報告

## 已讀清單

<!-- wf-nav -->
- [AGENTS.md](../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../../../wf/workflows/common/user.md)
- [wf/workflows/content/README.md](../../../../../../wf/workflows/content/README.md)
- [wf/workflows/content/batch.md](../../../../../../wf/workflows/content/batch.md)
- [wf/workflows/content/mechs.md](../../../../../../wf/workflows/content/mechs.md)
- [wf/workflows/content/abilities-effects.md](../../../../../../wf/workflows/content/abilities-effects.md)
- [wf/workflows/content/numeric-bands.md](../../../../../../wf/workflows/content/numeric-bands.md)
- [wf/workflows/content/numeric-bands.json](../../../../../../wf/workflows/content/numeric-bands.json)
- [wf/workflows/content/engine-facts.json](../../../../../../wf/workflows/content/engine-facts.json)
- [wf/workflows/content/world-pillars.md](../../../../../../wf/workflows/content/world-pillars.md)
- [wf/workflows/content/polish.md](../../../../../../wf/workflows/content/polish.md)
- [content/lore/style.md](../../../../../../content/lore/style.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md](../../../../../../wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md)
- [wf/workflows/dispatch/handoffs/fill-rulings.md](../../../../../../wf/workflows/dispatch/handoffs/fill-rulings.md)
- [wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md](../../../../../../wf/workflows/dispatch/handoffs/done/2026-10-26/lead-resist/REPORT.md)
- [wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md](../../../../../../wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md)
- [wf/workflows/planning/specs/core/data-model-abilities-effects.md](../../../../../../wf/workflows/planning/specs/core/data-model-abilities-effects.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/plan.md](../../../../../../wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/plan.md)
- [wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/new-items.json](../../../../../../wf/workflows/dispatch/handoffs/lead-fill-gear/plan-gm/new-items.json)

另讀適用細則與範本：`wf/workflows/common/data-files.md`、`wf/workflows/content/acceptance-playtest.md`、`world-pillars/mechs/mechanical.md`、`world-pillars/world/tone-and-rules.md`、templates 的 component 列與 `content/base/components/mx-burst-scale.json`。數值帶只查部件列、new-items 只查本批14列、既有索引只查範本與oa件。讀取來源雜湊見 [read-log.json](read-log.json)。

## 產出與邊界

完成14個新 mechanical 非核心部件：裝甲與防護6件、被動屬性／資源系統8件。設計等級C13、B1，僅作計畫資料，未塞入ComponentDef。name、nameEn、數值、引用與欄位均照payload，只有etymology潤飾；保留廠商、打法、代價與提案標記。部件hp C16／B18、size1、mass C3／B4；附加甲層25–35、抗性最高0.2，非武器size1沿既有同槽範本。沒有第15內容檔。

既有追蹤檔無差異；沒有修改市場、服務、其他軌、研究、索引、src、tests或黃金；未commit、push、建分支、安裝依賴、上網或使用MCP。工作樹原有node_modules連結未動；工具產生的__pycache__由gate列為ignored。scratch在 `/tmp/cx-fg-gm-01/`。本線狀態留在此交付區，未擴寫SESSION-LOG。

## 固定四條驗收

1. **未通過（工具缺口）**：14檔與14id逐項等於規格；14個內容檔均獲content_gate批准，無未知registry值（內容檢查0錯）。但原閘門將領導預放的本批manifest也當新增內容，回報 `PATH content/batches/2026-10/fg-gm-01.json`，所以原工具不是0越界，沒有宣稱ACCEPT。未放寬allow、未修改閘門；原始拒絕記入manifest.gateRejections及 [gate-initial.json](accept/gate-initial.json)。
2. **通過使用者覆蓋後的三項驗證**：`npm run check`、`npm run typecheck`、`node --test src/rules/state.test.ts` exit0；單一測試檔通過（TAP報告1/1、fail0），與本批配裝、池合併及layersAdd相關。check內亦含ops檢查。沒有跑npm test、test:e2e、sim/fuzz全套，也沒有改基準。原content_accept的gate仍拒絕，工具鏈結果另列於 [verdict.json](accept/verdict.json)；不可把此結果當整批通過。
3. **通過本條固定的配裝／能力條件**：14件均用表列相容frame、bodyplan、part、slot替換或填入指定一槽，保留其他defaultLoadout；seed1–5共70場runBattle零例外，全部正常結局。無新增能力、effects或研究，故新能力AI覆蓋與研究引用／旗標條件不適用；既有能力使用計數仍逐場留存。6件附加甲共7層有HP差異證據。**另有基底增益缺口**：部件attrMods／poolMods尚未由引擎套用，11件帶有的這些修正均觀測為0差異，其中8件只有這類設計增益；此發現未另加驗收條件，也未偽造有效證據。見 [smoke.json](smoke.json)。
4. **通過**：本報告列已讀、件數、接線未決與四條結果；[review.json](review.json)14列且白話皆≤60字，[naming.json](naming.json)14列，[inserts.json](inserts.json)空表明示未改既有檔。市場、服務與其他軌未動。

## 接線未決與實測限制

**engine缺口：部件修正不生效。** 以分燼橋裝堅盾-II為例，heat.regen預期-15→-20，實際仍-15；charge.max預期50→40，實際仍50。定腕組裝吊鉚，accuracy預期2→5、control預期0→3，實際仍2與0。退浪脛甲新增30HP甲層生效，evasion -1代價卻未套用；眉甲等同時帶護甲與負屬性的件也有同樣問題。這些不是新資料格式錯誤：起點 `a1463faeb071` 的 `src/rules/state.ts` 只讀monster.attrMods，部件poolMods／attrMods沒有執行消費點。未越界修src，也未將它們改寫成其他機制。正式採用前交領導另排引擎線，不能宣稱這14件全有計畫中的收益與代價。

**tool缺口：manifest被誤列為內容。** content_gate沒有帳本豁免；本線依允許範圍留下manifest，故不能靠移走、放寬allow或更改工具湊綠。請領導處理後重驗。此為點名工具問題，整批標rejected並等待領導收件；其餘已授權工作已完成。

公開通用接口件不設虛構共同聲望。市場、服務與研究購買端接線仍由計畫requirements裁決；交臂甲、定腕組、巡目、回燼梁的研究前置未在本批落地，沒有宣稱已上架或已鎖購買。六家廠名與裝備名均保持提案。R4凡鐵級差差異仍由領導處理，本批沒有凡鐵武器與新能力，不修改抵抗性規則。

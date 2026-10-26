# fg-gm-04 交付報告

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
- [wf/workflows/content/ops-content.md](../../../../../../wf/workflows/content/ops-content.md)
- [wf/workflows/planning/specs/ops/data-model-economy-research.md](../../../../../../wf/workflows/planning/specs/ops/data-model-economy-research.md)

另親讀 WORKFLOWS、SESSION-LOG、WAIT_USER、common/data-files、conventions、code-map、dev-env、content/templates 的部件／能力／效果／研究列、acceptance-playtest，以及 world-pillars 的基調／抵抗性與機械系子檔。範本為 mx-burst-scale、kx-star-howl、kx-ground-stomp、mx-airborne、world/research/restraint。new-items 透過 tabledb 僅取 fg-gm-04 的14列，numeric-bands 查部件／能力／效果／營運列，engine-facts 分段讀完。

## 產出與邊界

本批恰14新內容檔：6 mechanical 部件、2能力、2效果、4研究。實際起點 `6f20f4f12d593543c718f2f64b616755c00b715b` 已含 fg-gm-01 的四件研究引用物。名稱、nameEn、數值、引用與欄位保留payload；僅潤飾10件的etymology，均保留製造勢力、打法、限制與提案標記。研究無nameEn／etymology未知欄，英文與意涵留naming.json。

部件C5／B1，hp16／18、size1／2、mass3／4；護膝45HP、護額30HP、抗性最高0.1。能力AP3／4，燼線14傷、25流光、冷卻2，範圍與附帶擾準依原計畫折減；定向視野+6／準頭+5，燼障準頭-5（B短效建議帶以下，依計畫保留）。研究680–1250幣、64–104工時，落在工作流建議區間。沒有第15內容檔。

工作樹只新增14內容檔與領導預放的manifest；既有追蹤檔、六市場、服務、actions、registries、frames、lore、src、test、specs、索引與黃金均未修改。工具的__pycache__及原有node_modules連結由gate列ignored。未commit、push、建分支、刪檔、裝依賴、上網、使用MCP或GUI；未派子代理。scratch位於 `/tmp/cx-fg-gm-04/`，本線狀態留本報告，不擴寫SESSION-LOG。

## 固定四條結果

1. **未通過（原閘門問題）**：14檔／14id逐項等於規格，14個內容檔均獲content_gate批准，內容載入0錯、無未知registry值。但領導預放的manifest `content/batches/2026-10/fg-gm-04.json` 被原工具當作新增內容，回報PATH，不符合0越界。原始拒絕留在manifest.gateRejections及 [gate-initial.json](accept/gate-initial.json)。未移走manifest、未放寬allow或改工具。
2. **使用者覆蓋的驗證通過；原鏈被gate阻擋**：`npm run check` exit0（core與ops皆0錯）、`npm run typecheck` exit0；相關scratch單檔測試8/8通過、fail0，結果見 [related-test.tap](accept/related-test.tap)，包含本批payload、6件配裝／30場戰鬥／新能力效果與4研究旗標。原content_accept結果見 [verdict.json](accept/verdict.json)，不能當整批ACCEPT。未跑npm test、test:e2e、sim／fuzz全套，未改任何基準。
3. **通過固定煙霧條件**：每件用表列frame／bodyplan／part／slot，替換或填入指定一槽、保留其餘defaultLoadout；seed1–5共30場runBattle零例外、全部outcome。循山定向由AI使用10次，燼門橫開12次；定向實測accuracy2→7、perception4→10，燼障accuracy0→-5。效果施加10／2次，四研究引用／解鎖旗標均存 [smoke.json](smoke.json)。下節另列部件修正未生效的基底限制，未以改src或換機制掩蓋。
4. **通過**：已讀清單、數量、接線未決與四條結果齊全；[review.json](review.json)14列且白話≤60字，[naming.json](naming.json)14列提案，[inserts.json](inserts.json)為空表，明示未改市場、服務或其他既有檔。

## 接線未決與實測限制

**原閘門誤判manifest**：與fg-gm-01報告相同；原content_gate未豁免帳本，原content_accept在gate後停止。整批保持rejected等待領導處理工具後重驗，不宣稱ACCEPT；其餘授權工作已完成。

**基底部件修正缺口**：`src/rules/state.ts`建立部件時讀pools與layersAdd，未套用部件attrMods／poolMods。本批拉美接光匣、北非護膝、撒南護額、雪梨回望目的屬性／池修正都未實現。接光匣charge.max預期50→75、initiative5→3，實際仍50／5；護膝腿甲45HP有加入，但initiative-3未套用；護額頭甲30HP有加入，但resolve+2／perception-1未套用；回望目的perception+3／evasion+2／accuracy-3皆無變化。不得把這些收益或負面代價說成已可用，正式採用需領導另排引擎線。能力效果走contribs實測有變化，與部件缺口分開。

**研究與取得**：四引用部件均存在於manifest.base；finishResearch完成設 `unlocked:<component-id>`，回燼梁的定腕組前置已核，工時未滿不設旗標。此處只驗前置與解鎖，不宣稱已扣款、已製造或購買端已設門檻。四研究與六部件市場／服務均未接線；六勢力缺獨立營運聲望，C20／B35為計畫門檻，不借別家聲望、不擅自上架。researchReady／finishResearch不代替交易層授權。

**相容與R4**：layersAdd只承諾指定骨架既有legs／head，poolMods不創池；無本批有限矢池或補給修改。燼門能力明填essence B，本批無凡鐵武器；現行凡鐵採全局外甲倍率，而非要求的機體級差減半，照R4只回報，不修規則。

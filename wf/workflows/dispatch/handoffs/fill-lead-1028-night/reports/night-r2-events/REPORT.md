## 已讀清單

- `AGENTS.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/user/working.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/dispatch/handoffs/fill-lead-1028-night/approved-r2-events.json`

其餘已讀與hash證據保留readlist.json，未重寫。

## 做了什麼／產出

依凍結B01–B04完成四件純lore可能事件，原night-r2 IDs與名稱保留。日期2108-02只代表可能時段，period=era/league、occurs=possible、visibility=rumor、tags含rumor；summary及body皆有若／可能，consequences各兩條沿用核可條件句；不新增gameRefs欄。四檔合計13874 bytes，單檔<16KB、合計<64KB。

- `content/lore/events/night-r2-accra-lowered-banners.json`：body 884字元／純漢字782，四小標、兩條條件後果；3470 bytes。
- `content/lore/events/night-r2-ring-road-split-convoy.json`：body 868字元／純漢字771，四小標、兩條條件後果；3370 bytes。
- `content/lore/events/night-r2-uluru-public-camp-sheet.json`：body 881字元／純漢字784，四小標、兩條條件後果；3473 bytes。
- `content/lore/events/night-r2-ferry-second-price.json`：body 898字元／純漢字800，四小標、兩條條件後果；3561 bytes。

B01主動作為遠行臨時外哨佯退與被拔旗後辨路；B02雇主主動拆列後承擔額外護車費；B03學會公開自己的普通舊營圖並自付搬營接待；B04同船二售普通貨件交接時段與買方改約取消尾款。無新人物／地點檔、機制、base或CK能力配套；沒有把普通搬工寫成可驅核心的不老者。

五個指定附件已齊：REPORT.md；review.json白話各≤60字；naming.json；readlist.json；dedup.json（逐檔近鄰、主動作、前輪差異、寫前／交稿證據、度量與lore真實stdout）。四份JSON附件均wf-table/1，讀寫由主repo tabledb完成。

唯一驗證命令 `node content/lore/check.ts`，cwd `/tmp/fill-lead-1028-night/wt-r2-events`；執行一次，exit0，`errors=0 warnings=0`。faction69／character301／event194／place138／era7；timeline228。只作輕量內容檢查，沒有runner或其他重負載。

新增前git status --short為空；交稿狀態只有四個新檔：

```text
?? content/lore/events/night-r2-accra-lowered-banners.json
?? content/lore/events/night-r2-ferry-second-price.json
?? content/lore/events/night-r2-ring-road-split-convoy.json
?? content/lore/events/night-r2-uluru-public-camp-sheet.json
```

## 沒做到或證據不足

本批未跑gate/content_accept、npm、node --test/wiki、sim/probe/fuzz、MCP、build或任何CK重測；未宣稱整合accepted。共通風格、WF與C前輪主動作沿本agent既讀及親寫證據，比對沒有冒稱本批重讀共通或全庫逐篇去重。既有近鄰雜湊比對亦留dedup，若出現差異供領導看實讀版本，不擅改凍結設計。

補充近鄰有既存範圍用語差異：trade-route-charter寫高原衛不離安地斯，核可直接母檔quito／ring-caravan及燈火之戰已有高原衛環線護航、洲內守路敘述。本稿沿核可既有守站與原約接應，不新增出山／出洲部署或替這個既有用語差異定案。烏魯魯首次露脊年份的既有差異也未引入正文；本稿只寫普通舊營圖。

## 需要決定

本批授權產出DONE，無新增設計請求；待領導統一gate/content_accept與敘事收件。上述高原衛既存用語差異保留給領導另判，本稿未改既有資料或擴充調度。所有後果仍為可能、局部且未生效的後續，不回寫timeline／母檔；CK資料、旗標與pilot runner均未碰。子代理0、無git寫入、無寄信／下載／GUI，報告僅此五附件。

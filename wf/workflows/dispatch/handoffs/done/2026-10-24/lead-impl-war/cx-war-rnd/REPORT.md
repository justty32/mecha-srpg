# cx-war-rnd 勢力研發、血統與市場交付：DONE（固定驗收及指定例外）

## 做了什麼

實作月初研發收入、三條件候選池、加權推進與釋出；開局依持有殼及通用血統建立 released。取得殼恰滿兩潮月才開血統；失殼停研、保留已釋出與暫停進度，其他血統仍可推進。條約共享在日結開啟／撤銷資格，研發點只在每潮月第 1 天累積且同日不重跑。

補員接機齡及 tier 權重；勝仗按內容 30% 擲同系列 mark+1 隊長機，數量一台且加入返還出資索引。技術流出改 campaign 的 genericSince、進各勢力機型池、更新市場可見性及宿怨；玩家轉賣只流出一型，maker rep −15。trade 到六潮月及 shell-pact 到期會釋放 licensed 機型。

市場依領導 12:10 orders 改為可選 `lists.filters`，既有 `items` 型別不變；動態商品存市場快照，提供 `marketListings()`。含上市一潮月 1.5 倍價、trade 互列折價、護航補貨解除加價、scarcity 一潮月少貨、封港不刷新／不交易。新增三角洲軍械市場，避免與達卡原市場造成文字解析多義。core 僅增加 series／mark 兩個可選欄與 schema 屬性。

固定六條結果詳見 [acceptance.json](acceptance.json)。研發 21 項、市場 7 項全綠；含既有 parse 回歸合計 33 項全綠。typecheck exit 0；world 與 core 內容檢查皆 0 errors／0 warnings。三個 seed 各 31 次 ModelReleased，已釋出型號由 15 增至 25（1.67 倍）。

## 產出（含完整檔案清單）

[files.json](files.json) 列完整絕對路徑：13 個程式／schema 檔、25 個內容檔及本目錄交付證據。程式差異含共用檔他線內容的保守上界約 71.9 KB，未達 15 檔／80 KB gate。沒有 commit，沒有改黃金 fixture、既有市場或任何 frame 內容。

對外型別變更表：[types.json](types.json)。本線在共用檔僅改 FactionState 的可選 rndProgress、MarketDef 可選 filters、內容檢查追加與 CLI 的 `釋出=` 表達式；保留 cx-war-merc 的所有修改。沒有修改 operations.ts（其中工作樹差異屬參戰線）。

新事件：`LineageOpened`（faction、lineage）、`ModelReleased`（faction、model）、`CaptainCreated`（operation、faction、model、count、name）。既有 `TechLeaked` 改為帶狀態後果，仍使用 model／by payload。

seed 1 的開局及 24 潮月每勢力釋出時間線：[timeline-seed-1.json](timeline-seed-1.json)。共 25 列，每列列全世界獨立型號數及八勢力的總數、當月釋出日與型號；開局列含完整已釋出清單。三 seed 摘要：[simulation.json](simulation.json)，對應 [idle-1.log](idle-1.log)、[idle-2.log](idle-2.log)、[idle-3.log](idle-3.log)。事件計數由同 CLI idle 策略與等待節奏的觀測程式取得，見 [evidence.log](evidence.log)。

## 沒做到或證據不足的

`npm test` 最新 110 檔：105 綠、5 紅，詳見 [npm-test.log](npm-test.log)。紅檔為 MCP cli／e2e、ops golden、UI controller、fuzz；不能宣稱全套 exit 0。依交接另跑 ops：36 檔 35 綠，僅既有 golden 不符，見 [ops-tests.log](ops-tests.log)。黃金按明示禁令未重產；完整套件的其他失敗已上報。UI controller 的定位輸出曾顯示 join-reputation，見 [consumer-tests.log](consumer-tests.log)；該檔亦保留已修復的市場多義歷史，最新 parse 已全綠。沒有拿沙箱檔案計數冒充單元數。

完整 SPEC-GAP 表：[spec-gaps.json](spec-gaps.json)。主要偏離：補員倒數公式與「舊多新少」相反，沿前線採機齡正比；共享古代 frame 以 shell 標籤區分世界血統；收入 cult 與戰損偏好、raid tier 係數、trade／scarcity 量級採最小補定。新增 old-array 血統及兩型機僅重用既有 frame，不改戰鬥資料。

尚未落地的跨線部分明列：文字／UI 動態商品顯示（依新 orders 暫緩）；封港目前涵蓋市場及自動補彈，其他 services 未全面停用；現有 node 無 workshop 標籤，作戰流出已有單元證據但真內容入口待內容線；component filter 缺少 ModelDef→部件映射，目前僅實作 frame 篩選。圍城人口、勢力 cash／stock 與進貢帳本依交接明示不做。code-map 與上層進度檔不在本線授權範圍，交領導維護。

## 需要決定的事

固定六條已跑完，本線停工。請領導整合時處理保留的 golden 與非本線紅燈，並安排上述跨線顯示、其他 services、工坊標籤及部件映射；補員公式的文字矛盾與量級選擇可依 SPEC-GAP 表統一回寫規格。

### 以後交接書該點名的工具

`inbox_poll.sh --once`、`inbox_mail.sh --up`、`node --test --test-isolation=none`（取得真實子測試數）、`node --test 'src/ops/**/*.test.ts'`（完整 ops 回歸）、24 潮月 CLI 加逐勢力事件觀測、`tabledb.py`（交付清單與時間線）、`git diff --numstat` 與限定路徑 diff（隔離共用檔責任）。

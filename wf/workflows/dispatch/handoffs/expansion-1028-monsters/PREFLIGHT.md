# 怪獸隊前置盤點｜READY，待核定計畫

只完成親讀、既有範本與配套盤點；尚未授權正式產出。未創作新設計、未建 worktree、未改 content／source／schema／spec，未跑測試。完整已讀清單見 [readlist.json](readlist.json)；`full` 為親讀全文，資料表與 code 的條件／段落另標。

## 已讀與護欄

已親讀根／repo AGENTS、WORKFLOWS、user/working/art、team-model、dispatch 與 content-batch；全部 **25 份** content 工作流 Markdown（含 world-pillars 子檔）、lore style 與 people、怪獸／生物系類別、core 資料與捕捉契約、適用 world／design-notes、舊怪獸設計書及下述範本全文。工作區與 repo inbox 開場唯讀均無新信；既有 SESSION／WAIT 僅識別、不續歷史任務。

本階段只寫本目錄兩檔；子代理 0，不安裝、外部 CLI、GUI、commit／push。正式產出須等領導同線核定計畫、隔離 worktree 與新 allow 契約。本輪只做 focused checks，重驗由領導串行。

## 可重用的既有範本（不是驗收宣稱）

既有範本與配套全文盤點已抽到 [preflight-templates.json](preflight-templates.json)（五類）；只是閱讀背景，不當成驗收。

所有 >1KB 資料表與索引皆條件查詢；範本長 JSON 經索引的指定列 open 親讀，沒有整片傾倒索引。引用工具查得：cliffjaw species 被兩個個體引用；赤眼個體掛 `beast-stampede` 及獸裂；bio frame 已有六個 kj2 展示情境引用。這些是去重背景，不代表那些批次已驗收。

## 過期文件與當前 code/tests 窄核

1. **EF-13 過期**：`src/rules/state.ts:69–105,248` 已合成 `extraAbilities`、整欄 `partsOverride` 與 `attrMods`；`test/rules/monster-def.test.ts` 有相應斷言。不能再稱三欄未實作；本輪也不因可用而自加設計。
2. **EF-16／numeric-bands 舊現況過期**：`src/rules/resistance.ts:39–45` 已算精粹等級差，凡鐵只達 outer 層；`src/rules/resistance.test.ts` 有減半、核零傷斷言。不能用舊全局一成描述當現況。
3. **「同族同級 A 只能一隻」舊限制過期**：`src/ops/sortie/apply.ts:141–150` 正式結果優先取 monster id；`intent.test.ts` 有兩隻 A 各自二名斷言。缺 id 的舊結果仍僅能唯一回推；實際可寫件數依核定計畫，不自行加第二隻。
4. **core／捕捉護欄仍在**：`layers.ts:85–102` 以結構層全毀判部位、所有 core 功能部位毀判死；`flow.ts:135–147` 要求條件功能部位存在且全符合。菌絲的 core 是死亡判定功能，不是敘事 organ 核。

以上僅靜態讀 code 與現有測試斷言，**本階段沒有執行它們**。未就 territorial／其他新機制做授權外推論。

## draft、去重與必留白

索引條件查詢顯示現有怪獸 66、species 54；這是生成索引快照，不是驗證結果。`status=draft` 命中 10 份 species：wl 的折鐮／礫鬃／鹽紗／斜帷，wm-r7 的疊燈／踢珠／裂炬，wn-r3 的針扇／垂帆／旋沫。`wl-monsters-1027` 帳本仍 draft（16 檔）。它們都只當候選去重背景；舊 215 件與七輪仍待整合驗收，不升格 verified。新構想須比對輪廓、用途、戰場定位與具體情節，而非只查名稱。

P01 失腿兩說、Fable 機制題、SS／SSS、裏側答案、舊 lore 衝突與歷史 inbox 都留白；不裁決、不續辦。範本及數值帶只是暫填依據，數值最後由整批統一調。

## 本階段固定驗收

1. 已讀範本與適用規矩記入 readlist，25 份 content Markdown 全覆蓋。
2. 本報告列現有配套、draft 風險與不可決定事項，沒有冒稱整合驗收。
3. 僅新增本報告及 readlist；正式 handoff 的 brief_lint strict 已執行，回傳 0 違規／1 檔。測試與重負載均未執行。

**READY：等待領導原生 followup；未開始正式 content。**

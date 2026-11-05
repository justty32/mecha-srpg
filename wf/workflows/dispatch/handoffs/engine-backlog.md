# engine-backlog — 非 codex 的工作（引擎、AI、平衡、規則、效能）

[dispatch](../README.md)｜[planning](../../planning.md)

各線 REPORT「剩餘工作／需要決定」彙整去重的待辦。**codex 只做新增內容與文字潤飾**；本表是那兩件事以外、要開 Opus 領導線（feature-dev／planning）做的事。已抽到 [engine-backlog.json](engine-backlog.json)（70 列，只放未完成）。

欄位：`序`（穩定編號，src 註解以「engine-backlog N」引用，刪列不重編）、`優先`（P1 先做／P2 接著做／P3 有空再做）、`項目`、`來源`（線名＋commit 的純文字）、`影響`（不做會怎樣）、`建議做法`、`規模`（小＝一條 codex 工人、中＝一位領導帶 1–3 工人、大＝多段切線）。查法見資料檔說明。

統計：P1 3 列、P2 29 列、P3 38 列。2026-11-05 刪 27 列已完成（含已查清的第 4 列，結論併入第 5 列）；追加 93–97（lead-bigfill 五項引擎需求）；75–77 註記 Fable 裁決的 E1→E3′ 路線。

## 怎麼排

- **P1**：第 5 列第二年經濟要在方格大地圖上重調報酬、供給與勢力帳本；74 部件常駐修正未安裝；75 勢力件聲望門檻照 Fable 裁決走 E1。
- **P2 引擎缺欄**多數會擋 codex 內容批次的「填了會不會生效」（passive／molt／territorial／barks／獸緣殼緣）；派內容批次前先查本表與 content 工作流的 `engine-facts.json`，缺欄未落地的內容先不派。
- **古代機等級無上限**（第 10 列）是裁示（design-notes mechs 末段），表示法要規劃線先定。
- 數值都是暫值，放 `rules` 參數；改既有數值的歸平衡線。

## 交接

- 開線照 [dispatch](../README.md)：切線按明列路徑、交接書過 `brief_lint --strict`；**完成一列就從 json 刪掉**，commit 訊息寫序號。
- 新冒出的非 codex 工作追加到 json（序接最大號），不寫回各 REPORT。

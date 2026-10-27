# 非人物跨批內容去重／矛盾審查（2026-10-27）

## 問題

bigfill、gear、scen 與既有非人物內容是否重複、矛盾或缺少掛接？本輪只盤點送審，不改遊戲內容。

## 方法

全量唯讀掃描 content/base、content/lore 共 2,238 份非人物 JSON，排除人物及招募相關 457 檔。三線共478列，其中bigfill排除34人物後181件、gear 200件、scen 63件，目標共444檔。比對精確名稱、結構等價、近名、lore正文相似度、引用與槽尺寸，再核原檔及裁示。詳細門檻、範圍計數與來源指紋在資料檔。

## 發現

已抽到 [content.json](content.json)（20列）。16組／件機械候選為4組相同遭遇、3組近名部件及9件無相容槽部件；另外4列整理既知掛接、節奏與正常配套，未當成新bug。精確同名0組；沒有足夠證據確認需刪除的語義重複。

**9件部件存在明確尺寸缺口**：需要size 2的甲／系統槽，目前可改裝frame對應槽最大size 1。既有報告只概述部分件，本次逐件列出；縮件或擴槽留待裁決。

四組遭遇模板是計畫明示共用淺層基底，契約分別指定目標；三組近名部件的槽位、部位或取捨不同，應保留。情境標明假想可重播，不以參考編隊推論史實衝突。

## 結論

送審統計：9列確定問題、5列刻意變體、3列同系列、3列待人審。優先決定尺寸缺口；49件含被動修正欄位只是既知74號缺口的曝險清單，不能宣稱全數動態失效。75–77號取得路徑及短場節奏沿用既有證據，不擴成引擎稽核。Fable問題附於各列，不實作解法。

本輪未測試、未跑整合驗收／lint／golden，未安裝、commit／push、刪檔或清worktree。只以git diff --check檢查差異空白；語義去重仍有改寫漏檢限制，不能宣稱全庫已無矛盾。

## 來源

逐列 evidence 提供具體檔案、欄位、短引文及影響／建議；scan／method／limits 記統計、方法與限制。先讀 [fill裁示](../../../workflows/dispatch/handoffs/fill-rulings.md)、[bigfill報告](../../../workflows/dispatch/handoffs/lead-bigfill/report.md)、[gear報告](../../../workflows/dispatch/handoffs/lead-fill-gear/report.md)、[scen計畫](../../../workflows/dispatch/handoffs/lead-fill-scen/plan/plan.md)。本輪只寫本頁與資料檔，其他工作線的既有改動未覆寫。

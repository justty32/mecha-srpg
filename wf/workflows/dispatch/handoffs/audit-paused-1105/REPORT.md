# audit-paused-1105 — 四條暫停填充線的唯讀審查

[handoffs](../README.md)｜接續 [next-session](../next-session.md)｜前次審閱 [10/27](../../../../notes/investigations/content-review-2026-10-27/README.md)、[10/28](../../../../notes/investigations/content-review-2026-10-28/README.md)

2026-11-05，HEAD `6f28e4d9`。本次只做審查：沒有改內容、程式碼或狀態檔，沒有 commit，也沒有跑 node（同時段另一個 agent 在跑全套測試）。機械比對全部用 python 與 git。loader 結果引用同日 verify-head-1105 的 check.log：`OK 0 errors, 17 warnings`，index 73 分片一致。

明細：
- [issues.json](issues.json)：18 列，問題 I01–I18。
- [gear-acquire.json](gear-acquire.json)：124 件 gear 部件各自的取得路徑。

## 結論（每線一句）

- **lead-bigfill：可收。** `c8e0e0a` 新增 215 檔，類別與數量相符；既有檔只有插入；全部已提交、已進索引。剩下五項引擎需求還沒登記（I14）。
- **lead-fill-gear：有問題要修。** `fbe0a33`＋`a66cd46` 共 200 檔，市場 13 列，都屬實。但 124 件部件只有 25 件拿得到（I01），104 件的 etymology 留著「提案名」（I02），報告所說的 fg-golden 不存在（I04）。
- **lead-fill-pilots：可收。** `299d084` 的 148×3 檔與 40 個招募池全部存在；人名、person、lore 一一對應；每個背景都有招募池在用。名表文化問題（I08）已登記 backlog 82。
- **lead-small：程式可收，紀錄不可信。** `69924b0` 與提交訊息相符；但四份狀態檔所說的「本機未追蹤 report.md」並不存在（I03），另有一處輕微越界（I12）。
- **fill-scen：內容可收，行政未完。** `0d4fb5ac` 的 48 個情境與 15 張地圖都存在；附件夾沒有搬到 done，索引連結失效（I07）。
- **10/27 七輪：** `8ba72b4` 新增 124 個 JSON，數量相符；殘留的 16 個 worktree 與 main 逐位元相同（I09）。
- **10/28 expansion／night：** 檔案齊全；被退的月衡、燼雨沒有留下檔案。Sonnet 抽查全文 46 檔、機械比對 43 檔，結果見 I17、I18。

## 1. 紀錄與實況

宣稱的提交 c8e0e0a、fbe0a33、a66cd46、299d084、de65154、69924b0、ae7b204、4b0db24（0 bytes 的 patch）、8ba72b4、c9ce4e8，全部是 HEAD 的祖先，內容也與描述相符。

下列舊識別在現行歷史中已經沒有物件，卻仍被 fill-rulings、done 索引與各線 report 引用（I06）：634e7ad0、352e589b、6f20f4f1、f3592fef、a3c53115、3d79f69、9364f46、dc20d7f4。

`git branch -a` 只有 main。當年的 wt-bf-*、wt-fg-*、wt-fp-* 已經不在。

10/29 的 `a3407d97` 在四線之後重錄了 golden 與 campaign-hash，所以各線的「黃金重錄未收」已經過時（I05）。

## 2. 去重與矛盾（前兩次沒做的全庫機械掃描）

- **id：** base 2205、lore 715，沒有重複。
- **同名：** 扣掉 base／lore 成對的勢力與地點、靠 epithet 區分的具名怪獸、以說話者命名的對白之後，真正同名只有 2 組，都是 10/24 舊批（I15）。
- **年表：** 228 條，排序正確；事件引用沒有懸空或重複；日期與事件檔一致。唯一要注意的是兩條堅盾-I「普及」標題相近（I16）。
- **人物年齡：** 「崩前 N 歲」與 born 換算後都落在 2089 年；機魂的 born 指育成年份，不算矛盾。

## 3. 缺口

- **懸空引用：** 共 9575 個引用、1949 個不同目標，全部存在。lore 正文連結斷 0 個。lore 必填欄位與 summary／body 沒有缺漏。
- **孤兒內容：** 情境、事件、研究、遭遇、模型、怪獸都是引擎按類別或族別撈取，不算孤兒。真正的孤兒是 gear 部件（I01）：研究解鎖只設旗標（`research.ts:12`），loot 固定為空，市場沒有研究或聲望條件（backlog 75–77）。
- **旗標：** 被讀卻從沒被設的只有 1 個（`mycelium-harvested`，由測試設定）。設了沒人讀的 74 個，都是選項留下的痕跡。
- **pilots 選用插入：** 6 條都沒套；其中 4 條指向 lore faction 不存在的 places 欄（I13）。

## 需要使用者決定

1. gear 部件取不到：先掛上市場或戰利品（內容工作，但勢力件會繞過聲望門檻），還是等引擎讓研究解鎖接上市場（backlog 76、77）？
2. 要不要現在就把 etymology 裡的「提案名」字樣拿掉？只動文字欄位，命名審查之後再做。
3. 16 個 10/27 worktree 要不要清？lead-fill-scen 附件夾要不要搬去 done？刪除需要使用者點頭。
4. gear 約 16 萬行原始戰鬥紀錄（`a66cd46`）要不要繼續留在庫裡？
5. 要不要補非洲、韓國、俄國的命名名表（backlog 82）？

## 限制

本次沒有跑 node：loader 結果引用他人 09:26 的紀錄；lore check.ts 沒有跑，改用 python 重做必填欄位與連結檢查。語義部分只有抽查，不代表全庫逐句審過。

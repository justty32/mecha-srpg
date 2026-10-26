# talk-decide 交接書（2026-10-25，Fable 對談線，頂層寫）

[handoffs](../README.md)｜前一場對談 [talk-world](../talk-world/HANDOVER.md)

## 0. 這條線在做什麼

使用者在 tmux 直接跟你（Fable 5.1）對談，把 2026-10-24 各線收線後**還沒拍板的世界觀與規矩題**一題題定下來。**只聊、不改 spec、不改內容、不 commit**；唯一可寫的是本資料夾（`REPORT.md`，記使用者原話與【可落地】要點）。聊出結論時以【可落地】列出要點，收線後由頂層派人寫進 design-notes／spec。

**遊戲機制的數值微調（經濟目標、出戰前士氣回復等）使用者說要等之後**，不在本場範圍；碰到就記下、不展開。

## 1. 先讀

1. `AGENTS.md` → `wf/workflows/common/user.md`（回覆短、先結論、問「要不要」時附可執行判準）
2. [talk-world HANDOVER](../talk-world/HANDOVER.md) 與其 `handover/rulings.md`、`handover/open.md`（上一場的原話與未決）
3. 每題的出處檔（下表），按需讀

## 2. 題目（頂層盤點，已扣掉後續 commit 已裁示的）

| # | 題 | 出處 |
|---|---|---|
| B4 | 無人化（A）與精粹改人（B）——使用者說「下次由 Fable 對談一起想」；連帶不老駕駛員候選 9 人要不要點出 | [lead-pilot-essence REPORT](../done/2026-10-24/lead-pilot-essence/REPORT.md)、`wf/workflows/planning/design-notes/world/pilots.md`、[engine-backlog](../engine-backlog.md) 46–48 |
| B6 | 連暫定答案都沒有的題：凡鐵打人／打機甲數值與精粹矢價格、雙籤城兩傘權限（R08）、墟裡出不出 S 級精粹（R24）、SS／SSS、蝕壓源頭、S 領主、第 40 蝕月景象與各方反應；talk-world 的 5、6、7.5、7.7、7.8、7.9 條（最要緊：7.5 大潮是否全球同一夜、7.8 人口門檻與塞勒涅何時知情） | [lead-settle REPORT](../done/2026-10-24/lead-settle/REPORT.md)「沒有暫定答案」段、talk-world `handover/open.md` |
| B10 | 2098 白手套原型兩說，lead-settle 取了多數說（人駕女武神）；要不要改回「遠端監督自動機」說（改就要還原兩檔） | [lead-settle REPORT](../done/2026-10-24/lead-settle/REPORT.md)「代做取捨」 |
| B3 | 白手套單位的表示法：①只改文案 ②加「凡鐵」標記（建議，數值不動）③新 kind 鐵偶 | [engine-backlog](../engine-backlog.md) 35、[lead-world-land REPORT](../done/2026-10-24/lead-world-land/REPORT.md) |
| B7 | 孤兒年表 17 條：建議留給填充層，孟加拉灣戰役、候鳥號誕生第一批補 | [lead-history-lines REPORT](../done/2026-10-24/lead-history-lines/REPORT.md) |
| B5 | 全庫翻譯腔逐句重審要不要另開 codex 批次 | [lead-rename REPORT](../done/2026-10-24/lead-rename/REPORT.md) 第 4 項 |
| B8 | 黃金重產授權（放寬新營運事件 `month>=7` 門檻）；勢力草稿 `ancientMech`、`relations` 欄位建議要不要套 | [lead-content REPORT](../done/2026-10-24/lead-content/REPORT.md) |
| B9 | `wf/STRUCTURE.md` 要不要補「生成式資料索引」一條 kernel 規則 | [lead-codex-pilot REPORT](../lead-codex-pilot/REPORT.md) 第六節第 3 項 |

順序由使用者決定；沒指定就 B4 → B6 → B10 → B3，其餘快問快答。lore 方法照使用者偏好：**先關鍵歷史節點 → 前因後果多線 → 最後才填地方人物**，不暴力產 lore；中文命名避免直譯。

## 3. 交接

- 收線或 context 吃緊時寫 `REPORT.md`（本資料夾）：每題一節——使用者原話（原樣）、結論、【可落地】要點、仍未決。
- 寫完告訴使用者「可以回頂層了」；頂層讀 REPORT 後派落地線。

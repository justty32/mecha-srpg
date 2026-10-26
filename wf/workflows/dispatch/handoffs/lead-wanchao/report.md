# lead-wanchao — 萬潮葬王副線落地（2026-10-26）

[handoffs](../README.md)｜規劃 [plan-wanchao](../plan-wanchao/plan.md)｜審核表 [review.json](review.json)｜遊戲文案草稿 [base-drafts.json](base-drafts.json)

## 結論

F1–F5 已落地為 lore（兩件 `occurs: possible` 事件、七處只插入的句子、年表兩條 rumor）；遊戲面文案（王跡三句、路線事件 2、契約 3、news 5、守牆情境 1）引擎未支援，只寫成草稿留在本目錄；E1–E5 追加為 engine-backlog 第 57–61 列。守則七條逐條對過：牠只走、停；拍二不交戰；不綁蝕壓源頭；無新人物；不動數值與 wreck-crown。

## 填了什麼

| 件 | 檔 | 掛到 |
|---|---|---|
| F2 | `content/lore/events/wanchao-northward.json`（黑脊北行，代表年 2109） | F／G／H 史線；吉大港→鹽灘外海→第七哨外海→達卡北郊河口；北岸一區轉淺蝕 |
| F3 | `content/lore/events/wanchao-at-gate.json`（城門未開，代表年 2111） | N10 連珠潮夜；寫到牠停在城門外為止 |
| F1 | `content/lore/places/chittagong.json` 插入兩句 | 開局狀態：外灘封、交屍南移、「外灘封了」；葛西蓮 2108 |
| F4 | 哈米德、拉希德、阿尼爾、法蒂瑪、茉莉人物檔各插入一句 | 2108 狀態 |
| F5 | `content/lore/timeline.json` 插入 2 條（rumor） | era/league |
| F1–F3 遊戲面 | [base-drafts.json](base-drafts.json) 14 列 | 等 engine-backlog 57–61 |
| E1–E5 | engine-backlog 第 57–61 列 | 王跡欄、世界移動、不可交戰在場單位、事件改區鉤子、N10 守牆情境 |

## 過程

codex 兩條：`cx-wc-plan`（gpt-6-astra，計畫 [plan/](plan/plan.md)）→ 領導修正 7 條 → `cx-wc-01`（gpt-6.1-sol，[wc-01/](wc-01/REPORT.md)），content_accept 第 1 輪 ACCEPT。插入句與年表由領導在 main 套用（gate 的 superset 規則不允許字串插入），腳本逐檔驗證「去掉插入段＝原文」。領導另改兩處正文開頭的計數口吻（第八至第二十四個蝕月、第四十個蝕月）。

## 需要使用者決定

1. 名字三個送審：「黑脊北行」「城門未開」「王跡」（王跡沿用提案名）。
2. 兩事件的代表年 2109／2111 只是年表擺位；真正落點要等引擎（E2、E5）依大潮表與第 40 蝕月決定。
3. 上游落差（不在本線授權內）：既有 wreck-crown 有長槍衍型機正面斬擊，與「拍一不交戰」守則不完全一致；哈米德人物檔砲台名「老鷺／老鸛」兩寫並存。是否交潤飾線處理，待定。

# talk-decide／快問快答（B7、B5、B8、B9）

[REPORT](../REPORT.md)

## 原話（照錄）

四題一起問：「都按照建議」。

## 結論與【可落地】

**B7 孤兒年表 17 條**：留填充層，不硬掛主線。填充第一批補孟加拉灣戰役與候鳥號誕生（開局舞台）。→ history-lines 孤兒表標「填充層」，填充線交接書寫明首批兩條。

**B5 全庫翻譯腔逐句重審**：開，限 lore 敘述欄（summary、body、consequences、doctrine、ideology 等），不碰 spec 與 design-notes。分三批 codex 潤飾、每批約 40 檔，第一批先做開局會讀到的勢力與人物。→ codex-batches 排三批 polish，manifest 用 `allow.proseFields` 明列欄位。

**B8 黃金重產與勢力欄位**：黃金是經濟數值，本場不授權放寬 `month >= 7` 閘門，留微調場。勢力草稿 `ancientMech` 欄套用（即 backlog 45 隱藏真相標記位，兩件合一）；`relations` 欄不套，等傘際關係填充時再定格式。→ lead-content 的 `faction-drafts/` 只取 `ancientMech`；backlog 45 註記。

**B9 STRUCTURE 加「生成式資料索引」**：加一條 kernel 規則：生成式索引只從來源檔重建、不手改、進 git、驗證比對不過就擋。→ `wf/STRUCTURE.md` 加一行，指向 `content/index/` 與 `npm run content:index`。

## 仍未決

無。

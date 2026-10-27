# 已讀清單

- [AGENTS.md](../../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../../common/user.md)
- [wf/workflows/content/README.md](../../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../../content/batch.md)
- [content/lore/style.md](../../../../../../../content/lore/style.md)

共通規矩沿用本線親讀紀錄。延伸已讀清單以 tabledb 寫入 [review.json](review.json) 的 readList；最相近來源另在逐列 fullTextRead 保存全文指紋與閱讀證據。

## 已做

DONE：依第5輪六列 places/adopt 與六列 approve 完成六篇地點正文。已讀表頭 sharedConstraints，使用新版 action／nearest／difference 欄位；每件兩份最相近全文已親讀，共十一個不同來源，未另開普查。

六處分別承接包書借閱、自由接拍、輪流造路、大件試掛、乘客換禮與樣屋取件短歇。正文保留偏好相反、獨奏未完、兩路未通、展翼一晚、禮物自留與房間消散等不同結果，未追加人生課或說服和解。六個 status2108 均改成場所實際使用狀態。

## 產出

正文六檔位於指定 `.git/wf-worktrees/wm-r5-places-1027/content/lore/places/`，精確符合計畫 targetFiles。每篇 551–586 個中文字，六檔合計 15,310 bytes，單檔均小於 16 KB。交付 [review.json](review.json)、[naming.json](naming.json) 與本報告；子代理 0。

固定三條有限驗收證據：

1. Python PASS：六份 JSON 可解析、id 對應檔名、地點與通用必填欄完整，world／continent／kind 符合計畫。正文只引用本列 oldIds 的 HEAD 既有場所；factions 與 gameRefs 留空。worktree 恰六份新增檔，舊檔修改 0，件數未超 20。
2. 主樹 content_gate.py 配本 worktree 及唯讀 manifest 回傳 0：`OK batch=wm-r5-places-1027 mode=add approved=6 violations=0`。worktree 的 `git diff --check` 回傳 0。
3. review 與 naming 各恰六列，白話逐列 ≤60 字；每列有兩份最近來源的完整閱讀證據及行動／衝突／場所功能比較。英文原名與意涵見 naming，原名亦保留正文 aka。REPORT 開頭五份 mustRead 齊；禁用詞掃描 0 命中，內容加報告總容量低於 1 MB。

## 未做與不足

未完整驗收；整合、平衡與試玩留家中。依交接未跑 node、npm、測試、typecheck、build、sim、probe、MCP 或全庫 wf-lint。未帶回主樹，未 add、commit、push；未修改 manifest、index、年表、SESSION、CLAIMS 或既有內容。

創作線依核准兩最近來源逐篇比對，交稿後完整語義查重與有限 accept／carry／index 由領導收件處理。全批維持 draft、integrationStatus deferred-by-user。wl-*／wn-*／wm-* 比較來源未進正文引用，沒有新人物檔、勢力或遊戲機制接線。

## 需決定

無新增機制矛盾待裁決。等領導與收件線核對地點用途、主要事件及不同後果；有限檢查不稱完整 accepted。

# 已讀清單

共通及人物規矩沿用本線前輪親讀；本輪補讀新總 brief、人物 brief、核准六列計畫及六列審核。五份必要已讀清單如下，其他親讀資料見[閱讀清單](readlist.json)：

- [AGENTS.md](../../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../../common/user.md)
- [wf/workflows/content/README.md](../../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../../content/batch.md)
- [content/lore/style.md](../../../../../../../content/lore/style.md)

兩份計畫表用 tabledb 依 character／id 定向讀取，六列皆 adopt／approve。最相近候選共十二份完整 JSON 已逐篇親讀，每概念最多兩份，含米娜補充的霧瓷浴堂；來源、指紋及具體閱讀證據存於 [review.json](review.json)。本輪不另開全庫盤點。

## 已做

DONE：依核准計畫完成六個人物概念的完整正文，從人物實際行動開篇。甜船落選卻賣出碎片、布獸受歡迎卻沒露臉、花期錯過相聚、反出謎題仍錯過對手、招隊只約成下一次、父子空桶回家，各自保留欲望與不同結果。

米娜篇雙方從起初便知道返程期限；相聚是攢下假期的罕有渡月旅程，正文有共餐、繞果皮、走長廊、合照的具體動作。花晚開，沒有以隱瞞傷勢、發現回條或改返程促成轉折。其餘篇也未添加遇獸撤船、公開認錯或公帳分配的收束。

## 產出

指定隔離 worktree：`.git/wf-worktrees/wm-r4-characters-1027/content/lore/characters/`，六個 wm-r4-*.json 精確等於核准 targetFiles。每篇正文 576–606 個中文字，內容六檔共 15,062 bytes，每檔少於 16 KB。交付 [review.json](review.json)、[naming.json](naming.json) 與本 REPORT；子代理 0。

固定三條有限驗收證據：

1. Python PASS：六個 JSON 可解析、id 與檔名相符、通用與人物必填欄完整。逐篇只連結本列 oldIds 的 HEAD 既有地點；人際、事件及 gameRefs 陣列留空。worktree 狀態恰六個新增檔，舊檔修改 0，未超 20 檔。
2. 主樹 content_gate.py 配指定 worktree 與 manifest 回傳 0：`OK batch=wm-r4-characters-1027 mode=add approved=6 violations=0`。worktree 的 `git diff --check` 回傳 0。
3. review 與 naming 各恰六列，白話逐列 ≤60 字；review 逐篇附全文來源及行動、衝突、用途與結果差異。英文原名均保留在正文 aka 與 naming 意涵表；REPORT 開頭含 manifest 五份 mustRead。正文禁用詞檢查 0 命中，內容與報告總量低於 1 MB。

## 未做與不足

未完整驗收；整合、平衡與試玩留家中。創作線未跑 node、npm、測試、typecheck、build、sim、probe、MCP 或全庫 wf-lint。未帶回主樹、未 add／commit／push，未修改 manifest、index、年表、SESSION 或 CLAIMS。

本輪比較依核准最相似候選，未宣稱全庫語義查重通過。交稿後由領導安排 terra 收件查重及有限 accept／carry／index；所有內容仍是 draft，integrationStatus 為 deferred-by-user。wl-*／wn-* 只用於全文比較，未進正文引用。

## 需決定

無新增機制矛盾待裁決。manifest goal原有舊輪次說明，領導收件時已更正為第4輪。領導收件前應保留未完整驗收狀態。

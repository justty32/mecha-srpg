# 已讀清單

- [AGENTS.md](../../../../../../../AGENTS.md)
- [wf/workflows/common/user.md](../../../../../common/user.md)
- [wf/workflows/content/README.md](../../../../../content/README.md)
- [wf/workflows/content/batch.md](../../../../../content/batch.md)
- [content/lore/style.md](../../../../../../../content/lore/style.md)

共通規矩沿用本線親讀紀錄，勢力段與欄位、模板已補讀。延伸清單以 tabledb 存入 [review.json](review.json) 的 readList；逐列 fullTextRead 另記最新兩近似全文的指紋及具體證據。

## 已做

DONE：依第6輪六列核准計畫完成正文，四列 approve、兩列 approve-revised 均已實現。已讀表頭 sharedConstraints、新版 collectiveAction／nearest／difference 及巡書退修紀錄。六件各兩最近全文，共十二個來源，未擴查。

巡書隊分車送書、留組帶輪讀，說書搬工被模仿後仍不願回場，未重演版本口味之爭；原案及退回理由保存在 review 的 rejectedRevision。晚星寫港棚、飯棚與庫外各處熟手交接，並分組歸還車架、收灶、清筐，替別人放假成功而自己晚宴變早飯。高旌接班機到門前才退前班，確實完成護工輪守，旗未展僅使宣傳落空；沒有重演招募未成或收短旗。

## 產出

六正文位於指定 `.git/wf-worktrees/wm-r6-factions-1027/content/lore/factions/`，檔名精確符合核准 targetFiles。正文含標題為 449–477 字元，其中中文字 374–397，六檔共 14,144 bytes。另交付 [review.json](review.json)、[naming.json](naming.json) 與本報告；子代理 0。

六件都有可引用信條、實際集體工具與分工、合法外交 stance 及對傭兵的具體服務或補給。其餘組織以書車、工班、艇具、坡板及岸務熟手行動；高旌使用外購通用機輪守。沒有硬補古代機、專屬血統或新事件檔。

固定三條有限驗收證據：

1. Python PASS：六份 JSON 可解析，id 對應檔名，通用及勢力必填欄完整；founded 全為字串，hq 全為中文，外交 stance 合法，信條逐篇出現在正文。引用僅本列 HEAD oldIds 或本批；worktree 恰六新檔、舊檔修改 0，未超 20 檔。
2. 主樹 content_gate.py 配指定 worktree 與唯讀 manifest 回傳 0：`OK batch=wm-r6-factions-1027 mode=add approved=6 violations=0`。worktree 的 `git diff --check` 回傳 0。
3. review 與 naming 各恰六列，白話逐列 ≤60 字；逐件有兩份全文證據與集體動作、衝突、組織用途及結果的實質差異。aka 保留英文，naming 記原名意涵；REPORT 開頭五份 mustRead 齊，長清單資料化。禁用詞 0 命中，內容與報告合計低於 1 MB。

## 未做與不足

未完整驗收；整合、平衡與試玩留家中。未跑 node、npm、測試、typecheck、build、sim、probe、MCP 或全庫 wf-lint。未帶回主樹、未 add／commit／push，未修改 manifest、index、年表、SESSION、CLAIMS 或既有內容。

創作線依核准兩近似全文成稿與比對，交稿語義查重及有限 accept／carry／index 留領導收件。全批仍為 draft、integrationStatus deferred-by-user。wl-*／wn-*／wm-* 僅供比較，正文沒有引用；本線補給屬 lore 描述，尚未接入營運效果。

## 需決定

無新增機制矛盾待裁決。請收件線保留巡書已退原案證據，並核對高旌守位成功、晚星多處岸務組織的區別；有限檢查不稱完整 accepted。

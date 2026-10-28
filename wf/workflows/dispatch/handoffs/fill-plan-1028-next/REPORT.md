# DONE：三批十二概念設計

## 做了什麼

親讀交接及適用工作流，已讀清單在 [readlist.json](readlist.json)。比對現有索引、10/27與10/28審閱及ZIP頂層README/REVIEW的22件；按地點、人物、事件分成三批，各四概念，各預定四個新JSON，未使用每批八檔的餘額。設計線子代理0，未寫實作或派工。

先交A、再交B、最後交C。主線指出A04挪團旗讓孩子床單先乾仍與共爐房同型，已改為洗淨後衣箱錯交、跨泊架招領、歸還與賠工價的獵團港市鬧劇；修訂A04及其餘十一件全部獲主線核可。B以兩組合作關係支撐四個不同決定，C以多人行動和具體物質後果避免反覆「拒絕後維護尊嚴」骨架。依使用者當場要求以原生工具向主線回報進度，沒有寄inbox信。

## 產出

[PLAN.md](PLAN.md) 是入口；[review.json](review.json) 十二列列明檔名、id、引用、白話、主動作、欄位、具體去重與風險。[A-places.md](A-places.md)、[B-characters.md](B-characters.md)、[C-events.md](C-events.md) 為三份可交sol的明確寫集與固定四項驗收。三批互不依賴，B僅批內雙向成對；C全部possible/rumor，不改timeline。

[證據](evidence.json) 保存29筆近鄰字段與檔案SHA256；[靜態驗證](validation.json) 六項均exit 0（12件／3類、白話≤60字、引用存在、檔名id、無跨批依賴、C可能事件標記）。文件嚴格檢查 `bash wf/tools/wf-lint.sh --strict .` exit 0，broken/oversize/biglist/querycmd/local/residue皆0；四筆BIGLIST-LINKS為既有導航警告，見 [原始輸出](wf-lint.txt)。`git diff --check -- wf/workflows/dispatch/handoffs/fill-plan-1028-next` exit 0；未追蹤產物另外以JSON解析與行尾空白檢查補核，不把空diff當已驗全文。

全部本線寫入限 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/fill-plan-1028-next/`；[scope.json](scope.json) 記錄平行工作樹狀態。未stage/commit/push，沒有本線範圍外寫入。最後件數容量與資料表檢查記在validation.json，限30檔／2MB。

## 證據不足

去重是索引篩選及列明近鄰字段的語義比較，不是全庫逐句審閱。ZIP比對限README/REVIEW的22件介紹與名單，未讀patch或用整包實作當證據。C04對共灶斷煙只核summary，A04對換禮角引用10/28 W02審閱；都在欄位標明，不冒稱全文。平行sol產出的稿件仍須再次去重。

未跑npm、遊戲／lore實作檢查、content_gate、content_accept、MCP、probe或黃金；本線只有設計文件，實作與整合由sol領導依交接驗收。主線通報22件輕量／窄測綠不等於舊整合限制消失。開始時main有其他未提交文件，結束時HEAD與工作樹亦有主線平行變化；沒有宣稱全樹clean或把他線差異當本線成果。

## 需要決定

本輪沒有未決設計阻塞：主線已明確核可十二件。後續由sol依三份寫集產稿，主線統一處理manifest、索引、領地、驗收與提交。既有P01失腿矛盾、尺寸缺口及舊整合待辦不在本線裁決範圍。

依最新指示，本輪收尾後立即親讀night-combat-plan-1028交接，接續兩機甲／兩怪獸的有界設計；新任務另立產物，不擴張這份十二件計畫。

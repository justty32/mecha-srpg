# worker 任務模板（未核可，不可派送）

用途：主線核可後複製成 briefs/ 的正式交接書。先將批次、四條內容路徑、worktree、核可 PLAN/review、REPORT 絕對路徑及範本凍結，再跑 brief_lint；本檔不是可執行任務。

先讀：隔離樹 AGENTS.md、wf/WORKFLOWS.md、common/user.md、common/user/working.md、content/README.md、content/batch.md、content/lore-text.md、world-pillars 與相關子檔、content/lore/README.md、style.md、適用 style 子檔、核可 PLAN/review 及同類範本。正式 brief 改為完整絕對路徑，REPORT 首段完整已讀清單。

## 目標與寫集

sol 只實作一批、一類別、四檔 night 前綴 lore。僅寫 manifest 凍結的四條隔離內容路徑與主線核定本線 reports/ 子目錄；不自行新增第五檔、其他類別、timeline、既有內容、base、引擎、schema、spec、art、依賴、SESSION、CLAIMS。四檔合計最多64KB、每檔16KB；報告及證據最多2MB，超額先回報。子代理上限0，不占額外工人。

## 工具與工作

用 rg 與 tabledb 有界查詢同類現有內容。寫前比對計畫指定近似候選，核每個引用存在；gameRefs 除格式還查實體。每檔有具體行動與後果，遵守已核可情節，不自行擴充世界設定。產出 naming.json、wf-table/1 review.json 及去重證據，指出候選檔、具體鏡頭與差異；所有附件放報告白名單，隔離樹只放四份內容。

完成後只做授權的 lore check，留真實命令與退出碼；不跑 npm test、node --test、wiki單檔、sim/fuzz/probe、build/e2e，不開重負載、不開GUI、不操作鍵鼠螢幕、不下載、不刪檔、不動git索引、不commit/push/reset/stash/rebase。領導統一跑 gate 與 content_accept lore/readlist，保持 manifest draft、integration pending；工人不得自行宣稱接受。

## 交付與固定三條驗收

REPORT 寫到正式 brief 凍結的絕對報告路徑，四段含已讀清單、件數與路徑、去重與命名、驗證退出碼、限制及待決定。原生工具回傳 DONE/BLOCKED/FAILED，不寄信。

1. 四份核可 JSON 存在，id／night前綴／引用與計畫一致，既有檔無改動。
2. review、naming、語義去重證據與 REPORT 齊全；lore check 附真實結果，不冒稱全套通過。
3. 沒有範圍外寫入、git操作或重負載；22:50前停止產出收件，未完成稿保留並明列。

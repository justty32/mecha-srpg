# 第3輪怪獸內容交付 — draft

## 已做

已讀清單（manifest mustRead 五份，皆為主樹新版全文）：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/style.md`

親讀指定交接書、適用世界觀子檔、怪獸與潤飾規矩，並用核准計畫的四檔同級範本產出。延伸閱讀清單與逐概念全文路徑、SHA-256、關鍵事實已存於 [review.json](review.json)，未將長表複製進本文。規劃三列 `category=monster`／`decision=adopt`，領導審核對應三列 `category=monsters`／`decision=approve-with-constraints`，均已核對。

主樹 48 種 species（含 wl-* 與先前 wn-*）已掃描骨架及能力組合，三組能力皆無完全相同項。最近候選另讀全文，比對目標形態、AP、冷卻、傷害型、骨架與捕捉弱點；不同名稱、地點不作實質差異。

## 產出

完成針扇 D、旋沫 C、垂帆 C 共 3 概念，各有 species、monster、bio frame、corpse frame，共 12 個新 JSON，精確對應計畫 targetFiles。檔案位於 `.git/wf-worktrees/wn-r3-monsters-1027/content/`；本線未寫主樹 content。正式退修後，三篇 species.etymology 全部重寫：針扇由記錄員核對針雨與掃砂兩份證詞；旋沫由船長在採樣委託中割纜撤人，空手返船；垂帆以修理棚拆甲與補修費責任爭議為主，遭遇只在工單及證詞中回溯。十二檔機制資料均與退修前相同。

[review.json](review.json) 與 [naming.json](naming.json) 各 3 概念列；白話最長 35 字。英文原名、命名意涵、中文種名及配套登記式名稱均留存，D/C 個體無 name、epithet 或 named。活捕本能池與 burden 沿同級範本；屍改 pools 為空、burden 為 0，並保留 kaiju。

固定驗收第 1 條：Python 靜態檢查通過，核 JSON 格式、id／檔名、精確 12 路徑、HEAD 或本批引用、grade／capture／能力一致、AP 成本、骨架 HP／末層 structural／core／拘束與座艙槽／pilot 座、本能池與屍改。13 個外部直接引用在 HEAD 存在，且隔離區同檔與 HEAD 相同；無 wl-* 或其他批 wn-* 遊戲引用、無既有追蹤檔改動。

固定驗收第 2 條：主樹 content_gate 對指定隔離區與唯讀 manifest 回傳 0，結果 `approved=12 violations=0`；本 worktree 的 git diff --check 回傳 0，新檔亦由 Python 核對無尾端空白。

固定驗收第 3 條：本報告、兩張逐件表已完成；全文證據 hash、各表恰 3 列、白話長度均已核對。退修依據、舊文封存路徑及 hash、新事件與差異已存入 review 的 proseRevision／dedupComparison，三列舊文決策皆為 reject-scene-pattern；這次重寫仍待主線重審。新內容與三份報告合計低於 1 MB，內容件數 12，未超出 manifest 的 20 檔上限。

## 未做與不足

首稿的敘事已被主線拒用：三篇共用岸邊發現、兩機試招與冷卻教學、拘束／屍改手冊的場景骨架。垂帆另與斜帷的亮衣初見、雙機打弱側、鎖囊結尾過近。退修時再次親讀斜帷全文，垂帆重寫為修理責任事件；另外兩篇亦更換主要視角、衝突與結果。無關場景的二名、捕捉及屍改排除說明只留資料審核，不塞入正文。

全批維持 **draft**，數值僅同級暫填；整合、平衡、AI 實際選招、試玩與正式驗收留回家。依本線授權未跑 node、npm、loader、ops、測試、typecheck、build、sim、probe 或 MCP；以上靜態檢查不等同完整 accepted。未改引擎、schema、spec、manifest、索引或既有內容，未新增骨架、能力、效果、規則、配件；未開子 agent、未 commit 或 push。

補讀原招全文發現規劃比較有一處誤記：`content/base/abilities/kx-split-fin-rush.json` 在 HEAD 的 cooldown 實為 2，並非計畫所述無冷卻。因此旋沫相對岔鰭的差異改以「同 3AP／CD2，單體 pierce18 換定向 cone acid10」表述，兩者都有傷害空窗，不能以新增空窗作為差異。相對沫顎／礫鬃，拿掉其單體填空的取捨仍成立。內容沿核准能力配置，未改原招；更正證據與處理存於 review 的 planCorrections。

## 需決定

本線沒有新增機制需求。領導收件時請重新審閱三篇新敘事，並採用上述冷卻更正，避免繼續沿用計畫對分水追咬的誤記；三概念敘事基調、數值平衡與正式整合留待後續審閱及回家驗收。本報告回傳 DONE，僅代表本線三條有限驗收完成。

# cx-hl-eh 完成回報

## 已讀清單

`AGENTS.md`  
`wf/workflows/common/user.md`  
`wf/workflows/common/data-files.md`  
`wf/workflows/content/world-pillars.md`  
`wf/workflows/planning/design-notes/terms.md`  
`wf/workflows/dispatch/handoffs/talk-world/HANDOVER.md`  
`wf/workflows/dispatch/handoffs/talk-world/REPORT.md`  
`wf/workflows/planning/design-notes/world/essence.md`  
`wf/workflows/planning/design-notes/world/scale.md`  
`content/lore/timeline.json`  
`wf/workflows/dispatch/handoffs/lead-history-lines/guide.md`  

HANDOVER 第 2、4、5、7 節全讀；timeline 的 127 條以完整記錄分三批讀完。另已親讀 wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/WORKFLOWS.md、content 工作流入口及 inbox README／PROTOCOL。terms-rename.json 已用指定工具查「背面」，該查詢只返回月面地理的墟帶列；勢力「月之暗面」依 HANDOVER 第 2 節與 guide 使用，未把地理義一起換名。

## 做了什麼

完成 E 魂、F 蝕線與歸還、G 傘政治、H 信仰四篇六期因果敘述，以及四列 wf-table/1 資料。各篇末段保留尚未定的事，裁示、暫值、提案與傳聞分開敘寫。五個內容產物之外，僅按交付段明列要求附本 REPORT；未另加內容產物。既有檔未修改，未 commit。

HANDOVER 7.85–7.94 的逐節點摘錄及 E–H 涉及線、摘句存於 `/tmp/cx-hl-eh/node-excerpts.json`；核對腳本為 `/tmp/cx-hl-eh/check.py`。每寫完一線均跑該腳本、wc -c 與指定 inbox_poll；截至四線與資料檔完成時未收到新 orders。

固定五條驗收：四篇各六期加未定段、大小合範圍；逐字引用零錯；必經節點全覆蓋且各有 N10；資料能由 tabledb 讀出四列與指定欄位；本段已讀清單逐行列完十一個路徑。未增加其他驗收，也未跑導覽連結檢查；導覽與資料路徑依交接書保留統稿後的相對位置。

## 每條線經過的節點與引用的年表條目

E：N03、N04、N07、N08、N09、N10；-8900、-8850、2029、2041、2089-05、2090、2091、2093-02、2093-04、2097、2098、2099、2101、2102、2104、2105、2106、2107、2108-01、2108-03。

F：N01、N05、N06、N08、N09、N10；-8900、2041、2089-03-14、2089-04、2090、2093-06、2093-02、2094、2096、2099、2101、2104、2106、2107、2107-11-15、2108-05。

G：N01、N02、N03、N04、N05、N06、N07、N08、N09、N10；2029、2041、2043、2077、2089-03-14、2089-04、2089-05、2090、2093-02、2093-04、2093-06、2096、2097、2099、2101、2102、2105、2106、2107、2107-08-15、2108-06。

H：N01、N02、N04、N05、N06、N07、N10；-8900、-8850、2089-04、2089-06、2089-05、2092、2094、2095、2096、2097、2099、2100-10-15、2101、2103、2105、2108-03。

## 核對腳本輸出

```text
e-soul.md: bytes=5295; periods=6/6; refs=26; ref_errors=0; nodes=N03,N04,N07,N08,N09,N10; missing_nodes=0; errors=0
f-rift-line.md: bytes=5814; periods=6/6; refs=24; ref_errors=0; nodes=N01,N05,N06,N08,N09,N10; missing_nodes=0; errors=0
g-umbrella.md: bytes=6306; periods=6/6; refs=28; ref_errors=0; nodes=N01,N02,N03,N04,N05,N06,N07,N08,N09,N10; missing_nodes=0; errors=0
h-faith.md: bytes=5977; periods=6/6; refs=23; ref_errors=0; nodes=N01,N02,N04,N05,N06,N07,N10; missing_nodes=0; errors=0
TOTAL errors=0
GATE 4: tabledb readable; rows=4; columns=8; schema_errors=0
GATE 5: REPORT first section; read_paths=11/11; errors=0
```

## 斷鏈風險

E 崩年最薄：沒有當期機魂條目，文內明寫缺口，以抗性之證、夸父煉法、衍一聯合與衍一下線建立承載條件接到 N03（提案）；不宣稱崩年已有魂人格。前史以先民刻痕與公司治理接入，不把古代機當成機魂製品。

F 前史尚無歸還組織，以先民封蝕、月面人口開門的裁示接到孟買失守。2108-05 第二次攻勢只有傳聞，之後到 N10 沒有已定戰役，以既有兵力、補給、信用爭奪承接（提案），未杜撰中間戰果。

G 前史靠地月經濟與國家退出軌道的 7.9 提案；開局後最薄，幽冥鐵騎仍是傳聞，到 N10 以評等、軍售、債與停戰慣例持續拉扯接上（提案），沒有增加新協定。

H 開局後沒有已定的新宗教事件，文內明寫，以三方對共同來源的不同讀法延續到 N10（提案）；同夜同影像是 HANDOVER 第 4 節第 8 題暫值，未補影像內容或改宗結果。

## 待和解候選

R01：guide 與 HANDOVER 7.94 已指出每 52 蝕月與幾十年一次的衝突；本線只接第 40 蝕月這次，不推算往後週期。R07 分期照 guide 使用 7.6 版；R09 漲潮／大潮照 guide 用詞，沒有替使用者確認兩版原話。

R02：HANDOVER 7.89、7.93 的撒南傘委託與全球發牌角色，對上 timeline 2107｜綠線清剿只明記殘聯聯合清剿；保留跨傘授權提案。R05：HANDOVER 7.90 三支歸還黨，對上 timeline 2101｜新加坡會議與蝕線協定與後續只明寫一個歸還黨；三支未作既定史實。R06：同節第二次會議 2106 在奈洛比，對上 timeline 2106｜殘聯成立未述會議沿革；不替它補成既有條目。

R08：scale「各洲一把傘」仍六把，HANDOVER 第 2 節已改十五把；第 4 節 1／1.5 的亞洲、南亞與雙籤城讀法，對上 timeline 2106｜殘聯成立的奈洛比地點，仍待統稿。G 採 guide 的十五傘三型，雙籤城等保留暫值／提案。

R03：HANDOVER 7.91 提「搬七號魂進鐵偶、失敗死人」，timeline 2105｜白手套事變只確認鐵偶無魂與複製一直失敗。HANDOVER 同節把無肉者對象擴為鐵偶與魂，timeline 2105｜無肉者宣言僅明寫魂；E、H 均區別提案與條目。相關前身差異：timeline 2098｜靜海大罷工明寫人駕白手套原型，HANDOVER 7.88 的失敗月防副產品讀法未交代人駕原型到無人鐵偶的過渡，本線沒有補事件。

R04：HANDOVER 7.91 的七號紋路／同源，對上 timeline 2108-03｜（傳聞）阿鏽的魂核來自月面殘骸；現行年表並未證實與七號同源。timeline 2106｜阿鏽育成已寫各有過去且不可複製，HANDOVER 的公司以「複本」行銷說仍是提案，不能沿舊字把複本當能力。

新候選：essence「機魂不能獨駕」與 timeline 2104｜第一個登錄機魂的死駕駛員回港紀錄仍有張力；現行年表明說唯一未解，不可自行導出例外機理。timeline 2101｜老爹登錄早於名為「第一個登錄機魂」的 2104 條目，兩者登錄範圍未交代；敘述保留標題，不替它改成新的制度區別。

新候選：HANDOVER 7.89 把殘翼轉型精粹矢放在拉哥斯之夜後，timeline 2093-07｜殘翼航空開業已是精粹矢空援券；本線只引用拉哥斯空襲失敗的既有結果，未採先凡鐵後精粹矢的時序。該節並誤寫殘翼起於 1993；timeline 為 2093。HANDOVER 7.88 的銀環骨架年份寫 1999，timeline 2099｜銀環-G1 入型錄為 2099；本線沒有照抄錯年。

新候選：HANDOVER 7.87 的同時下線三港為漢堡、鹿特丹、伊斯坦堡，timeline 2093-09｜堅盾-I型 普及是漢堡、伊斯坦堡、達卡；G 未選邊改城市名。HANDOVER 7.89 把綠線賣子體寫每大潮，timeline 2101｜綠線開始養裂已改每漲潮；F 只按現行條目描述生意，未復原舊頻率。

## 沒做到或證據不足的

沒有未完成的固定交付；沒有把提案當既定歷史，也沒有對 N10 補出新事件。上述銜接只能證明現有材料可形成連續敘述，不能證明提案已獲裁示；魂的身分、第二次攻勢結果、傘的具體分配與共同影像內容均保留。timeline 是 lore-timeline/1 的 entries 結構，首次 tabledb metadata 讀取不能分頁 entries，故改用 Python 分三批讀完 127 條；這是資料格式差異，非工具壞掉。四列產物以 tabledb Python 介面寫入並由 CLI 讀取。

## 產出（檔案路徑 / commit / 分支）

目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-history-lines/cx-hl-eh/`。四篇為 `e-soul.md`、`f-rift-line.md`、`g-umbrella.md`、`h-faith.md`；資料為 `history-lines.part.json`；行政回報為本 `REPORT.md`。無 commit、無新分支。摘錄與腳本只放指定暫存目錄。

## 需要對方或使用者決定的事

請領導統稿時收納上述既有 R 編號與新候選；本線未改任何既有來源。完成這五條驗收不依賴先解決那些世界觀問題，故以 DONE 交付，沒有另加需要使用者先回答的門檻。

## 以後交接書該點名的工具

Python 標準庫 json 分頁讀取 lore-timeline/1 的 entries；tabledb 適用四列 wf-table/1 產物，但直接讀 timeline 的 metadata 會輸出整個 entries，宜在交接書先交代格式差異。

## 修訂輪

依 `wf/inbox/orders/cx-hl-eh.md` 的 2026-10-24 18:50、19:00 order 修訂既有四篇與 part.json，沒有重寫或新增內容產物。上方保留第一輪紀錄與當輪驗收；涉及新暫值與 R01 的舊描述，由本節及修訂後產物取代。本輪親自重讀交接書、guide、已讀清單全部來源，含 HANDOVER 第 2、4、5、7 節、第 8／9／10 條與 14.3／14.4；timeline 127 條完整分三批重讀，terms-rename 仍用指定 tabledb 查「背面」。

E 補魂核等級決定天花板、養成只填滿、換核即換人、S 級才有「我」的暫值；補辰星起霧的無籤會通訊窗，但未替 2108-03 傳聞指定星候日期。S 級機魂也聽見微弱聲音、可能解釋七號 2104 回港，依第 8 條 (3) 仍標提案留旗，不推翻不能獨駕的裁示。

F 補 2104 撤空援對上太白晝見、撤走精粹矢那一擊；F、G 都納入已暫定成立的孟買神權城（中心迦梨）與拉哥斯外圍綠線殘部蝕匪邦。G 補太白晝見增加傘際事件與人對人契約、生物系在撒南傘成主流。上述第 9 條內容均標暫值，未另造成立年份或戰役。

H 明寫迦梨是一台古代機、沐蝕會全錯但握著真貨、外界不知道它是真的；孟買神權城改為已暫定成立。補承擔煉在迦梨面前做人當爐、留疤、再撐會瘋，最多升一級且不到 S；達卡 2103 與吉大港 2105 解拘之夜同為鎮星合月。保留第 40 蝕月所有醒著的古代機向半徑內所有人放同一影像、三個教義第一次聽見同一件事的暫值，影像內容與回應仍留白。

R01 已和解：四篇與四列資料一致採「連珠潮只排開局後第 40 蝕月一次，之後靠湧現、不每 52 蝕月重排」（暫值），不再列為待決週期。魂核規則與蝕域內兩國也已從未定項移除；R02–R09 其餘既有差異仍按原證據保留。essence.md「未定」段的魂核／祕法、scale.md「未定」段的天象／蝕域內國，已由 HANDOVER 第 4 節第 9 條暫值取代；本輪只修自己的產物，來源更新交統稿處理。各線節點與年表引用集合未變，沿用上方逐線索引；斷鏈風險仍是既有材料薄處，未補新事件填空。

海洋設定只在此報告：18:50 order 將第 10 條列為討論中、明令不入敘述；本輪讀到 HANDOVER 第 2 節、第 4 節第 10 條及第 5 節 14.2 已更新為裁示／授權暫值。依 order 指定範圍，未納入四篇或 part.json。它可能影響 F 的核心與蝕線地理、G 的港口與安全海分工，以及 H 解拘事件的河口背景；聖保羅核心與浦那擴張等需由上游後續統一，未在本輪代改。

固定五條驗收完成，以下均為本輪實際輸出：四篇各修完即用原 `/tmp/cx-hl-eh/check.py` 核對並跑 `wc -c`、`inbox_poll.sh cx-hl-eh --once`；四列透過 tabledb 介面更新並由 CLI 讀取，欄位順序與 link_columns 正確；第 4、5 條另以 `/tmp/cx-hl-eh/check-table-report.py` 核對。沒有新增驗收項目。

```text
e-soul.md: bytes=5798; periods=6/6; refs=26; ref_errors=0; nodes=N03,N04,N07,N08,N09,N10; missing_nodes=0; errors=0
f-rift-line.md: bytes=6150; periods=6/6; refs=24; ref_errors=0; nodes=N01,N05,N06,N08,N09,N10; missing_nodes=0; errors=0
g-umbrella.md: bytes=6833; periods=6/6; refs=28; ref_errors=0; nodes=N01,N02,N03,N04,N05,N06,N07,N08,N09,N10; missing_nodes=0; errors=0
h-faith.md: bytes=6401; periods=6/6; refs=23; ref_errors=0; nodes=N01,N02,N04,N05,N06,N07,N10; missing_nodes=0; errors=0
GATE 4: tabledb readable; rows=4; columns=8; schema_errors=0
GATE 5: REPORT first section; read_paths=11/11; errors=0
```

本輪無未完成的交付、無阻塞，未 commit。產出仍為原五個內容檔與本 REPORT；可回報 DONE。以後交接書該點名的工具沿用前節，無新增建議。

## 第三輪

依 `wf/inbox/orders/cx-hl-eh.md` 的 2026-10-24 19:10 order，原地修訂四篇與 `history-lines.part.json`，未重寫。已重讀交接書、guide、HANDOVER 第 2 節末段、第 4 節第 10 條及第 5 節 14.2，並親讀前列十一份必要來源；timeline 127 條以完整記錄分三批讀取。本節取代前輪「海洋設定只在報告、尚未納入」的處理，早先紀錄保留作歷史。

F 前史改為蝕從海來、墟在內陸高處；N01 明寫「同夜不同處」，以「先民把門推向海、把答案埋進山」（提案）銜接。三大核心均為港，聖保羅核心改讀桑托斯灣區；蝕線＝海岸線、港口最險最值錢，城往內陸退、野地住內陸卻遠離海邊獸源精粹，歸還黨要收的是港。浦那陷落接回孟買蝕域多年內陸擴張，既有攻勢、貸款、神權城與蝕匪邦因果保留。

G 補安全海三海與北非、西亞、南歐相對安全，將歐傘大西洋岸／地中海岸分裂接到造機與用機的負擔差異。伊斯坦堡改當堅盾產線城；引用年表原名「2107-04-15｜九門同喪」，敘述明示九闕喪鐘搬至聖馬洛（依 14.2 改讀）。補群島與日最慘、俄北極岸冰封、中亞墟多獸少、長江口江口夜屬潮湧例外；內陸另留菌絲族，五湖與雅庫茨克由此成立。兩棲機甲、海上獵團地位上升接入守港與護航的援軍分配。以壓縮既有解說容納修訂，未刪必經節點。

E 只在月面前線地理句補月海為月亮的「海」；H 只補大裂谷的內陸高處墟、浦那擴張方向及達卡的河口潮湧背景，未把 2097 騎手襲擊寫成浦那當年已陷落。四篇地點搬移或改讀均標「（依 14.2 改讀）」；沿用既有提案／暫值標記，不添新人名或事件。part.json 透過 tabledb 更新 F、G 摘要，E、H 摘要原意與欄位未變。

本輪來源差異交統稿收納：HANDOVER 7.85 仍寫裂縫與墟同處，timeline「-8900｜先民封蝕」仍寫一起埋地下，均依第 5 節 14.2 改讀為同夜不同處、海岸與內陸高處分開；timeline「2090｜聖保羅失守」及「2101｜新加坡會議與蝕線協定」的聖保羅核心改讀桑托斯灣區；timeline「2107-04-15｜九門同喪」仍寫伊斯坦堡，依 14.2 搬聖馬洛。這些已有改讀指示，不再列為等待裁示的新問題；年表本身未動。R01 已和解，其餘既有 R 編號與未決事項沿用前輪，未自行裁決。

各線節點集合與斷鏈風險未變；G 年表索引新增 date 2107-04-15（九門同喪），其餘各線引用集合不變。未查潮差實測數字、未上網，未將潮差門檻寫成實測結果；該資料仍由上游指定線處理。本輪只執行固定五條驗收，無新增 gate。四篇逐檔修改後即跑原核對腳本、wc -c 及 inbox_poll；以下為第三輪實際摘要：

```text
e-soul.md: bytes=5909; periods=6/6; refs=26; ref_errors=0; nodes=N03,N04,N07,N08,N09,N10; missing_nodes=0; errors=0
f-rift-line.md: bytes=6582; periods=6/6; refs=24; ref_errors=0; nodes=N01,N05,N06,N08,N09,N10; missing_nodes=0; errors=0
g-umbrella.md: bytes=6936; periods=6/6; refs=29; ref_errors=0; nodes=N01,N02,N03,N04,N05,N06,N07,N08,N09,N10; missing_nodes=0; errors=0
h-faith.md: bytes=6725; periods=6/6; refs=23; ref_errors=0; nodes=N01,N02,N04,N05,N06,N07,N10; missing_nodes=0; errors=0
```

```text
GATE 4: tabledb readable; rows=4; columns=8; schema_errors=0
GATE 5: REPORT first section; read_paths=11/11; errors=0
```

tabledb CLI 已讀出 wf-table/1、4 列、指定 8 欄及 link_columns＝敘述_path。固定五條全部完成；無未完成交付、無阻塞，未 commit。產出仍為五個內容檔加本 REPORT，未增內容檔。以後交接書該點名的工具：沿用前節，無新增建議。本輪以 DONE 回報。

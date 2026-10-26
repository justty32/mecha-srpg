# cx-dd-plan：去重與矛盾統一計畫

本線只產出計畫，沒有修改 lore、base、設定筆記、索引或程式碼，也沒有 commit。逐條證據、處置與欄位見 [findings.json](findings.json)；[delete-candidates.json](delete-candidates.json) 為空，沒有實體檔需要合併刪除。主題前綴 A01–A22 對應交接書的 22 項，A03 拆成台數與倒數，A22 按裁定拆列；A23–A25 是追加發現。

## 1. 已讀清單

以下交接書指定來源皆由主線親讀，未以子代理摘要代替。

規矩：[AGENTS.md](../../../../../../AGENTS.md)、[WORKFLOWS.md](../../../../../WORKFLOWS.md)、[使用者偏好](../../../../common/user.md)、[content 入口](../../../../content/README.md)、[batch](../../../../content/batch.md)、[polish](../../../../content/polish.md)、[lore-text](../../../../content/lore-text.md)、[lore README（含可見度）](../../../../../../content/lore/README.md)、[style](../../../../../../content/lore/style.md)。

裁定與收線：[fill-rulings 全部裁定](../../fill-rulings.md)、[lead-fill REPORT](../../lead-fill/REPORT.md)、[lead-aegir REPORT](../../lead-aegir/REPORT.md)、[lead-fill-am REPORT](../../lead-fill-am/REPORT.md)、[lead-fill-af REPORT](../../lead-fill-af/REPORT.md)、[lead-fill-ea REPORT](../../lead-fill-ea/REPORT.md)、[lead-fill-mech REPORT](../../lead-fill-mech/REPORT.md)、[lead-fill-kaiju REPORT](../../lead-fill-kaiju/REPORT.md)、[lead-epic-land REPORT](../../lead-epic-land/REPORT.md)。

設定筆記：[history-lines](../../../../planning/design-notes/world/history-lines.md)、[polity](../../../../planning/design-notes/world/polity.md)、[city-types](../../../../planning/design-notes/world/city-types.md)、[aegir](../../../../planning/design-notes/world/aegir.md)。

另讀 [SESSION-LOG](../../../../../SESSION-LOG.md)、[WAIT_USER](../../../../../WAIT_USER.md)、[data-files](../../../../common/data-files.md)、[inbox 入口](../../../../inbox/README.md)及 [PROTOCOL](../../../../inbox/PROTOCOL.md)、[team-model](../../../../team-model.md)、[world-pillars](../../../../content/world-pillars.md)，並按主交接書進行查證。三名唯讀子代理各親讀 AGENTS.md、user、content 入口與 lore 規則後提供證據；只有主線寫這三個產物。

## 2. 掃描方法

[files.tsv](files.tsv) 無標頭，共 211 列、198 個相異路徑；含 161 個 lore 實體與共用年表，另有 base 檔。以它界定新批次，對全庫 366 個 lore 實體解析 id、name、aka。比較原值及移除空白、分隔符後的名稱，查同種類同名及跨種類別名；再按事件日期、地點交集篩候選，讀 summary、body 與 consequences 分辨同事件、前後階段或不同地區的制度實例。

以 grep -rn 查人名、地名、年份與外購片語；年表按日期＋title 定位，不依賴會因插入而位移的數字索引。先比裁示，再比年表、設定筆記與事件因果。A17 是明示的年表例外：舊年表寫 2105 火併，事件卻在 2106 浦那陷落之後才開戰，至少六份人物／勢力檔同採 2106，因此計畫改年表年份與時代。雅庫茨克則依授權選 2100 夏失守，銜接 2091 保城命令與白夜首次發光、首燒。

提案掃描限四份指定 world 筆記與七線交付檔，另對 lore 全庫檢索「提案」。lore 只有 aegir-wakes 的 hidden secrets 留「歸矢」提案名；其他已裁定事項沒有可替換的字面標記，不憑 REPORT 曾稱提案就往玩家正文塞「已定」。筆記裡仍待替換的是 aegir 的抵押讀法（C01）。C02–C16 逐處保留未裁定標記；C17–C36 逐檔、逐欄列出指定提案名及新機型／物種名，維持送審。丹佛、古巴歸拉美與哈瓦那國屬港的裁示已按既有內容讀，不再列待決。聲望取得及非核心件營運屬另一條開發線，本計畫不改 base。

禁忌只查設計層用字、直譯慣用句與其他作品類比。新檔未命中這些明顯禁忌；七份舊檔的技能樹「節點」收成 T01–T04，沒有追加一般文筆潤飾。

**工具限制已回報並有替代查法。** 指定 tabledb.py 的 load 只把 rows 當資料列，直接對 timeline.json 的 entries 執行 grep 會誤回空。本線已發 BLOCKED 告知上游，再以同工具 load 讀取的 meta.entries 在記憶體建立 Table(rows=entries)，沿用條件 grep；不改工具、不產生轉檔，未把空結果當證據。TSV 用 csv.reader 的 tab 分隔讀取；本線最初誤用 tabledb 讀 TSV 已自行修正。findings 的建立與更新使用 tabledb API。

現況唯讀基線：node content/lore/check.ts 回 errors=0、warnings=3；警告是 busan-returned-seal、dark-quay-surety、gold-reef-night 未入年表。只有最後一項有本交接書裁定，已列 A22b；不擅自擴大到另兩項。每完成工作步驟已輪詢 cx-dd-plan orders。

## 3. 統計

findings 共 **91 列**：矛盾 38、重複 13、提案 36；另有禁忌 4。改法為 text 25、array 1、struct 2、timeline 5、needs-user 8、keep 50；merge 0，刪除候選 0。三類中有些列是核實已落地或排除誤判，keep 不代表漏處理。

沒有重複 id 或同種類同名實體。實際收斂包括四列設定重述／年表處置：B01 合掉同一砲台修復的兩筆年表，B02–B04 收斂外購規則；其餘疑似重複各列明保留理由。

## 4. needs-user：八項各兩個選項

**A01 葛西蓮。** 一、保留男性，把事件的「她」改成「他」；二、定為女性，把人物檔的「他」改成「她」。兩案均保留妻子與孩子。

**A03b 下次漲潮。** 一、採三天，船地點跟葬禮、鐵姨一致；二、採十一天，葬禮小節、對白及鐵姨回憶一起改。年表沒有寫到日，無法代選。

**A05 浦那接應兵。** 一、二十人去、十九人回，把「半個連」改掉；二、保留半個連，人物寫回來少一人。四十個孩子是收容人數，三萬是總撤離人數，兩者都不改。

**A06 老桂守廠。** 一、採堅盾-I，改賽義德回憶與達卡地點；二、採犁，改戰役本文。法蒂瑪駕犁不受影響。

**A08 法蒂瑪上任。** 一、保留四十五歲，即 2101 接手已經守城的公會；二、保留公會還只討薪時就任，改成崩年前上任、刪四十五歲。

**A09 綠線封口。** 一、封口成功，地點只剩漏網子體；二、封口失敗，改事件結局與後果，保留地點仍冒新獸的現況。

**A13 劍魚-V5。** 一、B 級試作，2105 是少量試作機出戰，2108 未正式供貨；二、A 級已在役，刪仍試作，級別與供貨時間另交開發線同步。年表沒有 V5 專條可裁決。

**A25 燕鷗血統。** 一、採年表的長槍改型，機甲線另統一血統；二、採夸父直系，改年表與霍華德人物敘述。長槍銀環藍本的裁定沒有順帶裁定燕鷗。

這八列只列選項，下一工人須等裁定才改相關爭點；其他明定列可先執行。提案名依任務保持送審，不因此增加 needs-user 列。

## 5. 下一工人的分批建議

**先處理事實，再刪重。** text 批先做 A 類已定文字修正與 C01；struct 批處理 A04 的 founded／建哨敘述及 A22l 的 occurs: possible。同檔已有其他文字修改時，由同一工人合併落地。這不是純 polish 全包：founded、occurs、年表與 consequences 要按各自改法安排授權範圍。

**年表集中一批。** A17 改火併年與 era，保留浦那→火併→停火的同年因果；A22b 加金山夜；A22h 寫中間人供貨；B01 留一筆砲台修復並接 event；B04 縮兩條通用機摘要。按日期＋title 精確定位，避免整份覆蓋。B04 明定保留 A22h 的黑幫進貨例外。

**再做重複與禁忌。** B02 改文字，B03 按原句改四檔 consequences、保持陣列長度，T01–T04 換設計層詞；完整外購設定留 bulwark-ii-standard 的 body。沒有 merge 批；delete-candidates 為空，不刪實體檔、不改實體引用。

會被多條改到的檔：migrant-crew（A03a、T02）、bay-seventh-post（A04、A24）、yakutsk-bed（A11、A20）、mimic-works（A14、A16）、shield-open-carving（A16、B02）；bulwark-ii-standard、bulwark-first-workshops、longspear-v4-standard、hound-ii-license 都有 B02／B03；timeline 有 A17、A22b、A22h、B01、B04。待決裁定後，molly-van-den-berg、migrant-bird、bay-seventh-post、busan、timeline 等還可能再改，須重讀當時原檔，不能套回舊全文。

## 固定三條驗收紀錄

1. plan 含上述五段；兩份資料表為合法 wf-table/1 JSON，欄位符合交接書。
2. A01–A22 全部有列，處置非空、證據標示來源；A03、A22 的拆列均保留對應編號。
3. 所有非空目標都指向存在檔案；needs-user／keep 的空目標符合例外。

件數與容量上限照交接書控制，未增加驗收條目。交付後依指定 inbox_mail.sh --up DONE 回報列數與 needs-user 數；BLOCKED 的工具不相容已用唯讀記憶體查詢繞過，原工具問題仍留待其維護線處理。

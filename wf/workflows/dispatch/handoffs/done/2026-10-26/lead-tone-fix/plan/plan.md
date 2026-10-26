# cx-tf-plan 第二輪正式計畫

已讀清單（均親自讀取、相對 repo 根；表以指定工具查列，包含可見度／occurs、晚段裁示及 needs-user 八列）：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/verdicts.json`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/review-guide.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/plan/findings.json`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/cx-tf-plan.md`

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、data-files、inbox／PROTOCOL；已讀上一輪 plan.md，沿用四撤件、提克西、漲潮錯處及兩物種定位。本輪未派子代理；產物僅本目錄六檔，信箱投遞依交接書授權。

## 已定內容與件數

第二輪更正優先：verdicts 為 36 列；base 只列轉交表；既有檔上限 75。完成 90 列 items（66 既有檔、5 新事件），14 筆年表操作、67 列白話審核、11 筆跨線轉交；整包低於 200 KB。

以帳為主角採 Fable 約 70 件為基線，估計改後約 50（合理區間 48–54），不是全文關鍵字計數：四件隱藏減四；另十六件把主畫面轉為人與物，約再減十六。後者是七個美洲地點，加政府進山、改名的日子、墨西哥城徵召令、莉維亞、空城押契、江口、杜拜、庫爾納、蘇拉特掛鑰。制度仍存在，不因改主畫面抹掉債與徵召。吉布地、井城及機甲史改善不另重複扣件。

地契掃描除點名檔外，另納還鄉院、歸還黨、內陸財團、鳳凰城與三寶顏傳聞。紐約及聖馬洛相關事件／人物保留代表性史實；阿爾卑斯家族地產、埃吉爾抵押是別件事，不套用刪除。四撤件保留原檔 hidden，主檔承接內容；年表只解除 event 引用，不刪歷史。

## 方向一：五件美洲事件

西雅圖「歸船斷座夜」用既有 A 級礁角（species/reef-antler），二名「折桅白冠」來自砲座齒痕；「把港扛住！」替最後一車糧開路，獸受挫撤離，並未被凡鐵殺死。瓦爾帕萊索「斷纜夜」用 A 級青鬣（species/storm-mane），名字來自山坡窗扇隨聲震響；守城吼「山不來，我們站成山！」，以同級精粹矢換撤路，獸與裂縫仍在外港。

「借山空返」先寫向基多求借失敗，空擔架到守城夜變旗架；禁令自 2102 商路約起，不讓維拉科查出山。另兩件「雪底留名」「空碗迎船」以初雪讀名與空碗留燈補人的光，內陸不添常態獸災。兩場獸災日期均落十五日漲潮；其他三件不宣稱大潮。所有新小人物、船名與俗名只進正文，引用皆用既有檔，不造人物或 base。

蒙特婁只添刑天「動過一次」的 rumor；沒有證實甦醒、認主或裏側答案。

## 分批與交付方式

[items](items.json) 每列一檔一處置，I 為「序」；同檔多列合併施作。tf-01 專管既有檔與年表，tf-02 只管 [new-events](new-events.json) 五新檔。兩線可各自產出，合併時先讓新事件就位，再由 tf-01 唯一持有人插年表；不讓 tf-02 另寫 timeline。兩線共享已寫死的小人物與台詞。

[timeline-ops](timeline-ops.json) 的 edit 是以 date＋title 定位、用「改成」完整替換，省略 event 就刪該欄；insert 是完整新列，排序按原契約。四撤件原列繼續公開。吉布地 factions 補主檔遠牧只作後來母港的導航，摘要明說「後來」，不能寫成 2097 參加立約；雷諾 faction=null，年表用法國所屬歐傘，不改人物隸屬。

[review-draft](review-draft.json) 將全部改動的 lore 與新增事件列給人審。[base-requests](base-requests.json) 的 B 為列序（從一開始），交機甲擴充線；mechs.md、opening.md 兩檔交規劃線／頂層。未搜到 base 的「季克西」，不虛造替換列。

## 覆蓋對照

方向 1：I1–15、I78–82（五新事件）；方向 2：I16–36、I83；方向 3：I37–44；方向 4：I45–56、I58–60、B1–7；方向 5：I61–77、I84–90、B8–11；眾名成冊小調：I57。

八項依序：葛西蓮 I61；三天 I62、I84–90、B10–11；二十去十九回 I63–64；老桂堅盾-I I65–66；法蒂瑪 I67；綠線未封 I68–69；V5 試作 I70–74；燕鷗 I75–77、B8–9。年表連動見同表 edit；其他三項原年表無矛盾，不造多餘條目。

verdicts 使用原始零起算 index；以下 0–35 全數對照：

0→I16；1→I17；2→I45,I46；3→I26；4→I19；5→I24；6→I23；7→I25；8→I21。

9→I1,I2；10→I3,I4；11→I5,I6；12→I7,I8；13→I9,I10；14→I11,I12；15→I13,I14；16→I27；17→I18。

18→I28；19→I29；20→I51；21→I47；22→I33,I48；23→I36,I50；24→I49,I52；25→B1；26→B2。

27→B3；28→B4；29→B5；30→B6,B7；31→I37,I38；32→I39,I40,I54；33→I41,I42；34→I57；35→I56。

## 風險與需要決定的事

已定內容無待使用者決定。三天倒數另牽動「今天第四天」：新增 I84–90 區分巢母第四天入場與新團長第十二天接約；保留既有入場階段、第三天掛約，不把所有第四天盲改。年表同步；opening.md 的第十二天讀法已寫死轉交。未改 source 或 base 營運時間，若上游要同步遊戲時間，另派擁有者處理。

四件機甲史保留年月及公發／公刻／授權／默許差別，堅盾新圖缺料時站起的是修好的舊盾。A 級獸只加 lore 個體，不變更物種能力、精粹數值或 S 領主例外。歸矢及踏浪為岸僅定名，不將可能事件加進確定年表；其他規劃標記保留。

tf-01 含 hidden、aka 陣列與 secrets 新增、年表刪引用及 md，不能當純文字 polish 直接送閘門；領導依本表明列結構欄與檔案授權，依既定兩批執行。本線只交計畫，不跑產出線內容測試、不開 worktree、不 commit。

## 固定三條驗收

1. PASS：六檔均存在，五份 JSON 可解析；66 既有檔、5 新事件，件數及容量未超 gate。
2. PASS：方向 1–5 與 verdicts 36/36 均有對照；base 只在轉交表。
3. PASS：items 每列目標存在（五件新事件除外），71 個唯一目標均只屬一批。

僅執行上述三條，全部通過後停止驗收。

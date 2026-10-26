# 任務：在隔離 worktree 新增中日韓俄四把傘與崩年後續 14 件 lore，並在既有兩檔純插入關係（batch ea-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`（含「可見度」一節）、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/drive.md`、`wf/workflows/dispatch/handoffs/lead-fill-ea/cx-ea-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

世界框架（崩年前、國家縮而不死、三層、城邦類型、崩年的底色）2026-10-26 已定，lore 進入**填充層**。本批填**中國、日本、韓國、俄羅斯**在崩前→崩後→2108-01 的骨架：四把傘的勢力檔、7 件崩年後續事件、3 個地點，外加在兩個既有勢力檔裡純插入一列關係。年表條目**不寫進** `timeline.json`，改寫成一份待插入清單交給領導（見「交付」）。

已存在、**不重寫**的條目（只能引用）：`characters/{kuafu,tenzin-dolma,lobsang,qin-wangshu,howard-ling,kim-haneul,yoon-seoyoung,old-man}`、`events/{first-tide,kuafu-awakens,golmud-split,mimic-one,tenth-law,kuafu-mountain-vigil,gyeongju-contest,hundred-lanterns,one-banner-compact,busan-returned-seal,credit-accord,hunter-license-act,league-founded,lunar-blockade}`、`factions/{shell-wardens,mimic-works,league,league-armory,busan,third-blade,selene,remnant-wings}`、`places/{golmud-nest,gyeongju-tombs,busan,yakutsk-bed}`。

## 方法（必守）

- **節點優先**：每件都要掛到節點（N01–N10，`history-nodes.json`）、主線（A–H，`history-lines/lines.md`）、年表條目、或「崩年的底色」某句（1.1–1.13）；REPORT 每件寫明掛哪裡、前因、後果。沒有因果的不寫——**不暴力產 lore**。
- 不拿其他作品（遊戲、電影、小說、真實戰爭的代稱）類比；量級用世界內的詞。
- 中文命名避免直譯（兩步命名，見 polish.md「首要標準」）：古代機本體叫古代機、外層叫裝甲；潮→蝕（蝕潮、蝕月…；海洋本義的潮汐、大潮、漲潮照用）。
- 國家、塞勒涅、巨頭**只削弱不萬能**；已裁示的不推翻（設定優先序見 lore README）。新名詞（地名以外的專名、制度名、詔令名、儀式名）標「提案」，列進 `naming.json`。
- 世界觀真相用可見度欄（`secrets` 的 `hidden`／`rumor`、`fieldVisibility`、`ancientMech.visibility`）；`summary`／`body` 照外界口吻寫，真相不寫進敘述。
- 群像為主：**本批不新增人物檔**；可提無名群像，或只在本文出現一次的小人物（不建檔、不進 `characters`／`leaders` 欄；`leaders` 可為空陣列）。**不寫任何真實歷史人物姓名**（含真實國家元首、政治人物、企業家）。
- **朝名、年號、君主名一律不取**，也不放佔位名；寫「朝廷」「內閣」「詔令」「君主」即可。
- 傳統 AI 在敘述裡不寫英文「AI」：寫「遙控機」「算核自走的守牆機」之類；機魂是人（style/people.md）。
- 機甲型號與怪獸**不新造**：要提就引用既有 lore／base 名稱，或寫「B 級衍型機」這類通稱；需要新型號或新怪獸，寫進 REPORT「需要決定的事」。
- 數字只在 date 欄與必要的量級（傘的人口與城數照 `scale-v2.json`：中 6.5 億 60 城、日 4500 萬 10 城、韓 3500 萬 8 城、俄 1 億 14 城）；敘述裡少放數字。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的寫進 REPORT 的「需要決定的事」，不要動手。工作目錄是 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-ea/wt-ea-01/`。

**新增恰好 14 檔**（檔名＝下列，不得改名；顯示名是領導給的工作名，可依兩步命名提更好的中文名，但要在 naming.json 寫理由）：

勢力（4，`type` 皆為 `大勢力`，body 必含四小節，`relations` 反映 2108-01）：
1. `content/lore/factions/imperial-court.json`——**朝廷**（aka「中傘」）。國家型：中傘就是朝廷。崩前君主立憲（君主、內閣、議會；朝廷是法理源頭、內閣掌政；不結盟的第三極、工業與科研大國、動員靠詔令）；崩後失去東南沿海，朝廷與內閣退回內陸（退到哪座城寫成「內陸」即可，不指名）；江口夜之後詔令只及於守得到的省；境內沒有自由城市；徵召玩家是可能的；朝廷視夸父為天命象徵、守寢人拒絕朝廷；夸父**維持高高在上**，朝廷要不到。藍本古代機段寫「天命在窩裡，不在朝廷手上」的處境（`ancientMech` 可省略，或寫夸父並標它不屬朝廷——擇一，REPORT 說理由）。2107 公開量產 B 級（見第 11 項）。對傭兵：付得慢、守法理、能徵召。
2. `content/lore/factions/japan-umbrella.json`——**日本那把傘**（aka「日傘」）。單國小傘；崩前低欲望、高齡、人口下降、造船強；崩後外洋暴露最重、存活四千五百萬、十城；瀨戶內鎖海把造船廠轉衍型機（第 9 項）；**駕駛員最缺的傘**；最早、最大量用遙控機與算核自走機「普通開」守牆（沒有招式、沒有附魔，見 drive.md）；因此大潮時刻有極少數守牆機醒成機魂，在日本發生得最多——寫成機緣，用 `secrets`（`rumor`）或外界口吻帶過，**不寫成技術、不給個案姓名**。樺太默契（第 10 項）。境內沒有自由城市。
3. `content/lore/factions/korea-umbrella.json`——**韓國那把傘**（aka「韓傘」）。單國小傘；崩前財閥壓制政治與社會、高競爭日常、年輕人外流（其一去月面）；崩後財閥的錢與家族買船票上月（第 6 項），國家留下、收歸他們留下的資產、把城交給還在的人；壓抑反轉成對守城者的崇拜；塞勒涅是釜山最大的型錄供應商、第三刃暗中拿它的錢＝財閥的錢從月亮繞回來。**釜山與處容照既有設定，處容與金河娜不當主角**（只在關係與一兩句裡出現）。境內沒有自由城市。
4. `content/lore/factions/russia-umbrella.json`——**俄羅斯那把傘**（aka「俄傘」）。國家型：強人體制延續（不寫強人姓名，寫「那張辦公桌」「總統府」之類制度詞）、資源國、北極岸冰封損失小；2091 棄東令只留雅庫茨克（第 7 項）；樺太默契；N09 之後跟進 B 級量產；境內沒有自由城市。

事件（7，body 300–1500 字、`## ` 小標 3–5 個、`consequences` 一句一條、date 落在 period 的 era 內）：
5. `content/lore/events/jiangkou-night.json`——**江口夜**，date `2089-03`，period `era/first-tide`。長江口；最後一道徵召全國的詔令（N01 後果、G 線；底色 1.6）；位置屬河口潮湧例外。後果：詔令此後只及於守得到的省；中傘＝朝廷成形。
6. `content/lore/events/chaebol-ascent.json`——工作名**財閥上月**，date `2092`，period `era/mimic-dawn`。塞勒涅在崩年四年賣船票，韓國財閥的錢與家族上月成為「穹頂下的錢」三股之一（magnates）；國家留下、收歸資產、把城交出去（底色 1.6、1.7；D、G 線）。後果接韓傘性格與「錢從月亮繞回釜山」。
7. `content/lore/events/eastern-abandonment.json`——**棄東令**，date `2091`，period `era/mimic-dawn`。總統府下令放棄遠東、只留雅庫茨克（雅庫茨克屬菌絲淡水例外，見既有 `places/yakutsk-bed.json`）；底色 1.4、1.5（遠東成空城帶）、G 線。後果接堪察加井城（第 14 項）、樺太默契。
8. `content/lore/events/mandate-of-kuafu.json`——工作名**天命詔**，date `2094`，period `era/mimic-dawn`。格爾木分家之後，朝廷頒詔視夸父為天命象徵、要守寢人入朝受封；守寢人拒絕（已定：朝廷視夸父為天命、守寢人拒絕朝廷）；格爾木分家多一層君臣張力；朝廷**沒有**動兵上窩（夸父一台抵一支軍，且動兵等於向天命開戰）。B、G 線、N03 後果。不得與 2100「守寢人拒絕殘軍」（霍華・凌上窩被請喝茶）衝突。
9. `content/lore/events/setouchi-lock.json`——**瀨戶內鎖海**，date `2094`，period `era/mimic-dawn`。日傘封住瀨戶內海的出口，內海成為護得住的船塢，造船廠轉造衍型機（C、G 線；底色 1.2、1.3）。後果接日傘衍型機產線與「船廠有了、駕駛員沒有」。
10. `content/lore/events/karafuto-understanding.json`——**樺太默契**，date `2098`，period `era/yoke-years`。日俄在樺太（庫頁島）共同打獸、不等正式協定的大潮停戰慣例（G 線，N06 前因）。**不寫它被打破**（兩河斷橋夜歸別線、不在本批）；只寫它如何形成、靠什麼維持、2101 新加坡會議時「入條文」仍屬提案（寫成外界說法或 `secrets` rumor）。
11. `content/lore/events/court-parade.json`——工作名**朝廷閱兵**，date `2107`，period `era/league`。中傘公開量產 B 級，以閱兵展示（N09；C、G 線）；後果：聯盟型依賴國家型浮現、俄與北美跟量產、軍售在國與國之間；與 `events/credit-accord.json` 的信貸並讀（塞勒涅只是窗口）。機型用通稱，不新造型號。

地點（3，`continent` 皆 `亞洲`，帶 `kind`、`status2108`、`world: "earth"`）：
12. `content/lore/places/yangtze-mouth.json`——工作名**江口空城**（長江口的舊巨型城市帶；江口夜發生地）。本區的**空城**代表地：不是蝕域，只是沒人了；產權歸國庫、地契多半已抵押給穹頂下的錢，搜刮規則是「國家默許、債主不許」（polity「空城」）。`kind` 用 `遺跡`；status2108 自擬一句。
13. `content/lore/places/setouchi.json`——**瀨戶內**（鎖海後的內海船塢帶，日傘衍型機產線所在）。`kind` 用 `港` 或 `城邦`（擇一並說理由）。
14. `content/lore/places/kamchatka-wells.json`——工作名**堪察加井城**。本區的**公司城**代表地（提案名，polity／magnates：握地熱井的舊能源巨頭當城主；法理仍屬國家，日常由公司管）：棄東令之後國家不來，公司守住井與港；國家型傘境內，所以它**不是自由城市**——徵召令法理上仍有效、公司照樣按國家的簿子繳一部分。公司不取真實企業名，可給一個提案公司名（列 naming.json）或只寫「井主」。`kind` 用 `城邦`。

**既有檔純插入（2 檔，只能新增陣列元素，不得改動或刪除任何既有字元的值）**：
- `content/lore/factions/shell-wardens.json`：`relations` 追加一列 `{"faction":"faction/imperial-court","stance":"緊張"或"敵對","note":…}`（擇一並說理由）。
- `content/lore/factions/busan.json`：`relations` 追加一列指向 `faction/korea-umbrella`。

**年表清單（不碰 timeline.json）**：把 7 件事件各一條年表條目寫進報告目錄的 `timeline-add.json`（格式見「交付」），領導帶回時插入。

不做：
- 修改或刪除任何既有檔（上面 2 檔純插入除外）；**不碰 `content/lore/timeline.json`**；`characters/` 一律不新增不修改；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`content/base/` 一律不碰；不 commit。
- 不寫：兩河斷橋夜、中亞、哈薩克賣墟、日傘醒魂的具體個案、韓國其他城市、北極岸港口、內陸行在（這些留下一批）；埃吉爾、歐傘、孟加拉灣、美洲、非洲（他線）。
- worktree 內**不要留任何其他檔**（筆記、log、臨時腳本一律放 `/tmp/cx-ea-01/`）。
- 件數 gate：新增／修改檔超過 16 件就停下回報；容量 gate：你新增的單檔超過 16 KB，或新增內容合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | 每寫完一檔跑，0 錯（「事件未進年表」的警告是預期的，照實記進 REPORT） |
| `npm run check` | 收尾跑，末行 `OK 0 errors` |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`） | 讀 wf-table/1 資料檔（`wf/workflows/planning/design-notes/world/history-nodes.json`、`history-timeline.json`、`history-lines.json`、`scale-v2.json`；實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ea-01 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-01/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準是已知現象，照實寫進 REPORT。

## 工作

1. 讀「先讀」全部；讀「背景」列出的既有條目，以及 `content/lore/eras/` 全部、`content/lore/factions/{selene,league,salt-gull}.json`（大勢力範本與關係寫法）、`timeline.json` 中 2089–2108 的東亞條目（grep 夸父、格爾木、釜山、慶州、雅庫茨克、老爹）。
2. 定 14 件清單（id、顯示名、date／region、掛哪個節點／線／底色、一句梗）與命名表。
3. 寫檔、做 2 處純插入；每檔後 `node content/lore/check.ts`。
4. 寫 `timeline-add.json`、`naming.json`、`review.json`；`npm run check`、`npm test` 收尾；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新 lore 檔與 2 處插入 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-ea/wt-ea-01/content/lore/` |
| 年表待插清單 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-01/timeline-add.json` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-01/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-01/review.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-ea/ea-01/REPORT.md` |

`timeline-add.json`：`{"entries":[…]}`，每筆照 `content/lore/README.md` 的 timeline 條目格式（`date`、`title`、`summary`、`event`、`era`、`factions`、`tags`），7 筆、各帶 `event` 指向本批事件檔；`factions` 只引用存在的或本批新增的 id。

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，`method` 填意譯／音譯／混用／描述句，`status` 填「既有」或「提案」；涵蓋每個新檔的顯示名與文中新出現的專名。

`review.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[…]}`，14 個新檔各一列：`檔`＝相對 repo 根的路徑、`類別`＝勢力／事件／地點、`名稱`＝顯示名、`白話`＝一到兩句、**不超過 60 字**、給沒讀過設定的人看的白話（說它是什麼、為什麼存在，不堆術語）、`掛到`＝節點／主線／年表／底色條（例「N01；G 線；底色 1.6」）。使用者與規劃者會拿這張表審敘事基調。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——每件一行：id、date 或 region、掛到哪個節點／線／年表條目／底色、前因→後果一句；沒做到或證據不足的；需要決定的事，含你發現的既有 lore 或設定筆記矛盾、需要的新機型或怪獸）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有** 14 個新檔與 2 個既有檔的純插入（`git status --short` 除 `node_modules` 外只見這些；`timeline.json` 不在其中）。
2. worktree 內 `node content/lore/check.ts` 0 錯；`npm run check` 末行 `OK 0 errors`；`npm test` 0 fail。
3. 14 件逐一對上範圍第 1–14 項；`timeline-add.json` 7 筆各對一件事件。
4. REPORT「產出」每件寫明掛點與前因後果。
5. `naming.json` 與 `review.json` 各涵蓋每個新檔（review 白話每列 ≤ 60 字）；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞；引用既有專名例外）、0 個 style.md 禁用詞、0 個真實歷史人名、0 個朝名年號。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ea-01`。本線團隊：`teams/fill-ea`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ea-01 --up DONE '一句自足結論' /tmp/cx-ea-01/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-ea-01 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增 14 檔＋2 處純插入＋年表清單＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。

# east：可雇用的東亞與北亞人物填充計畫（提案）

## 1. 已讀清單

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/README.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`
- `wf/workflows/dispatch/handoffs/fill-rulings.md`
- `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`
- `wf/workflows/planning/design-notes/world/pilots.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`
- `src/ops/crew/recruit.ts`
- `content/base/world/recruit-pools/`
- `content/base/world/backgrounds/`
- `content/base/persons/`

以上由本線親自讀；三個範本目錄全部現存 JSON 均已讀。補讀 `wf/WORKFLOWS.md`、`wf/workflows/common/data-files.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/dev-env.md`；交接骨架已讀 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/cx-kj2-01.md`，manifest 格式已按 `content/batches/2026-10/kaiju2-01.json` 查欄位。開場已讀 SESSION-LOG、WAIT_USER 與 new 兩封進度信；本輪不寄 inbox、不改這些檔。

## 2. 盤點

調查快照為 2026-10-26：全庫 38 個 persons、13 個 backgrounds、4 個 recruit-pools、89 個 lore characters。索引以 tabledb 條件查詢，原檔以 grep／針對單件讀取核實。逐筆證據已抽到 [inventory.json](inventory.json)，不以姓名推定國籍。

明確本區出身的 base persons **3 人**：重慶的林照生、大阪的橘伊吹與葛西蓮；其中可經池雇用 **2 人／2 背景／2 池有來源**，葛西蓮在開局名冊、無招募背景。佐藤花有 yamato 文化背景，但出身地尚無證據；伊琳娜用 norse，也不能據此算俄遠東人。陳小海雖是漢字姓名，lore 明列達卡出生，歸南亞。蒙古姓名範本同樣不拿來冒充俄遠東。

本區六勢力的 lore 人物共 **10 位**，另有大阪流亡者葛西蓮 **1 位**：溫照衡、真瀨友則、守燈、徐海謙、妮娜別洛娃、金河娜、尹瑞英、老爹、崔武謙、韓瑞潾。地方／勢力常有人，卻沒有可雇用的資料鏈；不將城主、團長、新魂或守將直接拉進招募池。新人的單向 relations 只掛溫照衡、真瀨友則、尹瑞英、妮娜，其他既有人物維持原狀。

本區 **11 個地方**（成都行在、江口空城、仙台、仙台鳴崖、瀨戶內、仁川、釜山、慶州古陵、堪察加井城、提克西、白夜菌床），以及 **6 個勢力**（朝廷、日傘、韓傘、釜山、第三刃、俄傘），每個目前可證的「所屬 lore 人物→person→背景→池」可雇用人數皆 **0**；逐地逐勢力列數在 inventory。高原夸父之窩另列相關邊界，亦為 0，非本輪新增出身區。丹增、洛桑、秦望舒、夸父已有故事，僅作既有高原背景；不新增認主者。岡本繭、朴仁哲及暗埠人物等跨區掛連已有用途，不重製人物，也不從姓名硬算出生地。

既有四池中：達卡明確東亞來源 0、蘆葦澤 1、新加坡 0、吉大港碼頭 1；新加坡另外有兩個文化相容範本，與上述確證計數分開。缺口是朝廷體系、日傘現役與隨船人員、韓傘轉獵手、釜山一般人、俄遠東與失城南逃者。新增 **24 組＝24 背景＋24 person＋24 lore 人物＝72 檔**，再加 **4 新池＝76 檔**。

## 3. 設計理念

這二十四個人先是一船糧、一班工與一次撤離裡的人，之後才是可以雇來的數值。朝廷人把國家守得到與守不到的界線帶到南方，日本人則讓少數真的坐進座艙的人顯得珍貴。韓傘退役者與釜山外勤在同一碼頭找活，雙籤城的法理留在背景，故事落在他們敢不敢替人留退路。北方失城者看見白光時會停步，獸仍是沿淡水蔓延的災難，沒有一張可以談判的臉。每人都有一個站起來的瞬間與一句敢吼的話，光從凡人做出的那一下照出來，不新增古代機認主。崩前孩子的記憶允許零碎，成年者記得舊工作；唯一崩後出生者靠別人的記憶認識舊世界。出生斷層、不老老手與六十歲以上船員放在同一張招募名單上，讓年齡差成為相處的差異。

### 方法與禁忌（共同規格原文）

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。


本輪沒有以鞋、繩、乾衣、杯、梯、扶手、熱水或燈為重複核心畫面；燈子是姓名，不是燈意象。24 人全有吼話，15 人為駕駛／砲手／拘束手。機型只寫既有堅盾或通用衍型機，人物不自帶國家專用機，不繞過聲望取得規則。

## 4. 人物表

完整 24 列已抽到 [people.json](people.json)。每列含 id、姓名、性別、age／born／activeYears、崩前／崩後、性格、瞬間、招牌話、職能、屬性與 levelDice、既有 trait、tags、culture、背景中英名、費用、池、地方、勢力、掛點與批次；`personSpec`、`backgroundSpec`、`loreSpec` 定死非 body 欄位，工人只展開 `loreOutline` 三段。`files` 是該人恰好三檔。

沿同類型既有範本暫填：普通駕駛 780／1.5、長役老手 850／1.6、修甲與醫護等船員 600／1.2、導航通訊 700／1.4。費用範本與完整數值逐人列明；不另造職業效果。trait 只在 person，背景 traits 為空，避免雇用再疊；perks 空、abilities 不新增。medic／communicator／cook 是新語意 tags，不是新 effect，暫無醫療或炊事加成。

culture 沿現有表：中 han、日 yamato、韓 han、俄 norse。韓／俄是引擎相容的神話命名池代理，並非民族認定，固定人名來自 person，不隨 culture 改名；後續專用文化表見第 7、11 段。

五歲直方圖（2108 年，24 人）：

```text
15–19  █ 1
20–24  █████ 5
25–29  ███ 3
30–34  ███ 3
35–39  ██ 2
40–44  ██ 2
45–49  ██ 2
50–54  ██ 2
55–59  ██ 2
60–64  █ 1
65–69  █ 1
```

16–19 歲只有邱寧嵐 18 歲，**1/24＝4.17% ≤5%**；她 2090 生在已遷入產糧村的家庭，靠接生婆與共食灶存活，現為醫護助手，不是少年王牌。其餘最年輕 22 歲；本批沒有十五歲以下駕駛。born 一律 2108−age。兩名「不老的」：段承業 39 歲／16 年（約27歲外貌）、荒瀨健斗 34 歲／14 年（約23.5歲外貌）；均機械系，費用較高，各僅一池。其他駕駛設定 2106 近年轉職，非把全部中年人都寫成長役老手；activeYears 不填。兩名 60+ 是導航與廚／老船員。

## 5. 招募池表

四列已抽到 [pools.json](pools.json)，含每個新池 id、地點、size=3、主題及完整背景＋權重。六個來源抽三人，共 24 個來源互不共用；兩批各自包含池所需的全部人物。每季退潮期，同池可能抽到駕駛與醫護、下一次換成技師與老船員；老手權重1且僅兩池有，不能次次穩得。用掉的具名範本不補匿名替身，已雇者不再出現，可用來源少於 size 時名額自然減少。

四池只掛已有 base place：達卡的朝廷出身南行者、新加坡的日傘護件隊、吉大港的韓傘／釜山外勤、蘆葦澤的北亞南行者。**出身與招募所在地分開**；lore 同時列故地與目前停靠地。沒有 base 的釜山、仙台、雅庫茨克不建營運池；菌床也不是可住的招募站。

引擎親讀確認：sources 依 background 排序後加權不放回抽樣，名冊與現有候選者共用 used 集，同一 person 不會重複；同地多池各自抽。資料寫 refreshOn=quarter，實作入口是退潮 phase=neap 的日處理及每日去重，故本計畫的「季」沿共同規格用語，不額外承諾曆季天數。

## 6. lore 人物草稿要點

每人三段要點在 people 的 `loreOutline`，依序是崩前、崩後、現在與招牌瞬間；逐人都有不同的職業記憶、遷徙原因和動作。產出 body 250–450 字，至少 200 字；不可把表格欄名或設計用詞貼進 body。`loreSpec` 已定所有結構欄位與現有掛點，body 以可見事實寫，不增秘密或傳奇資格。

三個敘事邊界：幼兒只保留碎片記憶，不替他們安插崩前職業；新人的微小救援是既有災難後果裡的提案，不重寫事件勝負；白夜 2100 夏失城、同年首燒維持，南逃者不擊殺白夜或宣稱已收復。新名字在審查表／報告標「（提案）」，遊戲顯示名用 people 指定的純姓名，勿把審查標籤寫進人物姓名。

## 7. 需要既有檔插入與 engine-backlog 候選

[inserts-draft.json](inserts-draft.json) 為 wf-table/1、固定五欄、**0 列**。這批新人物可自行帶 places／faction／relations／events 與 gameRefs，沒有必要修改既有勢力 leaders 或既有四池。事件掛點不等於補入事件主角名單；白夜相關也不加新年表條目。工人仍須交同格式 inserts.json；發現真有需要的補鏈只記 append／setKey，不直接套用。

[engine-backlog-candidates.json](engine-backlog-candidates.json) 四列：招募卡短介、船員職類篩選、韓俄文化表、刷新用語核對，各含影響、建議及規模。全部交領導評估，不成為這批新增內容的相依；本輪無新 effect、AI 或 source 修改。

## 8. 分批

[batch-files.json](batch-files.json) 是逐檔白名單（76 列），可依 batch 取用；manifest 亦列同一份路徑。fp-east-01＝朝廷6＋日本6，共12組36檔＋達卡／新加坡2池＝**38檔**。fp-east-02＝韓傘／釜山6＋北亞6，共12組36檔＋吉大港／蘆葦澤2池＝**38檔**。每批 ≤12組、≤42檔，無跨批新 id 相依。

**兩批均新增池，會改營運亂數軌跡。** 產出線不得 GOLDEN_UPDATE／rerecord；黃金紅逐檔列出，領導整批整合後統一重錄。不得因未知錯誤一概宣稱黃金豁免。

## 9. 產出交接書稿

[cx-fp-east-01.md](cx-fp-east-01.md)、[cx-fp-east-02.md](cx-fp-east-02.md) 沿指定怪獸批交接骨架：先讀、唯一目標、方法、範圍、工具、資源、工作、交付、固定驗收、失敗處置、完成回報。逐檔規格以 people／pools 的本批列為權威資料，工人不重選名字、年齡、出身、瞬間、話語、池與掛點；只展開 prose。子代理上限2；不寄 inbox，以行程結束、最後訊息與檔案驗收。

## 10. manifest 稿

[fp-east-01.manifest.json](fp-east-01.manifest.json)、[fp-east-02.manifest.json](fp-east-02.manifest.json)：content-batch/1，mode:add、status:draft、base:TBD、maxFiles:42，allow 僅四個核定 kinds、namePrefix 空，checks 僅 check、lore、typecheck、test、readlist。目前只是草稿，**未宣稱領導審過或已建 worktree**；領導啟動前填 base 與備妥指定隔離 worktree，本線不建分支、不 commit。

## 11. 需要決定

沒有阻塞本輪草稿的問題。交領導審三件：是否接受韓 han／俄 norse 的暫時相容值；是否以本輪四池各抽三人的總候選量進產出（這是內容量提案，非平衡定案）；人物與背景新名的基調審查。沒有等答覆才完成的工作，產出派工仍須領導審稿並填實際 base。

固定四條驗收證據集中在 [acceptance.md](acceptance.md)；本線不加遊戲測試、probe、playtest 或額外 gate。所有產物只在 east-plan，臨時腳本與 grep 原始證據只在 /tmp/cx-fp-east-plan；沒有寫 content、src、其他 wf 檔，也沒有 commit。

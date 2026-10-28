# 人物隊前置盤點 — READY（未開始正式產出）

## 已讀與邊界

本線親讀正式交接書、工作區／專案 AGENTS、兩層 WORKFLOWS／user／team-model／dispatch，以及專案 working／art、data-files、content 全部 25 份 Markdown（含 world-pillars 全部子檔）、lore 風格、人物 core 契約與適用 world／design-notes 原文。完整清單在 [readlist.json](readlist.json)：101 檔全文、12 個大型資料檔列級查詢，共 113 列；其中 13 個現行內容範本已透過精確索引列 `open` 全文親讀，不把摘要當全文。

本階段只做規矩／現況盤點，沒有提出新人物或替 astra 定計畫。等領導原生 followup 核定計畫、隔離 worktree 與正式白名單後，才開始產出；現在沒有正式 content 寫入授權。交接書原容量 gate 為每檔 16 KB，本報告另依領導要求控制在 8 KB 內。

## 可用範本與現成配套

**人物雙層結構可用。** `persons/ren-kasai.json` 是最小 human 骨架，`persons/ilse-brandt.json` 另示範 `age`／`activeYears`；都有六屬性、AP／fatigue／hp 三池、hp 歸零死亡、will 與 HumanGrowth。`lore/characters/ren-kasai.json` 可供欄位與 `gameRefs` 格式參照，不能把復仇、失親、帶人回港等既有情節改名重寫。正式人選仍須先比主行動、關係功能與代價，不只查名字。

**特質可引用，不能盲抄。** 已全文讀 `trait-vengeful`、`dead`、`ax-trait-oathbound`、`ax-trait-watchful`、`ax-trait-water-shy`。其中 water-shy 為永久 person 特質、evasion +2／resolve −4、兩字 badge；watchful 為 perception +2／accuracy −2。oathbound 的 resolve +6 超出現行永久 ±5 指引；oathbound／watchful 的 badge 亦長於 2–4 字指引。這些是現成參照與風險，不是本輪驗收結論，也沒有改舊檔。

**招募與對白配套存在。** `world/backgrounds/refugee.json` 實際指向 `person/chen-xiaohai`、culture=bengal，只有 resolve／control 兩個 attrRanges；不能按同名檔或假定六鍵齊全。`recruit-pools/dhaka.json` 引用該背景，`dialogues/ren-kasai-empty-chair.json` 展示 flag／mood／後話。這些只供核定計畫若明列配套時參照，未自行擴到招募池或對白寫入。

**機魂範本僅作條件性參照。** `persons/glove.json`、`soultrees/ax-sentinel.json` 已全文讀：前者 calc max=50，與 ancient-people 的 5–10 指引不同；後者實檔節點用 research map／companionship，而非 core spec 示意的 cost／direction。不可把舊名 `trait-copied` 讀成可複製機魂；機魂不可複製、能獨駕但長能力慢，低階沒有鮮明人格。以上差異不在本線裁決或修正。

每個已讀範本的用途與注意點記在 readlist 的 `use`／`caution`，不是另立範本副本。

## 查詢證據與既有 draft

`templates.json` 查到人物／機魂／特質／營運／lore 相關 6 列；numeric-bands 查人物與效果 2 列。人物建議沿用 accuracy 45–62、evasion 5–13、resolve 42–71、initiative／perception 5–8、control 40–56，AP 固定 9、hp 48–65（硬上限 70）；本階段未產生或平衡新數值。engine-facts 查 EF-02／04／08／10／11／19／21；person-scope 僅用人物特質、傷勢等，且不用 setControl。EF-21 標待缺口，不把其歷史欄位描述當成已核最新 schema。

透過 tabledb API 聚合目前索引：base-person 186、base-background 161、base-recruit 44、base-effect 171，索引均標 active；lore-character 289，271 active、18 draft。active 只是索引／批次狀態，**不是已通過整合驗收**。三個人物 draft 批次 wl-characters、wn-r2-characters、wm-r4-characters 各 6 件已作精確條件查詢；本線沒有全文複審這 18 件，也沒有宣稱語義去重完成。

已讀七輪待驗收摘要與 10/28 人物審閱 REPORT。舊 215 件、七輪，以及 pilots／gear／small 舊線一律沿用未驗收邊界；不把歷史有限檢查或他線排除結果升格為本輪 verified。P01 朴仁哲失腿的前盾／閘門矛盾保留待使用者裁決；不處理歷史 inbox、不定 S 領主或裏側答案、不新增 SS／SSS 設定。

`content_index refs person/ren-kasai` 得 98 個引用檔，`effect/trait-vengeful` 得 1 個；因此範本僅讀取，不改本尊。該工具唯讀，未重產索引。

## 固定驗收與下一步

1. readlist 已記親讀路徑、全文／列級查詢之別，以及 13 個範本全文；完整 25 份 content Markdown 無遺漏。
2. 本報告與 readlist 列的是可用結構、配套與風險，未創作候選或冒稱舊稿驗收。`brief_lint` 對正式交接書 strict 結果為 **0 違規／1 檔**。
3. 只新寫本目錄 `PREFLIGHT.md`、`readlist.json`，未改 content／src／schemas／spec／index／batches 或歷史信件；未測試、未安裝下載、未開 GUI、未派子代理、未 commit／push。調查時 HEAD：`c09b026919eeee03cde68c0f1eb0d289ad4cbe7c`。

**READY；本階段停止，等待領導核定正式契約。**

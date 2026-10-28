# 八台衍型機已產出 — focused 通過，待領導重驗

## 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/user/working.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/acceptance-playtest.md`
- `content/lore/style.md`
- `wf/workflows/planning/specs/core/content-format.md`

以上逐條為 manifest.mustRead，均本人全文讀。完整 229 筆規矩、原始設定、範本、武器／效果鏈及限定 source 查讀見 [readlist.json](readlist.json)；`full`、`partial`、`query`、`count` 明分，未把局部 source 冒稱全文。

## 做了什麼

工人 `mechs_team_sol`／gpt-6.1-sol／xhigh／子代理 0。依 astra 已核定 M01–M08，在 `/tmp/expansion-1028/wt/mechs` 新增 plannedFiles 精確十八檔：八 frame、八 model、兩 scenario。總計 25,714 bytes、單檔最大 2,442；HEAD 仍為 `c09b026919eeee03cde68c0f1eb0d289ad4cbe7c`，未 commit、未帶回主樹。

每機有實際 defaultLoadout、血統／系列 tags、nameEn 與約三百字 etymology 敘事；無新 pilot／部件／能力／效果／骨架。前代與首次月分照核定計畫。八列≤60字繁中介紹及逐件語義差異在 [review.json](review.json)，八列英文意涵在 [naming.json](naming.json)。英文原名不用亂填 aka。

`exm-crossline` 覆蓋 M01–M04；`exm-cooling-window` 覆蓋 M05–M08，以生存十二輪或驅散收場。兩場沿用 skirmish-20，四對四、原部署區相距十五格，均先列玩家全滅 lose。八名既有人物跨兩場也不重複；brief 明示獨立試配、不把借用人物或白夜入場寫成正史。

## 驗收證據

四道指定 focused 各只跑一次，exit 皆 0；原始 log、逐件槽位／成本池與凍結 SHA-256 均在 [focused-results.json](focused-results.json)。

| 檢查 | 實際結果 |
|---|---|
| `npm run check` | core 0 errors／36 warnings；ops 0 errors／10 warnings，未有 exm- 警告 |
| `node content/lore/check.ts` | errors=0 warnings=0 |
| `npm run typecheck` | 兩份 tsc --noEmit 均 0；npm 原環境 http-proxy 提醒保留 |
| content_gate | approved 十八精確檔；violations=[]；僅忽略領導建的 node_modules symlink |

主樹 content／引擎／schema／spec／既有資料均未寫；本線另只寫指定報告與 tmp。禁用詞與資料範圍已自查，所有二十七個已裝槽的型別與 size 合規、機體成本／產出所需池齊全。這些是靜態相容證據，不是實戰或 AI 使用證據。未跑 npm test、probe、MCP、sim、UI、截圖或 GUI；lead QA 另行負責，不能把 focused 當整合通過或 accepted。

## 平衡待驗與逐件差異

下列 HP 為既有骨架基礎層總和，不把部件自身 HP 混成 frame 數值；裝甲附加另記。完整兩池、能力與尺寸見 focused-results 的 equipment 列。

| 計畫 | 級／HP／mass | 主要配裝與語義差異 |
|---|---|---|
| M01 | D／300／4 | 楔刃＋扣足矢；有限矢定身，不沿 BW-08 單刃自守 |
| M02 | C／370／9 | 汀光＋鳴刃＋汲光卷；主動回光，不沿 G2 被動大池 |
| M03 | B／445／10 | 照隙＋晃眼；單敵減益，不做整隊觀測增益 |
| M04 | B／445／9 | 截浪＋長鉤；直線與近距換招，沒有推拉或短跳 |
| M05 | A／760／12 | 拘束鉗＋重斧；4+5 AP 用盡回合，不等於活捕 |
| M06 | A／520／12 | 分翼長弓＋鳴刃＋回光；破翼兼失武器，不沿穿雲雙遠射 |
| M07 | C／370+25／8 | 脫扣衍甲；兩次自解縛網，不清全減益或解救他人 |
| M08 | A／600／12 | 燼雨爐＋鳴刃；中距小圓域壓制，不留地火、不解拘 |

mass 全在 D≤6、C≤9、B≤12、A≤15 的自律帶內。機體燼池 100–130、regen −15～−20，流光依級暫填；M04 原舟架範本沒有流光，核定兩武器各需 15／10，故新 frame 補 B 級 60／12。M08 原行香範本為 B 級且無流光，本件按核定 A 級骨架與爐／回光件補 90／15；未改任何舊件。

兩個骨架／屬性例外保留：M05 initiative 5 低於 A 建議 7–9，沿既有重架慢速代價；M06 既有分翼 HP520 低於 A 建議560，以較薄且翼位兼武器的風險換飛行，不加甲掩蓋取捨。既有月衡長弓 32/4＝8 傷/AP 高於 A 建議7.5，但有三格盲區與 cooldown2；截浪每目標16/4、燼雨20/5因範圍與效果低於單體帶，皆不修改舊能力。C 級鳴刃20/3亦略超建議比值，須隨既有配件一起比較，不因此改基準。

候選入稿前依索引逐一查八個 frame id／顯示名及 model id，皆零撞名；再全文比對計畫最近範本。敘事分別落在共有功績、揭露貨品弱點、師徒競技、漂亮打法與搭檔勝負、嗜勝妨礙生擒、爭用同一台弓機、承認依賴但不私交和解、神像與親歷者入畫。未把「救人、立證、記帳」當八篇共用結尾；仍須領導做跨庫最終語義查重。

## 需要決定／領導接手

本批內容已凍結，可開始 lead QA。重測試、同級 probe、手動與自動 MCP、整合黃金及平衡一律未由本工人執行。特別驗收主動汲光與脫扣：汲光是兩回合 regen 調整，不是立即補滿，且需先缺光；AI 的一般 buff 估值未必能把握時機。脫扣沒有「已被縛」require，AI 可能為瞬間 evasion 提早耗掉限次；不改舊能力，請觀測原始使用事件。定身依 mx-netted 的 immobilized tag，普通 rooted 不會被脫扣清除；capture 另看物種部位條件。

workflow 中 EF-14／16／21 等舊現況不可照抄：當前 code 已支援 defaultLoadout、nameEn／etymology、情境 name／brief、分級抵抗性。只讀直接相關 source 核對，未改規矩、引擎或歷史血統表示法。舊 215 件、七輪 draft、P01失腿與其他待裁決一律不補判。

# lead-combat-ref REPORT：Battle Brothers → 機甲 SRPG 可選機制表

[交接書](../lead-combat-ref.md)｜機制表 [mechanics.json](mechanics.json)（107 列）

**結論**：BB 拆解 19 份主題檔已消化成 107 列可選機制（採用 19／改造 80／不採用 8），每列附 BB 出處、機甲改寫、對應裁示與一個待拍板問題；抽 10 列核出處 10/10 命中。STATUS：DONE。

## 全貌

BB 的骨架可以幾乎原樣搬：**人物（駕駛員）與裝備（機甲、部件）是兩個獨立容器，都掛「技能／效果物件」，每次重算從基本值複製、依固定順序跑全部效果再提交**（CHR-01、CMB-16、CMB-19、DAT-04、DAT-06）。這正好對上「機甲就是裝備、部位後果與傳到駕駛員都是資料效果清單」的裁示：部位＝裝備上的子容器、部位打壞＝掛上或拿掉效果、傷到駕駛員＝在人物容器加傷勢效果。要改的主要是三處：① BB 的命中部位只有「頭／身」兩格且是單次抽籤（CMB-12 建議不採用，換成資料化的 body plan 命中權重與分層護甲 CMB-13）；② BB 有幾個已證實的原作 bug（額外 AP 重扣 CMB-04、XP 分享提早 return CHR-18、troop 計數 U8 截斷 DAT-08）一律不搬；③ 營運層（工資、口糧、修理、醫療、彈藥、契約、城鎮）規則都可用，但「修理」要從「回耐久」改成「部位 HP／可修或必換」，並多出駕駛員離隊時機甲歸屬等機甲特有問題。戰術 AI 的「陣營策略＋每單位 agent＋候選評分加權抽選＋與玩家共用同一技能入口」結構建議採用（AI-01、AI-12、AI-04），不限單位數下要注意 BB 的有限候選搜尋（AI-13）是效能換最佳性的取捨。SRW 只取三件：精神指令（駕駛員主動資源池，改造）、氣力（與 BB 士氣二選一或並存，待決）、武器資料欄（射程、EN／彈數、地形適性，採用）。

## 做了什麼

- 讀交接書點名的 AGENTS.md 與 wf 規矩；ROSTER 追加 `lead-combat-ref` 一格（並代登記五個 codex 工人，因其沙箱寫不到 ROSTER）；`inbox_team.sh create combatref`。
- 讀 BB 拆解 `README.md`、`replication-design.md` 建全貌，分五組：戰鬥結算與技能效果（combat-rules、skill-effects）／人物傷勢士氣與戰後（character-rules、character-backgrounds、battle-results、battle-results-loot-xp）／戰術 AI（tactical-ai、ai-movement、ai-retreat-heat、ai-strategy、ai-targeting）／營運契約世界（economy、contracts、contracts-execution、contracts-families、settlements、world-simulation）／資料模型（data-model、simulation-loop、replication-design）。
- 寫五份子線交接書 `cx-bb-{combat,character,ai,ops,data}.md`，`brief_lint --strict` 0 違規；以 `codex exec -m gpt-6-astra -s workspace-write` 派出，每條 `-C` 指自己目錄、`--add-dir wf/inbox`。同時開 1 個 Claude 子 agent（Sonnet）用 WebSearch 查 SRW 三件事。
- 前景 `inbox_poll.sh --wait` 收齊五封 DONE，逐封 `inbox_ack.sh --apply` 歸檔並記 STATE；合併腳本逐列重核：九欄非空、`recommendation`／`domain`／`design_note_ref` 值域、每列 `source` 的檔案存在且段名 `grep -F` 命中——107 列 0 違規。
- SRW 子 agent 交的 8 個 URL 都在 `neo-akurasu.duckdns.org`（當下 502），領導自行改成同路徑的原站 `www.akurasu.net`，8/8 回 200 且頁標題相符；抽查 GC 部位頁有 Head/Arms/Legs、30 代公式頁有「氣力加在格鬥值上」原文，與 SRW-04、SRW-07 描述一致。

## 產出

| 產物 | 路徑 |
|---|---|
| 可選機制表（wf-table/1，107 列） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/mechanics.json` |
| 子線交接書 ×5 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-*.md` |
| 工人 REPORT＋片段 ×5 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/cx-bb-*/{REPORT.md,fragment.json}` |
| SRW 子 agent REPORT＋片段 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/srw/` |
| codex log／pid／last | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-combat-ref/logs/` |

分佈（domain 欄）：戰鬥 30、營運 27、AI 18、人物 17、資料 15（來源組：combat 22、character 21、ai 18、ops 22、data 16、SRW 8）；建議 採用 19／改造 80／不採用 8。`design_note_ref` 七條全覆蓋（規模 28、地圖呈現 11、營運層 35、路線 59、機甲結構 53、部位後果 32、架構 79）。

### 七條裁示的對應

**戰鬥規模與地圖**（不限單位數、地圖尺寸是資料）：BB 輪序是「每輪全體個體依先攻排序」（CMB-01），佇列本來就不假設小隊上限，可直接採用；地圖相關的移動報價、控制區、射線都以格子查詢實作，尺寸由資料給（CMB-06、AI-12）。風險在 AI：BB 的接敵站位是有限候選＋有限次尋路（AI-13、AI-14），單位多時這是必要的效能護欄，但會漏掉較佳站位；heat 威脅圖（AI-18）在大地圖要算成本。DAT-08 提醒單位數編碼不能有 U8 上限。

**地圖呈現**（方格、DOM／CSS）：BB 是六角格，搬到方格要決定斜向移動與斜向是否算鄰接（CMB-06 待決）、控制區與藉機攻擊的鄰接定義（CMB-07）、範圍攻擊形狀改成方格版（AI-11）。散射／遮擋（CMB-11）與高差命中修正（CMB-09）要在方格上重定義。BB 的「被風箏」判斷寫死 X 座標界線（AI-07），建議不採用。

**營運層**（參考 BB 傭兵團）：帳本與倉庫分流（OPS-01）、日結發薪可欠薪扣心情（OPS-02、DAT-12）、口糧（OPS-03）、每小時修理與每日療傷（OPS-04、OPS-05）、彈藥補給（OPS-06）、欠薪逃兵（OPS-07）、城鎮定價／局勢／商店刷新／招募池（OPS-08～11）、契約狀態機與談判取消（OPS-12～14）、代表性契約家族（護送、巡邏、防村、會戰 OPS-15～18）、報酬池（OPS-19）、世界排程與勢力行動（OPS-20～22）。機甲特有改寫：修理對象是部位 HP、整機價格是部件加總或另計、駕駛員離隊與招募是否附帶機甲。

**戰鬥系統路線**（BB 式、機甲是裝備）：駕駛員＝BB 人物的整套生成與成長（背景區間、天賦星、預骰升級、XP 門檻、perk 點、trait；CHR-01～09）、傷勢作為人物效果（CHR-10、CHR-11）、士氣（CHR-12、AI-16）、戰後心情與 XP（CHR-13、CHR-17）。戰鬥流程沿用 AP＋跨輪疲勞（CMB-03，但疲勞歸駕駛員或機甲熱量待決）、Wait（CMB-02）、命中與傷害鏈（CMB-09、CMB-14）。SRW 的精神指令（SRW-01、SRW-02）與氣力（SRW-03、SRW-04）是唯一需要和 BB 士氣互斥選擇的地方。

**機甲結構**（多種 body plan、部位有 HP、可分層）：BB 只有頭／身兩個命中區且單次抽籤（CMB-12 不採用），但它的「HP 傷與護甲傷分開抽、剩甲抑制穿透、完全穿透不磨甲」（CMB-13）正好可以推廣成「外裝甲層／內層本體」兩層；盾擋是未命中區間的子類（CMB-10）可對應護盾部件。裝備經 `item.addSkill` 把技能綁到來源物品（CMB-19）＝部件提供武器／能力、部件拿掉技能就消失。SRW GC 有頭／手／腳各自 HP 且瞄準部位可使失能（SRW-07），是唯一直接的部位破壞先例。

**部位打壞的後果與傳到駕駛員**（多種、效果清單）：BB 傷害鏈有固定 hook 順序（CMB-14：攻方 before-hit → 防方屬性 → 受傷 hook → 扣 HP → 保命 → 磨甲 → 死亡或傷勢士氣），部位後果與駕駛員傷勢都應掛在這條鏈的明確節點上；待決的是同一擊同時打壞部位又傷駕駛員時誰先（CMB-14），以及部位壞了它提供的防護是當下失效還是本鏈結束才失效（CMB-18，BB 是延後移除）。效果疊加／刷新（CMB-21）、各自計時（CMB-20）、DOT 不走攻擊入口（CMB-22）都要在效果詞彙裡定義。戰後：昏迷駕駛員要控制戰場才救得回（CHR-14）、回收部件保留實際損傷（CHR-19）。

**架構**（解耦、資料好擴充、要有 AI）：BB 拆解的六類責任（Definition／State／Command／Query／Effect／DomainEvent，DAT-01～03）與「Actor 強持有容器、容器弱引用 Actor」（DAT-04）建議採用；建議改造為「預覽與 AI 評估是無副作用查詢」（DAT-02，BB 原版有副作用）、「動作失敗時成本處理要明定」（DAT-01）、「同一份成本結果供預覽／AI／實扣」（CMB-04）。AI 與玩家共用 skill.use 入口（AI-04）是解耦的關鍵。存讀檔版本遷移（DAT-15）要預留新增部位定義的相容政策。

### 最該先拍板的 10 個 open_question

1. **累積負荷歸誰**：只設駕駛員疲勞、只設機甲熱量，還是兩種資源？（CMB-03）——決定 AP 之外的第二資源與輪序影響。
2. **士氣制度**：BB 階段制（動搖、崩潰、逃跑接管移動）還是 SRW 連續氣力加成，或兩者並存？（SRW-03、CHR-12、AI-16）
3. **能否指定部位攻擊**：玩家／AI 直接瞄部位，還是只靠武器與效果改命中權重？（CMB-12、AI-08、SRW-07）
4. **部位壞與駕駛員傷的先後**：同一擊同時觸發時先跑哪組，部位防護是否當下失效？（CMB-14、CMB-18）
5. **駕駛員傷勢永久化**：是否有跨戰鬥休養的暫時傷，及無法自然恢復的永久傷？（CHR-10、CHR-11）
6. **戰後不自動補滿**：機甲部位 HP 與駕駛員 HP 戰後是否延續，HP 歸零的部位可修還是只能換？（CHR-16、OPS-04）
7. **駕駛員主動資源池**：要不要 SRW 精神指令式的 SP，一次性效果「只作用於下一次」？（SRW-01、SRW-02）
8. **撤離方式**：只准整機到邊緣撤離，還是支援駕駛員棄機逃生？（AI-17、CHR-15）
9. **AI 情報政策**：全場公開、各機感測，還是陣營共享感測？（AI-05）
10. **營運層範圍**：同時一份契約還是多份並行，敵軍隨玩家戰力縮放還是接約前固定？（OPS-12、OPS-19）

## 沒做到或證據不足的

- BB 拆解本身是靜態調查（Build 23856902），native 尋路、多人控制區觸發次序、同時到期排程、RNG 浮點轉換、heat 擴散均標為證據缺口；表中相關列只記到「原作可證」為止，未補造。
- 人物組：傷勢生成門檻、抽選池、倖存機率與士氣全階段崩潰行為，在指定拆解主文中沒有完整交代；CHR-10／CHR-11 另用 `analysis/character-effects/injury-rules.csv` 補細節，但 `source` 仍只指主文標題。若要把士氣與傷勢寫成正式規則，需另補拆解（交接書範圍外）。
- 營運組只挑代表性契約家族（護送、巡邏、防村、會戰），未展開全部家族。
- SRW：WebFetch 當時 502，子 agent 依搜尋摘要撰寫；領導已核 8 個 URL 有效、抽 3 頁對過關鍵句，但 Strike／Fury 等 SP 數值與 Gaiden、OE 的部位破壞系統沒查到。
- 有幾組列內容重疊、未合併（各自出處不同，留給頂層裁定是否合列）：CMB-16 與 DAT-06（屬性重算與部位最大 HP 變動）、OPS-02 與 DAT-12（日結發薪欠薪）、CMB-04 與 DAT-16（額外 AP 重扣異常）。
- `design_note_ref` 的「架構」被標在 79／107 列，工人傾向把凡涉及資料化的列都掛上，篩選時參考價值偏低。

## 需要決定的事

- 上面 10 個 open_question；其餘 97 列的問題留在 `mechanics.json` 的 `open_question` 欄。
- 是否合併上述三組重疊列（領導預設不合，保留出處各自可追）。
- 是否要另開一條線補 BB 的「人物效果」拆解（BB 拆解 README 自己標為待補 `pending.md#p01-人物效果`），士氣崩潰與傷勢生成要寫成 spec 前需要它。
- SRW 來源一律改用 `www.akurasu.net`（`neo-akurasu.duckdns.org` 鏡像不穩），若頂層要寫進 spec 引用，建議沿用原站。
- 形態裁示（網頁、MUD 風）依交接書未對應。

## 以後交接書該點名的工具

- 合併驗證：一支小腳本逐列核 `source` 檔案存在＋`grep -F` 段名＋值域（本線放在 scratchpad，未入庫）；若常用可收成 `wf/tools/` 的 `tabledb.py` 子指令（例：`check-source`）。
- SRW／外部 URL：交接書應寫死「URL 有效＝`curl -sL -o /dev/null -w '%{http_code}'` 回 200」，並列優先站點（akurasu.net 原站）。
- codex 工人無法寫 ROSTER（沙箱只放 `-C` 與 `wf/inbox`）：交接書範本的「codex 線上線先在 ROSTER 追加自己一格」對 `-s workspace-write` 線不可行，應改由領導代登記或把 ROSTER 移到 `wf/inbox/` 下。

## gpt-6-astra 這次觀察到的癖好

- **很快**：五條線約 5 分鐘全部交 DONE，三條驗收自查都有做、自報數字與領導重算一致（source 22/22 等全對）。
- **頂著上限填**：五組都填到或幾乎填到件數 gate 上限（22／21／18／22／16），像把上限當目標；下次若要精簡，交接書直接給目標數而不是區間。
- **標籤過度**：`design_note_ref` 多選時傾向全掛（「架構」佔 74%），要求「最多兩個、第一個是主對應」會更好篩。
- **文字偏翻譯腔、句子長**，但事實層次分得清楚（明確區分「主文確認」與「證據表補充」、不把靜態結論說成實測），沒有越界讀 vendor 或上網。

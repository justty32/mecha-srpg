# 已讀清單

以下九個指定路徑均由 cx-pe-scan 親自閱讀；相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/specs/world/machine-souls.md`
- `wf/workflows/planning/specs/world/resistance.md`

另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、inbox README／PROTOCOL 與相關原文。未啟動子代理，子代理成本為零。

## 做了什麼

按交接書六組路徑逐目錄在 repo 根跑 rg，包含全部指定關鍵字；每組掃完跑 inbox_poll.sh cx-pe-scan --once，沒有收到新 orders。content/base 僅將白名單文字欄納入判句；人物清單另讀必要的 id、kind、born、died、events 與駕駛員身分資料。沒有掃排除目錄；lore 的檢查程式不是玩家或設計敘述，不計入文字判句。

逐句判讀後，另用換機、別的機甲、衰弱、抽乾等詞補找 B 的相關句。以 tabledb 的 Table／save 寫兩份 wf-table/1 清單；只寫本目錄三項交付與允許的暫存、回報信，未改內容、設計檔或程式，未 commit。

產物：[scan.json](scan.json) 35列；[candidates.json](candidates.json) 23人（17名 lore 人物，6名僅 base 的人類駕駛員；重複人物合併）。年資依可用證據由高到低排；區間依保守下界排，不明置末。同為年份差者不代表連續服役或滿整年，首駕不明不以事件年份冒充。

驗收結果：僅交接書固定四條，全部通過；執行證據見下列四項。

1. 兩份 json 的 json.load 與指定 tabledb get 0 均成功，contract 均為 wf-table/1，欄位名稱與交接書完全一致。
2. scan 每列判定只含矛盾／宜點明；所有檔案落在六組授權路徑。列數35，未達150列 gate；原文均保留來源句或完整欄值，至多200字。
3. 人工逐一讀 lore 人物 body 並核對本人駕駛／認主和 died；17名符合者均在 candidates。自稱認主的薩米爾與傳聞中的 M-3 保留證據層級；無本人駕駛證據的旁觀學者未因提到別人認主而誤列。
4. REPORT 第一段逐行列齊「先讀」九個路徑。

## 統計

| 裁示 | 矛盾 | 宜點明 |
|---|---:|---:|
| A 無人化 | 2 | 23 |
| B 精粹改人 | 0 | 10 |

指定關鍵字篩出860個句／欄命中：lore 596、base文字18、design-notes 184、world spec 52、world-pillars入口3、子目錄7。計數單位為檔案＋欄位＋以句末標點／換行切出的命中；同一句多關鍵字只算一次，不是字串出現次數。

其中46個命中由清單列或同檔同議題合併涵蓋，814個判為不改。補搜的 B 句另列，故35列與860命中不作一列一命中的減法。不改包括已有限定的白手套、搬魂失敗、七號唯一未解例外、一般老／歲、年齡並非外貌老化、技術用語與引用／識別字誤命中；不改項未混入 scan。

寫入時 scan 約22KB、candidates 約16KB、REPORT 小於8KB，均未觸發200KB gate。

## 最要緊的五處

- design-notes/mechs/bonds.md 的含意仍容許只有機魂的座艙；需註明已被新裁示覆蓋，保留歷史引文。
- specs/world/mech-lifecycles.md 的共通骨架仍列只有機魂的座艙，與本檔後段禁獨駕互撞。
- content/lore/glossary.json 將 AI 一概對應成機魂，容易讓後續文案把傳統規則 AI 寫成會成長的人格。
- specs/world/ruins-and-ancient.md 的不能換機／機體異能不可學，需與人身精粹能力的跨機攜帶明確分開。
- 丹增的「十九年被抽乾」與奧爾森的「比任何時候都老」只列宜點明；不把認主負擔、疲憊修辭或起駕時已中年直接判成老化矛盾。

## 沒做到或證據不足的

無工具或權限阻塞。未替任何角色確定「不老」、未創作人物、事件、台詞或能力上限／代價。沒有做交接書四條以外的專案驗證。

伊爾瑟 born 2073＋十九歲得2092，與同段「鐵砧改組後」及2093成軍不合；保留15–16年區間。茉莉只能由衍型機問世至鹽鷗成軍推2091–2096。瑪拉的2103入團不是首駕證據。其他最早戰績僅是首駕上界，各列都有說明。

六名 base 獨有人物只有現有 human／pilot 身分，無 body、events、出生或首駕年；納入但相關欄均不明，沒有把技能數值當履歷。另外20名沒有 lore 對應的 base 人類只列技師、研究員或古代機候選等身分，缺少已駕駛的證據，未假定人人開過機甲。M-3 的存在／存活／認主與薩米爾的認主本來就未證實，清單保留這個限制。已載 died 的人物，包括2108-01死亡的老桂，不列入存活候選。

丹增五十二歲起駕，現在七十一歲或被叫老太太不是矛盾；薩米爾「四十五歲像六十」沒有寫老化發生在駕駛期間，不判矛盾。基羅加白髮、洛桑年長、老鴿老頭等沒有本人機甲駕駛證據，亦不判矛盾。

farside-ruin-belt.json 已寫白手套沒有精粹核；依「同檔已有任何限定則不另列」保留挖掘隊／看守／運車無人句。已限定白手套的其他檔同理。七號回港依 essence.md 的已定例外保留。

## 需要決定的事

領導決定35列進哪些改寫批次；宜點明包含拿不準的邊界，並非要求全部改。歷史裁示引文保留，只補新裁示的適用範圍。古代機認主禁換機與人的能力可攜如何並存，交領導裁，不由本線取消舊規則。23名人物是否點出外貌老化變慢，由使用者決定；最長約十九年，不用二十年以上的現役年資填人物。

## 以後交接書該點名的工具

無。現有 rg、tabledb.py、python3 json.load、inbox_poll.sh、inbox_mail.sh 足以完成；暫存 Python 只用標準庫攤平文字欄、記索引與產出資料，不需新增依賴。

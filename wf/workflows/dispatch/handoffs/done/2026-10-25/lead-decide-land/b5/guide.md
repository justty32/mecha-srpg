# B5 翻譯腔重審三批（dl-01／dl-02／dl-03）共用指引

lead-decide-land（總 REPORT 待頂層代存為 `../REPORT.md`）｜裁示 [talk-decide misc](../../../../talk-decide/decisions/misc.md)「B5」｜潤飾規矩 [content/polish](../../../../../../content/polish.md)｜文字準則 [content/lore-text](../../../../../../content/lore-text.md)

**狀態：2026-10-25 lead-polish 跑完 dl-01～05，全部 accepted（見 [lead-polish REPORT](../../lead-polish/REPORT.md)）。** 開跑的領導照 [content/batch](../../../../../../content/batch.md) 流程：把 `dl-0N.manifest.json` 複製成 `content/batches/2026-10/dl-0N.json`（`base` 填開跑當下 HEAD）、開 worktree、把 `cx-dl-0N.md` 裡的 `$WT` 換成 worktree 絕對路徑、`brief_lint --strict`、派 codex（`gpt-6-astra`、reasoning high）。三批檔案不重疊，可以並行；與其他 lore 批次並行時先確認沒有同檔。

## 範圍（使用者 2026-10-25「都按照建議」）

只審 lore **敘述欄**：文字欄 `summary`、`body`、`note`；敘述欄（manifest `allow.proseFields`）`consequences`、`role`、`scale`、`doctrine`、`ideology`、`mechSeries`、`status2108`。**不碰** `name`、`aka`、`title`、`tags`、`region`、`hq`、id、日期、引用；不碰 spec、design-notes、`content/base/`。

| 批 | 檔數 | 內容 |
|---|---|---|
| dl-01 | 41 | 勢力 31（全部）＋候鳥號與開局常見人物 10（老桂、阿鏽、陳小海、伊爾瑟、瑪拉、老班、葛西蓮、賽義德、蔡明珠、七號） |
| dl-02 | 40 | 人物 40（含白手套與塞勒涅相關、點名不老的四人、老爹、達卡與吉大港四人） |
| dl-03 | 40 | 人物其餘 15、時代 7、`timeline.json`、事件 15（含白手套與七號相關 6 件）、地點 2（靜海市、背面墟帶） |

三批之後仍未審：事件 56、地點 48（共 104 檔），另排第二輪。

## 翻譯腔怎麼改

照 [polish](../../../../../../content/polish.md)「首要標準」與 [lore-text](../../../../../../content/lore-text.md)「文字潤飾準則」：中文母語語感，不是英文換漢字。常見病：「一個……的存在」「進行了……」「對於……來說」「被……所」被動堆疊、長串定語、「它的」「他們的」代詞過多、英文語序的插入語。保留原意、事件走向、數字與專名；不新增具名人物與事件；禁用詞照 [style.md](../../../../../../../../content/lore/style.md)。

**第一輪退回的教訓（2026-10-25 lead-polish，dl-01～03 第 1 輪都因此退回）**：① 「長」是風格不是翻譯腔——機魂人格「長出東西」「長成什麼」照留（style.md 總綱第 2 條）；② 刻意的比喻與冷硬短句（「撕開她」「債的最後一道形狀」「管軍隊的抽屜」）不要壓平成白話；判準是母語讀者讀舊句會不會彆扭，不會就別動；③ 對齊表沒點名的檔不硬塞設定說明句，點名的也只寫一句、不放在段落收尾；④ 慣用語別用反（「留條後路」是留一手，不是互為退路）。

## 裁示對齊（2026-10-25 talk-decide；命中才改，不命中不硬加）

| 對齊點 | 怎麼寫 | 落在哪些檔 |
|---|---|---|
| 機甲核心 | 裝在機甲上的那顆叫**機甲核心**（簡稱核心）；「精粹核」只用在原料（獸體內、墟出、煉）。白手套「沒有精粹核的鐵偶」→「沒有機甲核心的鐵偶」 | 先跑 `grep -rn 精粹核 content/lore`，命中的檔都在三批裡 |
| 機魂能獨駕、成長慢 | 「機魂不能獨駕」「座艙裡一定要有人」類句子改掉：機魂驅得動機甲核心、能獨駕，但長得很慢；不可複製照舊。七號 2104 回港改讀成「第一次有機魂在沒人的座艙裡把機甲開回家，它怎麼做到的至今沒人說得清」 | selene、tsai-mingzhu、unit-07（dl-01）；tide-line、first-registered-soul（dl-03） |
| 無人機只能普通開 | 遙控與傳統 AI 驅不動核心，只會走、會開槍，沒有招式；白手套鎮壓與催收用無核心鐵偶，守牆才派有核心的遙控機。塞勒涅可補一句「每台裝了核心的無人機都在浪費一顆核心」 | selene、tsai-mingzhu、whitegloves（dl-01）；glove、zheng-weizhou（dl-02）；whiteglove-incident（dl-03） |
| 開機甲的人老得慢 | 一兩句寫外貌比年資年輕；丹增・卓瑪寫成「老得慢」（52 歲才上機），不寫成年輕 | ilse-brandt（dl-01）；tenzin-dolma、ines-huaman、yoon-seoyoung、greg-olsen（dl-02） |
| 老爹身世（提案） | 若與檔內既有敘述不衝突，可寫成「開了十幾年的城防 AI，在某個大潮時刻醒了」；衝突就不改，寫進 REPORT「需要決定」 | old-man（dl-02） |
| 沐蝕會讀法（提案，可選） | 「不老是蝕的恩賜」一句，順就加、不順就不加 | tide-creed（dl-01） |

**不要寫**：塞勒涅三層知情（2086／2095／2097）——那是隱藏真相，等 engine-backlog 第 45 列標記落地；拿其他作品類比大潮停戰或任何事件；**SS／SSS 不新增任何設定**（使用者 2026-10-25：背景版、很後期才有；目前展現過最強都是 S；既有「接近 SS」之類句子照原意保留，不加強、不展開）。精粹核／機甲核心原話：「人類拿精粹核，做出了機甲核心」。

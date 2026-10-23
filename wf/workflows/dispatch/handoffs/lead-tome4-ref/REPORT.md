# lead-tome4-ref REPORT：ToME4 → 機甲 SRPG 可選機制表第二卷

[交接書](../lead-tome4-ref.md)｜機制表 [mechanics-tome4.json](mechanics-tome4.json)（60 列）｜第一卷 [BB mechanics.json](../lead-combat-ref/mechanics.json)

**結論**：ToME4 的資源／天賦與 AI／時效效果／傷害結算／物品神器五組已拆成 60 列可選機制（採用 12／改造 46／不採用 2），每列附 `vendor/` 原始碼 `檔案:行號`；領導重核 60/60 列的反引號識別字都在所引行 ±5 行內，另抽 10 列人工對行 10/10。`note` 欄標出與 BB 卷互補 34 列、衝突 11 列。STATUS：DONE。

## 全貌

ToME 正好補上 BB 卷沒有的那一半：BB 給的是「人物＋裝備兩個容器、一條固定順序的傷害鏈」，ToME 給的是**掛在容器上的東西怎麼資料化**。五組的共同骨架是「定義表＋實例狀態＋可撤回的貢獻」：資源用 `defineResource` 登記種類，實例只存儲量與邊界（TM-01、TM-04）；天賦用 `newTalent` 宣告模式、成本、冷卻、目標與 `tactical` 權重，三種模式（主動／維持／被動）由同一個 `useTalent` 分派（TM-13、TM-19）；時效效果用 `newEffect` 宣告分類與參數，`setEffect` 負責補預設值與合併，屬性變更走 `addTemporaryValue` 拿 ID、撤除時按 ID 退回（TM-28、TM-29、TM-34、TM-35）；傷害類型是 ID＋共用 `projector`，抗性、穿透、親和、護盾吸收、轉移都是 `onTakeHit` 上的固定節點（TM-39～TM-46）；物品的 `wielder`、ego、神器主動技、命中觸發都是同一套「穿上時加貢獻、脫下時撤」（TM-50～TM-58）。搬到機甲的主要改寫有三點：① ToME 所有東西都掛在單一 Actor 上，本作要把目標拆成「機體／部位／層／駕駛員」，因此每個效果與貢獻都要帶目標與來源（TM-27、TM-50）；② ToME 的抗性、護甲、護盾都是整個 Actor 的屬性，沒有部位層，工人一致建議把它們重新配置到「層」上（TM-41、TM-44、TM-48）；③ ToME 的戰術 AI 是「先算需求 `want`、再在最高需求類別裡取最高分」的兩階段選招（TM-25、TM-26），和 BB 的加權抽選不同，要擇一。不採用的兩列是等機率隨機選招（TM-21）與以隨機詞綴拼出古代機甲核心能力（TM-60）。

## 做了什麼

- 讀交接書點名的 AGENTS.md、team-model、dispatch README、codex-exec、investigation、user、data-files、design-notes、decisions、model-quirks、lessons（含 leading／evidence 兩子檔）；讀前一卷 REPORT 與 `mechanics.json` 當格式範本。
- ROSTER 追加 `lead-tome4-ref` 一格，並代登記五個工人；`inbox_team.sh create tome4ref` 後 `add` 五個工人。
- 讀 tome4 真相層 README、resources、items-and-egos 等索引，確認原始碼路徑。交接書寫的 `modules/tome/class/…` 與 `modules/tome/ai/` 實際在 `modules/tome/mod/class/…`、`modules/tome/mod/ai/`，子線交接書已改用實際路徑。
- 寫五份子線交接書 `cx-tome-{res,talent,effect,damage,item}.md`（目標列數 12／14／12／11／11，合計 60；gate＝目標＋4），`brief_lint --strict` 全 0 違規。要求 `source` 必須是 `vendor/` 原始碼行號，且 `ref_mechanic` 用反引號寫出至少一個在所引行 ±5 行內的識別字；`design_note_ref` 從七個標籤選最多兩個、第一個是主對應。
- 21:48 以 `codex exec -m gpt-6-astra -s workspace-write` 派出五條，`-C` 各指自己目錄、`--add-dir wf/inbox`；前景 `inbox_poll.sh --wait` 收信，21:52–21:54 五封 DONE 全到。五個行程都已結束，log 尾端都有 `tokens used`。
- 逐份片段用腳本重核：十欄非空、值域合法、檔案存在、識別字落在 ±5 行內，五份都是 0 違規；另抽 10 列人工對行，10/10 命中。`inbox_ack.sh --apply` 歸檔十封信（5 PROGRESS＋5 DONE），STATE 每條工人記一行。
- 合併腳本重編 `TM-01`～`TM-60`（原編號 `TM-A01` 等留在 `note` 開頭），交叉引用一併改成新編號，`note` 補上與 BB 卷的互補或衝突；`tabledb.py` 讀得出、`count` 60。

## 產出

| 產物 | 路徑 |
|---|---|
| 可選機制表第二卷（wf-table/1，60 列） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/mechanics-tome4.json` |
| 子線交接書 ×5 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-*.md` |
| 工人 REPORT＋片段 ×5 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/cx-tome-*/{REPORT.md,fragment.json}` |
| codex log／pid／last | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tome4-ref/logs/` |

分佈：五組 A 資源 12（TM-01～12）、B 天賦 8＋AI 6（TM-13～26）、C 效果 12（TM-27～38）、D 傷害 11（TM-39～49）、E 物品 11（TM-50～60）。建議 採用 12／改造 46／不採用 2。`design_note_ref` 出現次數：效果 27、架構 24、古代能力 18、資源 17、戰鬥系統路線 12、AI 11、層 8；作主對應的列數：效果 16、資源 14、古代能力 10、AI 7、層 5、架構 5、戰鬥系統路線 3。與 BB 卷的關係：互補 34、衝突 11（TM-04、06、14、23、26、30、34、47、48、50、54），其餘是 BB 卷沒有對應。

### 五條裁示的對應

**資源**（機甲有零到多個資源池）：ToME 的 `defineResource` 幾乎可以直接當通用資源池（TM-01）：種類、上下限（`false`＝無上限）、`regen_prop` 增減率、反向資源（`invert_values`，越高越糟，正好對應熱量或古代機甲的不穩定度，TM-03）。成本由每個天賦用「資源鍵→數量」宣告，扣費時依方向扣減或累加（TM-06、TM-14），使用前逐池檢查上下限（TM-07）。閾值後果有兩個範本：equilibrium 的失敗率（TM-08）與 paradox 的異常反噬（TM-09），後者建議給古代機甲。持續技佔用資源有兩種方式：壓低上限或抬高下限（TM-10），或每回合抽取（TM-11）；耗盡後停用要明確寫在資料裡，ToME 原版只有部分路徑會觸發（TM-12）。要改的是「池綁在已學的隱藏天賦上」（TM-02）：改成由機體與部件宣告池清單，零個也合法。物品自帶的 `max_power` 充能是另一種池（TM-56）。

**層**（部位是有序的層序列）：ToME 沒有部位也沒有層，但 `onTakeHit` 的處理順序可以拆成層：比例減傷（TM-45）→ 位移轉移（TM-46）→ 護盾吸收、溢出往下傳、耗盡移除（TM-44，最接近「護盾層 HP」）；類型抗性以剩餘比例相乘並有上限（TM-41），抗性穿透只削正抗性（TM-42），護甲以 `apr` 抵銷且只擋傷害中受保護的部分（TM-48）。工人一致建議把這些值掛到「實際受擊的那一層」，沿層序列逐層取值。和 BB 卷最大的衝突在 TM-48：BB 護甲是會被磨掉的 HP，ToME 護甲是不消耗的減傷值。天賦目標資料可以帶部位識別，命中後沿層序列結算（TM-17）。

**效果**（部位打壞的後果與傳到駕駛員）：這是 ToME 最成熟的一塊。效果定義帶 `type`／`subtype`／`status` 分類（TM-27），`parameters` 補預設值，讓同一效果依來源改變強度（TM-28）；重複施加走 `on_merge`，沒有就先移除再重套（TM-29）；`activate`／`deactivate` 成對、`on_gain`／`on_lose` 發通知（TM-31、TM-32），`on_timeout` 做週期作用（TM-33）；屬性貢獻掛在效果實例上，撤除時自動清理（TM-34、TM-35）；豁免、免疫、按標籤清除各有入口（TM-36～TM-38）。搬過來的關鍵改寫是**效果要帶目標**：同一份故障效果要能落在機體、部位、層或駕駛員上，同名效果要能依部位分開（TM-29），部位壞掉傳到駕駛員就是「以人物為目標再施加一個受創效果」（TM-32、TM-33）。

**古代能力**（逐台獨一無二、自帶能力、多半不產熱）：ToME 神器的模式是固定 `define_as`＋`unique` 身分（TM-53），主動技有兩種：`use_power` 自訂函式並回報是否真的使用（TM-54），或 `use_talent` 借用共用天賦並暫時指定等級（TM-55）；被動用 `talent_on_hit`／`special_on_hit` 掛命中觸發（TM-57），用 `on_wear`／`on_takeoff` 成對建立與撤除狀態（TM-58）。建議古代機甲逐台完整定義能力清單，能力引用共用動作與效果原語，資源只指向該機體自己宣告的池（TM-02、TM-14）；高負擔觸發異常的 paradox 模式很適合當古代能力的代價（TM-09）。不採用隨機詞綴拼核心能力（TM-60）。

**AI**（要有 AI）：ToME 戰術 AI 的資料面是每個天賦的 `tactical` 表。`use_tactical` 先過共用的可用性檢查（冷卻、`preUseTalent`、射程＋半徑，TM-22），可用 `onAIGetTarget` 換目標（TM-23），用投影算命中的敵友數、乘上偏好與等級、扣掉友軍傷害（`ally_compassion`）得分（TM-24），另把生命低等「需求」放在 `want` 表（TM-25），最後先選需求最高的類別、再在類別內取最高分（TM-26）。建議採用「AI 與玩家共用同一動作入口＋能力宣告戰術標籤」的結構，評估要改成能估部位、層與駕駛員後果；等機率隨機選招（引擎 `dumb_talented`，TM-21）不採用。工人在靜態閱讀時發現 `tactical.lua` 的 `force_target` 讀的是候選清單而不是被選中那一項（:190–191 對 :440），可能是原作 bug，未經實跑證實。

### 最該先拍板的 8 個 open_question

1. **AP 也是資源池嗎**：裝備提供的能力能不能同時花駕駛員與機甲各自的資源？（TM-14，與 BB CMB-03「AP＋疲勞固定兩項」衝突）
2. **熱量要不要硬上限**：禁止繼續產熱，還是允許超載並承擔閾值後果？是否允許特定動作略過上限？（TM-03、TM-07）
3. **資源何時更新**：單位行動前、行動後，還是全體共用的回合邊界？（TM-04，與 BB 疲勞「首次行動才回復」衝突）
4. **效果的時鐘**：時效按受影響單位的行動遞減，還是按戰場整輪遞減，歸零在哪個階段撤除？（TM-30，與 BB CMB-20「效果自管時鐘」衝突）
5. **同名故障依部位分開嗎**：同名效果依受影響部位分開，還是合成機體整體狀態？（TM-29）
6. **裝甲減掉的傷害要不要扣層 HP**：（TM-48，BB 護甲是會磨損的 HP、ToME 護甲不消耗，兩卷正面衝突）
7. **古代機甲能力怎麼取得**：裝備即取得，還是駕駛員要另行解鎖？（TM-16）
8. **AI 知道多少**：評估敵方部位時能讀完整內層資料，還是只用已偵察資訊？（TM-24；decisions 第 9 題已定陣營共享感測，這題是它的細化）

## 沒做到或證據不足的

- 全部是靜態讀碼，沒有跑 ToME。工人自己標出的證據邊界有：遠程攻擊的 `checkHit` 呼叫端沒在允讀範圍內證實（TM-47 只主張共用函式與近戰呼叫）；神器全域去重、ego 抽樣與互斥規則、`addRandartProperties` 內部的權重都沒讀（TM-53、TM-60 只主張宣告）；命中觸發的執行次序與再觸發上限沒追（TM-57）；`canBe` 是查詢，不是每次施加都會自動跑的全標籤檢查（TM-37）。
- `tactical.lua` 的 `force_target` 傳遞疑點（見上「AI」段）只是讀碼推斷，未實跑。
- 「層」作主對應只有 5 列（出現 8 次），因為 ToME 本身沒有部位層，相關列都是把整個 Actor 的屬性改寫成層；層序列的結算規則仍以 BB 卷的 CMB-13／CMB-14 與 decisions 第 4 題為主。
- 交接書列的 `modules/tome/class/…`、`modules/tome/ai/tactical.lua` 路徑不存在，實際在 `modules/tome/mod/…`；表裡一律用實際路徑。

## 需要決定的事

- 上面 8 個 open_question；其餘 52 列的問題留在 `mechanics-tome4.json` 的 `open_question` 欄。
- **兩卷衝突要擇一的 11 列**（`note` 以「衝突」開頭）。其中最根本的是屬性模型：BB 每次從基本值全重算（CMB-16／DAT-06），ToME 用可撤回的貢獻 ID 增量加減（TM-34、TM-50）。兩者都能支援「部位壞了撤掉效果」。我的預設是寫 spec 時採 BB 全重算當真相、ToME 貢獻 ID 當「誰貢獻了什麼」的記錄，未拍板。
- 扣費時機與失敗退費兩卷不同（TM-06、TM-54 對 BB CMB-05）：BB 先扣、失敗不退；ToME 後扣、沒用成就不扣。
- 選招流程兩卷不同（TM-26 對 BB AI-03）：ToME 先選最高需求類別再取最高分，BB 依分數加權抽選。
- 是否要另開線，經實跑確認 `tactical.lua` 的 `force_target` 疑點；只有要沿用 ToME AI 實作細節時才需要，預設不開。
- 兩卷是否合併成單一表：欄位已對齊（BB 卷的 `bb_mechanic` 對本卷的 `ref_mechanic`，本卷多 `ref_game` 與 `note`）。預設不合併，由頂層寫 spec 時並讀。

## 以後交接書該點名的工具

- `source` 是 `檔案:行號` 時，驗收可寫成「反引號識別字落在所引行 ±5 行內」，用一支小腳本全跑（本線放在 scratchpad，未入庫）；常用的話可收成 `tabledb.py` 的子指令（例：`check-source --window 5`）。
- `inbox_ack.sh --from <工人>` 會因信件路徑含 `tools/../inbox` 而拒絕（`message is outside the inbox`）；改傳 `wf/inbox/mail/<領導>/*-<工人>-*.md` 的正規化絕對路徑就能用。工具該在比對前先 `realpath`。
- 頂層交接書寫原始碼路徑前，先 `ls` 確認存在（本次 `modules/tome/class`、`modules/tome/ai` 都不存在）。

## gpt-6-astra 這次觀察到的癖好

- **一樣很快**：五條線 4–6 分鐘全交 DONE，自報的 source 命中數與領導重算一致（60/60）。
- **給目標數就剛好交目標數**：12／14／12／11／11，一列不多，證實「給目標數不給區間」有效。
- **「最多兩個、第一個是主對應」有效**：不再全掛標籤，`架構` 從上一卷的 74% 降到 40%（24/60），主對應只有 8%。
- **證據邊界標得很清楚**：會主動寫「本列只主張宣告，未證實執行」「允讀範圍外未查」，不越界讀檔補證據；也會指出原作疑似 bug（`force_target`）並註明未實跑。
- 文字仍偏翻譯腔、句子長，REPORT 的「做了什麼」段常把驗收條文重抄一遍。

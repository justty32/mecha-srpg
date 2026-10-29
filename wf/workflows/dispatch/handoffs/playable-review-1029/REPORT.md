# 本輪獨立唯讀審查

> **子線階段報告。** 最終整合驗證及交付見[主REPORT](../lead-playable-1029/REPORT.md)；下文保留當時交接狀態，並非最新整體待驗清單。

## 做了什麼

親讀 AGENTS、feature-dev、testing、common/user 及兩個子頁、conventions、code-map、本輪 playable-battlefield spec 與主 brief 驗收。以 `git status --short`、`git diff HEAD --`（含 staged 與 unstaged）及直接讀取 untracked battlefield.ts／相關測試，核對互動拒絕、物件所有權／迷霧、崩塌拾取、存讀命令、營運 loot 與新 snapshot cache。只做靜態追蹤，沒有測試、探針或產品修改。

## 產出

確認 1 件玩家可觸發缺陷：

### R1／P1：投石繞過怪獸抵抗性與凡鐵外甲限制（歷史發現，第二輪已見修復）

- 位置：`src/rules/battlefield.ts:103`。
- 觸發：進入「常規地面編組交火」，讓常規戰車／工程車拾取碎石，接近可見怪獸後按「投石攻擊」。目標仍有外甲時應受凡鐵倍率；外甲已破而內層未破時應受外甲可及範圍限制。
- 證據：新車輛 frame 明列 `conventional-arms`；`resistance.ts:resistance()` 對此攻方打 kaiju 回傳 `conventionalFactor` 與只允許 outer 的 `reach`。正常攻擊在 `attack.ts:resolveAbility()` 經 `modifiedAmount()` 計算倍率並傳 `reach`；投石卻直接把常數 12 傳入 `applyPacket()`，既無倍率也無 reach。`layers.ts:runLayers()` 只在傳入 reach 時擋內層，因此石頭可全額傷外甲並繼續打到怪獸內層／核心。機甲跨級投石也同時漏掉等級抵抗性。
- 影響：玩家能以拾取碎石繞過既有常規兵器對怪獸的核心防護規則，與同一車輛的正常武器結算不一致。
- 最小修法：讓投石沿用既有 `damageFactor`／`resistance` 修正（不需重設命中機制），把其 factor 乘到內容傷害，並把 resistance 的 reach 傳給 applyPacket。增加常規車輛對 kaiju 外甲／裸內層，以及低階對高階怪獸的回歸；測試由隊長排程。

已核對非缺漏：`damageTerrain()` 第 59–61 行會產生穩定 `debris:<cellKey>` 物件，數量讀 `battlefieldDebrisCount`，保留已領取物件避免再生。`interact()` 先在 clone 完整預演；新命令已進 save command parser；MapDef→setup→state 有複製；cache 的 snapshot 對外 clone，dispatch 起始失效。

## 沒做到或證據不足

依禁令未跑測試、headless、效能探針，亦未宣稱 full suite 或實際 UI 驗收通過。投石無 Hit/Miss 預覽事件，但本輪 spec 沒要求投石另擲命中，因此不列缺陷。營運 `guests` 過濾可能丟棄玩家回收的友軍來源 loot，但現有護送目標死亡可能立即終局，尚無完整可觸發證據，不列 finding。未擴查歷史產品或三個既有 review log。

## 需要決定

無使用者決策需求；請隊長派修 R1 並納入唯一序列測試程序。以後交接書應持續點名 `git diff HEAD --`、`git status --short`、`rg`，並明列 untracked 產品也在審查範圍；本線只寫此報告。

# 2026-10-29 第二輪：幾何命中／傷勢／防禦

## 做了什麼

重新讀更新後 review brief、combat-aim-injuries-1029.md、combat-defense-1029.md。核對最新 staged／unstaged／untracked 產品及直接依賴，追蹤 aim、motion 自身回合重置／wait resume、vital→killUnit、器官能力映射、mobilityMinimum、manipulator、盾層與招架、UI shared query。先與 engine 確認 schema、save 形狀驗證、新測試仍在收尾，這些進行中項目沒有當成缺陷。

## 產出

本次找出 1 件具體玩家問題，通知後 engine 已即時修復；最新樹無確認仍存的待修 finding。前輪 R1 已見投石套用 resistance factor/reach，本次不重複列入待修。

### R2／P2：定身／縛網後仍可付費側閃，並獲得側移迴避收益（已見即時修復，待測）

- 位置：`src/rules/aim.ts:50` 的 canManeuver；呼叫端 `src/rules/command.ts:80` 與 aimInfo。
- 觸發：有閃身能力的燕鷗被既有「縛網」mx-netted 命中（immobilized），在仍有 AP／燃料時啟動 mx-flaring；或先閃身、後中縛網。附近保留一個可走鄰格即可。
- 證據：真移動在 `movement.ts:stopped()` 明確拒絕 rooted／immobilized；canManeuver 卻只驗 locomotionOf 與 stepCost，而 stepCost 不讀這兩個效果標記。checkAbility 用 canManeuver 當唯一側閃空間資格，aimInfo 也靠它決定是否把 maneuver 加入誤差。因此無法實際移動的縛網單位仍能成功付款啟動側閃、取得 1.5 maneuver，與實際移動限制相反。既有 mx-bind-shot 可套 mx-netted，無須捏造資料。
- 影響：縛網／定身控制不能阻止需要側移空間的付費迴避，玩家可在不能移動時繼續靠側移降低被命中率。
- 最小修法：canManeuver 共用實際移動的狀態資格，至少排除 rooted／immobilized，仍不要用 AP 或 reachable 阻止已預付迴避；同一資格供 checkAbility 與 aimInfo。回歸涵蓋「先縛網後啟動」原子拒絕與「先啟動後縛網」maneuver 歸零。已即時通知隊長與 engine。
- 收尾重讀：engine 已在 `movement.ts:46` 匯出 canMove 共用 stopped 資格，`aim.ts:51` 已改用 canMove；因此上述靜態缺口已關閉，測試證據由 engine／隊長補，不宣稱本審查跑過。

靜態已確認：100% 使用 d100（0..99）且 roll<chance，不會另擲防禦 miss；新自身回合清 motion／defense，wait resume 不清；無 blood／heat／charge 池的對應 injury 被跳過；vital poolDepleted 走正常死亡；器官映射與 manipulator 已進真 command 邊界，並非只顯示標籤。

## 沒做到或證據不足

未跑任何測試／探針或改產品。engine 尚在補 schema／save 驗證與傷勢防禦回歸，不宣稱這些已通過。遠射／光束超過招架容量時會觸發 overload，即使該攻擊不適用招架；新 spec 對「不適用」與「過載」優先序沒有足夠明確的反例，未列 finding。未取得足以列出其他四件問題的證據。

## 需要決定

無使用者決策需求；R2 已有修復，請隊長依唯一序列排程收取回歸證據。後續仍使用 git diff、git status、rg，對持續寫入中的檔案先確認所有權與凍結邊界。

# 2026-10-29 第三輪：多部位實判與預覽

## 做了什麼

親讀 combat-part-hits-1029.md，只追蹤 part-hits.ts、applyPacketDetailed、attack 新整合、session／UI 預覽與三種 partPattern／七份 partAdjacency。未重列前兩輪功能問題，未跑測試或改產品。

## 產出

新增 1 件 P2：

### R3／P2：盾擋穿透的預覽部位與實判路徑不一致

- 位置：`src/sim/session.ts:84` 的 partTargetInfo 回傳、`src/ui-adapter/vm/viewmodel.ts:255` 的防禦波及說明。
- 觸發：玩家在正式燕鷗的光矢連吼部位選單即可讀到錯誤的「盾擋僅保護主片，旁波仍可能傷到其他部位」提示。若受擊對象有有效盾擋，指定 torso 的純查詢另會列出錯路徑；這條可由既有戰場盾與光矢連吼組合觸發，但目前正式展示情境盾在我方，沒有宣稱用預設敵方就能重現該完整預覽路徑。
- 證據：session 直接以原 primary 呼叫 partHitInfo，所以預覽列 torso 與相鄰器官；applyPartHits 真實路徑卻先以 defense.part 盾臂承傷，盾臂計入 maxParts，再以 remaining×falloff 送 torso，已達兩部位上限，不會再傷預覽所列鄰器官。UI 對任何非 single（含 penetrate）又一律宣稱「盾擋僅保護主片，旁波仍可能傷到其他部位」，把 spread 的獨立旁波語意套到必須穿出盾臂才傷後方的 penetrate。
- 影響：玩家選入口時看錯實際第一承傷部位、可波及上限與盾的保護效果；盾完全吸收時後方實際為 0，預覽卻暗示旁波可繞盾。
- 最小修法：讓純查詢用與 applyPartHits 同一個防禦後路徑規則：盾臂→原 primary→合法鄰居，遵守 maxParts／visited，後方皆 conditional；UI 只對 spread 顯示獨立旁波文案，penetrate 明示需先穿出盾與盾臂、剩餘量再遞減。對照盾擋 maxParts2 與盾部位等於 primary 的預覽／實判回歸，由隊長排程。

靜態未見有限預算膨脹：spread 份額 schema 額外驗總和≤1，缺候選份額丟棄且防禦重合片先合併；penetrate 使用 applyPacketDetailed 真 remaining、逐段 falloff／visited／maxParts，無圖即停。每 unit 一個 Hit、防禦消耗一次，每 packet modifiedAmount／crit 一次；死亡後後續 part apply 停止，已破層與 part 不重發破壞傷勢。wave notes 沒有把真 remaining 或未知 HP 數字輸出。

## 沒做到或證據不足

engine 正補多部位單檔測試，本線未執行測試／探針，不宣稱預覽與實判回歸已通過。沒有足夠證據補列其餘四件 finding。無產品修改。

## 需要決定

無使用者決策需求；R3 已即時通知隊長與 engine，請依所有權分派 session 純查詢與 UI 文案修正。後續工具仍是 git diff、rg 與逐檔唯讀核對；測試只由隊長排程。

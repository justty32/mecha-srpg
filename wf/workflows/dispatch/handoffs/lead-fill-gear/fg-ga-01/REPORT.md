# cx-fg-ga-01 REPORT

已讀清單（以下相對路徑皆親讀主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/`；JSON 透過 tabledb 分片／條件查詢）：

`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/mechs.md`。

`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/world-pillars.md`。

`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/lead-fill-gear/gear-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`。

`wf/workflows/planning/specs/core/data-model-mech.md`、`wf/workflows/planning/specs/core/data-model-mech/equipment-and-state.md`、`wf/workflows/planning/specs/core/data-model-abilities-effects.md`、`wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-gear/plan-ga/fg-ga-01.specs.json`。

## 結果與固定四條驗收

**FAILED；14 個新內容檔已齊，未 commit、未帶回主 repo。** 基底 a1463faeb0712226b1e537e48844e6727829f83f。第 1、4 條通過；第 2、3 條不符合。未加驗收條件，未改機制規格來繞過失敗。


第 1 條：**PASS**：10 部件＋2 能力＋2 效果，精確符合 manifest.files；id 新增前逐一用 rg 查無撞名。十部件 origin 均 mechanical；能力／效果沒有 origin 欄，來源皆本批機械部件，未新增非法欄。插層 armor／shield、kinetic／acid／energy／thermal／pierce 與 armorMount 均為既有 registry。`gate.json` approved=14、violations=[]。`verification.json` 記錄逐檔大小與規格比對；最大內容檔 884 bytes（實際值以該檔逐列為準）。舊追蹤檔、黃金與營運 fixture 皆無修改。原有 node_modules symlink 保留；無索引重產。

第 2 條：**FAILED**：三項各執行一次。`npm run check` exit 0，末行 `OK 0 errors, 10 warnings`；戰鬥內容段 `OK 0 errors, 32 warnings`，警告皆指向既有檔，本批 fa- 無警告。`npm run typecheck` exit 0。`npm test` exit 1，留下 `test.log`：70 個檔級結果中 15 個 not ok（以原始 log 為準），其中 12 個 signal=SIGTERM、3 個 exitCode=1，沒有完整結尾統計；不能宣稱「無新增失敗」。未查明中止與 exitCode=1 的根因，也未擅自再跑整套。內容數值／英中名稱逐檔等於規格，僅 etymology 改為二至三句，保留提案、掛點、代價。

第 3 條：**FAILED（部分實測通過）**：`smoke.json` 與 `smoke.mjs` 可重現。runBattle seeds 1–5 各四回合，按每 seed 兩件分組，總計十件都上場，五場 outcome、rejected=0、exceptions=[]，均未分出勝方；純支援不以勝率退件。通常載體 frame/bulwark-ii／bodyplan/mx-biped-c；踏礁護足用 frame/anvil-trestle-ii／bodyplan/m2-quadruped-c。全數保留有核心、駕駛與既有武器，相符 armor-mount 安裝；眉梁只插 head，踏礁只插 front-left，其他八件只插 torso。各插層 HP／抗性逐項比對通過，不把部件自身 component 層當額外防護範圍。

第 4 條：**PASS**：本報告已讀清單齊；review.json、naming.json 各 14 列，review 最長 44 字，均 ≤60 字。smoke.json 與五 seed、兩人工能力、光幕回復的原始紀錄齊，驗收指令與 gate 原始輸出齊。

## 第 3 條的觀察值與機制缺口

兩招各有真實 AI AbilityUsed 一次：落樁站穩在 seed 3，扳扣脫網在 seed 5；沒有 AI 未使用缺口。AI 出手與人工 tryCommand 分開記錄，人工不計入 aiUsed。

人工落樁站穩：預掛牽滯＋縛網，initiative 1→13（移除 −4，再加 +8）；牽滯移除、縛網保留。人工扳扣脫網：預掛縛網＋絆足，evasion −26→−6（撤回 −15，再加 +5）；縛網移除、只有 debuff 的絆足保留。各花 AP 3、cooldown=3、使用次數記 1；短效在下一個自身回合消失。原始檔為 `manual-fa-regain-footing.json`、`manual-fa-shed-bonds.json`。

續燈光幕損傷 fixture：torso shield HP 15→19；charge 30→36，包含機體本回合 +10 與補幕消耗 −4。`screen-regen.json` 保存池事件；未靠零效果出手充數。

三項部件代價在本基底不生效：坐山重甲 initiative 預期 −2、實際 0；拒燼披甲 charge.regen 預期 −2、實際 0（仍為 10，未降為 8）；攔針疊甲 evasion 預期 −2、實際 0。詳見 smoke.json.mechanismMismatches、installed 的 before／after。讀實作確認 src/rules/state.ts 的 makeUnit 沒有把 ComponentDef.attrMods／poolMods 裝到實例；src/rules/contribs.ts 的 unitAttr 只讀 frame 基值與實例 contribs。rg 在 src 找得到欄位型別，找不到部件兩欄的套用流程；怪獸 attrMods 的套用不代表部件也生效。故第 3 條「屬性／池符合情境」無法成立，不能把合法 JSON 當成機制已運作。

## 數值帶、需求與待決

沒有自行超帶。hp／mass 沿既定 D12/2、C16/3、B18/4；非武器 size=1 沿槽容量，B 武器 size=2 的建議不套到本批裝甲。外掛層 25–45 HP、抗性最高 0.25；短效 initiative +8／evasion +5 持續一回合，AP3／冷卻3／每戰2次。兩招 packets=[] 是指定純支援，不用傷害／AP 帶退件。數值暫填，未為勝率加碼。

請領導處理部件 attrMods／poolMods 引擎缺口，再驗證三項代價；本線不改 src、不加替代效果或第 15 檔。npm test 未完整通過，需領導查明失敗根因後決定如何收件。聲望／市場／研發／lore 仍依計畫留待對應線接通，沒有塞入 ComponentDef 死欄。

實作時兩次 scratch runner 斷言因檢查寫法中止，已修正：部件代價改記真實 mismatch；不受插層影響部位的比較排除本體 component 層。初版全十件同場的 runner 因耗時主動中斷，最終改為五 seed 各兩件的分組；這三次 runner 開發嘗試不列入五個完成 seed，也未冒充引擎例外為零。最後可重現 runner 與原始紀錄一併交付。

content_accept.sh 依交接書留給領導收件，工人未啟動它建立基底 worktree，亦未修改 manifest。四條結果確認後即停止。

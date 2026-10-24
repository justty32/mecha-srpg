# lead-ui-fix 契約：試玩回饋九項的 vm／dom 分工

[feedback](feedback.md)｜前一版契約 [lead-impl-ui/contract](../lead-impl-ui/contract.md)（§0 呈現方針、§2 分層依賴仍有效）

領導 `lead-ui-fix` 凍結。**`src/ui-adapter/vm/types.ts` 已由領導改好（標 `[lead-ui-fix]` 的欄位）**，兩個工人照抄；不夠用 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不改 types.ts。

## §1 用語（使用者語意，凌駕舊按鈕名）

| 使用者說 | UiAction | 規則指令 | 按鈕 id／預設鍵 |
|---|---|---|---|
| 待機（這台結束行動）| `standby` | `end` | `standby`／W |
| 延後（移到本輪隊尾，每輪一次）| `defer` | `wait` | `defer`／D |
| 結束回合（我方本輪全部結束）| `endTurn` | 對每台未行動我方送 `end` | `end`／E |

「未行動」＝本輪還沒輪完（不在 `rt.acted`）的我方作戰中單位；**正在行動的那台若本回合已成功下過任何指令，不算未行動**。N＞0 時第一次 E 只設 `confirm`（文字「還有 N 台未行動，確定結束？（再按 E 確認）」），第二次 E 才執行；任何其他 action 清掉 `confirm`。N＝0 直接執行。執行＝記 `endRoundFor = 本輪`：現在輪到我方就送 `end`；之後本輪每輪到一台我方都自動送 `end`（不出演出）。敵方播放中按 E 也照此（旗標生效於輪回我方時）。

## §2 vm（工人 `cx-uifix-vm`；`src/ui-adapter/vm/`）

**session.ts**：`SessionOptions.autoAdvance?: boolean`（預設 true＝舊行為，舊測試不動）。新增 `stepAi(): { actor: Id | null; events: GameEvent[] }`——**恰好跑一台 AI 單位的一個 `runUnitTurn`**（玩家回合／已分勝負時 no-op 回 `{actor:null, events:[]}`）；`advanceAi` 改成迴圈呼叫同一套邏輯（AI 建立、`startRound` 時機不變），保證同 seed、同玩家指令下 `commands` 與舊版逐筆相同。`autoAdvance:false` 時建構子與 `submit` 都不跑 AI。

**controller.ts**（`controllerForScenario` 用 `autoAdvance:false`；建構子收到 autoAdvance true 的 session 也要能用——那時 busy 恆 null）：
- **演出佇列**：輪到 AI 時 `busy = {kind:"ai", actor, name}`。`step`：(a) 若該 AI 單位還沒「聚焦」→ 只聚焦：鏡頭讓它落在可視區內（離邊 ≥2 格，否則置中），回傳；(b) 已聚焦 → `stepAi()` 跑它一回合，把事件轉成 `fx`，回傳。輪到我方：若 `endRoundFor` 生效就自動 `end` 並繼續；否則 `busy=null`、`selected`＝行動中那台、鏡頭確保它在可視區、開 `quickMenu`。`skip`（以及 busy 時的 `cancel`／`confirm`）：一路 step 到 busy 為 null，`fx.epoch+1`、`fx.items` 清空。
- **fx 產生**（只對玩家看得到的事件，篩法同 log）：一個指令的連續 `Moved`（同 unit）→ 一筆 `path`（cells＝起點＋每步 to）；`Hit`／`Miss` → `attack`（from＝攻方當下位置，to＝目標位置）＋`Miss` 再一筆 `float` 「未命中」tone miss；同指令同（unit, part）的 `LayerDamaged` 加總 → `float`「<部位中文名> −<量>」tone damage，at＝受擊單位位置；`PartBroken` → `float`「<部位>損毀」tone break；`EffectApplied`（非 hidden 效果）→ `float` 效果名 tone status；`ControlChanged` to berserk → `float`「暴走」tone status。group：path 0，attack 1，其餘 float 2（同一 AI 回合內有多個指令時，後一個指令整批 group 往後加 3）。保留最近 64 筆，id 單調遞增。玩家自己的指令也產 fx。
- **行動流程**：玩家指令成功後保持 `selected`＝該機、`mode` idle、開 `quickMenu`。若同一台仍在行動但**沒有任何 enabled 的移動或主動能力** → 自動 `end`，`message`「行動點用完，自動待機」。idle 且選的是行動中我方那台時：可達格標 `reach`，**點可達格直接移動**（等同 move 模式）。`quickMenu.options`：enabled 的能力（同 commands 的 ability 項）＋`standby`＋（還有可達格時）`move`；DOM 擺在棋子旁。
- **固定指令**：`commands` 恆含 move、standby、defer、end、eject、retreat、skip（順序固定），＋選取單位（我方）的能力、模式中 `cancel`。不可用時 reason：非玩家回合「敵方回合中」、未選「尚未選擇棋子」、選的不是行動中那台「不是這台的回合」，其餘照 rejection 對照。`end` 在戰鬥未結束時恆 enabled；`skip` 只在 busy 時 enabled（key 顯示 Esc）。
- **部位選擇**：target 模式點到合法目標，若能力 `partAim?.allowed` 或 `target.kind==="part"` → `mode = {kind:"part", …}`，options＝目標未損毀部位（n 從 1；kind 不是 part 時第 1 項為「不指定」part null），enabled 用 `checkAbility(…, {unit, part})`；label 含部位名（有 penalty 寫「命中 −X」）。`pickPart`／part 模式下 `abilitySlot:n` 送出；`cancel` 回 target 模式。
- **敵方部件**（viewmodel）：敵方在 `knowledge.visible` 內 → `unit()` 給全部部件與每層**即時** hp（直接讀 state），`stale:false`，並把這份 parts 快照記在 vm（`seenRound`＝當輪）；不在視野 → 回最後快照 `stale:true`；從沒見過 → 結構＋hp null（有 `revealed` 就用它）、`stale:true`、`seenRound:null`。方格：不在視野但 `lastSeen` 有位置、且該格沒有可見單位 → 畫 `stale:true` 的殘影徽章。`hpRatio` 照用即時／快照值。
- **層種類中文名**：`labels.ts` 新增 `layerTypeLabel(db, id)`：registry 的 name 若 ≠ id 就用它，否則查 UI 對照表（鍵是內容包 layer-types 的 id：shield 護盾、armor 裝甲、chitin 甲殼、flesh 肉體、organ 器官、cockpit-shell 駕駛艙殼、component 組件、structure 結構、resonant-shell 共鳴殼），都沒有回 id。viewmodel 與 text.ts 都改用它。
- **log**：同一指令的連續 `Moved` 合成一行「X 移動（a，b）→（c，d）」；每行 `at`＝事件相關格（Moved 的 to、受擊單位／施放單位**事件當下**位置可省略時用現在位置）。`focusLog` → 鏡頭置中到該行 `at`、游標移過去。
- **keymap.json**（新增，label 中文）：`standby` w、`defer` d（原 `wait` 綁定移除）、`skip` k、`zoom:1` `+`／`=`、`zoom:-1` `-`、`zoom:0` `0`、`cycleAnim` a；`cancel` label 改「取消（播放中＝跳過）」、`confirm` 改「確認游標格（播放中＝跳過）」。`parseAction` 支援 `zoom:<1|-1|0>`、`standby`、`defer`、`skip`、`cycleAnim`、`step`。**`+` 鍵要能解析**（`canonical` 對結尾的 `+` 不能切壞；`Shift++` 與 `+` 都要命中 `zoom:1`；`validateKeymap` 對 DEFAULT_KEYMAP 回空陣列）。
- controller 收到 `zoom`／`cycleAnim`：不改戰局，照常回 snapshot（DOM 自己處理）。

## §3 dom（工人 `cx-uifix-dom`；`src/ui-adapter/dom/`，含 `main.ts`）

`MountOptions` 新增 `anim?: AnimMode`、`zoom?: number | "auto"`、`onSettings?(s: { anim: AnimMode; zoom: number | "auto" }): void`；`BattleView` 新增 `apply(a: UiAction): boolean`（處理 `zoom`／`cycleAnim`，回 true＝已處理）、`skipFx(): void`、`fxBusyMs(): number`（目前排定演出還要多久播完，給 main 排 step）。

- **佈局**：三欄 `[指令面板 固定寬][戰場 1fr][資訊側欄]`；指令面板 `[data-ui="commands"]` sticky、高度與按鈕位置不隨捲動縮放與快照變動（按鈕節點**重用**，只改 disabled／title／kbd／class，不整批 replaceChildren，避免移位）。另加 `[data-ui="view-controls"]`：動畫鈕 `button[data-ui="anim-toggle"]`（文字「動畫：開／快／關」）、縮放鈕 `button[data-ui="zoom-in|zoom-out|zoom-fit"]`，鍵名從 `keyHints` 找。戰場角落也放一組縮放鈕（同 data-ui 前綴 `board-zoom-in|board-zoom-out`）。
- **格大小**：auto＝`floor(min(面板寬/地圖寬, 面板高/地圖高))` 夾 [24, 72]；手動＝每步 ×1.25（縮小 ÷1.25），夾 [12, 96]；`zoom dir 0` 回 auto。面板高度填滿視窗剩餘（不留大空白；地圖小於面板時方格置中）。可視格數 w,h＝floor(面板/格)、夾在 [1, 地圖邊長]（**不再夾 8–60**）；變了送 `resize`。縮放以游標格（滑鼠在戰場上時用滑鼠所在格）為錨：縮放後送 `setViewport` 讓錨格留在畫面同一相對位置。ResizeObserver＋window resize 重算。Ctrl＋滾輪＝縮放（preventDefault）；一般滾輪捲動照舊。設定存 localStorage 鍵 `mecha-srpg.ui.zoom`、`mecha-srpg.ui.anim`，**讀寫都包 try/catch**（由 main.ts 做；render.ts 經 `onSettings` 回報）。
- **高亮**：行動中（`unit.active`）粗框＋呼吸閃爍（暖黃）；選取中（`cell.selected`）用不同色（青）細框；`reach` 藍底、`range` 淡紅底、`target` 紅底＋紅框、`path` 青框；`stale` 徽章灰色半透明、虛線框、`pointer-events:none`。
- **演出疊層** `[data-ui="fx-layer"]`（absolute 疊在 board 上，pointer-events none）：`path` 畫起點→終點折線＋箭頭（SVG），約 500ms 淡出；`attack` 畫線＋命中格閃；`float` 在格上浮出文字向上飄約 900ms（tone 決定色：damage 橘、miss 灰、status 紫、break 紅）。只播 `id` > 已播的；`epoch` 變了 → 清空疊層。不在可視區的格略過。依動畫設定錯開 group（開 350ms、快 120ms、關 0 且只播 path 與 damage／miss float）。`prefers-reduced-motion` 時等同「快」。
- **quickMenu**：`[data-ui="quick-menu"]` 浮在 `quickMenu.at` 格旁（超出可視區就不畫），按鈕 `button[data-cmd]` 同 CommandOption 規則（kbd、disabled、tooltip）。
- **part 模式**：`[data-ui="part-picker"]` 浮層列出 options（按鈕 `button[data-part-n]`，`<kbd>` 顯示數字），點了送 `pickPart`。
- **confirm**：`[data-ui="confirm"]` 顯示 `confirm.text`（role="alertdialog"），內有「確定」鈕（送 `endTurn`）與「取消」鈕（送 `cancel`）。
- **busy**：頂列顯示「敵方行動中：<name>」；`button[data-cmd="skip"]` 在固定面板裡（來自 commands）。
- **log**：有 `at` 的 `li` 可點（cursor pointer、`data-seq`），點了送 `focusLog`。
- **main.ts**：讀 localStorage（try/catch）＋URL 參數 `anim=on|fast|off`（e2e 用，優先於 localStorage）傳給 mountBattle；按鍵先 `resolveKey`，`zoom`／`cycleAnim` 交 `view.apply`，其餘交 controller；`skip`／busy 時的 `cancel`／`confirm` 也呼叫 `view.skipFx()`。**演出驅動**：每次 render 後若 `snapshot.busy` → `setTimeout(step, delay)`，delay＝`max(view.fxBusyMs(), 基本停頓)`，基本停頓 開 450ms／快 150ms／關 0；同時只排一個計時器。`window.__battle` 保留 `snapshot()`，另加 `settle()`（等同 skip，給 e2e）。

## §4 e2e（領導或第三位工人，vm＋dom 收完才做）

既有 3 條改寫以適應新流程，另新增至少 4 條：行動後浮出選單、結束回合確認（第一次 E 出 confirm、第二次推進）、縮放（按 + 後格變大且 localStorage 記住、重載仍在）、跳過動畫（`anim=on` 下敵方播放中按 Esc → busy 立即為 null）。

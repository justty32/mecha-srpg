# intrigue／systems — 落到引擎：現在就做得到的、要新做的

[intrigue 入口](../intrigue.md)｜ops spec [README](../../specs/ops/README.md)｜引擎待辦 [engine-backlog](../../../dispatch/handoffs/engine-backlog.md)

對照表已抽到 [engine-gaps.json](engine-gaps.json)（13 列）。欄位：`need` 這份筆記要的東西／`now` 現有機制（讀 `src/ops/` 與 ops spec 核過）／`gap` 差在哪／`proposal` 提案（spec 欄位或引擎改動，寫到可以切線的程度）／`kind`（content＝零程式、spec、engine）／`size`（小＝一條工人、中＝一位領導帶 1–3 工人）。統計：content 2 列、spec 2 列、engine 2 列、spec＋engine 5 列、混合 2 列；小 8、中 5。

## 現在內容就做得到（零程式）

核過 `opseffect.ts`、`cond.ts`、`types.ts` 與既有事件後，下面這些**今天派 codex 內容線就能寫**：

- **戰後揭露信**：契約 `onComplete` 寫 `flag`，船上事件 `when` 查該 flag 與 `calendar.dom`，隔幾天冒出一封信。既有 `news-patron-reversal` 就是這形狀，只差把內容寫成「你剛替誰做了什麼」。
- **同業紙條**：`merc-salt-gull-salvage` 的形狀，改成鹽鷗告訴你誰付的錢。
- **債務抵償契約**：事件 `debt-offer`（when：利息到期且 cash 不足）→ 選「接」則 `spawnContract`，契約 `onComplete` 對 `debt` 帳 `ledger` 負數。帳本守恆照跑。
- **船員牽掛的第一版**：人物 `tags` 加 `tie:*`，對白 `topics[].when` 查 `contractOffered` 與 `hasTag`——伊爾瑟在歸還黨契約掛出時說「他們丟過我們兩次」現在就寫得出來。
- **假旗與名目**：作戰與契約的文字欄寫名目，揭露用事件；只是沒有結構化欄位，百科看不到。
- **紀念日的第一版**：事件 `when` 硬寫 `calendar.month`／`dom`（現有事件已這麼做），只是沒有跨年。

這些加起來已經能做出 [arc-sample](arc-sample.md) 的八成。建議**先用內容把劇情弧樣本寫出來、跑過**，再決定哪些結構化欄位值得加——spec 跟著做過的內容長，不先長。

## 要新做的（小）

五條小改動，各一條工人量級，彼此獨立：

1. **`spawnEvent.afterDays`／`onPhase`**：延遲事件。沒有它，所有揭露都得硬寫日期。
2. **Cond `factionRemembers`**＋OpsEffect `forget`：讓 `memory` 被讀。沒有它，選邊的後果永遠只是 rep 數字。
3. **`ContractTemplate.hidden`＋`ContractState.revealed`＋OpsEffect `reveal`**：揭露層結構化，百科與存檔看得見「這張契約我知道到哪一層」。
4. **`OperationDef.pretext`／`motive`／`exposeOn`**＋**`ContractState.payer`**：名目與動機分開、真正付錢的人可被揭。
5. **`calendar.anniversaries`**＋Cond `onAnniversary`：年表回到營運曆。

## 要新做的（中）

五條要領導帶線、且碰到 sortie 或 text 層：

1. **接約前的反對 Prompt**：`accept` 前查 `objection` 類對白，彈既有 `Prompt`。碰 text 層的指令流程。
2. **strain 與離團**：`Employment.strain`、每蝕月第 1 天的離團擲、出戰注入 optional 目標。碰 crew 與 sortie。
3. **雇主撤空援**：`JoinTerms.supplyRevokeOn`，情境生成時擲定，空援券改成限時 Effect。碰 sortie 注入與 core 的 Effect 時鐘。
4. **情報商品**：市場 `intel` 列、`IntelDef`、買了就 `reveal`；與 tide-sky 的預報共用。碰 market 與揭露層。
5. **戰場來歷標籤**：`UnitSpawn.provenance`，戰後把看過的來歷寫進 `lore` 並觸發 `field` 管道揭露。碰 scenario 生成與 `applyBattleResult`。

## 不建議做的

- **全局業力／名聲值**：與逐勢力聲望的裁示相衝，也會把局勢壓扁成一條線。
- **對話樹式的審問**：UI 走按鈕與面板（裁示），追問只給一個選項。
- **結局分支**：沒有終局（spec），局勢也不該有終點。
- **為揭露加新動詞**：27 個動詞夠用；揭露走事件與既有 `Prompt`。

## 切線建議

依賴只有兩處：延遲事件（小 1）先於揭露層（小 3）；揭露層先於情報商品與戰場來歷（中 4、5）。其餘可並行。第一輪建議：**內容線先寫 arc-sample**（零程式）＋**小 1、2 一條工人線**；第二輪看試玩回饋再開中型線。所有列在 REPORT 的提案清單裡有同樣的編號。

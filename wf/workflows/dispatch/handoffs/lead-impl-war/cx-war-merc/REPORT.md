# cx-war-merc 完成回報：DONE

## 做了什麼

完成參戰契約線的固定六項驗收（依交接書容許的既有／別線紅燈例外）。join 發約、接受條件、選邊、pendingBattle、三式合編、戰果回寫、補給四檔、借機歸還、薪酬／貢獻比、背叛／黑名單／殼／代理曝光、merc 政策與 CLI 累計已接通。沒有新增動詞或房間，沒有 commit。

固定驗收恰為以下六項：

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 errors、0 warnings（[型別](typecheck.log)、[內容](content-check.log)）。
2. 本線 [37 項單元測試](unit.log) 全綠：四個 accept 拒絕、選邊、三種背叛形狀、四檔補給帳本／工時、借機、pay／貢獻比、真 BattleResult 含 ally、死亡寫回分遣隊。
3. [npm test](npm-test.log) 110 個測試檔，106 綠、4 紅；src/ops 無新增紅燈。[ops 單跑](ops-test.log) 229 項，228 綠，唯一紅燈是交接書禁止重產的既有黃金 hash。領導追加點名的 `src/ui-adapter/ops/vm/controller.test.ts` 已綠，斷言未改。
4. 三個 seed 的 12 潮月 merc 全部 exit 0；合計 4 條完整「接受→真戰鬥→作戰結果→join-pay」鏈（門檻3）。[seed1](merc-1.log)、[seed2](merc-2.log)、[seed3](merc-3.log)。
5. [idle seed1](idle-1.log) 與 [greedy seed1](greedy-1.log) 各12潮月正常結束、印 OK。
6. 原斷言不動，`node --test src/ops/sortie/run.test.ts src/mcp/sortie.test.ts` exit 0（[證據](regression.log)；隔離 runner 顯示2個測試檔）。

## 產出（含完整檔案清單）

本線程式 18 檔，程式 diff 保守合計 84624 bytes（包含共用檔差異）；新內容4份 op-join 模板，沒有超過20檔／100KB gate。完整絕對路徑見 [files.json](files.json)，對外型別變更表見 [types.json](types.json)。`join-faction-front.json`、研發／市場與其他線檔案未動；共用 types/cli 僅局部追加。

新增事件：AllySupplied、MechLoaned、MechReturned、ReputationChanged、Betrayed、OrderViolated、ProxyExposed、JoinSettled。沿用 ContractOffered/Accepted/Expired、Resupplied、OperationEngaged、ShellSeized；ContractAccepted 帶 kind=join，BattleResolved 帶 operation/contract。外源 faction-supply/join-pay/loan-loss 都指向 AllySupplied 或 OperationResolved；還機不留 inventory.mechs。

共用接線偏離均有 orders：12:06 放行 commands.ts 保留 operation 一行、operations.ts 每日 mercDaily／曝光與玩家持殼保護；12:16及12:18同意 onMuster 沿用 rep 可見門檻、greedy 跳過 join，避免舊UI自動接第一約時碰到不可接的高階join。run.ts 只在 prepareSetup 加 forceIds 對位；其餘公開入口語意不改。

三 seed 摘要（join-pay 是帳本該 reason 的總額；借機額外扣款可查 JoinSettled 與 ledger）：

seed 1：join=2，戰鬥勝／敗=0/0，join-pay=3000.000000。

seed 2：join=1，戰鬥勝／敗=0/2，join-pay=1818.181818。

seed 3：join=5，戰鬥勝／敗=7/4，join-pay=6000.000000。

完整逐約事件序列／帳本與逐月原文見 [simulation.json](simulation.json)。三條可直接追查的序列摘錄：

seed 2 contract-26：day 10 ContractAccepted(join) → day 14 BattleResolved(none, 20輪) → day 15 OperationFailed → join-pay 1818.181818（event-159）。

seed 3 contract-80：day 48 ContractAccepted(join) → day 52 BattleResolved(player, 2輪) → day 58 OperationFailed → join-pay 1500.000000（event-525）。

seed 3 contract-250：day 124 ContractAccepted(join) → day 127 BattleResolved(none, 20輪) → day 128 OperationFailed → join-pay 1500.000000（event-1197）。

每潮月一行，欄序＝月／作戰／war／allied／釋出／join：

seed 1：

```text
1 / 0 / 1 / 0 / 16 / 0
2 / 0 / 0 / 0 / 17 / 0
3 / 2 / 0 / 0 / 17 / 1
4 / 0 / 0 / 0 / 18 / 1
5 / 0 / 0 / 0 / 18 / 1
6 / 2 / 0 / 0 / 19 / 1
7 / 0 / 0 / 0 / 20 / 1
8 / 0 / 0 / 0 / 20 / 1
9 / 2 / 0 / 0 / 20 / 1
10 / 2 / 0 / 0 / 21 / 1
11 / 2 / 0 / 1 / 21 / 2
12 / 1 / 0 / 1 / 22 / 2
```

seed 2：

```text
1 / 0 / 1 / 0 / 17 / 1
2 / 0 / 0 / 0 / 17 / 1
3 / 1 / 0 / 0 / 17 / 1
4 / 0 / 0 / 0 / 18 / 1
5 / 1 / 0 / 0 / 19 / 1
6 / 0 / 0 / 0 / 20 / 1
7 / 0 / 0 / 0 / 21 / 1
8 / 0 / 0 / 0 / 22 / 1
9 / 1 / 0 / 0 / 23 / 1
10 / 1 / 0 / 0 / 24 / 1
11 / 1 / 0 / 0 / 24 / 1
12 / 1 / 1 / 0 / 24 / 1
```

seed 3：

```text
1 / 0 / 1 / 0 / 17 / 0
2 / 1 / 0 / 0 / 17 / 1
3 / 1 / 0 / 0 / 17 / 2
4 / 1 / 0 / 0 / 18 / 2
5 / 1 / 0 / 0 / 18 / 3
6 / 1 / 0 / 0 / 20 / 3
7 / 2 / 0 / 0 / 21 / 3
8 / 2 / 0 / 0 / 21 / 3
9 / 1 / 0 / 0 / 21 / 3
10 / 1 / 0 / 0 / 21 / 3
11 / 0 / 0 / 0 / 21 / 4
12 / 1 / 0 / 0 / 21 / 5
```

## 沒做到或證據不足的

沒有宣稱整套 npm test 全綠：`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts` 失敗（完整 runner 未展開子錯誤；前線REPORT已列沙箱環境紅燈）；`test/fuzz/fuzz.test.ts` 約20秒逾時；`src/ops/sim/golden.test.ts` 的目前工作樹結果 day31／295 events／ff0f5a61ffac4a93，fixture 是291 events／e30325668e9ab224。沒有重產黃金、放寬斷言或改別線測試。依交接書，這些不算本線新增 ops 紅燈。

完整 SPEC-GAP 表見 [spec-gaps.json](spec-gaps.json)。主要限制：現有世界仍是節點圖；FactionDef.strategy 尚無對應 aiprofile 時沿用 tactical；核心無殼攜物與 destructible 目標，尋殼 reachExit 代表帶殼；arsenal 情報用既有 perception effect 注入，非虛構 scan API；沒有既有 contestContract 處理器／勢力現金帳，因此未假造競爭獵團搶約或 proxy 條約經濟。代理曝光與玩家／雇主外交連帶已實作。

軍令依真 BattleResult 判定；「隨機違令」依領導12:18明示裁示保留 SPEC-GAP，不新增 Sortie.ai，不以無效打亂編成假充完成。未改 code-map／上層SESSION-LOG（寫入範圍外，領導收線維護）。

## 需要決定的事

本線無需再等決定。交接書指名的黃金 hash 由領導在乾淨 worktree 統一重產；SPEC-GAP 中核心攜殼、scan、搶約／代理經濟等留後續跨線規劃，不追加到本次六條驗收。借機 metadata 已寄給 cx-war-rnd，市場轉售與 leakModel 是對方領地。

### 以後交接書該點名的工具

`inbox_poll.sh --once`、`inbox_mail.sh --up`、`tabledb.py`、`node --test --test-isolation=none`（顯示真子測試數）、`node src/ops/sim/cli.ts --policy merc`（輸出逐約事件與帳本來源）、`git diff --numstat`（只算本線檔案，並把未追蹤新增檔大小納入 gate）。

# cx-ops-board 契約板與文字可讀性回報：DONE

固定六條驗收完成（第3條依交接書明定的別線／黃金例外、第5條依.git唯讀例外）；不宣稱整個工作樹npm test全綠。

## 做了什麼

已接上 11 份模板的發包勢力、10 張非 war 世界發包牌；第一週優先護送／守城／偵察。節點委託不再要求裂縫，裂縫型仍沿用原快照與 eligible 語意。`cmdAccept` 在任何議價／參戰副作用前用 shortestPath 檢查目標；不可達回 `unreachable`，文字契約板有 disabled 承接動作。

join-faction-front 改 `kind:join`，移除三段 stages（作戰階段與結算已由既有 join 流程管理），補 JoinTerms 與 mercRules。contractsDaily2 接續 muster 當日已建立的 join，選符合雇主 contractKinds／聲望／規模的具名模板，保留 operation、side、作戰補給／分成與戰果簿記；不額外發另一份參戰約，也沒有改 war/。

只在指定三份契約補 encounter 陣列，沒有改 sortie/。defend-citywall 的酬金由裂縫寬度乘數改固定 3400：無裂縫節點不能求 rift.widthIndex。新勢力有 war-only actionLanes，所以 board 卡用 actor=world 遞交請求，再由 eligible 選真正發包者；沒有改 actionLanes。

人物實例以既有文化 names 池登記唯一名稱；未命名機甲只在文字呈現時產生機型名＋同型序號，不往機甲命名履歷插入預設名。text/names 集中處理九類名稱、七種裂縫狀態、存量帳與機型 id；createOpsCtx／render 登記 WorldDB 對應的不可變 core DB，維持既有 parse 三參數介面。事件數字取整數或一位小數，缺欄位用具體類別備援；WagePaid 日結原事件未帶 person，顯示「船員」而不捏造收款者。補作戰／外交／研發／參戰缺的 11 個模板條目，既有文案條目不改。

市場 snapshot 與 parse 商品名稱解讀改走 marketListings；未知名稱與缺參數附同 domain 名稱＋id 候選，最多8個。歧義分支保留既有 candidates 純 id 介面（原測試斷言不變），錯誤文字同時列名稱＋id。

### 固定六條驗收

1. typecheck exit 0；內容 check 0 errors/34 warnings；npm run check 0 errors/38 warnings（警告來自同期內容檢查擴充，沒有錯誤）。證據在 `/tmp/cx-ops-board/{typecheck,content-check,check}.log`。
2. 新增5個測試案例全綠：seed1–5 第14天前≥2可達約（探測均第2天已有2份）；拒收＋disabled；開局無重名與九類名稱；seed1 實際包含第30天的 log；動態商品 snapshot 與 parse。`new-tests.log` 為5/5。
3. 完整 npm test 最終128檔122綠6紅（`npm-test-final.log`）。ops 三紅為禁止重產的golden、別線recruit去重後的舊測試前置狀態、核心effects產生undefined owner欄位的JSON往返；本線沒有改它們的斷言。封印fixture已依13:14 orders只加 `s.ship.at = r.node`，rifts單跑4/4；scenario單跑8/8。詳見第三段。
4. greedy 十二潮月 seed1/2/3 CLI 全部 OK；板上出現13/11/14種模板，ContractAccepted 4/4/6、BattleResolved 4/4/6。`year-probe.log` 有模板清單與計數；`greedy-{1,2,3}.log` 有逐月 CLI 輸出。
5. worktree 實際遭 `.git/worktrees/wt: Read-only file system` 拒絕；依交接書明文例外，以「需領導在沙箱外二分」說明驗收。未建立worktree，沒有清理項，也未宣稱已確認首個回歸commit。
6. idle seed1／merc seed1 各十二潮月末行 OK（`idle-1.log`、`merc-1.log`）。早期護送 prepareSetup 崩潰已由遭遇線修正後重新執行，最終證據不是舊失敗輸出。

### 11份模板與發包勢力

下列均為檔名 stem（分別位於 contracts 與 factions-ops）。join 走 muster，其餘走同名 board-* 卡。

| 模板 | 勢力 |
|---|---|
| clear-before-tide | migrant-crew, residual-league |
| seal-anchor-watch | migrant-crew, residual-league |
| reclaim-blight-line | migrant-crew, dhaka-weavers |
| defend-citywall | dhaka-weavers, bay-seventh-post, migrant-crew |
| escort-sealed-convoy | selene-whitegloves, migrant-crew |
| scout-rift-margin | migrant-crew, shell-society |
| survey-stolen-relic | migrant-crew, shell-society |
| join-faction-front | residual-league, selene-whitegloves |
| epithet-bounty | migrant-crew, residual-league |
| rival-carcass-claim | migrant-crew, salt-gull-hunters |
| smuggle-moonbound | migrant-crew, selene-whitegloves |

### ISS-032調查

實際指令輸出（完整：`/tmp/cx-ops-board/iss032-investigation.txt`）：

```text
$ git worktree add --detach /tmp/cx-ops-board/wt 70628f7
Preparing worktree (detached HEAD 70628f7)
fatal: could not create directory of '.git/worktrees/wt': Read-only file system
exit 128
```

已用 `git show 70628f7:src/ops/sim/policies.ts` 取出基準檔；`git log --oneline 70628f7..HEAD -- src/ops/sim/policies.ts src/ops/world/actions.ts src/ops/contracts/lifecycle.ts content/base/world/factions-ops` 列出1916468（war牌道）與a4755a0（join／rnd）兩個相關歷史改動。這只是縮小調查面，不能據此判定哪個commit造成零出戰。沒有兩個乾淨版本的 seed1–7 BattleResolved 數據，需領導在沙箱外二分；本線新發包後的全年出戰數另列第4條，不冒充基準比對。

### log前後對照10行

前4行來自相同seed1事件、HEAD renderer／HEAD文案與新renderer對照；後6行是標明的同payload人工事件示例（驗新事件文案，不冒充戰役實際發生）。

1. 實際 WagePaid：`薪水入帳 17.5 幣。` → `船員薪水入帳 17.5 幣。`
2. 實際 OperationEngaged：`前線交火，作戰推進到 0.47527230915562674。` → `前線交火，作戰推進到 0.5。`
3. 實際 OperationEngaged：`前線交火，作戰推進到 0.9098015216390987。` → `前線交火，作戰推進到 0.9。`
4. 實際 ModelReleased：`未登錄事件：ModelReleased。` → `殘聯蝕線守備隊公布堅盾-II 鉚甲型，新機型進入供應名單。`
5. 示例 AllySupplied：`未登錄事件：AllySupplied。` → `盟軍補給送抵機庫，前線維修班開始卸貨。`
6. 示例 MechLoaned：`未登錄事件：MechLoaned。` → `雇主撥來一台借用機甲，作戰結束後歸還。`
7. 示例 MechReturned：`未登錄事件：MechReturned。` → `借用機甲交回雇主，清點單已簽收。`
8. 示例 ReputationChanged：`未登錄事件：ReputationChanged。` → `殘聯蝕線守備隊重新評估了你的名聲。`
9. 示例 LineageOpened：`未登錄事件：LineageOpened。` → `殘聯蝕線守備隊解開了通用・堅盾系列（開源）的研發封鎖。`
10. 示例 CaptainCreated：`未登錄事件：CaptainCreated。` → `殘聯蝕線守備隊編成隊長機堅盾-I型。`

## 產出（含完整檔案清單）

未commit、未重產黃金hash。程式12檔，內容29檔；程式diff含共用types保守計數低於60KB，未達15／40件數gate。下列是可點的原始檔導航；共用types僅本線追加`ContractTemplate.name?`，共用rifts測試僅已授權的一行。

- [src/ops/contracts/lifecycle.ts](../../../../../../../../src/ops/contracts/lifecycle.ts)
- [src/ops/contracts/board.test.ts](../../../../../../../../src/ops/contracts/board.test.ts)
- [src/ops/content/start.ts](../../../../../../../../src/ops/content/start.ts)
- [src/ops/crew/names.ts](../../../../../../../../src/ops/crew/names.ts)
- [src/ops/text/names.ts](../../../../../../../../src/ops/text/names.ts)
- [src/ops/text/parse.ts](../../../../../../../../src/ops/text/parse.ts)
- [src/ops/text/render.ts](../../../../../../../../src/ops/text/render.ts)
- [src/ops/text/templates.ts](../../../../../../../../src/ops/text/templates.ts)
- [src/ops/text/readability.test.ts](../../../../../../../../src/ops/text/readability.test.ts)
- [src/ops/state/types.ts](../../../../../../../../src/ops/state/types.ts)
- [src/ui-adapter/ops/vm/snapshot.ts](../../../../../../../../src/ui-adapter/ops/vm/snapshot.ts)
- [src/ops/world/rifts.test.ts](../../../../../../../../src/ops/world/rifts.test.ts)
- [content/base/world/contracts/clear-before-tide.json](../../../../../../../../content/base/world/contracts/clear-before-tide.json)
- [content/base/world/contracts/seal-anchor-watch.json](../../../../../../../../content/base/world/contracts/seal-anchor-watch.json)
- [content/base/world/contracts/reclaim-blight-line.json](../../../../../../../../content/base/world/contracts/reclaim-blight-line.json)
- [content/base/world/contracts/defend-citywall.json](../../../../../../../../content/base/world/contracts/defend-citywall.json)
- [content/base/world/contracts/escort-sealed-convoy.json](../../../../../../../../content/base/world/contracts/escort-sealed-convoy.json)
- [content/base/world/contracts/scout-rift-margin.json](../../../../../../../../content/base/world/contracts/scout-rift-margin.json)
- [content/base/world/contracts/survey-stolen-relic.json](../../../../../../../../content/base/world/contracts/survey-stolen-relic.json)
- [content/base/world/contracts/join-faction-front.json](../../../../../../../../content/base/world/contracts/join-faction-front.json)
- [content/base/world/contracts/epithet-bounty.json](../../../../../../../../content/base/world/contracts/epithet-bounty.json)
- [content/base/world/contracts/rival-carcass-claim.json](../../../../../../../../content/base/world/contracts/rival-carcass-claim.json)
- [content/base/world/contracts/smuggle-moonbound.json](../../../../../../../../content/base/world/contracts/smuggle-moonbound.json)
- [content/base/world/factions-ops/bay-seventh-post.json](../../../../../../../../content/base/world/factions-ops/bay-seventh-post.json)
- [content/base/world/factions-ops/dhaka-weavers.json](../../../../../../../../content/base/world/factions-ops/dhaka-weavers.json)
- [content/base/world/factions-ops/migrant-crew.json](../../../../../../../../content/base/world/factions-ops/migrant-crew.json)
- [content/base/world/factions-ops/residual-league.json](../../../../../../../../content/base/world/factions-ops/residual-league.json)
- [content/base/world/factions-ops/salt-gull-hunters.json](../../../../../../../../content/base/world/factions-ops/salt-gull-hunters.json)
- [content/base/world/factions-ops/selene-whitegloves.json](../../../../../../../../content/base/world/factions-ops/selene-whitegloves.json)
- [content/base/world/factions-ops/shell-society.json](../../../../../../../../content/base/world/factions-ops/shell-society.json)
- [content/base/world/actions/board-clear-before-tide.json](../../../../../../../../content/base/world/actions/board-clear-before-tide.json)
- [content/base/world/actions/board-seal-anchor-watch.json](../../../../../../../../content/base/world/actions/board-seal-anchor-watch.json)
- [content/base/world/actions/board-reclaim-blight-line.json](../../../../../../../../content/base/world/actions/board-reclaim-blight-line.json)
- [content/base/world/actions/board-defend-citywall.json](../../../../../../../../content/base/world/actions/board-defend-citywall.json)
- [content/base/world/actions/board-escort-sealed-convoy.json](../../../../../../../../content/base/world/actions/board-escort-sealed-convoy.json)
- [content/base/world/actions/board-scout-rift-margin.json](../../../../../../../../content/base/world/actions/board-scout-rift-margin.json)
- [content/base/world/actions/board-survey-stolen-relic.json](../../../../../../../../content/base/world/actions/board-survey-stolen-relic.json)
- [content/base/world/actions/board-epithet-bounty.json](../../../../../../../../content/base/world/actions/board-epithet-bounty.json)
- [content/base/world/actions/board-rival-carcass-claim.json](../../../../../../../../content/base/world/actions/board-rival-carcass-claim.json)
- [content/base/world/actions/board-smuggle-moonbound.json](../../../../../../../../content/base/world/actions/board-smuggle-moonbound.json)
- [content/base/world/templates/default.json](../../../../../../../../content/base/world/templates/default.json)

對外變更：新增拒絕字串`unreachable`（CmdResult原本error:string，不增封閉union）；ContractTemplate可選`name?: string`；`registerPersonName`／`registerTextDB`／`textContext`供內部接線。parse、entityName、render既有簽名不變。新增text/names與兩個測試檔需領導收線時同步code-map（本線不可寫導航資料）。

## 沒做到或證據不足的

最終完整suite 6個紅燈逐一列名：

- `src/ops/sim/golden.test.ts`：交接書明定不重產的黃金hash。
- `src/ops/crew/crew.test.ts:121`：招募去重後，測試取所有市場第一個候選而未保證在本地，cmdHire回false；來源是別線recruit.ts的used集合／來源排除變更。本線只改names.ts與start.ts，已通知cx-ops-debt。
- `src/ops/sortie/entry.test.ts:108`：cx-ops-fix已修greedy的`rift:undefined`後，剩下核心`src/rules/effects.ts:70`建立layer owner時寫入`part:undefined`／`layer:undefined`，JSON移除欄位，deepEqual失敗。新節點委託與人類遭遇讓這個核心缺陷可見，核心不在本線範圍；已把具體diff回報。`final-regression.log`的19項中17綠，兩紅正是招募與這個核心欄位。
- `src/mcp/campaign.test.ts`、`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`：非本線檔案；完整runner只報檔級失敗，未另外加驗MCP。

早期的cond命名履歷紅燈已修正；封印fixture依授權修正後4/4，scenario同期變動後單跑8/8。最後完整suite沒有前一輪的核心rules／golden／sim紅燈。證據是`npm-test-final.log`，不是早期較多失敗的輸出。

板上offered全年極值為0–13／0–13／1–14（含作戰join與世界全蝕化末期）；第一週多樣化已達標，3–8是一般供應調整目標，未對war發約強加全域硬上限。未另加驗收門檻。

## 需要決定的事

ISS-032依交接書例外交領導在沙箱外二分；黃金hash與code-map由領導收線維護。核心effects owner可選欄位與招募測試前置狀態請各負責線收斂；本線按六條固定驗收例外結束，不擴寫禁區。

### 以後交接書該點名的工具

`inbox_poll.sh --once`、`inbox_mail.sh --up`、`node --test --test-isolation=none`（完整子測試錯誤）、`runCampaign({ onDay })`（真契約模板與接受數，不以CLI月摘要推算）、`git show`（唯讀沙箱歷史比對）；不要要求工人在.git唯讀時硬做worktree二分。

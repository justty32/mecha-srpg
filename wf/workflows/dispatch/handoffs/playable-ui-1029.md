# 任務：接入真實戰場互動介面

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親自讀feature-dev、testing、common/user與子頁、conventions、code-map、dev-env、data-files、planning/specs/playable-battlefield-1029.md。

## 背景與唯一目標
讓引擎新戰場功能可由玩家看到、操作與理解。

## 範圍
- 只做：[精確可寫檔案](playable-ui-1029/scope.json)列出的產品路徑，及本線報告目錄；未列檔先回報。
- 不做：core/rules/sim/schema與未列content、ops、dom/main.ts與shell、百科、legacy、art、黃金。
- 件數 gate：超過80件先報；容量 gate：超過5 MB先報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `node --test` | 隊長排程後相關單檔 |
| `git status --short` | 保護別線 |
| `python3 wf/tools/tabledb.py` | 查wf資料 |

## 資源與禁區
**可寫程式碼線**：僅明列檔。子代理上限0。不commit/push、不建分支/rebase/reset，不刪檔、不rm -rf，不改.gitignore或外部設定，不安裝下載，不碰GUI鍵鼠螢幕。保護三原review log。全樹工人最多3；所有npm/單檔/DOM/e2e由隊長排程同時僅一個，未授時段不跑，nice -n19低concurrency。無外網需求。

## 工作

最新合併契約優先：幾何高可靠命中、base真傷勢/血池/器官與機械功能、定向部位預覽。數值依astra凍結，不採舊曝光2/削核心候選。schema/registry/rules/sim由引擎線持有。
1. 本輪spec正依root裁決更新，三類碎石/殘骸/屍體須真實拾取回收收益，一般攻擊可選地物，支援可攻擊；不得只資訊或石頭憑空buff。先與astra確認再產五份內容。依本輪astra spec、core已落型別對接。顯示可破壞地物HP、碎石/拾取/殘骸/屍體，工具提示可辨識；選擇附近物件能拾取（Command.interact，AP和效果資訊），不可用時原因清楚。地面支援呈友方真實單位並可操作/檢視。
2. 讓玩家有清楚可操作的地物攻擊路徑，不能只顯示血量；透過既有session.submit原入口，保持vm/dom邊界。與引擎線協調凍結Command/type，勿改core。
3. 最終兵種一致性修復：battlefield-support frame加conventional-arms；兩新情境步兵core:false，爆破彈以cockpit.basicAbilities合法可用，凡鐵限制不繞過；混合重甲代表改同角色既有hinge-crab-c，對齊相關回歸與顯示，不改default對手或抗性數值。
4. 延伸實作astra凍結代表編組同場情境，重用既有AT12履帶車、背包飛彈與龍門支援機、mite/spitter/bulwark怪獸；新增正式可發現情境選擇選單（預設戰鬥／回收戰場／混合兵種），不能只藏query。補可用性/e2e回歸。
5. 補DOM/邏輯回歸與預覽命中一致呈現；提出精確測試指令供隊長排程，完成REPORT。

## 交付
REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-ui-1029/REPORT.md`，四段做了什麼／產出／沒做到或證據不足／需要決定，附以後工具。

## 驗收（固定3條）
1. 真實預設及ops戰場新物件具文字呈現、地物HP和可用互動按鈕。
2. 拾取與破壞從玩家UI送入原session且相關反例回歸存在。
3. REPORT明列檔案與實際驗證結果，未拿舊輸出冒充。

## 失敗怎麼處置
本線regression修好再交；拿不到證據報BLOCKED保持現狀，不改別線，原生工具終局回報。

本輪取證：main.ts既有debug hook可增加唯讀peek（複製latest），e2e可選BATTLE_TRACE僅被動事件與peek/audit讀取；不得呼叫snapshot影響dirty bookkeeping或繞正式click。未trace正常單案綠才算修復。

既有回歸契約修正：額外精確授vm/feedback.test.ts僅更新partAim普通射擊操作與幾何機率斷言，保留FX／命中及未命中／取消／數字鍵實判；不改產品、不sync全套暫存驗證樹、不跑程序。

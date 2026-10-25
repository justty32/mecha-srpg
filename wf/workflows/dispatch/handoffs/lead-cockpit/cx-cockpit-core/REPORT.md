# cx-cockpit-core：座艙與普通開落地，白手套六情境改為無人機

## 做了什麼

狀態：DONE。固定五條驗收完成（測試計數採交接書明示的沙箱例外）。

在指定隔離 worktree 完成核心標記、五種座艙狀態、scripted 控制、普通開能力過濾與 crew 資源池。人／機魂優先；機魂原有獨駕與 autonomy 接手保留；死亡／棄機後 crew 接管。無核心機甲附 conventional-arms，對 kaiju 沿既有十分律結算。

新增 cockpit 規則表與 schema／引用／池檢查，AI 與 UI 共用 abilitiesOf。scripted 沒有 commander 仍可移動、使用武器及判斷撤退；補固定預覽命中樣本，避免低命中無人機的三次預覽全失手、把武器估成零傷害。實際命中率與經濟／士氣數值未調整。

營運遭遇傳遞 core/crew；日終無活著的 human pilot 且無機魂時發 no-pilots，已有終局不再發；扣船也避免追加第二個 CampaignEnd。介面顯示「無人（普通開）」，MCP 沿既有共用 label。

固定五條驗收：

1. 最終排除版測試 exit 0、143/143、fail 0、skip 0，耗時 241.9 秒，記錄 `/tmp/cx-cockpit-core-acceptance.tap`；基準也是 exit 0、143/143、fail 0，記錄 `/tmp/cx-cockpit-core-baseline2.tap`。完整套件使用交接書原訂的 ls／grep 三檔排除指令。依交接書已知沙箱計數例外，以 fail 0 與 exit 0 判定：沙箱把每支檔案計為一個 test，新增案例放在既有檔案，所以不能拿檔案數相加冒充案例數。新增 12 案另以 `--test-isolation=none --test-name-pattern` 逐案驗證，12/12、fail 0、skip 0、exit 0，記錄 `/tmp/cx-cockpit-core-new-tests.tap`；未刪除既有案例。
2. `npm run typecheck` exit 0；`npm run check` exit 0，末行 `OK 0 errors, 8 warnings`，rules 為 5/5。記錄 `/tmp/cx-cockpit-core-{typecheck,check}.log`。
3. 指定兩個 grep 均無輸出（exit 1 為沒有匹配）：所有 scenarios 不再引用 person/glove；白手套 faction 不再有 soul-driven。
4. 新增 12 案的完整名稱與檔案見 [TESTS.json](TESTS.json)。其中涵蓋五種座艙、基本動作／機體招式／actorRole／四種 tag 過濾、無核心十分律、駕駛死亡／棄機接手、scripted AP 支付與回復，以及只剩機魂不終局／全無才終局；另驗 schema 正反例、遭遇傳遞、AI 開火與重播。
5. REPORT、六情境判定表與黃金變動表在本交付目錄；完整改動清單見 [CHANGES.json](CHANGES.json)。

## 產出（含改動檔清單、六情境判定表、黃金變動表）

工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/5c99f797-9f3e-4fc3-ac4c-a0585c1346f9/scratchpad/cockpit/wt-core`。改動 42 檔，包含新規則表；交付目錄另有 REPORT、CHANGES、TESTS 三檔，合計 45，未超過 60。唯一新增 worktree 檔 `content/base/rules/cockpit.json` 為 1,135 bytes；新增交付檔亦未超過 200 KB。原有未追蹤的 node_modules 未動。沒有 git add／commit。

### 六情境判定

| 情境 | 替換台數 | 核心 | 理由 |
|---|---:|---|---|
| skirmish-whitegloves | 4 | false | 攔路索債，無 kaiju |
| rift-edge-nest | 5 | true（缺省） | 聯軍對抗巢群與獸潮 |
| quarry-duel | 1 | false | 索債對決，無 kaiju |
| crater-three-way | 1 | false | 三方人類勢力交戰，無 kaiju |
| lunar-blockade-run | 1 | false | 月面封鎖追擊，無 kaiju |
| shell-excavation-escort | 1 | true（缺省） | 場上有菌柱怪獸 |

以上 13 台移除 glove 的 soul 座位，均改 crew=remote。其他具名機魂、其他情境的 soul 座位、frame 的 soul-driven tag、person/glove 與 world 引用不動。程式碼沒有依賴舊 faction tag。

白手套模擬使用 `npm run sim -- --scenario scenario/skirmish-whitegloves --seed 1 --out /tmp/cx-cockpit-core-skirmish.json`：10 輪、玩家勝、hash `bf7f1ec8f32c1cfb`。敵方無人機有 110 次 Moved、48 次 AbilityUsed、2 次 Hit，證明能移動與開火；並非只因戰鬥結束就宣稱 AI 可用。記錄 `/tmp/cx-cockpit-core-sim.log` 與事件 JSON。

### 黃金變動

| 黃金 | 結果與原因 |
|---|---|
| test/campaigns/ops-relic.hash.json | hash 改為 3643f8abf82e112b；3062→2810 事件，189→168 天。第 146 天最後駕駛離職，新增 no-pilots 使後續等待截斷；後續扣船不再發第二個終局。原 relic 事件子序列仍通過。 |
| test/golden/*.hash（6 檔） | 已重產，內容不變：既有人工指令情境不涉及改寫的無人機。 |
| 其餘 test/campaigns/*.hash.json（5 檔） | 已重產，內容不變。 |
| src/ops/sim/fixtures/campaign-hash.json | 已重產，內容不變。 |

重產指令為 `GOLDEN_UPDATE=1 node --test --test-reporter=tap test/golden.test.ts test/campaigns/*.test.ts src/ops/sim/golden.test.ts`，exit 0、fail 0。`src/sim/probe-baselines.json` 是固定載體／配裝基準，沒有引用六情境，也不是情境結果快照；不用重產。

既有測試期望值調整：`src/ops/sim/campaign.test.ts` 的 idle seed 7 在第 104 天駕駛歸零，月摘要由 6 改 3；長 wait seed 1 改驗第 90 天 no-pilots；continueAfterEnd 改驗同一終局只發一次；random 六蝕月不變量測試使用既有 continueAfterEnd，維持完整時長。`test/rules/monster-def.test.ts` 排除新增 core 欄位後仍驗原狀態 hash，另確認缺省 core=true，未放寬怪獸行為。`test/ai/stub-rules.ts` 補齊必填 core=true。其他引用六情境的測試沒有需要改的寫死期望值。

code-map.json 已用 tabledb 更新 core、content、rules、ai、sim、ops、ui-adapter，點名新函式、規則表與測試。

## 沒做到或證據不足的

交接書指定排除的 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts` 留給領導在沙箱外重跑。已讀測試：前兩支用六情境的動態重播比較／一般觀察輸出，沒有 glove 座位、固定 hash 或控制 label 期望需要修改；worldgen CLI 只驗地圖生成，未受本線改動影響。沒有把舊輸出當新驗收，也未跑禁用的 GUI／e2e／dev server。

## 需要決定的事

無。本線僅採交接書的 AP／疲勞暫值；其他駕駛養成、核心等級、玩家選 AI 駕駛與世界觀文字均未延伸。

## 以後交接書該點名的工具

`node --test --test-isolation=none --test-name-pattern=...`：本沙箱一般 test runner 的 TAP 只列檔案，這組旗標能顯示逐案名稱、失敗堆疊與新增案例數，便於精確回報；不是新增驗收條件。

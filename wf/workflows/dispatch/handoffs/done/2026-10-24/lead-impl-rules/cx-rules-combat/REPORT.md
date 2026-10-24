# cx-rules-combat：戰鬥六模組、26 測試及三個黃金情境已交付，整體 npm test 尚待外線整合

## 做了什麼

完成排序、回合、Wait、逐格移動、指令檢查與預覽、命中與部位抽樣、傷害修正、層序列、座位傳導。人物功能只透過 core 信號／指令登記表連接，未 import 或閱讀 people-flow 六支實作。未改 core、content/base、既有內容、index、golden runner 或套件設定，未 commit。

本線恰好 26 個 `test()`：turn 4、movement 4、command 5、attack 4、layers 6、conduct 3。layers 的六條測試以層配置／packet／期望 HP／remaining 表格驅動；8 個 constraints id 全在測試名稱中。混合執行時單元 fixture 的 moraleEvents／injuries 使用空表，讓旁線已登記的信號不要求不存在的測試效果；正常隔離執行的 command 測試驗證未登記 eject 為 unsupported。

固定五條驗收的證據如下（未另加驗收條件）：

1. `node --test --test-isolation=none --test-reporter=tap 'src/rules/*.test.ts'`：exit 0，76 tests、76 pass、0 fail，包含本線 26 條。`npm run typecheck` 最新 exit 0，全專案零錯誤。`npm test` 最新 exit 1、27 個檔案測試中 25 pass／2 fail；失敗均在下述非本線檔，尚不能宣稱此條整體通過。沙箱外計數與最終 npm test 由領導重跑。
2. 六支實作匯出名稱／簽名與 contract §5 相同；無額外匯出，無 people-flow import。
3. 三個 combat JSON 及真實 hash 均已產生。領導 runner 的三個 combat 測試連跑兩次 hash 一致、回讀 hash 通過，3 pass／0 fail／0 skip。合計包含 LayerBroken、PartBroken、Conducted。combat-tenth 原始傷害 100，兩層實扣 5＋5＝10，內層 HP 由 15 降至 10。
4. DC-C03、DC-C04、DC-T06、DN-M-07、DN-M-09、DN-M-10、DN-W-14、PW-11 全可 grep；`node src/content/loader.ts content/base test/scenarios/pack`：exit 0，OK 0 errors, 0 warnings。
5. 本 REPORT 已寫入指定路徑，四段與 SPEC-GAP 清單均具備。

## 產出（全部新檔清單）

共同根目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/`。下列均為該根目錄下的相對路徑。

程式與測試（12）：`src/rules/turn.ts`、`src/rules/turn.test.ts`、`src/rules/movement.ts`、`src/rules/movement.test.ts`、`src/rules/command.ts`、`src/rules/command.test.ts`、`src/rules/attack.ts`、`src/rules/attack.test.ts`、`src/rules/layers.ts`、`src/rules/layers.test.ts`、`src/rules/conduct.ts`、`src/rules/conduct.test.ts`。

情境及黃金（6）：`test/scenarios/combat-layers.json`、`test/scenarios/combat-conduct.json`、`test/scenarios/combat-tenth.json`、`test/golden/combat-layers.hash`、`test/golden/combat-conduct.hash`、`test/golden/combat-tenth.hash`。

測試內容（5）：`test/scenarios/pack/frames/cb-lancer.json`、`test/scenarios/pack/frames/cb-kaiju.json`、`test/scenarios/pack/bodyplans/cb-dual-shell.json`、`test/scenarios/pack/abilities/cb-shot.json`、`test/scenarios/pack/effects/cb-shock.json`。

交接（1）：`wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-combat/REPORT.md`。

合計 24 個新檔（REPORT 外 81,916 bytes，加 REPORT 仍低於 200 KB）；未用到 07:37 orders 放寬的 30 檔額度。情境均為 2 單位、4×4 地圖、1 條指令；setup 全部引用測試包，人物使用已存在的 `person/pp-burden-pilot` 並覆寫 burden=0，地形使用既有 `terrain/plain`。

hash：combat-layers＝`8f15739ad520c9fb`；combat-conduct＝`8f15739ad520c9fb`；combat-tenth＝`969fa5e9e4e214fa`。前兩者採相同攻擊但驗證不同事件要求，因此 hash 相同是預期。

## 沒做到或證據不足的

整體 `npm test` 尚未綠燈，故終局回報 BLOCKED，阻塞在跨線驗收，沒有回滾本線產物：

- `src/content/content.test.ts` 的「指定內容種類件數正確」在第 28 行顯示 `7 !== 2`。base 由內容線新增內容；領導 07:33 orders 已說由領導修，本線不改。
- `test/golden.test.ts` 的 people-capture 關鍵事件序列不符。實際 seed=42 的五次命中骰為 83、97、24、55、55；第二擊 front-right 在 chance=95 下 Miss，故未符合捕捉的四肢毀損條件，最後沒有 Captured。不是 combat 的命中上限錯誤；已寄上游定位證據。people hash 由旁線／領導產生，本線未寫。

最初照交接書跑 `GOLDEN_UPDATE=1 node --test test/golden.test.ts`，子行程只顯示檔案失敗。改加 `--test-isolation=none --test-reporter=tap` 後發現 golden 目錄尚不存在；已建立交付所需目錄。為免寫旁線 hash，使用同一領導 runner 搭配 `--test-name-pattern='黃金情境 combat-'` 生成本線三個 hash，再以不帶 GOLDEN_UPDATE 的同指令驗回讀。沒有自造 hash 算法或修改 runner。

臨時證據：`/tmp/cb-rules.log`、`/tmp/cb-npm-test-final.log`、`/tmp/cb-content-test.log`（非版控交付物）。較早的 AI score.ts 缺檔型別錯誤已消失，最新 typecheck 為綠。

## 需要決定的事

請領導更新內容件數斷言，並請 people 情境作者更換 people-capture 的 seed 或補打未命中的 front-right，然後重產 people hash、於沙箱外重跑固定第 1 條。解除條件是整體 npm test exit 0、fail 0；本線其餘四條已有證據。

未超出固定驗收去增加測試條數或其他驗收。既有 code map、SESSION-LOG、index 與 commit 維護交領導，本線沒有這些檔案寫入權限。正式 base 的完整 constants 與人物線效果仍需領導／內容線整合。

## SPEC-GAP 清單

- `layers.ts`：PacketIn 契約未列 conductBonus；維持公開型別不變，由攻擊端以結構擴充傳遞。沒有 structural 層的部位不因空集合自動破壞。人物沒有層，damage 的 seats 目標以 conducted 信號交人物線處理。
- `attack.ts`：姿態／方向無資料欄位，exposure 的這兩項倍率採 1；總 exposure 為零時取首個存活部位。line 採格中心共線／radius 寬度，cone 採目標方向扇區的最小幾何解，尚無本次驗收外的專門情境。
- `movement.ts`：無登記 locomotion tag 時依契約採 leg；定身使用 immobilized／rooted 效果 tag。離格反應在進格後執行，合法距離以移動前位置的副本檢查；AP 免費、其他池照付。
- `turn.ts`：roleAttr 已合併機體屬性，initiative 不重複加 frame.baseAttrs；全部單位無法接收指令且旁線尚未定局時，停在輪末避免空轉。
- 此次反應執行涵蓋必需的 enemyLeavesAdjacent；其他 trigger 類型沒有新增完整執行路徑。沒有擴張此次固定五條驗收。
- 未發現需要修改 core 五檔才能通過本線固定測試的 bug。

## 以後交接書該點名的工具

`node --test --test-isolation=none --test-reporter=tap --test-name-pattern='黃金情境 combat-' test/golden.test.ts`：共用黃金 runner 下僅執行本線情境，並取得沙箱內完整失敗證據；生成時另加 `GOLDEN_UPDATE=1`。`mkdir -p test/golden`：首次產生 hash 前準備目的目錄。

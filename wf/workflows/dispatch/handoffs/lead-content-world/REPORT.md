# REPORT — lead-content-world：營運層內容 139 檔、三族裂縫、事件模板改寫（頂層代存，2026-10-24）

STATUS：**DONE**。commit `8ba60b0`（內容）、`986b390`（收線）。清單 [catalog.json](catalog.json)、工人規則 [engine-rules.md](engine-rules.md)、檢查腳本 `lint_world.py`、工人 REPORT `cx-world-{ev-a,ev-b,data,dlg}/REPORT.md`。

驗收（乾淨 worktree，HEAD `1916468`＋本線）：`npm test` 582/582；check、ops content check 0／0；typecheck 過；`npm run sim:campaign` idle／greedy 12 潮月 OK。

## 新增（139）
| 類別 | 件數 | 作用 |
|---|---|---|
| events | 40（隨機 30、鏈中後續 10） | 有 |
| rifts | 3：獸族（錨崖牙・赤眼兇星）、異形（無錨、一個大潮自閉）、菌絲（錨菌床・白夜、每大潮蝕 2 區） | 有 |
| encounters | 15：三族×淺／深／核 9、人類 6 | 三族有；人類 6 休眠 |
| contracts | 11：清剿、封印、收復、守城、護送、偵察、奪回遺物、參戰型三段、獵殺二名怪、處理同業、走私上月 | 全休眠（無勢力發包） |
| names | 22：神話名 10 文化、機械系詞庫 4、凶名 4、二名 4 | 有 |
| research | 15：機魂算／手／心 9，拘束、屍體改裝、鍛研、刻痕翻譯、裂晶精煉 | 有 |
| markets | 3：新加坡、鹽灘、舊陣列遺跡 | 有 |
| dialogues／backgrounds／recruit-pools | 15／12／3 | 有 |

事件模板 `templates/default.json` 改寫成正式文案，涵蓋 80 種事件型別；`narrative.json` 併入後清空。

## 最得意
手套錯念港名；空碗連續劇；心向・罕見的自我（機魂天賦最深項）；空援帳單三部曲（旗標連動）；二名「吞月黑牙」「盲眼天葬」、凶名「棺材釘」「掏肺鉤」。

## 平衡（greedy 30 seed，6 潮月存活）
HEAD 27/30 → 全內容 24/30（關事件 26/30，噪音邊緣）。greedy 選完事件會強制等一天（模擬器造成），故事件限第 2 潮月起、每月 5／12／19／26 日、首選項不賺不賠。三族裂縫讓存活局現金變多（第 3 潮月約 8k–13k，HEAD 約 5k）。ops 黃金 `a4872efc76bcebfc`→`e30325668e9ab224`（新市場與招募池弦月抽庫存使亂數位移，多開一道裂縫）。

## 修掉
吉大港招募池 id 排序導致既有測試抽錯人 → 改 `recruit/wharf-chittagong`；核層遭遇缺 D 級名額拋 empty encounter budget → 補 D:1。

## 需要決定（頂層 2026-10-24）
1. 11 份休眠契約接上（發包勢力與行動牌；護送／獵殺需戰鬥內單位 id；參戰型補給型別）→ lead-impl-war 範圍，已轉。
2. 人類對手遭遇需編成欄 → 引擎缺口線。
3. 模板取不到裂縫／契約／勢力／工作等名稱 → 交 ops 文案線（`src/ops/text` 名稱解析）。
4. 招募會重複具名人物、士氣效果套到同源複本 → 交 ops 線。
5. 裂縫無位置欄 → 大地圖實作時重看選點。
6. 兩項科研解鎖既有物、異形核層錨無作用 → 內容後續。
7. `narrative.json` 清空 → 維持。

## 事故與其他
誤以 `git worktree remove --force` 刪掉 scratchpad 中別線的舊 worktree `wt-base`（`9000e92`，detached），未見未提交改動。`test/fuzz` 快速版全套一起跑偶爾 20 秒逾時；`src/mcp/sortie.test.ts` 對 seed 1–7 首潮月可出戰點的要求太緊。

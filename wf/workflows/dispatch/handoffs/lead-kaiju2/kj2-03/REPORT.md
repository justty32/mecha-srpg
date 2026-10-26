# 已讀清單

以下均親自讀取；相對路徑以本 worktree 為根。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/playtest.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md`
- `wf/workflows/dispatch/handoffs/lead-kaiju2/cx-kj2-03.md`

另讀完 `wf/workflows/content/` 全部檔案（包含子目錄與 tools/stats.ts）；資料表以 tabledb 分頁查閱。也讀過 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、common 的 conventions、code-map、data-files、dev-env、inbox README／PROTOCOL、dispatch/lessons，以及計畫第 9 段 SB／PB／FB／FC／MD／MC／MB／MA／AU／AA／AB／AE／FX／IT／LP／SC 所指的完整範本。roster 依 `batch=kj2-03` 查四列；review-draft 取本批四種、A 級與地點草稿。

## 做了什麼

只新增指定 36 檔：species 4、bodyplan 4、活體／屍體 frame 8、monster 4、能力 9、效果 4、AI 1、lore 地點 1、展示情境 1。數值逐項照審定 roster 展開，沒有做平衡調整。展示用兩台既有 A 級崖牙，中央四格守八輪，玩家全滅先判負，敵方存活二十輪兜底；seed 210803。

## 產出與設定掛點

- `species/surf-runner`（D）：薄肉快步接近再短暫增閃；打斷一組前足還有後足，兩組全破才停。 掛到：西雅圖接糧港外岸；F、G／底色1.4、1.6、1.8；承2101蝕線協定的沿海縮守，丹佛供糧與回運精粹並行。常由貨場守軍與糧車護送隊遇見。
- `species/foam-jaw`（C）：咬擊與酸沫扇面讓玩家拆開隊形；顎破後命中下降而核仍可捕。 掛到：西雅圖接糧港外岸；F、G／底色1.4、1.6、1.8；承2101蝕線協定的沿海縮守，丹佛供糧與回運精粹並行。常由貨場守軍與糧車護送隊遇見。
- `species/shelf-back`（B）：護背小圈只幫貼身同伴；大背板吸火，暴露的長顎是捕捉捷徑。 掛到：西雅圖接糧港外岸；F、G／底色1.4、1.6、1.8；承2101蝕線協定的沿海縮守，丹佛供糧與回運精粹並行。常由貨場守軍與糧車護送隊遇見。
- `species/reef-antler`（A）：線狀掃角迫使守軍橫向分散；拆角減命中，繞過高暴露厚頸才是速殺藏核的路。 掛到：西雅圖接糧港外岸；F、G／底色1.4、1.6、1.8；承2101蝕線協定的沿海縮守，丹佛供糧與回運精粹並行。常由貨場守軍與糧車護送隊遇見。

地點 `place/seattle-outer-grain-quay` 的正文逐種寫出來處、常見位置與遇見的人；礁角俗名「西雅圖白角」、二名「折桅白冠」。年表草稿只記 2106 年白角折桅後守軍拆線、內棚卸糧的那夜，沒有修改既有地點或年表。

## Probe、數值與驗收證據

所有輸出均來自本次執行，原始紀錄在 `/tmp/cx-kj2-03/`。四次逐種 check 以及寫完情境後的 final check 都 exit 0；末行皆 `OK 0 errors, 10 warnings`。final 的 base 檢查為 `OK 0 errors, 24 warnings`，ops 檢查為 `OK 0 errors, 10 warnings`。lore `errors=0 warnings=2`；兩個 warning 是既有 busan-returned-seal、dark-quay-surety 事件未列年表。typecheck exit 0。

新增的 8 個 warning 均為計畫明定獸族 soft instinct、bands=[] 所致，逐條如下；其餘 warning 均指向既有檔：

- `content/base/frames/bio-foam-jaw.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/frames/bio-reef-antler.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/frames/bio-shelf-back.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/frames/bio-surf-runner.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/species/foam-jaw.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/species/reef-antler.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/species/shelf-back.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。
- `content/base/species/surf-runner.json`：`[soft-overflow-band] instinct: no band covers values above max`。保留 roster 的 soft 池與空 bands。

Probe 指令涵蓋本批四個 monster 及指定四個參照，各 n=5，共 40 場，exit 0、例外 0。均因 `eliminate:repelled` 結算；沒有 timeout。

| 等級 | 新 monster（平均輪數） | 同級參照（平均輪數） | 對手 | 新／參照勝率 | 新／參照平手率 |
|---|---|---|---|---|---|
| D | surf-runner-d 8.60 | tidewolf-d 8.00 | bulwark-i ×2 | 0%／0% | 0%／0% |
| C | foam-jaw-c 8.40 | hound-c 7.40 | bulwark-ii ×2 | 0%／0% | 0%／0% |
| B | shelf-back-b 8.00 | bulwark-b 8.20 | bulwark-iv-rampart ×2 | 0%／0% | 0%／0% |
| A | reef-antler-a 6.80 | cliffjaw-red-eye 7.20 | selene-aurora ×2 | 0%／0% | 0%／0% |

新能力的主角使用次數：

| 物種 | 能力與次數 |
|---|---|
| 濺蹄 | 掠水踢踏 65、折身掠浪 5 |
| 沫顎 | 貼岸啃咬 41、翻顎噴沫 16 |
| 棧背 | 橫背推岸 34、俯背成簷 0 |
| 礁角 | 橫角斷桅 14、俯首挑岸 13、低角迎矢 0 |

未使用的兩招皆只給 `protect=1`，單獸 probe 沒有友軍可指派護衛；`src/ai/score.ts` 的 want 於 assignment.protect 缺省時把 protect 需求設為 0。既有 B 參照的 kx-shield-raise 也為 0。此為本次觀測的原因，依交接書「沒用到寫原因」揭露，保留計畫戰術鍵，不改 AI 或另加測試。

HP 與傷害暫值：D 150／6、C 400／16（扇面 10）、B 1000／24、A 1700／30（直線 20），均照計畫。probe 的超帶欄位與理由如下：

- 濺蹄 skip 射程 0：自身增益；棧背 shelter 射程 0：以自身為心、半徑 1 的友方增益。
- 沫顎 foam 傷害 10 低於 C 單發帶 12：扇面按單體 16 的約六成，符合範圍傷害通則。
- 礁角 brace AP3 低於 A 攻擊帶 4、射程0：自身防護依增益 AP2–3；gore／rake armorPen0 低於 A 建議0.15：計畫明定不加穿甲；rake 傷害20低於24：直線按單體30的約三分之二。
- 參照超帶：tidewolf-d bite18、pounce12超D傷害上限9；hound-c carrion-gulp 射程0；bulwark-b shield-raise 射程0；cliffjaw-red-eye cliff-bite與ground-stomp的armorPen0、ground-stomp傷害20、star-howl AP3。既有值不動。
- 額外人工對照：濺蹄 D 短效 evasion+10 超效果列 D±5，但低於硬上限22，為快步定位且只維持一回合；礁角基本攻擊 AP5 超「基本攻擊≤4」通則，沿 roster；顎裂−10／角折−12為永久部位損毀後果，非永久人物特質。層抗性最高0.5，所有物種均有全層零抗傷害型。

npm test 原始紀錄：`/tmp/cx-kj2-03/test.log`。

```text
# tests 152
# suites 0
# pass 146
# fail 6
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1033198.564806
```

失敗檔案：`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/content/worldgen.test.ts`、`src/ops/world/grid.test.ts`、`test/fuzz/fuzz.test.ts`、`test/sim/invariants.test.ts`。已知類別依交接書如實記錄；runner 只報檔級 ERR_TEST_FAILURE，未提供更細的斷言訊息，不能由此單獨證明每項的環境根因。

完整 npm test：exit 1，152 個檔案中 146 通過、6 失敗，約 1033 秒。MCP cli／e2e、worldgen、grid 四項屬交接書列明的例外類別；其餘 fuzz 與 sim/invariants 另以串行、單獨執行作失敗釐清，指令為 `node --test --test-reporter=spec --test-concurrency=1 test/fuzz/fuzz.test.ts test/sim/invariants.test.ts`，exit 0，2/2 通過（fuzz 51057ms、invariants 16674ms，合計67738ms），原始紀錄 `/tmp/cx-kj2-03/test-triage.log`。因此這兩個額外失敗未能重現；時間門檻與併發負載是推測，完整執行未提供內部斷言，不能把推測當根因。沒有修改內容來遷就測試，也沒有重跑完整 npm test。

路徑 gate：git status 除開場既有 node_modules 外，只有允許的 36 個新檔，既有檔 0 修改。總容量 40719 bytes，最大檔 5246 bytes（beast-reef-antler.json）。review 36 列，白話最長 35 字；naming 53 列，全標提案；timeline-add 1 條。B 以下 monster 沒有 name／epithet。新內容與命名／審查表禁用詞命中 0；新內容未使用舊詞、世界觀舊稱或任何「殼」字。

## 沒做到或證據不足的

兩個 protect 能力在指定 probe 中使用 0 次，原因如上；不宣稱已測得群體護衛能力覆蓋。依交接書本批免 MCP 試玩，展示可玩性與平衡不另作保證。首次濺蹄 check 曾發現 capture.corpse 是不接受的欄位，已從四種 capture 展開中省略；四個 corpse frame 仍依清單獨立建立，沒有改 schema 或引擎。

## 需要決定的事與需要引擎支援的玩法

本批無待使用者決定事項。營運 rift 接入與年表插入由領導辦理。真正的地域棲位選獸、破武器部位後停止內建招式，仍依計畫第10段另案；本批只做顎／角破後降命中，不宣稱封招、位移、擊退或跨水。若希望單獸也主動用防護招，需後續 AI 語義審議，不能以改計畫數值湊使用次數。

## 子代理

未使用子代理；成本為 0 個子代理呼叫、0 額外代理 token。四種、文件與原始測試均由本線親自處理。品質依上述固定五條驗收證據與已揭露限制。

## 以後交接書該點名的工具

無。

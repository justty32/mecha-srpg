已讀清單：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；worktree 根目錄為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-01`，已讀該根目錄下的 `AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/battle-field.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/specs/core/data-model-world.md`、`wf/workflows/planning/specs/core/data-model-world/scenario.md`、`content/base/scenarios/kj2-03-demo.json`。共用規則 `wf/workflows/dispatch/handoffs/lead-fill-scen/fs-common.md` 在 worktree 不存在，實讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-common.md`。另已讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/cx-fs-01.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/scenarios.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/maps.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/roster-coverage.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/review-draft.json`。三張規格表以 tabledb 篩本批；roster 無 batch 欄，以 fs-01 場次篩選；review 草稿以 fs-01 路徑篩選。逐檔 frame、monster、species、terrain、lore 掛點及武器／人物／pilot 座引用收於[完整已讀清單](readlist.json)。

做了什麼：DONE。依已審規格新增恰好 7 情境、2 地圖；固定四條驗收均完成。worktree HEAD 為 `57928949b0ee4f41ed91e82c850ff93f17adbb42`。未修改既有 tracked 檔；開場既有 `node_modules` symlink 指向主 repo 依賴。所有 driver 與 log 均在 `/tmp/cx-fs-01/`。

產出與掛點：[白話審核表](review.json)為 wf-table/1，9 列、每列白話≤60字，新名稱標「（提案）」。八打雁3情境及外閘雙岸地圖掛 `place/batangas-outer-sluices`；仙台4情境及碎燈崖道地圖掛 `place/sendai-bell-cliff`。補充事件沿規格分別為 `event/harbor-last-watch`、`event/seven-seals-diverge`、`event/workshop-outline-appendix`、`event/lamplit-return-trials`，均是2108可能事件；etymology註明英文意涵及「2108可能遭遇的試機配置」。

地圖均24×20，矩形與收尾覆寫順序、terrain格數、部署、出口及globals照表；glyph按terrain id排序為a–f。八打雁底街419格、仙台底平地441格。slots、單位順序、固定at、persons、objectives、rounds與seed逐欄等於計畫。16款出場frame均核有pilot座與帶能力的weaponMount defaultLoadout；全場人物不重複，玩家lose在最前、盟軍雙向。母體鄰格保留，不改species AI，不宣稱初始子群繫母。內容總計28,536 bytes、最大單檔4,487 bytes，均低於gate。

驗證結果：`npm run check` exit 0，末行 `OK 0 errors, 10 warnings`（[原始輸出](/tmp/cx-fs-01/check.txt)）；10則警告均為既有monster的partsOverride與capture layer HP差異，逐條收於[警告原文](check-warnings.json)。`npm run typecheck` exit 0（[原始輸出](/tmp/cx-fs-01/typecheck.txt)）。每場開跑前執行指定pgrep檢查，無重負載並行（[資源紀錄](/tmp/cx-fs-01/resource-checks.txt)）。

14場均使用交接書寫死的 `npm run sim -- --scenario … --seed … --ai-vs-ai`，逐場一次、依序執行；全部exit 0、0例外、0未決。原始輸出未改寫，完整數字與hash另存[對戰證據表](sim-evidence.json)。以下連結供逐場開啟原始log；winner照CLI原文，ally勝代表盟軍方，未換寫成player勝。

<!-- wf-nav -->
| 情境 | seed | 勝方 | reason | 輪數 | 原始log |
|---|---:|---|---|---:|---|
| fs-01-mud-mouth | 21082601 | enemy | eliminate | 18 | [log](/tmp/cx-fs-01/fs-01-mud-mouth-21082601.txt) |
| fs-01-mud-mouth | 21092601 | enemy | eliminate | 16 | [log](/tmp/cx-fs-01/fs-01-mud-mouth-21092601.txt) |
| fs-01-wing-lantern | 21082602 | ally | repelled | 12 | [log](/tmp/cx-fs-01/fs-01-wing-lantern-21082602.txt) |
| fs-01-wing-lantern | 21092602 | ally | repelled | 10 | [log](/tmp/cx-fs-01/fs-01-wing-lantern-21092602.txt) |
| fs-01-fan-feet | 21082603 | player | eliminate | 10 | [log](/tmp/cx-fs-01/fs-01-fan-feet-21082603.txt) |
| fs-01-fan-feet | 21092603 | player | eliminate | 9 | [log](/tmp/cx-fs-01/fs-01-fan-feet-21092603.txt) |
| fs-01-bell-break | 21082604 | ally | repelled | 11 | [log](/tmp/cx-fs-01/fs-01-bell-break-21082604.txt) |
| fs-01-bell-break | 21092604 | ally | repelled | 10 | [log](/tmp/cx-fs-01/fs-01-bell-break-21092604.txt) |
| fs-01-sluice-eight | 21082605 | player | survive | 8 | [log](/tmp/cx-fs-01/fs-01-sluice-eight-21082605.txt) |
| fs-01-sluice-eight | 21092605 | player | survive | 8 | [log](/tmp/cx-fs-01/fs-01-sluice-eight-21092605.txt) |
| fs-01-needle-ledge | 21082606 | player | repelled | 13 | [log](/tmp/cx-fs-01/fs-01-needle-ledge-21082606.txt) |
| fs-01-needle-ledge | 21092606 | player | repelled | 11 | [log](/tmp/cx-fs-01/fs-01-needle-ledge-21092606.txt) |
| fs-01-last-cliff-lamp | 21082607 | player | survive | 8 | [log](/tmp/cx-fs-01/fs-01-last-cliff-lamp-21082607.txt) |
| fs-01-last-cliff-lamp | 21092607 | player | survive | 8 | [log](/tmp/cx-fs-01/fs-01-last-cliff-lamp-21092607.txt) |

沒做到或證據不足：無未完成項。14場均有終局；timeout、maxSteps、stalled、未決各0場。CLI沿用預設maxSteps=10000，未覆寫或上調rounds；原始log不含完整指令序列，故不宣稱能力逐次使用或母鏈必定生成。這是固定兩seed的完成性證據，沒有平衡或人工試玩的結論，未改任何既有數值。

需要決定／引擎候選：本線無新增必決項或引擎改動候選。新中文名稱維持提案，由領導與使用者審基調；部分盟軍局因敵方撤退以repelled先終局，照實保留，未為達成hold或killTarget而改AI。

子代理數與成本可得性：0；本環境未提供本線token與金額計量，不虛報成本。依交接書只執行固定四條驗收，不追加全套測試、MCP、content:probe、黃金重錄或wf全庫掃描。

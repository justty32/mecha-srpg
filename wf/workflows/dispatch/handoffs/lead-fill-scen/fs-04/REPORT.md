已讀清單：以下交接指定檔均由本人親讀；資料表只取 fs-04，本批 roster 按場次篩選。逐檔 frame（28）、monster（9）、species（9）、terrain（8）、lore（7）及補充規範的路徑另列 [readlist.json](readlist.json)。

<!-- wf-nav -->
- [主樹 AGENTS.md](/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md)
- [worktree AGENTS.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/AGENTS.md)
- [user.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/common/user.md)
- [fs-common.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/fs-common.md)
- [content/README.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/content/README.md)
- [content/batch.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/content/batch.md)
- [content/battle-field.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/content/battle-field.md)
- [content/playtest.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/content/playtest.md)
- [content/polish.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/content/polish.md)
- [content/world-pillars.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/content/world-pillars.md)
- [lore/style.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/content/lore/style.md)
- [lore/README.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/content/lore/README.md)
- [data-model-world.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/planning/specs/core/data-model-world.md)
- [data-model-world/scenario.md](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/wf/workflows/planning/specs/core/data-model-world/scenario.md)
- [kj2-03-demo.json](/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-scen/wt-fs-04/content/base/scenarios/kj2-03-demo.json)
- [plan/plan.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/plan.md)
- [plan/scenarios.json](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/scenarios.json)
- [plan/maps.json](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/maps.json)
- [plan/roster-coverage.json](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/roster-coverage.json)
- [cx-fs-04.md](/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-scen/plan/cx-fs-04.md)

做了什麼：DONE，固定四條驗收完成。僅新增指定 7 情境、3 地圖；未修改既有檔。10 檔合計 29568 bytes，最大 3988 bytes。worktree HEAD `8a48e7ef3e982b278e382d8a166cfc05a8564428`；開場已有 node_modules symlink，沿用。

產出與掛點：完整逐檔名稱、≤60 字白話與地點掛點在 [review.json](review.json)，恰好10列，新專名保留「（提案）」。蘇伊士兩場、奈洛比三場、巴拿馬兩場；三圖各掛對應 place。scenario etymology 保留補充事件 id、英文意涵及「2108可能遭遇的試機配置」。唯一 brief 潤飾為通海針雨的「封門」→實際上場的「長爐」。

座標、slots順序、persons、objectives、rounds與seed逐欄對表；28種frame沿原defaultLoadout，逐台核pilot座、武器掛點與能力，證據 [loadouts.json](/tmp/cx-fs-04/loadouts.json)。人物全場不重複，怪獸slot不覆寫species AI，泥母周圍留空且初始鹽針不宣稱已繫母。三圖按矩形／乾道／部署／中央碑順序展開480格，地形格數與表相同，小寫legend按terrain id排序。玩家對敵最近13格、對第三方最近15格；護送ally-0/ally-1到西口17/18格，雙向同盟及各自死亡lose、三方各win均保留。

驗證結果：[check原始輸出](/tmp/cx-fs-04/check.txt) 退出0：loader段 `OK 0 errors, 32 warnings`，ops段暨末行 `OK 0 errors, 10 warnings`；[typecheck原始輸出](/tmp/cx-fs-04/typecheck.txt) 退出0。共42條警告輸出（含兩段重複的10條capture HP警告），均指向未修改的既有檔；另有19條本能軟上限、2條數值帶及1條infantry未配武器警告。逐項在 [check-warnings.json](check-warnings.json)。

14場sim逐場依指定命令、順序及兩seed各跑一次，全數exit0、有明確勝負，例外0、未決0、timeout0；玩家7勝、敵方7勝。每場啟動前跑pgrep並排除命令字串自匹配的sandbox／shell包裝行程，依序單場執行；每步讀orders。結構化紀錄 [sim-results.json](sim-results.json)，以下各連結直接開真實原始log：

<!-- wf-nav -->
- fs-04-lock-turn：[21082622：enemy/survive，20輪](/tmp/cx-fs-04/fs-04-lock-turn-21082622.txt)；[21092622：enemy/survive，20輪](/tmp/cx-fs-04/fs-04-lock-turn-21092622.txt)。
- fs-04-canal-pin：[21082623：enemy/eliminate，12輪](/tmp/cx-fs-04/fs-04-canal-pin-21082623.txt)；[21092623：enemy/eliminate，10輪](/tmp/cx-fs-04/fs-04-canal-pin-21092623.txt)。
- fs-04-ferry-watch：[21082624：player/survive，8輪](/tmp/cx-fs-04/fs-04-ferry-watch-21082624.txt)；[21092624：player/survive，8輪](/tmp/cx-fs-04/fs-04-ferry-watch-21092624.txt)。
- fs-04-upland-inspection：[21082625：player/repelled，11輪](/tmp/cx-fs-04/fs-04-upland-inspection-21082625.txt)；[21092625：player/repelled，8輪](/tmp/cx-fs-04/fs-04-upland-inspection-21092625.txt)。
- fs-04-anvil-crossing：[21082626：player/repelled，17輪](/tmp/cx-fs-04/fs-04-anvil-crossing-21082626.txt)；[21092626：enemy/eliminate，15輪](/tmp/cx-fs-04/fs-04-anvil-crossing-21092626.txt)。
- fs-04-pilgrim-crossfire：[21082627：player/escort，2輪](/tmp/cx-fs-04/fs-04-pilgrim-crossfire-21082627.txt)；[21092627：player/escort，2輪](/tmp/cx-fs-04/fs-04-pilgrim-crossfire-21092627.txt)。
- fs-04-three-bank-fire：[21082628：enemy/eliminate，26輪](/tmp/cx-fs-04/fs-04-three-bank-fire-21082628.txt)；[21092628：enemy/eliminate，9輪](/tmp/cx-fs-04/fs-04-three-bank-fire-21092628.txt)。

沒做到或證據不足：無固定驗收缺項。CLI預設maxSteps為10000，本批沒有觸發上限；這14次stdout不包含完整逐事件資料，不能據此宣稱特定招式必定發動或完成平衡驗證。護送兩seed均第2輪完成，照實揭露，未改AP、AI、座標或輪數。

需要決定／引擎候選：沒有必須先決定的項目；新名仍待敘事審核。白手套僅保全陣營代理、機型有核心及駕駛，未宣稱人物改投或正式史實。未新增引擎提案；依固定驗收停在此處。

子代理數與成本可得性：0；未取得token／費用計量，不虛報成本。driver與原始log只在 `/tmp/cx-fs-04/`，報告表以tabledb讀寫；未跑額外測試、未commit。

## 已讀清單

以下由 cx-pilot-mech 第 2 輪退回重做親自重讀；相對路徑以本線隔離 worktree 為根。JSON 表以 tabledb 分段讀完。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `src/mcp/README.md`
- `content/lore/factions/third-blade.json`
- `content/base/world/lineages/tide-fin.json`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/tools/stats.ts`
- `wf/WAIT_USER.md`
- `wf/WORKFLOWS.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/dev-env.md`
- `wf/workflows/testing.md`
- `wf/workflows/inbox/README.md`
- `wf/workflows/inbox/PROTOCOL.md`
- `SPEC.md`

另親讀本次 `round2-order.md`、原交接書 `../cx-pilot-mech.md`、上一輪 REPORT、三台 thirdblade-* 與其 mx-* 部件、所有 cx3-* 內容、LS-3／FR-7、`src/core/types-def.ts` 相關型別、schema、probe 相關配裝與計數實作、MCP e2e 的 stdio 範例。開場 SESSION-LOG 計數 0、WAIT_USER 計數 3；inbox/new 無信。每完成一步均輪詢主 repo 的 cx-pilot-mech orders／mail。

## 做了什麼

**DONE（驗收退回第 2 輪）：FF-3 對 mite-d 勝率 80%、對 bulwark-i 20%，兩項門檻均達成；裝備改名與英文原名補齊，REPORT、第四場 MCP 紀錄與 playtest.json 已更新。**

本輪只處理退回單兩項。FF-3 保留一把非凡兵，增加既有內建鐵拳；掠潮飛鰭傷害 8→9（+12.5%），命中最終仍為 0，AP 仍為 2，HP 仍為 210。裝備「掠潮鰭吼」改為「掠潮鳴鰭」，中心語是器物「鰭」。三台 frame 的 aka 寫英文原名，展示情境 brief 補英文原名；其餘六檔無別名／備註欄，英文寫在下方命名表。C／B 數值未改，C 的 HP 例外依退回單交領導登記。

原批共 10 檔；本輪改其中 6 檔，未新增內容檔。全部內容 7980 bytes，最大 1361 bytes，未觸發 20 件／16 KB／1 MB gate。無受版控既有檔改動，未 commit、未安裝依賴，臨時腳本與 probe 原文均在 `/tmp/cx-pilot-mech/`。

| id | 級／定位 |
|---|---|
| frame/cx3-flyingfish-d | D／偵察 |
| frame/cx3-flyingfish-ii | C／潮行近戰 |
| frame/cx3-flyingfish-iv | B／指揮 |
| component/cx3-skimming-fin | D／掠潮鳴鰭 |
| component/cx3-crest-blade | C、B／破浪鰭刃 |
| ability/cx3-skimming-fin | D／主攻 |
| ability/cx3-crest-cut | C、B／主攻 |
| ability/cx3-call-the-tide | B／指揮 |
| effect/cx3-following-tide | B／命中增益 |
| scenario/cx3-flyingfish-shoal | 混編展示 |

命名表（與 id 的英文詞根對應，去掉批次前綴 cx3；component 與 ability 的 Skimming Fin 同源，但中文區分器物與招式）：

| 英文原名 | 意涵 | 中文名 |
|---|---|---|
| Flyingfish D | 飛魚代號機 | FF-3 |
| Flyingfish II | 飛魚第二型 | 飛魚-II型 |
| Flyingfish IV | 飛魚第四型 | 飛魚-IV型 |
| Skimming Fin | 掠潮的鳴鰭部件 | 掠潮鳴鰭 |
| Crest Blade | 切開浪峰的鰭刃 | 破浪鰭刃 |
| Skimming Fin | 飛鰭掠潮攻擊 | 掠潮飛鰭 |
| Crest Cut | 破浪後收鰭 | 破浪收鰭 |
| Call the Tide | 呼潮合擊 | 同潮齊刃 |
| Following Tide | 同行順潮 | 同潮 |
| Flyingfish Shoal | 飛魚群試刃 | 飛魚試刃・退潮留名 |

三台 aka 的 faction 使用已存在的 `faction/migrant-crew`，表示借機試刃時候鳥號記錄的英文叫法；不新增缺席於 base 的第三刃 faction。FF-3 依 D 級代號規則保留。schema／型別確認 component、ability、effect 沒有 aka／note 等可存別名欄；scenario 有 brief，因此存入該欄。

## 產出

數值帶逐項（下列為最終內容）：

D：HP＝210、部位＝6、層＝12、initiative／perception／evasion＝5／6／0、heat max／regen＝100／−15，均帶內。武器＝1 把非凡兵，mass＝2，帶內。9 AP 可打飛鰭 4 次，產燼＝20；改打鐵拳 3 次產燼＝24，混合出手亦不超過 24，低於 60 上限。

C：HP＝285（帶外，低於 300–420；沿用 mx-hover-c 輕型骨架，退回單指定由領導加豁免）；部位＝6、層＝12、initiative／perception／evasion＝7／5／0、heat max／regen＝100／−15，帶內。2 把非凡兵，mass＝5；躍潮＋兩次鳴刃產燼＝35，帶內。

B：HP＝445、部位＝6、層＝12、initiative／perception／evasion＝7／7／0、heat max／regen＝100／−18、charge max／regen＝80／12，帶內。2 把非凡兵＋1 系統、mass＝7，帶內。霜鰭令實際 heat regen＝−26（帶外，既有部件 −8 修正，基礎池帶內）；兩次破浪產燼＝40，帶內。

掠潮鳴鰭：hp／size／mass＝12／1／2，D 帶內；無矢池，使用燼池。掠潮飛鰭：AP＝2、傷害＝9、射程＝1–4、accuracy／armorPen／crit＝0／0／0、產燼＝5、無 cooldown，D 帶內；傷害/AP＝4.5（帶外，高於 D 建議 3–4，但低於一般基準 6 與限制線 8；本次 +12.5% 傷害調整以滿足退回門檻，仍是一把低單發武器）。

新增重用內建鐵拳：AP＝3、射程＝1–1、accuracy／armorPen／crit＝0／0／0、產燼＝8、無 cooldown，帶內；傷害＝14、傷害/AP＝4.67（帶外，沿用 FR-7 與劍魚系列的既有機體基本攻擊，不改能力本身；補近身出手機會，並未多掛一把武器）。偵察招 mx-rift-trace 射程＝9（帶外，既有無傷偵察用途，沿用）。

破浪鰭刃：hp／size／mass＝16／2／3，C、B 帶內。破浪收鰭：AP＝4、傷害＝20、傷害/AP＝5、accuracy＝5、armorPen＝0.15、crit＝0、產燼＝20、無 cooldown，C、B 帶內；射程＝1–1（C 帶內；B 沿用 C 武器，短於 B 近戰建議 1–2）。

同潮齊刃：AP＝3、charge 成本＝20、產燼＝10、cooldown＝3，B 帶內；射程＝0–4（友方增益例外，0 格允許自身），friendly＝only。同潮：accuracy＝+8、ownerTurns＝2、scope＝mech、badge＝同潮，帶內。

C 的既有 mx-singing-riposte AP＝0（反應例外），mx-tide-leap-up AP＝2、射程＝0（保命自身增益例外）。沒有修改既有能力。

展示情境：rounds＝30、player／enemy＝3／3 台、2 slots，沿用 skirmish-20；部署 x＝2／17、間隔 15。玩家三位既有駕駛不重複，採 defaultLoadout，敵方三隻 reaper-c；玩家 eliminate lose 在 win 前。20×20 地圖低於 C／B 一般建議，作混級小隊展示例外。

### 第 2 輪 FF-3 調整證據

先查非數值原因：right-weapon 槽與部件相容，defaultLoadout 有效；攻擊 AP 與 heat 池均存在，target＝敵方 unit、range＝1–4、tactics.attack＝1，沒有 cooldown 阻塞，也沒有 conventional-arms 十分律折損。原設定每組 5 場已有飛鰭使用 21／42 次，排除空手與能力不啟用。原機只有飛鰭主攻與無傷追蹤，缺乏參照機的內建近戰備用；先量命中與小幅傷害後再驗證補鐵拳，沒有改基準對手、AI、部署或 HP。

下表按實際執行順序；每列只改一個欄位／配裝項，每次同樣 seeds 1–5、20 輪、noRetreat=false。數字為勝／敗／平與平均輪數；兩組每次均 5 場、0 例外，結算全是 eliminate:repelled。AP 已是主動招下限 2，因此未降為 1。

| 步驟／單項改動 | bulwark-i 勝敗平／輪 | mite-d 勝敗平／輪 |
|---|---|---|
| 0 原設定 | 0/5/0／4.0 | 3/2/0／5.2 |
| 1 accuracy 0→5 | 0/5/0／4.2 | 3/2/0／6.6 |
| 2 accuracy 5→10 | 0/5/0／4.2 | 3/2/0／6.6 |
| 3 accuracy 10→15 | 0/5/0／4.2 | 1/4/0／5.8 |
| 4 傷害 8→9（+12.5%） | 0/5/0／5.2 | 2/3/0／5.6 |
| 5 補內建鐵拳 | 2/3/0／5.0 | 2/3/0／5.6 |
| 6 accuracy 15→0，採用 | 1/4/0／4.2 | 4/1/0／5.0 |

同一個單位的命中變高不保證這組撤退結算勝率更高；不把這組小樣本推論成普遍因果。最後撤回無益的命中加值，保留傷害 9 與鐵拳即通過門檻，停止調整。

原文依步驟存在 `/tmp/cx-pilot-mech/probe-r2-{baseline,accuracy5,accuracy10,accuracy15,damage9,innate,accuracy0}.txt`；各次 check 與 stderr 同目錄。每次改檔後 check 均 exit 0、末行 `OK 0 errors, 12 warnings`。

本輪原設定參照實測（同條件，前者 bulwark-i、後者 mite-d）：LS-3＝2/3/0、4.6 輪／0/5/0、5.0 輪；FR-7＝2/3/0、4.8 輪／1/4/0、7.0 輪。全無例外。這與退回單引用的 LS-3 20%／100%、FR-7 100%／100% 不同；原因未證實，不拿該差異放寬 FF-3 的 20%／80% 目標。FF-3 原設定則與退回單 0%／60% 完全一致。

命名完成後再次執行 `npm run content:probe -- frame/cx3-flyingfish-d frame/cx3-flyingfish-ii frame/cx3-flyingfish-iv frame/thirdblade-swordfish-iii ability/cx3-skimming-fin ability/cx3-crest-cut ability/cx3-call-the-tide --n 5 --json -`，exit 0。原文 `/tmp/cx-pilot-mech/probe-r2-final.txt`，本輪新證據如下：

| 主角 | 對手 | 勝／敗／平 | 平均輪數 |
|---|---|---|---|
| 飛魚 D | bulwark-i | 1／4／0 | 4.2 |
| 飛魚 D | mite-d | 4／1／0 | 5.0 |
| 飛魚 C | bulwark-ii | 1／4／0 | 4.6 |
| 飛魚 C | reaper-c | 1／4／0 | 4.4 |
| 飛魚 B | bulwark-iv-rampart | 0／5／0 | 4.0 |
| 飛魚 B | siegebeetle-b | 4／1／0 | 4.6 |
| 劍魚-III | bulwark-ii | 0／5／0 | 4.6 |
| 劍魚-III | reaper-c | 0／5／0 | 4.8 |

全部 pairings 平手率＝0%、例外＝0，原因都是 eliminate:repelled。D 的飛鰭使用＝25／24、鐵拳＝17／11；C 的破浪＝10／8，B 的破浪＝6／8、同潮＝5／10。三種新能力都有 AI 使用。ability 單獨 probe 載體各為 D／C／B，結果與相應 frame 一致，沒有當額外獨立樣本累加。D 的既有追蹤在最終兩組皆 0 次，偵察功能使用不足保留為限制。

### MCP 與固定六條驗收

本輪因武器傷害改動補 m4；m1–m3 保留上一輪原始證據，不能當成最終 D 數值的試玩結果。所有場次使用 `scenario/cx3-flyingfish-shoal`、輪數上限 30、三台新機全登場。每行能力數＝飛鰭／破浪／同潮；損失分「擊毀／撤離」。

- [m1](mcp-log/m1.txt)：舊版 seed 1，manual，第 5 輪 player 勝；我方 0／0、敵方 0／3；能力 11／5／2，人工使用。
- [m2](mcp-log/m2.txt)：舊版 seed 2，spectate，第 5 輪 enemy 勝；我方 0／3、敵方 0／0；能力 5／3／1，AI 使用。
- [m3](mcp-log/m3.txt)：舊版 seed 3，spectate，第 5 輪 enemy 勝；我方 0／3、敵方 0／0；能力 4／4／0，前兩種由 AI 使用。
- [m4](mcp-log/m4-round2.txt)：最終版 seed 1，spectate，第 5 輪 enemy 勝；我方 0／3、敵方 0／0；能力 3／3／1，三種由 AI 使用；FF-3 另用鐵拳 2 次。

四場 outcome 都是 eliminate:repelled。m4 用 Python subprocess 啟動指定 `node src/mcp/server.ts` stdio，initialize → notifications/initialized → battle_new(spectate:true,autoAdvance:false) → battle_step_ai(until:end) → observe／events／save → close。完整 request／response 含 outcome 已落檔；events 未達 2000 上限，以唯一 seq 的「使用」行計次；full observation 顯示我方三台皆已撤離、敵方三台仍作戰中，沒有把撤離算擊毀。server 關閉 stdin 後 exit 0，無本輪常駐行程；未碰 GUI、鍵鼠、螢幕或 socket。

[playtest.json](playtest.json) 由 tabledb 增加第四列；舊三列不改。新版只有一場團戰，結果是敗，不宣稱它改善了團戰勝率；本輪平衡通過依據是指定的兩組 5-seed probe。

1. 通過：git status 除原有 node_modules 外，僅列允許五目錄內 10 個 cx3-*.json 新檔；無受版控既有檔修改。相對本輪開工快照只變 6 檔，容量如上。
2. 通過：每次改內容檔後 check 零錯，最末 `/tmp/cx-pilot-mech/check-r2-scenario-name.txt` 為 `OK 0 errors, 12 warnings`（既有 warnings）；本輪 lore check `errors=0 warnings=0`，原文 `/tmp/cx-pilot-mech/lore-check-r2.txt`。
3. 通過：D／C／B 各一；每台都有 defaultLoadout、mech／human／lineage-tide-fin／faction-third-blade／series-flyingfish tags，沿用既有 mx-* bodyplan。
4. 通過：本輪最終三台與劍魚-III 同條件各跑 --n 5，完整數字如上；FF-3 特別門檻 80%／20% 達成。
5. 通過：playtest 四列，每列 log 存在且解析到非 null outcome；舊三場覆蓋手打要求，新 m4 覆蓋修改後 FF-3。
6. 通過：已讀清單包含交接書先讀行全部路徑，本輪親讀而非沿用聲稱。

退回單指其餘檢查已過，本輪依原交接書固定六條與兩項退回要求驗收；未額外重跑全測、typecheck、黃金或 wf-lint，也未改它們的輸出。

## 沒做到或證據不足的

兩項退回工作無缺項。5-seed probe 只證明指定條件達標，主要是撤退勝負，不能推論全面平衡；C 對獸 20%、B 對摹機 0%、D 舊偵察能力最終 probe 零使用、新版 MCP 團戰落敗，均保留。提高命中造成樣本勝率下降的原因未做引擎診斷；參照機結果與領導引用值的差異原因亦未證實。

## 需要決定的事

本輪無阻塞。傷害/AP 4.5 與重用鐵拳 14 的帶外理由已明列，請領導隨驗收評估；C HP 豁免依退回單由領導寫 manifest，本線未碰該檔。

world/models 與第三刃 lore mechSeries 仍待另批接線；飛魚沿用釜山血統，不宣稱第三刃自開研發線。lineage/tide-fin 的 holder／source／naming 與第三刃／處容 lore 不一致，保留上輪待決項，本批不改。後續如需解釋參照差異或低團戰勝率，應另派 AI／平衡工作，不在本輪擴大範圍。

## 子代理

0 個；本輪由 cx-pilot-mech 親自閱讀、改檔、試驗、MCP 與回報，無子代理模型與品質評估。

## 以後交接書該點名的工具

可沿用本輪 Python subprocess stdio driver 範例 `/tmp/cx-pilot-mech/stdio-round2.py`，完整記錄 request／response 並關閉自己的 server。其餘無。

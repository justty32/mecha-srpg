## 已讀清單

以下由 cx-pilot-mech 親自閱讀；相對路徑以本線隔離 worktree 為根。JSON 表以 tabledb 分段讀完。

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

另讀既有三台 `thirdblade-*` frame、其 mx-* 配件、範本能力與效果、三台採用的 bodyplan，以及 sweep、MCP CLI／環境載入程式。開場 SESSION-LOG 計數 0、WAIT_USER 計數 3；inbox/new 無信。

## 做了什麼

**BLOCKED（第二次派出）：10 件內容已備妥；三台、新能力與參照 probe 完成，MCP serve 被沙箱拒絕監聽 socket，尚未完成全部六條驗收。**

接續前次 9 件飛魚系列，本次只新增 1 個展示情境。既有 9 件未改數值；未修改或刪除受版控既有檔、未 commit、未安裝依賴。工作目錄為指定隔離 worktree wt-pilot-mech-01。

| id（檔名＝name 段＋.json） | 級 | 定位 |
|---|---|---|
| frame/cx3-flyingfish-d | D | 偵察 |
| frame/cx3-flyingfish-ii | C | 潮行近戰 |
| frame/cx3-flyingfish-iv | B | 指揮 |
| component/cx3-skimming-fin | D 用 | 掠潮鰭吼 |
| component/cx3-crest-blade | C／B 用 | 破浪鰭刃 |
| ability/cx3-skimming-fin | D 用 | 掠潮飛鰭 |
| ability/cx3-crest-cut | C／B 用 | 破浪收鰭 |
| ability/cx3-call-the-tide | B 用 | 同潮齊刃 |
| effect/cx3-following-tide | B 用 | 命中增益 |
| scenario/cx3-flyingfish-shoal | 混編 | 三機對三鐮肢展示 |

共 10 檔、7712 bytes，最大單檔 1290 bytes；未觸發 20 件／16 KB／1 MB gate。飛魚與劍魚不同名；D 代號 FF-3，C／B 為飛魚-II型／飛魚-IV型。三台同為 lineage-tide-fin、faction-third-blade、series-flyingfish，均含 mech／human 與完整 defaultLoadout，使用既有 mx-* bodyplan。

## 產出

數值帶逐項：

D：HP＝210（帶內）；部位＝6、層＝12（帶內）；initiative／perception／evasion＝5／6／0（帶內）；heat max／regen＝100／−15（帶內）；武器＝1 把非凡兵、mass＝2（帶內）；9 AP 可主攻 4 次，產燼＝20（帶內，≤60）。

C：HP＝285（帶外，低於 300–420；重用與劍魚-III 相同 mx-hover-c，保留輕型潮行輪廓；本批不新增 bodyplan）。部位＝6、層＝12（帶內）；initiative／perception／evasion＝7／5／0（帶內）；heat max／regen＝100／−15（帶內）；武器＝2 把非凡兵、mass＝5（帶內）；躍潮＋兩次鳴刃產燼＝35（帶內，≤60）。probe 表現未劣於同條件劍魚-III，因此未為補足 HP 建議下限換掉血統骨架。

B：HP＝445、部位＝6、層＝12（帶內）；initiative／perception／evasion＝7／7／0（帶內）；heat max／regen＝100／−18、charge max／regen＝80／12（帶內）；武器＝2 把非凡兵＋1 系統、mass＝7（帶內）。霜鰭使實際 heat regen＝−26（帶外，既有部件 −8 修正，基礎池帶內）；兩次破浪產燼＝40（帶內，≤60）。

掠潮鰭吼：hp／size／mass＝12／1／2（D 帶內）；無矢池，使用燼池。掠潮飛鰭：AP＝2、傷害＝8、傷害/AP＝4、射程＝1–4、accuracy／armorPen／crit＝0／0／0（D 帶內）；產燼＝5（帶內）；基本攻擊無 cooldown（符合規程）。

破浪鰭刃：hp／size／mass＝16／2／3（C、B 帶內）。破浪收鰭：AP＝4、傷害＝20、傷害/AP＝5、accuracy＝5、armorPen＝0.15、crit＝0（C、B 帶內）；射程＝1–1（C 帶內；B 沿用 C 武器，短於 B 近戰 1–2 建議）；產燼＝20（帶內）；基本攻擊無 cooldown（符合規程）。

同潮齊刃：AP＝3、charge 成本＝20、產燼＝10、cooldown＝3（B 帶內）；射程＝0–4（友方增益功能性例外，0 格允許自身；非傷害招），friendly＝only。同潮：accuracy＝+8、ownerTurns＝2（B 帶內），scope＝mech、badge＝同潮。

重用能力的 probe 超帶：D 的 mx-rift-trace 射程＝9（帶外，既有無傷偵察招，沿用以支撐偵察定位）；C 的 mx-singing-riposte AP＝0（反應技例外）、mx-tide-leap-up AP＝2（低於 C 基本攻擊帶，但為保命增益）、射程＝0（自身增益例外）。不修改既有能力。本次新增能力在 probe 檢查的指標均無超帶。

展示情境：rounds＝30（帶內）；player／enemy＝3／3 台、2 slots（混級小隊展示）；沿用 map/skirmish-20，兩側部署 x＝2／17（間隔 15，符合 ≥10）。玩家三位既有駕駛不重複，三台直接採 defaultLoadout；敵方三隻既有 reaper-c；玩家 eliminate lose 排在 win 前。地圖尺寸＝20×20（小型展示例外，低於 C／B 一般戰場建議）。借機給候鳥號試刃的 brief 對應既有 faction/migrant-crew，沒有新增 faction。

Probe 本次原始輸出：
- /tmp/cx-pilot-mech/probe-reference.txt
- /tmp/cx-pilot-mech/probe-new.txt

先跑參照，再跑三台與三個新能力；指令皆為 `npm run content:probe -- <id…> --n 5 --json -`。兩次 exit 0，預設 seed 1–5、每組 20 輪、noRetreat=false。以下每組皆 5 場；數字依序為勝／敗／平，平均輪數、例外：

| 主角 | 基準對手 | 勝／敗／平 | 平均輪數 | 例外 |
|---|---|---|---|---|
| 劍魚-III | bulwark-ii | 0／5／0 | 4.6 | 0 |
| 劍魚-III | reaper-c | 0／5／0 | 4.8 | 0 |
| 飛魚 D | bulwark-i | 0／5／0 | 4.0 | 0 |
| 飛魚 D | mite-d | 3／2／0 | 5.2 | 0 |
| 飛魚 C | bulwark-ii | 1／4／0 | 4.6 | 0 |
| 飛魚 C | reaper-c | 1／4／0 | 4.4 | 0 |
| 飛魚 B | bulwark-iv-rampart | 0／5／0 | 4.0 | 0 |
| 飛魚 B | siegebeetle-b | 4／1／0 | 4.6 | 0 |

所有組別平手率＝0%，結算原因皆 eliminate:repelled（每組 5 次）。飛魚對同級摹機勝率 D／C／B＝0%／20%／0%，對基準怪獸＝60%／20%／80%；參照劍魚-III 兩組皆 0%。不能把撤退結算直接當作殲滅能力或通用平衡結論。C 對獸 20% 仍偏低，D／B 對摹機全敗亦記為風險；但這是 1v1，而工作流怪獸團戰基準並非 1v1，且 C 已優於參照，沒有只為抬勝率加傷害。MCP 團戰證據尚缺，未宣稱平衡完全通過。

新能力 AI 使用（只計主角、兩個對手分開）：
- 掠潮飛鰭：D 對摹機 21 次、對怪獸 42 次，合計 63。
- 破浪收鰭：C 10／8 次，B 6／8 次，合計 32。
- 同潮齊刃：B 5／10 次，合計 15。

單獨 probe 三個 ability id 自動選載體 D／C／B，兩組數字分別與對應 frame 完全一致；focus ability 使用＝21／42、10／8、5／10。這些是同 seed 重複探測，沒有加進上述合計冒充額外獨立樣本。三台每個 seed 皆跑成、全部新能力有 AI 使用，依更新交接書煙霧通過。C 的既有反應技未觸發；D 對 mite 僅用主攻，偵察招在對摹機時有 19 次使用。未更動數值旋鈕。

本次 scenario 寫完立即跑 `npm run check`：exit 0，末行原文 `OK 0 errors, 12 warnings`，完整輸出 /tmp/cx-pilot-mech/check-scenario.txt；12 warnings 指向既有內容。前次 9 檔逐檔 check 的歷史紀錄保留在 /tmp/cx-pilot-mech/check-cx3-*.txt，本次以含全部 10 檔的 check 為最新證據。

MCP：0 場。2026-10-24 本次實際執行：

```sh
node src/mcp/cli.ts serve --socket /tmp/cx-pilot-mech/s.sock
```

exit 1，原始輸出：

```text
socket /tmp/cx-pilot-mech/s.sock 失敗：listen EPERM: operation not permitted /tmp/cx-pilot-mech/s.sock；socket 路徑過長？請改用短的相對路徑（25 字元，建議 < 100）。
```

路徑僅 25 字元，工具列出的「路徑過長？」是通用提示；實際錯誤為 listen EPERM。沒有成功啟動 server，該行程已退出，無常駐 pid 要 kill。沒有呼叫 ui_screenshot 或 GUI，沒有改走其他 socket／stdio 繞過限制。

固定六條驗收狀態：
1. 通過：本次 git status --short 除原有 node_modules 外，只有上述 10 個允許目錄的 cx3-*.json 新檔。
2. 部分：本次 check 零錯；lore check 尚未執行，因下一步 MCP 遭權限拒絕後依規程停工。
3. 通過：D／C／B 各一，defaultLoadout、共同 lineage／series tags 齊備。
4. 通過：三台各 --n 5 與劍魚-III 同條件數字已列出。
5. 未通過：[playtest.json](playtest.json) 仍是 wf-table/1 空表，無完成場次與 outcome log；未捏造紀錄。
6. 通過：第一段逐行列出交接書「先讀」所有路徑，均由本線親讀。

未加跑固定清單之外的測試。

## 沒做到或證據不足的

三場 MCP（每台至少一場、至少一場手打）、其原始 outcome log 與 playtest 量測尚未完成；lore check 尚未執行。展示情境只有靜態 check 證據，未經 MCP 實戰驗證。沒有從 probe 推導或捏造我方／敵方損失與手動體感。

第一次的逗號雙包 sweep 阻塞已由更新交接書的 content:probe 路徑解除，本次沒有再使用錯誤指令。此次是新的沙箱 socket 權限阻塞，與前次文件錯誤分開記錄。

## 需要決定的事

解除條件：由上游提供允許 Unix socket listen 的執行環境，讓指定 MCP serve 成功啟動，再接續三場實玩與 lore check；或明確修訂交接書，提供獲准的替代 MCP 連線方式。本線不能請求提升權限（目前 approval policy＝never），也未修改設定繞過限制。解除前本批保持 BLOCKED，不可視為可合併。

world/models 的前代、成本、登場時期與第三刃 lore mechSeries 仍須領導另批補；本批不寫這些路徑。飛魚沿用釜山血統延伸，不宣稱第三刃自開研發線。

既有 lineage/tide-fin 的 holder＝faction/salt-gull-hunters、source＝frame/ancient-rearguard、naming＝salt-gull-hunters，與第三刃／處容 lore 與 silhouette 不一致；本批依指定保留 lineage-tide-fin tag，不修改血統。

## 子代理

0 個；未開子代理，規矩閱讀、內容與測試皆由本線親自完成，無子代理模型與品質評估。

## 以後交接書該點名的工具

指定 MCP socket 工具已點名；還應註明執行環境須允許 Unix socket listen，以及遭 EPERM 時由哪條線解除。check 現行末行為 `OK 0 errors, N warnings`，宜明定接受既有 warnings。其餘無。

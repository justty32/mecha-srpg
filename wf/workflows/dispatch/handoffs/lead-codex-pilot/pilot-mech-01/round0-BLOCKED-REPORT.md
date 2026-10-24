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

**BLOCKED：9 件內容已新增且逐檔 check 零錯誤；指定 sweep 無法載入雙包，未取得對戰證據。**

本線 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/codex-pilot/wt-pilot-mech-01`。新增飛魚系列；D 為代號 FF-3，C／B 為飛魚-II型／飛魚-IV型。三台皆有完整 defaultLoadout、同血統與同系列 tags。9 檔，共 6422 bytes，最大單檔 1288 bytes；未修改或刪除既有檔、未 commit。

| id（檔名即 name 段＋.json） | 等級 | 定位 |
|---|---|---|
| frame/cx3-flyingfish-d | D | 偵察，短射程鰭吼＋既有標記 |
| frame/cx3-flyingfish-ii | C | 潮行近戰，破浪鰭刃＋鳴刃＋躍潮 |
| frame/cx3-flyingfish-iv | B | 指揮，友方同潮＋中距連吼＋鰭刃 |
| component/cx3-skimming-fin | D 用 | 掠潮鰭吼 |
| component/cx3-crest-blade | C／B 用 | 破浪鰭刃 |
| ability/cx3-skimming-fin | D 用 | 掠潮飛鰭 |
| ability/cx3-crest-cut | C／B 用 | 破浪收鰭 |
| ability/cx3-call-the-tide | B 用 | 同潮齊刃 |
| effect/cx3-following-tide | B 用 | 同潮命中增益 |

## 產出

D：HP＝210、部位＝6、層＝12、initiative／perception／evasion＝5／6／0、heat max／regen＝100／−15，均帶內。配裝 1 把非凡兵武器，mass＝2；每回合最多 4 次主攻產燼＝20，低於 60。

C：HP＝285（帶外，低於 300–420；固定重用既有 mx-hover-c 潮行骨架，保留血統輪廓與輕型突擊取向，禁止新增 bodyplan，因此接受脆弱代價；平衡待測）。部位＝6、層＝12、initiative／perception／evasion＝7／5／0、heat max／regen＝100／−15，均帶內。2 把非凡兵武器、mass＝5；9 AP 內躍潮＋兩次鳴刃產燼＝35，低於 60。

B：HP＝445、部位＝6、層＝12、initiative／perception／evasion＝7／7／0、heat max／regen＝100／−18、charge max／regen＝80／12，均帶內。2 武器＋1 系統、mass＝7。霜鰭使實際 heat regen＝−26（超出基礎池 −15～−20 帶，來自既有部件的 −8 修正，基礎池仍帶內）。9 AP 內兩次破浪收鰭產燼＝40，低於 60。

掠潮鰭吼：hp／size／mass＝12／1／2（D 帶內）；以 heat 運作，不設矢池。掠潮飛鰭：AP＝2、傷害＝8、傷害/AP＝4、射程＝1–4、accuracy／armorPen／crit＝0／0／0（D 帶內），產燼＝5（帶內），基本攻擊無 cooldown。

破浪鰭刃：hp／size／mass＝16／2／3（C、B 帶內）。破浪收鰭：AP＝4、傷害＝20、傷害/AP＝5、射程＝1–1、accuracy＝5、armorPen＝0.15、crit＝0（C、B 帶內；B 延用 C 近戰的短射程，沒有升至 2 格），產燼＝20（帶內），基本攻擊無 cooldown。

同潮齊刃：AP＝3、charge 成本＝20、產燼＝10、cooldown＝3、射程＝0–4、friendly＝only。成本與冷卻均在 B 帶內；0 格為友方增益可對自身施放的功能需求，非攻擊射程。同潮：accuracy＝+8、ownerTurns＝2（B 帶內），scope＝mech，badge＝同潮。

逐檔 `npm run check` 均 exit 0，末行皆 `OK 0 errors, 12 warnings`。12 warnings 均指向既有內容，未隨新增檔增加。完整輸出在 `/tmp/cx-pilot-mech/check-cx3-*.txt`；其中 ability 與 component 同名時後者覆寫同名暫存 log，但兩次實際執行皆零錯。最終內容 check 證據：`/tmp/cx-pilot-mech/check-cx3-flyingfish-iv.txt`。

自動煙霧 scratch：`/tmp/cx-pilot-mech/pack/`。情境 `smoke:scenario/cx3-flyingfish-smoke` 放三台新機與三隻 reaper-c，三位駕駛不重複。照規程執行：

```sh
node wf/workflows/dispatch/handoffs/lead-playtest/sweep.ts --content content/base,/tmp/cx-pilot-mech/pack --seeds 1,2,3,4,5 smoke:scenario/cx3-flyingfish-smoke
```

在任何 seed 開始前，工具拋出：

```text
Error: ENOENT: no such file or directory, scandir 'content/base,/tmp/cx-pilot-mech/pack'
missing pack.json
```

原始 stderr／堆疊：`/tmp/cx-pilot-mech/sweep.txt`。程式第 9 行把 `--content` 字串直接放進 `loadContentDirs([content])`，未切開逗號；與 acceptance-playtest 第二節指定的雙包指令不符。依交接書「工具或環境出錯 → 停下發 BLOCKED」停止，不改 sweep 或引擎。

Probe 三台／新能力／劍魚-III 參照數字：**未執行，無數字**。MCP 場次：**0，未啟動 socket server，無 pid 要清理**。[playtest.json](playtest.json) 為 wf-table/1 空表，明確表示沒有完成場次，未建立冒充 outcome 的 log。

固定六項驗收狀態（沒有新增驗收項）：

1. 路徑／件數：`git status --short` 僅 9 個允許的 `?? content/base/{frames,components,abilities,effects}/cx3-*.json` 與原有 `?? node_modules`；9 ≤20。
2. 內容 check 零錯；lore check 因已阻塞未執行，故本條未完整通過。實際末行含 warnings 後綴，如上原樣記錄。
3. 三台 D／C／B、defaultLoadout、lineage-tide-fin、series-flyingfish 皆已寫入。
4. Probe 未執行，本條未通過。
5. MCP 0 場，本條未通過。
6. 本報告開頭逐行列出交接書「先讀」全部路徑。

## 沒做到或證據不足的

煙霧沒有跑成，能力 AI 使用次數未知，無法判定平衡；probe、參照組、三場 MCP 與 lore check 尚未執行。沒有把內容 check 當成對戰證據，也沒有將本批標為可合併。

本線自製腳本一開始把末行比較寫成完全等於 `OK 0 errors`，因現行工具多出 warnings 後綴而停；已修正為核對 exit 0 與零錯前綴後續寫。這是臨時腳本問題，與後來真正的 sweep 工具阻塞分開記錄。探索時誤用一次不匹配 glob、一次猜錯效果檔路徑，未造成內容變更。

## 需要決定的事

解除阻塞：由可寫工具的線修正 sweep 的多包載入（例如逗號切分），或由上游提供已驗證、獲准使用的等效執行方法，再重新跑煙霧、probe 與 MCP。本線依交接保持現狀，沒有自行繞過指定工具或改既有程式。

靜態閱讀另見 MCP CLI 的 serve 固定使用預設 content/base，沒有 scratch packs 參數；恢復工作時亦需上游提供 scratch pack 的載入方式。此項只屬閱讀發現，未冒稱經 MCP 實測失敗。

待領導另批補 world/models 前代／成本／登場時期與 lore 第三刃 mechSeries，本批禁止新增／修改該路徑。新系列定位為釜山血統延伸，並非第三刃自行開研發線。

既有 `lineage/tide-fin` 的 holder＝faction/salt-gull-hunters、source＝frame/ancient-rearguard、naming＝salt-gull-hunters，與第三刃／處容 lore 及 silhouette 不一致；本批依指定使用 lineage-tide-fin tag，沒有修改血統。

## 子代理

0 個；未開子代理，內容、閱讀與檢查由本線親自完成。無子代理模型或品質評估。

## 以後交接書該點名的工具

應點名「支援多 content pack 的 sweep 呼叫」及「可載入 scratch pack 的 MCP serve 啟動方式」，提供已驗證指令。現行 check 末行格式為 `OK 0 errors, N warnings`，驗收文字宜明定是否接受既有 warnings。

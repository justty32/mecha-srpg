## 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/scale.md`
- `wf/workflows/dispatch/handoffs/lead-world-land/guide.md`

AGENTS.md 親自讀取主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘上述路徑親自讀取 worktree 版本，guide.md 各節均已讀。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、world-pillars 的 world／bio-battle 入口與 battle 子頁，以及 inbox README／PROTOCOL。

## 做了什麼

cx-wl-09 完成九檔逐一核對；改六個情境檔的七個文字欄（六個 brief、一個 name），其餘三檔保留。依 guide 的 brief 修敵種、守點輪數，依 glove／solo 修白手套敘述。沒有改數值、引用、鍵、陣列或檔名，沒有 commit。

固定五條驗收結果：

1. `git status --short` 僅六個允許的情境檔及原有 `?? node_modules`；未新增 worktree 檔案。六檔均未增加超過 30%。
2. 本次 `npm run check` 末行 `OK 0 errors, 8 warnings`；`node content/lore/check.ts` 末行 `errors=0 warnings=2`。必用的 `node src/ops/content/check.ts content/base` 末行也為 `OK 0 errors, 8 warnings`。原始輸出在 `/tmp/cx-wl-09/check.log`、`lore-check.log`、`ops-check.log`。警告皆指向未修改的檔案：怪獸捕獲層 HP、數值帶、tidewolf 資源帶、infantry 無配裝，以及兩件 lore 事件未列年表；未宣稱零警告。
3. 已執行交接書指定的全 content `git grep -nE '十分|複本|獨駕|白手套|租|大潮'`，全量暫存 `/tmp/cx-wl-09/residuals.txt`，逐檔核對本批九檔。九檔沒有「十分律」「十分之一」「十分之一也是火」「複本」「獨駕」「每個大潮」；本批殘留只有下段列出的「白手套」。其他批的命中未改動。
4. 下段逐檔列出每處舊新片段，三檔無需改者列理由。
5. 第一段列出交接書「先讀」全部十一條路徑。

未加跑 npm test、MCP、試玩或其他驗收；使用 tabledb 查過新詞對照，每步依交接書輪詢 orders，未收到追加指示。

## 逐檔對照

### content/base/scenarios/siege-beetle-convoy.json

「攻城甲蟲與槍翼獸卻堵住長路」 → 「群喉與吐棘者卻堵住長路」。

敵方現為六隻 choir-a 與六隻 spitter-c；顯示名依 species／monster 為群喉、吐棘者。護送兩機不變。

### content/base/scenarios/shell-excavation-escort.json

「蟲群追上背影」 → 「菌柱堵在撤離路上」。

第三方為十二隻 stalk-c（菌柱），部署在撤離路上；護送三人及任一人倒下即失敗不變。

### content/base/scenarios/mirror-choir-vigil.json

「鏡肢與聖詠群喉」 → 「鏡肢與群喉」。

「守住鐘旁陣地四輪」 → 「守住鐘旁陣地十輪」。

敵方為 mirror-b 與五隻 choir-a；群喉依現名，守點依 objectives 的 hold.params.rounds=10，三台玩家機體不變。

### content/base/scenarios/crater-three-way.json

無需改。獵團、白手套、沐蝕會三方與現有 slots 一致；文字沒有指定過期機種、數量或輪數，擊潰其餘兩方與 eliminate 目標一致。白手套只是在與人類作戰。

### content/base/scenarios/lunar-blockade-run.json

無需改。敵方是銀環-G2 與銀環-G5「弦月」，玩家領頭 player-0 是長槍-V4；衝出口或擊潰敵方符合 reachExit／eliminate 目標。白手套點名攔截獵團，沒有宣稱殺獸或機魂獨駕。

### content/base/scenarios/quarry-duel.json

「掘星庭・雙魂索債」 → 「掘星庭・月塵索債」。

「兩方機魂隔著月塵相望」 → 「駕駛員隔著月塵望向無人鐵偶」。

「斬倒領頭的白手套燕鷗」 → 「斬倒領頭的白手套鐵偶」。

玩家編成只有人類駕駛員，沒有機魂；白手套按 guide 改讀無人鐵偶，仍以敵方領頭單位 enemy-0 為斬首目標。

### content/base/scenarios/rift-edge-nest.json

「獵團與白手套暫且並肩迎戰」 → 「獵團與白手套僱來的援軍暫且並肩迎戰」。

依 guide 的「對獸靠僱來的獵團」，把並肩對獸者寫成白手套僱來的援軍；斬殺巢母或存活三十輪保持原樣。

### content/base/scenarios/skirmish-whitegloves.json

「沉默的機魂將欠帳寫成戰書」 → 「沉默的無人鐵偶將欠帳寫成戰書」。

「擊潰攔路衍型機」 → 「擊潰攔路鐵偶」。

按 guide 的無魂、無人鐵偶改寫；攔路索債與擊潰敵方的目標不變。

### content/base/world/encounters/tide-unshacklers.json

無需改。現有 units 是贖垢者-三型、長槍-V1 各一台；本檔完全沒有 name／brief／summary 等可改文字欄，沒有過期編成敘述可修。交接書禁止新增鍵，因此未新增簡介，亦未改編成。

## 殘留

本批九檔命中共七行、八處「白手套」，逐處理由如下；沒有其他指定搜尋詞殘留。

`crater-three-way.json:4`「獵團、白手套與沐蝕會」：只點名三方，人類間交戰，guide glove 允許。

`lunar-blockade-run.json:4`「成了白手套的獵物」：攔截人類獵團，沒有對獸能力主張。

`quarry-duel.json:4`「白手套的索債隊」：索債對象是人；同一行「白手套鐵偶」：明確按新定義描述鐵偶。兩處都符合 glove。

`rift-edge-nest.json:4`「白手套僱來的援軍」：對獸的是受僱援軍，符合 guide 指定改法。

`shell-excavation-escort.json:4`「白手套封住去路」：攔人不殺獸，guide 允許只點名。

`skirmish-whitegloves.json:3`「白手套的索債戰書」：名稱只述索債；`:4`「白手套攔住獵團」：簡報已明寫無人鐵偶、對象為人。

## 沒做到或證據不足的

沒有未完成的本批文字修正。tide-unshacklers 沒有文字欄，無法在不增鍵的前提下補編成簡介。三項檢查均有本次輸出；它們不能證明下述結構問題已修好，本批未作此宣稱。

## 需要決定的事

六個白手套情境仍把相關單位配置成 frame 加 soul 座位，沒有 pilot：shell-excavation-escort、crater-three-way、lunar-blockade-run、quarry-duel、rift-edge-nest、skirmish-whitegloves。依 guide solo／glove，這些配置需要後續結構線決定：白手套應改為無魂無人鐵偶；保留為真正機甲的單位則須有人類駕駛。本批不能改 persons、seat、mech 或引用。

rift-edge-nest 的 ally-1 至 ally-5、skirmish-whitegloves 的 enemy-0 至 enemy-3 都重複配置 person/glove，與「手套是唯一的一個人」衝突；rift-edge-nest 盟軍現仍屬白手套 faction 並可對獸，需由結構線落實受僱援軍的實際配置。本批依 guide 寫成「僱來的援軍」，未新增人物或設定傳聞。

quarry-duel 與 skirmish-whitegloves 的無人鐵偶敘述，仍對應既有 frame/moji-tern（衍型機・燕鷗）引用；lunar-blockade-run 的銀環編成亦有相同類別落差。文字依新裁示處理，實際類別不能在本批修正。以上屬交接書明訂應列報的範圍外結構問題，並非要求擴增本批驗收。

## 子代理

未使用；額外代理成本為零。九檔由本線親自讀取、修改與核對，沒有代理產物待覆核。

## 以後交接書該點名的工具

無。

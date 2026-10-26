# 已讀清單

以下為本人親自閱讀的檔案；wf-table/1 資料以欄位、切片與條件查詢閱讀。相對路徑以隔離 worktree 為根。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/battle-field.md`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/playtest.md`
- `wf/workflows/planning/design-notes/mechs.md`
- `src/mcp/README.md`
- `wf/WORKFLOWS.md`
- `wf/SESSION-LOG.md`
- `wf/WAIT_USER.md`
- `wf/workflows/common/data-files.md`
- `wf/workflows/common/conventions.md`
- `wf/workflows/common/code-map.md`
- `wf/workflows/dev-env.md`
- `wf/workflows/testing.md`
- `wf/workflows/inbox/PROTOCOL.md`
- `src/mcp/e2e.test.ts`
- `wf/workflows/content/ancient-people.md`
- `wf/workflows/content/bio-monsters.md`
- `wf/workflows/content/ops-content.md`
- `wf/workflows/content/world-pillars/bio-battle/battle.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `wf/workflows/content/world-pillars/bio-battle.md`
- `wf/workflows/content/world-pillars/mechs/ancient.md`
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/mechs/mechanical.md`
- `wf/workflows/content/world-pillars/world/factions-and-sandbox.md`
- `wf/workflows/content/world-pillars/world/monsters.md`
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`
- `wf/workflows/content/tools/stats.ts`
- `content/lore/factions/quito.json`
- `content/lore/factions/nairobi.json`
- `content/lore/factions/salt-gull.json`
- `content/lore/factions/league.json`
- `content/lore/factions/dhaka-weavers.json`
- `content/lore/factions/migrant-crew.json`

## 做了什麼

狀態：**DONE（第 2 輪指定修正已完成，交由領導續行 content_accept）**。已新增 7 台機械 frame 與 2 個人對人展示情境，全部重用既有機械部件、能力及 bodyplan；新部件／能力／效果 0 檔。未改既有檔，未 commit。

先列目錄並搜尋候選名，確認「燕鷗攻堅型」已有 `frame/moji-tern-guard`，因此跳過，依優先序製作其餘七台。查同級範本後發現多數已經有 defaultLoadout，沿用目前資料而非工作流中的舊快照。

上一輪 Node driver 的 spawn／spawnSync 遭 EPERM。本輪依使用者指定改由 shell 直接啟動 stdio MCP：兩場管線 battle_auto，以及一場 FIFO 常駐、逐步讀 legal_actions 後手選 battle_act／battle_act_many 的完整手打。三場皆已結算，MCP 已 battle_close 並關閉 FIFO 寫端，server 隨 EOF 結束。

本輪只修改新增情境 `content/base/scenarios/nairobi-joint-cordon.json` 的玩家第 4 台編成：`frame/hound-mk2` 改為既有 `frame/union-fr7`，移除該單位獵犬專用配裝覆寫以使用 FR-7 預設配裝。駕駛、其他七台、單位數、部署、目標與 30 輪上限均保持。沒有修改七台新 frame，也沒有新增部件、能力或效果。其餘交付只更新本 REPORT、playtest.json 與三份 MCP 原始紀錄；暫存都在 /tmp/cx-lc-mech。

## 產出

所有 frame id 下列均省略 `frame/`；血統均省略 `lineage-`。配裝的完整 slot 對應在各新 frame。

| id | 等級 | 勢力 | 血統 | 定位 |
|---|---|---|---|---|
| quito-vulture-ii | C | quito | jinghai | 山口機動射手 |
| quito-andes-wall | B | quito | kuafu | 重裝守線 |
| quito-thunderbird | A | quito | jinghai | 光幕精銳 |
| nairobi-crook-iii | C | nairobi | kuafu | 拘束支援 |
| nairobi-shepherd | B | nairobi | kuafu | 軛騎指揮 |
| saltgull-tidegull-longspear | B | saltgull | xingtian | 兩棲隊長 |
| league-plough | D | league | kuafu | 工程清障 |

基多的禿鷲與雷鳥暫借靜海血統：lore 明示基多光幕技術與塞勒涅型錄線交會；安地斯壁暫借夸父／堅盾公刻體系，保留厚軀幹和臂部。奈洛比暫借同盟殘聯的夸父機械底架，未聲稱恩凱就是夸父。鹽鷗依工作流的長槍慣例借刑天 tag。這些是本批禁止新增血統下的相近映射，不是追加正史。已讀 jinghai、xingtian、universal-bulwark、universal-longspear、old-array、tide-fin 的 traits.silhouette；不存在 kuafu.json，不捏造它。

牧杖的獸部件接口只寫在聯防情境 brief 與本報告：本批以機械件封接，不提供獸甲／獸爪，不宣稱已驗證嫁接。FrameDef 沒有描述欄，未加不支援欄位。隊長機牧者與潮鷗均有 captain，重用 friendly:only 的老城不倒掩護能力。

命名見 [naming.json](naming.json)，共 9 列；英文先定意涵，再沿用 lore 中文名或為新情境意譯，不寫入 aka。既有「潮鷗」是海潮鳥名，依交接書保留。

數值帶逐項（HP 為骨架／裝甲附加後；初動／感知／閃避是 baseAttrs；燼與流光先列 frame 基值，再說明配裝修正）：

**禿鷲-II（C）**：總層 HP＝370／400（帶內）；部位＝6、原生層＝12（帶內）；初動／感知／閃避＝7／6／0（帶內）；燼 max／regen＝100／-15（帶內）；流光 max／regen＝70／12（帶內）；裝備質量＝6（帶內）。

**安地斯壁（B）**：總層 HP＝525／555（帶內）；部位＝6、原生層＝12（帶內）；初動／感知／閃避＝5／5／-5（帶內）；燼 max／regen＝110／-18（帶內）；流光 max／regen＝80／14（帶內）；裝備質量＝9（帶內）。 配裝後燼 regen＝-26（帶外，既有排燼片的 -8 修正）；流光 max＝80。

**雷鳥（A）**：總層 HP＝600／630（帶內）；部位＝6、原生層＝12（帶內）；初動／感知／閃避＝9／8／8（帶內）；燼 max／regen＝110／-20（帶內）；流光 max／regen＝110／20（帶內）；裝備質量＝12（帶內）。 配裝後燼 regen＝-28（帶外，既有排燼片的 -8 修正）；流光 max＝150。

**牧杖-III型（C）**：總層 HP＝370／400（帶內）；部位＝6、原生層＝12（帶內）；初動／感知／閃避＝6／6／0（帶內）；燼 max／regen＝100／-15（帶內）；流光 max／regen＝60／10（帶內）；裝備質量＝7（帶內）。

**牧者（B）**：總層 HP＝445／475（帶內）；部位＝6、原生層＝12（帶內）；初動／感知／閃避＝7／7／2（帶內）；燼 max／regen＝110／-18（帶內）；流光 max／regen＝80／15（帶內）；裝備質量＝7（帶內）。 配裝後燼 regen＝-26（帶外，既有排燼片的 -8 修正）；流光 max＝80。

**潮鷗-長槍（B）**：總層 HP＝445／475（帶內）；部位＝6、原生層＝12（帶內）；初動／感知／閃避＝8／7／5（帶內）；燼 max／regen＝100／-18（帶內）；流光 max／regen＝80／14（帶內）；裝備質量＝8（帶內）。 配裝後燼 regen＝-26（帶外，既有排燼片的 -8 修正）；流光 max＝80。

**犁（D）**：總層 HP＝245／245（帶內）；部位＝5、原生層＝10（帶內）；初動／感知／閃避＝4／4／-2（帶內）；燼 max／regen＝100／-15（帶內）；流光 max／regen＝30／6（帶內）；裝備質量＝6（帶內）。 犁保留清障鋸並加一把既有紋刻連吼，兩個手持件、總質量 6；工程工具兼近戰是 D 級單武器建議的例外。

燼均為 soft／inverted，兩段閾值從 max、1.25×max 開始；流光均 hard。重用能力與裝備的超帶值由 [probe-summary.json](probe-summary.json) 完整列出，以下是理由而非忽略旗標：

C 級紋刻一吼射程＝6（帶外，既有通用連吼，參照堅盾也用）；拘束矢傷害＝4（帶外，主要產出是拘束效果，15 次／5 場實際使用）。盾陣自身射程＝0（帶外，self 增益不適用攻擊射程帶）。B 級散紋傷害＝16、蛇擊＝14（帶外，前者近距副武器、後者附控制）；潮鷗的頭砲 AP＝2、傷害＝8（帶外，既有副武器），回身鳴刃 AP＝0、傷害＝12（帶外，反應技例外）。

雷鳥的獵甲追矢射程＝9（帶外，既有有限矢池；未改其 min 或 uses）。極光光幕 AP＝2、射程＝0（增益例外）；光矢連吼 AP＝3、傷害＝22、穿甲＝0，鳴刃斬 AP＝3、傷害＝20、穿甲＝0，回身鳴刃 AP＝0、傷害＝12、穿甲＝0（皆帶外，重用較低階兵器作常備／自衛，反應技 AP 例外；不創造免費 A 級高傷常備招）。

犁的鐵拳傷害＝14，熔齒切割 AP＝4、傷害＝18、穿甲＝0.12，紋刻一吼射程＝6、傷害＝20（帶外，工程鋸與通用現貨武器；FR-7 同樣配紋刻連吼）。新增 frame 骨架 HP、屬性與資源基值沒有靠壓低級帶來平衡。沒有新能力須另跑能力 probe。

Probe：命令使用 `npm run content:probe -- <新 frame 與參照> --n 5 --json -`，seed 1–5、rounds 20、保留預設意圖撤退。每台兩種對手，各 5 場，總計最終 130 場；另犁初版 10 場留在 /tmp，以下只列最終配裝。數字依序為勝／敗／平、平均輪數；每組例外＝0。完整結算原因、主角能力使用次數與超帶欄位見 [probe-summary.json](probe-summary.json)。

新機 `league-plough`：frame/bulwark-i ×1：5/0/0、8.40 輪；monster/mite-d ×1：5/0/0、7.60 輪。

同級參照 `union-fr7`：frame/bulwark-i ×1：5/0/0、8.00 輪；monster/mite-d ×1：5/0/0、11.00 輪。

新機 `quito-vulture-ii`：frame/bulwark-ii ×1：5/0/0、8.00 輪；monster/reaper-c ×1：5/0/0、8.00 輪。

新機 `nairobi-crook-iii`：frame/bulwark-ii ×1：5/0/0、8.00 輪；monster/reaper-c ×1：5/0/0、8.00 輪。

同級參照 `bulwark-ii`：frame/bulwark-ii ×1：5/0/0、8.20 輪；monster/reaper-c ×1：5/0/0、8.00 輪。

同級參照 `longspear-v4`：frame/bulwark-ii ×1：5/0/0、6.80 輪；monster/reaper-c ×1：5/0/0、7.60 輪。

新機 `quito-andes-wall`：frame/bulwark-iv-rampart ×1：0/5/0、8.20 輪；monster/siegebeetle-b ×1：5/0/0、8.20 輪。

新機 `nairobi-shepherd`：frame/bulwark-iv-rampart ×1：0/5/0、8.00 輪；monster/siegebeetle-b ×1：5/0/0、8.20 輪。

新機 `saltgull-tidegull-longspear`：frame/bulwark-iv-rampart ×1：0/5/0、8.00 輪；monster/siegebeetle-b ×1：5/0/0、8.00 輪。

同級參照 `bulwark-iv-rampart`：frame/bulwark-iv-rampart ×1：3/2/0、8.20 輪；monster/siegebeetle-b ×1：5/0/0、8.60 輪。

同級參照 `selene-crescent-g5`：frame/bulwark-iv-rampart ×1：0/5/0、8.00 輪；monster/siegebeetle-b ×1：5/0/0、8.00 輪。

新機 `quito-thunderbird`：frame/selene-aurora ×1：4/1/0、8.00 輪；monster/cliffjaw-red-eye ×1：5/0/0、8.20 輪。

同級參照 `selene-aurora`：frame/selene-aurora ×1：3/2/0、8.00 輪；monster/cliffjaw-red-eye ×1：5/0/0、8.20 輪。

勝率／平手率可由上列每組除以 5；新機最終平手率全部 0%。C、D 對人 100% 同向參照；B 對人 0% 同向弦月，城垣則 60%；A 雷鳥 80% 對照極光 60%。對獸新機與同級參照全部 100%。主要原因為第八輪附近意圖撤退，不能當成殲滅能力證明。犁初版對人 20%、對獸 80% 且有一場 timeout；確認缺遠程接敵手段後只加現有連吼，重跑成兩組 100%、0 平手，沒有削弱機體。

AI 使用：禿鷲蛇擊 92 次、連吼 20；安地斯壁盾陣 32、散紋 66；雷鳥光幕 29、追矢 20、光矢 66；牧杖拘束矢 30、連吼 60；牧者友方掩護 5、蛇擊 84；潮鷗友方掩護 10、鳴刃 88；犁工程鋸 24、連吼 43。反應鳴刃等既有招未必觸發，不聲稱每個既有能力全覆蓋。

展示情境為 `scenario/quito-pass-inspection`（3 對 3、基多三機）及 `scenario/nairobi-joint-cordon`（4 對 4、其餘四機）。均用既有 skirmish-20、30 輪、左右部署 x＝2／17，最近相距 15 格；玩家全是既有機與既有 human 駕駛，敵方用新機預設配裝。同場人物無重複；玩家全滅 lose 先宣告，另有斬首與擊退目標。基多／奈洛比沒有 base faction，展示敵方借殘聯 slot，brief 不新增真實外交戰事。

第 2 輪情境 probe：每次只改玩家第 4 台機型與該機預設配裝，命令均為 `npm run content:probe -- scenario/nairobi-joint-cordon --n 5`（seed 1–5）。原獵犬配置為領導驗收回報的 0 勝／5 敗。第一次換長槍-V4：5 勝／0 敗／0 平、平均 8.40 輪、例外 0，100% 超出門檻，因此不採用。第二次換 FR-7：**4 勝／1 敗／0 平、勝率 80%、平均 10.60 輪、例外 0**，落在 30–90% 門檻內；結算原因合計 eliminate:repelled 4 場、killTarget 1 場。兩次原始輸出分別暫存 `/tmp/cx-lc-mech/probe-r2-1.txt`、`probe-r2-2.txt`。這是情境編成調整，沒有改新機數值。五 seed 的既有能力中拘束矢 15 次、友方掩護 7 次、工程鋸 8 次；沒有新能力要驗證。

MCP 場次已補 **3 場**，詳見 [playtest.json](playtest.json)。本表 losses 統一計「離開作戰的單位」，包含撤退，不等同擊毀；三場我方擊毀／撤退均 0，敵方都是撤退。newAbilityUses＝0、aiUsed＝false 表示本批無新增能力，不表示敵方 AI 沒有使用既有能力。

`scenario/quito-pass-inspection`／seed 1／mcp-auto：10 輪，player 勝，eliminate:repelled；我方離場 0、敵方離場 3（全為敵方撤退、擊毀 0）；新能力 0／AI 新能力使用不適用。原始紀錄：[場次](mcp-log/r2-quito-auto-seed1.txt)。

`scenario/nairobi-joint-cordon`／seed 2／mcp-auto：10 輪，player 勝，eliminate:repelled；我方離場 0、敵方離場 4（全為敵方撤退、擊毀 0）；新能力 0／AI 新能力使用不適用。原始紀錄：[場次](mcp-log/r2-nairobi-auto-seed2.txt)。

`scenario/nairobi-joint-cordon`／seed 3／mcp-manual：8 輪，player 勝，eliminate:repelled；我方離場 0、敵方離場 4（全為敵方撤退、擊毀 0）；新能力 0／AI 新能力使用不適用。原始紀錄：[場次](mcp-log/r2-nairobi-manual-seed3.txt)。

手打全程由本人依觀察決定玩家動作，沒有用 battle_step_ai 代打玩家。前段以 FR-7／堅盾的紋刻一吼集火牧者、弦月遠射後改蛇擊，後段因矢池耗盡改鐵拳與防禦。第 3 輪城垣的第二次複刻槍擊因資源不足被拒，批次停止；重新查 legal_actions 後改盾陣繼續，全程原始回應保留。初輪星痕貫射預估傷害 38／潮鷗配裝總 HP 475＝8.0%，命中率 28%；這是未計部位減傷的預估，不能當實際傷害。手打最終我方四台 HP 約 99%／82%／100%／100%，敵方四台撤退；勝因為擊退，不是斬首。初始化舊紀錄保留但不列入三場。

## 沒做到或證據不足的

固定七條驗收狀態（本輪只處理使用者退回的 playtest／scenario probe，沒有加跑其他驗證）：

1. 上輪 9 個新內容檔；使用者提供的領導閘門結果為 0 違規。本輪內容變更只在上述新增 Nairobi 情境內。
2. 上輪 check／typecheck 已綠；使用者提供沙箱外 npm test **811/811 全綠**。沙箱內 `src/mcp/cli.test.ts`／`src/mcp/e2e.test.ts` 因 socket／spawn EPERM 失敗是已知環境限制，不算本輪阻塞。本輪未重跑 check／typecheck／npm test／黃金檔檢查，未將上輪結果冒充本輪新證據。
3. 七台 frame、配裝與 tags 沿用上輪，本輪未改。
4. 每台新機與同級參照的 --n 5 數字保留上文；新增 Nairobi 最終情境 4 勝／1 敗、0 平、0 例外的五 seed 證據。
5. 已補 3 列 MCP 場次，含 1 場完整手打；每列對應的原始 log 含情境請求及非空 outcome。
6. naming.json 與九個新內容顯示名沿用上輪；本輪沒有調整命名／文案。領導另寄來的命名意見列入下段，依使用者本輪限縮範圍未執行。
7. 第一段「已讀清單」完整保留。

已解除上一輪 MCP 證據阻塞。尚未由本線宣稱 content_accept 整鏈 ACCEPT；本輪不重跑驗收鏈，請領導以最終情境與三場紀錄續行驗收。五 seed 80% 是小樣本情境 probe，三場 MCP 均勝不代替該統計。

## 需要決定的事

本輪收到 lead-content 的 16:10 命名審查來信：要求將基多情境「山口扣船令」改為「山口查扣令」並同步 naming.json。使用者本輪明定只修 playtest、Nairobi probe 與 REPORT，因此未改這兩個額外檔；請領導另行處理此命名意見。

新機進市場／營運遭遇與研發時間線由上游另線處理，本批未寫 models、encounters 或 lineages。維拉科查、恩凱、埃吉爾的專屬血統尚未落地；需決定未來是否替換暫借 tag。既有 lore 把安地斯壁稱為堅盾祖先，與公刻年代有先後矛盾，未擅改。

既有部件造成的超帶值、舊顯示名與能力閒置留給平衡／改名線：例如白瓷裝甲熱抗 0.3 高於裝甲建議 0.25、獵甲追矢射程 9 的限制條件，以及犁工程鋸作第二手持件。未修改這些既有檔來湊驗收。人類遭遇難度仍應由平衡線決定，本批沒有以削弱新機處理。

## 子代理

0 個；本線本人執行閱讀、內容、probe 與報告。沒有子代理模型或品質評估。

## 以後交接書該點名的工具

shell stdio／FIFO 備援：Node 裡再 spawn node 遭 EPERM 時，可用 shell 直接啟動 server；保持 FIFO 寫端開啟，手動送 JSON-RPC，保存完整 requests／responses，結束時關閉寫端讓 server 收 EOF。本輪已實證可行，不需修改 src 或安裝依賴。

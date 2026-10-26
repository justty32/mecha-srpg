已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/world.md`
- `wf/workflows/content/world-pillars/mechs.md`
- `wf/workflows/content/mechs.md`
- `wf/workflows/content/numeric-bands.md`
- `wf/workflows/content/numeric-bands.json`
- `wf/workflows/content/engine-facts.json`
- `wf/workflows/content/templates.json`
- `wf/workflows/content/abilities-effects.md`
- `wf/workflows/content/ability-forms.json`
- `wf/workflows/content/acceptance-playtest.md`
- `wf/workflows/content/playtest-baselines.json`
- `wf/workflows/content/playtest.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `content/lore/style.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/mechs.md`
- `wf/workflows/planning/design-notes/mechs/mechanical.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/world/drive.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `src/mcp/README.md`
- `wf/workflows/dispatch/handoffs/lead-mech2/plan/PLAN.md`
- `wf/workflows/dispatch/handoffs/lead-mech2/m2-common.md`
- `wf/workflows/dispatch/handoffs/lead-mech2/cx-m2-03.md`

以上由 cx-m2-03 親自讀取；AGENTS.md 讀的是主 repo 指定絕對路徑，JSON 表以指定 tabledb 分段讀。另讀相關骨架、比照 frame、勢力 lore、lineage、工具與 inbox 協議。主代理一條、子代理零；未取得 token／金額計量，不虛報成本。

## 做了什麼

完成 mech2-03：7 台有人衍型機、1 件可能事件。數值與池量直接沿用 PLAN 指定比照機，沒有平衡調整；以下名稱皆為提案名。

- NR-03 比長槍-V1 少副槍，輪座砲塔同時承擔光矢槍與標記靈目，打塔能同時斷兩職。
- IS-02 比長槍-V1 公會型改用曲射自衛與一排短牽滯；繫泊鉗掛前軸，不會捕獸或拖走單位。
- 定盤-C 比燕鷗改為四足探路；射擊與束矢分掛前足，標記靈目仍在頭部，背架只給短增益。
- 鐵砧-II型・吊鉚比鐵砧-II型改用吊臂熔鋸與配重橫索；打配重連排燼片一起拆，另有盾陣、煙幕穩住切割口。
- 贖垢者-IV型・行香比贖垢者三型捨棄內建解拘招，兩前足各掛範圍火器，兩後足分擔排燼與冷泉。
- 長晝-隼翼比穿雲-長槍捨棄內建超遠擲擊；遠射在左翼、近衛槍與追矢在右翼，尾翼掛流光槽與排燼片。
- 留燈-合印比老城-堅盾換成近衛槍、蛇鞭與扶架，反覆友方排燼配一次遠護；支援價值需要鄰機，單挑測不到排燼價值。
- 「七印分途」把各家的缺工位、授權與試作掛回既有勢力。代表日期 2108-04，occurs=possible、rumor，不寫入 timeline；沒有創建新人物、地點或勢力。

移動依 m2-common：兩輪座與吊架帶 track，長晝帶 flight，四足、六足及要塞使用預設 leg。長槍系 tags 沿 longspear-v4 的 universal／series-longspear 寫法，勢力標記沿既有北美機；未發明 lineage-universal-longspear 或替長槍新增古代來源。其他機的 lineage 標記沿所屬勢力既有機。Models 的 lineage 仍照 PLAN 既有資料 id。

## 產出

內容位於本隔離 worktree：
- `content/base/frames/na-sled-03.json`
- `content/base/frames/innersea-brace-02.json`
- `content/base/frames/shellsoc-tripod-c.json`
- `content/base/frames/anvil-hoist-ii.json`
- `content/base/frames/tidefaith-censer-iv.json`
- `content/base/frames/na-meridian.json`
- `content/base/frames/innersea-lantern.json`
- `content/lore/events/seven-seals-diverge.json`

附帶產物全在本 REPORT 同目錄：models/ 7 份（month=3、role=variant、maker restricted、tier／cost 沿規格、requires 僅既有比照 model），naming.json 8 列、review-rows.json 8 列、playtest.json 2 列、mcp-log/、checks/、probe-waivers.json。World models 沒有寫入 content。

固定五條驗收，沒有加跑 npm test、typecheck、lint 或其他驗收：

1. PASS：每個新內容檔後均跑 npm run check；修正兩台長槍系 tags 後逐檔重跑。最後 checks/final-check.txt 末行 `OK 0 errors, 10 warnings`；checks/final-lore.txt 末行 `errors=0 warnings=8`。Warning 指既有內容；新增可能事件未進 timeline 的警告符合交接要求。
2. PASS：7 個 frame 均存在、defaultLoadout 非空，槽型及大小由 check 驗過；locomotion tags 如上。models/ 同名 7 份。
3. PASS：content 新檔 8 個；naming、review 各 8 列；白話最長 26 字，均 ≤60。
4. PASS：playtest.json 2 場，涵蓋 7 台新機。workshop-floor（seed 3）手動場第 8 輪玩家勝；last-lamp（seed 4）AI 觀戰第 9 輪玩家勝；皆 eliminate、detail=repelled。手動場我方原始四機無損失，確認 enemy-0 被俘、enemy-3 被擊毀，另兩敵失聯後不補猜狀態；AI 場我方無損失，敵方一毀兩撤。
5. PASS：本 REPORT 存在，開頭已讀清單逐行列出指定 30 個相對路徑。

MCP 實作：為容納 scratch 情境，將此 worktree 的 src/、schemas/、content/base/ 與 package.json 原樣複製到 `/tmp/cx-m2-03/mcp-snapshot/`，只在該 scratch 快照加兩件試玩情境，再以 `node src/mcp/server.ts` 啟動 stdio；server 與引擎未改。Python subprocess 逐行發 JSON-RPC，至少一場透過 legal_actions→act 選動作。兩情境 JSON 放在場次 txt 開頭；其 rawParts 指定的檔按序串接即完整原始請求／回應。原始輸出分片每檔 ≤10 KB，沒有遺漏長輸出。

指定 probe 已跑：原命令七個 frame id，加 --json 指向 scratch，預設每對手 20 seeds，共 280 次單挑，例外 0、平手 0。完整文字見 checks/probe-01.txt 與 probe-02.txt；完整 JSON 留 `/tmp/cx-m2-03/probe.json`。各機依序為「同級基準機勝率／基準怪獸勝率；平均輪數」：
- frame/na-sled-03：5%／90%；8.10／8.65 輪。
- frame/innersea-brace-02：100%／100%；8.00／11.00 輪。
- frame/shellsoc-tripod-c：65%／65%；8.00／8.00 輪。
- frame/anvil-hoist-ii：20%／0%；8.10／8.15 輪。
- frame/tidefaith-censer-iv：0%／100%；8.15／8.50 輪。
- frame/na-meridian：70%／100%；8.00／8.15 輪。
- frame/innersea-lantern：0%／100%；7.70／8.05 輪。

## 沒做到或證據不足

數值尚未平衡，探針勝率不作通過平衡的證據。長晝的共用骨架總層 HP 為 520，低於 A 級建議 560；其他超帶主要來自既有掛件的射程、AP、傷害與穿甲。照交接要求保留原值，沒有修改共用件或骨架。

留燈的排燼扶架在單挑與本場 AI 編隊都沒有使用；本場能確認一次遠護、冷泉與近衛火力被 AI 使用，不能把它寫成已驗證友方排燼循環。手動場共用牽滯招使用七次。MCP 兩場只是功能與手感紀錄，混編、近距部署，不宣稱是嚴格平衡對照。

沒有跑七台比照 frame 的額外 probe，也沒有額外戰役測試，依固定驗收收工。Node 子行程 driver 在本環境未拿到回覆，改 Python stdio driver 後兩場完成；臨時腳本的缺 schema 與欄位讀法錯誤均已修正，未當成環境 BLOCKED。

## 需要決定的事

無使用者阻塞。依已定「最後統一調」留待領導整批處理勝率旗標與長晝 HP。probe-waivers.json 為 7 列 wf-table/1（6 個 winrate、1 個 band），請領導把 rows 帶入 manifest.probe.waivers；本線禁止改 content/batches，因此沒有宣稱已更新 manifest 或整批獲准入庫。

既有長槍來源、學會不造機與教團禁仿的矛盾沿 PLAN／m2-common 的讀法保留，不改既有檔。新內容用語取蝕衣；既有 lore／lineage 仍用潮衣，既有 id 保留 tide-robe，統一顯示詞交上游處理。

### 以後交接書該點名的工具

建議明列 Python subprocess 的 stdio client，以及 server.ts 無 --content／--packs 參數時可用的 scratch 快照流程，讓試玩新機不必在 worktree 新增情境。原始 RPC 輸出很長，若容量 gate 也含報告產物，可明列允許按序分片保存完整輸出。其餘無。

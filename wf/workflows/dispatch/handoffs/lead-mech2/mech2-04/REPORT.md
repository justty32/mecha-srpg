# 已讀清單

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
- `wf/workflows/dispatch/handoffs/lead-mech2/cx-m2-04.md`

## 做了什麼

cx-m2-04 終局為 **DONE**：完成 7 個 frame、1 件 lore、7 個 model；check 與 lore check 均 0 錯，MCP 以指定 stdio 入口完成 2 場，涵蓋全數 7 台新機。沒有修改既有檔，沒有 commit、刪檔或上網；沒有子代理，token／金額無可用計量，不虛報。

以下為資料與配裝差異；MCP 兩場均以原白手套情境為底，scratch setup 換我方新機：

- 針魚-II型：沿飛魚-II型數值，雙刃改標記、曲射及鳴鰭；同旗之約帶出護船側的引路工位。
- 拓影-B：沿測墟-B數值，改六足、掘進、前足分武器，後足分冷泉與霜鰭，背掛煙幕；不帶排燼扶架。相較雙足測墟，失足同時會失去該足掛件。
- 棧橋-IV型：沿安地斯壁數值，改舟首鋸、舟尾鉗，兩側排燼與冷泉；不再靠光幕守牆，也沒有拖機、修復或回收結算功能。
- 封門-鐵砧：沿浮屠數值，近戰改三層遠射與內建伏架瞄準；伏架以 rooted 為代價，主砲貼身不能開。少數斷後試作仍須同伴接應。
- 渡厄-贖垢者：沿連星-劍魚數值，以解拘禱焰、熔齒鋸與香爐取代雙斬爆發；教義與私造的矛盾保留，不給教團無限 A 級產能。
- 歸燈-燕鷗：沿歸航-鐵劍數值，改分翼與尾架支援，兩翼槍與左翼煙幕、左尾扶架有各自弱點；一次友方遠護配反覆排燼，沒有載機功能。
- 衡梁-I型：沿玉圭-I型數值，六足分掛；自身守備改一次友方遠護和排燼接力，後足是支援弱點。按 m2-common 移入本批。
- 留燈試機：2108-05 的可能事件，傳聞各家護撤方案仍待核心與駕駛員；只引用既有勢力，沒有新增人物、地名或 timeline 條目。

## 產出

內容均在本 worktree 的 `content/base/frames/<id>.json`；七個 id 為 thirdblade-needlefish-ii、shellsoc-archive-b、quito-quay-iv、anvil-gatewarden、tidefaith-pilgrim、league-last-ferry、cn-yoke-i。lore 為 `content/lore/events/lamplit-return-trials.json`。

本目錄 `models/` 有同名 7 檔，沒有寫進 content/base/world。全數 month 4、restricted、generic false；衡梁與歸燈為 captain，其餘 variant，cost／tier 沿既定級距，requires 只引用存在的比照機 model。命名與白話分見 naming.json、review-rows.json，各 8 列；所有名稱標「提案名」。playtest.json 有 2 場；mcp-log/game1.txt 與 game2.txt 各含 scratch 情境、outcome、能力次數及原始 RPC 分段索引。所有分段依序串接可還原完整 call 輸出。

固定五條驗收（沒有另跑 npm test／typecheck／wf-lint 或新增驗收條）：

1. **PASS**：8 次逐檔 npm run check 全數 exit 0，末行 `OK 0 errors, 10 warnings`；末次見 lamplit-return-trials-check.txt。lore-check.txt 末行 `errors=0 warnings=8`，本次事件不寫 timeline 的警告為任務指定作法。
2. **PASS**：7 個 frame 都存在、defaultLoadout 非空、槽 id／型別／容量符合骨架；locomotion 為針魚 hover、拓影 burrow、棧橋 hover、歸燈 flight，封門／渡厄／衡梁不帶 locomotion tag（leg）。models 同數 7。
3. **PASS**：naming.json 與 review-rows.json 各 8 列，等於 content 新檔數；白話每列 ≤60 字。
4. **PASS**：2／2 場。game1 以 legal_actions→battle_act，首步由代理選合法移動、其餘由 driver 依合法清單選動作，含針魚／拓影／棧橋／衡梁；game2 以 battle_step_ai 觀戰，含封門／渡厄／歸燈及保留的刑天。seed 1／2 都在第 10 輪我方勝（eliminate，敵方撤退），雙方損毀 0。
5. **PASS**：本 REPORT 存在，開頭「已讀清單」逐行列交接書全部 30 個路徑。

固定五條全數通過，做完即停。

指定 probe 已跑（預設 n=20，14 組、共 280 場，全部例外 0）；原始輸出按檔案容量分段保存在本目錄 probe-*.txt，依編號串接即完整輸出。勝率依序為「同級基準機／基準獸」：針魚 20%／15%、拓影 0%／100%、棧橋 0%／10%、封門 100%／100%、渡厄 85%／100%、歸燈 15%／90%、衡梁 0%／100%。

## 沒做到或證據不足

兩場均取得完整 outcome，但對手是原情境的無核心鐵偶，不能據此宣稱對同級人駕機或怪獸的勝率。第二場 AI 的封門貫矛 3 次、渡厄禱焰 1 次、歸燈遠護 1 次；排燼扶架與伏架瞄準在這兩場沒有使用，沒有把未用過的招式填成成功。伏架與繫泊鉗在 probe 中已有 AI 使用，友方排燼仍須領導後續編隊評估，不加跑第三場。

起初 Node child_process driver 無回覆時已寄 BLOCKED；補存最小請求時 Python 可從相同 `node src/mcp/server.ts` 取得回覆，確認原判斷過早，隨即寄 PROGRESS 繼續。Python 驅動已完成兩場並正常關閉 server，沒有改 src 或用替代入口。首場紀錄程式一度讀錯 brief 的 status 欄，已改從 full 讀取後重跑同 seed，報告採本次完整原始輸出。暫存、腳本、初始存檔均在 /tmp/cx-m2-04/。
probe 的帶外值沿指定骨架、比照機數值與既有武器：針魚 HP285、歸燈 HP520 低於對應帶；標記與自身增益的 AP／射程也被通用傷害帶標示，封門既有主砲傷害36、貫矛38及射程9／12高於 A 建議帶。指定比照數值未調整。

針魚對獸的凡鐵曲射、渡厄對同級機的鋸，以及兩台支援機單挑的借我一息有 0 使用旗標；後者無其他友方可選，仍需隊伍試玩驗證。比照機亦以預設 n=20、相同基準對手跑過，原始輸出見 probe-reference-*.txt；新機與參照勝率列在下方。數值與既有能力旗標均留給領導全批統調／記 waivers，未擅改 manifest 或既有內容。

同條件參照（前者對基準機，後者對基準獸；新機 → 指定參照）：

- 針魚-II型：20.0／15.0% → 95.0／95.0%。
- 拓影-B：0.0／100.0% → 0.0／100.0%。
- 棧橋-IV型：0.0／10.0% → 0.0／100.0%。
- 封門-鐵砧：100.0／100.0% → 100.0／100.0%。
- 渡厄-贖垢者：85.0／100.0% → 100.0／100.0%。
- 歸燈-燕鷗：15.0／90.0% → 100.0／100.0%。
- 衡梁-I型：0.0／100.0% → 0.0／100.0%。

## 需要決定的事

領導收線時處理 probe 的沿用數值例外與 waivers，並統一數值；本線不調平衡。第三刃 maker 沿 salt-gull-hunters 的既有代理債未改。兩場 MCP 沒有排燼扶架使用，後續編隊實測可特別看友方積燼時是否需要扶架，不作本批額外驗收。
### 以後交接書該點名的工具

MCP stdio 驅動可點名 Python subprocess.Popen；本次同一 server 經 Python 正常使用，不能只憑 Node driver 無回覆就判定 server 故障。也應點名 battle_save／battle_load 的 scratch setup 方法，讓新機能在不改 scenarios 的情況下進場。

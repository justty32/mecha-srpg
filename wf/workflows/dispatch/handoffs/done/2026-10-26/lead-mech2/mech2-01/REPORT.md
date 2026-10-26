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
- `wf/workflows/dispatch/handoffs/lead-mech2/cx-m2-01.md`

以上逐一親自讀取；JSON 表透過指定 tabledb 分段讀。AGENTS.md 另親自讀主 repo 絕對路徑版本。另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、common/data-files、conventions、code-map、dev-env、inbox README／PROTOCOL、既有參照內容及 MCP stdio 實作。交接書的範圍、m2-common 修正及固定五條驗收優先於通用工作流；未改 SESSION-LOG／ROSTER 等禁寫路徑。

## 做了什麼

cx-m2-01／mech2-01 完成 17 個內容新檔：2 frame、6 bodyplan、2 component、3 ability、3 effect、1 lore 事件；2 個 model 僅在本報告目錄。子代理 0，無外部服務呼叫；token／金額沒有可取得的計量，不虛報成本。

BW-06（Bulwark Caisson 06）接 2093-02 堅盾公刻，讓守門班能換輪修機。沿 bulwark-i 的屬性與燼池，改用輪座與 track；胸甲、砲塔及輪軸分開，散紋吼砲配盾陣，沒有參照機的凡鐵連吼與內建拳。全 AI 試玩實際使用散紋轟吼及盾陣，近距範圍火力受砲塔掛件限制。

鐵砧-II型・架鐵（Anvil Trestle II）接 2104 鐵砧-II型下線與鐵砧受雇破口工作。沿 anvil-ii 的屬性與燼池，改為四足、不帶 locomotion tag（預設 leg）；樁與刃各掛一隻前足，排燼在左後足。相較參照機的樁／凡鐵機槍重配裝，兩種近戰能分開被打斷，全 AI 試玩實際使用斷臂一樁與鳴刃斬擊。

六種骨架的總層 HP 為輪座 300、四足 370、六足 525、吊架 370、舟架 445、分翼 520，分別保持 PLAN 參照骨架原總量。每部位末層 structural、torso 唯一 core，座艙 seats／conduct 沿參照；工具與系統移到指定部位，槽型未擴充。四足／多足的額外部位數是計畫指定，沒有藉此增加 HP。

排燼扶架／借我一息／緩燼提供友方排燼與短暫閃避；range 1–3 排除自身。繫泊鉗／攔路橫索／牽滯只做短直線減益。伏架瞄準／伏架增加 accuracy 10、降低 evasion 5，rooted 限制本回合移動，供後三批指定機型內建。新名全部在 naming.json 標為提案名。lore「共用修造冊外形補編」使用世界內 id、2108-02、occurs:possible、rumor，不進 timeline。

## 產出

逐檔路徑與白話見 [review-rows.json](review-rows.json)（17 列），命名見 [naming.json](naming.json)（17 列）。兩個 world model：

- [BW-06 model](models/bulwark-caisson-01.json)：D／5、generic／open、variant、month 1、requires model/bulwark-i。
- [架鐵 model](models/anvil-trestle-ii.json)：C／15、faction/anvil-hunters／restricted、variant、month 1、requires model/anvil-ii。

[check.txt](check.txt) 保存最後一檔寫完後的完整 check 輸出；[probe.txt](probe.txt) 保存本次指定兩台 probe 原始輸出。每寫完一檔即執行 npm run check，共 17 次，末行均為 `OK 0 errors, 10 warnings`。警告引用既有怪獸 partsOverride；content loader 另列既有效果／能力等警告，新檔未被點名。

MCP 兩場見 [playtest.json](playtest.json) 與 [第一場原始紀錄索引](mcp-log/scene-01.txt)、[第二場原始紀錄索引](mcp-log/scene-02.txt)。每份索引以 scratch 情境 JSON 開頭，含 outcome，rawTranscript 依序拼接即是完整未改的請求／回應；分片均小於 8 KB。兩台新機皆在兩場出現，沿用 defaultLoadout。第一場另加既有 IX-II 配兩件新工具，這不改任何 content frame。

第一場 seed 1 為 mcp-manual（driver 逐次 legal_actions→act），86 次玩家指令，20 輪 timeout、雙方死亡 0；借我一息與攔路橫索各 10 次，皆由手動路徑使用。第二場 seed 2 為 mcp-spectate，8 輪玩家勝，eliminate／repelled，我方死亡 0、敵方 2 隻機體損毀及 2 隻撤離；散紋轟吼 8、斷臂一樁 4、鳴刃斬擊 6、盾陣 2 次。新共用招在第二場未裝配，aiUsed 欄因此兩列都記 false，不把既有武器的 AI 使用冒充新招覆蓋。

固定五條驗收（僅此五條）：

1. PASS：17 次 npm run check 末行均含 `OK 0 errors`；本次 `node content/lore/check.ts` 為 `errors=0 warnings=3`。新事件未進 timeline 的警告符合 possible 事件設計；另兩則警告為既有事件。
2. PASS：兩台 frame 存在、defaultLoadout 非空、槽型與大小相符；BW-06 有 track、架鐵不帶 locomotion tag；models 同數 2 件。
3. PASS：naming.json 與 review-rows.json 都是 wf-table/1，先建空表再由指定 tabledb add，均 17 列，等於內容新檔數；白話最長 27 字（≤60）。
4. PASS：playtest.json 2 場，兩台新機皆涵蓋，MCP stdio 原始紀錄存在且包含 outcome。
5. PASS：本 REPORT 存在，開頭逐行列出交接書點名的已讀清單。

內容新檔最多 7247 bytes，報告目錄任一檔最多 8506 bytes，均未觸發 12 KB；17 件未觸發 18 件 gate。worktree 既有未追蹤 node_modules 為開場已有的依賴連結；本線未新增雜檔。未 commit，未跑 npm test 或其他追加驗收。

## 沒做到或證據不足

Probe 使用工具預設每對手 20 場。BW-06 對堅盾-I 勝／敗／平 40／60／0%，平均 8.20 輪；對蝕蟲 65／0／35%，平均 12.60 輪。架鐵對堅盾-II 100／0／0%，平均 7.80 輪；對鐮肢 95／5／0%，平均 8.35 輪。四組例外皆 0。

BW-06 配裝後 HP 330 超 D 帶 300，來自指定輪座參照 300 加既有白瓷鎧甲 30；盾陣的 self 射程 0、散紋轟吼傷害 16／穿甲 0.1 也被標超帶。架鐵被標樁 AP5、傷害44、穿甲0.3 與反應技 AP0；這些均是 PLAN 指定的既有件。架鐵內建拳與反應技沒有 probe 主動出手。依「不做平衡」保留數值，沒有修改任何參照內容或 manifest。

第一場手動 driver 偏重工具使用，未形成兩台新機的有效輸出循環，timeout 不當作平衡結論；第二場提供兩台預設配裝的實戰使用證據。伏架招尚無本批指定使用機型，新工具也未證實 AI 會主動使用；後批可沿指定掛點觀察，不在本線追加試玩。六種共用骨架中本批只實戰使用輪座與四足，其餘供後批接用。

## 需要決定的事

請領導在可寫的 manifest 記錄 probe waivers：BW-06 的 band（指定骨架＋既有裝甲／武器／self 招）、架鐵的 band（既有樁與反應技）、架鐵 winRate>90% 與主動未使用的內建拳／反應技；理由均為本輪依指定配裝暫填、平衡留全批收線後統調。是否採納提案名與平衡數值交領導及上游；本線無須使用者額外授權。

## 以後交接書該點名的工具

Node child_process.spawn／spawnSync 在本沙箱下不能正常啟動子程序（spawnSync 回 EPERM，spawn 子程序零輸出即退出）。已改採工作流列明的 mkfifo，由 shell 起 `node src/mcp/server.ts` stdio，完成兩場；未改 sandbox 或任何設定。之後可直接點名 mkfifo。MCP battle_new 無自訂配裝參數時，可用既有 battle_load 載入 /tmp 的 scratch setup，保持內容包 hash 與初始戰鬥 hash 驗證，再以 legal_actions／act 或 step_ai 試玩；本線紀錄包含完整 setup，未改 src 或情境內容。收工已結束自己的 server。

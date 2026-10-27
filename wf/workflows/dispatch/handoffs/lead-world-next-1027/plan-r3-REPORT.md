# 第三輪戰鬥概念規劃 REPORT

已完成機甲 3、怪獸 3，共 6 個採用概念、0 個 reject，精確配套 6＋12＝18 個新內容檔。機甲先落檔供領導審，再補怪獸；本線只交規劃，未創作正文或劇本。計畫見 [round3-plan.json](round3-plan.json)。

已讀清單記在表內 `readRules`（規矩全文及 SHA-256）、`tableQueries`（定向讀取範圍）與每列 `fullTextRead`（範本、骨架、能力、配件、最近候選的全文路徑／SHA-256／關鍵事實）。已親讀 AGENTS、工作流派發、使用者偏好、team-model、dispatch 與 content-batch；內容入口、batch、世界支柱及適用 mechs／bio-battle 子檔、世界基調與怪獸條目、mechs、bio-monsters、abilities-effects、numeric-bands、polish、lore/style。模板、數值帶與能力形態透過 tabledb 定向查列，未整份 dump。

查重先從主樹全體機械 frame 與 species 的實際配裝、能力組與骨架縮小候選，涵蓋 wl-*；再親讀每列最近全文。補用 232 列指紋表定向定位來源，沒有把含 ID 的指紋不相等當作功能差異。每列至少兩個具體候選，尤其針扇另比跨族的礁背，旋沫另比 wl-gravel-mane，垂帆另比 wl-slant-veil。差異落在目標形態、接戰距離、資源競爭、傷害空窗及可破部位，沒有以改名或換地點作理由。

有限核對已完成：表為 wf-table/1；六列與十八條目標路徑不重複且全為 wn-r3- 前綴。機甲固定槽型／size 及 mass 逐件核對，總 mass 為 9、8、12；核心與 pilot 座由既有骨架提供，護艙隔板是附加防護。怪獸三套同級四檔範本均有實際 core、合法捕捉 functions、restraint／cockpit 槽與 pilot 座，所有末層 structural，無肉層 regen；活體本能池與屍改空池已分清。實作引用均可取自 HEAD `f24420b079a59a7f8e93123930665aaa824f9d00`；wl-* 只查重。四足-C 的部位數已依領導指正更正為 7。資料與報告合計遠低於 1 MB。

規劃中的能力取捨不能由文案補回：留潮的索會造成傷害，鳴刃只在敵人離開相鄰時反應；同燈每次只照應一個友方目標且煙護降低命中；旋沫的甩尾只加屬性，不移動也不造成傷害；垂帆的拖行只扣閃避與先手，不推拉、不禁移動。怪獸全部 D／C，不寫二名；捕捉敘述須按每列破壞部位，不寫馴化。

未做整合、平衡、AI 實際出招或自動捕捉驗收；沒有跑 node／npm／test／typecheck／build／sim／probe／戰鬥 MCP，也未改主內容、規則、索引、manifest、SESSION、CLAIMS 或 staged。沒有需要使用者補定的新機制；需領導審採用概念，再交 sol 依表創作。後續在家進行整合與平衡驗收，不能將本報告視為內容已驗收。

本線兩檔 `git diff --check` 為 0；因兩檔目前未追蹤，另以 `git diff --no-index --check /dev/null <file>` 檢查實際全文，兩檔均無空白錯誤輸出；該模式因新檔存在差異回傳 1，不記成 0。

收件補讀更正：岔鰭原分水追咬也是3AP/CD2；旋沫相對岔鰭的差異是unit穿刺18換cone酸10，不能稱新增冷卻空窗。計畫與逐列審核已同步，與沫顎／礫鬃比較時移除單體填空的差異仍成立。

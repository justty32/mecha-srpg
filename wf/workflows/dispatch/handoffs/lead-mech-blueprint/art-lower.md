# 任務：依工作單與試接風格完成機甲背包右臂雙腿32份SVG

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/data-files.md`，親自讀，再讀 `wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md`、`CONTRACT.md`；tabledb讀parts.json與本目錄lower-write-set.json。親看參考 `/tmp/codex-clipboard-8Uo05b.png`、試接 `/tmp/mech-blueprint-trial-12.png`、配置 `/tmp/mech-blueprint-layout.png`。

## 背景與唯一目標

G1已先由程式生成64張工作單，再由astra畫首12件試接並親看。現在你接手其中32份獨立源SVG，與主美術互斥分工，補齊同一台機甲；不是第二風格。每件依唯一工作單，而非整圖切片或同多邊形換色。

## 範圍（排除法寫死）

只寫lower-write-set.json列出的32份明確SVG路徑：backpack4、右臂10、左右腿各9；其中左腿thigh-frame/knee-bearing/shin-shell已完成，寫權現移交你，可保留或修正。主美術已承諾不再寫這32份。每件read generated/work-orders.json的blueprint-1約束再畫。自己的REPORT僅寫本目錄art-lower-report.md。

不做：其餘32份SVG、attachments.json（主美術唯一持有）、任何核心/展示程式與data/overlaps、generated/evidence、舊美術、其他wf/SESSION/CLAIMS、src/spec/依賴/lockfile/他線未追蹤檔。件數 gate：最多33檔（32SVG+REPORT）；容量 gate：最多2MB，任一超過停下回報。領導已核總件數<150、容量<15MB。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `view_image` | 親看參考、配置與試接PNG |
| 原生agent工具 | 與領導及主美術回報 |
| `node` | 讀工作單、有限SVG實際輪廓驗證 |
| `git status --short` | 核對明確寫集 |

## 資源與禁區

可寫程式碼線，gpt-6-astra美術，原生agent啟動/回傳。子代理上限0；本隊同時執行最多3人。禁止GUI、桌面鍵鼠、headful、下載、安裝、刪檔、repo外修改、commit/push、全域設定、分支/reset/rebase。不跑npm/全套/未排程headless或重負載；領導排重渲染，不能自行拿桌面鎖。

## 工作

1. 讀32件用途及work-order envelope/keepOut/socket/viewBox，局部pivot不能自動置中。每attachment單獨SVG，根g id=工作單element；最多根g+一surface，純defs引用ID唯一。
2. 延續主美術palette：ink #24303d、dark #283542、steel #61717e、mid #91a1ae、white #e4e9e8、light #fbfdf6、shadow #a8b6c1、edge #64788c、blue #177bbb、cyan #84e6d2、gold #b89343。左上光、外輪廓stroke1.5–2、軸環0.6–1，細線用實心窄polygon。每件主面+陰面/厚邊+用途細節，藍翼是收長折刃，白甲包暗架而保留軸端間隙。
3. 只用polygon/circle/ellipse/rect/絕對M L Z path，禁止transform/style/clip/mask/filter/use/曲線；根g round cap/join。包絡+2容差、keepOut不侵入，軸孔用分片真透明區，不能塗背景色假洞。必要空間不足回報core，不自己改配置或加例外。
4. 沿首12來源用parseSvgGeometry與validateAttachmentGeometry作輕量單件檢查（不啟動姿態suite），向主美術交完成32SVG與metadata來源；主美術會parse實際occupancy統一匯入attachments.json，你不寫該檔。完成後配合領導新PNG親看接合並修本線源。

## 交付

32源檔絕對根 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/parts/`，明列相對路徑見lower-write-set.json。REPORT `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mech-blueprint/art-lower-report.md`。

REPORT四段：做了什麼、產出、沒做到/證據不足、需要決定的事；末尾附以後交接書該點名的工具。原生DONE/BLOCKED附五行摘要與REPORT路徑。

## 驗收（固定3條，做完就停）

1. 明列32份SVG齊備且符合唯一工作單，源為逐件局部繪製，造型有不同機械用途與分面，不以模板換色填格。
2. 有實際幾何/描邊的包絡與keepOut檢查，無禁語法/超層；主美術可parse匯入附件，未寫attachments或他線檔。
3. REPORT與新PNG親看記錄如實，寫集/容量符合、無背景程序、未commit/push；風格最終使用者評閱。

# CK：偏弓與沉顎

[PLAN](PLAN.md)｜[審核表](review.json) CK01/CK02｜[精確寫集](write-sets.json)｜[REPORT](REPORT.md)

兩個新species，各帶自己的bodyplan、活捕frame、屍體frame、monster及一招新能力，共12檔；再加一展示，共13個新JSON。不是在舊species加招後保留所有舊招。每個數值與層配方已在review，可直接交sol評閱；主線已核可並交sol排工。本線不派工，未跑任何測試。

偏弓C：遠射只有unit目標、min3，因此1–2格確實無傷害招。唯一支足破壞後不能退，弓冠破掉則不會封掉內建招。沉顎B：重咬強制選部位、付5AP並承受瞄準-10；原生AP上限7、每輪回5，與3AP群吼互斥。牠的顎破也不會自動封招，不把引擎沒有的部位能力綁定當賣點。兩者都是地月獵團遭遇的野生威脅，沒有飼養或人物意識。

## 精確寫集與引用

全部新檔以night-ck-開頭，id尾段等於檔名；以下恰好13檔，不增補市場、model、世界事件或遭遇池。

- `content/base/species/night-ck-crookbow.json`
- `content/base/bodyplans/night-ck-crookbow.json`
- `content/base/monsters/night-ck-crookbow.json`
- `content/base/abilities/night-ck-crookbow.json`
- `content/base/frames/night-ck-bio-crookbow.json`
- `content/base/frames/night-ck-corpse-crookbow.json`
- `content/base/species/night-ck-keeljaw.json`
- `content/base/bodyplans/night-ck-keeljaw.json`
- `content/base/monsters/night-ck-keeljaw.json`
- `content/base/abilities/night-ck-keeljaw.json`
- `content/base/frames/night-ck-bio-keeljaw.json`
- `content/base/frames/night-ck-corpse-keeljaw.json`
- `content/base/scenarios/night-ck-broken-keel.json`

新species→同尾bodyplan、兩招與新bio；新monster→同尾species；bio/corpse→同尾bodyplan及同兩招。只依賴本批與既有內容，無night-cm引用。表列引用含兩個既有支援效果的閉包。可捕核的restraint/cockpit槽及pilot座照模板；不得設soul座。species維持必填俗名name；B/C monster不加個體name/epithet；nameEn與etymology可寫俗稱來歷。brief≤60字沿review；長敘述不假裝戰鬥能力。

單檔≤16KB（bodyplan≤24KB）、全批≤192KB。工人0子代理；只跑領導核准窄項，重負載同時1，平衡調整最多兩輪；未過就回報具體阻塞，不加招或改AI解套。

## 自然AI展示與驗收方案

唯一展示「斷艦龍骨下」：map/skirmish-20，沿scenario/exm-crossline的slots、zone部署、eliminate雙向勝敗格式，rounds30、seed102812。玩家faction/migrant-crew、aiprofile/focus-fire：frame/longspear-v7＋person/ren-kasai、frame/bulwark-iv-rampart＋person/chen-xiaohai、frame/longspear-v4＋person/mara-okoye。敵方沿既有混族示範用faction/rift-insects，monster/night-ck-crookbow與monster/night-ck-keeljaw各一，採species各自AI；沒有自訂陣營、不是異形歸蟲族的設定聲明。借用人物只是獨立展示，不記年表。

從原生初值出生，不預置buff、不改AP、不代AI選招。以5 seeds=1/2/3/4/5觀察兩種新招各至少一次AI AbilityUsed；沉顎事件要有part，命中與Miss分開統計。既有鏡衣與群吼也各需有自然選招證據；零次先記合法候選／距離／AP／AI評分原因，不能用手動施放充當自然AI通過。支援和攻擊的時序以事件AP前後核對，並不要求每回合固定腳本。

同級參照使用隔離scratch情境、相同地圖部署駕駛與5 seeds，輪數30。CK01對既有longspear-v4＋bulwark-ii兩C，將敵替換spitter-c再對照；CK02對longspear-v7＋bulwark-iv-rampart兩B，將敵替換shelf-back-b再對照。記勝方、輪數、殘存部位、行動與新招次數；5/5單邊全勝或timeout>40%標出偏差。群吼的同伴效益看正式雙怪展示，不用1v1抹掉支援價值。scratch不是交付寫集、不落content/base；最多兩輪微調，沒有正式平衡承諾。

MCP stdio auto一場seed1留events；另開同展示seed1作至少三個完整round合法操作，每步observe/legal_actions後才act。首輪接敵與射擊，第二輪有合法路線時向偏弓兩格內靠近，第三輪觀察其退避並對沉顎換列；距離不允許時記實際合法替代，必要時延續到接戰，不虛構第二輪必然能貼身。由敵AI自行出手，不能以駕駛bio的AP替代原生怪獸驗證。

窄項另核：偏弓距2拒絕／距3合法（有LOS）；strut破後不可移動但遠射存在；沉顎不給part拒絕、指定完整部位合法、命中有-10；7AP先吼剩4不能咬，咬後剩2、回復後7；單足破仍可走、雙足破不可走；活捕新frame與新species同骨架且層數匹配。這些隔離fixture只能證明規則，不能替代自然AI展示。格式／content gate／窄測及MCP由主線授權的sol執行，設計線未執行。

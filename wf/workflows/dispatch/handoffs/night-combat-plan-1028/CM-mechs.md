# CM：兩台機械系機甲（先交主線審）

先讀本輪[交接](../done/2026-10-28/night-combat-plan-1028.md)、[PLAN](PLAN.md)、[review](review.json) CM01/CM02；親讀content README/batch/mechs/abilities-effects/acceptance-playtest、world-pillars、style、conventions/code-map及表列原碼與近鄰。模型sol、子代理0；需主線核可後才動工。

## 明確寫集（6個新JSON）

- `content/base/frames/night-cm-twinwick.json`
- `content/base/bodyplans/night-cm-twinwick.json`
- `content/base/frames/night-cm-cinderbell.json`
- `content/base/components/night-cm-cinderbell.json`
- `content/base/abilities/night-cm-cinderbell.json`
- `content/base/scenarios/night-cm-yard-bells.json`

所有id尾段等於檔名。新檔均night-cm-；不改既有能力、frame、市場、model、lore、timeline、黃金或引擎。model與營運取得本輪明確不做。新bodyplan六部位共355HP，裝兩槍共387HP；不得把component層誤當結構核。

## 展示與有界驗收

展示「堤上兩聲鐘」採map/skirmish-20、aiprofile/focus-fire，玩家按順序放並燭＋person/ren-kasai、燼鐘＋person/ilse-brandt、既有frame/bulwark-ii＋person/chen-xiaohai；敵方monster/reaper-c、monster/hound-c各一。位置採現有zone；玩家faction/migrant-crew、敵faction/rift-insects。參照exm-crossline的eliminate雙向勝敗格式，rounds30、seed102811，brief標獨立借機展示、不記年表。此混級展示不是平衡基準。

領導提供隔離worktree、draft manifest及reportDir；單檔≤16KB（bodyplan≤24KB），全批≤128KB，6檔寫死，不擴到20。工人只跑領導核准窄項，重負載同時1、工人總數3；完整suite與索引帳本由領導收件統一安排。本設計線未執行以下任何驗證。

1. 格式check/typecheck、content_gate、禁用詞與引用核對；黃金／既有內容不變。數據和nameEn/etymology命名說明照review，不新增schema。
2. 新展示5 seeds=1,2,3,4,5，0 THROW；另在隔離scratch單一content目錄建立對照情境：CM01對longspear-kneeler-v2、CM02對anvil-iv-ram，雙方同用person/ren-kasai，各20輪5seed。控制同圖、部署、駕駛、AI，僅替換新frame；不得改基準配裝。5/5全勝、timeout>40%皆標偏差，不改黃金。跨級展示不作同級勝率證據。
3. 新ability/night-cm-cinderbell須至少一次AI AbilityUsed；既有兩槍、熔鋸、寒泉列覆蓋，未達2/3查原因。另用小型隔離狀態fixture核槍架broken前後abilitiesOf、單／雙履帶locomotionOf及heat29拒絕／30合法、鳴鐘後-30，檢查不寫src測試。這些是單點證據，不代替自然開場蓄燼。若體感只能靠預填heat才成立，退回設計。
4. MCP stdio一場battle_auto seed1；另battle_new同展示seed1，逐回合observe/legal_actions→只選回傳的action→act，至少三個完整round。R1盡量接近與鋸/射擊、R2有合法鳴鐘即用並記前後heat、R3比較寒泉對下一鐘門檻；若距離/敵行動不容，記合法替代並延續到能觀察，不能硬編座標或宣稱一定第二回合放招。附battle_events、輪數、勝方與新招AI次數。

兩機未實測；平衡依主線最後調，不改既有單位、不改AI、不得擅自加全套。只由領導決定是否追加正式content_accept；新展示不入遭遇池。

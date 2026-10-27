# 任務：制定三套美術方向

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
先制定三套真正造型不同的美術方向，後續工人照此繪圖。親讀母brief最新「美術方向與城市分層」與現有 bulwark.svg、busan.json、frame/component設定。只寫精簡art-direction.md，不繪圖。
冷鋼重工：冷灰/鏽/警示橙、方切承重；祕儀科技：骨白/黑金/暗紫、流線與儀式排列；狂潮異形：煤黑/暗紅/病綠、不對稱破甲、有機曲線，但仍是機械，不長血肉。共通氣質：鋼鐵科技厚重神秘狂野恐怖、流線厚重狂亂。各套用同一堅盾與釜山比較，不能只換色。分別寫色票HEX、材質分區、形狀語彙與承重關節/武器不變項、城市遠中近景節奏與地標造型方案、避免誤讀成新世界事實的界線。人物另走乾淨線稿與2~3階賽璐璐陰影的日式動漫，維持34/60歲差；不要求人物三變體。

## 範圍
只寫 art/svg-study-1027/art-direction.md 與本報告夾 direction-REPORT.md。沒列路徑不可寫。不做SVG或HTML/CSS，不做遊戲或設定修改、不做額外調查。
件數 gate：最多2檔；容量 gate：最多20KB，超過停下回報。

## 必用工具
| 工具 | 用途 |
|---|---|
| rg | 查來源 |
| Python標準庫XML解析 | 檢查SVG |
| git diff --check | 空白檢查 |

## 資源與禁區
可寫程式碼線，模型 gpt-6-astra，子代理上限0。不開GUI、不碰鍵鼠螢幕、不截桌面、不上網、不下載、不安裝、不imagegen、不npm、不啟動伺服器、不commit/push、不刪檔、不改config、不寫任何未列路徑。平行工人最多3，全機最多一個重負載，本線不跑重負載。
本環境沒有原生agent工具，領導以codex exec收取終局；本任務明定寫域優先，不寫inbox或ROSTER，以報告檔與最後回覆供領導前景監看收件。

## 工作
寫可直接供其他astra繪圖的精簡設計指引。不得把未載設定的造型當正史，不需要重做規矩整理。

## 交付
SVG目的地：`/mnt/c/code/mine/mecha-srpg/art/svg-study-1027/`。
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/direction-REPORT.md`。

## 驗收（固定2條）
1. art-direction.md列三套色票/材質/形狀與同題區別，人物日漫另列，基準與未載細節標提案。
2. REPORT簡短列來源與交付檔，終局回覆DONE/BLOCKED；不宣稱已繪製或目視。

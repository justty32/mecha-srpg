# code 線交付 — DONE

> 歷史交付快照：以下驗證、指令、hash與未提交描述保留當時原文。成果已於 `04bf2dd` 提交並 push；當前接續見 [評閱入口](../../../../notes/art-review-2026-10-27/README.md)。本整理未重跑渲染或程式驗證。

依 code.md、contract v1.1 與最後兩段主線審查完成，直接寫共享工作區；未開子代理。最後有界修正後僅重建一次、執行本輪 check-tree 一次，通過後退出。美術來源、JSON、效果CSS與manifest均未由本線修改。

## 固定3條驗收

1. **PASS**：以真實 mech-layers.json、manifest及Python XML核對索引測父子有效可見、關父重開保留子偏好、solo暫時覆蓋並退出恢復、reset、換件／HEX配色保留語意偏好、未裝葉不計及fallback停用。原生控件的DOM介面替身測左右臂連武器隱藏／顯示：連續設定arm及weapon兩節點、退出solo、不清除子偏好，左右對稱可恢復。可控時鐘測sensors/sweep/energy各1200ms、暫停600ms後等待5000ms不前進、續播、從頭重播、還原、fallback、reduced-motion變更與隱藏葉同步。播放途中實際換件及配色重建後，motion.bind皆歸idle／elapsed=0／timer=0，再播放各有完整3600ms；重播同phase亦重啟CSS相位。

2. **PASS**：`python3 -B rebuild.py --mech-only` 成功重建三機甲及離線index，人物輸出不寫入。cold／ritual／feral有效葉142／140／140；instance與三完整SVG實際展開深度皆5。機甲可見幾何直接放在既有assembly容器，不再加part wrapper，仍保留data-part、來源transform／style／原畫序。每instance命名空間化ID、href、url及ARIA引用，遞迴複製所需本機資源；檢查唯一ID、引用、幾何保留及兩instance／共享defs隔離。JSON及symbol葉索引嵌HTML，無fetch；新JS/CSS皆本機相對引用。樹使用原生details／summary、label checkbox與button，大層初開、中層初關；左右臂UI標明不含武器，另有四顆成對批次按鈕。按鈕明分「還原可見性」與「還原演出」。人物／城市／戰場既有API分支保持，受保護資產hash核對無改動；舊check-demo.cjs與PNG依派工留領導執行。

3. **PASS**：本輪check-tree內以Node vm.Script解析全部本線JS及自身；本線範圍git diff --check通過，未追蹤新檔另核對無行尾空白。檢查器曾以重複真實節點ID負例確認exit 1，正例exit 0。最後修改後check-tree正例exit 0；XML核對輸出含來源／資料／生成器／成品SHA256，Node拒收過期核對資料。REPORT已落地。

## API與使用

`globalThis.MechTree` 提供createModel、createState、bind／bindAssembly、setPreference、setSolo、reset、effectiveLeaves、summary。state保存model、preferences、solo、enabled與當前leafIds；更新回傳新state。父層有效計數來自當前selected symbols去重葉集合。

`MechTreeUI.mount(doc, root, state)` 回傳bind／getState／refresh；applyVisibility只標記instance的葉，跳過defs，並只對可見選取葉掛data-mech-selected。批次臂控直接連續setPreference，沒有修改美術JSON或新增依賴架構。

`MechMotion` 提供純state的createState／play／pause／advance／reset／setReduced，以及apply／mount DOM適配。mount支援注入時鐘／排程以驗時序，bind每次重建明確reset演出並取消舊timer、保留reduced設定。機甲instance使用契約的phase／play／reduced屬性；初始idle，無自動播放。`ArtDemo.assemble(document, container, manifest, parts, colors)` 原簽名保留；展示已註冊container經此API重建也會重綁樹並重置演出。Assembly公開API未改。

由於本環境Node spawnSync曾回EPERM，檢查分開呼叫Python與Node，無需安裝或瀏覽器；請從art/svg-study-1027執行：

```sh
python3 -B rebuild.py --mech-only
node check-tree.cjs --python > /tmp/mech-tree-check.py
python3 -B /tmp/mech-tree-check.py "$PWD" > /tmp/mech-tree-check.json
node check-tree.cjs --xml-json /tmp/mech-tree-check.json
```

## 範圍與限制

本線13個交付檔：mech-tree.js、mech-tree-ui.js、mech-tree.css、mech-motion.js、demo.js、rebuild.py、index.template.html、index.html、bulwark三SVG、check-tree.cjs及本REPORT。新增量約0.24 MB，低於15檔／1MB。未改assembly.js、人物城市戰場、README／SOURCES或共享狀態；未commit/push、未下載、未跑npm／遊戲／舊全套，無背景工。

**未做真瀏覽器、布局、鍵盤實機或CSS動畫時間序列目視驗證。** 原生語義與DOM介面替身、CSS契約及JS時鐘測試不冒充瀏覽器驗收；實際光效美感與PNG證據由領導收件。終局DONE。

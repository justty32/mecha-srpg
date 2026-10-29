# 常規兵種角色 AI

## 做了什麼

依[總brief](../lead-roles-1029.md)與[契約](../../../planning/specs/unit-roles-1029.md)完成三台現有常規車輛的選填機體profile。坦克向距2–4前線接近；飛彈車維持5–6、被貼時退距，缺彈仍能用機砲；工程車依友軍真熱需求排熱15，沒有修甲能力。未標profile／rangeWeight缺省0保持原路；scripted、berserk、撤退與重整優先，不改共享陣營參數。實作見[子線報告](../roles-1029-implementation/REPORT.md)。

## 產出

產品17/18檔、133400 bytes（gate2MB）；[逐檔SHA](evidence/source-hashes.json)合併指紋 `5a2cc9963b464953d940c26590e025c931c3ccf02055aea48d66376f346154e7`。原demo場景、demo-hardclash與rules/constants無diff；無profile舊hound的同seed命令與缺query序列全等。型別雙段、內容雙check、角色8/8、combined9/9、73片index check均exit0；[精確命令與結果](evidence/verification.json)、[原始logs](evidence/raw-logs.tar.gz)。三固定seed3/17/41分別7/7/9回合、184/175/223步，全為enemy eliminate，拒絕0、均正常終局。所有runner依mobile明確時段串行nice19，已釋出，子工已終局。

## 證據不足

三樣本不證明全面均勢，三場皆敵勝；本輪未調戰鬥數值、未重跑33分鐘全套或營運CLI。角色首測5/8，三敗源於受控fixture直接createBattle未套defaultLoadout，補正式配裝後8/8，無改產品湊綠。schema pattern僅宣告，loader驗引用存在，adapter require驗profile種類；不擴generic validator。

## 需決定

無待使用者裁決。strict wf-lint exit1，僅原2條legacy外部壞鏈（broken2/local0/oversize0/biglist0/querycmd0），無本輪新增硬違規；提交hash由root以git log核對；原3個未追蹤review logs、手機與Pages改動保留。SESSION/CLAIMS由root統一收尾。

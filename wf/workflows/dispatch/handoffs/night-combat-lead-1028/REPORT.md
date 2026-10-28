# 夜間戰鬥內容 REPORT（進行中；CM未接受）

## 做了什麼與目前產出

主線核可CM兩機六檔及CK兩新物種十三檔，分離worktree、精確brief/manifest，兩工人沿用原ID、子代理0。CM六檔全留 `/tmp/night-combat-lead-1028/wt-cm`，**主線已裁決整批不carry、不拆收、不第三輪，不計已入庫成果**。CK十三稿於 `/tmp/night-combat-lead-1028/wt-ck`，重驗已完成、依matchesReference核可後已carry。兩批只展示，未接市場／model／遭遇營運，不修改引擎／黃金／既有內容。

## CM真實驗證與未接受結論

資料check exit0、基底check exit0，新警告增量0。worker typecheck exit127（隔離無tsc）原log保留；領導連主repo既有node_modules後補驗typecheck exit0。gate六檔零違規。首輪自然展示五seed均outcome、無例外，鳴鐘AI在seed1/2/5各一次；初始heat全0。首輪同級並燭原側5/5勝、燼鐘accuracy2原側0/5勝。比較 [原始摘要](cm/comparison-summary.json) 含HP、命中、傷害、先手與部署限制；同駕駛AI及對置座標，但地圖不完全左右對稱。

主線僅核accuracy2→6且不改其他欄。最後輪新增十五配對：CM01原側沿用5/5、換側2/5，顯示側敏感，不能據原側判純數值偏強；CM02 accuracy6原側與換側皆0/5（合0/10），新招自然各1–2次仍輸，未過既有門檻。達兩輪上限，不第三輪、第二旋鈕、waiver或改基準AI。六檔變動恰CM02 frame.baseAttrs.accuracy一欄，見 [單欄差異](cm/last-round-single-field-diff.json)；原六檔 [來源hash](cm/round1-source-hashes.json) 與交稿證據吻合。

窄fixture十一項全過：槍架失雙槍但仍可移、單履可移／雙履停、heat29拒絕／30合法並散30。MCP stdio auto第8輪outcome，手動三完整round、63命令零拒絕、鳴鐘及寒泉各一次，replay hash一致。**這些fixture/MCP執行快照accuracy=2**，只沿用機制與合法操作證據，不冒稱accuracy6修後相同hash；修後勝負／命中／自然使用只採最後輪新證據。原始輸出在cm/log，worker詳報 [CM REPORT](cm/REPORT.md)。

## CK與未驗項／限制

CK稿check及補驗typecheck exit0。相較基底新增恰兩行soft-overflow-band：沉顎species與bio frame的instinct soft池bands=[]無超max band。主線與astra確認：原soft25/regen7允許超max、本池沒有band懲罰；保留警告，不改hard／效果，也不能擴稱生物系無代價。CK既定重驗已完成且主線核准按既有matchesReference局部收件；十對同級/同圖/玩家駕駛配裝AI/部署seed逐項核對，唯一敵monster變因。25筆outcome無例外、四招自然25/19/17/6、六fixture與MCP過，詳ck/REPORT及matches-reference-audit.json；十三檔已carry、維持draft/integration pending。

主線GO至22:25、nice19最多兩CPU單runner。CM於22:07台北釋放，CK隨即GO，實際22:09:45釋放，終局22:16取回後交pilot；本輪不跑完整suite，最終整合由主線verify-night線統一安排。本機匯入基線1031／1022過／9敗不是本次新戰鬥驗證結論。CM未接受，manifest維持draft/integration pending/local not-accepted，證據快照 [manifest](cm/manifest-draft-evidence.json)；content/batches本體暫不提交，避免未入庫檔引用被當成果，無CM索引更新。

## 已讀、後續與交接

領導親讀AGENTS/WORKFLOWS、user/working、content README/batch、mechs、abilities-effects、bio-monsters、acceptance-playtest、playtest、dispatch/content-batch、testing、conventions/code-map、兩份核可設計及review、相關command/movement/probe/MCP原碼。工人共通已讀沿用、補新類別近鄰，完整已讀與去重證據在cm/ck附件。沒有下載、GUI、鍵鼠、刪檔或worktree、push、引擎修復。

CM Zeno已轉核可R2四地點純lore資料；CK Epicurus結束後轉核可R2四事件。R2不在此戰鬥寫集，不啟第二runner。pilot未核可不派。最新ID、時段與階段見 [state](state.md)，歷史待GO紀錄不代表現況。

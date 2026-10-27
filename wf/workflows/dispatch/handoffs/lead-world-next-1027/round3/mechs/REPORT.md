# wn-r3-mechs-1027 REPORT — draft

## 已做

### 已讀清單

已親讀 mustRead 五份，均為主樹現行版本：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/style.md`

依 round3-plan 的三列 `category=mech`、`decision=adopt`，及 round3-plan-review 的三列 `approve-with-constraints` 完成產出。其他規矩、同級範本、骨架、配件、能力與最近既有全文的路徑、SHA-256 及關鍵事實存於 [review.json](review.json)，未只靠計畫摘要。主樹 wl-* 已用於逐件比較，內容引用只用 HEAD 既有 ID 或本概念配套。

依主線正式退修，另親讀 wl-bulwark-ferry、wl-anvil-cable、wl-surveyor-trace 全文，三篇 etymology 均已重寫主要場景、目標與人際衝突。開扇改為試機爭工與前足檢修；留潮改為鹽場停火時縛敵僚機、拒絕同伴要求的斬首；同燈改為聯隊爭獸首與支援工錢推責。原稿完整留於 review 的 rejectedEtymology，各列附退修原因、新場景差異及三份 wl 全文雜湊。除三篇 etymology 外，六個內容檔其他欄位保持本輪首稿。

鐵砧的 m2-quadruped-c 實為七部位，已按領導約束更正計畫的八部位誤述。三架都沿用骨架的軀幹 core 與 pilot 座；護艙隔板只增加防護層，沒有當作機甲核心。有人駕駛的配裝未加魂核或機魂人物。

## 產出

隔離區 `.git/wf-worktrees/wn-r3-mechs-1027/content/` 新增三個概念、六個 JSON，精確對應核准 targetFiles：開扇為四足扇射與單體熔鋸；留潮為浮行近距拘束與離身鳴刃；同燈為六足單友報點、煙護及共用流光的雙武器。全文場景均寫在既有 etymology 欄，英文原名保留於 nameEn，意涵寫入 etymology 與命名表；依領導更正，不將英文原名填作勢力別名 aka。

[review.json](review.json) 與 [naming.json](naming.json) 各三列；白話均不超過六十字。命名表保存英文原名、中文及意涵，model 沿合法欄位配套，沒有另增名稱欄。三型均 restricted、generic=false，第五月可用並以前代 model 為 requires；未聲稱自動市場上架。

Python 靜態檢查通過：三份 frame 以現行 JSON Schema 驗格式，六檔 id 與檔名一致、model 欄位集合沿同級模板且 tier/cost/前代一致，三架槽型、size、機械件來源、對獸武器及能力池均合法；核對三十九個 HEAD 既有引用與主樹相符。質量依序為 9／8／12；九 AP 內最大主動產燼為 36／30／45，低於池上限六成；留潮另有每回合至多一次的離身反應產燼 6。

主樹 `content_gate.py` 對本 worktree 與唯讀 manifest 回傳 0，approved 恰六個計畫檔、violations 為空。worktree 的 `git diff --check` 回傳 0，既有檔無改動。退修後另以 Python readlist 驗證 REPORT 的「已讀清單」標題及五份 mustRead，回傳 0。

## 未做與不足

本批仍是 draft，數值僅同級暫填；未完整驗收，不稱 accepted。公司階段未跑 node、npm、loader、ops checker、typecheck、測試、模擬、probe 或試玩；整合、統一平衡與試玩留回家，由領導接續串行檢查。未改主樹內容、引擎、schema、spec、manifest、index、年表、SESSION 或 CLAIMS，未 commit、push、安裝或派子 agent。

三案沿用既有能力限制：扇招射程一至三、冷卻二，不產生地形火區；停步索命中仍有傷害，只縛網與減閃避，不拖獸、不保證活捕，鳴刃反應僅在敵離鄰格；同準與煙護各耗三 AP、冷卻三、每場兩次，單友煙護降低其命中，不代受傷、不給全隊增益。未新增任何規則或能力效果。

## 需決定

本線沒有新增的機制需求。查到 engine-facts 的 EF-21 仍記 frame 無別名欄；現行 schema 與 FrameDef 已有勢力別名 aka，依領導補充採 nameEn 保存英文，本批不使用 aka，也不修改該舊摘要。敘事基調、去重收件與正式驗收交領導及頂層；回家後再決定最終數值。

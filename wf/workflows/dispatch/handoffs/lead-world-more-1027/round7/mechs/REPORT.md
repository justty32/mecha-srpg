# wm-r7-mechs-1027 REPORT — draft

## 已做

### 已讀清單

本 session 已親讀五份 mustRead；依本線補充沿用共通規矩：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/style.md`

另親讀本輪總 brief、機甲交接檔、計畫三列 category=mechs/decision=adopt、領導審查三列 approve 及最新 requiredConstraints。規矩重用紀錄、逐案同級範本、骨架、配件、能力、效果及各兩個最近既有的全文證據存於 [review.json](review.json)，未擴成全庫盤點。

三篇先寫人物欲望，再以完整 etymology 承載主要行動、衝突與結果。留像是兩名搭班者想同框，出勤後只能擠進半幅機身旁，晚飯時互認小背影；踏拍是鼓手駕駛奪回被占的排練室，卻失去熟悉的地板與站位，當晚搬鼓到空地換曲續奏；BW-08 是交班延誤後仍想讓母親認出自己與機體，依許可繞到窗下，停妥、下艙揮手，最後一起吃飯並親眼指認白瓷刮痕。

BW-08 已遵守主線新增約束：只交班、未退役，輪座沒有手臂，揮手者是下艙後的人；母親現場看到兒子與機體，沒有照片補遺憾。踏拍的音樂僅屬人物生活，沒有音波、破牆或擊退效果。留像的收捕先經同伴破壞與現場確認，扣足不略過物種部位條件。

## 產出

在 `.git/wf-worktrees/wm-r7-mechs-1027/content/` 精確新增核准的三個 frame 與三個同名 world/model，共三概念、六個 JSON。英文原名放 nameEn，aka 省略；[naming.json](naming.json) 保存英文、中文及意涵，三列與 [review.json](review.json) 一一對應，白話均不超過六十字。

三架 baseAttrs、池及內建能力沿同級模板，只換核准配裝與系列／血統 tags。model 的 tier/cost、requires、availableFrom、generic/exportPolicy 均沿同級模板；踏拍的 role 改為 variant，不另立新世代。留像保留 universal-longspear 且加 lineage-jinghai，BW 沿公刻堅盾；沒有新增血統、研發或市場上架規則。

Python 靜態驗證通過：六檔 id／檔名與 targetFiles 一致，三份 frame 通過現行 JSON Schema，三十八個既有引用核對 HEAD 與主樹一致；配裝槽型、size、機械來源、對獸武器、池成本／產燼及 model 配套合法。骨架部位依序七／六／四，質量五／六／四。考慮既有冷卻後，九 AP 最大產燼為 45／28／16，均低於池上限六成；核心、座艙與 pilot 座沿 bodyplan 結構，沒有新增魂核或把掛件當機甲核心。

主樹 content_gate 對本 worktree 與唯讀 manifest 回傳 0，approved 恰六檔、violations 空；worktree 的 git diff --check 回傳 0。REPORT 的已讀清單與三列報告資料另以 Python 核對。

## 未做與不足

全部維持 draft、integrationStatus deferred-by-user，數值僅同級暫填，未完整驗收。未跑 node、npm、loader、ops checker、typecheck、測試、模擬、probe 或試玩；領導串行接續有限內容檢查，整合、統一平衡與試玩留回家。

未改主樹內容、manifest、索引、既有內容、年表、SESSION/CLAIMS、引擎、schema 或 spec；未 commit、push、安裝、刪檔或派子 agent。只在指定 worktree 寫六個新 JSON，另寫本線 REPORT/review/naming。兩個近似來源逐件比較功能與故事；這份比對不宣稱全庫無相似，也不以配裝差異替敘事放行。

## 需決定

沒有發現需要新增規則才能實作的缺口。留像、踏拍與 BW-08 的敘事、去重與最終接納仍交領導／主線複審；正式平衡及整合結果待回家驗收。

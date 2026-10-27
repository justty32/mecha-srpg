# 第7輪怪獸交付 — draft

## 已做

### 已讀清單

manifest mustRead 五份皆已由本創作者親讀，本線獲准沿用前輪共通規矩：

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `content/lore/style.md`

補讀本線總 brief、怪獸 brief、核准計畫三列及全部 requiredConstraints；主樹的四檔模板、骨架、能力、效果、AI profile 及每概念兩個最近怪獸全文均已核對。敘事另親讀米娜與瑪伊雅全文。完整閱讀清單及 hash 存於 [review.json](review.json) 的 workflowReads／fullTextRead；僅按計畫定向比較，未擴成全庫普查。

疊燈原放映缺角案於落檔前被主線退回：完整影像變殘幅仍認家、戰損後補活動，與同輪留像／踏拍及米娜的補遺憾過近。領導更新計畫與審核為 approve-revised 後，改採夜巡同住邀請，怪獸配套不變；退回理由與新案差異存於 review 的 proseDedup。

## 產出

疊燈 C、踢珠 D、裂炬 C 共 3 概念，species／monster／bio frame／corpse frame 各 3，共 12 個新 JSON，精確符合核准 targetFiles，位於 `.git/wf-worktrees/wm-r7-monsters-1027/content/`。主樹 content 未寫入。

疊燈實際參與堤外逼近、並翼與退去的警戒事件；兩名獵手交接完勤務才談同住，搭檔把勤務交代聽成搬艙安排，最後親自挑床位。踢珠在廢站交火後倒下，兩班帶走不同大小的鐘，以花紋氣派與聲響隔街較勁。裂炬使敵隊短暫轉火，獸倒後兩個領隊仍爭先後、分插旗位，改日再比。三篇只在 species.etymology 寫正文，沒有拘束／屍改／二名規則結尾。

機制差異分別為酸射換有間隔的穿刺並保留近鄰閃避增益、零傷抖耳減益換貼身低傷踢擊、拖行傷害加減益換遠射。數值、既有骨架與池均沿同級模板；bio 僅本能池，burden 依序 5／2／6；corpse 空池、burden 0，補 kaiju。D/C 個體不填 name／epithet／named。

固定驗收三條：Python 核對 3 概念／12 精確路徑、JSON／id 檔名／HEAD 或本批引用、模板數值與池、grade／能力／capture 一致、骨架 HP／核心／結構末層／pilot 與拘束槽；指定 content_gate 與 worktree git diff --check；本報告及 review／naming 各 3 列、白話不超 60 字、全文證據與 mustRead。Python 靜態核對通過，13 個外部直接引用均在 HEAD 存在且與隔離區一致；content_gate 回傳 0（approved=12、violations=0），本 worktree git diff --check 回傳 0。兩表各 3 列、白話最長 32 字，mustRead 與全文證據 hash 均已核對；新內容加三份表報容量低於 1 MB。

## 未做與不足

全部 **draft**，`integrationStatus: deferred-by-user`；數值僅同級暫填，整合、平衡、AI 實際選招與試玩留回家。本線不跑 node，loader／適用 ops 有限檢查由領導串行負責；未跑 npm、測試、typecheck、build、sim、probe、MCP，未開子 agent、未 commit／push。未改既有內容、引擎、schema、spec、manifest、索引，未新增骨架、能力、效果或規則。有限靜態檢查不等同完整 accepted。

踢珠 species 與 bio 的本能池保留伏耳的 soft／max100／initial5／regen2／bands[]。此結構有沿用既有類型告警的風險，未為消告警私改 hard 或新增 band；本線未執行 loader，不聲稱已取得新告警輸出。

計畫將垂帆的掛足拖行記為零傷，實際 HEAD 能力為 unit1–2、kinetic12、3AP／CD2，另加兩回合閃避-8／先手-2。review 已更正此比較：裂炬除保留同一遠射外，以 unit1 動能18、3AP、無冷卻取代該傷害加減益，並改用 420HP 偏披骨架與 AP9／回9。核准的裂炬配套與原能力均未更動。

## 需決定

無新增機制需求。領導收件後核對三篇故事的互動差異，接續其串行 loader／ops 有限檢查；踢珠保留空 bands 的風險與垂帆比較更正一併帶回。正式整合、平衡及試玩仍待回家驗收，本線不宣稱完整 accepted。

# 展示：兩本帳

唯一scenario：`content/base/scenarios/night-p-two-ledgers.json`，id `scenario/night-p-two-ledgers`。map/skirmish-20，rounds30、seed102815，沿scenario/exm-crossline的雙向eliminate勝敗格式。player faction/migrant-crew、ai aiprofile/focus-fire；兩單位均frame/longspear-v4，按既有zone部署，pilot座依次person/night-p-serin-sowe與person/night-p-mateus-vieira，無soul、無state覆寫。enemy faction/rift-insects：monster/reaper-c與monster/mite-d各一，原生species AI。這是跨勢力借機展示，非兩人加入候鳥號或實際合作的年表事件。

沿既有長槍-V4完整defaultLoadout：right-weapon mx-radiant-rifle、left-weapon mx-rune-rifle、back-1 mx-ember-pod、system-1 mx-essence-cell、armor-mount composite-plate；沿用frame內建mx-head-vulcan。不把凡火矢當成新增高精粹招，不改任何共享件。兩槍與AP9提供普通合法攻擊；依當回合距離／LOS／資源由legal_actions決定，不能宣稱開場一定射得到。

## 自然建構與有效值

makePerson在src/rules/state.ts:210–217只複製attrs並建空contribs/effects；makeUnit接座位時沒有自動掛PersonDef.traits。personAttr只讀attrsBase和已掛contribs，roleAttr再加機體（src/rules/contribs.ts:52–65）。因此本批自然展示不得宣稱宣告的常駐特質已生效。主線已明確核可按base值比較，不預填狀態、不改引擎或加新檔。

瑟琳自然person＝accuracy56/evasion6/resolve44/initiative5/perception7/control46；馬特烏斯＝48/9/56/7/6/50。合併相同長槍-V4的accuracy4、initiative6、perception6，無疲勞／士氣／地形時分別為60/6/44/11/13/46與52/9/56/13/12/50，欄序同前。這是原碼與資料的靜態算術，實際戰鬥值由sol輸出確認。

若特質在別的路徑正確掛上，記仇到小數點為accuracy+4/control−3；跟命運賒帳為evasion+3/initiative+1/resolve−5。review保留這組標稱值以供辨識，不把它和自然初值相混。展示取捨仍成立：瑟琳準且慢脆，馬特烏斯快滑但準度低。control與will的差異不另宣稱本次純機械展示必然可見。

## sol待驗方案（本線未跑）

五seed＝1、2、3、4、5，原生初值、0 THROW。每一seed保存初始person.def、attrsBase/contribs、實際roleAttr及兩新person對應unit，不能只靠中文名字識別。每人至少一次合法行動；五seed總計各至少一次AbilityUsed，記發招數／命中Miss／行動回合／撤退／存活。沒有新技能，覆蓋看既有槍與內建招，不設虛構display技能。

同frame只換person的有界對照：隔離scratch複製展示，每次只把P01換person/exp-adela-miro或把P02換person/exp-miyasaka-gaku，其他人物、敵方、配裝、AI、位置、seed不動，各5seed。不要把兩個人同時替換後把差異歸於一人；既有人物也走同makePerson自然路徑，不用特質標稱加成充當對照。另同seed互換兩個玩家部署位置，識別位置／先手效果；不做全面排名或正式平衡承諾。新值是否全勝／全敗只作觀察，不能像CM單邊對照一樣直接推斷需加傷害。若配置有誤先報主線，不改既有對手配裝。

MCP stdio auto一場seed1；另開同情境seed1完成至少三個完整round，每步observe→legal_actions→act。首輪各自移動／有合法射擊才射，後續記瑟琳與馬特烏斯各自的action actor及person.def；不硬編座標、不強迫不存在的目標。保留events、person→seat→unit對應、round及勝敗。冷熱／資源原值，不預掛traits。必要窄格式與引用檢查由領導授權的sol做；本設計線不跑npm/test/probe或MCP。

固定三條交付驗收：五檔寫集與兩個人名/gameRefs一致；無新schema／技能／招募／timeline；兩人自然可行動且其真實人物id與base取捨有追溯證據。若traits自然仍空，按已披露現況記錄，不新增waiver掩飾未驗結果。

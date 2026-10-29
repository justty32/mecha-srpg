# 常規車輛角色AI

## 範圍與證據

只改三車AI，不改戰鬥規則與數值。機砲射程1–6、追矢3–9且4發；工程排熱射程1–3、AP3/CD2、heat-15，不是修甲。既有support.ts已以真預覽delta與熱需求評分、抑制無收益與同輪重複支援，沿用。

純params不足：frame沒有aiProfile接線；tactical靠敵排序的有限候選不保證提出後退格；score純move只獎勵接近。不硬碼frame id。

## 最小接線

FrameDef.aiProfile?:Id；schemas/content.schema.json的frame允許選填aiprofile引用。src/content/schema.ts是通用驗證器，不改。loader.ts既有全字串reference遍歷驗存在，不改loader；schema約束aiprofile種類，adapter用require("aiprofile",id)。

RulesQuery新增選填frameAiProfile(s,id):{policy:string,params:Record<string,number>}|undefined；rules-adapter讀該己方frame及profile。agent.takeTurn僅本單位原fallback為tactical時合併{...env.params,...frame.params}及使用frame.policy；不得改env共享物件、陣營策略或其他unit。實際berserk、flee、regroup、scripted等優先序保持；缺欄／stub缺query整段走原路。三新profile皆policy:tactical。

## 距離偏好

新增數字params rangeMin/rangeMax/rangeWeight，缺省weight0完全不啟用。d為知識快照內可見且active敵人的最近距離，gap(d)=max(min-d,0,d-max)。無可見敵人沿原追蹤，不從真state偷目標。

啟用時score純move改以weight×(gap當前-gap目的地)取代原reposition接近項，保留danger與objective項；攻擊原價值乘1/(1+weight×gap目的地)，不憑距離賦予無傷害技能正收益。偏好是軟評分，不禁止近距自衛、射程外追敵或任務移動。

tactical在原候選外補maxMoves上限內的可達改善格：gap較當前低，按gap、danger、移動成本、x/y穩定排序。仍真preview路徑/AP，並保留純移動改善候選不被既有『非射擊位置刪除』迴圈抹掉；否則被貼身時仍無退距。到區間後純距離移動收益0，不來回抖動。移動與攻擊同源；合法性不放寬。

## 內容凍結

新增content/base/aiprofiles/battlefield-frontline.json：attack1.2、protect0.5、dangerK0.005、rangeMin2、rangeMax4、rangeWeight1、band1。battlefield-standoff.json：attack1.2、dangerK0.03、rangeMin5、rangeMax6、rangeWeight1、band1；上限6讓追矢耗盡仍可用機砲，不因固定理想8格停火。battlefield-heat-support.json：attack0.5、protect3、buff2、dangerK0.02、supportHeatStart0.6、supportHeatUrgent1、supportRelief12、maxSupportMoves4、band1，無rangeWeight。三台battlefield-tank／missile-truck／engineer.json各指對應profile，其餘參數沿原預設，不改舊profile。

## 固定驗收與負對照

固定平地、相同人員資源、固定seed：敵距8時坦克合法前推至較近前線；敵距2且後方可走時飛彈車先拉開、保留AP可攻擊，距5且已有合法射擊不無故更貼近。對照移除frame profile應回既有候選／score；把後方堵死不得拒絕循環。追矢0仍能機砲自衛，不因無彈一直退。

工程車與熱120/120友軍距2且有可選攻擊時，優先真排熱；同局只把友軍熱改0則不得施放無收益排熱。友軍距4可合法移動至支援範圍；AP不足或扶架毀不得硬施放，仍可攻擊或正常end。這些測試須執行命令驗heat實降，不只驗候選字串。

舊frame無profile及新參數weight0需有同seed命令序列回歸；三代表完整交戰報拒絕、卡住與終局，不由三樣本宣稱全面平衡。設計未測試。

## 精確擴幅

原授agent.ts／score.ts外需types-def.ts、schemas/content.schema.json、rules-query.ts、adapters/rules-adapter.ts、policies/tactical.ts五檔。三frame、三profile、test/ai/unit-roles.test.ts、test/sim/combined-arms.test.ts及實際內容索引分片，預估16–18產品檔；生成分片若超18先回報。不新增policy。

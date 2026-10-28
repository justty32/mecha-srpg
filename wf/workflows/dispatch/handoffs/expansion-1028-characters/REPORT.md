# 人物八件已產出；focused 通過，等待領導重驗

## 已讀清單

- AGENTS.md
- wf/workflows/common/user.md
- wf/workflows/common/user/working.md
- wf/workflows/content/README.md
- wf/workflows/content/batch.md
- wf/workflows/content/world-pillars.md
- wf/workflows/content/ancient-people.md
- wf/workflows/content/lore-text.md
- wf/workflows/content/playtest.md
- content/lore/style.md
- content/lore/style/people.md
- content/lore/README.md

以上逐條對齊 manifest.report.mustRead；完整親讀在 [readlist.json](readlist.json)。本線另親讀工作區規矩、專案 art／team-model／dispatch、content 全部 25 份 Markdown 及適用 core／world／design-notes；新版交接已重讀。八個最近敘事與裴賢珠／瑪伊雅／阿喬亞三個次近敘事均全文親讀，不把計畫摘要當比對證據。

## 做了什麼

依 astra 核定八列，在 `/tmp/expansion-1028/wt/characters` 只新增 manifest.plannedFiles 十八檔：八 human person、八 lore character、兩展示情境。合計 **32,094 bytes**，最大單檔 **2,505 bytes**。HEAD 保持 `c09b026919eeee03cde68c0f1eb0d289ad4cbe7c`；無既有追蹤檔修改、無 commit／主樹 content 帶回。

八人姓名雙檔一致；attrs／traits／beliefs 逐列保留核定值，person 有三池、HumanGrowth、nameEn／etymology；lore 有 born／faction／role／relations／events，gameRefs 只指本列 person。沒有假造既有事件或親屬 id，relations／events 留空。正文每篇 **修後 405–435 個中文字**，皆在 300–700 字內。沒有新 trait／ability／perk／機魂、招募池或歷史大事件。

[review.json](review.json) 八列用 EX-P01–EX-P08，介紹各≤60字；內含完整新稿主衝突、逐列親讀比較、數值與掛接。[naming.json](naming.json) 保留英文原名與音譯／身份意涵，不臆造人名語源。葉榛仍愛名聲、宮坂仍會操縱觀眾、莉妲唱得不好、奧瑪尚接短雇、珊雅不轉信、阿黛拉失去雇主信任、盧恩換機未治壞脾氣、梁苒仍想被選中；沒有用道德演說收掉棱角。

## 驗收證據

固定第1條：十八精確路徑與實際 untracked 集合相等，排除領導建的 node_modules symlink；全是新增、八人全 human。`focused-results.json` 的 scope 保留初交 HEAD、件數、容量及十八檔 SHA-256；最新三檔覆寫 hash／容量在 latestRevision.changedHashes 與 revision.json；R1只改葉榛，R2只改兩展示。

固定第2條：review／naming 各八列齊全，完整 readlist 區分全文與資料查詢。已讀清單如上，數值與語義區別見本報告及 review 的 `observedComparison`。不是只改名字：例如宮坂出售敗績而尼科真輸後再賭；盧恩面對日常支配欲而恩潔莉處理拘束危機；梁苒保留羨慕而不替古代機宣布答案。

固定第3條：初交各跑一次 loader check、lore check、typecheck、content gate，皆 exit 0；窄退修只按新授權加跑一次 lore check，仍為0錯誤／0警告。逐步命令、時間與原始輸出在 [focused-results.json](focused-results.json) 與 [focused-logs/](focused-logs/)：loader **0 errors／36 warnings**，新 exp- 路徑告警 0；lore **errors=0／warnings=0**；兩份 tsc 通過；gate **approved=18／violations=[]**，只忽略 node_modules。舊36警告仍交領導對當前基線，不把歷史同數字快照當完整整合證明。新版 brief_lint 為0違規／1檔。

## 平衡待驗

人物 base 六屬性全部沿用核定計畫並落觀察帶；hp 暫填 52–64、AP 一律9／每回合回9、fatigue100／regen−15。永久特質均引用既有檔，不為本輪改舊效果；每筆貢獻在±5內，部分舊 badge 長於指引，未動舊檔。

特質後（未加機體／部件）EX-P02 evasion15／resolve38／initiative9、EX-P06 accuracy65／resolve41、EX-P08 perception9 超出人物 base 觀察帶。這是核定既有特質的取捨，不以自改 attrs 消平；完整八人 base／afterTraits 在 review。實戰強弱尚待領導 probe／MCP，不能以數值合法宣稱平衡。

`scenario/exp-four-choices` 與 `scenario/exp-unfinished-ties` 各展示四個新 pilot，每人只坐一台核定既有 frame；共八席、無同人多台。機械系沿用已讀 defaultLoadout；莉妲的 bio-hound 明配 heart 下的 restraint→shell-pin-restraint、cockpit→fm-yoke-palm，尺寸相符、pilot 座存在，沒有把硬綁 torso 的護艙隔板套上四足獸。這些既有配套的歷史待驗狀態未被升格。

兩場修後共用既有 skirmish-20 地圖，player 明列 focus-fire，兩側部署相隔十五格；先列玩家全滅 lose，敵群清除才可贏，rounds30；已移除 survive25 自動勝。展示不是共同正史，不新增本傳戰役，亦不表示已接營運招募池。未跑 npm test、probe、MCP、sim 或整合 acceptance；後續由領導按單重負載串行。

## 局部退修 EX-P01-R1

獨立去重指出葉榛開場與阿瑪莉亞的「踩凳、摘門面身分物」鏡頭過近，本線親讀兩端後只改葉榛 body：擂場仍未散，她拒把敗局圓成名將家傳讓招，母親自行從旗手手裡接旗、捲旗離席；不用凳、摘門物或肖像。她仍想被看見，也未與母親和解。舊正文與新正文、前後 hash、非 body 欄位不變、其餘十七檔 hash 相等及加跑 lore 原始證據均在 [revision.json](revision.json)。該次只加跑授權的 lore check，未重跑 loader／typecheck／gate 或重測。內容重新凍結，等待同一獨立去重員重核。

## 展示退修 SHOWCASE-R2

領導 MCP 實際發現 unfinished-ties 全AI25輪 AbilityUsed=0／Hit=0，卻靠 survive25 勝；four-choices 亦接戰不足。本線不將這些結果稱為可用展示。依原生 followup，僅兩 scenario 換 map/skirmish-20、player.ai=focus-fire，移除 survive，保留 eliminate lose／win，rounds30，並改掉簡介的存活獲勝說法。八人、機甲、配件與敵群原樣不變，其他十六內容 hash 不變。原失敗 MCP log 由領導保留，未覆寫。

依窄修授權只各加跑一次 loader／gate，均exit0（loader 0 errors／36 warnings；gate18檔、0 violations）；沒有加跑 lore／typecheck／heavy。原始證據見 focused-logs/check-showcase-r2.log、gate-showcase-r2.log，差異與 hash 見 revision.json。重新凍結，等待領導重測兩整場；目前不宣稱接戰問題已由執行證明修好。

## 需要決定

本線無新增世界觀裁決。舊215件、七輪與舊人物的 draft／待驗邊界照舊；歷史朴仁哲P01失腿矛盾未碰。未下載安裝、未開GUI或碰鍵鼠螢幕、未派子代理、未啟外部CLI agent、未改秘密設定、未commit／push。

**交領導接續重驗；本線停止，不自行帶回或擴大檢查。**

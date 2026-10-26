# 已讀清單

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/before-collapse.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`
- `wf/workflows/planning/design-notes/world/history-lines/d-moon.md`
- `content/lore/places/montreal.json`
- `content/lore/places/mexico-city.json`
- `content/lore/places/sao-paulo-blight.json`
- `content/lore/places/ring-road.json`
- `content/lore/places/great-lakes-mycelium.json`
- `content/lore/factions/quito.json`
- `content/lore/factions/ring-caravan.json`
- `content/lore/factions/shell-society.json`
- `content/lore/factions/remnant-wings.json`
- `content/lore/characters/xingtian.json`
- `content/lore/events/pune-falls.json`
- `content/lore/events/singapore-conference.json`
- `content/lore/events/credit-accord.json`
- `content/lore/events/hunter-license-act.json`
- `wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`

其中 AGENTS.md 親讀來源為 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；交接書親讀來源為 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`。history-lines.md 已讀包含「崩年的底色」十三句。另讀開場狀態、WORKFLOWS、inbox README／PROTOCOL、data-files、相關 world-pillars 子檔，並以 tabledb 查定案用語。

## 做了什麼

`content/lore/factions/north-american-umbrella.json`：美國守住內陸，把加拿大與墨西哥諸城納入調度，卻拒絕自稱傘。 掛到：G 線；N09；底色 1.6、1.13 G。

`content/lore/factions/heartland-capital.json`：留在地上的美國資本，靠糧田與工廠放款，想贖回押給月亮的沿海地契。 掛到：N09；D 線；底色 1.7；magnates。

`content/lore/factions/latam-umbrella.json`：各國有席位、商團出錢的聯盟，沿商路雇人護糧，不能命令安地斯的古代機。 掛到：G 線；N06；2101 環線護航；底色 1.4。

`content/lore/places/denver.json`：美國政府搬進山裡，登記簿與帳房靠在一起，替內陸糧車排班。 掛到：polity 政府遷山通則；底色 1.6。

`content/lore/places/new-york-hollow.json`：斷糧後撤空的巨城，國家默許打撈，握著抵押地契的月上債主卻不准。 掛到：D 線；polity 空城、債與地契；底色 1.5、1.7。

`content/lore/places/houston-wells.json`：舊能源公司靠地熱井守下港口，掌配給與民兵，國家的徵召處仍在。 掛到：magnates 能源；polity 公司城；底色 1.4。

`content/lore/places/panama-locks.json`：商團與獵團拿閘門當牆守市場，靠自己的城約過夜，沒有傘有義務來救。 掛到：city-types 自由城市；底色 1.4。

`content/lore/places/rio.json`：崩年後靠走私路活起來的港，幫派收費守牆，替蝕域流出的貨記帳。 掛到：city-types 黑幫城市；聖保羅蝕域與環線；底色 1.5。

`content/lore/places/brasilia.json`：本來就在內陸的巴西首都，接住沿海退來的人，商人坐進議會算護航費。 掛到：2090 聖保羅失守；before-collapse-powers；底色 1.6。

`content/lore/events/renaming-day.json`：美國換調度文件的名字，諸城卻對自己是受調度還是被併入各有讀法。 掛到：N06 之後；G 線；底色 1.6、1.10。

`content/lore/events/trade-route-charter.json`：拉美按商路分護航費，各國保有席位；基多簽字，卻把兵與古代機留在山裡。 掛到：G 線；N06 之後；2101 環線護航；底色 1.4。

`content/lore/events/xingtian-registry.json`：國家想把刑天登成資產，學會不肯，法條也沒這一欄；最後誰都沒登成。 掛到：N08；2106 浦那陷落、獵牌法；B 線。

`content/lore/timeline.json`：純插入「改名的日子」「商路約」「刑天的戶籍」，各在同年既有年-only 條目後、月份條目前；既有條目順序與值全部保留。掛到：N06／G 線、N08／B 線。

`content/lore/places/montreal.json`：只在 factions 尾端加 faction/north-american-umbrella。掛到：G 線的調度歸屬裂痕、N08 後刑天保管爭議。

`content/lore/places/mexico-city.json`：只在 factions 尾端加 faction/north-american-umbrella。掛到：G 線的墨西哥城歸屬裂痕。

## 產出

內容位於工作目錄 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-am/wt-am-01/`，新增 12 檔、既有檔插入 3 檔，共 15 檔。報告與審查表位於本目錄，審查表為 `review-rows.json`，12 列且每列白話不超過 60 字。沒有新增具名人物或規格外專名，沒有 commit。開場已有未追蹤的 node_modules 連結，保持原狀；不計為本批產出。臨時腳本與檢查輸出均在 `/tmp/cx-am-01/`。

固定四條驗收證據：

1. 每檔寫完均執行 lore check；最終插入墨西哥城後輸出 `errors=0 warnings=2`，見 `/tmp/cx-am-01/mexico-city-check.log`。改前同為 2 warnings，見 `/tmp/cx-am-01/lore-before.log`。兩條均為既有事件 busan-returned-seal、dark-quay-surety 未入年表，沒有增加。最終為勢力 34、人物 65、事件 74、地點 56、時代 7、年表 130 條。按指定順序先寫勢力時的新地點引用錯誤，及事件入年表前的暫時警告，已隨後續指定檔案完成消除；地點空 aka 的未登記欄位警告已修正。
2. 全部內容完成後執行一次 `npm run check`，末行 `OK 0 errors, 8 warnings`，見 `/tmp/cx-am-01/npm-check.log`。依交接書未跑 npm test 或其他額外驗收。
3. 12 個新檔存在且檔名等於 id name 段，body 全部為 300–1500 字；最大 686 字。以 HEAD 的三個既有 JSON 逐值比對：移除指定新增陣列元素後完全相等，timeline 既有順序不動；內容變動路徑恰為指定 15 檔。領導的 content_gate 留由領導執行。
4. 本 REPORT 開頭逐行列出指定先讀路徑；review-rows.json 以 tabledb 建立並核對 12 列及白話字數，白話最長 34 字。

子代理 0 個：本批由 cx-am-01 親讀與撰寫，沒有額外代理成本；品質證據為上述固定四條及逐檔掛點。

## 沒做到或證據不足的

無未完成的指定內容。未擴充 schema、索引或引擎。事件欄位遵循 lore README 的事件專屬契約與 check.ts，不含 gameRefs；有該欄的 3 勢力與 6 地點一律為空陣列。沒有把北美 B 級量產提案寫成已成軍實績，也沒有替刑天認主留答案。

## 需要決定的事

丹佛作為美國政府遷入地是本批提案。依交接書，百科正文已按外界既成事實落筆，請領導保留此提案供確認；依據 polity「首都在海邊的把政府搬進山裡」通則與底色 1.6。

維拉科查不得離開安地斯的要求，與既有 quito、ring-caravan、ring-road、sao-paulo-blight 等檔的二一〇一年環線首航敘述有張力：舊文曾寫它跟車至聖保羅蝕域外環。本批保留所有舊文，新商路約只寫二一〇二年總督加上不離安地斯條款，沒有重述出山行程；歷史行程與限制生效時間仍需領導統一。另不把舊文的「二十年」罵名或刻痕亮動敘述帶入新文。

欄位文件有落差：README 通用欄提到 aka，但 check.ts 未把 aka 登記為地點欄；交接書 gameRefs 一律空陣列與 README 事件不設該欄的規則亦有字面差異。本批採各類專屬契約，以符合零新增警告，不擴欄位；後續若要讓事件也帶 gameRefs，需另線改格式契約與 checker。

無新造的規格外概念詞。「城約」沿用交接書與 city-types 已點名的提案名；北美跟進 B 級量產仍維持 N09 提案地位。

## 以後交接書該點名的工具

本次點名的 lore check、npm run check、inbox_poll、inbox_mail 與 tabledb 已足夠。git status／diff／show 可供確認範圍與純插入；scratch 腳本固定留在 /tmp。交接書宜註明先勢力後地點時引用錯誤可暫存、以最後一次完整檢查為準，以及 gameRefs 按事件專屬格式省略。固定四條做完即停，不加驗。

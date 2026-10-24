# cx-bat-scen-a 完成報告

## 做了什麼

依交接書新增指定八個戰鬥情境，已親讀指定 AGENTS.md、wf 工作流、內容契約、世界觀裁示、範本、目標判定與 scenarioToSetup。收到 2026-10-24 11:03 上游 orders 後，另讀 content/lore/style.md；以下作戰代號與鉤子依太空歌劇用語撰寫。

只新增本線八個 scenario，以及本目錄 REPORT.md、measure.jsonl，共十個交付檔；未改既有檔、未 commit。只用交接書允許的既有 frame、monster 與七位 person；未用 moji-tern-guard。人物依 bodyplan 分配 pilot／soul 座。五個結盟情境均顯式宣告 allies、給勢力友軍 AI，友軍數量大於玩家；清巢友軍為玩家兩倍。護送三個友方 slot 兩兩結盟。所有單位使用無重疊的固定部署格，避開地圖無法步行的格子，沒有借用不存在的 deployZones 鍵。

每寫完一個情境均在專案根執行 npm run check，再跑 node src/sim/measure.ts scenario/<id> 1 2 3。高架橋初版及移近部署版皆零交戰，查明既有機械機無攻擊能力後，改用已提交的生物／屍體鐮肢，重新檢查與量測合格。measure.jsonl 僅保留各情境最終配置的三筆原始量測結果，加 scenario 欄，其餘欄值未加工。

固定三條驗收已完成，依指示停止追加調整：八個指定檔存在，各次內容檢查均 OK 0 errors, 0 warnings；measure.jsonl 正好 24 行且無拋錯；八情境皆符合 winner 非 null 或 timeout 且 deaths > 0。實際為 18 筆有勝方、6 筆有死亡的平手，全部 24 筆都有死亡，waitRatio 皆為 0；沒有一輪內全滅或二十輪零交戰的最終結果。最後一次 npm run check 同樣為 OK 0 errors, 0 warnings，未遭其他線內容錯誤阻塞。八個 scenario 最大為 waste-encirclement.json 的 4,260 bytes，低於 50 KB。

## 產出

情境根路徑：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/`，下列 id 的末段即檔名（加 `.json`）。量測原始輸出：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-scen-a/measure.jsonl`。

下表 seed 欄依序為 winner／reason／rounds；null 表示平手。陣營簡稱的實際 faction id 由各檔 slots 定義；燕鷗指 frame/moji-tern、獵犬指 frame/hound-mk2、生物／屍體鐮肢指 bio-reaper／corpse-reaper，野生鐮肢與蝕蟲指 monster/reaper-c／mite-d。

| id | 地圖 | 陣營與單位數 | 目標 | 作戰代號與一句劇情鉤子 | seed 1 | seed 2 | seed 3 |
|---|---|---|---|---|---|---|---|
| scenario/hive-burrow-clearing | map/hive-burrow-24 | player 候鳥號 2（獵犬／燕鷗各1）＋ally 殘聯 4（獵犬2／燕鷗2）；enemy 蟲群6（鐮肢1／蝕蟲5） | 雙方 eliminate | 「萬巢聖壁・折冠」：殘聯大隊踏入活著的聖壁，獵團收下那份必須親手斬斷的巢冠。 | null / timeout / 20 | null / timeout / 20 | null / timeout / 20 |
| scenario/glade-spore-hold | map/mycelium-glade-32 | player 候鳥號2（燕鷗／獵犬各1）＋ally 達卡4（獵犬2／燕鷗2）；enemy 蟲群6（鐮肢2／蝕蟲4） | player hold 8輪，zone 為 x14–17、y15–18；enemy eliminate | 「祈夢林・不熄之繭」：達卡守軍在孢光下圍住最後的夢繭，傭兵的誓言只需撐到晨歌響起。 | null / timeout / 20 | enemy / eliminate / 12 | enemy / eliminate / 15 |
| scenario/tidal-flat-evac | map/tidal-flat-40x30 | player 候鳥號2（燕鷗／獵犬各1）＋ally 第七哨4（獵犬2／燕鷗2）＋convoy 第七哨徒步2；enemy 蟲群6（鐮肢1／蝕蟲5） | player escort frame/infantry 全部撤離；enemy killTarget 同 def 全滅 | 「潮神喉・歸舟誓」：第七哨背對甦醒的潮神護住歸舟者，誰也不肯讓最後一雙腳印留在裏側。 | enemy / killTarget / 9 | enemy / killTarget / 7 | enemy / killTarget / 7 |
| scenario/crater-three-way | map/lunar-crater-36 | player 候鳥號2（燕鷗／獵犬各1）；enemy 白手套2（燕鷗＋glove soul）；third 潮信會3（生物鐮肢／屍體鐮肢／生物蝕蟲各1） | 三方各自 eliminate | 「灰燼渦・三王無冠」：獵團、白手套與解拘者同赴月冠之下，沒有誰願把醒來的殼讓給另一位王。 | third / eliminate / 12 | third / eliminate / 12 | null / timeout / 20 |
| scenario/overpass-wager | map/ruined-overpass-48x32 | player 候鳥號2（生物鐮肢2）＋third 鐵砧3（屍體鐮肢3）；enemy 鹽鷗6（屍體鐮肢6） | player eliminate slots=[enemy]；enemy eliminate slots=[player,third] | 「折翼天橋・雙旗賭命」：鐵砧與鹽鷗在斷橋兩端押上旗幟，獵團選了鐵砧，也把自己的歸途押進夜裡。 | player / eliminate / 15 | enemy / eliminate / 9 | null / timeout / 20 |
| scenario/waste-encirclement | map/mineral-waste-64x40 | player 候鳥號2（生物／屍體鐮肢各1）＋ally 殘聯6（屍體鐮肢6）；enemy 蟲群9（鐮肢3／蝕蟲6） | player killTarget monster/reaper-c 全滅，或 survive 12輪；enemy eliminate | 「巨獸晶原・六翼合圍」：殘聯六翼在晶原收攏，受雇的獵團守住缺口，等鐮肢把最後一聲長嘶留給群星。 | player / killTarget / 4 | player / killTarget / 4 | player / killTarget / 4 |
| scenario/mirror-survive | map/shard-mirror-28 | player 候鳥號2（生物／屍體鐮肢各1）單幹；enemy 蟲群10（鐮肢2／蝕蟲8） | player survive 10輪；enemy eliminate 優先判定 | 「萬象碎鏡・借命十歌」：鏡中每一張臉都在催獵團留下，兩位駕駛只能用十段未唱完的歸歌向潮借命。 | enemy / eliminate / 7 | enemy / eliminate / 8 | enemy / eliminate / 9 |
| scenario/quarry-duel | map/lunar-quarry-16 | player 候鳥號2（生物／屍體鐮肢各1）；enemy 白手套2（燕鷗＋glove soul） | player killTarget frame/moji-tern 全滅；enemy eliminate | 「掘星庭・雙魂索債」：白手套守在月壤深處等候還債，獵團帶著兩具半肉半鐵的殼前來討回自己的名字。 | player / killTarget / 10 | player / killTarget / 10 | player / killTarget / 8 |

清巢 ally 使用 focus-fire；守點 ally 使用 bodyguard（玩家量測採 sniper-perch 留守）；護送 convoy 使用 convoy-runner、ally 使用 bodyguard；月坑 third 使用 tide-cultist；高架雙方勢力使用 focus-fire；礦原 ally 使用 focus-fire；礦場 enemy 使用 sniper-perch。月坑 light=0.25、高架 light=0.4、礦場 light=0.2；潮灘沿用地圖 tide 的分段漲落，沒有覆寫地圖。所有情境 rounds=20、seed=2108；量測依指令覆寫為 seed 1、2、3。

敵方 eliminate／killTarget 以 for:enemy、onComplete:win 表示玩家失敗路徑。沒有使用 for:player、onComplete:lose，因現行多人 lose 會挑「其他仍存活 slot 字典序第一個」當勝方，可能誤給 ally。護送的 frame/infantry 僅存在 convoy，killTarget／escort 均會映射到兩位護送對象；礦場的 frame/moji-tern 僅在 enemy，目標不會包含玩家機。

## 沒做到或證據不足的

固定驗收通過，不代表所有目標分支或戰術平衡已證明。清巢三 seed 全是有傷亡平手；守點沒有 hold 勝利；護送三 seed 全為敵方 killTarget；鏡原三 seed 都在第 7–9 輪敗北，尚未出現 survive 勝利。礦原雖有 survive 備援，三 seed 都先完成 killTarget。未額外加跑其他 seed、手操、GUI 或新驗收條目。

既有 frame/moji-tern、frame/hound-mk2 沒有 innateAbilities；UnitSpawn 無 components 欄，scenarioToSetup 也不會替它們掛攻擊部件。這解釋了高架原配置即使移近仍零攻擊；高架已改用有內建攻擊的既有機體。清巢、守點、護送及月坑的玩家／勢力機械機仍保留原配置，其有交戰數據不能當成雙方都能有效反擊的證據。白手套兩場維持交接書指定的燕鷗＋glove soul，沒有攻擊能力，礦場勝利尤其不能當成人對人平衡通過。上述限制已透過 PROGRESS 回報；未越界修改 frame、src 或加入禁用 guard。

## 需要決定的事

本線固定驗收無阻塞。上游可另案決定是否讓情境支援裝備、提供機體預設武器，或開放已配武器的白手套機型；本線不得自行擴充這些契約。

目標意識仍需獨立證據：護送三次皆未完成 escort，守點三次皆未完成 hold，現有量測不能分清是護衛火力不足、路徑或「AI 不懂得追目標」。後續若要驗證 AI 護送／守點，應先解決無攻擊配置，再由對應線確認目標策略；本線不以推測宣稱 AI 已支援或已失效。友軍更大、allies 成立與使用指定 AI 已落在資料；戰中補給未在本線擴充，地圖線的補給事件仍不代表實際補充資源。

**以後交接書該點名的工具**

`wf/tools/inbox_poll.sh cx-bat-scen-a --once`、`wf/tools/inbox_mail.sh cx-bat-scen-a --up …`、`git ls-tree --name-only HEAD content/base/frames/`、`npm run check`、`node src/sim/measure.ts <scenario id> 1 2 3`，以及 `src/rules/objectives.ts`、`src/sim/run.ts`、`src/rules/command.ts` 的 abilitiesOf 與 UnitSpawn 型別。交接時應明列「frame 的 innateAbilities 與情境裝備支援」檢查，避免把可載入機體當作已配武器機體。所有 npm／node 指令均於專案根執行。

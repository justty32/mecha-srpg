# cx-mon-insect 完成回報

## 做了什麼

依交接書與 design.md 完成蟲族 21 個新內容檔，只執行固定四條驗收。未改既有內容、src、spec、registry、AI profile；未 commit。

固定驗收結果：
1. 最終 npm run check：exit 0，末行 `OK 0 errors, 0 warnings`。第一批亦為 0／0；第二批曾遇其他線 `effect/kx-pod-bloom → species/pod` 尚未落地，等兩分鐘後重跑已消失。
2. git status --short content/base 按本線 21 路徑核對，皆為 `??`；本線既有檔修改 0。內容檔最大 4346 bytes；連 REPORT、runner、scratch pack 與兩情境共 26 檔，未超容量或件數 gate。
3. bodyplan HP 均與目標相同，偏差 0%；計算為所有部位所有層 HP 加總。
4. 兩場各 seeds 1／2／3 全無 THROW、exit 0；野怪場每 seed 新能力 4/6、生物機甲場每 seed 5/6，均至少 2/3；合計 5/6。

HP 計算輸出：
```json
{"id":"bodyplan/insect-lancewing","parts":{"heart-shrine":120,"crown":50,"left-wing":50,"right-wing":50,"sting":60,"lantern":90},"hp":420,"target":420,"deviationPercent":0,"passGate":true}
{"id":"bodyplan/insect-siegebeetle","parts":{"gate-mantle":500,"horn":200,"heart-shrine":310,"fore-legs":130,"mid-legs":130,"hind-legs":130},"hp":1400,"target":1400,"deviationPercent":0,"passGate":true}
```

開工前 content/lore 無提交；收尾查得 `ddba924`，親讀 README.md 與 style.md，確認弔燈蜂、叩闕甲、九闕喪鐘、萬巢收租及招式／部位名符合風格，不需改名；之後再跑 check 為 0／0。

## 產出

以下每個內容新檔一行；連結為絕對路徑，列 id、中文名、等級及定位。能力／效果無獨立 grade 欄。

- [species/lancewing](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/species/lancewing.json)：弔燈蜂；C／B；飛刺與傳詔支援。
- [species/siegebeetle](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/species/siegebeetle.json)：叩闕甲；B／A；重殼撞陣。
- [bodyplan/insect-lancewing](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/bodyplans/insect-lancewing.json)：弔燈蜂體；C／B；雙翼分部位；HP 420。
- [bodyplan/insect-siegebeetle](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/bodyplans/insect-siegebeetle.json)：叩闕甲體；B／A；三對足與腹底核；HP 1400。
- [frame/bio-lancewing](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/bio-lancewing.json)：生物機甲・弔燈蜂；C；拘束後飛刺機體，burden 6。
- [frame/bio-siegebeetle](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/frames/bio-siegebeetle.json)：生物機甲・叩闕甲；B；拘束後攻堅機體，burden 9。
- [monster/lancewing-c](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/monsters/lancewing-c.json)：弔燈蜂（繼承物種名）；C；飛刺主力。
- [monster/lancewing-b](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/monsters/lancewing-b.json)：弔燈蜂（繼承物種名）；B；飛刺專職。
- [monster/siegebeetle-b](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/monsters/siegebeetle-b.json)：叩闕甲（繼承物種名）；B；重甲衝陣。
- [monster/siegebeetle-a](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/monsters/siegebeetle-a.json)：叩闕甲・九闕喪鐘；A；命名攻城蟲。
- [monster/nestmother-bell-tithe](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/monsters/nestmother-bell-tithe.json)：巢母・萬巢收租；A；第二隻命名巢母。
- [ability/kx-acid-sting](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/kx-acid-sting.json)：蝕露弔針；—（C／B 使用）；acid 14 並掛蝕露。
- [ability/kx-wing-dive](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/kx-wing-dive.json)：垂幡墜星；—（C／B 使用）；pierce 18，cd 2。
- [ability/kx-horn-ram](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/kx-horn-ram.json)：叩闕；—（B／A 使用）；kinetic 26 並裂殼，cd 2。
- [ability/kx-carapace-brace](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/kx-carapace-brace.json)：闔殼封闕；—（B／A 使用）；自身防護，cd 3。
- [ability/kx-tremor-stamp](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/kx-tremor-stamp.json)：六跪地鳴；—（B／A 使用）；radius 1、kinetic 15，cd 3。
- [ability/kx-brood-call](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/abilities/kx-brood-call.json)：萬巢傳詔；—（C／B 使用）；自身格為中心、radius 3 友方增益，cd 3。
- [effect/kx-acid-drench](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/kx-acid-drench.json)：蝕露浸身；—；2 回合每 tick acid 4。
- [effect/kx-shell-cracked](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/kx-shell-cracked.json)：聖殼崩紋；—；2 回合 evasion −8。
- [effect/kx-carapace-braced](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/kx-carapace-braced.json)：閉闕；—；1 回合 evasion +18、initiative −3。
- [effect/kx-hive-pheromone](/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/kx-hive-pheromone.json)：萬巢同詔；—；2 回合 accuracy +8、initiative +2。

臨時產物共四檔：[/tmp/cx-mon-insect/run.ts](/tmp/cx-mon-insect/run.ts)（指定 runner 原樣複製）、[pack.json](/tmp/cx-mon-insect/pack/pack.json)、[野怪情境](/tmp/cx-mon-insect/pack/scenarios/insect-wild.json)、[生物機甲情境](/tmp/cx-mon-insect/pack/scenarios/insect-bio.json)。地圖為 base:map/rift-edge-60，近距離平地部署；野怪場保留範本玩家四台機與駕駛員、敵方全部 5 隻新 monster；生物機甲場各一台新 bio frame、pilot 陳小海，敵方三隻鐮肢。沒有加入 repo scenarios。

煙霧命令：`node /tmp/cx-mon-insect/run.ts scenario/insect-wild 1 2 3`。
```json
{"seed":1,"winner":"enemy","reason":"eliminate","rounds":9,"hits":142,"misses":182,"deaths":4,"abilities":{"base:ability/reaper-charge":3,"base:ability/reaper-cleave":49,"base:ability/rearguard-oath":8,"base:ability/kx-wing-dive":9,"base:ability/kx-acid-sting":121,"base:ability/kx-horn-ram":9,"base:ability/kx-tremor-stamp":6,"base:ability/nest-birth":3,"base:ability/root-drag":38,"base:ability/mite-swarm-bite":75,"base:ability/shell-lance":3}}
{"seed":2,"winner":"enemy","reason":"eliminate","rounds":11,"hits":188,"misses":281,"deaths":5,"abilities":{"base:ability/reaper-cleave":73,"base:ability/rearguard-oath":8,"base:ability/kx-wing-dive":10,"base:ability/kx-acid-sting":121,"base:ability/kx-horn-ram":12,"base:ability/kx-tremor-stamp":8,"base:ability/nest-birth":4,"base:ability/root-drag":69,"base:ability/mite-swarm-bite":158,"base:ability/shell-lance":3,"base:ability/reaper-charge":3}}
{"seed":3,"winner":"enemy","reason":"eliminate","rounds":11,"hits":157,"misses":198,"deaths":6,"abilities":{"base:ability/reaper-charge":4,"base:ability/reaper-cleave":62,"base:ability/rearguard-oath":7,"base:ability/kx-wing-dive":12,"base:ability/kx-acid-sting":154,"base:ability/kx-tremor-stamp":8,"base:ability/kx-horn-ram":12,"base:ability/nest-birth":4,"base:ability/root-drag":30,"base:ability/mite-swarm-bite":52,"base:ability/shell-lance":4}}
```

煙霧命令：`node /tmp/cx-mon-insect/run.ts scenario/insect-bio 1 2 3`。
```json
{"seed":1,"winner":"enemy","reason":"eliminate","rounds":8,"hits":81,"misses":103,"deaths":1,"abilities":{"base:ability/kx-carapace-brace":1,"base:ability/kx-tremor-stamp":3,"base:ability/kx-horn-ram":4,"base:ability/kx-wing-dive":1,"base:ability/kx-acid-sting":14,"base:ability/reaper-cleave":158,"base:ability/reaper-charge":1}}
{"seed":2,"winner":"enemy","reason":"eliminate","rounds":9,"hits":73,"misses":142,"deaths":1,"abilities":{"base:ability/kx-carapace-brace":1,"base:ability/kx-tremor-stamp":3,"base:ability/kx-horn-ram":4,"base:ability/kx-wing-dive":2,"base:ability/kx-acid-sting":21,"base:ability/reaper-cleave":180,"base:ability/reaper-charge":1}}
{"seed":3,"winner":"enemy","reason":"eliminate","rounds":10,"hits":105,"misses":155,"deaths":2,"abilities":{"base:ability/kx-carapace-brace":1,"base:ability/kx-tremor-stamp":3,"base:ability/kx-horn-ram":4,"base:ability/kx-wing-dive":1,"base:ability/kx-acid-sting":14,"base:ability/reaper-cleave":232}}
```

## 沒做到或證據不足的

npm test 依約只跑一次：exit 1，tests 96、pass 93、fail 3、cancelled 0、skipped 0、todo 0。這是本次沙箱輸出的檔案級計數，不能當完整案例數。失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/crew/restraint.test.ts`；均僅顯示 testCodeFailure／ERR_TEST_FAILURE、子程序 exitCode 1，輸出不足以歸因，未宣稱全測試通過。按交接書交領導在外面重跑，未增驗收條件或修改別線。

`kx-brood-call` 未出現在這六場 abilities 計數；`kx-carapace-brace` 只在生物機甲場出現。已達固定 2/3 門檻，因此不額外增加場次或改 AI。煙霧僅驗可執行與能力覆蓋，不代表平衡已驗證。

## 需要決定的事

固定四條驗收皆完成，可依既定流程收件；請領導按原交接安排於沙箱外重跑 npm test，釐清三個失敗檔。本線沒有需使用者裁示的項目。

以後交接書該點名的工具：沿用本次 inbox_mail.sh／inbox_poll.sh、tabledb.py、npm run check、npm test、指定 run.ts、git status／git log 即足夠；保留 npm test 的計數限制提醒。


# cx-bat-field 完成報告

## 做了什麼

新增 17 種地形、6 種地形效果、15 張地圖，以及標準庫產生器；連本報告共 40 個交付檔，未超過 45 檔。最大地圖 badlands-128 為 41,905 bytes，低於 400 KB。未修改既有內容、registries、src、world 或正式 scenarios；未 commit。

已親讀交接書指定規格及工作流；上線已寄 PROGRESS，每步以 inbox_poll 收 orders。依 2026-10-24 11:05 上游更新，17 個地形 name、6 個效果 name／badge 與地圖設計句均改為太空歌劇語氣；id、glyph、機制保持交接書要求。MapDef 沒有 name 欄，地圖的風格命名表現在下表設計句。

效果均為 mech scope、refresh。五種屬性效果用 ownerTurns n=2：現行 beginTurn 在掛地形效果後立即 tick，設 2 才能在本回合行動時維持貢獻；離開後下個自身回合移除。補給事件用 n=1、onApply，當回合觸發即移除。月夜加值為 battle.light × 4 − 4；潮流加值為 battle.tide × −2。

補給缺池驗證先實跑 pool 版本，得到 `Error: 缺少池：player-0.ammo-30`（src/rules/pools.ts:58）。依交接書退回 `do: emit`、事件 `FieldResupplyRequested`、payload `{ammo30:4}`；缺池臨時情境重跑不拋錯。**戰中補給需要規則支援**，目前補給碑只發事件、不增加彈藥。

## 產出

交付根目錄：`/home/lorkhan/repo/game_dev/mecha-srpg`。

- 地形：`content/base/terrains/`，新增檔名見下。
- 效果：`content/base/effects/bf-{spore-choke,mirror-glare,vacuum-gloom,dust-blind,tide-drag,field-resupply}.json`。
- 地圖：`content/base/maps/`，十五個檔名與下表 id 的末段相同。
- 產生器：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/gen_maps.py`。
- 本報告：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/REPORT.md`。

地形新檔（皆 `.json`）：hive-wall、hive-tunnel、chitin-rubble、mycelium-mat、spore-bloom、mineral-waste、shard-mirror、lunar-regolith、crater-rim、regolith-pit、tidal-flat、tide-channel、ruin-tower、ruin-street、overpass、barricade、supply-depot。

每張圖各 zone 均 16 格；各圖有 features 個別 hp（14 張各 3 格、lunar-quarry-16 為 2 格）。潮汐 pick：每 k 輪一階，round 1…k=0、k+1…2k=1、2k+1…3k=2、3k+1…4k=1、其後=0。四邊表示 N/E/S/W；exits 只列指定邊的可步行格且排除角落。

| id | 尺寸 | zones 格數 | exits 邊 | globals | 設計意圖 |
|---|---|---|---|---|---|
| map/hive-burrow-24 | 24×24 | player=16, enemy=16 | 南 | — | 萬巢聖壁交錯形成折返主道，兩側碎甲通廊可繞後。 |
| map/mycelium-glade-32 | 32×32 | player=16, enemy=16, ally=16 | 西 | light 0.6 | 祈夢孢林圍出三條林隙，中央殘牆提供掩蔽，北側淺灘可包抄。 |
| map/tidal-flat-40x30 | 40×30 | player=16, enemy=16, ally=16 | 北 | tide：0→1→2→1→0，每4輪一階 | 兩道潮神裂渠切開退潮之喉，三道殘高架作渡口，南側碎石堤形成側翼。 |
| map/lunar-crater-36 | 36×36 | player=16, enemy=16, third=16 | 北、東、南、西 | light 0.25 | 月冠環脊包圍靜海灰燼渦，東西鞍口通往中央，南北外緣可迂迴。 |
| map/ruined-overpass-48x32 | 48×32 | player=16, enemy=16, third=16 | 東、西 | light 0.4 | 失落王庭尖塔沿折翼天橋分列，中央缺口迫使下橋，南北街廓提供側翼。 |
| map/mineral-waste-64x40 | 64×40 | player=16, enemy=16, ally=16 | 西 | — | 巨獸晶原展開漫長衝鋒之路，錯列殘牆分段遮蔽，北方乾溝作低地側翼。 |
| map/shard-mirror-28 | 28×28 | player=16, enemy=16 | 北、東、南、西 | light 0.8 | 萬象碎鏡以雙環包覆異界之心，十字碎甲路保持感測窗口，環邊殘牆可伏擊。 |
| map/citywall-breach-40 | 40×40 | player=16, enemy=16, ally=16 | 南 | — | 北側守誓城牆的王門破口承受主攻，雙翼路障與高架掩護南側補給街區。 |
| map/delta-ruins-56 | 56×56 | player=16, enemy=16, ally=16, third=16 | 北、東 | tide：0→1→2→1→0，每3輪一階 | 分汊潮神裂渠穿過四座失落王庭，高架渡口控制中心，四方部署可爭奪支流側翼。 |
| map/ancient-shell-30 | 30×30 | player=16, enemy=16, third=16 | 南 | light 0.5 | 古殼聖殿的地磚長廳由殘柱列分成三路，中央高台與北側淺水槽構成交火焦點。 |
| map/nest-core-72 | 72×72 | player=16, enemy=16, ally=16 | 西 | — | 外圈蝕地通向萬巢聖壁的雙重王冠，放射巢道穿越缺口，側向碎甲環路連結各入口。 |
| map/convoy-road-80x20 | 80×20 | player=16, enemy=16, ally=16 | 東 | — | 盟約巡行之路自西向東，三組錯位路障迫使換道，中段斷橋與南側野地形成風險選擇。 |
| map/lunar-quarry-16 | 16×16 | player=16, enemy=16 | 北 | light 0.2 | 靜海掘星庭以雙側月冠環脊夾住灰燼低地，東側補給台與北側礦道構成短距爭奪。 |
| map/beachhead-44x36 | 44×36 | player=16, enemy=16, ally=16 | 南 | tide：0→1→2→1→0，每4輪一階 | 南岸退潮之喉穿越潮神裂渠上岸，三處巢壁缺口通往北側巢道，兩翼高架可交叉支援。 |
| map/badlands-128 | 128×128 | player=16, enemy=16, ally=16, third=16 | 北、東、南、西 | light 0.7 | 西部凡土與淺蝕斑逐漸過渡到東部四族的異界領土；河橋、廢城與裂縫巢核形成三個爭奪區，四部署區中心相距60格曼哈頓距離。 |

badlands-128 四個部署區中心約 (33.5,63.5)、(93.5,63.5)、(63.5,33.5)、(63.5,93.5)：兩兩曼哈頓距離 60 格，歐氏距離約 42.4–60 格，未置於對角兩端。

固定四項驗收：

1. 在專案根執行 `npm run check`，末行：

```text
OK 0 errors, 0 warnings
```

2. `git status --short content/base`：本線新增 terrains=17、maps=15、effects/bf-*=6，皆為 `??`。既有 terrains/maps/effects 修改數 0；其他線的 untracked 檔不計入本線。完整當時輸出保留 `/tmp/cx-bat-field/git-status.log`。

3. `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/gen_maps.py --check-only` 自檢輸出如下。另用記憶體副本將 enemy 第一格換成 player 第一格，自檢以「部署重疊」拒絕；負例未寫入 repo。

```text
PASS map/hive-burrow-24 24x24 player=16 enemy=16 leg=OK overlap=0 exits=S features=3 bytes=3725
PASS map/mycelium-glade-32 32x32 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=W features=3 bytes=5448
PASS map/tidal-flat-40x30 40x30 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=N features=3 bytes=7160
PASS map/lunar-crater-36 36x36 player=16 enemy=16 third=16 leg=OK overlap=0 exits=NESW features=3 bytes=10027
PASS map/ruined-overpass-48x32 48x32 player=16 enemy=16 third=16 leg=OK overlap=0 exits=EW features=3 bytes=7202
PASS map/mineral-waste-64x40 64x40 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=W features=3 bytes=7215
PASS map/shard-mirror-28 28x28 player=16 enemy=16 leg=OK overlap=0 exits=NESW features=3 bytes=7373
PASS map/citywall-breach-40 40x40 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=S features=3 bytes=6369
PASS map/delta-ruins-56 56x56 player=16 enemy=16 ally=16 third=16 leg=OK overlap=0 exits=NE features=3 bytes=12816
PASS map/ancient-shell-30 30x30 player=16 enemy=16 third=16 leg=OK overlap=0 exits=S features=3 bytes=5259
PASS map/nest-core-72 72x72 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=W features=3 bytes=11121
PASS map/convoy-road-80x20 80x20 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=E features=3 bytes=5540
PASS map/lunar-quarry-16 16x16 player=16 enemy=16 leg=OK overlap=0 exits=N features=2 bytes=3025
PASS map/beachhead-44x36 44x36 player=16 enemy=16 ally=16 leg=OK overlap=0 exits=S features=3 bytes=7805
PASS map/badlands-128 128x128 player=16 enemy=16 ally=16 third=16 leg=OK overlap=0 exits=NESW features=3 bytes=41905
PASS maps=15 terrains=17 effects=6 delivery-files=40 (含 gen_maps.py、REPORT.md)
```

4. 臨時情境三張各 seed=1 一次，以 measure 相同邏輯跑 20 輪，全部正常退出、無例外。依交接書允許自寫載入腳本，`/tmp/cx-bat-field/measure.ts` 由 `src/sim/measure.ts` 複製，僅改兩個 import 為絕對路徑、loadContentDirs 增加 `/tmp/cx-bat-field/pack`；情境及 pack 全留 /tmp。每圖沿用既有 skirmish 的雙方各前兩台單位，使用新圖 zone。未修改正式 measure 或 scenarios。

`node /tmp/cx-bat-field/measure.ts bf-probe:scenario/badlands-128 1`（cwd 為專案根）：

```json
{"seed":1,"waitRatio":0,"waits":0,"unitTurns":80,"pass":true,"kinds":{"move":29,"end":80},"winner":null,"reason":"timeout","rounds":20,"hits":0,"misses":0,"deaths":0,"hash":"61074533afc3e566"}
```

`node /tmp/cx-bat-field/measure.ts bf-probe:scenario/tidal-flat-40x30 1`（cwd 為專案根）：

```json
{"seed":1,"waitRatio":0,"waits":0,"unitTurns":80,"pass":true,"kinds":{"move":16,"end":80},"winner":null,"reason":"timeout","rounds":20,"hits":0,"misses":0,"deaths":0,"hash":"b549fb345fff8921"}
```

`node /tmp/cx-bat-field/measure.ts bf-probe:scenario/lunar-crater-36 1`（cwd 為專案根）：

```json
{"seed":1,"waitRatio":0,"waits":0,"unitTurns":80,"pass":true,"kinds":{"move":13,"end":80},"winner":null,"reason":"timeout","rounds":20,"hits":0,"misses":0,"deaths":0,"hash":"affcea1f897a5f79"}
```

缺池補給退回 emit 後：`node /tmp/cx-bat-field/measure.ts bf-probe:scenario/supply-probe 1`。

```json
{"seed":1,"waitRatio":0,"waits":0,"unitTurns":29,"pass":true,"kinds":{"move":26,"useAbility":31,"end":29},"winner":"player","reason":"eliminate","rounds":15,"hits":18,"misses":13,"deaths":1,"hash":"8ec50c3875bad4c7"}
```

## 沒做到或證據不足的

戰中補給需要規則支援；缺池時 pool 動作會拋錯，已按指定方案退回無害事件。三張圖的 smoke measure 均達 20 輪 timeout，沒有交火；只證明載入、地圖組裝與回合執行不拋錯，不代表平衡、交戰頻率或 AI 尋路品質已驗收。依固定四條驗收不加跑平衡或 GUI 測試。

## 需要決定的事

本線無待決事項。後續若要補給碑實際補彈，需規則線另案處理缺池略過與補給對象／同盟篩選；本線維持已授權的事件 fallback。

**以後交接書該點名的工具**

`wf/tools/inbox_poll.sh cx-bat-field --once`、`wf/tools/inbox_mail.sh cx-bat-field --up …`、`npm run check`、`git status --short content/base`、`python3 gen_maps.py --check-only`、`src/content/loader.ts` 的 `loadContentDirs`，以及可載 scratchpad pack 的 measure 腳本。現行 `src/sim/measure.ts` 固定只載 content/base；本次以 /tmp 副本換載入路徑。所有 npm／node 指令均在專案根執行。

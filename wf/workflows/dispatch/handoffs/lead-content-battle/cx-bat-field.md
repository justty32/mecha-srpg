# 任務：新增 17 種戰場地形（含地形效果）與 15 張地圖

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/common/conventions.md`、`content/README.md`、`wf/workflows/planning/specs/core/content-format.md`、`wf/workflows/planning/specs/core/data-model-world.md`（地形、地圖、globals 潮汐／光照、可破壞格）、`wf/workflows/planning/specs/core/data-model-abilities-effects.md`（EffectDef）、`wf/workflows/planning/specs/world/rifts-and-territory.md`（蝕域深度與四族地貌）、`wf/workflows/planning/specs/world/setting.md`（月面）——**親自讀，不靠本交接書的摘要**。範本：`content/base/terrains/*.json`、`content/base/maps/skirmish-20.json`、`content/base/effects/acid-corrode.json`、`content/base/effects/rooted.json`。

## 背景與唯一目標

本作是 2108 地月機甲對裂獸的文字 SRPG，戰場內容很薄（地形 6 種、地圖 2 張）。本線要讓後續情境有夠多「有世界觀味道」的戰場可用。唯一目標：新增下表的地形、地形效果與地圖，全部通過內容檢查。

## 範圍（排除法寫死）

- 只做：新增 `content/base/terrains/{表中 id}.json`、`content/base/effects/bf-*.json`（地形用的效果，檔名一律 `bf-` 前綴）、`content/base/maps/{表中 id}.json`；地圖產生腳本放 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/gen_maps.py`（python3 標準庫）。
- 不做：改任何既有檔（尤其既有 terrains、`maps/skirmish-20.json`、`maps/rift-edge-60.json`、registries）；`src/`、`content/base/world/`、scenarios、單位內容（frames／monsters／persons／species／components／abilities）。
- 件數 gate：新檔超過 45 個就停下回報；容量 gate：單張地圖 JSON 超過 400 KB 就停下回報（128×128 可用 MapDef 的 `{rle}` 形式或縮短 exits 清單）。任一觸發都停。

## 地形（17 種，id／glyph 寫死，glyph 必須是單一字元且不與既有 `. ~ % : # ≈` 衝突）

`moveCost` 要覆蓋 `leg/track/hover/flight/burrow` 五鍵。數值量級對照既有六種地形。標「可破壞」的填 `destructible{hp,becomes}`。

| id | glyph | 名 | 要點 |
|---|---|---|---|
| terrain/hive-wall | H | 巢壁 | 蟲族深蝕；leg/track/hover 不可、burrow 1；擋視線、cover 35；可破壞 hp 80 → chitin-rubble |
| terrain/hive-tunnel | o | 巢道 | burrow 1、leg 2；cover 20；tags insect,rift |
| terrain/chitin-rubble | c | 甲殼碎場 | leg 2；cover 15 |
| terrain/mycelium-mat | m | 菌毯 | 菌絲深蝕；onEnter 用既有 `effect/rooted`；tags mycelium |
| terrain/spore-bloom | * | 孢子叢 | 擋視線、cover 20；onTurnStart `effect/bf-spore-choke`（perception 下降）；可破壞 hp 20 → mycelium-mat（燒掉） |
| terrain/mineral-waste | + | 礦化荒原 | 獸族深蝕；leg/track 1，平坦無掩蔽（衝鋒距離長）；tags mineral,rift |
| terrain/shard-mirror | / | 碎鏡地 | 異形深蝕；onTurnStart `effect/bf-mirror-glare`（perception 大幅下降、accuracy 小降） |
| terrain/lunar-regolith | _ | 月壤 | 月面；onTurnStart `effect/bf-vacuum-gloom`（perception 加值＝NumExpr 引用 `battle.light`，light 1 時 0、light 0 時 −4）；tags lunar,vacuum |
| terrain/crater-rim | ^ | 環形山脊 | height 2、cover 20、擋視線；leg 3、track null |
| terrain/regolith-pit | u | 月塵坑 | leg 3、track 3、hover 1；onTurnStart `effect/bf-dust-blind`（accuracy 降） |
| terrain/tidal-flat | , | 潮間泥灘 | leg 2、burrow 1；onTurnStart `effect/bf-tide-drag`（initiative 加值＝NumExpr 引用 `battle.tide`，例 mul −2）；tags water,tidal |
| terrain/tide-channel | w | 潮溝 | leg 3、track null、burrow null；onTurnStart `effect/bf-tide-drag`；tags water,tidal,deep |
| terrain/ruin-tower | T | 廢樓 | height 3、cover 40、擋視線；只 flight 可進；可破壞 hp 120 → 既有 terrain/rubble |
| terrain/ruin-street | = | 廢街 | leg/track 1、cover 5；onTurnStart `effect/bf-vacuum-gloom` 不要掛（那是月面）；tags urban,ruin |
| terrain/overpass | n | 斷高架 | height 2、cover 25、leg 2；可破壞 hp 50 → terrain/rubble |
| terrain/barricade | B | 城邦路障 | cover 35、leg/track null、不擋視線；可破壞 hp 40 → terrain/rubble；tags urban,conventional |
| terrain/supply-depot | $ | 補給點 | 友軍設的戰地補給；leg/track 1；onTurnStart `effect/bf-field-resupply`：試做「mech 池 `ammo-30` +4」（`do:"pool"`）。**先用一個 scratchpad 臨時情境驗證單位沒有該池時不會拋錯**；會拋錯就改成無害的 `do:"emit"` 事件並在 REPORT 記「戰中補給需要規則支援」。tags supply |

效果細節（clock、stack、contribs 路徑）照 EffectDef 規格與範本自己決定；`path` 用既有效果出現過的路徑形式（`self.attrs.{屬性 id}`，attr 見 `content/base/registries/attrs.json`）。

## 地圖（15 張）

每張：`deployZones` 至少 `player`（≥8 格）與 `enemy`（≥14 格）；表中列 `ally`／`third` 的另加（各 ≥14 格，ally 大軍用）；各 zone 互不重疊、都在可通行（leg 可進）格上；`exits` 明列撤離邊（表中寫哪邊就只放哪邊）；要有地勢（高低、掩蔽、水、障礙）與 `features`（可破壞地物，至少 3 張用 features 指定個別 hp）。地圖要看得出設計意圖（通道、制高點、側翼），不是純雜訊。

| id | 尺寸 | 主題 | zones | exits | globals |
|---|---|---|---|---|---|
| map/hive-burrow-24 | 24×24 | 蟲巢淺層：巢壁迷宮＋巢道 | player, enemy | 南邊 | — |
| map/mycelium-glade-32 | 32×32 | 菌毯林間、孢子叢成牆 | player, enemy, ally | 西邊 | light 0.6 |
| map/tidal-flat-40x30 | 40×30 | 孟加拉灣潮間帶、潮溝切割 | player, enemy, ally | 北邊 | tide：`battle.round` 分段 pick（0→1→2→1→0 約每 4 輪一階） |
| map/lunar-crater-36 | 36×36 | 靜海市外環形山、月塵坑 | player, enemy, third | 四邊 | light 0.25 |
| map/ruined-overpass-48x32 | 48×32 | 廢城斷高架、廢樓群 | player, enemy, third | 東、西邊 | light 0.4（夜戰） |
| map/mineral-waste-64x40 | 64×40 | 獸族礦化荒原、零星殘牆 | player, enemy, ally | 西邊 | — |
| map/shard-mirror-28 | 28×28 | 異形碎鏡地、環狀 | player, enemy | 四邊 | light 0.8 |
| map/citywall-breach-40 | 40×40 | 城邦牆破口、路障、補給點 | player, enemy, ally | 南邊 | — |
| map/delta-ruins-56 | 56×56 | 三角洲廢城＋潮溝 | player, enemy, ally, third | 北、東邊 | tide 同上但更快（每 3 輪一階）|
| map/ancient-shell-30 | 30×30 | 遺跡「殼」的地磚大廳、殘牆柱列 | player, enemy, third | 南邊 | light 0.5 |
| map/nest-core-72 | 72×72 | 巢核：中央巢壁環＋巢道放射、外圈蝕地 | player, enemy, ally | 西邊 | — |
| map/convoy-road-80x20 | 80×20 | 野地公路（護送）：路障、斷高架 | player, enemy, ally | 只東邊 | — |
| map/lunar-quarry-16 | 16×16 | 月面小礦坑、補給點 | player, enemy | 北邊 | light 0.2 |
| map/beachhead-44x36 | 44×36 | 灘頭攻堅：潮間帶上岸→巢壁陣地 | player, enemy, ally | 南邊 | tide 同上 |
| map/badlands-128 | 128×128 | 野地大圖：淺蝕→深蝕梯度、河、廢城、裂縫核 | player, enemy, ally, third | 四邊 | light 0.7 |

大圖的 zones 彼此距離 40–70 格內（不要放對角兩端，否則 20 輪碰不到面）。尺寸寫 `WxH` 的 id 寬在前。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-bat-field --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-bat-field --up …` | 上線 PROGRESS 與終局回報 |
| `npm run check`（在專案根） | 每批新增後；要 `OK 0 errors` |
| `node src/sim/measure.ts {臨時情境} 1` | 只用 scratchpad 臨時情境驗補給效果與地圖可跑；臨時情境不進 repo（臨時檔放 /tmp/cx-bat-field 底下，用 `src/content/loader.ts` 的 `loadContentDirs([... ,"/tmp/cx-bat-field/pack"])` 或自寫小腳本載入） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與 `/tmp/cx-bat-field/`；可跑 `npm run check`、`npm test`、`node src/sim/measure.ts`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；**不 commit**（commit 由領導做，你只回報改了哪些檔）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：工具或環境出錯（權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的腳本出錯 → 自己修。

## 工作

1. 上線發 PROGRESS。
2. 寫 17 種地形＋所需 `bf-*` 效果；`npm run check` 綠。
3. 驗補給效果（見地形表 supply-depot）。
4. 寫 `gen_maps.py` 產 15 張地圖；`npm run check` 綠；用臨時情境對 badlands-128 與另外 2 張各跑一次 `measure` 確認不拋錯。
5. 寫 REPORT 並回報。

## 交付

REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/REPORT.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 地形 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/terrains/`（17 個新檔） |
| 效果 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/effects/bf-*.json` |
| 地圖 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/maps/`（15 個新檔） |
| 產生腳本 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/gen_maps.py` |

REPORT 四段（做了什麼／產出（每張地圖一行：id、尺寸、各 zone 格數、exits 邊、globals、設計意圖一句）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，做完就停）

1. `npm run check` 末行 `OK 0 errors, 0 warnings`。
2. `git status --short content/base` 中本線新增的檔：17 個 terrains、15 個 maps、若干 `effects/bf-*`；沒有任何既有檔被改（`git status --short content/base | grep '^ M'` 不含 terrains/maps/effects）。
3. 每張地圖各 zone 格數符合上表下限、zone 格 leg 可進且互不重疊（REPORT 附 gen_maps.py 自檢輸出）。
4. 臨時情境 measure 三張圖各一次不拋錯（REPORT 附 JSON 行）。

## 失敗怎麼處置

- 測出來是壞的 → 修到綠；修不好就移除該件並在 REPORT 記，發 `FAILED` 只在全部都做不出時。
- 測不出來（沒跑成）→ 不回滾，發 `BLOCKED`，寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bat-field`。本線團隊：`teams/content-battle`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-bat-field --up {STATUS} '{一句自足結論}' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-battle/cx-bat-field/REPORT.md`。
- 結束時必發 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一；卡住超過 10 分鐘先發 `BLOCKED`。標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

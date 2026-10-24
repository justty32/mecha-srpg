# cx-mon-beast：獸族 38 檔完成固定四條驗收

## 做了什麼

只新增獸族 38 個內容 JSON；未修改既有檔、src、registry、pack 或 repo 情境；未 commit。四條固定驗收均通過：

1. 最後 `npm run check`：`OK 0 errors, 0 warnings`（`/tmp/cx-mon-beast/check-final.log`）。
2. `git status --short content/base` 依本線清單篩出 38 個 `??`、0 個既有檔修改；完整輸出在 `/tmp/cx-mon-beast/status-own.log`。
3. 四份 bodyplan HP 精確符合設計，偏差全為 0%。
4. 兩情境各 seed 1／2／3，六場無 THROW；野怪各 8/10 招、生物機甲各 9/10 招，均高於 2/3。

`npm test` 僅執行一次：exit 1，tests 96、pass 93、fail 3、cancelled/skipped/todo 均 0（檔案層級計數；詳見第三段）。

第二批 check 曾遇別線 `frame/ancient-brinemother` 的兩個 ax 能力缺引用；依約等兩分鐘再跑後歸零。開工 lore log 為空；收尾查到 `ddba924`，已親讀 `content/lore/README.md`、`style.md`，新命名符合用語，無需修改。

## 產出

以下路徑皆位於 `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/`；每行一檔，能力／效果的等級表示使用族等級（schema 本身無 grade）。

- [ability/kx-burrow-flank](../../../../../../../../content/base/abilities/kx-burrow-flank.json)｜地底送葬｜C｜射程 1–4、14 穿刺，冷卻 3。（abilities/kx-burrow-flank.json）
- [ability/kx-carrion-gulp](../../../../../../../../content/base/abilities/kx-carrion-gulp.json)｜吞喪續命｜C｜自身增益，冷卻 4；沒有額外治療動詞。（abilities/kx-carrion-gulp.json）
- [ability/kx-cliff-bite](../../../../../../../../content/base/abilities/kx-cliff-bite.json)｜斷崖之吻｜A｜近身 32 穿刺並留下崖吻難合。（abilities/kx-cliff-bite.json）
- [ability/kx-ground-stomp](../../../../../../../../content/base/abilities/kx-ground-stomp.json)｜踏碎星墳｜A｜半徑 1、20 傷害，冷卻 2。（abilities/kx-ground-stomp.json）
- [ability/kx-shield-raise](../../../../../../../../content/base/abilities/kx-shield-raise.json)｜王蓋高擎｜B｜自身王蓋庇身，冷卻 2。（abilities/kx-shield-raise.json）
- [ability/kx-shovel-ram](../../../../../../../../content/base/abilities/kx-shovel-ram.json)｜葬鏟叩門｜C｜近身 16 傷害並使失步。（abilities/kx-shovel-ram.json）
- [ability/kx-spine-sweep](../../../../../../../../content/base/abilities/kx-spine-sweep.json)｜王脊橫天｜S｜射程 1–2、38 傷害。（abilities/kx-spine-sweep.json）
- [ability/kx-star-howl](../../../../../../../../content/base/abilities/kx-star-howl.json)｜仰天喚星｜A／S｜自身格為中心、半徑 4 的友方群星狂奔。（abilities/kx-star-howl.json）
- [ability/kx-tide-crush](../../../../../../../../content/base/abilities/kx-tide-crush.json)｜萬潮覆港｜S｜射程 1–4、半徑 2、28 傷害並施加潮懼。（abilities/kx-tide-crush.json）
- [ability/kx-wall-charge](../../../../../../../../content/base/abilities/kx-wall-charge.json)｜行城壓境｜B｜射程 1–3、22 傷害，冷卻 2。（abilities/kx-wall-charge.json）
- [aiprofile/kx-beast-alpha](../../../../../../../../content/base/aiprofiles/kx-beast-alpha.json)｜群獸王令｜B–S｜tactical；attack 1、buff 0.8、protect 0.6。（aiprofiles/kx-beast-alpha.json）
- [bodyplan/quadruped-bulwark](../../../../../../../../content/base/bodyplans/quadruped-bulwark.json)｜盾甲・行城之軀｜B｜雙層前盾抵住來襲，帶隊衝陣。 HP 總量 950。（bodyplans/quadruped-bulwark.json）
- [bodyplan/quadruped-cliffjaw](../../../../../../../../content/base/bodyplans/quadruped-cliffjaw.json)｜崖牙・負蛻之軀｜A｜背馱舊蛻的潮錨，崖顎撕傷與踏地範圍攻擊。 HP 總量 1900。（bodyplans/quadruped-cliffjaw.json）
- [bodyplan/quadruped-hound](../../../../../../../../content/base/bodyplans/quadruped-hound.json)｜掘犬・墓鏟之軀｜C｜前鏟遊獵，吞屍維持活性，宣告蛻成盾甲。 HP 總量 420。（bodyplans/quadruped-hound.json）
- [bodyplan/quadruped-tidespine](../../../../../../../../content/base/bodyplans/quadruped-tidespine.json)｜潮脊・海嘯王軀｜S｜脊背如潮牆的 S 領主，覆港與橫掃。 HP 總量 4000。（bodyplans/quadruped-tidespine.json）
- [effect/kx-deep-wound](../../../../../../../../content/base/effects/kx-deep-wound.json)｜崖吻難合｜A｜3 回合每 tick 對 flesh 層造成 4 傷害。（effects/kx-deep-wound.json）
- [effect/kx-gorged](../../../../../../../../content/base/effects/kx-gorged.json)｜吞喪餘韻｜C｜3 回合命中 +6、本能回復 −3。（effects/kx-gorged.json）
- [effect/kx-molting](../../../../../../../../content/base/effects/kx-molting.json)｜舊王蛻夢｜C｜永久蛻皮標記，迴避 −10、先攻 −4。（effects/kx-molting.json）
- [effect/kx-pack-frenzy](../../../../../../../../content/base/effects/kx-pack-frenzy.json)｜群星狂奔｜A／S｜2 回合命中 +10、先攻 +3。（effects/kx-pack-frenzy.json）
- [effect/kx-shield-wall](../../../../../../../../content/base/effects/kx-shield-wall.json)｜王蓋庇身｜B｜1 回合迴避 +22。（effects/kx-shield-wall.json）
- [effect/kx-staggered](../../../../../../../../content/base/effects/kx-staggered.json)｜失步｜C｜1 回合先攻 −3、迴避 −5。（effects/kx-staggered.json）
- [effect/kx-tidal-dread](../../../../../../../../content/base/effects/kx-tidal-dread.json)｜滅港潮懼｜S｜施加時士氣檢定 40，1 回合命中 −10。（effects/kx-tidal-dread.json）
- [frame/bio-bulwark](../../../../../../../../content/base/frames/bio-bulwark.json)｜生物機甲・盾甲｜B｜雙層前盾抵住來襲，帶隊衝陣。（frames/bio-bulwark.json）
- [frame/bio-cliffjaw](../../../../../../../../content/base/frames/bio-cliffjaw.json)｜生物機甲・崖牙｜A｜背馱舊蛻的潮錨，崖顎撕傷與踏地範圍攻擊。（frames/bio-cliffjaw.json）
- [frame/bio-hound](../../../../../../../../content/base/frames/bio-hound.json)｜生物機甲・掘犬｜C｜前鏟遊獵，吞屍維持活性，宣告蛻成盾甲。（frames/bio-hound.json）
- [frame/bio-tidespine](../../../../../../../../content/base/frames/bio-tidespine.json)｜生物機甲・潮脊｜S｜脊背如潮牆的 S 領主，覆港與橫掃。（frames/bio-tidespine.json）
- [monster/bulwark-b](../../../../../../../../content/base/monsters/bulwark-b.json)｜盾甲｜B｜雙層前盾抵住來襲，帶隊衝陣。（monsters/bulwark-b.json）
- [monster/cliffjaw-red-eye](../../../../../../../../content/base/monsters/cliffjaw-red-eye.json)｜崖牙・赤眼兇星｜A｜背馱舊蛻的潮錨，崖顎撕傷與踏地範圍攻擊。（monsters/cliffjaw-red-eye.json）
- [monster/cliffjaw-star-grave](../../../../../../../../content/base/monsters/cliffjaw-star-grave.json)｜崖牙・負天星塚｜A｜背馱舊蛻的潮錨，崖顎撕傷與踏地範圍攻擊。（monsters/cliffjaw-star-grave.json）
- [monster/hound-c](../../../../../../../../content/base/monsters/hound-c.json)｜掘犬｜C｜前鏟遊獵，吞屍維持活性，宣告蛻成盾甲。（monsters/hound-c.json）
- [monster/tidespine-chittagong](../../../../../../../../content/base/monsters/tidespine-chittagong.json)｜吉大港的那隻・萬潮葬王｜S｜脊背如潮牆的 S 領主，覆港與橫掃。（monsters/tidespine-chittagong.json）
- [monster/tidewolf-b](../../../../../../../../content/base/monsters/tidewolf-b.json)｜潮狼｜B｜群獵先鋒，沿用既有潮狼與咬擊／撲擊。（monsters/tidewolf-b.json）
- [monster/tidewolf-c](../../../../../../../../content/base/monsters/tidewolf-c.json)｜潮狼｜C｜群獵先鋒，沿用既有潮狼與咬擊／撲擊。（monsters/tidewolf-c.json）
- [monster/tidewolf-d](../../../../../../../../content/base/monsters/tidewolf-d.json)｜潮狼｜D｜群獵先鋒，沿用既有潮狼與咬擊／撲擊。（monsters/tidewolf-d.json）
- [species/bulwark](../../../../../../../../content/base/species/bulwark.json)｜盾甲｜B｜雙層前盾抵住來襲，帶隊衝陣。（species/bulwark.json）
- [species/cliffjaw](../../../../../../../../content/base/species/cliffjaw.json)｜崖牙｜A｜背馱舊蛻的潮錨，崖顎撕傷與踏地範圍攻擊。（species/cliffjaw.json）
- [species/hound](../../../../../../../../content/base/species/hound.json)｜掘犬｜C｜前鏟遊獵，吞屍維持活性，宣告蛻成盾甲。（species/hound.json）
- [species/tidespine](../../../../../../../../content/base/species/tidespine.json)｜潮脊｜S｜脊背如潮牆的 S 領主，覆港與橫掃。（species/tidespine.json）

煙霧 runner 原樣複製至 `/tmp/cx-mon-beast/run.ts`；pack 與兩情境只在 `/tmp/cx-mon-beast/pack/`。野怪場沿用 rift-edge-nest 四台機與原駕駛員，放全部八隻新怪獸；生物機甲場四台新 bio-* 各配陳小海，對六隻 reaper-c。雙方在原地圖空地近距離部署，使 20 回合內實際交戰。

HP 計算輸出（所有部位所有層加總）：

```jsonl
{"id": "bodyplan/quadruped-hound", "hp": 420, "target": 420, "deviation": 0.0, "passed": true}
{"id": "bodyplan/quadruped-bulwark", "hp": 950, "target": 950, "deviation": 0.0, "passed": true}
{"id": "bodyplan/quadruped-cliffjaw", "hp": 1900, "target": 1900, "deviation": 0.0, "passed": true}
{"id": "bodyplan/quadruped-tidespine", "hp": 4000, "target": 4000, "deviation": 0.0, "passed": true}
```

煙霧指令與原始 JSON 行：

`node /tmp/cx-mon-beast/run.ts scenario/beast-wild 1 2 3`；exit 0。

```jsonl
{"seed":1,"winner":"enemy","reason":"eliminate","rounds":2,"hits":56,"misses":61,"deaths":3,"abilities":{"base:ability/reaper-cleave":7,"base:ability/rearguard-oath":5,"base:ability/bite":61,"base:ability/kx-wall-charge":1,"base:ability/kx-carrion-gulp":1,"base:ability/kx-burrow-flank":1,"base:ability/kx-shovel-ram":14,"base:ability/kx-spine-sweep":8,"base:ability/kx-tide-crush":1,"base:ability/kx-ground-stomp":2,"base:ability/kx-cliff-bite":13}}
{"seed":2,"winner":"enemy","reason":"eliminate","rounds":4,"hits":76,"misses":112,"deaths":4,"abilities":{"base:ability/reaper-cleave":15,"base:ability/rearguard-oath":6,"base:ability/bite":85,"base:ability/kx-wall-charge":2,"base:ability/kx-carrion-gulp":1,"base:ability/kx-burrow-flank":1,"base:ability/kx-shovel-ram":6,"base:ability/pounce":1,"base:ability/kx-spine-sweep":20,"base:ability/kx-tide-crush":1,"base:ability/kx-ground-stomp":4,"base:ability/kx-cliff-bite":40,"base:ability/shell-lance":3}}
{"seed":3,"winner":"enemy","reason":"eliminate","rounds":3,"hits":64,"misses":82,"deaths":3,"abilities":{"base:ability/reaper-cleave":14,"base:ability/shell-lance":1,"base:ability/rearguard-oath":5,"base:ability/bite":59,"base:ability/kx-wall-charge":1,"base:ability/kx-carrion-gulp":1,"base:ability/kx-shovel-ram":14,"base:ability/kx-burrow-flank":1,"base:ability/kx-tide-crush":1,"base:ability/kx-spine-sweep":11,"base:ability/kx-ground-stomp":2,"base:ability/kx-cliff-bite":28,"base:ability/reaper-charge":1,"base:ability/pounce":2}}
```

`node /tmp/cx-mon-beast/run.ts scenario/beast-bio 1 2 3`；exit 0。

```jsonl
{"seed":1,"winner":"player","reason":"eliminate","rounds":11,"hits":183,"misses":284,"deaths":6,"abilities":{"base:ability/kx-shield-raise":3,"base:ability/kx-wall-charge":3,"base:ability/bite":39,"base:ability/kx-carrion-gulp":1,"base:ability/kx-burrow-flank":1,"base:ability/kx-shovel-ram":13,"base:ability/kx-tide-crush":4,"base:ability/kx-spine-sweep":78,"base:ability/kx-ground-stomp":5,"base:ability/kx-cliff-bite":70,"base:ability/reaper-cleave":232,"base:ability/reaper-charge":7}}
{"seed":2,"winner":"player","reason":"eliminate","rounds":14,"hits":189,"misses":398,"deaths":5,"abilities":{"base:ability/kx-shield-raise":3,"base:ability/bite":42,"base:ability/kx-wall-charge":3,"base:ability/kx-carrion-gulp":1,"base:ability/kx-burrow-flank":1,"base:ability/kx-shovel-ram":13,"base:ability/kx-tide-crush":3,"base:ability/kx-spine-sweep":54,"base:ability/kx-ground-stomp":7,"base:ability/kx-cliff-bite":102,"base:ability/reaper-cleave":328,"base:ability/reaper-charge":10}}
{"seed":3,"winner":"player","reason":"eliminate","rounds":7,"hits":163,"misses":209,"deaths":6,"abilities":{"base:ability/kx-shield-raise":3,"base:ability/kx-wall-charge":4,"base:ability/bite":49,"base:ability/kx-carrion-gulp":2,"base:ability/kx-shovel-ram":48,"base:ability/kx-burrow-flank":3,"base:ability/kx-tide-crush":3,"base:ability/kx-spine-sweep":50,"base:ability/kx-ground-stomp":4,"base:ability/kx-cliff-bite":45,"base:ability/reaper-cleave":147,"base:ability/reaper-charge":7}}
```

## 沒做到或證據不足的

`npm test` 的三個失敗檔是 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/crew/restraint.test.ts`；TAP 僅提供 `ERR_TEST_FAILURE` 與 exit 1，沒有內層 assertion／堆疊，不能斷言是沙箱或本線造成。遵守「只跑一次、領導外部重跑」約定，未擴增測試或修改別線檔案。完整 log：`/tmp/cx-mon-beast/npm-test.log`。

`kx-star-howl` 沒出現在本次 AI abilities 計數；其餘 9 招均有執行證據。固定門檻已達成，未為了湊全覆蓋改數值或 AI。蛻皮與捕獲轉換僅有內容宣告／引用驗證，這兩場沒有主張驗過完整營運流程。

設計表標頭「能力（9）」與實列 10 招不符；依交接書範圍的十個檔名完成，內容總數恰為 38。

## 需要決定的事

本線無需新增決策。請領導依原交接約定在外部重跑 npm test，確認上述三個失敗的根因；本線固定四條驗收已完成。

以後交接書該點名的工具：本次既有工具足夠；建議補列 `python3`（建立 JSON、HP 加總與產物盤點）及 `cp`（原樣複製 runner）。

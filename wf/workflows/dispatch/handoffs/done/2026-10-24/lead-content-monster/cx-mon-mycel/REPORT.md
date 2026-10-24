# cx-mon-mycel：菌絲 31 檔與固定四項驗收完成

## 做了什麼

依交接書與 design.md 新增菌絲內容：4 species、4 bodyplans、4 bio frames、7 monsters、7 abilities、4 effects、1 aiprofile，共 31 檔。只新增分配路徑，未修改既有內容、src、spec、registry 或情境，未 commit。

固定驗收四項均完成：內容檢查 `OK 0 errors, 0 warnings`；本線內容路徑 `??` 恰 31、既有檔修改 0；HP 偏差全為 0%；兩場各三個 seed 無 THROW，新能力合計 7/7 出現（門檻至少 5/7）。野怪場每個 seed 都有 6/7；生物機甲場每個 seed 都有其兩台機體的 4/4 能力。野怪場 seed 2 在既定 20 回合 timeout，沒有例外；驗收未要求勝負或全數擊殺。

第一批 check 曾因效果 kx-pod-bloom 引用第二批尚未建立的 species/pod 而 FAIL 1；第二批補齊後歸零。未更改設計數值迴避引用檢查。

## 產出

內容根目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/`。每行依序為路徑、id、中文顯示名、等級、定位；效果與 AI profile 無獨立等級。

```text
content/base/species/pod.json | species/pod | 孢囊 | D | 定點孢囊陷阱；不可捕捉，採集佔位。
content/base/species/stalk.json | species/stalk | 菌柱 | C／B | 近身纏根與孢霧控場，可捕捉並再生皮層。
content/base/species/rotwarden.json | species/rotwarden | 腐衛 | B／A | 菌絲裹住鏽甲的近戰騎士，可捕捉。
content/base/species/bed.json | species/bed | 菌床 | A | 五結全毀才死亡的定點潮錨，生成孢囊；不可捕捉。
content/base/bodyplans/mycel-pod.json | bodyplan/mycel-pod | 孢囊體 | D | 定點孢囊陷阱；不可捕捉，採集佔位。 HP 總量 70。
content/base/bodyplans/mycel-stalk.json | bodyplan/mycel-stalk | 菌柱體 | C／B | 近身纏根與孢霧控場，可捕捉並再生皮層。 HP 總量 450。
content/base/bodyplans/mycel-rotwarden.json | bodyplan/mycel-rotwarden | 腐衛體 | B／A | 菌絲裹住鏽甲的近戰騎士，可捕捉。 HP 總量 1000。
content/base/bodyplans/mycel-bed.json | bodyplan/mycel-bed | 菌床體 | A | 五結全毀才死亡的定點潮錨，生成孢囊；不可捕捉。 HP 總量 1800。
content/base/frames/bio-pod.json | frame/bio-pod | 生物機甲・孢囊 | D | 定點孢囊陷阱；不可捕捉，採集佔位。
content/base/frames/bio-stalk.json | frame/bio-stalk | 生物機甲・菌柱 | C | 近身纏根與孢霧控場，可捕捉並再生皮層。
content/base/frames/bio-rotwarden.json | frame/bio-rotwarden | 生物機甲・腐衛 | B | 菌絲裹住鏽甲的近戰騎士，可捕捉。
content/base/frames/bio-bed.json | frame/bio-bed | 生物機甲・菌床 | A | 五結全毀才死亡的定點潮錨，生成孢囊；不可捕捉。
content/base/monsters/pod-d.json | monster/pod-d | 孢囊 | D | 定點孢囊陷阱；不可捕捉，採集佔位。
content/base/monsters/stalk-c.json | monster/stalk-c | 菌柱 | C | 近身纏根與孢霧控場，可捕捉並再生皮層。
content/base/monsters/stalk-b.json | monster/stalk-b | 菌柱 | B | 近身纏根與孢霧控場，可捕捉並再生皮層。
content/base/monsters/rotwarden-b.json | monster/rotwarden-b | 腐衛 | B | 菌絲裹住鏽甲的近戰騎士，可捕捉。
content/base/monsters/rotwarden-a.json | monster/rotwarden-a | 腐衛・鏽誓葬騎 | A | 菌絲裹住鏽甲的近戰騎士，可捕捉。
content/base/monsters/bed-white-night.json | monster/bed-white-night | 菌床・白夜 | A | 五結全毀才死亡的定點潮錨，生成孢囊；不可捕捉。
content/base/monsters/bed-bellless-dream.json | monster/bed-bellless-dream | 菌床・無鐘長夢 | A | 五結全毀才死亡的定點潮錨，生成孢囊；不可捕捉。
content/base/abilities/kx-spore-burst.json | ability/kx-spore-burst | 孢夢乍裂 | D | 鄰域破囊，acid 8 並附既有 rooted。
content/base/abilities/kx-root-snare.json | ability/kx-root-snare | 地衣縛足 | C／B | 距離 1–2 纏根，kinetic 8 並附 rooted。
content/base/abilities/kx-spore-fog.json | ability/kx-spore-fog | 白夜孢霧 | C／B | 半徑 1 的孢霧，acid 10 並寄生孢子。
content/base/abilities/kx-rot-blade.json | ability/kx-rot-blade | 鏽誓葬刃 | B／A | 近身 pierce 24 並寄生孢子。
content/base/abilities/kx-spore-shroud.json | ability/kx-spore-shroud | 垂紗守夜 | B／A | 自身護紗，兩回合閃避 +15。
content/base/abilities/kx-knot-flare.json | ability/kx-knot-flare | 五結明燈 | A | 半徑 2 的結光，acid 16 並寄生孢子。
content/base/abilities/kx-pod-bloom.json | ability/kx-pod-bloom | 眠囊開綻 | A | 在鄰格生成 D 級孢囊。
content/base/effects/kx-sporeload.json | effect/kx-sporeload | 寄夢孢 | — | 三回合 acid 3 持續傷害與 perception −2。
content/base/effects/kx-spore-veil.json | effect/kx-spore-veil | 白紗護身 | — | 兩回合 evasion +15。
content/base/effects/kx-pod-bloom.json | effect/kx-pod-bloom | 眠囊開綻 | — | onApply 生成 species/pod D adjacent。
content/base/effects/kx-overgrowth.json | effect/kx-overgrowth | 夢侵座艙 | — | 永久 perception −1、resolve −3；僅建檔，留給營運線掛載。
content/base/aiprofiles/kx-mycel-creep.json | aiprofile/kx-mycel-creep | 白夜蔓行 | — | sentinel；attack 0.8、debuff 1、buff 1、protect 0.6。
```

本線內容最大單檔 3983 bytes，低於 40 KB；內容 31 檔加本 REPORT 共 32 個 repo 新檔，未觸發 36 檔 gate。檔案狀態證據：`/tmp/cx-mon-mycel/status.txt`。

HP 計算方式：對每個 bodyplan 的 `parts[].layers[].hp` 全部加總，對照 design.md。

```jsonl
{"id": "bodyplan/mycel-pod", "hp": 70, "target": 70, "deviationPct": 0.0, "passGate": true}
{"id": "bodyplan/mycel-stalk", "hp": 450, "target": 450, "deviationPct": 0.0, "passGate": true}
{"id": "bodyplan/mycel-rotwarden", "hp": 1000, "target": 1000, "deviationPct": 0.0, "passGate": true}
{"id": "bodyplan/mycel-bed", "hp": 1800, "target": 1800, "deviationPct": 0.0, "passGate": true}
```

煙霧 runner 為指定來源的原樣複本：`/tmp/cx-mon-mycel/run.ts`。臨時 pack：`/tmp/cx-mon-mycel/pack/pack.json`；情境：`/tmp/cx-mon-mycel/pack/scenarios/mycel-wild.json`、`/tmp/cx-mon-mycel/pack/scenarios/mycel-bio.json`。沿用 rift-edge-60；野怪場保留指定四台機與駕駛員，在空地近距離部署以覆蓋定點孢囊；生物機甲場使用 bio-stalk、bio-rotwarden 各一台與 chen-xiaohai，對戰三隻 reaper-c。

執行指令（各一次）：

```sh
node /tmp/cx-mon-mycel/run.ts scenario/mycel-wild 1 2 3
node /tmp/cx-mon-mycel/run.ts scenario/mycel-bio 1 2 3
```

情境：`scenario/mycel-wild`

```jsonl
{"seed":1,"winner":"enemy","reason":"eliminate","rounds":16,"hits":134,"misses":138,"deaths":6,"abilities":{"base:ability/reaper-cleave":23,"base:ability/shell-lance":13,"base:ability/rearguard-oath":15,"base:ability/kx-spore-fog":13,"base:ability/kx-root-snare":96,"base:ability/kx-rot-blade":75,"base:ability/kx-spore-burst":5,"base:ability/kx-knot-flare":15,"base:ability/kx-pod-bloom":10,"base:ability/reaper-charge":1}}
{"seed":2,"winner":null,"reason":"timeout","rounds":20,"hits":97,"misses":132,"deaths":3,"abilities":{"base:ability/reaper-cleave":23,"base:ability/shell-lance":7,"base:ability/rearguard-oath":9,"base:ability/kx-spore-fog":8,"base:ability/kx-root-snare":82,"base:ability/kx-rot-blade":64,"base:ability/kx-spore-burst":3,"base:ability/kx-knot-flare":8,"base:ability/kx-pod-bloom":14,"base:ability/reaper-charge":1}}
{"seed":3,"winner":"enemy","reason":"eliminate","rounds":16,"hits":115,"misses":137,"deaths":5,"abilities":{"base:ability/reaper-cleave":23,"base:ability/shell-lance":17,"base:ability/rearguard-oath":15,"base:ability/kx-root-snare":89,"base:ability/kx-spore-fog":12,"base:ability/kx-rot-blade":60,"base:ability/kx-spore-burst":3,"base:ability/kx-knot-flare":13,"base:ability/kx-pod-bloom":10,"base:ability/reaper-charge":1}}
```
情境：`scenario/mycel-bio`

```jsonl
{"seed":1,"winner":"player","reason":"eliminate","rounds":18,"hits":171,"misses":237,"deaths":4,"abilities":{"base:ability/kx-spore-shroud":2,"base:ability/kx-rot-blade":133,"base:ability/kx-spore-fog":3,"base:ability/kx-root-snare":37,"base:ability/reaper-cleave":229,"base:ability/reaper-charge":1}}
{"seed":2,"winner":"enemy","reason":"eliminate","rounds":4,"hits":44,"misses":76,"deaths":0,"abilities":{"base:ability/kx-spore-shroud":2,"base:ability/kx-rot-blade":22,"base:ability/kx-spore-fog":2,"base:ability/kx-root-snare":25,"base:ability/reaper-cleave":67,"base:ability/reaper-charge":2}}
{"seed":3,"winner":"player","reason":"eliminate","rounds":17,"hits":161,"misses":249,"deaths":4,"abilities":{"base:ability/kx-spore-shroud":3,"base:ability/kx-rot-blade":129,"base:ability/kx-spore-fog":5,"base:ability/kx-root-snare":65,"base:ability/reaper-charge":5,"base:ability/reaper-cleave":202}}
```

## 沒做到或證據不足的

`npm test` 按交接書只跑一次，exit 1，輸出為 tests 89、pass 86、fail 3（檔案層級計數）。失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/crew/restraint.test.ts`；輸出只提供 `ERR_TEST_FAILURE`，沒有足以判定根因的子測試細節。完整紀錄 `/tmp/cx-mon-mycel/npm-test.log`，請領導依交接書在沙箱外重跑；不宣稱全套測試綠燈，也不將未明原因斷言為環境問題。本線固定四項驗收均有直接證據。

開工前與收尾前均執行指定 `git log --oneline -- content/lore`，兩次皆無輸出，沒有已提交風格指南可套用；命名依 design.md 第〇節及 world.md 太空歌劇裁示。

`effect/kx-overgrowth` 僅建檔不掛載，保留給營運線實作修剪／共生層侵入駕駛艙。菌柱與腐衛的捕捉按本線 design.md 執行，菌絲 core 全用 flesh／chitin，不套通則 organ 核。

## 需要決定的事

無新增設計決策。領導需確認全套測試的三個失敗並負責 commit；本線不擴充固定驗收，也不修改其他線檔案。

以後交接書該點名的工具：既有必用工具已足夠；另可明列 `python3`（生成 JSON／加總 HP）、`cp`（複製 smoke runner）、`git status --short --untracked-files=all -- <本線路徑>`（隔離多線工作區的新增檔證據）。分批順序應註明 spawn 效果會先引用尚未新增的 species，第一批的暫時缺引用須待第二批閉合。

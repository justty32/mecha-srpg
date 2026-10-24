# cx-mon-alien：異形 33 檔完成，固定四項驗收通過

## 做了什麼

依交接書、design.md 共通規則與異形段新增 33 個內容檔：species 4、bodyplans 4、bio frames 4、monsters 6、abilities 9、effects 5、aiprofile 1。只新增指定路徑，沒有修改既有檔、src、registry、pack 或正式情境；沒有 commit。

固定四項驗收結果：

1. 最終 `npm run check` exit 0，末行 `OK 0 errors, 0 warnings`。
2. `git status --short content/base` 依本線白名單篩選恰為 33 筆，全部為 `??`；本線沒有任何既有檔修改。最大內容檔 5749 bytes。加 REPORT 共 34 個 repo 新檔；另有 4 個暫存 runner／pack／情境檔，合計 38，未超過件數 gate。
3. 四個 bodyplan HP 與設計值完全一致，偏差 0%，計算輸出見下。
4. 兩場各 seed 1／2／3 共六場皆無 THROW。野怪場每 seed 覆蓋 7／7／6 項新能力，生物機甲場各覆蓋 8 項，均達至少 6/9 門檻；兩場聯集合計 9/9。

第一批 check 曾被別線 `effect/kx-pod-bloom` 引用尚未出現的 `species/pod` 擋住；依交接書等超過兩分鐘重跑即恢復 0 errors，未改別線檔案。

開工前查 `git log --oneline -- content/lore` 無提交；收尾時已有 `ddba924` 風格指南，親讀 `content/lore/README.md` 與 `style.md`，本線命名符合規範，無需更名，並重跑 check 綠燈。

## 產出

以下為逐檔導航；「等級」指物種／機體等級，能力與效果標其使用者等級，AI 標適用等級。B 以下 monster 不寫 name／epithet，中文名在此沿用 species。

### 物種

- [species/sac](../../../../../../content/base/species/sac.json)：浮囊；D；觸鬚浮游、異瞳標記的偵察者。
- [species/spitter](../../../../../../content/base/species/spitter.json)：吐棘者；C；先毀偏冠才可拘束的遠程壓制者。
- [species/mirror](../../../../../../content/base/species/mirror.json)：鏡肢；B／A；一側鏡衣抗能量、一側赤手撕裂的近身異形。
- [species/choir](../../../../../../content/base/species/choir.json)：群喉；A；五核全毀才死亡的異形潮錨。

### 體型

- [bodyplan/alien-sac](../../../../../../content/base/bodyplans/alien-sac.json)：浮囊・垂夢之形；D；HP 110，心囊加三條獨立 locomotion 夢鬚。
- [bodyplan/alien-spitter](../../../../../../content/base/bodyplans/alien-spitter.json)：吐棘者・偏冠之形；C；HP 380，偏冠與囊底核、三足 HP 分別 40／55／75。
- [bodyplan/alien-mirror](../../../../../../content/base/bodyplans/alien-mirror.json)：鏡肢・失配之形；B／A；HP 950，鏡衣 energy 抗性 0.6、thermal 0.4，赤手無抗性。
- [bodyplan/alien-choir](../../../../../../content/base/bodyplans/alien-choir.json)：群喉・五聲之形；A；HP 1800，五個 core 喉部、外帷與匍行祭座。

### 生物機甲

- [frame/bio-sac](../../../../../../content/base/frames/bio-sac.json)：生物機甲・浮囊；D；負荷 2，專屬浮囊捕獲形態。
- [frame/bio-spitter](../../../../../../content/base/frames/bio-spitter.json)：生物機甲・吐棘者；C；負荷 6，專屬吐棘者捕獲形態。
- [frame/bio-mirror](../../../../../../content/base/frames/bio-mirror.json)：生物機甲・鏡肢；B；負荷 9，專屬鏡肢捕獲形態。
- [frame/bio-choir](../../../../../../content/base/frames/bio-choir.json)：生物機甲・群喉；A；負荷 13，專屬群喉捕獲形態。

### 怪獸個體

- [monster/sac-d](../../../../../../content/base/monsters/sac-d.json)：浮囊；D；標準偵察個體。
- [monster/spitter-c](../../../../../../content/base/monsters/spitter-c.json)：吐棘者；C；標準遠程個體。
- [monster/mirror-b](../../../../../../content/base/monsters/mirror-b.json)：鏡肢；B；標準鏡甲近戰個體。
- [monster/mirror-a](../../../../../../content/base/monsters/mirror-a.json)：鏡肢「千面獨禱」；A；高階鏡甲反制者。
- [monster/choir-a](../../../../../../content/base/monsters/choir-a.json)：群喉「五聲葬月」；A；逆頌與變異並用的潮錨。
- [monster/choir-last-vesper](../../../../../../content/base/monsters/choir-last-vesper.json)：晚禱「無人應答」；A；第二隻命名群喉潮錨。

### 能力

- [ability/kx-tendril-lash](../../../../../../content/base/abilities/kx-tendril-lash.json)：夢鬚鞭；D；射程 1–2，kinetic 7。
- [ability/kx-glare-pulse](../../../../../../content/base/abilities/kx-glare-pulse.json)：異瞳凝視；D；射程 1–6，命中標記、無直接傷害。
- [ability/kx-thorn-volley](../../../../../../content/base/abilities/kx-thorn-volley.json)：棘冠禮雨；C；射程 2–6、半徑 1，pierce 12，cd 2。
- [ability/kx-thorn-snipe](../../../../../../content/base/abilities/kx-thorn-snipe.json)：一棘穿夢；C；射程 2–7，pierce 18。
- [ability/kx-mirror-turn](../../../../../../content/base/abilities/kx-mirror-turn.json)：鏡衣翻面；B／A；自身閃避增益，cd 2。
- [ability/kx-bare-rend](../../../../../../content/base/abilities/kx-bare-rend.json)：赤祈撕界；B／A；近戰 pierce 24，命中留赤祈裂痕。
- [ability/kx-dissonant-hymn](../../../../../../content/base/abilities/kx-dissonant-hymn.json)：五喉逆頌；A；射程 1–5、半徑 2，energy 16，失諧減益，cd 2。
- [ability/kx-mutation-surge](../../../../../../content/base/abilities/kx-mutation-surge.json)：異相加冕；A；自身三回合正負並存變異，cd 4。
- [ability/kx-throat-swallow](../../../../../../content/base/abilities/kx-throat-swallow.json)：吞名之喉；A；近戰 kinetic 30。

### 效果與 AI

- [effect/kx-glare-marked](../../../../../../content/base/effects/kx-glare-marked.json)：異瞳留痕；D；兩回合 evasion −10、perception −2。
- [effect/kx-mirrored](../../../../../../content/base/effects/kx-mirrored.json)：鏡衣錯影；B／A；兩回合 evasion +16。
- [effect/kx-flesh-rend](../../../../../../content/base/effects/kx-flesh-rend.json)：赤祈裂痕；B／A；三回合 onTick pierce 4，只對 flesh 層。
- [effect/kx-dissonance](../../../../../../content/base/effects/kx-dissonance.json)：失諧哀歌；A；兩回合 accuracy −10、resolve −10。
- [effect/kx-mutation](../../../../../../content/base/effects/kx-mutation.json)：異相加冕；A；三回合 accuracy +12、evasion −10、initiative +3，帶 mutate。
- [aiprofile/kx-alien-stalker](../../../../../../content/base/aiprofiles/kx-alien-stalker.json)：異影窺獵；D–A；tactical，attack 1、disable 1、debuff 0.8。

### HP 計算輸出

算法：逐一加總 bodyplan 的每個 part 的每個 layer.hp。

```jsonl
{"bodyplan":"bodyplan/alien-sac","hp":110,"design":110,"delta_percent":0.0,"within_10_percent":true}
{"bodyplan":"bodyplan/alien-spitter","hp":380,"design":380,"delta_percent":0.0,"within_10_percent":true}
{"bodyplan":"bodyplan/alien-mirror","hp":950,"design":950,"delta_percent":0.0,"within_10_percent":true}
{"bodyplan":"bodyplan/alien-choir","hp":1800,"design":1800,"delta_percent":0.0,"within_10_percent":true}
```

### 煙霧對戰 JSON 行

Runner：`/tmp/cx-mon-alien/run.ts`，從指定來源逐 byte 複製，未改原檔或副本。Pack：`/tmp/cx-mon-alien/pack/pack.json`。情境在 `/tmp/cx-mon-alien/pack/scenarios/`，全部引用帶 `base:`。使用指定地圖，在左側平地近距離部署以讓二十回合內確實交戰。

野怪場 `alien-wild.json`：指定四台機與原駕駛員，敵方六種新增 monster 各一。命令：`node /tmp/cx-mon-alien/run.ts scenario/alien-wild 1 2 3`；exit 0。

```jsonl
{"seed":1,"winner":"enemy","reason":"eliminate","rounds":5,"hits":81,"misses":73,"deaths":5,"abilities":{"base:ability/reaper-charge":1,"base:ability/reaper-cleave":21,"base:ability/rearguard-oath":5,"base:ability/kx-bare-rend":64,"base:ability/kx-thorn-volley":3,"base:ability/kx-thorn-snipe":27,"base:ability/kx-glare-pulse":8,"base:ability/kx-dissonant-hymn":4,"base:ability/kx-mutation-surge":2,"base:ability/kx-throat-swallow":16}}
{"seed":2,"winner":"enemy","reason":"eliminate","rounds":5,"hits":94,"misses":133,"deaths":5,"abilities":{"base:ability/reaper-charge":1,"base:ability/reaper-cleave":37,"base:ability/rearguard-oath":5,"base:ability/kx-bare-rend":79,"base:ability/kx-thorn-volley":2,"base:ability/kx-thorn-snipe":36,"base:ability/kx-glare-pulse":16,"base:ability/kx-mutation-surge":4,"base:ability/kx-dissonant-hymn":5,"base:ability/shell-lance":1,"base:ability/kx-throat-swallow":37}}
{"seed":3,"winner":"enemy","reason":"eliminate","rounds":6,"hits":76,"misses":96,"deaths":3,"abilities":{"base:ability/reaper-cleave":29,"base:ability/reaper-charge":1,"base:ability/rearguard-oath":5,"base:ability/kx-bare-rend":73,"base:ability/kx-thorn-volley":3,"base:ability/kx-thorn-snipe":32,"base:ability/kx-tendril-lash":8,"base:ability/kx-dissonant-hymn":6,"base:ability/kx-mutation-surge":4,"base:ability/shell-lance":2}}
```

生物機甲場 `alien-bio.json`：四台新 bio 各一，每台 pilot 為 chen-xiaohai；敵方四隻 reaper-c。命令：`node /tmp/cx-mon-alien/run.ts scenario/alien-bio 1 2 3`；exit 0。

```jsonl
{"seed":1,"winner":"enemy","reason":"eliminate","rounds":14,"hits":171,"misses":237,"deaths":6,"abilities":{"base:ability/kx-mirror-turn":6,"base:ability/kx-bare-rend":93,"base:ability/kx-thorn-volley":1,"base:ability/kx-thorn-snipe":6,"base:ability/kx-tendril-lash":7,"base:ability/kx-dissonant-hymn":4,"base:ability/kx-mutation-surge":2,"base:ability/kx-throat-swallow":52,"base:ability/reaper-cleave":227,"base:ability/reaper-charge":3}}
{"seed":2,"winner":"enemy","reason":"eliminate","rounds":15,"hits":172,"misses":290,"deaths":6,"abilities":{"base:ability/kx-mirror-turn":5,"base:ability/kx-bare-rend":103,"base:ability/kx-thorn-volley":1,"base:ability/kx-thorn-snipe":14,"base:ability/kx-tendril-lash":7,"base:ability/kx-dissonant-hymn":3,"base:ability/kx-mutation-surge":2,"base:ability/kx-throat-swallow":41,"base:ability/reaper-cleave":276,"base:ability/reaper-charge":3}}
{"seed":3,"winner":"player","reason":"eliminate","rounds":17,"hits":179,"misses":285,"deaths":6,"abilities":{"base:ability/kx-mirror-turn":5,"base:ability/kx-bare-rend":120,"base:ability/kx-thorn-volley":2,"base:ability/kx-thorn-snipe":29,"base:ability/kx-tendril-lash":7,"base:ability/kx-dissonant-hymn":4,"base:ability/kx-mutation-surge":3,"base:ability/kx-throat-swallow":61,"base:ability/reaper-charge":6,"base:ability/reaper-cleave":219}}
```

## 沒做到或證據不足的

`npm test` 依交接書只跑一次，exit 1，TAP 顯示 tests 95、suites 0、pass 92、fail 3、cancelled 0、skipped 0、todo 0。失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/crew/restraint.test.ts`；本次輸出僅提供檔級 `ERR_TEST_FAILURE`，無內層斷言原因。未推定是沙箱或其他線造成，也未越界修改；交接書已提示沙箱內計數可能失真，由領導在外面重跑。不能宣稱完整測試全綠。

本次僅完成寫定的四項驗收，沒有追加驗收條件。長期變異重抽、UI 意圖半顯示與平衡性不在本線範圍。

## 需要決定的事

無需使用者裁示。領導依原交接安排在沙箱外重跑完整測試，確認上述三個檔級失敗原因；本線固定四項驗收已通過，可收取內容並由領導 commit。

### 以後交接書該點名的工具

`wf/tools/inbox_poll.sh`、`wf/tools/inbox_mail.sh`、`wf/tools/tabledb.py`（查 monsters.json）、`npm run check`、`npm test`、指定煙霧 runner、Python JSON HP 加總、`git status --short content/base` 與 `git log --oneline -- content/lore`。尤其要保留煙霧 runner 的完整來源路徑與 scratch pack 的 `base:` 引用規則。


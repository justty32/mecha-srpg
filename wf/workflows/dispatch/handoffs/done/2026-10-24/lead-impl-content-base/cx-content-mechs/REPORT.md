# cx-content-mechs：31 個內容 JSON 已完成，載入檢查零錯誤

## 做了什麼

依凍結契約 §0、§1 新建 5 個 bodyplan、5 個 frame、6 個 component、10 個 ability、5 個 effect，共 31 檔、32,698 bytes。包括多層部位與座位、摹機熱量／電能池、生物承擔、古代機體共鳴與獨有能力、移植臂、殼片透鏡與巢母孵生效果。

每完成一類均執行 `npm run check` 與 `wf/tools/inbox_poll.sh cx-content-mechs --once`。中途未宣告的 charge 池在 frame/moji-tern 建立後解決；world 線補上 species/mite 後，孵生引用亦已解決。最後一次檢查 exit 0，0 errors、0 warnings。

固定驗收第 1 條已確認：本線 31 個指定檔均存在，檔名與 id 一致；本線除 REPORT 與指定 inbox 通訊外未新建其他檔案，未修改既有檔案。共享工作區其餘改動屬既有或其他線工作。未 commit。

## 產出（31 個檔的清單）

以下路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/`：

```text
bodyplans/biped-standard.json
bodyplans/ancient-warden.json
bodyplans/insect-mite.json
bodyplans/insect-reaper.json
bodyplans/insect-nestmother.json
frames/moji-tern.json
frames/bio-reaper.json
frames/bio-mite.json
frames/bio-nestmother.json
frames/ancient-rearguard.json
components/soul-core-std.json
components/heat-lance.json
components/composite-plate.json
components/shell-pin-restraint.json
components/reaper-scythe-graft.json
components/shell-shard-lens.json
abilities/heat-lance-thrust.json
abilities/scythe-graft-cleave.json
abilities/shard-gaze.json
abilities/rearguard-oath.json
abilities/shell-lance.json
abilities/mite-swarm-bite.json
abilities/reaper-cleave.json
abilities/reaper-charge.json
abilities/nest-birth.json
abilities/root-drag.json
effects/rearguard-oath.json
effects/shard-marked.json
effects/restraint-broken.json
effects/nest-birth.json
effects/rooted.json
```

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-mechs/REPORT.md`。

## 沒做到或證據不足的

本線指定工作無未完成項。檢查證據對應最後一次執行時的共享工作區；領導仍依交接書在三線合併後重跑 `npm run check`。未擴增驗收或進行數值平衡。

## 需要決定的事

無。

## SPEC-GAP 清單

無；契約要求的欄位均能以既有 schema 表達。

最後一次 `npm run check` 完整輸出（exit 0）：

```text
> mecha-srpg@0.1.0 check
> node src/content/loader.ts content/base

pack base 0.1.0
frame: 7
bodyplan: 7
component: 7
ability: 14
effect: 20
person: 7 (human 4, soul 3)
soultree: 2
terrain: 5
faction: 3
species: 4
monster: 3
aiprofile: 5
curve: 1
registries: 7/7
rules: 4/4
OK 0 errors, 0 warnings
```

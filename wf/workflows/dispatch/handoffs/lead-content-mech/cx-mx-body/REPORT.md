# cx-mx-body：62 筆機械系內容完成，固定四項驗收通過

## 做了什麼

依交接書新增 bodyplans 11、frames 30、abilities 13、effects 6、aiprofiles 2，共 62 個 JSON。檔名、id、name 均依 manifest；採 UTF-8、2 空白縮排與結尾換行。僅建立本線內容檔及此 REPORT，未改既有檔、未 git add／commit，未改 src、schema 或其他工人的內容。

每類完成後各跑一次 `npm run check`，五次皆回傳 0，末行皆為 `OK 0 errors, 0 warnings`。最終檢查紀錄：`/tmp/cx-mx-body-check-aiprofile.log`。每個步驟均跑指定 inbox_poll，無待處理 orders。

依指定臨時腳本 `/tmp/cx-mx-body-check.py` 自查，結果如下：

```text
清單檔案／id／name：62/62
bodyplan/mx-biped-d: HP 245/250，差 2.00%
bodyplan/mx-tracked-d: HP 300/300，差 0.00%
bodyplan/mx-biped-scout: HP 210/210，差 0.00%
bodyplan/mx-biped-c: HP 370/370，差 0.00%
bodyplan/mx-hover-c: HP 285/300，差 5.00%
bodyplan/mx-biped-heavy: HP 525/520，差 0.96%
bodyplan/mx-biped-b: HP 445/440，差 1.14%
bodyplan/mx-ace-a: HP 600/600，差 0.00%
bodyplan/mx-winged-a: HP 520/520，差 0.00%
bodyplan/mx-fortress-a: HP 760/760，差 0.00%
bodyplan/mx-selene-s: HP 820/820，差 0.00%
裝配槽檢查：30 台 frame、158 組；部件實檔 158 組，清單設計 0 組。
尚未落檔的部件：無
容量 gate：62 個內容檔，98671 bytes（上限 67 個／400 KB）。
git status：本線內容檔 62 筆，狀態 ['??']
錯誤：0
```

五類檢查紀錄依序為 `/tmp/cx-mx-body-check-bodyplan.log`、`/tmp/cx-mx-body-check-effect.log`、`/tmp/cx-mx-body-check-ability.log`、`/tmp/cx-mx-body-check-frame.log`、`/tmp/cx-mx-body-check-aiprofile.log`。`git status --short --untracked-files=all` 中本線 62 個內容檔皆為新增未追蹤檔，且全部位於授權路徑；前後狀態紀錄在 `/tmp/cx-mx-body-status-before.txt` 與 `/tmp/cx-mx-body-status-after.txt`。沒有額外擴充驗收項目。

## 產出（檔清單）

內容根目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/`。下列連結為本線全部 62 個新檔：

bodyplans：

- [mx-biped-d.json](../../../../../../content/base/bodyplans/mx-biped-d.json)
- [mx-tracked-d.json](../../../../../../content/base/bodyplans/mx-tracked-d.json)
- [mx-biped-scout.json](../../../../../../content/base/bodyplans/mx-biped-scout.json)
- [mx-biped-c.json](../../../../../../content/base/bodyplans/mx-biped-c.json)
- [mx-hover-c.json](../../../../../../content/base/bodyplans/mx-hover-c.json)
- [mx-biped-heavy.json](../../../../../../content/base/bodyplans/mx-biped-heavy.json)
- [mx-biped-b.json](../../../../../../content/base/bodyplans/mx-biped-b.json)
- [mx-ace-a.json](../../../../../../content/base/bodyplans/mx-ace-a.json)
- [mx-winged-a.json](../../../../../../content/base/bodyplans/mx-winged-a.json)
- [mx-fortress-a.json](../../../../../../content/base/bodyplans/mx-fortress-a.json)
- [mx-selene-s.json](../../../../../../content/base/bodyplans/mx-selene-s.json)
- [bulwark-i.json](../../../../../../content/base/bodyplans/bulwark-i.json)
- [bulwark-i-beacon.json](../../../../../../content/base/bodyplans/bulwark-i-beacon.json)
- [bulwark-ii.json](../../../../../../content/base/bodyplans/bulwark-ii.json)
- [bulwark-ii-rivet.json](../../../../../../content/base/bodyplans/bulwark-ii-rivet.json)
- [bulwark-iv-rampart.json](../../../../../../content/base/bodyplans/bulwark-iv-rampart.json)
- [bulwark-old-city.json](../../../../../../content/base/bodyplans/bulwark-old-city.json)
- [longspear-v1.json](../../../../../../content/base/bodyplans/longspear-v1.json)
- [longspear-v1-guild.json](../../../../../../content/base/bodyplans/longspear-v1-guild.json)
- [longspear-v4.json](../../../../../../content/base/bodyplans/longspear-v4.json)
- [longspear-v4-saltgull.json](../../../../../../content/base/bodyplans/longspear-v4-saltgull.json)
- [longspear-v7.json](../../../../../../content/base/bodyplans/longspear-v7.json)
- [longspear-piercing-cloud.json](../../../../../../content/base/bodyplans/longspear-piercing-cloud.json)
- [union-fr7.json](../../../../../../content/base/bodyplans/union-fr7.json)
- [union-at12.json](../../../../../../content/base/bodyplans/union-at12.json)
- [union-futu.json](../../../../../../content/base/bodyplans/union-futu.json)
- [selene-silverring-g2.json](../../../../../../content/base/bodyplans/selene-silverring-g2.json)
- [selene-crescent-g5.json](../../../../../../content/base/bodyplans/selene-crescent-g5.json)
- [selene-valkyrie.json](../../../../../../content/base/bodyplans/selene-valkyrie.json)
- [selene-aurora.json](../../../../../../content/base/bodyplans/selene-aurora.json)
- [selene-eclipse-moonless.json](../../../../../../content/base/bodyplans/selene-eclipse-moonless.json)
- [anvil-ii.json](../../../../../../content/base/bodyplans/anvil-ii.json)
- [anvil-crimson-rivet.json](../../../../../../content/base/bodyplans/anvil-crimson-rivet.json)
- [anvil-iv-ram.json](../../../../../../content/base/bodyplans/anvil-iv-ram.json)
- [thirdblade-swordfish-iii.json](../../../../../../content/base/bodyplans/thirdblade-swordfish-iii.json)
- [thirdblade-swordfish-v5.json](../../../../../../content/base/bodyplans/thirdblade-swordfish-v5.json)
- [thirdblade-binary-swordfish.json](../../../../../../content/base/bodyplans/thirdblade-binary-swordfish.json)
- [tidefaith-redeemer-3.json](../../../../../../content/base/bodyplans/tidefaith-redeemer-3.json)
- [shellsoc-ls3.json](../../../../../../content/base/bodyplans/shellsoc-ls3.json)
- [shellsoc-surveyor-b.json](../../../../../../content/base/bodyplans/shellsoc-surveyor-b.json)
- [backside-white-night.json](../../../../../../content/base/bodyplans/backside-white-night.json)
- [mx-head-vulcan.json](../../../../../../content/base/bodyplans/mx-head-vulcan.json)
- [mx-frame-strike.json](../../../../../../content/base/bodyplans/mx-frame-strike.json)
- [mx-guard-stance.json](../../../../../../content/base/bodyplans/mx-guard-stance.json)
- [mx-old-city-wall.json](../../../../../../content/base/bodyplans/mx-old-city-wall.json)
- [mx-cloud-piercer.json](../../../../../../content/base/bodyplans/mx-cloud-piercer.json)
- [mx-anvil-roar.json](../../../../../../content/base/bodyplans/mx-anvil-roar.json)
- [mx-unbind-rite.json](../../../../../../content/base/bodyplans/mx-unbind-rite.json)
- [mx-futu-charge.json](../../../../../../content/base/bodyplans/mx-futu-charge.json)
- [mx-valkyrie-dive.json](../../../../../../content/base/bodyplans/mx-valkyrie-dive.json)
- [mx-aurora-veil.json](../../../../../../content/base/bodyplans/mx-aurora-veil.json)
- [mx-binary-cut.json](../../../../../../content/base/bodyplans/mx-binary-cut.json)
- [mx-white-night-fade.json](../../../../../../content/base/bodyplans/mx-white-night-fade.json)
- [mx-moonless-command.json](../../../../../../content/base/bodyplans/mx-moonless-command.json)
- [mx-guarding.json](../../../../../../content/base/bodyplans/mx-guarding.json)
- [mx-old-city.json](../../../../../../content/base/bodyplans/mx-old-city.json)
- [mx-rivet-rally.json](../../../../../../content/base/bodyplans/mx-rivet-rally.json)
- [mx-aurora-veiled.json](../../../../../../content/base/bodyplans/mx-aurora-veiled.json)
- [mx-faded.json](../../../../../../content/base/bodyplans/mx-faded.json)
- [mx-moonless-link.json](../../../../../../content/base/bodyplans/mx-moonless-link.json)
- [mx-captain-line.json](../../../../../../content/base/bodyplans/mx-captain-line.json)
- [mx-salvage-crew.json](../../../../../../content/base/bodyplans/mx-salvage-crew.json)

frames：

- [mx-biped-d.json](../../../../../../content/base/frames/mx-biped-d.json)
- [mx-tracked-d.json](../../../../../../content/base/frames/mx-tracked-d.json)
- [mx-biped-scout.json](../../../../../../content/base/frames/mx-biped-scout.json)
- [mx-biped-c.json](../../../../../../content/base/frames/mx-biped-c.json)
- [mx-hover-c.json](../../../../../../content/base/frames/mx-hover-c.json)
- [mx-biped-heavy.json](../../../../../../content/base/frames/mx-biped-heavy.json)
- [mx-biped-b.json](../../../../../../content/base/frames/mx-biped-b.json)
- [mx-ace-a.json](../../../../../../content/base/frames/mx-ace-a.json)
- [mx-winged-a.json](../../../../../../content/base/frames/mx-winged-a.json)
- [mx-fortress-a.json](../../../../../../content/base/frames/mx-fortress-a.json)
- [mx-selene-s.json](../../../../../../content/base/frames/mx-selene-s.json)
- [bulwark-i.json](../../../../../../content/base/frames/bulwark-i.json)
- [bulwark-i-beacon.json](../../../../../../content/base/frames/bulwark-i-beacon.json)
- [bulwark-ii.json](../../../../../../content/base/frames/bulwark-ii.json)
- [bulwark-ii-rivet.json](../../../../../../content/base/frames/bulwark-ii-rivet.json)
- [bulwark-iv-rampart.json](../../../../../../content/base/frames/bulwark-iv-rampart.json)
- [bulwark-old-city.json](../../../../../../content/base/frames/bulwark-old-city.json)
- [longspear-v1.json](../../../../../../content/base/frames/longspear-v1.json)
- [longspear-v1-guild.json](../../../../../../content/base/frames/longspear-v1-guild.json)
- [longspear-v4.json](../../../../../../content/base/frames/longspear-v4.json)
- [longspear-v4-saltgull.json](../../../../../../content/base/frames/longspear-v4-saltgull.json)
- [longspear-v7.json](../../../../../../content/base/frames/longspear-v7.json)
- [longspear-piercing-cloud.json](../../../../../../content/base/frames/longspear-piercing-cloud.json)
- [union-fr7.json](../../../../../../content/base/frames/union-fr7.json)
- [union-at12.json](../../../../../../content/base/frames/union-at12.json)
- [union-futu.json](../../../../../../content/base/frames/union-futu.json)
- [selene-silverring-g2.json](../../../../../../content/base/frames/selene-silverring-g2.json)
- [selene-crescent-g5.json](../../../../../../content/base/frames/selene-crescent-g5.json)
- [selene-valkyrie.json](../../../../../../content/base/frames/selene-valkyrie.json)
- [selene-aurora.json](../../../../../../content/base/frames/selene-aurora.json)
- [selene-eclipse-moonless.json](../../../../../../content/base/frames/selene-eclipse-moonless.json)
- [anvil-ii.json](../../../../../../content/base/frames/anvil-ii.json)
- [anvil-crimson-rivet.json](../../../../../../content/base/frames/anvil-crimson-rivet.json)
- [anvil-iv-ram.json](../../../../../../content/base/frames/anvil-iv-ram.json)
- [thirdblade-swordfish-iii.json](../../../../../../content/base/frames/thirdblade-swordfish-iii.json)
- [thirdblade-swordfish-v5.json](../../../../../../content/base/frames/thirdblade-swordfish-v5.json)
- [thirdblade-binary-swordfish.json](../../../../../../content/base/frames/thirdblade-binary-swordfish.json)
- [tidefaith-redeemer-3.json](../../../../../../content/base/frames/tidefaith-redeemer-3.json)
- [shellsoc-ls3.json](../../../../../../content/base/frames/shellsoc-ls3.json)
- [shellsoc-surveyor-b.json](../../../../../../content/base/frames/shellsoc-surveyor-b.json)
- [backside-white-night.json](../../../../../../content/base/frames/backside-white-night.json)
- [mx-head-vulcan.json](../../../../../../content/base/frames/mx-head-vulcan.json)
- [mx-frame-strike.json](../../../../../../content/base/frames/mx-frame-strike.json)
- [mx-guard-stance.json](../../../../../../content/base/frames/mx-guard-stance.json)
- [mx-old-city-wall.json](../../../../../../content/base/frames/mx-old-city-wall.json)
- [mx-cloud-piercer.json](../../../../../../content/base/frames/mx-cloud-piercer.json)
- [mx-anvil-roar.json](../../../../../../content/base/frames/mx-anvil-roar.json)
- [mx-unbind-rite.json](../../../../../../content/base/frames/mx-unbind-rite.json)
- [mx-futu-charge.json](../../../../../../content/base/frames/mx-futu-charge.json)
- [mx-valkyrie-dive.json](../../../../../../content/base/frames/mx-valkyrie-dive.json)
- [mx-aurora-veil.json](../../../../../../content/base/frames/mx-aurora-veil.json)
- [mx-binary-cut.json](../../../../../../content/base/frames/mx-binary-cut.json)
- [mx-white-night-fade.json](../../../../../../content/base/frames/mx-white-night-fade.json)
- [mx-moonless-command.json](../../../../../../content/base/frames/mx-moonless-command.json)
- [mx-guarding.json](../../../../../../content/base/frames/mx-guarding.json)
- [mx-old-city.json](../../../../../../content/base/frames/mx-old-city.json)
- [mx-rivet-rally.json](../../../../../../content/base/frames/mx-rivet-rally.json)
- [mx-aurora-veiled.json](../../../../../../content/base/frames/mx-aurora-veiled.json)
- [mx-faded.json](../../../../../../content/base/frames/mx-faded.json)
- [mx-moonless-link.json](../../../../../../content/base/frames/mx-moonless-link.json)
- [mx-captain-line.json](../../../../../../content/base/frames/mx-captain-line.json)
- [mx-salvage-crew.json](../../../../../../content/base/frames/mx-salvage-crew.json)

abilities：

- [mx-biped-d.json](../../../../../../content/base/abilities/mx-biped-d.json)
- [mx-tracked-d.json](../../../../../../content/base/abilities/mx-tracked-d.json)
- [mx-biped-scout.json](../../../../../../content/base/abilities/mx-biped-scout.json)
- [mx-biped-c.json](../../../../../../content/base/abilities/mx-biped-c.json)
- [mx-hover-c.json](../../../../../../content/base/abilities/mx-hover-c.json)
- [mx-biped-heavy.json](../../../../../../content/base/abilities/mx-biped-heavy.json)
- [mx-biped-b.json](../../../../../../content/base/abilities/mx-biped-b.json)
- [mx-ace-a.json](../../../../../../content/base/abilities/mx-ace-a.json)
- [mx-winged-a.json](../../../../../../content/base/abilities/mx-winged-a.json)
- [mx-fortress-a.json](../../../../../../content/base/abilities/mx-fortress-a.json)
- [mx-selene-s.json](../../../../../../content/base/abilities/mx-selene-s.json)
- [bulwark-i.json](../../../../../../content/base/abilities/bulwark-i.json)
- [bulwark-i-beacon.json](../../../../../../content/base/abilities/bulwark-i-beacon.json)
- [bulwark-ii.json](../../../../../../content/base/abilities/bulwark-ii.json)
- [bulwark-ii-rivet.json](../../../../../../content/base/abilities/bulwark-ii-rivet.json)
- [bulwark-iv-rampart.json](../../../../../../content/base/abilities/bulwark-iv-rampart.json)
- [bulwark-old-city.json](../../../../../../content/base/abilities/bulwark-old-city.json)
- [longspear-v1.json](../../../../../../content/base/abilities/longspear-v1.json)
- [longspear-v1-guild.json](../../../../../../content/base/abilities/longspear-v1-guild.json)
- [longspear-v4.json](../../../../../../content/base/abilities/longspear-v4.json)
- [longspear-v4-saltgull.json](../../../../../../content/base/abilities/longspear-v4-saltgull.json)
- [longspear-v7.json](../../../../../../content/base/abilities/longspear-v7.json)
- [longspear-piercing-cloud.json](../../../../../../content/base/abilities/longspear-piercing-cloud.json)
- [union-fr7.json](../../../../../../content/base/abilities/union-fr7.json)
- [union-at12.json](../../../../../../content/base/abilities/union-at12.json)
- [union-futu.json](../../../../../../content/base/abilities/union-futu.json)
- [selene-silverring-g2.json](../../../../../../content/base/abilities/selene-silverring-g2.json)
- [selene-crescent-g5.json](../../../../../../content/base/abilities/selene-crescent-g5.json)
- [selene-valkyrie.json](../../../../../../content/base/abilities/selene-valkyrie.json)
- [selene-aurora.json](../../../../../../content/base/abilities/selene-aurora.json)
- [selene-eclipse-moonless.json](../../../../../../content/base/abilities/selene-eclipse-moonless.json)
- [anvil-ii.json](../../../../../../content/base/abilities/anvil-ii.json)
- [anvil-crimson-rivet.json](../../../../../../content/base/abilities/anvil-crimson-rivet.json)
- [anvil-iv-ram.json](../../../../../../content/base/abilities/anvil-iv-ram.json)
- [thirdblade-swordfish-iii.json](../../../../../../content/base/abilities/thirdblade-swordfish-iii.json)
- [thirdblade-swordfish-v5.json](../../../../../../content/base/abilities/thirdblade-swordfish-v5.json)
- [thirdblade-binary-swordfish.json](../../../../../../content/base/abilities/thirdblade-binary-swordfish.json)
- [tidefaith-redeemer-3.json](../../../../../../content/base/abilities/tidefaith-redeemer-3.json)
- [shellsoc-ls3.json](../../../../../../content/base/abilities/shellsoc-ls3.json)
- [shellsoc-surveyor-b.json](../../../../../../content/base/abilities/shellsoc-surveyor-b.json)
- [backside-white-night.json](../../../../../../content/base/abilities/backside-white-night.json)
- [mx-head-vulcan.json](../../../../../../content/base/abilities/mx-head-vulcan.json)
- [mx-frame-strike.json](../../../../../../content/base/abilities/mx-frame-strike.json)
- [mx-guard-stance.json](../../../../../../content/base/abilities/mx-guard-stance.json)
- [mx-old-city-wall.json](../../../../../../content/base/abilities/mx-old-city-wall.json)
- [mx-cloud-piercer.json](../../../../../../content/base/abilities/mx-cloud-piercer.json)
- [mx-anvil-roar.json](../../../../../../content/base/abilities/mx-anvil-roar.json)
- [mx-unbind-rite.json](../../../../../../content/base/abilities/mx-unbind-rite.json)
- [mx-futu-charge.json](../../../../../../content/base/abilities/mx-futu-charge.json)
- [mx-valkyrie-dive.json](../../../../../../content/base/abilities/mx-valkyrie-dive.json)
- [mx-aurora-veil.json](../../../../../../content/base/abilities/mx-aurora-veil.json)
- [mx-binary-cut.json](../../../../../../content/base/abilities/mx-binary-cut.json)
- [mx-white-night-fade.json](../../../../../../content/base/abilities/mx-white-night-fade.json)
- [mx-moonless-command.json](../../../../../../content/base/abilities/mx-moonless-command.json)
- [mx-guarding.json](../../../../../../content/base/abilities/mx-guarding.json)
- [mx-old-city.json](../../../../../../content/base/abilities/mx-old-city.json)
- [mx-rivet-rally.json](../../../../../../content/base/abilities/mx-rivet-rally.json)
- [mx-aurora-veiled.json](../../../../../../content/base/abilities/mx-aurora-veiled.json)
- [mx-faded.json](../../../../../../content/base/abilities/mx-faded.json)
- [mx-moonless-link.json](../../../../../../content/base/abilities/mx-moonless-link.json)
- [mx-captain-line.json](../../../../../../content/base/abilities/mx-captain-line.json)
- [mx-salvage-crew.json](../../../../../../content/base/abilities/mx-salvage-crew.json)

effects：

- [mx-biped-d.json](../../../../../../content/base/effects/mx-biped-d.json)
- [mx-tracked-d.json](../../../../../../content/base/effects/mx-tracked-d.json)
- [mx-biped-scout.json](../../../../../../content/base/effects/mx-biped-scout.json)
- [mx-biped-c.json](../../../../../../content/base/effects/mx-biped-c.json)
- [mx-hover-c.json](../../../../../../content/base/effects/mx-hover-c.json)
- [mx-biped-heavy.json](../../../../../../content/base/effects/mx-biped-heavy.json)
- [mx-biped-b.json](../../../../../../content/base/effects/mx-biped-b.json)
- [mx-ace-a.json](../../../../../../content/base/effects/mx-ace-a.json)
- [mx-winged-a.json](../../../../../../content/base/effects/mx-winged-a.json)
- [mx-fortress-a.json](../../../../../../content/base/effects/mx-fortress-a.json)
- [mx-selene-s.json](../../../../../../content/base/effects/mx-selene-s.json)
- [bulwark-i.json](../../../../../../content/base/effects/bulwark-i.json)
- [bulwark-i-beacon.json](../../../../../../content/base/effects/bulwark-i-beacon.json)
- [bulwark-ii.json](../../../../../../content/base/effects/bulwark-ii.json)
- [bulwark-ii-rivet.json](../../../../../../content/base/effects/bulwark-ii-rivet.json)
- [bulwark-iv-rampart.json](../../../../../../content/base/effects/bulwark-iv-rampart.json)
- [bulwark-old-city.json](../../../../../../content/base/effects/bulwark-old-city.json)
- [longspear-v1.json](../../../../../../content/base/effects/longspear-v1.json)
- [longspear-v1-guild.json](../../../../../../content/base/effects/longspear-v1-guild.json)
- [longspear-v4.json](../../../../../../content/base/effects/longspear-v4.json)
- [longspear-v4-saltgull.json](../../../../../../content/base/effects/longspear-v4-saltgull.json)
- [longspear-v7.json](../../../../../../content/base/effects/longspear-v7.json)
- [longspear-piercing-cloud.json](../../../../../../content/base/effects/longspear-piercing-cloud.json)
- [union-fr7.json](../../../../../../content/base/effects/union-fr7.json)
- [union-at12.json](../../../../../../content/base/effects/union-at12.json)
- [union-futu.json](../../../../../../content/base/effects/union-futu.json)
- [selene-silverring-g2.json](../../../../../../content/base/effects/selene-silverring-g2.json)
- [selene-crescent-g5.json](../../../../../../content/base/effects/selene-crescent-g5.json)
- [selene-valkyrie.json](../../../../../../content/base/effects/selene-valkyrie.json)
- [selene-aurora.json](../../../../../../content/base/effects/selene-aurora.json)
- [selene-eclipse-moonless.json](../../../../../../content/base/effects/selene-eclipse-moonless.json)
- [anvil-ii.json](../../../../../../content/base/effects/anvil-ii.json)
- [anvil-crimson-rivet.json](../../../../../../content/base/effects/anvil-crimson-rivet.json)
- [anvil-iv-ram.json](../../../../../../content/base/effects/anvil-iv-ram.json)
- [thirdblade-swordfish-iii.json](../../../../../../content/base/effects/thirdblade-swordfish-iii.json)
- [thirdblade-swordfish-v5.json](../../../../../../content/base/effects/thirdblade-swordfish-v5.json)
- [thirdblade-binary-swordfish.json](../../../../../../content/base/effects/thirdblade-binary-swordfish.json)
- [tidefaith-redeemer-3.json](../../../../../../content/base/effects/tidefaith-redeemer-3.json)
- [shellsoc-ls3.json](../../../../../../content/base/effects/shellsoc-ls3.json)
- [shellsoc-surveyor-b.json](../../../../../../content/base/effects/shellsoc-surveyor-b.json)
- [backside-white-night.json](../../../../../../content/base/effects/backside-white-night.json)
- [mx-head-vulcan.json](../../../../../../content/base/effects/mx-head-vulcan.json)
- [mx-frame-strike.json](../../../../../../content/base/effects/mx-frame-strike.json)
- [mx-guard-stance.json](../../../../../../content/base/effects/mx-guard-stance.json)
- [mx-old-city-wall.json](../../../../../../content/base/effects/mx-old-city-wall.json)
- [mx-cloud-piercer.json](../../../../../../content/base/effects/mx-cloud-piercer.json)
- [mx-anvil-roar.json](../../../../../../content/base/effects/mx-anvil-roar.json)
- [mx-unbind-rite.json](../../../../../../content/base/effects/mx-unbind-rite.json)
- [mx-futu-charge.json](../../../../../../content/base/effects/mx-futu-charge.json)
- [mx-valkyrie-dive.json](../../../../../../content/base/effects/mx-valkyrie-dive.json)
- [mx-aurora-veil.json](../../../../../../content/base/effects/mx-aurora-veil.json)
- [mx-binary-cut.json](../../../../../../content/base/effects/mx-binary-cut.json)
- [mx-white-night-fade.json](../../../../../../content/base/effects/mx-white-night-fade.json)
- [mx-moonless-command.json](../../../../../../content/base/effects/mx-moonless-command.json)
- [mx-guarding.json](../../../../../../content/base/effects/mx-guarding.json)
- [mx-old-city.json](../../../../../../content/base/effects/mx-old-city.json)
- [mx-rivet-rally.json](../../../../../../content/base/effects/mx-rivet-rally.json)
- [mx-aurora-veiled.json](../../../../../../content/base/effects/mx-aurora-veiled.json)
- [mx-faded.json](../../../../../../content/base/effects/mx-faded.json)
- [mx-moonless-link.json](../../../../../../content/base/effects/mx-moonless-link.json)
- [mx-captain-line.json](../../../../../../content/base/effects/mx-captain-line.json)
- [mx-salvage-crew.json](../../../../../../content/base/effects/mx-salvage-crew.json)

aiprofiles：

- [mx-biped-d.json](../../../../../../content/base/aiprofiles/mx-biped-d.json)
- [mx-tracked-d.json](../../../../../../content/base/aiprofiles/mx-tracked-d.json)
- [mx-biped-scout.json](../../../../../../content/base/aiprofiles/mx-biped-scout.json)
- [mx-biped-c.json](../../../../../../content/base/aiprofiles/mx-biped-c.json)
- [mx-hover-c.json](../../../../../../content/base/aiprofiles/mx-hover-c.json)
- [mx-biped-heavy.json](../../../../../../content/base/aiprofiles/mx-biped-heavy.json)
- [mx-biped-b.json](../../../../../../content/base/aiprofiles/mx-biped-b.json)
- [mx-ace-a.json](../../../../../../content/base/aiprofiles/mx-ace-a.json)
- [mx-winged-a.json](../../../../../../content/base/aiprofiles/mx-winged-a.json)
- [mx-fortress-a.json](../../../../../../content/base/aiprofiles/mx-fortress-a.json)
- [mx-selene-s.json](../../../../../../content/base/aiprofiles/mx-selene-s.json)
- [bulwark-i.json](../../../../../../content/base/aiprofiles/bulwark-i.json)
- [bulwark-i-beacon.json](../../../../../../content/base/aiprofiles/bulwark-i-beacon.json)
- [bulwark-ii.json](../../../../../../content/base/aiprofiles/bulwark-ii.json)
- [bulwark-ii-rivet.json](../../../../../../content/base/aiprofiles/bulwark-ii-rivet.json)
- [bulwark-iv-rampart.json](../../../../../../content/base/aiprofiles/bulwark-iv-rampart.json)
- [bulwark-old-city.json](../../../../../../content/base/aiprofiles/bulwark-old-city.json)
- [longspear-v1.json](../../../../../../content/base/aiprofiles/longspear-v1.json)
- [longspear-v1-guild.json](../../../../../../content/base/aiprofiles/longspear-v1-guild.json)
- [longspear-v4.json](../../../../../../content/base/aiprofiles/longspear-v4.json)
- [longspear-v4-saltgull.json](../../../../../../content/base/aiprofiles/longspear-v4-saltgull.json)
- [longspear-v7.json](../../../../../../content/base/aiprofiles/longspear-v7.json)
- [longspear-piercing-cloud.json](../../../../../../content/base/aiprofiles/longspear-piercing-cloud.json)
- [union-fr7.json](../../../../../../content/base/aiprofiles/union-fr7.json)
- [union-at12.json](../../../../../../content/base/aiprofiles/union-at12.json)
- [union-futu.json](../../../../../../content/base/aiprofiles/union-futu.json)
- [selene-silverring-g2.json](../../../../../../content/base/aiprofiles/selene-silverring-g2.json)
- [selene-crescent-g5.json](../../../../../../content/base/aiprofiles/selene-crescent-g5.json)
- [selene-valkyrie.json](../../../../../../content/base/aiprofiles/selene-valkyrie.json)
- [selene-aurora.json](../../../../../../content/base/aiprofiles/selene-aurora.json)
- [selene-eclipse-moonless.json](../../../../../../content/base/aiprofiles/selene-eclipse-moonless.json)
- [anvil-ii.json](../../../../../../content/base/aiprofiles/anvil-ii.json)
- [anvil-crimson-rivet.json](../../../../../../content/base/aiprofiles/anvil-crimson-rivet.json)
- [anvil-iv-ram.json](../../../../../../content/base/aiprofiles/anvil-iv-ram.json)
- [thirdblade-swordfish-iii.json](../../../../../../content/base/aiprofiles/thirdblade-swordfish-iii.json)
- [thirdblade-swordfish-v5.json](../../../../../../content/base/aiprofiles/thirdblade-swordfish-v5.json)
- [thirdblade-binary-swordfish.json](../../../../../../content/base/aiprofiles/thirdblade-binary-swordfish.json)
- [tidefaith-redeemer-3.json](../../../../../../content/base/aiprofiles/tidefaith-redeemer-3.json)
- [shellsoc-ls3.json](../../../../../../content/base/aiprofiles/shellsoc-ls3.json)
- [shellsoc-surveyor-b.json](../../../../../../content/base/aiprofiles/shellsoc-surveyor-b.json)
- [backside-white-night.json](../../../../../../content/base/aiprofiles/backside-white-night.json)
- [mx-head-vulcan.json](../../../../../../content/base/aiprofiles/mx-head-vulcan.json)
- [mx-frame-strike.json](../../../../../../content/base/aiprofiles/mx-frame-strike.json)
- [mx-guard-stance.json](../../../../../../content/base/aiprofiles/mx-guard-stance.json)
- [mx-old-city-wall.json](../../../../../../content/base/aiprofiles/mx-old-city-wall.json)
- [mx-cloud-piercer.json](../../../../../../content/base/aiprofiles/mx-cloud-piercer.json)
- [mx-anvil-roar.json](../../../../../../content/base/aiprofiles/mx-anvil-roar.json)
- [mx-unbind-rite.json](../../../../../../content/base/aiprofiles/mx-unbind-rite.json)
- [mx-futu-charge.json](../../../../../../content/base/aiprofiles/mx-futu-charge.json)
- [mx-valkyrie-dive.json](../../../../../../content/base/aiprofiles/mx-valkyrie-dive.json)
- [mx-aurora-veil.json](../../../../../../content/base/aiprofiles/mx-aurora-veil.json)
- [mx-binary-cut.json](../../../../../../content/base/aiprofiles/mx-binary-cut.json)
- [mx-white-night-fade.json](../../../../../../content/base/aiprofiles/mx-white-night-fade.json)
- [mx-moonless-command.json](../../../../../../content/base/aiprofiles/mx-moonless-command.json)
- [mx-guarding.json](../../../../../../content/base/aiprofiles/mx-guarding.json)
- [mx-old-city.json](../../../../../../content/base/aiprofiles/mx-old-city.json)
- [mx-rivet-rally.json](../../../../../../content/base/aiprofiles/mx-rivet-rally.json)
- [mx-aurora-veiled.json](../../../../../../content/base/aiprofiles/mx-aurora-veiled.json)
- [mx-faded.json](../../../../../../content/base/aiprofiles/mx-faded.json)
- [mx-moonless-link.json](../../../../../../content/base/aiprofiles/mx-moonless-link.json)
- [mx-captain-line.json](../../../../../../content/base/aiprofiles/mx-captain-line.json)
- [mx-salvage-crew.json](../../../../../../content/base/aiprofiles/mx-salvage-crew.json)

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content-mech/cx-mx-body/REPORT.md`。

## 沒做到或證據不足的

無未完成項。驗證範圍依交接書固定四項，未另跑 sim 或額外測試；極光帷幕保留清單指定的 sustained＋whileSource，未觸發替代寫法。所有跨工人部件引用自查時已落檔，沒有略過型別或尺寸檢查。

## 需要決定的事

無阻塞決定。`content/lore/style.md` 的資源顯示名為「燼／流光」，manifest/style 則指定「熱量／源能」；本線依交接書採清單，建議日後統一成「燼／流光」，本次不改名。

## 偏離清單

HP 調整遵守交接書「總 HP 誤差 ±5%」：僅當逐層加總超出範圍才按比例縮放並四捨五入，尾層補齊整數差；各部位與層順序保持原設計。下表列出每筆偏離。

| id | 清單寫什麼 | 實際寫法 | 原因 |
|---|---|---|---|
| bodyplan/mx-tracked-d | 層和 250；目標 300 | 等比調至 300 | 符合 HP 門檻 |
| bodyplan/mx-biped-scout | 層和 230；目標 210 | 等比調至 210 | 符合 HP 門檻 |
| bodyplan/mx-biped-c | 層和 390；目標 370 | 等比調至 370 | 符合 HP 門檻 |
| bodyplan/mx-ace-a | 層和 560；目標 600 | 等比調至 600 | 符合 HP 門檻 |
| bodyplan/mx-winged-a | 層和 445；目標 520 | 等比調至 520 | 符合 HP 門檻 |
| bodyplan/mx-fortress-a | 層和 700；目標 760 | 等比調至 760 | 符合 HP 門檻 |
| bodyplan/mx-selene-s | 層和 645；目標 820 | 等比調至 820 | 符合 HP 門檻 |
| bodyplan/mx-selene-s | 共通範本 conduct 對 pilot | cockpit-shell layerHit 對 allSeats，chance 0.2 | 本骨架只有兩個 soul 座位；保留座艙受擊傳導 |

未列出的必填欄依範本補齊：一般座位 pilot＋soul、backMount size2、systemMount／sensorMount／armorMount size1；非特殊迴避效果使用 refresh。AI params 均有 src/ai 實際讀取點（strategy.ts、score.ts、retreat.ts、agent.ts），無刪除或新增清單以外參數。

## 以後交接書該點名的工具

無。

# cx-content-scenarios：兩張地圖、兩個情境與內容說明已完成

## 做了什麼

依凍結契約 §0、§3 完成指定五檔。兩張地圖由 `/tmp/cx-content-scenarios/generate-maps.py` 一次性產生，cells 分別為 400 與 3600 字元，逐列串接；皆有殘牆、瓦礫與淺灘，大圖另有蝕地及酸沼帶。部署區容納各 slot 單位且避開殘牆，撤離區為玩家側整條西邊。

兩情境依契約設定 4 對 4、玩家與友軍共 10 對蟲群 10，座位、目標、seed 與 rounds 均照表；單位位置皆為 `zone`。README 記載各子目錄件數、id 命名、規格連結、驗證指令與指定的古代機甲命名說明。

開工與每類完成皆執行 `npm run check`，每類完成後執行 inbox 輪詢。本線僅新增指定五檔與本 REPORT，未修改既有檔、未 commit。五檔合計 18,047 bytes，README 為 2,092 bytes，均在容量 gate 內。

地圖階段曾出現兩筆 `terrain/plain` 缺失引用；領導依 orders 已補齊 `content/base/terrains/plain.json`，此檔不是本線產出。後續情境及最終檢查皆為零錯誤、零警告，含 `map: 2` 與 `scenario: 2`；領導可依固定驗收重跑。

## 產出（5 個檔的清單）

- `content/base/maps/skirmish-20.json` — `map/skirmish-20`
- `content/base/maps/rift-edge-60.json` — `map/rift-edge-60`
- `content/base/scenarios/skirmish-whitegloves.json` — `scenario/skirmish-whitegloves`
- `content/base/scenarios/rift-edge-nest.json` — `scenario/rift-edge-nest`
- `content/README.md`

以上路徑皆相對於 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 沒做到或證據不足的

無。依交接書只執行固定驗收，未增加平衡或遊玩測試。

## 需要決定的事

無。`terrain/plain` 缺失已由領導處理。

## SPEC-GAP 清單

frame schema 沒有描述或別名欄，無法在機體資料中保存古代機甲原始無名及不同勢力稱呼；依契約僅在 README 保留指定說明，未改 schema 或機體檔。本線地圖與情境欄位無需降級。

最後一次 `npm run check` 輸出：

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
terrain: 6
map: 2
faction: 3
species: 4
monster: 3
scenario: 2
aiprofile: 5
curve: 1
registries: 7/7
rules: 4/4
OK 0 errors, 0 warnings
```

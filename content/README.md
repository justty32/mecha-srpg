# base 內容包

`base/pack.json` 宣告內容包識別、版本與相依；以下件數為本批內容交付時的 JSON 檔數。

## 目錄一覽

- [registries/](base/registries/)：列舉值登記，共 7 件。
- [rules/](base/rules/)：常數與戰鬥規則資料，共 4 件。
- [bodyplans/](base/bodyplans/)：部位、層與座位佈局，共 7 件。
- [frames/](base/frames/)：機體型號與資源池，共 7 件。
- [components/](base/components/)：可裝配部件，共 7 件。
- [abilities/](base/abilities/)：能力、成本與 AI 提示，共 14 件。
- [effects/](base/effects/)：狀態、特質與天賦效果，共 20 件。
- [persons/](base/persons/)：駕駛員與機魂，共 7 件。
- [soultrees/](base/soultrees/)：機魂天賦樹，共 2 件。
- [terrains/](base/terrains/)：地形通行、掩蔽與危害，共 6 件。
- [maps/](base/maps/)：地勢、部署區與撤離邊，共 2 件。
- [factions/](base/factions/)：勢力關係與感測方式，共 3 件。
- [species/](base/species/)：怪獸族與行為，共 4 件。
- [monsters/](base/monsters/)：怪獸個體與等級，共 3 件。
- [scenarios/](base/scenarios/)：參戰單位與勝負目標，共 2 件。
- [aiprofiles/](base/aiprofiles/)：AI 策略參數，共 5 件。
- [curves/](base/curves/)：成長曲線，共 1 件。

## 命名與新增內容

id 使用 `pack:kind/name`，同包引用省略 `pack:`；例如 `base:map/skirmish-20` 在 base 包內寫成 `map/skirmish-20`。一檔一筆，檔名等於 name 段並加 `.json`，名稱使用 kebab-case。

新增 X 要改哪些檔：見 [content-format 規格](../wf/workflows/planning/specs/core/content-format.md)。

## 驗證

在專案根目錄執行 `npm run check`；成功末行為 `OK 0 errors, 0 warnings`。

## 古代機甲的名字

古代機甲本身沒有名字，`name` 是人取的稱號，通常引用神話傳說；`frame/ancient-rearguard` 叫「刑天」（中國神話中斷首仍戰的戰神），原始無名。frame schema 目前沒有描述或別名欄，不同勢力的叫法暫不入資料。

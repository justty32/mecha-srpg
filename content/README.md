# base 內容包

`base/pack.json` 宣告內容包識別、版本與相依；以下件數為各目錄的 JSON 檔數（2026-10-24 lead-tidy 重數；逐種類總表見 `content/index/_summary.json`）。

## 目錄一覽

<!-- wf-nav -->
- [registries/](base/registries/)：列舉值登記，共 7 件。
- [rules/](base/rules/)：常數與戰鬥規則資料，共 4 件。
- [bodyplans/](base/bodyplans/)：部位、層與座位佈局，共 39 件。
- [frames/](base/frames/)：機體型號與資源池，共 89 件。
- [components/](base/components/)：可裝配部件，共 54 件。
- [abilities/](base/abilities/)：能力、成本與 AI 提示，共 128 件。
- [effects/](base/effects/)：狀態、特質與天賦效果，共 124 件。
- [persons/](base/persons/)：駕駛員與機魂，共 37 件。
- [soultrees/](base/soultrees/)：機魂天賦樹，共 6 件。
- [terrains/](base/terrains/)：地形通行、掩蔽與危害，共 23 件。
- [maps/](base/maps/)：地勢、部署區與撤離邊，共 17 件。
- [factions/](base/factions/)：勢力關係與感測方式，共 10 件。
- [species/](base/species/)：怪獸族與行為，共 18 件。
- [monsters/](base/monsters/)：怪獸個體與等級，共 28 件。
- [scenarios/](base/scenarios/)：參戰單位與勝負目標，共 26 件。
- [aiprofiles/](base/aiprofiles/)：AI 策略參數，共 16 件。
- [curves/](base/curves/)：成長曲線，共 1 件。
- [world/](base/world/)：營運層世界資料（節點、勢力營運、契約、事件、市場等，子資料夾分類），共 317 件。

## 命名與新增內容

id 使用 `pack:kind/name`，同包引用省略 `pack:`；例如 `base:map/skirmish-20` 在 base 包內寫成 `map/skirmish-20`。一檔一筆，檔名等於 name 段並加 `.json`，名稱使用 kebab-case。

新增 X 要改哪些檔：見 [content-format 規格](../wf/workflows/planning/specs/core/content-format.md)。

## 索引與批次帳本

遊戲照舊「一檔一筆 JSON」；另有兩份給 agent 查的帳本，都不被載入器與百科讀：

- [index/](index/README.md)：按類別分片的內容索引（每個有 `id` 的檔一列：id、等級、名稱、勢力／族／血統、tags、所屬批次、狀態），`npm run content:index` 產生、`npm test` 驗不過時。查詢先看 `index/_summary.json`，再帶條件查分片，不整份讀。
- [batches/](batches/README.md)：每批 agent 產出的 manifest（模式、允許範圍、作者模型、新增檔、驗收結果、被擋下的越界嘗試）。流程見 [content 工作流的 batch](../wf/workflows/content/batch.md)。

新增檔後先 `git add`，再 `npm run content:index`，一起 commit。

## 驗證

在專案根目錄執行 `npm run check`；成功末行為 `OK 0 errors, 0 warnings`。

## 古代機甲的名字

古代機甲本身沒有名字，`name` 是人取的稱號，通常引用神話傳說；`frame/ancient-rearguard` 叫「刑天」（中國神話中斷首仍戰的戰神），原始無名。frame schema 目前沒有描述或別名欄，不同勢力的叫法暫不入資料。

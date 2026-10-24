# polish — 潤飾模式：只改文字欄的批次

[content README](README.md)｜批次流程 [batch](batch.md)｜文字準則 [lore-text](lore-text.md)「文字潤飾準則」｜風格 [style.md](../../../content/lore/style.md)

把既有 JSON 的玩家可見文字改得更像人寫的，**結構與數值一個位元都不動**。走 [batch](batch.md) 的同一條流程，manifest `mode:"polish"`；本頁只寫潤飾模式不同的地方。

**何時用**：「潤飾文案」「統一用語」「把翻譯腔改掉」，且改動只落在文字欄。
**何時不用**：改顯示名要全庫連動（lore、catalog、templates 一起改）→ 仍可用本模式，但 `polishFiles` 要把所有同名處列進來；要改數值、tags、引用、加欄位 → 不是潤飾，走 [README](README.md) 流程或 feature-dev。

## Done when

- manifest `mode:"polish"`、`allow.polishFiles` 列出每個要改的檔（glob 也可，但越窄越好），`content_accept.sh` 末行 `ACCEPT`。
- 帶回後 `npm test` 綠（黃金與營運 hash 不變——潤飾不該動 hash）。

## 閘門怎麼判（`content_gate.py` polish 模式）

逐檔把 base 版本與新版本**解析成 JSON 後逐節點比對**（排版、縮排、鍵順序不算改動）：

| 情況 | 代碼 | 判定 |
|---|---|---|
| 檔不在 `polishFiles` | `POLISH-SCOPE` | 拒 |
| 新增或刪除檔 | `ADD`／`DELETE` | 拒 |
| 物件鍵集合變動（增欄、刪欄） | `POLISH-KEYS` | 拒 |
| 陣列長度變動（增刪選項、台詞） | `POLISH-LENGTH` | 拒 |
| 值的型別變動（數字改字串…） | `POLISH-TYPE` | 拒 |
| 非字串值變動（數字、布林） | `POLISH-VALUE` | 拒 |
| 字串值變動，但最近的物件鍵不在文字欄白名單（`id`、`tags`、引用欄、`when`…） | `POLISH-FIELD` | 拒 |
| 新舊值任一像 id 引用（`kind/name`、`pack:kind/name`） | `POLISH-IDREF` | 拒 |
| 字串值變動且鍵在白名單 | — | 通過 |

**文字欄白名單**（工具內建，manifest `allow.textFields` 只能再縮小）：`name`、`title`、`summary`、`body`、`desc`、`description`、`text`、`label`、`brief`、`lines`、`phrase`、`phrases`、`badge`、`note`、`aka`、`epithet`、`flavor`。陣列裡的字串（`lines[2]`、`choices[1].text`）以最近的物件鍵判定。帶回時目的地檔必須仍等於 base 版本，否則拒絕覆蓋（防蓋掉別線同時的改動）。

## 交接書要寫的

- 每檔保留原意與事件走向，只改說法；不新增具名人物、不寫 `{佔位}`；禁用詞照 style.md。
- REPORT 逐檔附「舊→新」對照（至少主文字欄全文），驗收時抽查語感。
- 檢查：`npm run check`；改到 `content/base/world/` 另跑 `node src/ops/content/check.ts content/base`；改到 lore 跑 `node content/lore/check.ts`。

## 交接

- 一批的完整步驟 → [batch](batch.md)；文字怎麼改才好 → [lore-text](lore-text.md)。

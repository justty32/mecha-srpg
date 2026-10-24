# content/index — 內容索引（生成，不手寫）

[content 包說明](../README.md)｜批次帳本 [batches](../batches/README.md)｜流程 [content 工作流](../../wf/workflows/content/README.md)

`content/base/`、`content/lore/` 每個有 `id` 的 JSON 一列，由 `npm run content:index` 產生；`npm test` 會驗它與實際檔案一致，過時就紅。遊戲載入器與百科都不讀這裡。

**按類別分片**：一片一個 `<pack>-<kind>.json`（例 `base-frame.json`、`base-monster.json`、`lore-character.json`）；不足 1 KB 的小類併進 `<pack>-misc.json`；單片超過 2000 列或 512 KB 再按等級分成 `<pack>-<kind>-<grade>.json`。哪幾片、各幾列、各級分布看 [_summary.json](_summary.json)（永遠 ≤ 8 KB）。

**只准帶條件查分片，不整份讀**（鐵律 3）：先看 `_summary.json` 找分片，再用資料檔工具的 `find`／`grep` 取需要的列；查法見 [data-files](../../wf/workflows/common/data-files.md)。引用數會頻繁變動，不進分片，要時用產生器的 `refs` 子指令即時算。

欄位：`id`；`kind`（id 前綴）；`grade`（grade／tier／soulGrade，species 等為等級範圍）；`name`（怪獸個體沒名字時取族名）；`faction`／`family`／`lineage`（分組欄，取自欄位與 `faction-*`／`lineage-*` tags，怪獸的 family 由 species 推）；`tags`（空白分隔）；`path`（相對本資料夾的檔案連結）；`batch`（產出它的批次，舊內容空白）；`status`（active／draft／deprecated）。

只索引 git 追蹤中（含已 `git add`）的檔：新檔 `git add` 之後再重產索引，兩者一起 commit。

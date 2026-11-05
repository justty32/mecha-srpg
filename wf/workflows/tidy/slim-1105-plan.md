# slim-1105 — 全 repo 瘦身、拆檔與 tidy 計畫（只盤點，未執行）

[tidy](README.md)｜刪除分類 [slim-1105-delete](slim-1105-delete.md)｜規則草稿 [slim-1105-rules](slim-1105-rules.md)｜拆檔與 tidy [slim-1105-refactor](slim-1105-refactor.md)

2026-11-05 盤點，HEAD `2ab4e7a2`。只讀，沒有刪、改或 commit，也沒有跑 node。量測用 `git ls-files`＋python，只算進版控的檔。

## 量體

- 現行工作樹：**7436 檔，83.2 MB**。`wf/` 52.1 MB（其中 `dispatch/handoffs/` 48.7 MB，3011 檔），`art/` 21.4 MB，`content/` 6.2 MB，`src/` 2.6 MB，`test/` 0.5 MB，`legacy/` 0.3 MB。
- 另外未進版控：`node_modules/` 234 MB、`dist/`，都已被 `.gitignore` 排除，不在本計畫內。
- `.git` 46 MB（pack 18.3 MiB）。只供參考：不改歷史，也不 force push。刪掉現行檔不會縮小 `.git`。

最大的檔：`night-combat-lead-1028/ck/evidence/mcp-rpc.json` 2.2 MB、`art/mech-blueprint/data/overlaps.json` 1.5 MB、`art/canvas-mech/viewer/evidence/*.png`（每張 0.6–1.2 MB，共 20 張）。各類候選逐列見 [slim-1105-candidates.json](slim-1105-candidates.json)（25 列）；前 30 大目錄與前 30 大檔在 [slim-1105-sizes.json](slim-1105-sizes.json)。

## 能省多少

| 類 | 內容 | 檔數 | 大小 |
|----|------|------|------|
| A 封存 | `handoffs/done/`、inbox archive／done、`wf/archive/` | 1253 | 15.9 MB |
| B 只增紀錄 | 42 條舊線的證據、log、圖，收工流水；backlog 已完成列另外修剪 | 531 | 18.3 MB |
| C 過時工作文件 | 42 條舊線剩下的交接書、REPORT、STATE、交棒散檔、舊 orders | 1205 | 13.9 MB |
| A＋B＋C | | **約 2990** | **約 48.1 MB（58%）** |
| D 需個別決定 | legacy、art 四個試作、10/28 審閱資料、plan／talk、1029 spec | 420 | 23.2 MB |

刪完 A～C 後剩約 4450 檔、35 MB。如果 D 照建議只刪證據圖和大 json，還能再省約 14 MB。

## 執行前要先做的三件事

1. **搬走兩份會被讀的封存檔**：`specs/core/adoption.json` 有 131 列的 `table_path` 指向 `done/2026-10-23/` 底下的兩份 mechanics 表。先 `git mv` 到 `specs/core/ref/`，再跑 `fix_moved_links.py`。
2. **依 audit-paused-1105 關掉四條暫停線**：bigfill、pilots、small 可以收；gear 有 I01／I02 要修。SESSION-LOG 裡指向 `next-session.md` 等檔的四行，要改寫成 audit 的結論，或改記到 engine-backlog。
3. **確認 fix-playtest worktree 沒有引用要刪的路徑**：它的 diff 只碰 src、content 和 code-map.json，看起來沒有引用。

## 不確定、需要使用者點頭的

- 盤點後主工作樹新出現 `wf/notes/investigations/test-prune-1105/`（其他 agent 今天的產物，未進版控），歸 E，不在本計畫內。
- D 類每一項，見 [slim-1105-delete](slim-1105-delete.md)「D」段。
- 四條暫停線：要正式當作「收線」，還是只刪紀錄、在 backlog 留一行剩餘工作。
- `engine-backlog.json` 的 `來源` 欄有 70 個連結指向要刪的 REPORT。可以改成純文字線名，也可以清空。
- 兩段 src 註解（`src/rules/index.ts:4`、`src/ai/adapters/rules-adapter.ts:3`）指向早就不存在的 handoff 路徑，本來就是斷的。`e2e/ops-campaign.spec.ts:6` 指向 done 路徑。這三處都只是註解，改不改都不影響執行。

## 執行順序（建議）

先處理 A～C 的刪除和連結修補（一個 commit，wf-lint 全綠），再定 D，接著改規則（slim-1105-rules），再做 tidy（G）。F 的程式拆檔要排在 fix-playtest merge 之後，並且照 refactor 工作流先跑測試基準；這一步要跑 node，必須遵守全機一次一個 node 程序的限制。

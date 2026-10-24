# cx-content：內容層與 base 包驗證通過，commit 因 .git 唯讀而阻塞

## 做了什麼

完成 registry、手寫 JSON Schema 子集驗證器、深凍結 ContentDB、pack 載入器與 CLI；包含依賴排序、完整 id 正規化、覆寫警告、參照存在、登記值、NumExpr 根與池宣告檢查。凍結契約檔未修改，未引用其他工人的 RNG／NumExpr／eventlog 模組。

五個最小範例直接保留 content-format.md 的 JSON 原文，其餘資料補齊全部參照。只寫交接書逐一列出的 41 個檔與本 REPORT，測試恰好 10 個，未擴增驗收。

固定驗收第 1 條已通過：`npm run check` exit 0，輸出如下。

```text
pack base 0.1.0
frame: 2
bodyplan: 2
component: 1
ability: 4
effect: 7
person: 2 (human 1, soul 1)
soultree: 1
terrain: 1
species: 1
aiprofile: 1
curve: 1
registries: 7/7
rules: 4/4
OK 0 errors, 0 warnings
```

固定驗收第 2 條依上游 orders（2026-10-23T22:45:14+08:00）改用 `node --test --test-isolation=none --test-reporter=tap src/content/content.test.ts`，exit 0，`# tests 10`、`# pass 10`、`# fail 0`。

## 產出

工作分支沿用 `main`，未建立分支、未 push。產物在 `/home/lorkhan/repo/game_dev/mecha-srpg/` 下：

- `src/content/registry.ts`、`schema.ts`、`contentdb.ts`、`loader.ts`、`content.test.ts`：共 26,140 bytes。
- `schemas/content.schema.json`：手寫 schema，涵蓋全部 16 種 content kind 與共用片段。
- `content/base/`：35 個資料檔，共 17,398 bytes。
- `wf/workflows/dispatch/handoffs/lead-impl-foundation/cx-content/REPORT.md`：本報告，固定驗收第 4 條交付物。

共 41 個實作／資料檔，加 REPORT 為 42 個；未觸發檔數或容量 gate。交接書工作步驟寫「34 個資料檔」，但逐檔清單實際為 35 個；本線依逐檔清單與總數 41 執行。

## 沒做到或證據不足的

狀態：**BLOCKED**。固定驗收第 3 條未完成：commit 尚未建立，這些產物保留在工作目錄中，未回滾。

提交前已明確逐檔列出 41 個路徑。執行 `git add --` 時即被沙箱阻擋，exit 128；因使用 `set -e`，後續 `git commit --only` 未執行。

```text
fatal: Unable to create '/home/lorkhan/repo/game_dev/mecha-srpg/.git/index.lock': Read-only file system
```

解除條件：由可寫入本 repo `.git` 的上游執行逐檔 staging 與 commit，訊息為 `foundation: content 載入器、schema 與 base 內容包`，commit 僅收這 41 個實作／資料檔，再完成原定第 3 條的 commit 範圍與工作目錄檢查。本 REPORT 不混入該筆 41 檔 commit。

原本不帶 `--test-isolation=none` 的測試指令，依 orders 留給領導在沙箱外重跑；本線沒有把環境隔離差異當測試失敗，也沒有增加其他驗收。

## 需要決定的事

SPEC-GAP：契約未指定多 pack 規則表合併方式。`src/content/loader.ts` 已註記最小解法：constants 後到覆寫同鍵，damage-modifiers／morale-events／injuries 按載入順序附加。後續若要列式規則覆寫，需要領導另定契約。

其他需上游處理：在具 `.git` 寫入權限的環境完成指定 commit；本線不要求新增驗收或修改權限設定。

以後交接書該點名的工具：無。

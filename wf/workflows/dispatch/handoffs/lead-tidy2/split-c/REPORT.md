# cx-td2-split-c REPORT

## 做了什麼

僅拆交接書指定的五份 spec：原路徑保留為入口，新增同名資料夾內八份主題子檔。全部原標題仍在入口；搬出內文的標題以連結轉介，既有入站錨點可繼續使用。各子檔第一行回連入口；原文、SPEC-GAP 與編號條目逐字保留，只調整五處相對連結。

親讀 AGENTS.md、common.md、STRUCTURE.md、common/user.md、tidy/README.md、tidy/gotchas.md、common/data-files.md；未派子代理。

固定四條驗收結果：

1. 通過：`wc -c` 五個入口與八個新子檔各 ≤ 6144；入口亦全部 ≤ 5120。入口依交接書順序為 3930、4725、3228、3632、4648 bytes；新子檔依下列導航順序為 3726、1357、4204、3062、2412、2799、2597、4031 bytes。單檔最大 4725 bytes。
2. 未通過：`bash wf/tools/wf-lint.sh --strict .` 結束碼 1，結果為 `TOTAL broken=0 residue=0 oversize=0 biglist=1 querycmd=0 local=0`。唯一 finding 為範圍外既存 CLAIMS.md 大清單，詳見「沒做到或證據不足的」。
3. 通過：`python3 wf/tools/check_anchors.py` 結束碼 0、無輸出，壞錨點 0。
4. 通過：37 個原章節（含五份前言）逐段比對，原文空行區塊共 100 → 100；每段正規化相對連結的絕對目的地後逐字一致。新增的轉介、導航及子檔主題標題不算原文區塊。每檔「原段落標題 → 新位置」完整對照表附於 [paragraph-map.json](paragraph-map.json)（37 列，含各章前後區塊數）。

| 原檔 | 原文區塊（前 → 後） |
|---|---|
| `time-and-tick.md` | 21 → 21 |
| `data-model-faction-rnd.md` | 20 → 20 |
| `architecture-ops.md` | 22 → 22 |
| `mercenary-contracts.md` | 20 → 20 |
| `data-model-mech.md` | 17 → 17 |

## 產出

原五檔為入口；新增子檔：

- [每日結算與航行](../../../../planning/specs/ops/time-and-tick/daily-sequence.md)
- [長程時鐘與時間政策](../../../../planning/specs/ops/time-and-tick/long-term-policy.md)
- [機型、機型池與內容佈局](../../../../planning/specs/ops/data-model-faction-rnd/models-and-markets.md)
- [狀態、事件與重播存檔](../../../../planning/specs/ops/architecture-ops/state-and-replay.md)
- [headless 測試策略](../../../../planning/specs/ops/architecture-ops/headless-testing.md)
- [合編與勢力補給](../../../../planning/specs/ops/mercenary-contracts/allies-and-supply.md)
- [結算、背叛與作戰情境](../../../../planning/specs/ops/mercenary-contracts/settlement-and-scenarios.md)
- [資源池、部件與機甲實例](../../../../planning/specs/core/data-model-mech/equipment-and-state.md)

附件 [paragraph-map.json](paragraph-map.json) 依 wf-table/1，以 tabledb 讀寫。沒有整檔搬移，無 moves.tsv；既有 time-and-tick/calendar.md 未改。`fix_moved_links.py` 先 dry-run 再 apply，僅在 /tmp 隔離鏡像重算子檔連結，再寫回指定子檔，未全庫批次改寫。鏡像使用相同舊目錄的合成來源路徑，僅供相對路徑重算，不是實際搬檔記錄。

新增子檔、附件與 REPORT 合計低於 0.2 MB；只處理五個指定來源。未刪檔、未 commit、未 push，未碰 content 或其他現役線。

## 沒做到或證據不足的

驗收完嘗試依 tidy 工作流明確列路徑 `git add`，環境回 `fatal: Unable to create .../.git/index.lock: Read-only file system`（xargs 結束碼 123）。本線產物已寫入工作樹，但未完成 stage；依 common.md 的工具／環境錯誤規則，記錄後停止，不重試、不升權。領導需在可寫 git index 的環境暫存本線五個入口、八個子檔及兩份報告產物。

固定第 2 條未達全零。開始前全庫 lint 已有 `oversize=1 biglist=1`：ROSTER.md 8301 bytes、CLAIMS.md 第 9–13 行 1795 bytes／5 列。末次檢查 ROSTER.md 超限已由其他線消除，本線未改它；尚存 `wf/workflows/dispatch/CLAIMS.md:9-13` 的 BIGLIST。該檔不在授權範圍，未越界修復。

完整檢查原始輸出保存在 `/tmp/cx-td2-split-c-baseline-lint.log`、`/tmp/cx-td2-split-c/final-lint.log`、`/tmp/cx-td2-split-c/anchors.log`；拆前快照及逐章配置在同一 /tmp 工作區。固定四條中三條通過，不能宣告整體驗收通過。

## 需要決定的事

本線無內容決策待定。請領導在負責範圍處理既存 CLAIMS.md BIGLIST 後重跑固定第 2 條。

## 以後交接書該點名的工具

既有點名足夠；若要求超過 1 KB 的完整對照表附件，補點名 tabledb 即可。

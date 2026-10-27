# 任務：核對第3輪六個成稿的配裝與怪獸結構差異

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/common/user.md`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/content/README.md`、batch.md、mechs.md、bio-monsters.md、world-pillars適用子檔、`/mnt/c/code/mine/mecha-srpg/content/lore/style.md`；用主樹最新版。簡查線不擴研究，已讀過規矩不重讀。

## 背景與唯一目標

terra對已審計畫的機甲3、怪獸3成稿做有限近似查重，證據來自全文、實際配裝與能力骨架，不只比名或引用ID不同。

## 範圍

只寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-dedup.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/dedup-r3-REPORT.md`。讀 `.git/wf-worktrees/wn-r3-mechs-1027`、`wn-r3-monsters-1027` 的本批新JSON與主樹全庫（含未提交wl-*、r2 wn-*）。先查已齊類別；另一類齊後補完，不能用final代替等待。
不做：內容修改、其他計畫／review、manifest、index、src/schema/spec、任何其他未列檔。件數 gate：6概念及其18個配套檔；容量 gate：報告資料合計1MB，超出回報。

## 必用工具

| 工具 | 用途 |
|---|---|
| `wf/tools/tabledb.py` | 定向讀plan、review、結構指紋，寫wf-table/1 |
| `git diff --check` | 自己報告空白檢查 |

## 資源與禁區

唯讀調查線，只寫指定新資料與REPORT。子代理上限0，原生工具回傳。禁止網路、安裝、GUI、npm、test/typecheck/build/sim/probe/MCP、commit/push、刪檔、設定或掛載修改，不跑node、不改別人staged。

## 工作

1. 機甲比較同級、bodyplan、定位、defaultLoadout所授武器/系統能力及固有能力；怪獸比較family、bodyplan、能力組合、AI可用意圖和capture配套。不同ID或少量數值差不能當實質差異，全庫含wl-*。
2. 每列親讀新概念所有配套及最近既有全文，再給nearestExisting具體ID／檔、similarity、substantiveDifference、decision accept/reject/needs-lead、reason、fullTextRead來源/hash。至少一個最接近候選正文完整讀；structural簽章去掉機體自己id/name/敘事，勿用包含自己ID的投影宣稱無重複。新稿彼此也比較。
3. 協助核配套引用、legal slots/types/sizes與core/座艙/pools相容；對真機制矛盾保留證據交領導。REPORT有限3條，不追加研究或驗證。近似而非重複仍說清定位取捨，不為湊數寬放。

## 交付

`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/round3-dedup.json`、`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-next-1027/dedup-r3-REPORT.md`。報告含已讀、產出、未驗整合平衡及疑慮，不稱完整accepted。

## 驗收（固定3條）

1. 表6概念列、機甲與怪獸各3，配套18檔可定位；每列有最近既有具體ID／檔、全文閱讀證據。
2. 逐列按真實配裝／能力／骨架判斷，有實質差異或reject理由，含wl-*和新稿互比，不只比名或自己ID。
3. REPORT存在並記有限審查範圍與未驗事項；git diff --check自己文件0，不跑node或額外測試。

## 完成／阻塞回報

原生回傳DONE/BLOCKED與REPORT。缺另一類時可先完成已有類別並回報等待；不要重新研究已核同一來源。真正重複立即給領導證據，由創作者換概念，不刪舊內容。

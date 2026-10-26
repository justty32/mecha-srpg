# 任務：把 STATE.md 改寫成現況一屏，並同步 next-tidy 與 SESSION-LOG

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/common.md`（共通規則，必讀），再讀 `wf/workflows/tidy/README.md`、`wf/workflows/dispatch/handoffs/README.md`、`STATE.md`、`next-tidy.md`、`codex-handover.md`、`engine-backlog.md`、`done/README.md`（2026-10-25、2026-10-26 列）、`wf/WAIT_USER.md`、`wf/SESSION-LOG.md`、`wf/workflows/dispatch/CLAIMS.md`。

## 範圍（排除法寫死）

件數 gate：只改下列 3 檔；容量 gate：三檔合計不超過 14 KB。

1. `wf/workflows/dispatch/handoffs/STATE.md` 改寫：標題改「2026-10-26 段落」；段落固定為「現況一屏」（遊戲／測試數字／網頁／MCP／主要指令／團隊——沿用舊文，只更新變了的；測試數字用領導給的：`npm test` 與其他數字照 `ROOT/wf/workflows/dispatch/handoffs/lead-tidy2/baseline.md`）、「現役」（看 CLAIMS 現役表＋SESSION-LOG：lead-engine-next、lead-bigfill、lead-tidy2）、「本段落（2026-10-26）做了什麼」（把 done/README 的 2026-10-26 各列濃縮成 ≤ 12 行，每行一線或一組線、一句結論＋連 REPORT；填充七線可合成一行）、「新 session 的第一步」（保留仍有效的步驟，刪掉已完成的長串說明，指向 engine-backlog、codex-handover、fill-rulings、WAIT_USER）。目標 ≤ 5 KB。原文刪掉的事實必須在 done/README 或其他現役文件找得到；找不到的保留。
2. `wf/workflows/dispatch/handoffs/next-tidy.md` 改寫：標題改「2026-10-26 lead-tidy2 做完一輪」；「已完成」段**換成本輪**（領導給的清單在 `ROOT/wf/workflows/dispatch/handoffs/lead-tidy2/done-this-round.md`），上一輪（2026-10-24）的已完成段壓成一行指向 done/README 的 lead-tidy 列；「殘留」段沿用仍未解的條目，加上 done-this-round.md 末尾的新殘留。≤ 5 KB。
3. `wf/SESSION-LOG.md`：刪掉第二條 `[dispatch] 2026-10-26 晚：填充七線…` 那行（所列線都已收線）與其下「2026-10-25 段落已收尾…」那行；lead-engine-next、lead-tidy2、lead-bigfill（若有）的行保留不動。≤ 4 KB。

不做：其他任何檔；不改 done/README；不判定任何事項的狀態（只搬運已有記錄）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `bash wf/tools/wf-lint.sh --strict .` | 改完驗 0 違規 |
| `python3 wf/tools/check_anchors.py` | 驗錨點 |

## 資源與禁區

**可寫程式碼線**：只寫「範圍」列的 3 檔。共通禁區見 common.md。

## 交付

REPORT 寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tidy2/state/REPORT.md`（附：從 STATE 刪掉的每條事實 → 現在在哪個檔可查）。

## 驗收（固定 4 條）

1. `wc -c` STATE.md ≤ 5120、next-tidy.md ≤ 5120、SESSION-LOG.md ≤ 4096。
2. `grep -c '^- \[' wf/SESSION-LOG.md` 等於現役行數（2 或 3）。
3. `bash wf/tools/wf-lint.sh --strict .` → `TOTAL broken=0 residue=0 oversize=0 biglist=0 querycmd=0 local=0`。
4. `python3 wf/tools/check_anchors.py` → 0。

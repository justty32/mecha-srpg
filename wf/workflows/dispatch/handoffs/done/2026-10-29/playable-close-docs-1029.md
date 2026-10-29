# 任務：整理最終遊玩整合報告

先讀：AGENTS.md（雜活），另讀wf/workflows/common/data-files.md；只做報告，不跑測試。

## 背景與唯一目標
隊長收斂完整驗證與提交，協助把已知證據寫成正確精簡REPORT，不推論未跑結果。

## 範圍
- 只做：唯讀本輪各子線REPORT與formal-summary.json、formal校準/保留/混合JSONL（以腳本只取摘要，不整份灌context）、/tmp/playable-*.log或tap摘要；只寫wf/workflows/dispatch/handoffs/lead-playable-1029/REPORT.md、本線REPORT。
- 不做：產品檔、code-map、狀態、git提交、實測、改他線報告。
- 件數 gate：寫超過2檔先報；容量 gate：產物超過100 KB先報。

## 必用工具
| 工具 | 用途 |
|---|---|
| `rg` | 只取驗證摘要 |
| `python3 wf/tools/tabledb.py` | 若讀wf清單按列 |

## 資源與禁區
**可寫程式碼線**：只寫兩份報告，這是雜活文件線不改程式。子代理上限0。不跑任何測試/探針，不開GUI，不碰鍵鼠螢幕，不commit/push、不刪檔、不安裝下載、不動三原review log。隊長唯一full suite將跑，勿啟其他重負載。

## 工作
1. 主REPORT四段做了什麼／產出／沒做到或證據不足／需要決定，含新幾何/傷勢/定向/有限盾招架/多部位/拾取/常規混合，明示不是完整DF模擬。舊+15/曝光HP候選不採為最終。
2. formal25/25：20校準6–18中位10p90=15，5保留8/12/8/8/11，原default4v4敵原4dead/UnitDied且0退棄，25全玩家勝不等於均勢。混合3場9/6/9敵勝正常退卻，不宣稱20全殲／均勢。營運標準e2e2/2完整14.3秒，較51.3改善。各綠測試只按實際log，不加總重複案充總數。
3. 最終full suite/新e2e/commit/push/服務網址尚待隊長，清楚留『待隊長填實數』，不要假稱完成。legacy兩外部壞連結唯讀基準與Chromium1248缺失（實際e2e沿1243）需據本輪結果區分。報告正文<8KB不貼整套log。完成即報，不等隊長測試。

## 交付
主REPORT直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playable-1029/REPORT.md`；本線REPORT寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/playable-close-docs-1029/REPORT.md`，均繁中，末尾以後工具。

## 驗收（固定2條）
1. 主REPORT四段正確反映已知證據，未跑的明示待填，<8KB。
2. 只改兩報告、不啟測試，回報可供隊長補最終數據。

## 失敗怎麼處置
證據不足直說，不推測或補數字；原生工具終局回報。

## 完成證據（2026-10-29）

1. 主REPORT四段正確反映已知證據，未跑的明示待填，<8KB。 → [本線REPORT](playable-close-docs-1029/REPORT.md)、[整合驗證](lead-playable-1029/verification.json)。
2. 只改兩報告、不啟測試，回報可供隊長補最終數據。 → [本線REPORT](playable-close-docs-1029/REPORT.md)、[整合驗證](lead-playable-1029/verification.json)。

源碼及驗證提交 `a3407d9711f991472cac6a9dc03dacd2e827edf2` 已push並核對origin/main。原生agent已FINAL_ANSWER，無外部inbox終局檔；本線服務／runner已停止。
